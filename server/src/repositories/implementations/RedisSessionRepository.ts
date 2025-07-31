import { createClient, RedisClientType } from 'redis';
import { SessionRepository, Session, CreateSessionRequest } from '../interfaces/SessionRepository';
import { UserId } from '../../types';

/**
 * Redis implementation of SessionRepository for session data with appropriate TTL
 */
export class RedisSessionRepository implements SessionRepository {
  private static readonly DEFAULT_TTL_SECONDS = 24 * 60 * 60; // 24 hours
  private static readonly SESSION_PREFIX = 'session:';
  private static readonly USER_SESSIONS_PREFIX = 'user_sessions:';

  constructor(private redis: RedisClientType) {}

  async create(request: CreateSessionRequest): Promise<string> {
    const sessionId = this.generateSessionId();
    const ttl = request.ttlSeconds || RedisSessionRepository.DEFAULT_TTL_SECONDS;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl * 1000);

    const session: Session = {
      id: sessionId,
      userId: request.userId,
      userAgent: request.userAgent,
      ipAddress: request.ipAddress,
      createdAt: now,
      lastAccessedAt: now,
      expiresAt: expiresAt,
      isActive: true,
      metadata: request.metadata || {},
    };

    const sessionKey = this.getSessionKey(sessionId);
    const userSessionsKey = this.getUserSessionsKey(request.userId);

    // Store session data with TTL
    await this.redis.setEx(sessionKey, ttl, JSON.stringify(session));

    // Add session to user's session list
    await this.redis.sAdd(userSessionsKey, sessionId);
    await this.redis.expire(userSessionsKey, ttl);

    return sessionId;
  }

  async findById(sessionId: string): Promise<Session | null> {
    const sessionKey = this.getSessionKey(sessionId);
    const data = await this.redis.get(sessionKey);

    if (!data || typeof data !== 'string') return null;

    const session = JSON.parse(data) as Session;

    // Convert date strings back to Date objects
    return {
      ...session,
      createdAt: new Date(session.createdAt),
      lastAccessedAt: new Date(session.lastAccessedAt),
      expiresAt: new Date(session.expiresAt),
    };
  }

  async update(sessionId: string, updates: Partial<Session>): Promise<boolean> {
    const session = await this.findById(sessionId);
    if (!session) return false;

    const updatedSession = {
      ...session,
      ...updates,
      lastAccessedAt: new Date(),
    };

    const sessionKey = this.getSessionKey(sessionId);
    const ttl = await this.redis.ttl(sessionKey);

    if (ttl <= 0) return false; // Session already expired

    await this.redis.setEx(sessionKey, ttl, JSON.stringify(updatedSession));
    return true;
  }

  async delete(sessionId: string): Promise<boolean> {
    const session = await this.findById(sessionId);
    if (!session) return false;

    const sessionKey = this.getSessionKey(sessionId);
    const userSessionsKey = this.getUserSessionsKey(session.userId);

    // Remove session data
    const deleted = await this.redis.del(sessionKey);

    // Remove from user's session list
    await this.redis.sRem(userSessionsKey, sessionId);

    return deleted > 0;
  }

  async findByUser(userId: UserId): Promise<Session[]> {
    const userSessionsKey = this.getUserSessionsKey(userId);
    const sessionIds = await this.redis.sMembers(userSessionsKey);

    const sessions: Session[] = [];
    for (const sessionId of sessionIds) {
      const session = await this.findById(sessionId);
      if (session && session.isActive) {
        sessions.push(session);
      } else if (!session) {
        // Clean up expired session from user's list
        await this.redis.sRem(userSessionsKey, sessionId);
      }
    }

    // Sort by last accessed, most recent first
    return sessions.sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime());
  }

  async deleteAllForUser(userId: UserId): Promise<boolean> {
    const userSessionsKey = this.getUserSessionsKey(userId);
    const sessionIds = await this.redis.sMembers(userSessionsKey);

    if (sessionIds.length === 0) return true;

    // Delete all session data
    const sessionKeys = sessionIds.map(id => this.getSessionKey(id));
    await this.redis.del(sessionKeys);

    // Clear user's session list
    await this.redis.del(userSessionsKey);

    return true;
  }

  async extend(sessionId: string, ttlSeconds?: number): Promise<boolean> {
    const session = await this.findById(sessionId);
    if (!session) return false;

    const newTtl = ttlSeconds || RedisSessionRepository.DEFAULT_TTL_SECONDS;
    const sessionKey = this.getSessionKey(sessionId);
    const userSessionsKey = this.getUserSessionsKey(session.userId);

    // Update session expiration
    session.expiresAt = new Date(Date.now() + newTtl * 1000);
    session.lastAccessedAt = new Date();

    await this.redis.setEx(sessionKey, newTtl, JSON.stringify(session));
    await this.redis.expire(userSessionsKey, newTtl);

    return true;
  }

  async isValid(sessionId: string): Promise<boolean> {
    const sessionKey = this.getSessionKey(sessionId);
    const exists = await this.redis.exists(sessionKey);

    if (!exists) return false;

    const session = await this.findById(sessionId);
    return session !== null && session.isActive && session.expiresAt > new Date();
  }

  async cleanupExpired(): Promise<number> {
    // Redis automatically handles TTL expiration, but we can clean up user session lists
    const pattern = `${RedisSessionRepository.USER_SESSIONS_PREFIX}*`;
    const keys = await this.redis.keys(pattern);

    let cleanedCount = 0;

    for (const userSessionsKey of keys) {
      const sessionIds = await this.redis.sMembers(userSessionsKey);

      for (const sessionId of sessionIds) {
        const sessionKey = this.getSessionKey(sessionId);
        const exists = await this.redis.exists(sessionKey);

        if (!exists) {
          await this.redis.sRem(userSessionsKey, sessionId);
          cleanedCount++;
        }
      }

      // If no sessions left, remove the user sessions key
      const remainingCount = await this.redis.sCard(userSessionsKey);
      if (remainingCount === 0) {
        await this.redis.del(userSessionsKey);
      }
    }

    return cleanedCount;
  }

  private getSessionKey(sessionId: string): string {
    return `${RedisSessionRepository.SESSION_PREFIX}${sessionId}`;
  }

  private getUserSessionsKey(userId: UserId): string {
    return `${RedisSessionRepository.USER_SESSIONS_PREFIX}${userId}`;
  }

  private generateSessionId(): string {
    // Generate a secure session ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2);
    return `sess_${timestamp}_${random}`;
  }
}

