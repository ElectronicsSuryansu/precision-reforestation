from __future__ import annotations

import asyncio
import logging
import re
from typing import Any, Dict, List, Optional

import httpx
from fastapi import HTTPException

from backend.config.settings import get_settings
from backend.models.schemas import ElevationData, SoilData

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _parse_numeric(raw: Any) -> Optional[float]:
    """Extract the first number from a value that may be a float, int, or
    string like '6.58 ' or '19.28 %'."""
    if isinstance(raw, (int, float)):
        return float(raw)
    if isinstance(raw, str):
        match = re.search(r"-?\d+(?:\.\d+)?", raw.replace(",", ""))
        return float(match.group(0)) if match else None
    return None


# ---------------------------------------------------------------------------
# Raw API fetch
# ---------------------------------------------------------------------------

async def _fetch_raw(lat: float, lng: float) -> Dict[str, Any]:
    """Hit the NARC soil API and return the parsed JSON dict.

    Raises HTTPException on any network / HTTP error so callers do not need
    to handle httpx exceptions themselves.
    """
    settings = get_settings()
    params = {"lat": lat, "lon": lng}

    logger.debug("NARC request: %s params=%s", settings.narc_soil_api_url, params)

    try:
        async with httpx.AsyncClient(timeout=settings.api_timeout_seconds) as client:
            response = await client.get(settings.narc_soil_api_url, params=params)
            response.raise_for_status()
            payload = response.json()

    except asyncio.CancelledError as exc:
        raise HTTPException(status_code=504, detail="NARC request timed out") from exc

    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=504,
            detail=f"NARC API timed out after {settings.api_timeout_seconds}s",
        ) from exc

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"NARC API returned HTTP {exc.response.status_code}",
        ) from exc

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not reach NARC API: {exc}",
        ) from exc

    # Unwrap list wrapper if the API ever returns [{...}] instead of {...}
    if isinstance(payload, list):
        payload = next((item for item in payload if isinstance(item, dict)), None)

    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=502,
            detail="NARC API returned an unexpected response shape",
        )

    logger.debug("NARC response keys: %s", list(payload.keys()))
    return payload


# ---------------------------------------------------------------------------
# Domain parsers
# ---------------------------------------------------------------------------

def _parse_soil(payload: Dict[str, Any], lat: float, lng: float) -> SoilData:
    """Build a SoilData from a raw NARC payload dict."""
    ph             = _parse_numeric(payload.get("ph"))
    organic_matter = _parse_numeric(payload.get("organic_matter"))
    nitrogen       = _parse_numeric(payload.get("total_nitrogen"))
    clay           = _parse_numeric(payload.get("clay"))

    missing = [
        name for name, val in {
            "ph": ph,
            "organic_matter": organic_matter,
            "total_nitrogen": nitrogen,
            "clay": clay,
        }.items()
        if val is None
    ]
    if missing:
        raise HTTPException(
            status_code=502,
            detail=f"NARC payload missing required soil fields: {missing}",
        )

    return SoilData(
        ph=round(ph, 2),
        nitrogen=round(nitrogen, 3),
        clay=round(clay, 2),
        organic_matter=round(organic_matter, 2),
        source="narc",
    )


def _parse_elevation(payload: Dict[str, Any], lat: float, lng: float) -> ElevationData:
    """Build an ElevationData from a raw NARC payload dict."""
    coord = payload.get("coord")
    if not isinstance(coord, dict):
        raise HTTPException(
            status_code=502,
            detail="NARC payload missing 'coord' block for elevation",
        )

    elevation = _parse_numeric(coord.get("elevation"))
    if elevation is None:
        raise HTTPException(
            status_code=502,
            detail="NARC payload missing elevation value inside 'coord'",
        )

    return ElevationData(elevation=round(elevation, 2), source="narc")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def fetch_narc_soil(lat: float, lng: float) -> SoilData:
    payload = await _fetch_raw(lat, lng)
    return _parse_soil(payload, lat, lng)


async def fetch_narc_elevation(lat: float, lng: float) -> ElevationData:
    payload = await _fetch_raw(lat, lng)
    return _parse_elevation(payload, lat, lng)


async def fetch_narc_profile(lat: float, lng: float) -> Dict[str, Any]:
    """Return the full raw NARC payload (used by routers that need both
    soil and elevation in one call)."""
    return await _fetch_raw(lat, lng)


async def fetch_narc_neighbor_elevations(
    lat: float,
    lng: float,
    step_degrees: float = 0.01,
) -> List[Optional[float]]:
    """Sample elevations at the four cardinal neighbours of (lat, lng).

    Falls back to progressively closer probe points if a neighbour fails,
    and returns None for that direction if all probes fail.
    """
    offsets = [
        (lat + step_degrees, lng),   # north
        (lat - step_degrees, lng),   # south
        (lat, lng + step_degrees),   # east
        (lat, lng - step_degrees),   # west
    ]
    probe_fractions = (1.0, 0.5, 0.25, 0.125)
    values: List[Optional[float]] = []

    for target_lat, target_lng in offsets:
        sample: Optional[float] = None
        dlat = target_lat - lat
        dlng = target_lng - lng

        for fraction in probe_fractions:
            probe_lat = lat + dlat * fraction
            probe_lng = lng + dlng * fraction
            try:
                elev = await fetch_narc_elevation(probe_lat, probe_lng)
                sample = elev.elevation
                break
            except HTTPException:
                continue
            except Exception as exc:
                logger.warning(
                    "Unexpected error probing elevation at (%.6f, %.6f): %s",
                    probe_lat, probe_lng, exc,
                )
                continue

        values.append(sample)

    return values