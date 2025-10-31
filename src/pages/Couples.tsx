import { useState, useEffect } from 'react';
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
import DashboardLayout from '@/components/DashboardLayout';

const Couples = () => {
  const [couples, setCouples] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API calls
  useEffect(() => {
    setCouples([
      {
        id: 1,
        partner1_name: 'John Smith',
        partner2_name: 'Jane Smith',
        partner1_phone: '(555) 123-4567',
        partner2_phone: '(555) 123-4568',
        partner1_email: 'john.smith@email.com',
        partner2_email: 'jane.smith@email.com',
        planner_contact: 'Sarah Johnson - (555) 987-6543',
        wedding_count: 1,
        last_wedding: '2024-02-14'
      },
      {
        id: 2,
        partner1_name: 'Mike Johnson',
        partner2_name: 'Sarah Johnson',
        partner1_phone: '(555) 234-5678',
        partner2_phone: '(555) 234-5679',
        partner1_email: 'mike.johnson@email.com',
        partner2_email: 'sarah.johnson@email.com',
        planner_contact: 'Emily Davis - (555) 876-5432',
        wedding_count: 1,
        last_wedding: '2024-02-21'
      },
      {
        id: 3,
        partner1_name: 'David Brown',
        partner2_name: 'Lisa Brown',
        partner1_phone: '(555) 345-6789',
        partner2_phone: '(555) 345-6790',
        partner1_email: 'david.brown@email.com',
        partner2_email: 'lisa.brown@email.com',
        planner_contact: 'Michael Wilson - (555) 765-4321',
        wedding_count: 1,
        last_wedding: '2024-03-01'
      }
    ]);
  }, []);

  const filteredCouples = couples.filter(couple => {
    const searchLower = searchTerm.toLowerCase();
    return couple.partner1_name.toLowerCase().includes(searchLower) ||
           couple.partner2_name.toLowerCase().includes(searchLower) ||
           couple.partner1_email.toLowerCase().includes(searchLower) ||
           couple.partner2_email.toLowerCase().includes(searchLower);
  });

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
          <Button>
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
              <CardTitle className="text-sm font-medium">Active Weddings</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {couples.reduce((sum, couple) => sum + couple.wedding_count, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {couples.filter(c => {
                  const lastWedding = new Date(c.last_wedding);
                  const now = new Date();
                  return lastWedding.getMonth() === now.getMonth() && 
                         lastWedding.getFullYear() === now.getFullYear();
                }).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {couples.filter(c => {
                  const lastWedding = new Date(c.last_wedding);
                  const now = new Date();
                  return lastWedding > now;
                }).length}
              </div>
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
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Couple</TableHead>
                  <TableHead>Contact Information</TableHead>
                  <TableHead>Planner Contact</TableHead>
                  <TableHead>Weddings</TableHead>
                  <TableHead>Last Wedding</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCouples.map((couple) => (
                  <TableRow key={couple.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
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
                        {couple.planner_contact}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {couple.wedding_count} wedding{couple.wedding_count !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(couple.last_wedding).toLocaleDateString()}
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

export default Couples;
