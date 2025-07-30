import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Recurring Schedule Manager - Epic 17
 *
 * Advanced recurring schedule management with pattern builder, conflict detection,
 * and schedule optimization features.
 *
 * Task: E17-1753114396816-7C558C - Implement recurring schedule options
 * Epic: 17 - Backstage Admin Controls
 */
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Clock, Repeat, Settings, Plus, Edit, Trash2, Copy, Play, Pause, AlertTriangle, CheckCircle, XCircle, RefreshCw, Filter, Search, TrendingUp, Target, Activity, BarChart3 } from 'lucide-react';
import { RecurrenceEditor } from '../../components/admin/scheduling/RecurrenceEditor';
// Import scheduling models
import { ScheduleType, RecurrenceType, ScheduleAction, ScheduleStatus } from '../../../server/src/database/scheduling-models';
const RECURRENCE_PRESETS = [];
{
    id: 'daily-business',
        name;
    'Daily (Business Days)',
        description;
    'Monday to Friday',
        pattern;
    {
        type: 'weekly',
            interval;
        1,
            daysOfWeek;
        [1, 2, 3, 4, 5],
        ;
    }
    {
        id: 'weekly-maintenance',
            name;
        'Weekly Maintenance',
            description;
        'Sunday at 2 AM',
            pattern;
        {
            type: 'weekly',
                interval;
            1,
                daysOfWeek;
            [0],
            ;
        }
        {
            id: 'monthly-first',
                name;
            'Monthly (First Day)',
                description;
            '1st of every month',
                pattern;
            {
                type: 'monthly',
                    interval;
                1,
                    daysOfMonth;
                [1],
                ;
            }
            {
                id: 'quarterly',
                    name;
                'Quarterly',
                    description;
                'Every 3 months',
                    pattern;
                {
                    type: 'monthly',
                        interval;
                    3,
                    ;
                }
                {
                    id: 'bi-weekly',
                        name;
                    'Bi-weekly',
                        description;
                    'Every 2 weeks',
                        pattern;
                    {
                        type: 'weekly',
                            interval;
                        2;
                        ;
                        const ACTION_CONFIG = {
                            enable: { color: 'text-green-600 bg-green-100', icon: Play, label: 'Enable' },
                            disable: { color: 'text-red-600 bg-red-100', icon: Pause, label: 'Disable' },
                            update_value: { color: 'text-blue-600 bg-blue-100', icon: Settings, label: 'Update' },
                            activate_rollout: { color: 'text-purple-600 bg-purple-100', icon: TrendingUp, label: 'Rollout' },
                            modify_percentage: { color: 'text-orange-600 bg-orange-100', icon: Target, label: 'Modify %' }
                        };
                        const STATUS_CONFIG = {
                            pending: { color: 'text-yellow-600 bg-yellow-100', icon: Clock },
                            active: { color: 'text-green-600 bg-green-100', icon: Activity },
                            completed: { color: 'text-blue-600 bg-blue-100', icon: CheckCircle },
                            cancelled: { color: 'text-gray-600 bg-gray-100', icon: XCircle },
                            failed: { color: 'text-red-600 bg-red-100', icon: AlertTriangle },
                            paused: { color: 'text-yellow-600 bg-yellow-100', icon: Pause }
                        };
                        export const RecurringScheduleManager = ({
                            className = '',
                            userId,
                            userRole
                        });
                        {
                            const [activeTab, setActiveTab] = useState('schedules');
                            const [schedules, setSchedules] = useState([]);
                            const [conflicts, setConflicts] = useState([]);
                            const [loading, setLoading] = useState(true);
                            const [searchQuery, setSearchQuery] = useState('');
                            const [statusFilter, setStatusFilter] = useState('all');
                            const [actionFilter, setActionFilter] = useState('all');
                            const [_____showCreateModal, setShowCreateModal] = useState(false);
                            // Mock data - in real implementation, this would fetch from APIs
                            const mockSchedules = [
                                {
                                    id: 'schedule-1',
                                    toggleId: 'maintenance-mode',
                                    name: 'Weekly Maintenance Window',
                                    description: 'Enable maintenance mode every Sunday at 2 AM',
                                    type: ScheduleType.RECURRING,
                                    action: ScheduleAction.ENABLE,
                                    startTime: new Date('2024-01-07T02:00:00.000Z'),
                                    endTime: new Date('2024-01-07T06:00:00.000Z'),
                                    timezone: 'America/New_York',
                                    recurrence: {
                                        type: RecurrenceType.WEEKLY,
                                        interval: 1,
                                        daysOfWeek: [0],
                                    },
                                    actionConfig: {},
                                    status: ScheduleStatus.ACTIVE,
                                    enabled: true,
                                    createdBy: 'admin',
                                    createdAt: new Date('2024-01-01T00:00:00.000Z'),
                                    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
                                    nextExecution: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                                    lastExecution: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                                    executionCount: 12,
                                    failureCount: 1,
                                    priority: 1,
                                    conflictResolution: 'override',
                                    nextOccurrences: [,
                                        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                                        new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
                                        new Date(Date.now() + 16 * 24 * 60 * 60 * 1000)
                                    ],
                                    conflictCount: 0,
                                    performanceMetrics: {
                                        successRate: 91.7,
                                        averageExecutionTime: 1.8,
                                        lastFailureReason: 'Network timeout',
                                    }
                                },
                                {
                                    id: 'schedule-2',
                                    toggleId: 'feature-rollout',
                                    name: 'Daily Feature Rollout',
                                    description: 'Gradually increase feature rollout every day at 9 AM',
                                    type: ScheduleType.RECURRING,
                                    action: ScheduleAction.MODIFY_PERCENTAGE,
                                    startTime: new Date('2024-01-15T09:00:00.000Z'),
                                    timezone: 'UTC',
                                    recurrence: {
                                        type: RecurrenceType.DAILY,
                                        interval: 1,
                                        endDate: new Date('2024-02-15T00:00:00.000Z'),
                                    },
                                    actionConfig: {
                                        rolloutPercentage: 10,
                                    },
                                    status: ScheduleStatus.ACTIVE,
                                    enabled: true,
                                    createdBy: 'devops',
                                    createdAt: new Date('2024-01-10T00:00:00.000Z'),
                                    updatedAt: new Date('2024-01-10T00:00:00.000Z'),
                                    nextExecution: new Date(Date.now() + 14 * 60 * 60 * 1000),
                                    lastExecution: new Date(Date.now() - 10 * 60 * 60 * 1000),
                                    executionCount: 25,
                                    failureCount: 2,
                                    priority: 2,
                                    conflictResolution: 'skip',
                                    nextOccurrences: [,
                                        new Date(Date.now() + 14 * 60 * 60 * 1000),
                                        new Date(Date.now() + 38 * 60 * 60 * 1000),
                                        new Date(Date.now() + 62 * 60 * 60 * 1000)
                                    ],
                                    conflictCount: 1,
                                    performanceMetrics: {
                                        successRate: 92.0,
                                        averageExecutionTime: 0.8,
                                    }
                                },
                                {
                                    id: 'schedule-3',
                                    toggleId: 'database-backup',
                                    name: 'Monthly Database Backup',
                                    description: 'Enable backup mode on the first of every month',
                                    type: ScheduleType.RECURRING,
                                    action: ScheduleAction.ENABLE,
                                    startTime: new Date('2024-02-01T01:00:00.000Z'),
                                    endTime: new Date('2024-02-01T03:00:00.000Z'),
                                    timezone: 'UTC',
                                    recurrence: {
                                        type: RecurrenceType.MONTHLY,
                                        interval: 1,
                                        daysOfMonth: [1],
                                    },
                                    actionConfig: {},
                                    status: ScheduleStatus.PENDING,
                                    enabled: true,
                                    createdBy: 'admin',
                                    createdAt: new Date('2024-01-20T00:00:00.000Z'),
                                    updatedAt: new Date('2024-01-20T00:00:00.000Z'),
                                    nextExecution: new Date('2024-02-01T01:00:00.000Z'),
                                    executionCount: 0,
                                    failureCount: 0,
                                    priority: 3,
                                    conflictResolution: 'skip',
                                    nextOccurrences: [,
                                        new Date('2024-02-01T01:00:00.000Z'),
                                        new Date('2024-03-01T01:00:00.000Z'),
                                        new Date('2024-04-01T01:00:00.000Z')
                                    ],
                                    conflictCount: 0,
                                    performanceMetrics: {
                                        successRate: 0,
                                        averageExecutionTime: 0
                                    }
                                }
                            ];
                            const mockConflicts = [
                                {
                                    id: 'conflict-1',
                                    scheduleIds: ['schedule-2', 'schedule-4'],
                                    type: 'time_overlap',
                                    severity: 'medium',
                                    description: 'Feature rollout and maintenance window overlap on Sundays at 9 AM',
                                    suggestedResolution: 'Reschedule feature rollout to 10 AM on Sundays'
                                }
                            ];
                            useEffect(() => {
                                const loadData = async () => {
                                    setLoading(true);
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    setSchedules(mockSchedules);
                                    setConflicts(mockConflicts);
                                    setLoading(false);
                                };
                                loadData();
                            }, []);
                            // Filter schedules
                            const filteredSchedules = useMemo(() => {
                                return schedules.filter(schedule => { });
                                const matchesSearch = searchQuery === '' || ;
                                schedule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    schedule.toggleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    schedule.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
                                const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
                                const matchesAction = actionFilter === 'all' || schedule.action === actionFilter;
                                return matchesSearch && matchesStatus && matchesAction;
                            });
                        }
                        [schedules, searchQuery, statusFilter, actionFilter];
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
                    }
                    ;
                    const getRecurrenceDescription = (recurrence) => {
                        const { type, interval, daysOfWeek, daysOfMonth, _____monthsOfYear } = recurrence;
                        switch (type) {
                            case 'daily':
                                return interval === 1 ? 'Every day' : `Every ${interval} days`;
                        }
                    };
                    'weekly';
                    if (daysOfWeek && daysOfWeek.length > 0) {
                        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        const days = daysOfWeek.map(d => dayNames[d]).join(', ');
                        return interval === 1 ? `Weekly on ${days}` : `Every ${interval} weeks on ${days}`;
                    }
                    return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
                }
                'monthly';
                if (daysOfMonth && daysOfMonth.length > 0) {
                    const days = daysOfMonth.join(', ');
                    return interval === 1 ? `Monthly on day ${days}` : `Every ${interval} months on day ${days}`;
                }
                return interval === 1 ? 'Monthly' : `Every ${interval} months`;
            }
            'yearly';
            return interval === 1 ? 'Yearly' : `Every ${interval} years`;
        }
        'custom';
        return recurrence.cronExpression || 'Custom pattern';
        return 'Unknown pattern';
    }
    ;
    const handlePauseSchedule = (scheduleId) => {
        setSchedules(prev => prev.map(s => ), s.id === scheduleId ? { ...s, status: ScheduleStatus.PAUSED } : s);
        ;
    };
    const handleResumeSchedule = (scheduleId) => {
        setSchedules(prev => prev.map(s => ), s.id === scheduleId ? { ...s, status: ScheduleStatus.ACTIVE } : s);
        ;
    };
    const handleDeleteSchedule = (scheduleId) => {
        setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    };
    const handleDuplicateSchedule = (scheduleId) => {
        const originalSchedule = schedules.find(s => s.id === scheduleId);
        if (originalSchedule) {
            const duplicatedSchedule = {
                ...originalSchedule,
                id: `schedule-${Date.now()}`
            };
        }
        name: `${originalSchedule.name} (Copy)`;
    };
}
status: ScheduleStatus.PENDING,
    executionCount;
