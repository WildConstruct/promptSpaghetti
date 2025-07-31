/**
 * TOTP Service - Epic 19 Implementation  
 * Time-based One-Time Password implementation for MFA authenticator apps
 */

import crypto from 'crypto';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import base32 from 'base32';

}
}
export interface TOTPConfiguration {
  id: string;
  userId: string;
  secret: string; // Base32 encoded secret
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: number; // Usually 6 or 8
  period: number; // Usually 30 seconds
  issuer: string;
  accountName: string;
  label: string;
  createdAt: Date;
  lastUsedAt?: Date;
  lastUsedCode?: string;
  enabled: boolean;
  backupCodes: string[];
}
}
}

}
}
export interface TOTPValidationResult {
  valid: boolean;
  timeRemaining: number; // Seconds until code expires
  usedPreviously: boolean;
  drift: number; // Time drift in periods
  message: string;
}
}
}

}
}
export interface TOTPEnrollmentData {
  configurationId: string;
  secret: string;
  qrCodeUrl: string;
  qrCodeDataUrl: string;
  manualEntryKey: string;
  backupCodes: string[];
  issuer: string;
  accountName: string;
  expiresAt: Date;
}
}
}

}
}
export interface TOTPGenerationOptions {
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: number;
  period?: number;
  issuer?: string;
  window?: number; // Clock skew tolerance in periods
}
}
}

export class TOTPService {
  private readonly defaultOptions: Required<TOTPGenerationOptions> = {
    algorithm: 'SHA1', // Most compatible with authenticator apps
    digits: 6,
    period: 30,
    issuer: 'PromptSpaghetti',
    window: 1 // Allow 1 period of clock skew (±30 seconds)
  };

  private configurations: Map<string, TOTPConfiguration> = new Map();

  constructor(
    private db: any,
    private redis: any,
    private auditService: any,
    private recoveryCodeService?: any
  ) {
    // Configure otplib defaults
    authenticator.options = {
      digits: this.defaultOptions.digits,
      step: this.defaultOptions.period,
      window: this.defaultOptions.window
    };
  }

  /**
   * Generate a new TOTP configuration for enrollment
   */
  async generateTOTPConfiguration(
    userId: string,
    accountName: string,
    options: Partial<TOTPGenerationOptions> = {}
  ): Promise<TOTPEnrollmentData> {

    const config = { ...this.defaultOptions, ...options };
    
    // Generate cryptographically secure secret (160 bits / 32 bytes for SHA1)
    const secretBytes = crypto.randomBytes(32);
    const secret = base32.encode(secretBytes).replace(/=/g, ''); // Remove padding
    
    // Generate configuration ID
    const configurationId = this.generateConfigurationId();
    
    // Format account name for display
    const formattedAccountName = this.formatAccountName(accountName);
    const label = `${config.issuer}:${formattedAccountName}`;
    
    // Generate authenticator URI for QR code
    const authenticatorUri = this.generateAuthenticatorUri({
      secret,
      accountName: formattedAccountName,
      issuer: config.issuer,
      algorithm: config.algorithm,
      digits: config.digits,
      period: config.period
    });

    // Generate QR code
    const qrCodeDataUrl = await this.generateQRCode(authenticatorUri);
    
    // Generate backup codes
    const backupCodes = await this.generateBackupCodes();
    
    // Create temporary configuration (not yet activated)
    const configuration: TOTPConfiguration = {
      id: configurationId,
      userId,
      secret,
      algorithm: config.algorithm,
      digits: config.digits,
      period: config.period,
      issuer: config.issuer,
      accountName: formattedAccountName,
      label,
      createdAt: new Date(),
      enabled: false, // Not enabled until verified
      backupCodes
    };

    // Store configuration temporarily (expires in 10 minutes)
    await this.storeTempConfiguration(configuration);

    return {
      configurationId,
      secret,
      qrCodeUrl: authenticatorUri,
      qrCodeDataUrl,
      manualEntryKey: this.formatSecretForManualEntry(secret),
      backupCodes,
      issuer: config.issuer,
      accountName: formattedAccountName,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    };
  }

