// Epic 17.1 - Feature Toggle System Data Access Layer

import { Pool } from 'pg';
import {
  FeatureToggle,
  ToggleScope,
  ToggleAudit,
  ToggleEvaluationCache,
  ToggleDependency,
  ToggleType,
  ClaudeImpact,
  ToggleAuditAction,
  CreateToggleRequest,
  UpdateToggleRequest,
  CreateToggleScopeRequest,
  EmergencyOverrideRequest,
  ToggleMetrics,
  ToggleHealthStatus,
  DependencyAnalysis,
  ToggleSnapshot
} from './feature-toggle-models';

export class FeatureToggleDAO {
  constructor(private pool: Pool) {}

  // Feature Toggle CRUD Operations

  async createToggle(request: CreateToggleRequest, createdBy?: string): Promise<FeatureToggle> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO feature_toggle (
          key, name, description, type, value, org_id, claude_compat, claude_impact, enabled, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      
      const values = [
        request.key,
        request.name,
        request.description,
        request.type,
        JSON.stringify(request.value),
        request.orgId,
        request.claudeCompat || [],
        request.claudeImpact || ClaudeImpact.NONE,
        request.enabled || false,
        createdBy
      ];

      const result = await client.query(query, values);
      return this.mapToggleFromDB(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getToggleById(id: string): Promise<FeatureToggle | null> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM feature_toggle WHERE id = $1 AND archived = false';
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapToggleFromDB(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getToggleByKey(key: string, orgId?: string): Promise<FeatureToggle | null> {
    const client = await this.pool.connect();
    try {
      let query = 'SELECT * FROM feature_toggle WHERE key = $1 AND archived = false';
      const values: unknown[] = [key];

      if (orgId) {
        query += ' AND (org_id = $2 OR org_id IS NULL) ORDER BY org_id DESC NULLS LAST LIMIT 1';
        values.push(orgId);
      } else {
        query += ' AND org_id IS NULL';
      }

      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapToggleFromDB(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async listToggles(options: {
    orgId?: string;
    enabled?: boolean;
    type?: ToggleType;
    claudeImpact?: ClaudeImpact;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ toggles: FeatureToggle[]; total: number }> {
    const client = await this.pool.connect();
    try {
      const whereConditions = ['archived = false'];
      const values: unknown[] = [];
      let paramIndex = 1;

      // Build WHERE conditions
      if (options.orgId !== undefined) {
        if (options.orgId) {
          whereConditions.push(`(org_id = $${paramIndex} OR org_id IS NULL)`);
          values.push(options.orgId);
        } else {
          whereConditions.push('org_id IS NULL');
        }
        paramIndex++;
      }

      if (options.enabled !== undefined) {
        whereConditions.push(`enabled = $${paramIndex}`);
        values.push(options.enabled);
        paramIndex++;
      }

      if (options.type) {
        whereConditions.push(`type = $${paramIndex}`);
        values.push(options.type);
        paramIndex++;
      }

      if (options.claudeImpact) {
        whereConditions.push(`claude_impact = $${paramIndex}`);
        values.push(options.claudeImpact);
        paramIndex++;
      }

      if (options.search) {
        whereConditions.push(`(key ILIKE $${paramIndex} OR name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
        values.push(`%${options.search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count total
      const countQuery = `SELECT COUNT(*) FROM feature_toggle ${whereClause}`;
      const countResult = await client.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      // Get paginated results
      const query = `
        SELECT * FROM feature_toggle 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      values.push(options.limit || 50, options.offset || 0);
      const result = await client.query(query, values);

      const toggles = result.rows.map(row => this.mapToggleFromDB(row));

      return { toggles, total };
    } finally {
      client.release();
    }
  }

  async updateToggle(request: UpdateToggleRequest, updatedBy?: string): Promise<FeatureToggle> {
    const client = await this.pool.connect();
    try {
      const setClause: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      // Build SET clause dynamically
      if (request.name !== undefined) {
        setClause.push(`name = $${paramIndex}`);
        values.push(request.name);
        paramIndex++;
      }

      if (request.description !== undefined) {
        setClause.push(`description = $${paramIndex}`);
        values.push(request.description);
        paramIndex++;
      }

      if (request.value !== undefined) {
        setClause.push(`value = $${paramIndex}`);
        values.push(JSON.stringify(request.value));
        paramIndex++;
      }

      if (request.enabled !== undefined) {
        setClause.push(`enabled = $${paramIndex}`);
        values.push(request.enabled);
        paramIndex++;
      }

      if (request.claudeCompat !== undefined) {
        setClause.push(`claude_compat = $${paramIndex}`);
        values.push(request.claudeCompat);
        paramIndex++;
      }

      if (request.claudeImpact !== undefined) {
        setClause.push(`claude_impact = $${paramIndex}`);
        values.push(request.claudeImpact);
        paramIndex++;
      }

      if (updatedBy) {
        setClause.push(`updated_by = $${paramIndex}`);
        values.push(updatedBy);
        paramIndex++;
      }

      if (setClause.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(request.id);
      const query = `
        UPDATE feature_toggle 
        SET ${setClause.join(', ')}
        WHERE id = $${paramIndex} AND archived = false
        RETURNING *
      `;

      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Toggle not found or already archived');
      }

      return this.mapToggleFromDB(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async archiveToggle(id: string, archivedBy?: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      const query = `
        UPDATE feature_toggle 
        SET archived = true, enabled = false, updated_by = $2
        WHERE id = $1 AND archived = false
      `;
      
      const result = await client.query(query, [id, archivedBy]);
      
      if (result.rowCount === 0) {
        throw new Error('Toggle not found or already archived');
      }
    } finally {
      client.release();
    }
  }

  // Toggle Scope Operations

  async createToggleScope(request: CreateToggleScopeRequest): Promise<ToggleScope> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO toggle_scope (toggle_id, rule, priority)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const values = [
        request.toggleId,
        JSON.stringify(request.rule),
        request.priority || 100
      ];

      const result = await client.query(query, values);
      return this.mapScopeFromDB(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getToggleScopes(toggleId: string): Promise<ToggleScope[]> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT * FROM toggle_scope 
        WHERE toggle_id = $1 
        ORDER BY priority ASC, created_at ASC
      `;
      
      const result = await client.query(query, [toggleId]);
      return result.rows.map(row => this.mapScopeFromDB(row));
    } finally {
      client.release();
    }
  }

  async deleteToggleScope(id: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      const query = 'DELETE FROM toggle_scope WHERE id = $1';
      const result = await client.query(query, [id]);
      
      if (result.rowCount === 0) {
        throw new Error('Toggle scope not found');
      }
    } finally {
      client.release();
    }
  }

  // Audit Operations

  async createAuditEntry(entry: Partial<ToggleAudit>): Promise<ToggleAudit> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO toggle_audit (
          toggle_id, actor_id, action, before_value, after_value, 
          reason, metadata, is_emergency, ttl_expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const values = [
        entry.toggleId,
        entry.actorId,
        entry.action,
        entry.beforeValue ? JSON.stringify(entry.beforeValue) : null,
        entry.afterValue ? JSON.stringify(entry.afterValue) : null,
        entry.reason,
        JSON.stringify(entry.metadata || {}),
        entry.isEmergency || false,
        entry.ttlExpiresAt
      ];

      const result = await client.query(query, values);
      return this.mapAuditFromDB(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getToggleAuditHistory(toggleId: string, limit = 100): Promise<ToggleAudit[]> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT * FROM toggle_audit 
        WHERE toggle_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `;
      
      const result = await client.query(query, [toggleId, limit]);
      return result.rows.map(row => this.mapAuditFromDB(row));
    } finally {
      client.release();
    }
  }

  // Emergency Override

  async createEmergencyOverride(request: EmergencyOverrideRequest, actorId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get current toggle state
      const toggle = await this.getToggleById(request.toggleId);
      if (!toggle) {
        throw new Error('Toggle not found');
      }

      const newEnabled = request.action === 'enable';
      const ttlExpiresAt = request.ttlMinutes 
        ? new Date(Date.now() + request.ttlMinutes * 60000) 
        : null;

      // Update toggle
      await client.query(
        'UPDATE feature_toggle SET enabled = $1, updated_by = $2 WHERE id = $3',
        [newEnabled, actorId, request.toggleId]
      );

      // Create audit entry
      await client.query(`
        INSERT INTO toggle_audit (
          toggle_id, actor_id, action, before_value, after_value, 
          reason, is_emergency, ttl_expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        request.toggleId,
        actorId,
        ToggleAuditAction.OVERRIDE,
        JSON.stringify({ enabled: toggle.enabled }),
        JSON.stringify({ enabled: newEnabled }),
        request.reason,
        true,
        ttlExpiresAt
      ]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Cache Operations

  async getCachedEvaluation(toggleId: string, cacheKey: string): Promise<any | null> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT result FROM toggle_evaluation_cache 
        WHERE toggle_id = $1 AND cache_key = $2 AND expires_at > CURRENT_TIMESTAMP
      `;
      
      const result = await client.query(query, [toggleId, cacheKey]);
      return result.rows.length > 0 ? result.rows[0].result : null;
    } finally {
      client.release();
    }
  }

  async setCachedEvaluation(
    toggleId: string,
    cacheKey: string,
    result: Record<string,
    unknown>,
    ttlSeconds = 300
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      
      const query = `
        INSERT INTO toggle_evaluation_cache (toggle_id, cache_key, result, expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (toggle_id, cache_key) 
        DO UPDATE SET result = $3, expires_at = $4, created_at = CURRENT_TIMESTAMP
      `;
      
      await client.query(query, [toggleId, cacheKey, JSON.stringify(result), expiresAt]);
    } finally {
      client.release();
    }
  }

  async clearCacheForToggle(toggleId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('DELETE FROM toggle_evaluation_cache WHERE toggle_id = $1', [toggleId]);
    } finally {
      client.release();
    }
  }

  // Dependencies

  async createDependency(parentToggleId: string, childToggleId: string, type: string): Promise<ToggleDependency> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO toggle_dependency (parent_toggle_id, child_toggle_id, dependency_type)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const result = await client.query(query, [parentToggleId, childToggleId, type]);
      return this.mapDependencyFromDB(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getDependencyAnalysis(toggleId: string): Promise<DependencyAnalysis> {
    const client = await this.pool.connect();
    try {
      // Get dependencies (what this toggle depends on)
      const depsQuery = `
        SELECT child_toggle_id, dependency_type 
        FROM toggle_dependency 
        WHERE parent_toggle_id = $1
      `;
      const depsResult = await client.query(depsQuery, [toggleId]);

      // Get dependents (what depends on this toggle)
      const dependentsQuery = `
        SELECT parent_toggle_id, dependency_type 
        FROM toggle_dependency 
        WHERE child_toggle_id = $1
      `;
      const dependentsResult = await client.query(dependentsQuery, [toggleId]);

      const dependencies = {
        requires: depsResult.rows.filter(r => r.dependency_type === 'requires').map(r => r.child_toggle_id),
        conflicts: depsResult.rows.filter(r => r.dependency_type === 'conflicts').map(r => r.child_toggle_id),
        suggests: depsResult.rows.filter(r => r.dependency_type === 'suggests').map(r => r.child_toggle_id)
      };

      const dependents = {
        requiredBy: dependentsResult.rows.filter(r => r.dependency_type === 'requires').map(r => r.parent_toggle_id),
        conflictsWith: dependentsResult.rows.filter(r => r.dependency_type === 'conflicts').map(r => r.parent_toggle_id),
        suggestedBy: dependentsResult.rows.filter(r => r.dependency_type === 'suggests').map(r => r.parent_toggle_id)
      };

      const impactRadius = Math.max(
        dependencies.requires.length + dependencies.conflicts.length,
        dependents.requiredBy.length + dependents.conflictsWith.length
      );

      return {
        toggleId,
        dependencies,
        dependents,
        impactRadius
      };
    } finally {
      client.release();
    }
  }

  // Utility methods

  private mapToggleFromDB(row: unknown): FeatureToggle {
    return {
      id: row.id,
      key: row.key,
      name: row.name,
      description: row.description,
      type: row.type as ToggleType,
      value: row.value,
      orgId: row.org_id,
      claudeCompat: row.claude_compat || [],
      claudeImpact: row.claude_impact as ClaudeImpact,
      enabled: row.enabled,
      archived: row.archived,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      version: row.version
    };
  }

  private mapScopeFromDB(row: unknown): ToggleScope {
    return {
      id: row.id,
      toggleId: row.toggle_id,
      rule: row.rule,
      priority: row.priority,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapAuditFromDB(row: unknown): ToggleAudit {
    return {
      id: row.id,
      toggleId: row.toggle_id,
      actorId: row.actor_id,
      action: row.action as ToggleAuditAction,
      beforeValue: row.before_value,
      afterValue: row.after_value,
      reason: row.reason,
      metadata: row.metadata || {},
      isEmergency: row.is_emergency,
      ttlExpiresAt: row.ttl_expires_at ? new Date(row.ttl_expires_at) : undefined,
      createdAt: new Date(row.created_at)
    };
  }

  private mapDependencyFromDB(row: unknown): ToggleDependency {
    return {
      id: row.id,
      parentToggleId: row.parent_toggle_id,
      childToggleId: row.child_toggle_id,
      dependencyType: row.dependency_type as 'requires' | 'conflicts' | 'suggests',
      createdAt: new Date(row.created_at)
    };
  }
}