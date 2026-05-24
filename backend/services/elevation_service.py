from __future__ import annotations

import asyncio
from typing import List

import httpx

from backend.config.settings import get_settings
from backend.models.schemas import ElevationData


def _fallback_elevation(lat: float, lng: float) -> float:
    base = 1150 + (lat - 27.7) * 820 + (lng - 85.3) * 540
    terrain = ((lat * 17.3 + lng * 11.7) % 1) * 260
    return round(max(120.0, min(5200.0, base + terrain)), 2)


async def _lookup_once(client: httpx.AsyncClient, lat: float, lng: float) -> float:
    settings = get_settings()
    response = await client.get(
        settings.open_elevation_url,
        params={"locations": f"{lat},{lng}"},
    )
    response.raise_for_status()
    payload = response.json()
    results = payload.get("results") or []
    if not results:
        raise ValueError("No elevation results returned")
    elevation = results[0].get("elevation")
    if elevation is None:
        raise ValueError("Elevation value missing from response")
    return float(elevation)


async def fetch_elevation(lat: float, lng: float) -> ElevationData:
    timeout = httpx.Timeout(get_settings().api_timeout_seconds)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            elevation = await _lookup_once(client, lat, lng)
            return ElevationData(elevation=round(elevation, 2), source="open-elevation")
    except Exception:
        return ElevationData(elevation=_fallback_elevation(lat, lng), source="deterministic-fallback")


async def fetch_neighbor_elevations(lat: float, lng: float, step_degrees: float = 0.01) -> List[float]:
    offsets = {
        "north": (lat + step_degrees, lng),
        "south": (lat - step_degrees, lng),
        "east": (lat, lng + step_degrees),
        "west": (lat, lng - step_degrees),
    }
    timeout = httpx.Timeout(get_settings().api_timeout_seconds)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            values = await asyncio.gather(
                *[_lookup_once(client, sample_lat, sample_lng) for sample_lat, sample_lng in offsets.values()],
                return_exceptions=True,
            )
        resolved: List[float] = []
        for value, coords in zip(values, offsets.values()):
            if isinstance(value, Exception):
                resolved.append(_fallback_elevation(*coords))
            else:
                resolved.append(float(value))
        return resolved
    except Exception:
        return [_fallback_elevation(sample_lat, sample_lng) for sample_lat, sample_lng in offsets.values()]