0,
    failureCount;
0,
    createdAt;
new Date(),
    updatedAt;
new Date(),
    nextExecution;
undefined,
    lastExecution;
undefined,
    performanceMetrics;
{
    successRate: 0,
        averageExecutionTime;
    0,
    ;
}
;
setSchedules(prev => [...prev, duplicatedSchedule]);
;
if (loading) {
    return;
    _jsxs("div", { className: `p-6 ${className}`, children: ["}", _jsxs("div", { className: "flex items-center justify-center h-64", children: [_jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-blue-600" }), _jsx("span", { className: "ml-2 text-lg", children: "Loading recurring schedules..." })] })] });
    ;
    return;
    _jsxs("div", { className: `p-6 space-y-6 ${className}`, children: ["}", _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Recurring Schedules" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage recurring schedules with advanced pattern configuration" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(Filter, { className: "h-4 w-4 mr-2" }), "Templates"] }), _jsxs(Button, { onClick: () => setShowCreateModal(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create Recurring Schedule"] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "schedules", children: "Schedules" }), _jsx(TabsTrigger, { value: "patterns", children: "Pattern Builder" }), _jsxs(TabsTrigger, { value: "conflicts", children: ["Conflicts (", conflicts.length, ")"] }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsxs(TabsContent, { value: "schedules", className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "h-4 w-4 absolute left-3 top-3 text-gray-400" }), _jsx(Input, { placeholder: "Search recurring schedules...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10" })] }) }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "paused", children: "Paused" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "cancelled", children: "Cancelled" })] }), _jsxs(Select, { value: actionFilter, onValueChange: setActionFilter, children: [_jsx("option", { value: "all", children: "All Actions" }), _jsx("option", { value: "enable", children: "Enable" }), _jsx("option", { value: "disable", children: "Disable" }), _jsx("option", { value: "update_value", children: "Update Value" }), _jsx("option", { value: "modify_percentage", children: "Modify Percentage" }), _jsx("option", { value: "activate_rollout", children: "Activate Rollout" })] })] }), _jsx("div", { className: "space-y-4", children: filteredSchedules.map((schedule) => {
                                    const ActionIcon = ACTION_CONFIG[schedule.action].icon;
                                    const StatusIcon = STATUS_CONFIG[schedule.status].icon;
                                    return;
                                    _jsxs(Card, { children: [_jsx(CardContent, { className: "p-6", children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "p-2 rounded-lg bg-blue-100", children: _jsx(Repeat, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h3", { className: "text-lg font-semibold", children: schedule.name }), schedule.conflictCount > 0 && ()
                                                                                < Badge, " variant=\"destructive\" className=\"text-xs\">", schedule.conflictCount, " conflicts"] }), ")}"] }), _jsx("p", { className: "text-gray-600 mb-3", children: schedule.description }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Toggle:" }), _jsx("p", { className: "text-gray-900", children: schedule.toggleId })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Pattern:" }), _jsx("p", { className: "text-gray-900", children: schedule.recurrence ? getRecurrenceDescription(schedule.recurrence) : 'No pattern' })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Next Run:" }), _jsx("p", { className: "text-gray-900", children: schedule.nextExecution ? formatDate(schedule.nextExecution) : 'Not scheduled' })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-700", children: "Success Rate:" }), _jsxs("p", { className: "text-gray-900", children: [schedule.performanceMetrics.successRate.toFixed(1), "%"] })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("span", { className: "font-medium text-gray-700 text-sm", children: "Next 3 occurrences:" }), _jsx("div", { className: "flex flex-wrap gap-2 mt-1", children: schedule.nextOccurrences.slice(0, 3).map((date, index) => ()
                                                                            < Badge, key = { index }, variant = "outline", className = "text-xs" >
                                                                            {}) }), "))}"] })] }) }) }), _jsxs("div", { className: "flex items-start space-x-4", children: [_jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsxs(Badge, { className: ACTION_CONFIG[schedule.action].color, children: [_jsx(ActionIcon, { className: "h-3 w-3 mr-1" }), ACTION_CONFIG[schedule.action].label] }), _jsxs(Badge, { className: STATUS_CONFIG[schedule.status].color, children: [_jsx(StatusIcon, { className: "h-3 w-3 mr-1" }), schedule.status] })] }), _jsxs("p", { className: "text-sm text-gray-600", children: [schedule.executionCount, " executions, ", schedule.failureCount, " failed"] })] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [schedule.status === ScheduleStatus.ACTIVE ? ()
                                                                < Button
                                                                :
                                                            , "size=\"sm\" variant=\"outline\" onClick=", () => handlePauseSchedule(schedule.id), ">", _jsx(Pause, { className: "h-4 w-4" })] }), ") : ()", _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleResumeSchedule(schedule.id), children: _jsx(Play, { className: "h-4 w-4" }) }), ")}", _jsx(Button, { size: "sm", variant: "outline", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleDuplicateSchedule(schedule.id), children: _jsx(Copy, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "destructive", onClick: () => handleDeleteSchedule(schedule.id), children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }, schedule.id);
                                }) })] })] }), "); })}"] });
    TabsContent >
        { /* Pattern Builder Tab */}
        < TabsContent;
    value = "patterns";
    className = "space-y-6" >
        _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Pattern Presets" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-3", children: RECURRENCE_PRESETS.map((preset) => ()
                                    < div, key = { preset, : .id }, className = "p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" >
                                    _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: preset.name }), _jsx("p", { className: "text-sm text-gray-600", children: preset.description })] }), _jsx(Button, { size: "sm", variant: "outline", children: "Use" })] })) }), "))}"] })] }) });
    { /* Custom Pattern Builder */ }
    _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Custom Pattern Builder" }) }), _jsx(CardContent, { children: _jsx(RecurrenceEditor, { value: {
                        type: 'weekly',
                        interval: 1,
                    }, onChange: (recurrence) => {
                        console.log('Recurrence updated:', recurrence);
                    } }) })] });
    div >
    ;
    TabsContent >
        { /* Conflicts Tab */}
        < TabsContent;
    value = "conflicts";
    className = "space-y-6" >
        _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-orange-600" }), "Schedule Conflicts"] }) }), _jsxs(CardContent, { children: [conflicts.length === 0 ? ()
                            < div : , " className=\"text-center py-8\">", _jsx(CheckCircle, { className: "h-12 w-12 text-green-600 mx-auto mb-4" }), _jsx("p", { className: "text-lg font-medium text-gray-900", children: "No conflicts detected" }), _jsx("p", { className: "text-gray-600", children: "All recurring schedules are properly configured" })] }), ") : ()", _jsx("div", { className: "space-y-4", children: conflicts.map((conflict) => ()
                        < div, key = { conflict, : .id }, className = "p-4 border rounded-lg" >
                        _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsxs(Badge, { variant: conflict.severity === 'critical' ? 'destructive' : 'default', className: "text-xs", children: [conflict.severity, " priority"] }), _jsx(Badge, { variant: "outline", className: "text-xs", children: conflict.type.replace('_', ' ') })] }), _jsx("p", { className: "font-medium text-gray-900 mb-1", children: conflict.description }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: conflict.suggestedResolution })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { size: "sm", variant: "outline", children: "Auto-resolve" }), _jsx(Button, { size: "sm", children: "Review" })] })] })) }), "))}"] });
}
CardContent >
;
Card >
;
TabsContent >
    { /* Analytics Tab */}
    < TabsContent;
value = "analytics";
className = "space-y-6" >
    _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Active Schedules" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-green-600", children: schedules.filter(s => s.status === ScheduleStatus.ACTIVE).length }), _jsx("p", { className: "text-sm text-gray-600", children: "Currently running" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Average Success Rate" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold text-blue-600", children: [(schedules.reduce((sum, s) => sum + s.performanceMetrics.successRate, 0) / schedules.length).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Across all schedules" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Total Executions" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-purple-600", children: schedules.reduce((sum, s) => sum + s.executionCount, 0) }), _jsx("p", { className: "text-sm text-gray-600", children: "All time" })] })] })] });
{ /* Performance Chart Placeholder */ }
_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-5 w-5" }), "Performance Trends"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg", children: _jsx("p", { className: "text-gray-600", children: "Performance trends chart would be rendered here" }) }) })] });
TabsContent >
;
Tabs >
;
div >
;
;
;
export default RecurringScheduleManager;
