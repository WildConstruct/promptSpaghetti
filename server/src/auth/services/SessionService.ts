// Epic 11 Session Service
// Comprehensive session management with multi-device support

import { AuthConfig, UserSession } from '../types';
import { DatabaseService } from '../database/DatabaseService';
import { RedisService } from '../database/RedisService';
import { AuditService } from './AuditService';
import { TokenService } from './TokenService';

export interface SessionData {
  userId: string;
  deviceInfo?: {
    fingerprint?: string;
    userAgent?: string;
    platform?: string;
    browser?: string;
    version?: string;
    language?: string;
    timezone?: string;
  };
  location?: {
    ipAddress?: string;
    country?: string;
    city?: string;
    timezone?: string;
  };
  rememberMe?: boolean;
}

export interface SessionValidationResult {
  valid: boolean;
  session?: UserSession;
  reason?: string;
}

export interface ActiveSession {
  id: string;
  deviceInfo: any;
  location: any;
  lastAccessedAt: Date;
  createdAt: Date;
  current?: boolean;
}

export class SessionService {
  private config: AuthConfig;
  private dbService: DatabaseService;
  private redisService: RedisService;
  private auditService: AuditService;
  private tokenService: TokenService;

  constructor(
    config: AuthConfig,
    dbService: DatabaseService,
    redisService: RedisService,
    auditService: AuditService,
    tokenService: TokenService
  ) {
    this.config = config;
    this.dbService = dbService;
    this.redisService = redisService;
    this.auditService = auditService;
    this.tokenService = tokenService;
  }

