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
  Info,
  Warehouse,
  Scale,
  ChevronUp,
  ChevronDown,
  Utensils
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
    re_order_level: '',
    restock_priority: '3' // Default to medium priority (3)
  });
  const [restockAmount, setRestockAmount] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Fetch ingredients from backend
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        const response: any = await ingredientsAPI.getAll();
        if (response && response.success && response.data) {
          setIngredients(response.data || []);
        } else if (response && response.data) {
          setIngredients(response.data || []);
        } else if (Array.isArray(response)) {
          setIngredients(response);
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
      console.log('Menu items response:', response); // Debug log
      if (response && response.data) {
        if (response.data.success && response.data.data) {
          const menuItems = response.data.data.menu_items || [];
          console.log('Menu items found:', menuItems); // Debug log
          setMenuItemsUsingIngredient(menuItems);
        } else if (response.data.menu_items) {
          // Fallback for different response structure
          setMenuItemsUsingIngredient(response.data.menu_items);
        } else {
          setMenuItemsUsingIngredient([]);
        }
      } else {
        setMenuItemsUsingIngredient([]);
      }
    } catch (error: any) {
      console.error('Error fetching menu items:', error);
      console.error('Error details:', error.response?.data); // Debug log
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
    // Calculate restock threshold from priority (if re_order_level exists, derive priority)
    // Priority mapping: 1=5%, 2=10%, 3=15%, 4=20%, 5=25%
    const currentReorder = parseFloat(ingredient.re_order_level || '0');
    const currentStock = parseFloat(stockQty || '0');
    let priority = '3'; // Default
    if (currentStock > 0 && currentReorder > 0) {
      const percentage = (currentReorder / currentStock) * 100;
      if (percentage <= 5) priority = '1';
      else if (percentage <= 10) priority = '2';
      else if (percentage <= 15) priority = '3';
      else if (percentage <= 20) priority = '4';
      else priority = '5';
    }
    
    // Normalize unit to ensure consistency
    const normalizedUnit = formatUnit(ingredient.unit || '');
    setFormData({
      ingredient_name: ingredient.ingredient_name || '',
      unit: normalizedUnit, // Use normalized unit
      stock_quantity: stockQty,
      re_order_level: currentReorder.toString(),
      restock_priority: priority
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
      // Calculate restock threshold based on priority (1-5)
      // Priority 1 = 5%, Priority 2 = 10%, Priority 3 = 15%, Priority 4 = 20%, Priority 5 = 25%
      const stockQty = parseFloat(formData.stock_quantity);
      const priority = parseInt(formData.restock_priority || '3');
      const priorityPercentages: Record<number, number> = {
        1: 0.05,  // 5% - Critical (restock early)
        2: 0.10,  // 10% - High
        3: 0.15,  // 15% - Medium (default)
        4: 0.20,  // 20% - Low
        5: 0.25   // 25% - Very Low (can wait longer)
      };
      const percentage = priorityPercentages[priority] || 0.15;
      const calculatedReorderLevel = Math.max(1, Math.floor(stockQty * percentage));
      
      // Normalize unit to ensure consistency
      const normalizedUnit = formatUnit(formData.unit.trim());
      
      const data = {
        ingredient_name: formData.ingredient_name.trim(),
        unit: normalizedUnit, // Use normalized unit for consistency
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
      const response: any = await ingredientsAPI.getAll();
      if (response && response.success && response.data) {
        setIngredients(response.data || []);
      } else if (response && response.data) {
        setIngredients(response.data || []);
      } else if (Array.isArray(response)) {
        setIngredients(response);
      }
      
      // Reset form
      setFormData({
        ingredient_name: '',
        unit: '',
        stock_quantity: '',
        re_order_level: '',
        restock_priority: '3' // Reset to default medium priority
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
      const response: any = await ingredientsAPI.getAll();
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
      const response: any = await ingredientsAPI.getAll();
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
      re_order_level: '',
      restock_priority: '3' // Default to medium priority
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

  // Get restock threshold icon based on stock status
  const getReorderLevelIcon = (stock: number, reorder: number) => {
    if (stock <= reorder) {
      return AlertTriangle; // Critical - below restock threshold
    } else if (stock <= reorder * 1.5) {
      return AlertCircle; // Warning - approaching restock threshold
    }
    return CheckCircle; // Good - well above restock threshold
  };

  // Get priority level and description from threshold value
  const getPriorityFromThreshold = (stock: number, threshold: number) => {
    if (stock <= 0 || threshold <= 0) {
      return { level: 3, label: 'Medium', percentage: '15%', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700', icon: Info };
    }
    
    const percentage = (threshold / stock) * 100;
    
    if (percentage <= 5) {
      return { level: 1, label: 'Critical', percentage: '5%', color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700', icon: AlertTriangle };
    } else if (percentage <= 10) {
      return { level: 2, label: 'High', percentage: '10%', color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700', icon: AlertCircle };
    } else if (percentage <= 15) {
      return { level: 3, label: 'Medium', percentage: '15%', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700', icon: Info };
    } else if (percentage <= 20) {
      return { level: 4, label: 'Low', percentage: '20%', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700', icon: CheckCircle };
    } else {
      return { level: 5, label: 'Very Low', percentage: '25%', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700', icon: CheckCircle };
    }
  };

  // Format unit for consistent display - ensures input and output match exactly
  const formatUnit = (unit: string): string => {
    if (!unit) return '';
    // Normalize unit to lowercase for comparison, but preserve standard case for display
    const normalizedUnit = unit.trim().toLowerCase();
    // Map of normalized unit values to standard display format
    const unitMap: Record<string, string> = {
      'kg': 'kg',
      'g': 'g',
      'l': 'L',
      'liter': 'L',
      'liters': 'L',
      'ml': 'ml',
      'milliliter': 'ml',
      'milliliters': 'ml',
      'pieces': 'pieces',
      'piece': 'pieces',
      'pcs': 'pcs',
      'pc': 'pcs',
      'cup': 'cup',
      'cups': 'cup',
      'tbsp': 'tbsp',
      'tablespoon': 'tbsp',
      'tablespoons': 'tbsp',
      'tsp': 'tsp',
      'teaspoon': 'tsp',
      'teaspoons': 'tsp',
      'oz': 'oz',
      'ounce': 'oz',
      'ounces': 'oz',
      'lb': 'lb',
      'pound': 'lb',
      'pounds': 'lb'
    };
    // Return standardized format if found in map
    if (unitMap[normalizedUnit]) {
      return unitMap[normalizedUnit];
    }
    // If it contains parentheses, extract the short form
    const match = unit.match(/^(\w+)\s*\(/);
    if (match) {
      const extracted = match[1].toLowerCase();
      if (unitMap[extracted]) {
        return unitMap[extracted];
      }
      return match[1];
    }
    // Otherwise return trimmed original
    return unit.trim();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              Ingredients Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage ingredient inventory, track stock levels, and monitor usage across menu items
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
              <div className="space-y-2">
                <div className="text-2xl font-bold">{totalIngredients}</div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Unique ingredients currently tracked in your inventory system
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-muted-foreground">All active and monitored</span>
                  </div>
                  <div className="pt-1 border-t">
                    <p className="text-[10px] text-muted-foreground">
                      Used across {ingredients.reduce((sum: number, ing: any) => sum + (ing.usage_count || 0), 0)} menu item recipes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Ingredients at or below restock threshold
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                    <span className="text-muted-foreground">Require immediate restocking</span>
                  </div>
                  <div className="pt-1 border-t">
                    <p className="text-[10px] text-muted-foreground">
                      {lowStockCount > 0 
                        ? `${((lowStockCount / totalIngredients) * 100).toFixed(1)}% of total inventory`
                        : 'All items are well-stocked'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock Units</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{totalStockValue.toLocaleString()}</div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Combined stock quantity across all ingredient types
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-muted-foreground">Aggregate inventory volume</span>
                  </div>
                  <div className="pt-1 border-t">
                    <p className="text-[10px] text-muted-foreground">
                      Average: {(totalIngredients > 0 ? (totalStockValue / totalIngredients).toFixed(1) : 0)} units per ingredient
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-muted-foreground" />
                  Ingredients Directory
                </CardTitle>
                <CardDescription className="mt-1">
                  View and manage all ingredients in your inventory
                </CardDescription>
              </div>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSortBy('id');
                    setSortOrder('desc');
                    setCurrentPage(1);
                    localStorage.setItem('ingredients_sort_by', 'id');
                    localStorage.setItem('ingredients_sort_order', 'desc');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showFilters && (
              <div className="mb-4 p-4 border rounded-lg space-y-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Filter & Sort Options</Label>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Sort By</Label>
                    <Select
                      value={sortBy}
                      onValueChange={(value: any) => {
                        setSortBy(value);
                        localStorage.setItem('ingredients_sort_by', value);
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            ID
                          </div>
                        </SelectItem>
                        <SelectItem value="name">
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3 text-primary" />
                            Name
                          </div>
                        </SelectItem>
                        <SelectItem value="stock">
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-3 w-3 text-green-600 dark:text-green-400" />
                            Stock Quantity
                          </div>
                        </SelectItem>
                        <SelectItem value="reorder">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                            Restock Threshold
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Sort Order</Label>
                    <Button
                      variant="outline"
                      className="w-full mt-1"
                      onClick={() => {
                        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                        setSortOrder(newOrder);
                        localStorage.setItem('ingredients_sort_order', newOrder);
                      }}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                      {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                    </Button>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSortBy('id');
                      setSortOrder('desc');
                      setCurrentPage(1);
                      localStorage.setItem('ingredients_sort_by', 'id');
                      localStorage.setItem('ingredients_sort_order', 'desc');
                    }}
                    className="text-xs"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            )}

            <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient ID</TableHead>
                      <TableHead>Ingredient Name</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Stock Quantity</TableHead>
                      <TableHead>Restock Threshold</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                          <p className="text-sm text-muted-foreground mt-2">Loading ingredients...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredAndSortedIngredients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-sm text-muted-foreground">No ingredients found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedIngredients.map((ingredient: any) => {
                        const stock = parseFloat(ingredient.stock_quantity) || 0;
                        const reorder = parseFloat(ingredient.re_order_level) || 0;
                        const status = getStockStatus(stock, reorder);
                        
                        return (
                          <TableRow 
                            key={ingredient.ingredient_id || ingredient.id}
                            onClick={() => handleViewIngredient(ingredient)}
                            style={{ cursor: 'pointer' }}
                          >
                          <TableCell className="font-medium">
                            <Badge variant="outline" className="text-xs font-mono flex items-center gap-1 w-fit bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                              <Package className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              #{ingredient.ingredient_id || ingredient.id}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-primary" />
                              {ingredient.ingredient_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                              <Scale className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                              <span className="font-medium text-purple-700 dark:text-purple-300">{formatUnit(ingredient.unit)}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Warehouse className={`h-4 w-4 ${stock > reorder * 1.5 ? 'text-green-600 dark:text-green-400' : stock > reorder ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`} />
                              <span className="font-semibold">{stock.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground">{formatUnit(ingredient.unit)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const threshold = parseFloat(ingredient.re_order_level) || 0;
                              const priority = getPriorityFromThreshold(stock, threshold);
                              const PriorityIcon = priority.icon;
                              return (
                                <div className="flex flex-col gap-1">
                                  <Badge variant="outline" className={`${priority.color} flex items-center gap-1 w-fit text-xs`}>
                                    <PriorityIcon className="h-3 w-3" />
                                    Priority {priority.level} - {priority.label}
                                  </Badge>
                                  <div className="text-xs text-muted-foreground">
                                    {threshold.toLocaleString()} {formatUnit(ingredient.unit)} ({priority.percentage})
                                  </div>
                                </div>
                              );
                            })()}
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
                            <div className="flex items-center gap-2">
                              <Utensils className={`h-3.5 w-3.5 ${(ingredient.usage_count || 0) > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`} />
                              <span className={`text-sm ${(ingredient.usage_count || 0) > 0 ? 'font-medium text-orange-700 dark:text-orange-300' : 'text-muted-foreground'}`}>
                                {ingredient.usage_count || 0} menu item{(ingredient.usage_count || 0) !== 1 ? 's' : ''}
                              </span>
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
                    })
                    )}
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
          </CardContent>
        </Card>

        {/* View Ingredient Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Ingredient Details
              </DialogTitle>
              <DialogDescription>Complete information about this ingredient and its usage in menu items</DialogDescription>
            </DialogHeader>
            {selectedIngredient && (
              <div className="space-y-6 py-4">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Ingredient ID</Label>
                        <p className="font-semibold">#{selectedIngredient.ingredient_id || selectedIngredient.id}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Ingredient Name</Label>
                        <p className="font-semibold text-lg">{selectedIngredient.ingredient_name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Unit</Label>
                        <div className="font-semibold">
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <Scale className="h-3 w-3" />
                            {formatUnit(selectedIngredient.unit)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Stock Quantity</Label>
                        <p className="font-semibold text-lg">
                          {(parseFloat(selectedIngredient.stock_quantity) || 0).toLocaleString()} {formatUnit(selectedIngredient.unit)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Restock Priority</Label>
                        <div className="mt-1">
                          {(() => {
                            const stock = parseFloat(selectedIngredient.stock_quantity) || 0;
                            const threshold = parseFloat(selectedIngredient.re_order_level) || 0;
                            const priority = getPriorityFromThreshold(stock, threshold);
                            const PriorityIcon = priority.icon;
                            return (
                              <div className="space-y-2">
                                <Badge variant="outline" className={`${priority.color} flex items-center gap-1.5 w-fit text-sm px-3 py-1`}>
                                  <PriorityIcon className="h-4 w-4" />
                                  Priority {priority.level} - {priority.label}
                                </Badge>
                                <div className="text-sm">
                                  <p className="font-semibold">Threshold: {threshold.toLocaleString()} {formatUnit(selectedIngredient.unit)}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Restock when stock falls below {priority.percentage} of current stock ({threshold.toLocaleString()} {formatUnit(selectedIngredient.unit)})
                                  </p>
                                </div>
                              </div>
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
                    
                    {(selectedIngredient.created_at || selectedIngredient.updated_at) && (
                      <div className="pt-4 mt-4 border-t">
                        <div className="grid grid-cols-2 gap-4">
                          {selectedIngredient.created_at && (
                            <div>
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
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Menu Items Using This Ingredient */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-primary" />
                        Menu Items Using This Ingredient
                      </CardTitle>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-sm px-3 py-1">
                        {menuItemsUsingIngredient.length} {menuItemsUsingIngredient.length === 1 ? 'menu item' : 'menu items'}
                      </Badge>
                    </div>
                    <CardDescription>
                      List of all menu items that include this ingredient in their recipes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {menuItemsUsingIngredient.length > 0 ? (
                      <div className="space-y-3">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Menu Item Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Quantity Needed</TableHead>
                              <TableHead>Makeable Quantity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {menuItemsUsingIngredient.map((item: any, idx: number) => (
                              <TableRow key={item.menu_item_id || idx} className="hover:bg-muted/50">
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Utensils className="h-4 w-4 text-primary" />
                                    {item.menu_name}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {item.menu_type}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-semibold">{item.quantity_needed}</span>
                                    <span className="text-xs text-muted-foreground">{formatUnit(selectedIngredient.unit)}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {item.makeable_quantity !== null && item.makeable_quantity !== undefined ? (
                                    <div className="flex items-center gap-1">
                                      <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                      <span className="font-semibold">{item.makeable_quantity || 0}</span>
                                      <span className="text-xs text-muted-foreground">servings</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">N/A</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="p-8 border rounded-lg border-dashed text-center bg-muted/30">
                        <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium text-muted-foreground mb-1">No menu items use this ingredient</p>
                        <p className="text-xs text-muted-foreground">This ingredient is not currently used in any menu item recipes</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
              re_order_level: '',
              restock_priority: '3'
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
                <Label htmlFor="unit" className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  Unit *
                </Label>
                <Select
                  value={formData.unit || ''}
                  onValueChange={(value) => {
                    // Normalize the unit value when selected to ensure consistency
                    const normalized = formatUnit(value || '');
                    setFormData({ ...formData, unit: normalized });
                  }}
                  disabled={formLoading}
                >
                  <SelectTrigger id="unit" className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a] dark:text-[#e5e5e5]">
                    <SelectValue placeholder="Select unit">
                      {formData.unit ? (
                        <div className="flex items-center gap-2">
                          <Scale className="h-3 w-3" />
                          {formatUnit(formData.unit)}
                        </div>
                      ) : (
                        'Select unit'
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a]">
                    <SelectItem value="kg" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <Scale className="h-3 w-3" />
                        kg
                      </div>
                    </SelectItem>
                    <SelectItem value="g" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <Scale className="h-3 w-3" />
                        g
                      </div>
                    </SelectItem>
                    <SelectItem value="L" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <Scale className="h-3 w-3" />
                        L
                      </div>
                    </SelectItem>
                    <SelectItem value="ml" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <Scale className="h-3 w-3" />
                        ml
                      </div>
                    </SelectItem>
                    <SelectItem value="pieces" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <Package className="h-3 w-3" />
                        pieces
                      </div>
                    </SelectItem>
                    <SelectItem value="pcs" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <Package className="h-3 w-3" />
                        pcs
                      </div>
                    </SelectItem>
                    <SelectItem value="cup" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <Scale className="h-3 w-3" />
                        cup
                      </div>
                    </SelectItem>
                    <SelectItem value="tbsp" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <Scale className="h-3 w-3" />
                        tbsp
                      </div>
                    </SelectItem>
                    <SelectItem value="tsp" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <Scale className="h-3 w-3" />
                        tsp
                      </div>
                    </SelectItem>
                    <SelectItem value="oz" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <Scale className="h-3 w-3" />
                        oz
                      </div>
                    </SelectItem>
                    <SelectItem value="lb" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <Scale className="h-3 w-3" />
                        lb
                      </div>
                    </SelectItem>
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
                    setFormData({ 
                      ...formData, 
                      stock_quantity: stockQty
                    });
                  }}
                  placeholder="0"
                  disabled={formLoading}
                  className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a] dark:text-[#e5e5e5]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restock_priority" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  Restock Priority *
                </Label>
                <Select
                  value={formData.restock_priority || '3'}
                  onValueChange={(value) => {
                    setFormData({ ...formData, restock_priority: value });
                  }}
                  disabled={formLoading}
                >
                  <SelectTrigger id="restock_priority" className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a] dark:text-[#e5e5e5]">
                    <SelectValue placeholder="Select priority">
                      {formData.restock_priority ? (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3" />
                          Priority {formData.restock_priority} - {
                            formData.restock_priority === '1' ? 'Critical (5%)' :
                            formData.restock_priority === '2' ? 'High (10%)' :
                            formData.restock_priority === '3' ? 'Medium (15%)' :
                            formData.restock_priority === '4' ? 'Low (20%)' :
                            'Very Low (25%)'
                          }
                        </div>
                      ) : (
                        'Select priority'
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a]">
                    <SelectItem value="1" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        Priority 1 - Critical (5%) - Restock early
                      </div>
                    </SelectItem>
                    <SelectItem value="2" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-orange-600" />
                        Priority 2 - High (10%)
                      </div>
                    </SelectItem>
                    <SelectItem value="3" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <Info className="h-3 w-3 text-blue-600" />
                        Priority 3 - Medium (15%) - Default
                      </div>
                    </SelectItem>
                    <SelectItem value="4" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-yellow-600" />
                        Priority 4 - Low (20%)
                      </div>
                    </SelectItem>
                    <SelectItem value="5" className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Priority 5 - Very Low (25%) - Can wait longer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select how critical this ingredient is. Lower priority numbers mean restock earlier (at higher stock levels).
                </p>
                {formData.stock_quantity && !isNaN(parseFloat(formData.stock_quantity)) && formData.restock_priority && (
                  <div className="p-2 bg-muted/50 dark:bg-[#1a1a1a] rounded text-sm">
                    <span className="text-muted-foreground">Calculated Restock Threshold: </span>
                    <span className="font-semibold">
                      {(() => {
                        const stockQty = parseFloat(formData.stock_quantity);
                        const priority = parseInt(formData.restock_priority || '3');
                        const priorityPercentages: Record<number, number> = {
                          1: 0.05, 2: 0.10, 3: 0.15, 4: 0.20, 5: 0.25
                        };
                        const percentage = priorityPercentages[priority] || 0.15;
                        return Math.max(1, Math.floor(stockQty * percentage));
                      })()} {formatUnit(formData.unit) || 'units'}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({parseInt(formData.restock_priority || '3') === 1 ? '5%' :
                        parseInt(formData.restock_priority || '3') === 2 ? '10%' :
                        parseInt(formData.restock_priority || '3') === 3 ? '15%' :
                        parseInt(formData.restock_priority || '3') === 4 ? '20%' : '25%'} of stock)
                    </span>
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
                    re_order_level: '',
                    restock_priority: '3'
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
                              <p className="text-xs text-muted-foreground">{formatUnit(selectedIngredient.unit)}</p>
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
                            {(() => {
                              const currentStock = parseFloat(selectedIngredient.stock_quantity || 0);
                              const threshold = parseFloat(selectedIngredient.re_order_level || 0);
                              const priority = getPriorityFromThreshold(currentStock, threshold);
                              const PriorityIcon = priority.icon;
                              return (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={`${priority.color} flex items-center gap-1 text-xs`}>
                                      <PriorityIcon className="h-3 w-3" />
                                      Priority {priority.level} - {priority.label}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Restock Threshold: <span className="font-semibold">{threshold.toLocaleString()} {formatUnit(selectedIngredient.unit)}</span> ({priority.percentage} of stock)
                                  </p>
                                </div>
                              );
                            })()}
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
                              <p className="text-xs text-muted-foreground">{formatUnit(selectedIngredient.unit)}</p>
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

