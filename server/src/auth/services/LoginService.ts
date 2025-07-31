// Epic 11 Login Service
// Enhanced login system with security measures and session management

import {
  LoginRequest,
  LoginResponse,
  User,
  AuthConfig,
  UserSession
} from '../types';
import { UserService } from './UserService';
import { TokenService } from './TokenService';
import { AuditService } from './AuditService';
import { RateLimitService } from './RateLimitService';
import { EmailService } from './EmailService';
import { AccountLockoutService } from './AccountLockoutService';
import { DatabaseService } from '../database/DatabaseService';
import { RedisService } from '../database/RedisService';
import { AUDIT_EVENTS, RATE_LIMIT_RULES } from '../config';
import { GeolocationService, GeolocationData } from './GeolocationService';

}
}
export interface LoginAttempt {
  userId?: string;
  email: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  failureReason?: string;
  deviceFingerprint?: string;
  geolocationData?: GeolocationData;
  locationAnalysis?: {
    isNewLocation: boolean;
    isTypicalLocation: boolean;
    distanceFromNearestKm?: number;
    suspiciousIndicators: string[];
}
}
  };
}

}
}
export interface LoginAnalytics {
  totalAttempts: number;
  successfulLogins: number;
  failedAttempts: number;
  successRate: number;
  topFailureReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
}
}
  }>;
  suspiciousActivity: Array<{
    type: string;
    description: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  deviceAnalysis: {
    newDevices: number;
    returningDevices: number;
    suspiciousDevices: number;
  };
}

}
}
export interface DeviceInfo {
  browser?: string;
  os?: string;
  device?: string;
  userAgent: string;
  fingerprint?: string;
  trusted?: boolean;
}
}
}

export class LoginService {
  private userService: UserService;
  private tokenService: TokenService;
  private auditService: AuditService;
  private rateLimitService: RateLimitService;
  private emailService: EmailService;
  private lockoutService: AccountLockoutService;
  private geolocationService: GeolocationService;
  private db: DatabaseService;
  private redis: RedisService;
  private config: AuthConfig;

  constructor(
    config: AuthConfig,
    userService: UserService,
    tokenService: TokenService,
    auditService: AuditService,
    rateLimitService: RateLimitService,
    emailService: EmailService,
    lockoutService: AccountLockoutService,
    geolocationService: GeolocationService,
    db: DatabaseService,
    redis: RedisService
  ) {
    this.config = config;
    this.userService = userService;
    this.tokenService = tokenService;
    this.auditService = auditService;
    this.rateLimitService = rateLimitService;
    this.emailService = emailService;
    this.lockoutService = lockoutService;
    this.geolocationService = geolocationService;
    this.db = db;
    this.redis = redis;
  }

  /**
   * Get comprehensive geolocation data for login context
   */
  private async getLocationData(context: {
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
    geoLocation?: {
      country?: string;
      city?: string;
      timezone?: string;
    };
  }): Promise<GeolocationData> {

    if (!context.ipAddress) {
      return {
        country: 'Unknown',
        countryCode: 'XX',
        region: 'Unknown',
        regionCode: 'XX',
        city: 'Unknown',
        timezone: 'UTC',
        confidence: 0.1,
        source: 'fallback'
      };
    }

    // Extract headers from context.geoLocation if available
    const headers = context.geoLocation ? {
      'cf-ipcountry': context.geoLocation.country,
      'cf-timezone': context.geoLocation.timezone
    } : undefined;

    return await this.geolocationService.getGeolocationData(context.ipAddress, headers);
  }

