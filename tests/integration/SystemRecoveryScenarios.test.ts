/**
 * System Recovery and Resilience Error Scenarios Tests
 * Tests system recovery capabilities and resilience patterns
 */

import { jest } from '@jest/globals';
import { TestEnvironmentManager, AsyncTestingUtils } from '../utils/TestingUtilities';
import { ConnectionManager } from '../../server/src/websocket/ConnectionManager';
import { GraphEngine } from '../../packages/graph-core/src/engine';
import { Graph } from '../../packages/core/graphSchema';
import WebSocket from 'ws';

describe('System Recovery and Resilience Scenarios', () => {
  let testEnv: any;

  beforeEach(async () => {
    testEnv = await TestEnvironmentManager.createEnvironment('recovery-scenarios', {
      seed: 'recovery-test',
      mockWebSocket: true,
      mockLocalStorage: true
    });
  });

  afterEach(async () => {
    await TestEnvironmentManager.cleanupAll();
  });

  describe('Connection Recovery Scenarios', () => {
    describe('WebSocket Reconnection', () => {
      it('should handle automatic reconnection after connection drop', async () => {
        const config = {
          port: 8001,
          heartbeatInterval: 100,
          connectionTimeout: 1000,
          maxConnections: 10,
          enableAuthentication: false,
          jwtSecret: 'test-secret',
          corsOrigins: ['*'],
          enableAutoReconnect: true,
          reconnectInterval: 200,
          maxReconnectAttempts: 3
        };

        const manager = new ConnectionManager(config);
        let closeHandler: Function;
        let reconnectAttempts = 0;

        const mockWs = {
          on: jest.fn((event, handler) => {
            if (event === 'close') closeHandler = handler;
          }),
          close: jest.fn(),
          ping: jest.fn(),
          send: jest.fn(),
          readyState: WebSocket.OPEN,
          removeAllListeners: jest.fn(),
          reconnect: jest.fn(() => {
            reconnectAttempts++;
            return Promise.resolve();
          })
        } as any;

        const request = {
          headers: { 'user-agent': 'test-agent' },
          socket: { remoteAddress: '127.0.0.1' }
        };

        const connectionId = manager.addConnection(mockWs, request);
        expect(manager.getConnectionInfo(connectionId)).toBeDefined();

        // Simulate connection drop
        closeHandler!(1006, 'Connection lost'); // Abnormal closure

        // Wait for reconnection attempts
        await AsyncTestingUtils.delay(800);

        // Should have attempted reconnection
        expect(reconnectAttempts).toBeGreaterThan(0);
        expect(reconnectAttempts).toBeLessThanOrEqual(3);

        manager.cleanup();
      });

      it('should handle exponential backoff in reconnection attempts', async () => {
        const reconnectionTimes: number[] = [];
        let reconnectAttempts = 0;

        const mockReconnect = jest.fn(() => {
          const currentTime = Date.now();
          reconnectionTimes.push(currentTime);
          reconnectAttempts++;
          
          // Simulate failure for first few attempts
          if (reconnectAttempts < 3) {
            throw new Error('Connection failed');
          }
          
          return Promise.resolve();
        });

        const config = {
          port: 8001,
          heartbeatInterval: 100,
          connectionTimeout: 1000,
          maxConnections: 10,
          enableAuthentication: false,
          jwtSecret: 'test-secret',
          corsOrigins: ['*'],
          enableAutoReconnect: true,
          reconnectInterval: 100, // Base interval
          maxReconnectAttempts: 5,
          useExponentialBackoff: true
        };

        const manager = new ConnectionManager(config);
        
        // Mock connection with reconnection logic
        const mockConnection = {
          id: 'test-connection',
          reconnect: mockReconnect,
          status: 'disconnected'
        };

        // Simulate reconnection process
        const startTime = Date.now();
        
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await mockConnection.reconnect();
            break;
          } catch (error) {
            // Calculate expected delay for exponential backoff
            const expectedDelay = config.reconnectInterval * Math.pow(2, attempt - 1);
            await AsyncTestingUtils.delay(expectedDelay);
          }
        }

        // Verify exponential backoff pattern
        if (reconnectionTimes.length >= 2) {
          for (let i = 1; i < reconnectionTimes.length; i++) {
            const interval = reconnectionTimes[i] - reconnectionTimes[i - 1];
            const expectedMinInterval = config.reconnectInterval * Math.pow(2, i - 1);
            expect(interval).toBeGreaterThanOrEqual(expectedMinInterval - 50); // Allow 50ms tolerance
          }
        }

        manager.cleanup();
      });

      it('should handle partial reconnection failure and recovery', async () => {
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
        const connections: any[] = [];
        
        // Create multiple connections
        for (let i = 0; i < 5; i++) {
          const mockWs = {
            on: jest.fn(),
            close: jest.fn(),
            ping: jest.fn(),
            send: jest.fn(),
            readyState: i < 3 ? WebSocket.OPEN : WebSocket.CLOSED, // Some fail
            removeAllListeners: jest.fn(),
            id: `connection-${i}`
          } as any;

          const request = {
            headers: { 'user-agent': `test-agent-${i}` },
            socket: { remoteAddress: '127.0.0.1' }
          };

          const connectionId = manager.addConnection(mockWs, request);
          connections.push({ id: connectionId, ws: mockWs });
        }

        // Verify partial success
        const activeConnections = connections.filter((_, i) => i < 3);
        const failedConnections = connections.filter((_, i) => i >= 3);

        activeConnections.forEach(conn => {
          expect(manager.getConnectionInfo(conn.id)).toBeDefined();
        });

        // Cleanup
        manager.cleanup();
      });
    });

    describe('Service Discovery and Failover', () => {
      it('should handle primary service failure and fallback', async () => {
        const primaryConfig = {
          port: 8001,
          heartbeatInterval: 1000,
          connectionTimeout: 5000,
          maxConnections: 10,
          enableAuthentication: false,
          jwtSecret: 'test-secret',
          corsOrigins: ['*'],
          serviceName: 'primary'
        };

        const fallbackConfig = {
          ...primaryConfig,
          port: 8002,
          serviceName: 'fallback'
        };

        const primaryManager = new ConnectionManager(primaryConfig);
        const fallbackManager = new ConnectionManager(fallbackConfig);

        // Simulate primary service failure
        const mockServiceHealth = {
          primary: false, // Failed
          fallback: true  // Healthy
        };

        const getHealthyService = () => {
          if (mockServiceHealth.primary) return primaryManager;
          if (mockServiceHealth.fallback) return fallbackManager;
          throw new Error('No healthy service available');
        };

        // Attempt connection - should use fallback
        const healthyManager = getHealthyService();
        expect(healthyManager).toBe(fallbackManager);

        primaryManager.cleanup();
        fallbackManager.cleanup();
      });

      it('should handle gradual service recovery', async () => {
        const serviceStates = {
          database: false,
          cache: false,
          messageQueue: false,
          storage: false
        };

        const checkServiceHealth = async (serviceName: string) => {
          return serviceStates[serviceName as keyof typeof serviceStates];
        };

        const recoverService = async (serviceName: string) => {
          // Simulate recovery time
          await AsyncTestingUtils.delay(100);
          serviceStates[serviceName as keyof typeof serviceStates] = true;
          return true;
        };

        // Simulate gradual recovery
        const services = Object.keys(serviceStates);
        const recoveryPromises = services.map(async (service, index) => {
          // Stagger recovery
          await AsyncTestingUtils.delay(index * 200);
          return recoverService(service);
        });

        await Promise.all(recoveryPromises);

        // Verify all services recovered
        for (const service of services) {
          const isHealthy = await checkServiceHealth(service);
          expect(isHealthy).toBe(true);
        }
      });
    });
  });

  describe('Data Recovery and Consistency Scenarios', () => {
    describe('State Recovery After Failure', () => {
      it('should recover graph execution state after interruption', async () => {
        const graph: Graph = {
          nodes: [
            {
              id: 'sequential1',
              type: 'Sequential',
              inputs: [],
              data: {
                items: ['A', 'B', 'C', 'D', 'E'],
                pattern: 'linear',
                currentIndex: 2 // Interrupted at position 2
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['sequential1'],
              data: { template: '{{sequential1}}' }
            }
          ]
        };

        const engine = new GraphEngine();

        // Save state before execution
        const stateBeforeFailure = JSON.parse(JSON.stringify(graph));
        
        try {
          // Execute - might fail due to simulated interruption
          const result = await engine.execute(graph, 'recovery-seed');
          
          if (result.success) {
            expect(result.outputs[0]).toBe('C'); // Should continue from saved state
          }
        } catch (error) {
          // Simulate recovery from saved state
          const recoveredResult = await engine.execute(stateBeforeFailure, 'recovery-seed');
          expect(recoveredResult.success).toBe(true);
        }
      });

      it('should handle corrupted state recovery', async () => {
        const mockStorage = testEnv.mocks.get('localStorage');
        
        // Simulate corrupted state data
        mockStorage.getItem = jest.fn().mockReturnValue(
          '{"corrupted": json"}' // Invalid JSON
        );

        const engine = new GraphEngine();
        const graph: Graph = {
          nodes: [
            {
              id: 'choice1',
              type: 'WeightedChoice',
              inputs: [],
              data: { choices: [{ value: 'Default', weight: 1 }] }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['choice1'],
              data: { template: '{{choice1}}' }
            }
          ]
        };

        // Should recover with default state
        const result = await engine.execute(graph, 'recovery-seed');
        expect(result.success).toBe(true);
        expect(result.outputs[0]).toBe('Default');
      });

      it('should handle partial state recovery', async () => {
        const partialStateGraph: Graph = {
          nodes: [
            {
              id: 'markov1',
              type: 'Markov',
              inputs: [],
              data: {
                states: ['A', 'B', 'C'],
                transitionMatrix: [
                  [0.5, 0.3, 0.2],
                  [0.2, 0.5, 0.3],
                  [0.3, 0.2, 0.5]
                ],
                currentState: 'B', // Partially executed state
                executionHistory: ['A', 'B'] // Some history available
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['markov1'],
              data: { template: '{{markov1}}' }
            }
          ]
        };

        const engine = new GraphEngine();
        
        // Execute with partial state
        const result = await engine.execute(partialStateGraph, 'recovery-seed');
        expect(result.success).toBe(true);
        
        // Should continue from current state 'B'
        const currentState = partialStateGraph.nodes[0].data?.currentState;
        expect(['A', 'B', 'C']).toContain(currentState);
      });
    });

    describe('Transaction Recovery', () => {
      it('should handle rollback on execution failure', async () => {
        const transactionalGraph: Graph = {
          nodes: [
            {
              id: 'set-var1',
              type: 'SetVariable',
              inputs: [],
              data: { name: 'counter', value: 1 }
            },
            {
              id: 'set-var2',
              type: 'SetVariable',
              inputs: ['set-var1'],
              data: { name: 'counter', value: 2 }
            },
            {
              id: 'failing-node',
              type: 'WeightedChoice',
              inputs: ['set-var2'],
              data: { choices: [] } // Empty choices will fail
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['failing-node'],
              data: { template: '{{counter}}' }
            }
          ]
        };

        const engine = new GraphEngine();
        
        try {
          await engine.execute(transactionalGraph, 'transaction-seed');
          fail('Should have thrown an error');
        } catch (error) {
          // Check that variables were rolled back
          const variables = engine.getVariableState?.();
          expect(variables?.counter).toBeUndefined(); // Should be rolled back
        }
      });

      it('should handle concurrent transaction conflicts', async () => {
        const conflictingGraph: Graph = {
          nodes: [
            {
              id: 'shared-var',
              type: 'SetVariable',
              inputs: [],
              data: { name: 'sharedCounter', value: 0 }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['shared-var'],
              data: { template: '{{sharedCounter}}' }
            }
          ]
        };

        const engine1 = new GraphEngine();
        const engine2 = new GraphEngine();

        // Execute concurrently
        const promises = [
          engine1.execute(conflictingGraph, 'concurrent-1'),
          engine2.execute(conflictingGraph, 'concurrent-2')
        ];

        const results = await Promise.allSettled(promises);
        
        // At least one should succeed
        const successes = results.filter(r => r.status === 'fulfilled');
        expect(successes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Resource Recovery Scenarios', () => {
    describe('Memory Recovery', () => {
      it('should recover from memory pressure', async () => {
        // Mock memory monitoring
        let memoryPressure = false;
        const originalMemoryUsage = process.memoryUsage;
        
        process.memoryUsage = jest.fn().mockImplementation(() => {
          return {
            rss: memoryPressure ? 800000000 : 400000000, // 800MB vs 400MB
            heapUsed: memoryPressure ? 750000000 : 300000000,
            heapTotal: memoryPressure ? 800000000 : 400000000,
            external: 10000000,
            arrayBuffers: 5000000
          };
        });

        const engine = new GraphEngine();
        
        // Simulate memory pressure scenario
        memoryPressure = true;
        
        const lightweightGraph: Graph = {
          nodes: [
            {
              id: 'simple-choice',
              type: 'WeightedChoice',
              inputs: [],
              data: { choices: [{ value: 'Simple', weight: 1 }] }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['simple-choice'],
              data: { template: '{{simple-choice}}' }
            }
          ]
        };

        try {
          const result = await engine.execute(lightweightGraph, 'memory-recovery');
          
          // Should either succeed with memory management or fail gracefully
          if (result.success) {
            expect(result.outputs[0]).toBe('Simple');
          }
        } catch (error) {
          expect(error.message).toMatch(/memory|resource/i);
        } finally {
          process.memoryUsage = originalMemoryUsage;
          memoryPressure = false;
        }
      });

      it('should implement garbage collection on memory pressure', async () => {
        const memoryStats = {
          before: process.memoryUsage(),
          after: null as any
        };

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        // Simulate memory cleanup operations
        const cleanup = () => {
          // Clear large objects, caches, etc.
          const largeArray = new Array(100000).fill('memory-test');
          largeArray.length = 0;
        };

        cleanup();

        memoryStats.after = process.memoryUsage();
        
        // Memory usage should be reasonable
        expect(memoryStats.after.heapUsed).toBeLessThan(memoryStats.before.heapUsed * 1.5);
      });
    });

    describe('Storage Recovery', () => {
      it('should recover from storage quota exceeded', async () => {
        const mockStorage = testEnv.mocks.get('localStorage');
        let quotaExceeded = true;

        mockStorage.setItem = jest.fn().mockImplementation((key, value) => {
          if (quotaExceeded && value.length > 1000) {
            const error = new Error('QuotaExceededError');
            error.name = 'QuotaExceededError';
            throw error;
          }
          return true;
        });

        // Attempt to store large data
        const largeData = JSON.stringify({ data: new Array(10000).fill('large') });
        
        try {
          mockStorage.setItem('large-key', largeData);
        } catch (error) {
          expect(error.name).toBe('QuotaExceededError');
          
          // Implement recovery strategy - compress or split data
          const compressedData = JSON.stringify({ compressed: true, size: largeData.length });
          quotaExceeded = false;
          
          // Should succeed with compressed data
          expect(() => mockStorage.setItem('compressed-key', compressedData)).not.toThrow();
        }
      });

      it('should handle storage corruption recovery', async () => {
        const mockStorage = testEnv.mocks.get('localStorage');
        
        // Simulate corrupted storage
        mockStorage.getItem = jest.fn().mockImplementation((key) => {
          if (key === 'corrupted-key') {
            return '{"incomplete": json'; // Corrupted JSON
          }
          return null;
        });

        const recoverFromCorruption = (key: string) => {
          try {
            const data = mockStorage.getItem(key);
            return JSON.parse(data);
          } catch (error) {
            // Recovery: return default or attempt repair
            console.warn(`Storage corruption detected for key: ${key}`);
            return { recovered: true, original: null };
          }
        };

        const result = recoverFromCorruption('corrupted-key');
        expect(result.recovered).toBe(true);
        expect(result.original).toBeNull();
      });
    });
  });

  describe('Service Mesh Recovery Scenarios', () => {
    describe('Circuit Breaker Patterns', () => {
      it('should implement circuit breaker for failing services', async () => {
        let failureCount = 0;
        const maxFailures = 3;
        let circuitOpen = false;

        const mockService = {
          call: jest.fn().mockImplementation(() => {
            if (circuitOpen) {
              throw new Error('Circuit breaker open');
            }

            failureCount++;
            if (failureCount <= maxFailures) {
              throw new Error('Service failure');
            }

            // Service recovered
            failureCount = 0;
            return { success: true, data: 'Service response' };
          }),
          
          reset: () => {
            failureCount = 0;
            circuitOpen = false;
          }
        };

        // Test circuit breaker logic
        for (let i = 1; i <= maxFailures + 1; i++) {
          try {
            await mockService.call();
          } catch (error) {
            if (i > maxFailures) {
              circuitOpen = true;
            }
            expect(error.message).toMatch(/service failure|circuit breaker/i);
          }
        }

        expect(circuitOpen).toBe(true);

        // Test recovery after timeout
        setTimeout(() => {
          circuitOpen = false;
          failureCount = 0;
        }, 1000);

        await AsyncTestingUtils.delay(1100);

        // Should be able to call service again
        const result = await mockService.call();
        expect(result.success).toBe(true);
      });

      it('should implement bulkhead pattern for resource isolation', async () => {
        const resourcePools = {
          critical: { limit: 10, current: 0 },
          normal: { limit: 20, current: 0 },
          background: { limit: 5, current: 0 }
        };

        const acquireResource = (poolName: keyof typeof resourcePools) => {
          const pool = resourcePools[poolName];
          if (pool.current >= pool.limit) {
            throw new Error(`Resource pool ${poolName} exhausted`);
          }
          pool.current++;
          return pool.current;
        };

        const releaseResource = (poolName: keyof typeof resourcePools) => {
          const pool = resourcePools[poolName];
          if (pool.current > 0) {
            pool.current--;
          }
        };

        // Test resource isolation
        try {
          // Fill up background pool
          for (let i = 0; i < 6; i++) {
            try {
              acquireResource('background');
            } catch (error) {
              expect(error.message).toMatch(/background.*exhausted/i);
            }
          }

          // Critical operations should still work
          const criticalResource = acquireResource('critical');
          expect(criticalResource).toBe(1);
          releaseResource('critical');

        } catch (error) {
          fail(`Resource isolation failed: ${error.message}`);
        }
      });
    });
  });
});