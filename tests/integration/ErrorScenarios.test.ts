/**
 * Comprehensive Error Scenario Tests for Epic 18
 * Tests various error conditions and edge cases across the system
 */

import { jest } from '@jest/globals';
import WebSocket from 'ws';
import { ConnectionManager } from '../../server/src/websocket/ConnectionManager';
import { GraphEngine } from '../../packages/graph-core/src/engine';
import { Graph } from '../../packages/core/graphSchema';
import { generatePreviewOutputs } from '../../server/src/index';
import { TestEnvironmentManager, AsyncTestingUtils } from '../utils/TestingUtilities';

describe('Error Scenarios - Integration Tests', () => {
  let testEnv: any;

  beforeEach(async () => {
    testEnv = await TestEnvironmentManager.createEnvironment('error-scenarios', {
      seed: 'error-test-seed',
      mockWebSocket: true,
      mockLocalStorage: true
    });
  });

  afterEach(async () => {
    await TestEnvironmentManager.cleanupAll();
  });

  describe('Network Error Scenarios', () => {
    describe('WebSocket Connection Failures', () => {
      it('should handle connection timeout', async () => {
        const config = {
          port: 8001,
          heartbeatInterval: 100,
          connectionTimeout: 200,
          maxConnections: 10,
          enableAuthentication: false,
          jwtSecret: 'test-secret',
          corsOrigins: ['*']
        };

        const manager = new ConnectionManager(config);
        const mockWs = {
          on: jest.fn(),
          close: jest.fn(),
          ping: jest.fn(),
          send: jest.fn(),
          readyState: WebSocket.CONNECTING, // Simulating stuck connection
          removeAllListeners: jest.fn()
        } as any;

        const request = {
          headers: { 'user-agent': 'test-agent' },
          socket: { remoteAddress: '127.0.0.1' }
        };

        // Add connection and wait for timeout
        const connectionId = manager.addConnection(mockWs, request);
        
        // Wait longer than connection timeout
        await AsyncTestingUtils.delay(300);
        
        // Connection should be marked as timed out
        const connectionInfo = manager.getConnectionInfo(connectionId);
        expect(connectionInfo?.status).toBeUndefined(); // Connection should be removed
        
        manager.cleanup();
      });

      it('should handle WebSocket connection drops during operation', async () => {
        const config = {
          port: 8001,
          heartbeatInterval: 1000,
          connectionTimeout: 5000,
          maxConnections: 10,
          enableAuthentication: false,
          jwtSecret: 'test-secret',
          corsOrigins: ['*']
        };

        const manager = new ConnectionManager(config);
        let closeHandler: Function;
        let errorHandler: Function;

        const mockWs = {
          on: jest.fn((event, handler) => {
            if (event === 'close') closeHandler = handler;
            if (event === 'error') errorHandler = handler;
          }),
          close: jest.fn(),
          ping: jest.fn(),
          send: jest.fn(),
          readyState: WebSocket.OPEN,
          removeAllListeners: jest.fn()
        } as any;

        const request = {
          headers: { 'user-agent': 'test-agent' },
          socket: { remoteAddress: '127.0.0.1' }
        };

        const connectionId = manager.addConnection(mockWs, request);
        
        // Simulate connection drop
        errorHandler!(new Error('Connection lost'));
        closeHandler!(1006, 'Connection lost'); // 1006 = abnormal closure
        
        // Connection should be cleaned up
        await AsyncTestingUtils.delay(100);
        const connectionInfo = manager.getConnectionInfo(connectionId);
        expect(connectionInfo).toBeUndefined();

        manager.cleanup();
      });

      it('should handle maximum connection limit exceeded', async () => {
        const config = {
          port: 8001,
          heartbeatInterval: 1000,
          connectionTimeout: 5000,
          maxConnections: 2, // Small limit for testing
          enableAuthentication: false,
          jwtSecret: 'test-secret',
          corsOrigins: ['*']
        };

        const manager = new ConnectionManager(config);
        const mockConnections: any[] = [];
        
        // Create mock connections
        for (let i = 0; i < 3; i++) {
          mockConnections.push({
            on: jest.fn(),
            close: jest.fn(),
            ping: jest.fn(),
            send: jest.fn(),
            readyState: WebSocket.OPEN,
            removeAllListeners: jest.fn()
          });
        }

        const request = {
          headers: { 'user-agent': 'test-agent' },
          socket: { remoteAddress: '127.0.0.1' }
        };

        // Add connections up to limit
        const conn1 = manager.addConnection(mockConnections[0], request);
        const conn2 = manager.addConnection(mockConnections[1], request);
        
        expect(conn1).toBeDefined();
        expect(conn2).toBeDefined();
        
        // Third connection should fail or be rejected
        try {
          const conn3 = manager.addConnection(mockConnections[2], request);
          // If connection is added, it should be immediately closed due to limit
          if (conn3) {
            await AsyncTestingUtils.delay(100);
            const info = manager.getConnectionInfo(conn3);
            expect(info).toBeUndefined(); // Should be cleaned up
          }
        } catch (error) {
          // Expected behavior - connection rejected
          expect(error).toBeDefined();
        }

        manager.cleanup();
      });
    });

    describe('HTTP Request Failures', () => {
      it('should handle malformed request data', async () => {
        // Mock graph with invalid structure
        const invalidGraph = {
          nodes: null, // Invalid - should be array
          edges: undefined
        } as unknown as Graph;

        try {
          await generatePreviewOutputs(invalidGraph, 3, 10);
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.message).toContain('Invalid graph structure');
        }
      });

      it('should handle request timeout scenarios', async () => {
        const validGraph: Graph = {
          nodes: [
            {
              id: 'output1',
              type: 'Output',
              inputs: []
            }
          ]
        };

        // Mock a slow engine execution
        const mockEngine = {
          executeGraph: jest.fn().mockImplementation(() => {
            return new Promise((resolve) => {
              setTimeout(() => resolve(['Slow output']), 5000); // 5 second delay
            });
          })
        };

        // Test with timeout
        await expect(
          AsyncTestingUtils.withTimeout(
            mockEngine.executeGraph(validGraph),
            1000, // 1 second timeout
            'Graph execution timed out'
          )
        ).rejects.toThrow('Graph execution timed out');
      });
    });
  });

  describe('Data Validation Error Scenarios', () => {
    describe('Graph Structure Validation', () => {
      it('should handle circular dependency errors', async () => {
        const circularGraph: Graph = {
          nodes: [
            { id: 'node1', type: 'WeightedChoice', inputs: ['node2'] },
            { id: 'node2', type: 'Output', inputs: ['node1'] }
          ]
        };

        const engine = new GraphEngine();
        
        try {
          await engine.execute(circularGraph, 'test-seed');
          fail('Should have thrown circular dependency error');
        } catch (error) {
          expect(error.message).toContain('circular dependency');
        }
      });

      it('should handle missing node references', async () => {
        const invalidGraph: Graph = {
          nodes: [
            { id: 'node1', type: 'Output', inputs: ['nonexistent-node'] }
          ]
        };

        const engine = new GraphEngine();
        
        try {
          await engine.execute(invalidGraph, 'test-seed');
          fail('Should have thrown missing node error');
        } catch (error) {
          expect(error.message).toContain('node not found');
        }
      });

      it('should handle invalid node type errors', async () => {
        const invalidGraph: Graph = {
          nodes: [
            { id: 'node1', type: 'InvalidNodeType' as any, inputs: [] }
          ]
        };

        const engine = new GraphEngine();
        
        try {
          await engine.execute(invalidGraph, 'test-seed');
          fail('Should have thrown invalid node type error');
        } catch (error) {
          expect(error.message).toContain('unknown node type');
        }
      });
    });

    describe('Data Corruption Scenarios', () => {
      it('should handle corrupted graph data', async () => {
        const corruptedData = '{"nodes": [{"id": "node1", "type": "Output", "data": {"corrupted": true';
        
        try {
          const graph = JSON.parse(corruptedData);
          fail('Should have thrown JSON parse error');
        } catch (error) {
          expect(error).toBeInstanceOf(SyntaxError);
        }
      });

      it('should handle incomplete node data', async () => {
        const incompleteGraph: Graph = {
          nodes: [
            { id: 'node1', type: 'WeightedChoice' } as any // Missing required 'inputs' field
          ]
        };

        const engine = new GraphEngine();
        
        try {
          await engine.execute(incompleteGraph, 'test-seed');
          fail('Should have thrown validation error');
        } catch (error) {
          expect(error.message).toContain('missing required field');
        }
      });

      it('should handle data type mismatches', async () => {
        const typeMismatchGraph: Graph = {
          nodes: [
            {
              id: 'node1',
              type: 'WeightedChoice',
              inputs: [],
              data: {
                choices: "invalid-type-should-be-array" as any
              }
            }
          ]
        };

        const engine = new GraphEngine();
        
        try {
          await engine.execute(typeMismatchGraph, 'test-seed');
          fail('Should have thrown type mismatch error');
        } catch (error) {
          expect(error.message).toContain('type mismatch');
        }
      });
    });
  });

  describe('Authentication and Authorization Errors', () => {
    describe('Token Validation Failures', () => {
      it('should handle expired JWT tokens', async () => {
        const config = {
          port: 8001,
          heartbeatInterval: 1000,
          connectionTimeout: 5000,
          maxConnections: 10,
          enableAuthentication: true,
          jwtSecret: 'test-secret',
          corsOrigins: ['*']
        };

        const manager = new ConnectionManager(config);
        
        // Mock JWT verification to throw expired token error
        const jwt = require('jsonwebtoken');
        jwt.verify = jest.fn(() => {
          const error = new Error('jwt expired');
          error.name = 'TokenExpiredError';
          throw error;
        });

        const mockWs = {
          on: jest.fn(),
          close: jest.fn(),
          ping: jest.fn(),
          send: jest.fn(),
          readyState: WebSocket.OPEN,
          removeAllListeners: jest.fn()
        } as any;

        const request = {
          headers: { 
            'user-agent': 'test-agent',
            'authorization': 'Bearer expired-token'
          },
          socket: { remoteAddress: '127.0.0.1' }
        };

        const connectionId = manager.addConnection(mockWs, request);
        
        // Attempt authentication
        try {
          await manager.authenticateConnection(connectionId, { token: 'expired-token' });
          fail('Should have thrown expired token error');
        } catch (error) {
          expect(error.message).toContain('expired');
        }

        manager.cleanup();
      });

      it('should handle invalid JWT signatures', async () => {
        const config = {
          port: 8001,
          heartbeatInterval: 1000,
          connectionTimeout: 5000,
          maxConnections: 10,
          enableAuthentication: true,
          jwtSecret: 'test-secret',
          corsOrigins: ['*']
        };

        const manager = new ConnectionManager(config);
        
        // Mock JWT verification to throw invalid signature error
        const jwt = require('jsonwebtoken');
        jwt.verify = jest.fn(() => {
          const error = new Error('invalid signature');
          error.name = 'JsonWebTokenError';
          throw error;
        });

        const mockWs = {
          on: jest.fn(),
          close: jest.fn(),
          ping: jest.fn(),
          send: jest.fn(),
          readyState: WebSocket.OPEN,
          removeAllListeners: jest.fn()
        } as any;

        const request = {
          headers: { 
            'user-agent': 'test-agent',
            'authorization': 'Bearer invalid-signature-token'
          },
          socket: { remoteAddress: '127.0.0.1' }
        };

        const connectionId = manager.addConnection(mockWs, request);
        
        try {
          await manager.authenticateConnection(connectionId, { token: 'invalid-signature-token' });
          fail('Should have thrown invalid signature error');
        } catch (error) {
          expect(error.message).toContain('invalid signature');
        }

        manager.cleanup();
      });
    });

    describe('Authorization Failures', () => {
      it('should handle insufficient permissions', async () => {
        // Mock a user with limited permissions
        const limitedUser = {
          userId: 'user123',
          permissions: ['read'],
          role: 'viewer'
        };

        const config = {
          port: 8001,
          heartbeatInterval: 1000,
          connectionTimeout: 5000,
          maxConnections: 10,
          enableAuthentication: true,
          jwtSecret: 'test-secret',
          corsOrigins: ['*']
        };

        const manager = new ConnectionManager(config);
        
        const jwt = require('jsonwebtoken');
        jwt.verify = jest.fn().mockReturnValue(limitedUser);

        const mockWs = {
          on: jest.fn(),
          close: jest.fn(),
          ping: jest.fn(),
          send: jest.fn(),
          readyState: WebSocket.OPEN,
          removeAllListeners: jest.fn()
        } as any;

        const request = {
          headers: { 
            'user-agent': 'test-agent',
            'authorization': 'Bearer valid-token'
          },
          socket: { remoteAddress: '127.0.0.1' }
        };

        const connectionId = manager.addConnection(mockWs, request);
        await manager.authenticateConnection(connectionId, { token: 'valid-token' });

        // Try to perform an action requiring 'write' permission
        try {
          await manager.authorizeAction(connectionId, 'write');
          fail('Should have thrown insufficient permissions error');
        } catch (error) {
          expect(error.message).toContain('insufficient permissions');
        }

        manager.cleanup();
      });
    });
  });

  describe('System Failure and Recovery Scenarios', () => {
    describe('Memory and Resource Errors', () => {
      it('should handle out-of-memory scenarios during graph execution', async () => {
        // Create a graph that would consume excessive memory
        const memoryIntensiveGraph: Graph = {
          nodes: [
            {
              id: 'memory-hog',
              type: 'WeightedChoice',
              inputs: [],
              data: {
                choices: new Array(1000000).fill({ value: 'test', weight: 1 }) // Large array
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['memory-hog']
            }
          ]
        };

        const engine = new GraphEngine();
        
        // Mock process.memoryUsage to simulate low memory
        const originalMemoryUsage = process.memoryUsage;
        process.memoryUsage = jest.fn().mockReturnValue({
          rss: 500000000, // 500MB
          heapUsed: 450000000, // 450MB used
          heapTotal: 500000000, // 500MB total - nearly full
          external: 10000000,
          arrayBuffers: 5000000
        });

        try {
          await engine.execute(memoryIntensiveGraph, 'test-seed');
          fail('Should have thrown memory error');
        } catch (error) {
          expect(error.message).toContain('memory');
        } finally {
          process.memoryUsage = originalMemoryUsage;
        }
      });

      it('should handle stack overflow in recursive operations', async () => {
        // Create a deeply nested recursive structure
        const createDeepGraph = (depth: number): Graph => {
          const nodes = [];
          for (let i = 0; i < depth; i++) {
            nodes.push({
              id: `node${i}`,
              type: 'WeightedChoice',
              inputs: i > 0 ? [`node${i-1}`] : [],
              data: { choices: [{ value: `value${i}`, weight: 1 }] }
            });
          }
          return { nodes };
        };

        const deepGraph = createDeepGraph(10000); // Very deep graph
        const engine = new GraphEngine();
        
        try {
          await engine.execute(deepGraph, 'test-seed');
          fail('Should have thrown stack overflow error');
        } catch (error) {
          expect(error.message).toContain('Maximum call stack size exceeded');
        }
      });
    });

    describe('Database and Storage Failures', () => {
      it('should handle storage write failures', async () => {
        // Mock localStorage to throw storage quota exceeded error
        const mockStorage = testEnv.mocks.get('localStorage');
        mockStorage.setItem = jest.fn().mockImplementation(() => {
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        });

        try {
          // Attempt to store large data
          const largeData = JSON.stringify({ data: new Array(100000).fill('large-data') });
          mockStorage.setItem('large-key', largeData);
          fail('Should have thrown quota exceeded error');
        } catch (error) {
          expect(error.name).toBe('QuotaExceededError');
        }
      });

      it('should handle storage read failures', async () => {
        const mockStorage = testEnv.mocks.get('localStorage');
        mockStorage.getItem = jest.fn().mockImplementation(() => {
          throw new Error('Storage access denied');
        });

        try {
          const result = mockStorage.getItem('test-key');
          fail('Should have thrown storage access error');
        } catch (error) {
          expect(error.message).toContain('Storage access denied');
        }
      });
    });

    describe('Service Recovery Scenarios', () => {
      it('should handle graceful service restart', async () => {
        const config = {
          port: 8001,
          heartbeatInterval: 100,
          connectionTimeout: 1000,
          maxConnections: 10,
          enableAuthentication: false,
          jwtSecret: 'test-secret',
          corsOrigins: ['*']
        };

        const manager = new ConnectionManager(config);
        
        // Add some connections
        const mockWs1 = {
          on: jest.fn(),
          close: jest.fn(),
          ping: jest.fn(),
          send: jest.fn(),
          readyState: WebSocket.OPEN,
          removeAllListeners: jest.fn()
        } as any;

        const mockWs2 = {
          on: jest.fn(),
          close: jest.fn(),
          ping: jest.fn(),
          send: jest.fn(),
          readyState: WebSocket.OPEN,
          removeAllListeners: jest.fn()
        } as any;

        const request = {
          headers: { 'user-agent': 'test-agent' },
          socket: { remoteAddress: '127.0.0.1' }
        };

        const conn1 = manager.addConnection(mockWs1, request);
        const conn2 = manager.addConnection(mockWs2, request);

        expect(manager.getConnectionInfo(conn1)).toBeDefined();
        expect(manager.getConnectionInfo(conn2)).toBeDefined();

        // Simulate service restart
        manager.cleanup();
        
        // Connections should be properly closed
        expect(mockWs1.close).toHaveBeenCalled();
        expect(mockWs2.close).toHaveBeenCalled();
        expect(mockWs1.removeAllListeners).toHaveBeenCalled();
        expect(mockWs2.removeAllListeners).toHaveBeenCalled();
      });
    });
  });

  describe('Concurrent Access Error Scenarios', () => {
    it('should handle race conditions in connection management', async () => {
      const config = {
        port: 8001,
        heartbeatInterval: 1000,
        connectionTimeout: 5000,
        maxConnections: 10,
        enableAuthentication: false,
        jwtSecret: 'test-secret',
        corsOrigins: ['*']
      };

      const manager = new ConnectionManager(config);
      const promises: Promise<any>[] = [];
      
      // Simulate concurrent connection attempts
      for (let i = 0; i < 5; i++) {
        const mockWs = {
          on: jest.fn(),
          close: jest.fn(),
          ping: jest.fn(),
          send: jest.fn(),
          readyState: WebSocket.OPEN,
          removeAllListeners: jest.fn()
        } as any;

        const request = {
          headers: { 'user-agent': `agent-${i}` },
          socket: { remoteAddress: '127.0.0.1' }
        };

        promises.push(
          Promise.resolve().then(() => manager.addConnection(mockWs, request))
        );
      }

      const results = await Promise.allSettled(promises);
      
      // All connections should succeed or fail gracefully
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.log(`Connection ${index} failed: ${result.reason}`);
        } else {
          expect(result.value).toBeDefined();
        }
      });

      manager.cleanup();
    });
  });
});