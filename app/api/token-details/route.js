import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: "Token address is required" }, { status: 400 });
  }

  try {
    // === CoinGecko (Name, Symbol, Price, Market Cap, Logo) ===
    const cgUrl = `${process.env.COINGECKO_API_URL}/coins/ethereum/contract/${address}`;
    const cgRes = await fetch(cgUrl);
    const cgData = cgRes.ok ? await cgRes.json() : null;

    // === Ethplorer (Holders, Supply) ===
    const ethUrl = `${process.env.ETHPLORER_API_URL}/getTokenInfo/${address}?apiKey=${process.env.ETHPLORER_API_KEY}`;
    const ethRes = await fetch(ethUrl);
    const ethData = ethRes.ok ? await ethRes.json() : null;

    // === Dexscreener (Extra trading info: volume, liquidity, price) ===
    const dexUrl = `${process.env.DEXSCREENER_API_URL}/tokens/${address}`;
    const dexRes = await fetch(dexUrl);
    const dexData = dexRes.ok ? await dexRes.json() : null;

    const tokenData = {
        name: cgData?.name || ethData?.name || null,
        symbol: cgData?.symbol || ethData?.symbol || null,
        logo: cgData?.image?.large || cgData?.image?.small || null,
        address,
        price:
            cgData?.market_data?.current_price?.usd ||
            dexData?.pairs?.[0]?.priceUsd ||
            null,
        change24h:
            cgData?.market_data?.price_change_percentage_24h ??
            dexData?.pairs?.[0]?.priceChange?.h24 ??
            null,
        marketCap: cgData?.market_data?.market_cap?.usd || null,
        volume24h:
            cgData?.market_data?.total_volume?.usd ||
            dexData?.pairs?.[0]?.volume?.h24 ||
            null,
        holders: ethData?.holdersCount || null,
    };

    return NextResponse.json(tokenData);
  } catch (error) {
    console.error("Error fetching token data:", error);
    return NextResponse.json({ error: "Failed to fetch token data" }, { status: 500 });
  }
}
