'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiCopy, FiDollarSign, FiTrendingUp, FiAlertTriangle, FiZap, FiUser, FiCircle } from 'react-icons/fi';
import { SiSolana } from "react-icons/si";
import { FaHandHoldingUsd, FaCoins, FaUserCheck, FaSearchDollar } from "react-icons/fa";
import { TbRosetteDiscountCheck } from "react-icons/tb";
import { LuWallet } from "react-icons/lu";
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
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8">
            <div className="text-center md:text-left">
              <h1 className="font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-wider text-white leading-tight drop-shadow-xl" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.15em'}}>
                WALLET <span className="text-[#ba9ecf]">LOOKUP</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-white/70 mt-3 sm:mt-4 max-w-2xl font-medium mx-auto md:mx-0" style={{fontFamily:'Poppins,sans-serif'}}>
                Search and analyze any Solana wallet address.<br className="hidden sm:block"/>
                <span className="sm:hidden"> </span>View token holdings, balances, and portfolio insights with real-time data.
              </p>
            </div>
          </div>
        </div>
        {/* Connected Wallet Section */}
        {connectedWallet && (
          <div className="mb-8">
            <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-3xl shadow-2xl p-6 overflow-hidden hover:shadow-[0_8px_32px_rgba(91,80,225,0.3)] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#5B50E1]/10 via-transparent to-[#8B5CF6]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/30 shadow-lg">
                    <FaUserCheck className="w-6 h-6 text-white/90" />
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
                  className="relative px-6 py-3 bg-gradient-to-r from-[#5B50E1]/80 to-[#8B5CF6]/80 backdrop-blur-xl border border-[#5B50E1]/30 text-white rounded-xl font-medium shadow-xl hover:shadow-[0_8px_32px_rgba(91,80,225,0.6)] hover:scale-105 transition-all duration-300 disabled:opacity-50 overflow-hidden group"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center">
                    <RiSearchEyeLine className="w-4 h-4 mr-2" />
                    View My Wallet
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="mb-8">
          <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-3xl shadow-2xl p-8 overflow-hidden hover:shadow-[0_8px_32px_rgba(91,80,225,0.3)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#5B50E1]/10 via-transparent to-[#8B5CF6]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3" style={{fontFamily: 'Poppins, sans-serif'}}>
                <div className="p-2 rounded-lg bg-gradient-to-r from-[#5B50E1]/30 to-[#8B5CF6]/30 backdrop-blur-sm border border-white/20 shadow-lg">
                  <FaSearchDollar className="w-6 h-6 text-white" />
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
                    className="w-full px-4 py-3 bg-white/15 backdrop-blur-xl border border-white/30 hover:border-white/40 focus:border-[#5B50E1]/60 rounded-xl text-white placeholder-white/50 focus:outline-none font-mono text-sm shadow-xl transition-all duration-300"
                    style={{fontFamily: 'Poppins, sans-serif'}}
                  />
                </div>
                <button
                  onClick={() => handleSearch()}
                  disabled={isLoading}
                  className="relative px-8 py-3 bg-gradient-to-r from-[#5B50E1]/80 to-[#8B5CF6]/80 backdrop-blur-xl border border-[#5B50E1]/30 text-white rounded-xl font-medium shadow-xl hover:shadow-[0_8px_32px_rgba(91,80,225,0.6)] hover:scale-105 transition-all duration-300 disabled:opacity-50 overflow-hidden group"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center">
                    <FiSearch className="w-4 h-4 mr-2" />
                    {isLoading ? 'Searching...' : 'Search'}
                  </span>
                </button>
              </div>

              {(error || apiError) && (
                <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-lg flex items-center gap-3 shadow-xl">
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
                      className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-xl p-4 shadow-xl hover:shadow-[0_8px_32px_rgba(91,80,225,0.3)] transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#5B50E1]/5 via-transparent to-[#8B5CF6]/5 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span 
                            className={`px-3 py-1 rounded-full text-xs font-medium border bg-gradient-to-r ${sample.color} backdrop-blur-sm shadow-lg`}
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
                            className="p-2 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 text-white/60 hover:text-white hover:bg-white/25 transition-all duration-200 shadow-lg"
                            title="Copy Address"
                          >
                            <FiCopy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleSearch(sample.address)}
                            disabled={isLoading}
                            className="relative px-4 py-2 bg-gradient-to-r from-[#5B50E1]/30 to-[#8B5CF6]/30 backdrop-blur-xl border border-[#5B50E1]/40 text-white rounded-lg font-medium shadow-lg hover:shadow-[0_8px_32px_rgba(91,80,225,0.4)] hover:scale-105 transition-all duration-300 disabled:opacity-50 overflow-hidden group"
                            style={{fontFamily: 'Poppins, sans-serif'}}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10 flex items-center">
                              <FiSearch className="w-3 h-3 mr-1" />
                              View
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mb-8">
            <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-3xl shadow-2xl p-8 text-center overflow-hidden hover:shadow-[0_8px_32px_rgba(91,80,225,0.3)] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#5B50E1]/10 via-transparent to-[#8B5CF6]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="animate-spin w-8 h-8 border-4 border-[#5B50E1]/30 border-t-[#5B50E1] rounded-full mx-auto mb-4"></div>
                <p className="text-white/70" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Analyzing wallet address...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Data */}
        {currentWallet && (walletInfo || tokensWithPrices.length > 0) && !isLoading && (
          <div className="space-y-8">
            {/* Wallet Overview */}
            <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-3xl shadow-2xl p-8 overflow-hidden hover:shadow-[0_8px_32px_rgba(91,80,225,0.3)] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#5B50E1]/10 via-transparent to-[#8B5CF6]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3" style={{fontFamily: 'Poppins, sans-serif'}}>
                    <div className="p-2 rounded-lg bg-gradient-to-r from-[#5B50E1]/30 to-[#8B5CF6]/30 backdrop-blur-sm border border-white/20 shadow-lg">
                      <LuWallet className="w-6 h-6 text-white" />
                    </div>
                    Wallet Overview
                  </h2>
                  <button
                    onClick={refetch}
                    disabled={isLoading}
                    className="relative px-4 py-2 bg-white/15 backdrop-blur-xl border border-white/30 text-white/70 rounded-lg hover:bg-white/25 hover:text-white transition-all duration-300 shadow-lg overflow-hidden group"
                    style={{fontFamily: 'Poppins, sans-serif'}}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center">
                      <FiSearch className="w-3 h-3 mr-2" />
                      Refresh
                    </span>
                  </button>
                </div>

                <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                  <p className="text-sm text-white/60 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>Wallet Address</p>
                  <div className="flex items-center gap-3">
                    <code className="text-white font-mono" style={{fontFamily: 'Poppins, sans-serif'}}>{currentWallet}</code>
                    <button
                      onClick={() => copyAddress(currentWallet)}
                      className="p-1 rounded text-white/60 hover:text-white hover:bg-white/15 backdrop-blur-sm transition-all duration-200"
                      title="Copy Address"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="group relative bg-gradient-to-br from-[#5B50E1]/20 to-[#8B5CF6]/20 backdrop-blur-xl border border-[#5B50E1]/30 rounded-xl p-6 shadow-xl hover:shadow-[0_8px_32px_rgba(91,80,225,0.4)] transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <FaCoins className="w-6 h-6 text-[#5B50E1]" />
                        <span className="font-medium text-white/80" style={{fontFamily: 'Poppins, sans-serif'}}>Total Value</span>
                      </div>
                      <p className="text-2xl font-bold text-white" style={{fontFamily: 'Poppins, sans-serif'}}>
                        {formatCurrency(totalValueUSD)}
                      </p>
                    </div>
                  </div>

                  <div className="group relative bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 shadow-xl hover:shadow-[0_8px_32px_rgba(147,51,234,0.4)] transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <TbRosetteDiscountCheck className="w-6 h-6 text-purple-400" />
                        <span className="font-medium text-white/80" style={{fontFamily: 'Poppins, sans-serif'}}>Token Count</span>
                      </div>
                      <p className="text-2xl font-bold text-white" style={{fontFamily: 'Poppins, sans-serif'}}>
                        {tokensWithPrices.length}
                      </p>
                    </div>
                  </div>

                  <div className="group relative bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6 shadow-xl hover:shadow-[0_8px_32px_rgba(59,130,246,0.4)] transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <SiSolana className="w-6 h-6 text-blue-400" />
                        <span className="font-medium text-white/80" style={{fontFamily: 'Poppins, sans-serif'}}>SOL Balance</span>
                      </div>
                      <p className="text-2xl font-bold text-white" style={{fontFamily: 'Poppins, sans-serif'}}>
                        {(walletInfo?.balance || 0).toFixed(4)} SOL
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Holdings */}
            <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-3xl shadow-2xl p-8 overflow-hidden hover:shadow-[0_8px_32px_rgba(91,80,225,0.3)] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#5B50E1]/10 via-transparent to-[#8B5CF6]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3" style={{fontFamily: 'Poppins, sans-serif'}}>
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#5B50E1]/30 to-[#8B5CF6]/30 backdrop-blur-sm border border-white/20 shadow-lg">
                    <FaHandHoldingUsd className="w-6 h-6 text-white" />
                  </div>
                  Token Holdings
                </h2>

                <div className="space-y-4">
                  {tokensWithPrices.length > 0 ? (
                    tokensWithPrices.map((token, index: number) => (
                      <div
                        key={token.mint}
                        className="group relative bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-xl p-4 shadow-xl hover:shadow-[0_8px_32px_rgba(91,80,225,0.3)] transition-all duration-300 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#5B50E1]/5 via-transparent to-[#8B5CF6]/5 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5B50E1]/30 to-[#8B5CF6]/30 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
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
                    <div className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-12 text-center shadow-xl hover:shadow-[0_8px_32px_rgba(91,80,225,0.3)] transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#5B50E1]/10 via-transparent to-[#8B5CF6]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div className="p-4 rounded-full bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-sm w-fit mx-auto mb-4 border border-white/20 shadow-lg">
                          <FaHandHoldingUsd className="w-12 h-12 text-white/50" />
                        </div>
                        <p className="text-white/60" style={{fontFamily: 'Poppins, sans-serif'}}>
                          No tokens found in this wallet
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
