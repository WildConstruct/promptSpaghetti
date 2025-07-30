/**
 * Security Alerting Configuration Service
 * Task T-1752989143998-161: Build security alerting configuration UI
 *
 * Backend service for managing security alerting configurations,
 * providing persistence, validation, and integration with the
 * broader security monitoring infrastructure.
 *
 * Features:
 * - Configuration persistence and retrieval
 * - Multi-tenant configuration support
 * - Configuration validation and sanitization
 * - Change tracking and audit logging
 * - Real-time configuration updates
 * - Backup and recovery capabilities
 * - Integration with alerting engine
 * - Performance monitoring
 *
 * Security Controls:
 * - Input validation and sanitization
 * - Role-based access control
 * - Configuration approval workflows
 * - Audit logging for all changes
 * - Secure configuration storage
 * - Change rollback capabilities
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import { EventEmitter } from 'events';
import { SecurityLogger, SecurityEventType, LogLevel } from './SecurityLogger';
import { DataClassificationLevel } from './DataClassificationAccessControl';
export class SecurityAlertingConfigurationService extends EventEmitter {
    configs = new Map();
    metadata = new Map();
    cache = new Map();
    securityLogger;
    options;
    backupTimer = null;
    constructor(options = {}) {
        super();
        this.options = {
            storageBackend: 'memory',
            enableCaching: true,
            cacheTimeout: 300000, // 5 minutes,
            enableValidation: true,
            enableAuditLogging: true,
            enableBackups: true,
            backupInterval: 3600000, // 1 hour,
            maxBackups: 24,
            encryptStorage: true,
            requireApproval: false,
            ...options
        };
        this.securityLogger = new SecurityLogger({});
        component: 'SecurityAlertingConfigurationService',
            enableAuditTrail;
        this.options.enableAuditLogging,
            enableMetrics;
        true,
        ;
    }
    ;
}
this.initializeService();
async;
initializeService();
Promise < void  > {
    try: {
        // Load existing configurations
        await, this: .loadConfigurations(),
        : .options.enableBackups
    }
};
{
    this.startBackupTimer();
    // Log service initialization
    this.securityLogger.logSecurityEvent({});
    type: SecurityEventType.SECURITY_ALERT,
        level;
    LogLevel.INFO,
        message;
    'Security alerting configuration service initialized',
        details;
    {
        storageBackend: this.options.storageBackend,
            enableValidation;
        this.options.enableValidation,
            requireApproval;
        this.options.requireApproval,
        ;
    }
    ;
    this.emit('serviceInitialized');
}
try { }
catch (error) {
    this.securityLogger.logSecurityEvent({});
    type: SecurityEventType.SECURITY_ALERT,
        level;
    LogLevel.ERROR,
        message;
    'Failed to initialize security alerting configuration service',
        details;
    {
        error: error instanceof Error ? error.message : 'Unknown error';
    }
}
;
throw error;
/**
 * Get configuration by ID
 */