  /**
   * Verify TOTP code and complete enrollment
   */
  async verifyEnrollment(
    configurationId: string,
    code: string,
    sourceIP: string = '127.0.0.1'
  ): Promise<{ success: boolean; message: string; configuration?: TOTPConfiguration }> {

    // Get temporary configuration
    const tempConfig = await this.getTempConfiguration(configurationId);
    if (!tempConfig) {
      return {
        success: false,
        message: 'Configuration not found or expired. Please restart enrollment.'
      };
    }

    // Validate the provided code
    const validation = await this.validateTOTPCode(tempConfig.secret, code, {
      algorithm: tempConfig.algorithm,
      digits: tempConfig.digits,
      period: tempConfig.period,
      window: 2 // Allow more tolerance during enrollment
    });

    if (!validation.valid) {
      return {
        success: false,
        message: validation.message
      };
    }

    // Enable the configuration
    tempConfig.enabled = true;
    tempConfig.lastUsedAt = new Date();
    tempConfig.lastUsedCode = code;

    // Store permanent configuration
    await this.storeConfiguration(tempConfig);
    
    // Remove temporary configuration
    await this.removeTempConfiguration(configurationId);

    // Log enrollment completion
    await this.logTOTPEvent({
      userId: tempConfig.userId,
      action: 'enrollment_completed',
      configurationId,
      sourceIP,
      metadata: { algorithm: tempConfig.algorithm, digits: tempConfig.digits }
    });

    return {
      success: true,
      message: 'TOTP authenticator successfully configured',
      configuration: tempConfig
    };
  }

  /**
   * Validate a TOTP code for authentication
   */
  async validateTOTPCode(
    secret: string,
    code: string,
    options: Partial<TOTPGenerationOptions> = {}
  ): Promise<TOTPValidationResult> {

    const config = { ...this.defaultOptions, ...options };
    
    // Validate code format
    if (!/^\d+$/.test(code)) {
      return {
        valid: false,
        timeRemaining: 0,
        usedPreviously: false,
        drift: 0,
        message: 'Invalid code format. Code must contain only digits.'
      };
    }

    if (code.length !== config.digits) {
      return {
        valid: false,
        timeRemaining: 0,
        usedPreviously: false,
        drift: 0,
        message: `Code must be exactly ${config.digits} digits.`
      };
    }

    // Set authenticator options for this validation
    const originalOptions = { ...authenticator.options };
    authenticator.options = {
      digits: config.digits,
      step: config.period,
      window: config.window,
      algorithm: config.algorithm.toLowerCase() as any
    };

    try {
      // Check if code is valid
      const isValid = authenticator.check(code, secret);
      
      // Calculate time remaining for current code
      const currentTime = Math.floor(Date.now() / 1000);
      const currentPeriod = Math.floor(currentTime / config.period);
      const timeRemaining = (currentPeriod + 1) * config.period - currentTime;
      
      // Calculate drift (how many periods off the code is)
      let drift = 0;
      if (isValid) {
        const expectedCode = authenticator.generate(secret);
        if (code !== expectedCode) {
          // Code is valid but not the current one, calculate drift
          for (let i = -config.window; i <= config.window; i++) {
            const testTime = currentTime + (i * config.period);
            const testCode = authenticator.generate(secret, testTime);
            if (testCode === code) {
              drift = i;
              break;
            }
          }
        }
      }

      return {
        valid: isValid,
        timeRemaining,
        usedPreviously: false, // Would check against stored used codes
        drift,
        message: isValid ? 'Code is valid' : 'Invalid or expired code'
      };
    } finally {
      // Restore original options
      authenticator.options = originalOptions;
    }
  }

  /**
   * Authenticate user with TOTP code
   */
  async authenticateUser(
    userId: string,
    code: string,
    sourceIP: string = '127.0.0.1'
  ): Promise<{ success: boolean; message: string; remainingAttempts?: number }> {

    // Get user's TOTP configurations
    const configurations = await this.getUserConfigurations(userId);
    const activeConfigs = configurations.filter(c => c.enabled);

    if (activeConfigs.length === 0) {
      return {
        success: false,
        message: 'No active TOTP configurations found'
      };
    }

    // Try each active configuration
    for (const config of activeConfigs) {
      // Check if this code was recently used to prevent replay attacks
      if (await this.wasCodeRecentlyUsed(config.id, code)) {
        continue;
      }

      const validation = await this.validateTOTPCode(config.secret, code, {
        algorithm: config.algorithm,
        digits: config.digits,
        period: config.period,
        window: this.defaultOptions.window
      });

      if (validation.valid) {
        // Update configuration with successful use
        config.lastUsedAt = new Date();
        config.lastUsedCode = code;
        await this.updateConfiguration(config);

        // Store the used code to prevent replay
        await this.storeUsedCode(config.id, code, new Date());

        // Log successful authentication
        await this.logTOTPEvent({
          userId,
          action: 'authentication_success',
          configurationId: config.id,
          sourceIP,
          metadata: { drift: validation.drift, timeRemaining: validation.timeRemaining }
        });

        return {
          success: true,
          message: 'Authentication successful'
        };
      }
    }

    // Log failed authentication
    await this.logTOTPEvent({
      userId,
      action: 'authentication_failed',
      sourceIP,
      metadata: { providedCode: code.replace(/./g, '*') }
    });

    return {
      success: false,
      message: 'Invalid or expired code'
    };
  }

