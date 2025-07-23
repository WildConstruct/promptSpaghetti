/**
 * Moderation Workflow Service - Epic 17
 * 
 * Advanced workflow orchestration system for content moderation with
 * configurable workflows, parallel processing, and intelligent routing.
 * 
 * Task: E17-1753114396900-7DA65F - Design moderation workflow
 * Epic: 17 - Backstage Admin Controls
 */

import {
  ModerationItem,
  ModerationState,
  StateTransition,
  ModerationCategory,
  ModerationSeverity,
  ModerationPriority,
  ContentType,
  moderationStatesService
} from './ModerationStatesService';

export interface ModerationWorkflow {
  id: string;
  name: string;
  description: string;
  version: string;
  
  // Workflow configuration
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  steps: WorkflowStep[];
  routing: WorkflowRouting;
  
  // Processing settings
  processing: ProcessingConfig;
  escalation: EscalationConfig;
  automation: AutomationConfig;
  
  // Quality assurance
  validation: ValidationConfig;
  monitoring: MonitoringConfig;
  
  // Metadata
  tags: string[];
  category: ModerationCategory;
  applicableContentTypes: ContentType[];
  
  // Lifecycle
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  itemId: string;
  
  // Execution state
  status: ExecutionStatus;
  currentStepIndex: number;
  currentStep?: WorkflowStep;
  
  // Progress tracking
  startedAt: Date;
  completedAt?: Date;
  pausedAt?: Date;
  cancelledAt?: Date;
  
  // Step execution history
  stepExecutions: StepExecution[];
  
  // Results and metrics
  results: ExecutionResult[];
  metrics: ExecutionMetrics;
  
  // Error handling
  errors: ExecutionError[];
  retryCount: number;
  
  // Context data
  context: WorkflowContext;
  variables: WorkflowVariables;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  description: string;
  
  // Step configuration
  config: StepConfig;
  conditions: StepCondition[];
  actions: StepAction[];
  
  // Flow control
  nextSteps: NextStep[];
  onSuccess?: string; // Step ID
  onFailure?: string; // Step ID
  onTimeout?: string; // Step ID
  
  // Timing
  timeout?: number; // milliseconds
  delay?: number; // milliseconds
  
  // Assignment
  assignmentRules: AssignmentRule[];
  requiredRoles: string[];
  
  // Validation
  validation: StepValidation;
  
  // Parallel execution
  canRunInParallel: boolean;
  parallelGroup?: string;
  
  // Retry configuration
  retryPolicy: RetryPolicy;
}

export interface StepExecution {
  id: string;
  stepId: string;
  
  // Execution state
  status: StepExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  
  // Assignment
  assignedTo?: string;
  reviewers: string[];
  
  // Results
  result?: StepResult;
  output?: Record<string, any>;
  
  // Performance
  duration: number;
  retryCount: number;
  
  // Context
  context: Record<string, any>;
}

export interface WorkflowTrigger {
  type: 'content_reported' | 'auto_detection' | 'manual_review' | 'scheduled' | 'api_trigger' | 'state_change';
  conditions: TriggerCondition[];
  filters: TriggerFilter[];
  priority: number;
  enabled: boolean;
}

export interface WorkflowCondition {
  type: 'content_type' | 'severity_level' | 'category' | 'user_role' | 'time_based' | 'custom';
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'matches';
  value: any;
  description: string;
}

export interface WorkflowRouting {
  strategy: 'sequential' | 'parallel' | 'conditional' | 'priority_based' | 'load_balanced';
  rules: RoutingRule[];
  loadBalancing?: LoadBalancingConfig;
  failover: FailoverConfig;
}

export interface ProcessingConfig {
  maxConcurrentExecutions: number;
  queueStrategy: 'fifo' | 'lifo' | 'priority' | 'fair_share';
  batchProcessing?: BatchProcessingConfig;
  resourceLimits: ResourceLimits;
}

