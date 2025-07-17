import { randomBytes, createHash } from 'crypto';
import { z } from 'zod';
import { DatabaseService } from '../database/DatabaseService';
import { EmailService } from './EmailService';
import { AuditService } from './AuditService';
import { RateLimitService } from './RateLimitService';
import {
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetValidation,
  PasswordResetConfirmation,
  SecurityEvent,
  PasswordResetToken,
  PasswordResetAttempt,
} from '../types';

const PASSWORD_RESET_REQUEST_SCHEMA = z.object({
  email: z.string().email(),
  captchaToken: z.string().optional(),
  clientInfo: z.object({
    userAgent: z.string(),
    ipAddress: z.string(),
    fingerprint: z.string().optional(),
  }),
});

const PASSWORD_RESET_CONFIRM_SCHEMA = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
  clientInfo: z.object({
    userAgent: z.string(),
    ipAddress: z.string(),
    fingerprint: z.string().optional(),
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export class PasswordResetService {
  private readonly TOKEN_EXPIRY_HOURS = 24;
  private readonly MAX_ATTEMPTS_PER_HOUR = 3;
  private readonly MAX_TOKENS_PER_USER = 5;
  private readonly TOKEN_LENGTH = 32;

  constructor(
    private readonly db: DatabaseService,
    private readonly email: EmailService,
    private readonly audit: AuditService,
    private readonly rateLimit: RateLimitService
  ) {}

  async requestPasswordReset(
    request: PasswordResetRequest
  ): Promise<PasswordResetResponse> {
    try {
      // Validate input
      const validatedRequest = PASSWORD_RESET_REQUEST_SCHEMA.parse(request);
      const { email, clientInfo } = validatedRequest;

      // Rate limiting - per IP and per email
      await this.checkRateLimits(email, clientInfo.ipAddress);

      // Check if user exists (but don't reveal if they don't)
      const user = await this.db.findUserByEmail(email);
      
      // Always respond with success to prevent email enumeration
      const response: PasswordResetResponse = {
        success: true,
        message: 'If an account with that email exists, we\'ve sent a password reset link.',
        estimatedDelivery: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      };

      if (!user) {
        // Log attempt for non-existent user
        await this.audit.logSecurityEvent({
          type: 'PASSWORD_RESET_INVALID_EMAIL',
          userId: null,
          email,
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
          success: false,
          metadata: { reason: 'User not found' },
        });
        return response;
      }

      // Check if account is locked or suspended
      if (user.status !== 'active') {
        await this.audit.logSecurityEvent({
          type: 'PASSWORD_RESET_BLOCKED_ACCOUNT',
          userId: user.id,
          email,
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
          success: false,
          metadata: { accountStatus: user.status },
        });
        return response;
      }

      // Check existing tokens and clean up expired ones
      await this.cleanupExpiredTokens(user.id);
      const activeTokens = await this.getActiveTokens(user.id);

      if (activeTokens.length >= this.MAX_TOKENS_PER_USER) {
        // Revoke oldest token
        await this.revokeToken(activeTokens[0].token);
      }

      // Generate secure token
      const token = await this.generateSecureToken();
      const hashedToken = this.hashToken(token);
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      // Store token in database
      await this.storePasswordResetToken({
        userId: user.id,
        hashedToken,
        expiresAt,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        fingerprint: clientInfo.fingerprint,
      });

      // Send password reset email
      await this.sendPasswordResetEmail(user, token, clientInfo);

      // Log successful request
      await this.audit.logSecurityEvent({
        type: 'PASSWORD_RESET_REQUESTED',
        userId: user.id,
        email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        success: true,
        metadata: { tokenExpiresAt: expiresAt },
      });

      return response;
    } catch (error) {
      await this.audit.logSecurityEvent({
        type: 'PASSWORD_RESET_ERROR',
        userId: null,
        email: request.email,
        ipAddress: request.clientInfo.ipAddress,
        userAgent: request.clientInfo.userAgent,
        success: false,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  async validatePasswordResetToken(token: string): Promise<PasswordResetValidation> {
    try {
      const hashedToken = this.hashToken(token);
      const tokenRecord = await this.getTokenRecord(hashedToken);

      if (!tokenRecord || tokenRecord.usedAt || tokenRecord.revokedAt) {
        return {
          valid: false,
          error: 'Invalid or expired reset token',
          canRetry: false,
        };
      }

      if (new Date() > tokenRecord.expiresAt) {
        await this.revokeToken(token);
        return {
          valid: false,
          error: 'Reset token has expired',
          canRetry: true,
        };
      }

      const user = await this.db.findUserById(tokenRecord.userId);
      if (!user || user.status !== 'active') {
        return {
          valid: false,
          error: 'Account is not available for password reset',
          canRetry: false,
        };
      }

      return {
        valid: true,
        userId: user.id,
        email: user.email,
        tokenExpiresAt: tokenRecord.expiresAt,
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Failed to validate reset token',
        canRetry: true,
      };
    }
  }

  async confirmPasswordReset(
    confirmation: PasswordResetConfirmation
  ): Promise<PasswordResetResponse> {
    try {
      // Validate input
      const validatedConfirmation = PASSWORD_RESET_CONFIRM_SCHEMA.parse(confirmation);
      const { token, newPassword, clientInfo } = validatedConfirmation;

      // Validate token first
      const validation = await this.validatePasswordResetToken(token);
      if (!validation.valid || !validation.userId) {
        await this.audit.logSecurityEvent({
          type: 'PASSWORD_RESET_INVALID_TOKEN',
          userId: null,
          email: null,
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
          success: false,
          metadata: { error: validation.error },
        });
        
        throw new Error(validation.error || 'Invalid reset token');
      }

      // Get user and validate
      const user = await this.db.findUserById(validation.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check password strength
      const passwordValidation = await this.validatePasswordStrength(newPassword, user);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

      // Rate limiting for password reset confirmation
      await this.rateLimit.checkLimit(
        `password_reset_confirm:${user.id}`,
        5, // max 5 attempts
        3600 // per hour
      );

      // Hash the new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password and mark token as used
      await this.updatePasswordAndMarkTokenUsed(
        user.id,
        hashedPassword,
        token,
        clientInfo
      );

      // Invalidate all sessions for this user
      await this.invalidateAllUserSessions(user.id);

      // Send confirmation email
      await this.sendPasswordResetConfirmationEmail(user, clientInfo);

      // Log successful password reset
      await this.audit.logSecurityEvent({
        type: 'PASSWORD_RESET_COMPLETED',
        userId: user.id,
        email: user.email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        success: true,
        metadata: { 
          sessionsInvalidated: true,
          passwordStrengthScore: passwordValidation.score 
        },
      });

      return {
        success: true,
        message: 'Password has been reset successfully. Please log in with your new password.',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await this.audit.logSecurityEvent({
        type: 'PASSWORD_RESET_FAILED',
        userId: null,
        email: null,
        ipAddress: confirmation.clientInfo.ipAddress,
        userAgent: confirmation.clientInfo.userAgent,
        success: false,
        metadata: { error: errorMessage },
      });

      throw new Error(errorMessage);
    }
  }

  async revokePasswordResetToken(token: string, userId: string): Promise<void> {
    const hashedToken = this.hashToken(token);
    await this.db.query(
      'UPDATE password_reset_tokens SET revoked_at = NOW() WHERE hashed_token = $1 AND user_id = $2',
      [hashedToken, userId]
    );
  }

  async getPasswordResetAttempts(userId: string, hours: number = 24): Promise<PasswordResetAttempt[]> {
    const result = await this.db.query(`
      SELECT 
        prt.created_at,
        prt.ip_address,
        prt.user_agent,
        prt.used_at IS NOT NULL as completed,
        prt.revoked_at IS NOT NULL as revoked
      FROM password_reset_tokens prt
      WHERE prt.user_id = $1 
        AND prt.created_at > NOW() - INTERVAL '${hours} hours'
      ORDER BY prt.created_at DESC
    `, [userId]);

    return result.rows.map(row => ({
      timestamp: row.created_at,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      completed: row.completed,
      revoked: row.revoked,
    }));
  }

  private async checkRateLimits(email: string, ipAddress: string): Promise<void> {
    // Rate limit by IP address
    await this.rateLimit.checkLimit(
      `password_reset_ip:${ipAddress}`,
      this.MAX_ATTEMPTS_PER_HOUR,
      3600
    );

    // Rate limit by email
    await this.rateLimit.checkLimit(
      `password_reset_email:${email}`,
      this.MAX_ATTEMPTS_PER_HOUR,
      3600
    );
  }

  private async generateSecureToken(): Promise<string> {
    return randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async storePasswordResetToken(tokenData: {
    userId: string;
    hashedToken: string;
    expiresAt: Date;
    ipAddress: string;
    userAgent: string;
    fingerprint?: string;
  }): Promise<void> {
    await this.db.query(`
      INSERT INTO password_reset_tokens (
        user_id, hashed_token, expires_at, ip_address, user_agent, fingerprint
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      tokenData.userId,
      tokenData.hashedToken,
      tokenData.expiresAt,
      tokenData.ipAddress,
      tokenData.userAgent,
      tokenData.fingerprint,
    ]);
  }

  private async getTokenRecord(hashedToken: string): Promise<PasswordResetToken | null> {
    const result = await this.db.query(`
      SELECT user_id, hashed_token, expires_at, used_at, revoked_at, created_at
      FROM password_reset_tokens
      WHERE hashed_token = $1
    `, [hashedToken]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      userId: row.user_id,
      hashedToken: row.hashed_token,
      expiresAt: row.expires_at,
      usedAt: row.used_at,
      revokedAt: row.revoked_at,
      createdAt: row.created_at,
    };
  }

  private async getActiveTokens(userId: string): Promise<PasswordResetToken[]> {
    const result = await this.db.query(`
      SELECT user_id, hashed_token, expires_at, used_at, revoked_at, created_at
      FROM password_reset_tokens
      WHERE user_id = $1 
        AND used_at IS NULL 
        AND revoked_at IS NULL 
        AND expires_at > NOW()
      ORDER BY created_at ASC
    `, [userId]);

    return result.rows.map(row => ({
      userId: row.user_id,
      hashedToken: row.hashed_token,
      expiresAt: row.expires_at,
      usedAt: row.used_at,
      revokedAt: row.revoked_at,
      createdAt: row.created_at,
    }));
  }

  private async cleanupExpiredTokens(userId: string): Promise<void> {
    await this.db.query(`
      DELETE FROM password_reset_tokens
      WHERE user_id = $1 AND expires_at < NOW()
    `, [userId]);
  }

  private async revokeToken(token: string): Promise<void> {
    const hashedToken = this.hashToken(token);
    await this.db.query(
      'UPDATE password_reset_tokens SET revoked_at = NOW() WHERE hashed_token = $1',
      [hashedToken]
    );
  }

  private async validatePasswordStrength(password: string, user: any): Promise<{
    valid: boolean;
    message: string;
    score: number;
  }> {
    // Basic password requirements
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long', score: 0 };
    }

    if (password.length > 128) {
      return { valid: false, message: 'Password must be less than 128 characters', score: 0 };
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', 'dragon'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      return { valid: false, message: 'Password is too common. Please choose a stronger password.', score: 1 };
    }

    // Check if password contains user information
    if (user.email && password.toLowerCase().includes(user.email.split('@')[0].toLowerCase())) {
      return { valid: false, message: 'Password cannot contain your email address', score: 1 };
    }

    // Calculate password strength score (1-5)
    let score = 1;
    
    // Length bonus
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    
    // Character variety
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Require minimum score of 3
    if (score < 3) {
      return {
        valid: false,
        message: 'Password must contain uppercase, lowercase, numbers, and be at least 12 characters long',
        score
      };
    }

    return { valid: true, message: 'Password strength is acceptable', score };
  }

  private async hashPassword(password: string): Promise<string> {
    const argon2 = await import('argon2');
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  private async updatePasswordAndMarkTokenUsed(
    userId: string,
    hashedPassword: string,
    token: string,
    clientInfo: any
  ): Promise<void> {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');

      // Update user password
      await client.query(
        'UPDATE users SET hashed_password = $1, password_changed_at = NOW() WHERE id = $2',
        [hashedPassword, userId]
      );

      // Mark token as used
      const hashedToken = this.hashToken(token);
      await client.query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE hashed_token = $1',
        [hashedToken]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async invalidateAllUserSessions(userId: string): Promise<void> {
    // Mark all sessions as invalid
    await this.db.query(
      'UPDATE user_sessions SET invalidated_at = NOW() WHERE user_id = $1 AND invalidated_at IS NULL',
      [userId]
    );

    // Also remove from Redis cache if using Redis for sessions
    // This would be implemented based on your session storage strategy
  }

  private async sendPasswordResetEmail(
    user: any,
    token: string,
    clientInfo: any
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    
    await this.email.sendPasswordResetEmail({
      to: user.email,
      firstName: user.first_name,
      resetUrl,
      expiresAt: new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });
  }

  private async sendPasswordResetConfirmationEmail(
    user: any,
    clientInfo: any
  ): Promise<void> {
    await this.email.sendPasswordResetConfirmationEmail({
      to: user.email,
      firstName: user.first_name,
      timestamp: new Date(),
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });
  }
}