import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Enhanced Activity Timeline Component - Epic 17
 *
 * Comprehensive user activity timeline interface with advanced filtering,
 * real-time updates, collaboration tracking, and analytics.
 */
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Clock, User, Users, Activity as ActivityIcon, TrendingUp, Search, Calendar, Globe, Zap, AlertTriangle, CheckCircle, XCircle, GitBranch, FileText, Settings, BarChart3 } from 'lucide-react';
import { activityTimeline } from '../../services/ActivityTimeline';
/**
* Activity type configurations for UI styling
*/
const ACTIVITY_TYPE_CONFIG = {
    user_interaction: {
        icon: User,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        badgeColor: 'bg-blue-100 text-blue-800',
    }
};
system_event: {
    icon: Settings,
        color;
    'text-gray-600 bg-gray-50 border-gray-200',
        badgeColor;
    'bg-gray-100 text-gray-800',
    ;
}
graph_operation: {
    icon: GitBranch,
        color;
    'text-green-600 bg-green-50 border-green-200',
        badgeColor;
    'bg-green-100 text-green-800',
    ;
}
file_operation: {
    icon: FileText,
        color;
    'text-purple-600 bg-purple-50 border-purple-200',
        badgeColor;
    'bg-purple-100 text-purple-800',
    ;
}
collaboration: {
    icon: Users,
        color;
    'text-orange-600 bg-orange-50 border-orange-200',
        badgeColor;
    'bg-orange-100 text-orange-800',
    ;
}
performance: {
    icon: Zap,
        color;
    'text-yellow-600 bg-yellow-50 border-yellow-200',
        badgeColor;
    'bg-yellow-100 text-yellow-800',
    ;
}
error: {
    icon: AlertTriangle,
        color;
    'text-red-600 bg-red-50 border-red-200',
        badgeColor;
    'bg-red-100 text-red-800',
    ;
}
authentication: {
    icon: User,
        color;
    'text-indigo-600 bg-indigo-50 border-indigo-200',
        badgeColor;
    'bg-indigo-100 text-indigo-800',
    ;
}
admin: {
    icon: Settings,
        color;
    'text-gray-700 bg-gray-100 border-gray-300',
        badgeColor;
    'bg-gray-200 text-gray-900',
    ;
}
integration: {
    icon: Globe,
        color;
    'text-teal-600 bg-teal-50 border-teal-200',
        badgeColor;
    'bg-teal-100 text-teal-800',
    ;
}
;
/**
 * Impact level configurations
 */