export interface EscalationConfig {
  enabled: boolean;
  triggers: EscalationTrigger[];
  levels: EscalationLevel[];
  timeouts: EscalationTimeout[];
  notifications: NotificationConfig[];
}

export interface AutomationConfig {
  aiAssistance: AIAssistanceConfig;
  autoApproval: AutoApprovalConfig;
  smartRouting: SmartRoutingConfig;
  predictiveAnalytics: PredictiveConfig;
}

export interface ValidationConfig {
  inputValidation: ValidationRule[];
  outputValidation: ValidationRule[];
  businessRules: BusinessRule[];
  complianceChecks: ComplianceRule[];
}

export interface MonitoringConfig {
  metricsCollection: MetricsConfig;
  alerting: AlertConfig;
  logging: LoggingConfig;
  reporting: ReportingConfig;
}

export type ExecutionStatus = 
  | 'pending'      // Waiting to start
  | 'running'      // Currently executing
  | 'paused'       // Temporarily stopped
  | 'completed'    // Successfully finished
  | 'failed'       // Failed with errors
  | 'cancelled'    // Manually cancelled
  | 'timed_out';   // Exceeded time limit

export type StepType = 
  | 'review'       // Manual review step
  | 'automation'   // Automated processing
  | 'validation'   // Data validation
  | 'approval'     // Approval gate
  | 'notification' // Send notifications
  | 'transformation' // Data transformation
  | 'integration'  // External system integration
  | 'decision'     // Decision point
  | 'wait'         // Wait/delay step
  | 'parallel'     // Parallel execution container
  | 'custom';      // Custom step type

export type StepExecutionStatus = 
  | 'waiting'      // Waiting to start
  | 'assigned'     // Assigned to reviewer
  | 'in_progress'  // Currently being executed
  | 'completed'    // Successfully completed
  | 'failed'       // Failed to execute
  | 'skipped'      // Skipped due to conditions
  | 'timed_out'    // Exceeded timeout
  | 'cancelled';   // Manually cancelled

export interface StepConfig {
  parameters: Record<string, any>;
  templates: Record<string, string>;
  integrations: IntegrationConfig[];
  ui: UIConfig;
}

export interface StepCondition {
  type: 'data_condition' | 'time_condition' | 'user_condition' | 'system_condition';
  expression: string; // JavaScript expression
  description: string;
}

export interface StepAction {
  type: 'state_change' | 'notification' | 'data_update' | 'integration_call' | 'variable_set';
  parameters: Record<string, any>;
  condition?: string; // Optional condition
}

export interface NextStep {
  stepId: string;
  condition?: string;
  probability?: number; // For probabilistic routing
  weight?: number; // For weighted routing
}

export interface AssignmentRule {
  type: 'round_robin' | 'load_based' | 'skill_based' | 'availability' | 'priority' | 'random';
  criteria: AssignmentCriteria[];
  fallback?: AssignmentRule;
}

export interface AssignmentCriteria {
  field: string;
  value: any;
  weight: number;
  mandatory: boolean;
}

export interface StepValidation {
  required: string[];
  rules: ValidationRule[];
  customValidators: CustomValidator[];
}

export interface RetryPolicy {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'linear' | 'exponential';
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  retryableErrors: string[];
}

export interface StepResult {
  status: 'success' | 'failure' | 'partial';
  data: Record<string, any>;
  errors: string[];
  warnings: string[];
  metadata: Record<string, any>;
}

export interface TriggerCondition {
  type: 'field_match' | 'time_range' | 'user_action' | 'system_event';
  parameters: Record<string, any>;
  description: string;
}

export interface TriggerFilter {
  field: string;
  operator: string;
  value: any;
  negate: boolean;
}

export interface RoutingRule {
  name: string;
  condition: string;
  target: string;
  priority: number;
  weight?: number;
}

export interface LoadBalancingConfig {
  algorithm: 'round_robin' | 'least_connections' | 'weighted' | 'resource_based';
  healthCheck: HealthCheckConfig;
  fallbackStrategy: string;
}

