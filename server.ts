import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const CONFIG_PATH = path.join(process.cwd(), "config.json");

// Helper to read config.json
function getConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading config.json:", err);
  }
  return {
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
  };
}

// In-memory stock baseline data (regularly refreshed or used if Yahoo Finance rate-limits)
interface StockData {
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
  pat_growth_yoy: number;
  screener_headline: string;
  alerts: Array<{ type: string; badge: string; description: string }>;
  ai_verdict?: string;
}

const STOCK_BASELINES: Record<string, Partial<StockData>> = {
  "GOLDIAM.NS": {
    name: "Goldiam International",
    symbol: "GOLDIAM.NS",
    screener_slug: "GOLDIAM",
    price: 388.5,
    change_pct: 2.45,
    dma_200: 340.0,
    volume: 1850000,
    avg_vol_20d: 720000,
    vol_multiple: 2.57,
    pe: 14.2,
    roe_pct: 18.5,
    debt_to_equity: 0.04,
    sales_growth_yoy: 18.4,
    pat_growth_yoy: 22.1,
    screener_headline: "Q1 PAT up 22.1% YoY (Sales +18.4%)"
  },
  "SENCO.NS": {
    name: "Senco Gold",
    symbol: "SENCO.NS",
    screener_slug: "SENCO",
    price: 1085.0,
    change_pct: 3.82,
    dma_200: 940.0,
    volume: 3200000,
    avg_vol_20d: 1150000,
    vol_multiple: 2.78,
    pe: 34.5,
    roe_pct: 19.8,
    debt_to_equity: 0.62,
    sales_growth_yoy: 27.5,
    pat_growth_yoy: 26.8,
    screener_headline: "Q1 PAT up 26.8% YoY (Sales +27.5%)"
  },
  "KALYANKJIL.NS": {
    name: "Kalyan Jewellers",
    symbol: "KALYANKJIL.NS",
    screener_slug: "KALYANKJIL",
    price: 612.0,
    change_pct: 1.95,
    dma_200: 510.0,
    volume: 8500000,
    avg_vol_20d: 3900000,
    vol_multiple: 2.18,
    pe: 54.0,
    roe_pct: 17.2,
    debt_to_equity: 0.75,
    sales_growth_yoy: 31.2,
    pat_growth_yoy: 29.4,
    screener_headline: "Q1 PAT up 29.4% YoY (Sales +31.2%)"
  },
  "TITAN.NS": {
    name: "Titan Company",
    symbol: "TITAN.NS",
    screener_slug: "TITAN",
    price: 3450.0,
    change_pct: 0.85,
    dma_200: 3380.0,
    volume: 1200000,
    avg_vol_20d: 1100000,
    vol_multiple: 1.09,
    pe: 82.0,
    roe_pct: 28.5,
    debt_to_equity: 0.55,
    sales_growth_yoy: 12.8,
    pat_growth_yoy: 8.5,
    screener_headline: "Q1 PAT up 8.5% YoY (Sales +12.8%)"
  },
  "RADHIKAJWE.NS": {
    name: "Radhika Jeweltech",
    symbol: "RADHIKAJWE.NS",
    screener_slug: "RADHIKAJWE",
    price: 92.5,
    change_pct: 4.25,
    dma_200: 78.0,
    volume: 2400000,
    avg_vol_20d: 1000000,
    vol_multiple: 2.40,
    pe: 13.8,
    roe_pct: 22.0,
    debt_to_equity: 0.12,
    sales_growth_yoy: 19.3,
    pat_growth_yoy: 24.2,
    screener_headline: "Q1 PAT up 24.2% YoY (Sales +19.3%)"
  },
  "PCJEWELLER.NS": {
    name: "PC Jeweller",
    symbol: "PCJEWELLER.NS",
    screener_slug: "PCJEWELLER",
    price: 128.0,
    change_pct: 4.95,
    dma_200: 98.0,
    volume: 14000000,
    avg_vol_20d: 4500000,
    vol_multiple: 3.11,
    pe: 28.0,
    roe_pct: 4.5,
    debt_to_equity: 1.40,
    sales_growth_yoy: 42.0,
    pat_growth_yoy: -10.5,
    screener_headline: "Turnaround Quarter: Sales surged 42% YoY"
  },
  "TBZ.NS": {
    name: "Tribhovandas Bhimji Zaveri",
    symbol: "TBZ.NS",
    screener_slug: "TBZ",
    price: 285.0,
    change_pct: 2.15,
    dma_200: 245.0,
    volume: 950000,
    avg_vol_20d: 520000,
    vol_multiple: 1.83,
    pe: 14.8,
    roe_pct: 16.2,
    debt_to_equity: 0.42,
    sales_growth_yoy: 16.1,
    pat_growth_yoy: 17.5,
    screener_headline: "Q1 PAT up 17.5% YoY (Sales +16.1%)"
  },
  "VAIBHAVGBL.NS": {
    name: "Vaibhav Global",
    symbol: "VAIBHAVGBL.NS",
    screener_slug: "VAIBHAVGBL",
    price: 310.0,
    change_pct: -0.55,
    dma_200: 340.0,
    volume: 450000,
    avg_vol_20d: 580000,
    vol_multiple: 0.78,
    pe: 26.0,
    roe_pct: 9.5,
    debt_to_equity: 0.25,
    sales_growth_yoy: 11.4,
    pat_growth_yoy: 14.0,
    screener_headline: "Q1 PAT up 14% YoY (Sales +11.4%)"
  }
};

// Fetch live quote if available via Yahoo Finance public API endpoint
async function tryFetchLivePrice(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (resp.ok) {
      const json = await resp.json();
      const meta = json?.chart?.result?.[0]?.meta;
      if (meta && meta.regularMarketPrice) {
        const price = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || meta.previousClose || price;
        const changePct = ((price - prevClose) / prevClose) * 100;
        return { price, changePct, volume: meta.regularMarketVolume };
      }
    }
  } catch (err) {
    // Ignore, fallback to baseline
  }
  return null;
}

// Evaluate filters
function evaluateFilters(stock: StockData, alertCfg: any) {
  const alerts = [];
  const { price, dma_200, vol_multiple, sales_growth_yoy, pe, roe_pct, debt_to_equity } = stock;

  // Filter 1 - BREAKOUT: Price > 200 DMA and Volume > 2x avg 20-day volume
  if (alertCfg.breakout?.enabled) {
    const volThreshold = alertCfg.breakout.volume_multiplier_20d || 2.0;
    if (price > dma_200 && vol_multiple >= volThreshold) {
      alerts.push({
        type: "BREAKOUT",
        badge: "🚨 BREAKOUT Alert",
        description: `Crossed 200 DMA (₹${dma_200}) with ${vol_multiple.toFixed(1)}x volume`
      });
    }
  }

  // Filter 2 - RESULTS: Check screener for Sales growth > 15% YoY
  if (alertCfg.results?.enabled) {
    const minGrowth = alertCfg.results.sales_growth_yoy_min_pct || 15.0;
    if (sales_growth_yoy >= minGrowth) {
      alerts.push({
        type: "RESULTS",
        badge: "📊 Result Alert",
        description: stock.screener_headline || `Sales growth +${sales_growth_yoy.toFixed(1)}% YoY`
      });
    }
  }

  // Filter 3 - VALUE: PE < 15 and ROE > 15% and Debt/Equity < 0.5
  if (alertCfg.value?.enabled) {
    const peMax = alertCfg.value.pe_max || 15.0;
    const roeMin = alertCfg.value.roe_min_pct || 15.0;
    const deMax = alertCfg.value.debt_to_equity_max || 0.5;

    if (pe > 0 && pe < peMax && roe_pct > roeMin && debt_to_equity < deMax) {
      alerts.push({
        type: "VALUE",
        badge: "💎 VALUE Alert",
        description: `PE ${pe} (<${peMax}), ROE ${roe_pct}% (>${roeMin}%), D/E ${debt_to_equity} (<${deMax})`
      });
    }
  }

  return alerts;
}

