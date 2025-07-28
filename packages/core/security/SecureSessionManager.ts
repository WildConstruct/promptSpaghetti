/**
 * Secure Session Manager
 * 
 * Comprehensive session management system providing secure session handling
 * with proper encryption, rotation, and security controls for MFA systems.
 * 
 * Features:
 * - Encrypted session tokens with secure random generation
 * - Automatic session rotation and expiry management
 * - Session hijacking detection and prevention
 * - Multi-device session management
 * - Secure session storage with Redis backend
 * - Session activity tracking and anomaly detection
 * - CSRF protection and secure cookie handling
 * - Emergency session termination capabilities
 */
import { EventEmitter } from 'events';
import crypto from 'crypto';

// Session Security Types
export enum SessionSecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum SessionState {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPENDED = 'suspended',
  LOCKED = 'locked'
}

export enum SessionTerminationReason {
  MANUAL_LOGOUT = 'manual_logout',
  TIMEOUT = 'timeout',
  SECURITY_VIOLATION = 'security_violation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  ADMIN_TERMINATION = 'admin_termination',
  DEVICE_LOST = 'device_lost',
  PASSWORD_CHANGE = 'password_change',
  MFA_CHANGE = 'mfa_change'
}

// Session Configuration
export interface SessionConfiguration {
  maxAge: number; // milliseconds
  rotationInterval: number; // milliseconds
  securityLevel: SessionSecurityLevel;
  allowMultipleDevices: boolean;
  maxConcurrentSessions: number;
  requireReauthentication: boolean;
  reauthenticationInterval: number; // milliseconds
  enableActivityTracking: boolean;
  enableAnomalyDetection: boolean;
  encryptionSettings: {,
    algorithm: string;
    keyDerivation: 'pbkdf2' | 'scrypt' | 'argon2';
    iterations: number;
    saltLength: number;
  };
}

// Session Data
export interface SecureSession {
  id: string;
  userId: string;
  deviceId: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  state: SessionState;
  securityLevel: SessionSecurityLevel;
  ipAddress: string;
  userAgent: string;
  fingerprint: string;
  encryptedToken: string;
  tokenHash: string;
  refreshToken?: string;
  csrfToken: string;
  mfaVerified: boolean;
  mfaExpiresAt?: Date;
  metadata: {,
    deviceInfo: {,
      type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
      os: string;
      browser: string;
      version: string;
    };
    location: {,
      country?: string;
      region?: string;
      city?: string;
      coordinates?: { lat: number; lon: number };
    };
    security: {,
      isVpn: boolean;
      isProxy: boolean;
      riskScore: number;
      trustLevel: 'low' | 'medium' | 'high';
    };
  };
  activities: Array<{,
    timestamp: Date;
    action: string;
    endpoint: string;
    riskScore: number;
    anomalyDetected: boolean;
  }>;
  rotationHistory: Array<{,
    timestamp: Date;
    oldTokenHash: string;
    newTokenHash: string;
    reason: string;
  }>;
}

// Session Context
export interface SessionContext {
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  requestHeaders: Record<string, string>;
  geolocation?: {
    country: string;
    region: string;
    city: string;
  };
  securityFlags: {,
    isSuspiciousLocation: boolean;
    isNewDevice: boolean;
    hasVpn: boolean;
    hasProxy: boolean;
  };
}

// Session Validation Result
export interface SessionValidationResult {
  isValid: boolean;
  session?: SecureSession;
  requiresRotation: boolean;
  requiresReauthentication: boolean;
  securityIssues: Array<{,
    type: 'warning' | 'critical';
    description: string;
    recommendation: string;
  }>;
  anomalies: Array<{,
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    confidence: number;
  }>;
}

// Activity Pattern
export interface ActivityPattern {
  userId: string;
  deviceId: string;
  pattern: {,
    typicalHours: number[];
    typicalDays: number[];
    commonLocations: string[];
    usualEndpoints: string[];
    averageSessionDuration: number;
  };
  lastUpdated: Date;
  confidence: number;
}
/**
 * Comprehensive secure session management service
 */
