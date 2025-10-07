"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "../Sidebar";
import {
  FiSearch,
  FiArrowUp,
  FiArrowDown,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiClock,
} from "react-icons/fi";
import { RiSearchEyeLine } from "react-icons/ri";
import { FcPositiveDynamic, FcNegativeDynamic } from "react-icons/fc";
import { GiNewspaper } from "react-icons/gi";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiSolana } from "react-icons/si";
import {
  Card, CardContent, CardHeader, CardTitle, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Sentiment = "all" | "positive" | "negative" | "neutral";
type Category = "crypto" | "us";

interface NewsItem {
  id: string;
  title: string;
  source: { name: string; logo: string; domain: string };
  publishedAt: string;
  time: string;
  sentiment: "positive" | "negative" | "neutral";
  sentimentScore: number;
  coin: string;
  excerpt: string;
  engagement: number;
  fullContent: string;
  url: string;
  votes?: any;
  thumbnail?: string | null;
}

export default function NewsSentiment() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState<Sentiment>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("crypto"); // Tabs: "crypto" | "us"
  const [quickFilter, setQuickFilter] = useState<string>("");   // BTC/ETH/SOL chips

  const itemsPerPage = 20;

  const getTimeAgo = (publishedAt: string) => {
    try {
      const now = new Date();
      const publishedDate = new Date(publishedAt);
      if (isNaN(publishedDate.getTime())) return "Unknown time";
      const diffMs = now.getTime() - publishedDate.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "Unknown time";
    }
  };

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        category,
        page: "1",
        pageSize: "200", // grab a generous set; we paginate client-side
      });

      // combine searchQuery with quickFilter chips
      const combinedQ = [searchQuery, quickFilter].filter(Boolean).join(",");

      if (combinedQ) params.set("q", combinedQ);

      const res = await fetch(`/api/rss-news?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store", // always fresh on refresh
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }

      const data = await res.json();

      const mapped: NewsItem[] = (data.results || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        source: item.source,
        publishedAt: item.publishedAt,
        time: getTimeAgo(item.publishedAt),
        sentiment: item.sentiment,
        sentimentScore: item.sentimentScore || 0,
        coin: item.coin || "",
        excerpt: item.excerpt || "",
        engagement: item.engagement || 0,
        fullContent: item.fullContent || "",
        url: item.url,
        votes: item.votes,
        thumbnail: item.thumbnail || null,
      }));

      setNewsData(mapped);
      setCurrentPage(1);
      setTotalPages(Math.max(1, Math.ceil(mapped.length / itemsPerPage)));
    } catch (e: any) {
      setError(e?.message || "Failed to fetch news");
      setNewsData([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [category, searchQuery, quickFilter]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filteredNews = useMemo(() => {
    return newsData.filter((item) => {
      const text = `${item.title} ${item.excerpt}`.toLowerCase();
      const q = searchQuery.toLowerCase();
      const byQuery = !q || text.includes(q);
      const bySentiment = selectedSentiment === "all" || item.sentiment === selectedSentiment;
      return byQuery && bySentiment;
    });
  }, [newsData, searchQuery, selectedSentiment]);

  const paginatedNews = useMemo(() => {
    return filteredNews.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredNews, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getCoinIcon = (coin: string) => {
    const baseClass = "w-5 h-5 rounded-full p-0.5";
    switch ((coin || "").toUpperCase()) {
      case "BTC":
        return <FaBitcoin className={`${baseClass} bg-amber-500/20 text-amber-500`} />;
      case "ETH":
        return <FaEthereum className={`${baseClass} bg-blue-500/20 text-blue-500`} />;
      case "SOL":
        return <SiSolana className={`${baseClass} bg-green-500/20 text-green-500`} />;
      default:
        return null;
    }
  };

  const QUICK_CHIPS: Record<Category, string[]> = {
    crypto: ["BTC", "ETH", "SOL"],
    us: ["FED", "TESLA", "NVIDIA"],
  };

  return (
    <div className="flex min-h-screen custom-gradient">
      <Sidebar selected="News Sentiment" />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 overflow-auto" style={{fontFamily:'Poppins,sans-serif'}}>
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
            <div>
              <h1 className="font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-wider text-white leading-tight drop-shadow-xl" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.15em'}}>
                NEWS <span className="text-[#3b0766]">SENTIMENT</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-white/70 mt-3 lg:mt-4 max-w-2xl font-medium" style={{fontFamily:'Poppins,sans-serif'}}>
                Track market sentiment across crypto & US market news sources.<br className="hidden sm:block"/>
                <span className="sm:hidden"> </span>Real-time analysis for informed trading decisions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
              <div className="relative flex-1 sm:max-w-md lg:max-w-lg">
                <div className="relative">
                  <RiSearchEyeLine className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5 sm:h-6 sm:w-6" />
                  <input
                    type="text"
                    placeholder={
                      category === "crypto"
                        ? "Search crypto news or keywords (e.g., BTC,ETH,SOL)"
                        : "Search US market news or keywords (e.g., Fed,TESLA,NVIDIA)"
                    }
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-white/20 rounded-2xl bg-white/10 backdrop-blur-xl focus:ring-2 focus:ring-[#A259FF]/50 focus:border-[#A259FF]/50 focus:bg-white/15 outline-none text-white placeholder-white/50 shadow-xl transition-all duration-300 hover:border-white/30 hover:bg-white/12 text-sm sm:text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{fontFamily:'Poppins,sans-serif'}}
                  />
                </div>
              </div>

              <div className="w-full sm:w-[180px] lg:w-[200px]">
                <select
                  value={selectedSentiment}
                  onChange={(e) => setSelectedSentiment(e.target.value as Sentiment)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-white/20 rounded-2xl bg-white/10 backdrop-blur-xl focus:ring-2 focus:ring-[#A259FF]/50 focus:border-[#A259FF]/50 focus:bg-white/15 outline-none text-white shadow-xl transition-all duration-300 hover:border-white/30 hover:bg-white/12 text-sm sm:text-base"
                  style={{fontFamily:'Poppins,sans-serif', backgroundColor: 'rgba(255,255,255,0.1)'}}
                >
                  <option value="all" style={{backgroundColor: 'rgba(20,20,30,0.95)', color: 'white'}}>All Sentiments</option>
                  <option value="positive" style={{backgroundColor: 'rgba(20,20,30,0.95)', color: 'white'}}>Positive</option>
                  <option value="negative" style={{backgroundColor: 'rgba(20,20,30,0.95)', color: 'white'}}>Negative</option>
                  <option value="neutral" style={{backgroundColor: 'rgba(20,20,30,0.95)', color: 'white'}}>Neutral</option>
                </select>
              </div>
            </div>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mt-4 mb-6" />
        </div>

        {/* Tabs */}
        <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex flex-wrap gap-2 sm:gap-4">
          <button
            onClick={() => { setCategory("crypto"); setQuickFilter(""); }}
            className={`group relative px-4 sm:px-6 py-2 rounded-xl overflow-hidden font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 focus:outline-none ${
              category === "crypto"
                ? "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/15 hover:border-white/30 hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:scale-[1.02] shadow-lg"
                : "bg-white/5 backdrop-blur-xl text-white/70 hover:bg-white/10 border border-white/10 hover:border-white/20"
            }`}
            style={{fontFamily:'Poppins,sans-serif'}}
          >
            {category === "crypto" && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/20 via-[#6C38CC]/20 to-[#FF1C8B]/20 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              </>
            )}
            <span className="relative z-10">Crypto News</span>
          </button>
          <button
            onClick={() => { setCategory("us"); setQuickFilter(""); }}
            className={`group relative px-4 sm:px-6 py-2 rounded-xl overflow-hidden font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 focus:outline-none ${
              category === "us"
                ? "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/15 hover:border-white/30 hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:scale-[1.02] shadow-lg"
                : "bg-white/5 backdrop-blur-xl text-white/70 hover:bg-white/10 border border-white/10 hover:border-white/20"
            }`}
            style={{fontFamily:'Poppins,sans-serif'}}
          >
            {category === "us" && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/20 via-[#6C38CC]/20 to-[#FF1C8B]/20 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              </>
            )}
            <span className="relative z-10">US Markets</span>
          </button>
          </div>

          {/* Quick chips for the active tab */}
          <div className="flex flex-wrap gap-2 sm:gap-3 sm:ml-4">
            {QUICK_CHIPS[category].map((c) => (
              <button
                key={c}
                onClick={() => setQuickFilter((prev) => (prev === c ? "" : c))}
                className={`cursor-pointer rounded-full px-4 py-2 font-semibold text-sm transition-all ${
                  quickFilter === c ? "bg-[#5B50E1] text-white shadow-lg" : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
                }`}
                style={{fontFamily:'Poppins,sans-serif'}}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 lg:mb-12">
          <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-3xl shadow-2xl px-9 py-10 flex flex-col items-center justify-center hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:scale-[1.02] transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/10 via-transparent to-[#6C38CC]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            <div className="relative z-10 text-5xl mb-4 drop-shadow-sm">
              <FcPositiveDynamic className="w-12 h-12" />
            </div>
            <div className="relative z-10 text-3xl font-black text-white mb-2 tracking-tight" style={{fontFamily:'Poppins,sans-serif'}}>
              {filteredNews.filter((n) => n.sentiment === "positive").length}
            </div>
            <div className="relative z-10 text-xs font-bold text-white/60 uppercase tracking-widest text-center" style={{fontFamily:'Poppins,sans-serif'}}>
              Positive Sentiment
            </div>
          </div>

          <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-3xl shadow-2xl px-9 py-10 flex flex-col items-center justify-center hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:scale-[1.02] transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF1C8B]/10 via-transparent to-[#A259FF]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            <div className="relative z-10 text-5xl mb-4 drop-shadow-sm">
              <FcNegativeDynamic className="w-12 h-12" />
            </div>
            <div className="relative z-10 text-3xl font-black text-white mb-2 tracking-tight" style={{fontFamily:'Poppins,sans-serif'}}>
              {filteredNews.filter((n) => n.sentiment === "negative").length}
            </div>
            <div className="relative z-10 text-xs font-bold text-white/60 uppercase tracking-widest text-center" style={{fontFamily:'Poppins,sans-serif'}}>
              Negative Sentiment
            </div>
          </div>

          <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-3xl shadow-2xl px-9 py-10 flex flex-col items-center justify-center hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:scale-[1.02] transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#6C38CC]/10 via-transparent to-[#FF1C8B]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            <div className="relative z-10 text-5xl mb-4 drop-shadow-sm">
              <GiNewspaper className="w-12 h-12 text-blue-400" />
            </div>
            <div className="relative z-10 text-3xl font-black text-white mb-2 tracking-tight" style={{fontFamily:'Poppins,sans-serif'}}>
              {filteredNews.length}
            </div>
            <div className="relative z-10 text-xs font-bold text-white/60 uppercase tracking-widest text-center" style={{fontFamily:'Poppins,sans-serif'}}>
              Total Articles
            </div>
          </div>
        </div>

        {/* News Feed */}
        <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-2xl lg:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-10 mb-8 lg:mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/5 via-transparent to-[#6C38CC]/5 opacity-60"></div>
          <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black text-white tracking-wider flex items-center gap-3 mb-0" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.12em'}}>
              <span className="w-3 h-8 bg-[#3b0766] rounded-full inline-block"></span>
              LATEST {category === "crypto" ? "CRYPTO" : "US MARKET"} NEWS
            </h2>
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isLoading}
                className="p-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-white/60 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || isLoading}
                className="p-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div>
            {isLoading ? (
              <div className="text-center py-12 text-lg text-white/60 font-bold" style={{fontFamily:'Poppins,sans-serif'}}>Loading news articles...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-400 font-bold" style={{fontFamily:'Poppins,sans-serif'}}>{error}</div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {paginatedNews.map((item) => (
                  <div
                    key={item.id}
                    className="group p-4 sm:p-6 hover:bg-white/10 rounded-xl sm:rounded-2xl transition-all border border-white/10 hover:border-white/20 shadow-xl backdrop-blur-sm cursor-pointer"
                    onClick={() => setSelectedNews(item)}
                  >
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3">
                          {/* Source Avatar */}
                          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/20 shadow-xl">
                            <img
                              src={item.source?.logo}
                              alt={item.source?.name ? `${item.source.name} logo` : "Source logo"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `data:image/svg+xml,${encodeURIComponent(
                                  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5B50E1"><circle cx="12" cy="12" r="10"/></svg>'
                                )}`;
                                target.onerror = null;
                              }}
                            />
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 min-w-0" style={{fontFamily:'Poppins,sans-serif'}}>
                            <span className="font-semibold text-white truncate max-w-[100px] sm:max-w-[140px]" title={item.source?.name || ""}>
                              {item.source?.name || "Source"}
                            </span>
                            <span className="text-white/40 hidden sm:inline">•</span>
                            <span className="text-white/60 truncate">{item.time}</span>
                          </div>

                          <div className="ml-1 sm:ml-2 flex items-center gap-2">
                            {getCoinIcon(item.coin)}
                            <span
                              className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium ${
                                item.sentiment === "positive"
                                  ? "bg-green-100 text-green-800"
                                  : item.sentiment === "negative"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                            </span>
                          </div>
                        </div>

                        <h3 className="font-bold text-base sm:text-lg text-white mb-2 group-hover:text-[#5B50E1] transition-colors line-clamp-2 cursor-pointer" style={{fontFamily:'Poppins,sans-serif'}}>
                          {item.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-white/70 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3" style={{fontFamily:'Poppins,sans-serif'}}>
                          {item.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-white/50"></div>
                          <div className="text-xs sm:text-sm text-white/60 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>
                            <span className="hidden sm:inline">Click to read more</span>
                            <span className="sm:hidden">Read more</span>
                          </div>
                        </div>
                      </div>                      {/* Thumbnail or sentiment emoji */}
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt="thumbnail"
                          className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 border border-white/20 shadow-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex-shrink-0 flex items-center justify-center border border-white/20 shadow-lg">
                          <div className="text-3xl">
                            {item.sentiment === "positive" ? "📈" : item.sentiment === "negative" ? "📉" : "📊"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {filteredNews.length === 0 && !isLoading && (
                  <div className="text-center py-12 text-white/60 font-semibold" style={{fontFamily:'Poppins,sans-serif'}}>No news articles found.</div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-white/20">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1 || isLoading}
              className="group relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white/70 hover:bg-white/15 hover:text-white hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold overflow-hidden w-full sm:w-auto justify-center sm:justify-start"
              style={{fontFamily:'Poppins,sans-serif'}}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/10 to-[#6C38CC]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-2 text-sm">
                <FiChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Previous</span><span className="sm:hidden">Prev</span>
              </span>
            </button>
            <span className="text-xs sm:text-sm text-white/60 font-medium text-center px-2" style={{fontFamily:'Poppins,sans-serif'}}>
              <span className="hidden sm:inline">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredNews.length)} of {filteredNews.length} results</span>
              <span className="sm:hidden">Page {currentPage} of {totalPages}</span>
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isLoading}
              className="group relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white/70 hover:bg-white/15 hover:text-white hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold overflow-hidden w-full sm:w-auto justify-center sm:justify-start"
              style={{fontFamily:'Poppins,sans-serif'}}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#6C38CC]/10 to-[#A259FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-2 text-sm">
                <span className="hidden sm:inline">Next</span><span className="sm:hidden">Next</span> <FiChevronRight className="h-4 w-4" />
              </span>
            </button>
          </div>
          </div>
        </div>

        {/* News Detail Modal */}
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="group relative bg-white/15 backdrop-blur-xl border border-white/30 rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto mx-2 sm:mx-4 animate-fadeIn overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/10 via-transparent to-[#6C38CC]/10 opacity-60"></div>
              <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                {/* Close button */}
                <button
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all z-20"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {/* Header with source info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 border-b border-white/20">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/20 shadow-xl">
                    <img
                      src={selectedNews.source?.logo}
                      alt={selectedNews.source?.name || "Source logo"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `data:image/svg+xml,${encodeURIComponent(
                          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5B50E1"><circle cx="12" cy="12" r="10"/></svg>'
                        )}`;
                        target.onerror = null;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                      {selectedNews.source?.name || "Unknown Source"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70 flex-wrap" style={{fontFamily:'Poppins,sans-serif'}}>
                      <span>{selectedNews.time}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{new Date(selectedNews.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {getCoinIcon(selectedNews.coin)}
                    <span
                      className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full font-medium ${
                        selectedNews.sentiment === "positive"
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : selectedNews.sentiment === "negative"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                      style={{fontFamily:'Poppins,sans-serif'}}
                    >
                      {selectedNews.sentiment.charAt(0).toUpperCase() + selectedNews.sentiment.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight" style={{fontFamily:'Poppins,sans-serif'}}>
                  {selectedNews.title}
                </h1>

                {/* Image */}
                {selectedNews.thumbnail && (
                  <div className="mb-4 sm:mb-6">
                    <img
                      src={selectedNews.thumbnail}
                      alt="Article image"
                      className="w-full max-h-[250px] sm:max-h-[400px] object-cover rounded-xl sm:rounded-2xl border border-white/20 shadow-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="mb-6 sm:mb-8">
                  <p className="text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed" style={{fontFamily:'Poppins,sans-serif'}}>
                    {selectedNews.fullContent || selectedNews.excerpt}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-white/20">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60" style={{fontFamily:'Poppins,sans-serif'}}>
                    <span>Published: {new Date(selectedNews.publishedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <button
                    onClick={() => window.open(selectedNews.url, "_blank")}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-[#5B50E1] hover:bg-[#5B50E1]/80 text-white font-semibold transition-all shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
                    style={{fontFamily:'Poppins,sans-serif'}}
                  >
                    <span className="hidden sm:inline">Read Full Article</span>
                    <span className="sm:hidden">Read Full</span>
                    <FiExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}