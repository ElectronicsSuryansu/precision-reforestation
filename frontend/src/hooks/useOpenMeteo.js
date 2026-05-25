import { useCallback, useEffect, useMemo, useState } from "react";

const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

function toNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mean(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) {
    return null;
  }
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function sum(values) {
  return values.filter((value) => Number.isFinite(value)).reduce((total, value) => total + value, 0);
}

function normalizeSeries(values) {
  return values.slice(-24).map((value) => (Number.isFinite(value) ? Number(value) : 0));
}

function buildSummary(rainfallMm, soilMoisturePct, avgTemperatureC) {
  if (![rainfallMm, soilMoisturePct, avgTemperatureC].every(Number.isFinite)) {
    return "Environmental intelligence will appear after the first successful forecast fetch.";
  }

  const rainState = rainfallMm >= 18 ? "healthy rainfall" : rainfallMm >= 6 ? "moderate rainfall" : "limited rainfall";
  const moistureState = soilMoisturePct >= 28 ? "healthy soil moisture" : soilMoisturePct >= 16 ? "moderate soil moisture" : "dry surface conditions";
  const temperatureState = avgTemperatureC >= 26 ? "warm conditions" : avgTemperatureC >= 16 ? "mild temperatures" : "cool conditions";

  if (rainfallMm >= 18 && soilMoisturePct >= 28 && avgTemperatureC >= 14 && avgTemperatureC <= 30) {
    return `Moderate-to-strong rainfall with ${moistureState} indicates favorable ecological restoration conditions.`;
  }

  return `${rainState} with ${moistureState} and ${temperatureState} suggests a mixed but actionable restoration window.`;
}

export function useOpenMeteo(latitude, longitude) {
  const normalizedLat = toNumber(latitude);
  const normalizedLng = toNumber(longitude);
  const coordinateKey = useMemo(() => `${normalizedLat ?? ""}:${normalizedLng ?? ""}`, [normalizedLat, normalizedLng]);

  const [state, setState] = useState({
    data: null,
    loading: false,
    error: "",
    updatedAt: null,
  });

  const fetchForecast = useCallback(async (lat, lng, signal) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error("Enter valid latitude and longitude values.");
    }

    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      hourly: "temperature_2m,soil_moisture_0_to_1cm,precipitation",
      timezone: "auto",
      forecast_days: "1",
    });

    const response = await fetch(`${OPEN_METEO_ENDPOINT}?${params.toString()}`, { signal });
    if (!response.ok) {
      throw new Error(`Open-Meteo request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const hourly = payload?.hourly ?? {};
    const temperatures = Array.isArray(hourly.temperature_2m) ? hourly.temperature_2m : [];
    const soilMoisture = Array.isArray(hourly.soil_moisture_0_to_1cm) ? hourly.soil_moisture_0_to_1cm : [];
    const precipitation = Array.isArray(hourly.precipitation) ? hourly.precipitation : [];

    const avgTemperature = mean(temperatures);
    const avgSoilMoisture = mean(soilMoisture);
    const rainfallMm = sum(precipitation);

    if (!Number.isFinite(avgTemperature) && !Number.isFinite(avgSoilMoisture) && !Number.isFinite(rainfallMm)) {
      throw new Error("Open-Meteo returned empty hourly climate data for this location.");
    }

    const labels = Array.isArray(hourly.time) ? hourly.time.slice(-24).map((time) => {
      const date = new Date(time);
      return Number.isNaN(date.getTime()) ? time : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }) : [];

    return {
      location: { latitude: lat, longitude: lng },
      rainfallMm: Number.isFinite(rainfallMm) ? Number(rainfallMm.toFixed(1)) : null,
      avgTemperatureC: Number.isFinite(avgTemperature) ? Number(avgTemperature.toFixed(1)) : null,
      avgSoilMoisturePct: Number.isFinite(avgSoilMoisture) ? Number((avgSoilMoisture * 100).toFixed(1)) : null,
      summary: buildSummary(rainfallMm, Number.isFinite(avgSoilMoisture) ? avgSoilMoisture * 100 : null, avgTemperature),
      series: {
        labels,
        temperature: normalizeSeries(temperatures),
        soilMoisture: normalizeSeries(soilMoisture).map((value) => value * 100),
        rainfall: normalizeSeries(precipitation),
      },
      raw: payload,
    };
  }, []);

  useEffect(() => {
    if (!Number.isFinite(normalizedLat) || !Number.isFinite(normalizedLng)) {
      setState((current) => ({
        ...current,
        error: "Enter valid latitude and longitude values.",
        loading: false,
      }));
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    setState((current) => ({ ...current, loading: true, error: "" }));

    fetchForecast(normalizedLat, normalizedLng, controller.signal)
      .then((data) => {
        if (!active) {
          return;
        }

        setState({
          data,
          loading: false,
          error: "",
          updatedAt: new Date().toISOString(),
        });
      })
      .catch((error) => {
        if (!active || error?.name === "AbortError") {
          return;
        }

        setState((current) => ({
          ...current,
          data: null,
          loading: false,
          error: error?.message || "Unable to load Open-Meteo forecast.",
          updatedAt: null,
        }));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [coordinateKey, fetchForecast, normalizedLat, normalizedLng]);

  const refetch = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    return fetchForecast(normalizedLat, normalizedLng, undefined)
      .then((data) => {
        setState({
          data,
          loading: false,
          error: "",
          updatedAt: new Date().toISOString(),
        });
        return data;
      })
      .catch((error) => {
        setState((current) => ({
          ...current,
          loading: false,
          error: error?.message || "Unable to load Open-Meteo forecast.",
          updatedAt: null,
        }));
        throw error;
      });
  }, [fetchForecast, normalizedLat, normalizedLng]);

  return {
    ...state,
    refetch,
  };
}