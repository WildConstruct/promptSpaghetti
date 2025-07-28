/**
 * Activity Data Model
 * Epic 17.4 - System Configuration & Monitoring
 * Task: E17-1753114397068-6657F3
 * 
 * Comprehensive activity tracking data model for monitoring user actions,
 * system events, and administrative activities across the platform.
 */

// Base Activity Types
export type ActivityType = 
  | 'user_action'
  | 'system_event'
  | 'admin_action' 
  | 'security_event'
  | 'api_call'
  | 'data_change'
  | 'error_event'
  | 'performance_event'
  | 'authentication'
  | 'authorization'
  | 'file_operation'
  | 'workflow_event';

export type ActivitySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

// Core Activity Interface

export interface BaseActivity {
  id: string;,
  timestamp: string;
  type: ActivityType;,
  severity: ActivitySeverity;
  status: ActivityStatus;
  // Actor Information
  userId?: string;
  userEmail?: string;
  userRole?: string;
  sessionId?: string;
  // System Context
  source: string; // Component/service that generated the activity,
  sourceVersion?: string;
  environment: 'development' | 'staging' | 'production';
  // Core Activity Data
  action: string;,
  description: string;
  category: string;
  // Resource Information
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  // Request Context
  requestId?: string;
  correlationId?: string;
  parentActivityId?: string;
  // Network Context
  ipAddress?: string;
  userAgent?: string;
  geolocation?: {,
  country?: string;
  region?: string;
  city?: string;
  coordinates?: [number, number]; // [lat, lon],
};
  // Timing Information
  duration?: number; // milliseconds
  startTime?: string;
  endTime?: string;
  // Metadata
  metadata: Record<string, any>;
  tags: string;
  // Change Tracking
  changes?: ActivityChange;
  // Error Information (for failed activities)
  error?: {
  code?: string;
  message?: string;
  stack?: string;
  details?: Record<string, any>;
};
  // Audit Trail
  createdAt: string;
  updatedAt?: string;
  version: number;

// Change Tracking for Data Modifications
}
export interface ActivityChange {
  field: string;,
  oldValue: any;
  newValue: any;,
  changeType: 'create' | 'update' | 'delete' | 'restore';
  // User Action Activities
}
export interface UserActivity extends BaseActivity {
  type: 'user_action';
  // UI Context
  page?: string;
  component?: string;
  elementId?: string;
  // User Journey
  previousAction?: string;
  userJourneyId?: string;
  // Performance Data
  renderTime?: number;
  interactionDelay?: number;
  // System Event Activities
  export interface SystemActivity extends BaseActivity {
  type: 'system_event';
  // System Metrics
  systemMetrics?: {,
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  networkLatency?: number;
};
  // Health Check Data
  healthStatus?: 'healthy' | 'warning' | 'critical' | 'unknown';
  componentStatus?: Record<string, string>;

// Admin Action Activities

export interface AdminActivity extends BaseActivity {
  type: 'admin_action';
  // Administrative Context
  adminLevel: 'super_admin' | 'admin' | 'moderator' | 'support';
  targetUserId?: string;
  targetUserEmail?: string;
  // Policy Context
  policyId?: string;
  policyVersion?: string;
  // Approval Workflow
  requiresApproval?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approverId?: string;
  approvalReason?: string;
  // Security Event Activities
  export interface SecurityActivity extends BaseActivity {
  type: 'security_event';
  // Threat Information
  threatType?: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  threatSource?: string;
  // Detection Information
  detectionMethod?: string;
  detectionTime?: string;
  detectionConfidence?: number; // 0-1,
  // Response Information
  responseAction?: string;
  responseTime?: string;
  blocked?: boolean;
  // Forensic Data
  forensicData?: {,
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseStatus?: number;
  fingerprint?: string;
};

// API Call Activities

export interface ApiActivity extends BaseActivity {
  type: 'api_call';
  // HTTP Context
  method: string;,
  endpoint: string;
  statusCode: number;
  // Request/Response Data
  requestSize?: number;
  responseSize?: number;
  // API Metadata
  apiVersion?: string;
  rateLimitRemaining?: number;
  // Performance Metrics
  processingTime?: number;
  databaseTime?: number;
  externalApiTime?: number;
  // Data Change Activities
  export interface DataActivity extends BaseActivity {
  type: 'data_change';
  // Database Context
  database?: string;
  table?: string;
  primaryKey?: string | number;
  // Change Details
  operationType: 'insert' | 'update' | 'delete' | 'bulk_update' | 'bulk_delete';
  affectedRows?: number;
  // Data Validation
  validationErrors?: string;
  businessRules?: string;
  // Performance Event Activities
  export interface PerformanceActivity extends BaseActivity {
  type: 'performance_event';
  // Performance Metrics
  metrics: {,
  responseTime?: number;
  throughput?: number;
  errorRate?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  diskIo?: number;
  networkIo?: number;
};
  // Threshold Information
  thresholds?: Record<string, number>;
  thresholdViolations?: string;
  // Performance Context
  loadLevel?: 'low' | 'medium' | 'high' | 'peak';
  concurrentUsers?: number;

// Authentication Activities

export interface AuthenticationActivity extends BaseActivity {
  type: 'authentication';
  // Authentication Method
  authMethod: 'password' | 'oauth' | 'saml' | 'mfa' | 'api_key' | 'jwt';
  // MFA Information
  mfaUsed?: boolean;
  mfaMethod?: string;
  // Device Information
  deviceId?: string;
  deviceType?: string;
  deviceFingerprint?: string;
  // Login Context
  loginAttempts?: number;
  lastSuccessfulLogin?: string;
  // Risk Assessment
  riskScore?: number; // 0-100,
  riskFactors?: string;
  // File Operation Activities
  export interface FileActivity extends BaseActivity {
  type: 'file_operation';
  // File Information
  fileName: string;,
  filePath: string;
  fileSize?: number;
  fileType?: string;
  mimeType?: string;
  // Operation Details
  operation: 'create' | 'read' | 'update' | 'delete' | 'copy' | 'move' | 'rename';
  // File Security
  filePermissions?: string;
  accessLevel?: string;
  // File Versioning
  version?: string;
  previousVersion?: string;
  // Workflow Event Activities
  export interface WorkflowActivity extends BaseActivity {
  type: 'workflow_event';
  // Workflow Information
  workflowId: string;,
  workflowName: string;
  workflowVersion: string;
  // Step Information
  stepId?: string;
  stepName?: string;
  stepType?: string;
  // Execution Context
  executionId: string;,
  executionStatus: 'started' | 'running' | 'completed' | 'failed' | 'cancelled';
  // Input/Output Data
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  // Performance Data
  stepDuration?: number;
  totalDuration?: number;
  // Union type for all activity types
  export type Activity =
  | UserActivity
  | SystemActivity
  | AdminActivity
  | SecurityActivity
  | ApiActivity
  | DataActivity
  | PerformanceActivity
  | AuthenticationActivity
  | FileActivity
  | WorkflowActivity;
  // Activity Query and Filtering
  export interface ActivityQuery {
  // Time Range
  startTime?: string;
  endTime?: string;
  // Basic Filters
  types?: ActivityType;
  severities?: ActivitySeverity;
  statuses?: ActivityStatus;
  sources?: string;
  // User Filters
  userIds?: string;
  userEmails?: string;
  userRoles?: string;
  // Resource Filters
  resourceTypes?: string;
  resourceIds?: string;
  // Text Search
  searchTerm?: string;
  searchFields?: string;
  // Metadata Filters
  metadataFilters?: Record<string, any>;
  tags?: string;
  // Pagination
  limit?: number;
  offset?: number;
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Aggregation
  aggregateBy?: string;
  // Including Relations
  include?: string;
  // Activity Aggregation Results
}
export interface ActivityAggregation {
  field: string;,
  value: any;
  count: number;,
  percentage: number;
}
export interface ActivityQueryResult {
  activities: Activity;,
  totalCount: number;
  aggregations?: Record<string, ActivityAggregation>;

