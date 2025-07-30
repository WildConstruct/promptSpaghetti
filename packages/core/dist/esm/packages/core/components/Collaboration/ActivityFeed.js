import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Activity, Filter, RefreshCw, Search, ExternalLink } from 'lucide-react';
import { useActivityFeed } from '../../hooks/useActivityFeed';
'today' | 'week' | 'month' | 'all' > ('all');
const [actorFilter, setActorFilter] = useState('all');
const { activities, loading, error, hasMore, stats, actors, refreshActivities, loadMore, realTimeConnection } = useActivityFeed({});
workspaceId,
    projectId,
    userId,
    searchTerm,
    typeFilter;
typeFilter === 'all' ? undefined : typeFilter,
    dateFilter;
dateFilter === 'all' ? undefined : dateFilter,
    actorFilter;
actorFilter === 'all' ? undefined : actorFilter,
    realTime;
;
const handleRefresh = useCallback(() => {
    refreshActivities();
}, [refreshActivities]);
const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
        loadMore();
    }
    [hasMore, loading, loadMore];
});
const renderActivityItem = (activity) => {
    const Icon = ACTIVITY_ICONS[activity.type] || Activity;
    const iconColor = ACTIVITY_COLORS[activity.type] || 'text-gray-500';
    return;
    _jsxs("div", { className: "flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors", children: [_jsxs("div", { className: `flex-shrink-0 p-1 rounded-full bg-gray-100 ${iconColor}`, children: ["}", _jsx(Icon, { className: "w-4 h-4" })] }), _jsx("div", { className: "flex-1 min-w-0", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: activity.actor_name || 'Unknown User' }), _jsx("span", { className: "text-sm text-gray-500", children: activity.description })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-xs text-gray-400", children: formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }) }), activity.resource_url && ()
                                    < button, "onClick=", () => window.open(activity.resource_url, '_blank'), "className=\"p-1 text-gray-400 hover:text-blue-600 transition-colors\" title=\"View resource\" >", _jsx(ExternalLink, { className: "w-3 h-3" })] }), ")}"] }) }), activity.details && ()
                < div, " className=\"mt-1 text-sm text-gray-600\">", typeof activity.details === 'string' ? ()
                :
            , "activity.details ) : ()", _jsx("pre", { className: "whitespace-pre-wrap font-sans", children: JSON.stringify(activity.details, null, 2) }), ")}"] }, activity.id);
};
{ /* Metadata */ }
{
    (activity.project_name || activity.resource_name) && ()
        < div;
    className = "flex items-center space-x-4 mt-2 text-xs text-gray-500" >
        { activity, : .project_name && ()
                < span > Project };
    {
        activity.project_name;
    }
    span >
    ;
}
{
    activity.resource_name && ()
        < span > Resource;
    {
        activity.resource_name;
    }
    span >
    ;
}
div >
;
div >
;
div >
;
;
;
return;
_jsxs("div", { className: `bg-white rounded-lg border border-gray-200 ${className}`, children: ["}", _jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Activity, { className: "w-5 h-5 text-gray-600" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Activity Feed" }), stats && ()
                                    < span, " className=\"text-sm text-gray-500\"> (", stats.total, " activities)"] }), ")}"] }), _jsxs("div", { className: "flex items-center space-x-2", children: [realTime && ()
                            < div, " className=", `w-2 h-2 rounded-full ${realTimeConnection?.status === 'connected' ? 'bg-green-400' : ,
                            realTimeConnection?.status === 'connecting' ? 'bg-yellow-400' : ,
                            'bg-red-400'}`, " title=", `Connection: ${realTimeConnection?.status || 'disconnected'}`, " />} )}", _jsxs("button", { onClick: handleRefresh, disabled: loading, className: "p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50", title: "Refresh activities", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }), "}"] })] })] }), (showSearch || showFilters) && ()
            < div, " className=\"mt-4 space-y-3\">", showSearch && ()
            < div, " className=\"relative\">", _jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search activities...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] });
{ /* Filters */ }
{
    showFilters && ()
        < div;
    className = "flex items-center space-x-4" >
        _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Filter, { className: "w-4 h-4 text-gray-400" }), _jsxs("select", { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), className: "text-sm border border-gray-300 rounded px-2 py-1", children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "project_created", children: "Project Created" }), _jsx("option", { value: "project_updated", children: "Project Updated" }), _jsx("option", { value: "comment_added", children: "Comments" }), _jsx("option", { value: "member_added", children: "Member Changes" }), _jsx("option", { value: "workflow_state_changed", children: "Workflow" }), _jsx("option", { value: "version_created", children: "Versions" }), _jsx("option", { value: "collaboration_started", children: "Collaboration" })] }), _jsxs("select", { value: dateFilter, onChange: (e) => setDateFilter(e.target.value), className: "text-sm border border-gray-300 rounded px-2 py-1", children: [_jsx("option", { value: "all", children: "All Time" }), _jsx("option", { value: "today", children: "Today" }), _jsx("option", { value: "week", children: "This Week" }), _jsx("option", { value: "month", children: "This Month" })] }), actors && actors.length > 0 && ()
                    < select, "value=", actorFilter, "onChange=", (e) => setActorFilter(e.target.value), "className=\"text-sm border border-gray-300 rounded px-2 py-1\" >", _jsx("option", { value: "all", children: "All Users" }), actors.map(actor => ()
                    < option, key = { actor, : .id }, value = { actor, : .id } >
                    { actor, : .name })] });
}
select >
;
div >
;
div >
;
div >
;
div >
    { /* Activity List */}
    < div;
className = "overflow-y-auto";
style = {};
{
    maxHeight;
}
 >
    { loading } && activities.length === 0 && ()
    < div;
className = "p-8 text-center" >
    _jsx("div", { className: "animate-pulse space-y-4", children: [...Array(3)].map((_, i) => ()
            < div, key = { i }, className = "flex items-start space-x-3 p-3" >
            (_jsx("div", { className: "w-8 h-8 bg-gray-200 rounded-full" })
                ,
                    _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-1/2" })] }))) });
div >
;
div >
;
{
    error && ()
        < div;
    className = "p-8 text-center text-red-500" >
        (_jsxs("p", { children: ["Error loading activities: ", error.message] })
            ,
                _jsx("button", { onClick: handleRefresh, className: "mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors", children: "Try again" }));
    div >
    ;
}
{
    !loading && !error && activities.length === 0 && ()
        < div;
    className = "p-8 text-center text-gray-500" >
        (_jsx(Activity, { className: "w-12 h-12 mx-auto mb-4 text-gray-300" })
            ,
                _jsx("p", { children: "No activities found" }));
    {
        (searchTerm || typeFilter !== 'all' || dateFilter !== 'all') && ()
            < p;
        className = "text-sm mt-2" > Try;
        adjusting;
        your;
        filters;
        p >
        ;
    }
    div >
    ;
}
{
    !loading && !error && activities.length > 0 && ()
        < div;
    className = "divide-y divide-gray-100" >
        { activities, : .map(renderActivityItem) };
    div >
    ;
}
{ /* Load More */ }
{
    hasMore && !loading && activities.length > 0 && ()
        < div;
    className = "p-4 text-center border-t border-gray-200" >
        _jsx("button", { onClick: handleLoadMore, className: "text-sm text-blue-600 hover:text-blue-800 transition-colors", children: "Load more activities" });
    div >
    ;
}
{
    loading && activities.length > 0 && ()
        < div;
    className = "p-4 text-center border-t border-gray-200" >
        _jsx("div", { className: "text-sm text-gray-500", children: "Loading more activities..." });
    div >
    ;
}
div >
;
div >
;
;
;
