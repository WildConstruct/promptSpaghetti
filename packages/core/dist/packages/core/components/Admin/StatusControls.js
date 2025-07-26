import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Status Controls Component - Epic 17
 *
 * Comprehensive status management interface for system operations,
 * user states, process monitoring, and administrative controls.
 *
 * Task: E17-1753114397016-18BAC3 - Implement status controls
 * Epic: 17 - Backstage Admin Controls
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { PlayCircle, PauseCircle, StopCircle, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Activity, Settings, Users, Server, Cpu, Memory, Eye, Pause, Play, RotateCcw } from 'lucide-react';
const SERVICE_STATUS_CONFIG = {
    running: {
        color: 'text-green-600 bg-green-100',
        icon: CheckCircle,
        actions: ['stop', 'restart', 'pause']
    },
    stopped: {
        color: 'text-gray-600 bg-gray-100',
        icon: StopCircle,
        actions: ['start']
    },
    error: {
        color: 'text-red-600 bg-red-100',
        icon: XCircle,
        actions: ['restart', 'stop']
    },
    starting: {
        color: 'text-yellow-600 bg-yellow-100',
        icon: PlayCircle,
        actions: []
    },
    stopping: {
        color: 'text-orange-600 bg-orange-100',
        icon: PauseCircle,
        actions: []
    }
};
const SYSTEM_STATUS_CONFIG = {
    operational: { color: 'text-green-600 bg-green-100', icon: CheckCircle },
    degraded: { color: 'text-yellow-600 bg-yellow-100', icon: AlertTriangle },
    down: { color: 'text-red-600 bg-red-100', icon: XCircle },
    maintenance: { color: 'text-blue-600 bg-blue-100', icon: Settings }
};
export const StatusControls = ({ className = '', adminLevel = 'admin', onServiceAction, onSystemAction }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [services, setServices] = useState([]);
    const [systemOverview, setSystemOverview] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [_____refreshInterval, setRefreshInterval] = useState(null);
    // Mock data - in real implementation, this would come from system APIs
    useEffect(() => {
        loadSystemData();
        // Set up auto-refresh
        const interval = setInterval(loadSystemData, 5000);
        setRefreshInterval(interval);
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, []);
    const loadSystemData = async () => {
        try {
            setIsLoading(true);
            // Mock system overview
            const overview = {
                overallStatus: 'operational',
                totalServices: 8,
                runningServices: 7,
                erroredServices: 1,
                systemLoad: 0.65,
                memoryUsage: 0.72,
                diskUsage: 0.45,
                networkLatency: 23,
                uptime: 7 * 24 * 60 * 60 * 1000, // 7 days
                activeUsers: 142,
                backgroundJobs: 3
            };
            setSystemOverview(overview);
            // Mock services
            const mockServices = [
                {
                    id: 'web-server',
                    name: 'nginx',
                    displayName: 'Web Server',
                    description: 'Primary web server handling HTTP requests',
                    status: 'running',
                    health: 98,
                    uptime: 6 * 24 * 60 * 60 * 1000,
                    lastRestart: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
                    autoRestart: true,
                    dependencies: [],
                    port: 80,
                    url: 'http://localhost',
                    logs: [],
                    metrics: {
                        cpuUsage: 5.2,
                        memoryUsage: 128,
                        requestCount: 1250,
                        errorRate: 0.02,
                        responseTime: 45,
                        throughput: 850
                    }
                },
                {
                    id: 'api-server',
                    name: 'fastify',
                    displayName: 'API Server',
                    description: 'Backend API server for application logic',
                    status: 'running',
                    health: 95,
                    uptime: 5 * 24 * 60 * 60 * 1000,
                    lastRestart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    autoRestart: true,
                    dependencies: ['database', 'redis'],
                    port: 8000,
                    url: 'http://localhost:8000',
                    logs: [],
                    metrics: {
                        cpuUsage: 12.8,
                        memoryUsage: 256,
                        requestCount: 2840,
                        errorRate: 0.05,
                        responseTime: 125,
                        throughput: 420
                    }
                },
                {
                    id: 'database',
                    name: 'postgresql',
                    displayName: 'PostgreSQL Database',
                    description: 'Primary database server',
                    status: 'running',
                    health: 92,
                    uptime: 7 * 24 * 60 * 60 * 1000,
                    lastRestart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    autoRestart: true,
                    dependencies: [],
                    port: 5432,
                    logs: [],
                    metrics: {
                        cpuUsage: 8.5,
                        memoryUsage: 512,
                        requestCount: 5600,
                        errorRate: 0.01,
                        responseTime: 15,
                        throughput: 1200
                    }
                },
                {
                    id: 'redis',
                    name: 'redis',
                    displayName: 'Redis Cache',
                    description: 'In-memory cache and session store',
                    status: 'error',
                    health: 0,
                    uptime: 0,
                    lastRestart: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    autoRestart: false,
                    dependencies: [],
                    port: 6379,
                    logs: [],
                    metrics: {
                        cpuUsage: 0,
                        memoryUsage: 0,
                        requestCount: 0,
                        errorRate: 1,
                        responseTime: 0,
                        throughput: 0
                    }
                }
            ];
            setServices(mockServices);
        }
        catch (error) {
            console.error('Failed to load system data:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleServiceAction = async (serviceId, action) => {
        try {
            setServices(prev => prev.map(service => service.id === serviceId
                ? {
                    ...service,
                    status: action === 'start' ? 'starting' :
                        action === 'stop' ? 'stopping' :
                            action === 'restart' ? 'starting' :
                                service.status
                }
                : service));
            // Simulate action delay
            setTimeout(() => {
                setServices(prev => prev.map(service => service.id === serviceId
                    ? {
                        ...service,
                        status: action === 'stop' ? 'stopped' : 'running',
                        lastRestart: action === 'restart' ? new Date() : service.lastRestart,
                        uptime: action === 'restart' ? 0 : service.uptime
                    }
                    : service));
            }, 2000);
            onServiceAction?.(serviceId, action);
        }
        catch (error) {
            console.error(`Failed to ${action} service ${serviceId}:`, error);
        }
    };
    const handleSystemAction = async (action) => {
        try {
            onSystemAction?.(action);
        }
        catch (error) {
            console.error(`Failed to execute system action ${action}:`, error);
        }
    };
    const renderOverview = () => {
        if (!systemOverview)
            return _jsx("div", { children: "Loading overview..." });
        const statusConfig = SYSTEM_STATUS_CONFIG[systemOverview.overallStatus];
        const StatusIcon = statusConfig.icon;
        return (_jsxs("div", { className: "overview-section", children: [_jsx("div", { className: "system-status-card", children: _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "system-status-header", children: [_jsxs("div", { className: "status-info", children: [_jsx("div", { className: "status-title", children: "System Status" }), _jsx("div", { className: "status-badge", children: _jsxs(Badge, { className: statusConfig.color, children: [_jsx(StatusIcon, { className: "w-4 h-4 mr-2" }), systemOverview.overallStatus.toUpperCase()] }) })] }), _jsxs("div", { className: "system-actions", children: [_jsxs(Button, { onClick: () => handleSystemAction('maintenance'), variant: "outline", size: "sm", children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Maintenance Mode"] }), _jsxs(Button, { onClick: loadSystemData, variant: "outline", size: "sm", disabled: isLoading, children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}` }), "Refresh"] })] })] }) }) }) }), _jsxs("div", { className: "metrics-grid", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "metric-item", children: [_jsx(Server, { className: "w-6 h-6 text-blue-600" }), _jsxs("div", { className: "metric-info", children: [_jsx("div", { className: "metric-label", children: "Services" }), _jsxs("div", { className: "metric-value", children: [systemOverview.runningServices, " / ", systemOverview.totalServices] }), _jsxs("div", { className: "metric-status running", children: [systemOverview.runningServices, " running"] })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "metric-item", children: [_jsx(Cpu, { className: "w-6 h-6 text-green-600" }), _jsxs("div", { className: "metric-info", children: [_jsx("div", { className: "metric-label", children: "System Load" }), _jsxs("div", { className: "metric-value", children: [(systemOverview.systemLoad * 100).toFixed(1), "%"] }), _jsx("div", { className: "load-bar", children: _jsx("div", { className: "load-fill", style: { width: `${systemOverview.systemLoad * 100}%` } }) })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "metric-item", children: [_jsx(Memory, { className: "w-6 h-6 text-purple-600" }), _jsxs("div", { className: "metric-info", children: [_jsx("div", { className: "metric-label", children: "Memory Usage" }), _jsxs("div", { className: "metric-value", children: [(systemOverview.memoryUsage * 100).toFixed(1), "%"] }), _jsx("div", { className: "memory-bar", children: _jsx("div", { className: "memory-fill", style: { width: `${systemOverview.memoryUsage * 100}%` } }) })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "metric-item", children: [_jsx(Users, { className: "w-6 h-6 text-orange-600" }), _jsxs("div", { className: "metric-info", children: [_jsx("div", { className: "metric-label", children: "Active Users" }), _jsx("div", { className: "metric-value", children: systemOverview.activeUsers }), _jsx("div", { className: "metric-status active", children: "Currently online" })] })] }) }) })] }), _jsx("div", { className: "alerts-section", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "System Alerts" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "alerts-list", children: [systemOverview.erroredServices > 0 && (_jsxs("div", { className: "alert-item error", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), _jsxs("span", { children: [systemOverview.erroredServices, " service(s) in error state"] }), _jsx(Button, { size: "sm", variant: "outline", children: "View Details" })] })), systemOverview.memoryUsage > 0.8 && (_jsxs("div", { className: "alert-item warning", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), _jsxs("span", { children: ["High memory usage detected (", (systemOverview.memoryUsage * 100).toFixed(1), "%)"] }), _jsx(Button, { size: "sm", variant: "outline", children: "Investigate" })] })), systemOverview.backgroundJobs > 5 && (_jsxs("div", { className: "alert-item info", children: [_jsx(Activity, { className: "w-4 h-4" }), _jsxs("span", { children: [systemOverview.backgroundJobs, " background jobs running"] }), _jsx(Button, { size: "sm", variant: "outline", children: "Monitor" })] })), systemOverview.erroredServices === 0 &&
                                            systemOverview.memoryUsage <= 0.8 &&
                                            systemOverview.backgroundJobs <= 5 && (_jsxs("div", { className: "alert-item success", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), _jsx("span", { children: "All systems operating normally" })] }))] }) })] }) })] }));
    };
    const renderServices = () => (_jsxs("div", { className: "services-section", children: [_jsxs("div", { className: "services-header", children: [_jsx("h3", { children: "System Services" }), _jsx("div", { className: "services-actions", children: _jsxs(Button, { onClick: () => handleSystemAction('restart_all'), variant: "outline", size: "sm", disabled: adminLevel !== 'super_admin', children: [_jsx(RotateCcw, { className: "w-4 h-4 mr-2" }), "Restart All"] }) })] }), _jsx("div", { className: "services-grid", children: services.map(service => (_jsx(ServiceCard, { service: service, onAction: handleServiceAction, onSelect: setSelectedService, adminLevel: adminLevel }, service.id))) })] }));
    const renderProcesses = () => (_jsx("div", { className: "processes-section", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Background Processes" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "processes-list", children: [_jsxs("div", { className: "process-item", children: [_jsxs("div", { className: "process-info", children: [_jsx("div", { className: "process-name", children: "Data Backup" }), _jsx("div", { className: "process-description", children: "Automated daily backup job" })] }), _jsx("div", { className: "process-status", children: _jsxs(Badge, { className: "text-green-600 bg-green-100", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), "Running"] }) }), _jsxs("div", { className: "process-actions", children: [_jsx(Button, { size: "sm", variant: "outline", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { size: "sm", variant: "outline", children: _jsx(Pause, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "process-item", children: [_jsxs("div", { className: "process-info", children: [_jsx("div", { className: "process-name", children: "Email Queue" }), _jsx("div", { className: "process-description", children: "Processing outbound email notifications" })] }), _jsx("div", { className: "process-status", children: _jsxs(Badge, { className: "text-blue-600 bg-blue-100", children: [_jsx(Activity, { className: "w-3 h-3 mr-1" }), "Processing"] }) }), _jsxs("div", { className: "process-actions", children: [_jsx(Button, { size: "sm", variant: "outline", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { size: "sm", variant: "outline", children: _jsx(Pause, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "process-item", children: [_jsxs("div", { className: "process-info", children: [_jsx("div", { className: "process-name", children: "Cache Cleanup" }), _jsx("div", { className: "process-description", children: "Automatic cache invalidation and cleanup" })] }), _jsx("div", { className: "process-status", children: _jsxs(Badge, { className: "text-yellow-600 bg-yellow-100", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), "Scheduled"] }) }), _jsxs("div", { className: "process-actions", children: [_jsx(Button, { size: "sm", variant: "outline", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { size: "sm", variant: "outline", children: _jsx(Play, { className: "w-4 h-4" }) })] })] })] }) })] }) }));
    return (_jsxs("div", { className: `status-controls ${className}`, children: [_jsxs("div", { className: "controls-header", children: [_jsxs("div", { className: "header-info", children: [_jsx("h2", { children: "Status Controls" }), _jsx("p", { children: "Monitor and control system services, processes, and operations" })] }), _jsxs("div", { className: "header-badges", children: [_jsxs(Badge, { className: `${SYSTEM_STATUS_CONFIG[systemOverview?.overallStatus || 'operational'].color} text-sm`, children: ["System ", systemOverview?.overallStatus || 'Unknown'] }), _jsxs(Badge, { className: "bg-blue-100 text-blue-800 text-sm", children: [adminLevel.replace('_', ' ').toUpperCase(), " Level"] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-full", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsxs(TabsTrigger, { value: "services", children: ["Services", _jsxs(Badge, { className: "ml-2 text-xs", children: [systemOverview?.runningServices || 0, "/", systemOverview?.totalServices || 0] })] }), _jsx(TabsTrigger, { value: "processes", children: "Processes" }), _jsx(TabsTrigger, { value: "logs", children: "System Logs" })] }), _jsx(TabsContent, { value: "overview", className: "tab-content", children: renderOverview() }), _jsx(TabsContent, { value: "services", className: "tab-content", children: renderServices() }), _jsx(TabsContent, { value: "processes", className: "tab-content", children: renderProcesses() }), _jsx(TabsContent, { value: "logs", className: "tab-content", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "System Logs" }) }), _jsx(CardContent, { children: _jsx("p", { children: "System log viewer coming soon..." }) })] }) })] }), selectedService && (_jsx(ServiceDetailModal, { service: selectedService, onClose: () => setSelectedService(null), onAction: handleServiceAction, adminLevel: adminLevel })), _jsx("style", { children: `
        .status-controls {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .controls-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        }

        .header-badges {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .overview-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .system-status-card {
          margin-bottom: 1rem;
        }

        .system-status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .system-actions {
          display: flex;
          gap: 0.5rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .metric-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .metric-info {
          flex: 1;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .metric-status {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .metric-status.running {
          color: #059669;
        }

        .metric-status.active {
          color: #3b82f6;
        }

        .load-bar,
        .memory-bar {
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 0.25rem;
        }

        .load-fill {
          height: 100%;
          background: #059669;
          transition: width 0.3s ease;
        }

        .memory-fill {
          height: 100%;
          background: #8b5cf6;
          transition: width 0.3s ease;
        }

        .alerts-section {
          margin-top: 1rem;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .alert-item.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .alert-item.warning {
          background: #fffbeb;
          color: #92400e;
          border: 1px solid #fed7aa;
        }

        .alert-item.info {
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
        }

        .alert-item.success {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .services-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .services-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .services-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .services-actions {
          display: flex;
          gap: 0.5rem;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1rem;
        }

        .processes-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .processes-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .process-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .process-info {
          flex: 1;
        }

        .process-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .process-description {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .process-actions {
          display: flex;
          gap: 0.25rem;
        }

        @media (max-width: 768px) {
          .controls-header {
            flex-direction: column;
            align-items: stretch;
          }

          .system-status-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .process-item {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      ` })] }));
};
const ServiceCard = ({ service, onAction, onSelect, adminLevel }) => {
    const statusConfig = SERVICE_STATUS_CONFIG[service.status];
    const StatusIcon = statusConfig.icon;
    const canControl = adminLevel === 'super_admin' || adminLevel === 'admin';
    const getHealthColor = (health) => {
        if (health >= 90)
            return 'text-green-600';
        if (health >= 70)
            return 'text-yellow-600';
        if (health >= 50)
            return 'text-orange-600';
        return 'text-red-600';
    };
    const formatUptime = (uptime) => {
        const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
        const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        if (days > 0)
            return `${days}d ${hours}h`;
        if (hours > 0)
            return `${hours}h`;
        return '< 1h';
    };
    return (_jsxs(Card, { className: "service-card", children: [_jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "service-header", children: [_jsxs("div", { className: "service-info", children: [_jsx("div", { className: "service-name", children: service.displayName }), _jsx("div", { className: "service-description", children: service.description })] }), _jsx("div", { className: "service-status", children: _jsxs(Badge, { className: statusConfig.color, children: [_jsx(StatusIcon, { className: "w-3 h-3 mr-1" }), service.status.toUpperCase()] }) })] }), _jsxs("div", { className: "service-metrics", children: [_jsxs("div", { className: "metric-row", children: [_jsx("span", { children: "Health:" }), _jsxs("span", { className: `font-semibold ${getHealthColor(service.health)}`, children: [service.health, "%"] })] }), _jsxs("div", { className: "metric-row", children: [_jsx("span", { children: "Uptime:" }), _jsx("span", { children: formatUptime(service.uptime) })] }), service.port && (_jsxs("div", { className: "metric-row", children: [_jsx("span", { children: "Port:" }), _jsx("span", { children: service.port })] })), _jsxs("div", { className: "metric-row", children: [_jsx("span", { children: "CPU:" }), _jsxs("span", { children: [service.metrics.cpuUsage.toFixed(1), "%"] })] }), _jsxs("div", { className: "metric-row", children: [_jsx("span", { children: "Memory:" }), _jsxs("span", { children: [service.metrics.memoryUsage, "MB"] })] })] }), _jsxs("div", { className: "service-actions", children: [_jsxs(Button, { onClick: () => onSelect(service), variant: "outline", size: "sm", children: [_jsx(Eye, { className: "w-4 h-4 mr-1" }), "Details"] }), canControl && statusConfig.actions.map(action => (_jsxs(Button, { onClick: () => onAction(service.id, action), size: "sm", variant: action === 'stop' ? 'outline' : 'default', disabled: service.status === 'starting' || service.status === 'stopping', children: [action === 'start' && _jsx(PlayCircle, { className: "w-4 h-4 mr-1" }), action === 'stop' && _jsx(StopCircle, { className: "w-4 h-4 mr-1" }), action === 'restart' && _jsx(RefreshCw, { className: "w-4 h-4 mr-1" }), action === 'pause' && _jsx(PauseCircle, { className: "w-4 h-4 mr-1" }), action.charAt(0).toUpperCase() + action.slice(1)] }, action)))] })] }), _jsx("style", { children: `
        .service-card {
          transition: box-shadow 0.2s ease;
        }

        .service-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .service-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .service-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .service-description {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.4;
        }

        .service-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .metric-row span:first-child {
          color: #6b7280;
        }

        .metric-row span:last-child {
          color: #1f2937;
          font-weight: 500;
        }

        .service-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
      ` })] }));
};
const ServiceDetailModal = ({ service, onClose, onAction, adminLevel }) => {
    const statusConfig = SERVICE_STATUS_CONFIG[service.status];
    const StatusIcon = statusConfig.icon;
    const canControl = adminLevel === 'super_admin' || adminLevel === 'admin';
    return (_jsxs("div", { className: "modal-overlay", children: [_jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { className: "modal-title", children: [_jsx("h2", { children: service.displayName }), _jsxs(Badge, { className: statusConfig.color, children: [_jsx(StatusIcon, { className: "w-4 h-4 mr-1" }), service.status.toUpperCase()] })] }), _jsx(Button, { onClick: onClose, variant: "outline", size: "sm", children: "\u2715" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "service-details-grid", children: [_jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Service Information" }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Name:" }), _jsx("span", { children: service.name })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Description:" }), _jsx("span", { children: service.description })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Port:" }), _jsx("span", { children: service.port || 'N/A' })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "URL:" }), _jsx("span", { children: service.url || 'N/A' })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Auto Restart:" }), _jsx(Badge, { className: service.autoRestart ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', children: service.autoRestart ? 'Enabled' : 'Disabled' })] })] }), _jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Performance Metrics" }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Health Score:" }), _jsxs("span", { className: "font-semibold", children: [service.health, "%"] })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "CPU Usage:" }), _jsxs("span", { children: [service.metrics.cpuUsage.toFixed(1), "%"] })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Memory Usage:" }), _jsxs("span", { children: [service.metrics.memoryUsage, "MB"] })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Request Count:" }), _jsx("span", { children: service.metrics.requestCount.toLocaleString() })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Error Rate:" }), _jsxs("span", { children: [(service.metrics.errorRate * 100).toFixed(2), "%"] })] }), _jsxs("div", { className: "detail-item", children: [_jsx("label", { children: "Response Time:" }), _jsxs("span", { children: [service.metrics.responseTime, "ms"] })] })] })] }), service.dependencies.length > 0 && (_jsxs("div", { className: "dependencies-section", children: [_jsx("h3", { children: "Dependencies" }), _jsx("div", { className: "dependencies-list", children: service.dependencies.map(dep => (_jsx(Badge, { variant: "outline", children: dep }, dep))) })] }))] }), _jsxs("div", { className: "modal-footer", children: [_jsx(Button, { onClick: onClose, variant: "outline", children: "Close" }), canControl && statusConfig.actions.map(action => (_jsxs(Button, { onClick: () => {
                                    onAction(service.id, action);
                                    onClose();
                                }, variant: action === 'stop' ? 'outline' : 'default', children: [action.charAt(0).toUpperCase() + action.slice(1), " Service"] }, action)))] })] }), _jsx("style", { children: `
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90vw;
          max-width: 700px;
          max-height: 80vh;
          overflow: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .modal-title h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .service-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .detail-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }

        .detail-item label {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-item span {
          color: #1f2937;
        }

        .dependencies-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .dependencies-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 768px) {
          .service-details-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            width: 95vw;
            max-height: 90vh;
          }
        }
      ` })] }));
};
export default StatusControls;
