import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

export type SupportedCurrency = 'PHP' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'HKD' | 'SGD' | 'KRW' | 'INR' | 'NZD';

export type Rates = Record<string, number>;

export interface CurrencyInfo {
  code: SupportedCurrency;
  name: string;
  symbol: string;
  locale: string;
}

export const CURRENCY_INFO: Record<SupportedCurrency, CurrencyInfo> = {
  PHP: { code: 'PHP', name: 'Philippine Peso', symbol: '₱', locale: 'en-PH' },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', locale: 'de-CH' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN' },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', locale: 'en-HK' },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG' },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', locale: 'ko-KR' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', locale: 'en-NZ' },
};

type CurrencyContextValue = {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  rates: Rates;
  format: (value: number) => string;
  convert: (value: number, from: SupportedCurrency, to: SupportedCurrency) => number;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refreshRates: () => Promise<void>;
  getCurrencyInfo: (code: SupportedCurrency) => CurrencyInfo;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const RATES_CACHE_KEY = 'currency_rates_v2';
const CURRENCY_KEY = 'selected_currency_v2';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function fetchRates(base: SupportedCurrency, symbols: SupportedCurrency[]): Promise<Rates> {
  try {
    // Try exchangerate-api.com first (more reliable)
    let url = `https://api.exchangerate-api.com/v4/latest/${base}`;
    let res = await fetch(url);
    
    if (!res.ok) {
      // Fallback to exchangerate.host
      url = `https://api.exchangerate.host/latest?base=${base}&symbols=${symbols.join(',')}`;
      res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    }
    
    const data = await res.json();
    
    // exchangerate-api.com returns { rates: {...} }
    if (data.rates) {
      // Filter to only requested symbols
      const filteredRates: Rates = {};
      symbols.forEach(symbol => {
        if (data.rates[symbol] !== undefined) {
          filteredRates[symbol] = data.rates[symbol];
        }
      });
      return filteredRates;
    }
    
    // exchangerate.host returns { success: true, rates: {...} }
    if (data.success !== false && data.rates) {
      return data.rates;
    }
    
    // If neither format matches, try to extract rates anyway
    if (data.rates) {
      return data.rates;
    }
    
    throw new Error('Unexpected API response format');
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return empty rates object instead of throwing - will use fallback
    return {};
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    const stored = localStorage.getItem(CURRENCY_KEY) as SupportedCurrency;
    return stored && CURRENCY_INFO[stored] ? stored : 'PHP';
  });
  const [rates, setRates] = useState<Rates>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const loadRates = useCallback(async (forceRefresh = false) => {
    const cached = localStorage.getItem(RATES_CACHE_KEY);
    const now = Date.now();
    const symbols: SupportedCurrency[] = Object.keys(CURRENCY_INFO) as SupportedCurrency[];

    // Always fetch with PHP as base since that's what's stored in database
    const BASE_CURRENCY: SupportedCurrency = 'PHP';

    // Check cache first (unless forcing refresh)
    if (!forceRefresh && cached) {
      try {
        const parsed = JSON.parse(cached);
        // Cache is valid if it's for PHP base and not expired
        if (now - parsed.timestamp < CACHE_DURATION && parsed.base === BASE_CURRENCY && parsed.rates) {
          setRates(parsed.rates);
          setLastUpdated(parsed.timestamp);
          setError(null);
          return;
        }
      } catch (e) {
        console.warn('Error parsing cached rates:', e);
      }
    }

    // Fetch new rates with PHP as base
    setLoading(true);
    setError(null);
    try {
      // Fetch all currencies relative to PHP (database base currency)
      const fetchedRates = await fetchRates(BASE_CURRENCY, symbols.filter(s => s !== BASE_CURRENCY));
      
      // Check if we got valid rates
      if (Object.keys(fetchedRates).length === 0) {
        throw new Error('No rates received from API');
      }
      
      // Add PHP rate (1 PHP = 1 PHP)
      const fullRates: Rates = { [BASE_CURRENCY]: 1, ...fetchedRates };
      setRates(fullRates);
      setLastUpdated(now);
      setError(null);
      localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ 
        base: BASE_CURRENCY, 
        rates: fullRates, 
        timestamp: now 
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exchange rates';
      setError(errorMessage);
      console.warn('Using cached or fallback rates due to API error:', errorMessage);
      
      // Try to use cached rates even if expired
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.rates && Object.keys(parsed.rates).length > 0) {
            setRates(parsed.rates);
            setLastUpdated(parsed.timestamp);
            // Don't set error if we have cached rates
            return;
          }
        } catch (e) {
          console.warn('Error parsing cached rates:', e);
        }
      }
      
      // If no cache or cache is invalid, use fallback rates (1:1 for all)
      const fallbackRates: Rates = {};
      symbols.forEach(symbol => {
        fallbackRates[symbol] = 1;
      });
      setRates(fallbackRates);
    } finally {
      setLoading(false);
    }
  }, []); // Remove currency dependency since we always fetch PHP rates

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const setCurrency = (c: SupportedCurrency) => {
    if (CURRENCY_INFO[c]) {
      setCurrencyState(c);
      localStorage.setItem(CURRENCY_KEY, c);
    }
  };

  const refreshRates = useCallback(async () => {
    await loadRates(true);
  }, [loadRates]);

  const convert = useCallback((value: number, from: SupportedCurrency, to: SupportedCurrency): number => {
    if (from === to) return value;
    if (!rates[from] || !rates[to]) return value;
    
    // Convert to base currency first, then to target
    const baseValue = value / rates[from];
    return baseValue * rates[to];
  }, [rates]);

  const format = useMemo(() => {
    return (value: number) => {
      const info = CURRENCY_INFO[currency];
      try {
        return new Intl.NumberFormat(info.locale, { 
          style: 'currency', 
          currency, 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).format(value);
      } catch (e) {
        // Fallback formatting
        return `${info.symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    };
  }, [currency]);

  const getCurrencyInfo = useCallback((code: SupportedCurrency): CurrencyInfo => {
    return CURRENCY_INFO[code] || CURRENCY_INFO.PHP;
  }, []);

  const value: CurrencyContextValue = { 
    currency, 
    setCurrency, 
    rates, 
    format, 
    convert,
    loading,
    error,
    lastUpdated,
    refreshRates,
    getCurrencyInfo
  };
  
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}



