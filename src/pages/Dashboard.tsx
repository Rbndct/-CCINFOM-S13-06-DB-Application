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
import DashboardLayout from '@/components/DashboardLayout';

const Dashboard = () => {
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

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API calls
    setStats({
      totalWeddings: 24,
      totalCouples: 24,
      totalGuests: 480,
      totalMenuItems: 45,
      totalPackages: 12,
      totalInventory: 156,
      upcomingWeddings: 8,
      pendingRSVPs: 23,
      totalRevenue: 125000,
      monthlyRevenue: 18500
    });

    setRecentWeddings([
      { id: 1, couple: 'John & Jane Smith', date: '2024-02-14', venue: 'Garden Manor', status: 'confirmed' },
      { id: 2, couple: 'Mike & Sarah Johnson', date: '2024-02-21', venue: 'Riverside Hall', status: 'pending' },
      { id: 3, couple: 'David & Lisa Brown', date: '2024-03-01', venue: 'Mountain View Resort', status: 'confirmed' },
    ]);

    setUpcomingEvents([
      { id: 1, couple: 'Alex & Emma Wilson', date: '2024-01-15', venue: 'Sunset Gardens', daysLeft: 3 },
      { id: 2, couple: 'Tom & Jessica Davis', date: '2024-01-22', venue: 'Grand Ballroom', daysLeft: 10 },
      { id: 3, couple: 'Chris & Maria Garcia', date: '2024-01-28', venue: 'Beach Resort', daysLeft: 16 },
    ]);
  }, []);

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
              <div className="space-y-4">
                {recentWeddings.map((wedding) => (
                  <div key={wedding.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {wedding.couple}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(wedding.date).toLocaleDateString()} • {wedding.venue}
                      </p>
                    </div>
                    {getStatusBadge(wedding.status)}
                  </div>
                ))}
              </div>
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
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {event.couple}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} • {event.venue}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {event.daysLeft} days
                    </Badge>
                  </div>
                ))}
              </div>
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
