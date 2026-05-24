import { useEffect, useState } from "react";
import PageShell from "../components/PageShell.jsx";
import ConfidenceBar from "../components/ConfidenceBar.jsx";
import { analyzePatch } from "../services/api.js";
import { getStoredLocation } from "../services/location.js";

export default function Species() {
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
          setError(requestError?.response?.data?.detail || requestError.message || "Unable to fetch species recommendations.");
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
      title="Species"
      subtitle="Native and climate-fit species recommendations from the AI layer."
      loading={loading}
      error={error}
      action={<div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">{analysis?.species?.length ?? 0} suggestions</div>}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        {analysis?.species?.length ? (
          analysis.species.map((species) => (
            <div key={species.name} className="rounded-[24px] border border-white/8 bg-black/20 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-2xl font-bold text-white">{species.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">Restoration candidate</div>
                </div>
              </div>
              <div className="mt-4 text-sm leading-6 text-slate-300">{species.reason}</div>
              <div className="mt-5">
                <ConfidenceBar value={species.confidence} />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-white/8 bg-white/5 p-5 text-sm text-slate-300">No species suggestions available yet.</div>
        )}
      </div>
    </PageShell>
  );
}
