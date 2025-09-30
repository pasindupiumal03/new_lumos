import { NextResponse } from 'next/server';
import axios from 'axios';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/ethereum';
const ETHERSCAN_API_KEY = 'JQC41WVP8KQFAE7HBZ57KEQ739WIG6JA27';
const ETHERSCAN_BASE = 'https://api.etherscan.io/api';
const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjMzMDU5MWNkLTI4YWYtNDljMS1hZDgyLWM3YWZkZGE1MmMxZiIsIm9yZ0lkIjoiNDcyOTkwIiwidXNlcklkIjoiNDg2NTc4IiwidHlwZUlkIjoiOWYyZTQ4Y2ItZDgzMi00Zjg4LWI2OTYtNWZkNTJlMWE0Mjg5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTkxNDgwOTksImV4cCI6NDkxNDkwODA5OX0.p3v0cK0insA-Ivgr0IoRPJeE8vPI9OZUN0S8vCkuGgI';
const MORALIS_BASE = 'https://deep-index.moralis.io/api/v2.2';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tokenAddress = searchParams.get('token');
  const action = searchParams.get('action');

  try {
    // Get base ETH data and gas prices
    const ethDataRes = await axios.get(COINGECKO_URL);
    const ethMarket = ethDataRes.data.market_data;

    const gasRes = await axios.get(`${ETHERSCAN_BASE}?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`);

    let tokenData = null;
    let trendingTokens = null;

    // Get trending tokens
    if (action === 'trending' || !tokenAddress) {
      try {
        const trendingRes = await axios.get(`${MORALIS_BASE}/tokens/trending`, {
          headers: {
            'X-API-Key': MORALIS_API_KEY,
            'accept': 'application/json'
          },
          params: {
            chain: 'eth',
            limit: 25
          }
        });
        trendingTokens = trendingRes.data;
      } catch (trendingError) {
        console.error('Trending tokens error:', trendingError);
        trendingTokens = [];
      }
    }

    // Get specific token data
    if (tokenAddress) {
      try {
        const [tokenInfoRes, tokenPriceRes, tokenStatsRes] = await Promise.all([
          axios.get(`${MORALIS_BASE}/erc20/metadata`, {
            headers: {
              'X-API-Key': MORALIS_API_KEY,
              'accept': 'application/json'
            },
            params: {
              chain: 'eth',
              addresses: [tokenAddress]
            }
          }),
          axios.get(`${MORALIS_BASE}/erc20/${tokenAddress}/price`, {
            headers: {
              'X-API-Key': MORALIS_API_KEY,
              'accept': 'application/json'
            },
            params: {
              chain: 'eth',
              include: 'percent_change'
            }
          }),
          axios.get(`${MORALIS_BASE}/erc20/${tokenAddress}/stats`, {
            headers: {
              'X-API-Key': MORALIS_API_KEY,
              'accept': 'application/json'
            },
            params: {
              chain: 'eth'
            }
          })
        ]);

        const tokenInfo = tokenInfoRes.data[0];
        const tokenPrice = tokenPriceRes.data;
        const tokenStats = tokenStatsRes.data;

        tokenData = {
          ...tokenInfo,
          price: tokenPrice.usdPrice,
          priceChange24h: tokenPrice['24hrPercentChange'],
          marketCap: tokenStats.market_cap,
          holders: tokenStats.holders || 'N/A'
        };
      } catch (tokenError) {
        console.error('Token data error:', tokenError);
        tokenData = { error: 'Token not found or invalid address' };
      }
    }

    return NextResponse.json({
      price: ethMarket.current_price.usd,
      marketCap: ethMarket.market_cap.usd,
      volume: ethMarket.total_volume.usd,
      gas: gasRes.data.result,
      tokenData,
      trendingTokens
    });
  } catch (error: any) {
    console.error('ETH Tracker API Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to fetch ETH data' }, { status: 500 });
  }
}