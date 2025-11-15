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
  Users,
  Lock,
  ArrowUpDown,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { packagesAPI, menuItemsAPI } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const Packages = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'price' | 'usage'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [availableMenuItems, setAvailableMenuItems] = useState<any[]>([]);
  
  // Form states
  const [formData, setFormData] = useState({
    package_name: '',
    package_type: '',
    package_price: '',
    menu_item_ids: [] as number[]
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch available menu items for package creation
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await menuItemsAPI.getAll();
        if (response && response.success && response.data) {
          setAvailableMenuItems(response.data || []);
        } else if (response && response.data) {
          setAvailableMenuItems(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };
    fetchMenuItems();
  }, []);

  // Fetch packages from backend
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await packagesAPI.getAll();
        if (response && response.success && response.data) {
          // Transform data to match UI expectations
          const packagesData = response.data.map((pkg: any) => ({
            id: pkg.package_id,
            package_id: pkg.package_id,
            package_name: pkg.package_name,
            package_type: pkg.package_type,
            package_price: parseFloat(pkg.package_price) || 0,
            menu_items: pkg.menu_items || [],
            total_items: pkg.total_items || (pkg.menu_items ? pkg.menu_items.length : 0),
            usage_count: pkg.usage_count || 0,
            is_template: true // All packages are templates (shared across weddings)
          }));
          setPackages(packagesData);
        } else if (response && response.data) {
          const packagesData = response.data.map((pkg: any) => ({
            id: pkg.package_id,
            package_id: pkg.package_id,
            package_name: pkg.package_name,
            package_type: pkg.package_type,
            package_price: parseFloat(pkg.package_price) || 0,
            menu_items: pkg.menu_items || [],
            total_items: pkg.total_items || (pkg.menu_items ? pkg.menu_items.length : 0),
            usage_count: pkg.usage_count || 0,
            is_template: true
          }));
          setPackages(packagesData);
        } else {
          setPackages([]);
        }
      } catch (error: any) {
        console.error('Error fetching packages:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to fetch packages',
          variant: 'destructive'
        });
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [toast]);
  
  // Handle view package
  const handleViewPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setViewDialogOpen(true);
  };
  
  // Handle edit package
  const handleEditPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setFormData({
      package_name: pkg.package_name || '',
      package_type: pkg.package_type || '',
      package_price: (pkg.package_price || 0).toString(),
      menu_item_ids: (pkg.menu_items || []).map((item: any) => item.menu_item_id || item.id)
    });
    setEditDialogOpen(true);
  };
  
  // Handle delete package
  const handleDeletePackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setDeleteDialogOpen(true);
  };
  
  // Handle add package
  const handleAddPackage = () => {
    setFormData({
      package_name: '',
      package_type: '',
      package_price: '',
      menu_item_ids: []
    });
    setSelectedPackage(null);
    setAddDialogOpen(true);
  };
  
  // Save package
  const handleSavePackage = async () => {
    if (!formData.package_name || !formData.package_type || !formData.package_price) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    setFormLoading(true);
    try {
      const data = {
        package_name: formData.package_name,
        package_type: formData.package_type,
        package_price: parseFloat(formData.package_price),
        menu_item_ids: formData.menu_item_ids
      };
      
      if (selectedPackage) {
        await packagesAPI.update(selectedPackage.package_id || selectedPackage.id, data);
        toast({ title: 'Success', description: 'Package updated successfully' });
        setEditDialogOpen(false);
      } else {
        await packagesAPI.create(data);
        toast({ title: 'Success', description: 'Package created successfully' });
        setAddDialogOpen(false);
      }
      
      // Refresh packages
      const response = await packagesAPI.getAll();
      if (response && response.success && response.data) {
        const packagesData = response.data.map((pkg: any) => ({
          id: pkg.package_id,
          package_id: pkg.package_id,
          package_name: pkg.package_name,
          package_type: pkg.package_type,
          package_price: parseFloat(pkg.package_price) || 0,
          menu_items: pkg.menu_items || [],
          total_items: pkg.total_items || (pkg.menu_items ? pkg.menu_items.length : 0),
          usage_count: pkg.usage_count || 0,
          is_template: true
        }));
        setPackages(packagesData);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save package',
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  // Delete package
  const handleConfirmDelete = async () => {
    if (!selectedPackage) return;
    
    setFormLoading(true);
    try {
      await packagesAPI.delete(selectedPackage.package_id || selectedPackage.id);
      toast({ title: 'Success', description: 'Package deleted successfully' });
      setDeleteDialogOpen(false);
      
      // Refresh packages
      const response = await packagesAPI.getAll();
      if (response && response.success && response.data) {
        const packagesData = response.data.map((pkg: any) => ({
          id: pkg.package_id,
          package_id: pkg.package_id,
          package_name: pkg.package_name,
          package_type: pkg.package_type,
          package_price: parseFloat(pkg.package_price) || 0,
          menu_items: pkg.menu_items || [],
          total_items: pkg.total_items || (pkg.menu_items ? pkg.menu_items.length : 0),
          usage_count: pkg.usage_count || 0,
          is_template: true
        }));
        setPackages(packagesData);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete package',
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'Full Service': 'bg-blue-100 text-blue-800',
      'Basic': 'bg-green-100 text-green-800',
      'Premium': 'bg-purple-100 text-purple-800',
      'Specialty': 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  const templatePackages = packages.filter(pkg => pkg.is_template);
  const weddingPackages = packages.filter(pkg => !pkg.is_template);

  const currentPackages = activeTab === 'templates' ? templatePackages : weddingPackages;

  // Filter and sort packages based on current tab
  const filteredAndSortedPackages = currentPackages
    .filter(pkg => {
      const matchesSearch = pkg.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pkg.package_type?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || pkg.package_type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case 'name':
          aVal = a.package_name?.toLowerCase() || '';
          bVal = b.package_name?.toLowerCase() || '';
          break;
        case 'type':
          aVal = a.package_type?.toLowerCase() || '';
          bVal = b.package_type?.toLowerCase() || '';
          break;
        case 'price':
          aVal = a.package_price || 0;
          bVal = b.package_price || 0;
          break;
        case 'usage':
          aVal = a.usage_count || 0;
          bVal = b.usage_count || 0;
          break;
        default:
          return 0;
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });
  
  // Updated statistics - more relevant to packages
  const totalPackages = currentPackages.length;
  const averagePrice = currentPackages.length > 0 
    ? currentPackages.reduce((sum, pkg) => sum + (pkg.package_price || 0), 0) / currentPackages.length 
    : 0;
  const totalRevenue = currentPackages.reduce((sum, pkg) => sum + ((pkg.package_price || 0) * (pkg.usage_count || 0)), 0);
  const totalMenuItems = currentPackages.reduce((sum, pkg) => sum + (pkg.total_items || 0), 0);

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
          <Button onClick={handleAddPackage}>
            <Plus className="w-4 h-4 mr-2" />
            New Package
          </Button>
        </div>

        {/* Stats Cards - Updated to be more relevant */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPackages}</div>
              <p className="text-xs text-muted-foreground mt-1">Available packages</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(averagePrice)}</div>
              <p className="text-xs text-muted-foreground mt-1">Per package</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">From all usage</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMenuItems}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all packages</p>
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
                {/* Filter and Sort Section */}
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search packages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Full Service">Full Service</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Specialty">Specialty</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="usage">Usage</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={handleResetFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Reset
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                          <p className="text-sm text-muted-foreground mt-2">Loading packages...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredAndSortedPackages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-sm text-muted-foreground">No packages found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedPackages.map((pkg) => (
                        <TableRow key={pkg.id || pkg.package_id} className={pkg.is_template ? 'bg-muted/30' : ''}>
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
                              ${(pkg.package_price || 0).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Utensils className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{pkg.total_items || 0} items</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {pkg.menu_items && pkg.menu_items.length > 0
                                ? (pkg.menu_items.slice(0, 2).map((item: any) => item.menu_name || item.name).join(', ') +
                                   (pkg.menu_items.length > 2 ? ` +${pkg.menu_items.length - 2} more` : ''))
                                : 'No items'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{pkg.usage_count || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-green-600">
                              ${((pkg.package_price || 0) * (pkg.usage_count || 0)).toLocaleString()}
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="wedding-specific" className="space-y-4">
                {/* Filter and Sort Section */}
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search wedding packages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Full Service">Full Service</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Specialty">Specialty</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="usage">Usage</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={handleResetFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Reset
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                          <p className="text-sm text-muted-foreground mt-2">Loading packages...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredAndSortedPackages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-sm text-muted-foreground">No packages found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedPackages.map((pkg) => (
                        <TableRow key={pkg.id || pkg.package_id}>
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
                              ${(pkg.package_price || 0).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Utensils className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{pkg.total_items || 0} items</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{pkg.usage_count || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              N/A
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
                      ))
                    )}
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