  facets?: Record<string, Array<{ value: string; count: number }>>;
  executionTime: number;

// Activity Storage and Indexing
}
export interface ActivityIndex {
  id: string;,
  timestamp: string;
  type: ActivityType;
  userId?: string;
  source: string;,
  action: string;
  resourceType?: string;
  resourceId?: string;
  severity: ActivitySeverity;,
  status: ActivityStatus;
  tags: string;
  // Activity Streaming and Real-time
}
export interface ActivityStream {
  subscriptionId: string;,
  filters: ActivityQuery;
  isActive: boolean;,
  createdAt: string;
  lastActivity?: string;
}
export interface ActivityStreamEvent {
  streamId: string;,
  activity: Activity;
  timestamp: string;
  // Activity Analytics
}
export interface ActivityMetrics {
  totalActivities: number;,
  activitiesByType: Record<ActivityType, number>;
  activitiesBySeverity: Record<ActivitySeverity, number>;
  activitiesByStatus: Record<ActivityStatus, number>;
  activitiesOverTime: Array<{,
  timestamp: string;,
  count: number;
  types: Record<ActivityType, number>;
}>;
  topSources: Array<{,
  source: string;
  count: number;,
  percentage: number;
}>;
  topActions: Array<{,
  action: string;
  count: number;,
  percentage: number;
}>;
  topUsers: Array<{,
  userId: string;
  userEmail?: string;
  count: number;,
  percentage: number;
}>;
  errorRate: number;,
  averageDuration: number;
  performanceMetrics: {,
  p50: number;
  p95: number;,
  p99: number;
};

// Activity Retention and Archiving
}
export interface ActivityRetentionPolicy {
  id: string;,
  name: string;
  description: string;
  // Retention Rules
  retentionPeriod: number; // days,
  activityTypes: ActivityType;,
  severities: ActivitySeverity;
  // Archive Configuration
  archiveEnabled: boolean;
  archiveLocation?: string;
  compressionEnabled?: boolean;
  // Cleanup Configuration
  cleanupEnabled: boolean;
  cleanupSchedule?: string; // cron expression,
  // Compliance
  complianceRequirement?: string;
  legalHoldEnabled?: boolean;
  createdAt: string;,
  updatedAt: string;
  isActive: boolean;
  // Export types for external use
}
export type {
  Activity as MonitoringActivity,
  ActivityQuery as MonitoringActivityQuery,
  ActivityQueryResult as MonitoringActivityQueryResult,
  ActivityMetrics as MonitoringActivityMetrics
};

// Default configurations
export const DEFAULT_ACTIVITY_RETENTION_DAYS = 90;
export const DEFAULT_ACTIVITY_PAGE_SIZE = 50;
export const MAX_ACTIVITY_PAGE_SIZE = 1000;

// Activity type display configurations
export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  user_action: 'User Action',
  system_event: 'System Event',
  admin_action: 'Admin Action',
  security_event: 'Security Event',
  api_call: 'API Call',
  data_change: 'Data Change',
  error_event: 'Error Event',
  performance_event: 'Performance Event',
  authentication: 'Authentication',
  authorization: 'Authorization',
  file_operation: 'File Operation',
  workflow_event: 'Workflow Event',
};

export const ACTIVITY_SEVERITY_COLORS: Record<ActivitySeverity, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#65a30d',
  info: '#2563eb',
};