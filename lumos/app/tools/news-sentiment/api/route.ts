import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const auth_token = process.env.CRYPTOPANIC_API_KEY;
  const apiPlan = process.env.CRYPTOPANIC_API_PLAN || "developer"; // Configurable via .env

  // Validate API key
  if (!auth_token) {
    console.error("CryptoPanic API key is missing in environment variables.");
    return NextResponse.json(
      { error: "Server configuration error: Missing CryptoPanic API key" },
      { status: 500 }
    );
  }

  // Log the API key and plan for debugging
  console.log("API Key:", auth_token);
  console.log("API Plan:", apiPlan);

  const baseUrl = `https://cryptopanic.com/api/${apiPlan}/v2/posts/`;

  // Forward all query parameters and add auth_token and metadata
  const params = new URLSearchParams(searchParams);
  params.set("auth_token", auth_token);
  params.set("metadata", "1"); // Explicitly request metadata

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    // Log response details for debugging
    console.log("CryptoPanic Response Status:", response.status);
    console.log("CryptoPanic Response Headers:", Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.log("CryptoPanic Error Response:", errorText);
      return NextResponse.json(
        {
          error: `CryptoPanic API error: ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("CryptoPanic Raw Response:", JSON.stringify(data, null, 2)); // Log full response

    // Check if source field is present in any result
    if (data.results && Array.isArray(data.results)) {
      const hasSource = data.results.some((item: any) => item.source && typeof item.source === "object");
      if (!hasSource) {
        console.warn("No source field found in CryptoPanic response. Check API plan or metadata parameter.");
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying CryptoPanic API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch data from CryptoPanic API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}