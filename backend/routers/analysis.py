from __future__ import annotations

from fastapi import APIRouter

from backend.models.schemas import AnalysisRequest, AnalysisResult
from backend.routers.environment import get_environment
from backend.services.ai_service import analyze_with_claude

router = APIRouter(prefix="/analyze", tags=["analysis"])


@router.post("", response_model=AnalysisResult)
async def analyze_patch(request: AnalysisRequest) -> AnalysisResult:
    environment = await get_environment(request.lat, request.lng)
    return await analyze_with_claude(environment)
