import { NextRequest, NextResponse } from 'next/server';

// CoinGecko API endpoints
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

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

// Function to check if message is asking for real-time market data
const detectMarketDataRequest = (message: string): string | null => {
  const lowerMessage = message.toLowerCase();
  
  // Bitcoin price queries
  if (lowerMessage.includes('bitcoin') && (lowerMessage.includes('price') || lowerMessage.includes('current'))) {
    return 'bitcoin_price';
  }
  
  // Top gainers queries
  if ((lowerMessage.includes('top') || lowerMessage.includes('best')) && 
      (lowerMessage.includes('gainer') || lowerMessage.includes('performer') || lowerMessage.includes('rising'))) {
    return 'top_gainers';
  }
  
  // Market trends queries
  if (lowerMessage.includes('market') && (lowerMessage.includes('trend') || lowerMessage.includes('overview') || lowerMessage.includes('sentiment'))) {
    return 'market_trends';
  }
  
  // Price queries for specific coins
  if (lowerMessage.includes('price') && (lowerMessage.includes('ethereum') || lowerMessage.includes('eth'))) {
    return 'ethereum_price';
  }
  
  if (lowerMessage.includes('price') && (lowerMessage.includes('solana') || lowerMessage.includes('sol'))) {
    return 'solana_price';
  }
  
  // Top coins by market cap
  if ((lowerMessage.includes('top') || lowerMessage.includes('largest')) && 
      (lowerMessage.includes('coin') || lowerMessage.includes('crypto') || lowerMessage.includes('market cap'))) {
    return 'top_coins';
  }
  
  return null;
};

