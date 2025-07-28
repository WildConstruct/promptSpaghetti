// Epic 11 Registration Service
// Enhanced user registration with validation, email verification, and analytics

import {
  RegisterRequest,
  RegisterResponse,
  User,
  UserInvitation,
  AuthConfig
} from '../types';
import { UserService } from './UserService';
import { EmailService } from './EmailService';
import { AuditService } from './AuditService';
import { RateLimitService } from './RateLimitService';
import { DatabaseService } from '../database/DatabaseService';
import { AUDIT_EVENTS, RATE_LIMIT_RULES } from '../config';

}
export interface RegistrationAnalytics {
  totalRegistrations: number;
  dailyRegistrations: number;
  weeklyRegistrations: number;
  registrationSources: Record<string, number>;
  conversionFunnel: {
    started: number;
    emailVerified: number;
    profileCompleted: number;
    firstLogin: number;
}
  };
  dropOffPoints: Array<{
    step: string;
    count: number;
    percentage: number;
  }>;
}

}
export interface RegistrationValidation {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
}
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  suggestions: Array<{
    field: string;
    suggestion: string;
  }>;
}

export class RegistrationService {
  private userService: UserService;
  private emailService: EmailService;
  private auditService: AuditService;
  private rateLimitService: RateLimitService;
  private db: DatabaseService;
  private config: AuthConfig;

  constructor(
    config: AuthConfig,
    userService: UserService,
    emailService: EmailService,
    auditService: AuditService,
    rateLimitService: RateLimitService,
    db: DatabaseService
  ) {
    this.config = config;
    this.userService = userService;
    this.emailService = emailService;
    this.auditService = auditService;
    this.rateLimitService = rateLimitService;
    this.db = db;
  }

