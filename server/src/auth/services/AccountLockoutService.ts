// Epic 17 - Account Lockout Service
// Implements comprehensive account lockout logic with progressive penalties

import { DatabaseService } from '../database/DatabaseService';
import { RedisService } from '../database/RedisService';
import { AuditService } from './AuditService';
import { EmailService } from './EmailService';
import { User } from '../types';

}
}
export interface LockoutConfig {
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  progressiveLockout: boolean;
  progressiveMultipliers: number[];
  resetWindowHours: number;
  notifyUser: boolean;
  notifyAdmins: boolean;
  adminEmails: string[];
  allowSelfUnlock: boolean;
  captchaThreshold: number;
}
}
}

}
}
export interface LockoutAttempt {
  userId?: string;
  email: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  failureReason?: string;
}
}
}

}
}
export interface LockoutStatus {
  isLocked: boolean;
  lockCount: number;
  failedAttempts: number;
  lockedUntil?: Date;
  canUnlock: boolean;
  nextAttemptAt?: Date;
  requiresCaptcha: boolean;
  lockoutReason: string;
}
}
}

}
}
export interface LockoutEvent {
  userId?: string;
  email: string;
  eventType: 'locked' | 'unlocked' | 'failed_attempt' | 'unlock_requested';
  lockoutLevel: number;
  duration?: number;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  adminAction?: boolean;
  unlockMethod?: 'time' | 'admin' | 'token' | 'password_reset';
}
}
}

export class AccountLockoutService {
  private db: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private emailService: EmailService;
  private config: LockoutConfig;

  constructor(
    db: DatabaseService,
    redis: RedisService,
    auditService: AuditService,
    emailService: EmailService,
    config: LockoutConfig
  ) {
    this.db = db;
    this.redis = redis;
    this.auditService = auditService;
    this.emailService = emailService;
    this.config = config;
  }

  // Record a login attempt and determine if account should be locked
  async recordLoginAttempt(attempt: LockoutAttempt): Promise<LockoutStatus> {

    const { email, success, userId } = attempt;

    // Get current lockout status
    const currentStatus = await this.getLockoutStatus(email);

    // If account is already locked, check if lock has expired
    if (currentStatus.isLocked) {
      if (currentStatus.lockedUntil && currentStatus.lockedUntil <= new Date()) {
        await this.unlockAccount(email, 'time');
        return await this.getLockoutStatus(email);
      } else {
        // Account is still locked
        await this.logLockoutEvent({
          userId,
          email,
          eventType: 'failed_attempt',
          lockoutLevel: currentStatus.lockCount,
          ipAddress: attempt.ipAddress,
          userAgent: attempt.userAgent,
          timestamp: new Date()
        });
        return currentStatus;
      }
    }

    if (success) {
      // Successful login - reset failed attempts
      await this.resetFailedAttempts(email);
      return await this.getLockoutStatus(email);
    }

    // Failed login - increment attempts and check for lockout
    const failedAttempts = await this.incrementFailedAttempts(email, attempt);

    if (failedAttempts >= this.config.maxFailedAttempts) {
      return await this.lockAccount(email, attempt);
    }

    // Not locked yet, but log the failed attempt
    await this.logLockoutEvent({
      userId,
      email,
      eventType: 'failed_attempt',
      lockoutLevel: 0,
      ipAddress: attempt.ipAddress,
      userAgent: attempt.userAgent,
      timestamp: new Date()
    });

    return await this.getLockoutStatus(email);
  }

  // Get current lockout status for an account
  async getLockoutStatus(email: string): Promise<LockoutStatus> {

    try {
      // Check database for persistent lockout data
      const result = await this.db.query(`
        SELECT 
          account_locked,
          locked_until,
          failed_login_attempts,
          lockout_count,
          last_failed_at
        FROM users 
        WHERE email = $1
      `, [email.toLowerCase()]);

      if (result.rows.length === 0) {
        return this.createDefaultStatus();
      }

      const user = result.rows[0];
      const now = new Date();
      const isLocked = user.account_locked && user.locked_until && new Date(user.locked_until) > now;
      const failedAttempts = user.failed_login_attempts || 0;
      const lockCount = user.lockout_count || 0;

      // Check if CAPTCHA is required
      const requiresCaptcha = failedAttempts >= this.config.captchaThreshold;

      // Calculate next attempt time if there's a cooldown
      let nextAttemptAt: Date | undefined;
      if (failedAttempts > 0 && failedAttempts < this.config.maxFailedAttempts) {
        const cooldownSeconds = Math.min(30 * Math.pow(2, failedAttempts - 1), 300); // Exponential backoff, max 5 minutes
        nextAttemptAt = new Date(now.getTime() + cooldownSeconds * 1000);
      }

      return {
        isLocked,
        lockCount,
        failedAttempts,
        lockedUntil: user.locked_until ? new Date(user.locked_until) : undefined,
        canUnlock: this.config.allowSelfUnlock && isLocked,
        nextAttemptAt,
        requiresCaptcha,
        lockoutReason: this.generateLockoutReason(isLocked, lockCount, failedAttempts)
      };
    } catch (error) {
      console.error('Error getting lockout status:', error);
      return this.createDefaultStatus();
    }
  }

