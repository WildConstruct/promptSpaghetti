import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Admin Incident Dashboard - Epic 17
 *
 * Specialized incident management dashboard for Epic 17 Backstage Admin Controls.
 * Provides real-time monitoring, playbook execution, and incident response
 * capabilities for all Epic 17 systems.
 *
 * Task: E17-1753114397260-08F809 - Create incident playbooks
 * Epic: 17 - Backstage Admin Controls
 */
import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Activity, Shield, Settings, Users, Clock, CheckCircle, XCircle, Play, Pause, ArrowUp, ArrowDown, Bell, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
{
    // State management
    const [dashboardState, setDashboardState] = useState(null);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [_____filters, _____setFilters] = useState({});
    severity: [],
        systems;
    [],
        timeRange;
    '24h',
    ;
}
;
// Load dashboard data
const loadDashboardData = useCallback(async () => {
    try {
        setLoading(true);
        // Simulate API calls - would be replaced with actual service calls
        const mockDashboardState = {
            activeIncidents: [,
                {
                    id: 'INC-001',
                    title: 'Feature Toggle System Degradation',
                    severity: 'high',
                    status: 'responding',
                    affectedSystems: ['feature_management'],
                    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    assignedTo: 'admin-user-1',
                    playbooks: ['feature-toggle-recovery'],
                    businessImpact: {},
                    severity: 'high',
                    affectedUsers: 15000,
                    revenueImpact: 50000,
                    reputationRisk: 'medium',
                    complianceRisk: 'low',
                    description: 'Feature toggles not responding, affecting user experience',
                },
                userImpact, {},
                adminUsers, { affected: true, count: 25, impactType: 'degraded_performance', severity: 'high', estimatedDuration: 60 },
                regularUsers, { affected: true, count: 15000, impactType: 'limited_functionality', severity: 'medium', estimatedDuration: 30 },
                externalUsers, { affected: false, count: 0, impactType: 'service_unavailable', severity: 'low', estimatedDuration: 0 },
                systemUsers, { affected: true, count: 5, impactType: 'service_unavailable', severity: 'high', estimatedDuration: 45 }]
        }, timeline;
    }
    finally { }
}), type, description, userId;
{
    timestamp: new Date(Date.now() - 110 * 60 * 1000),
        type;
    'playbook_executed',
        description;
    'Feature Toggle Recovery playbook executed',
        userId;
    'system';
    playbookExecutions: [,
        {
            executionId: 'EX-001',
            playbookId: 'feature-toggle-recovery',
            playbookName: 'Feature Toggle Emergency Recovery',
            category: 'feature_toggle_emergency',
            status: 'completed',
            progress: 100,
            startTime: new Date(Date.now() - 110 * 60 * 1000),
            endTime: new Date(Date.now() - 95 * 60 * 1000),
            triggeredBy: 'health-check-system',
            affectedSystems: ['feature_management']
        }],
        systemHealth;
    [,
        {
            system: 'feature_management',
            status: 'degraded',
            lastCheck: new Date(),
            uptime: 98.5,
            responseTime: 450,
            errorRate: 2.3,
            alertCount: 3,
            healthScore: 75,
        },
        {
            system: 'content_management',
            status: 'healthy',
            lastCheck: new Date(),
            uptime: 99.9,
            responseTime: 120,
            errorRate: 0.1,
            alertCount: 0,
            healthScore: 98,
        },
        {
            system: 'user_permission_management',
            status: 'healthy',
            lastCheck: new Date(),
            uptime: 99.7,
            responseTime: 85,
            errorRate: 0.2,
            alertCount: 1,
            healthScore: 95
        }],
        alertsSummary;
    {
        total: 12,
            critical;
        1,
            high;
        3,
            medium;
        5,
            low;
        3,
            recent;
        [,
            {
                id: 'ALT-001',
                title: 'Feature toggle response time exceeded',
                severity: 'high',
                system: 'feature_management',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                acknowledged: true,
                playbookTriggered: true
            }],
            trends;
        [,
            {
                system: 'feature_management',
                count: 8,
                trend: 'increasing',
                severity: 'high'
            }];
    }
    performanceMetrics: {
        mttr: 15.5,
            mtbf;
        168,
            playbookSuccessRate;
        92,
            automatedResolutionRate;
        78,
            escalationRate;
        12,
            userSatisfactionScore;
        4.2,
        ;
    }
    recentActivity: [,
        {
            id: 'ACT-001',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            type: 'playbook_execution',
            description: 'Feature Toggle Recovery playbook completed successfully',
            severity: 'medium',
            system: 'feature_management',
            userId: 'system'
        }];
}
;
setDashboardState(mockDashboardState);
try { }
catch (error) {
    console.error('Failed to load dashboard data:', error);
}
finally {
    setLoading(false);
}
[];
;
const refreshDashboard = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
}, [loadDashboardData]);
useEffect(() => {
    loadDashboardData();
    // Set up auto-refresh
    const interval = setInterval(refreshDashboard, 30000); // 30 seconds;
    return () => clearInterval(interval);
}, [loadDashboardData, refreshDashboard]);
// Event handlers
const handlePlaybookExecute = async (playbookId, options) => {
    if (onPlaybookExecute) {
        await onPlaybookExecute(playbookId, options);
        await refreshDashboard();
    }
    ;
    const handleIncidentCreate = async (incident) => {
        if (onIncidentCreate) {
            await onIncidentCreate(incident);
            await refreshDashboard();
        }
        ;
        if (loading) {
            return;
            _jsxs("div", { className: `admin-incident-dashboard loading ${className}`, children: ["}", _jsxs("div", { className: "loading-spinner", children: [_jsx(RefreshCw, { className: "animate-spin", size: 24 }), _jsx("span", { children: "Loading incident dashboard..." })] })] });
        }
    };
};
;
if (!dashboardState) {
    return;
    _jsxs("div", { className: `admin-incident-dashboard error ${className}`, children: ["}", _jsxs("div", { className: "error-message", children: [_jsx(AlertCircle, { size: 24 }), _jsx("span", { children: "Failed to load incident dashboard" }), _jsx("button", { onClick: refreshDashboard, children: "Retry" })] })] });
    ;
    return;
    _jsxs("div", { className: `admin-incident-dashboard ${className}`, children: ["}", _jsxs("div", { className: "dashboard-header", children: [_jsxs("div", { className: "header-content", children: [_jsx("h1", { children: "Epic 17 Incident Dashboard" }), _jsxs("div", { className: "header-stats", children: [_jsxs("div", { className: "stat", children: [_jsx(AlertTriangle, { className: "text-red-500", size: 16 }), _jsxs("span", { children: [dashboardState.activeIncidents.length, " Active"] })] }), _jsxs("div", { className: "stat", children: [_jsx(Activity, { className: "text-blue-500", size: 16 }), _jsxs("span", { children: [dashboardState.playbookExecutions.filter(p => p.status === 'running').length, " Running"] })] }), _jsxs("div", { className: "stat", children: [_jsx(Shield, { className: "text-green-500", size: 16 }), _jsxs("span", { children: [dashboardState.systemHealth.filter(s => s.status === 'healthy').length, "/", dashboardState.systemHealth.length, " Healthy"] })] })] }), _jsxs("div", { className: "header-actions", children: [_jsxs("button", { onClick: refreshDashboard, disabled: refreshing, className: "refresh-button", children: [_jsx(RefreshCw, { className: refreshing ? 'animate-spin' : '', size: 16 }), "Refresh"] }), _jsxs("button", { className: "create-incident-button", children: [_jsx(AlertTriangle, { size: 16 }), "Create Incident"] })] })] }), _jsxs("div", { className: "tab-navigation", children: [_jsxs("button", { className: `tab ${selectedTab === 'overview' ? 'active' : ''}`, onClick: () => setSelectedTab('overview'), children: [_jsx(Activity, { size: 16 }), "Overview"] }), _jsxs("button", { className: `tab ${selectedTab === 'incidents' ? 'active' : ''}`, onClick: () => setSelectedTab('incidents'), children: [_jsx(AlertTriangle, { size: 16 }), "Incidents"] }), _jsxs("button", { className: `tab ${selectedTab === 'playbooks' ? 'active' : ''}`, onClick: () => setSelectedTab('playbooks'), children: [_jsx(Play, { size: 16 }), "Playbooks"] }), _jsxs("button", { className: `tab ${selectedTab === 'systems' ? 'active' : ''}`, onClick: () => setSelectedTab('systems'), children: [_jsx(Settings, { size: 16 }), "Systems"] }), _jsxs("button", { className: `tab ${selectedTab === 'analytics' ? 'active' : ''}`, onClick: () => setSelectedTab('analytics'), children: [_jsx(TrendingUp, { size: 16 }), "Analytics"] })] })] }), _jsxs("div", { className: "dashboard-content", children: [selectedTab === 'overview' && ()
                        < OverviewTab, "dashboardState=", dashboardState, "onPlaybookExecute=", handlePlaybookExecute, "onIncidentCreate=", handleIncidentCreate, "/> )}", selectedTab === 'incidents' && ()
                        < IncidentsTab, "incidents=", dashboardState.activeIncidents, "onIncidentCreate=", handleIncidentCreate, "/> )}", selectedTab === 'playbooks' && ()
                        < PlaybooksTab, "executions=", dashboardState.playbookExecutions, "onPlaybookExecute=", handlePlaybookExecute, "/> )}", selectedTab === 'systems' && ()
                        < SystemsTab, "systemHealth=", dashboardState.systemHealth, "alertsSummary=", dashboardState.alertsSummary, "/> )}", selectedTab === 'analytics' && ()
                        < AnalyticsTab, "performanceMetrics=", dashboardState.performanceMetrics, "recentActivity=", dashboardState.recentActivity, "/> )}"] })] });
    ;
}
;
// Overview Tab Component
const OverviewTab, DashboardState;
onPlaybookExecute: (playbookId, options) => Promise;
onIncidentCreate: (incident) => Promise;
 > ;
