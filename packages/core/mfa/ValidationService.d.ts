/**
 * Verification Code Validation Service
 *
 * This service provides a high-level interface for managing verification code
 * validation with database integration, rate limiting, and security monitoring.
 */
import { EventEmitter } from 'events';
import { VerificationCodeData, ValidationResult } from './CodeGenerator';

}
export interface VerificationCodeStorage {
    save(code: VerificationCodeData): Promise<void>;
    findById(id: string): Promise<VerificationCodeData | null>;
    findByUserAndPurpose(userId: string, purpose: string): Promise<VerificationCodeData[]>;
    update(id: string, updates: Partial<VerificationCodeData>): Promise<void>;
    delete(id: string): Promise<void>;
    deleteExpired(): Promise<number>;
    findByUser(userId: string): Promise<VerificationCodeData[]>;

}
export interface RateLimiter {
    isAllowed(key: string, limit: number, windowMs: number): Promise<boolean>;
    increment(key: string, windowMs: number): Promise<number>;
    reset(key: string): Promise<void>;

}
export interface ValidationServiceConfig {
    rateLimiting: {
        enabled: boolean;
        maxGenerationsPerHour: number;
        maxValidationAttemptsPerHour: number;
        maxValidationAttemptsPerCode: number;
}
    };
    monitoring: {
        enabled: boolean;
        alertOnSuspiciousActivity: boolean;
        logAllValidations: boolean;
    };
    cleanup: {
        autoDeleteExpired: boolean;
        cleanupIntervalMinutes: number;
    };
    security: {
        constantTimeValidation: boolean;
        logFailedAttempts: boolean;
        blockAfterFailures: number;
    };

}
export interface ValidationAttempt {
    id: string;
    userId: string;
    codeId: string;
    inputCode: string;
    success: boolean;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;

}
export interface SuspiciousActivity {
    type: 'rapid_fire' | 'enumeration' | 'expired_code_use' | 'brute_force';
    userId: string;
    details: Record<string, any>;
    timestamp: Date;
/**
 * Comprehensive validation service with security monitoring
 */
export declare class ValidationService extends EventEmitter {
    private storage;
    private rateLimiter;
    private generator;
    private config;
    private cleanupInterval?;
    constructor(storage: VerificationCodeStorage, rateLimiter: RateLimiter, config?: Partial<ValidationServiceConfig>);
    /**
     * Generate and store a verification code
     */
    generateVerificationCode(userId: string, purpose: string, options?: {)
        length?: number;
        format?: 'numeric' | 'alphanumeric' | 'alphabetic';
        expirationMinutes?: number;
        maxAttempts?: number;
        metadata?: Record<string, any>;
        ipAddress?: string;
}
    }): Promise<{
        code: string;
        id: string;
    }>;
    /**
     * Validate a verification code
     */
    validateVerificationCode(codeId: string, inputCode: string, options?: {)
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
        purpose?: string;
    }): Promise<ValidationResult>;
    /**
     * Validate code by user and purpose (convenience method)
     */
    validateByUserAndPurpose(userId: string, purpose: string, inputCode: string, options?: {)
        ipAddress?: string;
        userAgent?: string;
    }): Promise<ValidationResult>;
    /**
     * Invalidate a specific verification code
     */
    invalidateCode(codeId: string): Promise<void>;
    /**
     * Invalidate all codes for a user and purpose
     */
    invalidateExistingCodes(userId: string, purpose: string): Promise<void>;
    /**
     * Get validation statistics for a user
     */
    getUserValidationStats(userId: string): Promise<{
        totalCodes: number;
        activeCodes: number;
        expiredCodes: number;
        usedCodes: number;
        totalAttempts: number;
        successfulValidations: number;
        failedValidations: number;
    }>;
    /**
     * Clean up expired codes
     */
    cleanupExpiredCodes(): Promise<number>;
    /**
     * Shutdown the service and clean up resources
     */
    shutdown(): Promise<void>;
    private setupMonitoring;
    private startCleanupSchedule;
    private logValidationAttempt;
    private checkForSuspiciousActivity;

export declare function createValidationService(storage: VerificationCodeStorage)
  rateLimiter: RateLimiter,
  environment?: 'development' | 'production'
): ValidationService;
export default ValidationService;
//# sourceMappingURL=ValidationService.d.ts.map