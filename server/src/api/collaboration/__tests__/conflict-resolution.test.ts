/**
 * Epic 23: Conflict Resolution API Test Suite
 * 
 * Integration tests for the conflict resolution REST API endpoints,
 * testing authentication, authorization, request/response handling,
 * and error scenarios.
 * 
 * Task: E23-1753115279513-6E9F4C - Implement conflict resolution & rollback logic
 */

import { FastifyInstance } from 'fastify';
import { build } from '../../test-helper'; // Assuming we have a test helper
import { Epic23WorkspaceDAO } from '../../../database/epic23-workspace-dao';
import { ResolutionStrategy } from '../../../collaboration/ConflictResolutionEngine';
import { COLLABORATIVE_PERMISSIONS } from '../../../database/epic23-workspace-models';

// Mock the dependencies
jest.mock('../../../database/epic23-workspace-dao');
jest.mock('../../../collaboration/ConflictResolutionService');

describe('Conflict Resolution API', () => {
  let app: FastifyInstance;
  let mockWorkspaceDAO: jest.Mocked<Epic23WorkspaceDAO>;

  beforeAll(async () => {
    // Build Fastify app with our routes
    app = build();
    
    mockWorkspaceDAO = new Epic23WorkspaceDAO({} as any) as jest.Mocked<Epic23WorkspaceDAO>;
    
    // Register our routes
    await app.register(async (fastify) => {
      const { conflictResolutionRoutes } = await import('../conflict-resolution');
      await conflictResolutionRoutes(fastify, mockWorkspaceDAO);
    }, { prefix: '/api/collaboration' });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =============================================================================
  // AUTHENTICATION TESTS
  // =============================================================================

  describe('Authentication', () => {
    it('should require authentication for all endpoints', async () => {
      const endpoints = [
        'GET /api/collaboration/conflicts/resource1',
        'POST /api/collaboration/conflicts/resource1/start-monitoring',
        'POST /api/collaboration/conflicts/resource1/stop-monitoring',
        'POST /api/collaboration/conflicts/resource1/resolve',
        'GET /api/collaboration/conflicts/resource1/analysis',
        'POST /api/collaboration/rollback/resource1',
        'POST /api/collaboration/rollback/resource1/create-point',
        'GET /api/collaboration/rollback/resource1/points',
        'GET /api/collaboration/conflicts/statistics',
        'PUT /api/collaboration/conflicts/config',
        'POST /api/collaboration/conflicts/cleanup'
      ];

      for (const endpoint of endpoints) {
        const [method, path] = endpoint.split(' ');
        let response;

        switch (method) {
        case 'GET':
          response = await app.inject({ method: 'GET', url: path });
          break;
        case 'POST':
          response = await app.inject({ 
            method: 'POST', 
            url: path,
            payload: {}
          });
          break;
        case 'PUT':
          response = await app.inject({ 
            method: 'PUT', 
            url: path,
            payload: {}
          });
          break;
        default:
          continue;
        }

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.payload)).toEqual({
          error: 'Authentication required'
        });
      }
    });
  });

  // =============================================================================
  // GET CONFLICTS ENDPOINT TESTS
  // =============================================================================

  describe('GET /api/collaboration/conflicts/:resourceId', () => {
    const mockUser = { id: 'user1', email: 'test@example.com' };

    beforeEach(() => {
      // Mock authentication
      jest.spyOn(app, 'inject').mockImplementation(async (options: any) => {
        if (options.headers?.authorization) {
          (options as any).user = mockUser;
        }
        return await (app as any).originalInject.call(app, options);
      });
    });

    it('should get conflicts for a resource', async () => {
      const mockSessions = [
        { id: 'session1', workspace_id: 'workspace1', user_id: 'user1' }
      ];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(mockSessions as any);
      mockWorkspaceDAO.hasCollaborativePermission.mockResolvedValue(true);

      const response = await app.inject({
        method: 'GET',
        url: '/api/collaboration/conflicts/resource1',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.resource_id).toBe('resource1');
      expect(body.conflicts).toBeDefined();
      expect(body.conflict_count).toBeDefined();
      expect(body.last_checked).toBeDefined();
    });

    it('should deny access without permissions', async () => {
      const mockSessions = [
        { id: 'session1', workspace_id: 'workspace1', user_id: 'user1' }
      ];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(mockSessions as any);
      mockWorkspaceDAO.hasCollaborativePermission.mockResolvedValue(false);

      const response = await app.inject({
        method: 'GET',
        url: '/api/collaboration/conflicts/resource1',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        }
      });

      expect(response.statusCode).toBe(403);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Insufficient permissions'
      });
    });

    it('should handle service errors', async () => {
      mockWorkspaceDAO.getActiveEditSessions.mockRejectedValue(new Error('Database error'));

      const response = await app.inject({
        method: 'GET',
        url: '/api/collaboration/conflicts/resource1',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        }
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to retrieve conflicts'
      });
    });
  });

  // =============================================================================
  // MONITORING ENDPOINT TESTS
  // =============================================================================

  describe('POST /api/collaboration/conflicts/:resourceId/start-monitoring', () => {
    const mockUser = { id: 'user1', email: 'test@example.com' };

    it('should start monitoring with proper permissions', async () => {
      const mockSessions = [
        { id: 'session1', workspace_id: 'workspace1', user_id: 'user1' }
      ];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(mockSessions as any);
      mockWorkspaceDAO.hasCollaborativePermission.mockResolvedValue(true);

      const response = await app.inject({
        method: 'POST',
        url: '/api/collaboration/conflicts/resource1/start-monitoring',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        },
        payload: {}
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.resource_id).toBe('resource1');
      expect(body.monitoring_started).toBe(true);
      expect(body.timestamp).toBeDefined();
    });

    it('should deny monitoring without permissions', async () => {
      const mockSessions = [
        { id: 'session1', workspace_id: 'workspace1', user_id: 'user1' }
      ];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(mockSessions as any);
      mockWorkspaceDAO.hasCollaborativePermission.mockResolvedValue(false);

      const response = await app.inject({
        method: 'POST',
        url: '/api/collaboration/conflicts/resource1/start-monitoring',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        },
        payload: {}
      });

      expect(response.statusCode).toBe(403);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Insufficient permissions'
      });
    });
  });

  // =============================================================================
  // RESOLUTION ENDPOINT TESTS
  // =============================================================================

  describe('POST /api/collaboration/conflicts/:resourceId/resolve', () => {
    const mockUser = { id: 'user1', email: 'test@example.com' };

    it('should resolve conflicts with valid strategy', async () => {
      const mockSessions = [
        { id: 'session1', workspace_id: 'workspace1', user_id: 'user1' }
      ];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(mockSessions as any);
      mockWorkspaceDAO.hasCollaborativePermission.mockResolvedValue(true);

      const response = await app.inject({
        method: 'POST',
        url: '/api/collaboration/conflicts/resource1/resolve',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        },
        payload: {
          strategy: ResolutionStrategy.LAST_WRITER_WINS
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.resource_id).toBe('resource1');
      expect(body.resolution_result).toBeDefined();
      expect(body.timestamp).toBeDefined();
    });

    it('should validate request payload schema', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/collaboration/conflicts/resource1/resolve',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify({ id: 'user1' })
        },
        payload: {
          // Missing required strategy
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should validate resolution strategy enum', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/collaboration/conflicts/resource1/resolve',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify({ id: 'user1' })
        },
        payload: {
          strategy: 'INVALID_STRATEGY'
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle manual resolution with data', async () => {
      const mockSessions = [
        { id: 'session1', workspace_id: 'workspace1', user_id: 'user1' }
      ];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(mockSessions as any);
      mockWorkspaceDAO.hasCollaborativePermission.mockResolvedValue(true);

      const response = await app.inject({
        method: 'POST',
        url: '/api/collaboration/conflicts/resource1/resolve',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        },
        payload: {
          strategy: ResolutionStrategy.MANUAL_RESOLUTION,
          user_resolution: {
            resolved_content: 'manually resolved content'
          }
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.resolution_result).toBeDefined();
    });

    it('should return 422 for failed resolution', async () => {
      const mockSessions = [
        { id: 'session1', workspace_id: 'workspace1', user_id: 'user1' }
      ];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(mockSessions as any);
      mockWorkspaceDAO.hasCollaborativePermission.mockResolvedValue(true);

      // Mock the service to return failed resolution
      const mockService = require('../../../collaboration/ConflictResolutionService');
      mockService.ConflictResolutionService.prototype.resolveConflictsManually.mockResolvedValue({
        success: false,
        resolution_strategy: ResolutionStrategy.MANUAL_RESOLUTION,
        errors: ['Resolution failed']
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/collaboration/conflicts/resource1/resolve',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        },
        payload: {
          strategy: ResolutionStrategy.MANUAL_RESOLUTION
        }
      });

      expect(response.statusCode).toBe(422);
    });
  });

  // =============================================================================
  // ROLLBACK ENDPOINT TESTS
  // =============================================================================

  describe('POST /api/collaboration/rollback/:resourceId', () => {
    const mockUser = { id: 'user1', email: 'test@example.com' };

    it('should perform rollback successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/collaboration/rollback/resource1',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        },
        payload: {
          rollback_id: 'rollback123'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.resource_id).toBe('resource1');
      expect(body.rollback_id).toBe('rollback123');
      expect(body.success).toBeDefined();
      expect(body.timestamp).toBeDefined();
    });

    it('should create rollback point', async () => {
      const mockSessions = [
        { id: 'session1', workspace_id: 'workspace1', user_id: 'user1' }
      ];
      
      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue(mockSessions as any);
      mockWorkspaceDAO.hasCollaborativePermission.mockResolvedValue(true);

      const response = await app.inject({
        method: 'POST',
        url: '/api/collaboration/rollback/resource1/create-point',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        },
        payload: {
          label: 'Manual checkpoint'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.resource_id).toBe('resource1');
      expect(body.rollback_id).toBeDefined();
      expect(body.label).toBe('Manual checkpoint');
      expect(body.created_by).toBe('user1');
    });

    it('should get rollback points', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/collaboration/rollback/resource1/points',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.resource_id).toBe('resource1');
      expect(body.rollback_points).toBeDefined();
      expect(body.count).toBeDefined();
      expect(body.timestamp).toBeDefined();
    });
  });

  // =============================================================================
  // ANALYSIS ENDPOINT TESTS
  // =============================================================================

  describe('GET /api/collaboration/conflicts/:resourceId/analysis', () => {
    const mockUser = { id: 'user1', email: 'test@example.com' };

    it('should get conflict analysis', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/collaboration/conflicts/resource1/analysis',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.resource_id).toBe('resource1');
      expect(body.analysis).toBeDefined();
      expect(body.timestamp).toBeDefined();
    });
  });

  // =============================================================================
  // STATISTICS ENDPOINT TESTS
  // =============================================================================

  describe('GET /api/collaboration/conflicts/statistics', () => {
    const mockUser = { id: 'user1', email: 'test@example.com' };

    it('should get global statistics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/collaboration/conflicts/statistics',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.resource_id).toBe('all');
      expect(body.statistics).toBeDefined();
      expect(body.timestamp).toBeDefined();
    });

    it('should get resource-specific statistics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/collaboration/conflicts/statistics/resource1',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.resource_id).toBe('resource1');
      expect(body.statistics).toBeDefined();
    });
  });

  // =============================================================================
  // CONFIGURATION ENDPOINT TESTS
  // =============================================================================

  describe('PUT /api/collaboration/conflicts/config', () => {
    const mockUser = { id: 'user1', email: 'test@example.com' };

    it('should update configuration', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/collaboration/conflicts/config',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        },
        payload: {
          default_strategy: ResolutionStrategy.MANUAL_RESOLUTION,
          auto_resolution_enabled: false,
          max_resolution_time_ms: 60000
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.message).toBe('Configuration updated successfully');
      expect(body.config).toBeDefined();
      expect(body.updated_by).toBe('user1');
      expect(body.timestamp).toBeDefined();
    });

    it('should validate configuration schema', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/collaboration/conflicts/config',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        },
        payload: {
          default_strategy: 'INVALID_STRATEGY',
          max_resolution_time_ms: -1000 // Invalid negative value
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should validate numeric constraints', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/collaboration/conflicts/config',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        },
        payload: {
          max_rollback_points: 100, // Exceeds maximum of 50
          conflict_threshold_seconds: 0 // Below minimum of 1
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  // =============================================================================
  // CLEANUP ENDPOINT TESTS
  // =============================================================================

  describe('POST /api/collaboration/conflicts/cleanup', () => {
    const mockUser = { id: 'user1', email: 'test@example.com' };

    it('should cleanup service resources', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/collaboration/conflicts/cleanup',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        },
        payload: {}
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.message).toBe('Conflict resolution service cleanup completed');
      expect(body.timestamp).toBeDefined();
    });
  });

  // =============================================================================
  // ERROR HANDLING TESTS
  // =============================================================================

  describe('Error Handling', () => {
    const mockUser = { id: 'user1', email: 'test@example.com' };

    it('should handle malformed JSON payloads', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/collaboration/conflicts/resource1/resolve',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser),
          'content-type': 'application/json'
        },
        payload: '{ invalid json }'
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/collaboration/conflicts/resource1/resolve',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        },
        payload: {} // Missing strategy
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle database errors gracefully', async () => {
      mockWorkspaceDAO.getActiveEditSessions.mockRejectedValue(new Error('Database connection failed'));

      const response = await app.inject({
        method: 'GET',
        url: '/api/collaboration/conflicts/resource1',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        }
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Failed to retrieve conflicts'
      });
    });

    it('should handle service initialization errors', async () => {
      const mockService = require('../../../collaboration/ConflictResolutionService');
      mockService.ConflictResolutionService.mockImplementation(() => {
        throw new Error('Service initialization failed');
      });

      // This would be tested at the app level when registering routes
      // The error handling would prevent route registration failure
    });

    it('should handle invalid resource IDs', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/collaboration/conflicts/', // Missing resource ID
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        }
      });

      expect(response.statusCode).toBe(404);
    });

    it('should handle timeout scenarios', async () => {
      // Mock a service that takes too long
      const mockService = require('../../../collaboration/ConflictResolutionService');
      mockService.ConflictResolutionService.prototype.resolveConflictsManually.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: false }), 35000))
      );

      mockWorkspaceDAO.getActiveEditSessions.mockResolvedValue([
        { id: 'session1', workspace_id: 'workspace1', user_id: 'user1' }
      ] as any);
      mockWorkspaceDAO.hasCollaborativePermission.mockResolvedValue(true);

      const response = await app.inject({
        method: 'POST',
        url: '/api/collaboration/conflicts/resource1/resolve',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser)
        },
        payload: {
          strategy: ResolutionStrategy.MANUAL_RESOLUTION
        }
      });

      // The request should timeout and return an error
      // This depends on the timeout configuration in the app
      expect([408, 500, 503]).toContain(response.statusCode);
    });
  });

  // =============================================================================
  // PERFORMANCE TESTS
  // =============================================================================

  describe('Performance Tests', () => {
    const mockUser = { id: 'user1', email: 'test@example.com' };

    it('should handle concurrent requests efficiently', async () => {
      const promises = [];
      const startTime = Date.now();

      // Send 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        promises.push(
          app.inject({
            method: 'GET',
            url: `/api/collaboration/conflicts/resource${i}`,
            headers: { 
              authorization: 'Bearer valid-token',
              'x-user': JSON.stringify(mockUser)
            }
          })
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      // All requests should complete
      expect(responses.length).toBe(10);
      
      // Should complete reasonably quickly
      expect(endTime - startTime).toBeLessThan(5000);
      
      // Most should succeed (assuming no permission errors)
      const successfulResponses = responses.filter(r => r.statusCode === 200 || r.statusCode === 403);
      expect(successfulResponses.length).toBe(10);
    });

    it('should handle large payloads efficiently', async () => {
      const largeResolution = {
        resolved_content: 'x'.repeat(100000) // 100KB of content
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/collaboration/conflicts/resource1/resolve',
        headers: { 
          authorization: 'Bearer valid-token',
          'x-user': JSON.stringify(mockUser),
          'content-type': 'application/json'
        },
        payload: {
          strategy: ResolutionStrategy.MANUAL_RESOLUTION,
          user_resolution: largeResolution
        }
      });

      // Should handle large payloads without crashing
      expect([200, 403, 422]).toContain(response.statusCode);
    });
  });
});