const IMPACT_CONFIG = {
    critical: { color: 'text-red-700', badgeColor: 'bg-red-100 text-red-800', priority: 5 },
    high: { color: 'text-orange-700', badgeColor: 'bg-orange-100 text-orange-800', priority: 4 },
    medium: { color: 'text-yellow-700', badgeColor: 'bg-yellow-100 text-yellow-800', priority: 3 },
    low: { color: 'text-blue-700', badgeColor: 'bg-blue-100 text-blue-800', priority: 2 },
    none: { color: 'text-gray-700', badgeColor: 'bg-gray-100 text-gray-800', priority: 1 }
};
export const ActivityTimeline = ({
    userId,
    workspaceId,
    projectId,
    compact = false,
    showStats = true,
    showFilters = true,
    maxItems = 50,
    className
});
{
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedTab, setSelectedTab] = useState('timeline');
    const [filter, setFilter] = useState({});
    userIds: userId ? [userId] : undefined,
        workspaceIds;
    workspaceId ? [workspaceId] : undefined,
        projectIds;
    projectId ? [projectId] : undefined,
        limit;
    maxItems,
    ;
}
;
const [searchQuery, setSearchQuery] = useState('');
const [selectedActivity, setSelectedActivity] = useState(null);
const [dateRange, setDateRange] = useState('week');
// Load activities and stats
useEffect(() => {
    const loadData = () => {
        // Update date range filter
        const now = new Date();
        let startDate;
        switch (dateRange) {
            case 'today':
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate = new Date();
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date();
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'all':
            default:
                startDate = new Date(0);
                break;
                const updatedFilter = {
                    ...filter,
                    dateRange: dateRange !== 'all' ? { start: startDate, end: now } : undefined,
                    searchQuery: searchQuery || undefined
                };
                setActivities(activityTimeline.getActivities(updatedFilter));
                if (showStats) {
                    setStats(activityTimeline.getActivityStats(updatedFilter));
                }
                ;
                loadData();
                // Subscribe to real-time updates
                const listenerId = `activity-timeline-${Math.random().toString(36).substr(2, 9)}`;
        }
        activityTimeline.subscribe(listenerId, (_event) => {
            loadData(); // Refresh data when new activities are tracked
        });
        return () => {
            activityTimeline.unsubscribe(listenerId);
        };
    }, [filter, searchQuery, dateRange, maxItems, showStats];
});
// Group activities by date for timeline view
const groupedActivities = useMemo(() => {
    const groups = {};
    activities.forEach(activity => { });
    const dateKey = activity.timestamp.toDateString();
    if (!groups[dateKey]) {
        groups[dateKey] = [];
        groups[dateKey].push(activity);
    }
});
return groups;
[activities];
;
// Filter update helpers
const updateFilter = (updates) => {
    setFilter(prev => ({ ...prev, ...updates }));
};
const resetFilters = () => {
    setFilter({});
    userIds: userId ? [userId] : undefined,
        workspaceIds;
    workspaceId ? [workspaceId] : undefined,
        projectIds;
    projectId ? [projectId] : undefined,
        limit;
    maxItems,
    ;
};
setSearchQuery('');
setDateRange('week');
;
return;
_jsxs("div", { className: `activity-timeline space-y-6 ${className}`, children: ["}", _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: userId ? 'User Activity Timeline' : 'Team Activity Timeline' }), _jsxs("p", { className: "text-gray-600", children: [activities.length, " activities ", dateRange !== 'all' && `in the last ${dateRange}`] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: resetFilters, children: "Clear Filters" }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(BarChart3, { className: "w-4 h-4 mr-2" }), "Export"] })] })] }), showStats && stats && !compact && ()
            < div, " className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4\">", _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(ActivityIcon, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Events" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: stats.totalEvents })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(Users, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Active Users" }), _jsx("p", { className: "text-2xl font-bold text-green-900", children: stats.uniqueUsers })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-yellow-100 rounded-lg", children: _jsx(Clock, { className: "w-5 h-5 text-yellow-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Avg Session" }), _jsxs("p", { className: "text-2xl font-bold text-yellow-900", children: [Math.round(stats.averageSessionDuration / 1000 / 60), "m"] })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(TrendingUp, { className: "w-5 h-5 text-purple-600" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Peak Hour" }), _jsxs("p", { className: "text-2xl font-bold text-purple-900", children: [stats.peakActivity.hour, ":00"] })] })] }) }) })] });
{ /* Filters */ }
{
    showFilters && !compact && ()
        < Card >
        (_jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex flex-wrap gap-4 items-center", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Search, { className: "w-4 h-4 text-gray-400" }), _jsx(Input, { placeholder: "Search activities...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-64" })] }), _jsxs(Select, { value: dateRange, onValueChange: (value) => setDateRange(value), children: [_jsx("option", { value: "today", children: "Today" }), _jsx("option", { value: "week", children: "Last Week" }), _jsx("option", { value: "month", children: "Last Month" }), _jsx("option", { value: "all", children: "All Time" })] }), _jsx(Select, { value: filter.types?.[0] || 'all', onValueChange: (value) => updateFilter({}), "types:value": true }), " === 'all' ? undefined : [value as ActivityType] ; } >", _jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "user_interaction", children: "User Interactions" }), _jsx("option", { value: "graph_operation", children: "Graph Operations" }), _jsx("option", { value: "collaboration", children: "Collaboration" }), _jsx("option", { value: "file_operation", children: "File Operations" }), _jsx("option", { value: "performance", children: "Performance" }), _jsx("option", { value: "error", children: "Errors" })] }), _jsx(Select, { value: filter.impactLevels?.[0] || 'all', onValueChange: (value) => updateFilter({}), "impactLevels:value": true }), " === 'all' ? undefined : [value as ActivityImpact] ; } >", _jsx("option", { value: "all", children: "All Impact Levels" }), _jsx("option", { value: "critical", children: "Critical" }), _jsx("option", { value: "high", children: "High" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "low", children: "Low" })] })
            ,
                _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: filter.successOnly ? 'default' : 'outline', size: "sm", onClick: () => updateFilter({}), "successOnly:filter": true }), ".successOnly ? undefined : true, errorsOnly: undefined ; })} >", _jsx(CheckCircle, { className: "w-4 h-4 mr-1" }), "Success"] })
                    ,
                        _jsx(Button, { variant: filter.errorsOnly ? 'default' : 'outline', size: "sm", onClick: () => updateFilter({}), "errorsOnly:filter": true, errorsOnly: true, "undefined:true": true, "successOnly:undefined": true }));
}
    >
        _jsx(XCircle, { className: "w-4 h-4 mr-1" });