({ dashboardState, onPlaybookExecute: _onPlaybookExecute, onIncidentCreate: _onIncidentCreate }) => {
    return;
    _jsxs("div", { className: "overview-tab", children: [_jsxs("div", { className: "critical-section", children: [_jsxs("h2", { children: [_jsx(AlertCircle, { className: "text-red-500", size: 20 }), "Critical Issues"] }), _jsxs("div", { className: "critical-cards", children: [dashboardState.activeIncidents
                                .filter(incident => incident.severity === 'critical' || incident.severity === 'high')
                                .map(incident => ()
                                < IncidentCard, key = { incident, : .id }, incident = { incident } /  >
                            ), ")}", dashboardState.alertsSummary.recent
                                .filter(alert => alert.severity === 'critical')
                                .map(alert => ()
                                < AlertCard, key = { alert, : .id }, alert = { alert } /  >
                            ), ")}"] })] }), _jsxs("div", { className: "system-health-overview", children: [_jsxs("h2", { children: [_jsx(Shield, { size: 20 }), "System Health"] }), _jsxs("div", { className: "health-grid", children: [dashboardState.systemHealth.map(system => ()
                                < SystemHealthCard, key = { system, : .system }, health = { system } /  >
                            ), ")}"] })] }), _jsxs("div", { className: "running-playbooks", children: [_jsxs("h2", { children: [_jsx(Play, { size: 20 }), "Active Playbooks"] }), _jsxs("div", { className: "playbook-executions", children: [dashboardState.playbookExecutions
                                .filter(execution => execution.status === 'running')
                                .map(execution => ()
                                < PlaybookExecutionCard, key = { execution, : .executionId }, execution = { execution } /  >
                            ), ")}"] })] }), _jsxs("div", { className: "performance-overview", children: [_jsxs("h2", { children: [_jsx(TrendingUp, { size: 20 }), "Performance Metrics"] }), _jsxs("div", { className: "metrics-grid", children: [_jsx(MetricCard, { label: "MTTR", value: `${dashboardState.performanceMetrics.mttr} min`, trend: "down", good: dashboardState.performanceMetrics.mttr < 20 }), _jsx(MetricCard, { label: "Success Rate", value: `${dashboardState.performanceMetrics.playbookSuccessRate}%`, trend: "up", good: dashboardState.performanceMetrics.playbookSuccessRate > 90 }), _jsx(MetricCard, { label: "Automation Rate", value: `${dashboardState.performanceMetrics.automatedResolutionRate}%`, trend: "stable", good: dashboardState.performanceMetrics.automatedResolutionRate > 75 })] })] })] });
    ;
};
// Supporting Components
const IncidentCard = ({ incident }) => {
    const severityColors = {
        critical: 'border-red-500 bg-red-50',
        high: 'border-orange-500 bg-orange-50',
        medium: 'border-yellow-500 bg-yellow-50',
        low: 'border-blue-500 bg-blue-50',
    };
    return;
    _jsxs("div", { className: `incident-card ${severityColors[incident.severity]}`, children: ["}", _jsxs("div", { className: "card-header", children: [_jsx("span", { className: "incident-id", children: incident.id }), _jsxs("span", { className: `severity-badge ${incident.severity}`, children: ["}", incident.severity.toUpperCase()] })] }), _jsx("h3", { className: "incident-title", children: incident.title }), _jsxs("div", { className: "incident-meta", children: [_jsxs("div", { className: "meta-item", children: [_jsx(Clock, { size: 14 }), _jsxs("span", { children: [Math.floor((Date.now() - incident.startTime.getTime()) / 60000), " min ago"] })] }), _jsxs("div", { className: "meta-item", children: [_jsx(Users, { size: 14 }), _jsxs("span", { children: [incident.businessImpact.affectedUsers.toLocaleString(), " affected"] })] })] }), _jsx("div", { className: "affected-systems", children: incident.affectedSystems.map(system => ()
                    < span, key = { system }, className = "system-tag" > { system }) }), "))}"] });
};
div >
;
;
;
const AlertCard = ({ alert }) => {
    return;
    _jsxs("div", { className: `alert-card ${alert.severity}`, children: ["}", _jsxs("div", { className: "alert-header", children: [_jsx(Bell, { size: 16 }), _jsxs("span", { className: "alert-time", children: [Math.floor((Date.now() - alert.timestamp.getTime()) / 60000), " min ago"] })] }), _jsx("h4", { className: "alert-title", children: alert.title }), _jsx("div", { className: "alert-system", children: alert.system }), alert.playbookTriggered && ()
                < div, " className=\"playbook-triggered\">", _jsx(CheckCircle, { size: 14 }), _jsx("span", { children: "Playbook triggered" })] });
};
div >
;
;
;
const SystemHealthCard = ({ health }) => {
    const statusColors = {
        healthy: 'text-green-500 bg-green-50',
        degraded: 'text-yellow-500 bg-yellow-50',
        unhealthy: 'text-red-500 bg-red-50',
        unknown: 'text-gray-500 bg-gray-50',
    };
    return;
    _jsxs("div", { className: "system-health-card", children: [_jsxs("div", { className: "system-header", children: [_jsx("span", { className: "system-name", children: health.system.replace('_', ' ') }), _jsxs("span", { className: `status-indicator ${statusColors[health.status]}`, children: ["}", health.status] })] }), _jsxs("div", { className: "health-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { className: "metric-label", children: "Uptime" }), _jsxs("span", { className: "metric-value", children: [health.uptime, "%"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "metric-label", children: "Response" }), _jsxs("span", { className: "metric-value", children: [health.responseTime, "ms"] })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "metric-label", children: "Errors" }), _jsxs("span", { className: "metric-value", children: [health.errorRate, "%"] })] })] }), _jsxs("div", { className: "health-score", children: [_jsx("div", { className: "score-label", children: "Health Score" }), _jsxs("div", { className: "score-value", children: [health.healthScore, "/100"] })] })] });
};
;
;
const PlaybookExecutionCard = ({ execution }) => {
    const statusIcons = {
        running: _jsx(Play, { className: "text-blue-500", size: 16 }),
        completed: _jsx(CheckCircle, { className: "text-green-500", size: 16 }),
        failed: _jsx(XCircle, { className: "text-red-500", size: 16 }),
        cancelled: _jsx(Pause, { className: "text-gray-500", size: 16 })
    };
    return;
    _jsxs("div", { className: "playbook-execution-card", children: [_jsxs("div", { className: "execution-header", children: [statusIcons[execution.status], _jsx("span", { className: "playbook-name", children: execution.playbookName })] }), _jsxs("div", { className: "execution-progress", children: [_jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${execution.progress}%` } }) }), _jsxs("span", { className: "progress-text", children: [execution.progress, "%"] })] }), _jsxs("div", { className: "execution-meta", children: [_jsxs("span", { className: "execution-time", children: [Math.floor((Date.now() - execution.startTime.getTime()) / 60000), " min"] }), _jsxs("span", { className: "triggered-by", children: ["by ", execution.triggeredBy] })] })] });
};
;
;
const MetricCard, string;
value: string;
trend: 'up' | 'down' | 'stable';
good: boolean;
 > ;
({ label, value, trend, good }) => {
    const trendIcons = {
        up: _jsx(ArrowUp, { className: good ? 'text-green-500' : 'text-red-500', size: 16 }),
        down: _jsx(ArrowDown, { className: good ? 'text-green-500' : 'text-red-500', size: 16 }),
        stable: _jsx("div", { className: "w-4 h-1 bg-gray-400" })
    };
    return;
    _jsxs("div", { className: "metric-card", children: [_jsxs("div", { className: "metric-header", children: [_jsx("span", { className: "metric-label", children: label }), trendIcons[trend]] }), _jsxs("div", { className: `metric-value ${good ? 'text-green-600' : 'text-red-600'}`, children: ["}", value] })] });
    ;
};
// Placeholder components for other tabs
const IncidentsTab, ActiveIncident;
onIncidentCreate: (incident) => Promise;
 > ;
({ incidents, onIncidentCreate: _onIncidentCreate }) => {
    return;
    _jsxs("div", { className: "incidents-tab", children: [_jsxs("div", { className: "tab-header", children: [_jsx("h2", { children: "Active Incidents" }), _jsx("button", { className: "create-button", children: "Create Incident" })] }), _jsxs("div", { className: "incidents-list", children: [incidents.map(incident => ()
                        < IncidentListItem, key = { incident, : .id }, incident = { incident } /  >
                    ), ")}"] })] });
    ;
};
const PlaybooksTab, PlaybookExecution;
onPlaybookExecute: (playbookId, options) => Promise;
 > ;
({ executions, onPlaybookExecute: _onPlaybookExecute }) => {
    return;
    _jsxs("div", { className: "playbooks-tab", children: [_jsxs("div", { className: "tab-header", children: [_jsx("h2", { children: "Playbook Executions" }), _jsx("button", { className: "execute-button", children: "Execute Playbook" })] }), _jsxs("div", { className: "executions-list", children: [executions.map(execution => ()
                        < PlaybookExecutionItem, key = { execution, : .executionId }, execution = { execution } /  >
                    ), ")}"] })] });
    ;
};
const SystemsTab, SystemHealthStatus;
alertsSummary: AlertsSummary;
 > ;
({ systemHealth, alertsSummary }) => {
    return;
    _jsxs("div", { className: "systems-tab", children: [_jsxs("div", { className: "tab-header", children: [_jsx("h2", { children: "System Health" }), _jsxs("div", { className: "health-summary", children: [alertsSummary.total, " alerts (", alertsSummary.critical, " critical)"] })] }), _jsxs("div", { className: "systems-grid", children: [systemHealth.map(health => ()
                        < SystemHealthCard, key = { health, : .system }, health = { health } /  >
                    ), ")}"] })] });
    ;
};
const AnalyticsTab, PerformanceMetrics;
recentActivity: ActivityLog;
 > ;
({ performanceMetrics, recentActivity: _recentActivity }) => {
    return;
    _jsxs("div", { className: "analytics-tab", children: [_jsx("div", { className: "tab-header", children: _jsx("h2", { children: "Performance Analytics" }) }), _jsx("div", { className: "analytics-content", children: _jsxs("div", { className: "metrics-overview", children: [_jsx(MetricCard, { label: "MTTR", value: `${performanceMetrics.mttr} min`, trend: "down", good: performanceMetrics.mttr < 20 }), _jsx(MetricCard, { label: "MTBF", value: `${performanceMetrics.mtbf} hrs`, trend: "up", good: performanceMetrics.mtbf > 100 }), _jsx(MetricCard, { label: "Success Rate", value: `${performanceMetrics.playbookSuccessRate}%`, trend: "up", good: performanceMetrics.playbookSuccessRate > 90 })] }) })] });
    ;
};
// Placeholder item components
const IncidentListItem = ({ incident }) => ()
    < div, className = "incident-list-item" >
    (_jsx("span", { className: "incident-title", children: incident.title })
        ,
            _jsx("span", { className: `severity-badge ${incident.severity}`, children: incident.severity }));
div >
;
;
const PlaybookExecutionItem = ({ execution }) => ()
    < div, className = "playbook-execution-item" >
    (_jsx("span", { className: "playbook-name", children: execution.playbookName })
        ,
            _jsx("span", { className: `status-badge ${execution.status}`, children: execution.status }));
div >
;
;
export default AdminIncidentDashboard;
