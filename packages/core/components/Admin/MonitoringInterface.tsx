/**
 * Monitoring Interface
 * Epic 17.4.2 - Monitoring Dashboard
 * Task: E17-1753114397070-5493E0
 * 
 * Unified monitoring dashboard that brings together health, performance, 
 * API, and security monitoring with role-based views and real-time updates.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { HealthDashboard } from './HealthDashboard';
import { UsageQuotaDashboard } from './UsageQuotaDashboard';

// Monitoring Interface Types

export interface MonitoringMetrics {
  system: {
  cpu: number;
  memory: number;
  disk: number;
  network: {
  inbound: number;
  outbound: number;
};
    uptime: number;
  lastUpdated: string;
  };
  api: {
  requestsPerSecond: number;
  averageLatency: number;
  errorRate: number;
  activeConnections: number;
  totalRequests: number;
  failedRequests: number;
};
  security: {
  activeThreats: number;
  blockedAttempts: number;
  suspiciousActivity: number;
  lastIncident: string | null;
  complianceScore: number;
};
  performance: {
  responseTime: number;
  throughput: number;
  availability: number;
  errorCount: number;
  operationsPerSecond: number;
};
}
export interface AlertData {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  assignee?: string;
}
export interface MonitoringViewConfig {
  layout: 'executive' | 'operational' | 'analytics' | 'compliance';
  refreshInterval: number;
  widgets: string;
  rolePermissions: string;
  interface MonitoringInterfaceProps {
  userRole: string;
  userId: string;
  onAlertAction?: (alertId: string, action: string) => void;
  onExport?: (type: string, timeRange: string) => void;
  className?: string;
}
export const MonitoringInterface: React.FC<MonitoringInterfaceProps> = ({)
  userRole,
  userId,
  onAlertAction,
  onExport,
  className = ''
}) => {
  // State Management
  const [currentView, setCurrentView] = useState<MonitoringViewConfig['layout']>('executive');
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertData>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  // View Configurations
  const viewConfigs: Record<MonitoringViewConfig['layout'], MonitoringViewConfig> = {,
  executive: {
  layout: 'executive',
  refreshInterval: 30000,
  widgets: ['system-overview', 'alert-summary', 'key-metrics', 'health-score'],
  rolePermissions: ['admin', 'executive', 'manager'],
},
  operational: {
  layout: 'operational',
  refreshInterval: 5000,
  widgets: ['system-details', 'real-time-logs', 'performance-charts', 'alert-management'],
  rolePermissions: ['admin', 'operator', 'engineer'],
},
  analytics: {
  layout: 'analytics',
  refreshInterval: 60000,
  widgets: ['trend-analysis', 'usage-patterns', 'performance-benchmarks', 'capacity-planning'],
  rolePermissions: ['admin', 'analyst', 'manager'],
},
  compliance: {
  layout: 'compliance',
  refreshInterval: 300000,
  widgets: ['audit-trail', 'policy-enforcement', 'regulatory-status', 'evidence-collection'],
  rolePermissions: ['admin', 'compliance', 'auditor'],
};
  // Available views based on user role
  const availableViews = Object.entries(viewConfigs);
    .filter(([ config]) => config.rolePermissions.includes(userRole))
    .map(([key]) => key as MonitoringViewConfig['layout']);
  // Real-time data fetching
  const fetchMetrics = useCallback(async () => {
  try {
  setConnectionStatus('connected');
  // Simulate API calls - replace with actual endpoints
  const [systemResponse, apiResponse, securityResponse, performanceResponse] = await Promise.all([)
  fetch('/api/system/health/metrics').then(r => r.json()),
  fetch('/api/system/api/metrics').then(r => r.json()),
  fetch('/api/system/security/metrics').then(r => r.json()),
  fetch('/api/system/performance/metrics').then(r => r.json())
  ]);
  const metricsData: MonitoringMetrics = {,
  system: systemResponse,
  api: apiResponse,
  security: securityResponse,
  performance: performanceResponse,
};
      setMetrics(metricsData);
      setLastUpdated(new Date().toISOString());
      setIsLoading(false);
    } catch (error) {
  console.error('Failed to fetch metrics:', error);
  setConnectionStatus('disconnected');
  setIsLoading(false);
}, []);
  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/system/alerts/active');
      const alertsData = await response.json();
      setAlerts(alertsData);
    } catch (error) {
  console.error('Failed to fetch alerts:', error);
}, []);
  // Handle alert actions
  const handleAlertAction = useCallback((alertId: string, action: string) => {
  onAlertAction?.(alertId, action);
  // Update local state optimistically
  setAlerts(prev => prev.map(alert => )
  alert.id === alertId
  ? {
  ...alert,
  acknowledged: action === 'acknowledge' ? true : alert.acknowledged,
  resolved: action === 'resolve' ? true : alert.resolved,
  assignee: action === 'assign' ? userId : alert.assignee,
  : alert));
}, [onAlertAction, userId]);
  // Auto-refresh effect
  useEffect(() => {
    const config = viewConfigs[currentView];
    const interval = setInterval(() => {
      fetchMetrics();
      fetchAlerts();
    }, config.refreshInterval);
    // Initial fetch
    fetchMetrics();
    fetchAlerts();
    return () => clearInterval(interval);
  }, [currentView, fetchMetrics, fetchAlerts]);
  // Alert severity colors
  const getSeverityColor = (severity: AlertData['severity']) => {
  switch (severity) {
  case 'critical': return '#dc2626';
  case 'high': return '#ea580c';
  case 'medium': return '#d97706';
  case 'low': return '#65a30d';
  case 'info': return '#2563eb';
  default: return '#6b7280';
};
  // Header component
  const MonitoringHeader = () => (;);
    <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
  padding: '16px 24px',
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}}>
      <div>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
          System Monitoring
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'} • 
          Status: <span style={{,
  color: connectionStatus === 'connected' ? '#10b981' : '#ef4444',
  fontWeight: '500',
}}>
            {connectionStatus}
          </span>
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {/* View Selector */}
        <select
          value={currentView}
          onChange={(e) => setCurrentView(e.target.value as MonitoringViewConfig['layout'])}
          style={{
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  backgroundColor: '#FFFFFF',
  cursor: 'pointer',
}}
        >
          {availableViews.map(view => ()
            <option key={view} value={view}>
              {view.charAt(0).toUpperCase() + view.slice(1)} View
            </option>
          ))}
        </select>
        {/* Export Button */}
        <button
          onClick={() => onExport?.('metrics', '24h')}
          style={{
  padding: '8px 16px',
  backgroundColor: '#3b82f6',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
}}
        >
          Export Report
        </button>
      </div>
    </div>
  );
  // Alert Summary Component
  const AlertSummary = () => {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;
  const highAlerts = alerts.filter(a => a.severity === 'high' && !a.resolved).length;
  const unacknowledged = alerts.filter(a => !a.acknowledged && !a.resolved).length;
  return;
  <div style={{
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
          Alert Overview
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>{criticalAlerts}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Critical</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#ea580c' }}>{highAlerts}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>High Priority</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>{unacknowledged}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Unacknowledged</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>{alerts.filter(a => a.resolved).length}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Resolved Today</div>
          </div>
        </div>
      </div>
    );
  };
  // Key Metrics Component
  const KeyMetrics = () => {
  if (!metrics) return <div>Loading metrics...</div>;
  return;
  <div style={{
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
          System Performance
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>CPU Usage</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
              {metrics.system.cpu.toFixed(1)}%
            </div>
            <div style={{
  width: '100%',
  height: '4px',
  backgroundColor: '#e5e7eb',
  borderRadius: '2px',
  overflow: 'hidden',
  marginTop: '8px',
}}>
              <div style={{
                width: `${Math.min(metrics.system.cpu, 100)}%`}
},
  height: '100%',
                backgroundColor: metrics.system.cpu > 80 ? '#dc2626' : metrics.system.cpu > 60 ? '#f59e0b' : '#10b981',
                borderRadius: '2px'
  }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Memory Usage</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
              {metrics.system.memory.toFixed(1)}%
            </div>
            <div style={{
  width: '100%',
  height: '4px',
  backgroundColor: '#e5e7eb',
  borderRadius: '2px',
  overflow: 'hidden',
  marginTop: '8px',
}}>
              <div style={{
                width: `${Math.min(metrics.system.memory, 100)}%`}
},
  height: '100%',
                backgroundColor: metrics.system.memory > 80 ? '#dc2626' : metrics.system.memory > 60 ? '#f59e0b' : '#10b981',
                borderRadius: '2px'
  }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>API Latency</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
              {metrics.api.averageLatency.toFixed(0)}ms
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              {metrics.api.requestsPerSecond.toFixed(1)} req/s
            </div>
          </div>
        </div>
      </div>
    );
  };
  // Recent Alerts Component
  const RecentAlerts = () => (;);
    <div style={{
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
        Recent Alerts
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.slice(0, 5).map(alert => ()
          <div
            key={alert.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderLeft: `4px solid ${getSeverityColor(alert.severity)}`}
},
  borderRadius: '4px'
  }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '2px' }}>
                {alert.title}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {alert.source} • {new Date(alert.timestamp).toLocaleString()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {!alert.acknowledged && ()
                <button
                  onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                  style={{
  padding: '4px 8px',
  backgroundColor: '#3b82f6',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
}}
                >
                  Acknowledge
                </button>
              )}
              {!alert.resolved && ()
                <button
                  onClick={() => handleAlertAction(alert.id, 'resolve')}
                  style={{
  padding: '4px 8px',
  backgroundColor: '#10b981',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
}}
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  if (isLoading && !metrics) {
  return;
  <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '400px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
}}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
  width: '40px',
  height: '40px',
  border: '4px solid #e5e7eb',
  borderTopColor: '#3b82f6',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto 16px',
}} />
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Loading monitoring data...</div>
        </div>
      </div>
    );
  return;
    <div className={`monitoring-interface ${className}`} style={{ },}
  padding: '20px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
  }}>
      <MonitoringHeader />
      {/* Executive View */}
      {currentView === 'executive' && ()
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <AlertSummary />
          <KeyMetrics />
        </div>
      )}
      {/* All Views Show Recent Alerts */}
      <div style={{ marginBottom: '20px' }}>
        <RecentAlerts />
      </div>
      {/* Embed existing monitoring components based on view */}
      {currentView === 'operational' && ()
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '20px' }}>
            <HealthDashboard />
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '20px' }}>
            <UsageQuotaDashboard />
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
      `}</style>
    </div>
  );
};

export default MonitoringInterface;