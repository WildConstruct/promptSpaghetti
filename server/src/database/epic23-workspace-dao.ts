/**
 * Epic 23: Enhanced Workspace Data Access Object
 *
 * Extended DAO for collaborative workspace features, building upon
 * the existing WorkspaceDAO with real-time collaboration capabilities.
 *
 * Task: E23-1753115279521-7A79DE - Design workspace data model
 */

import { Database } from 'better-sqlite3';
import { WorkspaceDAO } from './workspace-dao';
import {
  EnhancedWorkspace,
  CollaborativeResource,
  EditSession,
  UserPresence,
  WorkspaceContext,
  DetailedResourceQuotas,
  QuotaUsageEvent,
  NotificationPreferences,
  WorkspaceIsolation,
  CreateEnhancedWorkspace,
  CreateCollaborativeResource,
  CollaborationSettings,
  ResourceQuotas,
  UsageStats,
  COLLABORATIVE_PERMISSIONS,
  createDefaultCollaborationSettings,
  createDefaultResourceQuotas,
  createEmptyUsageStats,
  hasCollaborativePermission,
} from './epic23-workspace-models';

export class Epic23WorkspaceDAO extends WorkspaceDAO {
  constructor(db: Database) {
    super(db);
  }

  // =============================================================================
  // ENHANCED WORKSPACE MANAGEMENT
  // =============================================================================

  /**
   * Create enhanced workspace with collaborative features
   */
  async createCollaborativeWorkspace(data: CreateEnhancedWorkspace, userId: string): Promise<EnhancedWorkspace> {
    const transaction = this.db.transaction(() => {
      // Create base workspace
      const baseWorkspace = this.createWorkspace(
        {
          name: data.name,
          description: data.description,
          settings: data.settings || {},
        },
        userId
      );

      // Initialize collaborative features
      const collaborationSettings = {
        ...createDefaultCollaborationSettings(),
        ...data.collaboration_settings,
      };

      const resourceQuotas = {
        ...createDefaultResourceQuotas(),
        ...data.resource_quotas,
      };

      const usageStats = createEmptyUsageStats();

      // Update workspace with collaborative data
      const updateStmt = this.db.prepare(`
        UPDATE workspaces 
        SET collaboration_settings = ?,
            resource_quotas = ?,
            usage_stats = ?,
            version = 1
        WHERE id = ?
      `);

      updateStmt.run(
        JSON.stringify(collaborationSettings),
        JSON.stringify(resourceQuotas),
        JSON.stringify(usageStats),
        baseWorkspace.id
      );

      // Create default resource quotas record
      this.createDefaultQuotas(baseWorkspace.id);

      // Create default workspace isolation
      this.createDefaultIsolation(baseWorkspace.id);

      return {
        ...baseWorkspace,
        collaboration_settings: collaborationSettings,
        resource_quotas: resourceQuotas,
        usage_stats: usageStats,
        active_sessions: 0,
        version: 1,
      };
    });

    return transaction();
  }

  /**
   * Get enhanced workspace with collaborative features
   */
  async getEnhancedWorkspace(workspaceId: string): Promise<EnhancedWorkspace | null> {
    const stmt = this.db.prepare(`
      SELECT w.*, 
             COALESCE(w.active_sessions, 0) as active_sessions,
             COALESCE(w.version, 1) as version
      FROM workspaces w
      WHERE w.id = ? AND w.archived_at IS NULL
    `);

    const row = stmt.get(workspaceId);
    if (!row) return null;

    return {
      ...row,
      collaboration_settings: JSON.parse(row.collaboration_settings || '{}'),
      resource_quotas: JSON.parse(row.resource_quotas || '{}'),
      usage_stats: JSON.parse(row.usage_stats || '{}'),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      archived_at: row.archived_at ? new Date(row.archived_at) : undefined,
      last_collaborative_activity: row.last_collaborative_activity
        ? new Date(row.last_collaborative_activity)
        : undefined,
    };
  }

