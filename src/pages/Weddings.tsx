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
  Clock
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
import VenueAutocomplete from '@/components/VenueAutocomplete';
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
import { weddingsAPI, couplesAPI } from '@/api';

const Weddings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [weddings, setWeddings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [couples, setCouples] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Refs for date/time inputs
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [selectedCoupleId, setSelectedCoupleId] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [weddingTime, setWeddingTime] = useState('');
  const [venue, setVenue] = useState('');
  const [venuePlaceId, setVenuePlaceId] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch couples list
  useEffect(() => {
    fetchCouples();
  }, []);

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

  // Fetch weddings
  useEffect(() => {
    fetchWeddings();
  }, []);

  const fetchWeddings = async () => {
    setLoading(true);
    try {
      const response = await weddingsAPI.getAll();
      setWeddings(response.data || []);
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
    setVenuePlaceId('');
    setVenueAddress('');
    setPaymentStatus('');
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
                {weddings.reduce((sum, wedding) => sum + wedding.guestCount, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${weddings.reduce((sum, wedding) => sum + wedding.totalCost, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weddings.filter(w => w.paymentStatus === 'pending').length}
              </div>
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
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Couple</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWeddings.map((wedding) => (
                  <TableRow 
                    key={wedding.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/dashboard/weddings/${wedding.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{wedding.couple}</div>
                        <div className="text-sm text-muted-foreground">
                          {wedding.plannerContact}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{new Date(wedding.weddingDate).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {wedding.weddingTime}
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
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {wedding.guestCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">${wedding.totalCost.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Prod: ${wedding.productionCost.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(wedding.paymentStatus)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/weddings/${wedding.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
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

              {/* Venue - Autocomplete (optional) or text input */}
              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <VenueAutocomplete
                  value={venue}
                  onChange={(value) => {
                    setVenue(value);
                    if (!value) {
                      setVenuePlaceId('');
                      setVenueAddress('');
                    }
                  }}
                  onPlaceSelect={(place) => {
                    setVenue(place.name);
                    setVenuePlaceId(place.placeId);
                    setVenueAddress(place.address);
                  }}
                  placeholder="Enter or search for a venue..."
                  error={!!errors.venue}
                />
                {venueAddress && venueAddress !== venue && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {venueAddress}
                  </p>
                )}
                {errors.venue && (
                  <p className="text-sm text-red-500">{errors.venue}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  You can type a venue name directly or use autocomplete suggestions if available
                </p>
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
