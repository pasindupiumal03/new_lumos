'use client';

import TransactionSignature from './TransactionSignature';

import { useEffect, useState } from 'react';
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

export default function SolanaEcoPage() {
  const [data, setData] = useState<any>(null);
  const [wallet, setWallet] = useState('');
  const [walletData, setWalletData] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/solana-eco')
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error('Failed to load Solana data:', err));
  }, []);

  const handleWalletSearch = async () => {
    if (!wallet.trim()) return;
    setWalletLoading(true);
    setWalletError(null);
    setWalletData(null);
    try {
      const res = await fetch(`/api/solana-wallet?address=${wallet.trim()}`);
      const json = await res.json();
      if (!res.ok || json.error) {
        setWalletError(json.error || 'Failed to fetch wallet data');
      } else {
        setWalletData(json);
      }
    } catch (e: any) {
      setWalletError(e?.toString() || 'Unknown error');
    } finally {
      setWalletLoading(false);
    }
  };

  if (!data) return <div className="p-8">Loading...</div>;

  const chartData = {
    labels: Array.isArray(data.blocks)
      ? data.blocks.map((slot: number) => `#${slot}`)
      : [],
    datasets: [
      {
        label: 'Block Slots',
        data: Array.isArray(data.blocks)
          ? data.blocks.map((_, i: number) => i + 1)
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

      {/* Solana Wallet Search */}
      <div className="bg-gradient-to-br from-[#F3EFFF]/80 to-[#FFEBF5]/90 border-2 border-[#F1E3F6] rounded-3xl p-8 shadow-lg mb-8">

        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent uppercase tracking-tight mb-4" style={{letterSpacing:'0.04em',fontFamily:'Montserrat,sans-serif'}}>Solana Wallet Lookup</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
          <input
            type="text"
            className="flex-1 border-2 border-[#F1E3F6] bg-white/90 rounded-2xl px-6 py-4 text-lg font-medium focus:ring-2 focus:ring-[#FF1C8B]/40 focus:border-[#A259FF] transition-colors placeholder-[#A259FF]/70 shadow"
            placeholder="Enter Solana wallet address..."
            value={wallet}
            onChange={e => setWallet(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleWalletSearch()}
            disabled={walletLoading}
            style={{fontFamily:'Montserrat,sans-serif'}}
          />
          <button
            onClick={handleWalletSearch}
            disabled={!wallet.trim() || walletLoading}
            className="px-10 py-4 bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] text-white font-bold rounded-2xl text-lg shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{fontFamily:'Montserrat,sans-serif'}}
          >
            {walletLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {walletError && (
          <div className="text-red-600 text-sm mb-2">{walletError}</div>
        )}
        {walletData && (
          <div className="bg-gray-50 rounded-lg p-4 mt-2">
            <h3 className="font-bold mb-2">SOL Balance: <span className="text-primary">{walletData.balances.nativeBalance / 1e9} SOL</span></h3>
            <div className="mb-2">
              <h4 className="font-semibold mb-1">Token Balances:</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1 text-left">Logo</th>
                      <th className="px-2 py-1 text-left">Token</th>
                      <th className="px-2 py-1 text-left">Symbol</th>
                      <th className="px-2 py-1 text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletData.balances.tokens && walletData.balances.tokens.length > 0 ? (
  walletData.balances.tokens.map((tok: any) => (
    <tr key={tok.mint}>
      <td className="px-2 py-1">
        {tok.token?.image || tok.logoURI ? (
          <img src={tok.token?.image || tok.logoURI} alt={tok.token?.symbol || tok.symbol || ''} className="w-5 h-5 rounded-full" />
        ) : (
          <span className="inline-block w-5 h-5 rounded-full bg-gray-200" />
        )}
      </td>
      <td className="px-2 py-1">{tok.token?.name || tok.name || tok.mint}</td>
      <td className="px-2 py-1">{tok.token?.symbol || tok.symbol || ''}</td>
      <td className="px-2 py-1">{Number(tok.amount) / Math.pow(10, tok.decimals || 0)}</td>
    </tr>
  ))
                    ) : (
                      <tr><td colSpan={4} className="text-center text-gray-400">No tokens</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Recent Transactions:</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1 text-left">Signature</th>
                      <th className="px-2 py-1 text-left">Type</th>
                      <th className="px-2 py-1 text-left">Slot</th>
                      <th className="px-2 py-1 text-left">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletData.transactions && walletData.transactions.length > 0 ? (
                      walletData.transactions.slice(0, 10).map((tx: any) => (
                        <tr key={tx.signature}>
                          <td className="px-2 py-1 break-all max-w-[120px]">
  <TransactionSignature signature={tx.signature} />
</td>
                          <td className="px-2 py-1">{tx.type || '-'}</td>
                          <td className="px-2 py-1">{tx.slot}</td>
                          <td className="px-2 py-1">{tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="text-center text-gray-400">No transactions</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Price Info */}
      <div className="bg-gradient-to-br from-[#F3EFFF]/80 to-[#FFEBF5]/90 border-2 border-[#F1E3F6] rounded-3xl p-8 shadow-lg">
        <h2 className="text-xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent uppercase tracking-tight mb-4" style={{letterSpacing:'0.04em',fontFamily:'Montserrat,sans-serif'}}>SOL Price</h2>
        <p className="text-2xl font-mono">${data.price.usd?.toFixed(2)}</p>
        <p>Market Cap: ${Number(data.price.market_cap)?.toLocaleString()}</p>
        <p>Volume (24h): ${Number(data.price.volume_24h)?.toLocaleString()}</p>
      </div>

      {/* Epoch Info */}
      <div className="bg-gradient-to-br from-[#F3EFFF]/80 to-[#FFEBF5]/90 border-2 border-[#F1E3F6] rounded-3xl p-8 shadow-lg">
        <h2 className="text-xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent uppercase tracking-tight mb-4" style={{letterSpacing:'0.04em',fontFamily:'Montserrat,sans-serif'}}>Epoch Info</h2>
        <p>Current Epoch: {data.epoch.epoch}</p>
        <p>Slot Index: {data.epoch.slotIndex}</p>
        <p>Slots in Epoch: {data.epoch.slotsInEpoch}</p>
      </div>

      {/* TPS Chart */}
      <div className="bg-gradient-to-br from-[#F3EFFF]/80 to-[#FFEBF5]/90 border-2 border-[#F1E3F6] rounded-3xl p-8 shadow-lg">
        <h2 className="text-xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent uppercase tracking-tight mb-4" style={{letterSpacing:'0.04em',fontFamily:'Montserrat,sans-serif'}}>Live TPS</h2>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <Bar 
            data={tpsData} 
            options={{
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#A259FF',
                  titleFont: { family: 'Montserrat', weight: 'bold', size: 16 },
                  bodyFont: { family: 'Montserrat', size: 14 },
                  callbacks: {
                    label: (ctx: any) => `TPS: ${ctx.parsed.y}`
                  }
                }
              },
              elements: {
                bar: {
                  backgroundColor: (ctx: any) => {
                    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, '#FF1C8B');
                    gradient.addColorStop(1, '#A259FF');
                    return gradient;
                  }
                }
              },
              scales: {
                x: {
                  grid: { color: '#F1E3F6' },
                  ticks: { color: '#A259FF', font: { family: 'Montserrat', weight: 'bold', size: 14 } }
                },
                y: {
                  grid: { color: '#F1E3F6' },
                  ticks: { color: '#FF1C8B', font: { family: 'Montserrat', weight: 'bold', size: 14 } }
                }
              }
            }}
            height={120}
          />
        </div>
      </div>

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
