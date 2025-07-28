/**
 * Verification Code Validation Service
 *
 * This service provides a high-level interface for managing verification code
 * validation with database integration, rate limiting, and security monitoring.
 */
import { EventEmitter } from 'events';
import { VerificationCodeData } from './CodeGenerator';
export interface VerificationCodeStorage {
    save(code: VerificationCodeData): Promise<void>;
    findById(id: string): Promise<VerificationCodeData | null>;
    findByUserAndPurpose(userId: string, purpose: string): Promise<VerificationCodeData>;
    update(id: string, updates: Partial<VerificationCodeData>): Promise<void>;
    delete(id: string): Promise<void>;
    deleteExpired(): Promise<number>;
    findByUser(userId: string): Promise<VerificationCodeData>;
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
    const: any;
    DEFAULT_CONFIG: ValidationServiceConfig;
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
}
export declare class ValidationService extends EventEmitter {
    private generator;
    private config;
    private cleanupInterval?;
    constructor();
    private storage;
    private rateLimiter;
    config?: Partial<ValidationServiceConfig>;
    super(): any;
}
export declare function createValidationService(storage: VerificationCodeStorage): any;
//# sourceMappingURL=ValidationService.d.ts.map