Errors;
Button >
;
div >
;
div >
;
CardContent >
;
Card >
;
{ /* Main Content */ }
_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(ActivityIcon, { className: "w-5 h-5 mr-2" }), "Activity Timeline"] }) }), _jsxs(CardContent, { children: [_jsxs(Tabs, { value: selectedTab, onValueChange: setSelectedTab, children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "timeline", children: "Timeline" }), _jsx(TabsTrigger, { value: "list", children: "List View" }), showStats && _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsx(TabsContent, { value: "timeline", className: "mt-6", children: _jsx(TimelineView, { groupedActivities: groupedActivities, onSelectActivity: setSelectedActivity, compact: compact }) }), _jsx(TabsContent, { value: "list", className: "mt-6", children: _jsx(ListView, { activities: activities, onSelectActivity: setSelectedActivity, compact: compact }) }), showStats && ()
                            < TabsContent, " value=\"analytics\" className=\"mt-6\">", _jsx(AnalyticsView, { stats: stats, activities: activities })] }), ")}"] })] });
Card >
    { /* Activity Detail Modal */};
{
    selectedActivity && ()
        < ActivityDetailModal;
    activity = { selectedActivity };
    onClose = {}();
    setSelectedActivity(null);
}
/>;
div >
;
;
;
{
    const dates = Object.keys(groupedActivities).sort((a, b) => );
    new Date(b).getTime() - new Date(a).getTime();
    ;
    if (dates.length === 0) {
        return;
        _jsxs("div", { className: "text-center py-8", children: [_jsx(ActivityIcon, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No activities found" }), _jsx("p", { className: "text-gray-500", children: "Try adjusting your filters to see more results." })] });
        ;
        return;
        _jsx("div", { className: "space-y-8", children: dates.map(dateKey => ()
                < div, key = { dateKey } >
                (_jsxs("div", { className: "flex items-center mb-4", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-400 mr-2" }), _jsxs("h3", { className: "text-sm font-medium text-gray-900", children: [new Date(dateKey).toLocaleDateString('en-US', {}), "weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', })}"] }), _jsx("div", { className: "flex-1 border-t border-gray-200 ml-4" }), _jsxs(Badge, { variant: "outline", size: "sm", children: [groupedActivities[dateKey].length, " events"] })] })
                    ,
                        _jsxs("div", { className: "space-y-3", children: [groupedActivities[dateKey].map(activity => ()
                                    < ActivityCard, key = { activity, : .id }, activity = { activity }, onClick = {}()), " => onSelectActivity(activity)} compact=", compact, "showTimestamp /> ))}"] }))) });
    }
    div >
    ;
    ;
}
;
{
    if (activities.length === 0) {
        return;
        _jsxs("div", { className: "text-center py-8", children: [_jsx(ActivityIcon, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No activities found" }), _jsx("p", { className: "text-gray-500", children: "Try adjusting your filters to see more results." })] });
        ;
        return;
        _jsxs("div", { className: "space-y-2", children: [activities.map(activity => ()
                    < ActivityCard, key = { activity, : .id }, activity = { activity }, onClick = {}()), " => onSelectActivity(activity)} compact=", compact, "showDate /> ))}"] });
        ;
    }
    ;
    /**
     * Analytics View Component
     */
}
const AnalyticsView = ({ stats, _activities }) => {
    if (!stats)
        return null;
    return;
    _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Activity Types" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-3", children: Object.entries(stats.byType)
                                        .sort(([a], [b]) => b - a)
                                        .map(([type, count]) => ()
                                        < div, key = { type }, className = "flex items-center justify-between" >
                                        (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${ACTIVITY_TYPE_CONFIG[type]?.color.split(' ')[1] || 'bg-gray-500'}` }), "}", _jsx("span", { className: "text-sm font-medium capitalize", children: type.replace('_', ' ') })] })
                                            ,
                                                _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: count }), _jsx("div", { className: "w-16 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${ACTIVITY_TYPE_CONFIG[type]?.color.split(' ')[1] || 'bg-gray-500'}`, style: { width: `${(count / stats.totalEvents) * 100}%` } }) })] }))) }), "))}"] })] }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Most Active Users" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-3", children: stats.mostActiveUsers.slice(0, 5).map(user => ()
                                    < div, key = { user, : .userId }, className = "flex items-center justify-between" >
                                    (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(User, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-sm font-medium", children: user.displayName })] })
                                        ,
                                            _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm font-medium", children: [user.eventCount, " events"] }), _jsx("div", { className: "text-xs text-gray-500", children: new Date(user.lastActivity).toLocaleDateString() })] }))) }), "))}"] })] })] });
};
div >
    { /* Performance Metrics */}
    < div;
