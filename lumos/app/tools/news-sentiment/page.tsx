"use client";

import { useState, useCallback } from 'react';
import Sidebar from '../Sidebar';
import {
  FiSearch,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiClock
} from 'react-icons/fi';
import {
  FaBitcoin,
  FaEthereum,
  FaBookmark,
  FaRegBookmark
} from 'react-icons/fa';
import { SiSolana } from 'react-icons/si';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Sentiment = 'all' | 'positive' | 'negative' | 'neutral';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  coin: string;
  excerpt: string;
  engagement: number;
  fullContent: string;
}

export default function NewsSentiment() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<Sentiment>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<Record<string, boolean>>({});
  const itemsPerPage = 10;
  
  // Mock news data
  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: 'Bitcoin Surges Past $65K as Institutional Investors Show Strong Demand',
      source: 'CoinDesk',
      time: '2h ago',
      sentiment: 'positive',
      sentimentScore: 0.87,
      coin: 'BTC',
      excerpt: 'Bitcoin price jumps as institutional inflows reach $1.2B this week.',
      engagement: 2450,
      fullContent: 'Bitcoin (BTC) has surged past the $65,000 mark, reaching its highest level in months as institutional investors continue to show strong demand. According to recent data, institutional inflows into Bitcoin have reached $1.2 billion this week alone, signaling growing confidence in the leading cryptocurrency. Analysts attribute this surge to several factors, including increasing adoption by major financial institutions and growing concerns about inflation. The price movement comes amid a broader market rally that has seen most major cryptocurrencies post significant gains over the past week.'
    },
    {
      id: '2',
      title: 'Ethereum Network Fees Drop to 6-Month Low',
      source: 'Decrypt',
      time: '5h ago',
      sentiment: 'positive',
      sentimentScore: 0.78,
      coin: 'ETH',
      excerpt: 'Average transaction fees on Ethereum have decreased by 65%.',
      engagement: 1890,
      fullContent: 'The Ethereum network has seen a significant drop in transaction fees, reaching a six-month low with an average decrease of 65%. This reduction in gas fees comes as a relief to users who have been struggling with high transaction costs on the network. The decrease is attributed to several factors, including the implementation of EIP-1559 and increased layer-2 adoption. Developers note that this could lead to increased usage of decentralized applications on the Ethereum network, particularly in the DeFi and NFT sectors.'
    },
    {
      id: '3',
      title: 'Solana Outage Raises Concerns About Network Stability',
      source: 'The Block',
      time: '8h ago',
      sentiment: 'negative',
      sentimentScore: -0.65,
      coin: 'SOL',
      excerpt: 'The Solana network experienced a 4-hour outage.',
      engagement: 3210,
      fullContent: 'The Solana blockchain experienced a significant outage lasting approximately four hours, marking another incident in a series of network stability issues. Validators were forced to coordinate a restart of the network, which successfully brought services back online. This is not the first time Solana has faced such issues, with previous outages occurring in 2023. The incident has reignited discussions about the trade-offs between decentralization, scalability, and security in blockchain networks.'
    },
    {
      id: '4',
      title: 'DeFi TVL Surges Past $100 Billion Milestone',
      source: 'DeFi Pulse',
      time: '1d ago',
      sentiment: 'positive',
      sentimentScore: 0.82,
      coin: 'ETH',
      excerpt: 'Total value locked in DeFi protocols crosses $100B for the first time since 2022.',
      engagement: 2870,
      fullContent: 'The total value locked (TVL) in decentralized finance (DeFi) protocols has surpassed $100 billion, reaching its highest level since 2022. This milestone comes as the broader cryptocurrency market continues to recover from the bear market. Leading the growth are lending protocols and decentralized exchanges, which have seen significant increases in both TVL and user activity. Analysts suggest that the growth is being driven by increasing institutional interest and the maturation of DeFi infrastructure. The milestone represents a significant recovery from the lows of 2023 and suggests growing confidence in the DeFi sector.'
    },
    {
      id: '5',
      title: 'NFT Trading Volume Hits 12-Month High',
      source: 'NFT Now',
      time: '1d ago',
      sentiment: 'positive',
      sentimentScore: 0.75,
      coin: 'ETH',
      excerpt: 'Monthly NFT trading volume reaches highest level in a year.',
      engagement: 2150,
      fullContent: 'The non-fungible token (NFT) market has recorded its highest monthly trading volume in 12 months, with over $3.5 billion worth of NFTs changing hands in the past 30 days. The resurgence comes after a prolonged bear market that saw trading volumes and prices decline significantly. Leading the recovery are blue-chip NFT collections and new projects with strong utility components. Market analysts attribute the renewed interest to several factors, including the launch of new platforms, improved user experiences, and growing mainstream adoption. The trend suggests that the NFT market may be entering a new growth phase.'
    },
    {
      id: '6',
      title: 'Regulatory Crackdown on Stablecoin Issuers Intensifies',
      source: 'CoinTelegraph',
      time: '2d ago',
      sentiment: 'negative',
      sentimentScore: -0.7,
      coin: 'USDT',
      excerpt: 'Global regulators increase scrutiny on stablecoin reserves and operations.',
      engagement: 1980,
      fullContent: 'Financial regulators worldwide are intensifying their scrutiny of stablecoin issuers, with a particular focus on reserve transparency and operational practices. The increased regulatory pressure comes amid growing concerns about the potential systemic risks posed by stablecoins to the broader financial system. Several jurisdictions have announced new guidelines requiring stablecoin issuers to meet stringent reserve and reporting requirements. The move has sparked debate within the crypto community, with some arguing that the regulations are necessary for consumer protection, while others warn that they could stifle innovation. The regulatory developments are being closely watched as they could have significant implications for the broader cryptocurrency market.'
    },
    {
      id: '7',
      title: 'Layer-2 Solutions See Record Adoption',
      source: 'The Defiant',
      time: '2d ago',
      sentiment: 'positive',
      sentimentScore: 0.85,
      coin: 'ETH',
      excerpt: 'Ethereum layer-2 networks hit all-time high in daily transactions.',
      engagement: 1760,
      fullContent: 'Ethereum layer-2 scaling solutions have reached a new milestone, processing a record number of daily transactions as users seek to avoid high gas fees on the mainnet. The combined transaction volume across major layer-2 networks has surpassed 1.5 million per day, representing a 300% increase from the previous quarter. Leading the growth are optimistic rollups and zk-rollups, which have seen significant improvements in both performance and user experience. The increased adoption suggests that layer-2 solutions are becoming an integral part of the Ethereum ecosystem.'
    },
    {
      id: '8',
      title: 'Institutional Crypto Products See 8th Consecutive Week of Inflows',
      source: 'CoinShares',
      time: '3d ago',
      sentiment: 'positive',
      sentimentScore: 0.88,
      coin: 'BTC',
      excerpt: 'Digital asset investment products attract $423M in new investments.',
      engagement: 2340,
      fullContent: 'Digital asset investment products have recorded their eighth consecutive week of inflows, with $423 million in new investments, according to the latest data from CoinShares. The continued institutional interest comes amid growing recognition of cryptocurrencies as a legitimate asset class. Bitcoin investment products accounted for the majority of inflows, followed by Ethereum and other altcoins. The trend reflects increasing confidence among institutional investors, who are attracted by the potential for portfolio diversification and inflation hedging. Analysts suggest that the sustained inflows could signal the beginning of a new phase of institutional adoption in the cryptocurrency market.'
    },
    {
      id: '9',
      title: 'Crypto Regulation Framework Announced by G20',
      source: 'Financial Times',
      time: '3d ago',
      sentiment: 'neutral',
      sentimentScore: 0.1,
      coin: 'GLOBAL',
      excerpt: 'G20 nations agree on comprehensive crypto regulatory framework.',
      engagement: 3120,
      fullContent: 'The G20 nations have reached a consensus on a comprehensive regulatory framework for cryptocurrencies, marking a significant step towards global coordination in the digital asset space. The framework includes guidelines for consumer protection, market integrity, and financial stability, while also addressing the risks associated with stablecoins and decentralized finance (DeFi). The agreement comes after months of negotiations and is seen as a response to the rapid growth and increasing mainstream adoption of digital assets. While the framework provides much-needed clarity, some industry participants have raised concerns about potential regulatory fragmentation and the need for consistent implementation across jurisdictions.'
    },
    {
      id: '10',
      title: 'Web3 Gaming Sector Raises $1B in Q2 2025',
      source: 'DappRadar',
      time: '3d ago',
      sentiment: 'positive',
      sentimentScore: 0.8,
      coin: 'SOL',
      excerpt: 'Blockchain gaming projects secure record funding despite market conditions.',
      engagement: 1980,
      fullContent: 'The Web3 gaming sector has raised over $1 billion in venture capital funding in the second quarter of 2025, setting a new quarterly record. The funding comes despite challenging market conditions and reflects growing confidence in the long-term potential of blockchain gaming. The investments are being directed towards game development studios, infrastructure providers, and platforms that enable player-owned economies. Industry experts suggest that the influx of capital will accelerate the development of high-quality blockchain games and help overcome some of the technical and user experience challenges that have hindered mainstream adoption. The trend underscores the gaming industry\'s increasing convergence with blockchain technology.'
    },
    {
      id: '11',
      title: 'Central Bank Digital Currency Pilots Expand Globally',
      source: 'CBDC Tracker',
      time: '4d ago',
      sentiment: 'neutral',
      sentimentScore: 0.15,
      coin: 'CBDC',
      excerpt: 'Over 100 countries now exploring CBDCs, with 20+ in pilot phase.',
      engagement: 1980,
      fullContent: 'Central Bank Digital Currencies (CBDCs) are gaining momentum globally, with over 100 countries now exploring their implementation and more than 20 countries in advanced pilot phases, according to the latest data from the CBDC Tracker. The rapid development comes as central banks seek to modernize financial systems and counter the rise of private digital currencies. Recent months have seen several countries, including the United States, European Union, and Japan, make significant progress in their CBDC initiatives. The expanding pilot programs are testing various technical architectures and use cases, from retail payments to cross-border transactions. While proponents highlight the potential benefits for financial inclusion and payment efficiency, concerns remain about privacy implications and the impact on commercial banks.'
    },
    {
      id: '12',
      title: 'Bitcoin Mining Difficulty Reaches All-Time High',
      source: 'Bitcoin Magazine',
      time: '4d ago',
      sentiment: 'neutral',
      sentimentScore: 0.15,
      coin: 'BTC',
      excerpt: 'Network difficulty increases by 6.5% as more miners join the network.',
      engagement: 1850,
      fullContent: 'Bitcoin mining difficulty has reached a new all-time high, increasing by 6.5% in the latest adjustment. The rise in difficulty reflects growing competition among miners and indicates a healthy and secure network. The increase comes despite recent volatility in Bitcoin\'s price and follows a period of significant investment in mining infrastructure. Analysts suggest that the growing difficulty could lead to further centralization in the mining industry, as only the most efficient operations remain profitable. The development highlights the ongoing evolution of Bitcoin\'s mining ecosystem and its importance to the network\'s security and decentralization.'
    },
    {
      id: '13',
      title: 'Decentralized Social Media Platform Surpasses 10M Users',
      source: 'The Defiant',
      time: '5d ago',
      sentiment: 'positive',
      sentimentScore: 0.78,
      coin: 'ETH',
      excerpt: 'Web3 social network reaches major milestone in user adoption.',
      engagement: 2450,
      fullContent: 'A leading decentralized social media platform has surpassed 10 million users, marking a significant milestone for Web3 social networking. The platform, which operates on blockchain technology, offers users greater control over their data and content monetization opportunities. The growth comes amid growing concerns about data privacy and content moderation on traditional social media platforms. The platform\'s success demonstrates the potential for blockchain technology to disrupt the social media landscape by creating more transparent and user-centric alternatives. Industry analysts suggest that the milestone could pave the way for broader adoption of decentralized social media solutions.'
    },
    {
      id: '14',
      title: 'Crypto Hack Results in $200M Exploit',
      source: 'The Block',
      time: '5d ago',
      sentiment: 'negative',
      sentimentScore: -0.9,
      coin: 'ETH',
      excerpt: 'Cross-chain bridge vulnerability leads to one of the largest DeFi hacks of the year.',
      engagement: 3210,
      fullContent: 'A major decentralized finance (DeFi) protocol has suffered a $200 million exploit due to a vulnerability in its cross-chain bridge. The attack, one of the largest of the year, highlights the ongoing security challenges facing the DeFi sector. The hackers exploited a flaw in the protocol\'s smart contract to mint tokens fraudulently, which were then swapped for other assets and bridged to different blockchains. The incident has reignited discussions about the security of cross-chain bridges, which have been frequent targets for attackers. The protocol\'s team has paused operations and is working on a recovery plan, while blockchain analytics firms are assisting in tracking the stolen funds.'
    }
  ];

  const filteredNews = useCallback(() => {
    return mockNews.filter(item =>
      (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedSentiment === 'all' || item.sentiment === selectedSentiment)
    );
  }, [searchQuery, selectedSentiment]);

  const paginatedNews = useCallback(() => {
    return filteredNews().slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [currentPage, filteredNews]);

  const totalPages = Math.ceil(filteredNews().length / itemsPerPage);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const openNewsModal = (news: NewsItem) => {
    setSelectedNews(news);
  };

  const closeNewsModal = () => {
    setSelectedNews(null);
  };

  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive': return 'text-green-500 bg-green-500/20';
      case 'negative': return 'text-red-500 bg-red-500/20';
      default: return 'text-amber-500 bg-amber-500/20';
    }
  };

  const getCoinIcon = (coin: string) => {
    const baseClass = "w-5 h-5 rounded-full p-0.5";
    switch (coin) {
      case 'BTC': return <FaBitcoin className={`${baseClass} bg-amber-500/20 text-amber-500`} />;
      case 'ETH': return <FaEthereum className={`${baseClass} bg-blue-500/20 text-blue-500`} />;
      case 'SOL': return <SiSolana className={`${baseClass} bg-green-500/20 text-green-500`} />;
      default: return <div className={`${baseClass} bg-muted`}></div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground bg-paper">
      <Sidebar selected="News Sentiment" />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-druk tracking-tight mb-1 text-primary">
              NEWS SENTIMENT ANALYSIS
            </h1>
            <p className="text-sm text-muted-foreground">Track market sentiment across crypto news sources</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search news..."
                  className="pl-9 bg-background/80 border-border/50 focus-visible:ring-primary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-[180px]">
              <Select 
                value={selectedSentiment} 
                onValueChange={(value) => setSelectedSentiment(value as Sentiment)}
              >
                <SelectTrigger className="bg-background/80 border-border/50">
                  <SelectValue placeholder="Filter by sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive" className="text-green-600">Positive</SelectItem>
                  <SelectItem value="negative" className="text-red-600">Negative</SelectItem>
                  <SelectItem value="neutral" className="text-amber-600">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
              <div className="h-4 w-4 text-green-500">
                <FiArrowUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockNews.filter(n => n.sentiment === 'positive').length}</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Negative Sentiment</CardTitle>
              <div className="h-4 w-4 text-red-500">
                <FiArrowDown className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockNews.filter(n => n.sentiment === 'negative').length}</div>
              <p className="text-xs text-muted-foreground">-5% from yesterday</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/80 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FiClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockNews.length}</div>
              <p className="text-xs text-muted-foreground">Analyzed in last 24h</p>
            </CardContent>
          </Card>
        </div>

        {/* News Feed */}
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Latest Market News</CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="h-8 w-8 p-0" 
              >
                <FiChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage} 
                disabled={currentPage >= totalPages}
                className="h-8 w-8 p-0"
              >
                <FiChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedNews().map((item) => (
                <div 
                  key={item.id} 
                  className="group p-4 hover:bg-accent/50 rounded-lg transition-colors border-b border-border/50 last:border-0 cursor-pointer"
                  onClick={() => openNewsModal(item)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getCoinIcon(item.coin)}
                        <span className="text-xs font-medium text-muted-foreground">{item.source}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                        <Badge 
                          variant={item.sentiment === 'positive' ? 'default' : 'destructive'} 
                          className="ml-2 text-xs"
                        >
                          {item.sentiment}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-foreground mb-1.5 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">{item.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>{item.engagement.toLocaleString()} engagements</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-8 gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            openNewsModal(item);
                          }}
                        >
                          Read more <FiExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-lg bg-muted/50 flex-shrink-0 flex items-center justify-center">
                      <div className="text-2xl">
                        {item.sentiment === 'positive' ? '📈' : item.sentiment === 'negative' ? '📉' : '📊'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredNews.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No news articles found matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-4 border-t border-border/50">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              className="gap-1"
            >
              <FiChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredNews.length)} of {filteredNews.length} results
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextPage} 
              disabled={currentPage >= totalPages}
              className="gap-1"
            >
              Next <FiChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* News Detail Modal */}
        <Dialog open={!!selectedNews} onOpenChange={(open) => !open && closeNewsModal()}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedNews && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <DialogTitle className="text-2xl">{selectedNews.title}</DialogTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={closeNewsModal}
                      className="h-8 w-8 -mt-2 -mr-2"
                    >
                      <FiX className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                    <span className="font-medium">{selectedNews.source}</span>
                    <span>•</span>
                    <span>{selectedNews.time}</span>
                    <Badge 
                      variant={selectedNews.sentiment === 'positive' ? 'default' : 'destructive'} 
                      className="ml-2 text-xs"
                    >
                      {selectedNews.sentiment}
                    </Badge>
                  </div>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-2">
                    {getCoinIcon(selectedNews.coin)}
                    <span className="text-sm font-medium">{selectedNews.coin}</span>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-foreground">{selectedNews.fullContent || selectedNews.excerpt}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>{selectedNews.engagement.toLocaleString()} engagements</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Share
                      </Button>
                      <Button size="sm">
                        View on {selectedNews.source}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
