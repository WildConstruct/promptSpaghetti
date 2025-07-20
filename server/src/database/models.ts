import { z } from 'zod';

// Base model interfaces matching the database schema

export interface User {
  id: number;
  username: string;
  email?: string;
  created_at: string;
  updated_at: string;
  settings: string; // JSON string
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface CorrectionRule {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  find_pattern: string;
  replace_with: string;
  is_regex: boolean;
  is_active: boolean;
  priority: number;
  
  // Ownership and scope
  user_id: number;
  project_id?: number;
  scope: 'global' | 'project' | 'private';
  
  // Versioning
  version: number;
  parent_rule_id?: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  
  // Performance and validation
  validation_status: 'valid' | 'invalid' | 'warning';
  validation_message?: string;
  last_used_at?: string;
  
  // Workflow state management
  workflow_state: 'draft' | 'published' | 'deprecated';
  approved_by?: number;
  approved_at?: string;
  deprecated_at?: string;
  deprecation_reason?: string;
  
  // Workflow suggestion fields
  suggested_by?: string;
  suggestion_reason?: string;
  suggestion_date?: string;
  
  // Categorization and tagging
  category?: string;
  tags?: string; // JSON array as string
  
  // Usage tracking
  usage_count: number;
  effectiveness_score: number;
  user_rating?: number;
}

export interface CorrectionRuleHistory {
  id: number;
  rule_id: number;
  rule_uuid: string;
  
  // Snapshot of rule at this point in time
  name: string;
  description?: string;
  find_pattern: string;
  replace_with: string;
  is_regex: boolean;
  is_active: boolean;
  priority: number;
  
  // Change metadata
  change_type: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
  change_summary?: string;
  changed_by: number;
  changed_at: string;
  
  // Performance tracking
  performance_impact?: number;
}

export interface CorrectionStatistics {
  id: number;
  rule_id: number;
  rule_uuid: string;
  
  // Usage metrics
  application_count: number;
  character_count_before: number;
  character_count_after: number;
  execution_time_ms: number;
  
  // Effectiveness metrics
  success_rate: number;
  error_count: number;
  last_error_message?: string;
  
  // Enhanced effectiveness metrics
  quality_score: number; // 0-100 score based on text improvement
  impact_rating: number; // 1-5 rating of correction significance
  false_positive_count: number; // Track incorrect applications
  user_feedback_score?: number; // Optional user rating
  
  // Performance metrics
  avg_characters_saved: number; // Average text reduction/expansion
  complexity_score: number; // Regex complexity rating
  
  // Time-based aggregation
  date_bucket: string;
  hour_bucket: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface CorrectionSet {
  id: number;
  name: string;
  description?: string;
  version: string;
  
  // Ownership
  created_by: number;
  
  // Export/Import metadata
  export_format: 'json' | 'yaml' | 'csv';
  export_data?: string;
  checksum?: string;
  
  // Sharing and collaboration
  is_public: boolean;
  download_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CorrectionSetRule {
  id: number;
  set_id: number;
  rule_id: number;
  
  // Rule configuration within set
  order_index: number;
  is_included: boolean;
  
  created_at: string;
}

export interface UserPreferences {
  id: number;
  user_id: number;
  
  // UI preferences
  corrections_enabled: boolean;
  auto_apply_corrections: boolean;
  show_correction_preview: boolean;
  
  // Performance preferences
  max_rules_per_execution: number;
  timeout_ms: number;
  
  // Notification preferences
  notify_on_rule_conflicts: boolean;
  notify_on_performance_issues: boolean;
  
  // Advanced settings
  advanced_settings: string; // JSON string
  
  created_at: string;
  updated_at: string;
}

// Zod schemas for validation
export const CreateCorrectionRuleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  find_pattern: z.string().min(1),
  replace_with: z.string(),
  is_regex: z.boolean().default(false),
  is_active: z.boolean().default(true),
  priority: z.number().int().min(0).default(0),
  user_id: z.number().int().positive().default(1),
  project_id: z.number().int().positive().optional(),
  scope: z.enum(['global', 'project', 'private']).default('private'),
  
  // Workflow fields
  workflow_state: z.enum(['draft', 'published', 'deprecated']).default('draft'),
  suggested_by: z.string().optional(),
  suggestion_reason: z.string().optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional() // Will be JSON stringified
});

export const UpdateCorrectionRuleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  find_pattern: z.string().min(1).optional(),
  replace_with: z.string().optional(),
  is_regex: z.boolean().optional(),
  is_active: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
  scope: z.enum(['global', 'project', 'private']).optional(),
  validation_status: z.enum(['valid', 'invalid', 'warning']).optional(),
  validation_message: z.string().optional(),
  
