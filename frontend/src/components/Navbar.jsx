import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

const navItems = [
  { to: "/home", label: "Home" },
  { to: "/", label: "Dashboard" },
  { to: "/biodiversity", label: "Biodiversity" },
  { to: "/erosion", label: "Erosion" },
  { to: "/carbon", label: "Carbon" },
  { to: "/species", label: "Species" },
  { to: "/insight", label: "Insight" },
  { to: "/crops", label: "Crops" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-xl"
      style={{
        backgroundColor: isDark ? "rgba(2, 6, 23, 0.86)" : "rgba(247, 250, 245, 0.9)",
        borderColor: isDark ? "rgba(148, 163, 184, 0.14)" : "rgba(22, 163, 74, 0.14)",
      }}
    >
      <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className={isDark ? "flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-glow" : "flex h-11 w-11 items-center justify-center rounded-2xl border border-forest-400/20 bg-white shadow-glow"}>
            <img src="/logo.svg" alt="Precision Reforestation" className="h-8 w-8 object-contain" style={{ filter: isDark ? "brightness(1.08)" : "brightness(0.92)" }} />
          </div>
          <div>
            <div className={isDark ? "font-display text-lg font-bold tracking-tight text-white" : "font-display text-lg font-bold tracking-tight text-slate-900"}>
              Ecological Restoration Intelligence
            </div>
            <div className={isDark ? "text-xs uppercase tracking-[0.28em] text-forest-300/80" : "text-xs uppercase tracking-[0.28em] text-forest-700/80"}>
              Nepal terrain decision system
            </div>
          </div>
        </div>

        <nav className={isDark ? "hidden items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/5 p-1 text-sm md:flex" : "hidden items-center gap-2 overflow-x-auto rounded-full border border-forest-400/15 bg-white/70 p-1 text-sm md:flex"}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "rounded-full px-4 py-2 transition-all duration-200",
                  isActive
                    ? "bg-forest-500 text-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                    : isDark
                      ? "text-slate-300 hover:bg-white/5 hover:text-white"
                      : "text-slate-600 hover:bg-forest-50 hover:text-forest-700",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          <button
            type="button"
            onClick={toggleTheme}
            className={isDark
              ? "rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-100 transition hover:bg-white/10"
              : "rounded-full border border-forest-400/20 bg-white px-3 py-2 text-slate-900 transition hover:bg-forest-50"
            }
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "☀ Light mode" : "☾ Dark mode"}
          </button>
          <span className={isDark ? "rounded-full border border-forest-400/20 bg-forest-400/10 px-3 py-2 text-forest-200" : "rounded-full border border-forest-400/20 bg-forest-50 px-3 py-2 text-forest-800"}>
            Live geospatial + Claude
          </span>
        </div>
      </div>
    </header>
  );
}