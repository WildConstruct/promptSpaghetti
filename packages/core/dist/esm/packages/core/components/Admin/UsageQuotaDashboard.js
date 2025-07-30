import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Usage Quota Management Dashboard - Epic 17
 *
 * Comprehensive admin interface for managing usage quotas, tracking violations,
 * and monitoring system-wide quota utilization. Part of Epic 17 Backstage
 * Admin Controls for platform oversight and resource management.
 *
 * Task: E17-1753114397228-B591AA - Create usage quotas
 * Epic: 17 - Backstage Admin Controls
 */
import { useState, useEffect, useCallback } from 'react';
import { BarChart3, AlertTriangle, Shield, Settings, TrendingUp, TrendingDown, Clock, Database, Activity, CheckCircle, AlertCircle, Plus, Edit2, Play, Pause, RefreshCw } from 'lucide-react';
{
    // State management
    const [dashboardState, setDashboardState] = useState(null);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [_____filters, _____setFilters] = useState({});
    quotaType: [],
        status;
    [],
        severity;
    [],
        timeRange;
    '24h',
    ;
}
;
// Selected items for bulk operations
const [selectedQuotas, setSelectedQuotas] = useState([]);
const [selectedViolations, setSelectedViolations] = useState([]);
// Modal states
const [_____showCreateQuotaModal, setShowCreateQuotaModal] = useState(false);
const [_____showTemplateModal, _____setShowTemplateModal] = useState(false);
const [_____editingQuota, setEditingQuota] = useState(null);
// Load dashboard data
const loadDashboardData = useCallback(async () => {
    try {
        setLoading(true);
        // Simulate API calls - would be replaced with actual service calls
        const mockDashboardState = {
            quotas: [,
                {
                    quotaId: 'quota-api-requests',
                    quotaName: 'API Requests - Free Tier',
                    quotaType: 'api_requests',
                    resourceIdentifier: '*',
                    limitValue: 1000,
                    limitPeriod: 'day',
                    limitUnit: 'requests',
                    appliesTo: { type: 'tier', value: 'free' },
                    enforcementAction: 'hard_block',
                    resetBehavior: 'automatic',
                    gracePeriodMinutes: 0,
                    hardLimit: true,
                    priority: 1,
                    enabled: true,
                    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    createdBy: 'admin-user-1',
                    configuration: {
                        warningThresholds: [75, 90, 95],
                        emergencyMultiplier: 1.5,
                        integrateWithRateLimit: true,
                        integrateWithFraudDetection: true,
                        integrateWithBilling: false,
                        trackingEnabled: true,
                        analyticsEnabled: true,
                        alertsEnabled: true,
                        cachingEnabled: true,
                        batchProcessing: false,
                        asyncEnforcement: false,
                    },
                    metadata: {
                        description: 'Daily API request limit for free tier users',
                        category: 'resource_management',
                        businessJustification: 'Prevent abuse and manage infrastructure costs',
                        technicalConstraints: ['Rate limiting integration required'],
                        relatedQuotas: [],
                        averageUsage: 750,
                        peakUsage: 980,
                        violationRate: 5.2,
                        lastViolation: new Date(Date.now() - 2 * 60 * 60 * 1000),
                        impactOnRevenue: 'low',
                        userSatisfactionImpact: 'medium',
                        operationalCost: 'low',
                    }
                },
                {
                    quotaId: 'quota-graph-executions',
                    quotaName: 'Graph Executions - Pro Tier',
                    quotaType: 'graph_executions',
                    resourceIdentifier: '*',
                    limitValue: 500,
                    limitPeriod: 'day',
                    limitUnit: 'executions',
                    appliesTo: { type: 'tier', value: 'pro' },
                    enforcementAction: 'throttle',
                    resetBehavior: 'automatic',
                    gracePeriodMinutes: 15,
                    hardLimit: false,
                    priority: 2,
                    enabled: true,
                    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
                    createdBy: 'admin-user-2',
                    configuration: {
                        warningThresholds: [80, 90, 95],
                        emergencyMultiplier: 2.0,
                        integrateWithRateLimit: false,
                        integrateWithFraudDetection: true,
                        integrateWithBilling: true,
                        trackingEnabled: true,
                        analyticsEnabled: true,
                        alertsEnabled: true,
                        cachingEnabled: true,
                        batchProcessing: true,
                        asyncEnforcement: true,
                    },
                    metadata: {
                        description: 'Daily graph execution limit for pro tier users',
                        category: 'business_logic',
                        businessJustification: 'Tier-based service differentiation',
                        technicalConstraints: ['Execution engine integration'],
                        relatedQuotas: ['quota-api-requests'],
                        averageUsage: 320,
                        peakUsage: 475,
                        violationRate: 2.1,
                        impactOnRevenue: 'medium',
                        userSatisfactionImpact: 'high',
                        operationalCost: 'medium'
                    }
                }],
            violations: [,
                {
                    violationId: 'violation-001',
                    quotaId: 'quota-api-requests',
                    userId: 'user-12345',
                    violationTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    exceededBy: 150,
                    quotaLimit: 1000,
                    actualUsage: 1150,
                    severity: 'medium',
                    impactAssessment: {
                        businessImpact: 'low',
                        technicalImpact: 'low',
                        userImpact: 'medium',
                        securityRisk: 'low',
                        complianceRisk: 'none',
                    },
                    enforcementAction: 'hard_block',
                    enforcementDetails: {
                        actionTaken: 'hard_block',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                        reason: 'API request quota exceeded',
                        automaticAction: true,
                        additionalData: {}
                    },
                    status: 'active',
                    appealSubmitted: false
                }],
            analytics: [,
                {
                    period: { type: 'day', value: 7, timezone: 'UTC' },
                    periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    periodEnd: new Date(),
                    totalUsage: 45230,
                    averageUsage: 6461,
                    peakUsage: 8750,
                    uniqueUsers: 1247,
                    quotaUtilization: 75.3,
                    violationCount: 23,
                    violationRate: 0.05,
                    usageTrend: 'increasing',
                    trendSignificance: 0.82,
                    seasonalPatterns: [],
                    topUsers: [],
                    usageDistribution: {
                        percentiles: { 50: 500, 75: 750, 90: 900, 95: 950, 99: 990 },
                        buckets: [],
                        outliers: []
                    },
                    averageResponseTime: 120,
                    systemLoad: 68,
                    resourceUtilization: {
                        cpu: 45,
                        memory: 62,
                        disk: 34,
                        network: 23,
                        database: 78
                    }
                }],
            templates: [,
                {
                    templateId: 'template-free-tier',
                    templateName: 'Free Tier Default',
                    description: 'Default quotas for free tier users',
                    category: 'free_tier',
                    quotaDefinitions: [,
                        {
                            quotaType: 'api_requests',
                            resourceIdentifier: '*',
                            limitValue: 1000,
                            limitPeriod: 'day',
                            limitUnit: 'requests',
                            enforcementAction: 'hard_block',
                            variableFields: ['limitValue'],
                            conditionalRules: []
                        }],
                    createdBy: 'system',
                    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    usageCount: 847,
                    validationRules: [],
                    enabled: true
                }],
            operations: [,
                {
                    operationId: 'op-001',
                    operationType: 'update_quota',
                    targetType: 'quota',
                    targetId: 'quota-api-requests',
                    adminUserId: 'admin-user-1',
                    timestamp: new Date(Date.now() - 30 * 60 * 1000),
                    reason: 'Increase limit for free tier users',
                    parameters: { limitValue: 1200 },
                    requiresApproval: false,
                    status: 'completed',
                    result: {
                        success: true,
                        affectedRecords: 1,
                        warnings: [],
                        details: {}
                    }
                }
            ],
            systemMetrics: {
                totalQuotas: 15,
                activeQuotas: 13,
                totalViolations: 45,
                activeViolations: 8,
                utilizationRate: 68.5,
                topViolatedQuotas: [,
                    {
                        quotaId: 'quota-api-requests',
                        quotaName: 'API Requests - Free Tier',
                        violationCount: 23,
                        lastViolation: new Date(Date.now() - 2 * 60 * 60 * 1000),
                        severity: 'medium'
                    }],
                recentActivity: [,
                    {
                        timestamp: new Date(Date.now() - 15 * 60 * 1000),
                        type: 'violation_occurred',
                        description: 'API request quota exceeded by user-12345',
                        userId: 'user-12345',
                        quotaId: 'quota-api-requests',
                        severity: 'medium'
                    }]
            } };
        try { }
        catch (error) {
            console.error('Failed to load quota dashboard data:', error);
        }
        finally {
            setLoading(false);
        }
        [];
    }
    finally { }
});
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
const _____handleQuotaCreate = async (quota) => {
    if (onQuotaCreate) {
        await onQuotaCreate(quota);
        await refreshDashboard();
    }
    ;
    const handleQuotaUpdate = async (quotaId, updates) => {
        if (onQuotaUpdate) {
            await onQuotaUpdate(quotaId, updates);
            await refreshDashboard();
        }
        ;
        const handleQuotaToggle = async (quotaId, enabled) => {
            await handleQuotaUpdate(quotaId, { enabled });
        };
        if (loading) {
            return;
            _jsxs("div", { className: `usage-quota-dashboard loading ${className}`, children: ["}", _jsxs("div", { className: "loading-spinner", children: [_jsx(RefreshCw, { className: "animate-spin", size: 24 }), _jsx("span", { children: "Loading quota management dashboard..." })] })] });
        }
    };
};
;
if (!dashboardState) {
    return;
    _jsxs("div", { className: `usage-quota-dashboard error ${className}`, children: ["}", _jsxs("div", { className: "error-message", children: [_jsx(AlertCircle, { size: 24 }), _jsx("span", { children: "Failed to load quota dashboard" }), _jsx("button", { onClick: refreshDashboard, children: "Retry" })] })] });
    ;
    return;
    _jsxs("div", { className: `usage-quota-dashboard ${className}`, children: ["}", _jsxs("div", { className: "dashboard-header", children: [_jsxs("div", { className: "header-content", children: [_jsx("h1", { children: "Usage Quota Management" }), _jsxs("div", { className: "header-stats", children: [_jsxs("div", { className: "stat", children: [_jsx(Shield, { className: "text-blue-500", size: 16 }), _jsxs("span", { children: [dashboardState.systemMetrics.activeQuotas, " Active Quotas"] })] }), _jsxs("div", { className: "stat", children: [_jsx(AlertTriangle, { className: "text-red-500", size: 16 }), _jsxs("span", { children: [dashboardState.systemMetrics.activeViolations, " Active Violations"] })] }), _jsxs("div", { className: "stat", children: [_jsx(BarChart3, { className: "text-green-500", size: 16 }), _jsxs("span", { children: [dashboardState.systemMetrics.utilizationRate, "% Utilization"] })] })] }), _jsxs("div", { className: "header-actions", children: [_jsxs("button", { onClick: refreshDashboard, disabled: refreshing, className: "refresh-button", children: [_jsx(RefreshCw, { className: refreshing ? 'animate-spin' : '', size: 16 }), "Refresh"] }), _jsxs("button", { onClick: () => setShowCreateQuotaModal(true), className: "create-quota-button", children: [_jsx(Plus, { size: 16 }), "Create Quota"] }), _jsxs("button", { className: "template-button", children: [_jsx(Settings, { size: 16 }), "Templates"] })] })] }), _jsxs("div", { className: "tab-navigation", children: [_jsxs("button", { className: `tab ${selectedTab === 'overview' ? 'active' : ''}`, onClick: () => setSelectedTab('overview'), children: [_jsx(Activity, { size: 16 }), "Overview"] }), _jsxs("button", { className: `tab ${selectedTab === 'quotas' ? 'active' : ''}`, onClick: () => setSelectedTab('quotas'), children: [_jsx(Shield, { size: 16 }), "Quotas"] }), _jsxs("button", { className: `tab ${selectedTab === 'violations' ? 'active' : ''}`, onClick: () => setSelectedTab('violations'), children: [_jsx(AlertTriangle, { size: 16 }), "Violations"] }), _jsxs("button", { className: `tab ${selectedTab === 'analytics' ? 'active' : ''}`, onClick: () => setSelectedTab('analytics'), children: [_jsx(BarChart3, { size: 16 }), "Analytics"] }), _jsxs("button", { className: `tab ${selectedTab === 'templates' ? 'active' : ''}`, onClick: () => setSelectedTab('templates'), children: [_jsx(Settings, { size: 16 }), "Templates"] }), _jsxs("button", { className: `tab ${selectedTab === 'operations' ? 'active' : ''}`, onClick: () => setSelectedTab('operations'), children: [_jsx(Database, { size: 16 }), "Operations"] })] })] }), _jsxs("div", { className: "dashboard-content", children: [selectedTab === 'overview' && ()
                        < OverviewTab, "systemMetrics=", dashboardState.systemMetrics, "quotas=", dashboardState.quotas, "violations=", dashboardState.violations, "analytics=", dashboardState.analytics[0], "/> )}", selectedTab === 'quotas' && ()
                        < QuotasTab, "quotas=", dashboardState.quotas, "selectedQuotas=", selectedQuotas, "onQuotasSelect=", setSelectedQuotas, "onQuotaEdit=", setEditingQuota, "onQuotaToggle=", handleQuotaToggle, "onQuotaDelete=", onQuotaDelete, "/> )}", selectedTab === 'violations' && ()
                        < ViolationsTab, "violations=", dashboardState.violations, "quotas=", dashboardState.quotas, "selectedViolations=", selectedViolations, "onViolationsSelect=", setSelectedViolations, "onViolationResolve=", onViolationResolve, "/> )}", selectedTab === 'analytics' && ()
                        < AnalyticsTab, "analytics=", dashboardState.analytics, "systemMetrics=", dashboardState.systemMetrics, "/> )}", selectedTab === 'templates' && ()
                        < TemplatesTab, "templates=", dashboardState.templates, "onTemplateApply=", (templateId, targets) => console.log('Apply template', templateId, targets), "/> )}", selectedTab === 'operations' && ()
                        < OperationsTab, "operations=", dashboardState.operations, "/> )}"] })] });
    ;
}
;
// Overview Tab Component
const OverviewTab, SystemQuotaMetrics;
quotas: UsageQuota;
violations: QuotaViolation;
analytics: UsageAnalytics;
 > ;
