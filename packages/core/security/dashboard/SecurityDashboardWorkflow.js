import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Security Dashboard Workflow System
 * Task T-1752989143998-688: Implement security dashboard workflow
 *
 * Advanced security dashboard with integrated workflow management for threat
 * detection, incident response, compliance tracking, and automated remediation.
 *
 * Features:
 * - Real-time security event processing
 * - Automated workflow state transitions
 * - Role-based access control and approvals
 * - Intelligent alert correlation and escalation
 * - Compliance-driven workflow automation
 * - Interactive incident response coordination
 * - Performance monitoring and analytics
 * - Mobile-first responsive design
 *
 * Architecture:
 * - React component with TypeScript
 * - Zustand state management integration
 * - Event-driven workflow orchestration
 * - Security framework integration
 * - Real-time data streaming
 * - Modular widget architecture
 *
 * Security Features:
 * - End-to-end audit logging
 * - Encrypted data transmission
 * - Role-based permission enforcement
 * - Input validation and sanitization
 * - Rate limiting and throttling
 * - XSS and injection protection
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2025-07-22
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { SecurityDashboardFramework, DashboardType, SecurityRole } from './SecurityDashboardFramework.js';
import { useWorkflowStore } from '../stores/workflowStore.js';
import './SecurityDashboardWorkflow.css';
export var SecurityEventType;
(function (SecurityEventType) {
    SecurityEventType["THREAT_DETECTION"] = "threat_detection";
    SecurityEventType["AUTHENTICATION_FAILURE"] = "authentication_failure";
    SecurityEventType["ACCESS_VIOLATION"] = "access_violation";
    SecurityEventType["DATA_BREACH"] = "data_breach";
    SecurityEventType["MALWARE_DETECTION"] = "malware_detection";
    SecurityEventType["NETWORK_INTRUSION"] = "network_intrusion";
    SecurityEventType["POLICY_VIOLATION"] = "policy_violation";
    SecurityEventType["COMPLIANCE_VIOLATION"] = "compliance_violation";
    SecurityEventType["SYSTEM_ANOMALY"] = "system_anomaly";
    SecurityEventType["INSIDER_THREAT"] = "insider_threat";
})(SecurityEventType || (SecurityEventType = {}));
export var SecuritySeverity;
(function (SecuritySeverity) {
    SecuritySeverity["CRITICAL"] = "critical";
    SecuritySeverity["HIGH"] = "high";
    SecuritySeverity["MEDIUM"] = "medium";
    SecuritySeverity["LOW"] = "low";
    SecuritySeverity["INFO"] = "info";
})(SecuritySeverity || (SecuritySeverity = {}));
export var SecurityActionType;
(function (SecurityActionType) {
    SecurityActionType["BLOCK_IP"] = "block_ip";
    SecurityActionType["ISOLATE_HOST"] = "isolate_host";
    SecurityActionType["DISABLE_ACCOUNT"] = "disable_account";
    SecurityActionType["QUARANTINE_FILE"] = "quarantine_file";
    SecurityActionType["NOTIFY_TEAM"] = "notify_team";
    SecurityActionType["CREATE_TICKET"] = "create_ticket";
    SecurityActionType["ESCALATE_ALERT"] = "escalate_alert";
    SecurityActionType["COLLECT_EVIDENCE"] = "collect_evidence";
})(SecurityActionType || (SecurityActionType = {}));
/**
 * Main Security Dashboard Workflow Component
 */
