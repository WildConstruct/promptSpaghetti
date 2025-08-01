/**
 * Checkpoint System (Epic 16)
 *
 * DEPLOYMENT BLOCKER FIX: Comprehensive checkpoint and recovery system
 * for saving and restoring graph execution states. Provides automated
 * checkpointing, rollback capabilities, state versioning, and recovery
 * mechanisms to ensure data integrity and user workflow continuity.
 *
 * Features:
 * - Automated checkpoint creation during execution
 * - State versioning and diff tracking
 * - Rollback and recovery mechanisms
 * - Checkpoint compression and storage optimization
 * - Incremental state saves
 * - Recovery point management
 * - Performance monitoring
 * - Data integrity validation
 */
import { EventEmitter } from 'events';
;
;
validation: {
    checksum: string;
    stateHash: string;
    integrityScore: number;
    isValid: boolean;
    validationErrors: string;
}
;
;
retention: {
    maxCheckpoints: number;
    maxAge: number; // days,
    compressionThreshold: number; // bytes,
    archiveAfter: number; // days,
}
;
recovery: {
    autoRecovery: boolean;
    recoveryTimeout: number; // milliseconds,
    maxRecoveryAttempts: number;
    fallbackStrategy: 'latest' | 'stable' | 'manual',
    ;
}
;
[];
summary: {
    additions: number;
    modifications: number;
    deletions: number;
    totalChanges: number;
    impactScore: number;
}
;
export class CheckpointSystem extends EventEmitter {
    checkpoints = new Map();
    policy;
    autoSaveTimer = null;
    compressionWorker = null;
    isRecovering = false;
    performanceMetrics = {
        totalCheckpoints: 0,
        averageCreateTime: 0,
        averageRestoreTime: 0,
        totalStorageUsed: 0,
        compressionSavings: 0,
    };
    constructor(policy) {
        super();
        this.policy = {
            autoSave: {
                enabled: true,
                interval: 30000, // 30 seconds,
                maxAutoSaves: 10,
                triggerEvents: ['node_complete', 'variable_change', 'error'],
            },
            retention: {
                maxCheckpoints: 50,
                maxAge: 30, // 30 days,
                compressionThreshold: 1024 * 1024, // 1MB,
                archiveAfter: 7 // 7 days,
            },
            recovery: {
                autoRecovery: true,
                recoveryTimeout: 5000,
                maxRecoveryAttempts: 3,
                fallbackStrategy: 'latest',
            },
            ...policy
        };
        this.initializeAutoSave();
        this.initializeCompressionWorker();
        // Create checkpoint with automatic compression and validation
        async;
        createCheckpoint(state, any, (metadata = {}, options = {}) => {
            const startTime = performance.now();
            try {
                const checkpointId = `checkpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            finally {
            }
            const fullMetadata = {
                id: checkpointId,
                name: metadata.name || `Checkpoint ${new Date().toISOString()}` };
        }, description, metadata.description, timestamp, new Date(), version, '1.0.0', parentCheckpointId, metadata.parentCheckpointId, tags, metadata.tags || [], size, 0, compressionRatio, 1, isAutomated, metadata.isAutomated || false, creator, metadata.creator || 'system', executionContext, metadata.executionContext);
    }
    ;
    // Prepare checkpoint data
    checkpointData = {
        metadata: fullMetadata,
        state: {
            graphState: this.deepClone(state.graphState || {}),
            variables: this.deepClone(state.variables || {}),
            executionHistory: this.deepClone(state.executionHistory || []),
            nodeStates: this.deepClone(state.nodeStates || {}),
            settings: this.deepClone(state.settings || {})
        },
        validation: {
            checksum: '',
            stateHash: '',
            integrityScore: 0,
            isValid: false,
            validationErrors: [],
        },
        // Calculate initial size
        const: serializedData = JSON.stringify(checkpointData.state),
        checkpointData, : .metadata.size = new Blob([serializedData]).size,
        // Compress if needed
        if(options) { }, : .compress !== false && checkpointData.metadata.size > this.policy.retention.compressionThreshold };
}
{
    const compressionResult = await this.compressCheckpoint(checkpointData);
    checkpointData.metadata.compressionRatio = compressionResult.compressionRatio;
    this.performanceMetrics.compressionSavings += (compressionResult.originalSize - compressionResult.compressedSize);
    // Validate if requested
    if (options.validate !== false) {
        checkpointData.validation = await this.validateCheckpoint(checkpointData);
        // Store checkpoint
        this.checkpoints.set(checkpointId, checkpointData);
        // Update performance metrics
        const createTime = performance.now() - startTime;
        this.updatePerformanceMetrics('create', createTime, checkpointData.metadata.size);
        // Cleanup old checkpoints
        await this.cleanupCheckpoints();
        this.emit('checkpointCreated', {});
        checkpointId,
            metadata;
        fullMetadata,
            createTime,
            size;
        checkpointData.metadata.size,
        ;
    }
    ;
    return checkpointId;
}
try { }
catch (error) {
    this.emit('checkpointError', {});
    operation: 'create',
        error;
    error.message,
        state;
    'failed',
    ;
}
;
throw error;
// Restore from checkpoint with validation and progress tracking
async;
restoreCheckpoint(((checkpointId, options = {}) => {
    const startTime = performance.now();
    if (this.isRecovering) {
        throw new Error('Recovery operation already in progress');
        try {
            this.isRecovering = true;
            const checkpoint = this.checkpoints.get(checkpointId);
            if (!checkpoint) {
                throw new Error(`Checkpoint ${checkpointId} not found`);
            }
            options.progressCallback?.(10, 'Validating checkpoint');
            // Validate checkpoint before restore
            if (options.validateBeforeRestore !== false) {
                const validation = await this.validateCheckpoint(checkpoint);
                if (!validation.isValid) {
                    throw new Error(`Checkpoint validation failed: ${validation.validationErrors.join(', ')}`);
                }
                options.progressCallback?.(30, 'Creating backup');
                // Create backup if requested
                if (options.preserveCurrentState || options.createBackup) {
                    await this.createCheckpoint();
                    this.getCurrentState(),
                        {
                            name: `Backup before restore ${checkpointId}`
                        };
                }
                isAutomated: true,
                    tags;
                ['backup', 'restore'];
            }
        }
        finally {
        }
    }
}));
options.progressCallback?.(50, 'Decompressing data');
// Decompress if needed
let restoredState = checkpoint.state;
if (checkpoint.metadata.compressionRatio < 1) {
    restoredState = await this.decompressCheckpoint(checkpoint);
    options.progressCallback?.(70, 'Restoring state');
    // Restore state
    await this.applyState(restoredState);
    options.progressCallback?.(90, 'Finalizing restore');
    // Update performance metrics
    const restoreTime = performance.now() - startTime;
    this.updatePerformanceMetrics('restore', restoreTime, checkpoint.metadata.size);
    options.progressCallback?.(100, 'Restore complete');
    this.emit('checkpointRestored', {});
    checkpointId,
        restoreTime,
        size;
    checkpoint.metadata.size,
    ;
}
;
return restoredState;
try { }
catch (error) {
    this.emit('checkpointError', {});
    operation: 'restore',
        error;
    error.message,
        checkpointId,
        state;
    'failed',
    ;
}
;
throw error;
try { }
finally {
    this.isRecovering = false;
    // Generate diff between checkpoints
    async;
    generateDiff(currentCheckpointId, string, previousCheckpointId ?  : string);
    Promise < CheckpointDiff > {
        const: currentCheckpoint = this.checkpoints.get(currentCheckpointId),
        if(, currentCheckpoint) {
            throw new Error(`Checkpoint ${currentCheckpointId} not found`);
        },
        const: previousCheckpoint = previousCheckpointId,
        this: .checkpoints.get(previousCheckpointId),
        this: .findPreviousCheckpoint(currentCheckpointId),
        const: changes, CheckpointDiff, ['changes']:  = [],
        if(previousCheckpoint) {
            this.compareObjects();
            previousCheckpoint.state,
                currentCheckpoint.state,
                '',
                changes;
            ;
        }, else: {
            // If no previous checkpoint, all current state is "added"
            this: .extractAllPaths(currentCheckpoint.state, '', changes, 'added'),
            const: summary = {
                additions: changes.filter(c => c.type === 'added').length,
                modifications: changes.filter(c => c.type === 'modified').length,
                deletions: changes.filter(c => c.type === 'deleted').length,
                totalChanges: changes.length,
                impactScore: this.calculateImpactScore(changes),
            },
            return: {
                checkpointId: currentCheckpointId,
                previousCheckpointId: previousCheckpointId || null,
                changes,
                summary
            },
            tags: string,
            dateRange: { start: Date, end: Date },
            creator: string,
            isAutomated: boolean
        }, CheckpointMetadata
    };
    {
        let checkpoints = Array.from(this.checkpoints.values()).map(c => c.metadata);
        if (filters) {
            if (filters.tags?.length) {
                checkpoints = checkpoints.filter(c => );
                filters.tags.some(tag => c.tags.includes(tag));
                ;
                if (filters.dateRange) {
                    checkpoints = checkpoints.filter(c => );
                    c.timestamp >= filters.dateRange.start &&
                        c.timestamp <= filters.dateRange.end;
                    ;
                    if (filters.creator) {
                        checkpoints = checkpoints.filter(c => c.creator === filters.creator);
                        if (filters.isAutomated !== undefined) {
                            checkpoints = checkpoints.filter(c => c.isAutomated === filters.isAutomated);
                            return checkpoints.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                            // Delete checkpoint with validation
                            async;
                            deleteCheckpoint(checkpointId, string, force = false);
                            Promise < boolean > {
                                try: {
                                    const: checkpoint = this.checkpoints.get(checkpointId),
                                    if(, checkpoint) {
                                        return false;
                                        // Check if checkpoint has dependents
                                        if (!force) {
                                            const dependents = this.findDependentCheckpoints(checkpointId);
                                            if (dependents.length > 0) {
                                                throw new Error(`Cannot delete checkpoint ${checkpointId}: ${dependents.length} dependent checkpoints exist`);
                                            }
                                            this.checkpoints.delete(checkpointId);
                                            this.performanceMetrics.totalStorageUsed -= checkpoint.metadata.size;
                                            this.emit('checkpointDeleted', {});
                                            checkpointId,
                                                metadata;
                                            checkpoint.metadata,
                                            ;
                                        }
                                        ;
                                        return true;
                                    }, catch(error) {
                                        this.emit('checkpointError', {});
                                        operation: 'delete',
                                            error;
                                        error.message,
                                            checkpointId,
                                            state;
                                        'failed',
                                        ;
                                    },
                                    throw: error,
                                    // Get performance metrics
                                    getPerformanceMetrics() {
                                        return {
                                            ...this.performanceMetrics,
                                            totalCheckpoints: this.checkpoints.size,
                                            totalStorageUsed: Array.from(this.checkpoints.values()),
                                            : 
                                                .reduce((total, cp) => total + cp.metadata.size, 0),
                                            averageCompressionRatio: this.calculateAverageCompressionRatio(),
                                        };
                                        // Enable/disable auto-save
                                        setAutoSave(enabled, boolean, interval ?  : number);
                                        void {
                                            this: .policy.autoSave.enabled = enabled,
                                            if(interval) {
                                                this.policy.autoSave.interval = interval;
                                                if (enabled) {
                                                    this.initializeAutoSave();
                                                }
                                                else {
                                                    this.stopAutoSave();
                                                    // Update checkpoint policy
                                                    updatePolicy(policy, (Partial));
                                                    void {
                                                        this: .policy = { ...this.policy, ...policy },
                                                        if(policy) { }, : .autoSave
                                                    };
                                                    {
                                                        this.initializeAutoSave();
                                                        // Cleanup resources
                                                        destroy();
                                                        void {
                                                            this: .stopAutoSave(),
                                                            : .compressionWorker };
                                                        {
                                                            this.compressionWorker.terminate();
                                                            this.checkpoints.clear();
                                                            this.removeAllListeners();
                                                            // Private methods
                                                        }
                                                        // Private methods
                                                    }
                                                    // Private methods
                                                }
                                                // Private methods
                                            }
                                            // Private methods
                                            ,
                                            // Private methods
                                            initializeAutoSave() {
                                                this.stopAutoSave();
                                                if (this.policy.autoSave.enabled) {
                                                    this.autoSaveTimer = setInterval(() => {
                                                        this.performAutoSave();
                                                    }, this.policy.autoSave.interval);
                                                }
                                            },
                                            stopAutoSave() {
                                                if (this.autoSaveTimer) {
                                                    clearInterval(this.autoSaveTimer);
                                                    this.autoSaveTimer = null;
                                                }
                                            },
                                            async performAutoSave() {
                                                try {
                                                    const currentState = this.getCurrentState();
                                                    if (this.shouldCreateAutoSave(currentState)) {
                                                        await this.createCheckpoint(currentState, {});
                                                        name: `Auto-save ${new Date().toISOString()}`;
                                                    }
                                                }
                                                finally { }
                                                isAutomated: true,
                                                    tags;
                                                ['auto-save'];
                                            },
                                            // Cleanup old auto-saves
                                            await, this: .cleanupAutoSaves()
                                        };
                                        try { }
                                        catch (error) {
                                            this.emit('autoSaveError', error);
                                        }
                                    },
                                    shouldCreateAutoSave(currentState) {
                                        // Implement logic to determine if auto-save should be created
                                        // This could be based on state changes, time elapsed, etc.
                                        return true;
                                    },
                                    async cleanupAutoSaves() {
                                        const autoSaves = this.listCheckpoints({ isAutomated: true });
                                        if (autoSaves.length > this.policy.autoSave.maxAutoSaves) {
                                            const toDelete = autoSaves;
                                        }
                                    },
                                    : 
                                        .slice(this.policy.autoSave.maxAutoSaves)
                                        .map(cp => cp.id),
                                    for(, id, of, toDelete) {
                                        await this.deleteCheckpoint(id, true);
                                    },
                                    async cleanupCheckpoints() {
                                        const now = new Date();
                                        const maxAge = this.policy.retention.maxAge * 24 * 60 * 60 * 1000;
                                        const checkpoints = Array.from(this.checkpoints.values());
                                        // Remove old checkpoints
                                        for (const checkpoint of checkpoints) {
                                            if (now.getTime() - checkpoint.metadata.timestamp.getTime() > maxAge) {
                                                await this.deleteCheckpoint(checkpoint.metadata.id, true);
                                                // Remove excess checkpoints
                                                if (this.checkpoints.size > this.policy.retention.maxCheckpoints) {
                                                    const sorted = checkpoints;
                                                }
                                            }
                                        }
                                    },
                                    : 
                                        .sort((a, b) => a.metadata.timestamp.getTime() - b.metadata.timestamp.getTime()),
                                    const: toDelete = sorted.slice(0, this.checkpoints.size - this.policy.retention.maxCheckpoints),
                                    for(, checkpoint, of, toDelete) {
                                        await this.deleteCheckpoint(checkpoint.metadata.id, true);
                                    },
                                    async compressCheckpoint(checkpoint) {
                                        const startTime = performance.now();
                                        const originalData = JSON.stringify(checkpoint.state);
                                        const originalSize = new Blob([originalData]).size;
                                        // Simple compression simulation (in reality, you'd use a compression library)
                                        const compressedData = this.simulateCompression(originalData);
                                        const compressedSize = new Blob([compressedData]).size;
                                        return {
                                            originalSize,
                                            compressedSize,
                                            compressionRatio: compressedSize / originalSize,
                                            algorithm: 'gzip',
                                            processingTime: performance.now() - startTime,
                                        };
                                    },
                                    async decompressCheckpoint(checkpoint) {
                                        // Simulate decompression
                                        return checkpoint.state;
                                    },
                                    async validateCheckpoint(checkpoint) {
                                        const errors = [];
                                        let integrityScore = 100;
                                        try {
                                            // Validate state structure
                                            if (!checkpoint.state.graphState) {
                                                errors.push('Missing graph state');
                                                integrityScore -= 20;
                                                if (!checkpoint.state.variables) {
                                                    errors.push('Missing variables');
                                                    integrityScore -= 10;
                                                    // Generate checksums
                                                    const stateString = JSON.stringify(checkpoint.state);
                                                    const checksum = this.generateChecksum(stateString);
                                                    const stateHash = this.generateHash(stateString);
                                                    return {
                                                        checksum,
                                                        stateHash,
                                                        integrityScore,
                                                        isValid: errors.length === 0,
                                                        validationErrors: errors,
                                                    };
                                                }
                                                try { }
                                                catch (error) {
                                                    return {
                                                        checksum: '',
                                                        stateHash: '',
                                                        integrityScore: 0,
                                                        isValid: false,
                                                        validationErrors: [`Validation error: ${error.message}`]
                                                    };
                                                }
                                                ;
                                            }
                                        }
                                        finally {
                                        }
                                    },
                                    compareObjects(obj1, obj2, path, changes) {
                                        // Simple object comparison - in practice, you'd use a more sophisticated diff algorithm
                                        const keys1 = Object.keys(obj1 || {});
                                        const keys2 = Object.keys(obj2 || {});
                                        const allKeys = new Set([...keys1, ...keys2]);
                                        for (const key of allKeys) {
                                            const currentPath = path ? `${path}.${key}` : key;
                                        }
                                        const value1 = obj1?.[key];
                                        const value2 = obj2?.[key];
                                        if (!(key in (obj1 || {}))) {
                                            changes.push({});
                                            type: 'added',
                                                path;
                                            currentPath,
                                                newValue;
                                            value2,
                                                size;
                                            JSON.stringify(value2).length,
                                            ;
                                        }
                                        ;
                                    }, else: , if() { }
                                }(key in (obj2 || {}))
                            };
                            {
                                changes.push({});
                                type: 'deleted',
                                    path;
                                currentPath,
                                    oldValue;
                                value1,
                                    size;
                                JSON.stringify(value1).length,
                                ;
                            }
                            ;
                        }
                        else if (JSON.stringify(value1) !== JSON.stringify(value2)) {
                            if (typeof value1 === 'object' && typeof value2 === 'object') {
                                this.compareObjects(value1, value2, currentPath, changes);
                            }
                            else {
                                changes.push({});
                                type: 'modified',
                                    path;
                                currentPath,
                                    oldValue;
                                value1,
                                    newValue;
                                value2,
                                    size;
                                JSON.stringify(value2).length,
                                ;
                            }
                            ;
                            extractAllPaths(obj, any, path, string, changes, CheckpointDiff['changes'], type, 'added' | 'deleted');
                            void {
                                if(, obj) { }
                            } !== 'object' || obj === null;
                            {
                                changes.push({});
                                type,
                                    path,
                                    newValue;
                                type === 'added' ? obj : undefined,
                                    oldValue;
                                type === 'deleted' ? obj : undefined,
                                    size;
                                JSON.stringify(obj).length,
                                ;
                            }
                            ;
                            return;
                            for (const [key, value] of Object.entries(obj)) {
                                const currentPath = path ? `${path}.${key}` : key;
                            }
                            this.extractAllPaths(value, currentPath, changes, type);
                            calculateImpactScore(changes, CheckpointDiff['changes']);
                            number;
                            {
                                let score = 0;
                                for (const change of changes) {
                                    switch (change.type) {
                                        case 'added':
                                            score += 1;
                                            break;
                                        case 'modified':
                                            score += 2;
                                            break;
                                        case 'deleted':
                                            score += 3;
                                            break;
                                            return score;
                                            findPreviousCheckpoint(checkpointId, string);
                                            CheckpointData | null;
                                            {
                                                const checkpoint = this.checkpoints.get(checkpointId);
                                                if (checkpoint?.metadata.parentCheckpointId) {
                                                    return this.checkpoints.get(checkpoint.metadata.parentCheckpointId) || null;
                                                    return null;
                                                    findDependentCheckpoints(checkpointId, string);
                                                    string;
                                                    {
                                                        const dependents = [];
                                                        for (const [id, checkpoint] of this.checkpoints) {
                                                            if (checkpoint.metadata.parentCheckpointId === checkpointId) {
                                                                dependents.push(id);
                                                                return dependents;
                                                                updatePerformanceMetrics(operation, 'create' | 'restore', time, number, size, number);
                                                                void {
                                                                    if(operation) { } } === 'create';
                                                                {
                                                                    this.performanceMetrics.totalCheckpoints++;
                                                                    this.performanceMetrics.averageCreateTime =
                                                                        (this.performanceMetrics.averageCreateTime + time) / 2;
                                                                    this.performanceMetrics.totalStorageUsed += size;
                                                                }
                                                                {
                                                                    this.performanceMetrics.averageRestoreTime =
                                                                        (this.performanceMetrics.averageRestoreTime + time) / 2;
                                                                    calculateAverageCompressionRatio();
                                                                    number;
                                                                    {
                                                                        const checkpoints = Array.from(this.checkpoints.values());
                                                                        if (checkpoints.length === 0)
                                                                            return 1;
                                                                        const totalRatio = checkpoints.reduce((sum, cp) => sum + cp.metadata.compressionRatio, 0);
                                                                        return totalRatio / checkpoints.length;
                                                                        initializeCompressionWorker();
                                                                        void {
                                                                            // In a real implementation, you'd initialize a Web Worker for compression
                                                                            // This is a placeholder for demonstration
                                                                            getCurrentState() {
                                                                                // This method should return the current application state
                                                                                // Implementation depends on your state management system
                                                                                return {
                                                                                    graphState: {},
                                                                                    variables: {},
                                                                                    executionHistory: [],
                                                                                    nodeStates: {},
                                                                                    settings: {}
                                                                                };
                                                                            },
                                                                            async applyState(state) {
                                                                                // This method should apply the restored state to your application
                                                                                // Implementation depends on your state management system
                                                                            }
                                                                            // This method should apply the restored state to your application
                                                                            // Implementation depends on your state management system
                                                                            ,
                                                                            // This method should apply the restored state to your application
                                                                            // Implementation depends on your state management system
                                                                            deepClone(obj) {
                                                                                return JSON.parse(JSON.stringify(obj));
                                                                            },
                                                                            simulateCompression(data) {
                                                                                // Simple compression simulation
                                                                                return data.replace(/\s+/g, ' ').trim();
                                                                            },
                                                                            generateChecksum(data) {
                                                                                // Simple checksum - in practice, use a proper hashing algorithm
                                                                                let hash = 0;
                                                                                for (let i = 0; i < data.length; i++) {
                                                                                    const char = data.charCodeAt(i);
                                                                                    hash = ((hash << 5) - hash) + char;
                                                                                    hash = hash & hash; // Convert to 32-bit integer
                                                                                    return hash.toString(16);
                                                                                }
                                                                            },
                                                                            generateHash(data) {
                                                                                // Simple hash - in practice, use a proper hashing algorithm like SHA-256
                                                                                return this.generateChecksum(data + 'salt');
                                                                                // Checkpoint Manager for easier integration
                                                                                export class CheckpointManager {
                                                                                    checkpointSystem;
                                                                                    currentSessionId;
                                                                                    constructor(policy) {
                                                                                        this.checkpointSystem = new CheckpointSystem(policy);
                                                                                        this.currentSessionId = `session_${Date.now()}`;
                                                                                    }
                                                                                    // Simplified API for common operations
                                                                                    async saveProgress(name) {
                                                                                        return await this.checkpointSystem.createCheckpoint();
                                                                                        this.getCurrentState(),
                                                                                            {
                                                                                                name: name || `Progress ${new Date().toLocaleTimeString()}`
                                                                                            };
                                                                                    }
                                                                                    tags;
                                                                                }
                                                                            }, : .currentSessionId,
                                                                            async loadProgress(checkpointId) {
                                                                                await this.checkpointSystem.restoreCheckpoint(checkpointId);
                                                                                async;
                                                                                undoLastChange();
                                                                                Promise < void  > {
                                                                                    const: checkpoints = this.checkpointSystem.listCheckpoints({}),
                                                                                    tags: [this.currentSessionId],
                                                                                };
                                                                                ;
                                                                                if (checkpoints.length >= 2) {
                                                                                    const previousCheckpoint = checkpoints[1]; // Second most recent;
                                                                                    await this.checkpointSystem.restoreCheckpoint(previousCheckpoint.id);
                                                                                    getRecentSaves(limit = 10);
                                                                                    CheckpointMetadata;
                                                                                    {
                                                                                        return this.checkpointSystem
                                                                                            .listCheckpoints({ tags: [this.currentSessionId] })
                                                                                            .slice(0, limit);
                                                                                    }
                                                                                }
                                                                            },
                                                                            getCurrentState() {
                                                                                // Implementation depends on your application's state management
                                                                                return {
                                                                                    graphState: {},
                                                                                    variables: {},
                                                                                    executionHistory: [],
                                                                                    nodeStates: {},
                                                                                    settings: {}
                                                                                };
                                                                                export default {
                                                                                    CheckpointSystem,
                                                                                    CheckpointManager
                                                                                };
                                                                            }
                                                                        };
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
