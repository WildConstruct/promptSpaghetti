/**
 * Health Check Definition Model - Epic 17.4.5
 * 
 * Comprehensive framework for defining, validating, and managing health check
 * configurations. Provides a flexible system for creating custom health checks
 * with advanced validation, scheduling, and alerting capabilities.
 * 
 * Task: E17-1753114397253-2E1DFD - Build system diagnostics
 * Epic: 17 - Backstage Admin Controls (Story 17.4.5 - Health Check System)
 */

// ==========================================
// CORE HEALTH CHECK INTERFACES
// ==========================================

export interface HealthCheckDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: HealthCheckCategory;
  priority: HealthCheckPriority;
  tags: string[];
  // Configuration
  config: HealthCheckConfig;
  validation: ValidationRules;
  execution: ExecutionConfig;
  alerting: AlertingConfig;
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  deprecated?: boolean;
  replacedBy?: string;
}

export enum HealthCheckCategory {
  SYSTEM = 'system',
  DATABASE = 'database',
  NETWORK = 'network',
  STORAGE = 'storage',
  MEMORY = 'memory',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  INTEGRATION = 'integration',
  BACKUP = 'backup',
  CONFIGURATION = 'configuration',
  BUSINESS = 'business',
  CUSTOM = 'custom'
}

export enum HealthCheckPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational'
}

export interface HealthCheckConfig {
  type: HealthCheckType;
  endpoint?: EndpointConfig;
  query?: QueryConfig;
  script?: ScriptConfig;
  composite?: CompositeConfig;
  parameters: Record<string, ParameterDefinition>;
  dependencies: string[];
  timeout: number;
  retries: RetryConfig;
}

export enum HealthCheckType {
  HTTP_ENDPOINT = 'http_endpoint',
  DATABASE_QUERY = 'database_query',
  SYSTEM_COMMAND = 'system_command',
  JAVASCRIPT_FUNCTION = 'javascript_function',
  COMPOSITE_CHECK = 'composite_check',
  EXTERNAL_SERVICE = 'external_service',
  FILE_SYSTEM = 'file_system',
  NETWORK_CONNECTIVITY = 'network_connectivity',
  RESOURCE_AVAILABILITY = 'resource_availability'
}

// ==========================================
// CONFIGURATION INTERFACES
// ==========================================

export interface EndpointConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
  headers?: Record<string, string>;
  body?: string;
  expectedStatusCodes: number[];
  responseValidation?: ResponseValidation;
  authentication?: AuthenticationConfig;
  timeout?: number;
}

export interface QueryConfig {
  connectionString?: string;
  database: string;
  query: string;
  expectedResults?: QueryExpectation;
  timeout: number;
}

export interface ScriptConfig {
  language: 'javascript' | 'shell' | 'python' | 'powershell';
  script: string;
  environment?: Record<string, string>;
  workingDirectory?: string;
  expectedExitCode: number;
}

export interface CompositeConfig {
  checks: string[]; // IDs of child checks
  logic: CompositeLogic;
  aggregation: AggregationStrategy;
}

export enum CompositeLogic {
  ALL_PASS = 'all_pass',
  ANY_PASS = 'any_pass',
  MAJORITY_PASS = 'majority_pass',
  WEIGHTED_AVERAGE = 'weighted_average',
  CUSTOM_LOGIC = 'custom_logic'
}

export enum AggregationStrategy {
  WORST_STATUS = 'worst_status',
  BEST_STATUS = 'best_status',
  AVERAGE_STATUS = 'average_status',
  WEIGHTED_STATUS = 'weighted_status'
}

export interface ParameterDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  defaultValue?: unknown;
  validation?: ParameterValidation;
  sensitive?: boolean; // For passwords, tokens, etc.
}

export interface ParameterValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enumValues?: string[];
  minValue?: number;
  maxValue?: number;
  customValidator?: string; // JavaScript function
}

// ==========================================
// VALIDATION AND EXECUTION
// ==========================================

export interface ValidationRules {
  input: InputValidation;
  output: OutputValidation;
  runtime: RuntimeValidation;
  security: SecurityValidation;
}

