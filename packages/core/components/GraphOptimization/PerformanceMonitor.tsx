/**
 * PerformanceMonitor - Real-time graph execution performance monitoring
 */
import React, { useState, useEffect, useRef } from 'react';
interface ExecutionMetric {
  timestamp: number;
  duration: number; // milliseconds
  memoryUsage: number; // bytes
  nodeCount: number;
  cacheHitRate: number; // percentage
  outputLength: number;
}
interface PerformanceStats {
  averageExecutionTime: number;
  peakMemoryUsage: number;
  totalExecutions: number;
  cacheEfficiency: number;
  recentMetrics: ExecutionMetric[];
}
interface PerformanceMonitorProps {
  isVisible: boolean;
  onToggle: () => void;
  onMetricsCollected?: (metrics: ExecutionMetric) => void;
}
const MAX_METRICS_HISTORY = 100;

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({)
  isVisible,
  onToggle,
  onMetricsCollected
}) => {
  const [stats, setStats] = useState<PerformanceStats>({)
    averageExecutionTime: 0,
    peakMemoryUsage: 0,
    totalExecutions: 0,
    cacheEfficiency: 0,
    recentMetrics: [],
  });
  const [isCollecting, setIsCollecting] = useState(false);
  const metricsHistory = useRef<ExecutionMetric[]>([]);
  // Simulate performance monitoring (in real implementation, this would hook into the execution engine)
  useEffect(() => {
    if (!isCollecting) return;
    const interval = setInterval(() => {
      // Simulate a new execution metric
      const metric: ExecutionMetric = {
        timestamp: Date.now(),
        duration: Math.random() * 200 + 50, // 50-250ms
        memoryUsage: Math.random() * 1024 * 1024 + 512 * 1024, // 512KB-1.5MB
        nodeCount: Math.floor(Math.random() * 20 + 5), // 5-25 nodes
        cacheHitRate: Math.random() * 100, // 0-100%
        outputLength: Math.floor(Math.random() * 500 + 100) // 100-600 chars
      };
      metricsHistory.current.push(metric);
      if (metricsHistory.current.length > MAX_METRICS_HISTORY) {
        metricsHistory.current.shift();
      }
      // Calculate updated stats
      const recentMetrics = metricsHistory.current.slice(-20); // Last 20 executions;
      const avgExecutionTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
      const peakMemory = Math.max(...metricsHistory.current.map(m => m.memoryUsage));
      const avgCacheHitRate = recentMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / recentMetrics.length;
      setStats({)
        averageExecutionTime: avgExecutionTime,
        peakMemoryUsage: peakMemory,
        totalExecutions: metricsHistory.current.length,
        cacheEfficiency: avgCacheHitRate,
        recentMetrics
      });
      onMetricsCollected?.(metric);
    }, 1000 + Math.random() * 2000); // Random interval to simulate real executions
    return () => clearInterval(interval);
  }, [isCollecting, onMetricsCollected]);
  const formatMemory = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;}
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;}
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;}
  };
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;}
    return `${(ms / 1000).toFixed(2)}s`;}
  };
  const getPerformanceStatus = (): { color: string; label: string } => {
    if (stats.averageExecutionTime < 100) return { color: '#28a745', label: 'Excellent' };
    if (stats.averageExecutionTime < 500) return { color: '#ffc107', label: 'Good' };
    return { color: '#dc3545', label: 'Needs Optimization' };
  };
  if (!isVisible) {
    return ()
      <div
        onClick={onToggle}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
          zIndex: 999,
        }}
      >
        📊
      </div>
    );
  }
  const performanceStatus = getPerformanceStatus();
  return ()
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '360px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef',
      zIndex: 999,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          color: '#333',
        }}>
          📊 Performance Monitor
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setIsCollecting(!isCollecting)}
            style={{
              padding: '4px 12px',
              backgroundColor: isCollecting ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {isCollecting ? 'Stop' : 'Start'}
          </button>
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#666',
              padding: '2px',
            }}
          >
            ×
          </button>
        </div>
      </div>
      {/* Performance Status */}
      <div style={{
        padding: '16px',
        textAlign: 'center',
        backgroundColor: `${performanceStatus.color}11`,}
        borderBottom: '1px solid #e9ecef'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: performanceStatus.color,
          marginBottom: '4px',
        }}>
          {formatDuration(stats.averageExecutionTime)}
        </div>
        <div style={{
          fontSize: '14px',
          color: performanceStatus.color,
          fontWeight: '500',
        }}>
          {performanceStatus.label} Performance
        </div>
      </div>
      {/* Metrics Grid */}
      <div style={{
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        fontSize: '13px',
      }}>
        <div style={{
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ color: '#6c757d', marginBottom: '4px' }}>Peak Memory</div>
          <div style={{ fontWeight: 'bold', color: '#495057' }}>
            {formatMemory(stats.peakMemoryUsage)}
          </div>
        </div>
        <div style={{
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ color: '#6c757d', marginBottom: '4px' }}>Total Runs</div>
          <div style={{ fontWeight: 'bold', color: '#495057' }}>
            {stats.totalExecutions}
          </div>
        </div>
        <div style={{
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ color: '#6c757d', marginBottom: '4px' }}>Cache Hit Rate</div>
          <div style={{ fontWeight: 'bold', color: stats.cacheEfficiency > 70 ? '#28a745' : '#ffc107' }}>
            {stats.cacheEfficiency.toFixed(0)}%
          </div>
        </div>
        <div style={{
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ color: '#6c757d', marginBottom: '4px' }}>Status</div>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: isCollecting ? '#28a745' : '#6c757d',
            borderRadius: '50%',
            margin: '0 auto'
          }} />
        </div>
      </div>
      {/* Recent Executions */}
      {stats.recentMetrics.length > 0 && ()
        <div style={{
          padding: '16px',
          borderTop: '1px solid #e9ecef'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#495057',
            marginBottom: '12px',
          }}>
            Recent Executions
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '120px',
            overflowY: 'auto',
          }}>
            {stats.recentMetrics.slice(-6).reverse().map((metric, index) => ()
              <div
                key={metric.timestamp}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                  fontSize: '12px',
                  color: '#6c757d',
                  borderBottom: index < 5 ? '1px solid #f1f3f4' : 'none'
                }}
              >
                <div>
                  {new Date(metric.timestamp).toLocaleTimeString()}
                </div>
                <div style={{
                  color: metric.duration < 100 ? '#28a745' : 
                    metric.duration < 300 ? '#ffc107' : '#dc3545',
                  fontWeight: '500',
                }}>
                  {formatDuration(metric.duration)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Quick Actions */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
        display: 'flex',
        gap: '8px',
      }}>
        <button
          onClick={() => {
            metricsHistory.current = [];
            setStats({)
              averageExecutionTime: 0,
              peakMemoryUsage: 0,
              totalExecutions: 0,
              cacheEfficiency: 0,
              recentMetrics: [],
            });
          }}
          style={{
            flex: 1,
            padding: '6px 12px',
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Clear History
        </button>
        <button
          onClick={() => {
            const data = JSON.stringify(stats, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `performance-metrics-${Date.now()}.json`;}
            a.click();
            URL.revokeObjectURL(url);
          }}
          style={{
            flex: 1,
            padding: '6px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Export Data
        </button>
      </div>
    </div>
  );
};

export default PerformanceMonitor;