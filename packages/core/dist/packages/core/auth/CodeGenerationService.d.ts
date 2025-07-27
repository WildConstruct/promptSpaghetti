/**
 * Secure Code Generation and Validation System
 * Task: T-1752989143997-705 - Create code generation and validation system
 * Epic 19: Authentication Enhancement & Security Hardening
 */
export declare enum CodeType {
    EMAIL_VERIFICATION = "email_verification",
    SMS_VERIFICATION = "sms_verification",
    TOTP_SECRET = "totp_secret",
    BACKUP_CODE = "backup_code",
    RECOVERY_TOKEN = "recovery_token",
    API_TOKEN = "api_token"
}
export declare enum CodeFormat {
    NUMERIC = "numeric",// 123456
    ALPHANUMERIC = "alphanumeric",// A1B2C3
    ALPHA = "alpha",// ABCDEF
    BASE32 = "base32",// JBSWY3DPEHPK3PXP
    HEX = "hex",// 1a2b3c4d
    UUID = "uuid"
}
export interface CodeGenerationOptions {
    type: CodeType;
    format: CodeFormat;
    length: number;
    expiryMinutes?: number;
    userContext?: {
        userId: string;
        ipAddress: string;
        userAgent: string;
    };
    customCharset?: string;
    excludeSimilar?: boolean;
    enforceComplexity?: boolean;
}
export interface GeneratedCode {
    code: string;
    hashedCode: string;
    salt: string;
    type: CodeType;
    format: CodeFormat;
    expiresAt?: Date;
    metadata: {
        generatedAt: Date;
        userId?: string;
        ipAddress?: string;
        entropy: number;
        algorithm: string;
    };
}
export interface CodeValidationResult {
    valid: boolean;
    reason?: 'expired' | 'invalid' | 'rate_limited' | 'used' | 'format_mismatch';
    remainingAttempts?: number;
    metadata?: {
        validatedAt: Date;
        timingAttackSafe: boolean;
        processingTimeMs: number;
    };
}
export interface CodeValidationOptions {
    allowExpired?: boolean;
    constantTimeValidation?: boolean;
    rateLimitingEnabled?: boolean;
    maxAttempts?: number;
}
export declare class CodeGenerationService {
    private rateLimitService;
    private hashingAlgorithm;
    private saltLength;
    constructor();
    /**
     * Generate a secure code based on specified options
     */
    generateCode(options: CodeGenerationOptions): Promise<GeneratedCode>;
    /**
     * Validate a code against stored hash
     */
    validateCode(inputCode: string, storedData: GeneratedCode, options?: CodeValidationOptions): Promise<CodeValidationResult>;
    /**
     * Generate TOTP secret with proper formatting
     */
    generateTOTPSecret(userId: string): Promise<{
        secret: string;
        qrCodeData: string;
        manualEntryKey: string;
        backupCodes: string[];
    }>;
    /**
     * Generate recovery token for account recovery
     */
    generateRecoveryToken(userId: string): Promise<GeneratedCode>;
    /**
     * Generate API token
     */
    generateAPIToken(userId: string, expiryDays?: number): Promise<GeneratedCode>;
    /**
     * Get rate limit information for a user and code type
     */
    getRateLimitInfo(userId: string, codeType: CodeType): {
        currentAttempts: number;
        maxAttempts: number;
        windowMinutes: number;
        timeUntilReset?: number;
    };
    /**
     * Reset rate limit for a user and code type
     */
    resetRateLimit(userId: string, codeType: CodeType): void;
    private generateSecureCode;
    private getCharset;
    private enforceComplexity;
    private hashCode;
    private constantTimeCompare;
    private validateCodeFormat;
}
export declare class CodeGenerationUtils {
    /**
     * Analyze the strength of a generated code
     */
    static analyzeCodeStrength(generatedCode: GeneratedCode): {
        entropy: number;
        strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
        crackTime: {
            averageTime: number;
            worstCase: number;
            unit: string;
        };
        recommendations: string[];
    };
    /**
     * Generate a secure random seed for testing
     */
    static generateTestSeed(): string;
    /**
     * Format code for user display
     */
    static formatCodeForDisplay(code: string, format: CodeFormat): string;
}
export default CodeGenerationService;
//# sourceMappingURL=CodeGenerationService.d.ts.map