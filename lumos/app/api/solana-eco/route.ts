// route.ts - Solana Eco unified backend
import { NextResponse } from 'next/server';
import axios from 'axios';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/solana';
const SOLANA_TRACKER_API_KEY = 'YOUR_SOLANA_TRACKER_API_KEY';
const HELIUS_API_KEY = 'YOUR_HELIUS_API_KEY';

const RPC = 'https://api.mainnet-beta.solana.com';

async function fetchFromRPC(method: string, params: any[] = []) {
  const res = await axios.post(RPC, {
    jsonrpc: '2.0',
    id: 1,
    method,
    params
  });
  return res.data.result;
}

export async function GET() {
  try {
    const [coingeckoRes, epochInfo, slot, perfSamples, blocksRes, tokensRes, nftRes] = await Promise.all([
      axios.get(COINGECKO_URL),
      fetchFromRPC('getEpochInfo'),
      fetchFromRPC('getSlot'),
      fetchFromRPC('getRecentPerformanceSamples'),
      axios.get(`https://api.solanatracker.io/blocks?limit=5`, {
        headers: { 'X-API-Key': SOLANA_TRACKER_API_KEY }
      }),
      axios.get(`https://api.solanatracker.io/tokens/top?limit=5`, {
        headers: { 'X-API-Key': SOLANA_TRACKER_API_KEY }
      }),
      axios.get(`https://api.helius.xyz/v0/nfts/popular?limit=5`, {
        headers: { 'Authorization': `Bearer ${HELIUS_API_KEY}` }
      })
    ]);

    const price = coingeckoRes.data.market_data.current_price.usd;
    const marketCap = coingeckoRes.data.market_data.market_cap.usd;
    const chart = await axios.get(`https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=1`);
    const prices = chart.data.prices;

    const tps = perfSamples.map((s: any) => Math.floor(s.numTransactions / s.samplePeriodSecs));
    const latestBlocks = blocksRes.data.data;
    const topTokens = tokensRes.data.data;
    const nftSpotlight = nftRes.data;

    return NextResponse.json({
      price,
      marketCap,
      chart: prices,
      epochInfo,
      slot,
      tps,
      latestBlocks,
      topTokens,
      nftSpotlight
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load Solana Eco data.' }, { status: 500 });
  }
}
