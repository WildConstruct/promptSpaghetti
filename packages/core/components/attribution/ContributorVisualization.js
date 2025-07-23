import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Timeline, Tag, Tooltip, Space, Progress, Row, Col, Statistic, Tabs, DatePicker, Select, Button, Empty } from 'antd';
import { UserOutlined, ClockCircleOutlined, EditOutlined, TeamOutlined, TrophyOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { CHANGE_TYPE_DESCRIPTIONS, RESOURCE_TYPE_DESCRIPTIONS } from '../../types/attribution';
import { useAttribution } from '../../hooks/useAttribution';
const { Title, Text, _____Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { _____Option } = Select;
const ContributorCard = ({ contributor, _____projectId, onViewDetails }) => {
    const getContributorInitials = (name) => {
        if (!name)
            return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };
    const getContributorColor = (authorType) => {
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
    const formatDuration = (start, end) => {
        const duration = end.getTime() - start.getTime();
        const days = Math.floor(duration / (1000 * 60 * 60 * 24));
        if (days === 0)
            return 'Today';
        if (days === 1)
            return '1 day';
        if (days < 30)
            return `${days} days`;
        if (days < 365)
            return `${Math.floor(days / 30)} months`;
        return `${Math.floor(days / 365)} years`;
    };
    const topExpertise = contributor.expertise
        .sort((a, b) => b.changes - a.changes)
        .slice(0, 3);
    return (_jsx(Card, { size: "small", hoverable: true, onClick: () => contributor.authorId && onViewDetails(contributor.authorId), style: { marginBottom: '8px' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx(Avatar, { size: 48, style: { backgroundColor: getContributorColor(contributor.authorType) }, icon: _jsx(UserOutlined, {}), children: getContributorInitials(contributor.authorName) }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }, children: [_jsx(Text, { strong: true, children: contributor.authorName || 'Anonymous' }), _jsx(Tag, { color: getContributorColor(contributor.authorType), size: "small", children: contributor.authorType.toUpperCase() })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }, children: [_jsxs(Space, { size: "small", children: [_jsx(EditOutlined, {}), _jsxs(Text, { type: "secondary", children: [contributor.totalChanges, " changes"] })] }), _jsxs(Space, { size: "small", children: [_jsx(ClockCircleOutlined, {}), _jsx(Text, { type: "secondary", children: formatDuration(contributor.firstContribution, contributor.lastContribution) })] }), contributor.collaborations.length > 0 && (_jsxs(Space, { size: "small", children: [_jsx(TeamOutlined, {}), _jsxs(Text, { type: "secondary", children: [contributor.collaborations.length, " collaborations"] })] }))] }), _jsx("div", { style: { display: 'flex', gap: '4px' }, children: topExpertise.map((expertise) => (_jsx(Tooltip, { title: `${expertise.changes} ${RESOURCE_TYPE_DESCRIPTIONS[expertise.resourceType]} changes (${expertise.percentage.toFixed(1)}%)`, children: _jsxs(Tag, { size: "small", color: "blue", children: [expertise.resourceType, " ", expertise.percentage.toFixed(0), "%"] }) }, expertise.resourceType))) })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx(Progress, { type: "circle", size: 32, percent: Math.min(100, (contributor.totalChanges / 100) * 100), showInfo: false, strokeColor: getContributorColor(contributor.authorType) }), _jsx("div", { style: { fontSize: '11px', color: '#666', marginTop: '2px' }, children: "Activity" })] })] }) }));
};
export const ContributorVisualization = ({ projectId, visible = true, onClose }) => {
    const [contributors, setContributors] = useState(null);
    const [recentAttributions, setRecentAttributions] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [dateRange, setDateRange] = useState(null);
    const [selectedContributor, setSelectedContributor] = useState(null);
    const [showAnonymous, setShowAnonymous] = useState(false);
    const { getContributorStats, listAttributions, _____loading, _____error } = useAttribution();
    useEffect(() => {
        if (visible) {
            loadContributors();
            loadRecentAttributions();
        }
    }, [visible, projectId, dateRange]);
    const loadContributors = async () => {
        try {
            const stats = await getContributorStats(projectId, dateRange ? {
                start: dateRange[0],
                end: dateRange[1]
            } : undefined);
            setContributors(stats);
        }
        catch (error) {
            console.error('Failed to load contributors:', error);
        }
    };
    const loadRecentAttributions = async () => {
        try {
            const attributions = await listAttributions({
                projectId,
                dateFrom: dateRange?.[0],
                dateTo: dateRange?.[1],
                limit: 50,
                offset: 0,
                sortBy: 'created_at',
                sortOrder: 'desc'
            });
            setRecentAttributions(attributions);
        }
        catch (error) {
            console.error('Failed to load recent attributions:', error);
        }
    };
    const handleViewDetails = (contributorId) => {
        setSelectedContributor(contributorId);
        setActiveTab('details');
    };
    const filteredContributors = contributors?.contributors.filter(contributor => {
        if (!showAnonymous && contributor.authorType === 'anonymous') {
            return false;
        }
        return true;
    }) || [];
    const getChangeTypeIcon = (changeType) => {
        switch (changeType) {
            case 'create':
                return _jsx(EditOutlined, { style: { color: '#52c41a' } });
            case 'update':
                return _jsx(EditOutlined, { style: { color: '#1890ff' } });
            case 'delete':
                return _jsx(EditOutlined, { style: { color: '#ff4d4f' } });
            default:
                return _jsx(EditOutlined, {});
        }
    };
    const getChangeTypeColor = (changeType) => {
        switch (changeType) {
            case 'create':
                return 'success';
            case 'update':
                return 'processing';
            case 'delete':
                return 'error';
            default:
                return 'default';
        }
    };
    const formatTime = (date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (minutes < 60)
            return `${minutes}m ago`;
        if (hours < 24)
            return `${hours}h ago`;
        if (days < 30)
            return `${days}d ago`;
        return date.toLocaleDateString();
    };
    if (!visible)
        return null;
    return (_jsxs("div", { style: { padding: '16px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }, children: [_jsx(Title, { level: 4, children: "Change Attribution" }), _jsxs(Space, { children: [_jsxs(Button, { icon: showAnonymous ? _jsx(EyeInvisibleOutlined, {}) : _jsx(EyeOutlined, {}), onClick: () => setShowAnonymous(!showAnonymous), size: "small", children: [showAnonymous ? 'Hide' : 'Show', " Anonymous"] }), _jsx(RangePicker, { size: "small", value: dateRange, onChange: (dates) => setDateRange(dates), placeholder: ['Start date', 'End date'] }), onClose && (_jsx(Button, { size: "small", onClick: onClose, children: "Close" }))] })] }), _jsxs(Tabs, { activeKey: activeTab, onChange: setActiveTab, children: [_jsxs(TabPane, { tab: "Overview", children: [_jsxs(Row, { gutter: 16, style: { marginBottom: '16px' }, children: [_jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Total Contributors", value: contributors?.summary.totalContributors || 0, prefix: _jsx(UserOutlined, {}) }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Active Contributors", value: contributors?.summary.activeContributors || 0, prefix: _jsx(TeamOutlined, {}) }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Avg. Contributions", value: contributors?.summary.averageContributionsPerUser || 0, precision: 1, prefix: _jsx(EditOutlined, {}) }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Top Contributor", value: contributors?.summary.mostActiveContributor?.authorName || 'None', prefix: _jsx(TrophyOutlined, {}) }) }) })] }), _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 16, children: _jsx(Card, { title: "Contributors", size: "small", children: _jsx("div", { style: { maxHeight: '400px', overflowY: 'auto' }, children: filteredContributors.length > 0 ? (filteredContributors.map((contributor) => (_jsx(ContributorCard, { contributor: contributor, projectId: projectId, onViewDetails: handleViewDetails }, contributor.authorId || contributor.authorName)))) : (_jsx(Empty, { description: "No contributors found" })) }) }) }), _jsx(Col, { span: 8, children: _jsx(Card, { title: "Recent Activity", size: "small", children: _jsx(Timeline, { style: { maxHeight: '400px', overflowY: 'auto' }, items: recentAttributions.slice(0, 20).map((attribution) => ({
                                                    dot: getChangeTypeIcon(attribution.changeType),
                                                    children: (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs(Space, { size: "small", children: [_jsx(Text, { strong: true, children: attribution.authorName || 'Anonymous' }), _jsx(Tag, { color: getChangeTypeColor(attribution.changeType), size: "small", children: attribution.changeType.toUpperCase() })] }), _jsx(Text, { type: "secondary", style: { fontSize: '11px' }, children: formatTime(attribution.createdAt) })] }), _jsx(Text, { type: "secondary", style: { fontSize: '12px' }, children: attribution.changeDescription ||
                                                                    `${CHANGE_TYPE_DESCRIPTIONS[attribution.changeType]} ${RESOURCE_TYPE_DESCRIPTIONS[attribution.resourceType]}` }), attribution.isCollaborative && (_jsx("div", { style: { marginTop: '2px' }, children: _jsxs(Tag, { color: "purple", size: "small", children: [_jsx(TeamOutlined, { style: { marginRight: '2px' } }), attribution.collaboratorCount, " collaborators"] }) }))] }))
                                                })) }) }) })] })] }, "overview"), _jsx(TabPane, { tab: "Details", children: selectedContributor ? (_jsx(ContributorDetails, { projectId: projectId, contributorId: selectedContributor, onBack: () => setSelectedContributor(null) })) : (_jsx("div", { style: { textAlign: 'center', padding: '40px' }, children: _jsx(Text, { type: "secondary", children: "Select a contributor to view details" }) })) }, "details"), _jsx(TabPane, { tab: "Analytics", children: _jsx(ContributorAnalytics, { contributors: contributors, projectId: projectId }) }, "analytics")] })] }));
};
// Placeholder components for detailed views
const ContributorDetails = ({ _____projectId, contributorId, onBack }) => {
    return (_jsxs("div", { children: [_jsx(Button, { onClick: onBack, style: { marginBottom: '16px' }, children: "\u2190 Back to Overview" }), _jsx(Card, { title: "Contributor Details", children: _jsxs(Text, { children: ["Detailed contributor information for ", contributorId] }) })] }));
};
const ContributorAnalytics = ({ _____contributors, _____projectId }) => {
    return (_jsx("div", { children: _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsx(Card, { title: "Contribution Patterns", children: _jsx(Text, { children: "Analytics about contribution patterns" }) }) }), _jsx(Col, { span: 12, children: _jsx(Card, { title: "Collaboration Network", children: _jsx(Text, { children: "Collaboration network visualization" }) }) })] }) }));
};
