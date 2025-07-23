import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Add timeout to fetch (10s)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let response;
    try {
      response = await fetch(
        "https://data.solanatracker.io/tokens/trending",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "x-api-key": process.env.SOLANA_TRACKER_API_KEY || "",
          },
          signal: controller.signal,
        }
      );
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        console.error("Solana Tracker API request timed out");
        return NextResponse.json(
          { error: "Solana Tracker API timed out. Please try again later." },
          { status: 504 }
        );
      } else {
        console.error("Solana Tracker API fetch error:", err);
        return NextResponse.json(
          { error: "Failed to connect to Solana Tracker API." },
          { status: 502 }
        );
      }
    }
    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Solana Tracker API error:", errorText);
      return NextResponse.json(
        { error: errorText || `HTTP error! Status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
