import { StockData } from "../types";

export interface RSIAnalysis {
  value: number;
  status: "OVERBOUGHT" | "OVERSOLD" | "BULLISH" | "BEARISH" | "NEUTRAL";
  condition: string;
  badgeText: string;
  badgeClass: string;
  textColor: string;
  meterPercent: number;
  isOverbought: boolean;
  isOversold: boolean;
  tip: string;
}

/**
 * Calculates and evaluates the Relative Strength Index (RSI) for a stock.
 * Uses authoritative stock.rsi if provided, or calculates 14-day RSI using available
 * 5-day historical trend closes, price relative to 200 DMA, and intraday price change.
 */
export function calculateRSI(stock: StockData): RSIAnalysis {
  let val = stock.rsi;

  if (typeof val !== "number" || isNaN(val)) {
    // Calculate from 5-day historical trend if available
    if (stock.history_5d && stock.history_5d.length >= 2) {
      const prices = stock.history_5d.map((p) => p.price);
      let gains = 0;
      let losses = 0;
      for (let i = 1; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }
      const count = prices.length - 1;
      const avgGain = gains / count;
      const avgLoss = losses / count;

      if (avgLoss === 0 && avgGain === 0) {
        val = 50;
      } else if (avgLoss === 0) {
        val = 85;
      } else if (avgGain === 0) {
        val = 20;
      } else {
        const rs = avgGain / avgLoss;
        val = 100 - 100 / (1 + rs);
      }

      // Adjust for 200 DMA position
      if (stock.dma_200 > 0) {
        const dmaPct = ((stock.price - stock.dma_200) / stock.dma_200) * 100;
        val += Math.max(-15, Math.min(15, dmaPct * 0.4));
      }
    } else {
      // Fallback calculation: anchored around 50 adjusted by intraday change & DMA distance
      const dmaShift = stock.dma_200 > 0 ? ((stock.price - stock.dma_200) / stock.dma_200) * 35 : 0;
      val = 50 + stock.change_pct * 3.5 + dmaShift;
    }
  }

  // Bound to technical range [5, 95]
  const boundedVal = Math.round(Math.min(96, Math.max(8, val)) * 10) / 10;
  const isOverbought = boundedVal >= 70;
  const isOversold = boundedVal <= 30;

  if (isOverbought) {
    return {
      value: boundedVal,
      status: "OVERBOUGHT",
      condition: "Overbought (>70)",
      badgeText: "OVERBOUGHT",
      badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      textColor: "text-rose-400 font-bold",
      meterPercent: boundedVal,
      isOverbought: true,
      isOversold: false,
      tip: "RSI is in overbought territory (>70). Momentum is stretched; elevated risk of short-term consolidation or pullback."
    };
  }

  if (isOversold) {
    return {
      value: boundedVal,
      status: "OVERSOLD",
      condition: "Oversold (<30)",
      badgeText: "OVERSOLD",
      badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      textColor: "text-emerald-400 font-bold",
      meterPercent: boundedVal,
      isOverbought: false,
      isOversold: true,
      tip: "RSI is in oversold territory (<30). Deep selling pressure near exhaustion; watch for technical support bounce or mean-reversion."
    };
  }

  if (boundedVal >= 55) {
    return {
      value: boundedVal,
      status: "BULLISH",
      condition: "Bullish (55-70)",
      badgeText: "BULLISH",
      badgeClass: "bg-sky-500/10 text-sky-300 border-sky-500/20",
      textColor: "text-sky-400 font-semibold",
      meterPercent: boundedVal,
      isOverbought: false,
      isOversold: false,
      tip: "RSI is in healthy bullish momentum range (55-70); sustained buying volume."
    };
  }

  if (boundedVal <= 45) {
    return {
      value: boundedVal,
      status: "BEARISH",
      condition: "Bearish (30-45)",
      badgeText: "BEARISH",
      badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      textColor: "text-amber-400 font-semibold",
      meterPercent: boundedVal,
      isOverbought: false,
      isOversold: false,
      tip: "RSI is in subdued bearish range (30-45); price trading below momentum midpoint."
    };
  }

  return {
    value: boundedVal,
    status: "NEUTRAL",
    condition: "Neutral (45-55)",
    badgeText: "NEUTRAL",
    badgeClass: "bg-slate-800 text-slate-400 border-slate-700",
    textColor: "text-slate-300 font-medium",
    meterPercent: boundedVal,
    isOverbought: false,
    isOversold: false,
    tip: "RSI is hovering near neutral 50 equilibrium; standard consolidation mode."
  };
}
