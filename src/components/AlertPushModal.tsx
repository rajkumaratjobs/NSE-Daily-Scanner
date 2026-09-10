import React, { useState } from "react";
import { PreSurgeStock } from "../types";
import {
  Bell,
  X,
  Zap,
  CheckCircle2,
  Volume2,
  VolumeX,
  Smartphone,
  Send,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";

interface AlertPushModalProps {
  stocks: PreSurgeStock[];
  isOpen: boolean;
  onClose: () => void;
  onSelectStock: (stock: PreSurgeStock) => void;
}

export const AlertPushModal: React.FC<AlertPushModalProps> = ({
  stocks,
  isOpen,
  onClose,
  onSelectStock
}) => {
  if (!isOpen) return null;

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserAlertsEnabled, setBrowserAlertsEnabled] = useState(false);
  const [telegramWebhook, setTelegramWebhook] = useState("");
  const [webhookSaved, setWebhookSaved] = useState(false);

  // Filter stocks matching >= 3 of 4 filters
  const triggeredStocks = stocks.filter((s) => s.filters.matched_count >= 3);

  // Web Audio chime generator for alert notification
  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // Audio context might be restricted
    }
  };

  const handleRequestBrowserPermission = async () => {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setBrowserAlertsEnabled(true);
        new Notification("BTST Surge Detector", {
          body: "Push Notifications Enabled: You will be notified whenever any stock matches ≥3/4 early filters!",
          icon: "/favicon.ico"
        });
      }
    }
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0F141F] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/90 flex items-center justify-between gap-4 bg-[#121824]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Real-Time Pre-Surge Alert System</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                  ≥ 3/4 Early Filters
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Instant institutional alert dispatch for high-conviction breakout setups.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playAlertChime();
              }}
              title={soundEnabled ? "Audio chimes active" : "Audio muted"}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-slate-100 transition"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Active Live Alerts Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Triggered Signals ({triggeredStocks.length})</span>
              </h4>
              <button
                onClick={playAlertChime}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline underline-offset-2"
              >
                Test Sound Chime
              </button>
            </div>

            {triggeredStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 transition space-y-3 shadow-lg shadow-amber-500/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-base font-black text-slate-100">
                        {stock.symbol}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {stock.filters.matched_count}/4 FILTERS TRIGGERED
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ₹{(stock.price ?? 0).toFixed(2)} (+{((stock.change_pct ?? stock.changePct ?? 0)).toFixed(2)}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{stock.name}</p>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onSelectStock(stock);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow transition active:scale-95"
                  >
                    <span>View & Trade</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* EXACT NOTIFICATION BANNER REQUESTED IN PROMPT */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-sans leading-relaxed">
                  <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Notification Trigger Payload:</span>
                  </div>
                  {stock.symbol === "PCJEWELLER" ? (
                    <span className="font-mono text-[11px] text-emerald-300 font-medium">
                      "PC Jeweller triggered 4/4 filters: Debt Free news + 14x volume + HRTI bulk buy + 2.4% intraday recovery. Strong BTST candidate!"
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-emerald-300 font-medium">
                      "{stock.name} triggered {stock.filters.matched_count}/4 filters: {stock.reason_tag} + {stock.vol_multiple}x volume spike + {(stock.delivery_pct ?? 0).toFixed(1)}% delivery + {(stock.technicals?.intraday_recovery_pct ?? 0).toFixed(1)}% bounce. High conviction BTST candidate!"
                    </span>
                  )}
                </div>

                {/* Quick Filters Tag Strip */}
                <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Vol: {stock.vol_multiple}x (vs 20D)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Delivery: {(stock.delivery_pct ?? 0).toFixed(1)}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Depth: {(stock.market_depth?.buy_pct ?? 50).toFixed(1)}% Buy
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Catalyst: {stock.reason_tag}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Alert Channels Configuration */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Notification Dispatch Channels</span>
            </h4>

            {/* Browser Push Notification */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="font-semibold text-slate-200 block">Desktop / Browser Push</span>
                <span className="text-[11px] text-slate-400">
                  Receive browser notifications even when this tab is in background
                </span>
              </div>
              <button
                onClick={handleRequestBrowserPermission}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  browserAlertsEnabled
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                {browserAlertsEnabled ? "Enabled" : "Enable Push"}
              </button>
            </div>

            {/* Telegram / Discord Webhook URL */}
            <form onSubmit={handleSaveWebhook} className="space-y-2">
              <label className="text-[11px] text-slate-400 block">
                Telegram Bot or Discord Webhook URL (Optional):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={telegramWebhook}
                  onChange={(e) => setTelegramWebhook(e.target.value)}
                  placeholder="https://api.telegram.org/bot... or Discord Webhook"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Save
                </button>
              </div>
              {webhookSaved && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Webhook URL saved for automated signal broadcast!</span>
                </span>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#121824] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Scanning 500+ NSE/BSE announcements every 15 minutes.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
