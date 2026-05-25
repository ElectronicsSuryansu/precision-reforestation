import { useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell.jsx";
import EnvironmentalSummary from "../components/EnvironmentalSummary.jsx";
import WeatherMetrics from "../components/WeatherMetrics.jsx";
import { useOpenMeteo } from "../hooks/useOpenMeteo.js";
import { getStoredLocation, saveStoredLocation } from "../services/location.js";

export default function Climate() {
  const initialLocation = useMemo(() => getStoredLocation(), []);
  const [location, setLocation] = useState(initialLocation);
  const [latInput, setLatInput] = useState(String(initialLocation.lat));
  const [lngInput, setLngInput] = useState(String(initialLocation.lng));
  const [pendingLocation, setPendingLocation] = useState(initialLocation);
  const [syncTick, setSyncTick] = useState(0);

  const { data, loading, error, updatedAt, refetch } = useOpenMeteo(pendingLocation.lat, pendingLocation.lng);

  useEffect(() => {
    const handleStorage = () => {
      const stored = getStoredLocation();
      setLocation(stored);
      setLatInput(String(stored.lat));
      setLngInput(String(stored.lng));
      setPendingLocation(stored);
      setSyncTick((value) => value + 1);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const debounce = window.setTimeout(() => {
      const lat = Number.parseFloat(latInput);
      const lng = Number.parseFloat(lngInput);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return;
      }

      const nextLocation = { lat, lng };
      setLocation(nextLocation);
      setPendingLocation(nextLocation);
      saveStoredLocation(nextLocation);
    }, 550);

    return () => window.clearTimeout(debounce);
  }, [latInput, lngInput]);

  useEffect(() => {
    const stored = getStoredLocation();
    setLocation(stored);
    setLatInput(String(stored.lat));
    setLngInput(String(stored.lng));
    setPendingLocation(stored);
  }, [syncTick]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const lat = Number.parseFloat(latInput);
    const lng = Number.parseFloat(lngInput);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    const nextLocation = { lat, lng };
    setLocation(nextLocation);
    setPendingLocation(nextLocation);
    saveStoredLocation(nextLocation);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const action = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
        Open-Meteo live
      </span>
      <button
        type="button"
        onClick={handleRefresh}
        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:-translate-y-[1px] hover:bg-white/10"
      >
        Refresh
      </button>
    </div>
  );

  return (
    <PageShell
      title="Climate Analytics"
      subtitle="Live Open-Meteo forecast intelligence for rainfall, soil moisture, and average temperature at the selected coordinates."
      loading={false}
      error={""}
      action={action}
    >
      <div className="space-y-5">
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-[20px] border border-white/10 bg-[var(--page-surface)] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.24)] md:grid-cols-[1fr_1fr_auto]" style={{ borderColor: "var(--page-border)" }}>
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Latitude</span>
            <input
              type="number"
              step="any"
              value={latInput}
              onChange={(event) => setLatInput(event.target.value)}
              className="w-full rounded-[16px] border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
              placeholder="27.7172"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Longitude</span>
            <input
              type="number"
              step="any"
              value={lngInput}
              onChange={(event) => setLngInput(event.target.value)}
              className="w-full rounded-[16px] border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
              placeholder="85.3240"
            />
          </label>
          <button
            type="submit"
            className="self-end rounded-[16px] bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-[1px] hover:brightness-110"
          >
            Analyze
          </button>
        </form>

        <EnvironmentalSummary
          summary={data?.summary}
          location={data?.location ?? { latitude: pendingLocation.lat, longitude: pendingLocation.lng }}
          updatedAt={updatedAt}
          loading={loading}
          error={error}
        />

        <WeatherMetrics data={data} loading={loading} />

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[20px] border border-white/10 bg-[var(--page-surface)] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.24)]" style={{ borderColor: "var(--page-border)" }}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Data Processing</div>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
              <p>Average temperature = mean(hourly.temperature_2m)</p>
              <p>Average soil moisture = mean(hourly.soil_moisture_0_to_1cm) × 100</p>
              <p>Rainfall = sum(hourly.precipitation)</p>
            </div>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-[var(--page-surface)] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.24)]" style={{ borderColor: "var(--page-border)" }}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Live Status</div>
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              <div className="rounded-[16px] bg-white/5 p-3">Selected location: {pendingLocation.lat.toFixed(4)}, {pendingLocation.lng.toFixed(4)}</div>
              <div className="rounded-[16px] bg-white/5 p-3">Forecast window: 24-hour Open-Meteo hourly series</div>
              <div className="rounded-[16px] bg-white/5 p-3">Update mode: manual analyze + auto-refresh on coordinate changes</div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
