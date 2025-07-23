// Graph Comparison Data Access Object
// Story 9.3.2 - Visual Diff Tool

import { Database } from 'better-sqlite3';
import {
  GraphComparison,
  GraphComparisonSnapshot,
  VisualDiffSession,
  NodeMatchResult,
  EdgeMatchResult,
  CompareVersionsRequest,
  CreateDiffSessionRequest,
  UpdateDiffSessionRequest,
  DetailedComparison
} from './comparison-models.js';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface ComparisonFilter {
  graph_id?: string;
  source_version_id?: string;
  target_version_id?: string;
  comparison_type?: string;
  min_similarity?: number;
  max_similarity?: number;
  created_after?: Date;
  created_before?: Date;
  created_by?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export class ComparisonDAO {
  constructor(private db: Database) {}

  // Snapshot Management
  async createSnapshot(snapshot: Omit<GraphComparisonSnapshot, 'id' | 'created_at'>): Promise<GraphComparisonSnapshot> {
    const id = crypto.randomUUID();
    const now = new Date();

    const stmt = this.db.prepare(`
      INSERT INTO graph_comparison_snapshots (
        id, graph_id, version_id, nodes_hash, edges_hash, structure_hash,
        nodes_index, edges_index, properties_index, node_count, edge_count, complexity_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      snapshot.graph_id,
      snapshot.version_id,
      snapshot.nodes_hash,
      snapshot.edges_hash,
      snapshot.structure_hash,
      JSON.stringify(snapshot.nodes_index),
      JSON.stringify(snapshot.edges_index),
      JSON.stringify(snapshot.properties_index),
      snapshot.node_count,
      snapshot.edge_count,
      snapshot.complexity_score
    );

    return { ...snapshot, id, created_at: now };
  }

  async getSnapshot(versionId: string): Promise<GraphComparisonSnapshot | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM graph_comparison_snapshots 
      WHERE version_id = ?
    `);

    const row = stmt.get(versionId) as any;
    if (!row) return null;

    return {
      ...row,
      nodes_index: JSON.parse(row.nodes_index),
      edges_index: JSON.parse(row.edges_index),
      properties_index: JSON.parse(row.properties_index),
      created_at: new Date(row.created_at)
    };
  }

  async deleteSnapshotsForGraph(graphId: string): Promise<number> {
    const stmt = this.db.prepare(`
      DELETE FROM graph_comparison_snapshots 
      WHERE graph_id = ?
    `);
    
    const result = stmt.run(graphId);
    return result.changes;
  }

  // Comparison Management
  async createComparison(comparison: Omit<GraphComparison, 'id' | 'created_at'>): Promise<GraphComparison> {
    const id = crypto.randomUUID();
    const now = new Date();

    const stmt = this.db.prepare(`
      INSERT INTO graph_comparisons (
        id, source_version_id, target_version_id, comparison_type, similarity_score,
        changes_summary, added_nodes, removed_nodes, modified_nodes,
        added_edges, removed_edges, modified_edges,
        node_diffs, edge_diffs, property_diffs, comparison_duration_ms, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      comparison.source_version_id,
      comparison.target_version_id,
      comparison.comparison_type,
      comparison.similarity_score,
      JSON.stringify(comparison.changes_summary),
      JSON.stringify(comparison.added_nodes),
      JSON.stringify(comparison.removed_nodes),
      JSON.stringify(comparison.modified_nodes),
      JSON.stringify(comparison.added_edges),
      JSON.stringify(comparison.removed_edges),
      JSON.stringify(comparison.modified_edges),
      JSON.stringify(comparison.node_diffs),
      JSON.stringify(comparison.edge_diffs),
      JSON.stringify(comparison.property_diffs),
      comparison.comparison_duration_ms,
      comparison.created_by
    );

    return { ...comparison, id, created_at: now };
  }

  async getComparison(id: string): Promise<GraphComparison | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM graph_comparisons 
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return this.parseComparisonRow(row);
  }

  async getComparisonByVersions(
    sourceVersionId: string,
    targetVersionId: string,
    comparisonType?: string
  ): Promise<GraphComparison | null> {
    let query = `
      SELECT * FROM graph_comparisons 
      WHERE source_version_id = ? AND target_version_id = ?
    `;
    const params: unknown[] = [sourceVersionId, targetVersionId];

    if (comparisonType) {
      query += ' AND comparison_type = ?';
      params.push(comparisonType);
    }

    query += ' ORDER BY created_at DESC LIMIT 1';

    const stmt = this.db.prepare(query);
    const row = stmt.get(...params) as any;

    if (!row) return null;
    return this.parseComparisonRow(row);
  }

  async getComparisons(
    filter: ComparisonFilter = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<GraphComparison>> {
    const { page = 1, limit = 50 } = pagination;
    const offset = (page - 1) * limit;

    const whereConditions: string[] = [];
    const params: unknown[] = [];

    if (filter.source_version_id) {
      whereConditions.push('source_version_id = ?');
      params.push(filter.source_version_id);
    }

    if (filter.target_version_id) {
      whereConditions.push('target_version_id = ?');
      params.push(filter.target_version_id);
    }

    if (filter.comparison_type) {
      whereConditions.push('comparison_type = ?');
      params.push(filter.comparison_type);
    }

    if (filter.min_similarity !== undefined) {
      whereConditions.push('similarity_score >= ?');
      params.push(filter.min_similarity);
    }

    if (filter.max_similarity !== undefined) {
      whereConditions.push('similarity_score <= ?');
      params.push(filter.max_similarity);
    }

    if (filter.created_after) {
      whereConditions.push('created_at >= ?');
      params.push(filter.created_after.toISOString());
    }

    if (filter.created_before) {
      whereConditions.push('created_at <= ?');
      params.push(filter.created_before.toISOString());
    }

    if (filter.created_by) {
      whereConditions.push('created_by = ?');
      params.push(filter.created_by);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total FROM graph_comparisons ${whereClause}
    `);
    const { total } = countStmt.get(...params) as any;

    // Get paginated data
    const dataStmt = this.db.prepare(`
      SELECT * FROM graph_comparisons ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    const rows = dataStmt.all(...params, limit, offset) as any[];

    const data = rows.map(row => this.parseComparisonRow(row));

    return {
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    };
  }

  async deleteComparison(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM graph_comparisons WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Node Match Results
  async createNodeMatchResults(comparisonId: string, matches: Omit<NodeMatchResult, 'id' | 'comparison_id' | 'created_at'>[]): Promise<NodeMatchResult[]> {
    const stmt = this.db.prepare(`
      INSERT INTO node_match_results (
        id, comparison_id, source_node_id, target_node_id, match_type,
        confidence_score, match_criteria, property_changes, position_changed, visual_changes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const results: NodeMatchResult[] = [];
    const now = new Date();

    for (const match of matches) {
      const id = crypto.randomUUID();
      stmt.run(
        id,
        comparisonId,
        match.source_node_id,
        match.target_node_id,
        match.match_type,
        match.confidence_score,
        JSON.stringify(match.match_criteria),
        JSON.stringify(match.property_changes),
        match.position_changed,
        JSON.stringify(match.visual_changes)
      );

      results.push({ ...match, id, comparison_id: comparisonId, created_at: now });
    }

    return results;
  }

  async getNodeMatchResults(comparisonId: string): Promise<NodeMatchResult[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM node_match_results 
      WHERE comparison_id = ?
      ORDER BY created_at
    `);

    const rows = stmt.all(comparisonId) as any[];
    return rows.map(row => ({
      ...row,
      match_criteria: JSON.parse(row.match_criteria),
      property_changes: JSON.parse(row.property_changes),
      visual_changes: JSON.parse(row.visual_changes),
      created_at: new Date(row.created_at)
    }));
  }

  // Edge Match Results
  async createEdgeMatchResults(comparisonId: string, matches: Omit<EdgeMatchResult, 'id' | 'comparison_id' | 'created_at'>[]): Promise<EdgeMatchResult[]> {
    const stmt = this.db.prepare(`
      INSERT INTO edge_match_results (
        id, comparison_id, source_edge_id, target_edge_id, match_type,
        source_from_node, source_to_node, target_from_node, target_to_node,
        confidence_score, property_changes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const results: EdgeMatchResult[] = [];
    const now = new Date();

    for (const match of matches) {
      const id = crypto.randomUUID();
      stmt.run(
        id,
        comparisonId,
        match.source_edge_id,
        match.target_edge_id,
        match.match_type,
        match.source_from_node,
        match.source_to_node,
        match.target_from_node,
        match.target_to_node,
        match.confidence_score,
        JSON.stringify(match.property_changes)
      );

      results.push({ ...match, id, comparison_id: comparisonId, created_at: now });
    }

    return results;
  }

  async getEdgeMatchResults(comparisonId: string): Promise<EdgeMatchResult[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM edge_match_results 
      WHERE comparison_id = ?
      ORDER BY created_at
    `);

    const rows = stmt.all(comparisonId) as any[];
    return rows.map(row => ({
      ...row,
      property_changes: JSON.parse(row.property_changes),
      created_at: new Date(row.created_at)
    }));
  }

  // Visual Diff Sessions
  async createDiffSession(session: Omit<VisualDiffSession, 'id' | 'created_at' | 'last_accessed'>): Promise<VisualDiffSession> {
    const id = crypto.randomUUID();
    const now = new Date();

    const stmt = this.db.prepare(`
      INSERT INTO visual_diff_sessions (
        id, user_id, graph_id, comparison_id, view_mode, highlight_mode,
        zoom_level, viewport_state, show_unchanged, show_metadata, filter_options, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      session.user_id,
      session.graph_id,
      session.comparison_id,
      session.view_mode,
      session.highlight_mode,
      session.zoom_level,
      JSON.stringify(session.viewport_state),
      session.show_unchanged,
      session.show_metadata,
      JSON.stringify(session.filter_options),
      session.expires_at.toISOString()
    );

    return { ...session, id, created_at: now, last_accessed: now };
  }

  async getDiffSession(id: string): Promise<VisualDiffSession | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM visual_diff_sessions 
      WHERE id = ? AND expires_at > datetime('now')
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      ...row,
      viewport_state: JSON.parse(row.viewport_state),
      filter_options: JSON.parse(row.filter_options),
      last_accessed: new Date(row.last_accessed),
      expires_at: new Date(row.expires_at),
      created_at: new Date(row.created_at)
    };
  }

  async updateDiffSession(id: string, updates: Partial<VisualDiffSession>): Promise<boolean> {
    const setClause: string[] = [];
    const params: unknown[] = [];

    if (updates.view_mode) {
      setClause.push('view_mode = ?');
      params.push(updates.view_mode);
    }

    if (updates.highlight_mode) {
      setClause.push('highlight_mode = ?');
      params.push(updates.highlight_mode);
    }

    if (updates.zoom_level !== undefined) {
      setClause.push('zoom_level = ?');
      params.push(updates.zoom_level);
    }

    if (updates.viewport_state) {
      setClause.push('viewport_state = ?');
      params.push(JSON.stringify(updates.viewport_state));
    }

    if (updates.show_unchanged !== undefined) {
      setClause.push('show_unchanged = ?');
      params.push(updates.show_unchanged);
    }

    if (updates.show_metadata !== undefined) {
      setClause.push('show_metadata = ?');
      params.push(updates.show_metadata);
    }

    if (updates.filter_options) {
      setClause.push('filter_options = ?');
      params.push(JSON.stringify(updates.filter_options));
    }

    // Always update last_accessed
    setClause.push('last_accessed = datetime("now")');

    if (setClause.length === 1) return true; // Only last_accessed update

    const stmt = this.db.prepare(`
      UPDATE visual_diff_sessions 
      SET ${setClause.join(', ')}
      WHERE id = ? AND expires_at > datetime('now')
    `);

    params.push(id);
    const result = stmt.run(...params);
    return result.changes > 0;
  }

  async deleteDiffSession(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM visual_diff_sessions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async getUserDiffSessions(userId: string): Promise<VisualDiffSession[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM visual_diff_sessions 
      WHERE user_id = ? AND expires_at > datetime('now')
      ORDER BY last_accessed DESC
    `);

    const rows = stmt.all(userId) as any[];
    return rows.map(row => ({
      ...row,
      viewport_state: JSON.parse(row.viewport_state),
      filter_options: JSON.parse(row.filter_options),
      last_accessed: new Date(row.last_accessed),
      expires_at: new Date(row.expires_at),
      created_at: new Date(row.created_at)
    }));
  }

  // Cleanup Methods
  async cleanupExpiredSessions(): Promise<number> {
    const stmt = this.db.prepare(`
      DELETE FROM visual_diff_sessions 
      WHERE expires_at <= datetime('now')
    `);
    
    const result = stmt.run();
    return result.changes;
  }

  async getComparisonStatistics(graphId?: string): Promise<{
    total_comparisons: number;
    avg_similarity: number;
    comparison_types: Record<string, number>;
    recent_comparisons: number;
  }> {
    let whereClause = '';
    const params: unknown[] = [];

    if (graphId) {
      whereClause = `
        WHERE source_version_id IN (
          SELECT id FROM graph_versions WHERE graph_id = ?
        )
      `;
      params.push(graphId);
    }

    const totalStmt = this.db.prepare(`
      SELECT COUNT(*) as total FROM graph_comparisons ${whereClause}
    `);
    const { total } = totalStmt.get(...params) as any;

    const avgStmt = this.db.prepare(`
      SELECT AVG(similarity_score) as avg_similarity FROM graph_comparisons ${whereClause}
    `);
    const { avg_similarity } = avgStmt.get(...params) as any;

    const typesStmt = this.db.prepare(`
      SELECT comparison_type, COUNT(*) as count 
      FROM graph_comparisons ${whereClause}
      GROUP BY comparison_type
    `);
    const typeRows = typesStmt.all(...params) as any[];
    const comparison_types: Record<string, number> = {};
    typeRows.forEach(row => {
      comparison_types[row.comparison_type] = row.count;
    });

    const recentStmt = this.db.prepare(`
      SELECT COUNT(*) as recent 
      FROM graph_comparisons 
      ${whereClause}${whereClause ? ' AND' : 'WHERE'} created_at >= datetime('now', '-7 days')
    `);
    const { recent } = recentStmt.get(...params) as any;

    return {
      total_comparisons: total || 0,
      avg_similarity: avg_similarity || 0,
      comparison_types,
      recent_comparisons: recent || 0
    };
  }

  // Utility method to parse comparison row
  private parseComparisonRow(row: unknown): GraphComparison {
    return {
      ...row,
      changes_summary: JSON.parse(row.changes_summary),
      added_nodes: JSON.parse(row.added_nodes),
      removed_nodes: JSON.parse(row.removed_nodes),
      modified_nodes: JSON.parse(row.modified_nodes),
      added_edges: JSON.parse(row.added_edges),
      removed_edges: JSON.parse(row.removed_edges),
      modified_edges: JSON.parse(row.modified_edges),
      node_diffs: JSON.parse(row.node_diffs),
      edge_diffs: JSON.parse(row.edge_diffs),
      property_diffs: JSON.parse(row.property_diffs),
      created_at: new Date(row.created_at)
    };
  }
}