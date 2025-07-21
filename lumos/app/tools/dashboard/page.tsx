import Sidebar from "../Sidebar";
import React from "react";
import { FiRefreshCw, FiArrowUp, FiArrowDown, FiExternalLink } from "react-icons/fi";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiRipple } from "react-icons/si";

// Mock data with enhanced structure
const mockNews = [
  {
    id: 1,
    title: "Bitcoin Holds Above $60K Amid Macro Tailwinds",
    summary: "Bitcoin is trading at $61,800 (24h +1.6%). For the day, key metrics were higher. Softer-than-expected U.S. inflation and approval of spot bitcoin ETFs are supporting bullish outlook.",
    time: "24 minutes ago",
    sentiment: "Bearish",
    icon: <FaBitcoin className="w-5 h-5 text-orange-500" />,
    change: -1.2,
    tags: ["Bitcoin", "Market"]
  },
  {
    id: 2,
    title: "Ethereum Sees Bullish Momentum Despite Minor Pullback",
    summary: "Ethereum is at $3,217 (+2.1%). Bulls have recently gained upper hand by resistance on strong institutional demand and ETF interest.",
    time: "1 hour ago",
    sentiment: "Neutral",
    icon: <FaEthereum className="w-5 h-5 text-purple-500" />,
    change: 2.1,
    tags: ["Ethereum", "ETF"]
  },
  {
    id: 3,
    title: "XRP Pops As Legal and Bill Developments Loom",
    summary: "XRP is at 1.26 (+3.2%), outperforming peers as attention shifts to upcoming SEC court filings and EU approval prospects.",
    time: "2 hours ago",
    sentiment: "Bullish",
    icon: <SiRipple className="w-5 h-5 text-blue-500" />,
    change: 3.2,
    tags: ["XRP", "Regulation"]
  },
];

const mockCoins = [
  { id: 1, name: "AVATAR", price: "$0.000051", change: 12.5, address: "0x...avatar", since: "6 Nov", volume: "$2.1M" },
  { id: 2, name: "BBQ CHAIN", price: "$0.000051", change: 8.3, address: "0x...bbq", since: "6 Nov", volume: "$1.8M" },
  { id: 3, name: "Money Monkey", price: "$0.000049", change: -2.4, address: "0x...monkey", since: "6 Nov", volume: "$1.5M" },
  { id: 4, name: "Degensquad", price: "$0.000044", change: 5.7, address: "0x...degen", since: "6 Nov", volume: "$1.2M" },
  { id: 5, name: "TRIUMPHCHAIN", price: "$0.000045", change: 15.2, address: "0x...triumph", since: "6 Nov", volume: "$980K" },
  { id: 6, name: "The seat of SOL", price: "$0.000043", change: -3.1, address: "0x...sol", since: "6 Nov", volume: "$850K" },
];

const stats = [
  { id: 1, label: "Total Coins", value: "12,345", change: 2.1, icon: "📊" },
  { id: 2, label: "Market Cap", value: "$2.1T", change: 1.8, icon: "💎" },
  { id: 3, label: "24h Volume", value: "$65B", change: -0.5, icon: "📈" },
  { id: 4, label: "BTC Dominance", value: "48.2%", change: -0.8, icon: "₿" },
  { id: 5, label: "Market Sentiment", value: "Neutral", change: 0, icon: "🌡️" },
];

const SentimentBadge = ({ sentiment }: { sentiment: string }) => {
  const colors = {
    Bullish: "bg-green-100 text-green-800",
    Bearish: "bg-red-100 text-red-800",
    Neutral: "bg-blue-100 text-blue-800"
  };
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[sentiment as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
      {sentiment}
    </span>
  );
};

const PriceChange = ({ change }: { change: number }) => {
  const isPositive = change >= 0;
  return (
    <span className={`inline-flex items-center text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
      {isPositive ? <FiArrowUp className="mr-0.5" /> : <FiArrowDown className="mr-0.5" />}
      {Math.abs(change)}%
    </span>
  );
};

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar selected="Dashboard" />
      
      <main className="flex-1 p-6 overflow-auto">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-druk text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
                Market Dashboard
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Real-time insights and analytics for informed trading decisions. Track market movements and discover opportunities.
              </p>
            </div>
            <div className="hidden md:block">
              <button className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                <FiRefreshCw className="w-4 h-4" />
                Refresh Data
              </button>
            </div>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mt-4 mb-6" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((stat) => (
            <div 
              key={stat.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-sm hover:shadow-md transition-all duration-300 hover:border-pink-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
              <div className="mt-3">
                <PriceChange change={stat.change} />
                <span className="text-xs text-gray-500 ml-2">vs yesterday</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Market News */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Market News & Updates</h2>
                <button className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1">
                  <FiRefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
              
              <div className="space-y-6">
                {mockNews.map((news) => (
                  <div 
                    key={news.id}
                    className="group p-4 -mx-4 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {news.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                            {news.title}
                          </h3>
                          <SentimentBadge sentiment={news.sentiment} />
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {news.summary}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {news.tags.map((tag, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{news.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Coins */}
          <div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Trending Coins</h2>
                <button className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1">
                  View All
                  <FiExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {mockCoins.map((coin) => (
                  <div 
                    key={coin.id}
                    className="group p-4 -mx-4 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-pink-600 font-bold">
                          {coin.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                            {coin.name}
                          </h3>
                          <p className="text-xs text-gray-500">{coin.since}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{coin.price}</p>
                        <PriceChange change={coin.change} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        <div className="text-gray-400 text-xxs">Volume (24h)</div>
                        <div>{coin.volume}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-400 text-xxs">Address</div>
                        <div className="font-mono">{coin.address}</div>
                      </div>
                      <button className="text-xs text-pink-600 hover:text-pink-700 flex items-center gap-1">
                        Trade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="max-w-xl">
              <h3 className="text-xl font-bold mb-2">Get Started with Advanced Features</h3>
              <p className="text-pink-100 text-sm">
                Unlock premium tools, real-time alerts, and advanced analytics to take your trading to the next level.
              </p>
            </div>
            <button className="mt-4 md:mt-0 bg-white text-pink-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}