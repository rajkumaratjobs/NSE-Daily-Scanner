import React from "react";
import { PreSurgeStock } from "../types";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  CheckCircle2,
  XCircle,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Scale,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface PreSurgeStockCardProps {
  stock: PreSurgeStock;
  onSelect: (stock: PreSurgeStock) => void;
  onCompareSelect?: (stock: PreSurgeStock) => void;
}

export const PreSurgeStockCard: React.FC<PreSurgeStockCardProps> = ({
  stock,
  onSelect,
  onCompareSelect
}) => {
  const isPositive = stock.change >= 0;

  return (
    <div
      id={`stock-card-${stock.symbol}`}
      className="group relative rounded-2xl bg-[#111722] hover:bg-[#141c2b] border border-slate-800/80 hover:border-amber-500/40 p-4 transition-all duration-200 shadow-lg shadow-black/40 flex flex-col justify-between"
    >
      {/* Card Header: Symbol, Name, Price, % Change */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-base sm:text-lg font-black text-slate-100 group-hover:text-amber-300 transition">
                {stock.symbol}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400">
                {stock.exchange}
              </span>
              {/* Reason Tag */}
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{stock.reason_tag}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{stock.name}</p>
          </div>

          {/* Price & Change */}
          <div className="text-right shrink-0">
            <div className="font-mono text-lg font-bold text-slate-100">
              ₹{(stock.price ?? 0).toFixed(2)}
            </div>
            <div
              className={`inline-flex items-center gap-0.5 font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                isPositive
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-rose-500/15 text-rose-400"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              <span>
                {isPositive ? "+" : ""}
                {(stock.change ?? 0).toFixed(2)} ({isPositive ? "+" : ""}
                {(stock.change_pct ?? stock.changePct ?? 0).toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* 4 Filters Score Banner */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Early Signal Score:</span>
            <div className="flex items-center gap-1">
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                  stock.filters.matched_count === 4
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                }`}
              >
                {stock.filters.matched_count}/4 Filters Matched
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {/* Filter A: News Catalyst */}
            <div
              className={`p-1.5 rounded-lg flex items-center gap-1.5 ${
                stock.filters.filter_a_news
                  ? "bg-emerald-950/40 border border-emerald-800/40 text-emerald-300"
                  : "bg-slate-800/40 border border-slate-800 text-slate-500"
              }`}
              title={stock.filters.filter_a_detail}
            >
              {stock.filters.filter_a_news ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              )}
              <span className="truncate font-medium">A: News Catalyst</span>
            </div>

            {/* Filter B: Volume & Delivery Spike */}
            <div
              className={`p-1.5 rounded-lg flex items-center gap-1.5 ${
                stock.filters.filter_b_volume_delivery
                  ? "bg-emerald-950/40 border border-emerald-800/40 text-emerald-300"
                  : "bg-slate-800/40 border border-slate-800 text-slate-500"
              }`}
              title={stock.filters.filter_b_detail}
            >
              {stock.filters.filter_b_volume_delivery ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              )}
              <span className="truncate font-medium">B: Vol {stock.vol_multiple}x & Del</span>
            </div>

            {/* Filter C: Bulk Deals */}
            <div
              className={`p-1.5 rounded-lg flex items-center gap-1.5 ${
                stock.filters.filter_c_bulk_deals
                  ? "bg-emerald-950/40 border border-emerald-800/40 text-emerald-300"
                  : "bg-slate-800/40 border border-slate-800 text-slate-500"
              }`}
              title={stock.filters.filter_c_detail}
            >
              {stock.filters.filter_c_bulk_deals ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              )}
              <span className="truncate font-medium">C: Bulk Deal Radar</span>
            </div>

            {/* Filter D: Price Action */}
            <div
              className={`p-1.5 rounded-lg flex items-center gap-1.5 ${
                stock.filters.filter_d_price_action
                  ? "bg-emerald-950/40 border border-emerald-800/40 text-emerald-300"
                  : "bg-slate-800/40 border border-slate-800 text-slate-500"
              }`}
              title={stock.filters.filter_d_detail}
            >
              {stock.filters.filter_d_price_action ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              )}
              <span className="truncate font-medium">D: Price Action Bounce</span>
            </div>
          </div>
        </div>

        {/* Primary Metrics Grid: Volume Multiple, Delivery %, 52W Low cushion */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Volume X</span>
            <span
              className={`font-mono text-sm font-bold ${
                stock.vol_multiple >= 3.0 ? "text-amber-400 font-extrabold" : "text-slate-200"
              }`}
            >
              {stock.vol_multiple}x
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Delivery %</span>
            <span
              className={`font-mono text-sm font-bold ${
                (stock.delivery_pct ?? 0) >= 60 ? "text-emerald-400" : "text-slate-200"
              }`}
            >
              {(stock.delivery_pct ?? 0).toFixed(1)}%
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">&gt; 52W Low</span>
            <span className="font-mono text-sm font-bold text-slate-200">
              +{(stock.pct_above_52w_low ?? 0).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Market Depth Visual Bar: Buy % vs Sell % */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-emerald-400 font-bold">
              BUY {(stock.market_depth?.buy_pct ?? 50).toFixed(1)}%
            </span>
            <span className="text-slate-400 text-[10px] font-sans font-medium">Market Depth</span>
            <span className="text-rose-400 font-bold">
              SELL {(stock.market_depth?.sell_pct ?? 50).toFixed(1)}%
            </span>
          </div>
          {/* Visual depth ratio bar */}
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${stock.market_depth.buy_pct}%` }}
              title={`Buy Orders: ${stock.market_depth.buy_pct}%`}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${stock.market_depth.sell_pct}%` }}
              title={`Sell Orders: ${stock.market_depth.sell_pct}%`}
            />
          </div>
        </div>

        {/* Recent Catalyst News Excerpt */}
        {stock.news && stock.news.length > 0 && (
          <div className="mt-3 text-[11px] text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/70">
            <span className="text-amber-400 font-semibold">{stock.news[0].source} ({stock.news[0].time_ago}):</span>{" "}
            <span className="text-slate-300 line-clamp-1">{stock.news[0].title}</span>
          </div>
        )}
      </div>

      {/* Card Action Row */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {onCompareSelect && (
          <button
            onClick={() => onCompareSelect(stock)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 flex items-center gap-1 active:scale-95 transition"
            title="Select this stock for comparison"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Compare</span>
          </button>
        )}

        <button
          onClick={() => onSelect(stock)}
          id={`btn-view-${stock.symbol}`}
          className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-bold shadow-sm shadow-amber-500/20 flex items-center justify-center gap-1 active:scale-95 transition"
        >
          <span>View Details & Charts</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
