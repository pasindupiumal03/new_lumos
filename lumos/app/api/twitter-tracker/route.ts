import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configuration - More lenient to avoid conflicts with Twitter's limits
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes (Twitter's window)
const MAX_REQUESTS_PER_WINDOW = 100; // More reasonable limit

// In-memory rate limiting (consider using Redis in production)
const requestCounts = new Map<string, { count: number, resetTime: number }>();

// Helper function to handle API errors
const handleApiError = (error: any, message: string, statusCode: number = 500) => {
  console.error(`${message}:`, error);
  
  return new NextResponse(
    JSON.stringify({ 
      success: false,
      error: message,
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), 
    { 
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
};

// Helper to validate search query
const validateSearchQuery = (query: string | null): string => {
  if (!query || query.trim().length === 0) {
    return 'crypto';
  }
  
  // Basic sanitization to prevent injection
  return query.trim().substring(0, 100);
};

// Helper to check rate limiting
const checkRateLimit = (ip: string | null): { allowed: boolean; remaining: number; resetTime: number } => {
  const clientIP = ip || 'anonymous';
  const now = Date.now();
  
  // Clean up old entries
  for (const [ip, data] of requestCounts.entries()) {
    if (data.resetTime < now) {
      requestCounts.delete(ip);
    }
  }
  
  // Get current request data for this IP
  const currentData = requestCounts.get(clientIP);
  
  // If no data or window has expired, start fresh
  if (!currentData || currentData.resetTime < now) {
    const resetTime = now + RATE_LIMIT_WINDOW_MS;
    requestCounts.set(clientIP, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetTime
    };
  }
  
  // Increment count
  const updatedCount = currentData.count + 1;
  requestCounts.set(clientIP, { count: updatedCount, resetTime: currentData.resetTime });

  return {
    allowed: updatedCount <= MAX_REQUESTS_PER_WINDOW,
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - updatedCount),
    resetTime: currentData.resetTime
  };
};

export async function GET(req: NextRequest) {
  try {
    // Get client IP for rate limiting from headers
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                    req.headers.get('x-real-ip') ||
                    'unknown';
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter,
          rateLimitReset: rateLimit.resetTime,
          timestamp: new Date().toISOString()
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': Math.floor(rateLimit.resetTime / 1000).toString(),
          },
        }
      );
    }

    // Validate and sanitize query parameters
    const { searchParams } = new URL(req.url);
    const query = validateSearchQuery(searchParams.get('q'));
    const maxResults = Math.min(
      parseInt(searchParams.get('max_results') || '10'),
      50 // Twitter's max for recent search
    ) || 10;

    // Validate Twitter Bearer Token
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!bearerToken) {
      console.error('Twitter Bearer Token is not configured');
      return handleApiError(
        null,
        'Server configuration error: Twitter API credentials not properly configured',
        500
      );
    }

    // Build Twitter API URL with query parameters
    const twitterUrl = new URL('https://api.twitter.com/2/tweets/search/recent');
    const params = new URLSearchParams({
      query: `(${query}) -is:retweet -is:reply -is:quote`,
      max_results: maxResults.toString(),
      'tweet.fields': [
        'public_metrics',
        'created_at',
        'text',
        'author_id',
        'conversation_id',
      ].join(','),
      expansions: [
        'author_id',
      ].join(','),
      'user.fields': [
        'name',
        'profile_image_url',
        'public_metrics',
        'username',
        'verified',
      ].join(','),
    });

    twitterUrl.search = params.toString();

    // Log the request (without sensitive data)
    console.log(`[${new Date().toISOString()}] Twitter API request for query: "${query}" from IP: ${clientIP}`);
    
    // Make request to Twitter API
    try {
      const response = await fetch(twitterUrl, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'User-Agent': 'LumosCryptoApp/1.0'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Twitter API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        
        // If Twitter API rate limited, return appropriate error
        if (response.status === 429) {
          const twitterResetTime = response.headers.get('x-rate-limit-reset');
          const retryAfter = twitterResetTime ? 
            Math.ceil((parseInt(twitterResetTime) * 1000 - Date.now()) / 1000) : 900; // Default 15 min
            
          return new NextResponse(
            JSON.stringify({
              success: false,
              error: 'Twitter API rate limit exceeded. Please try again later.',
              retryAfter,
              rateLimitReset: twitterResetTime ? parseInt(twitterResetTime) * 1000 : Date.now() + (15 * 60 * 1000),
              timestamp: new Date().toISOString()
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': retryAfter.toString(),
              },
            }
          );
        }
        
        return handleApiError(
          errorData,
          `Twitter API error: ${response.status} ${response.statusText}`,
          response.status
        );
      }
      
      // Return successful response with rate limit headers
      const data = await response.json();
      
      return NextResponse.json(data, {
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': Math.floor(rateLimit.resetTime / 1000).toString(),
          'Cache-Control': 'private, max-age=60', // Cache for 1 minute
        }
      });
    } catch (error) {
      console.error('Network error when calling Twitter API:', error);
      return handleApiError(
        error,
        'Failed to connect to Twitter API. Please check your network connection and try again.',
        503
      );
    }

  } catch (error) {
    // Handle unexpected errors
    if (error instanceof Error && error.name === 'TimeoutError') {
      return handleApiError(error, 'Request to Twitter API timed out', 504);
    }
    return handleApiError(error, 'An unexpected error occurred');
  }
}