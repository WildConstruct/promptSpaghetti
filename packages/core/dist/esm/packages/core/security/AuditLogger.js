/**
 * AuditLogger - Comprehensive audit logging for data access
 *
 * Provides detailed logging of all data access operations including:
 * - Who accessed the data (user/system identity)
 * - What data was accessed (classification level, identifiers)
 * - When the access occurred (timestamps)
 * - Where the access originated (IP, location, system)
 * - Why the access was made (purpose, authorization)
 * - How the data was accessed (operation type, method)
 *
 * Epic 19 Task T-1752989143998-485: Implement audit logging for data access
 */
// Browser-compatible event emitter and crypto alternatives
class BrowserEventEmitter {
    events = new Map();
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(listener);
    }
    emit(event, ...args) {
        const listeners = this.events.get(event);
        if (listeners) {
            listeners.forEach(listener => listener(...args));
        }
    }
    removeAllListeners() {
        this.events.clear();
    }
}
// Browser-compatible crypto utility
const browserCrypto = {
    randomBytes: (size) => {
        const array = new Uint8Array(size);
        if (typeof window !== 'undefined' &&
            typeof window.crypto !== 'undefined' &&
            typeof window.crypto.getRandomValues === 'function') {
            window.crypto.getRandomValues(array);
        }
        else {
            // Fallback for non-browser environments
            for (let i = 0; i < size; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
        }
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
};
import { DataClassificationLevel } from '../types/DataClassification';
export var AuditOperation;
(function (AuditOperation) {
    // Data access operations
    AuditOperation["READ"] = "READ";
    AuditOperation["WRITE"] = "WRITE";
    AuditOperation["UPDATE"] = "UPDATE";
    AuditOperation["DELETE"] = "DELETE";
    AuditOperation["EXPORT"] = "EXPORT";
    AuditOperation["DOWNLOAD"] = "DOWNLOAD";
    // Administrative operations
    AuditOperation["GRANT_ACCESS"] = "GRANT_ACCESS";
    AuditOperation["REVOKE_ACCESS"] = "REVOKE_ACCESS";
    AuditOperation["CHANGE_CLASSIFICATION"] = "CHANGE_CLASSIFICATION";
    // System operations
    AuditOperation["LOGIN"] = "LOGIN";
    AuditOperation["LOGOUT"] = "LOGOUT";
    AuditOperation["API_CALL"] = "API_CALL";
    AuditOperation["BATCH_OPERATION"] = "BATCH_OPERATION";
    // Security operations
    AuditOperation["AUTHENTICATION"] = "AUTHENTICATION";
    AuditOperation["AUTHORIZATION"] = "AUTHORIZATION";
    AuditOperation["ENCRYPTION"] = "ENCRYPTION";
    AuditOperation["DECRYPTION"] = "DECRYPTION";
})(AuditOperation || (AuditOperation = {}));
export var AuditLogLevel;
(function (AuditLogLevel) {
    AuditLogLevel["MINIMAL"] = "MINIMAL";
    AuditLogLevel["STANDARD"] = "STANDARD";
    AuditLogLevel["DETAILED"] = "DETAILED";
    AuditLogLevel["VERBOSE"] = "VERBOSE"; // Full debug-level logging
})(AuditLogLevel || (AuditLogLevel = {}));
/**
 * Main audit logger implementation
 */
export class AuditLogger extends BrowserEventEmitter {
    config;
    buffer = [];
    flushTimer;
    storageBackend;
    operationMetrics = new Map();
    constructor(config) {
        super();
        // Set default configuration
        this.config = {
            storageBackend: config?.storageBackend || new InMemoryStorageBackend(),
            bufferSize: config?.bufferSize ?? 100,
            flushInterval: config?.flushInterval ?? 5000, // 5 seconds,
            logLevel: config?.logLevel ?? AuditLogLevel.STANDARD,
            includedOperations: config?.includedOperations ?? Object.values(AuditOperation),
            excludedOperations: config?.excludedOperations ?? [],
            encryptLogs: config?.encryptLogs ?? false,
            encryptionKey: config?.encryptionKey ?? '',
            hashSensitiveData: config?.hashSensitiveData ?? true,
            retentionDays: config?.retentionDays ?? 90,
            archiveOldLogs: config?.archiveOldLogs ?? true,
            asyncLogging: config?.asyncLogging ?? true,
            compressionEnabled: config?.compressionEnabled ?? false,
            alertOnAnomaly: config?.alertOnAnomaly ?? true,
            alertThresholds: config?.alertThresholds ?? {
                failedAccessAttempts: 5,
                sensitiveDataAccess: 10,
                highRiskOperations: 3,
                timeWindow: 5,
            }
        };
        this.storageBackend = this.config.storageBackend;
        this.startFlushTimer();
    }
    /**
     * Log a data access operation
     */
    async logDataAccess(context, resourceType, resourceId, classification, success, metadata) {
        const entry = {
            id: this.generateAuditId(),
            timestamp: new Date(),
            correlationId: context.correlationId || this.generateCorrelationId(),
            userId: context.userId,
            userRole: context.userRole,
            systemId: context.systemId,
            operation: AuditOperation.READ,
            resourceType,
            resourceId,
            dataClassification: classification,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            sessionId: context.sessionId,
            authorized: success,
            success,
            sensitiveAccess: this.isSensitiveAccess(classification),
            metadata: {
                ...metadata,
                purpose: context.purpose,
                requestedAt: context.requestedAt,
            }
        };
        await this.log(entry);
    }
    /**
     * Log a generic operation
     */
    async log(entry) {
        // Skip if operation is excluded
        if (this.shouldSkipOperation(entry.operation)) {
            return;
        }
        // Complete the entry
        const completeEntry = {
            id: entry.id || this.generateAuditId(),
            timestamp: entry.timestamp || new Date(),
            correlationId: entry.correlationId || this.generateCorrelationId(),
            userId: entry.userId || 'system',
            operation: entry.operation || AuditOperation.READ,
            resourceType: entry.resourceType || 'unknown',
            resourceId: entry.resourceId || 'unknown',
            dataClassification: entry.dataClassification || DataClassificationLevel.PUBLIC,
            authorized: entry.authorized ?? true,
            success: entry.success ?? true,
            sensitiveAccess: entry.sensitiveAccess ?? false,
            ...entry
        };
        // Apply security transformations
        const securedEntry = this.applySecurityTransforms(completeEntry);
        // Check for anomalies
        if (this.config.alertOnAnomaly) {
            this.checkForAnomalies(securedEntry);
        }
        // Add to buffer or write directly
        if (this.config.asyncLogging) {
            this.buffer.push(securedEntry);
            if (this.buffer.length >= this.config.bufferSize) {
                await this.flush();
            }
        }
        else {
            await this.writeEntry(securedEntry);
        }
        // Update metrics
        this.updateMetrics(securedEntry);
        // Emit event
        this.emit('audit', securedEntry);
    }
    /**
     * Query audit logs
     */
    async query(criteria) {
        return this.storageBackend.query(criteria);
    }
    /**
     * Flush buffered entries
     */
    async flush() {
        if (this.buffer.length === 0) {
            return;
        }
        const entriesToFlush = [...this.buffer];
        this.buffer = [];
        try {
            await Promise.all(entriesToFlush.map(entry => this.writeEntry(entry)));
        }
        catch (error) {
            // Re-add failed entries to buffer
            this.buffer.unshift(...entriesToFlush);
            throw error;
        }
    }
    /**
     * Get audit statistics
     */
    getStatistics() {
        const stats = {
            totalOperations: 0,
            operationCounts: {},
            failureRate: 0,
            sensitiveAccessCount: 0,
            averageResponseTime: 0
        };
        for (const [operation, count] of this.operationMetrics) {
            stats.operationCounts[operation] = count;
            stats.totalOperations += count;
        }
        return stats;
    }
    /**
     * Apply security transformations to log entry
     */
    applySecurityTransforms(entry) {
        const transformed = { ...entry };
        // Hash sensitive data if configured
        if (this.config.hashSensitiveData) {
            if (transformed.ipAddress) {
                transformed.ipAddress = this.hashData(transformed.ipAddress);
            }
            if (transformed.sessionId) {
                transformed.sessionId = this.hashData(transformed.sessionId);
            }
        }
        // Encrypt if configured
        if (this.config.encryptLogs && this.config.encryptionKey) {
            // In production, implement proper encryption
            // This is a placeholder
            transformed.metadata = {
                ...transformed.metadata,
                encrypted: true,
            };
        }
        return transformed;
    }
    /**
     * Check for anomalous patterns
     */
    checkForAnomalies(entry) {
        const thresholds = this.config.alertThresholds;
        // Check for repeated failures
        if (!entry.success && thresholds.failedAccessAttempts) {
            // In production, implement sliding window check
            this.emit('anomaly', {
                type: 'REPEATED_FAILURES',
                entry,
                threshold: thresholds.failedAccessAttempts,
            });
        }
        // Check for excessive sensitive data access
        if (entry.sensitiveAccess && thresholds.sensitiveDataAccess) {
            // In production, implement rate limiting check
            this.emit('anomaly', {
                type: 'EXCESSIVE_SENSITIVE_ACCESS',
                entry,
                threshold: thresholds.sensitiveDataAccess,
            });
        }
    }
    /**
     * Write entry to storage
     */
    async writeEntry(entry) {
        try {
            await this.storageBackend.write(entry);
        }
        catch (error) {
            this.emit('error', {
                message: 'Failed to write audit log',
                entry,
                error
            });
            throw error;
        }
    }
    /**
     * Update operation metrics
     */
    updateMetrics(entry) {
        const key = `${entry.operation}_${entry.success ? 'success' : 'failure'}`;
        const current = this.operationMetrics.get(key) || 0;
        this.operationMetrics.set(key, current + 1);
    }
    /**
     * Check if operation should be skipped
     */
    shouldSkipOperation(operation) {
        if (!operation)
            return false;
        if (this.config.excludedOperations.includes(operation)) {
            return true;
        }
        if (!this.config.includedOperations.includes(operation)) {
            return true;
        }
        return false;
    }
    /**
     * Check if access is sensitive
     */
    isSensitiveAccess(classification) {
        return [
            DataClassificationLevel.CONFIDENTIAL,
            DataClassificationLevel.RESTRICTED,
            DataClassificationLevel.TOP_SECRET
        ].includes(classification);
    }
    /**
     * Generate unique audit ID
     */
    generateAuditId() {
        return `audit_${Date.now()}_${browserCrypto.randomBytes(8)}`;
    }
    /**
     * Generate correlation ID
     */
    generateCorrelationId() {
        return `corr_${browserCrypto.randomBytes(16)}`;
    }
    /**
     * Hash sensitive data
     */
    hashData(data) {
        // Use a simple hash function for browser compatibility
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).substring(0, 16);
    }
    /**
     * Start flush timer
     */
    startFlushTimer() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flushTimer = setInterval(() => {
            this.flush().catch(error => {
                this.emit('error', {
                    message: 'Flush timer error',
                    error
                });
            });
        }, this.config.flushInterval);
    }
    /**
     * Cleanup resources
     */
    destroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.removeAllListeners();
    }
}
export class InMemoryStorageBackend {
    logs = [];
    async write(entry) {
        this.logs.push(entry);
    }
    async query(criteria) {
        let filtered = [...this.logs];
        if (criteria.startDate) {
            filtered = filtered.filter(log => log.timestamp >= criteria.startDate);
        }
        if (criteria.endDate) {
            filtered = filtered.filter(log => log.timestamp <= criteria.endDate);
        }
        if (criteria.userId) {
            filtered = filtered.filter(log => log.userId === criteria.userId);
        }
        if (criteria.operation) {
            filtered = filtered.filter(log => log.operation === criteria.operation);
        }
        if (criteria.dataClassification) {
            filtered = filtered.filter(log => log.dataClassification === criteria.dataClassification);
        }
        if (criteria.success !== undefined) {
            filtered = filtered.filter(log => log.success === criteria.success);
        }
        // Apply pagination
        const offset = criteria.offset || 0;
        const limit = criteria.limit || 100;
        return filtered.slice(offset, offset + limit);
    }
    async delete(id) {
        this.logs = this.logs.filter(log => log.id !== id);
    }
    async rotate() {
        // In production, implement log rotation
        this.logs = [];
    }
}
/**
 * Factory function to create audit logger
 */
export function createAuditLogger(config) {
    return new AuditLogger(config);
}
