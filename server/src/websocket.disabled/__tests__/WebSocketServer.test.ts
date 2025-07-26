import WebSocket from 'ws';
import { WebSocketServer } from '../WebSocketServer';
import { WSServerConfig } from '../types';

// Mock all dependencies
jest.mock('ws', () => ({
  Server: jest.fn<unknown[], unknown>()
}));

// Mock ConnectionManager
jest.mock('../ConnectionManager', () => ({
  ConnectionManager: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    getHealthMetrics: jest.fn(() => ({
      totalConnections: 0,
      activeDocuments: 0,
      messagesPerSecond: 0,
      uptime: 0,
      memoryUsage: 0,
      lastUpdated: Date.now()
    })),
    broadcastToDocument: jest.fn<unknown[], unknown>(),
    cleanup: jest.fn<unknown[], unknown>(),
    on: jest.fn<unknown[], unknown>()
  }))
}));

// Mock PresenceManager
jest.mock('../PresenceManager', () => ({
  PresenceManager: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    cleanup: jest.fn<unknown[], unknown>(),
    getDocumentUsers: jest.fn(() => []),
    getPresenceStats: jest.fn(() => ({})),
    on: jest.fn<unknown[], unknown>()
  }))
}));

// Mock ConflictResolver
jest.mock('../ConflictResolver', () => ({
  ConflictResolver: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    cleanup: jest.fn<unknown[], unknown>(),
    on: jest.fn<unknown[], unknown>()
  }))
}));

// Mock SynchronizationManager
jest.mock('../SynchronizationManager', () => ({
  SynchronizationManager: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    cleanup: jest.fn<unknown[], unknown>(),
    on: jest.fn<unknown[], unknown>()
  }))
}));

// Mock Analytics
jest.mock('../../analytics/AnalyticsCollector', () => ({
  AnalyticsCollector: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    on: jest.fn<unknown[], unknown>()
  }))
}));

jest.mock('../../database/analytics-dao', () => ({
  AnalyticsDAO: jest.fn<unknown[], unknown>().mockImplementation(() => ({}))
}));

jest.mock('../../database/connection', () => ({
  getDatabase: jest.fn(() => ({}))
}));

describe('WebSocketServer', () => {
  let server: WebSocketServer;
  let config: WSServerConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    config = {
      port: 8001,
      heartbeatInterval: 1000,
      connectionTimeout: 5000,
      maxConnections: 10,
      enableAuthentication: false,
      corsOrigins: ['*']
    };
    
    server = new WebSocketServer(config);
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  }, 5000); // 5 second timeout for cleanup

  describe('initialization', () => {
    it('should create server with provided config', () => {
      expect(server).toBeInstanceOf(WebSocketServer);
    });

    it('should start server on configured port', async () => {
      const mockWss = {
        on: jest.fn<unknown[], unknown>(),
        close: jest.fn((callback) => callback && callback())
      };
      
      (WebSocket.Server as jest.Mock).mockImplementation(() => mockWss as any);

      await server.start();
      
      expect(WebSocket.Server).toHaveBeenCalledWith({
        port: config.port,
        server: undefined,
        verifyClient: expect.any(Function)
      });
      
      expect(mockWss.on).toHaveBeenCalledWith('connection', expect.any(Function));
      expect(mockWss.on).toHaveBeenCalledWith('error', expect.any(Function));
    }, 10000); // 10 second timeout
  });

  describe('health metrics', () => {
    it('should return health metrics', () => {
      const metrics = server.getHealthMetrics();
      
      expect(metrics).toHaveProperty('totalConnections');
      expect(metrics).toHaveProperty('activeDocuments');
      expect(metrics).toHaveProperty('messagesPerSecond');
      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('lastUpdated');
      
      expect(typeof metrics.totalConnections).toBe('number');
      expect(typeof metrics.activeDocuments).toBe('number');
      expect(typeof metrics.uptime).toBe('number');
    });
  });

  describe('document sessions', () => {
    it('should return document session info', () => {
      const sessions = server.getDocumentSessions();
      
      expect(sessions).toHaveProperty('activeDocuments');
      expect(sessions).toHaveProperty('totalConnections');
      expect(typeof sessions.activeDocuments).toBe('number');
      expect(typeof sessions.totalConnections).toBe('number');
    });
  });

  describe('broadcasting', () => {
    it('should broadcast message to document', () => {
      const documentId = 'test-doc';
      const message = {
        type: 'ping' as const,
        payload: { data: 'test' }
      };

      // Should not throw when no connections exist
      expect(() => {
        server.broadcastToDocument(documentId, message);
      }).not.toThrow();
    });
  });

  describe('configuration validation', () => {
    it('should handle missing JWT secret when authentication enabled', () => {
      const authConfig = {
        ...config,
        enableAuthentication: true,
        jwtSecret: undefined
      };

      expect(() => {
        new WebSocketServer(authConfig);
      }).not.toThrow();
    });

    it('should handle CORS origins configuration', () => {
      const corsConfig = {
        ...config,
        corsOrigins: ['http://localhost:3000', 'https://example.com']
      };

      const corsServer = new WebSocketServer(corsConfig);
      expect(corsServer).toBeInstanceOf(WebSocketServer);
    });
  });

  describe('connection limits', () => {
    it('should respect max connections limit', () => {
      const limitedConfig = {
        ...config,
        maxConnections: 1
      };

      const limitedServer = new WebSocketServer(limitedConfig);
      expect(limitedServer).toBeInstanceOf(WebSocketServer);
    });
  });

  describe('error handling', () => {
    it('should handle server start errors gracefully', async () => {
      const errorConfig = {
        ...config,
        port: -1 // Invalid port
      };

      const errorServer = new WebSocketServer(errorConfig);
      
      (WebSocket.Server as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid port');
      });

      await expect(errorServer.start()).rejects.toThrow();
    });
  });

  describe('graceful shutdown', () => {
    it('should stop server gracefully', async () => {
      const mockWss = {
        on: jest.fn<unknown[], unknown>(),
        close: jest.fn((callback) => callback && callback())
      };
      
      (WebSocket.Server as jest.Mock).mockImplementation(() => mockWss as any);

      await server.start();
      await server.stop();
      
      expect(mockWss.close).toHaveBeenCalled();
    });

    it('should handle stop when server not started', async () => {
      await expect(server.stop()).resolves.not.toThrow();
    });
  });
});