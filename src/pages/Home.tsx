import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Users, Calendar, Warehouse, BarChart3, Settings, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { testAPI } from '@/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

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
      let mysqlMessage = '';
      try {
        const healthResponse = await testAPI.healthCheck();
        mysqlStatus = healthResponse?.status === 'ok' && healthResponse?.database?.connected === true;
        if (healthResponse?.database) {
          mysqlMessage = ` (${healthResponse.database.tableCount || 0} tables)`;
        }
      } catch (healthError: any) {
        console.error('Health check failed:', healthError);
        mysqlMessage = healthError?.response?.data?.message || healthError?.message || '';
      }
      setApiStatus({
        connected: true,
        message: (response.message || 'Backend connected!') + (mysqlStatus ? mysqlMessage : ''),
        loading: false,
        mysqlConnected: mysqlStatus,
      });
    } catch (error) {
      setApiStatus({
        connected: false,
        message: 'Backend not running. Start your Express server.',
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

        <div className="max-w-6xl mx-auto">
          <Card className="border-2 shadow-sm">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">System Status</h3>
                    <Button variant="ghost" size="sm" onClick={checkAPIConnection} disabled={apiStatus.loading} className="gap-2">
                      <RefreshCw className={`w-4 h-4 ${apiStatus.loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <StatusDot online={apiStatus.connected} />
                        <span className="font-medium">Backend Server</span>
                      </div>
                      <Badge 
                        variant={apiStatus.connected ? 'default' : 'destructive'}
                        className={apiStatus.connected ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {apiStatus.loading ? 'Checking...' : apiStatus.connected ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <StatusDot online={apiStatus.connected && apiStatus.mysqlConnected} />
                        <span className="font-medium">MySQL Database</span>
                      </div>
                      <Badge 
                        variant={!apiStatus.connected ? 'secondary' : apiStatus.mysqlConnected ? 'default' : 'outline'}
                        className={!apiStatus.connected ? '' : apiStatus.mysqlConnected ? 'bg-green-500 hover:bg-green-600' : 'border-yellow-500 text-yellow-600'}
                      >
                        {!apiStatus.connected ? 'Unknown' : apiStatus.mysqlConnected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                  </div>
                  {!apiStatus.connected && !apiStatus.loading && (
                    <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                      <p className="font-medium mb-2">To start the backend:</p>
                      <code className="block bg-background p-2 rounded text-xs">cd backend && npm install && npm run dev</code>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Start Guide</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">1</span>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">Setup Database</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Install MySQL locally</li>
                          <li>• Create database: wedding_management_db</li>
                          <li>• Run your provided SQL schema</li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">2</span>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">Start Backend</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Copy .env.example to .env</li>
                          <li>• Update database credentials</li>
                          <li>• Run: npm install && npm run dev</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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


