export interface StockAlert {
  type: "BREAKOUT" | "RESULTS" | "VALUE";
  badge: string;
  description: string;
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
  };
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
