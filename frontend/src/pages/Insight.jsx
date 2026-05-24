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
    analyzePatch(location.lat, location.lng)
      .then((r) => { if (mounted) setAnalysis(r.data); })
      .catch((e) => { if (mounted) setError(e?.response?.data?.detail || e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [location.lat, location.lng]);

  return (
    <PageShell
      title="Insight"
      subtitle="Claude-generated restoration summary for the selected land patch."
      loading={loading} error={error}
      action={
        <span style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: 100, padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600 }}>
          AI Narrative
        </span>
      }
    >
      <style>{`
        .insight-grid { display: grid; gap: 16px; grid-template-columns: 1.15fr 0.85fr; }
        .icard { background: white; border: 1px solid #dcfce7; border-radius: 24px; padding: 24px; }
        .icard-label { font-size: 0.7rem; font-weight: 700; color: #16a34a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
        .icard-title { font-size: 1rem; font-weight: 600; color: #052e16; margin-bottom: 14px; }
        .istat { background: #f0fdf4; border-radius: 14px; padding: 14px 16px; margin-bottom: 10px; }
        .istat-label { font-size: 0.7rem; color: #16a34a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
        .istat-value { font-size: 1.3rem; font-weight: 600; color: #052e16; margin-top: 2px; }
        @media (max-width: 768px) { .insight-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="insight-grid">
        <div className="icard">
          <div className="icard-label">AI Insight</div>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "#052e16" }}>
            {analysis?.insight ?? "No insight available yet."}
          </p>
        </div>
        <div className="icard">
          <div className="icard-title">Context</div>
          {[
            { label: "Elevation", value: `${analysis?.environment?.elevation?.elevation?.toFixed(0) ?? "—"} m` },
            { label: "Slope", value: `${analysis?.environment?.slope?.toFixed(1) ?? "—"}°` },
            { label: "NDVI", value: analysis?.environment?.ndvi?.toFixed(3) ?? "—" },
          ].map(({ label, value }) => (
            <div className="istat" key={label}>
              <div className="istat-label">{label}</div>
              <div className="istat-value">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
