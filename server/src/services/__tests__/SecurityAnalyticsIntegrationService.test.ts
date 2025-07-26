/**
 * Security Analytics Integration Service Tests
 * Epic 31.4.3.1 - Security Analytics Performance Monitoring
 * 
 * Comprehensive test suite for SecurityAnalyticsIntegrationService
 * testing Epic 1 and Epic 17 integration, performance monitoring, and alerting.
 */

import { 
  SecurityAnalyticsIntegrationService,
  SecurityAnalyticsIntegrationConfig
} from '../SecurityAnalyticsIntegrationService';
import { AnalyticsCollector } from '../../analytics/AnalyticsCollector';
import { AnalyticsDAO } from '../../database/analytics-dao';
import { AdminAuthGuard } from '../../admin/guards/AdminAuthGuard';
import { HealthCheckFramework } from '../../admin/HealthCheckFramework';
import { DiagnosticService } from '../../admin/DiagnosticService';

// Mock dependencies
jest.mock('../../analytics/AnalyticsCollector');
jest.mock('../../database/analytics-dao');
jest.mock('../../admin/guards/AdminAuthGuard');
jest.mock('../../admin/HealthCheckFramework');
jest.mock('../../admin/DiagnosticService');

// Mock SecurityAnalyticsPerformanceMonitor
const mockSecurityAnalyticsPerformanceMonitor = {
  initialize: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown),
  on: jest.fn<unknown[], unknown>(),
  getCurrentPerformanceProfile: jest.fn<unknown[], unknown>().mockResolvedValue({
    current_state: { overall_performance_score: 85 }
  } as unknown),
  getSystemMetrics: jest.fn<unknown[], unknown>().mockResolvedValue({
    throughput_events_per_second: 100,
    latency_p95_ms: 50,
    memory_usage_mb: 128,
    cpu_usage_percent: 30,
    availability_percent: 99.5
  } as unknown),
  getSecurityMetrics: jest.fn<unknown[], unknown>().mockResolvedValue({
    active_threats: 2,
    events_processed: 1000,
    compliance_violations: 0
  } as unknown),
  shutdown: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown),
  emit: jest.fn<unknown[], unknown>()
};

jest.mock('../../../../packages/core/security/SecurityAnalyticsPerformanceMonitor', () => ({
  SecurityAnalyticsPerformanceMonitor: jest.fn<unknown[], unknown>().mockImplementation(() => mockSecurityAnalyticsPerformanceMonitor)
}));

