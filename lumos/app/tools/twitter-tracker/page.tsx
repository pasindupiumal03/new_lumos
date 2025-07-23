"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiUsers,
  FiHeart,
  FiRepeat,
  FiMessageSquare,
  FiAlertCircle,
  FiTwitter,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../Sidebar";
import { cn } from "@/lib/utils";

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
}

interface User {
  id: string;
  username: string;
  name: string;
  description: string;
  profile_image_url?: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

interface ApiResponse {
  data: Tweet[];
  includes: {
    users: User[];
  };
  meta?: {
    result_count: number;
    newest_id?: string;
    oldest_id?: string;
    next_token?: string;
  };
  error?: string;
  details?: any;
  retryAfter?: number;
  rateLimitReset?: number;
}

interface CachedResult {
  tweets: Tweet[];
  users: Record<string, User>;
  timestamp: number;
  searchTerm: string;
}

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_ENTRIES = 20; // Maximum number of cached searches

export default function TwitterTracker() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [searchTerm, setSearchTerm] = useState("crypto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [lastSearchTerm, setLastSearchTerm] = useState("");
  const [cacheHit, setCacheHit] = useState(false);
  const [lastCacheTime, setLastCacheTime] = useState<number | null>(null);

  // Cache management functions
  const getCacheKey = (term: string) =>
    `twitter_cache_${term.toLowerCase().trim()}`;

  const saveToCache = (
    searchTerm: string,
    tweets: Tweet[],
    users: Record<string, User>
  ) => {
    try {
      const cacheData: CachedResult = {
        tweets,
        users,
        timestamp: Date.now(),
        searchTerm: searchTerm.toLowerCase().trim(),
      };

      const cacheKey = getCacheKey(searchTerm);
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));

      // Clean old cache entries
      cleanOldCacheEntries();

      console.log(
        `Cached results for "${searchTerm}" (${tweets.length} tweets)`
      );
    } catch (error) {
      console.warn("Failed to save to cache:", error);
    }
  };

  const getFromCache = (searchTerm: string): CachedResult | null => {
    try {
      const cacheKey = getCacheKey(searchTerm);
      const cached = localStorage.getItem(cacheKey);

      if (!cached) return null;

      const cacheData: CachedResult = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - cacheData.timestamp > CACHE_DURATION) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      console.log(
        `Cache hit for "${searchTerm}" (age: ${Math.round(
          (now - cacheData.timestamp) / 1000
        )}s)`
      );
      return cacheData;
    } catch (error) {
      console.warn("Failed to read from cache:", error);
      return null;
    }
  };

  const cleanOldCacheEntries = () => {
    try {
      const cacheEntries: { key: string; timestamp: number }[] = [];

      // Collect all twitter cache entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("twitter_cache_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "{}");
            cacheEntries.push({ key, timestamp: data.timestamp || 0 });
          } catch (e) {
            // Remove invalid cache entry
            localStorage.removeItem(key);
          }
        }
      }

      // Remove expired entries
      const now = Date.now();
      cacheEntries.forEach((entry) => {
        if (now - entry.timestamp > CACHE_DURATION) {
          localStorage.removeItem(entry.key);
        }
      });

      // Remove oldest entries if we have too many
      const validEntries = cacheEntries
        .filter((entry) => now - entry.timestamp <= CACHE_DURATION)
        .sort((a, b) => b.timestamp - a.timestamp);

      if (validEntries.length > MAX_CACHE_ENTRIES) {
        const entriesToRemove = validEntries.slice(MAX_CACHE_ENTRIES);
        entriesToRemove.forEach((entry) => {
          localStorage.removeItem(entry.key);
        });
      }
    } catch (error) {
      console.warn("Failed to clean cache:", error);
    }
  };

  const clearAllCache = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("twitter_cache_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      console.log("Cleared all Twitter cache");
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  };

  // Countdown timer for rate limit
  useEffect(() => {
    if (rateLimited && retryAfter > 0) {
      const timer = setInterval(() => {
        setRetryAfter((prev) => {
          if (prev <= 1) {
            setRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [rateLimited, retryAfter]);

  const fetchTweets = useCallback(
    async (searchQuery?: string, forceRefresh = false) => {
      const queryToUse = searchQuery || searchTerm;
      const normalizedQuery = queryToUse.toLowerCase().trim();

      if (rateLimited && !forceRefresh) {
        console.log("Rate limited, skipping request");
        return;
      }

      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedResult = getFromCache(normalizedQuery);
        if (cachedResult) {
          setTweets(cachedResult.tweets);
          setUsers(cachedResult.users);
          setLastSearchTerm(queryToUse);
          setCacheHit(true);
          setLastCacheTime(cachedResult.timestamp);
          setError(null);
          if (isInitialLoad) {
            setIsInitialLoad(false);
          }
          return;
        }
      }

      setLoading(true);
      setError(null);
      setCacheHit(false);
      setLastCacheTime(null);

      // Clear tweets only if it's a new search
      if (normalizedQuery !== lastSearchTerm.toLowerCase().trim()) {
        setTweets([]);
        setUsers({});
      }

      try {
        const response = await fetch(
          `/api/twitter-tracker?q=${encodeURIComponent(queryToUse)}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 429) {
            // Handle rate limiting
            const retryAfterSeconds =
              errorData.retryAfter ||
              parseInt(response.headers.get("retry-after") || "900");
            setRateLimited(true);
            setRetryAfter(retryAfterSeconds);
            setError(
              `Rate limit exceeded. Please wait ${Math.ceil(
                retryAfterSeconds / 60
              )} minutes before trying again.`
            );
            return;
          }

          throw new Error(
            errorData.error ||
              `Failed to fetch tweets: ${response.status} ${response.statusText}`
          );
        }

        const data: ApiResponse = await response.json();

        if (data.data) {
          setTweets(data.data);
          setLastSearchTerm(queryToUse);

          // Process users from includes
          let usersMap: Record<string, User> = {};
          if (data.includes?.users) {
            usersMap = data.includes.users.reduce((acc, user) => {
              acc[user.id] = user;
              return acc;
            }, {} as Record<string, User>);
            setUsers(usersMap);
          }

          // Save to cache
          saveToCache(queryToUse, data.data, usersMap);
          setLastCacheTime(Date.now());
        } else {
          setTweets([]);
          setUsers({});
          setLastSearchTerm(queryToUse);

          // Cache empty results too to avoid repeated API calls
          saveToCache(queryToUse, [], {});
          setLastCacheTime(Date.now());
        }
      } catch (err) {
        console.error("Error fetching tweets:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setTweets([]);
        setUsers({});
      } finally {
        setLoading(false);
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    },
    [searchTerm, lastSearchTerm, rateLimited, isInitialLoad]
  );

  // Load cache on component mount
  useEffect(() => {
    if (isInitialLoad && tweets.length === 0 && !rateLimited) {
      fetchTweets();
    }
  }, [isInitialLoad, tweets.length, rateLimited, fetchTweets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && !loading && !rateLimited) {
      fetchTweets(searchTerm.trim());
    }
  };

  const handleRefresh = () => {
    if (!loading && !rateLimited && lastSearchTerm) {
      fetchTweets(lastSearchTerm, true); // Force refresh
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatRetryTime = (seconds: number): string => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const formatCacheAge = (timestamp: number): string => {
    const ageSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (ageSeconds < 60) return `${ageSeconds}s ago`;
    const ageMinutes = Math.floor(ageSeconds / 60);
    if (ageMinutes < 60) return `${ageMinutes}m ago`;
    const ageHours = Math.floor(ageMinutes / 60);
    return `${ageHours}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFEBF5] to-[#F3EFFF] text-[#232323]">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar selected="Twitter Tracker" />
        </div>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-6 right-6 lg:hidden z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        >
          <FiTwitter className="w-6 h-6" />
        </button>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween" }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border lg:hidden"
              >
                {/* <Sidebar selected="Twitter Tracker" onNavigate={() => setIsSidebarOpen(false)} /> */}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-12">
            <div className="flex flex-col space-y-7">
              {/* Hero Section */}
              <div className="flex flex-col space-y-2 text-center mb-4">
                <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] text-[2.2rem] md:text-[3.5rem] leading-none uppercase tracking-tight drop-shadow-xl" style={{fontFamily:'Montserrat,Druk,sans-serif',letterSpacing:'0.05em'}}>
                  Twitter Tracker
                </h1>
                <p className="mt-2 text-lg md:text-xl font-semibold text-[#232323] opacity-80" style={{fontFamily:'Montserrat,sans-serif'}}>Track crypto-related tweets and analyze market sentiment in real-time</p>
              </div>
               <div className="bg-white/80 p-6 rounded-2xl border-2 border-[#F1E3F6] shadow-lg">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-[#A259FF]" />
                      </div>
                      <input
                        type="text"
                        className={cn(
                          "flex h-12 w-full rounded-xl border-2 border-[#F1E3F6] bg-gradient-to-r from-[#FFEBF5]/70 to-[#F3EFFF]/70 px-3 py-2 pl-12 text-base font-semibold ring-offset-background text-[#232323] placeholder:text-[#A259FF]/70",
                          "file:border-0 file:bg-transparent file:text-base file:font-medium",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A259FF] focus-visible:ring-offset-2",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                          "transition-colors duration-200"
                        )}
                        placeholder="Search for crypto topics, $tickers, or keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={loading || rateLimited}
                        style={{fontFamily:'Montserrat,sans-serif'}}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading || !searchTerm.trim() || rateLimited}
                        className={cn(
                          "inline-flex items-center justify-center rounded-xl text-base font-bold tracking-wide transition-all duration-150",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A259FF] focus-visible:ring-offset-2",
                          "disabled:pointer-events-none disabled:opacity-50",
                          "bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] text-white hover:opacity-90",
                          "h-12 px-7 py-2",
                          "whitespace-nowrap",
                          "shadow-md",
                          loading || !searchTerm.trim() || rateLimited
                            ? "opacity-70"
                            : ""
                        )}
                        style={{fontFamily:'Montserrat,sans-serif'}}
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Searching...
                          </>
                        ) : rateLimited ? (
                          <>
                            <FiClock className="mr-2 h-4 w-4" />
                            Wait {formatRetryTime(retryAfter)}
                          </>
                        ) : (
                          <>
                            <FiSearch className="mr-2 h-4 w-4" />
                            Search
                          </>
                        )}
                      </button>

                      {lastSearchTerm && tweets.length > 0 && (
                        <button
                          type="button"
                          onClick={handleRefresh}
                          disabled={loading || rateLimited}
                          className={cn(
                            className="inline-flex items-center justify-center rounded-xl text-base font-bold border-2 border-[#A259FF] bg-gradient-to-r from-[#FFEBF5] to-[#F3EFFF] text-[#A259FF] hover:text-[#FF1C8B] hover:border-[#FF1C8B] h-12 px-5 shadow-md transition-all duration-150"
                          )}
                          style={{fontFamily:'Montserrat,sans-serif'}}
                          title="Refresh current search"
                        >
                          <FiRefreshCw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {rateLimited && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                      <div className="flex items-center">
                        <FiClock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Rate limited. You can search again in{" "}
                          {formatRetryTime(retryAfter)}.
                        </p>
                      </div>
                    </div>
                  )}

                  {cacheHit && lastCacheTime && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg
                            className="h-4 w-4 text-green-600 dark:text-green-400 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            Showing cached results from{" "}
                            {formatCacheAge(lastCacheTime)}
                          </p>
                        </div>
                        <button
                          onClick={handleRefresh}
                          disabled={loading || rateLimited}
                          className="text-xs text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 underline"
                        >
                          Refresh
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">
                    Searching for "{searchTerm}"...
                  </p>
                </div>
              ) : error ? (
                <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiAlertCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-destructive">
                        Error loading tweets
                      </p>
                      <p className="text-sm text-destructive/80 mt-1">
                        {error}
                      </p>
                      <button
                        onClick={clearAllCache}
                        className="text-xs text-destructive hover:text-destructive/80 underline mt-2"
                      >
                        Clear cache and try again
                      </button>
                    </div>
                  </div>
                </div>
              ) : tweets.length === 0 ? (
                <div className="text-center py-16 bg-white/80 rounded-2xl border-2 border-[#F1E3F6]">
                  <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-[#FF1C8B]/10 to-[#A259FF]/10 text-[#A259FF] mb-4 shadow-lg">
                    <FiTwitter className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-extrabold uppercase bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent tracking-tight" style={{fontFamily:'Montserrat,Druk,sans-serif'}}> 
                    {isInitialLoad
                      ? "Search for crypto topics"
                      : "No tweets found"}
                  </h3>
                  <p className="mt-2 text-base font-semibold text-[#232323] opacity-80 max-w-md mx-auto" style={{fontFamily:'Montserrat,sans-serif'}}>
                    {isInitialLoad
                      ? "Enter a search term to find tweets about cryptocurrencies, tokens, or blockchain topics."
                      : `No tweets found for "${
                          lastSearchTerm || searchTerm
                        }". Try different keywords or check back later.`}
                  </p>
                </div> 
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Showing {tweets.length} tweets for "{lastSearchTerm}"
                    </span>
                    {lastCacheTime && (
                      <span className="flex items-center">
                        {cacheHit ? "📦 Cached" : "🔄 Fresh"} •{" "}
                        {formatCacheAge(lastCacheTime)}
                      </span>
                    )}
                  </div>
                  {tweets.map((tweet) => {
                    const user = users[tweet.author_id];
                    const tweetUrl = `https://twitter.com/${
                      user?.username || "twitter"
                    }/status/${tweet.id}`;

                    return (
                      <motion.div
                       key={tweet.id}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.3 }}
                       className="group bg-gradient-to-br from-[#F3EFFF]/80 to-[#FFEBF5]/90 border-2 border-[#F1E3F6] shadow-lg hover:shadow-2xl overflow-hidden rounded-2xl transition-all duration-200"
                     >
                       <div className="p-6">
                         <div className="flex items-start space-x-4">
                           <div className="flex-shrink-0">
                             {user?.profile_image_url ? (
                               <img
                                 className="h-12 w-12 rounded-full border-2 border-[#A259FF] shadow"
                                 src={user.profile_image_url.replace(
                                   "_normal",
                                   ""
                                 )}
                                 alt={user.name}
                               />
                             ) : (
                               <div className="h-12 w-12 rounded-full bg-[#F3EFFF] flex items-center justify-center border-2 border-[#A259FF]/40">
                                 <FiUsers className="h-6 w-6 text-[#A259FF]" />
                               </div>
                             )}
                           </div>

                           <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center space-x-2">
                                 <p className="text-base font-extrabold truncate bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent uppercase tracking-tight" style={{fontFamily:'Montserrat,Druk,sans-serif'}}>
                                   {user?.name || "Unknown User"}
                                 </p>
                                 <p className="text-base text-[#A259FF] truncate font-bold" style={{fontFamily:'Montserrat,sans-serif'}}>
                                   @{user?.username || "user"}
                                 </p>
                                 <span className="text-[#A259FF]/70">·</span>
                                 <p className="text-base text-[#A259FF]/70 whitespace-nowrap" style={{fontFamily:'Montserrat,sans-serif'}}>
                                   {formatDate(tweet.created_at)}
                                 </p>
                               </div>
                             </div>

                             <p className="mt-2 text-base leading-relaxed whitespace-pre-line break-words font-semibold" style={{fontFamily:'Montserrat,sans-serif'}}>
                               {tweet.text}
                             </p>

                             <div className="mt-4 flex items-center space-x-8 text-base text-[#A259FF]/80 font-bold" style={{fontFamily:'Montserrat,sans-serif'}}>
                               <div className="flex items-center space-x-1 group-has-[:hover]:text-[#FF1C8B] transition-colors">
                                 <FiMessageSquare className="h-5 w-5" />
                                 <span>
                                   {formatNumber(
                                     tweet.public_metrics.reply_count
                                   )}
                                 </span>
                               </div>
                               <div className="flex items-center space-x-1 group-has-[:hover]:text-[#FF1C8B] transition-colors">
                                 <FiRepeat className="h-5 w-5" />
                                 <span>
                                   {formatNumber(
                                     tweet.public_metrics.retweet_count
                                   )}
                                 </span>
                               </div>
                               <div className="flex items-center space-x-1 group-has-[:hover]:text-[#FF1C8B] transition-colors">
                                 <FiHeart className="h-5 w-5" />
                                 <span>
                                   {formatNumber(
                                     tweet.public_metrics.like_count
                                   )}
                                 </span>
                               </div>
                               <a
                                 href={tweetUrl}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="ml-auto inline-flex items-center text-base font-bold text-[#A259FF] hover:text-[#FF1C8B] transition-colors"
                                 style={{fontFamily:'Montserrat,sans-serif'}}
                               >
                                 <svg
                                   className="ml-1 h-4 w-4"
                                   fill="none"
                                   viewBox="0 0 24 24"
                                   stroke="currentColor"
                                 >
                                   <path
                                     strokeLinecap="round"
                                     strokeLinejoin="round"
                                     strokeWidth={2}
                                     d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                   />
                                 </svg>
                               </a>
                             </div>
                           </div>
                         </div>
                       </div>
                     </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
