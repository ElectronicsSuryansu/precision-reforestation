from __future__ import annotations

from fastapi import APIRouter, Query

from backend.models.schemas import EnvironmentData
from backend.services.elevation_service import fetch_elevation, fetch_neighbor_elevations
from backend.services.soil_service import fetch_soil
from backend.utils.ndvi import generate_ndvi
from backend.utils.slope import estimate_slope, terrain_class_from_slope

router = APIRouter(prefix="/environment", tags=["environment"])


@router.get("", response_model=EnvironmentData)
async def get_environment(lat: float = Query(..., ge=-90, le=90), lng: float = Query(..., ge=-180, le=180)) -> EnvironmentData:
    soil = await fetch_soil(lat, lng)
    elevation = await fetch_elevation(lat, lng)
    neighbors = await fetch_neighbor_elevations(lat, lng)
    slope = estimate_slope(
        center_elevation=elevation.elevation,
        north=neighbors[0],
        south=neighbors[1],
        east=neighbors[2],
        west=neighbors[3],
        lat=lat,
    )
    ndvi = generate_ndvi(lat, lng, elevation.elevation, soil.ph, soil.nitrogen, soil.clay, soil.organic_matter)
    return EnvironmentData(
        lat=lat,
        lng=lng,
        soil=soil,
        elevation=elevation,
        ndvi=ndvi,
        slope=slope,
        terrain_class=terrain_class_from_slope(slope),
    )
