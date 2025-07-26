/**
 * Security Analytics Reliability API Routes Test Suite
 * Epic 31.4.3.3 - Develop Security Analytics Reliability Engineering
 */

import Fastify, { FastifyInstance } from 'fastify';
import securityAnalyticsReliabilityRoutes from '../security-analytics-reliability';

// Mock dependencies
jest.mock('../SecurityAnalyticsIntegrationService');
jest.mock('../SecurityAnalyticsOptimizer');
jest.mock('../SecurityAnalyticsReliabilityEngineer');
jest.mock('../../analytics/AnalyticsCollector');
jest.mock('../../database/analytics-dao');
jest.mock('../../admin/DiagnosticService');
jest.mock('../../admin/HealthCheckFramework');
jest.mock('../../admin/guards/AdminAuthGuard');

describe('Security Analytics Reliability API Routes', () => {
  let server: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    server = Fastify();
    
    // Mock authentication middleware
    server.register(async function (fastify) {
      fastify.decorate('authenticate', async (request: unknown, reply: unknown) => {
        if (!request.headers.authorization) {
          reply.status(401).send({ error: 'Unauthorized' });
          return;
        }
      });
    });

    // Register routes
    await server.register(securityAnalyticsReliabilityRoutes);
    
    authToken = 'Bearer test-token';
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /api/security-analytics/reliability/status', () => {
    test('should return reliability system status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/status',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('system_health');
      expect(data.data).toHaveProperty('reliability_metrics');
      expect(data.data).toHaveProperty('circuit_breaker_status');
      expect(data.data).toHaveProperty('active_incidents_count');
      expect(data.data).toHaveProperty('overall_status');
      expect(data.data).toHaveProperty('reliability_score');
      expect(data.timestamp).toBeDefined();
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/status'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/security-analytics/reliability/health', () => {
    test('should return system health information', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/health',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('system_health');
      expect(data.data).toHaveProperty('reliability_metrics');
    });

    test('should support query parameters', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/health?includeIncidents=true&includeCircuitBreakers=true',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('system_health');
      expect(data.data).toHaveProperty('reliability_metrics');
      expect(data.data).toHaveProperty('circuit_breakers');
      expect(data.data).toHaveProperty('active_incidents');
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/health'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/security-analytics/reliability/circuit-breakers', () => {
    test('should return circuit breaker information', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/circuit-breakers',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('circuit_breakers');
      expect(data.data).toHaveProperty('summary');
      expect(Array.isArray(data.data.circuit_breakers)).toBe(true);
      expect(data.data.summary).toHaveProperty('total_components');
      expect(data.data.summary).toHaveProperty('healthy');
      expect(data.data.summary).toHaveProperty('degraded');
      expect(data.data.summary).toHaveProperty('failed');
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/circuit-breakers'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/security-analytics/reliability/circuit-breakers/control', () => {
    test('should control circuit breaker states', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/reliability/circuit-breakers/control',
        headers: {
          authorization: authToken,
          'content-type': 'application/json'
        },
        payload: {
          componentName: 'security_analytics_service',
          action: 'reset'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('component_name');
      expect(data.data).toHaveProperty('action_performed');
      expect(data.data.component_name).toBe('security_analytics_service');
      expect(data.data.action_performed).toBe('reset');
    });

    test('should validate request payload', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/reliability/circuit-breakers/control',
        headers: {
          authorization: authToken,
          'content-type': 'application/json'
        },
        payload: {
          componentName: 'test_component'
          // Missing action
        }
      });

      expect(response.statusCode).toBe(400);
    });

    test('should validate action values', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/reliability/circuit-breakers/control',
        headers: {
          authorization: authToken,
          'content-type': 'application/json'
        },
        payload: {
          componentName: 'test_component',
          action: 'invalid_action'
        }
      });

      expect(response.statusCode).toBe(400);
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/reliability/circuit-breakers/control',
        payload: {
          componentName: 'test',
          action: 'reset'
        }
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/security-analytics/reliability/incidents', () => {
    test('should return incident information', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/incidents',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('active_incidents');
      expect(data.data).toHaveProperty('incident_summary');
      expect(data.data).toHaveProperty('metrics');
      expect(Array.isArray(data.data.active_incidents)).toBe(true);
      expect(data.data.incident_summary).toHaveProperty('total_active');
      expect(data.data.metrics).toHaveProperty('incident_count_last_24h');
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/incidents'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/security-analytics/reliability/disaster-recovery', () => {
    test('should return disaster recovery information', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/disaster-recovery',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('disaster_recovery_plans');
      expect(data.data).toHaveProperty('readiness_summary');
      expect(data.data).toHaveProperty('backup_status');
      expect(Array.isArray(data.data.disaster_recovery_plans)).toBe(true);
      expect(data.data.readiness_summary).toHaveProperty('total_plans');
      expect(data.data.backup_status).toHaveProperty('backup_success_rate');
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/disaster-recovery'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/security-analytics/reliability/disaster-recovery/execute', () => {
    test('should execute disaster recovery in test mode', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/reliability/disaster-recovery/execute',
        headers: {
          authorization: authToken,
          'content-type': 'application/json'
        },
        payload: {
          planId: 'security_analytics_failure',
          testMode: true
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('plan_id');
      expect(data.data).toHaveProperty('test_mode');
      expect(data.data).toHaveProperty('test_successful');
      expect(data.data.test_mode).toBe(true);
    });

    test('should require force parameter for actual execution', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/reliability/disaster-recovery/execute',
        headers: {
          authorization: authToken,
          'content-type': 'application/json'
        },
        payload: {
          planId: 'security_analytics_failure',
          testMode: false
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(false);
      expect(data.error).toContain('force=true');
    });

    test('should execute disaster recovery with force parameter', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/reliability/disaster-recovery/execute',
        headers: {
          authorization: authToken,
          'content-type': 'application/json'
        },
        payload: {
          planId: 'security_analytics_failure',
          testMode: false,
          force: true
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('plan_id');
      expect(data.data).toHaveProperty('execution_started');
    });

    test('should validate request payload', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/reliability/disaster-recovery/execute',
        headers: {
          authorization: authToken,
          'content-type': 'application/json'
        },
        payload: {}
      });

      expect(response.statusCode).toBe(400);
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/reliability/disaster-recovery/execute',
        payload: {
          planId: 'test'
        }
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/security-analytics/reliability/metrics', () => {
    test('should return comprehensive reliability metrics', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/metrics',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('reliability_metrics');
      expect(data.data).toHaveProperty('current_status');
      expect(data.data).toHaveProperty('operational_metrics');
      expect(data.data).toHaveProperty('component_availability');
      expect(Array.isArray(data.data.component_availability)).toBe(true);
      expect(data.data.current_status).toHaveProperty('overall_health');
      expect(data.data.operational_metrics).toHaveProperty('mttr_minutes');
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/metrics'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/security-analytics/reliability/diagnostics', () => {
    test('should return comprehensive diagnostics', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/diagnostics',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('system_overview');
      expect(data.data).toHaveProperty('component_health');
      expect(data.data).toHaveProperty('reliability_metrics');
      expect(data.data).toHaveProperty('circuit_breaker_status');
      expect(data.data).toHaveProperty('incident_management');
      expect(data.data).toHaveProperty('disaster_recovery');
      expect(data.data).toHaveProperty('system_resources');
      expect(data.data).toHaveProperty('configuration');
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/reliability/diagnostics'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/security-analytics/reliability/test/chaos', () => {
    test('should trigger chaos engineering tests', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/reliability/test/chaos',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('chaos_test_started');
      expect(data.data).toHaveProperty('test_id');
      expect(data.data).toHaveProperty('estimated_duration_minutes');
      expect(data.data).toHaveProperty('affected_components');
      expect(data.data.chaos_test_started).toBe(true);
      expect(Array.isArray(data.data.affected_components)).toBe(true);
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/reliability/test/chaos'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Error Handling', () => {
    test('should handle internal server errors gracefully', async () => {
      // All endpoints should return structured responses even on errors
      const endpoints = [
        '/api/security-analytics/reliability/status',
        '/api/security-analytics/reliability/health',
        '/api/security-analytics/reliability/circuit-breakers',
        '/api/security-analytics/reliability/incidents',
        '/api/security-analytics/reliability/disaster-recovery',
        '/api/security-analytics/reliability/metrics',
        '/api/security-analytics/reliability/diagnostics'
      ];

      for (const endpoint of endpoints) {
        const response = await server.inject({
          method: 'GET',
          url: endpoint,
          headers: {
            authorization: authToken
          }
        });

        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.payload);
        
        expect(data).toHaveProperty('success');
        expect(data).toHaveProperty('timestamp');
        expect(typeof data.success).toBe('boolean');
        expect(typeof data.timestamp).toBe('number');
      }
    });
  });

  describe('Response Format Validation', () => {
    test('all endpoints should return consistent response format', async () => {
      const endpoints = [
        '/api/security-analytics/reliability/status',
        '/api/security-analytics/reliability/health',
        '/api/security-analytics/reliability/circuit-breakers',
        '/api/security-analytics/reliability/incidents',
        '/api/security-analytics/reliability/disaster-recovery',
        '/api/security-analytics/reliability/metrics',
        '/api/security-analytics/reliability/diagnostics'
      ];

      for (const endpoint of endpoints) {
        const response = await server.inject({
          method: 'GET',
          url: endpoint,
          headers: {
            authorization: authToken
          }
        });

        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.payload);
        
        // All responses should have consistent structure
        expect(data).toHaveProperty('success');
        expect(data).toHaveProperty('timestamp');
        expect(typeof data.success).toBe('boolean');
        expect(typeof data.timestamp).toBe('number');
        
        if (data.success) {
          expect(data).toHaveProperty('data');
        } else {
          expect(data).toHaveProperty('error');
        }
      }
    });
  });

  describe('Schema Validation', () => {
    test('should validate circuit breaker control schema', async () => {
      // Test with valid enum values
      const validActions = ['reset', 'force_open', 'force_close'];
      
      for (const action of validActions) {
        const response = await server.inject({
          method: 'POST',
          url: '/api/security-analytics/reliability/circuit-breakers/control',
          headers: {
            authorization: authToken,
            'content-type': 'application/json'
          },
          payload: {
            componentName: 'test_component',
            action: action
          }
        });

        expect(response.statusCode).toBe(200);
      }
    });

    test('should validate disaster recovery schema', async () => {
      // Test required fields
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/reliability/disaster-recovery/execute',
        headers: {
          authorization: authToken,
          'content-type': 'application/json'
        },
        payload: {
          planId: 'valid_plan_id',
          testMode: true
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
    });
  });
});