  // Lock an account due to failed attempts
  async lockAccount(email: string, lastAttempt: LockoutAttempt): Promise<LockoutStatus> {

    try {
      // Get current lockout count for progressive penalties
      const result = await this.db.query(`
        SELECT lockout_count, user_id FROM users WHERE email = $1
      `, [email.toLowerCase()]);

      const lockCount = (result.rows[0]?.lockout_count || 0) + 1;
      const userId = result.rows[0]?.user_id;

      // Calculate lockout duration with progressive penalties
      const duration = this.calculateLockoutDuration(lockCount);
      const lockedUntil = new Date(Date.now() + duration * 60 * 1000);

      // Update database
      await this.db.query(`
        UPDATE users 
        SET 
          account_locked = true,
          locked_until = $1,
          lockout_count = $2,
          failed_login_attempts = $3,
          last_failed_at = NOW()
        WHERE email = $4
      `, [lockedUntil, lockCount, this.config.maxFailedAttempts, email.toLowerCase()]);

      // Clear Redis cache for immediate effect
      await this.clearRedisAttempts(email);

      // Log lockout event
      await this.logLockoutEvent({
        userId,
        email,
        eventType: 'locked',
        lockoutLevel: lockCount,
        duration: duration,
        ipAddress: lastAttempt.ipAddress,
        userAgent: lastAttempt.userAgent,
        timestamp: new Date()
      });

      // Send notifications
      await this.sendLockoutNotifications(email, {
        lockCount,
        duration,
        lockedUntil,
        ipAddress: lastAttempt.ipAddress,
        userAgent: lastAttempt.userAgent
      });

      return await this.getLockoutStatus(email);
    } catch (error) {
      console.error('Error locking account:', error);
      throw new Error('Failed to lock account');
    }
  }

