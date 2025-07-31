import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Schedule Management Dashboard - Epic 17
 *
 * Unified interface for managing both Feature Toggle Scheduling and Content Scheduling
 * with comprehensive scheduling operations, analytics, and monitoring.
 *
 * Task: E17-1753114396819-3556E5 - Develop schedule management
 * Epic: 17 - Backstage Admin Controls
 */
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Calendar, Clock, PlayCircle, PauseCircle, StopCircle, Edit, FileText, Plus, Search, Download, RefreshCw, CheckCircle, XCircle, BarChart3, Bell, Activity, Zap, Target, Trash2 } from 'lucide-react';
 > ;
// Upcoming schedules
upcomingSchedules: Array;
const STATUS_CONFIG = {};
pending: {
    color: 'text-yellow-600 bg-yellow-100', icon;
    Clock;
}
active: {
    color: 'text-blue-600 bg-blue-100', icon;
    PlayCircle;
}
completed: {
    color: 'text-green-600 bg-green-100', icon;
    CheckCircle;
}
failed: {
    color: 'text-red-600 bg-red-100', icon;
    XCircle;
}
cancelled: {
    color: 'text-gray-600 bg-gray-100', icon;
    StopCircle;
}
;
const TYPE_CONFIG = {
    feature_toggle: { color: 'text-blue-600 bg-blue-100', icon: Zap, label: 'Feature Toggle' },
    content: { color: 'text-green-600 bg-green-100', icon: FileText, label: 'Content' }
};
export const ScheduleManagementDashboard = ({
    className = '',
    userId,
    userRole
});
{
    const [activeTab, setActiveTab] = useState('overview');
    const [schedules, setSchedules] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    // Mock data - in real implementation, this would fetch from APIs
    const mockSchedules = [
        {
            id: 'schedule-1',
            name: 'Weekly Maintenance Window',
            type: 'feature_toggle',
            status: 'active',
            toggleId: 'maintenance-mode',
            action: 'enable',
            nextExecution: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            lastExecution: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            createdBy: 'admin',
        },
        {
            id: 'schedule-2',
            name: 'Blog Post Publication',
            type: 'content',
            status: 'pending',
            contentId: 'post-123',
            contentType: 'blog_post',
            operation: 'publish',
            nextExecution: new Date(Date.now() + 6 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            createdBy: 'editor',
        },
        {
            id: 'schedule-3',
            name: 'Feature Rollout - 50%',
            type: 'feature_toggle',
            status: 'completed',
            toggleId: 'new-dashboard',
            action: 'update_percentage',
            lastExecution: new Date(Date.now() - 4 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            createdBy: 'devops'
        }
    ];
    const mockAnalytics = {
        totalSchedules: 45,
        activeSchedules: 12,
        completedToday: 8,
        failedToday: 2,
        upcomingIn24h: 5,
        successRate: 94.2,
        averageExecutionTime: 1.8,
        featureToggleSchedules: 28,
        contentSchedules: 17,
        recentExecutions: [,
            {
                id: 'exec-1',
                name: 'Feature Rollout - 50%',
                type: 'Feature Toggle',
                status: 'success',
                executedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
                duration: 1.2,
            },
            {
                id: 'exec-2',
                name: 'Newsletter Send',
                type: 'Content',
                status: 'success',
                executedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
                duration: 2.5,
            },
            {
                id: 'exec-3',
                name: 'Database Maintenance',
                type: 'Feature Toggle',
                status: 'failed',
                executedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
                duration: 0.3
            }],
        upcomingSchedules: [,
            {
                id: 'upcoming-1',
                name: 'Blog Post Publication',
                type: 'Content',
                nextExecution: new Date(Date.now() + 6 * 60 * 60 * 1000),
            },
            {
                id: 'upcoming-2',
                name: 'Weekly Maintenance',
                type: 'Feature Toggle',
                nextExecution: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            }]
    };
    useEffect(() => {
        // Simulate loading schedules and analytics
        const loadData = async () => {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSchedules(mockSchedules);
            setAnalytics(mockAnalytics);
            setLoading(false);
        };
        loadData();
    }, []);
    // Filter schedules based on search and filters
    const filteredSchedules = useMemo(() => {
        return schedules.filter(schedule => { });
        const matchesSearch = searchQuery === '' || ;
        schedule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            schedule.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
        const matchesType = typeFilter === 'all' || schedule.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });
}
[schedules, searchQuery, statusFilter, typeFilter];
;
const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {});
    month: 'short',
        day;
    'numeric',
        hour;
    '2-digit',
        minute;
    '2-digit',
    ;
}, format;
(date);
;
const formatDuration = (seconds) => {
    return `${seconds.toFixed(1)}s`;
};
;
const handleExecuteSchedule = (scheduleId) => {
    // Implementation for manual schedule execution
    console.log(`Executing schedule: ${scheduleId}`);
};
;
const handlePauseSchedule = (scheduleId) => {
    // Implementation for pausing schedule
    console.log(`Pausing schedule: ${scheduleId}`);
};
;
const handleDeleteSchedule = (scheduleId) => {
    // Implementation for deleting schedule
    console.log(`Deleting schedule: ${scheduleId}`);
};
;
if (loading) {
    return;
    _jsxs("div", { className: `p-6 ${className}`, children: ["}", _jsxs("div", { className: "flex items-center justify-center h-64", children: [_jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-blue-600" }), _jsx("span", { className: "ml-2 text-lg", children: "Loading schedule management..." })] })] });
    ;
    return;
    _jsxs("div", { className: `p-6 space-y-6 ${className}`, children: ["}", _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Schedule Management" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Unified dashboard for Feature Toggle and Content Scheduling" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] }), _jsxs(Button, { children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Schedule"] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "schedules", children: "Schedules" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [analytics && (), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Schedules" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: analytics.totalSchedules })] }), _jsx(Calendar, { className: "h-8 w-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Active Schedules" }), _jsx("p", { className: "text-3xl font-bold text-green-600", children: analytics.activeSchedules })] }), _jsx(Activity, { className: "h-8 w-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Success Rate" }), _jsxs("p", { className: "text-3xl font-bold text-green-600", children: [analytics.successRate, "%"] })] }), _jsx(Target, { className: "h-8 w-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Upcoming (24h)" }), _jsx("p", { className: "text-3xl font-bold text-orange-600", children: analytics.upcomingIn24h })] }), _jsx(Bell, { className: "h-8 w-8 text-orange-600" })] }) }) })] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-5 w-5" }), "Recent Executions"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-3", children: analytics.recentExecutions.map((execution) => ()
                                                        < div, key = { execution, : .id }, className = "flex items-center justify-between p-3 border rounded-lg" >
                                                        (_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: execution.name }), _jsx("p", { className: "text-sm text-gray-600", children: execution.type })] })
                                                            ,
                                                                _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: execution.status === 'success' ? 'success' : 'destructive', children: execution.status }), _jsx("span", { className: "text-sm text-gray-500", children: formatDuration(execution.duration) })] }))) }), "))}"] })] }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-5 w-5" }), "Upcoming Schedules"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-3", children: analytics.upcomingSchedules.map((schedule) => ()
                                                    < div, key = { schedule, : .id }, className = "flex items-center justify-between p-3 border rounded-lg" >
                                                    (_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: schedule.name }), _jsx("p", { className: "text-sm text-gray-600", children: schedule.type })] })
                                                        ,
                                                            _jsx("div", { className: "text-sm text-gray-600", children: formatDate(schedule.nextExecution) }))) }), "))}"] })] })] })] })] });
     >
    ;
}
TabsContent >
    { /* Schedules Tab */}
    < TabsContent;
