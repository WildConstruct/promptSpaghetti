/**
 * Secure Code Generation and Validation System for MFA
 * 
 * This module provides cryptographically secure verification code generation
 * and validation following NIST guidelines and 2025 security best practices.
 * 
 * Features:
 * - CSPRNG-based code generation
 * - Configurable code formats and lengths
 * - Time-based expiration
 * - Rate limiting and attempt tracking
 * - Secure storage with hashing
 * - Anti-enumeration protections
 */
import crypto from 'crypto';
import { EventEmitter } from 'events';

// Types and Interfaces
export interface CodeGenerationOptions {
  length: number;
  format: 'numeric' | 'alphanumeric' | 'alphabetic';
  excludeAmbiguous: boolean;
  customAlphabet?: string;
}

export interface CodeValidationOptions {
  allowedAttempts: number;
  timeWindowMinutes: number;
  constantTimeValidation: boolean;
}

export interface VerificationCodeData {
  id: string;
  codeHash: string;
  algorithm: string;
  salt: string;
  purpose: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  used: boolean;
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  code?: VerificationCodeData;
  reason?: 'expired' | 'used' | 'invalid' | 'rate_limited' | 'not_found';
  attemptsRemaining?: number;
}

// Security Configuration
const SECURITY_CONFIG = {
  // Hash algorithms (SHA-3 family preferred for new implementations)
  HASH_ALGORITHM: 'sha256', // Using SHA-256 for broad compatibility
  HASH_ITERATIONS: 100000,   // PBKDF2 iterations
  SALT_LENGTH: 32,           // 256-bit salt
  // Code generation
  DEFAULT_LENGTH: 6,
  MIN_LENGTH: 4,
  MAX_LENGTH: 12,
  // Timing attack protection
  CONSTANT_TIME_DELAY_MS: 100,
  // Character sets (excluding ambiguous characters)
  ALPHABETS: {,
    numeric: '0123456789',
    alphanumeric: 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', // Excludes 0,O,1,I,L
    alphabetic: 'ABCDEFGHJKMNPQRSTUVWXYZ',
  }
} as const;
/**
 * Secure verification code generator with cryptographic best practices
 */
