import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: "Token address is required" }, { status: 400 });
  }

  // Check if API key is available
  const apiKey = process.env.SOLANA_TRACKER_API_KEY || process.env.NEXT_PUBLIC_SOLANA_TRACKER_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      error: "Solana Tracker API key is required. Please add SOLANA_TRACKER_API_KEY to your .env.local file. Get your API key from https://solanatracker.io" 
    }, { status: 400 });
  }

  try {
    // Fetch from Solana Tracker API
    const solanaTrackerUrl = `https://data.solanatracker.io/tokens/${address}`;
    
    console.log('Fetching from:', solanaTrackerUrl);
    
    const response = await fetch(solanaTrackerUrl, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Solana Tracker API error:', response.status, response.statusText, errorText);
      
      if (response.status === 401) {
        return NextResponse.json({ 
          error: "Invalid API key. Please check your SOLANA_TRACKER_API_KEY in .env.local" 
        }, { status: 401 });
      }
      
      if (response.status === 404) {
        return NextResponse.json({ 
          error: "Token not found. Please check the token address." 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        error: `Solana Tracker API error: ${response.status} ${response.statusText}` 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Solana Tracker response received successfully');

    // Validate if we got valid token data
    if (!data.token) {
      return NextResponse.json({ 
        error: "Token not found or invalid address" 
      }, { status: 404 });
    }

    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error fetching Solana token data:", error);
    return NextResponse.json({ 
      error: "Failed to fetch token data: " + error.message 
    }, { status: 500 });
  }
}