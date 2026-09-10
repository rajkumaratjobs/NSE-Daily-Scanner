export interface PricePoint {
  day: string;
  date: string;
  price: number;
}

export interface StockAlert {
  type: "BREAKOUT" | "RESULTS" | "VALUE" | "THRESHOLD";
  badge: string;
  description: string;
}

export interface PriceThresholdAlert {
  targetPrice: number;
  condition: "ABOVE" | "BELOW";
  enabled: boolean;
  breached?: boolean;
  breachedAt?: string;
  breachedPrice?: number;
  note?: string;
}

export interface StockData {
  name: string;
  symbol: string;
  screener_slug: string;
  price: number;
  change_pct: number;
  dma_200: number;
  volume: number;
  avg_vol_20d: number;
  vol_multiple: number;
  pe: number;
  roe_pct: number;
  debt_to_equity: number;
  sales_growth_yoy: number;
  pat_growth_yoy?: number;
  screener_headline: string;
  alerts: StockAlert[];
  ai_verdict?: string;
  ai_action?: "BUY" | "SELL" | "HOLD";
  ai_confidence?: number;
  ai_reasoning?: string;
  ai_technical_signal?: string;
  ai_fundamental_signal?: string;
  ai_key_catalyst?: string;
  history_5d?: PricePoint[];
  rsi?: number;
  roce_pct?: number;
  pb?: number;
  opm_pct?: number;
  market_cap_cr?: number;
  interest_coverage?: number;
  dividend_yield?: number;
  eps?: number;
  inventory_days?: number;
  atr?: number;
  atr_pct?: number;
  price_range_5d_pct?: number;
  volatility_level?: "HIGH" | "MEDIUM" | "LOW";
  volatility_label?: string;
  alert_threshold?: PriceThresholdAlert;
  is_watchlist?: boolean;
}

export interface ScanResult {
  timestamp: string;
  dateStr: string;
  scanTime: string;
  totalScanned: number;
  totalAlerts: number;
  stocks: StockData[];
  alertedStocks: StockData[];
  formattedMessage: string;
}

export interface ScannerConfig {
  scan_time: string;
  timezone?: string;
  cron?: string;
  stocks: Array<{
    name: string;
    symbol: string;
    screener_slug: string;
  }>;
  alert_types: {
    breakout: {
      enabled: boolean;
      price_gt_200_dma: boolean;
      volume_multiplier_20d: number;
    };
    results: {
      enabled: boolean;
      sales_growth_yoy_min_pct: number;
    };
    value: {
      enabled: boolean;
      pe_max: number;
      roe_min_pct: number;
      debt_to_equity_max: number;
    };
    volatility?: {
      enabled: boolean;
      high_risk_threshold_pct: number;
    };
  };
  price_thresholds?: Record<string, PriceThresholdAlert>;
  notifications?: {
    telegram?: {
      enabled: boolean;
      bot_token?: string;
      chat_id?: string;
    };
    whatsapp?: {
      enabled: boolean;
      provider?: "twilio" | "callmebot";
      account_sid?: string;
      auth_token?: string;
      from_number?: string;
      to_number?: string;
      callmebot_apikey?: string;
      callmebot_phone?: string;
    };
  };
}

export interface DebugStep {
  name: string;
  status: "pass" | "fail" | "warn" | "info";
  detail: string;
}

export interface EndpointDiagnostic {
  channel: "telegram" | "whatsapp";
  status: "sent" | "simulated" | "error" | "missing_credentials";
  endpointUrl: string;
  configured: boolean;
  reachability: "reachable" | "unreachable" | "untested";
  statusCode?: number;
  messageIdOrSid?: string;
  debugSteps: DebugStep[];
  diagnosis: string;
  actionableFix?: string;
  payloadPreview?: Record<string, any>;
  issueDetails?: {
    code?: string;
    accountSidIssue?: boolean;
    senderIssue?: boolean;
    sandboxIssue?: boolean;
    recipientIssue?: boolean;
  };
}

export interface TestAlertResult {
  status: "ok" | "partial" | "failed";
  timestamp: string;
  summary: string;
  simulated: boolean;
  telegram: EndpointDiagnostic;
  whatsapp: EndpointDiagnostic;
}

export type NewsCategory =
  | "EARNINGS"
  | "GOLD_POLICY"
  | "RETAIL_DEMAND"
  | "EXPORTS"
  | "EXPANSION"
  | "REGULATORY"
  | "SECTOR";

export type NewsSentiment = "BULLISH" | "BEARISH" | "NEUTRAL";

export interface JewelleryNewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url?: string;
  publishedAt: string;
  timeAgo: string;
  category: NewsCategory;
  sentiment: NewsSentiment;
  relatedSymbols: string[];
  impactRating?: "HIGH" | "MEDIUM" | "LOW";
}

export interface JewelleryNewsResponse {
  status: "ok" | "error";
  total: number;
  lastUpdated: string;
  news: JewelleryNewsItem[];
  message?: string;
}

