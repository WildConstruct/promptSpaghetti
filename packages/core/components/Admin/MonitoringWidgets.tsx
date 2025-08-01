/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Monitoring Widgets
 * Epic 17.4.2 - Monitoring Dashboard
 * Task: E17-1753114397070-5493E0
 * 
 * Modular monitoring widgets for different views and metrics.
 * Supports configurable layouts, real-time updates, and role-based visibility.
 */
import React, { useState, useEffect } from 'react';

// Widget Configuration Types


export interface WidgetConfig { id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'status' | 'alert' }
  size: 'small' | 'medium' | 'large' | 'full-width';
  refreshInterval?: number;
  requiredPermissions: string;
  dataSource: string;
  interface MonitoringWidgetProps {
  config: WidgetConfig;
  userRole: string;
  data?: unknown;
  onAction?: (widgetId: string, action: string, params?: Record<string, unknown>) => void;
  className?: string;
  // System Health Score Widget


export const SystemHealthWidget: React.FC<MonitoringWidgetProps> = ({ data, className }) => { const healthScore = data?.healthScore || 0;
  const components = data?.components || [];
  const getHealthColor = (score: number) => { }
  if (score >= 95) return '#10b981';
  if (score >= 85) return '#f59e0b';
  if (score >= 70) return '#ef4444';
  return '#dc2626';
};
  const getHealthStatus = (score: number) => {
    if (score >= 95) return 'Excellent';
    if (score >= 85) return 'Good';
    if (score >= 70) return 'Warning';
    return 'Critical'
  };
  return;
    <div className={`health-widget ${className}`} style={{},}
  backgroundColor: '#FFFFFF'
      borderRadius: '8px'
      padding: '20px'
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
        System Health Score
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle
              cx="40" cy="40" r="30"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="40" cy="40" r="30"
              fill="none"
              stroke={getHealthColor(healthScore)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(healthScore / 100) * 188.5} 188.5`}
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div style={ {
  position: 'absolute'
  top: '50%'
  left: '50%'
  transform: 'translate(-50%, -50%)'
  fontSize: '18px'
  fontWeight: '700'
  color: getHealthColor(healthScore) }
}>
            {healthScore}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
            {getHealthStatus(healthScore)}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {components.filter((c: unknown) => c.status === 'healthy').length}/{components.length} components healthy
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {components.slice(0, 4).map((component: unknown, index: number) => ()
          <div key={index} style={ {
  display: 'flex'
  alignItems: 'center'
  justifyContent: 'space-between'
  padding: '8px 0'
  borderBottom: index < 3 ? '1px solid #f3f4f6' : 'none' }
}>
            <span style={{ fontSize: '13px', color: '#374151' }}>{component.name}</span>
            <span style={ {
  fontSize: '12px'
  color: component.status === 'healthy' ? '#10b981' : '#ef4444'
  fontWeight: '500' }
}>
              {component.status === 'healthy' ? '●' : '●'} {component.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Resource Usage Widget
export const ResourceUsageWidget: React.FC<MonitoringWidgetProps> = ({ data, className }) => {
  const resources = data?.resources || {};
  const ResourceBar = ({ label, value, unit, threshold }: {)
  label: string;
  value: number;
    unit: string;
  threshold: { warning: number; critical: number };
  }) => { const getColor = () => {
      if (value >= threshold.critical) return '#dc2626';
      if (value >= threshold.warning) return '#f59e0b';
      return '#10b981' };
    return;
      <div style={{ marginBottom: '16px' }}>
        <div style={ {
  display: 'flex'
  justifyContent: 'space-between'
  alignItems: 'center'
  marginBottom: '4px' }
}>
          <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>{label}</span>
          <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: '600' }}>
            {value.toFixed(1)}{unit}
          </span>
        </div>
        <div style={ {
  width: '100%'
  height: '6px'
  backgroundColor: '#f3f4f6'
  borderRadius: '3px'
  overflow: 'hidden' }
}>
          <div style={{
            width: `${Math.min(value, 100)}%`}

  height: '100%'
            backgroundColor: getColor()
            borderRadius: '3px'
            transition: 'width 0.3s ease';
} />
        </div>
      </div>
    );
  };
  return;
    <div className={`resource-usage-widget ${className}`} style={{},}
  backgroundColor: '#FFFFFF'
      borderRadius: '8px'
      padding: '20px'
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
        Resource Usage
      </h3>
      <ResourceBar
        label="CPU"
        value={resources.cpu || 0}
        unit="%"
        threshold={{ warning: 70, critical: 85 }}
      />
      <ResourceBar
        label="Memory"
        value={resources.memory || 0}
        unit="%"
        threshold={{ warning: 75, critical: 90 }}
      />
      <ResourceBar
        label="Disk"
        value={resources.disk || 0}
        unit="%"
        threshold={{ warning: 80, critical: 95 }}
      />
      <ResourceBar
        label="Network I/O"
        value={resources.network || 0}
        unit="% of capacity"
        threshold={{ warning: 80, critical: 95 }}
      />
    </div>
  );
};

// API Metrics Widget
export const APIMetricsWidget: React.FC<MonitoringWidgetProps> = ({ data, className }) => {
  const metrics = data?.api || {};
  const MetricCard = ({ title, value, unit, trend, trendDirection }: {)
  title: string;
  value: number;
  unit: string;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'stable'
  }) => ()
    <div style={ {
  backgroundColor: '#f9fafb'
  borderRadius: '6px'
  padding: '12px'
  textAlign: 'center' }
}>
      <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        <span style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginLeft: '2px' }}>
          {unit}
        </span>
      </div>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{title}</div>
      { trend !== undefined && ()
        <div style={{
  fontSize: '11px'
  color: trendDirection === 'up' ? '#10b981' : trendDirection === 'down' ? '#ef4444' : '#6b7280'
  display: 'flex'
  alignItems: 'center'
  justifyContent: 'center'
  gap: '2px' }
}>
          {trendDirection === 'up' && '↗'}
          {trendDirection === 'down' && '↘'}
          {trendDirection === 'stable' && '→'}
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
  return;
    <div className={`api-metrics-widget ${className}`} style={{},}
  backgroundColor: '#FFFFFF'
      borderRadius: '8px'
      padding: '20px'
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
        API Performance
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <MetricCard
          title="Requests/sec"
          value={metrics.requestsPerSecond || 0}
          unit="req/s"
          trend={5.2}
          trendDirection="up"
        />
        <MetricCard
          title="Avg Latency"
          value={metrics.averageLatency || 0}
          unit="ms"
          trend={-2.1}
          trendDirection="down"
        />
        <MetricCard
          title="Error Rate"
          value={metrics.errorRate || 0}
          unit="%"
          trend={-15.3}
          trendDirection="down"
        />
        <MetricCard
          title="Active Connections"
          value={metrics.activeConnections || 0}
          unit=""
          trend={8.7}
          trendDirection="up"
        />
      </div>
    </div>
  );
};

// Security Overview Widget
export const SecurityOverviewWidget: React.FC<MonitoringWidgetProps> = ({ data, onAction, className }) => {
  const security = data?.security || {};
  const threats = security.threats || [];
  const SecurityMetric = ({ label, value, status }: { )
  label: string;
  value: number | string;
  status: 'good' | 'warning' | 'critical' }) => { const statusColors = {
  good: '#10b981'
  warning: '#f59e0b'
  critical: '#ef4444' }
};
    return;
      <div style={ {
  display: 'flex'
  alignItems: 'center'
  justifyContent: 'space-between'
  padding: '8px 0'
  borderBottom: '1px solid #f3f4f6' }
}>
        <span style={{ fontSize: '13px', color: '#374151' }}>{label}</span>
        <span style={ {
  fontSize: '14px'
  fontWeight: '600'
  color: statusColors[status] }
}>
          {value}
        </span>
      </div>
    );
  };
  return;
    <div className={`security-overview-widget ${className}`} style={{},}
  backgroundColor: '#FFFFFF'
      borderRadius: '8px'
      padding: '20px'
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
}>
      <div style={ {
  display: 'flex'
  alignItems: 'center'
  justifyContent: 'space-between'
  marginBottom: '16px' }
}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
          Security Status
        </h3>
        <button
          onClick={() => onAction?.('security-overview', 'view-details')}
          style={ {
  padding: '4px 8px'
  backgroundColor: '#f3f4f6'
  border: '1px solid #d1d5db'
  borderRadius: '4px'
  fontSize: '12px'
  cursor: 'pointer'
  color: '#374151' }

        >
          View Details
        </button>
      </div>
      <SecurityMetric
        label="Active Threats"
        value={security.activeThreats || 0}
        status={security.activeThreats > 0 ? 'critical' : 'good'}
      />
      <SecurityMetric
        label="Blocked Attempts"
        value={`${security.blockedAttempts || 0}/24h`}
        status={security.blockedAttempts > 100 ? 'warning' : 'good'}
      />
      <SecurityMetric
        label="Compliance Score"
        value={`${security.complianceScore || 0}%`}
        status={security.complianceScore >= 95 ? 'good' : security.complianceScore >= 85 ? 'warning' : 'critical'}
      />
      <SecurityMetric
        label="Last Security Scan"
        value={security.lastScan ? new Date(security.lastScan).toLocaleDateString() : 'Never'}
        status="good"
      />
      {threats.length > 0 && ()
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: '500', color: '#dc2626', marginBottom: '4px' }}>
            Recent Threats Detected
          </div>
          {threats.slice(0, 2).map((threat: unknown, index: number) => ()
            <div key={index} style={{ fontSize: '11px', color: '#991b1b', marginBottom: '2px' }}>
              • {threat.type}: {threat.source}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Real-time Activity Feed Widget
export const ActivityFeedWidget: React.FC<MonitoringWidgetProps> = ({ data, className }) => { const [activities, setActivities] = useState<any>(data?.activities || []);
  useEffect(() => {
  // Simulate real-time updates
  const interval = setInterval(() => {
  const newActivity = {
  id: Date.now()
  timestamp: new Date().toISOString()
  type: 'info'
  message: 'System health check completed'
  source: 'health-monitor' }
};
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  const getActivityIcon = (type: string) => { switch (type) {
  case 'error': return '🔴';
  case 'warning': return '🟡';
  case 'success': return '🟢';
  case 'info': return '🔵';
  default: return '⚪' };
  return;
    <div className={`activity-feed-widget ${className}`} style={{},}
  backgroundColor: '#FFFFFF'
      borderRadius: '8px'
      padding: '20px'
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
        Recent Activity
      </h3>
      <div style={ {
  maxHeight: '300px'
  overflowY: 'auto'
  display: 'flex'
  flexDirection: 'column'
  gap: '8px' }
}>
        {activities.slice(0, 10).map((activity, index) => ()
          <div key={activity.id || index} style={ {
  display: 'flex'
  alignItems: 'flex-start'
  gap: '8px'
  padding: '8px'
  backgroundColor: '#f9fafb'
  borderRadius: '4px' }
}>
            <span style={{ fontSize: '12px', marginTop: '2px' }}>
              {getActivityIcon(activity.type)}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: '#374151', marginBottom: '2px' }}>
                {activity.message}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                {activity.source} • {new Date(activity.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Configurable Widget Container
export const MonitoringWidget: React.FC<MonitoringWidgetProps> = (props) => {
  const { config, userRole } = props;
  // Check permissions
  if (!config.requiredPermissions.includes(userRole) && !config.requiredPermissions.includes('all')) {
    return null;
  const getSizeStyles = (size: WidgetConfig['size']) => {
    switch (size) {
    case 'small': return { gridColumn: 'span 1', minHeight: '200px' };
    case 'medium': return { gridColumn: 'span 2', minHeight: '250px' };
    case 'large': return { gridColumn: 'span 3', minHeight: '300px' };
    case 'full-width': return { gridColumn: '1 / -1', minHeight: '200px' };
    default: return { gridColumn: 'span 2', minHeight: '250px' };
  };
  const renderWidget = () => {
    switch (config.type) {
    case 'metric':
      if (config.id === 'system-health') return <SystemHealthWidget {...props} />;
      if (config.id === 'resource-usage') return <ResourceUsageWidget {...props} />;
      if (config.id === 'api-metrics') return <APIMetricsWidget {...props} />;
      break;
    case 'status':
      if (config.id === 'security-overview') return <SecurityOverviewWidget {...props} />;
      break;
    case 'list':
      if (config.id === 'activity-feed') return <ActivityFeedWidget {...props} />;
      break;
    default:
      return <div>Widget type not implemented: {config.type}</div>;
    return <div>Unknown widget: {config.id}</div>;
  };
  return;
    <div style={getSizeStyles(config.size)}>
      {renderWidget()}
    </div>
  );
};

export default MonitoringWidget;