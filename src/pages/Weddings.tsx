import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2,
  Clock,
  Utensils,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
import { weddingsAPI, couplesAPI, guestsAPI } from '@/api';
import { usePrice } from '@/utils/currency';
import { getTypeIcon, getTypeColor, getSeverityBadge, formatRestrictionsList, getRestrictionCountText } from '@/utils/restrictionUtils';

const Weddings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { convert, format } = usePrice();
  const [weddings, setWeddings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [plannerFilter, setPlannerFilter] = useState('');
  const [hasRestrictions, setHasRestrictions] = useState<string | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [couples, setCouples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalGuests, setTotalGuests] = useState(0);
  
  // Refs for date/time inputs
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [selectedCoupleId, setSelectedCoupleId] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [weddingTime, setWeddingTime] = useState('');
  const [venue, setVenue] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [selectedPreferenceId, setSelectedPreferenceId] = useState('');
  const [couplePreferences, setCouplePreferences] = useState<any[]>([]);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch couples list
  useEffect(() => {
    fetchCouples();
  }, []);

  // Fetch preferences when couple is selected
  useEffect(() => {
    if (selectedCoupleId) {
      fetchCouplePreferences();
    } else {
      setCouplePreferences([]);
      setSelectedPreferenceId('');
    }
  }, [selectedCoupleId]);

  const fetchCouples = async () => {
    try {
      const response = await couplesAPI.getAll();
      // Transform couple_id to id for frontend compatibility
      const transformedCouples = (response.data || []).map(couple => ({
        ...couple,
        id: couple.couple_id
      }));
      setCouples(transformedCouples);
    } catch (error: any) {
      console.error('Error fetching couples:', error);
      toast({
        title: 'Error',
        description: 'Failed to load couples',
        variant: 'destructive',
      });
    }
  };

  const fetchCouplePreferences = async () => {
    try {
      const response = await couplesAPI.getPreferences(selectedCoupleId);
      setCouplePreferences(response.data || []);
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
      setCouplePreferences([]);
    }
  };

  // Fetch weddings
  useEffect(() => {
    fetchWeddings();
  }, []);

  const fetchWeddings = async () => {
    setLoading(true);
    try {
      const response = await weddingsAPI.getAll({
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        venue: venueFilter || undefined,
        planner_contact: plannerFilter || undefined,
        has_restrictions: hasRestrictions,
      });
      const weddingsData = response.data || [];
      setWeddings(weddingsData);
      
      // Calculate total guests by fetching actual guest counts
      let total = 0;
      try {
        const guestCountPromises = weddingsData.map(async (wedding: any) => {
          try {
            const guestsResponse = await guestsAPI.getAll({ wedding_id: wedding.wedding_id || wedding.id });
            return (guestsResponse.data || []).length;
          } catch (e) {
            return 0;
          }
        });
        const counts = await Promise.all(guestCountPromises);
        total = counts.reduce((sum, count) => sum + count, 0);
      } catch (e) {
        console.error('Error calculating guest counts:', e);
        // Fallback to guest_count field if available
        total = weddingsData.reduce((sum: number, w: any) => sum + (w.guest_count || w.guestCount || 0), 0);
      }
      setTotalGuests(total);
    } catch (error: any) {
      console.error('Error fetching weddings:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load weddings. Make sure backend is running.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Partial</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredWeddings = weddings.filter(wedding => {
    const matchesSearch = wedding.couple.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wedding.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || wedding.paymentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedCoupleId) newErrors.selectedCoupleId = 'Couple selection is required';
    if (!weddingDate) newErrors.weddingDate = 'Wedding date is required';
    if (!weddingTime) newErrors.weddingTime = 'Wedding time is required';
    if (!venue.trim()) {
      newErrors.venue = 'Venue is required';
    }
    if (!paymentStatus) newErrors.paymentStatus = 'Payment status is required';

    // Date validation
    if (weddingDate) {
      const date = new Date(weddingDate);
      if (isNaN(date.getTime())) {
        newErrors.weddingDate = 'Invalid date format';
      }
    }

    // Time validation (HH:MM format)
    if (weddingTime && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(weddingTime)) {
      newErrors.weddingTime = 'Time must be in HH:MM format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setSelectedCoupleId('');
    setWeddingDate('');
    setWeddingTime('');
    setVenue('');
    setPaymentStatus('');
    setSelectedPreferenceId('');
    setCouplePreferences([]);
    setErrors({});
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset form immediately when closing
      resetForm();
    }
    setDialogOpen(open);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create wedding via API
      const response = await weddingsAPI.create({
        couple_id: parseInt(selectedCoupleId),
        wedding_date: weddingDate,
        wedding_time: weddingTime,
        venue: venue.trim(),
        guest_count: 0,
        total_cost: 0,
        production_cost: 0,
        payment_status: paymentStatus,
        preference_id: selectedPreferenceId ? parseInt(selectedPreferenceId) : null,
      });

      // Refresh weddings list
      await fetchWeddings();

      toast({
        title: 'Wedding Created',
        description: `Wedding for ${response.data.couple} has been created successfully`,
      });

      // Close dialog and reset form
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to create wedding. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wedding Overview</h1>
            <p className="text-muted-foreground">
              Select a wedding to view its details and manage all aspects
            </p>
          </div>
          <Button onClick={() => {
            resetForm(); // Reset form when opening dialog
            setDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            New Wedding
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Weddings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weddings.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalGuests}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Meals Served</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weddings.reduce((sum, wedding) => sum + (wedding.guestCount || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all weddings
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dietary Restrictions Handled</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(() => {
                  // Count unique restrictions across all weddings with preferences
                  const restrictionSet = new Set<number>();
                  weddings.forEach(w => {
                    if (w.restrictions && Array.isArray(w.restrictions)) {
                      w.restrictions.forEach((r: any) => {
                        if (r && r.restriction_id) restrictionSet.add(r.restriction_id);
                      });
                    }
                  });
                  return restrictionSet.size;
                })()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unique restrictions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Wedding List</CardTitle>
            <CardDescription>
              View and manage all wedding bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search weddings..."
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
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setVenueFilter('');
                  setPlannerFilter('');
                  setHasRestrictions(undefined);
                  setSearchTerm('');
                  fetchWeddings();
                }}
              >
                Reset Filters
              </Button>
              <Button variant="secondary" onClick={fetchWeddings}>Apply</Button>
            </div>

            {showFilters && (
              <div className="grid md:grid-cols-5 gap-3 mb-4">
                <div>
                  <label className="text-sm text-muted-foreground">From</label>
                  <div className="relative">
                    <Input 
                      type="date" 
                      value={dateFrom} 
                      onChange={(e) => setDateFrom(e.target.value)}
                      placeholder="mm/dd/yyyy"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">To</label>
                  <div className="relative">
                    <Input 
                      type="date" 
                      value={dateTo} 
                      onChange={(e) => setDateTo(e.target.value)}
                      placeholder="mm/dd/yyyy"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Venue</label>
                  <Input value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)} placeholder="Search venue" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Planner</label>
                  <Input value={plannerFilter} onChange={(e) => setPlannerFilter(e.target.value)} placeholder="Planner contact" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Has Restrictions</label>
                  <Select value={hasRestrictions ?? ''} onValueChange={(val) => setHasRestrictions(val || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="Y">Yes</SelectItem>
                      <SelectItem value="N">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wedding ID</TableHead>
                  <TableHead>Couple ID</TableHead>
                  <TableHead>Couple</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Type & Restrictions</TableHead>
                  <TableHead>Guest #</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWeddings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No weddings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWeddings.map((wedding) => (
                  <TableRow 
                    key={wedding.id || wedding.wedding_id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/dashboard/weddings/${wedding.id || wedding.wedding_id}`)}
                  >
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      #{wedding.id || wedding.wedding_id}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      #{wedding.couple_id}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{wedding.couple || (wedding.partner1_name && wedding.partner2_name ? `${wedding.partner1_name} & ${wedding.partner2_name}` : 'N/A')}</div>
                        <div className="text-sm text-muted-foreground">
                          {wedding.plannerContact || wedding.planner_contact || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>
                            {(() => {
                              try {
                                const date = wedding.weddingDate || wedding.wedding_date;
                                if (!date) return 'N/A';
                                const d = new Date(date);
                                return isNaN(d.getTime()) ? (typeof date === 'string' ? date.split('T')[0] : 'N/A') : d.toLocaleDateString();
                              } catch {
                                return 'N/A';
                              }
                            })()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {wedding.weddingTime || wedding.wedding_time || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {wedding.venue}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {wedding.ceremony_type && (
                          <Badge variant="outline" className="text-xs">
                            {wedding.ceremony_type}
                          </Badge>
                        )}
                        {(() => {
                          const restrictions = wedding.all_restrictions || wedding.restrictions || [];
                          return restrictions.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {restrictions.slice(0, 2).map((r: any) => (
                                <Badge 
                                  key={r.restriction_id} 
                                  className={`${getTypeColor(r.restriction_type || '')} border text-xs`}
                                >
                                  {r.restriction_name}
                                </Badge>
                              ))}
                              {restrictions.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{restrictions.length - 2} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No restrictions</span>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {wedding.guestCount || wedding.guest_count || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{format(convert(wedding.totalCost || wedding.total_cost || 0))}</div>
                        <div className="text-sm text-muted-foreground">
                          Prod: {format(convert(wedding.productionCost || wedding.production_cost || 0))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(wedding.paymentStatus || wedding.payment_status || 'pending')}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/weddings/${wedding.id || wedding.wedding_id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={async () => {
                              if (!confirm('Delete this wedding?')) return;
                              try {
                                await weddingsAPI.delete(wedding.id);
                                await fetchWeddings();
                                toast({ title: 'Wedding deleted' });
                              } catch (e: any) {
                                toast({ title: 'Error', description: e.response?.data?.error || 'Failed to delete wedding', variant: 'destructive' });
                              }
                            }}
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
          </CardContent>
        </Card>

        {/* Add Wedding Dialog */}
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" key={dialogOpen ? 'open' : 'closed'}>
            <DialogHeader>
              <DialogTitle>Add New Wedding</DialogTitle>
              <DialogDescription>
                Fill in all the required information to create a new wedding
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 overflow-visible">
              {/* Couple Selection */}
              <div className="space-y-2">
                <Label htmlFor="couple">Couple *</Label>
                <Select value={selectedCoupleId} onValueChange={setSelectedCoupleId}>
                  <SelectTrigger id="couple" className={errors.selectedCoupleId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a couple" />
                  </SelectTrigger>
                  <SelectContent>
                    {couples.map((couple) => (
                      <SelectItem key={couple.id} value={couple.id.toString()}>
                        {couple.partner1_name} & {couple.partner2_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.selectedCoupleId && (
                  <p className="text-sm text-red-500">{errors.selectedCoupleId}</p>
                )}
              </div>

              {/* Preference Selection (optional, filtered by couple) */}
              {selectedCoupleId && (
                <div className="space-y-2">
                  <Label htmlFor="preference">Preference (Optional)</Label>
                  <Select
                    value={selectedPreferenceId}
                    onValueChange={setSelectedPreferenceId}
                    disabled={couplePreferences.length === 0}
                  >
                    <SelectTrigger id="preference">
                      <SelectValue placeholder={couplePreferences.length === 0 ? 'No preferences available - add preferences in couple detail' : 'Select a preference'} />
                    </SelectTrigger>
                    <SelectContent>
                      {couplePreferences.map((pref) => {
                        const restrictions = pref.dietaryRestrictions || [];
                        const restrictionCount = restrictions.length;
                        const restrictionText = restrictionCount > 0 
                          ? formatRestrictionsList(restrictions, 2)
                          : 'No restrictions';
                        return (
                          <SelectItem key={pref.preference_id} value={pref.preference_id.toString()}>
                            {pref.ceremony_type} - {restrictionText} ({restrictionCount})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedPreferenceId && couplePreferences.length > 0 && (() => {
                    const selectedPref = couplePreferences.find(p => p.preference_id.toString() === selectedPreferenceId);
                    if (!selectedPref) return null;
                    
                    const restrictions = selectedPref.dietaryRestrictions || [];
                    const restrictionCount = restrictions.length;
                    
                    return (
                      <div className="p-4 bg-muted rounded-lg border space-y-3">
                        <div>
                          <p className="text-sm font-semibold mb-1">Wedding Type:</p>
                          <Badge variant="outline" className="font-semibold">
                            {selectedPref.ceremony_type}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-semibold mb-2">
                            Dietary Restrictions ({restrictionCount}):
                          </p>
                          {restrictionCount > 0 ? (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {restrictions.map((restriction: any) => (
                                  <Badge 
                                    key={restriction.restriction_id} 
                                    className={`${getTypeColor(restriction.restriction_type || '')} border flex items-center gap-1`}
                                  >
                                    {getTypeIcon(restriction.restriction_type || '')}
                                    <span>{restriction.restriction_name}</span>
                                    {restriction.severity_level && (
                                      <span className="text-xs">({restriction.severity_level})</span>
                                    )}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatRestrictionsList(restrictions)}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No dietary restrictions</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Wedding Date */}
                <div className="space-y-2">
                  <Label htmlFor="weddingDate">Wedding Date *</Label>
                  <div className="relative">
                    <Input
                      ref={dateInputRef}
                      id="weddingDate"
                      type="date"
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                      className={cn(
                        errors.weddingDate ? 'border-red-500' : '', 
                        'pr-10',
                        '[&::-webkit-calendar-picker-indicator]:hidden',
                        '[&::-webkit-calendar-picker-indicator]:appearance-none'
                      )}
                    />
                    <Calendar 
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                      onClick={() => {
                        if (dateInputRef.current) {
                          try {
                            // Try showPicker() first (modern browsers)
                            if (typeof dateInputRef.current.showPicker === 'function') {
                              dateInputRef.current.showPicker();
                            } else {
                              // Fallback to click() for older browsers
                              dateInputRef.current.click();
                            }
                          } catch {
                            // Fallback if showPicker fails
                            dateInputRef.current.click();
                          }
                        }
                      }}
                    />
                  </div>
                  {errors.weddingDate && (
                    <p className="text-sm text-red-500">{errors.weddingDate}</p>
                  )}
                </div>

                {/* Wedding Time */}
                <div className="space-y-2">
                  <Label htmlFor="weddingTime">Wedding Time *</Label>
                  <div className="relative">
                    <Input
                      ref={timeInputRef}
                      id="weddingTime"
                      type="time"
                      value={weddingTime}
                      onChange={(e) => setWeddingTime(e.target.value)}
                      className={cn(
                        errors.weddingTime ? 'border-red-500' : '', 
                        'pr-10',
                        '[&::-webkit-calendar-picker-indicator]:hidden',
                        '[&::-webkit-calendar-picker-indicator]:appearance-none'
                      )}
                    />
                    <Clock 
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                      onClick={() => {
                        if (timeInputRef.current) {
                          try {
                            // Try showPicker() first (modern browsers)
                            if (typeof timeInputRef.current.showPicker === 'function') {
                              timeInputRef.current.showPicker();
                            } else {
                              // Fallback to click() for older browsers
                              timeInputRef.current.click();
                            }
                          } catch {
                            // Fallback if showPicker fails
                            timeInputRef.current.click();
                          }
                        }
                      }}
                    />
                  </div>
                  {errors.weddingTime && (
                    <p className="text-sm text-red-500">{errors.weddingTime}</p>
                  )}
                </div>
              </div>

              {/* Venue */}
              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Input
                  id="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Enter venue name..."
                  className={cn(errors.venue ? 'border-red-500' : '')}
                  disabled={loading}
                />
                {errors.venue && (
                  <p className="text-sm text-red-500">{errors.venue}</p>
                )}
              </div>

              {/* Payment Status */}
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status *</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger id="paymentStatus" className={errors.paymentStatus ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentStatus && (
                  <p className="text-sm text-red-500">{errors.paymentStatus}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Wedding
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Weddings;
