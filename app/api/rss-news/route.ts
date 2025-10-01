import { NextResponse } from "next/server";
import { parseRssXml } from "@/lib/rss";
import { detectCoin, getNewsSourceInfo, naiveSentimentFrom } from "@/lib/newsUtils";

// Choose your sources
const CRYPTO_FEEDS = [
  "https://www.coindesk.com/arc/outboundfeeds/rss/",
  "https://cointelegraph.com/rss",
  "https://www.theblock.co/rss",            // sometimes partial
  "https://decrypt.co/feed",
  "https://bitcoinmagazine.com/.rss/full/",
];

const US_MARKET_FEEDS = [
  "https://www.cnbc.com/id/100003114/device/rss/rss.html", // CNBC Markets
  "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",          // WSJ Markets
  "https://www.bloomberg.com/markets/rss",                  // Bloomberg Markets
  "https://finance.yahoo.com/news/rssindex",                // Yahoo Finance
  "https://feeds.marketwatch.com/marketwatch/topstories/",  // MarketWatch
];

function uniqBy<T>(arr: T[], key: (x: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get("category") || "crypto").toLowerCase(); // "crypto" | "us"
  const q = (searchParams.get("q") || "").trim(); // comma-separated keywords (e.g., BTC,ETH,SOL)
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "50", 10) || 50, 100);

  const feeds = category === "us" ? US_MARKET_FEEDS : CRYPTO_FEEDS;

  try {
    const xmls = await Promise.allSettled(
      feeds.map((u) =>
        fetch(u, { cache: "no-store" }).then((r) => {
          if (!r.ok) throw new Error(`${u} -> ${r.status}`);
          return r.text();
        })
      )
    );

    let items: any[] = [];
    xmls.forEach((res) => {
      if (res.status === "fulfilled") {
        const part = parseRssXml(res.value);
        items = items.concat(part);
      }
    });

    // Dedupe by link/id
    items = uniqBy(items, (x) => x.link || x.id || x.title);

    // Map to your page's NewsItem-like shape
    const mapped = items.map((i) => {
      const source = getNewsSourceInfo(i.domain);
      const combinedText = `${i.title} ${i.description}`;
      const coin = detectCoin(combinedText);
      const sentiment = naiveSentimentFrom(combinedText);

      return {
        id: i.id,
        title: i.title,
        source,
        publishedAt: i.publishedAt,
        time: "", // UI computes timeAgo itself
        sentiment,
        sentimentScore: 0,
        coin,
        excerpt: (i.description || "").replace(/<[^>]+>/g, "").slice(0, 280),
        engagement: 0,
        fullContent: "",
        url: i.link,
        thumbnail: i.thumbnail || null,
        votes: undefined,
      };
    });

    // keyword filter (comma-separated)
    let filtered = mapped;
    if (q) {
      const parts = q
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (parts.length) {
        filtered = mapped.filter((m) => {
          const text = `${m.title} ${m.excerpt}`.toLowerCase();
          return parts.some((p) => text.includes(p.toLowerCase()));
        });
      }
    }

    // Sort by publishedAt desc
    filtered.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

    // Pagination (server-side optional; your UI paginates too)
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = filtered.slice(start, end);

    return NextResponse.json({
      results: pageItems,
      total: filtered.length,
      page,
      pageSize,
      next: end < filtered.length ? page + 1 : null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch RSS feeds" },
      { status: 500 }
    );
  }
}