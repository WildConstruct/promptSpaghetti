/**
 * Enhanced WebSocket Security Manager
 * 
 * Provides advanced security features for WebSocket communications including:
 * - End-to-end message encryption
 * - Data classification integration
 * - MFA authentication
 * - Device fingerprinting
 * - Threat detection and prevention
 * - Security audit logging
 */
import { EventEmitter } from 'events';
import { createCipheriv, createDecipheriv, randomBytes, createHmac } from 'crypto';
import { 
  KeyManagementService, 
  KeyType, 
  KeyPurpose, 
  KeyAlgorithm, 
  StorageTier 
} from './KeyManagementService';
import { DataClassifier, ClassificationLevel } from './DataClassifier';
import { DeviceFingerprintingService, FingerprintContext } from './DeviceFingerprintingService';
import { TrustedDeviceManager } from './TrustedDeviceManager';

// Security configuration
export interface WebSocketSecurityConfig {
  // Encryption settings
  enableMessageEncryption: boolean;
  encryptionKeyRotationMinutes: number;
  requireE2EEncryption: boolean;
  // Authentication settings
  requireDeviceVerification: boolean;
  enableMFAForHighRisk: boolean;
  sessionTimeoutMinutes: number;
  maxConcurrentSessions: number;
  // Threat detection
  enableAnomalyDetection: boolean;
  rateLimitMessagesPerMinute: number;
  suspiciousBehaviorThreshold: number;
  blockSuspiciousIPs: boolean;
  // Data classification
  enableDataClassification: boolean;
  enforceClassificationPolicies: boolean;
  logClassifiedData: boolean;
  // Audit and compliance
  enableSecurityAuditLog: boolean;
  auditLogRetentionDays: number;
  complianceMode: boolean;
  // Certificate pinning
  enableCertificatePinning: boolean;
  pinnedCertificates: string[];
  // Additional security
  enableCSRFProtection: boolean;
  allowedOrigins: string[];
  requireSecureTransport: boolean;
}

// Security context for connections
export interface ConnectionSecurityContext {
  connectionId: string;
  userId: string;
  sessionId: string;
  // Authentication state
  isAuthenticated: boolean;
  mfaVerified: boolean;
  deviceVerified: boolean;
  trustLevel: 'none' | 'basic' | 'verified' | 'full';
  // Encryption state
  encryptionKeyId?: string;
  encryptionSessionKey?: Buffer;
  lastKeyRotation: Date;
  // Risk assessment
  riskScore: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  suspiciousActivityCount: number;
  // Device information
  deviceFingerprint?: string;
  deviceTrusted: boolean;
  locationData?: any;
  // Session tracking
  connectedAt: Date;
  lastActivity: Date;
  messageCount: number;
  bytesSent: number;
  bytesReceived: number;
  // Security flags
  flags: {,
    vpnDetected: boolean;
    proxyDetected: boolean;
    botDetected: boolean;
    repeatedLoginAttempts: boolean;
    anomalousPatterns: boolean;
  };
}

// Enhanced message with security metadata
export interface SecureWebSocketMessage {
  id: string;
  type: string;
  payload: any;
  // Security metadata
  encrypted: boolean;
  signed: boolean;
  classification: ClassificationLevel;
  timestamp: number;
  // Encryption data
  encryptionKeyId?: string;
  iv?: Buffer;
  signature?: string;
  // Audit trail
  originConnectionId: string;
  originUserId: string;
  processingPath: string[];
}

// Security events
export interface SecurityEvent {
  id: string;
  type: 'authentication' | 'encryption' | 'threat_detected' | 'policy_violation' | 'anomaly';
  severity: 'info' | 'warning' | 'error' | 'critical';
  connectionId: string;
  userId?: string;
  timestamp: Date;
  description: string;
  metadata: Record<string, any>;
}

