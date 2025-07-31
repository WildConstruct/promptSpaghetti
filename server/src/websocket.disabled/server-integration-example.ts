/**
 * Server Integration Example
 * Shows how to integrate the Enhanced Collaboration Service with the existing server
 */

import { WebSocketServer } from './WebSocketServer';
import { CollaborationServiceIntegration } from './CollaborationServiceIntegration';
import { WSServerConfig } from './types';

export class EnhancedWebSocketServer {
  private wsServer: WebSocketServer;
  private collaborationIntegration: CollaborationServiceIntegration;

  constructor(config: WSServerConfig) {
    // Initialize the existing WebSocket server
    this.wsServer = new WebSocketServer(config);

    // Add collaboration service integration
    this.collaborationIntegration = new CollaborationServiceIntegration(this.wsServer);

    this.setupHealthEndpoints();
  }

  /**
   * Start the enhanced WebSocket server
   */
  async start(server?: any): Promise<void> {
    await this.wsServer.start(server);
    console.log('Enhanced WebSocket server started with collaboration features');
  }

  /**
   * Stop the enhanced WebSocket server
   */
  async stop(): Promise<void> {
    this.collaborationIntegration.cleanup();
    await this.wsServer.stop();
    console.log('Enhanced WebSocket server stopped');
  }

  /**
   * Get enhanced health metrics including collaboration stats
   */
  getEnhancedHealthMetrics(): any {
    const baseMetrics = this.wsServer.getHealthMetrics();
    const collaborationStats = this.collaborationIntegration.getCollaborationStats();

    return {
      ...baseMetrics,
      collaboration: collaborationStats,
      features: {
        realTimeCollaboration: true,
        documentLocking: true,
        conflictResolution: true,
        presenceIndicators: true,
        versionSnapshots: true,
        sessionAnalytics: true,
        advancedConflictResolution: true,
      },
    };
  }

  /**
   * Get the collaboration service for external use
   */
  getCollaborationService() {
    return this.collaborationIntegration.getCollaborationService();
  }

  /**
   * Get the base WebSocket server for backward compatibility
   */
  getWebSocketServer(): WebSocketServer {
    return this.wsServer;
  }

  /**
   * Set up health check endpoints for monitoring
   */
  private setupHealthEndpoints(): void {
    // This would integrate with your existing health check system
    // Example: Express.js routes, Fastify routes, etc.
    /*
    // Example Express.js integration:
    app.get('/api/websocket/health', (req, res) => {
      res.json(this.getEnhancedHealthMetrics());
    });

    app.get('/api/websocket/collaboration/sessions', (req, res) => {
      const collaborationService = this.getCollaborationService();
      const stats = this.collaborationIntegration.getCollaborationStats();
      res.json(stats);
    });

    app.get('/api/websocket/collaboration/sessions/:documentId', (req, res) => {
      const { documentId } = req.params;
      const collaborationService = this.getCollaborationService();
      const sessions = collaborationService.getDocumentSessions(documentId);
      res.json(sessions);
    });
    */
  }
}

/**
 * Factory function to create an enhanced WebSocket server
 */
export function createEnhancedWebSocketServer(config: WSServerConfig): EnhancedWebSocketServer {
  return new EnhancedWebSocketServer(config);
}

/**
 * Default configuration for enhanced collaboration features
 */
export const DEFAULT_ENHANCED_CONFIG: WSServerConfig = {
  port: 8080,
  heartbeatInterval: 30000,
  connectionTimeout: 60000,
  maxConnections: 1000,
  enableAuthentication: true,
  corsOrigins: ['http://localhost:3000', 'https://yourdomain.com'],
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
};

/**
 * Example usage:
 *
 * const server = createEnhancedWebSocketServer(DEFAULT_ENHANCED_CONFIG);
 * await server.start();
 *
 * // Get collaboration service for external API endpoints
 * const collaborationService = server.getCollaborationService();
 *
 * // Create a collaboration session from API
 * const session = collaborationService.createSession(
 *   'document-123',
 *   'user-456',
 *   'My Document Session',
 *   {
 *     enableRealTimeSync: true,
 *     enableConflictResolution: true,
 *     maxParticipants: 10
 *   }
 * );
 *
 * console.log('Created session:', session.sessionId);
 */
