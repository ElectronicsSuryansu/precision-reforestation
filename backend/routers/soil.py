from __future__ import annotations

from fastapi import APIRouter, Query

from backend.models.schemas import SoilData
from backend.services.soil_service import fetch_soil

router = APIRouter(prefix="/soil", tags=["soil"])


@router.get("", response_model=SoilData)
async def get_soil(lat: float = Query(..., ge=-90, le=90), lng: float = Query(..., ge=-180, le=180)) -> SoilData:
    return await fetch_soil(lat, lng)
