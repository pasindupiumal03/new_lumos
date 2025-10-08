"use client";

import { useState, useRef, useEffect } from "react";
import { FiSend, FiRefreshCw, FiCopy, FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import Sidebar from "../Sidebar";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { RiChatSmileAiLine } from "react-icons/ri";

type Message = { id: string; content: string; isUser: boolean; timestamp: Date };
type SuggestedQuestion = { id: number; text: string };

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);

      const data = await response.json();
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message || "Sorry, I encountered an issue. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch {
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
      form && (form as HTMLFormElement).requestSubmit();
    }, 50);
  };

  const copyToClipboard = (text: string) => {
    const cleanText = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\n- /g, "\n");
    navigator.clipboard.writeText(cleanText);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex min-h-[100svh] custom-gradient font-[Poppins,sans-serif]">
      {/* Sidebar */}
      <Sidebar selected="AI Chat" />

      {/* Main: Header / Chat (scroll) / Input */}
      <div className="flex-1 grid grid-rows-[auto,1fr,auto] h-[100svh] max-w-full">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-md px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 shadow-xl">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0">
              <h1
                className="font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white leading-tight drop-shadow-xl tracking-tight"
                style={{ fontFamily: "Impact,Arial Black,sans-serif", letterSpacing: "0.02em" }}
              >
                AI <span className="text-[#A259FF]">TRADING</span>
              </h1>
              <p
                className="text-sm sm:text-base lg:text-lg xl:text-xl text-white/70 mt-2 max-w-2xl font-medium leading-relaxed"
                style={{ fontFamily: "Poppins,sans-serif" }}
              >
                Advanced AI assistant for crypto analysis and trading insights.
              </p>
              <div className="h-1 w-12 sm:w-16 lg:w-20 bg-gradient-to-r from-[#A259FF] to-[#6C38CC] rounded-full mt-3" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm text-white/80 font-medium">AI Online</span>
              </div>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/15 hover:border-[#A259FF]/50 hover:scale-105 transition-all duration-300 group"
                aria-label="Reset conversation"
              >
                <FiRefreshCw className="h-5 w-5 text-white/80 group-hover:text-[#A259FF] group-hover:rotate-180 transition-all duration-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Chat area — only scroll container */}
        <main
          className="chat-scroll overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"} group`}
              >
                <div
                  className={[
                    "max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[55%]",
                    "rounded-2xl lg:rounded-3xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 shadow-2xl transition-all duration-300 backdrop-blur-xl",
                    message.isUser
                      ? "bg-gradient-to-r from-[#A259FF] to-[#6C38CC] text-white rounded-br-lg border border-[#A259FF]/30 hover:from-[#A259FF]/90 hover:to-[#6C38CC]/90"
                      : "bg-white/10 border border-white/20 rounded-bl-lg text-white hover:bg-white/15 hover:border-white/30",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    {!message.isUser && (
                      <div className="mt-1 flex-shrink-0">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-[#5B50E1] to-[#7C3AED] flex items-center justify-center text-white shadow-xl border-2 border-white/10">
                          <RiChatSmileAiLine className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`text-xs sm:text-sm font-bold tracking-wide uppercase ${
                            message.isUser ? "text-white/70" : "text-[#5B50E1]"
                          }`}
                          style={{ letterSpacing: "0.1em" }}
                        >
                          {message.isUser ? "You" : "Lumos AI"}
                        </span>
                        <span className="text-xs text-white/40">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <div className="mt-2 text-sm sm:text-base leading-relaxed break-words">
                        {message.isUser ? (
                          <p>{message.content}</p>
                        ) : (
                          <div className="prose prose-invert prose-p:font-medium prose-strong:text-[#5B50E1] prose-ul:list-disc prose-ul:pl-6 prose-headings:text-white max-w-none">
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>

                      {!message.isUser && (
                        <div className="mt-2 sm:mt-3 flex items-center justify-end space-x-2">
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="text-white/60 hover:text-[#5B50E1] p-2 rounded-full border border-white/10 hover:border-[#5B50E1] bg-white/5 hover:bg-white/10 shadow-xl transition-all backdrop-blur-sm"
                            title="Copy to clipboard"
                          >
                            <FiCopy className="h-4 w-4" />
                          </button>
                          <button className="text-white/60 hover:text-green-400 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-400/30 shadow-xl transition-all backdrop-blur-sm">
                            <FiThumbsUp className="h-4 w-4" />
                          </button>
                          <button className="text-white/60 hover:text-red-400 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-400/30 shadow-xl transition-all backdrop-blur-sm">
                            <FiThumbsDown className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Suggested Questions (responsive) */}
            {messages.length <= 1 && (
              <div className="mt-2">
                <h3 className="text-lg lg:text-xl font-bold text-white/90 mb-4 lg:mb-6 text-center">
                  Suggested Questions
                </h3>

                {/* Mobile: swipeable pills + hidden scrollbar */}
                <div className="block md:hidden -mx-4 px-4 suggest-scroll snap-x snap-mandatory overflow-x-auto">
                  <div className="flex gap-3 w-max">
                    {suggestedQuestions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleSuggestedQuestion(q.text)}
                        className="snap-start min-w-[240px] max-w-[80vw] text-left p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:border-[#A259FF]/50 hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:bg-white/15 hover:scale-[1.02] transition-all duration-300 text-sm text-white font-medium shadow-xl relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#A259FF]/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10">
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-[#A259FF] rounded-full mt-2 flex-shrink-0" />
                            <span className="leading-relaxed">{q.text}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* md+ grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleSuggestedQuestion(q.text)}
                      className="group relative text-left p-5 lg:p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:border-[#A259FF]/50 hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:bg-white/15 hover:scale-[1.02] transition-all duration-300 text-base text-white font-medium shadow-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#A259FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-1.5 h-1.5 bg-[#A259FF] rounded-full mt-2 flex-shrink-0" />
                          <span className="leading-relaxed">{q.text}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input */}
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
              <div className="group">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 hover:bg-white/12 transition-all duration-300 rounded-2xl lg:rounded-3xl shadow-2xl">
                  {/* Flex row so heights align perfectly */}
                  <div className="flex items-stretch">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about crypto analysis, market trends, or token insights..."
                      className="flex-1 px-4 sm:px-6 lg:px-8 text-sm sm:text-base lg:text-lg font-medium text-white placeholder-white/50 bg-transparent outline-none h-12 sm:h-14 lg:h-16"
                      aria-label="Chat input"
                      style={{ fontFamily: "Poppins,sans-serif", paddingBottom: "env(safe-area-inset-bottom)" }}
                      disabled={isLoading}
                    />

                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className={[
                        "h-12 sm:h-14 lg:h-16 px-4 sm:px-5 lg:px-6 rounded-r-2xl lg:rounded-r-3xl border-l border-white/10",
                        "transition-all duration-300 group/btn",
                        input.trim() && !isLoading
                          ? "bg-gradient-to-r from-[#A259FF] to-[#6C38CC] text-white hover:from-[#A259FF]/90 hover:to-[#6C38CC]/90 hover:shadow-[0_8px_32px_rgba(162,89,255,0.4)]"
                          : "bg-white/10 text-white/40 cursor-not-allowed",
                      ].join(" ")}
                      aria-label="Send message"
                    >
                      <FiSend className="h-5 w-5 lg:h-6 lg:w-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
                <p className="text-xs lg:text-sm text-white/60 font-medium text-center sm:text-left" style={{ fontFamily: "Poppins,sans-serif" }}>
                  Lumos AI may produce inaccurate information. Always verify important information.
                </p>
                <div className="flex items-center gap-4 text-xs lg:text-sm text-white/40">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Connected
                  </span>
                  <span>v2.1.0</span>
                </div>
              </div>
            </form>
          </div>
        </footer>
      </div>

      {/* Scoped styles: hide scrollbars AFTER fixing scroll */}
      <style jsx>{`
        .chat-scroll {
          height: 100%;
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none; /* Firefox */
        }
        .chat-scroll::-webkit-scrollbar {
          width: 0px;
          height: 0px; /* Chrome/Safari/Edge */
        }
        .suggest-scroll {
          scrollbar-width: none; /* Firefox */
          -webkit-overflow-scrolling: touch;
        }
        .suggest-scroll::-webkit-scrollbar {
          display: none; /* Chromium/WebKit */
        }
      `}</style>
    </div>
  );
}
