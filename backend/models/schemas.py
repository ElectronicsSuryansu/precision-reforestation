from __future__ import annotations

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class SoilData(BaseModel):
    ph: float
    nitrogen: float
    clay: float
    organic_matter: float
    source: str = "soilgrids"


class ElevationData(BaseModel):
    elevation: float
    source: str = "open-elevation"


class EnvironmentData(BaseModel):
    lat: float
    lng: float
    soil: SoilData
    elevation: ElevationData
    ndvi: float
    slope: float
    terrain_class: str


class SpeciesSuggestion(BaseModel):
    name: str
    confidence: float = Field(..., ge=0, le=100)
    reason: str


class AnalysisResult(BaseModel):
    biodiversity_score: float = Field(..., ge=0, le=100)
    erosion_risk: Literal["Low", "Medium", "High"]
    carbon_potential: float
    species: List[SpeciesSuggestion]
    insight: str
    environment: EnvironmentData


class AnalysisRequest(Coordinates):
    pass


class ErrorResponse(BaseModel):
    detail: str
    context: Optional[dict] = None
