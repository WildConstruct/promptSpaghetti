// Epic 11.2 User Profile Manager Component
// Comprehensive user profile management with inline editing
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
}
interface UserProfile {
  id?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  timezone?: string;
  locale?: string;
  createdAt?: string;
  updatedAt?: string;
  interface ProfileCompleteness {
  percentage: number;,
  completedFields: string;
  missingFields: string;
  interface UserProfileManagerProps {
  onProfileUpdate?: (profile: UserProfile) => void;
  showCompleteness?: boolean;
  allowImageUpload?: boolean;
  export const UserProfileManager: React.FC<UserProfileManagerProps> = ({,)
  onProfileUpdate,
  showCompleteness = true,
  allowImageUpload = true
}
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Partial<UserProfile>>({});
  // Available timezones and locales
  const timezones = [;
    'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo',
    'Asia/Shanghai', 'Asia/Mumbai', 'Australia/Sydney'
  ];
  const locales = [;
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'zh-CN', name: '中文' }
  ];
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/profile', {)
  headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data.profile);
      if (showCompleteness) {
        setCompleteness(data.completeness);
    } catch (error) {
  console.error('Error fetching profile:', error);
  setError('Failed to load profile');
} finally {
      setLoading(false);
  }, [showCompleteness]);
  useEffect(() => {
    if (user) {
      fetchProfile();
  }, [user, fetchProfile]);
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setSaving(true);
      setError(null);
      const response = await fetch('/api/auth/profile', {)
  method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
  },
  body: JSON.stringify(updates);
  });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      const data = await response.json();
      setProfile(data.profile);
      // Refresh completeness if showing
      if (showCompleteness) {
        await fetchProfile();
      onProfileUpdate?.(data.profile);
    } catch (error) {
  console.error('Error updating profile:', error);
  setError('Failed to update profile');
} finally {
      setSaving(false);
  };
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/auth/profile/avatar', {)
  method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
  },
  body: formData;
  });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      const data = await response.json();
      setProfile(prev => prev ? { ...prev, avatarUrl: data.avatarUrl } : null);
      onProfileUpdate?.(profile ? { ...profile, avatarUrl: data.avatarUrl } : {});
    } catch (error) {
  console.error('Error uploading image:', error);
  setError(error.message || 'Failed to upload image');
} finally {
      setUploadingImage(false);
  };
  const handleDeleteImage = async () => {
    try {
      setError(null);
      const response = await fetch('/api/auth/profile/avatar', {)
  method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
      });
      if (!response.ok) {
        throw new Error('Failed to delete image');
      setProfile(prev => prev ? { ...prev, avatarUrl: null } : null);
      onProfileUpdate?.(profile ? { ...profile, avatarUrl: null } : {});
    } catch (error) {
  console.error('Error deleting image:', error);
  setError('Failed to delete image');
};
  const startEdit = (field: string, currentValue: Error) => {
    setEditMode(field);
    setTempValues({ [field]: currentValue });
  };
  const cancelEdit = () => {
    setEditMode(null);
    setTempValues({});
  };
  const saveEdit = async (field: string) => {
    if (tempValues[field] !== undefined) {
      await updateProfile({ [field]: tempValues[field] });
    setEditMode(null);
    setTempValues({});
  };
  const handleTempValueChange = (field: string, value: Error) => {
    setTempValues(prev => ({ ...prev, [field]: value }));
  };
  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  if (loading) {
    return;
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  return;
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profile?.avatarUrl ? ()
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : ()
                <div className="text-2xl text-gray-400">
                  {profile?.displayName?.[0]?.toUpperCase() || 
                   profile?.firstName?.[0]?.toUpperCase() || 
                   user?.email?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            {allowImageUpload && ()
              <div className="absolute bottom-0 right-0">
                <label className="cursor-pointer">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                    {uploadingImage ? ()
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : ()
                      <span className="text-xs">📷</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            )}
          </div>
          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.displayName || profile?.firstName || 'Anonymous User'}
              </h1>
              {profile?.avatarUrl && ()
                <button
                  onClick={handleDeleteImage}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Photo
                </button>
              )}
            </div>
            <p className="text-gray-600">{user?.email}</p>
            {profile?.bio && ()
              <p className="text-gray-700 mt-2">{profile.bio}</p>
            )}
          </div>
        </div>
        {/* Profile Completeness */}
        {showCompleteness && completeness && ()
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
              <span className={`text-sm font-bold ${getCompletenessColor(completeness.percentage)}`}>}
                {completeness.percentage}%
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completeness.percentage}%` }}
              />
            </div>
            {completeness.missingFields.length > 0 && ()
              <p className="text-sm text-gray-600 mt-2">
                Missing: {completeness.missingFields.join(', ')}
              </p>
            )}
          </div>
        )}
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
      {/* Profile Fields */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
        <div className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            {editMode === 'displayName' ? ()
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tempValues.displayName || ''}
                  onChange={(e) => handleTempValueChange('displayName', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your display name"
                />
                <button
                  onClick={() => saveEdit('displayName')}
                  disabled={saving}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : ()
              <div className="flex items-center justify-between">
                <span className="text-gray-900">
                  {profile?.displayName || <span className="text-gray-400">Not set</span>}
                </span>
                <button
                  onClick={() => startEdit('displayName', profile?.displayName)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            {editMode === 'firstName' ? ()
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tempValues.firstName || ''}
                  onChange={(e) => handleTempValueChange('firstName', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your first name"
                />
                <button
                  onClick={() => saveEdit('firstName')}
                  disabled={saving}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : ()
              <div className="flex items-center justify-between">
                <span className="text-gray-900">
                  {profile?.firstName || <span className="text-gray-400">Not set</span>}
                </span>
                <button
                  onClick={() => startEdit('firstName', profile?.firstName)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            {editMode === 'lastName' ? ()
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tempValues.lastName || ''}
                  onChange={(e) => handleTempValueChange('lastName', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your last name"
                />
                <button
                  onClick={() => saveEdit('lastName')}
                  disabled={saving}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : ()
              <div className="flex items-center justify-between">
                <span className="text-gray-900">
                  {profile?.lastName || <span className="text-gray-400">Not set</span>}
                </span>
                <button
                  onClick={() => startEdit('lastName', profile?.lastName)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            {editMode === 'bio' ? ()
              <div className="space-y-2">
                <textarea
                  value={tempValues.bio || ''}
                  onChange={(e) => handleTempValueChange('bio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-sm text-gray-500 text-right">
                  {(tempValues.bio || '').length}/500
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveEdit('bio')}
                    disabled={saving}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : ()
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {profile?.bio ? ()
                    <p className="text-gray-900 whitespace-pre-wrap">{profile.bio}</p>
                  ) : ()
                    <span className="text-gray-400">Not set</span>
                  )}
                </div>
                <button
                  onClick={() => startEdit('bio', profile?.bio)}
                  className="text-blue-600 hover:text-blue-800 text-sm ml-2"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            {editMode === 'timezone' ? ()
              <div className="flex space-x-2">
                <select
                  value={tempValues.timezone || ''}
                  onChange={(e) => handleTempValueChange('timezone', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timezones.map(tz => ()
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
                <button
                  onClick={() => saveEdit('timezone')}
                  disabled={saving}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : ()
              <div className="flex items-center justify-between">
                <span className="text-gray-900">
                  {profile?.timezone || 'UTC'}
                </span>
                <button
                  onClick={() => startEdit('timezone', profile?.timezone)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          {/* Locale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            {editMode === 'locale' ? ()
              <div className="flex space-x-2">
                <select
                  value={tempValues.locale || ''}
                  onChange={(e) => handleTempValueChange('locale', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {locales.map(locale => ()
                    <option key={locale.code} value={locale.code}>{locale.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => saveEdit('locale')}
                  disabled={saving}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : ()
              <div className="flex items-center justify-between">
                <span className="text-gray-900">
                  {locales.find(l => l.code === profile?.locale)?.name || 'English (US)'}
                </span>
                <button
                  onClick={() => startEdit('locale', profile?.locale)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-gray-900">{user?.email}</span>
              {user?.emailVerified && ()
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              )}
            </div>
          </div>
          {profile?.createdAt && ()
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <span className="text-gray-900">
                {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileManager;