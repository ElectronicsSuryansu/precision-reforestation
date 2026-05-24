from __future__ import annotations

from functools import lru_cache
from typing import List
import os


class Settings:
    app_name: str = "AI-Powered Ecological Restoration Intelligence Platform"
    app_version: str = "1.0.0"
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    anthropic_model: str = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    api_timeout_seconds: float = float(os.getenv("API_TIMEOUT_SECONDS", "15"))
    cors_origins: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]
    soilgrids_base_url: str = os.getenv("SOILGRIDS_BASE_URL", "https://rest.isric.org/soilgrids/v2.0")
    open_elevation_url: str = os.getenv("OPEN_ELEVATION_URL", "https://api.open-elevation.com/api/v1/lookup")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
