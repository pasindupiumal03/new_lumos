'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiCopy, FiDollarSign, FiTrendingUp, FiAlertTriangle, FiZap, FiUser, FiCircle } from 'react-icons/fi';
import { RiSearchEyeLine } from 'react-icons/ri';
import Sidebar from '../Sidebar';
import { useWalletData } from '../../../hooks/use-wallet-data';

// Sample addresses for demonstration
const SAMPLE_ADDRESSES = [
  {
    address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    label: "Popular Trader",
    type: "high-value",
    color: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400"
  },
  {
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", 
    label: "DEX Trader",
    type: "active",
    color: "from-green-500/20 to-green-600/20 border-green-500/30 text-green-400"
  },
  {
    address: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
    label: "Token Holder",
    type: "diversified", 
    color: "from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400"
  }
];

export default function WalletLookupPage() {
  const [searchAddress, setSearchAddress] = useState('');
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);

  // Use the real wallet data hook
  const { walletInfo, tokensWithPrices, totalValueUSD, isLoading, error: apiError, refetch } = useWalletData(currentWallet || undefined);
  const [error, setError] = useState('');

  // Check for connected Phantom wallet
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const { solana } = window as any;
        if (solana && solana.isPhantom) {
          const response = await solana.connect({ onlyIfTrusted: true });
          if (response.publicKey) {
            setConnectedWallet(response.publicKey.toString());
          }
        }
      } catch (error) {
        console.log('No wallet connected');
      }
    };
    checkWallet();
  }, []);

  const validateSolanaAddress = (addr: string): boolean => {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(addr);
  };

  const handleSearch = async (address?: string) => {
    const addressToSearch = address || searchAddress;
    setError('');

    if (!addressToSearch.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    if (!validateSolanaAddress(addressToSearch.trim())) {
      setError('Invalid Solana wallet address format');
      return;
    }

    setCurrentWallet(addressToSearch.trim());
  };

  const handleConnectedWallet = () => {
    if (connectedWallet) {
      handleSearch(connectedWallet);
      setSearchAddress(connectedWallet);
    }
  };

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatTokenAmount = (amount: number) => {
    if (amount < 0.01) {
      return amount.toExponential(4);
    }
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  return (
    <div className="flex min-h-screen custom-gradient">
      <Sidebar selected="Wallet Lookup" />
      
      <main className="flex-1 p-8 overflow-auto fadeIn">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-black mb-4 text-white" style={{fontFamily: 'Impact, sans-serif'}}>
            WALLET LOOKUP
          </h1>
          <p className="text-xl text-white/70 max-w-3xl" style={{fontFamily: 'Poppins, sans-serif'}}>
            Search and analyze any Solana wallet address. View token holdings, balances, and portfolio insights with real-time data powered by SolanaTracker API.
          </p>
        </div>

        {/* Connected Wallet Section */}
        {connectedWallet && (
          <div className="mb-8">
            <div className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <FiUser className="w-6 h-6 text-white/80" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1" style={{fontFamily: 'Poppins, sans-serif'}}>My Connected Wallet</h3>
                    <code className="text-sm text-white/70 font-mono" style={{fontFamily: 'Poppins, sans-serif'}}>
                      {formatAddress(connectedWallet)}
                    </code>
                  </div>
                </div>
                <button
                  onClick={handleConnectedWallet}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-[#5B50E1] to-[#8B5CF6] text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  <RiSearchEyeLine className="w-4 h-4 mr-2 inline" />
                  View My Wallet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3" style={{fontFamily: 'Poppins, sans-serif'}}>
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#5B50E1]/20 to-[#8B5CF6]/20">
                <FiSearch className="w-6 h-6 text-[#5B50E1]" />
              </div>
              Search Any Wallet
            </h2>
            
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter Solana wallet address..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-[#5B50E1] focus:outline-none font-mono text-sm"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-[#5B50E1] to-[#8B5CF6] text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                <FiSearch className="w-4 h-4 mr-2 inline" />
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {(error || apiError) && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
                <FiAlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-300" style={{fontFamily: 'Poppins, sans-serif'}}>{error || apiError}</span>
              </div>
            )}

            {/* Sample Addresses */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FiZap className="w-4 h-4 text-[#5B50E1]" />
                <span className="text-sm font-medium text-white/70" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Try these sample wallets:
                </span>
              </div>
              
              <div className="grid gap-3">
                {SAMPLE_ADDRESSES.map((sample, index) => (
                  <div
                    key={sample.address}
                    className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:border-[#5B50E1]/50 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-medium border bg-gradient-to-r ${sample.color}`}
                        style={{fontFamily: 'Poppins, sans-serif'}}
                      >
                        {sample.label}
                      </span>
                      <code className="text-sm font-mono text-white/70 group-hover:text-white transition-colors" style={{fontFamily: 'Poppins, sans-serif'}}>
                        {formatAddress(sample.address)}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyAddress(sample.address)}
                        className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all duration-200"
                        title="Copy Address"
                      >
                        <FiCopy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleSearch(sample.address)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gradient-to-r from-[#5B50E1]/20 to-[#8B5CF6]/20 text-[#5B50E1] rounded-lg font-medium hover:from-[#5B50E1]/30 hover:to-[#8B5CF6]/30 transition-all duration-200 disabled:opacity-50"
                        style={{fontFamily: 'Poppins, sans-serif'}}
                      >
                        <FiSearch className="w-3 h-3 mr-1 inline" />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mb-8">
            <div className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-[#5B50E1]/30 border-t-[#5B50E1] rounded-full mx-auto mb-4"></div>
              <p className="text-white/70" style={{fontFamily: 'Poppins, sans-serif'}}>
                Analyzing wallet address...
              </p>
            </div>
          </div>
        )}

        {/* Wallet Data */}
        {currentWallet && (walletInfo || tokensWithPrices.length > 0) && !isLoading && (
          <div className="space-y-8">
            {/* Wallet Overview */}
            <div className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3" style={{fontFamily: 'Poppins, sans-serif'}}>
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#5B50E1]/20 to-[#8B5CF6]/20">
                    <FiUser className="w-6 h-6 text-[#5B50E1]" />
                  </div>
                  Wallet Overview
                </h2>
                <button
                  onClick={refetch}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 hover:text-white transition-all duration-200"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  <FiSearch className="w-3 h-3 mr-2 inline" />
                  Refresh
                </button>
              </div>

              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm text-white/60 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>Wallet Address</p>
                <div className="flex items-center gap-3">
                  <code className="text-white font-mono" style={{fontFamily: 'Poppins, sans-serif'}}>{currentWallet}</code>
                  <button
                    onClick={() => copyAddress(currentWallet)}
                    className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                    title="Copy Address"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[#5B50E1]/10 to-[#8B5CF6]/10 border border-[#5B50E1]/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <FiDollarSign className="w-6 h-6 text-[#5B50E1]" />
                    <span className="font-medium text-white/80" style={{fontFamily: 'Poppins, sans-serif'}}>Total Value</span>
                  </div>
                  <p className="text-2xl font-bold text-white" style={{fontFamily: 'Poppins, sans-serif'}}>
                    {formatCurrency(totalValueUSD)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <FiCircle className="w-6 h-6 text-purple-400" />
                    <span className="font-medium text-white/80" style={{fontFamily: 'Poppins, sans-serif'}}>Token Count</span>
                  </div>
                  <p className="text-2xl font-bold text-white" style={{fontFamily: 'Poppins, sans-serif'}}>
                    {tokensWithPrices.length}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <FiTrendingUp className="w-6 h-6 text-blue-400" />
                    <span className="font-medium text-white/80" style={{fontFamily: 'Poppins, sans-serif'}}>SOL Balance</span>
                  </div>
                  <p className="text-2xl font-bold text-white" style={{fontFamily: 'Poppins, sans-serif'}}>
                    {(walletInfo?.balance || 0).toFixed(4)} SOL
                  </p>
                </div>
              </div>
            </div>

            {/* Token Holdings */}
            <div className="bg-white/5 backdrop-blur-md border-2 border-t-white/30 border-r-white/10 border-b-white/10 border-l-white/10 rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3" style={{fontFamily: 'Poppins, sans-serif'}}>
                <div className="p-2 rounded-lg bg-gradient-to-r from-[#5B50E1]/20 to-[#8B5CF6]/20">
                  <FiCircle className="w-6 h-6 text-[#5B50E1]" />
                </div>
                Token Holdings
              </h2>

              <div className="space-y-4">
                {tokensWithPrices.length > 0 ? (
                  tokensWithPrices.map((token, index: number) => (
                    <div
                      key={token.mint}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#5B50E1]/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5B50E1]/20 to-[#8B5CF6]/20 flex items-center justify-center border border-white/20">
                            {token.logoURI ? (
                              <img
                                src={token.logoURI}
                                alt={token.symbol}
                                className="w-8 h-8 rounded-full"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <span 
                              className={`text-white font-bold ${token.logoURI ? 'hidden' : ''}`} 
                              style={{fontFamily: 'Poppins, sans-serif'}}
                            >
                              {token.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-white" style={{fontFamily: 'Poppins, sans-serif'}}>{token.symbol}</h3>
                            <p className="text-sm text-white/60" style={{fontFamily: 'Poppins, sans-serif'}}>{token.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white" style={{fontFamily: 'Poppins, sans-serif'}}>
                            {formatTokenAmount(token.uiAmount)}
                          </p>
                          <p className="text-sm text-white/60" style={{fontFamily: 'Poppins, sans-serif'}}>
                            {formatCurrency(token.valueUSD)}
                          </p>
                          {token.price > 0 && (
                            <p className="text-xs text-white/50" style={{fontFamily: 'Poppins, sans-serif'}}>
                              @ {formatCurrency(token.price)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : currentWallet && !isLoading ? (
                  <div className="text-center py-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                    <div className="p-4 rounded-full bg-gradient-to-r from-white/10 to-white/5 w-fit mx-auto mb-4">
                      <FiCircle className="w-12 h-12 text-white/50" />
                    </div>
                    <p className="text-white/60" style={{fontFamily: 'Poppins, sans-serif'}}>
                      No tokens found in this wallet
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
