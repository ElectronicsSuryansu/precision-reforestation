import Navbar from "./components/Navbar.jsx";
import AppRoutes from "./router/index.jsx";
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";
import { useLocation } from "react-router-dom";

function AppShell() {
  const { theme } = useTheme();
  const location = useLocation();
  const showGlobalNavbar = location.pathname !== "/home";

  return (
    <div
      className={
        theme === "dark"
          ? "min-h-screen bg-aurora-grid text-slate-100 relative overflow-x-hidden font-body"
          : "min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#f8fffb,_#edfdf3)] text-slate-900 relative overflow-x-hidden font-body"
      }
    >
      <div className="pointer-events-none absolute inset-0 opacity-35">
        <div className={theme === "dark" ? "absolute -left-24 top-10 h-72 w-72 rounded-full bg-forest-500/20 blur-3xl" : "absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"} />
        <div className={theme === "dark" ? "absolute right-[-6rem] top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" : "absolute right-[-6rem] top-40 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl"} />
        <div className={theme === "dark" ? "absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" : "absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-forest-300/15 blur-3xl"} />
      </div>
      <div className="relative z-10">
        {showGlobalNavbar ? <Navbar /> : null}
        <main className="mx-auto w-full max-w-[1700px] px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
