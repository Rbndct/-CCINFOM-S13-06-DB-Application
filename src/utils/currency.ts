// Currency utility - now integrated with CurrencyContext
import { useCurrency, SupportedCurrency, CURRENCY_INFO } from '@/context/CurrencyContext';

/**
 * Hook to get currency formatting functions
 * Use this in React components
 * Assumes amounts are stored in PHP (database base currency)
 */
export function useCurrencyFormat() {
  const { format, convert, currency, rates } = useCurrency();
  
  // Convert from PHP (database base) to selected currency
  // Rates are always fetched with PHP as base
  // So rates[currency] = how many of selected currency per 1 PHP
  // To convert PHP to selected currency: phpAmount * rates[currency]
  const convertFromPHP = (phpAmount: number): number => {
    if (currency === 'PHP') return phpAmount;
    if (!rates[currency] || rates[currency] === 1) return phpAmount;
    // rates[currency] is the rate from PHP to selected currency
    // So multiply PHP amount by the rate to get amount in selected currency
    return phpAmount * rates[currency];
  };
  
  return {
    formatCurrency: (amount: number | string): string => {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) return format(0);
      // Convert from PHP to selected currency before formatting
      const convertedAmount = convertFromPHP(numAmount);
      return format(convertedAmount);
    },
    formatCurrencyNoSymbol: (amount: number | string): string => {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) return '0.00';
      return numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    convertCurrency: (value: number, from: SupportedCurrency, to: SupportedCurrency): number => {
      return convert(value, from, to);
    },
    currentCurrency: currency,
    rates
  };
}

/**
 * Standalone formatCurrency function that uses the current context currency
 * This is a wrapper that can be used outside React components
 * Note: For use in React components, prefer useCurrencyFormat hook
 */
export const formatCurrency = (amount: number | string): string => {
  // This is a fallback for non-React contexts
  // In React components, use useCurrencyFormat hook instead
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) {
    const defaultInfo = CURRENCY_INFO.PHP;
    return `${defaultInfo.symbol}0.00`;
  }
  
  // Try to get currency from localStorage
  const storedCurrency = localStorage.getItem('selected_currency_v2') as SupportedCurrency;
  const currency = storedCurrency && CURRENCY_INFO[storedCurrency] ? storedCurrency : 'PHP';
  const info = CURRENCY_INFO[currency];
  
  try {
    return new Intl.NumberFormat(info.locale, { 
      style: 'currency', 
      currency, 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(numAmount);
  } catch (e) {
    return `${info.symbol}${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

export const formatCurrencyNoSymbol = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '0.00';
  return numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
