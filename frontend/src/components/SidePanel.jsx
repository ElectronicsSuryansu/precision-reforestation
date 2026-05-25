import Loading from "./Loading.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function Metric({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[var(--panel-surface)] p-4">
      <div className="text-[11px] uppercase tracking-[0.25em] text-slate-400">{label}</div>
      <div className="mt-2 font-display text-2xl font-bold text-[var(--app-fg)]">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-400">{hint}</div> : null}
    </div>
  );
}

export default function SidePanel({
  location,
  environment,
  analysis,
  loading,
  stage,
  error,
  onAnalyze,
  onExport,
}) {
  const { theme } = useTheme();

  return (
    <aside className="glass-panel flex h-full flex-col gap-5 rounded-[28px] border border-white/10 p-5 lg:sticky lg:top-[108px]">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className={theme === "dark" ? "font-display text-2xl font-bold text-white" : "font-display text-2xl font-bold text-slate-900"}>Restoration Intelligence</div>
            <p className={theme === "dark" ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-600"}>
              AI-assisted site screening for Nepal mountain restoration
            </p>
          </div>
          <span className={theme === "dark" ? "rounded-full border border-forest-400/20 bg-forest-400/10 px-3 py-1 text-xs text-forest-200" : "rounded-full border border-forest-400/20 bg-forest-50 px-3 py-1 text-xs text-forest-800"}>
            {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
          </span>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onAnalyze}
            className="rounded-2xl bg-forest-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-forest-400"
          >
            Analyze Zone
          </button>
          <button
            type="button"
            onClick={onExport}
            className={theme === "dark" ? "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10" : "rounded-2xl border border-forest-400/20 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-forest-50"}
          >
            Export JSON Report
          </button>
        </div>
      </div>

      {loading ? <Loading message={stage} subtext="Retrieving live environmental signals" /> : null}

      {error ? (
        <div className={theme === "dark" ? "rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100" : "rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700"}>
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <Metric label="Biodiversity" value={analysis ? `${analysis.biodiversity_score.toFixed(1)}` : "—"} hint="0 to 100 score" />
        <Metric label="Erosion Risk" value={analysis ? analysis.erosion_risk : "—"} hint={environment ? `${environment.slope.toFixed(1)}° slope` : "Waiting for terrain data"} />
        <Metric label="Carbon Potential" value={analysis ? `${analysis.carbon_potential.toFixed(2)}` : "—"} hint="tons of CO2e/year" />
        <Metric label="Terrain Class" value={environment ? environment.terrain_class : "—"} hint={environment ? `NDVI ${environment.ndvi.toFixed(3)}` : "Analyzing vegetation"} />
      </div>

      <div className="rounded-[24px] border border-white/8 bg-[var(--panel-surface)] p-4">
        <div className="flex items-center justify-between">
          <div className={theme === "dark" ? "font-semibold text-white" : "font-semibold text-slate-900"}>Environment Snapshot</div>
          <div className={theme === "dark" ? "text-xs text-slate-400" : "text-xs text-slate-600"}>Real data + generated signal</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-[var(--panel-surface-strong)] p-3">
            <div className="text-xs text-slate-400">Soil pH</div>
            <div className="mt-1 text-lg font-semibold text-[var(--app-fg)]">{environment ? environment.soil.ph.toFixed(2) : "—"}</div>
          </div>
          <div className="rounded-2xl bg-[var(--panel-surface-strong)] p-3">
            <div className="text-xs text-slate-400">Elevation</div>
            <div className="mt-1 text-lg font-semibold text-[var(--app-fg)]">{environment ? `${environment.elevation.elevation.toFixed(0)} m` : "—"}</div>
          </div>
          <div className="rounded-2xl bg-[var(--panel-surface-strong)] p-3">
            <div className="text-xs text-slate-400">Nitrogen</div>
            <div className="mt-1 text-lg font-semibold text-[var(--app-fg)]">{environment ? environment.soil.nitrogen.toFixed(3) : "—"}</div>
          </div>
          <div className="rounded-2xl bg-[var(--panel-surface-strong)] p-3">
            <div className="text-xs text-slate-400">Organic Matter</div>
            <div className="mt-1 text-lg font-semibold text-[var(--app-fg)]">{environment ? `${environment.soil.organic_matter.toFixed(2)}%` : "—"}</div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/8 bg-[var(--panel-surface)] p-4">
        <div className={theme === "dark" ? "font-semibold text-white" : "font-semibold text-slate-900"}>Species Preview</div>
        <div className="mt-3 space-y-3">
          {analysis?.species?.length ? (
            analysis.species.map((item) => (
              <div key={item.name} className="rounded-2xl border border-white/6 bg-[var(--panel-surface-strong)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className={theme === "dark" ? "font-medium text-white" : "font-medium text-slate-900"}>{item.name}</div>
                  <div className="text-xs text-forest-300">{item.confidence.toFixed(0)}%</div>
                </div>
                <div className="mt-2 text-xs leading-5 text-slate-400">{item.reason}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-400">Run an analysis to surface restoration species.</div>
          )}
        </div>
      </div>
    </aside>
  );
}
