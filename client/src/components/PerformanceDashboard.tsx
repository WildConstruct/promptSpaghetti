/**
 * Performance Dashboard Component
 * Story 0.1: Performance Infrastructure
 */

import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '@/packages/core/hooks/usePerformance';

const PerformanceDashboard: React.FC = () => {
  const { report, fps, memory } = usePerformanceMonitor(500); // Update every 500ms
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Determine performance status
  const getPerformanceStatus = () => {
    if (!report) return 'unknown';

    if (fps < 30) return 'critical';
    if (fps < 50) return 'warning';
    if (memory.percentage > 80) return 'warning';
    if (memory.percentage > 90) return 'critical';

    return 'good';
  };

  const status = getPerformanceStatus();

  if (isMinimized) {
    return (
      <div
        className="performance-dashboard-minimized"
        onClick={() => setIsMinimized(false)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '8px 12px',
          backgroundColor:
            status === 'critical'
              ? '#ff4444'
              : status === 'warning'
                ? '#ffaa00'
                : '#44ff44',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 9999
        }}
      >
        FPS: {fps.toFixed(0)} | Mem: {memory.percentage.toFixed(0)}%
      </div>
    );
  }

  return (
    <div
      className="performance-dashboard"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '400px',
        maxHeight: '600px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: '#00ff00',
        borderRadius: '8px',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 9999,
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderBottom: '1px solid #00ff00',
          paddingBottom: '8px'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px' }}>⚡ Performance Monitor</h3>
        <button
          onClick={() => setIsMinimized(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#00ff00',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          _
        </button>
      </div>

      {/* FPS & Memory */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}
        >
          <span>FPS</span>
          <span
            style={{
              color: fps < 30 ? '#ff4444' : fps < 50 ? '#ffaa00' : '#00ff00'
            }}
          >
            {fps.toFixed(1)} ({report?.fps.average.toFixed(1)} avg)
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}
        >
          <span>Frame Drops</span>
          <span style={{ color: report?.fps.drops ? '#ffaa00' : '#00ff00' }}>
            {report?.fps.drops || 0}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}
        >
          <span>Memory</span>
          <span
            style={{
              color:
                memory.percentage > 80
                  ? '#ff4444'
                  : memory.percentage > 60
                    ? '#ffaa00'
                    : '#00ff00'
            }}
          >
            {memory.used.toFixed(0)}MB ({memory.percentage.toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* Cache Stats */}
      {report?.cacheStats && (
        <div style={{ marginBottom: '16px' }}>
          <h4
            style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#00ff00' }}
          >
            Cache Performance
          </h4>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}
          >
            <span>Hit Rate</span>
            <span
              style={{
                color: report.cacheStats.hitRate > 85 ? '#00ff00' : '#ffaa00'
              }}
            >
              {report.cacheStats.hitRate.toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}
          >
            <span>Cache Size</span>
            <span>{report.cacheStats.size}</span>
          </div>
        </div>
      )}

      {/* Worker Stats */}
      {report?.workerStats && (
        <div style={{ marginBottom: '16px' }}>
          <h4
            style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#00ff00' }}
          >
            Worker Pool
          </h4>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}
          >
            <span>Queue Length</span>
            <span
              style={{
                color:
                  report.workerStats.queueLength > 5 ? '#ffaa00' : '#00ff00'
              }}
            >
              {report.workerStats.queueLength}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}
          >
            <span>Busy Workers</span>
            <span>{report.workerStats.busyWorkers}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}
          >
            <span>Avg Time</span>
            <span>{report.workerStats.averageTime.toFixed(1)}ms</span>
          </div>
        </div>
      )}

      {/* Metrics */}
      {report?.metrics && Object.keys(report.metrics).length > 0 && (
        <div>
          <h4
            style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#00ff00' }}
          >
            Operation Metrics
          </h4>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {Object.entries(report.metrics).map(([name, stats]) => (
              <div
                key={name}
                onClick={() =>
                  setSelectedMetric(selectedMetric === name ? null : name)
                }
                style={{
                  marginBottom: '8px',
                  padding: '4px',
                  backgroundColor:
                    selectedMetric === name
                      ? 'rgba(0, 255, 0, 0.1)'
                      : 'transparent',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '2px'
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#88ff88' }}>
                    {name}
                  </span>
                  <span style={{ fontSize: '11px' }}>
                    {stats.average.toFixed(1)}ms
                  </span>
                </div>

                {selectedMetric === name && (
                  <div
                    style={{
                      fontSize: '10px',
                      marginTop: '4px',
                      paddingLeft: '8px'
                    }}
                  >
                    <div>Count: {stats.count}</div>
                    <div>Min: {stats.min.toFixed(1)}ms</div>
                    <div>Max: {stats.max.toFixed(1)}ms</div>
                    <div>P50: {stats.p50.toFixed(1)}ms</div>
                    <div>P95: {stats.p95.toFixed(1)}ms</div>
                    <div>P99: {stats.p99.toFixed(1)}ms</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '8px',
          borderTop: '1px solid #00ff00',
          fontSize: '10px',
          textAlign: 'center',
          color:
            status === 'critical'
              ? '#ff4444'
              : status === 'warning'
                ? '#ffaa00'
                : '#00ff00'
        }}
      >
        Status: {status.toUpperCase()}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
