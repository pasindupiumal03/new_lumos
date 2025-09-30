'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiSearch, FiExternalLink, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// If you have custom icons (DollarSign, BarChart3, etc.), import them here or replace with your own.


const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjMzMDU5MWNkLTI4YWYtNDljMS1hZDgyLWM3YWZkZGE1MmMxZiIsIm9yZ0lkIjoiNDcyOTkwIiwidXNlcklkIjoiNDg2NTc4IiwidHlwZUlkIjoiOWYyZTQ4Y2ItZDgzMi00Zjg4LWI2OTYtNWZkNTJlMWE0Mjg5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTkxNDgwOTksImV4cCI6NDkxNDkwODA5OX0.p3v0cK0insA-Ivgr0IoRPJeE8vPI9OZUN0S8vCkuGgI';
const MORALIS_BASE_URL = 'https://deep-index.moralis.io/api/v2.2';

// Format currency
const formatCurrency = (value: number) => {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  } else if (value < 1 && value > 0) {
    return `$${value.toFixed(6)}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Format large numbers
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value);
};

// Format date
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const fetchTokenDetailsFromApi = async (address: string) => {
  const res = await fetch(`/api/token-details?address=${address}`);
  if (!res.ok) {
    return { error: 'Failed to fetch token details' };
  }
  try {
    return await res.json();
  } catch {
    return { error: 'Invalid JSON response' };
  }
};

export default function EthTrackerPage() {
  const [ethData, setEthData] = useState<any>(null);
  const [tokenAddress, setTokenAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = async (tokenAddr = '') => {
    if (tokenAddr) {
      setTokenLoading(true);
      // Fetch token details from new API
      const tokenData = await fetchTokenDetailsFromApi(tokenAddr);
      setEthData((prev: any) => ({ ...prev, tokenData }));
      setTokenLoading(false);
      return;
    } else {
      setLoading(true);
    }
    
    const params = new URLSearchParams();
    if (tokenAddr) {
      params.append('token', tokenAddr);
    } else {
      params.append('action', 'trending');
    }
    
    const res = await fetch(`/api/eth-tracker?${params.toString()}`);
    const data = await res.json();
    setEthData(data);
    
    if (tokenAddr) {
      setTokenLoading(false);
    } else {
      setLoading(false);
    }
  };

  // Fixing the params issue in fetchTrendingTokens
  const fetchTrendingTokens = async () => {
    try {
      const url = new URL(`${MORALIS_BASE_URL}/market-data/erc20s/top-tokens`);
      url.searchParams.append('chain', 'eth');
      url.searchParams.append('limit', '20');

      const response = await fetch(url.toString(), {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'accept': 'application/json',
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      return [];
    }
  };

  // Fixing the type for tokenAddress in fetchTokenDetails
  const fetchTokenDetails = async (tokenAddress: string) => {
    try {
      const [metadataRes, priceRes, statsRes] = await Promise.all([
        fetch(`${MORALIS_BASE_URL}/erc20/metadata?chain=eth&addresses=${tokenAddress}`, {
          headers: {
            'X-API-Key': MORALIS_API_KEY,
            'accept': 'application/json',
          },
        }),
        fetch(`${MORALIS_BASE_URL}/erc20/${tokenAddress}/price?chain=eth`, {
          headers: {
            'X-API-Key': MORALIS_API_KEY,
            'accept': 'application/json',
          },
        }),
        fetch(`${MORALIS_BASE_URL}/erc20/${tokenAddress}/stats?chain=eth`, {
          headers: {
            'X-API-Key': MORALIS_API_KEY,
            'accept': 'application/json',
          },
        }),
      ]);

      const metadata = await metadataRes.json();
      const price = await priceRes.json();
      const stats = await statsRes.json();

      return {
        ...metadata[0],
        price: price.usdPrice,
        priceChange24h: price['24hrPercentChange'],
        marketCap: stats.market_cap,
        holders: stats.holders,
      };
    } catch (error) {
      console.error('Error fetching token details:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('ETH Data:', ethData);
  }, [ethData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFEBF5] to-[#F3EFFF] text-[#232323] font-[Montserrat,sans-serif] flex">
      <Sidebar selected="ETH Tracker" />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border py-2">
          <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-foreground hover:bg-muted transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent uppercase drop-shadow-lg tracking-tight" style={{letterSpacing:'0.04em'}}>
                Ethereum Tracker
              </h1>
              <div className="w-6"></div> {/* Spacer for flex alignment */}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 py-4 overflow-auto">
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative rounded-2xl shadow-lg">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-6 w-6 text-[#A259FF]" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-32 py-4 border-2 border-[#F1E3F6] bg-white/90 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-[#FF1C8B]/40 focus:border-[#A259FF] transition-colors placeholder-[#A259FF]/70"
                placeholder="Enter Ethereum token address..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && tokenAddress.trim() && fetchData(tokenAddress)}
                disabled={tokenLoading}
                style={{fontFamily:'Montserrat,sans-serif'}}
              />
              <button
                onClick={() => tokenAddress.trim() && fetchData(tokenAddress)}
                disabled={!tokenAddress.trim() || tokenLoading}
                className="absolute inset-y-0 right-0 px-8 flex items-center bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] text-white font-bold rounded-r-2xl text-lg shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{fontFamily:'Montserrat,sans-serif'}}
              >
                {tokenLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : ethData ? (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Token Details */}
              {ethData.tokenData && !ethData.tokenData.error && (
                <Card className="glass-card border-primary/30 glow-primary mt-6">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-sm"></div>
                          {ethData.tokenData.logo ? (
                            <Image
                              src={ethData.tokenData.logo}
                              alt={ethData.tokenData.name}
                              width={48}
                              height={48}
                              className="rounded-full relative z-10 border-2 border-primary/30"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full relative z-10 border-2 border-primary/30 bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">
                                {ethData.tokenData.symbol?.slice(0, 2) || "??"}
                              </span>
                            </div>
                          )}
                          {/* Verified badge (optional) */}
                        </div>
                        <div>
                          <h3 className="gradient-text text-xl font-bold">{ethData.tokenData.name}</h3>
                          <p className="text-sm text-muted-foreground">{ethData.tokenData.symbol}</p>
                        </div>
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Price and Changes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="glass-card border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {/* <DollarSign className="h-4 w-4 text-primary" /> */}
                            <span className="text-sm text-muted-foreground">Current Price</span>
                          </div>
                          <p className="text-2xl font-bold gradient-text">{ethData.tokenData.price ? `$${Number(ethData.tokenData.price).toFixed(6)}` : 'N/A'}</p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {/* <Clock className="h-4 w-4 text-accent" /> */}
                            <span className="text-sm text-muted-foreground">24h Change</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* <TrendIcon24h ... /> */}
                            <p className={`text-lg font-semibold ${
                              typeof ethData.tokenData.change24h === 'number' && ethData.tokenData.change24h > 0
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}>
                              {typeof ethData.tokenData.change24h === 'number'
                                ? `${ethData.tokenData.change24h > 0 ? '+' : ''}${ethData.tokenData.change24h.toFixed(2)}%`
                                : 'N/A'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {/* <BarChart3 className="h-4 w-4 text-accent" /> */}
                            <span className="text-sm text-muted-foreground">Market Cap</span>
                          </div>
                          <p className="text-xl font-bold text-foreground">{ethData.tokenData.marketCap ? formatCurrency(ethData.tokenData.marketCap) : 'N/A'}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Market Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="glass-card border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {/* <TrendingUp className="h-4 w-4 text-primary" /> */}
                            <span className="text-sm text-muted-foreground">Volume (24h)</span>
                          </div>
                          <p className="text-xl font-bold text-foreground">{ethData.tokenData.volume24h ? formatCurrency(ethData.tokenData.volume24h) : 'N/A'}</p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {/* <Users className="h-4 w-4 text-primary" /> */}
                            <span className="text-sm text-muted-foreground">Holders</span>
                          </div>
                          <p className="text-xl font-bold text-foreground">{ethData.tokenData.holders ? formatNumber(ethData.tokenData.holders) : 'N/A'}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="default"
                        onClick={() => window.open(`https://etherscan.io/token/${ethData.tokenData.address}`, '_blank')}
                        className="glass-button hover:glow-primary bg-gradient-to-r from-primary/20 to-accent/20 flex-1"
                      >
                        {/* <ExternalLink className="h-4 w-4 mr-2" /> */}
                        View on Etherscan
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(ethData.tokenData.address)}
                        className="glass-button hover:glow-accent"
                      >
                        Copy Address
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Token Error */}
              {ethData.tokenData && ethData.tokenData.error && (
                <div className="bg-card border border-red-200 rounded-xl p-6 shadow-sm">
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-red-600 mb-2">Token Not Found</h3>
                    <p className="text-muted-foreground">{ethData.tokenData.error}</p>
                  </div>
                </div>
              )}

              {/* Trending Tokens */}
              {ethData.trendingTokens && ethData.trendingTokens.length > 0 && (
                <div className="bg-gradient-to-br from-[#F3EFFF]/80 to-[#FFEBF5]/90 border-2 border-[#F1E3F6] rounded-3xl p-8 shadow-lg">
                  <h2 className="text-xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent uppercase tracking-tight mb-4" style={{letterSpacing:'0.04em',fontFamily:'Montserrat,sans-serif'}}>Trending ETH Tokens (24h)</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ethData.trendingTokens.map((token: any) => (
                      <div key={token.tokenAddress} className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center hover:scale-105 transition-transform border-2 border-[#F1E3F6] group">
                        <img src={token.logo} alt={token.name} className="w-12 h-12 rounded-full mb-2 border-4 border-[#FFEBF5] group-hover:border-[#FF1C8B] transition-all" />
                        <span className ="text-lg font-bold text-[#232323] mb-1" style={{fontFamily:'Montserrat,sans-serif'}}>{token.name}</span>
                        <span className ="text-xs font-semibold text-[#A259FF] bg-[#F3EFFF] px-2 py-1 rounded-full mb-2 uppercase tracking-wide">{token.symbol}</span>
                        <span className ="text-xl font-extrabold text-[#FF1C8B]">${Number(token.usdPrice).toFixed(6)}</span>
                        <span className ={`text-sm font-mono mt-1 ${token.pricePercentChange['24h'] > 0 ? 'text-green-600' : token.pricePercentChange['24h'] < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {token.pricePercentChange['24h'] > 0 ? '+' : ''}{token.pricePercentChange['24h']?.toFixed(2)}%
                        </span>
                        <p className="text-sm font-mono mt-1">Volume (24h): ${token.totalVolume['24h'] ? token.totalVolume['24h'].toLocaleString() : 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#FFEBF5] to-[#A259FF]/20 text-[#FF1C8B] mb-4 shadow-lg">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent uppercase drop-shadow-lg tracking-tight" style={{letterSpacing:'0.04em',fontFamily:'Montserrat,sans-serif'}}>Ethereum Token Tracker</h3>
              <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                Enter an Ethereum token address to view detailed token information, or browse trending tokens above
              </p>
            </div>
          )}
          
          {/* Etherscan Banner */}
          <div className="mt-8 max-w-4xl mx-auto w-full group relative">
            <div className="rounded-lg overflow-hidden shadow-md border border-border relative">
              <div className="relative">
                <Image 
                  src="/etherscan-social.jpg" 
                  alt="Ethereum Blockchain Explorer"
                  width={1200}
                  height={300}
                  className="w-full h-auto object-cover transition-all duration-300 group-hover:blur-sm group-hover:brightness-75"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-lg font-medium bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm">
                    Powered by Etherscan.io
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
