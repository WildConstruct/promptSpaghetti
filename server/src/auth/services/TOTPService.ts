/**
 * TOTP Service - Epic 19 Implementation  
 * Time-based One-Time Password implementation for MFA authenticator apps
 */

import crypto from 'crypto';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import base32 from 'base32';

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

export interface TOTPValidationResult {
  valid: boolean;
  timeRemaining: number; // Seconds until code expires
  usedPreviously: boolean;
  drift: number; // Time drift in periods
  message: string;
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

export interface TOTPGenerationOptions {
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: number;
  period?: number;
  issuer?: string;
  window?: number; // Clock skew tolerance in periods
}

export class TOTPService {
  private readonly defaultOptions: Required<TOTPGenerationOptions> = {
    algorithm: 'SHA1', // Most compatible with authenticator apps
    digits: 6,
    period: 30,
    issuer: 'PromptScape',
    window: 1 // Allow 1 period of clock skew (±30 seconds)
  };

  private configurations: Map<string, TOTPConfiguration> = new Map();

  constructor(private recoveryCodeService?: any) {
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
        },
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

  // Database interaction methods (would be implemented with actual database)
  
  private async storeTempConfiguration(config: TOTPConfiguration): Promise<void> {
    // Store temporarily with expiration
    this.configurations.set(`temp_${config.id}`, config);
    
    // Remove after 10 minutes
    setTimeout(() => {
      this.configurations.delete(`temp_${config.id}`);
    }, 10 * 60 * 1000);
  }

  private async getTempConfiguration(configId: string): Promise<TOTPConfiguration | null> {
    return this.configurations.get(`temp_${configId}`) || null;
  }

  private async removeTempConfiguration(configId: string): Promise<void> {
    this.configurations.delete(`temp_${configId}`);
  }

  private async storeConfiguration(config: TOTPConfiguration): Promise<void> {
    this.configurations.set(config.id, config);
  }

  private async updateConfiguration(config: TOTPConfiguration): Promise<void> {
    this.configurations.set(config.id, config);
  }

  private async getUserConfigurations(userId: string): Promise<TOTPConfiguration[]> {
    return Array.from(this.configurations.values()).filter(c => c.userId === userId);
  }

  private async wasCodeRecentlyUsed(configId: string, code: string): Promise<boolean> {
    // Check if code was used in the last period to prevent replay attacks
    const config = this.configurations.get(configId);
    if (!config) return false;
    
    if (config.lastUsedCode === code && config.lastUsedAt) {
      const timeSinceLastUse = Date.now() - config.lastUsedAt.getTime();
      return timeSinceLastUse < (config.period * 1000 * 2); // 2 periods
    }
    
    return false;
  }

  private async storeUsedCode(configId: string, code: string, usedAt: Date): Promise<void> {
    // Implementation would store used codes with expiration
    console.log(`Storing used code for config ${configId} at ${usedAt.toISOString()}`);
  }

  private async logTOTPEvent(event: {
    userId: string;
    action: string;
    configurationId?: string;
    sourceIP?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    console.log(`TOTP Event: ${event.action} for user ${event.userId}`);
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
  async disableConfiguration(configurationId: string, reason: string): Promise<void> {
    const config = this.configurations.get(configurationId);
    if (config) {
      config.enabled = false;
      await this.updateConfiguration(config);
      
      await this.logTOTPEvent({
        userId: config.userId,
        action: 'configuration_disabled',
        configurationId,
        metadata: { reason }
      });
    }
  }
}