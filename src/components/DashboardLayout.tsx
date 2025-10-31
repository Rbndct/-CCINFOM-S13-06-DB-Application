import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, 
  Home, 
  Users, 
  Calendar, 
  Utensils, 
  Package, 
  Warehouse, 
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  UserCheck,
  ChefHat,
  ShoppingBag,
  MapPin,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      title: 'Overview',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: Home },
        { to: '/dashboard/weddings', label: 'Weddings', icon: Calendar },
        { to: '/dashboard/couples', label: 'Couples', icon: Heart },
        { to: '/dashboard/guests', label: 'Guests', icon: Users },
      ]
    },
    {
      title: 'Menu & Catering',
      items: [
        { to: '/dashboard/menu', label: 'Menu Items', icon: Utensils },
        { to: '/dashboard/packages', label: 'Packages', icon: Package },
        { to: '/dashboard/ingredients', label: 'Ingredients', icon: ChefHat },
        { to: '/dashboard/recipes', label: 'Recipes', icon: ChefHat },
      ]
    },
    {
      title: 'Venue & Logistics',
      items: [
        { to: '/dashboard/tables', label: 'Seating Tables', icon: MapPin },
        { to: '/dashboard/inventory', label: 'Inventory', icon: Warehouse },
        { to: '/dashboard/allocations', label: 'Allocations', icon: ShoppingBag },
      ]
    },
    {
      title: 'Management',
      items: [
        { to: '/dashboard/dietary', label: 'Dietary Restrictions', icon: UserCheck },
        { to: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
        { to: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        sidebarCollapsed && "lg:w-16"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            {!sidebarCollapsed && (
              <Link to="/dashboard" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
                <Heart className="h-6 w-6" fill="currentColor" />
                <span className="text-xl font-semibold">Wedding Manager</span>
              </Link>
            )}
            {sidebarCollapsed && (
              <div className="flex justify-center w-full">
                <Heart className="h-6 w-6 text-primary" fill="currentColor" />
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex h-8 w-8 p-0"
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigationItems.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-1">
                {!sidebarCollapsed && (
                  <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive(item.to)
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "lg:pl-64 transition-all duration-300",
        sidebarCollapsed && "lg:pl-16"
      )}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {navigationItems
                .flatMap(section => section.items)
                .find(item => isActive(item.to))?.label || 'Dashboard'}
            </h1>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
