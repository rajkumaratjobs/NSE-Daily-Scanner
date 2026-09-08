import { StockData } from "../types";

export type VolatilityTier = "HIGH" | "MEDIUM" | "LOW";

export interface VolatilityInfo {
  atr: number; // in ₹
  atrPct: number; // ATR as % of stock price
  range5dPct: number; // 5-day max-min range as % of price
  level: VolatilityTier;
  levelLabel: string; // e.g. "High Risk", "Moderate Risk", "Low Risk (Stable)"
  shortLabel: string; // "High Vol", "Med Vol", "Low Vol"
  tagText: string; // e.g. "High Vol · ATR 4.8%"
  badgeText: string; // e.g. "ATR 4.8%"
  isHighRisk: boolean;
  description: string;
  colors: {
    bg: string;
    border: string;
    text: string;
    dotColor: string;
    badgeClass: string;
    pillBorder: string;
  };
}

/**
 * Calculates or retrieves volatility metrics (ATR and 5-Day Price Range) for a stock.
 * Provides color-coded styles and risk categorizations to identify high-risk jewellery stocks.
 */
export function calculateVolatility(stock: StockData): VolatilityInfo {
  const price = stock.price > 0 ? stock.price : 100;

  // 1. Determine ATR and ATR %
  let atr = 0;
  let atrPct = 0;

  if (typeof stock.atr === "number" && stock.atr > 0) {
    atr = stock.atr;
    atrPct = typeof stock.atr_pct === "number" ? stock.atr_pct : Math.round((atr / price) * 10000) / 100;
  } else if (typeof stock.atr_pct === "number" && stock.atr_pct > 0) {
    atrPct = stock.atr_pct;
    atr = Math.round(((atrPct / 100) * price) * 100) / 100;
  } else {
    // Derive from 5-day historical prices if available
    const history = stock.history_5d || [];
    if (history.length >= 2) {
      let trSum = 0;
      for (let i = 1; i < history.length; i++) {
        const tr = Math.abs(history[i].price - history[i - 1].price);
        trSum += tr;
      }
      atr = Math.round((trSum / (history.length - 1)) * 100) / 100;
      atrPct = Math.round((atr / price) * 10000) / 100;
    } else {
      // Approximate from current day's change percentage with baseline volatility factor
      const baselinePct = Math.max(1.5, Math.abs(stock.change_pct) * 1.3);
      atrPct = Math.round(baselinePct * 100) / 100;
      atr = Math.round(((atrPct / 100) * price) * 100) / 100;
    }
  }

  // 2. Determine 5-day price range percentage
  let range5dPct = 0;
  if (typeof stock.price_range_5d_pct === "number") {
    range5dPct = stock.price_range_5d_pct;
  } else if (stock.history_5d && stock.history_5d.length > 0) {
    const prices = stock.history_5d.map(h => h.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    range5dPct = Math.round(((maxP - minP) / price) * 10000) / 100;
  } else {
    range5dPct = Math.round(atrPct * 2.1 * 100) / 100;
  }

  // 3. Classify into Risk Tier
  let level: VolatilityTier = "MEDIUM";
  if (stock.volatility_level) {
    level = stock.volatility_level;
  } else if (atrPct >= 3.5 || range5dPct >= 8.5) {
    level = "HIGH";
  } else if (atrPct < 2.0 && range5dPct < 4.0) {
    level = "LOW";
  } else {
    level = "MEDIUM";
  }

  const isHighRisk = level === "HIGH";

  // 4. Colors and labels
  let levelLabel = "Moderate Risk";
  let shortLabel = "Med Vol";
  let description = `Moderate Volatility: Average True Range is ₹${atr.toFixed(2)} (${atrPct.toFixed(1)}% of ₹${price.toFixed(2)}). Typical sector beta range.`;

  let colors = {
    bg: "bg-amber-500/15",
    border: "border-amber-500/40",
    text: "text-amber-300",
    dotColor: "bg-amber-400",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    pillBorder: "border-amber-400/40"
  };

  if (level === "HIGH") {
    levelLabel = "High Risk";
    shortLabel = "High Vol";
    description = `High Volatility Warning: Average True Range is ₹${atr.toFixed(2)} (${atrPct.toFixed(1)}% of ₹${price.toFixed(2)}). Rapid intraday swings & elevated downside risk.`;
    colors = {
      bg: "bg-rose-500/15",
      border: "border-rose-500/45",
      text: "text-rose-300",
      dotColor: "bg-rose-400",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-xs shadow-rose-950",
      pillBorder: "border-rose-400/50"
    };
  } else if (level === "LOW") {
    levelLabel = "Low Risk (Stable)";
    shortLabel = "Low Vol";
    description = `Low Volatility: Average True Range is ₹${atr.toFixed(2)} (${atrPct.toFixed(1)}% of ₹${price.toFixed(2)}). Highly institutionalized large-cap stability.`;
    colors = {
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/40",
      text: "text-emerald-300",
      dotColor: "bg-emerald-400",
      badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
      pillBorder: "border-emerald-400/40"
    };
  }

  const tagText = `${shortLabel} · ATR ${atrPct.toFixed(1)}%`;
  const badgeText = `ATR ${atrPct.toFixed(1)}%`;

  return {
    atr,
    atrPct,
    range5dPct,
    level,
    levelLabel,
    shortLabel,
    tagText,
    badgeText,
    isHighRisk,
    description,
    colors
  };
}
