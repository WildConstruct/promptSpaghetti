/**
 * Moderation Workflow Service - Epic 17
 *
 * Advanced workflow orchestration system for content moderation with
 * configurable workflows, parallel processing, and intelligent routing.
 *
 * Task: E17-1753114396900-7DA65F - Design moderation workflow
 * Epic: 17 - Backstage Admin Controls
 */
import { ModerationCategory, ModerationPriority, ContentType } from './ModerationStatesService';

}
export interface ModerationWorkflow {
    id: string;
    name: string;
    description: string;
    version: string;
    trigger: WorkflowTrigger;
    conditions: WorkflowCondition[];
    steps: WorkflowStep[];
    routing: WorkflowRouting;
    processing: ProcessingConfig;
    escalation: EscalationConfig;
    automation: AutomationConfig;
    validation: ValidationConfig;
    monitoring: MonitoringConfig;
    tags: string[];
    category: ModerationCategory;
    applicableContentTypes: ContentType[];
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
    status: ExecutionStatus;
    currentStepIndex: number;
    currentStep?: WorkflowStep;
    startedAt: Date;
    completedAt?: Date;
    pausedAt?: Date;
    cancelledAt?: Date;
    stepExecutions: StepExecution[];
    results: ExecutionResult[];
    metrics: ExecutionMetrics;
    errors: ExecutionError[];
    retryCount: number;
    context: WorkflowContext;
    variables: WorkflowVariables;

}
export interface WorkflowStep {
    id: string;
    name: string;
    type: StepType;
    description: string;
    config: StepConfig;
    conditions: StepCondition[];
    actions: StepAction[];
    nextSteps: NextStep[];
    onSuccess?: string;
    onFailure?: string;
    onTimeout?: string;
    timeout?: number;
    delay?: number;
    assignmentRules: AssignmentRule[];
    requiredRoles: string[];
    validation: StepValidation;
    canRunInParallel: boolean;
    parallelGroup?: string;
    retryPolicy: RetryPolicy;

}
export interface StepExecution {
    id: string;
    stepId: string;
    status: StepExecutionStatus;
    startedAt: Date;
    completedAt?: Date;
    assignedTo?: string;
    reviewers: string[];
    result?: StepResult;
    output?: Record<string, any>;
    duration: number;
    retryCount: number;
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

export type ExecutionStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'timed_out';
export type StepType = 'review' | 'automation' | 'validation' | 'approval' | 'notification' | 'transformation' | 'integration' | 'decision' | 'wait' | 'parallel' | 'custom';
export type StepExecutionStatus = 'waiting' | 'assigned' | 'in_progress' | 'completed' | 'failed' | 'skipped' | 'timed_out' | 'cancelled';

}
export interface StepConfig {
    parameters: Record<string, any>;
    templates: Record<string, string>;
    integrations: IntegrationConfig[];
    ui: UIConfig;

}
export interface StepCondition {
    type: 'data_condition' | 'time_condition' | 'user_condition' | 'system_condition';
    expression: string;
    description: string;

}
export interface StepAction {
    type: 'state_change' | 'notification' | 'data_update' | 'integration_call' | 'variable_set';
    parameters: Record<string, any>;
    condition?: string;

}
export interface NextStep {
    stepId: string;
    condition?: string;
    probability?: number;
    weight?: number;

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
    baseDelay: number;
    maxDelay: number;
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
    timeout: number;
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
    retention: number;

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
    shortTerm: number;
    longTerm: number;
    archival: number;

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
        throughput: number;
}
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
    dateRange?: {
        start?: Date;
        end?: Date;
}
    };
    tags?: string[];
    workflowIds?: string[];
    priorities?: ModerationPriority[];
/**
 * Moderation Workflow Service
 *
 * Orchestrates complex moderation workflows with intelligent routing,
 * parallel processing, and comprehensive monitoring.
 */
export declare class ModerationWorkflowService {
    private static instance;
    private workflows;
    private executions;
    private executionQueue;
    private listeners;
    private processor;
    private constructor();
    static getInstance(): ModerationWorkflowService;
    /**
     * Workflow Management
     */
    createWorkflow(workflowData: Omit<ModerationWorkflow, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string): Promise<ModerationWorkflow>;
    updateWorkflow(workflowId: string, updates: Partial<ModerationWorkflow>, updatedBy: string): Promise<ModerationWorkflow | null>;
    deleteWorkflow(workflowId: string, deletedBy: string): Promise<boolean>;
    /**
     * Workflow Execution
     */
    executeWorkflow(workflowId: string, itemId: string, triggeredBy: string, context?: Record<string, any>): Promise<WorkflowExecution>;
    pauseExecution(executionId: string, pausedBy: string): Promise<boolean>;
    resumeExecution(executionId: string, resumedBy: string): Promise<boolean>;
    cancelExecution(executionId: string, cancelledBy: string): Promise<boolean>;
    /**
     * Step Execution
     */
    executeStep(executionId: string, stepIndex: number): Promise<StepExecution>;
    /**
     * Data Retrieval
     */
    getWorkflows(filter?: {)
        category?: ModerationCategory;
        active?: boolean;
    }): ModerationWorkflow[];
    getExecutions(filter?: WorkflowFilter): WorkflowExecution[];
    getWorkflowStats(): WorkflowStats;
    /**
     * Event Handling
     */
    subscribe(listenerId: string, callback: (event: WorkflowEvent) => void): void;
    unsubscribe(listenerId: string): void;
    private initializeDefaultWorkflows;
    private startWorkflowProcessor;
    private processWorkflowQueue;
    private processExecution;
    private validateWorkflowConditions;
    private evaluateCondition;
    private executeAutomationStep;
    private executeReviewStep;
    private executeValidationStep;
    private executeApprovalStep;
    private executeNotificationStep;
    private executeCustomStep;
    private determineNextStep;
    private notifyListeners;
    private generateWorkflowId;
    private generateExecutionId;
    private generateStepExecutionId;
    private sleep;

}
export interface WorkflowEvent {
    type: string;
    data: any;
    timestamp: Date;

export declare const moderationWorkflowService: ModerationWorkflowService;
export declare const createWorkflow: (workflowData: Omit<ModerationWorkflow, "id" | "createdAt" | "updatedAt">, createdBy: string) => Promise<ModerationWorkflow>;
export declare const executeWorkflow: (workflowId: string, itemId: string, triggeredBy: string) => Promise<WorkflowExecution>;
export declare const getWorkflows: (filter?: {)
    category?: ModerationCategory;
    active?: boolean;
}
}) => ModerationWorkflow[];
export declare const getWorkflowStats: () => WorkflowStats;
//# sourceMappingURL=ModerationWorkflowService.d.ts.map