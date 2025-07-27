import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Template Collaboration Panel Component
 * Epic 8.6: Story 8.6 - Structured Pipeline Export - Task 4
 *
 * Advanced collaboration interface for sharing export templates, managing
 * permissions, tracking usage analytics, and facilitating team workflows.
 */
import { useState, useCallback, useEffect } from 'react';
import { useExport } from '../../hooks/useExport';
export const TemplateCollaborationPanel = ({ template, visible = true, onClose, projectId = '', className = '' }) => {
    // State management
    const [collaborators, setCollaborators] = useState([]);
    const [activities, setActivities] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [shareSettings, setShareSettings] = useState({
        isPublic: template.is_public || false,
        allowForks: true,
        allowComments: true,
        requireApproval: false
    });
    // UI state
    const [activeTab, setActiveTab] = useState('collaborators');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('viewer');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Hooks
    const { getTemplateCollaborators, getTemplateActivity, getTemplateAnalytics, inviteCollaborator, updateCollaboratorRole, removeCollaborator, updateShareSettings, generateShareLink, forkTemplate } = useExport(projectId);
    // Load collaboration data
    useEffect(() => {
        if (visible) {
            loadCollaborationData();
        }
    }, [visible]);
    const loadCollaborationData = useCallback(async () => {
        setLoading(true);
        try {
            const [collaboratorsData, activitiesData, analyticsData] = await Promise.all([
                getTemplateCollaborators(template.id),
                getTemplateActivity(template.id),
                getTemplateAnalytics(template.id)
            ]);
            setCollaborators(collaboratorsData);
            setActivities(activitiesData);
            setAnalytics(analyticsData);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load collaboration data');
        }
        finally {
            setLoading(false);
        }
    }, [template.id, getTemplateCollaborators, getTemplateActivity, getTemplateAnalytics]);
    // Handle inviting collaborator
    const handleInviteCollaborator = useCallback(async () => {
        if (!inviteEmail.trim())
            return;
        setLoading(true);
        try {
            const newCollaborator = await inviteCollaborator(template.id, {
                email: inviteEmail,
                role: inviteRole
            });
            setCollaborators(prev => [...prev, newCollaborator]);
            setInviteEmail('');
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to invite collaborator');
        }
        finally {
            setLoading(false);
        }
    }, [template.id, inviteEmail, inviteRole, inviteCollaborator]);
    // Handle role change
    const handleRoleChange = useCallback(async (userId, newRole) => {
        setLoading(true);
        try {
            await updateCollaboratorRole(template.id, userId, newRole);
            setCollaborators(prev => prev.map(c => c.id === userId ? { ...c, role: newRole } : c));
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update role');
        }
        finally {
            setLoading(false);
        }
    }, [template.id, updateCollaboratorRole]);
    // Handle removing collaborator
    const handleRemoveCollaborator = useCallback(async (userId) => {
        if (!confirm('Are you sure you want to remove this collaborator?'))
            return;
        setLoading(true);
        try {
            await removeCollaborator(template.id, userId);
            setCollaborators(prev => prev.filter(c => c.id !== userId));
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove collaborator');
        }
        finally {
            setLoading(false);
        }
    }, [template.id, removeCollaborator]);
    // Handle share settings update
    const handleShareSettingsUpdate = useCallback(async (newSettings) => {
        const updatedSettings = { ...shareSettings, ...newSettings };
        setLoading(true);
        try {
            await updateShareSettings(template.id, updatedSettings);
            setShareSettings(updatedSettings);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update share settings');
        }
        finally {
            setLoading(false);
        }
    }, [template.id, shareSettings, updateShareSettings]);
    // Generate share link
    const handleGenerateShareLink = useCallback(async () => {
        setLoading(true);
        try {
            const shareLink = await generateShareLink(template.id);
            setShareSettings(prev => ({ ...prev, shareLink }));
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate share link');
        }
        finally {
            setLoading(false);
        }
    }, [template.id, generateShareLink]);
    // Handle template fork
    const handleForkTemplate = useCallback(async () => {
        setLoading(true);
        try {
            // Could emit event or navigate to forked template
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fork template');
        }
        finally {
            setLoading(false);
        }
    }, [template.id, forkTemplate]);
    // Format date
    const formatDate = useCallback((dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);
    // Format usage count
    const formatUsageCount = useCallback((count) => {
        if (count < 1000)
            return count.toString();
        if (count < 1000000)
            return `${Math.round(count / 100) / 10}K`;
        return `${Math.round(count / 100000) / 10}M`;
    }, []);
    if (!visible)
        return null;
    return (_jsxs("div", { className: `template-collaboration-panel ${className}`, style: {
            position: 'fixed',
            inset: '60px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            zIndex: 1200,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }, children: [_jsx("div", { style: {
                    padding: '20px 24px',
                    borderBottom: '1px solid #e2e8f0',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    color: 'white'
                }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs("div", { children: [_jsx("h2", { style: { margin: 0, fontSize: '20px', fontWeight: '600' }, children: "\uD83D\uDC65 Template Collaboration" }), _jsxs("div", { style: { fontSize: '14px', opacity: 0.9, marginTop: '4px' }, children: [template.name, " \u2022 ", collaborators.length, " collaborators"] })] }), onClose && (_jsx("button", { onClick: onClose, style: {
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                width: '32px',
                                height: '32px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px'
                            }, children: "\u00D7" }))] }) }), _jsx("div", { style: {
                    padding: '16px 24px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#f8fafc'
                }, children: _jsx("div", { style: { display: 'flex', gap: '8px' }, children: [
                        { key: 'collaborators', label: '👥 Collaborators', desc: 'Manage team access' },
                        { key: 'activity', label: '📈 Activity', desc: 'Recent changes and usage' },
                        { key: 'analytics', label: '📊 Analytics', desc: 'Usage statistics' },
                        { key: 'sharing', label: '🌐 Sharing', desc: 'Public sharing settings' }
                    ].map(tab => (_jsx("button", { onClick: () => setActiveTab(tab.key), style: {
                            padding: '8px 16px',
                            background: activeTab === tab.key ? '#0ea5e9' : 'transparent',
                            color: activeTab === tab.key ? 'white' : '#6b7280',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: activeTab === tab.key ? '600' : 'normal',
                            transition: 'all 0.2s ease'
                        }, title: tab.desc, children: tab.label }, tab.key))) }) }), _jsxs("div", { style: { flex: 1, overflow: 'auto', padding: '20px 24px' }, children: [error && (_jsxs("div", { style: {
                            padding: '12px 16px',
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            color: '#dc2626',
                            marginBottom: '20px',
                            fontSize: '14px'
                        }, children: [_jsx("strong", { children: "Error:" }), " ", error] })), activeTab === 'collaborators' && (_jsxs("div", { children: [_jsxs("div", { style: {
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    marginBottom: '24px'
                                }, children: [_jsx("h4", { style: { margin: '0 0 12px', fontSize: '16px', fontWeight: '600' }, children: "Invite Collaborator" }), _jsxs("div", { style: { display: 'flex', gap: '12px', alignItems: 'end' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: { display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280' }, children: "Email Address" }), _jsx("input", { type: "email", value: inviteEmail, onChange: (e) => setInviteEmail(e.target.value), placeholder: "colleague@company.com", style: {
                                                            width: '100%',
                                                            padding: '8px 12px',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '6px',
                                                            fontSize: '14px'
                                                        } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280' }, children: "Role" }), _jsxs("select", { value: inviteRole, onChange: (e) => setInviteRole(e.target.value), style: {
                                                            padding: '8px 12px',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '6px',
                                                            fontSize: '14px'
                                                        }, children: [_jsx("option", { value: "viewer", children: "Viewer" }), _jsx("option", { value: "editor", children: "Editor" })] })] }), _jsxs("button", { onClick: handleInviteCollaborator, disabled: loading || !inviteEmail.trim(), style: {
                                                    padding: '8px 16px',
                                                    background: loading ? '#9ca3af' : '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: loading ? 'not-allowed' : 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }, children: [loading ? '⏳' : '➕', " Invite"] })] })] }), _jsxs("div", { children: [_jsxs("h4", { style: { margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }, children: ["Current Collaborators (", collaborators.length, ")"] }), collaborators.length === 0 ? (_jsxs("div", { style: {
                                            padding: '40px',
                                            textAlign: 'center',
                                            color: '#9ca3af'
                                        }, children: [_jsx("div", { style: { fontSize: '32px', marginBottom: '8px' }, children: "\uD83D\uDC65" }), _jsx("div", { children: "No collaborators yet. Invite team members to get started!" })] })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: collaborators.map(collaborator => (_jsxs("div", { style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px 16px',
                                                background: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px'
                                            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx("div", { style: {
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '50%',
                                                                background: collaborator.avatar
                                                                    ? `url(${collaborator.avatar}) center/cover`
                                                                    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                fontSize: '16px',
                                                                fontWeight: '600'
                                                            }, children: !collaborator.avatar && collaborator.name.charAt(0).toUpperCase() }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '14px', fontWeight: '500', color: '#374151' }, children: collaborator.name }), _jsxs("div", { style: { fontSize: '12px', color: '#6b7280' }, children: [collaborator.email, " \u2022 Joined ", formatDate(collaborator.joinedAt)] })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx("span", { style: {
                                                                padding: '4px 8px',
                                                                background: collaborator.role === 'owner' ? '#dbeafe' :
                                                                    collaborator.role === 'editor' ? '#ecfdf5' : '#f3f4f6',
                                                                color: collaborator.role === 'owner' ? '#1e40af' :
                                                                    collaborator.role === 'editor' ? '#166534' : '#374151',
                                                                borderRadius: '4px',
                                                                fontSize: '11px',
                                                                fontWeight: '600',
                                                                textTransform: 'uppercase'
                                                            }, children: collaborator.role }), collaborator.role !== 'owner' && (_jsxs(_Fragment, { children: [_jsxs("select", { value: collaborator.role, onChange: (e) => handleRoleChange(collaborator.id, e.target.value), style: {
                                                                        padding: '4px 8px',
                                                                        border: '1px solid #e2e8f0',
                                                                        borderRadius: '4px',
                                                                        fontSize: '12px'
                                                                    }, children: [_jsx("option", { value: "viewer", children: "Viewer" }), _jsx("option", { value: "editor", children: "Editor" })] }), _jsx("button", { onClick: () => handleRemoveCollaborator(collaborator.id), style: {
                                                                        padding: '4px 8px',
                                                                        background: '#fee2e2',
                                                                        border: '1px solid #fecaca',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px',
                                                                        color: '#dc2626'
                                                                    }, children: "Remove" })] }))] })] }, collaborator.id))) }))] })] })), activeTab === 'activity' && (_jsxs("div", { children: [_jsx("h4", { style: { margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }, children: "Recent Activity" }), activities.length === 0 ? (_jsxs("div", { style: {
                                    padding: '40px',
                                    textAlign: 'center',
                                    color: '#9ca3af'
                                }, children: [_jsx("div", { style: { fontSize: '32px', marginBottom: '8px' }, children: "\uD83D\uDCC8" }), _jsx("div", { children: "No activity yet. Use the template to see activity here!" })] })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: activities.map(activity => (_jsxs("div", { style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px'
                                    }, children: [_jsx("div", { style: {
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: activity.action === 'created' ? '#10b981' :
                                                    activity.action === 'updated' ? '#f59e0b' :
                                                        activity.action === 'shared' ? '#06b6d4' :
                                                            activity.action === 'forked' ? '#8b5cf6' :
                                                                activity.action === 'used' ? '#3b82f6' : '#6b7280'
                                            } }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { fontSize: '14px', color: '#374151' }, children: [_jsx("strong", { children: activity.userEmail }), " ", activity.details] }), _jsx("div", { style: { fontSize: '12px', color: '#6b7280' }, children: formatDate(activity.timestamp) })] })] }, activity.id))) }))] })), activeTab === 'analytics' && (_jsxs("div", { children: [_jsx("h4", { style: { margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }, children: "Usage Analytics" }), !analytics ? (_jsxs("div", { style: {
                                    padding: '40px',
                                    textAlign: 'center',
                                    color: '#9ca3af'
                                }, children: [_jsx("div", { style: { fontSize: '32px', marginBottom: '8px' }, children: "\uD83D\uDCCA" }), _jsx("div", { children: "Loading analytics..." })] })) : (_jsx("div", { style: ({ display: 'grid', gridTemplateColumns: 'repeat(,
                                    auto } - fit,
                                    minmax(200, px, 1, fr)) })), "', gap: '16px' }}>", _jsxs("div", { style: {
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    color: 'white',
                                    borderRadius: '8px'
                                }, children: [_jsx("div", { style: { fontSize: '24px', fontWeight: '600' }, children: formatUsageCount(analytics.totalUses) }), _jsx("div", { style: { fontSize: '12px', opacity: 0.9 }, children: "Total Uses" })] }), _jsxs("div", { style: {
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    borderRadius: '8px'
                                }, children: [_jsx("div", { style: { fontSize: '24px', fontWeight: '600' }, children: analytics.uniqueUsers }), _jsx("div", { style: { fontSize: '12px', opacity: 0.9 }, children: "Unique Users" })] }), _jsxs("div", { style: {
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    color: 'white',
                                    borderRadius: '8px'
                                }, children: [_jsxs("div", { style: { fontSize: '24px', fontWeight: '600' }, children: [Math.round(analytics.successRate * 100), "%"] }), _jsx("div", { style: { fontSize: '12px', opacity: 0.9 }, children: "Success Rate" })] }), _jsxs("div", { style: {
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                    color: 'white',
                                    borderRadius: '8px'
                                }, children: [_jsx("div", { style: { fontSize: '24px', fontWeight: '600' }, children: analytics.forkCount }), _jsx("div", { style: { fontSize: '12px', opacity: 0.9 }, children: "Forks" })] })] }))] }), ")}", activeTab === 'sharing' && (_jsxs("div", { children: [_jsx("h4", { style: { margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }, children: "Public Sharing Settings" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '20px' }, children: [_jsx("div", { style: {
                                    padding: '16px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px'
                                }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: shareSettings.isPublic, onChange: (e) => handleShareSettingsUpdate({ isPublic: e.target.checked }) }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '14px', fontWeight: '500' }, children: "Make Template Public" }), _jsx("div", { style: { fontSize: '12px', color: '#6b7280' }, children: "Allow anyone to discover and use this template" })] })] }) }), shareSettings.isPublic && (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                                            padding: '16px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }, children: _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '8px' }, children: [_jsx("input", { type: "checkbox", checked: shareSettings.allowForks, onChange: (e) => handleShareSettingsUpdate({ allowForks: e.target.checked }) }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '14px', fontWeight: '500' }, children: "Allow Forks" }), _jsx("div", { style: { fontSize: '12px', color: '#6b7280' }, children: "Let others create their own copies of this template" })] })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: shareSettings.allowComments, onChange: (e) => handleShareSettingsUpdate({ allowComments: e.target.checked }) }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '14px', fontWeight: '500' }, children: "Allow Comments" }), _jsx("div", { style: { fontSize: '12px', color: '#6b7280' }, children: "Enable community feedback and discussions" })] })] })] }) }), _jsx("div", { style: {
                                            padding: '16px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }, children: _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsx("div", { style: { fontSize: '14px', fontWeight: '500', marginBottom: '8px' }, children: "Share Link" }), shareSettings.shareLink ? (_jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("input", { type: "text", value: shareSettings.shareLink, readOnly: true, style: {
                                                                flex: 1,
                                                                padding: '8px 12px',
                                                                border: '1px solid #e2e8f0',
                                                                borderRadius: '6px',
                                                                fontSize: '12px',
                                                                background: 'white'
                                                            } }), _jsx("button", { onClick: () => navigator.clipboard.writeText(shareSettings.shareLink), style: {
                                                                padding: '8px 12px',
                                                                background: '#10b981',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px'
                                                            }, children: "\uD83D\uDCCB Copy" })] })) : (_jsx("button", { onClick: handleGenerateShareLink, style: {
                                                        padding: '8px 16px',
                                                        background: '#3b82f6',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px'
                                                    }, children: "\uD83D\uDD17 Generate Share Link" }))] }) })] }))] })] }))] })) /* Footer */;
    { /* Footer */ }
    _jsxs("div", { style: {
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            gap: '12px',
            justifyContent: 'space-between',
            alignItems: 'center'
        }, children: [_jsx("div", { style: { display: 'flex', gap: '12px' }, children: _jsx("button", { onClick: handleForkTemplate, disabled: loading, style: {
                        padding: '8px 16px',
                        background: '#f3f4f6',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        color: '#374151',
                        opacity: loading ? 0.6 : 1
                    }, children: "\uD83C\uDF74 Fork Template" }) }), _jsx("div", { style: { display: 'flex', gap: '12px' }, children: onClose && (_jsx("button", { onClick: onClose, style: {
                        padding: '8px 16px',
                        background: 'transparent',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#6b7280'
                    }, children: "Close" })) })] });
};
div >
;
;
;
export default TemplateCollaborationPanel;
