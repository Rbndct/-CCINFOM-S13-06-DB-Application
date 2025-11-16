import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, 
  Calendar, 
  Warehouse, 
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Home,
  Utensils,
  Package as PackageIcon,
  UserCheck,
  PackagePlus,
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

  const homeItem = { to: '/', label: 'Home', icon: Home };

  const navigationSections = [
    {
      label: 'Overview',
      items: [
        { to: '/dashboard/couples', label: 'Couples', icon: Heart },
        { to: '/dashboard/weddings', label: 'Weddings', icon: Calendar },
      ],
    },
    {
      label: 'Menu & Catering',
      items: [
        { to: '/dashboard/menu', label: 'Menu Items', icon: Utensils },
        { to: '/dashboard/packages', label: 'Packages', icon: PackageIcon },
        { to: '/dashboard/ingredients', label: 'Ingredients', icon: PackagePlus },
      ],
    },
    {
      label: 'Venue & Logistics',
      items: [
        { to: '/dashboard/inventory', label: 'Inventory', icon: Warehouse },
        { to: '/dashboard/ingredient-restock', label: 'Ingredient Restock', icon: Warehouse },
      ],
    },
    {
      label: 'Management',
      items: [
        { to: '/dashboard/dietary', label: 'Dietary Restrictions', icon: UserCheck },
        { to: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
        { to: '/dashboard/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  // Flatten all items for header title lookup
  const allNavigationItems = [
    homeItem,
    ...navigationSections.flatMap(section => section.items),
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
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
              <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
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
            {/* Home Link */}
            <Link
              to={homeItem.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-4",
                isActive(homeItem.to)
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Home className="h-4 w-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{homeItem.label}</span>}
            </Link>

            {/* Navigation Sections */}
            {navigationSections.map((section, sectionIndex) => (
              <div key={section.label} className={cn("mb-6", sectionIndex === 0 && "mt-2")}>
                {!sidebarCollapsed && (
                  <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.label}
                  </h3>
                )}
                <div className="space-y-1">
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
              {location.pathname === '/' ? 'Home' : allNavigationItems.find(item => isActive(item.to))?.label || 'Dashboard'}
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
