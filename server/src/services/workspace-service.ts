/**
 * Epic 9.2.1 - Workspace Service Layer
 * Business logic for collaborative workspace operations
 */

import { WorkspaceDAO } from '../database/workspace-dao';
import {
  Workspace,
  CreateWorkspace,
  UpdateWorkspace,
  Project,
  CreateProject,
  UpdateProject,
  Resource,
  CreateResource,
  CreateUserMembership,
  CreateACLAssignment,
  ActivityEvent,
  CreateActivityEvent,
  Comment,
  CreateComment,
  UpdateComment,
  Notification,
  CreateNotification,
  WorkspaceWithMembership,
  ProjectWithStats,
  PaginatedResult,
  PaginationOptions,
  WorkspaceFilter,
  ProjectFilter,
  ActivityEventFilter,
  CommentFilter,
  PERMISSIONS
} from '../database/workspace-models';

export interface WorkspaceServiceOptions {
  getUserInfo?: (userId: string) => Promise<{ name: string; avatar?: string } | null>;
  sendNotification?: (notification: Notification) => Promise<void>;
}

export class WorkspaceService {
  constructor(
    private dao: WorkspaceDAO,
    private options: WorkspaceServiceOptions = {}
  ) {}

  // ====== WORKSPACE OPERATIONS ======

  async createWorkspace(data: CreateWorkspace, userId: string): Promise<Workspace> {
    // Validate workspace name
    if (!data.name.trim()) {
      throw new Error('Workspace name is required');
    }

    const workspace = await this.dao.createWorkspace(data, userId);

    // Send welcome notification
    if (this.options.sendNotification) {
      const notification = await this.dao.createNotification({
        user_id: userId,
        workspace_id: workspace.id,
        notification_type: 'workspace.created',
        title: 'Welcome to your new workspace',
        message: `Your workspace "${workspace.name}" has been created successfully.`,
        priority: 'normal'
      });
      await this.options.sendNotification(notification);
    }

    return workspace;
  }

  async getWorkspace(id: string, userId: string): Promise<Workspace | null> {
    const workspace = await this.dao.getWorkspace(id);
    if (!workspace) return null;

    // Check if user has access to this workspace
    const hasAccess = await this.checkWorkspaceAccess(id, userId, PERMISSIONS.WORKSPACE_READ);
    if (!hasAccess) {
      throw new Error('Access denied to workspace');
    }

    return workspace;
  }

