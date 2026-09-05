/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { StockData, ScannerConfig, ScanResult } from "./types";
import { AndroidFrame } from "./components/AndroidFrame";
import { StockCard } from "./components/StockCard";
import { AlertsView } from "./components/AlertsView";
import { ConfigEditor } from "./components/ConfigEditor";
import { PythonFilesViewer } from "./components/PythonFilesViewer";
import { PWAInstallButton } from "./components/PWAInstallButton";
import { OfflineIndicator } from "./components/OfflineIndicator";
import {
  Sparkles,
  RefreshCw,
  Clock,
  Gem,
  Activity,
  BarChart3,
  Search,
  Filter,
  Layers,
  ChevronRight
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("stocks");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "BREAKOUT" | "RESULTS" | "VALUE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [config, setConfig] = useState<ScannerConfig>({
    scan_time: "09:00",
    timezone: "Asia/Kolkata",
    cron: "0 9 * * *",
    stocks: [
      { name: "Goldiam International", symbol: "GOLDIAM.NS", screener_slug: "GOLDIAM" },
      { name: "Senco Gold", symbol: "SENCO.NS", screener_slug: "SENCO" },
      { name: "Kalyan Jewellers", symbol: "KALYANKJIL.NS", screener_slug: "KALYANKJIL" },
      { name: "Titan Company", symbol: "TITAN.NS", screener_slug: "TITAN" },
      { name: "Radhika Jeweltech", symbol: "RADHIKAJWE.NS", screener_slug: "RADHIKAJWE" },
      { name: "PC Jeweller", symbol: "PCJEWELLER.NS", screener_slug: "PCJEWELLER" },
      { name: "Tribhovandas Bhimji Zaveri", symbol: "TBZ.NS", screener_slug: "TBZ" },
      { name: "Vaibhav Global", symbol: "VAIBHAVGBL.NS", screener_slug: "VAIBHAVGBL" }
    ],
    alert_types: {
      breakout: { enabled: true, price_gt_200_dma: true, volume_multiplier_20d: 2.0 },
      results: { enabled: true, sales_growth_yoy_min_pct: 15.0 },
      value: { enabled: true, pe_max: 15.0, roe_min_pct: 15.0, debt_to_equity_max: 0.5 }
    }
  });
  const [hasTelegram, setHasTelegram] = useState(false);
  const [hasWhatsApp, setHasWhatsApp] = useState(false);
  const [nextScanCountdown, setNextScanCountdown] = useState<string>("");

  // Load initial configuration and run initial scan
  const refreshStatus = async () => {
    try {
      const cfgRes = await fetch("/api/config");
      if (cfgRes.ok) {
        const cfgData = await cfgRes.json();
        if (cfgData.config) setConfig(cfgData.config);
        setHasTelegram(Boolean(cfgData.hasTelegram));
        setHasWhatsApp(Boolean(cfgData.hasWhatsApp));
      }
    } catch (e) {
      console.error("Config fetch error:", e);
    }
  };

  useEffect(() => {
    async function initApp() {
      await refreshStatus();
      // Initial scan
      runScan();
    }

    initApp();
  }, []);

  // Compute countdown to next scan time (IST)
  useEffect(() => {
    function calculateCountdown() {
      const now = new Date();
      // Parse scan_time HH:MM
      const [targetH, targetM] = (config.scan_time || "09:00").split(":").map(Number);

      // Create target Date today in IST
      const istOffsetMinutes = 330; // UTC+5:30
      const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
      const istNow = new Date(utcNow + istOffsetMinutes * 60000);

      const targetDate = new Date(istNow);
      targetDate.setHours(targetH || 9, targetM || 0, 0, 0);

      if (istNow.getTime() >= targetDate.getTime()) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const diffMs = targetDate.getTime() - istNow.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setNextScanCountdown(`${diffHours}h ${diffMinutes}m`);
    }

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 30000);
    return () => clearInterval(timer);
  }, [config.scan_time]);

  const runScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      if (res.ok) {
        const data: ScanResult = await res.json();
        setScanResult(data);
      }
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveConfig = async (newConfig: ScannerConfig) => {
    setIsSavingConfig(true);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        setConfig(newConfig);
        await refreshStatus();
      }
    } catch (err) {
      console.error("Save config error:", err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const stocks = scanResult?.stocks || [];

  // Filter stocks by active filter and search
  const filteredStocks = stocks.filter(stock => {
    const matchesSearch =
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "ALL") return true;
    return stock.alerts.some(a => a.type === activeFilter);
  });

  const breakoutCount = stocks.filter(s => s.alerts.some(a => a.type === "BREAKOUT")).length;
  const resultsCount = stocks.filter(s => s.alerts.some(a => a.type === "RESULTS")).length;
  const valueCount = stocks.filter(s => s.alerts.some(a => a.type === "VALUE")).length;

  return (
    <AndroidFrame
      activeTab={activeTab}
      onTabChange={setActiveTab}
      alertCount={scanResult?.totalAlerts || 0}
    >
      <OfflineIndicator />

      {/* Main Top Header */}
      <div className="pt-2 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-2 shadow-lg shadow-amber-500/20 flex items-center justify-center text-slate-950">
              <Gem className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-white text-base md:text-lg tracking-tight">
                  Daily NSE Jewellery Scanner
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  NSE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated 9:00 AM IST • Breakouts, Results & Value
              </p>
            </div>
          </div>

          <PWAInstallButton className="hidden sm:inline-flex" />
        </div>

        {/* Scan Status & Trigger Action Bar */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800/80 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="text-slate-300 font-medium flex items-center gap-1.5">
                <span>Daily Schedule:</span>
                <span className="font-mono font-bold text-amber-400">{config.scan_time || "09:00"} IST</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Next scan in <span className="text-slate-200 font-mono font-medium">{nextScanCountdown || "calculating..."}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-scan-now"
              onClick={runScan}
              disabled={isScanning}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition disabled:opacity-70"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Scanning NSE..." : "Scan Now"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: STOCKS VIEW */}
      {activeTab === "stocks" && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                activeFilter === "ALL"
                  ? "bg-slate-100 text-slate-950 shadow"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Stocks ({stocks.length})</span>
            </button>

            <button
              onClick={() => setActiveFilter("BREAKOUT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                activeFilter === "BREAKOUT"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "bg-slate-900 text-emerald-400 hover:bg-slate-800 border border-emerald-500/30"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Breakouts ({breakoutCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter("RESULTS")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                activeFilter === "RESULTS"
                  ? "bg-sky-500 text-slate-950 shadow"
                  : "bg-slate-900 text-sky-400 hover:bg-slate-800 border border-sky-500/30"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Results &gt;15% ({resultsCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter("VALUE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                activeFilter === "VALUE"
                  ? "bg-purple-500 text-slate-950 shadow"
                  : "bg-slate-900 text-purple-400 hover:bg-slate-800 border border-purple-500/30"
              }`}
            >
              <Gem className="w-3.5 h-3.5" />
              <span>Value Picks ({valueCount})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Titan, Senco, Kalyan, Goldiam, PC Jeweller..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Stocks List */}
          <div className="space-y-3">
            {filteredStocks.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
                No stocks match the selected filter.
              </div>
            ) : (
              filteredStocks.map((stock, idx) => (
                <StockCard key={stock.symbol} stock={stock} index={idx} />
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: ALERTS PREVIEW */}
      {activeTab === "alerts" && (
        <AlertsView
          formattedMessage={scanResult?.formattedMessage || "Scanning..."}
          hasTelegram={hasTelegram}
          hasWhatsApp={hasWhatsApp}
          config={config}
          onSaveConfig={handleSaveConfig}
          onRefreshStatus={refreshStatus}
        />
      )}

      {/* VIEW 3: DYNAMIC CONFIG & WATCHDOG */}
      {activeTab === "config" && (
        <ConfigEditor
          config={config}
          onSave={handleSaveConfig}
          isSaving={isSavingConfig}
        />
      )}

      {/* VIEW 4: PYTHON ENGINE & DEPLOYMENT */}
      {activeTab === "python" && <PythonFilesViewer />}
    </AndroidFrame>
  );
}
