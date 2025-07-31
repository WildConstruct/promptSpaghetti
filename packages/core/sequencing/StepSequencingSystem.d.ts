/**
 * Step Sequencing System (Epic 16)
 *
 * DEPLOYMENT BLOCKER FIX: Comprehensive step sequencing system for managing
 * complex multi-step workflows, guided tutorials, and process orchestration.
 * Provides conditional branching, dependency management, progress tracking,
 * and recovery mechanisms for robust workflow execution.
 *
 * Features:
 * - Sequential and parallel step execution
 * - Conditional branching and decision points
 * - Dependency management and validation
 * - Progress tracking and state persistence
 * - Error handling and recovery mechanisms
 * - Step rollback and retry capabilities
 * - Performance monitoring and analytics
 * - Dynamic step generation and modification
 */
import { EventEmitter } from 'events';

}
export interface SequenceStep {
    id: string;
    name: string;
    description?: string;
    type: 'action' | 'decision' | 'parallel' | 'loop' | 'delay' | 'validation' | 'rollback';
    category: string;
    priority: number;
    dependencies: string[];
    conditions?: StepCondition[];
    action?: StepAction;
    validation?: StepValidation;
    rollback?: StepRollback;
    timeout?: number;
    retryPolicy?: RetryPolicy;
    metadata: StepMetadata;
    performance: StepPerformance;

}
export interface StepCondition {
    id: string;
    type: 'boolean' | 'value' | 'expression' | 'function';
    field?: string;
    operator?: 'equals' | 'not_equals' | 'greater' | 'less' | 'contains' | 'exists';
    value?: unknown;
    expression?: string;
    function?: string;
    negated?: boolean;

}
export interface StepAction {
    type: 'function' | 'api' | 'ui' | 'data' | 'navigation' | 'notification';
    handler: string;
    parameters: Record<string, unknown>;
    async: boolean;
    timeout?: number;
    onSuccess?: string;
    onFailure?: string;
    onSkip?: string;

}
export interface StepValidation {
    required: boolean;
    validators: {
        type: 'required' | 'format' | 'range' | 'custom';
        message: string;
        parameters?: Record<string, unknown>;
}
    }[];
    onValidationFailure: 'retry' | 'skip' | 'abort' | 'rollback';

}
export interface StepRollback {
    enabled: boolean;
    action?: StepAction;
    autoTrigger: boolean;
    preserveState: boolean;
    dependencies?: string[];

}
export interface RetryPolicy {
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential' | 'custom';
    baseDelay: number;
    maxDelay: number;
    retryConditions: string[];

}
export interface StepMetadata {
    estimatedDuration: number;
    category: string;
    tags: string[];
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    userVisible: boolean;
    skippable: boolean;
    optional: boolean;
    createdAt: Date;
    lastModified: Date;
    version: string;

}
export interface StepPerformance {
    averageExecutionTime: number;
    successRate: number;
    failureRate: number;
    retryRate: number;
    lastExecutions: ExecutionRecord[];

}
export interface ExecutionRecord {
    timestamp: Date;
    duration: number;
    status: StepExecutionStatus;
    attempts: number;
    errorMessage?: string;

export type StepExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'cancelled' | 'retrying' | 'rolled_back';

}
export interface SequenceDefinition {
    id: string;
    name: string;
    description: string;
    version: string;
    steps: SequenceStep[];
    entryPoint: string;
    exitPoints: string[];
    globalTimeout?: number;
    concurrencyLimit?: number;
    metadata: {
        category: string;
        tags: string[];
        estimatedTotalDuration: number;
        difficulty: 'easy' | 'medium' | 'hard' | 'expert';
        createdAt: Date;
        lastModified: Date;
}
    };

}
export interface SequenceExecution {
    id: string;
    sequenceId: string;
    name: string;
    status: 'initializing' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
    currentStep?: string;
    completedSteps: string[];
    failedSteps: string[];
    skippedSteps: string[];
    context: ExecutionContext;
    progress: SequenceProgress;
    performance: ExecutionPerformance;
    startTime: Date;
    endTime?: Date;
    pausedAt?: Date;
    resumedAt?: Date;

}
export interface ExecutionContext {
    variables: Record<string, unknown>;
    userInput: Record<string, unknown>;
    sessionData: Record<string, unknown>;
    executionState: Record<string, unknown>;
    rollbackStack: RollbackEntry[];

}
export interface RollbackEntry {
    stepId: string;
    timestamp: Date;
    state: Record<string, unknown>;
    action: string;
    reversible: boolean;

}
export interface SequenceProgress {
    totalSteps: number;
    completedSteps: number;
    currentStep: number;
    percentage: number;
    estimatedTimeRemaining: number;
    milestones: ProgressMilestone[];

}
export interface ProgressMilestone {
    id: string;
    name: string;
    stepId: string;
    percentage: number;
    reached: boolean;
    timestamp?: Date;

}
export interface ExecutionPerformance {
    totalDuration: number;
    averageStepDuration: number;
    fastestStep: {
        id: string;
        duration: number;
}
    };
    slowestStep: {
        id: string;
        duration: number;
    };
    retryCount: number;
    errorCount: number;
    effectiveSuccessRate: number;

}
export interface SequencingConfig {
    execution: {
        defaultTimeout: number;
        maxConcurrentExecutions: number;
        enableProgressPersistence: boolean;
        enablePerformanceTracking: boolean;
        enableRollback: boolean;
        autoRetryOnFailure: boolean;
}
    };
    validation: {
        validateDependencies: boolean;
        validateConditions: boolean;
        strictValidation: boolean;
        allowCircularDependencies: boolean;
    };
    performance: {
        trackExecutionMetrics: boolean;
        optimizeExecutionOrder: boolean;
        enableCaching: boolean;
        cacheExpiryTime: number;
    };

