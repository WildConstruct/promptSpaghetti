/**
 * Bulk Property Update Service - Epic 17
 *
 * Comprehensive bulk operations service for updating properties across multiple
 * entities with validation, rollback, and performance optimization.
 *
 * Task: E17-1753114396945-40F775 - Implement bulk property updates
 * Epic: 17 - Backstage Admin Controls
 */
export interface BulkUpdateTarget {
    type: TargetType;
    id: string;
    displayName?: string;
    currentValues?: Record<string, any>;
}
export interface BulkUpdateOperation {
    id: string;
    name: string;
    description?: string;
    targets: BulkUpdateTarget;
    updates: PropertyUpdate;
    validation: ValidationRules;
    execution: ExecutionSettings;
    rollback: RollbackSettings;
    status: OperationStatus;
    progress: OperationProgress;
    results: OperationResult;
    createdAt: Date;
    createdBy: string;
    executedAt?: Date;
    completedAt?: Date;
    rolledBackAt?: Date;
}
export interface PropertyUpdate {
    property: string;
    operation: UpdateOperationType;
    value?: any;
    conditions?: UpdateCondition;
    transformation?: PropertyTransformation;
}
export interface UpdateCondition {
    type: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists' | 'matches_regex';
    field: string;
    value: any;
    description: string;
}
export interface PropertyTransformation {
    type: 'case_convert' | 'trim' | 'replace' | 'append' | 'prepend' | 'calculate' | 'format' | 'extract' | 'custom';
    parameters: Record<string, any>;
    description: string;
}
export interface ValidationRules {
    required?: string;
    constraints?: PropertyConstraint;
    customValidators?: CustomValidator;
    skipInvalid?: boolean;
}
export interface PropertyConstraint {
    property: string;
    type: 'type' | 'length' | 'range' | 'pattern' | 'enum' | 'unique' | 'custom';
    parameters: Record<string, any>;
    message: string;
}
export interface CustomValidator {
    name: string;
    function: string;
    parameters: Record<string, any>;
    message: string;
}
export interface ExecutionSettings {
    mode: 'sequential' | 'parallel' | 'batched';
    batchSize?: number;
    delayBetweenItems?: number;
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
    dryRun?: boolean;
    backupBeforeUpdate?: boolean;
}
export interface RollbackSettings {
    enabled: boolean;
    autoRollbackOnFailure?: boolean;
    retainBackups?: boolean;
    backupExpiration?: Date;
}
export interface OperationProgress {
    total: number;
    completed: number;
    failed: number;
    skipped: number;
    currentItem?: string;
    startTime?: Date;
    estimatedCompletion?: Date;
}
export interface OperationResult {
    targetId: string;
    targetType: TargetType;
    status: 'success' | 'failed' | 'skipped' | 'validation_error';
    changes: PropertyChange;
    errors: OperationError;
    executedAt: Date;
    duration: number;
    backup?: Record<string, any>;
}
export interface PropertyChange {
    property: string;
    oldValue: any;
    newValue: any;
    operation: UpdateOperationType;
    applied: boolean;
}
export interface OperationError {
    type: 'validation' | 'execution' | 'timeout' | 'permission' | 'not_found' | 'conflict';
    message: string;
    property?: string;
    details?: Record<string, any>;
}
export type TargetType = 'user' | 'content' | 'product' | 'category' | 'tag' | 'collection' | 'campaign' | 'workflow' | 'system_setting' | 'custom_entity';
export type UpdateOperationType = 'set' | 'unset' | 'append' | 'prepend' | 'increment' | 'decrement' | 'multiply' | 'divide' | 'replace' | 'merge' | 'push' | 'pull' | 'toggle';
export type OperationStatus = 'draft' | 'validating' | 'validated' | 'executing' | 'completed' | 'failed' | 'cancelled' | 'rolling_back' | 'rolled_back';
export interface BulkUpdateTemplate {
    id: string;
    name: string;
    description: string;
    targetType: TargetType;
    updates: PropertyUpdate;
    validation: ValidationRules;
    execution: ExecutionSettings;
    usageCount: number;
    lastUsed?: Date;
    createdBy: string;
    createdAt: Date;
}
export interface BulkUpdateFilter {
    statuses?: OperationStatus;
    targetTypes?: TargetType;
    createdBy?: string;
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    searchQuery?: string;
    hasErrors?: boolean;
}
export interface BulkUpdateStats {
    totalOperations: number;
    completedOperations: number;
    failedOperations: number;
    totalTargetsProcessed: number;
    averageProcessingTime: number;
    successRateByType: Record<TargetType, {}, total>;
    number: any;
    successful: number;
    rate: number;
}
export declare class BulkPropertyUpdateService {
    private static instance;
    private operations;
    private templates;
    private listeners;
    private entityProviders;
    private constructor();
    static getInstance(): BulkPropertyUpdateService;
    if(: any, errorMap: any, has: any): any;
}
//# sourceMappingURL=BulkPropertyUpdateService.d.ts.map