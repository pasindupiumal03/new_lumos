"use client";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Server, TrendingUp, Twitter, Activity, Zap, Shield, BarChart3, Bot, LogOut, SearchIcon } from "lucide-react"
import { IoMdCheckmarkCircleOutline } from "react-icons/io"
import { LuBrain } from "react-icons/lu"
import { AiOutlineGlobal, AiOutlineAim } from "react-icons/ai"
import { RiUserCommunityFill } from "react-icons/ri"
import { useState, useEffect } from "react"
import Link from "next/link";

const toolRoutes: Record<number, string> = {
  1: "/tools/ai-chat",
  2: "/tools/news-sentiment",
  3: "/tools/eth-tracker",
  4: "/tools/solana-eco",
  5: "/tools/wallet-lookup",
};

const tools = [
  {
    id: 1,
    icon: MessageSquare,
    title: "AI CHAT ASSISTANT",
    description: "Get instant answers about crypto, blockchain, and market trends from our advanced AI.",
    status: "Live",
    cta: "Try Now",
  },
  {
    id: 2,
    icon: TrendingUp,
    title: "NEWS SENTIMENT ANALYSIS",
    description: "Real-time analysis of market news and social sentiment to inform your decisions.",
    status: "Live",
    cta: "Explore",
  },
  {
    id: 3,
    icon: Activity,
    title: "ETHEREUM CHAIN TRACKER",
    description: "Comprehensive tracking and analytics for the entire Ethereum ecosystem.",
    status: "Live",
    cta: "Analyze",
  },
  {
    id: 4,
    icon: Zap,
    title: "SOLANA ECOSYSTEM",
    description: "Full support for Pump.fun, Raydium, Meteora, and all major Solana platforms.",
    status: "Live",
    cta: "Explore",
  },
  {
    id: 5,
    icon: SearchIcon,
    title: "WALLET LOOKUP",
    description: "Search and analyze wallet addresses across multiple blockchains.",
    status: "Live",
    cta: "Explore",
  },
  {
    id: 7,
    icon: Shield,
    title: "PROTECTION SUITE",
    description: "Rug checks, token scoring, and advanced security features to keep you safe.",
    status: "Coming Soon",
    cta: "Notify Me",
  },
  {
    id: 8,
    icon: BarChart3,
    title: "PORTFOLIO ANALYZER",
    description: "Advanced portfolio tracking with P&L analysis and risk assessment tools.",
    status: "Coming Soon",
    cta: "Get Access",
  },
  {
    id: 9,
    icon: Bot,
    title: "TRADING SIGNALS",
    description: "AI-powered trading signals and alerts for optimal entry and exit points.",
    status: "Coming Soon",
    cta: "Join Beta",
  },
]

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if Phantom wallet is already connected on component mount
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window as any;
      if (solana && solana.isPhantom) {
        const response = await solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          setWalletAddress(response.publicKey.toString());
        }
      }
    } catch (error) {
      console.log('No wallet found or not connected');
    }
  };

  const connectWallet = async () => {
    const { solana } = window as any;
    
    if (!solana || !solana.isPhantom) {
      alert('Phantom wallet is not installed. Please install it from https://phantom.app/');
      return;
    }

    try {
      setIsConnecting(true);
      const response = await solana.connect();
      setWalletAddress(response.publicKey.toString());
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    const { solana } = window as any;
    
    try {
      if (solana && solana.isPhantom) {
        await solana.disconnect();
      }
      setWalletAddress(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen custom-gradient">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md shadow-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent tracking-wider drop-shadow-lg" style={{fontFamily:'Montserrat,Druk,sans-serif'}}>LUMOS</h1>
            </div>

            {/* Navigation Links - Centered */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center space-x-8">
                <a href="#features" className="relative font-semibold text-base uppercase tracking-wider text-white/80 hover:text-[#A259FF] transition-colors duration-200" style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.08em'}}>
                  Features
                </a>
                <a href="#about" className="relative font-semibold text-base uppercase tracking-wider text-white/80 hover:text-[#A259FF] transition-colors duration-200" style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.08em'}}>
                  About
                </a>
                <a href="/terms" className="relative font-semibold text-base uppercase tracking-wider text-white/80 hover:text-[#A259FF] transition-colors duration-200" style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.08em'}}>
                  Terms
                </a>
                <a href="/privacy" className="relative font-semibold text-base uppercase tracking-wider text-white/80 hover:text-[#A259FF] transition-colors duration-200" style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.08em'}}>
                  Privacy
                </a>
              </div>
            </div>

            {/* Connect Wallet Button */}
            <div className="flex-shrink-0">
              {walletAddress ? (
                <div className="flex items-center gap-3">
                  <div className="relative px-4 py-2 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/20 text-white font-semibold text-sm shadow-lg" style={{fontFamily:'Poppins,sans-serif'}}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                    <span className="relative z-10">{formatAddress(walletAddress)}</span>
                  </div>
                  <button 
                    onClick={disconnectWallet}
                    className="group relative p-2 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:shadow-[0_8px_32px_rgba(239,68,68,0.3)] hover:scale-[1.02] transition-all duration-300 shadow-lg"
                    title="Disconnect Wallet"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <LogOut className="w-4 h-4 relative z-10" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="group relative px-6 py-3 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 hover:border-white/30 hover:shadow-[0_8px_32px_rgba(162,89,255,0.3)] hover:scale-[1.02] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
                  style={{fontFamily:'Poppins,sans-serif'}}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/20 via-[#6C38CC]/20 to-[#FF1C8B]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <span className="relative z-10">{isConnecting ? 'Connecting...' : 'Connect Phantom'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Glassmorphism Header Section */}
      <section className="w-full flex flex-col items-center justify-center pt-12 pb-16 px-4 md:px-0">
        <div className="max-w-3xl w-full flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6">
            <span className="relative inline-block px-5 py-2 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/20 text-[#be65f1] font-extrabold text-sm tracking-wide shadow-lg" style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.04em'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <span className="relative z-10">🚀 Phase 2 Now Live - Advanced AI Features Available</span>
            </span>
          </div>
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-white leading-tight" style={{fontFamily:'Poppins,sans-serif'}}>
            Your Ultimate <span className="text-[#a51fff]">Web3 Trading Shield</span>
          </h1>
          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>
            Navigate the crypto universe with confidence. Lumos AI combines advanced sentiment analysis, real-time tracking, and community-driven insights to protect and empower your trading decisions.
          </p>
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full justify-center">
            <Link href="/tools/dashboard" className="w-full sm:w-auto">
              <button className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/20 text-white font-bold text-base hover:bg-white/10 hover:border-white/30 hover:shadow-[0_16px_64px_rgba(162,89,255,0.4)] hover:scale-[1.02] transition-all duration-300 shadow-xl" style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.04em'}}>
                <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF] via-[#6C38CC] to-[#FF1C8B] opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                <div className="absolute inset-0 border border-white/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Start Trading Smarter</span>
              </button>
            </Link>
            <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <button className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border-2 border-white/20 text-white font-bold text-base hover:bg-white/10 hover:border-white/30 hover:text-[#A259FF] hover:shadow-[0_16px_64px_rgba(255,255,255,0.1)] hover:scale-[1.02] transition-all duration-300 shadow-xl" style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.04em'}}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
                <div className="absolute inset-0 border border-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Explore on pump.fun</span>
              </button>
            </a>
          </div>
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full mt-2">
            <div className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-extrabold text-[#be65f1]" style={{fontFamily:'Poppins,sans-serif'}}>10K+</span>
              <span className="text-xs md:text-sm text-white/70 mt-1 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Active Traders</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-extrabold text-[#be65f1]" style={{fontFamily:'Poppins,sans-serif'}}>99.9%</span>
              <span className="text-xs md:text-sm text-white/70 mt-1 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Uptime</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-extrabold text-[#be65f1]" style={{fontFamily:'Poppins,sans-serif'}}>24/7</span>
              <span className="text-xs md:text-sm text-white/70 mt-1 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Monitoring</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-extrabold text-[#be65f1]" style={{fontFamily:'Poppins,sans-serif'}}>$50M+</span>
              <span className="text-xs md:text-sm text-white/70 mt-1 font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Protected</span>
            </div>
          </div>
        </div>
      </section>
      

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="font-bold text-white text-[2.8rem] md:text-[5rem] leading-none drop-shadow-xl" style={{fontFamily:'Poppins,sans-serif'}}>
            Comprehensive<br />Trading Protection
          </h1>
          <p className="mt-6 text-xl md:text-2xl font-semibold text-white/70" style={{fontFamily:'Montserrat,sans-serif'}}>Everything you need to trade safely and profitably in the Web3 ecosystem</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div id="features" className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            const isLive = tool.status === "Live";
            const toolHref = "/tools/dashboard";
            return (
              <Link href={toolHref} key={tool.id} className="block">
                <Card className={`group rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-[0_20px_80px_rgba(162,89,255,0.4)] transition-all duration-500 cursor-pointer relative overflow-hidden hover:scale-[1.02] hover:bg-white/10 lumos-animated-outline`}>
                  {/* Glassmorphism layers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent opacity-60"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-pink-500/5"></div>
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="rounded-2xl bg-white/10 backdrop-blur-xl p-3 shadow-xl mb-2 border border-white/20 group-hover:bg-white/20 group-hover:border-white/30 transition-all duration-300">
                        <IconComponent className="w-7 h-7 text-white/80 group-hover:text-[#A259FF] transition-colors duration-300" strokeWidth={2} />
                      </div>
                      <Badge className={`uppercase font-bold px-4 py-1 rounded-full text-xs tracking-wider backdrop-blur-xl ${isLive ? 'bg-[#5B50E1]/20 text-[#5B50E1] border border-[#5B50E1]/30 group-hover:bg-[#5B50E1]/30 group-hover:border-[#5B50E1]/50' : 'bg-white/10 text-white/60 border border-white/20'} transition-all duration-300`}>{tool.status}</Badge>
                    </div>
                    <CardTitle className="text-lg md:text-xl font-extrabold uppercase mb-2 text-white/75 tracking-wide group-hover:text-white transition-colors duration-300" style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.08em'}}>{tool.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-5 relative z-10">
                    <CardDescription className="text-base text-white/70 group-hover:text-white/90 transition-colors duration-300" style={{fontFamily:'Poppins,sans-serif' , letterSpacing:'0.05em'}}>{tool.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="relative z-10">
                    <Button className={`group/btn relative rounded-2xl overflow-hidden font-bold px-8 py-3 text-base tracking-wider transition-all duration-300 shadow-lg ${isLive ? 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:border-white/30 hover:shadow-[0_8px_32px_rgba(162,89,255,0.5)] hover:scale-[1.02]' : 'bg-white/5 backdrop-blur-xl border border-white/10 text-white/40 opacity-60 cursor-not-allowed'}`} disabled={!isLive} style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.08em'}}>
                      {isLive && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF]/20 via-[#6C38CC]/20 to-[#FF1C8B]/20 opacity-0 group/btn-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                          <div className="absolute inset-0 border border-white/20 rounded-2xl opacity-0 group/btn-hover:opacity-100 transition-opacity duration-300"></div>
                        </>
                      )}
                      <span className="relative z-10">{tool.cta}</span>
                    </Button>
                  </CardFooter>
                  
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="py-20 bg-black/20 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight" style={{fontFamily:'Poppins,sans-serif'}}>
                Built by Community, for Community
              </h2>
              <p className="text-lg text-white/80 leading-relaxed" style={{fontFamily:'Poppins,sans-serif'}}>
                Lumos AI is more than just a trading platform—it's your comprehensive shield in the dynamic cryptocurrency world. We combine cutting-edge AI technology with community-driven insights to provide unparalleled protection and empowerment.
              </p>
              
              {/* Feature List */}
              <div className="space-y-4 mt-8">
                <div className="flex items-center gap-4">
                  <IoMdCheckmarkCircleOutline className="w-6 h-6 text-[#A259FF] flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>Real-time Market Intelligence</h3>
                    <p className="text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>Stay ahead with live sentiment analysis and trend detection</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <IoMdCheckmarkCircleOutline className="w-6 h-6 text-[#A259FF] flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>Multi-Chain Support</h3>
                    <p className="text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>Complete coverage of Ethereum and Solana ecosystems</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <IoMdCheckmarkCircleOutline className="w-6 h-6 text-[#A259FF] flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>Advanced Protection</h3>
                    <p className="text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>Comprehensive security features to avoid scams and rug pulls</p>
                  </div>
                </div>
              </div>

              {/* Join Community Button */}
              <div className="mt-8">
                <Link href="/tools/dashboard" className="w-full sm:w-auto">
                  <button className="group relative px-8 py-4 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/20 text-white font-bold hover:bg-white/10 hover:border-white/30 hover:shadow-[0_16px_64px_rgba(162,89,255,0.4)] hover:scale-[1.02] transition-all duration-300 shadow-xl" style={{fontFamily:'Poppins,sans-serif'}}>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF] via-[#6C38CC] to-[#FF1C8B] opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 border border-white/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">Join the Community</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center shadow-lg">
                <div className="flex justify-center mb-4">
                  <LuBrain className="w-10 h-10 text-[#1fffc3]" />
                </div>
                <h3 className="font-bold text-white mb-2" style={{fontFamily:'Poppins,sans-serif'}}>AI-Powered</h3>
                <p className="text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>Advanced machine learning algorithms</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center shadow-lg">
                <div className="flex justify-center mb-4">
                  <AiOutlineGlobal className="w-10 h-10 text-[#1fffc3]" />
                </div>
                <h3 className="font-bold text-white mb-2" style={{fontFamily:'Poppins,sans-serif'}}>Global Reach</h3>
                <p className="text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>24/7 worldwide market coverage</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center shadow-lg">
                <div className="flex justify-center mb-4">
                  <RiUserCommunityFill className="w-10 h-10 text-[#ff6b6b]" />
                </div>
                <h3 className="font-bold text-white mb-2" style={{fontFamily:'Poppins,sans-serif'}}>Community</h3>
                <p className="text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>Built with trader feedback</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center shadow-lg">
                <div className="flex justify-center mb-4">
                  <AiOutlineAim className="w-10 h-10 text-[#ff6b6b]" />
                </div>
                <h3 className="font-bold text-white mb-2" style={{fontFamily:'Poppins,sans-serif'}}>Precision</h3>
                <p className="text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>Accurate market predictions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <div className="relative bg-black/30 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-wider leading-none mb-6 text-white" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.12em'}}>
            READY TO DOMINATE
            <br />
            WEB3?
          </h2>
          <p className="text-lg font-medium max-w-2xl mx-auto mb-8 text-white/70" style={{fontFamily:'Montserrat,sans-serif'}}>
            Join thousands of traders who trust our tools for safer, more profitable trading
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
            <Button className="group relative px-8 py-4 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/20 text-white font-bold uppercase tracking-wider text-sm hover:bg-white/10 hover:border-white/30 hover:shadow-[0_16px_64px_rgba(162,89,255,0.4)] hover:scale-[1.02] transition-all duration-300 shadow-xl" style={{fontFamily:'Montserrat,sans-serif',letterSpacing:'0.1em'}}>
              <div className="absolute inset-0 bg-gradient-to-r from-[#A259FF] via-[#6C38CC] to-[#FF1C8B] opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              <div className="absolute inset-0 border border-white/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">GET STARTED FREE</span>
            </Button>
            {/* <Button className="group relative px-8 py-4 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30 hover:text-[#A259FF] hover:shadow-[0_16px_64px_rgba(255,255,255,0.1)] hover:scale-[1.02] font-bold uppercase tracking-wider text-sm transition-all duration-300 shadow-xl" style={{fontFamily:'Montserrat,sans-serif',letterSpacing:'0.1em'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
              <div className="absolute inset-0 border border-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">VIEW PRICING</span>
            </Button> */}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Lumos AI */}
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent tracking-wider drop-shadow-lg" style={{fontFamily:'Montserrat,Druk,sans-serif'}}>LUMOS</h1>
              <p className="text-white/70 text-sm leading-relaxed" style={{fontFamily:'Poppins,sans-serif'}}>
                Your ultimate Web3 trading shield. Navigate the crypto universe with confidence through advanced AI-powered analytics and community-driven insights.
              </p>
              <div className="flex gap-3">
                <a href="#" className="group relative p-2 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/20 text-white/60 hover:text-[#1fffc3] hover:bg-white/10 hover:border-white/30 hover:shadow-[0_8px_32px_rgba(31,255,195,0.2)] hover:scale-[1.02] transition-all duration-300 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="group relative p-2 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/20 text-white/60 hover:text-[#1fffc3] hover:bg-white/10 hover:border-white/30 hover:shadow-[0_8px_32px_rgba(31,255,195,0.2)] hover:scale-[1.02] transition-all duration-300 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.120.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Platform */}
            <div className="space-y-4">
              <h3 className="font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>Platform</h3>
              <ul className="space-y-2 text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Login</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>Legal</h3>
              <ul className="space-y-2 text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Ready to Trade */}
            <div className="space-y-4">
              <h3 className="font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>Ready to Trade with Confidence?</h3>
              <p className="text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
                Join thousands of traders who trust Lumos AI to navigate the crypto markets safely and profitably.
              </p>
              <div className="flex flex-col gap-2">

                <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" className="text-[#6d1fff] text-sm " style={{fontFamily:'Poppins,sans-serif'}}>
                  Trade on pump.fun
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-white/60 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
              © 2025 Lumos AI. All rights reserved. Built by community, for community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