export declare class StepSequencingSystem extends EventEmitter {
    private sequences;
    private executions;
    private activeExecutions;
    private config;
    private actionHandlers;
    private validators;
    private rollbackHandlers;
    constructor(config?: Partial<SequencingConfig>);
    createSequence(definition: Omit<SequenceDefinition, 'id'>): Promise<string>;
    updateSequence(sequenceId: string, updates: Partial<SequenceDefinition>): Promise<void>;
    deleteSequence(sequenceId: string, force?: boolean): Promise<void>;
    startExecution(sequenceId: string, context?: Partial<ExecutionContext>, options?: {)
        name?: string;
        timeout?: number;
    }): Promise<string>;
    pauseExecution(executionId: string): Promise<void>;
    resumeExecution(executionId: string): Promise<void>;
    cancelExecution(executionId: string): Promise<void>;
    executeStep(executionId: string, stepId: string): Promise<StepExecutionStatus>;
    rollbackExecution(executionId: string, toStepId?: string): Promise<void>;
    getSequence(sequenceId: string): SequenceDefinition | null;
    listSequences(filters?: {)
        category?: string;
        tags?: string[];
        difficulty?: string;
    }): SequenceDefinition[];
    getExecution(executionId: string): SequenceExecution | null;
    listExecutions(filters?: {)
        sequenceId?: string;
        status?: string[];
        dateRange?: {
            start: Date;
            end: Date;
        };
    }): SequenceExecution[];
    registerActionHandler(type: string, handler: (...args: unknown[]) => unknown): void;
    registerValidator(type: string, validator: (...args: unknown[]) => unknown): void;
    registerRollbackHandler(stepId: string, handler: (...args: unknown[]) => unknown): void;
    getSequenceAnalytics(sequenceId: string): {
        totalExecutions: number;
        successRate: number;
        averageDuration: number;
        commonFailurePoints: Array<{
            stepId: string;
            failureRate: number;
        }>;
        performanceMetrics: Record<string, unknown>;
    };
    updateConfig(config: Partial<SequencingConfig>): void;
    destroy(): void;
    private runExecution;
    private validateSequence;
    private detectCircularDependencies;
    private optimizeStepOrder;
    private initializeProgress;
    private validateStepDependencies;
    private evaluateStepConditions;
    private evaluateCondition;
    private compareValues;
    private evaluateExpression;
    private executeStepAction;
    private validateStepCompletion;
    private addToRollbackStack;
    private executeRollbackAction;
    private calculateRetryDelay;
    private updateStepPerformance;
    private updateExecutionProgress;
    private getNextStep;
    private registerBuiltInHandlers;
    private delay;

export declare class SequenceBuilder {
    private definition;
    private steps;
    constructor(name: string, description?: string);
    addStep(step: Omit<SequenceStep, 'performance'>): SequenceBuilder;
    setEntryPoint(stepId: string): SequenceBuilder;
    addExitPoint(stepId: string): SequenceBuilder;
    setMetadata(metadata: Partial<SequenceDefinition['metadata']>): SequenceBuilder;
    build(): Omit<SequenceDefinition, 'id'>;
declare const _default: {
    StepSequencingSystem: typeof StepSequencingSystem;
    SequenceBuilder: typeof SequenceBuilder;
};
export default _default;
//# sourceMappingURL=StepSequencingSystem.d.ts.map