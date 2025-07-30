import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Tag, Tooltip, Space, Button, Drawer, List, Badge, Switch, Alert, Empty } from 'antd';
import { UserOutlined, SettingOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { CHANGE_TYPE_DESCRIPTIONS, RESOURCE_TYPE_DESCRIPTIONS } from '../../types/attribution';
import { useAttribution } from '../../hooks/useAttribution';
import { ContributorVisualization } from './ContributorVisualization';
const { Text, _____Title } = Typography;
const content = ();
;
_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx(Avatar, { size: 24, style: { backgroundColor: getAuthorColor(attribution.authorType) }, icon: _jsx(UserOutlined, {}), children: getAuthorInitials(attribution.authorName) }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [_jsx(Text, { strong: true, style: { fontSize: '12px' }, children: attribution.authorName || 'Anonymous' }), _jsx(Tag, { color: getAuthorColor(attribution.authorType), size: "small", children: attribution.authorType })] }), showDetails && ()
                    < div, " style=", { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }, ">", getChangeTypeIcon(attribution.changeType), _jsx(Text, { type: "secondary", style: { fontSize: '11px' }, children: CHANGE_TYPE_DESCRIPTIONS[attribution.changeType] }), _jsx(ClockCircleOutlined, { style: { fontSize: '10px', color: '#999' } }), _jsx(Text, { type: "secondary", style: { fontSize: '11px' }, children: formatTime(attribution.createdAt) }), attribution.isCollaborative && ()
                    < TeamOutlined, " style=", { fontSize: '10px', color: '#722ed1' }, " /> )}"] }), ")}"] });