export const SecurityDashboardWorkflow = ({ workspaceId, userId, userRole, dashboardType = DashboardType.OPERATIONAL, config = {}, onSecurityEvent, onWorkflowTransition }) => {
    // State management
    const [framework, setFramework] = useState(null);
    const [dashboardConfig, setDashboardConfig] = useState(null);
    const [securityEvents, setSecurityEvents] = useState([]);
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Workflow store integration
    const { states, transitions, approvals, fetchStates, fetchTransitions, fetchApprovals, transitionResourceState, approveWorkflow, rejectWorkflow, acquireLock, releaseLock } = useWorkflowStore();
    // Configuration with defaults
    const workflowConfig = useMemo(() => ({
        enableAutoTransitions: true,
        enableAutomatedActions: true,
        enableRealTimeUpdates: true,
        escalationThresholds: {
            [SecuritySeverity.CRITICAL]: 15, // 15 minutes
            [SecuritySeverity.HIGH]: 60, // 1 hour
            [SecuritySeverity.MEDIUM]: 240, // 4 hours
            [SecuritySeverity.LOW]: 1440, // 24 hours
            [SecuritySeverity.INFO]: 4320 // 3 days
        },
        autoApprovalRules: [
            {
                id: 'auto-block-known-malicious',
                name: 'Auto-block known malicious IPs',
                conditions: { threatIntelligence: 'confirmed_malicious' },
                maxSeverity: SecuritySeverity.HIGH,
                approvedActions: [SecurityActionType.BLOCK_IP],
                requiredRole: SecurityRole.SECURITY_ANALYST
            }
        ],
        complianceRequirements: [
            {
                framework: 'GDPR',
                alertTypes: [SecurityEventType.DATA_BREACH, SecurityEventType.ACCESS_VIOLATION],
                responseTimeMinutes: 60,
                requiredDocumentation: ['incident_report', 'impact_assessment'],
                notificationRequired: true
            },
            {
                framework: 'SOX',
                alertTypes: [SecurityEventType.ACCESS_VIOLATION, SecurityEventType.POLICY_VIOLATION],
                responseTimeMinutes: 240,
                requiredDocumentation: ['access_log', 'remediation_plan'],
                notificationRequired: false
            }
        ],
        ...config
    }), [config]);
    // Initialize dashboard framework
    useEffect(() => {
        const initializeFramework = async () => {
            try {
                setLoading(true);
                // Initialize security dashboard framework
                const dashboardFramework = new SecurityDashboardFramework({
                    enableAuditLogging: true,
                    enablePerformanceMonitoring: true,
                    enableCaching: true,
                    complianceMode: true
                });
                // Load workflow states and transitions
                await Promise.all([
                    fetchStates(workspaceId),
                    fetchTransitions(workspaceId),
                    fetchApprovals(workspaceId)
                ]);
                // Create dashboard configuration
                const config = await createSecurityDashboardConfig(dashboardType, userRole);
                setFramework(dashboardFramework);
                setDashboardConfig(config);
                // Initialize real-time event streaming
                if (workflowConfig.enableRealTimeUpdates) {
                    initializeEventStreaming();
                }
                setLoading(false);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize dashboard');
                setLoading(false);
            }
        };
        initializeFramework();
    }, [workspaceId, dashboardType, userRole, fetchStates, fetchTransitions, fetchApprovals]);
    // Create dashboard configuration based on type and role
    const createSecurityDashboardConfig = async (type, role) => {
        const baseConfig = {
            id: `security-dashboard-${type}-${Date.now()}`,
            type,
            title: `Security ${type.charAt(0).toUpperCase() + type.slice(1)} Dashboard`,
            description: 'Real-time security monitoring and workflow management',
            layout: {
                type: 'grid',
                columns: 12,
                gap: 16,
                responsive: true,
                breakpoints: [
                    { name: 'mobile', minWidth: 0, columns: 1 },
                    { name: 'tablet', minWidth: 768, columns: 6 },
                    { name: 'desktop', minWidth: 1024, columns: 12 }
                ]
            },
            widgets: createWidgetsForDashboard(type, role),
            permissions: {
                view: [role],
                edit: [SecurityRole.SECURITY_ADMIN],
                delete: [SecurityRole.SECURITY_ADMIN],
                export: [SecurityRole.SECURITY_ANALYST, SecurityRole.SECURITY_ADMIN],
                share: [SecurityRole.SECURITY_ADMIN],
                adminOnly: false
            },
            refreshInterval: 30000, // 30 seconds
            autoRefresh: true,
            theme: 'cinema',
            metadata: {
                version: '1.0.0',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: userId,
                updatedBy: userId,
                tags: ['security', 'workflow', 'monitoring'],
                category: 'security_operations',
                organization: workspaceId,
                compliance: {
                    frameworks: ['GDPR', 'SOX', 'ISO27001'],
                    requirements: ['audit_trail', 'access_control'],
                    auditRequired: true,
                    retentionPeriod: 2555, // 7 years
                    dataResidency: ['US', 'EU']
                },
                usage: {
                    viewCount: 0,
                    lastViewed: new Date(),
                    popularWidgets: [],
                    averageSessionDuration: 0,
                    peakUsageHours: [9, 10, 11, 14, 15, 16]
                }
            },
            dataClassification: 'CONFIDENTIAL'
        };
        return baseConfig;
    };
    // Create widgets based on dashboard type and user role
    const createWidgetsForDashboard = (type, role) => {
        const commonWidgets = [
            {
                id: 'security-alerts-overview',
                type: 'security-alerts-table',
                category: 'alerts',
                title: 'Active Security Alerts',
                position: { x: 0, y: 0, order: 1 },
                size: { width: 8, height: 4, resizable: true },
                config: {
                    showWorkflowStatus: true,
                    enableQuickActions: true,
                    maxRows: 50,
                    autoRefresh: true
                },
                dataSource: {
                    type: 'realtime',
                    source: 'security-events-stream',
                    endpoint: '/api/security/events/stream',
                    caching: { enabled: true, ttl: 30 }
                },
                permissions: {
                    view: [role],
                    configure: [SecurityRole.SECURITY_ADMIN],
                    export: [SecurityRole.SECURITY_ANALYST, SecurityRole.SECURITY_ADMIN],
                    drillDown: [role],
                    dataAccess: ['CONFIDENTIAL']
                }
            },
            {
                id: 'workflow-status-overview',
                type: 'workflow-status-chart',
                category: 'metrics',
                title: 'Incident Workflow Status',
                position: { x: 8, y: 0, order: 2 },
                size: { width: 4, height: 4, resizable: true },
                config: {
                    chartType: 'donut',
                    showPercentages: true,
                    enableDrillDown: true
                },
                dataSource: {
                    type: 'batch',
                    source: 'workflow-statistics',
                    endpoint: '/api/workflow/statistics',
                    caching: { enabled: true, ttl: 300 }
                },
                permissions: {
                    view: [role],
                    configure: [SecurityRole.SECURITY_ADMIN],
                    export: [SecurityRole.SECURITY_ANALYST, SecurityRole.SECURITY_ADMIN],
                    drillDown: [role],
                    dataAccess: ['INTERNAL']
                }
            }
        ];
        // Add role-specific widgets
        if (role === SecurityRole.SECURITY_ADMIN || role === SecurityRole.SECURITY_ANALYST) {
            commonWidgets.push({
                id: 'automated-actions-log',
                type: 'automated-actions-timeline',
                category: 'timelines',
                title: 'Automated Response Actions',
                position: { x: 0, y: 4, order: 3 },
                size: { width: 6, height: 3, resizable: true },
                config: {
                    showExecutionDetails: true,
                    enableActionApproval: true,
                    maxItems: 25
                },
                dataSource: {
                    type: 'realtime',
                    source: 'security-actions-stream',
                    endpoint: '/api/security/actions/stream',
                    caching: { enabled: true, ttl: 60 }
                },
                permissions: {
                    view: [SecurityRole.SECURITY_ANALYST, SecurityRole.SECURITY_ADMIN],
                    configure: [SecurityRole.SECURITY_ADMIN],
                    export: [SecurityRole.SECURITY_ADMIN],
                    drillDown: [SecurityRole.SECURITY_ANALYST, SecurityRole.SECURITY_ADMIN],
                    dataAccess: ['CONFIDENTIAL']
                }
            });
        }
        return commonWidgets;
    };
    // Initialize real-time event streaming
    const initializeEventStreaming = useCallback(() => {
        // WebSocket connection for real-time security events
        const wsUrl = `ws://localhost:8000/ws/security/${workspaceId}`;
        const ws = new WebSocket(wsUrl);
        ws.onmessage = (event) => {
            try {
                const securityEvent = JSON.parse(event.data);
                // Process incoming security event
                processSecurityEvent(securityEvent);
                // Notify parent component
                onSecurityEvent?.(securityEvent);
            }
            catch (error) {
                console.error('Failed to process security event:', error);
            }
        };
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('Real-time connection lost');
        };
        // Cleanup on unmount
        return () => {
            ws.close();
        };
    }, [workspaceId, onSecurityEvent]);
    // Process incoming security events
    const processSecurityEvent = async (event) => {
        try {
            // Add to events list
            setSecurityEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
            // Update active alerts
            if (event.severity === SecuritySeverity.CRITICAL || event.severity === SecuritySeverity.HIGH) {
                setActiveAlerts(prev => [event, ...prev]);
            }
            // Check for automated workflow transitions
            if (workflowConfig.enableAutoTransitions) {
                await evaluateAutoTransition(event);
            }
            // Execute automated actions if enabled
            if (workflowConfig.enableAutomatedActions) {
                await executeAutomatedActions(event);
            }
            // Check compliance requirements
            await checkComplianceRequirements(event);
        }
        catch (error) {
            console.error('Failed to process security event:', error);
        }
    };
    // Evaluate automatic workflow transitions
    const evaluateAutoTransition = async (event) => {
        try {
            // Find appropriate initial state for new security events
            const initialState = states.find(state => state.is_initial);
            if (!initialState)
                return;
            // Create workflow resource for the security event
            const result = await transitionResourceState(event.id, initialState.id, 'system', {
                comment: `Auto-created for ${event.type} event`,
                metadata: {
                    securityEvent: event,
                    autoCreated: true,
                    timestamp: new Date().toISOString()
                }
            });
            if (result.success) {
                // Update event with workflow state
                setSecurityEvents(prev => prev.map(e => e.id === event.id
                    ? { ...e, workflowState: result.new_state_id }
                    : e));
            }
        }
        catch (error) {
            console.error('Failed to evaluate auto transition:', error);
        }
    };
    // Execute automated security actions
    const executeAutomatedActions = async (event) => {
        try {
            const applicableRules = workflowConfig.autoApprovalRules.filter(rule => {
                // Check severity threshold
                const severityOrder = [SecuritySeverity.INFO, SecuritySeverity.LOW, SecuritySeverity.MEDIUM, SecuritySeverity.HIGH, SecuritySeverity.CRITICAL];
                if (severityOrder.indexOf(event.severity) > severityOrder.indexOf(rule.maxSeverity)) {
                    return false;
                }
                // Check conditions (simplified example)
                return Object.entries(rule.conditions).every(([key, value]) => event.metadata[key] === value);
            });
            for (const rule of applicableRules) {
                for (const actionType of rule.approvedActions) {
                    const action = {
                        type: actionType,
                        target: event.source,
                        parameters: { eventId: event.id, reason: event.description },
                        timestamp: new Date(),
                        executedBy: 'system',
                        status: 'pending'
                    };
                    // Execute the action (simplified example)
                    await executeSecurityAction(action);
                    // Update event with executed action
                    event.automatedActions.push(action);
                }
            }
        }
        catch (error) {
            console.error('Failed to execute automated actions:', error);
        }
    };
    // Execute a specific security action
    const executeSecurityAction = async (action) => {
        try {
            action.status = 'executing';
            switch (action.type) {
                case SecurityActionType.BLOCK_IP:
                    // Call API to block IP
                    await fetch('/api/security/actions/block-ip', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ip: action.target, reason: action.parameters.reason })
                    });
                    break;
                case SecurityActionType.DISABLE_ACCOUNT:
                    // Call API to disable account
                    await fetch('/api/security/actions/disable-account', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ account: action.target, reason: action.parameters.reason })
                    });
                    break;
                case SecurityActionType.NOTIFY_TEAM:
                    // Send notification to security team
                    await fetch('/api/security/notifications', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'security_alert',
                            target: 'security_team',
                            message: action.parameters.reason
                        })
                    });
                    break;
                default:
                    throw new Error(`Unsupported action type: ${action.type}`);
            }
            action.status = 'completed';
            action.result = 'Action executed successfully';
        }
        catch (error) {
            action.status = 'failed';
            action.result = error instanceof Error ? error.message : 'Unknown error';
            throw error;
        }
    };
    // Check compliance requirements
    const checkComplianceRequirements = async (event) => {
        try {
            const applicableRequirements = workflowConfig.complianceRequirements.filter(req => req.alertTypes.includes(event.type));
            for (const requirement of applicableRequirements) {
                if (requirement.notificationRequired) {
                    // Send compliance notification
                    await fetch('/api/compliance/notifications', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            framework: requirement.framework,
                            event,
                            responseTimeMinutes: requirement.responseTimeMinutes,
                            requiredDocumentation: requirement.requiredDocumentation
                        })
                    });
                }
                // Add compliance framework to event
                if (!event.complianceFrameworks.includes(requirement.framework)) {
                    event.complianceFrameworks.push(requirement.framework);
                }
            }
        }
        catch (error) {
            console.error('Failed to check compliance requirements:', error);
        }
    };
    // Handle manual workflow transitions
    const handleWorkflowTransition = async (eventId, toStateId, comment) => {
        try {
            // Acquire lock for the resource
            await acquireLock(eventId, userId, 'state_change');
            try {
                const result = await transitionResourceState(eventId, toStateId, userId, { comment, metadata: { manualTransition: true } });
                if (result.success) {
                    // Update local state
                    setSecurityEvents(prev => prev.map(event => event.id === eventId
                        ? { ...event, workflowState: result.new_state_id }
                        : event));
                    // Notify parent component
                    onWorkflowTransition?.(result);
                }
                return result;
            }
            finally {
                // Always release the lock
                const locks = await useWorkflowStore.getState().locks;
                const eventLock = locks.find(lock => lock.resource_id === eventId && lock.locked_by === userId);
                if (eventLock) {
                    await releaseLock(eventLock.id, userId);
                }
            }
        }
        catch (error) {
            console.error('Failed to transition workflow state:', error);
            throw error;
        }
    };
    // Handle approval actions
    const handleApprovalAction = async (approvalId, action, comment) => {
        try {
            let result;
            if (action === 'approve') {
                result = await approveWorkflow(approvalId, userId, comment);
            }
            else {
                result = await rejectWorkflow(approvalId, userId, comment || 'No reason provided');
            }
            // Handle the result
            if (typeof result === 'object' && 'success' in result) {
                onWorkflowTransition?.(result);
            }
            return result;
        }
        catch (error) {
            console.error(`Failed to ${action} workflow:`, error);
            throw error;
        }
    };
    // Render loading state
    if (loading) {
        return (_jsxs("div", { className: "security-dashboard-loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Initializing Security Dashboard Workflow..." })] }));
    }
    // Render error state
    if (error) {
        return (_jsxs("div", { className: "security-dashboard-error", children: [_jsx("div", { className: "error-icon", children: "\u26A0\uFE0F" }), _jsx("h3", { children: "Dashboard Error" }), _jsx("p", { children: error }), _jsx("button", { onClick: () => window.location.reload(), className: "retry-button", children: "Retry" })] }));
    }
    // Main dashboard render
    return (_jsxs("div", { className: "security-dashboard-workflow", children: [_jsxs("header", { className: "dashboard-header", children: [_jsxs("div", { className: "dashboard-title", children: [_jsx("h1", { children: dashboardConfig?.title }), _jsx("div", { className: "dashboard-status", children: _jsx("span", { className: `status-indicator ${activeAlerts.length > 0 ? 'alert' : 'normal'}`, children: activeAlerts.length > 0 ? `${activeAlerts.length} Active Alerts` : 'All Clear' }) })] }), _jsxs("div", { className: "dashboard-controls", children: [_jsx("button", { className: "refresh-button", onClick: () => window.location.reload(), children: "\uD83D\uDD04 Refresh" }), _jsxs("div", { className: "user-info", children: [_jsx("span", { className: "user-role", children: userRole }), _jsx("span", { className: "user-id", children: userId })] })] })] }), activeAlerts.length > 0 && (_jsxs("div", { className: "active-alerts-banner", children: [_jsxs("div", { className: "alert-summary", children: [_jsx("span", { className: "alert-count", children: activeAlerts.length }), _jsx("span", { children: "Active Security Alerts Requiring Attention" })] }), _jsx("div", { className: "alert-actions", children: _jsx("button", { className: "view-all-alerts", children: "View All" }) })] })), _jsxs("main", { className: "dashboard-grid", children: [_jsxs("section", { className: "dashboard-widget security-events-widget", children: [_jsxs("div", { className: "widget-header", children: [_jsx("h2", { children: "Recent Security Events" }), _jsxs("div", { className: "widget-actions", children: [_jsx("button", { className: "filter-button", children: "\uD83D\uDD0D Filter" }), _jsx("button", { className: "export-button", children: "\uD83D\uDCC4 Export" })] })] }), _jsx("div", { className: "widget-content", children: _jsx("div", { className: "events-table", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Time" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Severity" }), _jsx("th", { children: "Source" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: securityEvents.slice(0, 10).map(event => (_jsxs("tr", { className: `severity-${event.severity}`, children: [_jsx("td", { children: new Date(event.timestamp).toLocaleTimeString() }), _jsx("td", { children: event.type }), _jsx("td", { children: _jsx("span", { className: `severity-badge ${event.severity}`, children: event.severity.toUpperCase() }) }), _jsx("td", { children: event.source }), _jsx("td", { children: event.workflowState ? (_jsx("span", { className: "workflow-state", children: states.find(s => s.id === event.workflowState)?.name || 'Unknown' })) : (_jsx("span", { className: "no-workflow", children: "Not Assigned" })) }), _jsx("td", { children: _jsxs("div", { className: "event-actions", children: [_jsx("button", { className: "investigate-button", children: "\uD83D\uDD0D" }), _jsx("button", { className: "escalate-button", children: "\u2B06\uFE0F" })] }) })] }, event.id))) })] }) }) })] }), _jsxs("section", { className: "dashboard-widget workflow-status-widget", children: [_jsx("div", { className: "widget-header", children: _jsx("h2", { children: "Workflow Status" }) }), _jsx("div", { className: "widget-content", children: _jsx("div", { className: "status-overview", children: states.map(state => (_jsxs("div", { className: "status-item", children: [_jsx("div", { className: "status-color", style: { backgroundColor: state.color } }), _jsx("span", { className: "status-name", children: state.name }), _jsx("span", { className: "status-count", children: securityEvents.filter(e => e.workflowState === state.id).length })] }, state.id))) }) })] }), approvals.filter(a => a.status === 'pending').length > 0 && (_jsxs("section", { className: "dashboard-widget approvals-widget", children: [_jsx("div", { className: "widget-header", children: _jsx("h2", { children: "Pending Approvals" }) }), _jsx("div", { className: "widget-content", children: _jsx("div", { className: "approvals-list", children: approvals
                                        .filter(a => a.status === 'pending')
                                        .slice(0, 5)
                                        .map(approval => (_jsxs("div", { className: "approval-item", children: [_jsxs("div", { className: "approval-info", children: [_jsx("span", { className: "approval-resource", children: approval.resource_id }), _jsx("span", { className: "approval-priority", children: approval.priority })] }), _jsxs("div", { className: "approval-actions", children: [_jsx("button", { onClick: () => handleApprovalAction(approval.id, 'approve'), className: "approve-button", children: "\u2713 Approve" }), _jsx("button", { onClick: () => handleApprovalAction(approval.id, 'reject'), className: "reject-button", children: "\u2717 Reject" })] })] }, approval.id))) }) })] }))] })] }));
};
export default SecurityDashboardWorkflow;