describe('SecurityAnalyticsIntegrationService', () => {
  let service: SecurityAnalyticsIntegrationService;
  let mockConfig: SecurityAnalyticsIntegrationConfig;
  let mockAnalyticsCollector: jest.Mocked<AnalyticsCollector>;
  let mockAnalyticsDAO: jest.Mocked<AnalyticsDAO>;
  let mockHealthCheckFramework: jest.Mocked<HealthCheckFramework>;
  let mockDiagnosticService: jest.Mocked<DiagnosticService>;

  beforeEach(() => {
    // Setup mocks
    mockAnalyticsCollector = new AnalyticsCollector({}) as jest.Mocked<AnalyticsCollector>;
    mockAnalyticsDAO = new AnalyticsDAO('') as jest.Mocked<AnalyticsDAO>;
    mockHealthCheckFramework = new HealthCheckFramework() as jest.Mocked<HealthCheckFramework>;
    mockDiagnosticService = new DiagnosticService() as jest.Mocked<DiagnosticService>;

    mockConfig = {
      epic1_analytics_integration: {
        enabled: true,
        analytics_collector: mockAnalyticsCollector,
        analytics_dao: mockAnalyticsDAO,
        performance_event_forwarding: true,
        batch_size: 10,
        flush_interval_ms: 1000
      },
      epic17_admin_integration: {
        enabled: true,
        auth_guard: new AdminAuthGuard() as jest.Mocked<AdminAuthGuard>,
        health_check_framework: mockHealthCheckFramework,
        diagnostic_service: mockDiagnosticService,
        admin_notification_enabled: true,
        security_alert_threshold: 5
      },
      performance_monitoring: {
        real_time_monitoring_enabled: true,
        performance_threshold_ms: 500,
        memory_threshold_mb: 256,
        cpu_threshold_percent: 70,
        alert_on_degradation: true,
        auto_optimization_enabled: false
      },
      security_features: {
        threat_detection_enabled: true,
        anomaly_detection_sensitivity: 0.8,
        correlation_analysis_enabled: true,
        predictive_analytics_enabled: false,
        automated_response_enabled: false
      }
    };

    service = new SecurityAnalyticsIntegrationService(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize service with Epic 1 and Epic 17 integrations', async () => {
      // Mock health check registration
      mockHealthCheckFramework.registerHealthCheck = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);
      mockDiagnosticService.registerDiagnostic = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

      await service.initialize();

      expect(mockHealthCheckFramework.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'security_analytics_performance',
          name: 'Security Analytics Performance Monitor'
        })
      );

      expect(mockDiagnosticService.registerDiagnostic).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'security_analytics_deep_diagnostics',
          name: 'Security Analytics Deep Diagnostics'
        })
      );
    });

    it('should emit initialized event on successful initialization', async () => {
      const initializeEventSpy = jest.fn<unknown[], unknown>();
      service.on('initialized', initializeEventSpy);

      await service.initialize();

      expect(initializeEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ timestamp: expect.any(Number) })
      );
    });

    it('should handle initialization errors gracefully', async () => {
      const errorEventSpy = jest.fn<unknown[], unknown>();
      service.on('error', errorEventSpy);

      // Mock initialization failure
      mockHealthCheckFramework.registerHealthCheck = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Registration failed'));

      await expect(service.initialize()).rejects.toThrow('Registration failed');
      expect(errorEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          context: 'initialization'
        })
      );
    });
  });

  describe('Performance Monitoring', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should collect current performance metrics', async () => {
      const metrics = await service.getCurrentPerformanceMetrics();

      expect(metrics).toMatchObject({
        timestamp: expect.any(Number),
        performance_score: expect.any(Number),
        throughput_events_per_second: expect.any(Number),
        latency_p95_ms: expect.any(Number),
        memory_usage_mb: expect.any(Number),
        cpu_usage_percent: expect.any(Number),
        active_threats_detected: expect.any(Number),
        security_events_processed: expect.any(Number),
        compliance_violations: expect.any(Number),
        system_availability_percent: expect.any(Number)
      });
    });

    it('should detect performance degradation and create alerts', async () => {
      const alertEventSpy = jest.fn<unknown[], unknown>();
      service.on('security_alert', alertEventSpy);

      // Mock performance degradation
      const mockMetrics = {
        timestamp: Date.now(),
        performance_score: 45, // Below threshold of 70
        throughput_events_per_second: 10,
        latency_p95_ms: 2000,
        memory_usage_mb: 400,
        cpu_usage_percent: 85,
        active_threats_detected: 2,
        security_events_processed: 100,
        compliance_violations: 0,
        system_availability_percent: 98.5
      };

      const alerts = await service.analyzeMetricsForAlerts(mockMetrics);

      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        severity: 'critical',
        type: 'performance_degradation',
        title: 'Security Analytics Performance Degradation',
        affected_components: ['security_analytics', 'threat_detection']
      });
    });

    it('should detect high threat levels and create security alerts', async () => {
      const mockMetrics = {
        timestamp: Date.now(),
        performance_score: 85,
        throughput_events_per_second: 100,
        latency_p95_ms: 50,
        memory_usage_mb: 128,
        cpu_usage_percent: 30,
        active_threats_detected: 15, // Above threshold of 5
        security_events_processed: 1000,
        compliance_violations: 0,
        system_availability_percent: 99.5
      };

      const alerts = await service.analyzeMetricsForAlerts(mockMetrics);

      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        severity: 'critical',
        type: 'security_threat',
        title: 'High Number of Active Threats Detected',
        affected_components: ['threat_detection', 'security_monitoring']
      });
    });

    it('should detect system availability issues', async () => {
      const mockMetrics = {
        timestamp: Date.now(),
        performance_score: 85,
        throughput_events_per_second: 100,
        latency_p95_ms: 50,
        memory_usage_mb: 128,
        cpu_usage_percent: 30,
        active_threats_detected: 2,
        security_events_processed: 1000,
        compliance_violations: 0,
        system_availability_percent: 94.0 // Below 99.0% threshold
      };

      const alerts = await service.analyzeMetricsForAlerts(mockMetrics);

      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        severity: 'critical',
        type: 'system_failure',
        title: 'Security Analytics System Availability Issue',
        affected_components: ['security_analytics', 'monitoring_infrastructure']
      });
    });
  });

  describe('Epic 1 Analytics Integration', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should forward performance events to Epic 1 analytics collector', async () => {
      mockAnalyticsCollector.track = jest.fn<unknown[], unknown>();

      const mockPerformanceEvent = {
        execution_id: 'test-execution',
        operation_duration_ms: 150,
        memory_usage_mb: 64,
        cpu_usage_percent: 25,
        events_processed: 100,
        threat_detection_accuracy: 0.95,
        compliance_score: 0.98
      };

      // Simulate performance metrics event
      service.emit('performance_metrics', mockPerformanceEvent);

      // Allow async event handling
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'performance_metric',
          operation: 'security_analytics_monitoring',
          duration: 150,
          memoryUsage: 64,
          cpuUsage: 25
        })
      );
    });

    it('should store security metrics in Epic 1 analytics database', async () => {
      mockAnalyticsDAO.insertEvent = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

      const mockMetrics = {
        timestamp: Date.now(),
        performance_score: 85,
        throughput_events_per_second: 100,
        latency_p95_ms: 50,
        memory_usage_mb: 128,
        cpu_usage_percent: 30,
        active_threats_detected: 2,
        security_events_processed: 1000,
        compliance_violations: 0,
        system_availability_percent: 99.5
      };

      await service.storeSecurityMetrics(mockMetrics);

      expect(mockAnalyticsDAO.insertEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'security_performance_metric',
          timestamp: mockMetrics.timestamp,
          data: JSON.stringify(mockMetrics)
        })
      );
    });

    it('should handle Epic 1 integration errors gracefully', async () => {
      const errorEventSpy = jest.fn<unknown[], unknown>();
      service.on('error', errorEventSpy);

      mockAnalyticsDAO.insertEvent = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Database error'));

      const mockMetrics = {
        timestamp: Date.now(),
        performance_score: 85,
        active_threats_detected: 2,
        system_availability_percent: 99.5
      };

      await service.storeSecurityMetrics(mockMetrics);

      expect(errorEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          context: 'store_security_metrics'
        })
      );
    });
  });

  describe('Epic 17 Admin Integration', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should notify admin systems of critical security alerts', async () => {
      mockDiagnosticService.createAlert = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

      const criticalAlert = {
        id: 'critical-alert-123',
        severity: 'critical' as const,
        type: 'security_threat' as const,
        title: 'Critical Security Threat Detected',
        description: 'Multiple threats detected simultaneously',
        metrics: {
          timestamp: Date.now(),
          performance_score: 85,
          active_threats_detected: 20,
          system_availability_percent: 99.5
        },
        affected_components: ['threat_detection'],
        recommended_actions: ['Immediate investigation required'],
        created_at: Date.now()
      };

      await service.notifyAdminSystems(criticalAlert);

      expect(mockDiagnosticService.createAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'critical-alert-123',
          severity: 'critical',
          title: 'Critical Security Threat Detected',
          source: 'security_analytics_integration'
        })
      );
    });

    it('should perform deep diagnostics for Epic 17 integration', async () => {
      const diagnostics = await service.performDeepDiagnostics();

      expect(diagnostics).toMatchObject({
        timestamp: expect.any(Number),
        integration_status: {
          epic1_analytics: true,
          epic17_admin: true,
          real_time_monitoring: expect.any(Boolean)
        },
        current_metrics: expect.any(Object),
        system_health: expect.objectContaining({
          buffer_sizes: expect.any(Object),
          monitoring_active: expect.any(Boolean)
        })
      });
    });

    it('should handle admin notification errors gracefully', async () => {
      const errorEventSpy = jest.fn<unknown[], unknown>();
      service.on('error', errorEventSpy);

      mockDiagnosticService.createAlert = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Admin notification failed'));

      const alert = {
        id: 'test-alert',
        severity: 'high' as const,
        type: 'security_threat' as const,
        title: 'Test Alert',
        description: 'Test alert description',
        metrics: {} as any,
        affected_components: [],
        recommended_actions: [],
        created_at: Date.now()
      };

      await service.notifyAdminSystems(alert);

      expect(errorEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          context: 'notify_admin_systems'
        })
      );
    });
  });

  describe('Service Management', () => {
    it('should provide integration status information', async () => {
      await service.initialize();

      const status = service.getIntegrationStatus();

      expect(status).toMatchObject({
        epic1_integration: true,
        epic17_integration: true,
        monitoring_active: expect.any(Boolean),
        metrics_buffer_size: expect.any(Number),
        alerts_buffer_size: expect.any(Number)
      });
    });

    it('should handle service shutdown gracefully', async () => {
      await service.initialize();

      const shutdownEventSpy = jest.fn<unknown[], unknown>();
      service.on('shutdown', shutdownEventSpy);

      await service.shutdown();

      expect(shutdownEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ timestamp: expect.any(Number) })
      );
    });

    it('should flush metrics buffer during shutdown', async () => {
      await service.initialize();

      mockAnalyticsDAO.insertEvent = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

      // Add metrics to buffer
      const mockMetrics = {
        timestamp: Date.now(),
        performance_score: 85,
        active_threats_detected: 2,
        system_availability_percent: 99.5
      };

      // Force metrics into buffer (this would normally happen during monitoring)
      service['metricsBuffer'].push(mockMetrics);

      await service.shutdown();

      expect(mockAnalyticsDAO.insertEvent).toHaveBeenCalled();
    });
  });

  describe('Real-time Monitoring', () => {
    beforeEach(async () => {
      mockConfig.performance_monitoring.real_time_monitoring_enabled = true;
      mockConfig.epic1_analytics_integration.flush_interval_ms = 100; // Fast for testing
      service = new SecurityAnalyticsIntegrationService(mockConfig);
      await service.initialize();
    });

    afterEach(async () => {
      await service.shutdown();
    });

    it('should start real-time monitoring when enabled', async () => {
      const status = service.getIntegrationStatus();
      expect(status.monitoring_active).toBe(true);
    });

    it('should emit metrics_collected events during real-time monitoring', (done) => {
      service.on('metrics_collected', (metrics) => {
        expect(metrics).toMatchObject({
          timestamp: expect.any(Number),
          performance_score: expect.any(Number)
        });
        done();
      });

      // Real-time monitoring should trigger within flush interval
    }, 1000);

    it('should flush metrics buffer when batch size is reached', async () => {
      const flushEventSpy = jest.fn<unknown[], unknown>();
      service.on('metrics_flushed', flushEventSpy);

      // Fill buffer to trigger flush
      const mockMetrics = {
        timestamp: Date.now(),
        performance_score: 85,
        active_threats_detected: 2,
        system_availability_percent: 99.5
      };

      // Force buffer to batch size
      for (let i = 0; i < mockConfig.epic1_analytics_integration.batch_size; i++) {
        service['metricsBuffer'].push({ ...mockMetrics, timestamp: Date.now() + i });
      }

      await service['flushMetricsBuffer']();

      expect(flushEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ count: expect.any(Number) })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle performance monitor errors', async () => {
      const errorEventSpy = jest.fn<unknown[], unknown>();
      service.on('error', errorEventSpy);

      // Simulate performance monitor error
      service['performanceMonitor'].emit('error', new Error('Performance monitor error'));

      expect(errorEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          context: 'performance_monitor'
        })
      );
    });

    it('should emit performance degradation events', async () => {
      const degradationEventSpy = jest.fn<unknown[], unknown>();
      service.on('performance_degradation', degradationEventSpy);

      const degradationData = { performance_score: 45, timestamp: Date.now() };
      service['performanceMonitor'].emit('performance_degradation', degradationData);

      expect(degradationEventSpy).toHaveBeenCalledWith(degradationData);
    });

    it('should emit security anomaly events', async () => {
      const anomalyEventSpy = jest.fn<unknown[], unknown>();
      service.on('security_anomaly', anomalyEventSpy);

      const anomalyData = { threat_type: 'malicious_activity', confidence: 0.9 };
      service['performanceMonitor'].emit('security_anomaly', anomalyData);

      expect(anomalyEventSpy).toHaveBeenCalledWith(anomalyData);
    });
  });
});