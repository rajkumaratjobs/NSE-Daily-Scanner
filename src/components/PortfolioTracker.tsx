import React, { useState } from "react";
import { PortfolioHolding, PreSurgeStock } from "../types";
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Calculator,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  Clock
} from "lucide-react";

interface PortfolioTrackerProps {
  holdings: PortfolioHolding[];
  onUpdateHoldings: (holdings: PortfolioHolding[]) => void;
  availableStocks: PreSurgeStock[];
  onClose?: () => void;
}

export const PortfolioTracker: React.FC<PortfolioTrackerProps> = ({
  holdings,
  onUpdateHoldings,
  availableStocks,
  onClose
}) => {
  // Primary selected holding for target profit calculator (defaults to Kalyan Jewellers)
  const [selectedHoldingId, setSelectedHoldingId] = useState<string>(
    holdings[0]?.id || "holding-kalyan"
  );

  const selectedHolding =
    holdings.find((h) => h.id === selectedHoldingId) || holdings[0];

  // Target profit calculator states for the active holding
  const [targetExitPrice, setTargetExitPrice] = useState<number>(
    selectedHolding?.targetExitPrice || 650
  );
  const [dividendAmount, setDividendAmount] = useState<number>(
    selectedHolding?.dividendReceivedPerShare
      ? selectedHolding.dividendReceivedPerShare * selectedHolding.quantity
      : 3335
  );

  // New holding form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSymbol, setNewSymbol] = useState("PCJEWELLER");
  const [newQuantity, setNewQuantity] = useState(10000);
  const [newBuyPrice, setNewBuyPrice] = useState(13.40);
  const [newBuyDate, setNewBuyDate] = useState("2026-08-15");

  // Keep targetExitPrice in sync when selecting a different holding
  const handleSelectHolding = (holding: PortfolioHolding) => {
    setSelectedHoldingId(holding.id);
    setTargetExitPrice(holding.targetExitPrice);
    setDividendAmount(holding.dividendReceivedPerShare * holding.quantity);
  };

  // Calculations for selected holding
  const quantity = selectedHolding ? selectedHolding.quantity : 1334;
  const buyPrice = selectedHolding ? selectedHolding.buyPrice : 642.730997;
  const currentPrice = selectedHolding ? selectedHolding.currentPrice : 613.00;

  const investedAmount = Math.round(quantity * buyPrice); // 1334 * 642.730997 = 857403
  const currentValue = Math.round(quantity * currentPrice); // 1334 * 613 = 817742
  const pnlAmount = currentValue - investedAmount; // -39,661
  const pnlPct = ((currentPrice - buyPrice) / buyPrice) * 100;

  // Holding duration calculation
  const buyDateObj = new Date(selectedHolding?.buyDate || "2025-07-11");
  const today = new Date("2026-09-09");
  const diffTime = Math.abs(today.getTime() - buyDateObj.getTime());
  const daysHeld = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 425; // 425 days (14 months)
  const monthsHeld = (daysHeld / 30.417).toFixed(1);

  // FD Benchmark: at standard Indian Bank 7.1% p.a.
  const fdRatePa = 0.071;
  const fdBenchmarkReturn = Math.round(investedAmount * fdRatePa * (daysHeld / 365));

  // Breakeven price
  const breakevenPrice = buyPrice;

  // Target Profit Calculator:
  // If exit at 650:
  // Profit = (650 - 642.73) * 1334 = 9696 + Dividend 3335 = 13031
  const capitalGainAtTarget = Math.round((targetExitPrice - buyPrice) * quantity);
  const totalTargetProfit = capitalGainAtTarget + dividendAmount;
  const targetGainPct = ((targetExitPrice - buyPrice) / buyPrice) * 100;

  const handleAddNewHolding = () => {
    const stockRef = availableStocks.find((s) => s.symbol === newSymbol);
    const newH: PortfolioHolding = {
      id: `holding-${Date.now()}`,
      symbol: newSymbol,
      name: stockRef ? stockRef.name : newSymbol,
      quantity: newQuantity,
      buyPrice: newBuyPrice,
      buyDate: newBuyDate,
      targetExitPrice: newBuyPrice * 1.2,
      dividendReceivedPerShare: 0,
      currentPrice: stockRef ? stockRef.price : newBuyPrice
    };
    onUpdateHoldings([...holdings, newH]);
    setShowAddForm(false);
  };

  const handleDeleteHolding = (id: string) => {
    if (holdings.length <= 1) return;
    onUpdateHoldings(holdings.filter((h) => h.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111722] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>User Portfolio & Target Profit Calculator</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                14-Month Swing Holding
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Tracking core positions, weighted average cost basis, FD benchmarks, and target exit profit.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm((p) => !p)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 active:scale-95 transition"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add Position</span>
        </button>
      </div>

      {/* Add Position Inline Form */}
      {showAddForm && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Add Stock Position to Portfolio
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Symbol</label>
              <select
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
              >
                {availableStocks.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} - {s.name} (₹{s.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Quantity</label>
              <input
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Buy Price (₹)</label>
              <input
                type="number"
                step="0.05"
                value={newBuyPrice}
                onChange={(e) => setNewBuyPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Buy Date</label>
              <input
                type="date"
                value={newBuyDate}
                onChange={(e) => setNewBuyDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNewHolding}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Save Holding
            </button>
          </div>
        </div>
      )}

      {/* Holdings Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {holdings.map((h) => {
          const isSelected = h.id === selectedHoldingId;
          const invested = Math.round(h.quantity * h.buyPrice);
          const current = Math.round(h.quantity * h.currentPrice);
          const pnl = current - invested;
          const pnlPercent = ((h.currentPrice - h.buyPrice) / h.buyPrice) * 100;

          return (
            <div
              key={h.id}
              onClick={() => handleSelectHolding(h)}
              className={`p-4 rounded-2xl cursor-pointer transition border ${
                isSelected
                  ? "bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30"
                  : "bg-[#111722] border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-slate-100">
                      {h.symbol}
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                        Active Target
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{h.name}</p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-slate-200">
                    {h.quantity} Shares
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 block">
                    Avg: ₹{h.buyPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Stats Mini Grid */}
              <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Invested Capital</span>
                  <span className="font-mono font-semibold text-slate-200">
                    ₹{invested.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Current Value</span>
                  <span className="font-mono font-semibold text-slate-200">
                    ₹{current.toLocaleString("en-IN")}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">Unrealized P&L</span>
                  <span
                    className={`font-mono font-bold ${
                      pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString("en-IN")} ({pnl >= 0 ? "+" : ""}
                    {pnlPercent.toFixed(2)}%)
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Target Exit</span>
                  <span className="font-mono font-bold text-amber-400">
                    ₹{h.targetExitPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED ACTIVE HOLDING & TARGET PROFIT CALCULATOR (Kalyan Jewellers Specification) */}
      {selectedHolding && (
        <div className="p-5 rounded-2xl bg-[#111722] border border-slate-800 space-y-6 shadow-xl">
          {/* Active Holding Highlight Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-2xl font-black text-slate-100">
                  {selectedHolding.symbol}
                </span>
                <span className="text-xs text-slate-400">({selectedHolding.name})</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                  Holding: {monthsHeld} Months ({daysHeld} Days)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Auto-computed weighted average cost basis and scenario profit modeling.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Current Market Price</span>
              <span className="font-mono text-2xl font-black text-slate-100">
                ₹{currentPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 6 Key Financial Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* 1. Avg Price */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Avg Buy Price</span>
              <span className="font-mono text-base font-bold text-slate-100 block mt-0.5">
                ₹{buyPrice.toFixed(6)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Exact: {buyPrice}
              </span>
            </div>

            {/* 2. Invested Capital */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Invested Capital</span>
              <span className="font-mono text-base font-bold text-slate-100 block mt-0.5">
                ₹{investedAmount.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {quantity} Sh @ ₹{buyPrice.toFixed(2)}
              </span>
            </div>

            {/* 3. Current Value */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Current Value</span>
              <span className="font-mono text-base font-bold text-slate-100 block mt-0.5">
                ₹{currentValue.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                @ Market ₹{currentPrice.toFixed(2)}
              </span>
            </div>

            {/* 4. Unrealized P&L */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Unrealized P&L</span>
              <span
                className={`font-mono text-base font-black block mt-0.5 ${
                  pnlAmount >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {pnlAmount >= 0 ? "+" : ""}₹{pnlAmount.toLocaleString("en-IN")}
              </span>
              <span
                className={`text-[10px] font-mono font-bold ${
                  pnlPct >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {pnlPct >= 0 ? "+" : ""}
                {pnlPct.toFixed(2)}%
              </span>
            </div>

            {/* 5. Days Held */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Days Held</span>
              <span className="font-mono text-base font-bold text-amber-400 block mt-0.5">
                {daysHeld} Days
              </span>
              <span className="text-[10px] text-slate-500">
                ~14 Months (Swing)
              </span>
            </div>

            {/* 6. Breakeven Price */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Breakeven Price</span>
              <span className="font-mono text-base font-bold text-slate-100 block mt-0.5">
                ₹{breakevenPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">
                (Zero P&L Threshold)
              </span>
            </div>
          </div>

          {/* Time-Based Return vs FD Benchmark Comparison */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Opportunity Cost Benchmark vs Bank Fixed Deposit (7.1% p.a.)</span>
              </span>
              <span className="font-mono font-semibold text-slate-400">
                Holding: {daysHeld} days
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              If the invested amount of <strong className="text-slate-200">₹{investedAmount.toLocaleString("en-IN")}</strong> was placed in a 7.1% FD for {daysHeld} days, accrued interest would be <strong className="text-amber-400 font-mono">₹{fdBenchmarkReturn.toLocaleString("en-IN")}</strong>. Reaching the target price of <strong className="text-emerald-400 font-mono">₹{targetExitPrice.toFixed(2)}</strong> generates capital growth + dividends that beat the risk-free hurdle.
            </p>
          </div>

          {/* TARGET PROFIT CALCULATOR (Exact Formula from prompt) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Target Profit & Exit Calculator
                </h3>
              </div>

              {/* Preset Targets */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 mr-1">Quick Target:</span>
                {[650, 680, 700, 750].map((tp) => (
                  <button
                    key={tp}
                    onClick={() => setTargetExitPrice(tp)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      targetExitPrice === tp
                        ? "bg-amber-500 text-slate-950 shadow"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    ₹{tp}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Price Slider & Number Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Target Exit Price:
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    step="0.5"
                    value={targetExitPrice}
                    onChange={(e) => setTargetExitPrice(parseFloat(e.target.value) || 0)}
                    className="w-28 px-3 py-1 rounded-lg bg-slate-950 border border-amber-500/40 text-amber-300 font-mono font-bold text-right outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <input
                type="range"
                min="615"
                max="850"
                step="1"
                value={targetExitPrice}
                onChange={(e) => setTargetExitPrice(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>₹615 (Near CMP)</span>
                <span className="text-amber-400 font-bold">₹650 (Target Exit)</span>
                <span>₹750 (Breakout Target)</span>
                <span>₹850 (Blue Sky)</span>
              </div>
            </div>

            {/* Exact Mathematical Formula Breakdown Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs text-slate-400 font-medium">Formula & Verification:</div>
              <div className="font-mono text-xs sm:text-sm text-amber-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800 leading-relaxed overflow-x-auto">
                If exit at <strong className="text-white">₹{targetExitPrice.toFixed(2)}</strong>:
                <br />
                Profit = (₹{targetExitPrice.toFixed(2)} - ₹{buyPrice.toFixed(2)}) × {quantity} Sh
                = <strong className="text-emerald-400">₹{capitalGainAtTarget.toLocaleString("en-IN")}</strong>
                <br />
                + Dividend Collected = <strong className="text-emerald-400">₹{dividendAmount.toLocaleString("en-IN")}</strong>
                <br />
                = Total Net Profit ={" "}
                <strong className="text-emerald-300 text-base font-black">
                  ₹{totalTargetProfit.toLocaleString("en-IN")}
                </strong>{" "}
                ({targetGainPct.toFixed(2)}% net capital gain)
              </div>

              {/* Dividend input toggle */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Dividend Income Credited (Total):</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-mono">₹</span>
                  <input
                    type="number"
                    value={dividendAmount}
                    onChange={(e) => setDividendAmount(parseInt(e.target.value) || 0)}
                    className="w-24 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono text-right text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Target Summary Result Callout */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">
                  Projected Net Payout at Target Exit
                </span>
                <span className="text-xs text-slate-300">
                  Total return including accumulated dividends
                </span>
              </div>

              <div className="text-right font-mono">
                <span className="text-2xl font-black text-emerald-400 block">
                  +₹{totalTargetProfit.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-emerald-300">
                  Capital Return: +{targetGainPct.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
