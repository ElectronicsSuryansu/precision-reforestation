function normalizeLocation(location) {
  const latitude = location?.latitude ?? location?.lat ?? null;
  const longitude = location?.longitude ?? location?.lng ?? null;

  return {
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
  };
}

export default function EnvironmentalSummary({ summary, location, updatedAt, loading, error }) {
  const resolvedLocation = normalizeLocation(location);

  return (
    <div className="rounded-[20px] border border-white/10 bg-[var(--page-surface)] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.24)]" style={{ borderColor: "var(--page-border)" }}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Environment Summary</div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            {loading ? "Fetching Open-Meteo forecast for the selected coordinates..." : error ? error : summary}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            {resolvedLocation.latitude !== null && resolvedLocation.longitude !== null
              ? `${resolvedLocation.latitude.toFixed(3)}, ${resolvedLocation.longitude.toFixed(3)}`
              : "No coordinates"}
          </span>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            {updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Live forecast"}
          </span>
        </div>
      </div>
    </div>
  );
}