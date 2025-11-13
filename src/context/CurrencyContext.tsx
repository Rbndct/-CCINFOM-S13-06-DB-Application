import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type SupportedCurrency = 'PHP' | 'USD' | 'EUR' | 'JPY' | 'GBP';

type Rates = Record<string, number>;

type CurrencyContextValue = {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  rates: Rates;
  format: (value: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const RATES_CACHE_KEY = 'currency_rates_v1';
const CURRENCY_KEY = 'selected_currency_v1';

async function fetchRates(base: SupportedCurrency, symbols: SupportedCurrency[]): Promise<Rates> {
  const url = `https://api.exchangerate.host/latest?base=${base}&symbols=${symbols.join(',')}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.rates || {};
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => (localStorage.getItem(CURRENCY_KEY) as SupportedCurrency) || 'PHP');
  const [rates, setRates] = useState<Rates>({});

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_KEY, c);
  };

  useEffect(() => {
    const cached = localStorage.getItem(RATES_CACHE_KEY);
    const now = Date.now();
    const symbols: SupportedCurrency[] = ['PHP', 'USD', 'EUR', 'JPY', 'GBP'];
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (now - parsed.timestamp < 24 * 60 * 60 * 1000 && parsed.base === currency) {
          setRates(parsed.rates);
          return;
        }
      } catch {}
    }
    (async () => {
      const r = await fetchRates(currency, symbols.filter(s => s !== currency));
      const fullRates: Rates = { [currency]: 1, ...r };
      setRates(fullRates);
      localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ base: currency, rates: fullRates, timestamp: now }));
    })();
  }, [currency]);

  const format = useMemo(() => {
    return (value: number) => {
      const locales: Record<SupportedCurrency, string> = {
        PHP: 'en-PH', USD: 'en-US', EUR: 'de-DE', JPY: 'ja-JP', GBP: 'en-GB'
      };
      return new Intl.NumberFormat(locales[currency], { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    };
  }, [currency]);

  const value: CurrencyContextValue = { currency, setCurrency, rates, format };
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}



