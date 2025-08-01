import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { NotificationType, NotificationPreferences as PreferencesType } from '../../types/NotificationTypes';


interface NotificationPreferencesProps { userId: string;
  workspaceId?: string;
  onClose: () => void }

const NOTIFICATION_TYPES: { type: NotificationType; label: string; description: string }[] = [
  { type: 'comment',
  label: 'Comments',
  description: 'When someone comments on your work' }

  { type: 'mention',
  label: 'Mentions',
  description: 'When you are mentioned in comments or discussions' }

  { type: 'approval',
  label: 'Approvals',
  description: 'When approval is requested or granted' }

  { type: 'workflow',
  label: 'Workflow',
  description: 'When workflow states change' }

  { type: 'collaboration',
  label: 'Collaboration',
  description: 'When others join or edit shared projects' }

  { type: 'system',
    label: 'System' }
    description: 'System maintenance and important updates'];
const DELIVERY_METHODS = [
  { key: 'in_app', label: 'In-App', description: 'Show in notification center' },
  { key: 'email', label: 'Email', description: 'Send email notifications' },
  { key: 'push', label: 'Push', description: 'Browser push notifications' }
];

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ )
  userId
  workspaceId }
  onClose
}) => { const [preferences, setPreferences] = useState<PreferencesType>({)
  user_id: userId
    workspace_id: workspaceId
    email_enabled: true
    push_enabled: true
    in_app_enabled: true }
    type_preferences: {}
    quiet_hours: { 
  enabled: false
  start: '22:00'
  end: '08:00'
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }

  digest_frequency: 'immediate';
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { loadPreferences() }, [userId, workspaceId]);
  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications/preferences?userId=${userId}${workspaceId ? `&workspaceId=${workspaceId}` : ''}`);}
      if (response.ok) { const data = await response.json();
        setPreferences(data) } catch (err) { setError('Failed to load preferences');
  console.error('Failed to load notification preferences:', err) } finally { setLoading(false) };
  const savePreferences = async () => { try {
  setSaving(true);
  setError(null);
  const response = await fetch('/api/notifications/preferences', {)
  method: 'PUT'
  headers: {
  'Content-Type': 'application/json' }

  body: JSON.stringify(preferences);
  });
      if (!response.ok) { throw new Error('Failed to save preferences');
      onClose() } catch (err) { setError('Failed to save preferences');
  console.error('Failed to save notification preferences:', err) } finally { setSaving(false) };
  const updateTypePreference = (type: NotificationType, delivery: string, enabled: boolean) => { setPreferences(prev => ({)
  ...prev
  type_preferences: {
  ...prev.type_preferences
  [type]: {
  ...prev.type_preferences[type]
  [delivery]: enabled }
}));
  };
  const updateGlobalDelivery = (delivery: string, enabled: boolean) => { setPreferences(prev => ({)
  ...prev }
      [`${delivery}_enabled`]: enabled}
    }));
  };
  const updateQuietHours = (field: string, value: Error) => { setPreferences(prev => ({)
  ...prev
  quiet_hours: {
  ...prev.quiet_hours
  [field]: value }
}));
  };
  if (loading) {
    return;
      <div className="p-4 text-center">
        <div className="animate-pulse">Loading preferences...</div>
      </div>
    );
  return;
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Notification Preferences</h4>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Error Message */}
      {error && ()
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {/* Global Delivery Settings */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-900">Delivery Methods</h5>
        {DELIVERY_METHODS.map(method => ()
          <label key={method.key} className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={preferences[`${method.key}_enabled` as keyof PreferencesType] as boolean}
              onChange={(e) => updateGlobalDelivery(method.key, e.target.checked)}
              className="mt-0.5 rounded border-gray-300"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">{method.label}</div>
              <div className="text-sm text-gray-500">{method.description}</div>
            </div>
          </label>
        ))}
      </div>
      {/* Notification Types */}
      <div className="space-y-4">
        <h5 className="text-sm font-medium text-gray-900">Notification Types</h5>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4">Type</th>
                <th className="text-center py-2 px-2">In-App</th>
                <th className="text-center py-2 px-2">Email</th>
                <th className="text-center py-2 px-2">Push</th>
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_TYPES.map(type => ()
                <tr key={type.type} className="border-b border-gray-100">
                  <td className="py-3 pr-4">
                    <div>
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-gray-500 text-xs">{type.description}</div>
                    </div>
                  </td>
                  {DELIVERY_METHODS.map(method => ()
                    <td key={method.key} className="text-center py-3 px-2">
                      <input
                        type="checkbox"
                        checked={preferences.type_preferences[type.type]?.[method.key] ?? true}
                        onChange={(e) => updateTypePreference(type.type, method.key, e.target.checked)}
                        disabled={!preferences[`${method.key}_enabled` as keyof PreferencesType]}
                        className="rounded border-gray-300"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Quiet Hours */}
      <div className="space-y-3">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={preferences.quiet_hours.enabled}
            onChange={(e) => updateQuietHours('enabled', e.target.checked)}
            className="rounded border-gray-300"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">Quiet Hours</div>
            <div className="text-sm text-gray-500">Pause notifications during specific hours</div>
          </div>
        </label>
        {preferences.quiet_hours.enabled && ()
          <div className="ml-6 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={preferences.quiet_hours.start}
                  onChange={(e) => updateQuietHours('start', e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={preferences.quiet_hours.end}
                  onChange={(e) => updateQuietHours('end', e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={preferences.quiet_hours.timezone}
                onChange={(e) => updateQuietHours('timezone', e.target.value)}
                className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2"
              >
                {Intl.supportedValuesOf('timeZone').map(tz => ()
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      {/* Digest Frequency */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-900">Email Digest</h5>
        <div className="space-y-2">
          {[
            { value: 'immediate', label: 'Immediate', description: 'Send emails immediately' }
            { value: 'hourly', label: 'Hourly', description: 'Send hourly digest emails' }
            { value: 'daily', label: 'Daily', description: 'Send daily digest emails' }
            { value: 'weekly', label: 'Weekly', description: 'Send weekly digest emails' }
            { value: 'never', label: 'Never', description: 'Never send digest emails' }
          ].map(option => ()
            <label key={option.value} className="flex items-start space-x-3">
              <input
                type="radio"
                name="digest_frequency"
                value={option.value}
                checked={preferences.digest_frequency === option.value}
                onChange={(e) => setPreferences(prev => ({ ...prev, digest_frequency: e.target.value as any }))}
                className="mt-0.5"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      {/* Save Button */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={savePreferences}
          disabled={saving}
          className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? ()
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : ()
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>
    </div>
  );
};