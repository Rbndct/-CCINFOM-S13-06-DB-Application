import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, CalendarDays, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { testAPI } from '@/api';
import Navigation from '@/components/Navigation';

const Home = () => {
  const [apiStatus, setApiStatus] = useState({ connected: false, message: '', loading: true });

  useEffect(() => {
    checkAPIConnection();
  }, []);

  const checkAPIConnection = async () => {
    try {
      const response = await testAPI.checkConnection();
      setApiStatus({
        connected: true,
        message: response.message || 'Backend connected!',
        loading: false,
      });
    } catch (error) {
      setApiStatus({
        connected: false,
        message: 'Backend not running. Start your Express server on port 3001.',
        loading: false,
      });
    }
  };

  const features = [
    {
      icon: Users,
      title: 'Guest Management',
      description: 'Track RSVPs, dietary requirements, and seating arrangements',
      color: 'text-primary',
    },
    {
      icon: CalendarDays,
      title: 'Wedding Timeline',
      description: 'Organize every detail from engagement to honeymoon',
      color: 'text-accent',
    },
    {
      icon: Sparkles,
      title: 'Vendor Coordination',
      description: 'Manage contracts, payments, and communications',
      color: 'text-primary',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
            <Heart className="w-10 h-10 text-primary" fill="currentColor" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Wedding System Management
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your complete solution for planning the perfect wedding. Manage guests, track budgets, and coordinate every detail with ease.
          </p>

          {/* API Status Card */}
          <Card className="max-w-md mx-auto border-2 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {apiStatus.loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Checking Connection...
                  </>
                ) : apiStatus.connected ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Backend Connected
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-destructive" />
                    Backend Offline
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{apiStatus.message}</p>
              {!apiStatus.connected && !apiStatus.loading && (
                <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                  <p className="font-medium">To start the backend:</p>
                  <code className="block bg-background p-2 rounded">cd backend && npm install && npm run dev</code>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-center mt-8">
            <Link to="/guests">
              <Button size="lg" className="gap-2">
                <Users className="w-5 h-5" />
                Manage Guests
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={checkAPIConnection}>
              Refresh Status
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Quick Start Guide */}
        <Card className="max-w-4xl mx-auto mt-12 border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Start Guide</CardTitle>
            <CardDescription>Get your backend running in minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                  Setup Database
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-8">
                  <li>• Install MySQL locally</li>
                  <li>• Create database: wedding_management</li>
                  <li>• Run SQL commands from backend/.env.example</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                  Start Backend
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-8">
                  <li>• Copy .env.example to .env</li>
                  <li>• Update database credentials</li>
                  <li>• Run: npm install && npm run dev</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Home;
