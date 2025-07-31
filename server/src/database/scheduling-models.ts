// Epic 17.1.5 - Feature Toggle Scheduling System Models

export enum ScheduleType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
  CONDITIONAL = 'conditional'
}

export enum RecurrenceType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

export enum ScheduleAction {
  ENABLE = 'enable',
  DISABLE = 'disable',
  UPDATE_VALUE = 'update_value',
  ACTIVATE_ROLLOUT = 'activate_rollout',
  MODIFY_PERCENTAGE = 'modify_percentage'
}

export enum ScheduleStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  PAUSED = 'paused'
}

export enum ExecutionStatus {
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  RETRYING = 'retrying'
}

// Core schedule model
}
}
export interface FeatureToggleSchedule {
  id: string;
  toggleId: string;
  name: string;
  description?: string;
  type: ScheduleType;
  action: ScheduleAction;
  
  // Timing configuration
  startTime: Date;
  endTime?: Date;
  timezone: string;
  
  // Recurrence configuration
  recurrence?: {
    type: RecurrenceType;
    interval: number;
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    daysOfMonth?: number[]; // 1-31
    monthsOfYear?: number[]; // 1-12
    cronExpression?: string; // For custom recurrence
    maxOccurrences?: number;
    endDate?: Date;
}
}
  };
  
  // Action configuration
  actionConfig: {
    targetValue?: unknown;
    rolloutPercentage?: number;
    conditions?: Array<{
      attribute: string;
      operator: string;
      value: Error;
    }>;
    gradualRollout?: {
      startPercentage: number;
      endPercentage: number;
      incrementMinutes: number;
    };
  };
  
  // Status and metadata
  status: ScheduleStatus;
  enabled: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Execution tracking
  nextExecution?: Date;
  lastExecution?: Date;
  executionCount: number;
  failureCount: number;
  
  // Conflict detection
  priority: number;
  conflictResolution: 'skip' | 'override' | 'merge';
}

// Schedule execution log
}
}
export interface ScheduleExecution {
  id: string;
  scheduleId: string;
  toggleId: string;
  executionTime: Date;
  status: ExecutionStatus;
  
  // Execution details
  triggeredBy: 'scheduler' | 'manual' | 'retry';
  executionContext: {
    timezone: string;
    originalTime: Date;
    actualTime: Date;
    delay?: number; // in milliseconds
}
}
  };
  
  // Results
  beforeValue?: unknown;
  afterValue?: unknown;
  affectedUsers?: number;
  
  // Error handling
  error?: {
    code: string;
    message: string;
    stack?: string;
    retryable: boolean;
  };
  
  // Performance tracking
  duration: number; // in milliseconds
  metadata: Record<string, any>;
  
  createdAt: Date;
}

// Schedule conflict detection
}
}
export interface ScheduleConflict {
  id: string;
  toggleId: string;
  conflictingSchedules: string[];
  conflictType: 'time_overlap' | 'action_conflict' | 'dependency_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  
  // Auto-resolution
  autoResolvable: boolean;
  suggestedResolution?: {
    action: 'reschedule' | 'modify_priority' | 'cancel_one' | 'merge';
    details: Record<string, any>;
}
}
  };
}

// Schedule notification configuration
}
}
export interface ScheduleNotification {
  id: string;
  scheduleId: string;
  type: 'execution_success' | 'execution_failure' | 'conflict_detected' | 'schedule_expired';
  
  // Notification settings
  recipients: string[];
  channels: ('email' | 'slack' | 'webhook' | 'in_app')[];
  
  // Trigger conditions
  conditions: {
    onSuccess?: boolean;
    onFailure?: boolean;
    onRetry?: boolean;
    afterFailureCount?: number;
    beforeExecution?: number; // minutes before
}
}
  };
  
  // Message template
  template: {
    subject: string;
    body: string;
    variables: Record<string, any>;
  };
  
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Timezone management
}
}
export interface TimezoneSettings {
  id: string;
  orgId?: string;
  defaultTimezone: string;
  allowedTimezones: string[];
  
  // DST handling
  handleDST: boolean;
  dstTransitionBehavior: 'skip' | 'duplicate' | 'shift';
  
  // Display preferences
  displayFormat: '12h' | '24h';
  dateFormat: string;
  
  createdAt: Date;
  updatedAt: Date;
}
}
}

// Schedule template for common patterns
}
}
export interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  category: 'maintenance' | 'rollout' | 'experiment' | 'emergency' | 'custom';
  
  // Template configuration
  template: {
    type: ScheduleType;
    action: ScheduleAction;
    recurrence?: Partial<FeatureToggleSchedule['recurrence']>;
    actionConfig: Partial<FeatureToggleSchedule['actionConfig']>;
    defaultDuration?: number; // in minutes
}
}
  };
  
  // Usage tracking
  usageCount: number;
  lastUsed?: Date;
  
  // Permissions
  public: boolean;
  createdBy: string;
  orgId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Bulk schedule operations
}
}
export interface BulkScheduleOperation {
  id: string;
  operationType: 'create' | 'update' | 'cancel' | 'reschedule';
  scheduleIds: string[];
  
  // Operation details
  changes: Record<string, any>;
  reason: string;
  
  // Execution tracking
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'partially_failed';
  totalCount: number;
  successCount: number;
  failureCount: number;
  
  // Results
  results: Array<{
    scheduleId: string;
    success: boolean;
    error?: string;
}
}
  }>;
  
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

// Request/response types for API
}
}
export interface CreateScheduleRequest {
  toggleId: string;
  name: string;
  description?: string;
  type: ScheduleType;
  action: ScheduleAction;
  startTime: string; // ISO 8601
  endTime?: string; // ISO 8601
  timezone: string;
  recurrence?: FeatureToggleSchedule['recurrence'];
  actionConfig: FeatureToggleSchedule['actionConfig'];
  priority?: number;
  conflictResolution?: 'skip' | 'override' | 'merge';
  notifications?: Array<{
    type: string;
    recipients: string[];
    channels: string[];
    conditions: Record<string, any>;
}
}
  }>;
}

}
}
export interface UpdateScheduleRequest extends Partial<CreateScheduleRequest> {
  id: string;
  reason?: string;
}

}
}
export interface ScheduleQuery {
  toggleId?: string;
  status?: ScheduleStatus;
  type?: ScheduleType;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
  sortBy?: 'startTime' | 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}
}
}

// Schedule analytics
}
}
export interface ScheduleAnalytics {
  totalSchedules: number;
  activeSchedules: number;
  completedSchedules: number;
  failedSchedules: number;
  
  // Execution metrics
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  
  // Performance metrics
  onTimeExecutions: number;
  delayedExecutions: number;
  averageDelay: number;
  
  // Conflict metrics
  conflictsDetected: number;
  conflictsResolved: number;
  autoResolvedConflicts: number;
  
  // Usage patterns
  mostUsedActions: Array<{
    action: ScheduleAction;
    count: number;
}
}
  }>;
  
  timeDistribution: Array<{
    hour: number;
    count: number;
  }>;
  
  timezoneDistribution: Array<{
    timezone: string;
    count: number;
  }>;
}

export default {
  ScheduleType,
  RecurrenceType,
  ScheduleAction,
  ScheduleStatus,
  ExecutionStatus
};