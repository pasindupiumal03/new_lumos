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
import { RiChatSmileAiLine } from "react-icons/ri";

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
    <div className="flex min-h-screen custom-gradient font-[Poppins,sans-serif]">
      {/* Sidebar - Always visible on larger screens */}
      <Sidebar selected="AI Chat" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden max-w-full">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/20 backdrop-blur-md px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8 shadow-xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white leading-tight drop-shadow-xl tracking-tight" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.02em'}}>
                  AI <span className="text-[#A259FF]">TRADING</span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-white/70 mt-2 lg:mt-3 max-w-2xl font-medium leading-relaxed" style={{fontFamily:'Poppins,sans-serif'}}>
                  Advanced AI assistant for crypto analysis and trading insights.
                </p>
                <div className="h-1 w-12 sm:w-16 lg:w-20 bg-gradient-to-r from-[#A259FF] to-[#6C38CC] rounded-full mt-3 lg:mt-4" />
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs lg:text-sm text-white/80 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>AI Online</span>
                </div>
                <button className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/15 hover:border-[#A259FF]/50 hover:scale-105 transition-all duration-300 group">
                  <FiRefreshCw className="h-4 w-4 lg:h-5 lg:w-5 text-white/80 group-hover:text-[#A259FF] group-hover:rotate-180 transition-all duration-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-12 space-y-6 lg:space-y-8">
          <style jsx>{`
            .scrollbar-hide {
              -ms-overflow-style: none;  /* Internet Explorer 10+ */
              scrollbar-width: none;  /* Firefox */
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;  /* Safari and Chrome */
            }
          `}</style>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isUser ? "justify-end" : "justify-start"
              } group`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] xl:max-w-[55%] rounded-2xl lg:rounded-3xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 shadow-2xl transition-all duration-300 backdrop-blur-xl group-hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] ${
                  message.isUser
                    ? "bg-gradient-to-r from-[#A259FF] to-[#6C38CC] text-white rounded-br-lg border border-[#A259FF]/30 hover:from-[#A259FF]/90 hover:to-[#6C38CC]/90"
                    : "bg-white/10 border border-white/20 rounded-bl-lg text-white hover:bg-white/15 hover:border-white/30"
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  {!message.isUser && (
                    <div className="mt-1 flex-shrink-0">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-[#5B50E1] to-[#7C3AED] flex items-center justify-center text-white shadow-xl border-2 border-white/10">
                        <RiChatSmileAiLine className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs sm:text-sm font-bold tracking-wide uppercase ${
                          message.isUser ? "text-white/70" : "text-[#5B50E1]"
                        }`}
                        style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.1em'}}
                      >
                        {message.isUser ? "You" : "Lumos AI"}
                      </span>
                      <span className="text-xs text-white/40 ml-2" style={{fontFamily:'Poppins,sans-serif'}}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="mt-2 text-sm sm:text-base leading-relaxed" style={{fontFamily:'Poppins,sans-serif'}}>
                      {message.isUser ? (
                        <p>{message.content}</p>
                      ) : (
                        <div className="prose prose-p:font-medium prose-strong:text-[#5B50E1] prose-ul:list-disc prose-ul:pl-6 prose-headings:text-white">
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {!message.isUser && (
                      <div className="mt-2 sm:mt-3 flex items-center justify-end space-x-1 sm:space-x-2 lg:space-x-3">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="text-white/60 hover:text-[#5B50E1] p-1.5 sm:p-2 rounded-full border border-white/10 hover:border-[#5B50E1] bg-white/5 hover:bg-white/10 shadow-xl transition-all backdrop-blur-sm"
                          title="Copy to clipboard"
                        >
                          <FiCopy className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button className="text-white/60 hover:text-green-400 p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-400/30 shadow-xl transition-all backdrop-blur-sm">
                          <FiThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button className="text-white/60 hover:text-red-400 p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-400/30 shadow-xl transition-all backdrop-blur-sm">
                          <FiThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
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
              <div className="max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-md border-2 border-white/10 px-4 sm:px-6 py-3 sm:py-4 rounded-bl-lg shadow-2xl">
                <div className="flex space-x-2 sm:space-x-3">
                  <div
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#5B50E1] animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#7C3AED] animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#8B5CF6] animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

        </div>

          <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="border-t border-white/10 bg-black/10 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10">
              <h3 className="text-lg lg:text-xl font-bold text-white/90 mb-4 lg:mb-6 text-center" style={{fontFamily:'Poppins,sans-serif'}}>Suggested Questions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => handleSuggestedQuestion(question.text)}
                    className="group relative text-left p-4 sm:p-5 lg:p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl lg:rounded-2xl hover:border-[#A259FF]/50 hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:bg-white/15 hover:scale-[1.02] transition-all duration-300 text-sm lg:text-base text-white font-medium shadow-xl overflow-hidden"
                    style={{fontFamily:'Poppins,sans-serif'}}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#A259FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-1.5 h-1.5 bg-[#A259FF] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="leading-relaxed">{question.text}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-xl shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/20 to-[#6C38CC]/20 rounded-2xl lg:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about crypto analysis, market trends, or token insights..."
                    className="w-full pr-16 sm:pr-20 lg:pr-24 pl-6 sm:pl-8 lg:pl-10 py-4 sm:py-5 lg:py-6 border border-white/20 rounded-2xl lg:rounded-3xl bg-white/10 backdrop-blur-xl focus:ring-2 focus:ring-[#A259FF]/50 focus:border-[#A259FF]/50 focus:bg-white/15 outline-none text-sm sm:text-base lg:text-lg font-medium text-white placeholder-white/50 shadow-2xl transition-all duration-300 hover:border-white/30 hover:bg-white/12"
                    disabled={isLoading}
                    style={{ fontFamily: "Poppins,sans-serif" }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={`absolute right-3 sm:right-4 lg:right-5 top-1/2 -translate-y-1/2 p-3 sm:p-4 lg:p-5 rounded-xl lg:rounded-2xl shadow-xl transition-all duration-300 group/btn ${
                      input.trim() && !isLoading
                        ? "bg-gradient-to-r from-[#A259FF] to-[#6C38CC] text-white hover:from-[#A259FF]/90 hover:to-[#6C38CC]/90 hover:scale-105 hover:shadow-[0_8px_32px_rgba(162,89,255,0.4)]"
                        : "bg-white/10 text-white/40 cursor-not-allowed border border-white/10"
                    }`}
                    style={{ fontFamily: "Poppins,sans-serif" }}
                  >
                    <FiSend className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 transition-transform duration-200 ${
                      input.trim() && !isLoading ? 'group-hover/btn:translate-x-0.5' : ''
                    }`} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 lg:mt-6 gap-3 sm:gap-0">
                <p className="text-xs lg:text-sm text-white/60 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>
                  Lumos AI may produce inaccurate information. Always verify important information.
                </p>
                <div className="flex items-center gap-4 text-xs lg:text-sm text-white/40">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    Connected
                  </span>
                  <span>v2.1.0</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}