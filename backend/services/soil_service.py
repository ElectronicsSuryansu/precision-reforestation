from __future__ import annotations

from hashlib import sha256
from typing import Any, Dict, Optional

import httpx

from backend.config.settings import get_settings
from backend.models.schemas import SoilData


def _noise(lat: float, lng: float, salt: str) -> float:
    digest = sha256(f"{lat:.6f}:{lng:.6f}:{salt}".encode("utf-8")).hexdigest()
    return int(digest[:10], 16) / float(0xFFFFFFFFFF)


def _fallback_soil(lat: float, lng: float) -> SoilData:
    basin = 1.0 - abs(lat - 27.8) / 2.5
    moisture = max(0.1, min(1.0, 0.55 + basin * 0.18 + _noise(lat, lng, "moisture") * 0.12))
    ph = round(max(4.8, min(7.8, 5.2 + moisture * 1.9 + (_noise(lat, lng, "ph") - 0.5) * 0.7)), 2)
    nitrogen = round(max(0.03, min(0.24, 0.06 + moisture * 0.13 + (_noise(lat, lng, "nitrogen") - 0.5) * 0.03)), 3)
    clay = round(max(9.0, min(58.0, 21.0 + moisture * 18.0 + (_noise(lat, lng, "clay") - 0.5) * 12.0)), 2)
    organic_matter = round(max(1.1, min(12.0, 2.8 + moisture * 4.4 + (_noise(lat, lng, "om") - 0.5) * 1.4)), 2)
    return SoilData(ph=ph, nitrogen=nitrogen, clay=clay, organic_matter=organic_matter, source="deterministic-fallback")


def _extract_numeric(value: Any) -> Optional[float]:
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, dict):
        for key in ("mean", "value", "val", "median", "Q0.5"):
            candidate = value.get(key)
            if isinstance(candidate, (int, float)):
                return float(candidate)
        for nested in value.values():
            extracted = _extract_numeric(nested)
            if extracted is not None:
                return extracted
    if isinstance(value, list):
        for item in value:
            extracted = _extract_numeric(item)
            if extracted is not None:
                return extracted
    return None


def _find_feature_value(payload: Dict[str, Any], property_name: str) -> Optional[float]:
    features = payload.get("features") or []
    for feature in features:
        props = feature.get("properties") or {}
        text_blob = " ".join(str(props.get(key, "")) for key in ("layer", "name", "property", "depth", "unit")).lower()
        if property_name.lower() in text_blob:
            extracted = _extract_numeric(props)
            if extracted is not None:
                return extracted
    return _extract_numeric(payload)


async def fetch_soil(lat: float, lng: float) -> SoilData:
    settings = get_settings()
    query_url = f"{settings.soilgrids_base_url}/properties/query"
    timeout = httpx.Timeout(settings.api_timeout_seconds)
    params = {
        "lat": lat,
        "lon": lng,
        "property": ["phh2o", "nitrogen", "clay", "soc"],
        "depth": ["0-5cm"],
        "value": ["mean"],
    }
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(query_url, params=params)
            response.raise_for_status()
            payload = response.json()
            ph = _find_feature_value(payload, "phh2o")
            nitrogen = _find_feature_value(payload, "nitrogen")
            clay = _find_feature_value(payload, "clay")
            soc = _find_feature_value(payload, "soc")
            if None in (ph, nitrogen, clay, soc):
                raise ValueError("Incomplete soilgrids payload")
            organic_matter = float(soc) * 1.724
            return SoilData(
                ph=round(float(ph), 2),
                nitrogen=round(float(nitrogen), 3),
                clay=round(float(clay), 2),
                organic_matter=round(organic_matter, 2),
                source="soilgrids",
            )
    except Exception:
        return _fallback_soil(lat, lng)
