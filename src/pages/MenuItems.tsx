import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Utensils, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  ArrowUpDown,
  X,
  ChefHat,
  List,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Package,
  Loader2,
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
import { menuItemsAPI, dietaryRestrictionsAPI, ingredientsAPI } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { useCurrencyFormat } from '@/utils/currency';
import { getTypeIcon, getTypeColor, getNoneRestrictionBadge, isNoneRestriction } from '@/utils/restrictionUtils';
import { getMenuTypeIcon, getMenuTypeColor } from '@/utils/menuTypeUtils';
import { Checkbox } from '@/components/ui/checkbox';

const MenuItems = () => {
  const { formatCurrency } = useCurrencyFormat();
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
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  
  // Form states
  const [formData, setFormData] = useState({
    menu_name: '',
    menu_cost: '',
    menu_price: '',
    menu_type: '',
    restriction_ids: [] as number[]
  });
  const [recipe, setRecipe] = useState<Array<{ingredient_id: number; quantity: number}>>([]);
  const [defaultMarkup, setDefaultMarkup] = useState(200); // 200% markup default
  const [formLoading, setFormLoading] = useState(false);

  // Fetch dietary restrictions
  useEffect(() => {
    const fetchRestrictions = async () => {
      try {
        const response: any = await dietaryRestrictionsAPI.getAll();
        if (response && response.success && response.data) {
          setDietaryRestrictions(response.data || []);
        } else if (response && response.data) {
          setDietaryRestrictions(response.data || []);
        } else if (Array.isArray(response)) {
          setDietaryRestrictions(response);
        }
      } catch (error) {
        console.error('Error fetching dietary restrictions:', error);
      }
    };
    fetchRestrictions();
  }, []);

  // Fetch ingredients when dialog opens
  useEffect(() => {
    const fetchIngredients = async () => {
      if (addDialogOpen || editDialogOpen) {
        try {
          const response: any = await ingredientsAPI.getAll();
          if (response && response.success && response.data) {
            setAvailableIngredients(response.data || []);
          } else if (response && response.data) {
            setAvailableIngredients(response.data || []);
          } else if (Array.isArray(response)) {
            setAvailableIngredients(response);
          }
        } catch (error) {
          console.error('Error fetching ingredients:', error);
        }
      }
    };
    fetchIngredients();
  }, [addDialogOpen, editDialogOpen]);

  // Fetch menu items from backend
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response: any = await menuItemsAPI.getAll({});
        if (response && response.success && response.data) {
          // Transform data to match UI expectations
          const items = response.data.map((item: any) => ({
            id: item.menu_item_id,
            menu_item_id: item.menu_item_id,
            menu_name: item.menu_name,
            menu_cost: parseFloat(item.unit_cost || item.menu_cost) || 0,
            menu_price: parseFloat(item.selling_price || item.menu_price) || 0,
            unit_cost: parseFloat(item.unit_cost) || 0,
            selling_price: parseFloat(item.selling_price) || 0,
            menu_type: item.menu_type,
            makeable_quantity: item.makeable_quantity ?? 0,
            restriction_id: item.restriction_id,
            restriction_name: item.restriction_name,
            restrictions: item.restrictions || (item.restriction_name ? [{
              restriction_id: item.restriction_id,
              restriction_name: item.restriction_name,
              restriction_type: item.restriction_type || 'Dietary'
            }] : []),
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
            menu_cost: parseFloat(item.unit_cost || item.menu_cost) || 0,
            menu_price: parseFloat(item.selling_price || item.menu_price) || 0,
            unit_cost: parseFloat(item.unit_cost) || 0,
            selling_price: parseFloat(item.selling_price) || 0,
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
      const response: any = await menuItemsAPI.getById(itemId);
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
    try {
      // Fetch full item details to get all restrictions
      const response: any = await menuItemsAPI.getById(item.menu_item_id || item.id);
      if (response && response.success && response.data) {
        const fullItem = {
          ...response.data,
          unit_cost: parseFloat(response.data.unit_cost || response.data.menu_cost || 0),
          selling_price: parseFloat(response.data.selling_price || response.data.menu_price || 0),
          menu_cost: parseFloat(response.data.unit_cost || response.data.menu_cost || 0),
          menu_price: parseFloat(response.data.selling_price || response.data.menu_price || 0),
          restrictions: response.data.restrictions || (response.data.restriction_name ? [{
            restriction_id: response.data.restriction_id,
            restriction_name: response.data.restriction_name,
            restriction_type: response.data.restriction_type || 'Dietary'
          }] : [])
        };
        setSelectedItem(fullItem);
        await fetchItemRecipe(item.menu_item_id || item.id);
      } else {
        setSelectedItem(item);
        await fetchItemRecipe(item.menu_item_id || item.id);
      }
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching menu item details:', error);
      setSelectedItem(item);
      await fetchItemRecipe(item.menu_item_id || item.id);
      setViewDialogOpen(true);
    }
  };
  
  // Handle delete item
  const handleDeleteItem = (item: any) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };
  
  // Helper to add ingredient to recipe
  const handleAddIngredientToRecipe = (ingredientId: number) => {
    const ingredient = availableIngredients.find(ing => 
      (ing.ingredient_id || ing.id) === ingredientId
    );
    if (!ingredient) return;
    
    // Check if already in recipe
    if (recipe.some(r => r.ingredient_id === ingredientId)) {
      return;
    }
    
    setRecipe([...recipe, {
      ingredient_id: ingredientId,
      quantity: 1
    }]);
  };

  // Helper to remove ingredient from recipe
  const handleRemoveIngredientFromRecipe = (ingredientId: number) => {
    setRecipe(recipe.filter(r => r.ingredient_id !== ingredientId));
  };

  // Helper to update ingredient quantity in recipe
  const handleUpdateRecipeQuantity = (ingredientId: number, quantity: number) => {
    setRecipe(recipe.map(r => 
      r.ingredient_id === ingredientId 
        ? { ...r, quantity: Math.max(0.01, quantity) }
        : r
    ));
  };

  // Calculate cost from recipe ingredients
  const calculatedCostFromIngredients = useMemo(() => {
    if (recipe.length === 0) return 0;
    return recipe.reduce((total, recipeItem) => {
      const ingredient = availableIngredients.find(ing => 
        (ing.ingredient_id || ing.id) === recipeItem.ingredient_id
      );
      if (!ingredient) return total;
      const ingredientCost = parseFloat(ingredient.unit_cost || 0);
      return total + (ingredientCost * recipeItem.quantity);
    }, 0);
  }, [recipe, availableIngredients]);

  // Calculate suggested price based on cost and markup
  const suggestedPrice = useMemo(() => {
    const cost = parseFloat(formData.menu_cost) || calculatedCostFromIngredients || 0;
    return cost * (1 + defaultMarkup / 100);
  }, [formData.menu_cost, calculatedCostFromIngredients, defaultMarkup]);

  // Update form cost when recipe changes
  useEffect(() => {
    if (calculatedCostFromIngredients > 0 && !selectedItem) {
      // Auto-update cost when recipe changes (only for new items)
      setFormData(prev => ({
        ...prev,
        menu_cost: calculatedCostFromIngredients.toFixed(2)
      }));
    }
  }, [calculatedCostFromIngredients, selectedItem]);

  // Handle add item
  const handleAddItem = () => {
    setFormData({
      menu_name: '',
      menu_cost: '',
      menu_price: '',
      menu_type: '',
      restriction_ids: []
    });
    setRecipe([]);
    setDefaultMarkup(200);
    setSelectedItem(null);
    setAddDialogOpen(true);
  };
  
  // Handle edit item - load recipe
  const handleEditItem = async (item: any) => {
    setSelectedItem(item);
    // Load restriction IDs from restrictions array if available, otherwise from single restriction_id
    const restrictionIds = item.restrictions && Array.isArray(item.restrictions) && item.restrictions.length > 0
      ? item.restrictions.map((r: any) => r.restriction_id).filter((id: any) => id != null)
      : item.restriction_id ? [item.restriction_id] : [];
    
    setFormData({
      menu_name: item.menu_name || '',
      menu_cost: (item.unit_cost || item.menu_cost || 0).toString(),
      menu_price: (item.selling_price || item.menu_price || 0).toString(),
      menu_type: item.menu_type || '',
      restriction_ids: restrictionIds
    });
    setDefaultMarkup(item.default_markup_percentage || 200);
    
    // Fetch recipe for this item
    try {
      const response: any = await menuItemsAPI.getById(item.menu_item_id || item.id);
      if (response && response.success && response.data && response.data.recipe) {
        const recipeData = response.data.recipe.map((r: any) => ({
          ingredient_id: r.ingredient_id,
          quantity: parseFloat(r.quantity_needed || r.quantity || 0)
        }));
        setRecipe(recipeData);
      } else {
        setRecipe([]);
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setRecipe([]);
    }
    
    setEditDialogOpen(true);
  };
  
  // Save menu item (create or update)
  const handleSaveItem = async () => {
    // Validation
    if (!formData.menu_name || !formData.menu_type) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in menu name and type',
        variant: 'destructive'
      });
      return;
    }

    // Require at least one ingredient for new items
    if (!selectedItem && recipe.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one ingredient for this menu item',
        variant: 'destructive'
      });
      return;
    }

    // Calculate cost from recipe ingredients
    let calculatedCost = calculatedCostFromIngredients;
    
    // If cost is manually entered and different from calculated, use manual cost
    const manualCost = parseFloat(formData.menu_cost) || 0;
    if (manualCost > 0 && Math.abs(manualCost - calculatedCost) > 0.01) {
      calculatedCost = manualCost;
    }
    
    if (calculatedCost <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please ensure ingredients have costs or enter a valid cost for this menu item',
        variant: 'destructive'
      });
      return;
    }
    
    setFormLoading(true);
    try {
      // Parse price - use form value if provided and valid, otherwise use suggested price
      const priceValue = formData.menu_price && formData.menu_price.trim() !== '' 
        ? parseFloat(formData.menu_price) 
        : suggestedPrice;
      
      // Ensure price is valid
      if (!priceValue || isNaN(priceValue) || priceValue <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid selling price',
          variant: 'destructive'
        });
        setFormLoading(false);
        return;
      }
      
      // Filter out None restriction (ID 1) if present and convert to array format
      const restrictionIds = formData.restriction_ids.filter(id => id !== 1);
      
      const data: any = {
        menu_name: formData.menu_name,
        unit_cost: calculatedCost,
        selling_price: priceValue,
        menu_type: formData.menu_type,
        restriction_ids: restrictionIds.length > 0 ? restrictionIds : null,
        default_markup_percentage: defaultMarkup,
        recipe: recipe // Send recipe data
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
      const response: any = await menuItemsAPI.getAll({});
      if (response && response.success && response.data) {
        const items = response.data.map((item: any) => ({
          id: item.menu_item_id,
          menu_item_id: item.menu_item_id,
          menu_name: item.menu_name,
          menu_cost: parseFloat(item.unit_cost || item.menu_cost) || 0,
          menu_price: parseFloat(item.selling_price || item.menu_price) || 0,
          unit_cost: parseFloat(item.unit_cost) || 0,
          selling_price: parseFloat(item.selling_price) || 0,
          menu_type: item.menu_type,
          makeable_quantity: item.makeable_quantity ?? 0,
          restriction_id: item.restriction_id,
          restriction_name: item.restriction_name,
          restrictions: item.restrictions || (item.restriction_name ? [{
            restriction_id: item.restriction_id,
            restriction_name: item.restriction_name,
            restriction_type: item.restriction_type || 'Dietary'
          }] : []),
          profit_margin: parseFloat(item.profit_margin) || 0,
          is_template: true,
          usage_count: item.usage_count || 0
        }));
        setMenuItems(items);
      }
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || error.message || 'Failed to save menu item. Please check all required fields.',
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  // Delete menu item
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    
    const menuItemId = selectedItem.menu_item_id || selectedItem.id;
    if (!menuItemId) {
      toast({
        title: 'Error',
        description: 'Invalid menu item ID',
        variant: 'destructive'
      });
      return;
    }
    
    setFormLoading(true);
    try {
      const deleteResponse = await menuItemsAPI.delete(menuItemId);
      
      // Check if the response indicates success
      if (deleteResponse?.data?.success !== false) {
        toast({ title: 'Success', description: 'Menu item deleted successfully' });
        setDeleteDialogOpen(false);
        setSelectedItem(null);
        
        // Refresh menu items
        const response: any = await menuItemsAPI.getAll({});
        if (response && response.data) {
          const items = Array.isArray(response.data) 
            ? response.data 
            : (response.data.data || []);
          
          const mappedItems = items.map((item: any) => ({
            id: item.menu_item_id,
            menu_item_id: item.menu_item_id,
            menu_name: item.menu_name,
            menu_cost: parseFloat(item.unit_cost || item.menu_cost) || 0,
            menu_price: parseFloat(item.selling_price || item.menu_price) || 0,
            menu_type: item.menu_type,
            makeable_quantity: item.makeable_quantity ?? 0,
            restriction_id: item.restriction_id,
            restriction_name: item.restriction_name,
            profit_margin: parseFloat(item.profit_margin) || 0,
            is_template: true,
            usage_count: item.usage_count || 0
          }));
          setMenuItems(mappedItems);
        }
      } else {
        throw new Error(deleteResponse?.data?.error || 'Delete failed');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message 
        || 'Failed to delete menu item';
      toast({
        title: 'Error',
        description: errorMessage,
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
      return <Badge variant="destructive" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700 border text-[10px] px-1.5 py-0.5 h-5">Cannot Make</Badge>;
    } else if (qty < 10) {
      return <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700 border text-[10px] px-1.5 py-0.5 h-5">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 border text-[10px] px-1.5 py-0.5 h-5">In Stock</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const Icon = getMenuTypeIcon(type);
    const colorClass = getMenuTypeColor(type);
    return (
      <Badge className={`${colorClass} border flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {type}
      </Badge>
    );
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
          aVal = a.selling_price || a.menu_price || 0;
          bVal = b.selling_price || b.menu_price || 0;
          break;
        case 'cost':
          aVal = a.unit_cost || a.menu_cost || 0;
          bVal = b.unit_cost || b.menu_cost || 0;
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
  }, [searchTerm, filterType, sortBy, sortOrder]);

  const currentItems = menuItems;
  
  // Updated statistics - more relevant to menu items
  const totalItems = currentItems.length;
  const averagePrice = currentItems.length > 0 
    ? currentItems.reduce((sum, item) => sum + (item.selling_price || item.menu_price || 0), 0) / currentItems.length 
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

        {/* Menu Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Items Directory</CardTitle>
            <CardDescription>
              Template library - Default menu items available to all weddings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Selling Price</TableHead>
                      <TableHead className="text-right">Profit Margin</TableHead>
                      <TableHead>Makeable Qty</TableHead>
                      <TableHead>Restrictions</TableHead>
                      <TableHead>Usage</TableHead>
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
                        <TableRow 
                          key={item.id || item.menu_item_id} 
                          className={item.is_template ? 'bg-muted/30' : ''}
                          onClick={() => handleViewItem(item)}
                          style={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              #{item.menu_item_id || item.id}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            <span className="truncate">{item.menu_name}</span>
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(item.menu_type)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm font-medium">
                              {formatCurrency(item.unit_cost || item.menu_cost || 0)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm font-medium">
                              {formatCurrency(item.selling_price || item.menu_price || 0)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              {formatCurrency(item.profit_margin || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium w-12 text-right inline-block">{item.makeable_quantity ?? 0}</span>
                              {getMakeableStatus(item.makeable_quantity ?? 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              // Get all restrictions - check if item has restrictions array or single restriction
                              const restrictions = item.restrictions || (item.restriction_name ? [{
                                restriction_name: item.restriction_name,
                                restriction_type: item.restriction_type || 'Dietary'
                              }] : []);
                              
                              if (restrictions.length > 0) {
                                const maxDisplay = 3;
                                const displayRestrictions = restrictions.slice(0, maxDisplay);
                                const remainingCount = Math.max(0, restrictions.length - maxDisplay);
                                
                                return (
                                  <div className="flex flex-col gap-1">
                                    {/* First row - max 2 items */}
                                  <div className="flex flex-wrap gap-1">
                                      {displayRestrictions.slice(0, 2).map((r: any, idx: number) => {
                                        if (isNoneRestriction(r)) {
                                          return <div key={idx} className="inline-block">{getNoneRestrictionBadge(false)}</div>;
                                        }
                                        return (
                                      <Badge 
                                        key={idx}
                                        variant="outline" 
                                        className={`${getTypeColor(r.restriction_type || 'Dietary')} border text-xs flex items-center gap-1 w-fit`}
                                      >
                                        {(() => {
                                          const Icon = getTypeIcon(r.restriction_type || 'Dietary');
                                          return <Icon className="h-3 w-3" />;
                                        })()}
                                        {r.restriction_name}
                                      </Badge>
                                        );
                                      })}
                                    </div>
                                    {/* Second row - 3rd item if exists, plus "+X More" if there are more */}
                                    {(displayRestrictions.length > 2 || remainingCount > 0) && (
                                      <div className="flex flex-wrap gap-1">
                                        {displayRestrictions.length > 2 && (() => {
                                          const r = displayRestrictions[2];
                                          if (isNoneRestriction(r)) {
                                            return <div className="inline-block">{getNoneRestrictionBadge(false)}</div>;
                                          }
                                          return (
                                            <Badge 
                                              variant="outline" 
                                              className={`${getTypeColor(r.restriction_type || 'Dietary')} border text-xs flex items-center gap-1 w-fit`}
                                            >
                                              {(() => {
                                                const Icon = getTypeIcon(r.restriction_type || 'Dietary');
                                                return <Icon className="h-3 w-3" />;
                                              })()}
                                              {r.restriction_name}
                                            </Badge>
                                          );
                                        })()}
                                        {remainingCount > 0 && (
                                          <Badge variant="outline" className="text-xs border-muted-foreground/20 text-muted-foreground w-fit">
                                            +{remainingCount} More
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return <div className="inline-block">{getNoneRestrictionBadge(false)}</div>;
                            })()}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              Used in {item.usage_count || 0} package{item.usage_count !== 1 ? 's' : ''}
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
            </div>
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
                  <div className="mt-1 text-lg font-semibold">{formatCurrency(selectedItem?.unit_cost || selectedItem?.menu_cost || 0)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                  <div className="mt-1 text-lg font-semibold">{formatCurrency(selectedItem?.selling_price || selectedItem?.menu_price || 0)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Profit Margin</Label>
                  <div className="mt-1 text-lg font-semibold text-green-600">{formatCurrency(selectedItem?.profit_margin || 0)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Dietary Restrictions</Label>
                  <div className="mt-1">
                    {(() => {
                      const restrictions = selectedItem?.restrictions || (selectedItem?.restriction_name ? [{
                        restriction_name: selectedItem.restriction_name,
                        restriction_type: selectedItem.restriction_type || 'Dietary'
                      }] : []);
                      
                      if (restrictions.length > 0) {
                        const maxDisplay = 3;
                        const displayRestrictions = restrictions.slice(0, maxDisplay);
                        const remainingCount = Math.max(0, restrictions.length - maxDisplay);
                        
                        return (
                          <div className="flex flex-col gap-1">
                            {/* First row - max 2 items */}
                          <div className="flex flex-wrap gap-1">
                              {displayRestrictions.slice(0, 2).map((r: any, idx: number) => {
                                if (isNoneRestriction(r)) {
                                  return <div key={idx} className="inline-block">{getNoneRestrictionBadge(false)}</div>;
                                }
                                return (
                              <Badge 
                                key={idx}
                                variant="outline" 
                                className={`${getTypeColor(r.restriction_type || 'Dietary')} border text-xs flex items-center gap-1 w-fit`}
                              >
                                {(() => {
                                  const Icon = getTypeIcon(r.restriction_type || 'Dietary');
                                  return <Icon className="h-3 w-3" />;
                                })()}
                                {r.restriction_name}
                              </Badge>
                                );
                              })}
                            </div>
                            {/* Second row - 3rd item if exists, plus "+X More" if there are more */}
                            {(displayRestrictions.length > 2 || remainingCount > 0) && (
                              <div className="flex flex-wrap gap-1">
                                {displayRestrictions.length > 2 && (() => {
                                  const r = displayRestrictions[2];
                                  if (isNoneRestriction(r)) {
                                    return <div className="inline-block">{getNoneRestrictionBadge(false)}</div>;
                                  }
                                  return (
                                    <Badge 
                                      variant="outline" 
                                      className={`${getTypeColor(r.restriction_type || 'Dietary')} border text-xs flex items-center gap-1 w-fit`}
                                    >
                                      {(() => {
                                        const Icon = getTypeIcon(r.restriction_type || 'Dietary');
                                        return <Icon className="h-3 w-3" />;
                                      })()}
                                      {r.restriction_name}
                                    </Badge>
                                  );
                                })()}
                                {remainingCount > 0 && (
                                  <Badge variant="outline" className="text-xs border-muted-foreground/20 text-muted-foreground w-fit">
                                    +{remainingCount} More
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return <div className="inline-block">{getNoneRestrictionBadge(false)}</div>;
                    })()}
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
          if (!open) {
            setAddDialogOpen(false);
            setEditDialogOpen(false);
            setFormData({
              menu_name: '',
              menu_cost: '',
              menu_price: '',
              menu_type: '',
              restriction_ids: []
            });
            setRecipe([]);
            setDefaultMarkup(200);
            setSelectedItem(null);
          }
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                {selectedItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </DialogTitle>
              <DialogDescription>
                {selectedItem ? 'Update menu item information and recipe' : 'Create a new menu item with ingredients'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="menu_name">Menu Item Name *</Label>
                  <Input
                    id="menu_name"
                    value={formData.menu_name}
                    onChange={(e) => setFormData({...formData, menu_name: e.target.value})}
                    placeholder="e.g., Grilled Salmon"
                    className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a] dark:text-[#e5e5e5]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="menu_type">Menu Type *</Label>
                  <Select value={formData.menu_type} onValueChange={(val) => setFormData({...formData, menu_type: val})}>
                    <SelectTrigger id="menu_type" className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a] dark:text-[#e5e5e5]">
                      <SelectValue placeholder="Select menu type">
                        {formData.menu_type && (() => {
                          const Icon = getMenuTypeIcon(formData.menu_type);
                          const colorClass = getMenuTypeColor(formData.menu_type);
                          // Extract icon color from colorClass
                          const iconColor = colorClass.includes('orange') ? 'text-orange-600 dark:text-orange-400' :
                                           colorClass.includes('red') ? 'text-red-600 dark:text-red-400' :
                                           colorClass.includes('pink') ? 'text-pink-600 dark:text-pink-400' :
                                           colorClass.includes('blue') ? 'text-blue-600 dark:text-blue-400' :
                                           'text-muted-foreground';
                          return (
                            <span className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${iconColor}`} />
                              {formData.menu_type}
                            </span>
                          );
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a]">
                      {['Appetizer', 'Main Course', 'Dessert', 'Beverage'].map((type) => {
                        const Icon = getMenuTypeIcon(type);
                        const colorClass = getMenuTypeColor(type);
                        const iconColor = colorClass.includes('orange') ? 'text-orange-600 dark:text-orange-400' :
                                         colorClass.includes('red') ? 'text-red-600 dark:text-red-400' :
                                         colorClass.includes('pink') ? 'text-pink-600 dark:text-pink-400' :
                                         colorClass.includes('blue') ? 'text-blue-600 dark:text-blue-400' :
                                         'text-muted-foreground';
                        return (
                          <SelectItem 
                            key={type} 
                            value={type}
                            className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4]"
                          >
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${iconColor}`} />
                              {type}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ingredient Selection */}
              <div className="space-y-3 border-t pt-4 dark:border-[#2a2a2a]">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Ingredients & Recipe *
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {recipe.length} ingredient{recipe.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                
                {/* Ingredients List - Card-based with quantity controls */}
                <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto dark:border-[#2a2a2a]">
                  {availableIngredients.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No ingredients available</p>
                  ) : (
                    <div className="space-y-2">
                      {(() => {
                        // Sort ingredients: selected items (in recipe) first, then unselected items
                        const sortedIngredients = [...availableIngredients].sort((a, b) => {
                          const aId = a.ingredient_id || a.id;
                          const bId = b.ingredient_id || b.id;
                          const aInRecipe = recipe.some(r => r.ingredient_id === aId);
                          const bInRecipe = recipe.some(r => r.ingredient_id === bId);
                          
                          // Selected items (in recipe) come first
                          if (aInRecipe && !bInRecipe) return -1;
                          if (!aInRecipe && bInRecipe) return 1;
                          
                          // If both selected or both unselected, sort alphabetically by name
                          const aName = (a.ingredient_name || '').toLowerCase();
                          const bName = (b.ingredient_name || '').toLowerCase();
                          return aName.localeCompare(bName);
                        });
                        
                        return sortedIngredients.map((ingredient: any) => {
                          const ingredientId = ingredient.ingredient_id || ingredient.id;
                          const recipeItem = recipe.find(r => r.ingredient_id === ingredientId);
                          const quantity = recipeItem?.quantity || 0;
                          const isSelected = quantity > 0;
                          const stockQuantity = parseFloat(ingredient.stock_quantity || 0);
                          const reorderLevel = parseFloat(ingredient.re_order_level || 0);
                          const isLowStock = stockQuantity <= reorderLevel;
                          
                          const handleIncrement = () => {
                            if (isSelected) {
                              handleUpdateRecipeQuantity(ingredientId, quantity + 0.01);
                            } else {
                              handleAddIngredientToRecipe(ingredientId);
                            }
                          };
                          
                          const handleDecrement = () => {
                            if (quantity > 0.01) {
                              handleUpdateRecipeQuantity(ingredientId, Math.max(0.01, quantity - 0.01));
                            } else if (quantity === 0.01) {
                              handleRemoveIngredientFromRecipe(ingredientId);
                            }
                          };
                      
                      return (
                            <div 
                              key={ingredientId} 
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                                isSelected 
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
                                  disabled={!isSelected}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <div className="w-16 text-center">
                                  {isSelected ? (
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                                      value={quantity.toFixed(2)}
                                      onChange={(e) => handleUpdateRecipeQuantity(ingredientId, parseFloat(e.target.value) || 0.01)}
                                      className="h-8 text-sm text-center dark:bg-[#0f0f0f] dark:border-[#2a2a2a] dark:text-[#e5e5e5]"
                                    />
                                  ) : (
                                    <span className={`text-lg font-semibold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                                      0
                                    </span>
                                  )}
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
                                  <span className={`font-medium truncate ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {ingredient.ingredient_name}
                                  </span>
                                  <span className={`text-sm flex-shrink-0 ${isSelected ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                                    {ingredient.unit}
                                  </span>
                        </div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    ID: #{ingredientId}
                                  </Badge>
                                  <span className={`text-xs ${isLowStock ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}`}>
                                    Stock: {stockQuantity.toLocaleString()} {ingredient.unit}
                                </span>
                                  {ingredient.unit_cost && parseFloat(ingredient.unit_cost) > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatCurrency(parseFloat(ingredient.unit_cost))}/{ingredient.unit}
                                    </span>
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
                {recipe.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    At least one ingredient is required
                  </p>
                )}
              </div>

              {/* Cost and Price */}
              <div className="grid grid-cols-2 gap-4 border-t pt-4 dark:border-[#2a2a2a]">
                <div className="space-y-2">
                  <Label htmlFor="menu_cost" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Cost (PHP) *
                  </Label>
                  <Input
                    id="menu_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.menu_cost || (calculatedCostFromIngredients > 0 ? calculatedCostFromIngredients.toFixed(2) : '')}
                    onChange={(e) => setFormData({...formData, menu_cost: e.target.value})}
                    placeholder={calculatedCostFromIngredients > 0 ? calculatedCostFromIngredients.toFixed(2) : "0.00"}
                    className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a] dark:text-[#e5e5e5]"
                  />
                  {calculatedCostFromIngredients > 0 ? (
                    <div className="flex items-center gap-2">
                      <Calculator className="h-3 w-3 text-green-600 dark:text-green-400" />
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Calculated from ingredients: <span className="font-semibold">{formatCurrency(calculatedCostFromIngredients)}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {recipe.length > 0 ? 'Enter cost manually (ingredients have no cost)' : 'Enter the total cost for this menu item'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="menu_price" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Selling Price (PHP) *
                  </Label>
                  <Input
                    id="menu_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.menu_price || (suggestedPrice > 0 ? suggestedPrice.toFixed(2) : '')}
                    onChange={(e) => setFormData({...formData, menu_price: e.target.value})}
                    placeholder={suggestedPrice > 0 ? suggestedPrice.toFixed(2) : "0.00"}
                    className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a] dark:text-[#e5e5e5]"
                  />
                  {suggestedPrice > 0 && (
                    <div className="flex items-center gap-2">
                      <Calculator className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Suggested: <span className="font-semibold text-primary">{formatCurrency(suggestedPrice)}</span> ({defaultMarkup}% markup)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Markup Percentage */}
              <div className="space-y-2 border-t pt-4 dark:border-[#2a2a2a]">
                <Label htmlFor="default_markup" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Default Markup Percentage
                </Label>
                <Input
                  id="default_markup"
                  type="number"
                  step="1"
                  min="0"
                  value={defaultMarkup}
                  onChange={(e) => setDefaultMarkup(parseFloat(e.target.value) || 200)}
                  className="w-32 dark:bg-[#0f0f0f] dark:border-[#2a2a2a] dark:text-[#e5e5e5]"
                />
                <p className="text-xs text-muted-foreground">
                  Used to calculate suggested selling price (default: 200%)
                </p>
              </div>

              {/* Dietary Restrictions */}
              <div className="space-y-2 border-t pt-4 dark:border-[#2a2a2a]">
                <div className="flex items-center gap-2">
                  <Label>Dietary Restrictions</Label>
                  <span className="text-xs text-muted-foreground">(Optional - select multiple)</span>
                </div>
                <div className="max-h-48 overflow-y-auto border rounded-md p-3 dark:border-[#2a2a2a] dark:bg-[#0f0f0f] space-y-2">
                  {dietaryRestrictions
                    .filter((r: any) => r.restriction_name !== 'None')
                    .map((restriction: any) => {
                      const isChecked = formData.restriction_ids.includes(restriction.restriction_id);
                      const Icon = getTypeIcon(restriction.restriction_type || 'Dietary');
                      const colorClass = getTypeColor(restriction.restriction_type || 'Dietary');
                      const iconColor = colorClass.includes('red') ? 'text-red-600 dark:text-red-400' :
                                       colorClass.includes('yellow') ? 'text-yellow-600 dark:text-yellow-400' :
                                       colorClass.includes('orange') ? 'text-orange-600 dark:text-orange-400' :
                                       colorClass.includes('green') ? 'text-green-600 dark:text-green-400' :
                                       colorClass.includes('blue') ? 'text-blue-600 dark:text-blue-400' :
                                       colorClass.includes('purple') ? 'text-purple-600 dark:text-purple-400' :
                                       'text-muted-foreground';
                      return (
                        <div key={restriction.restriction_id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`restriction-${restriction.restriction_id}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  restriction_ids: [...formData.restriction_ids, restriction.restriction_id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  restriction_ids: formData.restriction_ids.filter(id => id !== restriction.restriction_id)
                                });
                              }
                            }}
                            className="dark:border-[#2a2a2a]"
                          />
                          <label
                            htmlFor={`restriction-${restriction.restriction_id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer flex-1"
                          >
                            <Icon className={`h-4 w-4 ${iconColor}`} />
                            {restriction.restriction_name}
                          </label>
                        </div>
                      );
                    })}
                  {dietaryRestrictions.filter((r: any) => r.restriction_name !== 'None').length === 0 && (
                    <p className="text-xs text-muted-foreground">No dietary restrictions available</p>
                  )}
                </div>
                {formData.restriction_ids.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formData.restriction_ids.length} restriction{formData.restriction_ids.length !== 1 ? 's' : ''} selected
                  </p>
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
                    menu_name: '',
                    menu_cost: '',
                    menu_price: '',
                    menu_type: '',
                    restriction_id: ''
                  });
                  setRecipe([]);
                  setDefaultMarkup(200);
                  setSelectedItem(null);
                }}
                disabled={formLoading}
                className="dark:border-[#2a2a2a]"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveItem} 
                disabled={formLoading || recipe.length === 0}
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
