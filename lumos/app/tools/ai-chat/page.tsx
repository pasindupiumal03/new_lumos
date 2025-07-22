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

export default function AIChatPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI trading assistant. How can I help you with your crypto trading today?",
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar selected="AI Chat" />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-druk font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              AI Trading Assistant
            </h1>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <FiRefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl rounded-2xl px-4 py-3 ${
                  message.isUser
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-none"
                    : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  {!message.isUser && (
                    <div className="mt-1 flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white">
                        <SiBitcoin className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-medium ${
                          message.isUser ? "text-pink-100" : "text-gray-500"
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
                    <div className="mt-1 text-sm">
                      {message.isUser ? (
                        <p>{message.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-strong:text-pink-600 prose-ul:list-disc prose-ul:pl-6">
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {!message.isUser && (
                      <div className="mt-2 flex items-center justify-end space-x-2">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                          title="Copy to clipboard"
                        >
                          <FiCopy className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-green-500 p-1">
                          <FiThumbsUp className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-500 p-1">
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
              <div className="max-w-3xl rounded-2xl bg-white border border-gray-200 px-4 py-3 rounded-bl-none shadow-sm">
                <div className="flex space-x-2">
                  <div
                    className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
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
          <div className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
              {suggestedQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handleSuggestedQuestion(question.text)}
                  className="text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-pink-300 hover:shadow-sm transition-all text-sm text-gray-700"
                >
                  {question.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about crypto trading..."
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${
                  input.trim() && !isLoading
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
                    : "text-gray-400"
                }`}
              >
                <FiSend className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              Lumos AI may produce inaccurate information. Always verify
              important information.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}