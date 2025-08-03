import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 11.4 Organization Manager Component
// React component for comprehensive organization management with settings and branding
import { useState, useEffect } from 'react';
import { Users, Settings, Building2, Plus, Edit2, Trash2, Globe, Crown, Shield, BarChart3, ChevronRight } from Palette;
from;
'lucide-react';
;
usage: {
    users: number;
    teams: number;
    storage: number;
}
;
 | null > (null);
const [stats, setStats] = useState(null);
const [activeTab, setActiveTab] = useState('overview');
const [showCreateForm, setShowCreateForm] = useState(false);
const [editingOrg, setEditingOrg] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
// Form state for creating/editing organizations
const [formData, setFormData] = useState({});
name: '';
slug: '';
description: '';
website: '';
plan: 'free';
settings: { }
branding: { }
;
useEffect(() => { loadOrganizations(); }, []);
useEffect(() => {
    if (selectedOrg) {
        loadOrganizationStats(selectedOrg.id);
    }
    [selectedOrg];
});
const loadOrganizations = async () => {
    try {
        setLoading(true);
        const response = await fetch('/api/auth/organizations/my', {});
        credentials: 'include';
    }
    finally {
    }
};
if (!response.ok) {
    throw new Error('Failed to load organizations');
    const data = await response.json();
    setOrganizations(data.data);
    // Auto-select first organization
    if (data.data.length > 0 && !selectedOrg) {
        setSelectedOrg(data.data[0]);
    }
    try { }
    catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organizations');
    }
    finally {
        setLoading(false);
    }
    ;
    const loadOrganizationStats = async (organizationId) => {
        try {
            const response = await fetch(`/api/auth/organizations/${organizationId}/stats`, {});
        }
        finally {
        }
        credentials: 'include';
    };
    if (!response.ok) {
        throw new Error('Failed to load organization stats');
        const data = await response.json();
        setStats(data.data);
    }
    try { }
    catch (err) {
        console.error('Failed to load organization stats:', err);
    }
    ;
    const createOrganization = async () => {
        try {
            const response = await fetch('/api/auth/organizations', {});
            method: 'POST';
            headers: {
                'Content-Type';
                'application/json';
            }
            credentials: 'include';
            body: JSON.stringify(formData);
        }
        finally { }
        ;
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create organization');
            const data = await response.json();
            setOrganizations(prev => [...prev, data.data]);
            setSelectedOrg(data.data);
            setShowCreateForm(false);
            resetForm();
        }
        try { }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create organization');
        }
        ;
        const updateOrganization = async () => {
            if (!editingOrg)
                return;
            try {
                const response = await fetch(`/api/auth/organizations/${editingOrg.id}`, {});
            }
            finally {
            }
            method: 'PUT';
            headers: {
                'Content-Type';
                'application/json';
            }
            credentials: 'include';
            body: JSON.stringify(formData);
        };
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update organization');
            const data = await response.json();
            setOrganizations(prev => );
            prev.map(org => org.id === editingOrg.id ? data.data : org);
            ;
            if (selectedOrg?.id === editingOrg.id) {
                setSelectedOrg(data.data);
                setEditingOrg(null);
                resetForm();
            }
            try { }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update organization');
            }
            ;
            const deleteOrganization = async (organizationId) => {
                if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
                    return;
                    try {
                        const response = await fetch(`/api/auth/organizations/${organizationId}`, {});
                    }
                    finally {
                    }
                    method: 'DELETE';
                    credentials: 'include';
                }
                ;
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete organization');
                    setOrganizations(prev => prev.filter(org => org.id !== organizationId));
                    if (selectedOrg?.id === organizationId) {
                        setSelectedOrg(organizations.find(org => org.id !== organizationId) || null);
                    }
                    try { }
                    catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to delete organization');
                    }
                    ;
                    const resetForm = () => {
                        setFormData({});
                        name: '';
                        slug: '';
                        description: '';
                        website: '';
                        plan: 'free';
                    };
                    settings: { }
                    branding: { }
                }
                ;
            };
            const startEditing = (org) => {
                setEditingOrg(org);
                setFormData({});
                name: org.name;
                slug: org.slug;
                description: org.description || '';
                website: org.website || '';
                plan: org.plan;
                settings: org.settings;
                branding: org.branding;
            };
        }
        ;
    };
    const getPlanColor = (plan) => {
        switch (plan) {
            case 'free': return 'text-gray-600';
            case 'pro': return 'text-blue-600';
            case 'enterprise': return 'text-purple-600';
            default: return 'text-gray-600';
        }
        ;
        const getPlanBadge = (plan) => {
            switch (plan) {
                case 'free': return 'bg-gray-100 text-gray-800';
                case 'pro': return 'bg-blue-100 text-blue-800';
                case 'enterprise': return 'bg-purple-100 text-purple-800';
                default: return 'bg-gray-100 text-gray-800';
            }
            ;
            if (loading) {
                return;
                _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) });
            }
        };
    };
    ;
    return;
    _jsxs("div", { className: "max-w-7xl mx-auto p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Organizations" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Manage your organizations and teams" })] }), _jsxs("button", { onClick: () => setShowCreateForm(true), className: "flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Organization"] })] }), error && ()
                < div, " className=\"mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg\">", error, _jsx("button", { onClick: () => setError(null), className: "ml-2 text-red-500 hover:text-red-700", children: "\u00D7" })] });
}
_jsx("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: _jsx("div", { className: "lg:col-span-1", children: _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: [_jsx("div", { className: "p-4 border-b border-gray-200", children: _jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Organizations" }) }), _jsxs("div", { className: "divide-y divide-gray-200", children: [organizations.map((org) => ()
                            < div, key = { org, : .id }, onClick = {}()), " => setSelectedOrg(org)} className=", `p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedOrg?.id === org.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''}
`, ">", _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 truncate", children: org.name }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["@", org.slug] }), _jsxs("span", { className: `inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${getPlanBadge(org.plan)}`, children: ["}", org.plan.charAt(0).toUpperCase() + org.plan.slice(1)] })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-gray-400" })] })] }), "))}"] }) }) });
{ /* Organization Details */ }
_jsxs("div", { className: "lg:col-span-3", children: [selectedOrg ? ()
            < div : , " className=\"bg-white rounded-lg border border-gray-200\">", _jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center", children: [selectedOrg.logoUrl ? ()
                                        < img
                                        :
                                    , "src=", selectedOrg.logoUrl, "alt=", selectedOrg.name, "className=\"w-12 h-12 object-cover rounded-lg\" /> ) : ()", _jsx(Building2, { className: "w-8 h-8 text-gray-400" }), ")}"] }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: selectedOrg.name }), _jsxs("p", { className: "text-gray-600", children: ["@", selectedOrg.slug] }), selectedOrg.description && ()
                                        < p, " className=\"text-sm text-gray-500 mt-2\">", selectedOrg.description] }), ")}"] }) }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => startEditing(selectedOrg), className: "p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(Edit2, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => deleteOrganization(selectedOrg.id), className: "p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] })] });
{ /* Tabs */ }
_jsxs("div", { className: "border-b border-gray-200", children: [_jsxs("nav", { className: "flex space-x-8 px-6", children: [[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'settings', label: 'Settings', icon: Settings },
                    { id: 'branding', label: 'Branding', icon: Palette },
                    { id: 'members', label: 'Members', icon: Users },
                    { id: 'teams', label: 'Teams', icon: Shield }
                ].map((tab) => ()
                    < button, key = { tab, : .id }, onClick = {}()), " => setActiveTab(tab.id as any)} className=", `flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
`, ">", _jsx(tab.icon, { className: "w-4 h-4 mr-2" }), tab.label] }), "))}"] });
div >
    { /* Tab Content */}
    < div;