  async registerUser(
    request: RegisterRequest,
    context: {
      ipAddress?: string;
      userAgent?: string;
      source?: string;
      referrer?: string;
    }
  ): Promise<RegisterResponse> {

    // Rate limiting check
    const rateLimitResult = await this.rateLimitService.checkIPRateLimit(
      context.ipAddress || 'unknown',
      'register',
      RATE_LIMIT_RULES.register
    );

    if (!rateLimitResult.allowed) {
      await this.trackRegistrationEvent('rate_limited', request.email, context);
      throw new Error('Registration rate limit exceeded. Please try again later.');
    }

    // Track registration attempt
    await this.trackRegistrationEvent('started', request.email, context);

    try {
      // Enhanced validation
      const validation = await this.validateRegistration(request);
      if (!validation.isValid) {
        await this.trackRegistrationEvent('validation_failed', request.email, context, {
          errors: validation.errors
        });
        
        const error = new Error('Registration validation failed') as any;
        error.validation = validation;
        throw error;
      }

      // Handle invitation flow if token provided
      let invitation: UserInvitation | null = null;
      if (request.invitationToken) {
        invitation = await this.validateInvitation(request.invitationToken);
        if (!invitation) {
          throw new Error('Invalid or expired invitation token');
        }
        
        // Ensure email matches invitation
        if (invitation.email.toLowerCase() !== request.email.toLowerCase()) {
          throw new Error('Email does not match invitation');
        }
      }

      // Create user account
      const user = await this.userService.createUser(request);

      // Handle invitation acceptance
      if (invitation) {
        await this.acceptInvitation(invitation, user);
        await this.trackRegistrationEvent('invitation_accepted', request.email, context, {
          invitationId: invitation.id
        });
      }

      // Send email verification
      if (!user.emailVerified) {
        await this.sendEmailVerification(user, context);
      }

      // Track successful registration
      await this.trackRegistrationEvent('completed', request.email, context, {
        userId: user.id,
        source: context.source
      });

      // Log registration analytics
      await this.auditService.logEvent({
        userId: user.id,
        action: AUDIT_EVENTS.USER_CREATED,
        resourceType: 'user',
        resourceId: user.id,
        details: {
          email: user.email,
          source: context.source,
          referrer: context.referrer,
          hasInvitation: !!invitation
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });

      return {
        user: await this.toPublicUser(user),
        emailVerificationRequired: !user.emailVerified,
        nextSteps: this.getNextSteps(user, invitation)
      };
    } catch (error) {
      // Track failed registration
      await this.trackRegistrationEvent('failed', request.email, context, {
        error: error.message
      });

      throw error;
    }
  }

  async validateRegistration(request: RegisterRequest): Promise<RegistrationValidation> {

    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string; code: string }> = [];
    const suggestions: Array<{ field: string; suggestion: string }> = [];

    // Email validation
    const emailValidation = await this.validateEmail(request.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }
    if (emailValidation.warnings.length > 0) {
      warnings.push(...emailValidation.warnings);
    }
    if (emailValidation.suggestions.length > 0) {
      suggestions.push(...emailValidation.suggestions);
    }

    // Password validation
    const passwordValidation = this.validatePassword(request.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
    if (passwordValidation.warnings.length > 0) {
      warnings.push(...passwordValidation.warnings);
    }

    // Display name validation
    if (request.displayName) {
      const displayNameValidation = this.validateDisplayName(request.displayName);
      if (!displayNameValidation.isValid) {
        errors.push(...displayNameValidation.errors);
      }
    }

    // Check for suspicious patterns
    const suspiciousPatterns = this.detectSuspiciousPatterns(request);
    if (suspiciousPatterns.length > 0) {
      warnings.push(...suspiciousPatterns);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  async resendEmailVerification(
    email: string,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {

    // Rate limiting
    const rateLimitResult = await this.rateLimitService.checkIPRateLimit(
      context.ipAddress || 'unknown',
      'email_verification',
      RATE_LIMIT_RULES.emailVerification
    );

    if (!rateLimitResult.allowed) {
      throw new Error('Email verification rate limit exceeded. Please try again later.');
    }

    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    await this.sendEmailVerification(user, context);

    await this.auditService.logEvent({
      userId: user.id,
      action: 'email_verification_resent',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: 'info'
    });
  }

  async getRegistrationAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<RegistrationAnalytics> {

    const timeframes = {
      day: '1 day',
      week: '1 week',
      month: '1 month'
    };

    try {
      // Total registrations
      const totalResult = await this.db.query(`
        SELECT COUNT(*) as total FROM users WHERE status != 'deleted'
      `);

      // Recent registrations
      const recentResult = await this.db.query(`
        SELECT COUNT(*) as count FROM users 
        WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
          AND status != 'deleted'
      `);

      // Daily registrations (last 30 days)
      const dailyResult = await this.db.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM users 
        WHERE created_at >= NOW() - INTERVAL '30 days'
          AND status != 'deleted'
        GROUP BY DATE(created_at) 
        ORDER BY date DESC
      `);

      // Registration sources from audit logs
      const sourcesResult = await this.db.query(`
        SELECT 
          details->>'source' as source,
          COUNT(*) as count
        FROM audit_logs 
        WHERE action = '${AUDIT_EVENTS.USER_CREATED}'
          AND created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
          AND details->>'source' IS NOT NULL
        GROUP BY details->>'source'
        ORDER BY count DESC
      `);

      // Conversion funnel analysis
      const funnelResult = await this.db.query(`
        SELECT 
          COUNT(CASE WHEN action = 'registration_started' THEN 1 END) as started,
          COUNT(CASE WHEN action = '${AUDIT_EVENTS.EMAIL_VERIFIED}' THEN 1 END) as email_verified,
          COUNT(CASE WHEN action = 'profile_completed' THEN 1 END) as profile_completed,
          COUNT(CASE WHEN action = '${AUDIT_EVENTS.LOGIN_SUCCESS}' THEN 1 END) as first_login
        FROM audit_logs 
        WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
      `);

      // Drop-off analysis
      const dropOffResult = await this.db.query(`
        SELECT 
          action as step,
          COUNT(*) as count
        FROM audit_logs 
        WHERE action IN (
          'registration_started', 
          'registration_failed', 
          'validation_failed',
          'rate_limited'

        AND created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
        GROUP BY action
        ORDER BY count DESC
      `);

      const totalRegistrations = parseInt(totalResult.rows[0]?.total || '0');
      const recentRegistrations = parseInt(recentResult.rows[0]?.count || '0');
      const started = parseInt(funnelResult.rows[0]?.started || '0');

      return {
        totalRegistrations,
        dailyRegistrations: timeframe === 'day' ? recentRegistrations : Math.round(recentRegistrations / 7),
        weeklyRegistrations: timeframe === 'week' ? recentRegistrations : Math.round(recentRegistrations / 4),
        registrationSources: sourcesResult.rows.reduce((acc, row) => {
          acc[row.source || 'direct'] = parseInt(row.count);
          return acc;
        }, {}),
        conversionFunnel: {
          started,
          emailVerified: parseInt(funnelResult.rows[0]?.email_verified || '0'),
          profileCompleted: parseInt(funnelResult.rows[0]?.profile_completed || '0'),
          firstLogin: parseInt(funnelResult.rows[0]?.first_login || '0')
  }
        dropOffPoints: dropOffResult.rows.map(row => ({
          step: row.step,
          count: parseInt(row.count),
          percentage: started > 0 ? Math.round((parseInt(row.count) / started) * 100) : 0
        }))
      };
    } catch (error) {
      console.error('Failed to get registration analytics:', error);
      throw error;
    }
  }

  private async validateEmail(email: string): Promise<{
    isValid: boolean;
    errors: Array<{ field: string; message: string; code: string }>;
    warnings: Array<{ field: string; message: string; code: string }>;
    suggestions: Array<{ field: string; suggestion: string }>;
  }> {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address',
        code: 'INVALID_FORMAT'
      });
      return { isValid: false, errors, warnings, suggestions };
    }

    // Check if email already exists
    const existingUser = await this.userService.getUserByEmail(email);
    if (existingUser) {
      errors.push({
        field: 'email',
        message: 'An account with this email address already exists',
        code: 'EMAIL_EXISTS'
      });
      
      suggestions.push({
        field: 'email',
        suggestion: 'Try logging in instead, or use the forgot password feature'
      });
    }

    // Check for common typos in domain
    const domain = email.split('@')[1];
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const typoSuggestions = this.getSimilarDomains(domain, commonDomains);
    
    if (typoSuggestions.length > 0) {
      warnings.push({
        field: 'email',
        message: 'Please double-check your email domain',
        code: 'POSSIBLE_TYPO'
      });
      
      suggestions.push({
        field: 'email',
        suggestion: `Did you mean ${email.split('@')[0]}@${typoSuggestions[0]}?`
      });
    }

    // Check for disposable email domains
    const disposableDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
    if (disposableDomains.some(d => domain.includes(d))) {
      warnings.push({
        field: 'email',
        message: 'Temporary email addresses may cause issues with account recovery',
        code: 'DISPOSABLE_EMAIL'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private validatePassword(password: string): {
    isValid: boolean;
    errors: Array<{ field: string; message: string; code: string }>;
    warnings: Array<{ field: string; message: string; code: string }>;
  } {
    const errors = [];
    const warnings = [];

    // Length check
    if (password.length < this.config.security.passwordMinLength) {
      errors.push({
        field: 'password',
        message: `Password must be at least ${this.config.security.passwordMinLength} characters long`,
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    // Complexity checks
    if (this.config.security.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one uppercase letter',
        code: 'PASSWORD_NO_UPPERCASE'
      });
    }

    if (this.config.security.passwordRequireLowercase && !/[a-z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one lowercase letter',
        code: 'PASSWORD_NO_LOWERCASE'
      });
    }

    if (this.config.security.passwordRequireNumbers && !/\d/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one number',
        code: 'PASSWORD_NO_NUMBERS'
      });
    }

    if (this.config.security.passwordRequireSymbols && !/[^A-Za-z0-9]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one special character',
        code: 'PASSWORD_NO_SYMBOLS'
      });
    }

    // Common password check
    const commonPasswords = [
      'password', 'password123', '123456', 'qwerty', 'abc123',
      'letmein', 'monkey', '1234567890', 'dragon', 'princess'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push({
        field: 'password',
        message: 'This password is too common and not secure',
        code: 'PASSWORD_TOO_COMMON'
      });
    }

    // Password strength warning
    if (password.length < 16) {
      warnings.push({
        field: 'password',
        message: 'Consider using a longer password for better security',
        code: 'PASSWORD_COULD_BE_LONGER'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateDisplayName(displayName: string): {
    isValid: boolean;
    errors: Array<{ field: string; message: string; code: string }>;
  } {
    const errors = [];

    if (displayName.length < 2) {
      errors.push({
        field: 'displayName',
        message: 'Display name must be at least 2 characters long',
        code: 'DISPLAY_NAME_TOO_SHORT'
      });
    }

    if (displayName.length > 100) {
      errors.push({
        field: 'displayName',
        message: 'Display name must be less than 100 characters',
        code: 'DISPLAY_NAME_TOO_LONG'
      });
    }

    // Check for inappropriate content (basic implementation)
    const inappropriatePatterns = /\b(admin|moderator|support|system|null|undefined)\b/i;
    if (inappropriatePatterns.test(displayName)) {
      errors.push({
        field: 'displayName',
        message: 'This display name is not allowed',
        code: 'DISPLAY_NAME_INAPPROPRIATE'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private detectSuspiciousPatterns(request: RegisterRequest): Array<{
    field: string;
    message: string;
    code: string;
  }> {
    const warnings = [];

    // Check for bot-like patterns
    if (request.email.includes('+') && request.displayName?.toLowerCase().includes('test')) {
      warnings.push({
        field: 'general',
        message: 'Registration pattern appears automated',
        code: 'SUSPICIOUS_PATTERN'
      });
    }

    // Check for rapid-fire registrations (would need Redis tracking)
    // This would be implemented with actual suspicious pattern detection

    return warnings;
  }

  private async validateInvitation(token: string): Promise<UserInvitation | null> {

    const result = await this.db.query(`
      SELECT * FROM user_invitations 
      WHERE token = $1 
        AND expires_at > NOW() 
        AND accepted_at IS NULL
    `, [token]);

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  private async acceptInvitation(invitation: UserInvitation, user: User): Promise<void> {

    await this.db.transaction(async (client) => {
      // Mark invitation as accepted
      await client.query(`
        UPDATE user_invitations 
        SET accepted_at = NOW(), accepted_by = $1 
        WHERE id = $2
      `, [user.id, invitation.id]);

      // Assign roles from invitation
      if (invitation.roleId) {
        await client.query(`
          INSERT INTO user_roles (user_id, role_id, granted_by)
          VALUES ($1, $2, $3)
        `, [user.id, invitation.roleId, invitation.invitedBy]);
      }

      // Add to organization/team if specified
      if (invitation.teamId) {
        await client.query(`
          INSERT INTO team_members (team_id, user_id, invited_by)
          VALUES ($1, $2, $3)
        `, [invitation.teamId, user.id, invitation.invitedBy]);
      }
    });
  }

  private async sendEmailVerification(
    user: User,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {

    if (!user.emailVerificationToken) {
      throw new Error('No email verification token found');
    }

    try {
      await this.emailService.sendEmailVerification(
        user.email,
        user.emailVerificationToken,
        {
          displayName: user.displayName,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent
        }
      );

      await this.trackRegistrationEvent('email_sent', user.email, context);
    } catch (error) {
      console.error('Failed to send email verification:', error);
      // Don't throw - registration should still succeed
    }
  }

  private async trackRegistrationEvent(
    event: string,
    email: string,
    context: any,
    additionalData?: any
  ): Promise<void> {

    try {
      await this.db.query(`
        INSERT INTO registration_analytics (
          event_type, email_hash, ip_address, user_agent, 
          source, referrer, additional_data, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [
        event,
        this.hashEmail(email),
        context.ipAddress,
        context.userAgent,
        context.source,
        context.referrer,
        JSON.stringify(additionalData || {})
      ]);
    } catch (error) {
      console.error('Failed to track registration event:', error);
      // Don't throw - analytics shouldn't break registration
    }
  }

  private getSimilarDomains(domain: string, commonDomains: string[]): string[] {
    // Simple Levenshtein distance implementation for typo detection
    const getSimilarity = (a: string, b: string): number => {
      const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
      
      for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
      for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
      
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[j][i] = Math.min(
            matrix[j][i - 1] + 1,
            matrix[j - 1][i] + 1,
            matrix[j - 1][i - 1] + cost
          );
        }
      }
      
      return matrix[b.length][a.length];
    };

    return commonDomains
      .filter(commonDomain => {
        const distance = getSimilarity(domain, commonDomain);
        return distance <= 2 && distance > 0; // Similar but not exact
  }
      .slice(0, 1); // Return top suggestion
  }

  private getNextSteps(user: User, invitation: UserInvitation | null): string[] {
    const steps = [];

    if (!user.emailVerified) {
      steps.push('Check your email and click the verification link');
    }

    if (invitation) {
      if (invitation.organizationId) {
        steps.push('Complete your organization profile');
      }
      if (invitation.teamId) {
        steps.push('Meet your team members');
      }
    } else {
      steps.push('Complete your profile setup');
      steps.push('Explore the platform features');
    }

    return steps;
  }

  private async toPublicUser(user: User): Promise<any> {

    // This would use the same logic as AuthenticationService.toPublicUser
    // For now, return a simplified version
    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      roles: ['user'], // Default role
      permissions: ['graphs:create:own', 'graphs:read:own']
    };
  }

  private hashEmail(email: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
  }
}