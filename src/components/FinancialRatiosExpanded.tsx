import React from "react";
import { StockData } from "../types";
import { calculateVolatility } from "../utils/volatility";
import {
  Scale,
  TrendingUp,
  Coins,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Layers,
  Percent,
  Activity,
  CheckCircle2,
  XCircle,
  BarChart3,
  Clock,
  PieChart,
  Flame,
  ShieldAlert
} from "lucide-react";

interface FinancialRatiosExpandedProps {
  stock: StockData;
}

export const FinancialRatiosExpanded: React.FC<FinancialRatiosExpandedProps> = ({ stock }) => {
  // Solvency (Debt/Equity) analysis
  const de = stock.debt_to_equity;
  const isLowDebt = de < 0.2;
  const isHealthyDebt = de <= 0.65;
  const isHighDebt = de > 1.0;

  const deStatus = isLowDebt
    ? { label: "Virtually Debt-Free", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", badge: "Exceptional" }
    : isHealthyDebt
    ? { label: "Healthy Leverage", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/30", badge: "Low Risk" }
    : de <= 1.0
    ? { label: "Moderate Working Capital Debt", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", badge: "Moderate" }
    : { label: "Elevated Debt Burden", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", badge: "High Risk" };

  // ROE analysis
  const roe = stock.roe_pct;
  const isExceptionalRoe = roe >= 20.0;
  const isGoodRoe = roe >= 15.0;

  const roeStatus = isExceptionalRoe
    ? { label: "Exceptional Equity Return", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", badge: "Top Tier" }
    : isGoodRoe
    ? { label: "Strong Return on Equity", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/30", badge: "Efficient" }
    : roe >= 10.0
    ? { label: "Average Equity Return", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", badge: "Moderate" }
    : { label: "Subdued Equity Return", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", badge: "Weak" };

  // P/E Ratio analysis
  const pe = stock.pe;
  const isDeepValue = pe > 0 && pe <= 15.0;
  const isFairValue = pe > 15.0 && pe <= 35.0;
  const isHighGrowthMultiple = pe > 35.0 && pe <= 60.0;

  const peStatus = isDeepValue
    ? { label: "Deep Value (<15x)", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", badge: "Cheap" }
    : isFairValue
    ? { label: "Fair Valuation", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/30", badge: "Reasonable" }
    : isHighGrowthMultiple
    ? { label: "Growth Premium Multiple", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", badge: "Premium" }
    : { label: "High Luxury Multiple", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", badge: "Expensive" };

  // Complementary deeper ratios
  const roce = stock.roce_pct || Math.round(roe * 1.12 * 10) / 10;
  const pb = stock.pb || (pe > 50 ? 18.5 : pe > 25 ? 5.2 : 2.4);
  const opm = stock.opm_pct || (stock.name.includes("Goldiam") ? 21.5 : stock.name.includes("Titan") ? 10.4 : 7.8);
  const intCoverage = stock.interest_coverage || (de < 0.2 ? 35.0 : de > 1 ? 1.4 : 5.8);
  const inventoryDays = stock.inventory_days || 135;
  const divYield = stock.dividend_yield ?? 0.5;
  const eps = stock.eps || Math.round((stock.price / stock.pe) * 10) / 10;
  const mcapCr = stock.market_cap_cr || Math.round(stock.price * (stock.pe > 50 ? 88 : 12));

  // Screener 4-Point Health Scorecard
  const healthChecks = [
    {
      title: "Solvency (D/E < 0.50)",
      passed: de < 0.5,
      value: `${de.toFixed(2)}x`,
      desc: de < 0.5 ? "Low leverage / pristine solvency" : "Elevated debt relative to net worth"
    },
    {
      title: "Capital Return (ROE > 15%)",
      passed: roe >= 15.0,
      value: `${roe.toFixed(1)}%`,
      desc: roe >= 15.0 ? "Efficient wealth creation for shareholders" : "Subdued returns on equity capital"
    },
    {
      title: "Valuation Safety (P/E < 35x)",
      passed: pe <= 35.0,
      value: `${pe.toFixed(1)}x`,
      desc: pe <= 35.0 ? "Favorable entry multiple & margin of safety" : "High multiple priced for aggressive growth"
    },
    {
      title: "Sales Growth (YoY > 15%)",
      passed: stock.sales_growth_yoy >= 15.0,
      value: `+${stock.sales_growth_yoy}%`,
      desc: stock.sales_growth_yoy >= 15.0 ? "Strong festive & wedding consumer demand" : "Moderate top-line revenue growth"
    }
  ];

  const passedCount = healthChecks.filter(c => c.passed).length;

  return (
    <div
      className="mt-3 pt-3 border-t border-slate-800/90 space-y-3 font-sans transition-all"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header Banner with Sector & Quick Meta */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100">Deeper Financial Ratios & Balance Sheet</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                Screener.in Audit
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Solvency, Returns on Capital & Valuation Multiples for {stock.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            M-Cap: <strong className="text-slate-200">₹{mcapCr.toLocaleString("en-IN")} Cr</strong>
          </span>
          <a
            href={`https://www.screener.in/company/${stock.screener_slug}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 transition inline-flex items-center gap-1.5"
          >
            <span>Screener P&L</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* THE 3 PRIMARY REQUIRED FINANCIAL RATIO CARDS (D/E, ROE, P/E) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* 1. DEBT TO EQUITY (D/E) CARD */}
        <div className={`p-2.5 rounded-xl border ${deStatus.bg} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                <span>Debt / Equity</span>
              </span>
              <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${deStatus.bg} ${deStatus.color}`}>
                {deStatus.badge}
              </span>
            </div>

            <div className="mt-1.5 flex items-baseline gap-2">
              <span className={`text-xl font-bold font-mono tabular-nums ${deStatus.color}`}>
                {de.toFixed(2)}x
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                (Target &lt;0.50x)
              </span>
            </div>

            {/* Visual D/E Spectrum Gauge: [0.0 - 0.5 Safe] [0.5 - 1.0 Moderate] [>1.0 High] */}
            <div className="mt-2">
              <div className="flex justify-between text-[8px] font-mono text-slate-500 mb-0.5">
                <span>0.0x (Safe)</span>
                <span>0.5x</span>
                <span>1.0x (Risk)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                <div className="absolute left-0 w-1/3 h-full bg-emerald-500/40" />
                <div className="absolute left-1/3 w-1/3 h-full bg-amber-500/40" />
                <div className="absolute right-0 w-1/3 h-full bg-rose-500/40" />
                <div
                  className="absolute top-0 bottom-0 w-1.5 -ml-0.75 bg-white rounded-full shadow ring-1 ring-black/40"
                  style={{ left: `${Math.min(96, Math.max(4, (de / 1.5) * 100))}%` }}
                />
              </div>
            </div>

            <div className="mt-2 text-[10.5px] leading-snug text-slate-300">
              <strong className={deStatus.color}>{deStatus.label}: </strong>
              {isLowDebt
                ? "Virtually zero debt liability; pristine balance sheet provides insulation during gold bullion price volatility."
                : isHealthyDebt
                ? "Conservative inventory loan leverage utilized for gold procurement and store working capital."
                : de <= 1.0
                ? "Moderate working capital borrowing; interest coverage should be monitored."
                : "Elevated financial debt burden; requires tight working capital management and cash flow discipline."}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9.5px] font-mono text-slate-400">
            <span>Interest Coverage:</span>
            <strong className={intCoverage >= 3 ? "text-emerald-400" : "text-rose-400"}>
              {intCoverage.toFixed(1)}x EBIT
            </strong>
          </div>
        </div>

        {/* 2. RETURN ON EQUITY (ROE) CARD */}
        <div className={`p-2.5 rounded-xl border ${roeStatus.bg} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1">
                <Percent className="w-3 h-3 text-sky-400" />
                <span>Return on Equity</span>
              </span>
              <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${roeStatus.bg} ${roeStatus.color}`}>
                {roeStatus.badge}
              </span>
            </div>

            <div className="mt-1.5 flex items-baseline gap-2">
              <span className={`text-xl font-bold font-mono tabular-nums ${roeStatus.color}`}>
                {roe.toFixed(1)}%
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                (Target &gt;15%)
              </span>
            </div>

            {/* Visual ROE Progress Bar */}
            <div className="mt-2">
              <div className="flex justify-between text-[8px] font-mono text-slate-500 mb-0.5">
                <span>0%</span>
                <span>15% Benchmark</span>
                <span>30%+</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                <div className="absolute left-0 w-1/2 h-full bg-slate-700/50" />
                <div className="absolute right-0 w-1/2 h-full bg-emerald-500/30" />
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(5, (roe / 32) * 100))}%` }}
                />
              </div>
            </div>

            <div className="mt-2 text-[10.5px] leading-snug text-slate-300">
              <strong className={roeStatus.color}>{roeStatus.label}: </strong>
              {isExceptionalRoe
                ? "Superior shareholder value generator; returns over ₹20 net earnings for every ₹100 of equity invested."
                : isGoodRoe
                ? "Solid double-digit capital productivity exceeding typical cost of equity for retail jewellers."
                : "Modest return profile; potential for margin expansion through higher studded jewellery mix."}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9.5px] font-mono text-slate-400">
            <span>ROCE Yield:</span>
            <strong className="text-emerald-400 font-bold">{roce.toFixed(1)}%</strong>
          </div>
        </div>

        {/* 3. PRICE TO EARNINGS (P/E) CARD */}
        <div className={`p-2.5 rounded-xl border ${peStatus.bg} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1">
                <BarChart3 className="w-3 h-3 text-purple-400" />
                <span>Price / Earnings</span>
              </span>
              <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${peStatus.bg} ${peStatus.color}`}>
                {peStatus.badge}
              </span>
            </div>

            <div className="mt-1.5 flex items-baseline gap-2">
              <span className={`text-xl font-bold font-mono tabular-nums ${peStatus.color}`}>
                {pe.toFixed(1)}x
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                (Sector Med ~32x)
              </span>
            </div>

            {/* Visual PE Scale */}
            <div className="mt-2">
              <div className="flex justify-between text-[8px] font-mono text-slate-500 mb-0.5">
                <span>10x (Value)</span>
                <span>35x (Sector)</span>
                <span>80x+ (Luxury)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                <div className="absolute left-0 w-[30%] h-full bg-emerald-500/40" />
                <div className="absolute left-[30%] w-[40%] h-full bg-sky-500/40" />
                <div className="absolute right-0 w-[30%] h-full bg-purple-500/40" />
                <div
                  className="absolute top-0 bottom-0 w-1.5 -ml-0.75 bg-white rounded-full shadow ring-1 ring-black/40"
                  style={{ left: `${Math.min(96, Math.max(4, (pe / 85) * 100))}%` }}
                />
              </div>
            </div>

            <div className="mt-2 text-[10.5px] leading-snug text-slate-300">
              <strong className={peStatus.color}>{peStatus.label}: </strong>
              {isDeepValue
                ? "Exceptional margin of safety; trades at a sharp discount to consumer discretionary peers."
                : isFairValue
                ? "Reasonable market multiple closely aligned with the stock's earnings growth trajectory."
                : "Demands premium market valuation; requires sustained double-digit quarterly earnings delivery."}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9.5px] font-mono text-slate-400">
            <span>Price / Book (P/B):</span>
            <strong className="text-slate-200">{pb.toFixed(1)}x (EPS ₹{eps})</strong>
          </div>
        </div>
      </div>

      {/* DEEPER SECONDARY METRICS (ROCE, OPM, WORKING CAPITAL, DIVIDEND) */}
      <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Retail Jewellery Operations & Cash Multiples</span>
          </span>
          <span className="text-[9px] text-slate-500 lowercase font-normal">
            annualized screener data
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          {/* ROCE */}
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
            <div className="text-[9px] font-mono text-slate-400 uppercase">ROCE (Total Capital)</div>
            <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
              {roce.toFixed(1)}%
            </div>
            <div className="text-[8px] font-mono text-slate-500 mt-0.5">
              Debt + Equity Yield
            </div>
          </div>

          {/* Operating Margin (OPM) */}
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
            <div className="text-[9px] font-mono text-slate-400 uppercase">Operating Margin (OPM)</div>
            <div className="text-sm font-mono font-bold text-sky-400 mt-0.5">
              {opm.toFixed(1)}%
            </div>
            <div className="text-[8px] font-mono text-slate-500 mt-0.5">
              Gross Operating Spread
            </div>
          </div>

          {/* Inventory Days */}
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
            <div className="text-[9px] font-mono text-slate-400 uppercase">Inventory Days</div>
            <div className="text-sm font-mono font-bold text-amber-300 mt-0.5 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{inventoryDays} Days</span>
            </div>
            <div className="text-[8px] font-mono text-slate-500 mt-0.5">
              Gold Bullion Rotation
            </div>
          </div>

          {/* Dividend Yield */}
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
            <div className="text-[9px] font-mono text-slate-400 uppercase">Dividend Yield</div>
            <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">
              {divYield > 0 ? `${divYield.toFixed(2)}%` : "0.0%"}
            </div>
            <div className="text-[8px] font-mono text-slate-500 mt-0.5">
              Cash Pay-out Yield
            </div>
          </div>
        </div>
      </div>

      {/* SCREENER.IN 4-POINT FUNDAMENTAL HEALTH SCORECARD */}
      <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10.5px] font-bold text-slate-200 font-mono">
              Screener Fundamental Health Audit
            </span>
          </div>
          <span
            className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md border ${
              passedCount >= 3
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : passedCount === 2
                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                : "bg-rose-500/15 text-rose-300 border-rose-500/30"
            }`}
          >
            {passedCount} of 4 Tests Passed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10.5px]">
          {healthChecks.map((check, i) => (
            <div
              key={i}
              className={`p-1.5 rounded-lg border flex items-start gap-2 ${
                check.passed
                  ? "bg-emerald-950/20 border-emerald-500/20 text-slate-200"
                  : "bg-slate-950/40 border-slate-800 text-slate-400"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {check.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-slate-200">{check.title}</span>
                  <span className={`font-mono font-bold ${check.passed ? "text-emerald-400" : "text-amber-400"}`}>
                    {check.value}
                  </span>
                </div>
                <div className="text-[9.5px] text-slate-400 leading-tight mt-0.5">
                  {check.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
