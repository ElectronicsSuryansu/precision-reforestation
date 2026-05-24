import { useEffect, useState } from "react";
import PageShell from "../components/PageShell.jsx";
import { analyzePatch } from "../services/api.js";
import { getStoredLocation } from "../services/location.js";

export default function Carbon() {
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
          setError(requestError?.response?.data?.detail || requestError.message || "Unable to fetch carbon estimate.");
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

  const carbonPotential = analysis?.carbon_potential ?? 0;
  const organicMatter = analysis?.environment?.soil?.organic_matter ?? 0;

  return (
    <PageShell
      title="Carbon"
      subtitle="Estimate restoration-linked carbon potential from terrain, soil, and vegetation signals."
      loading={loading}
      error={error}
      action={<div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">CO2e {carbonPotential.toFixed(2)} t/yr</div>}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Carbon Potential</div>
          <div className="mt-3 font-display text-6xl font-bold text-white">{carbonPotential.toFixed(2)}</div>
          <div className="mt-2 text-sm text-slate-400">tons of CO2e per year</div>
          <div className="mt-4 text-sm leading-6 text-slate-300">
            Organic matter and canopy recovery increase the site’s sequestration capacity.
          </div>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/5 p-5">
          <div className="font-semibold text-white">Drivers</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-black/20 p-4">
              <div className="text-xs text-slate-400">Organic Matter</div>
              <div className="mt-1 text-2xl font-semibold text-white">{organicMatter.toFixed(2)}%</div>
            </div>
            <div className="rounded-2xl bg-black/20 p-4">
              <div className="text-xs text-slate-400">NDVI</div>
              <div className="mt-1 text-2xl font-semibold text-white">{analysis?.environment?.ndvi?.toFixed(3) ?? "—"}</div>
            </div>
          </div>
          <div className="mt-4 text-sm leading-6 text-slate-300">
            Higher organic matter usually signals stronger biomass accumulation and better long-term storage potential.
          </div>
        </div>
      </div>
    </PageShell>
  );
}
