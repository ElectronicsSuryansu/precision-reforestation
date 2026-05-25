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
    analyzePatch(location.lat, location.lng)
      .then((r) => { if (mounted) setAnalysis(r.data); })
      .catch((e) => { if (mounted) setError(e?.response?.data?.detail || e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [location.lat, location.lng]);

  const slope = analysis?.environment?.slope ?? 0;
  const risk = analysis?.erosion_risk ?? "—";

  return (
    <PageShell
      title="Erosion Risk"
      subtitle="Slope-driven erosion exposure for the selected Himalayan land patch."
      loading={loading} error={error}
      action={
        <span style={{ background: "var(--page-surface-strong)", color: "var(--page-accent)", border: "1px solid var(--page-accent-soft)", borderRadius: 100, padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600 }}>
          Slope {slope.toFixed(1)}°
        </span>
      }
    >
      <style>{`
        .erosion-grid { display: grid; gap: 16px; grid-template-columns: 1fr 2fr; }
        .ecard { background: var(--page-surface-strong); border: 1px solid var(--page-border); border-radius: 24px; padding: 24px; box-shadow: 0 12px 40px var(--page-shadow); }
        .ecard-label { font-size: 0.7rem; font-weight: 700; color: var(--page-accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
        .ecard-value { font-family: 'Playfair Display', serif; font-size: 2.8rem; font-weight: 700; color: var(--page-text); line-height: 1; }
        .ecard-title { font-size: 1rem; font-weight: 600; color: var(--page-text); margin-bottom: 10px; }
        .ecard-text { font-size: 0.875rem; color: var(--page-muted); line-height: 1.7; }
        .estat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 16px; }
        .estat { background: var(--page-surface); border-radius: 14px; padding: 14px; border: 1px solid var(--page-border); }
        .estat-label { font-size: 0.65rem; color: var(--page-accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
        .estat-value { font-size: 1.2rem; font-weight: 600; color: var(--page-text); margin-top: 4px; }
        @media (max-width: 768px) { .erosion-grid { grid-template-columns: 1fr; } .estat-row { grid-template-columns: 1fr 1fr; } }
      `}</style>
      <div className="erosion-grid">
        <div className="ecard">
          <div className="ecard-label">Erosion Risk</div>
          <div className="ecard-value">{risk}</div>
          <p className="ecard-text" style={{ marginTop: 12 }}>Steeper terrain and lower vegetation cover increase runoff and landslide likelihood.</p>
        </div>
        <div className="ecard">
          <div className="ecard-title">Slope Interpretation</div>
          <p className="ecard-text">Evaluated against neighboring elevation samples. Higher slope values demand deeper rooting species, contour barriers, and staged stabilization work.</p>
          <div className="estat-row">
            <div className="estat"><div className="estat-label">Slope</div><div className="estat-value">{slope.toFixed(1)}°</div></div>
            <div className="estat"><div className="estat-label">Risk Class</div><div className="estat-value">{risk}</div></div>
            <div className="estat"><div className="estat-label">Terrain</div><div className="estat-value">{analysis?.environment?.terrain_class ?? "—"}</div></div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
