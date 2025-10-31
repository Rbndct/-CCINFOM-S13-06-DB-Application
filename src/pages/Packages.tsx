import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  DollarSign,
  Utensils,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Users
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

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data - replace with actual API calls
  useEffect(() => {
    setPackages([
      {
        id: 1,
        package_name: 'Premium Wedding Package',
        package_type: 'Full Service',
        package_price: 5000.00,
        menu_items: [
          { name: 'Grilled Salmon', quantity: 1 },
          { name: 'Caesar Salad', quantity: 1 },
          { name: 'Chocolate Cake', quantity: 1 },
          { name: 'Wine Selection', quantity: 2 }
        ],
        total_items: 4,
        usage_count: 12
      },
      {
        id: 2,
        package_name: 'Budget Package',
        package_type: 'Basic',
        package_price: 2500.00,
        menu_items: [
          { name: 'Vegetarian Pasta', quantity: 1 },
          { name: 'Garden Salad', quantity: 1 },
          { name: 'Vanilla Ice Cream', quantity: 1 }
        ],
        total_items: 3,
        usage_count: 8
      },
      {
        id: 3,
        package_name: 'Luxury Package',
        package_type: 'Premium',
        package_price: 8000.00,
        menu_items: [
          { name: 'Beef Tenderloin', quantity: 1 },
          { name: 'Lobster Bisque', quantity: 1 },
          { name: 'Truffle Risotto', quantity: 1 },
          { name: 'Chocolate Soufflé', quantity: 1 },
          { name: 'Premium Wine', quantity: 3 }
        ],
        total_items: 5,
        usage_count: 5
      },
      {
        id: 4,
        package_name: 'Vegetarian Package',
        package_type: 'Specialty',
        package_price: 3200.00,
        menu_items: [
          { name: 'Vegetarian Pasta', quantity: 1 },
          { name: 'Quinoa Salad', quantity: 1 },
          { name: 'Fruit Tart', quantity: 1 }
        ],
        total_items: 3,
        usage_count: 6
      }
    ]);
  }, []);

  const getTypeBadge = (type: string) => {
    const colors = {
      'Full Service': 'bg-blue-100 text-blue-800',
      'Basic': 'bg-green-100 text-green-800',
      'Premium': 'bg-purple-100 text-purple-800',
      'Specialty': 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.package_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || pkg.package_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = packages.reduce((sum, pkg) => sum + (pkg.package_price * pkg.usage_count), 0);
  const averagePrice = packages.reduce((sum, pkg) => sum + pkg.package_price, 0) / packages.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Packages</h1>
            <p className="text-muted-foreground">
              Manage wedding packages and pricing
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Package
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{packages.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averagePrice.toFixed(0)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {packages.reduce((sum, pkg) => sum + pkg.usage_count, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Packages List */}
        <Card>
          <CardHeader>
            <CardTitle>Wedding Packages</CardTitle>
            <CardDescription>
              View and manage all wedding packages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search packages..."
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
                  <TableHead>Package Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Menu Items</TableHead>
                  <TableHead>Usage Count</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        {pkg.package_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(pkg.package_type)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        ${pkg.package_price.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{pkg.total_items} items</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {pkg.menu_items.slice(0, 2).map(item => item.name).join(', ')}
                        {pkg.menu_items.length > 2 && ` +${pkg.menu_items.length - 2} more`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{pkg.usage_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-green-600">
                        ${(pkg.package_price * pkg.usage_count).toLocaleString()}
                      </div>
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

export default Packages;