export interface InputValidation {
  required: string[];
  schema?: Record<string, unknown>; // JSON Schema
  customValidators: CustomValidator[];
}

export interface OutputValidation {
  expectedFormat: 'json' | 'text' | 'xml' | 'binary';
  schema?: Record<string, unknown>;
  successConditions: SuccessCondition[];
  warningConditions: WarningCondition[];
  errorConditions: ErrorCondition[];
}

export interface RuntimeValidation {
  maxExecutionTime: number;
  memoryLimit?: number;
  cpuLimit?: number;
  networkAccessRequired: boolean;
  fileSystemAccessRequired: boolean;
  privilegedAccessRequired: boolean;
}

export interface SecurityValidation {
  allowedOrigins?: string[];
  requiresAuthentication: boolean;
  requiredPermissions: string[];
  sensitiveDataHandling: SensitiveDataPolicy;
  auditLevel: AuditLevel;
}

export enum SensitiveDataPolicy {
  NONE = 'none',
  LOG_SANITIZED = 'log_sanitized',
  NO_LOGGING = 'no_logging',
  ENCRYPTED_LOGGING = 'encrypted_logging'
}

export enum AuditLevel {
  NONE = 'none',
  BASIC = 'basic',
  DETAILED = 'detailed',
  FULL = 'full'
}

export interface ExecutionConfig {
  schedule?: ScheduleConfig;
  triggers: TriggerConfig[];
  environment: ExecutionEnvironment;
  isolation: IsolationConfig;
  cleanup: CleanupConfig;
}

export interface ScheduleConfig {
  enabled: boolean;
  cronExpression?: string;
  interval?: number; // milliseconds
  timezone: string;
  maxConcurrentExecutions: number;
}

export interface TriggerConfig {
  type: TriggerType;
  condition: string; // Expression or condition
  parameters?: Record<string, unknown>;
}

export enum TriggerType {
  ON_DEMAND = 'on_demand',
  SCHEDULED = 'scheduled',
  EVENT_DRIVEN = 'event_driven',
  DEPENDENCY_CHANGE = 'dependency_change',
  THRESHOLD_BREACH = 'threshold_breach',
  SYSTEM_STARTUP = 'system_startup',
  API_REQUEST = 'api_request'
}

export interface ExecutionEnvironment {
  runtime: RuntimeEnvironment;
  resources: ResourceLimits;
  network: NetworkConfig;
  storage: StorageConfig;
}

export enum RuntimeEnvironment {
  LOCAL = 'local',
  CONTAINER = 'container',
  ISOLATED_PROCESS = 'isolated_process',
  SANDBOX = 'sandbox',
  REMOTE = 'remote'
}

export interface ResourceLimits {
  maxMemory: number; // MB
  maxCpu: number; // percentage
  maxDiskSpace: number; // MB
  maxNetworkBandwidth?: number; // Mbps
}

// ==========================================
// ALERTING AND NOTIFICATIONS
// ==========================================

export interface AlertingConfig {
  enabled: boolean;
  thresholds: AlertThresholds;
  notifications: NotificationConfig[];
  escalation: EscalationConfig;
  suppression: SuppressionConfig;
}

export interface AlertThresholds {
  responseTime: ThresholdConfig;
  errorRate: ThresholdConfig;
  availability: ThresholdConfig;
  custom: Record<string, ThresholdConfig>;
}

export interface ThresholdConfig {
  warning: number;
  critical: number;
  unit: string;
  evaluationWindow: number; // seconds
  evaluationMethod: 'average' | 'max' | 'min' | 'percentile';
}

export interface NotificationConfig {
  channel: NotificationChannel;
  recipients: string[];
  template: string;
  conditions: NotificationCondition[];
  rateLimit?: RateLimitConfig;
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  PUSH_NOTIFICATION = 'push_notification',
  DASHBOARD = 'dashboard',
  LOG = 'log'
}

export interface NotificationCondition {
  severity: 'info' | 'warning' | 'error' | 'critical';
  repeatInterval?: number; // minutes
  maxRepeats?: number;
}

