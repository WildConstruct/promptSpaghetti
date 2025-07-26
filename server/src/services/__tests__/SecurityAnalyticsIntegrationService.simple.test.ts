/**
 * Simplified Security Analytics Integration Service Tests
 * Epic 31.4.3.1 - Security Analytics Performance Monitoring
 * 
 * Basic test suite for SecurityAnalyticsIntegrationService functionality
 */

import { 
  SecurityAnalyticsIntegrationService,
  SecurityAnalyticsIntegrationConfig
} from '../SecurityAnalyticsIntegrationService';

// Mock all external dependencies
jest.mock('../../analytics/AnalyticsCollector', () => ({
  AnalyticsCollector: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    track: jest.fn<unknown[], unknown>()
  }))
}));

jest.mock('../../database/analytics-dao', () => ({
  AnalyticsDAO: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    insertEvent: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown)
  }))
}));

jest.mock('../../admin/guards/AdminAuthGuard', () => ({
  AdminAuthGuard: jest.fn<unknown[], unknown>().mockImplementation(() => ({}))
}));

jest.mock('../../admin/HealthCheckFramework', () => ({
  HealthCheckFramework: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    registerHealthCheck: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown)
  }))
}));

jest.mock('../../admin/DiagnosticService', () => ({
  DiagnosticService: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    registerDiagnostic: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown),
    createAlert: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown)
  }))
}));

// Mock SecurityAnalyticsPerformanceMonitor
jest.mock('../../../../packages/core/security/SecurityAnalyticsPerformanceMonitor', () => ({
  SecurityAnalyticsPerformanceMonitor: jest.fn<unknown[], unknown>().mockImplementation(() => ({
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
  }))
}));

