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
  Clock
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
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { couplesAPI, dietaryRestrictionsAPI } from '@/api';
import { formatCurrency } from '@/utils/currency';
import { getTypeIcon, getTypeColor, getSeverityBadge } from '@/utils/restrictionUtils';

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [couple, setCouple] = useState<Couple | null>(null);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferenceDialogOpen, setPreferenceDialogOpen] = useState(false);
  const [editingPreference, setEditingPreference] = useState<Preference | null>(null);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<any[]>([]);
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
      setWeddings(response.data || []);
    } catch (error: any) {
      console.error('Error fetching weddings:', error);
    }
  };

  const fetchDietaryRestrictions = async () => {
    try {
      const response = await dietaryRestrictionsAPI.getAll();
      setDietaryRestrictions(response.data || []);
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
    const restrictionIds = pref.dietaryRestrictions && pref.dietaryRestrictions.length > 0
      ? pref.dietaryRestrictions.map(r => r.restriction_id)
      : (pref.restriction_id ? [pref.restriction_id] : []);
    
    setPreferenceForm({
      ceremony_type: pref.ceremony_type,
      restriction_ids: restrictionIds
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

    if (preferenceForm.restriction_ids.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one dietary restriction',
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
          restriction_ids: preferenceForm.restriction_ids
        });
        toast({ 
          title: 'Preference updated successfully',
          description: `Updated with ${preferenceForm.restriction_ids.length} dietary restriction(s)`
        });
      } else {
        // Create a single preference with array of restriction IDs
        await couplesAPI.createPreference({
          couple_id: parseInt(id!),
          ceremony_type: preferenceForm.ceremony_type,
          restriction_ids: preferenceForm.restriction_ids
        });
        toast({ 
          title: 'Preference created successfully',
          description: `Created with ${preferenceForm.restriction_ids.length} dietary restriction(s)`
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
              <div className="space-y-3">
                {couple.preferences.map((pref) => {
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
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            Pref ID: {pref.preference_id}
                          </Badge>
                          <Badge variant="outline" className="font-semibold">
                            {pref.ceremony_type}
                          </Badge>
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
                          <div className="flex flex-wrap gap-2 mt-2">
                            {restrictions.map((restriction) => (
                              <Badge 
                                key={restriction.restriction_id} 
                                className={`${getTypeColor(restriction.restriction_type || '')} border flex items-center gap-1`}
                              >
                                {getTypeIcon(restriction.restriction_type || '')}
                                <span>{restriction.restriction_name}</span>
                                <span className="text-xs font-mono">(ID: {restriction.restriction_id})</span>
                                {restriction.severity_level && (
                                  <span className="text-xs ml-1">- {restriction.severity_level}</span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No dietary restrictions</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPreference(pref)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePreference(pref.preference_id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                          {new Date(wedding.weddingDate).toLocaleDateString()}
                        </CardTitle>
                        <Badge variant={wedding.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {wedding.paymentStatus === 'pending' ? 'Pending' : wedding.paymentStatus.charAt(0).toUpperCase() + wedding.paymentStatus.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{wedding.weddingTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{wedding.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{wedding.guestCount} guests</span>
                      </div>
                      <div className="text-sm font-semibold">
                        {formatCurrency(wedding.totalCost || 0)}
                      </div>
                      {wedding.ceremony_type && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs mb-2">
                            {wedding.ceremony_type}
                          </Badge>
                          {(() => {
                            const restrictions = wedding.all_restrictions || wedding.restrictions || [];
                            return restrictions.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {restrictions.map((r: any) => (
                                  <Badge 
                                    key={r.restriction_id} 
                                    className={`${getTypeColor(r.restriction_type || '')} border text-xs flex items-center gap-1`}
                                  >
                                    {getTypeIcon(r.restriction_type || '')}
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
                <Label>Dietary Restrictions *</Label>
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                  {dietaryRestrictions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No dietary restrictions available</p>
                  ) : (
                    dietaryRestrictions.map((dr) => (
                      <div key={dr.restriction_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`restriction-${dr.restriction_id}`}
                          checked={preferenceForm.restriction_ids.includes(dr.restriction_id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPreferenceForm({
                                ...preferenceForm,
                                restriction_ids: [...preferenceForm.restriction_ids, dr.restriction_id]
                              });
                            } else {
                              setPreferenceForm({
                                ...preferenceForm,
                                restriction_ids: preferenceForm.restriction_ids.filter(id => id !== dr.restriction_id)
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`restriction-${dr.restriction_id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {dr.restriction_name} ({dr.restriction_type})
                          {dr.severity_level && (
                            <span className="text-muted-foreground ml-2">- {dr.severity_level}</span>
                          )}
                        </label>
                      </div>
                    ))
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

