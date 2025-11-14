import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  UserCheck, 
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  Utensils,
  X,
  Loader2,
  ChevronDown,
  ChevronUp
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { dietaryRestrictionsAPI } from '@/api';
import { getTypeIcon, getTypeColor, getSeverityBadge } from '@/utils/restrictionUtils';

type DietaryRestriction = {
  restriction_id: number;
  restriction_name: string;
  severity_level: string;
  restriction_type: string;
  affected_guests: number;
  menu_items_count: number;
  couple_preferences_count: number;
  affected_guests_list?: Array<{
    guest_id: number;
    guest_name: string;
    wedding_date: string;
    partner1_name: string;
    partner2_name: string;
  }>;
  affected_menu_items?: Array<{
    menu_item_id: number;
    item_name: string;
    category: string;
    price: number;
  }>;
};

const DietaryRestrictions = () => {
  const { toast } = useToast();
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'severity' | 'type' | 'guests' | 'menu'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [groupBy, setGroupBy] = useState<'none' | 'type' | 'severity'>('none');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRestriction, setSelectedRestriction] = useState<DietaryRestriction | null>(null);
  const [formData, setFormData] = useState({
    restriction_name: '',
    severity_level: '',
    restriction_type: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchRestrictions();
  }, []);

  const fetchRestrictions = async () => {
    try {
      setLoading(true);
      const response = await dietaryRestrictionsAPI.getAll();
      setRestrictions(response.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load dietary restrictions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRestrictionDetails = async (id: number) => {
    try {
      const response = await dietaryRestrictionsAPI.getById(id);
      return response.data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load restriction details',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleCreate = async () => {
    if (!formData.restriction_name || !formData.severity_level || !formData.restriction_type) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setFormLoading(true);
      await dietaryRestrictionsAPI.create(formData);
      toast({
        title: 'Success',
        description: 'Dietary restriction created successfully',
      });
      setCreateDialogOpen(false);
      setFormData({ restriction_name: '', severity_level: '', restriction_type: '' });
      fetchRestrictions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create dietary restriction',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedRestriction || !formData.restriction_name || !formData.severity_level || !formData.restriction_type) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setFormLoading(true);
      await dietaryRestrictionsAPI.update(selectedRestriction.restriction_id, formData);
      toast({
        title: 'Success',
        description: 'Dietary restriction updated successfully',
      });
      setEditDialogOpen(false);
      setSelectedRestriction(null);
      setFormData({ restriction_name: '', severity_level: '', restriction_type: '' });
      fetchRestrictions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update dietary restriction',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRestriction) return;

    try {
      setFormLoading(true);
      await dietaryRestrictionsAPI.delete(selectedRestriction.restriction_id);
      toast({
        title: 'Success',
        description: 'Dietary restriction deleted successfully',
      });
      setDeleteDialogOpen(false);
      setSelectedRestriction(null);
      fetchRestrictions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete dietary restriction',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const openEditDialog = (restriction: DietaryRestriction) => {
    setSelectedRestriction(restriction);
    setFormData({
      restriction_name: restriction.restriction_name,
      severity_level: restriction.severity_level,
      restriction_type: restriction.restriction_type,
    });
    setEditDialogOpen(true);
  };

  const openViewDialog = async (restriction: DietaryRestriction) => {
    setSelectedRestriction(restriction);
    const details = await fetchRestrictionDetails(restriction.restriction_id);
    if (details) {
      setSelectedRestriction(details);
    }
    setViewDialogOpen(true);
  };

  const openDeleteDialog = (restriction: DietaryRestriction) => {
    setSelectedRestriction(restriction);
    setDeleteDialogOpen(true);
  };

  // Icon, color, and severity functions are now imported from restrictionUtils

  // Priority calculation based on severity and affected counts
  const getPriority = (restriction: DietaryRestriction): string => {
    const severityWeight = {
      'Critical': 4,
      'High': 3,
      'Moderate': 2,
      'Low': 1,
    };
    const weight = severityWeight[restriction.severity_level as keyof typeof severityWeight] || 1;
    const totalImpact = restriction.affected_guests + restriction.menu_items_count + restriction.couple_preferences_count;
    const priorityScore = weight * totalImpact;

    if (priorityScore >= 20) return 'High';
    if (priorityScore >= 10) return 'Medium';
    return 'Low';
  };

  // Filtering and sorting
  const filteredRestrictions = restrictions.filter(restriction => {
    const matchesSearch = restriction.restriction_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restriction.restriction_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || restriction.restriction_type === filterType;
    const matchesSeverity = filterSeverity === 'all' || restriction.severity_level === filterSeverity;
    return matchesSearch && matchesType && matchesSeverity;
  });

  const sortedRestrictions = [...filteredRestrictions].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.restriction_name.localeCompare(b.restriction_name);
        break;
      case 'severity':
        const severityOrder = { 'Critical': 4, 'High': 3, 'Moderate': 2, 'Low': 1 };
        comparison = (severityOrder[b.severity_level as keyof typeof severityOrder] || 0) - 
                     (severityOrder[a.severity_level as keyof typeof severityOrder] || 0);
        break;
      case 'type':
        comparison = a.restriction_type.localeCompare(b.restriction_type);
        break;
      case 'guests':
        comparison = a.affected_guests - b.affected_guests;
        break;
      case 'menu':
        comparison = a.menu_items_count - b.menu_items_count;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Grouping
  const groupedRestrictions = groupBy === 'none' 
    ? { 'All': sortedRestrictions }
    : groupBy === 'type'
    ? sortedRestrictions.reduce((acc, r) => {
        if (!acc[r.restriction_type]) acc[r.restriction_type] = [];
        acc[r.restriction_type].push(r);
        return acc;
      }, {} as Record<string, DietaryRestriction[]>)
    : sortedRestrictions.reduce((acc, r) => {
        if (!acc[r.severity_level]) acc[r.severity_level] = [];
        acc[r.severity_level].push(r);
        return acc;
      }, {} as Record<string, DietaryRestriction[]>);

  const totalAffectedGuests = restrictions.reduce((sum, r) => sum + r.affected_guests, 0);
  const criticalRestrictions = restrictions.filter(r => r.severity_level === 'Critical').length;
  const totalMenuItems = restrictions.reduce((sum, r) => sum + r.menu_items_count, 0);
  const uniqueTypes = [...new Set(restrictions.map(r => r.restriction_type))];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dietary Restrictions</h1>
              <p className="text-muted-foreground">
                Manage dietary restrictions and special requirements with visual indicators
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Restriction
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Restrictions</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{restrictions.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Affected Guests</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAffectedGuests}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{criticalRestrictions}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Restriction Categories</CardTitle>
                <Utensils className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {uniqueTypes.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {uniqueTypes.slice(0, 3).join(', ')}{uniqueTypes.length > 3 ? '...' : ''}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search restrictions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="severity">Severity</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="guests">Affected Guests</SelectItem>
                    <SelectItem value="menu">Menu Items</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                <Select value={groupBy} onValueChange={(v: any) => setGroupBy(v)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Grouping</SelectItem>
                    <SelectItem value="type">Group by Type</SelectItem>
                    <SelectItem value="severity">Group by Severity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Restrictions List */}
          <div className="space-y-6">
            {Object.entries(groupedRestrictions).map(([groupName, groupRestrictions]) => (
              <Card key={groupName}>
                <CardHeader>
                  <CardTitle>
                    {groupBy === 'none' ? 'All Restrictions' : `${groupName} (${groupRestrictions.length})`}
                  </CardTitle>
                  <CardDescription>
                    {groupBy === 'none' 
                      ? 'View and manage all dietary restrictions'
                      : `Restrictions grouped by ${groupBy === 'type' ? 'type' : 'severity level'}`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {groupRestrictions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No restrictions found matching your filters
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Restriction Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Severity Level</TableHead>
                          <TableHead>Affected Guests</TableHead>
                          <TableHead>Menu Items</TableHead>
                          <TableHead>Couple Preferences</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupRestrictions.map((restriction) => (
                          <TableRow key={restriction.restriction_id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full ${getTypeColor(restriction.restriction_type)} flex items-center justify-center border`}>
                                  {getTypeIcon(restriction.restriction_type)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span>{restriction.restriction_name}</span>
                                    <Badge variant="outline" className="text-xs font-mono">
                                      ID: {restriction.restriction_id}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getTypeColor(restriction.restriction_type)}>
                                {getTypeIcon(restriction.restriction_type)}
                                <span className="ml-1">{restriction.restriction_type}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getSeverityBadge(restriction.severity_level)}
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 cursor-help">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{restriction.affected_guests}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{restriction.affected_guests} guest{restriction.affected_guests !== 1 ? 's' : ''} affected</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 cursor-help">
                                    <Utensils className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{restriction.menu_items_count}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{restriction.menu_items_count} menu item{restriction.menu_items_count !== 1 ? 's' : ''} affected</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium">{restriction.couple_preferences_count}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPriority(restriction) === 'High' ? 'destructive' : getPriority(restriction) === 'Medium' ? 'secondary' : 'outline'}>
                                {getPriority(restriction)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openViewDialog(restriction)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEditDialog(restriction)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => openDeleteDialog(restriction)}
                                  >
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
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Dietary Restriction</DialogTitle>
              <DialogDescription>
                Add a new dietary restriction with type, severity, and details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restriction Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Gluten-Free, Nut Allergy"
                  value={formData.restriction_name}
                  onChange={(e) => setFormData({ ...formData, restriction_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Restriction Type *</Label>
                <Select
                  value={formData.restriction_type}
                  onValueChange={(value) => setFormData({ ...formData, restriction_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dietary">Dietary</SelectItem>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Allergy">Allergy</SelectItem>
                    <SelectItem value="Religious">Religious</SelectItem>
                    <SelectItem value="Intolerance">Intolerance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity Level *</Label>
                <Select
                  value={formData.severity_level}
                  onValueChange={(value) => setFormData({ ...formData, severity_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Dietary Restriction</DialogTitle>
              <DialogDescription>
                Update the dietary restriction details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Restriction Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.restriction_name}
                  onChange={(e) => setFormData({ ...formData, restriction_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Restriction Type *</Label>
                <Select
                  value={formData.restriction_type}
                  onValueChange={(value) => setFormData({ ...formData, restriction_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dietary">Dietary</SelectItem>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Allergy">Allergy</SelectItem>
                    <SelectItem value="Religious">Religious</SelectItem>
                    <SelectItem value="Intolerance">Intolerance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-severity">Severity Level *</Label>
                <Select
                  value={formData.severity_level}
                  onValueChange={(value) => setFormData({ ...formData, severity_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedRestriction && (
                  <>
                    <div className={`w-8 h-8 rounded-full ${getTypeColor(selectedRestriction.restriction_type)} flex items-center justify-center border`}>
                      {getTypeIcon(selectedRestriction.restriction_type)}
                    </div>
                    {selectedRestriction.restriction_name}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Detailed information about this dietary restriction
              </DialogDescription>
            </DialogHeader>
            {selectedRestriction && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <div className="mt-1">
                      <Badge className={getTypeColor(selectedRestriction.restriction_type)}>
                        {getTypeIcon(selectedRestriction.restriction_type)}
                        <span className="ml-1">{selectedRestriction.restriction_type}</span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Severity</Label>
                    <div className="mt-1">
                      {getSeverityBadge(selectedRestriction.severity_level)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Affected Guests</Label>
                    <div className="mt-1 text-lg font-semibold">{selectedRestriction.affected_guests}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Menu Items</Label>
                    <div className="mt-1 text-lg font-semibold">{selectedRestriction.menu_items_count}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Couple Preferences</Label>
                    <div className="mt-1 text-lg font-semibold">{selectedRestriction.couple_preferences_count}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Priority</Label>
                    <div className="mt-1">
                      <Badge variant={getPriority(selectedRestriction) === 'High' ? 'destructive' : getPriority(selectedRestriction) === 'Medium' ? 'secondary' : 'outline'}>
                        {getPriority(selectedRestriction)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedRestriction.affected_guests_list && selectedRestriction.affected_guests_list.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground mb-2 block">Affected Guests</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {selectedRestriction.affected_guests_list.map((guest) => (
                        <div key={guest.guest_id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{guest.guest_name}</span>
                          <span className="text-muted-foreground">
                            {guest.partner1_name} & {guest.partner2_name} - {new Date(guest.wedding_date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRestriction.affected_menu_items && selectedRestriction.affected_menu_items.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground mb-2 block">Affected Menu Items</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {selectedRestriction.affected_menu_items.map((item) => (
                        <div key={item.menu_item_id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.item_name}</span>
                          <span className="text-muted-foreground">
                            {item.category} - ${item.price?.toFixed(2) || '0.00'}
                          </span>
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
              {selectedRestriction && (
                <Button onClick={() => {
                  setViewDialogOpen(false);
                  openEditDialog(selectedRestriction);
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Dietary Restriction</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedRestriction?.restriction_name}"? 
                This action cannot be undone.
                {selectedRestriction && (selectedRestriction.affected_guests > 0 || selectedRestriction.menu_items_count > 0 || selectedRestriction.couple_preferences_count > 0) && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> This restriction is currently in use:
                    </p>
                    <ul className="list-disc list-inside mt-1 text-sm text-yellow-700">
                      {selectedRestriction.affected_guests > 0 && <li>{selectedRestriction.affected_guests} guest(s)</li>}
                      {selectedRestriction.menu_items_count > 0 && <li>{selectedRestriction.menu_items_count} menu item(s)</li>}
                      {selectedRestriction.couple_preferences_count > 0 && <li>{selectedRestriction.couple_preferences_count} couple preference(s)</li>}
                    </ul>
                    <p className="text-sm text-yellow-800 mt-2">
                      You may not be able to delete this restriction if it's actively being used.
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default DietaryRestrictions;