  // Workflow fields
  workflow_state: z.enum(['draft', 'published', 'deprecated']).optional(),
  deprecation_reason: z.string().optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(), // Will be JSON stringified
  user_rating: z.number().min(0).max(5).optional()
});

export const CreateCorrectionSetSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  created_by: z.number().int().positive().default(1),
  export_format: z.enum(['json', 'yaml', 'csv']).default('json'),
  is_public: z.boolean().default(false)
});

export const UpdateUserPreferencesSchema = z.object({
  corrections_enabled: z.boolean().optional(),
  auto_apply_corrections: z.boolean().optional(),
  show_correction_preview: z.boolean().optional(),
  max_rules_per_execution: z.number().int().min(1).max(1000).optional(),
  timeout_ms: z.number().int().min(100).max(30000).optional(),
  notify_on_rule_conflicts: z.boolean().optional(),
  notify_on_performance_issues: z.boolean().optional(),
  advanced_settings: z.string().optional()
});

// Workflow operation schemas
export const ApproveRuleSchema = z.object({
  rule_id: z.number().int().positive(),
  approved_by: z.number().int().positive(),
  comment: z.string().optional()
});

export const DeprecateRuleSchema = z.object({
  rule_id: z.number().int().positive(),
  deprecated_by: z.number().int().positive(),
  reason: z.string().min(1)
});

export const CreateNotificationSchema = z.object({
  user_id: z.number().int().positive(),
  rule_id: z.number().int().positive().optional(),
  notification_type: z.string().min(1),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  action_url: z.string().url().optional(),
  metadata: z.object({}).passthrough().optional()
});

// Type definitions for API
export type CreateCorrectionRuleInput = z.infer<typeof CreateCorrectionRuleSchema>;
export type UpdateCorrectionRuleInput = z.infer<typeof UpdateCorrectionRuleSchema>;
export type CreateCorrectionSetInput = z.infer<typeof CreateCorrectionSetSchema>;
export type UpdateUserPreferencesInput = z.infer<typeof UpdateUserPreferencesSchema>;
export type ApproveRuleInput = z.infer<typeof ApproveRuleSchema>;
export type DeprecateRuleInput = z.infer<typeof DeprecateRuleSchema>;
export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;

// Statistics aggregation types
export interface RuleUsageStats {
  rule_id: number;
  rule_name: string;
  total_applications: number;
  total_characters_processed: number;
  average_execution_time: number;
  success_rate: number;
  last_used: string;
  
  // Enhanced effectiveness metrics
  quality_score: number;
  impact_rating: number;
  false_positive_rate: number;
  user_feedback_score?: number;
  avg_characters_saved: number;
  complexity_score: number;
  
  // Trend indicators
  usage_trend: 'increasing' | 'decreasing' | 'stable';
  performance_trend: 'improving' | 'degrading' | 'stable';
}

export interface PerformanceMetrics {
  total_rules: number;
  active_rules: number;
  total_executions: number;
  average_execution_time: number;
  error_rate: number;
  most_used_rules: RuleUsageStats[];
  performance_trends: {
    date: string;
    executions: number;
    avg_time: number;
    error_count: number;
    quality_score: number;
    impact_rating: number;
  }[];
  
  // Enhanced system metrics
  overall_quality_score: number;
  average_impact_rating: number;
  total_characters_saved: number;
  false_positive_rate: number;
  user_satisfaction_score?: number;
  
  // Rule effectiveness distribution
  high_impact_rules: number; // Rules with impact_rating >= 4
  medium_impact_rules: number; // Rules with impact_rating 2-3
  low_impact_rules: number; // Rules with impact_rating <= 1
  
  // Performance categories
  fast_rules: number; // Rules with avg_time < 10ms
  slow_rules: number; // Rules with avg_time > 100ms
  
  // Quality distribution
  excellent_rules: number; // Rules with quality_score >= 80
  good_rules: number; // Rules with quality_score 60-79
  poor_rules: number; // Rules with quality_score < 60
}

// Workflow state history tracking
export interface WorkflowStateHistory {
  id: number;
  rule_id: number;
  previous_state?: 'draft' | 'published' | 'deprecated';
  new_state: 'draft' | 'published' | 'deprecated';
  changed_by: number;
  changed_at: string;
  change_reason?: string;
  metadata?: string; // JSON string
}

// Workflow notifications
export interface WorkflowNotification {
  id: number;
  user_id: number;
  rule_id?: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  metadata?: string; // JSON string
  created_at: string;
  read_at?: string;
}

// Migration tracking
export interface Migration {
  id: number;
  version: string;
  applied_at: string;
}

// Database health metrics
export interface DatabaseHealth {
  is_healthy: boolean;
  total_rules: number;
  active_rules: number;
  database_size: number;
  last_backup?: string;
  performance_metrics?: PerformanceMetrics;
}