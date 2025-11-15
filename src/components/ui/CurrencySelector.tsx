import { useState } from 'react';
import { useCurrency, CURRENCY_INFO, SupportedCurrency } from '@/context/CurrencyContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CurrencySelectorProps {
  showLabel?: boolean;
  showRefresh?: boolean;
  compact?: boolean;
}

export function CurrencySelector({ showLabel = true, showRefresh = true, compact = false }: CurrencySelectorProps) {
  const { currency, setCurrency, refreshRates, loading, lastUpdated, rates, getCurrencyInfo } = useCurrency();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshRates();
    } finally {
      setRefreshing(false);
    }
  };

  const formatLastUpdated = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getExchangeRateInfo = () => {
    if (!rates || Object.keys(rates).length === 0) return null;
    
    const currentInfo = getCurrencyInfo(currency);
    const currentRate = rates[currency] || 1;
    
    if (currency === 'PHP') {
      // Show USD rate as example
      const usdRate = rates.USD || 1;
      return `1 PHP = ${(1 / usdRate).toFixed(4)} USD`;
    } else {
      // Rates are with PHP as base, so show conversion from PHP
      return `1 PHP = ${currentRate.toFixed(4)} ${currency}`;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Select value={currency} onValueChange={(value) => setCurrency(value as SupportedCurrency)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(CURRENCY_INFO).map((info) => (
              <SelectItem key={info.code} value={info.code}>
                <div className="flex items-center gap-2">
                  <span>{info.symbol}</span>
                  <span>{info.code}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showRefresh && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                >
                  {refreshing || loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh exchange rates</p>
                {lastUpdated && <p className="text-xs mt-1">Updated {formatLastUpdated(lastUpdated)}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showLabel && (
        <div>
          <label className="text-sm font-medium">Currency</label>
          <p className="text-xs text-muted-foreground">Select your preferred currency</p>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Select value={currency} onValueChange={(value) => setCurrency(value as SupportedCurrency)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{getCurrencyInfo(currency).symbol}</span>
                <span>{getCurrencyInfo(currency).name} ({currency})</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.values(CURRENCY_INFO).map((info) => (
              <SelectItem key={info.code} value={info.code}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{info.symbol}</span>
                  <span>{info.name}</span>
                  <span className="text-muted-foreground">({info.code})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {showRefresh && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                >
                  {refreshing || loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh exchange rates</p>
                {lastUpdated && <p className="text-xs mt-1">Updated {formatLastUpdated(lastUpdated)}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {getExchangeRateInfo() && (
        <div className="text-sm text-muted-foreground">
          {getExchangeRateInfo()}
        </div>
      )}

      {lastUpdated && (
        <div className="text-xs text-muted-foreground">
          Last updated: {formatLastUpdated(lastUpdated)}
        </div>
      )}
    </div>
  );
}

