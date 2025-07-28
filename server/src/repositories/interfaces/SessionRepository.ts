import { UserId } from '../../types';

/**
 * Repository interface for user session handling with Redis integration
 */
}
export interface SessionRepository {
  /**
   * Create a new session
   */
  create(sessionData: CreateSessionRequest): Promise<string>;

  /**
   * Find session by ID
   */
  findById(sessionId: string): Promise<Session | null>;

  /**
   * Update session data
   */
  update(sessionId: string, updates: Partial<Session>): Promise<boolean>;

  /**
   * Delete a session (logout)
   */
  delete(sessionId: string): Promise<boolean>;

  /**
   * Find all sessions for a user
   */
  findByUser(userId: UserId): Promise<Session[]>;

  /**
   * Delete all sessions for a user (logout all devices)
   */
  deleteAllForUser(userId: UserId): Promise<boolean>;

  /**
   * Extend session TTL
   */
  extend(sessionId: string, ttlSeconds?: number): Promise<boolean>;

  /**
   * Check if session is valid and not expired
   */
  isValid(sessionId: string): Promise<boolean>;

  /**
   * Clean up expired sessions
   */
  cleanupExpired(): Promise<number>;
}
}

/**
 * Session data structure
 */
}
export interface Session {
  id: string;
  userId: UserId;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  lastAccessedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}
}

/**
 * Request for creating a new session
 */
}
export interface CreateSessionRequest {
  userId: UserId;
  userAgent?: string;
  ipAddress?: string;
  ttlSeconds?: number;
  metadata?: Record<string, any>;
}
}