value = "schedules";
className = "space-y-6" >
    { /* Filters */}
    < div;
className = "flex flex-col sm:flex-row gap-4" >
    (_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "h-4 w-4 absolute left-3 top-3 text-gray-400" }), _jsx(Input, { placeholder: "Search schedules...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10" })] }) })
        ,
            _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "failed", children: "Failed" }), _jsx("option", { value: "cancelled", children: "Cancelled" })] })
                ,
                    _jsxs(Select, { value: typeFilter, onValueChange: setTypeFilter, children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "feature_toggle", children: "Feature Toggle" }), _jsx("option", { value: "content", children: "Content" })] }));
div >
    { /* Schedule List */}
    < Card >
    _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "divide-y divide-gray-200", children: [filteredSchedules.map((schedule) => {
                    const StatusIcon = STATUS_CONFIG[schedule.status].icon;
                    const TypeIcon = TYPE_CONFIG[schedule.type].icon;
                    return;
                    _jsx("div", { className: "p-6 hover:bg-gray-50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center space-x-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(TypeIcon, { className: "h-5 w-5 text-gray-600" }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium", children: schedule.name }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Created by ", schedule.createdBy, " on ", formatDate(schedule.createdAt)] })] })] }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm font-medium text-gray-900", children: [schedule.nextExecution ?
                                                            `Next: ${formatDate(schedule.nextExecution)}` : , "schedule.lastExecution ? `Last: $", formatDate(schedule.lastExecution), "` :} 'No execution'"] }), _jsxs("div", { className: "flex items-center space-x-2 mt-1", children: [_jsx(Badge, { className: TYPE_CONFIG[schedule.type].color, children: TYPE_CONFIG[schedule.type].label }), _jsxs(Badge, { className: STATUS_CONFIG[schedule.status].color, children: [_jsx(StatusIcon, { className: "h-3 w-3 mr-1" }), schedule.status] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => handleExecuteSchedule(schedule.id), children: _jsx(PlayCircle, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => handlePauseSchedule(schedule.id), children: _jsx(PauseCircle, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "outline", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "destructive", onClick: () => handleDeleteSchedule(schedule.id), children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] })] }) }, schedule.id);
                }), "; })}"] }) });
