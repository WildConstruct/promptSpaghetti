/**
 * Performance Dashboard Component
 * 
 * Real-time performance monitoring dashboard for displaying server and client metrics
 * during load testing and normal operation.
 * 
 * Task: T-1752989144295-168 - Profile server and client performance under load
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePerformanceProfiler } from '../hooks/usePerformanceProfiler';

interface ServerMetrics {
  cpu: number;
  memory: number;
  responseTime: number;
  errorRate: number;
  requestsPerSecond: number;
  timestamp: number;
}

interface ClientMetrics {
  renderTime: number;
  memoryUsage: number;
  responseTime: number;
  layoutShift: number;
  interactionCount: number;
  timestamp: number;
}

interface PerformanceDashboardProps {
  showServerMetrics?: boolean;
  showClientMetrics?: boolean;
  refreshInterval?: number;
  className?: string;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  showServerMetrics = true,
  showClientMetrics = true,
  refreshInterval = 1000,
  className = ''
}) => {
  const [serverMetrics, setServerMetrics] = useState<ServerMetrics | null>(null);
  const [clientMetrics, setClientMetrics] = useState<ClientMetrics | null>(null);
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    isRunning: isClientProfilingRunning, 
    startProfiling, 
    stopProfiling,
    getCurrentStats 
  } = usePerformanceProfiler({
    componentName: 'PerformanceDashboard',
    autoStart: showClientMetrics
  });

  // Fetch server metrics
  const fetchServerMetrics = useCallback(async () => {
    if (!showServerMetrics) return;

    try {
      const response = await fetch('/api/performance/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setServerMetrics({
            ...data.data,
            timestamp: Date.now()
          });
        }
        setIsServerOnline(true);
      } else {
        setIsServerOnline(false);
      }
    } catch (error) {
      setIsServerOnline(false);
      console.warn('Failed to fetch server metrics:', error);
    }
  }, [showServerMetrics]);

  // Update client metrics
  const updateClientMetrics = useCallback(() => {
    if (!showClientMetrics) return;

    const stats = getCurrentStats();
    if (stats) {
      setClientMetrics({
        ...stats,
        timestamp: Date.now()
      });
    }
  }, [showClientMetrics, getCurrentStats]);

  // Setup periodic updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchServerMetrics();
      updateClientMetrics();
    }, refreshInterval);

    // Initial fetch
    fetchServerMetrics();
    updateClientMetrics();
    setIsLoading(false);

    return () => clearInterval(interval);
  }, [fetchServerMetrics, updateClientMetrics, refreshInterval]);

  // Control client profiling
  const toggleClientProfiling = useCallback(() => {
    if (isClientProfilingRunning) {
      stopProfiling();
    } else {
      startProfiling();
    }
  }, [isClientProfilingRunning, startProfiling, stopProfiling]);

  // Server profiling controls
  const startServerProfiling = useCallback(async () => {
    try {
      const response = await fetch('/api/performance/start', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        console.log('Server profiling started');
      } else {
        setError('Failed to start server profiling: ' + data.error);
      }
    } catch (error) {
      setError('Failed to start server profiling: ' + error.message);
    }
  }, []);

  const stopServerProfiling = useCallback(async () => {
    try {
      const response = await fetch('/api/performance/stop', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        console.log('Server profiling stopped');
      } else {
        setError('Failed to stop server profiling: ' + data.error);
      }
    } catch (error) {
      setError('Failed to stop server profiling: ' + error.message);
    }
  }, []);

  const getStatusColor = (value: number, goodThreshold: number, warningThreshold: number): string => {
    if (value <= goodThreshold) return '#22c55e'; // green
    if (value <= warningThreshold) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };


  if (isLoading) {
    return (
      <div className={`performance-dashboard ${className}`} style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading performance dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`performance-dashboard ${className}`} style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #e1e5e9',
        paddingBottom: '15px'
      }}>
        <h2 style={{ margin: 0, color: '#1f2937' }}>⚡ Performance Dashboard</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {showClientMetrics && (
            <button
              onClick={toggleClientProfiling}
              style={{
                padding: '8px 16px',
                backgroundColor: isClientProfilingRunning ? '#ef4444' : '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {isClientProfilingRunning ? 'Stop Client' : 'Start Client'}
            </button>
          )}
          {showServerMetrics && isServerOnline && (
            <>
              <button
                onClick={startServerProfiling}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Start Server
              </button>
              <button
                onClick={stopServerProfiling}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Stop Server
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Server Metrics */}
      {showServerMetrics && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#374151', marginBottom: '15px' }}>
            🖥️ Server Metrics
            <span style={{
              marginLeft: '10px',
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: isServerOnline ? '#dcfce7' : '#fee2e2',
              color: isServerOnline ? '#166534' : '#dc2626'
            }}>
              {isServerOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </h3>
          
          {serverMetrics && isServerOnline ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getStatusColor(serverMetrics.cpu, 50, 80)}`
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280' }}>CPU Usage</h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: getStatusColor(serverMetrics.cpu, 50, 80) 
                }}>
                  {serverMetrics.cpu.toFixed(1)}%
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getStatusColor(serverMetrics.memory, 70, 85)}`
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280' }}>Memory Usage</h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: getStatusColor(serverMetrics.memory, 70, 85) 
                }}>
                  {serverMetrics.memory.toFixed(1)}%
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getStatusColor(serverMetrics.responseTime, 200, 1000)}`
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280' }}>Response Time</h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: getStatusColor(serverMetrics.responseTime, 200, 1000) 
                }}>
                  {serverMetrics.responseTime.toFixed(0)}ms
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getStatusColor(serverMetrics.errorRate, 1, 5)}`
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280' }}>Error Rate</h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: getStatusColor(serverMetrics.errorRate, 1, 5) 
                }}>
                  {serverMetrics.errorRate.toFixed(1)}%
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #3b82f6'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280' }}>Requests/sec</h4>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                  {serverMetrics.requestsPerSecond.toFixed(1)}
                </p>
              </div>
            </div>
          ) : !isServerOnline ? (
            <div style={{
              backgroundColor: '#fee2e2',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#dc2626'
            }}>
              Server metrics unavailable. Make sure the server is running and accessible.
            </div>
          ) : null}
        </div>
      )}

      {/* Client Metrics */}
      {showClientMetrics && (
        <div>
          <h3 style={{ color: '#374151', marginBottom: '15px' }}>
            🌐 Client Metrics
            <span style={{
              marginLeft: '10px',
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: isClientProfilingRunning ? '#dcfce7' : '#fee2e2',
              color: isClientProfilingRunning ? '#166534' : '#dc2626'
            }}>
              {isClientProfilingRunning ? 'PROFILING' : 'STOPPED'}
            </span>
          </h3>
          
          {clientMetrics ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getStatusColor(clientMetrics.renderTime, 16.67, 33.33)}`
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280' }}>Render Time</h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: getStatusColor(clientMetrics.renderTime, 16.67, 33.33) 
                }}>
                  {clientMetrics.renderTime.toFixed(1)}ms
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getStatusColor(clientMetrics.memoryUsage, 70, 85)}`
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280' }}>Memory Usage</h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: getStatusColor(clientMetrics.memoryUsage, 70, 85) 
                }}>
                  {clientMetrics.memoryUsage.toFixed(1)}%
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getStatusColor(clientMetrics.responseTime, 500, 2000)}`
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280' }}>Network Time</h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: getStatusColor(clientMetrics.responseTime, 500, 2000) 
                }}>
                  {clientMetrics.responseTime.toFixed(0)}ms
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getStatusColor(clientMetrics.layoutShift * 1000, 100, 250)}`
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280' }}>Layout Shift</h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: getStatusColor(clientMetrics.layoutShift * 1000, 100, 250) 
                }}>
                  {clientMetrics.layoutShift.toFixed(3)}
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #10b981'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280' }}>Interactions</h4>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                  {clientMetrics.interactionCount}
                </p>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              {isClientProfilingRunning 
                ? 'Collecting client metrics...' 
                : 'Start client profiling to view metrics'
              }
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: '20px',
        padding: '15px 0',
        borderTop: '1px solid #e5e7eb',
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        Last updated: {new Date().toLocaleTimeString()} | 
        Refresh interval: {refreshInterval / 1000}s |
        {serverMetrics && ` Server: ${new Date(serverMetrics.timestamp).toLocaleTimeString()}`}
        {clientMetrics && ` | Client: ${new Date(clientMetrics.timestamp).toLocaleTimeString()}`}
      </div>
    </div>
  );
};

export default PerformanceDashboard;