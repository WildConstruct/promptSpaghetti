/**
 * Segment Service Model (Epic 17)
 * 
 * DEPLOYMENT BLOCKER FIX: Service layer models for user segment management
 * providing business logic, validation, and orchestration for segment operations.
 */
import { UserSegment, 
  UserAttributes, 
  SegmentCondition, 
  SegmentAnalytics,
  UserCohort,
  SegmentRule,
  SegmentExport }
  BehaviorEvent
 from './UserSegmentModel';

// Segment Service Configuration


export interface SegmentServiceConfig { // Performance settings
  maxSegmentSize: number;
  evaluationBatchSize: number;
  maxConcurrentEvaluations: number;
  cacheTTL: number; // seconds;
  // Real-time settings
  enableRealTimeUpdates: boolean;
  realTimeBufferSize: number;
  realTimeFlushInterval: number; // milliseconds;
  // Quality settings
  minQualityScore: number;
  autoArchiveInactiveSegments: boolean;
  inactivityThreshold: number; // days }
  // External integration
  webhookEndpoints: string;
  enableExternalSync: boolean;
  syncBatchSize: number;
  // Segment Query Interface




export interface SegmentQuery { // Basic filters
  ids?: string;
  names?: string;
  categories?: string;
  tags?: string;
  // Status filters
  isActive?: boolean;
  isDynamic?: boolean;
  isPrivate?: boolean;
  // User filters
  createdBy?: string;
  lastModifiedBy?: string;
  hasAccess?: string; // user ID to check access for }
  // Date filters
  createdAfter?: Date;
  createdBefore?: Date;
  modifiedAfter?: Date;
  modifiedBefore?: Date;
  // Size filters
  minUserCount?: number;
  maxUserCount?: number;
  // Quality filters
  minQualityScore?: number;
  hasInsights?: boolean;
  // Search
  searchTerm?: string;
  // Sorting
  sortBy?: 'name' | 'userCount' | 'createdAt' | 'lastModifiedAt' | 'qualityScore';
  sortOrder?: 'asc' | 'desc';
  // Pagination
  limit?: number;
  offset?: number;
  // Include options
  includeAnalytics?: boolean;
  includeInsights?: boolean;
  includeUserSample?: boolean;
  // Segment Operation Results




export interface SegmentOperationResult { success: boolean;
  segmentId?: string;
  affectedUserCount?: number;
  executionTime: number; // milliseconds }
  warnings: string;
  errors: string;
  metadata?: Record<string, any>;




export interface SegmentBulkOperationResult { totalSegments: number;
  successfulOperations: number;
  failedOperations: number;
  results: Array<{ }
  segmentId: string;
  operation: string;
  result: SegmentOperationResult;


>;
  executionTime: number;

// Segment Evaluation Results


export interface SegmentEvaluationResult { segmentId: string;
  evaluationId: string;
  startTime: Date;
  endTime: Date;
  // Results
  totalUsersEvaluated: number;
  matchingUsers: number;
  newMatches: number;
  removedMatches: number;
  // Performance
  evaluationTime: number; // milliseconds;
  averageUserEvaluationTime: number; // milliseconds;
  cacheHitRate: number; // percentage;
  // Quality metrics
  conditionMatchRates: Record<string, number>; // condition_id -> match_rate;
  segmentHealthScore: number;
  // Insights
  anomalies: Array<{;
  type: 'size_change' | 'performance_degradation' | 'condition_mismatch' }
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation?: string;


>;

// User Segment Membership


export interface SegmentMembership { userId: string;
  segmentId: string;
  joinedAt: Date;
  lastEvaluated: Date;
  matchScore: number; // 0-100;
  matchingConditions: string;
  // Metadata
  entryPoint: 'automatic' | 'manual' | 'import' | 'api';
  source?: string;
  tags: string;
  // Computed fields
  membershipDuration: number; // days;
  isStale: boolean; // needs re-evaluation }
  // Segment Performance Metrics




export interface SegmentPerformanceMetrics { segmentId: string;
  timeRange: { }
  start: Date;
  end: Date;


};
  // Evaluation metrics
  totalEvaluations: number;
  averageEvaluationTime: number;
  evaluationSuccessRate: number;
  // User metrics
  peakUserCount: number;
  averageUserCount: number;
  userChurnRate: number;
  userGrowthRate: number;
  // Condition performance
  conditionPerformance: Array<{ ,
  conditionId: string;
  evaluationTime: number;
  matchRate: number;
  errorRate: number }>;
  // System metrics
  memoryUsage: number; // bytes,
  cpuUsage: number; // percentage,
  cacheUsage: number; // percentage
  // Business metrics
  conversionImpact: number;
  revenueImpact: number;
  engagementImpact: number;

// Segment Recommendation Engine


export interface SegmentRecommendation { type: 'create_segment' | 'merge_segments' | 'split_segment' | 'optimize_conditions' | 'archive_segment';
  priority: 'low' | 'medium' | 'high' | 'critical';
  // Recommendation details
  title: string;
  description: string;
  rationale: string;
  expectedImpact: { }
  userCountChange?: number;
  performanceImprovement?: number;
  qualityScoreChange?: number;


};
  // Implementation
  actionable: boolean;
  automatable: boolean;
  estimatedEffort: 'low' | 'medium' | 'high';
  // Supporting data
  supportingSegments?: string;
  supportingMetrics?: Record<string, number>;
  confidence: number; // 0-1
  // Metadata
  generatedAt: Date;
  generatedBy: 'system' | 'ml_model' | 'user_request';
  modelVersion?: string;

// Segment A/B Testing Integration


export interface SegmentExperiment { id: string;
  name: string;
  description?: string;
  // Experiment configuration
  segmentId: string;
  treatmentVariants: Array<{;
  id: string;
  name: string;
  allocation: number; // percentage }
  configuration: Record<string, any>;
  isControl: boolean;


>;
  // Status and lifecycle
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled'
  startDate: Date;
  endDate?: Date;
  duration?: number; // days
  // Metrics and goals
  primaryMetric: string;
  secondaryMetrics: string;
  successCriteria: Array<{ ,
  metric: string;
  operator: 'greater_than' | 'less_than' | 'between';,
  value: number | [number, number];
  significance: number; // 0-1 }
>;
  // Results
  results?: { variants: Array<{ }
  variantId: string;
  userCount: number;
  metrics: Record<string, number>;
  conversionRate: number;
  confidence: number;
>;
    winner?: string;
    significance: number;
  liftPercentage: number;
  };
  // Metadata
  createdBy: string;
  createdAt: Date;
  lastUpdated: Date;

// Segment Data Pipeline


export interface SegmentDataPipeline { id: string;
  name: string;
  description?: string;
  // Pipeline configuration
  sourceType: 'database' | 'api' | 'file' | 'stream';
  sourceConfig: Record<string, any>;
  // Processing steps
  transformations: Array<{ }
  id: string;
  type: 'filter' | 'map' | 'aggregate' | 'join' | 'custom';
  configuration: Record<string, any>;
  order: number;


>;
  // Target segments
  targetSegments: string;
  // Execution settings
  schedule: string; // cron expression
  isActive: boolean;
  // Status and monitoring
  lastRun?: Date;
  nextRun?: Date;
  status: 'idle' | 'running' | 'failed' | 'disabled';
  // Performance
  executionHistory: Array<{ ,
  startTime: Date;
  endTime: Date;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string }>;

// Segment Compliance and Privacy


export interface SegmentComplianceConfig { // Data classification
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  // Privacy regulations
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  coppaCompliant: boolean;
  customRegulations: string;
  // Data handling
  retentionPeriod: number; // days;
  anonymizationRules: Array<{ }
  field: string;
  method: 'hash' | 'encrypt' | 'remove' | 'pseudonymize';
  parameters?: Record<string, any>;


>;
  // Consent management
  requiresConsent: boolean;
  consentTypes: string;
  consentValidation: Array<{ ,
  condition: string;
  errorMessage: string }>;
  // Audit requirements
  auditTrail: boolean;
  auditRetention: number; // days
  complianceReporting: boolean;

// Segment Validation Rules


export interface SegmentValidationRule { id: string;
  name: string;
  description: string;
  // Rule configuration
  ruleType: 'data_quality' | 'business_logic' | 'performance' | 'compliance' | 'custom';
  severity: 'warning' | 'error' | 'critical';
  // Validation logic
  validator: string; // function name or expression;
  parameters: Record<string, any>;
  // Execution settings
  runOnCreate: boolean;
  runOnUpdate: boolean;
  runOnSchedule: boolean;
  schedule?: string; // cron expression }
  // Metadata
  isActive: boolean;
  createdAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  violationCount: number;
  // Segment Integration Configuration




export interface SegmentIntegration { id: string;
  name: string;
  type: 'webhook' | 'api' | 'database' | 'message_queue' | 'custom';
  // Connection settings
  endpoint: string;
  authentication: {;
  type: 'api_key' | 'oauth' | 'basic' | 'token' | 'custom' }
  credentials: Record<string, any>;


};
  // Sync settings
  syncDirection: 'outbound' | 'inbound' | 'bidirectional'
  syncFrequency: 'realtime' | 'batch' | 'scheduled';
  batchSize?: number;
  schedule?: string; // cron expression
  // Data mapping
  fieldMappings: Array<{ ,
  sourceField: string;
  targetField: string;
  transformation?: string;
  required: boolean }>;
  // Status and monitoring
  isActive: boolean;
  lastSync?: Date;
  syncStatus: 'healthy' | 'degraded' | 'failed';,
  errorCount: number;
  // Performance
  syncHistory: Array<{ ,
  startTime: Date;
  endTime: Date;
  recordsSynced: number;
  recordsSuccessful: number;
  recordsFailed: number;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string }>;

// Service Interface


export interface IUserSegmentService { // Segment CRUD operations
  createSegment(segment: Omit<UserSegment, 'id' | 'createdAt' | 'lastModifiedAt'>): Promise<UserSegment>;
  updateSegment(id: string, updates: Partial<UserSegment>): Promise<UserSegment> }

  deleteSegment(id: string, options?: { force?: boolean }): Promise<SegmentOperationResult>;
  getSegment(id: string, options?: { includeAnalytics?: boolean }): Promise<UserSegment | null>;
  querySegments(query: SegmentQuery): Promise<{ ,
  segments: UserSegment;
  totalCount: number;
  hasMore: boolean }>;
  // Segment evaluation
  evaluateSegment(segmentId: string, options?: { userId?: string }): Promise<SegmentEvaluationResult>;
  evaluateUserForSegments(userId: string, segmentIds?: string): Promise<Record<string, boolean>>;
  // Membership management
  addUserToSegment(userId: string, segmentId: string, options?: { source?: string }): Promise<SegmentMembership>;
  removeUserFromSegment(userId: string, segmentId: string): Promise<boolean>;
  getUserSegments(userId: string): Promise<SegmentMembership>;
  getSegmentUsers(segmentId: string, options?: { limit?: number; offset?: number }): Promise<{ users: SegmentMembership;
  totalCount: number }>;
  // Analytics and insights
  getSegmentAnalytics(segmentId: string, timeRange?: { start: Date; end: Date }): Promise<SegmentAnalytics>;
  getSegmentPerformanceMetrics(segmentId: string): Promise<SegmentPerformanceMetrics>;
  generateSegmentRecommendations(segmentId?: string): Promise<SegmentRecommendation>;
  // Bulk operations
  bulkEvaluateSegments(segmentIds: string): Promise<SegmentBulkOperationResult>;
  bulkUpdateSegments(updates: Array<{ id: string; changes: Partial<UserSegment> }>): Promise<SegmentBulkOperationResult>;
  // Export and import
  exportSegment(segmentId: string, format: 'csv' | 'json', options?: { )
  includeFields?: string;
  maxRecords?: number }): Promise<SegmentExport>;
  importSegmentUsers(segmentId: string, data: any, options?: { )
  format: 'csv' | 'json' }
  mergeStrategy: 'replace' | 'append' | 'merge';
  }): Promise<SegmentOperationResult>;
  // A/B testing integration
  createExperiment(experiment: Omit<SegmentExperiment, 'id' | 'createdAt'>): Promise<SegmentExperiment>;
  getExperimentResults(experimentId: string): Promise<SegmentExperiment['results']>;
  // System operations
  optimizeSegment(segmentId: string): Promise<SegmentOperationResult>;
  validateSegment(segmentId: string): Promise<{ ,
  isValid: boolean;
  errors: string;
  warnings: string }>;
  getSystemHealth(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy' }
  metrics: Record<string, number>;
  issues: string;
>;