describe('SecurityAnalyticsIntegrationService - Basic Functionality', () => {
  let service: SecurityAnalyticsIntegrationService;
  let mockConfig: SecurityAnalyticsIntegrationConfig;

  beforeEach(() => {
    // Create basic config for testing with proper mock instances
    const mockAnalyticsCollector = { track: jest.fn<unknown[], unknown>() };
    const mockAnalyticsDAO = { insertEvent: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown) };
    const mockHealthCheckFramework = { registerHealthCheck: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown) };
    const mockDiagnosticService = { 
      registerDiagnostic: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown),
      createAlert: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown)
    };

    mockConfig = {
      epic1_analytics_integration: {
        enabled: true,
        analytics_collector: mockAnalyticsCollector as any,
        analytics_dao: mockAnalyticsDAO as any,
        performance_event_forwarding: true,
        batch_size: 10,
        flush_interval_ms: 1000
      },
      epic17_admin_integration: {
        enabled: true,
        auth_guard: {} as any,
        health_check_framework: mockHealthCheckFramework as any,
        diagnostic_service: mockDiagnosticService as any,
        admin_notification_enabled: true,
        security_alert_threshold: 5
      },
      performance_monitoring: {
        real_time_monitoring_enabled: false, // Disable for simpler testing
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

  describe('Service Creation', () => {
    it('should create SecurityAnalyticsIntegrationService instance', () => {
      expect(service).toBeInstanceOf(SecurityAnalyticsIntegrationService);
    });

    it('should extend EventEmitter', () => {
      expect(service.on).toBeDefined();
      expect(service.emit).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should store configuration correctly', () => {
      const status = service.getIntegrationStatus();
      expect(status).toMatchObject({
        epic1_integration: true,
        epic17_integration: true,
        monitoring_active: false, // Should be false since real_time_monitoring_enabled is false
        metrics_buffer_size: 0,
        alerts_buffer_size: 0
      });
    });
  });

  describe('Integration Status', () => {
    it('should return integration status', () => {
      const status = service.getIntegrationStatus();
      
      expect(status).toHaveProperty('epic1_integration');
      expect(status).toHaveProperty('epic17_integration');
      expect(status).toHaveProperty('monitoring_active');
      expect(status).toHaveProperty('metrics_buffer_size');
      expect(status).toHaveProperty('alerts_buffer_size');
      
      expect(typeof status.epic1_integration).toBe('boolean');
      expect(typeof status.epic17_integration).toBe('boolean');
      expect(typeof status.monitoring_active).toBe('boolean');
      expect(typeof status.metrics_buffer_size).toBe('number');
      expect(typeof status.alerts_buffer_size).toBe('number');
    });
  });

  describe('Event Handling', () => {
    it('should handle security_alert events', (done) => {
      const testAlert = {
        id: 'test-alert',
        severity: 'high' as const,
        type: 'security_threat' as const,
        title: 'Test Alert',
        description: 'Test alert description',
        metrics: {} as any,
        affected_components: ['test_component'],
        recommended_actions: ['test_action'],
        created_at: Date.now()
      };

      service.on('security_alert', (alert) => {
        expect(alert).toEqual(testAlert);
        done();
      });

      service.emit('security_alert', testAlert);
    });

    it('should handle performance_degradation events', (done) => {
      const testData = { performance_score: 45, timestamp: Date.now() };

      service.on('performance_degradation', (data) => {
        expect(data).toEqual(testData);
        done();
      });

      service.emit('performance_degradation', testData);
    });

    it('should handle error events', (done) => {
      const testError = { error: new Error('Test error'), context: 'test' };

      service.on('error', (errorData) => {
        expect(errorData.error).toBeInstanceOf(Error);
        expect(errorData.context).toBe('test');
        done();
      });

      service.emit('error', testError);
    });
  });

  describe('Lifecycle Management', () => {
    it('should initialize without throwing errors', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
    });

    it('should shutdown gracefully', async () => {
      await service.initialize();
      await expect(service.shutdown()).resolves.not.toThrow();
    });

    it('should emit initialized event on initialization', async () => {
      const initSpy = jest.fn<unknown[], unknown>();
      service.on('initialized', initSpy);

      await service.initialize();

      expect(initSpy).toHaveBeenCalledWith(
        expect.objectContaining({ timestamp: expect.any(Number) })
      );
    });

    it('should emit shutdown event on shutdown', async () => {
      const shutdownSpy = jest.fn<unknown[], unknown>();
      service.on('shutdown', shutdownSpy);

      await service.initialize();
      await service.shutdown();

      expect(shutdownSpy).toHaveBeenCalledWith(
        expect.objectContaining({ timestamp: expect.any(Number) })
      );
    });
  });

  describe('Configuration Validation', () => {
    it('should handle disabled Epic 1 integration', () => {
      const disabledConfig = {
        ...mockConfig,
        epic1_analytics_integration: {
          ...mockConfig.epic1_analytics_integration,
          enabled: false
        }
      };

      const disabledService = new SecurityAnalyticsIntegrationService(disabledConfig);
      const status = disabledService.getIntegrationStatus();

      expect(status.epic1_integration).toBe(false);
    });

    it('should handle disabled Epic 17 integration', () => {
      const disabledConfig = {
        ...mockConfig,
        epic17_admin_integration: {
          ...mockConfig.epic17_admin_integration,
          enabled: false
        }
      };

      const disabledService = new SecurityAnalyticsIntegrationService(disabledConfig);
      const status = disabledService.getIntegrationStatus();

      expect(status.epic17_integration).toBe(false);
    });

    it('should handle real-time monitoring enabled configuration', () => {
      const realtimeConfig = {
        ...mockConfig,
        performance_monitoring: {
          ...mockConfig.performance_monitoring,
          real_time_monitoring_enabled: true
        }
      };

      const realtimeService = new SecurityAnalyticsIntegrationService(realtimeConfig);
      // Note: monitoring_active would be true after initialization with real-time enabled
      expect(realtimeService).toBeInstanceOf(SecurityAnalyticsIntegrationService);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      service.on('error', errorSpy);

      // Mock an initialization error
      const mockSecurityAnalyticsPerformanceMonitor = require('../../../../packages/core/security/SecurityAnalyticsPerformanceMonitor');
      mockSecurityAnalyticsPerformanceMonitor.SecurityAnalyticsPerformanceMonitor.mockImplementationOnce(() => ({
        initialize: jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Init failed')),
        on: jest.fn<unknown[], unknown>(),
        shutdown: jest.fn<unknown[], unknown>()
      }));

      const failingService = new SecurityAnalyticsIntegrationService(mockConfig);

      await expect(failingService.initialize()).rejects.toThrow('Init failed');
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          context: 'initialization'
        })
      );
    });
  });
});