import { PreSurgeStock, PortfolioHolding } from "../types";

export const MOCK_INDICES = {
  nifty50: {
    symbol: "NIFTY 50",
    value: 25014.20,
    change: 124.50,
    changePct: 0.50,
    status: "LIVE"
  },
  bankNifty: {
    symbol: "BANK NIFTY",
    value: 51480.10,
    change: 210.30,
    changePct: 0.41,
    status: "LIVE"
  },
  sensex: {
    symbol: "BSE SENSEX",
    value: 81785.40,
    change: 390.20,
    changePct: 0.48,
    status: "LIVE"
  },
  gold24k: {
    symbol: "MCX GOLD (10g)",
    value: 74850,
    change: 320,
    changePct: 0.43,
    unit: "₹/10g"
  }
};

export const MOCK_PRE_SURGE_STOCKS: PreSurgeStock[] = [
  {
    id: "pc-jeweller",
    symbol: "PCJEWELLER",
    name: "PC Jeweller Ltd",
    exchange: "NSE",
    price: 13.92,
    change: 0.05,
    change_pct: 0.36,
    changePct: 0.36,
    day_low: 13.55,
    day_high: 14.10,
    low_52w: 11.20,
    high_52w: 19.80,
    pct_above_52w_low: 24.28,
    volume: 141200000,
    avg_vol_20d: 9940000,
    vol_multiple: 14.2,
    delivery_pct: 68.4,
    delivery_history_3d: [64.2, 69.1, 68.4],
    market_depth: {
      buy_pct: 27.52,
      sell_pct: 72.48,
      total_buy_qty: 3892100,
      total_sell_qty: 10248500,
      bids: [
        { price: 13.90, orders: 42, quantity: 450000 },
        { price: 13.85, orders: 38, quantity: 680000 },
        { price: 13.80, orders: 95, quantity: 1120000 },
        { price: 13.75, orders: 54, quantity: 820000 },
        { price: 13.70, orders: 61, quantity: 792100 }
      ],
      asks: [
        { price: 13.95, orders: 124, quantity: 1850000 },
        { price: 14.00, orders: 280, quantity: 3450000 },
        { price: 14.05, orders: 110, quantity: 1980000 },
        { price: 14.10, orders: 145, quantity: 1720000 },
        { price: 14.15, orders: 92, quantity: 1248500 }
      ]
    },
    reason_tag: "Debt Free Catalyst",
    filters: {
      filter_a_news: true,
      filter_a_detail: "BSE Announcement (15 min ago): Cleared debt for 11 of 14 banks, repaid 96% for remaining 3, aiming debt-free this month.",
      filter_b_volume_delivery: true,
      filter_b_detail: "Today's Volume 14.2x vs 20D avg (141.2M shares). Delivery % > 60% (68.4%) for 3 continuous days. Price is +24.3% above 52W low (₹11.20).",
      filter_c_bulk_deals: true,
      filter_c_detail: "HRTI Pvt Ltd sold 141.2M shares at ₹13.40. Absorption occurred at day's low without breakdown; institutional accumulation footprint.",
      filter_d_price_action: true,
      filter_d_detail: "1D chart: Made intraday low of 13.55 then recovered +2.73% to 13.92. 1W chart: 3-day 37% run followed by 5.5% consolidation flag on low volume = continuation setup.",
      matched_count: 4
    },
    category: "PRE_SURGE",
    risk_level: "Speculative Turnaround",
    bulk_buyer_summary: "HRTI Pvt Ltd (141.2M shares absorbed @ ₹13.40)",
    bulk_deals: [
      {
        id: "bd-pc-1",
        date: "Today, 11:45 AM",
        time: "11:45 AM",
        client_name: "HRTI PRIVATE LIMITED",
        deal_type: "SELL",
        quantity: 141200000,
        trade_price: 13.40,
        exchange: "NSE",
        remarks: "Massive institutional handoff absorbed immediately by DIIs & consortium buyers without breaking support."
      },
      {
        id: "bd-pc-2",
        date: "Yesterday, 02:15 PM",
        time: "02:15 PM",
        client_name: "QUANT DYNAMIC VALUE FUND",
        deal_type: "BUY",
        quantity: 18500000,
        trade_price: 13.45,
        exchange: "NSE",
        remarks: "Block accumulation at support level."
      }
    ],
    news: [
      {
        id: "n-pc-1",
        title: "BSE Filing: PC Jeweller cleared debt for 11 of 14 banks, repaid 96% for remaining 3, aiming debt-free this month",
        source: "BSE Corporate Announcements",
        time_ago: "15 min ago",
        dateStr: "Today, 10:32 AM",
        category: "ANNOUNCEMENT",
        snippet: "PC Jeweller informs exchange that settlement agreements with 11 consortium banks have been fully satisfied. For remaining 3 banks, 96% of negotiated dues are settled via escrow.",
        keywords_matched: ["debt free", "debt cleared", "repaid 96%", "debt repaid"],
        sentiment: "BULLISH"
      },
      {
        id: "n-pc-2",
        title: "Livemint: PC Jeweller falls 5.5% after 37% weekly surge due to routine profit booking",
        source: "Livemint Markets",
        time_ago: "2 days ago",
        dateStr: "2 days ago",
        category: "MEDIA",
        snippet: "Stock witnessed mild consolidation on lower delivery volume after hitting consecutive upper circuits earlier in the week, testing support near ₹13.40.",
        keywords_matched: ["profit booking", "surge"],
        sentiment: "NEUTRAL"
      },
      {
        id: "n-pc-3",
        title: "NSE Bulk Deals: HRTI Pvt Ltd offloads 141.2M shares @ 13.40, bought by domestic funds",
        source: "NSE Bulk Deals Radar",
        time_ago: "2 days ago",
        dateStr: "2 days ago",
        category: "BULK_DEAL",
        snippet: "High-volume block transfer executed at VWAP of ₹13.40, clearing overhang from financial institutions.",
        keywords_matched: ["bulk deal", "accumulation"],
        sentiment: "BULLISH"
      }
    ],
    technicals: {
      pe: 28.0,
      rsi: 58.4,
      dma_200: 11.80,
      dma_50: 12.40,
      intraday_recovery_pct: 2.73,
      run_3d_pct: 37.0,
      pullback_pct: 5.5,
      support: 13.20,
      resistance: 14.80,
      debt_to_equity: 0.35 // falling dramatically after settlement
    },
    charts: {
      "1D": [
        { time: "09:15", price: 13.88, volume: 12500000 },
        { time: "10:00", price: 13.72, volume: 24000000 },
        { time: "11:00", price: 13.55, volume: 45000000 }, // Intraday low
        { time: "12:00", price: 13.68, volume: 22000000 },
        { time: "13:00", price: 13.80, volume: 18000000 },
        { time: "14:00", price: 13.89, volume: 11000000 },
        { time: "15:30", price: 13.92, volume: 8700000 }
      ],
      "1W": [
        { time: "Day 1", price: 10.40, volume: 35000000 },
        { time: "Day 2", price: 12.20, volume: 82000000 },
        { time: "Day 3", price: 14.60, volume: 110000000 }, // +37% peak
        { time: "Day 4", price: 13.80, volume: 45000000 }, // 5.5% pullback
        { time: "Day 5", price: 13.92, volume: 141200000 }
      ],
      "1M": [
        { time: "Week 1", price: 11.10, volume: 48000000 },
        { time: "Week 2", price: 11.45, volume: 55000000 },
        { time: "Week 3", price: 12.20, volume: 92000000 },
        { time: "Week 4", price: 13.92, volume: 380000000 }
      ],
      "3M": [
        { time: "Month 1", price: 10.80, volume: 120000000 },
        { time: "Month 2", price: 11.50, volume: 210000000 },
        { time: "Month 3", price: 13.92, volume: 620000000 }
      ]
    },
    events: [
      {
        date: "Sept 24, 2026",
        title: "Annual General Meeting (AGM)",
        type: "AGM",
        description: "Adoption of revised audited balance sheet post-debt resolution and restructuring plan."
      },
      {
        date: "Sept 18, 2026",
        title: "Final Bank Settlement Milestone",
        type: "DEBT_MILESTONE",
        description: "Expected closure of final 3 pending consortium accounts with total release of pledged assets."
      }
    ]
  },
  {
    id: "kalyan-jewellers",
    symbol: "KALYANKJIL",
    name: "Kalyan Jewellers India Ltd",
    exchange: "NSE",
    price: 612.60,
    change: -7.80,
    change_pct: -1.25,
    changePct: -1.25,
    day_low: 612.00,
    day_high: 624.50,
    low_52w: 485.00,
    high_52w: 742.00,
    pct_above_52w_low: 26.31,
    volume: 8520000,
    avg_vol_20d: 3850000,
    vol_multiple: 2.21,
    delivery_pct: 63.8,
    delivery_history_3d: [61.2, 65.4, 63.8],
    market_depth: {
      buy_pct: 42.10,
      sell_pct: 57.90,
      total_buy_qty: 1240000,
      total_sell_qty: 1705000,
      bids: [
        { price: 612.60, orders: 84, quantity: 185000 },
        { price: 612.00, orders: 215, quantity: 420000 },
        { price: 611.50, orders: 92, quantity: 210000 },
        { price: 611.00, orders: 130, quantity: 245000 },
        { price: 610.00, orders: 164, quantity: 180000 }
      ],
      asks: [
        { price: 613.00, orders: 95, quantity: 240000 },
        { price: 613.50, orders: 112, quantity: 310000 },
        { price: 614.00, orders: 140, quantity: 415000 },
        { price: 615.00, orders: 180, quantity: 450000 },
        { price: 616.00, orders: 88, quantity: 290000 }
      ]
    },
    reason_tag: "Institutional Block Buy @ Low",
    filters: {
      filter_a_news: true,
      filter_a_detail: "BSE/NSE: Q1 revenue growth +31% YoY with Middle East margin turnaround. 24 new FOCO showrooms inaugurated.",
      filter_b_volume_delivery: true,
      filter_b_detail: "Volume 2.21x 20D avg. Delivery % > 60% for 3 continuous days (63.8% today). Price is +26.3% above 52W low (₹485).",
      filter_c_bulk_deals: true,
      filter_c_detail: "Block of 27.46 Lakh shares @ ₹612.60 executed at 11:57 AM while market was 612-613. Marquee institutional buyer scooped up supply at day's low.",
      filter_d_price_action: true,
      filter_d_detail: "1D chart: Rock-solid bounce from 612.00 intraday support with high buyer absorption. 1W chart: Healthy 4% pullback after run to 638, showing strong base formation.",
      matched_count: 4
    },
    category: "BTST_CONFIRMED",
    risk_level: "Moderate",
    bulk_buyer_summary: "Marquee Institutional Fund (27.46L shares @ ₹612.60 at day low)",
    bulk_deals: [
      {
        id: "bd-kj-1",
        date: "Today, 11:57 AM",
        time: "11:57 AM",
        client_name: "MARQUEE INSTITUTIONAL INDIA FUND",
        deal_type: "BUY",
        quantity: 2746000,
        trade_price: 612.60,
        exchange: "NSE",
        remarks: "Massive block buy executed right at intraday low (612-613 band). High accumulation signature."
      },
      {
        id: "bd-kj-2",
        date: "3 days ago",
        time: "01:30 PM",
        client_name: "HSBC GLOBAL INVESTMENT FUNDS",
        deal_type: "BUY",
        quantity: 1200000,
        trade_price: 618.40,
        exchange: "NSE",
        remarks: "Portfolio addition prior to festive season retail sales pickup."
      }
    ],
    news: [
      {
        id: "n-kj-1",
        title: "Kalyan Jewellers: Block deal of 27.46 Lakh shares completed on NSE at ₹612.60",
        source: "NSE Deals Terminal",
        time_ago: "Today, 11:58 AM",
        dateStr: "Today, 11:58 AM",
        category: "BULK_DEAL",
        snippet: "Large institutional block cross trade of 27.46L shares (value ~₹168.2 Cr) executed at ₹612.60 near days low.",
        keywords_matched: ["block buy", "bulk buy", "low price"],
        sentiment: "BULLISH"
      },
      {
        id: "n-kj-2",
        title: "Q1 Results: Kalyan Jewellers net profit surges 29.4% YoY; revenue cross ₹6,000 Cr mark",
        source: "BSE Financial Results",
        time_ago: "5 days ago",
        dateStr: "5 days ago",
        category: "RESULTS",
        snippet: "Robust same-store sales growth of 12% in India and strong customer footfalls in South & West zones.",
        keywords_matched: ["Q1 results", "profit surge"],
        sentiment: "BULLISH"
      }
    ],
    technicals: {
      pe: 54.0,
      rsi: 54.2,
      dma_200: 510.0,
      dma_50: 588.0,
      intraday_recovery_pct: 1.15,
      run_3d_pct: 4.8,
      pullback_pct: 2.1,
      support: 610.0,
      resistance: 650.0,
      debt_to_equity: 0.72
    },
    charts: {
      "1D": [
        { time: "09:15", price: 622.0, volume: 850000 },
        { time: "10:30", price: 618.5, volume: 1100000 },
        { time: "11:57", price: 612.6, volume: 2746000 }, // Block buy!
        { time: "13:00", price: 613.2, volume: 920000 },
        { time: "14:15", price: 614.0, volume: 1400000 },
        { time: "15:30", price: 612.6, volume: 1504000 }
      ],
      "1W": [
        { time: "Mon", price: 604.0, volume: 4200000 },
        { time: "Tue", price: 618.0, volume: 5100000 },
        { time: "Wed", price: 628.5, volume: 6800000 },
        { time: "Thu", price: 620.4, volume: 4900000 },
        { time: "Fri", price: 612.6, volume: 8520000 }
      ],
      "1M": [
        { time: "W1", price: 580.0, volume: 22000000 },
        { time: "W2", price: 595.0, volume: 26000000 },
        { time: "W3", price: 625.0, volume: 34000000 },
        { time: "W4", price: 612.6, volume: 31000000 }
      ],
      "3M": [
        { time: "M1", price: 520.0, volume: 84000000 },
        { time: "M2", price: 565.0, volume: 96000000 },
        { time: "M3", price: 612.6, volume: 118000000 }
      ]
    },
    events: [
      {
        date: "Oct 12, 2026",
        title: "Festive Pre-Diwali Showroom Rollout",
        type: "RESULTS",
        description: "Launch of 15 new stores ahead of Dhanteras and Diwali jewelry shopping season."
      }
    ]
  },
  {
    id: "senco-gold",
    symbol: "SENCO",
    name: "Senco Gold Ltd",
    exchange: "NSE",
    price: 1085.00,
    change: 40.00,
    change_pct: 3.83,
    changePct: 3.83,
    day_low: 1042.00,
    day_high: 1092.00,
    low_52w: 720.00,
    high_52w: 1215.00,
    pct_above_52w_low: 50.69,
    volume: 3240000,
    avg_vol_20d: 1150000,
    vol_multiple: 2.82,
    delivery_pct: 71.5,
    delivery_history_3d: [68.0, 72.4, 71.5],
    market_depth: {
      buy_pct: 62.40,
      sell_pct: 37.60,
      total_buy_qty: 480000,
      total_sell_qty: 290000,
      bids: [
        { price: 1084.0, orders: 45, quantity: 68000 },
        { price: 1082.0, orders: 58, quantity: 95000 },
        { price: 1080.0, orders: 110, quantity: 140000 },
        { price: 1075.0, orders: 62, quantity: 87000 },
        { price: 1070.0, orders: 74, quantity: 90000 }
      ],
      asks: [
        { price: 1086.0, orders: 32, quantity: 45000 },
        { price: 1088.0, orders: 48, quantity: 62000 },
        { price: 1090.0, orders: 85, quantity: 98000 },
        { price: 1092.0, orders: 41, quantity: 50000 },
        { price: 1095.0, orders: 30, quantity: 35000 }
      ]
    },
    reason_tag: "Q1 Results Profit Surge",
    filters: {
      filter_a_news: true,
      filter_a_detail: "BSE/NSE: Q1 net profit surges 26.8% YoY with sales up 27.5%. High wedding jewelry volumes.",
      filter_b_volume_delivery: true,
      filter_b_detail: "Volume 2.82x vs 20D avg. Delivery % stands at stellar 71.5% (>60% 3 days continuous). Price is 50.7% above 52W low.",
      filter_c_bulk_deals: false,
      filter_c_detail: "No fresh bulk deal recorded today; standard institutional accumulation on order book.",
      filter_d_price_action: true,
      filter_d_detail: "1D chart: Low 1042 -> High 1092, closed strong +3.83% near day high. BTST setup primed.",
      matched_count: 3
    },
    category: "BTST_CONFIRMED",
    risk_level: "Moderate",
    bulk_buyer_summary: "DII Mutual Fund accumulation (Delivery 71.5%)",
    bulk_deals: [],
    news: [
      {
        id: "n-senco-1",
        title: "Senco Gold Q1 profit surge 26.8% YoY; eastern market share expands to record 14%",
        source: "BSE Filing",
        time_ago: "1 day ago",
        dateStr: "1 day ago",
        category: "RESULTS",
        snippet: "Strong demand for lightweight diamond and gold temple jewellery drives higher EBITDA margins of 8.2%.",
        keywords_matched: ["profit surge", "Q1 results"],
        sentiment: "BULLISH"
      }
    ],
    technicals: {
      pe: 34.5,
      rsi: 71.2,
      dma_200: 940.0,
      dma_50: 1010.0,
      intraday_recovery_pct: 4.12,
      run_3d_pct: 8.5,
      pullback_pct: 1.2,
      support: 1040.0,
      resistance: 1120.0,
      debt_to_equity: 0.62
    },
    charts: {
      "1D": [
        { time: "09:15", price: 1045.0, volume: 380000 },
        { time: "11:00", price: 1062.0, volume: 740000 },
        { time: "13:00", price: 1074.0, volume: 890000 },
        { time: "15:30", price: 1085.0, volume: 1230000 }
      ],
      "1W": [
        { time: "Day 1", price: 1020.0, volume: 1200000 },
        { time: "Day 2", price: 1035.0, volume: 1600000 },
        { time: "Day 3", price: 1050.0, volume: 2100000 },
        { time: "Day 4", price: 1068.0, volume: 2400000 },
        { time: "Day 5", price: 1085.0, volume: 3240000 }
      ],
      "1M": [
        { time: "W1", price: 980.0, volume: 6500000 },
        { time: "W2", price: 1010.0, volume: 7200000 },
        { time: "W3", price: 1040.0, volume: 8400000 },
        { time: "W4", price: 1085.0, volume: 11200000 }
      ],
      "3M": [
        { time: "M1", price: 890.0, volume: 24000000 },
        { time: "M2", price: 960.0, volume: 28000000 },
        { time: "M3", price: 1085.0, volume: 38000000 }
      ]
    },
    events: [
      {
        date: "Oct 05, 2026",
        title: "Q2 Business Update & Festive Pre-Sales",
        type: "RESULTS",
        description: "Advance release of festive bookings and digital gold platform metrics."
      }
    ]
  },
  {
    id: "goldiam-intl",
    symbol: "GOLDIAM",
    name: "Goldiam International Ltd",
    exchange: "NSE",
    price: 388.50,
    change: 9.30,
    change_pct: 2.45,
    changePct: 2.45,
    day_low: 377.00,
    day_high: 391.00,
    low_52w: 220.00,
    high_52w: 412.00,
    pct_above_52w_low: 76.59,
    volume: 1850000,
    avg_vol_20d: 720000,
    vol_multiple: 2.57,
    delivery_pct: 74.2,
    delivery_history_3d: [70.5, 73.1, 74.2],
    market_depth: {
      buy_pct: 58.20,
      sell_pct: 41.80,
      total_buy_qty: 320000,
      total_sell_qty: 230000,
      bids: [
        { price: 388.0, orders: 25, quantity: 45000 },
        { price: 387.0, orders: 32, quantity: 68000 },
        { price: 385.0, orders: 50, quantity: 95000 },
        { price: 383.0, orders: 40, quantity: 52000 },
        { price: 380.0, orders: 45, quantity: 60000 }
      ],
      asks: [
        { price: 389.0, orders: 18, quantity: 32000 },
        { price: 390.0, orders: 42, quantity: 78000 },
        { price: 391.0, orders: 35, quantity: 55000 },
        { price: 392.0, orders: 24, quantity: 38000 },
        { price: 395.0, orders: 20, quantity: 27000 }
      ]
    },
    reason_tag: "Debt Free Exporter",
    filters: {
      filter_a_news: true,
      filter_a_detail: "BSE: Lab-grown diamond export orders surge 48% YoY; 100% debt-free balance sheet maintained.",
      filter_b_volume_delivery: true,
      filter_b_detail: "Delivery % 74.2% (>60% 3 days). Volume 2.57x normal. Stock is well above 52W low.",
      filter_c_bulk_deals: false,
      filter_c_detail: "No active block today, but consistent high delivery buy percentage.",
      filter_d_price_action: true,
      filter_d_detail: "Bounced from 377 intraday support, consolidating near lifetime high with low volatility.",
      matched_count: 3
    },
    category: "PRE_SURGE",
    risk_level: "Low",
    bulk_buyer_summary: "High delivery export focus (Delivery 74.2%)",
    bulk_deals: [],
    news: [
      {
        id: "n-gold-1",
        title: "Goldiam bags fresh ₹85 Cr US retail order for Lab-Grown Diamond studded jewelry",
        source: "BSE Announcements",
        time_ago: "3 days ago",
        dateStr: "3 days ago",
        category: "ANNOUNCEMENT",
        snippet: "Export order to be fulfilled over the next 4 months with superior gross margins of 38%.",
        keywords_matched: ["debt free", "export order"],
        sentiment: "BULLISH"
      }
    ],
    technicals: {
      pe: 14.2,
      rsi: 64.5,
      dma_200: 340.0,
      dma_50: 368.0,
      intraday_recovery_pct: 3.05,
      run_3d_pct: 6.2,
      pullback_pct: 0.8,
      support: 375.0,
      resistance: 405.0,
      debt_to_equity: 0.04
    },
    charts: {
      "1D": [
        { time: "09:15", price: 378.0, volume: 220000 },
        { time: "11:30", price: 382.5, volume: 490000 },
        { time: "13:30", price: 386.0, volume: 540000 },
        { time: "15:30", price: 388.5, volume: 600000 }
      ],
      "1W": [
        { time: "Day 1", price: 372.0, volume: 750000 },
        { time: "Day 2", price: 376.0, volume: 880000 },
        { time: "Day 3", price: 380.0, volume: 1100000 },
        { time: "Day 4", price: 383.0, volume: 1250000 },
        { time: "Day 5", price: 388.5, volume: 1850000 }
      ],
      "1M": [
        { time: "W1", price: 350.0, volume: 3800000 },
        { time: "W2", price: 362.0, volume: 4200000 },
        { time: "W3", price: 375.0, volume: 5100000 },
        { time: "W4", price: 388.5, volume: 6800000 }
      ],
      "3M": [
        { time: "M1", price: 310.0, volume: 12000000 },
        { time: "M2", price: 345.0, volume: 15500000 },
        { time: "M3", price: 388.5, volume: 19800000 }
      ]
    },
    events: [
      {
        date: "Sept 30, 2026",
        title: "Interim Dividend Record Date",
        type: "DIVIDEND",
        description: "Special interim dividend payout of ₹4.00 per share."
      }
    ]
  },
  {
    id: "tbz-jewellers",
    symbol: "TBZ",
    name: "Tribhovandas Bhimji Zaveri Ltd",
    exchange: "NSE",
    price: 248.00,
    change: 12.00,
    change_pct: 5.08,
    changePct: 5.08,
    day_low: 234.00,
    day_high: 250.00,
    low_52w: 130.00,
    high_52w: 265.00,
    pct_above_52w_low: 90.77,
    volume: 2450000,
    avg_vol_20d: 720000,
    vol_multiple: 3.40,
    delivery_pct: 64.0,
    delivery_history_3d: [61.0, 63.5, 64.0],
    market_depth: {
      buy_pct: 68.50,
      sell_pct: 31.50,
      total_buy_qty: 620000,
      total_sell_qty: 285000,
      bids: [
        { price: 247.5, orders: 42, quantity: 95000 },
        { price: 246.0, orders: 65, quantity: 140000 },
        { price: 245.0, orders: 88, quantity: 185000 },
        { price: 243.0, orders: 50, quantity: 110000 },
        { price: 240.0, orders: 40, quantity: 90000 }
      ],
      asks: [
        { price: 248.5, orders: 28, quantity: 48000 },
        { price: 249.0, orders: 45, quantity: 72000 },
        { price: 250.0, orders: 90, quantity: 125000 },
        { price: 251.0, orders: 18, quantity: 22000 },
        { price: 252.0, orders: 12, quantity: 18000 }
      ]
    },
    reason_tag: "AGM Turnaround Approval",
    filters: {
      filter_a_news: true,
      filter_a_detail: "BSE: AGM approved asset monetization to pay off term debt and fund 12 new Tier-2 franchise outlets.",
      filter_b_volume_delivery: true,
      filter_b_detail: "Volume 3.40x 20D avg. Delivery % > 60% (64.0% today, 3 days continuous). Price +90.8% above 52W low.",
      filter_c_bulk_deals: true,
      filter_c_detail: "Bulk buy: 4.85L shares picked up at ₹236.00 by Mumbai family office near day's low.",
      filter_d_price_action: true,
      filter_d_detail: "1D chart: Made low 234, recovered +5.98% to close at 248 near upper circuit band. Superb BTST continuation.",
      matched_count: 4
    },
    category: "BTST_CONFIRMED",
    risk_level: "High",
    bulk_buyer_summary: "Mumbai Family Office (4.85L shares @ ₹236.00)",
    bulk_deals: [
      {
        id: "bd-tbz-1",
        date: "Today, 10:15 AM",
        time: "10:15 AM",
        client_name: "KEDIA SECURITIES PRIVATE LIMITED",
        deal_type: "BUY",
        quantity: 485000,
        trade_price: 236.00,
        exchange: "NSE",
        remarks: "Purchased near day's low; volume spike followed immediately."
      }
    ],
    news: [
      {
        id: "n-tbz-1",
        title: "TBZ AGM approves major debt restructuring and 12-store expansion roadmap",
        source: "BSE Corporate Announcements",
        time_ago: "Today, 09:45 AM",
        dateStr: "Today, 09:45 AM",
        category: "ANNOUNCEMENT",
        snippet: "Shareholders greenlight key restructuring to trim bank borrowing by ₹110 Cr before Q3.",
        keywords_matched: ["AGM", "debt repaid", "debt cleared"],
        sentiment: "BULLISH"
      }
    ],
    technicals: {
      pe: 22.4,
      rsi: 73.8,
      dma_200: 175.0,
      dma_50: 215.0,
      intraday_recovery_pct: 5.98,
      run_3d_pct: 16.4,
      pullback_pct: 1.8,
      support: 232.0,
      resistance: 260.0,
      debt_to_equity: 0.85
    },
    charts: {
      "1D": [
        { time: "09:15", price: 235.0, volume: 320000 },
        { time: "11:00", price: 238.0, volume: 680000 },
        { time: "13:30", price: 243.5, volume: 740000 },
        { time: "15:30", price: 248.0, volume: 710000 }
      ],
      "1W": [
        { time: "Day 1", price: 212.0, volume: 650000 },
        { time: "Day 2", price: 218.0, volume: 820000 },
        { time: "Day 3", price: 228.0, volume: 1200000 },
        { time: "Day 4", price: 236.0, volume: 1650000 },
        { time: "Day 5", price: 248.0, volume: 2450000 }
      ],
      "1M": [
        { time: "W1", price: 185.0, volume: 3200000 },
        { time: "W2", price: 198.0, volume: 4100000 },
        { time: "W3", price: 220.0, volume: 5500000 },
        { time: "W4", price: 248.0, volume: 7800000 }
      ],
      "3M": [
        { time: "M1", price: 155.0, volume: 11000000 },
        { time: "M2", price: 180.0, volume: 14500000 },
        { time: "M3", price: 248.0, volume: 22000000 }
      ]
    },
    events: [
      {
        date: "Oct 20, 2026",
        title: "Q2 Board Meeting & Financials",
        type: "RESULTS",
        description: "Review of preliminary festive Dhanteras advance bookings."
      }
    ]
  },
  {
    id: "radhika-jeweltech",
    symbol: "RADHIKAJWE",
    name: "Radhika Jeweltech Ltd",
    exchange: "NSE",
    price: 92.50,
    change: 3.75,
    change_pct: 4.22,
    changePct: 4.22,
    day_low: 88.00,
    day_high: 94.00,
    low_52w: 62.00,
    high_52w: 110.00,
    pct_above_52w_low: 49.19,
    volume: 3100000,
    avg_vol_20d: 1000000,
    vol_multiple: 3.10,
    delivery_pct: 66.8,
    delivery_history_3d: [62.4, 65.0, 66.8],
    market_depth: {
      buy_pct: 54.60,
      sell_pct: 45.40,
      total_buy_qty: 480000,
      total_sell_qty: 398000,
      bids: [
        { price: 92.0, orders: 35, quantity: 85000 },
        { price: 91.5, orders: 48, quantity: 115000 },
        { price: 90.0, orders: 80, quantity: 160000 },
        { price: 89.0, orders: 40, quantity: 75000 },
        { price: 88.0, orders: 30, quantity: 45000 }
      ],
      asks: [
        { price: 93.0, orders: 42, quantity: 92000 },
        { price: 93.5, orders: 38, quantity: 86000 },
        { price: 94.0, orders: 65, quantity: 120000 },
        { price: 94.5, orders: 25, quantity: 55000 },
        { price: 95.0, orders: 20, quantity: 45000 }
      ]
    },
    reason_tag: "Store Expansion + Low PE",
    filters: {
      filter_a_news: true,
      filter_a_detail: "BSE: Gujarat regional footprint expanded with 3 new high-street jewelry showrooms.",
      filter_b_volume_delivery: true,
      filter_b_detail: "Volume 3.1x 20D avg. Delivery % 66.8% (>60% 3 days). Price is +49.2% above 52W low.",
      filter_c_bulk_deals: false,
      filter_c_detail: "Retail & HNI accumulation; no block trade today.",
      filter_d_price_action: true,
      filter_d_detail: "1D chart: Low 88.00 -> recovered +5.11% to 92.50.",
      matched_count: 3
    },
    category: "PRE_SURGE",
    risk_level: "High",
    bulk_buyer_summary: "Regional HNI buying footprint",
    bulk_deals: [],
    news: [
      {
        id: "n-rad-1",
        title: "Radhika Jeweltech opens 3 new stores in Saurashtra region ahead of wedding season",
        source: "BSE Filing",
        time_ago: "2 days ago",
        dateStr: "2 days ago",
        category: "ANNOUNCEMENT",
        snippet: "Company targets ₹400 Cr revenue milestone in FY27 driven by pure 22K certified hallmarked jewelry.",
        keywords_matched: ["expansion"],
        sentiment: "BULLISH"
      }
    ],
    technicals: {
      pe: 13.8,
      rsi: 69.4,
      dma_200: 78.0,
      dma_50: 84.5,
      intraday_recovery_pct: 5.11,
      run_3d_pct: 7.2,
      pullback_pct: 1.4,
      support: 87.0,
      resistance: 98.0,
      debt_to_equity: 0.12
    },
    charts: {
      "1D": [
        { time: "09:15", price: 88.5, volume: 450000 },
        { time: "11:30", price: 90.0, volume: 820000 },
        { time: "13:30", price: 91.8, volume: 980000 },
        { time: "15:30", price: 92.5, volume: 850000 }
      ],
      "1W": [
        { time: "Day 1", price: 86.0, volume: 1100000 },
        { time: "Day 2", price: 87.5, volume: 1400000 },
        { time: "Day 3", price: 89.0, volume: 1800000 },
        { time: "Day 4", price: 90.5, volume: 2200000 },
        { time: "Day 5", price: 92.5, volume: 3100000 }
      ],
      "1M": [
        { time: "W1", price: 79.0, volume: 4800000 },
        { time: "W2", price: 82.0, volume: 5500000 },
        { time: "W3", price: 87.0, volume: 7200000 },
        { time: "W4", price: 92.5, volume: 9400000 }
      ],
      "3M": [
        { time: "M1", price: 71.0, volume: 14000000 },
        { time: "M2", price: 78.0, volume: 18000000 },
        { time: "M3", price: 92.5, volume: 26000000 }
      ]
    },
    events: []
  },
  {
    id: "titan-company",
    symbol: "TITAN",
    name: "Titan Company Ltd",
    exchange: "NSE",
    price: 3450.00,
    change: 29.00,
    change_pct: 0.85,
    changePct: 0.85,
    day_low: 3420.00,
    day_high: 3465.00,
    low_52w: 3055.00,
    high_52w: 3886.00,
    pct_above_52w_low: 12.93,
    volume: 1200000,
    avg_vol_20d: 1100000,
    vol_multiple: 1.09,
    delivery_pct: 62.0,
    delivery_history_3d: [59.0, 61.2, 62.0],
    market_depth: {
      buy_pct: 51.20,
      sell_pct: 48.80,
      total_buy_qty: 180000,
      total_sell_qty: 172000,
      bids: [
        { price: 3448.0, orders: 15, quantity: 24000 },
        { price: 3445.0, orders: 28, quantity: 45000 },
        { price: 3440.0, orders: 40, quantity: 60000 },
        { price: 3435.0, orders: 20, quantity: 26000 },
        { price: 3430.0, orders: 18, quantity: 25000 }
      ],
      asks: [
        { price: 3452.0, orders: 14, quantity: 22000 },
        { price: 3455.0, orders: 30, quantity: 48000 },
        { price: 3460.0, orders: 42, quantity: 58000 },
        { price: 3465.0, orders: 19, quantity: 24000 },
        { price: 3470.0, orders: 15, quantity: 20000 }
      ]
    },
    reason_tag: "Large-Cap Anchor",
    filters: {
      filter_a_news: false,
      filter_a_detail: "No urgent catalyst news in last 7 days; regular Tanishq promotional campaigns.",
      filter_b_volume_delivery: false,
      filter_b_detail: "Volume is normal at 1.09x. Delivery is 62.0%.",
      filter_c_bulk_deals: false,
      filter_c_detail: "No block deals reported today.",
      filter_d_price_action: false,
      filter_d_detail: "Range-bound consolidation between 3420 and 3465.",
      matched_count: 0
    },
    category: "PRE_SURGE",
    risk_level: "Low",
    bulk_buyer_summary: "Steady Institutional DII/FII holding",
    bulk_deals: [],
    news: [
      {
        id: "n-tit-1",
        title: "Tanishq unveils festive international collection for US and UAE diaspora",
        source: "Media Release",
        time_ago: "4 days ago",
        dateStr: "4 days ago",
        category: "MEDIA",
        snippet: "Global retail footprint touches 18 international stores with rapid traction in GCC countries.",
        keywords_matched: [],
        sentiment: "NEUTRAL"
      }
    ],
    technicals: {
      pe: 82.0,
      rsi: 52.4,
      dma_200: 3380.0,
      dma_50: 3440.0,
      intraday_recovery_pct: 0.88,
      run_3d_pct: 1.5,
      pullback_pct: 0.4,
      support: 3380.0,
      resistance: 3550.0,
      debt_to_equity: 0.55
    },
    charts: {
      "1D": [
        { time: "09:15", price: 3430.0, volume: 180000 },
        { time: "11:30", price: 3442.0, volume: 320000 },
        { time: "13:30", price: 3448.0, volume: 390000 },
        { time: "15:30", price: 3450.0, volume: 310000 }
      ],
      "1W": [
        { time: "Day 1", price: 3410.0, volume: 950000 },
        { time: "Day 2", price: 3425.0, volume: 1050000 },
        { time: "Day 3", price: 3438.0, volume: 1100000 },
        { time: "Day 4", price: 3442.0, volume: 1150000 },
        { time: "Day 5", price: 3450.0, volume: 1200000 }
      ],
      "1M": [
        { time: "W1", price: 3390.0, volume: 5200000 },
        { time: "W2", price: 3415.0, volume: 5600000 },
        { time: "W3", price: 3430.0, volume: 5900000 },
        { time: "W4", price: 3450.0, volume: 6100000 }
      ],
      "3M": [
        { time: "M1", price: 3300.0, volume: 22000000 },
        { time: "M2", price: 3380.0, volume: 24000000 },
        { time: "M3", price: 3450.0, volume: 26000000 }
      ]
    },
    events: []
  }
];

// Pre-seeded user holding based on the user's explicit profile:
// "User trades in stocks like Kalyan Jewellers (current holding 1334 shares avg 642.73, holding 14 months, wants to exit at 650)"
export const INITIAL_USER_PORTFOLIO: PortfolioHolding[] = [
  {
    id: "holding-kalyan",
    symbol: "KALYANKJIL",
    name: "Kalyan Jewellers India Ltd",
    quantity: 1334,
    buyPrice: 642.730997,
    buyDate: "2025-07-11", // ~425 days ago (14 months)
    targetExitPrice: 650.00,
    dividendReceivedPerShare: 2.50, // 1334 * 2.50 = 3335
    currentPrice: 612.60
  }
];
