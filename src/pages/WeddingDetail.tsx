import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Utensils,
  Package,
  Warehouse,
  UserCheck,
  Clock,
  CheckCircle,
  Edit,
  Settings,
  Plus,
  Loader2,
  UtensilsCrossed,
  LayoutGrid
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { tablesAPI, weddingsAPI } from '@/api';

const WeddingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wedding, setWedding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Guests state
  const [guests, setGuests] = useState<any[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dietaryRestriction, setDietaryRestriction] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState('pending');
  const [guestFormErrors, setGuestFormErrors] = useState<Record<string, string>>({});
  const [guestFormLoading, setGuestFormLoading] = useState(false);
  
  // Tables state
  const [tables, setTables] = useState<any[]>([]);
  const [seatingLoading, setSeatingLoading] = useState(false);
  const [tableCategory, setTableCategory] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [tableCapacity, setTableCapacity] = useState('');
  const [tableFormErrors, setTableFormErrors] = useState<Record<string, string>>({});
  const [tableFormLoading, setTableFormLoading] = useState(false);
  
  // Guest allocation state
  const [allocationTableId, setAllocationTableId] = useState('');
  const [allocationGuestId, setAllocationGuestId] = useState('');
  const [allocationLoading, setAllocationLoading] = useState(false);
  
  // Bulk assignment state
  const [bulkAssignmentOpen, setBulkAssignmentOpen] = useState(false);
  const [selectedGuestIds, setSelectedGuestIds] = useState<number[]>([]);
  const [bulkTableId, setBulkTableId] = useState('');
  const [bulkAssignmentLoading, setBulkAssignmentLoading] = useState(false);
  
  // Table packages state
  const [tablePackageAssignments, setTablePackageAssignments] = useState<any[]>([]);
  const [packageAssignTableId, setPackageAssignTableId] = useState('');
  const [packageAssignPackageId, setPackageAssignPackageId] = useState('');
  const [packageFormLoading, setPackageFormLoading] = useState(false);
  
  // Available packages for this wedding
  const [availablePackages] = useState<any[]>([]);

  useEffect(() => {
    const loadWedding = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await weddingsAPI.getById(Number(id));
        setWedding(response.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          toast({
            title: 'Wedding not found',
            description: 'The wedding you are looking for does not exist.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: error.response?.data?.message || error.message || 'Failed to load wedding details.',
            variant: 'destructive',
          });
        }
        navigate('/dashboard/weddings');
      } finally {
        setLoading(false);
      }
    };
    loadWedding();
  }, [id, navigate, toast]);

  useEffect(() => {
    const loadSeating = async () => {
      if (!id) return;
      setSeatingLoading(true);
      try {
        const resp = await tablesAPI.getSeating(id);
        setTables(resp.data || []);
      } catch {}
      setSeatingLoading(false);
    };
    loadSeating();
  }, [id]);

  const ensureCoupleTable = async () => {
    if (!id) return;
    try {
      await tablesAPI.createCoupleTable(id);
      const resp = await tablesAPI.getSeating(id);
      setTables(resp.data || []);
      toast({ title: 'Couple Table Created' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.error || 'Failed to create couple table', variant: 'destructive' });
    }
  };

  const addGuestTable = async (capacity: number) => {
    if (!id) return;
    try {
      await tablesAPI.createGuestTable(id, capacity);
      const resp = await tablesAPI.getSeating(id);
      setTables(resp.data || []);
      toast({ title: 'Guest Table Created', description: `Capacity ${capacity}` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.error || 'Failed to create guest table', variant: 'destructive' });
    }
  };
  
  // Helper function to get assigned table for a guest
  const getGuestAssignedTable = (guestId: number) => {
    const table = tables.find(t => t.assignedGuests?.includes(guestId));
    return table ? table.tableNumber : null;
  };

  // Guest form handlers
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!dietaryRestriction) newErrors.dietaryRestriction = 'Dietary restriction is required';
    
    setGuestFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setGuestFormLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newGuest = {
        id: Date.now(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dietaryRestriction: dietaryRestriction,
        rsvpStatus: rsvpStatus,
        weddingId: parseInt(id || '1')
      };
      
      setGuests([...guests, newGuest]);
      
      // Reset form
      setFirstName('');
      setLastName('');
      setDietaryRestriction('');
      setRsvpStatus('pending');
      setGuestFormErrors({});
      
      toast({
        title: 'Guest Added',
        description: `${newGuest.firstName} ${newGuest.lastName} has been added successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add guest. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGuestFormLoading(false);
    }
  };
  
  // Table form handlers
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!tableCategory) newErrors.tableCategory = 'Table category is required';
    if (!tableNumber.trim()) newErrors.tableNumber = 'Table number is required';
    if (!tableCapacity || parseInt(tableCapacity) <= 0) {
      newErrors.tableCapacity = 'Valid capacity is required';
    }
    
    setTableFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly',
        variant: 'destructive',
      });
      return;
    }
    
    setTableFormLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTable = {
        id: Date.now(),
        tableNumber: tableNumber.trim(),
        category: tableCategory,
        capacity: parseInt(tableCapacity),
        weddingId: parseInt(id || '1'),
        assignedGuests: []
      };
      
      setTables([...tables, newTable]);
      
      // Reset form
      setTableCategory('');
      setTableNumber('');
      setTableCapacity('');
      setTableFormErrors({});
      
      toast({
        title: 'Table Added',
        description: `Table ${newTable.tableNumber} has been added successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add table. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setTableFormLoading(false);
    }
  };
  
  // Guest allocation handler
  const handleAllocateGuest = async () => {
    if (!allocationTableId || !allocationGuestId) {
      toast({
        title: 'Validation Error',
        description: 'Please select both a table and a guest',
        variant: 'destructive',
      });
      return;
    }
    
    // Get table and guest info before updating state
    const table = tables.find(t => t.id.toString() === allocationTableId);
    const guest = guests.find(g => g.id.toString() === allocationGuestId);
    
    if (!table || !guest) {
      toast({
        title: 'Error',
        description: 'Selected table or guest not found',
        variant: 'destructive',
      });
      return;
    }
    
    const guestId = parseInt(allocationGuestId);
    
    // Check if guest is already assigned to this table
    if (table.assignedGuests?.includes(guestId)) {
      toast({
        title: 'Error',
        description: 'This guest is already assigned to this table',
        variant: 'destructive',
      });
      return;
    }
    
    setAllocationLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update table's assigned guests
      setTables(tables.map(t => {
        if (t.id.toString() === allocationTableId) {
          return {
            ...t,
            assignedGuests: [...(t.assignedGuests || []), guestId]
          };
        }
        return t;
      }));
      
      // Reset form
      setAllocationTableId('');
      setAllocationGuestId('');
      
      toast({
        title: 'Guest Assigned',
        description: `${guest.firstName} ${guest.lastName} assigned to ${table.tableNumber}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign guest. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAllocationLoading(false);
    }
  };
  
  // Bulk assignment handler
  const handleBulkAssign = async () => {
    if (selectedGuestIds.length === 0 || !bulkTableId) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one guest and a table',
        variant: 'destructive',
      });
      return;
    }
    
    const table = tables.find(t => t.id.toString() === bulkTableId);
    if (!table) {
      toast({
        title: 'Error',
        description: 'Selected table not found',
        variant: 'destructive',
      });
      return;
    }
    
    const currentAssigned = table.assignedGuests || [];
    const available = table.capacity - currentAssigned.length;
    
    if (selectedGuestIds.length > available) {
      toast({
        title: 'Error',
        description: `Table ${table.tableNumber} only has ${available} available seats`,
        variant: 'destructive',
      });
      return;
    }
    
    setBulkAssignmentLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update table's assigned guests
      setTables(tables.map(t => {
        if (t.id.toString() === bulkTableId) {
          const newGuests = [...(t.assignedGuests || []), ...selectedGuestIds];
          return {
            ...t,
            assignedGuests: newGuests
          };
        }
        return t;
      }));
      
      // Reset form
      setSelectedGuestIds([]);
      setBulkTableId('');
      setBulkAssignmentOpen(false);
      
      toast({
        title: 'Guests Assigned',
        description: `${selectedGuestIds.length} guest(s) assigned to ${table.tableNumber}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign guests. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBulkAssignmentLoading(false);
    }
  };

  // Helper to get unassigned guests
  const getUnassignedGuests = () => {
    const assignedGuestIds = new Set(tables.flatMap(t => t.assignedGuests || []));
    return guests.filter(g => !assignedGuestIds.has(g.id));
  };

  // Helper to get table package
  const getTablePackage = (tableId: number) => {
    return tablePackageAssignments.find(a => a.tableId === tableId);
  };

  // Package assignment handler
  const handleAssignPackage = async () => {
    if (!packageAssignTableId || !packageAssignPackageId) {
      toast({
        title: 'Validation Error',
        description: 'Please select both a table and a package',
        variant: 'destructive',
      });
      return;
    }
    
    setPackageFormLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const table = tables.find(t => t.id.toString() === packageAssignTableId);
      const pkg = availablePackages.find(p => p.id.toString() === packageAssignPackageId);
      
      const newAssignment = {
        id: Date.now(),
        tableId: parseInt(packageAssignTableId),
        tableNumber: table?.tableNumber || '',
        packageId: parseInt(packageAssignPackageId),
        packageName: pkg?.packageName || '',
        packageType: pkg?.packageType || '',
        weddingId: parseInt(id || '1')
      };
      
      // Check if assignment already exists
      const existing = tablePackageAssignments.find(
        a => a.tableId === newAssignment.tableId && a.packageId === newAssignment.packageId
      );
      
      if (existing) {
        toast({
          title: 'Error',
          description: 'This package is already assigned to this table',
          variant: 'destructive',
        });
        return;
      }
      
      setTablePackageAssignments([...tablePackageAssignments, newAssignment]);
      
      // Reset form
      setPackageAssignTableId('');
      setPackageAssignPackageId('');
      
      toast({
        title: 'Package Assigned',
        description: `${newAssignment.packageName} assigned to ${newAssignment.tableNumber}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign package. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPackageFormLoading(false);
    }
  };
  
  // Helper functions
  const getRsvpStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };
  
  const getTableCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'VIP': 'bg-purple-100 text-purple-800',
      'Kids': 'bg-blue-100 text-blue-800',
      'Partners': 'bg-pink-100 text-pink-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>{category}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading wedding details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!wedding) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Wedding not found</p>
            <Button onClick={() => navigate('/dashboard/weddings')} className="mt-4">
              Back to Weddings
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Partial</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/weddings')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{wedding.couple}</h1>
              <p className="text-muted-foreground">
                Wedding Dashboard - {new Date(wedding.weddingDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              Edit Wedding
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Key Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wedding Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(wedding.weddingDate).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">{wedding.weddingTime}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Venue</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{wedding.venue}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wedding.guestCount ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Track confirmed RSVPs once guest data is available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mb-2">{getPaymentStatusBadge(wedding.paymentStatus)}</div>
              <p className="text-xs text-muted-foreground">
                Total: ${Number(wedding.totalCost ?? 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Interface */}
        <Tabs defaultValue="guests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="guests" className="gap-2">
              <Users className="h-4 w-4" />
              Guests
            </TabsTrigger>
            <TabsTrigger value="tables" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Seating Overview
            </TabsTrigger>
            <TabsTrigger value="table-packages" className="gap-2">
              <Package className="h-4 w-4" />
              Table Packages
            </TabsTrigger>
          </TabsList>

          {/* Guests Tab */}
          <TabsContent value="guests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Guest</CardTitle>
                <CardDescription>Add a new guest to this wedding</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddGuest} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        className={guestFormErrors.firstName ? 'border-red-500' : ''}
                        disabled={guestFormLoading}
                      />
                      {guestFormErrors.firstName && (
                        <p className="text-sm text-red-500">{guestFormErrors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        className={guestFormErrors.lastName ? 'border-red-500' : ''}
                        disabled={guestFormLoading}
                      />
                      {guestFormErrors.lastName && (
                        <p className="text-sm text-red-500">{guestFormErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dietaryRestriction">Dietary Restriction *</Label>
                    <Select 
                      value={dietaryRestriction} 
                      onValueChange={setDietaryRestriction} 
                      disabled={guestFormLoading}
                    >
                      <SelectTrigger 
                        id="dietaryRestriction" 
                        className={guestFormErrors.dietaryRestriction ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder="Select dietary restriction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="Vegan">Vegan</SelectItem>
                        <SelectItem value="Halal">Halal</SelectItem>
                        <SelectItem value="Allergic">Allergic</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                    {guestFormErrors.dietaryRestriction && (
                      <p className="text-sm text-red-500">{guestFormErrors.dietaryRestriction}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rsvpStatus">RSVP Status *</Label>
                    <Select value={rsvpStatus} onValueChange={setRsvpStatus} disabled={guestFormLoading}>
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
                  <Button type="submit" disabled={guestFormLoading}>
                    {guestFormLoading ? (
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
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guest List</CardTitle>
                <CardDescription>All guests for this wedding</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Dietary Restriction</TableHead>
                      <TableHead>RSVP Status</TableHead>
                      <TableHead>Assigned Table</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No guests added yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      guests.map((guest) => {
                        const assignedTable = getGuestAssignedTable(guest.id);
                        return (
                          <TableRow key={guest.id}>
                            <TableCell className="font-medium">
                              {guest.firstName} {guest.lastName}
                            </TableCell>
                            <TableCell>
                              {guest.dietaryRestriction || <span className="text-muted-foreground">None</span>}
                            </TableCell>
                            <TableCell>{getRsvpStatusBadge(guest.rsvpStatus)}</TableCell>
                            <TableCell>
                              {assignedTable ? (
                                <Badge variant="outline">{assignedTable}</Badge>
                              ) : (
                                <span className="text-muted-foreground">Not assigned</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tables Tab */}
          <TabsContent value="tables" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Table</CardTitle>
                <CardDescription>Add a new table to this wedding</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTable} className="space-y-4">
                {/* Mandatory Couple Table CTA */}
                {tables.filter(t => t.table_category === 'couple').length === 0 && (
                  <div className="p-3 rounded border bg-muted/30 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Couple Table Required</p>
                      <p className="text-xs text-muted-foreground">Create the couple table before adding guest tables.</p>
                    </div>
                    <Button onClick={(e) => { e.preventDefault(); ensureCoupleTable(); }} disabled={seatingLoading}>Create Couple Table</Button>
                  </div>
                )}
                  <div className="space-y-2">
                    <Label htmlFor="tableCategory">Table Category *</Label>
                    <Select value={tableCategory} onValueChange={setTableCategory} disabled={tableFormLoading}>
                      <SelectTrigger id="tableCategory" className={tableFormErrors.tableCategory ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select table category" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="couple">Couple</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                    {tableFormErrors.tableCategory && (
                      <p className="text-sm text-red-500">{tableFormErrors.tableCategory}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tableCapacity">Capacity *</Label>
                      <Input
                        id="tableCapacity"
                        type="number"
                        value={tableCapacity}
                        onChange={(e) => setTableCapacity(e.target.value)}
                      placeholder="6-10 for guest tables"
                      min="6"
                      max="10"
                        className={tableFormErrors.tableCapacity ? 'border-red-500' : ''}
                        disabled={tableFormLoading}
                      />
                      {tableFormErrors.tableCapacity && (
                        <p className="text-sm text-red-500">{tableFormErrors.tableCapacity}</p>
                      )}
                    </div>
                  </div>
                  <Button type="submit" disabled={tableFormLoading}>
                    {tableFormLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Table
                      </>
                    )}
                  </Button>
                <div className="flex gap-2 mt-2">
                  <Button type="button" variant="outline" onClick={() => addGuestTable(6)} disabled={tables.filter(t => t.table_category === 'couple').length === 0}>Quick Add Guest Table (6)</Button>
                  <Button type="button" variant="outline" onClick={() => addGuestTable(10)} disabled={tables.filter(t => t.table_category === 'couple').length === 0}>Quick Add Guest Table (10)</Button>
                </div>
                </form>
              </CardContent>
            </Card>

            {/* Tables Grid View */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Tables</h3>
                <p className="text-sm text-muted-foreground">Manage table assignments and seating</p>
              </div>
              <Button 
                onClick={() => setBulkAssignmentOpen(true)}
                disabled={getUnassignedGuests().length === 0 || tables.length === 0}
              >
                <Users className="w-4 h-4 mr-2" />
                Bulk Assign Guests
              </Button>
            </div>

            {tables.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No tables added yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => {
                  const assignedCount = table.assignedGuests?.length || 0;
                  const available = table.capacity - assignedCount;
                  const assignedGuestsList = guests.filter(g => table.assignedGuests?.includes(g.id));
                  const tablePackage = getTablePackage(table.id);
                  
                  return (
                    <Card key={table.id} className="flex flex-col">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{table.tableNumber}</CardTitle>
                          {getTableCategoryBadge(table.category)}
                        </div>
                        <CardDescription>
                          Capacity: {table.capacity} | Assigned: {assignedCount} | Available: {available}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-3">
                        {tablePackage && (
                          <div className="pb-2 border-b">
                            <Badge variant="outline" className="gap-1">
                              <Package className="w-3 h-3" />
                              {tablePackage.packageName}
                            </Badge>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium mb-2">Assigned Guests:</p>
                          {assignedGuestsList.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No guests assigned</p>
                          ) : (
                            <ul className="space-y-1">
                              {assignedGuestsList.map((guest) => (
                                <li key={guest.id} className="flex items-center gap-2 text-sm">
                                  <span>{guest.firstName} {guest.lastName}</span>
                                  {guest.dietaryRestriction && guest.dietaryRestriction !== 'None' && (
                                    <Badge variant="secondary" className="text-xs">
                                      {guest.dietaryRestriction}
                                    </Badge>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Individual Guest Assignment (Fallback) */}
            <Card>
              <CardHeader>
                <CardTitle>Assign Single Guest to Table</CardTitle>
                <CardDescription>Allocate a single guest to a specific table</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="allocationTable">Table</Label>
                      <Select value={allocationTableId} onValueChange={setAllocationTableId} disabled={allocationLoading || tables.length === 0}>
                        <SelectTrigger id="allocationTable">
                          <SelectValue placeholder="Select a table" />
                        </SelectTrigger>
                        <SelectContent>
                          {tables.map((table) => (
                            <SelectItem key={table.id} value={table.id.toString()}>
                              {table.tableNumber} ({table.category}) - {table.capacity - (table.assignedGuests?.length || 0)} available
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="allocationGuest">Guest</Label>
                      <Select value={allocationGuestId} onValueChange={setAllocationGuestId} disabled={allocationLoading || guests.length === 0}>
                        <SelectTrigger id="allocationGuest">
                          <SelectValue placeholder="Select a guest" />
                        </SelectTrigger>
                        <SelectContent>
                          {guests.map((guest) => (
                            <SelectItem key={guest.id} value={guest.id.toString()}>
                              {guest.firstName} {guest.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleAllocateGuest} disabled={allocationLoading || tables.length === 0 || guests.length === 0}>
                    {allocationLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Assign
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seating Layout Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>View Seating Layout</CardTitle>
                <CardDescription>Visual representation of table arrangements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg border p-6">
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {tables.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        Add tables to see seating layout
                      </div>
                    ) : (
                      tables.map((table) => {
                        const assignedCount = table.assignedGuests?.length || 0;
                        const available = table.capacity - assignedCount;
                        const categoryColors: Record<string, string> = {
                          'VIP': 'bg-purple-200 border-purple-400',
                          'Kids': 'bg-blue-200 border-blue-400',
                          'Partners': 'bg-pink-200 border-pink-400',
                          'General': 'bg-gray-200 border-gray-400'
                        };
                        return (
                          <div
                            key={table.id}
                            className={`aspect-square rounded-lg border-2 p-2 flex flex-col items-center justify-center text-xs ${categoryColors[table.category] || 'bg-gray-200 border-gray-400'}`}
                          >
                            <div className="font-semibold">{table.tableNumber}</div>
                            <div className="text-[10px] mt-1">{assignedCount}/{table.capacity}</div>
                            {available === 0 && <div className="text-[10px] text-red-600 mt-0.5">Full</div>}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Interactive seating layout visualization coming soon
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Assignment Modal */}
            <Dialog open={bulkAssignmentOpen} onOpenChange={setBulkAssignmentOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Bulk Assign Guests to Table</DialogTitle>
                  <DialogDescription>
                    Select multiple guests and assign them to a table at once
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 py-4">
                  {/* Unassigned Guests List */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Unassigned Guests ({getUnassignedGuests().length})</h4>
                    <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto">
                      {getUnassignedGuests().length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          All guests are assigned
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {getUnassignedGuests().map((guest) => (
                            <div key={guest.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted">
                              <Checkbox
                                checked={selectedGuestIds.includes(guest.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedGuestIds([...selectedGuestIds, guest.id]);
                                  } else {
                                    setSelectedGuestIds(selectedGuestIds.filter(id => id !== guest.id));
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {guest.firstName} {guest.lastName}
                                </p>
                                {guest.dietaryRestriction && guest.dietaryRestriction !== 'None' && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {guest.dietaryRestriction}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Table Selection */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Select Table</h4>
                    <div className="space-y-2">
                      <Select value={bulkTableId} onValueChange={setBulkTableId} disabled={tables.length === 0}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a table" />
                        </SelectTrigger>
                        <SelectContent>
                          {tables.map((table) => {
                            const assignedCount = table.assignedGuests?.length || 0;
                            const available = table.capacity - assignedCount;
                            return (
                              <SelectItem 
                                key={table.id} 
                                value={table.id.toString()}
                                disabled={available === 0}
                              >
                                {table.tableNumber} ({table.category}) - {available} available
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {bulkTableId && (
                        <div className="border rounded-lg p-3 mt-2">
                          {(() => {
                            const selectedTable = tables.find(t => t.id.toString() === bulkTableId);
                            if (!selectedTable) return null;
                            const assignedCount = selectedTable.assignedGuests?.length || 0;
                            const available = selectedTable.capacity - assignedCount;
                            return (
                              <>
                                <p className="text-sm font-medium">{selectedTable.tableNumber}</p>
                                <p className="text-xs text-muted-foreground">
                                  Capacity: {selectedTable.capacity} | 
                                  Assigned: {assignedCount} | 
                                  Available: {available}
                                </p>
                                {selectedGuestIds.length > available && (
                                  <p className="text-xs text-red-500 mt-1">
                                    Warning: {selectedGuestIds.length} guests selected, only {available} seats available
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBulkAssignmentOpen(false);
                      setSelectedGuestIds([]);
                      setBulkTableId('');
                    }}
                    disabled={bulkAssignmentLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkAssign}
                    disabled={bulkAssignmentLoading || selectedGuestIds.length === 0 || !bulkTableId}
                  >
                    {bulkAssignmentLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Assign {selectedGuestIds.length} Guest{selectedGuestIds.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Table Packages Tab */}
          <TabsContent value="table-packages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assign Package to Table</CardTitle>
                <CardDescription>Assign a package to a specific table</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="packageTable">Table</Label>
                      <Select value={packageAssignTableId} onValueChange={setPackageAssignTableId} disabled={packageFormLoading || tables.length === 0}>
                        <SelectTrigger id="packageTable">
                          <SelectValue placeholder="Select a table" />
                        </SelectTrigger>
                        <SelectContent>
                          {tables.map((table) => (
                            <SelectItem key={table.id} value={table.id.toString()}>
                              {table.tableNumber} ({table.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packageSelect">Package</Label>
                      <Select value={packageAssignPackageId} onValueChange={setPackageAssignPackageId} disabled={packageFormLoading || availablePackages.length === 0}>
                        <SelectTrigger id="packageSelect">
                          <SelectValue placeholder="Select a package" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePackages.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id.toString()}>
                              {pkg.packageName} ({pkg.packageType})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleAssignPackage} disabled={packageFormLoading || tables.length === 0 || availablePackages.length === 0}>
                    {packageFormLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Assign Package
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Package Assignments</CardTitle>
                <CardDescription>Current table-package assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table Number</TableHead>
                      <TableHead>Package Name</TableHead>
                      <TableHead>Package Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tablePackageAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No package assignments yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      tablePackageAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.tableNumber}</TableCell>
                          <TableCell>{assignment.packageName}</TableCell>
                          <TableCell>{assignment.packageType}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Wedding planner and contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium mb-1">Planner Contact</p>
                <p className="text-sm text-muted-foreground">{wedding.plannerContact}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Partners</p>
                <p className="text-sm text-muted-foreground">
                  {wedding.partner1} & {wedding.partner2}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WeddingDetail;


