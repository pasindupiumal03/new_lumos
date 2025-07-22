import { NextResponse } from 'next/server';
import axios from 'axios';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/ethereum';
const ETHERSCAN_API_KEY = 'JQC41WVP8KQFAE7HBZ57KEQ739WIG6JA27';
const ETHERSCAN_BASE = 'https://api.etherscan.io/api';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');

  try {
    const ethDataRes = await axios.get(COINGECKO_URL);
    const ethMarket = ethDataRes.data.market_data;

    const gasRes = await axios.get(`${ETHERSCAN_BASE}?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`);

    const chartRes = await axios.get(`https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7`);

    let walletData = null;
    if (wallet) {
      const [balanceRes, txListRes] = await Promise.all([
        axios.get(`${ETHERSCAN_BASE}?module=account&action=balance&address=${wallet}&tag=latest&apikey=${ETHERSCAN_API_KEY}`),
        axios.get(`${ETHERSCAN_BASE}?module=account&action=txlist&address=${wallet}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`)
      ]);

      walletData = {
        balance: balanceRes.data.result,
        transactions: txListRes.data.result.slice(0, 5)
      };
    }

    return NextResponse.json({
      price: ethMarket.current_price.usd,
      marketCap: ethMarket.market_cap.usd,
      volume: ethMarket.total_volume.usd,
      chart: chartRes.data.prices,
      gas: gasRes.data.result,
      holders: 'N/A', // Optional: holders data removed for now to prevent error
      walletData
    });
  } catch (error: any) {
    console.error('ETH Tracker API Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to fetch ETH data' }, { status: 500 });
  }
}