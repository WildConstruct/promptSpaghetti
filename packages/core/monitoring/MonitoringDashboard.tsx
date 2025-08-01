/**
 * Real-time Monitoring Dashboard Component
 * Displays system health, performance metrics, and alerts
 */

import React, { useEffect, useState } from 'react';
import { monitoring, analytics, errorTracker } from './MonitoringService';
import { apm } from './APMService';

interface DashboardProps {
  refreshInterval?: number; // seconds
  compactView?: boolean;
}

interface MetricCard {
  title: string;
  value: string | number;
  unit?: string;
  status: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  sparkline?: number[];
}

/**
 * Monitoring Dashboard Component
 */
export const MonitoringDashboard: React.FC<DashboardProps> = ({
  refreshInterval = 5,
  compactView = false,
}) => {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [uptimeChecks, setUptimeChecks] = useState<any[]>([]);
  const [performanceReport, setPerformanceReport] = useState<any>(null);
  const [errorStats, setErrorStats] = useState<any>(null);
  const [funnelConversions, setFunnelConversions] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const updateData = () => {
      // Get performance metrics
      const pageLoadStats = monitoring.getMetricStats('page.load.time', 5);
      const apiResponseStats = monitoring.getMetricStats('api.response.time', 5);
      const errorRateStats = monitoring.getMetricStats('error.rate', 5);
      const memoryStats = monitoring.getMetricStats('memory.usage', 5);
      
      // Build metric cards
      const newMetrics: MetricCard[] = [
        {
          title: 'Page Load Time',
          value: pageLoadStats?.avg.toFixed(0) || '0',
          unit: 'ms',
          status: getMetricStatus(pageLoadStats?.avg || 0, 2000, 3000),
          trend: getTrend(pageLoadStats),
        },
        {
          title: 'API Response Time',
          value: apiResponseStats?.avg.toFixed(0) || '0',
          unit: 'ms',
          status: getMetricStatus(apiResponseStats?.avg || 0, 200, 500),
          trend: getTrend(apiResponseStats),
        },
        {
          title: 'Error Rate',
          value: errorRateStats?.avg.toFixed(2) || '0',
          unit: '%',
          status: getMetricStatus(errorRateStats?.avg || 0, 0.1, 1, true),
          trend: getTrend(errorRateStats),
        },
        {
          title: 'Memory Usage',
          value: formatBytes(memoryStats?.avg || 0),
          unit: '',
          status: getMetricStatus(memoryStats?.avg || 0, 512 * 1024 * 1024, 768 * 1024 * 1024),
          trend: getTrend(memoryStats),
        },
      ];
      
      setMetrics(newMetrics);
      
      // Get active alerts
      setAlerts(monitoring.getActiveAlerts());
      
      // Get uptime status
      setUptimeChecks(apm.getUptimeStatus());
      
      // Get performance report
      setPerformanceReport(apm.getPerformanceReport());
      
      // Get error statistics
      setErrorStats(errorTracker.getErrorStats(1));
      
      // Get funnel conversions
      setFunnelConversions(analytics.getFunnelConversion('epic1-demo', [
        'view',
        'interact',
        'complete',
      ], 24));
    };
    
    updateData();
    const interval = setInterval(updateData, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);
  
  const getMetricStatus = (
    value: number,
    warningThreshold: number,
    criticalThreshold: number,
    reverse: boolean = false
  ): 'good' | 'warning' | 'critical' => {
    if (reverse) {
      if (value >= criticalThreshold) return 'critical';
      if (value >= warningThreshold) return 'warning';
      return 'good';
    } else {
      if (value >= criticalThreshold) return 'critical';
      if (value >= warningThreshold) return 'warning';
      return 'good';
    }
  };
  
  const getTrend = (stats: any): 'up' | 'down' | 'stable' => {
    if (!stats) return 'stable';
    // Simple trend: compare current avg to previous period
    // In production, would use more sophisticated trending
    return 'stable';
  };
  
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const statusColors = {
    good: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444',
  };
  
  if (compactView) {
    return (
      <div style={{
        backgroundColor: '#1f2937',
        color: '#f3f4f6',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>System Status</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {metrics.map((metric, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: statusColors[metric.status],
              }} />
              <span>{metric.title}:</span>
              <span style={{ fontWeight: 'bold' }}>
                {metric.value}{metric.unit}
              </span>
            </div>
          ))}
        </div>
        {alerts.length > 0 && (
          <div style={{
            marginTop: '8px',
            padding: '4px 8px',
            backgroundColor: '#dc2626',
            borderRadius: '4px',
            fontSize: '12px',
          }}>
            {alerts.length} active alert{alerts.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div style={{
      backgroundColor: '#1f2937',
      color: '#f3f4f6',
      padding: '24px',
      borderRadius: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Monitoring Dashboard</h2>
      
      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {metrics.map((metric, index) => (
          <div key={index} style={{
            backgroundColor: '#374151',
            padding: '16px',
            borderRadius: '8px',
            border: `2px solid ${statusColors[metric.status]}`,
          }}>
            <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>
              {metric.title}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'baseline' }}>
              {metric.value}
              {metric.unit && <span style={{ fontSize: '16px', marginLeft: '4px' }}>{metric.unit}</span>}
            </div>
            <div style={{ fontSize: '12px', color: statusColors[metric.status], marginTop: '4px' }}>
              {metric.status.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
      
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Active Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alerts.map((alert) => (
              <div key={alert.id} style={{
                backgroundColor: '#dc2626',
                padding: '12px',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{alert.metric}</div>
                  <div style={{ fontSize: '14px' }}>
                    Value: {alert.value} {alert.condition} {alert.threshold}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#fca5a5' }}>
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Uptime Status */}
      {uptimeChecks.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Uptime Monitoring</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
            {uptimeChecks.map((check) => (
              <div key={check.id} style={{
                backgroundColor: '#374151',
                padding: '12px',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{check.name}</div>
                  <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                    {check.responseTime ? `${check.responseTime}ms` : 'N/A'}
                  </div>
                </div>
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: check.status === 'up' ? '#10b981' : '#ef4444',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>
                  {check.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Performance Baselines */}
      {performanceReport && performanceReport.baselines.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Performance Baselines</h3>
          <div style={{ backgroundColor: '#374151', padding: '16px', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #4b5563' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Metric</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>Target</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>Current</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>Deviation</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {performanceReport.baselines.map((baseline: any, index: number) => (
                  <tr key={index} style={{ borderBottom: '1px solid #4b5563' }}>
                    <td style={{ padding: '8px' }}>{baseline.metric}</td>
                    <td style={{ textAlign: 'right', padding: '8px' }}>
                      {baseline.target}{baseline.unit}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px' }}>
                      {baseline.current.toFixed(2)}{baseline.unit}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px' }}>
                      {baseline.deviation > 0 ? '+' : ''}{baseline.deviation.toFixed(1)}%
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: statusColors[baseline.status],
                        fontSize: '12px',
                      }}>
                        {baseline.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {performanceReport.recommendations.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>Recommendations</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {performanceReport.recommendations.map((rec: string, index: number) => (
                  <li key={index} style={{ marginBottom: '4px', color: '#fbbf24' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Error Statistics */}
      {errorStats && errorStats.total > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Error Statistics (Last Hour)</h3>
          <div style={{ backgroundColor: '#374151', padding: '16px', borderRadius: '8px' }}>
            <div style={{ marginBottom: '12px' }}>
              Total Errors: <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{errorStats.total}</span>
            </div>
            {errorStats.topErrors.length > 0 && (
              <div>
                <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Top Errors:</div>
                {errorStats.topErrors.slice(0, 5).map((error: any, index: number) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    borderBottom: '1px solid #4b5563',
                  }}>
                    <span style={{ fontSize: '14px' }}>{error.message}</span>
                    <span style={{ color: '#ef4444' }}>{error.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Funnel Conversions */}
      {Object.keys(funnelConversions).length > 0 && (
        <div>
          <h3 style={{ marginBottom: '16px' }}>Epic 1 Demo Funnel (Last 24h)</h3>
          <div style={{ backgroundColor: '#374151', padding: '16px', borderRadius: '8px' }}>
            {Object.entries(funnelConversions).map(([step, rate]) => (
              <div key={step} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #4b5563',
              }}>
                <span>{step.replace(/_/g, ' → ')}</span>
                <span style={{ fontWeight: 'bold' }}>
                  {(rate * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};