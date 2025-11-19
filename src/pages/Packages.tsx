import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  DollarSign,
  Utensils,
  UtensilsCrossed,
  Heart,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  ArrowUpDown,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { useCurrencyFormat } from '@/utils/currency';
import { getTypeIcon, getTypeColor } from '@/utils/restrictionUtils';
import { PackageTypeBadge, getPackageTypeIcon } from '@/utils/packageTypeUtils';

const Packages = () => {
  const { formatCurrency } = useCurrencyFormat();
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'price' | 'usage'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showFilters, setShowFilters] = useState(false);
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
    selling_price: '',
    package_price: '', // Keep for backward compatibility
    menu_item_quantities: {} as Record<number, number> // menu_item_id -> quantity
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch available menu items for package creation
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await menuItemsAPI.getAll({});
        if (response && response.data) {
          const data = response.data.success ? response.data.data : response.data;
          setAvailableMenuItems(Array.isArray(data) ? data : []);
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
        const response = await packagesAPI.getAll({});
        if (response && response.data) {
          // Handle both wrapped and direct response formats
          const data = response.data.success ? response.data.data : response.data;
          const packagesArray = Array.isArray(data) ? data : [];
          
          // Transform data to match UI expectations
          const packagesData = packagesArray.map((pkg: any) => ({
            id: pkg.package_id,
            package_id: pkg.package_id,
            package_name: pkg.package_name,
            package_type: pkg.package_type,
            selling_price: parseFloat(pkg.selling_price || pkg.package_price) || 0,
            package_price: parseFloat(pkg.package_price) || 0,
            menu_items: (pkg.menu_items || []).map((item: any) => ({
              ...item,
              unit_cost: parseFloat(item.unit_cost || item.menu_cost || 0),
              selling_price: parseFloat(item.selling_price || item.menu_price || 0),
              menu_cost: parseFloat(item.unit_cost || item.menu_cost || 0),
              menu_price: parseFloat(item.selling_price || item.menu_price || 0)
            })),
            total_items: pkg.total_items || (pkg.menu_items ? pkg.menu_items.length : 0),
            usage_count: pkg.usage_count || 0,
            is_template: true // All packages are templates (shared across weddings)
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
  
  // Handle view package - fetch full details including menu items with cost/price
  const handleViewPackage = async (pkg: any) => {
    try {
      // Fetch full package details from API to get menu items with cost/price
      const response = await packagesAPI.getById(pkg.package_id || pkg.id);
      let packageData = null;
      
      if (response && response.success && response.data) {
        packageData = response.data;
      } else if (response && response.data) {
        packageData = response.data;
      } else {
        packageData = pkg;
      }
      
      // Ensure package has unit_cost and menu items have both old and new field names
      if (packageData) {
        packageData.unit_cost = parseFloat(packageData.unit_cost || 0);
        packageData.selling_price = parseFloat(packageData.selling_price || packageData.package_price || 0);
        
        if (packageData.menu_items) {
          packageData.menu_items = packageData.menu_items.map((item: any) => ({
            ...item,
            unit_cost: parseFloat(item.unit_cost || item.menu_cost || 0),
            selling_price: parseFloat(item.selling_price || item.menu_price || 0),
            menu_cost: parseFloat(item.unit_cost || item.menu_cost || 0),
            menu_price: parseFloat(item.selling_price || item.menu_price || 0)
          }));
        }
      }
      
      setSelectedPackage(packageData);
      setViewDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching package details:', error);
      // Fallback to using the package data we already have
      if (pkg && pkg.menu_items) {
        pkg.menu_items = pkg.menu_items.map((item: any) => ({
          ...item,
          unit_cost: parseFloat(item.unit_cost || item.menu_cost || 0),
          selling_price: parseFloat(item.selling_price || item.menu_price || 0),
          menu_cost: parseFloat(item.unit_cost || item.menu_cost || 0),
          menu_price: parseFloat(item.selling_price || item.menu_price || 0)
        }));
      }
      setSelectedPackage(pkg);
      setViewDialogOpen(true);
    }
  };
  
  // Handle edit package
  const handleEditPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    // Build quantities map from menu items
    const quantities: Record<number, number> = {};
    if (pkg.menu_items && Array.isArray(pkg.menu_items)) {
      pkg.menu_items.forEach((item: any) => {
        const itemId = item.menu_item_id || item.id;
        quantities[itemId] = item.quantity || 1;
      });
    }
    setFormData({
      package_name: pkg.package_name || '',
      package_type: pkg.package_type || '',
      selling_price: (pkg.selling_price || pkg.package_price || 0).toString(),
      package_price: (pkg.package_price || 0).toString(),
      menu_item_quantities: quantities
    });
    setEditDialogOpen(true);
  };
  
  // Handle delete package
  const handleDeletePackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setDeleteDialogOpen(true);
  };
  
  // Calculate suggested package price based on menu item costs + serving markup
  const calculateSuggestedPrice = (quantities: Record<number, number> | undefined): number => {
    if (!quantities || Object.keys(quantities).length === 0) return 0;
    
    // Sum of menu item costs with quantities
    const totalCost = Object.entries(quantities).reduce((sum: number, [itemIdStr, quantity]) => {
      const itemId = parseInt(itemIdStr);
      const item = availableMenuItems.find((item: any) => (item.menu_item_id || item.id) === itemId);
      if (!item) return sum;
      const cost = parseFloat(item.unit_cost || item.menu_cost) || 0;
      return sum + (cost * (quantity as number));
    }, 0);
    
    // Add serving cost markup (40% markup for serving, labor, overhead)
    // This accounts for preparation, serving, and overhead costs
    const servingMarkup = 0.40; // 40% markup
    const suggestedPrice = totalCost * (1 + servingMarkup);
    
    return Math.round(suggestedPrice * 100) / 100; // Round to 2 decimal places
  };
  
  // Handle add package
  const handleAddPackage = () => {
    setFormData({
      package_name: '',
      package_type: '',
      selling_price: '',
      package_price: '', // Keep for backward compatibility
      menu_item_quantities: {}
    });
    setSelectedPackage(null);
    setAddDialogOpen(true);
  };
  
  // Save package
  const handleSavePackage = async () => {
    if (!formData.package_name || !formData.package_type || (!formData.selling_price && !formData.package_price)) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    // Check if at least one menu item with quantity > 0 is selected
    const quantities = formData.menu_item_quantities || {};
    const hasMenuItems = Object.values(quantities).some(qty => qty > 0);
    if (!hasMenuItems) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one menu item',
        variant: 'destructive'
      });
      return;
    }
    
    setFormLoading(true);
    try {
      const price = parseFloat(formData.selling_price || formData.package_price);
      // Convert quantities object to array format expected by backend
      const menu_item_ids = Object.entries(quantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([itemId, quantity]) => ({
          menu_item_id: parseInt(itemId),
          quantity: quantity
        }));
      
      const data = {
        package_name: formData.package_name,
        package_type: formData.package_type,
        selling_price: price,
        package_price: price, // Keep for backward compatibility
        menu_item_ids: menu_item_ids
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
      
      // Reset form
      setFormData({
        package_name: '',
        package_type: '',
        selling_price: '',
        package_price: '',
        menu_item_quantities: {}
      });
      setSelectedPackage(null);
      
      // Refresh packages
      const response = await packagesAPI.getAll({});
      if (response && response.data) {
        const data = response.data.success ? response.data.data : response.data;
        const packagesArray = Array.isArray(data) ? data : [];
        const packagesData = packagesArray.map((pkg: any) => ({
          id: pkg.package_id,
          package_id: pkg.package_id,
          package_name: pkg.package_name,
          package_type: pkg.package_type,
          unit_cost: parseFloat(pkg.unit_cost || 0),
          selling_price: parseFloat(pkg.selling_price || pkg.package_price) || 0,
          package_price: parseFloat(pkg.package_price) || 0,
          menu_items: (pkg.menu_items || []).map((item: any) => ({
            ...item,
            unit_cost: parseFloat(item.unit_cost || item.menu_cost || 0),
            selling_price: parseFloat(item.selling_price || item.menu_price || 0),
            menu_cost: parseFloat(item.unit_cost || item.menu_cost || 0),
            menu_price: parseFloat(item.selling_price || item.menu_price || 0)
          })),
          total_items: pkg.total_items || (pkg.menu_items ? pkg.menu_items.length : 0),
          usage_count: pkg.usage_count || 0,
          is_template: true
        }));
        setPackages(packagesData);
      }
      // Reset form
      setFormData({
        package_name: '',
        package_type: '',
        selling_price: '',
        package_price: '',
        menu_item_ids: []
      });
      setSelectedPackage(null);
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
      const response = await packagesAPI.getAll({});
      if (response && response.data) {
        const data = response.data.success ? response.data.data : response.data;
        const packagesArray = Array.isArray(data) ? data : [];
        const packagesData = packagesArray.map((pkg: any) => ({
          id: pkg.package_id,
          package_id: pkg.package_id,
          package_name: pkg.package_name,
          package_type: pkg.package_type,
          package_price: parseFloat(pkg.package_price) || 0,
          menu_items: (pkg.menu_items || []).map((item: any) => ({
            ...item,
            unit_cost: parseFloat(item.unit_cost || item.menu_cost || 0),
            selling_price: parseFloat(item.selling_price || item.menu_price || 0),
            menu_cost: parseFloat(item.unit_cost || item.menu_cost || 0),
            menu_price: parseFloat(item.selling_price || item.menu_price || 0)
          })),
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
    setSortBy('id');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getTypeBadge = (type: string) => {
    return <PackageTypeBadge type={type} />;
  };

  const currentPackages = packages;

  // Filter and sort packages (only for current tab)
  const filteredAndSortedPackages = useMemo(() => {
    return currentPackages
      .filter(pkg => {
        const matchesSearch = pkg.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             pkg.package_type?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || pkg.package_type === filterType;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case 'id':
          aVal = a.package_id || a.id || 0;
          bVal = b.package_id || b.id || 0;
          break;
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
  }, [currentPackages, searchTerm, filterType, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPackages = filteredAndSortedPackages.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, sortBy, sortOrder]);
  
  // Updated statistics - more relevant to packages
  const totalPackages = currentPackages.length;
  const averagePrice = currentPackages.length > 0 
    ? currentPackages.reduce((sum, pkg) => sum + (pkg.selling_price || pkg.package_price || 0), 0) / currentPackages.length 
    : 0;
  const totalRevenue = currentPackages.reduce((sum, pkg) => sum + ((pkg.selling_price || pkg.package_price || 0) * (pkg.usage_count || 0)), 0);
  const totalMenuItems = currentPackages.reduce((sum, pkg) => sum + (pkg.total_items || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Packages Overview</h1>
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

        {/* Packages List */}
        <Card>
          <CardHeader>
            <CardTitle>Packages Directory</CardTitle>
            <CardDescription>
              Template library - Default packages available to all weddings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                  <Button variant="outline" onClick={() => setShowFilters(s => !s)}>
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <Button variant="outline" onClick={handleResetFilters}>
                    Reset Filters
                  </Button>
                </div>
                
                {showFilters && (
                  <div className="grid md:grid-cols-4 gap-3 mb-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Type</label>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {['Full Service', 'Basic', 'Premium', 'Specialty'].map((type) => {
                            const Icon = getPackageTypeIcon(type);
                            return (
                              <SelectItem key={type} value={type}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{type}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Sort By</label>
                      <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                        <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="id">ID</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="type">Type</SelectItem>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="usage">Usage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Order</label>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Package ID</TableHead>
                      <TableHead>Package Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Selling Price</TableHead>
                      <TableHead className="text-right">Profit Margin</TableHead>
                      <TableHead>Menu Items</TableHead>
                      <TableHead>Used in Weddings</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                          <p className="text-sm text-muted-foreground mt-2">Loading packages...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredAndSortedPackages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <p className="text-sm text-muted-foreground">No packages found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPackages.map((pkg) => (
                        <TableRow 
                          key={pkg.id || pkg.package_id} 
                          className={pkg.is_template ? 'bg-muted/30' : ''}
                          onClick={() => handleViewPackage(pkg)}
                          style={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              #{pkg.package_id || pkg.id}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            <span className="truncate">{pkg.package_name}</span>
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(pkg.package_type)}
                          </TableCell>
                          <TableCell className="text-right">
                            {(() => {
                              // Calculate package cost: sum of (menu item unit_cost × quantity) for all menu items in package
                              let packageCost = 0;
                              if (pkg.menu_items && Array.isArray(pkg.menu_items)) {
                                packageCost = pkg.menu_items.reduce((sum: number, item: any) => {
                                  const unitCost = parseFloat(item.unit_cost || item.menu_cost || 0);
                                  const quantity = parseFloat(item.quantity || 1);
                                  return sum + (unitCost * quantity);
                                }, 0);
                              }
                              // Fallback to unit_cost if available
                              if (packageCost === 0 && pkg.unit_cost) {
                                packageCost = parseFloat(pkg.unit_cost) || 0;
                              }
                              return (
                                <div className="text-sm font-medium">
                                  {formatCurrency(packageCost)}
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm font-medium">
                              {formatCurrency(pkg.selling_price || pkg.package_price || 0)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {(() => {
                              // Calculate profit margin: selling_price - cost
                              let packageCost = 0;
                              if (pkg.menu_items && Array.isArray(pkg.menu_items)) {
                                packageCost = pkg.menu_items.reduce((sum: number, item: any) => {
                                  const unitCost = parseFloat(item.unit_cost || item.menu_cost || 0);
                                  const quantity = parseFloat(item.quantity || 1);
                                  return sum + (unitCost * quantity);
                                }, 0);
                              }
                              if (packageCost === 0 && pkg.unit_cost) {
                                packageCost = parseFloat(pkg.unit_cost) || 0;
                              }
                              const sellingPrice = parseFloat(pkg.selling_price || pkg.package_price || 0);
                              const profitMargin = sellingPrice - packageCost;
                              return (
                                <div className="text-sm font-medium text-green-600">
                                  {formatCurrency(profitMargin)}
                                </div>
                              );
                            })()}
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
                              <Users className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                              <span className="text-sm font-medium">{pkg.usage_count || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-green-600">
                              {formatCurrency((pkg.selling_price || pkg.package_price || 0) * (pkg.usage_count || 0))}
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewPackage(pkg)}>
                                  <Eye className="mr-2 h-4 w-4 dark:text-muted-foreground" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={() => handleDeletePackage(pkg)}>
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
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedPackages.length)} of {filteredAndSortedPackages.length} packages
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Package Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {selectedPackage?.package_name}
              <Badge variant="outline" className="ml-2 font-mono">ID: #{selectedPackage?.package_id || selectedPackage?.id}</Badge>
            </DialogTitle>
            <DialogDescription>
              Package details including menu items, dietary restrictions, and pricing information
            </DialogDescription>
          </DialogHeader>
          {selectedPackage && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Package Type</Label>
                  <div className="mt-1">{getTypeBadge(selectedPackage.package_type)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                  <div className="mt-1 text-lg font-semibold">{formatCurrency(selectedPackage.selling_price || selectedPackage.package_price || 0)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Used in Weddings</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                    <span className="text-lg font-semibold">{selectedPackage.usage_count || 0}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Revenue</Label>
                  <div className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency((selectedPackage.selling_price || selectedPackage.package_price || 0) * (selectedPackage.usage_count || 0))}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Utensils className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Menu Items ({selectedPackage.menu_items?.length || selectedPackage.total_items || 0})</h3>
                </div>
                {selectedPackage.menu_items && selectedPackage.menu_items.length > 0 ? (
                  <div className="space-y-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPackage.menu_items.map((item: any) => {
                          const itemId = item.menu_item_id || item.id;
                          const menuType = item.menu_type || 'N/A';
                          const quantity = item.quantity || 1;
                          const typeLower = menuType.toLowerCase();
                          let icon, colorClass;
                          if (typeLower.includes('appetizer') || typeLower.includes('starter')) {
                            icon = Utensils;
                            colorClass = 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
                          } else if (typeLower.includes('main') || typeLower.includes('entree')) {
                            icon = UtensilsCrossed;
                            colorClass = 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
                          } else if (typeLower.includes('dessert')) {
                            icon = Heart;
                            colorClass = 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700';
                          } else if (typeLower.includes('drink') || typeLower.includes('beverage')) {
                            icon = Package;
                            colorClass = 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
                          } else {
                            icon = Utensils;
                            colorClass = 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
                          }
                          const IconComponent = icon;
                          return (
                            <TableRow key={itemId}>
                              <TableCell className="font-medium text-xs text-muted-foreground">#{itemId}</TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                                  {item.menu_name || item.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`text-xs ${colorClass} border flex items-center gap-1`}>
                                  <IconComponent className="h-3 w-3" />
                                  {menuType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-medium">
                                  {quantity}x
                                </Badge>
                              </TableCell>
                              <TableCell>{formatCurrency(item.unit_cost || item.menu_cost || 0)}</TableCell>
                              <TableCell>{formatCurrency(item.selling_price || item.menu_price || 0)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No menu items in this package.</p>
                )}
              </div>

              {/* Dietary Restrictions */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Dietary Restrictions</h3>
                </div>
                {(() => {
                  // Collect all unique restrictions from menu items
                  const allRestrictions = new Set<string>();
                  const restrictionDetails: any[] = [];
                  
                  if (selectedPackage.menu_items && Array.isArray(selectedPackage.menu_items)) {
                    selectedPackage.menu_items.forEach((item: any) => {
                      if (item.restriction_name && item.restriction_name !== 'None') {
                        if (!allRestrictions.has(item.restriction_name)) {
                          allRestrictions.add(item.restriction_name);
                          restrictionDetails.push({
                            restriction_name: item.restriction_name,
                            restriction_type: item.restriction_type || 'Dietary'
                          });
                        }
                      }
                    });
                  }
                  
                  if (restrictionDetails.length > 0) {
                    return (
                      <div className="flex flex-wrap gap-2">
                        {restrictionDetails.map((r, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className={`text-xs ${getTypeColor(r.restriction_type || 'Dietary')} border flex items-center gap-1`}
                          >
                            {(() => {
                              const Icon = getTypeIcon(r.restriction_type || 'Dietary');
                              return <Icon className="h-3 w-3" />;
                            })()}
                            {r.restriction_name}
                          </Badge>
                        ))}
                      </div>
                    );
                  }
                  return <p className="text-sm text-muted-foreground">No dietary restrictions for this package.</p>;
                })()}
              </div>

              {/* Assigned To Tables */}
              {selectedPackage.assigned_tables && selectedPackage.assigned_tables.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Assigned To Tables ({selectedPackage.assigned_tables.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {selectedPackage.assigned_tables.map((table: any) => (
                      <div key={table.table_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="font-medium">Table {table.table_number}</div>
                          <Badge variant="outline" className="text-xs">
                            {table.table_category || 'Guest'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {table.guest_count || 0}/{table.capacity} guests
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost Summary */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Cost Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Package Price:</span>
                    <span className="font-semibold">{formatCurrency(selectedPackage.selling_price || selectedPackage.package_price || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Menu Items Cost:</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        selectedPackage.unit_cost || selectedPackage.menu_items?.reduce((sum: number, item: any) => {
                          const itemCost = item.unit_cost || item.menu_cost || 0;
                          const quantity = item.quantity || 1;
                          return sum + (itemCost * quantity);
                        }, 0) || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Estimated Profit Margin:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(
                        (selectedPackage.selling_price || selectedPackage.package_price || 0) - 
                        (selectedPackage.unit_cost || selectedPackage.menu_items?.reduce((sum: number, item: any) => {
                          const itemCost = item.unit_cost || item.menu_cost || 0;
                          const quantity = item.quantity || 1;
                          return sum + (itemCost * quantity);
                        }, 0) || 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button onClick={async () => {
              setViewDialogOpen(false);
              if (selectedPackage) {
                // Ensure we have the full package data for editing
                try {
                  const response = await packagesAPI.getById(selectedPackage.package_id || selectedPackage.id);
                  if (response && (response.success || response.data)) {
                    const pkgData = response.data || response;
                    handleEditPackage(pkgData);
                  } else {
                    handleEditPackage(selectedPackage);
                  }
                } catch (error) {
                  console.error('Error fetching package for edit:', error);
                  handleEditPackage(selectedPackage);
                }
              }
            }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Package Dialog */}
      <Dialog open={addDialogOpen || editDialogOpen} onOpenChange={(open) => {
        setAddDialogOpen(open);
        setEditDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPackage ? 'Edit Package' : 'Add New Package'}</DialogTitle>
            <DialogDescription>
              {selectedPackage ? 'Update package information' : 'Create a new package for the library'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="package_name">Package Name *</Label>
              <Input
                id="package_name"
                value={formData.package_name}
                onChange={(e) => setFormData({...formData, package_name: e.target.value})}
                placeholder="e.g., Premium Wedding Package"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="package_type">Package Type *</Label>
              <Select value={formData.package_type} onValueChange={(val) => setFormData({...formData, package_type: val})}>
                <SelectTrigger id="package_type">
                  <SelectValue placeholder="Select package type" />
                </SelectTrigger>
                <SelectContent>
                  {['Full Service', 'Basic', 'Premium', 'Specialty'].map((type) => {
                    const Icon = getPackageTypeIcon(type);
                    return (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{type}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="selling_price">Selling Price (PHP) *</Label>
              <Input
                id="selling_price"
                type="number"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData({...formData, selling_price: e.target.value})}
                placeholder="0.00"
              />
              {formData.menu_item_quantities && Object.keys(formData.menu_item_quantities).length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Suggested price: {formatCurrency(calculateSuggestedPrice(formData.menu_item_quantities))}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Menu Items *</Label>
              <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto">
                {availableMenuItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No menu items available</p>
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      // Sort menu items: selected items (quantity > 0) first, then unselected items
                      const sortedMenuItems = [...availableMenuItems].sort((a, b) => {
                        const aId = a.menu_item_id || a.id;
                        const bId = b.menu_item_id || b.id;
                        const aQuantity = (formData.menu_item_quantities && formData.menu_item_quantities[aId]) || 0;
                        const bQuantity = (formData.menu_item_quantities && formData.menu_item_quantities[bId]) || 0;
                        
                        // Selected items (quantity > 0) come first
                        if (aQuantity > 0 && bQuantity === 0) return -1;
                        if (aQuantity === 0 && bQuantity > 0) return 1;
                        
                        // If both selected or both unselected, sort alphabetically by name
                        const aName = (a.menu_name || a.name || '').toLowerCase();
                        const bName = (b.menu_name || b.name || '').toLowerCase();
                        return aName.localeCompare(bName);
                      });
                      
                      return sortedMenuItems.map((item: any) => {
                        const itemId = item.menu_item_id || item.id;
                        const quantity = (formData.menu_item_quantities && formData.menu_item_quantities[itemId]) || 0;
                        const restrictionName = item.restriction_name || item.dietary_restriction || null;
                        const restrictionType = item.restriction_type || 'Dietary';
                      
                      const handleIncrement = () => {
                        setFormData({
                          ...formData,
                          menu_item_quantities: {
                            ...(formData.menu_item_quantities || {}),
                            [itemId]: quantity + 1
                          }
                        });
                      };
                      
                      const handleDecrement = () => {
                        if (quantity > 1) {
                          setFormData({
                            ...formData,
                            menu_item_quantities: {
                              ...(formData.menu_item_quantities || {}),
                              [itemId]: quantity - 1
                            }
                          });
                        } else if (quantity === 1) {
                          // Remove from quantities if decrementing from 1
                          const newQuantities = { ...(formData.menu_item_quantities || {}) };
                          delete newQuantities[itemId];
                          setFormData({
                            ...formData,
                            menu_item_quantities: newQuantities
                          });
                        }
                      };
                      
                      return (
                        <div 
                          key={itemId} 
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                            quantity > 0 
                              ? 'bg-primary/5 dark:bg-primary/10 border-primary/30 shadow-sm' 
                              : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleDecrement}
                              disabled={quantity === 0}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <div className="w-12 text-center">
                              <span className={`text-lg font-semibold ${quantity > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                {quantity}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleIncrement}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`font-medium truncate ${quantity > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {item.menu_name || item.name}
                              </span>
                              <span className={`text-sm flex-shrink-0 ${quantity > 0 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                                {formatCurrency(item.selling_price || item.menu_price || 0)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {item.menu_type || 'N/A'}
                              </Badge>
                              {restrictionName && restrictionName !== 'None' && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getTypeColor(restrictionType)} border flex items-center gap-1`}
                                >
                                  {(() => {
                                    const Icon = getTypeIcon(restrictionType);
                                    return <Icon className="h-3 w-3" />;
                                  })()}
                                  {restrictionName}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                    })()}
                  </div>
                )}
              </div>
              {formData.menu_item_quantities && Object.keys(formData.menu_item_quantities).length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {Object.values(formData.menu_item_quantities).reduce((sum, qty) => sum + qty, 0)} menu item{Object.values(formData.menu_item_quantities).reduce((sum, qty) => sum + qty, 0) !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddDialogOpen(false);
              setEditDialogOpen(false);
              // Reset form
              setFormData({
                package_name: '',
                package_type: '',
                selling_price: '',
                package_price: '',
                menu_item_quantities: {}
              });
            }}>Cancel</Button>
            <Button onClick={handleSavePackage} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPackage?.package_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Packages;
