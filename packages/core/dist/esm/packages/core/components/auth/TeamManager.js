import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 11.4 Team Manager Component
// React component for team management with hierarchical structure and member management
import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Crown, Shield, User, Eye, ChevronRight, ChevronDown, UserPlus, Settings } from Activity;
from;
'lucide-react';
;
currentUser ?  : { id: string, name: string, email: string, role: string };
onTeamChange ?  : (team) => void ;
onMembershipUpdated ?  : (membership) => void ;
export const [organizations, setOrganizations] = useState([]);
const [selectedTeam, setSelectedTeam] = useState(null);
const [teamMembers, setTeamMembers] = useState([]);
const [activeTab, setActiveTab] = useState('overview');
const [showCreateForm, setShowCreateForm] = useState(false);
const [editingTeam, setEditingTeam] = useState(null);
const [showAddMember, setShowAddMember] = useState(false);
const [expandedTeams, setExpandedTeams] = useState(new Set());
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
// Form state
const [formData, setFormData] = useState({});
name: '';
description: '';
parentTeamId: '';
settings: { }
;
const [memberFormData, setMemberFormData] = useState({});
userId: '';
role: 'member';
;
useEffect(() => { loadTeams(); }, [organizationId]);
useEffect(() => {
    if (selectedTeam) {
        loadTeamMembers(selectedTeam.id);
    }
    [selectedTeam];
});
const loadTeams = async () => {
    try {
        setLoading(true);
        const response = await fetch(`/api/auth/organizations/${organizationId}/teams/hierarchy`, {});
    }
    finally {
    }
    credentials: 'include';
};
if (!response.ok) {
    throw new Error('Failed to load teams');
    const data = await response.json();
    setTeams(data.data);
    // Auto-select first team
    if (data.data.length > 0 && !selectedTeam) {
        setSelectedTeam(data.data[0]);
    }
    try { }
    catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load teams');
    }
    finally {
        setLoading(false);
    }
    ;
    const loadTeamMembers = async (teamId) => {
        try {
            const response = await fetch(`/api/auth/teams/${teamId}/members`, {});
        }
        finally {
        }
        credentials: 'include';
    };
    if (!response.ok) {
        throw new Error('Failed to load team members');
        const data = await response.json();
        setTeamMembers(data.data);
    }
    try { }
    catch (err) {
        console.error('Failed to load team members:', err);
    }
    ;
    const createTeam = async () => {
        try {
            const response = await fetch(`/api/auth/organizations/${organizationId}/teams`, {});
        }
        finally {
        }
        method: 'POST';
        headers: {
            'Content-Type';
            'application/json';
        }
        credentials: 'include';
        body: JSON.stringify({});
    };
    formData;
    parentTeamId: formData.parentTeamId || undefined;
}
;
if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create team');
    const data = await response.json();
    await loadTeams(); // Reload to get hierarchy
    setSelectedTeam(data.data);
    setShowCreateForm(false);
    resetForm();
}
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to create team');
}
;
const updateTeam = async () => {
    if (!editingTeam)
        return;
    try {
        const response = await fetch(`/api/auth/teams/${editingTeam.id}`, {});
    }
    finally {
    }
    method: 'PUT';
    headers: {
        'Content-Type';
        'application/json';
    }
    credentials: 'include';
    body: JSON.stringify({});
};
formData;
parentTeamId: formData.parentTeamId || undefined;
;
if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update team');
    await loadTeams();
    setEditingTeam(null);
    resetForm();
}
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to update team');
}
;
const deleteTeam = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
        return;
        try {
            const response = await fetch(`/api/auth/teams/${teamId}`, {});
        }
        finally {
        }
        method: 'DELETE';
        credentials: 'include';
    }
    ;
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete team');
        await loadTeams();
        if (selectedTeam?.id === teamId) {
            setSelectedTeam(teams.find(team => team.id !== teamId) || null);
        }
        try { }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete team');
        }
        ;
        const addTeamMember = async () => {
            if (!selectedTeam)
                return;
            try {
                const response = await fetch(`/api/auth/teams/${selectedTeam.id}/members`, {});
            }
            finally {
            }
            method: 'POST';
            headers: {
                'Content-Type';
                'application/json';
            }
            credentials: 'include';
            body: JSON.stringify(memberFormData);
        };
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add team member');
            await loadTeamMembers(selectedTeam.id);
            setShowAddMember(false);
            setMemberFormData({ userId: '', role: 'member' });
            try {
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to add team member');
            }
            ;
            const removeTeamMember = async (userId) => {
                if (!selectedTeam || !confirm('Are you sure you want to remove this member?'))
                    return;
                try {
                    const response = await fetch(`/api/auth/teams/${selectedTeam.id}/members/${userId}`, {});
                }
                finally {
                }
                method: 'DELETE';
                credentials: 'include';
            };
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove team member');
                await loadTeamMembers(selectedTeam.id);
            }
            try { }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to remove team member');
            }
            ;
            const updateMemberRole = async (userId, newRole) => {
                if (!selectedTeam)
                    return;
                try {
                    const response = await fetch(`/api/auth/teams/${selectedTeam.id}/members/${userId}`, {});
                }
                finally {
                }
                method: 'PUT';
                headers: {
                    'Content-Type';
                    'application/json';
                }
                credentials: 'include';
                body: JSON.stringify({ role: newRole });
            };
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update member role');
                await loadTeamMembers(selectedTeam.id);
            }
            try { }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update member role');
            }
            ;
            const resetForm = () => {
                setFormData({});
                name: '';
                description: '';
                parentTeamId: '';
            };
            settings: { }
        }
        ;
    }
    ;
    const startEditing = (team) => {
        setEditingTeam(team);
        setFormData({});
        name: team.name;
        description: team.description || '';
        parentTeamId: team.parentTeamId || '';
        settings: team.settings;
    };
};
;
const toggleTeamExpansion = (teamId) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
        newExpanded.delete(teamId);
    }
    else {
        newExpanded.add(teamId);
        setExpandedTeams(newExpanded);
    }
    ;
    const getRoleIcon = (role) => {
        switch (role) {
            case 'owner': return _jsx(Crown, { className: "w-4 h-4 text-yellow-600" });
            case 'admin': return _jsx(Shield, { className: "w-4 h-4 text-blue-600" });
            case 'member': return _jsx(User, { className: "w-4 h-4 text-green-600" });
            case 'viewer': return _jsx(Eye, { className: "w-4 h-4 text-gray-600" });
            default: return _jsx(User, { className: "w-4 h-4 text-gray-600" });
        }
        ;
        const getRoleBadge = (role) => {
            switch (role) {
                case 'owner': return 'bg-yellow-100 text-yellow-800';
                case 'admin': return 'bg-blue-100 text-blue-800';
                case 'member': return 'bg-green-100 text-green-800';
                case 'viewer': return 'bg-gray-100 text-gray-800';
                default: return 'bg-gray-100 text-gray-800';
            }
            ;
            const renderTeamTree = (teamList, parentId, level = 0) => {
                const filteredTeams = teamList.filter(team => team.parentTeamId === parentId);
                return filteredTeams.map((team) => {
                    const hasChildren = teamList.some(t => t.parentTeamId === team.id);
                    const isExpanded = expandedTeams.has(team.id);
                    return;
                    _jsxs("div", { children: [_jsxs("div", { onClick: () => setSelectedTeam(team), className: `flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTeam?.id === team.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''}
`, style: { paddingLeft: `${level * 20 + 12}px` }, children: [hasChildren && ()
                                        < button, "onClick=", (e) => {
                                        e.stopPropagation();
                                        toggleTeamExpansion(team.id);
                                    }, "className=\"mr-2\" >", isExpanded ? ()
                                        < ChevronDown : , " className=\"w-4 h-4 text-gray-400\" /> ) : ()", _jsx(ChevronRight, { className: "w-4 h-4 text-gray-400" }), ")}"] }), ")}", !hasChildren && _jsx("div", { className: "w-6" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 truncate", children: team.name }), team.description && ()
                                        < p, " className=\"text-xs text-gray-500 truncate\">", team.description] }), ")}"] }, team.id);
                });
            };
        };
    };
};
div >
    { hasChildren } && isExpanded && (());
{
    renderTeamTree(teamList, team.id, level + 1);
}
div >
;
div >
;
;
;
;
if (loading) {
    return;
    _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) });
    ;
    return;
    _jsxs("div", { className: "max-w-7xl mx-auto p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Teams" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Manage teams and their members" })] }), _jsxs("button", { onClick: () => setShowCreateForm(true), className: "flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Team"] })] }), error && ()
                < div, " className=\"mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg\">", error, _jsx("button", { onClick: () => setError(null), className: "ml-2 text-red-500 hover:text-red-700", children: "\u00D7" })] });
}
_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsx("div", { className: "lg:col-span-1", children: _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: [_jsx("div", { className: "p-4 border-b border-gray-200", children: _jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Teams" }) }), _jsxs("div", { className: "divide-y divide-gray-200 max-h-96 overflow-y-auto", children: [teams.length > 0 ? ()
                                :
                            , "renderTeamTree(teams) ) : ()", _jsxs("div", { className: "p-8 text-center text-gray-500", children: [_jsx(Users, { className: "w-8 h-8 mx-auto mb-2" }), _jsx("p", { children: "No teams created yet" })] }), ")}"] })] }) }), _jsxs("div", { className: "lg:col-span-3", children: [selectedTeam ? ()
                    < div : , " className=\"bg-white rounded-lg border border-gray-200\">", _jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: selectedTeam.name }), selectedTeam.description && ()
                                            < p, " className=\"text-gray-600 mt-2\">", selectedTeam.description] }), ")}", _jsxs("div", { className: "text-sm text-gray-500 mt-2", children: ["Created ", new Date(selectedTeam.createdAt).toLocaleDateString()] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => startEditing(selectedTeam), className: "p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(Edit2, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => deleteTeam(selectedTeam.id), className: "p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] })] }), _jsxs("div", { className: "border-b border-gray-200", children: [_jsxs("nav", { className: "flex space-x-8 px-6", children: [[
                            { id: 'overview', label: 'Overview', icon: Activity },
                            { id: 'members', label: 'Members', icon: Users },
                            { id: 'settings', label: 'Settings', icon: Settings }
                        ].map((tab) => ()
                            < button, key = { tab, : .id }, onClick = {}()), " => setActiveTab(tab.id as any)} className=", `flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
`, ">", _jsx(tab.icon, { className: "w-4 h-4 mr-2" }), tab.label] }), "))}"] })] });
{ /* Tab Content */ }
_jsxs("div", { className: "p-6", children: [activeTab === 'overview' && ()
            < div, " className=\"space-y-6\">", _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: teamMembers.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Team Members" })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: teamMembers.filter(m => m.role === 'admin' || m.role === 'owner').length }), _jsx("div", { className: "text-sm text-gray-600", children: "Administrators" })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: teams.filter(t => t.parentTeamId === selectedTeam.id).length }), _jsx("div", { className: "text-sm text-gray-600", children: "Sub-teams" })] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-3", children: "Team Information" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium text-gray-700", children: "Created:" }), _jsx("span", { className: "ml-2 text-gray-600", children: new Date(selectedTeam.createdAt).toLocaleDateString() })] }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium text-gray-700", children: "Last Updated:" }), _jsx("span", { className: "ml-2 text-gray-600", children: new Date(selectedTeam.updatedAt).toLocaleDateString() })] }), selectedTeam.parentTeamId && ()
                            < div, " className=\"text-sm\">", _jsx("span", { className: "font-medium text-gray-700", children: "Parent Team:" }), _jsx("span", { className: "ml-2 text-gray-600", children: teams.find(t => t.id === selectedTeam.parentTeamId)?.name || 'Unknown' })] }), ")}"] })] });
