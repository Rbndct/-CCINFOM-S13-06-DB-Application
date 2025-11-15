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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProfileSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TIMEZONES = [
  'Asia/Manila',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'America/Toronto',
  'America/Chicago',
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'tl', name: 'Tagalog' },
];

const PROFILE_STORAGE_KEY = 'user_profile_settings';

export function ProfileSettings({ open, onOpenChange }: ProfileSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    timezone: 'Asia/Manila',
    language: 'en',
  });

  useEffect(() => {
    if (open) {
      // Load saved profile from localStorage
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Error loading profile:', e);
        }
      }
    }
  }, [open]);

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Email is required',
        variant: 'destructive',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(formData));
      
      toast({
        title: 'Success',
        description: 'Profile settings saved successfully',
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save profile settings',
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
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Update your personal information and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization / Company</Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              placeholder="Your company name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

