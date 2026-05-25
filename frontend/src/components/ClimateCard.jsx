export default function ClimateCard({
  title,
  value,
  unit,
  accent = "cyan",
  subtitle,
  icon,
  children,
  className = "",
}) {
  const accentClasses = {
    cyan: "from-cyan-400/20 to-cyan-400/0 border-cyan-400/20 text-cyan-200",
    green: "from-emerald-400/20 to-emerald-400/0 border-emerald-400/20 text-emerald-200",
    orange: "from-orange-400/20 to-orange-400/0 border-orange-400/20 text-orange-200",
  }[accent] ?? "from-cyan-400/20 to-cyan-400/0 border-cyan-400/20 text-cyan-200";

  return (
    <div className={`group relative overflow-hidden rounded-[20px] border bg-[var(--page-surface)] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(0,0,0,0.3)] ${className}`} style={{ borderColor: "var(--page-border)" }}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentClasses}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{title}</div>
          <div className="mt-3 flex items-end gap-2">
            <div className="font-display text-4xl font-bold text-[var(--page-text)] leading-none">{value}</div>
            {unit ? <div className="pb-1 text-sm font-medium text-slate-400">{unit}</div> : null}
          </div>
          {subtitle ? <div className="mt-3 text-sm leading-6 text-slate-400">{subtitle}</div> : null}
        </div>
        {icon ? (
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br ${accentClasses} shadow-[0_0_24px_rgba(45,212,191,0.14)]`}>
            {icon}
          </div>
        ) : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}