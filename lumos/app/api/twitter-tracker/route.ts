import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Twitter's standard rate limit for recent search

// In-memory rate limiting (consider using Redis in production)
const requestCounts = new Map<string, { count: number, resetTime: number }>();

// No more mock data - we'll only return real search results

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
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  for (const [ip, data] of requestCounts.entries()) {
    if (data.resetTime < now) {
      requestCounts.delete(ip);
    }
  }
  
  // Get or initialize request count for this IP
  const resetTime = now + RATE_LIMIT_WINDOW_MS;
  const requestData = requestCounts.get(clientIP) || { count: 0, resetTime };
  
  const updatedCount = requestData.count + 1;
  requestCounts.set(clientIP, { count: updatedCount, resetTime });

  return {
    allowed: updatedCount <= MAX_REQUESTS_PER_WINDOW,
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - updatedCount),
    resetTime
  };
};

export async function GET(req: NextRequest) {
  try {
    // Get client IP for rate limiting from headers
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    
    // Check rate limit
    if (!rateLimit.allowed) {
      return handleApiError(
        null,
        'Rate limit exceeded. Please try again later.',
        429
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
      query: `(${query}) -is:retweet -is:reply -is:quote -has:links`,
      max_results: maxResults.toString(),
      'tweet.fields': [
        'public_metrics',
        'created_at',
        'text',
        'author_id',
        'conversation_id',
        'in_reply_to_user_id',
        'referenced_tweets',
        'attachments',
        'entities',
        'context_annotations',
      ].join(','),
      expansions: [
        'author_id',
        'referenced_tweets.id',
        'referenced_tweets.id.author_id',
        'attachments.media_keys',
        'in_reply_to_user_id',
      ].join(','),
      'user.fields': [
        'created_at',
        'description',
        'location',
        'name',
        'profile_image_url',
        'protected',
        'public_metrics',
        'url',
        'username',
        'verified',
      ].join(','),
      'media.fields': [
        'duration_ms',
        'height',
        'media_key',
        'preview_image_url',
        'type',
        'url',
        'width',
        'public_metrics',
      ].join(','),
    });

    twitterUrl.search = params.toString();

    // Log the request (without sensitive data)
    console.log(`Twitter API request: ${twitterUrl.pathname}${twitterUrl.search ? '?[FILTERED]' : ''}`);
    
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
          requestUrl: twitterUrl.toString()
        });
        
        // If rate limited, return appropriate error
        if (response.status === 429) {
          return handleApiError(
            errorData,
            'Twitter API rate limit exceeded. Please try again later.',
            429
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
      const rateLimitReset = response.headers.get('x-rate-limit-reset');
      
      return NextResponse.json(data, {
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': response.headers.get('x-rate-limit-limit') || '',
          'X-RateLimit-Remaining': response.headers.get('x-rate-limit-remaining') || '',
          'X-RateLimit-Reset': rateLimitReset || '',
          'Retry-After': rateLimitReset ? Math.ceil((parseInt(rateLimitReset) * 1000 - Date.now()) / 1000).toString() : ''
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
    
    // This should never be reached due to the earlier returns
    return handleApiError(
      null,
      'Unexpected error occurred while processing your request',
      500
    );

  } catch (error) {
    // Handle unexpected errors
    if (error instanceof Error && error.name === 'TimeoutError') {
      return handleApiError(error, 'Request to Twitter API timed out', 504);
    }
    return handleApiError(error, 'An unexpected error occurred');
  }
}
