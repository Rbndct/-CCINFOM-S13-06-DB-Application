import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { useCurrency } from '@/context/CurrencyContext';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RotateCcw } from 'lucide-react';

const CURRENCY_PREFERENCES_STORAGE_KEY = 'currency_preferences';

interface CurrencyPreferences {
  symbolPosition: 'before' | 'after';
  decimalPlaces: 0 | 2 | 4;
}

export function CurrencySettings() {
  const { toast } = useToast();
  const { currency, format, refreshRates, loading, lastUpdated } = useCurrency();
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<CurrencyPreferences>(() => {
    const saved = localStorage.getItem(CURRENCY_PREFERENCES_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { symbolPosition: 'before', decimalPlaces: 2 };
      }
    }
    return { symbolPosition: 'before', decimalPlaces: 2 };
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(CURRENCY_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
      
      toast({
        title: 'Success',
        description: 'Currency preferences saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save currency preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences({ symbolPosition: 'before', decimalPlaces: 2 });
    localStorage.removeItem(CURRENCY_PREFERENCES_STORAGE_KEY);
    
    toast({
      title: 'Success',
      description: 'Currency preferences reset to default',
    });
  };

  const formatLastUpdated = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Settings</CardTitle>
        <CardDescription>
          Configure currency display and exchange rate preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency Selector */}
        <div className="space-y-4">
          <CurrencySelector showLabel={true} showRefresh={true} />
        </div>

        {/* Display Preferences */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold">Display Preferences</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol-position">Currency Symbol Position</Label>
              <Select
                value={preferences.symbolPosition}
                onValueChange={(value: 'before' | 'after') =>
                  setPreferences({ ...preferences, symbolPosition: value })
                }
              >
                <SelectTrigger id="symbol-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Before amount ($100)</SelectItem>
                  <SelectItem value="after">After amount (100$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="decimal-places">Decimal Places</Label>
              <Select
                value={preferences.decimalPlaces.toString()}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, decimalPlaces: parseInt(value) as 0 | 2 | 4 })
                }
              >
                <SelectTrigger id="decimal-places">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 (100)</SelectItem>
                  <SelectItem value="2">2 (100.00)</SelectItem>
                  <SelectItem value="4">4 (100.0000)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2 rounded-lg border p-4 bg-muted/50">
          <Label className="text-sm font-medium">Preview</Label>
          <div className="text-2xl font-bold">
            {format(1234.56)}
          </div>
          <p className="text-xs text-muted-foreground">
            Example: {format(1234.56)} (Note: Actual formatting uses system locale)
          </p>
        </div>

        {/* Exchange Rate Info */}
        {lastUpdated && (
          <div className="text-xs text-muted-foreground border-t pt-4">
            Exchange rates last updated: {formatLastUpdated(lastUpdated)}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t pt-4">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

