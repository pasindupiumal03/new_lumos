# 🚀 Lumos AI - Your Ultimate Web3 Trading Shield

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?style=for-the-badge&logo=openai)](https://openai.com/)

**Navigate the crypto universe with confidence through advanced AI-powered analytics and community-driven insights.**

[🌟 Live Demo](https://lumos-ai.vercel.app) • [📚 Documentation](#documentation) • [🚀 Getting Started](#getting-started) • [🛠 Features](#features)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [API Integrations](#api-integrations)
- [Project Structure](#project-structure)
- [Tools & Dashboard](#tools--dashboard)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Lumos AI** is a comprehensive Web3 trading platform that combines cutting-edge artificial intelligence with real-time blockchain analytics. Built for both beginners and experienced traders, Lumos provides unparalleled protection and empowerment in the dynamic cryptocurrency landscape.

### 🌟 Key Highlights

- **🤖 AI-Powered Analysis**: Advanced GPT-3.5 Turbo integration for real-time market insights
- **🔗 Multi-Chain Support**: Complete coverage of Ethereum and Solana ecosystems
- **📊 Real-Time Data**: Live market sentiment analysis and trend detection
- **🛡️ Security First**: Comprehensive rug pull detection and token scoring
- **🌐 Modern UI/UX**: Glassmorphism design with responsive mobile-first approach
- **⚡ Performance**: Optimized for speed with advanced caching strategies

---

## 🛠 Features

### 🤖 AI Trading Assistant
- **Real-time Market Data**: Live Bitcoin, Ethereum, and Solana price feeds
- **Intelligent Analysis**: Token analysis with AI-powered insights
- **Conversation Memory**: Context-aware chat with conversation history
- **Smart Detection**: Automatic token address and symbol recognition
- **Market Trends**: Top gainers, market sentiment, and trend analysis

### 📈 Market Dashboard
- **Live Statistics**: Real-time global market metrics
- **News Aggregation**: Multi-source crypto and US market news
- **Sentiment Analysis**: AI-powered sentiment scoring for news articles
- **Trending Tokens**: Hot Solana tokens with 24h performance metrics
- **Interactive Charts**: Advanced chart.js visualizations

### 🔍 Ethereum Tracker
- **ERC-20 Analysis**: Comprehensive token analytics via Moralis API
- **Real-time Prices**: Live price feeds with 24h changes
- **Market Data**: Market cap, volume, and holder statistics
- **Security Insights**: Token security and risk assessment
- **Etherscan Integration**: Direct links to blockchain explorer

### ⚡ Solana Ecosystem
- **SPL Token Tracking**: Advanced Solana token analytics
- **Pump.fun Integration**: Direct integration with popular Solana DEX
- **Real-time Data**: Live price feeds via SolanaTracker API
- **Risk Assessment**: Token security and holder analysis
- **Transaction Analysis**: Volume and liquidity metrics

### 👛 Wallet Lookup
- **Multi-Chain Analysis**: Support for Solana and Ethereum wallets
- **Portfolio Insights**: Complete token holdings with USD values
- **Phantom Integration**: Direct wallet connection support
- **Real-time Balances**: Live wallet balance tracking
- **Risk Assessment**: Portfolio diversification analysis

### 📰 News Sentiment
- **Real-time Feeds**: Live crypto and US market news aggregation
- **AI Sentiment**: Advanced sentiment analysis with scoring
- **Multi-source**: Reuters, Bloomberg, CoinDesk, and more
- **Filtering Options**: Category-based and sentiment-based filtering
- **Mobile Optimized**: Responsive design for all devices

---

## 🧰 Tech Stack

### Frontend
- **Framework**: Next.js 15.1.6 with App Router
- **Language**: TypeScript 5.8.3
- **UI Library**: React 18.2.0 + React DOM
- **Styling**: Tailwind CSS 3.4.1 with custom glassmorphism
- **Components**: Radix UI + Shadcn/ui components
- **Icons**: React Icons + Lucide React
- **Animations**: Framer Motion 12.23.6
- **Charts**: Chart.js 4.5.0 + React-Chartjs-2

### Backend & APIs
- **Runtime**: Node.js with Next.js API Routes
- **AI Integration**: OpenAI GPT-3.5 Turbo API
- **Blockchain APIs**:
  - Moralis API (Ethereum data)
  - SolanaTracker API (Solana ecosystem)
  - CoinGecko API (Market data)
  - Ethplorer API (Ethereum analytics)
- **News APIs**: Multi-source RSS aggregation
- **Wallet Integration**: Solana Web3.js + Phantom Wallet

### Development Tools
- **Package Manager**: npm/yarn
- **Code Quality**: ESLint + TypeScript
- **Styling**: PostCSS + Autoprefixer
- **Build Tool**: Next.js built-in Webpack
- **Version Control**: Git

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or later
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lumos-ai.git
   cd lumos-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your environment** (see [Environment Setup](#environment-setup))

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Blockchain API Keys
MORALIS_API_KEY=your_moralis_api_key_here
SOLANA_TRACKER_API_KEY=your_solanatracker_api_key_here
ETHPLORER_API_KEY=your_ethplorer_api_key_here

# API Endpoints
COINGECKO_API_URL=https://api.coingecko.com/api/v3
DEXSCREENER_API_URL=https://api.dexscreener.com/latest
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Next.js Configuration
NEXT_PUBLIC_MORALIS_API_KEY=your_moralis_api_key_here
NODE_ENV=development
```

### 🔑 API Key Setup

1. **OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account and generate an API key
   - Add billing information for API usage

2. **Moralis API Key**
   - Sign up at [Moralis.io](https://moralis.io/)
   - Create a new project
   - Copy your API key from the dashboard

3. **SolanaTracker API Key**
   - Register at [SolanaTracker.io](https://data.solanatracker.io/)
   - Generate an API key from your dashboard

4. **Ethplorer API Key**
   - Visit [Ethplorer.io](https://ethplorer.io/apis)
   - Register for a free API key

---

## 🔗 API Integrations

### Blockchain Data Sources

| API | Purpose | Endpoints |
|-----|---------|-----------|
| **Moralis** | Ethereum token data, prices, metadata | `/erc20/*`, `/market-data/*` |
| **SolanaTracker** | Solana ecosystem analytics | `/tokens/*`, `/pools/*` |
| **CoinGecko** | Market prices, global statistics | `/simple/price`, `/global`, `/search` |
| **Ethplorer** | Ethereum token analytics | `/getTokenInfo`, `/getAddressInfo` |

### AI & Machine Learning

- **OpenAI GPT-3.5 Turbo**: Advanced natural language processing for market analysis
- **Custom Sentiment Engine**: Multi-source news sentiment analysis
- **Risk Assessment AI**: Token security and risk scoring algorithms

---

## 📁 Project Structure

```
lumos-ai/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API Routes
│   │   ├── 📁 eth-tracker/          # Ethereum analytics API
│   │   ├── 📁 solana-eco/           # Solana ecosystem API
│   │   ├── 📁 trending-coins/       # Market trends API
│   │   ├── 📁 news-sentiment/       # News aggregation API
│   │   └── 📁 wallet/               # Wallet analysis API
│   ├── 📁 tools/                    # Feature modules
│   │   ├── 📁 ai-chat/             # AI Trading Assistant
│   │   ├── 📁 dashboard/           # Market Dashboard
│   │   ├── 📁 eth-tracker/         # Ethereum Tracker
│   │   ├── 📁 solana-eco/          # Solana Ecosystem
│   │   ├── 📁 wallet-lookup/       # Wallet Analyzer
│   │   ├── 📁 news-sentiment/      # News Sentiment
│   │   └── 📄 Sidebar.tsx          # Navigation component
│   ├── 📄 globals.css              # Global styles
│   ├── 📄 layout.tsx               # Root layout
│   └── 📄 page.tsx                 # Home page
├── 📁 components/                   # Reusable UI components
│   ├── 📁 ui/                      # Shadcn/ui components
│   └── 📄 Sidebar.tsx              # Shared sidebar
├── 📁 lib/                         # Utility functions
│   ├── 📄 utils.ts                 # Helper functions
│   └── 📄 newsUtils.ts            # News processing utilities
├── 📁 public/                      # Static assets
│   ├── 📁 images/                  # Image assets
│   ├── 📁 fonts/                   # Custom fonts
│   └── 📁 css/                     # External stylesheets
├── 📄 tailwind.config.ts           # Tailwind configuration
├── 📄 next.config.ts               # Next.js configuration
├── 📄 package.json                 # Dependencies and scripts
└── 📄 README.md                    # Project documentation
```

---

## 🎛 Tools & Dashboard

### 🤖 AI Trading Assistant (`/tools/ai-chat`)
- **Real-time Responses**: GPT-3.5 Turbo powered crypto assistant
- **Market Data Integration**: Live price feeds and market analysis
- **Token Analysis**: Automated token address detection and analysis
- **Conversation Context**: Persistent chat history and context awareness
- **Responsive Design**: Mobile-optimized chat interface

### 📊 Market Dashboard (`/tools/dashboard`)
- **Global Statistics**: Live market cap, volume, and dominance data
- **News Aggregation**: Real-time crypto and US market news
- **Trending Analysis**: Hot Solana tokens with performance metrics
- **Interactive Charts**: Advanced data visualizations
- **Responsive Layout**: Mobile-first design approach

### 🔍 Ethereum Tracker (`/tools/eth-tracker`)
- **Token Analytics**: Comprehensive ERC-20 token analysis
- **Real-time Prices**: Live price feeds with historical data
- **Security Assessment**: Token contract security analysis
- **Market Metrics**: Volume, liquidity, and holder statistics
- **Etherscan Integration**: Direct blockchain explorer links

### ⚡ Solana Ecosystem (`/tools/solana-eco`)
- **SPL Token Analysis**: Complete Solana token analytics
- **Pump.fun Integration**: Direct DEX integration for trading
- **Real-time Data**: Live price and volume tracking
- **Risk Assessment**: Token security and liquidity analysis
- **Transaction Insights**: Detailed transaction and holder data

### 👛 Wallet Lookup (`/tools/wallet-lookup`)
- **Multi-chain Support**: Solana and Ethereum wallet analysis
- **Portfolio Tracking**: Complete token holdings with USD values
- **Phantom Integration**: Direct wallet connection and analysis
- **Risk Metrics**: Portfolio diversification and risk assessment
- **Real-time Updates**: Live balance and value tracking

### 📰 News Sentiment (`/tools/news-sentiment`)
- **Multi-source Aggregation**: Reuters, Bloomberg, CoinDesk, and more
- **AI Sentiment Analysis**: Advanced sentiment scoring and classification
- **Real-time Updates**: Live news feeds with instant analysis
- **Advanced Filtering**: Category, sentiment, and keyword filters
- **Mobile Optimized**: Responsive design for all screen sizes

---

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Code linting
npm run lint
```

### Code Style & Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting (recommended)
- **Tailwind CSS**: Utility-first styling approach

### Performance Optimizations

- **Next.js App Router**: Modern routing with improved performance
- **Image Optimization**: Automatic image optimization and lazy loading
- **API Caching**: Strategic caching for external API calls
- **Bundle Optimization**: Tree shaking and code splitting
- **SEO Optimization**: Meta tags and structured data

---

## 🏗 Architecture & Design Patterns

### Frontend Architecture
- **Component-based Design**: Modular, reusable React components
- **Custom Hooks**: Shared logic in custom React hooks
- **State Management**: React Context for global state
- **Error Boundaries**: Graceful error handling and fallbacks

### Backend Architecture
- **API-first Design**: RESTful API endpoints with consistent responses
- **Error Handling**: Comprehensive error handling and logging
- **Rate Limiting**: Protection against API abuse
- **Data Validation**: Input validation and sanitization

### UI/UX Design
- **Glassmorphism**: Modern glass-like design aesthetic
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Accessibility**: WCAG guidelines compliance
- **Performance**: Optimized loading states and transitions

---

## 🔒 Security Features

### API Security
- **Environment Variables**: Secure API key management
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against excessive API calls

### Blockchain Security
- **Address Validation**: Proper blockchain address validation
- **Token Security Analysis**: Automated rug pull and scam detection
- **Wallet Integration**: Secure wallet connection protocols
- **Data Verification**: Cross-reference data from multiple sources

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Vercel will automatically detect Next.js configuration

2. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure all API keys are properly configured

3. **Deploy**
   - Automatic deployment on every push to main branch
   - Preview deployments for pull requests

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### Bug Reports
Please use the GitHub Issues tab to report bugs. Include:
- Detailed description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment information

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-3.5 Turbo API
- **Moralis** for Ethereum blockchain data
- **SolanaTracker** for Solana ecosystem analytics
- **CoinGecko** for cryptocurrency market data
- **Vercel** for hosting and deployment
- **Next.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework

---

## 📞 Support & Community

- **Documentation**: [Read the Docs](https://lumos-ai.vercel.app/docs)
- **Discord**: [Join our Community](https://discord.gg/lumos-ai)
- **Twitter**: [@LumosAI_](https://twitter.com/LumosAI_)
- **Email**: support@lumos-ai.com

---

<div align="center">

**Built with ❤️ by the Lumos AI Team**

[![GitHub Stars](https://img.shields.io/github/stars/yourusername/lumos-ai?style=social)](https://github.com/yourusername/lumos-ai)
[![Twitter Follow](https://img.shields.io/twitter/follow/LumosAI_?style=social)](https://twitter.com/LumosAI_)

**⭐ Star this repository if you find it helpful!**

</div>
