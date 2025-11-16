import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { CurrencyProvider } from './context/CurrencyContext';
import { DateFormatProvider } from './context/DateFormatContext';
import { TimeFormatProvider } from './context/TimeFormatContext';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <CurrencyProvider>
      <DateFormatProvider>
        <TimeFormatProvider>
          <App />
        </TimeFormatProvider>
      </DateFormatProvider>
    </CurrencyProvider>
  </ThemeProvider>
);