export interface FailoverConfig {
  enabled: boolean;
  maxFailures: number;
  fallbackWorkflow?: string;
  recoveryStrategy: 'manual' | 'automatic' | 'hybrid';
}

export interface BatchProcessingConfig {
  enabled: boolean;
  batchSize: number;
  timeout: number;
  aggregationRules: AggregationRule[];
}

export interface ResourceLimits {
  maxMemory: number;
  maxCpuTime: number;
  maxExecutionTime: number;
  maxFileSize: number;
}

export interface EscalationTrigger {
  type: 'time_based' | 'failure_count' | 'complexity_score' | 'manual';
  threshold: number;
  condition: string;
}

export interface EscalationLevel {
  level: number;
  name: string;
  assignees: string[];
  timeout: number;
  actions: EscalationAction[];
}

export interface EscalationTimeout {
  level: number;
  timeout: number; // milliseconds
  action: 'escalate' | 'auto_resolve' | 'assign_default';
}

export interface NotificationConfig {
  type: 'email' | 'sms' | 'push' | 'webhook' | 'internal';
  template: string;
  recipients: string[];
  conditions: string[];
}

export interface AIAssistanceConfig {
  enabled: boolean;
  models: AIModelConfig[];
  confidenceThreshold: number;
  fallbackToHuman: boolean;
}

export interface AutoApprovalConfig {
  enabled: boolean;
  rules: AutoApprovalRule[];
  safetyLimits: SafetyLimits;
  auditTrail: boolean;
}

export interface SmartRoutingConfig {
  enabled: boolean;
  algorithm: 'ml_based' | 'rule_based' | 'hybrid';
  learningEnabled: boolean;
  feedbackLoop: boolean;
}

export interface PredictiveConfig {
  enabled: boolean;
  features: string[];
  models: PredictiveModel[];
  confidenceThreshold: number;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  parameters: Record<string, any>;
  message: string;
}

export interface BusinessRule {
  name: string;
  condition: string;
  action: string;
  priority: number;
}