  /**
   * Update workspace collaboration settings
   */
  async updateCollaborationSettings(workspaceId: string, settings: Partial<CollaborationSettings>): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE workspaces 
      SET collaboration_settings = json_patch(collaboration_settings, ?),
          updated_at = CURRENT_TIMESTAMP,
          version = version + 1
      WHERE id = ?
    `);

    stmt.run(JSON.stringify(settings), workspaceId);
  }

  /**
   * Update workspace resource quotas
   */
  async updateResourceQuotas(workspaceId: string, quotas: Partial<ResourceQuotas>): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE workspaces 
      SET resource_quotas = json_patch(resource_quotas, ?),
          updated_at = CURRENT_TIMESTAMP,
          version = version + 1
      WHERE id = ?
    `);

    stmt.run(JSON.stringify(quotas), workspaceId);
  }

  /**
   * Update workspace usage statistics
   */
  async updateUsageStats(workspaceId: string, stats: Partial<UsageStats>): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE workspaces 
      SET usage_stats = json_patch(usage_stats, ?),
          updated_at = CURRENT_TIMESTAMP,
          last_collaborative_activity = CASE 
            WHEN ? > 0 THEN CURRENT_TIMESTAMP 
            ELSE last_collaborative_activity 
          END
      WHERE id = ?
    `);

    stmt.run(JSON.stringify(stats), stats.active_sessions || 0, workspaceId);
  }

  // =============================================================================
  // EDIT SESSION MANAGEMENT
  // =============================================================================

  /**
   * Create new edit session
   */
  async createEditSession(session: Omit<EditSession, 'id'>): Promise<EditSession> {
    const stmt = this.db.prepare(`
      INSERT INTO edit_sessions 
      (resource_id, user_id, workspace_id, session_info, editing_state, collaboration_metadata, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);

    const ___sessionId = this.generateId();
    const result = stmt.get(
      session.resource_id,
      session.user_id,
      session.workspace_id,
      JSON.stringify(session.session_info),
      JSON.stringify(session.editing_state),
      JSON.stringify(session.collaboration_metadata),
      session.session_info.expires_at.toISOString()
    );

    // Update active session count
    await this.incrementActiveSessionCount(session.workspace_id, 1);

    return {
      id: result.id,
      ...session,
      session_info: JSON.parse(result.session_info),
      editing_state: JSON.parse(result.editing_state),
      collaboration_metadata: JSON.parse(result.collaboration_metadata),
    };
  }

  /**
   * Get active edit sessions for a resource
   */
  async getActiveEditSessions(resourceId: string): Promise<EditSession[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM edit_sessions 
      WHERE resource_id = ? 
        AND expires_at > CURRENT_TIMESTAMP
      ORDER BY updated_at DESC
    `);

    const rows = stmt.all(resourceId);
    return rows.map(row => ({
      id: row.id,
      resource_id: row.resource_id,
      user_id: row.user_id,
      workspace_id: row.workspace_id,
      session_info: JSON.parse(row.session_info),
      editing_state: JSON.parse(row.editing_state),
      collaboration_metadata: JSON.parse(row.collaboration_metadata),
    }));
  }

  /**
   * Get active edit sessions for a workspace
   */
  async getWorkspaceEditSessions(workspaceId: string): Promise<EditSession[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM edit_sessions 
      WHERE workspace_id = ? 
        AND expires_at > CURRENT_TIMESTAMP
      ORDER BY updated_at DESC
    `);

    const rows = stmt.all(workspaceId);
    return rows.map(row => ({
      id: row.id,
      resource_id: row.resource_id,
      user_id: row.user_id,
      workspace_id: row.workspace_id,
      session_info: JSON.parse(row.session_info),
      editing_state: JSON.parse(row.editing_state),
      collaboration_metadata: JSON.parse(row.collaboration_metadata),
    }));
  }

  /**
   * Update edit session
   */
  async updateEditSession(sessionId: string, updates: Partial<EditSession>): Promise<void> {
    const setParts = [];
    const values = [];

    if (updates.session_info) {
      setParts.push('session_info = ?');
      values.push(JSON.stringify(updates.session_info));
    }
    if (updates.editing_state) {
      setParts.push('editing_state = ?');
      values.push(JSON.stringify(updates.editing_state));
    }
    if (updates.collaboration_metadata) {
      setParts.push('collaboration_metadata = ?');
      values.push(JSON.stringify(updates.collaboration_metadata));
    }

    if (setParts.length === 0) return;

    setParts.push('updated_at = CURRENT_TIMESTAMP');
    values.push(sessionId);

    const stmt = this.db.prepare(`
      UPDATE edit_sessions 
      SET ${setParts.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
  }

  /**
   * End edit session
   */
  async endEditSession(sessionId: string): Promise<void> {
    const getStmt = this.db.prepare('SELECT workspace_id FROM edit_sessions WHERE id = ?');
    const session = getStmt.get(sessionId);

    const deleteStmt = this.db.prepare('DELETE FROM edit_sessions WHERE id = ?');
    deleteStmt.run(sessionId);

    if (session) {
      await this.incrementActiveSessionCount(session.workspace_id, -1);
    }
  }

  /**
   * Cleanup expired edit sessions
   */
  async cleanupExpiredEditSessions(): Promise<number> {
    const stmt = this.db.prepare(`
      DELETE FROM edit_sessions 
      WHERE expires_at <= CURRENT_TIMESTAMP
      RETURNING workspace_id
    `);

    const expired = stmt.all();

    // Update workspace session counts
    const workspaceCounts = new Map<string, number>();
    expired.forEach(session => {
      workspaceCounts.set(session.workspace_id, (workspaceCounts.get(session.workspace_id) || 0) + 1);
    });

    for (const [workspaceId, count] of workspaceCounts) {
      await this.incrementActiveSessionCount(workspaceId, -count);
    }

    return expired.length;
  }

  // =============================================================================
  // USER PRESENCE MANAGEMENT
  // =============================================================================

  /**
   * Update user presence in workspace
   */
  async updateUserPresence(presence: UserPresence): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO user_presence 
      (user_id, workspace_id, presence_status, current_context, collaboration_state, session_metadata, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, workspace_id) 
      DO UPDATE SET
        presence_status = excluded.presence_status,
        current_context = excluded.current_context,
        collaboration_state = excluded.collaboration_state,
        session_metadata = excluded.session_metadata,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      presence.user_id,
      presence.workspace_id,
      JSON.stringify(presence.presence_status),
      JSON.stringify(presence.current_context),
      JSON.stringify(presence.collaboration_state),
      JSON.stringify(presence.session_metadata)
    );
  }

  /**
   * Get user presence in workspace
   */
  async getUserPresence(userId: string, workspaceId: string): Promise<UserPresence | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM user_presence 
      WHERE user_id = ? AND workspace_id = ?
        AND updated_at > CURRENT_TIMESTAMP - INTERVAL '5 minutes'
    `);

    const row = stmt.get(userId, workspaceId);
    if (!row) return null;

    return {
      user_id: row.user_id,
      workspace_id: row.workspace_id,
      presence_status: JSON.parse(row.presence_status),
      current_context: JSON.parse(row.current_context || '{}'),
      collaboration_state: JSON.parse(row.collaboration_state || '{}'),
      session_metadata: JSON.parse(row.session_metadata || '{}'),
      timestamp: new Date(row.updated_at),
    };
  }

  /**
   * Get all active users in workspace
   */
  async getWorkspacePresence(workspaceId: string): Promise<UserPresence[]> {
    const stmt = this.db.prepare(`
      SELECT up.*, u.name, u.email, u.avatar
      FROM user_presence up
      JOIN users u ON up.user_id = u.id
      WHERE up.workspace_id = ?
        AND up.updated_at > CURRENT_TIMESTAMP - INTERVAL '5 minutes'
      ORDER BY up.updated_at DESC
    `);

    const rows = stmt.all(workspaceId);
    return rows.map(row => ({
      user_id: row.user_id,
      workspace_id: row.workspace_id,
      presence_status: JSON.parse(row.presence_status),
      current_context: JSON.parse(row.current_context || '{}'),
      collaboration_state: JSON.parse(row.collaboration_state || '{}'),
      session_metadata: JSON.parse(row.session_metadata || '{}'),
      timestamp: new Date(row.updated_at),
    }));
  }

  /**
   * Remove user presence (user going offline)
   */
  async removeUserPresence(userId: string, workspaceId: string): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM user_presence 
      WHERE user_id = ? AND workspace_id = ?
    `);

    stmt.run(userId, workspaceId);
  }

  // =============================================================================
  // WORKSPACE CONTEXT MANAGEMENT
  // =============================================================================

  /**
   * Update workspace context for user
   */
  async updateWorkspaceContext(context: WorkspaceContext): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO workspace_contexts 
      (workspace_id, user_id, navigation_state, collaboration_context, workspace_preferences, cache_state, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (user_id, workspace_id)
      DO UPDATE SET
        navigation_state = excluded.navigation_state,
        collaboration_context = excluded.collaboration_context,
        workspace_preferences = excluded.workspace_preferences,
        cache_state = excluded.cache_state,
        expires_at = excluded.expires_at,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      context.workspace_id,
      context.user_id,
      JSON.stringify(context.navigation_state),
      JSON.stringify(context.collaboration_context),
      JSON.stringify(context.workspace_preferences),
      JSON.stringify(context.cache_state),
      context.expires_at.toISOString()
    );
  }

  /**
   * Get workspace context for user
   */
  async getWorkspaceContext(userId: string, workspaceId: string): Promise<WorkspaceContext | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM workspace_contexts 
      WHERE user_id = ? AND workspace_id = ?
        AND expires_at > CURRENT_TIMESTAMP
    `);

    const row = stmt.get(userId, workspaceId);
    if (!row) return null;

    return {
      workspace_id: row.workspace_id,
      user_id: row.user_id,
      navigation_state: JSON.parse(row.navigation_state),
      collaboration_context: JSON.parse(row.collaboration_context || '{}'),
      workspace_preferences: JSON.parse(row.workspace_preferences || '{}'),
      cache_state: JSON.parse(row.cache_state || '{}'),
      last_updated: new Date(row.updated_at),
      expires_at: new Date(row.expires_at),
    };
  }

  // =============================================================================
  // QUOTA MANAGEMENT
  // =============================================================================

  /**
   * Get detailed resource quotas for workspace
   */
  async getDetailedResourceQuotas(workspaceId: string): Promise<DetailedResourceQuotas | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM resource_quotas WHERE workspace_id = ?
    `);

    const row = stmt.get(workspaceId);
    if (!row) return null;

    return {
      workspace_id: row.workspace_id,
      max_storage_bytes: row.max_storage_bytes,
      current_storage_bytes: row.current_storage_bytes,
      storage_warning_threshold: row.storage_warning_threshold,
      max_projects: row.max_projects,
      current_projects: row.current_projects,
      max_resources_per_project: row.max_resources_per_project,
      max_concurrent_sessions: row.max_concurrent_sessions,
      current_concurrent_sessions: row.current_concurrent_sessions,
      max_concurrent_editors_per_resource: row.max_concurrent_editors_per_resource,
      max_session_duration_minutes: row.max_session_duration_minutes,
      max_monthly_edit_hours: row.max_monthly_edit_hours,
      current_monthly_edit_hours: row.current_monthly_edit_hours,
      max_api_requests_per_hour: row.max_api_requests_per_hour,
      current_api_requests_per_hour: row.current_api_requests_per_hour,
      enforce_hard_limits: row.enforce_hard_limits,
      grace_period_hours: row.grace_period_hours,
      quota_reset_schedule: row.quota_reset_schedule,
      last_updated: new Date(row.updated_at),
      next_reset: new Date(row.next_reset),
    };
  }

  /**
   * Enforce resource quotas before operation
   */
  async enforceResourceQuotas(
    workspaceId: string,
    quotaType: keyof DetailedResourceQuotas,
    requestedUsage: number
  ): Promise<{ allowed: boolean; reason?: string; current: number; limit: number }> {
    const quotas = await this.getDetailedResourceQuotas(workspaceId);
    if (!quotas) {
      throw new Error('Resource quotas not found');
    }

    const currentKey = `current_${quotaType}` as keyof DetailedResourceQuotas;
    const maxKey = `max_${quotaType}` as keyof DetailedResourceQuotas;

    const current = quotas[currentKey] as number;
    const max = quotas[maxKey] as number;

    if (current + requestedUsage > max) {
      if (quotas.enforce_hard_limits) {
        return {
          allowed: false,
          reason: `Would exceed ${quotaType} quota: ${current + requestedUsage} > ${max}`,
          current,
          limit: max,
        };
      } else {
        // Allow with grace period
        const graceLimit = max + Math.floor((max * quotas.grace_period_hours) / 100);
        if (current + requestedUsage > graceLimit) {
          return {
            allowed: false,
            reason: `Would exceed ${quotaType} grace limit: ${current + requestedUsage} > ${graceLimit}`,
            current,
            limit: max,
          };
        }
      }
    }

    return { allowed: true, current, limit: max };
  }

  /**
   * Record quota usage event
   */
  async recordQuotaUsage(event: Omit<QuotaUsageEvent, 'id'>): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO quota_usage_events 
      (workspace_id, user_id, quota_type, usage_delta, context)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(event.workspace_id, event.user_id, event.quota_type, event.usage_delta, JSON.stringify(event.context));

    // Update current usage
    await this.updateQuotaUsage(event.workspace_id, event.quota_type, event.usage_delta);
  }

  /**
   * Update quota usage counters
   */
  private async updateQuotaUsage(workspaceId: string, quotaType: string, delta: number): Promise<void> {
    const currentField = `current_${quotaType}`;

    const stmt = this.db.prepare(`
      UPDATE resource_quotas 
      SET ${currentField} = ${currentField} + ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE workspace_id = ?
    `);

    stmt.run(delta, workspaceId);
  }

  // =============================================================================
  // COLLABORATIVE PERMISSIONS
  // =============================================================================

  /**
   * Check if user has collaborative permission
   */
  async hasCollaborativePermission(userId: string, workspaceId: string, permission: number): Promise<boolean> {
    const userPerms = await this.getUserPermissions(userId, workspaceId);
    if (!userPerms) return false;

    return hasCollaborativePermission(userPerms.permissions, permission);
  }

  /**
   * Get user's collaborative permissions in workspace
   */
  async getCollaborativePermissions(
    userId: string,
    workspaceId: string
  ): Promise<{ permissions: number; collaborative_permissions: string[] }> {
    const userPerms = await this.getUserPermissions(userId, workspaceId);
    if (!userPerms) {
      return { permissions: 0, collaborative_permissions: [] };
    }

    const collaborativePerms = [];
    for (const [permName, permValue] of Object.entries(COLLABORATIVE_PERMISSIONS)) {
      if (hasCollaborativePermission(userPerms.permissions, permValue)) {
        collaborativePerms.push(permName);
      }
    }

    return {
      permissions: userPerms.permissions,
      collaborative_permissions: collaborativePerms,
    };
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  /**
   * Create default quotas for workspace
   */
  private createDefaultQuotas(workspaceId: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO resource_quotas (workspace_id) VALUES (?)
      ON CONFLICT (workspace_id) DO NOTHING
    `);

    stmt.run(workspaceId);
  }

  /**
   * Create default isolation settings for workspace
   */
  private createDefaultIsolation(workspaceId: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO workspace_isolation (workspace_id) VALUES (?)
      ON CONFLICT (workspace_id) DO NOTHING
    `);

    stmt.run(workspaceId);
  }

  /**
   * Increment/decrement active session count
   */
  private async incrementActiveSessionCount(workspaceId: string, delta: number): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE workspaces 
      SET active_sessions = MAX(0, active_sessions + ?),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(delta, workspaceId);
  }

  /**
   * Generate unique ID (using crypto.randomUUID in production)
   */
  private generateId(): string {
    return `epic23_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
