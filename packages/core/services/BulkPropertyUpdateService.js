/**
 * Bulk Property Update Service - Epic 17
 *
 * Comprehensive bulk operations service for updating properties across multiple
 * entities with validation, rollback, and performance optimization.
 *
 * Task: E17-1753114396945-40F775 - Implement bulk property updates
 * Epic: 17 - Backstage Admin Controls
 */
/**
 * Bulk Property Update Service
 */
export class BulkPropertyUpdateService {
    static instance: BulkPropertyUpdateService;
    operations: Map<string, any> = new Map();
    templates: Map<string, any> = new Map();
    listeners: Map<string, any> = new Map();
    entityProviders: Map<string, any> = new Map();
    constructor() {
        this.registerDefaultEntityProviders();
    }
    static getInstance(): BulkPropertyUpdateService {
        if (!BulkPropertyUpdateService.instance) {
            BulkPropertyUpdateService.instance = new BulkPropertyUpdateService();
        }
        return BulkPropertyUpdateService.instance;
    }
    /**
     * Entity Provider Registration
     */
    registerEntityProvider(targetType: string, provider: any): void {
        this.entityProviders.set(targetType, provider);
    }
    /**
     * Operation Management
     */
    async createOperation(name: string, targets: any[], updates: any, options: any = {}, createdBy: string): Promise<any> {
        const operation = {
            id: this.generateOperationId(),
            name,
            targets,
            updates,
            validation: {
                skipInvalid: false,
                ...options.validation
            },
            execution: {
                mode: 'sequential',
                maxRetries: 3,
                retryDelay: 1000,
                timeout: 30000,
                backupBeforeUpdate: true,
                ...options.execution
            },
            rollback: {
                enabled: true,
                autoRollbackOnFailure: false,
                retainBackups: true,
                ...options.rollback
            },
            status: 'draft',
            progress: {
                total: targets.length,
                completed: 0,
                failed: 0,
                skipped: 0
            },
            results: [],
            createdAt: new Date(),
            createdBy
        };
        this.operations.set(operation.id, operation);
        this.notifyListeners('operation_created', operation);
        return operation;
    }
    async validateOperation(operationId) {
        const operation = this.operations.get(operationId);
        if (!operation) {
            throw new Error(`Operation ${operationId} not found`);
        }
        operation.status = 'validating';
        this.operations.set(operationId, operation);
        this.notifyListeners('operation_status_changed', operation);
        const validationResult = {
            valid: true,
            errors: [],
            warnings: [],
            targetResults: []
        };
        try {
            // Validate each target
            for (const target of operation.targets) {
                const targetResult = await this.validateTarget(target, operation.updates, operation.validation);
                validationResult.targetResults.push(targetResult);
                if (!targetResult.valid) {
                    validationResult.valid = false;
                    validationResult.errors.push(...targetResult.errors);
                }
                validationResult.warnings.push(...targetResult.warnings);
            }
            operation.status = validationResult.valid ? 'validated' : 'failed';
            this.operations.set(operationId, operation);
            this.notifyListeners('operation_validated', { operation, result: validationResult });
            return validationResult;
        }
        catch (error) {
            operation.status = 'failed';
            this.operations.set(operationId, operation);
            throw error;
        }
    }
    async executeOperation(operationId) {
        const operation = this.operations.get(operationId);
        if (!operation) {
            throw new Error(`Operation ${operationId} not found`);
        }
        if (operation.status !== 'validated' && operation.status !== 'draft') {
            throw new Error(`Operation ${operationId} is not in a valid state for execution`);
        }
        operation.status = 'executing';
        operation.executedAt = new Date();
        operation.progress.startTime = new Date();
        this.operations.set(operationId, operation);
        this.notifyListeners('operation_started', operation);
        try {
            switch (operation.execution.mode) {
                case 'sequential':
                    await this.executeSequentially(operation);
                    break;
                case 'parallel':
                    await this.executeInParallel(operation);
                    break;
                case 'batched':
                    await this.executeInBatches(operation);
                    break;
            }
            operation.status = operation.progress.failed > 0 ? 'failed' : 'completed';
            operation.completedAt = new Date();
            this.operations.set(operationId, operation);
            this.notifyListeners('operation_completed', operation);
            return true;
        }
        catch (error) {
            operation.status = 'failed';
            this.operations.set(operationId, operation);
            this.notifyListeners('operation_failed', { operation, error });
            // Auto-rollback if configured
            if (operation.rollback.enabled && operation.rollback.autoRollbackOnFailure) {
                await this.rollbackOperation(operationId);
            }
            throw error;
        }
    }
    async rollbackOperation(operationId) {
        const operation = this.operations.get(operationId);
        if (!operation) {
            throw new Error(`Operation ${operationId} not found`);
        }
        if (!operation.rollback.enabled) {
            throw new Error(`Rollback is not enabled for operation ${operationId}`);
        }
        operation.status = 'rolling_back';
        this.operations.set(operationId, operation);
        this.notifyListeners('operation_rollback_started', operation);
        try {
            const successfulResults = operation.results.filter(r => r.status === 'success');
            for (const result of successfulResults) {
                if (result.backup) {
                    const provider = this.entityProviders.get(result.targetType);
                    if (provider) {
                        await provider.updateEntity(result.targetId, result.backup);
                    }
                }
            }
            operation.status = 'rolled_back';
            operation.rolledBackAt = new Date();
            this.operations.set(operationId, operation);
            this.notifyListeners('operation_rolled_back', operation);
            return true;
        }
        catch (error) {
            this.notifyListeners('operation_rollback_failed', { operation, error });
            throw error;
        }
    }
    /**
     * Template Management
     */
    async createTemplate(name, targetType, updates, validation, execution, createdBy) {
        const template = {
            id: this.generateTemplateId(),
            name,
            description: `Template for ${targetType} bulk updates`,
            targetType,
            updates,
            validation,
            execution,
            usageCount: 0,
            createdBy,
            createdAt: new Date()
        };
        this.templates.set(template.id, template);
        this.notifyListeners('template_created', template);
        return template;
    }
    async applyTemplate(templateId, targets, operationName, createdBy) {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }
        // Update usage tracking
        template.usageCount++;
        template.lastUsed = new Date();
        this.templates.set(templateId, template);
        const operation = await this.createOperation(operationName, targets, template.updates, {
            validation: template.validation,
            execution: template.execution
        }, createdBy);
        this.notifyListeners('template_applied', { template, operation });
        return operation;
    }
    /**
     * Data Retrieval
     */
    getOperations(filter) {
        let operations = Array.from(this.operations.values());
        if (!filter)
            return operations;
        if (filter.statuses?.length) {
            operations = operations.filter(op => filter.statuses.includes(op.status));
        }
        if (filter.targetTypes?.length) {
            operations = operations.filter(op => op.targets.some(target => filter.targetTypes.includes(target.type)));
        }
        if (filter.createdBy?.length) {
            operations = operations.filter(op => filter.createdBy.includes(op.createdBy));
        }
        if (filter.dateRange) {
            operations = operations.filter(op => {
                const date = op.createdAt;
                return (!filter.dateRange.start || date >= filter.dateRange.start) &&
                    (!filter.dateRange.end || date <= filter.dateRange.end);
            });
        }
        if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase();
            operations = operations.filter(op => op.name.toLowerCase().includes(query) ||
                op.description?.toLowerCase().includes(query));
        }
        if (filter.hasErrors !== undefined) {
            operations = operations.filter(op => filter.hasErrors
                ? op.progress.failed > 0
                : op.progress.failed === 0);
        }
        return operations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    getTemplates(targetType) {
        let templates = Array.from(this.templates.values());
        if (targetType) {
            templates = templates.filter(t => t.targetType === targetType);
        }
        return templates.sort((a, b) => b.usageCount - a.usageCount);
    }
    getBulkUpdateStats() {
        const operations = Array.from(this.operations.values());
        const completedOps = operations.filter(op => op.status === 'completed');
        const failedOps = operations.filter(op => op.status === 'failed');
        const totalTargets = operations.reduce((sum, op) => sum + op.targets.length, 0);
        const totalProcessingTime = operations
            .filter(op => op.executedAt && op.completedAt)
            .reduce((sum, op) => sum + (op.completedAt.getTime() - op.executedAt.getTime()), 0);
        const averageProcessingTime = operations.length > 0 ? totalProcessingTime / operations.length : 0;
        // Calculate success rates by target type
        const successRateByType = {};
        operations.forEach(op => {
            op.results.forEach(result => {
                if (!successRateByType[result.targetType]) {
                    successRateByType[result.targetType] = { total: 0, successful: 0, rate: 0 };
                }
                successRateByType[result.targetType].total++;
                if (result.status === 'success') {
                    successRateByType[result.targetType].successful++;
                }
            });
        });
        Object.values(successRateByType).forEach(stats => {
            stats.rate = stats.total > 0 ? (stats.successful / stats.total) * 100 : 0;
        });
        // Collect common errors
        const errorMap = new Map();
        operations.forEach(op => {
            op.results.forEach(result => {
                result.errors.forEach(error => {
                    const key = `${error.type}:${error.message}`;
                    if (!errorMap.has(key)) {
                        errorMap.set(key, { count: 0, affectedTargets: new Set() });
                    }
                    const errorStats = errorMap.get(key);
                    errorStats.count++;
                    errorStats.affectedTargets.add(result.targetId);
                });
            });
        });
        const commonErrors = Array.from(errorMap.entries())
            .map(([key, stats]) => {
            const [type, message] = key.split(':', 2);
            return {
                type,
                message,
                count: stats.count,
                affectedTargets: stats.affectedTargets.size
            };
        })
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        // Performance metrics
        const completedResults = operations.flatMap(op => op.results.filter(r => r.status === 'success'));
        const totalItemTime = completedResults.reduce((sum, r) => sum + r.duration, 0);
        const averageItemsPerSecond = completedResults.length > 0 && totalItemTime > 0
            ? (completedResults.length / totalItemTime) * 1000
            : 0;
        const batchSizes = operations.map(op => op.targets.length);
        const largestBatchSize = batchSizes.length > 0 ? Math.max(...batchSizes) : 0;
        const operationDurations = operations
            .filter(op => op.executedAt && op.completedAt)
            .map(op => op.completedAt.getTime() - op.executedAt.getTime());
        const longestOperation = operationDurations.length > 0 ? Math.max(...operationDurations) : 0;
        return {
            totalOperations: operations.length,
            completedOperations: completedOps.length,
            failedOperations: failedOps.length,
            totalTargetsProcessed: totalTargets,
            averageProcessingTime,
            successRateByType,
            commonErrors,
            performanceMetrics: {
                averageItemsPerSecond,
                largestBatchSize,
                longestOperation,
                totalProcessingTime
            }
        };
    }
    /**
     * Event Handling
     */
    subscribe(listenerId, callback) {
        this.listeners.set(listenerId, callback);
    }
    unsubscribe(listenerId) {
        this.listeners.delete(listenerId);
    }
    // Private methods
    async executeSequentially(operation) {
        for (let i = 0; i < operation.targets.length; i++) {
            const target = operation.targets[i];
            operation.progress.currentItem = target.displayName || target.id;
            try {
                const result = await this.executeForTarget(target, operation);
                operation.results.push(result);
                if (result.status === 'success') {
                    operation.progress.completed++;
                }
                else {
                    operation.progress.failed++;
                }
                // Apply delay if configured
                if (operation.execution.delayBetweenItems && i < operation.targets.length - 1) {
                    await this.sleep(operation.execution.delayBetweenItems);
                }
            }
            catch (error) {
                operation.progress.failed++;
                operation.results.push({
                    targetId: target.id,
                    targetType: target.type,
                    status: 'failed',
                    changes: [],
                    errors: [{
                            type: 'execution',
                            message: error instanceof Error ? error.message : 'Unknown error'
                        }],
                    executedAt: new Date(),
                    duration: 0
                });
            }
            this.operations.set(operation.id, operation);
            this.notifyListeners('operation_progress', operation);
        }
    }
    async executeInParallel(operation) {
        const promises = operation.targets.map(async (target) => {
            try {
                const result = await this.executeForTarget(target, operation);
                operation.results.push(result);
                if (result.status === 'success') {
                    operation.progress.completed++;
                }
                else {
                    operation.progress.failed++;
                }
                return result;
            }
            catch (error) {
                operation.progress.failed++;
                const errorResult = {
                    targetId: target.id,
                    targetType: target.type,
                    status: 'failed',
                    changes: [],
                    errors: [{
                            type: 'execution',
                            message: error instanceof Error ? error.message : 'Unknown error'
                        }],
                    executedAt: new Date(),
                    duration: 0
                };
                operation.results.push(errorResult);
                return errorResult;
            }
        });
        await Promise.allSettled(promises);
        this.operations.set(operation.id, operation);
    }
    async executeInBatches(operation) {
        const batchSize = operation.execution.batchSize || 10;
        const batches = this.chunkArray(operation.targets, batchSize);
        for (const batch of batches) {
            const batchPromises = batch.map(target => this.executeForTarget(target, operation));
            const batchResults = await Promise.allSettled(batchPromises);
            batchResults.forEach((result, index) => {
                const target = batch[index];
                if (result.status === 'fulfilled') {
                    operation.results.push(result.value);
                    if (result.value.status === 'success') {
                        operation.progress.completed++;
                    }
                    else {
                        operation.progress.failed++;
                    }
                }
                else {
                    operation.progress.failed++;
                    operation.results.push({
                        targetId: target.id,
                        targetType: target.type,
                        status: 'failed',
                        changes: [],
                        errors: [{
                                type: 'execution',
                                message: result.reason?.message || 'Unknown error'
                            }],
                        executedAt: new Date(),
                        duration: 0
                    });
                }
            });
            this.operations.set(operation.id, operation);
            this.notifyListeners('operation_progress', operation);
            // Add delay between batches if configured
            if (operation.execution.delayBetweenItems) {
                await this.sleep(operation.execution.delayBetweenItems);
            }
        }
    }
    async executeForTarget(target, operation) {
        const startTime = Date.now();
        const result = {
            targetId: target.id,
            targetType: target.type,
            status: 'success',
            changes: [],
            errors: [],
            executedAt: new Date(),
            duration: 0
        };
        try {
            const provider = this.entityProviders.get(target.type);
            if (!provider) {
                throw new Error(`No entity provider registered for type: ${target.type}`);
            }
            // Get current entity state
            const currentEntity = await provider.getEntity(target.id);
            if (!currentEntity) {
                throw new Error(`Entity ${target.id} not found`);
            }
            // Create backup if needed
            if (operation.execution.backupBeforeUpdate) {
                result.backup = { ...currentEntity };
            }
            // Apply updates
            const updatedEntity = { ...currentEntity };
            for (const update of operation.updates) {
                const change = await this.applyPropertyUpdate(updatedEntity, update, currentEntity);
                result.changes.push(change);
            }
            // Update entity if not dry run
            if (!operation.execution.dryRun) {
                await provider.updateEntity(target.id, updatedEntity);
            }
        }
        catch (error) {
            result.status = 'failed';
            result.errors.push({
                type: 'execution',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
        result.duration = Date.now() - startTime;
        return result;
    }
    async applyPropertyUpdate(entity, update, originalEntity) {
        const change = {
            property: update.property,
            oldValue: entity[update.property],
            newValue: undefined,
            operation: update.operation,
            applied: false
        };
        try {
            // Check conditions
            if (update.conditions && !this.evaluateConditions(update.conditions, originalEntity)) {
                return change;
            }
            // Apply transformation if specified
            let value = update.value;
            if (update.transformation) {
                value = this.applyTransformation(value, update.transformation, originalEntity);
            }
            // Apply the update operation
            switch (update.operation) {
                case 'set':
                    entity[update.property] = value;
                    break;
                case 'unset':
                    delete entity[update.property];
                    break;
                case 'append':
                    entity[update.property] = (entity[update.property] || '') + value;
                    break;
                case 'prepend':
                    entity[update.property] = value + (entity[update.property] || '');
                    break;
                case 'increment':
                    entity[update.property] = (entity[update.property] || 0) + (value || 1);
                    break;
                case 'decrement':
                    entity[update.property] = (entity[update.property] || 0) - (value || 1);
                    break;
                case 'multiply':
                    entity[update.property] = (entity[update.property] || 0) * (value || 1);
                    break;
                case 'push':
                    if (!Array.isArray(entity[update.property])) {
                        entity[update.property] = [];
                    }
                    entity[update.property].push(value);
                    break;
                case 'pull':
                    if (Array.isArray(entity[update.property])) {
                        entity[update.property] = entity[update.property].filter((item) => item !== value);
                    }
                    break;
                case 'toggle':
                    entity[update.property] = !entity[update.property];
                    break;
                case 'merge':
                    if (typeof entity[update.property] === 'object' && typeof value === 'object') {
                        entity[update.property] = { ...entity[update.property], ...value };
                    }
                    break;
                default:
                    throw new Error(`Unknown update operation: ${update.operation}`);
            }
            change.newValue = entity[update.property];
            change.applied = true;
        }
        catch (error) {
            // Update failed, but we don't throw here to allow other updates to continue
        }
        return change;
    }
    evaluateConditions(conditions, entity) {
        return conditions.every(condition => {
            const fieldValue = entity[condition.field];
            switch (condition.type) {
                case 'equals':
                    return fieldValue === condition.value;
                case 'not_equals':
                    return fieldValue !== condition.value;
                case 'contains':
                    return String(fieldValue).includes(String(condition.value));
                case 'not_contains':
                    return !String(fieldValue).includes(String(condition.value));
                case 'greater_than':
                    return Number(fieldValue) > Number(condition.value);
                case 'less_than':
                    return Number(fieldValue) < Number(condition.value);
                case 'exists':
                    return fieldValue !== undefined && fieldValue !== null;
                case 'not_exists':
                    return fieldValue === undefined || fieldValue === null;
                case 'matches_regex':
                    return new RegExp(condition.value).test(String(fieldValue));
                default:
                    return true;
            }
        });
    }
    applyTransformation(value, transformation, entity) {
        switch (transformation.type) {
            case 'case_convert':
                const caseType = transformation.parameters.case;
                if (caseType === 'upper')
                    return String(value).toUpperCase();
                if (caseType === 'lower')
                    return String(value).toLowerCase();
                if (caseType === 'title')
                    return String(value).replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
                return value;
            case 'trim':
                return String(value).trim();
            case 'replace':
                return String(value).replace(new RegExp(transformation.parameters.search, transformation.parameters.flags || 'g'), transformation.parameters.replace);
            case 'append':
                return String(value) + String(transformation.parameters.suffix || '');
            case 'prepend':
                return String(transformation.parameters.prefix || '') + String(value);
            default:
                return value;
        }
    }
    async validateTarget(target, updates, validation) {
        const result = {
            targetId: target.id,
            valid: true,
            errors: [],
            warnings: []
        };
        try {
            const provider = this.entityProviders.get(target.type);
            if (!provider) {
                result.valid = false;
                result.errors.push({
                    type: 'not_found',
                    message: `No entity provider registered for type: ${target.type}`
                });
                return result;
            }
            const entity = await provider.getEntity(target.id);
            if (!entity) {
                result.valid = false;
                result.errors.push({
                    type: 'not_found',
                    message: `Entity ${target.id} not found`
                });
                return result;
            }
            // Validate required fields
            if (validation.required) {
                for (const field of validation.required) {
                    if (entity[field] === undefined || entity[field] === null) {
                        result.valid = false;
                        result.errors.push({
                            type: 'validation',
                            message: `Required field '${field}' is missing`,
                            property: field
                        });
                    }
                }
            }
            // Validate property constraints
            if (validation.constraints) {
                for (const constraint of validation.constraints) {
                    const constraintResult = this.validatePropertyConstraint(entity, constraint);
                    if (!constraintResult.valid) {
                        result.valid = false;
                        result.errors.push({
                            type: 'validation',
                            message: constraintResult.message,
                            property: constraint.property
                        });
                    }
                }
            }
        }
        catch (error) {
            result.valid = false;
            result.errors.push({
                type: 'execution',
                message: error instanceof Error ? error.message : 'Validation error'
            });
        }
        return result;
    }
    validatePropertyConstraint(entity, constraint) {
        const value = entity[constraint.property];
        switch (constraint.type) {
            case 'type':
                const expectedType = constraint.parameters.type;
                const actualType = typeof value;
                if (actualType !== expectedType) {
                    return {
                        valid: false,
                        message: `Expected ${expectedType}, got ${actualType}`
                    };
                }
                break;
            case 'length':
                const length = String(value).length;
                const min = constraint.parameters.min;
                const max = constraint.parameters.max;
                if ((min !== undefined && length < min) || (max !== undefined && length > max)) {
                    return {
                        valid: false,
                        message: `Length must be between ${min || 0} and ${max || 'unlimited'}`
                    };
                }
                break;
            case 'range':
                const num = Number(value);
                const minVal = constraint.parameters.min;
                const maxVal = constraint.parameters.max;
                if ((minVal !== undefined && num < minVal) || (maxVal !== undefined && num > maxVal)) {
                    return {
                        valid: false,
                        message: `Value must be between ${minVal || '-∞'} and ${maxVal || '∞'}`
                    };
                }
                break;
            case 'pattern':
                const pattern = new RegExp(constraint.parameters.pattern);
                if (!pattern.test(String(value))) {
                    return {
                        valid: false,
                        message: constraint.message || 'Value does not match required pattern'
                    };
                }
                break;
            case 'enum':
                const allowedValues = constraint.parameters.values;
                if (!allowedValues.includes(value)) {
                    return {
                        valid: false,
                        message: `Value must be one of: ${allowedValues.join(', ')}`
                    };
                }
                break;
        }
        return { valid: true, message: '' };
    }
    registerDefaultEntityProviders() {
        // Register mock providers - in real implementation, these would connect to actual data sources
        this.entityProviders.set('user', {
            getEntity: async (id) => ({ id, type: 'user', name: 'Mock User' }),
            updateEntity: async (id, data) => ({ ...data, id })
        });
        this.entityProviders.set('content', {
            getEntity: async (id) => ({ id, type: 'content', title: 'Mock Content' }),
            updateEntity: async (id, data) => ({ ...data, id })
        });
    }
    notifyListeners(eventType, data) {
        this.listeners.forEach(callback => {
            try {
                callback({ type: eventType, data, timestamp: new Date() });
            }
            catch (error) {
                console.error('Error in bulk update listener:', error);
            }
        });
    }
    generateOperationId() {
        return `bulk_op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateTemplateId() {
        return `bulk_tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
// Export singleton instance
export const bulkPropertyUpdateService = BulkPropertyUpdateService.getInstance();
// Convenience functions
export const createBulkOperation = (name, targets, updates, options, createdBy) => bulkPropertyUpdateService.createOperation(name, targets, updates, options, createdBy);
export const executeBulkOperation = (operationId) => bulkPropertyUpdateService.executeOperation(operationId);
export const getBulkOperations = (filter) => bulkPropertyUpdateService.getOperations(filter);
export const getBulkUpdateStats = () => bulkPropertyUpdateService.getBulkUpdateStats();
