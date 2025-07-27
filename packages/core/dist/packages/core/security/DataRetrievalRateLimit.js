/**
 * Data Retrieval Rate Limiting System
 *
 * Enhanced rate limiting specifically designed for data access and retrieval operations.
 * Builds upon the existing RateLimitingService infrastructure to provide:
 * - Classification-aware rate limiting
 * - Data volume-based throttling
 * - User behavior analysis
 * - Adaptive limits based on data sensitivity
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-95 - Add rate limiting for data retrieval
 */
import { EventEmitter } from 'events';
import { RateLimitResult, BackoffStrategy } from './RateLimitingService';
import { DataClassificationLevel } from '../types/DataClassification';
// Extended endpoint categories for data operations
export var DataEndpointCategory;
(function (DataEndpointCategory) {
    DataEndpointCategory["DATA_READ"] = "data_read";
    DataEndpointCategory["DATA_EXPORT"] = "data_export";
    DataEndpointCategory["DATA_SEARCH"] = "data_search";
    DataEndpointCategory["DATA_BULK_ACCESS"] = "data_bulk_access";
    DataEndpointCategory["DATA_STREAM"] = "data_stream";
    DataEndpointCategory["DATA_ANALYTICS"] = "data_analytics";
    DataEndpointCategory["DATA_BACKUP"] = "data_backup";
    DataEndpointCategory["DATA_SYNC"] = "data_sync";
})(DataEndpointCategory || (DataEndpointCategory = {}));
/**
 * Enhanced Data Retrieval Rate Limiting Service
 */
