import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 9.2.3 - Activity Feed Component
 * Main activity feed interface for workspace activity
 */
import { useState } from 'react';
import { ActivityItem } from './ActivityItem';
import { ActivityFilters } from './ActivityFilters';
import { ActivityStats } from './ActivityStats';
import { useActivityFeed } from '../../hooks/useActivityFeed';
export const ActivityFeed = ({ workspaceId, userId, projectId, showStats = true, showFilters = true, maxItems, compact = false }) => {
    const [filters, setFilters] = useState({
        project_id: projectId
    });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { activities, loading, error, hasMore, stats, eventTypes, loadMore, refresh } = useActivityFeed(workspaceId, userId, filters, {
        limit: maxItems || 20,
        autoRefresh: true
    });
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };
    const handleEventClick = (event) => {
        if (!compact) {
            setSelectedEvent(event);
        }
    };
    if (error) {
        return (_jsx("div", { className: "activity-feed activity-feed--error", children: _jsxs("div", { className: "activity-feed__error", children: [_jsx("h3", { children: "Failed to load activity" }), _jsx("p", { children: error }), _jsx("button", { className: "btn btn--secondary", onClick: refresh, children: "Try Again" })] }) }));
    }
    return (_jsxs("div", { className: `activity-feed ${compact ? 'activity-feed--compact' : ''}`, children: [showStats && stats && !compact && (_jsx(ActivityStats, { stats: stats, workspaceId: workspaceId, className: "activity-feed__stats" })), showFilters && !compact && (_jsx(ActivityFilters, { filters: filters, eventTypes: eventTypes, onFilterChange: handleFilterChange, className: "activity-feed__filters" })), _jsxs("div", { className: "activity-feed__content", children: [_jsxs("div", { className: "activity-feed__header", children: [_jsxs("h3", { children: [projectId ? 'Project Activity' : 'Workspace Activity', activities.length > 0 && ` (${activities.length})`] }), !compact && (_jsx("button", { className: "btn btn--ghost btn--small", onClick: refresh, disabled: loading, children: loading ? 'Refreshing...' : 'Refresh' }))] }), _jsx("div", { className: "activity-feed__list", children: loading && activities.length === 0 ? (_jsx("div", { className: "activity-feed__loading", children: _jsx(ActivityFeedSkeleton, { count: 5, compact: compact }) })) : activities.length === 0 ? (_jsx("div", { className: "activity-feed__empty", children: _jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-state__icon", children: "\uD83D\uDCCB" }), _jsx("h4", { children: "No activity yet" }), _jsx("p", { children: projectId
                                            ? 'Project activity will appear here as team members work on content.'
                                            : 'Workspace activity will appear here as team members collaborate.' })] }) })) : (_jsxs(_Fragment, { children: [activities.map((activity, index) => (_jsx(ActivityItem, { activity: activity, onClick: () => handleEventClick(activity), compact: compact, showProject: !projectId, isLast: index === activities.length - 1 }, activity.id))), hasMore && !maxItems && (_jsx("div", { className: "activity-feed__load-more", children: _jsx("button", { className: "btn btn--secondary btn--block", onClick: loadMore, disabled: loading, children: loading ? 'Loading...' : 'Load More Activity' }) }))] })) })] }), selectedEvent && !compact && (_jsx(ActivityEventModal, { event: selectedEvent, onClose: () => setSelectedEvent(null), workspaceId: workspaceId }))] }));
};
// Skeleton loader component
const ActivityFeedSkeleton = ({ count, compact }) => {
    return (_jsx(_Fragment, { children: Array.from({ length: count }).map((_, index) => (_jsxs("div", { className: `activity-skeleton ${compact ? 'activity-skeleton--compact' : ''}`, children: [_jsx("div", { className: "activity-skeleton__avatar" }), _jsxs("div", { className: "activity-skeleton__content", children: [_jsx("div", { className: "activity-skeleton__line activity-skeleton__line--short" }), _jsx("div", { className: "activity-skeleton__line activity-skeleton__line--long" }), !compact && _jsx("div", { className: "activity-skeleton__line activity-skeleton__line--medium" })] })] }, index))) }));
};
// Activity Event Modal placeholder
const ActivityEventModal = ({ event, onClose, workspaceId }) => {
    // Placeholder implementation
    return null;
};
