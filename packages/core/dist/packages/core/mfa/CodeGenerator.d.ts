import { EventEmitter } from 'events';
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
declare const SECURITY_CONFIG: {
    HASH_ALGORITHM: string;
    HASH_ITERATIONS: number;
    SALT_LENGTH: number;
    DEFAULT_LENGTH: number;
    MIN_LENGTH: number;
    MAX_LENGTH: number;
    CONSTANT_TIME_DELAY_MS: number;
    ALPHABETS: {
        readonly numeric: "0123456789";
        readonly alphanumeric: "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        readonly alphabetic: "ABCDEFGHJKMNPQRSTUVWXYZ";
    };
};
export declare class SecureCodeGenerator extends EventEmitter {
    private readonly config;
    constructor(config?: Partial<typeof SECURITY_CONFIG>);
    /**
     * Generate a cryptographically secure verification code
     */
    generateCode(options?: Partial<CodeGenerationOptions>): string;
}
export {};
//# sourceMappingURL=CodeGenerator.d.ts.map