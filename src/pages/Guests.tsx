import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  UserPlus,
  Users,
  CheckCircle,
  Clock,
  X,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { guestsAPI, dietaryRestrictionsAPI, weddingsAPI } from '@/api';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getTypeIcon, getTypeColor, filterNoneFromDisplay } from '@/utils/restrictionUtils';
import { MultiSelectRestrictions } from '@/components/ui/multi-select-restrictions';

type Guest = {
  id: number;
  guest_id: number;
  guest_name: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  wedding_id: number;
  table_id: number | null;
  table_number?: string | null;
  restriction_id?: number | null;
  restriction_name?: string | null;
  dietaryRestrictions?: Array<{
    restriction_id: number;
    restriction_name: string;
    restriction_type?: string;
    severity_level?: string;
  }>;
  dietaryRestriction?: string;
  rsvp_status: string;
  rsvpStatus?: string;
  wedding?: {
    wedding_id: number;
    venue?: string;
    wedding_date?: string;
  };
};

const Guests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<any[]>([]);
  const [weddings, setWeddings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterRsvp, setFilterRsvp] = useState<string>('all');
  const [filterRestriction, setFilterRestriction] = useState<string>('all');
  const [filterWedding, setFilterWedding] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'rsvp' | 'wedding' | 'table'>(() => {
    const stored = localStorage.getItem('default_table_sort_by');
    return (stored as 'id' | 'name' | 'rsvp' | 'wedding' | 'table') || 'id';
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    const stored = localStorage.getItem('default_table_sort_order');
    return (stored as 'asc' | 'desc') || 'desc';
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    rsvpStatus: 'pending',
    weddingId: '',
    restrictionIds: [] as number[],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchGuests();
    fetchDietaryRestrictions();
    fetchWeddings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRsvp, filterRestriction, filterWedding, sortBy, sortOrder]);

  const fetchGuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await guestsAPI.getAll();
      const data = response.data || [];
      // Transform guests to include dietary restrictions as array
      const transformedGuests = data.map((g: any) => {
        let restrictions = [];
        if (g.restrictions) {
          try {
            if (typeof g.restrictions === 'string') {
              restrictions = JSON.parse(g.restrictions);
            } else if (Array.isArray(g.restrictions)) {
              restrictions = g.restrictions;
            }
          } catch (e) {
            console.error('Error parsing restrictions:', e);
          }
        } else if (g.restriction_id && g.restriction_name) {
          restrictions = [{
            restriction_id: g.restriction_id,
            restriction_name: g.restriction_name,
            restriction_type: g.restriction_type,
            severity_level: g.severity_level
          }];
        }
        return {
          ...g,
          id: g.guest_id || g.id,
          guest_id: g.guest_id || g.id,
          firstName: g.firstName || g.guest_name?.split(' ')[0] || '',
          lastName: g.lastName || g.guest_name?.split(' ').slice(1).join(' ') || '',
          name: g.guest_name || `${g.firstName || ''} ${g.lastName || ''}`.trim(),
          rsvpStatus: g.rsvp_status || g.rsvpStatus || 'pending',
          dietaryRestrictions: restrictions,
        };
      });
      setGuests(transformedGuests);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load guests. Make sure backend is running.';
      setError(errorMessage);
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDietaryRestrictions = async () => {
    try {
      const response = await dietaryRestrictionsAPI.getAll();
      const allRestrictions = response.data || [];
      // Filter out "None" from the display (it's a system restriction) using utility function
      const displayableRestrictions = filterNoneFromDisplay(allRestrictions);
      setDietaryRestrictions(displayableRestrictions);
    } catch (err: any) {
      console.error('Error fetching dietary restrictions:', err);
    }
  };

  const fetchWeddings = async () => {
    try {
      const response = await weddingsAPI.getAll();
      setWeddings(response.data || []);
    } catch (err: any) {
      console.error('Error fetching weddings:', err);
    }
  };

  const getRsvpStatusBadge = (status: string | undefined | null) => {
    if (!status) return <Badge variant="secondary" className="flex items-center gap-1 w-fit"><Clock className="w-3 h-3" />Pending</Badge>;
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" />Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive" className="flex items-center gap-1 w-fit"><X className="w-3 h-3" />Declined</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1 w-fit"><Clock className="w-3 h-3" />Pending</Badge>;
      default:
        return <Badge variant="secondary" className="flex items-center gap-1 w-fit"><Clock className="w-3 h-3" />{status}</Badge>;
    }
  };

  const filteredAndSortedGuests = useMemo(() => {
    let filtered = guests.filter(guest => {
      const matchesSearch = searchTerm === '' || 
        guest.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRsvp = filterRsvp === 'all' || 
        (guest.rsvpStatus || guest.rsvp_status || '').toLowerCase() === filterRsvp.toLowerCase();
      
      const matchesRestriction = filterRestriction === 'all' || 
        (guest.dietaryRestrictions || []).some((r: any) => 
          r.restriction_id?.toString() === filterRestriction ||
          r.restriction_name?.toLowerCase() === filterRestriction.toLowerCase()
        );
      
      const matchesWedding = filterWedding === 'all' || 
        guest.wedding_id?.toString() === filterWedding;
      
      return matchesSearch && matchesRsvp && matchesRestriction && matchesWedding;
    });

    return filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case 'id':
          aVal = a.guest_id || a.id || 0;
          bVal = b.guest_id || b.id || 0;
          break;
        case 'name':
          aVal = (a.guest_name || a.name || `${a.firstName} ${a.lastName}`).toLowerCase();
          bVal = (b.guest_name || b.name || `${b.firstName} ${b.lastName}`).toLowerCase();
          break;
        case 'rsvp':
          aVal = (a.rsvpStatus || a.rsvp_status || 'pending').toLowerCase();
          bVal = (b.rsvpStatus || b.rsvp_status || 'pending').toLowerCase();
          break;
        case 'wedding':
          aVal = a.wedding_id || 0;
          bVal = b.wedding_id || 0;
          break;
        case 'table':
          aVal = a.table_number || '';
          bVal = b.table_number || '';
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });
  }, [guests, searchTerm, filterRsvp, filterRestriction, filterWedding, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedGuests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGuests = filteredAndSortedGuests.slice(startIndex, endIndex);

  const hasActiveFilters = searchTerm !== '' || filterRsvp !== 'all' || filterRestriction !== 'all' || filterWedding !== 'all';

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterRsvp('all');
    setFilterRestriction('all');
    setFilterWedding('all');
    setSortBy('id');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleAddGuest = async () => {
    setFormErrors({});
    
    if (!formData.firstName.trim()) {
      setFormErrors({ firstName: 'First name is required' });
      return;
    }
    if (!formData.lastName.trim()) {
      setFormErrors({ lastName: 'Last name is required' });
      return;
    }
    if (!formData.weddingId) {
      setFormErrors({ weddingId: 'Wedding is required' });
      return;
    }
    if (formData.restrictionIds.length === 0) {
      setFormErrors({ restrictionIds: 'At least one dietary restriction is required' });
      return;
    }

    setFormLoading(true);
    try {
      await guestsAPI.create({
        guest_name: `${formData.firstName} ${formData.lastName}`,
        wedding_id: parseInt(formData.weddingId),
        rsvp_status: formData.rsvpStatus,
        restriction_ids: formData.restrictionIds,
      });
      toast({ title: 'Success', description: 'Guest added successfully' });
      setAddDialogOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        rsvpStatus: 'pending',
        weddingId: '',
        restrictionIds: [],
      });
      fetchGuests();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to add guest',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    
    // Smart name parsing: only split if there are 3+ words (first middle last)
    // For 2 words, keep both in firstName to avoid splitting multi-word first names
    let firstName = '';
    let lastName = '';
    const fullName = guest.guest_name || '';
    const nameParts = fullName.trim().split(/\s+/).filter(p => p.length > 0);
    
    if (guest.firstName && guest.lastName) {
      // If firstName/lastName already exist, use them
      firstName = guest.firstName;
      lastName = guest.lastName;
    } else if (nameParts.length >= 3) {
      // 3+ words: first word(s) = firstName, last word = lastName
      firstName = nameParts.slice(0, -1).join(' ');
      lastName = nameParts[nameParts.length - 1];
    } else if (nameParts.length === 2) {
      // 2 words: keep both in firstName (could be "Mary Jane" or "Jack Daniel")
      firstName = fullName;
      lastName = '';
    } else if (nameParts.length === 1) {
      // Single word: all in firstName
      firstName = fullName;
      lastName = '';
    }
    
    setFormData({
      firstName,
      lastName,
      rsvpStatus: guest.rsvpStatus || guest.rsvp_status || 'pending',
      weddingId: guest.wedding_id?.toString() || '',
      restrictionIds: (guest.dietaryRestrictions || []).map((r: any) => r.restriction_id || r.id).filter(Boolean),
    });
    setFormErrors({});
    setEditDialogOpen(true);
  };

  const handleSaveEditGuest = async () => {
    if (!selectedGuest) return;
    
    setFormErrors({});
    
    if (!formData.firstName.trim()) {
      setFormErrors({ firstName: 'First name is required' });
      return;
    }
    if (!formData.lastName.trim()) {
      setFormErrors({ lastName: 'Last name is required' });
      return;
    }
    if (formData.restrictionIds.length === 0) {
      setFormErrors({ restrictionIds: 'At least one dietary restriction is required' });
      return;
    }

    setFormLoading(true);
    try {
      await guestsAPI.update(selectedGuest.guest_id, {
        guest_name: `${formData.firstName} ${formData.lastName}`,
        rsvp_status: formData.rsvpStatus,
        restriction_ids: formData.restrictionIds,
      });
      toast({ title: 'Success', description: 'Guest updated successfully' });
      setEditDialogOpen(false);
      fetchGuests();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to update guest',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteGuest = async () => {
    if (!selectedGuest) return;
    
    setFormLoading(true);
    try {
      await guestsAPI.delete(selectedGuest.guest_id);
      toast({ title: 'Success', description: 'Guest deleted successfully' });
      setDeleteDialogOpen(false);
      fetchGuests();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to delete guest',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const openAddDialog = () => {
    setFormData({
      firstName: '',
      lastName: '',
      rsvpStatus: 'pending',
      weddingId: '',
      restrictionIds: [],
    });
    setFormErrors({});
    setAddDialogOpen(true);
  };

  const openDeleteDialog = (guest: Guest) => {
    setSelectedGuest(guest);
    setDeleteDialogOpen(true);
  };

  const acceptedCount = guests.filter(g => (g.rsvpStatus || g.rsvp_status || '').toLowerCase() === 'accepted' || (g.rsvpStatus || g.rsvp_status || '').toLowerCase() === 'confirmed').length;
  const pendingCount = guests.filter(g => (g.rsvpStatus || g.rsvp_status || '').toLowerCase() === 'pending').length;
  const declinedCount = guests.filter(g => (g.rsvpStatus || g.rsvp_status || '').toLowerCase() === 'declined').length;

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Guests Overview</h1>
            <p className="text-muted-foreground">
              Manage your wedding guest list and track RSVPs
            </p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            New Guest
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{guests.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all weddings
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Confirmed attendance
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting response
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Declined</CardTitle>
              <X className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{declinedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Cannot attend
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Guests Directory */}
        <Card>
          <CardHeader>
            <CardTitle>Guests Directory</CardTitle>
            <CardDescription>
              View and manage all guest information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search guests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(s => !s)}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button 
                variant="outline" 
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            </div>

            {showFilters && (
              <div className="grid md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="text-sm text-muted-foreground">RSVP Status</label>
                  <Select value={filterRsvp} onValueChange={setFilterRsvp}>
                    <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Dietary Restriction</label>
                  <Select value={filterRestriction} onValueChange={setFilterRestriction}>
                    <SelectTrigger><SelectValue placeholder="All Restrictions" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Restrictions</SelectItem>
                      {dietaryRestrictions.map((dr) => {
                        const restrictionValue = dr.restriction_id ? dr.restriction_id.toString() : (dr.restriction_name || `restriction-${dr.restriction_id || 'unknown'}`);
                        return (
                          <SelectItem key={dr.restriction_id || restrictionValue} value={restrictionValue}>
                            {dr.restriction_name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Wedding</label>
                  <Select value={filterWedding} onValueChange={setFilterWedding}>
                    <SelectTrigger><SelectValue placeholder="All Weddings" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Weddings</SelectItem>
                      {weddings.map((w) => {
                        const weddingValue = w.wedding_id ? w.wedding_id.toString() : `wedding-${w.id || 'unknown'}`;
                        return (
                          <SelectItem key={w.wedding_id || w.id || weddingValue} value={weddingValue}>
                            Wedding #{w.wedding_id || w.id} - {w.venue || 'Unknown Venue'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Sort By</label>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                      <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">ID</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="rsvp">RSVP Status</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="table">Table</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            {filteredAndSortedGuests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No guests found.</p>
                {hasActiveFilters ? (
                  <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
                ) : (
                  <p className="text-sm mt-2">Add your first guest to get started.</p>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Dietary Restrictions</TableHead>
                      <TableHead>RSVP Status</TableHead>
                      <TableHead>Wedding</TableHead>
                      <TableHead>Assigned Table</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedGuests.map((guest) => {
                      const restrictions = Array.isArray(guest.dietaryRestrictions) 
                        ? guest.dietaryRestrictions 
                        : guest.restriction_name 
                          ? [{ restriction_name: guest.restriction_name, restriction_type: guest.restriction_id }] 
                          : [];
                      return (
                        <TableRow key={guest.id}>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            #{guest.guest_id || guest.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {guest.guest_name || guest.name || `${guest.firstName} ${guest.lastName}`.trim()}
                          </TableCell>
                          <TableCell>
                            {restrictions.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {restrictions.map((r: any, idx: number) => {
                                  const restrictionName = r.restriction_name || r.name || r;
                                  const restrictionType = r.restriction_type || '';
                                  const restrictionId = r.restriction_id || r.id;
                                  return (
                                    <Badge 
                                      key={restrictionId || restrictionName || `restriction-${idx}`} 
                                      variant="outline" 
                                      className={`text-xs ${getTypeColor(restrictionType)} border flex items-center gap-1`}
                                    >
                                      {(() => {
                                        const Icon = getTypeIcon(restrictionType);
                                        return <Icon className="h-3 w-3" />;
                                      })()}
                                      {restrictionName}
                                    </Badge>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          <TableCell>{getRsvpStatusBadge(guest.rsvpStatus || guest.rsvp_status)}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => navigate(`/dashboard/weddings/${guest.wedding_id}`)}
                              className="text-sm text-primary hover:underline"
                            >
                              Wedding #{guest.wedding_id}
                            </button>
                          </TableCell>
                          <TableCell>
                            {guest.table_number ? (
                              <Badge variant="outline">{guest.table_number}</Badge>
                            ) : (
                              <span className="text-muted-foreground">Not assigned</span>
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
                                <DropdownMenuItem onClick={() => handleEditGuest(guest)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600" 
                                  onClick={() => openDeleteDialog(guest)}
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
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedGuests.length)} of {filteredAndSortedGuests.length} guests
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
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

        {/* Add Guest Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Guest</DialogTitle>
              <DialogDescription>
                Fill in the details for the new guest
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={formErrors.firstName ? 'border-red-500' : ''}
                    disabled={formLoading}
                  />
                  {formErrors.firstName && <p className="text-sm text-red-500">{formErrors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={formErrors.lastName ? 'border-red-500' : ''}
                    disabled={formLoading}
                  />
                  {formErrors.lastName && <p className="text-sm text-red-500">{formErrors.lastName}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weddingId">Wedding *</Label>
                <Select 
                  value={formData.weddingId} 
                  onValueChange={(val) => setFormData({ ...formData, weddingId: val })}
                  disabled={formLoading}
                >
                  <SelectTrigger id="weddingId" className={formErrors.weddingId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a wedding" />
                  </SelectTrigger>
                  <SelectContent>
                    {weddings.map((w) => {
                      const weddingValue = w.wedding_id ? w.wedding_id.toString() : `wedding-${w.id || 'unknown'}`;
                      return (
                        <SelectItem key={w.wedding_id || w.id || weddingValue} value={weddingValue}>
                          Wedding #{w.wedding_id || w.id} - {w.venue || 'Unknown Venue'}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {formErrors.weddingId && <p className="text-sm text-red-500">{formErrors.weddingId}</p>}
              </div>
              <div className="space-y-2">
                <Label>Dietary Restrictions *</Label>
                <MultiSelectRestrictions
                  restrictions={dietaryRestrictions}
                  selectedIds={formData.restrictionIds}
                  onSelectionChange={(ids) => setFormData({ ...formData, restrictionIds: ids })}
                  disabled={formLoading}
                  error={formErrors.restrictionIds}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rsvpStatus">RSVP Status *</Label>
                <Select 
                  value={formData.rsvpStatus} 
                  onValueChange={(val) => setFormData({ ...formData, rsvpStatus: val })}
                  disabled={formLoading}
                >
                  <SelectTrigger id="rsvpStatus">
                    <SelectValue placeholder="Select RSVP status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={formLoading}>
                Cancel
              </Button>
              <Button onClick={handleAddGuest} disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Guest
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Guest Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Guest</DialogTitle>
              <DialogDescription>
                Update guest information and dietary restrictions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_firstName">First Name *</Label>
                  <Input
                    id="edit_firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={formErrors.firstName ? 'border-red-500' : ''}
                    disabled={formLoading}
                  />
                  {formErrors.firstName && <p className="text-sm text-red-500">{formErrors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_lastName">Last Name *</Label>
                  <Input
                    id="edit_lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={formErrors.lastName ? 'border-red-500' : ''}
                    disabled={formLoading}
                  />
                  {formErrors.lastName && <p className="text-sm text-red-500">{formErrors.lastName}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Dietary Restrictions *</Label>
                <MultiSelectRestrictions
                  restrictions={dietaryRestrictions}
                  selectedIds={formData.restrictionIds}
                  onSelectionChange={(ids) => setFormData({ ...formData, restrictionIds: ids })}
                  disabled={formLoading}
                  error={formErrors.restrictionIds}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_rsvpStatus">RSVP Status *</Label>
                <Select 
                  value={formData.rsvpStatus} 
                  onValueChange={(val) => setFormData({ ...formData, rsvpStatus: val })}
                  disabled={formLoading}
                >
                  <SelectTrigger id="edit_rsvpStatus">
                    <SelectValue placeholder="Select RSVP status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={formLoading}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditGuest} disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Guest Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Guest</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedGuest?.guest_name || selectedGuest?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={formLoading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteGuest} disabled={formLoading}>
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

export default Guests;