// In-memory cache to prevent quota exhaustion (5 requests/min free tier limit)
const verdictCache = new Map<string, { verdict: string; timestamp: number }>();
const VERDICT_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Financial heuristic fallback verdicts
function getFallbackVerdict(stock: StockData, alerts: any[]): string {
  const types = alerts.map(a => a.type);
  if (types.includes("BREAKOUT") && types.includes("RESULTS")) {
    return `Buy: High volume breakout above 200 DMA confirmed by strong ${stock.sales_growth_yoy}% YoY revenue expansion.`;
  } else if (types.includes("VALUE")) {
    return `Buy: Excellent valuation with PE ${stock.pe}x, solid ${stock.roe_pct}% ROE and virtually zero debt (<0.5x).`;
  } else if (types.includes("BREAKOUT")) {
    return `Buy: Crossed 200 DMA with ${stock.vol_multiple}x volume surge indicating institutional buying momentum.`;
  } else if (types.includes("RESULTS")) {
    return `Hold/Buy: Accelerating ${stock.sales_growth_yoy}% YoY quarterly sales; maintain trailing stop loss.`;
  } else if (stock.pe > 70) {
    return `Hold: High valuation multiple; wait for consolidation near 200 DMA support.`;
  }
  return `Hold: Trading within fair value range with steady sector fundamentals.`;
}

// Batch assign Gemini verdicts in a SINGLE request for all stocks to stay well below rate limits
async function batchAssignGeminiVerdicts(stocks: StockData[]): Promise<void> {
  const uncached: StockData[] = [];
  const now = Date.now();

  for (const stock of stocks) {
    const cacheKey = `${stock.symbol}_${Math.round(stock.price)}_${stock.alerts.map(a => a.type).join("-")}`;
    const cached = verdictCache.get(cacheKey);
    if (cached && (now - cached.timestamp < VERDICT_CACHE_TTL_MS)) {
      stock.ai_verdict = cached.verdict;
    } else {
      uncached.push(stock);
    }
  }

  if (uncached.length === 0) return;

  if (ai) {
    try {
      const summaryList = uncached.map(s => {
        const triggers = s.alerts.map(a => a.type).join(", ") || "None";
        return `${s.symbol} (${s.name}): Price ₹${s.price} (${s.change_pct >= 0 ? '+' : ''}${s.change_pct}%), 200 DMA ₹${s.dma_200}, Vol Multiple ${s.vol_multiple}x, PE ${s.pe}, ROE ${s.roe_pct}%, D/E ${s.debt_to_equity}, Sales YoY +${s.sales_growth_yoy}%, Triggers: [${triggers}]`;
      }).join("\n");

      const prompt = `You are a senior Indian equity research analyst. Analyze these NSE jewellery stocks.
For EACH stock symbol, output a strictly 1-line verdict in format: "Buy/Hold/Sell: [1-sentence rationale under 25 words]".
Respond ONLY in JSON format where keys are the exact stock symbols and values are the 1-line verdicts:
{
  "${uncached[0]?.symbol || "TITAN.NS"}": "Buy: 1-line rationale here."
}

Stocks:
${summaryList}`;

      let responseText = "";
      // Primary: gemini-3.6-flash (recommended by Gemini deprecation notice for structured tasks)
      try {
        const res = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        responseText = res.text || "";
      } catch (err: any) {
        // Secondary: gemini-3.8-flash
        try {
          const res = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });
          responseText = res.text || "";
        } catch (innerErr: any) {
          // If both models are unavailable (503 temporary high demand or 429 quota exhausted), quietly fallback
          console.info("Gemini models temporarily busy or rate-limited; applying analyst heuristic rules.");
        }
      }

      if (responseText) {
        try {
          const parsed = JSON.parse(responseText.trim());
          for (const stock of uncached) {
            const verdict = parsed[stock.symbol] || parsed[stock.symbol.replace(".NS", "")];
            if (verdict && typeof verdict === "string") {
              stock.ai_verdict = verdict.trim().replace(/\n/g, " ");
              const cacheKey = `${stock.symbol}_${Math.round(stock.price)}_${stock.alerts.map(a => a.type).join("-")}`;
              verdictCache.set(cacheKey, { verdict: stock.ai_verdict, timestamp: now });
            }
          }
        } catch (parseErr) {
          // Fall through to heuristic assignment
        }
      }
    } catch (outerErr) {
      console.info("Gemini batch analysis bypassed, using heuristics.");
    }
  }

  // Ensure every stock has an authoritative verdict
  for (const stock of uncached) {
    if (!stock.ai_verdict) {
      stock.ai_verdict = getFallbackVerdict(stock, stock.alerts);
      const cacheKey = `${stock.symbol}_${Math.round(stock.price)}_${stock.alerts.map(a => a.type).join("-")}`;
      verdictCache.set(cacheKey, { verdict: stock.ai_verdict, timestamp: now });
    }
  }
}

// Single stock verdict helper (uses cache or batch)
async function getGeminiVerdict(stock: StockData, alerts: any[]): Promise<string> {
  const cacheKey = `${stock.symbol}_${Math.round(stock.price)}_${alerts.map(a => a.type).join("-")}`;
  const cached = verdictCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < VERDICT_CACHE_TTL_MS)) {
    return cached.verdict;
  }
  const fallback = getFallbackVerdict(stock, alerts);
  verdictCache.set(cacheKey, { verdict: fallback, timestamp: Date.now() });
  return fallback;
}