  async login(
    request: LoginRequest,
    context: {
      ipAddress?: string;
      userAgent?: string;
      deviceFingerprint?: string;
      geoLocation?: {
        country?: string;
        city?: string;
        timezone?: string;
      };
    }
  ): Promise<LoginResponse> {

    const startTime = Date.now();
    let user: User | null = null;
    
    try {
      // Pre-login security checks
      await this.performSecurityChecks(request.email, context);

      // Check account lockout status
      const lockoutStatus = await this.lockoutService.getLockoutStatus(request.email);
      if (lockoutStatus.isLocked) {
        const lockoutError = lockoutStatus.lockedUntil 
          ? `Account is locked until ${lockoutStatus.lockedUntil.toLocaleString()}`
          : 'Account is currently locked';
        throw new Error(lockoutError);
      }

      // Get user and validate credentials
      user = await this.validateCredentials(request.email, request.password);

      // Record successful login attempt
      await this.lockoutService.recordLoginAttempt({
        userId: user.id,
        email: request.email,
        success: true,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        timestamp: new Date()
      });

      // Post-login security validations
      await this.validateUserAccount(user, context);

      // Generate tokens and create session
      const tokens = await this.generateTokens(user);
      const session = await this.createSession(user, request, context);

      // Get comprehensive geolocation data
      const geolocationData = await this.getLocationData(context);
      
      // Track user location for security analysis
      const locationAnalysis = user ? await this.geolocationService.trackLoginLocation(
        user.id,
        context.ipAddress || '',
        geolocationData
      ) : undefined;

      // Update user login information
      await this.updateLoginData(user, context);

      // Send security notifications if needed
      await this.handleSecurityNotifications(user, context, session, locationAnalysis);

      // Log successful login with location data
      await this.logLoginAttempt({
        userId: user.id,
        email: request.email,
        success: true,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        timestamp: new Date(),
        deviceFingerprint: context.deviceFingerprint,
        geolocationData,
        locationAnalysis
      });

      // Track login analytics
      await this.trackLoginMetrics(user, context, Date.now() - startTime, 'success');

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: await this.toPublicUser(user),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        sessionId: session.id
      };
    } catch (error) {
      // Get geolocation data for failed attempts too
      const geolocationData = await this.getLocationData(context);
      
      // Track location for failed attempts (helps with security analysis)
      const locationAnalysis = user ? await this.geolocationService.trackLoginLocation(
        user.id,
        context.ipAddress || '',
        geolocationData
      ) : undefined;

      // Record failed login attempt with lockout service
      await this.lockoutService.recordLoginAttempt({
        userId: user?.id,
        email: request.email,
        success: false,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        timestamp: new Date(),
        failureReason: error.message
      });

      // Log failed login attempt for audit with location data
      await this.logLoginAttempt({
        userId: user?.id,
        email: request.email,
        success: false,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        timestamp: new Date(),
        failureReason: error.message,
        deviceFingerprint: context.deviceFingerprint,
        geolocationData,
        locationAnalysis
      });

      // Track failure analytics
      await this.trackLoginMetrics(user, context, Date.now() - startTime, 'failure', error.message);

      throw error;
    }
  }

  async logout(
    userId: string,
    sessionId?: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<void> {

    try {
      // Revoke tokens
      await this.tokenService.revokeAllUserTokens(userId);

      // Update session
      if (sessionId) {
        await this.revokeSession(sessionId);
      }

      // Log logout
      await this.auditService.logEvent({
        userId,
        action: AUDIT_EVENTS.LOGOUT,
        details: { sessionId },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId,
        severity: 'info'
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw - logout should always succeed
    }
  }

  async refreshSession(
    refreshToken: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<{ accessToken: string; refreshToken: string }> {

    try {
      const tokens = await this.tokenService.refreshAccessToken(refreshToken);
      
      // Update session activity
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);
      await this.updateSessionActivity(payload.sub, context);

      // Log token refresh
      await this.auditService.logEvent({
        userId: payload.sub,
        action: 'token_refreshed',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });

      return tokens;
    } catch (error) {
      // Log failed token refresh
      await this.auditService.logEvent({
        action: 'token_refresh_failed',
        details: { error: error.message },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
      
      throw error;
    }
  }

  async validateTwoFactorAuth(
    userId: string,
    token: string,
    method: 'totp' | 'sms' | 'email',
    isBackupCode: boolean = false,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<boolean> {

    try {
      await this.auditService.logEvent({
        userId,
        action: '2fa_attempted',
        details: { method, isBackupCode },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });

      if (method === 'totp') {
        // Use the TOTP service for validation
        const TOTPService = require('./TOTPService').TOTPService;
        const totpService = new TOTPService(this.db, this.redis, this.auditService);

        let result;
        if (isBackupCode) {
          result = await totpService.authenticateWithBackupCode(
            userId,
            token,
            context.ipAddress
          );
        } else {
          result = await totpService.authenticateUser(
            userId,
            token,
            context.ipAddress
          );
        }

        if (result.success) {
          await this.auditService.logEvent({
            userId,
            action: '2fa_success',
            details: { 
              method, 
              isBackupCode,
              remainingBackupCodes: result.remainingCodes 
  }
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            severity: 'info'
          });
          return true;
        } else {
          await this.auditService.logEvent({
            userId,
            action: '2fa_failed',
            details: { 
              method, 
              isBackupCode,
              reason: result.message 
  }
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            severity: 'warning'
          });
          return false;
        }
      }

      // TODO: Implement SMS and email 2FA methods
      if (method === 'sms') {
        // Placeholder for SMS OTP validation
        console.log('SMS 2FA not yet implemented');
        return false;
      }

      if (method === 'email') {
        // Placeholder for email OTP validation
        console.log('Email 2FA not yet implemented');
        return false;
      }

      return false;
    } catch (error) {
      console.error('2FA validation error:', error);
      await this.auditService.logEvent({
        userId,
        action: '2fa_error',
        details: { 
          method, 
          error: error.message 
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'error'
      });
      return false;
    }
  }

  async unlockAccount(
    email: string,
    unlockToken: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<void> {

    // Use the lockout service to verify and unlock
    const success = await this.lockoutService.verifyUnlockToken(email, unlockToken);
    if (!success) {
      throw new Error('Invalid or expired unlock token');
    }

    // Account has been unlocked by the lockout service
    // Additional logging is handled by the lockout service
  }

  async getLoginAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<LoginAnalytics> {

    const timeframes = {
      day: '1 day',
      week: '1 week',
      month: '1 month'
    };

    try {
      // Get login attempt statistics
      const attemptStats = await this.db.query(`
        SELECT 
          COUNT(*) as total_attempts,
          COUNT(*) FILTER (WHERE details->>'success' = 'true') as successful_logins,
          COUNT(*) FILTER (WHERE details->>'success' = 'false') as failed_attempts
        FROM audit_logs 
        WHERE action IN ('${AUDIT_EVENTS.LOGIN_SUCCESS}', '${AUDIT_EVENTS.LOGIN_FAILED}')
          AND created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
      `);

      // Get failure reasons
      const failureReasons = await this.db.query(`
        SELECT 
          details->>'failureReason' as reason,
          COUNT(*) as count
        FROM audit_logs 
        WHERE action = '${AUDIT_EVENTS.LOGIN_FAILED}'
          AND created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
          AND details->>'failureReason' IS NOT NULL
        GROUP BY details->>'failureReason'
        ORDER BY count DESC
        LIMIT 10
      `);

      // Get suspicious activity
      const suspiciousActivity = await this.db.query(`
        SELECT 
          action as type,
          COUNT(*) as count,
          CASE 
            WHEN action = '${AUDIT_EVENTS.BRUTE_FORCE_ATTEMPT}' THEN 'high'
            WHEN action = 'suspicious_login' THEN 'medium'
            ELSE 'low'
          END as severity
        FROM audit_logs 
        WHERE action IN ('${AUDIT_EVENTS.BRUTE_FORCE_ATTEMPT}', 'suspicious_login', 'unusual_location')
          AND created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
        GROUP BY action
        ORDER BY count DESC
      `);

      // Get device analysis
      const deviceAnalysis = await this.db.query(`
        WITH device_first_seen AS (
          SELECT 
            details->>'deviceFingerprint' as fingerprint,
            MIN(created_at) as first_seen
          FROM audit_logs 
          WHERE action = '${AUDIT_EVENTS.LOGIN_SUCCESS}'
            AND details->>'deviceFingerprint' IS NOT NULL
          GROUP BY details->>'deviceFingerprint'

        SELECT 
          COUNT(*) FILTER (WHERE first_seen >= NOW() - INTERVAL '${timeframes[timeframe]}') as new_devices,
          COUNT(*) FILTER (WHERE first_seen < NOW() - INTERVAL '${timeframes[timeframe]}') as returning_devices,
          COUNT(*) FILTER (WHERE first_seen >= NOW() - INTERVAL '1 day' AND first_seen >= NOW() - INTERVAL '${timeframes[timeframe]}') as suspicious_devices
        FROM device_first_seen
      `);

      const stats = attemptStats.rows[0] || { total_attempts: 0, successful_logins: 0, failed_attempts: 0 };
      const totalAttempts = parseInt(stats.total_attempts);
      const successfulLogins = parseInt(stats.successful_logins);
      const failedAttempts = parseInt(stats.failed_attempts);
      const successRate = totalAttempts > 0 ? successfulLogins / totalAttempts : 0;

      return {
        totalAttempts,
        successfulLogins,
        failedAttempts,
        successRate,
        topFailureReasons: failureReasons.rows.map(row => ({
          reason: row.reason,
          count: parseInt(row.count),
          percentage: totalAttempts > 0 ? Math.round((parseInt(row.count) / totalAttempts) * 100) : 0
        })),
        suspiciousActivity: suspiciousActivity.rows.map(row => ({
          type: row.type,
          description: this.getActivityDescription(row.type),
          count: parseInt(row.count),
          severity: row.severity
        })),
        deviceAnalysis: {
          newDevices: parseInt(deviceAnalysis.rows[0]?.new_devices || '0'),
          returningDevices: parseInt(deviceAnalysis.rows[0]?.returning_devices || '0'),
          suspiciousDevices: parseInt(deviceAnalysis.rows[0]?.suspicious_devices || '0')
        }
      };
    } catch (error) {
      console.error('Failed to get login analytics:', error);
      throw error;
    }
  }

  private async performSecurityChecks(
    email: string,
    context: any
  ): Promise<void> {

    // Rate limiting check
    const rateLimitResult = await this.rateLimitService.checkIPRateLimit(
      context.ipAddress || 'unknown',
      'login',
      RATE_LIMIT_RULES.login
    );

    if (!rateLimitResult.allowed) {
      await this.auditService.logEvent({
        action: AUDIT_EVENTS.BRUTE_FORCE_ATTEMPT,
        details: { 
          email: this.hashEmail(email),
          ipAddress: context.ipAddress,
          rateLimitExceeded: true
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
      
      throw new Error('Too many login attempts. Please try again later.');
    }

    // Check for suspicious patterns
    await this.detectSuspiciousActivity(email, context);
  }

  private async validateCredentials(email: string, password: string): Promise<User> {

    const user = await this.userService.getUserByEmail(email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await this.userService.verifyPassword(user, password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    return user;
  }

  private async validateUserAccount(user: User, context: any): Promise<void> {

    // Check account status
    if (user.status !== 'active') {
      throw new Error('Account is not active. Please contact support.');
    }

    // Check if account is locked
    if (user.accountLocked && user.lockedUntil && user.lockedUntil > new Date()) {
      const unlockTime = user.lockedUntil.toLocaleString();
      throw new Error(`Account is locked until ${unlockTime}. Please try again later or reset your password.`);
    }

    // Check if email is verified (optional - depends on requirements)
    if (!user.emailVerified && this.config.security.requireEmailVerification) {
      throw new Error('Please verify your email address before logging in.');
    }
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(user),
      this.tokenService.generateRefreshToken(user)
    ]);

    return { accessToken, refreshToken };
  }

  private async createSession(
    user: User,
    request: LoginRequest,
    context: any
  ): Promise<UserSession> {

    const sessionId = require('crypto').randomUUID();
    const deviceInfo = this.parseDeviceInfo(context.userAgent);
    
    const session = await this.db.query(`
      INSERT INTO user_sessions (
        id, user_id, session_token, ip_address, user_agent, 
        device_info, expires_at, created_at, last_accessed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `, [
      sessionId,
      user.id,
      sessionId,
      context.ipAddress,
      context.userAgent,
      JSON.stringify({
        ...deviceInfo,
        fingerprint: context.deviceFingerprint,
        rememberMe: request.rememberMe,
        ...request.deviceInfo
      }),
      new Date(Date.now() + (request.rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000) // 30 days or 1 day
    ]);

    return this.mapDatabaseSession(session.rows[0]);
  }

  private async updateLoginData(user: User, context: any): Promise<void> {

    await this.userService.updateUser(user.id, {
      lastLoginAt: new Date(),
      failedLoginAttempts: 0,
      accountLocked: false,
      lockedUntil: undefined
    });
  }

  private async handleSecurityNotifications(
    user: User,
    context: any,
    session: UserSession,
    locationAnalysis?: {
      isNewLocation: boolean;
      isTypicalLocation: boolean;
      distanceFromNearestKm?: number;
      suspiciousIndicators: string[];
    }
  ): Promise<void> {

    // Check for new device
    const isNewDevice = await this.isNewDevice(user.id, context.deviceFingerprint);
    
    // Check for unusual location using new geolocation analysis
    const hasLocationConcerns = locationAnalysis && (
      locationAnalysis.isNewLocation || 
      locationAnalysis.suspiciousIndicators.length > 0
    );
    const isUnusualLocation = await this.isUnusualLocation(user.id, context.geoLocation);

    if (isNewDevice || isUnusualLocation || hasLocationConcerns) {
      // Send security alert email
      await this.emailService.sendLoginAlert(user.email, {
        displayName: user.displayName,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        deviceInfo: this.formatDeviceInfo(context),
        timestamp: new Date()
      });

      // Log security event
      await this.auditService.logEvent({
        userId: user.id,
        action: 'suspicious_login',
        details: {
          reason: isNewDevice ? 'new_device' : 'unusual_location',
          deviceFingerprint: context.deviceFingerprint,
          location: context.geoLocation
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: session.id,
        severity: 'warning'
      });
    }
  }

  private async detectSuspiciousActivity(email: string, context: any): Promise<void> {

    // Check for rapid successive attempts from same IP
    const recentAttempts = await this.redis.get(`login_attempts:${context.ipAddress}`);
    if (recentAttempts && parseInt(recentAttempts) > 10) {
      await this.auditService.logEvent({
        action: 'suspicious_activity_detected',
        details: {
          type: 'rapid_attempts',
          ipAddress: context.ipAddress,
          email: this.hashEmail(email)
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
    }

    // Check for multiple email attempts from same IP
    const emailAttemptsKey = `email_attempts:${context.ipAddress}`;
    const emailAttempts = await this.redis.get(emailAttemptsKey);
    if (emailAttempts && parseInt(emailAttempts) > 5) {
      await this.auditService.logEvent({
        action: 'suspicious_activity_detected',
        details: {
          type: 'multiple_emails',
          ipAddress: context.ipAddress
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
    }
  }

  private async logLoginAttempt(attempt: LoginAttempt): Promise<void> {

    const action = attempt.success ? AUDIT_EVENTS.LOGIN_SUCCESS : AUDIT_EVENTS.LOGIN_FAILED;
    
    await this.auditService.logEvent({
      userId: attempt.userId,
      action,
      details: {
        email: this.hashEmail(attempt.email),
        success: attempt.success,
        failureReason: attempt.failureReason,
        deviceFingerprint: attempt.deviceFingerprint
  }
      ipAddress: attempt.ipAddress,
      userAgent: attempt.userAgent,
      severity: attempt.success ? 'info' : 'warning'
    });
  }

  private async trackLoginMetrics(
    user: User | null,
    context: any,
    duration: number,
    outcome: 'success' | 'failure',
    failureReason?: string
  ): Promise<void> {

    // Track in Redis for real-time metrics
    const metricsKey = `login_metrics:${new Date().toISOString().split('T')[0]}`;
    const metrics = {
      total: 1,
      success: outcome === 'success' ? 1 : 0,
      failure: outcome === 'failure' ? 1 : 0,
      averageDuration: duration
    };

    await this.redis.setex(metricsKey, 86400, JSON.stringify(metrics)); // 24 hour TTL
  }

  private async isNewDevice(userId: string, deviceFingerprint?: string): Promise<boolean> {

    if (!deviceFingerprint) return false;

    const result = await this.db.query(`
      SELECT COUNT(*) as count 
      FROM user_sessions 
      WHERE user_id = $1 
        AND device_info->>'fingerprint' = $2
        AND created_at < NOW() - INTERVAL '1 hour'
    `, [userId, deviceFingerprint]);

    return parseInt(result.rows[0]?.count || '0') === 0;
  }

  private async isUnusualLocation(userId: string, geoLocation?: any): Promise<boolean> {

    if (!geoLocation?.country) return false;

    const result = await this.db.query(`
      SELECT COUNT(*) as count 
      FROM audit_logs 
      WHERE user_id = $1 
        AND action = '${AUDIT_EVENTS.LOGIN_SUCCESS}'
        AND details->>'country' = $2
        AND created_at >= NOW() - INTERVAL '30 days'
    `, [userId, geoLocation.country]);

    return parseInt(result.rows[0]?.count || '0') === 0;
  }

  private async revokeSession(sessionId: string): Promise<void> {

    await this.db.query(`
      UPDATE user_sessions 
      SET revoked = true, revoked_at = NOW() 
      WHERE id = $1
    `, [sessionId]);
  }

  private async updateSessionActivity(userId: string, context: any): Promise<void> {

    await this.db.query(`
      UPDATE user_sessions 
      SET last_accessed_at = NOW() 
      WHERE user_id = $1 AND revoked = false
    `, [userId]);
  }

  private verifyUnlockToken(user: User, token: string): boolean {
    // Implementation would verify a secure unlock token
    // For now, this is a placeholder
    return token === `unlock_${user.id}_${user.email}`;
  }

  private parseDeviceInfo(userAgent?: string): DeviceInfo {
    if (!userAgent) {
      return { userAgent: 'unknown' };
    }

    // Basic user agent parsing (in production, use a proper library)
    const browser = this.extractBrowser(userAgent);
    const os = this.extractOS(userAgent);
    const device = this.extractDevice(userAgent);

    return {
      browser,
      os,
      device,
      userAgent
    };
  }

  private extractBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private extractOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private extractDevice(userAgent: string): string {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  private formatDeviceInfo(context: any): string {
    const deviceInfo = this.parseDeviceInfo(context.userAgent);
    return `${deviceInfo.browser} on ${deviceInfo.os} (${deviceInfo.device})`;
  }

  private getActivityDescription(activityType: string): string {
    const descriptions = {
      [AUDIT_EVENTS.BRUTE_FORCE_ATTEMPT]: 'Multiple failed login attempts detected',
      'suspicious_login': 'Login from new device or location',
      'unusual_location': 'Login from unusual geographical location',
      'rapid_attempts': 'Rapid successive login attempts',
      'multiple_emails': 'Multiple email addresses attempted from same IP'
    };

    return descriptions[activityType] || 'Suspicious activity detected';
  }

  private async toPublicUser(user: User): Promise<any> {

    // Get user profile and roles (simplified version)
    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      roles: ['user'], // Would fetch actual roles
      permissions: ['graphs:create:own'] // Would fetch actual permissions
    };
  }

  private mapDatabaseSession(row: any): UserSession {
    return {
      id: row.id,
      userId: row.user_id,
      sessionToken: row.session_token,
      refreshToken: row.refresh_token,
      deviceInfo: row.device_info ? JSON.parse(row.device_info) : undefined,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      lastAccessedAt: row.last_accessed_at,
      revoked: row.revoked,
      revokedAt: row.revoked_at
    };
  }

  private hashEmail(email: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
  }
}