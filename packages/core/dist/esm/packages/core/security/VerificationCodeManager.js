/**
 * Verification Code Manager
 *
 * Comprehensive system for managing verification codes with expiry, retry logic,
 * rate limiting, and security features. Handles MFA codes, email verification,
 * SMS verification, and other time-sensitive verification scenarios.
 *
 * Features:
 * - Multiple verification code types and formats
 * - Configurable expiry times and retry limits
 * - Rate limiting and abuse prevention
 * - Secure code generation and validation
 * - Audit logging and security monitoring
 * - Automatic cleanup and code lifecycle management
 * - Support for different delivery channels
 * - Anti-brute force protection
 */
import { EventEmitter } from 'events';
import { randomInt, createHash, timingSafeEqual } from 'crypto';
// Verification Code Types
export var VerificationCodeType;
(function (VerificationCodeType) {
    VerificationCodeType["EMAIL_VERIFICATION"] = "email_verification";
    VerificationCodeType["SMS_VERIFICATION"] = "sms_verification";
    VerificationCodeType["TOTP_BACKUP"] = "totp_backup";
    VerificationCodeType["PASSWORD_RESET"] = "password_reset";
    VerificationCodeType["ACCOUNT_RECOVERY"] = "account_recovery";
    VerificationCodeType["DEVICE_VERIFICATION"] = "device_verification";
    VerificationCodeType["LOGIN_CONFIRMATION"] = "login_confirmation";
    VerificationCodeType["TRANSACTION_APPROVAL"] = "transaction_approval";
    VerificationCodeType[VerificationCodeType["export"] = void 0] = "export";
    VerificationCodeType[VerificationCodeType["enum"] = void 0] = "enum";
    VerificationCodeType[VerificationCodeType["CodeFormat"] = void 0] = "CodeFormat";
})(VerificationCodeType || (VerificationCodeType = {}));
{
    NUMERIC_4 = 'numeric_4', // 1234
        NUMERIC_6 = 'numeric_6', // 123456
        NUMERIC_8 = 'numeric_8', // 12345678
        ALPHANUMERIC_6 = 'alpha_6', // A1B2C3
        ALPHANUMERIC_8 = 'alpha_8', // A1B2C3D4
        UUID = 'uuid'; // Full UUID format
    export let CodeStatus;
    (function (CodeStatus) {
        CodeStatus["ACTIVE"] = "active";
        CodeStatus["USED"] = "used";
        CodeStatus["EXPIRED"] = "expired";
        CodeStatus["REVOKED"] = "revoked";
        CodeStatus["RATE_LIMITED"] = "rate_limited";
        CodeStatus[CodeStatus["export"] = void 0] = "export";
        CodeStatus[CodeStatus["enum"] = void 0] = "enum";
        CodeStatus[CodeStatus["DeliveryChannel"] = void 0] = "DeliveryChannel";
    })(CodeStatus || (CodeStatus = {}));
    {
        EMAIL = 'email',
            SMS = 'sms',
            VOICE = 'voice',
            PUSH = 'push',
            IN_APP = 'in_app';
    }
    ;
    expirationTimes: {
        [key in VerificationCodeType];
        number;
    }
    ;
    retryLimits: {
        [key in VerificationCodeType];
        number;
    }
    ;
    enableSecurityLogging: boolean;
    antiEnumerationDelay: number; // Delay to prevent enumeration attacks
    requireSecureDelivery: boolean; // Require secure delivery channels
    // Verification Code Data
}
;
securityFlags: {
    highRisk: boolean;
    multipleAttempts: boolean;
    suspiciousActivity: boolean;
    deviceMismatch: boolean;
}
;
export var SecurityEvent;
(function (SecurityEvent) {
    SecurityEvent["CODE_GENERATED"] = "code_generated";
    SecurityEvent["CODE_VALIDATED"] = "code_validated";
    SecurityEvent["CODE_USED"] = "code_used";
    SecurityEvent["CODE_EXPIRED"] = "code_expired";
    SecurityEvent["CODE_REVOKED"] = "code_revoked";
    SecurityEvent["INVALID_CODE_ATTEMPT"] = "invalid_code_attempt";
    SecurityEvent["RATE_LIMIT_EXCEEDED"] = "rate_limit_exceeded";
    SecurityEvent["SUSPICIOUS_ACTIVITY"] = "suspicious_activity";
    SecurityEvent["BRUTE_FORCE_DETECTED"] = "brute_force_detected";
    SecurityEvent["CODE_CLEANUP"] = "code_cleanup";
    // Statistics
    SecurityEvent[SecurityEvent["export"] = void 0] = "export";
    SecurityEvent[SecurityEvent["interface"] = void 0] = "interface";
    SecurityEvent[SecurityEvent["CodeStatistics"] = void 0] = "CodeStatistics";
})(SecurityEvent || (SecurityEvent = {}));
{
    totalCodes: number;
    activeCodes: number;
    usedCodes: number;
    expiredCodes: number;
    revokedCodes: number;
    codesByType: Record;
    codesByChannel: Record;
    successRate: number;
    averageAttempts: number;
    securityViolations: number;
    rateLimitViolations: number;
    averageCodeLifetime: number;
    /**
    * Comprehensive verification code management service
    */
}
export class VerificationCodeManager extends EventEmitter {
    codes = new Map();
    rateLimits = new Map();
    config;
    cleanupTimer;
    constructor(config = {}) {
        super();
        this.config = this.mergeConfig(config);
        this.startCleanupTimer();
        /**
         * Generate a new verification code
         */
    }
    /**
     * Generate a new verification code
     */
    async generateCode(request) {
        try {
            // Check rate limiting
            if (this.isRateLimited(request.userId, request.deliveryAddress, request.ipAddress)) {
                this.logSecurityEvent(SecurityEvent.RATE_LIMIT_EXCEEDED, {});
                userId: request.userId,
                    type;
                request.type,
                    deliveryChannel;
                request.deliveryChannel,
                    ipAddress;
                request.ipAddress,
                ;
            }
            ;
            // Apply anti-enumeration delay
            await this.antiEnumerationDelay();
            return null;
            // Revoke existing active codes of same type
            await this.revokeUserCodes(request.userId, request.type, 'new_code_generated');
            // Generate the code
            const format = this.config.codeFormats[request.type];
            const rawCode = this.generateCodeByFormat(format);
            const salt = this.generateSalt();
            const hashedCode = this.hashCode(rawCode, salt);
            // Calculate expiration
            const expirationMs = this.calculateExpiration(request.type, request.expirationMinutes);
            const maxAttempts = request.maxAttempts || this.config.retryLimits[request.type];
            // Create code record
            const codeRecord = {
                id: this.generateCodeId(),
                userId: request.userId,
                type: request.type,
                format,
                hashedCode,
                salt,
                status: CodeStatus.ACTIVE,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + expirationMs),
                attempts: 0,
                maxAttempts,
                deliveryChannel: request.deliveryChannel,
                deliveryAddress: request.deliveryAddress,
                ipAddress: request.ipAddress,
                userAgent: request.userAgent,
                metadata: {
                    purpose: `${request.type}_verification` }
            }, requestSource, deliveryAttempts, deliveryStatus;
            request.metadata;
        }
        finally { }
        securityFlags: {
            highRisk: false,
                multipleAttempts;
            false,
                suspiciousActivity;
            false,
                deviceMismatch;
            false,
            ;
        }
        ;
        // Store the code
        this.codes.set(codeRecord.id, codeRecord);
        // Update rate limiting
        this.updateRateLimit(request.userId, request.deliveryAddress, request.ipAddress);
        // Log security event
        this.logSecurityEvent(SecurityEvent.CODE_GENERATED, {});
        codeId: codeRecord.id,
            userId;
        request.userId,
            type;
        request.type,
            deliveryChannel;
        request.deliveryChannel,
            expiresAt;
        codeRecord.expiresAt,
        ;
    }
    request;
    ipAddress;
    request;
    userAgent;
    ;
}
this.emit('codeGenerated', {});
codeId: codeRecord.id,
    userId;
