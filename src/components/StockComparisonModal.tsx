import React, { useState } from "react";
import { PreSurgeStock, ComparisonMetrics } from "../types";
import {
  Scale,
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BarChart2,
  Zap,
  ArrowRight
} from "lucide-react";

interface StockComparisonModalProps {
  stocks: PreSurgeStock[];
  initialStockA?: PreSurgeStock;
  initialStockB?: PreSurgeStock;
  onClose: () => void;
  onSelectStockDetail: (stock: PreSurgeStock) => void;
}

export const StockComparisonModal: React.FC<StockComparisonModalProps> = ({
  stocks,
  initialStockA,
  initialStockB,
  onClose,
  onSelectStockDetail
}) => {
  const [stockAId, setStockAId] = useState<string>(
    initialStockA?.symbol || stocks[0]?.symbol || "PCJEWELLER"
  );
  const [stockBId, setStockBId] = useState<string>(
    initialStockB?.symbol || (stocks[1] ? stocks[1].symbol : "KALYANKJIL")
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [customAiBrief, setCustomAiBrief] = useState<string | null>(null);

  const stockA = stocks.find((s) => s.symbol === stockAId) || stocks[0];
  const stockB = stocks.find((s) => s.symbol === stockBId) || stocks[1] || stocks[0];

  // Helper to determine relative winner for metrics
  const getWinner = (metricKey: string) => {
    if (!stockA || !stockB) return null;
    switch (metricKey) {
      case "volume":
        return stockA.vol_multiple > stockB.vol_multiple ? "A" : "B";
      case "delivery":
        return stockA.delivery_pct > stockB.delivery_pct ? "A" : "B";
      case "filters":
        return stockA.filters.matched_count > stockB.filters.matched_count ? "A" : "B";
      case "buy_depth":
        return stockA.market_depth.buy_pct > stockB.market_depth.buy_pct ? "A" : "B";
      case "pe":
        // Lower PE generally cheaper valuation
        return stockA.technicals.pe < stockB.technicals.pe ? "A" : "B";
      case "rsi":
        // Momentum closer to 60-65 sweet spot
        return Math.abs(stockA.technicals.rsi - 62) < Math.abs(stockB.technicals.rsi - 62) ? "A" : "B";
      default:
        return null;
    }
  };

  // Generate automated AI brief based on comparative metrics
  const generateComparativeBrief = () => {
    if (!stockA || !stockB) return "";

    const aSignals = stockA.filters.matched_count;
    const bSignals = stockB.filters.matched_count;

    const strongerSymbol =
      aSignals > bSignals
        ? stockA.symbol
        : bSignals > aSignals
        ? stockB.symbol
        : stockA.vol_multiple > stockB.vol_multiple
        ? stockA.symbol
        : stockB.symbol;

    const strongerStock = strongerSymbol === stockA.symbol ? stockA : stockB;
    const secondStock = strongerSymbol === stockA.symbol ? stockB : stockA;

    return `Comparative Relative Strength Analysis:
• Winner: ${strongerStock.symbol} (${strongerStock.name}) demonstrates superior immediate BTST relative strength with ${strongerStock.vol_multiple}x 20-day volume expansion and ${strongerStock.filters.matched_count}/4 Pre-Surge filters triggered.
• Institutional Footprint: ${strongerStock.symbol} shows institutional accumulation via ${strongerStock.reason_tag} and a high delivery ratio of ${(strongerStock.delivery_pct ?? 0).toFixed(1)}%.
• Risk/Reward Profile: While ${secondStock.symbol} offers more established valuation metrics (P/E: ${(secondStock.technicals?.pe ?? 0).toFixed(1)}x vs ${(strongerStock.technicals?.pe ?? 0).toFixed(1)}x), ${strongerStock.symbol} is positioned closer to an immediate 20-40% breakout velocity due to aggressive order absorption and news catalyst momentum (${strongerStock.filters.filter_a_detail.slice(0, 70)}...).`;
  };

  const handleRunAiAnalysis = async () => {
    setIsGeneratingAI(true);
    setCustomAiBrief(null);
    try {
      // Optional call to server API or fallback to rule-based engine
      const res = await fetch("/api/compare-stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbolA: stockA.symbol,
          symbolB: stockB.symbol,
          metricsA: {
            price: stockA.price,
            volMultiple: stockA.vol_multiple,
            deliveryPct: stockA.delivery_pct,
            rsi: stockA.technicals.rsi,
            pe: stockA.technicals.pe,
            reason: stockA.reason_tag
          },
          metricsB: {
            price: stockB.price,
            volMultiple: stockB.vol_multiple,
            deliveryPct: stockB.delivery_pct,
            rsi: stockB.technicals.rsi,
            pe: stockB.technicals.pe,
            reason: stockB.reason_tag
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.brief) {
          setCustomAiBrief(data.brief);
          setIsGeneratingAI(false);
          return;
        }
      }
    } catch (e) {
      // Graceful fallback to client comparative engine
    }

    setTimeout(() => {
      setCustomAiBrief(generateComparativeBrief());
      setIsGeneratingAI(false);
    }, 600);
  };

  const activeAiBrief = customAiBrief || generateComparativeBrief();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0F141F] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/90 flex items-center justify-between gap-4 bg-[#121824]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Side-by-Side Stock Comparison</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                  AI Relative Strength
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Contrast pre-surge signals, volume multiple, delivery percentage, RSI, and valuation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Stock Selectors Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stock A Selector */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                Primary Stock (A)
              </label>
              <select
                value={stockAId}
                onChange={(e) => setStockAId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm outline-none focus:border-amber-500"
              >
                {stocks.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} - {s.name} (₹{(s.price ?? 0).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Stock B Selector */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
                Benchmark / Counter Stock (B)
              </label>
              <select
                value={stockBId}
                onChange={(e) => setStockBId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm outline-none focus:border-cyan-500"
              >
                {stocks.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} - {s.name} (₹{(s.price ?? 0).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Relative Strength Brief Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  AI Relative Strength & Momentum Verdict
                </h3>
              </div>

              <button
                onClick={handleRunAiAnalysis}
                disabled={isGeneratingAI}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 active:scale-95 transition disabled:opacity-50"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{isGeneratingAI ? "Analyzing..." : "Re-evaluate Relative Strength"}</span>
              </button>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              {activeAiBrief}
            </div>
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden">
            <div className="p-3 border-b border-slate-800 bg-[#121824] flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider">
                Head-to-Head Metric Comparison
              </span>
              <span className="text-[11px] text-slate-500">
                Green badges indicate superior metric strength
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs">
              {/* Header row */}
              <div className="grid grid-cols-3 p-3 bg-slate-950/40 font-bold text-slate-400">
                <span>Metric</span>
                <span className="text-center font-mono text-amber-300">{stockA.symbol}</span>
                <span className="text-center font-mono text-cyan-300">{stockB.symbol}</span>
              </div>

              {/* Price & CMP */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="text-slate-400 font-medium">Current Price (CMP)</span>
                <div className="text-center font-mono font-bold text-slate-100">
                  ₹{(stockA.price ?? 0).toFixed(2)}
                  <span className={`text-[11px] ml-1.5 ${stockA.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    ({stockA.change >= 0 ? "+" : ""}{((stockA.change_pct ?? stockA.changePct ?? 0)).toFixed(2)}%)
                  </span>
                </div>
                <div className="text-center font-mono font-bold text-slate-100">
                  ₹{(stockB.price ?? 0).toFixed(2)}
                  <span className={`text-[11px] ml-1.5 ${stockB.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    ({stockB.change >= 0 ? "+" : ""}{((stockB.change_pct ?? stockB.changePct ?? 0)).toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* Pre-Surge Signal Score */}
              <div className="grid grid-cols-3 p-3 items-center bg-slate-950/20">
                <span className="text-slate-400 font-medium">Pre-Surge Signals</span>
                <div className="text-center">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      getWinner("filters") === "A"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {stockA.filters.matched_count}/4 Filters
                  </span>
                </div>
                <div className="text-center">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      getWinner("filters") === "B"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {stockB.filters.matched_count}/4 Filters
                  </span>
                </div>
              </div>

              {/* Volume Multiple */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="text-slate-400 font-medium">Volume vs 20-Day Avg</span>
                <div className="text-center">
                  <span
                    className={`font-mono font-bold ${
                      getWinner("volume") === "A" ? "text-amber-400 text-sm font-black" : "text-slate-300"
                    }`}
                  >
                    {stockA.vol_multiple}x
                  </span>
                </div>
                <div className="text-center">
                  <span
                    className={`font-mono font-bold ${
                      getWinner("volume") === "B" ? "text-amber-400 text-sm font-black" : "text-slate-300"
                    }`}
                  >
                    {stockB.vol_multiple}x
                  </span>
                </div>
              </div>

              {/* Delivery % */}
              <div className="grid grid-cols-3 p-3 items-center bg-slate-950/20">
                <span className="text-slate-400 font-medium">Delivery %</span>
                <div className="text-center">
                  <span
                    className={`font-mono font-bold ${
                      getWinner("delivery") === "A" ? "text-emerald-400" : "text-slate-300"
                    }`}
                  >
                    {(stockA.delivery_pct ?? 0).toFixed(1)}%
                  </span>
                </div>
                <div className="text-center">
                  <span
                    className={`font-mono font-bold ${
                      getWinner("delivery") === "B" ? "text-emerald-400" : "text-slate-300"
                    }`}
                  >
                    {(stockB.delivery_pct ?? 0).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* RSI (14) */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="text-slate-400 font-medium">RSI (14) Momentum</span>
                <div className="text-center font-mono font-semibold text-slate-200">
                  {stockA.technicals?.rsi ?? 50}
                </div>
                <div className="text-center font-mono font-semibold text-slate-200">
                  {stockB.technicals?.rsi ?? 50}
                </div>
              </div>

              {/* P/E Ratio */}
              <div className="grid grid-cols-3 p-3 items-center bg-slate-950/20">
                <span className="text-slate-400 font-medium">P/E Ratio</span>
                <div className="text-center font-mono font-semibold text-slate-200">
                  {(stockA.technicals?.pe ?? 0).toFixed(1)}x
                </div>
                <div className="text-center font-mono font-semibold text-slate-200">
                  {(stockB.technicals?.pe ?? 0).toFixed(1)}x
                </div>
              </div>

              {/* Market Depth Ratio */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="text-slate-400 font-medium">Market Depth (Buy / Sell)</span>
                <div className="text-center font-mono text-[11px]">
                  <span className="text-emerald-400 font-bold">{(stockA.market_depth?.buy_pct ?? 50).toFixed(1)}%</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span className="text-rose-400 font-bold">{(stockA.market_depth?.sell_pct ?? 50).toFixed(1)}%</span>
                </div>
                <div className="text-center font-mono text-[11px]">
                  <span className="text-emerald-400 font-bold">{(stockB.market_depth?.buy_pct ?? 50).toFixed(1)}%</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span className="text-rose-400 font-bold">{(stockB.market_depth?.sell_pct ?? 50).toFixed(1)}%</span>
                </div>
              </div>

              {/* Reason Catalyst Tag */}
              <div className="grid grid-cols-3 p-3 items-center bg-slate-950/20">
                <span className="text-slate-400 font-medium">Primary Catalyst</span>
                <div className="text-center">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {stockA.reason_tag}
                  </span>
                </div>
                <div className="text-center">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {stockB.reason_tag}
                  </span>
                </div>
              </div>

              {/* Risk Level */}
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="text-slate-400 font-medium">Risk Assessment</span>
                <div className="text-center">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      stockA.risk_level === "Low"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : stockA.risk_level === "Medium"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {stockA.risk_level} Risk
                  </span>
                </div>
                <div className="text-center">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      stockB.risk_level === "Low"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : stockB.risk_level === "Medium"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {stockB.risk_level} Risk
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#121824] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onSelectStockDetail(stockA);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition"
          >
            Open {stockA.symbol} Details
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectStockDetail(stockB);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition"
          >
            Open {stockB.symbol} Details
          </button>
        </div>
      </div>
    </div>
  );
};