export interface EscalationConfig {
  enabled: boolean;
  levels: EscalationLevel[];
  autoEscalationDelay: number; // minutes
  maxEscalationLevel: number;
}

export interface EscalationLevel {
  level: number;
  recipients: string[];
  notificationChannel: NotificationChannel;
  requiresAcknowledgment: boolean;
  timeout: number; // minutes
}

export interface SuppressionConfig {
  enabled: boolean;
  rules: SuppressionRule[];
  maintenanceWindows: MaintenanceWindow[];
}

export interface SuppressionRule {
  condition: string; // Expression
  duration: number; // minutes
  reason: string;
}

export interface MaintenanceWindow {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[]; // 0-6, Sunday-Saturday
  timezone: string;
  suppressAll: boolean;
  suppressedChecks?: string[];
}

// ==========================================
// RESULT AND STATUS INTERFACES
// ==========================================

export interface HealthCheckResult {
  checkId: string;
  executionId: string;
  timestamp: Date;
  duration: number;
  status: HealthStatus;
  score: number; // 0-100
  message: string;
  details: ResultDetails;
  metrics: ResultMetrics;
  metadata: ExecutionMetadata;
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown',
  TIMEOUT = 'timeout',
  ERROR = 'error'
}

export interface ResultDetails {
  summary: string;
  findings: Finding[];
  recommendations: string[];
  affectedComponents: string[];
  relatedChecks: string[];
}

export interface Finding {
  type: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  description: string;
  impact: string;
  remediation?: string;
  evidence?: Record<string, unknown>;
}

export interface ResultMetrics {
  responseTime?: number;
  throughput?: number;
  errorCount?: number;
  successRate?: number;
  availability?: number;
  custom: Record<string, number>;
}

export interface ExecutionMetadata {
  hostname: string;
  environment: string;
  version: string;
  userId?: string;
  correlationId?: string;
  parentExecutionId?: string;
  retryAttempt: number;
}

// ==========================================
// HEALTH CHECK DEFINITION BUILDER
// ==========================================

