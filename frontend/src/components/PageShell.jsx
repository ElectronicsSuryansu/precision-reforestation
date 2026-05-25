/* PageShell.jsx - Shared layout wrapper for all inner pages */

import { useTheme } from "../context/ThemeContext.jsx";

const pageShellStyles = `
  .ps-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: var(--page-bg);
    color: var(--page-text);
    --page-bg: #f0fdf4;
    --page-surface: rgba(255, 255, 255, 0.94);
    --page-surface-strong: #ffffff;
    --page-border: #dcfce7;
    --page-text: #052e16;
    --page-muted: #4b7a59;
    --page-accent: #16a34a;
    --page-accent-soft: #86efac;
    --page-shadow: rgba(22, 163, 74, 0.12);
  }
  .ps-root[data-theme='dark'] {
    --page-bg: #020617;
    --page-surface: rgba(15, 23, 42, 0.92);
    --page-surface-strong: #0f172a;
    --page-border: rgba(148, 163, 184, 0.14);
    --page-text: #e2e8f0;
    --page-muted: #94a3b8;
    --page-accent: #2dd4bf;
    --page-accent-soft: #5eead4;
    --page-shadow: rgba(0, 0, 0, 0.35);
  }
  .ps-header {
    background: var(--page-surface); border-bottom: 1px solid var(--page-border);
    padding: 24px 32px;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  }
  .ps-title-wrap {}
  .ps-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 700; color: var(--page-text);
  }
  .ps-subtitle { font-size: 0.875rem; color: var(--page-muted); margin-top: 4px; max-width: 540px; line-height: 1.5; }
  .ps-body { padding: 28px 32px; }
  .ps-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 300px; gap: 16px;
  }
  .ps-spinner {
    width: 40px; height: 40px; border: 3px solid var(--page-border);
    border-top-color: var(--page-accent); border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  .ps-loading-text { font-size: 0.875rem; color: var(--page-muted); }
  .ps-error {
    background: rgba(127, 29, 29, 0.08); border: 1px solid rgba(248, 113, 113, 0.28);
    border-radius: 16px; padding: 16px 20px; color: #fca5a5; font-size: 0.875rem;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 768px) {
    .ps-header { padding: 16px 20px; }
    .ps-body { padding: 20px; }
  }
`;

export default function PageShell({ title, subtitle, loading, error, action, children }) {
  const { theme } = useTheme();

  return (
    <>
      <style>{pageShellStyles}</style>
      <div className="ps-root" data-theme={theme}>
        <div className="ps-header">
          <div className="ps-title-wrap">
            <h1 className="ps-title">{title}</h1>
            {subtitle && <p className="ps-subtitle">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
        <div className="ps-body">
          {loading ? (
            <div className="ps-loading">
              <div className="ps-spinner" />
              <div className="ps-loading-text">Loading {title.toLowerCase()} data…</div>
            </div>
          ) : error ? (
            <div className="ps-error">⚠ {error}</div>
          ) : (
            children
          )}
        </div>
      </div>
    </>
  );
}
