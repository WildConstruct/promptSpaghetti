import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4.6 - Scheduled Execution Manager Component
// UI component for managing scheduled workflow executions
import { useState, useEffect } from 'react';
import { ClockIcon, PlayIcon, PauseIcon, StopIcon, PlusIcon, TrashIcon, EyeIcon, CogIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
export const ScheduledExecutionManager = ({
    workspaceId,
    resourceId,
    onClose
});
{
    const [activeTab, setActiveTab] = useState('schedules');
    const [schedules, setSchedules] = useState([]);
    const [executionLogs, setExecutionLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateSchedule, setShowCreateSchedule] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [expandedLogs, setExpandedLogs] = useState(new Set());
    // Load schedules and execution logs
    useEffect(() => {
        loadSchedules();
        loadExecutionLogs();
    }, [workspaceId]);
    const loadSchedules = async () => {
        setLoading(true);
        try {
            // Mock API call - replace with actual API
            const mockSchedules = [
                {
                    id: '1',
                    workspace_id: workspaceId,
                    resource_id: resourceId || 'resource-1',
                    schedule_name: 'Daily Status Check',
                    schedule_type: 'cron',
                    schedule_expression: '0 9 * * *', // 9 AM daily,
                    action_type: 'state_transition',
                    action_config: {},
                    to_state_id: 'review-state',
                    comment: 'Automated daily review trigger',
                },
                enabled, true,
                next_run_at, new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow 9 AM
                last_run_at, new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday 9 AM
                run_count, 15,
                max_runs, undefined,
                retry_count, 0,
                max_retries, 3,
                created_by, 'user1',
                created_at, new Date('2024-01-01'),
                updated_at, new Date('2024-01-20')
            ];
        }
        finally {
            id: '2',
                workspace_id;
            workspaceId,
                resource_id;
            resourceId || 'resource-2',
                schedule_name;
            'Weekly Report Generation',
                schedule_type;
            'cron',
                schedule_expression;
            '0 0 * * 0', // Sunday midnight,
                action_type;
            'custom',
                action_config;
            {
                action: 'generate_report',
                    report_type;
                'weekly_summary',
                    email_recipients;
                ['admin@example.com'],
                ;
            }
            enabled: true,
                next_run_at;
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next Sunday
                last_run_at;
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last Sunday
                run_count;
            8,
                max_runs;
            undefined,
                retry_count;
            1,
                max_retries;
            3,
                created_by;
            'user2',
                created_at;
            new Date('2024-01-01'),
                updated_at;
            new Date('2024-01-15');
        }
        {
            id: '3',
                workspace_id;
            workspaceId,
                resource_id;
            resourceId || 'resource-3',
                schedule_name;
            'One-time Migration',
                schedule_type;
            'once',
                schedule_expression;
            '2024-01-25T15:00:00Z',
                action_type;
            'custom',
                action_config;
            {
                action: 'migrate_data',
                    source;
                'old_system',
                    target;
                'new_system',
                ;
            }
            enabled: false,
                next_run_at;
            new Date('2024-01-25T15:00:00Z'),
                last_run_at;
            undefined,
                run_count;
            0,
                max_runs;
            1,
                retry_count;
            0,
                max_retries;
            3,
                created_by;
            'user3',
                created_at;
            new Date('2024-01-20'),
                updated_at;
            new Date('2024-01-20');
            ;
            setSchedules(mockSchedules);
        }
        try { }
        catch (error) {
            setError('Failed to load schedules');
        }
        finally {
            setLoading(false);
        }
        ;
        const loadExecutionLogs = async () => {
            try {
                // Mock API call - replace with actual API
                const mockLogs = [
                    {
                        id: '1',
                        schedule_id: '1',
                        execution_id: 'exec-1',
                        status: 'completed',
                        started_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
                        completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5000),
                        result_data: {},
                        state_changed: true,
                        new_state: 'review',
                        affected_resources: 1,
                    },
                    execution_time_ms, 5000,
                    retry_attempt, 0
                ];
            }
            finally {
                id: '2',
                    schedule_id;
                '2',
                    execution_id;
                'exec-2',
                    status;
                'failed',
                    started_at;
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    completed_at;
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30000),
                    result_data;
                { }
                error_message: 'Failed to generate report: Database connection timeout',
                    execution_time_ms;
                30000,
                    retry_attempt;
                1,
                    next_retry_at;
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000);
            }
            {
                id: '3',
                    schedule_id;
                '1',
                    execution_id;
                'exec-3',
                    status;
                'running',
                    started_at;
                new Date(Date.now() - 2 * 60 * 1000),
                    result_data;
                { }
                retry_attempt: 0;
                ;
                setExecutionLogs(mockLogs);
            }
            try { }
            catch (error) {
                setError('Failed to load execution logs');
            }
            ;
            const handleCreateSchedule = async (scheduleData) => {
                try {
                    // Mock API call - replace with actual API
                    const newSchedule = {
                        id: Date.now().toString(),
                        workspace_id: workspaceId,
                        resource_id: resourceId || 'default',
                        schedule_name: scheduleData.schedule_name || 'New Schedule',
                        schedule_type: scheduleData.schedule_type || 'cron',
                        schedule_expression: scheduleData.schedule_expression || '0 0 * * *',
                        action_type: scheduleData.action_type || 'state_transition',
                        action_config: scheduleData.action_config || {},
                        enabled: scheduleData.enabled !== false,
                        run_count: 0,
                        max_runs: scheduleData.max_runs,
                        retry_count: 0,
                        max_retries: scheduleData.max_retries || 3,
                        created_by: 'current_user',
                        created_at: new Date(),
                        updated_at: new Date()
                    };
                    setSchedules(prev => [...prev, newSchedule]);
                    setShowCreateSchedule(false);
                }
                catch (error) {
                    setError('Failed to create schedule');
                }
                ;
                const handleDeleteSchedule = async (scheduleId) => {
                    try {
                        // Mock API call - replace with actual API
                        setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
                        setShowDeleteConfirm(null);
                    }
                    catch (error) {
                        setError('Failed to delete schedule');
                    }
                    ;
                    const handleToggleSchedule = async (scheduleId) => {
                        try {
                            // Mock API call - replace with actual API
                            setSchedules(prev => prev.map(schedule => ), schedule.id === scheduleId
                                ? { ...schedule, enabled: !schedule.enabled }
                                : schedule);
                            ;
                        }
                        catch (error) {
                            setError('Failed to toggle schedule');
                        }
                        ;
                        const handleRunNow = async (scheduleId) => {
                            try {
                                // Mock API call - replace with actual API
                                const newLog = {
                                    id: Date.now().toString(),
                                    schedule_id: scheduleId,
                                    execution_id: `exec-${Date.now()}` };
                            }
                            finally { }
                            status: 'running',
                                started_at;
                            new Date(),
                                result_data;
                            { }
                            retry_attempt: 0;
                        };
                        setExecutionLogs(prev => [newLog, ...prev]);
                        // Simulate completion after 3 seconds
                        setTimeout(() => {
                            setExecutionLogs(prev => prev.map(log => ), log.id === newLog.id
                                ? {
                                    ...log,
                                    status: 'completed',
                                    completed_at: new Date(),
                                    execution_time_ms: 3000,
                                    result_data: { manual_execution: true }
                                }
                                : log);
                        });
                    };
                    3000;
                    ;
                };
                try { }
                catch (error) {
                    setError('Failed to run schedule');
                }
                ;
                const formatCronExpression = (expression) => {
                    // Basic cron expression formatting
                    const parts = expression.split(' ');
                    if (parts.length === 5) {
                        const [minute, hour, day, month, dayOfWeek] = parts;
                        if (minute === '0' && hour === '0' && day === '*' && month === '*' && dayOfWeek === '*') {
                            return 'Daily at midnight';
                            if (minute === '0' && hour === '9' && day === '*' && month === '*' && dayOfWeek === '*') {
                                return 'Daily at 9:00 AM';
                                if (minute === '0' && hour === '0' && day === '*' && month === '*' && dayOfWeek === '0') {
                                    return 'Weekly on Sunday at midnight';
                                    return expression;
                                }
                                ;
                                const formatScheduleExpression = (schedule) => {
                                    switch (schedule.schedule_type) {
                                        case 'cron':
                                            return formatCronExpression(schedule.schedule_expression);
                                        case 'interval':
                                            return `Every ${schedule.schedule_expression}`;
                                    }
                                };
                            }
                        }
                    }
                };
            };
        };
    };
    'once';
    return `Once at ${new Date(schedule.schedule_expression).toLocaleString()}`;
}
return schedule.schedule_expression;
;
const getStatusColor = (status) => {
    switch (status) {
        case 'running': return 'bg-blue-100 text-blue-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'failed': return 'bg-red-100 text-red-800';
        case 'cancelled': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
    ;
    const ___getStatusIcon = (status) => {
        switch (status) {
            case 'running': return _jsx(PlayIcon, { className: "h-4 w-4 text-blue-600" });
            case 'completed': return _jsx(CheckCircleIcon, { className: "h-4 w-4 text-green-600" });
            case 'failed': return _jsx(XCircleIcon, { className: "h-4 w-4 text-red-600" });
            case 'cancelled': return _jsx(StopIcon, { className: "h-4 w-4 text-gray-600" });
            default: return _jsx(ClockIcon, { className: "h-4 w-4 text-gray-600" });
        }
        ;
        const toggleLogExpansion = (logId) => {
            setExpandedLogs(prev => { });
            const newSet = new Set(prev);
            if (newSet.has(logId)) {
                newSet.delete(logId);
            }
            else {
                newSet.add(logId);
                return newSet;
            }
            ;
        };
        const renderSchedulesTab = () => ();
        ;
        _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Scheduled Executions" }), _jsxs("button", { onClick: () => setShowCreateSchedule(true), className: "flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors", children: [_jsx(PlusIcon, { className: "h-4 w-4" }), _jsx("span", { children: "Create Schedule" })] })] }), _jsx("div", { className: "space-y-3", children: schedules.map(schedule => ()
                        < div, key = { schedule, : .id }, className = "bg-white border border-gray-200 rounded-lg p-4" >
                        _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("h4", { className: "font-medium text-gray-900", children: schedule.schedule_name }), _jsx("span", { className: `px-2 py-1 text-xs rounded-full ${schedule.enabled
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800',
                                                    }`, children: schedule.enabled ? 'Enabled' : 'Disabled' }), _jsx("span", { className: "px-2 py-1 text-xs rounded bg-blue-100 text-blue-800", children: schedule.schedule_type.toUpperCase() })] }), _jsxs("div", { className: "mt-2 flex items-center space-x-4 text-sm text-gray-600", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(ClockIcon, { className: "h-4 w-4" }), _jsx("span", { children: formatScheduleExpression(schedule) })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(CogIcon, { className: "h-4 w-4" }), _jsx("span", { children: schedule.action_type.replace('_', ' ') })] })] }), _jsxs("div", { className: "mt-2 flex items-center space-x-6 text-sm text-gray-500", children: [_jsxs("span", { children: ["Runs: ", schedule.run_count, schedule.max_runs ? `/${schedule.max_runs}` : ''] }), "}", _jsxs("span", { children: ["Next: ", schedule.next_run_at?.toLocaleString() || 'N/A'] }), _jsxs("span", { children: ["Last: ", schedule.last_run_at?.toLocaleString() || 'Never'] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => handleRunNow(schedule.id), className: "p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors", title: "Run now", children: _jsx(PlayIcon, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => handleToggleSchedule(schedule.id), className: `p-2 rounded-md transition-colors ${schedule.enabled
                                                ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50' : ,
                                         }), ": 'text-green-600 hover:text-green-800 hover:bg-green-50', }`} title=", schedule.enabled ? 'Disable' : 'Enable', ">", schedule.enabled ? _jsx(PauseIcon, { className: "h-4 w-4" }) : _jsx(PlayIcon, { className: "h-4 w-4" })] }), _jsx("button", { onClick: () => setShowDeleteConfirm(schedule.id), className: "p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors", title: "Delete", children: _jsx(TrashIcon, { className: "h-4 w-4" }) })] })) })] });
    };
};
div >
    { schedules, : .length === 0 && ()
            < div, className = "text-center py-8 text-gray-500" >
            (_jsx(ClockIcon, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" })
                ,
                    _jsx("p", { children: "No scheduled executions found. Create your first schedule to get started." })),
        div } >
;
div >
;
;
const renderExecutionLogsTab = () => ();
;
_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Execution Logs" }), _jsx("div", { className: "space-y-3", children: executionLogs.map(log => ()
                < div, key = { log, : .id }, className = "bg-white border border-gray-200 rounded-lg p-4" >
                _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("span", { className: `px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(log.status)}`, children: ["}", log.status.toUpperCase()] }), _jsxs("span", { className: "text-sm text-gray-600", children: ["Schedule: ", schedules.find(s => s.id === log.schedule_id)?.schedule_name || 'Unknown'] }), _jsxs("span", { className: "text-sm text-gray-500", children: ["Execution ID: ", log.execution_id] })] }), _jsxs("div", { className: "mt-2 flex items-center space-x-4 text-sm text-gray-600", children: [_jsxs("span", { children: ["Started: ", log.started_at.toLocaleString()] }), log.completed_at && ()
                                            < span > Completed, ": ", log.completed_at.toLocaleString()] }), ")}", log.execution_time_ms && ()
                                    < span > Duration, ": ", (log.execution_time_ms / 1000).toFixed(2), "s"] }), ")}", log.retry_attempt > 0 && ()
                            < span > Retry, ": ", log.retry_attempt] })) }), log.error_message && ()
            < div, " className=\"mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800\">", log.error_message] });
