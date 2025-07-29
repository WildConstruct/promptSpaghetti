// Epic 11.4 Organization Manager Component
// React component for comprehensive organization management with settings and branding
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Globe, 
  Crown,
  Shield,
  BarChart3,
  ChevronRight,
  Palette
} from 'lucide-react';
interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  branding: Record<string, unknown>;
  settings: Record<string, unknown>;
  plan: 'free' | 'pro' | 'enterprise';
  maxUsers: number;
  createdAt: Date;
  updatedAt: Date;
  interface OrganizationStats {
  totalMembers: number;
  totalTeams: number;
  activeTeams: number;
  recentActivity: number;
  planLimits: {
  maxUsers: number;
  maxTeams: number;
  maxStorage: number;
};
  usage: {
  users: number;
  teams: number;
  storage: number;
};
interface CreateOrganizationData {
  name: string;
  slug?: string;
  description?: string;
  website?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  maxUsers?: number;
  settings?: Record<string, unknown>;
  branding?: Record<string, unknown>;
interface OrganizationManagerProps {
  currentUser?: { id: string; name: string; email: string; role: string };
  onOrganizationChange?: (org: Organization) => void;
  onInvitationSent?: (invitation: { id: string; email: string; role: string }) => void;
  onMembershipUpdated?: (membership: { id: string; userId: string; role: string }) => void;

export const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'branding' | 'members' | 'teams'>('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Form state for creating/editing organizations
  const [formData, setFormData] = useState<CreateOrganizationData>({)
  name: '',
    slug: '',
    description: '',
    website: '',
    plan: 'free',
    settings: {},
    branding: {}
  });
  useEffect(() => {
    loadOrganizations();
  }, []);
  useEffect(() => {
    if (selectedOrg) {
      loadOrganizationStats(selectedOrg.id);
  }, [selectedOrg]);
  const loadOrganizations = async () => {
  try {
  setLoading(true);
  const response = await fetch('/api/auth/organizations/my', {)
  credentials: 'include',
});
      if (!response.ok) {
        throw new Error('Failed to load organizations');
      const data = await response.json();
      setOrganizations(data.data);
      // Auto-select first organization
      if (data.data.length > 0 && !selectedOrg) {
        setSelectedOrg(data.data[0]);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load organizations');
} finally {
      setLoading(false);
  };
  const loadOrganizationStats = async (organizationId: string) => {
    try {
      const response = await fetch(`/api/auth/organizations/${organizationId}/stats`, {)}
  },
  credentials: 'include'
  });
      if (!response.ok) {
        throw new Error('Failed to load organization stats');
      const data = await response.json();
      setStats(data.data);
    } catch (err) {
  console.error('Failed to load organization stats:', err);
};
  const createOrganization = async () => {
  try {
  const response = await fetch('/api/auth/organizations', {)
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
},
  credentials: 'include',
        body: JSON.stringify(formData);
  });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create organization');
      const data = await response.json();
      setOrganizations(prev => [...prev, data.data]);
      setSelectedOrg(data.data);
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to create organization');
};
  const updateOrganization = async () => {
    if (!editingOrg) return;
    try {
      const response = await fetch(`/api/auth/organizations/${editingOrg.id}`, {)}
  },
  method: 'PUT',
        headers: {
  'Content-Type': 'application/json',
},
  credentials: 'include',
        body: JSON.stringify(formData);
  });
      if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error || 'Failed to update organization');
  const data = await response.json();
  setOrganizations(prev => )
  prev.map(org => org.id === editingOrg.id ? data.data : org));
  if (selectedOrg?.id === editingOrg.id) {
  setSelectedOrg(data.data);
  setEditingOrg(null);
  resetForm();
} catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to update organization');
};
  const deleteOrganization = async (organizationId: string) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    try {
      const response = await fetch(`/api/auth/organizations/${organizationId}`, {)}
  },
  method: 'DELETE',
        credentials: 'include'
  });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete organization');
      setOrganizations(prev => prev.filter(org => org.id !== organizationId));
      if (selectedOrg?.id === organizationId) {
        setSelectedOrg(organizations.find(org => org.id !== organizationId) || null);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to delete organization');
};
  const resetForm = () => {
    setFormData({)
  name: '',
      slug: '',
      description: '',
      website: '',
      plan: 'free',
      settings: {},
      branding: {}
    });
  };
  const startEditing = (org: Organization) => {
  setEditingOrg(org);
  setFormData({)
  name: org.name,
  slug: org.slug,
  description: org.description || '',
  website: org.website || '',
  plan: org.plan,
  settings: org.settings,
  branding: org.branding,
});
  };
  const getPlanColor = (plan: string) => {
  switch (plan) {
  case 'free': return 'text-gray-600';
  case 'pro': return 'text-blue-600';
  case 'enterprise': return 'text-purple-600';
  default: return 'text-gray-600';
};
  const getPlanBadge = (plan: string) => {
  switch (plan) {
  case 'free': return 'bg-gray-100 text-gray-800';
  case 'pro': return 'bg-blue-100 text-blue-800';
  case 'enterprise': return 'bg-purple-100 text-purple-800';
  default: return 'bg-gray-100 text-gray-800';
};
  if (loading) {
    return;
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  return;
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600 mt-2">Manage your organizations and teams</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Organization
        </button>
      </div>
      {error && ()
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Organization List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Organizations</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {organizations.map((org) => ()
                <div
                  key={org.id}
                  onClick={() => setSelectedOrg(org)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
  selectedOrg?.id === org.id ? 'bg-blue-50 border-r-2 border-blue-600' : '',
}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {org.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">@{org.slug}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${getPlanBadge(org.plan)}`}>}
                        {org.plan.charAt(0).toUpperCase() + org.plan.slice(1)}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Organization Details */}
        <div className="lg:col-span-3">
          {selectedOrg ? ()
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {selectedOrg.logoUrl ? ()
                        <img 
                          src={selectedOrg.logoUrl} 
                          alt={selectedOrg.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : ()
                        <Building2 className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedOrg.name}</h2>
                      <p className="text-gray-600">@{selectedOrg.slug}</p>
                      {selectedOrg.description && ()
                        <p className="text-sm text-gray-500 mt-2">{selectedOrg.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(selectedOrg)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteOrganization(selectedOrg.id)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'settings', label: 'Settings', icon: Settings },
                    { id: 'branding', label: 'Branding', icon: Palette },
                    { id: 'members', label: 'Members', icon: Users },
                    { id: 'teams', label: 'Teams', icon: Shield }
                  ].map((tab) => ()
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
  activeTab === tab.id
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
}`}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && stats && ()
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{stats.totalMembers}</div>
                        <div className="text-sm text-gray-600">Total Members</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {stats.usage.users}/{stats.planLimits.maxUsers} limit
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{stats.totalTeams}</div>
                        <div className="text-sm text-gray-600">Teams</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {stats.usage.teams}/{stats.planLimits.maxTeams} limit
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{stats.recentActivity}</div>
                        <div className="text-sm text-gray-600">Recent Activity</div>
                        <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className={`text-2xl font-bold ${getPlanColor(selectedOrg.plan)}`}>}
                          {selectedOrg.plan.charAt(0).toUpperCase() + selectedOrg.plan.slice(1)}
                        </div>
                        <div className="text-sm text-gray-600">Current Plan</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {(stats.usage.storage / 1024).toFixed(1)}GB / {(stats.planLimits.maxStorage / 1024).toFixed(0)}GB
                        </div>
                      </div>
                    </div>
                    {/* Quick Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Organization Info</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {selectedOrg.website || 'No website set'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Crown className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            Created {new Date(selectedOrg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'settings' && ()
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Organization Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Name
                        </label>
                        <div className="text-sm text-gray-900">{selectedOrg.name}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slug
                        </label>
                        <div className="text-sm text-gray-900">@{selectedOrg.slug}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plan
                        </label>
                        <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getPlanBadge(selectedOrg.plan)}`}>}
                          {selectedOrg.plan.charAt(0).toUpperCase() + selectedOrg.plan.slice(1)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Users
                        </label>
                        <div className="text-sm text-gray-900">{selectedOrg.maxUsers}</div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'branding' && ()
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Branding & Appearance</h3>
                    <div className="text-sm text-gray-600">
                      Customize your organization's visual identity and branding.
                    </div>
                    {/* Branding controls would go here */}
                  </div>
                )}
                {activeTab === 'members' && ()
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                    <div className="text-sm text-gray-600">
                      Manage organization members and their roles.
                    </div>
                    {/* Member management would go here */}
                  </div>
                )}
                {activeTab === 'teams' && ()
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Teams</h3>
                    <div className="text-sm text-gray-600">
                      Create and manage teams within your organization.
                    </div>
                    {/* Team management would go here */}
                  </div>
                )}
              </div>
            </div>
          ) : ()
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Selected</h3>
              <p className="text-gray-600">Select an organization from the list to view details</p>
            </div>
          )}
        </div>
      </div>
      {/* Create/Edit Organization Modal */}
      {(showCreateForm || editingOrg) && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingOrg ? 'Edit Organization' : 'Create Organization'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter organization name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="organization-slug"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe your organization"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan
                </label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value as 'free' | 'pro' | 'enterprise' }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingOrg(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingOrg ? updateOrganization : createOrganization}
                disabled={!formData.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingOrg ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};