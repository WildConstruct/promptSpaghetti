/**
 * Profile Settings - Comprehensive user profile management
 * 
 * Features:
 * - Profile information editing
 * - Avatar upload and management
 * - Preferences configuration
 * - Notification settings
 * - Privacy controls
 * - Account deletion
 */
import React, { useState, useEffect } from 'react';
import { 
  User, 
  // Mail, // Unused
  Globe, 
  Camera,
  Bell,
  Shield,
  Trash2,
  Save,
  Upload,
  X
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
interface UserProfile {
  id: string;,
  userId: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  website?: string;
  location?: string;
  timezone?: string;
  locale?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  profileCompleteness: number;
  interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';,
  language: string;
  timezone: string;,
  dateFormat: string;
  timeFormat: '12h' | '24h';,
  emailNotifications: {,
  account: boolean;,
  security: boolean;
  marketing: boolean;,
  product: boolean;
  social: boolean;
};
  pushNotifications: {,
  account: boolean;
  security: boolean;,
  marketing: boolean;
  product: boolean;,
  social: boolean;
};
  privacy: {,
  profileVisibility: 'public' | 'private';
  searchEngineIndexing: boolean;,
  activityStatus: boolean;
  readReceipts: boolean;
};
interface ProfileSettingsProps {
  className?: string;
  export const ProfileSettings: React.FC<ProfileSettingsProps> = ({,)
  className = ''
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'privacy' | 'danger'>('profile');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { user } = useAuthStore();
  useEffect(() => {
    if (user) {
      loadUserData();
  }, [user]);
  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');
      const [profileResponse, preferencesResponse] = await Promise.all([)
        fetch(`${API_BASE_URL}/auth/profile`, {)}
  },
  headers: {,
            'Authorization': `Bearer ${token}`}
}
            'Content-Type': 'application/json'
        }),
        fetch(`${API_BASE_URL}/auth/preferences`, {)}
  },
  headers: {,
            'Authorization': `Bearer ${token}`}
}
            'Content-Type': 'application/json'
  }
      ]);
      if (!profileResponse.ok || !preferencesResponse.ok) {
        throw new Error('Failed to load user data');
      const profileData = await profileResponse.json();
      const preferencesData = await preferencesResponse.json();
      setProfile(profileData.profile);
      setPreferences(preferencesData.preferences);
    } catch (error) {
  console.error('Error loading user data:', error);
  setError('Failed to load user data');
} finally {
      setLoading(false);
  };
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setSaving(true);
      setError(null);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {)}
  },
  method: 'PUT',
        headers: {,
          'Authorization': `Bearer ${token}`}
}
          'Content-Type': 'application/json'
  },
  body: JSON.stringify(updates);
  });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      const data = await response.json();
      setProfile(data.profile);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
  console.error('Error updating profile:', error);
  setError(error instanceof Error ? error.message : 'Failed to update profile');
} finally {
      setSaving(false);
  };
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      setSaving(true);
      setError(null);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/auth/preferences`, {)}
  },
  method: 'PUT',
        headers: {,
          'Authorization': `Bearer ${token}`}
}
          'Content-Type': 'application/json'
  },
  body: JSON.stringify(updates);
  });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update preferences');
      const data = await response.json();
      setPreferences(data.preferences);
      setSuccess('Preferences updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
  console.error('Error updating preferences:', error);
  setError(error instanceof Error ? error.message : 'Failed to update preferences');
} finally {
      setSaving(false);
  };
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar file must be less than 5MB');
      return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Avatar must be JPEG, PNG, GIF, or WebP');
      return;
    setAvatarFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  const uploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      setSaving(true);
      setError(null);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const response = await fetch(`${API_BASE_URL}/auth/avatar`, {)}
  },
  method: 'POST',
        headers: {,
          'Authorization': `Bearer ${token}`}
  },
  body: formData;
  });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload avatar');
      const data = await response.json();
      setProfile(prev => prev ? { ...prev, avatarUrl: data.avatarUrl } : null);
      setAvatarFile(null);
      setAvatarPreview(null);
      setSuccess('Avatar updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
  console.error('Error uploading avatar:', error);
  setError(error instanceof Error ? error.message : 'Failed to upload avatar');
} finally {
      setSaving(false);
  };
  const deleteAvatar = async () => {
    if (!confirm('Are you sure you want to delete your avatar?')) return;
    try {
      setSaving(true);
      setError(null);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/auth/avatar`, {)}
  },
  method: 'DELETE',
        headers: {,
          'Authorization': `Bearer ${token}`}
      });
      if (!response.ok) {
        throw new Error('Failed to delete avatar');
      setProfile(prev => prev ? { ...prev, avatarUrl: undefined } : null);
      setSuccess('Avatar deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
  console.error('Error deleting avatar:', error);
  setError('Failed to delete avatar');
} finally {
      setSaving(false);
  };
  const tabs = [;
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 }
  ];
  if (loading) {
    return;
      <div className={`profile-settings ${className}`}>}
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  return;
    <div className={`profile-settings ${className}`}>}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your profile, preferences, and account settings</p>
        </div>
        {/* Success/Error Messages */}
        {success && ()
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800">
              <span className="mr-2">✓</span>
              {success}
            </div>
          </div>
        )}
        {error && ()
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-800">
              <span className="mr-2">⚠</span>
              {error}
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return;
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'profile' | 'preferences' | 'notifications' | 'privacy' | 'danger')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
  activeTab === tab.id
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && profile && ()
              <ProfileTab
                profile={profile}
                onUpdate={updateProfile}
                onAvatarChange={handleAvatarChange}
                onAvatarUpload={uploadAvatar}
                onAvatarDelete={deleteAvatar}
                avatarPreview={avatarPreview}
                saving={saving}
              />
            )}
            {activeTab === 'preferences' && preferences && ()
              <PreferencesTab
                preferences={preferences}
                onUpdate={updatePreferences}
                saving={saving}
              />
            )}
            {activeTab === 'notifications' && preferences && ()
              <NotificationsTab
                preferences={preferences}
                onUpdate={updatePreferences}
                saving={saving}
              />
            )}
            {activeTab === 'privacy' && preferences && ()
              <PrivacyTab
                preferences={preferences}
                onUpdate={updatePreferences}
                saving={saving}
              />
            )}
            {activeTab === 'danger' && ()
              <DangerZoneTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTab: React.FC<{,
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;,
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;,
  onAvatarUpload: () => void;
  onAvatarDelete: () => void;,
  avatarPreview: string | null;
  saving: boolean;
}> = ({ profile, onUpdate, onAvatarChange, onAvatarUpload, onAvatarDelete, avatarPreview, saving }) => {
  const [formData, setFormData] = useState({)
  displayName: profile.displayName || '',
  firstName: profile.firstName || '',
  lastName: profile.lastName || '',
  bio: profile.bio || '',
  website: profile.website || '',
  location: profile.location || '',
  phoneNumber: profile.phoneNumber || '',
});
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };
  return;
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <img
            src={avatarPreview || profile.avatarUrl || '/default-avatar.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
          />
          {avatarPreview && ()
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">Preview</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Camera className="w-4 h-4 mr-2" />
              Change Avatar
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onAvatarChange}
              />
            </label>
            {avatarPreview && ()
              <button
                onClick={onAvatarUpload}
                disabled={saving}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </button>
            )}
            {profile.avatarUrl && ()
              <button
                onClick={onAvatarDelete}
                disabled={saving}
                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
              >
                <X className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500">Max 5MB. JPEG, PNG, GIF, or WebP.</p>
        </div>
      </div>
      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="How you'd like to be addressed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City, Country"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell us about yourself..."
            maxLength={500}
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.bio.length}/500 characters
          </p>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Additional tab components would be implemented here...
// PreferencesTab, NotificationsTab, PrivacyTab, DangerZoneTab
const PreferencesTab: React.FC<{,
  preferences: UserPreferences;
  onUpdate: (updates: Partial<UserPreferences>) => void;,
  saving: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}> = ({ preferences, onUpdate, saving }) => {
  // Implementation for preferences tab
  return <div>Preferences Tab - Coming Soon</div>;
};
const NotificationsTab: React.FC<{,
  preferences: UserPreferences;
  onUpdate: (updates: Partial<UserPreferences>) => void;,
  saving: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}> = ({ preferences, onUpdate, saving }) => {
  // Implementation for notifications tab
  return <div>Notifications Tab - Coming Soon</div>;
};
const PrivacyTab: React.FC<{,
  preferences: UserPreferences;
  onUpdate: (updates: Partial<UserPreferences>) => void;,
  saving: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}> = ({ preferences, onUpdate, saving }) => {
  // Implementation for privacy tab
  return <div>Privacy Tab - Coming Soon</div>;
};
const DangerZoneTab: React.FC = () => {
  // Implementation for danger zone tab
  return <div>Danger Zone Tab - Coming Soon</div>;
};

export default ProfileSettings;