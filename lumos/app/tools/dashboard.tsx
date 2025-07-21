import Sidebar from "./Sidebar";
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
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar selected="Dashboard" />
      <main className="flex-1 p-8">
        <h1 className="font-druk text-4xl mb-8">Crypto Dashboard</h1>
        <div className="bg-white/5 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-lg">Market Summary</div>
            <button className="px-3 py-1 rounded bg-primary text-white text-xs">Refresh</button>
          </div>
          <div className="space-y-4">
            {mockNews.map((news, i) => (
              <div key={i} className="border-b border-gray-200/10 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-base text-foreground">{news.title}</div>
                  <span className="text-xs text-gray-400">{news.time}</span>
                </div>
                <div className="text-sm text-gray-300 mb-1">{news.summary}</div>
                <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">{news.sentiment}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-lg">Recent Coins</div>
            <button className="px-3 py-1 rounded bg-primary text-white text-xs">Refresh</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCoins.map((coin, i) => (
              <div key={i} className="bg-black/30 border border-gray-700 rounded-lg p-4 flex flex-col">
                <div className="font-bold text-lg text-foreground mb-1">{coin.name}</div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-400">Price</div>
                  <div className="text-xs text-gray-200">{coin.price}</div>
                </div>
                <div className="text-xs text-gray-400 mb-2">Token Address: {coin.address}</div>
                <div className="text-xs text-gray-500">{coin.since}</div>
                <a href="#" className="mt-2 text-xs text-primary underline">View on Pump.fun</a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
