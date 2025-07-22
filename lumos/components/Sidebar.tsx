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
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <FaBitcoin className="w-8 h-8 text-yellow-500" />
              <FaEthereum className="w-6 h-6 -ml-2 text-purple-500" />
              <span className="ml-2 text-xl font-bold text-gray-900">Lumos</span>
            </div>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {tools.map((tool) => {
                const isActive = activeTool === tool.name || 
                  (tool.name !== 'dashboard' && pathname?.includes(tool.name));
                
                return (
                  <Link
                    key={tool.name}
                    href={`/tools/${tool.name === 'dashboard' ? '' : tool.name}`}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span
                      className={`mr-3 ${
                        isActive ? 'text-purple-500' : 'text-gray-400 group-hover:text-gray-500'
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
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-purple-100">
                  <span className="text-purple-600 font-medium">U</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">User</p>
                <Link
                  href="/settings"
                  className="text-xs font-medium text-gray-500 group-hover:text-gray-700"
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
