import React from "react";
import { StockData } from "../types";
import {
  BellRing,
  TrendingUp,
  TrendingDown,
  Star,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface QuickSnapshotProps {
  stocks: StockData[];
  activeAlertsCount: number;
  watchlistCount: number;
  activeFilter?: string;
  onSelectFilter?: (filter: any) => void;
  onViewAlertsTab?: () => void;
  onToggleSectorChart?: () => void;
  className?: string;
}

export const QuickSnapshot: React.FC<QuickSnapshotProps> = ({
  stocks,
  activeAlertsCount,
  watchlistCount,
  activeFilter,
  onSelectFilter,
  onViewAlertsTab,
  onToggleSectorChart,
  className = ""
}) => {
  // Calculate Sector Gain/Loss
  const totalStocks = stocks.length;
  const sumOfPercentageChanges = stocks.reduce(
    (acc, s) => acc + (typeof s.change_pct === "number" ? s.change_pct : 0),
    0
  );
  const avgPercentageChange = totalStocks > 0 ? sumOfPercentageChanges / totalStocks : 0;
  const isSectorPositive = avgPercentageChange >= 0;

  // Breadth
  const advancingCount = stocks.filter(s => (s.change_pct || 0) > 0).length;
  const decliningCount = stocks.filter(s => (s.change_pct || 0) < 0).length;
  const neutralCount = totalStocks - advancingCount - decliningCount;

  // Formatted sector movement
  const sign = isSectorPositive ? "+" : "";
  const sectorGainLossFormatted = `${sign}${avgPercentageChange.toFixed(2)}%`;

  // Breakout & Target counts
  const targetBreachedCount = stocks.filter(s => s.alert_threshold?.breached).length;
  const breakoutCount = stocks.filter(s => s.alerts?.some(a => a.type === "BREAKOUT")).length;

  return (
    <div
      id="quick-snapshot-section"
      className={`rounded-2xl bg-gradient-to-b from-[#0F1420] to-[#0F1219] border border-slate-800/90 p-3.5 shadow-md shadow-black/20 ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono">
                Quick Snapshot
              </h2>
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">
              Live NSE jewellery market status & priority signals
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 hidden sm:inline-block">
          {totalStocks} Tracked Equities
        </span>
      </div>

      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* CARD 1: ACTIVE ALERTS */}
        <div
          id="snapshot-active-alerts-card"
          onClick={() => {
            if (targetBreachedCount > 0 && onSelectFilter) {
              onSelectFilter("TARGET_BREACHED");
            } else if (onSelectFilter) {
              onSelectFilter("BREAKOUT");
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectFilter && onSelectFilter("BREAKOUT");
            }
          }}
          className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group select-none ${
            activeAlertsCount > 0
              ? "bg-slate-900/90 hover:bg-slate-900 border-amber-500/40 hover:border-amber-400/80 shadow-sm"
              : "bg-slate-900/60 hover:bg-slate-900/80 border-slate-800 text-slate-400"
          } ${
            activeFilter === "BREAKOUT" || activeFilter === "TARGET_BREACHED"
              ? "ring-1 ring-amber-500/60 border-amber-500"
              : ""
          }`}
          title="Click to view triggered alerts and breakouts"
        >
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-all" />

          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Active Alerts
            </span>
            <div
              className={`p-1.5 rounded-lg border ${
                activeAlertsCount > 0
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-slate-800 text-slate-500 border-slate-700"
              }`}
            >
              <BellRing className={`w-3.5 h-3.5 ${activeAlertsCount > 0 ? "animate-bounce" : ""}`} />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-extrabold font-mono tabular-nums leading-tight ${
                activeAlertsCount > 0 ? "text-amber-400" : "text-slate-300"
              }`}
            >
              {activeAlertsCount}
            </span>
            <span className="text-[10.5px] font-mono text-slate-400">
              {activeAlertsCount === 1 ? "trigger" : "triggers"}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px] font-mono">
            <span className="text-slate-400 truncate">
              {targetBreachedCount > 0
                ? `${targetBreachedCount} price target hit`
                : breakoutCount > 0
                ? `${breakoutCount} volume breakouts`
                : "All systems nominal"}
            </span>
            <span className="text-amber-400/90 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-transform inline-flex items-center">
              View <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* CARD 2: CURRENT SECTOR GAIN/LOSS */}
        <div
          id="snapshot-sector-gain-loss-card"
          onClick={() => onToggleSectorChart && onToggleSectorChart()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleSectorChart && onToggleSectorChart();
            }
          }}
          className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group select-none ${
            isSectorPositive
              ? "bg-slate-900/90 hover:bg-slate-900 border-emerald-500/35 hover:border-emerald-400/70 shadow-sm"
              : "bg-slate-900/90 hover:bg-slate-900 border-rose-500/35 hover:border-rose-400/70 shadow-sm"
          }`}
          title="Click to toggle sector 30-day performance chart"
        >
          {/* Subtle glow accent */}
          <div
            className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-xl pointer-events-none transition-all ${
              isSectorPositive ? "bg-emerald-500/10 group-hover:bg-emerald-500/15" : "bg-rose-500/10 group-hover:bg-rose-500/15"
            }`}
          />

          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Sector Gain/Loss
            </span>
            <div
              className={`p-1.5 rounded-lg border ${
                isSectorPositive
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-400 border-rose-500/30"
              }`}
            >
              {isSectorPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-extrabold font-mono tabular-nums leading-tight ${
                isSectorPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {sectorGainLossFormatted}
            </span>
            <span
              className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-bold uppercase tracking-wider border ${
                isSectorPositive
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-300 border-rose-500/30"
              }`}
            >
              {isSectorPositive ? "Advancing" : "Declining"}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px] font-mono">
            <span className="text-slate-400">
              <strong className="text-emerald-400">{advancingCount} Up</strong> ·{" "}
              <strong className="text-rose-400">{decliningCount} Down</strong>
              {neutralCount > 0 && ` · ${neutralCount} Flat`}
            </span>
            <span
              className={`group-hover:translate-x-0.5 transition-transform inline-flex items-center ${
                isSectorPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              Chart <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* CARD 3: TOTAL STOCKS IN 'WATCHLIST' STATUS */}
        <div
          id="snapshot-watchlist-card"
          onClick={() => onSelectFilter && onSelectFilter(activeFilter === "WATCHLIST" ? "ALL" : "WATCHLIST")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectFilter && onSelectFilter(activeFilter === "WATCHLIST" ? "ALL" : "WATCHLIST");
            }
          }}
          className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group select-none ${
            watchlistCount > 0
              ? "bg-slate-900/90 hover:bg-slate-900 border-amber-500/40 hover:border-amber-400/80 shadow-sm"
              : "bg-slate-900/60 hover:bg-slate-900/80 border-slate-800 text-slate-400"
          } ${
            activeFilter === "WATCHLIST"
              ? "ring-2 ring-amber-400 border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10"
              : ""
          }`}
          title={
            activeFilter === "WATCHLIST"
              ? "Currently filtering by Watchlist. Click to show all stocks."
              : "Click to filter stocks by Watchlist status"
          }
        >
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-400/15 transition-all" />

          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Watchlist Status
            </span>
            <div
              className={`p-1.5 rounded-lg border ${
                watchlistCount > 0
                  ? "bg-amber-500/20 text-amber-400 border-amber-400/50"
                  : "bg-slate-800 text-slate-500 border-slate-700"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${watchlistCount > 0 ? "fill-amber-400 text-amber-400" : ""}`} />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono tabular-nums leading-tight text-white">
              {watchlistCount}
            </span>
            <span className="text-[10.5px] font-mono text-slate-400">
              {watchlistCount === 1 ? "stock pinned" : "stocks pinned"}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px] font-mono">
            <span className="text-slate-400 truncate">
              {activeFilter === "WATCHLIST" ? (
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-amber-400" /> Filter Active
                </span>
              ) : (
                `${watchlistCount} in active watch`
              )}
            </span>
            <span className="text-amber-400/90 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-transform inline-flex items-center font-bold">
              {activeFilter === "WATCHLIST" ? "Show All" : "Filter"} <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
