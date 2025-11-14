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
import { tablesAPI, weddingsAPI, guestsAPI, dietaryRestrictionsAPI, couplesAPI } from '@/api';
import { getTypeIcon, getTypeColor } from '@/utils/restrictionUtils';

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
  const [guestRestrictionIds, setGuestRestrictionIds] = useState<number[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<any[]>([]);
  const [rsvpStatus, setRsvpStatus] = useState('pending');
  const [guestFormErrors, setGuestFormErrors] = useState<Record<string, string>>({});
  const [guestFormLoading, setGuestFormLoading] = useState(false);
  
  // Edit Wedding state
  const [editWeddingOpen, setEditWeddingOpen] = useState(false);
  const [editWeddingForm, setEditWeddingForm] = useState({
    wedding_date: '',
    wedding_time: '',
    venue: '',
    guest_count: '',
    total_cost: '',
    production_cost: '',
    payment_status: 'pending',
    preference_id: ''
  });
  const [editWeddingLoading, setEditWeddingLoading] = useState(false);
  const [couplePreferences, setCouplePreferences] = useState<any[]>([]);
  
  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  
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
  
  // Available packages for this wedding (mock data)
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);

  useEffect(() => {
    const fetchWeddingData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch wedding details
        // Note: axios interceptor returns response.data directly
        const weddingResponse = await weddingsAPI.getById(id);
        
        // Handle both direct data and wrapped response formats
        let weddingData = null;
        if (weddingResponse && weddingResponse.success && weddingResponse.data) {
          weddingData = weddingResponse.data;
        } else if (weddingResponse && weddingResponse.id) {
          // If response is already the data object
          weddingData = weddingResponse;
        }
        
        if (weddingData) {
          
          // Calculate confirmed and pending guests from guest_count
          // For now, we'll set these to 0 and update when we fetch actual guests
          setWedding({
            ...weddingData,
            confirmedGuests: 0, // Will be updated when guests are fetched
            pendingRSVPs: 0, // Will be updated when guests are fetched
            menuItems: 0, // Placeholder - can be fetched separately if needed
            packages: 0, // Placeholder - can be fetched separately if needed
            inventoryItems: 0, // Placeholder - can be fetched separately if needed
            dietaryRestrictions: weddingData.all_restrictions?.length || 0
          });
          
          // Initialize edit form with wedding data (safely handle date parsing)
          try {
            const weddingDate = weddingData.weddingDate || weddingData.wedding_date;
            const dateStr = weddingDate ? (typeof weddingDate === 'string' ? weddingDate.split('T')[0] : '') : '';
            
            setEditWeddingForm({
              wedding_date: dateStr,
              wedding_time: weddingData.weddingTime || weddingData.wedding_time || '',
              venue: weddingData.venue || '',
              guest_count: (weddingData.guestCount || weddingData.guest_count || 0).toString(),
              total_cost: (weddingData.totalCost || weddingData.total_cost || 0).toString(),
              production_cost: (weddingData.productionCost || weddingData.production_cost || 0).toString(),
              payment_status: weddingData.paymentStatus || weddingData.payment_status || 'pending',
              preference_id: (weddingData.preference_id || weddingData.pref_id || '').toString()
            });
          } catch (formError) {
            console.error('Error initializing edit form:', formError);
          }
          
          // Fetch couple preferences for edit form
          if (weddingData.couple_id) {
            try {
              const prefResponse = await couplesAPI.getPreferences(weddingData.couple_id);
              if (prefResponse && prefResponse.data) {
                setCouplePreferences(prefResponse.data);
              }
            } catch (e) {
              console.error('Error fetching preferences:', e);
            }
          }
        } else {
          const errorMsg = weddingResponse?.error || 'Wedding not found or invalid response';
          console.error('Wedding fetch failed:', weddingResponse);
          toast({
            title: 'Error',
            description: errorMsg,
            variant: 'destructive',
          });
          setWedding(null); // Ensure wedding is null on error
          setLoading(false);
          return;
        }
        
        // Fetch guests for this wedding
        try {
          const guestsResponse = await guestsAPI.getAll({ wedding_id: id });
          if (guestsResponse && guestsResponse.success && guestsResponse.data) {
            // Transform guest data to match expected format
            const transformedGuests = (guestsResponse.data || []).map((g: any) => {
              try {
                const guestName = g.guest_name || g.name || '';
                // Parse restrictions - handle both array and JSON string formats
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
                    restrictions = [];
                  }
                }
                // Filter out null values
                restrictions = restrictions.filter((r: any) => r && (r.restriction_id || r.restriction_name));
                
                return {
                  id: g.guest_id || g.id || 0,
                  guest_id: g.guest_id || g.id || 0,
                  firstName: guestName.split(' ')[0] || '',
                  lastName: guestName.split(' ').slice(1).join(' ') || '',
                  name: guestName,
                  dietaryRestriction: g.restriction_name || null,
                  dietaryRestrictions: restrictions,
                  rsvpStatus: g.rsvp_status || 'pending',
                  weddingId: g.wedding_id
                };
              } catch (e) {
                console.error('Error transforming guest:', e, g);
                return null;
              }
            }).filter((g: any) => g !== null);
            
            setGuests(transformedGuests);
            
            // Update confirmed and pending counts
            const confirmed = transformedGuests.filter((g: any) => g.rsvpStatus === 'accepted' || g.rsvpStatus === 'confirmed').length;
            const pending = transformedGuests.filter((g: any) => g.rsvpStatus === 'pending').length;
            
            setWedding((prev: any) => {
              if (!prev) return prev;
              return {
                ...prev,
                confirmedGuests: confirmed,
                pendingRSVPs: pending
              };
            });
          }
        } catch (guestError: any) {
          console.error('Error fetching guests:', guestError);
          // Set empty guests array if fetch fails
          setGuests([]);
        }
        
        // Fetch dietary restrictions for guest form
        try {
          const restrictionsResponse = await dietaryRestrictionsAPI.getAll();
          if (restrictionsResponse && restrictionsResponse.data) {
            setDietaryRestrictions(restrictionsResponse.data);
          }
        } catch (e) {
          console.error('Error fetching dietary restrictions:', e);
        }
        
        // Initialize empty arrays for packages (can be fetched separately if needed)
        setAvailablePackages([]);
        setTablePackageAssignments([]);
        
        // Set loading to false after all data is loaded
        setLoading(false);
        
      } catch (error: any) {
        console.error('Error fetching wedding data:', error);
        console.error('Error response:', error.response);
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.message || 
                            error.message || 
                            'Failed to load wedding details';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        setWedding(null); // Ensure wedding is null on error
        setLoading(false);
      }
    };
    
    fetchWeddingData();
  }, [id, toast]);

  useEffect(() => {
    const loadSeating = async () => {
      if (!id) return;
      setSeatingLoading(true);
      try {
        const resp = await tablesAPI.getSeating(id);
        // axios interceptor returns response.data directly
        setTables((resp && resp.data) ? resp.data : (Array.isArray(resp) ? resp : []));
      } catch (error: any) {
        console.error('Error loading seating:', error);
      }
      setSeatingLoading(false);
    };
    loadSeating();
  }, [id]);

  const ensureCoupleTable = async () => {
    if (!id) return;
    try {
      await tablesAPI.createCoupleTable(id);
      const resp = await tablesAPI.getSeating(id);
      // axios interceptor returns response.data directly
      setTables((resp && resp.data) ? resp.data : (Array.isArray(resp) ? resp : []));
      toast({ title: 'Couple Table Created' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.error || e?.error || 'Failed to create couple table', variant: 'destructive' });
    }
  };

  const addGuestTable = async (capacity: number) => {
    if (!id) return;
    try {
      await tablesAPI.createGuestTable(id, capacity);
      const resp = await tablesAPI.getSeating(id);
      // axios interceptor returns response.data directly
      setTables((resp && resp.data) ? resp.data : (Array.isArray(resp) ? resp : []));
      toast({ title: 'Guest Table Created', description: `Capacity ${capacity}` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.error || e?.error || 'Failed to create guest table', variant: 'destructive' });
    }
  };
  
  // Helper function to get assigned table for a guest
  const getGuestAssignedTable = (guestId: number) => {
    const table = tables.find(t => t.assignedGuests?.includes(guestId));
    return table ? table.tableNumber : null;
  };

  // Handle save wedding
  const handleSaveWedding = async () => {
    if (!id) return;
    
    if (!editWeddingForm.wedding_date || !editWeddingForm.wedding_time || !editWeddingForm.venue) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setEditWeddingLoading(true);
    try {
      await weddingsAPI.update(id, {
        wedding_date: editWeddingForm.wedding_date,
        wedding_time: editWeddingForm.wedding_time,
        venue: editWeddingForm.venue,
        guest_count: parseInt(editWeddingForm.guest_count) || 0,
        total_cost: parseFloat(editWeddingForm.total_cost) || 0,
        production_cost: parseFloat(editWeddingForm.production_cost) || 0,
        payment_status: editWeddingForm.payment_status,
        preference_id: editWeddingForm.preference_id ? parseInt(editWeddingForm.preference_id) : null
      });
      
      toast({
        title: 'Success',
        description: 'Wedding updated successfully',
      });
      
      // Refresh wedding data
      try {
        const weddingResponse = await weddingsAPI.getById(id);
        let weddingData = null;
        if (weddingResponse && weddingResponse.success && weddingResponse.data) {
          weddingData = weddingResponse.data;
        } else if (weddingResponse && weddingResponse.id) {
          weddingData = weddingResponse;
        }
        
        if (weddingData) {
          setWedding({
            ...weddingData,
            confirmedGuests: wedding?.confirmedGuests || 0,
            pendingRSVPs: wedding?.pendingRSVPs || 0,
            menuItems: 0,
            packages: 0,
            inventoryItems: 0,
            dietaryRestrictions: weddingData.all_restrictions?.length || 0
          });
          
          // Update edit form
          const weddingDate = weddingData.weddingDate || weddingData.wedding_date;
          const dateStr = weddingDate ? (typeof weddingDate === 'string' ? weddingDate.split('T')[0] : '') : '';
          setEditWeddingForm({
            wedding_date: dateStr,
            wedding_time: weddingData.weddingTime || weddingData.wedding_time || '',
            venue: weddingData.venue || '',
            guest_count: (weddingData.guestCount || weddingData.guest_count || 0).toString(),
            total_cost: (weddingData.totalCost || weddingData.total_cost || 0).toString(),
            production_cost: (weddingData.productionCost || weddingData.production_cost || 0).toString(),
            payment_status: weddingData.paymentStatus || weddingData.payment_status || 'pending',
            preference_id: (weddingData.preference_id || weddingData.pref_id || '').toString()
          });
        }
      } catch (refreshError) {
        console.error('Error refreshing wedding data:', refreshError);
      }
      
      setEditWeddingOpen(false);
    } catch (error: any) {
      console.error('Error updating wedding:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update wedding',
        variant: 'destructive',
      });
    } finally {
      setEditWeddingLoading(false);
    }
  };

  // Guest form handlers
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (guestRestrictionIds.length === 0) newErrors.dietaryRestriction = 'At least one dietary restriction is required';
    
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
      // Create guest via API
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const response = await guestsAPI.create({
        guest_name: fullName,
        wedding_id: parseInt(id || '1'),
        rsvp_status: rsvpStatus,
        restriction_ids: guestRestrictionIds // Send array of restriction IDs
      });
      
      if (response && response.success) {
        // Refresh guests list
        const guestsResponse = await guestsAPI.getAll({ wedding_id: id });
        if (guestsResponse && guestsResponse.success && guestsResponse.data) {
          const transformedGuests = guestsResponse.data.map((g: any) => {
            const guestName = g.guest_name || g.name || '';
            // Parse restrictions - handle both array and JSON string formats
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
                restrictions = [];
              }
            }
            // Filter out null values
            restrictions = restrictions.filter((r: any) => r && (r.restriction_id || r.restriction_name));
            
            return {
              id: g.guest_id || g.id,
              guest_id: g.guest_id || g.id,
              firstName: guestName.split(' ')[0] || '',
              lastName: guestName.split(' ').slice(1).join(' ') || '',
              name: guestName,
              dietaryRestriction: g.restriction_name || null,
              dietaryRestrictions: restrictions,
              rsvpStatus: g.rsvp_status || 'pending',
              weddingId: g.wedding_id
            };
          });
          setGuests(transformedGuests);
          
          // Update counts
          const confirmed = transformedGuests.filter((g: any) => g.rsvpStatus === 'accepted' || g.rsvpStatus === 'confirmed').length;
          const pending = transformedGuests.filter((g: any) => g.rsvpStatus === 'pending').length;
          setWedding((prev: any) => ({
            ...prev,
            confirmedGuests: confirmed,
            pendingRSVPs: pending
          }));
        }
        
        // Reset form
        setFirstName('');
        setLastName('');
        setGuestRestrictionIds([]);
        setRsvpStatus('pending');
        setGuestFormErrors({});
        
        toast({
          title: 'Guest Added',
          description: `${fullName} has been added successfully`,
        });
      }
    } catch (error: any) {
      console.error('Error adding guest:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to add guest. Please try again.',
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
    const table = tables.find(t => (t.id ?? t.tableNumber)?.toString() === allocationTableId);
    const guest = guests.find(g => (g.id ?? g.guest_id)?.toString() === allocationGuestId);
    
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
        if ((t.id ?? t.tableNumber)?.toString() === allocationTableId) {
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
    
    const table = tables.find(t => (t.id ?? t.tableNumber)?.toString() === bulkTableId);
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
        if ((t.id ?? t.tableNumber)?.toString() === bulkTableId) {
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
      
      const table = tables.find(t => (t.id ?? t.tableNumber)?.toString() === packageAssignTableId);
      const pkg = availablePackages.find(p => (p.id ?? p.packageName)?.toString() === packageAssignPackageId);
      
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
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
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
              <h1 className="text-3xl font-bold tracking-tight">{wedding?.couple || 'Wedding Details'}</h1>
              <p className="text-muted-foreground">
                Wedding Dashboard - {wedding?.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString() : 'Loading...'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setEditWeddingOpen(true)}>
              <Edit className="w-4 h-4" />
              Edit Wedding
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setSettingsOpen(true)}>
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
                {wedding?.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString() : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">{wedding?.weddingTime || 'N/A'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Venue</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{wedding?.venue || 'N/A'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wedding?.guestCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                {wedding?.confirmedGuests || 0} confirmed, {wedding?.pendingRSVPs || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mb-2">{getPaymentStatusBadge(wedding?.paymentStatus || 'pending')}</div>
              <p className="text-xs text-muted-foreground">
                Total: ${(wedding?.totalCost || 0).toLocaleString()}
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
            <TabsTrigger value="seating-layout" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              View Seating Layout
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
                    <Label>Dietary Restrictions *</Label>
                    <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                      {dietaryRestrictions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Loading dietary restrictions...</p>
                      ) : (
                        dietaryRestrictions.map((dr) => (
                          <div key={dr.restriction_id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`guest-restriction-${dr.restriction_id}`}
                              checked={guestRestrictionIds.includes(dr.restriction_id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setGuestRestrictionIds([...guestRestrictionIds, dr.restriction_id]);
                                } else {
                                  setGuestRestrictionIds(guestRestrictionIds.filter(id => id !== dr.restriction_id));
                                }
                              }}
                              disabled={guestFormLoading}
                            />
                            <label
                              htmlFor={`guest-restriction-${dr.restriction_id}`}
                              className="text-sm font-medium leading-none cursor-pointer flex-1 flex items-center gap-2"
                            >
                              <span className={`${getTypeColor(dr.restriction_type || '')} flex items-center gap-1 px-2 py-1 rounded`}>
                                {getTypeIcon(dr.restriction_type || '')}
                                {dr.restriction_name}
                              </span>
                              {dr.severity_level && (
                                <span className="text-muted-foreground text-xs">- {dr.severity_level}</span>
                              )}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    {guestRestrictionIds.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {guestRestrictionIds.length} restriction(s) selected
                      </p>
                    )}
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
                <CardTitle>Guest List of Wedding #{wedding?.id || id} (ID: {id})</CardTitle>
                <CardDescription>All guests for this wedding</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Dietary Restrictions</TableHead>
                      <TableHead>RSVP Status</TableHead>
                      <TableHead>Assigned Table</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No guests added yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      guests.map((guest) => {
                        const assignedTable = getGuestAssignedTable(guest.id);
                        const restrictions = Array.isArray(guest.dietaryRestrictions) 
                          ? guest.dietaryRestrictions 
                          : guest.dietaryRestriction 
                            ? [{ restriction_name: guest.dietaryRestriction }] 
                            : [];
                        return (
                          <TableRow key={guest.id}>
                            <TableCell className="font-mono text-sm text-muted-foreground">
                              #{guest.guest_id || guest.id}
                            </TableCell>
                            <TableCell className="font-medium">
                              {guest.firstName || guest.name?.split(' ')[0]} {guest.lastName || guest.name?.split(' ').slice(1).join(' ')}
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
                        {getTypeIcon(restrictionType)}
                        {restrictionName}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
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
                <p className="text-sm text-muted-foreground">
                  Total Tables: {tables.length} | Manage table assignments and seating
                </p>
              </div>
              <Button 
                onClick={() => setBulkAssignmentOpen(true)}
                disabled={getUnassignedGuests().length === 0 || tables.length === 0}
              >
                <Users className="w-4 h-4 mr-2" />
                Bulk Assign Guests
              </Button>
            </div>

            {!tables || tables.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No tables added yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => {
                  if (!table) return null;
                  const assignedCount = table.assignedGuests?.length || 0;
                  const available = (table.capacity || 0) - assignedCount;
                  const assignedGuestsList = (guests || []).filter(g => g && table.assignedGuests?.includes(g.id));
                  const tablePackage = getTablePackage(table.id);
                  
                  return (
                    <Card key={table.id || `table-${table.tableNumber}`} className="flex flex-col">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{table.tableNumber}</CardTitle>
                          {getTableCategoryBadge(table.category)}
                        </div>
                        <CardDescription>
                          Capacity: {table.capacity || 0} | Assigned: {assignedCount} | Available: {available}
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
                        {(() => {
                          const tableRestrictions = new Set<string>();
                          assignedGuestsList.forEach((guest) => {
                            const restrictions = Array.isArray(guest.dietaryRestrictions) 
                              ? guest.dietaryRestrictions 
                              : guest.dietaryRestriction 
                                ? [{ restriction_name: guest.dietaryRestriction }] 
                                : [];
                            restrictions.forEach((r: any) => {
                              if (r.restriction_name && r.restriction_name !== 'None') {
                                tableRestrictions.add(r.restriction_name);
                              }
                            });
                          });
                          return tableRestrictions.size > 0 ? (
                            <div className="pb-2 border-b">
                              <p className="text-xs font-medium mb-1 text-muted-foreground">Dietary Restrictions:</p>
                              <div className="flex flex-wrap gap-1">
                                {Array.from(tableRestrictions).map((restriction, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {restriction}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : null;
                        })()}
                        <div>
                          <p className="text-sm font-medium mb-2">Assigned Guests:</p>
                          {assignedGuestsList.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No guests assigned</p>
                          ) : (
                            <ul className="space-y-1">
                              {assignedGuestsList.map((guest) => {
                                const restrictions = Array.isArray(guest.dietaryRestrictions) 
                                  ? guest.dietaryRestrictions 
                                  : guest.dietaryRestriction 
                                    ? [{ restriction_name: guest.dietaryRestriction }] 
                                    : [];
                                return (
                                  <li key={guest.id} className="flex items-center gap-2 text-sm">
                                    <span>{guest.firstName || guest.name?.split(' ')[0]} {guest.lastName || guest.name?.split(' ').slice(1).join(' ')}</span>
                                    {restrictions.length > 0 && restrictions.some((r: any) => r.restriction_name && r.restriction_name !== 'None') && (
                                      <div className="flex flex-wrap gap-1">
                                        {restrictions.filter((r: any) => r.restriction_name && r.restriction_name !== 'None').map((r: any, idx: number) => (
                                          <Badge key={r.restriction_id || r.restriction_name || `restriction-${idx}`} variant="secondary" className="text-xs">
                                            {r.restriction_name || r}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </li>
                                );
                              })}
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
                            <SelectItem key={table.id || `table-${table.tableNumber}`} value={(table.id ?? table.tableNumber)?.toString() ?? ''}>
                              {table.tableNumber || 'Unknown'} ({table.category || 'General'}) - {(table.capacity || 0) - (table.assignedGuests?.length || 0)} available
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
                            <SelectItem key={guest.id || guest.guest_id || `guest-${guest.name}`} value={(guest.id ?? guest.guest_id)?.toString() ?? ''}>
                              {guest.firstName || guest.name?.split(' ')[0] || 'Unknown'} {guest.lastName || guest.name?.split(' ').slice(1).join(' ') || ''}
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

          </TabsContent>

          {/* Seating Layout Tab */}
          <TabsContent value="seating-layout" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>View Seating Layout</CardTitle>
                <CardDescription>Visual representation of table arrangements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg border p-6">
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {!tables || tables.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        Add tables to see seating layout
                      </div>
                    ) : (
                      tables.map((table) => {
                        if (!table) return null;
                        const assignedCount = table.assignedGuests?.length || 0;
                        const available = (table.capacity || 0) - assignedCount;
                        const categoryColors: Record<string, string> = {
                          'VIP': 'bg-purple-200 border-purple-400',
                          'Kids': 'bg-blue-200 border-blue-400',
                          'Partners': 'bg-pink-200 border-pink-400',
                          'General': 'bg-gray-200 border-gray-400'
                        };
                        return (
                          <div
                            key={table.id || `table-${table.tableNumber}`}
                            className={`aspect-square rounded-lg border-2 p-2 flex flex-col items-center justify-center text-xs ${categoryColors[table.category || 'General'] || 'bg-gray-200 border-gray-400'}`}
                          >
                            <div className="font-semibold">{table.tableNumber || 'Unknown'}</div>
                            <div className="text-[10px] mt-1">{assignedCount}/{table.capacity || 0}</div>
                            {available === 0 && <div className="text-[10px] text-red-600 mt-0.5">Full</div>}
                          </div>
                        );
                      }).filter(Boolean)
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
                            const available = (table.capacity || 0) - assignedCount;
                            return (
                              <SelectItem 
                                key={table.id || `table-${table.tableNumber}`} 
                                value={(table.id ?? table.tableNumber)?.toString() ?? ''}
                                disabled={available === 0}
                              >
                                {table.tableNumber || 'Unknown'} ({table.category || 'General'}) - {available} available
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {bulkTableId && (
                        <div className="border rounded-lg p-3 mt-2">
                          {(() => {
                            const selectedTable = tables.find(t => (t.id ?? t.tableNumber)?.toString() === bulkTableId);
                            if (!selectedTable) return null;
                            const assignedCount = selectedTable.assignedGuests?.length || 0;
                            const available = (selectedTable.capacity || 0) - assignedCount;
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
                            <SelectItem key={table.id || `table-${table.tableNumber}`} value={(table.id ?? table.tableNumber)?.toString() ?? ''}>
                              {table.tableNumber || 'Unknown'} ({table.category || 'General'})
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
                            <SelectItem key={pkg.id || `pkg-${pkg.packageName}`} value={(pkg.id ?? pkg.packageName)?.toString() ?? ''}>
                              {pkg.packageName || 'Unknown'} ({pkg.packageType || 'Standard'})
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
                    {!tablePackageAssignments || tablePackageAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No package assignments yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      tablePackageAssignments.map((assignment) => (
                        <TableRow key={assignment.id || `assignment-${assignment.tableId}-${assignment.packageId}`}>
                          <TableCell className="font-medium">{assignment.tableNumber || 'N/A'}</TableCell>
                          <TableCell>{assignment.packageName || 'N/A'}</TableCell>
                          <TableCell>{assignment.packageType || 'N/A'}</TableCell>
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
                <p className="text-sm text-muted-foreground">{wedding?.plannerContact || wedding?.planner_contact || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Partners</p>
                <p className="text-sm text-muted-foreground">
                  {wedding?.partner1 || wedding?.partner1_name || 'N/A'} & {wedding?.partner2 || wedding?.partner2_name || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Couple Preferences */}
        {wedding?.all_restrictions && wedding.all_restrictions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Couple Preferences</CardTitle>
              <CardDescription>Dietary restrictions and preferences for this wedding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wedding.ceremony_type && (
                  <div>
                    <p className="text-sm font-medium mb-2">Ceremony Type:</p>
                    <Badge variant="outline" className="text-sm">
                      {wedding.ceremony_type}
                    </Badge>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium mb-2">Dietary Restrictions:</p>
                  <div className="flex flex-wrap gap-2">
                    {wedding.all_restrictions.map((r: any) => (
                      <Badge 
                        key={r.restriction_id} 
                        className={`${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                      >
                        {getTypeIcon(r.restriction_type || '')}
                        <span>{r.restriction_name}</span>
                        {r.severity_level && (
                          <span className="text-xs ml-1">- {r.severity_level}</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Wedding Dialog */}
        <Dialog open={editWeddingOpen} onOpenChange={setEditWeddingOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Wedding</DialogTitle>
              <DialogDescription>Update wedding details and preferences</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_wedding_date">Wedding Date *</Label>
                  <Input
                    id="edit_wedding_date"
                    type="date"
                    value={editWeddingForm.wedding_date}
                    onChange={(e) => setEditWeddingForm({ ...editWeddingForm, wedding_date: e.target.value })}
                    disabled={editWeddingLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_wedding_time">Wedding Time *</Label>
                  <Input
                    id="edit_wedding_time"
                    type="time"
                    value={editWeddingForm.wedding_time}
                    onChange={(e) => setEditWeddingForm({ ...editWeddingForm, wedding_time: e.target.value })}
                    disabled={editWeddingLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_venue">Venue *</Label>
                <Input
                  id="edit_venue"
                  value={editWeddingForm.venue}
                  onChange={(e) => setEditWeddingForm({ ...editWeddingForm, venue: e.target.value })}
                  disabled={editWeddingLoading}
                  placeholder="Enter venue name"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_guest_count">Guest Count</Label>
                  <Input
                    id="edit_guest_count"
                    type="number"
                    value={editWeddingForm.guest_count}
                    onChange={(e) => setEditWeddingForm({ ...editWeddingForm, guest_count: e.target.value })}
                    disabled={editWeddingLoading}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_total_cost">Total Cost</Label>
                  <Input
                    id="edit_total_cost"
                    type="number"
                    step="0.01"
                    value={editWeddingForm.total_cost}
                    onChange={(e) => setEditWeddingForm({ ...editWeddingForm, total_cost: e.target.value })}
                    disabled={editWeddingLoading}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_production_cost">Production Cost</Label>
                  <Input
                    id="edit_production_cost"
                    type="number"
                    step="0.01"
                    value={editWeddingForm.production_cost}
                    onChange={(e) => setEditWeddingForm({ ...editWeddingForm, production_cost: e.target.value })}
                    disabled={editWeddingLoading}
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_payment_status">Payment Status</Label>
                  <Select
                    value={editWeddingForm.payment_status}
                    onValueChange={(value) => setEditWeddingForm({ ...editWeddingForm, payment_status: value })}
                    disabled={editWeddingLoading}
                  >
                    <SelectTrigger id="edit_payment_status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_preference_id">Couple Preference</Label>
                  <Select
                    value={editWeddingForm.preference_id}
                    onValueChange={(value) => setEditWeddingForm({ ...editWeddingForm, preference_id: value })}
                    disabled={editWeddingLoading}
                  >
                    <SelectTrigger id="edit_preference_id">
                      <SelectValue placeholder="Select preference (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {couplePreferences.map((pref) => (
                        <SelectItem key={pref.preference_id || `pref-${pref.ceremony_type}`} value={(pref.preference_id ?? pref.ceremony_type)?.toString() ?? ''}>
                          {pref.ceremony_type || 'Unknown'} ({(pref.dietaryRestrictions?.length || 0)} restrictions)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditWeddingOpen(false)} disabled={editWeddingLoading}>
                Cancel
              </Button>
              <Button onClick={handleSaveWedding} disabled={editWeddingLoading}>
                {editWeddingLoading ? (
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

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Wedding Settings</DialogTitle>
              <DialogDescription>Configure wedding preferences and options</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Apply Couple Preferences</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automatically apply couple dietary restrictions to all wedding menus and seating arrangements.
                  </p>
                  <div className="space-y-2">
                    {wedding?.all_restrictions && wedding.all_restrictions.length > 0 ? (
                      <div>
                        <p className="text-sm font-medium mb-2">Current Restrictions from Couple Preference:</p>
                        <div className="flex flex-wrap gap-2">
                          {wedding.all_restrictions.map((r: any) => (
                            <Badge key={r.restriction_id} className={`${getTypeColor(r.restriction_type || '')} border`}>
                              {getTypeIcon(r.restriction_type || '')}
                              {r.restriction_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No restrictions from couple preference</p>
                    )}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Default Menu Options</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Set default menu items that accommodate the couple's dietary restrictions.
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    <Utensils className="w-4 h-4 mr-2" />
                    Apply Restrictions to Menu (Coming Soon)
                  </Button>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Seating Arrangement</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automatically group guests with similar dietary restrictions at the same tables.
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Auto-arrange by Restrictions (Coming Soon)
                  </Button>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Notification Settings</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure email notifications for RSVP updates and payment reminders.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify_rsvp" defaultChecked />
                      <label htmlFor="notify_rsvp" className="text-sm cursor-pointer">
                        Notify on RSVP changes
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify_payment" defaultChecked />
                      <label htmlFor="notify_payment" className="text-sm cursor-pointer">
                        Notify on payment updates
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default WeddingDetail;


