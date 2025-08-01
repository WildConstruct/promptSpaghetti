/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

// Epic 11.2 Notification Preferences Component
// Comprehensive notification preferences with multi-channel support
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';


interface NotificationPreferences {
  email: {,
  enabled: boolean;,
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';,
  types: {,
  security: boolean;,
  system: boolean;,
  updates: boolean;,
  marketing: boolean;


};
  };
  inApp: {,
  enabled: boolean;
  types: {,
  security: boolean;,
  system: boolean;,
  updates: boolean;,
  mentions: boolean;
};
  };
  push: {,
  enabled: boolean;
  types: {,
  security: boolean;,
  system: boolean;,
  updates: boolean;,
  mentions: boolean;
};
  };
  quietHours: {,
  enabled: boolean;
  start: string;,
  end: string;,
  timezone: string;
};


interface NotificationPreferencesProps {
  onPreferencesUpdate?: (preferences: NotificationPreferences) => void;
  export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({),
  onPreferencesUpdate


}) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Mumbai',
    'Australia/Sydney'
  ];
  useEffect(() => {
    if (user) {
      fetchPreferences();
  }, [user]);
  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/preferences/notifications', {)
  headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
      });
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      const data = await response.json();
      setPreferences(data.preferences);
 catch (error) {
  console.error('Error fetching notification preferences:', error);
  setError('Failed to load notification preferences');
 finally {
      setLoading(false);
  };
  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!preferences) return;
    try {
      setSaving(true);
      setError(null);
      const newPreferences = { ...preferences, ...updates };
      const response = await fetch('/api/auth/preferences/notifications', {)
  method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
  },
  body: JSON.stringify(newPreferences);
  });
      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      const data = await response.json();
      setPreferences(data.preferences);
      onPreferencesUpdate?.(data.preferences);
 catch (error) {
  console.error('Error updating notification preferences:', error);
  setError('Failed to update notification preferences');
 finally {
      setSaving(false);
  };
  const handleChannelToggle = (channel: keyof NotificationPreferences, enabled: boolean) => {
  if (!preferences) return;
  updatePreferences({)
  [channel]: {,
  ...preferences[channel],
  enabled
});
  };
  const handleTypeToggle = (;);
    channel: keyof NotificationPreferences,
    type: string,
    enabled: boolean) => {,
  if (!preferences) return;
  updatePreferences({)
  [channel]: {
  ...preferences[channel],
  types: {,
  ...preferences[channel].types,
  [type]: enabled,
});
  };
  const handleFrequencyChange = (frequency: 'immediate' | 'daily' | 'weekly' | 'never') => {
  if (!preferences) return;
  updatePreferences({)
  email: {,
  ...preferences.email,
  frequency
});
  };
  const handleQuietHoursToggle = (enabled: boolean) => {
  if (!preferences) return;
  updatePreferences({)
  quietHours: {,
  ...preferences.quietHours,
  enabled
});
  };
  const handleQuietHoursChange = (field: string, value: string) => {
  if (!preferences) return;
  updatePreferences({)
  quietHours: {,
  ...preferences.quietHours,
  [field]: value,
});
  };
  if (loading) {
    return;
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  if (!preferences) {
    return;
      <div className="text-center py-8">
        <div className="text-gray-600">Failed to load notification preferences</div>
      </div>
    );
  return;
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Notification Preferences</h2>
        <p className="text-gray-600">
          Manage how and when you receive notifications across different channels.
        </p>
      </div>
      {/* Error Message */}
      {error && ()
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-700">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}
      {/* Email Notifications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-600">Receive notifications via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email.enabled}
              onChange={(e) => handleChannelToggle('email', e.target.checked)}
              className="sr-only peer"
              disabled={saving}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {preferences.email.enabled && ()
          <div className="space-y-4">
            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Frequency
              </label>
              <select
                value={preferences.email.frequency}
                onChange={(e) => handleFrequencyChange(e.target.value as 'immediate' | 'daily' | 'weekly' | 'monthly')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly digest</option>
                <option value="never">Never</option>
              </select>
            </div>
            {/* Notification Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Types
              </label>
              <div className="space-y-2">
                {Object.entries(preferences.email.types).map(([type, enabled]) => ()
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handleTypeToggle('email', type, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={saving}
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {type} notifications
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* In-App Notifications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">In-App Notifications</h3>
            <p className="text-sm text-gray-600">Receive notifications within the application</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.inApp.enabled}
              onChange={(e) => handleChannelToggle('inApp', e.target.checked)}
              className="sr-only peer"
              disabled={saving}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {preferences.inApp.enabled && ()
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              In-App Types
            </label>
            <div className="space-y-2">
              {Object.entries(preferences.inApp.types).map(([type, enabled]) => ()
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleTypeToggle('inApp', type, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={saving}
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {type} notifications
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Push Notifications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
            <p className="text-sm text-gray-600">Receive browser push notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.push.enabled}
              onChange={(e) => handleChannelToggle('push', e.target.checked)}
              className="sr-only peer"
              disabled={saving}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {preferences.push.enabled && ()
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Push Types
            </label>
            <div className="space-y-2">
              {Object.entries(preferences.push.types).map(([type, enabled]) => ()
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleTypeToggle('push', type, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={saving}
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {type} notifications
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Quiet Hours */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Quiet Hours</h3>
            <p className="text-sm text-gray-600">Pause notifications during specific hours</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.quietHours.enabled}
              onChange={(e) => handleQuietHoursToggle(e.target.checked)}
              className="sr-only peer"
              disabled={saving}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {preferences.quietHours.enabled && ()
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={preferences.quietHours.start}
                onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={preferences.quietHours.end}
                onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={preferences.quietHours.timezone}
                onChange={(e) => handleQuietHoursChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                {timezones.map(tz => ()
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      {/* Save Status */}
      {saving && ()
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center text-blue-700">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            Saving preferences...
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPreferences;