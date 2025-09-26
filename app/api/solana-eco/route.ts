import { NextResponse } from 'next/server';

export async function GET() {
  const HELIUS_API = process.env.HELIUS_API_KEY;
  const SOLANA_TRACKER_API = process.env.SOLANA_TRACKER_API_KEY;

  try {
    const [priceRes, epochRes, tpsRes, blocksRes, trendingRes] = await Promise.all([
      fetch(`https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`),
      fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getEpochInfo',
          params: []
        }),
      }),
      fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getRecentPerformanceSamples',
          params: [10],
        }),
      }),
      fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBlocks',
          params: [null, 20],
        }),
      }),
      fetch(`https://data.solanatracker.io/tokens/volume/24h?limit=20`, {
        headers: new Headers({ 'x-api-key': SOLANA_TRACKER_API || '' })
      })
    ]);

    const [priceData, epochData, tpsData, blocks, trendingTokensRes] = await Promise.all([
      priceRes.json(),
      epochRes.json(),
      tpsRes.json(),
      blocksRes.json(),
      trendingRes.json(),
    ]);

    // Debug log trending tokens API response
    console.log('[DEBUG] Trending tokens response:', JSON.stringify(trendingTokensRes));

    let trendingTokens: any[] = [];
    // The Solana Tracker API returns an array of pool/token objects, not a normalized token list
    let rawTokens = [];
    if (trendingTokensRes && Array.isArray(trendingTokensRes.data)) {
      rawTokens = trendingTokensRes.data;
    } else if (Array.isArray(trendingTokensRes)) {
      rawTokens = trendingTokensRes;
    }
    // Normalize for frontend: name, symbol, price, logoURI, change24h, address
    trendingTokens = rawTokens.map((item: any) => {
      let token = item.token || {};
      // If 'token' is missing, try to use item directly
      if (!token.name && item.name) token = item;
      // Pick the best available pool for price (first pool)
      let pool = (item.pools && item.pools[0]) || item;
      // Compute 24h change from events if available
      let change24h = 0;
      if (item.events && item.events['24h'] && typeof item.events['24h'].priceChangePercentage === 'number') {
        change24h = item.events['24h'].priceChangePercentage;
      } else if (item.priceChangePercentage24h) {
        change24h = item.priceChangePercentage24h;
      }
      return {
        name: token.name || '',
        symbol: token.symbol || '',
        price: pool.price && pool.price.usd ? pool.price.usd : 0,
        logoURI: token.image || token.logoURI || '',
        change24h,
        address: token.mint || token.address || token.tokenAddress || '',
      };
    }).slice(0, 20);

    return NextResponse.json({
      price: {
        usd: priceData.solana.usd,
        market_cap: priceData.solana.usd_market_cap,
        volume_24h: priceData.solana.usd_24h_vol,
      },
      epoch: epochData.result,
      tpsSamples: tpsData.result,
      blocks: blocks.result,
      trendingTokens,
      trendingTokensError: (!trendingTokens.length ? (trendingTokensRes?.message || trendingTokensRes?.error || 'No trending tokens data') : undefined)
    });
  } catch (error) {
    console.error('[Solana Eco Error]', error);
    return new NextResponse('Error fetching data', { status: 500 });
  }
}
