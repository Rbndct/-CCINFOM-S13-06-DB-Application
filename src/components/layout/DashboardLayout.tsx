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
  Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
        { to: '/dashboard/ingredients', label: 'Ingredients', icon: Scale },
        { to: '/dashboard/menu', label: 'Menu Items', icon: Utensils },
        { to: '/dashboard/packages', label: 'Packages', icon: PackageIcon },
      ],
    },
    {
      label: 'Venue & Logistics',
      items: [
        { to: '/dashboard/inventory', label: 'Inventory', icon: Warehouse },
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
            <TooltipProvider delayDuration={200}>
              {/* Home Link */}
              {sidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to={homeItem.to}
                      className={cn(
                        "flex items-center justify-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-4 w-full",
                        isActive(homeItem.to)
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Home className="h-4 w-4 flex-shrink-0" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{homeItem.label}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  to={homeItem.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-4",
                    isActive(homeItem.to)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-muted"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Home className="h-4 w-4 flex-shrink-0" />
                  <span>{homeItem.label}</span>
                </Link>
              )}

              {/* Navigation Sections */}
              {navigationSections.map((section, sectionIndex) => (
                <div key={section.label} className={cn("mb-6", sectionIndex === 0 && "mt-2")}>
                  {!sidebarCollapsed && (
                    <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.label}
                    </h3>
                  )}
                  {!sidebarCollapsed && sectionIndex > 0 && (
                    <div className="h-px bg-border mx-3 mb-3" />
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.to);
                      
                      if (sidebarCollapsed) {
                        return (
                          <Tooltip key={item.to}>
                            <TooltipTrigger asChild>
                              <Link
                                to={item.to}
                                className={cn(
                                  "flex items-center justify-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full",
                                  active
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-foreground hover:bg-muted"
                                )}
                                onClick={() => setSidebarOpen(false)}
                              >
                                <Icon className="h-4 w-4 flex-shrink-0" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{item.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all relative",
                            active
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-foreground hover:bg-muted"
                          )}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
                          )}
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TooltipProvider>
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
