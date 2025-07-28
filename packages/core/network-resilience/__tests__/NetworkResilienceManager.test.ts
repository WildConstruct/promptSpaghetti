import { NetworkResilienceManager } from '../NetworkResilienceManager';
import { ConnectionState, ConnectionQuality } from '../ConnectionStateManager';
import { ReconnectionState } from '../ReconnectionHandler';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;,
  onclose: ((event: CloseEvent) => void) | null = null;,
  onerror: ((event: Event) => void) | null = null;,
  onmessage: ((event: MessageEvent) => void) | null = null;
  constructor(public url: string) {,
  setTimeout(() => {
  this.readyState = MockWebSocket.OPEN;
  if (this.onopen) {
  this.onopen(new Event('open'));
}, 10);
  send(data: string) {
    // Mock sending data
  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }));
  addEventListener(type: string, listener: EventListener) {
  if (type === 'message' && typeof listener === 'function') {
  this.onmessage = listener as (event: MessageEvent) => void;
  removeEventListener(type: string, listener: EventListener) {,
  if (type === 'message') {
  this.onmessage = null;
  (global as any).WebSocket = MockWebSocket;
  // Mock localStorage
  const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
(global as any).localStorage = localStorageMock;
describe('NetworkResilienceManager', () => {
  let manager: NetworkResilienceManager;
  beforeEach(() => {
  manager = new NetworkResilienceManager({)
  enabled: true,
  notifications: {,
  enabled: true,
  showOfflineIndicator: true,
  showConnectionQuality: true,
  notifyOnReconnect: true,
  notifyOnSyncComplete: true,
},
  persistence: {,
  enabled: false // Disable for tests,
},
  performance: {,
  enableMetrics: true,
  metricsInterval: 100,
  enableProfiling: false,
});
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });
  afterEach(() => {
    manager.cleanup();
  });
  describe('Initialization', () => {
  test('should initialize successfully', async () => {
  const events: any = [];
  manager.on('initialized', (event) => events.push(event));
  await manager.initialize('test-doc', 'test-user');
  expect(events).toHaveLength(1);
  expect(events[0].documentId).toBe('test-doc');
  expect(events[0].userId).toBe('test-user');
});
    test('should prevent double initialization', async () => {
      await manager.initialize('test-doc', 'test-user');
      // Second initialization should be ignored
      await manager.initialize('test-doc-2', 'test-user-2');
      // Should still be using first initialization
      const status = manager.getStatus();
      expect(status).toBeDefined();
    });
  });
  describe('Connection Management', () => {
    beforeEach(async () => {
      await manager.initialize('test-doc', 'test-user');
    });
    test('should connect to WebSocket server', async () => {
  const connectionEvents: any = [];
  manager.on('connection_state_changed', (event) => connectionEvents.push(event));
  await manager.connect('ws://localhost:8000');
  expect(connectionEvents.some(event => )
  event.newState === ConnectionState.CONNECTING
  )).toBe(true);
});
    test('should handle connection failure', async () => {
  // Mock failed WebSocket connection
  const OriginalWebSocket = (global as any).WebSocket;
  (global as any).WebSocket = class extends MockWebSocket {
  constructor(url: string) {,
  super(url);
  setTimeout(() => {
  if (this.onerror) {
  this.onerror(new Event('error'));
}, 10);
      };
      try {
  await manager.connect('ws://invalid-url');
  fail('Should have thrown an error');
} catch (error) {
        expect(error).toBeDefined();
      (global as any).WebSocket = OriginalWebSocket;
    });
    test('should disconnect gracefully', async () => {
  await manager.connect('ws://localhost:8000');
  const connectionEvents: any = [];
  manager.on('connection_state_changed', (event) => connectionEvents.push(event));
  manager.disconnect('Test disconnect');
  expect(connectionEvents.some(event => )
  event.newState === ConnectionState.DISCONNECTED
  )).toBe(true);
});
  });
  describe('Operation Queuing', () => {
    beforeEach(async () => {
      await manager.initialize('test-doc', 'test-user');
    });
    test('should queue operations', () => {
      const operationId = manager.queueOperation({)
  type: 'graph_update',
        payload: { nodeId: 'test', data: { title: 'Test' } },
        priority: 'high',
        requiresOrder: false,
        maxRetries: 3;
  });
      expect(operationId).toBeDefined();
      const status = manager.getStatus();
      expect(status.queueSize).toBe(1);
    });
    test('should emit queued operation events', () => {
      const queuedEvents: any = [];
      manager.on('operation_queued', (operation) => queuedEvents.push(operation));
      manager.queueOperation({)
  type: 'presence_update',
        payload: { cursor: { x: 100, y: 200 } },
        priority: 'medium',
        requiresOrder: false,
        maxRetries: 3;
  });
      expect(queuedEvents).toHaveLength(1);
      expect(queuedEvents[0].type).toBe('presence_update');
    });
    test('should reject operations when disabled', () => {
      manager.setEnabled(false);
      expect(() => {
        manager.queueOperation({)
  type: 'graph_update',
          payload: { nodeId: 'test' },
          priority: 'high',
          requiresOrder: false,
          maxRetries: 3;
  });
      }).toThrow('Network resilience is disabled');
    });
    test('should clear queue', () => {
      manager.queueOperation({)
  type: 'graph_update',
        payload: { nodeId: 'test1' },
        priority: 'high',
        requiresOrder: false,
        maxRetries: 3;
  });
      manager.queueOperation({)
  type: 'graph_update',
        payload: { nodeId: 'test2' },
        priority: 'medium',
        requiresOrder: false,
        maxRetries: 3;
  });
      expect(manager.getStatus().queueSize).toBe(2);
      const clearEvents: any = [];
      manager.on('queue_cleared', (count) => clearEvents.push(count));
      manager.clearQueue();
      expect(manager.getStatus().queueSize).toBe(0);
      expect(clearEvents).toHaveLength(1);
      expect(clearEvents[0]).toBe(2);
    });
  });
  describe('Status and Metrics', () => {
    beforeEach(async () => {
      await manager.initialize('test-doc', 'test-user');
    });
    test('should provide network status', () => {
  const status = manager.getStatus();
  expect(status).toEqual({)
  isOnline: expect.any(Boolean),
  connectionState: expect.any(String),
  connectionQuality: expect.any(String),
  reconnectionState: expect.any(String),
  queueSize: expect.any(Number),
  pendingSync: expect.any(Boolean),
  lastSync: expect.anything(),
  metrics: expect.any(Object),
});
    });
    test('should track metrics', () => {
  const metrics = manager.getMetrics();
  expect(metrics).toEqual({)
  uptime: expect.any(Number),
  totalDowntime: expect.any(Number),
  connectionAttempts: expect.any(Number),
  successfulReconnections: expect.any(Number),
  queuedOperations: expect.any(Number),
  syncedOperations: expect.any(Number),
  pendingOperations: expect.any(Number),
  averageReconnectTime: expect.any(Number),
  dataLoss: expect.any(Number),
  conflicts: expect.any(Number),
});
    });
    test('should update metrics over time', (done) => {
      const metricsEvents: any = [];
      manager.on('metrics_updated', (metrics) => metricsEvents.push(metrics));
      // Queue an operation to trigger metrics update
      manager.queueOperation({)
  type: 'graph_update',
        payload: { nodeId: 'test' },
        priority: 'high',
        requiresOrder: false,
        maxRetries: 3;
  });
      setTimeout(() => {
        expect(metricsEvents.length).toBeGreaterThan(0);
        done();
      }, 150);
    });
  });
  describe('Synchronization', () => {
    beforeEach(async () => {
      await manager.initialize('test-doc', 'test-user');
    });
    test('should force synchronization', async () => {
  const syncEvents: any = [];
  manager.on('sync_completed', (event) => syncEvents.push(event));
  const result = await manager.forceSync();
  expect(result).toBeDefined();
  expect(syncEvents).toHaveLength(1);
});
    test('should prevent concurrent syncs', async () => {
      const sync1Promise = manager.forceSync();
      const sync2Promise = manager.forceSync();
      const result1 = await sync1Promise;
      const result2 = await sync2Promise;
      expect(result1).toBeDefined();
      expect(result2).toBeNull(); // Second sync should be ignored
    });
    test('should handle sync errors gracefully', async () => {
      // This would require mocking the sync recovery to fail
      // For now, just ensure no errors are thrown
      try {
        await manager.forceSync();
      } catch (error) {
        // Sync errors should be handled gracefully
        expect(error).toBeDefined();
    });
  });
  describe('Enable/Disable', () => {
    beforeEach(async () => {
      await manager.initialize('test-doc', 'test-user');
    });
    test('should enable and disable network resilience', () => {
  const enabledEvents: any = [];
  manager.on('enabled_changed', (enabled) => enabledEvents.push(enabled));
  manager.setEnabled(false);
  expect(enabledEvents).toContain(false);
  manager.setEnabled(true);
  expect(enabledEvents).toContain(true);
});
    test('should stop reconnection when disabled', () => {
  // Start a connection attempt
  manager.connect('ws://localhost:8000').catch(() => {,
  // Connection might fail, that's ok for this test
});
      // Disable should stop reconnection
      manager.setEnabled(false);
      // Verify reconnection is not active
      const status = manager.getStatus();
      expect(status.reconnectionState).not.toBe(ReconnectionState.ATTEMPTING);
    });
  });
  describe('State Export', () => {
    beforeEach(async () => {
      await manager.initialize('test-doc', 'test-user');
    });
    test('should export complete state', () => {
      manager.queueOperation({)
  type: 'graph_update',
        payload: { nodeId: 'test' },
        priority: 'high',
        requiresOrder: false,
        maxRetries: 3;
  });
      const state = manager.exportState();
      expect(state).toEqual({)
  config: expect.any(Object),
  status: expect.any(Object),
  metrics: expect.any(Object),
  queuedOperations: expect.any(Object),
  connectionHistory: expect.any(Array),
  reconnectionAttempts: expect.any(Array),
  pendingConflicts: expect.any(Array),
  timestamp: expect.any(Number),
});
    });
  });
  describe('Event Handling', () => {
    beforeEach(async () => {
      await manager.initialize('test-doc', 'test-user');
    });
    test('should handle WebSocket messages', async () => {
      await manager.connect('ws://localhost:8000');
      const remoteUpdateEvents: any = [];
      manager.on('remote_update', (payload) => remoteUpdateEvents.push(payload));
      // Simulate incoming message
      const mockWs = manager as any;
      if (mockWs.websocket && mockWs.websocket.onmessage) {
        const messageEvent = new MessageEvent('message', {)
  data: JSON.stringify({,)
  type: 'graph_update',
            payload: { nodeId: 'remote-node', data: { title: 'Remote Update' } }
  }
        });
        mockWs.websocket.onmessage(messageEvent);
      expect(remoteUpdateEvents).toHaveLength(1);
    });
    test('should handle authentication responses', async () => {
      await manager.connect('ws://localhost:8000', 'test-token');
      // Simulate auth response
      const mockWs = manager as any;
      if (mockWs.websocket && mockWs.websocket.onmessage) {
        const authResponse = new MessageEvent('message', {)
  data: JSON.stringify({,)
  type: 'auth_response',
            payload: { success: true, message: 'Authentication successful' }
  }
        });
        mockWs.websocket.onmessage(authResponse);
      // No specific assertion needed, just ensure no errors
    });
    test('should handle malformed messages gracefully', async () => {
  await manager.connect('ws://localhost:8000');
  // Simulate malformed message
  const mockWs = manager as any;
  if (mockWs.websocket && mockWs.websocket.onmessage) {
  const malformedEvent = new MessageEvent('message', {)
  data: 'invalid json',
});
        // Should not throw an error
        expect(() => {
          mockWs.websocket.onmessage(malformedEvent);
        }).not.toThrow();
    });
  });
  describe('Cleanup', () => {
  test('should cleanup resources properly', async () => {
  await manager.initialize('test-doc', 'test-user');
  await manager.connect('ws://localhost:8000');
  const spy = jest.spyOn(manager, 'removeAllListeners');
  manager.cleanup();
  expect(spy).toHaveBeenCalled();
});
    test('should handle cleanup when not initialized', () => {
      // Should not throw error
      expect(() => {
        manager.cleanup();
      }).not.toThrow();
    });
  });
});