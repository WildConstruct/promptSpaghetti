import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4.3 - Lock Status Overview Component
// Overview dashboard for lock statistics and conflicts
import React from 'react';
import { Lock, Clock, AlertTriangle, Users, Activity, TrendingUp } from 'lucide-react';
{
    const pendingConflicts = conflicts.filter(c => c.status === 'pending');
    const resolvedConflicts = conflicts.filter(c => c.status === 'resolved');
    const StatCard = ({ title, value, icon: Icon, color, subtext }), { title: string };
    value: string | number;
    icon: React.ComponentType;
    color: string;
    subtext ?  : string;
}
()
    < div;
className = "bg-white rounded-lg border border-gray-200 p-4" >
    _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: title }), _jsx("p", { className: "text-2xl font-semibold text-gray-900", children: value }), subtext && _jsx("p", { className: "text-sm text-gray-400", children: subtext })] }), _jsxs("div", { className: `p-3 rounded-full ${color}`, children: ["}", _jsx(Icon, { className: "h-6 w-6 text-white" })] })] });
div >
;
;
return;
_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(StatCard, { title: "Active Locks", value: statistics.active_locks, icon: Lock, color: "bg-blue-500", subtext: `${statistics.total_locks} total` }), _jsx(StatCard, { title: "Pending Conflicts", value: pendingConflicts.length, icon: AlertTriangle, color: "bg-red-500", subtext: `${resolvedConflicts.length} resolved` }), _jsx(StatCard, { title: "Avg Duration", value: `${Math.round(statistics.avg_lock_duration_minutes)}m`, icon: Clock, color: "bg-green-500", subtext: "per lock" }), _jsx(StatCard, { title: "Conflict Rate", value: `${Math.round(statistics.conflict_rate)}%`, icon: TrendingUp, color: "bg-orange-500", subtext: "resolution rate" })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Lock Type Distribution" }), _jsxs("div", { className: "space-y-3", children: [Object.entries(statistics.by_type).map(([type, count]) => {
                            const percentage = statistics.total_locks > 0 ? (count / statistics.total_locks) * 100 : 0;
                            const colorMap = {}, edit, state_change;
                            delete ;
                        }), ": 'bg-red-500', admin: 'bg-purple-500', custom: 'bg-gray-500', }; return;", _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${colorMap[type] || 'bg-gray-400'}` }), "}", _jsx("span", { className: "text-sm font-medium text-gray-700 capitalize", children: type.replace('_', ' ') })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-24 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${colorMap[type] || 'bg-gray-400'}`, style: { width: `${percentage}%` } }) }), _jsx("span", { className: "text-sm text-gray-600 w-12 text-right", children: count })] })] }, type), "); })}"] })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Top Lock Holders" }), _jsx("div", { className: "space-y-3", children: Object.entries(statistics.by_user)
                        .sort(([a], [b]) => b - a)
                        .slice(0, 5)
                        .map(([userId, count]) => ()
                        < div, key = { userId }, className = "flex items-center justify-between" >
                        (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Users, { className: "h-4 w-4 text-gray-400" }), _jsxs("span", { className: "text-sm font-medium text-gray-700", children: [userId.substring(0, 8), "..."] })] })
                            ,
                                _jsxs("span", { className: "text-sm text-gray-600", children: [count, " locks"] }))) }), "))}"] })] });
{ /* Most Contended Resources */ }
_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Most Contended Resources" }), _jsx("div", { className: "space-y-3", children: statistics.most_contended_resources.slice(0, 5).map((resource) => ()
                < div, key = { resource, : .resource_id }, className = "flex items-center justify-between" >
                (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Activity, { className: "h-4 w-4 text-gray-400" }), _jsxs("span", { className: "text-sm font-medium text-gray-700", children: [resource.resource_id.substring(0, 8), "..."] })] })
                    ,
                        _jsxs("div", { className: "text-right", children: [_jsxs("span", { className: "text-sm text-gray-600", children: [resource.conflict_count, " conflicts"] }), _jsx("br", {}), _jsxs("span", { className: "text-xs text-gray-500", children: [Math.round(resource.avg_wait_time), "m avg wait"] })] }))) }), "))}"] });
div >
    { /* Recent Conflicts */};
{
    pendingConflicts.length > 0 && ()
        < div;
    className = "bg-white rounded-lg border border-gray-200 p-6" >
        (_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: ["Pending Conflicts (", pendingConflicts.length, ")"] })
            ,
                _jsxs("div", { className: "space-y-3", children: [pendingConflicts.slice(0, 10).map((conflict) => ()
                            < div, key = { conflict, : .id }, className = "flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100", onClick = {}()), " => onConflictClick(conflict)} >", _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-500" }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm font-medium text-gray-900", children: ["Resource: ", conflict.resource_id.substring(0, 8), "..."] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Requesting: ", conflict.requesting_user_id.substring(0, 8), "..."] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-gray-600 capitalize", children: conflict.conflict_type }), _jsx("p", { className: "text-xs text-gray-500", children: new Date(conflict.created_at).toLocaleDateString() })] })] }));
}
div >
;
div >
;
{ /* No Data State */ }
{
    statistics.total_locks === 0 && ()
        < div;
    className = "bg-white rounded-lg border border-gray-200 p-8" >
        _jsxs("div", { className: "text-center", children: [_jsx(Lock, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Active Locks" }), _jsx("p", { className: "text-gray-500", children: "There are currently no active locks in this workspace." })] });
    div >
    ;
}
div >
;
;
;
