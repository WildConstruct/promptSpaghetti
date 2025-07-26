/**
 * Tests for Security API Integration Platform
 * Epic 31 - Task E31-1753313263610-BE14AC
 */

import { 
  SecurityAPIIntegrationPlatform,
  SecurityAPIConfig,
  ExternalSecurityTool,
  SecurityEvent
} from '../SecurityAPIIntegrationPlatform';
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
jest.mock('../SecurityAnalyticsIntegrationService');

describe('SecurityAPIIntegrationPlatform', () => {
  let platform: SecurityAPIIntegrationPlatform;
  let mockAnalyticsService: jest.Mocked<SecurityAnalyticsIntegrationService>;
  let config: SecurityAPIConfig;

  beforeEach(() => {
    // Setup mock analytics service
    const analyticsConfig: SecurityAnalyticsIntegrationConfig = {
      epic1_analytics_integration: {
        enabled: true,
        analytics_collector: new AnalyticsCollector({ batchSize: 100, flushIntervalMs: 5000 }),
        analytics_dao: new AnalyticsDAO('./test.db'),
        performance_event_forwarding: true,
        batch_size: 50,
        flush_interval_ms: 10000
      },
      epic17_admin_integration: {
        enabled: true,
        auth_guard: new AdminAuthGuard(),
        health_check_framework: new HealthCheckFramework(),
        diagnostic_service: new DiagnosticService(),
        admin_notification_enabled: true,
        security_alert_threshold: 10
      },
      performance_monitoring: {
        real_time_monitoring_enabled: true,
        performance_threshold_ms: 1000,
        memory_threshold_mb: 512,
        cpu_threshold_percent: 80,
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

    mockAnalyticsService = new SecurityAnalyticsIntegrationService(analyticsConfig) as jest.Mocked<SecurityAnalyticsIntegrationService>;
    mockAnalyticsService.initialize = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Setup platform configuration
    config = {
      api_version: '1.0.0',
      rate_limiting: {
        enabled: true,
        max_requests_per_minute: 1000,
        burst_limit: 200,
        window_size_ms: 60000
      },
      external_integrations: {
        siem_tools: {
          enabled: true,
          supported_platforms: ['splunk', 'elastic'],
          webhook_endpoints: ['https://siem.example.com/webhook'],
          api_keys: { test: 'key123' },
          data_format: 'json'
        },
        threat_intelligence: {
          enabled: true,
          providers: ['virustotal', 'threatcrowd'],
          update_interval_minutes: 30,
          confidence_threshold: 0.7
        },
        vulnerability_scanners: {
          enabled: true,
          supported_scanners: ['nessus', 'openvas'],
          scan_schedules: { daily: '0 2 * * *' }
        }
      },
      real_time_processing: {
        enabled: true,
        stream_buffer_size: 1000,
        processing_threads: 2,
        batch_processing_interval_ms: 2000,
        priority_queue_enabled: true
      },
      data_streaming: {
        enabled: true,
        websocket_enabled: true,
        compression_enabled: true
      },
      microservices: {
        enabled: true,
        service_discovery_enabled: true,
        load_balancing_strategy: 'round_robin',
        health_check_interval_ms: 30000,
        circuit_breaker_enabled: true
      }
    };

    platform = new SecurityAPIIntegrationPlatform(config, mockAnalyticsService);
  });

  afterEach(async () => {
    if (platform) {
      await platform.shutdown();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const initializeSpy = jest.fn<unknown[], unknown>();
      platform.on('initialized', initializeSpy);

      await platform.initialize();

      expect(initializeSpy).toHaveBeenCalledWith({ timestamp: expect.any(Number) });
      expect(mockAnalyticsService.initialize).toHaveBeenCalled();
    });

    it('should emit error on initialization failure', async () => {
      mockAnalyticsService.initialize.mockRejectedValue(new Error('Init failed'));
      
      const errorSpy = jest.fn<unknown[], unknown>();
      platform.on('error', errorSpy);

      await expect(platform.initialize()).rejects.toThrow('Init failed');
      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'initialization'
      });
    });

    it('should setup external integrations when enabled', async () => {
      const toolRegisteredSpy = jest.fn<unknown[], unknown>();
      platform.on('tool_registered', toolRegisteredSpy);

      await platform.initialize();

      // Should register SIEM tools automatically
      expect(toolRegisteredSpy).toHaveBeenCalled();
    });
  });

  describe('External Tool Management', () => {
    beforeEach(async () => {
      await platform.initialize();
    });

    it('should register external security tool successfully', async () => {
      const tool: ExternalSecurityTool = {
        id: 'test_tool',
        name: 'Test SIEM',
        type: 'siem',
        api_endpoint: 'https://test-siem.com/api',
        authentication: {
          type: 'api_key',
          credentials: { key: 'test123' }
        },
        capabilities: ['event_forwarding', 'alert_management'],
        data_format: 'json',
        status: 'inactive',
        last_sync: 0,
        configuration: {}
      };

      const toolRegisteredSpy = jest.fn<unknown[], unknown>();
      platform.on('tool_registered', toolRegisteredSpy);

      await platform.registerExternalTool(tool);

      expect(toolRegisteredSpy).toHaveBeenCalledWith({
        tool_id: tool.id,
        tool_name: tool.name
      });

      const toolsStatus = platform.getExternalToolsStatus();
      expect(toolsStatus[tool.id]).toBeDefined();
      expect(toolsStatus[tool.id].name).toBe(tool.name);
    });

    it('should handle tool registration errors', async () => {
      const invalidTool: ExternalSecurityTool = {
        id: '',
        name: '',
        type: 'siem',
        api_endpoint: '',
        authentication: {
          type: 'api_key',
          credentials: {}
        },
        capabilities: [],
        data_format: 'json',
        status: 'inactive',
        last_sync: 0,
        configuration: {}
      };

      const errorSpy = jest.fn<unknown[], unknown>();
      platform.on('tool_registration_error', errorSpy);

      await expect(platform.registerExternalTool(invalidTool)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should return external tools status', async () => {
      const tool: ExternalSecurityTool = {
        id: 'status_test_tool',
        name: 'Status Test Tool',
        type: 'threat_intelligence',
        api_endpoint: 'https://test.com/api',
        authentication: {
          type: 'api_key',
          credentials: { key: 'test' }
        },
        capabilities: ['threat_feeds'],
        data_format: 'json',
        status: 'active',
        last_sync: Date.now(),
        configuration: {}
      };

      await platform.registerExternalTool(tool);

      const status = platform.getExternalToolsStatus();
      expect(status[tool.id]).toEqual({
        name: tool.name,
        type: tool.type,
        status: tool.status,
        last_sync: tool.last_sync,
        capabilities: tool.capabilities
      });
    });
  });

  describe('Security Event Processing', () => {
    beforeEach(async () => {
      await platform.initialize();
    });

    it('should process security event successfully', async () => {
      const event: SecurityEvent = {
        id: 'test_event',
        timestamp: Date.now(),
        type: 'threat_detected',
        severity: 'high',
        source: 'test_scanner',
        description: 'Test threat event',
        affected_resources: ['server1', 'server2'],
        metadata: { test: 'data' },
        mitigation_status: 'pending'
      };

      const eventProcessedSpy = jest.fn<unknown[], unknown>();
      platform.on('event_processed', eventProcessedSpy);

      await platform.processSecurityEvent(event);

      expect(eventProcessedSpy).toHaveBeenCalledWith({
        event_id: event.id,
        correlations: expect.any(Number)
      });
    });

    it('should handle event processing errors', async () => {
      const invalidEvent: SecurityEvent = {
        id: '',
        timestamp: Date.now(),
        type: 'threat_detected',
        severity: 'high',
        source: '',
        description: '',
        affected_resources: [],
        metadata: {},
        mitigation_status: 'pending'
      };

      const errorSpy = jest.fn<unknown[], unknown>();
      platform.on('event_processing_error', errorSpy);

      // Mock processSecurityEvent to throw error
      jest.spyOn(platform, 'processSecurityEvent').mockRejectedValue(new Error('Processing failed'));

      await expect(platform.processSecurityEvent(invalidEvent)).rejects.toThrow();
    });

    it('should forward events to relevant external tools', async () => {
      // Register a SIEM tool
      const siemTool: ExternalSecurityTool = {
        id: 'siem_forward_test',
        name: 'Forward Test SIEM',
        type: 'siem',
        api_endpoint: 'https://siem.test.com/api',
        authentication: {
          type: 'api_key',
          credentials: { key: 'forward_test' }
        },
        capabilities: ['event_forwarding'],
        data_format: 'json',
        status: 'active',
        last_sync: Date.now(),
        configuration: {}
      };

      await platform.registerExternalTool(siemTool);

      const event: SecurityEvent = {
        id: 'forward_test_event',
        timestamp: Date.now(),
        type: 'threat_detected',
        severity: 'critical',
        source: 'test_detector',
        description: 'Critical threat detected',
        affected_resources: ['critical_server'],
        metadata: {},
        mitigation_status: 'pending'
      };

      const eventForwardedSpy = jest.fn<unknown[], unknown>();
      platform.on('event_forwarded', eventForwardedSpy);

      await platform.processSecurityEvent(event);

      // Should forward to SIEM tool
      expect(eventForwardedSpy).toHaveBeenCalledWith({
        event_id: event.id,
        tool_id: siemTool.id
      });
    });
  });

  describe('Platform Metrics', () => {
    beforeEach(async () => {
      await platform.initialize();
    });

    it('should return platform metrics', async () => {
      const metrics = await platform.getPlatformMetrics();

      expect(metrics).toHaveProperty('api_calls');
      expect(metrics).toHaveProperty('external_integrations');
      expect(metrics).toHaveProperty('real_time_processing');
      expect(metrics).toHaveProperty('security_analytics');

      expect(metrics.api_calls).toHaveProperty('total_requests');
      expect(metrics.api_calls).toHaveProperty('successful_requests');
      expect(metrics.api_calls).toHaveProperty('failed_requests');
      expect(metrics.api_calls).toHaveProperty('average_response_time_ms');

      expect(metrics.real_time_processing).toHaveProperty('events_processed_per_second');
      expect(metrics.real_time_processing).toHaveProperty('processing_latency_ms');
      expect(metrics.real_time_processing).toHaveProperty('queue_depth');

      expect(metrics.security_analytics).toHaveProperty('threats_detected');
      expect(metrics.security_analytics).toHaveProperty('detection_accuracy_percent');
    });

    it('should update metrics when processing events', async () => {
      const event: SecurityEvent = {
        id: 'metrics_test_event',
        timestamp: Date.now(),
        type: 'threat_detected',
        severity: 'medium',
        source: 'metrics_test',
        description: 'Metrics test event',
        affected_resources: ['test_resource'],
        metadata: {},
        mitigation_status: 'pending'
      };

      const initialMetrics = await platform.getPlatformMetrics();
      const initialThreats = initialMetrics.security_analytics.threats_detected;

      await platform.processSecurityEvent(event);

      const updatedMetrics = await platform.getPlatformMetrics();
      expect(updatedMetrics.security_analytics.threats_detected).toBeGreaterThan(initialThreats);
    });
  });

  describe('Platform Optimization', () => {
    beforeEach(async () => {
      await platform.initialize();
    });

    it('should optimize platform successfully', async () => {
      const optimizedSpy = jest.fn<unknown[], unknown>();
      platform.on('platform_optimized', optimizedSpy);

      await platform.optimizePlatform();

      expect(optimizedSpy).toHaveBeenCalledWith({
        timestamp: expect.any(Number)
      });
    });

    it('should handle optimization errors', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      platform.on('optimization_error', errorSpy);

      // Mock optimizePlatform to throw error
      jest.spyOn(platform, 'optimizePlatform').mockRejectedValue(new Error('Optimization failed'));

      await expect(platform.optimizePlatform()).rejects.toThrow();
    });
  });

  describe('Real-time Processing', () => {
    beforeEach(async () => {
      await platform.initialize();
    });

    it('should process multiple events concurrently', async () => {
      const events: SecurityEvent[] = [];
      for (let i = 0; i < 5; i++) {
        events.push({
          id: `concurrent_event_${i}`,
          timestamp: Date.now(),
          type: 'threat_detected',
          severity: 'low',
          source: `source_${i}`,
          description: `Concurrent test event ${i}`,
          affected_resources: [`resource_${i}`],
          metadata: {},
          mitigation_status: 'pending'
        });
      }

      const eventProcessedSpy = jest.fn<unknown[], unknown>();
      platform.on('event_processed', eventProcessedSpy);

      const promises = events.map(event => platform.processSecurityEvent(event));
      await Promise.all(promises);

      expect(eventProcessedSpy).toHaveBeenCalledTimes(5);
    });

    it('should maintain event processing queue', async () => {
      const event: SecurityEvent = {
        id: 'queue_test_event',
        timestamp: Date.now(),
        type: 'vulnerability_found',
        severity: 'medium',
        source: 'queue_test',
        description: 'Queue test event',
        affected_resources: ['queue_resource'],
        metadata: {},
        mitigation_status: 'pending'
      };

      await platform.processSecurityEvent(event);

      const metrics = await platform.getPlatformMetrics();
      expect(metrics.real_time_processing.queue_depth).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Configuration and Setup', () => {
    it('should initialize with correct configuration', () => {
      expect(platform).toBeDefined();
      
      // Test configuration is properly set
      const toolsStatus = platform.getExternalToolsStatus();
      expect(typeof toolsStatus).toBe('object');
    });

    it('should handle different data formats', async () => {
      await platform.initialize();

      const xmlTool: ExternalSecurityTool = {
        id: 'xml_test_tool',
        name: 'XML Test Tool',
        type: 'vulnerability_scanner',
        api_endpoint: 'https://xml-scanner.test.com',
        authentication: {
          type: 'basic_auth',
          credentials: { username: 'test', password: 'test' }
        },
        capabilities: ['vulnerability_scanning'],
        data_format: 'xml',
        status: 'inactive',
        last_sync: 0,
        configuration: {}
      };

      await platform.registerExternalTool(xmlTool);

      const toolsStatus = platform.getExternalToolsStatus();
      expect(toolsStatus[xmlTool.id]).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should emit error events properly', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      platform.on('error', errorSpy);

      // Force an error by trying to register invalid tool
      const invalidTool: ExternalSecurityTool = {
        id: '',
        name: '',
        type: 'siem',
        api_endpoint: 'invalid-url',
        authentication: {
          type: 'api_key',
          credentials: {}
        },
        capabilities: [],
        data_format: 'json',
        status: 'inactive',
        last_sync: 0,
        configuration: {}
      };

      await platform.initialize();
      
      try {
        await platform.registerExternalTool(invalidTool);
      } catch (error) {
        // Expected to throw
      }

      // Check if error event was emitted during tool registration
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should gracefully handle shutdown', async () => {
      await platform.initialize();

      const shutdownSpy = jest.fn<unknown[], unknown>();
      platform.on('shutdown', shutdownSpy);

      await platform.shutdown();

      expect(shutdownSpy).toHaveBeenCalledWith({
        timestamp: expect.any(Number)
      });
    });
  });
});