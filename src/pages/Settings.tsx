import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, DollarSign, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import { useCurrency, SupportedCurrency } from '@/context/CurrencyContext';

const CURRENCY_NAMES: Record<SupportedCurrency, string> = {
  PHP: 'Philippine Peso',
  USD: 'US Dollar',
  EUR: 'Euro',
  JPY: 'Japanese Yen',
  GBP: 'British Pound',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  HKD: 'Hong Kong Dollar',
  SGD: 'Singapore Dollar',
  KRW: 'South Korean Won',
  INR: 'Indian Rupee',
  NZD: 'New Zealand Dollar',
};

const Settings = () => {
  const { currency, setCurrency, rates, loading, error, format, convertFromPHP } = useCurrency();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [databaseOpen, setDatabaseOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </div>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => setProfileOpen(true)}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </div>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => setNotificationOpen(true)}>
                Manage Notifications
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </div>
              <CardDescription>Password and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => setSecurityOpen(true)}>
                Security Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database
                </CardTitle>
              </div>
              <CardDescription>Database configuration and backups</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => setDatabaseOpen(true)}>
                Database Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Currency Settings - Full Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency Settings
            </CardTitle>
            <CardDescription>Manage currency display preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency-select">Display Currency</Label>
              <Select value={currency} onValueChange={(value: SupportedCurrency) => setCurrency(value)}>
                <SelectTrigger id="currency-select" className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CURRENCY_NAMES) as SupportedCurrency[]).map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{curr}</span>
                        <span className="text-muted-foreground">- {CURRENCY_NAMES[curr]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading exchange rates...</span>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <p>Error loading exchange rates: {error}</p>
              </div>
            )}

            {!loading && !error && rates && Object.keys(rates).length > 0 && (
              <div className="space-y-2 rounded-md bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {currency === 'PHP' 
                      ? 'Base currency (PHP)' 
                      : rates[currency] 
                        ? `1 PHP = ${rates[currency].toFixed(4)} ${currency}`
                        : 'Rate unavailable'
                    }
                  </span>
                </div>
                {currency !== 'PHP' && rates[currency] && (
                  <div className="text-xs text-muted-foreground mt-1">
                    All prices are converted from PHP (base currency) to {currency}
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p>Note: All prices in the database are stored in PHP. The selected currency is used for display only.</p>
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profile Settings</DialogTitle>
              <DialogDescription>
                Update your personal information and preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your.email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProfileOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setProfileOpen(false)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notification Settings</DialogTitle>
              <DialogDescription>
                Configure how and when you receive notifications.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Notification preferences will be available in a future update.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNotificationOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={securityOpen} onOpenChange={setSecurityOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Security Settings</DialogTitle>
              <DialogDescription>
                Manage your password and security preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Security settings will be available in a future update.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSecurityOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={databaseOpen} onOpenChange={setDatabaseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Database Settings</DialogTitle>
              <DialogDescription>
                Manage database configuration and backups.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Database management features will be available in a future update.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDatabaseOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Settings;


