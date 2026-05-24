from __future__ import annotations

from hashlib import sha256
from math import exp


def _stable_noise(lat: float, lng: float) -> float:
    digest = sha256(f"{lat:.6f}:{lng:.6f}".encode("utf-8")).hexdigest()
    raw = int(digest[:8], 16) / 0xFFFFFFFF
    return raw * 2.0 - 1.0


def generate_ndvi(lat: float, lng: float, elevation: float, soil_ph: float, nitrogen: float, clay: float, organic_matter: float) -> float:
    altitude_peak = exp(-((elevation - 1800.0) / 1700.0) ** 2)
    fertility = (
        (soil_ph - 4.8) / 2.4
        + min(nitrogen / 0.18, 1.0)
        + min(organic_matter / 7.0, 1.0)
        - abs(clay - 28.0) / 60.0
    ) / 3.0
    climate_noise = _stable_noise(lat, lng) * 0.08
    score = 0.18 + altitude_peak * 0.42 + fertility * 0.24 + climate_noise
    return max(-0.15, min(0.88, round(score, 3)))
