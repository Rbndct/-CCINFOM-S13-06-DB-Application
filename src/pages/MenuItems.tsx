import { useState, useEffect, useMemo } from 'react';
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
  CheckCircle,
  Lock,
  ArrowUpDown,
  X,
  ChefHat,
  List,
  ChevronUp,
  ChevronDown
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
import { menuItemsAPI, dietaryRestrictionsAPI } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrencyFormat } from '@/utils/currency';
import { getTypeIcon, getTypeColor } from '@/utils/restrictionUtils';

const MenuItems = () => {
  const { formatCurrency } = useCurrencyFormat();
  const [activeTab, setActiveTab] = useState('templates');
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'type' | 'price' | 'cost' | 'makeable'>(() => {
    const stored = localStorage.getItem('default_table_sort_by');
    return (stored as 'id' | 'name' | 'type' | 'price' | 'cost' | 'makeable') || 'id';
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    const stored = localStorage.getItem('default_table_sort_order');
    return (stored as 'asc' | 'desc') || 'desc';
  });
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
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemRecipe, setSelectedItemRecipe] = useState<any[]>([]);
  const [showIngredients, setShowIngredients] = useState(false);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<any[]>([]);
  
  // Form states
  const [formData, setFormData] = useState({
    menu_name: '',
    menu_cost: '',
    menu_price: '',
    menu_type: '',
    restriction_id: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch dietary restrictions
  useEffect(() => {
    const fetchRestrictions = async () => {
      try {
        const response = await dietaryRestrictionsAPI.getAll();
        if (response && response.success && response.data) {
          setDietaryRestrictions(response.data || []);
        } else if (response && response.data) {
          setDietaryRestrictions(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching dietary restrictions:', error);
      }
    };
    fetchRestrictions();
  }, []);

  // Fetch menu items from backend
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await menuItemsAPI.getAll();
        if (response && response.success && response.data) {
          // Transform data to match UI expectations
          const items = response.data.map((item: any) => ({
            id: item.menu_item_id,
            menu_item_id: item.menu_item_id,
            menu_name: item.menu_name,
            menu_cost: parseFloat(item.menu_cost) || 0,
            menu_price: parseFloat(item.menu_price) || 0,
            menu_type: item.menu_type,
            makeable_quantity: item.makeable_quantity ?? 0,
            restriction_id: item.restriction_id,
            restriction_name: item.restriction_name,
            profit_margin: parseFloat(item.profit_margin) || 0,
            is_template: true, // All menu items are templates (shared across weddings)
            usage_count: item.usage_count || 0
          }));
          setMenuItems(items);
        } else if (response && response.data) {
          const items = response.data.map((item: any) => ({
            id: item.menu_item_id,
            menu_item_id: item.menu_item_id,
            menu_name: item.menu_name,
            menu_cost: parseFloat(item.menu_cost) || 0,
            menu_price: parseFloat(item.menu_price) || 0,
            menu_type: item.menu_type,
            makeable_quantity: item.makeable_quantity ?? 0,
            restriction_id: item.restriction_id,
            restriction_name: item.restriction_name,
            profit_margin: parseFloat(item.profit_margin) || 0,
            is_template: true,
            usage_count: item.usage_count || 0
          }));
          setMenuItems(items);
        } else {
          setMenuItems([]);
        }
      } catch (error: any) {
        console.error('Error fetching menu items:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to fetch menu items',
          variant: 'destructive'
        });
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [toast]);
  
  // Fetch recipe for selected item
  const fetchItemRecipe = async (itemId: number) => {
    try {
      const response = await menuItemsAPI.getById(itemId);
      if (response && response.success && response.data) {
        setSelectedItemRecipe(response.data.recipe || []);
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setSelectedItemRecipe([]);
    }
  };
  
  // Handle view item details
  const handleViewItem = async (item: any) => {
    setSelectedItem(item);
    await fetchItemRecipe(item.menu_item_id || item.id);
    setViewDialogOpen(true);
  };
  
  // Handle edit item
  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setFormData({
      menu_name: item.menu_name || '',
      menu_cost: (item.menu_cost || 0).toString(),
      menu_price: (item.menu_price || 0).toString(),
      menu_type: item.menu_type || '',
      restriction_id: (item.restriction_id || '').toString()
    });
    setEditDialogOpen(true);
  };
  
  // Handle delete item
  const handleDeleteItem = (item: any) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };
  
  // Handle add item
  const handleAddItem = () => {
    setFormData({
      menu_name: '',
      menu_cost: '',
      menu_price: '',
      menu_type: '',
      restriction_id: ''
    });
    setSelectedItem(null);
    setAddDialogOpen(true);
  };
  
  // Save menu item (create or update)
  const handleSaveItem = async () => {
    if (!formData.menu_name || !formData.menu_cost || !formData.menu_price || !formData.menu_type) {
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
        menu_name: formData.menu_name,
        menu_cost: parseFloat(formData.menu_cost),
        menu_price: parseFloat(formData.menu_price),
        menu_type: formData.menu_type,
        restriction_id: formData.restriction_id ? parseInt(formData.restriction_id) : null
      };
      
      if (selectedItem) {
        // Update
        await menuItemsAPI.update(selectedItem.menu_item_id || selectedItem.id, data);
        toast({ title: 'Success', description: 'Menu item updated successfully' });
        setEditDialogOpen(false);
      } else {
        // Create
        await menuItemsAPI.create(data);
        toast({ title: 'Success', description: 'Menu item created successfully' });
        setAddDialogOpen(false);
      }
      
      // Refresh menu items
      const response = await menuItemsAPI.getAll();
      if (response && response.success && response.data) {
        const items = response.data.map((item: any) => ({
          id: item.menu_item_id,
          menu_item_id: item.menu_item_id,
          menu_name: item.menu_name,
          menu_cost: parseFloat(item.menu_cost) || 0,
          menu_price: parseFloat(item.menu_price) || 0,
          menu_type: item.menu_type,
          makeable_quantity: item.makeable_quantity ?? 0,
          restriction_id: item.restriction_id,
          restriction_name: item.restriction_name,
          profit_margin: parseFloat(item.profit_margin) || 0,
          is_template: true,
          usage_count: item.usage_count || 0
        }));
        setMenuItems(items);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save menu item',
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  // Delete menu item
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    
    setFormLoading(true);
    try {
      await menuItemsAPI.delete(selectedItem.menu_item_id || selectedItem.id);
      toast({ title: 'Success', description: 'Menu item deleted successfully' });
      setDeleteDialogOpen(false);
      
      // Refresh menu items
      const response = await menuItemsAPI.getAll();
      if (response && response.success && response.data) {
        const items = response.data.map((item: any) => ({
          id: item.menu_item_id,
          menu_item_id: item.menu_item_id,
          menu_name: item.menu_name,
          menu_cost: parseFloat(item.menu_cost) || 0,
          menu_price: parseFloat(item.menu_price) || 0,
          menu_type: item.menu_type,
          makeable_quantity: item.makeable_quantity ?? 0,
          restriction_id: item.restriction_id,
          restriction_name: item.restriction_name,
          profit_margin: parseFloat(item.profit_margin) || 0,
          is_template: true,
          usage_count: item.usage_count || 0
        }));
        setMenuItems(items);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete menu item',
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

  const getMakeableStatus = (qty: number) => {
    if (!qty || qty <= 0) {
      return <Badge variant="destructive" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700 border">Unavailable</Badge>;
    } else if (qty < 10) {
      return <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700 border">Low Availability</Badge>;
    } else {
      return <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 border">Available</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'Appetizer': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700',
      'Main Course': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700',
      'Dessert': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700',
      'Beverage': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700'
    };
    return <Badge className={`${colors[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'} border`}>{type}</Badge>;
  };

  // Filter and sort menu items
  const filteredAndSortedMenuItems = useMemo(() => {
    return menuItems
      .filter(item => {
        const matchesSearch = item.menu_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.menu_type?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || item.menu_type === filterType;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case 'id':
          aVal = a.menu_item_id || a.id || 0;
          bVal = b.menu_item_id || b.id || 0;
          break;
        case 'name':
          aVal = a.menu_name?.toLowerCase() || '';
          bVal = b.menu_name?.toLowerCase() || '';
          break;
        case 'type':
          aVal = a.menu_type?.toLowerCase() || '';
          bVal = b.menu_type?.toLowerCase() || '';
          break;
        case 'price':
          aVal = a.menu_price || 0;
          bVal = b.menu_price || 0;
          break;
        case 'cost':
          aVal = a.menu_cost || 0;
          bVal = b.menu_cost || 0;
          break;
        case 'makeable':
          aVal = a.makeable_quantity || 0;
          bVal = b.makeable_quantity || 0;
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
  }, [menuItems, searchTerm, filterType, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedMenuItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMenuItems = filteredAndSortedMenuItems.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, sortBy, sortOrder, activeTab]);

  const templateItems = menuItems.filter(item => item.is_template);
  const weddingItems = menuItems.filter(item => !item.is_template);

  const currentItems = activeTab === 'templates' ? templateItems : weddingItems;
  
  // Updated statistics - more relevant to menu items
  const totalItems = currentItems.length;
  const averagePrice = currentItems.length > 0 
    ? currentItems.reduce((sum, item) => sum + (item.menu_price || 0), 0) / currentItems.length 
    : 0;
  const totalProfitMargin = currentItems.reduce((sum, item) => sum + (item.profit_margin || 0), 0);
  const itemsWithRestrictions = currentItems.filter(item => item.restriction_id).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Menu Items Overview</h1>
            <p className="text-muted-foreground">
              Manage menu items, pricing, and inventory
            </p>
          </div>
          <Button onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-2" />
            New Menu Item
          </Button>
        </div>

        {/* Stats Cards - Updated to be more relevant */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground mt-1">Menu items in library</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(averagePrice)}</div>
              <p className="text-xs text-muted-foreground mt-1">Per menu item</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit Margin</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfitMargin)}</div>
              <p className="text-xs text-muted-foreground mt-1">Combined margin</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Restrictions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{itemsWithRestrictions}</div>
              <p className="text-xs text-muted-foreground mt-1">Dietary restrictions</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items List with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Items Directory</CardTitle>
            <CardDescription>
              {activeTab === 'templates' 
                ? 'Template library - Default menu items available to all weddings'
                : 'Wedding-specific menu items'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="templates" className="gap-2">
                  <Package className="w-4 h-4" />
                  Templates ({templateItems.length})
                </TabsTrigger>
                <TabsTrigger value="wedding-specific" className="gap-2">
                  <Utensils className="w-4 h-4" />
                  Wedding-Specific ({weddingItems.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-4">
                {/* Filter and Sort Section */}
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
                          <SelectItem value="Appetizer">Appetizer</SelectItem>
                          <SelectItem value="Main Course">Main Course</SelectItem>
                          <SelectItem value="Dessert">Dessert</SelectItem>
                          <SelectItem value="Beverage">Beverage</SelectItem>
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
                          <SelectItem value="cost">Cost</SelectItem>
                        <SelectItem value="makeable">Makeable Qty</SelectItem>
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
                      <TableHead>Menu ID</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Profit Margin</TableHead>
                      <TableHead>Makeable Qty</TableHead>
                      <TableHead>Restrictions</TableHead>
                      {activeTab === 'templates' && <TableHead>Usage</TableHead>}
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={activeTab === 'templates' ? 10 : 9} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                          <p className="text-sm text-muted-foreground mt-2">Loading menu items...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredAndSortedMenuItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={activeTab === 'templates' ? 10 : 9} className="text-center py-8">
                          <p className="text-sm text-muted-foreground">No menu items found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedMenuItems.map((item) => (
                        <TableRow key={item.id || item.menu_item_id} className={item.is_template ? 'bg-muted/30' : ''}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              #{item.menu_item_id || item.id}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                {item.is_template && (
                                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-700 flex-shrink-0">
                                    <Lock className="w-3 h-3 mr-1 dark:text-blue-300" />
                                    Template
                                  </Badge>
                                )}
                                <span className="truncate">{item.menu_name}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(item.menu_type)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {formatCurrency(item.menu_cost || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {formatCurrency(item.menu_price || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-green-600">
                              {formatCurrency(item.profit_margin || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.makeable_quantity ?? 0}</span>
                              {getMakeableStatus(item.makeable_quantity ?? 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.restriction_name ? (
                              <div className="space-y-0.5">
                                <Badge variant="outline" className={`${getTypeColor('Dietary')} border text-xs flex items-center gap-1 w-fit`}>
                                  {(() => {
                                    const Icon = getTypeIcon('Dietary');
                                    return <Icon className="h-3 w-3" />;
                                  })()}
                                  {item.restriction_name}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          {activeTab === 'templates' && (
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                Used in {item.usage_count || 0} weddings
                              </span>
                            </TableCell>
                          )}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewItem(item)}>
                                  <Eye className="mr-2 h-4 w-4 dark:text-muted-foreground" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={() => handleDeleteItem(item)}>
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
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedMenuItems.length)} of {filteredAndSortedMenuItems.length} items
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
              </TabsContent>

              <TabsContent value="wedding-specific" className="space-y-4">
                {/* Filter and Sort Section */}
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
                          <SelectItem value="Appetizer">Appetizer</SelectItem>
                          <SelectItem value="Main Course">Main Course</SelectItem>
                          <SelectItem value="Dessert">Dessert</SelectItem>
                          <SelectItem value="Beverage">Beverage</SelectItem>
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
                          <SelectItem value="cost">Cost</SelectItem>
                        <SelectItem value="makeable">Makeable Qty</SelectItem>
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
                      <TableHead>Menu ID</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Profit Margin</TableHead>
                      <TableHead>Makeable Qty</TableHead>
                      <TableHead>Restrictions</TableHead>
                      <TableHead>Wedding</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                          <p className="text-sm text-muted-foreground mt-2">Loading menu items...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredAndSortedMenuItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <p className="text-sm text-muted-foreground">No menu items found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedMenuItems.map((item) => (
                        <TableRow key={item.id || item.menu_item_id}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              #{item.menu_item_id || item.id}
                            </Badge>
                          </TableCell>
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
                              {formatCurrency(item.menu_cost || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {formatCurrency(item.menu_price || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-green-600">
                              {formatCurrency(item.profit_margin || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.makeable_quantity ?? 0}</span>
                              {getMakeableStatus(item.makeable_quantity ?? 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.restriction_name ? (
                              <div className="space-y-0.5">
                                <Badge variant="outline" className={`${getTypeColor('Dietary')} border text-xs flex items-center gap-1 w-fit`}>
                                  {(() => {
                                    const Icon = getTypeIcon('Dietary');
                                    return <Icon className="h-3 w-3" />;
                                  })()}
                                  {item.restriction_name}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">None</span>
                            )}
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
                                <DropdownMenuItem onClick={() => handleViewItem(item)}>
                                  <Eye className="mr-2 h-4 w-4 dark:text-muted-foreground" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={() => handleDeleteItem(item)}>
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
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedMenuItems.length)} of {filteredAndSortedMenuItems.length} items
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* View Item Dialog with Recipe */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                {selectedItem?.menu_name}
                <Badge variant="outline" className="ml-2 font-mono">ID: #{selectedItem?.menu_item_id || selectedItem?.id}</Badge>
              </DialogTitle>
              <DialogDescription>
                Menu item details and recipe information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                  <div className="mt-1">{getTypeBadge(selectedItem?.menu_type)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Makeable Qty</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-lg font-semibold">{selectedItem?.makeable_quantity ?? 0}</span>
                    {getMakeableStatus(selectedItem?.makeable_quantity ?? 0)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Cost</Label>
                  <div className="mt-1 text-lg font-semibold">{formatCurrency(selectedItem?.menu_cost || 0)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                  <div className="mt-1 text-lg font-semibold">{formatCurrency(selectedItem?.menu_price || 0)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Profit Margin</Label>
                  <div className="mt-1 text-lg font-semibold text-green-600">{formatCurrency(selectedItem?.profit_margin || 0)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Dietary Restriction</Label>
                  <div className="mt-1">
                    {selectedItem?.restriction_name ? (
                      <Badge variant="outline" className={`${getTypeColor('Dietary')} border text-xs flex items-center gap-1 w-fit`}>
                        {(() => {
                          const Icon = getTypeIcon('Dietary');
                          return <Icon className="h-3 w-3" />;
                        })()}
                        {selectedItem.restriction_name}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Recipe and Ingredients - Collapsible */}
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowIngredients(!showIngredients)}
                  className="flex items-center justify-between w-full mb-4 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-2">
                    <List className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Recipe & Ingredients</h3>
                    {selectedItemRecipe.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {selectedItemRecipe.length} {selectedItemRecipe.length === 1 ? 'ingredient' : 'ingredients'}
                      </Badge>
                    )}
                  </div>
                  {showIngredients ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {showIngredients && (
                  <>
                    {selectedItemRecipe.length > 0 ? (
                      <div className="space-y-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ingredient</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead>Stock Available</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedItemRecipe.map((ingredient: any) => (
                              <TableRow key={ingredient.ingredient_id}>
                                <TableCell className="font-medium">{ingredient.ingredient_name}</TableCell>
                                <TableCell>{ingredient.quantity_needed}</TableCell>
                                <TableCell>{ingredient.unit}</TableCell>
                                <TableCell>
                                  <span className={parseFloat(ingredient.stock_quantity || 0) < parseFloat(ingredient.quantity_needed || 0) ? 'text-red-600 font-medium' : ''}>
                                    {ingredient.stock_quantity} {ingredient.unit}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recipe information available for this menu item.</p>
                    )}
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
              <Button onClick={() => {
                setViewDialogOpen(false);
                if (selectedItem) handleEditItem(selectedItem);
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add/Edit Item Dialog */}
        <Dialog open={addDialogOpen || editDialogOpen} onOpenChange={(open) => {
          setAddDialogOpen(open);
          setEditDialogOpen(open);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
              <DialogDescription>
                {selectedItem ? 'Update menu item information' : 'Create a new menu item for the library'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="menu_name">Menu Item Name *</Label>
                <Input
                  id="menu_name"
                  value={formData.menu_name}
                  onChange={(e) => setFormData({...formData, menu_name: e.target.value})}
                  placeholder="e.g., Grilled Salmon"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="menu_type">Menu Type *</Label>
                <Select value={formData.menu_type} onValueChange={(val) => setFormData({...formData, menu_type: val})}>
                  <SelectTrigger id="menu_type">
                    <SelectValue placeholder="Select menu type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Appetizer">Appetizer</SelectItem>
                    <SelectItem value="Main Course">Main Course</SelectItem>
                    <SelectItem value="Dessert">Dessert</SelectItem>
                    <SelectItem value="Beverage">Beverage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="menu_cost">Cost (PHP) *</Label>
                  <Input
                    id="menu_cost"
                    type="number"
                    step="0.01"
                    value={formData.menu_cost}
                    onChange={(e) => setFormData({...formData, menu_cost: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="menu_price">Price (PHP) *</Label>
                  <Input
                    id="menu_price"
                    type="number"
                    step="0.01"
                    value={formData.menu_price}
                    onChange={(e) => setFormData({...formData, menu_price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restriction_id">Dietary Restriction</Label>
                  <Select value={formData.restriction_id} onValueChange={(val) => setFormData({...formData, restriction_id: val})}>
                    <SelectTrigger id="restriction_id">
                      <SelectValue placeholder="Select restriction (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restriction-none">None</SelectItem>
                      {dietaryRestrictions.map((restriction: any) => {
                        const restrictionValue = restriction.restriction_id ? restriction.restriction_id.toString() : `restriction-${restriction.restriction_name || 'unknown'}`;
                        return (
                          <SelectItem key={restriction.restriction_id || restrictionValue} value={restrictionValue}>
                            {restriction.restriction_name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setAddDialogOpen(false);
                setEditDialogOpen(false);
              }}>Cancel</Button>
              <Button onClick={handleSaveItem} disabled={formLoading}>
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
              <DialogTitle>Delete Menu Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedItem?.menu_name}"? This action cannot be undone.
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
      </div>
    </DashboardLayout>
  );
};

export default MenuItems;
