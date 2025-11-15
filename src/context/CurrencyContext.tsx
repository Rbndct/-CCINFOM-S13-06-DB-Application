import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

export type SupportedCurrency = 'PHP' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'HKD' | 'SGD' | 'KRW' | 'INR' | 'NZD';

export type Rates = Record<SupportedCurrency, number>;

type CurrencyContextValue = {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  rates: Rates;
  format: (value: number) => string;
  convert: (value: number, from: SupportedCurrency, to: SupportedCurrency) => number;
  convertFromPHP: (phpAmount: number) => number; // Convert PHP (database base) to selected currency
  convertToPHP: (amount: number, fromCurrency: SupportedCurrency) => number; // Convert from selected currency to PHP
  loading: boolean;
  error: string | null;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const RATES_CACHE_KEY = 'currency_rates_v2';
const CURRENCY_KEY = 'selected_currency_v2';

// Always fetch rates with PHP as base currency (database standard)
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
      const filteredRates: Partial<Rates> = {};
      symbols.forEach(symbol => {
        if (data.rates[symbol] !== undefined) {
          filteredRates[symbol] = data.rates[symbol];
        }
      });
      return filteredRates as Rates;
    }

    // exchangerate.host returns { success: true, rates: {...} }
    if (data.success !== false && data.rates) {
      return data.rates as Rates;
    }

    throw new Error('Unexpected API response format');
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return fallback rates (1:1 for PHP, approximate for others)
    const fallbackRates: Partial<Rates> = { PHP: 1 };
    symbols.forEach(symbol => {
      if (symbol !== base) {
        fallbackRates[symbol] = 1; // Fallback to 1:1 if API fails
      }
    });
    return fallbackRates as Rates;
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    const stored = localStorage.getItem(CURRENCY_KEY) as SupportedCurrency;
    return stored || 'PHP';
  });
  const [rates, setRates] = useState<Rates>({} as Rates);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setCurrency = useCallback((c: SupportedCurrency) => {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_KEY, c);
  }, []);

  // Always fetch rates with PHP as base (database standard)
  useEffect(() => {
    const loadRates = async () => {
      setLoading(true);
      setError(null);

      const cached = localStorage.getItem(RATES_CACHE_KEY);
      const now = Date.now();
      const BASE_CURRENCY: SupportedCurrency = 'PHP'; // Always PHP as base
      const symbols: SupportedCurrency[] = ['PHP', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'SGD', 'KRW', 'INR', 'NZD'];

      // Check cache (24 hour expiry)
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (now - parsed.timestamp < 24 * 60 * 60 * 1000 && parsed.base === BASE_CURRENCY) {
            setRates(parsed.rates);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Failed to parse cached rates:', e);
        }
      }

      // Fetch fresh rates
      try {
        const fetchedRates = await fetchRates(BASE_CURRENCY, symbols.filter(s => s !== BASE_CURRENCY));
        const fullRates: Rates = { PHP: 1, ...fetchedRates } as Rates;
        setRates(fullRates);
        localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ 
          base: BASE_CURRENCY, 
          rates: fullRates, 
          timestamp: now 
        }));
      } catch (err: any) {
        console.error('Error loading exchange rates:', err);
        setError(err.message || 'Failed to load exchange rates');
        // Use cached rates even if expired, or fallback
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setRates(parsed.rates);
          } catch {}
        } else {
          // Fallback to 1:1 rates
          const fallback: Rates = {} as Rates;
          symbols.forEach(s => {
            fallback[s] = 1;
          });
          setRates(fallback);
        }
      } finally {
        setLoading(false);
      }
    };

    loadRates();
  }, []); // Only run once on mount, not when currency changes

  // Convert between currencies
  const convert = useCallback((value: number, from: SupportedCurrency, to: SupportedCurrency): number => {
    if (from === to) return value;
    if (!rates[from] || !rates[to]) return value;
    
    // Convert from -> PHP -> to
    // rates are with PHP as base, so rates[from] = how many PHP per 1 unit of 'from'
    // To convert: value / rates[from] (to PHP) * rates[to] (to target)
    const inPHP = value / rates[from];
    return inPHP * rates[to];
  }, [rates]);

  // Convert PHP (database base) to selected display currency
  const convertFromPHP = useCallback((phpAmount: number): number => {
    if (currency === 'PHP') return phpAmount;
    if (!rates[currency] || rates[currency] === 1) return phpAmount;
    // rates[currency] = how many of selected currency per 1 PHP
    return phpAmount * rates[currency];
  }, [currency, rates]);

  // Convert from selected currency to PHP (for input conversion if needed)
  const convertToPHP = useCallback((amount: number, fromCurrency: SupportedCurrency): number => {
    if (fromCurrency === 'PHP') return amount;
    if (!rates[fromCurrency] || rates[fromCurrency] === 1) return amount;
    // rates[fromCurrency] = how many of fromCurrency per 1 PHP
    // So to convert to PHP: amount / rates[fromCurrency]
    return amount / rates[fromCurrency];
  }, [rates]);

  const format = useMemo(() => {
    return (value: number) => {
      const locales: Record<SupportedCurrency, string> = {
        PHP: 'en-PH', USD: 'en-US', EUR: 'de-DE', JPY: 'ja-JP', GBP: 'en-GB',
        AUD: 'en-AU', CAD: 'en-CA', CHF: 'de-CH', CNY: 'zh-CN', HKD: 'en-HK',
        SGD: 'en-SG', KRW: 'ko-KR', INR: 'en-IN', NZD: 'en-NZ'
      };
      const locale = locales[currency] || 'en-US';
      return new Intl.NumberFormat(locale, { 
        style: 'currency', 
        currency, 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }).format(value);
    };
  }, [currency]);

  const value: CurrencyContextValue = { 
    currency, 
    setCurrency, 
    rates, 
    format, 
    convert,
    convertFromPHP,
    convertToPHP,
    loading,
    error
  };
  
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}



