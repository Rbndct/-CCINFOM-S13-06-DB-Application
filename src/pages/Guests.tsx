import { useState, useEffect } from 'react';
import { Plus, Loader2, RefreshCw, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { guestsAPI } from '@/api';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';

type Guest = {
  id: number;
  guest_id: number;
  guest_name: string;
  wedding_id: number;
  table_id: number | null;
  table_number?: string | null;
  restriction_id?: number | null;
  restriction_name?: string | null;
  rsvp_status: string;
};

const Guests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await guestsAPI.getAll();
      setGuests(response.data || []);
      toast({ title: 'Guests loaded', description: `Found ${response.count || 0} guests` });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Make sure the backend is running on port 3001';
      setError(errorMessage);
      toast({ title: 'Connection Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getRSVPBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default' as const;
      case 'declined':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading guests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold">Guest Management</h1>
            <div className="flex gap-2">
              <Button onClick={fetchGuests} variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Guest
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">Manage your wedding guest list and track RSVPs</p>
        </div>

        {error ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Backend Not Connected</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-medium text-sm">To connect the backend:</p>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Navigate to the backend folder</li>
                  <li>Run: <code className="bg-background px-2 py-1 rounded">npm install</code></li>
                  <li>Copy .env.example to .env and configure MySQL</li>
                  <li>Run: <code className="bg-background px-2 py-1 rounded">npm run dev</code></li>
                </ol>
              </div>
              <Button onClick={fetchGuests} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : guests.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <UserPlus className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Guests Yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Your guest list is empty. Add your first guest to get started with wedding planning!
              </p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Guest
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 mb-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Guests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{guests.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{guests.filter(g => g.rsvp_status === 'confirmed').length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">{guests.filter(g => g.rsvp_status === 'pending').length}</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {guests.map((guest) => (
                <Card key={guest.id} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{guest.guest_name}</CardTitle>
                      <Badge variant={getRSVPBadgeVariant(guest.rsvp_status)}>{guest.rsvp_status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    {guest.table_number ? <div>Table: {guest.table_number}</div> : <div>No seating assigned</div>}
                    {guest.restriction_name ? <div>Restriction: {guest.restriction_name}</div> : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Guests;




