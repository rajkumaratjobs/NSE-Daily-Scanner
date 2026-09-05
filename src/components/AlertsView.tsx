import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Send,
  MessageCircle,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  Settings,
  RefreshCw,
  Phone,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  XCircle,
  Activity,
  Zap,
  Terminal,
  Bug,
  Radio,
  Wrench
} from "lucide-react";
import { ScannerConfig, TestAlertResult } from "../types";

interface AlertsViewProps {
  formattedMessage: string;
  hasTelegram: boolean;
  hasWhatsApp: boolean;
  config?: ScannerConfig;
  onSaveConfig?: (newConfig: ScannerConfig) => Promise<void>;
  onRefreshStatus?: () => Promise<void>;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  formattedMessage,
  hasTelegram: initialHasTelegram,
  hasWhatsApp: initialHasWhatsApp,
  config,
  onSaveConfig,
  onRefreshStatus
}) => {
  const [copied, setCopied] = useState<"none" | "whatsapp" | "telegram" | "all">("none");
  const [isDispatching, setIsDispatching] = useState<string | null>(null);
  const [directPhone, setDirectPhone] = useState(config?.notifications?.whatsapp?.to_number || "919962988612");
  const [showConfigDrawer, setShowConfigDrawer] = useState<"none" | "telegram" | "whatsapp">("none");
  const [testAlertResult, setTestAlertResult] = useState<TestAlertResult | null>(null);
  const [showDiagnosticPanel, setShowDiagnosticPanel] = useState<boolean>(false);
  const [showRawPayloads, setShowRawPayloads] = useState<boolean>(false);

  // Local configuration form state
  const [tgBotToken, setTgBotToken] = useState(config?.notifications?.telegram?.bot_token || "");
  const [tgChatId, setTgChatId] = useState(config?.notifications?.telegram?.chat_id || "");
  const [twSid, setTwSid] = useState(config?.notifications?.whatsapp?.account_sid || "");
  const [twAuth, setTwAuth] = useState(config?.notifications?.whatsapp?.auth_token || "");
  const [twTo, setTwTo] = useState(config?.notifications?.whatsapp?.to_number || "919962988612");
  const [callmebotKey, setCallmebotKey] = useState(config?.notifications?.whatsapp?.callmebot_key || "");
  const [callmebotPhone, setCallmebotPhone] = useState(config?.notifications?.whatsapp?.callmebot_phone || "919962988612");
  const [waMode, setWaMode] = useState<"twilio" | "callmebot">("twilio");

  // Keep local state in sync when server config updates
  useEffect(() => {
    if (config?.notifications?.telegram) {
      if (config.notifications.telegram.bot_token) setTgBotToken(config.notifications.telegram.bot_token);
      if (config.notifications.telegram.chat_id) setTgChatId(config.notifications.telegram.chat_id);
    }
    if (config?.notifications?.whatsapp) {
      if (config.notifications.whatsapp.account_sid) setTwSid(config.notifications.whatsapp.account_sid);
      if (config.notifications.whatsapp.auth_token) setTwAuth(config.notifications.whatsapp.auth_token);
      if (config.notifications.whatsapp.to_number) {
        setTwTo(config.notifications.whatsapp.to_number);
        setDirectPhone(config.notifications.whatsapp.to_number);
      }
      if (config.notifications.whatsapp.callmebot_key) setCallmebotKey(config.notifications.whatsapp.callmebot_key);
      if (config.notifications.whatsapp.callmebot_phone) setCallmebotPhone(config.notifications.whatsapp.callmebot_phone);
    }
  }, [config]);

  // Notification result feedback
  const [dispatchResult, setDispatchResult] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
    instructions?: string;
    hint?: string;
  } | null>(null);

  const handleCopy = (type: "whatsapp" | "telegram" | "all") => {
    navigator.clipboard.writeText(formattedMessage);
    setCopied(type);
    setTimeout(() => setCopied("none"), 2500);
  };

  // Direct 1-Click dispatch via WhatsApp Web or Mobile App (no credentials needed)
  const handleDirectWhatsAppShare = () => {
    const encoded = encodeURIComponent(formattedMessage);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Direct 1-Click dispatch to specific phone number via WhatsApp Click-to-Chat
  const handleDirectPhoneWhatsApp = () => {
    const cleanNumber = directPhone.replace(/[^0-9]/g, "");
    if (!cleanNumber) {
      setDispatchResult({
        type: "error",
        title: "Phone Number Required",
        message: "Please enter a valid phone number with country code (e.g. 919876543210) to open WhatsApp chat."
      });
      return;
    }
    const encoded = encodeURIComponent(formattedMessage);
    const url = `https://wa.me/${cleanNumber}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setDispatchResult({
      type: "info",
      title: "Opening WhatsApp Chat",
      message: `Launched WhatsApp chat with +${cleanNumber}. The formatted NSE alert is pre-filled and ready to send!`
    });
  };

  // Direct 1-Click dispatch via Telegram Web or Desktop/Mobile App (no credentials needed)
  const handleDirectTelegramShare = () => {
    const encoded = encodeURIComponent(formattedMessage);
    const url = `https://t.me/share/url?url=&text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Automated API Dispatch (Real Network Call)
  const handleSendLiveAlert = async (channel: "telegram" | "whatsapp" | "both") => {
    setIsDispatching(channel);
    setDispatchResult(null);

    try {
      const res = await fetch("/api/alerts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          message: formattedMessage,
          credentials: {
            telegram_bot_token: tgBotToken,
            telegram_chat_id: tgChatId,
            twilio_sid: twSid,
            twilio_auth_token: twAuth,
            whatsapp_to: twTo || directPhone,
            callmebot_key: callmebotKey,
            callmebot_phone: callmebotPhone || directPhone
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setDispatchResult({
          type: "error",
          title: "Dispatch Failed",
          message: data.message || "Failed to deliver alert."
        });
        return;
      }

      const results = data.results || {};
      const tg = results.telegram;
      const wa = results.whatsapp;

      if (channel === "telegram") {
        if (tg?.status === "sent") {
          setDispatchResult({
            type: "success",
            title: "Telegram Alert Delivered!",
            message: tg.message || "Alert dispatched to Telegram channel/group successfully."
          });
        } else if (tg?.status === "missing_credentials") {
          setShowConfigDrawer("telegram");
          setDispatchResult({
            type: "info",
            title: "Telegram Setup Required",
            message: "Telegram Bot Token or Chat ID not configured yet.",
            instructions: "Enter your Telegram BOT_TOKEN and CHAT_ID in the box below, or use the 1-click 'Open in Telegram' button above."
          });
        } else {
          setDispatchResult({
            type: "error",
            title: "Telegram Dispatch Error",
            message: tg?.message || "Telegram API rejected the alert.",
            hint: "Verify your Bot Token and ensure you have started the bot by messaging /start to it."
          });
        }
      } else if (channel === "whatsapp") {
        if (wa?.status === "sent") {
          setDispatchResult({
            type: "success",
            title: "WhatsApp Alert Dispatched!",
            message: wa.message || "Alert dispatched via Twilio WhatsApp API successfully."
          });
        } else if (wa?.status === "missing_credentials") {
          setShowConfigDrawer("whatsapp");
          setDispatchResult({
            type: "info",
            title: "WhatsApp Setup Required",
            message: "Twilio WhatsApp credentials not configured yet.",
            instructions: "Enter your Twilio SID, Auth Token and target number below, OR click 'Open in WhatsApp' / 'Send to Phone' above for instant zero-configuration delivery!"
          });
        } else {
          setDispatchResult({
            type: "error",
            title: "WhatsApp Dispatch Error",
            message: wa?.message || "Twilio API rejected the alert.",
            hint: "Make sure recipient has joined your Twilio Sandbox by sending 'join <code>' to +14155238886."
          });
        }
      } else {
        // Both channels
        const summary = [];
        if (tg) summary.push(`Telegram: ${tg.message}`);
        if (wa) summary.push(`WhatsApp: ${wa.message}`);
        setDispatchResult({
          type: data.status === "ok" ? "success" : data.status === "partial" ? "info" : "error",
          title: data.status === "ok" ? "All Alerts Delivered" : "Broadcast Status",
          message: summary.join("\n")
        });
      }
    } catch (err: any) {
      setDispatchResult({
        type: "error",
        title: "Connection Error",
        message: err.message || "Failed to reach alert server."
      });
    } finally {
      setIsDispatching(null);
    }
  };

  // Test Ping API
  const handleTestPing = async (channel: "telegram" | "whatsapp") => {
    setIsDispatching(`test-${channel}`);
    setDispatchResult(null);

    try {
      const res = await fetch("/api/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          credentials: {
            telegram_bot_token: tgBotToken,
            telegram_chat_id: tgChatId,
            twilio_sid: twSid,
            twilio_auth_token: twAuth,
            whatsapp_to: twTo || directPhone,
            callmebot_key: callmebotKey,
            callmebot_phone: callmebotPhone || directPhone
          }
        })
      });

      const data = await res.json();

      if (data.status === "sent") {
        setDispatchResult({
          type: "success",
          title: `${channel === "telegram" ? "Telegram" : "WhatsApp"} Connection Verified!`,
          message: data.message
        });
      } else if (data.status === "missing_credentials") {
        setShowConfigDrawer(channel);
        setDispatchResult({
          type: "info",
          title: `Credentials Needed for ${channel === "telegram" ? "Telegram Bot" : "WhatsApp"}`,
          message: data.message,
          instructions: data.instructions
        });
      } else {
        setDispatchResult({
          type: "error",
          title: `${channel === "telegram" ? "Telegram" : "WhatsApp"} Test Failed`,
          message: data.message,
          hint: data.hint
        });
      }
    } catch (err: any) {
      setDispatchResult({
        type: "error",
        title: "Test Request Failed",
        message: err.message
      });
    } finally {
      setIsDispatching(null);
    }
  };

  // Primary Test Alert: triggers simulated message send to configured Telegram and WhatsApp endpoints to debug communication failure
  const handleTriggerTestAlert = async (simulate: boolean = true) => {
    setIsDispatching("test-alert");
    setDispatchResult(null);

    try {
      const res = await fetch("/api/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "all",
          simulate,
          credentials: {
            telegram_bot_token: tgBotToken,
            telegram_chat_id: tgChatId,
            twilio_sid: twSid,
            twilio_auth_token: twAuth,
            whatsapp_to: twTo || directPhone,
            callmebot_key: callmebotKey,
            callmebot_phone: callmebotPhone || directPhone
          }
        })
      });

      const data: TestAlertResult = await res.json();
      setTestAlertResult(data);
      setShowDiagnosticPanel(true);

      if (data.status === "ok") {
        setDispatchResult({
          type: "success",
          title: "Test Alert: Endpoints Verified",
          message: data.summary
        });
      } else if (data.status === "partial") {
        setDispatchResult({
          type: "info",
          title: "Test Alert Simulation: Diagnostics Completed",
          message: data.summary
        });
      } else {
        setDispatchResult({
          type: "error",
          title: "Test Alert: Communication Issues Detected",
          message: data.summary
        });
      }
    } catch (err: any) {
      setDispatchResult({
        type: "error",
        title: "Test Alert Request Failed",
        message: err.message || "Failed to reach diagnostic simulation endpoint."
      });
    } finally {
      setIsDispatching(null);
    }
  };

  // Save Credentials to config.json
  const handleSaveCredentials = async () => {
    if (!config || !onSaveConfig) return;

    const updatedConfig: ScannerConfig = {
      ...config,
      notifications: {
        ...config.notifications,
        telegram: {
          enabled: true,
          bot_token: tgBotToken,
          chat_id: tgChatId
        },
        whatsapp: {
          enabled: true,
          account_sid: twSid,
          auth_token: twAuth,
          from_number: config.notifications?.whatsapp?.from_number || "+14155238886",
          to_number: twTo || directPhone,
          callmebot_key: callmebotKey,
          callmebot_phone: callmebotPhone || directPhone
        }
      }
    };

    setIsDispatching("saving-credentials");
    try {
      await onSaveConfig(updatedConfig);
      if (onRefreshStatus) await onRefreshStatus();
      setDispatchResult({
        type: "success",
        title: "Credentials Saved Successfully",
        message: "Notification settings updated in config.json. You can now test or send live alerts."
      });
      setShowConfigDrawer("none");
    } catch (err: any) {
      setDispatchResult({
        type: "error",
        title: "Save Failed",
        message: err.message || "Failed to update configuration."
      });
    } finally {
      setIsDispatching(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Alert Header Banner with Instant Direct Share */}
      <div className="rounded-lg bg-[#0F1219] border border-slate-800 p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-xs uppercase tracking-wide">Alert Formatter & Dispatcher</h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Formatted daily NSE jewellery stock alerts with 1-click direct delivery & automated bots
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Daily 9:00 AM IST
          </span>
        </div>

        {/* Primary Instant 1-Click Action Buttons */}
        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Test Alert Button */}
          <button
            id="btn-test-alert"
            onClick={() => handleTriggerTestAlert(true)}
            disabled={isDispatching === "test-alert"}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm font-mono active:scale-98 disabled:opacity-50"
            title="Trigger a simulated message send to configured Telegram and WhatsApp endpoints to debug communication failure"
          >
            {isDispatching === "test-alert" ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Activity className="w-4 h-4 text-slate-950" />
            )}
            <span>Test Alert</span>
            <span className="text-[9px] px-1 py-0.2 bg-slate-950/20 rounded font-semibold uppercase tracking-wider">
              Debug
            </span>
          </button>

          {/* 1-Click WhatsApp Web / App */}
          <button
            id="btn-open-whatsapp"
            onClick={handleDirectWhatsAppShare}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-sm font-mono active:scale-98"
            title="Open WhatsApp Web / Desktop / Mobile with formatted message ready to send"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Open in WhatsApp</span>
            <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
          </button>

          {/* 1-Click Telegram Web / App */}
          <button
            id="btn-open-telegram"
            onClick={handleDirectTelegramShare}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-sm font-mono active:scale-98"
            title="Open Telegram Web / Desktop / Mobile with formatted message ready to send"
          >
            <Send className="w-4 h-4" />
            <span>Open in Telegram</span>
            <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
          </button>

          {/* Copy formatted text */}
          <button
            id="btn-copy-alert-text"
            onClick={() => handleCopy("all")}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 font-mono active:scale-98"
          >
            {copied === "all" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copied === "all" ? "Copied to Clipboard!" : "Copy Alert Text"}</span>
          </button>
        </div>

        {/* Quick Send directly to specific WhatsApp Phone Number */}
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>Send Directly to WhatsApp Number (Zero API setup required):</span>
            </label>
            <span className="text-[10px] font-mono text-slate-500">Include country code (e.g. 91...)</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 919876543210 (Country code + phone)"
              value={directPhone}
              onChange={e => setDirectPhone(e.target.value)}
              className="flex-1 bg-[#0B0E14] border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400 placeholder:text-slate-600"
            />
            <button
              id="btn-send-phone-whatsapp"
              onClick={handleDirectPhoneWhatsApp}
              className="px-3.5 py-1.5 rounded bg-emerald-700/80 hover:bg-emerald-600 text-white font-mono text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send to Phone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Test Alert Endpoint Diagnostics & Simulation Debugger Panel */}
      {showDiagnosticPanel && testAlertResult && (
        <div id="test-alert-diagnostic-panel" className="rounded-lg bg-[#0F1219] border border-amber-500/40 p-4 space-y-3 font-mono">
          {/* Diagnostic Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Endpoint Communication Diagnostics
                  </h4>
                  {testAlertResult.status === "ok" ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ALL PASS
                    </span>
                  ) : testAlertResult.status === "partial" ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      ACTION REQUIRED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                      FAILED
                    </span>
                  )}
                  {testAlertResult.simulated && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      SIMULATED SEND
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Targeted analysis for Telegram & WhatsApp notification channels &bull; {testAlertResult.timestamp}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTriggerTestAlert(true)}
                disabled={isDispatching === "test-alert"}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition"
                title="Re-run simulation and diagnostic analysis"
              >
                <RefreshCw className={`w-3 h-3 ${isDispatching === "test-alert" ? "animate-spin" : ""}`} />
                <span>Re-simulate</span>
              </button>
              <button
                onClick={() => handleTriggerTestAlert(false)}
                disabled={isDispatching === "test-alert"}
                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold flex items-center gap-1.5 transition"
                title="Send real live test messages to both endpoints"
              >
                <Send className="w-3 h-3" />
                <span>Live Send Test</span>
              </button>
              <button
                onClick={() => setShowDiagnosticPanel(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Diagnostic Summary Note */}
          <div className="p-2.5 rounded bg-[#0B0E14] border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] leading-relaxed">
              <span className="font-semibold text-slate-200">Diagnostics Summary: </span>
              {testAlertResult.summary}
            </div>
          </div>

          {/* Channel Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Telegram Endpoint Diagnostics Card */}
            <div className="rounded border border-slate-800 bg-[#0B0E14] p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-bold text-white">Telegram Gateway</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      testAlertResult.telegram.status === "sent"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : testAlertResult.telegram.status === "error"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {testAlertResult.telegram.status.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="truncate max-w-[200px]" title={testAlertResult.telegram.endpointUrl}>
                    {testAlertResult.telegram.endpointUrl}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] ${
                      testAlertResult.telegram.reachability === "reachable"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {testAlertResult.telegram.reachability}
                  </span>
                </div>

                {/* Step Breakdown */}
                <div className="mt-2.5 space-y-1.5">
                  {testAlertResult.telegram.debugSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[10px]">
                      {step.status === "pass" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : step.status === "fail" ? (
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      ) : step.status === "warn" ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <span className="font-semibold text-slate-300">{step.name}: </span>
                        <span className="text-slate-400 font-sans">{step.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Diagnosis Box */}
                {testAlertResult.telegram.diagnosis && (
                  <div className="mt-2.5 p-2 rounded bg-slate-900/90 border border-slate-800 text-[10px]">
                    <div className="text-amber-400 font-semibold mb-0.5">Root Cause Diagnosis:</div>
                    <p className="text-slate-300 font-sans leading-relaxed">
                      {testAlertResult.telegram.diagnosis}
                    </p>
                  </div>
                )}
              </div>

              {/* Actionable Fix */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                {testAlertResult.telegram.actionableFix && (
                  <p className="text-[10px] text-amber-300 font-sans leading-relaxed mb-2">
                    ⚡ {testAlertResult.telegram.actionableFix}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfigDrawer("telegram")}
                    className="flex-1 px-2.5 py-1.5 rounded bg-blue-600/80 hover:bg-blue-500 text-white text-[10px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Configure Telegram Bot</span>
                  </button>
                  <button
                    onClick={handleDirectTelegramShare}
                    className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
                    title="Open directly in Telegram without API credentials"
                  >
                    Direct Web
                  </button>
                </div>
              </div>
            </div>

            {/* WhatsApp Endpoint Diagnostics Card */}
            <div className="rounded border border-slate-800 bg-[#0B0E14] p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-white">WhatsApp Gateway (Twilio)</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      testAlertResult.whatsapp.status === "sent"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : testAlertResult.whatsapp.status === "error"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {testAlertResult.whatsapp.status.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="truncate max-w-[200px]" title={testAlertResult.whatsapp.endpointUrl}>
                    {testAlertResult.whatsapp.endpointUrl}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] ${
                      testAlertResult.whatsapp.reachability === "reachable"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {testAlertResult.whatsapp.reachability}
                  </span>
                </div>

                {/* Step Breakdown */}
                <div className="mt-2.5 space-y-1.5">
                  {testAlertResult.whatsapp.debugSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[10px]">
                      {step.status === "pass" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : step.status === "fail" ? (
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      ) : step.status === "warn" ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <span className="font-semibold text-slate-300">{step.name}: </span>
                        <span className="text-slate-400 font-sans">{step.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Diagnosis Box */}
                {testAlertResult.whatsapp.diagnosis && (
                  <div className="mt-2.5 p-2.5 rounded bg-slate-900/90 border border-slate-800 text-[10px] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Root Cause Diagnosis:</span>
                    </div>
                    <p className="text-slate-300 font-sans leading-relaxed">
                      {testAlertResult.whatsapp.diagnosis}
                    </p>
                    {testAlertResult.whatsapp.issueDetails?.accountSidIssue && (
                      <div className="mt-2 p-2 rounded bg-red-950/40 border border-red-800/60 text-red-200">
                        <div className="font-bold flex items-center gap-1 mb-1">
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                          <span>Twilio SID Format Error (Code 20003)</span>
                        </div>
                        <p className="font-sans text-[11px] leading-relaxed text-red-300">
                          Your Twilio SID starts with <b>'{twSid.slice(0, 2)}'</b>. Twilio Account SIDs <b>ALWAYS start with 'AC'</b> (34 characters).
                          Keys starting with 'HX' are Conversation/Service SIDs and will fail with <code>Authentication Error - invalid username (Code 20003)</code>.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <a
                            href="https://console.twilio.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono text-[10px] inline-flex items-center gap-1"
                          >
                            <span>Open Twilio Console (Copy 'AC...' SID)</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={handleDirectPhoneWhatsApp}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-[10px] inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send Directly via WhatsApp (No Twilio needed)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actionable Fix */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                {testAlertResult.whatsapp.actionableFix && (
                  <p className="text-[10px] text-amber-300 font-sans leading-relaxed mb-2">
                    ⚡ {testAlertResult.whatsapp.actionableFix}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfigDrawer("whatsapp")}
                    className="flex-1 px-2.5 py-1.5 rounded bg-emerald-600/80 hover:bg-emerald-500 text-white text-[10px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Configure WhatsApp Provider</span>
                  </button>
                  <button
                    onClick={handleDirectPhoneWhatsApp}
                    className="px-2.5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-slate-950 font-bold text-[10px] transition flex items-center gap-1"
                    title="Send pre-filled alert directly to your phone via WhatsApp"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send to Phone</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Payload Inspector Accordion */}
          <div className="pt-1 border-t border-slate-800/60">
            <button
              onClick={() => setShowRawPayloads(p => !p)}
              className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition"
            >
              <Terminal className="w-3 h-3" />
              <span>{showRawPayloads ? "Hide Simulated JSON Payloads" : "Inspect Simulated JSON Payloads"}</span>
              {showRawPayloads ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showRawPayloads && (
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded bg-black/60 border border-slate-800 overflow-x-auto">
                  <div className="text-blue-400 font-bold mb-1">Telegram Simulated Payload:</div>
                  <pre className="text-slate-300 whitespace-pre-wrap">
                    {JSON.stringify(testAlertResult.telegram.payloadPreview, null, 2)}
                  </pre>
                </div>
                <div className="p-2 rounded bg-black/60 border border-slate-800 overflow-x-auto">
                  <div className="text-emerald-400 font-bold mb-1">WhatsApp Twilio Simulated Payload:</div>
                  <pre className="text-slate-300 whitespace-pre-wrap">
                    {JSON.stringify(testAlertResult.whatsapp.payloadPreview, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time Diagnostics / Result Banner */}
      {dispatchResult && (
        <div
          className={`rounded-lg border p-3 text-xs font-mono transition-all ${
            dispatchResult.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : dispatchResult.type === "info"
              ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
              : "bg-red-950/40 border-red-500/40 text-red-200"
          }`}
        >
          <div className="flex items-start gap-2">
            {dispatchResult.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : dispatchResult.type === "info" ? (
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h5 className="font-bold uppercase tracking-wide text-[11px] mb-0.5">
                {dispatchResult.title}
              </h5>
              <p className="text-[11px] leading-relaxed whitespace-pre-wrap opacity-95">
                {dispatchResult.message}
              </p>
              {dispatchResult.instructions && (
                <div className="mt-2 p-2 rounded bg-black/40 border border-slate-800 text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {dispatchResult.instructions}
                </div>
              )}
              {dispatchResult.hint && (
                <p className="mt-1 text-[10px] text-amber-300 font-sans italic">
                  💡 Hint: {dispatchResult.hint}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message Terminal Output Preview */}
      <div className="rounded-lg bg-[#0B0E14] border border-slate-800 p-3.5 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="text-amber-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            DISPATCH PAYLOAD PREVIEW
          </span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-slate-400 font-mono">
              {formattedMessage.length} chars
            </span>
            {formattedMessage.length > 1450 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono font-semibold">
                Auto-splits ({Math.ceil(formattedMessage.length / 1450)} parts for WhatsApp)
              </span>
            )}
            <span className="text-slate-500">FORMAT: PROMPT SPEC</span>
          </div>
        </div>

        <pre className="mt-2.5 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed select-all max-h-60 overflow-y-auto scrollbar-thin">
          {formattedMessage}
        </pre>
      </div>

      {/* Automated Bot & Cloud API Dispatch Section */}
      <div className="rounded-lg bg-[#0F1219] border border-slate-800 p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Automated Background Dispatchers (Telegram Bot & Twilio)</span>
          </h4>
          <div className="flex items-center gap-2.5">
            <button
              id="btn-quick-test-alert"
              onClick={() => handleTriggerTestAlert(true)}
              disabled={isDispatching === "test-alert"}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 transition px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30"
              title="Trigger simulated alert to debug communication failures"
            >
              <Activity className="w-3 h-3 text-amber-400" />
              <span>Test Alert</span>
            </button>
            <button
              onClick={() => setShowConfigDrawer(prev => (prev === "none" ? "telegram" : "none"))}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 transition"
            >
              <span>{showConfigDrawer === "none" ? "Configure API Keys" : "Hide API Config"}</span>
              {showConfigDrawer === "none" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Channel 1: Telegram Bot */}
          <div className="p-3 rounded bg-[#0B0E14] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-white flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  <span>Telegram Bot Dispatch</span>
                </span>
                {initialHasTelegram || (tgBotToken && tgChatId) ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" /> Configured
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> Setup Needed
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                Sends live alerts to your Telegram chat or channel via official Telegram Bot API.
              </p>
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  id="btn-send-live-telegram"
                  onClick={() => handleSendLiveAlert("telegram")}
                  disabled={Boolean(isDispatching)}
                  className="py-1.5 px-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono transition flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isDispatching === "telegram" ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send Alert</span>
                </button>

                <button
                  id="btn-test-telegram-ping"
                  onClick={() => handleTestPing("telegram")}
                  disabled={Boolean(isDispatching)}
                  className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-mono border border-slate-700 transition flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isDispatching === "test-telegram" ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : null}
                  <span>Test Ping</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowConfigDrawer(prev => (prev === "telegram" ? "none" : "telegram"))}
                className="w-full text-center text-[10px] text-slate-400 hover:text-slate-300 font-mono py-0.5"
              >
                {showConfigDrawer === "telegram" ? "▲ Close Telegram Settings" : "▼ Edit Bot Token & Chat ID"}
              </button>
            </div>
          </div>

          {/* Channel 2: WhatsApp (Twilio) */}
          <div className="p-3 rounded bg-[#0B0E14] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-white flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp (Twilio API)</span>
                </span>
                {initialHasWhatsApp || (twSid && twAuth && (twTo || directPhone)) ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" /> Configured
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> Setup Needed
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                Sends automated WhatsApp messages to your number using Twilio Messaging API.
              </p>
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  id="btn-send-live-whatsapp"
                  onClick={() => handleSendLiveAlert("whatsapp")}
                  disabled={Boolean(isDispatching)}
                  className="py-1.5 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold font-mono transition flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isDispatching === "whatsapp" ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send Alert</span>
                </button>

                <button
                  id="btn-test-whatsapp-ping"
                  onClick={() => handleTestPing("whatsapp")}
                  disabled={Boolean(isDispatching)}
                  className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono border border-slate-700 transition flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isDispatching === "test-whatsapp" ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : null}
                  <span>Test Ping</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowConfigDrawer(prev => (prev === "whatsapp" ? "none" : "whatsapp"))}
                className="w-full text-center text-[10px] text-slate-400 hover:text-slate-300 font-mono py-0.5"
              >
                {showConfigDrawer === "whatsapp" ? "▲ Close Twilio Settings" : "▼ Edit Twilio SID & Target Number"}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Configuration Drawer */}
        {showConfigDrawer !== "none" && (
          <div className="mt-3 p-3 rounded-lg bg-[#0B0E14] border border-amber-500/30 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                <span>Configure {showConfigDrawer === "telegram" ? "Telegram Bot" : "Twilio WhatsApp"} Credentials</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfigDrawer(showConfigDrawer === "telegram" ? "whatsapp" : "telegram")}
                  className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                >
                  Switch to {showConfigDrawer === "telegram" ? "Twilio WhatsApp" : "Telegram"}
                </button>
                <button
                  onClick={() => setShowConfigDrawer("none")}
                  className="text-[10px] text-slate-500 hover:text-slate-300"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {showConfigDrawer === "telegram" ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Telegram Bot Token (from @BotFather)</label>
                  <input
                    type="password"
                    placeholder="e.g. 7123456789:AAFx..."
                    value={tgBotToken}
                    onChange={e => setTgBotToken(e.target.value)}
                    className="w-full bg-[#0F1219] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Telegram Chat ID (from @userinfobot or channel)</label>
                  <input
                    type="text"
                    placeholder="e.g. 123456789 or -100123456789"
                    value={tgChatId}
                    onChange={e => setTgChatId(e.target.value)}
                    className="w-full bg-[#0F1219] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="p-2 rounded bg-blue-950/30 border border-blue-800/40 text-[10px] text-blue-300 space-y-1 leading-relaxed">
                  <p className="font-semibold">Quick 3-step setup:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-300 font-sans text-[11px]">
                    <li>Open Telegram and message <b>@BotFather</b> to create a bot (send <code>/newbot</code>)</li>
                    <li>Copy the HTTP API Bot Token into the field above</li>
                    <li>Message <b>@userinfobot</b> to get your personal Chat ID (or add bot as admin to a channel)</li>
                    <li><b>Crucial:</b> Send <code>/start</code> to your bot so it has permission to message you!</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {/* Provider Tab Selector */}
                <div className="flex gap-2 p-1 bg-slate-900 rounded border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setWaMode("twilio")}
                    className={`flex-1 py-1 px-2 rounded text-[11px] font-bold font-mono transition ${
                      waMode === "twilio"
                        ? "bg-amber-500 text-slate-950 shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Twilio WhatsApp API
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaMode("callmebot")}
                    className={`flex-1 py-1 px-2 rounded text-[11px] font-bold font-mono transition flex items-center justify-center gap-1 ${
                      waMode === "callmebot"
                        ? "bg-emerald-500 text-slate-950 shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>CallMeBot</span>
                    <span className="text-[9px] px-1 py-0.2 bg-emerald-950/40 text-emerald-900 rounded font-semibold uppercase">
                      Free Bot
                    </span>
                  </button>
                </div>

                {waMode === "twilio" ? (
                  <div className="space-y-2.5">
                    {twSid && !twSid.startsWith("AC") && (
                      <div className="p-2 rounded bg-red-950/50 border border-red-800/80 text-[11px] text-red-200 space-y-1 font-sans">
                        <div className="font-bold flex items-center gap-1 font-mono text-red-300">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Twilio Error 20003 Prevention:</span>
                        </div>
                        <p>
                          Your current SID starts with <b>'{twSid.slice(0, 2)}'</b>. Twilio will reject this with <code>Authentication Error (20003)</code>.
                          Twilio Account SIDs <b>must start with 'AC'</b>.
                        </p>
                        <a
                          href="https://console.twilio.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-amber-300 underline font-mono text-[10px]"
                        >
                          Find Account SID on Twilio Console Dashboard →
                        </a>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Twilio Account SID <span className="text-amber-400">(Must start with 'AC')</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={twSid}
                        onChange={e => setTwSid(e.target.value)}
                        className={`w-full bg-[#0F1219] border ${
                          twSid && !twSid.startsWith("AC") ? "border-red-500" : "border-slate-700"
                        } rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Twilio Auth Token</label>
                      <input
                        type="password"
                        placeholder="Your Twilio Auth Token (from Twilio Console)"
                        value={twAuth}
                        onChange={e => setTwAuth(e.target.value)}
                        className="w-full bg-[#0F1219] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Target WhatsApp Phone Number (with country code)</label>
                      <input
                        type="text"
                        placeholder="+919962988612"
                        value={twTo}
                        onChange={e => {
                          setTwTo(e.target.value);
                          setDirectPhone(e.target.value);
                        }}
                        className="w-full bg-[#0F1219] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <div className="p-2 rounded bg-emerald-950/30 border border-emerald-800/40 text-[10px] text-emerald-300 space-y-1 leading-relaxed font-sans">
                      <p className="font-semibold font-mono">Twilio Sandbox Opt-in:</p>
                      <p className="text-slate-300 text-[11px]">
                        Recipient phone must text your sandbox join code (e.g. <code>join &lt;word&gt;</code>) to <b>+1 415 523 8886</b> once before Twilio allows messages.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">WhatsApp Phone Number (with country code)</label>
                      <input
                        type="text"
                        placeholder="e.g. 919962988612"
                        value={callmebotPhone}
                        onChange={e => setCallmebotPhone(e.target.value)}
                        className="w-full bg-[#0F1219] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">CallMeBot API Key</label>
                      <input
                        type="text"
                        placeholder="e.g. 123456"
                        value={callmebotKey}
                        onChange={e => setCallmebotKey(e.target.value)}
                        className="w-full bg-[#0F1219] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                      />
                    </div>

                    <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-[11px] text-emerald-200 space-y-1.5 font-sans leading-relaxed">
                      <p className="font-semibold font-mono text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>How to get free CallMeBot WhatsApp API key (30 seconds):</span>
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                        <li>Save <b>+34 644 44 20 62</b> to your phone contacts as <i>CallMeBot</i>.</li>
                        <li>Open WhatsApp and send this exact text: <code>I allow callmebot to send me messages</code></li>
                        <li>CallMeBot will instantly reply with your free <b>apikey</b>.</li>
                        <li>Paste your phone number and apikey above! 100% free and automated.</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                id="btn-save-credentials"
                onClick={handleSaveCredentials}
                disabled={Boolean(isDispatching)}
                className="flex-1 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                {isDispatching === "saving-credentials" ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>Save Credentials to config.json</span>
              </button>

              <button
                onClick={() => handleTestPing(showConfigDrawer as any)}
                disabled={Boolean(isDispatching)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition border border-slate-700"
              >
                Test Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

