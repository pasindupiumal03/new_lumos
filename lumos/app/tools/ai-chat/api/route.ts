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
  [key: string]: any; // For any additional properties
}

// Initialize OpenAI client with environment variable
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Store the last crypto details for context
let lastCryptoDetails: CryptoDetails | null = null;

// Export both POST and OPTIONS methods
export async function POST(request: Request) {
  // Handle CORS for actual request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Check if the request method is POST
  if (request.method !== 'POST') {
    return new NextResponse(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    // Check if OpenAI is properly initialized
    if (!openai) {
      console.error('OpenAI client not initialized - check OPENAI_API_KEY');
      return new NextResponse(
        JSON.stringify({ error: 'Server configuration error' }), 
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { message, conversationHistory }: ChatRequest = await request.json();

    // Validate input
    if (!message || typeof message !== 'string') {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Step 1: Extract crypto details from the message
    const cryptoDetails = await extractCryptoDetails(message);
    
    // Use last crypto details if the message is a follow-up about crypto
    const relevantCryptoDetails = cryptoDetails || 
      (message.toLowerCase().match(/(price|market cap|volume|liquidity|change)/i) ? lastCryptoDetails : null);
    
    if (relevantCryptoDetails) {
      lastCryptoDetails = relevantCryptoDetails;
    }

    // Step 2: Get crypto data if relevant
    let cryptoDataContext = '';
    if (relevantCryptoDetails) {
      const cryptoData = await getCryptoData(relevantCryptoDetails);
      cryptoDataContext = formatCryptoData(cryptoData);
    }

    // Step 3: Generate AI response
    const response = await generateAIResponse(message, conversationHistory, cryptoDataContext);
    
    return new NextResponse(
      JSON.stringify({ message: response }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
    
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to process your request' }),
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
          content: `Extract cryptocurrency information from the user's message. 
          Return a JSON object with: {token: string, symbol: string, name: string}.
          Example: {'token': '0x...', 'symbol': 'BTC', 'name': 'Bitcoin'}
          If no crypto mentioned, return null.`
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
  
  const query = details.token || details.symbol || details.name;
  if (!query) return null;

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(query)}&order=market_cap_desc&per_page=1&page=1&sparkline=false`,
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
  if (!data) return '';
  
  return `
Current ${data.name} (${data.symbol.toUpperCase()}) Data:
- Price: $${data.current_price?.toFixed(2) || 'N/A'}
- 24h Change: ${data.price_change_percentage_24h?.toFixed(2) || 'N/A'}%
- Market Cap: $${data.market_cap?.toLocaleString() || 'N/A'}
- 24h Volume: $${data.total_volume?.toLocaleString() || 'N/A'}
- ATH: $${data.ath?.toFixed(2) || 'N/A'} (${data.ath_change_percentage?.toFixed(2) || 'N/A'}% from ATH)
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
    return 'I apologize, but I am currently unable to process your request. Please try again later.';
  }

  const systemPrompt = `You are Lumos AI, a professional and knowledgeable crypto trading assistant. Your expertise includes:
- Cryptocurrency markets and trading strategies
- Blockchain technology and DeFi
- Technical and fundamental analysis
- Risk management and portfolio diversification

Guidelines:
- Be concise, accurate, and professional
- Provide data-driven insights when possible
- Acknowledge uncertainty rather than speculating
- Use markdown for better readability (bold, lists, etc.)
- Always maintain a helpful and educational tone

${cryptoContext ? 'CRYPTO CONTEXT (use this data in your response when relevant):\n' + cryptoContext : ''}`;

  try {
    const messages: OpenAIMessage[] = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.slice(-10).map(msg => ({
        role: (msg.isUser ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'I apologize, but I encountered an issue generating a response.';
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'I apologize, but I encountered an error while processing your request. Please try again later.';
  }
}
