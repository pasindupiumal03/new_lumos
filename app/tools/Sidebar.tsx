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
import { FaEthereum } from 'react-icons/fa';
import { SiSolana } from 'react-icons/si';

const tools = [
  { id: "Dashboard", label: "Dashboard", href: "/tools/dashboard", icon: <FiHome className="w-5 h-5" /> },
  { id: "AI Chat", label: "AI Chat", href: "/tools/ai-chat", icon: <FiMessageSquare className="w-5 h-5" /> },
  { id: "MCP Server", label: "MCP Server", href: "/tools/mcp-server", icon: <FiServer className="w-5 h-5" /> },
  { id: "News Sentiment", label: "News Sentiment", href: "/tools/news-sentiment", icon: <FiTrendingUp className="w-5 h-5" /> },
  { id: "Twitter Tracker", label: "Twitter Tracker", href: "/tools/twitter-tracker", icon: <FiTwitter className="w-5 h-5" /> },
  { id: "ETH Tracker", label: "ETH Tracker", href: "/tools/eth-tracker", icon: <FaEthereum className="w-5 h-5" /> },
  { id: "Solana Eco", label: "Solana Eco", href: "/tools/solana-eco", icon: <SiSolana className="w-5 h-5" /> },
];

export default function Sidebar({ selected }: { selected: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-gray-900/95 backdrop-blur-lg border-r border-white/10 flex flex-col p-6 transition-all duration-300 z-40 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo and Close Button (mobile) */}
        <div className="flex items-center justify-between mb-10">
          <div className="pl-2">
            <span className="font-druk text-3xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              LUMOS
            </span>
            <p className="text-xs text-gray-400 mt-1 font-medium tracking-wider">TRADING INTELLIGENCE</p>
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
          className="flex items-center gap-3 mb-8 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
          onClick={handleLinkClick}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white">
            <span className="font-bold">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">Welcome Back</p>
            <p className="text-xs text-gray-400 truncate">Premium Member</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          {tools.map((tool) => (
            <Link href={tool.href} key={tool.id} legacyBehavior>
              <a
                onClick={handleLinkClick}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                  selected === tool.id
                    ? "bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-white shadow-lg border-l-4 border-pink-500"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${selected === tool.id ? 'text-pink-400' : 'text-gray-400'} transition-colors`}>
                    {tool.icon}
                  </span>
                  <span className="font-medium">{tool.label}</span>
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
        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <button 
              className="relative w-full bg-black/80 hover:bg-black text-white py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
              onClick={handleLinkClick}
            >
              <FiZap className="w-4 h-4" />
              Upgrade to Pro
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}