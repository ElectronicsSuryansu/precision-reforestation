import { useEffect, useState } from "react";
import PageShell from "../components/PageShell.jsx";
import { analyzePatch } from "../services/api.js";
import { getStoredLocation } from "../services/location.js";

export default function Biodiversity() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = getStoredLocation();

  useEffect(() => {
    let mounted = true;
    analyzePatch(location.lat, location.lng)
      .then((r) => { if (mounted) setAnalysis(r.data); })
      .catch((e) => { if (mounted) setError(e?.response?.data?.detail || e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [location.lat, location.lng]);

  const score = analysis?.biodiversity_score ?? 0;
  const summary = score >= 75 ? "High ecological recovery potential" : score >= 50 ? "Moderate biodiversity opportunity" : "Targeted restoration needed";

  return (
    <PageShell
      title="Biodiversity"
      subtitle="Species richness and ecological resilience score for the selected site."
      loading={loading} error={error}
      action={
        <span style={{ background: "var(--page-surface-strong)", color: "var(--page-accent)", border: "1px solid var(--page-accent-soft)", borderRadius: 100, padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600 }}>
          {location.lat.toFixed(3)}, {location.lng.toFixed(3)}
        </span>
      }
    >
      <style>{`
        .bio-grid { display: grid; gap: 16px; grid-template-columns: 1.1fr 0.9fr; }
        .bcard { background: var(--page-surface-strong); border: 1px solid var(--page-border); border-radius: 24px; padding: 24px; box-shadow: 0 12px 40px var(--page-shadow); }
        .bcard-label { font-size: 0.7rem; font-weight: 700; color: var(--page-accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
        .bcard-value { font-family: 'Playfair Display', serif; font-size: 3.5rem; font-weight: 700; color: var(--page-text); line-height: 1; }
        .bcard-unit { font-size: 0.875rem; color: var(--page-muted); margin-top: 6px; }
        .bcard-title { font-size: 1rem; font-weight: 600; color: var(--page-text); margin-bottom: 10px; }
        .bcard-text { font-size: 0.875rem; color: var(--page-muted); line-height: 1.7; }
        .b-track { height: 6px; background: var(--page-border); border-radius: 100px; margin-top: 20px; overflow: hidden; }
        .b-fill { height: 100%; background: linear-gradient(90deg, var(--page-accent), var(--page-accent-soft)); border-radius: 100px; transition: width 0.8s ease; }
        @media (max-width: 768px) { .bio-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="bio-grid">
        <div className="bcard">
          <div className="bcard-label">Biodiversity Score</div>
          <div className="bcard-value">{score.toFixed(1)}</div>
          <div className="bcard-unit">{summary}</div>
          <div className="b-track"><div className="b-fill" style={{ width: `${score}%` }} /></div>
        </div>
        <div className="bcard">
          <div className="bcard-title">How It's Calculated</div>
          <div className="bcard-text">
            The backend combines live soil and elevation context with NDVI and slope estimates, then scores the site through Claude. Higher NDVI, stronger organic matter, and moderate slopes improve the score, while steep or nutrient-poor terrain pulls it down.
          </div>
        </div>
      </div>
    </PageShell>
  );
}