  async getUserWorkspaces(
    userId: string,
    filter: WorkspaceFilter = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<WorkspaceWithMembership>> {
    return this.dao.getWorkspacesForUser(userId, filter, pagination);
  }

  async updateWorkspace(
    id: string,
    data: UpdateWorkspace,
    userId: string
  ): Promise<Workspace | null> {
    // Check permissions
    const hasAccess = await this.checkWorkspaceAccess(id, userId, PERMISSIONS.WORKSPACE_WRITE);
    if (!hasAccess) {
      throw new Error('Insufficient permissions to update workspace');
    }

    const workspace = await this.dao.updateWorkspace(id, data);
    if (workspace) {
      // Log activity
      await this.dao.createActivityEvent({
        workspace_id: id,
        actor_id: userId,
        event_type: 'workspace.updated',
        event_data: { changes: Object.keys(data) }
      });
    }

    return workspace;
  }

  async archiveWorkspace(id: string, userId: string): Promise<boolean> {
    // Check permissions (only admin can archive)
    const hasAccess = await this.checkWorkspaceAccess(id, userId, PERMISSIONS.WORKSPACE_ADMIN);
    if (!hasAccess) {
      throw new Error('Only workspace administrators can archive workspaces');
    }

    const success = await this.dao.archiveWorkspace(id);
    if (success) {
      // Log activity
      await this.dao.createActivityEvent({
        workspace_id: id,
        actor_id: userId,
        event_type: 'workspace.archived',
        event_data: {}
      });
    }

    return success;
  }

  // ====== PROJECT OPERATIONS ======

  async createProject(data: CreateProject, userId: string): Promise<Project> {
    // Check permissions
    const hasAccess = await this.checkWorkspaceAccess(
      data.workspace_id,
      userId,
      PERMISSIONS.PROJECT_CREATE
    );
    if (!hasAccess) {
      throw new Error('Insufficient permissions to create projects');
    }

    if (!data.name.trim()) {
      throw new Error('Project name is required');
    }

    return this.dao.createProject(data, userId);
  }

  async getProject(id: string, userId: string): Promise<Project | null> {
    const project = await this.dao.getProject(id);
    if (!project) return null;

    // Check access
    const hasAccess = await this.checkWorkspaceAccess(
      project.workspace_id,
      userId,
      PERMISSIONS.PROJECT_READ
    );
    if (!hasAccess) {
      throw new Error('Access denied to project');
    }

    return project;
  }

  async getProjectsInWorkspace(
    workspaceId: string,
    userId: string,
    filter: ProjectFilter = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<ProjectWithStats>> {
    // Check access
    const hasAccess = await this.checkWorkspaceAccess(workspaceId, userId, PERMISSIONS.PROJECT_READ);
    if (!hasAccess) {
      throw new Error('Access denied to workspace projects');
    }

    return this.dao.getProjectsInWorkspace(workspaceId, filter, pagination);
  }

  async updateProject(
    id: string,
    data: UpdateProject,
    userId: string
  ): Promise<Project | null> {
    const project = await this.dao.getProject(id);
    if (!project) return null;

    // Check permissions
    const hasAccess = await this.checkWorkspaceAccess(
      project.workspace_id,
      userId,
      PERMISSIONS.PROJECT_WRITE
    );
    if (!hasAccess) {
      throw new Error('Insufficient permissions to update project');
    }

    return this.dao.updateProject(id, data, userId);
  }

  async deleteProject(id: string, userId: string): Promise<boolean> {
    const project = await this.dao.getProject(id);
    if (!project) return false;

    // Check permissions
    const hasAccess = await this.checkWorkspaceAccess(
      project.workspace_id,
      userId,
      PERMISSIONS.PROJECT_DELETE
    );
    if (!hasAccess) {
      throw new Error('Insufficient permissions to delete project');
    }

    return this.dao.updateProject(id, { status: 'deleted' }, userId) !== null;
  }

  // ====== RESOURCE OPERATIONS ======

  async createResource(data: CreateResource, userId: string): Promise<Resource> {
    const project = await this.dao.getProject(data.project_id);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check permissions
    const hasAccess = await this.checkWorkspaceAccess(
      project.workspace_id,
      userId,
      PERMISSIONS.RESOURCE_CREATE
    );
    if (!hasAccess) {
      throw new Error('Insufficient permissions to create resources');
    }

    if (!data.name.trim()) {
      throw new Error('Resource name is required');
    }

    return this.dao.createResource(data, userId);
  }

  async getResource(id: string, userId: string): Promise<Resource | null> {
    const resource = await this.dao.getResource(id);
    if (!resource) return null;

    const project = await this.dao.getProject(resource.project_id);
    if (!project) return null;

    // Check access
    const hasAccess = await this.checkWorkspaceAccess(
      project.workspace_id,
      userId,
      PERMISSIONS.RESOURCE_READ
    );
    if (!hasAccess) {
      throw new Error('Access denied to resource');
    }

    return resource;
  }

  // ====== USER MANAGEMENT ======

  async inviteUserToWorkspace(
    workspaceId: string,
    userIdToInvite: string,
    roleName: string,
    invitedBy: string
  ): Promise<void> {
    // Check permissions
    const hasAccess = await this.checkWorkspaceAccess(workspaceId, invitedBy, PERMISSIONS.USER_INVITE);
    if (!hasAccess) {
      throw new Error('Insufficient permissions to invite users');
    }

    // Get the role
    const role = await this.dao.getRole(workspaceId, roleName);
    if (!role) {
      throw new Error(`Role '${roleName}' not found`);
    }

    // Create membership
    await this.dao.createUserMembership(
      {
        user_id: userIdToInvite,
        workspace_id: workspaceId
      },
      invitedBy
    );

    // Assign role
    await this.dao.createACLAssignment(
      {
        user_id: userIdToInvite,
        role_id: role.id,
        scope_type: 'workspace',
        scope_id: workspaceId
      },
      invitedBy
    );

    // Log activity
    await this.dao.createActivityEvent({
      workspace_id: workspaceId,
      actor_id: invitedBy,
      event_type: 'user.invited',
      event_data: { invited_user: userIdToInvite, role: roleName }
    });

    // Send notification to invited user
    if (this.options.sendNotification) {
      const workspace = await this.dao.getWorkspace(workspaceId);
      if (workspace) {
        const notification = await this.dao.createNotification({
          user_id: userIdToInvite,
          workspace_id: workspaceId,
          notification_type: 'user.invited',
          title: 'Workspace invitation',
          message: `You've been invited to join the workspace "${workspace.name}".`,
          priority: 'normal'
        });
        await this.options.sendNotification(notification);
      }
    }
  }

  // ====== ACTIVITY FEED ======

  async getActivityFeed(
    workspaceId: string,
    userId: string,
    filter: ActivityEventFilter = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<ActivityEventWithActorInfo>> {
    // Check access
    const hasAccess = await this.checkWorkspaceAccess(workspaceId, userId, PERMISSIONS.ACTIVITY_READ);
    if (!hasAccess) {
      throw new Error('Access denied to activity feed');
    }

    return this.dao.getActivityFeed(workspaceId, filter, pagination);
  }

  async getActivityEventById(eventId: string, userId: string): Promise<ActivityEventWithActorInfo | null> {
    const event = await this.dao.getActivityEventById(eventId);
    if (!event) return null;

    // Check access to the workspace
    const hasAccess = await this.checkWorkspaceAccess(event.workspace_id, userId, PERMISSIONS.ACTIVITY_READ);
    if (!hasAccess) {
      throw new Error('Access denied to activity event');
    }

    return event;
  }

  async getActivityEventTypes(workspaceId: string, userId: string): Promise<string[]> {
    // Check access
    const hasAccess = await this.checkWorkspaceAccess(workspaceId, userId, PERMISSIONS.ACTIVITY_READ);
    if (!hasAccess) {
      throw new Error('Access denied to workspace');
    }

    return this.dao.getActivityEventTypes(workspaceId);
  }

  async getActivityStats(
    workspaceId: string,
    userId: string,
    days = 30
  ): Promise<{
    total_events: number;
    events_by_type: Record<string, number>;
    events_by_day: Array<{ date: string; count: number }>;
    most_active_users: Array<{ user_id: string; count: number }>;
  }> {
    // Check access
    const hasAccess = await this.checkWorkspaceAccess(workspaceId, userId, PERMISSIONS.ACTIVITY_READ);
    if (!hasAccess) {
      throw new Error('Access denied to workspace activity stats');
    }

    return this.dao.getActivityStats(workspaceId, days);
  }

  async getProjectActivityFeed(
    projectId: string,
    userId: string,
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<ActivityEventWithActorInfo>> {
    const project = await this.dao.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check access
    const hasAccess = await this.checkWorkspaceAccess(
      project.workspace_id,
      userId,
      PERMISSIONS.ACTIVITY_READ
    );
    if (!hasAccess) {
      throw new Error('Access denied to project activity');
    }

    return this.dao.getActivityFeed(
      project.workspace_id,
      { project_id: projectId },
      pagination
    );
  }

  async getUserActivityFeed(
    workspaceId: string,
    targetUserId: string,
    requestingUserId: string,
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<ActivityEventWithActorInfo>> {
    // Check access
    const hasAccess = await this.checkWorkspaceAccess(workspaceId, requestingUserId, PERMISSIONS.ACTIVITY_READ);
    if (!hasAccess) {
      throw new Error('Access denied to workspace activity');
    }

    return this.dao.getActivityFeed(
      workspaceId,
      { actor_id: targetUserId },
      pagination
    );
  }

  // ====== COMMENT OPERATIONS ======

  async createComment(data: CreateComment): Promise<Comment> {
    // Validate content
    if (!data.content || !data.content.trim()) {
      throw new Error('Comment content is required');
    }

    // Check permissions based on workspace access
    const hasAccess = await this.checkWorkspaceAccess(
      data.workspace_id,
      data.author_id,
      PERMISSIONS.COMMENT_WRITE
    );
    if (!hasAccess) {
      throw new Error('Insufficient permissions to create comments');
    }

    // If this is a reply, validate parent comment exists
    if (data.parent_comment_id) {
      const parentComment = await this.dao.getComment(data.parent_comment_id);
      if (!parentComment) {
        throw new Error('Parent comment not found');
      }
      if (parentComment.workspace_id !== data.workspace_id) {
        throw new Error('Parent comment is not in the same workspace');
      }
    }

    const comment = await this.dao.createComment(data);

    // Send notifications for mentions and replies
    if (data.parent_comment_id) {
      const parentComment = await this.dao.getComment(data.parent_comment_id);
      if (parentComment && parentComment.author_id !== data.author_id) {
        // Notify parent comment author
        await this.createNotification({
          user_id: parentComment.author_id,
          workspace_id: data.workspace_id,
          notification_type: 'comment_reply',
          title: 'New reply to your comment',
          message: `${data.author_id} replied to your comment`,
          action_url: `/workspaces/${data.workspace_id}/comments/${comment.id}`,
          priority: 'normal'
        });
      }
    }

    return comment;
  }

  async updateComment(
    commentId: string,
    updates: UpdateComment,
    userId: string
  ): Promise<Comment | null> {
    const comment = await this.dao.getComment(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Only author can edit their comments, or users with admin permissions
    if (comment.author_id !== userId) {
      const hasAccess = await this.checkWorkspaceAccess(
        comment.workspace_id,
        userId,
        PERMISSIONS.COMMENT_DELETE
      );
      if (!hasAccess) {
        throw new Error('Insufficient permissions to edit this comment');
      }
    }

    if (updates.content && !updates.content.trim()) {
      throw new Error('Comment content cannot be empty');
    }

    return this.dao.updateComment(commentId, userId, updates);
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const comment = await this.dao.getComment(commentId);
    if (!comment) {
      return false;
    }

    // Only author can delete their comments, or users with admin permissions
    if (comment.author_id !== userId) {
      const hasAccess = await this.checkWorkspaceAccess(
        comment.workspace_id,
        userId,
        PERMISSIONS.COMMENT_DELETE
      );
      if (!hasAccess) {
        throw new Error('Insufficient permissions to delete this comment');
      }
    }

    return this.dao.deleteComment(commentId, userId);
  }

  async getCommentsByTarget(
    workspaceId: string,
    targetType: string,
    targetId: string,
    userId: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Comment>> {
    // Check read permissions
    const hasAccess = await this.checkWorkspaceAccess(
      workspaceId,
      userId,
      PERMISSIONS.COMMENT_READ
    );
    if (!hasAccess) {
      throw new Error('Insufficient permissions to view comments');
    }

    return this.dao.getCommentsByTarget(workspaceId, targetType, targetId, options);
  }

  async getCommentReplies(
    commentId: string,
    userId: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Comment>> {
    const comment = await this.dao.getComment(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check read permissions
    const hasAccess = await this.checkWorkspaceAccess(
      comment.workspace_id,
      userId,
      PERMISSIONS.COMMENT_READ
    );
    if (!hasAccess) {
      throw new Error('Insufficient permissions to view comment replies');
    }

    return this.dao.getCommentReplies(commentId, options);
  }

  async getCommentsByResource(
    resourceId: string,
    userId: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Comment>> {
    const resource = await this.dao.getResource(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    const project = await this.dao.getProject(resource.project_id);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check read permissions
    const hasAccess = await this.checkWorkspaceAccess(
      project.workspace_id,
      userId,
      PERMISSIONS.COMMENT_READ
    );
    if (!hasAccess) {
      throw new Error('Insufficient permissions to view comments');
    }

    return this.dao.getCommentsByResource(resourceId, options);
  }

  async resolveComment(
    commentId: string,
    userId: string,
    resolved: boolean = true
  ): Promise<Comment | null> {
    const comment = await this.dao.getComment(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check permissions
    const hasAccess = await this.checkWorkspaceAccess(
      comment.workspace_id,
      userId,
      PERMISSIONS.COMMENT_WRITE
    );
    if (!hasAccess) {
      throw new Error('Insufficient permissions to resolve comments');
    }

    return this.dao.updateComment(commentId, userId, {
      metadata: {
        ...comment.metadata,
        resolved,
        resolved_by: resolved ? userId : undefined,
        resolved_at: resolved ? new Date().toISOString() : undefined
      }
    });
  }

  // ====== PERMISSION CHECKING ======

  private async checkWorkspaceAccess(
    workspaceId: string,
    userId: string,
    requiredPermission: number
  ): Promise<boolean> {
    return this.dao.hasPermissions(userId, workspaceId, requiredPermission);
  }

  // ====== RBAC MANAGEMENT METHODS ======

  async getUserPermissions(
    workspaceId: string,
    userId: string,
    requestingUserId: string
  ): Promise<{ permissions: number; roles: any[] } | null> {
    // Check if requesting user can view permissions (admin permission required)
    const hasAccess = await this.checkWorkspaceAccess(
      workspaceId,
      requestingUserId,
      PERMISSIONS.WORKSPACE_ADMIN
    );
    if (!hasAccess) {
      throw new Error('Insufficient permissions to view user permissions');
    }

    return this.dao.getUserPermissions(userId, workspaceId);
  }

  async getWorkspaceMembers(
    workspaceId: string,
    userId: string
  ): Promise<Array<{
    user_id: string;
    membership: any;
    roles: any[];
    permissions: number;
  }>> {
    // Check access
    const hasAccess = await this.checkWorkspaceAccess(
      workspaceId,
      userId,
      PERMISSIONS.WORKSPACE_READ
    );
    if (!hasAccess) {
      throw new Error('Access denied to workspace members');
    }

    return this.dao.getWorkspaceMembers(workspaceId);
  }

  async updateUserRole(
    workspaceId: string,
    targetUserId: string,
    newRoleName: string,
    requestingUserId: string
  ): Promise<boolean> {
    // Check permissions (admin required to change roles)
    const hasAccess = await this.checkWorkspaceAccess(
      workspaceId,
      requestingUserId,
      PERMISSIONS.USER_ASSIGN_ROLES
    );
    if (!hasAccess) {
      throw new Error('Insufficient permissions to assign roles');
    }

    // Prevent self-demotion (owners can't remove their own admin rights)
    const workspace = await this.dao.getWorkspace(workspaceId);
    if (workspace && workspace.owner_id === targetUserId && requestingUserId === targetUserId) {
      throw new Error('Workspace owners cannot change their own role');
    }

    const success = await this.dao.updateUserRole(targetUserId, workspaceId, newRoleName, requestingUserId);
    
    if (success) {
      // Log activity
      await this.dao.createActivityEvent({
        workspace_id: workspaceId,
        actor_id: requestingUserId,
        event_type: 'user.role_changed',
        event_data: { 
          target_user: targetUserId, 
          new_role: newRoleName 
        }
      });
    }

    return success;
  }

  async removeUserFromWorkspace(
    workspaceId: string,
    targetUserId: string,
    requestingUserId: string
  ): Promise<boolean> {
    // Check permissions (admin or user remove permission required)
    const hasAccess = await this.checkWorkspaceAccess(
      workspaceId,
      requestingUserId,
      PERMISSIONS.USER_REMOVE
    );
    if (!hasAccess && requestingUserId !== targetUserId) {
      throw new Error('Insufficient permissions to remove users from workspace');
    }

    // Prevent owner removal by others
    const workspace = await this.dao.getWorkspace(workspaceId);
    if (workspace && workspace.owner_id === targetUserId && requestingUserId !== targetUserId) {
      throw new Error('Workspace owner cannot be removed by others');
    }

    const success = await this.dao.removeUserFromWorkspace(targetUserId, workspaceId);
    
    if (success) {
      // Log activity
      await this.dao.createActivityEvent({
        workspace_id: workspaceId,
        actor_id: requestingUserId,
        event_type: requestingUserId === targetUserId ? 'user.left' : 'user.removed',
        event_data: { 
          target_user: targetUserId 
        }
      });
    }

    return success;
  }

  // ====== WORKSPACE CONTEXT MANAGEMENT ======

  /**
   * Switch user's active workspace context (for multi-tenant isolation)
   */
  async switchWorkspaceContext(
    userId: string,
    targetWorkspaceId: string
  ): Promise<{ success: boolean; workspaceInfo?: any; permissions?: number }> {
    // Verify user has access to target workspace
    const hasAccess = await this.checkWorkspaceAccess(
      targetWorkspaceId,
      userId,
      PERMISSIONS.WORKSPACE_READ
    );
    if (!hasAccess) {
      return { success: false };
    }

    // Get workspace info and user permissions
    const workspace = await this.dao.getWorkspace(targetWorkspaceId);
    const userPermissions = await this.dao.getUserPermissions(userId, targetWorkspaceId);

    if (!workspace || !userPermissions) {
      return { success: false };
    }

    // Update user's last active time in this workspace
    const memberships = await this.dao.getWorkspaceMemberships(targetWorkspaceId, { user_id: userId });
    if (memberships.length > 0) {
      // Would update last_active_at in production
    }

    // Log activity
    await this.dao.createActivityEvent({
      workspace_id: targetWorkspaceId,
      actor_id: userId,
      event_type: 'workspace.context_switched',
      event_data: {}
    });

    return {
      success: true,
      workspaceInfo: {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        owner_id: workspace.owner_id
      },
      permissions: userPermissions.permissions
    };
  }

  // ====== RESOURCE QUOTA ENFORCEMENT ======

  /**
   * Check resource quotas to prevent workspace abuse
   */
  async checkResourceQuotas(
    workspaceId: string,
    resourceType: 'projects' | 'resources' | 'storage',
    requestedAmount: number = 1
  ): Promise<{ allowed: boolean; current: number; limit: number; reason?: string }> {
    const workspace = await this.dao.getWorkspace(workspaceId);
    if (!workspace) {
      return { allowed: false, current: 0, limit: 0, reason: 'Workspace not found' };
    }

    // Define default quotas (these would be configurable per workspace tier)
    const defaultQuotas = {
      projects: 100,
      resources: 1000,
      storage: 10 * 1024 * 1024 * 1024 // 10GB in bytes
    };

    const quotas = workspace.settings?.quotas || defaultQuotas;
    const limit = quotas[resourceType] || defaultQuotas[resourceType];

    // Get current usage
    let current = 0;
    switch (resourceType) {
      case 'projects':
        const projects = await this.dao.getProjectsInWorkspace(workspaceId, { status: ['active', 'draft'] });
        current = projects.data.length;
        break;
      
      case 'resources':
        // Would query total resources across all projects
        current = 0; // Placeholder
        break;
      
      case 'storage':
        // Would query total storage usage
        current = 0; // Placeholder
        break;
    }

    const allowed = (current + requestedAmount) <= limit;
    
    return {
      allowed,
      current,
      limit,
      reason: allowed ? undefined : `${resourceType} quota exceeded (${current + requestedAmount}/${limit})`
    };
  }

  /**
   * Multi-tenant isolation check - ensure user can only access their workspaces
   */
  async enforceWorkspaceIsolation(
    userId: string,
    workspaceId: string,
    requiredPermission: number = PERMISSIONS.WORKSPACE_READ
  ): Promise<void> {
    const hasAccess = await this.checkWorkspaceAccess(workspaceId, userId, requiredPermission);
    if (!hasAccess) {
      throw new Error('Cross-tenant access violation: User does not have access to this workspace');
    }
  }

  // ====== NOTIFICATIONS ======

  async createNotification(data: CreateNotification): Promise<Notification> {
    const notification = await this.dao.createNotification(data);
    
    if (this.options.sendNotification) {
      await this.options.sendNotification(notification);
    }

    return notification;
  }

  async markNotificationAsRead(id: string, userId: string): Promise<boolean> {
    // Implementation would mark notification as read
    // For now, return true
    return true;
  }

  async getUserNotifications(
    userId: string,
    workspaceId?: string,
    onlyUnread = false,
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<Notification>> {
    // Implementation would get user notifications
    // For now, return empty
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
      }
    };
  }
}