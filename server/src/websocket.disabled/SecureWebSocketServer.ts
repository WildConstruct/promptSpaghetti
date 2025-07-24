/**
 * Secure WebSocket Server
 * 
 * Enhanced WebSocket server that integrates advanced security features
 * including encryption, authentication, threat detection, and data classification.
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { WebSocketServer } from './WebSocketServer';
import { 
  WebSocketSecurityManager, 
  WebSocketSecurityConfig,
  ConnectionSecurityContext,
  SecureWebSocketMessage 
} from '../../../../packages/core/security/WebSocketSecurityManager';
import { 
  KeyManagementService, 
  KeyManagementConfig 
} from '../../../../packages/core/security/KeyManagementService';
import { DataClassifier } from '../../../../packages/core/security/DataClassifier';
import { DeviceFingerprintingService } from '../../../../packages/core/security/DeviceFingerprintingService';
import { TrustedDeviceManager } from '../../../../packages/core/security/TrustedDeviceManager';
import { WSServerConfig, WSMessage } from './types';

// Enhanced server configuration
export interface SecureWSServerConfig extends WSServerConfig {
  security: WebSocketSecurityConfig;
  keyManagement: KeyManagementConfig;
}

// Enhanced connection info with security context
export interface SecureConnectionInfo {
  id: string;
  userId: string;
  documentId: string;
  ws: WebSocket;
  userAgent: string;
  ipAddress: string;
  connectedAt: Date;
  lastSeen: number;
  permissions: string[];
  
  // Security context
  securityContext: ConnectionSecurityContext;
  isSecure: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  trustLevel: 'none' | 'basic' | 'verified' | 'full';
}

/**
 * Secure WebSocket Server with Enhanced Security
 */
export class SecureWebSocketServer extends EventEmitter {
  private baseServer: WebSocketServer;
  private securityManager: WebSocketSecurityManager;
  private keyManagementService: KeyManagementService;
  private dataClassifier: DataClassifier;
  private fingerprintService: DeviceFingerprintingService;
  private trustedDeviceManager: TrustedDeviceManager;
  
  private secureConnections: Map<string, SecureConnectionInfo> = new Map();
  private securityMetrics = {
    totalConnections: 0,
    secureConnections: 0,
    encryptedMessages: 0,
    threatsDetected: 0,
    connectionsBlocked: 0,
    lastReset: Date.now()
  };

  constructor(private config: SecureWSServerConfig) {
    super();
    
    // Initialize security services
    this.keyManagementService = new KeyManagementService(config.keyManagement);
    this.dataClassifier = new DataClassifier();
    this.fingerprintService = new DeviceFingerprintingService();
    this.trustedDeviceManager = new TrustedDeviceManager(this.fingerprintService);
    
    // Initialize security manager
    this.securityManager = new WebSocketSecurityManager(
      config.security,
      this.keyManagementService,
      this.dataClassifier,
      this.fingerprintService,
      this.trustedDeviceManager
    );
    
    // Initialize base WebSocket server
    this.baseServer = new WebSocketServer(config);
    
    this.setupSecurityIntegration();
    this.setupEventHandlers();
  }

  /**
   * Start the secure WebSocket server
   */
  async start(server?: any): Promise<void> {
    try {
      // Start base server
      await this.baseServer.start(server);
      
      console.log('Secure WebSocket server started with enhanced security features');
      this.emit('started');
    } catch (error) {
      console.error('Failed to start secure WebSocket server:', error);
      throw error;
    }
  }

  /**
   * Stop the secure WebSocket server
   */
  async stop(): Promise<void> {
    try {
      // Clean up all secure connections
      for (const connectionId of this.secureConnections.keys()) {
        await this.cleanupSecureConnection(connectionId);
      }
      
      // Stop base server
      await this.baseServer.stop();
      
      // Cleanup security services
      this.securityManager.destroy();
      this.keyManagementService.destroy();
      
      console.log('Secure WebSocket server stopped');
      this.emit('stopped');
    } catch (error) {
      console.error('Error stopping secure WebSocket server:', error);
      throw error;
    }
  }

  /**
   * Get enhanced health metrics including security stats
   */
  getHealthMetrics() {
    const baseMetrics = this.baseServer.getHealthMetrics();
    const securityStats = this.securityManager.getSecurityStats();
    
    return {
      ...baseMetrics,
      security: {
        ...this.securityMetrics,
        ...securityStats,
        uptime: Date.now() - this.securityMetrics.lastReset
      }
    };
  }

  /**
   * Get secure connection info
   */
  getSecureConnectionInfo(connectionId: string): SecureConnectionInfo | null {
    return this.secureConnections.get(connectionId) || null;
  }

  /**
   * Get all secure connections for a user
   */
  getUserSecureConnections(userId: string): SecureConnectionInfo[] {
    return Array.from(this.secureConnections.values())
      .filter(conn => conn.userId === userId);
  }

