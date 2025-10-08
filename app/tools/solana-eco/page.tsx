'use client';

import TransactionSignature from './TransactionSignature';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiSearch, FiExternalLink, FiClock, FiArrowUp, FiArrowDown, FiCopy } from 'react-icons/fi';
import { FaCoins, FaHandHoldingUsd } from "react-icons/fa";
import { SiCoinmarketcap } from "react-icons/si";
import { Ri24HoursLine } from "react-icons/ri";
import { IoMdTrendingUp, IoMdTrendingDown } from "react-icons/io";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import Sidebar from '../Sidebar';

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

const fetchSolanaTokenDetails = async (address: string) => {
  try {
    const res = await fetch(`/api/solana-token-details?address=${encodeURIComponent(address)}`);
    
    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.error || 'Failed to fetch token details' };
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching token details:', error);
    return { error: 'Network error: Failed to fetch token details' };
  }
};

export default function SolanaEcoPage() {
  const [data, setData] = useState<any>(null);
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenData, setTokenData] = useState<any>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/solana-eco')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load Solana data:', err);
        setLoading(false);
      });
  }, []);

  const fetchTokenData = async (tokenAddr: string) => {
    if (!tokenAddr.trim()) return;
    setTokenLoading(true);
    setTokenData(null);
    try {
      const tokenDetails = await fetchSolanaTokenDetails(tokenAddr.trim());
      setTokenData(tokenDetails);
    } catch (error) {
      console.error('Error fetching token data:', error);
      setTokenData({ error: 'Failed to fetch token data' });
    } finally {
      setTokenLoading(false);
    }
  };

  if (!data) return <div className="p-8"></div>;

  const chartData = {
    labels: Array.isArray(data.blocks)
      ? data.blocks.map((slot: number) => `#${slot}`)
      : [],
    datasets: [
      {
        label: 'Block Slots',
        data: Array.isArray(data.blocks)
          ? data.blocks.map((slot: number, i: number) => i + 1)
          : [],
        backgroundColor: 'rgba(100, 149, 237, 0.6)',
        borderColor: 'rgba(100, 149, 237, 1)',
        fill: false,
      },
    ],
  };

  const tpsData = {
    labels: data.tpsSamples.map((_: any, i: number) => `Sample ${i + 1}`),
    datasets: [
      {
        label: 'Transactions per Second',
        data: data.tpsSamples.map((s: any) =>
          Math.floor(s.numTransactions / (s.samplePeriodSecs || 1))
        ),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
      },
    ],
  };

  return (
    <div className="flex min-h-screen custom-gradient">
      <Sidebar selected="Solana Eco" />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 overflow-auto scrollbar-hide" style={{fontFamily:'Poppins,sans-serif'}}>
        {/* Header Section */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8">
            <div className="text-center md:text-left">
              <h1 className="font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-wider text-white leading-tight drop-shadow-xl" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.15em'}}>
                SOLANA <span className="text-[#ba9ecf]">ECOSYSTEM</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-white/70 mt-3 sm:mt-4 max-w-2xl font-medium mx-auto md:mx-0" style={{fontFamily:'Poppins,sans-serif'}}>
                Comprehensive Solana blockchain analytics and token insights.<br className="hidden sm:block"/>
                <span className="sm:hidden"> </span>Track any SPL token with real-time market data.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-10 lg:mb-12 px-4 sm:px-0">
          <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 overflow-hidden hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:scale-[1.01] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/10 via-transparent to-[#6C38CC]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white tracking-wider flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-4 sm:mb-6" style={{fontFamily:'Arial Black,sans-serif',letterSpacing:'0.1em'}}>
                TOKEN SEARCH
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 sm:h-6 sm:w-6 text-white/50" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 sm:pl-12 pr-4 sm:pr-24 lg:pr-28 py-3 sm:py-4 border-2 border-white/20 rounded-2xl sm:rounded-r-none bg-white/10 backdrop-blur-xl focus:ring-2 focus:ring-[#A259FF]/50 focus:border-[#A259FF]/50 focus:bg-white/15 outline-none text-white placeholder-white/50 shadow-xl transition-all duration-300 hover:border-white/30 hover:bg-white/12 text-base sm:text-lg font-medium"
                    placeholder="Enter Solana token address..." 
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && tokenAddress.trim() && fetchTokenData(tokenAddress)}
                    disabled={tokenLoading}
                    style={{fontFamily:'Poppins,sans-serif'}}
                  />
                  <button
                    onClick={() => tokenAddress.trim() && fetchTokenData(tokenAddress)}
                    disabled={!tokenAddress.trim() || tokenLoading}
                    className="hidden sm:flex absolute inset-y-0 right-0 px-6 lg:px-8 items-center bg-gradient-to-r from-[#A259FF]/80 to-[#6C38CC]/80 backdrop-blur-xl border border-[#A259FF]/30 text-white font-bold rounded-r-2xl text-sm lg:text-base shadow-xl hover:shadow-[0_8px_32px_rgba(162,89,255,0.6)] hover:from-[#A259FF] hover:to-[#6C38CC] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden group"
                    style={{fontFamily:'Poppins,sans-serif'}}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF1C8B]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 whitespace-nowrap">
                      {tokenLoading ? 'Searching...' : 'Search'}
                    </span>
                  </button>
                </div>
                <button
                  onClick={() => tokenAddress.trim() && fetchTokenData(tokenAddress)}
                  disabled={!tokenAddress.trim() || tokenLoading}
                  className="sm:hidden relative w-full py-4 px-6 bg-gradient-to-r from-[#A259FF] to-[#6C38CC] backdrop-blur-xl border border-[#A259FF]/50 text-white font-bold rounded-2xl text-base shadow-xl hover:shadow-[0_8px_32px_rgba(162,89,255,0.6)] hover:from-[#A259FF]/90 hover:to-[#6C38CC]/90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden group"
                  style={{fontFamily:'Poppins,sans-serif'}}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF1C8B]/30 via-transparent to-[#FF1C8B]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <FiSearch className="h-5 w-5" />
                    {tokenLoading ? 'Searching...' : 'Search Token'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-lg text-white/60 font-bold" style={{fontFamily:'Poppins,sans-serif'}}>
            Loading Solana ecosystem data...
          </div>
        ) : data ? (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Token Details */}
            {tokenData && !tokenData.error && (
              <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-3xl shadow-2xl p-10 overflow-hidden hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/5 via-transparent to-[#6C38CC]/5 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/20">
                    <div className="relative">
                      {tokenData.token?.image ? (
                        <Image
                          src={tokenData.token.image}
                          alt={tokenData.token.name}
                          width={64}
                          height={64}
                          className="rounded-full border-4 border-white/20 shadow-xl"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/20 shadow-xl flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {tokenData.token?.symbol?.slice(0, 2) || "??"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-white mb-2" style={{fontFamily:'Poppins,sans-serif'}}>
                        {tokenData.token?.name}
                      </h3>
                      <p className="text-lg text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}> 
                        {tokenData.token?.symbol}
                      </p>
                    </div>
                  </div>

                  {/* Price and Changes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="group relative bg-white/15 backdrop-blur-xl border border-white/30 hover:border-white/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/10 to-[#6C38CC]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <FaCoins className="w-5 h-5 text-green-400" />
                          <span className="text-xs sm:text-sm text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Current Price</span>
                        </div>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white break-all" style={{fontFamily:'Poppins,sans-serif'}}>
                          {tokenData.pools?.[0]?.price?.usd ? `$${Number(tokenData.pools[0].price.usd).toFixed(8)}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="group relative bg-white/15 backdrop-blur-xl border border-white/30 hover:border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#FF1C8B]/10 to-[#A259FF]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          {tokenData.events?.['24h']?.priceChangePercentage > 0 ? (
                            <IoMdTrendingUp className="h-5 w-5 text-green-400" />
                          ) : (
                            <IoMdTrendingDown className="h-5 w-5 text-red-400" />
                          )}
                          <span className="text-sm text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>24h Change</span>
                        </div>
                        <p className={`text-3xl font-black ${
                          tokenData.events?.['24h']?.priceChangePercentage > 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`} style={{fontFamily:'Poppins,sans-serif'}}>
                          {tokenData.events?.['24h']?.priceChangePercentage
                            ? `${tokenData.events['24h'].priceChangePercentage > 0 ? '+' : ''}${tokenData.events['24h'].priceChangePercentage.toFixed(2)}%`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="group relative bg-white/15 backdrop-blur-xl border border-white/30 hover:border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#6C38CC]/10 to-[#FF1C8B]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <SiCoinmarketcap className="h-5 w-5 text-[#000000]" />
                          <span className="text-sm text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Market Cap</span>
                        </div>
                        <p className="text-3xl font-black text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                          {tokenData.pools?.[0]?.marketCap?.usd ? formatCurrency(tokenData.pools[0].marketCap.usd) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Market Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="group relative bg-white/15 backdrop-blur-xl border border-white/30 hover:border-white/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/10 to-[#6C38CC]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <Ri24HoursLine className="h-4 w-4 sm:h-5 sm:w-5 text-[#59ffb2]" />
                          <span className="text-xs sm:text-sm text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Liquidity (24h)</span>
                        </div>
                        <p className="text-2xl font-black text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                          {tokenData.pools?.[0]?.liquidity?.usd ? formatCurrency(tokenData.pools[0].liquidity.usd) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="group relative bg-white/15 backdrop-blur-xl border border-white/30 hover:border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#FF1C8B]/10 to-[#A259FF]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <FaHandHoldingUsd className="h-5 w-5 text-[#ff9b59]" />
                          <span className="text-sm text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Holders</span>
                        </div>
                        <p className="text-2xl font-black text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                          {tokenData.holders ? formatNumber(tokenData.holders) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => window.open(`https://solscan.io/token/${tokenData.token?.mint}`, '_blank')}
                      className="flex-1 gradient-button text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all text-lg flex items-center justify-center gap-3"
                      style={{fontFamily:'Poppins,sans-serif'}}
                    >
                      <FiExternalLink className="w-5 h-5" />
                      View on Solscan
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(tokenData.token?.mint || '')}
                      className="bg-white/10 text-white/70 hover:bg-white/20 hover:text-white px-8 py-4 rounded-2xl font-bold transition-all text-lg flex items-center gap-3 border border-white/20"
                      style={{fontFamily:'Poppins,sans-serif'}}
                    >
                      <FiCopy className="w-5 h-5" />
                      Copy Address
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Token Error */}
            {tokenData && tokenData.error && (
              <div className="group relative bg-white/10 backdrop-blur-xl border border-red-500/30 hover:border-red-500/40 rounded-3xl shadow-2xl p-10 text-center overflow-hidden hover:shadow-[0_8px_32px_rgba(239,68,68,0.3)] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-500/20 backdrop-blur-xl text-red-400 mb-6 border border-red-500/30 shadow-xl">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-red-400 mb-4" style={{fontFamily:'Poppins,sans-serif'}}>Token Not Found</h3>
                  <p className="text-white/70" style={{fontFamily:'Poppins,sans-serif'}}>{tokenData.error}</p>
                </div>
              </div>
            )}

            {/* Trending Tokens (24h) */}
            <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-10 overflow-hidden hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/5 via-transparent to-[#6C38CC]/5 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-wider flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-6 sm:mb-8" style={{fontFamily:'Arial Black,sans-serif',letterSpacing:'0.1em'}}>
                  <span className="text-center sm:text-left">TRENDING SOLANA TOKENS (24H)</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {Array.isArray(data.trendingTokens) && data.trendingTokens.length > 0 ? (
                    data.trendingTokens.slice(0, 20).map((token: any) => (
                      <div key={token.address} className="group relative bg-white/15 backdrop-blur-xl border border-white/30 hover:border-white/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:scale-[1.02] sm:hover:scale-[1.05] transition-all duration-300 cursor-pointer lumos-animated-outline overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/10 via-transparent to-[#6C38CC]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <img src={token.logoURI} alt={token.symbol} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4 border-2 border-white/30 group-hover:border-[#A259FF]/60 transition-all shadow-lg" />
                          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white mb-1 sm:mb-2 truncate w-full" style={{fontFamily:'Poppins,sans-serif'}}>{token.name}</h3>
                          <span className="text-xs font-bold text-white/70 bg-white/15 backdrop-blur-xl px-2 sm:px-3 py-1 rounded-full mb-2 sm:mb-3 uppercase tracking-wide border border-white/20" style={{fontFamily:'Poppins,sans-serif'}}>{token.symbol}</span>
                          <p className="text-lg sm:text-xl font-black text-[#e936da] mb-1 sm:mb-2 break-all" style={{fontFamily:'Poppins,sans-serif'}}>${Number(token.price).toFixed(6)}</p>
                          <span className={`text-sm font-bold px-3 py-1 rounded-full backdrop-blur-xl border ${
                            token.change24h > 0 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                            token.change24h < 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                            'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }`} style={{fontFamily:'Poppins,sans-serif'}}>
                            {token.change24h > 0 ? '+' : ''}{token.change24h?.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-white/60 text-lg" style={{fontFamily:'Poppins,sans-serif'}}>No trending tokens available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16 text-center overflow-hidden hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] transition-all duration-300 mx-4 sm:mx-0">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/5 via-transparent to-[#6C38CC]/5 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-xl border border-white/30 text-[#A259FF] mb-6 sm:mb-8 shadow-xl">
                <svg className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4" style={{fontFamily:'Poppins,sans-serif'}}>Ready to Track Tokens</h3>
              <p className="text-white/70 text-sm sm:text-base lg:text-lg max-w-md mx-auto px-4 sm:px-0" style={{fontFamily:'Poppins,sans-serif'}}>
                Enter a Solana token address above to view detailed analytics, market data, and trading insights.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}