div >
;
;
if (onClick) {
    return;
    _jsx("div", { style: { cursor: 'pointer', padding: '4px', borderRadius: '4px' }, onClick: onClick, onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; }, onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
        }, children: content });
    ;
    return content;
}
;
export const AttributionPanel = ({
    projectId,
    selectedResourceType,
    selectedResourceId,
    visible,
    onClose,
    onAttributionRecord
});
{
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
            [visible, projectId, selectedResourceType, selectedResourceId];
        }
    });
    const loadPrivacySettings = async () => {
        try {
            const settings = await getPrivacySettings(projectId);
            setPrivacySettings(settings);
        }
        catch (error) {
            console.error('Failed to load privacy settings:', error);
        }
        ;
        const loadResourceAttributions = async () => {
            if (!selectedResourceType || !selectedResourceId)
                return;
            try {
                const resourceAttributions = await getResourceAttribution();
                ;
                projectId,
                    selectedResourceType,
                    selectedResourceId;
            }
            finally {
            }
        };
    };
    ;
    setAttributions(resourceAttributions);
}
try { }
catch (error) {
    console.error('Failed to load resource attributions:', error);
}
;
const loadRecentAttributions = async () => {
    try {
        const recentAttributions = await listAttributions({});
        projectId,
            limit;
        50,
            offset;
        0,
            sortBy;
        'created_at',
            sortOrder;
        'desc',
        ;
    }
    finally { }
    ;
    setAttributions(recentAttributions);
};
try { }
catch (error) {
    console.error('Failed to load recent attributions:', error);
}
;
const handlePrivacySettingsChange = async (settings) => {
    try {
        const updatedSettings = await updatePrivacySettings({});
        projectId,
            settings;
        {
            privacySettings, ;
            settings;
        }
        as;
        any;
    }
    finally { }
    ;
    setPrivacySettings(updatedSettings);
};
try { }
catch (error) {
    console.error('Failed to update privacy settings:', error);
}
;
const handleAttributionClick = (attribution) => {
    setSelectedAttribution(attribution);
};
const groupedAttributions = attributions.reduce((groups, attribution) => {
    const key = `${attribution.resourceType}:${attribution.resourceId}`;
});
if (!groups[key]) {
    groups[key] = [];
    groups[key].push(attribution);
    return groups;
}
{ }
as;
Record;
;
const renderAttributionList = () => {
    if (selectedResourceType && selectedResourceId) {
        // Show attributions for specific resource
        return;
        _jsxs("div", { children: [_jsx("div", { style: { marginBottom: '12px' }, children: _jsxs(Text, { strong: true, children: ["Changes to ", selectedResourceType, " ", selectedResourceId] }) }), _jsx(List, { size: "small", dataSource: attributions, renderItem: (attribution) => ()
                        < List.Item, style: { padding: '8px 0' }, children: _jsx(AuthorIndicator, { attribution: attribution, onClick: () => handleAttributionClick(attribution) }) }), ")} />"] });
    }
};
;
{
    // Show recent attributions grouped by resource
    return;
    _jsxs("div", { children: [_jsx("div", { style: { marginBottom: '12px' }, children: _jsx(Text, { strong: true, children: "Recent Changes" }) }), Object.entries(groupedAttributions).map(([resourceKey, resourceAttributions]) => {
                const [resourceType, resourceId] = resourceKey.split(':');
                const _____latestAttribution = resourceAttributions[0];
                return;
                _jsxs(Card, { size: "small", style: { marginBottom: '8px' }, hoverable: true, children: [_jsx("div", { style: { marginBottom: '8px' }, children: _jsxs(Space, { children: [_jsx(Text, { strong: true, style: { fontSize: '12px' }, children: RESOURCE_TYPE_DESCRIPTIONS[resourceType] }), _jsx(Text, { code: true, style: { fontSize: '11px' }, children: resourceId }), _jsx(Badge, { count: resourceAttributions.length, size: "small" })] }) }), _jsx("div", { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' }, children: resourceAttributions.slice(0, 3).map((attribution) => ()
                                < Tooltip, key = { attribution, : .id }, title = {}
                                < div >
                                (_jsx("div", { children: attribution.authorName || 'Anonymous' })
                                    ,
                                        _jsx("div", { children: CHANGE_TYPE_DESCRIPTIONS[attribution.changeType] })
                                            ,
                                                _jsx("div", { children: attribution.createdAt.toLocaleString() }))) }), ">", _jsx(Avatar, { size: 20, style: {
                                backgroundColor: attribution.authorType === 'user' ? '#1890ff' : '#d9d9d9',
                                fontSize: '10px',
                                cursor: 'pointer',
                            }, onClick: () => handleAttributionClick(attribution), children: attribution.authorName?.[0] || '?' })] }, resourceKey);
            }), ")}", resourceAttributions.length > 3 && ()
                < Avatar, " size=", 20, " style=", { backgroundColor: '#f0f0f0', fontSize: '10px' }, "> +", resourceAttributions.length - 3] });
}
div >
;
Card >
;
;
div >
;
;
;
const renderPrivacySettings = () => ();
;
_jsxs("div", { children: [_jsx(Alert, { message: "Privacy Settings", description: "Control how your attribution information is displayed and tracked.", type: "info", showIcon: true, style: { marginBottom: '16px' } }), _jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Text, { children: "Show in attribution" }), _jsx(Switch, { checked: privacySettings?.showInAttribution, onChange: (checked) => handlePrivacySettingsChange({ showInAttribution: checked }) })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Text, { children: "Show detailed changes" }), _jsx(Switch, { checked: privacySettings?.showDetailedChanges, onChange: (checked) => handlePrivacySettingsChange({ showDetailedChanges: checked }) })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Text, { children: "Show timing information" }), _jsx(Switch, { checked: privacySettings?.showTimingInfo, onChange: (checked) => handlePrivacySettingsChange({ showTimingInfo: checked }) })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Text, { children: "Track property changes" }), _jsx(Switch, { checked: privacySettings?.trackPropertyChanges, onChange: (checked) => handlePrivacySettingsChange({ trackPropertyChanges: checked }) })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Text, { children: "Track position changes" }), _jsx(Switch, { checked: privacySettings?.trackPositionChanges, onChange: (checked) => handlePrivacySettingsChange({ trackPositionChanges: checked }) })] })] })] });
;
const renderAttributionDetail = () => {
    if (!selectedAttribution)
        return null;
    return;
    _jsxs("div", { children: [_jsx("div", { style: { marginBottom: '16px' }, children: _jsx(Button, { size: "small", onClick: () => setSelectedAttribution(null), children: "\u2190 Back" }) }), _jsxs(Card, { title: "Attribution Details", size: "small", children: [_jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsxs("div", { children: [_jsx(Text, { strong: true, children: "Author:" }), _jsx("div", { style: { marginTop: '4px' }, children: _jsx(AuthorIndicator, { attribution: selectedAttribution, showDetails: false }) })] }), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "Change:" }), _jsxs("div", { style: { marginTop: '4px' }, children: [_jsx(Tag, { color: "blue", children: selectedAttribution.changeType }), _jsx(Text, { children: CHANGE_TYPE_DESCRIPTIONS[selectedAttribution.changeType] })] })] }), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "Resource:" }), _jsxs("div", { style: { marginTop: '4px' }, children: [_jsx(Text, { children: RESOURCE_TYPE_DESCRIPTIONS[selectedAttribution.resourceType] }), _jsx(Text, { code: true, style: { marginLeft: '8px' }, children: selectedAttribution.resourceId })] })] }), _jsxs("div", { children: [_jsx(Text, { strong: true, children: "Time:" }), _jsx("div", { style: { marginTop: '4px' }, children: _jsx(Text, { children: selectedAttribution.createdAt.toLocaleString() }) })] }), selectedAttribution.changeDescription && ()
                                < div >
                                (_jsx(Text, { strong: true, children: "Description:" })
                                    ,
                                        _jsx("div", { style: { marginTop: '4px' }, children: _jsx(Text, { children: selectedAttribution.changeDescription }) }))] }), ")}", selectedAttribution.isCollaborative && ()
                        < div >
                        (_jsx(Text, { strong: true, children: "Collaboration:" })
                            ,
                                _jsx("div", { style: { marginTop: '4px' }, children: _jsxs(Tag, { color: "purple", children: [_jsx(TeamOutlined, {}), " ", selectedAttribution.collaboratorCount, " collaborators"] }) }))] })] });
};
_jsxs("div", { children: [_jsx(Text, { strong: true, children: "Confidence:" }), _jsx("div", { style: { marginTop: '4px' }, children: _jsxs(Text, { children: [(selectedAttribution.confidenceScore * 100).toFixed(1), "%"] }) })] });
Space >
;
Card >
;
div >
;
;
;
return;
_jsx(Drawer, { title: "Change Attribution", placement: "right", onClose: onClose, visible: visible, width: 400, extra: _jsxs(Space, { children: [_jsx(Tooltip, { title: "Contributors", children: _jsx(Button, { icon: _jsx(TeamOutlined, {}), size: "small", onClick: () => setShowContributors(true) }) }), _jsx(Tooltip, { title: "Privacy Settings", children: _jsx(Button, { icon: _jsx(SettingOutlined, {}), size: "small", onClick: () => setShowPrivacySettings(true) }) })] })
        >
            { error } && ()
        < Alert, message: "Error", description: error, type: "error", showIcon: true, closable: true, style: { marginBottom: '16px' } });
{
    privacySettings && !privacySettings.showInAttribution && ()
        < Alert;
    message = "Attribution Disabled";
    description = "You have disabled attribution tracking. Your changes will not be attributed to you.";
    type = "warning";
    showIcon;
    style = {};
    {
        marginBottom: '16px';
    }
}
/>;
{
    selectedAttribution ? renderAttributionDetail() : ()
        < div;
    style = {};
    {
        minHeight: '400px';
    }
}
 >
    { attributions, : .length > 0 ? renderAttributionList() : ()
            < Empty, description = "No attributions found" /  >
    };
div >
;
{ /* Contributors Modal */ }
_jsx(Drawer, { title: "Contributors", placement: "right", onClose: () => setShowContributors(false), visible: showContributors, width: 800, children: _jsx(ContributorVisualization, { projectId: projectId, visible: showContributors, onClose: () => setShowContributors(false) }) });
{ /* Privacy Settings Modal */ }
_jsx(Drawer, { title: "Privacy Settings", placement: "right", onClose: () => setShowPrivacySettings(false), visible: showPrivacySettings, width: 400, children: renderPrivacySettings() });
Drawer >
;
;
;
