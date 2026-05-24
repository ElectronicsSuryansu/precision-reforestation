import { useEffect, useState } from "react";
import PageShell from "../components/PageShell.jsx";
import { analyzePatch } from "../services/api.js";
import { getStoredLocation } from "../services/location.js";

export default function Erosion() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = getStoredLocation();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const response = await analyzePatch(location.lat, location.lng);
        if (mounted) {
          setAnalysis(response.data);
        }
      } catch (requestError) {
        if (mounted) {
          setError(requestError?.response?.data?.detail || requestError.message || "Unable to fetch erosion analysis.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [location.lat, location.lng]);

  const slope = analysis?.environment?.slope ?? 0;
  const risk = analysis?.erosion_risk ?? "—";

  return (
    <PageShell
      title="Erosion"
      subtitle="Slope-driven erosion exposure for the selected Himalayan land patch."
      loading={loading}
      error={error}
      action={<div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">Slope {slope.toFixed(1)}°</div>}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-5 lg:col-span-1">
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Erosion Risk</div>
          <div className="mt-3 font-display text-5xl font-bold text-white">{risk}</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">Steeper terrain, lower vegetation cover, and fragile soils increase runoff and landslide likelihood.</p>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/5 p-5 lg:col-span-2">
          <div className="font-semibold text-white">Slope Interpretation</div>
          <div className="mt-3 text-sm leading-6 text-slate-300">
            The selected point is evaluated against neighboring elevation samples. Higher slope values demand deeper rooting species, contour barriers, and staged stabilization work.
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-black/20 p-4">
              <div className="text-xs text-slate-400">Slope</div>
              <div className="mt-1 text-2xl font-semibold text-white">{slope.toFixed(1)}°</div>
            </div>
            <div className="rounded-2xl bg-black/20 p-4">
              <div className="text-xs text-slate-400">Risk Class</div>
              <div className="mt-1 text-2xl font-semibold text-white">{risk}</div>
            </div>
            <div className="rounded-2xl bg-black/20 p-4">
              <div className="text-xs text-slate-400">Terrain</div>
              <div className="mt-1 text-2xl font-semibold text-white">{analysis?.environment?.terrain_class ?? "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
