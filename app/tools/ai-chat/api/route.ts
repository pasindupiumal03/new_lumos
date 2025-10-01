import { NextRequest, NextResponse } from 'next/server';

// Helper function to detect token address format
const detectTokenType = (input: string): 'solana' | 'ethereum' | 'unknown' => {
  // Solana addresses are typically 32-44 characters, base58 encoded
  if (input.length >= 32 && input.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(input)) {
    return 'solana';
  }
  // Ethereum addresses start with 0x and are 42 characters long
  if (input.startsWith('0x') && input.length === 42) {
    return 'ethereum';
  }
  return 'unknown';
};

// Function to fetch Solana token data
const fetchSolanaTokenData = async (address: string) => {
  const SOLANA_TRACKER_API_KEY = process.env.SOLANA_TRACKER_API_KEY;
  const SOLANA_API_URL = 'https://data.solanatracker.io';
  
  try {
    console.log(`Fetching Solana token data for: ${address}`);
    
    if (!SOLANA_TRACKER_API_KEY) {
      console.error('SOLANA_TRACKER_API_KEY is not set');
      return null;
    }
    
    const response = await fetch(`${SOLANA_API_URL}/tokens/${address}`, {
      headers: {
        'x-api-key': SOLANA_TRACKER_API_KEY,
      },
    });
    
    console.log(`Solana API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Solana API error: ${response.status} - ${errorText}`);
      
      // Try fallback with CoinGecko for Solana tokens
      return await fetchSolanaTokenFromCoinGecko(address);
    }
    
    const data = await response.json();
    console.log('Solana token data fetched successfully');
    return data;
  } catch (error) {
    console.error('Error fetching Solana token data:', error);
    // Try fallback with CoinGecko
    return await fetchSolanaTokenFromCoinGecko(address);
  }
};

// Fallback function to fetch Solana token data from CoinGecko
const fetchSolanaTokenFromCoinGecko = async (address: string) => {
  try {
    console.log(`Trying CoinGecko fallback for Solana token: ${address}`);
    
    const cgUrl = `${process.env.COINGECKO_API_URL}/coins/solana/contract/${address}`;
    const response = await fetch(cgUrl);
    
    if (!response.ok) {
      console.log(`CoinGecko fallback failed: ${response.status}`);
      return null;
    }
    
    const cgData = await response.json();
    
    // Transform CoinGecko data to match expected format
    return {
      token: {
        name: cgData.name,
        symbol: cgData.symbol,
        creation: {
          creator: 'N/A'
        }
      },
      pools: [{
        marketCap: {
          usd: cgData.market_data?.market_cap?.usd || 0
        },
        price: {
          usd: cgData.market_data?.current_price?.usd || 0
        },
        liquidity: {
          usd: 0
        },
        txns: {
          volume24h: cgData.market_data?.total_volume?.usd || 0,
          total: 'N/A',
          buys: 0,
          sells: 0
        },
        market: 'coingecko',
        lpBurn: 'N/A',
        security: {
          freezeAuthority: null,
          mintAuthority: null
        }
      }],
      events: {
        '24h': {
          priceChangePercentage: cgData.market_data?.price_change_percentage_24h || 0
        }
      },
      risk: {
        score: 'N/A'
      },
      holders: 'N/A'
    };
  } catch (error) {
    console.error('CoinGecko fallback failed:', error);
    return null;
  }
};

// Function to fetch Ethereum token data
const fetchEthereumTokenData = async (address: string) => {
  try {
    // Use CoinGecko for Ethereum token data
    const cgUrl = `${process.env.COINGECKO_API_URL}/coins/ethereum/contract/${address}`;
    const cgResponse = await fetch(cgUrl);
    const cgData = cgResponse.ok ? await cgResponse.json() : null;

    // Use Ethplorer for additional data
    const ethUrl = `${process.env.ETHPLORER_API_URL}/getTokenInfo/${address}?apiKey=${process.env.ETHPLORER_API_KEY}`;
    const ethResponse = await fetch(ethUrl);
    const ethData = ethResponse.ok ? await ethResponse.json() : null;

    // Use DexScreener for trading data
    const dexUrl = `${process.env.DEXSCREENER_API_URL}/tokens/${address}`;
    const dexResponse = await fetch(dexUrl);
    const dexData = dexResponse.ok ? await dexResponse.json() : null;

    return {
      coingecko: cgData,
      ethplorer: ethData,
      dexscreener: dexData,
    };
  } catch (error) {
    console.error('Error fetching Ethereum token data:', error);
    return null;
  }
};

