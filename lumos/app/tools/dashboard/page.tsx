"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "../Sidebar";
import {
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiExternalLink,
} from "react-icons/fi";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiRipple } from "react-icons/si";

// Fallback stats data
const fallbackStats = [
  { id: 1, label: "Total Coins", value: "12,345", icon: "📊" },
  { id: 2, label: "Market Cap", value: "$2.1T", change: 1.8, icon: "💎" },
  { id: 3, label: "24h Volume", value: "$65B", icon: "📈" },
  { id: 4, label: "BTC Dominance", value: "48.2%", icon: "₿" },
  { id: 5, label: "Market Sentiment", value: "Neutral", icon: "🌡️" },
];

interface StatItem {
  id: number;
  label: string;
  value: string;
  change?: number; // Optional, only for metrics with change data
  icon: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  time: string;
  sentiment: string;
  icon: React.ReactNode;
  change: number;
  tags: string[];
}

interface CoinItem {
  id: string;
  name: string;
  price: string;
  change: number;
  address: string;
  since: string;
  volume: string;
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
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [coinData, setCoinData] = useState<CoinItem[]>();
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
        headers: {
          Accept: "application/json",
        },
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

  // Fetch news from CryptoPanic API
  const fetchNews = useCallback(async () => {
    setIsNewsLoading(true);
    setNewsError(null);

    try {
      const params = new URLSearchParams({
        auth_token: "4a4d75b8438580a64d96c8bdf5b6d4448027f351",
        public: "true",
      });

      const response = await fetch(
        `https://cryptopanic.com/api/developer/v2/posts/?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Map API response to NewsItem interface
      const mappedNews: NewsItem[] = data.results.map((item: any) => {
        const coin =
          item.instruments?.length > 0 ? item.instruments[0].code : "UNKNOWN";
        const sentiment =
          item.votes?.positive > item.votes?.negative
            ? "Bullish"
            : item.votes?.negative > item.votes?.positive
            ? "Bearish"
            : "Neutral";

        return {
          id: item.id.toString(),
          title: item.title || "Untitled",
          summary: item.description || item.title || "No excerpt available",
          time: getTimeAgo(item.published_at),
          sentiment,
          icon: getCoinIcon(coin),
          change: item.panic_score
            ? (item.panic_score / 100) * (sentiment === "Bearish" ? -1 : 1)
            : ((item.votes?.positive - item.votes?.negative) /
                (item.votes?.positive + item.votes?.negative + 1)) *
                (sentiment === "Bearish" ? -1 : 1) || 0,
          tags: item.instruments?.length > 0 ? [coin, "Market"] : ["Market"],
        };
      });

      setNewsData(mappedNews);
    } catch (err: any) {
      setNewsError(
        err.message || "Failed to fetch news. Please try again later."
      );
      console.error("News fetch error:", err);
      setNewsData([]);
    } finally {
      setIsNewsLoading(false);
    }
  }, []);

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
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response structure:", data);
      console.log("Data type:", typeof data);
      console.log("Is array:", Array.isArray(data));

      // Handle different possible response structures
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

      // Safely map the coins with proper validation
      const mappedCoins: CoinItem[] = coinsArray
        .slice(0, 10)
        .map((item: any, index: number) => {
          // Log each item to debug
          console.log(`Mapping coin ${index}:`, item);

          // Safely extract properties with fallbacks
          const name =
            item?.name ||
            item?.symbol ||
            item?.token?.name ||
            item?.token?.symbol ||
            `Token ${index + 1}`;

          const priceUsd =
            item?.price?.usd ||
            item?.price_usd ||
            item?.priceUsd ||
            item?.token?.price ||
            0;

          const volumeUsd =
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
            item?.mint ||
            item?.tokenAddress ||
            item?.address ||
            item?.token?.address ||
            `address_${index}`;

          const createdAt =
            item?.createdAt ||
            item?.created_at ||
            item?.timestamp ||
            Date.now();

          return {
            id: tokenAddress || index.toString(),
            name: name,
            price: priceUsd ? `$${Number(priceUsd).toFixed(6)}` : "$0.00",
            change: Number(change) || 0,
            address: tokenAddress
              ? `${tokenAddress.slice(0, 8)}...`
              : "0x...unknown",
            since: getTimeAgo(createdAt),
            volume: volumeUsd
              ? `$${Math.round(Number(volumeUsd)).toLocaleString()}`
              : "$0",
          };
        })
        .filter(
          (coin: CoinItem) => coin.name && coin.name !== "Token undefined"
        ); // Filter out invalid coins

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
  useEffect(() => {
    fetchNews();
    fetchCoins();
    fetchStats();
  }, [fetchNews, fetchCoins, fetchStats]);

  // Refresh all data
  const handleRefresh = () => {
    fetchNews();
    fetchCoins();
    fetchStats();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar selected="Dashboard" />
      <main className="flex-1 p-6 overflow-auto">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-druk text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
                Market Dashboard
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Real-time insights and analytics for informed trading decisions.
                Track market movements and discover opportunities.
              </p>
            </div>
            <div className="hidden md:block">
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                onClick={handleRefresh}
              >
                <FiRefreshCw className="w-4 h-4" />
                Refresh Data
              </button>
            </div>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mt-4 mb-6" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {isStatsLoading ? (
            <div className="text-center py-12 text-gray-600 col-span-full">
              Loading market stats...
            </div>
          ) : statsError ? (
            <div className="text-center py-12 text-red-500 col-span-full">
              {statsError}
            </div>
          ) : statsData.length === 0 ? (
            <div className="text-center py-12 text-gray-600 col-span-full">
              No market stats available.
            </div>
          ) : (
            statsData.map((stat) => (
              <div
                key={stat.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-sm hover:shadow-md transition-all duration-300 hover:border-pink-100"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className="text-2xl">{stat.icon}</div>
                </div>
                {stat.change !== undefined && (
                  <div className="mt-3">
                    <PriceChange change={stat.change} />
                    <span className="text-xs text-gray-500 ml-2">
                      vs yesterday
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Market News */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Market News & Updates
                </h2>
                <button
                  className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1"
                  onClick={fetchNews}
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              <div className="space-y-6">
                {isNewsLoading ? (
                  <div className="text-center py-12 text-gray-600">
                    Loading news articles...
                  </div>
                ) : newsError ? (
                  <div className="text-center py-12 text-red-500">
                    {newsError}
                  </div>
                ) : newsData.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    No news articles found.
                  </div>
                ) : (
                  newsData.map((news) => (
                    <div
                      key={news.id}
                      className="group p-4 -mx-4 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {news.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                              {news.title}
                            </h3>
                            <SentimentBadge sentiment={news.sentiment} />
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {news.summary}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {news.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">
                              {news.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Trending Coins */}
          <div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Trending Coins
                </h2>
                <button className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1">
                  View All
                  <FiExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-4">
                {isCoinsLoading ? (
                  <div className="text-center py-12 text-gray-600">
                    Loading trending coins...
                  </div>
                ) : coinsError ? (
                  <div className="text-center py-12 text-red-500">
                    {coinsError}
                  </div>
                ) : !coinData || coinData.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    No trending coins found.
                  </div>
                ) : (
                  coinData
                    .map((coin) => {
                      // Safety check for each coin
                      if (!coin || !coin.id || !coin.name) {
                        console.warn("Invalid coin data:", coin);
                        return null;
                      }

                      return (
                        <div
                          key={coin.id}
                          className="group p-4 -mx-4 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-pink-600 font-bold">
                                {coin.name
                                  ? coin.name.charAt(0).toUpperCase()
                                  : "?"}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                                  {coin.name || "Unknown Token"}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {coin.since || "Unknown"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {coin.price || "$0.00"}
                              </p>
                              <PriceChange change={coin.change || 0} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                              <div className="text-gray-400 text-xxs">
                                Volume (24h)
                              </div>
                              <div>{coin.volume || "$0"}</div>
                            </div>
                            <div className="text-xs">
                              <div className="text-gray-400 text-xxs">
                                Address
                              </div>
                              <div className="font-mono">
                                {coin.address || "0x...unknown"}
                              </div>
                            </div>
                            <button className="text-xs text-pink-600 hover:text-pink-700 flex items-center gap-1">
                              Trade
                            </button>
                          </div>
                        </div>
                      );
                    })
                    .filter(Boolean) // Remove any null entries
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="max-w-xl">
              <h3 className="text-xl font-bold mb-2">
                Get Started with Advanced Features
              </h3>
              <p className="text-pink-100 text-sm">
                Unlock premium tools, real-time alerts, and advanced analytics
                to take your trading to the next level.
              </p>
            </div>
            <button className="mt-4 md:mt-0 bg-white text-pink-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