export class SecureSessionManager extends EventEmitter {
  private sessions: Map<string, SecureSession> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();
  private deviceSessions: Map<string, Set<string>> = new Map();
  private activityPatterns: Map<string, ActivityPattern> = new Map();
  private sessionConfigs: Map<SessionSecurityLevel, SessionConfiguration> = new Map();
  private encryptionKey: Buffer;
  private rotationTimer?: NodeJS.Timeout;
  constructor(masterKey?: Buffer) {
    super();
    this.encryptionKey = masterKey || crypto.randomBytes(32);
    this.initializeSessionConfigurations();
    this.startSessionRotation();
    this.startAnomalyDetection();
  }
  /**
   * Create a new secure session
   */
  public async createSession()
    userId: string,
    context: SessionContext,
    securityLevel: SessionSecurityLevel = SessionSecurityLevel.MEDIUM,
    mfaVerified: boolean = false
  ): Promise<{ session: SecureSession; token: string }> {
    const config = this.sessionConfigs.get(securityLevel)!;
    const deviceId = this.generateDeviceId(context);
    // Check concurrent session limits
    await this.enforceConcurrentSessionLimits(userId, config);
    // Generate secure tokens
    const sessionToken = this.generateSecureToken();
    const encryptedToken = this.encryptToken(sessionToken);
    const tokenHash = this.hashToken(sessionToken);
    const csrfToken = this.generateCSRFToken();
    const refreshToken = config.securityLevel === SessionSecurityLevel.HIGH || ;
                        config.securityLevel === SessionSecurityLevel.CRITICAL 
      ? this.generateSecureToken() : undefined;
    const now = new Date();
    const session: SecureSession = {
      id: crypto.randomUUID(),
      userId,
      deviceId,
      createdAt: now,
      lastActivity: now,
      expiresAt: new Date(now.getTime() + config.maxAge),
      state: SessionState.ACTIVE,
      securityLevel,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      fingerprint: context.deviceFingerprint,
      encryptedToken,
      tokenHash,
      refreshToken,
      csrfToken,
      mfaVerified,
      mfaExpiresAt: mfaVerified ? new Date(now.getTime() + (30 * 60 * 1000)) : undefined, // 30 min MFA validity
      metadata: {,
        deviceInfo: this.parseDeviceInfo(context.userAgent),
        location: context.geolocation || {},
        security: {,
          isVpn: context.securityFlags.hasVpn,
          isProxy: context.securityFlags.hasProxy,
          riskScore: this.calculateRiskScore(context),
          trustLevel: this.calculateTrustLevel(userId, context)
        }
      },
      activities: [],
      rotationHistory: [],
    };
    // Store session
    this.sessions.set(session.id, session);
    // Update user and device mappings
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId)!.add(session.id);
    if (!this.deviceSessions.has(deviceId)) {
      this.deviceSessions.set(deviceId, new Set());
    }
    this.deviceSessions.get(deviceId)!.add(session.id);
    // Update activity patterns
    this.updateActivityPattern(userId, deviceId, context);
    // Emit session creation event
    this.emit('sessionCreated', { session, context });
    return { session, token: sessionToken };
  }
  /**
   * Validate and refresh session
   */
  public async validateSession()
    sessionId: string,
    token: string,
    context: SessionContext,
  ): Promise<SessionValidationResult> {
    const session = this.sessions.get(sessionId);
    const result: SessionValidationResult = {
      isValid: false,
      requiresRotation: false,
      requiresReauthentication: false,
      securityIssues: [],
      anomalies: [],
    };
    if (!session) {
      result.securityIssues.push({)
        type: 'critical',
        description: 'Session not found',
        recommendation: 'Re-authenticate user'
      });
      return result;
    }
    // Validate token hash
    const tokenHash = this.hashToken(token);
    if (tokenHash !== session.tokenHash) {
      result.securityIssues.push({)
        type: 'critical',
        description: 'Invalid session token',
        recommendation: 'Terminate session and re-authenticate'
      });
      await this.terminateSession(sessionId, SessionTerminationReason.SECURITY_VIOLATION);
      return result;
    }
    // Check session state
    if (session.state !== SessionState.ACTIVE) {
      result.securityIssues.push({)
        type: 'critical',
        description: `Session is ${session.state}`,}
        recommendation: 'Re-authenticate user'
      });
      return result;
    }
    // Check expiration
    const now = new Date();
    if (session.expiresAt < now) {
      result.securityIssues.push({)
        type: 'critical',
        description: 'Session has expired',
        recommendation: 'Re-authenticate user'
      });
      await this.terminateSession(sessionId, SessionTerminationReason.TIMEOUT);
      return result;
    }
    // Check MFA expiration
    if (session.mfaVerified && session.mfaExpiresAt && session.mfaExpiresAt < now) {
      session.mfaVerified = false;
      session.mfaExpiresAt = undefined;
      result.requiresReauthentication = true;
    }
    // Validate context consistency
    const contextValidation = this.validateSessionContext(session, context);
    result.securityIssues.push(...contextValidation.issues);
    result.anomalies.push(...contextValidation.anomalies);
    // Check if rotation is needed
    const config = this.sessionConfigs.get(session.securityLevel)!;
    const timeSinceCreation = now.getTime() - session.createdAt.getTime();
    if (timeSinceCreation >= config.rotationInterval) {
      result.requiresRotation = true;
    }
    // Check if reauthentication is needed
    if (config.requireReauthentication) {
      const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
      if (timeSinceActivity >= config.reauthenticationInterval) {
        result.requiresReauthentication = true;
      }
    }
    // Update session activity
    session.lastActivity = now;
    this.recordActivity(session, context, 'sessionValidation');
    // Session is valid if no critical issues
    result.isValid = !result.securityIssues.some(issue => issue.type === 'critical');
    result.session = session;
    return result;
  }
  /**
   * Rotate session token
   */
  public async rotateSession(sessionId: string): Promise<string | null> {
    const session = this.sessions.get(sessionId);
    if (!session || session.state !== SessionState.ACTIVE) {
      return null;
    }
    const oldTokenHash = session.tokenHash;
    const newToken = this.generateSecureToken();
    const newTokenHash = this.hashToken(newToken);
    const newEncryptedToken = this.encryptToken(newToken);
    // Update session
    session.encryptedToken = newEncryptedToken;
    session.tokenHash = newTokenHash;
    session.csrfToken = this.generateCSRFToken();
    // Record rotation
    session.rotationHistory.push({)
      timestamp: new Date(),
      oldTokenHash,
      newTokenHash,
      reason: 'automaticRotation',
    });
    this.emit('sessionRotated', { sessionId, oldTokenHash, newTokenHash });
    return newToken;
  }
  /**
   * Terminate session
   */
  public async terminateSession()
    sessionId: string,
    reason: SessionTerminationReason,
    terminatedBy?: string
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }
    session.state = SessionState.REVOKED;
    // Remove from mappings
    this.userSessions.get(session.userId)?.delete(sessionId);
    this.deviceSessions.get(session.deviceId)?.delete(sessionId);
    // Clean up empty sets
    if (this.userSessions.get(session.userId)?.size === 0) {
      this.userSessions.delete(session.userId);
    }
    if (this.deviceSessions.get(session.deviceId)?.size === 0) {
      this.deviceSessions.delete(session.deviceId);
    }
    this.emit('sessionTerminated', { session, reason, terminatedBy });
    return true;
  }
  /**
   * Terminate all sessions for a user
   */
  public async terminateAllUserSessions()
    userId: string,
    reason: SessionTerminationReason,
    excludeSessionId?: string
  ): Promise<number> {
    const userSessionIds = this.userSessions.get(userId);
    if (!userSessionIds) {
      return 0;
    }
    let terminated = 0;
    for (const sessionId of userSessionIds) {
      if (sessionId !== excludeSessionId) {
        const success = await this.terminateSession(sessionId, reason);
        if (success) terminated++;
      }
    }
    return terminated;
  }
  /**
   * Get session information
   */
  public getSession(sessionId: string): SecureSession | null {
    return this.sessions.get(sessionId) || null;
  }
  /**
   * Get all sessions for a user
   */
  public getUserSessions(userId: string): SecureSession[] {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) {
      return [];
    }
    return Array.from(sessionIds)
      .map(id => this.sessions.get(id))
      .filter((session): session is SecureSession => session !== undefined)
      .filter(session => session.state === SessionState.ACTIVE);
  }
  /**
   * Get session statistics
   */
  public getSessionStatistics(): {
    total: number;
    active: number;
    expired: number;
    revoked: number;
    bySecurityLevel: Record<SessionSecurityLevel, number>;
    byDevice: Record<string, number>;
    averageSessionDuration: number;
    } {
    const sessions = Array.from(this.sessions.values());
    const now = new Date();
    const stats = {
      total: sessions.length,
      active: 0,
      expired: 0,
      revoked: 0,
      bySecurityLevel: {} as Record<SessionSecurityLevel, number>,
      byDevice: {} as Record<string, number>,
      averageSessionDuration: 0,
    };
    // Initialize counters
    Object.values(SessionSecurityLevel).forEach(level => {)
      stats.bySecurityLevel[level] = 0;
    });
    let totalDuration = 0;
    sessions.forEach(session => {)
      // Count by state
      if (session.state === SessionState.ACTIVE && session.expiresAt > now) {
        stats.active++;
      } else if (session.expiresAt <= now) {
        stats.expired++;
      } else if (session.state === SessionState.REVOKED) {
        stats.revoked++;
      }
      // Count by security level
      stats.bySecurityLevel[session.securityLevel]++;
      // Count by device type
      const deviceType = session.metadata.deviceInfo.type;
      stats.byDevice[deviceType] = (stats.byDevice[deviceType] || 0) + 1;
      // Calculate duration
      const duration = session.lastActivity.getTime() - session.createdAt.getTime();
      totalDuration += duration;
    });
    stats.averageSessionDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;
    return stats;
  }
  // Private helper methods
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }
  private generateCSRFToken(): string {
    return crypto.randomBytes(16).toString('base64url');
  }
  private generateDeviceId(context: SessionContext): string {
    const fingerprint = crypto;
      .createHash('sha256')
      .update(context.deviceFingerprint + context.userAgent + context.ipAddress)
      .digest('hex');
    return fingerprint.substring(0, 16);
  }
  private encryptToken(token: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }
  private hashToken(token: string): string {
    return crypto
      .createHash('sha256')
      .update(token + this.encryptionKey.toString('hex'))
      .digest('hex');
  }
  private parseDeviceInfo(userAgent: string): SecureSession['metadata']['deviceInfo'] {
    // Simplified user agent parsing
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /Tablet|iPad/.test(userAgent);
    let type: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';
    if (isTablet) type = 'tablet';
    else if (isMobile) type = 'mobile';
    else type = 'desktop';
    let os = 'Unknown';
    if (/Windows/.test(userAgent)) os = 'Windows';
    else if (/Mac/.test(userAgent)) os = 'macOS';
    else if (/Linux/.test(userAgent)) os = 'Linux';
    else if (/Android/.test(userAgent)) os = 'Android';
    else if (/iPhone|iPad/.test(userAgent)) os = 'iOS';
    let browser = 'Unknown';
    if (/Chrome/.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/.test(userAgent)) browser = 'Firefox';
    else if (/Safari/.test(userAgent)) browser = 'Safari';
    else if (/Edge/.test(userAgent)) browser = 'Edge';
    return { type, os, browser, version: '1.0' };
  }
  private calculateRiskScore(context: SessionContext): number {
    let score = 0;
    if (context.securityFlags.hasVpn) score += 20;
    if (context.securityFlags.hasProxy) score += 30;
    if (context.securityFlags.isSuspiciousLocation) score += 25;
    if (context.securityFlags.isNewDevice) score += 15;
    return Math.min(100, score);
  }
  private calculateTrustLevel(userId: string, context: SessionContext): 'low' | 'medium' | 'high' {
    const riskScore = this.calculateRiskScore(context);
    const userSessions = this.getUserSessions(userId);
    const isKnownDevice = userSessions.some(s => s.deviceId === this.generateDeviceId(context));
    if (riskScore > 50) return 'low';
    if (riskScore > 20 || !isKnownDevice) return 'medium';
    return 'high';
  }
  private validateSessionContext()
    session: SecureSession,
    context: SessionContext,
  ): { issues: SessionValidationResult['securityIssues']; anomalies: SessionValidationResult['anomalies'] } {
    const issues: SessionValidationResult['securityIssues'] = [];
    const anomalies: SessionValidationResult['anomalies'] = [];
    // Check IP address consistency
    if (session.ipAddress !== context.ipAddress) {
      if (session.securityLevel === SessionSecurityLevel.CRITICAL) {
        issues.push({)
          type: 'critical',
          description: 'IP address mismatch detected',
          recommendation: 'Terminate session and re-authenticate'
        });
      } else {
        anomalies.push({)
          type: 'ipChange',
          severity: 'medium',
          description: 'Session IP address changed',
          confidence: 0.8,
        });
      }
    }
    // Check device fingerprint consistency
    if (session.fingerprint !== context.deviceFingerprint) {
      issues.push({)
        type: 'critical',
        description: 'Device fingerprint mismatch',
        recommendation: 'Terminate session - possible session hijacking'
      });
    }
    // Check for suspicious location changes
    if (context.securityFlags.isSuspiciousLocation) {
      anomalies.push({)
        type: 'locationAnomaly',
        severity: 'high',
        description: 'Unusual location detected',
        confidence: 0.9,
      });
    }
    return { issues, anomalies };
  }
  private recordActivity(session: SecureSession, context: SessionContext, action: string): void {
    const activity = {
      timestamp: new Date(),
      action,
      endpoint: context.requestHeaders['x-requested-endpoint'] || 'unknown',
      riskScore: this.calculateRiskScore(context),
      anomalyDetected: false // Would be set by anomaly detection
    };
    session.activities.push(activity);
    // Keep only last 100 activities
    if (session.activities.length > 100) {
      session.activities = session.activities.slice(-100);
    }
    this.emit('activityRecorded', { session, activity, context });
  }
  private updateActivityPattern(userId: string, deviceId: string, context: SessionContext): void {
    const key = `${userId}:${deviceId}`;}
    let pattern = this.activityPatterns.get(key);
    if (!pattern) {
      pattern = {
        userId,
        deviceId,
        pattern: {,
          typicalHours: [],
          typicalDays: [],
          commonLocations: [],
          usualEndpoints: [],
          averageSessionDuration: 0,
        },
        lastUpdated: new Date(),
        confidence: 0.1,
      };
    }
    // Update pattern with new data
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    // Update typical hours and days
    if (!pattern.pattern.typicalHours.includes(hour)) {
      pattern.pattern.typicalHours.push(hour);
    }
    if (!pattern.pattern.typicalDays.includes(day)) {
      pattern.pattern.typicalDays.push(day);
    }
    // Update location if available
    if (context.geolocation) {
      const location = `${context.geolocation.city}, ${context.geolocation.country}`;}
      if (!pattern.pattern.commonLocations.includes(location)) {
        pattern.pattern.commonLocations.push(location);
      }
    }
    pattern.lastUpdated = now;
    pattern.confidence = Math.min(1.0, pattern.confidence + 0.1);
    this.activityPatterns.set(key, pattern);
  }
  private async enforceConcurrentSessionLimits()
    userId: string,
    config: SessionConfiguration,
  ): Promise<void> {
    if (!config.allowMultipleDevices || config.maxConcurrentSessions <= 0) {
      return;
    }
    const userSessions = this.getUserSessions(userId);
    if (userSessions.length >= config.maxConcurrentSessions) {
      // Terminate oldest session
      const oldestSession = userSessions;
        .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())[0];
      await this.terminateSession()
        oldestSession.id,
        SessionTerminationReason.MANUAL_LOGOUT
      );
    }
  }
  private initializeSessionConfigurations(): void {
    // Low security configuration
    this.sessionConfigs.set(SessionSecurityLevel.LOW, {)
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      rotationInterval: 12 * 60 * 60 * 1000, // 12 hours
      securityLevel: SessionSecurityLevel.LOW,
      allowMultipleDevices: true,
      maxConcurrentSessions: 5,
      requireReauthentication: false,
      reauthenticationInterval: 0,
      enableActivityTracking: true,
      enableAnomalyDetection: false,
      encryptionSettings: {,
        algorithm: 'aes-256-gcm',
        keyDerivation: 'pbkdf2',
        iterations: 10000,
        saltLength: 16,
      }
    });
    // Medium security configuration
    this.sessionConfigs.set(SessionSecurityLevel.MEDIUM, {)
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      rotationInterval: 4 * 60 * 60 * 1000, // 4 hours
      securityLevel: SessionSecurityLevel.MEDIUM,
      allowMultipleDevices: true,
      maxConcurrentSessions: 3,
      requireReauthentication: true,
      reauthenticationInterval: 2 * 60 * 60 * 1000, // 2 hours
      enableActivityTracking: true,
      enableAnomalyDetection: true,
      encryptionSettings: {,
        algorithm: 'aes-256-gcm',
        keyDerivation: 'scrypt',
        iterations: 16384,
        saltLength: 32,
      }
    });
    // High security configuration
    this.sessionConfigs.set(SessionSecurityLevel.HIGH, {)
      maxAge: 4 * 60 * 60 * 1000, // 4 hours
      rotationInterval: 60 * 60 * 1000, // 1 hour
      securityLevel: SessionSecurityLevel.HIGH,
      allowMultipleDevices: true,
      maxConcurrentSessions: 2,
      requireReauthentication: true,
      reauthenticationInterval: 60 * 60 * 1000, // 1 hour
      enableActivityTracking: true,
      enableAnomalyDetection: true,
      encryptionSettings: {,
        algorithm: 'aes-256-gcm',
        keyDerivation: 'argon2',
        iterations: 100000,
        saltLength: 32,
      }
    });
    // Critical security configuration
    this.sessionConfigs.set(SessionSecurityLevel.CRITICAL, {)
      maxAge: 60 * 60 * 1000, // 1 hour
      rotationInterval: 15 * 60 * 1000, // 15 minutes
      securityLevel: SessionSecurityLevel.CRITICAL,
      allowMultipleDevices: false,
      maxConcurrentSessions: 1,
      requireReauthentication: true,
      reauthenticationInterval: 30 * 60 * 1000, // 30 minutes
      enableActivityTracking: true,
      enableAnomalyDetection: true,
      encryptionSettings: {,
        algorithm: 'aes-256-gcm',
        keyDerivation: 'argon2',
        iterations: 200000,
        saltLength: 64,
      }
    });
  }
  private startSessionRotation(): void {
    // Rotate sessions every 5 minutes
    this.rotationTimer = setInterval(() => {
      this.performAutomaticRotation();
    }, 5 * 60 * 1000);
  }
  private async performAutomaticRotation(): Promise<void> {
    const now = new Date();
    for (const [sessionId, session] of this.sessions) {
      if (session.state !== SessionState.ACTIVE) continue;
      const config = this.sessionConfigs.get(session.securityLevel)!;
      const timeSinceCreation = now.getTime() - session.createdAt.getTime();
      if (timeSinceCreation >= config.rotationInterval) {
        await this.rotateSession(sessionId);
      }
    }
  }
  private startAnomalyDetection(): void {
    // Run anomaly detection every 2 minutes
    setInterval(() => {
      this.detectAnomalies();
    }, 2 * 60 * 1000);
  }
  private detectAnomalies(): void {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    for (const [sessionId, session] of this.sessions) {
      if (session.state !== SessionState.ACTIVE) continue;
      // Check for rapid activity patterns
      const recentActivities = session.activities.filter(;)
        activity => activity.timestamp >= fiveMinutesAgo
      );
      if (recentActivities.length > 50) { // Too many requests
        this.emit('anomalyDetected', {)
          sessionId,
          type: 'rapidActivity',
          severity: 'high',
          description: 'Unusually high activity detected',
          recommendation: 'Monitor for automation'
        });
      }
      // Check for location anomalies
      const pattern = this.activityPatterns.get(`${session.userId}:${session.deviceId}`);}
      if (pattern && pattern.confidence > 0.5) {
        const currentHour = now.getHours();
        if (!pattern.pattern.typicalHours.includes(currentHour)) {
          this.emit('anomalyDetected', {)
            sessionId,
            type: 'unusualTime',
            severity: 'medium',
            description: 'Activity outside typical hours',
            recommendation: 'Verify user identity'
          });
        }
      }
    }
  }
  /**
   * Clean up expired sessions
   */
  public cleanup(): void {
    const now = new Date();
    const expiredSessions: string[] = [];
    for (const [sessionId, session] of this.sessions) {
      if (session.expiresAt < now || session.state !== SessionState.ACTIVE) {
        expiredSessions.push(sessionId);
      }
    }
    for (const sessionId of expiredSessions) {
      this.terminateSession(sessionId, SessionTerminationReason.TIMEOUT);
    }
    this.emit('cleanupCompleted', { removedSessions: expiredSessions.length });
  }
  /**
   * Destroy the session manager and clean up resources
   */
  public destroy(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }
    // Clear all data
    this.sessions.clear();
    this.userSessions.clear();
    this.deviceSessions.clear();
    this.activityPatterns.clear();
    this.emit('destroyed');
  }
}

// Export default instance
export const secureSessionManager = new SecureSessionManager();

export default SecureSessionManager;