import { useEffect, useState } from "react";
import PageShell from "../components/PageShell.jsx";
import { analyzePatch } from "../services/api.js";
import { getStoredLocation } from "../services/location.js";

export default function Insight() {
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
          setError(requestError?.response?.data?.detail || requestError.message || "Unable to fetch AI insight.");
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

  return (
    <PageShell
      title="Insight"
      subtitle="Claude-generated restoration summary for the selected land patch."
      loading={loading}
      error={error}
      action={<div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">AI narrative</div>}
    >
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">AI Insight</div>
          <p className="mt-4 text-lg leading-8 text-slate-100">
            {analysis?.insight ?? "No insight available yet."}
          </p>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/5 p-5">
          <div className="font-semibold text-white">Context</div>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <div className="rounded-2xl bg-black/20 p-4">
              <div className="text-xs text-slate-500">Elevation</div>
              <div className="mt-1 text-lg font-semibold text-white">{analysis?.environment?.elevation?.elevation?.toFixed(0) ?? "—"} m</div>
            </div>
            <div className="rounded-2xl bg-black/20 p-4">
              <div className="text-xs text-slate-500">Slope</div>
              <div className="mt-1 text-lg font-semibold text-white">{analysis?.environment?.slope?.toFixed(1) ?? "—"}°</div>
            </div>
            <div className="rounded-2xl bg-black/20 p-4">
              <div className="text-xs text-slate-500">NDVI</div>
              <div className="mt-1 text-lg font-semibold text-white">{analysis?.environment?.ndvi?.toFixed(3) ?? "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