  // Unlock an account
  async unlockAccount(
    email: string, 
    method: 'time' | 'admin' | 'token' | 'password_reset',
    adminId?: string,
    context?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {

    try {
      const result = await this.db.query(`
        SELECT user_id, lockout_count FROM users WHERE email = $1
      `, [email.toLowerCase()]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const userId = result.rows[0].user_id;
      const lockCount = result.rows[0].lockout_count || 0;

      // Update database
      await this.db.query(`
        UPDATE users 
        SET 
          account_locked = false,
          locked_until = NULL,
          failed_login_attempts = 0,
          last_failed_at = NULL
        WHERE email = $1
      `, [email.toLowerCase()]);

      // Clear Redis attempts
      await this.clearRedisAttempts(email);

      // Log unlock event
      await this.logLockoutEvent({
        userId,
        email,
        eventType: 'unlocked',
        lockoutLevel: lockCount,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        timestamp: new Date(),
        adminAction: method === 'admin',
        unlockMethod: method
      });

      // Send unlock notification
      if (this.config.notifyUser && method !== 'time') {
        await this.emailService.sendAccountUnlocked(email, {
          unlockMethod: method,
          adminId,
          timestamp: new Date(),
          ipAddress: context?.ipAddress
        });
      }

      // Audit log
      await this.auditService.logEvent({
        userId,
        action: 'account_unlocked',
        details: {
          method,
          adminId,
          lockCount,
          email: this.hashEmail(email)
  }
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        severity: 'info'
      });
    } catch (error) {
      console.error('Error unlocking account:', error);
      throw new Error('Failed to unlock account');
    }
  }

  // Generate unlock token for self-service unlock
  async generateUnlockToken(email: string): Promise<string> {

    if (!this.config.allowSelfUnlock) {
      throw new Error('Self-unlock is not allowed');
    }

    const user = await this.db.query(`
      SELECT user_id FROM users WHERE email = $1 AND account_locked = true
    `, [email.toLowerCase()]);

    if (user.rows.length === 0) {
      throw new Error('Account not found or not locked');
    }

    // Generate secure token
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token in Redis
    await this.redis.setex(`unlock_token:${email}`, 900, JSON.stringify({
      token,
      email,
      userId: user.rows[0].user_id,
      expiresAt: expiresAt.toISOString()
    }));

    // Log token generation
    await this.auditService.logEvent({
      userId: user.rows[0].user_id,
      action: 'unlock_token_generated',
      details: { email: this.hashEmail(email) },
      severity: 'info'
    });

    return token;
  }

  // Verify and use unlock token
  async verifyUnlockToken(email: string, token: string): Promise<boolean> {

    try {
      const tokenData = await this.redis.get(`unlock_token:${email}`);
      if (!tokenData) {
        return false;
      }

      const parsed = JSON.parse(tokenData);
      if (parsed.token !== token || new Date(parsed.expiresAt) < new Date()) {
        return false;
      }

      // Token is valid - unlock account
      await this.unlockAccount(email, 'token');

      // Remove used token
      await this.redis.del(`unlock_token:${email}`);

      return true;
    } catch (error) {
      console.error('Error verifying unlock token:', error);
      return false;
    }
  }

  // Get lockout statistics
  async getLockoutStatistics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    totalLockouts: number;
    activeLockouts: number;
    averageLockoutDuration: number;
    topLockoutReasons: Array<{ reason: string; count: number }>;
    lockoutsByLevel: Array<{ level: number; count: number }>;
    unlockMethods: Array<{ method: string; count: number }>;
  }> {
    const timeframes = {
      day: '1 day',
      week: '1 week',
      month: '1 month'
    };

    try {
      // Get total lockouts in timeframe
      const lockoutStats = await this.db.query(`
        SELECT 
          COUNT(*) as total_lockouts,
          AVG(EXTRACT(EPOCH FROM (unlocked_at - locked_at))/60) as avg_duration_minutes
        FROM lockout_events 
        WHERE event_type = 'locked' 
          AND timestamp >= NOW() - INTERVAL '${timeframes[timeframe]}'
      `);

      // Get active lockouts
      const activeLockouts = await this.db.query(`
        SELECT COUNT(*) as active_lockouts
        FROM users 
        WHERE account_locked = true 
          AND locked_until > NOW()
      `);

      // Get lockout reasons
      const lockoutReasons = await this.db.query(`
        SELECT 
          details->>'reason' as reason,
          COUNT(*) as count
        FROM audit_logs 
        WHERE action = 'account_locked'
          AND created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
        GROUP BY details->>'reason'
        ORDER BY count DESC
        LIMIT 5
      `);

      // Get lockouts by level
      const lockoutsByLevel = await this.db.query(`
        SELECT 
          lockout_level as level,
          COUNT(*) as count
        FROM lockout_events 
        WHERE event_type = 'locked'
          AND timestamp >= NOW() - INTERVAL '${timeframes[timeframe]}'
        GROUP BY lockout_level
        ORDER BY lockout_level
      `);

      // Get unlock methods
      const unlockMethods = await this.db.query(`
        SELECT 
          unlock_method as method,
          COUNT(*) as count
        FROM lockout_events 
        WHERE event_type = 'unlocked'
          AND timestamp >= NOW() - INTERVAL '${timeframes[timeframe]}'
          AND unlock_method IS NOT NULL
        GROUP BY unlock_method
        ORDER BY count DESC
      `);

      return {
        totalLockouts: parseInt(lockoutStats.rows[0]?.total_lockouts || '0'),
        activeLockouts: parseInt(activeLockouts.rows[0]?.active_lockouts || '0'),
        averageLockoutDuration: parseFloat(lockoutStats.rows[0]?.avg_duration_minutes || '0'),
        topLockoutReasons: lockoutReasons.rows.map(row => ({
          reason: row.reason || 'unknown',
          count: parseInt(row.count)
        })),
        lockoutsByLevel: lockoutsByLevel.rows.map(row => ({
          level: parseInt(row.level),
          count: parseInt(row.count)
        })),
        unlockMethods: unlockMethods.rows.map(row => ({
          method: row.method,
          count: parseInt(row.count)
        }))
      };
    } catch (error) {
      console.error('Error getting lockout statistics:', error);
      throw error;
    }
  }

  // Admin function to get locked accounts
  async getLockedAccounts(limit = 50, offset = 0): Promise<Array<{
    userId: string;
    email: string;
    lockedAt: Date;
    lockedUntil: Date;
    lockCount: number;
    failedAttempts: number;
    lastAttemptIp?: string;
  }>> {
    try {
      const result = await this.db.query(`
        SELECT 
          u.user_id,
          u.email,
          u.locked_until,
          u.lockout_count,
          u.failed_login_attempts,
          le.timestamp as locked_at,
          le.ip_address as last_attempt_ip
        FROM users u
        LEFT JOIN lockout_events le ON u.user_id = le.user_id 
          AND le.event_type = 'locked'
          AND le.timestamp = (
            SELECT MAX(timestamp) 
            FROM lockout_events 
            WHERE user_id = u.user_id AND event_type = 'locked'

        WHERE u.account_locked = true
        ORDER BY u.locked_until DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      return result.rows.map(row => ({
        userId: row.user_id,
        email: row.email,
        lockedAt: row.locked_at,
        lockedUntil: row.locked_until,
        lockCount: row.lockout_count || 0,
        failedAttempts: row.failed_login_attempts || 0,
        lastAttemptIp: row.last_attempt_ip
      }));
    } catch (error) {
      console.error('Error getting locked accounts:', error);
      throw error;
    }
  }

  // Private helper methods

  private async incrementFailedAttempts(email: string, attempt: LockoutAttempt): Promise<number> {

    // Use Redis for immediate counting, PostgreSQL for persistence
    const redisKey = `failed_attempts:${email}`;
    const attempts = await this.redis.incr(redisKey);
    
    // Set expiration based on reset window
    await this.redis.expire(redisKey, this.config.resetWindowHours * 3600);

    // Also update database
    await this.db.query(`
      UPDATE users 
      SET 
        failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
        last_failed_at = NOW()
      WHERE email = $1
    `, [email.toLowerCase()]);

    return attempts;
  }

  private async resetFailedAttempts(email: string): Promise<void> {

    // Clear Redis counter
    await this.redis.del(`failed_attempts:${email}`);

    // Clear database counter
    await this.db.query(`
      UPDATE users 
      SET 
        failed_login_attempts = 0,
        last_failed_at = NULL
      WHERE email = $1
    `, [email.toLowerCase()]);
  }

  private async clearRedisAttempts(email: string): Promise<void> {

    await this.redis.del(`failed_attempts:${email}`);
  }

  private calculateLockoutDuration(lockCount: number): number {
    if (!this.config.progressiveLockout) {
      return this.config.lockoutDurationMinutes;
    }

    const multiplierIndex = Math.min(lockCount - 1, this.config.progressiveMultipliers.length - 1);
    const multiplier = this.config.progressiveMultipliers[multiplierIndex] || 1;
    
    return Math.round(this.config.lockoutDurationMinutes * multiplier);
  }

  private async logLockoutEvent(event: LockoutEvent): Promise<void> {

    try {
      await this.db.query(`
        INSERT INTO lockout_events (
          user_id, email, event_type, lockout_level, duration_minutes,
          ip_address, user_agent, timestamp, admin_action, unlock_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        event.userId,
        event.email,
        event.eventType,
        event.lockoutLevel,
        event.duration,
        event.ipAddress,
        event.userAgent,
        event.timestamp,
        event.adminAction || false,
        event.unlockMethod
      ]);
    } catch (error) {
      console.error('Error logging lockout event:', error);
    }
  }

  private async sendLockoutNotifications(
    email: string, 
    lockoutInfo: {
      lockCount: number;
      duration: number;
      lockedUntil: Date;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {

    try {
      // Send user notification
      if (this.config.notifyUser) {
        await this.emailService.sendAccountLocked(email, {
          lockCount: lockoutInfo.lockCount,
          duration: lockoutInfo.duration,
          lockedUntil: lockoutInfo.lockedUntil,
          unlockUrl: this.config.allowSelfUnlock ? await this.generateUnlockUrl(email) : undefined,
          ipAddress: lockoutInfo.ipAddress,
          timestamp: new Date()
        });
      }

      // Send admin notifications for repeated lockouts
      if (this.config.notifyAdmins && lockoutInfo.lockCount >= 3) {
        for (const adminEmail of this.config.adminEmails) {
          await this.emailService.sendAdminLockoutAlert(adminEmail, {
            userEmail: email,
            lockCount: lockoutInfo.lockCount,
            duration: lockoutInfo.duration,
            ipAddress: lockoutInfo.ipAddress,
            userAgent: lockoutInfo.userAgent,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error sending lockout notifications:', error);
    }
  }

  private async generateUnlockUrl(email: string): Promise<string> {

    const token = await this.generateUnlockToken(email);
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/auth/unlock?email=${encodeURIComponent(email)}&token=${token}`;
  }

  private generateLockoutReason(isLocked: boolean, lockCount: number, failedAttempts: number): string {
    if (!isLocked) {
      if (failedAttempts > 0) {
        return `${failedAttempts} failed attempts (${this.config.maxFailedAttempts - failedAttempts} remaining)`;
      }
      return 'Account is active';
    }

    if (lockCount === 1) {
      return 'Account locked due to multiple failed login attempts';
    }

    return `Account locked (${lockCount} total lockouts) due to repeated failed attempts`;
  }

  private createDefaultStatus(): LockoutStatus {
    return {
      isLocked: false,
      lockCount: 0,
      failedAttempts: 0,
      canUnlock: false,
      requiresCaptcha: false,
      lockoutReason: 'Account is active'
    };
  }

  private hashEmail(email: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
  }
}