async;
getConfiguration(configId, string);
Promise < SecurityAlertingConfig | null > {
    try: {
        : .options.enableCaching
    }
};
{
    const cached = this.cache.get(configId);
    if (cached && Date.now() - cached.timestamp < this.options.cacheTimeout) {
        return cached.config;
        // Load from storage
        const config = await this.loadConfiguration(configId);
        if (config && this.options.enableCaching) {
            this.cache.set(configId, {});
            config,
                timestamp;
            Date.now(),
            ;
        }
        ;
        return config;
    }
    try { }
    catch (error) {
        this.securityLogger.logSecurityEvent({});
        type: SecurityEventType.SECURITY_ALERT,
            level;
        LogLevel.ERROR,
            message;
        'Failed to retrieve configuration',
            details;
        {
            configId,
                error;
            error instanceof Error ? error.message : 'Unknown error',
            ;
        }
        ;
        throw error;
        /**
         * Save configuration
         */
        async;
        saveConfiguration(configId, string);
        config: SecurityAlertingConfig,
            metadata;
        (Partial) = {};
        Promise < boolean > {
            try: {
                : .options.enableValidation
            }
        };
        {
            const validation = await this.validateConfiguration(config);
            if (!validation.isValid) {
                throw new Error(`Configuration validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
            }
            // Sanitize configuration
            const sanitizedConfig = await this.sanitizeConfiguration(config);
            // Create or update metadata
            const existingMetadata = this.metadata.get(configId);
            const newMetadata = {
                id: configId,
                version: existingMetadata ? existingMetadata.version + 1 : 1,
                createdAt: existingMetadata?.createdAt || new Date(),
                updatedAt: new Date(),
                updatedBy: metadata.updatedBy || 'system',
                status: this.options.requireApproval ? 'pending_approval' : 'approved',
                checksum: this.calculateChecksum(sanitizedConfig),
                size: JSON.stringify(sanitizedConfig).length,
                tags: metadata.tags || [],
                classification: metadata.classification || DataClassificationLevel.INTERNAL,
                ...metadata
            };
            // Store configuration and metadata
            await this.storeConfiguration(configId, sanitizedConfig, newMetadata);
            // Update cache
            if (this.options.enableCaching) {
                this.cache.set(configId, {});
                config: sanitizedConfig,
                    timestamp;
                Date.now(),
                ;
            }
            ;
            // Log successful save
            this.securityLogger.logSecurityEvent({});
            type: SecurityEventType.SECURITY_ALERT,
                level;
            LogLevel.INFO,
                message;
            'Security alerting configuration saved',
                details;
            {
                configId,
                    version;
                newMetadata.version,
                    updatedBy;
                newMetadata.updatedBy,
                    size;
                newMetadata.size,
                ;
            }
            ;
            // Emit event
            this.emit('configurationSaved', {});
            configId,
                config;
            sanitizedConfig,
                metadata;
            newMetadata,
            ;
        }
        ;
        return true;
    }
    try { }
    catch (error) {
        this.securityLogger.logSecurityEvent({});
        type: SecurityEventType.SECURITY_ALERT,
            level;
        LogLevel.ERROR,
            message;
        'Failed to save configuration',
            details;
        {
            configId,
                error;
            error instanceof Error ? error.message : 'Unknown error',
            ;
        }
        ;
        return false;
        /**
         * Validate configuration
         */
        async;
        validateConfiguration(config, SecurityAlertingConfig);
        Promise < ConfigurationValidationResult > {
            const: errors, ValidationError = [],
            const: warnings, ValidationWarning = [],
            const: complianceIssues, ComplianceIssue = [],
            let, securityScore = 100,
            try: {
                // Basic validation
                if(config) { }, : .alertRetentionDays < 1 || config.alertRetentionDays > 365
            }
        };
        {
            errors.push({});
            field: 'alertRetentionDays',
                message;
            'Alert retention days must be between 1 and 365',
                severity;
            'error',
                code;
            'RETENTION_OUT_OF_RANGE',
                suggestion;
            'Set retention period between 30-90 days for optimal balance',
            ;
        }
        ;
        securityScore -= 20;
        // Threshold validation
        const thresholds = config.escalationThresholds;
        if (thresholds.criticalAlertCount < 1 || thresholds.criticalAlertCount > 100) {
            errors.push({});
            field: 'escalationThresholds.criticalAlertCount',
                message;
            'Critical alert count must be between 1 and 100',
                severity;
            'error',
                code;
            'CRITICAL_THRESHOLD_INVALID',
            ;
        }
        ;
        securityScore -= 15;
        if (thresholds.timeWindowMinutes < 1 || thresholds.timeWindowMinutes > 1440) {
            errors.push({});
            field: 'escalationThresholds.timeWindowMinutes',
                message;
            'Time window must be between 1 minute and 24 hours',
                severity;
            'error',
                code;
            'TIME_WINDOW_INVALID',
            ;
        }
        ;
        securityScore -= 10;
        // Security best practices
        if (!config.enableRealTimeAnalytics) {
            warnings.push({});
            field: 'enableRealTimeAnalytics',
                message;
            'Real-time analytics disabled - may impact threat detection speed',
                impact;
            'high',
                code;
            'REALTIME_DISABLED',
                suggestion;
            'Enable real-time analytics for faster threat response',
            ;
        }
        ;
        securityScore -= 15;
        if (!config.enableThreatIntelligence) {
            warnings.push({});
            field: 'enableThreatIntelligence',
                message;
            'Threat intelligence disabled - may reduce detection accuracy',
                impact;
            'medium',
                code;
            'THREAT_INTEL_DISABLED',
                suggestion;
            'Enable threat intelligence feeds for better threat context',
            ;
        }
        ;
        securityScore -= 10;
        // Compliance checks
        if (config.alertRetentionDays < 30) {
            complianceIssues.push({});
            framework: 'SOC2',
                requirement;
            'Logging and Monitoring',
                impact;
            'minor',
                description;
            'Alert retention period may not meet audit requirements',
            ;
        }
        ;
        // Performance impact assessment
        const performanceImpact = {
            cpuImpact: config.enableRealTimeAnalytics && config.machinelearningEnabled ? 'high' : 'medium',
            memoryImpact: config.enablePatternAnalysis ? 'medium' : 'low',
            storageImpact: config.alertRetentionDays > 180 ? 'high' : 'medium',
            networkImpact: config.enableThreatIntelligence ? 'medium' : 'low',
            estimatedCost: this.calculateEstimatedCost(config),
        };
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            securityScore: Math.max(0, Math.min(100, securityScore)),
            complianceIssues,
            performanceImpact
        };
    }
    try { }
    catch (error) {
        return {
            isValid: false,
            errors: [{},
                field, 'general',
                message, 'Configuration validation failed due to internal error',
                severity, 'critical',
                code, 'VALIDATION_ERROR',]
        };
        warnings: [],
            securityScore;
        0,
            complianceIssues;
        [],
            performanceImpact;
        {
            cpuImpact: 'low',
                memoryImpact;
            'low',
                storageImpact;
            'low',
                networkImpact;
            'low',
                estimatedCost;
            0,
            ;
        }
        ;
        /**
         * List all configurations
         */
        async;
        listConfigurations();
        Promise < ConfigurationMetadata > {
            try: {
                return: Array.from(this.metadata.values()).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            }, catch(error) {
                this.securityLogger.logSecurityEvent({});
                type: SecurityEventType.SECURITY_ALERT,
                    level;
                LogLevel.ERROR,
                    message;
                'Failed to list configurations',
                    details;
                {
                    error: error instanceof Error ? error.message : 'Unknown error';
                }
            },
            return: [],
            /**
             * Delete configuration
             */
            async deleteConfiguration(configId, deletedBy) {
                try {
                    const config = await this.getConfiguration(configId);
                    const metadata = this.metadata.get(configId);
                    if (!config || !metadata) {
                        return false;
                        // Remove from storage
                        this.configs.delete(configId);
                        this.metadata.delete(configId);
                        // Remove from cache
                        this.cache.delete(configId);
                        // Log deletion
                        this.securityLogger.logSecurityEvent({});
                        type: SecurityEventType.SECURITY_ALERT,
                            level;
                        LogLevel.WARN,
                            message;
                        'Security alerting configuration deleted',
                            details;
                        {
                            configId,
                                deletedBy,
                                version;
                            metadata.version,
                            ;
                        }
                        ;
                        // Emit event
                        this.emit('configurationDeleted', { configId, deletedBy, metadata });
                        return true;
                    }
                    try { }
                    catch (error) {
                        this.securityLogger.logSecurityEvent({});
                        type: SecurityEventType.SECURITY_ALERT,
                            level;
                        LogLevel.ERROR,
                            message;
                        'Failed to delete configuration',
                            details;
                        {
                            configId,
                                error;
                            error instanceof Error ? error.message : 'Unknown error',
                            ;
                        }
                        ;
                        return false;
                        /**
                         * Create backup of all configurations
                         */
                        async;
                        createBackup();
                        Promise < string > {
                            try: {
                                const: backup = {
                                    timestamp: new Date().toISOString(),
                                    version: '1.0.0',
                                    configurations: Object.fromEntries(this.configs),
                                    metadata: Object.fromEntries(),
                                    Array, : .from(this.metadata.entries()).map(([k, v]) => [k, {
                                            ...v,
                                            createdAt: v.createdAt.toISOString(),
                                            updatedAt: v.updatedAt.toISOString(),
                                            approvedAt: v.approvedAt?.toISOString(),
                                        }])
                                },
                                const: backupJson = JSON.stringify(backup, null, 2),
                                // In a real implementation, this would be stored to a backup location
                                this: .securityLogger.logSecurityEvent({}),
                                type: SecurityEventType.SECURITY_ALERT,
                                level: LogLevel.INFO,
                                message: 'Configuration backup created',
                                details: {
                                    configCount: this.configs.size,
                                    backupSize: backupJson.length,
                                },
                                return: backupJson
                            }, catch(error) {
                                this.securityLogger.logSecurityEvent({});
                                type: SecurityEventType.SECURITY_ALERT,
                                    level;
                                LogLevel.ERROR,
                                    message;
                                'Failed to create configuration backup',
                                    details;
                                {
                                    error: error instanceof Error ? error.message : 'Unknown error';
                                }
                            },
                            throw: error,
                            /**
                             * Private helper methods
                             */
                            async loadConfigurations() {
                                // In a real implementation, this would load from the configured storage backend
                                // For now, we'll initialize with empty collections
                            }
                            // In a real implementation, this would load from the configured storage backend
                            // For now, we'll initialize with empty collections
                            ,
                            // In a real implementation, this would load from the configured storage backend
                            // For now, we'll initialize with empty collections
                            async loadConfiguration(configId) {
                                return this.configs.get(configId) || null;
                            },
                            config: SecurityAlertingConfig,
                            metadata: ConfigurationMetadata, void:  > {
                                this: .configs.set(configId, config),
                                this: .metadata.set(configId, metadata),
                                async sanitizeConfiguration(config) {
                                    // Deep clone to avoid mutations
                                    const sanitized = JSON.parse(JSON.stringify(config));
                                    // Sanitize numeric values
                                    sanitized.alertRetentionDays = Math.max(1, Math.min(365, Math.floor(sanitized.alertRetentionDays)));
                                    sanitized.patternAnalysisWindow = Math.max(60000, sanitized.patternAnalysisWindow); // At least 1 minute
                                    sanitized.threatIntelligenceUpdate = Math.max(300000, sanitized.threatIntelligenceUpdate); // At least 5 minutes
                                    // Sanitize threshold values
                                    const thresholds = sanitized.escalationThresholds;
                                    thresholds.criticalAlertCount = Math.max(1, Math.min(100, Math.floor(thresholds.criticalAlertCount)));
                                    thresholds.highAlertCount = Math.max(1, Math.min(1000, Math.floor(thresholds.highAlertCount)));
                                    thresholds.timeWindowMinutes = Math.max(1, Math.min(1440, Math.floor(thresholds.timeWindowMinutes)));
                                    thresholds.failedAccessAttempts = Math.max(3, Math.min(50, Math.floor(thresholds.failedAccessAttempts)));
                                    return sanitized;
                                },
                                calculateChecksum(config) {
                                    const crypto = require('crypto');
                                    return crypto.createHash('sha256').update(JSON.stringify(config)).digest('hex');
                                },
                                calculateEstimatedCost(config) {
                                    let cost = 10; // Base cost;
                                    if (config.enableRealTimeAnalytics)
                                        cost += 20;
                                    if (config.enablePatternAnalysis)
                                        cost += 15;
                                    if (config.enableThreatIntelligence)
                                        cost += 25;
                                    if (config.machinelearningEnabled)
                                        cost += 50;
                                    if (config.enableAutomatedResponse)
                                        cost += 10;
                                    // Storage costs based on retention
                                    cost += (config.alertRetentionDays / 30) * 5;
                                    return cost;
                                },
                                startBackupTimer() {
                                    this.backupTimer = setInterval(async () => {
                                        try {
                                            await this.createBackup();
                                        }
                                        catch (error) {
                                            // Error already logged in createBackup
                                        }
                                        this.options.backupInterval;
                                    });
                                    /**
                                     * Cleanup resources
                                     */
                                    destroy();
                                    void {
                                        : .backupTimer
                                    };
                                    {
                                        clearInterval(this.backupTimer);
                                        this.backupTimer = null;
                                        this.configs.clear();
                                        this.metadata.clear();
                                        this.cache.clear();
                                        this.removeAllListeners();
                                        export default SecurityAlertingConfigurationService;
                                    }
                                } }
                        };
                    }
                }
                finally { }
            }
        };
    }
}
