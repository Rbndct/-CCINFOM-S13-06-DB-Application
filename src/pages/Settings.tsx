import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { DatabaseSettings } from '@/components/settings/DatabaseSettings';
import { CurrencySettings } from '@/components/settings/CurrencySettings';

const Settings = () => {
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
        <CurrencySettings />

        {/* Dialogs */}
        <ProfileSettings open={profileOpen} onOpenChange={setProfileOpen} />
        <NotificationSettings open={notificationOpen} onOpenChange={setNotificationOpen} />
        <SecuritySettings open={securityOpen} onOpenChange={setSecurityOpen} />
        <DatabaseSettings open={databaseOpen} onOpenChange={setDatabaseOpen} />
      </div>
    </DashboardLayout>
  );
};

export default Settings;