div >
    _jsx("div", { className: "flex items-center space-x-2", children: _jsxs("button", { onClick: () => toggleLogExpansion(log.id), className: "p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors", children: [expandedLogs.has(log.id) ? ()
                    < ChevronDownIcon : , " className=\"h-4 w-4\" /> ) : ()", _jsx(ChevronRightIcon, { className: "h-4 w-4" }), ")}"] }) });
div >
    { expandedLogs, : .has(log.id) && ()
            < div, className = "mt-4 border-t border-gray-200 pt-4" >
            (_jsx("h5", { className: "font-medium text-sm mb-2", children: "Execution Details" })
                ,
                    _jsxs("pre", { className: "bg-gray-100 p-3 rounded text-xs overflow-x-auto", children: [JSON.stringify({}), "execution_id: log.execution_id, schedule_id: log.schedule_id, status: log.status, started_at: log.started_at, completed_at: log.completed_at, execution_time_ms: log.execution_time_ms, retry_attempt: log.retry_attempt, result_data: log.result_data, error_message: log.error_message, }, null, 2)}"] })),
        div } >
;
div >
;
div >
    { executionLogs, : .length === 0 && ()
            < div, className = "text-center py-8 text-gray-500" >
            (_jsx(ClockIcon, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" })
                ,
                    _jsx("p", { children: "No execution logs found." })),
        div } >
;
div >
;
;
const renderStatisticsTab = () => {
    const totalExecutions = executionLogs.length;
    const completedExecutions = executionLogs.filter(log => log.status === 'completed').length;
    const ___failedExecutions = executionLogs.filter(log => log.status === 'failed').length;
    const successRate = totalExecutions > 0 ? ((completedExecutions / totalExecutions) * 100).toFixed(1) : '0';
    const avgExecutionTime = executionLogs;
};
filter(log => log.execution_time_ms)
    .reduce((sum, log) => sum + (log.execution_time_ms || 0), 0) /
    executionLogs.filter(log => log.execution_time_ms).length || 0;
return;
_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Execution Statistics" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(ClockIcon, { className: "h-8 w-8 text-blue-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500", children: "Total Schedules" }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: schedules.length })] })] }) }), _jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(PlayIcon, { className: "h-8 w-8 text-green-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500", children: "Total Executions" }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: totalExecutions })] })] }) }), _jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(CheckCircleIcon, { className: "h-8 w-8 text-green-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500", children: "Success Rate" }), _jsxs("div", { className: "text-2xl font-bold text-gray-900", children: [successRate, "%"] })] })] }) }), _jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(ClockIcon, { className: "h-8 w-8 text-purple-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500", children: "Avg Duration" }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: avgExecutionTime ? `${(avgExecutionTime / 1000).toFixed(1)}s` : 'N/A' })] })] }) })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium mb-4", children: "Schedule Status" }), _jsx("div", { className: "space-y-2", children: schedules.map(schedule => ()
                        < div, key = { schedule, : .id }, className = "flex items-center justify-between py-2 border-b border-gray-100" >
                        (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "font-medium", children: schedule.schedule_name }), _jsx("span", { className: `px-2 py-1 text-xs rounded-full ${schedule.enabled
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800',
                                    }`, children: schedule.enabled ? 'Enabled' : 'Disabled' })] })
                            ,
                                _jsxs("div", { className: "text-sm text-gray-500", children: [schedule.run_count, " runs"] }))) }), "))}"] })] });
