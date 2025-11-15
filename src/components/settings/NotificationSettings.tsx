import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface NotificationSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NOTIFICATION_STORAGE_KEY = 'notification_settings';

const FREQUENCY_OPTIONS = [
  { value: 'realtime', label: 'Real-time' },
  { value: 'daily', label: 'Daily Digest' },
  { value: 'weekly', label: 'Weekly Summary' },
];

export function NotificationSettings({ open, onOpenChange }: NotificationSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    weddingReminders: true,
    rsvpUpdates: true,
    paymentReminders: true,
    systemAlerts: true,
    frequency: 'realtime' as 'realtime' | 'daily' | 'weekly',
  });

  useEffect(() => {
    if (open) {
      // Load saved settings from localStorage
      const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Error loading notification settings:', e);
        }
      }
    }
  }, [open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
      
      toast({
        title: 'Success',
        description: 'Notification settings saved successfully',
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notification settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Configure how and when you receive notifications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="wedding-reminders">Wedding Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about upcoming weddings
                </p>
              </div>
              <Switch
                id="wedding-reminders"
                checked={settings.weddingReminders}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, weddingReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="rsvp-updates">RSVP Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when guests respond to invitations
                </p>
              </div>
              <Switch
                id="rsvp-updates"
                checked={settings.rsvpUpdates}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, rsvpUpdates: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="payment-reminders">Payment Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about payment deadlines
                </p>
              </div>
              <Switch
                id="payment-reminders"
                checked={settings.paymentReminders}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, paymentReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-alerts">System Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Important system notifications and updates
                </p>
              </div>
              <Switch
                id="system-alerts"
                checked={settings.systemAlerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, systemAlerts: checked })
                }
              />
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select
              value={settings.frequency}
              onValueChange={(value: 'realtime' | 'daily' | 'weekly') =>
                setSettings({ ...settings, frequency: value })
              }
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {settings.frequency === 'realtime' && 'Receive notifications immediately'}
              {settings.frequency === 'daily' && 'Receive a daily summary of all notifications'}
              {settings.frequency === 'weekly' && 'Receive a weekly summary of all notifications'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

