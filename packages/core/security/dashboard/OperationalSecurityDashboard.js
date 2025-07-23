import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Operational Security Dashboard
 * Task T-1752989143998-124: Design security dashboard framework
 *
 * Real-time operational security dashboard for SOC analysts and security teams,
 * providing detailed threat monitoring, incident management, and response
 * coordination capabilities for day-to-day security operations.
 *
 * Features:
 * - Real-time threat monitoring and alerting
 * - Active incident queue management
 * - Security tool integration status
 * - Response team coordination
 * - Alert triage and investigation workflows
 * - Performance metrics and SLA tracking
 *
 * Target Users:
 * - SOC Analysts (Level 1, 2, 3)
 * - Incident Responders
 * - Security Engineers
 * - Security Operations Manager
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardTheme } from './SecurityDashboardFramework';
/**
 * Operational Security Dashboard Component
 */
export const OperationalSecurityDashboard = ({ alerts, metrics, systemStatus, threatIntel, theme = DashboardTheme.DARK, refreshInterval = 30, maxAlertsDisplayed = 50, enableRealTimeUpdates = true, onAlertAction, onSystemIssue }) => {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [isConnected, setIsConnected] = useState(true);
    // Theme configuration
    const themeStyles = useMemo(() => {
        const themes = {
            light: {
                background: '#ffffff',
                surface: '#f8fafc',
                border: '#e2e8f0',
                text: '#1e293b',
                textSecondary: '#64748b',
                primary: '#3b82f6',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                critical: '#dc2626'
            },
            dark: {
                background: '#0f172a',
                surface: '#1e293b',
                border: '#334155',
                text: '#f1f5f9',
                textSecondary: '#cbd5e1',
                primary: '#60a5fa',
                success: '#34d399',
                warning: '#fbbf24',
                error: '#f87171',
                critical: '#ef4444'
            },
            cinema: {
                background: '#0a0a0a',
                surface: '#1a1a1a',
                border: '#333333',
                text: '#f5f5f5',
                textSecondary: '#d4d4d4',
                primary: '#fbbf24',
                success: '#22d3ee',
                warning: '#f59e0b',
                error: '#ef4444',
                critical: '#dc2626'
            }
        };
        return themes[theme] || themes.dark;
    }, [theme]);
    // Auto-refresh logic
    useEffect(() => {
        if (enableRealTimeUpdates && refreshInterval > 0) {
            const interval = setInterval(() => {
                setLastUpdate(new Date());
                // Simulate connection check
                setIsConnected(Math.random() > 0.05); // 95% uptime simulation
            }, refreshInterval * 1000);
            return () => clearInterval(interval);
        }
    }, [enableRealTimeUpdates, refreshInterval]);
    // Filter alerts based on selected filter
    const filteredAlerts = useMemo(() => {
        let filtered = alerts;
        switch (selectedFilter) {
            case 'critical':
                filtered = alerts.filter(alert => alert.severity === 'critical');
                break;
            case 'high':
                filtered = alerts.filter(alert => alert.severity === 'high' || alert.severity === 'critical');
                break;
            case 'new':
                filtered = alerts.filter(alert => alert.status === 'new');
                break;
            default:
                filtered = alerts;
        }
        return filtered
            .sort((a, b) => {
            // Sort by severity first, then timestamp
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            if (severityOrder[a.severity] !== severityOrder[b.severity]) {
                return severityOrder[b.severity] - severityOrder[a.severity];
            }
            return b.timestamp.getTime() - a.timestamp.getTime();
        })
            .slice(0, maxAlertsDisplayed);
    }, [alerts, selectedFilter, maxAlertsDisplayed]);
    // Get severity color
    const getSeverityColor = useCallback((severity) => {
        switch (severity) {
            case 'critical': return themeStyles.critical;
            case 'high': return themeStyles.error;
            case 'medium': return themeStyles.warning;
            case 'low': return themeStyles.success;
            default: return themeStyles.textSecondary;
        }
    }, [themeStyles]);
    // Get status color
    const getStatusColor = useCallback((status) => {
        switch (status) {
            case 'operational': return themeStyles.success;
            case 'degraded': return themeStyles.warning;
            case 'outage': return themeStyles.critical;
            case 'maintenance': return themeStyles.primary;
            default: return themeStyles.textSecondary;
        }
    }, [themeStyles]);
    // Handle alert action
    const handleAlertAction = useCallback((alertId, action) => {
        onAlertAction?.(alertId, action);
    }, [onAlertAction]);
    // Render metric card
    const renderMetricCard = (title, value, subtitle, color, onClick) => (_jsxs("div", { onClick: onClick, style: {
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`,
            borderRadius: '8px',
            padding: '16px',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            borderLeft: color ? `4px solid ${color}` : undefined
        }, children: [_jsx("div", { style: {
                    fontSize: '12px',
                    fontWeight: 600,
                    color: themeStyles.textSecondary,
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                }, children: title }), _jsx("div", { style: {
                    fontSize: '24px',
                    fontWeight: 700,
                    color: color || themeStyles.text,
                    marginBottom: subtitle ? '4px' : '0'
                }, children: value }), subtitle && (_jsx("div", { style: {
                    fontSize: '11px',
                    color: themeStyles.textSecondary
                }, children: subtitle }))] }));
    // Render alert item
    const renderAlertItem = (alert) => (_jsxs("div", { onClick: () => setSelectedAlert(alert), style: {
            background: themeStyles.surface,
            border: `1px solid ${themeStyles.border}`,
            borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                }, children: [_jsx("div", { style: {
                            fontSize: '14px',
                            fontWeight: 600,
                            color: themeStyles.text,
                            flex: 1
                        }, children: alert.title }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("span", { style: {
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    background: `${getSeverityColor(alert.severity)}20`,
                                    color: getSeverityColor(alert.severity),
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    textTransform: 'uppercase'
                                }, children: alert.severity }), _jsx("span", { style: {
                                    fontSize: '11px',
                                    color: themeStyles.textSecondary
                                }, children: alert.timestamp.toLocaleTimeString() })] })] }), _jsx("div", { style: {
                    fontSize: '12px',
                    color: themeStyles.textSecondary,
                    marginBottom: '8px',
                    lineHeight: 1.4
                }, children: alert.description }), _jsxs("div", { style: {
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    fontSize: '11px',
                    color: themeStyles.textSecondary
                }, children: [_jsxs("span", { children: ["Source: ", alert.source] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Assets: ", alert.affectedAssets.length] }), alert.assignee && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Assigned: ", alert.assignee] })] }))] })] }, alert.id));
    return (_jsxs("div", { style: {
            background: themeStyles.background,
            color: themeStyles.text,
            minHeight: '100vh',
            fontFamily: 'Inter, system-ui, sans-serif'
        }, children: [_jsx("div", { style: {
                    background: themeStyles.surface,
                    borderBottom: `1px solid ${themeStyles.border}`,
                    padding: '16px 24px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }, children: _jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }, children: [_jsxs("div", { children: [_jsx("h1", { style: {
                                        margin: '0 0 4px 0',
                                        fontSize: '20px',
                                        fontWeight: 700,
                                        color: themeStyles.text
                                    }, children: "\uD83D\uDEE1\uFE0F Security Operations Center" }), _jsx("p", { style: {
                                        margin: '0',
                                        fontSize: '14px',
                                        color: themeStyles.textSecondary
                                    }, children: "Real-time threat monitoring and incident response" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '16px' }, children: [_jsxs("div", { style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 12px',
                                        background: isConnected ? themeStyles.success + '20' : themeStyles.error + '20',
                                        color: isConnected ? themeStyles.success : themeStyles.error,
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 600
                                    }, children: [_jsx("div", { style: {
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: isConnected ? themeStyles.success : themeStyles.error
                                            } }), isConnected ? 'LIVE' : 'DISCONNECTED'] }), _jsxs("div", { style: {
                                        fontSize: '12px',
                                        color: themeStyles.textSecondary
                                    }, children: ["Last update: ", lastUpdate.toLocaleTimeString()] })] })] }) }), _jsxs("div", { style: { padding: '24px' }, children: [_jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            marginBottom: '24px'
                        }, children: [renderMetricCard('Active Alerts', metrics.alerts.total, `${metrics.alerts.newLast24h} new in 24h`, metrics.alerts.total > 100 ? themeStyles.error : themeStyles.primary), renderMetricCard('Active Incidents', metrics.incidents.active, `${metrics.incidents.escalated} escalated`, metrics.incidents.active > 10 ? themeStyles.warning : themeStyles.success), renderMetricCard('System Health', `${metrics.system.overallHealth}%`, `${metrics.system.componentsOperational}/${metrics.system.totalComponents} operational`, metrics.system.overallHealth < 95 ? themeStyles.error : themeStyles.success), renderMetricCard('Team Status', `${metrics.team.onlineAnalysts}/${metrics.team.totalAnalysts}`, `Workload: ${metrics.team.workload}`, metrics.team.workload === 'critical' ? themeStyles.critical : themeStyles.primary), renderMetricCard('Response Time', `${Math.round(metrics.alerts.avgResponseTime)}m`, `SLA: ${metrics.alerts.slaCompliance}%`, metrics.alerts.slaCompliance < 95 ? themeStyles.warning : themeStyles.success)] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr',
                            gap: '24px',
                            height: 'calc(100vh - 300px)'
                        }, children: [_jsxs("div", { style: {
                                    background: themeStyles.surface,
                                    border: `1px solid ${themeStyles.border}`,
                                    borderRadius: '8px',
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }, children: [_jsxs("div", { style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '16px'
                                        }, children: [_jsxs("h3", { style: {
                                                    margin: 0,
                                                    fontSize: '16px',
                                                    fontWeight: 600,
                                                    color: themeStyles.text
                                                }, children: ["\uD83D\uDEA8 Alert Queue (", filteredAlerts.length, ")"] }), _jsx("div", { style: { display: 'flex', gap: '8px' }, children: ['all', 'new', 'high', 'critical'].map(filter => (_jsx("button", { onClick: () => setSelectedFilter(filter), style: {
                                                        padding: '4px 12px',
                                                        background: selectedFilter === filter ? themeStyles.primary : 'transparent',
                                                        color: selectedFilter === filter ? themeStyles.background : themeStyles.textSecondary,
                                                        border: `1px solid ${selectedFilter === filter ? themeStyles.primary : themeStyles.border}`,
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        textTransform: 'capitalize'
                                                    }, children: filter }, filter))) })] }), _jsx("div", { style: {
                                            flex: 1,
                                            overflowY: 'auto',
                                            paddingRight: '8px'
                                        }, children: filteredAlerts.length === 0 ? (_jsxs("div", { style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '100%',
                                                color: themeStyles.textSecondary
                                            }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\u2705" }), _jsx("div", { children: "No alerts matching current filter" })] })) : (filteredAlerts.map(renderAlertItem)) })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { style: {
                                            background: themeStyles.surface,
                                            border: `1px solid ${themeStyles.border}`,
                                            borderRadius: '8px',
                                            padding: '16px'
                                        }, children: [_jsx("h3", { style: {
                                                    margin: '0 0 12px 0',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: themeStyles.text
                                                }, children: "\u2699\uFE0F System Status" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: systemStatus.slice(0, 6).map(system => (_jsxs("div", { style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '8px',
                                                        background: themeStyles.background,
                                                        borderRadius: '4px',
                                                        fontSize: '12px'
                                                    }, children: [_jsx("span", { style: { color: themeStyles.text }, children: system.component }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [system.responseTime && (_jsxs("span", { style: { color: themeStyles.textSecondary }, children: [system.responseTime, "ms"] })), _jsx("div", { style: {
                                                                        width: '8px',
                                                                        height: '8px',
                                                                        borderRadius: '50%',
                                                                        background: getStatusColor(system.status)
                                                                    } })] })] }, system.component))) })] }), _jsxs("div", { style: {
                                            background: themeStyles.surface,
                                            border: `1px solid ${themeStyles.border}`,
                                            borderRadius: '8px',
                                            padding: '16px'
                                        }, children: [_jsx("h3", { style: {
                                                    margin: '0 0 12px 0',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: themeStyles.text
                                                }, children: "\uD83D\uDD0D Threat Intelligence" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: threatIntel.slice(0, 3).map(intel => (_jsxs("div", { style: {
                                                        padding: '8px',
                                                        background: themeStyles.background,
                                                        borderRadius: '4px'
                                                    }, children: [_jsxs("div", { style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '4px'
                                                            }, children: [_jsx("span", { style: { fontSize: '12px', fontWeight: 600, color: themeStyles.text }, children: intel.feed }), _jsx("span", { style: {
                                                                        fontSize: '10px',
                                                                        padding: '2px 6px',
                                                                        background: intel.confidence === 'high' ? themeStyles.success + '20' :
                                                                            intel.confidence === 'medium' ? themeStyles.warning + '20' :
                                                                                themeStyles.error + '20',
                                                                        color: intel.confidence === 'high' ? themeStyles.success :
                                                                            intel.confidence === 'medium' ? themeStyles.warning :
                                                                                themeStyles.error,
                                                                        borderRadius: '4px',
                                                                        textTransform: 'uppercase'
                                                                    }, children: intel.confidence })] }), _jsxs("div", { style: {
                                                                fontSize: '11px',
                                                                color: themeStyles.textSecondary,
                                                                display: 'flex',
                                                                gap: '8px'
                                                            }, children: [_jsxs("span", { children: ["New: ", intel.newIndicators] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Active: ", intel.activeThreats] })] })] }, intel.feed))) })] })] })] })] }), selectedAlert && (_jsx("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }, children: _jsxs("div", { style: {
                        background: themeStyles.background,
                        border: `1px solid ${themeStyles.border}`,
                        borderRadius: '8px',
                        padding: '24px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '16px'
                            }, children: [_jsx("h3", { style: {
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        color: themeStyles.text
                                    }, children: "Alert Details" }), _jsx("button", { onClick: () => setSelectedAlert(null), style: {
                                        background: 'transparent',
                                        border: 'none',
                                        color: themeStyles.textSecondary,
                                        fontSize: '20px',
                                        cursor: 'pointer'
                                    }, children: "\u00D7" })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("h4", { style: {
                                        margin: '0 0 8px 0',
                                        fontSize: '16px',
                                        color: getSeverityColor(selectedAlert.severity)
                                    }, children: selectedAlert.title }), _jsx("p", { style: {
                                        margin: '0 0 12px 0',
                                        color: themeStyles.textSecondary,
                                        lineHeight: 1.5
                                    }, children: selectedAlert.description })] }), _jsxs("div", { style: { display: 'flex', gap: '16px', marginTop: '16px' }, children: [_jsx("button", { onClick: () => {
                                        handleAlertAction(selectedAlert.id, 'acknowledge');
                                        setSelectedAlert(null);
                                    }, style: {
                                        background: themeStyles.primary,
                                        color: themeStyles.background,
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }, children: "Acknowledge" }), _jsx("button", { onClick: () => {
                                        handleAlertAction(selectedAlert.id, 'escalate');
                                        setSelectedAlert(null);
                                    }, style: {
                                        background: themeStyles.warning,
                                        color: themeStyles.background,
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }, children: "Escalate" }), _jsx("button", { onClick: () => {
                                        handleAlertAction(selectedAlert.id, 'false_positive');
                                        setSelectedAlert(null);
                                    }, style: {
                                        background: 'transparent',
                                        color: themeStyles.textSecondary,
                                        border: `1px solid ${themeStyles.border}`,
                                        borderRadius: '4px',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }, children: "Mark False Positive" })] })] }) }))] }));
};
export default OperationalSecurityDashboard;
