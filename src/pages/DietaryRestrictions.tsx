import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  UserCheck, 
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Users
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
import DashboardLayout from '@/components/DashboardLayout';

const DietaryRestrictions = () => {
  const [restrictions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Critical</Badge>;
      case 'High':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3 mr-1" />High</Badge>;
      case 'Moderate':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Moderate</Badge>;
      case 'Low':
        return <Badge className="bg-green-100 text-green-800"><UserCheck className="w-3 h-3 mr-1" />Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'Dietary': 'bg-blue-100 text-blue-800',
      'Medical': 'bg-red-100 text-red-800',
      'Allergy': 'bg-orange-100 text-orange-800',
      'Religious': 'bg-purple-100 text-purple-800'
    };
    return <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  const filteredRestrictions = restrictions.filter(restriction => {
    const matchesSearch = restriction.restriction_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restriction.restriction_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || restriction.restriction_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalAffectedGuests = restrictions.reduce((sum, restriction) => sum + restriction.affected_guests, 0);
  const criticalRestrictions = restrictions.filter(r => r.severity_level === 'Critical').length;
  const totalMenuItems = restrictions.reduce((sum, restriction) => sum + restriction.menu_items_count, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dietary Restrictions</h1>
            <p className="text-muted-foreground">
              Manage dietary restrictions and special requirements
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Restriction
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Restrictions</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{restrictions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Affected Guests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAffectedGuests}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalRestrictions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMenuItems}</div>
            </CardContent>
          </Card>
        </div>

        {/* Restrictions List */}
        <Card>
          <CardHeader>
            <CardTitle>Dietary Restrictions</CardTitle>
            <CardDescription>
              View and manage all dietary restrictions and special requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search restrictions..."
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
                  <TableHead>Restriction Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity Level</TableHead>
                  <TableHead>Affected Guests</TableHead>
                  <TableHead>Menu Items</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRestrictions.map((restriction) => (
                  <TableRow key={restriction.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                        {restriction.restriction_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(restriction.restriction_type)}
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(restriction.severity_level)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{restriction.affected_guests}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {restriction.menu_items_count} items
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {restriction.severity_level === 'Critical' ? 'High' : 
                         restriction.severity_level === 'High' ? 'Medium' : 'Low'}
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
                          <DropdownMenuItem>
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
      </div>
    </DashboardLayout>
  );
};

export default DietaryRestrictions;
