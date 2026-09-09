import React, { useState, useEffect } from "react";
import { Battery, Wifi, Signal, Smartphone, Maximize2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface AndroidFrameProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  activeTab,
  onTabChange,
  alertCount,
}) => {
  const [isPhoneMode, setIsPhoneMode] = useState<boolean>(false);
  const [istTime, setIstTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to IST
      const istString = now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setIstTime(istString);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-start p-0 sm:p-3 md:p-5 selection:bg-amber-500/30">
      {/* Top Utility bar to toggle Android Frame vs Full View */}
      <div className="w-full max-w-6xl px-4 py-2 flex items-center justify-between text-xs text-slate-400 border border-slate-800 bg-[#0F1219] rounded-lg mb-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-slate-200 font-semibold tracking-wide">NSE Live Engine</span>
          <span className="text-slate-700">|</span>
          <span className="text-amber-400 font-mono text-[11px]">IST {istTime}</span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="pill" />
          <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400">High Density Workstation</span>
          <button
            onClick={() => setIsPhoneMode(!isPhoneMode)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-[11px] font-medium"
          >
            {isPhoneMode ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Full Workstation View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Android Phone View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isPhoneMode
            ? "max-w-[430px] rounded-[40px] border-[8px] border-slate-800 shadow-2xl shadow-black/90 overflow-hidden bg-[#0F1219] my-2 ring-1 ring-slate-700"
            : "max-w-6xl rounded-lg border border-slate-800 bg-[#0F1219] shadow-xl overflow-hidden"
        }`}
      >
        {/* Android Status Bar (Visible in phone mode or top of view) */}
        <div className="w-full px-5 pt-2.5 pb-2 flex items-center justify-between text-xs font-mono text-slate-400 select-none bg-[#0B0E14] border-b border-slate-800/80 sticky top-0 z-30">
          <div className="font-semibold text-[12px] text-slate-200">{istTime || "09:00"}</div>

          {/* Camera Punch-hole for Android mockup */}
          {isPhoneMode && (
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 shadow-inner flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-slate-800" />
            </div>
          )}

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[10px] font-bold text-emerald-400 font-mono">5G NSE</span>
            <Signal className="w-3 h-3 text-slate-400" />
            <Wifi className="w-3 h-3 text-slate-400" />
            <Battery className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="px-3 md:px-5 pb-20 md:pb-6 pt-2 bg-[#0B0E14]/40">
          {children}
        </div>

        {/* Telemetry Status Bar (Desktop High-Density Footer) */}
        <div className="hidden md:flex items-center justify-between px-5 py-2 border-t border-slate-800 bg-[#0F1219] text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">DAEMON: <span className="text-slate-200">main.py</span></span>
            <span className="text-slate-700">•</span>
            <span>PID: <span className="text-slate-300">8842</span></span>
            <span className="text-slate-700">•</span>
            <span>SYNC: <span className="text-emerald-400">watchdog 3.0</span></span>
            <span className="text-slate-700">•</span>
            <span>TZ: <span className="text-amber-400">Asia/Kolkata</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span>MEM: <span className="text-slate-300">124MB / 512MB</span></span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ENGINE: ONLINE
            </span>
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div
          id="android-bottom-nav"
          className="fixed md:sticky bottom-0 left-0 right-0 z-40 bg-[#0F1219]/95 backdrop-blur-md border-t border-slate-800 px-3 py-1.5 max-w-[430px] mx-auto md:max-w-none"
        >
          <div className="flex items-center justify-around">
            <button
              onClick={() => onTabChange("stocks")}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded transition text-[11px] font-medium ${
                activeTab === "stocks"
                  ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="leading-none">Jewellery</span>
            </button>

            <button
              onClick={() => onTabChange("alerts")}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded transition text-[11px] font-medium relative ${
                activeTab === "alerts"
                  ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <span className="leading-none">Alerts</span>
              {alertCount > 0 && (
                <span className="absolute top-1 right-2.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] font-mono flex items-center justify-center">
                  {alertCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange("config")}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded transition text-[11px] font-medium ${
                activeTab === "config"
                  ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <span className="leading-none">Settings</span>
            </button>

            <button
              onClick={() => onTabChange("python")}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded transition text-[11px] font-medium ${
                activeTab === "python"
                  ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <span className="leading-none">Python</span>
            </button>
          </div>

          {/* Android Home Navigation Gesture Pill */}
          <div className="w-24 h-1 rounded-full bg-slate-700 mx-auto mt-1.5" />
        </div>
      </div>
    </div>
  );
};
