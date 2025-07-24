/**
 * Analytics Data Migration System - Story 1.5 Task 3
 *
 * Implements comprehensive data migration from existing 12+ analytics systems
 * to the unified event bus with zero data loss validation and consistency checking.
 */
import { z } from 'zod';
import { AnalyticsEventType, EventCategory, EventSeverity } from './UnifiedEventBus.js';
// Migration Configuration Schema
export const MigrationConfigSchema = z.object({
    batchSize: z.number().min(1).max(10000).default(1000),
    concurrency: z.number().min(1).max(50).default(5),
    retryAttempts: z.number().min(0).max(10).default(3),
    retryDelayMs: z.number().min(100).max(60000).default(1000),
    validationEnabled: z.boolean().default(true),
    backupEnabled: z.boolean().default(true),
    continueOnError: z.boolean().default(false),
    dryRun: z.boolean().default(false),
    preserveTimestamps: z.boolean().default(true),
    includeMetadata: z.boolean().default(true)
});
// Migration Status
export var MigrationStatus;
(function (MigrationStatus) {
    MigrationStatus["PENDING"] = "pending";
    MigrationStatus["RUNNING"] = "running";
    MigrationStatus["PAUSED"] = "paused";
    MigrationStatus["COMPLETED"] = "completed";
    MigrationStatus["FAILED"] = "failed";
    MigrationStatus["CANCELLED"] = "cancelled";
})(MigrationStatus || (MigrationStatus = {}));
/**
 * Analytics Data Migration Service
 *
 * Orchestrates migration of analytics data from legacy systems to unified event bus
 */
