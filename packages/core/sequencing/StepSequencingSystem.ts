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

// Core step sequencing interfaces
export interface SequenceStep {
  id: string;
  name: string;
  description?: string;
  type: 'action' | 'decision' | 'parallel' | 'loop' | 'delay' | 'validation' | 'rollback';
  category: string;
  priority: number;
  dependencies: string[]; // IDs of steps that must complete before this one
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
  onSuccess?: string; // Next step ID
  onFailure?: string; // Failure step ID
  onSkip?: string; // Skip step ID
}

export interface StepValidation {
  required: boolean;
  validators: {,
    type: 'required' | 'format' | 'range' | 'custom';
    message: string;
    parameters?: Record<string, unknown>;
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
}

export type StepExecutionStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'skipped' 
  | 'cancelled' 
  | 'retrying'
  | 'rolled_back';

export interface SequenceDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: SequenceStep[];
  entryPoint: string; // Initial step ID
  exitPoints: string[]; // Terminal step IDs
  globalTimeout?: number;
  concurrencyLimit?: number;
  metadata: {,
    category: string;
    tags: string[];
    estimatedTotalDuration: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    createdAt: Date;
    lastModified: Date;
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
  fastestStep: { id: string; duration: number };
  slowestStep: { id: string; duration: number };
  retryCount: number;
  errorCount: number;
  effectiveSuccessRate: number;
}

export interface SequencingConfig {
  execution: {,
    defaultTimeout: number;
    maxConcurrentExecutions: number;
    enableProgressPersistence: boolean;
    enablePerformanceTracking: boolean;
    enableRollback: boolean;
    autoRetryOnFailure: boolean;
  };
  validation: {,
    validateDependencies: boolean;
    validateConditions: boolean;
    strictValidation: boolean;
    allowCircularDependencies: boolean;
  };
  performance: {,
    trackExecutionMetrics: boolean;
    optimizeExecutionOrder: boolean;
    enableCaching: boolean;
    cacheExpiryTime: number;
  };
}

// Main Step Sequencing System
export class StepSequencingSystem extends EventEmitter {
  private sequences: Map<string, SequenceDefinition> = new Map();
  private executions: Map<string, SequenceExecution> = new Map();
  private activeExecutions: Set<string> = new Set();
  private config: SequencingConfig;
  private actionHandlers: Map<string, (...args: unknown[]) => unknown> = new Map();
  private validators: Map<string, (...args: unknown[]) => unknown> = new Map();
  private rollbackHandlers: Map<string, (...args: unknown[]) => unknown> = new Map();
  constructor(config?: Partial<SequencingConfig>) {
    super();
    this.config = {
      execution: {,
        defaultTimeout: 30000, // 30 seconds
        maxConcurrentExecutions: 10,
        enableProgressPersistence: true,
        enablePerformanceTracking: true,
        enableRollback: true,
        autoRetryOnFailure: true,
      },
      validation: {,
        validateDependencies: true,
        validateConditions: true,
        strictValidation: true,
        allowCircularDependencies: false,
      },
      performance: {,
        trackExecutionMetrics: true,
        optimizeExecutionOrder: true,
        enableCaching: true,
        cacheExpiryTime: 3600000 // 1 hour,
      },
      ...config
    };
    this.registerBuiltInHandlers();
  }
  // Sequence management
  async createSequence(definition: Omit<SequenceDefinition, 'id'>): Promise<string> {
    const sequenceId = `seq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
    const sequence: SequenceDefinition = {
      id: sequenceId,
      ...definition,
      metadata: {,
        ...definition.metadata,
        createdAt: new Date(),
        lastModified: new Date(),
      }
    };
    // Validate sequence
    await this.validateSequence(sequence);
    // Optimize step order if enabled
    if (this.config.performance.optimizeExecutionOrder) {
      sequence.steps = this.optimizeStepOrder(sequence.steps);
    }
    this.sequences.set(sequenceId, sequence);
    this.emit('sequenceCreated', {)
      sequenceId,
      sequence
    });
    return sequenceId;
  }
  async updateSequence(sequenceId: string, updates: Partial<SequenceDefinition>): Promise<void> {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      throw new Error(`Sequence ${sequenceId} not found`);}
    }
    // Check if sequence is currently executing
    const activeExecution = Array.from(this.executions.values());
      .find(exec => exec.sequenceId === sequenceId && exec.status === 'running');
    if (activeExecution) {
      throw new Error(`Cannot update sequence ${sequenceId}: execution ${activeExecution.id} is currently running`);}
    }
    const updatedSequence = {
      ...sequence,
      ...updates,
      metadata: {,
        ...sequence.metadata,
        ...updates.metadata,
        lastModified: new Date(),
      }
    };
    await this.validateSequence(updatedSequence);
    this.sequences.set(sequenceId, updatedSequence);
    this.emit('sequenceUpdated', {)
      sequenceId,
      sequence: updatedSequence,
      updates
    });
  }
  async deleteSequence(sequenceId: string, force = false): Promise<void> {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      return;
    }
    // Check for active executions
    if (!force) {
      const activeExecutions = Array.from(this.executions.values());
        .filter(exec => exec.sequenceId === sequenceId && )
                       (exec.status === 'running' || exec.status === 'paused'));
      if (activeExecutions.length > 0) {
        throw new Error(`Cannot delete sequence ${sequenceId}: ${activeExecutions.length} active executions`);}
      }
    }
    this.sequences.delete(sequenceId);
    this.emit('sequenceDeleted', {)
      sequenceId,
      sequence
    });
  }
  // Execution management
  async startExecution()
    sequenceId: string, 
    context: Partial<ExecutionContext> = {},
    options: { name?: string; timeout?: number } = {}
  ): Promise<string> {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      throw new Error(`Sequence ${sequenceId} not found`);}
    }
    // Check concurrency limit
    if (this.activeExecutions.size >= this.config.execution.maxConcurrentExecutions) {
      throw new Error('Maximum concurrent executions reached');
    }
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
    const execution: SequenceExecution = {
      id: executionId,
      sequenceId,
      name: options.name || `Execution of ${sequence.name}`,}
      status: 'initializing',
      currentStep: sequence.entryPoint,
      completedSteps: [],
      failedSteps: [],
      skippedSteps: [],
      context: {,
        variables: {},
        userInput: {},
        sessionData: {},
        executionState: {},
        rollbackStack: [],
        ...context
      },
      progress: this.initializeProgress(sequence),
      performance: {,
        totalDuration: 0,
        averageStepDuration: 0,
        fastestStep: { id: '', duration: Infinity },
        slowestStep: { id: '', duration: 0 },
        retryCount: 0,
        errorCount: 0,
        effectiveSuccessRate: 0,
      },
      startTime: new Date(),
    };
    this.executions.set(executionId, execution);
    this.activeExecutions.add(executionId);
    this.emit('executionStarted', {)
      executionId,
      execution
    });
    // Start execution
    this.runExecution(executionId);
    return executionId;
  }
  async pauseExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);}
    }
    if (execution.status !== 'running') {
      throw new Error(`Cannot pause execution ${executionId}: status is ${execution.status}`);}
    }
    execution.status = 'paused';
    execution.pausedAt = new Date();
    this.activeExecutions.delete(executionId);
    this.emit('executionPaused', {)
      executionId,
      execution
    });
  }
  async resumeExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);}
    }
    if (execution.status !== 'paused') {
      throw new Error(`Cannot resume execution ${executionId}: status is ${execution.status}`);}
    }
    execution.status = 'running';
    execution.resumedAt = new Date();
    this.activeExecutions.add(executionId);
    this.emit('executionResumed', {)
      executionId,
      execution
    });
    // Resume execution
    this.runExecution(executionId);
  }
  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);}
    }
    execution.status = 'cancelled';
    execution.endTime = new Date();
    this.activeExecutions.delete(executionId);
    this.emit('executionCancelled', {)
      executionId,
      execution
    });
  }
  // Step execution and control
  async executeStep(executionId: string, stepId: string): Promise<StepExecutionStatus> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);}
    }
    const sequence = this.sequences.get(execution.sequenceId);
    if (!sequence) {
      throw new Error(`Sequence ${execution.sequenceId} not found`);}
    }
    const step = sequence.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found in sequence ${sequence.id}`);}
    }
    const startTime = performance.now();
    let attempts = 0;
    let lastError: Error | null = null;
    while (attempts < (step.retryPolicy?.maxAttempts || 1)) {
      attempts++;
      try {
        this.emit('stepStarted', {)
          executionId,
          stepId,
          step,
          attempt: attempts,
        });
        // Check dependencies
        if (this.config.validation.validateDependencies) {
          await this.validateStepDependencies(execution, step);
        }
        // Check conditions
        if (step.conditions && this.config.validation.validateConditions) {
          const conditionsMet = await this.evaluateStepConditions(execution, step);
          if (!conditionsMet) {
            this.updateStepPerformance(step, startTime, 'skipped', attempts);
            execution.skippedSteps.push(stepId);
            return 'skipped';
          }
        }
        // Execute step action
        if (step.action) {
          await this.executeStepAction(execution, step);
        }
        // Validate step completion
        if (step.validation) {
          await this.validateStepCompletion(execution, step);
        }
        // Update rollback stack
        if (this.config.execution.enableRollback && step.rollback?.enabled) {
          this.addToRollbackStack(execution, step);
        }
        const duration = performance.now() - startTime;
        this.updateStepPerformance(step, startTime, 'completed', attempts);
        this.updateExecutionProgress(execution, stepId, 'completed', duration);
        execution.completedSteps.push(stepId);
        this.emit('stepCompleted', {)
          executionId,
          stepId,
          step,
          duration,
          attempts
        });
        return 'completed';
      } catch (error) {
        lastError = error;
        execution.performance.errorCount++;
        this.emit('stepError', {)
          executionId,
          stepId,
          step,
          error: error.message,
          attempt: attempts,
        });
        // Check if should retry
        if (attempts < (step.retryPolicy?.maxAttempts || 1)) {
          execution.performance.retryCount++;
          // Calculate retry delay
          const delay = this.calculateRetryDelay(step.retryPolicy!, attempts);
          await this.delay(delay);
          this.emit('stepRetrying', {)
            executionId,
            stepId,
            step,
            attempt: attempts + 1,
            delay
          });
        }
      }
    }
    // All retry attempts failed
    const duration = performance.now() - startTime;
    this.updateStepPerformance(step, startTime, 'failed', attempts);
    this.updateExecutionProgress(execution, stepId, 'failed', duration);
    execution.failedSteps.push(stepId);
    this.emit('stepFailed', {)
      executionId,
      stepId,
      step,
      error: lastError?.message,
      attempts
    });
    return 'failed';
  }
  // Rollback operations
  async rollbackExecution(executionId: string, toStepId?: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);}
    }
    if (!this.config.execution.enableRollback) {
      throw new Error('Rollback is disabled in configuration');
    }
    const rollbackEntries = toStepId ;
      ? execution.context.rollbackStack.filter(entry => entry.stepId === toStepId)
      : execution.context.rollbackStack;
    this.emit('rollbackStarted', {)
      executionId,
      toStepId,
      entriesCount: rollbackEntries.length,
    });
    for (const entry of rollbackEntries.reverse()) {
      if (entry.reversible) {
        try {
          await this.executeRollbackAction(execution, entry);
          this.emit('stepRolledBack', {)
            executionId,
            stepId: entry.stepId,
            entry
          });
        } catch (error) {
          this.emit('rollbackError', {)
            executionId,
            stepId: entry.stepId,
            error: error.message,
          });
        }
      }
    }
    // Update execution state
    if (toStepId) {
      execution.currentStep = toStepId;
      execution.completedSteps = execution.completedSteps.filter(id => )
        !rollbackEntries.some(entry => entry.stepId === id));
    } else {
      execution.currentStep = undefined;
      execution.completedSteps = [];
    }
    this.emit('rollbackCompleted', {)
      executionId,
      toStepId
    });
  }
  // Query and inspection methods
  getSequence(sequenceId: string): SequenceDefinition | null {
    return this.sequences.get(sequenceId) || null;
  }
  listSequences(filters?: {)
    category?: string;
    tags?: string[];
    difficulty?: string;
  }): SequenceDefinition[] {
    let sequences = Array.from(this.sequences.values());
    if (filters) {
      if (filters.category) {
        sequences = sequences.filter(seq => seq.metadata.category === filters.category);
      }
      if (filters.tags?.length) {
        sequences = sequences.filter(seq =>)
          filters.tags!.some(tag => seq.metadata.tags.includes(tag))
        );
      }
      if (filters.difficulty) {
        sequences = sequences.filter(seq => seq.metadata.difficulty === filters.difficulty);
      }
    }
    return sequences.sort((a, b) => b.metadata.lastModified.getTime() - a.metadata.lastModified.getTime());
  }
  getExecution(executionId: string): SequenceExecution | null {
    return this.executions.get(executionId) || null;
  }
  listExecutions(filters?: {)
    sequenceId?: string;
    status?: string[];
    dateRange?: { start: Date; end: Date };
  }): SequenceExecution[] {
    let executions = Array.from(this.executions.values());
    if (filters) {
      if (filters.sequenceId) {
        executions = executions.filter(exec => exec.sequenceId === filters.sequenceId);
      }
      if (filters.status?.length) {
        executions = executions.filter(exec => filters.status!.includes(exec.status));
      }
      if (filters.dateRange) {
        executions = executions.filter(exec =>)
          exec.startTime >= filters.dateRange!.start &&
          exec.startTime <= filters.dateRange!.end
        );
      }
    }
    return executions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }
  // Handler registration
  registerActionHandler(type: string, handler: (...args: unknown[]) => unknown): void {
    this.actionHandlers.set(type, handler);
  }
  registerValidator(type: string, validator: (...args: unknown[]) => unknown): void {
    this.validators.set(type, validator);
  }
  registerRollbackHandler(stepId: string, handler: (...args: unknown[]) => unknown): void {
    this.rollbackHandlers.set(stepId, handler);
  }
  // Analytics and performance
  getSequenceAnalytics(sequenceId: string): {
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    commonFailurePoints: Array<{ stepId: string; failureRate: number }>;
    performanceMetrics: Record<string, unknown>;
    const executions = this.listExecutions({ sequenceId });
    const completedExecutions = executions.filter(exec => exec.status === 'completed');
    const totalExecutions = executions.length;
    const successRate = totalExecutions > 0 ? (completedExecutions.length / totalExecutions) * 100 : 0;
    const averageDuration = completedExecutions.length > 0 ;
      ? completedExecutions.reduce((sum, exec) => sum + exec.performance.totalDuration, 0) / completedExecutions.length
      : 0;
    // Calculate failure points
    const failureCounts: Record<string, number> = {};
    const stepCounts: Record<string, number> = {};
    executions.forEach(exec => {)
      exec.failedSteps.forEach(stepId => {)
        failureCounts[stepId] = (failureCounts[stepId] || 0) + 1;
      });
      [...exec.completedSteps, ...exec.failedSteps].forEach(stepId => {)
        stepCounts[stepId] = (stepCounts[stepId] || 0) + 1;
      });
    });
    const commonFailurePoints = Object.entries(failureCounts);
      .map(([stepId, failures]) => ({)
        stepId,
        failureRate: (failures / (stepCounts[stepId] || 1)) * 100,
      }))
      .sort((a, b) => b.failureRate - a.failureRate);
    return {
      totalExecutions,
      successRate,
      averageDuration,
      commonFailurePoints,
      performanceMetrics: {,
        averageRetryCount: executions.reduce((sum, exec) => sum + exec.performance.retryCount, 0) / totalExecutions,
        averageErrorCount: executions.reduce((sum, exec) => sum + exec.performance.errorCount, 0) / totalExecutions
      }
    };
  }
  // Configuration management
  updateConfig(config: Partial<SequencingConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('configUpdated', { config: this.config });
  }
  // Cleanup
  destroy(): void {
    // Cancel all active executions
    for (const executionId of this.activeExecutions) {
      this.cancelExecution(executionId);
    }
    this.sequences.clear();
    this.executions.clear();
    this.activeExecutions.clear();
    this.actionHandlers.clear();
    this.validators.clear();
    this.rollbackHandlers.clear();
    this.removeAllListeners();
  }
  // Private methods
  private async runExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) return;
    const sequence = this.sequences.get(execution.sequenceId);
    if (!sequence) return;
    try {
      execution.status = 'running';
      while (execution.currentStep && execution.status === 'running') {
        const stepStatus = await this.executeStep(executionId, execution.currentStep);
        if (stepStatus === 'failed') {
          execution.status = 'failed';
          break;
        }
        // Determine next step
        const nextStep = this.getNextStep(sequence, execution.currentStep, stepStatus);
        execution.currentStep = nextStep;
        // Check if reached exit point
        if (!nextStep || sequence.exitPoints.includes(execution.currentStep!)) {
          execution.status = 'completed';
          break;
        }
      }
      execution.endTime = new Date();
      execution.performance.totalDuration = execution.endTime.getTime() - execution.startTime.getTime();
      this.activeExecutions.delete(executionId);
      this.emit('executionCompleted', {)
        executionId,
        execution,
        finalStatus: execution.status,
      });
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      this.activeExecutions.delete(executionId);
      this.emit('executionError', {)
        executionId,
        error: error.message,
      });
    }
  }
  private async validateSequence(sequence: SequenceDefinition): Promise<void> {
    // Check for entry point
    const entryStep = sequence.steps.find(s => s.id === sequence.entryPoint);
    if (!entryStep) {
      throw new Error(`Entry point ${sequence.entryPoint} not found in sequence steps`);}
    }
    // Check for exit points
    for (const exitPoint of sequence.exitPoints) {
      const exitStep = sequence.steps.find(s => s.id === exitPoint);
      if (!exitStep) {
        throw new Error(`Exit point ${exitPoint} not found in sequence steps`);}
      }
    }
    // Check for circular dependencies
    if (!this.config.validation.allowCircularDependencies) {
      this.detectCircularDependencies(sequence.steps);
    }
    // Validate step references
    for (const step of sequence.steps) {
      for (const depId of step.dependencies) {
        const depStep = sequence.steps.find(s => s.id === depId);
        if (!depStep) {
          throw new Error(`Dependency ${depId} not found for step ${step.id}`);}
        }
      }
    }
  }
  private detectCircularDependencies(steps: SequenceStep[]): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const visit = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) {
        throw new Error(`Circular dependency detected involving step ${stepId}`);}
      }
      if (visited.has(stepId)) {
        return false;
      }
      visited.add(stepId);
      recursionStack.add(stepId);
      const step = steps.find(s => s.id === stepId);
      if (step) {
        for (const depId of step.dependencies) {
          if (visit(depId)) {
            return true;
          }
        }
      }
      recursionStack.delete(stepId);
      return false;
    };
    for (const step of steps) {
      if (!visited.has(step.id)) {
        visit(step.id);
      }
    }
  }
  private optimizeStepOrder(steps: SequenceStep[]): SequenceStep[] {
    // Topological sort based on dependencies
    const sorted: SequenceStep[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();
    const visit = (stepId: string) => {
      if (temp.has(stepId)) {
        throw new Error(`Circular dependency detected at step ${stepId}`);}
      }
      if (visited.has(stepId)) {
        return;
      }
      temp.add(stepId);
      const step = steps.find(s => s.id === stepId);
      if (step) {
        for (const depId of step.dependencies) {
          visit(depId);
        }
        temp.delete(stepId);
        visited.add(stepId);
        sorted.push(step);
      }
    };
    for (const step of steps) {
      if (!visited.has(step.id)) {
        visit(step.id);
      }
    }
    return sorted;
  }
  private initializeProgress(sequence: SequenceDefinition): SequenceProgress {
    const milestones: ProgressMilestone[] = [];
    // Create milestones for every 25% of steps
    const totalSteps = sequence.steps.length;
    for (let i = 25; i <= 100; i += 25) {
      const stepIndex = Math.floor((i / 100) * totalSteps);
      if (stepIndex < totalSteps) {
        const step = sequence.steps[stepIndex];
        milestones.push({)
          id: `milestone_${i}`,}
          name: `${i}% Complete`,}
          stepId: step.id,
          percentage: i,
          reached: false,
        });
      }
    }
    return {
      totalSteps,
      completedSteps: 0,
      currentStep: 0,
      percentage: 0,
      estimatedTimeRemaining: sequence.metadata.estimatedTotalDuration,
      milestones
    };
  }
  private async validateStepDependencies(execution: SequenceExecution, step: SequenceStep): Promise<void> {
    for (const depId of step.dependencies) {
      if (!execution.completedSteps.includes(depId)) {
        throw new Error(`Step ${step.id} dependency ${depId} has not been completed`);}
      }
    }
  }
  private async evaluateStepConditions(execution: SequenceExecution, step: SequenceStep): Promise<boolean> {
    if (!step.conditions || step.conditions.length === 0) {
      return true;
    }
    for (const condition of step.conditions) {
      const result = await this.evaluateCondition(execution, condition);
      if (!result) {
        return false;
      }
    }
    return true;
  }
  private async evaluateCondition(execution: SequenceExecution, condition: StepCondition): Promise<boolean> {
    let result = false;
    switch (condition.type) {
    case 'boolean':
      result = !!execution.context.variables[condition.field!];
      break;
    case 'value': {
      const value = execution.context.variables[condition.field!];
      result = this.compareValues(value, condition.operator!, condition.value);
      break;
    }
    case 'expression':
      result = this.evaluateExpression(condition.expression!, execution.context);
      break;
    case 'function': {
      const validator = this.validators.get(condition.function!);
      if (validator) {
        result = await validator(execution.context);
      }
      break;
    }
    }
    return condition.negated ? !result : result;
  }
  private compareValues(actual: unknown, operator: string, expected: unknown): boolean {
    switch (operator) {
    case 'equals': return actual === expected;
    case 'not_equals': return actual !== expected;
    case 'greater': return actual > expected;
    case 'less': return actual < expected;
    case 'contains': return String(actual).includes(String(expected));
    case 'exists': return actual !== undefined && actual !== null;
    default: return false;
    }
  }
  private evaluateExpression(expression: string, context: ExecutionContext): boolean {
    // Simple expression evaluator - in practice, use a safer evaluation library
    try {
      const func = new Function('context', `return ${expression}`);}
      return !!func(context);
    } catch {
      return false;
    }
  }
  private async executeStepAction(execution: SequenceExecution, step: SequenceStep): Promise<void> {
    if (!step.action) return;
    const handler = this.actionHandlers.get(step.action.type);
    if (!handler) {
      throw new Error(`No handler registered for action type ${step.action.type}`);}
    }
    const timeout = step.action.timeout || step.timeout || this.config.execution.defaultTimeout;
    if (step.action.async) {
      await Promise.race([)
        handler(step.action.parameters, execution.context),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Action timeout')), timeout))
      ]);
    } else {
      await handler(step.action.parameters, execution.context);
    }
  }
  private async validateStepCompletion(execution: SequenceExecution, step: SequenceStep): Promise<void> {
    if (!step.validation || !step.validation.required) return;
    for (const validator of step.validation.validators) {
      const validatorFunc = this.validators.get(validator.type);
      if (!validatorFunc) {
        throw new Error(`No validator registered for type ${validator.type}`);}
      }
      const isValid = await validatorFunc(execution.context, validator.parameters);
      if (!isValid) {
        throw new Error(validator.message);
      }
    }
  }
  private addToRollbackStack(execution: SequenceExecution, step: SequenceStep): void {
    if (!step.rollback?.enabled) return;
    const entry: RollbackEntry = {
      stepId: step.id,
      timestamp: new Date(),
      state: { ...execution.context.executionState },
      action: step.action?.type || 'unknown',
      reversible: step.rollback.action !== undefined,
    };
    execution.context.rollbackStack.push(entry);
  }
  private async executeRollbackAction(execution: SequenceExecution, entry: RollbackEntry): Promise<void> {
    const handler = this.rollbackHandlers.get(entry.stepId);
    if (handler) {
      await handler(execution.context, entry.state);
    }
  }
  private calculateRetryDelay(retryPolicy: RetryPolicy, attempt: number): number {
    switch (retryPolicy.backoffStrategy) {
    case 'linear':
      return Math.min(retryPolicy.baseDelay * attempt, retryPolicy.maxDelay);
    case 'exponential':
      return Math.min(retryPolicy.baseDelay * Math.pow(2, attempt - 1), retryPolicy.maxDelay);
    case 'custom':
      // Implement custom backoff logic
      return retryPolicy.baseDelay;
    default:
      return retryPolicy.baseDelay;
    }
  }
  private updateStepPerformance()
    step: SequenceStep,
    startTime: number,
    status: StepExecutionStatus,
    attempts: number,
  ): void {
    const duration = performance.now() - startTime;
    const record: ExecutionRecord = {
      timestamp: new Date(),
      duration,
      status,
      attempts
    };
    step.performance.lastExecutions.push(record);
    // Keep only last 100 executions
    if (step.performance.lastExecutions.length > 100) {
      step.performance.lastExecutions.shift();
    }
    // Update averages
    const executions = step.performance.lastExecutions;
    step.performance.averageExecutionTime = executions.reduce((sum, ex) => sum + ex.duration, 0) / executions.length;
    step.performance.successRate = (executions.filter(ex => ex.status === 'completed').length / executions.length) * 100;
    step.performance.failureRate = (executions.filter(ex => ex.status === 'failed').length / executions.length) * 100;
    step.performance.retryRate = (executions.filter(ex => ex.attempts > 1).length / executions.length) * 100;
  }
  private updateExecutionProgress()
    execution: SequenceExecution,
    stepId: string,
    status: StepExecutionStatus,
    duration: number,
  ): void {
    if (status === 'completed') {
      execution.progress.completedSteps++;
    }
    execution.progress.currentStep = execution.progress.completedSteps;
    execution.progress.percentage = (execution.progress.completedSteps / execution.progress.totalSteps) * 100;
    // Update performance metrics
    execution.performance.totalDuration += duration;
    execution.performance.averageStepDuration = execution.performance.totalDuration / execution.progress.currentStep;
    if (duration < execution.performance.fastestStep.duration) {
      execution.performance.fastestStep = { id: stepId, duration };
    }
    if (duration > execution.performance.slowestStep.duration) {
      execution.performance.slowestStep = { id: stepId, duration };
    }
    // Check milestones
    for (const milestone of execution.progress.milestones) {
      if (!milestone.reached && execution.progress.percentage >= milestone.percentage) {
        milestone.reached = true;
        milestone.timestamp = new Date();
        this.emit('milestoneReached', {)
          executionId: execution.id,
          milestone
        });
      }
    }
  }
  private getNextStep(sequence: SequenceDefinition, currentStepId: string, status: StepExecutionStatus): string | null {
    const currentStep = sequence.steps.find(s => s.id === currentStepId);
    if (!currentStep || !currentStep.action) {
      return null;
    }
    // Check action-specific next steps
    switch (status) {
    case 'completed':
      return currentStep.action.onSuccess || null;
    case 'failed':
      return currentStep.action.onFailure || null;
    case 'skipped':
      return currentStep.action.onSkip || null;
    default:
      return null;
    }
  }
  private registerBuiltInHandlers(): void {
    // Register built-in action handlers
    this.registerActionHandler('function', async (params: Record<string, unknown>, _context: ExecutionContext) => {
      // Execute a named function
      console.log('Executing function:', params.name);
    });
    this.registerActionHandler('data', async (params: Record<string, unknown>, context: ExecutionContext) => {
      // Set data in context
      if (params.set) {
        Object.assign(context.variables, params.set);
      }
    });
    this.registerActionHandler('delay', async (params: Record<string, unknown>, context: ExecutionContext) => {
      // Add delay
      await this.delay(params.duration || 1000);
    });
    // Register built-in validators
    this.registerValidator('required', async (context: ExecutionContext, params: Record<string, unknown>) => {
      return context.variables[params.field] !== undefined;
    });
    this.registerValidator('format', async (context: ExecutionContext, params: Record<string, unknown>) => {
      const value = context.variables[params.field];
      const regex = new RegExp(params.pattern);
      return regex.test(String(value));
    });
  }
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Sequence Builder Helper
export class SequenceBuilder {
  private definition: Partial<SequenceDefinition>;
  private steps: SequenceStep[] = [];
  constructor(name: string, description = '') {
    this.definition = {
      name,
      description,
      version: '1.0.0',
      steps: [],
      entryPoint: '',
      exitPoints: [],
      metadata: {,
        category: 'general',
        tags: [],
        estimatedTotalDuration: 0,
        difficulty: 'medium',
        createdAt: new Date(),
        lastModified: new Date(),
      }
    };
  }
  addStep(step: Omit<SequenceStep, 'performance'>): SequenceBuilder {
    const fullStep: SequenceStep = {
      ...step,
      performance: {,
        averageExecutionTime: 0,
        successRate: 100,
        failureRate: 0,
        retryRate: 0,
        lastExecutions: [],
      }
    };
    this.steps.push(fullStep);
    return this;
  }
  setEntryPoint(stepId: string): SequenceBuilder {
    this.definition.entryPoint = stepId;
    return this;
  }
  addExitPoint(stepId: string): SequenceBuilder {
    if (!this.definition.exitPoints) {
      this.definition.exitPoints = [];
    }
    this.definition.exitPoints.push(stepId);
    return this;
  }
  setMetadata(metadata: Partial<SequenceDefinition['metadata']>): SequenceBuilder {
    this.definition.metadata = { ...this.definition.metadata!, ...metadata };
    return this;
  }
  build(): Omit<SequenceDefinition, 'id'> {
    this.definition.steps = this.steps;
    if (!this.definition.entryPoint && this.steps.length > 0) {
      this.definition.entryPoint = this.steps[0].id;
    }
    if (!this.definition.exitPoints?.length && this.steps.length > 0) {
      this.definition.exitPoints = [this.steps[this.steps.length - 1].id];
    }
    return this.definition as Omit<SequenceDefinition, 'id'>;
  }
}

export default {
  StepSequencingSystem,
  SequenceBuilder
};