// Currency utility - now integrated with CurrencyContext
import { useCurrency, SupportedCurrency } from '@/context/CurrencyContext';

/**
 * Hook to get currency formatting functions
 * Use this in React components
 * Assumes amounts are stored in PHP (database base currency)
 */
export function useCurrencyFormat() {
  const { format, convertFromPHP, convertToPHP, currency, rates } = useCurrency();
  
  return {
    formatCurrency: (amount: number | string): string => {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) return format(0);
      // Convert from PHP (database base) to selected currency before formatting
      const convertedAmount = convertFromPHP(numAmount);
      return format(convertedAmount);
    },
    formatCurrencyNoSymbol: (amount: number | string): string => {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) return '0.00';
      // Return PHP value as-is (for display without conversion)
      return numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    convertFromPHP: convertFromPHP,
    convertToPHP: convertToPHP,
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
  if (isNaN(numAmount)) return '₱0.00';
  
  // Try to get currency from localStorage
  const storedCurrency = localStorage.getItem('selected_currency_v2') as SupportedCurrency;
  const currency = storedCurrency || 'PHP';
  
  try {
    return new Intl.NumberFormat('en-PH', { 
      style: 'currency', 
      currency: 'PHP', // Always show PHP for standalone function
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(numAmount);
  } catch (e) {
    return `₱${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

export const formatCurrencyNoSymbol = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '0.00';
  return numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
