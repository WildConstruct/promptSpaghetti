/**
 * Enhanced Session Service - Epic 19 Implementation
 * Advanced session management with security, encryption, and multi-device support
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';
import jwt from 'jsonwebtoken';

export interface SessionConfig {
  sessionDuration: number; // seconds
  refreshTokenDuration: number; // seconds
  maxConcurrentSessions: number;
  maxDevicesPerUser: number;
  allowMultiDevice: boolean;
  requireDeviceFingerprint: boolean;
  requireGeolocation: boolean;
  jwtSecret: string;
  encryptionKey: string;
  secureCookie: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    domain?: string;
    path: string;
  };
  sessionRotation: {
    enabled: boolean;
    rotationInterval: number; // seconds
    keepPreviousValid: boolean;
    gracePeriod: number; // seconds
  };
  inactivityTimeout: {
    enabled: boolean;
    warningTime: number; // seconds before timeout
    timeoutDuration: number; // seconds
    extendOnActivity: boolean;
  };
}

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  
  tokens: {
    sessionToken: string;
    refreshToken: string;
    csrfToken: string;
    previousTokens?: Array<{
      token: string;
      validUntil: Date;
    }>;
  };
  
  metadata: {
    createdAt: Date;
    lastActivity: Date;
    expiresAt: Date;
    refreshExpiresAt: Date;
    rotatedAt?: Date;
    userAgent: string;
    ipAddress: string;
    deviceFingerprint?: string;
    geolocation?: {
      country: string;
      region: string;
      city: string;
      latitude: number;
      longitude: number;
    };
  };
  
  security: {
    mfaVerified: boolean;
    riskScore: number;
    trustLevel: 'untrusted' | 'partial' | 'trusted' | 'verified';
    securityFlags: string[];
    encryptionVersion: number;
  };
  
  permissions: {
    scopes: string[];
    restrictions: string[];
    elevatedUntil?: Date;
    impersonating?: string;
  };
  
  status: 'active' | 'inactive' | 'expired' | 'revoked' | 'rotating';
  
  analytics: {
    requestCount: number;
    lastEndpoint?: string;
    avgResponseTime?: number;
    errorCount: number;
    suspiciousActivities: number;
  };
}

export interface DeviceProfile {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'api';
  fingerprint: string;
  
  registration: {
    registeredAt: Date;
    registeredFrom: string;
    verificationMethod: 'email' | 'sms' | 'push' | 'manual';
    verifiedAt?: Date;
  };
  
  trustInfo: {
    trusted: boolean;
    trustLevel: number; // 0-100
    lastVerified: Date;
    verificationCount: number;
  };
  
  sessionHistory: Array<{
    sessionId: string;
    createdAt: Date;
    endedAt?: Date;
    endReason?: string;
  }>;
  
  metadata: {
    platform: string;
    osVersion: string;
    appVersion: string;
    lastSeen: Date;
    lastIpAddress: string;
    locationHistory: Array<{
      location: string;
      timestamp: Date;
    }>;
  };
}

export interface SessionActivity {
  sessionId: string;
  timestamp: Date;
  activityType: 'login' | 'refresh' | 'api_call' | 'logout' | 'timeout' | 'rotation';
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  metadata: Record<string, any>;
}

export class EnhancedSessionService extends EventEmitter {
  private config: SessionConfig;
  private sessions: Map<string, Session> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();
  private deviceProfiles: Map<string, DeviceProfile> = new Map();
  private sessionActivities: Map<string, SessionActivity[]> = new Map();
  private blacklistedTokens: Set<string> = new Set();
  private maintenanceInterval: NodeJS.Timeout;

  constructor(config: SessionConfig) {
    super();
    this.config = config;
    this.startMaintenanceTasks();
  }

  /**
   * Create a new session with enhanced security
   */
  async createSession(
    userId: string,
    context: {
      userAgent: string;
      ipAddress: string;
      deviceFingerprint?: string;
      geolocation?: Session['metadata']['geolocation'];
      mfaVerified?: boolean;
      scopes?: string[];
      impersonatedBy?: string;
    }
  ): Promise<{
    session: Session;
    tokens: {
      sessionToken: string;
      refreshToken: string;
      csrfToken: string;
    };
    cookieOptions: any;
  }> {
    // Validate concurrent sessions
    await this.validateConcurrentSessions(userId);
    
    // Get or create device profile
    const deviceProfile = await this.getOrCreateDeviceProfile(userId, context);
    
    // Calculate initial risk score and trust level
    const securityAssessment = await this.assessSecurityContext(userId, deviceProfile, context);
    
    // Generate secure tokens
    const tokens = this.generateSecureTokens(userId, deviceProfile.id, securityAssessment);
    
    // Create session object
    const session: Session = {
      id: this.generateSessionId(),
      userId,
      deviceId: deviceProfile.id,
      tokens: {
        sessionToken: tokens.sessionToken,
        refreshToken: tokens.refreshToken,
        csrfToken: tokens.csrfToken
      },
      metadata: {
        createdAt: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + this.config.sessionDuration * 1000),
        refreshExpiresAt: new Date(Date.now() + this.config.refreshTokenDuration * 1000),
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
        deviceFingerprint: context.deviceFingerprint,
        geolocation: context.geolocation
      },
      security: {
        mfaVerified: context.mfaVerified || false,
        riskScore: securityAssessment.riskScore,
        trustLevel: securityAssessment.trustLevel,
        securityFlags: securityAssessment.flags,
        encryptionVersion: 1
      },
      permissions: {
        scopes: context.scopes || ['basic'],
        restrictions: securityAssessment.restrictions,
        impersonating: context.impersonatedBy
      },
      status: 'active',
      analytics: {
        requestCount: 0,
        errorCount: 0,
        suspiciousActivities: 0
      }
    };
    
    // Store session
    await this.storeSession(session);
    
    // Update device profile
    deviceProfile.sessionHistory.push({
      sessionId: session.id,
      createdAt: session.metadata.createdAt
    });
    deviceProfile.metadata.lastSeen = new Date();
    deviceProfile.metadata.lastIpAddress = context.ipAddress;
    
    // Log session creation
    await this.logSessionActivity(session.id, 'login', {
      deviceId: deviceProfile.id,
      trustLevel: session.security.trustLevel,
      mfaVerified: session.security.mfaVerified
    });
    
    // Generate cookie options
    const cookieOptions = this.generateCookieOptions(session);
    
    this.emit('sessionCreated', {
      sessionId: session.id,
      userId,
      deviceId: deviceProfile.id,
      trustLevel: session.security.trustLevel
    });
    
    return {
      session,
      tokens,
      cookieOptions
    };
  }

  /**
   * Validate session with comprehensive security checks
   */
  async validateSession(
    sessionToken: string,
    context: {
      ipAddress: string;
      userAgent: string;
      endpoint?: string;
      csrfToken?: string;
    }
  ): Promise<{
    valid: boolean;
    session?: Session;
    reason?: string;
    requiresAction?: string[];
  }> {
    // Check if token is blacklisted
    if (this.blacklistedTokens.has(sessionToken)) {
      return {
        valid: false,
        reason: 'Token has been revoked'
      };
    }
    
    // Decode and verify JWT
    let decoded: any;
    try {
      decoded = jwt.verify(sessionToken, this.config.jwtSecret);
    } catch (error) {
      return {
        valid: false,
        reason: 'Invalid or expired token'
      };
    }
    
    // Get session
    const session = this.sessions.get(decoded.sessionId);
    if (!session) {
      return {
        valid: false,
        reason: 'Session not found'
      };
    }
    
    // Check session status
    if (session.status !== 'active') {
      return {
        valid: false,
        reason: `Session is ${session.status}`
      };
    }
    
    // Check expiration
    if (session.metadata.expiresAt <= new Date()) {
      session.status = 'expired';
      return {
        valid: false,
        reason: 'Session has expired'
      };
    }
    
    // Validate device and context
    const contextValidation = await this.validateSessionContext(session, context);
    if (!contextValidation.valid) {
      return contextValidation;
    }
    
    // Check inactivity timeout
    if (this.config.inactivityTimeout.enabled) {
      const inactivityCheck = this.checkInactivityTimeout(session);
      if (!inactivityCheck.valid) {
        return inactivityCheck;
      }
    }
    
    // Update last activity
    session.metadata.lastActivity = new Date();
    session.analytics.requestCount++;
    
    // Check if rotation is needed
    if (this.shouldRotateSession(session)) {
      session.status = 'rotating';
      this.emit('sessionRotationRequired', { sessionId: session.id });
    }
    
    return {
      valid: true,
      session,
      requiresAction: this.getRequiredActions(session)
    };
  }

  /**
   * Refresh session with token rotation
   */
  async refreshSession(
    refreshToken: string,
    context: {
      ipAddress: string;
      userAgent: string;
    }
  ): Promise<{
    success: boolean;
    session?: Session;
    tokens?: {
      sessionToken: string;
      refreshToken: string;
      csrfToken: string;
    };
    reason?: string;
  }> {
    // Verify refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, this.config.jwtSecret);
    } catch (error) {
      return {
        success: false,
        reason: 'Invalid refresh token'
      };
    }
    
    const session = this.sessions.get(decoded.sessionId);
    if (!session) {
      return {
        success: false,
        reason: 'Session not found'
      };
    }
    
    // Check if refresh token matches
    if (session.tokens.refreshToken !== refreshToken) {
      // Possible token theft - revoke all tokens
      await this.revokeSession(session.id, 'token_mismatch');
      return {
        success: false,
        reason: 'Token mismatch - session revoked for security'
      };
    }
    
    // Check refresh token expiration
    if (session.metadata.refreshExpiresAt <= new Date()) {
      return {
        success: false,
        reason: 'Refresh token has expired'
      };
    }
    
    // Rotate tokens
    const newTokens = await this.rotateSessionTokens(session);
    
    // Update session
    session.metadata.lastActivity = new Date();
    session.metadata.expiresAt = new Date(Date.now() + this.config.sessionDuration * 1000);
    session.metadata.refreshExpiresAt = new Date(Date.now() + this.config.refreshTokenDuration * 1000);
    session.metadata.rotatedAt = new Date();
    
    await this.logSessionActivity(session.id, 'refresh', {
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    });
    
    this.emit('sessionRefreshed', {
      sessionId: session.id,
      userId: session.userId
    });
    
    return {
      success: true,
      session,
      tokens: newTokens
    };
  }

  /**
   * Implement session expiration with grace periods
   */
  async implementSessionExpiration(): Promise<void> {
    for (const [sessionId, session] of this.sessions.entries()) {
      const now = new Date();
      
      // Check if session is expired
      if (session.metadata.expiresAt <= now && session.status === 'active') {
        // Check if within grace period for rotation
        if (this.config.sessionRotation.keepPreviousValid && session.tokens.previousTokens) {
          const validPreviousTokens = session.tokens.previousTokens.filter(
            pt => pt.validUntil > now
          );
          
          if (validPreviousTokens.length > 0) {
            // Still in grace period
            continue;
          }
        }
        
        // Expire the session
        await this.expireSession(sessionId);
      }
      
      // Check inactivity timeout warning
      if (this.config.inactivityTimeout.enabled) {
        const timeSinceActivity = now.getTime() - session.metadata.lastActivity.getTime();
        const warningTime = (this.config.inactivityTimeout.timeoutDuration - this.config.inactivityTimeout.warningTime) * 1000;
        
        if (timeSinceActivity >= warningTime && timeSinceActivity < this.config.inactivityTimeout.timeoutDuration * 1000) {
          this.emit('sessionInactivityWarning', {
            sessionId,
            userId: session.userId,
            remainingTime: this.config.inactivityTimeout.timeoutDuration * 1000 - timeSinceActivity
          });
        }
      }
    }
  }

  /**
   * Revoke session with reason tracking
   */
  async revokeSession(
    sessionId: string,
    reason: string,
    revokedBy?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        success: false,
        message: 'Session not found'
      };
    }
    
    // Blacklist all tokens
    this.blacklistedTokens.add(session.tokens.sessionToken);
    this.blacklistedTokens.add(session.tokens.refreshToken);
    if (session.tokens.previousTokens) {
      session.tokens.previousTokens.forEach(pt => this.blacklistedTokens.add(pt.token));
    }
    
    // Update session status
    session.status = 'revoked';
    
    // Update device profile
    const deviceProfile = this.deviceProfiles.get(session.deviceId);
    if (deviceProfile) {
      const sessionHistory = deviceProfile.sessionHistory.find(sh => sh.sessionId === sessionId);
      if (sessionHistory) {
        sessionHistory.endedAt = new Date();
        sessionHistory.endReason = reason;
      }
    }
    
    // Remove from active sessions
    this.sessions.delete(sessionId);
    const userSessions = this.userSessions.get(session.userId);
    if (userSessions) {
      userSessions.delete(sessionId);
    }
    
    await this.logSessionActivity(sessionId, 'logout', {
      reason,
      revokedBy: revokedBy || 'system'
    });
    
    this.emit('sessionRevoked', {
      sessionId,
      userId: session.userId,
      reason,
      revokedBy
    });
    
    return {
      success: true,
      message: 'Session revoked successfully'
    };
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<{
    sessions: Array<{
      sessionId: string;
      deviceName: string;
      deviceType: string;
      lastActivity: Date;
      location?: string;
      current: boolean;
      trustLevel: string;
    }>;
    deviceCount: number;
  }> {
    const userSessionIds = this.userSessions.get(userId) || new Set();
    const sessions = [];
    
    for (const sessionId of userSessionIds) {
      const session = this.sessions.get(sessionId);
      if (session && session.status === 'active') {
        const device = this.deviceProfiles.get(session.deviceId);
        sessions.push({
          sessionId,
          deviceName: device?.deviceName || 'Unknown Device',
          deviceType: device?.deviceType || 'unknown',
          lastActivity: session.metadata.lastActivity,
          location: session.metadata.geolocation?.city,
          current: false, // Would be set based on current request
          trustLevel: session.security.trustLevel
        });
      }
    }
    
    return {
      sessions,
      deviceCount: new Set(sessions.map(s => s.deviceName)).size
    };
  }

  /**
   * Implement secure cookie configuration
   */
  generateCookieOptions(session: Session): any {
    const baseOptions = {
      httpOnly: this.config.secureCookie.httpOnly,
      secure: this.config.secureCookie.secure,
      sameSite: this.config.secureCookie.sameSite,
      path: this.config.secureCookie.path,
      maxAge: this.config.sessionDuration * 1000,
      domain: this.config.secureCookie.domain
    };

    // Add additional security based on trust level
    if (session.security.trustLevel === 'untrusted') {
      baseOptions.sameSite = 'strict';
    }

    // Add partitioned attribute for Chrome's CHIPS
    if (this.config.secureCookie.secure) {
      (baseOptions as any).partitioned = true;
    }

    return baseOptions;
  }

  // Private helper methods

  private async validateConcurrentSessions(userId: string): Promise<void> {
    const userSessionIds = this.userSessions.get(userId) || new Set();
    const activeSessions = Array.from(userSessionIds)
      .map(id => this.sessions.get(id))
      .filter(s => s && s.status === 'active');
    
    if (activeSessions.length >= this.config.maxConcurrentSessions) {
      // Revoke oldest session
      const oldestSession = activeSessions.sort((a, b) => 
        a!.metadata.createdAt.getTime() - b!.metadata.createdAt.getTime()
      )[0];
      
      if (oldestSession) {
        await this.revokeSession(oldestSession.id, 'max_sessions_exceeded');
      }
    }
  }

  private async getOrCreateDeviceProfile(
    userId: string,
    context: any
  ): Promise<DeviceProfile> {
    const fingerprint = context.deviceFingerprint || this.generateDeviceFingerprint(context);
    const existingDevice = Array.from(this.deviceProfiles.values())
      .find(d => d.userId === userId && d.fingerprint === fingerprint);
    
    if (existingDevice) {
      return existingDevice;
    }
    
    const newDevice: DeviceProfile = {
      id: this.generateDeviceId(),
      userId,
      deviceName: this.generateDeviceName(context.userAgent),
      deviceType: this.detectDeviceType(context.userAgent),
      fingerprint,
      registration: {
        registeredAt: new Date(),
        registeredFrom: context.ipAddress,
        verificationMethod: 'manual'
      },
      trustInfo: {
        trusted: false,
        trustLevel: 0,
        lastVerified: new Date(),
        verificationCount: 0
      },
      sessionHistory: [],
      metadata: {
        platform: this.detectPlatform(context.userAgent),
        osVersion: this.detectOSVersion(context.userAgent),
        appVersion: 'unknown',
        lastSeen: new Date(),
        lastIpAddress: context.ipAddress,
        locationHistory: []
      }
    };
    
    this.deviceProfiles.set(newDevice.id, newDevice);
    return newDevice;
  }

  private async assessSecurityContext(
    userId: string,
    device: DeviceProfile,
    context: any
  ): Promise<{
    riskScore: number;
    trustLevel: Session['security']['trustLevel'];
    flags: string[];
    restrictions: string[];
  }> {
    let riskScore = 0;
    const flags = [];
    const restrictions = [];
    
    // New device penalty
    if (device.sessionHistory.length === 0) {
      riskScore += 30;
      flags.push('new_device');
      restrictions.push('limited_api_access');
    }
    
    // Untrusted device penalty
    if (!device.trustInfo.trusted) {
      riskScore += 20;
      flags.push('untrusted_device');
    }
    
    // No MFA penalty
    if (!context.mfaVerified) {
      riskScore += 25;
      flags.push('no_mfa');
      restrictions.push('no_sensitive_operations');
    }
    
    // Suspicious location
    if (context.geolocation && this.isSuspiciousLocation(userId, context.geolocation)) {
      riskScore += 15;
      flags.push('suspicious_location');
    }
    
    // Calculate trust level
    let trustLevel: Session['security']['trustLevel'] = 'verified';
    if (riskScore >= 70) trustLevel = 'untrusted';
    else if (riskScore >= 40) trustLevel = 'partial';
    else if (riskScore >= 20) trustLevel = 'trusted';
    
    return {
      riskScore: Math.min(100, riskScore),
      trustLevel,
      flags,
      restrictions
    };
  }

  private generateSecureTokens(userId: string, deviceId: string, security: any): {
    sessionToken: string;
    refreshToken: string;
    csrfToken: string;
  } {
    const sessionId = this.generateSessionId();
    const now = Math.floor(Date.now() / 1000);
    
    const sessionPayload = {
      sessionId,
      userId,
      deviceId,
      type: 'session',
      iat: now,
      exp: now + this.config.sessionDuration,
      security: {
        trustLevel: security.trustLevel,
        riskScore: security.riskScore
      }
    };
    
    const refreshPayload = {
      sessionId,
      userId,
      deviceId,
      type: 'refresh',
      iat: now,
      exp: now + this.config.refreshTokenDuration
    };
    
    return {
      sessionToken: jwt.sign(sessionPayload, this.config.jwtSecret),
      refreshToken: jwt.sign(refreshPayload, this.config.jwtSecret),
      csrfToken: crypto.randomBytes(32).toString('hex')
    };
  }

  private async rotateSessionTokens(session: Session): Promise<{
    sessionToken: string;
    refreshToken: string;
    csrfToken: string;
  }> {
    // Store previous tokens if configured
    if (this.config.sessionRotation.keepPreviousValid) {
      if (!session.tokens.previousTokens) {
        session.tokens.previousTokens = [];
      }
      
      session.tokens.previousTokens.push({
        token: session.tokens.sessionToken,
        validUntil: new Date(Date.now() + this.config.sessionRotation.gracePeriod * 1000)
      });
      
      // Keep only recent previous tokens
      session.tokens.previousTokens = session.tokens.previousTokens.filter(
        pt => pt.validUntil > new Date()
      );
    }
    
    // Generate new tokens
    const newTokens = this.generateSecureTokens(
      session.userId,
      session.deviceId,
      session.security
    );
    
    // Update session
    session.tokens.sessionToken = newTokens.sessionToken;
    session.tokens.refreshToken = newTokens.refreshToken;
    session.tokens.csrfToken = newTokens.csrfToken;
    
    return newTokens;
  }

  private async storeSession(session: Session): Promise<void> {
    this.sessions.set(session.id, session);
    
    const userSessions = this.userSessions.get(session.userId) || new Set();
    userSessions.add(session.id);
    this.userSessions.set(session.userId, userSessions);
  }

  private async validateSessionContext(session: Session, context: any): Promise<{
    valid: boolean;
    session?: Session;
    reason?: string;
  }> {
    // Validate device fingerprint if required
    if (this.config.requireDeviceFingerprint && session.metadata.deviceFingerprint) {
      const currentFingerprint = this.generateDeviceFingerprint(context);
      if (session.metadata.deviceFingerprint !== currentFingerprint) {
        return {
          valid: false,
          reason: 'Device fingerprint mismatch'
        };
      }
    }
    
    // Validate IP address for high-security sessions
    if (session.security.trustLevel === 'verified' && session.metadata.ipAddress !== context.ipAddress) {
      return {
        valid: false,
        reason: 'IP address change detected for high-security session'
      };
    }
    
    return { valid: true, session };
  }

  private checkInactivityTimeout(session: Session): {
    valid: boolean;
    reason?: string;
  } {
    const inactivityDuration = Date.now() - session.metadata.lastActivity.getTime();
    
    if (inactivityDuration > this.config.inactivityTimeout.timeoutDuration * 1000) {
      return {
        valid: false,
        reason: 'Session timed out due to inactivity'
      };
    }
    
    return { valid: true };
  }

  private shouldRotateSession(session: Session): boolean {
    if (!this.config.sessionRotation.enabled) {
      return false;
    }
    
    const rotationDue = session.metadata.rotatedAt 
      ? Date.now() - session.metadata.rotatedAt.getTime() > this.config.sessionRotation.rotationInterval * 1000
      : Date.now() - session.metadata.createdAt.getTime() > this.config.sessionRotation.rotationInterval * 1000;
    
    return rotationDue;
  }

  private getRequiredActions(session: Session): string[] {
    const actions = [];
    
    if (!session.security.mfaVerified) {
      actions.push('verify_mfa');
    }
    
    if (session.security.trustLevel === 'untrusted') {
      actions.push('verify_device');
    }
    
    if (session.status === 'rotating') {
      actions.push('refresh_token');
    }
    
    return actions;
  }

  private async expireSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    session.status = 'expired';
    
    await this.logSessionActivity(sessionId, 'timeout', {
      reason: 'session_expired'
    });
    
    this.emit('sessionExpired', {
      sessionId,
      userId: session.userId
    });
  }

  private async logSessionActivity(
    sessionId: string,
    activityType: SessionActivity['activityType'],
    metadata: Record<string, any>
  ): Promise<void> {
    const activity: SessionActivity = {
      sessionId,
      timestamp: new Date(),
      activityType,
      metadata
    };
    
    const activities = this.sessionActivities.get(sessionId) || [];
    activities.push(activity);
    
    // Keep only recent activities
    if (activities.length > 100) {
      activities.splice(0, activities.length - 100);
    }
    
    this.sessionActivities.set(sessionId, activities);
  }

  private generateDeviceFingerprint(context: any): string {
    const data = `${context.userAgent}-${context.ipAddress}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private generateDeviceName(userAgent: string): string {
    // Simple device name extraction - would use a proper UA parser
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari')) return 'Safari Browser';
    return 'Unknown Browser';
  }

  private detectDeviceType(userAgent: string): DeviceProfile['deviceType'] {
    if (userAgent.includes('Mobile')) return 'mobile';
    if (userAgent.includes('Tablet')) return 'tablet';
    if (userAgent.includes('API')) return 'api';
    return 'desktop';
  }

  private detectPlatform(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private detectOSVersion(userAgent: string): string {
    // Simple OS version detection - would use a proper UA parser
    return 'Unknown';
  }

  private isSuspiciousLocation(userId: string, geolocation: any): boolean {
    // Would implement actual location anomaly detection
    return false;
  }

  private startMaintenanceTasks(): void {
    this.maintenanceInterval = setInterval(() => {
      this.performMaintenance();
    }, 60 * 1000); // Every minute
  }

  private async performMaintenance(): Promise<void> {
    // Implement session expiration
    await this.implementSessionExpiration();
    
    // Clean up expired tokens from blacklist
    // In production, this would be stored in Redis with TTL
    
    // Clean up old session activities
    for (const [sessionId, activities] of this.sessionActivities.entries()) {
      if (!this.sessions.has(sessionId)) {
        this.sessionActivities.delete(sessionId);
      }
    }
  }

  private generateSessionId(): string {
    return `SES-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
  }

  private generateDeviceId(): string {
    return `DEV-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  }

  destroy(): void {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
    }
  }
}