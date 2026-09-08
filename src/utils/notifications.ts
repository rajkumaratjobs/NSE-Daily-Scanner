import { PriceThresholdAlert, StockData, StockAlert } from "../types";

const THRESHOLDS_STORAGE_KEY = "nse_jewellery_alert_thresholds_v1";
const NOTIFIED_STORAGE_KEY = "nse_jewellery_notified_breaches_v1";

/**
 * Play a clear, pleasant double-bell audio chime using the Web Audio API
 */
export function playAlertChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // High clear bell tone 1 (G5: 783.99 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(783.99, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Resonant harmonic chime 2 (E6: 1318.51 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.51, now + 0.12);
    gain2.gain.setValueAtTime(0.3, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (err) {
    // Gracefully handle browser autoplay policies
  }
}

/**
 * Trigger a browser system notification if permitted
 */
export async function triggerDesktopNotification(title: string, body: string): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  try {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/icon-192.png",
        tag: `price-breach-${Date.now()}`
      });
      return true;
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification(title, {
          body,
          icon: "/icon-192.png",
          tag: `price-breach-${Date.now()}`
        });
        return true;
      }
    }
  } catch (err) {
    console.warn("Desktop notification error:", err);
  }
  return false;
}

/**
 * Evaluate whether the current price breaches the user-defined threshold
 */
export function checkThresholdBreach(
  currentPrice: number,
  threshold?: PriceThresholdAlert
): { isBreached: boolean; reason: string; diffPct: number } {
  if (!threshold || !threshold.enabled || !threshold.targetPrice || threshold.targetPrice <= 0) {
    return { isBreached: false, reason: "", diffPct: 0 };
  }

  const diff = currentPrice - threshold.targetPrice;
  const diffPct = Math.round((diff / threshold.targetPrice) * 1000) / 10;

  if (threshold.condition === "ABOVE") {
    const isBreached = currentPrice >= threshold.targetPrice;
    const reason = isBreached
      ? `Price ₹${currentPrice} crossed ABOVE target ₹${threshold.targetPrice} (+${diffPct}%)`
      : `Price ₹${currentPrice} is ₹${Math.abs(diff).toFixed(2)} (${Math.abs(diffPct)}%) below target ₹${threshold.targetPrice}`;
    return { isBreached, reason, diffPct };
  } else {
    const isBreached = currentPrice <= threshold.targetPrice;
    const reason = isBreached
      ? `Price ₹${currentPrice} dropped BELOW target ₹${threshold.targetPrice} (${diffPct}%)`
      : `Price ₹${currentPrice} is ₹${Math.abs(diff).toFixed(2)} (+${Math.abs(diffPct)}%) above floor ₹${threshold.targetPrice}`;
    return { isBreached, reason, diffPct };
  }
}

/**
 * Storage helpers for local persistence
 */
export function getSavedThresholds(): Record<string, PriceThresholdAlert> {
  try {
    const raw = localStorage.getItem(THRESHOLDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveThreshold(symbol: string, threshold: PriceThresholdAlert | null) {
  try {
    const current = getSavedThresholds();
    if (threshold && threshold.enabled) {
      current[symbol] = threshold;
    } else {
      delete current[symbol];
    }
    localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage errors
  }
}

export function getNotifiedBreaches(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(NOTIFIED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function markBreachNotified(symbol: string, targetPrice: number) {
  try {
    const current = getNotifiedBreaches();
    current[`${symbol}_${targetPrice}`] = Date.now();
    sessionStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage errors
  }
}

export function hasBreachBeenNotifiedRecently(symbol: string, targetPrice: number, withinMinutes = 10): boolean {
  try {
    const current = getNotifiedBreaches();
    const timestamp = current[`${symbol}_${targetPrice}`];
    if (!timestamp) return false;
    return Date.now() - timestamp < withinMinutes * 60 * 1000;
  } catch {
    return false;
  }
}
