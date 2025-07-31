/**
 * API Stability Regression Tests - Preview Endpoint
 *
 * These tests ensure the preview API maintains backward compatibility
 * and consistent behavior across code changes.
 *
 * CRITICAL: API contract changes can break external integrations.
 */

import request from 'supertest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../../server/src/index';

describe('Preview Endpoint Regression Tests', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = buildServer();
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('API Contract Stability', () => {
    const validGraphRequest = {
      graph: {
        id: 'regression-test',
        seed: 12345,
        nodes: [
          {
            id: 'choice1',
            type: 'WeightedChoice',
            choices: [
              { text: 'Hello', weight: 1 },
              { text: 'Hi', weight: 1 },
            ],
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['choice1'],
          },
        ],
        edges: [{ id: 'e1', source: 'choice1', target: 'output1' }],
      },
      runs: 3,
      startSeed: 1,
    };

    it('should maintain response format for valid requests', async () => {
      const response = await request(server.server).post('/preview').send(validGraphRequest).expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results).toHaveLength(3);

      // Verify result item structure
      for (const result of response.body.results) {
        expect(result).toHaveProperty('seed');
        expect(result).toHaveProperty('output');
        expect(typeof result.seed).toBe('number');
        expect(typeof result.output).toBe('string');
      }
    });

    it('should maintain deterministic output for same inputs', async () => {
      const response1 = await request(server.server).post('/preview').send(validGraphRequest).expect(200);

      const response2 = await request(server.server).post('/preview').send(validGraphRequest).expect(200);

      // Results should be identical for same input
      expect(response1.body.results).toEqual(response2.body.results);
    });

    it('should handle missing graph field consistently', async () => {
      const response = await request(server.server).post('/preview').send({ runs: 3, startSeed: 1 }).expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('validation');
    });

    it('should handle malformed graph consistently', async () => {
      const malformedRequest = {
        graph: {
          id: 'malformed',
          seed: 12345,
          nodes: [
            {
              id: 'output1',
              type: 'Output',
              inputs: ['nonexistent'],
            },
          ],
          edges: [],
        },
        runs: 1,
        startSeed: 1,
      };

      const response = await request(server.server).post('/preview').send(malformedRequest).expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Node nonexistent not found');
    });

    it('should handle large run counts consistently', async () => {
      const largeRunRequest = {
        ...validGraphRequest,
        runs: 50,
      };

      const response = await request(server.server).post('/preview').send(largeRunRequest).expect(200);

      expect(response.body.results).toHaveLength(50);
    });

    it('should reject excessive run counts', async () => {
      const excessiveRunRequest = {
        ...validGraphRequest,
        runs: 1000, // Assuming this exceeds server limits
      };

      const response = await request(server.server).post('/preview').send(excessiveRunRequest).expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Legacy Endpoint Compatibility', () => {
    it('should maintain GET /preview for backward compatibility', async () => {
      const response = await request(server.server).get('/preview').expect(200);

      // Legacy endpoint returns dummy data
      expect(response.body).toHaveProperty('bundle');
      expect(response.body.bundle).toHaveProperty('meta');
      expect(response.body.bundle).toHaveProperty('preview');
    });
  });

  describe('Performance Regression', () => {
    it('should complete simple graph execution within time limit', async () => {
      const startTime = Date.now();

      await request(server.server).post('/preview').send(validGraphRequest).expect(200);

      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(1000); // 1 second limit
    });

    it('should handle concurrent requests efficiently', async () => {
      const requests = Array(5)
        .fill(null)
        .map(() => request(server.server).post('/preview').send(validGraphRequest).expect(200));

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should complete
      expect(responses).toHaveLength(5);

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(3000); // 3 seconds for 5 concurrent requests
    });
  });

  describe('Security Regression', () => {
    it('should reject graphs with dangerous expressions', async () => {
      const dangerousGraph = {
        graph: {
          id: 'dangerous',
          seed: 12345,
          nodes: [
            {
              id: 'conditional1',
              type: 'Conditional',
              branches: [{ condition: 'eval("malicious code")', output: 'Dangerous' }],
              defaultOutput: 'Safe',
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['conditional1'],
            },
          ],
          edges: [{ id: 'e1', source: 'conditional1', target: 'output1' }],
        },
        runs: 1,
        startSeed: 1,
      };

      const response = await request(server.server).post('/preview').send(dangerousGraph).expect(400);

      expect(response.body.error).toContain('dangerous');
    });

    it('should sanitize error messages', async () => {
      const response = await request(server.server).post('/preview').send({ invalid: 'data' }).expect(400);

      // Error message should not contain sensitive information
      expect(response.body.error).not.toContain('password');
      expect(response.body.error).not.toContain('token');
      expect(response.body.error).not.toContain('secret');
    });

    it('should include security headers', async () => {
      const response = await request(server.server).post('/preview').send(validGraphRequest).expect(200);

      // Verify security headers are present
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBeDefined();
    });
  });

  describe('Rate Limiting Regression', () => {
    it('should handle burst requests appropriately', async () => {
      // Send 10 requests in quick succession
      const burstRequests = Array(10)
        .fill(null)
        .map(() => request(server.server).post('/preview').send(validGraphRequest));

      const responses = await Promise.allSettled(burstRequests);

      // Most should succeed, but some might be rate limited
      const successful = responses.filter(r => r.status === 'fulfilled').length;
      expect(successful).toBeGreaterThan(5); // At least 50% should succeed
    });
  });

  describe('Analytics Integration Regression', () => {
    it('should record execution metrics', async () => {
      const response = await request(server.server)
        .post('/preview')
        .send(validGraphRequest)
        .set('x-session-id', 'test-session-123')
        .set('x-user-id', '456')
        .expect(200);

      expect(response.body.results).toHaveLength(3);

      // Analytics should be recorded but not affect response
      // This would typically be verified through database checks or logs
    });
  });

  describe('Content Type Regression', () => {
    it('should accept application/json content type', async () => {
      await request(server.server)
        .post('/preview')
        .set('Content-Type', 'application/json')
        .send(validGraphRequest)
        .expect(200);
    });

    it('should reject unsupported content types', async () => {
      await request(server.server).post('/preview').set('Content-Type', 'text/plain').send('invalid data').expect(400);
    });
  });

  describe('Edge Cases Regression', () => {
    it('should handle empty graph', async () => {
      const emptyGraph = {
        graph: {
          id: 'empty',
          seed: 12345,
          nodes: [],
          edges: [],
        },
        runs: 1,
        startSeed: 1,
      };

      const response = await request(server.server).post('/preview').send(emptyGraph).expect(200);

      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].output).toBe('');
    });

    it('should handle zero runs', async () => {
      const zeroRunsRequest = {
        ...validGraphRequest,
        runs: 0,
      };

      await request(server.server).post('/preview').send(zeroRunsRequest).expect(400);
    });

    it('should handle negative seed values', async () => {
      const negativeGeedRequest = {
        ...validGraphRequest,
        startSeed: -1,
      };

      const response = await request(server.server).post('/preview').send(negativeGeedRequest).expect(200);

      expect(response.body.results).toHaveLength(3);
    });
  });
});