  async createSession(sessionData: SessionData): Promise<UserSession> {
    const crypto = require('crypto');
    const sessionId = crypto.randomUUID();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    
    // Calculate expiration based on remember me setting
    const expirationHours = sessionData.rememberMe ? 24 * 30 : 24; // 30 days vs 24 hours
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    const session: UserSession = {
      id: sessionId,
      userId: sessionData.userId,
      sessionToken,
      refreshToken,
      deviceInfo: sessionData.deviceInfo || {},
      ipAddress: sessionData.location?.ipAddress,
      userAgent: sessionData.deviceInfo?.userAgent,
      expiresAt,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      revoked: false,
    };

    // Store session in database
    await this.dbService.query(`
      INSERT INTO user_sessions (
        id, user_id, session_token, refresh_token, device_info, 
        ip_address, user_agent, expires_at, created_at, last_accessed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      sessionId,
      sessionData.userId,
      sessionToken,
      refreshToken,
      JSON.stringify(sessionData.deviceInfo || {}),
      sessionData.location?.ipAddress,
      sessionData.deviceInfo?.userAgent,
      expiresAt,
      session.createdAt,
      session.lastAccessedAt,
    ]);

    // Store session in Redis for fast lookups
    await this.cacheSession(session);

    // Log session creation
    await this.auditService.logEvent({
      userId: sessionData.userId,
      action: 'session_created',
      details: {
        sessionId,
        deviceInfo: sessionData.deviceInfo,
        location: sessionData.location,
        rememberMe: sessionData.rememberMe,
      },
      ipAddress: sessionData.location?.ipAddress,
      userAgent: sessionData.deviceInfo?.userAgent,
      sessionId,
      severity: 'info',
    });

    return session;
  }

  async getSession(sessionToken: string): Promise<UserSession | null> {
    // Try Redis first for performance
    const cachedSession = await this.getCachedSession(sessionToken);
    if (cachedSession) {
      return cachedSession;
    }

    // Fallback to database
    const result = await this.dbService.query(`
      SELECT * FROM user_sessions 
      WHERE session_token = $1 AND NOT revoked AND expires_at > NOW()
    `, [sessionToken]);

    if (result.rows.length === 0) {
      return null;
    }

    const session = this.mapDatabaseToSession(result.rows[0]);
    
    // Cache the session
    await this.cacheSession(session);
    
    return session;
  }

  async validateSession(sessionToken: string): Promise<SessionValidationResult> {
    const session = await this.getSession(sessionToken);
    
    if (!session) {
      return {
        valid: false,
        reason: 'Session not found or expired',
      };
    }

    if (session.revoked) {
      return {
        valid: false,
        reason: 'Session has been revoked',
      };
    }

    if (session.expiresAt < new Date()) {
      return {
        valid: false,
        reason: 'Session has expired',
      };
    }

    return {
      valid: true,
      session,
    };
  }

  async updateSessionActivity(sessionToken: string): Promise<void> {
    const now = new Date();
    
    // Update in database
    await this.dbService.query(`
      UPDATE user_sessions 
      SET last_accessed_at = $1
      WHERE session_token = $2
    `, [now, sessionToken]);

    // Update in Redis cache
    const cachedSession = await this.getCachedSession(sessionToken);
    if (cachedSession) {
      cachedSession.lastAccessedAt = now;
      await this.cacheSession(cachedSession);
    }
  }

  async renewSession(sessionToken: string): Promise<UserSession | null> {
    const session = await this.getSession(sessionToken);
    if (!session) {
      return null;
    }

    // Extend session expiration
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    await this.dbService.query(`
      UPDATE user_sessions 
      SET expires_at = $1, last_accessed_at = $2
      WHERE session_token = $3
    `, [newExpiresAt, new Date(), sessionToken]);

    session.expiresAt = newExpiresAt;
    session.lastAccessedAt = new Date();

    // Update cache
    await this.cacheSession(session);

    // Log session renewal
    await this.auditService.logEvent({
      userId: session.userId,
      action: 'session_renewed',
      details: {
        sessionId: session.id,
        newExpiresAt,
      },
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      sessionId: session.id,
      severity: 'info',
    });

    return session;
  }

  async revokeSession(sessionToken: string, reason?: string): Promise<void> {
    const session = await this.getSession(sessionToken);
    if (!session) {
      return;
    }

    const now = new Date();
    
    // Revoke in database
    await this.dbService.query(`
      UPDATE user_sessions 
      SET revoked = true, revoked_at = $1
      WHERE session_token = $2
    `, [now, sessionToken]);

    // Remove from cache
    await this.removeCachedSession(sessionToken);

    // Revoke related tokens
    await this.tokenService.revokeSessionTokens(session.id);

    // Log session revocation
    await this.auditService.logEvent({
      userId: session.userId,
      action: 'session_revoked',
      details: {
        sessionId: session.id,
        reason: reason || 'manual_revocation',
      },
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      sessionId: session.id,
      severity: 'info',
    });
  }

  async revokeAllUserSessions(userId: string, exceptSessionId?: string): Promise<number> {
    const whereClause = exceptSessionId 
      ? 'WHERE user_id = $1 AND id != $2 AND NOT revoked'
      : 'WHERE user_id = $1 AND NOT revoked';
    
    const params = exceptSessionId ? [userId, exceptSessionId] : [userId];
    
    // Get sessions before revoking for audit logging
    const sessionsResult = await this.dbService.query(`
      SELECT id, session_token FROM user_sessions ${whereClause}
    `, params);

    const now = new Date();
    
    // Revoke sessions in database
    const result = await this.dbService.query(`
      UPDATE user_sessions 
      SET revoked = true, revoked_at = $1
      ${whereClause}
      RETURNING id
    `, [now, ...params]);

    const revokedCount = result.rows.length;

    // Remove from cache and revoke tokens
    for (const session of sessionsResult.rows) {
      await this.removeCachedSession(session.session_token);
      await this.tokenService.revokeSessionTokens(session.id);
    }

    // Log bulk session revocation
    await this.auditService.logEvent({
      userId,
      action: 'sessions_bulk_revoked',
      details: {
        revokedCount,
        exceptSessionId,
        revokedSessionIds: result.rows.map(row => row.id),
      },
      severity: 'info',
    });

    return revokedCount;
  }

  async getUserActiveSessions(userId: string): Promise<ActiveSession[]> {
    const result = await this.dbService.query(`
      SELECT id, device_info, ip_address, user_agent, last_accessed_at, created_at
      FROM user_sessions
      WHERE user_id = $1 AND NOT revoked AND expires_at > NOW()
      ORDER BY last_accessed_at DESC
    `, [userId]);

    return result.rows.map(row => ({
      id: row.id,
      deviceInfo: row.device_info || {},
      location: {
        ipAddress: row.ip_address,
      },
      lastAccessedAt: row.last_accessed_at,
      createdAt: row.created_at,
    }));
  }

  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.dbService.query(`
      DELETE FROM user_sessions 
      WHERE expires_at < NOW()
      RETURNING id
    `);

    const cleanedCount = result.rows.length;

    // Clean up corresponding cache entries
    // Note: This is a simplified approach; in production, you might want to track cache keys
    await this.redisService.deletePattern('session:*');

    if (cleanedCount > 0) {
      await this.auditService.logEvent({
        action: 'sessions_cleanup',
        details: {
          cleanedCount,
          cleanedSessionIds: result.rows.map(row => row.id),
        },
        severity: 'info',
      });
    }

    return cleanedCount;
  }

  async getSessionStats(userId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    revokedSessions: number;
  }> {
    const result = await this.dbService.query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN NOT revoked AND expires_at > NOW() THEN 1 END) as active_sessions,
        COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_sessions,
        COUNT(CASE WHEN revoked THEN 1 END) as revoked_sessions
      FROM user_sessions
      WHERE user_id = $1
    `, [userId]);

    const stats = result.rows[0];
    return {
      totalSessions: parseInt(stats.total_sessions),
      activeSessions: parseInt(stats.active_sessions),
      expiredSessions: parseInt(stats.expired_sessions),
      revokedSessions: parseInt(stats.revoked_sessions),
    };
  }

