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

export interface CheckpointMetadata {
    id: string;
    name: string;
    description?: string;
    timestamp: Date;
    version: string;
    parentCheckpointId?: string;
    tags: string[];
    size: number;
    compressionRatio: number;
    isAutomated: boolean;
    creator: string;
    executionContext?: {
        nodeId: string;
        stepNumber: number;
        totalSteps: number;
        elapsedTime: number;
    };

export interface CheckpointData {
    metadata: CheckpointMetadata;
    state: {,
        graphState: any;
        variables: Record<string, any>;
        executionHistory: any[];
        nodeStates: Record<string, any>;
        settings: Record<string, any>;
    };
    validation: {,
        checksum: string;
        stateHash: string;
        integrityScore: number;
        isValid: boolean;
        validationErrors: string[];
    };

export interface CheckpointPolicy {
    autoSave: {,
        enabled: boolean;
        interval: number;
        maxAutoSaves: number;
        triggerEvents: ('node_complete' | 'variable_change' | 'error' | 'manual')[];
    };
    retention: {,
        maxCheckpoints: number;
        maxAge: number;
        compressionThreshold: number;
        archiveAfter: number;
    };
    recovery: {,
        autoRecovery: boolean;
        recoveryTimeout: number;
        maxRecoveryAttempts: number;
        fallbackStrategy: 'latest' | 'stable' | 'manual';
    };

export interface CheckpointDiff {
    checkpointId: string;
    previousCheckpointId: string | null;
    changes: {,
        type: 'added' | 'modified' | 'deleted';
        path: string;
        oldValue?: any;
        newValue?: any;
        size: number;
    }[];
    summary: {,
        additions: number;
        modifications: number;
        deletions: number;
        totalChanges: number;
        impactScore: number;
    };

export interface RecoveryOptions {
    checkpointId: string;
    preserveCurrentState: boolean;
    createBackup: boolean;
    validateBeforeRestore: boolean;
    progressCallback?: (progress: number, step: string) => void;

export interface CheckpointCompressionResult {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    algorithm: string;
    processingTime: number;

export declare class CheckpointSystem extends EventEmitter {
    private checkpoints;
    private policy;
    private autoSaveTimer;
    private compressionWorker;
    private isRecovering;
    private performanceMetrics;
    constructor(policy?: Partial<CheckpointPolicy>);
    createCheckpoint(state: any, metadata?: Partial<CheckpointMetadata>, options?: {)
        compress?: boolean;
        validate?: boolean;
    }): Promise<string>;
    restoreCheckpoint(checkpointId: string, options?: Partial<RecoveryOptions>): Promise<any>;
    generateDiff(currentCheckpointId: string, previousCheckpointId?: string): Promise<CheckpointDiff>;
    listCheckpoints(filters?: {)
        tags?: string[];
        dateRange?: {
            start: Date;
            end: Date;
        };
        creator?: string;
        isAutomated?: boolean;
    }): CheckpointMetadata[];
    deleteCheckpoint(checkpointId: string, force?: boolean): Promise<boolean>;
    getPerformanceMetrics(): {
        totalCheckpoints: number;
        totalStorageUsed: number;
        averageCompressionRatio: number;
        averageCreateTime: number;
        averageRestoreTime: number;
        compressionSavings: number;
    };
    setAutoSave(enabled: boolean, interval?: number): void;
    updatePolicy(policy: Partial<CheckpointPolicy>): void;
    destroy(): void;
    private initializeAutoSave;
    private stopAutoSave;
    private performAutoSave;
    private shouldCreateAutoSave;
    private cleanupAutoSaves;
    private cleanupCheckpoints;
    private compressCheckpoint;
    private decompressCheckpoint;
    private validateCheckpoint;
    private compareObjects;
    private extractAllPaths;
    private calculateImpactScore;
    private findPreviousCheckpoint;
    private findDependentCheckpoints;
    private updatePerformanceMetrics;
    private calculateAverageCompressionRatio;
    private initializeCompressionWorker;
    private getCurrentState;
    private applyState;
    private deepClone;
    private simulateCompression;
    private generateChecksum;
    private generateHash;

export declare class CheckpointManager {
    private checkpointSystem;
    private currentSessionId;
    constructor(policy?: Partial<CheckpointPolicy>);
    saveProgress(name?: string): Promise<string>;
    loadProgress(checkpointId: string): Promise<void>;
    undoLastChange(): Promise<void>;
    getRecentSaves(limit?: number): CheckpointMetadata[];
    private getCurrentState;
declare const _default: {
    CheckpointSystem: typeof CheckpointSystem;
    CheckpointManager: typeof CheckpointManager;
};
export default _default;
//# sourceMappingURL=CheckpointSystem.d.ts.map