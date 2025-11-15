import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Warehouse, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2
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
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { inventoryAPI } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { useCurrencyFormat } from '@/utils/currency';

const Inventory = () => {
  const { formatCurrency } = useCurrencyFormat();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'condition' | 'quantity' | 'cost'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    item_condition: '',
    quantity_available: '',
    rental_cost: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterCondition, sortBy, sortOrder]);

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getAll({});
      if (response && response.data) {
        const data = response.data.success ? response.data.data : response.data;
        setInventoryItems(Array.isArray(data) ? data : []);
      } else {
        setInventoryItems([]);
      }
    } catch (error: any) {
      console.error('Error fetching inventory items:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to fetch inventory items',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setFormData({
      item_name: '',
      category: '',
      item_condition: '',
      quantity_available: '',
      rental_cost: ''
    });
    setAddDialogOpen(true);
  };

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setFormData({
      item_name: item.item_name || '',
      category: item.category || '',
      item_condition: item.item_condition || '',
      quantity_available: (item.quantity_available || 0).toString(),
      rental_cost: (item.rental_cost || 0).toString()
    });
    setEditDialogOpen(true);
  };

  const handleDeleteItem = (item: any) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!formData.item_name || !formData.category || !formData.item_condition || !formData.quantity_available || !formData.rental_cost) {
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
        item_name: formData.item_name,
        category: formData.category,
        item_condition: formData.item_condition,
        quantity_available: parseInt(formData.quantity_available),
        rental_cost: parseFloat(formData.rental_cost)
      };

      if (selectedItem) {
        await inventoryAPI.update(selectedItem.inventory_id, data);
        toast({ title: 'Success', description: 'Inventory item updated successfully' });
        setEditDialogOpen(false);
      } else {
        await inventoryAPI.create(data);
        toast({ title: 'Success', description: 'Inventory item created successfully' });
        setAddDialogOpen(false);
      }

      fetchInventoryItems();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save inventory item',
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    setFormLoading(true);
    try {
      await inventoryAPI.delete(selectedItem.inventory_id);
      toast({ title: 'Success', description: 'Inventory item deleted successfully' });
      setDeleteDialogOpen(false);
      fetchInventoryItems();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete inventory item',
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    setFilterCondition('all');
    setSortBy('name');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'Excellent':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Excellent</Badge>;
      case 'Good':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Good</Badge>;
      case 'Fair':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Fair</Badge>;
      case 'Poor':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Poor</Badge>;
      default:
        return <Badge variant="outline">{condition || 'Unknown'}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'Furniture': 'bg-blue-100 text-blue-800',
      'Linens': 'bg-pink-100 text-pink-800',
      'Lighting': 'bg-yellow-100 text-yellow-800',
      'Audio/Visual': 'bg-purple-100 text-purple-800',
      'Decorations': 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>{category}</Badge>;
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Out of Stock</Badge>;
    } else if (quantity < 5) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
    }
  };

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    return inventoryItems
      .filter(item => {
        const matchesSearch = item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
        const matchesCondition = filterCondition === 'all' || item.item_condition === filterCondition;
        return matchesSearch && matchesCategory && matchesCondition;
      })
      .sort((a, b) => {
        let aVal: any, bVal: any;
        switch (sortBy) {
          case 'name':
            aVal = a.item_name?.toLowerCase() || '';
            bVal = b.item_name?.toLowerCase() || '';
            break;
          case 'category':
            aVal = a.category?.toLowerCase() || '';
            bVal = b.category?.toLowerCase() || '';
            break;
          case 'condition':
            aVal = a.item_condition?.toLowerCase() || '';
            bVal = b.item_condition?.toLowerCase() || '';
            break;
          case 'quantity':
            aVal = a.quantity_available || 0;
            bVal = b.quantity_available || 0;
            break;
          case 'cost':
            aVal = a.rental_cost || 0;
            bVal = b.rental_cost || 0;
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
  }, [inventoryItems, searchTerm, filterCategory, filterCondition, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredAndSortedItems.slice(startIndex, endIndex);

  const totalValue = inventoryItems.reduce((sum, item) => sum + ((item.rental_cost || 0) * (item.quantity_available || 0)), 0);
  const lowStockItems = inventoryItems.filter(item => (item.quantity_available || 0) < 5 && (item.quantity_available || 0) > 0).length;
  const outOfStockItems = inventoryItems.filter(item => (item.quantity_available || 0) === 0).length;
  const categories = [...new Set(inventoryItems.map(item => item.category).filter(Boolean))];
  const conditions = [...new Set(inventoryItems.map(item => item.item_condition).filter(Boolean))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Overview</h1>
            <p className="text-muted-foreground">
              Manage rental inventory and equipment
            </p>
          </div>
          <Button onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-2" />
            New Item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryItems.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Inventory items in stock</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total inventory value</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground mt-1">Items below 5 units</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
              <p className="text-xs text-muted-foreground mt-1">Items with 0 quantity</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory List */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Directory</CardTitle>
            <CardDescription>
              View and manage all rental inventory items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
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
              <div className="grid md:grid-cols-5 gap-3 mb-4">
                <div>
                  <label className="text-sm text-muted-foreground">Category</label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Condition</label>
                  <Select value={filterCondition} onValueChange={setFilterCondition}>
                    <SelectTrigger><SelectValue placeholder="All Conditions" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Conditions</SelectItem>
                      {conditions.map(cond => (
                        <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Sort By</label>
                  <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                    <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="condition">Condition</SelectItem>
                      <SelectItem value="quantity">Quantity</SelectItem>
                      <SelectItem value="cost">Rental Cost</SelectItem>
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

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Loading inventory items...</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Inventory ID</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Quantity Available</TableHead>
                      <TableHead>Rental Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {inventoryItems.length === 0 ? 'No inventory items found' : 'No items match the filters'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedItems.map((item) => (
                        <TableRow key={item.inventory_id}>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            #{item.inventory_id}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Warehouse className="h-4 w-4 text-primary" />
                              </div>
                              {item.item_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getCategoryBadge(item.category)}
                          </TableCell>
                          <TableCell>
                            {getConditionBadge(item.item_condition)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.quantity_available || 0}</span>
                              {getStockStatus(item.quantity_available || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {formatCurrency(item.rental_cost || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStockStatus(item.quantity_available || 0)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteItem(item)}
                                >
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
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} items
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={addDialogOpen || editDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setAddDialogOpen(false);
            setEditDialogOpen(false);
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
              <DialogDescription>
                {selectedItem ? 'Update inventory item details' : 'Add a new item to the inventory'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="item_name">Item Name *</Label>
                <Input
                  id="item_name"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  placeholder="e.g., Round Tables (8-person)"
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Linens">Linens</SelectItem>
                    <SelectItem value="Lighting">Lighting</SelectItem>
                    <SelectItem value="Audio/Visual">Audio/Visual</SelectItem>
                    <SelectItem value="Decorations">Decorations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item_condition">Condition *</Label>
                <Select value={formData.item_condition} onValueChange={(value) => setFormData({ ...formData, item_condition: value })}>
                  <SelectTrigger id="item_condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity_available">Quantity Available *</Label>
                <Input
                  id="quantity_available"
                  type="number"
                  min="0"
                  value={formData.quantity_available}
                  onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })}
                  placeholder="0"
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rental_cost">Rental Cost (PHP) *</Label>
                <Input
                  id="rental_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.rental_cost}
                  onChange={(e) => setFormData({ ...formData, rental_cost: e.target.value })}
                  placeholder="0.00"
                  disabled={formLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Display: {formData.rental_cost ? formatCurrency(parseFloat(formData.rental_cost) || 0) : formatCurrency(0)}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setAddDialogOpen(false);
                setEditDialogOpen(false);
              }} disabled={formLoading}>
                Cancel
              </Button>
              <Button onClick={handleSaveItem} disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  selectedItem ? 'Update Item' : 'Add Item'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Inventory Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedItem?.item_name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={formLoading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
