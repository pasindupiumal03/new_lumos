import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Server, TrendingUp, Twitter, Activity, Zap, Shield, BarChart3, Bot } from "lucide-react"
import Link from "next/link";

const toolRoutes: Record<number, string> = {
  1: "/tools/ai-chat",
  2: "/tools/news-sentiment",
  3: "/tools/eth-tracker",
  4: "/tools/solana-eco",
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
    <div className="min-h-screen custom-gradient">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md shadow-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent tracking-wider drop-shadow-lg" style={{fontFamily:'Montserrat,Druk,sans-serif',letterSpacing:'0.12em'}}>LUMOS</h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-16 flex items-center space-x-12">
                {['Features','About','Terms','Privacy'].map((nav) => (
                  <a key={nav} href="#" className="relative font-bold text-lg uppercase tracking-wider text-white/80 hover:text-[#5B50E1] transition-colors duration-200" style={{fontFamily:'Montserrat,sans-serif',letterSpacing:'0.1em'}}>
                    <span className="nav-underline group-hover:w-full"></span>{nav}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="font-extrabold text-white text-[2.8rem] md:text-[5rem] leading-none uppercase tracking-wider drop-shadow-xl" style={{fontFamily:'Impact,Arial Black,sans-serif',letterSpacing:'0.15em'}}>
            COMPREHENSIVE<br />TRADING PROTECTION
          </h1>
          <p className="mt-6 text-xl md:text-2xl font-semibold text-white/70" style={{fontFamily:'Montserrat,sans-serif'}}>Everything you need to trade safely and profitably in the Web3 ecosystem</p>
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
                <Card className={`group rounded-3xl bg-white/5 backdrop-blur-md border-2 border-t-white/60 border-r-white/10 border-b-white/10 border-l-white/10 shadow-2xl hover:shadow-[0_0_50px_rgba(91,80,225,0.3)] hover:border-t-[#5B50E1]/50 transition-all duration-300 cursor-pointer relative overflow-hidden`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 shadow-md mb-2 border border-white/20">
                        <IconComponent className="w-7 h-7 text-white/80 group-hover:text-[#5B50E1] transition-colors" strokeWidth={2} />
                      </div>
                      <Badge className={`uppercase font-bold px-4 py-1 rounded-full text-xs tracking-wider ${isLive ? 'bg-[#5B50E1]/20 text-[#5B50E1] border border-[#5B50E1]/30' : 'bg-white/10 text-white/60 border border-white/20'}`}>{tool.status}</Badge>
                    </div>
                    <CardTitle className="text-lg md:text-xl font-extrabold uppercase mb-2 text-white/75 tracking-wide" style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.08em'}}>{tool.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-5">
                    <CardDescription className="text-base text-white/70" style={{fontFamily:'Poppins,sans-serif'}}>{tool.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button className={`rounded-xl font-bold px-8 py-3 text-base tracking-wider transition-all duration-150 ${isLive ? 'gradient-button text-white' : 'bg-white/10 text-white/40 opacity-60 cursor-not-allowed border border-white/20'}`} disabled={!isLive} style={{fontFamily:'Poppins,sans-serif',letterSpacing:'0.08em'}}>
                      {tool.cta}
                    </Button>
                  </CardFooter>
                  <div className="absolute inset-0 pointer-events-none group-hover:scale-105 transition-transform duration-200 rounded-3xl border-2 border-transparent group-hover:border-[#5B50E1]/50"></div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

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
            <Button className="gradient-button text-white font-bold uppercase tracking-wider px-8 py-4 text-sm rounded-xl transition-all duration-300" style={{fontFamily:'Montserrat,sans-serif',letterSpacing:'0.1em'}}>GET STARTED FREE</Button>
            <Button className="bg-white/10 border-2 border-white/30 text-white hover:border-[#5B50E1] hover:text-[#5B50E1] hover:bg-white/5 font-bold uppercase tracking-wider px-8 py-4 text-sm rounded-xl transition-all duration-300 backdrop-blur-sm" style={{fontFamily:'Montserrat,sans-serif',letterSpacing:'0.1em'}}>VIEW PRICING</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