export class HealthCheckDefinitionBuilder {
  private definition: Partial<HealthCheckDefinition> = {};
  constructor(id: string, name: string) {
    this.definition = {
      id,
      name,
      version: '1.0.0',
      tags: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  description(desc: string): this {
    this.definition.description = desc;
    return this;
  }
  category(cat: HealthCheckCategory): this {
    this.definition.category = cat;
    return this;
  }
  priority(pri: HealthCheckPriority): this {
    this.definition.priority = pri;
    return this;
  }
  tags(...tags: string[]): this {
    this.definition.tags = [...(this.definition.tags || []), ...tags];
    return this;
  }
  httpEndpoint(config: EndpointConfig): this {
    this.definition.config = {
      type: HealthCheckType.HTTP_ENDPOINT,
      endpoint: config,
      parameters: {},
      dependencies: [],
      timeout: config.timeout || 30000,
      retries: { maxAttempts: 3, backoffStrategy: 'exponential', initialDelay: 1000 }
    };
    return this;
  }
  databaseQuery(config: QueryConfig): this {
    this.definition.config = {
      type: HealthCheckType.DATABASE_QUERY,
      query: config,
      parameters: {},
      dependencies: [],
      timeout: config.timeout,
      retries: { maxAttempts: 2, backoffStrategy: 'linear', initialDelay: 500 }
    };
    return this;
  }
  schedule(cronExpression: string, timezone = 'UTC'): this {
    if (!this.definition.execution) {
      this.definition.execution = {
        triggers: [],
        environment: {,
          runtime: RuntimeEnvironment.LOCAL,
          resources: { maxMemory: 256, maxCpu: 50, maxDiskSpace: 100 },
          network: {},
          storage: {,
            cleanupAfterExecution: true,
          }
        },
        isolation: {,
          sandboxed: false,
        },
        cleanup: {,
          enabled: true,
          actions: [],
          timeout: 5000,
        }
      };
    }
    this.definition.execution!.schedule = {
      enabled: true,
      cronExpression,
      timezone,
      maxConcurrentExecutions: 1,
    };
    return this;
  }
  alerting(config: Partial<AlertingConfig>): this {
    this.definition.alerting = {
      enabled: true,
      thresholds: {,
        responseTime: { warning: 5000, critical: 10000, unit: 'ms', evaluationWindow: 300, evaluationMethod: 'average' },
        errorRate: { warning: 5, critical: 10, unit: '%', evaluationWindow: 300, evaluationMethod: 'average' },
        availability: { warning: 95, critical: 90, unit: '%', evaluationWindow: 300, evaluationMethod: 'average' },
        custom: {}
      },
      notifications: [],
      escalation: { enabled: false, levels: [], autoEscalationDelay: 30, maxEscalationLevel: 3 },
      suppression: { enabled: false, rules: [], maintenanceWindows: [] },
      ...config
    };
    return this;
  }
  validation(rules: Partial<ValidationRules>): this {
    this.definition.validation = {
      input: { required: [], customValidators: [] },
      output: { expectedFormat: 'json', successConditions: [], warningConditions: [], errorConditions: [] },
      runtime: { maxExecutionTime: 30000, networkAccessRequired: false, fileSystemAccessRequired: false, privilegedAccessRequired: false },
      security: { ,
        requiresAuthentication: false, 
        requiredPermissions: [], 
        sensitiveDataHandling: SensitiveDataPolicy.NONE,
        auditLevel: AuditLevel.BASIC ,
      },
      ...rules
    };
    return this;
  }
  parameter(name: string, definition: ParameterDefinition): this {
    if (!this.definition.config) {
      throw new Error('Configuration must be set before adding parameters');
    }
    this.definition.config.parameters[name] = definition;
    return this;
  }
  dependency(...checkIds: string[]): this {
    if (!this.definition.config) {
      throw new Error('Configuration must be set before adding dependencies');
    }
    this.definition.config.dependencies.push(...checkIds);
    return this;
  }
  build(): HealthCheckDefinition {
    // Validate required fields
    const required = ['id', 'name', 'description', 'category', 'priority', 'config', 'validation'];
    for (const field of required) {
      if (!this.definition[field as keyof HealthCheckDefinition]) {
        throw new Error(`Required field '${field}' is missing`);}
      }
    }
    return this.definition as HealthCheckDefinition;
  }
}

// ==========================================
// VALIDATION HELPER TYPES
// ==========================================

export interface CustomValidator {
  name: string;
  description: string;
  function: string; // JavaScript function as string
  parameters: string[];
}

export interface SuccessCondition {
  field: string;
  operator: ComparisonOperator;
  value: unknown;
  description: string;
}

export interface WarningCondition extends SuccessCondition {}
export interface ErrorCondition extends SuccessCondition {}

export enum ComparisonOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN = 'less_than',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  MATCHES = 'matches',
  NOT_MATCHES = 'not_matches',
  IN = 'in',
  NOT_IN = 'not_in'
}

export interface ResponseValidation {
  contentType?: string[];
  bodyContains?: string[];
  bodyNotContains?: string[];
  headers?: Record<string, string>;
  jsonPath?: JsonPathValidation[];
}

export interface JsonPathValidation {
  path: string;
  expectedValue?: unknown;
  expectedType?: string;
  required: boolean;
}

export interface QueryExpectation {
  minRows?: number;
  maxRows?: number;
  exactRows?: number;
  columns?: string[];
  constraints?: QueryConstraint[];
}

export interface QueryConstraint {
  column: string;
  operator: ComparisonOperator;
  value: unknown;
}

export interface AuthenticationConfig {
  type: 'basic' | 'bearer' | 'api_key' | 'oauth2' | 'custom';
  credentials: Record<string, string>;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number;
  maxDelay?: number;
  retryConditions?: RetryCondition[];
}

export interface RetryCondition {
  statusCode?: number;
  errorType?: string;
  condition?: string; // JavaScript expression
}

export interface NetworkConfig {
  allowedHosts?: string[];
  blockedHosts?: string[];
  proxy?: ProxyConfig;
  maxConnections?: number;
}

