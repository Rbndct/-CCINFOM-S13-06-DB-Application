import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Users, Calendar, Warehouse, BarChart3, Settings, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { testAPI } from '@/api';
import DashboardLayout from '@/components/DashboardLayout';

type ApiStatus = {
  connected: boolean;
  message: string;
  loading: boolean;
  mysqlConnected: boolean;
};

const Home = () => {
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ 
    connected: false, 
    message: '', 
    loading: true,
    mysqlConnected: false 
  });

  useEffect(() => {
    checkAPIConnection();
    const interval = setInterval(checkAPIConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAPIConnection = async () => {
    setApiStatus(prev => ({ ...prev, loading: true }));
    try {
      const response = await testAPI.checkConnection();
      let mysqlStatus = false;
      try {
        const healthResponse = await testAPI.healthCheck();
        mysqlStatus = healthResponse?.status === 'ok';
      } catch {}
      setApiStatus({
        connected: true,
        message: response.message || 'Backend connected!',
        loading: false,
        mysqlConnected: mysqlStatus,
      });
    } catch (error) {
      setApiStatus({
        connected: false,
        message: 'Backend not running. Start your Express server on port 3001.',
        loading: false,
        mysqlConnected: false,
      });
    }
  };

  const features = [
    { icon: Heart, title: 'Couples', description: 'Manage wedding couples and their information', color: 'text-primary', link: '/dashboard/couples' },
    { icon: Calendar, title: 'Wedding Overview', description: 'View and manage all wedding events and bookings', color: 'text-primary', link: '/dashboard/weddings' },
    { icon: Warehouse, title: 'Inventory', description: 'Track wedding resources and equipment availability', color: 'text-primary', link: '/dashboard/inventory' },
    { icon: Users, title: 'Guest Management', description: 'Track RSVPs, dietary requirements, and seating arrangements', color: 'text-primary', link: '/dashboard/guests' },
    { icon: BarChart3, title: 'Reports', description: 'View analytics and insights for your wedding business', color: 'text-primary', link: '/dashboard/reports' },
    { icon: Settings, title: 'Settings', description: 'Configure system settings and preferences', color: 'text-primary', link: '/dashboard/settings' },
  ];

  const StatusDot = ({ online }: { online: boolean }) => (
    <span className={`inline-block w-3 h-3 rounded-full border mr-2 ${online ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'}`} />
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center space-y-6 py-8">
          <div className="flex items-center justify-center mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 rounded-2xl mb-6 shadow-lg">
            <Heart className="w-12 h-12 text-primary" fill="currentColor" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
            Wedding System Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your complete solution for planning the perfect wedding. Manage guests, track budgets, and coordinate every detail with ease.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link to="/dashboard/couples">
              <Button size="lg" className="gap-2 shadow-md hover:shadow-lg transition-shadow">
                <Heart className="w-5 h-5" />
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex justify-end">
          <div className="flex items-center gap-4 rounded-lg border bg-background/80 px-4 py-2 text-sm shadow-sm backdrop-blur">
            <div className="flex items-center gap-2">
              <StatusDot online={apiStatus.connected} />
              <span className="font-medium">
                Backend:{' '}
                {apiStatus.loading ? 'Checking…' : apiStatus.connected ? 'Online' : 'Offline'}
              </span>
            </div>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <div className="flex items-center gap-2">
              <StatusDot online={apiStatus.connected && apiStatus.mysqlConnected} />
              <span className="font-medium">
                MySQL:{' '}
                {!apiStatus.connected
                  ? 'Unknown'
                  : apiStatus.mysqlConnected
                    ? 'Connected'
                    : 'Disconnected'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={checkAPIConnection}
              disabled={apiStatus.loading}
              className="h-8 w-8"
              aria-label="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${apiStatus.loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

      

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Everything You Need</h2>
            <p className="text-muted-foreground">Manage all aspects of your wedding planning in one place</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="h-full border-2 hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer group overflow-hidden flex flex-col" onClick={() => navigate(feature.link)}>
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:from-primary/20 group-hover:to-accent/20 transition-all ${feature.color}`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <footer className="max-w-6xl mx-auto mt-16 pt-8 border-t">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Heart className="w-5 h-5 text-primary" fill="currentColor" />
              <span className="font-semibold">Wedding Management System</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 Wedding Management System. All rights reserved.</p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
            </div>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
};

export default Home;


