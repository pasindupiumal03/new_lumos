'use client';

import { useEffect, useState } from 'react';
import { FiSearch, FiExternalLink, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../Sidebar';

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Format date
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function EthTrackerPage() {
  const [ethData, setEthData] = useState<any>(null);
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = async (walletAddress = '') => {
    setLoading(true);
    const res = await fetch(`/api/eth-tracker${walletAddress ? `?wallet=${walletAddress}` : ''}`);
    const data = await res.json();
    setEthData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Ethereum Tracker
              </h1>
              <div className="w-6"></div> {/* Spacer for flex alignment */}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 py-4 overflow-auto">
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-12 py-3 border border-border bg-card rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Enter Ethereum wallet address..."
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && wallet.trim() && fetchData(wallet)}
                disabled={loading}
              />
              <button
                onClick={() => wallet.trim() && fetchData(wallet)}
                disabled={!wallet.trim() || loading}
                className="absolute inset-y-0 right-0 px-4 flex items-center bg-primary text-white rounded-r-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : ethData ? (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Market Data Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Card */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">Ethereum Price</h3>
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {ethData.price ? formatCurrency(ethData.price) : 'N/A'}
                  </p>
                </div>

                {/* Market Cap Card */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">Market Cap</h3>
                    <div className="bg-purple-500/10 p-2 rounded-lg">
                      <svg className="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {ethData.marketCap ? `$${(ethData.marketCap / 1e9).toFixed(2)}B` : 'N/A'}
                  </p>
                </div>

                {/* 24h Volume Card */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">24h Volume</h3>
                    <div className="bg-green-500/10 p-2 rounded-lg">
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {ethData.volume ? `$${(ethData.volume / 1e9).toFixed(2)}B` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Gas Prices */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Gas Prices</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Slow</span>
                      <span className="text-sm text-yellow-500">
                        <FiClock className="inline mr-1" />
                        ~5m
                      </span>
                    </div>
                    <p className="mt-1 text-2xl font-bold">{ethData.gas?.SafeGasPrice || '--'} Gwei</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Average</span>
                      <span className="text-sm text-blue-500">
                        <FiClock className="inline mr-1" />
                        ~30s
                      </span>
                    </div>
                    <p className="mt-1 text-2xl font-bold">{ethData.gas?.ProposeGasPrice || '--'} Gwei</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Fast</span>
                      <span className="text-sm text-green-500">
                        <FiClock className="inline mr-1" />
                        ~15s
                      </span>
                    </div>
                    <p className="mt-1 text-2xl font-bold">{ethData.gas?.FastGasPrice || '--'} Gwei</p>
                  </div>
                </div>
              </div>

              {/* Wallet Data */}
              {ethData.walletData && (
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Wallet Details</h2>
                    <a 
                      href={`https://etherscan.io/address/${wallet}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center"
                    >
                      View on Etherscan <FiExternalLink className="ml-1" />
                    </a>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg mb-6">
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-2xl font-bold">
                      {(parseFloat(ethData.walletData.balance) / 1e18).toFixed(4)} ETH
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ≈ {formatCurrency((parseFloat(ethData.walletData.balance) / 1e18) * ethData.price)}
                    </p>
                  </div>

                  <h3 className="font-semibold mb-3">Recent Transactions</h3>
                  <div className="overflow-hidden border border-border rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/30">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Txn Hash
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              To
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                          {ethData.walletData.transactions.map((tx: any) => (
                            <tr key={tx.hash} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                                <a 
                                  href={`https://etherscan.io/tx/${tx.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center"
                                >
                                  {`${tx.hash.slice(0, 8)}...${tx.hash.slice(-6)}`}
                                  <FiExternalLink className="ml-1 opacity-70" size={12} />
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <a 
                                  href={`https://etherscan.io/address/${tx.to}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center"
                                >
                                  {`${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`}
                                  <FiExternalLink className="ml-1 opacity-70" size={12} />
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {(parseFloat(tx.value) / 1e18).toFixed(4)} ETH
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">No wallet data</h3>
              <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                Enter an Ethereum wallet address to view transaction history and balance
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
