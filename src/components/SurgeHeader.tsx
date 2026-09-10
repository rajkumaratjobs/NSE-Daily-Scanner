import React from "react";
import { MOCK_INDICES } from "../data/mockSurgeData";
import {
  TrendingUp,
  Activity,
  Zap,
  SlidersHorizontal,
  FileSpreadsheet,
  Bell,
  Scale,
  Briefcase,
  Search,
  CheckCircle2
} from "lucide-react";

interface SurgeHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCompare: () => void;
  onOpenPortfolio: () => void;
  onOpenExport: () => void;
  onTriggerAlert: () => void;
  totalPreSurge: number;
  totalBtst: number;
}

export const SurgeHeader: React.FC<SurgeHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCompare,
  onOpenPortfolio,
  onOpenExport,
  onTriggerAlert,
  totalPreSurge,
  totalBtst
}) => {
  return (
    <header className="space-y-3">
      {/* Top Indices Live Ticker Bar */}
      <div className="bg-[#0B0E14] border-b border-slate-800/80 px-4 py-2 -mx-4 -mt-4 sm:mx-0 sm:mt-0 sm:rounded-xl">
        <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-none text-xs">
          <div className="flex items-center gap-6 shrink-0">
            {/* Market Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>NSE / BSE: LIVE</span>
            </div>

            {/* Nifty 50 */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">NIFTY 50</span>
              <span className="font-mono font-bold text-slate-100">
                {MOCK_INDICES.nifty50.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <span className="font-mono text-emerald-400 flex items-center font-medium">
                +{MOCK_INDICES.nifty50.change.toFixed(2)} (+{MOCK_INDICES.nifty50.changePct}%)
              </span>
            </div>

            {/* Bank Nifty */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">BANK NIFTY</span>
              <span className="font-mono font-bold text-slate-100">
                {MOCK_INDICES.bankNifty.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <span className="font-mono text-emerald-400 flex items-center font-medium">
                +{MOCK_INDICES.bankNifty.change.toFixed(2)} (+{MOCK_INDICES.bankNifty.changePct}%)
              </span>
            </div>

            {/* MCX Gold */}
            <div className="flex items-center gap-2 hidden md:flex">
              <span className="text-amber-400/90 font-medium">MCX GOLD (24K)</span>
              <span className="font-mono font-bold text-slate-100">
                ₹{MOCK_INDICES.gold24k.value.toLocaleString("en-IN")}
              </span>
              <span className="font-mono text-amber-400 text-[11px]">
                +₹{MOCK_INDICES.gold24k.change} (+{MOCK_INDICES.gold24k.changePct}%)
              </span>
            </div>
          </div>

          {/* Scroll Lock indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              title="Scroll Lock is turned OFF by default to ensure normal Excel cell navigation upon data export"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/70 text-slate-300 text-[11px] font-mono select-none"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scroll Lock: <strong className="text-emerald-400">OFF</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main App Title & Operational Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100">
                  BTST Surge Detector
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  v2.4 INSTITUTIONAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Detect Indian stocks 2-3 days before 20-40% surges using 4 early institutional signals
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Compare Two Stocks */}
          <button
            onClick={onOpenCompare}
            id="btn-compare-stocks"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 active:scale-95 transition shadow-sm"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Compare 2 Stocks</span>
          </button>

          {/* User Portfolio */}
          <button
            onClick={onOpenPortfolio}
            id="btn-portfolio-tracker"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 active:scale-95 transition shadow-sm"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            <span>My Portfolio (Kalyan 1334 Sh)</span>
          </button>

          {/* Push Alert Simulator */}
          <button
            onClick={onTriggerAlert}
            id="btn-test-alert"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 active:scale-95 transition"
            title="Simulate Pre-Surge Alert push notification"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Pre-Surge Alert</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={onOpenExport}
            id="btn-export-excel"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 active:scale-95 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel Export</span>
          </button>
        </div>
      </div>

      {/* Search & Quick Filters */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by symbol or keyword (e.g. PCJEWELLER, KALYANKJIL, Debt Free, 14x Vol)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm text-slate-100 placeholder:text-slate-500 transition outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>
    </header>
  );
};
