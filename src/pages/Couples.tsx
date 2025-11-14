import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Heart, 
  Phone, 
  Mail,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { couplesAPI } from '@/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const Couples = () => {
  const navigate = useNavigate();
  const [couples, setCouples] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [ceremonyType, setCeremonyType] = useState<string | undefined>();
  const [restrictionType, setRestrictionType] = useState<string | undefined>();
  const [plannerEmail, setPlannerEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    partner1_name: '',
    partner2_name: '',
    partner1_phone: '',
    partner2_phone: '',
    partner1_email: '',
    partner2_email: '',
    planner_contact: '' // Backend uses planner_contact field
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCouples();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCouples = async () => {
    setLoading(true);
    try {
      const response = await couplesAPI.getAll({
        ceremony_type: ceremonyType,
        restriction_type: restrictionType,
        planner_contact: plannerEmail || undefined,
      });
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
        description: error.response?.data?.message || 'Failed to load couples. Make sure backend is running.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCouples = couples.filter(couple => {
    const searchLower = searchTerm.toLowerCase();
    return couple.partner1_name.toLowerCase().includes(searchLower) ||
           couple.partner2_name.toLowerCase().includes(searchLower) ||
           couple.partner1_email.toLowerCase().includes(searchLower) ||
           couple.partner2_email.toLowerCase().includes(searchLower);
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.partner1_name.trim()) errors.partner1_name = 'Partner 1 name is required';
    if (!formData.partner2_name.trim()) errors.partner2_name = 'Partner 2 name is required';
    if (!formData.partner1_phone.trim()) errors.partner1_phone = 'Partner 1 phone is required';
    if (!formData.partner2_phone.trim()) errors.partner2_phone = 'Partner 2 phone is required';
    if (!formData.partner1_email.trim()) errors.partner1_email = 'Partner 1 email is required';
    if (!formData.partner2_email.trim()) errors.partner2_email = 'Partner 2 email is required';
    if (!formData.planner_contact.trim()) errors.planner_contact = 'Planner email is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setFormLoading(true);
    try {
      await couplesAPI.create(formData);
      toast({
        title: 'Success',
        description: 'Couple created successfully',
      });
      setCreateDialogOpen(false);
      setFormData({
        partner1_name: '',
        partner2_name: '',
        partner1_phone: '',
        partner2_phone: '',
        partner1_email: '',
        partner2_email: '',
        planner_contact: ''
      });
      setFormErrors({});
      await fetchCouples();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create couple',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Couples</h1>
            <p className="text-muted-foreground">
              Manage couple information and contact details
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Couple
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Couples</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{couples.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Couples with Preferences</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {couples.filter(c => c.preference_id).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {couples.length > 0 ? Math.round((couples.filter(c => c.preference_id).length / couples.length) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Multiple Preferences</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(() => {
                  // Count couples with multiple preferences (would need backend support)
                  // For now, count couples with multiple restrictions
                  return couples.filter(c => {
                    const restrictions = c.all_restrictions || [];
                    return restrictions.length > 1;
                  }).length;
                })()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Couples with multiple restrictions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Common Restriction</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(() => {
                  const restrictionCounts: Record<string, number> = {};
                  couples.forEach(c => {
                    const restrictions = c.all_restrictions || [];
                    restrictions.forEach((r: any) => {
                      if (r && r.restriction_type) {
                        restrictionCounts[r.restriction_type] = (restrictionCounts[r.restriction_type] || 0) + 1;
                      }
                    });
                  });
                  const mostCommon = Object.entries(restrictionCounts).sort((a, b) => b[1] - a[1])[0];
                  return mostCommon ? mostCommon[0] : 'N/A';
                })()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                By type
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Couples List */}
        <Card>
          <CardHeader>
            <CardTitle>Couples Directory</CardTitle>
            <CardDescription>
              View and manage all couple information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search couples..."
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
                  setCeremonyType(undefined);
                  setRestrictionType(undefined);
                  setPlannerEmail('');
                  setSearchTerm('');
                  fetchCouples();
                }}
              >
                Reset Filters
              </Button>
              <Button variant="secondary" onClick={fetchCouples}>Apply</Button>
            </div>

            {showFilters && (
              <div className="grid md:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-sm text-muted-foreground">Ceremony Type</label>
                  <Select value={ceremonyType} onValueChange={setCeremonyType}>
                    <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="civil">Civil</SelectItem>
                      <SelectItem value="religious">Religious</SelectItem>
                      <SelectItem value="garden">Garden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Restriction Type</label>
                  <Select value={restrictionType} onValueChange={setRestrictionType}>
                    <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="gluten-free">Gluten-free</SelectItem>
                      <SelectItem value="allergy">Allergy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Planner Email</label>
                  <Input value={plannerEmail} onChange={(e) => setPlannerEmail(e.target.value)} placeholder="Email address" />
                </div>
              </div>
            )}

            {filteredCouples.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No couples found.</p>
                {searchTerm || ceremonyType || restrictionType || plannerEmail ? (
                  <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
                ) : null}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Couple ID</TableHead>
                    <TableHead>Couple</TableHead>
                    <TableHead>Contact Information</TableHead>
                    <TableHead>Planner Email</TableHead>
                    <TableHead>Weddings</TableHead>
                    <TableHead>Last Wedding</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCouples.map((couple) => (
                    <TableRow 
                      key={couple.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onDoubleClick={() => navigate(`/dashboard/couples/${couple.id}`)}
                    >
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        #{couple.couple_id || couple.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => navigate(`/dashboard/couples/${couple.id}`)}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Heart className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{couple.partner1_name}</div>
                            <div className="text-sm text-muted-foreground">&</div>
                            <div className="font-semibold">{couple.partner2_name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {couple.partner1_phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {couple.partner2_phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {couple.partner1_email}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {couple.partner2_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {couple.planner_contact || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {couple.wedding_count === 0 
                            ? 'No weddings' 
                            : couple.wedding_count === 1 
                            ? '1 wedding' 
                            : `${couple.wedding_count} weddings`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {!couple.last_wedding || couple.last_wedding === '1970-01-01' || new Date(couple.last_wedding).getTime() === new Date('1970-01-01').getTime()
                            ? 'No Wedding'
                            : new Date(couple.last_wedding).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/couples/${couple.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={async () => {
                                if (!confirm('Delete this couple?')) return;
                                try {
                                  await couplesAPI.delete(couple.id);
                                  await fetchCouples();
                                  toast({ title: 'Couple deleted' });
                                } catch (e: any) {
                                  toast({ title: 'Error', description: e.response?.data?.error || 'Failed to delete couple', variant: 'destructive' });
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
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Couple Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Couple</DialogTitle>
              <DialogDescription>
                Fill in all the required information to create a new couple
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCouple} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partner1_name">Partner 1 Name *</Label>
                  <Input
                    id="partner1_name"
                    value={formData.partner1_name}
                    onChange={(e) => setFormData({ ...formData, partner1_name: e.target.value })}
                    className={formErrors.partner1_name ? 'border-red-500' : ''}
                    disabled={formLoading}
                  />
                  {formErrors.partner1_name && (
                    <p className="text-sm text-red-500">{formErrors.partner1_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner2_name">Partner 2 Name *</Label>
                  <Input
                    id="partner2_name"
                    value={formData.partner2_name}
                    onChange={(e) => setFormData({ ...formData, partner2_name: e.target.value })}
                    className={formErrors.partner2_name ? 'border-red-500' : ''}
                    disabled={formLoading}
                  />
                  {formErrors.partner2_name && (
                    <p className="text-sm text-red-500">{formErrors.partner2_name}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partner1_phone">Partner 1 Phone *</Label>
                  <Input
                    id="partner1_phone"
                    value={formData.partner1_phone}
                    onChange={(e) => setFormData({ ...formData, partner1_phone: e.target.value })}
                    className={formErrors.partner1_phone ? 'border-red-500' : ''}
                    disabled={formLoading}
                  />
                  {formErrors.partner1_phone && (
                    <p className="text-sm text-red-500">{formErrors.partner1_phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner2_phone">Partner 2 Phone *</Label>
                  <Input
                    id="partner2_phone"
                    value={formData.partner2_phone}
                    onChange={(e) => setFormData({ ...formData, partner2_phone: e.target.value })}
                    className={formErrors.partner2_phone ? 'border-red-500' : ''}
                    disabled={formLoading}
                  />
                  {formErrors.partner2_phone && (
                    <p className="text-sm text-red-500">{formErrors.partner2_phone}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partner1_email">Partner 1 Email *</Label>
                  <Input
                    id="partner1_email"
                    type="email"
                    value={formData.partner1_email}
                    onChange={(e) => setFormData({ ...formData, partner1_email: e.target.value })}
                    className={formErrors.partner1_email ? 'border-red-500' : ''}
                    disabled={formLoading}
                  />
                  {formErrors.partner1_email && (
                    <p className="text-sm text-red-500">{formErrors.partner1_email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner2_email">Partner 2 Email *</Label>
                  <Input
                    id="partner2_email"
                    type="email"
                    value={formData.partner2_email}
                    onChange={(e) => setFormData({ ...formData, partner2_email: e.target.value })}
                    className={formErrors.partner2_email ? 'border-red-500' : ''}
                    disabled={formLoading}
                  />
                  {formErrors.partner2_email && (
                    <p className="text-sm text-red-500">{formErrors.partner2_email}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="planner_contact">Planner Email *</Label>
                <Input
                  id="planner_contact"
                  type="email"
                  value={formData.planner_contact}
                  onChange={(e) => setFormData({ ...formData, planner_contact: e.target.value })}
                  className={formErrors.planner_contact ? 'border-red-500' : ''}
                  disabled={formLoading}
                  placeholder="planner@example.com"
                />
                {formErrors.planner_contact && (
                  <p className="text-sm text-red-500">{formErrors.planner_contact}</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Couple
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

export default Couples;
