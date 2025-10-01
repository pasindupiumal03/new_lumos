'use client';

import TransactionSignature from './TransactionSignature';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiSearch } from 'react-icons/fi';
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
    <div className="flex min-h-screen bg-gradient-to-br from-white via-[#FFEBF5] to-[#F3EFFF] font-[Montserrat,sans-serif] text-[#232323]">
      <Sidebar selected="Solana Eco" />
      <main className="flex-1 p-10 md:p-16 space-y-10 overflow-auto bg-gradient-to-br from-white via-[#FFEBF5] to-[#F3EFFF] min-h-screen">

      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent uppercase drop-shadow-lg tracking-tight mb-8" style={{letterSpacing:'0.04em',fontFamily:'Montserrat,sans-serif'}}>Solana Eco Dashboard</h1>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative rounded-2xl shadow-lg">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="h-6 w-6 text-[#A259FF]" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-32 py-4 border-2 border-[#F1E3F6] bg-white/90 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-[#FF1C8B]/40 focus:border-[#A259FF] transition-colors placeholder-[#A259FF]/70"
            placeholder="Enter Solana token address..."
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && tokenAddress.trim() && fetchTokenData(tokenAddress)}
            disabled={tokenLoading}
            style={{fontFamily:'Montserrat,sans-serif'}}
          />
          <button
            onClick={() => tokenAddress.trim() && fetchTokenData(tokenAddress)}
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
      ) : data ? (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Token Details */}
          {tokenData && !tokenData.error && (
            <Card className="glass-card border-primary/30 glow-primary mt-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-sm"></div>
                      {tokenData.token?.image ? (
                        <Image
                          src={tokenData.token.image}
                          alt={tokenData.token.name}
                          width={48}
                          height={48}
                          className="rounded-full relative z-10 border-2 border-primary/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full relative z-10 border-2 border-primary/30 bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {tokenData.token?.symbol?.slice(0, 2) || "??"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="gradient-text text-xl font-bold">{tokenData.token?.name}</h3>
                      <p className="text-sm text-muted-foreground">{tokenData.token?.symbol}</p>
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
                        <span className="text-sm text-muted-foreground">Current Price</span>
                      </div>
                      <p className="text-2xl font-bold gradient-text">
                        {tokenData.pools?.[0]?.price?.usd ? `$${Number(tokenData.pools[0].price.usd).toFixed(8)}` : 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">24h Change</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`text-lg font-semibold ${
                          tokenData.events?.['24h']?.priceChangePercentage > 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}>
                          {tokenData.events?.['24h']?.priceChangePercentage
                            ? `${tokenData.events['24h'].priceChangePercentage > 0 ? '+' : ''}${tokenData.events['24h'].priceChangePercentage.toFixed(2)}%`
                            : 'N/A'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">Market Cap</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">
                        {tokenData.pools?.[0]?.marketCap?.usd ? formatCurrency(tokenData.pools[0].marketCap.usd) : 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Market Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="glass-card border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">Liquidity</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">
                        {tokenData.pools?.[0]?.liquidity?.usd ? formatCurrency(tokenData.pools[0].liquidity.usd) : 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">Holders</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">
                        {tokenData.holders ? formatNumber(tokenData.holders) : 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="default"
                    onClick={() => window.open(`https://solscan.io/token/${tokenData.token?.mint}`, '_blank')}
                    className="glass-button hover:glow-primary bg-gradient-to-r from-primary/20 to-accent/20 flex-1"
                  >
                    View on Solscan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(tokenData.token?.mint || '')}
                    className="glass-button hover:glow-accent"
                  >
                    Copy Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Token Error */}
          {tokenData && tokenData.error && (
            <div className="bg-card border border-red-200 rounded-xl p-6 shadow-sm">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-600 mb-2">Token Not Found</h3>
                <p className="text-muted-foreground">{tokenData.error}</p>
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
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent uppercase drop-shadow-lg tracking-tight" style={{letterSpacing:'0.04em',fontFamily:'Montserrat,sans-serif'}}>Solana Token Tracker</h3>
          <p className="text-muted-foreground mt-1 max-w-md mx-auto">
            Enter a Solana token address to view detailed token information, or browse trending tokens below
          </p>
        </div>
      )}

      {/* Trending Tokens (24h) */}
      <div className="bg-gradient-to-br from-[#F3EFFF]/80 to-[#FFEBF5]/90 border-2 border-[#F1E3F6] rounded-3xl p-8 shadow-lg">
        <h2 className="text-xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent uppercase tracking-tight mb-4" style={{letterSpacing:'0.04em',fontFamily:'Montserrat,sans-serif'}}>Trending Solana Tokens (24h)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.isArray(data.trendingTokens) && data.trendingTokens.length > 0 ? (
            data.trendingTokens.slice(0, 20).map((token: any) => (
              <div key={token.address} className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center hover:scale-105 transition-transform border-2 border-[#F1E3F6] group">
                <img src={token.logoURI} alt={token.symbol} className="w-12 h-12 rounded-full mb-2 border-4 border-[#FFEBF5] group-hover:border-[#FF1C8B] transition-all" />
                <span className="text-lg font-bold text-[#232323] mb-1" style={{fontFamily:'Montserrat,sans-serif'}}>{token.name}</span>
                <span className="text-xs font-semibold text-[#A259FF] bg-[#F3EFFF] px-2 py-1 rounded-full mb-2 uppercase tracking-wide">{token.symbol}</span>
                <span className="text-xl font-extrabold text-[#FF1C8B]">${Number(token.price).toFixed(6)}</span>
                <span className={`text-sm font-mono mt-1 ${token.change24h > 0 ? 'text-green-600' : token.change24h < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {token.change24h > 0 ? '+' : ''}{token.change24h?.toFixed(2)}%
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-red-600 py-4">
              {data.trendingTokensError || 'No trending tokens data available.'}
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
);
}
