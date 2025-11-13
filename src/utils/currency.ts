import { useCurrency } from '@/context/CurrencyContext';

export function usePrice() {
  const { currency, rates, format } = useCurrency();
  const convert = (valueInPHP: number) => {
    const rate = rates[currency] || 1;
    return valueInPHP * rate;
  };
  return { currency, convert, format };
}




