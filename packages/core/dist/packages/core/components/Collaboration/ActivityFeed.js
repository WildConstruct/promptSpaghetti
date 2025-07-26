import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Activity, Filter, RefreshCw, Search, Users, MessageCircle, Edit3, GitBranch, FileText, Trash2, ExternalLink } from 'lucide-react';
import { useActivityFeed } from '../../hooks/useActivityFeed';
const ACTIVITY_ICONS = {
    'project_created': FileText,
    'project_updated': Edit3,
    'project_deleted': Trash2,
    'resource_created': FileText,
    'resource_updated': Edit3,
    'resource_deleted': Trash2,
    'comment_added': MessageCircle,
    'comment_updated': MessageCircle,
    'comment_deleted': MessageCircle,
    'member_added': Users,
    'member_removed': Users,
    'member_role_changed': Users,
    'workflow_state_changed': GitBranch,
    'approval_requested': GitBranch,
    'approval_granted': GitBranch,
    'approval_rejected': GitBranch,
    'version_created': GitBranch,
    'branch_created': GitBranch,
    'branch_merged': GitBranch,
    'template_applied': FileText,
    'collaboration_started': Users,
    'collaboration_ended': Users
};
const ACTIVITY_COLORS = {
    'project_created': 'text-green-500',
    'project_updated': 'text-blue-500',
    'project_deleted': 'text-red-500',
    'resource_created': 'text-green-500',
    'resource_updated': 'text-blue-500',
    'resource_deleted': 'text-red-500',
    'comment_added': 'text-purple-500',
    'comment_updated': 'text-purple-500',
    'comment_deleted': 'text-red-500',
    'member_added': 'text-green-500',
    'member_removed': 'text-red-500',
    'member_role_changed': 'text-orange-500',
    'workflow_state_changed': 'text-blue-500',
    'approval_requested': 'text-yellow-500',
    'approval_granted': 'text-green-500',
    'approval_rejected': 'text-red-500',
    'version_created': 'text-blue-500',
    'branch_created': 'text-green-500',
    'branch_merged': 'text-purple-500',
    'template_applied': 'text-blue-500',
    'collaboration_started': 'text-green-500',
    'collaboration_ended': 'text-gray-500'
};
export const ActivityFeed = ({ workspaceId, maxItems = 50, showFilters = true, showLoadMore = true, onActivityClick }) => {
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [actorFilter, setActorFilter] = useState('all');
    const { activities, loading, error, hasMore, stats, actors, refreshActivities, loadMore, realTimeConnection } = useActivityFeed({
        workspaceId,
        projectId,
        userId,
        searchTerm,
        typeFilter: typeFilter === 'all' ? undefined : typeFilter,
        dateFilter: dateFilter === 'all' ? undefined : dateFilter,
        actorFilter: actorFilter === 'all' ? undefined : actorFilter,
        realTime
    });
    const handleRefresh = useCallback(() => {
        refreshActivities();
    }, [refreshActivities]);
    const handleLoadMore = useCallback(() => {
        if (hasMore && !loading) {
            loadMore();
        }
    }, [hasMore, loading, loadMore]);
    const renderActivityItem = (activity) => {
        const Icon = ACTIVITY_ICONS[activity.type] || Activity;
        const iconColor = ACTIVITY_COLORS[activity.type] || 'text-gray-500';
        return (_jsxs("div", { className: "flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors", children: [_jsx("div", { className: `flex-shrink-0 p-1 rounded-full bg-gray-100 ${iconColor}`, children: _jsx(Icon, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: activity.actor_name || 'Unknown User' }), _jsx("span", { className: "text-sm text-gray-500", children: activity.description })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-xs text-gray-400", children: formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }) }), activity.resource_url && (_jsx("button", { onClick: () => window.open(activity.resource_url, '_blank'), className: "p-1 text-gray-400 hover:text-blue-600 transition-colors", title: "View resource", children: _jsx(ExternalLink, { className: "w-3 h-3" }) }))] })] }), activity.details && (_jsx("div", { className: "mt-1 text-sm text-gray-600", children: typeof activity.details === 'string' ? (activity.details) : (_jsx("pre", { className: "whitespace-pre-wrap font-sans", children: JSON.stringify(activity.details, null, 2) })) })), (activity.project_name || activity.resource_name) && (_jsxs("div", { className: "flex items-center space-x-4 mt-2 text-xs text-gray-500", children: [activity.project_name && (_jsxs("span", { children: ["Project: ", activity.project_name] })), activity.resource_name && (_jsxs("span", { children: ["Resource: ", activity.resource_name] }))] }))] })] }, activity.id));
    };
    return (_jsxs("div", { className: `bg-white rounded-lg border border-gray-200 ${className}`, children: [_jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Activity, { className: "w-5 h-5 text-gray-600" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Activity Feed" }), stats && (_jsxs("span", { className: "text-sm text-gray-500", children: ["(", stats.total, " activities)"] }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [realTime && (_jsx("div", { className: `w-2 h-2 rounded-full ${realTimeConnection?.status === 'connected' ? 'bg-green-400' :
                                            realTimeConnection?.status === 'connecting' ? 'bg-yellow-400' :
                                                'bg-red-400'}`, title: `Connection: ${realTimeConnection?.status || 'disconnected'}` })), _jsx("button", { onClick: handleRefresh, disabled: loading, className: "p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50", title: "Refresh activities", children: _jsx(RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }) })] })] }), (showSearch || showFilters) && (_jsxs("div", { className: "mt-4 space-y-3", children: [showSearch && (_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search activities...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] })), showFilters && (_jsx("div", { className: "flex items-center space-x-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Filter, { className: "w-4 h-4 text-gray-400" }), _jsxs("select", { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), className: "text-sm border border-gray-300 rounded px-2 py-1", children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "project_created", children: "Project Created" }), _jsx("option", { value: "project_updated", children: "Project Updated" }), _jsx("option", { value: "comment_added", children: "Comments" }), _jsx("option", { value: "member_added", children: "Member Changes" }), _jsx("option", { value: "workflow_state_changed", children: "Workflow" }), _jsx("option", { value: "version_created", children: "Versions" }), _jsx("option", { value: "collaboration_started", children: "Collaboration" })] }), _jsxs("select", { value: dateFilter, onChange: (e) => setDateFilter(e.target.value), className: "text-sm border border-gray-300 rounded px-2 py-1", children: [_jsx("option", { value: "all", children: "All Time" }), _jsx("option", { value: "today", children: "Today" }), _jsx("option", { value: "week", children: "This Week" }), _jsx("option", { value: "month", children: "This Month" })] }), actors && actors.length > 0 && (_jsxs("select", { value: actorFilter, onChange: (e) => setActorFilter(e.target.value), className: "text-sm border border-gray-300 rounded px-2 py-1", children: [_jsx("option", { value: "all", children: "All Users" }), actors.map(actor => (_jsx("option", { value: actor.id, children: actor.name }, actor.id)))] }))] }) }))] }))] }), _jsxs("div", { className: "overflow-y-auto", style: { maxHeight }, children: [loading && activities.length === 0 && (_jsx("div", { className: "p-8 text-center", children: _jsx("div", { className: "animate-pulse space-y-4", children: [...Array(3)].map((_, i) => (_jsxs("div", { className: "flex items-start space-x-3 p-3", children: [_jsx("div", { className: "w-8 h-8 bg-gray-200 rounded-full" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-1/2" })] })] }, i))) }) })), error && (_jsxs("div", { className: "p-8 text-center text-red-500", children: [_jsxs("p", { children: ["Error loading activities: ", error.message] }), _jsx("button", { onClick: handleRefresh, className: "mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors", children: "Try again" })] })), !loading && !error && activities.length === 0 && (_jsxs("div", { className: "p-8 text-center text-gray-500", children: [_jsx(Activity, { className: "w-12 h-12 mx-auto mb-4 text-gray-300" }), _jsx("p", { children: "No activities found" }), (searchTerm || typeFilter !== 'all' || dateFilter !== 'all') && (_jsx("p", { className: "text-sm mt-2", children: "Try adjusting your filters" }))] })), !loading && !error && activities.length > 0 && (_jsx("div", { className: "divide-y divide-gray-100", children: activities.map(renderActivityItem) })), hasMore && !loading && activities.length > 0 && (_jsx("div", { className: "p-4 text-center border-t border-gray-200", children: _jsx("button", { onClick: handleLoadMore, className: "text-sm text-blue-600 hover:text-blue-800 transition-colors", children: "Load more activities" }) })), loading && activities.length > 0 && (_jsx("div", { className: "p-4 text-center border-t border-gray-200", children: _jsx("div", { className: "text-sm text-gray-500", children: "Loading more activities..." }) }))] })] }));
};