Card >
;
TabsContent >
    { /* Analytics Tab */}
    < TabsContent;
value = "analytics";
className = "space-y-6" >
    { analytics } && ();
{ /* Performance Metrics */ }
_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Success Rate" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold text-green-600", children: [analytics.successRate, "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Based on last 30 days" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Avg Execution Time" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold text-blue-600", children: [analytics.averageExecutionTime, "s"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Average across all schedules" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Type Distribution" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Feature Toggle" }), _jsx("span", { className: "font-medium", children: analytics.featureToggleSchedules })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Content" }), _jsx("span", { className: "font-medium", children: analytics.contentSchedules })] })] }) })] })] });
{ /* Execution Timeline Placeholder */ }
_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-5 w-5" }), "Execution Timeline"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg", children: _jsx("p", { className: "text-gray-600", children: "Execution timeline chart would be rendered here" }) }) })] });
 >
;
TabsContent >
    { /* Settings Tab */}
    < TabsContent;
value = "settings";
className = "space-y-6" >
    _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Schedule Management Settings" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Default Settings" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Default Timezone" }), _jsxs(Select, { defaultValue: "UTC", children: [_jsx("option", { value: "UTC", children: "UTC" }), _jsx("option", { value: "America/New_York", children: "Eastern Time" }), _jsx("option", { value: "America/Los_Angeles", children: "Pacific Time" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Execution Timeout (minutes)" }), _jsx(Input, { type: "number", defaultValue: "30" })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Notification Settings" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", defaultChecked: true }), _jsx("span", { children: "Email notifications for failed executions" })] }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", defaultChecked: true }), _jsx("span", { children: "Slack notifications for critical failures" })] }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox" }), _jsx("span", { children: "Daily summary reports" })] })] })] })] })] });
TabsContent >
;
Tabs >
;
div >
;
;
;
export default ScheduleManagementDashboard;