  /**
   * Generate QR code for authenticator app
   */
  private async generateQRCode(uri: string): Promise<string> {

    try {
      return await QRCode.toDataURL(uri, {
        type: 'image/png',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
  }
        errorCorrectionLevel: 'H',
        width: 256
      });
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Generate authenticator URI
   */
  private generateAuthenticatorUri(params: {
    secret: string;
    accountName: string;
    issuer: string;
    algorithm: string;
    digits: number;
    period: number;
  }): string {
    const { secret, accountName, issuer, algorithm, digits, period } = params;
    
    // Encode components for URI
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedAccount = encodeURIComponent(accountName);
    const label = `${encodedIssuer}:${encodedAccount}`;
    
    const uri = new URL(`otpauth://totp/${label}`);
    uri.searchParams.set('secret', secret);
    uri.searchParams.set('issuer', issuer);
    uri.searchParams.set('algorithm', algorithm);
    uri.searchParams.set('digits', digits.toString());
    uri.searchParams.set('period', period.toString());
    
    return uri.toString();
  }

  /**
   * Format secret for manual entry
   */
  private formatSecretForManualEntry(secret: string): string {
    // Insert spaces every 4 characters for readability
    return secret.replace(/(.{4})/g, '$1 ').trim();
  }

  /**
   * Format account name
   */
  private formatAccountName(accountName: string): string {
    // Remove special characters and normalize
    return accountName.replace(/[^a-zA-Z0-9@._-]/g, '').toLowerCase();
  }

  /**
   * Generate backup codes
   */
  private async generateBackupCodes(): Promise<string[]> {

    if (this.recoveryCodeService) {
      // Use the recovery code service if available
      return Array.from({ length: 10 }, () => this.generateBackupCode());
    }
    
    // Generate simple backup codes
    return Array.from({ length: 10 }, () => this.generateBackupCode());
  }

  private generateBackupCode(): string {
    // Generate 8-character backup code
    const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // Exclude confusing characters
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[crypto.randomInt(0, chars.length)];
    }
    return code;
  }

