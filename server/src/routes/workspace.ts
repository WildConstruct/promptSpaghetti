/**
 * Epic 9.2.1 - Workspace API Routes
 * REST API endpoints for collaborative workspace functionality
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { WorkspaceService } from '../services/workspace-service';
import { WorkspaceDAO } from '../database/workspace-dao';
import {
  CreateWorkspaceSchema,
  UpdateWorkspaceSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  CreateResourceSchema,
  CreateCommentSchema,
  UpdateCommentSchema,
  CreateNotificationSchema,
  PaginationOptions,
} from '../database/workspace-models';

// Request schemas
const GetWorkspacesQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  sort_by: z.enum(['name', 'created_at', 'updated_at']).optional().default('updated_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  archived: z.coerce.boolean().optional(),
});

const GetProjectsQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  sort_by: z.enum(['name', 'status', 'created_at', 'updated_at']).optional().default('updated_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  status: z.array(z.enum(['draft', 'active', 'archived'])).optional(),
  created_by: z.string().optional(),
});

const InviteUserSchema = z.object({
  user_id: z.string(),
  role: z.enum(['admin', 'editor', 'viewer', 'commenter']),
});

const UUIDParamSchema = z.object({
  id: z.string().uuid(),
});

const WorkspaceParamSchema = z.object({
  workspaceId: z.string().uuid(),
});

const ProjectParamSchema = z.object({
  workspaceId: z.string().uuid(),
  projectId: z.string().uuid(),
});

// Mock user authentication - in real implementation, this would extract from JWT
function getCurrentUser(request: FastifyRequest): string {
  // For development, use a header or default user
  return request.headers['x-user-id'] as string || 'dev-user-123';
}

export async function workspaceRoutes(fastify: FastifyInstance) {
  // Initialize service with database connection
  const workspaceDAO = new WorkspaceDAO(fastify.db);
  const workspaceService = new WorkspaceService(workspaceDAO, {
    getUserInfo: async (userId: string) => {
      // Mock implementation - in real app, this would fetch from user service
      return { name: `User ${userId}`, avatar: undefined };
    },
    sendNotification: async (notification) => {
      // Mock implementation - in real app, this would send via email/push service
      fastify.log.info('Notification sent:', notification.title);
    },
  });

  // ====== WORKSPACE ENDPOINTS ======

  // GET /api/workspaces - List user's workspaces
  fastify.get<{
    Querystring: z.infer<typeof GetWorkspacesQuerySchema>;
  }>('/workspaces', {
    schema: {
      querystring: GetWorkspacesQuerySchema,
      response: {
        200: z.object({
          data: z.array(z.any()),
          pagination: z.any(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const { search, archived, ...pagination } = request.query;
      
      const filter = { search, archived };
      const result = await workspaceService.getUserWorkspaces(userId, filter, pagination);
      
      return result;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch workspaces', message: error.message });
    }
  });

  // POST /api/workspaces - Create new workspace
  fastify.post<{
    Body: z.infer<typeof CreateWorkspaceSchema>;
  }>('/workspaces', {
    schema: {
      body: CreateWorkspaceSchema,
      response: {
        201: z.any(),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const workspace = await workspaceService.createWorkspace(request.body, userId);
      
      reply.code(201).send(workspace);
    } catch (error) {
      reply.code(400).send({ error: 'Failed to create workspace', message: error.message });
    }
  });

  // GET /api/workspaces/:id - Get workspace by ID
  fastify.get<{
    Params: z.infer<typeof UUIDParamSchema>;
  }>('/workspaces/:id', {
    schema: {
      params: UUIDParamSchema,
      response: {
        200: z.any(),
        404: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const workspace = await workspaceService.getWorkspace(request.params.id, userId);
      
      if (!workspace) {
        return reply.code(404).send({ error: 'Workspace not found' });
      }
      
      return workspace;
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to fetch workspace', message: error.message });
      }
    }
  });

  // PUT /api/workspaces/:id - Update workspace
  fastify.put<{
    Params: z.infer<typeof UUIDParamSchema>;
    Body: z.infer<typeof UpdateWorkspaceSchema>;
  }>('/workspaces/:id', {
    schema: {
      params: UUIDParamSchema,
      body: UpdateWorkspaceSchema,
      response: {
        200: z.any(),
        404: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const workspace = await workspaceService.updateWorkspace(
        request.params.id,
        request.body,
        userId
      );
      
      if (!workspace) {
        return reply.code(404).send({ error: 'Workspace not found' });
      }
      
      return workspace;
    } catch (error) {
      if (error.message.includes('Insufficient permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to update workspace', message: error.message });
      }
    }
  });

  // DELETE /api/workspaces/:id - Archive workspace
  fastify.delete<{
    Params: z.infer<typeof UUIDParamSchema>;
  }>('/workspaces/:id', {
    schema: {
      params: UUIDParamSchema,
      response: {
        204: z.null(),
        404: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const success = await workspaceService.archiveWorkspace(request.params.id, userId);
      
      if (!success) {
        return reply.code(404).send({ error: 'Workspace not found' });
      }
      
      reply.code(204).send();
    } catch (error) {
      if (error.message.includes('Only workspace administrators')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to archive workspace', message: error.message });
      }
    }
  });

  // POST /api/workspaces/:id/invite - Invite user to workspace
  fastify.post<{
    Params: z.infer<typeof UUIDParamSchema>;
    Body: z.infer<typeof InviteUserSchema>;
  }>('/workspaces/:id/invite', {
    schema: {
      params: UUIDParamSchema,
      body: InviteUserSchema,
      response: {
        200: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const { user_id, role } = request.body;
      
      await workspaceService.inviteUserToWorkspace(
        request.params.id,
        user_id,
        role,
        userId
      );
      
      return { message: 'User invited successfully' };
    } catch (error) {
      if (error.message.includes('Insufficient permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(400).send({ error: 'Failed to invite user', message: error.message });
      }
    }
  });

  // ====== PROJECT ENDPOINTS ======

  // GET /api/workspaces/:workspaceId/projects - List projects in workspace
  fastify.get<{
    Params: z.infer<typeof WorkspaceParamSchema>;
    Querystring: z.infer<typeof GetProjectsQuerySchema>;
  }>('/workspaces/:workspaceId/projects', {
    schema: {
      params: WorkspaceParamSchema,
      querystring: GetProjectsQuerySchema,
      response: {
        200: z.object({
          data: z.array(z.any()),
          pagination: z.any(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const { search, status, created_by, ...pagination } = request.query;
      
      const filter = { search, status, created_by };
      const result = await workspaceService.getProjectsInWorkspace(
        request.params.workspaceId,
        userId,
        filter,
        pagination
      );
      
      return result;
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to fetch projects', message: error.message });
      }
    }
  });

  // POST /api/workspaces/:workspaceId/projects - Create new project
  fastify.post<{
    Params: z.infer<typeof WorkspaceParamSchema>;
    Body: Omit<z.infer<typeof CreateProjectSchema>, 'workspace_id'>;
  }>('/workspaces/:workspaceId/projects', {
    schema: {
      params: WorkspaceParamSchema,
      body: CreateProjectSchema.omit({ workspace_id: true }),
      response: {
        201: z.any(),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const projectData = {
        ...request.body,
        workspace_id: request.params.workspaceId,
      };
      
      const project = await workspaceService.createProject(projectData, userId);
      
      reply.code(201).send(project);
    } catch (error) {
      if (error.message.includes('Insufficient permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(400).send({ error: 'Failed to create project', message: error.message });
      }
    }
  });

  // GET /api/workspaces/:workspaceId/projects/:projectId - Get project by ID
  fastify.get<{
    Params: z.infer<typeof ProjectParamSchema>;
  }>('/workspaces/:workspaceId/projects/:projectId', {
    schema: {
      params: ProjectParamSchema,
      response: {
        200: z.any(),
        404: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const project = await workspaceService.getProject(request.params.projectId, userId);
      
      if (!project) {
        return reply.code(404).send({ error: 'Project not found' });
      }
      
      return project;
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to fetch project', message: error.message });
      }
    }
  });

  // PUT /api/workspaces/:workspaceId/projects/:projectId - Update project
  fastify.put<{
    Params: z.infer<typeof ProjectParamSchema>;
    Body: z.infer<typeof UpdateProjectSchema>;
  }>('/workspaces/:workspaceId/projects/:projectId', {
    schema: {
      params: ProjectParamSchema,
      body: UpdateProjectSchema,
      response: {
        200: z.any(),
        404: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const project = await workspaceService.updateProject(
        request.params.projectId,
        request.body,
        userId
      );
      
      if (!project) {
        return reply.code(404).send({ error: 'Project not found' });
      }
      
      return project;
    } catch (error) {
      if (error.message.includes('Insufficient permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to update project', message: error.message });
      }
    }
  });

  // DELETE /api/workspaces/:workspaceId/projects/:projectId - Delete project
  fastify.delete<{
    Params: z.infer<typeof ProjectParamSchema>;
  }>('/workspaces/:workspaceId/projects/:projectId', {
    schema: {
      params: ProjectParamSchema,
      response: {
        204: z.null(),
        404: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const success = await workspaceService.deleteProject(request.params.projectId, userId);
      
      if (!success) {
        return reply.code(404).send({ error: 'Project not found' });
      }
      
      reply.code(204).send();
    } catch (error) {
      if (error.message.includes('Insufficient permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to delete project', message: error.message });
      }
    }
  });

  // ====== RESOURCE ENDPOINTS ======

  // POST /api/projects/:projectId/resources - Create new resource
  fastify.post<{
    Params: { projectId: string };
    Body: Omit<z.infer<typeof CreateResourceSchema>, 'project_id'>;
  }>('/projects/:projectId/resources', {
    schema: {
      params: z.object({ projectId: z.string().uuid() }),
      body: CreateResourceSchema.omit({ project_id: true }),
      response: {
        201: z.any(),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const resourceData = {
        ...request.body,
        project_id: request.params.projectId,
      };
      
      const resource = await workspaceService.createResource(resourceData, userId);
      
      reply.code(201).send(resource);
    } catch (error) {
      if (error.message.includes('Insufficient permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(400).send({ error: 'Failed to create resource', message: error.message });
      }
    }
  });

  // GET /api/resources/:id - Get resource by ID
  fastify.get<{
    Params: z.infer<typeof UUIDParamSchema>;
  }>('/resources/:id', {
    schema: {
      params: UUIDParamSchema,
      response: {
        200: z.any(),
        404: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const resource = await workspaceService.getResource(request.params.id, userId);
      
      if (!resource) {
        return reply.code(404).send({ error: 'Resource not found' });
      }
      
      return resource;
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to fetch resource', message: error.message });
      }
    }
  });

  // ====== ACTIVITY FEED ENDPOINTS ======

  // GET /api/workspaces/:workspaceId/activity - Get workspace activity feed
  fastify.get<{
    Params: z.infer<typeof WorkspaceParamSchema>;
    Querystring: {
      page?: number;
      limit?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
      project_id?: string;
      actor_id?: string;
      event_types?: string;
      from_date?: string;
      to_date?: string;
    };
  }>('/workspaces/:workspaceId/activity', {
    schema: {
      params: WorkspaceParamSchema,
      querystring: z.object({
        page: z.coerce.number().min(1).optional().default(1),
        limit: z.coerce.number().min(1).max(100).optional().default(20),
        sort_by: z.enum(['created_at', 'event_type']).optional().default('created_at'),
        sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
        project_id: z.string().uuid().optional(),
        actor_id: z.string().optional(),
        event_types: z.string().optional(),
        from_date: z.string().optional(),
        to_date: z.string().optional(),
      }),
      response: {
        200: z.object({
          data: z.array(z.any()),
          pagination: z.any(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const { event_types, from_date, to_date, ...pagination } = request.query;
      
      const filter: any = {};
      if (request.query.project_id) filter.project_id = request.query.project_id;
      if (request.query.actor_id) filter.actor_id = request.query.actor_id;
      if (event_types) filter.event_types = event_types.split(',');
      if (from_date) filter.from_date = new Date(from_date);
      if (to_date) filter.to_date = new Date(to_date);
      
      const result = await workspaceService.getActivityFeed(
        request.params.workspaceId,
        userId,
        filter,
        pagination
      );
      
      return result;
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to fetch activity feed', message: error.message });
      }
    }
  });

  // GET /api/workspaces/:workspaceId/activity/stats - Get activity statistics
  fastify.get<{
    Params: z.infer<typeof WorkspaceParamSchema>;
    Querystring: {
      days?: number;
    };
  }>('/workspaces/:workspaceId/activity/stats', {
    schema: {
      params: WorkspaceParamSchema,
      querystring: z.object({
        days: z.coerce.number().min(1).max(365).optional().default(30),
      }),
      response: {
        200: z.object({
          total_events: z.number(),
          events_by_type: z.record(z.number()),
          events_by_day: z.array(z.object({
            date: z.string(),
            count: z.number(),
          })),
          most_active_users: z.array(z.object({
            user_id: z.string(),
            count: z.number(),
          })),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const stats = await workspaceService.getActivityStats(
        request.params.workspaceId,
        userId,
        request.query.days
      );
      
      return stats;
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to fetch activity stats', message: error.message });
      }
    }
  });

  // GET /api/workspaces/:workspaceId/activity/types - Get available event types
  fastify.get<{
    Params: z.infer<typeof WorkspaceParamSchema>;
  }>('/workspaces/:workspaceId/activity/types', {
    schema: {
      params: WorkspaceParamSchema,
      response: {
        200: z.array(z.string()),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const types = await workspaceService.getActivityEventTypes(
        request.params.workspaceId,
        userId
      );
      
      return types;
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to fetch event types', message: error.message });
      }
    }
  });

  // GET /api/projects/:projectId/activity - Get project activity feed
  fastify.get<{
    Params: { projectId: string };
    Querystring: {
      page?: number;
      limit?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    };
  }>('/projects/:projectId/activity', {
    schema: {
      params: z.object({ projectId: z.string().uuid() }),
      querystring: z.object({
        page: z.coerce.number().min(1).optional().default(1),
        limit: z.coerce.number().min(1).max(100).optional().default(20),
        sort_by: z.enum(['created_at', 'event_type']).optional().default('created_at'),
        sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
      }),
      response: {
        200: z.object({
          data: z.array(z.any()),
          pagination: z.any(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const result = await workspaceService.getProjectActivityFeed(
        request.params.projectId,
        userId,
        request.query
      );
      
      return result;
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to fetch project activity', message: error.message });
      }
    }
  });

  // GET /api/activity/:id - Get specific activity event
  fastify.get<{
    Params: z.infer<typeof UUIDParamSchema>;
  }>('/activity/:id', {
    schema: {
      params: UUIDParamSchema,
      response: {
        200: z.any(),
        404: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const event = await workspaceService.getActivityEventById(request.params.id, userId);
      
      if (!event) {
        return reply.code(404).send({ error: 'Activity event not found' });
      }
      
      return event;
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to fetch activity event', message: error.message });
      }
    }
  });

  // ====== COMMENT ENDPOINTS ======

  // POST /api/resources/:resourceId/comments - Create comment
  fastify.post<{
    Params: { resourceId: string };
    Body: Omit<z.infer<typeof CreateCommentSchema>, 'resource_id' | 'author_id'>;
  }>('/resources/:resourceId/comments', {
    schema: {
      params: z.object({ resourceId: z.string().uuid() }),
      body: CreateCommentSchema.omit({ resource_id: true, author_id: true }),
      response: {
        201: z.any(),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const commentData = {
        ...request.body,
        resource_id: request.params.resourceId,
        author_id: userId,
      };
      
      const comment = await workspaceService.createComment(commentData);
      
      reply.code(201).send(comment);
    } catch (error) {
      if (error.message.includes('Insufficient permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(400).send({ error: 'Failed to create comment', message: error.message });
      }
    }
  });

  // PUT /api/comments/:id - Update comment
  fastify.put<{
    Params: z.infer<typeof UUIDParamSchema>;
    Body: z.infer<typeof UpdateCommentSchema>;
  }>('/comments/:id', {
    schema: {
      params: UUIDParamSchema,
      body: UpdateCommentSchema,
      response: {
        200: z.any(),
        404: z.object({ error: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const comment = await workspaceService.updateComment(
        request.params.id,
        request.body,
        userId
      );
      
      if (!comment) {
        return reply.code(404).send({ error: 'Comment not found' });
      }
      
      return comment;
    } catch (error) {
      if (error.message.includes('Insufficient permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to update comment', message: error.message });
      }
    }
  });

  // ====== NOTIFICATION ENDPOINTS ======

  // GET /api/notifications - Get user notifications
  fastify.get<{
    Querystring: {
      workspace_id?: string;
      unread_only?: boolean;
      page?: number;
      limit?: number;
    };
  }>('/notifications', {
    schema: {
      querystring: z.object({
        workspace_id: z.string().uuid().optional(),
        unread_only: z.coerce.boolean().optional().default(false),
        page: z.coerce.number().min(1).optional().default(1),
        limit: z.coerce.number().min(1).max(100).optional().default(20),
      }),
      response: {
        200: z.object({
          data: z.array(z.any()),
          pagination: z.any(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const { workspace_id, unread_only, ...pagination } = request.query;
      
      const result = await workspaceService.getUserNotifications(
        userId,
        workspace_id,
        unread_only,
        pagination
      );
      
      return result;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch notifications', message: error.message });
    }
  });

  // PUT /api/notifications/:id/read - Mark notification as read
  fastify.put<{
    Params: z.infer<typeof UUIDParamSchema>;
  }>('/notifications/:id/read', {
    schema: {
      params: UUIDParamSchema,
      response: {
        200: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const success = await workspaceService.markNotificationAsRead(request.params.id, userId);
      
      if (!success) {
        return reply.code(404).send({ error: 'Notification not found' });
      }
      
      return { message: 'Notification marked as read' };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to mark notification as read', message: error.message });
    }
  });

  // ====== COMMENT ENDPOINTS ======

  // POST /api/comments - Create a new comment
  fastify.post<{
    Body: z.infer<typeof CreateCommentSchema>;
  }>('/comments', {
    schema: {
      body: CreateCommentSchema,
      response: {
        201: CommentSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const commentData = { ...request.body, author_id: userId };
      
      const comment = await workspaceService.createComment(commentData);
      
      reply.code(201).send(comment);
    } catch (error) {
      if (error.message.includes('permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else if (error.message.includes('not found')) {
        reply.code(404).send({ error: 'Resource not found', message: error.message });
      } else if (error.message.includes('required') || error.message.includes('invalid')) {
        reply.code(400).send({ error: 'Validation error', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to create comment', message: error.message });
      }
    }
  });

  // GET /api/comments/:commentId - Get a specific comment
  fastify.get<{
    Params: z.infer<typeof UUIDParamSchema>;
  }>('/comments/:id', {
    schema: {
      params: UUIDParamSchema,
      response: {
        200: CommentSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const comment = await workspaceService.getComment(request.params.id);
      
      if (!comment) {
        return reply.code(404).send({ error: 'Comment not found' });
      }

      // Check read permissions
      const hasAccess = await workspaceService.checkWorkspaceAccess(
        comment.workspace_id,
        userId,
        PERMISSIONS.COMMENT_READ
      );
      if (!hasAccess) {
        return reply.code(403).send({ error: 'Access denied' });
      }
      
      return comment;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch comment', message: error.message });
    }
  });

  // PUT /api/comments/:commentId - Update a comment
  fastify.put<{
    Params: z.infer<typeof UUIDParamSchema>;
    Body: z.infer<typeof UpdateCommentSchema>;
  }>('/comments/:id', {
    schema: {
      params: UUIDParamSchema,
      body: UpdateCommentSchema,
      response: {
        200: CommentSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const comment = await workspaceService.updateComment(
        request.params.id,
        request.body,
        userId
      );
      
      if (!comment) {
        return reply.code(404).send({ error: 'Comment not found' });
      }
      
      return comment;
    } catch (error) {
      if (error.message.includes('permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else if (error.message.includes('not found')) {
        reply.code(404).send({ error: 'Comment not found', message: error.message });
      } else if (error.message.includes('cannot be empty')) {
        reply.code(400).send({ error: 'Validation error', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to update comment', message: error.message });
      }
    }
  });

  // DELETE /api/comments/:commentId - Delete a comment
  fastify.delete<{
    Params: z.infer<typeof UUIDParamSchema>;
  }>('/comments/:id', {
    schema: {
      params: UUIDParamSchema,
      response: {
        200: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const success = await workspaceService.deleteComment(request.params.id, userId);
      
      if (!success) {
        return reply.code(404).send({ error: 'Comment not found' });
      }
      
      return { message: 'Comment deleted successfully' };
    } catch (error) {
      if (error.message.includes('permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to delete comment', message: error.message });
      }
    }
  });

  // GET /api/comments/:commentId/replies - Get comment replies
  fastify.get<{
    Params: z.infer<typeof UUIDParamSchema>;
    Querystring: {
      page?: number;
      limit?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    };
  }>('/comments/:id/replies', {
    schema: {
      params: UUIDParamSchema,
      querystring: z.object({
        page: z.coerce.number().min(1).optional().default(1),
        limit: z.coerce.number().min(1).max(50).optional().default(10),
        sort_by: z.enum(['created_at']).optional().default('created_at'),
        sort_order: z.enum(['asc', 'desc']).optional().default('asc'),
      }),
      response: {
        200: PaginatedResponseSchema(CommentSchema),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const result = await workspaceService.getCommentReplies(
        request.params.id,
        userId,
        request.query
      );
      
      return result;
    } catch (error) {
      if (error.message.includes('permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else if (error.message.includes('not found')) {
        reply.code(404).send({ error: 'Comment not found', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to fetch comment replies', message: error.message });
      }
    }
  });

  // GET /api/workspaces/:workspaceId/comments - Get comments by target
  fastify.get<{
    Params: z.infer<typeof WorkspaceParamSchema>;
    Querystring: {
      target_type: string;
      target_id: string;
      page?: number;
      limit?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    };
  }>('/workspaces/:workspaceId/comments', {
    schema: {
      params: WorkspaceParamSchema,
      querystring: z.object({
        target_type: z.string(),
        target_id: z.string(),
        page: z.coerce.number().min(1).optional().default(1),
        limit: z.coerce.number().min(1).max(100).optional().default(20),
        sort_by: z.enum(['created_at']).optional().default('created_at'),
        sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
      }),
      response: {
        200: PaginatedResponseSchema(CommentSchema),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const { target_type, target_id, ...pagination } = request.query;
      
      const result = await workspaceService.getCommentsByTarget(
        request.params.workspaceId,
        target_type,
        target_id,
        userId,
        pagination
      );
      
      return result;
    } catch (error) {
      if (error.message.includes('permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to fetch comments', message: error.message });
      }
    }
  });

  // GET /api/resources/:resourceId/comments - Get resource comments
  fastify.get<{
    Params: { resourceId: string };
    Querystring: {
      page?: number;
      limit?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    };
  }>('/resources/:resourceId/comments', {
    schema: {
      params: z.object({ resourceId: z.string().uuid() }),
      querystring: z.object({
        page: z.coerce.number().min(1).optional().default(1),
        limit: z.coerce.number().min(1).max(100).optional().default(20),
        sort_by: z.enum(['created_at']).optional().default('created_at'),
        sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
      }),
      response: {
        200: PaginatedResponseSchema(CommentSchema),
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const result = await workspaceService.getCommentsByResource(
        request.params.resourceId,
        userId,
        request.query
      );
      
      return result;
    } catch (error) {
      if (error.message.includes('permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else if (error.message.includes('not found')) {
        reply.code(404).send({ error: 'Resource not found', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to fetch resource comments', message: error.message });
      }
    }
  });

  // PUT /api/comments/:commentId/resolve - Resolve/unresolve a comment
  fastify.put<{
    Params: z.infer<typeof UUIDParamSchema>;
    Body: { resolved: boolean };
  }>('/comments/:id/resolve', {
    schema: {
      params: UUIDParamSchema,
      body: z.object({ resolved: z.boolean() }),
      response: {
        200: CommentSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const comment = await workspaceService.resolveComment(
        request.params.id,
        userId,
        request.body.resolved
      );
      
      if (!comment) {
        return reply.code(404).send({ error: 'Comment not found' });
      }
      
      return comment;
    } catch (error) {
      if (error.message.includes('permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else if (error.message.includes('not found')) {
        reply.code(404).send({ error: 'Comment not found', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to resolve comment', message: error.message });
      }
    }
  });
}