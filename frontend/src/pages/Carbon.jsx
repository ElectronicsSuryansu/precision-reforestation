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
    analyzePatch(location.lat, location.lng)
      .then((r) => { if (mounted) setAnalysis(r.data); })
      .catch((e) => { if (mounted) setError(e?.response?.data?.detail || e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [location.lat, location.lng]);

  const carbon = analysis?.carbon_potential ?? 0;

  return (
    <PageShell
      title="Carbon Potential"
      subtitle="Estimate restoration-linked carbon sequestration from terrain, soil, and vegetation."
      loading={loading} error={error}
      action={
        <span style={{ background: "var(--page-surface-strong)", color: "var(--page-accent)", border: "1px solid var(--page-accent-soft)", borderRadius: 100, padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600 }}>
          CO₂e {carbon.toFixed(2)} t/yr
        </span>
      }
    >
      <style>{`
        .carbon-grid { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
        .ccard { background: var(--page-surface-strong); border: 1px solid var(--page-border); border-radius: 24px; padding: 24px; box-shadow: 0 12px 40px var(--page-shadow); }
        .ccard-label { font-size: 0.7rem; font-weight: 700; color: var(--page-accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
        .ccard-value { font-family: 'Playfair Display', serif; font-size: 3.5rem; font-weight: 700; color: var(--page-text); line-height: 1; }
        .ccard-unit { font-size: 0.875rem; color: var(--page-muted); margin-top: 6px; }
        .ccard-title { font-size: 1rem; font-weight: 600; color: var(--page-text); margin-bottom: 14px; }
        .ccard-text { font-size: 0.875rem; color: var(--page-muted); line-height: 1.7; }
        .cstat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
        .cstat { background: var(--page-surface); border-radius: 14px; padding: 14px; border: 1px solid var(--page-border); }
        .cstat-label { font-size: 0.65rem; color: var(--page-accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
        .cstat-value { font-size: 1.2rem; font-weight: 600; color: var(--page-text); margin-top: 4px; }
        @media (max-width: 768px) { .carbon-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="carbon-grid">
        <div className="ccard">
          <div className="ccard-label">Carbon Potential</div>
          <div className="ccard-value">{carbon.toFixed(2)}</div>
          <div className="ccard-unit">tons of CO₂e per year</div>
          <p className="ccard-text" style={{ marginTop: 12 }}>Organic matter and canopy recovery increase the site's sequestration capacity.</p>
        </div>
        <div className="ccard">
          <div className="ccard-title">Key Drivers</div>
          <div className="cstat-grid">
            <div className="cstat">
              <div className="cstat-label">Organic Matter</div>
              <div className="cstat-value">{analysis?.environment?.soil?.organic_matter?.toFixed(2) ?? "—"}%</div>
            </div>
            <div className="cstat">
              <div className="cstat-label">NDVI</div>
              <div className="cstat-value">{analysis?.environment?.ndvi?.toFixed(3) ?? "—"}</div>
            </div>
          </div>
          <p className="ccard-text">Higher organic matter signals stronger biomass accumulation and better long-term carbon storage potential.</p>
        </div>
      </div>
    </PageShell>
  );
}
