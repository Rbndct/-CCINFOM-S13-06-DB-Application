import { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type DateFormat = 'mm/dd/yyyy' | 'dd/mm/yyyy' | 'yyyy/mm/dd';

type DateFormatContextValue = {
  dateFormat: DateFormat;
  setDateFormat: (format: DateFormat) => void;
  formatDate: (date: Date | string | null | undefined) => string;
};

const DateFormatContext = createContext<DateFormatContextValue | undefined>(undefined);

const DATE_FORMAT_KEY = 'date_format_v1';

export function DateFormatProvider({ children }: { children: React.ReactNode }) {
  const [dateFormat, setDateFormatState] = useState<DateFormat>(() => {
    const stored = localStorage.getItem(DATE_FORMAT_KEY) as DateFormat;
    return stored || 'mm/dd/yyyy';
  });

  const setDateFormat = useCallback((format: DateFormat) => {
    setDateFormatState(format);
    localStorage.setItem(DATE_FORMAT_KEY, format);
  }, []);

  const formatDate = useCallback((date: Date | string | null | undefined): string => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();

    switch (dateFormat) {
      case 'mm/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'dd/mm/yyyy':
        return `${day}/${month}/${year}`;
      case 'yyyy/mm/dd':
        return `${year}/${month}/${day}`;
      default:
        return `${month}/${day}/${year}`;
    }
  }, [dateFormat]);

  const value: DateFormatContextValue = {
    dateFormat,
    setDateFormat,
    formatDate
  };

  return <DateFormatContext.Provider value={value}>{children}</DateFormatContext.Provider>;
}

export function useDateFormat() {
  const ctx = useContext(DateFormatContext);
  if (!ctx) throw new Error('useDateFormat must be used within DateFormatProvider');
  return ctx;
}

