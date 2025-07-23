import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Server, TrendingUp, Twitter, Activity, Zap, Shield, BarChart3, Bot } from "lucide-react"
import Link from "next/link";

const toolRoutes: Record<number, string> = {
  1: "/tools/ai-chat",
  2: "/tools/mcp-server",
  3: "/tools/news-sentiment",
  4: "/tools/twitter-tracker",
  5: "/tools/eth-tracker",
  6: "/tools/solana-eco",
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
    icon: Server,
    title: "MCP SERVER",
    description: "Crypto ticker & sentiment analysis server providing real-time market data and insights.",
    status: "Live",
    cta: "Connect",
  },
  {
    id: 3,
    icon: TrendingUp,
    title: "NEWS SENTIMENT ANALYSIS",
    description: "Real-time analysis of market news and social sentiment to inform your decisions.",
    status: "Live",
    cta: "Explore",
  },
  {
    id: 4,
    icon: Twitter,
    title: "TWITTER TRACKER",
    description: "Monitor real-time Twitter activity for trending tokens and market sentiment.",
    status: "Live",
    cta: "Track Now",
  },
  {
    id: 5,
    icon: Activity,
    title: "ETHEREUM CHAIN TRACKER",
    description: "Comprehensive tracking and analytics for the entire Ethereum ecosystem.",
    status: "Live",
    cta: "Analyze",
  },
  {
    id: 6,
    icon: Zap,
    title: "SOLANA ECOSYSTEM",
    description: "Full support for Pump.fun, Raydium, Meteora, and all major Solana platforms.",
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFEBF5] to-[#F3EFFF]">
      {/* Navigation */}
      <nav className="border-b-2 border-[#F1E3F6] bg-gradient-to-r from-[#FFEBF5]/80 to-[#F3EFFF]/80 shadow-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent tracking-tighter drop-shadow-lg" style={{fontFamily:'Montserrat,Druk,sans-serif',letterSpacing:'0.04em'}}>LUMOS</h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-16 flex items-center space-x-12">
                {['Features','About','Terms','Privacy'].map((nav) => (
                  <a key={nav} href="#" className="relative font-bold text-lg uppercase tracking-wide text-[#A259FF] hover:text-[#FF1C8B] transition-colors duration-200" style={{fontFamily:'Montserrat,sans-serif'}}>
                    <span className="nav-underline group-hover:w-full"></span>{nav}
                  </a>
                ))}
              </div>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center">
              <div className="flex rounded-2xl bg-white/70 border-2 border-[#F1E3F6] shadow px-2 py-1">
                <div className="px-3 py-1 font-bold text-[#FF1C8B] bg-gradient-to-r from-[#FFEBF5] to-[#F3EFFF] rounded-xl mr-1 cursor-pointer" style={{fontFamily:'Montserrat,sans-serif'}}>EN</div>
                <div className="px-3 py-1 font-bold text-[#A259FF] hover:text-[#FF1C8B] rounded-xl cursor-pointer transition-colors" style={{fontFamily:'Montserrat,sans-serif'}}>RU</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] text-[2.8rem] md:text-[5rem] leading-none uppercase tracking-tight drop-shadow-xl" style={{fontFamily:'Montserrat,Druk,sans-serif',letterSpacing:'0.05em'}}>
            COMPREHENSIVE<br />TRADING PROTECTION
          </h1>
          <p className="mt-6 text-xl md:text-2xl font-semibold text-[#232323] opacity-80" style={{fontFamily:'Montserrat,sans-serif'}}>Everything you need to trade safely and profitably in the Web3 ecosystem</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            const isLive = tool.status === "Live";
            const toolHref = "/tools/dashboard";
            return (
              <Link href={toolHref} key={tool.id} className="block">
                <Card className={`group rounded-3xl bg-gradient-to-br from-[#F3EFFF]/80 to-[#FFEBF5]/90 border-2 border-[#F1E3F6] shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer relative overflow-hidden`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="rounded-xl bg-white/80 p-3 shadow-md mb-2">
                        <IconComponent className="w-7 h-7 text-[#A259FF] group-hover:text-[#FF1C8B] transition-colors" strokeWidth={2} />
                      </div>
                      <Badge className={`uppercase font-bold px-4 py-1 rounded-full text-xs tracking-wider ${isLive ? 'bg-[#FFEBF5] text-[#FF1C8B]' : 'bg-[#F3EFFF] text-[#A259FF]'}`}>{tool.status}</Badge>
                    </div>
                    <CardTitle className="text-lg md:text-xl font-extrabold uppercase mb-2 bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent tracking-tight" style={{fontFamily:'Montserrat,Druk,sans-serif'}}>{tool.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-5">
                    <CardDescription className="text-base text-[#232323] opacity-90" style={{fontFamily:'Montserrat,sans-serif'}}>{tool.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button className={`rounded-xl font-bold px-8 py-3 text-base tracking-wide transition-all duration-150 ${isLive ? 'bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] text-white hover:opacity-90' : 'bg-[#F3EFFF] text-[#A259FF] opacity-60 cursor-not-allowed'}`} disabled={!isLive} style={{fontFamily:'Montserrat,sans-serif'}}>
                      {tool.cta}
                    </Button>
                  </CardFooter>
                  <div className="absolute inset-0 pointer-events-none group-hover:scale-105 transition-transform duration-200 rounded-3xl border-2 border-transparent group-hover:border-[#FF1C8B]/30"></div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Section with Paper Tear */}
      <div className="footer-section">
        <div className="paper-tear"></div>
        <div className="footer-content">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center">
            <h2 className="footer-title">
              READY TO DOMINATE
              <br />
              WEB3?
            </h2>
            <p className="footer-subtitle">
              Join thousands of traders who trust our tools for safer, more profitable trading
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
              <Button className="cta-button primary">GET STARTED FREE</Button>
              <Button className="cta-button secondary">VIEW PRICING</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
