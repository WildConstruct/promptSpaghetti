// Epic 11.4 Team Manager Component
// React component for team management with hierarchical structure and member management
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Crown,
  Shield,
  User,
  Eye,
  ChevronRight,
  ChevronDown,
  UserPlus,
  Settings,
  Activity
} from 'lucide-react';
interface Team {
  id: string;
  organizationId: string;
  parentTeamId?: string;
  name: string;
  description?: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  level?: number;
  path?: string[];
}
interface TeamMember {
  id: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  invitedBy?: string;
  user: {,
    id: string;
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}
interface CreateTeamData {
  name: string;
  description?: string;
  parentTeamId?: string;
  settings?: Record<string, unknown>;
}
interface TeamManagerProps {
  organizationId: string;
  currentUser?: { id: string; name: string; email: string; role: string };
  onTeamChange?: (team: Team) => void;
  onMembershipUpdated?: (membership: { id: string; userId: string; teamId: string; role: string }) => void;
}

export const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Form state
  const [formData, setFormData] = useState<CreateTeamData>({)
    name: '',
    description: '',
    parentTeamId: '',
    settings: {}
  });
  const [memberFormData, setMemberFormData] = useState({)
    userId: '',
    role: 'member' as 'owner' | 'admin' | 'member' | 'viewer',
  });
  useEffect(() => {
    loadTeams();
  }, [organizationId]);
  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam.id);
    }
  }, [selectedTeam]);
  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/auth/organizations/${organizationId}/teams/hierarchy`, {)}
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to load teams');
      }
      const data = await response.json();
      setTeams(data.data);
      // Auto-select first team
      if (data.data.length > 0 && !selectedTeam) {
        setSelectedTeam(data.data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };
  const loadTeamMembers = async (teamId: string) => {
    try {
      const response = await fetch(`/api/auth/teams/${teamId}/members`, {)}
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to load team members');
      }
      const data = await response.json();
      setTeamMembers(data.data);
    } catch (err) {
      console.error('Failed to load team members:', err);
    }
  };
  const createTeam = async () => {
    try {
      const response = await fetch(`/api/auth/organizations/${organizationId}/teams`, {)}
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({),
          ...formData,
          parentTeamId: formData.parentTeamId || undefined,
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create team');
      }
      const data = await response.json();
      await loadTeams(); // Reload to get hierarchy
      setSelectedTeam(data.data);
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    }
  };
  const updateTeam = async () => {
    if (!editingTeam) return;
    try {
      const response = await fetch(`/api/auth/teams/${editingTeam.id}`, {)}
        method: 'PUT',
        headers: {,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({),
          ...formData,
          parentTeamId: formData.parentTeamId || undefined,
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update team');
      }
      await loadTeams();
      setEditingTeam(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team');
    }
  };
  const deleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`/api/auth/teams/${teamId}`, {)}
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete team');
      }
      await loadTeams();
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(teams.find(team => team.id !== teamId) || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team');
    }
  };
  const addTeamMember = async () => {
    if (!selectedTeam) return;
    try {
      const response = await fetch(`/api/auth/teams/${selectedTeam.id}/members`, {)}
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(memberFormData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add team member');
      }
      await loadTeamMembers(selectedTeam.id);
      setShowAddMember(false);
      setMemberFormData({ userId: '', role: 'member' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team member');
    }
  };
  const removeTeamMember = async (userId: string) => {
    if (!selectedTeam || !confirm('Are you sure you want to remove this member?')) return;
    try {
      const response = await fetch(`/api/auth/teams/${selectedTeam.id}/members/${userId}`, {)}
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove team member');
      }
      await loadTeamMembers(selectedTeam.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team member');
    }
  };
  const updateMemberRole = async (userId: string, newRole: string) => {
    if (!selectedTeam) return;
    try {
      const response = await fetch(`/api/auth/teams/${selectedTeam.id}/members/${userId}`, {)}
        method: 'PUT',
        headers: {,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update member role');
      }
      await loadTeamMembers(selectedTeam.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role');
    }
  };
  const resetForm = () => {
    setFormData({)
      name: '',
      description: '',
      parentTeamId: '',
      settings: {}
    });
  };
  const startEditing = (team: Team) => {
    setEditingTeam(team);
    setFormData({)
      name: team.name,
      description: team.description || '',
      parentTeamId: team.parentTeamId || '',
      settings: team.settings,
    });
  };
  const toggleTeamExpansion = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };
  const getRoleIcon = (role: string) => {
    switch (role) {
    case 'owner': return <Crown className="w-4 h-4 text-yellow-600" />;
    case 'admin': return <Shield className="w-4 h-4 text-blue-600" />;
    case 'member': return <User className="w-4 h-4 text-green-600" />;
    case 'viewer': return <Eye className="w-4 h-4 text-gray-600" />;
    default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };
  const getRoleBadge = (role: string) => {
    switch (role) {
    case 'owner': return 'bg-yellow-100 text-yellow-800';
    case 'admin': return 'bg-blue-100 text-blue-800';
    case 'member': return 'bg-green-100 text-green-800';
    case 'viewer': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
    }
  };
  const renderTeamTree = (teamList: Team[], parentId?: string, level = 0) => {
    const filteredTeams = teamList.filter(team => team.parentTeamId === parentId);
    return filteredTeams.map((team) => {
      const hasChildren = teamList.some(t => t.parentTeamId === team.id);
      const isExpanded = expandedTeams.has(team.id);
      return ();
        <div key={team.id}>
          <div
            onClick={() => setSelectedTeam(team)}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedTeam?.id === team.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
            }`}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
          >
            {hasChildren && ()
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTeamExpansion(team.id);
                }}
                className="mr-2"
              >
                {isExpanded ? ()
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : ()
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {team.name}
              </h3>
              {team.description && ()
                <p className="text-xs text-gray-500 truncate">{team.description}</p>
              )}
            </div>
          </div>
          {hasChildren && isExpanded && ()
            <div>
              {renderTeamTree(teamList, team.id, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };
  if (loading) {
    return ();
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return ();
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600 mt-2">Manage teams and their members</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Team
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
        {/* Team Tree */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Teams</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {teams.length > 0 ? ()
                renderTeamTree(teams)
              ) : ()
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p>No teams created yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Team Details */}
        <div className="lg:col-span-3">
          {selectedTeam ? ()
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTeam.name}</h2>
                    {selectedTeam.description && ()
                      <p className="text-gray-600 mt-2">{selectedTeam.description}</p>
                    )}
                    <div className="text-sm text-gray-500 mt-2">
                      Created {new Date(selectedTeam.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(selectedTeam)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTeam(selectedTeam.id)}
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
                    { id: 'overview', label: 'Overview', icon: Activity },
                    { id: 'members', label: 'Members', icon: Users },
                    { id: 'settings', label: 'Settings', icon: Settings }
                  ].map((tab) => ()
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                {activeTab === 'overview' && ()
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{teamMembers.length}</div>
                        <div className="text-sm text-gray-600">Team Members</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {teamMembers.filter(m => m.role === 'admin' || m.role === 'owner').length}
                        </div>
                        <div className="text-sm text-gray-600">Administrators</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {teams.filter(t => t.parentTeamId === selectedTeam.id).length}
                        </div>
                        <div className="text-sm text-gray-600">Sub-teams</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Team Information</h3>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Created:</span>
                          <span className="ml-2 text-gray-600">
                            {new Date(selectedTeam.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Last Updated:</span>
                          <span className="ml-2 text-gray-600">
                            {new Date(selectedTeam.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {selectedTeam.parentTeamId && ()
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Parent Team:</span>
                            <span className="ml-2 text-gray-600">
                              {teams.find(t => t.id === selectedTeam.parentTeamId)?.name || 'Unknown'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'members' && ()
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                      <button
                        onClick={() => setShowAddMember(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Member
                      </button>
                    </div>
                    <div className="space-y-4">
                      {teamMembers.map((member) => ()
                        <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              {member.user.avatarUrl ? ()
                                <img 
                                  src={member.user.avatarUrl} 
                                  alt={member.user.displayName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : ()
                                <span className="text-sm font-medium text-gray-600">
                                  {(member.user.displayName || member.user.email).charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {member.user.displayName || `${member.user.firstName} ${member.user.lastName}`.trim() || member.user.email}
                              </div>
                              <div className="text-sm text-gray-600">{member.user.email}</div>
                              <div className="text-xs text-gray-500">
                                Joined {new Date(member.joinedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <select
                              value={member.role}
                              onChange={(e) => updateMemberRole(member.userId, e.target.value)}
                              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="viewer">Viewer</option>
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                              <option value="owner">Owner</option>
                            </select>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`}>}
                              {getRoleIcon(member.role)}
                              <span className="ml-1">{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</span>
                            </span>
                            <button
                              onClick={() => removeTeamMember(member.userId)}
                              className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {teamMembers.length === 0 && ()
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-8 h-8 mx-auto mb-2" />
                          <p>No team members yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 'settings' && ()
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Team Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Team Name
                        </label>
                        <div className="text-sm text-gray-900">{selectedTeam.name}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <div className="text-sm text-gray-900">{selectedTeam.description || 'No description'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : ()
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Selected</h3>
              <p className="text-gray-600">Select a team from the list to view details</p>
            </div>
          )}
        </div>
      </div>
      {/* Create/Edit Team Modal */}
      {(showCreateForm || editingTeam) && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTeam ? 'Edit Team' : 'Create Team'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter team name"
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
                  placeholder="Describe the team's purpose"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Team (optional)
                </label>
                <select
                  value={formData.parentTeamId}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentTeamId: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No parent team</option>
                  {teams
                    .filter(team => team.id !== editingTeam?.id) // Don't allow self-parent
                    .map((team) => ()
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTeam(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingTeam ? updateTeam : createTeam}
                disabled={!formData.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingTeam ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Member Modal */}
      {showAddMember && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID *
                </label>
                <input
                  type="text"
                  value={memberFormData.userId}
                  onChange={(e) => setMemberFormData(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter user ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={memberFormData.role}
                  onChange={(e) => setMemberFormData(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="viewer">Viewer</option>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddMember(false);
                  setMemberFormData({ userId: '', role: 'member' });
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTeamMember}
                disabled={!memberFormData.userId.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};