div >
;
;
;
const tabs = [];
{
    id: 'schedules', label;
    'Schedules', icon;
    ClockIcon;
}
{
    id: 'logs', label;
    'Execution Logs', icon;
    EyeIcon;
}
{
    id: 'statistics', label;
    'Statistics', icon;
    CogIcon;
}
;
return;
_jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200", children: _jsxs("div", { className: "border-b border-gray-200 p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(ClockIcon, { className: "h-6 w-6 text-gray-600" }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Scheduled Executions" }), _jsx("p", { className: "text-sm text-gray-500", children: "Manage automated workflow executions and schedules" })] })] }), onClose && ()
                        < button, "onClick=", onClose, "className=\"text-gray-400 hover:text-gray-600 transition-colors\" >", _jsx(XCircleIcon, { className: "h-5 w-5" })] }), ")}"] }) });
{ /* Tab navigation */ }
_jsxs("div", { className: "border-b border-gray-200", children: [_jsxs("nav", { className: "flex space-x-8 px-4", children: [tabs.map(tab => ()
                    < button, key = { tab, : .id }, onClick = {}()), " => setActiveTab(tab.id as TabType)} className=", `flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                }`, ">", _jsx(tab.icon, { className: "h-4 w-4" }), _jsx("span", { children: tab.label })] }), "))}"] });
