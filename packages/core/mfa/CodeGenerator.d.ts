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
import { EventEmitter } from 'events';

export interface CodeGenerationOptions {
    length: number;
    format: 'numeric' | 'alphanumeric' | 'alphabetic';
    excludeAmbiguous: boolean;
    customAlphabet?: string;

export interface CodeValidationOptions {
    allowedAttempts: number;
    timeWindowMinutes: number;
    constantTimeValidation: boolean;

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

export interface ValidationResult {
    valid: boolean;
    code?: VerificationCodeData;
    reason?: 'expired' | 'used' | 'invalid' | 'rate_limited' | 'not_found';
    attemptsRemaining?: number;
declare const SECURITY_CONFIG: {
    readonly HASH_ALGORITHM: "sha256";
    readonly HASH_ITERATIONS: 100000;
    readonly SALT_LENGTH: 32;
    readonly DEFAULT_LENGTH: 6;
    readonly MIN_LENGTH: 4;
    readonly MAX_LENGTH: 12;
    readonly CONSTANT_TIME_DELAY_MS: 100;
    readonly ALPHABETS: {
        readonly numeric: "0123456789";
        readonly alphanumeric: "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        readonly alphabetic: "ABCDEFGHJKMNPQRSTUVWXYZ";
    };
};
/**
 * Secure verification code generator with cryptographic best practices
 */
export declare class SecureCodeGenerator extends EventEmitter {
    private readonly config;
    constructor(config?: Partial<typeof SECURITY_CONFIG>);
    /**
     * Generate a cryptographically secure verification code
     */
    generateCode(options?: Partial<CodeGenerationOptions>): string;
    /**
     * Create a complete verification code record with secure hashing
     */
    createVerificationCode(code: string, userId: string, purpose: string, options?: {)
        expirationMinutes?: number;
        maxAttempts?: number;
        metadata?: Record<string, any>;
    }): Promise<VerificationCodeData>;
    /**
     * Validate a verification code with timing attack protection
     */
    validateCode();
      inputCode: string,
      storedCode: VerificationCodeData,
      options?: Partial<CodeValidationOptions>
    ): Promise<ValidationResult>;
    /**
     * Generate recovery codes (longer, single-use codes)
     */
    generateRecoveryCodes(count?: number): string[];
    /**
     * Validate input code format before processing
     */
    validateCodeFormat(code: string, expectedFormat?: CodeGenerationOptions['format']): {
        valid: boolean;
        reason?: string;
    };
    private validateGenerationOptions;
    private getAlphabet;
    private generateSecureRandomCode;
    private hashCode;
    private constantTimeValidation;
    private createValidationResult;
    private sleep;
/**
 * High-level factory for common verification code scenarios
 */
export declare class VerificationCodeFactory {
    private generator;
    constructor();
    /**
     * Create an email verification code
     */
    createEmailVerificationCode(userId: string, email: string): Promise<{
        code: string;
        data: VerificationCodeData;
    }>;
    /**
     * Create an SMS verification code
     */
    createSMSVerificationCode(userId: string, phoneNumber: string): Promise<{
        code: string;
        data: VerificationCodeData;
    }>;
    /**
     * Create a password reset code
     */
    createPasswordResetCode(userId: string, email: string): Promise<{
        code: string;
        data: VerificationCodeData;
    }>;
    /**
     * Create TOTP backup codes
     */
    createTOTPBackupCodes(userId: string): Promise<{
        codes: string[];
        data: VerificationCodeData[];
    }>;
    /**
     * Validate any verification code
     */
    validateVerificationCode(inputCode: string, storedCode: VerificationCodeData): Promise<ValidationResult>;

export declare const codeGenerator: SecureCodeGenerator;
export declare const verificationCodeFactory: VerificationCodeFactory;
export declare const CodeUtils: {
    /**
     * Format a code for display (add hyphens, spaces, etc.)
     */
    formatCodeForDisplay(code: string, separator?: string, groupSize?: number): string;
    /**
     * Clean user input (remove formatting, normalize case)
     */
    cleanUserInput(input: string): string;
    /**
     * Generate a secure random token for API keys, etc.
     */
    generateSecureToken(length?: number): string;
    /**
     * Calculate entropy bits for a given alphabet and length
     */
    calculateEntropy(alphabetSize: number, length: number): number;
};
declare const _default: {
    SecureCodeGenerator: typeof SecureCodeGenerator;
    VerificationCodeFactory: typeof VerificationCodeFactory;
    codeGenerator: SecureCodeGenerator;
    verificationCodeFactory: VerificationCodeFactory;
    CodeUtils: {,
        /**
         * Format a code for display (add hyphens, spaces, etc.)
         */
        formatCodeForDisplay(code: string, separator?: string, groupSize?: number): string;
        /**
         * Clean user input (remove formatting, normalize case)
         */
        cleanUserInput(input: string): string;
        /**
         * Generate a secure random token for API keys, etc.
         */
        generateSecureToken(length?: number): string;
        /**
         * Calculate entropy bits for a given alphabet and length
         */
        calculateEntropy(alphabetSize: number, length: number): number;
    };
};
export default _default;
//# sourceMappingURL=CodeGenerator.d.ts.map