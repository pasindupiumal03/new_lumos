import React from "react";
import Link from "next/link";

const tools = [
  { id: "Dashboard", label: "Dashboard", href: "/tools/dashboard" },
  { id: "AI Chat", label: "AI Chat", href: "/tools/ai-chat" },
  { id: "MCP Server", label: "MCP Server", href: "/tools/mcp-server" },
  { id: "News Sentiment", label: "News Sentiment", href: "/tools/news-sentiment" },
  { id: "Twitter Tracker", label: "Twitter Tracker", href: "/tools/twitter-tracker" },
  { id: "ETH Tracker", label: "ETH Tracker", href: "/tools/eth-tracker" },
  { id: "Solana Eco", label: "Solana Eco", href: "/tools/solana-eco" },
];

export default function Sidebar({ selected }: { selected: string }) {
  return (
    <aside className="w-64 bg-black/80 border-r border-gray-800 flex flex-col min-h-screen p-6">
      <div className="mb-10">
        <span className="font-druk text-2xl text-primary">LUMOS</span>
      </div>
      <nav className="flex flex-col gap-2">
        {tools.map((tool) => (
          <Link href={tool.href} key={tool.id} legacyBehavior>
            <a
              className={`px-4 py-2 rounded font-semibold text-lg transition-all duration-200 ${
                selected === tool.id
                  ? "bg-primary text-white shadow-lg"
                  : "text-gray-300 hover:bg-gray-800 hover:text-primary"
              }`}
            >
              {tool.label}
            </a>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
