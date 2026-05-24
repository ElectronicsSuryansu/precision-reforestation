from __future__ import annotations

from math import atan, degrees, cos, radians


def meters_per_degree_lat(lat: float) -> float:
    return 111132.92 - 559.82 * cos(2 * radians(lat)) + 1.175 * cos(4 * radians(lat))


def meters_per_degree_lng(lat: float) -> float:
    return 111412.84 * cos(radians(lat)) - 93.5 * cos(3 * radians(lat))


def estimate_slope(center_elevation: float, north: float, south: float, east: float, west: float, lat: float, step_degrees: float = 0.01) -> float:
    lat_distance = meters_per_degree_lat(lat) * step_degrees
    lng_distance = meters_per_degree_lng(lat) * step_degrees
    rise_drops = [
        abs(north - center_elevation) / lat_distance,
        abs(south - center_elevation) / lat_distance,
        abs(east - center_elevation) / lng_distance,
        abs(west - center_elevation) / lng_distance,
    ]
    steepest = max(rise_drops)
    return round(degrees(atan(steepest)), 2)


def terrain_class_from_slope(slope: float) -> str:
    if slope < 5:
        return "Flat"
    if slope < 15:
        return "Undulating"
    if slope < 30:
        return "Steep"
    return "Extremely Steep"
