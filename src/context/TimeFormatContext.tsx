import { createContext, useContext, useState, useCallback } from 'react';

export type TimeFormat = '12hr' | '24hr';

type TimeFormatContextValue = {
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
  formatTime: (date: Date | string | null | undefined) => string;
};

const TimeFormatContext = createContext<TimeFormatContextValue | undefined>(undefined);

const TIME_FORMAT_KEY = 'time_format_v1';

export function TimeFormatProvider({ children }: { children: React.ReactNode }) {
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>(() => {
    const stored = localStorage.getItem(TIME_FORMAT_KEY) as TimeFormat;
    return stored || '12hr';
  });

  const setTimeFormat = useCallback((format: TimeFormat) => {
    setTimeFormatState(format);
    localStorage.setItem(TIME_FORMAT_KEY, format);
  }, []);

  const formatTime = useCallback((date: Date | string | null | undefined): string => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';

    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');

    if (timeFormat === '24hr') {
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    } else {
      const hours12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${hours12}:${minutes} ${ampm}`;
    }
  }, [timeFormat]);

  const value: TimeFormatContextValue = {
    timeFormat,
    setTimeFormat,
    formatTime
  };

  return <TimeFormatContext.Provider value={value}>{children}</TimeFormatContext.Provider>;
}

export function useTimeFormat() {
  const ctx = useContext(TimeFormatContext);
  if (!ctx) throw new Error('useTimeFormat must be used within TimeFormatProvider');
  return ctx;
}

