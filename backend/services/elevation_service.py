from __future__ import annotations

import asyncio
from typing import List

import httpx

from backend.models.schemas import ElevationData


def _fallback_elevation(lat: float, lng: float) -> float:
    base = 1150 + (lat - 27.7) * 820 + (lng - 85.3) * 540
    terrain = ((lat * 17.3 + lng * 11.7) % 1) * 260
    return round(max(120.0, min(5200.0, base + terrain)), 2)


async def _lookup_once(client: httpx.AsyncClient, lat: float, lng: float) -> float:
    response = await client.get(
        "https://api.open-meteo.com/v1/elevation",
        params={"latitude": lat, "longitude": lng},
    )
    response.raise_for_status()
    data = response.json()
    elevations = data.get("elevation", [])
    if not elevations:
        raise ValueError("No elevation returned")
    return float(elevations[0])


async def fetch_elevation(lat: float, lng: float) -> ElevationData:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            elevation = await _lookup_once(client, lat, lng)
            return ElevationData(elevation=round(elevation, 2), source="open-meteo-copernicus")
    except Exception:
        return ElevationData(elevation=_fallback_elevation(lat, lng), source="deterministic-fallback")


async def fetch_neighbor_elevations(lat: float, lng: float, step: float = 0.01) -> List[float]:
    offsets = [
        (lat + step, lng),  # north
        (lat - step, lng),  # south
        (lat, lng + step),  # east
        (lat, lng - step),  # west
    ]
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            results = await asyncio.gather(
                *[_lookup_once(client, la, ln) for la, ln in offsets],
                return_exceptions=True,
            )
        return [
            float(r) if not isinstance(r, Exception) else _fallback_elevation(la, ln)
            for r, (la, ln) in zip(results, offsets)
        ]
    except Exception:
        return [_fallback_elevation(la, ln) for la, ln in offsets]