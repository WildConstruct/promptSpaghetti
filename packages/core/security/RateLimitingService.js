/**
 * Comprehensive Rate Limiting Service
 *
 * Advanced rate limiting system for authentication endpoints with intelligent
 * backoff strategies, threat detection, and adaptive protection mechanisms.
 *
 * Features:
 * - Multi-tier rate limiting (IP, user, endpoint-specific)
 * - Intelligent backoff algorithms (exponential, linear, fibonacci)
 * - Threat-based adaptive limits
 * - Geographic and behavioral analysis
 * - Integration with security monitoring
 */
import { EventEmitter } from 'events';
// Rate Limiting Strategy Types
export var RateLimitStrategy;
(function (RateLimitStrategy) {
    RateLimitStrategy["FIXED_WINDOW"] = "fixed_window";
    RateLimitStrategy["SLIDING_WINDOW"] = "sliding_window";
    RateLimitStrategy["TOKEN_BUCKET"] = "token_bucket";
    RateLimitStrategy["LEAKY_BUCKET"] = "leaky_bucket";
})(RateLimitStrategy || (RateLimitStrategy = {}));
// Backoff Strategy Types
export var BackoffStrategy;
(function (BackoffStrategy) {
    BackoffStrategy["EXPONENTIAL"] = "exponential";
    BackoffStrategy["LINEAR"] = "linear";
    BackoffStrategy["FIBONACCI"] = "fibonacci";
    BackoffStrategy["CUSTOM"] = "custom";
})(BackoffStrategy || (BackoffStrategy = {}));
// Endpoint Categories
export var EndpointCategory;
(function (EndpointCategory) {
    EndpointCategory["AUTHENTICATION"] = "authentication";
    EndpointCategory["MFA_VERIFICATION"] = "mfa_verification";
    EndpointCategory["PASSWORD_RESET"] = "password_reset";
    EndpointCategory["REGISTRATION"] = "registration";
    EndpointCategory["PROFILE_UPDATE"] = "profile_update";
    EndpointCategory["ADMIN_OPERATIONS"] = "admin_operations";
})(EndpointCategory || (EndpointCategory = {}));
// Threat Level Classifications
export var ThreatLevel;
(function (ThreatLevel) {
    ThreatLevel["LOW"] = "low";
    ThreatLevel["MEDIUM"] = "medium";
    ThreatLevel["HIGH"] = "high";
    ThreatLevel["CRITICAL"] = "critical";
})(ThreatLevel || (ThreatLevel = {}));
// Rate Limit Result Types
export var RateLimitResult;
(function (RateLimitResult) {
    RateLimitResult["ALLOWED"] = "allowed";
    RateLimitResult["BLOCKED"] = "blocked";
    RateLimitResult["WARNING"] = "warning";
})(RateLimitResult || (RateLimitResult = {}));
/**
 * Advanced rate limiting service with threat detection and adaptive protection
 */
