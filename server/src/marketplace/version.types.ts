// Epic 16.2.2 Enhanced Version Management Types
import { z } from 'zod';

// Version status types
export enum VersionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived'
}

// Version visibility types
export enum VersionVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  BETA = 'beta'
}

// Compatibility types
export enum CompatibilityLevel {
  BREAKING = 'breaking',
  MAJOR = 'major',
  MINOR = 'minor',
  PATCH = 'patch'
}

// Version change types
export enum ChangeType {
  FEATURE = 'feature',
  BUGFIX = 'bugfix',
  IMPROVEMENT = 'improvement',
  SECURITY = 'security',
  BREAKING_CHANGE = 'breaking_change',
  DEPRECATION = 'deprecation',
  DOCUMENTATION = 'documentation'
}

// Enhanced template version interface
export interface EnhancedTemplateVersion {
  id: string;
  template_id: string;
  version_number: string; // Semantic versioning (e.g., "1.2.3")
  major_version: number;
  minor_version: number;
  patch_version: number;
  status: VersionStatus;
  visibility: VersionVisibility;
  claude_model: string;
  graph_json: Record<string, any>;
  prompt_yaml?: string;
  changelog_md?: string;
  hash: string;
  token_per_run_estimate: number;
  safety_score: number;
  s3_asset_key?: string;
  
  // Enhanced version management fields
  release_notes: string;
  compatibility_level: CompatibilityLevel;
  migration_guide?: string;
  deprecated_features: string[];
  new_features: string[];
  breaking_changes: string[];
  bug_fixes: string[];
  known_issues: string[];
  
  // Compatibility and dependencies
  min_claude_version?: string;
  max_claude_version?: string;
  required_features: string[];
  optional_features: string[];
  
  // Metadata
  created_by: string;
  published_at?: Date;
  deprecated_at?: Date;
  download_count: number;
  usage_stats: Record<string, any>;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
}

// Version comparison interface
export interface VersionComparison {
  from_version: EnhancedTemplateVersion;
  to_version: EnhancedTemplateVersion;
  differences: VersionDifference[];
  compatibility_impact: CompatibilityImpact;
  migration_complexity: 'simple' | 'moderate' | 'complex';
  estimated_migration_time: number; // in minutes
}

// Version difference interface
export interface VersionDifference {
  id: string;
  path: string;
  type: 'added' | 'removed' | 'modified';
  old_value?: any;
  new_value?: any;
  description: string;
  impact: 'breaking' | 'non-breaking' | 'improvement';
  category: 'structure' | 'content' | 'metadata' | 'configuration';
}

// Compatibility impact interface
export interface CompatibilityImpact {
  is_breaking: boolean;
  affected_components: string[];
  required_updates: string[];
  optional_updates: string[];
  deprecation_warnings: string[];
  risk_level: 'low' | 'medium' | 'high';
}

// Version deployment interface
export interface VersionDeployment {
  id: string;
  version_id: string;
  template_id: string;
  deployment_type: 'rollout' | 'canary' | 'blue_green' | 'immediate';
  rollout_percentage: number;
  target_audience: string[];
  deployment_status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  rollback_version_id?: string;
  deployment_config: Record<string, any>;
  success_metrics: Record<string, any>;
  deployed_by: string;
  deployed_at: Date;
  completed_at?: Date;
  rollback_at?: Date;
}

// Version analytics interface
export interface VersionAnalytics {
  version_id: string;
  period_start: Date;
  period_end: Date;
  metrics: {
    total_downloads: number;
    active_users: number;
    execution_count: number;
    error_rate: number;
    average_execution_time: number;
    satisfaction_score: number;
    adoption_rate: number;
  };
  performance_trends: Array<{
    date: string;
    downloads: number;
    executions: number;
    errors: number;
    avg_time: number;
  }>;
  user_feedback: Array<{
    rating: number;
    comment: string;
    user_id: string;
    created_at: Date;
  }>;
}

