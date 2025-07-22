import { NextResponse } from 'next/server';
import OpenAI from 'openai';

type TokenInfo = {
  id: string;
  symbol: string;
  name: string;
  platforms: {
    solana?: string;
    ethereum?: string;
    [key: string]: string | undefined;
  };
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Cache for token info to reduce API calls
const tokenCache = new Map<string, TokenInfo>();
const TOKEN_CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatRequest {
  message: string;
  conversationHistory: Message[];
}

interface CryptoDetails {
  token: string;
  symbol: string;
  name: string;
  isSolanaToken?: boolean;
  tokenAddress?: string;
}

interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  ath: number;
  ath_change_percentage: number;
  [key: string]: any;
}

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// CoinGecko API base URL
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Solana Tracker API base URL
const SOLANA_TRACKER_API = 'https://api.solanatracker.io/v1';

// Common Solana token addresses
const SOLANA_TOKENS: Record<string, { name: string; address: string }> = {
  'SOL': { name: 'Solana', address: 'So11111111111111111111111111111111111111112' },
  'USDC': { name: 'USD Coin (Solana)', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  'USDT': { name: 'Tether USD (Solana)', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
  'RAY': { name: 'Raydium', address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
  'SRM': { name: 'Serum', address: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt' },
};

// Store the last crypto details for context
let lastCryptoDetails: CryptoDetails | null = null;

export async function POST(request: Request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = (await request.json()) as ChatRequest;

    // Check for Solana token price queries
    const solanaTokenMatch = message.match(/price of (\w+)(?: on solana)?/i);
    
    if (solanaTokenMatch) {
      const tokenSymbol = solanaTokenMatch[1].toUpperCase();
      
      // Check if it's a known Solana token
      if (SOLANA_TOKENS[tokenSymbol] || tokenSymbol === 'SOL') {
        const tokenInfo = SOLANA_TOKENS[tokenSymbol] || { name: 'Solana', address: 'So11111111111111111111111111111111111111112' };
        
        try {
          const priceData = await getSolanaTokenPrice(tokenInfo.address);
          return new NextResponse(
            JSON.stringify({ 
              message: `The current price of ${tokenInfo.name} (${tokenSymbol}) is $${priceData.price.toFixed(4)} USD. ` +
                      `24h change: ${priceData.priceChange24h > 0 ? '📈' : '📉'} ${Math.abs(priceData.priceChange24h).toFixed(2)}%.`
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            }
          );
        } catch (error) {
          console.error('Error fetching Solana token price:', error);
          // Continue to normal flow if there's an error
        }
      }
    }

    // Step 1: Extract crypto details from the message
    const relevantCryptoDetails = await extractCryptoDetails(message);

    // Step 2: Fetch crypto data if relevant
    let cryptoDataContext = '';
    if (relevantCryptoDetails) {
      const cryptoData = await getCryptoData(relevantCryptoDetails);
      if (cryptoData) {
        cryptoDataContext = formatCryptoData(cryptoData);
      } else {
        cryptoDataContext = `Unable to fetch current data for ${relevantCryptoDetails.name || relevantCryptoDetails.symbol}. Please try again later.`;
      }
    }

    // Step 3: Generate AI response with explicit instruction to use crypto data
    const response = await generateAIResponse(message, conversationHistory, cryptoDataContext);

    return new NextResponse(
      JSON.stringify({ message: response }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('Error in AI chat API:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to process your request' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
}

async function extractCryptoDetails(message: string): Promise<CryptoDetails | null> {
  // Check for Solana tokens first
  const solanaTokenMatch = message.match(/price of (\w+)(?: on solana)?/i);
  if (solanaTokenMatch) {
    const tokenSymbol = solanaTokenMatch[1].toUpperCase();
    if (SOLANA_TOKENS[tokenSymbol]) {
      return {
        token: tokenSymbol.toLowerCase(),
        symbol: tokenSymbol,
        name: SOLANA_TOKENS[tokenSymbol].name,
        isSolanaToken: true,
        tokenAddress: SOLANA_TOKENS[tokenSymbol].address
      };
    } else if (tokenSymbol === 'SOL') {
      return {
        token: 'solana',
        symbol: 'SOL',
        name: 'Solana',
        isSolanaToken: true,
        tokenAddress: 'So11111111111111111111111111111111111111112'
      };
    }
  }

  // Simple keyword matching - can be enhanced with NLP in the future
  const cryptoKeywords = [
    { token: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    { token: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { token: 'solana', symbol: 'SOL', name: 'Solana', isSolanaToken: true, tokenAddress: 'So11111111111111111111111111111111111111112' },
    { token: 'cardano', symbol: 'ADA', name: 'Cardano' },
    { token: 'ripple', symbol: 'XRP', name: 'XRP' },
    { token: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
    { token: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  ];

  const lowerMessage = message.toLowerCase();
  
  for (const keyword of cryptoKeywords) {
    if (lowerMessage.includes(keyword.token) || lowerMessage.includes(keyword.symbol.toLowerCase())) {
      return keyword;
    }
  }

  // Try to find token by symbol in Solana tokens
  const symbolMatch = message.match(/\b([A-Z]{2,10})\b/g);
  if (symbolMatch) {
    for (const symbol of symbolMatch) {
      const upperSymbol = symbol.toUpperCase();
      if (SOLANA_TOKENS[upperSymbol]) {
        return {
          token: upperSymbol.toLowerCase(),
          symbol: upperSymbol,
          name: SOLANA_TOKENS[upperSymbol].name,
          isSolanaToken: true,
          tokenAddress: SOLANA_TOKENS[upperSymbol].address
        };
      }
    }
  }

  return null;
}

async function getCryptoData(details: CryptoDetails): Promise<CoinGeckoMarketData | null> {
  try {
    // For Solana tokens, use a different endpoint
    if (details.isSolanaToken && details.tokenAddress) {
      return await getSolanaTokenPrice(details.tokenAddress);
    }

    // For other tokens, use the standard CoinGecko API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${details.token}&price_change_percentage=24h`,
      {
        headers: {
          'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return null;
  }
}

async function getSolanaTokenPrice(tokenAddress: string): Promise<CoinGeckoMarketData> {
  try {
    // First try to get token info from CoinGecko
    const cgResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/solana/contract/${tokenAddress}`,
      {
        headers: {
          'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || '',
        },
      }
    );

    if (cgResponse.ok) {
      const cgData = await cgResponse.json();
      return {
        id: cgData.id,
        symbol: cgData.symbol.toUpperCase(),
        name: cgData.name,
        current_price: cgData.market_data.current_price.usd,
        price_change_percentage_24h: cgData.market_data.price_change_percentage_24h,
        market_cap: cgData.market_data.market_cap.usd,
        total_volume: cgData.market_data.total_volume.usd,
        ath: cgData.market_data.ath.usd,
        ath_change_percentage: cgData.market_data.ath_change_percentage.usd,
      };
    }

    // Fallback to Solana Tracker API if CoinGecko fails
    if (process.env.SOLANA_TRACKER_API_KEY) {
      const solTrackerResponse = await fetch(
        `${SOLANA_TRACKER_API}/tokens/${tokenAddress}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SOLANA_TRACKER_API_KEY}`,
          },
        }
      );

      if (solTrackerResponse.ok) {
        const solData = await solTrackerResponse.json();
        return {
          id: solData.id || tokenAddress,
          symbol: solData.symbol || 'UNKNOWN',
          name: solData.name || 'Unknown Token',
          current_price: solData.price?.usd || 0,
          price_change_percentage_24h: solData.priceChange24h || 0,
          market_cap: solData.marketCap?.usd || 0,
          total_volume: solData.volume24h?.usd || 0,
          ath: solData.ath?.usd || 0,
          ath_change_percentage: solData.athChangePercentage?.usd || 0,
        };
      }
    }

    throw new Error('Failed to fetch token data from both CoinGecko and Solana Tracker');
  } catch (error) {
    console.error('Error fetching Solana token price:', error);
    throw error;
  }
}

function formatCryptoData(data: CoinGeckoMarketData | null): string {
  if (!data) return '';

  const priceChange24h = data.price_change_percentage_24h || 0;
  const changeEmoji = priceChange24h >= 0 ? '📈' : '📉';
  
  // Format price with appropriate decimal places
  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return 'N/A';
    if (price < 1) return `$${price.toFixed(6)}`;
    if (price < 1000) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  // Format large numbers with K, M, B suffixes
  const formatLargeNumber = (num: number | undefined) => {
    if (num === undefined) return 'N/A';
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };
  
  return `**${data.name} (${data.symbol.toUpperCase()})**\n` +
         `💵 Price: ${formatPrice(data.current_price)} ${changeEmoji} ${Math.abs(priceChange24h).toFixed(2)}% (24h)\n` +
         `🏦 Market Cap: ${formatLargeNumber(data.market_cap)}\n` +
         `📊 24h Volume: ${formatLargeNumber(data.total_volume)}\n` +
         `🚀 ATH: ${formatPrice(data.ath)} (${(data.ath_change_percentage || 0).toFixed(2)}% from ATH)`;
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function generateAIResponse(
  message: string,
  conversationHistory: Message[],
  cryptoContext: string
): Promise<string> {
  if (!openai) {
    console.error('OpenAI client not initialized');
    return 'I apologize, but I am currently experiencing technical difficulties. Please try again in a moment.';
  }

  const systemPrompt = `You are Lumos AI, a professional cryptocurrency trading assistant and blockchain expert. You are NOT an OpenAI model and you should NEVER mention OpenAI, GPT, or that you are an AI model created by OpenAI.

Your identity and expertise:
- You are Lumos AI, a specialized crypto trading assistant
- You have access to real-time cryptocurrency market data
- Your expertise includes cryptocurrency markets, trading strategies, blockchain technology, DeFi, technical analysis, and risk management
- You are knowledgeable, professional, and always maintain your identity as Lumos AI

**CRITICAL INSTRUCTIONS**:
- NEVER mention OpenAI, GPT, or reveal your underlying technology
- ALWAYS respond as Lumos AI
- When you have crypto data available, USE IT and present it as your real-time access to market information
- If crypto data is provided in CRYPTO CONTEXT, prioritize it in your response
- Be concise, accurate, and professional
- Use markdown formatting for better readability
- Maintain a helpful and educational tone
- Focus on cryptocurrency and blockchain-related topics
- If asked about non-crypto topics, gently redirect to crypto/blockchain subjects

${cryptoContext ? '**CRYPTO CONTEXT** (Real-time market data - use this in your response):\n' + cryptoContext : ''}

Remember: You are Lumos AI, not an OpenAI model. Respond accordingly.`;

  try {
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.isUser ? 'user' as 'user' : 'assistant' as 'assistant',
        content: msg.content
      })),
      { role: 'user' as 'user', content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = response.choices[0]?.message?.content || 
      'I apologize, but I encountered an issue processing your request. Please try asking again.';

    // Additional filter to catch any OpenAI mentions that might slip through
    const filteredResponse = aiResponse
      .replace(/OpenAI/gi, 'Lumos AI')
      .replace(/I'm an AI (language )?model/gi, "I'm Lumos AI")
      .replace(/As an AI (language )?model/gi, "As Lumos AI")
      .replace(/GPT-?[0-9]*/gi, 'Lumos AI')
      .replace(/created by OpenAI/gi, 'your crypto trading assistant');

    return filteredResponse;

  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'I apologize, but I encountered a technical issue while processing your request. Please try again, and I\'ll do my best to help you with your crypto-related questions.';
  }
}