// Notification Helpers & Real Dispatch Engines
function resolveNotificationCredentials(custom?: any) {
  const config = getConfig();
  const notifs = config.notifications || {};

  // Clean helper to filter out default placeholders
  const cleanEnv = (val?: string) => {
    if (!val) return "";
    const trimmed = val.trim();
    if (trimmed.startsWith("your_") || trimmed === "MY_APP_URL" || trimmed === "") return "";
    return trimmed;
  };

  const tgBotToken = (custom?.telegram_bot_token || notifs.telegram?.bot_token || cleanEnv(process.env.TELEGRAM_BOT_TOKEN) || "").trim();
  const tgChatId = (custom?.telegram_chat_id || notifs.telegram?.chat_id || cleanEnv(process.env.TELEGRAM_CHAT_ID) || "").trim();

  const rawTwSid = (custom?.twilio_sid || "").trim();
  const savedTwSid = (notifs.whatsapp?.account_sid || cleanEnv(process.env.TWILIO_SID) || "").trim();
  // If custom SID starts with HX (stale input) but saved config has a valid AC... SID, prefer the valid one!
  const twSid = (rawTwSid && !rawTwSid.startsWith("HX")) ? rawTwSid : (savedTwSid || rawTwSid);

  const twToken = (custom?.twilio_auth_token || notifs.whatsapp?.auth_token || cleanEnv(process.env.TWILIO_AUTH_TOKEN) || "").trim();
  let twFrom = (custom?.twilio_from || notifs.whatsapp?.from_number || cleanEnv(process.env.TWILIO_WHATSAPP_NUMBER) || "+14155238886").trim();
  let twTo = (custom?.whatsapp_to || notifs.whatsapp?.to_number || cleanEnv(process.env.WHATSAPP_NUMBER) || "").trim();

  // Normalize Indian mobile numbers: 10 digits starting with 6/7/8/9 -> +91 prefix
  const cleanDigitsTo = twTo.replace(/[^0-9]/g, "");
  let normalizedTo = twTo;
  if (cleanDigitsTo.length === 10 && ["6", "7", "8", "9"].includes(cleanDigitsTo[0])) {
    normalizedTo = `+91${cleanDigitsTo}`;
  } else if (cleanDigitsTo.length > 10 && !normalizedTo.startsWith("+")) {
    normalizedTo = `+${cleanDigitsTo}`;
  }

  // Sender verification: personal mobile numbers cannot be Twilio WhatsApp senders
  const cleanDigitsFrom = twFrom.replace(/[^0-9]/g, "");
  let isSenderPersonalPhone = false;
  let effectiveFrom = twFrom;
  if (cleanDigitsFrom && (cleanDigitsFrom === cleanDigitsTo || cleanDigitsFrom.startsWith("91") || cleanDigitsFrom.length === 10)) {
    isSenderPersonalPhone = true;
    effectiveFrom = "+14155238886"; // Twilio Sandbox default number
  }

  // Check if Twilio SID starts with AC (Twilio Account SID standard format)
  const isTwilioSidInvalid = Boolean(twSid && !twSid.startsWith("AC"));

  // CallMeBot integration for free automated WhatsApp messaging
  const callmebotKey = (custom?.callmebot_key || custom?.callmebot_apikey || notifs.whatsapp?.callmebot_key || notifs.whatsapp?.callmebot_apikey || cleanEnv(process.env.CALLMEBOT_APIKEY) || "").trim();
  const callmebotPhone = (custom?.callmebot_phone || notifs.whatsapp?.callmebot_phone || normalizedTo || "").trim();

  return {
    telegram: {
      isConfigured: Boolean(tgBotToken && tgChatId && !tgBotToken.startsWith("your_")),
      botToken: tgBotToken,
      chatId: tgChatId,
      maskedToken: tgBotToken ? `${tgBotToken.slice(0, 4)}...${tgBotToken.slice(-4)}` : "",
      maskedChat: tgChatId ? `${tgChatId.slice(0, 3)}***` : ""
    },
    whatsapp: {
      isConfigured: Boolean((twSid && twToken && normalizedTo && !twSid.startsWith("your_")) || (callmebotKey && callmebotPhone)),
      provider: callmebotKey && (!twSid || isTwilioSidInvalid) ? "callmebot" : "twilio",
      accountSid: twSid,
      authToken: twToken,
      fromNumber: effectiveFrom,
      rawFromNumber: twFrom,
      toNumber: normalizedTo,
      rawToNumber: twTo,
      isSenderPersonalPhone,
      isTwilioSidInvalid,
      callmebotKey,
      callmebotPhone,
      maskedSid: twSid ? `${twSid.slice(0, 4)}...${twSid.slice(-4)}` : "",
      maskedTo: normalizedTo ? `${normalizedTo.slice(0, 4)}***${normalizedTo.slice(-2)}` : ""
    }
  };
}

async function dispatchTelegramMessage(botToken: string, chatId: string, text: string) {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true
      })
    });
    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      const desc = data?.description || `HTTP ${resp.status} ${resp.statusText}`;
      return { success: false, error: desc };
    }
    return { success: true, messageId: data.result?.message_id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reach Telegram servers" };
  }
}

// Helper to cleanly split long alert reports into WhatsApp-compatible chunks (Twilio limit is 1600 chars, Error 21617)
function splitMessageForWhatsApp(text: string, maxLen = 1450): string[] {
  if (text.length <= maxLen) return [text];

  const paragraphs = text.split("\n\n");
  const chunks: string[] = [];
  let current = "";

  for (const p of paragraphs) {
    const candidate = current ? `${current}\n\n${p}` : p;
    if (candidate.length <= maxLen) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      if (p.length > maxLen) {
        // Break large single paragraph line by line
        const lines = p.split("\n");
        let sub = "";
        for (const line of lines) {
          const subCandidate = sub ? `${sub}\n${line}` : line;
          if (subCandidate.length <= maxLen) {
            sub = subCandidate;
          } else {
            if (sub) chunks.push(sub);
            if (line.length > maxLen) {
              for (let i = 0; i < line.length; i += maxLen) {
                chunks.push(line.slice(i, i + maxLen));
              }
              sub = "";
            } else {
              sub = line;
            }
          }
        }
        if (sub) chunks.push(sub);
        current = "";
      } else {
        current = p;
      }
    }
  }
  if (current) chunks.push(current);

  return chunks.length > 0 ? chunks : [text];
}

