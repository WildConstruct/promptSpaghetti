/**
 * Security Analytics Performance API Routes Tests
 * Epic 31.4.3.1 - Security Analytics Performance Monitoring
 * 
 * Comprehensive test suite for security analytics performance monitoring API endpoints.
 */

import { FastifyInstance } from 'fastify';
import { build } from '../../app';
import { SecurityAnalyticsIntegrationService } from '../services/SecurityAnalyticsIntegrationService';

// Mock the service
jest.mock('../services/SecurityAnalyticsIntegrationService');

describe('Security Analytics Performance API Routes', () => {
  let app: FastifyInstance;
  let mockService: jest.Mocked<SecurityAnalyticsIntegrationService>;

  beforeAll(async () => {
    app = build({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock service
    mockService = {
      initialize: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown),
      getIntegrationStatus: jest.fn<unknown[], unknown>().mockReturnValue({
        epic1_integration: true,
        epic17_integration: true,
        monitoring_active: true,
        metrics_buffer_size: 5,
        alerts_buffer_size: 2
      } as unknown),
      getCurrentPerformanceMetrics: jest.fn<unknown[], unknown>().mockResolvedValue({
        timestamp: Date.now( as unknown),
        performance_score: 85,
        throughput_events_per_second: 100,
        latency_p95_ms: 50,
        memory_usage_mb: 128,
        cpu_usage_percent: 30,
        active_threats_detected: 2,
        security_events_processed: 1000,
        compliance_violations: 0,
        system_availability_percent: 99.5
      }),
      performDeepDiagnostics: jest.fn<unknown[], unknown>().mockResolvedValue({
        timestamp: Date.now( as unknown),
        integration_status: {
          epic1_analytics: true,
          epic17_admin: true,
          real_time_monitoring: true
        },
        system_health: {
          buffer_sizes: { metrics: 5, alerts: 2 },
          monitoring_active: true
        }
      }),
      shutdown: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown),
      on: jest.fn<unknown[], unknown>(),
      emit: jest.fn<unknown[], unknown>()
    } as any;

    // Mock the service initialization
    (SecurityAnalyticsIntegrationService as jest.Mock).mockImplementation(() => mockService);
  });

  describe('GET /api/security-analytics/performance/status', () => {
    it('should return security analytics status for authenticated users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/security-analytics/performance/status',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.payload);
      expect(data).toMatchObject({
        success: true,
        data: {
          integration_status: {
            epic1_integration: true,
            epic17_integration: true,
            monitoring_active: true
          },
          current_metrics: {
            performance_score: 85,
            system_availability_percent: 99.5
          }
        },
        timestamp: expect.any(Number)
      });
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/security-analytics/performance/status'
      });

      expect(response.statusCode).toBe(401);
    });

    it('should handle service errors gracefully', async () => {
      mockService.getCurrentPerformanceMetrics.mockRejectedValue(new Error('Service error'));

      const response = await app.inject({
        method: 'GET',
        url: '/api/security-analytics/performance/status',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.payload);
      expect(data).toMatchObject({
        success: false,
        error: 'Failed to get security analytics status',
        timestamp: expect.any(Number)
      });
    });
  });

  describe('GET /api/security-analytics/performance/metrics', () => {
    it('should return detailed performance metrics with default parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/security-analytics/performance/metrics',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.payload);
      expect(data).toMatchObject({
        success: true,
        data: {
          current_metrics: {
            performance_score: 85,
            throughput_events_per_second: 100,
            active_threats_detected: 2
          },
          integration_status: {
            monitoring_active: true
          }
        },
        timestamp: expect.any(Number)
      });

      expect(mockService.getCurrentPerformanceMetrics).toHaveBeenCalled();
      expect(mockService.getIntegrationStatus).toHaveBeenCalled();
    });

    it('should include diagnostics when requested', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/security-analytics/performance/metrics?includeDiagnostics=true',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.payload);
      expect(data.data.diagnostics).toBeDefined();
      expect(data.data.diagnostics.system_health).toBeDefined();
      
      expect(mockService.performDeepDiagnostics).toHaveBeenCalled();
    });

    it('should support time range filtering', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/security-analytics/performance/metrics?timeRange=last_day',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
    });

    it('should validate query parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/security-analytics/performance/metrics?timeRange=invalid_range',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/security-analytics/performance/alerts/acknowledge', () => {
    it('should acknowledge security analytics alerts', async () => {
      const alertData = {
        alertId: 'alert-123',
        acknowledgedBy: 'admin-user'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/security-analytics/performance/alerts/acknowledge',
        headers: {
          authorization: 'Bearer valid-token',
          'content-type': 'application/json'
        },
        payload: JSON.stringify(alertData)
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.payload);
      expect(data).toMatchObject({
        success: true,
        data: {
          alert_id: 'alert-123',
          acknowledged_by: 'admin-user',
          acknowledged_at: expect.any(Number)
        },
        timestamp: expect.any(Number)
      });
    });

    it('should require valid request body', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/security-analytics/performance/alerts/acknowledge',
        headers: {
          authorization: 'Bearer valid-token',
          'content-type': 'application/json'
        },
        payload: JSON.stringify({})
      });

      expect(response.statusCode).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/security-analytics/performance/alerts/acknowledge',
        headers: {
          'content-type': 'application/json'
        },
        payload: JSON.stringify({
          alertId: 'alert-123',
          acknowledgedBy: 'admin-user'
        })
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/security-analytics/performance/health', () => {
    it('should return system health without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/security-analytics/performance/health'
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.payload);
      expect(data).toMatchObject({
        success: true,
        data: {
          healthy: true,
          performance_score: 85,
          system_availability: 99.5,
          active_threats: 2,
          last_check: expect.any(Number)
        },
        timestamp: expect.any(Number)
      });
    });

    it('should determine health status based on metrics', async () => {
      // Mock degraded performance
      mockService.getCurrentPerformanceMetrics.mockResolvedValue({
        timestamp: Date.now( as unknown),
        performance_score: 75, // Still above 80 threshold
        throughput_events_per_second: 50,
        latency_p95_ms: 100,
        memory_usage_mb: 256,
        cpu_usage_percent: 60,
        active_threats_detected: 1,
        security_events_processed: 500,
        compliance_violations: 0,
        system_availability_percent: 98.5 // Below 99.0% threshold
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/security-analytics/performance/health'
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.payload);
      expect(data.data.healthy).toBe(false); // Should be unhealthy due to availability
    });

    it('should handle health check errors', async () => {
      mockService.getCurrentPerformanceMetrics.mockRejectedValue(new Error('Health check failed'));

      const response = await app.inject({
        method: 'GET',
        url: '/api/security-analytics/performance/health'
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.payload);
      expect(data).toMatchObject({
        success: false,
        error: 'Failed to get system health',
        timestamp: expect.any(Number)
      });
    });
  });

  describe('POST /api/security-analytics/performance/optimize', () => {
    it('should trigger performance optimization for authenticated users', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/security-analytics/performance/optimize',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.payload);
      expect(data).toMatchObject({
        success: true,
        data: {
          optimization_started: true,
          started_at: expect.any(Number)
        },
        timestamp: expect.any(Number)
      });
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/security-analytics/performance/optimize'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/security-analytics/performance/diagnostics', () => {
    it('should return comprehensive diagnostics for authenticated users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/security-analytics/performance/diagnostics',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.payload);
      expect(data).toMatchObject({
        success: true,
        data: {
          timestamp: expect.any(Number),
          integration_status: {
            epic1_analytics: true,
            epic17_admin: true,
            real_time_monitoring: true
          },
          system_health: {
            buffer_sizes: {
              metrics: 5,
              alerts: 2
            },
            monitoring_active: true
          }
        },
        timestamp: expect.any(Number)
      });

      expect(mockService.performDeepDiagnostics).toHaveBeenCalled();
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/security-analytics/performance/diagnostics'
      });

      expect(response.statusCode).toBe(401);
    });

    it('should handle diagnostic errors', async () => {
      mockService.performDeepDiagnostics.mockRejectedValue(new Error('Diagnostics failed'));

      const response = await app.inject({
        method: 'GET',
        url: '/api/security-analytics/performance/diagnostics',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.payload);
      expect(data).toMatchObject({
        success: false,
        error: 'Failed to get diagnostics',
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Service Integration', () => {
    it('should initialize service on route registration', async () => {
      expect(SecurityAnalyticsIntegrationService).toHaveBeenCalled();
      expect(mockService.initialize).toHaveBeenCalled();
    });

    it('should setup event handlers for service events', async () => {
      expect(mockService.on).toHaveBeenCalledWith('security_alert', expect.any(Function));
      expect(mockService.on).toHaveBeenCalledWith('performance_degradation', expect.any(Function));
      expect(mockService.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should cleanup service on server shutdown', async () => {
      // Trigger server close hook
      await app.close();

      expect(mockService.shutdown).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle service initialization errors', async () => {
      mockService.initialize.mockRejectedValue(new Error('Initialization failed'));

      // Re-register routes with failing service
      const failingApp = build({ logger: false });
      
      // Should not throw during route registration
      await expect(failingApp.ready()).resolves.not.toThrow();
      
      await failingApp.close();
    });

    it('should log service events appropriately', async () => {
      const logSpy = jest.spyOn(app.log, 'warn').mockImplementation();
      const errorLogSpy = jest.spyOn(app.log, 'error').mockImplementation();

      // Get the event handler that was registered
      const securityAlertHandler = mockService.on.mock.calls.find(
        call => call[0] === 'security_alert'
      )?.[1];

      const performanceDegradationHandler = mockService.on.mock.calls.find(
        call => call[0] === 'performance_degradation'
      )?.[1];

      const errorHandler = mockService.on.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];

      // Simulate events
      if (securityAlertHandler) {
        securityAlertHandler({ id: 'test-alert', severity: 'high' });
        expect(logSpy).toHaveBeenCalledWith('Security Analytics Alert:', expect.any(Object));
      }

      if (performanceDegradationHandler) {
        performanceDegradationHandler({ performance_score: 45 });
        expect(logSpy).toHaveBeenCalledWith('Security Analytics Performance Degradation:', expect.any(Object));
      }

      if (errorHandler) {
        errorHandler({ error: new Error('Test error'), context: 'test' });
        expect(errorLogSpy).toHaveBeenCalledWith('Security Analytics Service Error:', expect.any(Object));
      }

      logSpy.mockRestore();
      errorLogSpy.mockRestore();
    });
  });

  describe('Response Format Validation', () => {
    it('should return consistent response format for all endpoints', async () => {
      const endpoints = [
        { method: 'GET', url: '/api/security-analytics/performance/status' },
        { method: 'GET', url: '/api/security-analytics/performance/metrics' },
        { method: 'GET', url: '/api/security-analytics/performance/health' },
        { method: 'GET', url: '/api/security-analytics/performance/diagnostics' }
      ];

      for (const endpoint of endpoints) {
        const response = await app.inject({
          method: endpoint.method as any,
          url: endpoint.url,
          headers: endpoint.url.includes('health') ? {} : {
            authorization: 'Bearer valid-token'
          }
        });

        expect(response.statusCode).toBe(200);
        
        const data = JSON.parse(response.payload);
        expect(data).toHaveProperty('success');
        expect(data).toHaveProperty('timestamp');
        expect(typeof data.timestamp).toBe('number');
        
        if (data.success) {
          expect(data).toHaveProperty('data');
        } else {
          expect(data).toHaveProperty('error');
        }
      }
    });
  });
});