// Threat detection rules
export interface ThreatDetectionRule {
  id: string;
  name: string;
  type: 'rate_limit' | 'pattern_match' | 'anomaly' | 'behavioral';
  enabled: boolean;
  threshold: number;
  timeWindowMinutes: number;
  action: 'log' | 'warn' | 'block' | 'disconnect';
  description: string;
}
/**
 * WebSocket Security Manager
 */
export class WebSocketSecurityManager extends EventEmitter {
  private connectionContexts: Map<string, ConnectionSecurityContext> = new Map();
  private encryptionKeys: Map<string, Buffer> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private threatRules: Map<string, ThreatDetectionRule> = new Map();
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map();
  private suspiciousIPs: Set<string> = new Set();
  private blockedConnections: Set<string> = new Set();
  constructor()
    private config: WebSocketSecurityConfig,
    private keyManagementService: KeyManagementService,
    private dataClassifier: DataClassifier,
    private fingerprintService: DeviceFingerprintingService,
    private trustedDeviceManager: TrustedDeviceManager
  ) {
    super();
    this.initializeThreatDetectionRules();
    this.startSecurityMonitoring();
  }
  /**
   * Initialize connection security context
   */
  public async initializeConnection()
    connectionId: string,
    userId: string,
    requestInfo: {,
      ipAddress: string;
      userAgent: string;
      origin: string;
      headers: Record<string, string>;
    }
  ): Promise<ConnectionSecurityContext> {
    try {
      // Create fingerprint context
      const fingerprintContext: FingerprintContext = {
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        headers: requestInfo.headers,
      };
      // Generate device fingerprint
      const deviceFingerprint = await this.fingerprintService.generateFingerprint(;)
        fingerprintContext
      );
      // Assess initial risk
      const riskAssessment = this.fingerprintService.assessRisk(deviceFingerprint, {)
        id: 'default-location',
        timestamp: new Date(),
        source: 'ip' as const,
        accuracy: 1000,
        confidence: 50,
        coordinates: {,
          latitude: 0,
          longitude: 0,
        },
        address: {,
          country: 'Unknown',
          countryCode: 'XX',
          region: 'Unknown',
          regionCode: 'XX',
          city: 'Unknown',
        },
        network: {,
          ipAddress: requestInfo.ipAddress,
          isp: 'Unknown',
          timezone: 'UTC',
          vpnDetected: false,
          proxyDetected: false,
          torDetected: false,
          hostingProvider: false,
          datacenter: false,
        },
        metadata: {,
          language: 'en',
          currency: 'USD',
          callingCode: '+1',
        }
      });
      // Check if device is trusted
      const trustDecision = await this.trustedDeviceManager.checkDeviceTrust(;)
        userId,
        fingerprintContext
      );
      const deviceTrusted = trustDecision.trusted;
      // Create security context
      const context: ConnectionSecurityContext = {
        connectionId,
        userId,
        sessionId: this.generateSessionId(),
        isAuthenticated: false,
        mfaVerified: false,
        deviceVerified: deviceTrusted,
        trustLevel: 'none',
        lastKeyRotation: new Date(),
        riskScore: riskAssessment.riskScore,
        threatLevel: this.mapRiskLevelToThreatLevel(riskAssessment.overallRisk),
        suspiciousActivityCount: 0,
        deviceFingerprint: deviceFingerprint.id,
        deviceTrusted,
        connectedAt: new Date(),
        lastActivity: new Date(),
        messageCount: 0,
        bytesSent: 0,
        bytesReceived: 0,
        flags: {,
          vpnDetected: riskAssessment.factors.some(f => f.factor.includes('vpn')),
          proxyDetected: riskAssessment.factors.some(f => f.factor.includes('proxy')),
          botDetected: false,
          repeatedLoginAttempts: false,
          anomalousPatterns: false,
        }
      };
      // Generate session encryption key if encryption is enabled
      if (this.config.enableMessageEncryption) {
        await this.generateSessionEncryptionKey(context);
      }
      this.connectionContexts.set(connectionId, context);
      // Log security event
      await this.logSecurityEvent({)
        type: 'authentication',
        severity: 'info',
        connectionId,
        userId,
        description: 'Connection security context initialized',
        metadata: {,
          riskScore: context.riskScore,
          threatLevel: context.threatLevel,
          deviceTrusted: context.deviceTrusted,
          flags: context.flags,
        }
      });
      return context;
    } catch (error) {
      await this.logSecurityEvent({)
        type: 'authentication',
        severity: 'error',
        connectionId,
        userId,
        description: 'Failed to initialize connection security context',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }
  /**
   * Authenticate connection with enhanced security
   */
  public async authenticateConnection()
    connectionId: string,
    credentials: {,
      token: string;
      mfaCode?: string;
      deviceVerificationToken?: string;
    }
  ): Promise<boolean> {
    const context = this.connectionContexts.get(connectionId);
    if (!context) {
      throw new Error('Connection context not found');
    }
    try {
      // Basic token validation (implement your own logic)
      const tokenValid = await this.validateToken(credentials.token, context.userId);
      if (!tokenValid) {
        await this.logSecurityEvent({)
          type: 'authentication',
          severity: 'warning',
          connectionId,
          userId: context.userId,
          description: 'Invalid authentication token',
          metadata: { attemptCount: context.suspiciousActivityCount + 1 }
        });
        context.suspiciousActivityCount++;
        return false;
      }
      // MFA verification for high-risk connections
      if (this.config.enableMFAForHighRisk && )
          (context.threatLevel === 'high' || context.threatLevel === 'critical')) {
        if (!credentials.mfaCode || !await this.validateMFACode(context.userId, credentials.mfaCode)) {
          await this.logSecurityEvent({)
            type: 'authentication',
            severity: 'warning',
            connectionId,
            userId: context.userId,
            description: 'MFA verification failed for high-risk connection',
            metadata: { threatLevel: context.threatLevel }
          });
          return false;
        }
        context.mfaVerified = true;
      }
      // Device verification
      if (this.config.requireDeviceVerification && credentials.deviceVerificationToken) {
        const verifiedDevice = await this.trustedDeviceManager.verifyDevice(;)
          credentials.deviceVerificationToken
        );
        context.deviceVerified = !!verifiedDevice;
      }
      // Update authentication state
      context.isAuthenticated = true;
      context.trustLevel = this.calculateTrustLevel(context);
      context.lastActivity = new Date();
      await this.logSecurityEvent({)
        type: 'authentication',
        severity: 'info',
        connectionId,
        userId: context.userId,
        description: 'Connection authenticated successfully',
        metadata: {,
          trustLevel: context.trustLevel,
          mfaVerified: context.mfaVerified,
          deviceVerified: context.deviceVerified,
        }
      });
      return true;
    } catch (error) {
      await this.logSecurityEvent({)
        type: 'authentication',
        severity: 'error',
        connectionId,
        userId: context.userId,
        description: 'Authentication error',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return false;
    }
  }
  /**
   * Encrypt outgoing message
   */
  public async encryptMessage()
    connectionId: string,
    message: any,
  ): Promise<SecureWebSocketMessage> {
    const context = this.connectionContexts.get(connectionId);
    if (!context) {
      throw new Error('Connection context not found');
    }
    try {
      // Classify message data
      const classification = this.config.enableDataClassification;
        ? this.dataClassifier.classify({)
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,}
          fieldName: 'payload',
          value: JSON.stringify(message),
          dataType: 'json',
          context: { messageType: message.type },
          source: 'websocket',
          timestamp: new Date()
        })
        : { level: ClassificationLevel.PUBLIC, category: 'operational', confidence: 100, matchedRules: [], complianceRequirements: [], encryptionRequired: false, retentionPeriod: '1 year', accessControls: [], reasoning: [] };
      // Check if encryption is required based on classification
      const shouldEncrypt = this.config.enableMessageEncryption ||;
                           classification.level === ClassificationLevel.CONFIDENTIAL ||
                           classification.level === ClassificationLevel.RESTRICTED;
      const secureMessage: SecureWebSocketMessage = {
        id: this.generateMessageId(),
        type: message.type,
        payload: message.payload,
        encrypted: shouldEncrypt,
        signed: true,
        classification: classification.level,
        timestamp: Date.now(),
        originConnectionId: connectionId,
        originUserId: context.userId,
        processingPath: ['websocket_security_manager'],
      };
      if (shouldEncrypt && context.encryptionSessionKey) {
        // Encrypt payload
        const iv = randomBytes(16);
        // Ensure key is 32 bytes for AES-256
        let key = context.encryptionSessionKey;
        if (key.length < 32) {
          // Pad key to 32 bytes if too short
          key = Buffer.concat([key, Buffer.alloc(32 - key.length)]);
        } else if (key.length > 32) {
          key = key.slice(0, 32);
        }
        const cipher = createCipheriv('aes-256-gcm', key, iv);
        let encrypted = cipher.update(JSON.stringify(message.payload), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        // Store encrypted data with auth tag
        secureMessage.payload = encrypted + ':' + authTag.toString('hex');
        secureMessage.iv = iv;
        secureMessage.encryptionKeyId = context.encryptionKeyId;
      }
      // Sign message
      if (context.encryptionSessionKey) {
        const signature = createHmac('sha256', context.encryptionSessionKey);
          .update(JSON.stringify(secureMessage.payload))
          .digest('hex');
        secureMessage.signature = signature;
      }
      // Update context
      context.messageCount++;
      context.bytesSent += JSON.stringify(secureMessage).length;
      context.lastActivity = new Date();
      // Log if required by classification
      if (this.config.logClassifiedData && classification.level !== ClassificationLevel.PUBLIC) {
        await this.logSecurityEvent({)
          type: 'encryption',
          severity: 'info',
          connectionId,
          userId: context.userId,
          description: 'Classified message encrypted',
          metadata: {,
            classification: classification.level,
            messageType: message.type,
            encrypted: shouldEncrypt,
          }
        });
      }
      return secureMessage;
    } catch (error) {
      await this.logSecurityEvent({)
        type: 'encryption',
        severity: 'error',
        connectionId,
        userId: context.userId,
        description: 'Message encryption failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }
  /**
   * Decrypt incoming message
   */
  public async decryptMessage()
    connectionId: string,
    secureMessage: SecureWebSocketMessage,
  ): Promise<any> {
    const context = this.connectionContexts.get(connectionId);
    if (!context) {
      throw new Error('Connection context not found');
    }
    try {
      // Verify message signature
      if (secureMessage.signed && context.encryptionSessionKey) {
        const expectedSignature = createHmac('sha256', context.encryptionSessionKey);
          .update(JSON.stringify(secureMessage.payload))
          .digest('hex');
        if (secureMessage.signature !== expectedSignature) {
          throw new Error('Message signature verification failed');
        }
      }
      let payload = secureMessage.payload;
      // Decrypt if needed
      if (secureMessage.encrypted && context.encryptionSessionKey && secureMessage.iv) {
        // Ensure key is 32 bytes for AES-256
        let key = context.encryptionSessionKey;
        if (key.length < 32) {
          // Pad key to 32 bytes if too short
          key = Buffer.concat([key, Buffer.alloc(32 - key.length)]);
        } else if (key.length > 32) {
          key = key.slice(0, 32);
        }
        // Split encrypted data and auth tag
        const [encryptedData, authTagHex] = (secureMessage.payload as string).split(':');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = createDecipheriv('aes-256-gcm', key, secureMessage.iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        payload = JSON.parse(decrypted);
      }
      // Update context
      context.messageCount++;
      context.bytesReceived += JSON.stringify(secureMessage).length;
      context.lastActivity = new Date();
      // Check for threats
      await this.checkForThreats(connectionId, secureMessage);
      return {
        type: secureMessage.type,
        payload,
        metadata: {,
          classification: secureMessage.classification,
          encrypted: secureMessage.encrypted,
          timestamp: secureMessage.timestamp,
        }
      };
    } catch (error) {
      await this.logSecurityEvent({)
        type: 'encryption',
        severity: 'error',
        connectionId,
        userId: context.userId,
        description: 'Message decryption failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }
  /**
   * Check if connection should be blocked
   */
  public isConnectionBlocked(connectionId: string, ipAddress: string): boolean {
    return this.blockedConnections.has(connectionId) || 
           this.suspiciousIPs.has(ipAddress);
  }
  /**
   * Block connection due to security violation
   */
  public async blockConnection()
    connectionId: string,
    reason: string,
    duration?: number
  ): Promise<void> {
    const context = this.connectionContexts.get(connectionId);
    this.blockedConnections.add(connectionId);
    if (duration) {
      setTimeout(() => {
        this.blockedConnections.delete(connectionId);
      }, duration);
    }
    await this.logSecurityEvent({)
      type: 'threat_detected',
      severity: 'critical',
      connectionId,
      userId: context?.userId,
      description: `Connection blocked: ${reason}`,}
      metadata: { duration, reason }
    });
    this.emit('connectionBlocked', {)
      connectionId,
      userId: context?.userId,
      reason,
      duration,
      timestamp: new Date()
    });
  }
  /**
   * Get connection security context
   */
  public getConnectionContext(connectionId: string): ConnectionSecurityContext | null {
    return this.connectionContexts.get(connectionId) || null;
  }
  /**
   * Clean up connection resources
   */
  public async cleanupConnection(connectionId: string): Promise<void> {
    const context = this.connectionContexts.get(connectionId);
    if (context) {
      // Revoke session encryption key
      if (context.encryptionKeyId) {
        try {
          await this.keyManagementService.revokeKey()
            context.encryptionKeyId,
            'system',
            'Session ended'
          );
        } catch (error) {
          // Log but don't throw
          console.warn('Failed to revoke session key:', error);
        }
      }
      // Remove from memory
      this.connectionContexts.delete(connectionId);
      this.encryptionKeys.delete(connectionId);
      this.rateLimiters.delete(connectionId);
      await this.logSecurityEvent({)
        type: 'authentication',
        severity: 'info',
        connectionId,
        userId: context.userId,
        description: 'Connection security context cleaned up',
        metadata: {,
          sessionDuration: Date.now() - context.connectedAt.getTime(),
          messageCount: context.messageCount,
        }
      });
    }
  }
  /**
   * Get security statistics
   */
  public getSecurityStats() {
    const contexts = Array.from(this.connectionContexts.values());
    return {
      totalConnections: contexts.length,
      authenticatedConnections: contexts.filter(c => c.isAuthenticated).length,
      highRiskConnections: contexts.filter(c => c.threatLevel === 'high' || c.threatLevel === 'critical').length,
      encryptedConnections: contexts.filter(c => c.encryptionKeyId).length,
      trustedDevices: contexts.filter(c => c.deviceTrusted).length,
      blockedConnections: this.blockedConnections.size,
      suspiciousIPs: this.suspiciousIPs.size,
      securityEvents: this.securityEvents.length,
      avgRiskScore: contexts.length > 0 
        ? contexts.reduce((sum, c) => sum + c.riskScore, 0) / contexts.length 
        : 0
    };
  }
  // Private helper methods
  private async generateSessionEncryptionKey(context: ConnectionSecurityContext): Promise<void> {
    try {
      const key = await this.keyManagementService.generateKey({)
        type: KeyType.SYMMETRIC,
        purpose: KeyPurpose.SESSION_ENCRYPTION,
        algorithm: KeyAlgorithm.AES_256_GCM,
        name: `websocket_session_${context.sessionId}`,}
        tier: StorageTier.HOT,
        expirationDays: 1,
        metadata: {,
          sessionId: context.sessionId,
          connectionId: context.connectionId,
          userId: context.userId,
        }
      });
      context.encryptionKeyId = key.metadata.id;
      context.encryptionSessionKey = key.keyData;
      this.encryptionKeys.set(context.connectionId, key.keyData!);
    } catch (error) {
      console.error('Failed to generate session encryption key:', error);
    }
  }
  private generateSessionId(): string {
    return `ws_session_${Date.now()}_${randomBytes(8).toString('hex')}`;}
  }
  private generateMessageId(): string {
    return `msg_${Date.now()}_${randomBytes(4).toString('hex')}`;}
  }
  private mapRiskLevelToThreatLevel(riskLevel: any): 'low' | 'medium' | 'high' | 'critical' {
    // Map from risk levels to threat levels - handle both enum values and strings
    const normalizedRisk = typeof riskLevel === 'string' ? riskLevel.toLowerCase() : riskLevel;
    switch (normalizedRisk) {
    case 'low': return 'low';
    case 'medium': return 'medium';
    case 'high': return 'high';
    case 'critical': return 'critical';
    default: return 'medium';
    }
  }
  private calculateTrustLevel(context: ConnectionSecurityContext): 'none' | 'basic' | 'verified' | 'full' {
    if (!context.isAuthenticated) return 'none';
    if (context.mfaVerified && context.deviceVerified && context.threatLevel === 'low') return 'full';
    if (context.deviceVerified || context.mfaVerified) return 'verified';
    return 'basic';
  }
  private async validateToken(token: string, userId: string): Promise<boolean> {
    // Implement your token validation logic
    // This is a placeholder
    return token.length > 10 && userId.length > 0;
  }
  private async validateMFACode(userId: string, code: string): Promise<boolean> {
    // Implement your MFA validation logic
    // This is a placeholder
    return code.length === 6 && /^\d+$/.test(code);
  }
  private async checkForThreats()
    connectionId: string,
    message: SecureWebSocketMessage,
  ): Promise<void> {
    const context = this.connectionContexts.get(connectionId);
    if (!context) return;
    // Rate limiting check
    const rateLimitKey = `${connectionId}_rate_limit`;}
    const now = Date.now();
    const rateLimit = this.rateLimiters.get(rateLimitKey);
    if (rateLimit) {
      if (now < rateLimit.resetTime) {
        rateLimit.count++;
        if (rateLimit.count > this.config.rateLimitMessagesPerMinute) {
          await this.logSecurityEvent({)
            type: 'threat_detected',
            severity: 'warning',
            connectionId,
            userId: context.userId,
            description: 'Rate limit exceeded',
            metadata: { messageCount: rateLimit.count, timeWindow: 'per_minute' }
          });
          if (rateLimit.count > this.config.rateLimitMessagesPerMinute * 2) {
            await this.blockConnection(connectionId, 'Severe rate limit violation', 300000); // 5 minutes
          }
        }
      } else {
        // Reset rate limit window
        this.rateLimiters.set(rateLimitKey, { count: 1, resetTime: now + 60000 });
      }
    } else {
      this.rateLimiters.set(rateLimitKey, { count: 1, resetTime: now + 60000 });
    }
    // Check for suspicious patterns
    if (this.config.enableAnomalyDetection) {
      await this.detectAnomalies(connectionId, message);
    }
  }
  private async detectAnomalies()
    connectionId: string,
    message: SecureWebSocketMessage,
  ): Promise<void> {
    const context = this.connectionContexts.get(connectionId);
    if (!context) return;
    // Simple anomaly detection patterns
    const messageSize = JSON.stringify(message).length;
    const avgMessageSize = context.bytesSent / Math.max(context.messageCount, 1);
    // Detect unusually large messages
    if (messageSize > avgMessageSize * 10 && messageSize > 10000) {
      context.flags.anomalousPatterns = true;
      await this.logSecurityEvent({)
        type: 'anomaly',
        severity: 'warning',
        connectionId,
        userId: context.userId,
        description: 'Unusually large message detected',
        metadata: { messageSize, averageSize: avgMessageSize }
      });
    }
    // Detect rapid succession of messages
    const timeSinceLastMessage = Date.now() - context.lastActivity.getTime();
    if (timeSinceLastMessage < 100 && context.messageCount > 10) { // Less than 100ms between messages
      context.flags.anomalousPatterns = true;
    }
  }
  private initializeThreatDetectionRules(): void {
    const defaultRules: ThreatDetectionRule[] = [
      {
        id: 'rate_limit_basic',
        name: 'Basic Rate Limiting',
        type: 'rate_limit',
        enabled: true,
        threshold: this.config.rateLimitMessagesPerMinute,
        timeWindowMinutes: 1,
        action: 'warn',
        description: 'Detect when users exceed message rate limits'
      },
      {
        id: 'rapid_reconnection',
        name: 'Rapid Reconnection Detection',
        type: 'behavioral',
        enabled: true,
        threshold: 5,
        timeWindowMinutes: 5,
        action: 'block',
        description: 'Detect rapid reconnection attempts'
      },
      {
        id: 'large_payload',
        name: 'Large Payload Detection',
        type: 'anomaly',
        enabled: true,
        threshold: 100000, // 100KB
        timeWindowMinutes: 1,
        action: 'log',
        description: 'Detect unusually large message payloads'
      }
    ];
    defaultRules.forEach(rule => {)
      this.threatRules.set(rule.id, rule);
    });
  }
  private startSecurityMonitoring(): void {
    // Clean up expired rate limiters every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, limiter] of this.rateLimiters) {
        if (now > limiter.resetTime) {
          this.rateLimiters.delete(key);
        }
      }
    }, 60000);
    // Rotate session keys periodically
    if (this.config.enableMessageEncryption && this.config.encryptionKeyRotationMinutes > 0) {
      setInterval(async () => {
        await this.rotateSessionKeys();
      }, this.config.encryptionKeyRotationMinutes * 60000);
    }
    // Clean up old security events
    setInterval(() => {
      this.cleanupOldSecurityEvents();
    }, 3600000); // Every hour
  }
  private async rotateSessionKeys(): Promise<void> {
    for (const [connectionId, context] of this.connectionContexts) {
      if (context.encryptionKeyId && )
          Date.now() - context.lastKeyRotation.getTime() > 
          this.config.encryptionKeyRotationMinutes * 60000) {
        try {
          await this.generateSessionEncryptionKey(context);
          context.lastKeyRotation = new Date();
          await this.logSecurityEvent({)
            type: 'encryption',
            severity: 'info',
            connectionId,
            userId: context.userId,
            description: 'Session encryption key rotated',
            metadata: { reason: 'scheduled_rotation' }
          });
        } catch (error) {
          console.error('Failed to rotate session key:', error);
        }
      }
    }
  }
  private cleanupOldSecurityEvents(): void {
    const cutoffTime = new Date(Date.now() - this.config.auditLogRetentionDays * 24 * 60 * 60 * 1000);
    this.securityEvents = this.securityEvents.filter(event => event.timestamp > cutoffTime);
  }
  private async logSecurityEvent(eventData: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    if (!this.config.enableSecurityAuditLog) return;
    const event: SecurityEvent = {
      id: `security_event_${Date.now()}_${randomBytes(4).toString('hex')}`,}
      timestamp: new Date(),
      ...eventData
    };
    this.securityEvents.push(event);
    // Emit event for external handling
    this.emit('securityEvent', event);
    // Auto-respond to critical events
    if (event.severity === 'critical') {
      this.emit('criticalSecurityEvent', event);
    }
  }
  /**
   * Cleanup and shutdown
   */
  public destroy(): void {
    // Clean up all connections
    for (const connectionId of this.connectionContexts.keys()) {
      this.cleanupConnection(connectionId);
    }
    this.connectionContexts.clear();
    this.encryptionKeys.clear();
    this.securityEvents.length = 0;
    this.threatRules.clear();
    this.rateLimiters.clear();
    this.suspiciousIPs.clear();
    this.blockedConnections.clear();
    this.removeAllListeners();
  }
}

export default WebSocketSecurityManager;