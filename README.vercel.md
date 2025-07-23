# Lumos + Lumos Landing Vercel Deployment

This project contains two main parts:
- `lumos-landing`: Static marketing/landing page (HTML/CSS/JS)
- `lumos`: Next.js app (all tools, dashboard, etc)

## Structure
```
New_Lumos/
├── lumos-landing/       # Static landing page (index.html, assets)
├── lumos/               # Next.js app (tools, dashboard, API)
├── vercel.json          # Vercel config for routing/static/SSR
```

## Vercel Routing
- `/` → `lumos-landing/index.html` (landing page)
- `/get-started` or `/tools` → `lumos/app/tools` (Next.js tools dashboard)
- `/lumos/*` → Next.js app

## To Deploy
1. Push this repo to GitHub.
2. Import to Vercel (https://vercel.com/new)
3. No custom build command needed; Vercel will detect Next.js and static site.
4. [Optional] Set any required environment variables (API keys) in Vercel dashboard.

## Get Started Button
- The `Get Started` button in `lumos-landing/index.html` should link to `/tools` for correct routing.

## Environment Variables
- If your Next.js app needs API keys, add them in Vercel dashboard under Project > Settings > Environment Variables.
- Example: `COINGECKO_API_KEY`, `SOLANA_TRACKER_API_KEY`, etc.

---
For questions or further customization, see [Vercel docs](https://vercel.com/docs).
