// Graph Comparison and Visual Diff Models
// Story 9.3.2 - Visual Diff Tool

import { z } from 'zod';

// Base comparison schemas
export const ComparisonTypeSchema = z.enum(['structural', 'semantic', 'visual']);
export const MatchTypeSchema = z.enum(['exact', 'similar', 'added', 'removed', 'modified']);
export const ViewModeSchema = z.enum(['side-by-side', 'overlay', 'unified']);
export const HighlightModeSchema = z.enum(['changes', 'additions', 'deletions', 'all']);

// Graph Comparison Snapshot Schema
export const GraphComparisonSnapshotSchema = z.object({
  id: z.string().uuid(),
  graph_id: z.string().uuid(),
  version_id: z.string().uuid(),
  
  // Hashes for quick comparison
  nodes_hash: z.string().max(64),
  edges_hash: z.string().max(64),
  structure_hash: z.string().max(64),
  
  // Indexed data for comparison
  nodes_index: z.record(z.unknown()).default({}),
  edges_index: z.record(z.unknown()).default({}),
  properties_index: z.record(z.unknown()).default({}),
  
  // Metadata
  node_count: z.number().int().min(0).default(0),
  edge_count: z.number().int().min(0).default(0),
  complexity_score: z.number().min(0).default(0),
  
  created_at: z.date()
});

// Change Summary Schema
export const ChangeSummarySchema = z.object({
  total_changes: z.number().int().min(0).default(0),
  nodes_added: z.number().int().min(0).default(0),
  nodes_removed: z.number().int().min(0).default(0),
  nodes_modified: z.number().int().min(0).default(0),
  edges_added: z.number().int().min(0).default(0),
  edges_removed: z.number().int().min(0).default(0),
  edges_modified: z.number().int().min(0).default(0),
  properties_changed: z.number().int().min(0).default(0)
});

// Node Change Schema
export const NodeChangeSchema = z.object({
  id: z.string(),
  type: z.string(),
  change_type: MatchTypeSchema,
  old_properties: z.record(z.unknown()).optional(),
  new_properties: z.record(z.unknown()).optional(),
  property_changes: z.array(z.object({
    field: z.string(),
    old_value: z.unknown(),
    new_value: z.unknown(),
    change_type: z.enum(['added', 'removed', 'modified'])
  })).default([]),
  position_changed: z.boolean().default(false),
  visual_changes: z.record(z.unknown()).default({})
});

// Edge Change Schema
export const EdgeChangeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  change_type: MatchTypeSchema,
  old_properties: z.record(z.unknown()).optional(),
  new_properties: z.record(z.unknown()).optional(),
  property_changes: z.array(z.object({
    field: z.string(),
    old_value: z.unknown(),
    new_value: z.unknown(),
    change_type: z.enum(['added', 'removed', 'modified'])
  })).default([]),
  connection_changed: z.boolean().default(false)
});

// Graph Comparison Schema
export const GraphComparisonSchema = z.object({
  id: z.string().uuid(),
  source_version_id: z.string().uuid(),
  target_version_id: z.string().uuid(),
  
  comparison_type: ComparisonTypeSchema.default('structural'),
  similarity_score: z.number().min(0).max(1),
  
  // Change arrays
  changes_summary: ChangeSummarySchema,
  added_nodes: z.array(NodeChangeSchema).default([]),
  removed_nodes: z.array(NodeChangeSchema).default([]),
  modified_nodes: z.array(NodeChangeSchema).default([]),
  added_edges: z.array(EdgeChangeSchema).default([]),
  removed_edges: z.array(EdgeChangeSchema).default([]),
  modified_edges: z.array(EdgeChangeSchema).default([]),
  
  // Detailed diff data
  node_diffs: z.record(z.unknown()).default({}),
  edge_diffs: z.record(z.unknown()).default({}),
  property_diffs: z.record(z.unknown()).default({}),
  
  // Metadata
  comparison_duration_ms: z.number().int().min(0).optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.date()
});

// Visual Diff Session Schema
export const VisualDiffSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  graph_id: z.string().uuid(),
  comparison_id: z.string().uuid().optional(),
  
  // UI state
  view_mode: ViewModeSchema.default('side-by-side'),
  highlight_mode: HighlightModeSchema.default('changes'),
  zoom_level: z.number().min(0.1).max(5.0).default(1.0),
  viewport_state: z.record(z.unknown()).default({}),
  
  // Display options
  show_unchanged: z.boolean().default(true),
  show_metadata: z.boolean().default(false),
  filter_options: z.record(z.unknown()).default({}),
  
  // Session metadata
  last_accessed: z.date(),
  expires_at: z.date(),
  created_at: z.date()
});

// Node Match Result Schema
export const NodeMatchResultSchema = z.object({
  id: z.string().uuid(),
  comparison_id: z.string().uuid(),
  
  source_node_id: z.string().optional(),
  target_node_id: z.string().optional(),
  match_type: MatchTypeSchema,
  
  confidence_score: z.number().min(0).max(1),
  match_criteria: z.record(z.unknown()).default({}),
  property_changes: z.record(z.unknown()).default({}),
  
  position_changed: z.boolean().default(false),
  visual_changes: z.record(z.unknown()).default({}),
  
  created_at: z.date()
});