export interface ComplianceRule {
  regulation: string;
  requirement: string;
  validator: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface MetricsConfig {
  enabled: boolean;
  metrics: string[];
  aggregation: AggregationConfig;
  retention: RetentionConfig;
}

export interface AlertConfig {
  enabled: boolean;
  rules: AlertRule[];
  channels: AlertChannel[];
  escalation: AlertEscalation[];
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  destinations: LogDestination[];
  retention: number; // days
}

export interface ReportingConfig {
  enabled: boolean;
  schedules: ReportSchedule[];
  templates: ReportTemplate[];
  distribution: DistributionConfig[];
}

export interface ExecutionResult {
  stepId: string;
  status: 'success' | 'failure' | 'warning';
  data: Record<string, any>;
  timestamp: Date;
}

export interface ExecutionMetrics {
  totalDuration: number;
  stepCount: number;
  automatedSteps: number;
  manualSteps: number;
  failedSteps: number;
  retryCount: number;
  resourceUsage: ResourceUsage;
}

export interface ExecutionError {
  stepId: string;
  error: string;
  timestamp: Date;
  context: Record<string, any>;
  retryable: boolean;
}

export interface WorkflowContext {
  itemId: string;
  workflowId: string;
  executionId: string;
  user: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface WorkflowVariables {
  [key: string]: any;
}

export interface IntegrationConfig {
  type: string;
  endpoint: string;
  authentication: AuthConfig;
  timeout: number;
  retryPolicy: RetryPolicy;
}

export interface UIConfig {
  layout: string;
  fields: UIField[];
  actions: UIAction[];
  validation: UIValidation[];
}

export interface CustomValidator {
  name: string;
  function: string;
  parameters: Record<string, any>;
  message: string;
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
}

export interface AggregationRule {
  field: string;
  operation: 'sum' | 'avg' | 'min' | 'max' | 'count';
  groupBy: string[];
}

export interface EscalationAction {
  type: 'notify' | 'reassign' | 'escalate' | 'auto_resolve';
  parameters: Record<string, any>;
}

export interface AIModelConfig {
  name: string;
  version: string;
  endpoint: string;
  capabilities: string[];
}

export interface AutoApprovalRule {
  condition: string;
  confidence: number;
  limitations: string[];
}

export interface SafetyLimits {
  maxAutoApprovals: number;
  timeWindow: number;
  categories: string[];
}

export interface PredictiveModel {
  name: string;
  type: string;
  accuracy: number;
  features: string[];
}

export interface AggregationConfig {
  intervals: string[];
  functions: string[];
}

export interface RetentionConfig {
  shortTerm: number; // days
  longTerm: number; // days
  archival: number; // days
}

export interface AlertRule {
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, any>;
}

export interface AlertEscalation {
  delay: number;
  channels: string[];
  recipients: string[];
}

export interface LogDestination {
  type: 'file' | 'database' | 'external';
  config: Record<string, any>;
}

export interface ReportSchedule {
  name: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
}

export interface ReportTemplate {
  name: string;
  format: 'pdf' | 'excel' | 'json' | 'csv';
  sections: ReportSection[];
}

export interface DistributionConfig {
  recipients: string[];
  channels: string[];
  conditions: string[];
}

export interface ResourceUsage {
  memory: number;
  cpu: number;
  network: number;
  storage: number;
}

export interface AuthConfig {
  type: 'bearer' | 'basic' | 'oauth' | 'api_key';
  credentials: Record<string, any>;
}

export interface UIField {
  name: string;
  type: string;
  label: string;
  required: boolean;
  validation: string[];
}

export interface UIAction {
  name: string;
  label: string;
  type: 'button' | 'link' | 'dropdown';
  condition?: string;
}

export interface UIValidation {
  field: string;
  rules: string[];
  message: string;
}

export interface ReportSection {
  name: string;
  type: 'chart' | 'table' | 'text' | 'metric';
  data: string;
  config: Record<string, any>;
}

export interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  runningExecutions: number;
  completedExecutions: number;
  failedExecutions: number;
  
  performance: {
    averageExecutionTime: number;
    averageStepsPerWorkflow: number;
    automationRate: number;
    successRate: number;
    throughput: number; // executions per hour
  };
  
  utilization: {
    processingCapacity: number;
    queueDepth: number;
    resourceUtilization: number;
    bottlenecks: string[];
  };
  
  quality: {
    slaCompliance: number;
    errorRate: number;
    escalationRate: number;
    retryRate: number;
  };
}

export interface WorkflowFilter {
  categories?: ModerationCategory[];
  contentTypes?: ContentType[];
  status?: ExecutionStatus[];
  assignees?: string[];
  dateRange?: { start?: Date; end?: Date };
  tags?: string[];
  workflowIds?: string[];
  priorities?: ModerationPriority[];
}

/**
 * Moderation Workflow Service
 * 
 * Orchestrates complex moderation workflows with intelligent routing,
 * parallel processing, and comprehensive monitoring.
 */
export class ModerationWorkflowService {
  private static instance: ModerationWorkflowService;
  private workflows: Map<string, ModerationWorkflow> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private executionQueue: WorkflowExecution[] = [];
  private listeners: Map<string, (event: WorkflowEvent) => void> = new Map();
  private processor: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeDefaultWorkflows();
    this.startWorkflowProcessor();
  }

  static getInstance(): ModerationWorkflowService {
    if (!ModerationWorkflowService.instance) {
      ModerationWorkflowService.instance = new ModerationWorkflowService();
    }
    return ModerationWorkflowService.instance;
  }