div >
;
{
    activeTab === 'members' && ()
        < div;
    className = "space-y-6" >
        (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Team Members" }), _jsxs("button", { onClick: () => setShowAddMember(true), className: "flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: [_jsx(UserPlus, { className: "w-4 h-4 mr-2" }), "Add Member"] })] })
            ,
                _jsx("div", { className: "space-y-4", children: teamMembers.map((member) => ()
                        < div, key = { member, : .id }, className = "flex items-center justify-between p-4 bg-gray-50 rounded-lg" >
                        (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center", children: [member.user.avatarUrl ? ()
                                            < img
                                            :
                                        , "src=", member.user.avatarUrl, "alt=", member.user.displayName, "className=\"w-10 h-10 rounded-full object-cover\" /> ) : ()", _jsx("span", { className: "text-sm font-medium text-gray-600", children: (member.user.displayName || member.user.email).charAt(0).toUpperCase() }), ")}"] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: member.user.displayName || `${member.user.firstName} ${member.user.lastName}`.trim() || member.user.email }), _jsx("div", { className: "text-sm text-gray-600", children: member.user.email }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Joined ", new Date(member.joinedAt).toLocaleDateString()] })] })] })
                            ,
                                _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("select", { value: member.role, onChange: (e) => updateMemberRole(member.userId, e.target.value), className: "text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "viewer", children: "Viewer" }), _jsx("option", { value: "member", children: "Member" }), _jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "owner", children: "Owner" })] }), _jsxs("span", { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`, children: ["}", getRoleIcon(member.role), _jsx("span", { className: "ml-1", children: member.role.charAt(0).toUpperCase() + member.role.slice(1) })] }), _jsx("button", { onClick: () => removeTeamMember(member.userId), className: "p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }))) }));
}
{
    teamMembers.length === 0 && ()
        < div;
    className = "text-center py-8 text-gray-500" >
        (_jsx(Users, { className: "w-8 h-8 mx-auto mb-2" })
            ,
                _jsx("p", { children: "No team members yet" }));
    div >
    ;
}
div >
;
div >
;
{
    activeTab === 'settings' && ()
        < div;
    className = "space-y-6" >
        (_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Team Settings" })
            ,
                _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Team Name" }), _jsx("div", { className: "text-sm text-gray-900", children: selectedTeam.name })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Description" }), _jsx("div", { className: "text-sm text-gray-900", children: selectedTeam.description || 'No description' })] })] }));
    div >
    ;
}
div >
;
div >
;
()
    < div;
