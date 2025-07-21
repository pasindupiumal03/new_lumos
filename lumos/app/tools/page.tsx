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

export default function ToolsDashboard() {
  return (
    <div className="min-h-screen bg-paper">
      {/* Navigation */}
      <nav className="border-b border-gray-200/50 bg-paper-light">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-druk tracking-wider text-black">LUMOS</h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-16 flex items-center space-x-12">
                <a href="#" className="nav-link">
                  Features
                </a>
                <a href="#" className="nav-link">
                  About
                </a>
                <a href="#" className="nav-link">
                  Terms
                </a>
                <a href="#" className="nav-link">
                  Privacy
                </a>
              </div>
            </div>

            {/* Language Toggle - Lumos Style */}
            <div className="flex items-center">
              <div className="language-selector">
                <div className="language-option active">EN</div>
                <div className="language-option">RU</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="hero-title font-druk text-[4rem] md:text-[6rem] leading-none">
            COMPREHENSIVE<br />TRADING PROTECTION
          </h1>
          <p className="hero-subtitle">Everything you need to trade safely and profitably in the Web3 ecosystem</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            const isLive = tool.status === "Live";
            const toolHref = "/tools/dashboard";
            return (
              <Link href={toolHref} key={tool.id} className="block">
                <Card className="tool-card group hover:shadow-2xl transition-all duration-200 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="tool-icon">
                        <IconComponent className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <Badge className={`status-badge ${isLive ? "live" : "coming-soon"}`}>{tool.status}</Badge>
                    </div>
                    <CardTitle className="tool-title">{tool.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-5">
                    <CardDescription className="tool-description">{tool.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button className={`tool-button ${isLive ? "live" : "disabled"}`} disabled={!isLive}>
                      <span className="click-hover-label">CLICK</span>
                      {tool.cta}
                    </Button>
                  </CardFooter>
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
