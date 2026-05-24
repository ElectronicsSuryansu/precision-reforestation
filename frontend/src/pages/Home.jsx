import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Animated SVG tree
function Tree({ x, y, scale = 1, delay = 0, opacity = 1 }) {
  return (
    <g
      transform={`translate(${x}, ${y}) scale(${scale})`}
      style={{
        opacity,
        animation: `treeSway ${3 + Math.random() * 2}s ease-in-out ${delay}s infinite alternate`,
        transformOrigin: `${x}px ${y + 60}px`,
      }}
    >
      <line x1="0" y1="0" x2="0" y2="60" stroke="#2d6a4f" strokeWidth="3" strokeLinecap="round" />
      <polygon points="0,-55 -22,0 22,0" fill="#40916c" opacity="0.9" />
      <polygon points="0,-75 -18,-20 18,-20" fill="#52b788" opacity="0.85" />
      <polygon points="0,-90 -13,-40 13,-40" fill="#74c69d" opacity="0.8" />
    </g>
  );
}

function ForestBackground() {
  const trees = [
    { x: 60, y: 420, scale: 0.7, delay: 0.2 },
    { x: 140, y: 440, scale: 0.9, delay: 0.5 },
    { x: 220, y: 410, scale: 0.6, delay: 0.8 },
    { x: 310, y: 450, scale: 1.1, delay: 0.3 },
    { x: 400, y: 420, scale: 0.8, delay: 0.7 },
    { x: 500, y: 445, scale: 1.0, delay: 0.1 },
    { x: 600, y: 415, scale: 0.75, delay: 0.9 },
    { x: 700, y: 440, scale: 1.2, delay: 0.4 },
    { x: 800, y: 420, scale: 0.85, delay: 0.6 },
    { x: 900, y: 450, scale: 0.95, delay: 0.2 },
    { x: 980, y: 410, scale: 0.7, delay: 0.8 },
    { x: 1060, y: 435, scale: 1.05, delay: 0.5 },
    { x: 1150, y: 420, scale: 0.8, delay: 0.3 },
    { x: 1240, y: 445, scale: 0.9, delay: 0.7 },
    { x: 1320, y: 415, scale: 1.1, delay: 0.1 },
    // back row (smaller)
    { x: 100, y: 370, scale: 0.5, delay: 0.4, opacity: 0.5 },
    { x: 260, y: 355, scale: 0.45, delay: 0.6, opacity: 0.5 },
    { x: 450, y: 365, scale: 0.55, delay: 0.2, opacity: 0.5 },
    { x: 650, y: 350, scale: 0.5, delay: 0.9, opacity: 0.5 },
    { x: 850, y: 360, scale: 0.48, delay: 0.5, opacity: 0.5 },
    { x: 1050, y: 370, scale: 0.52, delay: 0.3, opacity: 0.5 },
    { x: 1200, y: 355, scale: 0.46, delay: 0.7, opacity: 0.5 },
  ];

  return (
    <svg
      viewBox="0 0 1400 500"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0fdf4" />
          <stop offset="70%" stopColor="#dcfce7" />
          <stop offset="100%" stopColor="#bbf7d0" />
        </linearGradient>
        <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      {/* Ground */}
      <rect x="0" y="440" width="1400" height="60" fill="url(#groundGrad)" rx="0" />
      <ellipse cx="700" cy="442" rx="750" ry="18" fill="#22c55e" opacity="0.4" />
      {/* Trees */}
      {trees.map((t, i) => (
        <Tree key={i} {...t} />
      ))}
      {/* Rolling hills */}
      <path d="M0,460 Q200,400 400,440 Q600,470 800,430 Q1000,400 1200,445 Q1300,460 1400,440 L1400,500 L0,500 Z" fill="#16a34a" opacity="0.3" />
    </svg>
  );
}

