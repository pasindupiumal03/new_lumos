// Common news sources with their logos and display names
export const newsSources: Record<string, { name: string; logo: string; domain: string }> = {
  'coindesk': {
    name: 'CoinDesk',
    logo: 'https://cryptologos.cc/logos/coindesk-cdc-logo.png',
    domain: 'coindesk.com'
  },
  'cointelegraph': {
    name: 'CoinTelegraph',
    logo: 'https://cryptologos.cc/logos/cointelegraph-ct-logo.png',
    domain: 'cointelegraph.com'
  },
  'decrypt': {
    name: 'Decrypt',
    logo: 'https://cryptologos.cc/logos/decrypt-dcrpt-logo.png',
    domain: 'decrypt.co'
  },
  'theblock': {
    name: 'The Block',
    logo: 'https://cryptologos.cc/logos/the-block-tb-logo.png',
    domain: 'theblockcrypto.com'
  },
  'cryptonews': {
    name: 'CryptoNews',
    logo: 'https://cryptologos.cc/logos/cryptonews-cnw-logo.png',
    domain: 'cryptonews.com'
  },
  'bitcoinist': {
    name: 'Bitcoinist',
    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    domain: 'bitcoinist.com'
  },
  'newsbtc': {
    name: 'NewsBTC',
    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    domain: 'newsbtc.com'
  },
  'cryptopotato': {
    name: 'CryptoPotato',
    logo: 'https://cryptologos.cc/logos/cryptopotato-cpt-logo.png',
    domain: 'cryptopotato.com'
  },
  'ambcrypto': {
    name: 'AMBCrypto',
    logo: 'https://cryptologos.cc/logos/amb-ambrosus-amb-logo.png',
    domain: 'ambcrypto.com'
  },
  'u.today': {
    name: 'U.Today',
    logo: 'https://cryptologos.cc/logos/u-today-utu-logo.png',
    domain: 'u.today'
  },
  'cryptoslate': {
    name: 'CryptoSlate',
    logo: 'https://cryptologos.cc/logos/cryptoslate-cs-logo.png',
    domain: 'cryptoslate.com'
  },
  'beincrypto': {
    name: 'BeInCrypto',
    logo: 'https://cryptologos.cc/logos/beincrypto-bic-logo.png',
    domain: 'beincrypto.com'
  },
  'cryptobriefing': {
    name: 'Crypto Briefing',
    logo: 'https://cryptologos.cc/logos/crypto-briefing-cb-logo.png',
    domain: 'cryptobriefing.com'
  },
  'dailyhodl': {
    name: 'The Daily Hodl',
    logo: 'https://cryptologos.cc/logos/the-daily-hodl-tdh-logo.png',
    domain: 'dailyhodl.com'
  },
  'bitcoinmagazine': {
    name: 'Bitcoin Magazine',
    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    domain: 'bitcoinmagazine.com'
  }
};

// Function to get news source info from URL
export const getNewsSourceInfo = (url: string) => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    
    // Try exact match first
  const sourceKey = Object.keys(newsSources).find(key => 
    domain === newsSources[key].domain || domain.endsWith(`.${newsSources[key].domain}`)
  );
  
  if (sourceKey) {
    return newsSources[sourceKey];
  }
  
  // Try partial match
  for (const [key, source] of Object.entries(newsSources)) {
    if (domain.includes(key)) {
      return source;
    }
  }
  
  // Default fallback
  return {
    name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
    logo: `https://www.google.com/s2/favicons?domain=${url}&sz=64`,
    domain
  };
  } catch (e) {
    return {
      name: 'Unknown Source',
      logo: 'https://www.google.com/s2/favicons?domain=example.com&sz=64',
      domain: 'unknown'
    };
  }
};

// Function to get sentiment color and label
export const getSentimentInfo = (sentiment: 'positive' | 'negative' | 'neutral') => {
  switch (sentiment) {
    case 'positive':
      return {
        label: 'Positive',
        color: 'text-green-500',
        bgColor: 'bg-green-500/20',
        icon: '↑',
        emoji: '😊'
      };
    case 'negative':
      return {
        label: 'Negative',
        color: 'text-red-500',
        bgColor: 'bg-red-500/20',
        icon: '↓',
        emoji: '😟'
      };
    default:
      return {
        label: 'Neutral',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/20',
        icon: '→',
        emoji: '😐'
      };
  }
};