export interface SectorSentimentData {
  headline: string;
  sentiment_stance: "Bullish" | "Cautiously Bullish" | "Neutral / Consolidating" | "Cautious / Bearish";
  sentiment_score: number;
  paragraph: string;
  key_driver: string;
  generated_at: string;
  model_used: string;
  visible_stocks_count: number;
  advancing_count: number;
  declining_count: number;
  avg_change_pct: number;
  source?: "gemini" | "fallback";
  previous_score?: number;
  score_change?: number;
  sentiment_trend?: "improving" | "declining" | "steady" | "unchanged";
}

export interface SectorDailyPerformancePoint {
  date: string;
  displayDate: string;
  fullDate: string;
  indexLevel: number;
  dailyChangePct: number;
  cumulativeReturnPct: number;
  advancingCount: number;
  decliningCount: number;
  volumeCr: number;
  topGainerSymbol?: string;
  topGainerPct?: number;
}

export interface Sector30DHistoryResponse {
  status: "ok" | "error";
  days: SectorDailyPerformancePoint[];
  startLevel: number;
  currentLevel: number;
  periodReturnPct: number;
  highestLevel: number;
  lowestLevel: number;
  bestDay: { date: string; changePct: number };
  worstDay: { date: string; changePct: number };
  totalVolumeCr: number;
  avgDailyVolumeCr: number;
  source?: "yahoo" | "calculated";
}

// BTST Surge Detector & Pre-Surge 4-Filter System Types
export interface FilterMatchedStatus {
  filter_a_news: boolean;
  filter_a_detail: string;
  filter_b_volume_delivery: boolean;
  filter_b_detail: string;
  filter_c_bulk_deals: boolean;
  filter_c_detail: string;
  filter_d_price_action: boolean;
  filter_d_detail: string;
  matched_count: number;
}

export interface MarketDepthBidAsk {
  price: number;
  orders: number;
  quantity: number;
}

export interface MarketDepthData {
  buy_pct: number;
  sell_pct: number;
  total_buy_qty: number;
  total_sell_qty: number;
  bids: MarketDepthBidAsk[];
  asks: MarketDepthBidAsk[];
}

export interface BulkDealRecord {
  id: string;
  date: string;
  time?: string;
  client_name: string;
  deal_type: "BUY" | "SELL";
  quantity: number;
  trade_price: number;
  exchange: "NSE" | "BSE";
  remarks?: string;
}

export interface StockNewsItem {
  id: string;
  title: string;
  source: string;
  time_ago: string;
  dateStr: string;
  category: "ANNOUNCEMENT" | "MEDIA" | "RESULTS" | "BULK_DEAL";
  snippet: string;
  keywords_matched?: string[];
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
}

export interface PreSurgeStock {
  id: string;
  symbol: string;
  name: string;
  exchange: "NSE" | "BSE";
  price: number;
  change: number;
  change_pct?: number;
  changePct?: number;
  day_low: number;
  day_high: number;
  low_52w: number;
  high_52w: number;
  pct_above_52w_low: number;
  volume: number;
  avg_vol_20d: number;
  vol_multiple: number;
  delivery_pct: number;
  delivery_history_3d: number[];
  market_depth: MarketDepthData;
  reason_tag: string;
  filters: FilterMatchedStatus;
  category: "PRE_SURGE" | "BTST_CONFIRMED";
  risk_level: "Low" | "Moderate" | "High" | "Speculative Turnaround";
  bulk_buyer_summary: string;
  bulk_deals: BulkDealRecord[];
  news: StockNewsItem[];
  technicals: {
    pe: number;
    rsi: number;
    dma_200: number;
    dma_50: number;
    intraday_recovery_pct: number;
    run_3d_pct: number;
    pullback_pct: number;
    support: number;
    resistance: number;
    debt_to_equity: number;
  };
  charts: {
    "1D": Array<{ time: string; price: number; volume: number }>;
    "1W": Array<{ time: string; price: number; volume: number }>;
    "1M": Array<{ time: string; price: number; volume: number }>;
    "3M": Array<{ time: string; price: number; volume: number }>;
  };
  events: Array<{
    date: string;
    title: string;
    type: "AGM" | "RESULTS" | "DEBT_MILESTONE" | "DIVIDEND";
    description: string;
  }>;
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  buyDate: string; // ISO date e.g. 2025-07-12
  targetExitPrice: number;
  dividendReceivedPerShare: number;
  currentPrice: number;
}

export interface ComparisonMetrics {
  stockA: PreSurgeStock;
  stockB: PreSurgeStock;
  aiBrief?: {
    leaderSymbol: string;
    confidence: number;
    stance: "Strong Outperformer" | "Moderate Outperformer" | "Equal / Mixed";
    keyDifferentiator: string;
    momentumAnalysis: string;
    volumeAccumulationAnalysis: string;
    riskRewardComparison: string;
    tacticalRecommendation: string;
  };
}

