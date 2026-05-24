from __future__ import annotations

from fastapi import APIRouter, Query

from backend.models.schemas import ElevationData
from backend.services.elevation_service import fetch_elevation

router = APIRouter(prefix="/elevation", tags=["elevation"])


@router.get("", response_model=ElevationData)
async def get_elevation(lat: float = Query(..., ge=-90, le=90), lng: float = Query(..., ge=-180, le=180)) -> ElevationData:
    return await fetch_elevation(lat, lng)
