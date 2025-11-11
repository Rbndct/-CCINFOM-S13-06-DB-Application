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
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { couplesAPI, dietaryRestrictionsAPI } from '@/api';

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

type Preference = {
  preference_id: number;
  couple_id: number;
  ceremony_type: string;
  restriction_id: number;
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
    restriction_id: ''
  });
  const [preferenceLoading, setPreferenceLoading] = useState(false);

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
    setPreferenceForm({ ceremony_type: '', restriction_id: '' });
    setPreferenceDialogOpen(true);
  };

  const handleEditPreference = (pref: Preference) => {
    setEditingPreference(pref);
    setPreferenceForm({
      ceremony_type: pref.ceremony_type,
      restriction_id: pref.restriction_id.toString()
    });
    setPreferenceDialogOpen(true);
  };

  const handleSavePreference = async () => {
    if (!preferenceForm.ceremony_type || !preferenceForm.restriction_id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setPreferenceLoading(true);
    try {
      if (editingPreference) {
        await couplesAPI.updatePreference(editingPreference.preference_id, {
          ceremony_type: preferenceForm.ceremony_type,
          restriction_id: parseInt(preferenceForm.restriction_id)
        });
        toast({ title: 'Preference updated successfully' });
      } else {
        await couplesAPI.createPreference({
          couple_id: parseInt(id!),
          ceremony_type: preferenceForm.ceremony_type,
          restriction_id: parseInt(preferenceForm.restriction_id)
        });
        toast({ title: 'Preference created successfully' });
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
        </div>

        {/* Couple Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Partner details and planner contact</CardDescription>
          </CardHeader>
          <CardContent>
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
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Planner Contact:</span>
                <span>{couple.planner_contact}</span>
              </div>
            </div>
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
                {couple.preferences.map((pref) => (
                  <div
                    key={pref.preference_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{pref.ceremony_type}</Badge>
                        {pref.restriction_name && (
                          <Badge variant="secondary">
                            {pref.restriction_name} ({pref.restriction_type})
                          </Badge>
                        )}
                      </div>
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
                ))}
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
                          {wedding.paymentStatus}
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
                        ${Number(wedding.totalCost || 0).toLocaleString()}
                      </div>
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
                <Input
                  id="ceremony_type"
                  value={preferenceForm.ceremony_type}
                  onChange={(e) =>
                    setPreferenceForm({ ...preferenceForm, ceremony_type: e.target.value })
                  }
                  placeholder="e.g. Civil, Church, Beach"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restriction_id">Dietary Restriction *</Label>
                <Select
                  value={preferenceForm.restriction_id}
                  onValueChange={(value) =>
                    setPreferenceForm({ ...preferenceForm, restriction_id: value })
                  }
                >
                  <SelectTrigger id="restriction_id">
                    <SelectValue placeholder="Select dietary restriction" />
                  </SelectTrigger>
                  <SelectContent>
                    {dietaryRestrictions.map((dr) => (
                      <SelectItem key={dr.restriction_id} value={dr.restriction_id.toString()}>
                        {dr.restriction_name} ({dr.restriction_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