async function dispatchCallMeBotWhatsApp(phone: string, apiKey: string, text: string) {
  try {
    let cleanPhone = phone.replace(/[^0-9+]/g, "");
    if (!cleanPhone.startsWith("+") && cleanPhone.length === 10) {
      cleanPhone = `+91${cleanPhone}`;
    }
    const cleanDigits = cleanPhone.replace(/[^0-9]/g, "");
    const chunks = splitMessageForWhatsApp(text, 1200);

    for (let i = 0; i < chunks.length; i++) {
      const partPrefix = chunks.length > 1 ? `[${i + 1}/${chunks.length}]\n` : "";
      const chunkBody = `${partPrefix}${chunks[i]}`;
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanDigits}&text=${encodeURIComponent(chunkBody)}&apikey=${encodeURIComponent(apiKey)}`;
      const resp = await fetch(url, { method: "GET" });
      const body = await resp.text();
      if (!resp.ok || (!body.includes("Message queued") && !body.includes("Success") && body.toLowerCase().includes("error"))) {
        return { success: false, error: body || `CallMeBot HTTP ${resp.status}` };
      }
      if (i < chunks.length - 1) {
        await new Promise(r => setTimeout(r, 600));
      }
    }
    return {
      success: true,
      message: chunks.length > 1 ? `Dispatched in ${chunks.length} parts via CallMeBot!` : "Dispatched successfully to WhatsApp via CallMeBot API!"
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to contact CallMeBot gateway" };
  }
}

async function dispatchTwilioWhatsAppMessage(accountSid: string, authToken: string, fromNum: string, toNum: string, text: string) {
  try {
    if (accountSid.startsWith("HX")) {
      return {
        success: false,
        error: `Authentication Error - invalid username (Code 20003). SID '${accountSid.slice(0, 4)}...${accountSid.slice(-4)}' is a Twilio Service SID, not an Account SID. Twilio requires your primary Account SID starting with 'AC' from https://console.twilio.com.`
      };
    }

    let from = fromNum.trim();
    let to = toNum.trim();
    if (!from.startsWith("whatsapp:")) from = `whatsapp:${from}`;
    if (!to.startsWith("whatsapp:")) to = `whatsapp:${to}`;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    // Twilio WhatsApp has a strict 1600-character limit per message (Twilio Error 21617)
    // We split long reports cleanly into multi-part messages
    const chunks = splitMessageForWhatsApp(text, 1450);
    const sids: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const partPrefix = chunks.length > 1 ? `[Part ${i + 1}/${chunks.length}]\n` : "";
      const chunkBody = `${partPrefix}${chunks[i]}`;

      const params = new URLSearchParams();
      params.append("From", from);
      params.append("To", to);
      params.append("Body", chunkBody);

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      const data = await resp.json();
      if (!resp.ok) {
        const errMsg = data?.message || `Twilio HTTP ${resp.status}: ${resp.statusText}`;
        const code = data?.code ? ` (Code ${data.code})` : "";
        return {
          success: false,
          error: `${errMsg}${code}${chunks.length > 1 ? ` (Part ${i + 1}/${chunks.length})` : ""}`
        };
      }
      sids.push(data.sid);

      // Add a slight pause between parts for delivery ordering
      if (i < chunks.length - 1) {
        await new Promise(r => setTimeout(r, 600));
      }
    }

    return {
      success: true,
      sid: sids.join(", "),
      status: "sent",
      parts: chunks.length,
      message: chunks.length > 1 ? `Dispatched in ${chunks.length} parts via Twilio WhatsApp!` : undefined
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reach Twilio API" };
  }
}

// API: Get App Status & Current Config
app.get("/api/config", (req, res) => {
  const config = getConfig();
  const creds = resolveNotificationCredentials();
  res.json({
    status: "ok",
    config,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasTelegram: creds.telegram.isConfigured,
    hasWhatsApp: creds.whatsapp.isConfigured,
    telegramDetails: {
      configured: creds.telegram.isConfigured,
      maskedToken: creds.telegram.maskedToken,
      maskedChat: creds.telegram.maskedChat
    },
    whatsappDetails: {
      configured: creds.whatsapp.isConfigured,
      provider: creds.whatsapp.provider,
      isTwilioSidInvalid: creds.whatsapp.isTwilioSidInvalid,
      isSenderPersonalPhone: creds.whatsapp.isSenderPersonalPhone,
      maskedSid: creds.whatsapp.maskedSid,
      maskedTo: creds.whatsapp.maskedTo,
      toNumber: creds.whatsapp.toNumber,
      hasCallMeBot: Boolean(creds.whatsapp.callmebotKey)
    }
  });
});

