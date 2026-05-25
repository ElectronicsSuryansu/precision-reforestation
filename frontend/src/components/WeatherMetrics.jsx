import ClimateCard from "./ClimateCard.jsx";

function MiniLine({ values, stroke = "#22d3ee" }) {
  if (!values?.length) {
    return <div className="h-16 rounded-[16px] border border-dashed border-white/10 bg-white/5" />;
  }

  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - value}`).join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-16 w-full overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function RainBars({ values }) {
  if (!values?.length) {
    return <div className="h-20 rounded-[16px] border border-dashed border-white/10 bg-white/5" />;
  }

  const bars = values.slice(-12);
  const maxValue = Math.max(...bars, 1);

  return (
    <div className="flex h-20 items-end gap-1 rounded-[16px] bg-slate-950/20 p-2">
      {bars.map((value, index) => (
        <div key={index} className="flex-1 rounded-full bg-gradient-to-t from-cyan-400/40 to-cyan-300/90" style={{ height: `${Math.max((value / maxValue) * 100, 8)}%` }} />
      ))}
    </div>
  );
}

function MoistureGauge({ value }) {
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#moistureGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
        <defs>
          <linearGradient id="moistureGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-3xl font-bold text-white">{clamped.toFixed(1)}%</div>
      </div>
    </div>
  );
}

function TempLine({ values }) {
  if (!values?.length) {
    return <div className="h-20 rounded-[16px] border border-dashed border-white/10 bg-white/5" />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const normalized = values.map((value) => ((value - min) / spread) * 100);
  const points = normalized.map((value, index) => `${(index / Math.max(normalized.length - 1, 1)) * 100},${100 - value}`).join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-20 w-full overflow-visible">
      <defs>
        <linearGradient id="tempGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="url(#tempGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function SkeletonCard() {
  return <div className="h-[260px] animate-pulse rounded-[20px] border border-white/10 bg-white/5" />;
}

export default function WeatherMetrics({ data, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 xl:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <ClimateCard
        title="Rainfall"
        value={data?.rainfallMm?.toFixed(1) ?? "—"}
        unit="mm"
        accent="cyan"
        subtitle="Total hourly precipitation over the forecast window."
        icon={<span className="text-2xl">☁</span>}
      >
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
          <span>Cloudburst trend</span>
          <span>{data?.series?.rainfall?.length ?? 0} points</span>
        </div>
        <RainBars values={data?.series?.rainfall} />
      </ClimateCard>

      <ClimateCard
        title="Soil Moisture"
        value={data?.avgSoilMoisturePct?.toFixed(1) ?? "—"}
        unit="%"
        accent="green"
        subtitle="Average top-layer soil moisture from Open-Meteo hourly data."
        icon={<span className="text-2xl">◌</span>}
      >
        <div className="flex items-center justify-between gap-4">
          <MoistureGauge value={data?.avgSoilMoisturePct ?? 0} />
          <div className="flex-1 rounded-[16px] border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
            Moisture above 25% generally supports better restoration establishment and lower surface stress.
          </div>
        </div>
      </ClimateCard>

      <ClimateCard
        title="Average Temperature"
        value={data?.avgTemperatureC?.toFixed(1) ?? "—"}
        unit="°C"
        accent="orange"
        subtitle="Mean forecast temperature across the selected time window."
        icon={<span className="text-2xl">☀</span>}
      >
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
          <span>24-hour trend</span>
          <span>{data?.series?.temperature?.length ?? 0} points</span>
        </div>
        <TempLine values={data?.series?.temperature} />
      </ClimateCard>
    </div>
  );
}