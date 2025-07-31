import WebSocket from 'ws';
import { ConnectionManager } from '../ConnectionManager';
import { WSServerConfig, AuthPayload } from '../types';

// Mock WebSocket and related modules
jest.mock('ws');
jest.mock('jsonwebtoken');

describe('ConnectionManager', () => {
  let manager: ConnectionManager;
  let config: WSServerConfig;
  let mockWs: jest.Mocked<WebSocket>;

  beforeEach(() => {
    config = {
      port: 8001,
      heartbeatInterval: 1000,
      connectionTimeout: 5000,
      maxConnections: 10,
      enableAuthentication: false,
      jwtSecret: 'test-secret',
      corsOrigins: ['*'],
    };

    manager = new ConnectionManager(config);

    // Mock WebSocket instance
    mockWs = {
      on: jest.fn<unknown[], unknown>(),
      close: jest.fn<unknown[], unknown>(),
      ping: jest.fn<unknown[], unknown>(),
      send: jest.fn<unknown[], unknown>(),
      readyState: WebSocket.OPEN,
      removeAllListeners: jest.fn<unknown[], unknown>(),
    } as any;
  });

  afterEach(() => {
    manager.cleanup();
  });

  describe('connection management', () => {
    it('should add connection successfully', () => {
      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = manager.addConnection(mockWs, request);

      expect(connectionId).toBeDefined();
      expect(typeof connectionId).toBe('string');
      expect(mockWs.on).toHaveBeenCalledWith('close', expect.any(Function));
      expect(mockWs.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockWs.on).toHaveBeenCalledWith('pong', expect.any(Function));
    });

    it('should remove connection successfully', () => {
      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = manager.addConnection(mockWs, request);
      const connectionInfo = manager.getConnectionInfo(connectionId);

      expect(connectionInfo).toBeDefined();

      manager.removeConnection(connectionId);

      const removedConnectionInfo = manager.getConnectionInfo(connectionId);
      expect(removedConnectionInfo).toBeUndefined();
    });

    it('should get connection info', () => {
      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = manager.addConnection(mockWs, request);
      const connectionInfo = manager.getConnectionInfo(connectionId);

      expect(connectionInfo).toBeDefined();
      expect(connectionInfo?.id).toBe(connectionId);
      expect(connectionInfo?.authenticated).toBe(false);
      expect(connectionInfo?.userAgent).toBe('test-agent');
      expect(connectionInfo?.ipAddress).toBe('127.0.0.1');
    });
  });

  describe('authentication', () => {
    it('should authenticate connection with valid token when auth enabled', async () => {
      const authConfig = { ...config, enableAuthentication: true };
      const authManager = new ConnectionManager(authConfig);

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn<unknown[], unknown>().mockReturnValue({ userId: 'test-user' } as unknown as unknown);

      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = authManager.addConnection(mockWs, request);
      const authPayload: AuthPayload = {
        token: 'valid-token',
        documentId: 'test-doc',
        permissions: ['read', 'write'],
      };

      const result = await authManager.authenticateConnection(connectionId, authPayload);

      expect(result).toBe(true);
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');

      const connectionInfo = authManager.getConnectionInfo(connectionId);
      expect(connectionInfo?.authenticated).toBe(true);
      expect(connectionInfo?.userId).toBe('test-user');
      expect(connectionInfo?.documentId).toBe('test-doc');

      authManager.cleanup();
    });

    it('should skip authentication when disabled', async () => {
      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = manager.addConnection(mockWs, request);
      const authPayload: AuthPayload = {
        token: 'any-token',
        documentId: 'test-doc',
        permissions: ['read', 'write'],
      };

      const result = await manager.authenticateConnection(connectionId, authPayload);

      expect(result).toBe(true);

      const connectionInfo = manager.getConnectionInfo(connectionId);
      expect(connectionInfo?.authenticated).toBe(true);
      expect(connectionInfo?.userId).toBe('anonymous');
      expect(connectionInfo?.documentId).toBe('test-doc');
    });

    it('should fail authentication with invalid token', async () => {
      const authConfig = { ...config, enableAuthentication: true };
      const authManager = new ConnectionManager(authConfig);

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn<unknown[], unknown>().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = authManager.addConnection(mockWs, request);
      const authPayload: AuthPayload = {
        token: 'invalid-token',
        documentId: 'test-doc',
      };

      const result = await authManager.authenticateConnection(connectionId, authPayload);

      expect(result).toBe(false);

      const connectionInfo = authManager.getConnectionInfo(connectionId);
      expect(connectionInfo?.authenticated).toBe(false);

      authManager.cleanup();
    });
  });

  describe('document sessions', () => {
    it('should create document session when user joins', async () => {
      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = manager.addConnection(mockWs, request);
      const authPayload: AuthPayload = {
        token: 'test-token',
        documentId: 'test-doc',
      };

      await manager.authenticateConnection(connectionId, authPayload);

      const session = manager.getDocumentSession('test-doc');
      expect(session).toBeDefined();
      expect(session?.documentId).toBe('test-doc');
      expect(session?.connections.size).toBe(1);
    });

    it('should get document connections', async () => {
      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = manager.addConnection(mockWs, request);
      const authPayload: AuthPayload = {
        token: 'test-token',
        documentId: 'test-doc',
      };

      await manager.authenticateConnection(connectionId, authPayload);

      const connections = manager.getDocumentConnections('test-doc');
      expect(connections).toHaveLength(1);
      expect(connections[0].id).toBe(connectionId);
    });

    it('should clean up empty sessions', async () => {
      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = manager.addConnection(mockWs, request);
      const authPayload: AuthPayload = {
        token: 'test-token',
        documentId: 'test-doc',
      };

      await manager.authenticateConnection(connectionId, authPayload);

      let session = manager.getDocumentSession('test-doc');
      expect(session).toBeDefined();

      manager.removeConnection(connectionId);

      session = manager.getDocumentSession('test-doc');
      expect(session).toBeUndefined();
    });
  });

  describe('message broadcasting', () => {
    it('should broadcast to document connections', async () => {
      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = manager.addConnection(mockWs, request);
      const authPayload: AuthPayload = {
        token: 'test-token',
        documentId: 'test-doc',
      };

      await manager.authenticateConnection(connectionId, authPayload);

      const message = {
        type: 'ping' as const,
        payload: { data: 'test' },
        timestamp: Date.now(),
      };

      manager.broadcastToDocument('test-doc', message);

      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('should exclude sender from broadcast', async () => {
      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = manager.addConnection(mockWs, request);
      const authPayload: AuthPayload = {
        token: 'test-token',
        documentId: 'test-doc',
      };

      await manager.authenticateConnection(connectionId, authPayload);

      const message = {
        type: 'ping' as const,
        payload: { data: 'test' },
        timestamp: Date.now(),
      };

      manager.broadcastToDocument('test-doc', message, connectionId);

      expect(mockWs.send).not.toHaveBeenCalled();
    });

    it('should send message to specific connection', () => {
      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = manager.addConnection(mockWs, request);

      const message = {
        type: 'ping' as const,
        payload: { data: 'test' },
        timestamp: Date.now(),
      };

      const result = manager.sendToConnection(connectionId, message);

      expect(result).toBe(true);
      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('should handle send errors gracefully', () => {
      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = manager.addConnection(mockWs, request);
      mockWs.send.mockImplementation(() => {
        throw new Error('Send failed');
      });

      const message = {
        type: 'ping' as const,
        payload: { data: 'test' },
        timestamp: Date.now(),
      };

      const result = manager.sendToConnection(connectionId, message);

      expect(result).toBe(false);
    });
  });

  describe('permissions', () => {
    it('should check permissions correctly', async () => {
      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = manager.addConnection(mockWs, request);
      const authPayload: AuthPayload = {
        token: 'test-token',
        documentId: 'test-doc',
        permissions: ['read', 'write'],
      };

      await manager.authenticateConnection(connectionId, authPayload);

      expect(manager.hasPermission(connectionId, 'read')).toBe(true);
      expect(manager.hasPermission(connectionId, 'write')).toBe(true);
      expect(manager.hasPermission(connectionId, 'admin')).toBe(false);
    });

    it('should deny permissions for unauthenticated connections', () => {
      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = manager.addConnection(mockWs, request);

      expect(manager.hasPermission(connectionId, 'read')).toBe(false);
      expect(manager.hasPermission(connectionId, 'write')).toBe(false);
    });
  });

  describe('health metrics', () => {
    it('should provide health metrics', () => {
      const metrics = manager.getHealthMetrics();

      expect(metrics).toHaveProperty('totalConnections');
      expect(metrics).toHaveProperty('activeDocuments');
      expect(metrics).toHaveProperty('messagesPerSecond');
      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('lastUpdated');

      expect(typeof metrics.totalConnections).toBe('number');
      expect(typeof metrics.activeDocuments).toBe('number');
    });

    it('should update metrics when connections change', () => {
      const initialMetrics = manager.getHealthMetrics();

      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      const connectionId = manager.addConnection(mockWs, request);
      const updatedMetrics = manager.getHealthMetrics();

      expect(updatedMetrics.totalConnections).toBe(initialMetrics.totalConnections + 1);

      manager.removeConnection(connectionId);
      const finalMetrics = manager.getHealthMetrics();

      expect(finalMetrics.totalConnections).toBe(initialMetrics.totalConnections);
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources properly', () => {
      const request = {
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
      };

      manager.addConnection(mockWs, request);
      manager.cleanup();

      expect(mockWs.close).toHaveBeenCalled();
    });
  });
});
