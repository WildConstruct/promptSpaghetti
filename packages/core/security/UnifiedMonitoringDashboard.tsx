/**
 * Unified Monitoring Dashboard
 * Epic 31 - Security Integration Framework
 * 
 * Comprehensive dashboard for all analytics and security systems monitoring
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle, Shield, Activity, Users, Server, Globe, Clock, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle, Zap } from 'lucide-react';

// Types
}
interface DashboardMetrics {
  security: {
  active_alerts: number;
  critical_alerts: number;
  threat_level: number; // 0-10,
  incidents_today: number;
  mean_response_time: number;
  false_positive_rate: number;
}
};
  performance: {
  system_health: number; // 0-100,
  avg_response_time: number;
  requests_per_minute: number;
  error_rate: number;
  cpu_usage: number;
  memory_usage: number;
};
  analytics: {
  active_users: number;
  daily_sessions: number;
  conversion_rate: number;
  bounce_rate: number;
  page_views_today: number;
  revenue_today: number;
};
  infrastructure: {
  services_up: number;
  services_total: number;
  database_health: number;
  network_latency: number;
  storage_usage: number;
  backup_status: 'success' | 'warning' | 'error'
  };
}
interface AlertSummary {
  id: string;
  type: 'security' | 'performance' | 'infrastructure' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  source: string;
  status: 'active' | 'investigating' | 'resolved';
  interface TimeSeriesData {
  timestamp: number;
  value: number;
  label?: string;
  interface SystemStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
  uptime: number;
  last_check: number;
  response_time?: number;
  error_count?: number;
  // Mock data hook (would be replaced with real API calls)
  const useDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({)
  security: {
  active_alerts: 12,
  critical_alerts: 2,
  threat_level: 3.5,
  incidents_today: 5,
  mean_response_time: 4200,
  false_positive_rate: 0.08,
}
},
  performance: {
  system_health: 94,
  avg_response_time: 245,
  requests_per_minute: 1820,
  error_rate: 0.012,
  cpu_usage: 68,
  memory_usage: 72,
},
  analytics: {
  active_users: 2847,
  daily_sessions: 15624,
  conversion_rate: 0.034,
  bounce_rate: 0.28,
  page_views_today: 89453,
  revenue_today: 24890.50,
},
  infrastructure: {
  services_up: 28,
  services_total: 30,
  database_health: 98,
  network_latency: 23,
  storage_usage: 0.67,
  backup_status: 'success',
});
  const [alerts, setAlerts] = useState<AlertSummary>([)
    {
  id: 'alert_001',
  type: 'security',
  severity: 'high',
  title: 'Unusual login patterns detected',
  description: 'Multiple failed login attempts from various IP addresses',
  timestamp: Date.now() - 300000,
  source: 'Authentication System',
  status: 'investigating',
}
    {
  id: 'alert_002',
  type: 'performance',
  severity: 'medium',
  title: 'High response times on API gateway',
  description: 'Average response time exceeded 500ms threshold',
  timestamp: Date.now() - 180000,
  source: 'API Gateway',
  status: 'active',
}
    {
      id: 'alert_003',
      type: 'infrastructure',
      severity: 'critical',
      title: 'Database connection pool exhausted',
      description: 'Primary database connection pool at 98% capacity',
      timestamp: Date.now() - 120000,
      source: 'Database Monitor',
      status: 'active']);
  const [systemStatuses, setSystemStatuses] = useState<SystemStatus>([)
    { name: 'Web Frontend', status: 'healthy', uptime: 0.999, last_check: Date.now(), response_time: 124 },
    { name: 'API Gateway', status: 'degraded', uptime: 0.995, last_check: Date.now(), response_time: 456 },
    { name: 'Auth Service', status: 'healthy', uptime: 0.998, last_check: Date.now(), response_time: 89 },
    { name: 'Database', status: 'degraded', uptime: 0.992, last_check: Date.now(), error_count: 3 },
    { name: 'Cache Layer', status: 'healthy', uptime: 1.0, last_check: Date.now(), response_time: 12 },
    { name: 'Message Queue', status: 'offline', uptime: 0.0, last_check: Date.now() - 300000 }
  ]);
  // Simulate real-time updates
  useEffect(() => {
  const interval = setInterval(() => {
  setMetrics(prev => ({)
  ...prev,
  performance: {
  ...prev.performance,
  requests_per_minute: prev.performance.requests_per_minute + Math.floor(Math.random() * 100 - 50),
  avg_response_time: Math.max(100, prev.performance.avg_response_time + Math.floor(Math.random() * 40 - 20)),
},
  analytics: {
  ...prev.analytics,
  active_users: Math.max(0, prev.analytics.active_users + Math.floor(Math.random() * 20 - 10)),
}));
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return { metrics, alerts, systemStatuses };
};

// Components
const MetricCard: React.FC<{,
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  status?: 'good' | 'warning' | 'critical';
  onClick?: () => void;
}> = ({ title, value, subtitle, icon, trend, status = 'good', onClick }) => {
  const statusColors = {
  good: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  critical: 'bg-red-50 border-red-200',
};
  const trendIcons = {
  up: <TrendingUp className="w-4 h-4 text-green-500" />,
  down: <TrendingDown className="w-4 h-4 text-red-500" />,
  stable: <div className="w-4 h-4" />,
};
  return;
    <div 
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${statusColors[status]}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon}
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        </div>
        {trend && trendIcons[trend]}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
      </div>
    </div>
  );
};
const AlertCard: React.FC<{ alert: AlertSummary; onAcknowledge: (id: string) => void }> = ({ alert, onAcknowledge }) => {
  const severityColors = {
  low: 'border-blue-300 bg-blue-50',
  medium: 'border-yellow-300 bg-yellow-50',
  high: 'border-orange-300 bg-orange-50',
  critical: 'border-red-300 bg-red-50',
};
  const severityIcons = {
  low: <AlertCircle className="w-4 h-4 text-blue-600" />,
  medium: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
  high: <AlertTriangle className="w-4 h-4 text-orange-600" />,
  critical: <XCircle className="w-4 h-4 text-red-600" />,
};
  const statusIcons = {
  active: <AlertCircle className="w-4 h-4 text-red-500" />,
  investigating: <Clock className="w-4 h-4 text-yellow-500" />,
  resolved: <CheckCircle className="w-4 h-4 text-green-500" />,
};
  return;
    <div className={`p-4 rounded-lg border-2 ${severityColors[alert.severity]}`}>}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {severityIcons[alert.severity]}
          <h4 className="font-medium text-gray-900">{alert.title}</h4>
        </div>
        <div className="flex items-center space-x-2">
          {statusIcons[alert.status]}
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
            {alert.status}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{alert.source}</span>
        <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
      </div>
      {alert.status === 'active' && ()
        <button
          onClick={() => onAcknowledge(alert.id)}
          className="mt-2 w-full px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Acknowledge
        </button>
      )}
    </div>
  );
};
const SystemStatusIndicator: React.FC<{ system: SystemStatus }> = ({ system }) => {
  const statusColors = {
  healthy: 'bg-green-500',
  degraded: 'bg-yellow-500',
  unhealthy: 'bg-orange-500',
  offline: 'bg-red-500',
};
  const statusIcons = {
  healthy: <CheckCircle className="w-4 h-4 text-green-600" />,
  degraded: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
  unhealthy: <AlertTriangle className="w-4 h-4 text-orange-600" />,
  offline: <XCircle className="w-4 h-4 text-red-600" />,
};
  return;
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${statusColors[system.status]}`} />}
        {statusIcons[system.status]}
        <span className="font-medium text-gray-900">{system.name}</span>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-gray-600">
          {(system.uptime * 100).toFixed(2)}% uptime
        </div>
        {system.response_time && ()
          <div className="text-xs text-gray-500">{system.response_time}ms</div>
        )}
        {system.error_count && ()
          <div className="text-xs text-red-500">{system.error_count} errors</div>
        )}
      </div>
    </div>
  );
};
const SimpleChart: React.FC<{ data: TimeSeriesData; height?: number }> = ({ data, height = 60 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  return;
    <div className="relative" style={{ height }}>
      <svg className="w-full h-full">
        <polyline
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          points={data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = ((maxValue - point.value) / range) * 100;
            return `${x}%,${y}%`;}
          }).join(' ')}
        />
      </svg>
    </div>
  );
};

// Main Dashboard Component
export const UnifiedMonitoringDashboard: React.FC = () => {
  const { metrics, alerts, systemStatuses } = useDashboardData();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'security' | 'performance' | 'analytics' | 'infrastructure'>('overview');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    console.log(`Acknowledging alert: ${alertId}`);}
    // Would send API request to acknowledge alert
  }, []);
  const criticalAlertsCount = useMemo(() => {
    return alerts.filter(alert => alert.severity === 'critical' && alert.status === 'active').length;
  }, [alerts]);
  const systemHealthPercentage = useMemo(() => {
    const healthyCount = systemStatuses.filter(s => s.status === 'healthy').length;
    return Math.round((healthyCount / systemStatuses.length) * 100);
  }, [systemStatuses]);
  // Generate sample time series data
  const generateTimeSeriesData = (baseValue: number, variance: number, points: number = 24): TimeSeriesData => {
    return Array.from({ length: points }, (_, i) => ({)
  timestamp: Date.now() - (points - i) * 60 * 60 * 1000,
  value: baseValue + (Math.random() - 0.5) * variance,
}));
  };
  const responseTimeData = generateTimeSeriesData(metrics.performance.avg_response_time, 100);
  const requestRateData = generateTimeSeriesData(metrics.performance.requests_per_minute, 300);
  const activeUsersData = generateTimeSeriesData(metrics.analytics.active_users, 500);
  return;
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Unified Monitoring Dashboard</h1>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>
        {/* Critical Alerts Banner */}
        {criticalAlertsCount > 0 && ()
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-800">
                {criticalAlertsCount} Critical Alert{criticalAlertsCount > 1 ? 's' : ''} Require Immediate Attention
              </span>
            </div>
          </div>
        )}
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
          {(['overview', 'security', 'performance', 'analytics', 'infrastructure'] as const).map((tab) => ()
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
  selectedTab === tab
  ? 'bg-white text-gray-900 shadow-sm'
  : 'text-gray-600 hover:text-gray-900',
}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      {/* Overview Tab */}
      {selectedTab === 'overview' && ()
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="System Health"
              value={`${systemHealthPercentage}%`}
              icon={<Shield className="w-5 h-5 text-green-600" />}
              status={systemHealthPercentage > 90 ? 'good' : systemHealthPercentage > 70 ? 'warning' : 'critical'}
              trend="stable"
            />
            <MetricCard
              title="Active Alerts"
              value={metrics.security.active_alerts}
              subtitle={`${metrics.security.critical_alerts} critical`}
              icon={<AlertTriangle className="w-5 h-5 text-yellow-600" />}
              status={metrics.security.critical_alerts > 0 ? 'critical' : metrics.security.active_alerts > 5 ? 'warning' : 'good'}
            />
            <MetricCard
              title="Response Time"
              value={`${metrics.performance.avg_response_time}ms`}
              icon={<Zap className="w-5 h-5 text-blue-600" />}
              status={metrics.performance.avg_response_time > 500 ? 'critical' : metrics.performance.avg_response_time > 300 ? 'warning' : 'good'}
              trend="up"
            />
            <MetricCard
              title="Active Users"
              value={metrics.analytics.active_users.toLocaleString()}
              icon={<Users className="w-5 h-5 text-purple-600" />}
              trend="up"
            />
          </div>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Response Time Trend</h3>
              <SimpleChart data={responseTimeData} height={120} />
              <div className="mt-2 text-sm text-gray-600">
                Avg: {metrics.performance.avg_response_time}ms
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Request Rate</h3>
              <SimpleChart data={requestRateData} height={120} />
              <div className="mt-2 text-sm text-gray-600">
                Current: {metrics.performance.requests_per_minute}/min
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Active Users</h3>
              <SimpleChart data={activeUsersData} height={120} />
              <div className="mt-2 text-sm text-gray-600">
                Current: {metrics.analytics.active_users} users
              </div>
            </div>
          </div>
          {/* Alerts and System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Alerts */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => ()
                  <AlertCard key={alert.id} alert={alert} onAcknowledge={handleAcknowledgeAlert} />
                ))}
              </div>
            </div>
            {/* System Status */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                {systemStatuses.map((system) => ()
                  <SystemStatusIndicator key={system.name} system={system} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Security Tab */}
      {selectedTab === 'security' && ()
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Threat Level"
              value={metrics.security.threat_level.toFixed(1)}
              subtitle="/ 10"
              icon={<Shield className="w-5 h-5 text-red-600" />}
              status={metrics.security.threat_level > 7 ? 'critical' : metrics.security.threat_level > 4 ? 'warning' : 'good'}
            />
            <MetricCard
              title="Incidents Today"
              value={metrics.security.incidents_today}
              icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
            />
            <MetricCard
              title="Response Time"
              value={`${Math.round(metrics.security.mean_response_time / 1000)}s`}
              icon={<Clock className="w-5 h-5 text-blue-600" />}
            />
            <MetricCard
              title="False Positive Rate"
              value={`${(metrics.security.false_positive_rate * 100).toFixed(1)}%`}
              icon={<Activity className="w-5 h-5 text-purple-600" />}
            />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Security Events Timeline</h3>
            <div className="text-center py-8 text-gray-500">
              Security timeline visualization would be implemented here
            </div>
          </div>
        </div>
      )}
      {/* Performance Tab */}
      {selectedTab === 'performance' && ()
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Error Rate"
              value={`${(metrics.performance.error_rate * 100).toFixed(2)}%`}
              icon={<XCircle className="w-5 h-5 text-red-600" />}
              status={metrics.performance.error_rate > 0.05 ? 'critical' : metrics.performance.error_rate > 0.02 ? 'warning' : 'good'}
            />
            <MetricCard
              title="CPU Usage"
              value={`${metrics.performance.cpu_usage}%`}
              icon={<Server className="w-5 h-5 text-blue-600" />}
              status={metrics.performance.cpu_usage > 80 ? 'critical' : metrics.performance.cpu_usage > 60 ? 'warning' : 'good'}
            />
            <MetricCard
              title="Memory Usage"
              value={`${metrics.performance.memory_usage}%`}
              icon={<Activity className="w-5 h-5 text-green-600" />}
              status={metrics.performance.memory_usage > 85 ? 'critical' : metrics.performance.memory_usage > 70 ? 'warning' : 'good'}
            />
            <MetricCard
              title="Requests/Min"
              value={metrics.performance.requests_per_minute.toLocaleString()}
              icon={<Globe className="w-5 h-5 text-purple-600" />}
            />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="text-center py-8 text-gray-500">
              Detailed performance charts would be implemented here
            </div>
          </div>
        </div>
      )}
      {/* Analytics Tab */}
      {selectedTab === 'analytics' && ()
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Daily Sessions"
              value={metrics.analytics.daily_sessions.toLocaleString()}
              icon={<Users className="w-5 h-5 text-blue-600" />}
            />
            <MetricCard
              title="Conversion Rate"
              value={`${(metrics.analytics.conversion_rate * 100).toFixed(1)}%`}
              icon={<TrendingUp className="w-5 h-5 text-green-600" />}
            />
            <MetricCard
              title="Bounce Rate"
              value={`${(metrics.analytics.bounce_rate * 100).toFixed(1)}%`}
              icon={<TrendingDown className="w-5 h-5 text-red-600" />}
            />
            <MetricCard
              title="Revenue Today"
              value={`$${metrics.analytics.revenue_today.toLocaleString()}`}
              icon={<Activity className="w-5 h-5 text-purple-600" />}
            />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Analytics Overview</h3>
            <div className="text-center py-8 text-gray-500">
              Analytics dashboard would be implemented here
            </div>
          </div>
        </div>
      )}
      {/* Infrastructure Tab */}
      {selectedTab === 'infrastructure' && ()
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Services Up"
              value={`${metrics.infrastructure.services_up}/${metrics.infrastructure.services_total}`}
              icon={<Server className="w-5 h-5 text-green-600" />}
              status={metrics.infrastructure.services_up === metrics.infrastructure.services_total ? 'good' : 'warning'}
            />
            <MetricCard
              title="Database Health"
              value={`${metrics.infrastructure.database_health}%`}
              icon={<Activity className="w-5 h-5 text-blue-600" />}
              status={metrics.infrastructure.database_health > 95 ? 'good' : metrics.infrastructure.database_health > 85 ? 'warning' : 'critical'}
            />
            <MetricCard
              title="Network Latency"
              value={`${metrics.infrastructure.network_latency}ms`}
              icon={<Globe className="w-5 h-5 text-purple-600" />}
              status={metrics.infrastructure.network_latency > 100 ? 'critical' : metrics.infrastructure.network_latency > 50 ? 'warning' : 'good'}
            />
            <MetricCard
              title="Storage Usage"
              value={`${(metrics.infrastructure.storage_usage * 100).toFixed(0)}%`}
              icon={<Server className="w-5 h-5 text-orange-600" />}
              status={metrics.infrastructure.storage_usage > 0.9 ? 'critical' : metrics.infrastructure.storage_usage > 0.75 ? 'warning' : 'good'}
            />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Infrastructure Status</h3>
            <div className="text-center py-8 text-gray-500">
              Infrastructure monitoring details would be implemented here
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedMonitoringDashboard;