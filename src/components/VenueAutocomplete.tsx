import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VenueAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: {
    name: string;
    address: string;
    placeId: string;
    lat?: number;
    lon?: number;
  }) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
}

const VenueAutocomplete = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Search for a venue...',
  className,
  error,
  disabled,
}: VenueAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY || '';

  // Debug: Log API key status (remove in production)
  useEffect(() => {
    if (!apiKey || apiKey === 'your_api_key_here') {
      console.warn('⚠️ Geoapify API key not configured. Autocomplete will not work.');
    } else {
      console.log('✅ Geoapify API key loaded:', apiKey.substring(0, 10) + '...');
    }
  }, [apiKey]);

  // Fetch suggestions from Geoapify
  const fetchSuggestions = async (query: string) => {
    console.log('🔍 Fetching suggestions for:', query);
    
    if (!query.trim() || query.length < 3) {
      console.log('❌ Query too short (< 3 chars)');
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!apiKey || apiKey === 'your_api_key_here') {
      console.warn('❌ API key missing or placeholder');
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    console.log('⏳ Loading suggestions...');

    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${apiKey}&limit=5&filter=amenity`;
      console.log('🌐 API URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', response.status, errorData);
        
        if (response.status === 401) {
          console.error('❌ Invalid API Key - Check your VITE_GEOAPIFY_API_KEY in .env');
          console.error('❌ Make sure you restarted the dev server after updating .env');
          throw new Error('Invalid API key. Please check your Geoapify API key configuration and restart the dev server.');
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch suggestions`);
      }

      const data = await response.json();
      console.log('📦 API Response:', data);
      
      if (data.features && Array.isArray(data.features)) {
        console.log('✅ Found', data.features.length, 'suggestions');
        setSuggestions(data.features);
        setShowSuggestions(true);
        setSelectedIndex(-1);
        console.log('✅ Suggestions displayed');
      } else {
        console.warn('⚠️ Unexpected API response format:', data);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('❌ Error fetching venue suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
      console.log('⏹️ Loading complete');
    }
  };

  // Debounced search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  // Handle place selection
  const handleSelectPlace = (feature: any) => {
    const properties = feature.properties;
    const placeName = properties.name || properties.formatted || value;
    const address = properties.formatted || placeName;
    const placeId = feature.properties.place_id || feature.id;

    onChange(placeName);
    onPlaceSelect({
      name: placeName,
      address: address,
      placeId: placeId,
      lat: feature.geometry?.coordinates?.[1],
      lon: feature.geometry?.coordinates?.[0],
    });

    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectPlace(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 Autocomplete State:', {
      showSuggestions,
      suggestionsCount: suggestions.length,
      isLoading,
      hasApiKey: !!apiKey && apiKey !== 'your_api_key_here'
    });
  }, [showSuggestions, suggestions.length, isLoading, apiKey]);

  const hasApiKey = !!apiKey && apiKey !== 'your_api_key_here';
  const displayValue = value;

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={hasApiKey ? placeholder : 'Enter venue name'}
          className={cn(className, error && 'border-red-500')}
          disabled={disabled}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-[100] w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((feature, index) => {
            const properties = feature.properties;
            const name = properties.name || properties.formatted;
            const address = properties.formatted || name;

            return (
              <div
                key={feature.id || index}
                className={cn(
                  'px-4 py-3 cursor-pointer hover:bg-accent border-b border-border last:border-b-0',
                  selectedIndex === index && 'bg-accent'
                )}
                onClick={() => handleSelectPlace(feature)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{name}</div>
                    {address !== name && (
                      <div className="text-xs text-muted-foreground truncate">
                        {address}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!hasApiKey && (
        <p className="text-xs text-muted-foreground mt-1">
          To enable venue autocomplete, add VITE_GEOAPIFY_API_KEY to your .env file
        </p>
      )}
    </div>
  );
};

export default VenueAutocomplete;

