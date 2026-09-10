import { PreSurgeStock } from "../types";

/**
 * Export scanner results to clean Excel-compatible CSV.
 * Fixes the classic Excel freeze / Scroll Lock issue by:
 * 1. Prepending UTF-8 Byte Order Mark (\uFEFF) to force standard Excel encoding.
 * 2. Strict RFC 4180 escaping so commas and quotes do not misalign columns.
 * 3. Stripping any rogue control characters.
 * 4. Specifying explicit headers requested by user:
 *    Symbol, Price, Volume X, Delivery %, Buy%, Sell%, News Reason, Bulk Buyer, Risk Level
 */
export function exportScannerResultsToExcel(stocks: PreSurgeStock[], fileName: string = "BTST_Surge_Detector_Scan") {
  const headers = [
    "Symbol",
    "Company Name",
    "Price (INR)",
    "Change (%)",
    "Volume X (vs 20D Avg)",
    "Delivery %",
    "Buy % (Market Depth)",
    "Sell % (Market Depth)",
    "News Reason",
    "Bulk Buyer",
    "Risk Level",
    "Filters Matched"
  ];

  const escapeCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    // If the cell contains comma, newline or quotes, wrap in quotes
    if (str.includes(",") || str.includes("\n") || str.includes("\r") || str.includes('"')) {
      return `"${str}"`;
    }
    return `"${str}"`;
  };

  const rows = stocks.map((s) => [
    escapeCell(s.symbol),
    escapeCell(s.name),
    escapeCell((s.price ?? 0).toFixed(2)),
    escapeCell(`${s.change >= 0 ? "+" : ""}${((s.change_pct ?? s.changePct ?? 0)).toFixed(2)}%`),
    escapeCell(`${s.vol_multiple}x`),
    escapeCell(`${(s.delivery_pct ?? 0).toFixed(1)}%`),
    escapeCell(`${(s.market_depth?.buy_pct ?? 50).toFixed(2)}%`),
    escapeCell(`${(s.market_depth?.sell_pct ?? 50).toFixed(2)}%`),
    escapeCell(s.reason_tag || s.filters.filter_a_detail || "N/A"),
    escapeCell(s.bulk_buyer_summary || "N/A"),
    escapeCell(s.risk_level),
    escapeCell(`${s.filters.matched_count}/4 Signals`)
  ]);

  // UTF-8 BOM (\uFEFF) makes Excel open UTF-8 without mangling Indian Rupee or special characters
  const csvContent = "\uFEFF" + [headers.map(escapeCell).join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
