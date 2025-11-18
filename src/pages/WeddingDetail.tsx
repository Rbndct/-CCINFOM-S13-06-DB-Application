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
  X,
  XCircle,
  Search,
  AlertTriangle,
  Eye,
  Lock,
  Crown
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
import DashboardLayout from '@/components/layout/DashboardLayout';
import { tablesAPI, weddingsAPI, guestsAPI, dietaryRestrictionsAPI, couplesAPI, menuItemsAPI, packagesAPI, inventoryAPI, inventoryAllocationAPI } from '@/api';
import { getTypeIcon, getTypeColor, getNoneRestrictionId, ensureNoneRestriction, filterNoneFromDisplay } from '@/utils/restrictionUtils';
import { CeremonyTypeBadge } from '@/utils/ceremonyTypeUtils';
import { TableCategoryBadge, getTableCategoryIcon } from '@/utils/tableCategoryUtils';
import { PackageTypeBadge } from '@/utils/packageTypeUtils';
import { MultiSelectRestrictions } from '@/components/ui/multi-select-restrictions';
import { useDateFormat } from '@/context/DateFormatContext';
import { useTimeFormat } from '@/context/TimeFormatContext';
import { useCurrencyFormat } from '@/utils/currency';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const WeddingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatDate } = useDateFormat();
  const { formatTime } = useTimeFormat();
  const { formatCurrency } = useCurrencyFormat();
  
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
      return formatDate(date);
    } catch (e) {
      // If date parsing fails, return the original value or N/A
      return typeof dateValue === 'string' ? dateValue.split('T')[0] : 'N/A';
    }
  };

  // Helper function to convert date to YYYY-MM-DD format in local timezone for date inputs
  const dateToInputValue = (dateValue: any): string => {
    if (!dateValue) return '';
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      if (isNaN(date.getTime())) {
        // If invalid date, try to parse as YYYY-MM-DD
        if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
          return dateValue.split('T')[0];
        }
        return '';
      }
      // Get local date components to avoid timezone issues
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      // Fallback to splitting if parsing fails
      return typeof dateValue === 'string' ? dateValue.split('T')[0] : '';
    }
  };
  
  // Helper function to safely format times
  const safeFormatTime = (timeValue: any): string => {
    if (!timeValue) return 'N/A';
    try {
      if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}/)) {
        const [hours, minutes] = timeValue.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return formatTime(date);
      }
      return timeValue;
    } catch (e) {
      return timeValue;
    }
  };
  
  const [wedding, setWedding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Guests state
  const [guests, setGuests] = useState<any[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [guestRestrictionIds, setGuestRestrictionIds] = useState<number[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<any[]>([]);
  const [noneRestrictionId, setNoneRestrictionId] = useState<number | null>(null);
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
  const [bulkAssignFilter, setBulkAssignFilter] = useState<'all' | 'accepted' | 'pending' | 'declined' | 'unassigned'>('all');
  
  // View table dialog state
  const [viewTableOpen, setViewTableOpen] = useState(false);
  const [selectedTableForView, setSelectedTableForView] = useState<any>(null);
  
  // Table packages state
  const [tablePackageAssignments, setTablePackageAssignments] = useState<any[]>([]);
  const [packageAssignTableId, setPackageAssignTableId] = useState('');
  const [packageAssignPackageId, setPackageAssignPackageId] = useState('');
  const [packageFormLoading, setPackageFormLoading] = useState(false);
  const [selectedTableForRecommendations, setSelectedTableForRecommendations] = useState<number | null>(null);
  
  // Available packages for this wedding
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  
  // Menu items and packages state
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [menuItemsLoading, setMenuItemsLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(false);
  
  // Inventory allocation state
  const [inventoryAllocations, setInventoryAllocations] = useState<any[]>([]);
  const [availableInventoryItems, setAvailableInventoryItems] = useState<any[]>([]);
  const [inventoryAllocationLoading, setInventoryAllocationLoading] = useState(false);
  const [addAllocationOpen, setAddAllocationOpen] = useState(false);
  const [editAllocationOpen, setEditAllocationOpen] = useState(false);
  const [deleteAllocationOpen, setDeleteAllocationOpen] = useState(false);
  const [viewAllocationOpen, setViewAllocationOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<any>(null);
  const [viewPackageOpen, setViewPackageOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [deletePackageAssignmentOpen, setDeletePackageAssignmentOpen] = useState(false);
  const [selectedPackageAssignment, setSelectedPackageAssignment] = useState<any>(null);
  const [allocationFormData, setAllocationFormData] = useState({
    inventory_id: '',
    quantity_used: '',
    unit_rental_cost: '',
    rental_cost: '' // Keep for backward compatibility
  });
  const [allocationFormLoading, setAllocationFormLoading] = useState(false);
  const [allocationFormErrors, setAllocationFormErrors] = useState<Record<string, string>>({});
  
  // Guest filtering and sorting state
  const [guestFilterName, setGuestFilterName] = useState('');
  const [guestFilterRsvp, setGuestFilterRsvp] = useState('');
  const [guestFilterRestriction, setGuestFilterRestriction] = useState('');
  const [showGuestFilters, setShowGuestFilters] = useState(false);
  const [guestSortBy, setGuestSortBy] = useState<'id' | 'name' | 'rsvp' | 'table'>(() => {
    const stored = localStorage.getItem('default_table_sort_by');
    return (stored as 'id' | 'name' | 'rsvp' | 'table') || 'id';
  });
  const [guestSortOrder, setGuestSortOrder] = useState<'asc' | 'desc'>(() => {
    const stored = localStorage.getItem('default_table_sort_order');
    return (stored as 'asc' | 'desc') || 'desc';
  });
  const [guestCurrentPage, setGuestCurrentPage] = useState(() => {
    const stored = localStorage.getItem('guest_current_page');
    return stored ? parseInt(stored, 10) : 1;
  });
  const guestsPerPage = 10;

  // Save guest current page to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('guest_current_page', guestCurrentPage.toString());
  }, [guestCurrentPage]);

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
            const dateStr = dateToInputValue(weddingDate);
            
            setEditWeddingForm({
              wedding_date: dateStr,
              wedding_time: weddingData.weddingTime || weddingData.wedding_time || '',
              venue: weddingData.venue || '',
              guest_count: (weddingData.guestCount || weddingData.guest_count || 0).toString(),
              equipment_rental_cost: (weddingData.equipmentRentalCost || weddingData.equipment_rental_cost || weddingData.totalCost || weddingData.total_cost || 0).toString(),
              food_cost: (weddingData.foodCost || weddingData.food_cost || weddingData.productionCost || weddingData.production_cost || 0).toString(),
              total_cost: (weddingData.equipmentRentalCost || weddingData.equipment_rental_cost || weddingData.totalCost || weddingData.total_cost || 0).toString(),
              production_cost: (weddingData.foodCost || weddingData.food_cost || weddingData.productionCost || weddingData.production_cost || 0).toString(),
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
            // Get and store "None" restriction ID
            const noneId = getNoneRestrictionId(restrictionsResponse.data);
            setNoneRestrictionId(noneId);
            
            // Filter out "None" from the display (it's a system restriction)
            const displayableRestrictions = filterNoneFromDisplay(restrictionsResponse.data);
            setDietaryRestrictions(displayableRestrictions);
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
        if (!hasCoupleTable && wedding && wedding.couple_id) {
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
      
      // Fetch packages for this wedding - fetch ALL packages, not filtered by wedding_id
      try {
        setPackagesLoading(true);
        // Fetch all packages from the database
        const packagesResponse = await packagesAPI.getAll({});
        if (packagesResponse && packagesResponse.success && packagesResponse.data) {
          const packagesData = packagesResponse.data || [];
          setPackages(packagesData);
          setAvailablePackages(packagesData);
        } else if (packagesResponse && packagesResponse.data) {
          const packagesData = packagesResponse.data || [];
          setPackages(packagesData);
          setAvailablePackages(packagesData);
        } else {
          // Fallback: try without parameters
          try {
            const fallbackResponse = await packagesAPI.getAll();
            if (fallbackResponse && fallbackResponse.data) {
              const packagesData = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : (fallbackResponse.success && fallbackResponse.data ? [fallbackResponse.data] : []);
              setPackages(packagesData);
              setAvailablePackages(packagesData);
            } else {
              setPackages([]);
              setAvailablePackages([]);
            }
          } catch (fallbackError) {
            console.error('Error in fallback package fetch:', fallbackError);
            setPackages([]);
            setAvailablePackages([]);
          }
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
        if (assignmentsResponse && (assignmentsResponse.success || assignmentsResponse.data)) {
          const assignmentsData = assignmentsResponse.data || [];
          // Ensure all assignment data is properly formatted
          const formattedAssignments = Array.isArray(assignmentsData) ? assignmentsData.map((a: any) => ({
            ...a,
            id: a.id || a.assignment_id || a.table_package_id,
            tableId: a.tableId || a.table_id,
            packageId: a.packageId || a.package_id,
            tableNumber: a.tableNumber || a.table_number,
            packageName: a.packageName || a.package_name,
            packageType: a.packageType || a.package_type
          })) : [];
          setTablePackageAssignments(formattedAssignments);
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

  // Fetch inventory allocations and available inventory items
  useEffect(() => {
    const loadInventoryData = async () => {
      if (!id) return;
      
      // Fetch inventory allocations for this wedding
      try {
        setInventoryAllocationLoading(true);
        const allocationsResponse = await inventoryAllocationAPI.getAllByWedding(id);
        if (allocationsResponse && allocationsResponse.success && allocationsResponse.data) {
          setInventoryAllocations(allocationsResponse.data || []);
        } else if (allocationsResponse && allocationsResponse.data) {
          setInventoryAllocations(allocationsResponse.data || []);
        } else {
          setInventoryAllocations([]);
        }
      } catch (e) {
        console.error('Error fetching inventory allocations:', e);
        setInventoryAllocations([]);
      }
      
      // Fetch available inventory items
      try {
        const itemsResponse = await inventoryAPI.getAll({});
        if (itemsResponse && itemsResponse.success && itemsResponse.data) {
          setAvailableInventoryItems(itemsResponse.data || []);
        } else if (itemsResponse && itemsResponse.data) {
          setAvailableInventoryItems(itemsResponse.data || []);
        } else {
          setAvailableInventoryItems([]);
        }
      } catch (e) {
        console.error('Error fetching inventory items:', e);
        setAvailableInventoryItems([]);
      } finally {
        setInventoryAllocationLoading(false);
      }
    };
    
    loadInventoryData();
  }, [id]);

  // Initialize edit wedding form when dialog opens
  useEffect(() => {
    if (editWeddingOpen && wedding) {
      const weddingDate = wedding.weddingDate || wedding.wedding_date;
      const dateStr = dateToInputValue(weddingDate);
      setEditWeddingForm({
        wedding_date: dateStr,
        wedding_time: wedding.weddingTime || wedding.wedding_time || '',
        venue: wedding.venue || '',
        guest_count: (wedding.guestCount || wedding.guest_count || 0).toString(),
        equipment_rental_cost: (wedding.equipmentRentalCost || wedding.equipment_rental_cost || wedding.totalCost || wedding.total_cost || 0).toString(),
        food_cost: (wedding.foodCost || wedding.food_cost || wedding.productionCost || wedding.production_cost || 0).toString(),
        total_cost: (wedding.equipmentRentalCost || wedding.equipment_rental_cost || wedding.totalCost || wedding.total_cost || 0).toString(),
        production_cost: (wedding.foodCost || wedding.food_cost || wedding.productionCost || wedding.production_cost || 0).toString(),
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

  // Helper function to add table by category with default capacity
  const addTableByCategory = async (category: string, defaultCapacity: number) => {
    await addGuestTable(defaultCapacity, category);
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
        // guest_count, total_cost, and production_cost are derived fields - not sent in update
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
          const dateStr = dateToInputValue(weddingDate);
          setEditWeddingForm({
            wedding_date: dateStr,
            wedding_time: weddingData.weddingTime || weddingData.wedding_time || '',
            venue: weddingData.venue || '',
            guest_count: (weddingData.guestCount || weddingData.guest_count || 0).toString(),
            equipment_rental_cost: (weddingData.equipmentRentalCost || weddingData.equipment_rental_cost || weddingData.totalCost || weddingData.total_cost || 0).toString(),
            food_cost: (weddingData.foodCost || weddingData.food_cost || weddingData.productionCost || weddingData.production_cost || 0).toString(),
            total_cost: (weddingData.equipmentRentalCost || weddingData.equipment_rental_cost || weddingData.totalCost || weddingData.total_cost || 0).toString(),
            production_cost: (weddingData.foodCost || weddingData.food_cost || weddingData.productionCost || weddingData.production_cost || 0).toString(),
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
    // Removed validation requiring at least one restriction - will auto-assign "None" if empty
    
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
      // Auto-assign "None" if no restrictions selected
      const finalRestrictionIds = ensureNoneRestriction(guestRestrictionIds, noneRestrictionId);
      
      // Create guest via API
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const response = await guestsAPI.create({
        guest_name: fullName,
        wedding_id: parseInt(id || '1'),
        rsvp_status: rsvpStatus,
        restriction_ids: finalRestrictionIds // Send array of restriction IDs (will include "None" if empty)
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
    setEditGuestRsvpStatus(guest.rsvpStatus || guest.rsvp_status || 'pending');
    const restrictionIds = (guest.dietaryRestrictions || []).map((r: any) => r.restriction_id || r.id).filter(Boolean);
    // Filter out "None" from edit form display (user can still leave empty, it will auto-assign "None")
    const displayableIds = noneRestrictionId ? restrictionIds.filter(id => id !== noneRestrictionId) : restrictionIds;
    setEditGuestRestrictionIds(displayableIds);
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
      // Auto-assign "None" if no restrictions selected
      const finalRestrictionIds = ensureNoneRestriction(editGuestRestrictionIds, noneRestrictionId);
      
      const fullName = `${editGuestFirstName.trim()} ${editGuestLastName.trim()}`;
      await guestsAPI.update(editingGuest.id, {
        guest_name: fullName,
        rsvp_status: editGuestRsvpStatus,
        restriction_ids: finalRestrictionIds
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
    const validCapacities = [2, 6, 8, 10];
    if (!tableCapacity || isNaN(capacity) || !validCapacities.includes(capacity)) {
      newErrors.tableCapacity = 'Capacity must be 2, 6, 8, or 10 seats (matching available inventory)';
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
      
      // Refresh inventory allocations to show the auto-created table allocation
      try {
        const allocationsResponse = await inventoryAllocationAPI.getAllByWedding(id);
        if (allocationsResponse && allocationsResponse.success && allocationsResponse.data) {
          setInventoryAllocations(allocationsResponse.data || []);
        } else if (allocationsResponse && allocationsResponse.data) {
          setInventoryAllocations(allocationsResponse.data || []);
        }
        
        // Refresh wedding data to update costs
        const weddingResponse = await weddingsAPI.getById(id);
        if (weddingResponse && weddingResponse.success && weddingResponse.data) {
          setWedding(weddingResponse.data);
        }
      } catch (allocError) {
        console.error('Error refreshing inventory allocations:', allocError);
      }
      
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
    // For couple tables, always count the 2 partners as assigned (they're automatically seated)
    const isCoupleTable = (table.category || table.table_category || '').toLowerCase() === 'couple';
    const partnerCount = isCoupleTable ? 2 : 0; // Couple tables always have 2 partners seated
    const guestsStayingOnTable = guests.filter(g => {
      const gId = g.id || g.guest_id;
      return g.table_id === tableId && gId !== guestId;
    }).length;
    const totalAfterAssignment = guestsStayingOnTable + partnerCount + 1; // +1 for the guest being assigned
    const capacity = table.capacity || 0;
    const available = capacity - guestsStayingOnTable - partnerCount;
    
    // Block assignment if it would exceed capacity
    if (totalAfterAssignment > capacity) {
      toast({
        title: 'Error',
        description: `Cannot assign guest: Table ${table.tableNumber || table.table_number} capacity would be exceeded (${capacity} max, ${totalAfterAssignment} after assignment${isCoupleTable ? ' including the couple' : ''})`,
        variant: 'destructive',
      });
      return;
    }
    
    if (available < 1) {
      toast({
        title: 'Error',
        description: `Table ${table.tableNumber || table.table_number} is full${isCoupleTable ? ' (couple already seated)' : ''}. No available seats.`,
        variant: 'destructive',
      });
      return;
    }
    
    setAllocationLoading(true);
    
    try {
      // Use backend API to assign guest - ensure guestId is a number
      const numericGuestId = Number(guestId);
      if (isNaN(numericGuestId)) {
        toast({
          title: 'Error',
          description: 'Invalid guest ID',
          variant: 'destructive',
        });
        return;
      }
      await tablesAPI.assignGuests(id, Number(tableId), [numericGuestId]);
      
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
      const guest = guests.find(g => (g.id || g.guest_id) === guestId);
      if (!guest) {
        console.warn('Guest not found for ID:', guestId);
        return;
      }
      
      const guestTableId = guest.table_id;
      if (!guestTableId) {
        // Unassigned guest - add to assign list
        guestsToAssign.push(guestId);
      } else if (guestTableId === tableId) {
        // Already assigned to this table - skip
        return;
      } else {
        // Assigned to different table - will need to reassign
        guestsToReassign.push({guestId, oldTableId: guestTableId});
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
    // For couple tables, always count the 2 partners as assigned (they're automatically seated)
    const isCoupleTable = (table.category || table.table_category || '').toLowerCase() === 'couple';
    const partnerCount = isCoupleTable ? 2 : 0; // Couple tables always have 2 partners seated
    
    const guestsStayingOnTable = guests.filter(g => {
      const gTableId = g.table_id;
      const gId = g.id || g.guest_id;
      return gTableId === tableId && !guestsToAssign.includes(gId);
    }).length;
    
    const newAssignments = guestsToAssign.length;
    const totalAfterAssignment = guestsStayingOnTable + partnerCount + newAssignments;
    const capacity = table.capacity || 0;
    const available = capacity - guestsStayingOnTable - partnerCount;
    
    // Block assignment if it would exceed capacity
    if (totalAfterAssignment > capacity) {
      toast({
        title: 'Error',
        description: `Cannot assign ${newAssignments} guest(s): Table ${table.tableNumber || table.table_number} capacity would be exceeded (${capacity} max, ${totalAfterAssignment} after assignment${isCoupleTable ? ' including the couple' : ''})`,
        variant: 'destructive',
      });
      return;
    }
    
    if (newAssignments > available) {
      toast({
        title: 'Error',
        description: `Table ${table.tableNumber || table.table_number} only has ${available} available seat(s)${isCoupleTable ? ' (couple already seated)' : ''}, but ${newAssignments} guest(s) selected`,
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

  // Helper to get unseated accepted guests (for RSVP warning)
  const getUnseatedAcceptedGuests = () => {
    return guests.filter(g => 
      (g.rsvpStatus === 'accepted' || g.rsvp_status === 'accepted') && 
      !g.table_id
    );
  };

  // Helper to get table packages (can have multiple)
  const getTablePackages = (tableId: number) => {
    return tablePackageAssignments.filter(a => (a.tableId || a.table_id) === tableId);
  };
  
  // Helper to get single table package (for backward compatibility)
  const getTablePackage = (tableId: number) => {
    const packages = getTablePackages(tableId);
    return packages.length > 0 ? packages[0] : null;
  };

  // Helper to get all restrictions for a table (aggregate from all guests at that table + couple preferences for couple tables)
  const getTableRestrictions = (tableId: number) => {
    const table = tables.find(t => (t.id || t.table_id) === tableId);
    const tableCategory = table?.category || table?.table_category || '';
    const isCoupleTable = tableCategory.toLowerCase() === 'couple';
    
    const restrictionSet = new Set<number>();
    const restrictions: any[] = [];
    
    // For couple tables, get restrictions from couple preferences
    if (isCoupleTable && coupleData && coupleData.preferences) {
      coupleData.preferences.forEach((pref: any) => {
        if (pref.dietaryRestrictions && Array.isArray(pref.dietaryRestrictions)) {
          pref.dietaryRestrictions.forEach((r: any) => {
            if (r && r.restriction_name && r.restriction_name !== 'None') {
              const restrictionId = r.restriction_id || r.id;
              if (restrictionId && !restrictionSet.has(restrictionId)) {
                restrictionSet.add(restrictionId);
                restrictions.push(r);
              }
            }
          });
        }
      });
    }
    
    // Get restrictions from all guests seated at the table
    const tableGuests = guests.filter(g => g.table_id === tableId);
    tableGuests.forEach(guest => {
      if (guest.dietaryRestrictions && Array.isArray(guest.dietaryRestrictions)) {
        guest.dietaryRestrictions.forEach((r: any) => {
          if (r && r.restriction_name && r.restriction_name !== 'None') {
            const restrictionId = r.restriction_id || r.id;
            if (restrictionId && !restrictionSet.has(restrictionId)) {
              restrictionSet.add(restrictionId);
              restrictions.push(r);
            }
          }
        });
      }
    });
    
    return restrictions;
  };

  // Helper to check if a package is compatible with table restrictions
  const checkPackageCompatibility = (packageId: number, tableId: number) => {
    const tableRestrictions = getTableRestrictions(tableId);
    const tableRestrictionIds = new Set(tableRestrictions.map(r => r.restriction_id || r.id));
    
    // Find the package
    const pkg = packages.find(p => (p.package_id || p.id) === packageId);
    if (!pkg) return { compatible: true, conflicts: [] };
    
    // Get menu items in the package
    const packageMenuItems = pkg.menu_items || [];
    const conflicts: any[] = [];
    
    // Get table and guests for this table
    const table = tables.find(t => (t.id || t.table_id) === tableId);
    const tableCategory = table?.category || table?.table_category || '';
    const isCoupleTable = tableCategory.toLowerCase() === 'couple';
    const assignedGuests = guests.filter(g => g && g.table_id === tableId);
    
    // Get couple data if it's a couple table
    const partner1Name = wedding?.partner1 || wedding?.partner1_name || '';
    const partner2Name = wedding?.partner2 || wedding?.partner2_name || '';
    
    // Check each menu item in the package
    packageMenuItems.forEach((menuItem: any) => {
      // Get menu item restrictions (from menu_item_restrictions junction table)
      const menuItemRestrictions = menuItem.restrictions || [];
      
      // Check if any menu item restriction conflicts with table restrictions
      menuItemRestrictions.forEach((menuRestriction: any) => {
        const restrictionId = menuRestriction.restriction_id || menuRestriction.id;
        if (tableRestrictionIds.has(restrictionId)) {
          const conflictRestriction = tableRestrictions.find(r => 
            (r.restriction_id || r.id) === restrictionId
          );
          
          if (conflictRestriction && !conflicts.find(c => c.restriction_id === restrictionId)) {
            // Find which guests/couples have this restriction
            const affectedGuests: string[] = [];
            const affectedCouples: string[] = [];
            
            // Check assigned guests
            assignedGuests.forEach((guest: any) => {
              const guestRestrictions = guest.dietaryRestrictions || [];
              const hasRestriction = guestRestrictions.some((gr: any) => 
                (gr.restriction_id || gr.id) === restrictionId
              );
              if (hasRestriction) {
                const guestName = (guest.firstName || guest.name?.split(' ')[0] || '') + ' ' + 
                                 (guest.lastName || guest.name?.split(' ').slice(1).join(' ') || '');
                affectedGuests.push(guestName.trim());
              }
            });
            
            // Check couple preferences if it's a couple table
            if (isCoupleTable && coupleData && coupleData.preferences) {
              coupleData.preferences.forEach((pref: any) => {
                if (pref.dietaryRestrictions && Array.isArray(pref.dietaryRestrictions)) {
                  const hasRestriction = pref.dietaryRestrictions.some((r: any) => 
                    (r.restriction_id || r.id) === restrictionId
                  );
                  if (hasRestriction) {
                    if (partner1Name && !affectedCouples.includes(partner1Name)) {
                      affectedCouples.push(partner1Name);
                    }
                    if (partner2Name && !affectedCouples.includes(partner2Name)) {
                      affectedCouples.push(partner2Name);
                    }
                  }
                }
              });
            }
            
            conflicts.push({
              restriction_id: restrictionId,
              restriction_name: conflictRestriction.restriction_name || conflictRestriction.name,
              menu_item: menuItem.menu_name || menuItem.name,
              affected_guests: affectedGuests,
              affected_couples: affectedCouples
            });
          }
        }
      });
    });
    
    return {
      compatible: conflicts.length === 0,
      conflicts
    };
  };

  // Helper to get recommended packages for a table (compatible packages)
  const getRecommendedPackages = (tableId: number) => {
    const tableRestrictions = getTableRestrictions(tableId);
    const recommended: Array<{ pkg: any; compatibility: any }> = [];
    
    packages.forEach(pkg => {
      const compatibility = checkPackageCompatibility(pkg.package_id || pkg.id, tableId);
      if (compatibility.compatible) {
        recommended.push({ pkg, compatibility });
      }
    });
    
    // Sort by package name
    return recommended.sort((a, b) => {
      const nameA = a.pkg.package_name || a.pkg.packageName || '';
      const nameB = b.pkg.package_name || b.pkg.packageName || '';
      return nameA.localeCompare(nameB);
    });
  };

  // Inventory allocation handlers
  const handleAddAllocation = async () => {
    setAllocationFormErrors({});
    
    if (!allocationFormData.inventory_id) {
      setAllocationFormErrors({ inventory_id: 'Inventory item is required' });
      return;
    }
    if (!allocationFormData.quantity_used || parseInt(allocationFormData.quantity_used) <= 0) {
      setAllocationFormErrors({ quantity_used: 'Valid quantity is required' });
      return;
    }
    
    const selectedItem = availableInventoryItems.find(item => 
      item.inventory_id?.toString() === allocationFormData.inventory_id
    );
    
    if (!selectedItem) {
      setAllocationFormErrors({ inventory_id: 'Selected inventory item not found' });
      return;
    }
    
    const quantity = parseInt(allocationFormData.quantity_used);
    // Check stock availability - consider already allocated quantity for this item
    const existingAllocation = inventoryAllocations.find(a => a.inventory_id === selectedItem.inventory_id);
    const alreadyAllocated = existingAllocation ? (existingAllocation.quantity_used || 0) : 0;
    const availableStock = selectedItem.quantity_available + alreadyAllocated; // Add back what's already allocated
    
    if (quantity > availableStock) {
      setAllocationFormErrors({ 
        quantity_used: `Quantity exceeds available stock (${availableStock} available, ${alreadyAllocated} already allocated)` 
      });
      return;
    }
    
    setAllocationFormLoading(true);
    try {
      const rentalCostValue = allocationFormData.unit_rental_cost || allocationFormData.rental_cost
        ? parseFloat(allocationFormData.unit_rental_cost || allocationFormData.rental_cost) 
        : (selectedItem.unit_rental_cost || selectedItem.rental_cost);
      
      // Ensure rental_cost is a valid number
      const rentalCost = (rentalCostValue && !isNaN(rentalCostValue)) 
        ? rentalCostValue 
        : (selectedItem.unit_rental_cost || selectedItem.rental_cost || 0);
      
      await inventoryAllocationAPI.create({
        wedding_id: parseInt(id || '0'),
        inventory_id: parseInt(allocationFormData.inventory_id),
        quantity_used: quantity,
        unit_rental_cost: rentalCost,
        rental_cost: rentalCost // Keep for backward compatibility
      });
      
      toast({ title: 'Success', description: 'Inventory allocated successfully' });
      setAddAllocationOpen(false);
      setAllocationFormData({ inventory_id: '', quantity_used: '', unit_rental_cost: '', rental_cost: '' });
      
      // Refresh allocations
      const allocationsResponse = await inventoryAllocationAPI.getAllByWedding(id || '0');
      if (allocationsResponse && allocationsResponse.success && allocationsResponse.data) {
        setInventoryAllocations(allocationsResponse.data || []);
      }
      
      // Refresh wedding data to update costs
      const weddingResponse = await weddingsAPI.getById(id || '0');
      if (weddingResponse && weddingResponse.success && weddingResponse.data) {
        setWedding(weddingResponse.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to allocate inventory',
        variant: 'destructive',
      });
    } finally {
      setAllocationFormLoading(false);
    }
  };

  const handleEditAllocation = (allocation: any) => {
    setSelectedAllocation(allocation);
    setAllocationFormData({
      inventory_id: allocation.inventory_id?.toString() || '',
      quantity_used: allocation.quantity_used?.toString() || '',
      unit_rental_cost: (allocation.unit_rental_cost || allocation.rental_cost)?.toString() || '',
      rental_cost: allocation.rental_cost?.toString() || ''
    });
    setAllocationFormErrors({});
    setEditAllocationOpen(true);
  };

  const handleSaveEditAllocation = async () => {
    if (!selectedAllocation) return;
    
    setAllocationFormErrors({});
    
    if (!allocationFormData.quantity_used || parseInt(allocationFormData.quantity_used) <= 0) {
      setAllocationFormErrors({ quantity_used: 'Valid quantity is required' });
      return;
    }
    
    const selectedItem = availableInventoryItems.find(item => 
      item.inventory_id?.toString() === selectedAllocation.inventory_id?.toString()
    );
    
    if (selectedItem) {
      const quantity = parseInt(allocationFormData.quantity_used);
      const currentQuantity = selectedAllocation.quantity_used || 0;
      const effectiveAvailable = selectedItem.quantity_available + currentQuantity;
      
      if (quantity > effectiveAvailable) {
        setAllocationFormErrors({ 
          quantity_used: `Quantity exceeds available (${effectiveAvailable})` 
        });
        return;
      }
    }
    
    setAllocationFormLoading(true);
    try {
      const updateData: any = {};
      if (allocationFormData.quantity_used) {
        updateData.quantity_used = parseInt(allocationFormData.quantity_used);
      }
      if (allocationFormData.unit_rental_cost || allocationFormData.rental_cost) {
        const cost = parseFloat(allocationFormData.unit_rental_cost || allocationFormData.rental_cost);
        updateData.unit_rental_cost = cost;
        updateData.rental_cost = cost; // Keep for backward compatibility
      }
      
      await inventoryAllocationAPI.update(selectedAllocation.allocation_id, updateData);
      
      toast({ title: 'Success', description: 'Inventory allocation updated successfully' });
      setEditAllocationOpen(false);
      setSelectedAllocation(null);
      setAllocationFormData({ inventory_id: '', quantity_used: '', unit_rental_cost: '', rental_cost: '' });
      
      // Refresh allocations
      const allocationsResponse = await inventoryAllocationAPI.getAllByWedding(id || '0');
      if (allocationsResponse && allocationsResponse.success && allocationsResponse.data) {
        setInventoryAllocations(allocationsResponse.data || []);
      }
      
      // Refresh wedding data to update costs
      const weddingResponse = await weddingsAPI.getById(id || '0');
      if (weddingResponse && weddingResponse.success && weddingResponse.data) {
        setWedding(weddingResponse.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update allocation',
        variant: 'destructive',
      });
    } finally {
      setAllocationFormLoading(false);
    }
  };

  const handleDeleteAllocation = async () => {
    if (!selectedAllocation || !id) return;
    
    setAllocationFormLoading(true);
    try {
      await inventoryAllocationAPI.delete(selectedAllocation.allocation_id);
      toast({ title: 'Success', description: 'Inventory allocation deleted successfully' });
      setDeleteAllocationOpen(false);
      setSelectedAllocation(null);
      
      // Refresh allocations
      const allocationsResponse = await inventoryAllocationAPI.getAllByWedding(id);
      if (allocationsResponse && allocationsResponse.success && allocationsResponse.data) {
        setInventoryAllocations(allocationsResponse.data || []);
      }
      
      // Refresh wedding data to update costs
      const weddingResponse = await weddingsAPI.getById(id || '0');
      if (weddingResponse && weddingResponse.success && weddingResponse.data) {
        setWedding(weddingResponse.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete allocation',
        variant: 'destructive',
      });
    } finally {
      setAllocationFormLoading(false);
    }
  };

  // Edit table state
  const [editTableOpen, setEditTableOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [editTableCapacity, setEditTableCapacity] = useState('');
  const [editTableLoading, setEditTableLoading] = useState(false);
  
  // Table positions for seating layout (drag and drop) - saved per wedding
  const [tablePositions, setTablePositions] = useState<Record<number, { x: number; y: number }>>({});
  const [draggedTableId, setDraggedTableId] = useState<number | null>(null);
  
  // Load saved table positions for this wedding
  useEffect(() => {
    if (id) {
      const savedPositions = localStorage.getItem(`wedding_${id}_table_positions`);
      if (savedPositions) {
        try {
          const positions = JSON.parse(savedPositions);
          setTablePositions(positions);
        } catch (e) {
          console.error('Error loading saved table positions:', e);
        }
      }
    }
  }, [id]);
  
  // Save table positions when they change
  useEffect(() => {
    if (id && Object.keys(tablePositions).length > 0) {
      localStorage.setItem(`wedding_${id}_table_positions`, JSON.stringify(tablePositions));
    }
  }, [tablePositions, id]);

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
      
      // Refresh inventory allocations after table update
      try {
        const allocationsResponse = await inventoryAllocationAPI.getAllByWedding(id);
        if (allocationsResponse && allocationsResponse.success && allocationsResponse.data) {
          setInventoryAllocations(allocationsResponse.data || []);
        } else if (allocationsResponse && allocationsResponse.data) {
          setInventoryAllocations(allocationsResponse.data || []);
        }
        
        // Refresh wedding data to update costs
        const weddingResponse = await weddingsAPI.getById(id);
        if (weddingResponse && weddingResponse.success && weddingResponse.data) {
          setWedding(weddingResponse.data);
        }
      } catch (allocError) {
        console.error('Error refreshing inventory allocations:', allocError);
      }
      
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
      
      // Refresh inventory allocations after table deletion
      try {
        const allocationsResponse = await inventoryAllocationAPI.getAllByWedding(id);
        if (allocationsResponse && allocationsResponse.success && allocationsResponse.data) {
          setInventoryAllocations(allocationsResponse.data || []);
        } else if (allocationsResponse && allocationsResponse.data) {
          setInventoryAllocations(allocationsResponse.data || []);
        }
        
        // Refresh wedding data to update costs
        const weddingResponse = await weddingsAPI.getById(id);
        if (weddingResponse && weddingResponse.success && weddingResponse.data) {
          setWedding(weddingResponse.data);
        }
      } catch (allocError) {
        console.error('Error refreshing inventory allocations:', allocError);
      }
      
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
  const handleAssignPackage = async (tableIdParam?: number, packageIdParam?: number) => {
    const tableId = tableIdParam || (packageAssignTableId ? parseInt(packageAssignTableId) : null);
    const packageId = packageIdParam || (packageAssignPackageId ? parseInt(packageAssignPackageId) : null);
    
    if (!tableId || !packageId) {
      toast({
        title: 'Validation Error',
        description: 'Please select both a table and a package',
        variant: 'destructive',
      });
      return;
    }
    
    // Check for compatibility issues
    const compatibility = checkPackageCompatibility(packageId, tableId);
    
    if (!compatibility.compatible && compatibility.conflicts.length > 0) {
      const conflictMessages = compatibility.conflicts.map(c => {
        let msg = `${c.menu_item} conflicts with ${c.restriction_name}`;
        const affected: string[] = [];
        if (c.affected_guests && c.affected_guests.length > 0) {
          affected.push(`Guests: ${c.affected_guests.join(', ')}`);
        }
        if (c.affected_couples && c.affected_couples.length > 0) {
          affected.push(`Couple: ${c.affected_couples.join(' & ')}`);
        }
        if (affected.length > 0) {
          msg += ` (${affected.join('; ')})`;
        }
        return msg;
      }).join('\n');
      
      const confirmMsg = `Warning: This package contains items that conflict with table restrictions:\n\n${conflictMessages}\n\nDo you still want to assign this package?`;
      if (!confirm(confirmMsg)) {
        return;
      }
    }
    
    setPackageFormLoading(true);
    
    try {
      // Use actual API endpoint - find table and package with proper ID matching
      const table = tables.find(t => {
        const tId = t.id || t.table_id;
        return tId && (tId === tableId || tId.toString() === tableId.toString());
      });
      const pkg = availablePackages.find(p => {
        const pId = p.package_id || p.id;
        return pId && (pId === packageId || pId.toString() === packageId.toString());
      });
      
      if (!table) {
        toast({
          title: 'Error',
          description: `Table with ID ${tableId} not found. Please refresh the page.`,
          variant: 'destructive',
        });
        return;
      }
      
      if (!pkg) {
        toast({
          title: 'Error',
          description: `Package with ID ${packageId} not found. Please refresh the page.`,
          variant: 'destructive',
        });
        return;
      }
      
      // Check if assignment already exists
      const existing = tablePackageAssignments.find(
        a => (a.tableId || a.table_id) === tableId && (a.packageId || a.package_id) === packageId
      );
      
      if (existing) {
        toast({
          title: 'Error',
          description: 'This package is already assigned to this table',
          variant: 'destructive',
        });
        return;
      }
      
      // Call API to assign package
      await packagesAPI.assignToTable({
        wedding_id: parseInt(id || '0'),
        table_id: tableId,
        package_id: packageId
      });
      
      // Refresh assignments - always fetch from API to ensure consistency
      const assignmentsResponse = await packagesAPI.getTableAssignments(id || '0');
      if (assignmentsResponse && (assignmentsResponse.success || assignmentsResponse.data)) {
        const assignmentsData = assignmentsResponse.data || [];
        // Ensure all assignment data is properly formatted
        const formattedAssignments = Array.isArray(assignmentsData) ? assignmentsData.map((a: any) => ({
          ...a,
          id: a.id || a.assignment_id || a.table_package_id,
          tableId: a.tableId || a.table_id,
          packageId: a.packageId || a.package_id,
          tableNumber: a.tableNumber || a.table_number,
          packageName: a.packageName || a.package_name,
          packageType: a.packageType || a.package_type
        })) : [];
        setTablePackageAssignments(formattedAssignments);
      } else {
        // Fallback: add to local state
        const newAssignment = {
          id: Date.now(),
          tableId: tableId,
          table_id: tableId,
          tableNumber: table?.tableNumber || table?.table_number || '',
          packageId: packageId,
          package_id: packageId,
          packageName: pkg?.package_name || pkg?.packageName || '',
          packageType: pkg?.package_type || pkg?.packageType || '',
          weddingId: parseInt(id || '1')
        };
        setTablePackageAssignments([...tablePackageAssignments, newAssignment]);
      }
      
      // Refresh wedding data to update costs
      try {
        const weddingResponse = await weddingsAPI.getById(id || '0');
        if (weddingResponse && weddingResponse.success && weddingResponse.data) {
          setWedding(weddingResponse.data);
        }
      } catch (weddingError) {
        console.error('Error refreshing wedding data:', weddingError);
      }
      
      // Reset form
      setPackageAssignTableId('');
      setPackageAssignPackageId('');
      
      toast({
        title: 'Package Assigned',
        description: `${pkg?.package_name || pkg?.packageName || 'Package'} assigned to ${table?.tableNumber || table?.table_number || 'table'}${!compatibility.compatible ? ' (with restrictions)' : ''}`,
        variant: !compatibility.compatible ? 'default' : 'default',
      });
    } catch (error: any) {
      console.error('Error assigning package:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || error.message || 'Failed to assign package. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPackageFormLoading(false);
    }
  };
  
  // Handle remove package assignment (for dialog)
  const handleRemovePackageAssignment = async () => {
    if (!selectedPackageAssignment || !id) return;
    
    setPackageFormLoading(true);
    try {
      const tableId = selectedPackageAssignment.tableId || selectedPackageAssignment.table_id;
      const packageId = selectedPackageAssignment.packageId || selectedPackageAssignment.package_id;
      
      await packagesAPI.removeFromTable(tableId, packageId);
      
      // Refresh assignments
      const assignmentsResponse = await packagesAPI.getTableAssignments(id);
      if (assignmentsResponse && (assignmentsResponse.success || assignmentsResponse.data)) {
        const assignmentsData = assignmentsResponse.data || [];
        const formattedAssignments = Array.isArray(assignmentsData) ? assignmentsData.map((a: any) => ({
          ...a,
          id: a.id || a.assignment_id || a.table_package_id,
          tableId: a.tableId || a.table_id,
          packageId: a.packageId || a.package_id,
          tableNumber: a.tableNumber || a.table_number,
          packageName: a.packageName || a.package_name,
          packageType: a.packageType || a.package_type
        })) : [];
        setTablePackageAssignments(formattedAssignments);
      }
      
      // Refresh wedding data to update costs
      try {
        const weddingResponse = await weddingsAPI.getById(id);
        if (weddingResponse && weddingResponse.success && weddingResponse.data) {
          setWedding(weddingResponse.data);
        }
      } catch (weddingError) {
        console.error('Error refreshing wedding data:', weddingError);
      }
      
      setDeletePackageAssignmentOpen(false);
      setSelectedPackageAssignment(null);
      
      toast({
        title: 'Package Removed',
        description: 'Package has been removed from the table',
      });
    } catch (error: any) {
      console.error('Error removing package assignment:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || error.message || 'Failed to remove package assignment',
        variant: 'destructive',
      });
    } finally {
      setPackageFormLoading(false);
    }
  };
  
  // Helper functions - defined before early returns
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      'Furniture': Package,
      'Linens': Package,
      'Lighting': Package,
      'Audio/Visual': Package,
      'Decorations': Package
    };
    return iconMap[category] || Warehouse;
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'Furniture': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700',
      'Linens': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700',
      'Lighting': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
      'Audio/Visual': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700',
      'Decorations': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
    };
    const Icon = getCategoryIcon(category);
    return (
      <Badge className={`${colors[category] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'} border flex items-center gap-1`}>
        <Icon className="w-3 h-3 dark:text-gray-300" />
        {category}
      </Badge>
    );
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'Excellent':
        return <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 border flex items-center gap-1"><CheckCircle className="w-3 h-3 dark:text-green-300" />Excellent</Badge>;
      case 'Good':
        return <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700 border flex items-center gap-1"><Clock className="w-3 h-3 dark:text-blue-300" />Good</Badge>;
      case 'Fair':
        return <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700 border flex items-center gap-1"><AlertTriangle className="w-3 h-3 dark:text-yellow-300" />Fair</Badge>;
      case 'Poor':
        return <Badge variant="destructive" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700 border flex items-center gap-1"><AlertTriangle className="w-3 h-3 dark:text-red-300" />Poor</Badge>;
      default:
        return <Badge variant="outline">{condition || 'Unknown'}</Badge>;
    }
  };

  const getRsvpStatusBadge = (status: string | undefined | null) => {
    if (!status) return <Badge variant="secondary" className="flex items-center gap-1 w-fit dark:bg-gray-800 dark:text-gray-200"><Clock className="w-3 h-3 dark:text-gray-300" />Pending</Badge>;
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'confirmed':
        return <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 border flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3 dark:text-green-300" />Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700 border flex items-center gap-1 w-fit"><X className="w-3 h-3 dark:text-red-300" />Declined</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700 border flex items-center gap-1 w-fit"><Clock className="w-3 h-3 dark:text-yellow-300" />Pending</Badge>;
      default:
        return <Badge variant="secondary" className="flex items-center gap-1 w-fit dark:bg-gray-800 dark:text-gray-200"><Clock className="w-3 h-3 dark:text-gray-300" />{status}</Badge>;
    }
  };
  
  // Use TableCategoryBadge utility instead - keeping for backward compatibility
  const getTableCategoryBadge = (category: string | undefined | null) => {
    if (!category) return <TableCategoryBadge category="General" />;
    return <TableCategoryBadge category={category} />;
  };
  
  const getTableCategoryBadgeOld = (category: string | undefined | null) => {
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
    if (!status) return <Badge variant="outline" className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">Unknown</Badge>;
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 border"><CheckCircle className="w-3 h-3 mr-1 dark:text-green-300" />Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700 border"><Clock className="w-3 h-3 mr-1 dark:text-yellow-300" />Pending</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700 border">Partial</Badge>;
      default:
        return <Badge variant="outline" className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">{status}</Badge>;
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
        case 'id':
          aVal = a.guest_id || a.id || 0;
          bVal = b.guest_id || b.id || 0;
          break;
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
  
  // Ensure current page doesn't exceed total pages (in case filters changed)
  useEffect(() => {
    if (totalPages > 0 && guestCurrentPage > totalPages) {
      setGuestCurrentPage(1);
    }
  }, [totalPages, guestCurrentPage]);
  
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
              <p className="text-xs text-muted-foreground">{safeFormatTime(wedding?.weddingTime || wedding?.wedding_time)}</p>
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
                Total: {formatCurrency((wedding?.equipmentRentalCost || wedding?.equipment_rental_cost || wedding?.totalCost || wedding?.total_cost || 0) as number)}
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
            <TabsTrigger value="inventory-allocation" className="gap-2">
              <Warehouse className="h-4 w-4" />
              Inventory Allocation
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
                    <MultiSelectRestrictions
                      restrictions={dietaryRestrictions}
                      selectedIds={guestRestrictionIds}
                      onSelectionChange={setGuestRestrictionIds}
                      disabled={guestFormLoading}
                      error={guestFormErrors.dietaryRestriction}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rsvpStatus">RSVP Status *</Label>
                    <Select value={rsvpStatus} onValueChange={setRsvpStatus} disabled={guestFormLoading}>
                      <SelectTrigger id="rsvpStatus">
                        <SelectValue placeholder="Select RSVP status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending" className="dark:focus:bg-[#2a2a2a] dark:focus:text-[#f5f5f5] dark:text-[#e5e5e5]">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <span>Pending</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="accepted" className="dark:focus:bg-[#2a2a2a] dark:focus:text-[#f5f5f5] dark:text-[#e5e5e5]">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span>Accepted</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="declined" className="dark:focus:bg-[#2a2a2a] dark:focus:text-[#f5f5f5] dark:text-[#e5e5e5]">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span>Declined</span>
                          </div>
                        </SelectItem>
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
                    <CardTitle>Guest Directory</CardTitle>
                    <CardDescription>All guests for this wedding ({filteredAndSortedGuests.length} {filteredAndSortedGuests.length === 1 ? 'guest' : 'guests'})</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="mb-4 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search guests..."
                        value={guestFilterName}
                        onChange={(e) => {
                          setGuestFilterName(e.target.value);
                          setGuestCurrentPage(1);
                        }}
                        className="pl-8"
                      />
                    </div>
                    <Button variant="outline" onClick={() => setShowGuestFilters(s => !s)}>
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleClearGuestFilters}
                    >
                      Reset Filters
                    </Button>
                  </div>

                  {showGuestFilters && (
                    <div className="grid md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground">RSVP Status</label>
                        <Select value={guestFilterRsvp || "all"} onValueChange={(val) => {
                          setGuestFilterRsvp(val === "all" ? "" : val);
                          setGuestCurrentPage(1);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Dietary Restriction</label>
                        <Select value={guestFilterRestriction || "all"} onValueChange={(val) => {
                          setGuestFilterRestriction(val === "all" ? "" : val);
                          setGuestCurrentPage(1);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Restrictions" />
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
                      <div>
                        <label className="text-sm text-muted-foreground">Sort By</label>
                        <Select value={guestSortBy} onValueChange={(val: any) => {
                          setGuestSortBy(val);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="id">ID</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="rsvp">RSVP Status</SelectItem>
                            <SelectItem value="table">Table</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Order</label>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setGuestSortOrder(guestSortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
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
              {(() => {
                const validRestrictions = restrictions.filter((r: any) => (r.restriction_name || r.name || r) && (r.restriction_name || r.name || r) !== 'None');
                if (validRestrictions.length === 0) {
                  return <span className="text-muted-foreground">None</span>;
                }
                return (
                  <div className="flex items-center gap-1 flex-wrap">
                    {validRestrictions.slice(0, 2).map((r: any, idx: number) => {
                      const restrictionName = r.restriction_name || r.name || r;
                      const restrictionType = r.restriction_type || '';
                      const restrictionId = r.restriction_id || r.id;
                      return (
                        <Badge 
                          key={restrictionId || restrictionName || `restriction-${idx}`} 
                          variant="outline" 
                          className={`text-xs ${getTypeColor(restrictionType)} border flex items-center gap-1 w-fit`}
                        >
                          {(() => {
                            const Icon = getTypeIcon(restrictionType);
                            return <Icon className="h-4 w-4" />;
                          })()}
                          <span className="max-w-[120px] truncate" title={restrictionName}>
                            {restrictionName}
                          </span>
                        </Badge>
                      );
                    })}
                    {validRestrictions.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{validRestrictions.length - 2} more
                      </Badge>
                    )}
                  </div>
                );
              })()}
                            </TableCell>
                            <TableCell>{getRsvpStatusBadge(guest.rsvpStatus)}</TableCell>
                            <TableCell>
                              {assignedTable ? (
                                <Badge variant="outline" className="font-mono text-xs">{assignedTable}</Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">Not assigned</span>
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
                {/* Mandatory Couple Table CTA - Only show if no couple table exists */}
                      {(() => {
                        const coupleTables = tables.filter(t => {
                          const category = t?.table_category || t?.category;
                          return category === 'couple' || category === 'Couple';
                        });
                        return coupleTables.length === 0;
                      })() && (
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
                      {[
                        { value: 'couple', label: 'Couple', icon: getTableCategoryIcon('couple') },
                        { value: 'guest', label: 'Guest', icon: getTableCategoryIcon('guest') },
                        { value: 'family', label: 'Family', icon: getTableCategoryIcon('family') },
                        { value: 'VIP', label: 'VIP', icon: getTableCategoryIcon('VIP') },
                        { value: 'entourage', label: 'Entourage', icon: getTableCategoryIcon('entourage') },
                        { value: 'friends', label: 'Friends', icon: getTableCategoryIcon('friends') },
                        { value: 'kids', label: 'Kids', icon: getTableCategoryIcon('kids') },
                        { value: 'elderly', label: 'Elderly', icon: getTableCategoryIcon('elderly') },
                        { value: 'vendor', label: 'Vendor', icon: getTableCategoryIcon('vendor') },
                        { value: 'staff', label: 'Staff', icon: getTableCategoryIcon('staff') },
                        { value: 'reserved', label: 'Reserved', icon: getTableCategoryIcon('reserved') },
                        { value: 'special_needs', label: 'Special Needs', icon: getTableCategoryIcon('special_needs') },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <SelectItem key={item.value} value={item.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{item.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
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
                  
                  {/* Right side: Quick Add shortcuts - Compact Grid */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium block">Quick Add</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2">
                      {[
                        { category: 'VIP', capacity: 6, icon: getTableCategoryIcon('VIP'), label: 'VIP' },
                        { category: 'family', capacity: 8, icon: getTableCategoryIcon('family'), label: 'Family' },
                        { category: 'kids', capacity: 6, icon: getTableCategoryIcon('kids'), label: 'Kids' },
                        { category: 'elderly', capacity: 6, icon: getTableCategoryIcon('elderly'), label: 'Elderly' },
                        { category: 'friends', capacity: 10, icon: getTableCategoryIcon('friends'), label: 'Friends' },
                        { category: 'entourage', capacity: 8, icon: getTableCategoryIcon('entourage'), label: 'Entourage' },
                        { category: 'guest', capacity: 6, icon: getTableCategoryIcon('guest'), label: 'Guest' },
                        { category: 'guest', capacity: 10, icon: getTableCategoryIcon('guest'), label: 'Guest' },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isDisabled = tables.filter(t => (t?.table_category === 'couple') || (t?.category === 'couple')).length === 0;
                        // Match colors with seating layout - softer, better for dark mode
                        const categoryColors: Record<string, string> = {
                          'VIP': 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900',
                          'kids': 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-900',
                          'elderly': 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-900',
                          'family': 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 border-green-300 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900',
                          'entourage': 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-900',
                          'friends': 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800 hover:bg-cyan-200 dark:hover:bg-cyan-900',
                          'guest': 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900',
                        };
                        const colorClass = categoryColors[item.category] || 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700';
                        return (
                          <Button
                            key={`${item.category}-${item.capacity}`}
                            type="button"
                            variant="outline"
                            onClick={() => item.category === 'guest' ? addGuestTable(item.capacity) : addTableByCategory(item.category, item.capacity)}
                            disabled={isDisabled}
                            className={`h-auto py-1.5 px-2.5 justify-start ${colorClass} border`}
                          >
                            <Icon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                            <span className="text-xs font-medium">{item.label} (Capacity: {item.capacity})</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RSVP Warning Banner */}
            {(() => {
              const unseatedAccepted = getUnseatedAcceptedGuests();
              if (unseatedAccepted.length === 0) return null;
              return (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <div>
                          <p className="font-semibold text-amber-900 dark:text-amber-100">
                            Warning: {unseatedAccepted.length} accepted guest{unseatedAccepted.length !== 1 ? 's' : ''} have not been assigned to a table
                          </p>
                          <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                            These guests have accepted their RSVP but are not yet seated.
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-900"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const guestIds = unseatedAccepted.map(g => g.id || g.guest_id).filter(Boolean);
                          setSelectedGuestIds(guestIds);
                          setBulkAssignFilter('accepted');
                          setBulkAssignmentOpen(true);
                        }}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Bulk Assign Accepted Guests
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Tables Grid View */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Wedding Table Directory</CardTitle>
                    <CardDescription>
                      Tables ({tables.length}) - Manage table assignments and seating
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedGuestIds([]);
                      setBulkAssignFilter('all');
                      setBulkTableId('');
                      setBulkAssignmentOpen(true);
                    }}
                    disabled={getUnassignedGuests().length === 0 || tables.length === 0}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Bulk Assign Guests
                  </Button>
                </div>
              </CardHeader>
              <CardContent>

                {!tables || tables.length === 0 ? (
                  <div className="text-center space-y-2 py-8">
                    <p className="text-muted-foreground">No tables added yet</p>
                    <p className="text-sm text-amber-600 font-medium">
                      ⚠️ Warning: You need at least one table for guest seating. Please add a table to continue.
                    </p>
                  </div>
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
                    // For couple tables, always count the 2 partners as assigned
                    const isCoupleTableForCount = (table.category || table.table_category || '').toLowerCase() === 'couple';
                    const partnerCount = isCoupleTableForCount ? 2 : 0;
                    const assignedCount = assignedGuestsList.length + partnerCount;
                    const capacity = table.capacity || 0;
                    const available = Math.max(0, capacity - assignedCount);
                    const isFull = available <= 0 && capacity > 0;
                    const tablePackages = getTablePackages(table.id || table.table_id);
                    const tableCategory = table.category || table.table_category || '';
                    const categoryLower = tableCategory.toLowerCase();
                    const tableRestrictions = getTableRestrictions(table.id || table.table_id);
                  
                  return (
                    <Card key={table.id || table.table_id || `table-${table.tableNumber || table.table_number || 'unknown'}`} className="flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg">{table.tableNumber || table.table_number || 'Unknown'}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">Table ID: {table.table_id || table.id || 'N/A'}</p>
                            <div className="mt-2">
                              {getTableCategoryBadge(tableCategory)}
                            </div>
                          </div>
                          {/* Icon buttons in top-right corner - using dropdown menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedTableForView(table);
                                setViewTableOpen(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditTable(table)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Table
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTable(table.id || table.table_id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Table
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                        <div>
                          {categoryLower === 'couple' ? (
                            <>
                              {/* Seated Partners Section */}
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <Heart className="h-4 w-4 text-pink-500" />
                                  Seated Partners at this Table
                                </p>
                                {(() => {
                                  // Get partner names from wedding data (always show, even if not guests)
                                  const partner1Name = wedding?.partner1 || wedding?.partner1_name || '';
                                  const partner2Name = wedding?.partner2 || wedding?.partner2_name || '';
                                  
                                  // Find partners in assigned guests (if they exist as guests)
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
                                  
                                  // Get partner 1 and partner 2 restrictions if they exist as guests
                                  const partner1Restrictions = partner1?.dietaryRestrictions || [];
                                  const partner2Restrictions = partner2?.dietaryRestrictions || [];
                                  const partner1ValidRestrictions = Array.isArray(partner1Restrictions) 
                                    ? partner1Restrictions.filter((r: any) => r.restriction_name && r.restriction_name !== 'None')
                                    : [];
                                  const partner2ValidRestrictions = Array.isArray(partner2Restrictions) 
                                    ? partner2Restrictions.filter((r: any) => r.restriction_name && r.restriction_name !== 'None')
                                    : [];
                                  
                                  return (
                                    <div className="space-y-2">
                                      {/* Partner 1 - Always show */}
                                      <div className="text-sm p-2 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1 flex-wrap">
                                          <Heart className="h-3 w-3 text-pink-500 dark:text-pink-400 flex-shrink-0" />
                                          <span className="font-medium dark:text-blue-100">
                                            {partner1 ? (partner1.firstName || partner1.name?.split(' ')[0] || partner1Name) + ' ' + (partner1.lastName || partner1.name?.split(' ').slice(1).join(' ') || '') : partner1Name || 'Partner 1'}
                                          </span>
                                          {partner1ValidRestrictions.length > 0 && (
                                            <div className="flex items-center gap-1 flex-wrap">
                                              {partner1ValidRestrictions.slice(0, 1).map((r: any, idx: number) => (
                                                <Badge 
                                                  key={r.restriction_id || r.restriction_name || `restriction-${idx}`} 
                                                  variant="outline"
                                                  className={`text-xs ${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                                                >
                                                  {(() => {
                                                    const Icon = getTypeIcon(r.restriction_type || '');
                                                    return <Icon className="h-3 w-3" />;
                                                  })()}
                                                  {r.restriction_name || r}
                                                </Badge>
                                              ))}
                                              {partner1ValidRestrictions.length > 1 && (
                                                <Badge variant="outline" className="text-xs">
                                                  +{partner1ValidRestrictions.length - 1} more
                                                </Badge>
                                              )}
                                            </div>
                                          )}
                                          <Lock className="h-3 w-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                        </div>
                                      </div>
                                      
                                      {/* Partner 2 - Always show */}
                                      <div className="text-sm p-2 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1 flex-wrap">
                                          <Heart className="h-3 w-3 text-pink-500 dark:text-pink-400 flex-shrink-0" />
                                          <span className="font-medium dark:text-blue-100">
                                            {partner2 ? (partner2.firstName || partner2.name?.split(' ')[0] || partner2Name) + ' ' + (partner2.lastName || partner2.name?.split(' ').slice(1).join(' ') || '') : partner2Name || 'Partner 2'}
                                          </span>
                                          {partner2ValidRestrictions.length > 0 && (
                                            <div className="flex items-center gap-1 flex-wrap">
                                              {partner2ValidRestrictions.slice(0, 1).map((r: any, idx: number) => (
                                                <Badge 
                                                  key={r.restriction_id || r.restriction_name || `restriction-${idx}`} 
                                                  variant="outline"
                                                  className={`text-xs ${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                                                >
                                                  {(() => {
                                                    const Icon = getTypeIcon(r.restriction_type || '');
                                                    return <Icon className="h-3 w-3" />;
                                                  })()}
                                                  {r.restriction_name || r}
                                                </Badge>
                                              ))}
                                              {partner2ValidRestrictions.length > 1 && (
                                                <Badge variant="outline" className="text-xs">
                                                  +{partner2ValidRestrictions.length - 1} more
                                                </Badge>
                                              )}
                                            </div>
                                          )}
                                          <Lock className="h-3 w-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                        </div>
                                      </div>
                                      
                                      {/* Couple Preferences Restrictions (if any) */}
                                      {coupleRestrictions.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                                          <p className="text-xs font-medium mb-1 text-muted-foreground dark:text-muted-foreground">Couple Preferences:</p>
                                          <div className="flex flex-wrap gap-1">
                                            {coupleRestrictions.map((r, idx) => (
                                              <Badge 
                                                key={idx} 
                                                variant="outline" 
                                                className={`text-xs ${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                                              >
                                                {(() => {
                                                  const Icon = getTypeIcon(r.restriction_type || '');
                                                  return <Icon className="h-3 w-3" />;
                                                })()}
                                                {r.restriction_name}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                              
                              
                              {/* Assigned Guests Section - Show all guests including partners if they exist as guests */}
                              {assignedGuestsList.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                  <p className="text-sm font-medium mb-2">Assigned Guests at this Table:</p>
                                  <ul className="space-y-1">
                                    {assignedGuestsList.map((guest) => {
                                      const partner1Name = wedding?.partner1 || wedding?.partner1_name || '';
                                      const partner2Name = wedding?.partner2 || wedding?.partner2_name || '';
                                      const guestName = (guest.firstName || guest.name?.split(' ')[0] || '') + ' ' + (guest.lastName || guest.name?.split(' ').slice(1).join(' ') || '');
                                      const isPartner = (isCoupleTableForCount && (
                                        guestName.trim().includes(partner1Name) || guestName.trim().includes(partner2Name) ||
                                        partner1Name.includes(guestName.trim()) || partner2Name.includes(guestName.trim())
                                      ));
                                      const restrictions = Array.isArray(guest.dietaryRestrictions) 
                                        ? guest.dietaryRestrictions 
                                        : guest.dietaryRestriction 
                                          ? [{ restriction_name: guest.dietaryRestriction }] 
                                          : [];
                                      const validRestrictions = restrictions.filter((r: any) => r.restriction_name && r.restriction_name !== 'None');
                                      const rsvpStatus = guest.rsvpStatus || guest.rsvp_status || 'pending';
                                      const rsvpIcon = rsvpStatus === 'accepted' ? <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" /> : 
                                                       rsvpStatus === 'declined' ? <X className="h-3 w-3 text-red-600 dark:text-red-400" /> : 
                                                       <Clock className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />;
                                      return (
                                        <li key={guest.id} className={`flex items-center justify-between gap-2 text-sm p-2 rounded border ${isPartner ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : 'border-border hover:bg-muted/50'}`}>
                                          <div className="flex items-center gap-2 flex-1 flex-wrap">
                                            {rsvpIcon}
                                            <span className="font-medium">{guest.firstName || guest.name?.split(' ')[0]} {guest.lastName || guest.name?.split(' ').slice(1).join(' ')}</span>
                                            {isPartner && (
                                              <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700">
                                                <Heart className="h-2 w-2 mr-1 text-pink-500 dark:text-pink-400" />
                                                Partner
                                              </Badge>
                                            )}
                                            {validRestrictions.length > 0 && (
                                              <div className="flex items-center gap-1">
                                                {validRestrictions.slice(0, 1).map((r: any, idx: number) => (
                                                  <Badge key={r.restriction_id || r.restriction_name || `restriction-${idx}`} variant="secondary" className="text-xs">
                                                    {r.restriction_name || r}
                                                  </Badge>
                                                ))}
                                                {validRestrictions.length > 1 && (
                                                  <Badge variant="outline" className="text-xs">
                                                    +{validRestrictions.length - 1} more
                                                  </Badge>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                          {!isPartner && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                              onClick={() => handleRemoveGuestFromTable(guest.id, tableId)}
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          )}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="mb-2">
                                <p className="text-sm font-medium">Assigned Guests:</p>
                              </div>
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
                                    const validRestrictions = restrictions.filter((r: any) => r.restriction_name && r.restriction_name !== 'None');
                                    const rsvpStatus = guest.rsvpStatus || guest.rsvp_status || 'pending';
                                    const rsvpIcon = rsvpStatus === 'accepted' ? <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" /> : 
                                                     rsvpStatus === 'declined' ? <X className="h-3 w-3 text-red-600 dark:text-red-400" /> : 
                                                     <Clock className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />;
                                    return (
                                      <li key={guest.id} className="flex items-center justify-between gap-2 text-sm p-2 rounded border border-border hover:bg-muted/50">
                                        <div className="flex items-center gap-2 flex-1 flex-wrap">
                                          {rsvpIcon}
                                          <span className="font-medium">{guest.firstName || guest.name?.split(' ')[0]} {guest.lastName || guest.name?.split(' ').slice(1).join(' ')}</span>
                                          {validRestrictions.length > 0 && (
                                            <div className="flex items-center gap-1">
                                              {validRestrictions.slice(0, 1).map((r: any, idx: number) => (
                                                <Badge key={r.restriction_id || r.restriction_name || `restriction-${idx}`} variant="secondary" className="text-xs">
                                                  {r.restriction_name || r}
                                                </Badge>
                                              ))}
                                              {validRestrictions.length > 1 && (
                                                <Badge variant="outline" className="text-xs">
                                                  +{validRestrictions.length - 1} more
                                                </Badge>
                                              )}
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
                        {/* Dietary Restrictions - Shown at the very bottom */}
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Dietary Restrictions per Table ({tableRestrictions.length}):</p>
                          {tableRestrictions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {tableRestrictions.map((r: any) => {
                                const Icon = getTypeIcon(r.restriction_type || '');
                                return (
                                  <Badge 
                                    key={r.restriction_id || r.id} 
                                    variant="outline" 
                                    className={`text-xs ${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                                  >
                                    <Icon className="h-3 w-3" />
                                    {r.restriction_name || r.name}
                                  </Badge>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                              <span>No dietary restrictions</span>
                            </div>
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
                            const tableId = table.id || table.table_id;
                            // Get assigned guests by checking table_id in guest data (same logic as table cards)
                            const assignedGuestsList = (guests || []).filter(g => {
                              if (!g) return false;
                              return g.table_id === tableId;
                            });
                            // For couple tables, always count the 2 partners as assigned
                            const isCoupleTableForCount = (table.category || table.table_category || '').toLowerCase() === 'couple';
                            const partnerCount = isCoupleTableForCount ? 2 : 0;
                            const assignedCount = assignedGuestsList.length + partnerCount;
                            const capacity = table.capacity || 0;
                            const available = Math.max(0, capacity - assignedCount);
                            const tableNum = table.tableNumber || table.table_number || 'Unknown';
                            const category = table.category || table.table_category || 'General';
                            return (
                              <SelectItem key={tableId || `table-${tableNum}`} value={tableId ? tableId.toString() : `table-${tableNum}`}>
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
                            .map((guest) => {
                              const rsvpStatus = guest.rsvpStatus || guest.rsvp_status || 'pending';
                              return (
                                <SelectItem key={guest.id || guest.guest_id || `guest-${guest.name}`} value={(guest.id ?? guest.guest_id ?? `guest-${guest.name || 'unknown'}`).toString()}>
                                  <div className="flex items-center gap-2">
                                    <span>{guest.firstName || guest.name?.split(' ')[0] || 'Unknown'} {guest.lastName || guest.name?.split(' ').slice(1).join(' ') || ''}</span>
                                    <Badge variant="outline" className={`text-xs ${
                                      rsvpStatus === 'accepted' ? 'bg-green-100 text-green-800 border-green-300' : 
                                      rsvpStatus === 'declined' ? 'bg-red-100 text-red-800 border-red-300' : 
                                      'bg-yellow-100 text-yellow-800 border-yellow-300'
                                    }`}>
                                      RSVP: {rsvpStatus.charAt(0).toUpperCase() + rsvpStatus.slice(1)}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          {guests.filter(guest => !guest.table_id).length === 0 && (
                            <SelectItem value="placeholder-no-guests" disabled>No unassigned guests available</SelectItem>
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
                        
                        const newPositions = {
                          ...tablePositions,
                          [draggedTableId]: { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
                        };
                        setTablePositions(newPositions);
                        // Save to localStorage immediately
                        if (id) {
                          localStorage.setItem(`wedding_${id}_table_positions`, JSON.stringify(newPositions));
                        }
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
                          const assignedGuestsList = guests.filter(g => g && g.table_id === tableId);
                          // For couple tables, always count the 2 partners as assigned
                          const isCoupleTableForSeats = (table.category || table.table_category || '').toLowerCase() === 'couple';
                          const partnerCountForSeats = isCoupleTableForSeats ? 2 : 0;
                          const assignedCount = assignedGuestsList.length + partnerCountForSeats;
                          const capacity = table.capacity || 0;
                          const available = Math.max(0, capacity - assignedCount);
                        const categoryColors: Record<string, string> = {
                          'VIP': 'bg-purple-200 dark:bg-purple-900 border-purple-400 dark:border-purple-600',
                            'kids': 'bg-blue-200 dark:bg-blue-900 border-blue-400 dark:border-blue-600',
                            'elderly': 'bg-orange-200 dark:bg-orange-900 border-orange-400 dark:border-orange-600',
                            'family': 'bg-green-200 dark:bg-green-900 border-green-400 dark:border-green-600',
                            'entourage': 'bg-indigo-200 dark:bg-indigo-900 border-indigo-400 dark:border-indigo-600',
                            'friends': 'bg-cyan-200 dark:bg-cyan-900 border-cyan-400 dark:border-cyan-600',
                            'vendor': 'bg-yellow-200 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-600',
                            'staff': 'bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-500',
                            'reserved': 'bg-amber-200 dark:bg-amber-900 border-amber-400 dark:border-amber-600',
                            'special_needs': 'bg-red-200 dark:bg-red-900 border-red-400 dark:border-red-600',
                            'couple': 'bg-pink-200 dark:bg-pink-900 border-pink-400 dark:border-pink-600',
                            'guest': 'bg-blue-200 dark:bg-blue-900 border-blue-400 dark:border-blue-600',
                          'General': 'bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-500'
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
                          
                          // Calculate assigned count including partners for couple tables (for display)
                          const actualAssignedCount = assignedCount; // Already includes partners from line 3648
                          
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
                                {/* Calculate table size based on capacity and text content */}
                                {(() => {
                                  // Base size calculation - better scaling for different capacities
                                  // Use a more gradual scaling that works better for common sizes like 8
                                  let baseTableSize: number;
                                  if (capacity <= 2) {
                                    baseTableSize = 70;
                                  } else if (capacity <= 4) {
                                    baseTableSize = 85;
                                  } else if (capacity <= 6) {
                                    baseTableSize = 100;
                                  } else if (capacity <= 8) {
                                    baseTableSize = 115; // Better size for 8 capacity
                                  } else if (capacity <= 10) {
                                    baseTableSize = 130;
                                  } else if (capacity <= 12) {
                                    baseTableSize = 145;
                                  } else {
                                    baseTableSize = 160;
                                  }
                                  
                                  // Always ensure minimum size for readability
                                  const tableSize = Math.max(baseTableSize, 80);
                                  
                                  // Calculate chair radius - place chairs further outside the table box with better spacing
                                  const chairRadius = (tableSize / 2) + 28; // Increased spacing to prevent overlap
                                  const chairSize = capacity <= 4 ? 12 : capacity <= 8 ? 11 : 10; // Slightly larger chairs
                                  
                                  // Calculate font sizes - ensure readability even for small tables
                                  const fontSizeTableNum = '11px'; // Fixed size for consistency
                                  const fontSizeCategory = '8px';
                                  const fontSizeCapacity = '9px';
                                  const fontSizeFull = '8px';
                                  
                                  return (
                                    <>
                                      {/* Chairs arranged around table in a circle - OUTSIDE the table box */}
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
                                        {Array.from({ length: capacity }, (_, i) => {
                                          const angle = capacity === 1 ? 0 : (i * 360) / capacity; // For capacity 1, place at top
                                          const radian = (angle * Math.PI) / 180;
                                          const chairX = Math.cos(radian) * chairRadius;
                                          const chairY = Math.sin(radian) * chairRadius;
                                          // For couple tables, first 2 seats are always occupied by partners
                                          const isCoupleTableForSeats = (table.category || table.table_category || '').toLowerCase() === 'couple';
                                          const partnerSeats = isCoupleTableForSeats ? 2 : 0;
                                          const actualAssignedCount = assignedGuestsList.length + partnerSeats;
                                          const isOccupied = i < actualAssignedCount;
                                          
                                          return (
                                            <div
                                              key={i}
                                              className={`absolute rounded-full border-2 transition-all cursor-pointer ${
                                                isOccupied 
                                                  ? 'bg-red-500 dark:bg-red-600 border-red-600 dark:border-red-700' 
                                                  : 'bg-green-500 dark:bg-green-600 border-green-600 dark:border-green-700'
                                              }`}
                                              style={{
                                                width: `${chairSize}px`,
                                                height: `${chairSize}px`,
                                                left: `calc(50% + ${chairX}px)`,
                                                top: `calc(50% + ${chairY}px)`,
                                                transform: 'translate(-50%, -50%)',
                                                zIndex: 1,
                                                boxShadow: isOccupied 
                                                  ? '0 0 0 1px rgba(220, 38, 38, 0.3), 0 0 0 2px rgba(239, 68, 68, 0.2) inset' 
                                                  : '0 0 0 1px rgba(34, 197, 94, 0.3), 0 0 0 2px rgba(22, 163, 74, 0.2) inset'
                                              }}
                                              title={`Seat ${i + 1}: ${isOccupied ? 'Occupied' : 'Available'}`}
                                            />
                                          );
                                        })}
                                      </div>
                                      
                                      {/* Table center - more rounded, better text display */}
                                      <div
                                        className={`rounded-2xl border-2 p-2 flex flex-col items-center justify-center text-xs transition-all hover:shadow-lg hover:scale-105 relative dark:border-gray-600 ${categoryColors[tableCategory] || categoryColors[tableCategory.toLowerCase()] || 'bg-gray-200 dark:bg-gray-800 border-gray-400'}`}
                                        style={{
                                          width: `${tableSize}px`,
                                          height: `${tableSize}px`,
                                          zIndex: 2,
                                          minWidth: '80px',
                                          minHeight: '80px',
                                          borderRadius: '16px' // More rounded
                                        }}
                                        title={`${displayTableNum} - ${tableCategory} - ${actualAssignedCount}/${capacity} guests`}
                                      >
                                        {/* Table Number - Always visible */}
                                        <div 
                                          className="font-bold leading-tight relative z-10 text-gray-900 dark:text-gray-100 text-center px-1"
                                          style={{ fontSize: fontSizeTableNum, lineHeight: '1.2' }}
                                        >
                                          {displayTableNum}
                                        </div>
                                        {/* Table Category - Compact badge */}
                                        <div 
                                          className="mt-0.5 relative z-10"
                                          style={{ fontSize: fontSizeCategory }}
                                        >
                                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                                            {tableCategory.charAt(0).toUpperCase() + tableCategory.slice(1).replace(/_/g, ' ')}
                                          </span>
                                        </div>
                                        {/* Capacity indicator */}
                                        <div 
                                          className="mt-1 font-semibold relative z-10 text-gray-800 dark:text-gray-200"
                                          style={{ fontSize: fontSizeCapacity }}
                                        >
                                          {actualAssignedCount}/{capacity}
                                        </div>
                                        {/* Full indicator */}
                                        {(capacity - actualAssignedCount) === 0 && (
                                          <div 
                                            className="mt-0.5 text-red-600 dark:text-red-400 font-bold relative z-10"
                                            style={{ fontSize: fontSizeFull }}
                                          >
                                            Full
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  );
                                })()}
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

          </TabsContent>

          {/* Bulk Assignment Modal - Outside TabsContent */}
          <Dialog open={bulkAssignmentOpen} onOpenChange={(open) => {
              setBulkAssignmentOpen(open);
              if (!open) {
                setSelectedGuestIds([]);
                setBulkTableId('');
                setBulkAssignFilter('all');
              }
            }}>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Bulk Assign Guests to Table</DialogTitle>
                  <DialogDescription>
                    Select multiple guests and assign them to a table at once. {selectedGuestIds.length > 0 && (
                      <span className="font-semibold text-foreground">{selectedGuestIds.length} guest{selectedGuestIds.length !== 1 ? 's' : ''} selected</span>
                    )}
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
                    
                    {/* Filter and Quick Actions */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Select value={bulkAssignFilter} onValueChange={(value: any) => setBulkAssignFilter(value)}>
                          <SelectTrigger className="h-8 text-xs w-full dark:bg-[#1a1a1a] dark:text-[#e5e5e5] dark:border-[#333]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-[#1a1a1a] dark:text-[#e5e5e5] dark:border-[#333]">
                            <SelectItem value="all" className="dark:focus:bg-[#2a2a2a] dark:focus:text-[#f5f5f5] dark:text-[#e5e5e5]">
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                <span>All Guests</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="accepted" className="dark:focus:bg-[#2a2a2a] dark:focus:text-[#f5f5f5] dark:text-[#e5e5e5]">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                <span>Accepted RSVP</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="pending" className="dark:focus:bg-[#2a2a2a] dark:focus:text-[#f5f5f5] dark:text-[#e5e5e5]">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                                <span>Pending RSVP</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="declined" className="dark:focus:bg-[#2a2a2a] dark:focus:text-[#f5f5f5] dark:text-[#e5e5e5]">
                              <div className="flex items-center gap-2">
                                <X className="h-3 w-3 text-red-600 dark:text-red-400" />
                                <span>Declined RSVP</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="unassigned" className="dark:focus:bg-[#2a2a2a] dark:focus:text-[#f5f5f5] dark:text-[#e5e5e5]">
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-3 w-3" />
                                <span>Unassigned Only</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              const unassigned = getUnassignedGuests();
                              setSelectedGuestIds(unassigned.map(g => g.id || g.guest_id).filter(Boolean));
                            }}
                          >
                            Select All Unassigned
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              const accepted = guests.filter(g => (g.rsvpStatus === 'accepted' || g.rsvp_status === 'accepted') && !g.table_id);
                              setSelectedGuestIds(accepted.map(g => g.id || g.guest_id).filter(Boolean));
                            }}
                          >
                            Select All Accepted
                          </Button>
                        </div>
                      </div>
                      {/* Auto-assign by dietary restriction */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Auto-Assign by Dietary Restriction</Label>
                        <div className="flex flex-wrap gap-1">
                          {dietaryRestrictions.filter(r => r.restriction_name && r.restriction_name !== 'None').slice(0, 5).map((restriction) => {
                            const restrictionName = restriction.restriction_name;
                            const guestsWithRestriction = guests.filter(g => {
                              if (!g.table_id) {
                                const restrictions = Array.isArray(g.dietaryRestrictions) 
                                  ? g.dietaryRestrictions 
                                  : g.dietaryRestriction 
                                    ? [{ restriction_name: g.dietaryRestriction }] 
                                    : [];
                                return restrictions.some((r: any) => (r.restriction_name || r) === restrictionName);
                              }
                              return false;
                            });
                            if (guestsWithRestriction.length === 0) return null;
                            return (
                              <Button
                                key={restriction.restriction_id}
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setSelectedGuestIds(guestsWithRestriction.map(g => g.id || g.guest_id).filter(Boolean));
                                }}
                              >
                                {(() => {
                                  const Icon = getTypeIcon(restriction.restriction_type || 'Dietary');
                                  return <Icon className="h-3 w-3 mr-1" />;
                                })()}
                                {restrictionName} ({guestsWithRestriction.length})
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto dark:border-[#333] dark:bg-[#1a1a1a]">
                      {(() => {
                        let filteredGuests = guests;
                        if (bulkAssignFilter === 'accepted') {
                          filteredGuests = guests.filter(g => g.rsvpStatus === 'accepted' || g.rsvp_status === 'accepted');
                        } else if (bulkAssignFilter === 'pending') {
                          filteredGuests = guests.filter(g => (g.rsvpStatus === 'pending' || g.rsvp_status === 'pending') || (!g.rsvpStatus && !g.rsvp_status));
                        } else if (bulkAssignFilter === 'declined') {
                          filteredGuests = guests.filter(g => g.rsvpStatus === 'declined' || g.rsvp_status === 'declined');
                        } else if (bulkAssignFilter === 'unassigned') {
                          filteredGuests = getUnassignedGuests();
                        }
                        
                        if (filteredGuests.length === 0) {
                          return (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No guests match the selected filter
                            </p>
                          );
                        }
                        
                        return (
                          <div className="space-y-2">
                            {filteredGuests.map((guest) => {
                              const isAssigned = guest.table_id !== null && guest.table_id !== undefined;
                              const assignedTable = isAssigned ? tables.find(t => (t.id || t.table_id) === guest.table_id) : null;
                              const rsvpStatus = guest.rsvpStatus || guest.rsvp_status || 'pending';
                              const rsvpBadgeColor = rsvpStatus === 'accepted' ? 'bg-green-100 text-green-800 border-green-300' : 
                                                     rsvpStatus === 'declined' ? 'bg-red-100 text-red-800 border-red-300' : 
                                                     'bg-yellow-100 text-yellow-800 border-yellow-300';
                              return (
                                <div key={guest.id} className={`flex items-center space-x-2 p-2 rounded hover:bg-muted ${isAssigned ? 'opacity-60' : ''}`}>
                                    <Checkbox
                                    checked={selectedGuestIds.includes(guest.id || guest.guest_id)}
                                    onCheckedChange={(checked) => {
                                      const guestId = guest.id || guest.guest_id;
                                      if (checked) {
                                        setSelectedGuestIds([...selectedGuestIds, guestId]);
                                      } else {
                                        setSelectedGuestIds(selectedGuestIds.filter(id => id !== guestId));
                                      }
                                    }}
                                    disabled={isAssigned && bulkAssignFilter === 'unassigned'}
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-sm font-medium dark:text-[#e5e5e5]">
                                        {guest.firstName || guest.name?.split(' ')[0]} {guest.lastName || guest.name?.split(' ').slice(1).join(' ')}
                                      </p>
                                      {isAssigned && (
                                        <Badge variant="secondary" className="text-xs dark:bg-gray-800 dark:text-gray-200">
                                          {assignedTable?.tableNumber || assignedTable?.table_number || 'Table'} assigned
                                        </Badge>
                                      )}
                                    </div>
                                    {((guest.dietaryRestriction && guest.dietaryRestriction !== 'None') || (guest.dietaryRestrictions && Array.isArray(guest.dietaryRestrictions) && guest.dietaryRestrictions.length > 0)) && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {guest.dietaryRestrictions && Array.isArray(guest.dietaryRestrictions) && guest.dietaryRestrictions.length > 0
                                          ? guest.dietaryRestrictions.filter((r: any) => r.restriction_name && r.restriction_name !== 'None').slice(0, 3).map((r: any, idx: number) => {
                                              const restrictionType = r.restriction_type || '';
                                              return (
                                                <Badge 
                                                  key={r.restriction_id || idx} 
                                                  variant="outline" 
                                                  className={`text-xs ${getTypeColor(restrictionType)} border flex items-center gap-1`}
                                                >
                                                  {(() => {
                                                    const Icon = getTypeIcon(restrictionType);
                                                    return <Icon className="h-3 w-3" />;
                                                  })()}
                                                  {r.restriction_name}
                                                </Badge>
                                              );
                                            })
                                          : guest.dietaryRestriction && guest.dietaryRestriction !== 'None' && (
                                              <Badge variant="outline" className="text-xs">
                                                {guest.dietaryRestriction}
                                              </Badge>
                                            )
                                        }
                                        {guest.dietaryRestrictions && Array.isArray(guest.dietaryRestrictions) && guest.dietaryRestrictions.filter((r: any) => r.restriction_name && r.restriction_name !== 'None').length > 3 && (
                                          <Badge variant="outline" className="text-xs dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
                                            +{guest.dietaryRestrictions.filter((r: any) => r.restriction_name && r.restriction_name !== 'None').length - 3} more
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Table Selection */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Select Table</h4>
                    <div className="space-y-2">
                      <Select value={bulkTableId} onValueChange={setBulkTableId} disabled={tables.length === 0}>
                        <SelectTrigger className="h-8 text-xs w-full dark:bg-[#1a1a1a] dark:text-[#e5e5e5] dark:border-[#333]">
                          <SelectValue placeholder="Choose a table" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-[#1a1a1a] dark:text-[#e5e5e5] dark:border-[#333]">
                          {tables.map((table) => {
                            if (!table) return null;
                            const tableId = table.id || table.table_id;
                            const assignedCount = guests.filter(g => g && g.table_id === tableId).length;
                            const available = (table.capacity || 0) - assignedCount;
                            const tableNum = table.tableNumber || table.table_number || 'Unknown';
                            const category = table.category || table.table_category || 'General';
                            const CategoryIcon = getTableCategoryIcon(category);
                            return (
                              <SelectItem 
                                key={tableId || `table-${tableNum}`} 
                                value={tableId ? tableId.toString() : `table-${tableNum}`}
                                disabled={available === 0}
                                className="dark:focus:bg-[#2a2a2a] dark:focus:text-[#f5f5f5] dark:text-[#e5e5e5]"
                              >
                                <div className="flex items-center gap-2">
                                  <CategoryIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>{tableNum} ({category}) - {available} available</span>
                                </div>
                              </SelectItem>
                            );
                          }).filter(Boolean)}
                        </SelectContent>
                      </Select>
                      {bulkTableId && (
                        <div className={`border rounded-lg p-3 mt-2 dark:border-[#333] dark:bg-[#1a1a1a] ${selectedGuestIds.length > 0 ? (() => {
                          const selectedTable = tables.find(t => (t.id ?? t.table_id)?.toString() === bulkTableId);
                          if (!selectedTable) return '';
                          const tableId = selectedTable.id || selectedTable.table_id;
                          // For couple tables, always count the 2 partners as assigned
                          const isCoupleTable = (selectedTable.category || selectedTable.table_category || '').toLowerCase() === 'couple';
                          const partnerCount = isCoupleTable ? 2 : 0;
                          const assignedGuestsCount = guests.filter(g => g && g.table_id === tableId).length;
                          const assignedCount = assignedGuestsCount + partnerCount;
                          const available = Math.max(0, (selectedTable.capacity || 0) - assignedCount);
                          return selectedGuestIds.length > available 
                            ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30' 
                            : 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30';
                        })() : ''}`}>
                          {(() => {
                            const selectedTable = tables.find(t => (t.id ?? t.table_id)?.toString() === bulkTableId);
                            if (!selectedTable) return null;
                            const tableId = selectedTable.id || selectedTable.table_id;
                            // For couple tables, always count the 2 partners as assigned
                            const isCoupleTable = (selectedTable.category || selectedTable.table_category || '').toLowerCase() === 'couple';
                            const partnerCount = isCoupleTable ? 2 : 0;
                            const assignedGuestsCount = guests.filter(g => g && g.table_id === tableId).length;
                            const assignedCount = assignedGuestsCount + partnerCount;
                            const available = Math.max(0, (selectedTable.capacity || 0) - assignedCount);
                            return (
                              <>
                                <p className="text-sm font-medium dark:text-[#e5e5e5]">{selectedTable.tableNumber || selectedTable.table_number || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground dark:text-[#d4d4d4]">
                                  Capacity: {selectedTable.capacity || 0} | 
                                  Assigned: {assignedCount}{isCoupleTable ? ' (includes couple)' : ''} | 
                                  Available: {available}
                                </p>
                                {selectedGuestIds.length > 0 && (
                                  <div className="mt-2 pt-2 border-t dark:border-[#333]">
                                    <p className="text-xs font-medium dark:text-[#e5e5e5]">
                                      {selectedGuestIds.length} guest{selectedGuestIds.length !== 1 ? 's' : ''} selected
                                    </p>
                                    {selectedGuestIds.length > available ? (
                                      <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        Warning: Only {available} seat{available !== 1 ? 's' : ''} available
                                      </p>
                                    ) : (
                                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        {available - selectedGuestIds.length} seat{available - selectedGuestIds.length !== 1 ? 's' : ''} remaining
                                      </p>
                                    )}
                                  </div>
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
            {/* Table Grid View for Package Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Tables - Package Assignment</CardTitle>
                <CardDescription>Select a table to view recommended packages based on dietary restrictions</CardDescription>
              </CardHeader>
              <CardContent>
                {tables.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No tables available. Please add tables first.</p>
                ) : (
                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tables.map((table) => {
                      if (!table) return null;
                      const tableId = table.id || table.table_id;
                      const tableNum = table.tableNumber || table.table_number || 'Unknown';
                      const category = table.category || table.table_category || '';
                      const tablePackages = getTablePackages(tableId);
                      const tableRestrictions = getTableRestrictions(tableId);
                      const showRecommendations = selectedTableForRecommendations === tableId;
                      const recommendedPackages = showRecommendations ? getRecommendedPackages(tableId) : [];
                      const assignedGuestsList = guests.filter(g => g && g.table_id === tableId);
                      // For couple tables, always count the 2 partners as assigned
                      const isCoupleTable = (category || '').toLowerCase() === 'couple';
                      const partnerCount = isCoupleTable ? 2 : 0;
                      const assignedCount = assignedGuestsList.length + partnerCount;
                      const capacity = table.capacity || 0;
                      const available = Math.max(0, capacity - assignedCount);
                      
                      return (
                        <Card key={tableId} className="flex flex-col h-full">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg">{tableNum}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">Table ID: {tableId}</p>
                                <div className="mt-2">
                                  <TableCategoryBadge category={category} />
                                </div>
                              </div>
                            </div>
                            <CardDescription>
                              Capacity: {capacity} | Assigned: {assignedCount} | Available: {available}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1 space-y-3">
                            {/* Total Dietary Restrictions */}
                            {tableRestrictions.length > 0 && (
                              <div className="pb-2 border-b">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Total Dietary Restrictions ({tableRestrictions.length}):</p>
                                <div className="flex flex-wrap gap-1">
                                  {tableRestrictions.map((r: any) => {
                                    const Icon = getTypeIcon(r.restriction_type || '');
                                    return (
                                      <Badge 
                                        key={r.restriction_id || r.id} 
                                        variant="outline" 
                                        className={`text-xs ${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                                      >
                                        <Icon className="h-3 w-3" />
                                        {r.restriction_name || r.name}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {/* Assigned Packages with their Dietary Restrictions */}
                            {tablePackages.length > 0 ? (
                              <div className="pb-2 border-b space-y-2">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Assigned Packages ({tablePackages.length}):</p>
                                {tablePackages.map((pkg, idx) => {
                                  // Get full package object to extract restrictions
                                  const fullPackage = packages.find(p => (p.package_id || p.id) === (pkg.packageId || pkg.package_id));
                                  const packageRestrictions: any[] = [];
                                  if (fullPackage && fullPackage.menu_items && Array.isArray(fullPackage.menu_items)) {
                                    const restrictionSet = new Set<string>();
                                    fullPackage.menu_items.forEach((item: any) => {
                                      if (item.restriction_name && item.restriction_name !== 'None') {
                                        if (!restrictionSet.has(item.restriction_name)) {
                                          restrictionSet.add(item.restriction_name);
                                          packageRestrictions.push({
                                            restriction_name: item.restriction_name,
                                            restriction_type: item.restriction_type || 'Dietary'
                                          });
                                        }
                                      }
                                    });
                                  }
                                  return (
                                    <div key={idx} className="space-y-1">
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <Badge variant="outline" className="gap-1">
                                          <Package className="w-3 h-3" />
                                          {pkg.packageName || pkg.package_name} (ID: {pkg.packageId || pkg.package_id})
                                        </Badge>
                                      </div>
                                      {packageRestrictions.length > 0 && (
                                        <div className="ml-4">
                                          <p className="text-xs text-muted-foreground mb-1">Package Dietary Restrictions:</p>
                                          <div className="flex flex-wrap gap-1">
                                            {packageRestrictions.map((r: any, rIdx: number) => {
                                              const Icon = getTypeIcon(r.restriction_type || 'Dietary');
                                              return (
                                                <Badge 
                                                  key={rIdx} 
                                                  variant="outline" 
                                                  className={`text-xs ${getTypeColor(r.restriction_type || 'Dietary')} border flex items-center gap-1`}
                                                >
                                                  <Icon className="h-2.5 w-2.5" />
                                                  {r.restriction_name}
                                                </Badge>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}
                            {!showRecommendations ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                  setSelectedTableForRecommendations(tableId);
                                }}
                              >
                                <Package className="w-3 h-3 mr-2" />
                                Show Recommended Packages
                              </Button>
                            ) : (
                              <div className="space-y-2">
                                {recommendedPackages.length > 0 ? (
                                  <div className="space-y-2">
                                    <div className="pb-2 border-b border-dashed">
                                      <Badge variant="outline" className="gap-1">
                                        <Package className="w-3 h-3" />
                                        {recommendedPackages.length} Recommended Package{recommendedPackages.length !== 1 ? 's' : ''} (Based on Table Restrictions)
                                      </Badge>
                                    </div>
                                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                                      {recommendedPackages.slice(0, 5).map((rec, idx) => {
                                        const pkg = rec.pkg;
                                        const pkgId = pkg.package_id || pkg.id;
                                        const packageRestrictions: any[] = [];
                                        if (pkg.menu_items && Array.isArray(pkg.menu_items)) {
                                          const restrictionSet = new Set<string>();
                                          pkg.menu_items.forEach((item: any) => {
                                            if (item.restriction_name && item.restriction_name !== 'None') {
                                              if (!restrictionSet.has(item.restriction_name)) {
                                                restrictionSet.add(item.restriction_name);
                                                packageRestrictions.push({
                                                  restriction_name: item.restriction_name,
                                                  restriction_type: item.restriction_type || 'Dietary'
                                                });
                                              }
                                            }
                                          });
                                        }
                                        return (
                                          <Button
                                            key={pkgId || idx}
                                            size="sm"
                                            variant="outline"
                                            className="w-full justify-start text-left h-auto py-2"
                                            onClick={async () => {
                                              try {
                                                await handleAssignPackage(tableId, pkgId);
                                              } catch (error) {
                                                console.error('Error assigning package:', error);
                                              }
                                            }}
                                          >
                                            <div className="flex flex-col gap-1 w-full">
                                              <div className="flex items-center gap-2">
                                                <Package className="h-3 w-3 flex-shrink-0" />
                                                <span className="font-medium text-xs flex-1">{pkg.package_name || pkg.packageName}</span>
                                                <Badge variant="outline" className="text-xs">ID: {pkgId}</Badge>
                                                <PackageTypeBadge type={pkg.package_type || 'Standard'} className="text-xs" />
                                              </div>
                                              {packageRestrictions.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1 ml-5">
                                                  {packageRestrictions.slice(0, 2).map((r: any, rIdx: number) => {
                                                    const Icon = getTypeIcon(r.restriction_type || 'Dietary');
                                                    return (
                                                      <Badge key={rIdx} variant="outline" className={`text-xs ${getTypeColor(r.restriction_type || 'Dietary')} border flex items-center gap-1`}>
                                                        <Icon className="h-2.5 w-2.5" />
                                                        {r.restriction_name}
                                                      </Badge>
                                                    );
                                                  })}
                                                  {packageRestrictions.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">+{packageRestrictions.length - 2}</Badge>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </Button>
                                        );
                                      })}
                                      {recommendedPackages.length > 5 && (
                                        <p className="text-xs text-muted-foreground text-center mt-1">+{recommendedPackages.length - 5} more packages</p>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full"
                                      onClick={() => {
                                        setPackageAssignTableId(tableId.toString());
                                        setPackageAssignPackageId('');
                                        // Scroll to the assign package form
                                        setTimeout(() => {
                                          const formElement = document.getElementById('packageTable');
                                          if (formElement) {
                                            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            // Focus on the package select dropdown
                                            setTimeout(() => {
                                              const packageSelect = document.getElementById('packageSelectDropdown');
                                              if (packageSelect) {
                                                packageSelect.focus();
                                              }
                                            }, 300);
                                          }
                                        }, 100);
                                      }}
                                    >
                                      <Package className="w-3 h-3 mr-2" />
                                      View All Packages
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="text-center py-2">
                                    <p className="text-xs text-muted-foreground mb-2">No recommended packages found</p>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full"
                                      onClick={() => {
                                        setPackageAssignTableId(tableId.toString());
                                        setPackageAssignPackageId('');
                                        // Scroll to the assign package form
                                        setTimeout(() => {
                                          const formElement = document.getElementById('packageTable');
                                          if (formElement) {
                                            formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            formElement.focus();
                                          }
                                        }, 100);
                                      }}
                                    >
                                      <Package className="w-3 h-3 mr-2" />
                                      Assign Package Manually
                                    </Button>
                                  </div>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="w-full"
                                  onClick={() => {
                                    setSelectedTableForRecommendations(null);
                                  }}
                                >
                                  Hide Recommendations
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                    </div>
                  </TooltipProvider>
                )}
              </CardContent>
            </Card>

            <Card id="packageTable">
              <CardHeader>
                <CardTitle>Assign Package to Table</CardTitle>
                <CardDescription>Assign a package to a specific table (multiple packages allowed per table)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="packageTableSelect">Table</Label>
                      <Select 
                        value={packageAssignTableId} 
                        onValueChange={setPackageAssignTableId} 
                        onOpenChange={(open) => {
                          if (!open) {
                            // Clear focus when dropdown closes to prevent stuck highlight
                            setTimeout(() => {
                              const trigger = document.getElementById('packageTableSelect');
                              if (trigger) {
                                trigger.blur();
                              }
                            }, 100);
                          }
                        }}
                        disabled={packageFormLoading || tables.length === 0}
                      >
                        <SelectTrigger id="packageTableSelect" name="packageTableSelect" className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a] dark:text-[#e5e5e5]">
                          <SelectValue placeholder="Select a table" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto dark:bg-[#0f0f0f] dark:border-[#2a2a2a]">
                          {tables.map((table) => {
                            if (!table) return null;
                            const tableId = table.id || table.table_id;
                            const tableNum = table.tableNumber || table.table_number || 'Unknown';
                            const category = table.category || table.table_category || 'General';
                            const CategoryIcon = getTableCategoryIcon(category);
                            return (
                              <SelectItem 
                                key={tableId || `table-${tableNum}`} 
                                value={tableId ? tableId.toString() : `table-${tableNum}`}
                                className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4] dark:hover:bg-[#1a1a1a]"
                              >
                                <div className="flex items-center gap-2">
                                  <CategoryIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>{tableNum} ({category})</span>
                                </div>
                            </SelectItem>
                            );
                          }).filter(Boolean)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packageSelectDropdown">Package</Label>
                      <Select 
                        value={packageAssignPackageId} 
                        onValueChange={(value) => {
                          setPackageAssignPackageId(value);
                        }}
                        onOpenChange={(open) => {
                          if (!open) {
                            // Clear focus when dropdown closes to prevent stuck highlight
                            setTimeout(() => {
                              const trigger = document.getElementById('packageSelectDropdown');
                              if (trigger) {
                                trigger.blur();
                              }
                            }, 100);
                          }
                        }}
                        disabled={packageFormLoading || packages.length === 0}
                      >
                        <SelectTrigger id="packageSelectDropdown" name="packageSelectDropdown" className="dark:bg-[#0f0f0f] dark:border-[#2a2a2a] dark:text-[#e5e5e5]">
                          <SelectValue placeholder="Select a package" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto dark:bg-[#0f0f0f] dark:border-[#2a2a2a]">
                          {packages.map((pkg) => {
                            const pkgId = pkg.package_id || pkg.id;
                            const tableId = packageAssignTableId ? parseInt(packageAssignTableId) : null;
                            const compatibility = tableId && pkgId ? checkPackageCompatibility(pkgId, tableId) : { compatible: true, conflicts: [] };
                            
                            // Get package restrictions
                            const packageRestrictions: any[] = [];
                            if (pkg.menu_items && Array.isArray(pkg.menu_items)) {
                              const restrictionSet = new Set<string>();
                              pkg.menu_items.forEach((item: any) => {
                                if (item.restriction_name && item.restriction_name !== 'None') {
                                  if (!restrictionSet.has(item.restriction_name)) {
                                    restrictionSet.add(item.restriction_name);
                                    packageRestrictions.push({
                                      restriction_name: item.restriction_name,
                                      restriction_type: item.restriction_type || 'Dietary'
                                    });
                                  }
                                }
                              });
                            }
                            
                            const pkgValue = pkgId ? pkgId.toString() : `pkg-${pkg.package_name || pkg.packageName || 'unknown'}`;
                            
                            return (
                              <SelectItem 
                                key={pkgId || `pkg-${pkg.package_name || pkg.packageName}`} 
                                value={pkgValue}
                                className="dark:focus:bg-[#1a1a1a] dark:focus:text-[#f5f5f5] dark:text-[#d4d4d4] dark:hover:bg-[#1a1a1a]"
                              >
                                <div className="flex flex-col gap-1 py-1">
                                  <div className="flex items-center gap-2">
                                    <Package className="h-3.5 w-3.5 text-muted-foreground dark:text-[#d4d4d4] flex-shrink-0" />
                                    {!compatibility.compatible && (
                                      <AlertTriangle className="h-3 w-3 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                                    )}
                                    <span className="font-medium">
                                      {pkg.package_name || pkg.packageName || 'Unknown'}
                                    </span>
                                    <Badge variant="outline" className="text-xs">ID: {pkgId}</Badge>
                                    <PackageTypeBadge type={pkg.package_type || pkg.packageType || 'Standard'} className="text-xs" />
                                  </div>
                                  {packageRestrictions.length > 0 && (
                                    <div className="flex items-center gap-1 flex-wrap ml-9">
                                      <span className="text-xs text-muted-foreground dark:text-[#a0a0a0]">Restrictions:</span>
                                      {packageRestrictions.slice(0, 2).map((r: any, idx: number) => {
                                        const Icon = getTypeIcon(r.restriction_type || 'Dietary');
                                        return (
                                          <Badge 
                                            key={idx} 
                                            variant="outline" 
                                            className={`text-xs ${getTypeColor(r.restriction_type || 'Dietary')} border flex items-center gap-1`}
                                          >
                                            <Icon className="h-3 w-3" />
                                            {r.restriction_name}
                                          </Badge>
                                        );
                                      })}
                                      {packageRestrictions.length > 2 && (
                                        <Badge variant="outline" className="text-xs dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
                                          +{packageRestrictions.length - 2} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                  {!compatibility.compatible && compatibility.conflicts.length > 0 && (
                                    <div className="text-xs text-amber-600 dark:text-amber-400 ml-9">
                                      ⚠️ {compatibility.conflicts.length} conflict{compatibility.conflicts.length !== 1 ? 's' : ''} with table
                                    </div>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Show table restrictions */}
                  {packageAssignTableId && (() => {
                    const tableId = parseInt(packageAssignTableId);
                    const tableRestrictions = getTableRestrictions(tableId);
                    
                    return (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                              Table Restrictions ({tableRestrictions.length})
                            </p>
                            {tableRestrictions.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {tableRestrictions.map((r: any) => (
                                  <Badge 
                                    key={r.restriction_id || r.id} 
                                    variant="outline" 
                                    className={`text-xs ${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                                  >
                                    {(() => {
                                      const Icon = getTypeIcon(r.restriction_type || '');
                                      return <Icon className="h-3 w-3" />;
                                    })()}
                                    {r.restriction_name || r.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-blue-800 dark:text-blue-200">No restrictions for this table</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Show compatibility warnings */}
                  {packageAssignTableId && packageAssignPackageId && (() => {
                    const tableId = parseInt(packageAssignTableId);
                    const packageId = parseInt(packageAssignPackageId);
                    const compatibility = checkPackageCompatibility(packageId, tableId);
                    const tableRestrictions = getTableRestrictions(tableId);
                    
                    if (!compatibility.compatible && compatibility.conflicts.length > 0) {
                      return (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Package Compatibility Warning</p>
                              <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
                                This package contains items that may conflict with table restrictions:
                              </p>
                              <div className="space-y-2 mb-2">
                                {compatibility.conflicts.map((conflict, idx) => (
                                  <div key={idx} className="text-sm text-amber-800 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/40 p-2 rounded">
                                    <div className="font-semibold mb-1">
                                      • <strong>{conflict.menu_item}</strong> conflicts with <strong>{conflict.restriction_name}</strong>
                                    </div>
                                    {(conflict.affected_guests && conflict.affected_guests.length > 0) || 
                                     (conflict.affected_couples && conflict.affected_couples.length > 0) ? (
                                      <div className="text-xs text-amber-700 dark:text-amber-400 mt-1 ml-4">
                                        Affected: {[
                                          ...(conflict.affected_guests || []).map((g: string) => `Guest: ${g}`),
                                          ...(conflict.affected_couples || []).length > 0 
                                            ? [`Couple: ${(conflict.affected_couples || []).join(' & ')}`] 
                                            : []
                                        ].join('; ')}
                                      </div>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                              {tableRestrictions.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">Table Restrictions:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {tableRestrictions.map((r: any) => (
                                      <Badge 
                                        key={r.restriction_id || r.id} 
                                        variant="outline" 
                                        className={`text-xs ${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                                      >
                                        {(() => {
                                          const Icon = getTypeIcon(r.restriction_type || '');
                                          return <Icon className="h-3 w-3" />;
                                        })()}
                                        {r.restriction_name || r.name}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    } else if (tableRestrictions.length > 0) {
                      return (
                        <div className="p-3 bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-800/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                            <p className="text-sm text-green-800 dark:text-green-300">
                              Package is compatible with table restrictions
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
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
                      <TableHead>Assignment ID</TableHead>
                      <TableHead>Table Number</TableHead>
                      <TableHead>Package Name</TableHead>
                      <TableHead>Package Type</TableHead>
                      <TableHead>Compatibility</TableHead>
                      <TableHead>Dietary Restrictions</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {tablePackageAssignments.map((assignment) => {
                        const compatibility = checkPackageCompatibility(assignment.packageId, assignment.tableId);
                        const tableRestrictions = getTableRestrictions(assignment.tableId);
                        const pkg = packages.find(p => (p.package_id || p.id) === assignment.packageId);
                        
                        // Get package restrictions
                        const packageRestrictions: any[] = [];
                        if (pkg && pkg.menu_items && Array.isArray(pkg.menu_items)) {
                          const restrictionSet = new Set<string>();
                          pkg.menu_items.forEach((item: any) => {
                            if (item.restriction_name && item.restriction_name !== 'None') {
                              if (!restrictionSet.has(item.restriction_name)) {
                                restrictionSet.add(item.restriction_name);
                                packageRestrictions.push({
                                  restriction_name: item.restriction_name,
                                  restriction_type: item.restriction_type || 'Dietary'
                                });
                              }
                            }
                          });
                        }
                        
                        // Get table info to ensure we have the latest data
                        const table = tables.find(t => (t.id || t.table_id) === (assignment.tableId || assignment.table_id));
                        const assignmentId = assignment.id || assignment.assignment_id || assignment.table_package_id || 'N/A';
                        const tableNumber = table?.tableNumber || table?.table_number || assignment.tableNumber || 'N/A';
                        const packageName = pkg?.package_name || pkg?.packageName || assignment.packageName || 'N/A';
                        const packageType = pkg?.package_type || pkg?.packageType || assignment.packageType || 'N/A';
                        const packageId = pkg?.package_id || pkg?.id || assignment.packageId || assignment.package_id || 'N/A';
                        
                        return (
                          <TableRow key={assignmentId || `assignment-${assignment.tableId}-${assignment.packageId}`}>
                            <TableCell className="font-medium text-xs text-muted-foreground">#{assignmentId}</TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {table && (() => {
                                  const category = table.category || table.table_category || '';
                                  if (!category) return null;
                                  const CategoryIcon = getTableCategoryIcon(category);
                                  if (!CategoryIcon) return null;
                                  return <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground" />;
                                })()}
                                <span>{tableNumber}</span>
                                <span className="text-xs text-muted-foreground">(ID: {assignment.tableId || assignment.table_id})</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{packageName}</span>
                                <Badge variant="outline" className="text-xs">ID: {packageId}</Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <PackageTypeBadge type={packageType || 'Standard'} className="text-xs" />
                            </TableCell>
                            <TableCell>
                              {compatibility.compatible ? (
                                <Badge variant="outline" className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 border-green-200 dark:border-green-700">
                                  <CheckCircle className="h-3 w-3 mr-1 dark:text-green-300" />
                                  Compatible
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900 text-amber-700 dark:text-amber-200 border-amber-200 dark:border-amber-700">
                                  <AlertTriangle className="h-3 w-3 mr-1 dark:text-amber-300" />
                                  {compatibility.conflicts.length} Conflict{compatibility.conflicts.length !== 1 ? 's' : ''}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1.5">
                                {/* Table Restrictions */}
                                <div>
                                  <span className="text-xs font-medium text-muted-foreground">Table:</span>
                                  {tableRestrictions.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {tableRestrictions.map((r: any) => {
                                        const Icon = getTypeIcon(r.restriction_type || '');
                                        return (
                                          <Badge 
                                            key={r.restriction_id || r.id} 
                                            variant="outline" 
                                            className={`text-xs ${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                                          >
                                            <Icon className="h-3 w-3" />
                                            {r.restriction_name || r.name}
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground ml-1">None</span>
                                  )}
                                </div>
                                {/* Package Restrictions */}
                                {packageRestrictions.length > 0 && (
                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Package:</span>
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {packageRestrictions.map((r: any, idx: number) => {
                                        const Icon = getTypeIcon(r.restriction_type || 'Dietary');
                                        return (
                                          <Badge 
                                            key={idx} 
                                            variant="outline" 
                                            className={`text-xs ${getTypeColor(r.restriction_type || 'Dietary')} border flex items-center gap-1`}
                                          >
                                            <Icon className="h-3 w-3" />
                                            {r.restriction_name}
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedTableForView(tables.find(t => (t.id || t.table_id) === assignment.tableId));
                                      setViewTableOpen(true);
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Table Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={async () => {
                                      try {
                                        await packagesAPI.removeFromTable(assignment.tableId, assignment.packageId);
                                        // Refresh assignments from API
                                        const assignmentsResponse = await packagesAPI.getTableAssignments(id || '0');
                                        if (assignmentsResponse && (assignmentsResponse.success || assignmentsResponse.data)) {
                                          const assignmentsData = assignmentsResponse.data || [];
                                          setTablePackageAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
                                        } else {
                                          setTablePackageAssignments(prev => prev.filter(a => a.id !== assignment.id));
                                        }
                                        
                                        // Refresh wedding data to update costs
                                        try {
                                          const weddingResponse = await weddingsAPI.getById(id || '0');
                                          if (weddingResponse && weddingResponse.success && weddingResponse.data) {
                                            setWedding(weddingResponse.data);
                                          }
                                        } catch (weddingError) {
                                          console.error('Error refreshing wedding data:', weddingError);
                                        }
                                        
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
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove Package
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
          </TabsContent>

          {/* Menu Items Tab */}
          <TabsContent value="menu-items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Menu items from assigned packages for this wedding</CardDescription>
              </CardHeader>
              <CardContent>
                {menuItemsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading menu items...</span>
                  </div>
                ) : (() => {
                  // Get all menu items from assigned packages
                  const menuItemsFromPackages: Map<number, any> = new Map();
                  let totalAllocations = 0;
                  
                  tablePackageAssignments.forEach(assignment => {
                    const pkg = packages.find(p => (p.package_id || p.id) === (assignment.packageId || assignment.package_id));
                    if (pkg && pkg.menu_items && Array.isArray(pkg.menu_items)) {
                      pkg.menu_items.forEach((mi: any) => {
                        const itemId = mi.menu_item_id || mi.id;
                        if (itemId) {
                          const quantity = mi.quantity || 1;
                          totalAllocations += quantity;
                          
                          if (!menuItemsFromPackages.has(itemId)) {
                            menuItemsFromPackages.set(itemId, {
                              ...mi,
                              menu_item_id: itemId,
                              // Ensure pricing fields are properly set with fallbacks
                              unit_cost: parseFloat(mi.unit_cost || mi.menu_cost || 0),
                              selling_price: parseFloat(mi.selling_price || mi.menu_price || 0),
                              menu_cost: parseFloat(mi.unit_cost || mi.menu_cost || 0), // Backward compatibility
                              menu_price: parseFloat(mi.selling_price || mi.menu_price || 0), // Backward compatibility
                              allocation_count: quantity,
                              tables: [{
                                table_id: assignment.tableId || assignment.table_id,
                                table_number: assignment.tableNumber || assignment.table_number,
                                package_id: assignment.packageId || assignment.package_id,
                                package_name: assignment.packageName || assignment.package_name
                              }]
                            });
                          } else {
                            const existing = menuItemsFromPackages.get(itemId)!;
                            existing.allocation_count += quantity;
                            // Update pricing if not already set
                            if (!existing.unit_cost && (mi.unit_cost || mi.menu_cost)) {
                              existing.unit_cost = parseFloat(mi.unit_cost || mi.menu_cost || 0);
                              existing.menu_cost = existing.unit_cost;
                            }
                            if (!existing.selling_price && (mi.selling_price || mi.menu_price)) {
                              existing.selling_price = parseFloat(mi.selling_price || mi.menu_price || 0);
                              existing.menu_price = existing.selling_price;
                            }
                            const tableInfo = {
                              table_id: assignment.tableId || assignment.table_id,
                              table_number: assignment.tableNumber || assignment.table_number,
                              package_id: assignment.packageId || assignment.package_id,
                              package_name: assignment.packageName || assignment.package_name
                            };
                            if (!existing.tables.find((t: any) => t.table_id === tableInfo.table_id && t.package_id === tableInfo.package_id)) {
                              existing.tables.push(tableInfo);
                            }
                          }
                        }
                      });
                    }
                  });
                  
                  const menuItemsList = Array.from(menuItemsFromPackages.values());
                  
                  if (menuItemsList.length === 0) {
                    return <p className="text-center text-muted-foreground py-4">No menu items from assigned packages. Assign packages to tables first.</p>;
                  }
                  
                  return (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item ID</TableHead>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Profit Margin</TableHead>
                            <TableHead>Allocation Count</TableHead>
                            <TableHead>Restrictions</TableHead>
                            <TableHead>Used In Tables/Packages</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {menuItemsList.map((item) => {
                            const restrictions = item.restriction_name ? [{ restriction_name: item.restriction_name, restriction_type: item.restriction_type }] : [];
                            const itemId = item.menu_item_id || item.id;
                            
                            return (
                              <TableRow key={itemId}>
                                <TableCell className="font-medium text-xs text-muted-foreground">#{itemId}</TableCell>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Utensils className="h-4 w-4 text-muted-foreground" />
                                    {item.menu_name || item.name}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {(() => {
                                    const menuType = item.menu_type || 'N/A';
                                    const typeLower = menuType.toLowerCase();
                                    let icon, colorClass;
                                    if (typeLower.includes('appetizer') || typeLower.includes('starter')) {
                                      icon = Utensils;
                                      colorClass = 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
                                    } else if (typeLower.includes('main') || typeLower.includes('entree')) {
                                      icon = UtensilsCrossed;
                                      colorClass = 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
                                    } else if (typeLower.includes('dessert')) {
                                      icon = Heart;
                                      colorClass = 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700';
                                    } else if (typeLower.includes('drink') || typeLower.includes('beverage')) {
                                      icon = Package;
                                      colorClass = 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
                                    } else {
                                      icon = Utensils;
                                      colorClass = 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
                                    }
                                    const IconComponent = icon;
                                    return (
                                      <Badge variant="outline" className={`${colorClass} border flex items-center gap-1`}>
                                        <IconComponent className="h-3 w-3" />
                                        {menuType}
                                      </Badge>
                                    );
                                  })()}
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(item.unit_cost || item.menu_cost || 0)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.selling_price || item.menu_price || 0)}</TableCell>
                                <TableCell className="text-right text-green-600">{formatCurrency((item.selling_price || item.menu_price || 0) - (item.unit_cost || item.menu_cost || 0))}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="font-semibold">
                                    {item.allocation_count || 0}x
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {restrictions.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {restrictions.map((r: any, idx: number) => {
                                        const Icon = getTypeIcon(r.restriction_type || '');
                                        return (
                                          <Badge
                                            key={idx}
                                            variant="outline"
                                            className={`text-xs ${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                                          >
                                            <Icon className="h-3 w-3" />
                                            {r.restriction_name}
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">None</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {item.tables && item.tables.length > 0 ? (
                                    <div className="flex flex-col gap-1">
                                      {item.tables.slice(0, 2).map((t: any, idx: number) => (
                                        <div key={idx} className="text-xs">
                                          <Badge variant="outline" className="text-xs">
                                            Table {t.table_number}
                                          </Badge>
                                          <span className="text-muted-foreground ml-1">({t.package_name} - ID: {t.package_id})</span>
                                        </div>
                                      ))}
                                      {item.tables.length > 2 && (
                                        <span className="text-xs text-muted-foreground">+{item.tables.length - 2} more</span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Not used</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Packages</CardTitle>
                <CardDescription>Packages assigned to tables for this wedding</CardDescription>
              </CardHeader>
              <CardContent>
                {packagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading packages...</span>
                  </div>
                ) : (() => {
                  // Only show packages that are assigned to tables
                  const assignedPackageIds = new Set(
                    tablePackageAssignments.map(a => a.packageId || a.package_id).filter(Boolean)
                  );
                  
                  const assignedPackages = packages.filter(pkg => {
                    const pkgId = pkg.package_id || pkg.id;
                    return pkgId && assignedPackageIds.has(pkgId);
                  });
                  
                  if (assignedPackages.length === 0) {
                    return <p className="text-center text-muted-foreground py-4">No packages assigned to tables yet. Assign packages to tables first.</p>;
                  }
                  
                  return (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Package ID</TableHead>
                            <TableHead>Package Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead>Menu Items</TableHead>
                            <TableHead>Assigned To Tables</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assignedPackages.map((pkg) => {
                            const pkgId = pkg.package_id || pkg.id;
                            const menuItemsList = pkg.menu_items || [];
                            // Find which tables use this package
                            const tablesUsingPackage = tablePackageAssignments
                              .filter(a => (a.packageId || a.package_id) === pkgId)
                              .map(a => {
                                const table = tables.find(t => (t.id || t.table_id) === (a.tableId || a.table_id));
                                return table ? {
                                  table_id: table.id || table.table_id,
                                  table_number: table.tableNumber || table.table_number,
                                  category: table.category || table.table_category
                                } : null;
                              })
                              .filter(Boolean);
                            
                            return (
                              <TableRow key={pkgId}>
                                <TableCell className="font-medium text-xs text-muted-foreground">#{pkgId}</TableCell>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    {pkg.package_name || pkg.packageName}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <PackageTypeBadge type={pkg.package_type || pkg.packageType || 'Standard'} />
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(pkg.selling_price || pkg.package_price || pkg.packagePrice || 0)}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {menuItemsList.length > 0 ? (
                                      menuItemsList.slice(0, 3).map((item: any, idx: number) => {
                                        const menuType = item.menu_type || '';
                                        const typeLower = menuType.toLowerCase();
                                        let menuIcon, menuColorClass;
                                        if (typeLower.includes('appetizer') || typeLower.includes('starter')) {
                                          menuIcon = Utensils;
                                          menuColorClass = 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
                                        } else if (typeLower.includes('main') || typeLower.includes('entree')) {
                                          menuIcon = UtensilsCrossed;
                                          menuColorClass = 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
                                        } else if (typeLower.includes('dessert')) {
                                          menuIcon = Heart;
                                          menuColorClass = 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700';
                                        } else if (typeLower.includes('drink') || typeLower.includes('beverage')) {
                                          menuIcon = Package;
                                          menuColorClass = 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
                                        } else {
                                          menuIcon = Utensils;
                                          menuColorClass = 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
                                        }
                                        const MenuIconComponent = menuIcon;
                                        const restrictionIcon = getTypeIcon(item.restriction_type || '');
                                        return (
                                          <Badge key={idx} variant="outline" className={`text-xs ${menuColorClass} border flex items-center gap-1`}>
                                            <MenuIconComponent className="h-3 w-3" />
                                            {item.menu_name || item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}
                                            {item.restriction_name && item.restriction_name !== 'None' && (() => {
                                              const RestrictionIcon = restrictionIcon;
                                              return (
                                                <span className="ml-1 flex items-center gap-0.5">
                                                  <RestrictionIcon className="h-2.5 w-2.5" />
                                                </span>
                                              );
                                            })()}
                                          </Badge>
                                        );
                                      })
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
                                  <div className="flex flex-col gap-1">
                                    {tablesUsingPackage.length > 0 ? (
                                      <>
                                        {tablesUsingPackage.slice(0, 2).map((t: any, idx: number) => (
                                          <div key={idx} className="flex items-center gap-1">
                                            <Badge variant="outline" className="text-xs">
                                              Table {t.table_number}
                                            </Badge>
                                            <TableCategoryBadge category={t.category || 'General'} className="text-xs" />
                                          </div>
                                        ))}
                                        {tablesUsingPackage.length > 2 && (
                                          <span className="text-xs text-muted-foreground">+{tablesUsingPackage.length - 2} more</span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">Not assigned</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedPackage(pkg);
                                          setViewPackageOpen(true);
                                        }}
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          // Find all assignments for this package and let user choose, or remove from first table
                                          const assignments = tablePackageAssignments.filter(
                                            a => (a.packageId || a.package_id) === pkgId
                                          );
                                          if (assignments.length > 0) {
                                            // For now, remove from first assignment. Could be enhanced to show a selection dialog
                                            setSelectedPackageAssignment(assignments[0]);
                                            setDeletePackageAssignmentOpen(true);
                                          }
                                        }}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove from Table
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
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Allocation Tab */}
          <TabsContent value="inventory-allocation" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Inventory Allocation</CardTitle>
                    <CardDescription>Allocate inventory items to this wedding</CardDescription>
                  </div>
                  <Button onClick={() => {
                    setAllocationFormData({ inventory_id: '', quantity_used: '', unit_rental_cost: '', rental_cost: '' });
                    setAllocationFormErrors({});
                    setAddAllocationOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Allocate Inventory
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {inventoryAllocationLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading allocations...</span>
                  </div>
                ) : inventoryAllocations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Warehouse className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No inventory allocated yet</p>
                    <p className="text-sm mt-2">Click "Allocate Inventory" to get started</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Quantity Used</TableHead>
                          <TableHead>Rental Cost (per unit)</TableHead>
                          <TableHead>Total Cost</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventoryAllocations.map((allocation) => (
                          <TableRow 
                            key={allocation.allocation_id}
                            className="cursor-pointer"
                            onDoubleClick={() => {
                              setSelectedAllocation(allocation);
                              setViewAllocationOpen(true);
                            }}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                                  <Warehouse className="h-4 w-4 text-primary dark:text-primary" />
                                </div>
                                {allocation.item_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getCategoryBadge(allocation.category)}
                            </TableCell>
                            <TableCell>
                              {getConditionBadge(allocation.item_condition)}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                <span>{allocation.quantity_used}</span>
                                {(() => {
                                  const item = availableInventoryItems.find(i => i.inventory_id === allocation.inventory_id);
                                  const stockAvailable = item?.quantity_available || 0;
                                  const remainingStock = stockAvailable - (allocation.quantity_used || 0);
                                  return (
                                    <span className={`text-xs ${remainingStock < 0 ? 'text-red-600 dark:text-red-400' : remainingStock < 5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}`}>
                                      Stock: {stockAvailable} (Remaining: {remainingStock})
                                    </span>
                                  );
                                })()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatCurrency((typeof (allocation.unit_rental_cost || allocation.rental_cost) === 'number' ? (allocation.unit_rental_cost || allocation.rental_cost) : parseFloat((allocation.unit_rental_cost || allocation.rental_cost || '0').toString()) || 0))}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(((allocation.quantity_used || 0) * (typeof (allocation.unit_rental_cost || allocation.rental_cost) === 'number' ? (allocation.unit_rental_cost || allocation.rental_cost) : parseFloat((allocation.unit_rental_cost || allocation.rental_cost || '0').toString()) || 0)))}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedAllocation(allocation);
                                      setViewAllocationOpen(true);
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditAllocation(allocation)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedAllocation(allocation);
                                      setDeleteAllocationOpen(true);
                                    }}
                                    className="text-destructive focus:text-destructive"
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
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-end">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Rental Cost</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(inventoryAllocations.reduce((sum, a) => {
                              const cost = (a.unit_rental_cost || a.rental_cost);
                              const costValue = typeof cost === 'number' ? cost : parseFloat(cost?.toString() || '0') || 0;
                              return sum + ((a.quantity_used || 0) * costValue);
                            }, 0))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Individual Table Dialog - Outside Tabs for proper rendering */}
        <Dialog open={viewTableOpen} onOpenChange={setViewTableOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTableForView ? `${selectedTableForView.tableNumber || selectedTableForView.table_number || 'Table'} - Details` : 'Table Details'}
              </DialogTitle>
              <DialogDescription>
                Complete information about this table including all guests, dietary restrictions, and seating information
              </DialogDescription>
            </DialogHeader>
            {selectedTableForView && (() => {
              const table = selectedTableForView;
              const tableId = table.id || table.table_id;
              const tableGuests = guests.filter(g => g && g.table_id === tableId);
              const isCoupleTable = (table.category || table.table_category || '').toLowerCase() === 'couple';
              const partnerCount = isCoupleTable ? 2 : 0;
              const assignedCount = tableGuests.length;
              const actualAssignedCount = assignedCount + partnerCount;
              const capacity = table.capacity || 0;
              const available = Math.max(0, capacity - actualAssignedCount);
              const partner1Name = wedding?.partner1 || wedding?.partner1_name || '';
              const partner2Name = wedding?.partner2 || wedding?.partner2_name || '';
              
              // Get all restrictions
              const allRestrictions = new Set<string>();
              const restrictionDetails: any[] = [];
              
              // From couple preferences if couple table
              if (isCoupleTable && coupleData && coupleData.preferences) {
                coupleData.preferences.forEach((pref: any) => {
                  if (pref.dietaryRestrictions && Array.isArray(pref.dietaryRestrictions)) {
                    pref.dietaryRestrictions.forEach((r: any) => {
                      if (r && r.restriction_name && r.restriction_name !== 'None') {
                        if (!allRestrictions.has(r.restriction_name)) {
                          allRestrictions.add(r.restriction_name);
                          restrictionDetails.push(r);
                        }
                      }
                    });
                  }
                });
              }
              
              // From all assigned guests
              tableGuests.forEach((guest: any) => {
                const restrictions = Array.isArray(guest.dietaryRestrictions) 
                  ? guest.dietaryRestrictions 
                  : guest.dietaryRestriction 
                    ? [{ restriction_name: guest.dietaryRestriction }] 
                    : [];
                restrictions.forEach((r: any) => {
                  if (r.restriction_name && r.restriction_name !== 'None') {
                    if (!allRestrictions.has(r.restriction_name)) {
                      allRestrictions.add(r.restriction_name);
                      restrictionDetails.push(r);
                    }
                  }
                });
              });
              
              return (
                <div className="space-y-6 py-4">
                  {/* Table Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Table Number</Label>
                      <p className="font-semibold">{table.tableNumber || table.table_number || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Table ID</Label>
                      <p className="font-semibold">{tableId || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Category</Label>
                      <div className="mt-1">{getTableCategoryBadge(table.category || table.table_category || '')}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Capacity</Label>
                      <p className="font-semibold">{capacity}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Assigned Guests</Label>
                      <p className="font-semibold">{actualAssignedCount}{isCoupleTable ? ' (includes couple)' : ''}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Available Seats</Label>
                      <p className="font-semibold">{available}</p>
                    </div>
                  </div>
                  
                  {/* Package Info */}
                  {getTablePackage(tableId) && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Assigned Package</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className="gap-1">
                          <Package className="w-3 h-3" />
                          {getTablePackage(tableId).packageName}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  {/* Dietary Restrictions */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Total Dietary Restrictions ({restrictionDetails.length})</Label>
                    {restrictionDetails.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {restrictionDetails.map((r, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className={`text-xs ${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                          >
                            {(() => {
                              const Icon = getTypeIcon(r.restriction_type || '');
                              return <Icon className="h-3 w-3" />;
                            })()}
                            {r.restriction_name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No dietary restrictions</p>
                    )}
                  </div>
                  
                  {/* Partners (if couple table) */}
                  {isCoupleTable && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-2">
                        <Heart className="h-3 w-3 text-pink-500 dark:text-pink-400" />
                        Seated Partners
                      </Label>
                      <div className="space-y-2">
                        <div className="p-2 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-medium dark:text-blue-100">Partner 1: {partner1Name || 'N/A'}</p>
                        </div>
                        <div className="p-2 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-medium dark:text-blue-100">Partner 2: {partner2Name || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* All Guests */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">All Guests at This Table ({tableGuests.length})</Label>
                    {tableGuests.length > 0 ? (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg p-3">
                        {tableGuests.map((guest: any) => {
                          const restrictions = Array.isArray(guest.dietaryRestrictions) 
                            ? guest.dietaryRestrictions 
                            : guest.dietaryRestriction 
                              ? [{ restriction_name: guest.dietaryRestriction }] 
                              : [];
                          const validRestrictions = restrictions.filter((r: any) => r.restriction_name && r.restriction_name !== 'None');
                          const rsvpStatus = guest.rsvpStatus || guest.rsvp_status || 'pending';
                          const rsvpIcon = rsvpStatus === 'accepted' ? <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" /> : 
                                           rsvpStatus === 'declined' ? <X className="h-3 w-3 text-red-600 dark:text-red-400" /> : 
                                           <Clock className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />;
                          const guestName = (guest.firstName || guest.name?.split(' ')[0] || '') + ' ' + (guest.lastName || guest.name?.split(' ').slice(1).join(' ') || '');
                          const guestId = guest.guest_id || guest.id;
                          const isPartner = (isCoupleTable && (
                            guestName.trim().includes(partner1Name) || guestName.trim().includes(partner2Name) ||
                            partner1Name.includes(guestName.trim()) || partner2Name.includes(guestName.trim())
                          ));
                          
                          return (
                            <div key={guest.id} className={`p-2 rounded border ${isPartner ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : 'bg-muted/30 border-border'}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {rsvpIcon}
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{guestName}</span>
                                    <span className="text-xs text-muted-foreground font-mono">Guest ID: #{guestId}</span>
                                  </div>
                                  {isPartner && (
                                    <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700">
                                      <Heart className="h-2 w-2 mr-1 text-pink-500 dark:text-pink-400" />
                                      Partner
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {validRestrictions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {validRestrictions.map((r: any, idx: number) => {
                                    const restrictionType = r.restriction_type || '';
                                    return (
                                      <Badge 
                                        key={r.restriction_id || r.restriction_name || `restriction-${idx}`} 
                                        variant="outline" 
                                        className={`text-xs ${getTypeColor(restrictionType)} border flex items-center gap-1`}
                                      >
                                        {(() => {
                                          const Icon = getTypeIcon(restrictionType);
                                          return <Icon className="h-3 w-3" />;
                                        })()}
                                        {r.restriction_name || r}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No guests assigned</p>
                    )}
                  </div>
                </div>
              );
            })()}
            <DialogFooter className="flex items-center justify-between sm:justify-between">
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedTableForView && window.confirm(`Are you sure you want to delete ${selectedTableForView.tableNumber || selectedTableForView.table_number || 'this table'}? This action cannot be undone.`)) {
                    handleDeleteTable(selectedTableForView.id || selectedTableForView.table_id);
                    setViewTableOpen(false);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Table
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedTableForView) {
                      handleEditTable(selectedTableForView);
                      setViewTableOpen(false);
                    }
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setViewTableOpen(false)}>
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                    <CeremonyTypeBadge type={wedding.ceremony_type} />
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
                        {(() => {
                          const Icon = getTypeIcon(r.restriction_type || '');
                          return <Icon className="h-3 w-3" />;
                        })()}
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
                  <Label htmlFor="edit_guest_count">Guest Count <span className="text-xs text-muted-foreground">(derived from guests)</span></Label>
                  <Input
                    id="edit_guest_count"
                    type="number"
                    value={editWeddingForm.guest_count}
                    disabled={true}
                    className="bg-muted cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_total_cost">Total Cost <span className="text-xs text-muted-foreground">(derived from packages & inventory)</span></Label>
                  <Input
                    id="edit_total_cost"
                    type="number"
                    step="0.01"
                    value={editWeddingForm.total_cost}
                    disabled={true}
                    className="bg-muted cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_production_cost">Production Cost <span className="text-xs text-muted-foreground">(derived from packages & inventory)</span></Label>
                  <Input
                    id="edit_production_cost"
                    type="number"
                    step="0.01"
                    value={editWeddingForm.production_cost}
                    disabled={true}
                    className="bg-muted cursor-not-allowed"
                    readOnly
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
                    value={editWeddingForm.preference_id || "preference-none"}
                    onValueChange={(value) => setEditWeddingForm({ ...editWeddingForm, preference_id: value === "preference-none" ? "" : value })}
                    disabled={editWeddingLoading}
                  >
                    <SelectTrigger id="edit_preference_id">
                      <SelectValue placeholder="Select preference (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preference-none">None</SelectItem>
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
                              {(() => {
                                const Icon = getTypeIcon(r.restriction_type || '');
                                return <Icon className="h-3 w-3" />;
                              })()}
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
                <Label htmlFor="edit_guest_restrictions">Dietary Restrictions</Label>
                <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                  <MultiSelectRestrictions
                    restrictions={dietaryRestrictions}
                    selectedIds={editGuestRestrictionIds}
                    onSelectionChange={setEditGuestRestrictionIds}
                    disabled={editGuestLoading}
                    placeholder="Select dietary restrictions"
                  />
                </div>
                <p className="text-xs text-muted-foreground">If no restrictions are selected, "None" will be automatically assigned</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_guest_rsvp">RSVP Status *</Label>
                <Select value={editGuestRsvpStatus} onValueChange={setEditGuestRsvpStatus} disabled={editGuestLoading}>
                  <SelectTrigger id="edit_guest_rsvp">
                    <SelectValue placeholder="Select RSVP status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span>Pending</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="accepted">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span>Accepted</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="declined">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span>Declined</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingGuest && editingGuest.table_id && (() => {
                const assignedTable = tables.find(t => (t.id || t.table_id) === editingGuest.table_id);
                return assignedTable ? (
                  <div className="space-y-2">
                    <Label>Assigned Table</Label>
                    <div className="p-2 rounded border bg-muted/30">
                      <Badge variant="outline" className="font-mono text-sm">
                        {assignedTable.tableNumber || assignedTable.table_number || `Table #${editingGuest.table_id}`}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">To change table assignment, use the Assign Guest feature in the Tables tab</p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditGuestOpen(false)} disabled={editGuestLoading}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditGuest} disabled={editGuestLoading || !editGuestFirstName.trim() || !editGuestLastName.trim()}>
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

        {/* Add Inventory Allocation Dialog */}
        <Dialog open={addAllocationOpen} onOpenChange={setAddAllocationOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Allocate Inventory</DialogTitle>
              <DialogDescription>
                Select an inventory item and specify the quantity to allocate to this wedding
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allocation_inventory_id">Inventory Item *</Label>
                <Select 
                  value={allocationFormData.inventory_id} 
                  onValueChange={(val) => {
                    setAllocationFormData({ ...allocationFormData, inventory_id: val });
                    const selectedItem = availableInventoryItems.find(item => 
                      item.inventory_id?.toString() === val
                    );
                    if (selectedItem) {
                      setAllocationFormData(prev => ({
                        ...prev,
                        inventory_id: val,
                        unit_rental_cost: (selectedItem.unit_rental_cost || selectedItem.rental_cost)?.toString() || '',
                        rental_cost: selectedItem.rental_cost?.toString() || ''
                      }));
                    }
                  }}
                  disabled={allocationFormLoading}
                >
                  <SelectTrigger id="allocation_inventory_id" className={allocationFormErrors.inventory_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select an inventory item" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInventoryItems.map((item) => (
                      <SelectItem key={item.inventory_id} value={item.inventory_id ? item.inventory_id.toString() : `inventory-${item.item_name || 'unknown'}`}>
                        {item.item_name} - {item.category} ({item.quantity_available} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {allocationFormErrors.inventory_id && (
                  <p className="text-sm text-red-500">{allocationFormErrors.inventory_id}</p>
                )}
                {allocationFormData.inventory_id && (() => {
                  const selectedItem = availableInventoryItems.find(item => 
                    item.inventory_id?.toString() === allocationFormData.inventory_id
                  );
                  return selectedItem ? (
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      <p><strong>Available:</strong> {selectedItem.quantity_available}</p>
                      <p><strong>Condition:</strong> {selectedItem.item_condition}</p>
                      <p><strong>Default Rental Cost:</strong> {formatCurrency((typeof (selectedItem.unit_rental_cost || selectedItem.rental_cost) === 'number' ? (selectedItem.unit_rental_cost || selectedItem.rental_cost) : parseFloat((selectedItem.unit_rental_cost || selectedItem.rental_cost || '0').toString()) || 0))} per unit</p>
                    </div>
                  ) : null;
                })()}
              </div>
              <div className="space-y-2">
                <Label htmlFor="allocation_quantity">Quantity Used *</Label>
                <Input
                  id="allocation_quantity"
                  type="number"
                  min="1"
                  value={allocationFormData.quantity_used}
                  onChange={(e) => {
                    const qty = e.target.value;
                    setAllocationFormData({ ...allocationFormData, quantity_used: qty });
                    if (allocationFormData.inventory_id) {
                      const selectedItem = availableInventoryItems.find(item => 
                        item.inventory_id?.toString() === allocationFormData.inventory_id
                      );
                      if (selectedItem && qty) {
                        const total = parseFloat(qty) * (selectedItem.unit_rental_cost || selectedItem.rental_cost || 0);
                        // Don't auto-update rental_cost if user has manually set it
                      }
                    }
                  }}
                  className={allocationFormErrors.quantity_used ? 'border-red-500' : ''}
                  disabled={allocationFormLoading}
                  placeholder="Enter quantity"
                />
                {allocationFormErrors.quantity_used && (
                  <p className="text-sm text-red-500">{allocationFormErrors.quantity_used}</p>
                )}
                {allocationFormData.inventory_id && allocationFormData.quantity_used && (() => {
                  const selectedItem = availableInventoryItems.find(item => 
                    item.inventory_id?.toString() === allocationFormData.inventory_id
                  );
                  if (selectedItem) {
                    const qty = parseInt(allocationFormData.quantity_used) || 0;
                    const cost = parseFloat(allocationFormData.unit_rental_cost || allocationFormData.rental_cost || (selectedItem.unit_rental_cost || selectedItem.rental_cost)?.toString() || '0');
                    const total = qty * cost;
                    const stockAvailable = selectedItem.quantity_available || 0;
                    const canAllocate = qty <= stockAvailable;
                    return (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Total cost: <strong>{formatCurrency(total)}</strong> ({qty} × {formatCurrency(cost)})
                        </p>
                        <p className={`text-xs ${canAllocate ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {canAllocate 
                            ? `✓ Can allocate ${qty} (${stockAvailable} available)` 
                            : `✗ Cannot allocate ${qty} (only ${stockAvailable} available)`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="space-y-2">
                <Label htmlFor="allocation_rental_cost">Rental Cost (per unit) *</Label>
                <Input
                  id="allocation_rental_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={allocationFormData.unit_rental_cost || allocationFormData.rental_cost}
                  onChange={(e) => setAllocationFormData({ ...allocationFormData, unit_rental_cost: e.target.value, rental_cost: e.target.value })}
                  disabled={allocationFormLoading}
                  placeholder="Enter rental cost per unit"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use default rental cost from inventory item
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddAllocationOpen(false)} disabled={allocationFormLoading}>
                Cancel
              </Button>
              <Button onClick={handleAddAllocation} disabled={allocationFormLoading}>
                {allocationFormLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Allocating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Allocate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Inventory Allocation Dialog */}
        <Dialog open={editAllocationOpen} onOpenChange={setEditAllocationOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Inventory Allocation</DialogTitle>
              <DialogDescription>
                Update the quantity or rental cost for this allocation
              </DialogDescription>
            </DialogHeader>
            {selectedAllocation && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedAllocation.item_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAllocation.category} • {selectedAllocation.item_condition}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_allocation_quantity">Quantity Used *</Label>
                  <Input
                    id="edit_allocation_quantity"
                    type="number"
                    min="1"
                    value={allocationFormData.quantity_used}
                    onChange={(e) => setAllocationFormData({ ...allocationFormData, quantity_used: e.target.value })}
                    className={allocationFormErrors.quantity_used ? 'border-red-500' : ''}
                    disabled={allocationFormLoading}
                  />
                  {allocationFormErrors.quantity_used && (
                    <p className="text-sm text-red-500">{allocationFormErrors.quantity_used}</p>
                  )}
                  {(() => {
                    const selectedItem = availableInventoryItems.find(item => 
                      item.inventory_id?.toString() === selectedAllocation.inventory_id?.toString()
                    );
                    if (selectedItem) {
                      const currentQty = selectedAllocation.quantity_used || 0;
                      const effectiveAvailable = selectedItem.quantity_available + currentQty;
                      return (
                        <p className="text-xs text-muted-foreground">
                          Available: {effectiveAvailable} (including current allocation)
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_allocation_rental_cost">Rental Cost (per unit) *</Label>
                  <Input
                    id="edit_allocation_rental_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={allocationFormData.unit_rental_cost || allocationFormData.rental_cost}
                    onChange={(e) => setAllocationFormData({ ...allocationFormData, unit_rental_cost: e.target.value, rental_cost: e.target.value })}
                    disabled={allocationFormLoading}
                  />
                </div>
                {allocationFormData.quantity_used && allocationFormData.rental_cost && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Total Cost:</strong> {formatCurrency((
                        (parseInt(allocationFormData.quantity_used) || 0) * 
                        (parseFloat(allocationFormData.rental_cost) || 0)
                      ))}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setEditAllocationOpen(false);
                setSelectedAllocation(null);
              }} disabled={allocationFormLoading}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditAllocation} disabled={allocationFormLoading}>
                {allocationFormLoading ? (
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

        {/* View Inventory Allocation Dialog */}
        <Dialog open={viewAllocationOpen} onOpenChange={setViewAllocationOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Inventory Allocation Details</DialogTitle>
              <DialogDescription>
                Complete information about this inventory allocation
              </DialogDescription>
            </DialogHeader>
            {selectedAllocation && (() => {
              const item = availableInventoryItems.find(i => i.inventory_id === selectedAllocation.inventory_id);
              const cost = (selectedAllocation.unit_rental_cost || selectedAllocation.rental_cost);
              const costValue = typeof cost === 'number' ? cost : parseFloat(cost?.toString() || '0') || 0;
              const totalCost = (selectedAllocation.quantity_used || 0) * costValue;
              const stockAvailable = item?.quantity_available || 0;
              const remainingStock = stockAvailable - (selectedAllocation.quantity_used || 0);
              return (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Item Name</Label>
                      <p className="font-semibold">{selectedAllocation.item_name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Category</Label>
                      <div className="mt-1">{getCategoryBadge(selectedAllocation.category)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Condition</Label>
                      <div className="mt-1">{getConditionBadge(selectedAllocation.item_condition)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Quantity Used</Label>
                      <p className="font-semibold">{selectedAllocation.quantity_used}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Rental Cost (per unit)</Label>
                      <p className="font-semibold">{formatCurrency((typeof (selectedAllocation.unit_rental_cost || selectedAllocation.rental_cost) === 'number' ? (selectedAllocation.unit_rental_cost || selectedAllocation.rental_cost) : parseFloat((selectedAllocation.unit_rental_cost || selectedAllocation.rental_cost || '0').toString()) || 0))}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Total Cost</Label>
                      <p className="font-semibold text-lg">{formatCurrency(totalCost)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Stock Available</Label>
                      <p className="font-semibold">{stockAvailable}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Remaining Stock</Label>
                      <p className={`font-semibold ${remainingStock < 0 ? 'text-red-600 dark:text-red-400' : remainingStock < 5 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                        {remainingStock}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewAllocationOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Package Dialog */}
        <Dialog open={viewPackageOpen} onOpenChange={setViewPackageOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Package Details</DialogTitle>
              <DialogDescription>Complete information about this package</DialogDescription>
            </DialogHeader>
            {selectedPackage && (() => {
              const pkgId = selectedPackage.package_id || selectedPackage.id;
              const menuItemsList = selectedPackage.menu_items || [];
              const tablesUsingPackage = tablePackageAssignments
                .filter(a => (a.packageId || a.package_id) === pkgId)
                .map(a => {
                  const table = tables.find(t => (t.id || t.table_id) === (a.tableId || a.table_id));
                  return table ? {
                    table_id: table.id || table.table_id,
                    table_number: table.tableNumber || table.table_number,
                    category: table.category || table.table_category
                  } : null;
                })
                .filter(Boolean);
              
              return (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Package ID</Label>
                      <p className="font-semibold">#{pkgId}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Package Name</Label>
                      <p className="font-semibold">{selectedPackage.package_name || selectedPackage.packageName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Package Type</Label>
                      <div className="mt-1">
                        <PackageTypeBadge type={selectedPackage.package_type || selectedPackage.packageType || 'Standard'} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Package Price</Label>
                      <p className="font-semibold">{formatCurrency(selectedPackage.package_price || selectedPackage.packagePrice || 0)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Menu Items ({menuItemsList.length})</Label>
                    {menuItemsList.length > 0 ? (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {menuItemsList.map((item: any, idx: number) => {
                          const menuType = item.menu_type || '';
                          const typeLower = menuType.toLowerCase();
                          let menuIcon, menuColorClass;
                          if (typeLower.includes('appetizer') || typeLower.includes('starter')) {
                            menuIcon = Utensils;
                            menuColorClass = 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
                          } else if (typeLower.includes('main') || typeLower.includes('entree')) {
                            menuIcon = UtensilsCrossed;
                            menuColorClass = 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
                          } else if (typeLower.includes('dessert')) {
                            menuIcon = Heart;
                            menuColorClass = 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700';
                          } else if (typeLower.includes('drink') || typeLower.includes('beverage')) {
                            menuIcon = Package;
                            menuColorClass = 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
                          } else {
                            menuIcon = Utensils;
                            menuColorClass = 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
                          }
                          const MenuIconComponent = menuIcon;
                          const restrictionIcon = getTypeIcon(item.restriction_type || '');
                          return (
                            <div key={idx} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <MenuIconComponent className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{item.menu_name || item.name}</span>
                                  {item.quantity > 1 && (
                                    <Badge variant="outline" className="text-xs">x{item.quantity}</Badge>
                                  )}
                                </div>
                                <Badge variant="outline" className={`${menuColorClass} border flex items-center gap-1`}>
                                  <MenuIconComponent className="h-3 w-3" />
                                  {menuType}
                                </Badge>
                              </div>
                              {item.restriction_name && item.restriction_name !== 'None' && (() => {
                                const RestrictionIcon = restrictionIcon;
                                return (
                                  <div className="mt-2">
                                    <Badge variant="outline" className={`text-xs ${getTypeColor(item.restriction_type || '')} border flex items-center gap-1`}>
                                      <RestrictionIcon className="h-3 w-3" />
                                      {item.restriction_name}
                                    </Badge>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No menu items</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Assigned To Tables ({tablesUsingPackage.length})</Label>
                    {tablesUsingPackage.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {tablesUsingPackage.map((t: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              Table {t.table_number}
                            </Badge>
                            <TableCategoryBadge category={t.category || 'General'} className="text-xs" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not assigned to any tables</p>
                    )}
                  </div>
                </div>
              );
            })()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewPackageOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Package Assignment Dialog */}
        <Dialog open={deletePackageAssignmentOpen} onOpenChange={setDeletePackageAssignmentOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Remove Package from Table</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this package from the table? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedPackageAssignment && (() => {
              const table = tables.find(t => (t.id || t.table_id) === (selectedPackageAssignment.tableId || selectedPackageAssignment.table_id));
              const pkg = packages.find(p => (p.package_id || p.id) === (selectedPackageAssignment.packageId || selectedPackageAssignment.package_id));
              return (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{pkg?.package_name || pkg?.packageName || 'Package'}</p>
                  <p className="text-sm text-muted-foreground">
                    Table: {table?.tableNumber || table?.table_number || 'Unknown'}
                  </p>
                </div>
              );
            })()}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setDeletePackageAssignmentOpen(false);
                setSelectedPackageAssignment(null);
              }} disabled={packageFormLoading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemovePackageAssignment} disabled={packageFormLoading}>
                {packageFormLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Inventory Allocation Dialog */}
        <Dialog open={deleteAllocationOpen} onOpenChange={setDeleteAllocationOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Inventory Allocation</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this inventory allocation? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedAllocation && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedAllocation.item_name}</p>
                <p className="text-sm text-muted-foreground">
                  Quantity: {selectedAllocation.quantity_used} • 
                  Total Cost: {formatCurrency((() => {
                    const cost = (selectedAllocation.unit_rental_cost || selectedAllocation.rental_cost);
                    const costValue = typeof cost === 'number' ? cost : parseFloat(cost?.toString() || '0') || 0;
                    return (selectedAllocation.quantity_used || 0) * costValue;
                  })())}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setDeleteAllocationOpen(false);
                setSelectedAllocation(null);
              }} disabled={allocationFormLoading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAllocation} disabled={allocationFormLoading}>
                {allocationFormLoading ? (
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


