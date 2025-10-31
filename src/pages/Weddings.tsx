import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DashboardLayout from '@/components/DashboardLayout';

const Weddings = () => {
  const [weddings, setWeddings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with actual API calls
  useEffect(() => {
    setWeddings([
      {
        id: 1,
        couple: 'John & Jane Smith',
        partner1: 'John Smith',
        partner2: 'Jane Smith',
        weddingDate: '2024-02-14',
        weddingTime: '16:00',
        venue: 'Garden Manor',
        guestCount: 120,
        totalCost: 25000,
        productionCost: 18000,
        paymentStatus: 'paid',
        plannerContact: 'Sarah Johnson - (555) 123-4567'
      },
      {
        id: 2,
        couple: 'Mike & Sarah Johnson',
        partner1: 'Mike Johnson',
        partner2: 'Sarah Johnson',
        weddingDate: '2024-02-21',
        weddingTime: '17:30',
        venue: 'Riverside Hall',
        guestCount: 80,
        totalCost: 18000,
        productionCost: 12000,
        paymentStatus: 'pending',
        plannerContact: 'Emily Davis - (555) 987-6543'
      },
      {
        id: 3,
        couple: 'David & Lisa Brown',
        partner1: 'David Brown',
        partner2: 'Lisa Brown',
        weddingDate: '2024-03-01',
        weddingTime: '15:00',
        venue: 'Mountain View Resort',
        guestCount: 200,
        totalCost: 45000,
        productionCost: 32000,
        paymentStatus: 'partial',
        plannerContact: 'Michael Wilson - (555) 456-7890'
      }
    ]);
  }, []);

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Partial</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredWeddings = weddings.filter(wedding => {
    const matchesSearch = wedding.couple.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wedding.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || wedding.paymentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weddings</h1>
            <p className="text-muted-foreground">
              Manage all wedding events and bookings
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Wedding
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Weddings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weddings.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weddings.reduce((sum, wedding) => sum + wedding.guestCount, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${weddings.reduce((sum, wedding) => sum + wedding.totalCost, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weddings.filter(w => w.paymentStatus === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Wedding List</CardTitle>
            <CardDescription>
              View and manage all wedding bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search weddings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Couple</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWeddings.map((wedding) => (
                  <TableRow key={wedding.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{wedding.couple}</div>
                        <div className="text-sm text-muted-foreground">
                          {wedding.plannerContact}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{new Date(wedding.weddingDate).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {wedding.weddingTime}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {wedding.venue}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {wedding.guestCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">${wedding.totalCost.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Prod: ${wedding.productionCost.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(wedding.paymentStatus)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Weddings;