  async detectSuspiciousActivity(userId: string): Promise<{
    multipleLocations: boolean;
    unusualDevices: boolean;
    suspiciousLocations: string[];
    newDevices: any[];
  }> {
    // Get recent sessions (last 24 hours)
    const result = await this.dbService.query(`
      SELECT ip_address, device_info, created_at
      FROM user_sessions
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
    `, [userId]);

    const sessions = result.rows;
    const ipAddresses = new Set(sessions.map(s => s.ip_address).filter(Boolean));
    const devices = sessions.map(s => s.device_info || {});

    // Simple heuristics for suspicious activity
    const multipleLocations = ipAddresses.size > 3; // More than 3 different IPs
    const unusualDevices = devices.some(device => 
      device.platform && !['Windows', 'MacOS', 'Linux', 'iOS', 'Android'].includes(device.platform)
    );

    // Get user's historical locations for comparison
    const historicalResult = await this.dbService.query(`
      SELECT DISTINCT ip_address
      FROM user_sessions
      WHERE user_id = $1 AND created_at < NOW() - INTERVAL '7 days'
    `, [userId]);

    const historicalIPs = new Set(historicalResult.rows.map(row => row.ip_address));
    const suspiciousLocations = Array.from(ipAddresses).filter(ip => !historicalIPs.has(ip));

    // Detect new devices
    const newDevices = devices.filter(device => {
      // Simple device fingerprinting - in production, you'd use more sophisticated methods
      return device.fingerprint && !device.fingerprint.includes('known');
    });

    return {
      multipleLocations,
      unusualDevices,
      suspiciousLocations,
      newDevices,
    };
  }

  private async cacheSession(session: UserSession): Promise<void> {
    const cacheKey = `session:${session.sessionToken}`;
    const ttl = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);
    
    if (ttl > 0) {
      await this.redisService.setex(cacheKey, ttl, JSON.stringify(session));
    }
  }

  private async getCachedSession(sessionToken: string): Promise<UserSession | null> {
    const cacheKey = `session:${sessionToken}`;
    const cached = await this.redisService.get(cacheKey);
    
    if (!cached) {
      return null;
    }

    try {
      const sessionData = JSON.parse(cached);
      return {
        ...sessionData,
        createdAt: new Date(sessionData.createdAt),
        lastAccessedAt: new Date(sessionData.lastAccessedAt),
        expiresAt: new Date(sessionData.expiresAt),
        revokedAt: sessionData.revokedAt ? new Date(sessionData.revokedAt) : undefined,
      };
    } catch (error) {
      console.error('Error parsing cached session:', error);
      return null;
    }
  }

  private async removeCachedSession(sessionToken: string): Promise<void> {
    const cacheKey = `session:${sessionToken}`;
    await this.redisService.del(cacheKey);
  }

  private mapDatabaseToSession(row: any): UserSession {
    return {
      id: row.id,
      userId: row.user_id,
      sessionToken: row.session_token,
      refreshToken: row.refresh_token,
      deviceInfo: row.device_info || {},
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
      lastAccessedAt: new Date(row.last_accessed_at),
      revoked: row.revoked,
      revokedAt: row.revoked_at ? new Date(row.revoked_at) : undefined,
    };
  }

  // Session notification methods
  async notifyNewSession(session: UserSession): Promise<void> {
    // TODO: Implement email notification for new session
    await this.auditService.logEvent({
      userId: session.userId,
      action: 'session_notification_sent',
      details: {
        sessionId: session.id,
        type: 'new_session',
      },
      sessionId: session.id,
      severity: 'info',
    });
  }

  async notifySuspiciousActivity(userId: string, activity: any): Promise<void> {
    // TODO: Implement security alert notification
    await this.auditService.logEvent({
      userId,
      action: 'security_alert_sent',
      details: {
        type: 'suspicious_activity',
        activity,
      },
      severity: 'warning',
    });
  }
}