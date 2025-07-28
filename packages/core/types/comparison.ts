// TypeScript types for visual diff and comparison system
// Story 9.3.2 - Visual Diff Tool

// Base comparison types
export type ComparisonType = 'structural' | 'semantic' | 'visual';
export type MatchType = 'exact' | 'similar' | 'added' | 'removed' | 'modified';
export type ViewMode = 'side-by-side' | 'overlay' | 'unified';
export type HighlightMode = 'changes' | 'additions' | 'deletions' | 'all';

// Graph data structure for comparison
export interface GraphData {
  id: string;
  nodes: Array<{,
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
    [key: string]: unknown;
  }>;
  edges: Array<{,
    id: string;
    source: string;
    target: string;
    data?: Record<string, unknown>;
    [key: string]: unknown;
  }>;
  metadata?: Record<string, unknown>;
}

// Change summary
export interface ChangeSummary {
  total_changes: number;
  nodes_added: number;
  nodes_removed: number;
  nodes_modified: number;
  edges_added: number;
  edges_removed: number;
  edges_modified: number;
  properties_changed: number;
}

// Node and edge changes
export interface NodeChange {
  id: string;
  type: string;
  change_type: MatchType;
  old_properties?: Record<string, unknown>;
  new_properties?: Record<string, unknown>;
  property_changes: Array<{,
    field: string;
    old_value: unknown;
    new_value: unknown;
    change_type: 'added' | 'removed' | 'modified';
  }>;
  position_changed: boolean;
  visual_changes: Record<string, unknown>;
}

export interface EdgeChange {
  id: string;
  source: string;
  target: string;
  change_type: MatchType;
  old_properties?: Record<string, unknown>;
  new_properties?: Record<string, unknown>;
  property_changes: Array<{,
    field: string;
    old_value: unknown;
    new_value: unknown;
    change_type: 'added' | 'removed' | 'modified';
  }>;
  connection_changed: boolean;
}

// Match results
export interface NodeMatchResult {
  id: string;
  comparison_id: string;
  source_node_id?: string;
  target_node_id?: string;
  match_type: MatchType;
  confidence_score: number;
  match_criteria: Record<string, unknown>;
  property_changes: Record<string, unknown>;
  position_changed: boolean;
  visual_changes: Record<string, unknown>;
  created_at: Date;
}

export interface EdgeMatchResult {
  id: string;
  comparison_id: string;
  source_edge_id?: string;
  target_edge_id?: string;
  match_type: MatchType;
  source_from_node?: string;
  source_to_node?: string;
  target_from_node?: string;
  target_to_node?: string;
  confidence_score: number;
  property_changes: Record<string, unknown>;
  created_at: Date;
}

// Main comparison result
export interface GraphComparison {
  id: string;
  source_version_id: string;
  target_version_id: string;
  comparison_type: ComparisonType;
  similarity_score: number;
  changes_summary: ChangeSummary;
  added_nodes: NodeChange[];
  removed_nodes: NodeChange[];
  modified_nodes: NodeChange[];
  added_edges: EdgeChange[];
  removed_edges: EdgeChange[];
  modified_edges: EdgeChange[];
  node_diffs: Record<string, unknown>;
  edge_diffs: Record<string, unknown>;
  property_diffs: Record<string, unknown>;
  comparison_duration_ms?: number;
  created_by?: string;
  created_at: Date;
}

// Detailed comparison with additional data
export interface DetailedComparison extends GraphComparison {
  source_data: GraphData;
  target_data: GraphData;
  node_matches: NodeMatchResult[];
  edge_matches: EdgeMatchResult[];
  algorithm_metadata: {,
    steps_executed: string[];
    performance_metrics: Record<string, number>;
    confidence_distribution: Record<string, number>;
  };
}

// Visual diff session
export interface VisualDiffSession {
  id: string;
  user_id: string;
  graph_id: string;
  comparison_id?: string;
  view_mode: ViewMode;
  highlight_mode: HighlightMode;
  zoom_level: number;
  viewport_state: Record<string, unknown>;
  show_unchanged: boolean;
  show_metadata: boolean;
  filter_options: Record<string, unknown>;
  last_accessed: Date;
  expires_at: Date;
  created_at: Date;
}

// Request/response types
export interface CompareVersionsRequest {
  source_version_id: string;
  target_version_id: string;
  comparison_type?: ComparisonType;
  include_details?: boolean;
}

export interface CreateDiffSessionRequest {
  graph_id: string;
  source_version_id: string;
  target_version_id: string;
  view_mode?: ViewMode;
  highlight_mode?: HighlightMode;
}

export interface UpdateDiffSessionRequest {
  view_mode?: ViewMode;
  highlight_mode?: HighlightMode;
  zoom_level?: number;
  viewport_state?: Record<string, unknown>;
  show_unchanged?: boolean;
  show_metadata?: boolean;
  filter_options?: Record<string, unknown>;
}

// Configuration
export interface ComparisonConfig {
  node_similarity_threshold: number;
  edge_similarity_threshold: number;
  structural_weight: number;
  semantic_weight: number;
  visual_weight: number;
  max_comparison_time_ms: number;
  enable_caching: boolean;
  cache_ttl_hours: number;
}

// Statistics
export interface ComparisonStatistics {
  total_comparisons: number;
  avg_similarity: number;
  comparison_types: Record<string, number>;
  recent_comparisons: number;
  similarity_distribution: {,
    high: number; // > 0.8
    medium: number; // 0.5 - 0.8
    low: number; // < 0.5
  };
}

// Pagination
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Filters
export interface ComparisonFilter {
  graph_id?: string;
  source_version_id?: string;
  target_version_id?: string;
  comparison_type?: ComparisonType;
  min_similarity?: number;
  max_similarity?: number;
  created_after?: Date;
  created_before?: Date;
  created_by?: string;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

// Batch comparison
export interface BatchComparisonRequest {
  comparisons: Array<{,
    source_version_id: string;
    target_version_id: string;
    comparison_type?: ComparisonType;
  }>;
}

export interface BatchComparisonResult {
  successful: Array<{,
    similarity_score: number;
    changes_summary: ChangeSummary;
    comparison_id: string;
    source_version_id: string;
    target_version_id: string;
  }>;
  failed: Array<{,
    error: string;
  }>;
  total_requested: number;
  successful_count: number;
  failed_count: number;
}

// Error types
export class ComparisonError extends Error {
  constructor()
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ComparisonError';
  }
}

export class DiffSessionError extends Error {
  constructor()
    message: string,
    public code: string,
    public sessionId?: string
  ) {
    super(message);
    this.name = 'DiffSessionError';
  }
}

// Event types for real-time updates
export interface ComparisonEvent {
  type: 'comparison_started' | 'comparison_completed' | 'comparison_failed';
  comparison_id: string;
  user_id: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export interface DiffSessionEvent {
  type: 'session_created' | 'session_updated' | 'session_expired';
  session_id: string;
  user_id: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}