export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export interface StorageConfig {
  tempDirectory?: string;
  maxFileSize?: number; // bytes
  allowedFileTypes?: string[];
  cleanupAfterExecution: boolean;
}

export interface IsolationConfig {
  sandboxed: boolean;
  allowedSystemCalls?: string[];
  restrictedDirectories?: string[];
  resourceQuota?: ResourceQuota;
}

export interface ResourceQuota {
  maxFileHandles: number;
  maxProcesses: number;
  maxThreads: number;
  maxSocketConnections: number;
}

export interface CleanupConfig {
  enabled: boolean;
  actions: CleanupAction[];
  timeout: number; // milliseconds
}

export interface CleanupAction {
  type: 'delete_files' | 'close_connections' | 'kill_processes' | 'custom';
  target?: string;
  customScript?: string;
}

export interface RateLimitConfig {
  maxNotifications: number;
  timeWindow: number; // minutes
  burstAllowed: boolean;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export class HealthCheckDefinitionValidator {
  static validate(definition: HealthCheckDefinition): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Basic validation
    if (!definition.id || definition.id.length < 3) {
      errors.push('Health check ID must be at least 3 characters long');
    }
    if (!definition.name || definition.name.length < 5) {
      errors.push('Health check name must be at least 5 characters long');
    }
    // Configuration validation
    if (!definition.config) {
      errors.push('Health check configuration is required');
    } else {
      if (definition.config.timeout < 1000) {
        warnings.push('Timeout less than 1 second may cause false negatives');
      }
      if (definition.config.timeout > 300000) {
        warnings.push('Timeout greater than 5 minutes may impact system performance');
      }
    }
    // Validation rules validation
    if (definition.validation) {
      if (definition.validation.runtime.maxExecutionTime > definition.config.timeout) {
        errors.push('Runtime max execution time cannot exceed configuration timeout');
      }
    }
    // Schedule validation
    if (definition.execution?.schedule?.cronExpression) {
      if (!this.isValidCronExpression(definition.execution.schedule.cronExpression)) {
        errors.push('Invalid cron expression format');
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: this.calculateValidationScore(errors, warnings)
    };
  }
  private static isValidCronExpression(expression: string): boolean {
    // Basic cron expression validation (simplified)
    const parts = expression.trim().split(/\s+/);
    return parts.length === 5 || parts.length === 6;
  }
  private static calculateValidationScore(errors: string[], warnings: string[]): number {
    const baseScore = 100;
    const errorDeduction = errors.length * 20;
    const warningDeduction = warnings.length * 5;
    return Math.max(0, baseScore - errorDeduction - warningDeduction);
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

// ==========================================
// EXAMPLE DEFINITIONS
// ==========================================

export 
  // API endpoint check
  const apiCheck = new HealthCheckDefinitionBuilder('api_health', 'API Health Check');
    .description('Monitors primary API endpoint availability and performance')
    .category(HealthCheckCategory.INTEGRATION)
    .priority(HealthCheckPriority.HIGH)
    .tags('api', 'endpoint', 'availability')
    .httpEndpoint({)
      url: '/api/health',
      method: 'GET',
      expectedStatusCodes: [200],
      timeout: 10000,
      responseValidation: {,
        contentType: ['application/json'],
        jsonPath: [,
          { path: '$.status', expectedValue: 'healthy', required: true },
          { path: '$.timestamp', expectedType: 'string', required: true }
        ]
      }
    })
    .schedule('*/2 * * * *') // Every 2 minutes
    .validation({)
      output: {,
        expectedFormat: 'json',
        successConditions: [,
          { field: 'status', operator: ComparisonOperator.EQUALS, value: 'healthy', description: 'API reports healthy status' }
        ],
        warningConditions: [],
        errorConditions: [],
      },
      runtime: {,
        maxExecutionTime: 8000,
        networkAccessRequired: true,
        fileSystemAccessRequired: false,
        privilegedAccessRequired: false,
      }
    })
    .build();
  return [dbCheck, apiCheck];
};