'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiUsers, FiHeart, FiRepeat, FiMessageSquare, FiAlertCircle, FiTwitter } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../Sidebar';
import { cn } from '@/lib/utils';

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
}

export default function TwitterTracker() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [searchTerm, setSearchTerm] = useState('crypto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchTweets = async () => {
    setLoading(true);
    setError(null);
    setTweets([]);
    setUsers({});

    try {
      const response = await fetch(`/api/twitter-tracker?q=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch tweets: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.data) {
        setTweets(data.data);
        
        // Process users from includes
        if (data.includes?.users) {
          const usersMap = data.includes.users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {} as Record<string, User>);
          setUsers(usersMap);
        }
      } else {
        setTweets([]);
        setUsers({});
      }
    } catch (err) {
      console.error('Error fetching tweets:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setTweets([]);
      setUsers({});
    } finally {
      setLoading(false);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    if (isInitialLoad) {
      fetchTweets();
    }
  }, [isInitialLoad]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && !loading) {
      fetchTweets();
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
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
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween' }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border lg:hidden"
              >
                <Sidebar selected="Twitter Tracker" onNavigate={() => setIsSidebarOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-8">
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Twitter Tracker
                </h1>
                <p className="text-muted-foreground">
                  Track crypto-related tweets and analyze market sentiment in real-time
                </p>
              </div>
        
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <input
                        type="text"
                        className={cn(
                          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background',
                          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
                          'placeholder:text-muted-foreground',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                          'disabled:cursor-not-allowed disabled:opacity-50',
                          'transition-colors duration-200'
                        )}
                        placeholder="Search for crypto topics, $tickers, or keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !searchTerm.trim()}
                      className={cn(
                        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        'disabled:pointer-events-none disabled:opacity-50',
                        'bg-primary text-primary-foreground hover:bg-primary/90',
                        'h-10 px-4 py-2',
                        'whitespace-nowrap',
                        'shadow-sm',
                        loading || !searchTerm.trim() ? 'opacity-70' : ''
                      )}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Searching...
                        </>
                      ) : (
                        <>
                          <FiSearch className="mr-2 h-4 w-4" />
                          Search Tweets
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">Searching for "{searchTerm}"...</p>
                </div>
              ) : error ? (
                <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiAlertCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-destructive">Error loading tweets</p>
                      <p className="text-sm text-destructive/80 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              ) : tweets.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <FiTwitter className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium">
                    {isInitialLoad ? 'Search for crypto topics' : 'No tweets found'}
                  </h3>
                  <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                    {isInitialLoad 
                      ? 'Enter a search term to find tweets about cryptocurrencies, tokens, or blockchain topics.'
                      : `No tweets found for "${searchTerm}". Try different keywords or check back later.`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tweets.map((tweet) => {
                    const user = users[tweet.author_id];
                    const tweetUrl = `https://twitter.com/${user?.username || 'twitter'}/status/${tweet.id}`;
                    
                    return (
                      <motion.div 
                        key={tweet.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="group bg-card overflow-hidden rounded-xl border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="p-5">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {user?.profile_image_url ? (
                                <img 
                                  className="h-10 w-10 rounded-full border border-border" 
                                  src={user.profile_image_url.replace('_normal', '')} 
                                  alt={user.name} 
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                  <FiUsers className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium truncate">
                                    {user?.name || 'Unknown User'}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    @{user?.username || 'user'}
                                  </p>
                                  <span className="text-muted-foreground">·</span>
                                  <p className="text-sm text-muted-foreground whitespace-nowrap">
                                    {formatDate(tweet.created_at)}
                                  </p>
                                </div>
                              </div>
                              
                              <p className="mt-1 text-sm leading-relaxed whitespace-pre-line break-words">
                                {tweet.text}
                              </p>
                              
                              <div className="mt-3 flex items-center space-x-6 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1 group-has-[:hover]:text-foreground transition-colors">
                                  <FiMessageSquare className="h-4 w-4" />
                                  <span>{formatNumber(tweet.public_metrics.reply_count)}</span>
                                </div>
                                <div className="flex items-center space-x-1 group-has-[:hover]:text-foreground transition-colors">
                                  <FiRepeat className="h-4 w-4" />
                                  <span>{formatNumber(tweet.public_metrics.retweet_count)}</span>
                                </div>
                                <div className="flex items-center space-x-1 group-has-[:hover]:text-foreground transition-colors">
                                  <FiHeart className="h-4 w-4" />
                                  <span>{formatNumber(tweet.public_metrics.like_count)}</span>
                                </div>
                                <a 
                                  href={tweetUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-auto inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                  View on Twitter
                                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