function StatCard({ value, label, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="home-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html,
        body {
          overflow: hidden;
        }

        .home-root {
          min-height: 100vh;
          background: #f0fdf4;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
          overflow-y: auto;
        }

        /* NAV */
        .home-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 40px;
          background: rgba(240,253,244,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #bbf7d0;
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem; font-weight: 700; color: #14532d;
        }
        .nav-logo-dot { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; }
        .nav-links { display: flex; gap: 32px; }
        .nav-link {
          font-size: 0.875rem; font-weight: 500; color: #166534;
          text-decoration: none; letter-spacing: 0.02em;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #16a34a; }
        .nav-cta {
          background: #16a34a; color: white;
          border: none; border-radius: 100px;
          padding: 10px 24px; font-size: 0.875rem; font-weight: 600;
          cursor: pointer; transition: background 0.2s, transform 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-cta:hover { background: #15803d; transform: translateY(-1px); }

        /* HERO */
        .hero {
          position: relative; min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 100px 40px 0;
          overflow: hidden;
        }
        .hero-content {
          position: relative; z-index: 10;
          text-align: center; max-width: 800px;
          opacity: 0; transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .hero-content.visible { opacity: 1; transform: translateY(0); }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: #dcfce7; border: 1px solid #86efac;
          border-radius: 100px; padding: 6px 16px;
          font-size: 0.75rem; font-weight: 600; color: #15803d;
          letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 24px;
        }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pulse 2s infinite; }
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.8rem, 6vw, 5rem);
          font-weight: 900; line-height: 1.1;
          color: #052e16; margin-bottom: 20px;
        }
        .hero-title span { color: #16a34a; }
        .hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: #166534; line-height: 1.7; max-width: 560px; margin: 0 auto 40px;
          font-weight: 300;
        }
        .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .btn-primary {
          background: #16a34a; color: white;
          border: none; border-radius: 100px;
          padding: 16px 36px; font-size: 1rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 24px rgba(22,163,74,0.3);
        }
        .btn-primary:hover { background: #15803d; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(22,163,74,0.4); }
        .btn-secondary {
          background: white; color: #15803d;
          border: 2px solid #86efac; border-radius: 100px;
          padding: 14px 32px; font-size: 1rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-secondary:hover { border-color: #16a34a; background: #f0fdf4; transform: translateY(-2px); }

        /* FOREST */
        .forest-scene {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 320px; z-index: 1;
        }

        /* STATS */
        .stats-section {
          position: relative; z-index: 20;
          background: white;
          padding: 60px 40px;
          display: flex; justify-content: center;
          border-top: 1px solid #dcfce7;
        }
        .about-section {
          padding: 80px 40px;
          background: #f0fdf4;
          max-width: 1100px;
          margin: 0 auto;
        }
        .about-text {
          font-size: 1rem;
          line-height: 1.8;
          color: #4b7a59;
          max-width: 760px;
          margin: 0 auto;
        }
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 2px; max-width: 900px; width: 100%;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 24px; overflow: hidden;
        }
        .stat-card {
          background: white; padding: 32px 24px; text-align: center;
          transition: background 0.2s;
        }
        .stat-card:hover { background: #f0fdf4; }
        .stat-icon { font-size: 1.8rem; margin-bottom: 10px; }
        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem; font-weight: 700; color: #14532d;
        }
        .stat-label { font-size: 0.8rem; color: #4ade80; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }

        /* FEATURES */
        .features-section {
          padding: 80px 40px;
          background: #f0fdf4;
          max-width: 1200px; margin: 0 auto;
        }
        .section-label {
          font-size: 0.75rem; font-weight: 700; color: #16a34a;
          letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px;
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700; color: #052e16; margin-bottom: 48px;
        }
        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
        }
        .feature-card {
          background: white; border: 1px solid #dcfce7;
          border-radius: 24px; padding: 32px;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(22,163,74,0.12);
          border-color: #86efac;
        }
        .feature-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: #dcfce7; display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; margin-bottom: 16px;
        }
        .feature-title { font-size: 1.1rem; font-weight: 600; color: #052e16; margin-bottom: 8px; }
        .feature-desc { font-size: 0.875rem; color: #4b7a59; line-height: 1.7; }

        /* CTA */
        .cta-section {
          background: linear-gradient(135deg, #14532d 0%, #052e16 100%);
          padding: 100px 40px;
          text-align: center; position: relative; overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 30% 50%, rgba(74,222,128,0.15) 0%, transparent 60%),
                      radial-gradient(circle at 70% 50%, rgba(34,197,94,0.1) 0%, transparent 60%);
        }
        .cta-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
        .cta-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700; color: white; margin-bottom: 16px;
        }
        .cta-subtitle { color: #86efac; font-size: 1.1rem; margin-bottom: 36px; line-height: 1.6; }

        /* FOOTER */
        .home-footer {
          background: #052e16; padding: 32px 40px;
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .footer-logo {
          font-family: 'Playfair Display', serif;
          color: #86efac; font-size: 1.1rem; font-weight: 700;
        }
        .footer-text { font-size: 0.8rem; color: #4ade80; opacity: 0.6; }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
        @keyframes treeSway {
          0% { transform: rotate(-1.5deg); }
          100% { transform: rotate(1.5deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @media (max-width: 768px) {
          .home-nav { padding: 14px 20px; }
          .nav-links { display: none; }
          .hero { padding: 80px 20px 0; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .features-grid { grid-template-columns: 1fr; }
          .home-footer { flex-direction: column; gap: 12px; text-align: center; }
          .features-section { padding: 60px 20px; }
          .stats-section { padding: 40px 20px; }
        }
      `}</style>

      {/* Nav */}
      <nav className="home-nav">
        <div className="nav-logo">
          <div className="nav-logo-dot" />
          PrecisionReforestation
        </div>
        <div className="nav-links">
          <a href="#about" className="nav-link">About</a>
          <a href="#features" className="nav-link">Features</a>
        </div>
        <button className="nav-cta" onClick={() => navigate("/dashboard")}>
          Launch Dashboard →
        </button>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className={`hero-content ${visible ? "visible" : ""}`}>
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            Nepal Mountain Restoration · AI-Powered
          </div>
          <h1 className="hero-title">
            Restore Nepal's<br />
            <span>Forests</span> with AI
          </h1>
          <p className="hero-subtitle">
            Precision reforestation intelligence combining satellite NDVI, soil data,
            and Claude AI to identify optimal planting sites across Nepal's diverse terrain.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate("/dashboard")}>
              Start Analysis
            </button>
            <button className="btn-secondary" onClick={() => navigate("/species")}>
              Browse Species
            </button>
          </div>
        </div>

        {/* Animated Forest */}
        <div className="forest-scene">
          <ForestBackground />
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          <StatCard value="15+" label="Native Species" icon="🌿" />
          <StatCard value="10m" label="NDVI Resolution" icon="🛰️" />
          <StatCard value="147k km²" label="Nepal Coverage" icon="🗺️" />
          <StatCard value="Real-time" label="AI Insights" icon="⚡" />
        </div>
      </section>

      {/* About */}
      <section className="about-section" id="about">
        <div className="section-label">About</div>
        <div className="section-title">Data-driven restoration intelligence for Nepal</div>
        <p className="about-text">
          PrecisionReforestation combines Sentinel-2 vegetation indices, terrain analysis,
          soil and elevation signals, and AI guidance to help you choose the best planting
          locations and species across Nepal. Stay focused on restoration outcomes rather
          than raw data, with actionable insights delivered by an easy-to-use web experience.
        </p>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-label">What We Offer</div>
        <div className="section-title">Everything for Smarter Reforestation</div>
        <div className="features-grid">
          {[
            { icon: "🛰️", title: "Sentinel-2 NDVI", desc: "Real satellite imagery at 10m resolution. Track vegetation health changes from 2023 to present across your selected area." },
            { icon: "🌱", title: "Species Matching", desc: "AI matches 15+ native Nepali tree species to your site's elevation, slope, soil pH, and climate conditions." },
            { icon: "⚠️", title: "Erosion Analysis", desc: "Slope-driven erosion risk assessment using NASA DEM data. Identifies areas needing urgent stabilization." },
            { icon: "💨", title: "Carbon Potential", desc: "Estimate CO2e sequestration potential based on soil organic matter, NDVI trends, and terrain class." },
            { icon: "🌾", title: "Crop Recommendations", desc: "AI-powered crop suitability analysis for agroforestry integration using real soil and climate data." },
            { icon: "🤖", title: "Claude AI Insights", desc: "Every analysis is synthesized by Claude into plain-language restoration guidance tailored to your exact coordinates." },
          ].map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="section-label" style={{ color: "#4ade80" }}>Get Started</div>
          <h2 className="cta-title">Start Analyzing Your Site Today</h2>
          <p className="cta-subtitle">
            Enter any coordinates in Nepal and get instant AI-powered restoration intelligence — soil, terrain, species, and carbon all in one place.
          </p>
          <button className="btn-primary" onClick={() => navigate("/dashboard")}>
            Open Dashboard →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-logo">PrecisionReforestation</div>
        <div className="footer-text">Built for Nepal · Powered by Sentinel-2 + Claude AI</div>
      </footer>
    </div>
  );
}
