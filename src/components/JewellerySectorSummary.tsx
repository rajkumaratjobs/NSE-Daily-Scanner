import React, { useState } from "react";
import { StockData } from "../types";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Gem,
  BarChart2,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Activity
} from "lucide-react";
import { formatVolumeCompact } from "./VolumeSpikeIndicator";

interface JewellerySectorSummaryProps {
  stocks: StockData[];
  filteredCount?: number;
  onTriggerSentiment?: () => void;
  isAnalyzingSentiment?: boolean;
  onToggleDailyChart?: () => void;
  showDailyChart?: boolean;
}

export const JewellerySectorSummary: React.FC<JewellerySectorSummaryProps> = ({
  stocks,
  filteredCount,
  onTriggerSentiment,
  isAnalyzingSentiment,
  onToggleDailyChart,
  showDailyChart = true
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!stocks || stocks.length === 0) {
    return null;
  }

  // Calculate metrics across all tracked jewellery stocks
  const totalStocks = stocks.length;

  // 1. Equal-weighted average daily percentage change
  const sumOfPercentageChanges = stocks.reduce(
    (acc, s) => acc + (typeof s.change_pct === "number" ? s.change_pct : 0),
    0
  );
  const avgPercentageChange = sumOfPercentageChanges / totalStocks;

  // 2. Market-cap weighted daily percentage change
  let totalMarketCap = 0;
  let weightedChangeSum = 0;
  stocks.forEach(s => {
    const mcap = s.market_cap_cr || 0;
    if (mcap > 0) {
      totalMarketCap += mcap;
      weightedChangeSum += (s.change_pct || 0) * mcap;
    }
  });
  const mcapWeightedPct = totalMarketCap > 0 ? weightedChangeSum / totalMarketCap : avgPercentageChange;

  // 3. Advancing vs Declining vs Neutral count
  const advancingStocks = stocks.filter(s => (s.change_pct || 0) > 0);
  const decliningStocks = stocks.filter(s => (s.change_pct || 0) < 0);
  const neutralStocks = stocks.filter(s => (s.change_pct || 0) === 0);

  // 4. Combined Volume
  const combinedVolume = stocks.reduce((acc, s) => acc + (s.volume || 0), 0);

  // 5. Best & Worst Performers
  const sortedByPerf = [...stocks].sort((a, b) => (b.change_pct || 0) - (a.change_pct || 0));
  const topGainer = sortedByPerf[0];
  const topLoser = sortedByPerf[sortedByPerf.length - 1];

  // Colors & Directions
  const isPositive = avgPercentageChange > 0;
  const isNegative = avgPercentageChange < 0;

  const sign = isPositive ? "+" : "";
  const avgFormatted = `${sign}${avgPercentageChange.toFixed(2)}%`;
  const sumSign = sumOfPercentageChanges > 0 ? "+" : "";
  const sumFormatted = `${sumSign}${sumOfPercentageChanges.toFixed(2)}%`;
  const mcapSign = mcapWeightedPct > 0 ? "+" : "";
  const mcapFormatted = `${mcapSign}${mcapWeightedPct.toFixed(2)}%`;

  // Breadth bar percentage
  const advancePct = Math.round((advancingStocks.length / totalStocks) * 100);
  const declinePct = Math.round((decliningStocks.length / totalStocks) * 100);
  const neutralPct = 100 - advancePct - declinePct;

  return (
    <div
      id="jewellery-sector-summary-row"
      className={`rounded-2xl border transition-all duration-300 shadow-sm ${
        isPositive
          ? "bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-900/90 border-emerald-500/40 shadow-emerald-950/20"
          : isNegative
          ? "bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-slate-900/90 border-rose-500/40 shadow-rose-950/20"
          : "bg-slate-900/90 border-slate-800"
      } p-3.5`}
    >
      {/* Primary Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Sector Identity & Combined Percentage Movement */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isPositive
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                : isNegative
                ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-5 h-5 stroke-[2.4]" />
            ) : isNegative ? (
              <TrendingDown className="w-5 h-5 stroke-[2.4]" />
            ) : (
              <Minus className="w-5 h-5 stroke-[2.4]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 flex items-center gap-1">
                <Gem className="w-3 h-3 text-amber-400" />
                <span>Jewellery Basket Daily Movement</span>
              </span>
              <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {totalStocks} Jewellery Stocks
              </span>
              {filteredCount !== undefined && filteredCount < totalStocks && (
                <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {filteredCount} Filtered
                </span>
              )}
            </div>

            {/* Main Combined % Movement Figure */}
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`text-xl sm:text-2xl font-mono font-extrabold tabular-nums tracking-tight ${
                  isPositive
                    ? "text-emerald-400 drop-shadow-sm"
                    : isNegative
                    ? "text-rose-400 drop-shadow-sm"
                    : "text-white"
                }`}
                title={`Average Daily Change across all ${totalStocks} jewellery stocks`}
              >
                {avgFormatted}
              </span>

              <span className="text-xs font-mono font-medium text-slate-400">
                (Avg Combined)
              </span>

              {/* Cumulative Net Movement Pill */}
              <span
                className={`hidden xs:inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                  sumOfPercentageChanges >= 0
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                }`}
                title="Sum total of percentage movements across all jewellery stocks"
              >
                Σ {sumFormatted} Net
              </span>
            </div>
          </div>
        </div>

        {/* Right: Market Breadth & Action Details */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
          {/* Advances / Declines Pill */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold">{advancingStocks.length}</span>
              <span className="text-[10px] text-emerald-400/80">Up</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="font-bold">{decliningStocks.length}</span>
              <span className="text-[10px] text-rose-400/80">Down</span>
            </div>
            {neutralStocks.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400">
                <Minus className="w-3 h-3 text-slate-400" />
                <span className="font-bold">{neutralStocks.length}</span>
              </div>
            )}
          </div>

          {/* Sector Sentiment Trigger Button */}
          {onTriggerSentiment && (
            <button
              id="btn-summary-sector-sentiment"
              type="button"
              onClick={onTriggerSentiment}
              disabled={isAnalyzingSentiment}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-mono transition cursor-pointer disabled:opacity-50"
              title="Trigger Gemini Stock Sentiment Analysis for visible stocks"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isAnalyzingSentiment ? "animate-spin" : ""}`} />
              <span className="text-[11px] hidden sm:inline">
                {isAnalyzingSentiment ? "Analyzing..." : "Sentiment"}
              </span>
            </button>
          )}

          {/* Daily Performance 30D Chart Toggle Button */}
          {onToggleDailyChart && (
            <button
              id="btn-summary-toggle-daily-chart"
              type="button"
              onClick={onToggleDailyChart}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                showDailyChart
                  ? "bg-emerald-500/20 border-emerald-500/45 text-emerald-300 shadow-sm"
                  : "bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-300"
              }`}
              title="Toggle 30-Day Daily Performance Area Chart"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] hidden sm:inline">30D Chart</span>
            </button>
          )}

          {/* Toggle Deep Dive / Details Button */}
          <button
            onClick={() => setShowBreakdown(prev => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-mono transition"
            title="Toggle Detailed Sector Movement Breakdown"
            aria-expanded={showBreakdown}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] hidden sm:inline">Details</span>
            {showBreakdown ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Sector Breadth Ratio Bar */}
      <div className="mt-2.5 space-y-1">
        <div
          className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex"
          title={`Breadth: ${advancingStocks.length} Advancing (${advancePct}%), ${decliningStocks.length} Declining (${declinePct}%)`}
        >
          {advancePct > 0 && (
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${advancePct}%` }}
            />
          )}
          {neutralPct > 0 && (
            <div
              className="h-full bg-slate-600 transition-all duration-500"
              style={{ width: `${neutralPct}%` }}
            />
          )}
          {declinePct > 0 && (
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{ width: `${declinePct}%` }}
            />
          )}
        </div>
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 px-0.5">
          <span className="text-emerald-400/90 font-medium">
            {advancePct}% Advancing
          </span>
          <span className="text-slate-400">
            Combined Vol: {formatVolumeCompact(combinedVolume)}
          </span>
          <span className="text-rose-400/90 font-medium">
            {declinePct}% Declining
          </span>
        </div>
      </div>

      {/* Expandable Breakdown Drawer */}
      {showBreakdown && (
        <div className="mt-3 pt-3 border-t border-slate-800/90 space-y-2.5 animate-fadeIn">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {/* Metric 1: Equal-Weighted Combined Average */}
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                Equal-Weighted Avg
              </div>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  isPositive ? "text-emerald-400" : isNegative ? "text-rose-400" : "text-slate-300"
                }`}
              >
                {avgFormatted}
              </div>
              <div className="text-[9px] text-slate-500">Basket mean return</div>
            </div>

            {/* Metric 2: M-Cap Weighted Combined Return */}
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                M-Cap Weighted
              </div>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  mcapWeightedPct > 0
                    ? "text-emerald-400"
                    : mcapWeightedPct < 0
                    ? "text-rose-400"
                    : "text-slate-300"
                }`}
              >
                {mcapFormatted}
              </div>
              <div className="text-[9px] text-slate-500">Weighted by market cap</div>
            </div>

            {/* Metric 3: Top Gainer */}
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                Top Gainer
              </div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5 truncate">
                {topGainer?.name || "N/A"}
              </div>
              <div className="text-[10px] font-bold text-emerald-400 font-mono">
                {topGainer?.change_pct ? `+${topGainer.change_pct}%` : "—"}
              </div>
            </div>

            {/* Metric 4: Top Loser / Drag */}
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">
                Top Drag
              </div>
              <div className="text-xs font-bold text-rose-400 mt-0.5 truncate">
                {topLoser?.name || "N/A"}
              </div>
              <div className="text-[10px] font-bold text-rose-400 font-mono">
                {typeof topLoser?.change_pct === "number"
                  ? `${topLoser.change_pct > 0 ? "+" : ""}${topLoser.change_pct}%`
                  : "—"}
              </div>
            </div>
          </div>

          {/* Quick Mini Pills of All Tracked Jewellery Stocks */}
          <div>
            <div className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>All Jewellery Stocks Today</span>
              <span>Sorted by Performance</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sortedByPerf.map(stk => {
                const isStkPos = (stk.change_pct || 0) > 0;
                const isStkNeg = (stk.change_pct || 0) < 0;
                return (
                  <div
                    key={stk.symbol}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono border ${
                      isStkPos
                        ? "bg-emerald-950/30 text-emerald-300 border-emerald-500/30"
                        : isStkNeg
                        ? "bg-rose-950/30 text-rose-300 border-rose-500/30"
                        : "bg-slate-800/80 text-slate-300 border-slate-700"
                    }`}
                  >
                    <span className="font-medium text-slate-300 text-[11px]">
                      {stk.symbol.replace(".NS", "")}
                    </span>
                    <span
                      className={`font-bold text-[11px] ${
                        isStkPos
                          ? "text-emerald-400"
                          : isStkNeg
                          ? "text-rose-400"
                          : "text-slate-400"
                      }`}
                    >
                      {isStkPos ? "+" : ""}
                      {stk.change_pct?.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
