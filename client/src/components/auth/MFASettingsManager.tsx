/**
 * MFA Settings Management Interface - Epic 19 Implementation
 * Comprehensive interface for managing existing MFA methods, viewing security status, and modifying settings
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert, AlertDescription } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Switch } from '../ui/Switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Settings, 
  Plus,
  Trash2,
  Edit,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  EyeOff,
  RotateCcw
} from 'lucide-react';
import type { 
  MFAMethodType, 
  MFAMethodStatus,
  BaseMFAConfiguration,
  UserMFAProfile,
  MFAListResponse
} from '../../types/MFATypes';
import { MFAEnrollmentWorkflow } from './MFAEnrollmentWorkflow';

interface MFASettingsManagerProps {
  userId: string;
  onMethodChange?: (methods: BaseMFAConfiguration[]) => void;
}

interface SettingsState {
  profile: UserMFAProfile | null;
  configurations: BaseMFAConfiguration[];
  isLoading: boolean;
  error: string | null;
  showEnrollment: boolean;
  showBackupCodes: boolean;
  showDeleteConfirm: string | null;
  editingMethod: BaseMFAConfiguration | null;
  generatingBackupCodes: boolean;
}

const MFA_METHOD_ICONS = {
  [MFAMethodType.TOTP]: Smartphone,
  [MFAMethodType.EMAIL]: Mail,
  [MFAMethodType.SMS]: MessageSquare
};

const STATUS_CONFIG = {
  [MFAMethodStatus.ACTIVE]: {
    color: 'green',
    label: 'Active',
    icon: CheckCircle
  },
  [MFAMethodStatus.PENDING]: {
    color: 'yellow',
    label: 'Pending Setup',
    icon: Clock
  },
  [MFAMethodStatus.DISABLED]: {
    color: 'gray',
    label: 'Disabled',
    icon: XCircle
  },
  [MFAMethodStatus.REVOKED]: {
    color: 'red',
    label: 'Revoked',
    icon: XCircle
  }
};

export function MFASettingsManager({ userId, onMethodChange }: MFASettingsManagerProps) {
  const [state, setState] = useState<SettingsState>({
    profile: null,
    configurations: [],
    isLoading: true,
    error: null,
    showEnrollment: false,
    showBackupCodes: false,
    showDeleteConfirm: null,
    editingMethod: null,
    generatingBackupCodes: false
  });

  useEffect(() => {
    loadMFAData();
  }, [userId]);

  const loadMFAData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/mfa/list/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to load MFA data');

      const data: MFAListResponse = await response.json();
      
      setState(prev => ({
        ...prev,
        profile: data.profile,
        configurations: data.configurations,
        isLoading: false
      }));

      onMethodChange?.(data.configurations);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  };

  const toggleMethodStatus = async (configId: string, newStatus: MFAMethodStatus) => {
    try {
      const response = await fetch(`/api/mfa/configure/${configId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update method status');

      await loadMFAData();
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  const deleteMethod = async (configId: string) => {
    try {
      const response = await fetch(`/api/mfa/configure/${configId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to delete method');

      setState(prev => ({ ...prev, showDeleteConfirm: null }));
      await loadMFAData();
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  const setPrimaryMethod = async (configId: string) => {
    try {
      const response = await fetch(`/api/mfa/configure/${configId}/primary`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to set primary method');

      await loadMFAData();
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  const generateNewBackupCodes = async () => {
    setState(prev => ({ ...prev, generatingBackupCodes: true }));

    try {
      const response = await fetch('/api/mfa/backup-codes/generate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to generate backup codes');

      const { codes } = await response.json();
      downloadBackupCodes(codes);
      await loadMFAData();
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    } finally {
      setState(prev => ({ ...prev, generatingBackupCodes: false }));
    }
  };

  const downloadBackupCodes = (codes: string[]) => {
    const content = [
      'PromptScape MFA Backup Codes',
      '================================',
      `Generated: ${new Date().toISOString()}`,
      `User: ${userId}`,
      '',
      'IMPORTANT: Save these codes in a safe place.',
      'Each code can only be used once.',
      '',
      ...codes.map((code, i) => `${i + 1}. ${code}`)
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptscape-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEnrollmentComplete = (_methodType: MFAMethodType, _configId: string) => {
    setState(prev => ({ ...prev, showEnrollment: false }));
    loadMFAData();
  };

  if (state.isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading MFA settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Multi-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  state.profile?.isEnabled ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">
                  MFA Status: {state.profile?.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <Badge variant={state.profile?.isEnabled ? 'default' : 'secondary'}>
                {state.profile?.configuredMethods.length || 0} method(s) configured
              </Badge>
            </div>

            {state.profile?.lastUsed && (
              <div className="text-sm text-gray-600">
                Last used: {new Date(state.profile.lastUsed.timestamp).toLocaleString()} 
                ({state.profile.lastUsed.methodType.toUpperCase()})
              </div>
            )}

            {state.profile?.securityMetrics && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="font-bold text-lg text-green-600">
                    {state.profile.securityMetrics.successfulAttempts}
                  </div>
                  <div className="text-xs text-gray-600">Successful</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-red-600">
                    {state.profile.securityMetrics.failedAttempts}
                  </div>
                  <div className="text-xs text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-blue-600">
                    {state.profile.securityMetrics.totalAttempts}
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configured Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Configured Methods</CardTitle>
            <Button
              onClick={() => setState(prev => ({ ...prev, showEnrollment: true }))}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {state.configurations.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No MFA methods configured</h3>
              <p className="text-gray-600 mb-4">
                Add your first authentication method to secure your account
              </p>
              <Button onClick={() => setState(prev => ({ ...prev, showEnrollment: true }))}>
                Get Started
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {state.configurations.map((config) => {
                const Icon = MFA_METHOD_ICONS[config.methodType];
                const statusConfig = STATUS_CONFIG[config.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <div key={config.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Icon className="h-6 w-6 mt-1 text-blue-600" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{config.displayName}</h3>
                            {config.isPrimary && (
                              <Badge variant="default" className="text-xs">Primary</Badge>
                            )}
                            <Badge 
                              variant="outline" 
                              className={`text-xs border-${statusConfig.color}-300 text-${statusConfig.color}-700`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {config.methodType.toUpperCase()} • Created {new Date(config.createdAt).toLocaleDateString()}
                          </p>
                          {config.lastUsedAt && (
                            <p className="text-xs text-gray-500">
                              Last used: {new Date(config.lastUsedAt).toLocaleDateString()}
                            </p>
                          )}
                          {config.failedAttempts > 0 && (
                            <p className="text-xs text-red-600">
                              {config.failedAttempts} failed attempt(s)
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {config.status === MFAMethodStatus.ACTIVE && !config.isPrimary && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPrimaryMethod(config.id)}
                          >
                            Set Primary
                          </Button>
                        )}
                        
                        <Switch
                          checked={config.status === MFAMethodStatus.ACTIVE}
                          onCheckedChange={(checked) => 
                            toggleMethodStatus(
                              config.id, 
                              checked ? MFAMethodStatus.ACTIVE : MFAMethodStatus.DISABLED
                            )
                          }
                          disabled={config.isPrimary && config.status === MFAMethodStatus.ACTIVE}
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setState(prev => ({ ...prev, editingMethod: config }))}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setState(prev => ({ ...prev, showDeleteConfirm: config.id }))}
                          disabled={config.isPrimary}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Backup Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Emergency backup codes allow you to access your account if you lose your primary device.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Available codes: {state.profile?.profile?.availableBackupCodes || 0}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setState(prev => ({ ...prev, showBackupCodes: !prev.showBackupCodes }))}
                >
                  {state.showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {state.showBackupCodes ? 'Hide' : 'View'} Codes
                </Button>
                <Button
                  onClick={generateNewBackupCodes}
                  disabled={state.generatingBackupCodes}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className={`h-4 w-4 ${state.generatingBackupCodes ? 'animate-spin' : ''}`} />
                  Generate New
                </Button>
              </div>
            </div>

            {state.showBackupCodes && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Backup codes are only shown when first generated. Make sure to save them securely.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {state.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Enrollment Dialog */}
      {state.showEnrollment && (
        <Dialog open={state.showEnrollment} onOpenChange={(open) => 
          setState(prev => ({ ...prev, showEnrollment: open }))
        }>
          <DialogContent className="max-w-3xl">
            <MFAEnrollmentWorkflow
              userId={userId}
              onComplete={handleEnrollmentComplete}
              onCancel={() => setState(prev => ({ ...prev, showEnrollment: false }))}
              existingMethods={state.configurations.map(c => c.methodType)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {state.showDeleteConfirm && (
        <Dialog open={!!state.showDeleteConfirm} onOpenChange={(open) => 
          !open && setState(prev => ({ ...prev, showDeleteConfirm: null }))
        }>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete MFA Method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this authentication method? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setState(prev => ({ ...prev, showDeleteConfirm: null }))}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMethod(state.showDeleteConfirm)}
                >
                  Delete Method
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}