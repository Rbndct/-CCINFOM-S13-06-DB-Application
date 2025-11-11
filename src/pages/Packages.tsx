import { useState } from 'react';
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
  Users,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [activeTab, setActiveTab] = useState('templates');
  const [packages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

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
    const matchesTab = activeTab === 'templates' ? pkg.is_template : !pkg.is_template;
    const matchesSearch = pkg.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.package_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || pkg.package_type === filterType;
    return matchesTab && matchesSearch && matchesFilter;
  });

  const templatePackages = packages.filter(pkg => pkg.is_template);
  const weddingPackages = packages.filter(pkg => !pkg.is_template);

  const currentPackages = activeTab === 'templates' ? templatePackages : weddingPackages;
  const totalRevenue = currentPackages.reduce((sum, pkg) => sum + (pkg.package_price * pkg.usage_count), 0);
  const averagePrice = currentPackages.length > 0 
    ? currentPackages.reduce((sum, pkg) => sum + pkg.package_price, 0) / currentPackages.length 
    : 0;

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
              <div className="text-2xl font-bold">{currentPackages.length}</div>
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
                {currentPackages.reduce((sum, pkg) => sum + pkg.usage_count, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Packages List with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Wedding Packages</CardTitle>
            <CardDescription>
              {activeTab === 'templates' 
                ? 'Template library - Default packages available to all weddings'
                : 'Wedding-specific packages'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="templates" className="gap-2">
                  <Package className="w-4 h-4" />
                  Templates ({templatePackages.length})
                </TabsTrigger>
                <TabsTrigger value="wedding-specific" className="gap-2">
                  <Utensils className="w-4 h-4" />
                  Wedding-Specific ({weddingPackages.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
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
                      <TableRow key={pkg.id} className={pkg.is_template ? 'bg-muted/30' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Package className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex items-center gap-2">
                              {pkg.package_name}
                              {pkg.is_template && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Template
                                </Badge>
                              )}
                            </div>
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
                              {!pkg.is_template && (
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {pkg.is_template && (
                                <DropdownMenuItem disabled className="text-muted-foreground">
                                  <Lock className="mr-2 h-4 w-4" />
                                  Template (Cannot Delete)
                                </DropdownMenuItem>
                              )}
                              {!pkg.is_template && (
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="wedding-specific" className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search wedding packages..."
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
                      <TableHead>Wedding</TableHead>
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
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{pkg.usage_count}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {pkg.wedding_name || 'N/A'}
                          </span>
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Packages;
