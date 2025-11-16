import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Guests from "./pages/Guests";
import NotFound from "./pages/NotFound";

// Dashboard pages
import Dashboard from "./pages/Dashboard";
import Weddings from "./pages/Weddings";
import WeddingDetail from "./pages/WeddingDetail";
import Couples from "./pages/Couples";
import CoupleDetail from "./pages/CoupleDetail";
import MenuItems from "./pages/MenuItems";
import Packages from "./pages/Packages";
import Inventory from "./pages/Inventory";
import SeatingTables from "./pages/SeatingTables";
import DietaryRestrictions from "./pages/DietaryRestrictions";
import Reports from "./pages/Reports";
import Logistics from "./pages/Logistics";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/guests" element={<Guests />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/weddings/:id" element={<WeddingDetail />} />
          <Route path="/dashboard/weddings" element={<Weddings />} />
          <Route path="/dashboard/couples/:id" element={<CoupleDetail />} />
          <Route path="/dashboard/couples" element={<Couples />} />
          <Route path="/dashboard/guests" element={<Guests />} />
          <Route path="/dashboard/menu" element={<MenuItems />} />
          <Route path="/dashboard/packages" element={<Packages />} />
          <Route path="/dashboard/tables" element={<SeatingTables />} />
          <Route path="/dashboard/inventory" element={<Inventory />} />
          <Route path="/dashboard/ingredient-restock" element={<Logistics />} />
          <Route path="/dashboard/dietary" element={<DietaryRestrictions />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
