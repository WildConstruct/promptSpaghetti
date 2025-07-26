/**
 * Epic 20.1 - Load Testing & Performance Profiling Unit Tests
 * 
 * Comprehensive unit tests for MetricsCollector component covering:
 * - System metrics collection and validation
 * - WebSocket performance monitoring
 * - Collaboration metrics tracking
 * - Performance alerting system
 * - Metrics aggregation and windowing
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  MetricsCollector,
  SystemMetrics,
  WebSocketMetrics,
  CollaborationMetrics,
  PerformanceThresholds,
  PerformanceAlert,
  MetricsWindow
} from '../MetricsCollector';

// Mock Node.js modules
jest.mock('os');
jest.mock('fs/promises');

const mockOs = {
  cpus: jest.fn<unknown[], unknown>(),
  totalmem: jest.fn<unknown[], unknown>(),
  freemem: jest.fn<unknown[], unknown>(),
  networkInterfaces: jest.fn<unknown[], unknown>()
};

// Replace os module with mock
jest.doMock('os', () => mockOs);

describe('Epic 20.1 - MetricsCollector Unit Tests', () => {
  let metricsCollector: MetricsCollector;
  let mockSystemMetrics: SystemMetrics;
  let mockWebSocketMetrics: WebSocketMetrics;
  let mockCollaborationMetrics: CollaborationMetrics;

  beforeEach(() => {
    // Setup mock system metrics
    mockSystemMetrics = {
      timestamp: Date.now(),
      cpuUsage: 45.5,
      memoryUsage: {
        used: 1024 * 1024 * 512, // 512MB
        total: 1024 * 1024 * 1024 * 8, // 8GB
        percentage: 6.25
      },
      networkStats: {
        bytesReceived: 1024 * 100,
        bytesSent: 1024 * 150,
        packetsReceived: 50,
        packetsSent: 75
      },
      diskUsage: {
        reads: 100,
        writes: 50
      },
      processMetrics: {
        pid: 1234,
        uptime: 3600000, // 1 hour
        heapUsed: 1024 * 1024 * 100,
        heapTotal: 1024 * 1024 * 200,
        external: 1024 * 50,
        arrayBuffers: 1024 * 10
      }
    };

    mockWebSocketMetrics = {
      timestamp: Date.now(),
      connectionCount: 25,
      messageRate: 150.5,
      messageLatency: 45.2,
      disconnectionRate: 0.5,
      errorRate: 0.1,
      bytesTransferred: 1024 * 500,
      activeDocuments: 12,
      averageUsersPerDocument: 2.1
    };

    mockCollaborationMetrics = {
      timestamp: Date.now(),
      conflictRate: 2.3,
      conflictResolutionTime: 125.7,
      synchronizationLatency: 67.8,
      operationRate: 45.0,
      stateUpdateLatency: 23.1,
      presenceUpdateRate: 12.5,
      documentSizeBytes: 1024 * 250,
      operationQueueLength: 5,
      conflictQueueLength: 1
    };

    // Setup OS mocks
    mockOs.cpus.mockReturnValue([
      { times: { user: 1000, nice: 100, sys: 800, idle: 8000, irq: 50 } },
      { times: { user: 1100, nice: 120, sys: 750, idle: 7900, irq: 45 } }
    ] as unknown as unknown as unknown);
    mockOs.totalmem.mockReturnValue(8 * 1024 * 1024 * 1024 as unknown as unknown as unknown); // 8GB
    mockOs.freemem.mockReturnValue(6 * 1024 * 1024 * 1024 as unknown as unknown as unknown); // 6GB free

    // Initialize MetricsCollector with test configuration
    const testThresholds: PerformanceThresholds = {
      maxCpuUsage: 80,
      maxMemoryUsage: 85,
      maxMessageLatency: 100,
      maxConflictResolutionTime: 200,
      maxSynchronizationLatency: 150,
      minSuccessRate: 95,
      maxErrorRate: 5
    };

    metricsCollector = new MetricsCollector(testThresholds);
  });

  afterEach(() => {
    metricsCollector.stop();
    jest.clearAllMocks();
  });

  describe('1. System Metrics Collection', () => {
    it('should collect system metrics accurately', async () => {
      const metrics = await metricsCollector.collectSystemMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.timestamp).toBeGreaterThan(0);
      expect(metrics.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.cpuUsage).toBeLessThanOrEqual(100);

      // Memory validation
      expect(metrics.memoryUsage.used).toBeGreaterThan(0);
      expect(metrics.memoryUsage.total).toBeGreaterThan(metrics.memoryUsage.used);
      expect(metrics.memoryUsage.percentage).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage.percentage).toBeLessThanOrEqual(100);

      // Process metrics validation
      expect(metrics.processMetrics.pid).toBeGreaterThan(0);
      expect(metrics.processMetrics.uptime).toBeGreaterThan(0);
      expect(metrics.processMetrics.heapUsed).toBeGreaterThanOrEqual(0);
      expect(metrics.processMetrics.heapTotal).toBeGreaterThanOrEqual(metrics.processMetrics.heapUsed);
    });

    it('should handle system metrics collection errors gracefully', async () => {
      // Mock OS functions to throw errors
      mockOs.cpus.mockImplementation(() => {
        throw new Error('CPU info unavailable');
      });

      const metrics = await metricsCollector.collectSystemMetrics();

      // Should return default values on error
      expect(metrics.cpuUsage).toBe(0);
      expect(metrics.memoryUsage.percentage).toBe(0);
    });

    it('should validate memory usage calculation accuracy', async () => {
      const metrics = await metricsCollector.collectSystemMetrics();
      
      const expectedPercentage = (metrics.memoryUsage.used / metrics.memoryUsage.total) * 100;
      expect(Math.abs(metrics.memoryUsage.percentage - expectedPercentage)).toBeLessThan(0.1);
    });

    it('should track system metrics over time', async () => {
      const metrics1 = await metricsCollector.collectSystemMetrics();
      
      // Wait a small amount of time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const metrics2 = await metricsCollector.collectSystemMetrics();

      expect(metrics2.timestamp).toBeGreaterThan(metrics1.timestamp);
      expect(metrics2.processMetrics.uptime).toBeGreaterThanOrEqual(metrics1.processMetrics.uptime);
    });
  });

  describe('2. WebSocket Performance Monitoring', () => {
    it('should record WebSocket metrics correctly', () => {
      metricsCollector.recordWebSocketMetrics(mockWebSocketMetrics);

      const recordedMetrics = metricsCollector.getWebSocketMetrics();
      expect(recordedMetrics).toBeDefined();
      expect(recordedMetrics.length).toBe(1);
      expect(recordedMetrics[0]).toEqual(mockWebSocketMetrics);
    });

    it('should calculate WebSocket performance averages', () => {
      // Add multiple WebSocket metrics
      const metrics1 = { ...mockWebSocketMetrics, messageLatency: 40 };
      const metrics2 = { ...mockWebSocketMetrics, messageLatency: 60 };
      const metrics3 = { ...mockWebSocketMetrics, messageLatency: 50 };

      metricsCollector.recordWebSocketMetrics(metrics1);
      metricsCollector.recordWebSocketMetrics(metrics2);
      metricsCollector.recordWebSocketMetrics(metrics3);

      const avgMetrics = metricsCollector.getAverageWebSocketMetrics();
      expect(avgMetrics.messageLatency).toBe(50); // (40 + 60 + 50) / 3
      expect(avgMetrics.connectionCount).toBe(25);
    });

    it('should validate WebSocket metrics thresholds', () => {
      const highLatencyMetrics = {
        ...mockWebSocketMetrics,
        messageLatency: 150 // Above threshold of 100
      };

      metricsCollector.recordWebSocketMetrics(highLatencyMetrics);

      const alerts = metricsCollector.getActiveAlerts();
      const latencyAlert = alerts.find(alert => alert.metric === 'messageLatency');
      
      expect(latencyAlert).toBeDefined();
      expect(latencyAlert?.severity).toBe('warning');
      expect(latencyAlert?.currentValue).toBe(150);
      expect(latencyAlert?.threshold).toBe(100);
    });

    it('should track connection stability metrics', () => {
      const unstableMetrics = {
        ...mockWebSocketMetrics,
        disconnectionRate: 5.5,
        errorRate: 2.1
      };

      metricsCollector.recordWebSocketMetrics(unstableMetrics);

      const stability = metricsCollector.calculateConnectionStability();
      expect(stability.stabilityScore).toBeLessThan(95); // Should be low due to high error rates
      expect(stability.issues.length).toBeGreaterThan(0);
    });
  });

  describe('3. Collaboration Metrics Tracking', () => {
    it('should record collaboration metrics accurately', () => {
      metricsCollector.recordCollaborationMetrics(mockCollaborationMetrics);

      const recordedMetrics = metricsCollector.getCollaborationMetrics();
      expect(recordedMetrics).toBeDefined();
      expect(recordedMetrics.length).toBe(1);
      expect(recordedMetrics[0]).toEqual(mockCollaborationMetrics);
    });

    it('should detect conflict resolution performance issues', () => {
      const slowConflictMetrics = {
        ...mockCollaborationMetrics,
        conflictResolutionTime: 250 // Above threshold of 200
      };

      metricsCollector.recordCollaborationMetrics(slowConflictMetrics);

      const alerts = metricsCollector.getActiveAlerts();
      const conflictAlert = alerts.find(alert => alert.metric === 'conflictResolutionTime');
      
      expect(conflictAlert).toBeDefined();
      expect(conflictAlert?.severity).toBe('warning');
    });

    it('should monitor synchronization performance', () => {
      const slowSyncMetrics = {
        ...mockCollaborationMetrics,
        synchronizationLatency: 175 // Above threshold of 150
      };

      metricsCollector.recordCollaborationMetrics(slowSyncMetrics);

      const syncPerformance = metricsCollector.analyzeSynchronizationPerformance();
      expect(syncPerformance.averageLatency).toBe(175);
      expect(syncPerformance.performanceGrade).toBe('poor');
    });

    it('should calculate collaboration efficiency metrics', () => {
      // Add multiple collaboration metrics with different performance characteristics
      const metrics1 = { ...mockCollaborationMetrics, conflictRate: 1.0, operationRate: 50 };
      const metrics2 = { ...mockCollaborationMetrics, conflictRate: 2.0, operationRate: 40 };
      const metrics3 = { ...mockCollaborationMetrics, conflictRate: 1.5, operationRate: 45 };

      metricsCollector.recordCollaborationMetrics(metrics1);
      metricsCollector.recordCollaborationMetrics(metrics2);
      metricsCollector.recordCollaborationMetrics(metrics3);

      const efficiency = metricsCollector.calculateCollaborationEfficiency();
      expect(efficiency.averageConflictRate).toBe(1.5);
      expect(efficiency.averageOperationRate).toBe(45);
      expect(efficiency.efficiencyScore).toBeGreaterThan(0);
      expect(efficiency.efficiencyScore).toBeLessThanOrEqual(100);
    });
  });

  describe('4. Performance Alerting System', () => {
    it('should generate alerts for performance threshold violations', () => {
      const criticalMetrics: SystemMetrics = {
        ...mockSystemMetrics,
        cpuUsage: 95, // Above threshold of 80
        memoryUsage: {
          ...mockSystemMetrics.memoryUsage,
          percentage: 90 // Above threshold of 85
        }
      };

      metricsCollector.recordSystemMetrics(criticalMetrics);

      const alerts = metricsCollector.getActiveAlerts();
      expect(alerts.length).toBeGreaterThanOrEqual(2);
      
      const cpuAlert = alerts.find(alert => alert.metric === 'cpuUsage');
      const memoryAlert = alerts.find(alert => alert.metric === 'memoryUsage');
      
      expect(cpuAlert?.severity).toBe('critical');
      expect(memoryAlert?.severity).toBe('critical');
    });

    it('should resolve alerts when metrics return to normal', () => {
      // First, create an alert condition
      const criticalMetrics: SystemMetrics = {
        ...mockSystemMetrics,
        cpuUsage: 95
      };
      metricsCollector.recordSystemMetrics(criticalMetrics);

      let alerts = metricsCollector.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);

      // Then, return to normal
      const normalMetrics: SystemMetrics = {
        ...mockSystemMetrics,
        cpuUsage: 45
      };
      metricsCollector.recordSystemMetrics(normalMetrics);

      metricsCollector.resolveThresholdAlerts();
      alerts = metricsCollector.getActiveAlerts();
      
      const unresolvedCpuAlerts = alerts.filter(alert => 
        alert.metric === 'cpuUsage' && !alert.resolved
      );
      expect(unresolvedCpuAlerts.length).toBe(0);
    });

    it('should categorize alert severity correctly', () => {
      const warningMetrics: SystemMetrics = {
        ...mockSystemMetrics,
        cpuUsage: 75 // Between 70-80 (warning range)
      };

      const criticalMetrics: SystemMetrics = {
        ...mockSystemMetrics,
        cpuUsage: 95 // Above 80 (critical range)
      };

      metricsCollector.recordSystemMetrics(warningMetrics);
      metricsCollector.recordSystemMetrics(criticalMetrics);

      const alerts = metricsCollector.getActiveAlerts();
      const sortedAlerts = alerts.sort((a, b) => b.timestamp - a.timestamp);

      // Most recent should be critical
      expect(sortedAlerts[0].severity).toBe('critical');
      expect(sortedAlerts[0].currentValue).toBe(95);
    });

    it('should track alert frequency and patterns', () => {
      // Generate multiple alerts over time
      for (let i = 0; i < 5; i++) {
        const metrics: SystemMetrics = {
          ...mockSystemMetrics,
          cpuUsage: 85 + i, // Escalating CPU usage
          timestamp: Date.now() + i * 1000
        };
        metricsCollector.recordSystemMetrics(metrics);
      }

      const alertAnalysis = metricsCollector.analyzeAlertPatterns();
      expect(alertAnalysis.totalAlerts).toBeGreaterThan(0);
      expect(alertAnalysis.mostCommonMetric).toBe('cpuUsage');
      expect(alertAnalysis.alertFrequency).toBeGreaterThan(0);
    });
  });

  describe('5. Metrics Aggregation and Windowing', () => {
    it('should aggregate metrics within time windows', () => {
      const now = Date.now();
      const windowSize = 60000; // 1 minute

      // Add metrics across different time periods
      for (let i = 0; i < 10; i++) {
        const metrics: SystemMetrics = {
          ...mockSystemMetrics,
          cpuUsage: 40 + i,
          timestamp: now + i * 10000 // 10 second intervals
        };
        metricsCollector.recordSystemMetrics(metrics);
      }

      const window: MetricsWindow = {
        windowStart: now,
        windowEnd: now + windowSize,
        windowSizeMs: windowSize
      };

      const aggregatedMetrics = metricsCollector.aggregateMetricsInWindow(window);
      expect(aggregatedMetrics.systemMetrics.averageCpuUsage).toBeCloseTo(44.5); // Average of 40-49
      expect(aggregatedMetrics.systemMetrics.maxCpuUsage).toBe(49);
      expect(aggregatedMetrics.systemMetrics.minCpuUsage).toBe(40);
    });

    it('should handle empty time windows', () => {
      const futureWindow: MetricsWindow = {
        windowStart: Date.now() + 3600000, // 1 hour in future
        windowEnd: Date.now() + 7200000, // 2 hours in future
        windowSizeMs: 3600000
      };

      const aggregatedMetrics = metricsCollector.aggregateMetricsInWindow(futureWindow);
      expect(aggregatedMetrics.systemMetrics.count).toBe(0);
      expect(aggregatedMetrics.webSocketMetrics.count).toBe(0);
      expect(aggregatedMetrics.collaborationMetrics.count).toBe(0);
    });

    it('should calculate percentile metrics correctly', () => {
      // Add 100 metrics with known distribution
      for (let i = 0; i < 100; i++) {
        const metrics: WebSocketMetrics = {
          ...mockWebSocketMetrics,
          messageLatency: i + 1, // 1-100ms
          timestamp: Date.now() + i * 1000
        };
        metricsCollector.recordWebSocketMetrics(metrics);
      }

      const percentiles = metricsCollector.calculatePercentiles('messageLatency');
      expect(percentiles.p50).toBeCloseTo(50, 5); // Median
      expect(percentiles.p95).toBeCloseTo(95, 5); // 95th percentile
      expect(percentiles.p99).toBeCloseTo(99, 5); // 99th percentile
    });

    it('should maintain rolling window metrics', () => {
      const maxWindowSize = 100;
      metricsCollector.setMaxWindowSize(maxWindowSize);

      // Add more metrics than window size
      for (let i = 0; i < 150; i++) {
        const metrics: SystemMetrics = {
          ...mockSystemMetrics,
          cpuUsage: i,
          timestamp: Date.now() + i * 1000
        };
        metricsCollector.recordSystemMetrics(metrics);
      }

      const allMetrics = metricsCollector.getSystemMetrics();
      expect(allMetrics.length).toBeLessThanOrEqual(maxWindowSize);
      
      // Should contain most recent metrics
      const latestMetric = allMetrics[allMetrics.length - 1];
      expect(latestMetric.cpuUsage).toBeGreaterThan(100);
    });
  });

  describe('6. Performance Analysis and Reporting', () => {
    it('should generate performance summary reports', () => {
      // Add sample metrics
      metricsCollector.recordSystemMetrics(mockSystemMetrics);
      metricsCollector.recordWebSocketMetrics(mockWebSocketMetrics);
      metricsCollector.recordCollaborationMetrics(mockCollaborationMetrics);

      const report = metricsCollector.generatePerformanceReport();
      
      expect(report.summary.totalMetrics).toBeGreaterThan(0);
      expect(report.summary.timeRange.start).toBeDefined();
      expect(report.summary.timeRange.end).toBeDefined();
      expect(report.systemPerformance).toBeDefined();
      expect(report.webSocketPerformance).toBeDefined();
      expect(report.collaborationPerformance).toBeDefined();
      expect(report.alerts.length).toBeGreaterThanOrEqual(0);
    });

    it('should identify performance bottlenecks', () => {
      // Create metrics indicating bottlenecks
      const bottleneckMetrics: SystemMetrics = {
        ...mockSystemMetrics,
        cpuUsage: 95,
        memoryUsage: { ...mockSystemMetrics.memoryUsage, percentage: 90 }
      };

      const slowWebSocketMetrics: WebSocketMetrics = {
        ...mockWebSocketMetrics,
        messageLatency: 200,
        errorRate: 5
      };

      metricsCollector.recordSystemMetrics(bottleneckMetrics);
      metricsCollector.recordWebSocketMetrics(slowWebSocketMetrics);

      const bottlenecks = metricsCollector.identifyPerformanceBottlenecks();
      expect(bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks.some(b => b.category === 'system')).toBe(true);
      expect(bottlenecks.some(b => b.category === 'network')).toBe(true);
    });

    it('should provide performance optimization recommendations', () => {
      // Create suboptimal performance scenario
      metricsCollector.recordSystemMetrics({
        ...mockSystemMetrics,
        cpuUsage: 85,
        memoryUsage: { ...mockSystemMetrics.memoryUsage, percentage: 80 }
      });

      metricsCollector.recordCollaborationMetrics({
        ...mockCollaborationMetrics,
        conflictResolutionTime: 180,
        synchronizationLatency: 140
      });

      const recommendations = metricsCollector.getOptimizationRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.category === 'performance')).toBe(true);
      expect(recommendations.every(r => r.priority >= 1 && r.priority <= 5)).toBe(true);
    });
  });

  describe('7. Error Handling and Edge Cases', () => {
    it('should handle invalid metric data gracefully', () => {
      const invalidMetrics = {
        ...mockSystemMetrics,
        cpuUsage: -10, // Invalid negative value
        memoryUsage: {
          ...mockSystemMetrics.memoryUsage,
          percentage: 150 // Invalid >100% value
        }
      };

      expect(() => {
        metricsCollector.recordSystemMetrics(invalidMetrics);
      }).not.toThrow();

      // Should sanitize invalid values
      const recordedMetrics = metricsCollector.getSystemMetrics();
      const lastMetric = recordedMetrics[recordedMetrics.length - 1];
      expect(lastMetric.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(lastMetric.memoryUsage.percentage).toBeLessThanOrEqual(100);
    });

    it('should handle concurrent metric collection', async () => {
      const promises = [];
      
      // Simulate concurrent metric recording
      for (let i = 0; i < 50; i++) {
        promises.push(
          Promise.resolve().then(() => {
            metricsCollector.recordSystemMetrics({
              ...mockSystemMetrics,
              cpuUsage: Math.random() * 100,
              timestamp: Date.now() + Math.random() * 1000
            });
          })
        );
      }

      await Promise.all(promises);

      const metrics = metricsCollector.getSystemMetrics();
      expect(metrics.length).toBe(50);
      
      // Verify no data corruption
      metrics.forEach(metric => {
        expect(metric.cpuUsage).toBeGreaterThanOrEqual(0);
        expect(metric.cpuUsage).toBeLessThanOrEqual(100);
        expect(metric.timestamp).toBeGreaterThan(0);
      });
    });

    it('should handle memory pressure gracefully', () => {
      const originalMaxSize = 1000;
      metricsCollector.setMaxWindowSize(originalMaxSize);

      // Add metrics that would normally cause memory issues
      for (let i = 0; i < 10000; i++) {
        metricsCollector.recordSystemMetrics({
          ...mockSystemMetrics,
          timestamp: Date.now() + i
        });
      }

      const metrics = metricsCollector.getSystemMetrics();
      expect(metrics.length).toBeLessThanOrEqual(originalMaxSize);
      
      // Should maintain most recent metrics
      const timestamps = metrics.map(m => m.timestamp).sort((a, b) => b - a);
      expect(timestamps[0]).toBeGreaterThan(timestamps[timestamps.length - 1]);
    });
  });
});