  /**
   * Broadcast secure message to document with encryption
   */
  async broadcastSecureMessage(
    documentId: string,
    message: Omit<WSMessage, 'timestamp' | 'messageId'>,
    excludeConnectionId?: string
  ): Promise<void> {
    const connections = Array.from(this.secureConnections.values())
      .filter(conn => 
        conn.documentId === documentId && 
        conn.id !== excludeConnectionId &&
        conn.securityContext.isAuthenticated
      );

    for (const connection of connections) {
      try {
        // Encrypt message for each connection
        const secureMessage = await this.securityManager.encryptMessage(
          connection.id,
          message
        );
        
        // Send encrypted message
        if (connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.send(JSON.stringify(secureMessage));
          this.securityMetrics.encryptedMessages++;
        }
      } catch (error) {
        console.error(`Failed to send secure message to connection ${connection.id}:`, error);
        
        this.emit('secureMessageError', {
          connectionId: connection.id,
          userId: connection.userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Force disconnect for security violation
   */
  async forceDisconnectForSecurity(
    connectionId: string,
    reason: string
  ): Promise<void> {
    const connection = this.secureConnections.get(connectionId);
    if (connection) {
      // Block connection in security manager
      await this.securityManager.blockConnection(connectionId, reason);
      
      // Close WebSocket connection
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.close(1008, `Security violation: ${reason}`);
      }
      
      // Clean up
      await this.cleanupSecureConnection(connectionId);
      
      this.securityMetrics.connectionsBlocked++;
      
      this.emit('securityDisconnect', {
        connectionId,
        userId: connection.userId,
        reason,
        timestamp: new Date()
      });
    }
  }

  // Private methods

  private setupSecurityIntegration(): void {
    // Intercept base server connection handling
    this.baseServer.on('connection', async (connectionId: string, ws: WebSocket, request: any) => {
      await this.handleSecureConnection(connectionId, ws, request);
    });

    // Intercept message handling
    this.baseServer.on('message', async (connectionId: string, message: any) => {
      await this.handleSecureMessage(connectionId, message);
    });

    // Intercept disconnection
    this.baseServer.on('disconnect', async (connectionId: string) => {
      await this.cleanupSecureConnection(connectionId);
    });
  }

  private setupEventHandlers(): void {
    // Security manager events
    this.securityManager.on('connectionBlocked', (event) => {
      this.securityMetrics.connectionsBlocked++;
      this.emit('securityThreatDetected', event);
    });

    this.securityManager.on('criticalSecurityEvent', (event) => {
      this.securityMetrics.threatsDetected++;
      this.emit('criticalSecurityAlert', event);
    });

    this.securityManager.on('securityEvent', (event) => {
      this.emit('securityEvent', event);
    });

    // Base server events
    this.baseServer.on('error', (error) => {
      this.emit('error', error);
    });

    this.baseServer.on('started', () => {
      console.log('Base WebSocket server started, security layer active');
    });
  }

  private async handleSecureConnection(
    connectionId: string,
    ws: WebSocket,
    request: any
  ): Promise<void> {
    try {
      this.securityMetrics.totalConnections++;
      
      // Extract connection information
      const ipAddress = this.extractIPAddress(request);
      const userAgent = request.headers['user-agent'] || 'Unknown';
      const origin = request.headers.origin || '';
      
      // Check if connection should be blocked
      if (this.securityManager.isConnectionBlocked(connectionId, ipAddress)) {
        ws.close(1008, 'Connection blocked for security reasons');
        return;
      }
      
      // Initialize security context (placeholder user ID for now)
      const userId = this.extractUserIdFromRequest(request) || 'anonymous';
      
      const securityContext = await this.securityManager.initializeConnection(
        connectionId,
        userId,
        {
          ipAddress,
          userAgent,
          origin,
          headers: request.headers
        }
      );
      
      // Create secure connection info
      const secureConnection: SecureConnectionInfo = {
        id: connectionId,
        userId,
        documentId: '', // Will be set during authentication
        ws,
        userAgent,
        ipAddress,
        connectedAt: new Date(),
        lastSeen: Date.now(),
        permissions: [],
        securityContext,
        isSecure: securityContext.deviceVerified || securityContext.mfaVerified,
        threatLevel: securityContext.threatLevel,
        trustLevel: securityContext.trustLevel
      };
      
      this.secureConnections.set(connectionId, secureConnection);
      
      if (secureConnection.isSecure) {
        this.securityMetrics.secureConnections++;
      }
      
      // Send enhanced connection confirmation with security requirements
      const connectionMessage = {
        type: 'secure_connect',
        payload: {
          connectionId,
          requiresAuthentication: this.config.enableAuthentication,
          securityLevel: securityContext.threatLevel,
          encryptionEnabled: this.config.security.enableMessageEncryption,
          mfaRequired: this.config.security.enableMFAForHighRisk && 
                       (securityContext.threatLevel === 'high' || securityContext.threatLevel === 'critical')
        }
      };
      
      ws.send(JSON.stringify(connectionMessage));
      
      console.log(`Secure connection established: ${connectionId} (threat level: ${securityContext.threatLevel})`);
      
    } catch (error) {
      console.error(`Failed to establish secure connection ${connectionId}:`, error);
      ws.close(1011, 'Security initialization failed');
    }
  }

  private async handleSecureMessage(
    connectionId: string,
    rawMessage: any
  ): Promise<void> {
    const connection = this.secureConnections.get(connectionId);
    if (!connection) {
      console.warn(`Secure connection not found: ${connectionId}`);
      return;
    }

    try {
      // Check if connection is blocked
      if (this.securityManager.isConnectionBlocked(connectionId, connection.ipAddress)) {
        await this.forceDisconnectForSecurity(connectionId, 'Connection blocked during message processing');
        return;
      }

      // Parse and decrypt message if it's a secure message
      let message: any;
      
      if (this.isSecureMessage(rawMessage)) {
        // Decrypt secure message
        message = await this.securityManager.decryptMessage(connectionId, rawMessage as SecureWebSocketMessage);
        
        if (message.metadata?.encrypted) {
          this.securityMetrics.encryptedMessages++;
        }
      } else {
        // Handle legacy/unencrypted message
        message = rawMessage;
        
        // Log if encryption is required but not used
        if (this.config.security.requireE2EEncryption) {
          await this.securityManager.blockConnection(
            connectionId,
            'Unencrypted message received when encryption is required'
          );
          return;
        }
      }

      // Update connection activity
      connection.lastSeen = Date.now();
      connection.securityContext.lastActivity = new Date();

      // Forward processed message to base server for normal handling
      this.baseServer.emit('secureMessage', connectionId, message);
      
    } catch (error) {
      console.error(`Error processing secure message from ${connectionId}:`, error);
      
      // Increment suspicious activity if message processing fails
      connection.securityContext.suspiciousActivityCount++;
      
      if (connection.securityContext.suspiciousActivityCount > 5) {
        await this.forceDisconnectForSecurity(
          connectionId,
          'Multiple message processing failures'
        );
      }
    }
  }

  private async cleanupSecureConnection(connectionId: string): Promise<void> {
    const connection = this.secureConnections.get(connectionId);
    if (connection) {
      // Clean up security context
      await this.securityManager.cleanupConnection(connectionId);
      
      // Remove from tracking
      this.secureConnections.delete(connectionId);
      
      // Update metrics
      if (connection.isSecure) {
        this.securityMetrics.secureConnections--;
      }
      
      console.log(`Secure connection cleaned up: ${connectionId}`);
    }
  }

  private extractIPAddress(request: any): string {
    return request.headers['x-forwarded-for']?.split(',')[0] ||
           request.headers['x-real-ip'] ||
           request.connection?.remoteAddress ||
           request.socket?.remoteAddress ||
           '127.0.0.1';
  }

  private extractUserIdFromRequest(request: any): string | null {
    // Extract user ID from query parameters, headers, or token
    // This is a placeholder implementation
    const url = new URL(request.url || '', 'http://localhost');
    return url.searchParams.get('userId') || 
           request.headers['x-user-id'] ||
           null;
  }

  private isSecureMessage(message: any): boolean {
    return message && 
           typeof message === 'object' &&
           'encrypted' in message &&
           'classification' in message &&
           'originConnectionId' in message;
  }

  /**
   * Get security configuration
   */
  public getSecurityConfig(): WebSocketSecurityConfig {
    return { ...this.config.security };
  }

  /**
   * Update security configuration
   */
  public updateSecurityConfig(updates: Partial<WebSocketSecurityConfig>): void {
    Object.assign(this.config.security, updates);
    console.log('Security configuration updated:', updates);
  }

  /**
   * Get real-time security metrics
   */
  public getSecurityMetrics() {
    return {
      ...this.securityMetrics,
      securityManager: this.securityManager.getSecurityStats(),
      keyManagement: this.keyManagementService.getPerformanceMetrics(),
      lastUpdated: new Date()
    };
  }

  /**
   * Reset security metrics
   */
  public resetSecurityMetrics(): void {
    this.securityMetrics = {
      totalConnections: 0,
      secureConnections: 0,
      encryptedMessages: 0,
      threatsDetected: 0,
      connectionsBlocked: 0,
      lastReset: Date.now()
    };
  }

  /**
   * Export secure connection data for analysis
   */
  public exportSecurityData() {
    const connections = Array.from(this.secureConnections.values()).map(conn => ({
      id: conn.id,
      userId: conn.userId,
      ipAddress: conn.ipAddress,
      connectedAt: conn.connectedAt,
      threatLevel: conn.threatLevel,
      trustLevel: conn.trustLevel,
      isSecure: conn.isSecure,
      messageCount: conn.securityContext.messageCount,
      riskScore: conn.securityContext.riskScore,
      flags: conn.securityContext.flags
    }));
    
    return {
      connections,
      metrics: this.getSecurityMetrics(),
      timestamp: new Date()
    };
  }
}

export default SecureWebSocketServer;