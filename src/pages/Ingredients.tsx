import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  ArrowUpDown,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  TrendingDown,
  PackagePlus,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ingredientsAPI, menuItemsAPI } from '@/api';
import api from '@/api';
import { useToast } from '@/hooks/use-toast';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'stock' | 'reorder'>(() => {
    const stored = localStorage.getItem('ingredients_sort_by');
    return (stored as 'id' | 'name' | 'stock' | 'reorder') || 'id';
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    const stored = localStorage.getItem('ingredients_sort_order');
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
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [menuItemsUsingIngredient, setMenuItemsUsingIngredient] = useState<any[]>([]);
  
  // Form states
  const [formData, setFormData] = useState({
    ingredient_name: '',
    unit: '',
    stock_quantity: '',
    re_order_level: ''
  });
  const [restockAmount, setRestockAmount] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Fetch ingredients from backend
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        const response = await ingredientsAPI.getAll();
        if (response && response.success && response.data) {
          setIngredients(response.data || []);
        } else if (response && response.data) {
          setIngredients(response.data || []);
        } else {
          setIngredients([]);
        }
      } catch (error: any) {
        console.error('Error fetching ingredients:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to fetch ingredients',
          variant: 'destructive'
        });
        setIngredients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, [toast]);

  // Fetch menu items using this ingredient
  const fetchMenuItemsUsingIngredient = async (ingredientId: number) => {
    try {
      const response = await api.get(`/ingredients/${ingredientId}`);
      if (response && response.data && response.data.success && response.data.data) {
        setMenuItemsUsingIngredient(response.data.data.menu_items || []);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuItemsUsingIngredient([]);
    }
  };

  // Handle view ingredient
  const handleViewIngredient = async (ingredient: any) => {
    setSelectedIngredient(ingredient);
    await fetchMenuItemsUsingIngredient(ingredient.ingredient_id || ingredient.id);
    setViewDialogOpen(true);
  };

  // Handle edit ingredient
  const handleEditIngredient = (ingredient: any) => {
    setSelectedIngredient(ingredient);
    const stockQty = (ingredient.stock_quantity || 0).toString();
    // Calculate re-order level for display (but it will be recalculated on save)
    const calculatedReorder = stockQty ? Math.max(1, Math.floor(parseFloat(stockQty) * 0.2)).toString() : '';
    setFormData({
      ingredient_name: ingredient.ingredient_name || '',
      unit: ingredient.unit || '',
      stock_quantity: stockQty,
      re_order_level: calculatedReorder // Auto-calculated, not editable
    });
    setEditDialogOpen(true);
  };

  // Handle delete ingredient
  const handleDeleteIngredient = (ingredient: any) => {
    setSelectedIngredient(ingredient);
    setDeleteDialogOpen(true);
  };

  // Handle restock ingredient
  const handleRestockIngredient = (ingredient: any) => {
    setSelectedIngredient(ingredient);
    setRestockAmount('');
    setRestockDialogOpen(true);
  };

  // Handle save ingredient
  const handleSaveIngredient = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.ingredient_name.trim()) {
      newErrors.ingredient_name = 'Ingredient name is required';
    }
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    if (!formData.stock_quantity || parseFloat(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = 'Valid stock quantity is required';
    }

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly',
        variant: 'destructive',
      });
      return;
    }

    setFormLoading(true);
    try {
      // Calculate re-order level as 20% of stock quantity (or minimum 1)
      const stockQty = parseFloat(formData.stock_quantity);
      const calculatedReorderLevel = Math.max(1, Math.floor(stockQty * 0.2));
      
      const data = {
        ingredient_name: formData.ingredient_name.trim(),
        unit: formData.unit.trim(),
        stock_quantity: stockQty,
        re_order_level: calculatedReorderLevel
      };

      if (selectedIngredient) {
        // Update
        await ingredientsAPI.update(selectedIngredient.ingredient_id || selectedIngredient.id, data);
        toast({ title: 'Success', description: 'Ingredient updated successfully' });
        setEditDialogOpen(false);
      } else {
        // Create
        await ingredientsAPI.create(data);
        toast({ title: 'Success', description: 'Ingredient created successfully' });
        setAddDialogOpen(false);
      }
      
      // Refresh ingredients
      const response = await ingredientsAPI.getAll();
      if (response && response.success && response.data) {
        setIngredients(response.data || []);
      } else if (response && response.data) {
        setIngredients(response.data || []);
      }
      
      // Reset form
      setFormData({
        ingredient_name: '',
        unit: '',
        stock_quantity: '',
        re_order_level: '' // This will be auto-calculated
      });
      setSelectedIngredient(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save ingredient',
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedIngredient) return;
    
    setFormLoading(true);
    try {
      await ingredientsAPI.delete(selectedIngredient.ingredient_id || selectedIngredient.id);
      toast({ title: 'Success', description: 'Ingredient deleted successfully' });
      setDeleteDialogOpen(false);
      
      // Refresh ingredients
      const response = await ingredientsAPI.getAll();
      if (response && response.success && response.data) {
        setIngredients(response.data || []);
      } else if (response && response.data) {
        setIngredients(response.data || []);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete ingredient',
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle restock
  const handleConfirmRestock = async () => {
    if (!selectedIngredient || !restockAmount) return;
    
    const delta = parseFloat(restockAmount);
    if (isNaN(delta) || delta === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid restock amount',
        variant: 'destructive'
      });
      return;
    }

    setFormLoading(true);
    try {
      await ingredientsAPI.restock(selectedIngredient.ingredient_id || selectedIngredient.id, delta);
      toast({ 
        title: 'Success', 
        description: `Stock ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}` 
      });
      // Refresh ingredients
      const response = await ingredientsAPI.getAll();
      if (response && response.success && response.data) {
        const updatedIngredients = response.data || [];
        setIngredients(updatedIngredients);
        // Update selected ingredient with fresh data
        const updatedIngredient = updatedIngredients.find((ing: any) => 
          (ing.ingredient_id || ing.id) === (selectedIngredient.ingredient_id || selectedIngredient.id)
        );
        if (updatedIngredient) {
          setSelectedIngredient(updatedIngredient);
        }
      } else if (response && response.data) {
        const updatedIngredients = response.data || [];
        setIngredients(updatedIngredients);
        // Update selected ingredient with fresh data
        const updatedIngredient = updatedIngredients.find((ing: any) => 
          (ing.ingredient_id || ing.id) === (selectedIngredient.ingredient_id || selectedIngredient.id)
        );
        if (updatedIngredient) {
          setSelectedIngredient(updatedIngredient);
        }
      }
      
      // Keep dialog open for multiple restocks, but reset amount
      setRestockAmount('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to restock ingredient',
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle add ingredient
  const handleAddIngredient = () => {
    setSelectedIngredient(null);
    setFormData({
      ingredient_name: '',
      unit: '',
      stock_quantity: '',
      re_order_level: ''
    });
    setAddDialogOpen(true);
  };

  // Filter and sort ingredients
  const filteredAndSortedIngredients = useMemo(() => {
    return ingredients
      .filter(ing => {
        const matchesSearch = ing.ingredient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             ing.unit?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        let aVal: any, bVal: any;
        switch (sortBy) {
          case 'id':
            aVal = a.ingredient_id || a.id || 0;
            bVal = b.ingredient_id || b.id || 0;
            break;
          case 'name':
            aVal = a.ingredient_name?.toLowerCase() || '';
            bVal = b.ingredient_name?.toLowerCase() || '';
            break;
          case 'stock':
            aVal = parseFloat(a.stock_quantity) || 0;
            bVal = parseFloat(b.stock_quantity) || 0;
            break;
          case 'reorder':
            aVal = parseFloat(a.re_order_level) || 0;
            bVal = parseFloat(b.re_order_level) || 0;
            break;
          default:
            return 0;
        }
        
        if (typeof aVal === 'string') {
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
  }, [ingredients, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedIngredients.length / itemsPerPage);
  const paginatedIngredients = filteredAndSortedIngredients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const totalIngredients = ingredients.length;
  const lowStockCount = ingredients.filter((ing: any) => {
    const stock = parseFloat(ing.stock_quantity) || 0;
    const reorder = parseFloat(ing.re_order_level) || 0;
    return stock <= reorder;
  }).length;
  const totalStockValue = ingredients.reduce((sum: number, ing: any) => {
    return sum + (parseFloat(ing.stock_quantity) || 0);
  }, 0);

  const getStockStatus = (stock: number, reorder: number) => {
    if (stock <= reorder) {
      return { label: 'Low Stock', color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700', icon: AlertTriangle };
    } else if (stock <= reorder * 1.5) {
      return { label: 'Warning', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700', icon: AlertCircle };
    }
    return { label: 'In Stock', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700', icon: CheckCircle };
  };

  // Get re-order level icon based on stock status
  const getReorderLevelIcon = (stock: number, reorder: number) => {
    if (stock <= reorder) {
      return AlertTriangle; // Critical - below reorder level
    } else if (stock <= reorder * 1.5) {
      return AlertCircle; // Warning - approaching reorder level
    }
    return CheckCircle; // Good - well above reorder level
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ingredients Directory</h1>
            <p className="text-muted-foreground">
              Manage ingredient inventory and stock levels
            </p>
          </div>
          <Button onClick={handleAddIngredient}>
            <Plus className="w-4 h-4 mr-2" />
            New Ingredient
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ingredients</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIngredients}</div>
              <p className="text-xs text-muted-foreground mt-1">Active ingredients</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Need restocking</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock Units</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStockValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all ingredients</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ingredients</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search ingredients..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8 w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showFilters && (
              <div className="mb-4 p-4 border rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Sort By</Label>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value as any);
                        localStorage.setItem('ingredients_sort_by', e.target.value);
                      }}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    >
                      <option value="id">ID</option>
                      <option value="name">Name</option>
                      <option value="stock">Stock Quantity</option>
                      <option value="reorder">Re-order Level</option>
                    </select>
                  </div>
                  <div>
                    <Label>Sort Order</Label>
                    <select
                      value={sortOrder}
                      onChange={(e) => {
                        setSortOrder(e.target.value as any);
                        localStorage.setItem('ingredients_sort_order', e.target.value);
                      }}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading ingredients...</span>
              </div>
            ) : filteredAndSortedIngredients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No ingredients found matching your search' : 'No ingredients found'}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            const newOrder = sortBy === 'id' && sortOrder === 'desc' ? 'asc' : 'desc';
                            setSortBy('id');
                            setSortOrder(newOrder);
                            localStorage.setItem('ingredients_sort_by', 'id');
                            localStorage.setItem('ingredients_sort_order', newOrder);
                          }}
                        >
                          Ingredient ID
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            const newOrder = sortBy === 'name' && sortOrder === 'desc' ? 'asc' : 'desc';
                            setSortBy('name');
                            setSortOrder(newOrder);
                            localStorage.setItem('ingredients_sort_by', 'name');
                            localStorage.setItem('ingredients_sort_order', newOrder);
                          }}
                        >
                          Ingredient Name
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            const newOrder = sortBy === 'stock' && sortOrder === 'desc' ? 'asc' : 'desc';
                            setSortBy('stock');
                            setSortOrder(newOrder);
                            localStorage.setItem('ingredients_sort_by', 'stock');
                            localStorage.setItem('ingredients_sort_order', newOrder);
                          }}
                        >
                          Stock Quantity
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            const newOrder = sortBy === 'reorder' && sortOrder === 'desc' ? 'asc' : 'desc';
                            setSortBy('reorder');
                            setSortOrder(newOrder);
                            localStorage.setItem('ingredients_sort_by', 'reorder');
                            localStorage.setItem('ingredients_sort_order', newOrder);
                          }}
                        >
                          Re-order Level
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedIngredients.map((ingredient: any) => {
                      const stock = parseFloat(ingredient.stock_quantity) || 0;
                      const reorder = parseFloat(ingredient.re_order_level) || 0;
                      const status = getStockStatus(stock, reorder);
                      
                      return (
                        <TableRow 
                          key={ingredient.ingredient_id || ingredient.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewIngredient(ingredient)}
                        >
                          <TableCell className="font-medium">
                            <Badge variant="outline" className="text-xs font-mono">
                              #{ingredient.ingredient_id || ingredient.id}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{ingredient.ingredient_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{ingredient.unit}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{stock.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {(() => {
                                const ReorderIcon = getReorderLevelIcon(stock, reorder);
                                return <ReorderIcon className="h-3.5 w-3.5 text-muted-foreground" />;
                              })()}
                              <span className="text-muted-foreground">{reorder.toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const StatusIcon = status.icon;
                              return (
                                <Badge variant="outline" className={status.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {status.label}
                                </Badge>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              Used in {ingredient.usage_count || 0} menu item{(ingredient.usage_count || 0) !== 1 ? 's' : ''}
                            </span>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewIngredient(ingredient)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRestockIngredient(ingredient)}>
                                  <PackagePlus className="mr-2 h-4 w-4" />
                                  Restock
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditIngredient(ingredient)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteIngredient(ingredient)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedIngredients.length)} of {filteredAndSortedIngredients.length} ingredients
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-sm">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* View Ingredient Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ingredient Details</DialogTitle>
              <DialogDescription>Complete information about this ingredient</DialogDescription>
            </DialogHeader>
            {selectedIngredient && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Ingredient ID</Label>
                    <p className="font-semibold">#{selectedIngredient.ingredient_id || selectedIngredient.id}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ingredient Name</Label>
                    <p className="font-semibold">{selectedIngredient.ingredient_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Unit</Label>
                    <p className="font-semibold">
                      <Badge variant="outline">{selectedIngredient.unit}</Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Stock Quantity</Label>
                    <p className="font-semibold text-lg">
                      {(parseFloat(selectedIngredient.stock_quantity) || 0).toLocaleString()} {selectedIngredient.unit}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Re-order Level</Label>
                    <div className="mt-1 flex items-center gap-1.5">
                      {(() => {
                        const stock = parseFloat(selectedIngredient.stock_quantity) || 0;
                        const reorder = parseFloat(selectedIngredient.re_order_level) || 0;
                        const ReorderIcon = getReorderLevelIcon(stock, reorder);
                        return (
                          <>
                            <ReorderIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{(parseFloat(selectedIngredient.re_order_level) || 0).toLocaleString()} {selectedIngredient.unit}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Stock Status</Label>
                    <div className="mt-1">
                      {(() => {
                        const stock = parseFloat(selectedIngredient.stock_quantity) || 0;
                        const reorder = parseFloat(selectedIngredient.re_order_level) || 0;
                        const status = getStockStatus(stock, reorder);
                        const StatusIcon = status.icon;
                        return (
                          <Badge variant="outline" className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                
                {selectedIngredient.created_at && (
                  <div className="pt-4 border-t">
                    <Label className="text-xs text-muted-foreground">Created At</Label>
                    <p className="text-sm">{new Date(selectedIngredient.created_at).toLocaleString()}</p>
                  </div>
                )}
                {selectedIngredient.updated_at && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Last Updated</Label>
                    <p className="text-sm">{new Date(selectedIngredient.updated_at).toLocaleString()}</p>
                  </div>
                )}
                
                {/* Menu Items Using This Ingredient */}
                {menuItemsUsingIngredient.length > 0 && (
                  <div className="pt-4 border-t">
                    <Label className="text-xs text-muted-foreground mb-2 block">Used in Menu Items ({menuItemsUsingIngredient.length})</Label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {menuItemsUsingIngredient.map((item: any, idx: number) => (
                        <div key={idx} className="p-2 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{item.menu_name}</p>
                              <p className="text-xs text-muted-foreground">{item.menu_type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{item.quantity_needed} {selectedIngredient.unit}</p>
                              <p className="text-xs text-muted-foreground">
                                Can make: {item.makeable_quantity || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setViewDialogOpen(false);
                handleRestockIngredient(selectedIngredient);
              }}>
                <PackagePlus className="w-4 h-4 mr-2" />
                Restock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Ingredient Dialog */}
        <Dialog open={addDialogOpen || editDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setAddDialogOpen(false);
            setEditDialogOpen(false);
            setFormData({
              ingredient_name: '',
              unit: '',
              stock_quantity: '',
              re_order_level: ''
            });
            setSelectedIngredient(null);
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}</DialogTitle>
              <DialogDescription>
                {selectedIngredient ? 'Update ingredient information' : 'Create a new ingredient'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ingredient_name">Ingredient Name *</Label>
                <Input
                  id="ingredient_name"
                  value={formData.ingredient_name || ''}
                  onChange={(e) => setFormData({ ...formData, ingredient_name: e.target.value })}
                  placeholder="e.g., Flour, Sugar, Salt"
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={formData.unit || ''}
                  onValueChange={(value) => setFormData({ ...formData, unit: value || '' })}
                  disabled={formLoading}
                >
                  <SelectTrigger id="unit" className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a] dark:text-[#e5e5e5]">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a]">
                    <SelectItem value="kg" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">kg (Kilogram)</SelectItem>
                    <SelectItem value="g" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">g (Gram)</SelectItem>
                    <SelectItem value="L" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">L (Liter)</SelectItem>
                    <SelectItem value="ml" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">ml (Milliliter)</SelectItem>
                    <SelectItem value="pieces" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">pieces</SelectItem>
                    <SelectItem value="pcs" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">pcs</SelectItem>
                    <SelectItem value="cup" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">cup</SelectItem>
                    <SelectItem value="tbsp" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">tbsp (Tablespoon)</SelectItem>
                    <SelectItem value="tsp" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">tsp (Teaspoon)</SelectItem>
                    <SelectItem value="oz" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">oz (Ounce)</SelectItem>
                    <SelectItem value="lb" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">lb (Pound)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.stock_quantity || ''}
                  onChange={(e) => {
                    const stockQty = e.target.value;
                    const calculatedReorder = stockQty ? Math.max(1, Math.floor(parseFloat(stockQty) * 0.2)).toString() : '';
                    setFormData({ 
                      ...formData, 
                      stock_quantity: stockQty,
                      re_order_level: calculatedReorder
                    });
                  }}
                  placeholder="0"
                  disabled={formLoading}
                  className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a] dark:text-[#e5e5e5]"
                />
                <p className="text-xs text-muted-foreground">
                  Re-order level will be automatically calculated as 20% of stock quantity
                </p>
                {formData.stock_quantity && !isNaN(parseFloat(formData.stock_quantity)) && (
                  <div className="p-2 bg-muted/50 dark:bg-[#1a1a1a] rounded text-sm">
                    <span className="text-muted-foreground">Calculated Re-order Level: </span>
                    <span className="font-semibold">{Math.max(1, Math.floor(parseFloat(formData.stock_quantity) * 0.2))} {formData.unit || 'units'}</span>
                  </div>
                )}
              </div>
              
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setAddDialogOpen(false);
                  setEditDialogOpen(false);
                  setFormData({
                    ingredient_name: '',
                    unit: '',
                    stock_quantity: '',
                    re_order_level: ''
                  });
                  setSelectedIngredient(null);
                }}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveIngredient} 
                disabled={formLoading}
                className="dark:bg-primary dark:hover:bg-primary/90"
              >
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

        {/* Restock Dialog */}
        <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PackagePlus className="h-5 w-5" />
                Restock Ingredient
              </DialogTitle>
              <DialogDescription>
                Adjust stock quantity for ingredients. Select an ingredient or use the currently selected one.
              </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6 py-4">
              {/* Ingredient Selection List */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Select Ingredient
                </Label>
                <div className="border rounded-lg max-h-[400px] overflow-auto dark:border-[#2a2a2a]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : ingredients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No ingredients found
                          </TableCell>
                        </TableRow>
                      ) : (
                        ingredients.map((ing: any) => {
                          const isSelected = (selectedIngredient?.ingredient_id || selectedIngredient?.id) === (ing.ingredient_id || ing.id);
                          const stockQty = parseFloat(ing.stock_quantity || 0);
                          const reorderLevel = parseFloat(ing.re_order_level || 0);
                          const isLowStock = stockQty <= reorderLevel;
                          const isWarning = stockQty <= reorderLevel * 1.5;
                          
                          return (
                            <TableRow
                              key={ing.ingredient_id || ing.id}
                              onClick={() => {
                                setSelectedIngredient(ing);
                                setRestockAmount('');
                              }}
                              className={`cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'bg-primary/10 dark:bg-primary/20 border-l-2 border-l-primary' 
                                  : 'hover:bg-muted dark:hover:bg-[#1a1a1a]'
                              }`}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  {ing.ingredient_name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold">{stockQty.toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground ml-1">{ing.unit}</span>
                              </TableCell>
                              <TableCell>
                                {isLowStock ? (
                                  <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                    <AlertTriangle className="h-3 w-3" />
                                    Low
                                  </Badge>
                                ) : isWarning ? (
                                  <Badge variant="outline" className="flex items-center gap-1 w-fit bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700">
                                    <AlertCircle className="h-3 w-3" />
                                    Warning
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="flex items-center gap-1 w-fit bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700">
                                    <CheckCircle className="h-3 w-3" />
                                    Good
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Restock Form */}
              <div className="space-y-4">
                {selectedIngredient ? (
                  <>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Info className="h-4 w-4" />
                          Selected Ingredient
                        </Label>
                        <div className="p-3 border rounded-lg bg-muted/50 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{selectedIngredient.ingredient_name}</p>
                              <p className="text-xs text-muted-foreground">ID: #{selectedIngredient.ingredient_id || selectedIngredient.id}</p>
                            </div>
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2">Current Stock</Label>
                        <div className="p-3 border rounded-lg bg-background dark:bg-[#0f0f0f] dark:border-[#2a2a2a]">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold">
                                {(parseFloat(selectedIngredient.stock_quantity) || 0).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">{selectedIngredient.unit}</p>
                            </div>
                            {(() => {
                              const stockQty = parseFloat(selectedIngredient.stock_quantity || 0);
                              const reorderLevel = parseFloat(selectedIngredient.re_order_level || 0);
                              const isLowStock = stockQty <= reorderLevel;
                              const isWarning = stockQty <= reorderLevel * 1.5;
                              
                              if (isLowStock) {
                                return <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />;
                              } else if (isWarning) {
                                return <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
                              } else {
                                return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />;
                              }
                            })()}
                          </div>
                          <div className="mt-2 pt-2 border-t dark:border-[#2a2a2a]">
                            <p className="text-xs text-muted-foreground">
                              Re-order Level: <span className="font-semibold">{parseFloat(selectedIngredient.re_order_level || 0).toLocaleString()} {selectedIngredient.unit}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="restock_amount" className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Adjustment Amount *
                        </Label>
                        <Input
                          id="restock_amount"
                          type="number"
                          value={restockAmount}
                          onChange={(e) => setRestockAmount(e.target.value)}
                          placeholder="+10 or -5"
                          disabled={formLoading}
                          className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a]"
                        />
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Enter positive to increase, negative to decrease stock
                        </p>
                      </div>

                      {restockAmount && !isNaN(parseFloat(restockAmount)) && (
                        <div className="p-4 border rounded-lg bg-muted/50 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
                          <Label className="text-xs text-muted-foreground mb-2 block">New Stock After Adjustment</Label>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold">
                                {Math.max(0, (parseFloat(selectedIngredient.stock_quantity) || 0) + parseFloat(restockAmount)).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">{selectedIngredient.unit}</p>
                            </div>
                            {(() => {
                              const newStock = Math.max(0, (parseFloat(selectedIngredient.stock_quantity) || 0) + parseFloat(restockAmount));
                              const reorderLevel = parseFloat(selectedIngredient.re_order_level || 0);
                              const isLowStock = newStock <= reorderLevel;
                              const isWarning = newStock <= reorderLevel * 1.5;
                              
                              if (isLowStock) {
                                return <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />;
                              } else if (isWarning) {
                                return <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
                              } else {
                                return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />;
                              }
                            })()}
                          </div>
                          {parseFloat(restockAmount) < 0 && Math.max(0, (parseFloat(selectedIngredient.stock_quantity) || 0) + parseFloat(restockAmount)) === 0 && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Warning: This will set stock to zero
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6 border rounded-lg border-dashed dark:border-[#2a2a2a]">
                    <Package className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium mb-1">No Ingredient Selected</p>
                    <p className="text-xs text-muted-foreground">Select an ingredient from the list to restock</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setRestockDialogOpen(false);
                  setRestockAmount('');
                }} 
                disabled={formLoading}
                className="dark:border-[#2a2a2a]"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmRestock} 
                disabled={formLoading || !restockAmount || !selectedIngredient}
                className="dark:bg-primary dark:hover:bg-primary/90"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <PackagePlus className="w-4 h-4 mr-2" />
                    Update Stock
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Ingredient</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedIngredient?.ingredient_name}"? This action cannot be undone.
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

export default Ingredients;