({ systemMetrics, quotas, violations, analytics }) => {
    return;
    _jsxs("div", { className: "overview-tab", children: [_jsxs("div", { className: "metrics-overview", children: [_jsxs("div", { className: "metric-card", children: [_jsxs("div", { className: "metric-header", children: [_jsx(Shield, { size: 20 }), _jsx("span", { children: "Total Quotas" })] }), _jsx("div", { className: "metric-value", children: systemMetrics.totalQuotas }), _jsxs("div", { className: "metric-detail", children: [systemMetrics.activeQuotas, " active, ", systemMetrics.totalQuotas - systemMetrics.activeQuotas, " disabled"] })] }), _jsxs("div", { className: "metric-card", children: [_jsxs("div", { className: "metric-header", children: [_jsx(AlertTriangle, { size: 20 }), _jsx("span", { children: "Violations" })] }), _jsx("div", { className: "metric-value text-red-600", children: systemMetrics.totalViolations }), _jsxs("div", { className: "metric-detail", children: [systemMetrics.activeViolations, " active violations"] })] }), _jsxs("div", { className: "metric-card", children: [_jsxs("div", { className: "metric-header", children: [_jsx(BarChart3, { size: 20 }), _jsx("span", { children: "Utilization Rate" })] }), _jsxs("div", { className: "metric-value text-blue-600", children: [systemMetrics.utilizationRate, "%"] }), _jsx("div", { className: "metric-detail", children: "Average across all quotas" })] }), _jsxs("div", { className: "metric-card", children: [_jsxs("div", { className: "metric-header", children: [_jsx(TrendingUp, { size: 20 }), _jsx("span", { children: "Usage Trend" })] }), _jsx("div", { className: "metric-value text-green-600", children: analytics.usageTrend === 'increasing' ? _jsx(TrendingUp, { size: 24 }) :
                                    analytics.usageTrend === 'decreasing' ? _jsx(TrendingDown, { size: 24 }) :
                                        _jsx(Activity, { size: 24 }) }), _jsxs("div", { className: "metric-detail", children: [Math.round(analytics.trendSignificance * 100), "% confidence"] })] })] }), _jsxs("div", { className: "top-violations-section", children: [_jsxs("h2", { children: [_jsx(AlertTriangle, { size: 20 }), "Top Violated Quotas"] }), _jsx("div", { className: "violations-list", children: systemMetrics.topViolatedQuotas.map(quota => ()
                            < div, key = { quota, : .quotaId }, className = "violation-item" >
                            (_jsxs("div", { className: "violation-info", children: [_jsx("span", { className: "quota-name", children: quota.quotaName }), _jsxs("span", { className: `severity-badge ${quota.severity}`, children: ["}", quota.severity.toUpperCase()] })] })
                                ,
                                    _jsxs("div", { className: "violation-stats", children: [_jsxs("span", { className: "violation-count", children: [quota.violationCount, " violations"] }), _jsxs("span", { className: "last-violation", children: ["Last: ", Math.floor((Date.now() - quota.lastViolation.getTime()) / 60000), "m ago"] })] }))) }), "))}"] })] });
    { /* Recent Activity */ }
    _jsxs("div", { className: "recent-activity-section", children: [_jsxs("h2", { children: [_jsx(Clock, { size: 20 }), "Recent Activity"] }), _jsx("div", { className: "activity-list", children: systemMetrics.recentActivity.map((activity, index) => ()
                    < div, key = { index }, className = "activity-item" >
                    (_jsx("div", { className: "activity-icon", children: activity.type === 'violation_occurred' ? _jsx(AlertCircle, { size: 16 }) :
                            activity.type === 'quota_created' ? _jsx(Plus, { size: 16 }) :
                                activity.type === 'quota_updated' ? _jsx(Edit2, { size: 16 }) :
                                    _jsx(CheckCircle, { size: 16 }) })
                        ,
                            _jsxs("div", { className: "activity-content", children: [_jsx("div", { className: "activity-description", children: activity.description }), _jsxs("div", { className: "activity-time", children: [Math.floor((Date.now() - activity.timestamp.getTime()) / 60000), "m ago"] })] })
                                ,
                                    _jsxs("div", { className: `activity-severity ${activity.severity}`, children: ["}", activity.severity] }))) }), "))}"] });
    div >
    ;
    div >
    ;
    ;
};
// Additional tab components would be implemented here...
// QuotasTab, ViolationsTab, AnalyticsTab, TemplatesTab, OperationsTab
// Placeholder implementations
const QuotasTab = ({ quotas, onQuotaToggle }) => ()
    < div, className = "quotas-tab" >
    _jsx("h2", { children: "Quotas Management" });
{
    quotas.map((quota) => ()
        < div, key = { quota, : .quotaId }, className = "quota-card" >
        (_jsxs("div", { className: "quota-header", children: [_jsx("span", { className: "quota-name", children: quota.quotaName }), _jsx("button", { onClick: () => onQuotaToggle(quota.quotaId, !quota.enabled), className: `toggle-button ${quota.enabled ? 'enabled' : 'disabled'}`, children: quota.enabled ? _jsx(Play, { size: 16 }) : _jsx(Pause, { size: 16 }) })] })
            ,
                _jsxs("div", { className: "quota-details", children: [_jsxs("span", { children: ["Type: ", quota.quotaType] }), _jsxs("span", { children: ["Limit: ", quota.limitValue.toLocaleString(), " ", quota.limitUnit, "/", quota.limitPeriod] }), _jsxs("span", { children: ["Enforcement: ", quota.enforcementAction] })] })), div >
    );
}
div >
;
;
const ViolationsTab = ({ violations }) => ()
    < div, className = "violations-tab" >
    _jsx("h2", { children: "Violations Management" });
{
    violations.map((violation) => ()
        < div, key = { violation, : .violationId }, className = "violation-card" >
        (_jsxs("div", { className: "violation-header", children: [_jsx("span", { className: "violation-id", children: violation.violationId }), _jsxs("span", { className: `severity-badge ${violation.severity}`, children: ["}", violation.severity] })] })
            ,
                _jsxs("div", { className: "violation-details", children: [_jsxs("span", { children: ["User: ", violation.userId] }), _jsxs("span", { children: ["Exceeded by: ", violation.exceededBy.toLocaleString()] }), _jsxs("span", { children: ["Status: ", violation.status] })] })), div >
    );
}
div >
;
;
const AnalyticsTab = ({ analytics, _____systemMetrics }) => ()
    < div, className = "analytics-tab" >
    (_jsx("h2", { children: "Usage Analytics" })
        ,
            _jsx("div", { className: "analytics-content", children: _jsxs("div", { className: "analytics-summary", children: [_jsxs("div", { className: "summary-card", children: [_jsx("span", { children: "Total Usage" }), _jsx("span", { className: "value", children: analytics[0]?.totalUsage?.toLocaleString() })] }), _jsxs("div", { className: "summary-card", children: [_jsx("span", { children: "Peak Usage" }), _jsx("span", { className: "value", children: analytics[0]?.peakUsage?.toLocaleString() })] }), _jsxs("div", { className: "summary-card", children: [_jsx("span", { children: "Unique Users" }), _jsx("span", { className: "value", children: analytics[0]?.uniqueUsers?.toLocaleString() })] })] }) }));
