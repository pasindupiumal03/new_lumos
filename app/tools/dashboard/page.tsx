"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../Sidebar";
import {
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiExternalLink,
  FiCopy,
  } from "react-icons/fi";
  import { FaBitcoin, FaEthereum, FaCoins } from "react-icons/fa";
  import { SiRipple, SiCoinmarketcap } from "react-icons/si";
  import { Ri24HoursLine, RiBtcFill } from "react-icons/ri";
  import { MdOutlineSentimentVeryDissatisfied } from "react-icons/md";


const fallbackStats = [
  { id: 1, label: "Total Coins", value: "12,345", icon: <FaCoins className="w-8 h-8 text-[#5B50E1]" /> },
  { id: 2, label: "Market Cap", value: "$2.1T", change: 1.8, icon: <SiCoinmarketcap className="w-8 h-8 text-[#5B50E1]" /> },
  { id: 3, label: "24h Volume", value: "$65B", icon: <Ri24HoursLine className="w-8 h-8 text-[#5B50E1]" /> },
  { id: 4, label: "BTC Dominance", value: "48.2%", icon: <RiBtcFill className="w-8 h-8 text-[#5B50E1]" /> },
  { id: 5, label: "Market Sentiment", value: "Neutral", icon: <MdOutlineSentimentVeryDissatisfied className="w-8 h-8 text-[#5B50E1]" /> },
];

import type { ReactNode } from "react";

interface StatItem {
  id: number;
  label: string;
  value: string;
  change?: number;
  icon: ReactNode;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  time: string;
  sentiment: string;
  icon: React.ReactNode | null;
  change: number;
  tags: string[];
  source: {
    name: string;
    domain: string;
    logo: string;
  };
  url: string;
  thumbnail?: string | null;
}

interface CoinItem {
  id: string;
  name: string;
  price: string;
  change: number;
  address: string;
  shortAddress: string;
  since: string;
  volume: string;
  image?: string | null;
}

const SentimentBadge = ({ sentiment }: { sentiment: string }) => {
  const colors = {
    Bullish: "bg-green-100 text-green-800",
    Bearish: "bg-red-100 text-red-800",
    Neutral: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${
        colors[sentiment as keyof typeof colors] || "bg-gray-100 text-gray-800"
      }`}
    >
      {sentiment}
    </span>
  );
};

const PriceChange = ({ change }: { change: number }) => {
  const isPositive = change >= 0;
  return (
    <span
      className={`inline-flex items-center text-xs font-medium ${
        isPositive ? "text-green-500" : "text-red-500"
      }`}
    >
      {isPositive ? (
        <FiArrowUp className="mr-0.5" />
      ) : (
        <FiArrowDown className="mr-0.5" />
      )}
      {Math.abs(change)}%
    </span>
  );
};

const getCoinIcon = (coin: string) => {
  const baseClass = "w-5 h-5 text-orange-500";
  switch (coin.toUpperCase()) {
    case "BTC":
      return (
        <FaBitcoin
          className={baseClass.replace("text-orange-500", "text-orange-500")}
        />
      );
    case "ETH":
      return (
        <FaEthereum
          className={baseClass.replace("text-orange-500", "text-purple-500")}
        />
      );
    case "XRP":
      return (
        <SiRipple
          className={baseClass.replace("text-orange-500", "text-blue-500")}
        />
      );
    case "SOL":
      return (
        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs">
          SOL
        </div>
      );
    case "STOCK":
      return (
        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs">
          $
        </div>
      );
    default:
      return (
        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs">
          {coin}
        </div>
      );
  }
};

const getTimeAgo = (publishedAt: string | number) => {
  try {
    const now = new Date();
    const publishedDate = new Date(publishedAt);
    if (isNaN(publishedDate.getTime())) return "Unknown time";
    const diffMs = now.getTime() - publishedDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return `${Math.floor(diffMs / (1000 * 60))} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  } catch {
    return "Unknown time";
  }
};

