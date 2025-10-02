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
      <Sidebar selected="AI Chat" />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/20 backdrop-blur-md p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-black text-4xl md:text-6xl tracking-wider text-white leading-tight drop-shadow-xl" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.15em'}}>
                AI <span className="text-[#3b0766]">TRADING</span>
              </h1>
              <p className="text-lg text-white/70 mt-2 max-w-xl font-medium" style={{fontFamily:'Poppins,sans-serif'}}>
                Advanced AI assistant for crypto analysis and trading insights.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border-2 border-white/10 shadow-xl hover:bg-white/10 hover:border-[#5B50E1]/50 transition-all">
                <FiRefreshCw className="h-5 w-5 text-white/80" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto px-8 py-12 space-y-8">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl rounded-3xl px-6 py-4 shadow-2xl transition-all duration-200 backdrop-blur-md ${
                  message.isUser
                    ? "bg-gradient-to-r from-[#5B50E1] to-[#7C3AED] text-white rounded-br-lg border-2 border-[#5B50E1]/30"
                    : "bg-white/5 border-2 border-white/10 rounded-bl-lg text-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  {!message.isUser && (
                    <div className="mt-1 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#5B50E1] to-[#7C3AED] flex items-center justify-center text-white shadow-xl border-2 border-white/10">
                        <RiChatSmileAiLine className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold tracking-wide uppercase ${
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
                    <div className="mt-2 text-base leading-relaxed" style={{fontFamily:'Poppins,sans-serif'}}>
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
                      <div className="mt-3 flex items-center justify-end space-x-3">
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

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-2xl rounded-3xl bg-white/5 backdrop-blur-md border-2 border-white/10 px-6 py-4 rounded-bl-lg shadow-2xl">
                <div className="flex space-x-3">
                  <div
                    className="w-3 h-3 rounded-full bg-[#5B50E1] animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-3 h-3 rounded-full bg-[#7C3AED] animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-3 h-3 rounded-full bg-[#8B5CF6] animate-bounce"
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
          <div className="px-8 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {suggestedQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handleSuggestedQuestion(question.text)}
                  className="text-left p-6 bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-2xl hover:border-[#5B50E1]/50 hover:shadow-2xl hover:bg-white/10 transition-all text-base text-white font-semibold tracking-tight shadow-xl"
                  style={{fontFamily:'Poppins,sans-serif'}}
                >
                  {question.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-md p-8 shadow-2xl">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter token address, name, symbol, or ask about crypto..."
                className="w-full pr-16 pl-6 py-5 border-2 border-white/10 rounded-2xl bg-white/5 backdrop-blur-md focus:ring-2 focus:ring-[#5B50E1] focus:border-[#5B50E1] outline-none text-lg font-medium text-white placeholder-white/50 shadow-2xl transition-all"
                disabled={isLoading}
                style={{ fontFamily: "Poppins,sans-serif" }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl shadow-xl transition-all duration-200 ${
                  input.trim() && !isLoading
                    ? "bg-gradient-to-r from-[#5B50E1] to-[#7C3AED] text-white hover:opacity-90 hover:shadow-2xl"
                    : "bg-white/10 text-white/40 cursor-not-allowed border border-white/10"
                }`}
                style={{ fontFamily: "Poppins,sans-serif" }}
              >
                <FiSend className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-center text-white/60 mt-4 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>
              Lumos AI may produce inaccurate information. Always verify important information.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}