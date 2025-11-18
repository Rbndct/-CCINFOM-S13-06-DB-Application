import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Hash,
  Heart,
  CheckCircle,
  AlertCircle
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
import DashboardLayout from '@/components/layout/DashboardLayout';
import { weddingsAPI, couplesAPI, guestsAPI } from '@/api';
import { useCurrencyFormat } from '@/utils/currency';
import { getTypeIcon, getTypeColor, getSeverityBadge, formatRestrictionsList, getRestrictionCountText } from '@/utils/restrictionUtils';
import { CeremonyTypeBadge } from '@/utils/ceremonyTypeUtils';
import { useDateFormat } from '@/context/DateFormatContext';
import { useTimeFormat } from '@/context/TimeFormatContext';

const Weddings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatCurrency } = useCurrencyFormat();
  const { formatDate } = useDateFormat();
  const { formatTime } = useTimeFormat();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [plannerFilter, setPlannerFilter] = useState('');
  const [hasRestrictions, setHasRestrictions] = useState<string | undefined>();
  const [filterWeddingType, setFilterWeddingType] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWeddingId, setEditingWeddingId] = useState<number | null>(null);
  const [couples, setCouples] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Refs for date/time inputs
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const dateFromInputRef = useRef<HTMLInputElement>(null);
  const dateToInputRef = useRef<HTMLInputElement>(null);
  
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

  // Fetch weddings using React Query with caching
  const { data: weddings = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['weddings', filterStatus, dateFrom, dateTo, venueFilter, plannerFilter, hasRestrictions, filterWeddingType],
    queryFn: async () => {
      const response = await weddingsAPI.getAll({
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        venue: venueFilter || undefined,
        planner_contact: plannerFilter || undefined,
        has_restrictions: hasRestrictions,
      });
      const weddingsData = response.data || [];
      
      // Calculate total guests by fetching actual guest counts and update wedding data
      let total = 0;
      try {
        const weddingsWithGuestCounts = await Promise.all(weddingsData.map(async (wedding: any) => {
          // Use actualGuestCount from backend if available, otherwise fetch it
          if (wedding.actualGuestCount !== undefined && wedding.actualGuestCount !== null) {
            total += wedding.actualGuestCount;
            return {
              ...wedding,
              guest_count: wedding.actualGuestCount,
              guestCount: wedding.actualGuestCount
            };
          }
          try {
            const guestsResponse = await guestsAPI.getAll({ wedding_id: wedding.wedding_id || wedding.id });
            const guestCount = (guestsResponse.data || []).length;
            total += guestCount;
            return {
              ...wedding,
              guest_count: guestCount,
              guestCount: guestCount,
              actualGuestCount: guestCount
            };
          } catch (e) {
            const fallbackCount = wedding.guest_count || wedding.guestCount || 0;
            total += fallbackCount;
            return {
              ...wedding,
              guest_count: fallbackCount,
              guestCount: fallbackCount,
              actualGuestCount: fallbackCount
            };
          }
        }));
        return weddingsWithGuestCounts;
      } catch (e) {
        console.error('Error calculating guest counts:', e);
        // Fallback to guest_count field if available
        return weddingsData;
      }
    },
    onError: (error: any) => {
      console.error('Error fetching weddings:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load weddings. Make sure backend is running.',
        variant: 'destructive',
      });
    },
  });

  const getPaymentStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const capitalizeStatus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    
    if (statusLower === 'paid' || statusLower === 'completed') {
      return <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 border flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3 dark:text-green-300" />Paid</Badge>;
    } else if (statusLower === 'pending' || statusLower === 'partial') {
      return <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700 border flex items-center gap-1 w-fit"><Clock className="w-3 h-3 dark:text-yellow-300" />{capitalizeStatus(status)}</Badge>;
    } else if (statusLower === 'unpaid' || statusLower === 'overdue') {
      return <Badge variant="destructive" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700 border flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3 dark:text-red-300" />{capitalizeStatus(status)}</Badge>;
    }
    return <Badge variant="outline" className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">{capitalizeStatus(status)}</Badge>;
  };

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    const stored = localStorage.getItem('default_table_sort_order');
    return (stored as 'asc' | 'desc') || 'desc';
  });

  const filteredWeddings = useMemo(() => {
    const filtered = weddings.filter(wedding => {
      const matchesSearch = wedding.couple.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           wedding.venue.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || wedding.paymentStatus === filterStatus;
      const matchesWeddingType = filterWeddingType === 'all' || wedding.ceremony_type === filterWeddingType;
      return matchesSearch && matchesFilter && matchesWeddingType;
    });
    
    // Sort by wedding ID using default sort order
    return filtered.sort((a, b) => {
      const aId = a.wedding_id || a.id || 0;
      const bId = b.wedding_id || b.id || 0;
      return sortOrder === 'asc' ? aId - bId : bId - aId;
    });
  }, [weddings, searchTerm, filterStatus, sortOrder, filterWeddingType]);

  // Calculate total guests from weddings data (always in sync, even with cached data)
  const totalGuests = useMemo(() => {
    return weddings.reduce((sum, wedding) => {
      return sum + (wedding.actualGuestCount || wedding.guestCount || wedding.guest_count || 0);
    }, 0);
  }, [weddings]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredWeddings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWeddings = filteredWeddings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

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
    setEditingWeddingId(null);
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
      if (editingWeddingId) {
        // Update existing wedding
        await weddingsAPI.update(editingWeddingId, {
          couple_id: parseInt(selectedCoupleId),
          wedding_date: weddingDate,
          wedding_time: weddingTime,
          venue: venue.trim(),
          payment_status: paymentStatus,
          preference_id: selectedPreferenceId ? parseInt(selectedPreferenceId) : null,
        });

        toast({
          title: 'Wedding Updated',
          description: 'Wedding details have been updated successfully',
        });
      } else {
        // Create new wedding
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

        toast({
          title: 'Wedding Created',
          description: `Wedding for ${response.data.couple} has been created successfully`,
        });
      }

      // Refresh weddings list
      refetch();

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
              <p className="text-xs text-muted-foreground mt-1">
                {(() => {
                  const currentYear = new Date().getFullYear();
                  const thisYearWeddings = weddings.filter((w: any) => {
                    const weddingDate = w.wedding_date || w.weddingDate;
                    if (!weddingDate) return false;
                    const date = new Date(weddingDate);
                    return date.getFullYear() === currentYear;
                  }).length;
                  return thisYearWeddings > 0 
                    ? `${thisYearWeddings} scheduled for ${currentYear}`
                    : 'All weddings in system';
                })()}
              </p>
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
              <p className="text-xs text-muted-foreground mt-1">
                {totalGuests > 0 
                  ? `Attending across ${weddings.length} ${weddings.length === 1 ? 'wedding' : 'weddings'}`
                  : 'No guests registered yet'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Meals Served</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weddings.reduce((sum, wedding) => sum + (wedding.actualGuestCount || wedding.guestCount || 0), 0)}
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
            <CardTitle>Wedding Directory</CardTitle>
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
                  setFilterWeddingType('all');
                  setSearchTerm('');
                }}
              >
                Reset Filters
              </Button>
            </div>

            {showFilters && (
              <div className="grid md:grid-cols-5 gap-3 mb-4">
                <div>
                  <label className="text-sm text-muted-foreground">From</label>
                  <div className="relative">
                    <Input 
                      ref={dateFromInputRef}
                      type="date" 
                      value={dateFrom} 
                      onChange={(e) => setDateFrom(e.target.value)}
                      placeholder="mm/dd/yyyy"
                      className="pr-10"
                    />
                    <Calendar 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" 
                      onClick={() => dateFromInputRef.current?.showPicker?.() || dateFromInputRef.current?.click()}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">To</label>
                  <div className="relative">
                    <Input 
                      ref={dateToInputRef}
                      type="date" 
                      value={dateTo} 
                      onChange={(e) => setDateTo(e.target.value)}
                      placeholder="mm/dd/yyyy"
                      className="pr-10"
                    />
                    <Calendar 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" 
                      onClick={() => dateToInputRef.current?.showPicker?.() || dateToInputRef.current?.click()}
                    />
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
                  <Select value={hasRestrictions ?? 'any'} onValueChange={(val) => setHasRestrictions(val === 'any' ? undefined : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="Y">Yes (weddings with dietary restrictions)</SelectItem>
                      <SelectItem value="N">No (weddings without dietary restrictions)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Wedding Type</label>
                  <Select value={filterWeddingType} onValueChange={setFilterWeddingType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Civil">Civil</SelectItem>
                      <SelectItem value="Church">Church</SelectItem>
                      <SelectItem value="Garden">Garden</SelectItem>
                      <SelectItem value="Beach">Beach</SelectItem>
                      <SelectItem value="Outdoor">Outdoor</SelectItem>
                      <SelectItem value="Indoor">Indoor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wedding ID</TableHead>
                  <TableHead>Couple</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Type & Restrictions</TableHead>
                  <TableHead># of Guests</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWeddings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No weddings found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedWeddings.map((wedding) => (
                  <TableRow 
                    key={wedding.id || wedding.wedding_id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/dashboard/weddings/${wedding.id || wedding.wedding_id}`)}
                  >
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      #{wedding.id || wedding.wedding_id}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="text-xs font-mono flex items-center gap-1 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 flex-shrink-0 mt-0.5 w-[60px] justify-center">
                            <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            {wedding.couple_id}
                          </Badge>
                          <div className="font-semibold min-w-0 flex-1">{wedding.couple || (wedding.partner1_name && wedding.partner2_name ? `${wedding.partner1_name} & ${wedding.partner2_name}` : 'N/A')}</div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {wedding.plannerContact || wedding.planner_contact || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            {(() => {
                              try {
                                const date = wedding.weddingDate || wedding.wedding_date;
                                if (!date) return 'N/A';
                                const d = typeof date === 'string' ? new Date(date) : date;
                                return isNaN(d.getTime()) ? 'N/A' : formatDate(d);
                              } catch {
                                return 'N/A';
                              }
                            })()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm text-muted-foreground">
                            {(() => {
                              const time = wedding.weddingTime || wedding.wedding_time;
                              if (!time) return 'N/A';
                              try {
                                // If time is in HH:MM format, create a date object for formatting
                                if (typeof time === 'string' && time.match(/^\d{2}:\d{2}/)) {
                                  const [hours, minutes] = time.split(':');
                                  const date = new Date();
                                  date.setHours(parseInt(hours), parseInt(minutes));
                                  return formatTime(date);
                                }
                                return time;
                              } catch {
                                return time;
                              }
                            })()}
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
                        {(() => {
                          const hasType = wedding.ceremony_type;
                          const restrictions = wedding.all_restrictions || wedding.restrictions || [];
                          const hasRestrictions = restrictions.length > 0;
                          
                          if (!hasType && !hasRestrictions) {
                            return (
                              <span className="text-xs text-muted-foreground">No preference/s</span>
                            );
                          }
                          
                          return (
                            <>
                              {hasType && (
                                <div>
                                  <CeremonyTypeBadge type={wedding.ceremony_type} />
                                </div>
                              )}
                              {hasRestrictions && (
                                <div className="space-y-0.5">
                                  {restrictions.slice(0, 1).map((r: any) => (
                                    <Badge 
                                      key={r.restriction_id} 
                                      className={`${getTypeColor(r.restriction_type || '')} border text-xs flex items-center gap-1 w-fit`}
                                    >
                                      {(() => {
                                        const Icon = getTypeIcon(r.restriction_type || '');
                                        return <Icon className="h-3 w-3" />;
                                      })()}
                                      {r.restriction_name}
                                    </Badge>
                                  ))}
                                  {restrictions.length > 1 && (
                                    <Badge variant="outline" className="text-xs w-fit dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
                                      +{restrictions.length - 1} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{wedding.guestCount ?? wedding.guest_count ?? 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{formatCurrency(wedding.equipmentRentalCost || wedding.equipment_rental_cost || wedding.totalCost || wedding.total_cost || 0)}</div>
                        <div className="text-sm text-muted-foreground">
                          Food: {formatCurrency(wedding.foodCost || wedding.food_cost || wedding.productionCost || wedding.production_cost || 0)}
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
                            onClick={async () => {
                              setEditingWeddingId(wedding.id || wedding.wedding_id);
                              setSelectedCoupleId((wedding.couple_id || wedding.coupleId || '').toString());
                              setWeddingDate(wedding.wedding_date || wedding.weddingDate || '');
                              setWeddingTime(wedding.wedding_time || wedding.weddingTime || '');
                              setVenue(wedding.venue || '');
                              setPaymentStatus(wedding.payment_status || wedding.paymentStatus || 'pending');
                              setSelectedPreferenceId((wedding.preference_id || wedding.pref_id || '').toString());
                              // Fetch couple preferences
                              if (wedding.couple_id || wedding.coupleId) {
                                try {
                                  const prefResponse = await couplesAPI.getPreferences((wedding.couple_id || wedding.coupleId).toString());
                                  setCouplePreferences(prefResponse.data || []);
                                } catch (e) {
                                  console.error('Error fetching preferences:', e);
                                  setCouplePreferences([]);
                                }
                              }
                              setDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={async () => {
                              if (!confirm('Delete this wedding?')) return;
                              try {
                                await weddingsAPI.delete(wedding.id);
                                refetch();
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredWeddings.length)} of {filteredWeddings.length} weddings
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
          </CardContent>
        </Card>

        {/* Add Wedding Dialog */}
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" key={dialogOpen ? 'open' : 'closed'}>
            <DialogHeader>
              <DialogTitle>{editingWeddingId ? 'Edit Wedding' : 'Add New Wedding'}</DialogTitle>
              <DialogDescription>
                {editingWeddingId ? 'Update wedding information' : 'Fill in all the required information to create a new wedding'}
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
                    {couples.map((couple) => {
                      const coupleValue = couple.id ? couple.id.toString() : `couple-${couple.couple_id || 'unknown'}`;
                      return (
                        <SelectItem key={couple.id || couple.couple_id || coupleValue} value={coupleValue}>
                          {couple.partner1_name} & {couple.partner2_name}
                        </SelectItem>
                      );
                    })}
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
                          <SelectItem key={pref.preference_id || `pref-${pref.ceremony_type}`} value={pref.preference_id ? pref.preference_id.toString() : `pref-${pref.ceremony_type || 'unknown'}`}>
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
                          <CeremonyTypeBadge type={selectedPref.ceremony_type} />
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
                                    {(() => {
                                      const Icon = getTypeIcon(restriction.restriction_type || '');
                                      return <Icon className="h-3 w-3" />;
                                    })()}
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
