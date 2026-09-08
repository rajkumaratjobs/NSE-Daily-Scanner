import React, { useState, useEffect, useRef } from "react";
import {
  JewelleryNewsItem,
  JewelleryNewsResponse,
  NewsCategory,
  NewsSentiment
} from "../types";
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  RefreshCw,
  Pause,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  Tag,
  AlertCircle,
  Gem,
  Radio
} from "lucide-react";

interface JewelleryNewsTickerProps {
  onSelectStock?: (symbol: string) => void;
  className?: string;
}

export const JewelleryNewsTicker: React.FC<JewelleryNewsTickerProps> = ({
  onSelectStock,
  className = ""
}) => {
  const [news, setNews] = useState<JewelleryNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedItem, setSelectedItem] = useState<JewelleryNewsItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [speed, setSpeed] = useState<"normal" | "slow">("normal");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch news headlines from API
  const fetchNews = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/jewellery-news");
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data: JewelleryNewsResponse = await res.json();
      if (data.status === "ok" && Array.isArray(data.news)) {
        setNews(data.news);
      } else {
        throw new Error(data.message || "Failed to parse news headlines");
      }
    } catch (err: any) {
      console.error("Error loading jewellery sector news:", err);
      setError(err.message || "Failed to fetch live jewellery news");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Auto-refresh news every 3 minutes
    const interval = setInterval(() => {
      fetchNews(false);
    }, 180000);

    return () => clearInterval(interval);
  }, []);

  // Handle manual nudge left / right
  const handleNudge = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === "left" ? -320 : 320;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Copy headline to clipboard
  const handleCopy = (item: JewelleryNewsItem) => {
    const textToCopy = `${item.headline} (${item.source} • ${item.timeAgo})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper for Category badge styling
  const getCategoryBadge = (category: NewsCategory) => {
    switch (category) {
      case "GOLD_POLICY":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "EARNINGS":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "EXPANSION":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "EXPORTS":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
      case "RETAIL_DEMAND":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "REGULATORY":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
      default:
        return "bg-slate-700/60 text-slate-300 border-slate-600";
    }
  };

  // Helper for Sentiment badge styling
  const getSentimentBadge = (sentiment: NewsSentiment) => {
    switch (sentiment) {
      case "BULLISH":
        return {
          icon: <TrendingUp className="w-3 h-3 text-emerald-400" />,
          text: "Bullish",
          className: "text-emerald-400 bg-emerald-950/40 border-emerald-500/30"
        };
      case "BEARISH":
        return {
          icon: <TrendingDown className="w-3 h-3 text-rose-400" />,
          text: "Bearish",
          className: "text-rose-400 bg-rose-950/40 border-rose-500/30"
        };
      default:
        return {
          icon: <Minus className="w-3 h-3 text-slate-400" />,
          text: "Neutral",
          className: "text-slate-400 bg-slate-800/60 border-slate-700"
        };
    }
  };

  // Category labels for display
  const formatCategoryLabel = (cat: NewsCategory) => {
    switch (cat) {
      case "GOLD_POLICY":
        return "Gold Policy";
      case "EARNINGS":
        return "Earnings";
      case "EXPANSION":
        return "Expansion";
      case "EXPORTS":
        return "Exports";
      case "RETAIL_DEMAND":
        return "Retail Demand";
      case "REGULATORY":
        return "Regulatory";
      default:
        return "Sector News";
    }
  };

  return (
    <div
      id="jewellery-news-ticker"
      className={`relative rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm overflow-hidden text-xs select-none ${className}`}
    >
      <div className="flex items-stretch">
        {/* Left Fixed Badge: Branding & Live Indicator */}
        <div className="z-10 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/80 border-r border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Gem className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Jewellery News</span>
            </span>
          </div>

          <span className="hidden md:inline-flex px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300/90 text-[9px] font-mono border border-amber-500/20">
            Sector Pulse
          </span>
        </div>

        {/* Center: Auto-scrolling Ticker Track */}
        <div
          ref={scrollContainerRef}
          className="relative flex-1 overflow-hidden flex items-center py-2 group cursor-pointer"
          onClick={() => {
            // Clicking background toggles pause/play
            setIsPaused(prev => !prev);
          }}
          title={isPaused ? "Click or press play to resume ticker auto-scroll" : "Hover or click to pause ticker auto-scroll"}
        >
          {/* Subtle Left and Right Fade Gradients */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-900 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10" />

          {loading && news.length === 0 ? (
            <div className="px-4 text-slate-400 font-mono text-xs flex items-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
              <span>Fetching latest jewellery sector headlines...</span>
            </div>
          ) : error && news.length === 0 ? (
            <div className="px-4 text-rose-400 font-mono text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  fetchNews(true);
                }}
                className="underline hover:text-rose-300 ml-1"
              >
                Retry
              </button>
            </div>
          ) : (
            /* Marquee Track: duplicated list ensures seamless infinite loop */
            <div
              className={`flex items-center gap-6 whitespace-nowrap animate-ticker-marquee ${
                isPaused ? "ticker-is-paused" : ""
              }`}
              style={{
                animationDuration: speed === "slow" ? "75s" : "48s"
              }}
            >
              {[...news, ...news].map((item, idx) => {
                const sentiment = getSentimentBadge(item.sentiment);
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedItem(item);
                    }}
                    className="inline-flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700/80 cursor-pointer group/item shrink-0"
                    title="Click to view full financial headline details & sector context"
                  >
                    {/* Category Pill */}
                    <span
                      className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-tight ${getCategoryBadge(
                        item.category
                      )}`}
                    >
                      {formatCategoryLabel(item.category)}
                    </span>

                    {/* Sentiment Pill */}
                    <span
                      className={`inline-flex items-center gap-1 text-[9.5px] font-mono font-semibold px-1.5 py-0.5 rounded border ${sentiment.className}`}
                    >
                      {sentiment.icon}
                      <span>{sentiment.text}</span>
                    </span>

                    {/* Stock Tags */}
                    {item.relatedSymbols && item.relatedSymbols.length > 0 && (
                      <div className="flex items-center gap-1">
                        {item.relatedSymbols.slice(0, 2).map(sym => (
                          <span
                            key={sym}
                            className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-amber-300/90 font-bold border border-slate-700"
                          >
                            {sym.replace(".NS", "")}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Headline Text */}
                    <span className="text-slate-200 group-hover/item:text-amber-300 text-[11.5px] font-medium transition tracking-tight">
                      {item.headline}
                    </span>

                    {/* Source & Time */}
                    <span className="text-slate-500 font-mono text-[10px] flex items-center gap-1 shrink-0">
                      <span>•</span>
                      <span className="text-slate-400 font-medium">{item.source}</span>
                      <span className="text-slate-600">({item.timeAgo})</span>
                    </span>

                    {/* Separator Diamond */}
                    <span className="text-amber-500/40 text-xs ml-2 select-none">
                      ❖
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Fixed Controls: Play/Pause, Manual Step, Refresh */}
        <div className="z-10 flex items-center gap-1 px-2 py-1 bg-gradient-to-l from-slate-900 via-slate-900 to-slate-900/80 border-l border-slate-800 shrink-0">
          {/* Pause / Resume Button */}
          <button
            onClick={e => {
              e.stopPropagation();
              setIsPaused(prev => !prev);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isPaused ? "Resume auto-scrolling ticker" : "Pause auto-scrolling ticker"}
            aria-label={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ) : (
              <Pause className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Manual Step Left */}
          <button
            onClick={e => {
              e.stopPropagation();
              handleNudge("left");
            }}
            className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Scroll headlines left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Manual Step Right */}
          <button
            onClick={e => {
              e.stopPropagation();
              handleNudge("right");
            }}
            className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Scroll headlines right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Speed Toggle (Normal / Slow) */}
          <button
            onClick={e => {
              e.stopPropagation();
              setSpeed(prev => (prev === "normal" ? "slow" : "normal"));
            }}
            className={`hidden md:inline-flex px-1.5 py-0.5 rounded text-[9.5px] font-mono border transition ${
              speed === "slow"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
            title="Toggle ticker animation speed"
          >
            {speed === "slow" ? "Slow" : "1x"}
          </button>

          {/* Refresh Button */}
          <button
            onClick={e => {
              e.stopPropagation();
              fetchNews(true);
            }}
            disabled={refreshing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition disabled:opacity-50"
            title="Refresh jewellery sector news headlines"
            aria-label="Refresh news"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Modal Dialog: Headline Details & Context */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-4 animate-scaleUp text-slate-100 font-sans"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-tight ${getCategoryBadge(
                    selectedItem.category
                  )}`}
                >
                  {formatCategoryLabel(selectedItem.category)}
                </span>

                {(() => {
                  const sentiment = getSentimentBadge(selectedItem.sentiment);
                  return (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${sentiment.className}`}
                    >
                      {sentiment.icon}
                      <span>{sentiment.text}</span>
                    </span>
                  );
                })()}

                {selectedItem.impactRating && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold uppercase tracking-tight ${
                      selectedItem.impactRating === "HIGH"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    {selectedItem.impactRating} Impact
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Title / Headline */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {selectedItem.headline}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="font-semibold text-slate-300">
                  {selectedItem.source}
                </span>
                <span>•</span>
                <span>{selectedItem.timeAgo}</span>
                <span>•</span>
                <span>{new Date(selectedItem.publishedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST</span>
              </div>
            </div>

            {/* Summary & Market Impact */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 text-xs sm:text-sm leading-relaxed">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                Financial Context & Market Impact
              </div>
              <p>{selectedItem.summary}</p>
            </div>

            {/* Related Jewellery Stocks */}
            {selectedItem.relatedSymbols && selectedItem.relatedSymbols.length > 0 && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-400" />
                  <span>Related Jewellery Stocks</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.relatedSymbols.map(sym => (
                    <button
                      key={sym}
                      onClick={() => {
                        if (onSelectStock) {
                          onSelectStock(sym);
                          setSelectedItem(null);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 font-mono text-xs transition"
                      title={`Filter radar to ${sym}`}
                    >
                      <Gem className="w-3 h-3 text-amber-400" />
                      <span className="font-bold">{sym.replace(".NS", "")}</span>
                      <span className="text-[10px] text-slate-400">View</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopy(selectedItem)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy Headline</span>
                  </>
                )}
              </button>

              {selectedItem.url && (
                <a
                  href={selectedItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-semibold transition"
                >
                  <span>Read on {selectedItem.source}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
