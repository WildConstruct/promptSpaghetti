/**
 * Health Dashboard Component - Epic 17.4
 * 
 * Comprehensive system health monitoring dashboard for backstage admin controls.
 * Integrates with HealthMonitoringService and DiagnosticService for real-time
 * system status, performance metrics, and operational insights.
 * 
 * Task: E17-1753114397242-281319 - Design health dashboards
 * Epic: 17 - Backstage Admin Controls
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle, XCircle, AlertCircle, Activity, Zap, Database, Wifi, HardDrive } from 'lucide-react';

// Types for health monitoring
interface HealthStatus {
  overall: HealthScore;
  components: ComponentHealth[];
  metrics: SystemMetrics;
  alerts: SystemAlert[];
  lastUpdated: string;
  trends: HealthTrends;
}

interface HealthScore {
  score: number; // 0-100
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'CRITICAL' | 'UNKNOWN';
  message: string;
  recommendations: string[];
}

interface ComponentHealth {
  name: string;
  category: 'system' | 'database' | 'cache' | 'external' | 'filesystem' | 'authentication';
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'CRITICAL' | 'UNKNOWN';
  score: number;
  responseTime?: number;
  lastCheck: string;
  message?: string;
  metrics?: Record<string, number>;
  dependencies?: string[];
}

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    used: number;
    total: number;
    available: number;
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    usage: number;
    iops?: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
    latency?: number;
  };
  database: {
    connections: number;
    maxConnections: number;
    queryTime: number;
    queueSize: number;
  };
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  component?: string;
  timestamp: string;
  acknowledged: boolean;
  escalated: boolean;
  resolvedAt?: string;
}

interface HealthTrends {
  healthScore: TrendData[];
  responseTime: TrendData[];
  errorRate: TrendData[];
  uptime: number;
}

interface TrendData {
  timestamp: string;
  value: number;
}

// Props interface
interface HealthDashboardProps {
  refreshInterval?: number;
  autoRefresh?: boolean;
  showDetails?: boolean;
  onAlertAction?: (alertId: string, action: 'acknowledge' | 'resolve') => void;
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({
  refreshInterval = 30000, // 30 seconds
  autoRefresh = true,
  showDetails = true,
  onAlertAction
}) => {
  // State management
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'metrics' | 'alerts' | 'trends'>('overview');

  // Fetch health status
  const fetchHealthStatus = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/system/health/dashboard');
      
      if (!response.ok) {
        throw new Error(`Health API error: ${response.status}`);
      }
      
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
      console.error('Health dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    fetchHealthStatus();
    
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchHealthStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchHealthStatus, autoRefresh, refreshInterval]);

  // Helper functions
  const getStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'HEALTHY': return 'text-green-600 bg-green-100';
      case 'DEGRADED': return 'text-yellow-600 bg-yellow-100';
      case 'UNHEALTHY': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'HEALTHY': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'DEGRADED': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'UNHEALTHY': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'CRITICAL': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database': return <Database className="w-5 h-5" />;
      case 'system': return <Activity className="w-5 h-5" />;
      case 'cache': return <Zap className="w-5 h-5" />;
      case 'external': return <Wifi className="w-5 h-5" />;
      case 'filesystem': return <HardDrive className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Handle alert actions
  const handleAlertAction = async (alertId: string, action: 'acknowledge' | 'resolve') => {
    try {
      await fetch(`/api/system/alerts/${alertId}/${action}`, { method: 'POST' });
      await fetchHealthStatus(); // Refresh data
      onAlertAction?.(alertId, action);
    } catch (err) {
      console.error(`Failed to ${action} alert:`, err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <h1 className="text-2xl font-bold text-gray-900">Loading Health Status...</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Health Dashboard Error</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchHealthStatus}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!healthStatus) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Health Dashboard</h1>
            <p className="text-sm text-gray-600">
              Last updated: {new Date(healthStatus.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            Uptime: {formatUptime(healthStatus.trends.uptime)}
          </div>
          <button
            onClick={fetchHealthStatus}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Health Score */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Overall System Health</h2>
          <div className="flex items-center space-x-2">
            {getStatusIcon(healthStatus.overall.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthStatus.overall.status)}`}>
              {healthStatus.overall.status}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Health Score</span>
              <span className="text-2xl font-bold">{healthStatus.overall.score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  healthStatus.overall.score >= 90 ? 'bg-green-600' :
                  healthStatus.overall.score >= 70 ? 'bg-yellow-500' :
                  healthStatus.overall.score >= 50 ? 'bg-orange-500' : 'bg-red-600'
                }`}
                style={{ width: `${healthStatus.overall.score}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">System Message</h3>
            <p className="text-sm text-gray-600">{healthStatus.overall.message}</p>
            
            {healthStatus.overall.recommendations.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium text-gray-700 mb-1">Recommendations:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {healthStatus.overall.recommendations.slice(0, 2).map((rec, i) => (
                    <li key={i} className="flex items-start space-x-1">
                      <span>•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'components', label: 'Components' },
            { id: 'metrics', label: 'Metrics' },
            { id: 'alerts', label: `Alerts (${healthStatus.alerts.filter(a => !a.acknowledged).length})` },
            { id: 'trends', label: 'Trends' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Component Status Grid */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Status</h3>
            <div className="grid grid-cols-2 gap-3">
              {healthStatus.components.slice(0, 6).map((component) => (
                <div
                  key={component.name}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedComponent(component.name)}
                >
                  {getCategoryIcon(component.category)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{component.name}</p>
                    <p className="text-xs text-gray-500">{component.category}</p>
                  </div>
                  {getStatusIcon(component.status)}
                </div>
              ))}
            </div>
          </div>

          {/* System Metrics Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Resources</h3>
            <div className="space-y-4">
              {/* CPU Usage */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>{healthStatus.metrics.cpu.usage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      healthStatus.metrics.cpu.usage > 90 ? 'bg-red-600' :
                      healthStatus.metrics.cpu.usage > 70 ? 'bg-yellow-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${healthStatus.metrics.cpu.usage}%` }}
                  ></div>
                </div>
              </div>

              {/* Memory Usage */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>{formatBytes(healthStatus.metrics.memory.used)} / {formatBytes(healthStatus.metrics.memory.total)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      healthStatus.metrics.memory.usage > 90 ? 'bg-red-600' :
                      healthStatus.metrics.memory.usage > 70 ? 'bg-yellow-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${healthStatus.metrics.memory.usage}%` }}
                  ></div>
                </div>
              </div>

              {/* Disk Usage */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Disk Usage</span>
                  <span>{formatBytes(healthStatus.metrics.disk.used)} / {formatBytes(healthStatus.metrics.disk.total)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      healthStatus.metrics.disk.usage > 90 ? 'bg-red-600' :
                      healthStatus.metrics.disk.usage > 70 ? 'bg-yellow-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${healthStatus.metrics.disk.usage}%` }}
                  ></div>
                </div>
              </div>

              {/* Database Connections */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Database Connections</span>
                  <span>{healthStatus.metrics.database.connections} / {healthStatus.metrics.database.maxConnections}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${(healthStatus.metrics.database.connections / healthStatus.metrics.database.maxConnections) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'components' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Health Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {healthStatus.components.map((component) => (
                    <tr key={component.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getCategoryIcon(component.category)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{component.name}</div>
                            <div className="text-sm text-gray-500">{component.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(component.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(component.status)}`}>
                            {component.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{component.score}/100</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {component.responseTime ? `${component.responseTime}ms` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(component.lastCheck).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {component.message || 'Operating normally'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {healthStatus.alerts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
              <p className="text-gray-600">All systems are operating normally.</p>
            </div>
          ) : (
            healthStatus.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  alert.severity === 'critical' ? 'border-red-500' :
                  alert.severity === 'high' ? 'border-orange-500' :
                  alert.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      {alert.component && (
                        <span className="text-xs text-gray-500">{alert.component}</span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">{alert.title}</h4>
                    <p className="text-gray-600 mb-3">{alert.message}</p>
                    
                    {alert.acknowledged && (
                      <div className="text-sm text-green-600">
                        ✓ Acknowledged
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                      >
                        Acknowledge
                      </button>
                    )}
                    {!alert.resolvedAt && (
                      <button
                        onClick={() => handleAlertAction(alert.id, 'resolve')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detailed System Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
            <div className="space-y-6">
              {/* CPU Metrics */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">CPU Usage</h4>
                  <span className="text-sm text-gray-600">{healthStatus.metrics.cpu.cores} cores</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Current: {healthStatus.metrics.cpu.usage.toFixed(1)}%</span>
                  {healthStatus.metrics.cpu.temperature && (
                    <span>Temp: {healthStatus.metrics.cpu.temperature}°C</span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      healthStatus.metrics.cpu.usage > 90 ? 'bg-red-600' :
                      healthStatus.metrics.cpu.usage > 70 ? 'bg-yellow-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${healthStatus.metrics.cpu.usage}%` }}
                  ></div>
                </div>
              </div>

              {/* Memory Metrics */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Memory Usage</h4>
                  <span className="text-sm text-gray-600">
                    {formatBytes(healthStatus.metrics.memory.available)} available
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Used: {formatBytes(healthStatus.metrics.memory.used)}</span>
                  <span>Total: {formatBytes(healthStatus.metrics.memory.total)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      healthStatus.metrics.memory.usage > 90 ? 'bg-red-600' :
                      healthStatus.metrics.memory.usage > 70 ? 'bg-yellow-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${healthStatus.metrics.memory.usage}%` }}
                  ></div>
                </div>
              </div>

              {/* Disk Metrics */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Disk Usage</h4>
                  {healthStatus.metrics.disk.iops && (
                    <span className="text-sm text-gray-600">{healthStatus.metrics.disk.iops} IOPS</span>
                  )}
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Used: {formatBytes(healthStatus.metrics.disk.used)}</span>
                  <span>Total: {formatBytes(healthStatus.metrics.disk.total)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      healthStatus.metrics.disk.usage > 90 ? 'bg-red-600' :
                      healthStatus.metrics.disk.usage > 70 ? 'bg-yellow-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${healthStatus.metrics.disk.usage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Network and Database Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Network & Database</h3>
            <div className="space-y-6">
              {/* Network Metrics */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Network Traffic</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Bytes In</div>
                    <div className="font-medium">{formatBytes(healthStatus.metrics.network.bytesIn)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Bytes Out</div>
                    <div className="font-medium">{formatBytes(healthStatus.metrics.network.bytesOut)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Connections</div>
                    <div className="font-medium">{healthStatus.metrics.network.connections}</div>
                  </div>
                  {healthStatus.metrics.network.latency && (
                    <div>
                      <div className="text-gray-600">Latency</div>
                      <div className="font-medium">{healthStatus.metrics.network.latency}ms</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Database Metrics */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Database Performance</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Active Connections</span>
                      <span>{healthStatus.metrics.database.connections} / {healthStatus.metrics.database.maxConnections}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${(healthStatus.metrics.database.connections / healthStatus.metrics.database.maxConnections) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Query Time</div>
                      <div className="font-medium">{healthStatus.metrics.database.queryTime}ms</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Queue Size</div>
                      <div className="font-medium">{healthStatus.metrics.database.queueSize}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Health Score Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Score Trends</h3>
            <div className="h-64 flex items-center justify-center">
              {healthStatus.trends.healthScore.length > 0 ? (
                <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {healthStatus.overall.score}
                    </div>
                    <div className="text-gray-600">Current Health Score</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Trend: {healthStatus.trends.healthScore.length > 1 ? 
                        (healthStatus.trends.healthScore[healthStatus.trends.healthScore.length - 1].value > 
                         healthStatus.trends.healthScore[healthStatus.trends.healthScore.length - 2].value ? 'Improving' : 'Stable') : 'Stable'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No trend data available</div>
              )}
            </div>
          </div>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Response Time</h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {healthStatus.trends.responseTime[healthStatus.trends.responseTime.length - 1]?.value || 0}ms
                </div>
                <div className="text-sm text-gray-600">Average Response Time</div>
                <div className="text-xs text-gray-500 mt-1">
                  {healthStatus.trends.responseTime.length > 1 && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      healthStatus.trends.responseTime[healthStatus.trends.responseTime.length - 1]?.value <= 
                      healthStatus.trends.responseTime[healthStatus.trends.responseTime.length - 2]?.value 
                        ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {healthStatus.trends.responseTime[healthStatus.trends.responseTime.length - 1]?.value <= 
                       healthStatus.trends.responseTime[healthStatus.trends.responseTime.length - 2]?.value 
                        ? '↓ Improving' : '↑ Slower'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Error Rate</h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {healthStatus.trends.errorRate[healthStatus.trends.errorRate.length - 1]?.value || 0}%
                </div>
                <div className="text-sm text-gray-600">Current Error Rate</div>
                <div className="text-xs text-gray-500 mt-1">
                  {healthStatus.trends.errorRate.length > 1 && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      healthStatus.trends.errorRate[healthStatus.trends.errorRate.length - 1]?.value <= 
                      healthStatus.trends.errorRate[healthStatus.trends.errorRate.length - 2]?.value 
                        ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {healthStatus.trends.errorRate[healthStatus.trends.errorRate.length - 1]?.value <= 
                       healthStatus.trends.errorRate[healthStatus.trends.errorRate.length - 2]?.value 
                        ? '↓ Improving' : '↑ Increasing'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">System Uptime</h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatUptime(healthStatus.trends.uptime)}
                </div>
                <div className="text-sm text-gray-600">Current Uptime</div>
                <div className="text-xs text-green-600 mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Stable
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthDashboard;