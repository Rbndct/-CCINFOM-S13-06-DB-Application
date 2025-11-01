import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Users, Calendar, Warehouse, BarChart3, Settings, CheckCircle, XCircle, Database, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { testAPI } from '@/api';
import DashboardLayout from '@/components/DashboardLayout';

const Home = () => {
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState({ 
    connected: false, 
    message: '', 
    loading: true,
    mysqlConnected: false 
  });

  useEffect(() => {
    checkAPIConnection();
  }, []);

  const checkAPIConnection = async () => {
    setApiStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await testAPI.checkConnection();
      // Try to check MySQL if backend is connected
      let mysqlStatus = false;
      try {
        const healthResponse = await testAPI.healthCheck();
        mysqlStatus = healthResponse?.database === 'connected' || healthResponse?.mysql === true;
      } catch {
        // If health check fails, assume MySQL status is unknown
      }
      
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
    {
      icon: Heart,
      title: 'Couples',
      description: 'Manage wedding couples and their information',
      color: 'text-primary',
      link: '/dashboard/couples',
    },
    {
      icon: Calendar,
      title: 'Wedding Overview',
      description: 'View and manage all wedding events and bookings',
      color: 'text-accent',
      link: '/dashboard/weddings',
    },
    {
      icon: Warehouse,
      title: 'Inventory',
      description: 'Track wedding resources and equipment availability',
      color: 'text-primary',
      link: '/dashboard/inventory',
    },
    {
      icon: Users,
      title: 'Guest Management',
      description: 'Track RSVPs, dietary requirements, and seating arrangements',
      color: 'text-primary',
      link: '/dashboard/guests',
    },
    {
      icon: BarChart3,
      title: 'Reports',
      description: 'View analytics and insights for your wedding business',
      color: 'text-accent',
      link: '/dashboard/reports',
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Configure system settings and preferences',
      color: 'text-primary',
      link: '/dashboard/settings',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
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

        {/* Status & Quick Start - Combined in One Row */}
        <div className="max-w-6xl mx-auto">
          <Card className="border-2 shadow-sm">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* Left: Status Indicators */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">System Status</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={checkAPIConnection}
                      disabled={apiStatus.loading}
                      className="gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${apiStatus.loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Backend Status */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {apiStatus.loading ? (
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : apiStatus.connected ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                        <span className="font-medium">Backend Server</span>
                      </div>
                      <Badge 
                        variant={apiStatus.connected ? "default" : "destructive"}
                        className={apiStatus.connected ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {apiStatus.loading ? 'Checking...' : apiStatus.connected ? 'Online' : 'Offline'}
                      </Badge>
                    </div>

                    {/* MySQL Status */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className={`w-5 h-5 ${apiStatus.connected && apiStatus.mysqlConnected ? 'text-green-500' : apiStatus.connected && !apiStatus.mysqlConnected ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                        <span className="font-medium">MySQL Database</span>
                      </div>
                      <Badge 
                        variant={
                          !apiStatus.connected ? "secondary" :
                          apiStatus.mysqlConnected ? "default" : "outline"
                        }
                        className={
                          !apiStatus.connected ? "" :
                          apiStatus.mysqlConnected ? "bg-green-500 hover:bg-green-600" : "border-yellow-500 text-yellow-600"
                        }
                      >
                        {!apiStatus.connected ? 'Unknown' : 
                         apiStatus.mysqlConnected ? 'Connected' : 'Disconnected'}
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

                {/* Right: Quick Start Guide */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Start Guide</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">
                        1
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">Setup Database</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Install MySQL locally</li>
                          <li>• Create database: wedding_management</li>
                          <li>• Run SQL commands from backend/.env.example</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">
                        2
                      </span>
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

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Everything You Need</h2>
            <p className="text-muted-foreground">Manage all aspects of your wedding planning in one place</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-2 hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer group overflow-hidden"
                onClick={() => navigate(feature.link)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:from-primary/20 group-hover:to-accent/20 transition-all ${feature.color}`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Placeholder */}
        <footer className="max-w-6xl mx-auto mt-16 pt-8 border-t">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Heart className="w-5 h-5 text-primary" fill="currentColor" />
              <span className="font-semibold">Wedding Management System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Wedding Management System. All rights reserved.
            </p>
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
