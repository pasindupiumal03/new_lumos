'use client';

import TransactionSignature from './TransactionSignature';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiSearch, FiExternalLink, FiClock, FiArrowUp, FiArrowDown, FiCopy } from 'react-icons/fi';
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
      <main className="flex-1 px-8 py-12 overflow-auto" style={{fontFamily:'Poppins,sans-serif'}}>
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h1 className="font-black text-5xl md:text-7xl tracking-wider text-white leading-tight drop-shadow-xl" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.15em'}}>
                SOLANA <span className="text-[#3b0766]">ECOSYSTEM</span>
              </h1>
              <p className="text-lg text-white/70 mt-4 max-w-2xl font-medium" style={{fontFamily:'Poppins,sans-serif'}}>
                Comprehensive Solana blockchain analytics and token insights.<br/>
                Track any SPL token with real-time market data.
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
            Loading Solana ecosystem data...
          </div>
        ) : data ? (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Token Details */}
            {tokenData && !tokenData.error && (
              <div className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl p-10">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <FiClock className="h-5 w-5 text-[#5B50E1]" />
                      <span className="text-sm text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Current Price</span>
                    </div>
                    <p className="text-3xl font-black text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                      {tokenData.pools?.[0]?.price?.usd ? `$${Number(tokenData.pools[0].price.usd).toFixed(8)}` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      {tokenData.events?.['24h']?.priceChangePercentage > 0 ? (
                        <FiArrowUp className="h-5 w-5 text-green-400" />
                      ) : (
                        <FiArrowDown className="h-5 w-5 text-red-400" />
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
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <FiExternalLink className="h-5 w-5 text-[#5B50E1]" />
                      <span className="text-sm text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Market Cap</span>
                    </div>
                    <p className="text-3xl font-black text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                      {tokenData.pools?.[0]?.marketCap?.usd ? formatCurrency(tokenData.pools[0].marketCap.usd) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Market Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <FiArrowUp className="h-5 w-5 text-[#5B50E1]" />
                      <span className="text-sm text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Liquidity</span>
                    </div>
                    <p className="text-2xl font-black text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                      {tokenData.pools?.[0]?.liquidity?.usd ? formatCurrency(tokenData.pools[0].liquidity.usd) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <FiCopy className="h-5 w-5 text-[#5B50E1]" />
                      <span className="text-sm text-white/70 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Holders</span>
                    </div>
                    <p className="text-2xl font-black text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                      {tokenData.holders ? formatNumber(tokenData.holders) : 'N/A'}
                    </p>
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
            )}

            {/* Token Error */}
            {tokenData && tokenData.error && (
              <div className="bg-white/5 backdrop-blur-md border-2 border-red-500/30 rounded-3xl shadow-2xl p-10 text-center">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 mb-6">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-400 mb-4" style={{fontFamily:'Poppins,sans-serif'}}>Token Not Found</h3>
                <p className="text-white/70" style={{fontFamily:'Poppins,sans-serif'}}>{tokenData.error}</p>
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
            <h3 className="text-3xl font-bold text-white mb-4" style={{fontFamily:'Poppins,sans-serif'}}>Ready to Explore Solana</h3>
            <p className="text-white/70 text-lg max-w-md mx-auto" style={{fontFamily:'Poppins,sans-serif'}}>
              Enter a Solana token address above to view detailed analytics, market data, and ecosystem insights.
            </p>
          </div>
        )}

        {/* Trending Tokens (24h) */}
        <div className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl p-10">
          <h2 className="text-3xl font-black text-white tracking-wider flex items-center gap-3 mb-8" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.12em'}}>
            <span className="w-3 h-8 bg-[#3b0766] rounded-full inline-block"></span>
            TRENDING SOLANA TOKENS (24H)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(data.trendingTokens) && data.trendingTokens.length > 0 ? (
              data.trendingTokens.slice(0, 20).map((token: any) => (
                <div key={token.address} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all group cursor-pointer">
                  <div className="flex flex-col items-center text-center">
                    <img src={token.logoURI} alt={token.symbol} className="w-16 h-16 rounded-full mb-4 border-2 border-white/20 group-hover:border-[#5B50E1] transition-all shadow-lg" />
                    <h3 className="text-lg font-bold text-white mb-2" style={{fontFamily:'Poppins,sans-serif'}}>{token.name}</h3>
                    <span className="text-xs font-bold text-white/70 bg-white/10 px-3 py-1 rounded-full mb-3 uppercase tracking-wide" style={{fontFamily:'Poppins,sans-serif'}}>{token.symbol}</span>
                    <p className="text-xl font-black text-[#5B50E1] mb-2" style={{fontFamily:'Poppins,sans-serif'}}>${Number(token.price).toFixed(6)}</p>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      token.change24h > 0 ? 'bg-green-100 text-green-800' : 
                      token.change24h < 0 ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'
                    }`} style={{fontFamily:'Poppins,sans-serif'}}>
                      {token.change24h > 0 ? '+' : ''}{token.change24h?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-red-400 py-8">
                <p className="text-lg font-bold" style={{fontFamily:'Poppins,sans-serif'}}>
                  {data.trendingTokensError || 'No trending tokens data available.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
