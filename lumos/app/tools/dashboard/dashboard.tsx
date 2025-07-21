import Sidebar from "../Sidebar";
import React from "react";

const mockNews = [
  {
    title: "Bitcoin Holds Above $60K Amid Macro Tailwinds",
    summary: "Bitcoin is trading at $61,800 (24h +1.6%). For the day, key metrics were higher. Softer-than-expected U.S. inflation and approval of spot bitcoin ETFs are supporting bullish outlook. Analysts see upside risk in short term, with resistance at $65k.",
    time: "24 minutes ago",
    sentiment: "Bearish Sentiment",
  },
  {
    title: "Ethereum Sees Bullish Momentum Despite Minor Pullback",
    summary: "Ethereum is at $3,217 (+2.1%). Bulls have recently gained upper hand by resistance on strong institutional demand and ETF interest. The week ahead could see volatility, with support at $3,000 and resistance at $3,400.",
    time: "1 hour ago",
    sentiment: "Neutral",
  },
  {
    title: "XRP Pops As Legal and Bill Developments Loom",
    summary: "XRP is at 1.26 (+3.2%), outperforming peers as attention shifts to upcoming SEC court filings and EU approval prospects. Technicals/wealth managers see upside, but whales remain targeting a potential breakout if regulatory clarity improves.",
    time: "2 hours ago",
    sentiment: "Bullish Sentiment",
  },
];

const mockCoins = [
  { name: "AVATAR", price: "$0.000051", address: "0x...avatar", since: "6 Nov" },
  { name: "BBQ CHAIN", price: "$0.000051", address: "0x...bbq", since: "6 Nov" },
  { name: "Money Monkey", price: "$0.000049", address: "0x...monkey", since: "6 Nov" },
  { name: "Degensquad", price: "$0.000044", address: "0x...degen", since: "6 Nov" },
  { name: "TRIUMPHCHAIN", price: "$0.000045", address: "0x...triumph", since: "6 Nov" },
  { name: "The seat of SOL", price: "$0.000043", address: "0x...sol", since: "6 Nov" },
  { name: "Spa & Auto", price: "$0.000043", address: "0x...spa", since: "6 Nov" },
  { name: "Evmsoon", price: "$0.000042", address: "0x...evm", since: "6 Nov" },
  { name: "Evil Pepe", price: "$0.000041", address: "0x...pepe", since: "6 Nov" },
  { name: "Oracle Finance Network", price: "$0.000041", address: "0x...oracle", since: "6 Nov" },
  { name: "AI Right", price: "$0.000040", address: "0x...ai", since: "6 Nov" },
  { name: "Alien Coin", price: "$0.000038", address: "0x...alien", since: "6 Nov" },
];

export default function Dashboard() {
  // Brand accent and stat mock data
  const stats = [
    { label: "Total Coins", value: "12,345" },
    { label: "Market Cap", value: "$2.1T" },
    { label: "24h Volume", value: "$65B" },
    { label: "BTC Dominance", value: "48.2%" },
    { label: "Sentiment", value: "Neutral" },
  ];
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar selected="Dashboard" />
      <main className="flex-1 p-8 bg-paper">
  {/* Hero Header */}
  <div className="mb-10">
    <h1 className="font-druk text-5xl md:text-7xl leading-tight mb-3 text-black tracking-tight uppercase">Lumos Dashboard</h1>
    <p className="hero-subtitle mb-6 max-w-2xl">Advanced trading intelligence and market protection. All your tools, stats, and insights in one place.</p>
    <div className="h-1 w-24 bg-pink-500 rounded mb-4 animate-glow" />
  </div>

  {/* Stats Row */}
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
    {stats.map((stat, i) => (
      <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center shadow-sm">
        <div className="font-druk text-lg md:text-2xl text-pink-500 mb-1">{stat.value}</div>
        <div className="text-xs uppercase tracking-wide text-gray-600 font-bold">{stat.label}</div>
      </div>
    ))}
  </div>

  {/* Market Summary */}
  <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className="font-druk text-xl text-black">Market Summary</div>
      <button className="cta-button primary text-xs px-4 py-2">Refresh</button>
    </div>
    <div className="divide-y divide-gray-200">
      {mockNews.map((news, i) => (
        <div key={i} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <div className="font-bold text-base text-black mb-1">{news.title}</div>
            <div className="text-sm text-gray-600 mb-1">{news.summary}</div>
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800 font-bold uppercase tracking-wide">{news.sentiment}</span>
          </div>
          <span className="text-xs text-gray-400 md:text-right">{news.time}</span>
        </div>
      ))}
    </div>
  </div>

  {/* Recent Coins */}
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className="font-druk text-xl text-black">Recent Coins</div>
      <button className="cta-button primary text-xs px-4 py-2">Refresh</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockCoins.map((coin, i) => (
        <div key={i} className="bg-paper-light border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm">
          <div className="font-druk text-lg text-black mb-1 uppercase">{coin.name}</div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500">Price</div>
            <div className="text-xs text-pink-500 font-bold">{coin.price}</div>
          </div>
          <div className="text-xs text-gray-400 mb-2">Token Address: {coin.address}</div>
          <div className="text-xs text-gray-500 mb-2">{coin.since}</div>
          <a href="#" className="cta-button secondary text-xs mt-2">View on Pump.fun</a>
        </div>
      ))}
    </div>
  </div>
</main>
    </div>
  );
}