// Version rollback interface
export interface VersionRollback {
  id: string;
  template_id: string;
  from_version_id: string;
  to_version_id: string;
  rollback_reason: string;
  rollback_type: 'emergency' | 'planned' | 'issue_resolution';
  affected_users: number;
  impact_assessment: string;
  rollback_plan: string;
  verification_steps: string[];
  rollback_by: string;
  rollback_at: Date;
  completed_at?: Date;
  success: boolean;
  issues_encountered: string[];
}

// Zod schemas for validation
export const CreateVersionSchema = z.object({
  template_id: z.string().uuid(),
  version_number: z.string().regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/, 'Invalid semantic version'),
  status: z.nativeEnum(VersionStatus).default(VersionStatus.DRAFT),
  visibility: z.nativeEnum(VersionVisibility).default(VersionVisibility.PRIVATE),
  claude_model: z.string().default('claude-3-sonnet'),
  graph_json: z.record(z.any()),
  prompt_yaml: z.string().optional(),
  release_notes: z.string().min(1).max(5000),
  compatibility_level: z.nativeEnum(CompatibilityLevel),
  migration_guide: z.string().optional(),
  deprecated_features: z.array(z.string()).default([]),
  new_features: z.array(z.string()).default([]),
  breaking_changes: z.array(z.string()).default([]),
  bug_fixes: z.array(z.string()).default([]),
  known_issues: z.array(z.string()).default([]),
  min_claude_version: z.string().optional(),
  max_claude_version: z.string().optional(),
  required_features: z.array(z.string()).default([]),
  optional_features: z.array(z.string()).default([]),
  token_per_run_estimate: z.number().int().min(0).default(0),
});

export const UpdateVersionSchema = z.object({
  status: z.nativeEnum(VersionStatus).optional(),
  visibility: z.nativeEnum(VersionVisibility).optional(),
  release_notes: z.string().min(1).max(5000).optional(),
  migration_guide: z.string().optional(),
  deprecated_features: z.array(z.string()).optional(),
  new_features: z.array(z.string()).optional(),
  breaking_changes: z.array(z.string()).optional(),
  bug_fixes: z.array(z.string()).optional(),
  known_issues: z.array(z.string()).optional(),
  min_claude_version: z.string().optional(),
  max_claude_version: z.string().optional(),
  required_features: z.array(z.string()).optional(),
  optional_features: z.array(z.string()).optional(),
});

export const VersionDeploymentSchema = z.object({
  version_id: z.string().uuid(),
  deployment_type: z.enum(['rollout', 'canary', 'blue_green', 'immediate']).default('immediate'),
  rollout_percentage: z.number().min(0).max(100).default(100),
  target_audience: z.array(z.string()).default([]),
  deployment_config: z.record(z.any()).default({}),
});

export const VersionRollbackSchema = z.object({
  to_version_id: z.string().uuid(),
  rollback_reason: z.string().min(1).max(1000),
  rollback_type: z.enum(['emergency', 'planned', 'issue_resolution']),
  impact_assessment: z.string().min(1).max(2000),
  rollback_plan: z.string().min(1).max(2000),
  verification_steps: z.array(z.string()).min(1),
});

export const VersionComparisonSchema = z.object({
  from_version_id: z.string().uuid(),
  to_version_id: z.string().uuid(),
  include_content_diff: z.boolean().default(true),
  include_metadata_diff: z.boolean().default(true),
});

// Export all types
export type {
  EnhancedTemplateVersion,
  VersionComparison,
  VersionDifference,
  CompatibilityImpact,
  VersionDeployment,
  VersionAnalytics,
  VersionRollback,
};

export {
  VersionStatus,
  VersionVisibility,
  CompatibilityLevel,
  ChangeType,
  CreateVersionSchema,
  UpdateVersionSchema,
  VersionDeploymentSchema,
  VersionRollbackSchema,
  VersionComparisonSchema,
};