  private generateConfigurationId(): string {
    return `TOTP-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  }

  // Database interaction methods
  
  private async storeTempConfiguration(config: TOTPConfiguration): Promise<void> {

    try {
      await this.db.query(`
        INSERT INTO temp_totp_configurations (
          id, user_id, secret, algorithm, digits, period, issuer, 
          account_name, label, backup_codes, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          secret = $3, algorithm = $4, digits = $5, period = $6,
          issuer = $7, account_name = $8, label = $9, backup_codes = $10,
          expires_at = $11
      `, [
        config.id, config.userId, config.secret, config.algorithm,
        config.digits, config.period, config.issuer, config.accountName,
        config.label, JSON.stringify(config.backupCodes),
        new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
      ]);
    } catch (error) {
      console.error('Error storing temp TOTP configuration:', error);
      throw new Error('Failed to store temporary configuration');
    }
  }

  private async getTempConfiguration(configId: string): Promise<TOTPConfiguration | null> {

    try {
      const result = await this.db.query(`
        SELECT * FROM temp_totp_configurations 
        WHERE id = $1 AND expires_at > NOW()
      `, [configId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        secret: row.secret,
        algorithm: row.algorithm,
        digits: row.digits,
        period: row.period,
        issuer: row.issuer,
        accountName: row.account_name,
        label: row.label,
        createdAt: row.created_at,
        enabled: false, // Temp configs are never enabled
        backupCodes: JSON.parse(row.backup_codes)
      };
    } catch (error) {
      console.error('Error getting temp TOTP configuration:', error);
      return null;
    }
  }

  private async removeTempConfiguration(configId: string): Promise<void> {

    try {
      await this.db.query(`
        DELETE FROM temp_totp_configurations WHERE id = $1
      `, [configId]);
    } catch (error) {
      console.error('Error removing temp TOTP configuration:', error);
    }
  }

  private async storeConfiguration(config: TOTPConfiguration): Promise<void> {

    try {
      await this.db.query(`
        INSERT INTO user_totp_secrets (
          user_id, secret, algorithm, digits, period, issuer, 
          account_name, label, is_enabled, backup_codes, 
          used_backup_codes, last_used_at, last_used_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (user_id) DO UPDATE SET
          secret = $2, algorithm = $3, digits = $4, period = $5,
          issuer = $6, account_name = $7, label = $8, is_enabled = $9,
          backup_codes = $10, used_backup_codes = $11, 
          last_used_at = $12, last_used_code = $13
      `, [
        config.userId, config.secret, config.algorithm, config.digits,
        config.period, config.issuer, config.accountName, config.label,
        config.enabled, JSON.stringify(config.backupCodes),
        JSON.stringify([]), config.lastUsedAt, config.lastUsedCode
      ]);
    } catch (error) {
      console.error('Error storing TOTP configuration:', error);
      throw new Error('Failed to store TOTP configuration');
    }
  }

  private async updateConfiguration(config: TOTPConfiguration): Promise<void> {

    try {
      await this.db.query(`
        UPDATE user_totp_secrets SET
          last_used_at = $1, last_used_code = $2
        WHERE user_id = $3
      `, [config.lastUsedAt, config.lastUsedCode, config.userId]);
    } catch (error) {
      console.error('Error updating TOTP configuration:', error);
    }
  }

  private async getUserConfigurations(userId: string): Promise<TOTPConfiguration[]> {

    try {
      const result = await this.db.query(`
        SELECT * FROM user_totp_secrets WHERE user_id = $1
      `, [userId]);

      return result.rows.map((row: any) => ({
        id: row.id.toString(),
        userId: row.user_id,
        secret: row.secret,
        algorithm: row.algorithm,
        digits: row.digits,
        period: row.period,
        issuer: row.issuer,
        accountName: row.account_name,
        label: row.label,
        createdAt: row.created_at,
        lastUsedAt: row.last_used_at,
        lastUsedCode: row.last_used_code,
        enabled: row.is_enabled,
        backupCodes: JSON.parse(row.backup_codes || '[]')
      }));
    } catch (error) {
      console.error('Error getting user TOTP configurations:', error);
      return [];
    }
  }

  private async wasCodeRecentlyUsed(configId: string, code: string): Promise<boolean> {

    try {
      // Check if this exact code was used recently
      const codeHash = crypto.createHash('sha256').update(code).digest('hex');
      const result = await this.db.query(`
        SELECT COUNT(*) as count FROM used_totp_codes 
        WHERE config_id = $1 AND code_hash = $2 AND expires_at > NOW()
      `, [parseInt(configId), codeHash]);

      return parseInt(result.rows[0]?.count || '0') > 0;
    } catch (error) {
      console.error('Error checking used code:', error);
      return false;
    }
  }

  private async storeUsedCode(configId: string, code: string, usedAt: Date): Promise<void> {

    try {
      const codeHash = crypto.createHash('sha256').update(code).digest('hex');
      await this.db.query(`
        INSERT INTO used_totp_codes (config_id, code_hash, used_at, expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (config_id, code_hash) DO NOTHING
      `, [
        parseInt(configId), codeHash, usedAt,
        new Date(usedAt.getTime() + 2 * 60 * 1000) // 2 minutes expiry
      ]);
    } catch (error) {
      console.error('Error storing used code:', error);
    }
  }

  private async logTOTPEvent(event: {
    userId: string;
    action: string;
    configurationId?: string;
    sourceIP?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {

    try {
      // Log to TOTP events table
      await this.db.query(`
        INSERT INTO totp_events (
          user_id, configuration_id, action, ip_address, metadata
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        event.userId, event.configurationId, event.action,
        event.sourceIP, JSON.stringify(event.metadata || {})
      ]);

      // Also log to audit service
      await this.auditService.logEvent({
        userId: event.userId,
        action: `totp_${event.action}`,
        details: {
          configurationId: event.configurationId,
          ...event.metadata
  }
        ipAddress: event.sourceIP,
        severity: event.action.includes('failed') ? 'warning' : 'info'
      });
    } catch (error) {
      console.error('Error logging TOTP event:', error);
    }
  }

  // Public utility methods

  /**
   * Get current TOTP code for testing/debugging (admin only)
   */
  async getCurrentCode(secret: string, options: Partial<TOTPGenerationOptions> = {}): Promise<string> {

    const config = { ...this.defaultOptions, ...options };
    
    const originalOptions = { ...authenticator.options };
    authenticator.options = {
      digits: config.digits,
      step: config.period,
      algorithm: config.algorithm.toLowerCase() as any
    };

    try {
      return authenticator.generate(secret);
    } finally {
      authenticator.options = originalOptions;
    }
  }

  /**
   * Get time remaining for current code
   */
  getTimeRemaining(period: number = 30): number {
    const currentTime = Math.floor(Date.now() / 1000);
    const currentPeriod = Math.floor(currentTime / period);
    return (currentPeriod + 1) * period - currentTime;
  }

  /**
   * Disable TOTP configuration
   */
  async disableConfiguration(userId: string, reason: string): Promise<void> {

    try {
      await this.db.query(`
        UPDATE user_totp_secrets SET is_enabled = false WHERE user_id = $1
      `, [userId]);

      await this.db.query(`
        UPDATE users SET two_factor_enabled = false, two_factor_method = NULL
        WHERE user_id = $1
      `, [userId]);
      
      await this.logTOTPEvent({
        userId,
        action: 'configuration_disabled',
        metadata: { reason }
      });
    } catch (error) {
      console.error('Error disabling TOTP configuration:', error);
      throw new Error('Failed to disable TOTP configuration');
    }
  }

  /**
   * Regenerate backup codes for a user
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {

    try {
      const backupCodes = await this.generateBackupCodes();
      
      await this.db.query(`
        UPDATE user_totp_secrets 
        SET backup_codes = $1, used_backup_codes = '[]'::jsonb
        WHERE user_id = $2 AND is_enabled = true
      `, [JSON.stringify(backupCodes), userId]);

      await this.logTOTPEvent({
        userId,
        action: 'codes_regenerated',
        metadata: { codesCount: backupCodes.length }
      });

      return backupCodes;
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      throw new Error('Failed to regenerate backup codes');
    }
  }

  /**
   * Authenticate with backup code
   */
  async authenticateWithBackupCode(
    userId: string,
    code: string,
    sourceIP: string = '127.0.0.1'
  ): Promise<{ success: boolean; message: string; remainingCodes?: number }> {

    try {
      const result = await this.db.query(`
        SELECT backup_codes, used_backup_codes FROM user_totp_secrets 
        WHERE user_id = $1 AND is_enabled = true
      `, [userId]);

      if (result.rows.length === 0) {
        return { success: false, message: 'TOTP not configured' };
      }

      const { backup_codes, used_backup_codes } = result.rows[0];
      const backupCodes = JSON.parse(backup_codes || '[]');
      const usedCodes = JSON.parse(used_backup_codes || '[]');

      if (!backupCodes.includes(code)) {
        return { success: false, message: 'Invalid backup code' };
      }

      if (usedCodes.includes(code)) {
        return { success: false, message: 'Backup code already used' };
      }

      // Mark code as used
      const newUsedCodes = [...usedCodes, code];
      await this.db.query(`
        UPDATE user_totp_secrets 
        SET used_backup_codes = $1, last_used_at = NOW()
        WHERE user_id = $2
      `, [JSON.stringify(newUsedCodes), userId]);

      const remainingCodes = backupCodes.length - newUsedCodes.length;

      await this.logTOTPEvent({
        userId,
        action: 'backup_code_used',
        sourceIP,
        metadata: { remainingCodes }
      });

      return {
        success: true,
        message: 'Backup code authenticated successfully',
        remainingCodes
      };
    } catch (error) {
      console.error('Error authenticating backup code:', error);
      return { success: false, message: 'Authentication service error' };
    }
  }

  /**
   * Check and enforce rate limiting
   */
  async checkRateLimit(
    userId: string,
    ipAddress: string,
    attemptType: 'enrollment' | 'authentication'
  ): Promise<{ allowed: boolean; remainingAttempts?: number; resetTime?: Date }> {

    try {
      const maxAttempts = attemptType === 'enrollment' ? 5 : 10;
      const windowMinutes = attemptType === 'enrollment' ? 10 : 5;

      const result = await this.db.query(`
        SELECT attempts, window_start, blocked_until FROM totp_rate_limits
        WHERE user_id = $1 AND attempt_type = $2 AND ip_address = $3
      `, [userId, attemptType, ipAddress]);

      const now = new Date();

      if (result.rows.length === 0) {
        // No rate limit record, create one
        await this.db.query(`
          INSERT INTO totp_rate_limits (user_id, attempt_type, ip_address, attempts, window_start)
          VALUES ($1, $2, $3, 1, $4)
        `, [userId, attemptType, ipAddress, now]);

        return { allowed: true, remainingAttempts: maxAttempts - 1 };
      }

      const { attempts, window_start, blocked_until } = result.rows[0];

      // Check if currently blocked
      if (blocked_until && blocked_until > now) {
        return { allowed: false, resetTime: blocked_until };
      }

      // Check if window has expired
      const windowStart = new Date(window_start);
      const windowEnd = new Date(windowStart.getTime() + windowMinutes * 60 * 1000);

      if (now > windowEnd) {
        // Reset window
        await this.db.query(`
          UPDATE totp_rate_limits 
          SET attempts = 1, window_start = $1, blocked_until = NULL
          WHERE user_id = $2 AND attempt_type = $3 AND ip_address = $4
        `, [now, userId, attemptType, ipAddress]);

        return { allowed: true, remainingAttempts: maxAttempts - 1 };
      }

      // Check if limit exceeded
      if (attempts >= maxAttempts) {
        const blockUntil = new Date(now.getTime() + 30 * 60 * 1000); // 30 minute block
        await this.db.query(`
          UPDATE totp_rate_limits 
          SET blocked_until = $1
          WHERE user_id = $2 AND attempt_type = $3 AND ip_address = $4
        `, [blockUntil, userId, attemptType, ipAddress]);

        return { allowed: false, resetTime: blockUntil };
      }

      // Increment attempts
      await this.db.query(`
        UPDATE totp_rate_limits 
        SET attempts = attempts + 1
        WHERE user_id = $2 AND attempt_type = $3 AND ip_address = $4
      `, [userId, attemptType, ipAddress]);

      return { allowed: true, remainingAttempts: maxAttempts - attempts - 1 };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return { allowed: true }; // Fail open
    }
  }

  /**
   * Get TOTP statistics for admin dashboard
   */
  async getTOTPStatistics(): Promise<{
    totalActiveUsers: number;
    enrollmentsToday: number;
    authenticationsToday: number;
    failedAttemptsToday: number;
    averageBackupCodesRemaining: number;
  }> {

    try {
      const stats = await this.db.query(`
        SELECT 
          (SELECT COUNT(*) FROM user_totp_secrets WHERE is_enabled = true) as total_active_users,
          (SELECT COUNT(*) FROM totp_events WHERE action = 'enrollment_completed' AND timestamp >= CURRENT_DATE) as enrollments_today,
          (SELECT COUNT(*) FROM totp_events WHERE action = 'authentication_success' AND timestamp >= CURRENT_DATE) as authentications_today,
          (SELECT COUNT(*) FROM totp_events WHERE action = 'authentication_failed' AND timestamp >= CURRENT_DATE) as failed_attempts_today,
          (SELECT AVG(jsonb_array_length(backup_codes) - jsonb_array_length(used_backup_codes)) FROM user_totp_secrets WHERE is_enabled = true) as avg_backup_codes
      `);

      const row = stats.rows[0];
      return {
        totalActiveUsers: parseInt(row.total_active_users || '0'),
        enrollmentsToday: parseInt(row.enrollments_today || '0'),
        authenticationsToday: parseInt(row.authentications_today || '0'),
        failedAttemptsToday: parseInt(row.failed_attempts_today || '0'),
        averageBackupCodesRemaining: parseFloat(row.avg_backup_codes || '0')
      };
    } catch (error) {
      console.error('Error getting TOTP statistics:', error);
      throw error;
    }
  }
}