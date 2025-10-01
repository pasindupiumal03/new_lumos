export function getNewsSourceInfo(domain: string) {
  const map: Record<string, { name: string }> = {
    "coindesk.com": { name: "CoinDesk" },
    "cointelegraph.com": { name: "Cointelegraph" },
    "theblock.co": { name: "The Block" },
    "decrypt.co": { name: "Decrypt" },
    "bitcoinmagazine.com": { name: "Bitcoin Magazine" },
    "cnbc.com": { name: "CNBC" },
    "bloomberg.com": { name: "Bloomberg" },
    "wsj.com": { name: "WSJ Markets" },
    "finance.yahoo.com": { name: "Yahoo Finance" },
    "marketwatch.com": { name: "MarketWatch" },
  };

  const safeDomain = domain || "news";
  const name = map[safeDomain]?.name || safeDomain;
  const logo = `https://www.google.com/s2/favicons?domain=${safeDomain}&sz=64`;

  return { name, logo, domain: safeDomain };
}

/**
 * Ultra-light sentiment scoring based on keywords.
 * You can refine as needed (e.g., with a ML model later).
 */
export function naiveSentimentFrom(text: string): "positive" | "negative" | "neutral" {
  const t = (text || "").toLowerCase();
  const posHits = ["surge", "rally", "bull", "up", "gain", "beats", "record", "all-time high", "soars"];
  const negHits = ["dump", "bear", "down", "loss", "miss", "falls", "plunge", "sell-off", "lawsuit", "insolvency"];

  const pos = posHits.some((w) => t.includes(w));
  const neg = negHits.some((w) => t.includes(w));

  if (pos && !neg) return "positive";
  if (neg && !pos) return "negative";
  return "neutral";
}

/** Detect coin tag by title/description keywords */
export function detectCoin(text: string): string {
  const t = (text || "").toUpperCase();
  if (/\bBTC|BITCOIN\b/.test(t)) return "BTC";
  if (/\bETH|ETHEREUM\b/.test(t)) return "ETH";
  if (/\bSOL|SOLANA\b/.test(t)) return "SOL";
  return "";
}

// Provided for your current UI import, not used directly here
export function getSentimentInfo(s: "positive" | "negative" | "neutral") {
  return {
    label: s.charAt(0).toUpperCase() + s.slice(1),
    color:
      s === "positive" ? "green" : s === "negative" ? "red" : "amber",
  };
}