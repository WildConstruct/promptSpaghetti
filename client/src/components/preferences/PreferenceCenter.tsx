/**
 * Preference Center
 * 
 * Comprehensive user preference management interface with privacy controls,
 * communication settings, and account customization options.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-325
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GranularConsentInterface } from '../consent/GranularConsentInterface';
import { 
  UserPreferences, 
  CommunicationPreferences,
  NotificationSettings,
  DataManagementSettings,
  SecuritySettings,
  AccessibilitySettings
} from '../../types/preferences';

interface PreferenceCenterProps {
  userId: string;
  onClose?: () => void;
  initialTab?: PreferenceTab;
}

type PreferenceTab = 
  | 'privacy' 
  | 'communication' 
  | 'notifications' 
  | 'data' 
  | 'security' 
  | 'accessibility' 
  | 'account';

interface TabConfig {
  id: PreferenceTab;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export   const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const tabs: TabConfig[] = [
    {
      id: 'privacy',
      label: 'Privacy & Consent',
      icon: <ShieldIcon />,
      description: 'Control how your data is collected and used'
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: <ChatIcon />,
      description: 'Manage how we communicate with you'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <BellIcon />,
      description: 'Configure notification preferences'
    },
    {
      id: 'data',
      label: 'Data Management',
      icon: <DatabaseIcon />,
      description: 'Control your personal data'
    },
    {
      id: 'security',
      label: 'Security',
      icon: <LockIcon />,
      description: 'Account security settings'
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      icon: <AccessibilityIcon />,
      description: 'Accessibility and display options'
    },
    {
      id: 'account',
      label: 'Account',
      icon: <UserIcon />,
      description: 'General account settings'
    }
  ];

  useEffect(() => {
    loadUserPreferences();
  }, [loadUserPreferences]);

  const loadUserPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/preferences`);
      if (!response.ok) throw new Error('Failed to load preferences');
      
      const data = await response.json();
      setPreferences(data.preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updatePreferences = (section: keyof UserPreferences, updates: Partial<unknown>) => {
    if (!preferences) return;
    
    setPreferences(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        ...updates
      }
    }));
    setHasUnsavedChanges(true);
  };

  const savePreferences = async () => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch(`/api/users/${userId}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      
      if (!response.ok) throw new Error('Failed to save preferences');
      
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const exportUserData = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/data-export`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to initiate data export');
      
      const data = await response.json();
      alert(`Data export initiated. You will receive an email at ${data.email} when ready.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    try {
      const response = await fetch(`/api/users/${userId}/delete`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete account');
      
      alert('Account deletion initiated. You will receive a confirmation email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading your preferences...</span>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Unable to load preferences</h2>
          <p className="text-gray-600 mt-2">Please try again later.</p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Preference Center</h1>
            <div className="flex items-center space-x-4">
              {hasUnsavedChanges && (
                <span className="text-orange-600 text-sm">Unsaved changes</span>
              )}
              <button
                onClick={savePreferences}
                disabled={saving || !hasUnsavedChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-1/4 pr-8">
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{tab.icon}</span>
                    <div>
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-sm opacity-75">{tab.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="w-3/4">
            <div className="bg-white rounded-lg shadow p-6">
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Privacy & Consent</h2>
                  <GranularConsentInterface
                    userId={userId}
                    onSave={async (consentPrefs) => {
                      await fetch(`/api/users/${userId}/consent`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ preferences: consentPrefs })
                      });
                    }}
                    initialPreferences={preferences.privacy?.consentPreferences}
                  />
                </div>
              )}

              {activeTab === 'communication' && (
                <CommunicationPreferencesPanel
                  preferences={preferences.communication}
                  onChange={(updates) => updatePreferences('communication', updates)}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationSettingsPanel
                  preferences={preferences.notifications}
                  onChange={(updates) => updatePreferences('notifications', updates)}
                />
              )}

              {activeTab === 'data' && (
                <DataManagementPanel
                  preferences={preferences.dataManagement}
                  onChange={(updates) => updatePreferences('dataManagement', updates)}
                  onExportData={exportUserData}
                  onDeleteAccount={deleteAccount}
                />
              )}

              {activeTab === 'security' && (
                <SecuritySettingsPanel
                  preferences={preferences.security}
                  onChange={(updates) => updatePreferences('security', updates)}
                />
              )}

              {activeTab === 'accessibility' && (
                <AccessibilitySettingsPanel
                  preferences={preferences.accessibility}
                  onChange={(updates) => updatePreferences('accessibility', updates)}
                />
              )}

              {activeTab === 'account' && (
                <AccountSettingsPanel
                  preferences={preferences.account}
                  onChange={(updates) => updatePreferences('account', updates)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual preference panels
const CommunicationPreferencesPanel: React.FC<{
  preferences: CommunicationPreferences;
  onChange: (updates: Partial<CommunicationPreferences>) => void;
}> = ({ preferences, onChange }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Communication Preferences</h2>
      
      <div className="space-y-6">
        {/* Email Preferences */}
        <div>
          <h3 className="text-lg font-medium mb-4">Email Communication</h3>
          <div className="space-y-3">
            {[
              { key: 'marketing', label: 'Marketing emails', description: 'Product updates, promotions, and newsletters' },
              { key: 'transactional', label: 'Transactional emails', description: 'Order confirmations, receipts, and account notifications' },
              { key: 'security', label: 'Security alerts', description: 'Login notifications and security warnings' },
              { key: 'product', label: 'Product updates', description: 'New features and service announcements' }
            ].map(item => (
              <label key={item.key} className="flex items-start">
                <input
                  type="checkbox"
                  checked={preferences.email?.[item.key] ?? true}
                  onChange={(e) => onChange({
                    email: { ...preferences.email, [item.key]: e.target.checked }
                  })}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-700">{item.label}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* SMS Preferences */}
        <div>
          <h3 className="text-lg font-medium mb-4">SMS/Text Messages</h3>
          <div className="space-y-3">
            {[
              { key: 'alerts', label: 'Security alerts', description: 'Critical security notifications' },
              { key: 'reminders', label: 'Reminders', description: 'Appointment and deadline reminders' },
              { key: 'promotions', label: 'Promotional messages', description: 'Special offers and discounts' }
            ].map(item => (
              <label key={item.key} className="flex items-start">
                <input
                  type="checkbox"
                  checked={preferences.sms?.[item.key] ?? false}
                  onChange={(e) => onChange({
                    sms: { ...preferences.sms, [item.key]: e.target.checked }
                  })}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-700">{item.label}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Language Preference */}
        <div>
          <h3 className="text-lg font-medium mb-4">Language</h3>
          <select
            value={preferences.language || 'en'}
            onChange={(e) => onChange({ language: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
            <option value="pt">Português</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const NotificationSettingsPanel: React.FC<{
  preferences: NotificationSettings;
  onChange: (updates: Partial<NotificationSettings>) => void;
}> = ({ preferences, onChange }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
      
      <div className="space-y-6">
        {/* In-App Notifications */}
        <div>
          <h3 className="text-lg font-medium mb-4">In-App Notifications</h3>
          <div className="space-y-3">
            {[
              { key: 'mentions', label: 'Mentions and replies', description: 'When someone mentions you or replies to your content' },
              { key: 'updates', label: 'System updates', description: 'Maintenance notices and system announcements' },
              { key: 'achievements', label: 'Achievements', description: 'Progress milestones and accomplishments' }
            ].map(item => (
              <label key={item.key} className="flex items-start">
                <input
                  type="checkbox"
                  checked={preferences.inApp?.[item.key] ?? true}
                  onChange={(e) => onChange({
                    inApp: { ...preferences.inApp, [item.key]: e.target.checked }
                  })}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-700">{item.label}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
          <div className="space-y-3">
            {[
              { key: 'enabled', label: 'Enable push notifications', description: 'Receive notifications on your device' },
              { key: 'sound', label: 'Sound', description: 'Play notification sounds' },
              { key: 'vibration', label: 'Vibration', description: 'Vibrate for notifications' }
            ].map(item => (
              <label key={item.key} className="flex items-start">
                <input
                  type="checkbox"
                  checked={preferences.push?.[item.key] ?? false}
                  onChange={(e) => onChange({
                    push: { ...preferences.push, [item.key]: e.target.checked }
                  })}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-700">{item.label}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div>
          <h3 className="text-lg font-medium mb-4">Quiet Hours</h3>
          <label className="flex items-start mb-4">
            <input
              type="checkbox"
              checked={preferences.quietHours?.enabled ?? false}
              onChange={(e) => onChange({
                quietHours: { ...preferences.quietHours, enabled: e.target.checked }
              })}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-700">Enable quiet hours</div>
              <div className="text-sm text-gray-500">Suppress non-critical notifications during specified hours</div>
            </div>
          </label>
          
          {preferences.quietHours?.enabled && (
            <div className="ml-7 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start time</label>
                <input
                  type="time"
                  value={preferences.quietHours.startTime || '22:00'}
                  onChange={(e) => onChange({
                    quietHours: { ...preferences.quietHours, startTime: e.target.value }
                  })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End time</label>
                <input
                  type="time"
                  value={preferences.quietHours.endTime || '08:00'}
                  onChange={(e) => onChange({
                    quietHours: { ...preferences.quietHours, endTime: e.target.value }
                  })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DataManagementPanel: React.FC<{
  preferences: DataManagementSettings;
  onChange: (updates: Partial<DataManagementSettings>) => void;
  onExportData: () => void;
  onDeleteAccount: () => void;
}> = ({ preferences, onChange, onExportData, onDeleteAccount }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Data Management</h2>
      
      <div className="space-y-8">
        {/* Data Export */}
        <div>
          <h3 className="text-lg font-medium mb-4">Data Export</h3>
          <p className="text-sm text-gray-600 mb-4">
            Download a copy of all your personal data in a machine-readable format.
          </p>
          <button
            onClick={onExportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Request Data Export
          </button>
        </div>

        {/* Data Retention */}
        <div>
          <h3 className="text-lg font-medium mb-4">Data Retention</h3>
          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={preferences.autoDelete?.enabled ?? false}
                onChange={(e) => onChange({
                  autoDelete: { ...preferences.autoDelete, enabled: e.target.checked }
                })}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">Automatic data deletion</div>
                <div className="text-sm text-gray-500">Automatically delete inactive data after specified period</div>
              </div>
            </label>
            
            {preferences.autoDelete?.enabled && (
              <div className="ml-7">
                <label className="block text-sm font-medium text-gray-700">Delete after</label>
                <select
                  value={preferences.autoDelete.period || '365'}
                  onChange={(e) => onChange({
                    autoDelete: { ...preferences.autoDelete, period: parseInt(e.target.value) }
                  })}
                  className="mt-1 block w-48 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="90">90 days</option>
                  <option value="180">6 months</option>
                  <option value="365">1 year</option>
                  <option value="730">2 years</option>
                  <option value="1095">3 years</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Account Deletion */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4 text-red-600">Delete Account</h3>
          <p className="text-sm text-gray-600 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={onDeleteAccount}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

const SecuritySettingsPanel: React.FC<{
  preferences: SecuritySettings;
  onChange: (updates: Partial<SecuritySettings>) => void;
}> = ({ preferences, onChange }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
      
      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <div>
          <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={preferences.twoFactorAuth?.enabled ?? false}
              onChange={(e) => onChange({
                twoFactorAuth: { ...preferences.twoFactorAuth, enabled: e.target.checked }
              })}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-700">Enable two-factor authentication</div>
              <div className="text-sm text-gray-500">Add an extra layer of security to your account</div>
            </div>
          </label>
        </div>

        {/* Session Management */}
        <div>
          <h3 className="text-lg font-medium mb-4">Session Management</h3>
          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={preferences.sessions?.logoutInactive ?? true}
                onChange={(e) => onChange({
                  sessions: { ...preferences.sessions, logoutInactive: e.target.checked }
                })}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">Auto-logout inactive sessions</div>
                <div className="text-sm text-gray-500">Automatically log out after period of inactivity</div>
              </div>
            </label>
            
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={preferences.sessions?.emailOnLogin ?? false}
                onChange={(e) => onChange({
                  sessions: { ...preferences.sessions, emailOnLogin: e.target.checked }
                })}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">Email on new login</div>
                <div className="text-sm text-gray-500">Send email notification for new device logins</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccessibilitySettingsPanel: React.FC<{
  preferences: AccessibilitySettings;
  onChange: (updates: Partial<AccessibilitySettings>) => void;
}> = ({ preferences, onChange }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Accessibility Settings</h2>
      
      <div className="space-y-6">
        {/* Visual Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4">Visual</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Theme</label>
              <select
                value={preferences.theme || 'system'}
                onChange={(e) => onChange({ theme: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="system">System default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="high-contrast">High contrast</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Font size</label>
              <select
                value={preferences.fontSize || 'medium'}
                onChange={(e) => onChange({ fontSize: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra large</option>
              </select>
            </div>
            
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={preferences.reduceMotion ?? false}
                onChange={(e) => onChange({ reduceMotion: e.target.checked })}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">Reduce motion</div>
                <div className="text-sm text-gray-500">Minimize animations and transitions</div>
              </div>
            </label>
          </div>
        </div>

        {/* Audio Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4">Audio</h3>
          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={preferences.screenReader ?? false}
                onChange={(e) => onChange({ screenReader: e.target.checked })}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">Screen reader optimization</div>
                <div className="text-sm text-gray-500">Optimize interface for screen readers</div>
              </div>
            </label>
            
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={preferences.soundAlerts ?? true}
                onChange={(e) => onChange({ soundAlerts: e.target.checked })}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">Sound alerts</div>
                <div className="text-sm text-gray-500">Play sounds for notifications and alerts</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountSettingsPanel: React.FC<{
  preferences: unknown;
  onChange: (updates: unknown) => void;
}> = ({ preferences, onChange }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
      
      <div className="space-y-6">
        {/* Profile Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Display name</label>
              <input
                type="text"
                value={preferences.displayName || ''}
                onChange={(e) => onChange({ displayName: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Time zone</label>
              <select
                value={preferences.timezone || 'UTC'}
                onChange={(e) => onChange({ timezone: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div>
          <h3 className="text-lg font-medium mb-4">Account Status</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">Account type</div>
                <div className="text-sm text-gray-500">Premium</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Member since</div>
                <div className="text-sm text-gray-500">January 2023</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icon components (simplified)
const ShieldIcon = () => <div className="w-5 h-5 bg-blue-500 rounded"></div>;
const ChatIcon = () => <div className="w-5 h-5 bg-green-500 rounded"></div>;
const BellIcon = () => <div className="w-5 h-5 bg-yellow-500 rounded"></div>;
const DatabaseIcon = () => <div className="w-5 h-5 bg-purple-500 rounded"></div>;
const LockIcon = () => <div className="w-5 h-5 bg-red-500 rounded"></div>;
const AccessibilityIcon = () => <div className="w-5 h-5 bg-indigo-500 rounded"></div>;
const UserIcon = () => <div className="w-5 h-5 bg-gray-500 rounded"></div>;
const CloseIcon = () => <div className="w-5 h-5 bg-gray-400 rounded"></div>;