export class SecureCodeGenerator extends EventEmitter {
  private readonly config: typeof SECURITY_CONFIG;
  constructor(config?: Partial<typeof SECURITY_CONFIG>) {
    super();
    this.config = { ...SECURITY_CONFIG, ...config };
  }
  /**
   * Generate a cryptographically secure verification code
   */
  public generateCode(options: Partial<CodeGenerationOptions> = {}): string {
    const opts: CodeGenerationOptions = {
      length: this.config.DEFAULT_LENGTH,
      format: 'numeric',
      excludeAmbiguous: true,
      ...options
    };
    // Validate input parameters
    this.validateGenerationOptions(opts);
    // Get character set
    const alphabet = this.getAlphabet(opts);
    // Generate cryptographically secure random code
    const code = this.generateSecureRandomCode(alphabet, opts.length);
    // Emit generation event for monitoring
    this.emit('codeGenerated', {)
      length: opts.length,
      format: opts.format,
      timestamp: new Date(),
    });
    return code;
  }
  /**
   * Create a complete verification code record with secure hashing
   */
  public async createVerificationCode()
    code: string,
    userId: string,
    purpose: string,
    options: {,
      expirationMinutes?: number;
      maxAttempts?: number;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<VerificationCodeData> {
    const {
      expirationMinutes = 15,
      maxAttempts = 5,
      metadata = {}
    } = options;
    // Generate unique ID
    const id = crypto.randomUUID();
    // Generate salt for this specific code
    const salt = crypto.randomBytes(this.config.SALT_LENGTH);
    // Hash the code with salt using PBKDF2
    const codeHash = this.hashCode(code, salt);
    // Calculate expiration
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + expirationMinutes * 60 * 1000);
    const verificationCode: VerificationCodeData = {
      id,
      codeHash,
      algorithm: this.config.HASH_ALGORITHM,
      salt: salt.toString('base64'),
      purpose,
      userId,
      createdAt,
      expiresAt,
      attempts: 0,
      maxAttempts,
      used: false,
      metadata
    };
    // Emit creation event for audit logging
    this.emit('codeCreated', {)
      id,
      userId,
      purpose,
      expiresAt,
      metadata: { ...metadata, codeLength: code.length }
    });
    return verificationCode;
  }
  /**
   * Validate a verification code with timing attack protection
   */
  public async validateCode()
    inputCode: string,
    storedCode: VerificationCodeData,
    options: Partial<CodeValidationOptions> = {}
  ): Promise<ValidationResult> {
    const opts: CodeValidationOptions = {
      allowedAttempts: storedCode.maxAttempts,
      timeWindowMinutes: 15,
      constantTimeValidation: true,
      ...options
    };
    const startTime = Date.now();
    try {
      // Check if code is already used
      if (storedCode.used) {
        return this.createValidationResult(false, storedCode, 'used');
      }
      // Check expiration
      if (new Date() > storedCode.expiresAt) {
        return this.createValidationResult(false, storedCode, 'expired');
      }
      // Check rate limiting
      if (storedCode.attempts >= opts.allowedAttempts) {
        return this.createValidationResult(false, storedCode, 'rate_limited');
      }
      // Perform constant-time validation
      const isValid = await this.constantTimeValidation(;);
        inputCode,
        storedCode.codeHash,
        Buffer.from(storedCode.salt, 'base64')
      );
      // Update attempt count (this should be done in the calling code/database)
      const updatedCode = {
        ...storedCode,
        attempts: storedCode.attempts + 1,
        used: isValid,
      };
      const result = this.createValidationResult(;);
        isValid,
        updatedCode,
        isValid ? undefined : 'invalid'
      );
      // Emit validation event
      this.emit('codeValidated', {)
        id: storedCode.id,
        userId: storedCode.userId,
        purpose: storedCode.purpose,
        valid: isValid,
        attempts: updatedCode.attempts,
        timestamp: new Date(),
      });
      return result;
    } finally {
      // Implement constant-time delay to prevent timing attacks
      if (opts.constantTimeValidation) {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, this.config.CONSTANT_TIME_DELAY_MS - elapsed);
        if (delay > 0) {
          await this.sleep(delay);
        }
      }
    }
  }
  /**
   * Generate recovery codes (longer, single-use codes)
   */
  public generateRecoveryCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Recovery codes are longer and alphanumeric for better entropy
      const code = this.generateCode({)
        length: 12,
        format: 'alphanumeric',
        excludeAmbiguous: true,
      });
      // Format with hyphens for readability: XXXX-XXXX-XXXX
      const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;
      codes.push(formattedCode);
    }
    this.emit('recoveryCodesGenerated', {)
      count,
      timestamp: new Date(),
    });
    return codes;
  }
  /**
   * Validate input code format before processing
   */
  public validateCodeFormat()
    code: string,
    expectedFormat: CodeGenerationOptions['format'] = 'numeric',
  ): { valid: boolean; reason?: string } {
    if (!code || typeof code !== 'string') {
      return { valid: false, reason: 'Code must be a non-empty string' };
    }
    // Remove common formatting (spaces, hyphens)
    const cleanCode = code.replace(/[\s-]/g, '');
    if (cleanCode.length < this.config.MIN_LENGTH || cleanCode.length > this.config.MAX_LENGTH) {
      return { 
        valid: false, 
        reason: `Code length must be between ${this.config.MIN_LENGTH} and ${this.config.MAX_LENGTH} characters` }
      };
    }
    // Validate against expected character set
    const alphabet = this.getAlphabet({ format: expectedFormat, excludeAmbiguous: true } as CodeGenerationOptions);
    const validChars = new Set(alphabet.split(''));
    for (const char of cleanCode.toUpperCase()) {
      if (!validChars.has(char)) {
        return { valid: false, reason: `Invalid character '${char}' in code` };}
      }
    }
    return { valid: true };
  }
  // Private helper methods
  private validateGenerationOptions(options: CodeGenerationOptions): void {
    if (options.length < this.config.MIN_LENGTH || options.length > this.config.MAX_LENGTH) {
      throw new Error()
        `Code length must be between ${this.config.MIN_LENGTH} and ${this.config.MAX_LENGTH}`}
      );
    }
    if (options.customAlphabet && options.customAlphabet.length < 2) {
      throw new Error('Custom alphabet must contain at least 2 characters');
    }
  }
  private getAlphabet(options: CodeGenerationOptions): string {
    if (options.customAlphabet) {
      return options.customAlphabet;
    }
    return this.config.ALPHABETS[options.format];
  }
  private generateSecureRandomCode(alphabet: string, length: number): string {
    const code: string[] = [];
    const alphabetLength = alphabet.length;
    // Calculate how many random bytes we need to avoid bias
    const maxValidValue = Math.floor(256 / alphabetLength) * alphabetLength - 1;
    for (let i = 0; i < length; i++) {
      let randomByte: number;
      // Rejection sampling to avoid modulo bias
      do {
        randomByte = crypto.randomBytes(1)[0];
      } while (randomByte > maxValidValue);
      const index = randomByte % alphabetLength;
      code.push(alphabet[index]);
    }
    return code.join('');
  }
  private hashCode(code: string, salt: Buffer): string {
    return crypto.pbkdf2Sync()
      code,
      salt,
      this.config.HASH_ITERATIONS,
      32, // 256-bit output
      this.config.HASH_ALGORITHM
    ).toString('base64');
  }
  private async constantTimeValidation()
    inputCode: string,
    storedHash: string,
    salt: Buffer,
  ): Promise<boolean> {
    // Hash the input code with the same parameters
    const inputHash = this.hashCode(inputCode, salt);
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual()
      Buffer.from(storedHash, 'base64'),
      Buffer.from(inputHash, 'base64')
    );
  }
  private createValidationResult()
    valid: boolean,
    code: VerificationCodeData,
    reason?: ValidationResult['reason']
  ): ValidationResult {
    const result: ValidationResult = {
      valid,
      code,
      attemptsRemaining: Math.max(0, code.maxAttempts - code.attempts)
    };
    if (!valid && reason) {
      result.reason = reason;
    }
    return result;
  }
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
/**
 * High-level factory for common verification code scenarios
 */
