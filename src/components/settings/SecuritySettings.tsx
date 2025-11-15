import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SecuritySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SECURITY_STORAGE_KEY = 'security_settings';

export function SecuritySettings({ open, onOpenChange }: SecuritySettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { strength: 33, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength: 66, label: 'Medium', color: 'bg-yellow-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const passwordsMatch = formData.newPassword && formData.confirmPassword 
    ? formData.newPassword === formData.confirmPassword 
    : null;

  const handleSave = async () => {
    // Validation
    if (!formData.currentPassword) {
      toast({
        title: 'Validation Error',
        description: 'Current password is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.newPassword) {
      toast({
        title: 'Validation Error',
        description: 'New password is required',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would be an API call to change password
      // For now, save to localStorage (not secure, but for demo purposes)
      const securityData = {
        twoFactorEnabled,
        lastPasswordChange: new Date().toISOString(),
      };
      localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(securityData));
      
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = () => {
    // In a real app, this would call an API to invalidate all sessions
    toast({
      title: 'Success',
      description: 'Logged out from all devices',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Security Settings</DialogTitle>
          <DialogDescription>
            Manage your password and security preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Password Change Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Change Password</h3>
            
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formData.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Password strength</span>
                    <span className={passwordStrength.color.replace('bg-', 'text-')}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <Progress value={passwordStrength.strength} className="h-2" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formData.confirmPassword && (
                <div className="flex items-center gap-2 text-xs">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                id="two-factor"
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>
            {twoFactorEnabled && (
              <p className="text-sm text-muted-foreground">
                Two-factor authentication setup will be available in a future update.
              </p>
            )}
          </div>

          {/* Session Management */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Session Management</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Log out from all devices to invalidate all active sessions.
              </p>
              <Button variant="outline" onClick={handleLogoutAll}>
                Logout from All Devices
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !formData.newPassword || !passwordsMatch}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

