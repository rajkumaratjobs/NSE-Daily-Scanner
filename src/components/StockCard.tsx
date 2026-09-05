import React from "react";
import { StockData } from "../types";
import { TrendingUp, TrendingDown, Sparkles, Activity, ShieldAlert, BarChart3, Gem } from "lucide-react";

interface StockCardProps {
  stock: StockData;
  index: number;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, index }) => {
  const isPositive = stock.change_pct >= 0;
  const hasAlerts = stock.alerts && stock.alerts.length > 0;

  // AI Verdict tone
  const verdict = stock.ai_verdict || "Evaluating...";
  const isBuy = verdict.toLowerCase().startsWith("buy");
  const isSell = verdict.toLowerCase().startsWith("sell");

  return (
    <div
      id={`stock-card-${stock.symbol.replace(/[^a-zA-Z0-9]/g, "-")}`}
      className={`rounded-lg p-3 transition-all border ${
        hasAlerts
          ? "bg-[#0F1219] border-amber-500/40 shadow-md shadow-amber-500/5 hover:border-amber-400"
          : "bg-[#0F1219] border-slate-800 hover:border-slate-700"
      }`}
    >
      {/* Top row: Name, Symbol, and Price */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500">#{index + 1}</span>
            <h3 className="font-semibold text-slate-100 text-sm leading-snug">
              {stock.name}
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400/90 font-medium border border-slate-700">
              {stock.symbol}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <a
              href={`https://www.screener.in/company/${stock.screener_slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-sky-400 hover:text-sky-300 underline underline-offset-2 flex items-center gap-1"
            >
              screener.in/{stock.screener_slug}
            </a>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-base font-bold font-mono text-white tabular-nums">
            ₹{stock.price.toLocaleString("en-IN")}
          </div>
          <div
            className={`inline-flex items-center gap-1 text-xs font-semibold font-mono tabular-nums ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>
              {isPositive ? "+" : ""}
              {stock.change_pct}%
            </span>
          </div>
        </div>
      </div>

      {/* Alert Badges */}
      {hasAlerts && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {stock.alerts.map((alert, idx) => {
            let badgeClass = "bg-amber-500/10 text-amber-300 border-amber-500/30";
            let IconComponent = ShieldAlert;
            if (alert.type === "BREAKOUT") {
              badgeClass = "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
              IconComponent = Activity;
            } else if (alert.type === "RESULTS") {
              badgeClass = "bg-sky-500/10 text-sky-300 border-sky-500/30";
              IconComponent = BarChart3;
            } else if (alert.type === "VALUE") {
              badgeClass = "bg-purple-500/10 text-purple-300 border-purple-500/30";
              IconComponent = Gem;
            }

            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${badgeClass}`}
              >
                <IconComponent className="w-3 h-3" />
                {alert.badge}
              </span>
            );
          })}
        </div>
      )}

      {/* Alert descriptions detail if triggered */}
      {hasAlerts && (
        <div className="mt-2 p-2 rounded bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans">
          {stock.alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold">•</span>
              <span>{a.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* High Density Metrics Grid */}
      <div className="mt-2.5 grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-xs">
        <div className="p-1.5 rounded bg-slate-900/50 border border-slate-800">
          <div className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">200 DMA</div>
          <div className={`font-mono tabular-nums text-xs font-medium mt-0.5 ${stock.price > stock.dma_200 ? "text-emerald-400" : "text-slate-300"}`}>
            ₹{stock.dma_200}
          </div>
        </div>

        <div className="p-1.5 rounded bg-slate-900/50 border border-slate-800">
          <div className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">20D Vol</div>
          <div className={`font-mono tabular-nums text-xs font-medium mt-0.5 ${stock.vol_multiple >= 2.0 ? "text-emerald-400 font-bold" : "text-slate-300"}`}>
            {stock.vol_multiple}x
          </div>
        </div>

        <div className="p-1.5 rounded bg-slate-900/50 border border-slate-800">
          <div className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">P/E</div>
          <div className={`font-mono tabular-nums text-xs font-medium mt-0.5 ${stock.pe > 0 && stock.pe < 15 ? "text-purple-400 font-bold" : "text-slate-300"}`}>
            {stock.pe || "N/A"}
          </div>
        </div>

        <div className="p-1.5 rounded bg-slate-900/50 border border-slate-800">
          <div className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">ROE</div>
          <div className={`font-mono tabular-nums text-xs font-medium mt-0.5 ${stock.roe_pct > 15 ? "text-purple-400 font-bold" : "text-slate-300"}`}>
            {stock.roe_pct}%
          </div>
        </div>

        <div className="p-1.5 rounded bg-slate-900/50 border border-slate-800">
          <div className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">D/E</div>
          <div className={`font-mono tabular-nums text-xs font-medium mt-0.5 ${stock.debt_to_equity < 0.5 ? "text-purple-400 font-bold" : "text-slate-300"}`}>
            {stock.debt_to_equity}
          </div>
        </div>

        <div className="p-1.5 rounded bg-slate-900/50 border border-slate-800">
          <div className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Sales YoY</div>
          <div className={`font-mono tabular-nums text-xs font-medium mt-0.5 ${stock.sales_growth_yoy >= 15 ? "text-sky-400 font-bold" : "text-slate-300"}`}>
            +{stock.sales_growth_yoy}%
          </div>
        </div>
      </div>

      {/* Gemini 2.5 Flash AI Verdict */}
      <div className="mt-2.5 p-2 rounded bg-slate-900/40 border border-slate-800/80 flex items-start gap-2">
        <div className="p-1 rounded bg-amber-500/10 text-amber-400 mt-0.5 shrink-0">
          <Sparkles className="w-3 h-3" />
        </div>
        <div className="text-xs leading-relaxed flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] uppercase font-bold font-mono tracking-wider text-amber-400">
              Gemini 2.5 Flash Verdict
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${
                isBuy
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : isSell
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {isBuy ? "BUY" : isSell ? "SELL" : "HOLD"}
            </span>
          </div>
          <p className="text-slate-300 text-[11px] font-sans italic">{verdict}</p>
        </div>
      </div>
    </div>
  );
};
