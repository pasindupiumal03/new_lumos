"use client";

import { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiRefreshCw,
  FiCopy,
  FiThumbsUp,
  FiThumbsDown,
} from "react-icons/fi";
import { FaEthereum } from "react-icons/fa";
import { SiBitcoin } from "react-icons/si";
import Sidebar from "../Sidebar";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

type SuggestedQuestion = {
  id: number;
  text: string;
};

// Lumos font imports (add to _app.tsx or global.css if not present)
// import "@fontsource/montserrat/700.css";
// import "@fontsource/montserrat/400.css";

export default function AIChatPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Welcome to Lumos AI! 🚀\n\nI'm your advanced crypto trading assistant. I can analyze tokens on both **Solana** and **Ethereum** networks. Here's what I can do:\n\n• **Token Analysis**: Send me any token address, name, or symbol\n• **Market Insights**: Get real-time price data and market trends\n• **Risk Assessment**: Understand potential risks and opportunities\n• **Trading Advice**: Get personalized trading strategies\n\nTry sending me a token address like `PUMP` or `0x...` to get started!",
      isUser: false,
      timestamp: new Date(Date.now() - 60000),
    },
  ]);

  const suggestedQuestions: SuggestedQuestion[] = [
    { id: 1, text: "What is the current price of Bitcoin?" },
    { id: 2, text: "Show me the top gainers in the last 24 hours" },
    { id: 3, text: "What are the latest market trends?" },
    { id: 4, text: "Explain the concept of staking" },
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/tools/ai-chat/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content:
          data.message || "Sorry, I encountered an issue. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Failed to get a response. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
      const form = document.querySelector("form");
      if (form) form.requestSubmit();
    }, 100);
  };

  const copyToClipboard = (text: string) => {
    const cleanText = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\n- /g, "\n");
    navigator.clipboard.writeText(cleanText);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-[#FFEBF5] to-[#F3EFFF] font-[Montserrat,sans-serif]">
      <Sidebar selected="AI Chat" />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#F1E3F6] bg-white/80 p-6 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent uppercase drop-shadow-lg" style={{ letterSpacing: "0.04em" }}>
              AI Trading Assistant
            </h1>
            <div className="flex items-center space-x-2">
              <button className="p-3 rounded-full bg-white/70 border border-[#F1E3F6] shadow hover:bg-[#FFEBF5] transition">
                <FiRefreshCw className="h-5 w-5 text-[#FF1C8B]" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 bg-gradient-to-b from-white/90 to-[#F3EFFF]/60">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl rounded-3xl px-6 py-4 shadow-lg transition-all duration-200 ${
                  message.isUser
                    ? "bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] text-white rounded-br-3xl border-2 border-[#FF1C8B]/60"
                    : "bg-white/90 border-2 border-[#F1E3F6] rounded-bl-3xl text-[#232323]"
                }`}
              >
                <div className="flex items-start gap-4">
                  {!message.isUser && (
                    <div className="mt-1 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] flex items-center justify-center text-white shadow-md">
                        <SiBitcoin className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold tracking-wide ${
                          message.isUser ? "text-[#FFD6F2]" : "text-[#A259FF]"
                        }`}
                      >
                        {message.isUser ? "You" : "Trading Assistant"}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="mt-2 text-base leading-relaxed">
                      {message.isUser ? (
                        <p>{message.content}</p>
                      ) : (
                        <div className="prose prose-p:font-medium prose-strong:text-[#FF1C8B] prose-ul:list-disc prose-ul:pl-6">
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {!message.isUser && (
                      <div className="mt-3 flex items-center justify-end space-x-3">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="text-[#A259FF] hover:text-[#FF1C8B] p-2 rounded-full border border-transparent hover:border-[#FF1C8B] bg-white/70 shadow-sm transition"
                          title="Copy to clipboard"
                        >
                          <FiCopy className="h-4 w-4" />
                        </button>
                        <button className="text-[#A259FF] hover:text-green-500 p-2 rounded-full bg-white/70 border border-transparent hover:border-green-200 shadow-sm transition">
                          <FiThumbsUp className="h-4 w-4" />
                        </button>
                        <button className="text-[#A259FF] hover:text-red-500 p-2 rounded-full bg-white/70 border border-transparent hover:border-red-200 shadow-sm transition">
                          <FiThumbsDown className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-2xl rounded-3xl bg-white/90 border-2 border-[#F1E3F6] px-6 py-4 rounded-bl-3xl shadow-lg">
                <div className="flex space-x-3">
                  <div
                    className="w-3 h-3 rounded-full bg-[#FF1C8B] animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-3 h-3 rounded-full bg-[#A259FF] animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-3 h-3 rounded-full bg-[#6C38CC] animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {suggestedQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handleSuggestedQuestion(question.text)}
                  className="text-left p-4 bg-gradient-to-r from-[#FFEBF5] to-[#F3EFFF] border-2 border-[#F1E3F6] rounded-2xl hover:border-[#FF1C8B] hover:shadow-lg transition-all text-base text-[#232323] font-semibold tracking-tight"
                >
                  {question.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-[#F1E3F6] bg-white/80 p-6 shadow-inner backdrop-blur-md">
          <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter token address, name, symbol, or ask about crypto..."
                className="w-full pr-16 pl-5 py-4 border-2 border-[#F1E3F6] rounded-full bg-gradient-to-r from-[#FFEBF5] to-[#F3EFFF] focus:ring-2 focus:ring-[#FF1C8B] focus:border-[#FF1C8B] outline-none text-lg font-medium text-[#232323] placeholder-[#A259FF]/70 shadow-md transition"
                disabled={isLoading}
                style={{ fontFamily: "Montserrat,sans-serif" }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 ${
                  input.trim() && !isLoading
                    ? "bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] text-white hover:opacity-90"
                    : "bg-[#F1E3F6] text-[#A259FF]/60 cursor-not-allowed"
                }`}
                style={{ fontFamily: "Montserrat,sans-serif" }}
              >
                <FiSend className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-center text-[#A259FF] mt-3 font-medium">
              Lumos AI may produce inaccurate information. Always verify important information.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}