import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Tag, Tooltip, Space, Button, Drawer, List, Badge, Switch, Alert, Empty, } from 'antd';
import { UserOutlined, SettingOutlined, TeamOutlined, ClockCircleOutlined, EditOutlined, DeleteOutlined, PlusOutlined, NodeIndexOutlined, ShareAltOutlined, } from '@ant-design/icons';
import { CHANGE_TYPE_DESCRIPTIONS, RESOURCE_TYPE_DESCRIPTIONS, } from '../../types/attribution';
import { useAttribution } from '../../hooks/useAttribution';
import { ContributorVisualization } from './ContributorVisualization';
const { Text, Title } = Typography;
const AuthorIndicator = ({ attribution, showDetails = true, onClick }) => {
    const getAuthorInitials = (name) => {
        if (!name)
            return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };
    const getAuthorColor = (authorType) => {
        switch (authorType) {
            case 'user':
                return '#1890ff';
            case 'anonymous':
                return '#d9d9d9';
            case 'guest':
                return '#faad14';
            case 'system':
                return '#52c41a';
            case 'api':
                return '#722ed1';
            default:
                return '#8c8c8c';
        }
    };
    const getChangeTypeIcon = (changeType) => {
        switch (changeType) {
            case 'create':
                return _jsx(PlusOutlined, { style: { color: '#52c41a' } });
            case 'update':
                return _jsx(EditOutlined, { style: { color: '#1890ff' } });
            case 'delete':
                return _jsx(DeleteOutlined, { style: { color: '#ff4d4f' } });
            case 'move':
                return _jsx(NodeIndexOutlined, { style: { color: '#722ed1' } });
            case 'connection_change':
                return _jsx(ShareAltOutlined, { style: { color: '#fa8c16' } });
            default:
                return _jsx(EditOutlined, {});
        }
    };
    const formatTime = (date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (minutes < 1)
            return 'Just now';
        if (minutes < 60)
            return `${minutes}m ago`;
        if (hours < 24)
            return `${hours}h ago`;
        if (days < 7)
            return `${days}d ago`;
        return date.toLocaleDateString();
    };
    const content = (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx(Avatar, { size: 24, style: { backgroundColor: getAuthorColor(attribution.authorType) }, icon: _jsx(UserOutlined, {}), children: getAuthorInitials(attribution.authorName) }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [_jsx(Text, { strong: true, style: { fontSize: '12px' }, children: attribution.authorName || 'Anonymous' }), _jsx(Tag, { color: getAuthorColor(attribution.authorType), size: "small", children: attribution.authorType })] }), showDetails && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }, children: [getChangeTypeIcon(attribution.changeType), _jsx(Text, { type: "secondary", style: { fontSize: '11px' }, children: CHANGE_TYPE_DESCRIPTIONS[attribution.changeType] }), _jsx(ClockCircleOutlined, { style: { fontSize: '10px', color: '#999' } }), _jsx(Text, { type: "secondary", style: { fontSize: '11px' }, children: formatTime(attribution.createdAt) }), attribution.isCollaborative && (_jsx(TeamOutlined, { style: { fontSize: '10px', color: '#722ed1' } }))] }))] })] }));
    if (onClick) {
        return (_jsx("div", { style: { cursor: 'pointer', padding: '4px', borderRadius: '4px' }, onClick: onClick, onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; }, onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }, children: content }));
    }
    return content;
};
export const AttributionPanel = ({ projectId, selectedResourceType, selectedResourceId, visible, onClose, onAttributionRecord, }) => {
    const [attributions, setAttributions] = useState([]);
    const [showContributors, setShowContributors] = useState(false);
    const [privacySettings, setPrivacySettings] = useState(null);
    const [showPrivacySettings, setShowPrivacySettings] = useState(false);
    const [selectedAttribution, setSelectedAttribution] = useState(null);
    const { listAttributions, getResourceAttribution, getPrivacySettings, updatePrivacySettings, loading, error } = useAttribution();
    useEffect(() => {
        if (visible) {
            loadPrivacySettings();
            if (selectedResourceType && selectedResourceId) {
                loadResourceAttributions();
            }
            else {
                loadRecentAttributions();
            }
        }
    }, [visible, projectId, selectedResourceType, selectedResourceId]);
    const loadPrivacySettings = async () => {
        try {
            const settings = await getPrivacySettings(projectId);
            setPrivacySettings(settings);
        }
        catch (error) {
            console.error('Failed to load privacy settings:', error);
        }
    };
    const loadResourceAttributions = async () => {
        if (!selectedResourceType || !selectedResourceId)
            return;
        try {
            const resourceAttributions = await getResourceAttribution(projectId, selectedResourceType, selectedResourceId);
            setAttributions(resourceAttributions);
        }
        catch (error) {
            console.error('Failed to load resource attributions:', error);
        }
    };
    const loadRecentAttributions = async () => {
        try {
            const recentAttributions = await listAttributions({
                projectId,
                limit: 50,
                offset: 0,
                sortBy: 'created_at',
                sortOrder: 'desc',
            });
            setAttributions(recentAttributions);
        }
        catch (error) {
            console.error('Failed to load recent attributions:', error);
        }
    };
    const handlePrivacySettingsChange = async (settings) => {
        try {
            const updatedSettings = await updatePrivacySettings({
                projectId,
                settings: { ...privacySettings, ...settings },
            });
            setPrivacySettings(updatedSettings);
        }
        catch (error) {
            console.error('Failed to update privacy settings:', error);
        }
    };
    const handleAttributionClick = (attribution) => {
        setSelectedAttribution(attribution);
    };
    const groupedAttributions = attributions.reduce((groups, attribution) => {
        const key = `${attribution.resourceType}:${attribution.resourceId}`;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(attribution);
        return groups;
    }, {});
    const renderAttributionList = () => {
        if (selectedResourceType && selectedResourceId) {
            // Show attributions for specific resource
            return (_jsxs("div", { children: [_jsx("div", { style: { marginBottom: '12px' }, children: _jsxs(Text, { strong: true, children: ["Changes to ", selectedResourceType, " ", selectedResourceId] }) }), _jsx(List, { size: "small", dataSource: attributions, renderItem: (attribution) => (_jsx(List.Item, { style: { padding: '8px 0' }, children: _jsx(AuthorIndicator, { attribution: attribution, onClick: () => handleAttributionClick(attribution) }) })) })] }));
        }
        else {
            // Show recent attributions grouped by resource
            return (_jsxs("div", { children: [_jsx("div", { style: { marginBottom: '12px' }, children: _jsx(Text, { strong: true, children: "Recent Changes" }) }), Object.entries(groupedAttributions).map(([resourceKey, resourceAttributions]) => {
                        const [resourceType, resourceId] = resourceKey.split(':');
                        const latestAttribution = resourceAttributions[0];
                        return (_jsxs(Card, { size: "small", style: { marginBottom: '8px' }, hoverable: true, children: [_jsx("div", { style: { marginBottom: '8px' }, children: _jsxs(Space, { children: [_jsx(Text, { strong: true, style: { fontSize: '12px' }, children: RESOURCE_TYPE_DESCRIPTIONS[resourceType] }), _jsx(Text, { code: true, style: { fontSize: '11px' }, children: resourceId }), _jsx(Badge, { count: resourceAttributions.length, size: "small" })] }) }), _jsxs("div", { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' }, children: [resourceAttributions.slice(0, 3).map((attribution) => (_jsx(Tooltip, { title: _jsxs("div", { children: [_jsx("div", { children: attribution.authorName || 'Anonymous' }), _jsx("div", { children: CHANGE_TYPE_DESCRIPTIONS[attribution.changeType] }), _jsx("div", { children: attribution.createdAt.toLocaleString() })] }), children: _jsx(Avatar, { size: 20, style: {
                                                    backgroundColor: attribution.authorType === 'user' ? '#1890ff' : '#d9d9d9',
                                                    fontSize: '10px',
                                                    cursor: 'pointer',
                                                }, onClick: () => handleAttributionClick(attribution), children: attribution.authorName?.[0] || '?' }) }, attribution.id))), resourceAttributions.length > 3 && (_jsxs(Avatar, { size: 20, style: { backgroundColor: '#f0f0f0', fontSize: '10px' }, children: ["+", resourceAttributions.length - 3] }))] })] }, resourceKey));
                    })] }));
        }
    };
    const renderPrivacySettings = () => (_jsxs("div", { children: [_jsx(Alert, { message: "Privacy Settings", description: "Control how your attribution information is displayed and tracked.", type: "info", showIcon: true, style: { marginBottom: '16px' } }), _jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Text, { children: "Show in attribution" }), _jsx(Switch, { checked: privacySettings?.showInAttribution, onChange: (checked) => handlePrivacySettingsChange({ showInAttribution: checked }) })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Text, { children: "Show detailed changes" }), _jsx(Switch, { checked: privacySettings?.showDetailedChanges, onChange: (checked) => handlePrivacySettingsChange({ showDetailedChanges: checked }) })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Text, { children: "Show timing information" }), _jsx(Switch, { checked: privacySettings?.showTimingInfo, onChange: (checked) => handlePrivacySettingsChange({ showTimingInfo: checked }) })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Text, { children: "Track property changes" }), _jsx(Switch, { checked: privacySettings?.trackPropertyChanges, onChange: (checked) => handlePrivacySettingsChange({ trackPropertyChanges: checked }) })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Text, { children: "Track position changes" }), _jsx(Switch, { checked: privacySettings?.trackPositionChanges, onChange: (checked) => handlePrivacySettingsChange({ trackPositionChanges: checked }) })] })] })] }));
    const renderAttributionDetail = () => {
        if (!selectedAttribution)
            return null;
        return (_jsxs("div", { children: [_jsx("div", { style: { marginBottom: '16px' }, children: _jsx(Button, { size: "small", onClick: () => setSelectedAttribution(null), children: "\u2190 Back" }) }), _jsx(Card, { title: "Attribution Details", size: "small", children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsxs("div", { children: [_jsx(Text, { strong: true, children: "Author:" }), _jsx("div", { style: { marginTop: '4px' }, children: _jsx(AuthorIndicator, { attribution: selectedAttribution, showDetails: false }) })] }), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "Change:" }), _jsxs("div", { style: { marginTop: '4px' }, children: [_jsx(Tag, { color: "blue", children: selectedAttribution.changeType }), _jsx(Text, { children: CHANGE_TYPE_DESCRIPTIONS[selectedAttribution.changeType] })] })] }), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "Resource:" }), _jsxs("div", { style: { marginTop: '4px' }, children: [_jsx(Text, { children: RESOURCE_TYPE_DESCRIPTIONS[selectedAttribution.resourceType] }), _jsx(Text, { code: true, style: { marginLeft: '8px' }, children: selectedAttribution.resourceId })] })] }), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "Time:" }), _jsx("div", { style: { marginTop: '4px' }, children: _jsx(Text, { children: selectedAttribution.createdAt.toLocaleString() }) })] }), selectedAttribution.changeDescription && (_jsxs("div", { children: [_jsx(Text, { strong: true, children: "Description:" }), _jsx("div", { style: { marginTop: '4px' }, children: _jsx(Text, { children: selectedAttribution.changeDescription }) })] })), selectedAttribution.isCollaborative && (_jsxs("div", { children: [_jsx(Text, { strong: true, children: "Collaboration:" }), _jsx("div", { style: { marginTop: '4px' }, children: _jsxs(Tag, { color: "purple", children: [_jsx(TeamOutlined, {}), " ", selectedAttribution.collaboratorCount, " collaborators"] }) })] })), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "Confidence:" }), _jsx("div", { style: { marginTop: '4px' }, children: _jsxs(Text, { children: [(selectedAttribution.confidenceScore * 100).toFixed(1), "%"] }) })] })] }) })] }));
    };
    return (_jsxs(Drawer, { title: "Change Attribution", placement: "right", onClose: onClose, visible: visible, width: 400, extra: _jsxs(Space, { children: [_jsx(Tooltip, { title: "Contributors", children: _jsx(Button, { icon: _jsx(TeamOutlined, {}), size: "small", onClick: () => setShowContributors(true) }) }), _jsx(Tooltip, { title: "Privacy Settings", children: _jsx(Button, { icon: _jsx(SettingOutlined, {}), size: "small", onClick: () => setShowPrivacySettings(true) }) })] }), children: [error && (_jsx(Alert, { message: "Error", description: error, type: "error", showIcon: true, closable: true, style: { marginBottom: '16px' } })), privacySettings && !privacySettings.showInAttribution && (_jsx(Alert, { message: "Attribution Disabled", description: "You have disabled attribution tracking. Your changes will not be attributed to you.", type: "warning", showIcon: true, style: { marginBottom: '16px' } })), selectedAttribution ? renderAttributionDetail() : (_jsx("div", { style: { minHeight: '400px' }, children: attributions.length > 0 ? renderAttributionList() : (_jsx(Empty, { description: "No attributions found" })) })), _jsx(Drawer, { title: "Contributors", placement: "right", onClose: () => setShowContributors(false), visible: showContributors, width: 800, children: _jsx(ContributorVisualization, { projectId: projectId, visible: showContributors, onClose: () => setShowContributors(false) }) }), _jsx(Drawer, { title: "Privacy Settings", placement: "right", onClose: () => setShowPrivacySettings(false), visible: showPrivacySettings, width: 400, children: renderPrivacySettings() })] }));
};