  /**
   * Workflow Management
   */
  async createWorkflow(
    workflowData: Omit<ModerationWorkflow, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<ModerationWorkflow> {
    const workflow: ModerationWorkflow = {
      ...workflowData,
      id: this.generateWorkflowId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy
    };

    this.workflows.set(workflow.id, workflow);
    this.notifyListeners('workflow_created', workflow);

    return workflow;
  }

  async updateWorkflow(
    workflowId: string,
    updates: Partial<ModerationWorkflow>,
    updatedBy: string
  ): Promise<ModerationWorkflow | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    const updatedWorkflow: ModerationWorkflow = {
      ...workflow,
      ...updates,
      id: workflowId,
      updatedAt: new Date(),
      lastModifiedBy: updatedBy
    };

    this.workflows.set(workflowId, updatedWorkflow);
    this.notifyListeners('workflow_updated', updatedWorkflow);

    return updatedWorkflow;
  }

  async deleteWorkflow(workflowId: string, deletedBy: string): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    // Check for running executions
    const runningExecutions = Array.from(this.executions.values()).filter(
      e => e.workflowId === workflowId && e.status === 'running'
    );

    if (runningExecutions.length > 0) {
      throw new Error('Cannot delete workflow with running executions');
    }

    this.workflows.delete(workflowId);
    this.notifyListeners('workflow_deleted', { workflowId, deletedBy });

