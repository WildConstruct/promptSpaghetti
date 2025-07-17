/**
 * Epic 9.2.1 - Workspace Data Access Object
 * Database operations for collaborative workspace functionality
 */

import { Database } from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import {
  Workspace,
  CreateWorkspace,
  UpdateWorkspace,
  Project,
  CreateProject,
  UpdateProject,
  Resource,
  CreateResource,
  ACLRole,
  CreateACLRole,
  ACLAssignment,
  CreateACLAssignment,
  UserMembership,
  CreateUserMembership,
  ActivityEvent,
  CreateActivityEvent,
  Comment,
  CreateComment,
  UpdateComment,
  Notification,
  CreateNotification,
  WorkspaceWithMembership,
  ProjectWithStats,
  UserWithRoles,
  ActivityEventWithActorInfo,
  CommentWithReplies,
  PaginatedResult,
  PaginationOptions,
  WorkspaceFilter,
  ProjectFilter,
  ActivityEventFilter,
  CommentFilter,
  ROLE_PERMISSIONS,
} from './workspace-models';

export class WorkspaceDAO {
  constructor(private db: Database) {}

  // ====== WORKSPACE OPERATIONS ======

  async createWorkspace(data: CreateWorkspace, userId: string): Promise<Workspace> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO workspaces (id, owner_id, name, description, settings, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId,
      data.name,
      data.description || null,
      JSON.stringify(data.settings || {}),
      now,
      now
    );

    // Create default system roles for the workspace
    await this.createDefaultRoles(id);

    // Add owner as admin member
    await this.createUserMembership({
      user_id: userId,
      workspace_id: id,
    }, userId);

    const adminRole = await this.getRole(id, 'admin');
    if (adminRole) {
      await this.createACLAssignment({
        user_id: userId,
        role_id: adminRole.id,
        scope_type: 'workspace',
        scope_id: id,
      }, userId);
    }

