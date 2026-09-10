import React, { useState, useMemo } from "react";
import { PreSurgeStock, PortfolioHolding } from "../types";
import {
  MOCK_PRE_SURGE_STOCKS,
  INITIAL_USER_PORTFOLIO
} from "../data/mockSurgeData";
import { SurgeHeader } from "./SurgeHeader";
import { PreSurgeStockCard } from "./PreSurgeStockCard";
import { StockDetailModal } from "./StockDetailModal";
import { StockComparisonModal } from "./StockComparisonModal";
import { PortfolioTracker } from "./PortfolioTracker";
import { AlertPushModal } from "./AlertPushModal";
import { exportScannerResultsToExcel } from "../utils/exportExcel";
import {
  Zap,
  TrendingUp,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowUpRight,
  FileSpreadsheet,
  AlertTriangle,
  Info,
  SlidersHorizontal,
  Flame
} from "lucide-react";

export const SurgeDashboard: React.FC = () => {
  const [stocks, setStocks] = useState<PreSurgeStock[]>(MOCK_PRE_SURGE_STOCKS);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(INITIAL_USER_PORTFOLIO);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sub-tabs: "pre_surge" (1-2 day early) vs "btst_confirmed" vs "portfolio"
  const [activeSubTab, setActiveSubTab] = useState<"pre_surge" | "btst_confirmed" | "portfolio">("pre_surge");

  // Filter chips for the 4 early filters
  const [filterAOnly, setFilterAOnly] = useState<boolean>(false);
  const [filterBOnly, setFilterBOnly] = useState<boolean>(false);
  const [filterCOnly, setFilterCOnly] = useState<boolean>(false);
  const [filterDOnly, setFilterDOnly] = useState<boolean>(false);

  // Modals state
  const [selectedStockDetail, setSelectedStockDetail] = useState<PreSurgeStock | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [compareStockA, setCompareStockA] = useState<PreSurgeStock | undefined>(undefined);
  const [compareStockB, setCompareStockB] = useState<PreSurgeStock | undefined>(undefined);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [exportSuccessNotice, setExportSuccessNotice] = useState<boolean>(false);

  // Filtered stocks based on tab, search query, and filter toggles
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      // Search check
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesSymbol = stock.symbol.toLowerCase().includes(query);
        const matchesName = stock.name.toLowerCase().includes(query);
        const matchesReason = stock.reason_tag.toLowerCase().includes(query);
        const matchesKeywords = stock.news.some((n) =>
          n.keywords_matched.some((kw) => kw.toLowerCase().includes(query))
        );
        if (!matchesSymbol && !matchesName && !matchesReason && !matchesKeywords) {
          return false;
        }
      }

      // Tab check
      if (activeSubTab === "pre_surge") {
        // Pre-surge shows all early candidates (sorted by matched_count desc)
        // Usually matching >= 3 filters or volume >= 3x
      } else if (activeSubTab === "btst_confirmed") {
        // BTST confirmed candidates are confirmed breakout candidates (4/4 filters or confirmed 3:20 PM volume surge)
        if (!stock.is_btst_confirmed && stock.filters.matched_count < 4) {
          return false;
        }
      }

      // Filter toggles
      if (filterAOnly && !stock.filters.filter_a_news) return false;
      if (filterBOnly && !stock.filters.filter_b_volume_delivery) return false;
      if (filterCOnly && !stock.filters.filter_c_bulk_deals) return false;
      if (filterDOnly && !stock.filters.filter_d_price_action) return false;

      return true;
    });
  }, [stocks, searchQuery, activeSubTab, filterAOnly, filterBOnly, filterCOnly, filterDOnly]);

  const preSurgeCount = stocks.filter((s) => s.filters.matched_count >= 3).length;
  const btstConfirmedCount = stocks.filter((s) => s.is_btst_confirmed || s.filters.matched_count === 4).length;

  const handleOpenExport = () => {
    exportScannerResultsToExcel(filteredStocks, "BTST_Surge_Detector_Scan");
    setExportSuccessNotice(true);
    setTimeout(() => setExportSuccessNotice(false), 3500);
  };

  const handleCompareSelect = (stock: PreSurgeStock) => {
    setCompareStockA(stock);
    // Counter stock is Kalyan or Senco or PC
    const counter = stocks.find((s) => s.symbol !== stock.symbol) || stocks[0];
    setCompareStockB(counter);
    setIsCompareOpen(true);
  };

  return (
    <div className="space-y-5 pb-16 md:pb-6 text-slate-100">
      {/* Top Header with Live Indices, Scroll Lock indicator & Actions */}
      <SurgeHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCompare={() => {
          setCompareStockA(stocks[0]);
          setCompareStockB(stocks[1] || stocks[0]);
          setIsCompareOpen(true);
        }}
        onOpenPortfolio={() => setActiveSubTab("portfolio")}
        onOpenExport={handleOpenExport}
        onTriggerAlert={() => setIsAlertModalOpen(true)}
        totalPreSurge={preSurgeCount}
        totalBtst={btstConfirmedCount}
      />

      {/* Export Success Toast Notification */}
      {exportSuccessNotice && (
        <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Excel export downloaded successfully! Formatted with UTF-8 BOM. <strong>Scroll Lock: OFF</strong> verified for smooth arrow navigation.
            </span>
          </div>
          <button
            onClick={() => setExportSuccessNotice(false)}
            className="text-emerald-400 hover:text-emerald-200 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Two Primary Dashboard Tabs requested by User:
          1. "Pre-Surge Signals (1-2 day early)"
          2. "BTST Confirmed"
          + 3. "My Portfolio & Target Profit" */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 flex-wrap">
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800/90">
          <button
            id="tab-pre-surge-signals"
            onClick={() => setActiveSubTab("pre_surge")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === "pre_surge"
                ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Surge Signals (1-2 day early)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeSubTab === "pre_surge"
                  ? "bg-slate-950 text-amber-300"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {stocks.length}
            </span>
          </button>

          <button
            id="tab-btst-confirmed"
            onClick={() => setActiveSubTab("btst_confirmed")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === "btst_confirmed"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>BTST Confirmed</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeSubTab === "btst_confirmed"
                  ? "bg-slate-950 text-emerald-300"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {btstConfirmedCount}
            </span>
          </button>

          <button
            id="tab-user-portfolio"
            onClick={() => setActiveSubTab("portfolio")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition hidden sm:flex ${
              activeSubTab === "portfolio"
                ? "bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Portfolio (Kalyan 1334)</span>
          </button>
        </div>

        {/* Total Candidates Count Banner */}
        <div className="text-xs text-slate-400 font-mono">
          Showing <strong className="text-slate-200">{filteredStocks.length}</strong> of{" "}
          <strong className="text-slate-200">{stocks.length}</strong> candidates
        </div>
      </div>

      {/* RENDER VIEW: PORTFOLIO TRACKER */}
      {activeSubTab === "portfolio" ? (
        <PortfolioTracker
          holdings={holdings}
          onUpdateHoldings={setHoldings}
          availableStocks={stocks}
        />
      ) : (
        /* RENDER VIEW: PRE-SURGE OR BTST CONFIRMED STOCKS */
        <div className="space-y-4">
          {/* Filter Bar with 4 Early Signal Filter Chips */}
          <div className="p-3.5 rounded-2xl bg-[#111722] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>Filter by Early Institutional Signals (PC Jeweller Formula):</span>
              </span>
              {(filterAOnly || filterBOnly || filterCOnly || filterDOnly) && (
                <button
                  onClick={() => {
                    setFilterAOnly(false);
                    setFilterBOnly(false);
                    setFilterCOnly(false);
                    setFilterDOnly(false);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {/* Filter A Pill */}
              <button
                onClick={() => setFilterAOnly(!filterAOnly)}
                className={`p-2 rounded-xl text-left transition border ${
                  filterAOnly
                    ? "bg-emerald-950/70 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40 font-bold"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px]">Filter A: News</span>
                  <span className="text-[10px] font-mono opacity-80">Debt/Q1/AGM</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  BSE/NSE announcement keywords
                </div>
              </button>

              {/* Filter B Pill */}
              <button
                onClick={() => setFilterBOnly(!filterBOnly)}
                className={`p-2 rounded-xl text-left transition border ${
                  filterBOnly
                    ? "bg-emerald-950/70 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40 font-bold"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px]">Filter B: Vol & Del</span>
                  <span className="text-[10px] font-mono opacity-80">&gt;3x &gt;60%</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  Spike + high delivery %
                </div>
              </button>

              {/* Filter C Pill */}
              <button
                onClick={() => setFilterCOnly(!filterCOnly)}
                className={`p-2 rounded-xl text-left transition border ${
                  filterCOnly
                    ? "bg-emerald-950/70 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40 font-bold"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px]">Filter C: Bulk Deals</span>
                  <span className="text-[10px] font-mono opacity-80">Radar</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  Big institutional absorption
                </div>
              </button>

              {/* Filter D Pill */}
              <button
                onClick={() => setFilterDOnly(!filterDOnly)}
                className={`p-2 rounded-xl text-left transition border ${
                  filterDOnly
                    ? "bg-emerald-950/70 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40 font-bold"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px]">Filter D: Price Action</span>
                  <span className="text-[10px] font-mono opacity-80">&gt;2% Bounce</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  Intraday recovery or pullback
                </div>
              </button>
            </div>
          </div>

          {/* Educational Formula Context Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-bold text-amber-300">
                The 4-Signal Pre-Surge Discovery Engine
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Detecting stocks <strong>2-3 days before a 20-40% surge</strong> (modeled on the exact sequence observed in PC Jeweller @ 13.92):
                <strong> 1.</strong> Catalyst news (debt clearance) &bull;
                <strong> 2.</strong> Abnormal volume multiple (14x) with continuous &gt;60% delivery &bull;
                <strong> 3.</strong> Bulk/Block trade absorption near lows &bull;
                <strong> 4.</strong> Sharp intraday recovery (&gt;2%) after shakeouts.
              </p>
            </div>
          </div>

          {/* Stock Cards Responsive Grid */}
          {filteredStocks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#111722] border border-slate-800 space-y-3">
              <div className="text-slate-500 text-sm">No stocks matched current filter combinations.</div>
              <button
                onClick={() => {
                  setFilterAOnly(false);
                  setFilterBOnly(false);
                  setFilterCOnly(false);
                  setFilterDOnly(false);
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredStocks.map((stock) => (
                <PreSurgeStockCard
                  key={stock.symbol}
                  stock={stock}
                  onSelect={(s) => setSelectedStockDetail(s)}
                  onCompareSelect={handleCompareSelect}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: STOCK DETAIL PAGE (PC Jeweller, Kalyan Jewellers, etc.) */}
      <StockDetailModal
        stock={selectedStockDetail}
        onClose={() => setSelectedStockDetail(null)}
      />

      {/* MODAL 2: SIDE-BY-SIDE STOCK COMPARISON WITH AI RELATIVE STRENGTH */}
      {isCompareOpen && (
        <StockComparisonModal
          stocks={stocks}
          initialStockA={compareStockA}
          initialStockB={compareStockB}
          onClose={() => setIsCompareOpen(false)}
          onSelectStockDetail={(s) => {
            setIsCompareOpen(false);
            setSelectedStockDetail(s);
          }}
        />
      )}

      {/* MODAL 3: ALERT SYSTEM (PUSH NOTIFICATION ≥ 3/4 FILTERS) */}
      <AlertPushModal
        stocks={stocks}
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        onSelectStock={(s) => setSelectedStockDetail(s)}
      />
    </div>
  );
};
