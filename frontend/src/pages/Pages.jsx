/* ===== SHARED CARD STYLES ===== */
const cardStyles = `
  .gcard {
    background: white; border: 1px solid #dcfce7;
    border-radius: 24px; padding: 24px;
    transition: box-shadow 0.2s, border-color 0.2s;
  }
  .gcard:hover { border-color: #86efac; box-shadow: 0 4px 24px rgba(22,163,74,0.08); }
  .gcard-label { font-size: 0.7rem; font-weight: 700; color: #16a34a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
  .gcard-value { font-family: 'Playfair Display', serif; font-size: 3.5rem; font-weight: 700; color: #052e16; line-height: 1; }
  .gcard-unit { font-size: 0.875rem; color: #4b7a59; margin-top: 6px; }
  .gcard-title { font-size: 1rem; font-weight: 600; color: #052e16; margin-bottom: 10px; }
  .gcard-text { font-size: 0.875rem; color: #4b7a59; line-height: 1.7; }
  .gpage-grid-2 { display: grid; gap: 16px; grid-template-columns: 1.1fr 0.9fr; }
  .gpage-grid-3 { display: grid; gap: 16px; grid-template-columns: 1fr 2fr; }
  .gpage-grid-equal { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
  .gstat-row { display: grid; gap: 12px; grid-template-columns: repeat(3, 1fr); margin-top: 16px; }
  .gstat { background: #f0fdf4; border-radius: 16px; padding: 16px; }
  .gstat-label { font-size: 0.7rem; color: #16a34a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
  .gstat-value { font-size: 1.4rem; font-weight: 600; color: #052e16; margin-top: 4px; }
  .badge-green { display: inline-block; background: #dcfce7; color: #15803d; border: 1px solid #86efac; border-radius: 100px; padding: 4px 12px; font-size: 0.75rem; font-weight: 600; }
  .confidence-track { height: 6px; background: #dcfce7; border-radius: 100px; margin-top: 12px; overflow: hidden; }
  .confidence-fill { height: 100%; background: linear-gradient(90deg, #16a34a, #4ade80); border-radius: 100px; transition: width 0.8s ease; }
  @media (max-width: 768px) {
    .gpage-grid-2, .gpage-grid-3, .gpage-grid-equal { grid-template-columns: 1fr; }
    .gstat-row { grid-template-columns: repeat(2, 1fr); }
  }
`;

// ===== SPECIES =====
import { useEffect, useState } from "react";
import PageShell from "../components/PageShell.jsx";
import { analyzePatch } from "../services/api.js";
import { getStoredLocation } from "../services/location.js";
import EnvironmentalAnalytics from "./Biodiversity.jsx";

export function Species() {
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
      title="Species Recommendations"
      subtitle="Native and climate-fit species suggestions from the AI layer."
      loading={loading} error={error}
      action={<span className="badge-green">{analysis?.species?.length ?? 0} suggestions</span>}
    >
      <style>{cardStyles}</style>
      <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {analysis?.species?.length ? analysis.species.map((s) => (
          <div className="gcard" key={s.name}>
            <div className="gcard-label">Restoration Candidate</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#052e16", marginBottom: 8 }}>{s.name}</div>
            <div className="gcard-text">{s.reason}</div>
            <div className="confidence-track">
              <div className="confidence-fill" style={{ width: `${s.confidence}%` }} />
            </div>
            <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: 6, fontWeight: 600 }}>{s.confidence}% confidence</div>
          </div>
        )) : (
          <div className="gcard"><div className="gcard-text">No species data yet.</div></div>
        )}
      </div>
    </PageShell>
  );
}

// ===== INSIGHT =====
export function Insight() {
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
      action={<span className="badge-green">AI Narrative</span>}
    >
      <style>{cardStyles}</style>
      <div className="gpage-grid-2">
        <div className="gcard">
          <div className="gcard-label">AI Insight</div>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "#052e16", marginTop: 8 }}>
            {analysis?.insight ?? "No insight available yet."}
          </p>
        </div>
        <div className="gcard">
          <div className="gcard-title">Context</div>
          {[
            { label: "Elevation", value: `${analysis?.environment?.elevation?.elevation?.toFixed(0) ?? "—"} m` },
            { label: "Slope", value: `${analysis?.environment?.slope?.toFixed(1) ?? "—"}°` },
            { label: "NDVI", value: analysis?.environment?.ndvi?.toFixed(3) ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#f0fdf4", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 600, color: "#052e16", marginTop: 2 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

// ===== CLIMATE =====
export function Climate() {
  return <EnvironmentalAnalytics />;
}

export const Biodiversity = Climate;

// ===== CARBON =====
export function Carbon() {
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
      action={<span className="badge-green">CO₂e {carbon.toFixed(2)} t/yr</span>}
    >
      <style>{cardStyles}</style>
      <div className="gpage-grid-equal">
        <div className="gcard">
          <div className="gcard-label">Carbon Potential</div>
          <div className="gcard-value">{carbon.toFixed(2)}</div>
          <div className="gcard-unit">tons of CO₂e per year</div>
          <div className="gcard-text" style={{ marginTop: 12 }}>Organic matter and canopy recovery increase the site's sequestration capacity.</div>
        </div>
        <div className="gcard">
          <div className="gcard-title">Key Drivers</div>
          <div className="gstat-row" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 8 }}>
            <div className="gstat">
              <div className="gstat-label">Organic Matter</div>
              <div className="gstat-value">{analysis?.environment?.soil?.organic_matter?.toFixed(2) ?? "—"}%</div>
            </div>
            <div className="gstat">
              <div className="gstat-label">NDVI</div>
              <div className="gstat-value">{analysis?.environment?.ndvi?.toFixed(3) ?? "—"}</div>
            </div>
          </div>
          <div className="gcard-text" style={{ marginTop: 12 }}>Higher organic matter signals stronger biomass accumulation and better long-term carbon storage.</div>
        </div>
      </div>
    </PageShell>
  );
}

// ===== EROSION =====
export function Erosion() {
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
      action={<span className="badge-green">Slope {slope.toFixed(1)}°</span>}
    >
      <style>{cardStyles}</style>
      <div className="gpage-grid-3">
        <div className="gcard">
          <div className="gcard-label">Erosion Risk</div>
          <div className="gcard-value" style={{ fontSize: "2.8rem" }}>{risk}</div>
          <div className="gcard-text" style={{ marginTop: 12 }}>Steeper terrain and lower vegetation cover increase runoff and landslide likelihood.</div>
        </div>
        <div className="gcard">
          <div className="gcard-title">Slope Interpretation</div>
          <div className="gcard-text">Evaluated against neighboring elevation samples. Higher slope values demand deeper rooting species, contour barriers, and staged stabilization.</div>
          <div className="gstat-row">
            <div className="gstat">
              <div className="gstat-label">Slope</div>
              <div className="gstat-value">{slope.toFixed(1)}°</div>
            </div>
            <div className="gstat">
              <div className="gstat-label">Risk Class</div>
              <div className="gstat-value">{risk}</div>
            </div>
            <div className="gstat">
              <div className="gstat-label">Terrain</div>
              <div className="gstat-value">{analysis?.environment?.terrain_class ?? "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
