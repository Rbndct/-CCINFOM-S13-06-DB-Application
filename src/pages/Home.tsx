import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, Warehouse, BarChart3, Settings, ArrowRight, CheckCircle2, XCircle, Database, Hash, UserRound, UserRoundCheck, UserRoundPlus } from 'lucide-react';
import { motion } from 'framer-motion';
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
      const response = await testAPI.checkConnection() as { message?: string };
      let mysqlStatus = false;
      try {
        const healthResponse = (await testAPI.healthCheck() as unknown) as {
          status?: string;
          database?: {
            connected?: boolean;
            name?: string;
            tableCount?: number;
          };
        };
        // Check if response has the expected structure
        if (healthResponse && typeof healthResponse === 'object') {
          mysqlStatus = healthResponse.status === 'ok' && 
                       healthResponse.database !== undefined && 
                       healthResponse.database.connected === true;
          // Debug: Log the health response to verify it's correct
          if (!mysqlStatus) {
            console.warn('MySQL status check failed. Health response:', healthResponse);
          }
        } else {
          console.warn('Invalid health response structure:', healthResponse);
        }
      } catch (healthError: any) {
        console.error('Health check failed:', healthError);
        console.error('Health check error details:', {
          message: healthError?.message,
          response: healthError?.response?.data,
          status: healthError?.response?.status
        });
        mysqlStatus = false;
      }
      setApiStatus({
        connected: true,
        message: response?.message || 'Backend connected!',
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
    { icon: Users, title: 'Couples', description: 'Manage wedding couples and their information', link: '/dashboard/couples' },
    { icon: Calendar, title: 'Wedding Overview', description: 'View and manage all wedding events and bookings', link: '/dashboard/weddings' },
    { icon: Warehouse, title: 'Inventory', description: 'Track wedding resources and equipment availability', link: '/dashboard/inventory' },
    { icon: Users, title: 'Guest Management', description: 'Track RSVPs, dietary requirements, and seating arrangements', link: '/dashboard/guests' },
    { icon: BarChart3, title: 'Reports', description: 'View analytics and insights for your wedding business', link: '/dashboard/reports' },
    { icon: Settings, title: 'Settings', description: 'Configure system settings and preferences', link: '/dashboard/settings' },
  ];

  // Wedding photo gallery images - replace with your actual wedding photos
  const weddingPhotos = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop',
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    hover: {
      y: -8,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="relative min-h-screen">
        {/* System Status - Top Right with Glass Effect */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="fixed top-6 right-6 z-50 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-primary/20 dark:border-[#333] rounded-2xl p-4 shadow-lg"
        >
          <div className="space-y-3 min-w-[200px]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-foreground/70 dark:text-[#d4d4d4]">Backend Server</span>
              <div className="flex items-center gap-2">
                {apiStatus.connected ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-500" />
                )}
                <span className={`text-sm font-semibold ${apiStatus.connected ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                  {apiStatus.loading ? 'Checking...' : apiStatus.connected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-foreground/70 dark:text-[#d4d4d4]">MySQL Database</span>
              <span className={`text-sm font-semibold ${!apiStatus.connected ? 'text-foreground/60 dark:text-[#a3a3a3]' : apiStatus.mysqlConnected ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                {!apiStatus.connected ? 'Unknown' : apiStatus.mysqlConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Hero Section with Pinkish Gradient Overlay */}
        <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          {/* Background Gallery - Less opacity but still visible */}
          <div className="absolute inset-0 grid grid-cols-3 gap-1">
            {weddingPhotos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.5, scale: 1 }}
                transition={{ duration: 1, delay: index * 0.2 }}
                className="relative overflow-hidden"
              >
                <img 
                  src={photo} 
                  alt={`Wedding ${index + 1}`}
                  className="w-full h-full object-cover brightness-95 saturate-110"
                  loading="eager"
                />
              </motion.div>
            ))}
          </div>

          {/* Pinkish Gradient Overlay - Matches theme while highlighting photos */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-primary/5 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 text-center px-4 max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20 backdrop-blur-sm">
                Wedding Planning Made Simple
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight"
            >
              <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Wedding System
              </span>
              <br />
              <span className="text-foreground">Management</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
            >
              Your complete solution for planning the perfect wedding.{' '}
              <span className="text-primary font-medium">Manage guests</span>,{' '}
              <span className="text-primary font-medium">track budgets</span>, and{' '}
              <span className="text-primary font-medium">coordinate every detail</span> with ease.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex justify-center items-center gap-4"
            >
              <Link to="/dashboard/couples">
                <Button
                  className="group relative overflow-hidden rounded-full px-8 h-14 min-w-[180px] text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              <Link to="/dashboard/weddings">
                <Button
                  variant="outline"
                  className="group rounded-full px-8 h-14 min-w-[180px] text-base font-semibold border-2 border-primary/30 hover:border-primary/50 bg-background/50 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300 flex items-center justify-center"
                >
                  <span className="flex items-center gap-2 text-foreground">
                    View Weddings
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/30 to-background">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Everything You Need
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Manage all aspects of your wedding planning in one place
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover="hover"
                  className="h-full"
                >
                  <Card
                    className="h-full border-2 border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
                    onClick={() => navigate(feature.link)}
                  >
                    <CardHeader className="pb-6 pt-8 px-8">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300"
                      >
                        <feature.icon className="w-8 h-8 text-primary" />
                      </motion.div>
                      <CardTitle className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed text-foreground/70">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="flex items-center text-primary text-sm font-medium gap-2"
                      >
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-border/50 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="font-display text-xl font-semibold text-foreground/80">
                  Wedding Management System
                </span>
              </div>
              
              {/* Group Info - Horizontal Layout */}
              <div className="flex items-center justify-center gap-6 md:gap-8 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <div className="relative flex items-center">
                    <div className="flex -space-x-1">
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                        <UserRound className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                        <UserRoundCheck className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                        <UserRoundPlus className="w-3.5 h-3.5 text-primary" />
                      </div>
                    </div>
                  </div>
                  <span className="font-medium">Group #6 Best Group FR</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <Database className="w-5 h-5 text-primary" />
                  <span className="font-medium">CCINFOM</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <Hash className="w-5 h-5 text-primary" />
                  <span className="font-medium">S13</span>
                </div>
              </div>
              
              {/* Surnames */}
              <div className="pt-4 border-t border-border/30">
                <p className="text-sm text-foreground/60 font-medium">
                  MAAGMA • ONG • PAINGAN • PALOMO
                </p>
              </div>
            </motion.div>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
};

export default Home;