// Edge Match Result Schema
export const EdgeMatchResultSchema = z.object({
  id: z.string().uuid(),
  comparison_id: z.string().uuid(),
  
  source_edge_id: z.string().optional(),
  target_edge_id: z.string().optional(),
  match_type: MatchTypeSchema,
  
  source_from_node: z.string().optional(),
  source_to_node: z.string().optional(),
  target_from_node: z.string().optional(),
  target_to_node: z.string().optional(),
  
  confidence_score: z.number().min(0).max(1),
  property_changes: z.record(z.unknown()).default({}),
  
  created_at: z.date()
});

// Request/Response schemas for API
export const CompareVersionsRequestSchema = z.object({
  source_version_id: z.string().uuid(),
  target_version_id: z.string().uuid(),
  comparison_type: ComparisonTypeSchema.optional().default('structural'),
  include_details: z.boolean().default(true)
});

export const CreateDiffSessionRequestSchema = z.object({
  graph_id: z.string().uuid(),
  source_version_id: z.string().uuid(),
  target_version_id: z.string().uuid(),
  view_mode: ViewModeSchema.optional().default('side-by-side'),
  highlight_mode: HighlightModeSchema.optional().default('changes')
});

export const UpdateDiffSessionRequestSchema = z.object({
  view_mode: ViewModeSchema.optional(),
  highlight_mode: HighlightModeSchema.optional(),
  zoom_level: z.number().min(0.1).max(5.0).optional(),
  viewport_state: z.record(z.unknown()).optional(),
  show_unchanged: z.boolean().optional(),
  show_metadata: z.boolean().optional(),
  filter_options: z.record(z.unknown()).optional()
});

// Comparison algorithm configuration
export const ComparisonConfigSchema = z.object({
  node_similarity_threshold: z.number().min(0).max(1).default(0.8),
  edge_similarity_threshold: z.number().min(0).max(1).default(0.9),
  structural_weight: z.number().min(0).max(1).default(0.6),
  semantic_weight: z.number().min(0).max(1).default(0.3),
  visual_weight: z.number().min(0).max(1).default(0.1),
  max_comparison_time_ms: z.number().int().min(100).default(30000),
  enable_caching: z.boolean().default(true),
  cache_ttl_hours: z.number().int().min(1).default(24)
});

// Type exports
export type GraphComparisonSnapshot = z.infer<typeof GraphComparisonSnapshotSchema>;
export type GraphComparison = z.infer<typeof GraphComparisonSchema>;
export type VisualDiffSession = z.infer<typeof VisualDiffSessionSchema>;
export type NodeMatchResult = z.infer<typeof NodeMatchResultSchema>;
export type EdgeMatchResult = z.infer<typeof EdgeMatchResultSchema>;
export type ChangeSummary = z.infer<typeof ChangeSummarySchema>;
export type NodeChange = z.infer<typeof NodeChangeSchema>;
export type EdgeChange = z.infer<typeof EdgeChangeSchema>;
export type CompareVersionsRequest = z.infer<typeof CompareVersionsRequestSchema>;
export type CreateDiffSessionRequest = z.infer<typeof CreateDiffSessionRequestSchema>;
export type UpdateDiffSessionRequest = z.infer<typeof UpdateDiffSessionRequestSchema>;
export type ComparisonConfig = z.infer<typeof ComparisonConfigSchema>;

// Utility types
export type ComparisonType = z.infer<typeof ComparisonTypeSchema>;
export type MatchType = z.infer<typeof MatchTypeSchema>;
export type ViewMode = z.infer<typeof ViewModeSchema>;
export type HighlightMode = z.infer<typeof HighlightModeSchema>;

// Graph data for comparison
}
export interface GraphData {
  id: string;
  nodes: Array<{
    id: string;
    type: string;
}
    position: { x: number; y: number };
    data: Record<string, unknown>;
    [key: string]: unknown;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    data?: Record<string, unknown>;
    [key: string]: unknown;
  }>;
  metadata?: Record<string, unknown>;
}

// Comparison result with full details
}
export interface DetailedComparison extends GraphComparison {
  source_data: GraphData;
  target_data: GraphData;
  node_matches: NodeMatchResult[];
  edge_matches: EdgeMatchResult[];
  algorithm_metadata: {
    steps_executed: string[];
    performance_metrics: Record<string, number>;
    confidence_distribution: Record<string, number>;
  };
}

// Export all schemas for validation
export const ComparisonSchemas = {
  GraphComparisonSnapshot: GraphComparisonSnapshotSchema,
  GraphComparison: GraphComparisonSchema,
  VisualDiffSession: VisualDiffSessionSchema,
  NodeMatchResult: NodeMatchResultSchema,
  EdgeMatchResult: EdgeMatchResultSchema,
  CompareVersionsRequest: CompareVersionsRequestSchema,
  CreateDiffSessionRequest: CreateDiffSessionRequestSchema,
  UpdateDiffSessionRequest: UpdateDiffSessionRequestSchema,
  ComparisonConfig: ComparisonConfigSchema
};