export default function Dashboard() {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  type TabType = "crypto" | "us";
  const [activeTab, setActiveTab] = useState<TabType>("crypto");

  const [cryptoNews, setCryptoNews] = useState<NewsItem[]>([]);
  const [usNews, setUsNews] = useState<NewsItem[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  const [coinData, setCoinData] = useState<CoinItem[]>([]);
  const [isCoinsLoading, setIsCoinsLoading] = useState(false);
  const [coinsError, setCoinsError] = useState<string | null>(null);

  const [statsData, setStatsData] = useState<StatItem[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);


  // Fetch stats from CoinGecko API
  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    setStatsError(null);

    try {
      const response = await fetch("https://api.coingecko.com/api/v3/global", {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const globalData = data.data;

      const mappedStats: StatItem[] = [
        {
          id: 1,
          label: "Total Coins",
          value: globalData.active_cryptocurrencies?.toLocaleString() || "N/A",
          icon: "📊",
        },
        {
          id: 2,
          label: "Market Cap",
          value: globalData.total_market_cap?.usd
            ? `$${Math.round(globalData.total_market_cap.usd / 1e12)}T`
            : "N/A",
          change: globalData.market_cap_change_percentage_24h_usd || undefined,
          icon: "💎",
        },
        {
          id: 3,
          label: "24h Volume",
          value: globalData.total_volume?.usd
            ? `$${Math.round(globalData.total_volume.usd / 1e9)}B`
            : "N/A",
          icon: "📈",
        },
        {
          id: 4,
          label: "BTC Dominance",
          value: globalData.market_cap_percentage?.btc
            ? `${globalData.market_cap_percentage.btc.toFixed(1)}%`
            : "N/A",
          icon: "₿",
        },
        {
          id: 5,
          label: "Market Sentiment",
          value:
            globalData.market_cap_change_percentage_24h_usd > 0
              ? "Bullish"
              : globalData.market_cap_change_percentage_24h_usd < 0
              ? "Bearish"
              : "Neutral",
          icon: "🌡️",
        },
      ];

      setStatsData(mappedStats);
    } catch (err: any) {
      setStatsError(
        err.message || "Failed to fetch market stats. Using fallback data."
      );
      console.error("Stats fetch error:", err);
      setStatsData(fallbackStats);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Fetch crypto news from CryptoPanic API
  const mapRssToCard = useCallback((raw: any, isUS: boolean): NewsItem => {
    const sentiment =
      raw.sentiment === "positive"
        ? "Bullish"
        : raw.sentiment === "negative"
        ? "Bearish"
        : "Neutral";

    const coin = raw.coin || "";
    const icon = isUS ? getCoinIcon("STOCK") : coin ? getCoinIcon(coin) : null;

    return {
      id: raw.id,
      title: raw.title || "Untitled",
      summary: raw.excerpt || raw.title || "No excerpt available",
      time: getTimeAgo(raw.publishedAt),
      sentiment,
      icon,
      change: 0, // optional percent if you want to compute something
      tags: coin ? [coin, "Market"] : ["Market"],
      source: {
        name: raw.source?.name || raw.source?.domain || "Source",
        domain: raw.source?.domain || "",
        logo:
          raw.source?.logo ||
          (raw.source?.domain
            ? `https://www.google.com/s2/favicons?domain=${raw.source.domain}&sz=64`
            : "/favicon.ico"),
      },
      url: raw.url || (raw.source?.domain ? `https://${raw.source.domain}` : "#"),
      thumbnail: raw.thumbnail || null,
    };
  }, []);

  // Crypto news
  const fetchCryptoNews = useCallback(async () => {
    setIsNewsLoading(true);
    setNewsError(null);

    try {
      const params = new URLSearchParams({
        category: "crypto",
        page: "1",
        pageSize: "120",
      });

      const res = await fetch(`/api/rss-news?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const mapped = (data.results || []).map((it: any) =>
        mapRssToCard(it, false)
      );
      setCryptoNews(mapped);
    } catch (err: any) {
      setCryptoNews([]);
      setNewsError(err?.message || "Failed to fetch crypto news.");
    } finally {
      setIsNewsLoading(false);
    }
  }, [mapRssToCard]);

  // US market news
  const fetchUsNews = useCallback(async () => {
    setIsNewsLoading(true);
    setNewsError(null);

    try {
      const params = new URLSearchParams({
        category: "us",
        page: "1",
        pageSize: "120",
      });

      const res = await fetch(`/api/rss-news?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const mapped = (data.results || []).map((it: any) =>
        mapRssToCard(it, true)
      );
      setUsNews(mapped);
    } catch (err: any) {
      setUsNews([]);
      setNewsError(err?.message || "Failed to fetch US market news.");
    } finally {
      setIsNewsLoading(false);
    }
  }, [mapRssToCard]);

  // Fetch trending coins from Solana Tracker API via proxy
  const fetchCoins = useCallback(async () => {
    setIsCoinsLoading(true);
    setCoinsError(null);

    try {
      console.log("Attempting to fetch from /api/trending-coins");

      const response = await fetch("/api/trending-coins", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response body:", errorText);
        let userMessage = "Failed to fetch trending coins.";
        try {
          const errJson = JSON.parse(errorText);
          if (errJson.error && (errJson.error.includes("timed out") || errJson.error.includes("Failed to connect") || errJson.error.includes("Internal server error"))) {
            userMessage = "Solana Tracker is temporarily unavailable. Please try again later.";
          } else if (errJson.error) {
            userMessage = errJson.error;
          }
        } catch {}
        setCoinsError(userMessage);
        setCoinData([]);
        return;
      }

      const data = await response.json();
      console.log("API Response structure:", data);
      console.log("Data type:", typeof data);
      console.log("Is array:", Array.isArray(data));

      let coinsArray = [];

      if (Array.isArray(data)) {
        coinsArray = data;
      } else if (data && data.results && Array.isArray(data.results)) {
        coinsArray = data.results;
      } else if (data && data.data && Array.isArray(data.data)) {
        coinsArray = data.data;
      } else if (data && data.tokens && Array.isArray(data.tokens)) {
        coinsArray = data.tokens;
      } else {
        console.warn("Unexpected API response structure:", data);
        throw new Error("Invalid API response structure");
      }

      console.log("Coins array:", coinsArray);
      console.log("First coin example:", coinsArray[0]);

      const mappedCoins: CoinItem[] = coinsArray
        .slice(0, 10)
        .map((item: any, index: number) => {
          console.log(`Mapping coin ${index}:`, item);

          const name =
            item?.token?.name ||
            item?.token?.symbol ||
            item?.name ||
            item?.symbol ||
            `Token ${index + 1}`;

          const priceUsd =
            item?.pools?.[0]?.price?.usd ||
            item?.token?.price ||
            item?.price?.usd ||
            item?.price_usd ||
            item?.priceUsd ||
            0;

          const volumeUsd =
            item?.pools?.[0]?.txns?.volume24h ||
            item?.volume?.usd ||
            item?.volume_usd ||
            item?.volumeUsd24h ||
            item?.volume24h ||
            item?.token?.volume ||
            0;

          const change =
            item?.events?.["24h"]?.priceChangePercentage ||
            item?.price_change_24h ||
            item?.priceChange24h ||
            item?.change24h ||
            item?.token?.change ||
            0;

          const tokenAddress =
            item?.token?.mint ||
            item?.mint ||
            item?.tokenAddress ||
            item?.address ||
            null;

          const createdAt =
            item?.token?.creation?.created_time ||
            item?.createdAt ||
            item?.created_at ||
            item?.timestamp ||
            null;

          return {
            id: tokenAddress || `token_${index}`,
            name: name,
            price: priceUsd ? `$${Number(priceUsd).toFixed(6)}` : "$0.00",
            change: Number(change) || 0,
            address: tokenAddress || "Unknown",
            shortAddress: tokenAddress
              ? `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`
              : "Unknown",
            since: createdAt ? getTimeAgo(createdAt) : "Unknown",
            volume: volumeUsd
              ? `$${Math.round(Number(volumeUsd)).toLocaleString()}`
              : "$0",
            image: item?.token?.image || item?.logoURI || item?.logo || null,
          };
        })
        .filter(
          (coin: CoinItem) => coin.name && coin.name !== "Token undefined"
        );

      console.log("Final mapped coins:", mappedCoins);

      if (mappedCoins.length === 0) {
        throw new Error("No valid coin data could be mapped from API response");
      }

      setCoinData(mappedCoins);
    } catch (err: any) {
      console.error("Coins fetch error:", err);
      setCoinsError(
        err.message || "Failed to fetch trending coins. Using fallback data."
      );
    } finally {
      setIsCoinsLoading(false);
    }
  }, []);

  // Fetch data on component mount
  const hasFetchedNews = useRef(false);
  useEffect(() => {
    if (!hasFetchedNews.current) {
      fetchCryptoNews();
      hasFetchedNews.current = true;
    }
    fetchUsNews();
    fetchCoins();
    fetchStats();
  }, [fetchCryptoNews, fetchUsNews, fetchCoins, fetchStats]);

  const handleRefresh = () => {
    fetchCryptoNews();
    fetchUsNews();
    fetchCoins();
    fetchStats();
  };

  return (
    <div className="flex min-h-screen custom-gradient">
      <Sidebar selected="Dashboard" />
      <main className="flex-1 px-8 py-12 overflow-auto" style={{fontFamily:'Poppins,sans-serif'}}>
        {/* All dashboard content goes here */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h1 className="font-black text-5xl md:text-7xl tracking-wider text-white leading-tight drop-shadow-xl" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.15em'}}>
                MARKET <span className="text-[#3b0766]">DASHBOARD</span>
              </h1>
              <p className="text-lg text-white/70 mt-4 max-w-2xl font-medium" style={{fontFamily:'Poppins,sans-serif'}}>
                Real-time insights and analytics for informed trading decisions.<br/>
                Track market movements and discover opportunities.
              </p>
            </div>
            <div className="flex md:block justify-center">
              <button
                className="gradient-button text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all text-lg flex items-center gap-3"
                onClick={handleRefresh}
                style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.08em'}}
              >
                <FiRefreshCw className="w-5 h-5" />
                REFRESH DATA
              </button>
            </div>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mt-4 mb-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {isStatsLoading ? (
            <div className="text-center py-12 text-white/60 col-span-full" style={{fontFamily:'Poppins,sans-serif'}}>
              Loading market stats...
            </div>
          ) : statsError ? (
            <div className="text-center py-12 text-red-400 col-span-full" style={{fontFamily:'Poppins,sans-serif'}}>
              {statsError}
            </div>
          ) : statsData.length === 0 ? (
            <div className="text-center py-12 text-white/60 col-span-full" style={{fontFamily:'Poppins,sans-serif'}}>
              No market stats available.
            </div>
          ) : (
            statsData.map((stat) => (
              <div
                key={stat.id}
                className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl px-9 py-10 flex flex-col items-center justify-center hover:shadow-[0_0_50px_rgba(91,80,225,0.3)] hover:border-t-[#5B50E1]/50 transition-all duration-300"
              >
                <div className="text-5xl mb-4 drop-shadow-sm">
                  {typeof stat.icon === "string" ? (
                    stat.icon === "📊" ? <FaCoins className="w-8 h-8 text-[#5B50E1]" />
                    : stat.icon === "💎" ? <SiCoinmarketcap className="w-8 h-8 text-[#5B50E1]" />
                    : stat.icon === "📈" ? <Ri24HoursLine className="w-8 h-8 text-[#5B50E1]" />
                    : stat.icon === "₿" ? <RiBtcFill className="w-8 h-8 text-[#5B50E1]" />
                    : stat.icon === "🌡️" ? <MdOutlineSentimentVeryDissatisfied className="w-8 h-8 text-[#5B50E1]" />
                    : stat.icon
                  ) : stat.icon}
                </div>
                <div className="text-2xl font-black text-white mb-2 tracking-tight" style={{fontFamily:'Poppins,sans-serif'}}>
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-white/60 uppercase tracking-widest" style={{fontFamily:'Poppins,sans-serif'}}>
                  {stat.label}
                </div>
                {typeof stat.change === "number" && (
                  <span className={`mt-3 text-xs font-bold px-3 py-1 rounded-full ${stat.change > 0 ? "bg-green-100 text-green-700" : stat.change < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                    {stat.change > 0 ? "+" : ""}{stat.change?.toFixed(2)}%
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* News Section */}
        <div className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl p-10 mb-12">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black text-white tracking-wider flex items-center gap-3 mb-0" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.12em'}}>
              <span className="w-3 h-8 bg-[#3b0766] rounded-full inline-block"></span>
              MARKET NEWS
            </h2>
            <div className="ml-auto flex gap-2">
              <button
                className={`px-6 py-2 rounded-xl font-bold text-lg transition-all focus:outline-none ${
                  activeTab === "crypto"
                    ? "gradient-button text-white shadow-lg"
                    : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
                }`}
                onClick={() => setActiveTab("crypto")}
                style={{fontFamily:'Poppins,sans-serif'}}
              >
                Crypto News
              </button>
              <button
                className={`px-6 py-2 rounded-xl font-bold text-lg transition-all focus:outline-none ${
                  activeTab === "us"
                    ? "gradient-button text-white shadow-lg"
                    : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
                }`}
                onClick={() => setActiveTab("us")}
                style={{fontFamily:'Poppins,sans-serif'}}
              >
                US News
              </button>
            </div>
          </div>

          <div>
            {isNewsLoading ? (
              <div className="text-center py-12 text-lg text-white/60 font-bold" style={{fontFamily:'Poppins,sans-serif'}}>
                Loading news...
              </div>
            ) : newsError ? (
              <div className="text-center py-12 text-red-400 font-bold" style={{fontFamily:'Poppins,sans-serif'}}>
                {newsError}
              </div>
            ) : (activeTab === "crypto" ? cryptoNews : usNews).length === 0 ? (
              <div className="text-center py-12 text-white/60 font-semibold" style={{fontFamily:'Poppins,sans-serif'}}>
                No news found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === "crypto" ? cryptoNews : usNews)
                  .slice(0, 12)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="relative bg-white/10 backdrop-blur-md rounded-2xl shadow-md border border-white/20 p-6 flex flex-col gap-3 hover:shadow-xl hover:bg-white/15 transition-all cursor-pointer"
                      onClick={() => setSelectedNews(item)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={item.source.logo}
                          alt={item.source.name}
                          className="w-8 h-8 rounded-full border border-gray-200 object-cover bg-gray-50"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/default-news.png";
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                            {item.source.name}
                          </span>
                          <span className="text-xs text-white/60" style={{fontFamily:'Poppins,sans-serif'}}>
                            {item.time}
                          </span>
                        </div>
                        <span className="ml-auto">
                          <SentimentBadge sentiment={item.sentiment} />
                        </span>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white mb-1 line-clamp-2" style={{fontFamily:'Poppins,sans-serif'}}>
                          {item.title}
                        </h3>
                        <p className="text-sm text-white/70 line-clamp-3" style={{fontFamily:'Poppins,sans-serif'}}>
                          {item.summary}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-2 flex-wrap">
                        {item.tags &&
                          item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Trending Coins Section */}
        <div className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl p-10 mb-12">
          <h2 className="text-3xl font-black text-white mb-8 tracking-wider flex items-center gap-3" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.12em'}}>
            <span className="w-3 h-8 bg-[#3b0766] rounded-full inline-block"></span>
            TRENDING SOLANA TOKENS <span className="text-[#3b0766]">(24H)</span>
          </h2>
          <div className="divide-y border-gray-200/20">
            {isCoinsLoading ? (
              <div className="text-center py-8 text-lg text-white/60 font-bold" style={{fontFamily:'Poppins,sans-serif'}}>
                Loading trending coins...
              </div>
            ) : !coinData || coinData.length === 0 ? (
              <div className="text-center py-14 text-white/60 font-semibold" style={{fontFamily:'Poppins,sans-serif'}}>
                No trending coins found.
              </div>
            ) : (
              coinData
                .slice(0, 20)
                .map((coin, index) => (
                  <div
                    key={coin.id}
                    className="group p-4 -mx-4 hover:bg-white/20 rounded-xl transition-colors duration-200 border-2 border-gray-200/20 shadow-lg mb-4"
                  >
                    {/* Desktop view */}
                    <div className="hidden sm:flex items-center mb-2">
                      {/* Token info (image, name, since) */}
                      <div className="flex items-center gap-3">
                        {coin.image ? (
                          <img
                            src={coin.image}
                            alt={coin.name || 'Token'}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/default-token.png';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-pink-600 font-bold">
                            {coin.name ? coin.name.charAt(0).toUpperCase() : "?"}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-[#5B50E1] transition-colors" style={{fontFamily:'Poppins,sans-serif'}}>
                            {coin.name || "Unknown Token"}
                          </h3>
                          <p className="text-xs text-white/60" style={{fontFamily:'Poppins,sans-serif'}}>
                            {coin.since || "Unknown"}
                          </p>
                        </div>
                      </div>
                      {/* Centered PriceChange */}
                      <div className="flex-1 flex justify-center">
                        <PriceChange change={coin.change || 0} />
                      </div>
                      {/* Price */}
                      <div className="text-right">
                        <p className="font-medium text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                          {coin.price || "$0.00"}
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                      <div className="text-xs text-white/70" style={{fontFamily:'Poppins,sans-serif'}}>
                        <div className="text-white/50 text-xxs">
                          Volume (24h)
                        </div>
                        <div>{coin.volume || "$0"}</div>
                      </div>
                      <div className="text-xs text-white/70" style={{fontFamily:'Poppins,sans-serif'}}>
                        <div className="text-white/50 text-xxs">
                          Address
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span>{coin.shortAddress || "0x...unknown"}</span>
                          {coin.address && coin.address !== "Unknown" && (
                            <button
                              className="text-white/60 hover:text-[#5B50E1] focus:outline-none"
                              title="Copy address"
                              onClick={() => {
                                navigator.clipboard.writeText(coin.address);
                              }}
                            >
                              <FiCopy className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <a
                        href={coin.address && coin.address !== "Unknown" ? `https://pump.fun/coin/${coin.address}` : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#5B50E1] hover:text-white flex items-center gap-1 transition-colors"
                        style={{fontFamily:'Poppins,sans-serif'}}>
                        Trade
                      </a>
                    </div>
                    {/* Mobile view */}
                    <div className="flex flex-col sm:hidden gap-2">
                      <div className="flex items-center gap-3">
                        {coin.image ? (
                          <img
                            src={coin.image}
                            alt={coin.name || 'Token'}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/default-token.png';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-pink-600 font-bold">
                            {coin.name ? coin.name.charAt(0).toUpperCase() : "?"}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                            {coin.name || "Unknown Token"}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white/70" style={{fontFamily:'Poppins,sans-serif'}}>
                          <span className="text-white/50 text-xxs">Price</span>
                          <div>{coin.price || "$0.00"}</div>
                        </div>
                        <div className="text-xs text-white/70" style={{fontFamily:'Poppins,sans-serif'}}>
                          <span className="text-white/50 text-xxs">Volume (24h)</span>
                          <div>{coin.volume || "$0"}</div>
                        </div>
                        <a
                          href={coin.address && coin.address !== "Unknown" ? `https://pump.fun/coin/${coin.address}` : undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#5B50E1] hover:text-white flex items-center gap-1 transition-colors"
                          style={{fontFamily:'Poppins,sans-serif'}}>
                          Trade
                        </a>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* News Modal Popup */}
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeIn">
              <button
                className="absolute top-4 right-4 text-white/60 hover:text-[#5B50E1] text-2xl font-bold focus:outline-none"
                onClick={() => setSelectedNews(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={selectedNews.source.logo}
                  alt={selectedNews.source.name}
                  className="w-10 h-10 rounded-full border border-gray-200 object-cover bg-gray-50"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/default-news.png";
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                    {selectedNews.source.name}
                  </span>
                  <span className="text-xs text-white/60" style={{fontFamily:'Poppins,sans-serif'}}>{selectedNews.time}</span>
                </div>
                <span className="ml-auto">
                  <SentimentBadge sentiment={selectedNews.sentiment} />
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mb-3" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.08em'}}>
                {selectedNews.title}
              </h2>
              <p className="text-white/80 text-base mb-4 whitespace-pre-line" style={{fontFamily:'Poppins,sans-serif'}}>
                {selectedNews.summary}
              </p>
              <div className="flex gap-2 mb-4 flex-wrap">
                {selectedNews.tags &&
                  selectedNews.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
              <a
                href={selectedNews.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl gradient-button text-white font-bold shadow transition-all"
                style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.08em'}}
              >
                READ FULL ARTICLE
              </a>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="max-w-xl">
              <h3 className="text-xl font-bold mb-2" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.08em'}}>
                GET STARTED WITH ADVANCED FEATURES
              </h3>
              <p className="text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
                Unlock premium tools, real-time alerts, and advanced analytics
                to take your trading to the next level.
              </p>
            </div>
            <button className="mt-4 md:mt-0 gradient-button text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300" style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.08em'}}>
              UPGRADE TO PRO
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}