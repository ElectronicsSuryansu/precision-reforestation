export default function ConfidenceBar({ value = 0 }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span>Confidence</span>
        <span className="font-semibold text-forest-300">{clamped.toFixed(0)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-forest-400 to-emerald-300 transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
