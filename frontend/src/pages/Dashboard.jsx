import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "../components/MapView.jsx";
import SidePanel from "../components/SidePanel.jsx";
import { analyzePatch, getEnvironment } from "../services/api.js";
import { getStoredLocation, saveStoredAnalysis, saveStoredLocation } from "../services/location.js";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Dashboard() {
  const [location, setLocation] = useState(() => getStoredLocation());
  const [latInput, setLatInput] = useState(() => String(getStoredLocation().lat));
  const [lngInput, setLngInput] = useState(() => String(getStoredLocation().lng));
  const [environment, setEnvironment] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("Fetching soil data...");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLatInput(String(location.lat));
    setLngInput(String(location.lng));
  }, [location.lat, location.lng]);

  const runAnalysis = useCallback(async (nextLocation = location) => {
    const loc = nextLocation || location;
    setLocation(loc);
    saveStoredLocation(loc);
    setLoading(true);
    setError("");
    try {
      setStage("Fetching soil data...");
      const envRes = await getEnvironment(loc.lat, loc.lng);
      setEnvironment(envRes.data);
      await delay(150);
      setStage("Analyzing terrain...");
      await delay(150);
      setStage("Generating AI insights...");
      const anaRes = await analyzePatch(loc.lat, loc.lng);
      setAnalysis(anaRes.data);
      saveStoredAnalysis(anaRes.data);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || "Unable to analyze the selected area.");
    } finally {
      setLoading(false);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (!isFinite(lat) || !isFinite(lng)) { setError("Enter valid lat/lng values."); return; }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) { setError("Coordinates out of range."); return; }
    await runAnalysis({ lat, lng });
  };

  useEffect(() => { runAnalysis(location); }, []); // eslint-disable-line

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ location, environment, analysis, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `restoration-${location.lat.toFixed(3)}-${location.lng.toFixed(3)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .dash-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f0fdf4; }
        .dash-header {
          background: white; border-bottom: 1px solid #dcfce7;
          padding: 20px 32px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .dash-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .dash-right-actions { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
        .dash-home-btn {
          background: white;
          color: #166534;
          border: 1px solid #16a34a;
          border-radius: 999px;
          padding: 10px 18px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
        }
        .dash-home-btn:hover { background: #16a34a; color: white; transform: translateY(-1px); }
        .dash-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #dcfce7; border: 1px solid #86efac;
          border-radius: 100px; padding: 4px 12px;
          font-size: 0.7rem; font-weight: 700; color: #15803d;
          letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px;
        }
        .dash-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; animation: pulse2 2s infinite; }
        .dash-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 700; color: #052e16;
        }
        .dash-subtitle { font-size: 0.875rem; color: #4b7a59; margin-top: 4px; }
        .coord-badge {
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 16px; padding: 12px 16px; text-align: right; flex-shrink: 0;
        }
        .coord-badge-label { display: block;
    font-size: 0.7rem;
    font-weight: 700;
    color: #16a34a;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 6px; }
        .coord-badge-value { font-size: 1rem; font-weight: 600; color: #052e16; margin-top: 2px; }
        .dash-form {
          display: grid; gap: 12px;
          grid-template-columns: 1fr 1fr auto;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 20px; padding: 16px;
        }
        .form-field label { display: block; font-size: 0.7rem; font-weight: 700; color: #16a34a; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .form-input {
          width: 100%; background: white; border: 1px solid #dcfce7;
          border-radius: 12px; padding: 10px 14px; font-size: 0.9rem; color: #052e16;
          outline: none; transition: border-color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .form-input:focus { border-color: #16a34a; }
        .form-submit {
          align-self: end;
          background: #16a34a; color: white; border: none;
          border-radius: 12px; padding: 11px 24px;
          font-size: 0.875rem; font-weight: 600;
          cursor: pointer; transition: background 0.2s, transform 0.15s;
          white-space: nowrap; font-family: 'DM Sans', sans-serif;
        }
        .form-submit:hover { background: #15803d; transform: translateY(-1px); }
        .dash-error {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 12px; padding: 12px 16px;
          font-size: 0.875rem; color: #dc2626;
        }
        .dash-body {
          display: grid; gap: 20px; padding: 20px 32px;
          grid-template-columns: minmax(0, 1.7fr) minmax(340px, 0.9fr);
        }
        @keyframes pulse2 { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        @media (max-width: 900px) {
          .dash-body { grid-template-columns: 1fr; padding: 16px; }
          .dash-header { padding: 16px; }
          .dash-form { grid-template-columns: 1fr 1fr; }
          .form-submit { grid-column: span 2; }
        }
        @media (max-width: 600px) {
          .dash-form { grid-template-columns: 1fr; }
          .form-submit { grid-column: 1; }
        }
      `}</style>

      <div className="dash-root">
        <div className="dash-header">
          <div className="dash-title-row">
            <div>
              <div className="dash-badge"><div className="dash-badge-dot" /> Live Analysis</div>
              <h1 className="dash-title">Restoration Intelligence Dashboard</h1>
              <p className="dash-subtitle">Click the map or enter coordinates to analyze any Nepal site.</p>
            </div>
            <div className="dash-right-actions">
              <button className="dash-home-btn" type="button" onClick={() => navigate("/home")}>Home</button>
              <div className="coord-badge">
                <div className="coord-badge-label">Selected Point</div>
                <div className="coord-badge-value">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</div>
              </div>
            </div>
          </div>

          <form className="dash-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Latitude</label>
              <input className="form-input" type="number" step="any" value={latInput} onChange={(e) => setLatInput(e.target.value)} placeholder="27.7172" />
            </div>
            <div className="form-field">
              <label>Longitude</label>
              <input className="form-input" type="number" step="any" value={lngInput} onChange={(e) => setLngInput(e.target.value)} placeholder="85.3240" />
            </div>
            <button className="form-submit" type="submit">Analyze →</button>
          </form>

          {error && <div className="dash-error">⚠ {error}</div>}
        </div>

        <div className="dash-body">
          <MapView location={location} onSelect={runAnalysis} />
          <SidePanel
            location={location}
            environment={environment}
            analysis={analysis}
            loading={loading}
            stage={stage}
            error={error}
            onAnalyze={() => runAnalysis(location)}
            onExport={handleExport}
          />
        </div>
      </div>
    </>
  );
}
