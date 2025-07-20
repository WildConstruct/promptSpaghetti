// Epic 11 User Service
// Core user management service with OWASP security compliance

import { randomBytes, timingSafeEqual } from 'crypto';
import * as argon2 from 'argon2';
import { IUserService, User, RegisterRequest, UserProfile, AuthConfig } from '../types';
import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from './AuditService';
import { PASSWORD_RULES, AUDIT_EVENTS } from '../config';

export class UserService implements IUserService {
  private db: DatabaseService;
  private audit: AuditService;
  private config: AuthConfig;

  constructor(config: AuthConfig, db: DatabaseService, audit: AuditService) {
    this.config = config;
    this.db = db;
    this.audit = audit;
  }

  async createUser(data: RegisterRequest): Promise<User> {
    // Validate password strength
    this.validatePassword(data.password);
    
    // Check if user already exists
    const existingUser = await this.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password using Argon2id (OWASP recommended)
    const hashedPassword = await this.hashPassword(data.password);
    
    // Generate email verification token
    const emailVerificationToken = this.generateSecureToken();
    const emailVerificationExpires = new Date(
      Date.now() + this.config.security.emailVerificationTokenExpiry * 60 * 1000
    );

    const user = await this.db.transaction(async (client) => {
      // Create user record
      const userResult = await client.query(`
        INSERT INTO users (
          email, hashed_password, email_verification_token, email_verification_expires
        ) VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [data.email, hashedPassword, emailVerificationToken, emailVerificationExpires]);

      const newUser = this.mapDatabaseUser(userResult.rows[0]);

      // Create user profile if additional data provided
      if (data.displayName || data.firstName || data.lastName) {
        await client.query(`
          INSERT INTO user_profiles (
            user_id, display_name, first_name, last_name
          ) VALUES ($1, $2, $3, $4)
        `, [newUser.id, data.displayName, data.firstName, data.lastName]);
      }

      // Assign default 'user' role
      const defaultRole = await client.query(`
        SELECT id FROM roles WHERE name = 'user' AND scope = 'global'
      `);
      
      if (defaultRole.rows.length > 0) {
        await client.query(`
          INSERT INTO user_roles (user_id, role_id)
          VALUES ($1, $2)
        `, [newUser.id, defaultRole.rows[0].id]);
      }

      return newUser;
    });

    // Log user creation
    await this.audit.logEvent({
      action: AUDIT_EVENTS.USER_CREATED,
      resourceType: 'user',
      resourceId: user.id,
      details: { email: user.email },
      severity: 'info'
    });

    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.db.query(`
      SELECT * FROM users WHERE id = $1 AND status != 'deleted'
    `, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDatabaseUser(result.rows[0]);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.query(`
      SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND status != 'deleted'
    `, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDatabaseUser(result.rows[0]);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const allowedFields = [
      'email', 'email_verified', 'last_login_at', 'failed_login_attempts',
      'account_locked', 'locked_until', 'password_reset_token',
      'password_reset_expires', 'email_verification_token',
      'email_verification_expires', 'status'
    ];

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      const dbField = this.camelToSnake(key);
      if (allowedFields.includes(dbField)) {
        updates.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    values.push(id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const updatedUser = this.mapDatabaseUser(result.rows[0]);

    // Log user update
    await this.audit.logEvent({
      userId: id,
      action: AUDIT_EVENTS.USER_UPDATED,
      resourceType: 'user',
      resourceId: id,
      details: { updatedFields: Object.keys(data) },
      severity: 'info'
    });

    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    // Soft delete - mark as deleted and clear sensitive data
    await this.db.query(`
      UPDATE users 
      SET 
        status = 'deleted',
        deleted_at = NOW(),
        hashed_password = NULL,
        email_verification_token = NULL,
        password_reset_token = NULL,
        updated_at = NOW()
      WHERE id = $1
    `, [id]);

    // Log user deletion
    await this.audit.logEvent({
      userId: id,
      action: AUDIT_EVENTS.USER_DELETED,
      resourceType: 'user',
      resourceId: id,
      severity: 'warning'
    });
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.hashedPassword) {
      return false;
    }

    try {
      // Use Argon2 verify with timing-safe comparison
      const isValid = await argon2.verify(user.hashedPassword, password);
      
      if (isValid) {
        // Reset failed login attempts on successful verification
        if (user.failedLoginAttempts > 0) {
          await this.updateUser(user.id, {
            failedLoginAttempts: 0,
            accountLocked: false,
            lockedUntil: undefined
          });
        }
      } else {
        // Increment failed login attempts
        await this.handleFailedLogin(user);
      }

      return isValid;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  async hashPassword(password: string): Promise<string> {
    try {
      // Use Argon2id with secure parameters (OWASP recommended)
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1
      });
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  async requestPasswordReset(email: string): Promise<string> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists - still return token for security
      return this.generateSecureToken();
    }

    const resetToken = this.generateSecureToken();
    const resetExpires = new Date(
      Date.now() + this.config.security.passwordResetTokenExpiry * 60 * 1000
    );

    await this.updateUser(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires
    });

    // Log password reset request
    await this.audit.logEvent({
      userId: user.id,
      action: AUDIT_EVENTS.PASSWORD_RESET_REQUESTED,
      resourceType: 'user',
      resourceId: user.id,
      severity: 'info'
    });

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    // Validate new password
    this.validatePassword(newPassword);

    const user = await this.db.query(`
      SELECT * FROM users 
      WHERE password_reset_token = $1 
        AND password_reset_expires > NOW()
        AND status = 'active'
    `, [token]);

    if (user.rows.length === 0) {
      throw new Error('Invalid or expired password reset token');
    }

    const userData = this.mapDatabaseUser(user.rows[0]);
    const hashedPassword = await this.hashPassword(newPassword);

    const updatedUser = await this.updateUser(userData.id, {
      hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      failedLoginAttempts: 0,
      accountLocked: false,
      lockedUntil: undefined
    });

    // Log password reset completion
    await this.audit.logEvent({
      userId: userData.id,
      action: AUDIT_EVENTS.PASSWORD_RESET_COMPLETED,
      resourceType: 'user',
      resourceId: userData.id,
      severity: 'info'
    });

    return updatedUser;
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.db.query(`
      SELECT * FROM users 
      WHERE email_verification_token = $1 
        AND email_verification_expires > NOW()
    `, [token]);

    if (user.rows.length === 0) {
      throw new Error('Invalid or expired email verification token');
    }

    const userData = this.mapDatabaseUser(user.rows[0]);
    
    const updatedUser = await this.updateUser(userData.id, {
      emailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined
    });

    // Log email verification
    await this.audit.logEvent({
      userId: userData.id,
      action: AUDIT_EVENTS.EMAIL_VERIFIED,
      resourceType: 'user',
      resourceId: userData.id,
      severity: 'info'
    });

    return updatedUser;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.verifyPassword(user, currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    this.validatePassword(newPassword);

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password
    await this.updateUser(userId, { hashedPassword });

    // Log password change
    await this.audit.logEvent({
      userId,
      action: AUDIT_EVENTS.PASSWORD_CHANGED,
      resourceType: 'user',
      resourceId: userId,
      severity: 'info'
    });
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const failedAttempts = user.failedLoginAttempts + 1;
    const maxAttempts = this.config.security.maxFailedLoginAttempts;

    if (failedAttempts >= maxAttempts) {
      // Lock account
      const lockedUntil = new Date(
        Date.now() + this.config.security.accountLockoutDuration * 60 * 1000
      );

      await this.updateUser(user.id, {
        failedLoginAttempts: failedAttempts,
        accountLocked: true,
        lockedUntil
      });

      // Log account lockout
      await this.audit.logEvent({
        userId: user.id,
        action: AUDIT_EVENTS.ACCOUNT_LOCKED,
        resourceType: 'user',
        resourceId: user.id,
        details: { reason: 'Too many failed login attempts' },
        severity: 'warning'
      });
    } else {
      // Just increment failed attempts
      await this.updateUser(user.id, {
        failedLoginAttempts: failedAttempts
      });
    }
  }

  private validatePassword(password: string): void {
    const rules = PASSWORD_RULES;

    if (password.length < rules.minLength) {
      throw new Error(`Password must be at least ${rules.minLength} characters long`);
    }

    if (password.length > rules.maxLength) {
      throw new Error(`Password must be no more than ${rules.maxLength} characters long`);
    }

    if (rules.requireUppercase && !/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (rules.requireLowercase && !/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (rules.requireNumbers && !/\d/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (rules.requireSymbols && !/[^A-Za-z0-9]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }

    // Check against common passwords
    if (rules.forbiddenPasswords.includes(password.toLowerCase())) {
      throw new Error('This password is too common and not allowed');
    }
  }

  private generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  private mapDatabaseUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      emailVerified: row.email_verified,
      hashedPassword: row.hashed_password,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
      failedLoginAttempts: row.failed_login_attempts,
      accountLocked: row.account_locked,
      lockedUntil: row.locked_until,
      passwordResetToken: row.password_reset_token,
      passwordResetExpires: row.password_reset_expires,
      emailVerificationToken: row.email_verification_token,
      emailVerificationExpires: row.email_verification_expires,
      status: row.status,
      deletedAt: row.deleted_at
    };
  }

  private camelToSnake(camelCase: string): string {
    return camelCase.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}