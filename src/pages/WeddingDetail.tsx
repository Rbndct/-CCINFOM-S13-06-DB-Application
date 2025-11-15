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
  LayoutGrid,
  Trash2,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  X
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { tablesAPI, weddingsAPI, guestsAPI, dietaryRestrictionsAPI, couplesAPI, menuItemsAPI, packagesAPI } from '@/api';
import { getTypeIcon, getTypeColor } from '@/utils/restrictionUtils';

// Helper function to safely parse and format dates
const safeFormatDate = (dateValue: any): string => {
  if (!dateValue) return 'N/A';
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) {
      // If invalid date, try to parse as YYYY-MM-DD
      if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
        return dateValue.split('T')[0];
      }
      return 'N/A';
    }
    return date.toLocaleDateString();
  } catch (e) {
    // If date parsing fails, return the original value or N/A
    return typeof dateValue === 'string' ? dateValue.split('T')[0] : 'N/A';
  }
};

const WeddingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wedding, setWedding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Guests state
  const [guests, setGuests] = useState<any[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [guestRestrictionIds, setGuestRestrictionIds] = useState<number[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<any[]>([]);
  const [rsvpStatus, setRsvpStatus] = useState('pending');
  const [guestFormErrors, setGuestFormErrors] = useState<Record<string, string>>({});
  const [guestFormLoading, setGuestFormLoading] = useState(false);
  
  // Edit/Delete Guest state
  const [editGuestOpen, setEditGuestOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [editGuestFirstName, setEditGuestFirstName] = useState('');
  const [editGuestLastName, setEditGuestLastName] = useState('');
  const [editGuestRestrictionIds, setEditGuestRestrictionIds] = useState<number[]>([]);
  const [editGuestRsvpStatus, setEditGuestRsvpStatus] = useState('pending');
  const [editGuestLoading, setEditGuestLoading] = useState(false);
  const [deleteGuestId, setDeleteGuestId] = useState<number | null>(null);
  const [deleteGuestLoading, setDeleteGuestLoading] = useState(false);
  
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
  const [coupleData, setCoupleData] = useState<any>(null);
  
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
  
  // Available packages for this wedding
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  
  // Menu items and packages state
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [menuItemsLoading, setMenuItemsLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(false);
  
  // Guest filtering and sorting state
  const [guestFilterName, setGuestFilterName] = useState('');
  const [guestFilterRsvp, setGuestFilterRsvp] = useState('');
  const [guestFilterRestriction, setGuestFilterRestriction] = useState('');
  const [guestSortBy, setGuestSortBy] = useState<'name' | 'rsvp' | 'table'>('name');
  const [guestSortOrder, setGuestSortOrder] = useState<'asc' | 'desc'>('asc');
  const [guestCurrentPage, setGuestCurrentPage] = useState(1);
  const guestsPerPage = 10;

  useEffect(() => {
    const fetchWeddingData = async () => {
      if (!id) {
        console.error('No wedding ID provided');
        setError('No wedding ID provided');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching wedding with ID:', id);
        // Fetch wedding details
        // Note: axios interceptor returns response.data directly
        const weddingResponse = await weddingsAPI.getById(id);
        console.log('Wedding API response:', weddingResponse);
        
        // Handle both direct data and wrapped response formats
        let weddingData = null;
        if (weddingResponse) {
          if (weddingResponse.success && weddingResponse.data) {
            weddingData = weddingResponse.data;
            console.log('Extracted wedding data from success.data:', weddingData);
          } else if (weddingResponse.id || weddingResponse.wedding_id) {
            // If response is already the data object
            weddingData = weddingResponse;
            console.log('Using response as direct data:', weddingData);
          } else if (Array.isArray(weddingResponse) && weddingResponse.length > 0) {
            // If response is an array, take first item
            weddingData = weddingResponse[0];
            console.log('Extracted wedding data from array:', weddingData);
          } else {
            console.warn('Unexpected response format:', weddingResponse);
          }
        } else {
          console.error('No response received from API');
        }
        
        if (weddingData) {
          
          // Calculate RSVP counts - will be updated when guests are fetched
          setWedding({
            ...weddingData,
            acceptedGuests: 0, // Will be updated when guests are fetched
            pendingRSVPs: 0, // Will be updated when guests are fetched
            declinedGuests: 0, // Will be updated when guests are fetched
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
              // Fetch couple data for dietary restrictions
              const coupleResp = await couplesAPI.getById(weddingData.couple_id);
              if (coupleResp && coupleResp.data) {
                setCoupleData(coupleResp.data);
              }
            } catch (e) {
              console.error('Error fetching preferences:', e);
            }
          }
        } else {
          const errorMsg = weddingResponse?.error || weddingResponse?.message || 'Wedding not found or invalid response';
          console.error('Wedding fetch failed - no data extracted. Response:', weddingResponse);
          setError(errorMsg);
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
                  weddingId: g.wedding_id,
                  table_id: g.table_id || null
                };
              } catch (e) {
                console.error('Error transforming guest:', e, g);
                return null;
              }
            }).filter((g: any) => g !== null);
            
            setGuests(transformedGuests);
            
            // Update RSVP counts
            const accepted = transformedGuests.filter((g: any) => g.rsvpStatus === 'accepted' || g.rsvpStatus === 'confirmed').length;
            const pending = transformedGuests.filter((g: any) => g.rsvpStatus === 'pending').length;
            const declined = transformedGuests.filter((g: any) => g.rsvpStatus === 'declined').length;
            
            setWedding((prev: any) => {
              if (!prev) return prev;
              return {
                ...prev,
                acceptedGuests: accepted,
                pendingRSVPs: pending,
                declinedGuests: declined
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
        
        // Fetch menu items for this wedding
        try {
          setMenuItemsLoading(true);
          const menuItemsResponse = await menuItemsAPI.getAll({ wedding_id: id });
          if (menuItemsResponse && menuItemsResponse.success && menuItemsResponse.data) {
            setMenuItems(menuItemsResponse.data || []);
          } else if (menuItemsResponse && menuItemsResponse.data) {
            setMenuItems(menuItemsResponse.data || []);
          }
        } catch (e) {
          console.error('Error fetching menu items:', e);
          setMenuItems([]);
        } finally {
          setMenuItemsLoading(false);
        }
        
        // Set loading to false after all data is loaded
        setLoading(false);
        
      } catch (error: any) {
        console.error('Error fetching wedding data:', error);
        console.error('Error response:', error.response);
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.message || 
                            error.message || 
                            'Failed to load wedding details';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        setWedding(null); // Ensure wedding is null on error
      } finally {
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
        let tablesData: any[] = [];
        if (resp) {
          if (resp.data && Array.isArray(resp.data)) {
            tablesData = resp.data;
          } else if (Array.isArray(resp)) {
            tablesData = resp;
          } else if (resp.success && resp.data && Array.isArray(resp.data)) {
            tablesData = resp.data;
          }
        }
        
        // Transform table data to ensure consistent structure
        tablesData = tablesData.map((t: any) => ({
          ...t,
          id: t.id || t.table_id,
          table_id: t.table_id || t.id,
          tableNumber: t.tableNumber || t.table_number,
          table_number: t.table_number || t.tableNumber,
          category: t.category || t.table_category,
          table_category: t.table_category || t.category,
          capacity: t.capacity || 0,
          assignedGuests: t.assignedGuests || t.assigned_guests || [],
          assigned_guests: t.assigned_guests || t.assignedGuests || []
        }));
        
        setTables(tablesData);
        
        // Auto-create couple table if it doesn't exist (with capacity 2)
        const hasCoupleTable = tablesData.some((t: any) => 
          (t.table_category === 'couple') || (t.category === 'couple')
        );
        if (!hasCoupleTable && weddingData && weddingData.couple_id) {
          try {
            const coupleTableResp = await tablesAPI.createCoupleTable(id, { capacity: 2 });
            const updatedResp = await tablesAPI.getSeating(id);
            let updatedTables: any[] = [];
            if (updatedResp) {
              if (updatedResp.data && Array.isArray(updatedResp.data)) {
                updatedTables = updatedResp.data;
              } else if (Array.isArray(updatedResp)) {
                updatedTables = updatedResp;
              } else if (updatedResp.success && updatedResp.data && Array.isArray(updatedResp.data)) {
                updatedTables = updatedResp.data;
              }
            }
            // Transform updated tables
            updatedTables = updatedTables.map((t: any) => ({
              ...t,
              id: t.id || t.table_id,
              table_id: t.table_id || t.id,
              tableNumber: t.tableNumber || t.table_number,
              table_number: t.table_number || t.tableNumber,
              category: t.category || t.table_category,
              table_category: t.table_category || t.category,
              capacity: t.capacity || 0,
              assignedGuests: t.assignedGuests || t.assigned_guests || [],
              assigned_guests: t.assigned_guests || t.assignedGuests || []
            }));
            setTables(updatedTables);
            
            // Auto-assign couple partners to couple table
            const coupleTable = updatedTables.find((t: any) => 
              (t.table_category === 'couple') || (t.category === 'couple')
            );
            if (coupleTable && coupleTableResp && coupleTableResp.data) {
              const coupleTableId = coupleTable.id || coupleTable.table_id;
              const partner1Name = weddingData.partner1 || weddingData.partner1_name;
              const partner2Name = weddingData.partner2 || weddingData.partner2_name;
              
              // Check if partners are already guests, if not create them
              const existingGuests = await guestsAPI.getByWedding(id);
              const existingGuestsList = existingGuests?.data || [];
              
              let partner1Guest = existingGuestsList.find((g: any) => 
                g.guest_name === partner1Name || g.guest_name?.includes(partner1Name)
              );
              let partner2Guest = existingGuestsList.find((g: any) => 
                g.guest_name === partner2Name || g.guest_name?.includes(partner2Name)
              );
              
              const guestIds: number[] = [];
              
              // Create or get partner1 guest
              if (!partner1Guest && partner1Name) {
                try {
                  const createResp = await guestsAPI.create({
                    guest_name: partner1Name,
                    wedding_id: id,
                    rsvp_status: 'accepted',
                    table_id: coupleTableId
                  });
                  if (createResp && createResp.data && createResp.data.guest_id) {
                    guestIds.push(createResp.data.guest_id);
                  }
                } catch (e) {
                  console.error('Error creating partner1 guest:', e);
                }
              } else if (partner1Guest) {
                guestIds.push(partner1Guest.guest_id);
              }
              
              // Create or get partner2 guest
              if (!partner2Guest && partner2Name) {
                try {
                  const createResp = await guestsAPI.create({
                    guest_name: partner2Name,
                    wedding_id: id,
                    rsvp_status: 'accepted',
                    table_id: coupleTableId
                  });
                  if (createResp && createResp.data && createResp.data.guest_id) {
                    guestIds.push(createResp.data.guest_id);
                  }
                } catch (e) {
                  console.error('Error creating partner2 guest:', e);
                }
              } else if (partner2Guest) {
                guestIds.push(partner2Guest.guest_id);
              }
              
              // Assign both partners to couple table
              if (guestIds.length > 0) {
                try {
                  await tablesAPI.assignGuests(id, coupleTableId, guestIds);
                } catch (e) {
                  console.error('Error assigning partners to couple table:', e);
                }
              }
            }
          } catch (e: any) {
            // Couple table might already exist or there's an error, just log it
            console.log('Couple table check:', e.response?.data?.error || e.message);
          }
        }
      } catch (error: any) {
        console.error('Error loading seating:', error);
        setTables([]); // Set empty array on error
      } finally {
        setSeatingLoading(false);
      }
    };
    loadSeating();
  }, [id]);

  // Fetch menu items and packages when wedding ID is available
  useEffect(() => {
    const loadMenuItemsAndPackages = async () => {
      if (!id) return;
      
      // Fetch menu items for this wedding
      try {
        setMenuItemsLoading(true);
        const menuItemsResponse = await menuItemsAPI.getAll({ wedding_id: id });
        if (menuItemsResponse && menuItemsResponse.success && menuItemsResponse.data) {
          setMenuItems(menuItemsResponse.data || []);
        } else if (menuItemsResponse && menuItemsResponse.data) {
          setMenuItems(menuItemsResponse.data || []);
        } else {
          setMenuItems([]);
        }
      } catch (e) {
        console.error('Error fetching menu items:', e);
        setMenuItems([]);
      } finally {
        setMenuItemsLoading(false);
      }
      
      // Fetch packages for this wedding
      try {
        setPackagesLoading(true);
        const packagesResponse = await packagesAPI.getAll({ wedding_id: id });
        if (packagesResponse && packagesResponse.success && packagesResponse.data) {
          const packagesData = packagesResponse.data || [];
          setPackages(packagesData);
          setAvailablePackages(packagesData);
        } else if (packagesResponse && packagesResponse.data) {
          const packagesData = packagesResponse.data || [];
          setPackages(packagesData);
          setAvailablePackages(packagesData);
        } else {
          setPackages([]);
          setAvailablePackages([]);
        }
      } catch (e) {
        console.error('Error fetching packages:', e);
        setPackages([]);
        setAvailablePackages([]);
      } finally {
        setPackagesLoading(false);
      }
      
      // Fetch table-package assignments for this wedding
      try {
        const assignmentsResponse = await packagesAPI.getTableAssignments(id);
        if (assignmentsResponse && assignmentsResponse.success && assignmentsResponse.data) {
          setTablePackageAssignments(assignmentsResponse.data || []);
        } else if (assignmentsResponse && assignmentsResponse.data) {
          setTablePackageAssignments(assignmentsResponse.data || []);
        } else {
          setTablePackageAssignments([]);
        }
      } catch (e) {
        console.error('Error fetching table-package assignments:', e);
        setTablePackageAssignments([]);
      }
    };
    
    loadMenuItemsAndPackages();
  }, [id]);

  // Initialize edit wedding form when dialog opens
  useEffect(() => {
    if (editWeddingOpen && wedding) {
      const weddingDate = wedding.weddingDate || wedding.wedding_date;
      const dateStr = weddingDate ? (typeof weddingDate === 'string' ? weddingDate.split('T')[0] : '') : '';
      setEditWeddingForm({
        wedding_date: dateStr,
        wedding_time: wedding.weddingTime || wedding.wedding_time || '',
        venue: wedding.venue || '',
        guest_count: (wedding.guestCount || wedding.guest_count || 0).toString(),
        total_cost: (wedding.totalCost || wedding.total_cost || 0).toString(),
        production_cost: (wedding.productionCost || wedding.production_cost || 0).toString(),
        payment_status: wedding.paymentStatus || wedding.payment_status || 'pending',
        preference_id: (wedding.preference_id || wedding.pref_id || '').toString()
      });
      
      // Fetch couple preferences for the select dropdown
      if (wedding.couple_id) {
        couplesAPI.getPreferences(wedding.couple_id).then((response) => {
          setCouplePreferences(response.data || []);
        }).catch((e) => {
          console.error('Error fetching preferences:', e);
          setCouplePreferences([]);
        });
      }
    }
  }, [editWeddingOpen, wedding]);

  const ensureCoupleTable = async () => {
    if (!id) return;
    try {
      await tablesAPI.createCoupleTable(id, { capacity: 2 });
      const resp = await tablesAPI.getSeating(id);
      let tablesData: any[] = [];
      if (resp) {
        if (resp.data && Array.isArray(resp.data)) {
          tablesData = resp.data;
        } else if (Array.isArray(resp)) {
          tablesData = resp;
        } else if (resp.success && resp.data && Array.isArray(resp.data)) {
          tablesData = resp.data;
        }
      }
      tablesData = tablesData.map((t: any) => ({
        ...t,
        id: t.id || t.table_id,
        table_id: t.table_id || t.id,
        tableNumber: t.tableNumber || t.table_number,
        table_number: t.table_number || t.tableNumber,
        category: t.category || t.table_category,
        table_category: t.table_category || t.category,
        capacity: t.capacity || 0,
        assignedGuests: t.assignedGuests || t.assigned_guests || [],
        assigned_guests: t.assigned_guests || t.assignedGuests || []
      }));
      setTables(tablesData);
      toast({ title: 'Couple Table Created', description: 'Couple table with capacity 2 created' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.error || e?.error || 'Failed to create couple table', variant: 'destructive' });
    }
  };

  const addGuestTable = async (capacity: number, category: string = 'guest') => {
    if (!id) return;
    try {
      await tablesAPI.createGuestTable(id, capacity, category);
      const resp = await tablesAPI.getSeating(id);
      let tablesData: any[] = [];
      if (resp) {
        if (resp.data && Array.isArray(resp.data)) {
          tablesData = resp.data;
        } else if (Array.isArray(resp)) {
          tablesData = resp;
        } else if (resp.success && resp.data && Array.isArray(resp.data)) {
          tablesData = resp.data;
        }
      }
      tablesData = tablesData.map((t: any) => ({
        ...t,
        id: t.id || t.table_id,
        table_id: t.table_id || t.id,
        tableNumber: t.tableNumber || t.table_number,
        table_number: t.table_number || t.tableNumber,
        category: t.category || t.table_category,
        table_category: t.table_category || t.category,
        capacity: t.capacity || 0,
        assignedGuests: t.assignedGuests || t.assigned_guests || [],
        assigned_guests: t.assigned_guests || t.assignedGuests || []
      }));
      setTables(tablesData);
      toast({ title: 'Table Created', description: `${category} table with capacity ${capacity} created` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.error || e?.error || 'Failed to create table', variant: 'destructive' });
    }
  };
  
  // Helper function to get assigned table for a guest
  const getGuestAssignedTable = (guest: any) => {
    if (!guest || !tables || tables.length === 0) return null;
    try {
      // First check if guest has table_id
      if (guest.table_id) {
        const table = tables.find(t => (t.id || t.table_id) === guest.table_id);
        if (table) {
          return table.tableNumber || table.table_number || null;
        }
      }
      // Fallback: check assignedGuests array
      const guestId = guest.id || guest.guest_id;
      if (guestId) {
        const table = tables.find(t => t && t.assignedGuests && Array.isArray(t.assignedGuests) && t.assignedGuests.includes(guestId));
        if (table) {
          return table.tableNumber || table.table_number || null;
        }
      }
      return null;
    } catch (e) {
      console.error('Error getting assigned table:', e);
      return null;
    }
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
            acceptedGuests: wedding?.acceptedGuests || 0,
            pendingRSVPs: wedding?.pendingRSVPs || 0,
            declinedGuests: wedding?.declinedGuests || 0,
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
  
  // Handle edit guest
  const handleEditGuest = (guest: any) => {
    setEditingGuest(guest);
    setEditGuestFirstName(guest.firstName || guest.name?.split(' ')[0] || '');
    setEditGuestLastName(guest.lastName || guest.name?.split(' ').slice(1).join(' ') || '');
    setEditGuestRsvpStatus(guest.rsvpStatus || 'pending');
    const restrictionIds = (guest.dietaryRestrictions || []).map((r: any) => r.restriction_id || r.id).filter(Boolean);
    setEditGuestRestrictionIds(restrictionIds);
    setEditGuestOpen(true);
  };
  
  // Handle save edited guest
  const handleSaveEditGuest = async () => {
    if (!editingGuest || !id) return;
    
    if (!editGuestFirstName.trim() || !editGuestLastName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setEditGuestLoading(true);
    try {
      const fullName = `${editGuestFirstName.trim()} ${editGuestLastName.trim()}`;
      await guestsAPI.update(editingGuest.id, {
        guest_name: fullName,
        rsvp_status: editGuestRsvpStatus,
        restriction_ids: editGuestRestrictionIds
      });
      
      // Refresh guests list
      const guestsResponse = await guestsAPI.getAll({ wedding_id: id });
      if (guestsResponse && guestsResponse.success && guestsResponse.data) {
        const transformedGuests = guestsResponse.data.map((g: any) => {
          const guestName = g.guest_name || g.name || '';
          let restrictions = [];
          if (g.restrictions) {
            try {
              if (typeof g.restrictions === 'string') {
                restrictions = JSON.parse(g.restrictions);
              } else if (Array.isArray(g.restrictions)) {
                restrictions = g.restrictions;
              }
            } catch (e) {
              restrictions = [];
            }
          }
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
      }
      
      setEditGuestOpen(false);
      setEditingGuest(null);
      toast({
        title: 'Guest Updated',
        description: `${fullName} has been updated successfully`,
      });
    } catch (error: any) {
      console.error('Error updating guest:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update guest',
        variant: 'destructive',
      });
    } finally {
      setEditGuestLoading(false);
    }
  };
  
  // Handle delete guest
  const handleDeleteGuest = async (guestId: number) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;
    
    setDeleteGuestLoading(true);
    setDeleteGuestId(guestId);
    try {
      await guestsAPI.delete(guestId);
      
      // Refresh guests list
      const guestsResponse = await guestsAPI.getAll({ wedding_id: id });
      if (guestsResponse && guestsResponse.success && guestsResponse.data) {
        const transformedGuests = guestsResponse.data.map((g: any) => {
          const guestName = g.guest_name || g.name || '';
          let restrictions = [];
          if (g.restrictions) {
            try {
              if (typeof g.restrictions === 'string') {
                restrictions = JSON.parse(g.restrictions);
              } else if (Array.isArray(g.restrictions)) {
                restrictions = g.restrictions;
              }
            } catch (e) {
              restrictions = [];
            }
          }
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
      }
      
      toast({
        title: 'Guest Deleted',
        description: 'Guest has been removed successfully',
      });
    } catch (error: any) {
      console.error('Error deleting guest:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete guest',
        variant: 'destructive',
      });
    } finally {
      setDeleteGuestLoading(false);
      setDeleteGuestId(null);
    }
  };
  
  // Table form handlers
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    const newErrors: Record<string, string> = {};
    
    if (!tableCategory) {
      newErrors.tableCategory = 'Table category is required';
    }
    
    const capacity = parseInt(tableCapacity);
    if (!tableCapacity || isNaN(capacity) || capacity <= 0) {
      newErrors.tableCapacity = 'Valid capacity is required';
    } else {
      const categoryLower = tableCategory.toLowerCase();
      if (categoryLower === 'couple') {
        if (capacity < 2 || capacity > 15) {
          newErrors.tableCapacity = 'Couple table capacity must be between 2 and 15';
        }
      } else if (categoryLower) {
        if (capacity < 1 || capacity > 15) {
          newErrors.tableCapacity = 'Table capacity must be between 1 and 15';
        }
      }
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
      // Use actual API based on category
      const categoryLower = tableCategory.toLowerCase();
      if (categoryLower === 'couple') {
        await tablesAPI.createCoupleTable(id, { capacity });
      } else {
        await tablesAPI.createGuestTable(id, capacity, tableCategory);
      }
      
      // Refresh tables
      const resp = await tablesAPI.getSeating(id);
      let tablesData: any[] = [];
      if (resp) {
        if (resp.data && Array.isArray(resp.data)) {
          tablesData = resp.data;
        } else if (Array.isArray(resp)) {
          tablesData = resp;
        } else if (resp.success && resp.data && Array.isArray(resp.data)) {
          tablesData = resp.data;
        }
      }
      tablesData = tablesData.map((t: any) => ({
        ...t,
        id: t.id || t.table_id,
        table_id: t.table_id || t.id,
        tableNumber: t.tableNumber || t.table_number,
        table_number: t.table_number || t.tableNumber,
        category: t.category || t.table_category,
        table_category: t.table_category || t.category,
        capacity: t.capacity || 0,
        assignedGuests: t.assignedGuests || t.assigned_guests || [],
        assigned_guests: t.assigned_guests || t.assignedGuests || []
      }));
      setTables(tablesData);
      
      // Reset form
      setTableCategory('');
      setTableNumber('');
      setTableCapacity('');
      setTableFormErrors({});
      
      toast({
        title: 'Table Added',
        description: `${tableCategory} table with capacity ${capacity} created successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to add table. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setTableFormLoading(false);
    }
  };
  
  // Guest allocation handler
  const handleAllocateGuest = async () => {
    if (!allocationTableId || !allocationGuestId || !id) {
      toast({
        title: 'Validation Error',
        description: 'Please select both a table and a guest',
        variant: 'destructive',
      });
      return;
    }
    
    // Get table and guest info before updating state
    const table = tables.find(t => (t.id ?? t.table_id)?.toString() === allocationTableId);
    const guest = guests.find(g => (g.id ?? g.guest_id)?.toString() === allocationGuestId);
    
    if (!table || !guest) {
      toast({
        title: 'Error',
        description: 'Selected table or guest not found',
        variant: 'destructive',
      });
      return;
    }
    
    const tableId = table.id || table.table_id;
    const guestId = guest.id || guest.guest_id;
    
    // Check if guest is already assigned to this table
    if (guest.table_id === tableId) {
      toast({
        title: 'Info',
        description: 'Guest is already assigned to this table',
        variant: 'default',
      });
      return;
    }
    
    // Check if guest is already assigned to a different table
    if (guest.table_id && guest.table_id !== tableId) {
      const confirmMsg = `Guest is already assigned to another table. They will be moved to this table. Continue?`;
      if (!confirm(confirmMsg)) {
        return;
      }
    }
    
    // Check table capacity (count guests that will remain after reassignment)
    const guestsStayingOnTable = guests.filter(g => g.table_id === tableId && g.id !== guestId).length;
    const totalAfterAssignment = guestsStayingOnTable + 1;
    const available = (table.capacity || 0) - guestsStayingOnTable;
    
    if (totalAfterAssignment > (table.capacity || 0)) {
      toast({
        title: 'Error',
        description: `Table ${table.tableNumber || table.table_number} is at full capacity (${table.capacity || 0})`,
        variant: 'destructive',
      });
      return;
    }
    
    setAllocationLoading(true);
    
    try {
      // Use backend API to assign guest
      await tablesAPI.assignGuests(id, tableId, [guestId]);
      
      // Refresh guests to get updated table_id
      const guestsResp = await guestsAPI.getByWedding(id);
      if (guestsResp && guestsResp.data) {
        const transformedGuests = guestsResp.data.map((g: any) => {
          const guestName = g.guest_name || '';
          let restrictions: any[] = [];
          if (g.restrictions) {
            try {
              if (typeof g.restrictions === 'string') {
                restrictions = JSON.parse(g.restrictions);
              } else if (Array.isArray(g.restrictions)) {
                restrictions = g.restrictions;
              }
            } catch (e) {
              restrictions = [];
            }
          }
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
            weddingId: g.wedding_id,
            table_id: g.table_id || null
          };
        }).filter((g: any) => g !== null);
        
        setGuests(transformedGuests);
      }
      
      // Refresh tables to update counts
      const tablesResp = await tablesAPI.getSeating(id);
      if (tablesResp) {
        let tablesData: any[] = [];
        if (tablesResp.data && Array.isArray(tablesResp.data)) {
          tablesData = tablesResp.data;
        } else if (Array.isArray(tablesResp)) {
          tablesData = tablesResp;
        } else if (tablesResp.success && tablesResp.data && Array.isArray(tablesResp.data)) {
          tablesData = tablesResp.data;
        }
        tablesData = tablesData.map((t: any) => ({
          ...t,
          id: t.id || t.table_id,
          table_id: t.table_id || t.id,
          tableNumber: t.tableNumber || t.table_number,
          table_number: t.table_number || t.tableNumber,
          category: t.category || t.table_category,
          table_category: t.table_category || t.category,
          capacity: t.capacity || 0,
          assignedGuests: t.assignedGuests || t.assigned_guests || [],
          assigned_guests: t.assigned_guests || t.assignedGuests || []
        }));
        setTables(tablesData);
      }
      
      // Reset form
      setAllocationTableId('');
      setAllocationGuestId('');
      
      toast({
        title: 'Guest Assigned',
        description: `${guest.firstName} ${guest.lastName} ${guest.table_id && guest.table_id !== tableId ? 'reassigned' : 'assigned'} to ${table.tableNumber || table.table_number}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to assign guest. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAllocationLoading(false);
    }
  };

  // Remove guest from table
  const handleRemoveGuestFromTable = async (guestId: number, tableId: number) => {
    if (!id) return;
    
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;
    
    try {
      // Update guest's table_id to null via API - need to send guest_name and rsvp_status
      await guestsAPI.update(guestId, { 
        guest_name: guest.name || `${guest.firstName} ${guest.lastName}`,
        rsvp_status: guest.rsvpStatus || 'pending',
        table_id: null 
      });
      
      // Refresh guests
      const guestsResp = await guestsAPI.getByWedding(id);
      if (guestsResp && guestsResp.data) {
        const transformedGuests = guestsResp.data.map((g: any) => {
          const guestName = g.guest_name || '';
          let restrictions: any[] = [];
          if (g.restrictions) {
            try {
              if (typeof g.restrictions === 'string') {
                restrictions = JSON.parse(g.restrictions);
              } else if (Array.isArray(g.restrictions)) {
                restrictions = g.restrictions;
              }
            } catch (e) {
              restrictions = [];
            }
          }
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
            weddingId: g.wedding_id,
            table_id: g.table_id || null
          };
        }).filter((g: any) => g !== null);
        
        setGuests(transformedGuests);
      }
      
      toast({
        title: 'Guest Removed',
        description: `${guest.firstName} ${guest.lastName} removed from table`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to remove guest from table',
        variant: 'destructive',
      });
    }
  };
  
  // Bulk assignment handler
  const handleBulkAssign = async () => {
    if (selectedGuestIds.length === 0 || !bulkTableId || !id) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one guest and a table',
        variant: 'destructive',
      });
      return;
    }
    
    const table = tables.find(t => (t.id ?? t.table_id)?.toString() === bulkTableId);
    if (!table) {
      toast({
        title: 'Error',
        description: 'Selected table not found',
        variant: 'destructive',
      });
      return;
    }
    
    const tableId = table.id || table.table_id;
    
    // Check if any selected guests are already assigned to a different table
    // If they are assigned to the same table, that's fine - just skip them
    const guestsToAssign: number[] = [];
    const guestsToReassign: Array<{guestId: number, oldTableId: number}> = [];
    
    selectedGuestIds.forEach(guestId => {
      const guest = guests.find(g => g.id === guestId);
      if (!guest) return;
      
      if (!guest.table_id) {
        // Unassigned guest - add to assign list
        guestsToAssign.push(guestId);
      } else if (guest.table_id === tableId) {
        // Already assigned to this table - skip
        return;
      } else {
        // Assigned to different table - will need to reassign
        guestsToReassign.push({guestId, oldTableId: guest.table_id});
        guestsToAssign.push(guestId);
      }
    });
    
    if (guestsToAssign.length === 0) {
      toast({
        title: 'Info',
        description: 'All selected guests are already assigned to this table',
        variant: 'default',
      });
      return;
    }
    
    // Show warning if reassigning
    if (guestsToReassign.length > 0) {
      const confirmMsg = `${guestsToReassign.length} guest(s) are currently assigned to other tables. They will be moved to this table. Continue?`;
      if (!confirm(confirmMsg)) {
        return;
      }
    }
    
    // Check table capacity (count guests that will remain after reassignment)
    const guestsStayingOnTable = guests.filter(g => g.table_id === tableId && !guestsToAssign.includes(g.id)).length;
    const newAssignments = guestsToAssign.length;
    const totalAfterAssignment = guestsStayingOnTable + newAssignments;
    const available = (table.capacity || 0) - guestsStayingOnTable;
    
    if (newAssignments > available) {
      toast({
        title: 'Error',
        description: `Table ${table.tableNumber || table.table_number} only has ${available} available seat(s), but ${newAssignments} guest(s) selected`,
        variant: 'destructive',
      });
      return;
    }
    
    if (totalAfterAssignment > (table.capacity || 0)) {
      toast({
        title: 'Error',
        description: `Assigning ${newAssignments} guest(s) would exceed table capacity of ${table.capacity || 0}`,
        variant: 'destructive',
      });
      return;
    }
    
    setBulkAssignmentLoading(true);
    
    try {
      // Use backend API to assign guests (this will handle reassignment automatically)
      await tablesAPI.assignGuests(id, tableId, guestsToAssign);
      
      // Refresh guests to get updated table_id
      const guestsResp = await guestsAPI.getByWedding(id);
      if (guestsResp && guestsResp.data) {
        const transformedGuests = guestsResp.data.map((g: any) => {
          const guestName = g.guest_name || '';
          let restrictions: any[] = [];
          if (g.restrictions) {
            try {
              if (typeof g.restrictions === 'string') {
                restrictions = JSON.parse(g.restrictions);
              } else if (Array.isArray(g.restrictions)) {
                restrictions = g.restrictions;
              }
            } catch (e) {
              restrictions = [];
            }
          }
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
            weddingId: g.wedding_id,
            table_id: g.table_id || null
          };
        }).filter((g: any) => g !== null);
        
        setGuests(transformedGuests);
      }
      
      // Reset form
      setSelectedGuestIds([]);
      setBulkTableId('');
      setBulkAssignmentOpen(false);
      
      toast({
        title: 'Guests Assigned',
        description: `${guestsToAssign.length} guest(s) ${guestsToReassign.length > 0 ? 'reassigned' : 'assigned'} to ${table.tableNumber || table.table_number}`,
      });
      
      // Refresh tables to update counts
      const tablesResp = await tablesAPI.getSeating(id);
      if (tablesResp) {
        let tablesData: any[] = [];
        if (tablesResp.data && Array.isArray(tablesResp.data)) {
          tablesData = tablesResp.data;
        } else if (Array.isArray(tablesResp)) {
          tablesData = tablesResp;
        } else if (tablesResp.success && tablesResp.data && Array.isArray(tablesResp.data)) {
          tablesData = tablesResp.data;
        }
        tablesData = tablesData.map((t: any) => ({
          ...t,
          id: t.id || t.table_id,
          table_id: t.table_id || t.id,
          tableNumber: t.tableNumber || t.table_number,
          table_number: t.table_number || t.tableNumber,
          category: t.category || t.table_category,
          table_category: t.table_category || t.category,
          capacity: t.capacity || 0,
          assignedGuests: t.assignedGuests || t.assigned_guests || [],
          assigned_guests: t.assigned_guests || t.assignedGuests || []
        }));
        setTables(tablesData);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to assign guests. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBulkAssignmentLoading(false);
    }
  };

  // Helper to get unassigned guests
  const getUnassignedGuests = () => {
    return guests.filter(g => !g.table_id);
  };

  // Helper to get table package
  const getTablePackage = (tableId: number) => {
    return tablePackageAssignments.find(a => a.tableId === tableId);
  };

  // Edit table state
  const [editTableOpen, setEditTableOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [editTableCapacity, setEditTableCapacity] = useState('');
  const [editTableLoading, setEditTableLoading] = useState(false);
  
  // Table positions for seating layout (drag and drop)
  const [tablePositions, setTablePositions] = useState<Record<number, { x: number; y: number }>>({});
  const [draggedTableId, setDraggedTableId] = useState<number | null>(null);

  // Edit table handler
  const handleEditTable = (table: any) => {
    setEditingTable(table);
    setEditTableCapacity((table.capacity || 0).toString());
    setEditTableOpen(true);
  };

  // Save edited table
  const handleSaveEditTable = async () => {
    if (!editingTable || !id) return;
    
    const capacity = parseInt(editTableCapacity);
    if (isNaN(capacity) || capacity < 1) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid capacity',
        variant: 'destructive',
      });
      return;
    }

    // Validate capacity based on table category
    const category = editingTable.category || editingTable.table_category || '';
    const categoryLower = category.toLowerCase();
    const assignedCount = guests.filter(g => g.table_id === (editingTable.id || editingTable.table_id)).length;
    
    if (categoryLower === 'couple') {
      // Couple table: minimum 2, maximum 15
      if (capacity < 2 || capacity > 15) {
        toast({
          title: 'Validation Error',
          description: 'Couple table capacity must be between 2 and 15',
          variant: 'destructive',
        });
        return;
      }
    } else {
      // Other tables: minimum 1, maximum 15
      if (capacity < 1 || capacity > 15) {
        toast({
          title: 'Validation Error',
          description: 'Capacity must be between 1 and 15',
          variant: 'destructive',
        });
        return;
      }
    }
    
    // Check if new capacity is less than assigned guests
    if (capacity < assignedCount) {
      toast({
        title: 'Validation Error',
        description: `Capacity cannot be less than assigned guests (${assignedCount})`,
        variant: 'destructive',
      });
      return;
    }

    setEditTableLoading(true);
    try {
      // Update table capacity via backend
      await tablesAPI.updateTable(editingTable.id || editingTable.table_id, { capacity });
      
      // Refresh tables
      const resp = await tablesAPI.getSeating(id);
      let tablesData: any[] = [];
      if (resp) {
        if (resp.data && Array.isArray(resp.data)) {
          tablesData = resp.data;
        } else if (Array.isArray(resp)) {
          tablesData = resp;
        } else if (resp.success && resp.data && Array.isArray(resp.data)) {
          tablesData = resp.data;
        }
      }
      
      tablesData = tablesData.map((t: any) => ({
        ...t,
        id: t.id || t.table_id,
        table_id: t.table_id || t.id,
        tableNumber: t.tableNumber || t.table_number,
        table_number: t.table_number || t.tableNumber,
        category: t.category || t.table_category,
        table_category: t.table_category || t.category,
        capacity: t.capacity || 0,
        assignedGuests: t.assignedGuests || t.assigned_guests || [],
        assigned_guests: t.assigned_guests || t.assignedGuests || []
      }));
      
      setTables(tablesData);
      
      toast({
        title: 'Table Updated',
        description: `Table capacity updated to ${capacity}`,
      });
      
      setEditTableOpen(false);
      setEditingTable(null);
      setEditTableCapacity('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update table',
        variant: 'destructive',
      });
    } finally {
      setEditTableLoading(false);
    }
  };

  // Delete table handler - ALLOW deleting ALL tables (guests will be unassigned)
  const handleDeleteTable = async (tableId: number | undefined) => {
    if (!tableId || !id) return;
    
    const table = tables.find(t => (t.id || t.table_id) === tableId);
    if (!table) return;
    
    const assignedCount = guests.filter(g => g.table_id === tableId).length;
    const warningMsg = assignedCount > 0 
      ? `This will unassign ${assignedCount} guest(s) from the table. Are you sure?`
      : `Are you sure you want to delete table ${table.tableNumber || table.table_number}?`;
    
    if (!confirm(warningMsg)) {
      return;
    }
    
    try {
      await tablesAPI.deleteTable(tableId);
      
      // Refresh tables
      const resp = await tablesAPI.getSeating(id);
      let tablesData: any[] = [];
      if (resp) {
        if (resp.data && Array.isArray(resp.data)) {
          tablesData = resp.data;
        } else if (Array.isArray(resp)) {
          tablesData = resp;
        } else if (resp.success && resp.data && Array.isArray(resp.data)) {
          tablesData = resp.data;
        }
      }
      
      tablesData = tablesData.map((t: any) => ({
        ...t,
        id: t.id || t.table_id,
        table_id: t.table_id || t.id,
        tableNumber: t.tableNumber || t.table_number,
        table_number: t.table_number || t.tableNumber,
        category: t.category || t.table_category,
        table_category: t.table_category || t.category,
        capacity: t.capacity || 0,
        assignedGuests: t.assignedGuests || t.assigned_guests || [],
        assigned_guests: t.assigned_guests || t.assignedGuests || []
      }));
      
      setTables(tablesData);
      
      // Show warning if no tables exist
      if (tablesData.length === 0) {
        toast({
          title: 'Warning',
          description: 'No tables exist for this wedding. Please create a table to assign guests.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Table Deleted',
          description: assignedCount > 0 
            ? `Table deleted. ${assignedCount} guest(s) have been unassigned.`
            : `Table ${table.tableNumber || table.table_number} has been deleted`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete table',
        variant: 'destructive',
      });
    }
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
  
  // Helper functions - defined before early returns
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
  
  const getTableCategoryBadge = (category: string | undefined | null) => {
    if (!category) return <Badge className="bg-gray-100 text-gray-800">General</Badge>;
    const categoryLower = category.toLowerCase();
    const colors: Record<string, string> = {
      'VIP': 'bg-purple-100 text-purple-800',
      'kids': 'bg-blue-100 text-blue-800',
      'elderly': 'bg-orange-100 text-orange-800',
      'family': 'bg-green-100 text-green-800',
      'entourage': 'bg-indigo-100 text-indigo-800',
      'friends': 'bg-cyan-100 text-cyan-800',
      'vendor': 'bg-yellow-100 text-yellow-800',
      'staff': 'bg-gray-100 text-gray-800',
      'reserved': 'bg-amber-100 text-amber-800',
      'special_needs': 'bg-red-100 text-red-800',
      'couple': 'bg-pink-100 text-pink-800',
      'guest': 'bg-blue-100 text-blue-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    const displayNames: Record<string, string> = {
      'couple': 'Couple',
      'guest': 'Guest',
      'family': 'Family',
      'VIP': 'VIP',
      'entourage': 'Entourage',
      'friends': 'Friends',
      'kids': 'Kids',
      'elderly': 'Elderly',
      'vendor': 'Vendor',
      'staff': 'Staff',
      'reserved': 'Reserved',
      'special_needs': 'Special Needs'
    };
    const displayName = displayNames[categoryLower] || category;
    const icon = categoryLower === 'couple' ? <Heart className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />;
    return (
      <Badge className={colors[category] || colors[categoryLower] || 'bg-gray-100 text-gray-800'}>
        {icon}
        {displayName}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string | undefined | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Guest filtering and sorting logic
  const getFilteredAndSortedGuests = () => {
    let filtered = [...guests];
    
    // Apply filters
    if (guestFilterName) {
      filtered = filtered.filter(g => {
        const name = `${g.firstName || g.name?.split(' ')[0] || ''} ${g.lastName || g.name?.split(' ').slice(1).join(' ') || ''}`.toLowerCase();
        return name.includes(guestFilterName.toLowerCase());
      });
    }
    
    if (guestFilterRsvp) {
      filtered = filtered.filter(g => (g.rsvpStatus || 'pending').toLowerCase() === guestFilterRsvp.toLowerCase());
    }
    
    if (guestFilterRestriction) {
      filtered = filtered.filter(g => {
        const restrictions = Array.isArray(g.dietaryRestrictions) ? g.dietaryRestrictions : [];
        return restrictions.some((r: any) => 
          (r.restriction_name || r.name || '').toLowerCase() === guestFilterRestriction.toLowerCase() ||
          (r.restriction_id?.toString() || '') === guestFilterRestriction
        );
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (guestSortBy) {
        case 'name':
          aVal = `${a.firstName || a.name?.split(' ')[0] || ''} ${a.lastName || a.name?.split(' ').slice(1).join(' ') || ''}`.toLowerCase();
          bVal = `${b.firstName || b.name?.split(' ')[0] || ''} ${b.lastName || b.name?.split(' ').slice(1).join(' ') || ''}`.toLowerCase();
          break;
        case 'rsvp':
          aVal = (a.rsvpStatus || 'pending').toLowerCase();
          bVal = (b.rsvpStatus || 'pending').toLowerCase();
          break;
        case 'table':
          aVal = getGuestAssignedTable(a) || 'zzz';
          bVal = getGuestAssignedTable(b) || 'zzz';
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return guestSortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return guestSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  };

  const filteredAndSortedGuests = getFilteredAndSortedGuests();
  const totalPages = Math.ceil(filteredAndSortedGuests.length / guestsPerPage);
  const startIndex = (guestCurrentPage - 1) * guestsPerPage;
  const endIndex = startIndex + guestsPerPage;
  const paginatedGuests = filteredAndSortedGuests.slice(startIndex, endIndex);

  const handleClearGuestFilters = () => {
    setGuestFilterName('');
    setGuestFilterRsvp('');
    setGuestFilterRestriction('');
    setGuestCurrentPage(1);
  };

  const hasActiveFilters = guestFilterName || guestFilterRsvp || guestFilterRestriction;

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

  if (!wedding && !loading) {
    console.log('Component rendering: Error state - no wedding data. Error:', error);
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-2">
              {error || 'Wedding not found'}
            </p>
            <p className="text-center text-xs text-muted-foreground mb-4">
              Wedding ID: {id}
            </p>
            <div className="flex justify-center mt-4 gap-2">
              <Button onClick={() => navigate('/dashboard/weddings')}>
                Back to Weddings
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
  
  // Safety check - if wedding is still null after loading, show error
  if (!wedding) {
    console.log('Component rendering: Safety check - wedding is null');
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading wedding details...</p>
            <p className="text-xs text-muted-foreground">Wedding ID: {id}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  console.log('Component rendering: Wedding data available', wedding);

  // Wrap main render in try-catch to prevent white screen crashes
  try {
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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {wedding?.couple || 
                   (wedding?.partner1 && wedding?.partner2 ? `${wedding.partner1} & ${wedding.partner2}` : 
                    (wedding?.partner1_name && wedding?.partner2_name ? `${wedding.partner1_name} & ${wedding.partner2_name}` : 'Wedding Details'))}
                </h1>
                {id && (
                  <Badge variant="outline" className="text-xs">
                    ID: {id}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Wedding Dashboard - {safeFormatDate(wedding?.weddingDate || wedding?.wedding_date)}
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
                {safeFormatDate(wedding?.weddingDate || wedding?.wedding_date)}
              </div>
              <p className="text-xs text-muted-foreground">{wedding?.weddingTime || wedding?.wedding_time || 'N/A'}</p>
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
              <div className="text-2xl font-bold">{wedding?.guestCount || wedding?.guest_count || guests.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {wedding?.acceptedGuests || 0} accepted, {wedding?.pendingRSVPs || 0} pending, {wedding?.declinedGuests || 0} declined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mb-2">{getPaymentStatusBadge(wedding?.paymentStatus || wedding?.payment_status || 'pending')}</div>
              <p className="text-xs text-muted-foreground">
                Total: ${((wedding?.totalCost || wedding?.total_cost || 0) as number).toLocaleString()}
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
              Tables
            </TabsTrigger>
            <TabsTrigger value="seating-layout" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              View Seating Layout
            </TabsTrigger>
            <TabsTrigger value="table-packages" className="gap-2">
              <Package className="h-4 w-4" />
              Table Packages
            </TabsTrigger>
            <TabsTrigger value="menu-items" className="gap-2">
              <Utensils className="h-4 w-4" />
              Menu Items
            </TabsTrigger>
            <TabsTrigger value="packages" className="gap-2">
              <Package className="h-4 w-4" />
              Packages
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Guest List</CardTitle>
                    <CardDescription>All guests for this wedding ({filteredAndSortedGuests.length} {filteredAndSortedGuests.length === 1 ? 'guest' : 'guests'})</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="mb-4 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <Input
                        placeholder="Filter by name..."
                        value={guestFilterName}
                        onChange={(e) => {
                          setGuestFilterName(e.target.value);
                          setGuestCurrentPage(1);
                        }}
                        className="h-9"
                      />
                    </div>
                    <div className="w-[150px]">
                      <Select value={guestFilterRsvp || "all"} onValueChange={(val) => {
                        setGuestFilterRsvp(val === "all" ? "" : val);
                        setGuestCurrentPage(1);
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="RSVP Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-[150px]">
                      <Select value={guestFilterRestriction || "all"} onValueChange={(val) => {
                        setGuestFilterRestriction(val === "all" ? "" : val);
                        setGuestCurrentPage(1);
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Restriction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Restrictions</SelectItem>
                          {dietaryRestrictions.map((dr) => {
                            const restrictionValue = dr.restriction_name || dr.restriction_id?.toString();
                            if (!restrictionValue) return null;
                            return (
                              <SelectItem key={dr.restriction_id} value={restrictionValue}>
                                {dr.restriction_name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-[150px]">
                      <Select value={`${guestSortBy}-${guestSortOrder}`} onValueChange={(val) => {
                        const [sortBy, order] = val.split('-');
                        setGuestSortBy(sortBy as 'name' | 'rsvp' | 'table');
                        setGuestSortOrder(order as 'asc' | 'desc');
                      }}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                          <SelectItem value="rsvp-asc">RSVP Status</SelectItem>
                          <SelectItem value="table-asc">Table (A-Z)</SelectItem>
                          <SelectItem value="table-desc">Table (Z-A)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleClearGuestFilters} className="h-9" disabled={!hasActiveFilters}>
                      <Filter className="w-4 h-4 mr-2" />
                      Reset Filters
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Dietary Restrictions</TableHead>
                      <TableHead>RSVP Status</TableHead>
                      <TableHead>Assigned Table</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedGuests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {guests.length === 0 ? 'No guests added yet' : 'No guests match the filters'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedGuests.map((guest) => {
                        const assignedTable = getGuestAssignedTable(guest);
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
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditGuest(guest)} disabled={deleteGuestLoading}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteGuest(guest.id)}
                                    disabled={deleteGuestLoading || deleteGuestId === guest.id}
                                  >
                                    {deleteGuestLoading && deleteGuestId === guest.id ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="mr-2 h-4 w-4" />
                                    )}
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
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedGuests.length)} of {filteredAndSortedGuests.length} guests
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGuestCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={guestCurrentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (guestCurrentPage <= 3) {
                            page = i + 1;
                          } else if (guestCurrentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = guestCurrentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={page}
                              variant={guestCurrentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setGuestCurrentPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGuestCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={guestCurrentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left side: Form fields */}
                  <div className="space-y-4">
                    <form onSubmit={handleAddTable} className="space-y-4">
                      {/* Mandatory Couple Table CTA */}
                      {tables.filter(t => (t?.table_category === 'couple') || (t?.category === 'couple')).length === 0 && (
                        <div className="p-3 rounded border bg-muted/30 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Couple Table Required</p>
                            <p className="text-xs text-muted-foreground">Create the couple table before adding guest tables.</p>
                          </div>
                          <Button onClick={(e) => { e.preventDefault(); ensureCoupleTable(); }} disabled={seatingLoading} size="sm">Create Couple Table</Button>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="tableCategory">Table Category *</Label>
                        <Select value={tableCategory} onValueChange={setTableCategory} disabled={tableFormLoading}>
                          <SelectTrigger id="tableCategory" className={tableFormErrors.tableCategory ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select table category" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px] overflow-y-auto">
                            <SelectItem value="couple">Couple</SelectItem>
                            <SelectItem value="guest">Guest</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="VIP">VIP</SelectItem>
                            <SelectItem value="entourage">Entourage</SelectItem>
                            <SelectItem value="friends">Friends</SelectItem>
                            <SelectItem value="kids">Kids</SelectItem>
                            <SelectItem value="elderly">Elderly</SelectItem>
                            <SelectItem value="vendor">Vendor</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="reserved">Reserved</SelectItem>
                            <SelectItem value="special_needs">Special Needs</SelectItem>
                          </SelectContent>
                        </Select>
                        {tableFormErrors.tableCategory && (
                          <p className="text-sm text-red-500">{tableFormErrors.tableCategory}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tableCapacity">Capacity *</Label>
                        <Input
                          id="tableCapacity"
                          type="number"
                          value={tableCapacity}
                          onChange={(e) => setTableCapacity(e.target.value)}
                          placeholder={tableCategory === 'couple' ? '2-15 for couple tables' : '1-15 for guest tables'}
                          min={tableCategory === 'couple' ? '2' : '1'}
                          max="15"
                          className={tableFormErrors.tableCapacity ? 'border-red-500' : ''}
                          disabled={tableFormLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                          {tableCategory === 'couple' 
                            ? 'Minimum 2 (for both partners), Maximum 15' 
                            : tableCategory 
                              ? 'Minimum 1, Maximum 15'
                              : 'Select a category first'}
                        </p>
                        {tableFormErrors.tableCapacity && (
                          <p className="text-sm text-red-500">{tableFormErrors.tableCapacity}</p>
                        )}
                      </div>
                      <Button type="submit" disabled={tableFormLoading} className="w-full">
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
                    </form>
                  </div>
                  
                  {/* Right side: Quick Add shortcuts */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Quick Add Shortcuts</Label>
                      <div className="space-y-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => addGuestTable(6)} 
                          disabled={tables.filter(t => (t?.table_category === 'couple') || (t?.category === 'couple')).length === 0}
                          className="w-full justify-start h-auto py-3 px-4"
                        >
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-medium">Quick Add Guest Table</span>
                            <span className="text-xs text-muted-foreground">Capacity: 6 seats</span>
                          </div>
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => addGuestTable(10)} 
                          disabled={tables.filter(t => (t?.table_category === 'couple') || (t?.category === 'couple')).length === 0}
                          className="w-full justify-start h-auto py-3 px-4"
                        >
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-medium">Quick Add Guest Table</span>
                            <span className="text-xs text-muted-foreground">Capacity: 10 seats</span>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground">No tables added yet</p>
                    <p className="text-sm text-amber-600 font-medium">
                      ⚠️ Warning: You need at least one table for guest seating. Please add a table to continue.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => {
                  if (!table) return null;
                  try {
                    const tableId = table.id || table.table_id;
                    // Get assigned guests by checking table_id in guest data
                    const assignedGuestsList = (guests || []).filter(g => {
                      if (!g) return false;
                      return g.table_id === tableId;
                    });
                    const assignedCount = assignedGuestsList.length;
                    const capacity = table.capacity || 0;
                    const available = capacity - assignedCount;
                    const isFull = available <= 0 && capacity > 0;
                    const tablePackage = getTablePackage(table.id || table.table_id);
                    const tableCategory = table.category || table.table_category || '';
                    const categoryLower = tableCategory.toLowerCase();
                  
                  return (
                    <Card key={table.id || table.table_id || `table-${table.tableNumber || table.table_number || 'unknown'}`} className="flex flex-col">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{table.tableNumber || table.table_number || 'Unknown'}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">Table ID: {table.table_id || table.id || 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTableCategoryBadge(tableCategory)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditTable(table)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteTable(table.id || table.table_id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <CardDescription>
                          Capacity: {table.capacity || 0} | Assigned: {assignedCount} | Available: {available}
                        </CardDescription>
                        <div className="mt-2">
                          {isFull ? (
                            <Badge variant="destructive">Full</Badge>
                          ) : (
                            <Badge variant="secondary">Available</Badge>
                          )}
                        </div>
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
                          const restrictionDetails: any[] = [];
                          
                          // For couple table, get restrictions from couple preferences
                          if (categoryLower === 'couple' && coupleData && coupleData.preferences) {
                            coupleData.preferences.forEach((pref: any) => {
                              if (pref.dietaryRestrictions && Array.isArray(pref.dietaryRestrictions)) {
                                pref.dietaryRestrictions.forEach((r: any) => {
                                  if (r && r.restriction_name && r.restriction_name !== 'None') {
                                    tableRestrictions.add(r.restriction_name);
                                    restrictionDetails.push(r);
                                  }
                                });
                              }
                            });
                          }
                          
                          // Also get restrictions from assigned guests
                          assignedGuestsList.forEach((guest) => {
                            const restrictions = Array.isArray(guest.dietaryRestrictions) 
                              ? guest.dietaryRestrictions 
                              : guest.dietaryRestriction 
                                ? [{ restriction_name: guest.dietaryRestriction }] 
                                : [];
                            restrictions.forEach((r: any) => {
                              if (r.restriction_name && r.restriction_name !== 'None') {
                                tableRestrictions.add(r.restriction_name);
                                if (!restrictionDetails.find(d => d.restriction_name === r.restriction_name)) {
                                  restrictionDetails.push(r);
                                }
                              }
                            });
                          });
                          
                          return tableRestrictions.size > 0 ? (
                            <div className="pb-2 border-b">
                              <p className="text-xs font-medium mb-1 text-muted-foreground">Dietary Restrictions:</p>
                              <div className="flex flex-wrap gap-1">
                                {restrictionDetails.map((r, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="outline" 
                                    className={`text-xs ${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                                  >
                                    {getTypeIcon(r.restriction_type || '')}
                                    {r.restriction_name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : null;
                        })()}
                        <div>
                          {categoryLower === 'couple' ? (
                            <>
                              <p className="text-sm font-medium mb-2">Seated Couple / Partners at This Table:</p>
                              {assignedGuestsList.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No partners assigned</p>
                              ) : (
                                <div className="space-y-2">
                                  {(() => {
                                    // Get partner names from wedding data
                                    const partner1Name = wedding?.partner1 || wedding?.partner1_name || '';
                                    const partner2Name = wedding?.partner2 || wedding?.partner2_name || '';
                                    
                                    // Find partners in assigned guests
                                    const partner1 = assignedGuestsList.find(g => {
                                      const guestName = (g.firstName || g.name?.split(' ')[0] || '') + ' ' + (g.lastName || g.name?.split(' ').slice(1).join(' ') || '');
                                      return guestName.trim().includes(partner1Name) || partner1Name.includes(guestName.trim());
                                    });
                                    const partner2 = assignedGuestsList.find(g => {
                                      const guestName = (g.firstName || g.name?.split(' ')[0] || '') + ' ' + (g.lastName || g.name?.split(' ').slice(1).join(' ') || '');
                                      return guestName.trim().includes(partner2Name) || partner2Name.includes(guestName.trim());
                                    });
                                    
                                    // Get restrictions from couple preferences
                                    const coupleRestrictions: any[] = [];
                                    if (coupleData && coupleData.preferences) {
                                      coupleData.preferences.forEach((pref: any) => {
                                        if (pref.dietaryRestrictions && Array.isArray(pref.dietaryRestrictions)) {
                                          pref.dietaryRestrictions.forEach((r: any) => {
                                            if (r && r.restriction_name && r.restriction_name !== 'None') {
                                              if (!coupleRestrictions.find(cr => cr.restriction_name === r.restriction_name)) {
                                                coupleRestrictions.push(r);
                                              }
                                            }
                                          });
                                        }
                                      });
                                    }
                                    
                                    return (
                                      <>
                                        {partner1 && (
                                          <div className="text-sm p-2 rounded bg-muted/50">
                                            <p className="font-medium">Partner 1: {partner1.firstName || partner1.name?.split(' ')[0] || partner1Name} {partner1.lastName || partner1.name?.split(' ').slice(1).join(' ') || ''}</p>
                                          </div>
                                        )}
                                        {partner2 && (
                                          <div className="text-sm p-2 rounded bg-muted/50">
                                            <p className="font-medium">Partner 2: {partner2.firstName || partner2.name?.split(' ')[0] || partner2Name} {partner2.lastName || partner2.name?.split(' ').slice(1).join(' ') || ''}</p>
                                          </div>
                                        )}
                                        {coupleRestrictions.length > 0 && (
                                          <div className="mt-2 pt-2 border-t">
                                            <p className="text-xs font-medium mb-1 text-muted-foreground">Dietary Restrictions:</p>
                                            <div className="flex flex-wrap gap-1">
                                              {coupleRestrictions.map((r, idx) => (
                                                <Badge 
                                                  key={idx} 
                                                  variant="outline" 
                                                  className={`text-xs ${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                                                >
                                                  {getTypeIcon(r.restriction_type || '')}
                                                  {r.restriction_name}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {/* Show other guests if any */}
                                        {assignedGuestsList.filter(g => g.id !== partner1?.id && g.id !== partner2?.id).length > 0 && (
                                          <div className="mt-2 pt-2 border-t">
                                            <p className="text-xs font-medium mb-1 text-muted-foreground">Other Guests:</p>
                                            <ul className="space-y-1">
                                              {assignedGuestsList.filter(g => g.id !== partner1?.id && g.id !== partner2?.id).map((guest) => {
                                                const restrictions = Array.isArray(guest.dietaryRestrictions) 
                                                  ? guest.dietaryRestrictions 
                                                  : guest.dietaryRestriction 
                                                    ? [{ restriction_name: guest.dietaryRestriction }] 
                                                    : [];
                                                return (
                                                  <li key={guest.id} className="flex items-center justify-between gap-2 text-sm p-1 rounded hover:bg-muted/50">
                                                    <div className="flex items-center gap-2 flex-1">
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
                                                    </div>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                                      onClick={() => handleRemoveGuestFromTable(guest.id, tableId)}
                                                    >
                                                      <X className="h-3 w-3" />
                                                    </Button>
                                                  </li>
                                                );
                                              })}
                                            </ul>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
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
                                      <li key={guest.id} className="flex items-center justify-between gap-2 text-sm p-1 rounded hover:bg-muted/50">
                                        <div className="flex items-center gap-2 flex-1">
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
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                          onClick={() => handleRemoveGuestFromTable(guest.id, tableId)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                  } catch (tableError) {
                    console.error('Error rendering table:', tableError, table);
                    return null;
                  }
                }).filter(Boolean)}
              </div>
            )}

            {/* Tables List */}
            <Card>
              <CardHeader>
                <CardTitle>All Tables</CardTitle>
                <CardDescription>Overview of all tables for this wedding</CardDescription>
              </CardHeader>
              <CardContent>
                {tables.length === 0 ? (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-muted-foreground">No tables added yet</p>
                    <p className="text-sm text-amber-600 font-medium">
                      ⚠️ Warning: No tables available. Please add tables to manage seating.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table ID</TableHead>
                        <TableHead>Table Number</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Assigned Guests</TableHead>
                        <TableHead>Available Seats</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tables.map((table) => {
                        if (!table) return null;
                        const tableId = table.id || table.table_id;
                        const assignedGuestsList = (guests || []).filter(g => g && g.table_id === tableId);
                        const assignedCount = assignedGuestsList.length;
                        const capacity = table.capacity || 0;
                        const available = capacity - assignedCount;
                        const tableNum = table.tableNumber || table.table_number || 'Unknown';
                        const category = table.category || table.table_category || 'General';
                        const isFull = available <= 0 && capacity > 0;
                        
                        return (
                          <TableRow key={table.id || table.table_id || `table-${tableNum}`}>
                            <TableCell className="font-medium text-xs text-muted-foreground">{tableId || 'N/A'}</TableCell>
                            <TableCell className="font-medium">{tableNum}</TableCell>
                            <TableCell>{getTableCategoryBadge(category)}</TableCell>
                            <TableCell>{capacity || 'N/A'}</TableCell>
                            <TableCell>{assignedCount}</TableCell>
                            <TableCell>
                              <Badge variant={isFull ? "destructive" : "outline"}>
                                {available}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {isFull ? (
                                <Badge variant="destructive">Full</Badge>
                              ) : (
                                <Badge variant="secondary">Available</Badge>
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
                                  <DropdownMenuItem onClick={() => handleEditTable(table)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteTable(tableId)}
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
                )}
              </CardContent>
            </Card>

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
                          {tables.map((table) => {
                            if (!table) return null;
                            const assignedGuests = table.assignedGuests || table.assigned_guests || [];
                            const assignedCount = Array.isArray(assignedGuests) ? assignedGuests.length : 0;
                            const available = (table.capacity || 0) - assignedCount;
                            const tableId = table.id || table.table_id;
                            const tableNum = table.tableNumber || table.table_number || 'Unknown';
                            const category = table.category || table.table_category || 'General';
                            return (
                              <SelectItem key={tableId || `table-${tableNum}`} value={(tableId ?? tableNum)?.toString() ?? ''}>
                                {tableNum} ({category}) - {available} available
                              </SelectItem>
                            );
                          }).filter(Boolean)}
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
                          {guests
                            .filter(guest => !guest.table_id) // Only show unassigned guests
                            .map((guest) => (
                            <SelectItem key={guest.id || guest.guest_id || `guest-${guest.name}`} value={(guest.id ?? guest.guest_id)?.toString() ?? ''}>
                              {guest.firstName || guest.name?.split(' ')[0] || 'Unknown'} {guest.lastName || guest.name?.split(' ').slice(1).join(' ') || ''}
                              {guest.table_id && <span className="text-xs text-muted-foreground ml-2">(Assigned)</span>}
                            </SelectItem>
                          ))}
                          {guests.filter(guest => !guest.table_id).length === 0 && (
                            <SelectItem value="none" disabled>No unassigned guests available</SelectItem>
                          )}
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
                <div className="bg-muted/30 rounded-lg border p-6 min-h-[500px]">
                  <div 
                    className="relative w-full" 
                    style={{ minHeight: '400px' }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedTableId = parseInt(e.dataTransfer.getData('tableId') || '0');
                      if (draggedTableId && draggedTableId > 0) {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        
                        setTablePositions(prev => ({
                          ...prev,
                          [draggedTableId]: { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
                        }));
                        setDraggedTableId(null);
                      }
                    }}
                  >
                    {!tables || tables.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Add tables to see seating layout
                      </div>
                    ) : (
                      tables.map((table) => {
                        if (!table) return null;
                        try {
                          const tableId = table.id || table.table_id;
                          const assignedCount = guests.filter(g => g && g.table_id === tableId).length;
                          const capacity = table.capacity || 0;
                          const available = capacity - assignedCount;
                          const categoryColors: Record<string, string> = {
                            'VIP': 'bg-purple-200 border-purple-400',
                            'kids': 'bg-blue-200 border-blue-400',
                            'elderly': 'bg-orange-200 border-orange-400',
                            'family': 'bg-green-200 border-green-400',
                            'entourage': 'bg-indigo-200 border-indigo-400',
                            'friends': 'bg-cyan-200 border-cyan-400',
                            'vendor': 'bg-yellow-200 border-yellow-400',
                            'staff': 'bg-gray-200 border-gray-400',
                            'reserved': 'bg-amber-200 border-amber-400',
                            'special_needs': 'bg-red-200 border-red-400',
                            'couple': 'bg-pink-200 border-pink-400',
                            'guest': 'bg-blue-200 border-blue-400',
                            'General': 'bg-gray-200 border-gray-400'
                          };
                          const tableCategory = table.category || table.table_category || 'General';
                          const tableNum = table.tableNumber || table.table_number || 'Unknown';
                          // Ensure table numbers are displayed correctly (C-001, T-001 format)
                          const displayTableNum = tableNum.startsWith('C-') || tableNum.startsWith('T-') || tableNum.startsWith('c-') || tableNum.startsWith('t-') 
                            ? tableNum.toUpperCase().replace(/^C-/, 'C-').replace(/^T-/, 'T-')
                            : tableCategory.toLowerCase() === 'couple' 
                              ? `C-${tableNum.padStart(3, '0')}`
                              : `T-${tableNum.padStart(3, '0')}`;
                          
                          // Get position from state or use default grid position
                          const defaultX = 10 + ((tableId || 0) % 6) * 15;
                          const defaultY = 10 + Math.floor((tableId || 0) / 6) * 20;
                          const position = tablePositions[tableId] || { x: defaultX, y: defaultY };
                          
                          return (
                            <div
                              key={tableId || `table-${tableNum}`}
                              className="absolute cursor-move group"
                              style={{
                                left: `${position.x}%`,
                                top: `${position.y}%`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: draggedTableId === tableId ? 20 : 10,
                                opacity: draggedTableId === tableId ? 0.7 : 1
                              }}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('tableId', tableId?.toString() || '');
                                e.dataTransfer.effectAllowed = 'move';
                                setDraggedTableId(tableId);
                              }}
                              onDragEnd={(e) => {
                                setDraggedTableId(null);
                              }}
                            >
                              {/* Table with chairs */}
                              <div className="relative">
                                {/* Chairs arranged around table in a circle */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  {Array.from({ length: Math.min(capacity, 20) }, (_, i) => {
                                    const angle = (i * 360) / Math.min(capacity, 20);
                                    const radian = (angle * Math.PI) / 180;
                                    const chairRadius = 28;
                                    const chairX = Math.cos(radian) * chairRadius;
                                    const chairY = Math.sin(radian) * chairRadius;
                                    const isOccupied = i < assignedCount;
                                    
                                    return (
                                      <div
                                        key={i}
                                        className="absolute rounded-full border transition-all"
                                        style={{
                                          width: '8px',
                                          height: '8px',
                                          left: `calc(50% + ${chairX}px)`,
                                          top: `calc(50% + ${chairY}px)`,
                                          transform: 'translate(-50%, -50%)',
                                          backgroundColor: isOccupied 
                                            ? 'hsl(340, 65%, 55%)' 
                                            : 'hsl(var(--muted))',
                                          borderColor: isOccupied 
                                            ? 'hsl(340, 65%, 55%)' 
                                            : 'hsl(var(--border))',
                                          borderWidth: '1.5px'
                                        }}
                                        title={isOccupied ? 'Occupied' : 'Available'}
                                      />
                                    );
                                  })}
                                </div>
                                
                                {/* Table center */}
                                <div
                                  className={`w-20 h-20 rounded-lg border-2 p-2 flex flex-col items-center justify-center text-xs transition-all hover:shadow-lg hover:scale-105 ${categoryColors[tableCategory] || categoryColors[tableCategory.toLowerCase()] || 'bg-gray-200 border-gray-400'}`}
                                >
                                  <div className="font-semibold text-[11px] leading-tight">{displayTableNum}</div>
                                  <div className="text-[8px] text-muted-foreground mt-0.5">ID: {tableId}</div>
                                  <div className="text-[10px] mt-1 font-medium">{assignedCount}/{capacity}</div>
                                  {available === 0 && (
                                    <div className="text-[8px] text-red-600 mt-0.5 font-bold">Full</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        } catch (e) {
                          console.error('Error rendering table in layout:', e, table);
                          return null;
                        }
                      }).filter(Boolean)
                    )}
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Drag tables to rearrange them freely. Filled circles = occupied chairs, empty circles = available chairs.
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
                  {/* All Guests List (for assignment) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">All Guests ({guests.length})</h4>
                      <Badge variant="outline" className="text-xs">
                        Unassigned: {getUnassignedGuests().length}
                      </Badge>
                    </div>
                    <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto">
                      {guests.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No guests available
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {guests.map((guest) => {
                            const isAssigned = guest.table_id !== null && guest.table_id !== undefined;
                            const assignedTable = isAssigned ? tables.find(t => (t.id || t.table_id) === guest.table_id) : null;
                            return (
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
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">
                                      {guest.firstName || guest.name?.split(' ')[0]} {guest.lastName || guest.name?.split(' ').slice(1).join(' ')}
                                    </p>
                                    {isAssigned && (
                                      <Badge variant="secondary" className="text-xs">
                                        {assignedTable?.tableNumber || assignedTable?.table_number || 'Table'} assigned
                                      </Badge>
                                    )}
                                  </div>
                                  {((guest.dietaryRestriction && guest.dietaryRestriction !== 'None') || (guest.dietaryRestrictions && Array.isArray(guest.dietaryRestrictions) && guest.dietaryRestrictions.length > 0)) && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {guest.dietaryRestrictions && Array.isArray(guest.dietaryRestrictions) && guest.dietaryRestrictions.length > 0
                                        ? guest.dietaryRestrictions.filter((r: any) => r.restriction_name && r.restriction_name !== 'None').map((r: any, idx: number) => (
                                            <Badge key={r.restriction_id || idx} variant="secondary" className="text-xs">
                                              {r.restriction_name}
                                            </Badge>
                                          ))
                                        : guest.dietaryRestriction && guest.dietaryRestriction !== 'None' && (
                                            <Badge variant="secondary" className="text-xs">
                                              {guest.dietaryRestriction}
                                            </Badge>
                                          )
                                      }
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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
                            if (!table) return null;
                            const tableId = table.id || table.table_id;
                            const assignedCount = guests.filter(g => g && g.table_id === tableId).length;
                            const available = (table.capacity || 0) - assignedCount;
                            const tableNum = table.tableNumber || table.table_number || 'Unknown';
                            const category = table.category || table.table_category || 'General';
                            return (
                              <SelectItem 
                                key={tableId || `table-${tableNum}`} 
                                value={(tableId ?? tableNum)?.toString() ?? ''}
                                disabled={available === 0}
                              >
                                {tableNum} ({category}) - {available} available
                              </SelectItem>
                            );
                          }).filter(Boolean)}
                        </SelectContent>
                      </Select>
                      {bulkTableId && (
                        <div className="border rounded-lg p-3 mt-2">
                          {(() => {
                            const selectedTable = tables.find(t => (t.id ?? t.table_id)?.toString() === bulkTableId);
                            if (!selectedTable) return null;
                            const tableId = selectedTable.id || selectedTable.table_id;
                            const assignedCount = guests.filter(g => g && g.table_id === tableId).length;
                            const available = (selectedTable.capacity || 0) - assignedCount;
                            return (
                              <>
                                <p className="text-sm font-medium">{selectedTable.tableNumber || selectedTable.table_number || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">
                                  Capacity: {selectedTable.capacity || 0} | 
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

          {/* Edit Table Dialog */}
          <Dialog open={editTableOpen} onOpenChange={setEditTableOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Table</DialogTitle>
                <DialogDescription>
                  Update table capacity
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editTableCapacity">Capacity</Label>
                  <Input
                    id="editTableCapacity"
                    type="number"
                    value={editTableCapacity}
                    onChange={(e) => setEditTableCapacity(e.target.value)}
                    placeholder={editingTable && (editingTable.category || editingTable.table_category)?.toLowerCase() === 'couple' ? '2-15 for couple tables' : '1-15 for guest tables'}
                    min={editingTable && (editingTable.category || editingTable.table_category)?.toLowerCase() === 'couple' ? '2' : '1'}
                    max="15"
                    disabled={editTableLoading}
                  />
                  {editingTable && (
                    <>
                      <p className="text-xs text-muted-foreground">
                        Current capacity: {editingTable.capacity || 0} | 
                        Assigned guests: {guests.filter(g => g.table_id === (editingTable.id || editingTable.table_id)).length}
                      </p>
                      {(editingTable.category || editingTable.table_category)?.toLowerCase() === 'couple' && (
                        <p className="text-xs text-amber-600">
                          Note: Couple table minimum capacity is 2 (for both partners)
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditTableOpen(false)} disabled={editTableLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEditTable} disabled={editTableLoading}>
                  {editTableLoading ? (
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
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {tables.map((table) => {
                            if (!table) return null;
                            const tableId = table.id || table.table_id;
                            const tableNum = table.tableNumber || table.table_number || 'Unknown';
                            const category = table.category || table.table_category || 'General';
                            return (
                              <SelectItem key={tableId || `table-${tableNum}`} value={(tableId ?? tableNum)?.toString() ?? ''}>
                                {tableNum} ({category})
                              </SelectItem>
                            );
                          }).filter(Boolean)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packageSelect">Package</Label>
                      <Select value={packageAssignPackageId} onValueChange={setPackageAssignPackageId} disabled={packageFormLoading || packages.length === 0}>
                        <SelectTrigger id="packageSelect">
                          <SelectValue placeholder="Select a package" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {packages.map((pkg) => (
                            <SelectItem key={pkg.package_id || pkg.id || `pkg-${pkg.package_name || pkg.packageName}`} value={(pkg.package_id ?? pkg.id ?? pkg.package_name ?? pkg.packageName)?.toString() ?? ''}>
                              {pkg.package_name || pkg.packageName || 'Unknown'} ({pkg.package_type || pkg.packageType || 'Standard'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleAssignPackage} disabled={packageFormLoading || tables.length === 0 || packages.length === 0}>
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
                {tablePackageAssignments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No package assignments yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table Number</TableHead>
                        <TableHead>Package Name</TableHead>
                        <TableHead>Package Type</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tablePackageAssignments.map((assignment) => (
                        <TableRow key={assignment.id || `assignment-${assignment.tableId}-${assignment.packageId}`}>
                          <TableCell className="font-medium">{assignment.tableNumber || 'N/A'}</TableCell>
                          <TableCell>{assignment.packageName || 'N/A'}</TableCell>
                          <TableCell>{assignment.packageType || 'N/A'}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={async () => {
                                try {
                                  await packagesAPI.removeFromTable(assignment.tableId, assignment.packageId);
                                  setTablePackageAssignments(prev => prev.filter(a => a.id !== assignment.id));
                                  toast({
                                    title: 'Package Removed',
                                    description: 'Package removed from table successfully',
                                  });
                                } catch (error: any) {
                                  toast({
                                    title: 'Error',
                                    description: error.response?.data?.error || 'Failed to remove package',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Items Tab */}
          <TabsContent value="menu-items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Menu items available for this wedding</CardDescription>
              </CardHeader>
              <CardContent>
                {menuItemsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading menu items...</span>
                  </div>
                ) : menuItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No menu items available for this wedding</p>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Profit Margin</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Restrictions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {menuItems.map((item) => {
                          const restrictions = item.restriction_name ? [{ restriction_name: item.restriction_name, restriction_type: item.restriction_type }] : [];
                          return (
                            <TableRow key={item.menu_item_id || item.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Utensils className="h-4 w-4 text-muted-foreground" />
                                  {item.menu_name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.menu_type}</Badge>
                              </TableCell>
                              <TableCell>${(item.menu_cost || 0).toFixed(2)}</TableCell>
                              <TableCell>${(item.menu_price || 0).toFixed(2)}</TableCell>
                              <TableCell className="text-green-600">${((item.menu_price || 0) - (item.menu_cost || 0)).toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant={item.stock === 0 ? 'destructive' : item.stock < 10 ? 'secondary' : 'default'}>
                                  {item.stock || 0}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {restrictions.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {restrictions.map((r: any, idx: number) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className={`text-xs ${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                                      >
                                        {getTypeIcon(r.restriction_type || '')}
                                        {r.restriction_name}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">None</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Packages</CardTitle>
                <CardDescription>Packages available for this wedding</CardDescription>
              </CardHeader>
              <CardContent>
                {packagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading packages...</span>
                  </div>
                ) : packages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No packages available for this wedding</p>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Package Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Menu Items</TableHead>
                          <TableHead>Usage Count</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {packages.map((pkg) => {
                          const menuItemsList = pkg.menu_items || [];
                          return (
                            <TableRow key={pkg.package_id || pkg.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  {pkg.package_name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{pkg.package_type}</Badge>
                              </TableCell>
                              <TableCell>${(pkg.package_price || 0).toLocaleString()}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {menuItemsList.length > 0 ? (
                                    menuItemsList.slice(0, 3).map((item: any, idx: number) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {item.menu_name || item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-sm text-muted-foreground">No items</span>
                                  )}
                                  {menuItemsList.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{menuItemsList.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{pkg.usage_count || 0}</Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
                    value={editWeddingForm.preference_id || "none"}
                    onValueChange={(value) => setEditWeddingForm({ ...editWeddingForm, preference_id: value === "none" ? "" : value })}
                    disabled={editWeddingLoading}
                  >
                    <SelectTrigger id="edit_preference_id">
                      <SelectValue placeholder="Select preference (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {couplePreferences.map((pref) => {
                        const prefValue = (pref.preference_id ?? pref.ceremony_type)?.toString();
                        if (!prefValue) return null;
                        return (
                          <SelectItem key={pref.preference_id || `pref-${pref.ceremony_type}`} value={prefValue}>
                            {pref.ceremony_type || 'Unknown'} ({(pref.dietaryRestrictions?.length || 0)} restrictions)
                          </SelectItem>
                        );
                      })}
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

        {/* Edit Guest Dialog */}
        <Dialog open={editGuestOpen} onOpenChange={setEditGuestOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Guest</DialogTitle>
              <DialogDescription>Update guest information and dietary restrictions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_guest_firstName">First Name *</Label>
                  <Input
                    id="edit_guest_firstName"
                    value={editGuestFirstName}
                    onChange={(e) => setEditGuestFirstName(e.target.value)}
                    disabled={editGuestLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_guest_lastName">Last Name *</Label>
                  <Input
                    id="edit_guest_lastName"
                    value={editGuestLastName}
                    onChange={(e) => setEditGuestLastName(e.target.value)}
                    disabled={editGuestLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_guest_restrictions">Dietary Restrictions *</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {dietaryRestrictions.map((restriction) => (
                    <div key={restriction.restriction_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit_restriction_${restriction.restriction_id}`}
                        checked={editGuestRestrictionIds.includes(restriction.restriction_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditGuestRestrictionIds([...editGuestRestrictionIds, restriction.restriction_id]);
                          } else {
                            setEditGuestRestrictionIds(editGuestRestrictionIds.filter(id => id !== restriction.restriction_id));
                          }
                        }}
                        disabled={editGuestLoading}
                      />
                      <label
                        htmlFor={`edit_restriction_${restriction.restriction_id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                      >
                        {getTypeIcon(restriction.restriction_type || '')}
                        {restriction.restriction_name}
                      </label>
                    </div>
                  ))}
                </div>
                {editGuestRestrictionIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {editGuestRestrictionIds.length} restriction(s) selected
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_guest_rsvp">RSVP Status *</Label>
                <Select value={editGuestRsvpStatus} onValueChange={setEditGuestRsvpStatus} disabled={editGuestLoading}>
                  <SelectTrigger id="edit_guest_rsvp">
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
              <Button variant="outline" onClick={() => setEditGuestOpen(false)} disabled={editGuestLoading}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditGuest} disabled={editGuestLoading || !editGuestFirstName.trim() || !editGuestLastName.trim() || editGuestRestrictionIds.length === 0}>
                {editGuestLoading ? (
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
      </div>
    </DashboardLayout>
    );
  } catch (renderError: any) {
    console.error('Error rendering WeddingDetail component:', renderError);
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500 mb-2">
              An error occurred while rendering the page
            </p>
            <p className="text-center text-xs text-muted-foreground mb-4">
              {renderError?.message || 'Unknown error'}
            </p>
            <div className="flex justify-center mt-4 gap-2">
              <Button onClick={() => navigate('/dashboard/weddings')}>
                Back to Weddings
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
};

export default WeddingDetail;


