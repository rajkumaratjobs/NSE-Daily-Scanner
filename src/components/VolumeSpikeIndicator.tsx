import React from "react";
import { Flame, Zap, BarChart2, TrendingUp, AlertCircle } from "lucide-react";

interface VolumeSpikeIndicatorProps {
  volume: number;
  avgVol20d: number;
  volMultiple?: number;
  compact?: boolean;
}

export function formatVolumeCompact(vol: number): string {
  if (!vol || isNaN(vol)) return "N/A";
  if (vol >= 10_000_000) {
    return `${(vol / 10_000_000).toFixed(2)} Cr`;
  }
  if (vol >= 1_000_000) {
    return `${(vol / 1_000_000).toFixed(2)}M`;
  }
  if (vol >= 100_000) {
    return `${(vol / 100_000).toFixed(2)}L`;
  }
  if (vol >= 1_000) {
    return `${(vol / 1_000).toFixed(1)}K`;
  }
  return vol.toLocaleString("en-IN");
}

export const VolumeSpikeIndicator: React.FC<VolumeSpikeIndicatorProps> = ({
  volume,
  avgVol20d,
  volMultiple: passedMultiple,
  compact = false
}) => {
  // Compute true volume multiple and percentage
  const multiple =
    typeof passedMultiple === "number" && passedMultiple > 0
      ? passedMultiple
      : avgVol20d > 0
      ? volume / avgVol20d
      : 1.0;

  const volumePct = Math.round(multiple * 100);
  const isSpike = multiple >= 2.0 || volumePct >= 200;

  // Visual bar mapping:
  // 0% to 300% scale where 100% avg is at 33.3%, 200% (2x spike threshold) is at 66.7%
  // Cap visual bar fill between 4% and 100%
  const maxScale = 300;
  const barFillPct = Math.min(100, Math.max(5, (volumePct / maxScale) * 100));

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isSpike
          ? "bg-rose-950/20 border-rose-500/50 shadow-sm shadow-rose-950/40 ring-1 ring-rose-500/30"
          : "bg-slate-900/40 border-slate-800/80"
      } ${compact ? "p-2" : "p-2.5"}`}
    >
      {/* Header Row: Label & Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className={`p-1 rounded-md shrink-0 ${
              isSpike ? "bg-rose-500/20 text-rose-400 animate-pulse" : "bg-slate-800 text-slate-400"
            }`}
          >
            {isSpike ? <Flame className="w-3.5 h-3.5" /> : <BarChart2 className="w-3.5 h-3.5" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                Day Volume vs 20D Avg
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                ({formatVolumeCompact(volume)} / {formatVolumeCompact(avgVol20d)})
              </span>
            </div>
          </div>
        </div>

        {/* Volume Spike or Status Badge */}
        {isSpike ? (
          <div
            className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-sm shadow-rose-950 animate-pulse"
            title="Volume Spike: Current volume exceeds 2x (200%) of the 20-day average volume"
          >
            <Zap className="w-3 h-3 text-rose-400 fill-rose-400" />
            <span className="text-rose-200 font-extrabold">Volume Spike</span>
            <span className="text-rose-300 font-mono">({volumePct}%)</span>
          </div>
        ) : (
          <div
            className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/60"
            title={`Current volume is ${volumePct}% of the 20-day average`}
          >
            <TrendingUp className="w-2.5 h-2.5 text-slate-400" />
            <span>
              {volumePct}% of 20D Avg ({multiple.toFixed(2)}x)
            </span>
          </div>
        )}
      </div>

      {/* Main Metric Values Comparison Row */}
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          {/* Main Percentage Display */}
          <div
            className={`font-mono tabular-nums text-lg font-extrabold tracking-tight ${
              isSpike ? "text-rose-400" : "text-white"
            }`}
          >
            {volumePct}%
          </div>
          <div className="text-xs font-mono font-medium text-slate-400">
            ({multiple.toFixed(2)}x of 20D Avg)
          </div>
        </div>

        {/* Relative Difference Tag */}
        <div className="text-right font-mono text-[11px]">
          {isSpike ? (
            <span className="text-rose-400 font-bold flex items-center gap-1 justify-end">
              <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
              <span>+{(volumePct - 100)}% Surge (&gt;2x)</span>
            </span>
          ) : volumePct >= 100 ? (
            <span className="text-emerald-400 font-medium">
              +{volumePct - 100}% above avg
            </span>
          ) : (
            <span className="text-slate-400">
              {100 - volumePct}% below avg
            </span>
          )}
        </div>
      </div>

      {/* Graphical Scale & Gauge Bar with 100% Avg and 200% (2x) Spike Threshold Markers */}
      <div className="mt-2 space-y-1">
        <div
          className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden relative border border-slate-700/50"
          title={`Volume: ${volumePct}% of 20-Day Average (${formatVolumeCompact(volume)} vs ${formatVolumeCompact(avgVol20d)})`}
        >
          {/* Baseline Marker: 100% (1x) at 33.3% of scale */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-400/50 z-10"
            style={{ left: "33.3%" }}
            title="100% (1x 20-Day Average Volume Baseline)"
          />

          {/* Spike Marker: 200% (2x) at 66.7% of scale */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80 z-10"
            style={{ left: "66.7%" }}
            title="200% (2x Volume Spike Threshold)"
          />

          {/* Active Fill Bar */}
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isSpike
                ? "bg-gradient-to-r from-rose-600 via-rose-500 to-red-500 shadow-sm shadow-rose-950"
                : "bg-gradient-to-r from-slate-600 via-sky-600 to-sky-400"
            }`}
            style={{ width: `${barFillPct}%` }}
          />
        </div>

        {/* Gauge Scale Labels */}
        <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-500 px-0.5">
          <span>0%</span>
          <span
            className="relative -ml-2 text-slate-400"
            style={{ left: "33.3%" }}
          >
            100% Avg
          </span>
          <span
            className={`relative -ml-4 font-bold ${
              isSpike ? "text-rose-400" : "text-slate-400"
            }`}
            style={{ left: "66.7%" }}
          >
            200% (2x Spike)
          </span>
          <span>300%+</span>
        </div>
      </div>
    </div>
  );
};