className = "p-6" >
    { activeTab } === 'overview' && stats && ()
    < div;
className = "space-y-6" >
    { /* Stats Grid */}
    < div;
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" >
    (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: stats.totalMembers }), _jsx("div", { className: "text-sm text-gray-600", children: "Total Members" }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [stats.usage.users, "/", stats.planLimits.maxUsers, " limit"] })] })
        ,
            _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: stats.totalTeams }), _jsx("div", { className: "text-sm text-gray-600", children: "Teams" }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [stats.usage.teams, "/", stats.planLimits.maxTeams, " limit"] })] })
                ,
                    _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: stats.recentActivity }), _jsx("div", { className: "text-sm text-gray-600", children: "Recent Activity" }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: "Last 30 days" })] })
                        ,
                            _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: `text-2xl font-bold ${getPlanColor(selectedOrg.plan)}`, children: ["}", selectedOrg.plan.charAt(0).toUpperCase() + selectedOrg.plan.slice(1)] }), _jsx("div", { className: "text-sm text-gray-600", children: "Current Plan" }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [(stats.usage.storage / 1024).toFixed(1), "GB / ", (stats.planLimits.maxStorage / 1024).toFixed(0), "GB"] })] }));
div >
    { /* Quick Info */}
    < div;
className = "bg-gray-50 p-4 rounded-lg" >
    (_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-3", children: "Organization Info" })
        ,
            _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Globe, { className: "w-4 h-4 text-gray-400 mr-2" }), _jsx("span", { className: "text-sm text-gray-600", children: selectedOrg.website || 'No website set' })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Crown, { className: "w-4 h-4 text-gray-400 mr-2" }), _jsxs("span", { className: "text-sm text-gray-600", children: ["Created ", new Date(selectedOrg.createdAt).toLocaleDateString()] })] })] }));
