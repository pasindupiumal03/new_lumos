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

import { getNewsSourceInfo, getSentimentInfo } from "@/lib/newsUtils";

interface NewsItem {
  id: string;
  title: string;
  source: {
    name: string;
    logo: string;
    domain: string;
  };
  publishedAt: string;
  time: string;
  sentiment: "positive" | "negative" | "neutral";
  sentimentScore: number;
  coin: string;
  excerpt: string;
  engagement: number;
  fullContent: string;
  url: string;
  votes?: {
    positive: number;
    negative: number;
    important: number;
    liked: number;
    disliked: number;
    lol: number;
    toxic: number;
    saved: number;
    comments: number;
  };
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
      const apiKey = process.env.NEXT_PUBLIC_CRYPTOPANIC_API_KEY || "4a4d75b8438580a64d96c8bdf5b6d4448027f351";
      const apiPlan = process.env.NEXT_PUBLIC_CRYPTOPANIC_API_PLAN || "developer";
      
      if (!apiKey) {
        throw new Error("CryptoPanic API key is not configured. Please check your environment variables.");
      }

      const params = new URLSearchParams({
        auth_token: apiKey,
        public: "true",
        page: currentPage.toString(),
        metadata: "1", // Request additional metadata
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
      } else {
        // For 'all' sentiment, include both bullish and bearish news
        params.append("filter", "rising");
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

      // Use the API route
      const response = await fetch(
        `/api/news-sentiment?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          next: { revalidate: 300 }, // Revalidate every 5 minutes
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the error as JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        console.error("Invalid API response format:", data);
        throw new Error("Received invalid data format from the API");
      }

      // Map API response to NewsItem interface
      const mappedNews: NewsItem[] = data.results.map((item: any) => {
        // Determine the coin: use the first instrument's code or empty string if none
        const coin = item.instruments?.length > 0 ? item.instruments[0].code : "";
        
        // Enhanced sentiment analysis using panic_score and votes
        let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
        
        // First check if there are enough votes to determine sentiment
        const totalVotes = (item.votes?.positive || 0) + (item.votes?.negative || 0);
        
        if (totalVotes >= 5) {
          // If we have enough votes, use them to determine sentiment
          const voteRatio = (item.votes.positive - item.votes.negative) / totalVotes;
          sentiment = voteRatio > 0.2 ? 'positive' : voteRatio < -0.2 ? 'negative' : 'neutral';
        } else if (item.panic_score !== undefined) {
          // Otherwise, use panic_score if available
          if (item.panic_score > 60) {
            sentiment = 'positive';
          } else if (item.panic_score < 40) {
            sentiment = 'negative';
          }
        }
        
        // Override with filter if present (bullish/bearish)
        if (item.filter_terms?.includes('bullish')) {
          sentiment = 'positive';
        } else if (item.filter_terms?.includes('bearish')) {
          sentiment = 'negative';
        }

        // Get source information with cryptopanic.com as fallback
        const urlObj = (() => {
          try {
            return new URL(item.url || '');
          } catch {
            return null;
          }
        })();

        const domain = item.source?.domain || urlObj?.hostname?.replace('www.', '') || '';
        const safeDomain = domain && domain !== 'example.com' ? domain : 'cryptopanic.com';

        const sourceInfo = {
          name: item.source?.title || safeDomain,
          domain: safeDomain,
          logo: `https://www.google.com/s2/favicons?domain=${safeDomain}&sz=64`
        };
        
        // Get sentiment info
        const sentimentData = getSentimentInfo(sentiment);
        
        return {
          id: item.id.toString(),
          title: item.title || "Untitled",
          source: sourceInfo,
          publishedAt: item.published_at,
          time: getTimeAgo(item.published_at),
          sentiment,
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
          votes: item.votes
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
                          {/* Source Avatar with better fallback */}
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            <img
                              src={item.source?.logo}
                              alt={item.source?.name ? `${item.source.name} logo` : 'Source logo'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                // Fallback to a generic icon if favicon fails to load
                                target.src = `data:image/svg+xml,${encodeURIComponent(
                                  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>'
                                )}`;
                                target.onerror = null; // Prevent infinite loop
                              }}
                            />
                          </div>
                          
                          {/* Source Name and Time */}
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-medium text-foreground truncate max-w-[120px]" title={item.source?.name || ''}>
                              {item.source?.name || 'Source'}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              {item.time}
                            </span>
                          </div>
                          
                          {/* Coin Icon */}
                          <div className="ml-1">
                            {getCoinIcon(item.coin)}
                          </div>
                          
                          {/* Sentiment Badge */}
                          <div className="ml-auto">
                            <Badge
                              className={`text-xs ${
                                item.sentiment === 'positive' 
                                  ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                                  : item.sentiment === 'negative' 
                                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                                    : 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                              }`}
                            >
                              {item.sentiment === 'positive' ? '😊 ' : 
                               item.sentiment === 'negative' ? '😟 ' : '😐 '}
                              {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                              {item.votes && (
                                <span className="ml-1 text-xs opacity-80">
                                  ({item.votes.positive + item.votes.negative})
                                </span>
                              )}
                            </Badge>
                          </div>
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {/* Source Avatar */}
                        <div className="flex-shrink-0">
                          <img
                            src={selectedNews.source?.logo}
                            alt={selectedNews.source?.name || 'Source logo'}
                            className="w-6 h-6 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const domain = selectedNews.source?.domain || 'example.com';
                              target.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                            }}
                          />
                        </div>
                        
                        {/* Source Name and Time */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-foreground">
                            {selectedNews.source?.name || 'Unknown Source'}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground text-sm">
                            {selectedNews.time}
                          </span>
                        </div>
                        
                        {/* Coin Icon */}
                        <div className="ml-1">
                          {getCoinIcon(selectedNews.coin)}
                        </div>
                        
                        {/* Engagement */}
                        <div className="ml-2 text-xs text-muted-foreground">

                        </div>
                      </div>
                      
                      <DialogTitle className="text-2xl mt-2">
                        {selectedNews.title}
                      </DialogTitle>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Sentiment Badge */}
                      <Badge
                        className={`text-sm ${
                          selectedNews.sentiment === 'positive' 
                            ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                            : selectedNews.sentiment === 'negative' 
                              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                              : 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                        }`}
                      >
                        {selectedNews.sentiment === 'positive' ? '😊 ' : 
                         selectedNews.sentiment === 'negative' ? '😟 ' : '😐 '}
                        {selectedNews.sentiment.charAt(0).toUpperCase() + selectedNews.sentiment.slice(1)}
                        {selectedNews.votes && (
                          <span className="ml-1 text-xs opacity-80">
                            ({selectedNews.votes.positive + selectedNews.votes.negative} votes)
                          </span>
                        )}
                      </Badge>
                      

                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {selectedNews.coin && (
                    <div className="flex items-center gap-2">
                      {getCoinIcon(selectedNews.coin)}
                      <span className="text-sm font-medium">
                        {selectedNews.coin}
                      </span>
                    </div>
                  )}
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-foreground">
                      {selectedNews.fullContent || selectedNews.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>

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
                        View on {selectedNews.source?.name || 'Source'}
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