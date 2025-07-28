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
    tags: string;
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
}
export interface CheckpointData {
    metadata: CheckpointMetadata;
    state: {
        graphState: any;
        variables: Record<string, any>;
        executionHistory: any;
        nodeStates: Record<string, any>;
        settings: Record<string, any>;
    };
    validation: {
        checksum: string;
        stateHash: string;
        integrityScore: number;
        isValid: boolean;
        validationErrors: string;
    };
}
export interface CheckpointPolicy {
    autoSave: {
        enabled: boolean;
        interval: number;
        maxAutoSaves: number;
        triggerEvents: ('node_complete' | 'variable_change' | 'error' | 'manual')[];
    };
    retention: {
        maxCheckpoints: number;
        maxAge: number;
        compressionThreshold: number;
        archiveAfter: number;
    };
    recovery: {
        autoRecovery: boolean;
        recoveryTimeout: number;
        maxRecoveryAttempts: number;
        fallbackStrategy: 'latest' | 'stable' | 'manual';
    };
}
export interface CheckpointDiff {
    checkpointId: string;
    previousCheckpointId: string | null;
    changes: {
        type: 'added' | 'modified' | 'deleted';
        path: string;
        oldValue?: any;
        newValue?: any;
        size: number;
    }[];
    summary: {
        additions: number;
        modifications: number;
        deletions: number;
        totalChanges: number;
        impactScore: number;
    };
}
export interface RecoveryOptions {
    checkpointId: string;
    preserveCurrentState: boolean;
    createBackup: boolean;
    validateBeforeRestore: boolean;
    progressCallback?: (progress: number, step: string) => void;
}
export interface CheckpointCompressionResult {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    algorithm: string;
    processingTime: number;
}
export declare class CheckpointSystem extends EventEmitter {
    private checkpoints;
    private policy;
    private autoSaveTimer;
    private compressionWorker;
    private isRecovering;
    private performanceMetrics;
    constructor(policy?: Partial<CheckpointPolicy>);
    const checkpointData: CheckpointData;
}
//# sourceMappingURL=CheckpointSystem.d.ts.map