export class RateLimitingService extends EventEmitter {
    attempts = new Map();
    backoffStates = new Map();
    threatContexts = new Map();
    endpointConfigs = new Map();
    exemptions = new Set();
    constructor() {
        super();
        this.initializeDefaultConfigs();
        this.startCleanupTimer();
    }
    /**
     * Check if request should be allowed based on rate limits
     */
    async checkRateLimit(identifier, endpoint, metadata = {}) {
        // Check exemptions first
        if (this.exemptions.has(identifier)) {
            return this.createAllowedStatus(identifier, endpoint, 'exempted');
        }
        const config = this.getEndpointConfig(endpoint);
        const threatLevel = await this.assessThreatLevel(identifier, endpoint, metadata);
        const adaptiveMultiplier = this.calculateAdaptiveMultiplier(threatLevel, config);
        // Get current backoff state
        const backoffState = this.getBackoffState(identifier, endpoint);
        // Check if currently in backoff period
        if (backoffState && new Date() < backoffState.nextAllowedTime) {
            const retryAfter = Math.ceil((backoffState.nextAllowedTime.getTime() - Date.now()) / 1000);
            return {
                identifier,
                endpoint,
                result: RateLimitResult.BLOCKED,
                remainingRequests: 0,
                resetTime: backoffState.nextAllowedTime,
                retryAfter,
                backoffLevel: backoffState.level,
                threatLevel,
                adaptiveMultiplier
            };
        }
        // Check rate limits
        const attempts = this.getRecentAttempts(identifier, endpoint);
        const limits = this.getAdjustedLimits(config, adaptiveMultiplier);
        const rateLimitCheck = this.evaluateRateLimits(attempts, limits);
        if (rateLimitCheck.blocked) {
            // Trigger backoff for failed attempt
            this.updateBackoffState(identifier, endpoint, false);
            this.emit('rateLimitExceeded', {
                identifier,
                endpoint,
                threatLevel,
                attempts: attempts.length,
                limit: rateLimitCheck.limit
            });
            return {
                identifier,
                endpoint,
                result: RateLimitResult.BLOCKED,
                remainingRequests: 0,
                resetTime: rateLimitCheck.resetTime,
                retryAfter: rateLimitCheck.retryAfter,
                backoffLevel: backoffState?.level || 0,
                threatLevel,
                adaptiveMultiplier
            };
        }
        // Request allowed - reset backoff on success
        this.updateBackoffState(identifier, endpoint, true);
        return {
            identifier,
            endpoint,
            result: rateLimitCheck.warning ? RateLimitResult.WARNING : RateLimitResult.ALLOWED,
            remainingRequests: rateLimitCheck.remaining,
            resetTime: rateLimitCheck.resetTime,
            backoffLevel: 0,
            threatLevel,
            adaptiveMultiplier
        };
    }
    /**
     * Record an authentication attempt
     */
    recordAttempt(identifier, endpoint, success, metadata = {}) {
        const attempt = {
            identifier,
            endpoint,
            timestamp: new Date(),
            success,
            metadata: {
                threatLevel: ThreatLevel.LOW,
                ...metadata
            }
        };
        const key = this.getAttemptKey(identifier, endpoint);
        const attempts = this.attempts.get(key) || [];
        attempts.push(attempt);
        // Keep only recent attempts (last 24 hours)
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentAttempts = attempts.filter(a => a.timestamp > cutoff);
        this.attempts.set(key, recentAttempts);
        // Update threat context
        this.updateThreatContext(identifier, attempt);
        // Update backoff state for failed attempts
        this.updateBackoffState(identifier, endpoint, success);
        this.emit('attemptRecorded', attempt);
    }
    /**
     * Add rate limit exemption for identifier
     */
    addExemption(identifier, reason = 'manual') {
        this.exemptions.add(identifier);
        this.emit('exemptionAdded', {
            identifier,
            reason,
            timestamp: new Date()
        });
    }
    /**
     * Remove rate limit exemption
     */
    removeExemption(identifier) {
        const removed = this.exemptions.delete(identifier);
        if (removed) {
            this.emit('exemptionRemoved', {
                identifier,
                timestamp: new Date()
            });
        }
        return removed;
    }
    /**
     * Get current backoff delay for identifier
     */
    getBackoffDelay(identifier, endpoint) {
        const backoffState = this.getBackoffState(identifier, endpoint);
        if (!backoffState)
            return 0;
        const now = Date.now();
        if (now >= backoffState.nextAllowedTime.getTime())
            return 0;
        return Math.ceil((backoffState.nextAllowedTime.getTime() - now) / 1000);
    }
    /**
     * Get the calculated backoff delay for the current level (for testing)
     */
    getCalculatedBackoffDelay(identifier, endpoint) {
        const backoffState = this.getBackoffState(identifier, endpoint);
        if (!backoffState)
            return 0;
        const config = this.getEndpointConfig(endpoint);
        return this.calculateBackoffDelay(backoffState.level, config.backoff);
    }
    /**
     * Reset rate limits and backoff for identifier
     */
    resetLimits(identifier, endpoint) {
        if (endpoint) {
            const attemptKey = this.getAttemptKey(identifier, endpoint);
            const backoffKey = this.getBackoffKey(identifier, endpoint);
            this.attempts.delete(attemptKey);
            this.backoffStates.delete(backoffKey);
        }
        else {
            // Reset all endpoints for identifier
            for (const [key] of this.attempts) {
                if (key.startsWith(`${identifier}:`)) {
                    this.attempts.delete(key);
                }
            }
            for (const [key] of this.backoffStates) {
                if (key.startsWith(`${identifier}:`)) {
                    this.backoffStates.delete(key);
                }
            }
        }
        this.emit('limitsReset', { identifier, endpoint });
    }
    /**
     * Get rate limiting statistics
     */
    getStatistics() {
        let totalAttempts = 0;
        let blockedAttempts = 0;
        const threatCounts = {
            [ThreatLevel.LOW]: 0,
            [ThreatLevel.MEDIUM]: 0,
            [ThreatLevel.HIGH]: 0,
            [ThreatLevel.CRITICAL]: 0
        };
        const endpointCounts = {};
        for (const attempts of this.attempts.values()) {
            for (const attempt of attempts) {
                totalAttempts++;
                if (!attempt.success)
                    blockedAttempts++;
                threatCounts[attempt.metadata.threatLevel]++;
                endpointCounts[attempt.endpoint] = (endpointCounts[attempt.endpoint] || 0) + 1;
            }
        }
        const topEndpoints = Object.entries(endpointCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([endpoint, attempts]) => ({ endpoint, attempts }));
        return {
            totalAttempts,
            blockedAttempts,
            activeBackoffs: this.backoffStates.size,
            threatLevels: threatCounts,
            topEndpoints
        };
    }
    // Private helper methods
    initializeDefaultConfigs() {
        // Authentication endpoints
        this.endpointConfigs.set('/auth/login', {
            category: EndpointCategory.AUTHENTICATION,
            endpoint: '/auth/login',
            limits: {
                perSecond: 2,
                perMinute: 10,
                perHour: 50,
                perDay: 200
            },
            backoff: {
                strategy: BackoffStrategy.EXPONENTIAL,
                baseDelay: 5,
                maxDelay: 3600,
                multiplier: 2
            },
            burst: {
                enabled: true,
                size: 5,
                refillRate: 0.5
            },
            adaptiveTriggers: {
                suspiciousActivityThreshold: 5,
                threatLevelAdjustments: {
                    [ThreatLevel.LOW]: 1.0,
                    [ThreatLevel.MEDIUM]: 0.5,
                    [ThreatLevel.HIGH]: 0.25,
                    [ThreatLevel.CRITICAL]: 0.1
                }
            }
        });
        // MFA verification
        this.endpointConfigs.set('/auth/mfa/verify', {
            category: EndpointCategory.MFA_VERIFICATION,
            endpoint: '/auth/mfa/verify',
            limits: {
                perSecond: 1,
                perMinute: 5,
                perHour: 20,
                perDay: 100
            },
            backoff: {
                strategy: BackoffStrategy.FIBONACCI,
                baseDelay: 10,
                maxDelay: 1800,
                multiplier: 1
            },
            burst: {
                enabled: false,
                size: 0,
                refillRate: 0
            },
            adaptiveTriggers: {
                suspiciousActivityThreshold: 3,
                threatLevelAdjustments: {
                    [ThreatLevel.LOW]: 1.0,
                    [ThreatLevel.MEDIUM]: 0.6,
                    [ThreatLevel.HIGH]: 0.3,
                    [ThreatLevel.CRITICAL]: 0.1
                }
            }
        });
        // Password reset
        this.endpointConfigs.set('/auth/password/reset', {
            category: EndpointCategory.PASSWORD_RESET,
            endpoint: '/auth/password/reset',
            limits: {
                perSecond: 1,
                perMinute: 3,
                perHour: 10,
                perDay: 25
            },
            backoff: {
                strategy: BackoffStrategy.LINEAR,
                baseDelay: 60,
                maxDelay: 3600,
                multiplier: 1.5
            },
            burst: {
                enabled: false,
                size: 0,
                refillRate: 0
            },
            adaptiveTriggers: {
                suspiciousActivityThreshold: 2,
                threatLevelAdjustments: {
                    [ThreatLevel.LOW]: 1.0,
                    [ThreatLevel.MEDIUM]: 0.7,
                    [ThreatLevel.HIGH]: 0.4,
                    [ThreatLevel.CRITICAL]: 0.2
                }
            }
        });
        // Registration
        this.endpointConfigs.set('/auth/register', {
            category: EndpointCategory.REGISTRATION,
            endpoint: '/auth/register',
            limits: {
                perSecond: 1,
                perMinute: 2,
                perHour: 5,
                perDay: 10
            },
            backoff: {
                strategy: BackoffStrategy.EXPONENTIAL,
                baseDelay: 30,
                maxDelay: 7200,
                multiplier: 3
            },
            burst: {
                enabled: false,
                size: 0,
                refillRate: 0
            },
            adaptiveTriggers: {
                suspiciousActivityThreshold: 1,
                threatLevelAdjustments: {
                    [ThreatLevel.LOW]: 1.0,
                    [ThreatLevel.MEDIUM]: 0.5,
                    [ThreatLevel.HIGH]: 0.2,
                    [ThreatLevel.CRITICAL]: 0.05
                }
            }
        });
    }
    getEndpointConfig(endpoint) {
        return this.endpointConfigs.get(endpoint) || this.getDefaultConfig(endpoint);
    }
    getDefaultConfig(endpoint) {
        return {
            category: EndpointCategory.AUTHENTICATION,
            endpoint,
            limits: {
                perSecond: 5,
                perMinute: 20,
                perHour: 100,
                perDay: 500
            },
            backoff: {
                strategy: BackoffStrategy.EXPONENTIAL,
                baseDelay: 1,
                maxDelay: 300,
                multiplier: 2
            },
            burst: {
                enabled: true,
                size: 10,
                refillRate: 1
            },
            adaptiveTriggers: {
                suspiciousActivityThreshold: 10,
                threatLevelAdjustments: {
                    [ThreatLevel.LOW]: 1.0,
                    [ThreatLevel.MEDIUM]: 0.8,
                    [ThreatLevel.HIGH]: 0.5,
                    [ThreatLevel.CRITICAL]: 0.3
                }
            }
        };
    }
    async assessThreatLevel(identifier, endpoint, metadata) {
        const context = this.threatContexts.get(identifier);
        const recentAttempts = this.getRecentAttempts(identifier, endpoint);
        let threatScore = 0;
        // Recent failures increase threat
        const recentFailures = recentAttempts.filter(a => !a.success).length;
        threatScore += recentFailures * 10;
        // Rapid requests increase threat
        const last5MinuteAttempts = recentAttempts.filter(a => a.timestamp > new Date(Date.now() - 5 * 60 * 1000)).length;
        if (last5MinuteAttempts > 10)
            threatScore += 20;
        // Multiple endpoints increase threat
        const uniqueEndpoints = new Set(recentAttempts.map(a => a.endpoint)).size;
        if (uniqueEndpoints > 3)
            threatScore += 15;
        // Context-based scoring
        if (context) {
            threatScore += context.confidence * 0.3;
            if (context.geolocation?.suspicious)
                threatScore += 25;
            if (context.behaviorPattern.rapidRequests)
                threatScore += 15;
            if (context.behaviorPattern.newDevice)
                threatScore += 10;
        }
        // Determine threat level
        if (threatScore >= 80)
            return ThreatLevel.CRITICAL;
        if (threatScore >= 60)
            return ThreatLevel.HIGH;
        if (threatScore >= 30)
            return ThreatLevel.MEDIUM;
        return ThreatLevel.LOW;
    }
    calculateAdaptiveMultiplier(threatLevel, config) {
        return config.adaptiveTriggers.threatLevelAdjustments[threatLevel];
    }
    getBackoffState(identifier, endpoint) {
        const key = this.getBackoffKey(identifier, endpoint);
        return this.backoffStates.get(key) || null;
    }
    updateBackoffState(identifier, endpoint, success) {
        const key = this.getBackoffKey(identifier, endpoint);
        const config = this.getEndpointConfig(endpoint);
        let state = this.backoffStates.get(key);
        if (!state) {
            state = {
                identifier,
                endpoint,
                level: 0,
                nextAllowedTime: new Date(),
                consecutiveFailures: 0,
                totalFailures: 0,
                lastFailureTime: new Date()
            };
        }
        if (success) {
            // Reset backoff on success
            state.level = 0;
            state.consecutiveFailures = 0;
            state.nextAllowedTime = new Date(Date.now());
        }
        else {
            // Increase backoff on failure
            state.consecutiveFailures++;
            state.totalFailures++;
            state.lastFailureTime = new Date();
            state.level++;
            const delay = this.calculateBackoffDelay(state.level, config.backoff);
            state.nextAllowedTime = new Date(Date.now() + delay * 1000);
        }
        this.backoffStates.set(key, state);
    }
    calculateBackoffDelay(level, config) {
        let delay;
        switch (config.strategy) {
            case BackoffStrategy.EXPONENTIAL:
                delay = config.baseDelay * Math.pow(config.multiplier, level - 1);
                break;
            case BackoffStrategy.LINEAR:
                delay = config.baseDelay * level * config.multiplier;
                break;
            case BackoffStrategy.FIBONACCI:
                delay = config.baseDelay * this.fibonacci(level);
                break;
            default:
                delay = config.baseDelay * Math.pow(2, level - 1);
        }
        return Math.min(delay, config.maxDelay);
    }
    fibonacci(n) {
        if (n <= 1)
            return 1;
        let a = 1, b = 1;
        for (let i = 2; i <= n; i++) {
            [a, b] = [b, a + b];
        }
        return b;
    }
    getRecentAttempts(identifier, endpoint) {
        const key = this.getAttemptKey(identifier, endpoint);
        return this.attempts.get(key) || [];
    }
    getAdjustedLimits(config, multiplier) {
        return {
            perSecond: Math.ceil(config.limits.perSecond * multiplier),
            perMinute: Math.ceil(config.limits.perMinute * multiplier),
            perHour: Math.ceil(config.limits.perHour * multiplier),
            perDay: Math.ceil(config.limits.perDay * multiplier)
        };
    }
    evaluateRateLimits(attempts, limits) {
        const now = new Date();
        // Check per-second limit
        const lastSecond = attempts.filter(a => a.timestamp > new Date(now.getTime() - 1000));
        if (lastSecond.length >= limits.perSecond) {
            return {
                blocked: true,
                warning: false,
                remaining: 0,
                resetTime: new Date(now.getTime() + 1000),
                retryAfter: 1,
                limit: limits.perSecond
            };
        }
        // Check per-minute limit
        const lastMinute = attempts.filter(a => a.timestamp > new Date(now.getTime() - 60000));
        if (lastMinute.length >= limits.perMinute) {
            const resetTime = new Date(Math.ceil(now.getTime() / 60000) * 60000);
            return {
                blocked: true,
                warning: false,
                remaining: 0,
                resetTime,
                retryAfter: Math.ceil((resetTime.getTime() - now.getTime()) / 1000),
                limit: limits.perMinute
            };
        }
        // Check warning threshold (80% of limit)
        const warning = lastMinute.length >= limits.perMinute * 0.8;
        return {
            blocked: false,
            warning,
            remaining: limits.perMinute - lastMinute.length,
            resetTime: new Date(Math.ceil(now.getTime() / 60000) * 60000),
            limit: limits.perMinute
        };
    }
    updateThreatContext(identifier, attempt) {
        let context = this.threatContexts.get(identifier);
        if (!context) {
            context = {
                identifier,
                threatLevel: ThreatLevel.LOW,
                indicators: [],
                behaviorPattern: {
                    rapidRequests: false,
                    unusualTiming: false,
                    multipleEndpoints: false,
                    newDevice: false
                },
                confidence: 0
            };
        }
        // Update behavior patterns
        const recentAttempts = this.getRecentAttempts(identifier, attempt.endpoint);
        const last5Minutes = recentAttempts.filter(a => a.timestamp > new Date(Date.now() - 5 * 60 * 1000));
        context.behaviorPattern.rapidRequests = last5Minutes.length > 20;
        context.behaviorPattern.multipleEndpoints = new Set(last5Minutes.map(a => a.endpoint)).size > 2;
        this.threatContexts.set(identifier, context);
    }
    createAllowedStatus(identifier, endpoint, reason) {
        return {
            identifier,
            endpoint,
            result: RateLimitResult.ALLOWED,
            remainingRequests: Infinity,
            resetTime: new Date(Date.now() + 60000),
            backoffLevel: 0,
            threatLevel: ThreatLevel.LOW,
            adaptiveMultiplier: 1.0
        };
    }
    getAttemptKey(identifier, endpoint) {
        return `${identifier}:${endpoint}`;
    }
    getBackoffKey(identifier, endpoint) {
        return `backoff:${identifier}:${endpoint}`;
    }
    startCleanupTimer() {
        // Clean up old data every 5 minutes
        setInterval(() => {
            const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
            // Clean old attempts
            for (const [key, attempts] of this.attempts) {
                const recentAttempts = attempts.filter(a => a.timestamp > cutoff);
                if (recentAttempts.length === 0) {
                    this.attempts.delete(key);
                }
                else {
                    this.attempts.set(key, recentAttempts);
                }
            }
            // Clean expired backoff states
            const now = new Date();
            for (const [key, state] of this.backoffStates) {
                if (state.nextAllowedTime < now && state.consecutiveFailures === 0) {
                    this.backoffStates.delete(key);
                }
            }
            this.emit('cleanup', {
                timestamp: new Date(),
                clearedAttempts: this.attempts.size,
                activeBackoffs: this.backoffStates.size
            });
        }, 5 * 60 * 1000);
    }
}
// Export default instance
export default RateLimitingService;
