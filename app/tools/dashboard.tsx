import Sidebar from "./Sidebar";
import React from "react";

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
          </div>
        </div>
        <div className="bg-white/5 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-lg">Recent Coins</div>
            <button className="px-3 py-1 rounded bg-primary text-white text-xs">Refresh</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          </div>
        </div>
      </main>
    </div>
  );
}
