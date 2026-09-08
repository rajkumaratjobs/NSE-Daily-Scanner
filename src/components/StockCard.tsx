import React, { useState } from "react";
import { StockData } from "../types";
import { StockSparkline } from "./StockSparkline";
import { calculateRSI } from "../utils/rsi";
import { calculateVolatility } from "../utils/volatility";
import { FinancialRatiosExpanded } from "./FinancialRatiosExpanded";
import { SetAlertModal } from "./SetAlertModal";
import { VolumeSpikeIndicator, formatVolumeCompact } from "./VolumeSpikeIndicator";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Activity,
  ShieldAlert,
  BarChart3,
  Gem,
  RotateCw,
  Minus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  Scale,
  Bell,
  BellPlus,
  BellRing,
  Flame,
  Zap
} from "lucide-react";

interface StockCardProps {
  stock: StockData;
  index: number;
  onUpdateStock?: (updatedStock: StockData) => void;
  onTriggerNotification?: (title: string, message: string, stock: StockData) => void;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, index, onUpdateStock, onTriggerNotification }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const isPositive = stock.change_pct >= 0;
  const hasAlerts = stock.alerts && stock.alerts.length > 0;
  const rsi = calculateRSI(stock);
  const volatility = calculateVolatility(stock);

  // Volume as a percentage of 20-day average volume & 2x spike detection
  const volMultiple =
    typeof stock.vol_multiple === "number" && stock.vol_multiple > 0
      ? stock.vol_multiple
      : stock.avg_vol_20d > 0
      ? stock.volume / stock.avg_vol_20d
      : 1.0;
  const volumePct = Math.round(volMultiple * 100);
  const isVolumeSpike = volMultiple >= 2.0 || volumePct >= 200;

  // Determine normalized AI action (BUY, HOLD, SELL)
  const normalizedAction: "BUY" | "SELL" | "HOLD" = stock.ai_action || (() => {
    const v = (stock.ai_verdict || "").toLowerCase();
    if (v.startsWith("buy")) return "BUY";
    if (v.startsWith("sell")) return "SELL";
    return "HOLD";
  })();

  const verdictText = stock.ai_verdict || (
    normalizedAction === "BUY"
      ? "Buy: Strong technical setup confirmed by solid fundamental metrics."
      : normalizedAction === "SELL"
      ? "Sell: Unfavorable valuation multiple and balance sheet leverage."
      : "Hold: Trading within fair value zone with neutral momentum."
  );

  const confidence = stock.ai_confidence || (normalizedAction === "BUY" ? 88 : normalizedAction === "SELL" ? 82 : 75);

  // Styling configurations for the 3 verdict states
  const actionConfig = {
    BUY: {
      label: "BUY",
      bgColor: "bg-emerald-500/15",
      borderColor: "border-emerald-500/40",
      textColor: "text-emerald-300",
      badgeColor: "bg-emerald-500 text-slate-950 font-extrabold",
      pillBorder: "border-emerald-400/50",
      dotColor: "bg-emerald-400",
      glowClass: "shadow-emerald-950/20",
      cardBorder: "hover:border-emerald-500/50",
      Icon: TrendingUp,
      statusLabel: "Bullish Outlook"
    },
    HOLD: {
      label: "HOLD",
      bgColor: "bg-amber-500/15",
      borderColor: "border-amber-500/40",
      textColor: "text-amber-300",
      badgeColor: "bg-amber-500 text-slate-950 font-extrabold",
      pillBorder: "border-amber-400/50",
      dotColor: "bg-amber-400",
      glowClass: "shadow-amber-950/20",
      cardBorder: "hover:border-amber-500/50",
      Icon: Minus,
      statusLabel: "Neutral / Accumulate"
    },
    SELL: {
      label: "SELL",
      bgColor: "bg-rose-500/15",
      borderColor: "border-rose-500/40",
      textColor: "text-rose-300",
      badgeColor: "bg-rose-500 text-white font-extrabold",
      pillBorder: "border-rose-400/50",
      dotColor: "bg-rose-400",
      glowClass: "shadow-rose-950/20",
      cardBorder: "hover:border-rose-500/50",
      Icon: TrendingDown,
      statusLabel: "Elevated Risk"
    }
  }[normalizedAction];

  const handleRefreshVerdict = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/stocks/${stock.symbol}/verdict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: true })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stock && onUpdateStock) {
          onUpdateStock(data.stock);
        }
      }
    } catch (err) {
      console.error("Failed to re-analyze stock with Gemini:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div
      id={`stock-card-${stock.symbol.replace(/[^a-zA-Z0-9]/g, "-")}`}
      onClick={() => setIsExpanded((prev) => !prev)}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsExpanded((prev) => !prev);
        }
      }}
      className={`rounded-2xl p-3.5 transition-all border cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 ${
        isExpanded
          ? "bg-[#0F1420] border-amber-500/60 ring-1 ring-amber-500/40 shadow-xl shadow-black/70"
          : hasAlerts
          ? "bg-[#0F1219] border-amber-500/30 hover:border-amber-500/50 shadow-lg shadow-black/40"
          : "bg-[#0F1219] border-slate-800 hover:border-slate-700 shadow-md shadow-black/20"
      } ${actionConfig.cardBorder}`}
    >
      {/* Top Breached Banner if User-Defined Price Target was hit */}
      {stock.alert_threshold?.breached && (
        <div className="mb-2.5 p-2 rounded-xl bg-gradient-to-r from-rose-950/80 to-rose-900/40 border border-rose-500/60 text-rose-200 text-xs flex items-center justify-between gap-2 shadow-lg shadow-rose-950/40 animate-pulse">
          <div className="flex items-center gap-2 font-mono">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-bold text-rose-200">PRICE TARGET BREACHED:</span>
            <span className="text-slate-200">
              ₹{stock.price} hit threshold level of ₹{stock.alert_threshold.targetPrice}
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 font-bold border border-rose-500/50 shrink-0">
            {stock.alert_threshold.condition === "ABOVE" ? "Upside ≥" : "Floor ≤"}
          </span>
        </div>
      )}

      {/* Top row: Name, Symbol, Screener Link, AI Verdict Indicator Pill & Price */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500">#{index + 1}</span>
            <h3 className="font-semibold text-slate-100 text-sm tracking-tight truncate">
              {stock.name}
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-medium border border-slate-700 shrink-0">
              {stock.symbol}
            </span>

            {/* Prominent Color-Coded AI Verdict Pill next to Stock Symbol */}
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm ${actionConfig.bgColor} ${actionConfig.textColor} ${actionConfig.pillBorder}`}
              title={`Gemini AI Analysis: ${actionConfig.label} (${confidence}% conviction)`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${actionConfig.dotColor} animate-pulse`} />
              <span>{actionConfig.label}</span>
              <span className="text-[9px] opacity-75 font-normal">({confidence}%)</span>
            </div>

            {/* Small Color-Coded Volatility Indicator Tag */}
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight border shadow-xs transition-all ${volatility.colors.bg} ${volatility.colors.text} ${volatility.colors.pillBorder}`}
              title={`${volatility.description} 5-Day Price Range: ${volatility.range5dPct.toFixed(1)}%.`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${volatility.colors.dotColor} ${volatility.isHighRisk ? "animate-ping" : ""}`} />
              <span className="font-extrabold">{volatility.level === "HIGH" ? "High Risk" : volatility.level === "LOW" ? "Low Vol" : "Med Vol"}</span>
              <span className="text-[9px] opacity-85 font-mono font-normal">ATR {volatility.atrPct.toFixed(1)}%</span>
            </div>

            {/* Deeper Financial Ratios Indicator Pill & Quick Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border transition-all ${
                isExpanded
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm"
                  : "bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border-slate-700"
              }`}
              title={
                isExpanded
                  ? "Click to collapse deeper financial ratios"
                  : "Click to expand deeper financial ratios (D/E, ROE, PE, ROCE)"
              }
            >
              <Scale className="w-3 h-3 text-amber-400" />
              <span>{isExpanded ? "Ratios Open" : "Ratios"}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* User-Defined Price Target Alert Badge */}
            {stock.alert_threshold?.enabled && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAlertModalOpen(true);
                }}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  stock.alert_threshold.breached
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse shadow-sm shadow-rose-950"
                    : "bg-slate-800/90 text-amber-300 border-amber-500/40 hover:border-amber-400"
                }`}
                title={
                  stock.alert_threshold.breached
                    ? `TARGET BREACHED: Price ₹${stock.price} hit target ₹${stock.alert_threshold.targetPrice}! Click to modify.`
                    : `Active price target set at ₹${stock.alert_threshold.targetPrice}. Click to modify.`
                }
              >
                {stock.alert_threshold.breached ? (
                  <BellRing className="w-3 h-3 text-rose-400" />
                ) : (
                  <Bell className="w-3 h-3 text-amber-400" />
                )}
                <span>
                  {stock.alert_threshold.breached ? "Target Hit" : "Target"}: ₹
                  {stock.alert_threshold.targetPrice}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <a
              href={`https://www.screener.in/company/${stock.screener_slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] font-mono text-sky-400 hover:text-sky-300 underline underline-offset-2 inline-flex items-center gap-1"
            >
              <span>screener.in/{stock.screener_slug}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            {stock.screener_headline && (
              <span className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                • {stock.screener_headline}
              </span>
            )}
          </div>
        </div>

        {/* Price & Day Change */}
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

      {/* Alert Badges & Overbought/Oversold Indicators & Volume Spike Badges */}
      {(hasAlerts || rsi.isOverbought || rsi.isOversold || isVolumeSpike || volatility.isHighRisk) && (
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

          {/* Explicit High Volatility Risk Alert Tag for high-risk stocks */}
          {volatility.isHighRisk && (
            <span
              key="vol-high-risk-badge"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold border bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-xs shadow-rose-950"
              title={volatility.description}
            >
              <Flame className="w-3 h-3 text-rose-400" />
              <span>High Volatility (ATR {volatility.atrPct.toFixed(1)}% · ₹{volatility.atr.toFixed(2)})</span>
            </span>
          )}

          {/* Explicit Red Volume Spike Alert Tag if Day Volume > 2x 20D Avg */}
          {isVolumeSpike && (
            <span
              key="vol-spike-tag"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold border bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-sm shadow-rose-950 animate-pulse"
              title={`Volume Spike: Day volume is ${volumePct}% of 20-day average (${volMultiple.toFixed(2)}x > 2x threshold)`}
            >
              <Zap className="w-3 h-3 text-rose-400 fill-rose-400" />
              <span>Volume Spike ({volumePct}%)</span>
            </span>
          )}

          {/* Explicit RSI Overbought / Oversold Alert Tag */}
          {rsi.isOverbought && (
            <span
              key="rsi-overbought"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold border bg-rose-500/15 text-rose-300 border-rose-500/40"
              title={rsi.tip}
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>RSI Overbought ({rsi.value.toFixed(1)})</span>
            </span>
          )}

          {rsi.isOversold && (
            <span
              key="rsi-oversold"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold border bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
              title={rsi.tip}
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>RSI Oversold ({rsi.value.toFixed(1)})</span>
            </span>
          )}
        </div>
      )}

      {/* Alert descriptions detail if triggered, RSI Extreme, or Volume Spike */}
      {(hasAlerts || rsi.isOverbought || rsi.isOversold || isVolumeSpike || volatility.isHighRisk) && (
        <div className="mt-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans space-y-1">
          {stock.alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold">•</span>
              <span>{a.description}</span>
            </div>
          ))}
          {volatility.isHighRisk && (
            <div className="flex items-start gap-1.5 text-rose-300/90 font-mono text-[10.5px]">
              <span className="text-rose-400 font-bold">•</span>
              <span>
                <strong>High Volatility Alert (ATR ₹{volatility.atr.toFixed(2)} / {volatility.atrPct.toFixed(1)}%):</strong> 5-day price range is {volatility.range5dPct.toFixed(1)}%. Large swings indicate elevated downside risk.
              </span>
            </div>
          )}
          {isVolumeSpike && (
            <div className="flex items-start gap-1.5 text-rose-300/90 font-mono text-[10.5px]">
              <span className="text-rose-400 font-bold">•</span>
              <span>
                <strong>Volume Spike ({volumePct}% of 20D Avg):</strong> Current session volume ({formatVolumeCompact(stock.volume)}) is {volMultiple.toFixed(2)}x the 20-day average ({formatVolumeCompact(stock.avg_vol_20d)}), exceeding the 2x surge threshold.
              </span>
            </div>
          )}
          {rsi.isOverbought && (
            <div className="flex items-start gap-1.5 text-rose-300/90 font-mono text-[10.5px]">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Overbought RSI ({rsi.value.toFixed(1)} &gt; 70):</strong> {rsi.tip}</span>
            </div>
          )}
          {rsi.isOversold && (
            <div className="flex items-start gap-1.5 text-emerald-300/90 font-mono text-[10.5px]">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Oversold RSI ({rsi.value.toFixed(1)} &lt; 30):</strong> {rsi.tip}</span>
            </div>
          )}
        </div>
      )}

      {/* Mini 5-Day Historical Trend Sparkline (Recharts) */}
      <StockSparkline
        history={stock.history_5d}
        currentPrice={stock.price}
        changePct={stock.change_pct}
        symbol={stock.symbol}
      />

      {/* Visual Volume Indicator: Day Volume as % of 20-Day Average Volume */}
      <div className="mt-2.5">
        <VolumeSpikeIndicator
          volume={stock.volume}
          avgVol20d={stock.avg_vol_20d}
          volMultiple={volMultiple}
        />
      </div>

      {/* High Density Metrics Grid (Technicals & Fundamentals) */}
      <div className="mt-2.5 grid grid-cols-3 sm:grid-cols-7 gap-1.5 text-center text-xs">
        {/* Technical Indicator 1: 200 DMA */}
        <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">200 DMA</div>
          <div
            className={`font-mono tabular-nums text-xs font-medium mt-0.5 ${
              stock.price > stock.dma_200 ? "text-emerald-400 font-semibold" : "text-slate-300"
            }`}
          >
            ₹{stock.dma_200}
          </div>
          <div className="text-[8px] font-mono text-slate-500 mt-0.5">
            {stock.price > stock.dma_200 ? "Above" : "Below"}
          </div>
        </div>

        {/* Technical Indicator 2: 20D Vol % with Red Highlight on Volume Spike */}
        <div
          className={`p-1.5 rounded-xl border transition-all ${
            isVolumeSpike
              ? "bg-rose-950/30 border-rose-500/60 shadow-sm shadow-rose-950/40 ring-1 ring-rose-500/30"
              : "bg-slate-900/60 border-slate-800"
          }`}
          title={`20D Vol: ${volumePct}% of 20D Average (${volMultiple.toFixed(2)}x)${
            isVolumeSpike ? " • VOLUME SPIKE EXCEEDS 2X" : ""
          }`}
        >
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">20D Vol</span>
            {isVolumeSpike && (
              <span className="text-[7px] font-mono px-1 py-0.2 rounded font-bold uppercase tracking-tight bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                Spike
              </span>
            )}
          </div>
          <div
            className={`font-mono tabular-nums text-xs font-bold mt-0.5 ${
              isVolumeSpike ? "text-rose-400 font-extrabold" : "text-slate-300"
            }`}
          >
            {volumePct}%
          </div>
          <div
            className={`text-[8px] font-mono mt-0.5 truncate ${
              isVolumeSpike ? "text-rose-400 font-bold" : "text-slate-500"
            }`}
          >
            {volMultiple.toFixed(1)}x {isVolumeSpike ? "Spike" : "Norm"}
          </div>
        </div>

        {/* Technical Indicator 3: 14D RSI (Overbought / Oversold Detection) */}
        <div
          className={`p-1.5 rounded-xl border transition-all ${
            rsi.isOverbought
              ? "bg-rose-950/25 border-rose-500/50 shadow-sm shadow-rose-950/40"
              : rsi.isOversold
              ? "bg-emerald-950/25 border-emerald-500/50 shadow-sm shadow-emerald-950/40"
              : "bg-slate-900/60 border-slate-800"
          }`}
          title={`14-Day RSI: ${rsi.value.toFixed(1)} (${rsi.condition})\n${rsi.tip}`}
        >
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider font-semibold">14D RSI</span>
            <span
              className={`text-[7px] font-mono px-1 py-0.2 rounded font-bold uppercase tracking-tight border ${rsi.badgeClass}`}
            >
              {rsi.badgeText}
            </span>
          </div>

          <div className={`font-mono tabular-nums text-xs font-bold mt-0.5 ${rsi.textColor}`}>
            {rsi.value.toFixed(1)}
          </div>

          {/* Micro Tri-Zone Visual Scale: [0-30 OS] | [30-70 Neutral] | [70-100 OB] */}
          <div
            className="mt-1 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden relative"
            title={`RSI: ${rsi.value.toFixed(1)}/100`}
          >
            <div className="absolute left-0 w-[30%] h-full bg-emerald-500/40" title="Oversold (<30)" />
            <div className="absolute left-[30%] w-[40%] h-full bg-slate-700/40" title="Neutral (30-70)" />
            <div className="absolute right-0 w-[30%] h-full bg-rose-500/40" title="Overbought (>70)" />
            <div
              className="absolute top-0 bottom-0 w-1.5 -ml-0.75 rounded-full bg-white shadow-sm ring-1 ring-black/30"
              style={{ left: `${Math.min(97, Math.max(3, rsi.value))}%` }}
            />
          </div>

          <div className={`text-[8px] font-mono mt-0.5 truncate font-medium ${rsi.textColor}`}>
            {rsi.condition}
          </div>
        </div>

        {/* Fundamental Indicator 1: P/E Ratio */}
        <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">P/E Ratio</div>
          <div
            className={`font-mono tabular-nums text-xs font-medium mt-0.5 ${
              stock.pe > 0 && stock.pe < 15 ? "text-purple-400 font-bold" : "text-slate-300"
            }`}
          >
            {stock.pe || "N/A"}
          </div>
          <div className="text-[8px] font-mono text-slate-500 mt-0.5">
            {stock.pe < 15 ? "Value" : stock.pe > 60 ? "Rich" : "Fair"}
          </div>
        </div>

        {/* Fundamental Indicator 2: ROE */}
        <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">ROE</div>
          <div
            className={`font-mono tabular-nums text-xs font-medium mt-0.5 ${
              stock.roe_pct >= 15 ? "text-purple-400 font-bold" : "text-slate-300"
            }`}
          >
            {stock.roe_pct}%
          </div>
          <div className="text-[8px] font-mono text-slate-500 mt-0.5">
            {stock.roe_pct >= 15 ? "High" : "Modest"}
          </div>
        </div>

        {/* Fundamental Indicator 3: D/E Ratio */}
        <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">D/E Ratio</div>
          <div
            className={`font-mono tabular-nums text-xs font-medium mt-0.5 ${
              stock.debt_to_equity < 0.5
                ? "text-emerald-400 font-bold"
                : stock.debt_to_equity > 1.0
                ? "text-rose-400 font-bold"
                : "text-slate-300"
            }`}
          >
            {stock.debt_to_equity}x
          </div>
          <div className="text-[8px] font-mono text-slate-500 mt-0.5">
            {stock.debt_to_equity < 0.5 ? "Low Debt" : stock.debt_to_equity > 1.0 ? "High Debt" : "Manageable"}
          </div>
        </div>

        {/* Fundamental Indicator 4: Sales YoY */}
        <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Sales YoY</div>
          <div
            className={`font-mono tabular-nums text-xs font-medium mt-0.5 ${
              stock.sales_growth_yoy >= 15 ? "text-sky-400 font-bold" : "text-slate-300"
            }`}
          >
            +{stock.sales_growth_yoy}%
          </div>
          <div className="text-[8px] font-mono text-slate-500 mt-0.5">
            {stock.sales_growth_yoy >= 15 ? "Strong" : "Steady"}
          </div>
        </div>
      </div>

      {/* Interactive Click-to-Expand Bar for Alert Threshold & Financial Ratios */}
      <div
        className={`mt-2.5 p-2 rounded-xl border flex items-center justify-between transition-all ${
          isExpanded
            ? "bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm"
            : "bg-slate-900/50 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`p-1 rounded-md ${
              isExpanded
                ? "bg-amber-500/20 text-amber-400"
                : stock.alert_threshold?.breached
                ? "bg-rose-500/20 text-rose-400 animate-pulse"
                : stock.alert_threshold?.enabled
                ? "bg-amber-500/20 text-amber-400"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {stock.alert_threshold?.breached ? (
              <BellRing className="w-3.5 h-3.5 text-rose-400" />
            ) : stock.alert_threshold?.enabled ? (
              <Bell className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Scale className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="text-[11px] font-mono font-medium">
            {isExpanded
              ? "Alert Threshold & Financial Ratios (Expanded)"
              : stock.alert_threshold?.enabled
              ? `Target: ₹${stock.alert_threshold.targetPrice} (${stock.alert_threshold.breached ? "HIT!" : "Active"}) • Click to edit`
              : "Click card to set Alert Threshold & view financial ratios"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-semibold text-amber-400">
          <span>{isExpanded ? "Collapse View" : "Expand Ratios & Alert"}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Expandable Section: Custom Price Alert & Deeper Financial Ratios */}
      {isExpanded && (
        <div className="mt-2.5 space-y-2.5" onClick={(e) => e.stopPropagation()}>
          {/* Custom Price Alert Card with prominent "Add Alert" Trigger Button */}
          <div
            id={`alert-card-section-${stock.symbol.replace(/[^a-zA-Z0-9]/g, "-")}`}
            className="p-3 rounded-xl bg-gradient-to-r from-slate-900/95 via-slate-900 to-slate-950/95 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-2 rounded-xl border shrink-0 ${
                  stock.alert_threshold?.breached
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                    : stock.alert_threshold?.enabled
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : "bg-slate-800/80 text-slate-400 border-slate-700"
                }`}
              >
                {stock.alert_threshold?.breached ? (
                  <BellRing className="w-4 h-4 text-rose-400" />
                ) : stock.alert_threshold?.enabled ? (
                  <Bell className="w-4 h-4 text-amber-400" />
                ) : (
                  <BellPlus className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-200 font-mono">
                    Custom Price Alert
                  </span>
                  {stock.alert_threshold?.enabled ? (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                        stock.alert_threshold.breached
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                          : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {stock.alert_threshold.breached ? "TARGET BREACHED" : "ARMED IN CONFIG"}
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      NO ALERT CONFIGURED
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono truncate">
                  {stock.alert_threshold?.enabled ? (
                    <span>
                      Target: <strong className="text-amber-300 font-bold">₹{stock.alert_threshold.targetPrice}</strong>{" "}
                      ({stock.alert_threshold.condition === "ABOVE" ? "Upside ≥" : "Floor ≤"})
                      {stock.alert_threshold.note && (
                        <span className="text-slate-300 font-sans ml-1.5 opacity-90">
                          • "{stock.alert_threshold.note}"
                        </span>
                      )}
                    </span>
                  ) : (
                    <span>Set a custom target price stored in config to trigger sound & alerts</span>
                  )}
                </div>
              </div>
            </div>

            {/* Prominent 'Add Alert' button within the expanded view */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                id={`add-alert-btn-${stock.symbol.replace(/[^a-zA-Z0-9]/g, "-")}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAlertModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition cursor-pointer"
                title={`Set custom target price alert for ${stock.symbol}`}
              >
                <BellPlus className="w-3.5 h-3.5 text-slate-950" />
                <span>{stock.alert_threshold?.enabled ? "Edit Alert" : "Add Alert"}</span>
              </button>
            </div>
          </div>

          {/* Deeper Financial Ratios (D/E, ROE, PE, ROCE, P/B, etc.) */}
          <FinancialRatiosExpanded stock={stock} />
        </div>
      )}

      {/* GEMINI AI VERDICT SECTION WITH COLOR-CODED INDICATOR */}
      <div
        className={`mt-2.5 rounded-xl border p-2.5 transition-all ${actionConfig.bgColor} ${actionConfig.borderColor}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-slate-950/60 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300">
                  Gemini 3.8 Flash
                </span>
                <span className="text-[9px] text-slate-400 font-mono">• AI Equity Verdict</span>
              </div>
            </div>
          </div>

          {/* Color Coded Verdict Badge & Refresh Action */}
          <div className="flex items-center gap-2">
            <div
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 ${actionConfig.badgeColor}`}
            >
              <actionConfig.Icon className="w-3 h-3" />
              <span>{actionConfig.label}</span>
            </div>

            <button
              onClick={handleRefreshVerdict}
              disabled={isRefreshing}
              title="Re-analyze with Gemini 3.8 Flash"
              className="p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition disabled:opacity-50"
            >
              <RotateCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* 1-Line Analyst Verdict */}
        <div className="mt-2 text-[11px] leading-relaxed font-sans text-slate-200">
          <p className="font-medium">{verdictText}</p>
        </div>

        {/* Technical & Fundamental Signals Breakdown (Collapsible / Expandable) */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-3 text-slate-400">
            <span>Conviction: <strong className="text-white">{confidence}%</strong></span>
            {stock.ai_key_catalyst && (
              <span className="hidden sm:inline-block text-slate-400">
                Catalyst: <span className="text-slate-300">{stock.ai_key_catalyst}</span>
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="text-[10px] text-amber-400 hover:text-amber-300 inline-flex items-center gap-0.5 focus:outline-none"
          >
            <span>{showDetails ? "Hide Breakdown" : "View Breakdown"}</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showDetails && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-300">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[9px] uppercase font-mono tracking-wider text-emerald-400 font-bold mb-0.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5" />
                  <span>Technical Signals (200 DMA • 20D Vol • RSI)</span>
                </div>
                <span className={`text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded border ${rsi.badgeClass}`}>
                  RSI {rsi.value.toFixed(1)} • {rsi.badgeText}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {stock.ai_technical_signal ||
                  (stock.price > stock.dma_200
                    ? `Bullish: Trading above 200 DMA (₹${stock.dma_200}) with ${stock.vol_multiple}x volume multiple.`
                    : `Bearish/Neutral: Below 200 DMA (₹${stock.dma_200}); awaiting volume breakout confirmation.`)}
              </p>
              <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono">
                <span className="text-slate-400">
                  RSI Condition: <strong className={rsi.textColor}>{rsi.condition}</strong>
                </span>
                <span className="text-slate-400 text-[9px]">{rsi.tip}</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[9px] uppercase font-mono tracking-wider text-purple-400 font-bold mb-0.5 flex items-center gap-1">
                <Gem className="w-2.5 h-2.5" />
                <span>Fundamental Signal</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {stock.ai_fundamental_signal ||
                  `P/E: ${stock.pe}x | ROE: ${stock.roe_pct}% | D/E: ${stock.debt_to_equity} | Sales Growth: +${stock.sales_growth_yoy}% YoY.`}
              </p>
            </div>

            {stock.ai_reasoning && (
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="text-[9px] uppercase font-mono tracking-wider text-sky-400 font-bold mb-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Analyst Rationale</span>
                </div>
                <p className="text-[11px] text-slate-300">{stock.ai_reasoning}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Small Overlay Modal for Setting Custom Target Price Alert */}
      <SetAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        stock={stock}
        onUpdateStock={onUpdateStock}
        onTriggerNotification={onTriggerNotification}
      />
    </div>
  );
};
