import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4.2 - Approval Statistics Component
// Comprehensive statistics and analytics for approval workflows
import React, { useState, useEffect } from 'react';
import { ChartBarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, DocumentTextIcon } from ArrowPathIcon;
from;
'@heroicons/react/24/outline';
top_reviewers: Array;
refreshInterval = 30000; // 30 seconds
{
    const [statistics, setStatistics] = useState(null);
    const [performanceMetrics, setPerformanceMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    useEffect(() => {
        fetchStatistics();
        const interval = setInterval(fetchStatistics, refreshInterval);
        return () => clearInterval(interval);
    }, [workspaceId, period, refreshInterval]);
    const fetchStatistics = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch general statistics
            const [statsResponse, performanceResponse] = await Promise.all([]);
            fetch(`/api/approval/statistics/${workspaceId}`);
        }
        finally {
        }
        fetch(`/api/approval/statistics/${workspaceId}/performance?period=${period}`);
    };
    ;
    if (!statsResponse.ok || !performanceResponse.ok) {
        throw new Error('Failed to fetch statistics');
        const stats = await statsResponse.json();
        const performance = await performanceResponse.json();
        setStatistics(stats);
        setPerformanceMetrics(performance);
        setLastUpdated(new Date());
    }
    try { }
    catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch statistics');
    }
    finally {
        setLoading(false);
    }
    ;
    const formatDuration = (hours) => {
        if (hours < 1)
            return `${Math.round(hours * 60)}m`;
    };
    if (hours < 24)
        return `${Math.round(hours)}h`;
}
return `${Math.round(hours / 24)}d`;
;
const formatPercentage = (value) => {
    return `${Math.round(value)}%`;
};
;
'in_review';
return 'bg-blue-100 text-blue-800';
'approved';
return 'bg-green-100 text-green-800';
'rejected';
return 'bg-red-100 text-red-800';
'expired';
return 'bg-gray-100 text-gray-800';
return 'bg-gray-100 text-gray-800';
;
const getUrgencyColor = (urgency) => {
    switch (urgency) {
        case 'critical': return 'bg-red-500';
        case 'high': return 'bg-orange-500';
        case 'medium': return 'bg-yellow-500';
        case 'low': return 'bg-green-500';
        default: return 'bg-gray-500';
    }
    ;
};
if (current < previous) {
    return _jsx(TrendingDownIcon, { className: "h-4 w-4 text-red-500" });
    return _jsx("div", { className: "h-4 w-4" });
}
;
const StatCard, string;
value: string | number;
icon: React.ReactNode;
color: string;
trend ?  : React.ReactNode;
subtitle ?  : string;
    > ;
({ title, value, icon, color, trend, subtitle }) => ()
    < div;
className = "bg-white rounded-lg shadow p-6" >
    _jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: `p-3 rounded-md ${color}`, children: ["}", icon] }), _jsxs("div", { className: "ml-4 flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: title }), trend] }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: value }), subtitle && ()
                        < p, " className=\"text-sm text-gray-600\">", subtitle] }), ")}"] });
div >
;
div >
;
;
const ChartCard, string;
data: Record;
type: 'bar' | 'pie';
colorMap ?  : (key) => string;
 > ;
({ title, data, type, colorMap }) => ()
    < div;