export class DataRetrievalRateLimit extends EventEmitter {
    rateLimitingService;
    config;
    accessHistory = new Map();
    userQuotas = new Map();
    metrics;
    exemptions = new Map();
    constructor(rateLimitingService, config) {
        super();
        this.rateLimitingService = rateLimitingService;
        this.config = config;
        this.initializeMetrics();
        this.loadExemptions();
        this.startPeriodicTasks();
    }
    /**
     * Check if data retrieval request is allowed
     */
    async checkDataRetrievalLimit(subject, object, operation, requestDetails) {
        try {
            // Check for exemptions first
            const exemption = await this.checkExemptions(subject, object, operation);
            if (exemption) {
                this.recordAccess(subject, object, operation, requestDetails, true, false, 'EXEMPTION_GRANTED');
                return this.createDecision('ALLOW', 'Exemption granted', exemption.id);
            }
            // Get applicable limits
            const limits = this.getApplicableLimits(object.classification, operation);
            // Apply adaptive factors
            const adjustedLimits = await this.applyAdaptiveFactors(limits, subject, object);
            // Check rate limits
            const rateLimitCheck = await this.checkRateLimits(subject, adjustedLimits, requestDetails);
            if (rateLimitCheck.result === RateLimitResult.BLOCKED) {
                this.recordAccess(subject, object, operation, requestDetails, false, true, 'RATE_LIMITED');
                return this.createDecision('DENY', rateLimitCheck.reason, null, rateLimitCheck.retryAfter);
            }
            // Check volume limits
            const volumeCheck = await this.checkVolumeLimits(subject, object, requestDetails);
            if (!volumeCheck.allowed) {
                this.recordAccess(subject, object, operation, requestDetails, false, true, 'VOLUME_LIMITED');
                return this.createDecision('DENY', volumeCheck.reason, null, volumeCheck.retryAfter);
            }
            // Check quota limits
            if (this.config.quotaEnforcement) {
                const quotaCheck = await this.checkQuotaLimits(subject, object, requestDetails);
                if (!quotaCheck.allowed) {
                    this.recordAccess(subject, object, operation, requestDetails, false, true, 'QUOTA_EXCEEDED');
                    return this.createDecision('DENY', quotaCheck.reason, null, quotaCheck.retryAfter);
                }
            }
            // Check for anomalies
            if (this.config.enableAnomalyDetection) {
                const anomalyCheck = await this.checkForAnomalies(subject, object, operation, requestDetails);
                if (anomalyCheck.isAnomalous) {
                    this.emit('anomalyDetected', {
                        userId: subject.userId,
                        anomaly: anomalyCheck,
                        timestamp: new Date()
                    });
                    if (anomalyCheck.severity === 'HIGH' || anomalyCheck.severity === 'CRITICAL') {
                        this.recordAccess(subject, object, operation, requestDetails, false, true, 'ANOMALY_DETECTED');
                        return this.createDecision('DENY', `Anomalous activity detected: ${anomalyCheck.description}`, null, 300);
                    }
                }
            }
            // Update quotas and record access
            await this.updateUserQuota(subject.userId, requestDetails);
            this.recordAccess(subject, object, operation, requestDetails, true, false, 'ALLOWED');
            // Check for warnings
            const warnings = await this.checkForWarnings(subject, object, requestDetails);
            return this.createDecision('ALLOW', 'Access granted', null, null, warnings);
        }
        catch (error) {
            this.emit('error', {
                operation: 'checkDataRetrievalLimit',
                error: error.message,
                userId: subject.userId,
                resourceId: object.dataId,
                timestamp: new Date()
            });
            return this.createDecision('DENY', 'Service error, access denied for safety', null, 60);
        }
    }
    /**
     * Get current usage metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get user-specific usage data
     */
    getUserUsage(userId) {
        const userHistory = this.accessHistory.get(userId) || [];
        if (userHistory.length === 0)
            return null;
        const totalRequests = userHistory.length;
        const totalBytes = userHistory.reduce((sum, attempt) => sum + attempt.bytesRequested, 0);
        const totalRecords = userHistory.reduce((sum, attempt) => sum + attempt.recordsRequested, 0);
        const classifications = [...new Set(userHistory.map(h => h.classification))];
        const lastAccess = userHistory[userHistory.length - 1].timestamp;
        const avgRiskScore = userHistory.reduce((sum, h) => sum + h.riskScore, 0) / totalRequests;
        return {
            userId,
            requestCount: totalRequests,
            bytesAccessed: totalBytes,
            recordsAccessed: totalRecords,
            classificationsAccessed: classifications,
            lastAccess,
            riskScore: avgRiskScore,
            anomalyScore: this.calculateAnomalyScore(userHistory)
        };
    }
    /**
     * Add or update exemption
     */
    addExemption(exemption) {
        this.exemptions.set(exemption.id, exemption);
        this.emit('exemptionAdded', exemption);
    }
    /**
     * Remove exemption
     */
    removeExemption(exemptionId) {
        const removed = this.exemptions.delete(exemptionId);
        if (removed) {
            this.emit('exemptionRemoved', exemptionId);
        }
        return removed;
    }
    /**
     * Reset user quota
     */
    resetUserQuota(userId) {
        this.userQuotas.delete(userId);
        this.emit('quotaReset', { userId, timestamp: new Date() });
    }
    // Private helper methods...
    async checkRateLimits(subject, limits, requestDetails) {
        // Use the existing rate limiting service with extended endpoint categories
        const endpoint = this.getEndpointFromOperation(requestDetails.operation);
        // Check multiple rate limit scopes
        const checks = await Promise.all([
            this.rateLimitingService.checkRateLimit(subject.userId, endpoint),
            this.rateLimitingService.checkRateLimit(subject.location.country, endpoint),
            this.rateLimitingService.checkRateLimit(subject.device.deviceId, endpoint)
        ]);
        const blocked = checks.find(check => check.result === RateLimitResult.BLOCKED);
        if (blocked) {
            return {
                result: RateLimitResult.BLOCKED,
                reason: `Rate limit exceeded for ${blocked.endpoint}`,
                retryAfter: blocked.retryAfter
            };
        }
        return { result: RateLimitResult.ALLOWED };
    }
    async checkVolumeLimits(subject, object, requestDetails) {
        if (!this.config.enableVolumeTracking) {
            return { allowed: true };
        }
        const userHistory = this.accessHistory.get(subject.userId) || [];
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const recentHistory = userHistory.filter(h => h.timestamp > oneHourAgo);
        const totalBytes = recentHistory.reduce((sum, h) => sum + h.bytesRequested, 0);
        const totalRecords = recentHistory.reduce((sum, h) => sum + h.recordsRequested, 0);
        const limits = this.getApplicableLimits(object.classification, requestDetails.operation);
        if (totalBytes + requestDetails.estimatedBytes > limits.limits.bytesPerHour) {
            return {
                allowed: false,
                reason: 'Hourly byte limit exceeded',
                retryAfter: 3600 - Math.floor((now.getTime() - oneHourAgo.getTime()) / 1000)
            };
        }
        if (totalRecords + requestDetails.estimatedRecords > limits.limits.recordsPerHour) {
            return {
                allowed: false,
                reason: 'Hourly record limit exceeded',
                retryAfter: 3600 - Math.floor((now.getTime() - oneHourAgo.getTime()) / 1000)
            };
        }
        return { allowed: true };
    }
    async checkQuotaLimits(subject, object, requestDetails) {
        const quota = this.userQuotas.get(subject.userId);
        if (!quota) {
            // Initialize new quota
            this.initializeUserQuota(subject.userId);
            return { allowed: true };
        }
        if (quota.bytesUsed + requestDetails.estimatedBytes > quota.dailyByteLimit) {
            return {
                allowed: false,
                reason: 'Daily byte quota exceeded',
                retryAfter: this.getSecondsUntilMidnight()
            };
        }
        if (quota.recordsUsed + requestDetails.estimatedRecords > quota.dailyRecordLimit) {
            return {
                allowed: false,
                reason: 'Daily record quota exceeded',
                retryAfter: this.getSecondsUntilMidnight()
            };
        }
        return { allowed: true };
    }
    async checkForAnomalies(subject, object, operation, requestDetails) {
        const userHistory = this.accessHistory.get(subject.userId) || [];
        // Check for unusual patterns
        const anomalies = [];
        let severity = 'LOW';
        // Volume anomaly detection
        if (requestDetails.estimatedBytes > this.getTypicalRequestSize(userHistory) * 10) {
            anomalies.push('Unusually large data request');
            severity = 'MEDIUM';
        }
        // Time-based anomaly detection
        const currentHour = new Date().getHours();
        const typicalHours = subject.behaviorProfile.typicalHours;
        if (!typicalHours.includes(currentHour)) {
            anomalies.push('Access outside typical hours');
            severity = severity === 'LOW' ? 'LOW' : severity;
        }
        // Classification escalation
        const recentClassifications = userHistory
            .slice(-10)
            .map(h => h.classification);
        if (this.isClassificationEscalation(recentClassifications, object.classification)) {
            anomalies.push('Classification privilege escalation detected');
            severity = 'HIGH';
        }
        // Rapid request pattern
        const recentRequests = userHistory.filter(h => new Date().getTime() - h.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
        );
        if (recentRequests.length > 50) {
            anomalies.push('Rapid request pattern detected');
            severity = 'CRITICAL';
        }
        return {
            isAnomalous: anomalies.length > 0,
            severity,
            description: anomalies.join(', '),
            evidence: {
                requestSize: requestDetails.estimatedBytes,
                accessTime: currentHour,
                classification: object.classification,
                recentRequestCount: recentRequests.length
            }
        };
    }
    async checkForWarnings(subject, object, requestDetails) {
        const warnings = [];
        const quota = this.userQuotas.get(subject.userId);
        if (quota) {
            const byteUsagePercent = (quota.bytesUsed / quota.dailyByteLimit) * 100;
            const recordUsagePercent = (quota.recordsUsed / quota.dailyRecordLimit) * 100;
            if (byteUsagePercent > this.config.alertThresholds.userQuotaUsage.warningPercent) {
                warnings.push(`Approaching daily byte quota: ${byteUsagePercent.toFixed(1)}% used`);
            }
            if (recordUsagePercent > this.config.alertThresholds.userQuotaUsage.warningPercent) {
                warnings.push(`Approaching daily record quota: ${recordUsagePercent.toFixed(1)}% used`);
            }
        }
        return warnings;
    }
    getApplicableLimits(classification, operation) {
        return this.config.classificationLimits[classification] || this.getDefaultLimits();
    }
    async applyAdaptiveFactors(baseLimits, subject, object) {
        if (!this.config.enableAdaptiveLimits) {
            return baseLimits;
        }
        const factors = baseLimits.adaptiveFactors;
        let totalMultiplier = 1.0;
        // Apply risk-based adjustment
        totalMultiplier *= (1 - (subject.riskScore / 1000)); // Risk score 0-100, so divide by 1000 for small adjustment
        // Apply time-based adjustment
        const currentHour = new Date().getHours();
        if (currentHour < 6 || currentHour > 22) {
            totalMultiplier *= factors.timeOfDayMultiplier;
        }
        // Apply location adjustment
        if (!subject.location.withinApprovedRegions) {
            totalMultiplier *= factors.locationMultiplier;
        }
        // Apply device trust adjustment
        if (!subject.device.managed || subject.device.riskScore > 50) {
            totalMultiplier *= factors.deviceTrustMultiplier;
        }
        // Create adjusted limits
        const adjustedLimits = JSON.parse(JSON.stringify(baseLimits));
        adjustedLimits.limits.requestsPerMinute = Math.floor(baseLimits.limits.requestsPerMinute * totalMultiplier);
        adjustedLimits.limits.requestsPerHour = Math.floor(baseLimits.limits.requestsPerHour * totalMultiplier);
        adjustedLimits.limits.bytesPerMinute = Math.floor(baseLimits.limits.bytesPerMinute * totalMultiplier);
        adjustedLimits.limits.bytesPerHour = Math.floor(baseLimits.limits.bytesPerHour * totalMultiplier);
        return adjustedLimits;
    }
    getDefaultLimits() {
        return {
            classification: DataClassificationLevel.INTERNAL,
            operation: 'READ',
            limits: {
                requestsPerMinute: 60,
                requestsPerHour: 1000,
                requestsPerDay: 10000,
                bytesPerMinute: 10485760, // 10MB
                bytesPerHour: 104857600, // 100MB
                recordsPerMinute: 1000,
                recordsPerHour: 10000,
                concurrentRequests: 5
            },
            backoff: {
                strategy: BackoffStrategy.EXPONENTIAL,
                baseDelay: 1,
                maxDelay: 300,
                multiplier: 2
            },
            adaptiveFactors: {
                userRiskMultiplier: 0.8,
                timeOfDayMultiplier: 0.5,
                locationMultiplier: 0.3,
                deviceTrustMultiplier: 0.6
            }
        };
    }
    // Additional helper methods would be implemented here...
    initializeMetrics() { }
    loadExemptions() { }
    startPeriodicTasks() { }
    recordAccess(subject, object, operation, details, success, rateLimited, reason) { }
    createDecision(decision, reason, exemptionId, retryAfter, warnings) { return {}; }
    checkExemptions(subject, object, operation) { return Promise.resolve(null); }
    updateUserQuota(userId, details) { return Promise.resolve(); }
    getEndpointFromOperation(operation) { return 'data_access'; }
    getTypicalRequestSize(history) { return 1048576; }
    isClassificationEscalation(recent, current) { return false; }
    calculateAnomalyScore(history) { return 0; }
    initializeUserQuota(userId) { }
    getSecondsUntilMidnight() { return 86400; }
}
export default DataRetrievalRateLimit;