div >
;
div >
;
{
    activeTab === 'settings' && ()
        < div;
    className = "space-y-6" >
        (_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Organization Settings" })
            ,
                _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Organization Name" }), _jsx("div", { className: "text-sm text-gray-900", children: selectedOrg.name })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Slug" }), _jsxs("div", { className: "text-sm text-gray-900", children: ["@", selectedOrg.slug] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Plan" }), _jsxs("span", { className: `inline-block px-3 py-1 text-sm font-medium rounded-full ${getPlanBadge(selectedOrg.plan)}`, children: ["}", selectedOrg.plan.charAt(0).toUpperCase() + selectedOrg.plan.slice(1)] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Max Users" }), _jsx("div", { className: "text-sm text-gray-900", children: selectedOrg.maxUsers })] })] }));
    div >
    ;
}
{
    activeTab === 'branding' && ()
        < div;
    className = "space-y-6" >
        (_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Branding & Appearance" })
            ,
                _jsx("div", { className: "text-sm text-gray-600", children: "Customize your organization's visual identity and branding." }));
    { /* Branding controls would go here */ }
    div >
    ;
}
{
    activeTab === 'members' && ()
        < div;
    className = "space-y-6" >
        (_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Members" })
            ,
                _jsx("div", { className: "text-sm text-gray-600", children: "Manage organization members and their roles." }));
    { /* Member management would go here */ }
    div >
    ;
}
{
    activeTab === 'teams' && ()
        < div;
    className = "space-y-6" >
        (_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Teams" })
            ,
                _jsx("div", { className: "text-sm text-gray-600", children: "Create and manage teams within your organization." }));
    { /* Team management would go here */ }
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
    (_jsx(Building2, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" })
        ,
            _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Organization Selected" })
                ,
                    _jsx("p", { className: "text-gray-600", children: "Select an organization from the list to view details" }));
div >
;
div >
;
div >
    { /* Create/Edit Organization Modal */};
{
    (showCreateForm || editingOrg) && ()
        < div;
    className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" >
        _jsxs("div", { className: "bg-white rounded-lg max-w-md w-full p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: editingOrg ? 'Edit Organization' : 'Create Organization' }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Organization Name *" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })), className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Enter organization name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Slug" }), _jsx("input", { type: "text", value: formData.slug, onChange: (e) => setFormData(prev => ({ ...prev, slug: e.target.value })), className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "organization-slug" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Description" }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value })), className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", rows: 3, placeholder: "Describe your organization" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Website" }), _jsx("input", { type: "url", value: formData.website, onChange: (e) => setFormData(prev => ({ ...prev, website: e.target.value })), className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "https://example.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Plan" }), _jsxs("select", { value: formData.plan, onChange: (e) => setFormData(prev => ({ ...prev, plan: e.target.value })), className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "free", children: "Free" }), _jsx("option", { value: "pro", children: "Pro" }), _jsx("option", { value: "enterprise", children: "Enterprise" })] })] })] }), _jsxs("div", { className: "flex space-x-3 mt-6", children: [_jsx("button", { onClick: () => {
                                setShowCreateForm(false);
                                setEditingOrg(null);
                                resetForm();
                            }, className: "flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors", children: "Cancel" }), _jsx("button", { onClick: editingOrg ? updateOrganization : createOrganization, disabled: !formData.name.trim(), className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: editingOrg ? 'Update' : 'Create' })] })] });
    div >
    ;
}
div >
;
;
;
