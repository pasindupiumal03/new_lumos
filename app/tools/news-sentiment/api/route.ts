import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const auth_token = process.env.CRYPTOPANIC_API_KEY || "4a4d75b8438580a64d96c8bdf5b6d4448027f351";
  const apiPlan = process.env.CRYPTOPANIC_API_PLAN || "developer";

  // Validate API key
  if (!auth_token) {
    console.error("CryptoPanic API key is missing in environment variables.");
    return NextResponse.json(
      { 
        error: "Server configuration error: Missing CryptoPanic API key",
        message: "Please set CRYPTOPANIC_API_KEY in your environment variables"
      },
      { status: 500 }
    );
  }

  // Create base URL with the correct API plan and version
  const baseUrl = `https://cryptopanic.com/api/developer/v2/posts/`;

  // Create new params to avoid mutating the original
  const params = new URLSearchParams();
  
  // Forward valid query parameters
  const validParams = ["filter", "currencies", "regions", "kind", "page", "public", "following"];
  for (const [key, value] of searchParams.entries()) {
    if (validParams.includes(key)) {
      params.set(key, value);
    }
  }
  
  // Add required parameters
  params.set("auth_token", auth_token);
  params.set("public", "true"); // Use public API mode

  try {
    const apiUrl = `${baseUrl}?${params.toString()}`;
    console.log("CryptoPanic API Request:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "LumosCryptoApp/1.0"
      },
      // Add a timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      let errorMessage = `CryptoPanic API error: ${response.status} ${response.statusText}`;
      let errorDetails: any = null;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorDetails = errorData;
      } catch (e) {
        // If we can't parse the error as JSON, use the status text
        errorMessage = `CryptoPanic API error: ${response.status} ${response.statusText}`;
      }
      
      console.error("CryptoPanic API Error:", {
        status: response.status,
        message: errorMessage,
        details: errorDetails,
        url: apiUrl
      });
      
      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails || response.statusText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("CryptoPanic Raw Response:", JSON.stringify(data, null, 2)); // Log full response

    // Process the results to ensure source information is properly formatted
    if (data.results && Array.isArray(data.results)) {
      data.results = data.results.map((item: any) => {
        // Process source information with better URL handling
        const urlObj = (() => {
          try {
            return new URL(item.url || '');
          } catch {
            return null;
          }
        })();

        const domain = item.source?.domain || urlObj?.hostname?.replace('www.', '') || '';
        const safeDomain = domain && domain !== 'example.com' ? domain : 'cryptopanic.com';

        item.source = {
          title: item.source?.title || safeDomain,
          domain: safeDomain,
          logo: `https://www.google.com/s2/favicons?domain=${safeDomain}&sz=64`,
          region: item.source?.region || 'en',
          type: item.source?.type || 'feed'
        };
        return item;
      });
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