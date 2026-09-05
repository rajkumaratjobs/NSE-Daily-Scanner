import React, { useState } from "react";
import { ScannerConfig } from "../types";
import { Clock, Sliders, CheckCircle2, Shield, BellRing, Sparkles, RefreshCw, Send, MessageCircle } from "lucide-react";

interface ConfigEditorProps {
  config: ScannerConfig;
  onSave: (newConfig: ScannerConfig) => Promise<void>;
  isSaving: boolean;
}

export const ConfigEditor: React.FC<ConfigEditorProps> = ({ config, onSave, isSaving }) => {
  const [formData, setFormData] = useState<ScannerConfig>(JSON.parse(JSON.stringify(config)));
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTimeChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      scan_time: val
    }));
  };

  const handleAlertToggle = (key: "breakout" | "results" | "value") => {
    setFormData(prev => ({
      ...prev,
      alert_types: {
        ...prev.alert_types,
        [key]: {
          ...prev.alert_types[key],
          enabled: !prev.alert_types[key].enabled
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Watchdog Banner */}
      <div className="rounded-lg bg-[#0F1219] border border-slate-800 p-3.5">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded bg-amber-500/15 text-amber-300 shrink-0 border border-amber-500/20">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-xs flex items-center gap-1.5">
              <span>Dynamic Watchdog File Synchronization</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                watchdog 3.0
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">
              Updates to <code className="text-amber-300">config.json</code> are monitored dynamically by <code className="text-slate-300">main.py</code> every minute and on file modification. Changing the scan time reschedules the daily trigger without restarting the daemon.
            </p>
          </div>
        </div>
      </div>

      {/* Scan Time Card */}
      <div className="rounded-lg bg-[#0F1219] border border-slate-800 p-3.5">
        <div className="flex items-center gap-2 mb-2.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">Scan Schedule (IST)</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-medium font-mono">Daily Scan Time (HH:MM)</label>
            <input
              type="time"
              value={formData.scan_time}
              onChange={e => handleTimeChange(e.target.value)}
              className="w-full bg-[#0B0E14] border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
            />
            <span className="text-[10px] text-slate-500 mt-1 block font-mono">
              Default: 09:00 AM IST (NSE opening scan)
            </span>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-medium font-mono">Cron Expression Equivalent</label>
            <input
              type="text"
              value={formData.cron || "0 9 * * *"}
              onChange={e => setFormData(prev => ({ ...prev, cron: e.target.value }))}
              placeholder="0 9 * * *"
              className="w-full bg-[#0B0E14] border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
            />
            <span className="text-[10px] text-slate-500 mt-1 block font-mono">
              Format: minute hour day month weekday
            </span>
          </div>
        </div>
      </div>

      {/* Filter 1: Breakout Settings */}
      <div className="rounded-lg bg-[#0F1219] border border-slate-800 p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">Alert 1: Breakout Filter</h4>
          </div>
          <button
            type="button"
            onClick={() => handleAlertToggle("breakout")}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition ${
              formData.alert_types.breakout.enabled
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            {formData.alert_types.breakout.enabled ? "ACTIVE" : "DISABLED"}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mb-2.5 font-sans">
          Triggers when Price &gt; 200 DMA and daily volume exceeds multiplier of 20-day average volume.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-mono">Volume Multiplier (x)</label>
            <input
              type="number"
              step="0.1"
              min="1.0"
              max="10.0"
              value={formData.alert_types.breakout.volume_multiplier_20d}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  alert_types: {
                    ...prev.alert_types,
                    breakout: {
                      ...prev.alert_types.breakout,
                      volume_multiplier_20d: parseFloat(e.target.value) || 2.0
                    }
                  }
                }))
              }
              className="w-full bg-[#0B0E14] border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div className="flex items-center pt-4">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.alert_types.breakout.price_gt_200_dma}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    alert_types: {
                      ...prev.alert_types,
                      breakout: {
                        ...prev.alert_types.breakout,
                        price_gt_200_dma: e.target.checked
                      }
                    }
                  }))
                }
                className="w-3.5 h-3.5 rounded text-amber-500 bg-[#0B0E14] border-slate-700 focus:ring-0"
              />
              <span className="text-[11px] font-mono">Require Price &gt; 200 DMA</span>
            </label>
          </div>
        </div>
      </div>

      {/* Filter 2: Results Filter */}
      <div className="rounded-lg bg-[#0F1219] border border-slate-800 p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <BellRing className="w-3.5 h-3.5 text-sky-400" />
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">Alert 2: Results Filter (Screener.in)</h4>
          </div>
          <button
            type="button"
            onClick={() => handleAlertToggle("results")}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition ${
              formData.alert_types.results.enabled
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            {formData.alert_types.results.enabled ? "ACTIVE" : "DISABLED"}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mb-2.5 font-sans">
          Scrapes screener.in quarterly tables for YoY Sales Growth percentage threshold.
        </p>

        <div>
          <label className="block text-[10px] text-slate-400 mb-1 font-mono">Minimum YoY Sales Growth (%)</label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="100"
            value={formData.alert_types.results.sales_growth_yoy_min_pct}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                alert_types: {
                  ...prev.alert_types,
                  results: {
                    ...prev.alert_types.results,
                    sales_growth_yoy_min_pct: parseFloat(e.target.value) || 15.0
                  }
                }
              }))
            }
            className="w-full bg-[#0B0E14] border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-white font-mono"
          />
        </div>
      </div>

      {/* Filter 3: Value Filter */}
      <div className="rounded-lg bg-[#0F1219] border border-slate-800 p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">Alert 3: Value Filter</h4>
          </div>
          <button
            type="button"
            onClick={() => handleAlertToggle("value")}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition ${
              formData.alert_types.value.enabled
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            {formData.alert_types.value.enabled ? "ACTIVE" : "DISABLED"}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mb-2.5 font-sans">
          Checks PE &lt; 15, ROE &gt; 15%, and Debt/Equity &lt; 0.5 for fundamentally undervalued jewellery stocks.
        </p>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-mono">Max P/E</label>
            <input
              type="number"
              step="1"
              value={formData.alert_types.value.pe_max}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  alert_types: {
                    ...prev.alert_types,
                    value: {
                      ...prev.alert_types.value,
                      pe_max: parseFloat(e.target.value) || 15.0
                    }
                  }
                }))
              }
              className="w-full bg-[#0B0E14] border border-slate-700/80 rounded px-2 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-mono">Min ROE (%)</label>
            <input
              type="number"
              step="1"
              value={formData.alert_types.value.roe_min_pct}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  alert_types: {
                    ...prev.alert_types,
                    value: {
                      ...prev.alert_types.value,
                      roe_min_pct: parseFloat(e.target.value) || 15.0
                    }
                  }
                }))
              }
              className="w-full bg-[#0B0E14] border border-slate-700/80 rounded px-2 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1 font-mono">Max D/E</label>
            <input
              type="number"
              step="0.1"
              value={formData.alert_types.value.debt_to_equity_max}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  alert_types: {
                    ...prev.alert_types,
                    value: {
                      ...prev.alert_types.value,
                      debt_to_equity_max: parseFloat(e.target.value) || 0.5
                    }
                  }
                }))
              }
              className="w-full bg-[#0B0E14] border border-slate-700/80 rounded px-2 py-1.5 text-xs text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Notification Channels Configuration */}
      <div className="rounded-lg bg-[#0F1219] border border-slate-800 p-3.5 space-y-3">
        <h4 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <BellRing className="w-3.5 h-3.5 text-amber-400" />
          <span>Notification Channels & Credentials</span>
        </h4>

        {/* Telegram Configuration */}
        <div className="p-2.5 rounded bg-[#0B0E14] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5 font-mono">
              <Send className="w-3 h-3 text-blue-400" />
              <span>Telegram Bot Notification</span>
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications?.telegram?.enabled !== false}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      telegram: {
                        ...prev.notifications?.telegram,
                        enabled: e.target.checked
                      }
                    }
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">Bot Token (from @BotFather)</label>
              <input
                type="password"
                placeholder="7123456789:AAFx..."
                value={formData.notifications?.telegram?.bot_token || ""}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      telegram: {
                        ...prev.notifications?.telegram,
                        enabled: prev.notifications?.telegram?.enabled ?? true,
                        bot_token: e.target.value
                      }
                    }
                  }))
                }
                className="w-full bg-[#0F1219] border border-slate-700/80 rounded px-2 py-1 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">Chat ID (personal / channel)</label>
              <input
                type="text"
                placeholder="123456789 or -100..."
                value={formData.notifications?.telegram?.chat_id || ""}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      telegram: {
                        ...prev.notifications?.telegram,
                        enabled: prev.notifications?.telegram?.enabled ?? true,
                        chat_id: e.target.value
                      }
                    }
                  }))
                }
                className="w-full bg-[#0F1219] border border-slate-700/80 rounded px-2 py-1 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp (Twilio) Configuration */}
        <div className="p-2.5 rounded bg-[#0B0E14] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5 font-mono">
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp Notification (Twilio API)</span>
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications?.whatsapp?.enabled !== false}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      whatsapp: {
                        ...prev.notifications?.whatsapp,
                        enabled: e.target.checked
                      }
                    }
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">Account SID</label>
              <input
                type="text"
                placeholder="ACxxxxxxxx..."
                value={formData.notifications?.whatsapp?.account_sid || ""}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      whatsapp: {
                        ...prev.notifications?.whatsapp,
                        enabled: prev.notifications?.whatsapp?.enabled ?? true,
                        account_sid: e.target.value
                      }
                    }
                  }))
                }
                className="w-full bg-[#0F1219] border border-slate-700/80 rounded px-2 py-1 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">Auth Token</label>
              <input
                type="password"
                placeholder="Auth Token"
                value={formData.notifications?.whatsapp?.auth_token || ""}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      whatsapp: {
                        ...prev.notifications?.whatsapp,
                        enabled: prev.notifications?.whatsapp?.enabled ?? true,
                        auth_token: e.target.value
                      }
                    }
                  }))
                }
                className="w-full bg-[#0F1219] border border-slate-700/80 rounded px-2 py-1 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">Target Phone (+CountryCode)</label>
              <input
                type="text"
                placeholder="+919876543210"
                value={formData.notifications?.whatsapp?.to_number || ""}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      whatsapp: {
                        ...prev.notifications?.whatsapp,
                        enabled: prev.notifications?.whatsapp?.enabled ?? true,
                        to_number: e.target.value
                      }
                    }
                  }))
                }
                className="w-full bg-[#0F1219] border border-slate-700/80 rounded px-2 py-1 text-xs text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tracked Stocks List */}
      <div className="rounded-lg bg-[#0F1219] border border-slate-800 p-3.5">
        <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Tracked Jewellery Stocks ({formData.stocks.length})</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
          {formData.stocks.map((stk, idx) => (
            <div key={idx} className="p-2 rounded bg-[#0B0E14] border border-slate-800 flex items-center justify-between">
              <span className="font-medium text-slate-200 text-xs">{stk.name}</span>
              <span className="font-mono text-slate-400 text-[10px]">{stk.symbol}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-1">
        <button
          id="btn-save-config"
          type="submit"
          disabled={isSaving}
          className="w-full py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>SAVING TO CONFIG.JSON...</span>
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
              <span>SAVED! WATCHDOG RELOADED</span>
            </>
          ) : (
            <>
              <span>SAVE CHANGES TO CONFIG.JSON</span>
            </>
          )}
        </button>

        {saveSuccess && (
          <p className="text-center text-[11px] text-emerald-400 mt-1.5 font-mono">
            ✓ config.json updated. Watchdog daemon dynamically updated cron schedule!
          </p>
        )}
      </div>
    </form>
  );
};
