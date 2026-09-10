import React, { useState } from "react";
import { PreSurgeStock, BulkDealRecord, StockNewsItem } from "../types";
import {
  X,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Layers,
  BarChart2,
  FileText,
  AlertTriangle,
  ShoppingCart,
  Send,
  ArrowRight,
  Percent,
  Activity
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

interface StockDetailModalProps {
  stock: PreSurgeStock | null;
  onClose: () => void;
  onOpenOrder?: (stock: PreSurgeStock, action: "BUY" | "SELL" | "SIP") => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  onClose,
  onOpenOrder
}) => {
  if (!stock) return null;

  const [activeTab, setActiveTab] = useState<
    "overview" | "technicals" | "news" | "events" | "bulk_trades"
  >("overview");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1D" | "1W" | "1M" | "3M">("1D");
  const [orderModalType, setOrderModalType] = useState<"BUY" | "SELL" | "SIP" | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(1000);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string>("");

  const isPositive = stock.change >= 0;
  const chartData = stock.charts[selectedTimeframe] || stock.charts["1D"];

  const handleOrderSubmit = (type: "BUY" | "SELL" | "SIP") => {
    const totalAmount = (orderQuantity * stock.price).toFixed(2);
    setOrderSuccessMsg(
      `✓ ${type} Order of ${orderQuantity} shares of ${stock.symbol} @ ₹${stock.price} (Total: ₹${totalAmount}) placed successfully!`
    );
    setTimeout(() => {
      setOrderSuccessMsg("");
      setOrderModalType(null);
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0F141F] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/90 flex items-start justify-between gap-4 bg-[#121824]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xl sm:text-2xl font-black text-slate-100">
                {stock.symbol}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-400">
                {stock.exchange}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {stock.reason_tag}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {stock.filters.matched_count}/4 Pre-Surge Filters
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{stock.name}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-mono text-2xl font-black text-slate-100">
                ₹{(stock.price ?? 0).toFixed(2)}
              </div>
              <div
                className={`inline-flex items-center gap-1 font-mono text-xs font-bold ${
                  isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>
                  {isPositive ? "+" : ""}
                  {(stock.change ?? 0).toFixed(2)} ({isPositive ? "+" : ""}
                  {(stock.change_pct ?? stock.changePct ?? 0).toFixed(2)}%)
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Top Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Day Range (L - H)</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-200">
                ₹{stock.day_low.toFixed(2)} - ₹{stock.day_high.toFixed(2)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">52-Week Range</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-200">
                ₹{stock.low_52w.toFixed(2)} - ₹{stock.high_52w.toFixed(2)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Volume Multiple</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-amber-400">
                {stock.vol_multiple}x ({(stock.volume / 1000000).toFixed(1)}M)
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Delivery % (3D Avg)</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400">
                {stock.delivery_pct.toFixed(1)}% (Continuous &gt;60%)
              </span>
            </div>
          </div>

          {/* Interactive Chart Section with Timeframe Selector */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Price Action & Accumulation History
                </span>
              </div>

              {/* Timeframe Buttons */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(["1D", "1W", "1M", "3M"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      selectedTimeframe === tf
                        ? "bg-amber-500 text-slate-950 shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG/Recharts Chart */}
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={["auto", "auto"]}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b0f19",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f8fafc"
                    }}
                    formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, "Price"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? "#10b981" : "#f43f5e"}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#priceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Market Depth 5-Level Bid/Ask Table & Visual Meter */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Live Market Depth (NSE Order Book)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                <span className="text-emerald-400">BUY {(stock.market_depth?.buy_pct ?? 50).toFixed(2)}%</span>
                <span className="text-slate-500">vs</span>
                <span className="text-rose-400">SELL {(stock.market_depth?.sell_pct ?? 50).toFixed(2)}%</span>
              </div>
            </div>

            {/* Depth Visual Bar */}
            <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${stock.market_depth?.buy_pct ?? 50}%` }}
              />
              <div
                className="h-full bg-rose-500 transition-all duration-300"
                style={{ width: `${stock.market_depth?.sell_pct ?? 50}%` }}
              />
            </div>

            {/* 5-Level Bid / Ask Table */}
            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              {/* Buy Bids */}
              <div className="space-y-1">
                <div className="grid grid-cols-3 text-[11px] font-semibold text-emerald-400 pb-1 border-b border-slate-800">
                  <span>Bid Qty</span>
                  <span className="text-center">Orders</span>
                  <span className="text-right">Price</span>
                </div>
                {stock.market_depth.bids.map((b, idx) => (
                  <div key={idx} className="grid grid-cols-3 font-mono text-[11px] text-slate-300 py-0.5">
                    <span className="text-emerald-300 font-medium">{b.quantity.toLocaleString("en-IN")}</span>
                    <span className="text-center text-slate-500">{b.orders}</span>
                    <span className="text-right font-bold text-emerald-400">₹{b.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-1 border-t border-slate-800/80 flex justify-between font-mono font-bold text-[11px]">
                  <span className="text-slate-400">Total Buy:</span>
                  <span className="text-emerald-400">
                    {stock.market_depth.total_buy_qty.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Sell Asks */}
              <div className="space-y-1">
                <div className="grid grid-cols-3 text-[11px] font-semibold text-rose-400 pb-1 border-b border-slate-800">
                  <span>Price</span>
                  <span className="text-center">Orders</span>
                  <span className="text-right">Ask Qty</span>
                </div>
                {stock.market_depth.asks.map((a, idx) => (
                  <div key={idx} className="grid grid-cols-3 font-mono text-[11px] text-slate-300 py-0.5">
                    <span className="font-bold text-rose-400">₹{a.price.toFixed(2)}</span>
                    <span className="text-center text-slate-500">{a.orders}</span>
                    <span className="text-right text-rose-300 font-medium">
                      {a.quantity.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
                <div className="pt-1 border-t border-slate-800/80 flex justify-between font-mono font-bold text-[11px]">
                  <span className="text-slate-400">Total Sell:</span>
                  <span className="text-rose-400">
                    {stock.market_depth.total_sell_qty.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation: Overview | Technicals | News | Events | Bulk Trades */}
          <div className="flex items-center gap-1.5 border-b border-slate-800 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "overview", label: "Overview" },
              { id: "technicals", label: "Technicals" },
              { id: "news", label: `News (${stock.news.length})` },
              { id: "events", label: `Events (${stock.events.length})` },
              { id: "bulk_trades", label: `Bulk Trades (${stock.bulk_deals.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  activeTab === tab.id
                    ? "bg-slate-800 text-amber-400 border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* 4 Filters Detailed Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The 4 Pre-Surge Institutional Signals</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  {/* Filter A */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        {stock.filters.filter_a_news ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-500" />
                        )}
                        <span>Filter A: News Catalyst Scanner</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          stock.filters.filter_a_news
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {stock.filters.filter_a_news ? "TRIGGERED" : "NO TRIGGER"}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed pl-5.5">
                      {stock.filters.filter_a_detail}
                    </p>
                  </div>

                  {/* Filter B */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        {stock.filters.filter_b_volume_delivery ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-500" />
                        )}
                        <span>Filter B: Volume & Delivery Spike</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          stock.filters.filter_b_volume_delivery
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {stock.filters.filter_b_volume_delivery ? "TRIGGERED" : "NO TRIGGER"}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed pl-5.5">
                      {stock.filters.filter_b_detail}
                    </p>
                  </div>

                  {/* Filter C */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        {stock.filters.filter_c_bulk_deals ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-500" />
                        )}
                        <span>Filter C: Block/Bulk Trade Detector</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          stock.filters.filter_c_bulk_deals
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {stock.filters.filter_c_bulk_deals ? "TRIGGERED" : "NO TRIGGER"}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed pl-5.5">
                      {stock.filters.filter_c_detail}
                    </p>
                  </div>

                  {/* Filter D */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        {stock.filters.filter_d_price_action ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-500" />
                        )}
                        <span>Filter D: Price Action Bounce</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          stock.filters.filter_d_price_action
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {stock.filters.filter_d_price_action ? "TRIGGERED" : "NO TRIGGER"}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed pl-5.5">
                      {stock.filters.filter_d_detail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TECHNICALS */}
          {activeTab === "technicals" && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Technical Indicators & Moving Averages
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">RSI (14-Day)</span>
                  <span className="font-mono text-base font-bold text-amber-400">
                    {stock.technicals.rsi}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {stock.technicals.rsi > 70 ? "Overbought" : stock.technicals.rsi < 30 ? "Oversold" : "Neutral Bullish"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">200 DMA</span>
                  <span className="font-mono text-base font-bold text-slate-200">
                    ₹{(stock.technicals?.dma_200 ?? stock.price).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">
                    Trading above 200 DMA (+{(((stock.price - (stock.technicals?.dma_200 ?? stock.price)) / (stock.technicals?.dma_200 || 1)) * 100).toFixed(1)}%)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Intraday Recovery</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    +{(stock.technicals?.intraday_recovery_pct ?? 0).toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Bounce from day low of ₹{stock.day_low}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">P/E Ratio</span>
                  <span className="font-mono text-base font-bold text-slate-200">
                    {(stock.technicals?.pe ?? 0).toFixed(1)}x
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Debt/Eq: {(stock.technicals?.debt_to_equity ?? 0).toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Key Support</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    ₹{(stock.technicals?.support ?? stock.price * 0.95).toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Immediate Resistance</span>
                  <span className="font-mono text-base font-bold text-rose-400">
                    ₹{(stock.technicals?.resistance ?? stock.price * 1.05).toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">3-Day Run Up</span>
                  <span className="font-mono text-base font-bold text-slate-200">
                    +{stock.technicals.run_3d_pct}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Consolidation Pullback</span>
                  <span className="font-mono text-base font-bold text-slate-200">
                    -{stock.technicals.pullback_pct}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NEWS */}
          {activeTab === "news" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Catalyst News & Corporate Disclosures (Last 7 Days)
              </h4>

              {stock.news.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 space-y-1.5 transition"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-semibold text-[11px]">
                      {item.source}
                    </span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{item.time_ago}</span>
                    </span>
                  </div>

                  <h5 className="font-semibold text-slate-100 text-sm leading-snug">
                    {item.title}
                  </h5>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.snippet}
                  </p>

                  {item.keywords_matched && item.keywords_matched.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-semibold">Matched Keywords:</span>
                      {item.keywords_matched.map((kw, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-[10px] font-mono font-bold"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: EVENTS */}
          {activeTab === "events" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Upcoming Corporate Actions & Milestones
              </h4>

              {stock.events.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No imminent corporate actions scheduled for this stock in the next 30 days.
                </div>
              ) : (
                stock.events.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-slate-200 text-sm">{evt.title}</h5>
                        <span className="font-mono font-bold text-amber-400 text-xs">{evt.date}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{evt.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: BULK TRADES */}
          {activeTab === "bulk_trades" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                NSE & BSE Bulk / Block Deals Radar
              </h4>

              {stock.bulk_deals.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No single bulk deal &gt; 0.5% equity recorded today. Regular institutional block accumulation observed in order depth.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stock.bulk_deals.map((bd) => (
                    <div
                      key={bd.id}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                              bd.deal_type === "BUY"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                            }`}
                          >
                            {bd.deal_type}
                          </span>
                          <span className="font-bold text-slate-200">{bd.client_name}</span>
                        </div>
                        <span className="font-mono text-slate-400 text-[11px]">{bd.date}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 font-mono text-xs bg-slate-950/60 p-2 rounded-lg">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Quantity</span>
                          <span className="font-bold text-slate-200">
                            {bd.quantity.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Trade Price</span>
                          <span className="font-bold text-amber-400">₹{bd.trade_price.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Deal Value</span>
                          <span className="font-bold text-slate-200">
                            ₹{((bd.quantity * bd.trade_price) / 10000000).toFixed(2)} Cr
                          </span>
                        </div>
                      </div>

                      {bd.remarks && (
                        <p className="text-slate-400 text-[11px] italic">
                          "{bd.remarks}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Success Message Banner */}
        {orderSuccessMsg && (
          <div className="px-5 py-2.5 bg-emerald-950 border-t border-emerald-800 text-emerald-300 font-medium text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{orderSuccessMsg}</span>
          </div>
        )}

        {/* Quick Order Entry Drawer/Dialog */}
        {orderModalType && (
          <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                <span>Place Instant {orderModalType} Order: {stock.symbol}</span>
              </span>
              <button
                onClick={() => setOrderModalType(null)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Number of Shares</label>
                <input
                  type="number"
                  min="1"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Execution Price (NSE)</label>
                <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-sm">
                  ₹{stock.price.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Total Estimated Capital</label>
                <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-sm font-bold">
                  ₹{(orderQuantity * stock.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setOrderModalType(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => handleOrderSubmit(orderModalType)}
                className={`px-4 py-1.5 rounded-lg font-bold text-xs shadow-md transition active:scale-95 ${
                  orderModalType === "BUY" || orderModalType === "SIP"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950"
                    : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950"
                }`}
              >
                Confirm {orderModalType} ({orderQuantity} Shares)
              </button>
            </div>
          </div>
        )}

        {/* Modal Action Buttons: SIP | Sell | Buy */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#121824] flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 hidden sm:block">
            Pre-Surge Confidence: <strong className="text-emerald-400">{stock.filters.matched_count}/4 Filters Matched</strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* SIP Action Button */}
            <button
              id="btn-action-sip"
              onClick={() => setOrderModalType("SIP")}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow active:scale-95 transition"
            >
              SIP / Accumulate
            </button>

            {/* Sell Action Button */}
            <button
              id="btn-action-sell"
              onClick={() => setOrderModalType("SELL")}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 text-xs font-bold active:scale-95 transition"
            >
              Sell
            </button>

            {/* Buy Action Button */}
            <button
              id="btn-action-buy"
              onClick={() => setOrderModalType("BUY")}
              className="flex-1 sm:flex-none px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-900/40 active:scale-95 transition"
            >
              BUY Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
