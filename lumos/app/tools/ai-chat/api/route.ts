import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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

// Store the last crypto details for context
let lastCryptoDetails: CryptoDetails | null = null;

export async function POST(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (request.method !== 'POST') {
    return new NextResponse(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    if (!openai) {
      console.error('OpenAI client not initialized - check OPENAI_API_KEY');
      return new NextResponse(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { message, conversationHistory }: ChatRequest = await request.json();

    if (!message || typeof message !== 'string') {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Step 1: Extract crypto details
    const cryptoDetails = await extractCryptoDetails(message);
    const relevantCryptoDetails = cryptoDetails || 
      (message.toLowerCase().match(/(price|market cap|volume|liquidity|change)/i) ? lastCryptoDetails : null);

    if (relevantCryptoDetails) {
      lastCryptoDetails = relevantCryptoDetails;
    }

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
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('AI Chat API Error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'I apologize, but I encountered a temporary issue. Please try your question again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}

async function extractCryptoDetails(message: string): Promise<CryptoDetails | null> {
  if (!openai) {
    console.error('OpenAI client not initialized');
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a cryptocurrency extraction assistant. Extract cryptocurrency information from the user's message. 
          Return a JSON object with: {token: string, symbol: string, name: string}.
          Example: {"token": "", "symbol": "BTC", "name": "Bitcoin"}
          If no crypto mentioned, return null.
          For common cryptocurrencies, map names to symbols (e.g., "Bitcoin" to "BTC", "Ethereum" to "ETH").
          NEVER mention that you are an AI model or OpenAI. Only return the JSON or null.`
        },
        { role: 'user', content: message }
      ],
      temperature: 0.1,
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content;
    if (!content || content.trim() === 'null') return null;

    try {
      const details = JSON.parse(content);
      if (details && (details.symbol || details.name)) {
        return {
          token: details.token || '',
          symbol: details.symbol || '',
          name: details.name || ''
        };
      }
      return null;
    } catch (parseError) {
      console.error('Error parsing crypto details:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error extracting crypto details:', error);
    return null;
  }
}

async function getCryptoData(details: CryptoDetails): Promise<CoinGeckoMarketData | null> {
  if (!details) return null;

  // Use CoinGecko ID for more accurate queries
  const coinId = details.symbol.toLowerCase() === 'btc' ? 'bitcoin' :
                 details.symbol.toLowerCase() === 'eth' ? 'ethereum' :
                 details.name.toLowerCase() || details.symbol.toLowerCase();

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(coinId)}&order=market_cap_desc&per_page=1&page=1&sparkline=false`,
      {
        headers: {
          'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch crypto data:', response.status, response.statusText);
      return null;
    }

    const data = await response.json() as CoinGeckoMarketData[];
    return data[0] || null;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return null;
  }
}

function formatCryptoData(data: CoinGeckoMarketData | null): string {
  if (!data) return 'No data available for the requested cryptocurrency.';

  return `
**${data.name} (${data.symbol.toUpperCase()}) Market Data**:
- **Current Price**: $${data.current_price?.toFixed(2) || 'N/A'}
- **24h Price Change**: ${data.price_change_percentage_24h?.toFixed(2) || 'N/A'}%
- **Market Cap**: $${data.market_cap?.toLocaleString() || 'N/A'}
- **24h Trading Volume**: $${data.total_volume?.toLocaleString() || 'N/A'}
- **All-Time High (ATH)**: $${data.ath?.toFixed(2) || 'N/A'} (${data.ath_change_percentage?.toFixed(2) || 'N/A'}% from ATH)
`;
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