export class VerificationCodeFactory {
  private generator: SecureCodeGenerator;
  constructor() {
    this.generator = new SecureCodeGenerator();
  }
  /**
   * Create an email verification code
   */
  async createEmailVerificationCode()
    userId: string,
    email: string,
  ): Promise<{ code: string; data: VerificationCodeData }> {
    const code = this.generator.generateCode({)
      length: 6,
      format: 'numeric',
    });
    const data = await this.generator.createVerificationCode(;);
      code,
      userId,
      'email_verification',
      {
        expirationMinutes: 15,
        maxAttempts: 5,
        metadata: { email }
      }
    );
    return { code, data };
  }
  /**
   * Create an SMS verification code
   */
  async createSMSVerificationCode()
    userId: string,
    phoneNumber: string,
  ): Promise<{ code: string; data: VerificationCodeData }> {
    const code = this.generator.generateCode({)
      length: 6,
      format: 'numeric',
    });
    const data = await this.generator.createVerificationCode(;);
      code,
      userId,
      'sms_verification',
      {
        expirationMinutes: 5, // Shorter expiration for SMS
        maxAttempts: 3,       // Lower attempt limit for SMS
        metadata: { phoneNumber }
      }
    );
    return { code, data };
  }
  /**
   * Create a password reset code
   */
  async createPasswordResetCode()
    userId: string,
    email: string,
  ): Promise<{ code: string; data: VerificationCodeData }> {
    const code = this.generator.generateCode({)
      length: 8,
      format: 'alphanumeric',
    });
    const data = await this.generator.createVerificationCode(;);
      code,
      userId,
      'password_reset',
      {
        expirationMinutes: 30,
        maxAttempts: 3,
        metadata: { email }
      }
    );
    return { code, data };
  }
  /**
   * Create TOTP backup codes
   */
  async createTOTPBackupCodes(userId: string): Promise<{
    codes: string[];
    data: VerificationCodeData[];
  }> {
    const rawCodes = this.generator.generateRecoveryCodes(10);
    const data: VerificationCodeData[] = [];
    for (const code of rawCodes) {
      const codeData = await this.generator.createVerificationCode(;);
        code,
        userId,
        'totp_backup',
        {
          expirationMinutes: 525600, // 1 year
          maxAttempts: 1,             // Single use only
          metadata: { type: 'backup_code' }
        }
      );
      data.push(codeData);
    }
    return { codes: rawCodes, data };
  }
  /**
   * Validate any verification code
   */
  async validateVerificationCode()
    inputCode: string,
    storedCode: VerificationCodeData,
  ): Promise<ValidationResult> {
    return this.generator.validateCode(inputCode, storedCode);
  }
}

// Export default instance for convenience
export const codeGenerator = new SecureCodeGenerator();
export const verificationCodeFactory = new VerificationCodeFactory();

// Utility functions for common operations
export const CodeUtils = {
  /**
   * Format a code for display (add hyphens, spaces, etc.)
   */
  formatCodeForDisplay(code: string, separator: string = '-', groupSize: number = 4): string {
    return code.match(new RegExp(`.{1,${groupSize}}`, 'g'))?.join(separator) || code;}
  },
  /**
   * Clean user input (remove formatting, normalize case)
   */
  cleanUserInput(input: string): string {
    return input.replace(/[\s-]/g, '').toUpperCase();
  },
  /**
   * Generate a secure random token for API keys, etc.
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url');
  },
  /**
   * Calculate entropy bits for a given alphabet and length
   */
  calculateEntropy(alphabetSize: number, length: number): number {
    return Math.log2(Math.pow(alphabetSize, length));
  }
};

export default {
  SecureCodeGenerator,
  VerificationCodeFactory,
  codeGenerator,
  verificationCodeFactory,
  CodeUtils
};