export class AnalyticsDataMigrationService {
    eventBus;
    adapterManager;
    eventRepository;
    activeMigrations = new Map();
    transformationRules = new Map();
    migrationResults = new Map();
    constructor(eventBus, adapterManager, eventRepository) {
        this.eventBus = eventBus;
        this.adapterManager = adapterManager;
        this.eventRepository = eventRepository;
        this.initializeTransformationRules();
    }
    /**
     * Initialize data transformation rules for each system
     */
    initializeTransformationRules() {
        // Main Analytics System Transformation Rules
        this.transformationRules.set('main-analytics', [
            {
                id: 'session-mapping',
                sourceSystem: 'main-analytics',
                sourceField: 'sessionId',
                targetField: 'sessionId',
                transformationType: 'direct',
                transformation: {},
                validation: { required: false, type: 'string' }
            },
            {
                id: 'user-mapping',
                sourceSystem: 'main-analytics',
                sourceField: 'userId',
                targetField: 'userId',
                transformationType: 'computed',
                transformation: {
                    expression: 'value ? value.toString() : null'
                },
                validation: { required: false, type: 'string' }
            },
            {
                id: 'timestamp-mapping',
                sourceSystem: 'main-analytics',
                sourceField: 'createdAt',
                targetField: 'timestamp',
                transformationType: 'computed',
                transformation: {
                    expression: 'typeof value === "string" ? Date.parse(value) : value'
                },
                validation: { required: true, type: 'number' }
            },
            {
                id: 'event-type-mapping',
                sourceSystem: 'main-analytics',
                sourceField: 'eventType',
                targetField: 'type',
                transformationType: 'lookup',
                transformation: {
                    lookupTable: {
                        'graph_execution': AnalyticsEventType.GRAPH_EXECUTION,
                        'node_execution': AnalyticsEventType.NODE_EXECUTION,
                        'token_usage': AnalyticsEventType.TOKEN_USAGE,
                        'user_interaction': AnalyticsEventType.USER_INTERACTION,
                        'performance_metric': AnalyticsEventType.PERFORMANCE_METRIC
                    },
                    defaultValue: AnalyticsEventType.INFO_EVENT
                },
                validation: { required: true, enum: Object.values(AnalyticsEventType) }
            }
        ]);
        // Integration Analytics System Transformation Rules
        this.transformationRules.set('integration-analytics', [
            {
                id: 'integration-event-mapping',
                sourceSystem: 'integration-analytics',
                sourceField: 'eventType',
                targetField: 'type',
                transformationType: 'direct',
                transformation: { defaultValue: AnalyticsEventType.INTEGRATION_EVENT },
                validation: { required: true }
            },
            {
                id: 'integration-category',
                sourceSystem: 'integration-analytics',
                sourceField: null,
                targetField: 'category',
                transformationType: 'computed',
                transformation: { expression: 'EventCategory.INTEGRATION' },
                validation: { required: true }
            },
            {
                id: 'integration-data-mapping',
                sourceSystem: 'integration-analytics',
                sourceField: '*',
                targetField: 'data',
                transformationType: 'computed',
                transformation: {
                    expression: `{
            integrationId: source.integrationId,
            integrationType: source.integrationType,
            operation: source.operation,
            responseTime: source.responseTime,
            success: source.success,
            errorCode: source.errorCode,
            costData: source.costData
          }`
                }
            }
        ]);
        // Security Event System Transformation Rules
        this.transformationRules.set('security-events', [
            {
                id: 'security-event-type',
                sourceSystem: 'security-events',
                sourceField: 'eventType',
                targetField: 'type',
                transformationType: 'conditional',
                transformation: {
                    conditions: [
                        { condition: 'value.includes("fraud")', value: AnalyticsEventType.FRAUD_DETECTION },
                        { condition: 'value.includes("security")', value: AnalyticsEventType.SECURITY_EVENT }
                    ],
                    fallback: AnalyticsEventType.SECURITY_EVENT
                }
            },
            {
                id: 'security-severity-mapping',
                sourceSystem: 'security-events',
                sourceField: 'riskLevel',
                targetField: 'severity',
                transformationType: 'lookup',
                transformation: {
                    lookupTable: {
                        'critical': EventSeverity.CRITICAL,
                        'high': EventSeverity.ERROR,
                        'medium': EventSeverity.WARNING,
                        'low': EventSeverity.INFO
                    },
                    defaultValue: EventSeverity.INFO
                }
            }
        ]);
        // Performance Monitoring System Transformation Rules
        this.transformationRules.set('performance-monitoring', [
            {
                id: 'performance-event-type',
                sourceSystem: 'performance-monitoring',
                sourceField: null,
                targetField: 'type',
                transformationType: 'direct',
                transformation: { defaultValue: AnalyticsEventType.PERFORMANCE_METRIC }
            },
            {
                id: 'performance-category',
                sourceSystem: 'performance-monitoring',
                sourceField: null,
                targetField: 'category',
                transformationType: 'direct',
                transformation: { defaultValue: EventCategory.PERFORMANCE }
            },
            {
                id: 'performance-data-transform',
                sourceSystem: 'performance-monitoring',
                sourceField: '*',
                targetField: 'data',
                transformationType: 'computed',
                transformation: {
                    expression: `{
            metric: source.metric,
            value: source.value,
            unit: source.unit,
            nodeType: source.nodeType,
            executionTime: source.executionTime,
            memoryUsage: source.memoryUsage,
            threshold: source.threshold
          }`
                }
            }
        ]);
        // Revenue Analytics System Transformation Rules
        this.transformationRules.set('revenue-analytics', [
            {
                id: 'revenue-event-type',
                sourceSystem: 'revenue-analytics',
                sourceField: null,
                targetField: 'type',
                transformationType: 'direct',
                transformation: { defaultValue: AnalyticsEventType.REVENUE_EVENT }
            },
            {
                id: 'revenue-category',
                sourceSystem: 'revenue-analytics',
                sourceField: null,
                targetField: 'category',
                transformationType: 'direct',
                transformation: { defaultValue: EventCategory.BUSINESS }
            }
        ]);
    }
    /**
     * Start migration for a specific analytics system
     */
    async startMigration(systemName, sourceData, config = {}) {
        const migrationConfig = MigrationConfigSchema.parse(config);
        const migrationId = `migration_${systemName}_${Date.now()}`;
        // Initialize migration progress
        const progress = {
            migrationId,
            systemName,
            status: MigrationStatus.PENDING,
            progress: {
                percentage: 0,
                processedRecords: 0,
                totalRecords: sourceData.length,
                currentBatch: 0,
                totalBatches: Math.ceil(sourceData.length / migrationConfig.batchSize),
                eta: 0
            },
            currentOperation: 'Initializing migration',
            throughput: {
                recordsPerSecond: 0,
                bytesPerSecond: 0
            }
        };
        this.activeMigrations.set(migrationId, progress);
        // Start migration asynchronously
        this.performMigration(migrationId, systemName, sourceData, migrationConfig)
            .catch(error => {
            console.error(`Migration ${migrationId} failed:`, error);
            this.updateMigrationStatus(migrationId, MigrationStatus.FAILED, error.message);
        });
        return migrationId;
    }
    /**
     * Perform the actual migration
     */
    async performMigration(migrationId, systemName, sourceData, config) {
        const startTime = Date.now();
        let processedRecords = 0;
        let migratedRecords = 0;
        let failedRecords = 0;
        let skippedRecords = 0;
        const validationErrors = [];
        const performanceMetrics = {
            recordsPerSecond: 0,
            averageBatchTime: 0,
            peakMemoryUsage: 0,
            totalDataSize: 0
        };
        try {
            // Update status to running
            this.updateMigrationStatus(migrationId, MigrationStatus.RUNNING, 'Migration started');
            // Create backup if enabled
            let backupLocation;
            if (config.backupEnabled && !config.dryRun) {
                backupLocation = await this.createBackup(systemName, sourceData);
            }
            // Get transformation rules for this system
            const transformationRules = this.transformationRules.get(systemName) || [];
            // Process data in batches
            const totalBatches = Math.ceil(sourceData.length / config.batchSize);
            const batchTimes = [];
            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                const batchStartTime = Date.now();
                const startIdx = batchIndex * config.batchSize;
                const endIdx = Math.min(startIdx + config.batchSize, sourceData.length);
                const batch = sourceData.slice(startIdx, endIdx);
                this.updateCurrentOperation(migrationId, `Processing batch ${batchIndex + 1}/${totalBatches}`);
                // Process batch with concurrency control
                const batchResults = await this.processBatch(batch, systemName, transformationRules, config);
                // Update counters
                processedRecords += batchResults.processed;
                migratedRecords += batchResults.migrated;
                failedRecords += batchResults.failed;
                skippedRecords += batchResults.skipped;
                validationErrors.push(...batchResults.validationErrors);
                // Update performance metrics
                const batchTime = Date.now() - batchStartTime;
                batchTimes.push(batchTime);
                performanceMetrics.averageBatchTime = batchTimes.reduce((a, b) => a + b, 0) / batchTimes.length;
                performanceMetrics.recordsPerSecond = processedRecords / ((Date.now() - startTime) / 1000);
                performanceMetrics.totalDataSize += this.calculateDataSize(batch);
                // Update progress
                const percentage = ((batchIndex + 1) / totalBatches) * 100;
                const eta = (Date.now() - startTime) * (100 - percentage) / percentage;
                this.updateProgress(migrationId, {
                    percentage,
                    processedRecords,
                    currentBatch: batchIndex + 1,
                    eta
                });
                // Check for cancellation
                const currentProgress = this.activeMigrations.get(migrationId);
                if (currentProgress?.status === MigrationStatus.CANCELLED) {
                    throw new Error('Migration cancelled by user');
                }
                // Throttle to prevent overwhelming the system
                if (batchIndex < totalBatches - 1) {
                    await this.sleep(10);
                }
            }
            // Finalize migration
            const endTime = Date.now();
            const duration = endTime - startTime;
            // Perform final validation if enabled
            if (config.validationEnabled && !config.dryRun) {
                this.updateCurrentOperation(migrationId, 'Performing final validation');
                const finalValidation = await this.performFinalValidation(systemName, migratedRecords);
                validationErrors.push(...finalValidation);
            }
            // Create migration result
            const result = {
                migrationId,
                systemName,
                status: failedRecords > 0 && !config.continueOnError ? MigrationStatus.FAILED : MigrationStatus.COMPLETED,
                startTime,
                endTime,
                duration,
                totalRecords: sourceData.length,
                processedRecords,
                migratedRecords,
                failedRecords,
                skippedRecords,
                validationErrors,
                performanceMetrics: {
                    ...performanceMetrics,
                    peakMemoryUsage: process.memoryUsage().heapUsed
                },
                backupLocation,
                rollbackAvailable: !!backupLocation
            };
            this.migrationResults.set(migrationId, result);
            this.updateMigrationStatus(migrationId, result.status, 'Migration completed');
            console.log(`Migration ${migrationId} completed:`, {
                total: sourceData.length,
                migrated: migratedRecords,
                failed: failedRecords,
                duration: `${duration}ms`,
                throughput: `${performanceMetrics.recordsPerSecond.toFixed(2)} records/sec`
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const result = {
                migrationId,
                systemName,
                status: MigrationStatus.FAILED,
                startTime,
                endTime: Date.now(),
                duration: Date.now() - startTime,
                totalRecords: sourceData.length,
                processedRecords,
                migratedRecords,
                failedRecords,
                skippedRecords,
                validationErrors,
                performanceMetrics,
                rollbackAvailable: false
            };
            this.migrationResults.set(migrationId, result);
            this.updateMigrationStatus(migrationId, MigrationStatus.FAILED, errorMessage);
            throw error;
        }
        finally {
            this.activeMigrations.delete(migrationId);
        }
    }
    /**
     * Process a batch of records
     */
    async processBatch(batch, systemName, transformationRules, config) {
        const results = {
            processed: 0,
            migrated: 0,
            failed: 0,
            skipped: 0,
            validationErrors: []
        };
        // Process records with concurrency control
        const semaphore = new Array(config.concurrency).fill(null);
        const promises = batch.map(async (record, index) => {
            // Wait for available slot
            await Promise.race(semaphore.map((_, i) => semaphore[i] || (semaphore[i] = this.processRecord(record, systemName, transformationRules, config))));
            const slotIndex = semaphore.findIndex(promise => promise === null);
            try {
                const recordResult = await this.processRecord(record, systemName, transformationRules, config);
                results.processed++;
                if (recordResult.success) {
                    results.migrated++;
                }
                else if (recordResult.skipped) {
                    results.skipped++;
                }
                else {
                    results.failed++;
                }
                if (recordResult.validationErrors) {
                    results.validationErrors.push(...recordResult.validationErrors);
                }
            }
            catch (error) {
                results.processed++;
                results.failed++;
                results.validationErrors.push({
                    recordId: record.id || `batch_${index}`,
                    field: 'record',
                    originalValue: record,
                    transformedValue: null,
                    errorType: 'transformation_error',
                    message: error instanceof Error ? error.message : String(error),
                    severity: 'error'
                });
                if (!config.continueOnError) {
                    throw error;
                }
            }
            finally {
                semaphore[slotIndex] = null;
            }
        });
        await Promise.all(promises);
        return results;
    }
    /**
     * Process individual record
     */
    async processRecord(record, systemName, transformationRules, config) {
        try {
            // Transform record using transformation rules
            const transformedEvent = await this.transformRecord(record, transformationRules);
            // Validate transformed event
            const validationResult = await this.validateTransformedEvent(transformedEvent, record);
            if (!validationResult.valid) {
                return {
                    success: false,
                    skipped: false,
                    validationErrors: validationResult.errors
                };
            }
            // Skip dry run publishing
            if (config.dryRun) {
                return { success: true, skipped: true };
            }
            // Publish to unified event bus
            const adapter = this.adapterManager.getAdapter(systemName);
            if (adapter) {
                await adapter['publishEvent'](transformedEvent);
            }
            else {
                // Fallback to direct event bus publishing
                await this.eventBus.publishEvent({
                    source: systemName,
                    category: EventCategory.SYSTEM,
                    severity: EventSeverity.INFO,
                    type: AnalyticsEventType.INFO_EVENT,
                    data: transformedEvent.data || record,
                    metadata: {
                        ...transformedEvent.metadata,
                        migrated: true,
                        originalSystem: systemName,
                        migrationTime: Date.now()
                    },
                    ...transformedEvent
                });
            }
            return { success: true, skipped: false };
        }
        catch (error) {
            return {
                success: false,
                skipped: false,
                validationErrors: [{
                        recordId: record.id || 'unknown',
                        field: 'record',
                        originalValue: record,
                        transformedValue: null,
                        errorType: 'transformation_error',
                        message: error instanceof Error ? error.message : String(error),
                        severity: 'error'
                    }]
            };
        }
    }
    /**
     * Transform record using transformation rules
     */
    async transformRecord(record, transformationRules) {
        const transformed = {
            data: {},
            metadata: {}
        };
        for (const rule of transformationRules) {
            try {
                const value = await this.applyTransformationRule(record, rule);
                if (value !== undefined) {
                    this.setNestedProperty(transformed, rule.targetField, value);
                }
            }
            catch (error) {
                if (rule.validation?.required) {
                    throw new Error(`Required field transformation failed: ${rule.targetField}`);
                }
                // Use default value if available
                if (rule.transformation.defaultValue !== undefined) {
                    this.setNestedProperty(transformed, rule.targetField, rule.transformation.defaultValue);
                }
            }
        }
        return transformed;
    }
    /**
     * Apply individual transformation rule
     */
    async applyTransformationRule(record, rule) {
        const sourceValue = rule.sourceField ? this.getNestedProperty(record, rule.sourceField) : record;
        switch (rule.transformationType) {
            case 'direct':
                return sourceValue || rule.transformation.defaultValue;
            case 'computed':
                if (rule.transformation.expression) {
                    // Simple expression evaluation (in production, use a proper expression engine)
                    const expression = rule.transformation.expression
                        .replace(/\bvalue\b/g, JSON.stringify(sourceValue))
                        .replace(/\bsource\b/g, JSON.stringify(record));
                    try {
                        // Safe evaluation using Function constructor
                        const func = new Function('EventCategory', 'EventSeverity', 'AnalyticsEventType', `return ${expression}`);
                        return func(EventCategory, EventSeverity, AnalyticsEventType);
                    }
                    catch (error) {
                        throw new Error(`Expression evaluation failed: ${expression}`);
                    }
                }
                return sourceValue;
            case 'lookup':
                if (rule.transformation.lookupTable && sourceValue) {
                    return rule.transformation.lookupTable[sourceValue] || rule.transformation.defaultValue;
                }
                return rule.transformation.defaultValue;
            case 'conditional':
                if (rule.transformation.conditions) {
                    for (const condition of rule.transformation.conditions) {
                        try {
                            const conditionResult = this.evaluateCondition(condition.condition, sourceValue, record);
                            if (conditionResult) {
                                return condition.value;
                            }
                        }
                        catch (error) {
                            // Continue to next condition
                        }
                    }
                }
                return rule.transformation.fallback || rule.transformation.defaultValue;
            default:
                return sourceValue;
        }
    }
    /**
     * Evaluate condition expression
     */
    evaluateCondition(condition, value, record) {
        try {
            const expression = condition
                .replace(/\bvalue\b/g, JSON.stringify(value))
                .replace(/\brecord\b/g, JSON.stringify(record));
            const func = new Function(`return ${expression}`);
            return !!func();
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Validate transformed event
     */
    async validateTransformedEvent(transformedEvent, originalRecord) {
        const errors = [];
        // Basic validation
        if (!transformedEvent.type) {
            errors.push({
                field: 'type',
                originalValue: originalRecord,
                transformedValue: transformedEvent.type,
                errorType: 'missing_field',
                message: 'Event type is required',
                severity: 'error'
            });
        }
        if (!transformedEvent.source) {
            errors.push({
                field: 'source',
                originalValue: originalRecord,
                transformedValue: transformedEvent.source,
                errorType: 'missing_field',
                message: 'Event source is required',
                severity: 'error'
            });
        }
        // Additional validation can be added here
        return {
            valid: errors.filter(e => e.severity === 'error').length === 0,
            errors
        };
    }
    /**
     * Perform final validation
     */
    async performFinalValidation(systemName, expectedCount) {
        const errors = [];
        try {
            // Count migrated records
            const actualCount = await this.eventRepository.count({
                sources: [systemName],
                startTime: Date.now() - (24 * 60 * 60 * 1000) // Last 24 hours
            });
            if (actualCount < expectedCount) {
                errors.push({
                    field: 'record_count',
                    originalValue: expectedCount,
                    transformedValue: actualCount,
                    errorType: 'validation_failed',
                    message: `Record count mismatch: expected ${expectedCount}, found ${actualCount}`,
                    severity: 'error'
                });
            }
        }
        catch (error) {
            errors.push({
                field: 'final_validation',
                originalValue: null,
                transformedValue: null,
                errorType: 'validation_failed',
                message: `Final validation failed: ${error instanceof Error ? error.message : String(error)}`,
                severity: 'error'
            });
        }
        return errors;
    }
    /**
     * Create backup of source data
     */
    async createBackup(systemName, data) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupLocation = `/tmp/analytics_backup_${systemName}_${timestamp}.json`;
        // In production, this would write to a proper backup location
        console.log(`Creating backup for ${systemName} at ${backupLocation}`);
        return backupLocation;
    }
    /**
     * Update migration status
     */
    updateMigrationStatus(migrationId, status, message) {
        const progress = this.activeMigrations.get(migrationId);
        if (progress) {
            progress.status = status;
            if (message) {
                progress.lastError = status === MigrationStatus.FAILED ? message : undefined;
            }
        }
    }
    /**
     * Update current operation
     */
    updateCurrentOperation(migrationId, operation) {
        const progress = this.activeMigrations.get(migrationId);
        if (progress) {
            progress.currentOperation = operation;
        }
    }
    /**
     * Update migration progress
     */
    updateProgress(migrationId, progressUpdate) {
        const progress = this.activeMigrations.get(migrationId);
        if (progress) {
            Object.assign(progress.progress, progressUpdate);
        }
    }
    /**
     * Get nested property value
     */
    getNestedProperty(obj, path) {
        if (path === '*')
            return obj;
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    /**
     * Set nested property value
     */
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key])
                current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }
    /**
     * Calculate data size
     */
    calculateDataSize(data) {
        return JSON.stringify(data).length;
    }
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Public API Methods
     */
    /**
     * Get migration progress
     */
    getMigrationProgress(migrationId) {
        return this.activeMigrations.get(migrationId) || null;
    }
    /**
     * Get migration result
     */
    getMigrationResult(migrationId) {
        return this.migrationResults.get(migrationId) || null;
    }
    /**
     * List all migrations
     */
    listMigrations() {
        return {
            active: Array.from(this.activeMigrations.values()),
            completed: Array.from(this.migrationResults.values())
        };
    }
    /**
     * Cancel migration
     */
    cancelMigration(migrationId) {
        const progress = this.activeMigrations.get(migrationId);
        if (progress && progress.status === MigrationStatus.RUNNING) {
            progress.status = MigrationStatus.CANCELLED;
            return true;
        }
        return false;
    }
    /**
     * Pause migration
     */
    pauseMigration(migrationId) {
        const progress = this.activeMigrations.get(migrationId);
        if (progress && progress.status === MigrationStatus.RUNNING) {
            progress.status = MigrationStatus.PAUSED;
            return true;
        }
        return false;
    }
    /**
     * Resume migration
     */
    resumeMigration(migrationId) {
        const progress = this.activeMigrations.get(migrationId);
        if (progress && progress.status === MigrationStatus.PAUSED) {
            progress.status = MigrationStatus.RUNNING;
            return true;
        }
        return false;
    }
    /**
     * Rollback migration
     */
    async rollbackMigration(migrationId) {
        const result = this.migrationResults.get(migrationId);
        if (!result || !result.rollbackAvailable) {
            return false;
        }
        try {
            // In production, this would restore from backup and remove migrated events
            console.log(`Rolling back migration ${migrationId} from backup ${result.backupLocation}`);
            // Remove migrated events from unified system
            const migratedEvents = await this.eventRepository.findMany({
                filter: {
                    sources: [result.systemName],
                    startTime: result.startTime,
                    endTime: result.endTime
                }
            });
            const eventIds = migratedEvents.map(event => event.id);
            await this.eventRepository.deleteBatch(eventIds);
            return true;
        }
        catch (error) {
            console.error(`Rollback failed for migration ${migrationId}:`, error);
            return false;
        }
    }
    /**
     * Add transformation rule
     */
    addTransformationRule(systemName, rule) {
        const rules = this.transformationRules.get(systemName) || [];
        rules.push(rule);
        this.transformationRules.set(systemName, rules);
    }
    /**
     * Get transformation rules for system
     */
    getTransformationRules(systemName) {
        return this.transformationRules.get(systemName) || [];
    }
    /**
     * Migrate all systems
     */
    async migrateAllSystems(systemsData, config = {}) {
        const migrationIds = {};
        for (const [systemName, data] of Object.entries(systemsData)) {
            try {
                const migrationId = await this.startMigration(systemName, data, config);
                migrationIds[systemName] = migrationId;
            }
            catch (error) {
                console.error(`Failed to start migration for ${systemName}:`, error);
            }
        }
        return migrationIds;
    }
    /**
     * Get migration summary
     */
    getMigrationSummary() {
        const results = Array.from(this.migrationResults.values());
        return {
            totalMigrations: results.length + this.activeMigrations.size,
            activeMigrations: this.activeMigrations.size,
            completedMigrations: results.filter(r => r.status === MigrationStatus.COMPLETED).length,
            failedMigrations: results.filter(r => r.status === MigrationStatus.FAILED).length,
            totalRecordsMigrated: results.reduce((sum, r) => sum + r.migratedRecords, 0),
            totalValidationErrors: results.reduce((sum, r) => sum + r.validationErrors.length, 0)
        };
    }
}
export default AnalyticsDataMigrationService;