// Function to get Bitcoin price
const getBitcoinPrice = async () => {
  try {
    const response = await fetch(`${COINGECKO_BASE_URL}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Bitcoin price');
    }
    
    const data = await response.json();
    const btcData = data.bitcoin;
    
    return {
      price: btcData.usd,
      change24h: btcData.usd_24h_change,
      volume24h: btcData.usd_24h_vol,
      marketCap: btcData.usd_market_cap
    };
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    return null;
  }
};

// Function to get top gainers (last 24h)
const getTopGainers = async () => {
  try {
    const response = await fetch(`${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch top gainers');
    }
    
    const data = await response.json();
    return data.slice(0, 10); // Top 10 gainers
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    return null;
  }
};

// Function to get market overview/trends
const getMarketTrends = async () => {
  try {
    const [globalResponse, trendingResponse] = await Promise.all([
      fetch(`${COINGECKO_BASE_URL}/global`),
      fetch(`${COINGECKO_BASE_URL}/search/trending`)
    ]);
    
    if (!globalResponse.ok || !trendingResponse.ok) {
      throw new Error('Failed to fetch market data');
    }
    
    const globalData = await globalResponse.json();
    const trendingData = await trendingResponse.json();
    
    return {
      global: globalData.data,
      trending: trendingData.coins.slice(0, 7)
    };
  } catch (error) {
    console.error('Error fetching market trends:', error);
    return null;
  }
};

// Function to get top coins by market cap
const getTopCoins = async () => {
  try {
    const response = await fetch(`${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false&price_change_percentage=24h`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch top coins');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching top coins:', error);
    return null;
  }
};

// Function to get specific coin price (Ethereum, Solana, etc.)
const getCoinPrice = async (coinId: string) => {
  try {
    const response = await fetch(`${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${coinId} price`);
    }
    
    const data = await response.json();
    return data[coinId];
  } catch (error) {
    console.error(`Error fetching ${coinId} price:`, error);
    return null;
  }
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

// Function to format market data responses
const formatMarketDataResponse = async (dataType: string, data: any) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  try {
    let prompt = '';
    let systemMessage = 'You are a professional cryptocurrency analyst providing real-time market insights. Format the data in an engaging, informative way that includes key metrics, analysis, and actionable insights. Use emojis and formatting to make it visually appealing.';
    
    switch (dataType) {
      case 'bitcoin_price':
        prompt = `Current Bitcoin (BTC) Real-Time Data:
- Price: $${data.price?.toLocaleString() || 'N/A'}
- 24h Change: ${data.change24h?.toFixed(2) || 'N/A'}%
- 24h Volume: $${data.volume24h?.toLocaleString() || 'N/A'}
- Market Cap: $${data.marketCap?.toLocaleString() || 'N/A'}

Please provide an engaging analysis of Bitcoin's current price performance.`;
        break;
        
      case 'top_gainers':
        const gainersText = data?.map((coin: any, index: number) => 
          `${index + 1}. ${coin.name} (${coin.symbol?.toUpperCase()}) - ${coin.price_change_percentage_24h?.toFixed(2)}% ($${coin.current_price?.toFixed(6)})`
        ).join('\n') || 'No data available';
        
        prompt = `Top 10 Cryptocurrency Gainers (24h):
${gainersText}

Please provide an engaging analysis of these top gainers and what might be driving their performance.`;
        break;
        
      case 'market_trends':
        const totalMarketCap = data?.global?.total_market_cap?.usd;
        const marketCapChange = data?.global?.market_cap_change_percentage_24h_usd;
        const btcDominance = data?.global?.market_cap_percentage?.btc;
        const ethDominance = data?.global?.market_cap_percentage?.eth;
        
        const trendingCoins = data?.trending?.map((item: any, index: number) => 
          `${index + 1}. ${item.item.name} (${item.item.symbol}) - Rank #${item.item.market_cap_rank || 'N/A'}`
        ).join('\n') || 'No trending data available';
        
        prompt = `Current Cryptocurrency Market Overview:

Market Statistics:
- Total Market Cap: $${totalMarketCap?.toLocaleString() || 'N/A'}
- 24h Market Cap Change: ${marketCapChange?.toFixed(2) || 'N/A'}%
- Bitcoin Dominance: ${btcDominance?.toFixed(2) || 'N/A'}%
- Ethereum Dominance: ${ethDominance?.toFixed(2) || 'N/A'}%

Top Trending Coins:
${trendingCoins}

Please provide a comprehensive market analysis including trends, sentiment, and key insights.`;
        break;
        
      case 'top_coins':
        const topCoinsText = data?.map((coin: any, index: number) => 
          `${index + 1}. ${coin.name} (${coin.symbol?.toUpperCase()}) - $${coin.current_price?.toLocaleString()} (${coin.price_change_percentage_24h?.toFixed(2)}%)`
        ).join('\n') || 'No data available';
        
        prompt = `Top 15 Cryptocurrencies by Market Cap:
${topCoinsText}

Please provide an analysis of the top cryptocurrencies and their current market performance.`;
        break;
        
      case 'ethereum_price':
      case 'solana_price':
        const coinName = dataType.includes('ethereum') ? 'Ethereum (ETH)' : 'Solana (SOL)';
        prompt = `Current ${coinName} Real-Time Data:
- Price: $${data.usd?.toLocaleString() || 'N/A'}
- 24h Change: ${data.usd_24h_change?.toFixed(2) || 'N/A'}%
- 24h Volume: $${data.usd_24h_vol?.toLocaleString() || 'N/A'}
- Market Cap: $${data.usd_market_cap?.toLocaleString() || 'N/A'}

Please provide an engaging analysis of ${coinName}'s current price performance.`;
        break;
        
      default:
        return 'Unable to format market data response.';
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
        max_tokens: 800,
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: prompt
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
    console.error('Error formatting market data response:', error);
    
    // Fallback to basic formatting without AI
    switch (dataType) {
      case 'bitcoin_price':
        return `🔸 **Bitcoin (BTC) Real-Time Price**\n\n💰 **Current Price:** $${data.price?.toLocaleString()}\n📈 **24h Change:** ${data.change24h?.toFixed(2)}%\n📊 **24h Volume:** $${data.volume24h?.toLocaleString()}\n🏦 **Market Cap:** $${data.marketCap?.toLocaleString()}\n\n*Data provided by CoinGecko*`;
      
      case 'top_gainers':
        const gainersText = data?.map((coin: any, index: number) => 
          `${index + 1}. **${coin.name}** (${coin.symbol?.toUpperCase()}) - 📈 ${coin.price_change_percentage_24h?.toFixed(2)}%`
        ).join('\n') || 'No data available';
        return `🚀 **Top 10 Crypto Gainers (24h)**\n\n${gainersText}\n\n*Data provided by CoinGecko*`;
        
      default:
        return 'Market data fetched successfully but unable to format response.';
    }
  }
};
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
const getGeneralAIResponse = async (message: string, conversationHistory: any[], customSystemMessage?: string) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  try {
    const defaultSystemMessage = 'You are a helpful cryptocurrency trading assistant. You specialize in crypto market analysis, trading strategies, DeFi, blockchain technology, and investment advice. Only respond to cryptocurrency-related questions. If asked about non-crypto topics, politely redirect the conversation back to cryptocurrency.';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 400,
        messages: [
          {
            role: 'system',
            content: customSystemMessage || defaultSystemMessage
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
    
    // First, check if this is a real-time market data request
    const marketDataType = detectMarketDataRequest(trimmedMessage);
    
    if (marketDataType) {
      console.log(`Detected market data request: ${marketDataType}`);
      
      let marketData = null;
      let aiResponse = '';
      
      try {
        switch (marketDataType) {
          case 'bitcoin_price':
            marketData = await getBitcoinPrice();
            if (marketData) {
              aiResponse = await formatMarketDataResponse('bitcoin_price', marketData);
            } else {
              aiResponse = "I'm currently unable to fetch Bitcoin price data. Please try again in a moment.";
            }
            break;
            
          case 'top_gainers':
            marketData = await getTopGainers();
            if (marketData) {
              aiResponse = await formatMarketDataResponse('top_gainers', marketData);
            } else {
              aiResponse = "I'm currently unable to fetch top gainers data. Please try again in a moment.";
            }
            break;
            
          case 'market_trends':
            marketData = await getMarketTrends();
            if (marketData) {
              aiResponse = await formatMarketDataResponse('market_trends', marketData);
            } else {
              aiResponse = "I'm currently unable to fetch market trends data. Please try again in a moment.";
            }
            break;
            
          case 'ethereum_price':
            marketData = await getCoinPrice('ethereum');
            if (marketData) {
              aiResponse = await formatMarketDataResponse('ethereum_price', marketData);
            } else {
              aiResponse = "I'm currently unable to fetch Ethereum price data. Please try again in a moment.";
            }
            break;
            
          case 'solana_price':
            marketData = await getCoinPrice('solana');
            if (marketData) {
              aiResponse = await formatMarketDataResponse('solana_price', marketData);
            } else {
              aiResponse = "I'm currently unable to fetch Solana price data. Please try again in a moment.";
            }
            break;
            
          case 'top_coins':
            marketData = await getTopCoins();
            if (marketData) {
              aiResponse = await formatMarketDataResponse('top_coins', marketData);
            } else {
              aiResponse = "I'm currently unable to fetch top coins data. Please try again in a moment.";
            }
            break;
            
          default:
            aiResponse = "I detected a market data request but couldn't process it. Please try rephrasing your question.";
        }
        
        return NextResponse.json({ message: aiResponse });
        
      } catch (error) {
        console.error('Error handling market data request:', error);
        return NextResponse.json({ 
          message: "I'm experiencing issues fetching real-time market data. Please try again in a moment." 
        });
      }
    }
    
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
    
    // General conversation - Enhanced to suggest real-time capabilities
    const enhancedSystemMessage = `You are Lumos AI, a professional cryptocurrency trading assistant with access to real-time market data. You can provide:

REAL-TIME DATA CAPABILITIES:
• Bitcoin/Ethereum/Solana current prices and 24h changes
• Top gainers and losers in the last 24 hours  
• Market trends and overview with dominance stats
• Top cryptocurrencies by market cap
• Token analysis for any Solana or Ethereum address

When users ask about prices, market trends, or top performers, encourage them to ask specifically for real-time data. For example:
- "What is the current price of Bitcoin?" (you can provide this!)
- "Show me the top gainers in the last 24 hours" (you can provide this!)
- "What are the latest market trends?" (you can provide this!)

You specialize in crypto market analysis, trading strategies, DeFi, blockchain technology, and investment advice. Always be helpful and professional.`;

    const aiResponse = await getGeneralAIResponse(trimmedMessage, conversationHistory, enhancedSystemMessage);
    
    return NextResponse.json({ message: aiResponse });
    
  } catch (error) {
    console.error('Error in AI chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