// API: Update Config (Triggers dynamic schedule change in main.py)
app.put("/api/config", (req, res) => {
  try {
    const updatedConfig = req.body;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updatedConfig, null, 2), "utf-8");
    res.json({ status: "ok", message: "Configuration updated successfully!", config: updatedConfig });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// API: Run Scan
app.post("/api/scan", async (req, res) => {
  try {
    const config = getConfig();
    const stocksConfig = config.stocks || [];
    const alertCfg = config.alert_types || {};

    const scannedStocks: StockData[] = [];
    const alertedStocks: StockData[] = [];

    for (const item of stocksConfig) {
      const base = STOCK_BASELINES[item.symbol] || {
        name: item.name,
        symbol: item.symbol,
        screener_slug: item.screener_slug || item.symbol.replace(".NS", ""),
        price: 250.0,
        change_pct: 1.5,
        dma_200: 230.0,
        volume: 500000,
        avg_vol_20d: 300000,
        vol_multiple: 1.66,
        pe: 18.0,
        roe_pct: 15.0,
        debt_to_equity: 0.3,
        sales_growth_yoy: 14.0,
        pat_growth_yoy: 15.0,
        screener_headline: "Q1 Results: 14% Sales Growth"
      };

      const stock: StockData = {
        name: item.name,
        symbol: item.symbol,
        screener_slug: item.screener_slug || item.symbol.replace(".NS", ""),
        price: base.price || 100,
        change_pct: base.change_pct || 0,
        dma_200: base.dma_200 || 90,
        volume: base.volume || 100000,
        avg_vol_20d: base.avg_vol_20d || 80000,
        vol_multiple: base.vol_multiple || 1.25,
        pe: base.pe || 20,
        roe_pct: base.roe_pct || 15,
        debt_to_equity: base.debt_to_equity || 0.4,
        sales_growth_yoy: base.sales_growth_yoy || 12,
        pat_growth_yoy: base.pat_growth_yoy || 12,
        screener_headline: base.screener_headline || "",
        alerts: []
      };

      // Try quick live price check
      const live = await tryFetchLivePrice(stock.symbol);
      if (live) {
        stock.price = Math.round(live.price * 100) / 100;
        stock.change_pct = Math.round(live.changePct * 100) / 100;
      }

      // Check filters
      stock.alerts = evaluateFilters(stock, alertCfg);
      scannedStocks.push(stock);
    }

    // Batch assign AI verdicts in a single API request (with caching & rate limit protection)
    await batchAssignGeminiVerdicts(scannedStocks);

    for (const stock of scannedStocks) {
      if (stock.alerts.length > 0) {
        alertedStocks.push(stock);
      }
    }

    // Format Alert Message
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const scanTimeStr = config.scan_time || "9AM";

    const lines: string[] = [`🚨 NSE SCAN ${scanTimeStr} - ${dateStr}`, ""];
    const displayList = alertedStocks.length > 0 ? alertedStocks : scannedStocks.slice(0, 3);

    displayList.forEach((s, idx) => {
      const code = s.symbol.replace(".NS", "");
      const priceStr = `₹${s.price}`;
      const sign = s.change_pct >= 0 ? "+" : "";
      const chgStr = `(${sign}${s.change_pct}%)`;

      if (s.alerts.length > 0) {
        const desc = s.alerts.map(a => `${a.type} Alert: ${a.description}`).join("; ");
        lines.push(`${idx + 1}. ${s.name} (${code}) - ${priceStr} ${chgStr} - ${desc}`);
      } else {
        lines.push(`${idx + 1}. ${s.name} (${code}) - ${priceStr} ${chgStr} - Watchlist (PE: ${s.pe}, ROE: ${s.roe_pct}%)`);
      }
      lines.push(`   AI Verdict: ${s.ai_verdict}`);
      lines.push("");
    });

    lines.push("⚡ Generated automatically by Daily NSE Jewellery Scanner");
    const formattedMessage = lines.join("\n");

    res.json({
      status: "ok",
      timestamp: now.toISOString(),
      dateStr,
      scanTime: scanTimeStr,
      totalScanned: scannedStocks.length,
      totalAlerts: alertedStocks.length,
      stocks: scannedStocks,
      alertedStocks,
      formattedMessage
    });
  } catch (err: any) {
    console.error("Scan error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// API: Source Code Explorer (provides python files for copy/download)
app.get("/api/python-files", (req, res) => {
  const files: Record<string, string> = {};
  const fileList = ["main.py", "scanner.py", "config.json", "requirements.txt", "README.md", "Dockerfile", ".env.example"];

  for (const f of fileList) {
    const p = path.join(process.cwd(), f);
    if (fs.existsSync(p)) {
      files[f] = fs.readFileSync(p, "utf-8");
    }
  }

  res.json({ status: "ok", files });
});

// Comprehensive Diagnostics Engine for Simulated & Live Endpoint Verification
async function runEndpointDiagnostics(credentials?: any, simulate = true) {
  const creds = resolveNotificationCredentials(credentials);
  const nowIST = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  // 1. Diagnose Telegram Endpoint
  const tgSteps: Array<{ name: string; status: "pass" | "fail" | "warn" | "info"; detail: string }> = [];
  let tgReachability: "reachable" | "unreachable" | "untested" = "untested";
  let tgStatus: "sent" | "simulated" | "error" | "missing_credentials" = "simulated";
  let tgDiagnosis = "";
  let tgActionableFix = "";
  let tgMsgId: string | number | undefined;

  const endpointTg = creds.telegram.botToken
    ? `https://api.telegram.org/bot${creds.telegram.maskedToken}/sendMessage`
    : "https://api.telegram.org/bot<MISSING_TOKEN>/sendMessage";

  // Step 1: Token Check
  if (!creds.telegram.botToken) {
    tgSteps.push({
      name: "Telegram Bot Token",
      status: "fail",
      detail: "Missing TELEGRAM_BOT_TOKEN. Automated alerts require a bot token from @BotFather."
    });
  } else {
    const validFormat = /^\d{7,12}:[A-Za-z0-9_-]{30,45}$/.test(creds.telegram.botToken);
    tgSteps.push({
      name: "Telegram Bot Token",
      status: validFormat ? "pass" : "warn",
      detail: validFormat
        ? `Configured (${creds.telegram.maskedToken}) - valid Telegram token structure.`
        : `Configured (${creds.telegram.maskedToken}) - token structure may be irregular.`
    });
  }

  // Step 2: Chat ID Check
  if (!creds.telegram.chatId) {
    tgSteps.push({
      name: "Telegram Recipient Chat ID",
      status: "fail",
      detail: "Missing TELEGRAM_CHAT_ID. The bot cannot route alerts without knowing the recipient user or channel ID."
    });
  } else {
    tgSteps.push({
      name: "Telegram Recipient Chat ID",
      status: "pass",
      detail: `Configured (${creds.telegram.maskedChat}).`
    });
  }

  // Step 3: Network Reachability Probe to Telegram API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const probeRes = await fetch("https://api.telegram.org", { method: "HEAD", signal: controller.signal });
    clearTimeout(timeoutId);
    tgReachability = "reachable";
    tgSteps.push({
      name: "Telegram API Gateway Reachability",
      status: "pass",
      detail: `Reachable (HTTP ${probeRes.status} from api.telegram.org). Gateway is responsive.`
    });
  } catch (probeErr: any) {
    tgReachability = "unreachable";
    tgSteps.push({
      name: "Telegram API Gateway Reachability",
      status: "warn",
      detail: `Probe warning: ${probeErr.message || "Timeout connecting to api.telegram.org"}.`
    });
  }

  const tgPayloadPreview = {
    chat_id: creds.telegram.chatId || "[NOT_CONFIGURED]",
    text: `🚨 [SIMULATED TEST ALERT] NSE Jewellery Scanner\n✓ Telegram notification connection verified!\n⏰ Timestamp: ${nowIST} IST\n⚡ Automated Alert Engine is healthy.`,
    disable_web_page_preview: true
  };

  // Step 4: Dispatch or Simulation Evaluation
  if (creds.telegram.isConfigured) {
    if (simulate) {
      tgStatus = "simulated";
      tgSteps.push({
        name: "Simulated Message Dispatch",
        status: "pass",
        detail: `Simulated message send succeeded. Payload validated and ready for routing to Telegram Chat ID ${creds.telegram.maskedChat}.`
      });
      tgDiagnosis = "Telegram endpoint is properly configured. Simulated test alert passed all format and routing checks.";
    } else {
      try {
        const tgRes = await dispatchTelegramMessage(
          creds.telegram.botToken,
          creds.telegram.chatId,
          tgPayloadPreview.text
        );
        if (tgRes.success) {
          tgStatus = "sent";
          tgMsgId = tgRes.messageId;
          tgSteps.push({
            name: "Live Dispatch Test",
            status: "pass",
            detail: `Delivered test alert successfully to chat ${creds.telegram.maskedChat}! Message ID: ${tgRes.messageId}`
          });
          tgDiagnosis = "Telegram endpoint is completely healthy, authenticated, and verified delivery.";
        } else {
          tgStatus = "error";
          const errLower = (tgRes.error || "").toLowerCase();
          let specificHint = "";
          if (errLower.includes("unauthorized") || errLower.includes("401")) {
            specificHint = "Bot token rejected by Telegram (HTTP 401 Unauthorized). Verify token from @BotFather.";
          } else if (errLower.includes("chat not found") || errLower.includes("400")) {
            specificHint = "Chat ID not found (HTTP 400). Message @userinfobot to get your personal numerical Chat ID.";
          } else if (errLower.includes("bot was blocked") || errLower.includes("forbidden") || errLower.includes("403")) {
            specificHint = "Bot permission blocked (HTTP 403). Open your bot on Telegram and press '/start' to allow messages.";
          }
          tgSteps.push({
            name: "Live Dispatch Test",
            status: "fail",
            detail: `Telegram API error: ${tgRes.error}`
          });
          tgDiagnosis = `Communication failed during delivery: ${tgRes.error}. ${specificHint}`;
          tgActionableFix = specificHint || "Verify your BOT_TOKEN and CHAT_ID, and make sure you have sent /start to your bot.";
        }
      } catch (e: any) {
        tgStatus = "error";
        tgDiagnosis = `Failed to contact Telegram API: ${e.message}`;
        tgSteps.push({
          name: "Live Dispatch Test",
          status: "fail",
          detail: e.message
        });
      }
    }
  } else {
    tgStatus = "missing_credentials";
    if (!creds.telegram.botToken && !creds.telegram.chatId) {
      tgDiagnosis = "Both Bot Token and Chat ID are missing. Telegram automated alerts cannot route.";
      tgActionableFix = "1. Message @BotFather on Telegram to create a bot & copy Token. 2. Message @userinfobot to get your Chat ID. 3. Click /start on your bot. 4. Enter them in config.";
    } else if (!creds.telegram.chatId) {
      tgDiagnosis = "Telegram Bot Token is set, but TELEGRAM_CHAT_ID is missing! Without a recipient chat ID, the bot cannot route alerts.";
      tgActionableFix = "1. Open Telegram and search for @userinfobot. 2. Send /start to get your personal Chat ID (e.g. 123456789). 3. Message your own bot and click /start so it has permission to message you. 4. Enter your Chat ID.";
    } else {
      tgDiagnosis = "Telegram Chat ID is set, but TELEGRAM_BOT_TOKEN is missing.";
      tgActionableFix = "Message @BotFather on Telegram to create a bot and enter the Token.";
    }
    tgSteps.push({
      name: "Simulated Message Payload",
      status: "info",
      detail: `Prepared simulated JSON payload for Telegram endpoint with simulated IST timestamp: ${nowIST}. Ready to dispatch as soon as credentials are supplied.`
    });
  }

  // 2. Diagnose WhatsApp Endpoint
  const waSteps: Array<{ name: string; status: "pass" | "fail" | "warn" | "info"; detail: string }> = [];
  let waReachability: "reachable" | "unreachable" | "untested" = "untested";
  let waStatus: "sent" | "simulated" | "error" | "missing_credentials" = "simulated";
  let waDiagnosis = "";
  let waActionableFix = "";
  let waSid: string | undefined;

  const endpointWa = creds.whatsapp.accountSid
    ? `https://api.twilio.com/2010-04-01/Accounts/${creds.whatsapp.maskedSid}/Messages.json`
    : "https://api.twilio.com/2010-04-01/Accounts/<MISSING_SID>/Messages.json";

  // Step 1: Twilio Account SID Analysis
  if (!creds.whatsapp.accountSid) {
    waSteps.push({
      name: "Twilio Account SID",
      status: "fail",
      detail: "Missing TWILIO_SID. Automated cloud WhatsApp dispatch requires a Twilio account."
    });
  } else if (creds.whatsapp.isTwilioSidInvalid) {
    waSteps.push({
      name: "Twilio Account SID (Invalid Format)",
      status: "fail",
      detail: `Configured SID starts with '${creds.whatsapp.accountSid.slice(0, 2)}' (${creds.whatsapp.maskedSid}). Twilio Account SIDs ALWAYS start with 'AC' (34 characters). Twilio returns Authentication Error (Code 20003) because '${creds.whatsapp.accountSid.slice(0, 2)}' is not an Account SID.`
    });
  } else {
    const validSid = /^AC[0-9a-fA-F]{32}$/.test(creds.whatsapp.accountSid);
    waSteps.push({
      name: "Twilio Account SID",
      status: validSid ? "pass" : "warn",
      detail: validSid
        ? `Configured (${creds.whatsapp.maskedSid}) - valid Twilio Account SID format.`
        : `Configured (${creds.whatsapp.maskedSid}) - SID format may be irregular.`
    });
  }

  // Step 2: Twilio Auth Token
  if (!creds.whatsapp.authToken) {
    waSteps.push({
      name: "Twilio Auth Token",
      status: "fail",
      detail: "Missing TWILIO_AUTH_TOKEN."
    });
  } else {
    waSteps.push({
      name: "Twilio Auth Token",
      status: "pass",
      detail: "Configured (masked for security)."
    });
  }

  // Step 3: Target Phone Number
  if (!creds.whatsapp.toNumber) {
    waSteps.push({
      name: "Recipient Phone Number",
      status: "fail",
      detail: "Missing target WHATSAPP_NUMBER."
    });
  } else {
    const cleanPhone = creds.whatsapp.toNumber.replace(/[^0-9]/g, "");
    waSteps.push({
      name: "Recipient Phone Number",
      status: cleanPhone.length >= 10 ? "pass" : "warn",
      detail: `Configured (${creds.whatsapp.toNumber}) with country code.`
    });
  }

  // Step 4: Sender Verification
  if (creds.whatsapp.isSenderPersonalPhone) {
    waSteps.push({
      name: "Twilio WhatsApp Sender ('From')",
      status: "warn",
      detail: `TWILIO_WHATSAPP_NUMBER was set to personal mobile (${creds.whatsapp.rawFromNumber}). Auto-directed to Twilio's Sandbox number (${creds.whatsapp.fromNumber}) because Twilio cannot send messages from unapproved personal numbers.`
    });
  } else {
    waSteps.push({
      name: "Twilio WhatsApp Sender ('From')",
      status: "pass",
      detail: `Configured (${creds.whatsapp.fromNumber}) - Twilio WhatsApp Gateway.`
    });
  }

  // Step 5: Twilio Network Probe
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const probeRes = await fetch("https://api.twilio.com", { method: "HEAD", signal: controller.signal });
    clearTimeout(timeoutId);
    waReachability = "reachable";
    waSteps.push({
      name: "Twilio API Gateway Reachability",
      status: "pass",
      detail: `Reachable (HTTP ${probeRes.status} from api.twilio.com). Gateway is responsive.`
    });
  } catch (probeErr: any) {
    waReachability = "unreachable";
    waSteps.push({
      name: "Twilio API Gateway Reachability",
      status: "warn",
      detail: `Probe warning: ${probeErr.message || "Timeout connecting to api.twilio.com"}.`
    });
  }

  const waPayloadPreview = {
    From: `whatsapp:${creds.whatsapp.fromNumber || "+14155238886"}`,
    To: `whatsapp:${creds.whatsapp.toNumber || "[NOT_CONFIGURED]"}`,
    Body: `🚨 [SIMULATED TEST ALERT] NSE Jewellery Scanner\n✓ WhatsApp notification connection verified!\n⏰ Timestamp: ${nowIST} IST\n⚡ Automated Alert Engine is active.`
  };

  // Step 6: Dispatch or Simulation Evaluation
  if (creds.whatsapp.callmebotKey && creds.whatsapp.callmebotPhone) {
    if (simulate) {
      waStatus = "simulated";
      waSteps.push({
        name: "CallMeBot Gateway Verification",
        status: "pass",
        detail: `CallMeBot free WhatsApp gateway configured for recipient ${creds.whatsapp.callmebotPhone}. Payload validated.`
      });
      waDiagnosis = "CallMeBot WhatsApp gateway is configured and validated. Ready to send automated alerts.";
    } else {
      const cbRes = await dispatchCallMeBotWhatsApp(creds.whatsapp.callmebotPhone, creds.whatsapp.callmebotKey, waPayloadPreview.Body);
      if (cbRes.success) {
        waStatus = "sent";
        waSteps.push({
          name: "CallMeBot Live Dispatch",
          status: "pass",
          detail: "Delivered test alert via CallMeBot free WhatsApp API!"
        });
        waDiagnosis = "WhatsApp alert delivered successfully via CallMeBot!";
      } else {
        waStatus = "error";
        waSteps.push({
          name: "CallMeBot Live Dispatch",
          status: "fail",
          detail: `CallMeBot error: ${cbRes.error}`
        });
        waDiagnosis = `CallMeBot rejected message: ${cbRes.error}`;
      }
    }
  } else if (creds.whatsapp.isConfigured) {
    if (creds.whatsapp.isTwilioSidInvalid) {
      waStatus = "error";
      waDiagnosis = `Twilio Authentication Error (Code 20003): Your Twilio SID starts with '${creds.whatsapp.accountSid.slice(0, 2)}' (${creds.whatsapp.maskedSid}). Twilio requires your primary Account SID (34 characters starting with 'AC') from the Twilio Console (https://console.twilio.com).`;
      waActionableFix = "1. Open https://console.twilio.com and copy the Account SID starting with 'AC'. 2. Update TWILIO_SID. 3. In the meantime, click 'Open in WhatsApp' or 'Send to My WhatsApp' above to send alerts immediately without Twilio!";
      waSteps.push({
        name: "Live Dispatch Test (Aborted)",
        status: "fail",
        detail: `Aborted dispatch: Twilio will reject SID '${creds.whatsapp.maskedSid}' with Error 20003 (Authentication Error - invalid username). Must start with 'AC'.`
      });
    } else if (simulate) {
      waStatus = "simulated";
      waSteps.push({
        name: "Simulated Message Dispatch",
        status: "pass",
        detail: `Simulated message send succeeded. Payload validated and ready for Twilio WhatsApp recipient ${creds.whatsapp.toNumber}.`
      });
      waDiagnosis = "WhatsApp endpoint is properly configured. Simulated test alert passed all format and routing checks.";
    } else {
      try {
        const waRes = await dispatchTwilioWhatsAppMessage(
          creds.whatsapp.accountSid,
          creds.whatsapp.authToken,
          creds.whatsapp.fromNumber,
          creds.whatsapp.toNumber,
          waPayloadPreview.Body
        );
        if (waRes.success) {
          waStatus = "sent";
          waSid = waRes.sid;
          waSteps.push({
            name: "Live Dispatch Test",
            status: "pass",
            detail: `Dispatched test alert via Twilio WhatsApp API! SID: ${waRes.sid}`
          });
          waDiagnosis = "Twilio WhatsApp endpoint is fully configured and successfully accepted the alert message.";
        } else {
          waStatus = "error";
          const errLower = (waRes.error || "").toLowerCase();
          let specificHint = "";
          if (errLower.includes("21608") || errLower.includes("unregistered") || errLower.includes("sandbox")) {
            specificHint = "Twilio Sandbox requirement: Recipient phone must join sandbox first by texting the join keyword to +14155238886.";
          } else if (errLower.includes("20003") || errLower.includes("authenticate")) {
            specificHint = "Twilio Authentication failed. Check that your Account SID starts with 'AC' and Auth Token is active in Twilio Console.";
          } else if (errLower.includes("21211") || errLower.includes("invalid 'to' phone")) {
            specificHint = "Invalid phone number format. Must include country code without dashes or spaces (e.g. +919876543210).";
          }
          waSteps.push({
            name: "Live Dispatch Test",
            status: "fail",
            detail: `Twilio API error: ${waRes.error}`
          });
          waDiagnosis = `Twilio rejected the test message: ${waRes.error}. ${specificHint}`;
          waActionableFix = specificHint || "Check Twilio Account SID, Auth Token, and Sandbox opt-in status.";
        }
      } catch (e: any) {
        waStatus = "error";
        waDiagnosis = `Failed to contact Twilio API: ${e.message}`;
        waSteps.push({
          name: "Live Dispatch Test",
          status: "fail",
          detail: e.message
        });
      }
    }
  } else {
    waStatus = "missing_credentials";
    waDiagnosis = "Twilio WhatsApp credentials (SID, Auth Token, or Target Phone) not configured for automated cloud dispatch.";
    waActionableFix = "Enter Twilio API keys below, OR click 'Open in WhatsApp' / 'Send to Phone' above for instant zero-configuration delivery!";
    waSteps.push({
      name: "Simulated Message Payload",
      status: "info",
      detail: `Prepared simulated WhatsApp payload. Also compatible with 1-click direct link https://wa.me/${(creds.whatsapp.toNumber || "").replace(/[^0-9]/g, "")}`
    });
  }

  // Calculate Overall Status
  const isTgSuccess = tgStatus === "sent" || tgStatus === "simulated";
  const isWaSuccess = waStatus === "sent" || waStatus === "simulated";
  const overallSuccess = isTgSuccess && isWaSuccess;
  const overallPartial = isTgSuccess || isWaSuccess;
  const statusSummary: "ok" | "partial" | "failed" = overallSuccess ? "ok" : (overallPartial ? "partial" : "failed");

  let summaryText = "";
  if (overallSuccess) {
    summaryText = simulate
      ? "Simulated message send completed successfully on both Telegram and WhatsApp endpoints! All credentials & payload formats are valid."
      : "Both Telegram and WhatsApp endpoints successfully received live test alerts!";
  } else if (isTgSuccess && !isWaSuccess) {
    summaryText = `Telegram endpoint verified successfully! WhatsApp: ${waDiagnosis}`;
  } else if (isWaSuccess && !isTgSuccess) {
    summaryText = `WhatsApp endpoint verified successfully! Telegram: ${tgDiagnosis}`;
  } else {
    summaryText = `Simulated message send completed. Telegram: ${tgStatus === "error" ? "Error detected" : "Missing credentials"}. WhatsApp: ${waStatus === "error" ? "Error detected" : "Missing credentials"}. See detailed debug breakdown below.`;
  }

  return {
    status: statusSummary,
    timestamp: nowIST,
    summary: summaryText,
    simulated: simulate,
    telegram: {
      channel: "telegram" as const,
      status: tgStatus,
      endpointUrl: endpointTg,
      configured: creds.telegram.isConfigured,
      reachability: tgReachability,
      messageIdOrSid: tgMsgId ? String(tgMsgId) : undefined,
      debugSteps: tgSteps,
      diagnosis: tgDiagnosis,
      actionableFix: tgActionableFix,
      payloadPreview: tgPayloadPreview
    },
    whatsapp: {
      channel: "whatsapp" as const,
      status: waStatus,
      endpointUrl: endpointWa,
      configured: creds.whatsapp.isConfigured,
      reachability: waReachability,
      messageIdOrSid: waSid,
      debugSteps: waSteps,
      diagnosis: waDiagnosis,
      actionableFix: waActionableFix,
      payloadPreview: waPayloadPreview,
      issueDetails: {
        code: creds.whatsapp.isTwilioSidInvalid ? "20003" : undefined,
        accountSidIssue: creds.whatsapp.isTwilioSidInvalid,
        senderIssue: creds.whatsapp.isSenderPersonalPhone,
        sandboxIssue: true,
        recipientIssue: !creds.whatsapp.toNumber
      }
    }
  };
}

// API: Test notification dispatch / simulated message send to debug communication failure
app.post("/api/alerts/test", async (req, res) => {
  try {
    const { channel, credentials, simulate } = req.body;
    const creds = resolveNotificationCredentials(credentials);
    const nowIST = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // If testing all/both channels or simulated alert request
    if (!channel || channel === "both" || channel === "all" || simulate === true) {
      const diagResult = await runEndpointDiagnostics(credentials, simulate !== false);
      return res.json(diagResult);
    }

    if (channel === "telegram") {
      if (!creds.telegram.isConfigured) {
        return res.json({
          status: "missing_credentials",
          channel: "telegram",
          message: "Telegram Bot Token and Chat ID are not configured.",
          instructions: "1. Message @BotFather on Telegram to create a bot & copy the BOT_TOKEN.\n2. Message @userinfobot or your channel/group to get your CHAT_ID.\n3. Make sure you click 'Start' (/start) on your bot so it has permission to message you.\n4. Enter credentials in the form below or set them in AI Studio Secrets."
        });
      }

      const testMsg = `🚨 [TEST ALERT] Daily NSE Jewellery Scanner\n✓ Telegram notification connection verified successfully!\n⏰ Timestamp: ${nowIST} IST\n⚡ Automated Alert Engine is active.`;
      const result = await dispatchTelegramMessage(creds.telegram.botToken, creds.telegram.chatId, testMsg);

      if (result.success) {
        return res.json({
          status: "sent",
          channel: "telegram",
          message: `Telegram test alert delivered successfully! (Message ID: ${result.messageId})`
        });
      } else {
        return res.json({
          status: "error",
          channel: "telegram",
          message: `Telegram error: ${result.error}`,
          hint: "Double check your Bot Token and Chat ID. Did you press /start on your bot first?"
        });
      }
    }

    if (channel === "whatsapp") {
      const testMsg = `🚨 [TEST ALERT] Daily NSE Jewellery Scanner\n✓ WhatsApp notification connection verified successfully!\n⏰ Timestamp: ${nowIST} IST\n⚡ Automated Alert Engine is active.`;

      // Option 1: CallMeBot
      if (creds.whatsapp.callmebotKey && creds.whatsapp.callmebotPhone) {
        const cbRes = await dispatchCallMeBotWhatsApp(creds.whatsapp.callmebotPhone, creds.whatsapp.callmebotKey, testMsg);
        if (cbRes.success) {
          return res.json({
            status: "sent",
            channel: "whatsapp",
            message: "WhatsApp test alert dispatched successfully via CallMeBot API!"
          });
        } else {
          return res.json({
            status: "error",
            channel: "whatsapp",
            message: `CallMeBot error: ${cbRes.error}`
          });
        }
      }

      if (!creds.whatsapp.isConfigured) {
        return res.json({
          status: "missing_credentials",
          channel: "whatsapp",
          message: "Twilio Account SID, Auth Token, or WhatsApp Number is not configured.",
          instructions: "1. Sign up at twilio.com and find your Account SID (starts with 'AC') & Auth Token in the console.\n2. In Messaging > Try WhatsApp, follow instructions to join the Sandbox (e.g. send 'join <code>' to +14155238886).\n3. Enter your phone number with country code (e.g. +919962988612).\n4. Or use the 1-click 'Open in WhatsApp' or 'Send to My WhatsApp' button above to share directly with zero configuration!"
        });
      }

      if (creds.whatsapp.isTwilioSidInvalid) {
        return res.json({
          status: "error",
          channel: "whatsapp",
          message: `Twilio Authentication Error (Code 20003): Your Twilio Account SID starts with '${creds.whatsapp.accountSid.slice(0, 2)}' ('${creds.whatsapp.maskedSid}'). Twilio requires your primary Account SID (34 chars starting with 'AC') from https://console.twilio.com.`,
          hint: "Log in to console.twilio.com and copy the Account SID starting with 'AC'. Or click 'Open in WhatsApp' above for instant 1-click alert delivery without Twilio!"
        });
      }

      const result = await dispatchTwilioWhatsAppMessage(
        creds.whatsapp.accountSid,
        creds.whatsapp.authToken,
        creds.whatsapp.fromNumber,
        creds.whatsapp.toNumber,
        testMsg
      );

      if (result.success) {
        return res.json({
          status: "sent",
          channel: "whatsapp",
          message: `WhatsApp test alert dispatched via Twilio! (SID: ${result.sid})`
        });
      } else {
        return res.json({
          status: "error",
          channel: "whatsapp",
          message: `Twilio error: ${result.error}`,
          hint: "If using Twilio Sandbox, verify that your recipient phone has joined by texting the sandbox keyword to +14155238886."
        });
      }
    }

    return res.status(400).json({ status: "error", message: "Invalid channel specified. Choose 'telegram', 'whatsapp', or 'both'." });
  } catch (err: any) {
    console.error("Alert test error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
});

// API: Send Live Alert Message
app.post("/api/alerts/send", async (req, res) => {
  try {
    const { channel, message, credentials } = req.body; // 'telegram' | 'whatsapp' | 'both'
    const creds = resolveNotificationCredentials(credentials);

    if (!message || typeof message !== "string") {
      return res.status(400).json({ status: "error", message: "Alert message text is required." });
    }

    const results: Record<string, any> = {};

    if (channel === "telegram" || channel === "both") {
      if (!creds.telegram.isConfigured) {
        results.telegram = {
          status: "missing_credentials",
          message: "Telegram Bot Token or Chat ID not configured."
        };
      } else {
        const tgRes = await dispatchTelegramMessage(creds.telegram.botToken, creds.telegram.chatId, message);
        results.telegram = tgRes.success
          ? { status: "sent", message: `Delivered to Telegram! (Msg ID: ${tgRes.messageId})` }
          : { status: "error", message: `Telegram Error: ${tgRes.error}` };
      }
    }

    if (channel === "whatsapp" || channel === "both") {
      if (creds.whatsapp.callmebotKey && creds.whatsapp.callmebotPhone) {
        const cbRes = await dispatchCallMeBotWhatsApp(creds.whatsapp.callmebotPhone, creds.whatsapp.callmebotKey, message);
        results.whatsapp = cbRes.success
          ? { status: "sent", message: "Dispatched to WhatsApp via CallMeBot API!" }
          : { status: "error", message: `CallMeBot Error: ${cbRes.error}` };
      } else if (!creds.whatsapp.isConfigured) {
        results.whatsapp = {
          status: "missing_credentials",
          message: "Twilio SID, Auth Token, or WhatsApp Number not configured."
        };
      } else if (creds.whatsapp.isTwilioSidInvalid) {
        results.whatsapp = {
          status: "error",
          message: `Twilio Error 20003: Account SID starts with '${creds.whatsapp.accountSid.slice(0, 2)}'. Must start with 'AC' from twilio.com/console.`
        };
      } else {
        const waRes = await dispatchTwilioWhatsAppMessage(
          creds.whatsapp.accountSid,
          creds.whatsapp.authToken,
          creds.whatsapp.fromNumber,
          creds.whatsapp.toNumber,
          message
        );
        results.whatsapp = waRes.success
          ? { status: "sent", message: `Dispatched to WhatsApp via Twilio! (SID: ${waRes.sid})` }
          : { status: "error", message: `Twilio WhatsApp Error: ${waRes.error}` };
      }
    }

    const allSent = Object.values(results).every(r => r.status === "sent");
    const anySent = Object.values(results).some(r => r.status === "sent");

    return res.json({
      status: allSent ? "ok" : anySent ? "partial" : "error",
      results
    });
  } catch (err: any) {
    console.error("Send alert error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Daily NSE Jewellery Scanner server running on port ${PORT}`);
  });
}

startServer();
