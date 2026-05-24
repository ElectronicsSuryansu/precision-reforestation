export const DEFAULT_LOCATION = {
  lat: 27.7172,
  lng: 85.324,
};

export const NEPAL_BOUNDS = [
  [26.347, 80.058],
  [30.447, 88.201],
];

const LOCATION_KEY = "ecorestoration:last-location";
const ANALYSIS_KEY = "ecorestoration:last-analysis";

function hasWindow() {
  return typeof window !== "undefined";
}

export function getStoredLocation() {
  if (!hasWindow()) {
    return DEFAULT_LOCATION;
  }

  try {
    const raw = window.localStorage.getItem(LOCATION_KEY);
    if (!raw) {
      return DEFAULT_LOCATION;
    }
    const parsed = JSON.parse(raw);
    if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
      return parsed;
    }
  } catch {
    // fall back to the default location
  }

  return DEFAULT_LOCATION;
}

export function saveStoredLocation(location) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
}

export function getStoredAnalysis() {
  if (!hasWindow()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ANALYSIS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredAnalysis(analysis) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(ANALYSIS_KEY, JSON.stringify(analysis));
}
