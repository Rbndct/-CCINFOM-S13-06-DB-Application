import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrencyFormat } from '@/utils/currency';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CurrencyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
}

/**
 * CurrencyInput component for forms
 * - Users input values in PHP (database base currency)
 * - Shows converted preview in selected display currency
 * - All backend/database values remain in PHP
 */
export function CurrencyInput({
  label,
  value,
  onChange,
  placeholder = "0.00",
  required = false,
  disabled = false,
  description
}: CurrencyInputProps) {
  const { formatCurrency, convertFromPHP, currentCurrency } = useCurrencyFormat();
  
  const numValue = parseFloat(value) || 0;
  const convertedValue = numValue > 0 ? convertFromPHP(numValue) : 0;
  const showConversion = currentCurrency !== 'PHP' && numValue > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={label} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
          {label}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                Input values in PHP (₱). Values are stored in PHP in the database.
                {showConversion && ` Display shows ${currentCurrency} equivalent.`}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="space-y-1">
        <Input
          id={label}
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="font-mono"
        />
        
        {showConversion && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span>≈</span>
            <span className="font-medium">{formatCurrency(convertedValue)}</span>
            <span className="text-muted-foreground">({currentCurrency})</span>
          </div>
        )}
        
        {!showConversion && numValue > 0 && (
          <div className="text-xs text-muted-foreground">
            {formatCurrency(numValue)} (PHP)
          </div>
        )}
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

