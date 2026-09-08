import React from "react";
import { SectorSentimentData, StockData } from "../types";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Compass,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Bot
} from "lucide-react";

interface SectorSentimentCardProps {
  sentiment: SectorSentimentData | null;
  isLoading: boolean;
  visibleCount: number;
  onRefresh: () => void;
  onDismiss?: () => void;
}

export const SectorSentimentCard: React.FC<SectorSentimentCardProps> = ({
  sentiment,
  isLoading,
  visibleCount,
  onRefresh,
  onDismiss
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // If loading and no prior sentiment
  if (isLoading && !sentiment) {
    return (
      <div
        id="stock-sentiment-loading"
        className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 shadow-lg shadow-amber-500/5 animate-pulse"
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200 font-mono">
                  Gemini Stock Sentiment Analysis
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  GENERATING
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Aggregating live price action & fundamentals for {visibleCount} visible stocks...
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-3">
          <div className="h-4 bg-slate-800/80 rounded w-3/4"></div>
          <div className="h-3 bg-slate-800/60 rounded w-full"></div>
          <div className="h-3 bg-slate-800/60 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!sentiment) {
    return null;
  }

  const isBullish =
    sentiment.sentiment_stance.toLowerCase().includes("bullish") ||
    sentiment.sentiment_score >= 60;
  const isBearish =
    sentiment.sentiment_stance.toLowerCase().includes("bearish") ||
    sentiment.sentiment_score <= 40;

  const badgeColorClasses = isBullish
    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
    : isBearish
    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
    : "bg-amber-500/20 text-amber-300 border-amber-500/40";

  const glowBorderClasses = isBullish
    ? "border-emerald-500/30 shadow-emerald-950/20"
    : isBearish
    ? "border-rose-500/30 shadow-rose-950/20"
    : "border-amber-500/30 shadow-amber-950/20";

  return (
    <div
      id="stock-sentiment-card"
      data-testid="stock-sentiment-card"
      className={`rounded-2xl border transition-all duration-300 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-4 shadow-lg ${glowBorderClasses}`}
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 text-amber-300 border border-amber-500/30 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-100 font-mono tracking-tight flex items-center gap-1.5">
                <span>Stock Sentiment Analysis</span>
              </span>

              {/* Sentiment Stance Badge */}
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border flex items-center gap-1 ${badgeColorClasses}`}
              >
                {isBullish ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : isBearish ? (
                  <TrendingDown className="w-3 h-3 text-rose-400" />
                ) : (
                  <Minus className="w-3 h-3 text-amber-400" />
                )}
                <span>{sentiment.sentiment_stance}</span>
                <span className="opacity-80">({sentiment.sentiment_score}/100)</span>
              </span>

              {/* Model Attribution Badge */}
              <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                <Bot className="w-2.5 h-2.5 text-amber-400" />
                <span>{sentiment.model_used}</span>
              </span>
            </div>

            <div className="text-[11px] text-slate-400 mt-0.5 font-mono flex items-center gap-2">
              <span>
                Aggregated {sentiment.visible_stocks_count} visible stocks ({sentiment.advancing_count} Up, {sentiment.declining_count} Down)
              </span>
              <span>•</span>
              <span className="text-slate-400">{sentiment.generated_at}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <button
            id="btn-refresh-sentiment"
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-mono transition cursor-pointer disabled:opacity-50"
            title="Re-analyze Sector Sentiment with Gemini"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? "animate-spin" : ""}`} />
            <span className="text-[11px] hidden xs:inline">Re-analyze</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(prev => !prev)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-400 hover:text-slate-200 transition"
            title={isCollapsed ? "Expand Sentiment Paragraph" : "Collapse Sentiment"}
          >
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-400 hover:text-rose-400 transition"
              title="Close Sentiment Card"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      {!isCollapsed && (
        <div className="mt-3 pt-3 border-t border-slate-800/90 space-y-3">
          {/* Sentiment Headline */}
          {sentiment.headline && (
            <h3 className="text-sm sm:text-base font-bold text-slate-100 font-sans tracking-tight leading-snug">
              {sentiment.headline}
            </h3>
          )}

          {/* The Human-Readable Market Sentiment Paragraph */}
          <div
            id="sector-sentiment-paragraph"
            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans shadow-inner selection:bg-amber-500/20"
          >
            {sentiment.paragraph}
          </div>

          {/* Key Market Driver / Catalyst Callout */}
          {sentiment.key_driver && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-xs">
              <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 font-mono text-[11px] uppercase tracking-wider block">
                  Primary Market Driver
                </span>
                <p className="text-xs text-amber-200/90 mt-0.5 leading-snug">
                  {sentiment.key_driver}
                </p>
              </div>
            </div>
          )}

          {/* Sentiment Metrics Footer Strip */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/50 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span>
                Basket Mean:{" "}
                <strong
                  className={
                    sentiment.avg_change_pct > 0
                      ? "text-emerald-400"
                      : sentiment.avg_change_pct < 0
                      ? "text-rose-400"
                      : "text-slate-300"
                  }
                >
                  {sentiment.avg_change_pct > 0 ? "+" : ""}
                  {sentiment.avg_change_pct}%
                </strong>
              </span>
              <span>•</span>
              <span>
                Breadth:{" "}
                <strong className="text-emerald-400">{sentiment.advancing_count} Adv</strong> /{" "}
                <strong className="text-rose-400">{sentiment.declining_count} Dec</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Real-time Gemini Synthesis</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
