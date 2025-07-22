"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "../Sidebar";
import {
  FiSearch,
  FiArrowUp,
  FiArrowDown,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiClock,
} from "react-icons/fi";
import {
  FaBitcoin,
  FaEthereum,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";
import { SiSolana } from "react-icons/si";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Sentiment = "all" | "positive" | "negative" | "neutral";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: "positive" | "negative" | "neutral";
  sentimentScore: number;
  coin: string;
  excerpt: string;
  engagement: number;
  fullContent: string;
  url: string;
}

export default function NewsSentiment() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState<Sentiment>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<Record<string, boolean>>({});
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 20; // Default to 20, as size is Enterprise-only

  // Function to calculate time difference for display
  const getTimeAgo = (publishedAt: string) => {
    try {
      const now = new Date();
      const publishedDate = new Date(publishedAt);
      if (isNaN(publishedDate.getTime())) return "Unknown time";
      const diffMs = now.getTime() - publishedDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffHours < 1) return `${Math.floor(diffMs / (1000 * 60))}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "Unknown time";
    }
  };

  // Fetch news from CryptoPanic API
  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        auth_token: "4a4d75b8438580a64d96c8bdf5b6d4448027f351",
        public: "true",
        page: currentPage.toString(),
      });

      // Add sentiment filter if not 'all'
      if (selectedSentiment !== "all") {
        params.append(
          "filter",
          selectedSentiment === "positive"
            ? "bullish"
            : selectedSentiment === "negative"
            ? "bearish"
            : "important"
        );
      }

      // Add search query as currencies filter if applicable
      if (searchQuery) {
        const coinCodes = searchQuery
          .toUpperCase()
          .split(",")
          .map((code) => code.trim())
          .filter((code) => code);
        if (coinCodes.length > 0) {
          params.append("currencies", coinCodes.join(","));
        }
      }

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
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();

      // Map API response to NewsItem interface
      const mappedNews: NewsItem[] = data.results.map((item: any) => {
        // Determine the coin: use the first instrument's code or "UNKNOWN" if none
        const coin = item.instruments?.length > 0 ? item.instruments[0].code : "UNKNOWN";
        
        return {
          id: item.id.toString(),
          title: item.title || "Untitled",
          source: item.source?.title || "Unknown Source",
          time: getTimeAgo(item.published_at),
          sentiment:
            item.votes?.positive > item.votes?.negative
              ? "positive"
              : item.votes?.negative > item.votes?.positive
              ? "negative"
              : "neutral",
          sentimentScore: item.panic_score
            ? item.panic_score / 100
            : (item.votes?.positive - item.votes?.negative) /
                (item.votes?.positive + item.votes?.negative + 1) || 0,
          coin,
          excerpt: item.description || item.title || "No excerpt available",
          engagement:
            (item.votes?.positive || 0) +
            (item.votes?.negative || 0) +
            (item.views || 0),
          fullContent:
            item.content?.clean ||
            item.description ||
            item.title ||
            "No content available",
          url: item.url || "#",
        };
      });

      setNewsData(mappedNews);
      // Estimate total pages based on 'next' field
      setTotalPages(data.next ? currentPage + 1 : currentPage);
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to fetch news. Please try again later."
      );
      console.error("Fetch error:", err);
      setNewsData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedSentiment, searchQuery]);

  // Fetch news when page, sentiment, or search query changes
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filteredNews = useCallback(() => {
    return newsData.filter(
      (item) =>
        (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedSentiment === "all" || item.sentiment === selectedSentiment)
    );
  }, [newsData, searchQuery, selectedSentiment]);

  const paginatedNews = useCallback(() => {
    return filteredNews().slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [currentPage, filteredNews]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const openNewsModal = (news: NewsItem) => {
    setSelectedNews(news);
  };

  const closeNewsModal = () => {
    setSelectedNews(null);
  };

  const getSentimentColor = (
    sentiment: "positive" | "negative" | "neutral"
  ) => {
    switch (sentiment) {
      case "positive":
        return "text-green-500 bg-green-500/20";
      case "negative":
        return "text-red-500 bg-red-500/20";
      default:
        return "text-amber-500 bg-amber-500/20";
    }
  };

  const getCoinIcon = (coin: string) => {
    const baseClass = "w-5 h-5 rounded-full p-0.5";
    switch (coin.toUpperCase()) {
      case "BTC":
        return (
          <FaBitcoin
            className={`${baseClass} bg-amber-500/20 text-amber-500`}
          />
        );
      case "ETH":
        return (
          <FaEthereum className={`${baseClass} bg-blue-500/20 text-blue-500`} />
        );
      case "SOL":
        return (
          <SiSolana className={`${baseClass} bg-green-500/20 text-green-500`} />
        );
      default:
        return <div className={`${baseClass} bg-muted`}>{coin}</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground bg-paper">
      <Sidebar selected="News Sentiment" />

      <main className="flex-1 p-6 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-druk tracking-tight mb-1 text-primary">
              NEWS SENTIMENT ANALYSIS
            </h1>
            <p className="text-sm text-muted-foreground">
              Track market sentiment across crypto news sources
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search news or filter by coin (e.g., BTC,ETH)"
                  className="pl-9 bg-background/80 border-border/50 focus-visible:ring-primary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="w-[180px]">
              <Select
                value={selectedSentiment}
                onValueChange={(value) =>
                  setSelectedSentiment(value as Sentiment)
                }
              >
                <SelectTrigger className="bg-background/80 border-border/50">
                  <SelectValue placeholder="Filter by sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive" className="text-green-600">
                    Positive
                  </SelectItem>
                  <SelectItem value="negative" className="text-red-600">
                    Negative
                  </SelectItem>
                  <SelectItem value="neutral" className="text-amber-600">
                    Neutral
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Positive Sentiment
              </CardTitle>
              <div className="h-4 w-4 text-green-500">
                <FiArrowUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {newsData.filter((n) => n.sentiment === "positive").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Updated in real-time
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Negative Sentiment
              </CardTitle>
              <div className="h-4 w-4 text-red-500">
                <FiArrowDown className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {newsData.filter((n) => n.sentiment === "negative").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Updated in real-time
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Articles
              </CardTitle>
              <FiClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newsData.length}</div>
              <p className="text-xs text-muted-foreground">
                Fetched in last request
              </p>
            </CardContent>
          </Card>
        </div>

        {/* News Feed */}
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">
              Latest Market News
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isLoading}
                className="h-8 w-8 p-0"
              >
                <FiChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || isLoading}
                className="h-8 w-8 p-0"
              >
                <FiChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading news articles...
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : (
              <div className="space-y-4">
                {paginatedNews().map((item) => (
                  <div
                    key={item.id}
                    className="group p-4 hover:bg-accent/50 rounded-lg transition-colors border-b border-border/50 last:border-0 cursor-pointer"
                    onClick={() => openNewsModal(item)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getCoinIcon(item.coin)}
                          <span className="text-xs font-medium text-muted-foreground">
                            {item.source}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {item.time}
                          </span>
                          <Badge
                            variant={
                              item.sentiment === "positive"
                                ? "default"
                                : "destructive"
                            }
                            className="ml-2 text-xs"
                          >
                            {item.sentiment}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-foreground mb-1.5 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>
                              {item.engagement.toLocaleString()} engagements
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8 gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              openNewsModal(item);
                            }}
                          >
                            Read more{" "}
                            <FiExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="w-16 h-16 rounded-lg bg-muted/50 flex-shrink-0 flex items-center justify-center">
                        <div className="text-2xl">
                          {item.sentiment === "positive"
                            ? "📈"
                            : item.sentiment === "negative"
                            ? "📉"
                            : "📊"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredNews().length === 0 && !isLoading && (
                  <div className="text-center py-12 text-muted-foreground">
                    No news articles found matching your criteria.
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-4 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1 || isLoading}
              className="gap-1"
            >
              <FiChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredNews().length)} of{" "}
              {filteredNews().length} results
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isLoading}
              className="gap-1"
            >
              Next <FiChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* News Detail Modal */}
        <Dialog
          open={!!selectedNews}
          onOpenChange={(open) => !open && closeNewsModal()}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedNews && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <DialogTitle className="text-2xl">
                      {selectedNews.title}
                    </DialogTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeNewsModal}
                      className="h-8 w-8 -mt-2 -mr-2"
                    >
                      <FiX className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                    <span className="font-medium">{selectedNews.source}</span>
                    <span>•</span>
                    <span>{selectedNews.time}</span>
                    <Badge
                      variant={
                        selectedNews.sentiment === "positive"
                          ? "default"
                          : "destructive"
                      }
                      className="ml-2 text-xs"
                    >
                      {selectedNews.sentiment}
                    </Badge>
                  </div>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-2">
                    {getCoinIcon(selectedNews.coin)}
                    <span className="text-sm font-medium">
                      {selectedNews.coin}
                    </span>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-foreground">
                      {selectedNews.fullContent || selectedNews.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>
                        {selectedNews.engagement.toLocaleString()} engagements
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Share
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => window.open(selectedNews.url, "_blank")}
                      >
                        View on {selectedNews.source}
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