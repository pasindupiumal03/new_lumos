import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

module.exports = {
  env: {
    TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN,
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
    SOLANA_TRACKER_API_KEY: process.env.SOLANA_TRACKER_API_KEY,
    HELIUS_API_KEY: process.env.HELIUS_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    CRYPTOPANIC_API_KEY: process.env.CRYPTOPANIC_API_KEY,
    CRYPTOPANIC_API_PLAN: process.env.CRYPTOPANIC_API_PLAN,
  },
};
export default nextConfig;