// Function to search for token by name or symbol
const searchTokenByNameOrSymbol = async (query: string) => {
  try {
    // Search CoinGecko for tokens by name/symbol
    const searchUrl = `${process.env.COINGECKO_API_URL}/search?query=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error('Failed to search tokens');
    }
    
    const searchData = await response.json();
    return searchData.coins?.slice(0, 5) || []; // Return top 5 matches
  } catch (error) {
    console.error('Error searching tokens:', error);
    return [];
  }
};

// Function to format token data with OpenAI
const formatTokenDataWithOpenAI = async (tokenData: any, tokenType: 'solana' | 'ethereum', query: string) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  try {
    let formattedData = '';
    
    if (tokenType === 'solana') {
      // Format Solana token data
      const token = tokenData.token;
      const pools = tokenData.pools?.[0]; // Get the first pool (usually most liquid)
      const risk = tokenData.risk;
      const events = tokenData.events;
      
      // Find the best pool (highest liquidity)
      const bestPool = tokenData.pools?.reduce((prev: any, current: any) => 
        (current.liquidity?.usd || 0) > (prev?.liquidity?.usd || 0) ? current : prev
      );
      
      formattedData = `
Solana Token Analysis for ${token?.name || 'Unknown'} (${token?.symbol || 'Unknown'})

Token Details:
- Name: ${token?.name || 'N/A'}
- Symbol: ${token?.symbol || 'N/A'}
- Creator: ${token?.creation?.creator || 'N/A'}
- Market Cap: $${bestPool?.marketCap?.usd?.toLocaleString() || 'N/A'}
- Price: $${bestPool?.price?.usd || 'N/A'}
- 24h Change: ${events?.['24h']?.priceChangePercentage?.toFixed(2) || 'N/A'}%
- 24h Volume: $${bestPool?.txns?.volume24h?.toLocaleString() || 'N/A'}
- Liquidity: $${bestPool?.liquidity?.usd?.toLocaleString() || 'N/A'}
- Holders: ${tokenData.holders || 'N/A'}
- Risk Score: ${risk?.score || 'N/A'}/10
- Total Transactions: ${bestPool?.txns?.total?.toLocaleString() || 'N/A'}
- Buys vs Sells: ${bestPool?.txns?.buys || 0}B / ${bestPool?.txns?.sells || 0}S
- Market: ${bestPool?.market || 'N/A'}
- LP Burn: ${bestPool?.lpBurn || 'N/A'}%
- Security: Freeze Authority ${bestPool?.security?.freezeAuthority ? 'Present' : 'Revoked'}, Mint Authority ${bestPool?.security?.mintAuthority ? 'Present' : 'Revoked'}
      `;
    } else if (tokenType === 'ethereum') {
      // Format Ethereum token data
      const cgData = tokenData.coingecko;
      const ethData = tokenData.ethplorer;
      
      formattedData = `
Ethereum Token Analysis for ${cgData?.name || ethData?.name || 'Unknown'}

Token Details:
- Name: ${cgData?.name || ethData?.name || 'N/A'}
- Symbol: ${cgData?.symbol || ethData?.symbol || 'N/A'}
- Market Cap: $${cgData?.market_data?.market_cap?.usd?.toLocaleString() || 'N/A'}
- Price: $${cgData?.market_data?.current_price?.usd || 'N/A'}
- 24h Change: ${cgData?.market_data?.price_change_percentage_24h?.toFixed(2) || 'N/A'}%
- 24h Volume: $${cgData?.market_data?.total_volume?.usd?.toLocaleString() || 'N/A'}
- Holders: ${ethData?.holdersCount?.toLocaleString() || 'N/A'}
- Total Supply: ${ethData?.totalSupply || cgData?.market_data?.total_supply || 'N/A'}
      `;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful cryptocurrency analyst. Format the provided token data into a comprehensive, engaging analysis that highlights key metrics, potential opportunities, and risks. Use a conversational tone that is professional but accessible to both beginners and experienced traders.'
          },
          {
            role: 'user',
            content: `Please provide a detailed analysis of this ${tokenType} token based on the following data. The user searched for: "${query}"\n\n${formattedData}\n\nPlease include insights about the market performance, risk factors, and potential investment considerations.`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || 'Unable to generate analysis.';
  } catch (error) {
    console.error('Error formatting with OpenAI:', error);
    return 'Unable to generate detailed analysis at this time.';
  }
};

// Function to get general AI response
const getGeneralAIResponse = async (message: string, conversationHistory: any[]) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful cryptocurrency trading assistant. You specialize in crypto market analysis, trading strategies, DeFi, blockchain technology, and investment advice. Only respond to cryptocurrency-related questions. If asked about non-crypto topics, politely redirect the conversation back to cryptocurrency.'
          },
          ...conversationHistory.slice(-5).map((msg: any) => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
          })),
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || 'I apologize, but I encountered an issue. Please try again.';
  } catch (error) {
    console.error('Error getting AI response:', error);
    return 'I\'m experiencing technical difficulties. Please try again later.';
  }
};

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();
    
    // Check if the message is a token address
    const tokenType = detectTokenType(trimmedMessage);
    
    if (tokenType !== 'unknown') {
      // It's a token address, fetch detailed data
      let tokenData = null;
      let aiResponse = '';
      
      console.log(`Detected ${tokenType} token address: ${trimmedMessage}`);
      
      if (tokenType === 'solana') {
        tokenData = await fetchSolanaTokenData(trimmedMessage);
        if (tokenData) {
          aiResponse = await formatTokenDataWithOpenAI(tokenData, 'solana', trimmedMessage);
        } else {
          aiResponse = `I couldn't find data for this Solana token address: **${trimmedMessage}**\n\nThis could be due to:\n• The token is very new and not yet indexed\n• The address might be incorrect\n• API services are temporarily unavailable\n\nPlease verify the address and try again, or search by token name/symbol instead.`;
        }
      } else if (tokenType === 'ethereum') {
        tokenData = await fetchEthereumTokenData(trimmedMessage);
        if (tokenData && (tokenData.coingecko || tokenData.ethplorer)) {
          aiResponse = await formatTokenDataWithOpenAI(tokenData, 'ethereum', trimmedMessage);
        } else {
          aiResponse = `I couldn't find data for this Ethereum token address: **${trimmedMessage}**\n\nThis could be due to:\n• The token is very new and not yet indexed\n• The address might be incorrect\n• API services are temporarily unavailable\n\nPlease verify the address and try again, or search by token name/symbol instead.`;
        }
      }
      
      return NextResponse.json({ message: aiResponse });
    }
    
    // Check if it might be a token name or symbol search
    const searchResults = await searchTokenByNameOrSymbol(trimmedMessage);
    
    if (searchResults.length > 0) {
      // Found potential token matches
      let searchResponse = `I found ${searchResults.length} token(s) matching "${trimmedMessage}":\n\n`;
      
      searchResults.forEach((token: any, index: number) => {
        searchResponse += `${index + 1}. **${token.name}** (${token.symbol?.toUpperCase()})\n`;
        searchResponse += `   - ID: ${token.id}\n`;
        if (token.market_cap_rank) {
          searchResponse += `   - Market Cap Rank: #${token.market_cap_rank}\n`;
        }
        searchResponse += `\n`;
      });
      
      searchResponse += 'Would you like detailed analysis for any of these tokens? Just send me the token\'s contract address!';
      
      return NextResponse.json({ message: searchResponse });
    }
    
    // General conversation
    const aiResponse = await getGeneralAIResponse(trimmedMessage, conversationHistory);
    
    return NextResponse.json({ message: aiResponse });
    
  } catch (error) {
    console.error('Error in AI chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