request.userId,
    type;
request.type,
    deliveryChannel;
request.deliveryChannel,
    expiresAt;
codeRecord.expiresAt,
;
;
return {
    code: rawCode,
    codeId: codeRecord.id,
};
try { }
catch (error) {
    this.logSecurityEvent(SecurityEvent.SUSPICIOUS_ACTIVITY, {});
    error: error instanceof Error ? error.message : 'Code generation error',
        request;
}
request.ipAddress, request.userAgent;
;
return null;
async;
validateCode(request, CodeValidationRequest);
Promise < ValidationResult > {
    try: {
        // Apply anti-enumeration delay
        await, this: .antiEnumerationDelay(),
        // Find matching active codes for the user
        const: userCodes = this.getUserActiveCodes(request.userId, request.type),
        for(, code, of, userCodes) {
            // Check if code matches
            const hashedInput = this.hashCode(request.code, code.salt);
            if (!timingSafeEqual(Buffer.from(hashedInput, 'hex'), Buffer.from(code.hashedCode, 'hex'))) {
                continue;
                // Found matching code - now validate it
                return await this.validateFoundCode(code, request);
                // No matching code found - increment failed attempts for all user codes of this type
                userCodes.forEach(code => { });
                code.attempts++;
                if (code.attempts >= code.maxAttempts) {
                    code.status = CodeStatus.RATE_LIMITED;
                    this.codes.set(code.id, code);
                }
                ;
                // If all codes are rate limited, return specific reason
                if (userCodes.length > 0 && userCodes.every(code => code.status === CodeStatus.RATE_LIMITED)) {
                    return {
                        valid: false,
                        reason: 'too_many_attempts',
                        riskScore: 70,
                    };
                    this.logSecurityEvent(SecurityEvent.INVALID_CODE_ATTEMPT, {});
                    userId: request.userId,
                        type;
                    request.type,
                        codeLength;
                    request.code.length,
                    ;
                }
                request.ipAddress, request.userAgent;
                ;
                return {
                    valid: false,
                    reason: 'invalid_code',
                    riskScore: 60,
                };
            }
            try { }
            catch (error) {
                this.logSecurityEvent(SecurityEvent.SUSPICIOUS_ACTIVITY, {});
                error: error instanceof Error ? error.message : 'Code validation error',
                    userId;
                request.userId,
                ;
            }
            request.ipAddress, request.userAgent;
            ;
            return {
                valid: false,
                reason: 'validation_error',
                riskScore: 90,
            };
            /**
             * Use a verification code (marks it as used)
             */
        }
        /**
         * Use a verification code (marks it as used)
         */
        ,
        /**
         * Use a verification code (marks it as used)
         */
        async useCode(request) {
            const validation = await this.validateCode(request);
            if (!validation.valid || !validation.codeData) {
                return {
                    success: false,
                    reason: validation.reason,
                };
                const code = validation.codeData;
                // Mark code as used
                code.status = CodeStatus.USED;
                code.usedAt = new Date();
                this.codes.set(code.id, code);
                this.logSecurityEvent(SecurityEvent.CODE_USED, {});
                codeId: code.id,
                    userId;
                code.userId,
                    type;
                code.type,
                    attempts;
                code.attempts,
                ;
            }
            request.ipAddress, request.userAgent;
            ;
            this.emit('codeUsed', {});
            codeId: code.id,
                userId;
            code.userId,
                type;
            code.type,
                usedAt;
            code.usedAt,
            ;
        },
        return: {
            success: true,
            codeData: code,
        },
        /**
         * Revoke a specific verification code
         */
        async revokeCode(codeId, reason) {
            const code = this.codes.get(codeId);
            if (!code || code.status !== CodeStatus.ACTIVE) {
                return false;
                code.status = CodeStatus.REVOKED;
                code.revokedAt = new Date();
                code.metadata.revocationReason = reason;
                this.codes.set(codeId, code);
                this.logSecurityEvent(SecurityEvent.CODE_REVOKED, {});
                codeId,
                    userId;
                code.userId,
                    type;
                code.type,
                    reason;
            }
            ;
            this.emit('codeRevoked', {});
            codeId,
                userId;
            code.userId,
                type;
            code.type,
                reason,
                revokedAt;
            code.revokedAt,
            ;
        },
        return: true,
        /**
         * Revoke all codes for a user of a specific type
         */
        async revokeUserCodes(userId, type, reason = 'user_requested') {
            let revokedCount = 0;
            for (const [codeId, code] of this.codes) {
                if (code.userId === userId && )
                    code.status === CodeStatus.ACTIVE &&
                        (!type || code.type === type);
                {
                    await this.revokeCode(codeId, reason);
                    revokedCount++;
                    return revokedCount;
                    /**
                    * Get verification code information (without sensitive data)
                    */
                }
                /**
                * Get verification code information (without sensitive data)
                */
            }
            /**
            * Get verification code information (without sensitive data)
            */
        }
        /**
        * Get verification code information (without sensitive data)
        */
        ,
        /**
        * Get verification code information (without sensitive data)
        */
        getCodeInfo(codeId) {
            const code = this.codes.get(codeId);
            if (!code)
                return null;
            // Return safe subset of code data
            return {
                id: code.id,
                userId: code.userId,
                type: code.type,
                format: code.format,
                status: code.status,
                createdAt: code.createdAt,
                expiresAt: code.expiresAt,
                usedAt: code.usedAt,
                revokedAt: code.revokedAt,
                attempts: code.attempts,
                maxAttempts: code.maxAttempts,
                deliveryChannel: code.deliveryChannel,
                deliveryAddress: code.deliveryAddress,
                securityFlags: code.securityFlags,
            };
            /**
             * Get active codes for a user
             */
        }
        /**
         * Get active codes for a user
         */
        ,
        /**
         * Get active codes for a user
         */
        getUserActiveCodes(userId, type) {
            const userCodes = [];
            for (const code of this.codes.values()) {
                if (code.userId === userId && )
                    code.status === CodeStatus.ACTIVE &&
                        (!type || code.type === type);
                {
                    userCodes.push(code);
                    return userCodes;
                    /**
                     * Get comprehensive statistics
                     */
                }
                /**
                 * Get comprehensive statistics
                 */
            }
            /**
             * Get comprehensive statistics
             */
        }
        /**
         * Get comprehensive statistics
         */
        ,
        /**
         * Get comprehensive statistics
         */
        getStatistics() {
            const codes = Array.from(this.codes.values());
            const stats = {
                totalCodes: codes.length,
                activeCodes: 0,
                usedCodes: 0,
                expiredCodes: 0,
                revokedCodes: 0,
                codesByType: {},
                codesByChannel: {},
                successRate: 0,
                averageAttempts: 0,
                securityViolations: 0,
                rateLimitViolations: 0,
                averageCodeLifetime: 0 };
            // Initialize counters
            Object.values(VerificationCodeType).forEach(type => { });
            stats.codesByType[type] = 0;
        },
        Object, : .values(DeliveryChannel).forEach(channel => { }),
        stats, : .codesByChannel[channel] = 0
    },
    let, totalAttempts = 0,
    let, totalLifetime = 0,
    let, completedCodes = 0,
    // Calculate statistics
    codes, : .forEach(code => { })
    // Status counts
    ,
    // Status counts
    switch(code) { }, : .status
};
{
    CodeStatus.ACTIVE;
    stats.activeCodes++;
    break;
    CodeStatus.USED;
    stats.usedCodes++;
    completedCodes++;
    break;
    CodeStatus.EXPIRED;
    stats.expiredCodes++;
    completedCodes++;
    break;
    CodeStatus.REVOKED;
    stats.revokedCodes++;
    completedCodes++;
    break;
    // Type and channel counts
    stats.codesByType[code.type]++;
    stats.codesByChannel[code.deliveryChannel]++;
    // Attempt tracking
    totalAttempts += code.attempts;
    // Lifetime calculation for completed codes
    if (code.usedAt || code.revokedAt || code.status === CodeStatus.EXPIRED) {
        const endTime = code.usedAt || code.revokedAt || code.expiresAt;
        const lifetime = endTime.getTime() - code.createdAt.getTime();
        totalLifetime += lifetime;
        // Security violations
        if (code.securityFlags.suspiciousActivity) {
            stats.securityViolations++;
        }
        ;
        // Calculate rates and averages
        stats.successRate = stats.totalCodes > 0 ? (stats.usedCodes / stats.totalCodes) * 100 : 0;
        stats.averageAttempts = stats.totalCodes > 0 ? totalAttempts / stats.totalCodes : 0;
        stats.averageCodeLifetime = completedCodes > 0 ? totalLifetime / completedCodes : 0;
        return stats;
        updateConfig(newConfig, (Partial));
        void {
            this: .config = this.mergeConfig(newConfig),
            this: .emit('configUpdated', { config: this.config }),
            // Private helper methods
            mergeConfig(config) {
                return {
                    defaultExpiration: 10 * 60 * 1000, // 10 minutes,
                    maxExpiration: 60 * 60 * 1000, // 1 hour,
                    retryLimit: 3,
                    rateLimitWindow: 15 * 60 * 1000, // 15 minutes,
                    rateLimitCount: 5,
                    cleanupInterval: 30 * 60 * 1000, // 30 minutes,
                    codeFormats: {
                        [VerificationCodeType.EMAIL_VERIFICATION]: CodeFormat.NUMERIC_6,
                        [VerificationCodeType.SMS_VERIFICATION]: CodeFormat.NUMERIC_6,
                        [VerificationCodeType.TOTP_BACKUP]: CodeFormat.NUMERIC_8,
                        [VerificationCodeType.PASSWORD_RESET]: CodeFormat.ALPHANUMERIC_8,
                        [VerificationCodeType.ACCOUNT_RECOVERY]: CodeFormat.ALPHANUMERIC_8,
                        [VerificationCodeType.DEVICE_VERIFICATION]: CodeFormat.NUMERIC_6,
                        [VerificationCodeType.LOGIN_CONFIRMATION]: CodeFormat.NUMERIC_4,
                        [VerificationCodeType.TRANSACTION_APPROVAL]: CodeFormat.NUMERIC_6,
                    },
                    expirationTimes: {
                        [VerificationCodeType.EMAIL_VERIFICATION]: 30 * 60 * 1000, // 30 minutes,
                        [VerificationCodeType.SMS_VERIFICATION]: 10 * 60 * 1000, // 10 minutes,
                        [VerificationCodeType.TOTP_BACKUP]: 5 * 60 * 1000, // 5 minutes,
                        [VerificationCodeType.PASSWORD_RESET]: 60 * 60 * 1000, // 1 hour,
                        [VerificationCodeType.ACCOUNT_RECOVERY]: 60 * 60 * 1000, // 1 hour,
                        [VerificationCodeType.DEVICE_VERIFICATION]: 15 * 60 * 1000, // 15 minutes,
                        [VerificationCodeType.LOGIN_CONFIRMATION]: 2 * 60 * 1000, // 2 minutes,
                        [VerificationCodeType.TRANSACTION_APPROVAL]: 5 * 60 * 1000 // 5 minutes,
                    },
                    retryLimits: {
                        [VerificationCodeType.EMAIL_VERIFICATION]: 5,
                        [VerificationCodeType.SMS_VERIFICATION]: 3,
                        [VerificationCodeType.TOTP_BACKUP]: 3,
                        [VerificationCodeType.PASSWORD_RESET]: 5,
                        [VerificationCodeType.ACCOUNT_RECOVERY]: 5,
                        [VerificationCodeType.DEVICE_VERIFICATION]: 3,
                        [VerificationCodeType.LOGIN_CONFIRMATION]: 3,
                        [VerificationCodeType.TRANSACTION_APPROVAL]: 3,
                    },
                    enableSecurityLogging: true,
                    antiEnumerationDelay: 1000, // 1 second
                    requireSecureDelivery: false,
                    ...config
                };
            },
            generateCodeByFormat(format) {
                switch (format) {
                    case CodeFormat.NUMERIC_4:
                        return this.generateNumericCode(4);
                    case CodeFormat.NUMERIC_6:
                        return this.generateNumericCode(6);
                    case CodeFormat.NUMERIC_8:
                        return this.generateNumericCode(8);
                    case CodeFormat.ALPHANUMERIC_6:
                        return this.generateAlphanumericCode(6);
                    case CodeFormat.ALPHANUMERIC_8:
                        return this.generateAlphanumericCode(8);
                    case CodeFormat.UUID:
                        return this.generateUUID();
                    default:
                        return this.generateNumericCode(6);
                }
            },
            generateNumericCode(length) {
                let code = '';
                for (let i = 0; i < length; i++) {
                    code += randomInt(0, 10).toString();
                    return code;
                }
            },
            generateAlphanumericCode(length) {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let code = '';
                for (let i = 0; i < length; i++) {
                    code += chars[randomInt(0, chars.length)];
                    return code;
                }
            },
            generateUUID() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                    const r = randomInt(0, 16);
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            },
            generateSalt() {
                let salt = '';
                for (let i = 0; i < 32; i++) {
                    salt += randomInt(0, 16).toString(16);
                    return salt;
                }
            },
            generateCodeId() {
                return `code_${Date.now()}_${this.generateSalt().substring(0, 8)}`;
            },
            hashCode(code, salt) {
                return createHash('sha256').update(code + salt).digest('hex');
            },
            calculateExpiration(type, requestedMinutes) {
                let baseExpiration = this.config.expirationTimes[type] || this.config.defaultExpiration;
                if (requestedMinutes) {
                    const requestedMs = requestedMinutes * 60 * 1000;
                    baseExpiration = Math.min(requestedMs, this.config.maxExpiration);
                    return baseExpiration;
                }
            },
            async validateFoundCode(code, request) {
                // Check if code is expired
                if (code.expiresAt < new Date()) {
                    code.status = CodeStatus.EXPIRED;
                    this.codes.set(code.id, code);
                    this.logSecurityEvent(SecurityEvent.CODE_EXPIRED, {});
                    codeId: code.id,
                        userId;
                    code.userId,
                        type;
                    code.type,
                    ;
                }
                request.ipAddress, request.userAgent;
                ;
                return {
                    valid: false,
                    codeData: code,
                    reason: 'code_expired',
                    riskScore: 20,
                };
                // Check if code is rate limited
                if (code.status === CodeStatus.RATE_LIMITED || code.attempts >= code.maxAttempts) {
                    return {
                        valid: false,
                        codeData: code,
                        reason: 'too_many_attempts',
                        attemptsRemaining: 0,
                        riskScore: 70,
                    };
                    // Check for suspicious activity
                    const securityWarnings = [];
                    let riskScore = 0;
                    if (code.ipAddress !== request.ipAddress) {
                        securityWarnings.push('ip_address_mismatch');
                        riskScore += 30;
                        if (code.userAgent !== request.userAgent) {
                            securityWarnings.push('user_agent_mismatch');
                            riskScore += 20;
                            if (code.attempts > 1) {
                                securityWarnings.push('multiple_attempts');
                                riskScore += 15;
                                code.securityFlags.multipleAttempts = true;
                                // Valid code
                                code.attempts++;
                                this.codes.set(code.id, code);
                                this.logSecurityEvent(SecurityEvent.CODE_VALIDATED, {});
                                codeId: code.id,
                                    userId;
                                code.userId,
                                    type;
                                code.type,
                                    attempts;
                                code.attempts,
                                    riskScore;
                            }
                            request.ipAddress, request.userAgent;
                            ;
                            return {
                                valid: true,
                                codeData: code,
                                attemptsRemaining: code.maxAttempts - code.attempts,
                                securityWarnings: securityWarnings.length > 0 ? securityWarnings : undefined,
                                riskScore
                            };
                        }
                    }
                }
            },
            isRateLimited(userId, deliveryAddress, ipAddress) {
                const keys = [userId, deliveryAddress, ipAddress];
                for (const key of keys) {
                    const rateLimit = this.rateLimits.get(key);
                    if (!rateLimit)
                        continue;
                    const now = Date.now();
                    if (now < rateLimit.resetTime && rateLimit.count >= this.config.rateLimitCount) {
                        return true;
                        return false;
                    }
                }
            },
            updateRateLimit(userId, deliveryAddress, ipAddress) {
                const keys = [userId, deliveryAddress, ipAddress];
                const now = Date.now();
                const resetTime = now + this.config.rateLimitWindow;
                for (const key of keys) {
                    const existing = this.rateLimits.get(key);
                    if (!existing || now >= existing.resetTime) {
                        this.rateLimits.set(key, {});
                        count: 1,
                            resetTime,
                            lastRequest;
                        new Date(),
                            violations;
                        existing?.violations || 0,
                        ;
                    }
                    ;
                }
            }, else: {
                existing, : .count++,
                existing, : .lastRequest = new Date(),
                if(existing) { }, : .count > this.config.rateLimitCount
            }
        };
        {
            existing.violations++;
            async;
            antiEnumerationDelay();
            Promise < void  > {
                return: new Promise(resolve => { }),
                : .config.antiEnumerationDelay };
            ;
            logSecurityEvent(event, SecurityEvent),
                details;
            (Record),
                ipAddress;
            string = 'system',
                userAgent;
            string = 'system';
            void {
                : .config.enableSecurityLogging, return: ,
                this: .emit('securityEvent', {}),
                event,
                timestamp: new Date(),
                ipAddress,
                userAgent,
                details };
            ;
            startCleanupTimer();
            void {
                this: .cleanupTimer = setInterval(() => {
                    this.performCleanup();
                }, this.config.cleanupInterval),
                performCleanup() {
                    const now = new Date();
                    const cleanupThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago;
                    let codesRemoved = 0;
                    // Clean up expired, used, and revoked codes
                    for (const [codeId, code] of this.codes) {
                        const shouldCleanup = ();
                        ;
                        code.status === CodeStatus.EXPIRED ||
                            code.status === CodeStatus.USED ||
                            code.status === CodeStatus.REVOKED;
                         && code.createdAt < cleanupThreshold;
                        if (shouldCleanup) {
                            this.codes.delete(codeId);
                            codesRemoved++;
                            // Clean up old rate limit data
                            for (const [key, rateLimit] of this.rateLimits) {
                                if (now.getTime() > rateLimit.resetTime + this.config.rateLimitWindow) {
                                    this.rateLimits.delete(key);
                                    this.logSecurityEvent(SecurityEvent.CODE_CLEANUP, {});
                                    codesRemoved,
                                        activeCodes;
                                    this.codes.size,
                                        rateLimitEntries;
                                    this.rateLimits.size,
                                    ;
                                }
                                ;
                                this.emit('cleanupCompleted', {});
                                codesRemoved,
                                    timestamp;
                                now,
                                ;
                            }
                            ;
                            /**
                             * Destroy the verification code manager and clean up resources
                             */
                        }
                        /**
                         * Destroy the verification code manager and clean up resources
                         */
                    }
                    /**
                     * Destroy the verification code manager and clean up resources
                     */
                }
                /**
                 * Destroy the verification code manager and clean up resources
                 */
                ,
                /**
                 * Destroy the verification code manager and clean up resources
                 */
                destroy() {
                    if (this.cleanupTimer) {
                        clearInterval(this.cleanupTimer);
                        this.codes.clear();
                        this.rateLimits.clear();
                        this.emit('destroyed');
                        // Export default instance
                        export default VerificationCodeManager;
                    }
                }
            };
        }
    }
}
