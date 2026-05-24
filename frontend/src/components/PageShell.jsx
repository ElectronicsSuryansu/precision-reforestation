import Loading from "./Loading.jsx";

export default function PageShell({ title, subtitle, loading, error, children, action }) {
  return (
    <section className="glass-panel rounded-[28px] border border-white/10 p-5 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{subtitle}</p>
        </div>
        {action}
      </div>

      {loading ? <div className="mt-5"><Loading message="Fetching live analysis..." subtext="Calling FastAPI endpoints via Axios" /></div> : null}

      {error ? <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}

      {!loading && !error ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