div >
;
;
const TemplatesTab = ({ templates }) => ()
    < div, className = "templates-tab" >
    _jsx("h2", { children: "Quota Templates" });
{
    templates.map((template) => ()
        < div, key = { template, : .templateId }, className = "template-card" >
        (_jsxs("div", { className: "template-header", children: [_jsx("span", { className: "template-name", children: template.templateName }), _jsx("span", { className: "template-category", children: template.category })] })
            ,
                _jsxs("div", { className: "template-details", children: [_jsxs("span", { children: ["Usage count: ", template.usageCount] }), _jsxs("span", { children: [template.quotaDefinitions.length, " quota definitions"] })] })), div >
    );
}
div >
;
;
const OperationsTab = ({ operations }) => ()
    < div, className = "operations-tab" >
    _jsx("h2", { children: "Admin Operations" });
{
    operations.map((operation) => ()
        < div, key = { operation, : .operationId }, className = "operation-card" >
        (_jsxs("div", { className: "operation-header", children: [_jsx("span", { className: "operation-type", children: operation.operationType }), _jsxs("span", { className: `status-badge ${operation.status}`, children: ["}", operation.status] })] })
            ,
                _jsxs("div", { className: "operation-details", children: [_jsxs("span", { children: ["Target: ", operation.targetType, "#", operation.targetId] }), _jsxs("span", { children: ["By: ", operation.adminUserId] }), _jsxs("span", { children: [Math.floor((Date.now() - operation.timestamp.getTime()) / 60000), "m ago"] })] })), div >
    );
}
div >
;
;
export default UsageQuotaDashboard;
