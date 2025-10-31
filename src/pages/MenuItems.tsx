import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Utensils, 
  DollarSign,
  Package,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle
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

const MenuItems = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data - replace with actual API calls
  useEffect(() => {
    setMenuItems([
      {
        id: 1,
        menu_name: 'Grilled Salmon',
        menu_cost: 15.50,
        menu_price: 25.00,
        menu_type: 'Main Course',
        stock: 50,
        restriction_id: null,
        restriction_name: null,
        profit_margin: 9.50
      },
      {
        id: 2,
        menu_name: 'Vegetarian Pasta',
        menu_cost: 8.75,
        menu_price: 18.00,
        menu_type: 'Main Course',
        stock: 30,
        restriction_id: 1,
        restriction_name: 'Vegetarian',
        profit_margin: 9.25
      },
      {
        id: 3,
        menu_name: 'Caesar Salad',
        menu_cost: 4.25,
        menu_price: 12.00,
        menu_type: 'Appetizer',
        stock: 75,
        restriction_id: null,
        restriction_name: null,
        profit_margin: 7.75
      },
      {
        id: 4,
        menu_name: 'Chocolate Cake',
        menu_cost: 6.00,
        menu_price: 15.00,
        menu_type: 'Dessert',
        stock: 20,
        restriction_id: 2,
        restriction_name: 'Gluten-Free',
        profit_margin: 9.00
      },
      {
        id: 5,
        menu_name: 'Beef Tenderloin',
        menu_cost: 22.00,
        menu_price: 35.00,
        menu_type: 'Main Course',
        stock: 15,
        restriction_id: null,
        restriction_name: null,
        profit_margin: 13.00
      }
    ]);
  }, []);

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Out of Stock</Badge>;
    } else if (stock < 10) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'Appetizer': 'bg-blue-100 text-blue-800',
      'Main Course': 'bg-green-100 text-green-800',
      'Dessert': 'bg-purple-100 text-purple-800',
      'Beverage': 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.menu_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.menu_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.menu_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalValue = menuItems.reduce((sum, item) => sum + (item.stock * item.menu_price), 0);
  const lowStockItems = menuItems.filter(item => item.stock < 10).length;
  const outOfStockItems = menuItems.filter(item => item.stock === 0).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Menu Items</h1>
            <p className="text-muted-foreground">
              Manage menu items, pricing, and inventory
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Menu Item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{menuItems.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
            <CardDescription>
              View and manage all menu items and their details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
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
                  <TableHead>Item Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Profit Margin</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Restrictions</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Utensils className="h-4 w-4 text-primary" />
                        </div>
                        {item.menu_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(item.menu_type)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        ${item.menu_cost.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        ${item.menu_price.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-green-600">
                        ${item.profit_margin.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.stock}</span>
                        {getStockStatus(item.stock)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.restriction_name ? (
                        <Badge variant="outline" className="bg-orange-100 text-orange-800">
                          {item.restriction_name}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
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

export default MenuItems;