div >
    { /* Tab content */}
    < div;
className = "p-4" >
    { error } && ()
    < div;
className = "mb-4 bg-red-50 border border-red-200 rounded-lg p-4" >
    _jsxs("div", { className: "flex items-center", children: [_jsx(ExclamationTriangleIcon, { className: "h-5 w-5 text-red-600 mr-2" }), _jsx("span", { className: "text-red-800", children: error })] });
div >
;
{
    loading ? ()
        < div : ;
    className = "flex items-center justify-center h-64" >
        _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" });
    div >
    ;
    ();
    {
        activeTab === 'schedules' && renderSchedulesTab();
    }
    {
        activeTab === 'logs' && renderExecutionLogsTab();
    }
    {
        activeTab === 'statistics' && renderStatisticsTab();
    }
     >
    ;
}
div >
    { /* Create Schedule Modal */};
{
    showCreateSchedule && ()
        < CreateScheduleModal;
    onClose = {}();
    setShowCreateSchedule(false);
}
onSubmit = { handleCreateSchedule }
    /  >
;
{ /* Delete Confirmation Modal */ }
{
    showDeleteConfirm && ()
        < DeleteScheduleModal;
    onClose = {}();
    setShowDeleteConfirm(null);
}
onConfirm = {}();
handleDeleteSchedule(showDeleteConfirm);
/>;
div >
;
;
;
// Sub-components for modals
const CreateScheduleModal;
() => void ;
onSubmit: (data) => void ;
 > ;
