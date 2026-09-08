/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { StockData, ScannerConfig, ScanResult, SectorSentimentData } from "./types";
import { calculateRSI } from "./utils/rsi";
import { AndroidFrame } from "./components/AndroidFrame";
import { StockCard } from "./components/StockCard";
import { AlertsView } from "./components/AlertsView";
import { ConfigEditor } from "./components/ConfigEditor";
import { PythonFilesViewer } from "./components/PythonFilesViewer";
import { PWAInstallButton } from "./components/PWAInstallButton";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { NotificationBanner, ActiveNotification } from "./components/NotificationBanner";
import { JewellerySectorSummary } from "./components/JewellerySectorSummary";
import { JewelleryNewsTicker } from "./components/JewelleryNewsTicker";
import { SectorSentimentCard } from "./components/SectorSentimentCard";
import { SectorDailyPerformanceChart } from "./components/SectorDailyPerformanceChart";
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
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  BellRing,
  Zap
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("stocks");
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "BREAKOUT" | "RESULTS" | "VALUE" | "BUY" | "HOLD" | "SELL" | "RSI_OVERBOUGHT" | "RSI_OVERSOLD" | "TARGET_BREACHED" | "VOLUME_SPIKE"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [activeNotifications, setActiveNotifications] = useState<ActiveNotification[]>([]);
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

        // Detect any price target breaches from scan result
        data.stocks.forEach(stock => {
          if (stock.alert_threshold?.enabled && stock.alert_threshold.breached) {
            handleTriggerNotification(
              `${stock.symbol} Target Hit!`,
              `Market price ₹${stock.price} breached your target level of ₹${stock.alert_threshold.targetPrice}!`,
              stock
            );
          }
        });
      }
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleTriggerNotification = (title: string, message: string, stock?: StockData) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newNotif: ActiveNotification = {
      id,
      title,
      message,
      stock,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    };
    setActiveNotifications(prev => [newNotif, ...prev.slice(0, 2)]);

    setTimeout(() => {
      setActiveNotifications(prev => prev.filter(n => n.id !== id));
    }, 8500);
  };

  const handleDismissNotification = (id: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
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

  const [sectorSentiment, setSectorSentiment] = useState<SectorSentimentData | null>(null);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);
  const [showSentimentCard, setShowSentimentCard] = useState(true);
  const [showDailyPerformanceChart, setShowDailyPerformanceChart] = useState(true);

  const triggerSectorSentiment = async (targetStocks?: StockData[]) => {
    setIsAnalyzingSentiment(true);
    setShowSentimentCard(true);
    try {
      const visibleBasket =
        targetStocks && targetStocks.length > 0
          ? targetStocks
          : filteredStocks.length > 0
          ? filteredStocks
          : stocks;

      const res = await fetch("/api/stock-sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks: visibleBasket })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "ok" && data.sentiment) {
          setSectorSentiment(data.sentiment);
          handleTriggerNotification(
            "Gemini Sentiment Analyzed",
            `${data.sentiment.sentiment_stance} stance across ${data.sentiment.visible_stocks_count} jewellery stocks (${data.sentiment.advancing_count} Up, ${data.sentiment.declining_count} Down)`
          );
        }
      } else {
        console.error("Failed to fetch sector sentiment", await res.text());
      }
    } catch (err) {
      console.error("Sector sentiment error:", err);
    } finally {
      setIsAnalyzingSentiment(false);
    }
  };

  const stocks = scanResult?.stocks || [];

  const handleUpdateStock = (updatedStock: StockData) => {
    setScanResult(prev => {
      if (!prev) return prev;
      const newStocks = prev.stocks.map(s => (s.symbol === updatedStock.symbol ? updatedStock : s));
      return {
        ...prev,
        stocks: newStocks,
        alertedStocks: newStocks.filter(s => s.alerts && s.alerts.length > 0)
      };
    });
  };

  const getStockAction = (stock: StockData): "BUY" | "SELL" | "HOLD" => {
    if (stock.ai_action) return stock.ai_action;
    const v = (stock.ai_verdict || "").toLowerCase();
    if (v.startsWith("buy")) return "BUY";
    if (v.startsWith("sell")) return "SELL";
    return "HOLD";
  };

  // Filter stocks by active filter and search
  const filteredStocks = stocks.filter(stock => {
    const matchesSearch =
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "ALL") return true;
    if (activeFilter === "BUY" || activeFilter === "HOLD" || activeFilter === "SELL") {
      return getStockAction(stock) === activeFilter;
    }
    if (activeFilter === "RSI_OVERBOUGHT") {
      return calculateRSI(stock).isOverbought;
    }
    if (activeFilter === "RSI_OVERSOLD") {
      return calculateRSI(stock).isOversold;
    }
    if (activeFilter === "TARGET_BREACHED") {
      return Boolean(stock.alert_threshold?.breached);
    }
    if (activeFilter === "VOLUME_SPIKE") {
      const volMultiple =
        typeof stock.vol_multiple === "number" && stock.vol_multiple > 0
          ? stock.vol_multiple
          : stock.avg_vol_20d > 0
          ? stock.volume / stock.avg_vol_20d
          : 1.0;
      return volMultiple >= 2.0;
    }
    return stock.alerts.some(a => a.type === activeFilter);
  });

  const targetBreachedCount = stocks.filter(s => s.alert_threshold?.breached).length;
  const volumeSpikeCount = stocks.filter(s => {
    const vm = typeof s.vol_multiple === "number" && s.vol_multiple > 0
      ? s.vol_multiple
      : s.avg_vol_20d > 0
      ? s.volume / s.avg_vol_20d
      : 1.0;
    return vm >= 2.0;
  }).length;
  const breakoutCount = stocks.filter(s => s.alerts.some(a => a.type === "BREAKOUT")).length;
  const resultsCount = stocks.filter(s => s.alerts.some(a => a.type === "RESULTS")).length;
  const valueCount = stocks.filter(s => s.alerts.some(a => a.type === "VALUE")).length;
  const buyCount = stocks.filter(s => getStockAction(s) === "BUY").length;
  const holdCount = stocks.filter(s => getStockAction(s) === "HOLD").length;
  const sellCount = stocks.filter(s => getStockAction(s) === "SELL").length;
  const overboughtCount = stocks.filter(s => calculateRSI(s).isOverbought).length;
  const oversoldCount = stocks.filter(s => calculateRSI(s).isOversold).length;

  return (
    <AndroidFrame
      activeTab={activeTab}
      onTabChange={setActiveTab}
      alertCount={scanResult?.totalAlerts || 0}
    >
      <NotificationBanner
        notifications={activeNotifications}
        onDismiss={handleDismissNotification}
        onSelectStock={(stock) => {
          setActiveTab("stocks");
          setSearchQuery(stock.symbol);
        }}
      />
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

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-stock-sentiment"
              data-testid="btn-stock-sentiment"
              type="button"
              onClick={() => triggerSectorSentiment(filteredStocks)}
              disabled={isAnalyzingSentiment}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 shadow-sm active:scale-95 transition disabled:opacity-60 cursor-pointer"
              title="Aggregate all visible stocks for Gemini Stock Sentiment Analysis"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isAnalyzingSentiment ? "animate-spin" : ""}`} />
              <span>{isAnalyzingSentiment ? "Analyzing..." : "Stock Sentiment Analysis"}</span>
            </button>

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

        {/* Horizontal Auto-Scrolling Jewellery Sector Financial News Ticker */}
        <div className="mt-3">
          <JewelleryNewsTicker
            onSelectStock={(symbol) => {
              setActiveTab("stocks");
              setSearchQuery(symbol);
            }}
          />
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

            {/* Target Breached Filter Pill (highlighted when any breach exists) */}
            <button
              onClick={() => setActiveFilter("TARGET_BREACHED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                activeFilter === "TARGET_BREACHED"
                  ? "bg-rose-500 text-white shadow font-bold"
                  : targetBreachedCount > 0
                  ? "bg-rose-950/70 text-rose-300 hover:bg-rose-900/80 border border-rose-500/60 animate-pulse"
                  : "bg-slate-900 text-rose-400/80 hover:bg-slate-800 border border-rose-500/20"
              }`}
            >
              <BellRing className="w-3.5 h-3.5 text-rose-400" />
              <span>Target Breached ({targetBreachedCount})</span>
            </button>

            {/* Volume Spikes (>2x 20D Avg) Filter Pill */}
            <button
              onClick={() => setActiveFilter("VOLUME_SPIKE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                activeFilter === "VOLUME_SPIKE"
                  ? "bg-rose-500 text-white shadow font-bold"
                  : volumeSpikeCount > 0
                  ? "bg-rose-950/70 text-rose-300 hover:bg-rose-900/80 border border-rose-500/60"
                  : "bg-slate-900 text-rose-400/80 hover:bg-slate-800 border border-rose-500/20"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Volume Spikes &gt;2x ({volumeSpikeCount})</span>
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

            {/* AI Verdict Filter Pills */}
            <button
              onClick={() => setActiveFilter("BUY")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                activeFilter === "BUY"
                  ? "bg-emerald-500 text-slate-950 shadow font-bold"
                  : "bg-slate-900 text-emerald-300 hover:bg-slate-800 border border-emerald-500/40"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>AI Buy ({buyCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter("HOLD")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                activeFilter === "HOLD"
                  ? "bg-amber-500 text-slate-950 shadow font-bold"
                  : "bg-slate-900 text-amber-300 hover:bg-slate-800 border border-amber-500/40"
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>AI Hold ({holdCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter("SELL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                activeFilter === "SELL"
                  ? "bg-rose-500 text-white shadow font-bold"
                  : "bg-slate-900 text-rose-300 hover:bg-slate-800 border border-rose-500/40"
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>AI Sell ({sellCount})</span>
            </button>

            {/* RSI Indicator Filters */}
            <button
              onClick={() => setActiveFilter("RSI_OVERBOUGHT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                activeFilter === "RSI_OVERBOUGHT"
                  ? "bg-rose-500 text-white shadow font-bold"
                  : "bg-slate-900 text-rose-400 hover:bg-slate-800 border border-rose-500/30"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>RSI Overbought ({overboughtCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter("RSI_OVERSOLD")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                activeFilter === "RSI_OVERSOLD"
                  ? "bg-emerald-500 text-slate-950 shadow font-bold"
                  : "bg-slate-900 text-emerald-400 hover:bg-slate-800 border border-emerald-500/30"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>RSI Oversold ({oversoldCount})</span>
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

          {/* Sector Movement Summary Row: Total percentage movement of all jewellery stocks combined */}
          <JewellerySectorSummary
            stocks={stocks}
            filteredCount={filteredStocks.length}
            onTriggerSentiment={() => triggerSectorSentiment(filteredStocks)}
            isAnalyzingSentiment={isAnalyzingSentiment}
            onToggleDailyChart={() => setShowDailyPerformanceChart(prev => !prev)}
            showDailyChart={showDailyPerformanceChart}
          />

          {/* Aggregated Sector Movement: 30-Day Daily Performance Area Chart (powered by Recharts) */}
          {showDailyPerformanceChart && (
            <SectorDailyPerformanceChart
              stocks={stocks}
              filteredStocks={filteredStocks}
            />
          )}

          {/* Sector Sentiment Card: Displays the aggregated Gemini market sentiment paragraph */}
          {showSentimentCard && (sectorSentiment || isAnalyzingSentiment) && (
            <SectorSentimentCard
              sentiment={sectorSentiment}
              isLoading={isAnalyzingSentiment}
              visibleCount={filteredStocks.length > 0 ? filteredStocks.length : stocks.length}
              onRefresh={() => triggerSectorSentiment(filteredStocks)}
              onDismiss={() => setShowSentimentCard(false)}
            />
          )}

          {/* Stocks List */}
          <div className="space-y-3">
            {filteredStocks.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
                No stocks match the selected filter.
              </div>
            ) : (
              filteredStocks.map((stock, idx) => (
                <StockCard
                  key={stock.symbol}
                  stock={stock}
                  index={idx}
                  onUpdateStock={handleUpdateStock}
                  onTriggerNotification={handleTriggerNotification}
                />
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
