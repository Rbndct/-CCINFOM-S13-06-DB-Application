import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, DollarSign, Loader2, RefreshCw, Monitor, Moon, Sun, Calendar, Clock, Table as TableIcon, CheckCircle2, XCircle, Download, Upload, FileText } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useCurrency, SupportedCurrency } from '@/context/CurrencyContext';
import { useDateFormat, DateFormat } from '@/context/DateFormatContext';
import { useTimeFormat, TimeFormat } from '@/context/TimeFormatContext';
import { useTheme, Theme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

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
  const { dateFormat, setDateFormat, formatDate } = useDateFormat();
  const { timeFormat, setTimeFormat, formatTime } = useTimeFormat();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [databaseOpen, setDatabaseOpen] = useState(false);
  const [displayUIOpen, setDisplayUIOpen] = useState(false);
  const [tableSettingsOpen, setTableSettingsOpen] = useState(false);
  
  // Database settings state
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbConfig, setDbConfig] = useState<any>(null);
  const [testConnectionLoading, setTestConnectionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  
  // Table settings state
  const [defaultSortOrder, setDefaultSortOrder] = useState<'asc' | 'desc'>(() => {
    const stored = localStorage.getItem('default_table_sort_order');
    return (stored as 'asc' | 'desc') || 'asc';
  });

  // Fetch database status
  useEffect(() => {
    if (databaseOpen) {
      fetchDatabaseStatus();
      fetchDatabaseConfig();
    }
  }, [databaseOpen]);

  const fetchDatabaseStatus = async () => {
    setDbLoading(true);
    try {
      const response = await api.get('/database/status');
      setDbStatus(response);
    } catch (error: any) {
      console.error('Error fetching database status:', error);
      setDbStatus({ connected: false, error: error.message });
    } finally {
      setDbLoading(false);
    }
  };

  const fetchDatabaseConfig = async () => {
    try {
      const response = await api.get('/database/config');
      if (response && response.data) {
        setDbConfig(response.data);
      }
    } catch (error) {
      console.error('Error fetching database config:', error);
      // Fallback to health endpoint
      try {
        const healthResponse = await api.get('/health');
        if (healthResponse && healthResponse.database) {
          setDbConfig({
            host: 'localhost',
            user: 'root',
            database: healthResponse.database.name || 'wedding_management_db'
          });
        }
      } catch (healthError) {
        console.error('Error fetching from health endpoint:', healthError);
      }
    }
  };

  const handleTestConnection = async () => {
    setTestConnectionLoading(true);
    try {
      const response = await api.get('/database/test');
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Database connection successful!',
        });
        fetchDatabaseStatus();
      } else {
        toast({
          title: 'Connection Failed',
          description: response.error || 'Could not connect to database',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.response?.data?.error || 'Could not connect to database',
        variant: 'destructive',
      });
    } finally {
      setTestConnectionLoading(false);
    }
  };

  const handleExportDatabase = async () => {
    setExportLoading(true);
    try {
      const response = await fetch(`${api.defaults.baseURL}/database/export`, {
        method: 'POST',
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database_export_${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Success',
        description: 'Database exported successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Could not export database',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleImportDatabase = async () => {
    if (!importFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a SQL file to import',
        variant: 'destructive',
      });
      return;
    }

    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      
      const response = await fetch(`${api.defaults.baseURL}/database/import`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Database imported successfully!',
        });
        setImportFile(null);
        fetchDatabaseStatus();
      } else {
        toast({
          title: 'Import Failed',
          description: result.error || 'Could not import database',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message || 'Could not import database',
        variant: 'destructive',
      });
    } finally {
      setImportLoading(false);
    }
  };

  const handleDefaultSortOrderChange = (order: 'asc' | 'desc') => {
    setDefaultSortOrder(order);
    localStorage.setItem('default_table_sort_order', order);
    toast({
      title: 'Settings Saved',
      description: `Default table sort order set to ${order === 'asc' ? 'Ascending' : 'Descending'}`,
    });
  };

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
                  <Monitor className="h-5 w-5" />
                  Display & UI
                </CardTitle>
              </div>
              <CardDescription>Date format, time format, and theme settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => setDisplayUIOpen(true)}>
                Display Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TableIcon className="h-5 w-5" />
                  Table Settings
                </CardTitle>
              </div>
              <CardDescription>Default sort order and table preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => setTableSettingsOpen(true)}>
                Table Settings
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

        {/* Display & UI Settings Dialog */}
        <Dialog open={displayUIOpen} onOpenChange={setDisplayUIOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Display & UI Settings</DialogTitle>
              <DialogDescription>
                Configure date format, time format, and theme preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Date Format */}
              <div className="space-y-2">
                <Label htmlFor="date-format" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Format
                </Label>
                <Select value={dateFormat} onValueChange={(value: DateFormat) => setDateFormat(value)}>
                  <SelectTrigger id="date-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY (US Format)</SelectItem>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY (European Format)</SelectItem>
                    <SelectItem value="yyyy/mm/dd">YYYY/MM/DD (ISO Format)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Preview: {formatDate(new Date())}
                </p>
              </div>

              {/* Time Format */}
              <div className="space-y-2">
                <Label htmlFor="time-format" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Format
                </Label>
                <Select value={timeFormat} onValueChange={(value: TimeFormat) => setTimeFormat(value)}>
                  <SelectTrigger id="time-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12hr">12 Hour (AM/PM)</SelectItem>
                    <SelectItem value="24hr">24 Hour</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Preview: {formatTime(new Date())}
                </p>
              </div>

              {/* Dark Mode */}
              <div className="space-y-2">
                <Label htmlFor="theme" className="flex items-center gap-2">
                  {resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  Theme
                </Label>
                <Select value={theme} onValueChange={(value: Theme) => setTheme(value)}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System (Follow OS)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Current theme: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDisplayUIOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Table Settings Dialog */}
        <Dialog open={tableSettingsOpen} onOpenChange={setTableSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Table Settings</DialogTitle>
              <DialogDescription>
                Configure default table sorting preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sort-order" className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4" />
                  Default Sort Order (by ID)
                </Label>
                <Select 
                  value={defaultSortOrder} 
                  onValueChange={(value: 'asc' | 'desc') => handleDefaultSortOrderChange(value)}
                >
                  <SelectTrigger id="sort-order">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending (1, 2, 3...)</SelectItem>
                    <SelectItem value="desc">Descending (..., 3, 2, 1)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This will be the default sort order for all tables when sorted by ID.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTableSettingsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Database Settings Dialog */}
        <Dialog open={databaseOpen} onOpenChange={setDatabaseOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Database Settings</DialogTitle>
              <DialogDescription>
                Manage database configuration, connection, and backups.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Connection Status */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Connection Status</Label>
                {dbLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading connection status...</span>
                  </div>
                ) : dbStatus ? (
                  <div className="space-y-2 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <div className="flex items-center gap-2">
                        {dbStatus.connected || dbStatus.data?.connected ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600 font-medium">Connected</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-600 font-medium">Disconnected</span>
                          </>
                        )}
                      </div>
                    </div>
                    {dbStatus.data && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Database Name</span>
                          <span className="text-sm font-medium">{dbStatus.data.databaseName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Database Size</span>
                          <span className="text-sm font-medium">{dbStatus.data.size || 'Unknown'}</span>
                        </div>
                        {dbStatus.data.lastBackup && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Last Backup</span>
                            <span className="text-sm font-medium">
                              {formatDate(new Date(dbStatus.data.lastBackup))} {formatTime(new Date(dbStatus.data.lastBackup))}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Database Configuration */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Database Configuration</Label>
                <div className="space-y-2 rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Host</span>
                    <span className="text-sm font-medium">{dbConfig?.host || 'localhost'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">User</span>
                    <span className="text-sm font-medium">{dbConfig?.user || 'root'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Database Name</span>
                    <span className="text-sm font-medium">{dbConfig?.database || 'wedding_management_db'}</span>
                  </div>
                </div>
              </div>

              {/* Test Connection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Test Connection</Label>
                <Button 
                  onClick={handleTestConnection} 
                  disabled={testConnectionLoading}
                  variant="outline"
                  className="w-full"
                >
                  {testConnectionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>

              {/* Export Database */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Database
                </Label>
                <p className="text-xs text-muted-foreground">
                  Export the entire database to a SQL file for backup purposes.
                </p>
                <Button 
                  onClick={handleExportDatabase} 
                  disabled={exportLoading}
                  variant="outline"
                  className="w-full"
                >
                  {exportLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export Database
                    </>
                  )}
                </Button>
              </div>

              {/* Import Database */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import Database
                </Label>
                <p className="text-xs text-muted-foreground">
                  Import a SQL file to restore the database. This will overwrite existing data.
                </p>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".sql"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="w-full"
                  />
                  <Button 
                    onClick={handleImportDatabase} 
                    disabled={importLoading || !importFile}
                    variant="outline"
                    className="w-full"
                  >
                    {importLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Database
                      </>
                    )}
                  </Button>
                </div>
              </div>
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


