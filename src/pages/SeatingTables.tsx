import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Users,
  Package,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar
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
import DashboardLayout from '@/components/layout/DashboardLayout';

const SeatingTables = () => {
  const [tables, setTables] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWedding, setFilterWedding] = useState('all');

  // Mock data - replace with actual API calls
  useEffect(() => {
    setTables([
      {
        id: 1,
        table_number: 'T-001',
        table_category: 'VIP',
        capacity: 8,
        wedding_id: 1,
        wedding_couple: 'John & Jane Smith',
        wedding_date: '2024-02-14',
        package_name: 'Premium Package',
        assigned_guests: 6,
        available_seats: 2
      },
      {
        id: 2,
        table_number: 'T-002',
        table_category: 'Family',
        capacity: 10,
        wedding_id: 1,
        wedding_couple: 'John & Jane Smith',
        wedding_date: '2024-02-14',
        package_name: 'Premium Package',
        assigned_guests: 10,
        available_seats: 0
      },
      {
        id: 3,
        table_number: 'T-003',
        table_category: 'Friends',
        capacity: 8,
        wedding_id: 1,
        wedding_couple: 'John & Jane Smith',
        wedding_date: '2024-02-14',
        package_name: 'Premium Package',
        assigned_guests: 7,
        available_seats: 1
      },
      {
        id: 4,
        table_number: 'T-004',
        table_category: 'VIP',
        capacity: 6,
        wedding_id: 2,
        wedding_couple: 'Mike & Sarah Johnson',
        wedding_date: '2024-02-21',
        package_name: 'Budget Package',
        assigned_guests: 4,
        available_seats: 2
      },
      {
        id: 5,
        table_number: 'T-005',
        table_category: 'Family',
        capacity: 8,
        wedding_id: 2,
        wedding_couple: 'Mike & Sarah Johnson',
        wedding_date: '2024-02-21',
        package_name: 'Budget Package',
        assigned_guests: 8,
        available_seats: 0
      }
    ]);
  }, []);

  const getCategoryBadge = (category: string) => {
    const colors = {
      'VIP': 'bg-purple-100 text-purple-800',
      'Family': 'bg-blue-100 text-blue-800',
      'Friends': 'bg-green-100 text-green-800',
      'Colleagues': 'bg-orange-100 text-orange-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>{category}</Badge>;
  };

  const getOccupancyStatus = (assigned: number, capacity: number) => {
    const percentage = (assigned / capacity) * 100;
    if (percentage === 100) {
      return <Badge className="bg-red-100 text-red-800">Full</Badge>;
    } else if (percentage >= 80) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Almost Full</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Available</Badge>;
    }
  };

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.table_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.wedding_couple.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.table_category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterWedding === 'all' || table.wedding_id.toString() === filterWedding;
    return matchesSearch && matchesFilter;
  });

  const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);
  const totalAssigned = tables.reduce((sum, table) => sum + table.assigned_guests, 0);
  const totalAvailable = totalCapacity - totalAssigned;
  const weddings = [...new Set(tables.map(table => ({ id: table.wedding_id, couple: table.wedding_couple })))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seating Tables</h1>
            <p className="text-muted-foreground">
              Manage table assignments and seating arrangements
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Table
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tables.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCapacity}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Guests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssigned}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Seats</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalAvailable}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tables List */}
        <Card>
          <CardHeader>
            <CardTitle>Table Assignments</CardTitle>
            <CardDescription>
              View and manage all table assignments and seating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tables..."
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
                  <TableHead>Table Number</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Wedding</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTables.map((table) => (
                  <TableRow key={table.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        {table.table_number}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(table.table_category)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{table.wedding_couple}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(table.wedding_date).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{table.package_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {table.capacity} seats
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {table.assigned_guests} / {table.capacity}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {table.available_seats} available
                      </div>
                    </TableCell>
                    <TableCell>
                      {getOccupancyStatus(table.assigned_guests, table.capacity)}
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

export default SeatingTables;