/**
 * In-memory session repository for testing or single-instance deployments
 */
export class MemorySessionRepository implements SessionRepository {
  private sessions = new Map<string, Session>();
  private userSessions = new Map<UserId, Set<string>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpired();
      },
      5 * 60 * 1000
    );
  }

  async create(request: CreateSessionRequest): Promise<string> {
    const sessionId = this.generateSessionId();
    const ttl = request.ttlSeconds || 24 * 60 * 60; // 24 hours
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl * 1000);

    const session: Session = {
      id: sessionId,
      userId: request.userId,
      userAgent: request.userAgent,
      ipAddress: request.ipAddress,
      createdAt: now,
      lastAccessedAt: now,
      expiresAt: expiresAt,
      isActive: true,
      metadata: request.metadata || {},
    };

    this.sessions.set(sessionId, session);

    if (!this.userSessions.has(request.userId)) {
      this.userSessions.set(request.userId, new Set());
    }
    this.userSessions.get(request.userId)!.add(sessionId);

    return sessionId;
  }

  async findById(sessionId: string): Promise<Session | null> {
    const session = this.sessions.get(sessionId);

    if (!session || session.expiresAt <= new Date()) {
      return null;
    }

    return session;
  }

  async update(sessionId: string, updates: Partial<Session>): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || session.expiresAt <= new Date()) {
      return false;
    }

    const updatedSession = {
      ...session,
      ...updates,
      lastAccessedAt: new Date(),
    };

    this.sessions.set(sessionId, updatedSession);
    return true;
  }

  async delete(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    this.sessions.delete(sessionId);

    const userSessionSet = this.userSessions.get(session.userId);
    if (userSessionSet) {
      userSessionSet.delete(sessionId);
      if (userSessionSet.size === 0) {
        this.userSessions.delete(session.userId);
      }
    }

    return true;
  }

  async findByUser(userId: UserId): Promise<Session[]> {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) return [];

    const sessions: Session[] = [];
    for (const sessionId of sessionIds) {
      const session = await this.findById(sessionId);
      if (session && session.isActive) {
        sessions.push(session);
      }
    }

    return sessions.sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime());
  }

  async deleteAllForUser(userId: UserId): Promise<boolean> {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) return true;

    for (const sessionId of sessionIds) {
      this.sessions.delete(sessionId);
    }

    this.userSessions.delete(userId);
    return true;
  }

  async extend(sessionId: string, ttlSeconds?: number): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const newTtl = ttlSeconds || 24 * 60 * 60;
    session.expiresAt = new Date(Date.now() + newTtl * 1000);
    session.lastAccessedAt = new Date();

    return true;
  }

  async isValid(sessionId: string): Promise<boolean> {
    const session = await this.findById(sessionId);
    return session !== null && session.isActive;
  }

  async cleanupExpired(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions) {
      if (session.expiresAt <= now) {
        await this.delete(sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2);
    return `sess_${timestamp}_${random}`;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
