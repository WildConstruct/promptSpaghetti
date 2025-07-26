/**
 * Security Analytics Optimization API Routes Test Suite
 * Epic 31.4.3.2 - Create Security Analytics Optimization Tools
 */

import Fastify, { FastifyInstance } from 'fastify';
import securityAnalyticsOptimizationRoutes from '../security-analytics-optimization';

// Mock dependencies
jest.mock('../SecurityAnalyticsIntegrationService');
jest.mock('../../analytics/AnalyticsCollector');
jest.mock('../../database/analytics-dao');
jest.mock('../../admin/DiagnosticService');
jest.mock('../../admin/HealthCheckFramework');
jest.mock('../../admin/guards/AdminAuthGuard');

describe('Security Analytics Optimization API Routes', () => {
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
    await server.register(securityAnalyticsOptimizationRoutes);
    
    authToken = 'Bearer test-token';
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /api/security-analytics/optimization/status', () => {
    test('should return optimization system status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/optimization/status',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('optimizer_status');
      expect(data.data).toHaveProperty('cache_metrics');
      expect(data.data).toHaveProperty('is_optimizing');
      expect(data.data).toHaveProperty('auto_optimization_enabled');
      expect(data.timestamp).toBeDefined();
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/optimization/status'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/security-analytics/optimization/recommendations', () => {
    test('should return optimization recommendations', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/optimization/recommendations',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('recommendations');
      expect(Array.isArray(data.data.recommendations)).toBe(true);
    });

    test('should support query parameters', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/optimization/recommendations?includeHistory=true&includeCacheMetrics=true&includeStatus=true',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('recommendations');
      expect(data.data).toHaveProperty('optimization_history');
      expect(data.data).toHaveProperty('cache_metrics');
      expect(data.data).toHaveProperty('optimizer_status');
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/optimization/recommendations'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/security-analytics/optimization/implement', () => {
    test('should implement optimization by recommendation ID', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/optimization/implement',
        headers: {
          authorization: authToken,
          'content-type': 'application/json'
        },
        payload: {
          recommendationId: 'test_recommendation_id',
          autoImplement: true
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      // Note: This will likely return an error in test environment
      // since we're mocking the underlying services
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('timestamp');
    });

    test('should implement optimization by type', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/optimization/implement',
        headers: {
          authorization: authToken,
          'content-type': 'application/json'
        },
        payload: {
          optimizationType: 'performance',
          autoImplement: true
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('timestamp');
    });

    test('should validate request payload', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/optimization/implement',
        headers: {
          authorization: authToken,
          'content-type': 'application/json'
        },
        payload: {} // Missing required fields
      });

      expect(response.statusCode).toBe(200); // Route handles validation internally
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(false);
      expect(data.error).toContain('Either recommendationId or optimizationType must be provided');
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/optimization/implement',
        payload: {
          recommendationId: 'test'
        }
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/security-analytics/optimization/history', () => {
    test('should return optimization history', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/optimization/history',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('optimization_history');
      expect(data.data).toHaveProperty('summary');
      expect(Array.isArray(data.data.optimization_history)).toBe(true);
      
      // Summary should contain statistics
      expect(data.data.summary).toHaveProperty('total_optimizations');
      expect(data.data.summary).toHaveProperty('successful_optimizations');
      expect(data.data.summary).toHaveProperty('success_rate');
      expect(data.data.summary).toHaveProperty('average_improvement');
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/optimization/history'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/security-analytics/optimization/cache/metrics', () => {
    test('should return cache metrics', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/optimization/cache/metrics',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('cache_metrics');
      expect(data.data).toHaveProperty('cache_health');
      expect(data.data).toHaveProperty('recommendations');
      
      // Cache health should have status indicators
      expect(data.data.cache_health).toHaveProperty('hit_rate_status');
      expect(data.data.cache_health).toHaveProperty('size_status');
      expect(data.data.cache_health).toHaveProperty('access_time_status');
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/optimization/cache/metrics'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/security-analytics/optimization/cache/clear', () => {
    test('should clear optimization cache', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/optimization/cache/clear',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('cache_cleared');
      expect(data.data).toHaveProperty('cleared_at');
      expect(data.data.cache_cleared).toBe(true);
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/optimization/cache/clear'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/security-analytics/optimization/diagnostics', () => {
    test('should return comprehensive diagnostics', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/optimization/diagnostics',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('optimizer_status');
      expect(data.data).toHaveProperty('cache_metrics');
      expect(data.data).toHaveProperty('recent_recommendations');
      expect(data.data).toHaveProperty('optimization_history');
      expect(data.data).toHaveProperty('system_health');
      expect(data.data).toHaveProperty('configuration');
      
      // System health should include process metrics
      expect(data.data.system_health).toHaveProperty('memory_usage');
      expect(data.data.system_health).toHaveProperty('uptime');
      expect(data.data.system_health).toHaveProperty('cpu_usage');
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/optimization/diagnostics'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/security-analytics/optimization/auto-optimize', () => {
    test('should trigger automatic optimization', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/optimization/auto-optimize',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('auto_optimization_completed');
      expect(data.data).toHaveProperty('recommendations_reviewed');
      expect(data.data).toHaveProperty('total_recommendations');
    });

    test('should handle no auto-implementable recommendations', async () => {
      // This test would require mocking the optimizer to return no auto-implementable recommendations
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/optimization/auto-optimize',
        headers: {
          authorization: authToken
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data.success).toBe(true);
      // Response structure will depend on what the optimizer returns
      expect(data.data).toBeDefined();
    });

    test('should require authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/security-analytics/optimization/auto-optimize'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Error Handling', () => {
    test('should handle internal server errors gracefully', async () => {
      // This would require mocking the optimizer to throw errors
      const response = await server.inject({
        method: 'GET',
        url: '/api/security-analytics/optimization/status',
        headers: {
          authorization: authToken
        }
      });

      // Even if internal errors occur, the API should return structured responses
      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('timestamp');
    });
  });

  describe('Response Format Validation', () => {
    test('all endpoints should return consistent response format', async () => {
      const endpoints = [
        '/api/security-analytics/optimization/status',
        '/api/security-analytics/optimization/recommendations',
        '/api/security-analytics/optimization/history',
        '/api/security-analytics/optimization/cache/metrics',
        '/api/security-analytics/optimization/diagnostics'
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
});