    return true;
  }

  /**
   * Workflow Execution
   */
  async executeWorkflow(
    workflowId: string,
    itemId: string,
    triggeredBy: string,
    context?: Record<string, any>
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || !workflow.isActive) {
      throw new Error('Workflow not found or inactive');
    }

    const item = moderationStatesService.getModerationItems().find(i => i.id === itemId);
    if (!item) {
      throw new Error('Moderation item not found');
    }

    // Validate workflow conditions
    if (!this.validateWorkflowConditions(workflow, item)) {
      throw new Error('Workflow conditions not met');
    }

    const execution: WorkflowExecution = {
      id: this.generateExecutionId(),
      workflowId,
      itemId,
      status: 'pending',
      currentStepIndex: 0,
      startedAt: new Date(),
      stepExecutions: [],
      results: [],
      metrics: {
        totalDuration: 0,
        stepCount: workflow.steps.length,
        automatedSteps: workflow.steps.filter(s => s.type === 'automation').length,
        manualSteps: workflow.steps.filter(s => s.type === 'review').length,
        failedSteps: 0,
        retryCount: 0,
        resourceUsage: { memory: 0, cpu: 0, network: 0, storage: 0 }
      },
      errors: [],
      retryCount: 0,
      context: {
        itemId,
        workflowId,
        executionId: '',
        user: triggeredBy,
        timestamp: new Date(),
        metadata: context || {}
      },
      variables: {}
    };

    execution.context.executionId = execution.id;
    this.executions.set(execution.id, execution);
    
    // Add to execution queue
    this.executionQueue.push(execution);
    
    this.notifyListeners('execution_started', execution);
    return execution;
  }

  async pauseExecution(executionId: string, pausedBy: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'running') return false;

    execution.status = 'paused';
    execution.pausedAt = new Date();
    this.executions.set(executionId, execution);

    this.notifyListeners('execution_paused', { execution, pausedBy });
    return true;
  }

  async resumeExecution(executionId: string, resumedBy: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'paused') return false;

    execution.status = 'running';
    execution.pausedAt = undefined;
    this.executions.set(executionId, execution);

    // Re-add to execution queue
    this.executionQueue.push(execution);

    this.notifyListeners('execution_resumed', { execution, resumedBy });
    return true;
  }

  async cancelExecution(executionId: string, cancelledBy: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (!execution || ['completed', 'failed', 'cancelled'].includes(execution.status)) {
      return false;
    }

    execution.status = 'cancelled';
    execution.cancelledAt = new Date();
    this.executions.set(executionId, execution);

    // Remove from execution queue
    this.executionQueue = this.executionQueue.filter(e => e.id !== executionId);

    this.notifyListeners('execution_cancelled', { execution, cancelledBy });
    return true;
  }

  /**
   * Step Execution
   */
  async executeStep(executionId: string, stepIndex: number): Promise<StepExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) throw new Error('Execution not found');

    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const step = workflow.steps[stepIndex];
    if (!step) throw new Error('Step not found');

    const stepExecution: StepExecution = {
      id: this.generateStepExecutionId(),
      stepId: step.id,
      status: 'waiting',
      startedAt: new Date(),
      reviewers: [],
      duration: 0,
      retryCount: 0,
      context: {}
    };

    execution.stepExecutions.push(stepExecution);
    this.executions.set(executionId, execution);

    try {
      // Execute step based on type
      switch (step.type) {
      case 'automation':
        await this.executeAutomationStep(execution, step, stepExecution);
        break;
      case 'review':
        await this.executeReviewStep(execution, step, stepExecution);
        break;
      case 'validation':
        await this.executeValidationStep(execution, step, stepExecution);
        break;
      case 'approval':
        await this.executeApprovalStep(execution, step, stepExecution);
        break;
      case 'notification':
        await this.executeNotificationStep(execution, step, stepExecution);
        break;
      default:
        await this.executeCustomStep(execution, step, stepExecution);
      }

      stepExecution.completedAt = new Date();
      stepExecution.duration = stepExecution.completedAt.getTime() - stepExecution.startedAt.getTime();

      if (stepExecution.status !== 'failed') {
        stepExecution.status = 'completed';
      }

    } catch (error) {
      stepExecution.status = 'failed';
      execution.errors.push({
        stepId: step.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        context: stepExecution.context,
        retryable: step.retryPolicy.enabled
      });
    }

    this.executions.set(executionId, execution);
    return stepExecution;
  }

  /**
   * Data Retrieval
   */
  getWorkflows(filter?: { category?: ModerationCategory; active?: boolean }): ModerationWorkflow[] {
    let workflows = Array.from(this.workflows.values());

    if (filter?.category) {
      workflows = workflows.filter(w => w.category === filter.category);
    }

    if (filter?.active !== undefined) {
      workflows = workflows.filter(w => w.isActive === filter.active);
    }

    return workflows.sort((a, b) => a.name.localeCompare(b.name));
  }

  getExecutions(filter?: WorkflowFilter): WorkflowExecution[] {
    let executions = Array.from(this.executions.values());

    if (!filter) return executions;

    if (filter.workflowIds?.length) {
      executions = executions.filter(e => filter.workflowIds!.includes(e.workflowId));
    }

    if (filter.status?.length) {
      executions = executions.filter(e => filter.status!.includes(e.status));
    }

    if (filter.dateRange) {
      executions = executions.filter(e => {
        const date = e.startedAt;
        return (!filter.dateRange!.start || date >= filter.dateRange!.start) &&
               (!filter.dateRange!.end || date <= filter.dateRange!.end);
      });
    }

    return executions.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  getWorkflowStats(): WorkflowStats {
    const workflows = Array.from(this.workflows.values());
    const executions = Array.from(this.executions.values());
    
    const completedExecutions = executions.filter(e => e.status === 'completed');
    const failedExecutions = executions.filter(e => e.status === 'failed');
    const runningExecutions = executions.filter(e => e.status === 'running');
    
    const totalDuration = completedExecutions.reduce((sum, e) => {
      return sum + (e.completedAt ? e.completedAt.getTime() - e.startedAt.getTime() : 0);
    }, 0);

    const averageExecutionTime = completedExecutions.length > 0 
      ? totalDuration / completedExecutions.length 
      : 0;

    const automatedSteps = executions.reduce((sum, e) => sum + e.metrics.automatedSteps, 0);
    const totalSteps = executions.reduce((sum, e) => sum + e.metrics.stepCount, 0);
    const automationRate = totalSteps > 0 ? automatedSteps / totalSteps : 0;

    const successRate = executions.length > 0 
      ? completedExecutions.length / executions.length 
      : 0;

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.isActive).length,
      totalExecutions: executions.length,
      runningExecutions: runningExecutions.length,
      completedExecutions: completedExecutions.length,
      failedExecutions: failedExecutions.length,
      performance: {
        averageExecutionTime,
        averageStepsPerWorkflow: workflows.length > 0 
          ? workflows.reduce((sum, w) => sum + w.steps.length, 0) / workflows.length 
          : 0,
        automationRate,
        successRate,
        throughput: 0 // TODO: Calculate based on time window
      },
      utilization: {
        processingCapacity: 100, // TODO: Calculate based on resource limits
        queueDepth: this.executionQueue.length,
        resourceUtilization: 75, // TODO: Calculate based on actual resource usage
        bottlenecks: [] // TODO: Identify bottlenecks
      },
      quality: {
        slaCompliance: 0.95, // TODO: Calculate based on SLA metrics
        errorRate: executions.length > 0 ? failedExecutions.length / executions.length : 0,
        escalationRate: 0.1, // TODO: Calculate based on escalation data
        retryRate: 0.05 // TODO: Calculate based on retry data
      }
    };
  }

  /**
   * Event Handling
   */
  subscribe(listenerId: string, callback: (event: WorkflowEvent) => void): void {
    this.listeners.set(listenerId, callback);
  }

  unsubscribe(listenerId: string): void {
    this.listeners.delete(listenerId);
  }

  // Private helper methods
  private initializeDefaultWorkflows(): void {
    // TODO: Initialize default workflows
  }

  private startWorkflowProcessor(): void {
    // Process workflow queue every 5 seconds
    this.processor = setInterval(() => {
      this.processWorkflowQueue();
    }, 5000);
  }

  private processWorkflowQueue(): void {
    if (this.executionQueue.length === 0) return;

    const execution = this.executionQueue.shift();
    if (!execution) return;

    this.processExecution(execution);
  }

  private async processExecution(execution: WorkflowExecution): Promise<void> {
    execution.status = 'running';
    this.executions.set(execution.id, execution);

    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) {
      execution.status = 'failed';
      execution.errors.push({
        stepId: '',
        error: 'Workflow not found',
        timestamp: new Date(),
        context: {},
        retryable: false
      });
      return;
    }

    try {
      // Execute workflow steps
      for (let i = execution.currentStepIndex; i < workflow.steps.length; i++) {
        execution.currentStepIndex = i;
        execution.currentStep = workflow.steps[i];

        const stepExecution = await this.executeStep(execution.id, i);
        
        if (stepExecution.status === 'failed' && !workflow.steps[i].retryPolicy.enabled) {
          execution.status = 'failed';
          break;
        }

        // Handle step routing
        const nextStepIndex = this.determineNextStep(workflow, i, stepExecution);
        if (nextStepIndex === -1) {
          // End of workflow
          break;
        } else if (nextStepIndex !== i + 1) {
          // Jump to different step
          i = nextStepIndex - 1; // -1 because loop will increment
        }
      }

      if (execution.status === 'running') {
        execution.status = 'completed';
        execution.completedAt = new Date();
        execution.metrics.totalDuration = execution.completedAt.getTime() - execution.startedAt.getTime();
      }

    } catch (error) {
      execution.status = 'failed';
      execution.errors.push({
        stepId: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        context: {},
        retryable: false
      });
    }

    this.executions.set(execution.id, execution);
    this.notifyListeners('execution_completed', execution);
  }

  private validateWorkflowConditions(workflow: ModerationWorkflow, item: ModerationItem): boolean {
    return workflow.conditions.every(condition => {
      switch (condition.type) {
      case 'content_type':
        return this.evaluateCondition(item.type, condition);
      case 'category':
        return this.evaluateCondition(item.category, condition);
      case 'severity_level':
        return this.evaluateCondition(item.severity, condition);
      default:
        return true;
      }
    });
  }

  private evaluateCondition(value: any, condition: WorkflowCondition): boolean {
    switch (condition.operator) {
    case 'equals': return value === condition.value;
    case 'not_equals': return value !== condition.value;
    case 'contains': return String(value).includes(String(condition.value));
    case 'in': return Array.isArray(condition.value) && condition.value.includes(value);
    default: return true;
    }
  }

  private async executeAutomationStep(
    execution: WorkflowExecution,
    step: WorkflowStep,
    stepExecution: StepExecution
  ): Promise<void> {
    stepExecution.status = 'in_progress';
    // TODO: Implement automation step execution
    await this.sleep(100); // Simulate processing
  }

  private async executeReviewStep(
    execution: WorkflowExecution,
    step: WorkflowStep,
    stepExecution: StepExecution
  ): Promise<void> {
    stepExecution.status = 'assigned';
    // TODO: Implement review step execution
    await this.sleep(100); // Simulate processing
  }

  private async executeValidationStep(
    execution: WorkflowExecution,
    step: WorkflowStep,
    stepExecution: StepExecution
  ): Promise<void> {
    stepExecution.status = 'in_progress';
    // TODO: Implement validation step execution
    await this.sleep(100); // Simulate processing
  }

  private async executeApprovalStep(
    execution: WorkflowExecution,
    step: WorkflowStep,
    stepExecution: StepExecution
  ): Promise<void> {
    stepExecution.status = 'assigned';
    // TODO: Implement approval step execution
    await this.sleep(100); // Simulate processing
  }

  private async executeNotificationStep(
    execution: WorkflowExecution,
    step: WorkflowStep,
    stepExecution: StepExecution
  ): Promise<void> {
    stepExecution.status = 'in_progress';
    // TODO: Implement notification step execution
    await this.sleep(100); // Simulate processing
  }

  private async executeCustomStep(
    execution: WorkflowExecution,
    step: WorkflowStep,
    stepExecution: StepExecution
  ): Promise<void> {
    stepExecution.status = 'in_progress';
    // TODO: Implement custom step execution
    await this.sleep(100); // Simulate processing
  }

  private determineNextStep(
    workflow: ModerationWorkflow,
    currentIndex: number,
    stepExecution: StepExecution
  ): number {
    const step = workflow.steps[currentIndex];
    
    if (stepExecution.status === 'completed' && step.onSuccess) {
      const nextIndex = workflow.steps.findIndex(s => s.id === step.onSuccess);
      return nextIndex !== -1 ? nextIndex : currentIndex + 1;
    }
    
    if (stepExecution.status === 'failed' && step.onFailure) {
      const nextIndex = workflow.steps.findIndex(s => s.id === step.onFailure);
      return nextIndex !== -1 ? nextIndex : -1;
    }
    
    return currentIndex + 1 < workflow.steps.length ? currentIndex + 1 : -1;
  }

  private notifyListeners(eventType: string, data: any): void {
    this.listeners.forEach(callback => {
      try {
        callback({ type: eventType, data, timestamp: new Date() });
      } catch (error) {
        console.error('Error in workflow listener:', error);
      }
    });
  }

  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateExecutionId(): string {
    return `execution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateStepExecutionId(): string {
    return `step_exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export interface WorkflowEvent {
  type: string;
  data: any;
  timestamp: Date;
}

// Export singleton instance
export const moderationWorkflowService = ModerationWorkflowService.getInstance();

// Convenience functions
export const createWorkflow = (
  workflowData: Omit<ModerationWorkflow, 'id' | 'createdAt' | 'updatedAt'>,
  createdBy: string
) => moderationWorkflowService.createWorkflow(workflowData, createdBy);

export const executeWorkflow = (workflowId: string, itemId: string, triggeredBy: string) =>
  moderationWorkflowService.executeWorkflow(workflowId, itemId, triggeredBy);

export const getWorkflows = (filter?: { category?: ModerationCategory; active?: boolean }) =>
  moderationWorkflowService.getWorkflows(filter);

export const getWorkflowStats = () =>
  moderationWorkflowService.getWorkflowStats();