    return this.getWorkspace(id)!;
  }

  async getWorkspace(id: string): Promise<Workspace | null> {
    const stmt = this.db.prepare(`
      SELECT id, owner_id, name, description, settings, created_at, updated_at, archived_at
      FROM workspaces
      WHERE id = ? AND archived_at IS NULL
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      ...row,
      settings: JSON.parse(row.settings || '{}'),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      archived_at: row.archived_at ? new Date(row.archived_at) : null,
    };
  }

  async getWorkspacesForUser(
    userId: string,
    filter: WorkspaceFilter = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<WorkspaceWithMembership>> {
    const { page = 1, limit = 20, sort_by = 'updated_at', sort_order = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    let whereClause = `
      WHERE w.archived_at IS NULL
      AND um.user_id = ?
      AND um.status = 'active'
    `;
    const params: any[] = [userId];

    if (filter.search) {
      whereClause += ` AND (w.name ILIKE ? OR w.description ILIKE ?)`;
      params.push(`%${filter.search}%`, `%${filter.search}%`);
    }

    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total
      FROM workspaces w
      JOIN user_memberships um ON w.id = um.workspace_id
      ${whereClause}
    `);

    const dataStmt = this.db.prepare(`
      SELECT 
        w.id, w.owner_id, w.name, w.description, w.settings, 
        w.created_at, w.updated_at, w.archived_at,
        um.id as membership_id, um.status as membership_status,
        um.joined_at, um.last_active_at,
        COALESCE(SUM(ar.permissions), 0) as role_permissions
      FROM workspaces w
      JOIN user_memberships um ON w.id = um.workspace_id
      LEFT JOIN acl_assignments aa ON aa.user_id = um.user_id 
        AND aa.scope_type = 'workspace' AND aa.scope_id = w.id
      LEFT JOIN acl_roles ar ON ar.id = aa.role_id
      ${whereClause}
      GROUP BY w.id, um.id
      ORDER BY w.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?
    `);

    const { total } = countStmt.get(...params) as { total: number };
    const rows = dataStmt.all(...params, limit, offset) as any[];

    const data: WorkspaceWithMembership[] = rows.map(row => ({
      id: row.id,
      owner_id: row.owner_id,
      name: row.name,
      description: row.description,
      settings: JSON.parse(row.settings || '{}'),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      archived_at: row.archived_at ? new Date(row.archived_at) : null,
      membership: {
        id: row.membership_id,
        user_id: userId,
        workspace_id: row.id,
        status: row.membership_status,
        invited_by: null,
        joined_at: new Date(row.joined_at),
        last_active_at: new Date(row.last_active_at),
      },
      role_permissions: row.role_permissions || 0,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page * limit < total,
        has_prev: page > 1,
      },
    };
  }

  async updateWorkspace(id: string, data: UpdateWorkspace): Promise<Workspace | null> {
    const setClause: string[] = [];
    const params: any[] = [];

    if (data.name) {
      setClause.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      setClause.push('description = ?');
      params.push(data.description);
    }
    if (data.settings) {
      setClause.push('settings = ?');
      params.push(JSON.stringify(data.settings));
    }

    if (setClause.length === 0) {
      return this.getWorkspace(id);
    }

    setClause.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE workspaces
      SET ${setClause.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...params);
    return this.getWorkspace(id);
  }

  async archiveWorkspace(id: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE workspaces
      SET archived_at = ?, updated_at = ?
      WHERE id = ? AND archived_at IS NULL
    `);

    const now = new Date().toISOString();
    const result = stmt.run(now, now, id);
    return result.changes > 0;
  }

  // ====== PROJECT OPERATIONS ======

  async createProject(data: CreateProject, userId: string): Promise<Project> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO projects (id, workspace_id, name, description, status, metadata, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.workspace_id,
      data.name,
      data.description || null,
      JSON.stringify(data.metadata || {}),
      userId,
      now,
      now
    );

    // Log activity
    await this.createActivityEvent({
      workspace_id: data.workspace_id,
      project_id: id,
      actor_id: userId,
      event_type: 'project.created',
      event_data: { project_name: data.name },
    });

    return this.getProject(id)!;
  }

  async getProject(id: string): Promise<Project | null> {
    const stmt = this.db.prepare(`
      SELECT id, workspace_id, name, description, status, metadata, created_by, created_at, updated_at
      FROM projects
      WHERE id = ? AND status != 'deleted'
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      ...row,
      metadata: JSON.parse(row.metadata || '{}'),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  async getProjectsInWorkspace(
    workspaceId: string,
    filter: ProjectFilter = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<ProjectWithStats>> {
    const { page = 1, limit = 20, sort_by = 'updated_at', sort_order = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE p.workspace_id = ? AND p.status != 'deleted'`;
    const params: any[] = [workspaceId];

    if (filter.status && filter.status.length > 0) {
      const placeholders = filter.status.map(() => '?').join(',');
      whereClause += ` AND p.status IN (${placeholders})`;
      params.push(...filter.status);
    }

    if (filter.created_by) {
      whereClause += ` AND p.created_by = ?`;
      params.push(filter.created_by);
    }

    if (filter.search) {
      whereClause += ` AND (p.name ILIKE ? OR p.description ILIKE ?)`;
      params.push(`%${filter.search}%`, `%${filter.search}%`);
    }

    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total
      FROM projects p
      ${whereClause}
    `);

    const dataStmt = this.db.prepare(`
      SELECT 
        p.id, p.workspace_id, p.name, p.description, p.status, p.metadata,
        p.created_by, p.created_at, p.updated_at,
        COUNT(DISTINCT r.id) as resource_count,
        COUNT(DISTINCT c.id) as comment_count,
        MAX(ae.created_at) as last_activity
      FROM projects p
      LEFT JOIN resources r ON r.project_id = p.id
      LEFT JOIN comments c ON c.resource_id = r.id AND c.status = 'active'
      LEFT JOIN activity_events ae ON ae.project_id = p.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?
    `);

    const { total } = countStmt.get(...params) as { total: number };
    const rows = dataStmt.all(...params, limit, offset) as any[];

    const data: ProjectWithStats[] = rows.map(row => ({
      id: row.id,
      workspace_id: row.workspace_id,
      name: row.name,
      description: row.description,
      status: row.status,
      metadata: JSON.parse(row.metadata || '{}'),
      created_by: row.created_by,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      resource_count: row.resource_count || 0,
      comment_count: row.comment_count || 0,
      last_activity: row.last_activity ? new Date(row.last_activity) : null,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page * limit < total,
        has_prev: page > 1,
      },
    };
  }

  async updateProject(id: string, data: UpdateProject, userId: string): Promise<Project | null> {
    const setClause: string[] = [];
    const params: any[] = [];

    if (data.name) {
      setClause.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      setClause.push('description = ?');
      params.push(data.description);
    }
    if (data.status) {
      setClause.push('status = ?');
      params.push(data.status);
    }
    if (data.metadata) {
      setClause.push('metadata = ?');
      params.push(JSON.stringify(data.metadata));
    }

    if (setClause.length === 0) {
      return this.getProject(id);
    }

    setClause.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE projects
      SET ${setClause.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...params);

    const project = await this.getProject(id);
    if (project) {
      // Log activity
      await this.createActivityEvent({
        workspace_id: project.workspace_id,
        project_id: id,
        actor_id: userId,
        event_type: 'project.updated',
        event_data: { changes: Object.keys(data) },
      });
    }

    return project;
  }

  // ====== RESOURCE OPERATIONS ======

  async createResource(data: CreateResource, userId: string): Promise<Resource> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO resources (
        id, project_id, name, type, content_type, json_meta, 
        storage_path, content_data, size_bytes, checksum, 
        version, created_by, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.project_id,
      data.name,
      data.type,
      data.content_type || null,
      JSON.stringify(data.json_meta || {}),
      data.storage_path || null,
      data.content_data ? JSON.stringify(data.content_data) : null,
      data.size_bytes || 0,
      data.checksum || null,
      userId,
      now,
      now
    );

    const project = await this.getProject(data.project_id);
    if (project) {
      // Log activity
      await this.createActivityEvent({
        workspace_id: project.workspace_id,
        project_id: data.project_id,
        resource_id: id,
        actor_id: userId,
        event_type: 'resource.created',
        event_data: { resource_name: data.name, resource_type: data.type },
      });
    }

    return this.getResource(id)!;
  }

  async getResource(id: string): Promise<Resource | null> {
    const stmt = this.db.prepare(`
      SELECT 
        id, project_id, name, type, content_type, json_meta,
        storage_path, content_data, size_bytes, checksum, version,
        created_by, created_at, updated_at
      FROM resources
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      ...row,
      json_meta: JSON.parse(row.json_meta || '{}'),
      content_data: row.content_data ? JSON.parse(row.content_data) : null,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  // ====== ROLE AND PERMISSION OPERATIONS ======

  private async createDefaultRoles(workspaceId: string): Promise<void> {
    const roles = [
      { name: 'admin', description: 'Full workspace access', permissions: ROLE_PERMISSIONS.ADMIN },
      { name: 'editor', description: 'Can create and edit content', permissions: ROLE_PERMISSIONS.EDITOR },
      { name: 'viewer', description: 'Read-only access', permissions: ROLE_PERMISSIONS.VIEWER },
      { name: 'commenter', description: 'Can view and comment', permissions: ROLE_PERMISSIONS.COMMENTER },
    ];

    const stmt = this.db.prepare(`
      INSERT INTO acl_roles (id, workspace_id, name, description, permissions, is_system_role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, true, ?, ?)
    `);

    const now = new Date().toISOString();
    for (const role of roles) {
      stmt.run(uuidv4(), workspaceId, role.name, role.description, role.permissions, now, now);
    }
  }

  async getRole(workspaceId: string, roleName: string): Promise<ACLRole | null> {
    const stmt = this.db.prepare(`
      SELECT id, workspace_id, name, description, permissions, is_system_role, created_at, updated_at
      FROM acl_roles
      WHERE workspace_id = ? AND name = ?
    `);

    const row = stmt.get(workspaceId, roleName) as any;
    if (!row) return null;

    return {
      ...row,
      is_system_role: Boolean(row.is_system_role),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  async createACLAssignment(data: CreateACLAssignment, grantedBy: string): Promise<ACLAssignment> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO acl_assignments (id, user_id, role_id, scope_type, scope_id, granted_by, granted_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.user_id,
      data.role_id,
      data.scope_type,
      data.scope_id,
      grantedBy,
      now,
      data.expires_at?.toISOString() || null
    );

    return {
      id,
      user_id: data.user_id,
      role_id: data.role_id,
      scope_type: data.scope_type,
      scope_id: data.scope_id,
      granted_by: grantedBy,
      granted_at: new Date(now),
      expires_at: data.expires_at || undefined,
    };
  }

  async createUserMembership(data: CreateUserMembership, invitedBy?: string): Promise<UserMembership> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO user_memberships (id, user_id, workspace_id, status, invited_by, joined_at, last_active_at)
      VALUES (?, ?, ?, 'active', ?, ?, ?)
    `);

    stmt.run(id, data.user_id, data.workspace_id, invitedBy || null, now, now);

    return {
      id,
      user_id: data.user_id,
      workspace_id: data.workspace_id,
      status: 'active',
      invited_by: invitedBy,
      joined_at: new Date(now),
      last_active_at: new Date(now),
    };
  }

  // ====== ACTIVITY OPERATIONS ======

  async createActivityEvent(data: CreateActivityEvent): Promise<ActivityEvent> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO activity_events (
        id, workspace_id, project_id, resource_id, actor_id, 
        event_type, event_data, aggregation_key, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.workspace_id,
      data.project_id || null,
      data.resource_id || null,
      data.actor_id,
      data.event_type,
      JSON.stringify(data.event_data || {}),
      data.aggregation_key || null,
      now
    );

    return {
      id,
      workspace_id: data.workspace_id,
      project_id: data.project_id,
      resource_id: data.resource_id,
      actor_id: data.actor_id,
      event_type: data.event_type,
      event_data: data.event_data || {},
      aggregation_key: data.aggregation_key,
      created_at: new Date(now),
    };
  }

  async getActivityFeed(
    workspaceId: string,
    filter: ActivityEventFilter = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<ActivityEventWithActorInfo>> {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE ae.workspace_id = ?`;
    const params: any[] = [workspaceId];

    if (filter.project_id) {
      whereClause += ` AND ae.project_id = ?`;
      params.push(filter.project_id);
    }

    if (filter.actor_id) {
      whereClause += ` AND ae.actor_id = ?`;
      params.push(filter.actor_id);
    }

    if (filter.event_types && filter.event_types.length > 0) {
      const placeholders = filter.event_types.map(() => '?').join(',');
      whereClause += ` AND ae.event_type IN (${placeholders})`;
      params.push(...filter.event_types);
    }

    if (filter.from_date) {
      whereClause += ` AND ae.created_at >= ?`;
      params.push(filter.from_date.toISOString());
    }

    if (filter.to_date) {
      whereClause += ` AND ae.created_at <= ?`;
      params.push(filter.to_date.toISOString());
    }

    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total
      FROM activity_events ae
      ${whereClause}
    `);

    const dataStmt = this.db.prepare(`
      SELECT 
        ae.id, ae.workspace_id, ae.project_id, ae.resource_id, ae.actor_id,
        ae.event_type, ae.event_data, ae.aggregation_key, ae.created_at,
        p.name as project_name,
        r.name as resource_name, r.type as resource_type
      FROM activity_events ae
      LEFT JOIN projects p ON ae.project_id = p.id
      LEFT JOIN resources r ON ae.resource_id = r.id
      ${whereClause}
      ORDER BY ae.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?
    `);

    const { total } = countStmt.get(...params) as { total: number };
    const rows = dataStmt.all(...params, limit, offset) as any[];

    const data: ActivityEventWithActorInfo[] = rows.map(row => ({
      id: row.id,
      workspace_id: row.workspace_id,
      project_id: row.project_id,
      resource_id: row.resource_id,
      actor_id: row.actor_id,
      event_type: row.event_type,
      event_data: JSON.parse(row.event_data || '{}'),
      aggregation_key: row.aggregation_key,
      created_at: new Date(row.created_at),
      actor_name: `User ${row.actor_id}`, // TODO: Get actual user name
      project_name: row.project_name,
      resource_name: row.resource_name,
      resource_type: row.resource_type,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page * limit < total,
        has_prev: page > 1,
      },
    };
  }

  async getActivityEventById(id: string): Promise<ActivityEventWithActorInfo | null> {
    const stmt = this.db.prepare(`
      SELECT 
        ae.id, ae.workspace_id, ae.project_id, ae.resource_id, ae.actor_id,
        ae.event_type, ae.event_data, ae.aggregation_key, ae.created_at,
        p.name as project_name,
        r.name as resource_name, r.type as resource_type
      FROM activity_events ae
      LEFT JOIN projects p ON ae.project_id = p.id
      LEFT JOIN resources r ON ae.resource_id = r.id
      WHERE ae.id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      workspace_id: row.workspace_id,
      project_id: row.project_id,
      resource_id: row.resource_id,
      actor_id: row.actor_id,
      event_type: row.event_type,
      event_data: JSON.parse(row.event_data || '{}'),
      aggregation_key: row.aggregation_key,
      created_at: new Date(row.created_at),
      actor_name: `User ${row.actor_id}`, // TODO: Get actual user name
      project_name: row.project_name,
      resource_name: row.resource_name,
      resource_type: row.resource_type,
    };
  }

  async getActivityEventTypes(workspaceId: string): Promise<string[]> {
    const stmt = this.db.prepare(`
      SELECT DISTINCT event_type
      FROM activity_events
      WHERE workspace_id = ?
      ORDER BY event_type
    `);

    const rows = stmt.all(workspaceId) as { event_type: string }[];
    return rows.map(row => row.event_type);
  }

  async getActivityStats(workspaceId: string, days = 30): Promise<{
    total_events: number;
    events_by_type: Record<string, number>;
    events_by_day: Array<{ date: string; count: number }>;
    most_active_users: Array<{ user_id: string; count: number }>;
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Total events
    const totalStmt = this.db.prepare(`
      SELECT COUNT(*) as total
      FROM activity_events
      WHERE workspace_id = ? AND created_at >= ?
    `);
    const { total } = totalStmt.get(workspaceId, since.toISOString()) as { total: number };

    // Events by type
    const typeStmt = this.db.prepare(`
      SELECT event_type, COUNT(*) as count
      FROM activity_events
      WHERE workspace_id = ? AND created_at >= ?
      GROUP BY event_type
      ORDER BY count DESC
    `);
    const typeRows = typeStmt.all(workspaceId, since.toISOString()) as any[];
    const eventsByType = typeRows.reduce((acc, row) => {
      acc[row.event_type] = row.count;
      return acc;
    }, {} as Record<string, number>);

    // Events by day
    const dayStmt = this.db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM activity_events
      WHERE workspace_id = ? AND created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    const dayRows = dayStmt.all(workspaceId, since.toISOString()) as any[];
    const eventsByDay = dayRows.map(row => ({
      date: row.date,
      count: row.count,
    }));

    // Most active users
    const userStmt = this.db.prepare(`
      SELECT actor_id as user_id, COUNT(*) as count
      FROM activity_events
      WHERE workspace_id = ? AND created_at >= ?
      GROUP BY actor_id
      ORDER BY count DESC
      LIMIT 10
    `);
    const userRows = userStmt.all(workspaceId, since.toISOString()) as any[];
    const mostActiveUsers = userRows.map(row => ({
      user_id: row.user_id,
      count: row.count,
    }));

    return {
      total_events: total,
      events_by_type: eventsByType,
      events_by_day: eventsByDay,
      most_active_users: mostActiveUsers,
    };
  }

  // ====== COMMENT OPERATIONS ======

  async createComment(data: CreateComment): Promise<Comment> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO comments (
        id, workspace_id, project_id, resource_id, parent_comment_id, author_id, 
        content, target_type, target_id, metadata, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.workspace_id,
      data.project_id,
      data.resource_id,
      data.parent_comment_id || null,
      data.author_id,
      data.content,
      data.target_type,
      data.target_id,
      JSON.stringify(data.metadata || {}),
      now,
      now
    );

    // Log activity
    await this.createActivityEvent({
      workspace_id: data.workspace_id,
      project_id: data.project_id,
      resource_id: data.resource_id,
      actor_id: data.author_id,
      event_type: 'comment.created',
      event_data: { 
        comment_id: id,
        target_type: data.target_type,
        target_id: data.target_id,
        content_preview: data.content.substring(0, 100)
      },
    });

    return this.getComment(id)!;
  }

  async getComment(id: string): Promise<Comment | null> {
    const stmt = this.db.prepare(`
      SELECT 
        c.id, c.workspace_id, c.project_id, c.resource_id, c.parent_comment_id,
        c.author_id, c.content, c.target_type, c.target_id, c.metadata,
        c.created_at, c.updated_at, c.deleted_at,
        u.username as author_name, u.email as author_email,
        COUNT(replies.id) as reply_count
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN comments replies ON replies.parent_comment_id = c.id AND replies.deleted_at IS NULL
      WHERE c.id = ? AND c.deleted_at IS NULL
      GROUP BY c.id
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      workspace_id: row.workspace_id,
      project_id: row.project_id,
      resource_id: row.resource_id,
      parent_comment_id: row.parent_comment_id,
      author_id: row.author_id,
      author_name: row.author_name,
      author_email: row.author_email,
      content: row.content,
      target_type: row.target_type,
      target_id: row.target_id,
      metadata: JSON.parse(row.metadata || '{}'),
      reply_count: parseInt(row.reply_count) || 0,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  async updateComment(commentId: string, userId: string, updates: UpdateComment): Promise<Comment | null> {
    // Check if user can update this comment
    const existingComment = await this.getComment(commentId);
    if (!existingComment || existingComment.author_id !== userId) {
      return null;
    }

    const { content, metadata } = updates;
    
    const stmt = this.db.prepare(`
      UPDATE comments 
      SET content = COALESCE(?, content),
          metadata = COALESCE(?, metadata),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND author_id = ? AND deleted_at IS NULL
    `);
    
    const result = stmt.run(
      content,
      metadata ? JSON.stringify(metadata) : null,
      commentId,
      userId
    );

    if (result.changes === 0) return null;

    // Log activity
    await this.createActivityEvent({
      workspace_id: existingComment.workspace_id,
      project_id: existingComment.project_id,
      resource_id: existingComment.resource_id,
      actor_id: userId,
      event_type: 'comment.updated',
      event_data: {
        comment_id: commentId,
        target_type: existingComment.target_type,
        target_id: existingComment.target_id
      },
    });

    return this.getComment(commentId);
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const existingComment = await this.getComment(commentId);
    if (!existingComment || existingComment.author_id !== userId) {
      return false;
    }

    const stmt = this.db.prepare(`
      UPDATE comments 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ? AND author_id = ? AND deleted_at IS NULL
    `);
    
    const result = stmt.run(commentId, userId);

    if (result.changes > 0) {
      // Log activity
      await this.createActivityEvent({
        workspace_id: existingComment.workspace_id,
        project_id: existingComment.project_id,
        resource_id: existingComment.resource_id,
        actor_id: userId,
        event_type: 'comment.deleted',
        event_data: {
          comment_id: commentId,
          target_type: existingComment.target_type,
          target_id: existingComment.target_id
        },
      });
    }

    return result.changes > 0;
  }

  async getCommentsByTarget(
    workspaceId: string,
    targetType: string,
    targetId: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Comment>> {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc' } = options;
    const offset = (page - 1) * limit;

    // Get top-level comments first
    const commentsSql = `
      SELECT 
        c.id, c.workspace_id, c.project_id, c.resource_id, c.parent_comment_id,
        c.author_id, c.content, c.target_type, c.target_id, c.metadata,
        c.created_at, c.updated_at,
        u.username as author_name, u.email as author_email,
        COUNT(replies.id) as reply_count
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN comments replies ON replies.parent_comment_id = c.id AND replies.deleted_at IS NULL
      WHERE c.workspace_id = ? 
        AND c.target_type = ? 
        AND c.target_id = ?
        AND c.parent_comment_id IS NULL
        AND c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    const totalSql = `
      SELECT COUNT(*) as total
      FROM comments
      WHERE workspace_id = ? 
        AND target_type = ? 
        AND target_id = ?
        AND parent_comment_id IS NULL
        AND deleted_at IS NULL
    `;

    const rows = this.db.prepare(commentsSql).all(workspaceId, targetType, targetId, limit, offset) as any[];
    const totalResult = this.db.prepare(totalSql).get(workspaceId, targetType, targetId) as any;

    const comments: Comment[] = rows.map(row => ({
      id: row.id,
      workspace_id: row.workspace_id,
      project_id: row.project_id,
      resource_id: row.resource_id,
      parent_comment_id: row.parent_comment_id,
      author_id: row.author_id,
      author_name: row.author_name,
      author_email: row.author_email,
      content: row.content,
      target_type: row.target_type,
      target_id: row.target_id,
      metadata: JSON.parse(row.metadata || '{}'),
      reply_count: parseInt(row.reply_count) || 0,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }));

    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    return {
      data: comments,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    };
  }

  async getCommentReplies(
    commentId: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Comment>> {
    const { page = 1, limit = 10, sort_by = 'created_at', sort_order = 'asc' } = options;
    const offset = (page - 1) * limit;

    const repliesSql = `
      SELECT 
        c.id, c.workspace_id, c.project_id, c.resource_id, c.parent_comment_id,
        c.author_id, c.content, c.target_type, c.target_id, c.metadata,
        c.created_at, c.updated_at,
        u.username as author_name, u.email as author_email,
        0 as reply_count
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.parent_comment_id = ? 
        AND c.deleted_at IS NULL
      ORDER BY c.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    const totalSql = `
      SELECT COUNT(*) as total
      FROM comments
      WHERE parent_comment_id = ? AND deleted_at IS NULL
    `;

    const rows = this.db.prepare(repliesSql).all(commentId, limit, offset) as any[];
    const totalResult = this.db.prepare(totalSql).get(commentId) as any;

    const replies: Comment[] = rows.map(row => ({
      id: row.id,
      workspace_id: row.workspace_id,
      project_id: row.project_id,
      resource_id: row.resource_id,
      parent_comment_id: row.parent_comment_id,
      author_id: row.author_id,
      author_name: row.author_name,
      author_email: row.author_email,
      content: row.content,
      target_type: row.target_type,
      target_id: row.target_id,
      metadata: JSON.parse(row.metadata || '{}'),
      reply_count: 0,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }));

    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    return {
      data: replies,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    };
  }

  async getCommentsByResource(
    resourceId: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Comment>> {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc' } = options;
    const offset = (page - 1) * limit;

    const commentsSql = `
      SELECT 
        c.id, c.workspace_id, c.project_id, c.resource_id, c.parent_comment_id,
        c.author_id, c.content, c.target_type, c.target_id, c.metadata,
        c.created_at, c.updated_at,
        u.username as author_name, u.email as author_email,
        COUNT(replies.id) as reply_count
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN comments replies ON replies.parent_comment_id = c.id AND replies.deleted_at IS NULL
      WHERE c.resource_id = ? 
        AND c.parent_comment_id IS NULL
        AND c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.${sort_by} ${sort_order.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    const totalSql = `
      SELECT COUNT(*) as total
      FROM comments
      WHERE resource_id = ? 
        AND parent_comment_id IS NULL
        AND deleted_at IS NULL
    `;

    const rows = this.db.prepare(commentsSql).all(resourceId, limit, offset) as any[];
    const totalResult = this.db.prepare(totalSql).get(resourceId) as any;

    const comments: Comment[] = rows.map(row => ({
      id: row.id,
      workspace_id: row.workspace_id,
      project_id: row.project_id,
      resource_id: row.resource_id,
      parent_comment_id: row.parent_comment_id,
      author_id: row.author_id,
      author_name: row.author_name,
      author_email: row.author_email,
      content: row.content,
      target_type: row.target_type,
      target_id: row.target_id,
      metadata: JSON.parse(row.metadata || '{}'),
      reply_count: parseInt(row.reply_count) || 0,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }));

    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    return {
      data: comments,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    };
  }

  // ====== NOTIFICATION OPERATIONS ======

  async createNotification(data: CreateNotification): Promise<Notification> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO notifications (
        id, user_id, workspace_id, event_id, notification_type, title, message,
        action_url, priority, delivery_channel, delivered_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.user_id,
      data.workspace_id,
      data.event_id || null,
      data.notification_type,
      data.title,
      data.message || null,
      data.action_url || null,
      data.priority || 'normal',
      data.delivery_channel || 'in_app',
      now
    );

    return {
      id,
      user_id: data.user_id,
      workspace_id: data.workspace_id,
      event_id: data.event_id,
      notification_type: data.notification_type,
      title: data.title,
      message: data.message,
      action_url: data.action_url,
      priority: data.priority || 'normal',
      delivery_channel: data.delivery_channel || 'in_app',
      read_at: undefined,
      delivered_at: new Date(now),
    };
  }
}