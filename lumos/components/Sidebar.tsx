'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiTrendingUp, FiBell, FiBookmark, FiSettings, FiTwitter } from 'react-icons/fi';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';

interface SidebarProps {
  activeTool?: string;
}

const tools = [
  { name: 'dashboard', icon: <FiHome className="w-5 h-5" />, label: 'Dashboard' },
  { name: 'twitter-tracker', icon: <FiTwitter className="w-5 h-5" />, label: 'Twitter Tracker' },
  { name: 'news-sentiment', icon: <FiTrendingUp className="w-5 h-5" />, label: 'News Sentiment' },
  { name: 'ai-chat', icon: <FiBell className="w-5 h-5" />, label: 'AI Chat' },
  { name: 'watchlist', icon: <FiBookmark className="w-5 h-5" />, label: 'Watchlist' },
  { name: 'settings', icon: <FiSettings className="w-5 h-5" />, label: 'Settings' },
];

export default function Sidebar({ activeTool = 'dashboard' }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-gradient-to-br from-[#FFEBF5]/90 via-[#F3EFFF]/80 to-white/80 border-r-2 border-[#F1E3F6] backdrop-blur-xl rounded-3xl m-4 shadow-2xl">
        <div className="flex flex-col flex-grow pt-8 pb-6 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6 mb-6">
            <div className="flex items-center">
              <FaBitcoin className="w-9 h-9 text-[#FFB800] drop-shadow" />
              <FaEthereum className="w-7 h-7 -ml-2 text-[#A259FF] drop-shadow" />
              <span className="ml-3 text-2xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent tracking-tight" style={{fontFamily:'Montserrat,Druk,sans-serif',letterSpacing:'0.03em'}}>Lumos</span>
            </div>
          </div>
          <div className="mt-2 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-2">
              {tools.map((tool) => {
                const isActive = activeTool === tool.name || 
                  (tool.name !== 'dashboard' && pathname?.includes(tool.name));
                
                return (
                  <Link
                    key={tool.name}
                    href={`/tools/${tool.name === 'dashboard' ? '' : tool.name}`}
                    className={`group flex items-center px-4 py-3 text-base font-bold rounded-2xl transition-all duration-150 shadow-none tracking-wide ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FFEBF5] to-[#A259FF]/10 text-[#A259FF] shadow-lg scale-105'
                        : 'text-[#232323] hover:bg-gradient-to-r hover:from-[#F3EFFF] hover:to-[#FFEBF5] hover:text-[#FF1C8B] hover:scale-105'
                    }`}
                    style={{fontFamily:'Montserrat,Druk,sans-serif',letterSpacing:'0.03em'}}
                  >
                    <span
                      className={`mr-4 text-lg transition-all duration-150 ${
                        isActive ? 'text-[#FF1C8B] drop-shadow' : 'text-[#A259FF] group-hover:text-[#FF1C8B]'
                      }`}
                    >
                      {tool.icon}
                    </span>
                    {tool.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="flex-shrink-0 flex border-t-2 border-[#F1E3F6] p-6 mt-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-tr from-[#FFEBF5] to-[#A259FF]/30 shadow-lg border-2 border-[#F1E3F6]">
                  <span className="text-[#FF1C8B] font-extrabold text-lg" style={{fontFamily:'Montserrat,Druk,sans-serif'}}>U</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-base font-bold text-[#232323] group-hover:text-[#A259FF]" style={{fontFamily:'Montserrat,Druk,sans-serif'}}>User</p>
                <Link
                  href="/settings"
                  className="text-xs font-semibold text-[#A259FF] group-hover:text-[#FF1C8B] transition-colors"
                  style={{fontFamily:'Montserrat,sans-serif'}}
                >
                  View profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
