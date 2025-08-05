// Epic 11 Session Service - Refactored with BaseService pattern
// Comprehensive session management with multi-device support

import { BaseService, Singleton } from '../../shared';
import { AuthConfig, UserSession } from '../types';
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
  lastActivity: Date;
  location?: any;
}

/**
 * Refactored SessionService using BaseService pattern
 * Eliminates duplicate imports and provides consistent functionality
 */
@Singleton
export class SessionService extends BaseService {
  private config: AuthConfig;
  private tokenService: TokenService;
  
  // Cache TTLs
  private readonly SESSION_TTL = 3600; // 1 hour
  private readonly ACTIVE_SESSIONS_TTL = 300; // 5 minutes

  constructor(config?: AuthConfig) {
    super();
    this.config = config || this.loadDefaultConfig();
    this.tokenService = new TokenService(this.config);
  }

  /**
   * Create a new session
   */
  async createSession(data: SessionData): Promise<UserSession> {
    return this.withTransaction(async (trx) => {
      // Create session in database
      const session = await trx('sessions').insert({
        user_id: data.userId,
        device_fingerprint: data.deviceInfo?.fingerprint,
        user_agent: data.deviceInfo?.userAgent,
        platform: data.deviceInfo?.platform,
        browser: data.deviceInfo?.browser,
        ip_address: data.location?.ipAddress,
        country: data.location?.country,
        city: data.location?.city,
        remember_me: data.rememberMe,
        created_at: new Date(),
        last_activity: new Date(),
        expires_at: this.calculateExpiry(data.rememberMe)
      }).returning('*');

      // Cache the session
      await this.cacheSet(`session:${session[0].id}`, session[0], this.SESSION_TTL);

      // Log audit event
      await this.logAudit('session.created', data.userId, {
        sessionId: session[0].id,
        deviceInfo: data.deviceInfo,
        location: data.location
      });

      // Emit event for real-time monitoring
      this.emit('session:created', session[0]);

      return this.mapToUserSession(session[0]);
    });
  }

  /**
   * Validate a session
   */
  async validateSession(sessionId: string): Promise<SessionValidationResult> {
    try {
      // Check cache first
      const cached = await this.cacheGet<UserSession>(`session:${sessionId}`);
      if (cached) {
        return { valid: true, session: cached };
      }

      // Check database
      const session = await this.db.query()
        .from('sessions')
        .where('id', sessionId)
        .andWhere('expires_at', '>', new Date())
        .andWhere('revoked', false)
        .first();

      if (!session) {
        return { valid: false, reason: 'Session not found or expired' };
      }

      // Update last activity
      await this.updateLastActivity(sessionId);

      const userSession = this.mapToUserSession(session);
      
      // Cache for next time
      await this.cacheSet(`session:${sessionId}`, userSession, this.SESSION_TTL);

      return { valid: true, session: userSession };
    } catch (error) {
      this.handleError(error as Error, 'validateSession');
      return { valid: false, reason: 'Validation error' };
    }
  }

  /**
   * Get active sessions for a user
   */
  async getActiveSessions(userId: string): Promise<ActiveSession[]> {
    // Check cache
    const cacheKey = `active-sessions:${userId}`;
    const cached = await this.cacheGet<ActiveSession[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const sessions = await this.db.query()
      .from('sessions')
      .where('user_id', userId)
      .andWhere('expires_at', '>', new Date())
      .andWhere('revoked', false)
      .orderBy('last_activity', 'desc');

    const activeSessions = sessions.map(s => ({
      id: s.id,
      deviceInfo: {
        userAgent: s.user_agent,
        platform: s.platform,
        browser: s.browser
      },
      lastActivity: s.last_activity,
      location: {
        ipAddress: s.ip_address,
        country: s.country,
        city: s.city
      }
    }));

    // Cache the results
    await this.cacheSet(cacheKey, activeSessions, this.ACTIVE_SESSIONS_TTL);

    return activeSessions;
  }

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string, revokedBy: string): Promise<void> {
    await this.withTransaction(async (trx) => {
      const session = await trx('sessions')
        .where('id', sessionId)
        .update({
          revoked: true,
          revoked_at: new Date(),
          revoked_by: revokedBy
        })
        .returning('*');

      if (session[0]) {
        // Clear cache
        await this.cacheInvalidate(`session:${sessionId}`);
        await this.cacheInvalidate(`active-sessions:${session[0].user_id}`);

        // Log audit event
        await this.logAudit('session.revoked', revokedBy, {
          sessionId,
          userId: session[0].user_id
        });

        // Emit event
        this.emit('session:revoked', session[0]);
      }
    });
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const deleted = await this.db.query()
      .from('sessions')
      .where('expires_at', '<', new Date())
      .delete();

    this.logger.info(`Cleaned up ${deleted} expired sessions`);
    return deleted;
  }

  /**
   * Private helper methods
   */
  private calculateExpiry(rememberMe?: boolean): Date {
    const now = new Date();
    const duration = rememberMe 
      ? this.config.sessionDuration.rememberMe 
      : this.config.sessionDuration.default;
    
    return new Date(now.getTime() + duration * 1000);
  }

  private async updateLastActivity(sessionId: string): Promise<void> {
    await this.db.query()
      .from('sessions')
      .where('id', sessionId)
      .update({ last_activity: new Date() });
  }

  private mapToUserSession(dbSession: any): UserSession {
    return {
      id: dbSession.id,
      userId: dbSession.user_id,
      createdAt: dbSession.created_at,
      expiresAt: dbSession.expires_at,
      deviceInfo: {
        fingerprint: dbSession.device_fingerprint,
        userAgent: dbSession.user_agent,
        platform: dbSession.platform,
        browser: dbSession.browser
      },
      location: {
        ipAddress: dbSession.ip_address,
        country: dbSession.country,
        city: dbSession.city
      }
    };
  }

  private loadDefaultConfig(): AuthConfig {
    return {
      sessionDuration: {
        default: 3600, // 1 hour
        rememberMe: 2592000 // 30 days
      }
    } as AuthConfig;
  }
}