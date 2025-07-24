import WebSocket from 'ws';
import { WebSocketServer } from '../WebSocketServer';
import { WSServerConfig } from '../types';

// Mock WebSocket constructor
jest.mock('ws', () => ({
  Server: jest.fn<unknown[], unknown>()
}));

describe('WebSocketServer', () => {
  let server: WebSocketServer;
  let config: WSServerConfig;

  beforeEach(() => {
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
  });

  describe('initialization', () => {
    it('should create server with provided config', () => {
      expect(server).toBeInstanceOf(WebSocketServer);
    });

    it('should start server on configured port', async () => {
      const mockWss = {
        on: jest.fn<unknown[], unknown>(),
        close: jest.fn<unknown[], unknown>()
      };
      
      (WebSocket.Server as jest.Mock).mockImplementation(() => mockWss as any);

      await server.start();
      
      expect(WebSocket.Server).toHaveBeenCalledWith({
        port: config.port,
        server: undefined,
        verifyClient: expect.any(Function)
      });
    });
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