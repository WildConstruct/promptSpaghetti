/**
 * Epic 9.2.5 - Notification Preferences Component
 * User interface for managing notification settings and preferences
 */
import React, { useState, useEffect } from 'react';
import { NotificationManager, NotificationPreferences as PrefsType } from './NotificationManager';
interface NotificationPreferencesProps {
  notificationManager: NotificationManager;
  className?: string;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({)
  notificationManager,
  className = ''
}) => {
  const [preferences, setPreferences] = useState<PrefsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  useEffect(() => {
    loadPreferences();
    checkBrowserPermission();
  }, []);
  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await notificationManager.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };
  const checkBrowserPermission = () => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  };
  const requestBrowserPermission = async () => {
    const permission = await notificationManager.requestPermission();
    setBrowserPermission(permission);
  };
  const updatePreferences = (updates: Partial<PrefsType>) => {
    if (!preferences) return;
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    setHasChanges(true);
  };
  const updateTypePreferences = (type: keyof PrefsType, updates: unknown) => {
    if (!preferences) return;
    const newPrefs = {
      ...preferences,
      [type]: { ...preferences[type], ...updates }
    };
    setPreferences(newPrefs);
    setHasChanges(true);
  };
  const savePreferences = async () => {
    if (!preferences || !hasChanges) return;
    try {
      setSaving(true);
      await notificationManager.updatePreferences(preferences);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };
  const resetToDefaults = () => {
    // This would reset to default preferences
    loadPreferences();
    setHasChanges(false);
  };
  if (loading || !preferences) {
    return ();
      <div className={`notification-preferences ${className}`}>}
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  return ();
    <div className={`notification-preferences ${className} max-w-4xl mx-auto`}>}
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
        <p className="text-gray-600">
          Customize how and when you receive notifications to stay informed without being overwhelmed.
        </p>
      </div>
      {/* Browser Permission Warning */}
      {browserPermission !== 'granted' && ()
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Browser notifications disabled</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Enable browser notifications to receive real-time alerts even when the app isn't active.
              </p>
              <button
                onClick={requestBrowserPermission}
                className="mt-2 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
              >
                Enable Browser Notifications
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-8">
        {/* Global Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">In-app notifications</h4>
                <p className="text-sm text-gray-500">Show notifications within the application</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.in_app_enabled}
                  onChange={(e) => updatePreferences({ in_app_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Email notifications</h4>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email_enabled}
                  onChange={(e) => updatePreferences({ email_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Push notifications</h4>
                <p className="text-sm text-gray-500">Browser push notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.push_enabled}
                  onChange={(e) => updatePreferences({ push_enabled: e.target.checked })}
                  disabled={browserPermission !== 'granted'}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>
          </div>
        </div>
        {/* Notification Types */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
          <div className="space-y-6">
            {/* Comments */}
            <NotificationTypeSection
              title="Comments & Mentions"
              description="When someone comments on your work or mentions you"
              icon="💬"
              preferences={preferences.comments}
              onChange={(updates) => updateTypePreferences('comments', updates)}
              extraOptions={
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="mentions-only"
                    checked={preferences.comments.mentions_only}
                    onChange={(e) => updateTypePreferences('comments', { mentions_only: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="mentions-only" className="ml-2 text-sm text-gray-700">
                    Only notify for @mentions
                  </label>
                </div>
              }
            />
            {/* Collaboration */}
            <NotificationTypeSection
              title="Collaboration"
              description="Real-time editing, user presence, and shared activities"
              icon="👥"
              preferences={preferences.collaboration}
              onChange={(updates) => updateTypePreferences('collaboration', updates)}
              extraOptions={
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="presence-updates"
                    checked={preferences.collaboration.presence_updates}
                    onChange={(e) => updateTypePreferences('collaboration', { presence_updates: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="presence-updates" className="ml-2 text-sm text-gray-700">
                    Show presence updates
                  </label>
                </div>
              }
            />
            {/* Workspace */}
            <NotificationTypeSection
              title="Workspace"
              description="Workspace invitations, member changes, and project updates"
              icon="🏢"
              preferences={preferences.workspace}
              onChange={(updates) => updateTypePreferences('workspace', updates)}
              extraOptions={
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="member-changes"
                    checked={preferences.workspace.member_changes}
                    onChange={(e) => updateTypePreferences('workspace', { member_changes: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="member-changes" className="ml-2 text-sm text-gray-700">
                    Notify about member changes
                  </label>
                </div>
              }
            />
            {/* Approvals */}
            <NotificationTypeSection
              title="Approvals & Reviews"
              description="Approval requests, review status, and workflow updates"
              icon="✅"
              preferences={preferences.approvals}
              onChange={(updates) => updateTypePreferences('approvals', updates)}
            />
            {/* System */}
            <NotificationTypeSection
              title="System Notifications"
              description="Maintenance, security alerts, and system updates"
              icon="⚙️"
              preferences={preferences.system}
              onChange={(updates) => updateTypePreferences('system', updates)}
              extraOptions={
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="maintenance-only"
                    checked={preferences.system.maintenance_only}
                    onChange={(e) => updateTypePreferences('system', { maintenance_only: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="maintenance-only" className="ml-2 text-sm text-gray-700">
                    Only maintenance notifications
                  </label>
                </div>
              }
            />
          </div>
        </div>
        {/* Quiet Hours */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiet Hours</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Enable quiet hours</h4>
                <p className="text-sm text-gray-500">Reduce notifications during specified hours</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.quiet_hours.enabled}
                  onChange={(e) => updateTypePreferences('quiet_hours', { enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {preferences.quiet_hours.enabled && ()
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                  <input
                    type="time"
                    value={preferences.quiet_hours.start_time}
                    onChange={(e) => updateTypePreferences('quiet_hours', { start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
                  <input
                    type="time"
                    value={preferences.quiet_hours.end_time}
                    onChange={(e) => updateTypePreferences('quiet_hours', { end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Digest Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Digest</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Enable email digest</h4>
                <p className="text-sm text-gray-500">Receive a summary of notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.digest.enabled}
                  onChange={(e) => updateTypePreferences('digest', { enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {preferences.digest.enabled && ()
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    value={preferences.digest.frequency}
                    onChange={(e) => updateTypePreferences('digest', { frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={preferences.digest.time}
                    onChange={(e) => updateTypePreferences('digest', { time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Reset to Defaults
        </button>
        <div className="flex space-x-3">
          {hasChanges && ()
            <span className="text-sm text-gray-500 py-2">Unsaved changes</span>
          )}
          <button
            onClick={savePreferences}
            disabled={!hasChanges || saving}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};
interface NotificationTypeSectionProps {
  title: string;
  description: string;
  icon: string;
  preferences: {,
    enabled: boolean;
    channels: ('in_app' | 'email' | 'push')[];
  };
  onChange: (updates: unknown) => void;
  extraOptions?: React.ReactNode;
}
const NotificationTypeSection: React.FC<NotificationTypeSectionProps> = ({)
  title,
  description,
  icon,
  preferences,
  onChange,
  extraOptions
}) => {
  const toggleChannel = (channel: 'in_app' | 'email' | 'push') => {
    const newChannels = preferences.channels.includes(channel);
      ? preferences.channels.filter(c => c !== channel)
      : [...preferences.channels, channel];
    onChange({ channels: newChannels });
  };
  return ();
    <div className="border border-gray-100 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{title}</h4>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
      {preferences.enabled && ()
        <div className="ml-11 space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Delivery channels:</p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.channels.includes('in_app')}
                  onChange={() => toggleChannel('in_app')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">In-app</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.channels.includes('email')}
                  onChange={() => toggleChannel('email')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Email</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.channels.includes('push')}
                  onChange={() => toggleChannel('push')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Push</span>
              </label>
            </div>
          </div>
          {extraOptions}
        </div>
      )}
    </div>
  );
};