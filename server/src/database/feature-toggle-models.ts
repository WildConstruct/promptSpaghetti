// Epic 17.1 - Feature Toggle System TypeScript Models

export enum ToggleType {
  BOOLEAN = 'boolean',
  PERCENTAGE_ROLLOUT = 'percentage_rollout',
  MULTIVARIATE = 'multivariate',
  SCHEDULED = 'scheduled',
  DYNAMIC = 'dynamic',
  SEGMENTATION = 'segmentation'
}

export enum ClaudeImpact {
  NONE = 'NONE',
  PROMPT_COST = 'PROMPT_COST',
  MODEL_VERSION = 'MODEL_VERSION',
  OUTPUT_QUALITY = 'OUTPUT_QUALITY',
  HALLUCINATION_RISK = 'HALLUCINATION_RISK'
}

export enum ToggleAuditAction {
  CREATED = 'created',
  UPDATED = 'updated',
  ACTIVATED = 'activated',
  DEACTIVATED = 'deactivated',
  ARCHIVED = 'archived',
  OVERRIDE = 'override',
  ROLLBACK = 'rollback'
}

export interface FeatureToggle {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: ToggleType;
  value: Record<string, any>;
  orgId?: string;
  claudeCompat: string[];
  claudeImpact: ClaudeImpact;
  enabled: boolean;
  archived: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface ToggleScope {
  id: string;
  toggleId: string;
  rule: Record<string, any>;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToggleAudit {
  id: string;
  toggleId: string;
  actorId?: string;
  action: ToggleAuditAction;
  beforeValue?: Record<string, any>;
  afterValue?: Record<string, any>;
  reason?: string;
  metadata: Record<string, any>;
  isEmergency: boolean;
  ttlExpiresAt?: Date;
  createdAt: Date;
}

export interface ToggleEvaluationCache {
  id: string;
  toggleId: string;
  cacheKey: string;
  result: Record<string, any>;
  expiresAt: Date;
  createdAt: Date;
}

export interface ToggleDependency {
  id: string;
  parentToggleId: string;
  childToggleId: string;
  dependencyType: 'requires' | 'conflicts' | 'suggests';
  createdAt: Date;
}

// Toggle value type definitions for type safety
export interface BooleanToggleValue {
  enabled: boolean;
}

export interface PercentageRolloutValue {
  percentage: number;
  saltKey?: string;
}

export interface MultivariateValue {
  variants: Array<{
    key: string;
    value: any;
    percentage: number;
  }>;
}

export interface ScheduledValue {
  enabled: boolean;
  startTime?: Date;
  endTime?: Date;
  timezone?: string;
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
  };
}

export interface SegmentationValue {
  rules: Array<{
    attribute: string;
    operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'contains';
    value: any;
    logicalOperator?: 'AND' | 'OR';
  }>;
  defaultValue: any;
}

// Evaluation context for toggle resolution
export interface ToggleEvaluationContext {
  userId?: string;
  orgId?: string;
  userAttributes?: Record<string, any>;
  timestamp?: Date;
  ipAddress?: string;
  userAgent?: string;
  experimentId?: string;
}

// Toggle evaluation result
export interface ToggleEvaluationResult {
  enabled: boolean;
  value: any;
  variantKey?: string;
  reason: string;
  ruleMatched?: string;
  metadata?: Record<string, any>;
}

// Feature toggle creation/update request
export interface CreateToggleRequest {
  key: string;
  name: string;
  description?: string;
  type: ToggleType;
  value: Record<string, any>;
  orgId?: string;
  claudeCompat?: string[];
  claudeImpact?: ClaudeImpact;
  enabled?: boolean;
}

export interface UpdateToggleRequest extends Partial<CreateToggleRequest> {
  id: string;
  reason?: string;
}

// Toggle scope management
export interface CreateToggleScopeRequest {
  toggleId: string;
  rule: Record<string, any>;
  priority?: number;
}

// Emergency override request
export interface EmergencyOverrideRequest {
  toggleId: string;
  action: 'enable' | 'disable';
  reason: string;
  ttlMinutes?: number;
}

// Toggle analytics and metrics
export interface ToggleMetrics {
  toggleId: string;
  evaluationCount: number;
  trueCount: number;
  falseCount: number;
  errorCount: number;
  avgEvaluationTime: number;
  lastEvaluated: Date;
  cacheHitRate: number;
}

// Toggle health status
export interface ToggleHealthStatus {
  toggleId: string;
  status: 'healthy' | 'warning' | 'error';
  issues: string[];
  lastChecked: Date;
  evaluationLatency: number;
  errorRate: number;
}

// Dependency analysis result
export interface DependencyAnalysis {
  toggleId: string;
  dependencies: {
    requires: string[];
    conflicts: string[];
    suggests: string[];
  };
  dependents: {
    requiredBy: string[];
    conflictsWith: string[];
    suggestedBy: string[];
  };
  impactRadius: number;
}

// Feature toggle distribution snapshot
export interface ToggleSnapshot {
  version: string;
  timestamp: Date;
  orgId?: string;
  toggles: Record<string, {
    type: ToggleType;
    value: any;
    enabled: boolean;
    rules: Array<Record<string, any>>;
  }>;
  checksum: string;
}

// SDK configuration
export interface ToggleSDKConfig {
  apiUrl: string;
  orgId?: string;
  pollingInterval: number;
  cacheTimeout: number;
  fallbackValues: Record<string, any>;
  enableMetrics: boolean;
  enableCache: boolean;
}

export default {
  ToggleType,
  ClaudeImpact,
  ToggleAuditAction
};