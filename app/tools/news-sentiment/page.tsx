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
    <div className="flex min-h-screen bg-gradient-to-br from-white via-[#FFEBF5] to-[#F3EFFF] font-[Montserrat,sans-serif] text-[#232323]">
      <Sidebar selected="News Sentiment" />

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1
              className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent uppercase drop-shadow-lg mb-2"
              style={{ letterSpacing: "0.04em" }}
            >
              News Sentiment Analysis
            </h1>
            <p className="text-base text-[#A259FF] font-medium">
              Track market sentiment across crypto & US market news sources
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder={
                    category === "crypto"
                      ? "Search crypto news or keywords (e.g., BTC,ETH,SOL)"
                      : "Search US market news or keywords (e.g., Fed,TESLA,NVIDIA)"
                  }
                  className="pl-9 bg-background/80 border-border/50 focus-visible:ring-primary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="w-[180px]">
              <Select
                value={selectedSentiment}
                onValueChange={(value) => setSelectedSentiment(value as Sentiment)}
              >
                <SelectTrigger className="bg-background/80 border-border/50">
                  <SelectValue placeholder="Filter by sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive" className="text-green-600">Positive</SelectItem>
                  <SelectItem value="negative" className="text-red-600">Negative</SelectItem>
                  <SelectItem value="neutral"  className="text-amber-600">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant={category === "crypto" ? "default" : "outline"}
            onClick={() => { setCategory("crypto"); setQuickFilter(""); }}
            className={cn("rounded-full px-4")}
          >
            Crypto
          </Button>
          <Button
            variant={category === "us" ? "default" : "outline"}
            onClick={() => { setCategory("us"); setQuickFilter(""); }}
            className={cn("rounded-full px-4")}
          >
            US Markets
          </Button>

          {/* Quick chips for the active tab */}
          <div className="ml-4 flex gap-2">
            {QUICK_CHIPS[category].map((c) => (
              <Badge
                key={c}
                onClick={() => setQuickFilter((prev) => (prev === c ? "" : c))}
                className={cn(
                  "cursor-pointer rounded-full px-3 py-1",
                  quickFilter === c ? "bg-[#A259FF] text-white" : "bg-[#F1E3F6] text-[#6C38CC]"
                )}
              >
                {c}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-[#F3EFFF]/80 to-[#FFEBF5]/90 border-2 border-[#F1E3F6] shadow-lg rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-[#FF1C8B]">Positive Sentiment</CardTitle>
              <div className="h-5 w-5 text-green-500">
                <FiArrowUp className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">
                {filteredNews.filter((n) => n.sentiment === "positive").length}
              </div>
              <p className="text-xs text-[#A259FF] font-medium">Updated on refresh</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#F3EFFF]/80 to-[#FFEBF5]/90 border-2 border-[#F1E3F6] shadow-lg rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-[#FF1C8B]">Negative Sentiment</CardTitle>
              <div className="h-5 w-5 text-red-500">
                <FiArrowDown className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">
                {filteredNews.filter((n) => n.sentiment === "negative").length}
              </div>
              <p className="text-xs text-[#A259FF] font-medium">Updated on refresh</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#F3EFFF]/80 to-[#FFEBF5]/90 border-2 border-[#F1E3F6] shadow-lg rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-[#FF1C8B]">Total Articles</CardTitle>
              <FiClock className="h-5 w-5 text-[#A259FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{filteredNews.length}</div>
              <p className="text-xs text-[#A259FF] font-medium">Fetched this load</p>
            </CardContent>
          </Card>
        </div>

        {/* News Feed */}
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Latest {category === "crypto" ? "Crypto" : "US Market"} News</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1 || isLoading} className="h-8 w-8 p-0">
                <FiChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage >= totalPages || isLoading} className="h-8 w-8 p-0">
                <FiChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading news articles...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : (
              <div className="space-y-4">
                {paginatedNews.map((item) => (
                  <div
                    key={item.id}
                    className="group p-4 hover:bg-accent/50 rounded-lg transition-colors border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {/* Source Avatar */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#FFEBF5] to-[#F3EFFF] flex items-center justify-center overflow-hidden border border-[#F1E3F6] shadow-sm">
                            <img
                              src={item.source?.logo}
                              alt={item.source?.name ? `${item.source.name} logo` : "Source logo"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `data:image/svg+xml,${encodeURIComponent(
                                  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#A259FF"><circle cx="12" cy="12" r="10"/></svg>'
                                )}`;
                                target.onerror = null;
                              }}
                            />
                          </div>

                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-medium text-foreground truncate max-w-[140px]" title={item.source?.name || ""}>
                              {item.source?.name || "Source"}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{item.time}</span>
                          </div>

                          <div className="ml-1">{getCoinIcon(item.coin)}</div>

                          <div className="ml-auto">
                            <Badge
                              className={cn(
                                "text-xs font-bold px-3 py-1 rounded-full shadow-sm tracking-wide",
                                item.sentiment === "positive"
                                  ? "bg-gradient-to-r from-green-200 to-green-400 text-green-800 border border-green-300"
                                  : item.sentiment === "negative"
                                  ? "bg-gradient-to-r from-red-200 to-red-400 text-red-800 border border-red-300"
                                  : "bg-gradient-to-r from-yellow-100 to-yellow-300 text-yellow-800 border border-yellow-300"
                              )}
                            >
                              {item.sentiment === "positive" ? "😊 " : item.sentiment === "negative" ? "😟 " : "😐 "}
                              {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block"
                        >
                          <h3 className="font-medium text-foreground mb-1.5 group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                        </a>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                          {item.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-muted-foreground"></div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8 gap-1"
                            onClick={() => window.open(item.url, "_blank")}
                          >
                            Read more <FiExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Thumbnail or sentiment emoji */}
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt="thumbnail"
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-[#F1E3F6]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted/50 flex-shrink-0 flex items-center justify-center">
                          <div className="text-2xl">
                            {item.sentiment === "positive" ? "📈" : item.sentiment === "negative" ? "📉" : "📊"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {filteredNews.length === 0 && !isLoading && (
                  <div className="text-center py-12 text-muted-foreground">No news articles found.</div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-4 border-t border-border/50">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1 || isLoading} className="gap-1">
              <FiChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredNews.length)} of {filteredNews.length} results
            </span>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage >= totalPages || isLoading} className="gap-1">
              Next <FiChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Optional: keep your Dialog if you want a modal view */}
        <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-[#FFEBF5]/80 to-[#F3EFFF]/90 border-2 border-[#F1E3F6] rounded-3xl shadow-2xl">
            {selectedNews && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={selectedNews.source?.logo}
                          alt={selectedNews.source?.name || "Source logo"}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-foreground">{selectedNews.source?.name || "Unknown Source"}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground text-sm">{selectedNews.time}</span>
                        </div>
                        <div className="ml-1">{getCoinIcon(selectedNews.coin)}</div>
                      </div>
                      <DialogTitle
                        className="text-3xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent uppercase drop-shadow-lg mb-2 mt-2"
                        style={{ letterSpacing: "0.04em", fontFamily: "Montserrat,sans-serif" }}
                      >
                        {selectedNews.title}
                      </DialogTitle>
                    </div>
                    <Badge
                      className={cn(
                        "text-sm font-bold px-4 py-2 rounded-full shadow-sm tracking-wide",
                        selectedNews.sentiment === "positive"
                          ? "bg-gradient-to-r from-green-200 to-green-400 text-green-800 border border-green-300"
                          : selectedNews.sentiment === "negative"
                          ? "bg-gradient-to-r from-red-200 to-red-400 text-red-800 border border-red-300"
                          : "bg-gradient-to-r from-yellow-100 to-yellow-300 text-yellow-800 border border-yellow-300"
                      )}
                    >
                      {selectedNews.sentiment === "positive" ? "😊 " : selectedNews.sentiment === "negative" ? "😟 " : "😐 "}
                      {selectedNews.sentiment.charAt(0).toUpperCase() + selectedNews.sentiment.slice(1)}
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {selectedNews.thumbnail && (
                    <img
                      src={selectedNews.thumbnail}
                      alt="thumbnail"
                      className="w-full max-h-[360px] object-cover rounded-xl border border-[#F1E3F6]"
                    />
                  )}

                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-foreground">{selectedNews.fullContent || selectedNews.excerpt}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center text-sm text-muted-foreground"></div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => window.open(selectedNews.url, "_blank")}>
                        View on {selectedNews.source?.name || "Source"}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}