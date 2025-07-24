import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Monitoring Dashboard
 * Epic 17.4.2 - Monitoring Dashboard
 * Task: E17-1753114397070-5493E0
 *
 * Complete monitoring dashboard that integrates all monitoring interfaces
 * with configurable layouts, role-based access, and real-time updates.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { MonitoringWidget } from './MonitoringWidgets.js';
// Predefined Dashboard Layouts
const DASHBOARD_LAYOUTS = [
    {
        id: 'executive',
        name: 'Executive Dashboard',
        description: 'High-level overview for executives and managers',
        roles: ['admin', 'executive', 'manager'],
        refreshInterval: 60000,
        widgets: [
            {
                id: 'system-health',
                title: 'System Health Score',
                type: 'metric',
                size: 'medium',
                requiredPermissions: ['admin', 'executive', 'manager'],
                dataSource: '/api/monitoring/health/overview'
            },
            {
                id: 'key-metrics',
                title: 'Key Performance Indicators',
                type: 'metric',
                size: 'medium',
                requiredPermissions: ['admin', 'executive', 'manager'],
                dataSource: '/api/monitoring/metrics/kpi'
            },
            {
                id: 'security-overview',
                title: 'Security Status',
                type: 'status',
                size: 'medium',
                requiredPermissions: ['admin', 'executive', 'manager'],
                dataSource: '/api/monitoring/security/overview'
            },
            {
                id: 'alert-summary',
                title: 'Alert Summary',
                type: 'list',
                size: 'medium',
                requiredPermissions: ['admin', 'executive', 'manager'],
                dataSource: '/api/monitoring/alerts/summary'
            }
        ]
    },
    {
        id: 'operational',
        name: 'Operations Dashboard',
        description: 'Detailed monitoring for operations teams',
        roles: ['admin', 'operator', 'engineer'],
        refreshInterval: 15000,
        widgets: [
            {
                id: 'resource-usage',
                title: 'Resource Usage',
                type: 'metric',
                size: 'medium',
                requiredPermissions: ['admin', 'operator', 'engineer'],
                dataSource: '/api/monitoring/resources'
            },
            {
                id: 'api-metrics',
                title: 'API Performance',
                type: 'metric',
                size: 'medium',
                requiredPermissions: ['admin', 'operator', 'engineer'],
                dataSource: '/api/monitoring/api/metrics'
            },
            {
                id: 'activity-feed',
                title: 'Real-time Activity',
                type: 'list',
                size: 'large',
                requiredPermissions: ['admin', 'operator', 'engineer'],
                dataSource: '/api/monitoring/activity/realtime'
            },
            {
                id: 'system-health',
                title: 'System Health Details',
                type: 'metric',
                size: 'large',
                requiredPermissions: ['admin', 'operator', 'engineer'],
                dataSource: '/api/monitoring/health/detailed'
            }
        ]
    },
    {
        id: 'security',
        name: 'Security Dashboard',
        description: 'Security monitoring and threat detection',
        roles: ['admin', 'security', 'compliance'],
        refreshInterval: 10000,
        widgets: [
            {
                id: 'security-overview',
                title: 'Security Overview',
                type: 'status',
                size: 'full-width',
                requiredPermissions: ['admin', 'security', 'compliance'],
                dataSource: '/api/monitoring/security/comprehensive'
            },
            {
                id: 'threat-detection',
                title: 'Threat Detection',
                type: 'list',
                size: 'medium',
                requiredPermissions: ['admin', 'security', 'compliance'],
                dataSource: '/api/monitoring/security/threats'
            },
            {
                id: 'compliance-metrics',
                title: 'Compliance Metrics',
                type: 'metric',
                size: 'medium',
                requiredPermissions: ['admin', 'security', 'compliance'],
                dataSource: '/api/monitoring/compliance/metrics'
            }
        ]
    },
    {
        id: 'analytics',
        name: 'Analytics Dashboard',
        description: 'Performance analytics and trends',
        roles: ['admin', 'analyst', 'manager'],
        refreshInterval: 120000,
        widgets: [
            {
                id: 'performance-trends',
                title: 'Performance Trends',
                type: 'chart',
                size: 'full-width',
                requiredPermissions: ['admin', 'analyst', 'manager'],
                dataSource: '/api/monitoring/analytics/trends'
            },
            {
                id: 'usage-analytics',
                title: 'Usage Analytics',
                type: 'chart',
                size: 'large',
                requiredPermissions: ['admin', 'analyst', 'manager'],
                dataSource: '/api/monitoring/analytics/usage'
            },
            {
                id: 'capacity-planning',
                title: 'Capacity Planning',
                type: 'metric',
                size: 'medium',
                requiredPermissions: ['admin', 'analyst', 'manager'],
                dataSource: '/api/monitoring/analytics/capacity'
            }
        ]
    }
];
export const MonitoringDashboard = ({ userRole, userId, initialLayout = 'executive', allowLayoutCustomization = true, onExport, onAlertAction, className = '' }) => {
    // State Management
    const [currentLayoutId, setCurrentLayoutId] = useState(initialLayout);
    const [customLayout, setCustomLayout] = useState(null);
    const [widgetData, setWidgetData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('connected');
    const [refreshCount, setRefreshCount] = useState(0);
    // Get available layouts based on user role
    const availableLayouts = useMemo(() => {
        return DASHBOARD_LAYOUTS.filter(layout => layout.roles.includes(userRole));
    }, [userRole]);
    // Get current layout
    const currentLayout = useMemo(() => {
        if (customLayout)
            return customLayout;
        return availableLayouts.find(layout => layout.id === currentLayoutId) || availableLayouts[0];
    }, [customLayout, currentLayoutId, availableLayouts]);
    // Fetch widget data
    const fetchWidgetData = useCallback(async (widgets) => {
        setConnectionStatus('connected');
        try {
            const dataPromises = widgets.map(async (widget) => {
                try {
                    // Simulate API calls - replace with actual endpoints
                    let data = {};
                    switch (widget.id) {
                        case 'system-health':
                            data = {
                                healthScore: Math.floor(Math.random() * 20) + 80,
                                components: [
                                    { name: 'Database', status: 'healthy' },
                                    { name: 'API Gateway', status: 'healthy' },
                                    { name: 'Cache Layer', status: 'warning' },
                                    { name: 'File Storage', status: 'healthy' }
                                ]
                            };
                            break;
                        case 'resource-usage':
                            data = {
                                resources: {
                                    cpu: Math.random() * 40 + 30,
                                    memory: Math.random() * 30 + 50,
                                    disk: Math.random() * 20 + 60,
                                    network: Math.random() * 25 + 35
                                }
                            };
                            break;
                        case 'api-metrics':
                            data = {
                                api: {
                                    requestsPerSecond: Math.floor(Math.random() * 500) + 200,
                                    averageLatency: Math.floor(Math.random() * 100) + 50,
                                    errorRate: Math.random() * 2 + 0.1,
                                    activeConnections: Math.floor(Math.random() * 1000) + 500
                                }
                            };
                            break;
                        case 'security-overview':
                            data = {
                                security: {
                                    activeThreats: Math.floor(Math.random() * 3),
                                    blockedAttempts: Math.floor(Math.random() * 50) + 10,
                                    complianceScore: Math.floor(Math.random() * 10) + 90,
                                    lastScan: new Date().toISOString(),
                                    threats: [
                                        { type: 'Brute Force', source: '192.168.1.100' },
                                        { type: 'SQL Injection', source: '10.0.0.50' }
                                    ]
                                }
                            };
                            break;
                        case 'activity-feed':
                            data = {
                                activities: [
                                    {
                                        id: 1,
                                        timestamp: new Date(Date.now() - 60000).toISOString(),
                                        type: 'info',
                                        message: 'Health check completed successfully',
                                        source: 'health-monitor'
                                    },
                                    {
                                        id: 2,
                                        timestamp: new Date(Date.now() - 120000).toISOString(),
                                        type: 'warning',
                                        message: 'High memory usage detected',
                                        source: 'resource-monitor'
                                    },
                                    {
                                        id: 3,
                                        timestamp: new Date(Date.now() - 180000).toISOString(),
                                        type: 'success',
                                        message: 'Security scan completed',
                                        source: 'security-scanner'
                                    }
                                ]
                            };
                            break;
                        default:
                            data = {};
                    }
                    return { widgetId: widget.id, data };
                }
                catch (error) {
                    console.warn(`Failed to fetch data for widget ${widget.id}:`, error);
                    return { widgetId: widget.id, data: {} };
                }
            });
            const results = await Promise.all(dataPromises);
            const newWidgetData = {};
            results.forEach(({ widgetId, data }) => {
                newWidgetData[widgetId] = data;
            });
            setWidgetData(newWidgetData);
            setIsLoading(false);
            setRefreshCount(prev => prev + 1);
        }
        catch (error) {
            console.error('Failed to fetch widget data:', error);
            setConnectionStatus('disconnected');
            setIsLoading(false);
        }
    }, []);
    // Auto-refresh effect
    useEffect(() => {
        if (!currentLayout)
            return;
        const refreshData = () => {
            fetchWidgetData(currentLayout.widgets);
        };
        // Initial fetch
        refreshData();
        // Set up refresh interval
        const interval = setInterval(refreshData, currentLayout.refreshInterval);
        return () => clearInterval(interval);
    }, [currentLayout, fetchWidgetData]);
    // Handle widget actions
    const handleWidgetAction = useCallback((widgetId, action, params) => {
        console.log('Widget action:', { widgetId, action, params });
        switch (action) {
            case 'view-details':
                // Navigate to detailed view
                break;
            case 'export':
                onExport?.(action, '24h');
                break;
            default:
                break;
        }
    }, [onExport]);
    // Handle layout change
    const handleLayoutChange = useCallback((layoutId) => {
        setCurrentLayoutId(layoutId);
        setCustomLayout(null);
        setIsLoading(true);
    }, []);
    // Dashboard Header
    const DashboardHeader = () => (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            padding: '20px 24px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }, children: [_jsxs("div", { children: [_jsx("h1", { style: { margin: '0 0 4px 0', fontSize: '24px', fontWeight: '600', color: '#1f2937' }, children: currentLayout?.name || 'Monitoring Dashboard' }), _jsxs("p", { style: { margin: 0, fontSize: '14px', color: '#6b7280' }, children: [currentLayout?.description, " \u2022 Refreshes every ", currentLayout?.refreshInterval ? Math.floor(currentLayout.refreshInterval / 1000) : 60, "s \u2022 Status: ", _jsx("span", { style: {
                                    color: connectionStatus === 'connected' ? '#10b981' : '#ef4444',
                                    fontWeight: '500'
                                }, children: connectionStatus })] })] }), _jsxs("div", { style: { display: 'flex', gap: '12px', alignItems: 'center' }, children: [_jsx("select", { value: currentLayoutId, onChange: (e) => handleLayoutChange(e.target.value), style: {
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: '#FFFFFF',
                            cursor: 'pointer'
                        }, children: availableLayouts.map(layout => (_jsx("option", { value: layout.id, children: layout.name }, layout.id))) }), _jsx("button", { onClick: () => currentLayout && fetchWidgetData(currentLayout.widgets), disabled: isLoading, style: {
                            padding: '8px 12px',
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            color: '#374151'
                        }, children: isLoading ? 'Refreshing...' : '🔄 Refresh' }), _jsx("button", { onClick: () => onExport?.('dashboard', '24h'), style: {
                            padding: '8px 16px',
                            backgroundColor: '#3b82f6',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }, children: "\uD83D\uDCCA Export Report" })] })] }));
    // Loading State
    if (isLoading && Object.keys(widgetData).length === 0) {
        return (_jsxs("div", { className: `monitoring-dashboard loading ${className}`, style: {
                padding: '20px',
                backgroundColor: '#f9fafb',
                minHeight: '100vh'
            }, children: [_jsx(DashboardHeader, {}), _jsx("div", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '400px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                                    width: '40px',
                                    height: '40px',
                                    border: '4px solid #e5e7eb',
                                    borderTopColor: '#3b82f6',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 16px'
                                } }), _jsx("div", { style: { fontSize: '14px', color: '#6b7280' }, children: "Loading dashboard..." })] }) })] }));
    }
    if (!currentLayout) {
        return (_jsx("div", { className: `monitoring-dashboard error ${className}`, style: {
                padding: '20px',
                backgroundColor: '#f9fafb',
                minHeight: '100vh'
            }, children: _jsxs("div", { style: {
                    padding: '40px',
                    textAlign: 'center',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83D\uDEAB" }), _jsx("h2", { style: { margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: '#1f2937' }, children: "Access Denied" }), _jsx("p", { style: { margin: 0, fontSize: '14px', color: '#6b7280' }, children: "You don't have permission to access any monitoring dashboards. Contact your administrator for access." })] }) }));
    }
    return (_jsxs("div", { className: `monitoring-dashboard ${className}`, style: {
            padding: '20px',
            backgroundColor: '#f9fafb',
            minHeight: '100vh'
        }, children: [_jsx(DashboardHeader, {}), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '20px',
                    marginBottom: '20px'
                }, children: currentLayout.widgets.map(widget => (_jsx(MonitoringWidget, { config: widget, userRole: userRole, data: widgetData[widget.id], onAction: handleWidgetAction }, widget.id))) }), _jsxs("div", { style: {
                    padding: '16px 20px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    color: '#6b7280',
                    textAlign: 'center'
                }, children: ["Dashboard refreshed ", refreshCount, " times \u2022 Last update: ", new Date().toLocaleString(), " \u2022 User: ", userId, " (", userRole, ")"] }), _jsx("style", { children: `
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      ` })] }));
};
export default MonitoringDashboard;
