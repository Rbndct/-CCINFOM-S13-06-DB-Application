import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Phone,
  Mail,
  User,
  Calendar,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Users,
  Clock,
  MoreHorizontal,
  Eye,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock as ClockIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { couplesAPI, dietaryRestrictionsAPI, guestsAPI } from '@/api';
import { useCurrencyFormat } from '@/utils/currency';
import { getTypeIcon, getTypeColor, getSeverityBadge, getNoneRestrictionId, ensureNoneRestriction, filterNoneFromDisplay } from '@/utils/restrictionUtils';
import { CeremonyTypeBadge } from '@/utils/ceremonyTypeUtils';
import { useDateFormat } from '@/context/DateFormatContext';
import { useTimeFormat } from '@/context/TimeFormatContext';

type Couple = {
  couple_id: number;
  partner1_name: string;
  partner2_name: string;
  partner1_phone: string;
  partner2_phone: string;
  partner1_email: string;
  partner2_email: string;
  planner_contact: string;
  preferences?: Preference[];
};

type DietaryRestriction = {
  restriction_id: number;
  restriction_name: string;
  restriction_type?: string;
  severity_level?: string;
};

type Preference = {
  preference_id: number;
  couple_id: number;
  ceremony_type: string;
  dietaryRestrictions: DietaryRestriction[];
  // Legacy support for old data format
  restriction_id?: number;
  restriction_name?: string;
  restriction_type?: string;
  severity_level?: string;
};

type Wedding = {
  id: number;
  couple_id: number;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  guestCount: number;
  totalCost: number;
  productionCost: number;
  paymentStatus: string;
  preference_id?: number;
  pref_id?: number;
  ceremony_type?: string;
  restriction_name?: string;
  restrictions?: Array<{
    restriction_id: number;
    restriction_name: string;
    restriction_type: string;
    severity_level: string;
  }>;
  all_restrictions?: Array<{
    restriction_id: number;
    restriction_name: string;
    restriction_type: string;
    severity_level: string;
  }>;
};

const CoupleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { formatDate } = useDateFormat();
  const { formatTime } = useTimeFormat();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatCurrency } = useCurrencyFormat();
  const [couple, setCouple] = useState<Couple | null>(null);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferenceDialogOpen, setPreferenceDialogOpen] = useState(false);
  const [editingPreference, setEditingPreference] = useState<Preference | null>(null);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<any[]>([]);
  const [noneRestrictionId, setNoneRestrictionId] = useState<number | null>(null);
  const [preferenceForm, setPreferenceForm] = useState({
    ceremony_type: '',
    restriction_ids: [] as number[]
  });
  const [preferenceLoading, setPreferenceLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    partner1_name: '',
    partner2_name: '',
    partner1_phone: '',
    partner2_phone: '',
    partner1_email: '',
    partner2_email: '',
    planner_contact: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [preferenceFilter, setPreferenceFilter] = useState<string>('all');
  const [preferenceSearch, setPreferenceSearch] = useState('');
  const [viewingPreference, setViewingPreference] = useState<Preference | null>(null);
  const [viewPreferenceOpen, setViewPreferenceOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCouple();
      fetchWeddings();
      fetchDietaryRestrictions();
    }
  }, [id]);

  const fetchCouple = async () => {
    try {
      const response = await couplesAPI.getById(id!);
      setCouple(response.data);
      // Initialize edit form with current data
      setEditForm({
        partner1_name: response.data.partner1_name || '',
        partner2_name: response.data.partner2_name || '',
        partner1_phone: response.data.partner1_phone || '',
        partner2_phone: response.data.partner2_phone || '',
        partner1_email: response.data.partner1_email || '',
        partner2_email: response.data.partner2_email || '',
        planner_contact: response.data.planner_contact || ''
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load couple',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm.partner1_name.trim() || !editForm.partner2_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Partner names are required',
        variant: 'destructive',
      });
      return;
    }

    setEditLoading(true);
    try {
      await couplesAPI.update(parseInt(id!), editForm);
      toast({ title: 'Couple updated successfully' });
      setIsEditing(false);
      await fetchCouple();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update couple',
        variant: 'destructive',
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (couple) {
      setEditForm({
        partner1_name: couple.partner1_name || '',
        partner2_name: couple.partner2_name || '',
        partner1_phone: couple.partner1_phone || '',
        partner2_phone: couple.partner2_phone || '',
        partner1_email: couple.partner1_email || '',
        partner2_email: couple.partner2_email || '',
        planner_contact: couple.planner_contact || ''
      });
    }
    setIsEditing(false);
  };

  const fetchWeddings = async () => {
    try {
      const response = await couplesAPI.getWeddings(id!);
      const weddingsData = response.data || [];
      
      // Fetch actual guest counts for each wedding
      const weddingsWithGuestCounts = await Promise.all(weddingsData.map(async (wedding: any) => {
        try {
          const guestsResponse = await guestsAPI.getAll({ wedding_id: wedding.id || wedding.wedding_id });
          const guestCount = (guestsResponse.data || []).length;
          return {
            ...wedding,
            guestCount: guestCount,
            guest_count: guestCount
          };
        } catch (e) {
          // Fallback to existing guest_count if fetch fails
          const fallbackCount = wedding.guest_count || wedding.guestCount || 0;
          return {
            ...wedding,
            guestCount: fallbackCount,
            guest_count: fallbackCount
          };
        }
      }));
      
      setWeddings(weddingsWithGuestCounts);
    } catch (error: any) {
      console.error('Error fetching weddings:', error);
    }
  };

  const fetchDietaryRestrictions = async () => {
    try {
      const response = await dietaryRestrictionsAPI.getAll();
      const allRestrictions = response.data || [];
      
      // Get and store the "None" restriction ID using utility function
      const noneId = getNoneRestrictionId(allRestrictions);
      setNoneRestrictionId(noneId);
      
      // Filter out "None" from the displayed list using utility function
      const displayableRestrictions = filterNoneFromDisplay(allRestrictions);
      setDietaryRestrictions(displayableRestrictions);
    } catch (error: any) {
      console.error('Error fetching dietary restrictions:', error);
    }
  };

  const handleAddPreference = () => {
    setEditingPreference(null);
    setPreferenceForm({ ceremony_type: '', restriction_ids: [] });
    setPreferenceDialogOpen(true);
  };

  const handleEditPreference = (pref: Preference) => {
    setEditingPreference(pref);
    // Extract restriction IDs from dietaryRestrictions array or legacy restriction_id
    // Filter out "None" from the displayed selection
    const allRestrictionIds = pref.dietaryRestrictions && pref.dietaryRestrictions.length > 0
      ? pref.dietaryRestrictions.map(r => r.restriction_id)
      : (pref.restriction_id ? [pref.restriction_id] : []);
    
    // Filter out "None" restriction ID for display
    const displayableIds = noneRestrictionId 
      ? allRestrictionIds.filter(id => id !== noneRestrictionId)
      : allRestrictionIds;
    
    setPreferenceForm({
      ceremony_type: pref.ceremony_type,
      restriction_ids: displayableIds
    });
    setPreferenceDialogOpen(true);
  };

  const handleSavePreference = async () => {
    if (!preferenceForm.ceremony_type) {
      toast({
        title: 'Validation Error',
        description: 'Please select a ceremony type',
        variant: 'destructive',
      });
      return;
    }

    // Auto-assign "None" if no restrictions selected using utility function
    const finalRestrictionIds = ensureNoneRestriction(preferenceForm.restriction_ids, noneRestrictionId);
    
    // If no restrictions selected and "None" ID not found, show error
    if (finalRestrictionIds.length === 0) {
        toast({
          title: 'Validation Error',
        description: 'Unable to assign default restriction. Please try again.',
          variant: 'destructive',
        });
        return;
    }

    setPreferenceLoading(true);
    try {
      if (editingPreference) {
        // Update existing preference with array of restriction IDs
        await couplesAPI.updatePreference(editingPreference.preference_id, {
          ceremony_type: preferenceForm.ceremony_type,
          restriction_ids: finalRestrictionIds
        });
        const displayCount = preferenceForm.restriction_ids.length || 1;
        toast({ 
          title: 'Preference updated successfully',
          description: `Updated with ${displayCount} dietary restriction(s)`
        });
      } else {
        // Create a single preference with array of restriction IDs
        await couplesAPI.createPreference({
          couple_id: parseInt(id!),
          ceremony_type: preferenceForm.ceremony_type,
          restriction_ids: finalRestrictionIds
        });
        const displayCount = preferenceForm.restriction_ids.length || 1;
        toast({ 
          title: 'Preference created successfully',
          description: `Created with ${displayCount} dietary restriction(s)`
        });
      }
      setPreferenceDialogOpen(false);
      await fetchCouple();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save preference',
        variant: 'destructive',
      });
    } finally {
      setPreferenceLoading(false);
    }
  };

  const handleDeletePreference = async (prefId: number) => {
    if (!confirm('Delete this preference? This cannot be undone if it is used by any weddings.')) {
      return;
    }
    try {
      await couplesAPI.deletePreference(prefId);
      toast({ title: 'Preference deleted successfully' });
      await fetchCouple();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete preference',
        variant: 'destructive',
      });
    }
  };

  const getWeddingCountForPreference = (prefId: number) => {
    // Count distinct weddings that use this preference
    const matchingWeddings = weddings.filter(w => 
      (w.preference_id === prefId || w.pref_id === prefId)
    );
    return new Set(matchingWeddings.map(w => w.id)).size; // Use Set to ensure distinct
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading couple details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!couple) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Couple not found</p>
            <Button onClick={() => navigate('/dashboard/couples')} className="mt-4">
              Back to Couples
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/couples')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Couples
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {couple.partner1_name} & {couple.partner2_name}
              </h1>
              <p className="text-muted-foreground">Couple Details</p>
            </div>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Couple Data
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelEdit} disabled={editLoading}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={editLoading}>
                {editLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Couple Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Partner details and planner email</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Partner 1
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="edit_partner1_name">Name *</Label>
                          <Input
                            id="edit_partner1_name"
                            value={editForm.partner1_name}
                            onChange={(e) => setEditForm({ ...editForm, partner1_name: e.target.value })}
                            disabled={editLoading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit_partner1_phone">Phone</Label>
                          <Input
                            id="edit_partner1_phone"
                            value={editForm.partner1_phone}
                            onChange={(e) => setEditForm({ ...editForm, partner1_phone: e.target.value })}
                            disabled={editLoading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit_partner1_email">Email</Label>
                          <Input
                            id="edit_partner1_email"
                            type="email"
                            value={editForm.partner1_email}
                            onChange={(e) => setEditForm({ ...editForm, partner1_email: e.target.value })}
                            disabled={editLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Partner 2
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="edit_partner2_name">Name *</Label>
                          <Input
                            id="edit_partner2_name"
                            value={editForm.partner2_name}
                            onChange={(e) => setEditForm({ ...editForm, partner2_name: e.target.value })}
                            disabled={editLoading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit_partner2_phone">Phone</Label>
                          <Input
                            id="edit_partner2_phone"
                            value={editForm.partner2_phone}
                            onChange={(e) => setEditForm({ ...editForm, partner2_phone: e.target.value })}
                            disabled={editLoading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit_partner2_email">Email</Label>
                          <Input
                            id="edit_partner2_email"
                            type="email"
                            value={editForm.partner2_email}
                            onChange={(e) => setEditForm({ ...editForm, partner2_email: e.target.value })}
                            disabled={editLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t">
                  <div>
                    <Label htmlFor="edit_planner_contact">Planner Email</Label>
                    <Input
                      id="edit_planner_contact"
                      type="email"
                      value={editForm.planner_contact}
                      onChange={(e) => setEditForm({ ...editForm, planner_contact: e.target.value })}
                      disabled={editLoading}
                      placeholder="planner@example.com"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Partner 1
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Name:</span>
                        <span>{couple.partner1_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{couple.partner1_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{couple.partner1_email}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Partner 2
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Name:</span>
                        <span>{couple.partner2_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{couple.partner2_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{couple.partner2_email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!isEditing && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Planner Email:</span>
                  <span>{couple.planner_contact || 'N/A'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Ceremony types and dietary restrictions</CardDescription>
              </div>
              <Button onClick={handleAddPreference} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Preference
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {couple.preferences && couple.preferences.length > 0 ? (
              <>
                {/* Filter and Search */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search preferences..."
                      value={preferenceSearch}
                      onChange={(e) => setPreferenceSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={preferenceFilter} onValueChange={setPreferenceFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Preferences</SelectItem>
                      <SelectItem value="with-restrictions">With Restrictions</SelectItem>
                      <SelectItem value="no-restrictions">No Restrictions</SelectItem>
                      <SelectItem value="used">Used in Weddings</SelectItem>
                      <SelectItem value="unused">Not Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  {couple.preferences
                    .filter((pref) => {
                      const restrictions = pref.dietaryRestrictions && pref.dietaryRestrictions.length > 0
                        ? pref.dietaryRestrictions
                        : (pref.restriction_id ? [{
                            restriction_id: pref.restriction_id,
                            restriction_name: pref.restriction_name || 'Unknown',
                            restriction_type: pref.restriction_type,
                            severity_level: pref.severity_level
                          }] : []);
                      
                      // Search filter
                      if (preferenceSearch) {
                        const searchLower = preferenceSearch.toLowerCase();
                        const matchesSearch = 
                          pref.ceremony_type.toLowerCase().includes(searchLower) ||
                          restrictions.some(r => (r.restriction_name || '').toLowerCase().includes(searchLower));
                        if (!matchesSearch) return false;
                      }
                      
                      // Category filter
                      if (preferenceFilter === 'with-restrictions') {
                        return restrictions.length > 0;
                      } else if (preferenceFilter === 'no-restrictions') {
                        return restrictions.length === 0;
                      } else if (preferenceFilter === 'used') {
                        return getWeddingCountForPreference(pref.preference_id) > 0;
                      } else if (preferenceFilter === 'unused') {
                        return getWeddingCountForPreference(pref.preference_id) === 0;
                      }
                      
                      return true;
                    })
                    .map((pref) => {
                  // Handle both new format (dietaryRestrictions array) and legacy format
                  const restrictions = pref.dietaryRestrictions && pref.dietaryRestrictions.length > 0
                    ? pref.dietaryRestrictions
                    : (pref.restriction_id ? [{
                        restriction_id: pref.restriction_id,
                        restriction_name: pref.restriction_name || 'Unknown',
                        restriction_type: pref.restriction_type,
                        severity_level: pref.severity_level
                      }] : []);
                  
                  return (
                    <div
                      key={pref.preference_id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onDoubleClick={() => {
                        setViewingPreference(pref);
                        setViewPreferenceOpen(true);
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            Pref ID: {pref.preference_id}
                          </Badge>
                          <CeremonyTypeBadge type={pref.ceremony_type} />
                          <Badge variant="secondary" className="text-xs">
                            {restrictions.length} restriction{restrictions.length !== 1 ? 's' : ''}
                          </Badge>
                          {getWeddingCountForPreference(pref.preference_id) > 0 && (
                            <span className="text-sm text-muted-foreground">
                              Used by {getWeddingCountForPreference(pref.preference_id)} wedding(s)
                            </span>
                          )}
                        </div>
                        {restrictions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {restrictions.map((restriction) => {
                              const restrictionName = restriction.restriction_name || '';
                              const restrictionType = restriction.restriction_type || '';
                              const restrictionId = restriction.restriction_id;
                              return (
                                <Badge 
                                  key={restrictionId} 
                                  variant="outline"
                                  className={`text-xs ${getTypeColor(restrictionType)} border flex items-center gap-1`}
                                >
                                  {(() => {
                                    const Icon = getTypeIcon(restrictionType);
                                    return <Icon className="h-3 w-3" />;
                                  })()}
                                  {restrictionName}
                                  {restriction.severity_level && (
                                    <span className="text-xs ml-1">- {restriction.severity_level}</span>
                                  )}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No dietary restrictions</span>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingPreference(pref);
                              setViewPreferenceOpen(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPreference(pref);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePreference(pref.preference_id);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No preferences added yet</p>
                <Button onClick={handleAddPreference} variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Preference
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weddings Section */}
        <Card>
          <CardHeader>
            <CardTitle>Weddings</CardTitle>
            <CardDescription>All weddings for this couple</CardDescription>
          </CardHeader>
          <CardContent>
            {weddings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {weddings.map((wedding) => (
                  <Card
                    key={wedding.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/dashboard/weddings/${wedding.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {formatDate(new Date(wedding.weddingDate))}
                        </CardTitle>
                        <Badge variant={wedding.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {wedding.paymentStatus === 'pending' ? 'Pending' : wedding.paymentStatus.charAt(0).toUpperCase() + wedding.paymentStatus.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{(() => {
                          const time = wedding.weddingTime;
                          if (!time) return 'N/A';
                          try {
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
                        })()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{wedding.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{wedding.guestCount ?? wedding.guest_count ?? 0} guests</span>
                      </div>
                      <div className="space-y-1 pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Cost:</span>
                          <span className="font-semibold">{formatCurrency(wedding.total_cost || wedding.totalCost || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Production Cost:</span>
                          <span className="font-semibold">{formatCurrency(wedding.production_cost || wedding.productionCost || 0)}</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        {(() => {
                          const status = wedding.payment_status || wedding.paymentStatus || 'pending';
                          const statusLower = status.toLowerCase();
                          if (statusLower === 'paid') {
                            return (
                              <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Paid
                              </Badge>
                            );
                          } else if (statusLower === 'pending') {
                            return (
                              <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700 flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                Pending
                              </Badge>
                            );
                          } else {
                            return (
                              <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700 flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Badge>
                            );
                          }
                        })()}
                      </div>
                      {wedding.ceremony_type && (
                        <div className="mt-2">
                          <CeremonyTypeBadge type={wedding.ceremony_type} className="mb-2" />
                          {(() => {
                            const restrictions = wedding.all_restrictions || wedding.restrictions || [];
                            return restrictions.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {restrictions.map((r: any) => (
                                  <Badge 
                                    key={r.restriction_id} 
                                    className={`${getTypeColor(r.restriction_type || '')} border text-xs flex items-center gap-1`}
                                  >
                                    {(() => {
                                      const Icon = getTypeIcon(r.restriction_type || '');
                                      return <Icon className="h-3 w-3" />;
                                    })()}
                                    <span>{r.restriction_name}</span>
                                  </Badge>
                                ))}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No weddings found for this couple</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Preference Dialog */}
        <Dialog open={viewPreferenceOpen} onOpenChange={setViewPreferenceOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Preference Details</DialogTitle>
              <DialogDescription>View complete preference information</DialogDescription>
            </DialogHeader>
            {viewingPreference && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Preference ID</Label>
                    <p className="text-sm text-muted-foreground">#{viewingPreference.preference_id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Ceremony Type</Label>
                    <div className="mt-1">
                      <CeremonyTypeBadge type={viewingPreference.ceremony_type} />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Dietary Restrictions</Label>
                  {(() => {
                    const restrictions = viewingPreference.dietaryRestrictions && viewingPreference.dietaryRestrictions.length > 0
                      ? viewingPreference.dietaryRestrictions
                      : (viewingPreference.restriction_id ? [{
                          restriction_id: viewingPreference.restriction_id,
                          restriction_name: viewingPreference.restriction_name || 'Unknown',
                          restriction_type: viewingPreference.restriction_type,
                          severity_level: viewingPreference.severity_level
                        }] : []);
                    return restrictions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {restrictions.map((r) => (
                          <Badge
                            key={r.restriction_id}
                            variant="outline"
                            className={`${getTypeColor(r.restriction_type || '')} border flex items-center gap-1`}
                          >
                            {(() => {
                              const Icon = getTypeIcon(r.restriction_type || '');
                              return <Icon className="h-3 w-3" />;
                            })()}
                            {r.restriction_name}
                            {r.severity_level && (
                              <span className="ml-1">- {r.severity_level}</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No dietary restrictions</p>
                    );
                  })()}
                </div>
                <div>
                  <Label className="text-sm font-semibold">Used in Weddings</Label>
                  <p className="text-sm text-muted-foreground">
                    {getWeddingCountForPreference(viewingPreference.preference_id)} wedding(s)
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewPreferenceOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    setViewPreferenceOpen(false);
                    handleEditPreference(viewingPreference);
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Preference
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Preference Dialog */}
        <Dialog open={preferenceDialogOpen} onOpenChange={setPreferenceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPreference ? 'Edit Preference' : 'Add Preference'}
              </DialogTitle>
              <DialogDescription>
                Set ceremony type and dietary restriction for this couple
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ceremony_type">Ceremony Type *</Label>
                <Select
                  value={preferenceForm.ceremony_type}
                  onValueChange={(value) =>
                    setPreferenceForm({ ...preferenceForm, ceremony_type: value })
                  }
                >
                  <SelectTrigger id="ceremony_type">
                    <SelectValue placeholder="Select ceremony type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Civil">Civil</SelectItem>
                    <SelectItem value="Church">Church</SelectItem>
                    <SelectItem value="Garden">Garden</SelectItem>
                    <SelectItem value="Beach">Beach</SelectItem>
                    <SelectItem value="Outdoor">Outdoor</SelectItem>
                    <SelectItem value="Indoor">Indoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dietary Restrictions (Optional - "None" will be used if none selected)</Label>
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                  {dietaryRestrictions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No dietary restrictions available</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dietaryRestrictions.map((dr) => {
                        const isSelected = preferenceForm.restriction_ids.includes(dr.restriction_id);
                        const restrictionType = dr.restriction_type || '';
                        return (
                          <Badge
                            key={dr.restriction_id}
                            variant={isSelected ? "default" : "outline"}
                            className={`text-xs cursor-pointer transition-all ${isSelected ? '' : getTypeColor(restrictionType)} border flex items-center gap-1 hover:opacity-80`}
                            onClick={() => {
                              if (isSelected) {
                                setPreferenceForm({
                                  ...preferenceForm,
                                  restriction_ids: preferenceForm.restriction_ids.filter(id => id !== dr.restriction_id)
                                });
                              } else {
                                setPreferenceForm({
                                  ...preferenceForm,
                                  restriction_ids: [...preferenceForm.restriction_ids, dr.restriction_id]
                                });
                              }
                            }}
                          >
                            {(() => {
                              const Icon = getTypeIcon(restrictionType);
                              return <Icon className="h-3 w-3" />;
                            })()}
                            {dr.restriction_name}
                            {dr.severity_level && (
                              <span className="text-xs ml-1">- {dr.severity_level}</span>
                            )}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
                {preferenceForm.restriction_ids.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {preferenceForm.restriction_ids.length} restriction(s) selected
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPreferenceDialogOpen(false)}
                disabled={preferenceLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSavePreference} disabled={preferenceLoading}>
                {preferenceLoading ? (
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
      </div>
    </DashboardLayout>
  );
};

export default CoupleDetail;

