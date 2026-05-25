import { useEffect, useState } from "react";
import PageShell from "../components/PageShell.jsx";
import { getCropRecommendations } from "../services/api.js";
import { getStoredLocation } from "../services/location.js";

const SEASON_STYLES = {
  Kharif: { color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
  Rabi: { color: "#2563eb", bg: "#dbeafe", border: "#93c5fd" },
  "Year-round": { color: "#7c3aed", bg: "#ede9fe", border: "#c4b5fd" },
};
const WATER = { Low: "💧", Medium: "💧💧", High: "💧💧💧" };

export default function Crops() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = getStoredLocation();

  useEffect(() => {
    let mounted = true;
    getCropRecommendations(location.lat, location.lng)
      .then((r) => { if (mounted) setData(r.data); })
      .catch((e) => { if (mounted) setError(e?.response?.data?.detail || e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [location.lat, location.lng]);

  return (
    <PageShell
      title="Crop Recommendations"
      subtitle="AI-powered crop suitability based on real soil, elevation, and climate data."
      loading={loading} error={error}
      action={
        <span style={{ background: "var(--page-surface-strong)", color: "var(--page-accent)", border: "1px solid var(--page-accent-soft)", borderRadius: 100, padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600 }}>
          {data?.crops?.length ?? 0} crops found
        </span>
      }
    >
      <style>{`
        .crops-root { font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; gap: 20px; }
        .crops-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .crops-summary-card { background: var(--page-surface-strong); border: 1px solid var(--page-border); border-radius: 20px; padding: 18px 20px; box-shadow: 0 12px 40px var(--page-shadow); }
        .cscard-label { font-size: 0.7rem; font-weight: 700; color: var(--page-accent); text-transform: uppercase; letter-spacing: 0.1em; }
        .cscard-value { font-size: 1.1rem; font-weight: 600; color: var(--page-text); margin-top: 6px; }
        .crops-insight { background: var(--page-surface); border: 1px solid var(--page-border); border-radius: 20px; padding: 20px 24px; }
        .crops-insight-label { font-size: 0.7rem; font-weight: 700; color: var(--page-accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
        .crops-insight-text { font-size: 0.9rem; color: var(--page-text); line-height: 1.8; }
        .crops-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .crop-card { background: var(--page-surface-strong); border: 1px solid var(--page-border); border-radius: 24px; padding: 22px; transition: box-shadow 0.2s, border-color 0.2s; box-shadow: 0 12px 40px var(--page-shadow); }
        .crop-card:hover { border-color: var(--page-accent-soft); box-shadow: 0 4px 24px var(--page-shadow); }
        .crop-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .crop-name { font-size: 1.15rem; font-weight: 700; color: var(--page-text); }
        .crop-local { font-size: 0.8rem; color: var(--page-muted); font-style: italic; margin-top: 2px; }
        .crop-confidence { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; color: var(--page-accent); }
        .crop-details { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
        .crop-detail { background: var(--page-surface); border-radius: 12px; padding: 10px 12px; border: 1px solid var(--page-border); }
        .crop-detail-label { font-size: 0.65rem; color: var(--page-accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
        .crop-detail-value { font-size: 0.9rem; font-weight: 600; color: var(--page-text); margin-top: 2px; }
        .crop-reason { font-size: 0.825rem; color: var(--page-muted); line-height: 1.6; }
        .crop-warning { font-size: 0.75rem; color: #d97706; display: flex; gap: 6px; align-items: flex-start; margin-top: 4px; }
        .soil-card { background: var(--page-surface-strong); border: 1px solid var(--page-border); border-radius: 20px; padding: 20px 24px; box-shadow: 0 12px 40px var(--page-shadow); }
        .soil-card-title { font-size: 1rem; font-weight: 600; color: var(--page-text); margin-bottom: 14px; }
        .soil-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .soil-stat { background: var(--page-surface); border-radius: 14px; padding: 14px; border: 1px solid var(--page-border); }
        .soil-stat-label { font-size: 0.65rem; color: var(--page-accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
        .soil-stat-value { font-size: 1.1rem; font-weight: 600; color: var(--page-text); margin-top: 4px; }
        @media (max-width: 900px) {
          .crops-summary { grid-template-columns: repeat(2, 1fr); }
          .soil-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .crops-summary { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {data && (
        <div className="crops-root">
          {/* Summary */}
          <div className="crops-summary">
            {[
              { label: "Best Season", value: data.best_season },
              { label: "Annual Rainfall", value: `${data.climate.annual_rainfall.toFixed(0)}mm` },
              { label: "Avg Temperature", value: `${data.climate.avg_temp_min}°–${data.climate.avg_temp_max}°C` },
              { label: "Irrigation", value: data.irrigation_needed ? "Required" : "Not Required" },
            ].map(({ label, value }) => (
              <div className="crops-summary-card" key={label}>
                <div className="cscard-label">{label}</div>
                <div className="cscard-value">{value}</div>
              </div>
            ))}
          </div>

          {/* AI Insight */}
          <div className="crops-insight">
            <div className="crops-insight-label">AI Insight</div>
            <p className="crops-insight-text">{data.insight}</p>
          </div>

          {/* Crop Cards */}
          <div className="crops-grid">
            {data.crops.map((crop) => {
              const ss = SEASON_STYLES[crop.season] || SEASON_STYLES["Year-round"];
              return (
                <div className="crop-card" key={crop.name}>
                  <div className="crop-header">
                    <div>
                      <div className="crop-name">{crop.name}</div>
                      <div className="crop-local">{crop.local_name}</div>
                    </div>
                    <div className="crop-confidence">{crop.confidence}%</div>
                  </div>
                  <span style={{ display: "inline-block", background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, borderRadius: 100, padding: "3px 12px", fontSize: "0.72rem", fontWeight: 600, marginBottom: 12 }}>
                    {crop.season}
                  </span>
                  <div className="crop-details">
                    {[
                      { label: "Plant", value: crop.planting_month },
                      { label: "Harvest", value: crop.harvest_month },
                      { label: "Water", value: `${WATER[crop.water_requirement]} ${crop.water_requirement}` },
                      { label: "Yield", value: crop.yield_estimate },
                    ].map(({ label, value }) => (
                      <div className="crop-detail" key={label}>
                        <div className="crop-detail-label">{label}</div>
                        <div className="crop-detail-value">{value}</div>
                      </div>
                    ))}
                  </div>
                  <p className="crop-reason">{crop.reason}</p>
                  {crop.warnings?.map((w) => (
                    <div className="crop-warning" key={w}><span>⚠</span><span>{w}</span></div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Soil Context */}
          <div className="soil-card">
            <div className="soil-card-title">Soil Context</div>
            <div className="soil-grid">
              {[
                { label: "pH", value: data.soil.ph.toFixed(2) },
                { label: "Nitrogen", value: `${data.soil.nitrogen.toFixed(3)} g/kg` },
                { label: "Clay", value: `${data.soil.clay.toFixed(1)}%` },
                { label: "Organic Matter", value: `${data.soil.organic_matter.toFixed(2)}%` },
              ].map(({ label, value }) => (
                <div className="soil-stat" key={label}>
                  <div className="soil-stat-label">{label}</div>
                  <div className="soil-stat-value">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
