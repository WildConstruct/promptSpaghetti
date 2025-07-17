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
}