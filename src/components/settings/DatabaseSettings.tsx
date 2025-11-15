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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Database, Download, Upload, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { databaseAPI } from '@/api';
import { Badge } from '@/components/ui/badge';

interface DatabaseSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DatabaseStatus {
  connected: boolean;
  databaseName?: string;
  size?: string;
  lastBackup?: string;
}

export function DatabaseSettings({ open, onOpenChange }: DatabaseSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      loadStatus();
    }
  }, [open]);

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const response = await databaseAPI.getStatus();
      if (response.data?.success && response.data?.data) {
        setStatus(response.data.data);
      } else {
        setStatus({ 
          connected: false, 
          error: response.data?.error || 'Unknown error' 
        });
      }
    } catch (error: any) {
      console.error('Error loading database status:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to connect to backend server';
      setStatus({ 
        connected: false, 
        error: errorMessage,
        code: error.code
      });
      
      // Only show toast if it's not a network error (to avoid spam)
      if (!error.code || error.code !== 'ERR_NETWORK') {
        toast({
          title: 'Database Connection Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await databaseAPI.exportDatabase();
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `database_export_${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Database exported successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to export database',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: 'Validation Error',
        description: 'Please select a SQL file to import',
        variant: 'destructive',
      });
      return;
    }

    if (!importFile.name.endsWith('.sql')) {
      toast({
        title: 'Validation Error',
        description: 'Please select a valid SQL file',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await databaseAPI.importDatabase(importFile);
      
      toast({
        title: 'Success',
        description: 'Database imported successfully',
      });
      
      setImportFile(null);
      loadStatus();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to import database',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      await databaseAPI.createBackup();
      
      toast({
        title: 'Success',
        description: 'Database backup created successfully',
      });
      
      loadStatus();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create backup',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      await databaseAPI.testConnection();
      
      toast({
        title: 'Success',
        description: 'Database connection test successful',
      });
      
      loadStatus();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Database connection test failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Database Settings</DialogTitle>
          <DialogDescription>
            Manage database backups, exports, and imports
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Database Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Database Status</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadStatus}
                disabled={loadingStatus}
              >
                {loadingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>

            {loadingStatus ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Connection Status</span>
                  {status?.connected ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-3 w-3" />
                      Disconnected
                    </Badge>
                  )}
                </div>

                {status?.error && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-3">
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-xs text-red-600 mt-1">{status.error}</p>
                    {status.code && (
                      <p className="text-xs text-red-500 mt-1">Code: {status.code}</p>
                    )}
                  </div>
                )}

                {status?.connected && status?.databaseName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Database Name</span>
                    <span className="text-sm font-medium">{status.databaseName}</span>
                  </div>
                )}

                {status?.connected && status?.size && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Database Size</span>
                    <span className="text-sm font-medium">{status.size}</span>
                  </div>
                )}

                {status?.connected && status?.lastBackup && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Backup</span>
                    <span className="text-sm font-medium">{formatDate(status.lastBackup)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export Database */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Export Database</h3>
            <p className="text-sm text-muted-foreground">
              Download a complete SQL dump of your database
            </p>
            <Button onClick={handleExport} disabled={loading || !status?.connected}>
              <Download className="mr-2 h-4 w-4" />
              Export Database
            </Button>
          </div>

          {/* Import Database */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Import Database</h3>
            <p className="text-sm text-muted-foreground">
              Import a SQL file to restore your database
            </p>
            <div className="space-y-2">
              <Label htmlFor="import-file">SQL File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="import-file"
                  type="file"
                  accept=".sql"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                <Button onClick={handleImport} disabled={loading || !importFile || !status?.connected}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </div>
              {importFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {importFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Backup Database */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Create Backup</h3>
            <p className="text-sm text-muted-foreground">
              Create a timestamped backup of your database
            </p>
            <Button onClick={handleBackup} disabled={loading || !status?.connected}>
              <Database className="mr-2 h-4 w-4" />
              Create Backup Now
            </Button>
          </div>

          {/* Test Connection */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Test Connection</h3>
            <p className="text-sm text-muted-foreground">
              Verify database connectivity
            </p>
            <Button variant="outline" onClick={handleTestConnection} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Test Connection
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