className = "bg-white rounded-lg shadow p-6" >
    _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: title });
{
    type === 'bar' ? ()
        < div : ;
    className = "space-y-3" >
        { Object, : .entries(data).map(([key, value]) => ()
                < div, key = { key }, className = "flex items-center justify-between" >
                (_jsx("span", { className: "text-sm text-gray-600 capitalize", children: key })
                    ,
                        _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-32 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${colorMap ? colorMap(key) : 'bg-blue-500'}`, style: { width: `${Math.min((value / Math.max(...Object.values(data))) * 100, 100)}%` } }) }), _jsx("span", { className: "text-sm font-medium text-gray-900 w-8", children: value })] })), div >
            ) };
    div >
    ;
    ()
        < div;
    className = "space-y-2" >
        { Object, : .entries(data).map(([key, value]) => ()
                < div, key = { key }, className = "flex items-center justify-between" >
                (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${colorMap ? colorMap(key) : 'bg-blue-500'}` }), "}", _jsx("span", { className: "text-sm text-gray-600 capitalize", children: key })] })
                    ,
                        _jsx("span", { className: "text-sm font-medium text-gray-900", children: value })), div >
            ) };
    div >
    ;
}
div >
;
;
if (loading && !statistics) {
    return;
    _jsx("div", { className: "flex items-center justify-center p-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) });
    ;
    if (error) {
        return;
        _jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx(XCircleIcon, { className: "h-5 w-5 text-red-400" }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error" }), _jsx("div", { className: "mt-2 text-sm text-red-700", children: error })] })] }) });
        ;
        return;
        _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Approval Statistics" }), _jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Overview of approval workflows and performance metrics" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Last updated: ", lastUpdated.toLocaleTimeString()] }), _jsxs("button", { onClick: fetchStatistics, className: "inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50", children: [_jsx(ArrowPathIcon, { className: "h-4 w-4 mr-2" }), "Refresh"] })] })] }), statistics && ()
                    < div, " className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">", _jsx(StatCard, { title: "Total Requests", value: statistics.total_requests, icon: _jsx(DocumentTextIcon, { className: "h-6 w-6 text-white" }), color: "bg-blue-500", subtitle: "All time" }), _jsx(StatCard, { title: "Pending Reviews", value: statistics.pending_requests, icon: _jsx(ClockIcon, { className: "h-6 w-6 text-white" }), color: "bg-yellow-500", subtitle: "Awaiting action" }), _jsx(StatCard, { title: "Approval Rate", value: formatPercentage(statistics.approval_rate), icon: _jsx(CheckCircleIcon, { className: "h-6 w-6 text-white" }), color: "bg-green-500", subtitle: "Success rate" }), _jsx(StatCard, { title: "Avg. Review Time", value: formatDuration(statistics.avg_approval_time_hours), icon: _jsx(ChartBarIcon, { className: "h-6 w-6 text-white" }), color: "bg-purple-500", subtitle: "Time to completion" })] });
    }
    { /* Performance Metrics */ }
    {
        performanceMetrics && ()
            < div;
        className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" >
            (_jsx(StatCard, { title: "First Review Time", value: formatDuration(performanceMetrics.avg_first_review_time), icon: _jsx(ClockIcon, { className: "h-6 w-6 text-white" }), color: "bg-indigo-500", subtitle: "Time to first review" })
                ,
                    _jsx(StatCard, { title: "Criteria Pass Rate", value: formatPercentage(performanceMetrics.avg_criteria_pass_rate), icon: _jsx(CheckCircleIcon, { className: "h-6 w-6 text-white" }), color: "bg-green-500", subtitle: "Quality metric" })
                        ,
                            _jsx(StatCard, { title: "Satisfaction Score", value: `${Math.round(performanceMetrics.avg_satisfaction_score * 10) / 10}/5`, icon: _jsx(DocumentTextIcon, { className: "h-6 w-6 text-white" }), color: "bg-pink-500", subtitle: "User satisfaction" })
                                ,
                                    _jsx(StatCard, { title: "Escalations", value: performanceMetrics.escalated_count, icon: _jsx(ExclamationTriangleIcon, { className: "h-6 w-6 text-white" }), color: "bg-orange-500", subtitle: "Escalated reviews" }));
        div >
        ;
    }
    { /* Charts */ }
    _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [statistics && ()
                < ChartCard, "title=\"Requests by Status\" data=", statistics.by_status, "type=\"bar\" colorMap=", (status) => {
                switch (status) {
                    case 'pending': return 'bg-yellow-500';
                    case 'in_review': return 'bg-blue-500';
                    case 'approved': return 'bg-green-500';
                    case 'rejected': return 'bg-red-500';
                    case 'expired': return 'bg-gray-500';
                    default: return 'bg-gray-500';
                }
            }, "/> )}", statistics && ()
                < ChartCard, "title=\"Requests by Urgency\" data=", statistics.by_urgency, "type=\"pie\" colorMap=", (urgency) => getUrgencyColor(urgency).replace('bg-', ''), "/> )}"] });
    { /* Top Reviewers */ }
    {
        statistics && statistics.top_reviewers.length > 0 && ()
            < div;
        className = "bg-white rounded-lg shadow p-6" >
            (_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Top Reviewers" })
                ,
                    _jsx("div", { className: "space-y-3", children: statistics.top_reviewers.slice(0, 10).map((reviewer, index) => ()
                            < div, key = { reviewer, : .reviewer_id }, className = "flex items-center justify-between" >
                            (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: _jsxs("span", { className: "text-sm font-medium text-blue-800", children: ["#", index + 1] }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: reviewer.reviewer_id }), _jsx("p", { className: "text-xs text-gray-600", children: "Active reviewer" })] })] })
                                ,
                                    _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: reviewer.count }), _jsx("span", { className: "text-xs text-gray-600", children: "reviews" })] }))) }));
    }
    div >
    ;
    div >
    ;
}
{ /* Recent Activity Summary */ }
_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: ["Performance Summary (", period, ")"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: performanceMetrics?.approved_count || 0 }), _jsx("div", { className: "text-sm text-gray-600", children: "Approved" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: performanceMetrics?.rejected_count || 0 }), _jsx("div", { className: "text-sm text-gray-600", children: "Rejected" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: performanceMetrics?.total_approvals || 0 }), _jsx("div", { className: "text-sm text-gray-600", children: "Total Reviews" })] })] })] });
{ /* Health Indicators */ }
_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "System Health" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${statistics && statistics.overdue_requests === 0 ? 'bg-green-500' : 'bg-red-500'}
` }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: "Overdue Requests" }), _jsxs("p", { className: "text-xs text-gray-600", children: [statistics?.overdue_requests || 0, " overdue"] })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${statistics && statistics.avg_approval_time_hours < 48 ? 'bg-green-500' : 'bg-yellow-500'}
` }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: "Response Time" }), _jsxs("p", { className: "text-xs text-gray-600", children: [statistics ? formatDuration(statistics.avg_approval_time_hours) : 'N/A', " average"] })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${statistics && statistics.approval_rate > 80 ? 'bg-green-500' : 'bg-yellow-500'}
` }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: "Approval Rate" }), _jsx("p", { className: "text-xs text-gray-600", children: statistics ? formatPercentage(statistics.approval_rate) : 'N/A' })] })] })] })] });
div >
;
;
;
