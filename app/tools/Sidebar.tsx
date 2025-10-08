"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FiHome, 
  FiMessageSquare, 
  FiServer, 
  FiTrendingUp, 
  FiTwitter, 
  FiZap, 
  FiMenu, 
  FiX,
  FiChevronRight
} from "react-icons/fi";
import { FaEthereum, FaSearchDollar } from 'react-icons/fa';
import { SiSolana } from 'react-icons/si';
import { LogOut, Lock } from 'lucide-react';

const tools = [
  { id: "Dashboard", label: "Dashboard", href: "/tools/dashboard", icon: <FiHome className="w-5 h-5" /> },
  { id: "AI Chat", label: "AI Chat", href: "/tools/ai-chat", icon: <FiMessageSquare className="w-5 h-5" /> },
  { id: "News Sentiment", label: "News Sentiment", href: "/tools/news-sentiment", icon: <FiTrendingUp className="w-5 h-5" /> },
  { id: "ETH Tracker", label: "ETH Tracker", href: "/tools/eth-tracker", icon: <FaEthereum className="w-5 h-5" /> },
  { id: "Solana Eco", label: "Solana Eco", href: "/tools/solana-eco", icon: <SiSolana className="w-5 h-5" /> },
  { id: "Wallet Lookup", label: "Wallet Lookup", href: "/tools/wallet-lookup", icon: <FaSearchDollar className="w-5 h-5" /> },
];

export default function Sidebar({ selected }: { selected: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // Initial check
    checkIfMobile();
    // Check wallet connection
    checkIfWalletIsConnected();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window as any;
      if (solana && solana.isPhantom) {
        const response = await solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          setWalletAddress(response.publicKey.toString());
        }
      }
    } catch (error) {
      console.log('No wallet found or not connected');
    }
  };

  const connectWallet = async () => {
    const { solana } = window as any;
    
    if (!solana || !solana.isPhantom) {
      alert('Phantom wallet is not installed. Please install it from https://phantom.app/');
      return;
    }

    try {
      setIsConnecting(true);
      const response = await solana.connect();
      setWalletAddress(response.publicKey.toString());
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    const { solana } = window as any;
    
    try {
      if (solana && solana.isPhantom) {
        await solana.disconnect();
      }
      setWalletAddress(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Close sidebar when a link is clicked on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={toggleSidebar}
        className="fixed bottom-6 right-6 lg:hidden z-50 w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg flex items-center justify-center"
        aria-label="Toggle menu"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col p-6 transition-all duration-300 z-40 overflow-y-auto scrollbar-hide shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo and Close Button (mobile) */}
        <div className="flex items-center justify-between mb-10">
          <div className="pl-2">
            <span className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent" style={{fontFamily: 'Impact, sans-serif'}}>
              LUMOS
            </span>
            <p className="text-xs text-white/60 mt-1 font-medium tracking-wider" style={{fontFamily: 'Poppins, sans-serif'}}>TRADING INTELLIGENCE</p>
          </div>
          <button 
            onClick={toggleSidebar}
            className="lg:hidden text-gray-400 hover:text-white p-2 -mr-2"
            aria-label="Close menu"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* User Profile */}
        <div 
          className="flex items-center gap-3 mb-8 p-3 rounded-xl bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 cursor-pointer border border-white/10"
          onClick={handleLinkClick}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate" style={{fontFamily: 'Poppins, sans-serif'}}>Free Plan</p>
            <p className="text-xs text-white/60 truncate" style={{fontFamily: 'Poppins, sans-serif'}}>Early Access Member</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-sm"></div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          {tools.map((tool) => (
            <Link href={tool.href} key={tool.id} legacyBehavior>
              <a
                onClick={handleLinkClick}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                  selected === tool.id
                    ? "bg-white/10 backdrop-blur-md text-white shadow-lg border border-white/20 hover:shadow-[0_0_20px_rgba(91,80,225,0.3)]"
                    : "text-white/70 hover:bg-white/5 hover:backdrop-blur-md hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${selected === tool.id ? 'text-pink-400' : 'text-white/60'} transition-colors`}>
                    {tool.icon}
                  </span>
                  <span className="font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>{tool.label}</span>
                </div>
                <div className="flex items-center">
                  {selected === tool.id && (
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse mr-2"></span>
                  )}
                  <FiChevronRight className="text-gray-500 text-sm group-hover:text-white transition-colors" />
                </div>
              </a>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-lg">
            {walletAddress ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-white text-xs font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>Connected</span>
                  </div>
                  <button 
                    onClick={disconnectWallet}
                    className="p-1.5 rounded-md bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:scale-105 transition-all duration-200"
                    title="Disconnect Wallet"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
                <div className="px-3 py-2 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-center">
                  <span className="text-white text-sm font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>
                    {formatAddress(walletAddress)}
                  </span>
                </div>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                <FiZap className="w-4 h-4" />
                {isConnecting ? 'Connecting...' : 'Connect Phantom'}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}