({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({});
    schedule_name: '',
        schedule_type;
    'cron',
        schedule_expression;
    '0 9 * * *', // 9 AM daily
        action_type;
    'state_transition',
        action_config;
    { }
    enabled: true,
        max_runs;
    undefined,
        max_retries;
    3;
};
;
const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
};
return;
_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Create Schedule" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Schedule Name" }), _jsx("input", { type: "text", value: formData.schedule_name, onChange: (e) => setFormData(prev => ({ ...prev, schedule_name: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Schedule Type" }), _jsxs("select", { value: formData.schedule_type, onChange: (e) => setFormData(prev => ({ ...prev, schedule_type: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "cron", children: "Cron Expression" }), _jsx("option", { value: "interval", children: "Interval" }), _jsx("option", { value: "once", children: "One Time" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Schedule Expression" }), _jsx("input", { type: "text", value: formData.schedule_expression, onChange: (e) => setFormData(prev => ({ ...prev, schedule_expression: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", placeholder: formData.schedule_type === 'cron' ? '0 9 * * *' :
                                    formData.schedule_type === 'interval' ? '1 hour' :
                                        '2024-01-25T15:00:00Z', required: true }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [formData.schedule_type === 'cron' && 'Cron format: minute hour day month dayOfWeek', formData.schedule_type === 'interval' && 'Interval format: "5 minutes", "1 hour", "2 days"', formData.schedule_type === 'once' && 'ISO 8601 datetime format'] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Action Type" }), _jsxs("select", { value: formData.action_type, onChange: (e) => setFormData(prev => ({ ...prev, action_type: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "state_transition", children: "State Transition" }), _jsx("option", { value: "approval_request", children: "Approval Request" }), _jsx("option", { value: "custom", children: "Custom Action" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Max Runs (optional)" }), _jsx("input", { type: "number", value: formData.max_runs || '', onChange: (e) => setFormData(prev => ({ ...prev, max_runs: e.target.value ? parseInt(e.target.value) : undefined })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", min: "1" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Max Retries" }), _jsx("input", { type: "number", value: formData.max_retries, onChange: (e) => setFormData(prev => ({ ...prev, max_retries: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", min: "0", max: "10", required: true })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "enabled", checked: formData.enabled, onChange: (e) => setFormData(prev => ({ ...prev, enabled: e.target.checked })), className: "mr-2" }), _jsx("label", { htmlFor: "enabled", className: "text-sm font-medium text-gray-700", children: "Enable schedule immediately" })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors", children: "Create Schedule" })] })] })] }) });
;
;
const DeleteScheduleModal;
() => void ;
onConfirm: () => void ;
 > ;
({ onClose, onConfirm }) => {
    return;
    _jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Delete Schedule" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Are you sure you want to delete this schedule? This action cannot be undone and will stop all future executions." }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", children: "Cancel" }), _jsx("button", { onClick: onConfirm, className: "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors", children: "Delete" })] })] }) });
    ;
};
export default ScheduledExecutionManager;