className = "bg-white rounded-lg border border-gray-200 p-12 text-center" >
    (_jsx(Users, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" })
        ,
            _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Team Selected" })
                ,
                    _jsx("p", { className: "text-gray-600", children: "Select a team from the list to view details" }));
div >
;
div >
;
div >
    { /* Create/Edit Team Modal */};
{
    (showCreateForm || editingTeam) && ()
        < div;
    className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" >
        (_jsxs("div", { className: "bg-white rounded-lg max-w-md w-full p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: editingTeam ? 'Edit Team' : 'Create Team' }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Team Name *" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })), className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Enter team name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Description" }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value })), className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", rows: 3, placeholder: "Describe the team's purpose" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Parent Team (optional)" }), _jsxs("select", { value: formData.parentTeamId, onChange: (e) => setFormData(prev => ({ ...prev, parentTeamId: e.target.value })), className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "", children: "No parent team" }), teams
                                            .filter(team => team.id !== editingTeam?.id) // Don't allow self-parent
                                            .map((team) => ()
                                            < option, key = { team, : .id }, value = { team, : .id } >
                                            { team, : .name })] }), "))}"] })] })] })
            ,
                _jsxs("div", { className: "flex space-x-3 mt-6", children: [_jsx("button", { onClick: () => {
                                setShowCreateForm(false);
                                setEditingTeam(null);
                                resetForm();
                            }, className: "flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors", children: "Cancel" }), _jsx("button", { onClick: editingTeam ? updateTeam : createTeam, disabled: !formData.name.trim(), className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: editingTeam ? 'Update' : 'Create' })] }));
    div >
    ;
    div >
    ;
}
{ /* Add Member Modal */ }
{
    showAddMember && ()
        < div;
    className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" >
        _jsxs("div", { className: "bg-white rounded-lg max-w-md w-full p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Add Team Member" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "User ID *" }), _jsx("input", { type: "text", value: memberFormData.userId, onChange: (e) => setMemberFormData(prev => ({ ...prev, userId: e.target.value })), className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Enter user ID" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Role" }), _jsxs("select", { value: memberFormData.role, onChange: (e) => setMemberFormData(prev => ({ ...prev, role: e.target.value })), className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "viewer", children: "Viewer" }), _jsx("option", { value: "member", children: "Member" }), _jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "owner", children: "Owner" })] })] })] }), _jsxs("div", { className: "flex space-x-3 mt-6", children: [_jsx("button", { onClick: () => {
                                setShowAddMember(false);
                                setMemberFormData({ userId: '', role: 'member' });
                            }, className: "flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors", children: "Cancel" }), _jsx("button", { onClick: addTeamMember, disabled: !memberFormData.userId.trim(), className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: "Add Member" })] })] });
    div >
    ;
}
div >
;
;
;
