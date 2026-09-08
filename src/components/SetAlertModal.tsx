import React, { useState, useEffect, useRef } from "react";
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
  BellPlus,
  BellRing,
  X,
  Check,
  Trash2,
  TrendingUp,
  TrendingDown,
  Volume2,
  AlertTriangle,
  Sparkles,
  Info,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface SetAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: StockData;
  onUpdateStock?: (updatedStock: StockData) => void;
  onTriggerNotification?: (title: string, message: string, stock: StockData) => void;
}

export const SetAlertModal: React.FC<SetAlertModalProps> = ({
  isOpen,
  onClose,
  stock,
  onUpdateStock,
  onTriggerNotification
}) => {
  const currentThreshold = stock.alert_threshold;

  const [targetPriceInput, setTargetPriceInput] = useState<string>("");
  const [condition, setCondition] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [noteInput, setNoteInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize form state when modal opens or stock changes
  useEffect(() => {
    if (isOpen) {
      if (currentThreshold?.targetPrice) {
        setTargetPriceInput(currentThreshold.targetPrice.toString());
        setCondition(currentThreshold.condition);
        setNoteInput(currentThreshold.note || "");
      } else {
        // Pre-fill with a reasonable default (e.g., +5% above current price)
        const defaultTarget = Math.round(stock.price * 1.05 * 10) / 10;
        setTargetPriceInput(defaultTarget.toString());
        setCondition("ABOVE");
        setNoteInput("");
      }
      setErrorMessage(null);
      setSuccessMessage(null);

      // Focus input on open
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, currentThreshold, stock.price]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Live difference computation
  const parsedTargetPrice = parseFloat(targetPriceInput);
  const isValidPrice = !isNaN(parsedTargetPrice) && parsedTargetPrice > 0;
  const diff = isValidPrice ? parsedTargetPrice - stock.price : 0;
  const diffPct = isValidPrice && stock.price > 0 ? ((diff / stock.price) * 100).toFixed(1) : "0";

  // Check if target will trigger immediately based on current price
  const willBreachImmediately =
    isValidPrice &&
    (condition === "ABOVE" ? stock.price >= parsedTargetPrice : stock.price <= parsedTargetPrice);

  // Quick preset button helper
  const applyPresetPct = (pct: number) => {
    const calculated = Math.round(stock.price * (1 + pct / 100) * 10) / 10;
    setTargetPriceInput(calculated.toString());
    setCondition(pct >= 0 ? "ABOVE" : "BELOW");
    setErrorMessage(null);
  };

  // Test sound chime
  const handleTestChime = () => {
    playAlertChime();
    triggerDesktopNotification(
      `🔔 Alert Chime Test: ${stock.name}`,
      `Market price is ₹${stock.price}. Audio chime is active!`
    );
  };

  // Handle Save / Submit Target Alert
  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPrice) {
      setErrorMessage("Please enter a valid positive target price.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const newThreshold: PriceThresholdAlert = {
      targetPrice: parsedTargetPrice,
      condition,
      enabled: true,
      breached: false,
      note: noteInput.trim()
    };

    // Check breach immediately
    const breachCheck = checkThresholdBreach(stock.price, newThreshold);
    if (breachCheck.isBreached) {
      newThreshold.breached = true;
      newThreshold.breachedAt = new Date().toISOString();
      newThreshold.breachedPrice = stock.price;
    }

    try {
      // 1. Persist directly in server configuration (config.json)
      const res = await fetch(`/api/stocks/${encodeURIComponent(stock.symbol)}/threshold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newThreshold)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server returned status ${res.status}`);
      }

      // 2. Persist in local storage for instant offline fallback
      saveThreshold(stock.symbol, newThreshold);

      // 3. Update stock alerts list
      let updatedAlerts = [...stock.alerts.filter((a) => a.type !== "THRESHOLD")];
      if (breachCheck.isBreached) {
        updatedAlerts.unshift({
          type: "THRESHOLD",
          badge: "🎯 Target Breached",
          description: breachCheck.reason
        });

        // Trigger chime & notifications
        playAlertChime();
        markBreachNotified(stock.symbol, parsedTargetPrice);
        triggerDesktopNotification(
          `🚨 Target Breached: ${stock.name}`,
          `Market price ₹${stock.price} has breached your target of ₹${parsedTargetPrice}!`
        );

        if (onTriggerNotification) {
          onTriggerNotification(
            `Price Target Breached: ${stock.name}`,
            `Market price ₹${stock.price} breached your custom target of ₹${parsedTargetPrice}.`,
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

      setSuccessMessage("Alert saved to config successfully!");
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error("Failed to save price alert threshold:", err);
      setErrorMessage(err.message || "Failed to save alert to configuration. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Handle Delete / Clear Alert
  const handleDeleteAlert = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      // Delete from server config
      await fetch(`/api/stocks/${encodeURIComponent(stock.symbol)}/threshold`, {
        method: "DELETE"
      });

      // Clear from local storage
      saveThreshold(stock.symbol, null);

      const updatedStock: StockData = {
        ...stock,
        alerts: stock.alerts.filter((a) => a.type !== "THRESHOLD"),
        alert_threshold: undefined
      };

      if (onUpdateStock) {
        onUpdateStock(updatedStock);
      }

      setSuccessMessage("Alert removed from config!");
      setTimeout(() => {
        setIsDeleting(false);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error("Failed to delete price alert:", err);
      setErrorMessage(err.message || "Failed to remove alert from configuration.");
      setIsDeleting(false);
    }
  };

  return (
    <div
      id="set-alert-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="set-alert-modal-content"
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl shadow-black/80 p-5 space-y-4 animate-scaleUp text-slate-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400">
              <BellPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {currentThreshold?.enabled ? "Edit Custom Alert" : "Set Custom Alert"}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-bold border border-slate-700">
                  {stock.symbol}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[260px] sm:max-w-xs">
                {stock.name}
              </p>
            </div>
          </div>

          <button
            id="close-set-alert-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Stock Market Price Bar */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">Current Market Price:</span>
          <div className="flex items-center gap-2">
            <span className="text-base font-mono font-bold text-white">
              ₹{stock.price.toLocaleString("en-IN")}
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                stock.change_pct >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {stock.change_pct >= 0 ? "+" : ""}
              {stock.change_pct}%
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveAlert} className="space-y-4">
          {/* Target Price Input Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="alert-target-price-input"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300"
              >
                Custom Target Price (₹)
              </label>
              {isValidPrice && (
                <span
                  className={`text-[11px] font-mono font-semibold ${
                    diff >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {diff >= 0 ? "+" : ""}₹{diff.toFixed(2)} ({diff >= 0 ? "+" : ""}
                  {diffPct}%)
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-base font-bold text-amber-400 select-none">
                ₹
              </span>
              <input
                id="alert-target-price-input"
                ref={inputRef}
                type="number"
                step="0.05"
                min="0.1"
                placeholder={`e.g. ${(stock.price * 1.05).toFixed(1)}`}
                value={targetPriceInput}
                onChange={(e) => {
                  setTargetPriceInput(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full bg-slate-950/90 border border-slate-700 hover:border-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-mono font-bold placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          {/* Quick Offset Percentage Presets */}
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
              Quick Price Offsets:
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: "-5%", pct: -5, color: "text-rose-300 hover:bg-rose-950/40" },
                { label: "-2%", pct: -2, color: "text-rose-300 hover:bg-rose-950/40" },
                { label: "+2%", pct: 2, color: "text-emerald-300 hover:bg-emerald-950/40" },
                { label: "+5%", pct: 5, color: "text-emerald-300 hover:bg-emerald-950/40" },
                { label: "+10%", pct: 10, color: "text-emerald-300 hover:bg-emerald-950/40" }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPresetPct(preset.pct)}
                  className={`px-1.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-800 border border-slate-700/80 transition cursor-pointer text-center ${preset.color}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Breach Direction Condition */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Trigger Condition
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setCondition("ABOVE")}
                className={`px-2.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  condition === "ABOVE"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Price ≥ Target (Upside)</span>
              </button>
              <button
                type="button"
                onClick={() => setCondition("BELOW")}
                className={`px-2.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  condition === "BELOW"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-950/50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Price ≤ Target (Floor)</span>
              </button>
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label
              htmlFor="alert-note-input"
              className="block text-xs font-mono font-semibold text-slate-400 mb-1"
            >
              Alert Note (Optional)
            </label>
            <input
              id="alert-note-input"
              type="text"
              maxLength={80}
              placeholder="e.g. 52-week high breakout, Accumulate on dip"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-700/80 hover:border-slate-600 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600 outline-none transition"
            />
          </div>

          {/* Notice if will breach immediately */}
          {willBreachImmediately && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Immediate trigger:</strong> Market price (₹{stock.price}) already meets this
                condition. Saving will arm the alert and trigger a notification immediately.
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTestChime}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono inline-flex items-center gap-1.5 transition cursor-pointer"
                title="Test audio chime and notification"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Test Sound</span>
              </button>

              {currentThreshold?.enabled && (
                <button
                  id="delete-alert-btn"
                  type="button"
                  onClick={handleDeleteAlert}
                  disabled={isDeleting}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  title="Remove this alert from configuration"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                id="save-alert-to-config-btn"
                type="submit"
                disabled={isSubmitting || !isValidPrice}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save to Config</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
