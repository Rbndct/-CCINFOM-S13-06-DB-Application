import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Heart, 
  Utensils, 
  Package, 
  Warehouse, 
  TrendingUp, 
  DollarSign,
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { weddingsAPI, couplesAPI, guestsAPI, menuItemsAPI, packagesAPI } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useDateFormat } from '@/context/DateFormatContext';

const Dashboard = () => {
  const { formatDate } = useDateFormat();
  const [stats, setStats] = useState({
    totalWeddings: 0,
    totalCouples: 0,
    totalGuests: 0,
    totalMenuItems: 0,
    totalPackages: 0,
    totalInventory: 0,
    upcomingWeddings: 0,
    pendingRSVPs: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });

  const [recentWeddings, setRecentWeddings] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch statistics from backend
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [weddingsRes, couplesRes, guestsRes, menuItemsRes, packagesRes] = await Promise.all([
          weddingsAPI.getAll({}).catch(() => ({ success: false, data: [] })),
          couplesAPI.getAll({}).catch(() => ({ success: false, data: [] })),
          guestsAPI.getAll({}).catch(() => ({ success: false, data: [] })),
          menuItemsAPI.getAll({}).catch(() => ({ success: false, data: [] })),
          packagesAPI.getAll({}).catch(() => ({ success: false, data: [] }))
        ]);

        // Extract data from responses
        const weddings = ((weddingsRes as any)?.success && (weddingsRes as any)?.data) ? (weddingsRes as any).data : ((weddingsRes as any)?.data || []);
        const couples = ((couplesRes as any)?.success && (couplesRes as any)?.data) ? (couplesRes as any).data : ((couplesRes as any)?.data || []);
        const guests = ((guestsRes as any)?.success && (guestsRes as any)?.data) ? (guestsRes as any).data : ((guestsRes as any)?.data || []);
        const menuItems = ((menuItemsRes as any)?.success && (menuItemsRes as any)?.data) ? (menuItemsRes as any).data : ((menuItemsRes as any)?.data || []);
        const packages = ((packagesRes as any)?.success && (packagesRes as any)?.data) ? (packagesRes as any).data : ((packagesRes as any)?.data || []);

        // Calculate statistics
        const totalWeddings = Array.isArray(weddings) ? weddings.length : 0;
        const totalCouples = Array.isArray(couples) ? couples.length : 0;
        const totalGuests = Array.isArray(guests) ? guests.length : 0;
        const totalMenuItems = Array.isArray(menuItems) ? menuItems.length : 0;
        const totalPackages = Array.isArray(packages) ? packages.length : 0;

        // Calculate upcoming weddings (within next 30 days)
        const now = new Date();
        const thirtyDaysFromNow = new Date(now);
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const upcomingWeddings = Array.isArray(weddings) ? weddings.filter((w: any) => {
          const weddingDate = w.wedding_date || w.weddingDate;
          if (!weddingDate) return false;
          const date = new Date(weddingDate);
          return date >= now && date <= thirtyDaysFromNow;
        }).length : 0;

        // Calculate pending RSVPs
        const pendingRSVPs = Array.isArray(guests) ? guests.filter((g: any) => {
          const status = (g.rsvp_status || '').toLowerCase();
          return status === 'pending' || !status;
        }).length : 0;

        // Calculate total revenue from packages (package selling_price * usage_count per wedding)
        // This reflects actual revenue from package sales across all weddings
        const totalRevenue = Array.isArray(packages) ? packages.reduce((sum: number, pkg: any) => {
          const price = parseFloat(pkg.selling_price || pkg.package_price || 0);
          const usage = parseFloat(pkg.usage_count || 0); // usage_count now represents distinct weddings
          return sum + (isNaN(price) ? 0 : price) * (isNaN(usage) ? 0 : usage);
        }, 0) : 0;

        // Calculate monthly revenue (this month's weddings)
        // For monthly revenue, we still use wedding costs as packages are assigned per wedding
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthlyRevenue = Array.isArray(weddings) ? weddings.reduce((sum: number, w: any) => {
          const weddingDate = w.wedding_date || w.weddingDate;
          if (!weddingDate) return sum;
          const date = new Date(weddingDate);
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            const equipmentCost = parseFloat(w.equipment_rental_cost || w.equipmentRentalCost || 0);
            const foodCost = parseFloat(w.food_cost || w.foodCost || 0);
            return sum + (isNaN(equipmentCost) ? 0 : equipmentCost) + (isNaN(foodCost) ? 0 : foodCost);
          }
          return sum;
        }, 0) : 0;

        // Set statistics
        setStats({
          totalWeddings,
          totalCouples,
          totalGuests,
          totalMenuItems,
          totalPackages,
          totalInventory: 0, // TODO: Implement inventory API
          upcomingWeddings,
          pendingRSVPs,
          totalRevenue,
          monthlyRevenue
        });

        // Set recent weddings (last 5, sorted by date)
        const sortedWeddings = Array.isArray(weddings) ? [...weddings]
          .sort((a: any, b: any) => {
            const dateA = new Date(a.wedding_date || a.weddingDate || 0);
            const dateB = new Date(b.wedding_date || b.weddingDate || 0);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5)
          .map((w: any) => ({
            id: w.wedding_id || w.id,
            couple: w.couple_name || `${w.partner1 || ''} & ${w.partner2 || ''}`,
            date: w.wedding_date || w.weddingDate,
            venue: w.venue || 'N/A',
            status: w.payment_status || w.paymentStatus || 'pending'
          })) : [];

        setRecentWeddings(sortedWeddings);

        // Set upcoming events (next 30 days)
        const upcoming = Array.isArray(weddings) ? weddings
          .filter((w: any) => {
            const weddingDate = w.wedding_date || w.weddingDate;
            if (!weddingDate) return false;
            const date = new Date(weddingDate);
            return date >= now && date <= thirtyDaysFromNow;
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.wedding_date || a.weddingDate || 0);
            const dateB = new Date(b.wedding_date || b.weddingDate || 0);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5)
          .map((w: any) => {
            const weddingDate = new Date(w.wedding_date || w.weddingDate);
            const daysLeft = Math.ceil((weddingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return {
              id: w.wedding_id || w.id,
              couple: w.couple_name || `${w.partner1 || ''} & ${w.partner2 || ''}`,
              date: w.wedding_date || w.weddingDate,
              venue: w.venue || 'N/A',
              daysLeft
            };
          }) : [];

        setUpcomingEvents(upcoming);

      } catch (error: any) {
        console.error('Error fetching statistics:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch dashboard statistics',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [toast]);

  const statCards = [
    {
      title: 'Total Weddings',
      value: stats.totalWeddings,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Couples',
      value: stats.totalCouples,
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Guests',
      value: stats.totalGuests,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Menu Items',
      value: stats.totalMenuItems,
      icon: Utensils,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Packages',
      value: stats.totalPackages,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+3%',
      changeType: 'positive'
    },
    {
      title: 'Inventory Items',
      value: stats.totalInventory,
      icon: Warehouse,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      change: '+7%',
      changeType: 'positive'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your wedding management system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Reports
            </Button>
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              New Wedding
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>{' '}
                    from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Revenue Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Weddings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Weddings</CardTitle>
              <CardDescription>
                Latest wedding bookings and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentWeddings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent weddings</p>
              ) : (
                <div className="space-y-4">
                  {recentWeddings.map((wedding) => (
                    <div key={wedding.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {wedding.couple}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {wedding.date ? formatDate(new Date(wedding.date)) : 'N/A'} • {wedding.venue}
                        </p>
                      </div>
                      {getStatusBadge(wedding.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Weddings happening in the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No upcoming events</p>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {event.couple}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event.date ? formatDate(new Date(event.date)) : 'N/A'} • {event.venue}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {event.daysLeft} days
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Calendar className="h-6 w-6" />
                <span>New Wedding</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Add Guests</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Utensils className="h-6 w-6" />
                <span>Menu Planning</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Package className="h-6 w-6" />
                <span>Create Package</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
