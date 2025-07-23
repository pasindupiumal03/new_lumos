import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const HELIUS_API = process.env.HELIUS_API_KEY;

  if (!address) {
    return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 });
  }

  try {
    const [balancesRes, txnsRes] = await Promise.all([
      fetch(`https://api.helius.xyz/v0/addresses/${address}/balances?api-key=${HELIUS_API}`),
      fetch(`https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_API}`)
    ]);

    const balances = await balancesRes.json();
    const transactions = await txnsRes.json();

    // Enrich tokens with logoURI, symbol, name
    let tokens = balances.tokens || [];
    const enrichedTokens = await Promise.all(tokens.map(async (tok: any) => {
      try {
        const metaRes = await fetch(`https://data.solanatracker.io/tokens/${tok.mint}`);
        if (!metaRes.ok) return tok;
        const meta = await metaRes.json();
        return {
          ...tok,
          token: meta.token || meta, // Attach the full token object if present, fallback to meta root
          logoURI: meta.token?.image || meta.logoURI || meta.logo || '',
          symbol: meta.token?.symbol || meta.symbol || '',
          name: meta.token?.name || meta.name || '',
        };
      } catch {
        return tok;
      }
    }));
    balances.tokens = enrichedTokens;

    return NextResponse.json({ balances, transactions });
  } catch (error) {
    return NextResponse.json({ error: error?.toString() || 'Unknown error' }, { status: 500 });
  }
}
