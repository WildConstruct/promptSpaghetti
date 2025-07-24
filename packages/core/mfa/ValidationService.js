/**
 * Verification Code Validation Service
 *
 * This service provides a high-level interface for managing verification code
 * validation with database integration, rate limiting, and security monitoring.
 */
import { EventEmitter } from 'events';
import { SecureCodeGenerator, CodeUtils } from './CodeGenerator.js';
const DEFAULT_CONFIG = {
    rateLimiting: {
        enabled: true,
        maxGenerationsPerHour: 10,
        maxValidationAttemptsPerHour: 30,
        maxValidationAttemptsPerCode: 5
    },
    monitoring: {
        enabled: true,
        alertOnSuspiciousActivity: true,
        logAllValidations: true
    },
    cleanup: {
        autoDeleteExpired: true,
        cleanupIntervalMinutes: 60
    },
    security: {
        constantTimeValidation: true,
        logFailedAttempts: true,
        blockAfterFailures: 10
    }
};
/**
 * Comprehensive validation service with security monitoring
 */
export class ValidationService extends EventEmitter {
    storage;
    rateLimiter;
    generator;
    config;
    cleanupInterval;
    constructor(storage, rateLimiter, config) {
        super();
        this.storage = storage;
        this.rateLimiter = rateLimiter;
        this.generator = new SecureCodeGenerator();
        this.config = { ...DEFAULT_CONFIG, ...config };
        if (this.config.cleanup.autoDeleteExpired) {
            this.startCleanupSchedule();
        }
        // Set up monitoring
        this.setupMonitoring();
    }
    /**
     * Generate and store a verification code
     */
    async generateVerificationCode(userId, purpose, options = {}) {
        const { length = 6, format = 'numeric', expirationMinutes = 15, maxAttempts = 5, metadata = {}, ipAddress } = options;
        // Rate limiting check
        if (this.config.rateLimiting.enabled) {
            const rateLimitKey = `generate:${userId}`;
            const allowed = await this.rateLimiter.isAllowed(rateLimitKey, this.config.rateLimiting.maxGenerationsPerHour, 60 * 60 * 1000 // 1 hour
            );
            if (!allowed) {
                this.emit('rateLimitExceeded', {
                    type: 'generation',
                    userId,
                    ipAddress,
                    timestamp: new Date()
                });
                throw new Error('Rate limit exceeded for code generation');
            }
        }
        // Invalidate any existing codes for the same purpose
        await this.invalidateExistingCodes(userId, purpose);
        // Generate the code
        const code = this.generator.generateCode({ length, format });
        // Create verification code data
        const verificationCode = await this.generator.createVerificationCode(code, userId, purpose, { expirationMinutes, maxAttempts, metadata: { ...metadata, ipAddress } });
        // Store in database
        await this.storage.save(verificationCode);
        // Increment rate limiting counter
        if (this.config.rateLimiting.enabled) {
            await this.rateLimiter.increment(`generate:${userId}`, 60 * 60 * 1000);
        }
        // Emit event for monitoring
        this.emit('codeGenerated', {
            id: verificationCode.id,
            userId,
            purpose,
            metadata: { codeLength: length, format },
            timestamp: new Date()
        });
        return { code, id: verificationCode.id };
    }
    /**
     * Validate a verification code
     */
    async validateVerificationCode(codeId, inputCode, options = {}) {
        const { userId, ipAddress, userAgent, purpose } = options;
        // Clean the input code
        const cleanCode = CodeUtils.cleanUserInput(inputCode);
        // Rate limiting check
        if (this.config.rateLimiting.enabled && userId) {
            const rateLimitKey = `validate:${userId}`;
            const allowed = await this.rateLimiter.isAllowed(rateLimitKey, this.config.rateLimiting.maxValidationAttemptsPerHour, 60 * 60 * 1000);
            if (!allowed) {
                this.emit('rateLimitExceeded', {
                    type: 'validation',
                    userId,
                    ipAddress,
                    timestamp: new Date()
                });
                return {
                    valid: false,
                    reason: 'rate_limited'
                };
            }
        }
        // Retrieve stored code
        const storedCode = await this.storage.findById(codeId);
        if (!storedCode) {
            this.logValidationAttempt({
                id: crypto.randomUUID(),
                userId: userId || 'unknown',
                codeId,
                inputCode: cleanCode,
                success: false,
                reason: 'not_found',
                ipAddress,
                userAgent,
                timestamp: new Date()
            });
            return {
                valid: false,
                reason: 'not_found'
            };
        }
        // Additional security checks
        if (userId && storedCode.userId !== userId) {
            this.emit('securityViolation', {
                type: 'user_mismatch',
                userId,
                codeId,
                storedUserId: storedCode.userId,
                ipAddress,
                timestamp: new Date()
            });
            return {
                valid: false,
                reason: 'invalid'
            };
        }
        if (purpose && storedCode.purpose !== purpose) {
            this.emit('securityViolation', {
                type: 'purpose_mismatch',
                userId: storedCode.userId,
                codeId,
                expectedPurpose: purpose,
                actualPurpose: storedCode.purpose,
                ipAddress,
                timestamp: new Date()
            });
            return {
                valid: false,
                reason: 'invalid'
            };
        }
        // Validate the code
        const result = await this.generator.validateCode(cleanCode, storedCode, {
            constantTimeValidation: this.config.security.constantTimeValidation
        });
        // Update the stored code with attempt count
        if (result.code) {
            await this.storage.update(codeId, {
                attempts: result.code.attempts,
                used: result.code.used
            });
        }
        // Log the validation attempt
        this.logValidationAttempt({
            id: crypto.randomUUID(),
            userId: storedCode.userId,
            codeId,
            inputCode: cleanCode,
            success: result.valid,
            reason: result.reason,
            ipAddress,
            userAgent,
            timestamp: new Date()
        });
        // Increment rate limiting counter
        if (this.config.rateLimiting.enabled && userId) {
            await this.rateLimiter.increment(`validate:${userId}`, 60 * 60 * 1000);
        }
        // Security monitoring
        if (!result.valid) {
            await this.checkForSuspiciousActivity(storedCode.userId, codeId, ipAddress);
        }
        // Emit validation event
        this.emit('codeValidated', {
            id: codeId,
            userId: storedCode.userId,
            purpose: storedCode.purpose,
            valid: result.valid,
            reason: result.reason,
            attempts: result.code?.attempts || 0,
            ipAddress,
            timestamp: new Date()
        });
        return result;
    }
    /**
     * Validate code by user and purpose (convenience method)
     */
    async validateByUserAndPurpose(userId, purpose, inputCode, options = {}) {
        // Find the most recent code for this user and purpose
        const codes = await this.storage.findByUserAndPurpose(userId, purpose);
        const activeCode = codes
            .filter(code => !code.used && new Date() <= code.expiresAt)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        if (!activeCode) {
            return {
                valid: false,
                reason: 'not_found'
            };
        }
        return this.validateVerificationCode(activeCode.id, inputCode, {
            userId,
            purpose,
            ...options
        });
    }
    /**
     * Invalidate a specific verification code
     */
    async invalidateCode(codeId) {
        await this.storage.update(codeId, { used: true });
        this.emit('codeInvalidated', {
            id: codeId,
            timestamp: new Date()
        });
    }
    /**
     * Invalidate all codes for a user and purpose
     */
    async invalidateExistingCodes(userId, purpose) {
        const codes = await this.storage.findByUserAndPurpose(userId, purpose);
        for (const code of codes) {
            if (!code.used && new Date() <= code.expiresAt) {
                await this.storage.update(code.id, { used: true });
            }
        }
        this.emit('codesInvalidated', {
            userId,
            purpose,
            count: codes.length,
            timestamp: new Date()
        });
    }
    /**
     * Get validation statistics for a user
     */
    async getUserValidationStats(userId) {
        const codes = await this.storage.findByUser(userId);
        const now = new Date();
        const stats = {
            totalCodes: codes.length,
            activeCodes: codes.filter(code => !code.used && now <= code.expiresAt).length,
            expiredCodes: codes.filter(code => !code.used && now > code.expiresAt).length,
            usedCodes: codes.filter(code => code.used).length,
            totalAttempts: codes.reduce((sum, code) => sum + code.attempts, 0),
            successfulValidations: codes.filter(code => code.used).length,
            failedValidations: codes.reduce((sum, code) => sum + Math.max(0, code.attempts - (code.used ? 1 : 0)), 0)
        };
        return stats;
    }
    /**
     * Clean up expired codes
     */
    async cleanupExpiredCodes() {
        const deletedCount = await this.storage.deleteExpired();
        this.emit('expiredCodesCleanup', {
            deletedCount,
            timestamp: new Date()
        });
        return deletedCount;
    }
    /**
     * Shutdown the service and clean up resources
     */
    async shutdown() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.removeAllListeners();
    }
    // Private helper methods
    setupMonitoring() {
        if (!this.config.monitoring.enabled) {
            return;
        }
        // Set up event listeners for monitoring
        this.on('codeValidated', (event) => {
            if (this.config.monitoring.logAllValidations) {
                console.log(`[VALIDATION] ${event.valid ? 'SUCCESS' : 'FAILED'}`, {
                    userId: event.userId,
                    purpose: event.purpose,
                    reason: event.reason,
                    attempts: event.attempts
                });
            }
        });
        this.on('rateLimitExceeded', (event) => {
            console.warn(`[RATE_LIMIT] ${event.type.toUpperCase()} rate limit exceeded`, {
                userId: event.userId,
                ipAddress: event.ipAddress
            });
        });
        this.on('securityViolation', (event) => {
            console.error(`[SECURITY] ${event.type.toUpperCase()} violation detected`, event);
        });
        this.on('suspiciousActivity', (event) => {
            if (this.config.monitoring.alertOnSuspiciousActivity) {
                console.error(`[SUSPICIOUS] ${event.type.toUpperCase()} activity detected`, event);
            }
        });
    }
    startCleanupSchedule() {
        const intervalMs = this.config.cleanup.cleanupIntervalMinutes * 60 * 1000;
        this.cleanupInterval = setInterval(async () => {
            try {
                await this.cleanupExpiredCodes();
            }
            catch (error) {
                console.error('[CLEANUP] Failed to clean up expired codes:', error);
            }
        }, intervalMs);
    }
    logValidationAttempt(attempt) {
        if (this.config.security.logFailedAttempts || attempt.success) {
            this.emit('validationAttempt', attempt);
        }
    }
    async checkForSuspiciousActivity(userId, codeId, ipAddress) {
        // Check for rapid-fire attempts
        const recentCodes = await this.storage.findByUser(userId);
        const recentAttempts = recentCodes.filter(code => Date.now() - code.createdAt.getTime() < 5 * 60 * 1000 && // Last 5 minutes
            code.attempts > 0);
        if (recentAttempts.length > 5) {
            this.emit('suspiciousActivity', {
                type: 'rapid_fire',
                userId,
                details: {
                    recentAttempts: recentAttempts.length,
                    timeWindow: '5 minutes',
                    ipAddress
                },
                timestamp: new Date()
            });
        }
        // Check for enumeration attacks (using expired codes)
        const code = await this.storage.findById(codeId);
        if (code && new Date() > code.expiresAt && code.attempts > 0) {
            this.emit('suspiciousActivity', {
                type: 'expired_code_use',
                userId,
                details: {
                    codeId,
                    expiredSince: new Date().getTime() - code.expiresAt.getTime(),
                    attempts: code.attempts,
                    ipAddress
                },
                timestamp: new Date()
            });
        }
    }
}
// Factory function for common configurations
export function createValidationService(storage, rateLimiter, environment = 'production') {
    const config = environment === 'development' ? {
        rateLimiting: {
            enabled: false,
            maxGenerationsPerHour: 100,
            maxValidationAttemptsPerHour: 300,
            maxValidationAttemptsPerCode: 10
        },
        monitoring: {
            enabled: true,
            alertOnSuspiciousActivity: false,
            logAllValidations: true
        }
    } : {
        rateLimiting: {
            enabled: true,
            maxGenerationsPerHour: 10,
            maxValidationAttemptsPerHour: 30,
            maxValidationAttemptsPerCode: 5
        },
        monitoring: {
            enabled: true,
            alertOnSuspiciousActivity: true,
            logAllValidations: false
        }
    };
    return new ValidationService(storage, rateLimiter, config);
}
export default ValidationService;
