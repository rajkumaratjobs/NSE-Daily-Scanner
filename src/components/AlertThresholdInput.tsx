import React, { useState, useEffect } from "react";
import { StockData, PriceThresholdAlert } from "../types";
import {
  checkThresholdBreach,
  playAlertChime,
  triggerDesktopNotification,
  saveThreshold,
  markBreachNotified
} from "../utils/notifications";
import {
  Bell,
  BellRing,
  Check,
  Trash2,
  TrendingUp,
  TrendingDown,
  Volume2,
  AlertTriangle,
  Sparkles,
  Info,
  ArrowRight
} from "lucide-react";

interface AlertThresholdInputProps {
  stock: StockData;
  onUpdateStock?: (updatedStock: StockData) => void;
  onTriggerNotification?: (title: string, message: string, stock: StockData) => void;
}

export const AlertThresholdInput: React.FC<AlertThresholdInputProps> = ({
  stock,
  onUpdateStock,
  onTriggerNotification
}) => {
  const currentThreshold = stock.alert_threshold;

  const [targetPriceInput, setTargetPriceInput] = useState<string>(
    currentThreshold?.targetPrice ? currentThreshold.targetPrice.toString() : ""
  );
  const [condition, setCondition] = useState<"ABOVE" | "BELOW">(
    currentThreshold?.condition || (stock.change_pct >= 0 ? "ABOVE" : "BELOW")
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [desktopPermStatus, setDesktopPermStatus] = useState<NotificationPermission | "unsupported">(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported"
  );

  // Sync state if stock prop changes
  useEffect(() => {
    if (stock.alert_threshold?.targetPrice) {
      setTargetPriceInput(stock.alert_threshold.targetPrice.toString());
      setCondition(stock.alert_threshold.condition);
    }
  }, [stock.alert_threshold]);

  const { isBreached, reason, diffPct } = checkThresholdBreach(stock.price, currentThreshold);

  // Quick percentage offset helper
  const applyPreset = (pct: number) => {
    const calculated = Math.round((stock.price * (1 + pct / 100)) * 100) / 100;
    setTargetPriceInput(calculated.toString());
    setCondition(pct >= 0 ? "ABOVE" : "BELOW");
  };

  const handleSaveThreshold = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsedPrice = parseFloat(targetPriceInput);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return;
    }

    const newThreshold: PriceThresholdAlert = {
      targetPrice: parsedPrice,
      condition,
      enabled: true,
      breached: false
    };

    // Evaluate immediate breach against current price
    const breachCheck = checkThresholdBreach(stock.price, newThreshold);
    if (breachCheck.isBreached) {
      newThreshold.breached = true;
      newThreshold.breachedAt = new Date().toISOString();
      newThreshold.breachedPrice = stock.price;
    }

    // Save locally
    saveThreshold(stock.symbol, newThreshold);

    // Also persist to backend server
    try {
      await fetch(`/api/stocks/${encodeURIComponent(stock.symbol)}/threshold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newThreshold)
      });
    } catch (err) {
      // Offline fallback is fine
    }

    // Update stock alerts array
    let updatedAlerts = [...stock.alerts.filter(a => a.type !== "THRESHOLD")];
    if (breachCheck.isBreached) {
      updatedAlerts.unshift({
        type: "THRESHOLD",
        badge: "🎯 Target Breached",
        description: breachCheck.reason
      });

      // Play alert chime and trigger notification
      playAlertChime();
      markBreachNotified(stock.symbol, parsedPrice);
      triggerDesktopNotification(
        `🚨 Target Breached: ${stock.name}`,
        `Current price ₹${stock.price} has breached your target of ₹${parsedPrice}!`
      );

      if (onTriggerNotification) {
        onTriggerNotification(
          `Price Target Breached: ${stock.name}`,
          `Market price ₹${stock.price} breached your user-defined target of ₹${parsedPrice}.`,
          stock
        );
      }
    }

    const updatedStock: StockData = {
      ...stock,
      alerts: updatedAlerts,
      alert_threshold: newThreshold
    };

    if (onUpdateStock) {
      onUpdateStock(updatedStock);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearThreshold = async () => {
    saveThreshold(stock.symbol, null);

    try {
      await fetch(`/api/stocks/${encodeURIComponent(stock.symbol)}/threshold`, {
        method: "DELETE"
      });
    } catch {
      // Fallback
    }

    const updatedStock: StockData = {
      ...stock,
      alerts: stock.alerts.filter(a => a.type !== "THRESHOLD"),
      alert_threshold: undefined
    };

    setTargetPriceInput("");
    if (onUpdateStock) {
      onUpdateStock(updatedStock);
    }
  };

  const handleEnableDesktopNotifications = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setDesktopPermStatus(perm);
      if (perm === "granted") {
        triggerDesktopNotification(
          "Target Alerts Activated",
          `Desktop alerts are armed for ${stock.name} and your watchlist.`
        );
      }
    }
  };

  const testChime = () => {
    playAlertChime();
    triggerDesktopNotification(
      `🔔 Test Alert: ${stock.name}`,
      `Market price is ₹${stock.price}. Audio chime and notifications are working!`
    );
  };

  return (
    <div
      className="p-3 rounded-xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 shadow-md space-y-3 font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border ${
              isBreached
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                : currentThreshold?.enabled
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {isBreached ? <BellRing className="w-4 h-4 text-rose-400" /> : <Bell className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 font-mono">
                Price Target Alert Threshold
              </span>
              {currentThreshold?.enabled && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                    isBreached
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {isBreached ? "BREACHED" : "ARMED"}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Set custom price target to trigger audio chime & notification on breach
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={testChime}
          className="text-[10px] font-mono text-slate-400 hover:text-amber-300 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 inline-flex items-center gap-1 transition"
          title="Test alert audio chime and notification"
        >
          <Volume2 className="w-3 h-3 text-amber-400" />
          <span>Test Chime</span>
        </button>
      </div>

      {/* Breached Banner if Target Was Hit */}
      {isBreached && currentThreshold && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-950/60 to-rose-900/30 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold flex items-center justify-between">
              <span>TARGET LEVEL BREACHED!</span>
              <span className="font-mono text-[10px] text-rose-300">
                {currentThreshold.condition === "ABOVE" ? "Upside Cross" : "Downside Drop"}
              </span>
            </div>
            <div className="text-[11px] mt-0.5 text-rose-200/90 font-mono">
              Current market price <strong>₹{stock.price}</strong> has breached your threshold of{" "}
              <strong>₹{currentThreshold.targetPrice}</strong> ({reason}).
            </div>
          </div>
        </div>
      )}

      {/* Input and Trigger Condition Form */}
      <form onSubmit={handleSaveThreshold} className="space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          {/* Price Target Input Field */}
          <div className="sm:col-span-7">
            <label className="block text-[10px] font-mono uppercase font-bold text-slate-400 mb-1">
              Alert Threshold (₹ Price Target)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-amber-400">
                ₹
              </span>
              <input
                type="number"
                step="0.05"
                min="1"
                placeholder={`Current: ${stock.price}`}
                value={targetPriceInput}
                onChange={(e) => setTargetPriceInput(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700 hover:border-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-7 pr-3 py-1.5 text-xs text-slate-100 font-mono font-bold placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          {/* Condition Toggle (Above / Below) */}
          <div className="sm:col-span-5">
            <label className="block text-[10px] font-mono uppercase font-bold text-slate-400 mb-1">
              Breach Trigger
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-950/90 p-0.5 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setCondition("ABOVE")}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold flex items-center justify-center gap-1 transition ${
                  condition === "ABOVE"
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Price ≥ Target</span>
              </button>
              <button
                type="button"
                onClick={() => setCondition("BELOW")}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold flex items-center justify-center gap-1 transition ${
                  condition === "BELOW"
                    ? "bg-rose-500 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <TrendingDown className="w-3 h-3" />
                <span>Price ≤ Floor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Percent Presets Relative to Current Price */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span>Quick Target Offsets (Current: ₹{stock.price}):</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset(2)}
              className="px-2 py-1 rounded-lg text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition"
            >
              +2% (₹{(stock.price * 1.02).toFixed(1)})
            </button>
            <button
              type="button"
              onClick={() => applyPreset(5)}
              className="px-2 py-1 rounded-lg text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition"
            >
              +5% (₹{(stock.price * 1.05).toFixed(1)})
            </button>
            <button
              type="button"
              onClick={() => applyPreset(10)}
              className="px-2 py-1 rounded-lg text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition"
            >
              +10% (₹{(stock.price * 1.1).toFixed(1)})
            </button>
            <button
              type="button"
              onClick={() => applyPreset(-3)}
              className="px-2 py-1 rounded-lg text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition"
            >
              -3% (₹{(stock.price * 0.97).toFixed(1)})
            </button>
            <button
              type="button"
              onClick={() => applyPreset(-5)}
              className="px-2 py-1 rounded-lg text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition"
            >
              -5% (₹{(stock.price * 0.95).toFixed(1)})
            </button>
          </div>
        </div>

        {/* Action Buttons: Set Alert & Clear */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow transition active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Alert Saved!</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>{currentThreshold?.enabled ? "Update Threshold" : "Set Alert Threshold"}</span>
                </>
              )}
            </button>

            {currentThreshold?.enabled && (
              <button
                type="button"
                onClick={handleClearThreshold}
                className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Alert</span>
              </button>
            )}
          </div>

          {/* Desktop Permission Prompt */}
          {desktopPermStatus !== "granted" && desktopPermStatus !== "unsupported" && (
            <button
              type="button"
              onClick={handleEnableDesktopNotifications}
              className="text-[10px] font-mono text-sky-400 hover:text-sky-300 underline underline-offset-2 flex items-center gap-1"
            >
              <span>Enable Browser Popups</span>
            </button>
          )}
        </div>
      </form>

      {/* Active Monitoring Distance Card if Threshold is Armed */}
      {currentThreshold?.enabled && !isBreached && (
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[10.5px] font-mono flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Target: <strong className="text-amber-300">₹{currentThreshold.targetPrice}</strong> ({currentThreshold.condition === "ABOVE" ? "Cross Above" : "Drop Below"})
            </span>
          </div>
          <div className="text-slate-400">
            Distance: <strong className="text-slate-200">₹{Math.abs(stock.price - currentThreshold.targetPrice).toFixed(1)}</strong> ({Math.abs(diffPct)}% away)
          </div>
        </div>
      )}
    </div>
  );
};
