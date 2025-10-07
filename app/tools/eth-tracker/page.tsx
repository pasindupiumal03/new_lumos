'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiSearch, FiExternalLink, FiClock, FiArrowUp, FiArrowDown, FiCopy } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// If you have custom icons (DollarSign, BarChart3, etc.), import them here or replace with your own.


const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
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
    <div className="flex min-h-screen custom-gradient">
      <Sidebar selected="ETH Tracker" />

      <main className="flex-1 px-8 py-12 overflow-auto" style={{fontFamily:'Poppins,sans-serif'}}>
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h1 className="font-black text-5xl md:text-7xl tracking-wider text-white leading-tight drop-shadow-xl" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.15em'}}>
                ETHEREUM <span className="text-[#3b0766]">TRACKER</span>
              </h1>
              <p className="text-lg text-white/70 mt-4 max-w-2xl font-medium" style={{fontFamily:'Poppins,sans-serif'}}>
                Real-time Ethereum token analytics and market insights.<br/>
                Track any ERC-20 token with comprehensive data.
              </p>
            </div>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mt-4 mb-6" />
        </div>
        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-black text-white tracking-wider flex items-center gap-3 mb-6" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.12em'}}>
              <span className="w-3 h-6 bg-[#3b0766] rounded-full inline-block"></span>
              TOKEN SEARCH
            </h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-6 w-6 text-white/50" />
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-32 py-4 border-2 border-white/10 rounded-2xl bg-white/5 backdrop-blur-md focus:ring-2 focus:ring-[#5B50E1] focus:border-[#5B50E1] outline-none text-white placeholder-white/50 shadow-xl transition-all text-lg font-medium"
                placeholder="Enter Ethereum token address (0x...)" 
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && tokenAddress.trim() && fetchData(tokenAddress)}
                disabled={tokenLoading}
                style={{fontFamily:'Poppins,sans-serif'}}
              />
              <button
                onClick={() => tokenAddress.trim() && fetchData(tokenAddress)}
                disabled={!tokenAddress.trim() || tokenLoading}
                className="absolute inset-y-0 right-0 px-8 flex items-center gradient-button text-white font-bold rounded-r-2xl text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{fontFamily:'Poppins,sans-serif'}}
              >
                {tokenLoading ? 'Searching...' : 'Search Token'}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-lg text-white/60 font-bold" style={{fontFamily:'Poppins,sans-serif'}}>
            Loading ethereum data...
          </div>
        ) : ethData ? (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Token Details */}
            {ethData.tokenData && !ethData.tokenData.error && (
              <div className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl p-10">
                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/20">
                  <div className="relative">
                    {ethData.tokenData.logo ? (
                      <Image
                        src={ethData.tokenData.logo}
                        alt={ethData.tokenData.name}
                        width={64}
                        height={64}
                        className="rounded-full border-4 border-white/20 shadow-xl"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/20 shadow-xl flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {ethData.tokenData.symbol?.slice(0, 2) || "??"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-white mb-2" style={{fontFamily:'Poppins,sans-serif'}}>
                      {ethData.tokenData.name}
                    </h3>
                    <p className="text-lg text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>
                      {ethData.tokenData.symbol}
                    </p>
                  </div>
                </div>

                {/* Price and Changes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <FiClock className="h-5 w-5 text-[#5B50E1]" />
                      <span className="text-sm text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Current Price</span>
                    </div>
                    <p className="text-3xl font-black text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                      {ethData.tokenData.price ? `$${Number(ethData.tokenData.price).toFixed(6)}` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      {typeof ethData.tokenData.change24h === 'number' && ethData.tokenData.change24h > 0 ? (
                        <FiArrowUp className="h-5 w-5 text-green-400" />
                      ) : (
                        <FiArrowDown className="h-5 w-5 text-red-400" />
                      )}
                      <span className="text-sm text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>24h Change</span>
                    </div>
                    <p className={`text-3xl font-black ${
                      typeof ethData.tokenData.change24h === 'number' && ethData.tokenData.change24h > 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`} style={{fontFamily:'Poppins,sans-serif'}}>
                      {typeof ethData.tokenData.change24h === 'number'
                        ? `${ethData.tokenData.change24h > 0 ? '+' : ''}${ethData.tokenData.change24h.toFixed(2)}%`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <FiExternalLink className="h-5 w-5 text-[#5B50E1]" />
                      <span className="text-sm text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Market Cap</span>
                    </div>
                    <p className="text-3xl font-black text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                      {ethData.tokenData.marketCap ? formatCurrency(ethData.tokenData.marketCap) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Market Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <FiArrowUp className="h-5 w-5 text-[#5B50E1]" />
                      <span className="text-sm text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Volume (24h)</span>
                    </div>
                    <p className="text-2xl font-black text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                      {ethData.tokenData.volume24h ? formatCurrency(ethData.tokenData.volume24h) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <FiCopy className="h-5 w-5 text-[#5B50E1]" />
                      <span className="text-sm text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Holders</span>
                    </div>
                    <p className="text-2xl font-black text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                      {ethData.tokenData.holders ? formatNumber(ethData.tokenData.holders) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => window.open(`https://etherscan.io/token/${ethData.tokenData.address}`, '_blank')}
                    className="flex-1 gradient-button text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all text-lg flex items-center justify-center gap-3"
                    style={{fontFamily:'Poppins,sans-serif'}}
                  >
                    <FiExternalLink className="w-5 h-5" />
                    View on Etherscan
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(ethData.tokenData.address)}
                    className="bg-white/10 text-white/70 hover:bg-white/20 hover:text-white px-8 py-4 rounded-2xl font-bold transition-all text-lg flex items-center gap-3 border border-white/20"
                    style={{fontFamily:'Poppins,sans-serif'}}
                  >
                    <FiCopy className="w-5 h-5" />
                    Copy Address
                  </button>
                </div>
              </div>
            )}

            {/* Token Error */}
            {ethData.tokenData && ethData.tokenData.error && (
              <div className="bg-white/5 backdrop-blur-md border-2 border-red-500/30 rounded-3xl shadow-2xl p-10 text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 mb-6">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-400 mb-4" style={{fontFamily:'Poppins,sans-serif'}}>Token Not Found</h3>
                <p className="text-white/70" style={{fontFamily:'Poppins,sans-serif'}}>{ethData.tokenData.error}</p>
              </div>
            )}

            {/* Trending Tokens */}
            {ethData.trendingTokens && ethData.trendingTokens.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl p-10">
                <h2 className="text-3xl font-black text-white tracking-wider flex items-center gap-3 mb-8" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.12em'}}>
                  <span className="w-3 h-8 bg-[#3b0766] rounded-full inline-block"></span>
                  TRENDING ETH TOKENS (24H)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {ethData.trendingTokens.map((token: any) => (
                    <div key={token.tokenAddress} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all group cursor-pointer">
                      <div className="flex flex-col items-center text-center">
                        <img src={token.logo} alt={token.name} className="w-16 h-16 rounded-full mb-4 border-2 border-white/20 group-hover:border-[#5B50E1] transition-all shadow-lg" />
                        <h3 className="text-lg font-bold text-white mb-2" style={{fontFamily:'Poppins,sans-serif'}}>{token.name}</h3>
                        <span className="text-xs font-bold text-white/70 bg-white/10 px-3 py-1 rounded-full mb-3 uppercase tracking-wide" style={{fontFamily:'Poppins,sans-serif'}}>{token.symbol}</span>
                        <p className="text-xl font-black text-[#5B50E1] mb-2" style={{fontFamily:'Poppins,sans-serif'}}>${Number(token.usdPrice).toFixed(6)}</p>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                          token.pricePercentChange['24h'] > 0 ? 'bg-green-100 text-green-800' : 
                          token.pricePercentChange['24h'] < 0 ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'
                        }`} style={{fontFamily:'Poppins,sans-serif'}}>
                          {token.pricePercentChange['24h'] > 0 ? '+' : ''}{token.pricePercentChange['24h']?.toFixed(2)}%
                        </span>
                        <p className="text-xs text-white/60 mt-3 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>
                          Volume: ${token.totalVolume['24h'] ? token.totalVolume['24h'].toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl p-16 text-center">
            <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-[#5B50E1] mb-8 shadow-xl">
              <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4" style={{fontFamily:'Poppins,sans-serif'}}>Ready to Track Tokens</h3>
            <p className="text-white/70 text-lg max-w-md mx-auto" style={{fontFamily:'Poppins,sans-serif'}}>
              Enter an Ethereum token address above to view detailed analytics, market data, and trading insights.
            </p>
          </div>
        )}
        
        {/* Etherscan Banner */}
        <div className="mt-12 max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl overflow-hidden group hover:shadow-[0_0_50px_rgba(91,80,225,0.3)] transition-all duration-300">
            <div className="relative">
              <Image 
                src="/etherscan-social.jpg" 
                alt="Ethereum Blockchain Explorer"
                width={1200}
                height={300}
                className="w-full h-64 object-cover transition-all duration-300 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center">
                  <h4 className="text-white text-2xl font-bold mb-2" style={{fontFamily:'Poppins,sans-serif'}}>Powered by Etherscan.io</h4>
                  <p className="text-white/80" style={{fontFamily:'Poppins,sans-serif'}}>The Ethereum Blockchain Explorer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
