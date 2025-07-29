import { EventEmitter } from 'events';

export interface DocumentState {
    version: number;
    checksum: string;
    lastModified: number;
    operations: DocumentOperation[];
    metadata: Record<string, any>;

export interface DocumentOperation {
    id: string;
    type: 'create' | 'update' | 'delete' | 'move';
    target: 'node' | 'edge' | 'property';
    targetId: string;
    data: any;
    oldData?: any;
    timestamp: number;
    userId: string;
    version: number;
    dependencies?: string[];

export interface SyncDelta {
    operations: DocumentOperation[];
    fromVersion: number;
    toVersion: number;
    conflicts: ConflictInfo[];
    metadata: {
        operationCount: number;
        estimatedSize: number;
        compression?: string;
    };

export interface ConflictInfo {
    id: string;
    type: 'concurrent_edit' | 'version_mismatch' | 'dependency_missing' | 'data_corruption';
    operation1: DocumentOperation;
    operation2?: DocumentOperation;
    description: string;
    resolutionOptions: ConflictResolution[];
    autoResolvable: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';

export interface ConflictResolution {
    strategy: 'mine' | 'theirs' | 'merge' | 'manual';
    description: string;
    result?: any;
    confidence: number;

export interface SyncProgress {
    phase: 'detecting' | 'downloading' | 'applying' | 'validating' | 'completed' | 'failed';
    totalOperations: number;
    processedOperations: number;
    currentOperation?: DocumentOperation;
    estimatedTimeRemaining?: number;
    bytesTransferred?: number;
    bytesTotal?: number;
    errors: Error[];

export interface RecoveryConfig {
    maxDeltaSize: number;
    maxOperationsPerBatch: number;
    checksumValidation: boolean;
    conflictDetection: boolean;
    autoResolveConflicts: boolean;
    compressionEnabled: boolean;
    progressReporting: boolean;
    maxRecoveryTime: number;
    enableDependencyTracking: boolean;
    validateIntegrity: boolean;
    backupBeforeRecovery: boolean;

export interface RecoveryStats {
    totalRecoveries: number;
    successfulRecoveries: number;
    failedRecoveries: number;
    averageRecoveryTime: number;
    operationsRecovered: number;
    conflictsResolved: number;
    dataCorruptions: number;
    lastRecoveryTime: number | null;

export declare class SynchronizationRecovery extends EventEmitter {
    private config;
    private stats;
    private currentRecovery;
    private documentStates;
    private pendingConflicts;
    private recoveryTimer;
    constructor(config?: Partial<RecoveryConfig>);
    /**
     * Start synchronization recovery for a document
     */
    startRecovery();
      documentId: string,
      localState: DocumentState,
      serverStateProvider: (),
    ) => Promise<DocumentState>): Promise<SyncDelta>;
    /**
     * Calculate differential sync between local and server state
     */
    calculateDelta(localState: DocumentState, serverState: DocumentState): Promise<SyncDelta>;
    /**
     * Apply sync delta to local state
     */
    applyDelta(documentId: string, localState: DocumentState, delta: SyncDelta): Promise<SyncDelta>;
    /**
     * Resolve conflicts manually or automatically
     */
    resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<boolean>;
    /**
     * Get current recovery progress
     */
    getRecoveryProgress(): SyncProgress | null;
    /**
     * Get recovery statistics
     */
    getStats(): RecoveryStats;
    /**
     * Get pending conflicts
     */
    getPendingConflicts(): ConflictInfo[];
    /**
     * Cancel current recovery
     */
    cancelRecovery(): void;
    /**
     * Reset recovery statistics
     */
    resetStats(): void;
    /**
     * Cleanup resources
     */
    cleanup(): void;
    /**
     * Detect conflicts between operations
     */
    private detectConflicts;
    /**
     * Auto-resolve conflict if possible
     */
    private autoResolveConflict;
    /**
     * Apply single operation to document state
     */
    private applyOperation;
    /**
     * Validate operation dependencies
     */
    private validateDependencies;
    /**
     * Validate operations before applying
     */
    private validateOperations;
    /**
     * Validate state integrity after recovery
     */
    private validateStateIntegrity;
    /**
     * Backup document state before recovery
     */
    private backupDocumentState;
    /**
     * Merge two conflicting operations
     */
    private mergeOperations;
    /**
     * Calculate checksum for state
     */
    private calculateChecksum;
    /**
     * Update recovery progress
     */
    private updateProgress;
    /**
     * Handle successful recovery
     */
    private handleRecoverySuccess;
    /**
     * Handle recovery failure
     */
    private handleRecoveryFailure;
    /**
     * Start recovery timeout timer
     */
    private startRecoveryTimer;
    /**
     * Clear recovery timer
     */
    private clearRecoveryTimer;
    /**
     * Utility function to chunk array
     */
    private chunkArray;

//# sourceMappingURL=SynchronizationRecovery.d.ts.map