className = "grid grid-cols-1 md:grid-cols-3 gap-4" >
    (_jsx(Card, { children: _jsxs(CardContent, { className: "p-4 text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-green-900", children: [Math.round(stats.averageExecutionTime), "ms"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Avg Execution Time" })] }) })
        ,
            _jsx(Card, { children: _jsxs(CardContent, { className: "p-4 text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-red-900", children: [stats.errorRate.toFixed(1), "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Error Rate" })] }) })
                ,
                    _jsx(Card, { children: _jsxs(CardContent, { className: "p-4 text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-900", children: [stats.cacheHitRate.toFixed(1), "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Cache Hit Rate" })] }) }));
div >
;
div >
;
;
;
{
    const typeConfig = ACTIVITY_TYPE_CONFIG[activity.type];
    const impactConfig = IMPACT_CONFIG[activity.impact];
    const TypeIcon = typeConfig?.icon || ActivityIcon;
    return;
    _jsxs("div", { className: `border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer ${, }
  compact ? 'bg-white' : typeConfig?.color || 'bg-gray-50',
}`, onClick: onClick, children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsxs("div", { className: "flex-shrink-0 mt-0.5", children: [_jsx(TypeIcon, { className: `w-4 h-4 ${typeConfig?.color.split(' ')[0] || 'text-gray-600'}` }), "}"] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx("h4", { className: "text-sm font-medium truncate", children: activity.title }), !compact && ()
                                        <  >
                                        _jsx(Badge, { className: typeConfig?.badgeColor, size: "sm", children: activity.type.replace('_', ' ') }), activity.impact !== 'none' && ()
                                        < Badge, " className=", impactConfig.badgeColor, " size=\"sm\">", activity.impact] }), ")}", !activity.success && ()
                                < Badge, " className=\"bg-red-100 text-red-800\" size=\"sm\"> error"] }), ")}"] }), ")}"] });
    {
        activity.description && ()
            < p;
        className = "text-sm text-gray-600 line-clamp-2 mb-1" >
            { activity, : .description };
        p >
        ;
    }
    _jsxs("div", { className: "flex items-center space-x-3 text-xs text-gray-500", children: [_jsx("span", { children: activity.userDisplayName || activity.userId }), _jsx("span", { children: activity.source }), (showTimestamp || showDate) && (()), showDate
                ? activity.timestamp.toLocaleDateString()
                : activity.timestamp.toLocaleTimeString()] });
}
{
    activity.duration && ()
        < span > { activity, : .duration };
    ms;
    span >
    ;
}
{
    activity.collaborators && activity.collaborators.length > 0 && ()
        < div;
    className = "flex items-center space-x-1" >
        (_jsx(Users, { className: "w-3 h-3" })
            ,
                _jsx("span", { children: activity.collaborators.length }));
    div >
    ;
}
div >
;
div >
;
div >
;
div >
;
;
;
{
    const typeConfig = ACTIVITY_TYPE_CONFIG[activity.type];
    const TypeIcon = typeConfig?.icon || ActivityIcon;
    return;
    _jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto", children: [_jsxs("div", { className: "p-6", children: [_jsx("div", { className: "flex items-start justify-between mb-6", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(TypeIcon, { className: `w-6 h-6 ${typeConfig?.color.split(' ')[0] || 'text-gray-600'}` }), "}", _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: activity.title }), _jsxs("div", { className: "flex items-center space-x-2 mt-1", children: [_jsx(Badge, { className: typeConfig?.badgeColor, children: activity.type.replace('_', ' ') }), activity.impact !== 'none' && ()
                                                        < Badge, " className=", IMPACT_CONFIG[activity.impact].badgeColor, ">", activity.impact] }), ")}", _jsx(Badge, { className: activity.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', children: activity.success ? 'success' : 'error' })] })] }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: onClose, children: "\u2715" })] }), _jsx("div", { className: "space-y-6", children: activity.description && ()
                        < div >
                        (_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Description" })
                            ,
                                _jsx("p", { className: "text-gray-700", children: activity.description })) }), ")}", _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Basic Info" }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "User:" }), " ", activity.userDisplayName || activity.userId] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Action:" }), " ", activity.action] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Source:" }), " ", activity.source] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Category:" }), " ", activity.category] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Timing" }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Timestamp:" }), " ", activity.timestamp.toLocaleString()] }), activity.duration && ()
                                            < div > _jsx("span", { className: "font-medium", children: "Duration:" }), " ", activity.duration, "ms"] }), ")}", activity.sessionId && ()
                                    < div > _jsx("span", { className: "font-medium", children: "Session:" }), " ", activity.sessionId.slice(-8)] }), ")}"] })] }) });
    {
        activity.resource && ()
            < div >
            (_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Resource" })
                ,
                    _jsx("p", { className: "text-sm text-gray-600", children: activity.resource }));
        {
            activity.resourceId && ()
                < p;
            className = "text-xs text-gray-500 mt-1" > ID;
            {
                activity.resourceId;
            }
            p >
            ;
        }
        div >
        ;
    }
    {
        activity.collaborators && activity.collaborators.length > 0 && ()
            < div >
            (_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Collaborators" })
                ,
                    _jsx("div", { className: "flex flex-wrap gap-1", children: activity.collaborators.map(collaborator => ()
                            < Badge, key = { collaborator }, variant = "outline", size = "sm" >
                            { collaborator }) }));
    }
    div >
    ;
    div >
    ;
}
{
    activity.tags.length > 0 && ()
        < div >
        (_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Tags" })
            ,
                _jsx("div", { className: "flex flex-wrap gap-1", children: activity.tags.map(tag => ()
                        < Badge, key = { tag }, variant = "outline", size = "sm" >
                        { tag }) }));
}
div >
;
div >
;
{
    Object.keys(activity.details).length > 0 && ()
        < div >
        (_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Details" })
            ,
                _jsx("pre", { className: "text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40", children: JSON.stringify(activity.details, null, 2) }));
    div >
    ;
}
div >
;
div >
;
div >
;
div >
;
;
;
export default ActivityTimeline;
