/**
 * Content Management API Routes
 * Epic 17.2 - Content Management System
 * Task: E17-1753114397045-B8F2A1
 * 
 * RESTful API endpoints for comprehensive content management system.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  ContentManagementService,
  ContentFilter,
  ContentCreateRequest,
  ContentUpdateRequest
} from '../admin/content-management.service';
import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';

}
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
  };
}

}
interface ContentQueryParams {
  type?: string;
  status?: string;
  visibility?: string;
  author?: string;
  organization?: string;
  category?: string;
  featured?: string;
  search?: string;
  tags?: string;
  startDate?: string;
  endDate?: string;
  limit?: string;
  offset?: string;
}
}

}
interface ContentIdParams {
  contentId: string;
}
}

}
interface BulkUpdateBody {
  contentIds: string[];
  status: string;
}
}

export async function contentManagementRoutes(fastify: FastifyInstance) {
  const database = new DatabaseService(fastify.pg);
  const auditService = new AuditService(database);
  const contentService = new ContentManagementService(database, auditService);

  // Authentication middleware
  const authenticate = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      
      if (!request.user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      // Check if user has content management permissions
      const allowedRoles = ['admin', 'super_admin', 'content_creator', 'creator', 'editor'];
      if (!allowedRoles.includes(request.user.role)) {
        return reply.code(403).send({ error: 'Insufficient permissions for content management' });
      }
    } catch (error) {
      return reply.code(401).send({ error: 'Invalid authentication token' });
    }
  };

  // Register authentication hook
  fastify.addHook('preHandler', authenticate);

  // Create new content item
  fastify.post<{
    Body: ContentCreateRequest;
  }>('/content', async (request: AuthenticatedRequest, reply) => {
    try {
      const { user } = request;
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const contentItem = await contentService.createContent(
        request.body,
        user.id,
        user.role
      );

      return reply.code(201).send({
        success: true,
        data: contentItem
      });
    } catch (error) {
      fastify.log.error('Error creating content:', error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create content'
      });
    }
  });

  // Search and filter content items
  fastify.get<{
    Querystring: ContentQueryParams;
  }>('/content', async (request: AuthenticatedRequest, reply) => {
    try {
      const { user } = request;
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const {
        type,
        status,
        visibility,
        author,
        organization,
        category,
        featured,
        search,
        tags,
        startDate,
        endDate,
        limit = '50',
        offset = '0'
      } = request.query;

      const filter: ContentFilter = {};
      
      if (type) filter.type = type as any;
      if (status) filter.status = status as any;
      if (visibility) filter.visibility = visibility as any;
      if (author) filter.author = author;
      if (organization) filter.organizationId = organization;
      if (category) filter.category = category;
      if (featured !== undefined) filter.featured = featured === 'true';
      if (search) filter.search = search;
      if (tags) filter.tags = tags.split(',');
      if (startDate && endDate) {
        filter.dateRange = { start: startDate, end: endDate };
      }

      const result = await contentService.searchContent(
        filter,
        user.id,
        user.role,
        parseInt(limit),
        parseInt(offset)
      );

      return reply.send({
        success: true,
        data: result.items,
        pagination: {
          total: result.totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: result.totalCount > parseInt(offset) + parseInt(limit)
        }
      });
    } catch (error) {
      fastify.log.error('Error searching content:', error);
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search content'
      });
    }
  });

  // Get specific content item by ID
  fastify.get<{
    Params: ContentIdParams;
  }>('/content/:contentId', async (request: AuthenticatedRequest, reply) => {
    try {
      const { contentId } = request.params;
      
      const contentItem = await contentService.getContentById(contentId);
      
      if (!contentItem) {
        return reply.code(404).send({
          success: false,
          error: 'Content item not found'
        });
      }

      return reply.send({
        success: true,
        data: contentItem
      });
    } catch (error) {
      fastify.log.error('Error getting content by ID:', error);
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve content'
      });
    }
  });

  // Update existing content item
  fastify.put<{
    Params: ContentIdParams;
    Body: ContentUpdateRequest;
  }>('/content/:contentId', async (request: AuthenticatedRequest, reply) => {
    try {
      const { user } = request;
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const { contentId } = request.params;

      const updatedContent = await contentService.updateContent(
        contentId,
        request.body,
        user.id,
        user.role
      );

      return reply.send({
        success: true,
        data: updatedContent
      });
    } catch (error) {
      fastify.log.error('Error updating content:', error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update content'
      });
    }
  });

  // Delete content item (soft delete)
  fastify.delete<{
    Params: ContentIdParams;
  }>('/content/:contentId', async (request: AuthenticatedRequest, reply) => {
    try {
      const { user } = request;
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const { contentId } = request.params;

      await contentService.deleteContent(contentId, user.id, user.role);

      return reply.send({
        success: true,
        message: 'Content item deleted successfully'
      });
    } catch (error) {
      fastify.log.error('Error deleting content:', error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete content'
      });
    }
  });

  // Get content statistics
  fastify.get('/content/statistics', async (request: AuthenticatedRequest, reply) => {
    try {
      const { user } = request;
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      // Only admins can view comprehensive statistics
      if (!['admin', 'super_admin'].includes(user.role)) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }

      const statistics = await contentService.getContentStatistics();

      return reply.send({
        success: true,
        data: statistics
      });
    } catch (error) {
      fastify.log.error('Error getting content statistics:', error);
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve statistics'
      });
    }
  });

  // Get content revisions
  fastify.get<{
    Params: ContentIdParams;
    Querystring: { limit?: string };
  }>('/content/:contentId/revisions', async (request: AuthenticatedRequest, reply) => {
    try {
      const { contentId } = request.params;
      const { limit = '20' } = request.query;

      const revisions = await contentService.getContentRevisions(
        contentId,
        parseInt(limit)
      );

      return reply.send({
        success: true,
        data: revisions
      });
    } catch (error) {
      fastify.log.error('Error getting content revisions:', error);
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve revisions'
      });
    }
  });

  // Bulk update content status
  fastify.post<{
    Body: BulkUpdateBody;
  }>('/content/bulk/status', async (request: AuthenticatedRequest, reply) => {
    try {
      const { user } = request;
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      // Only admins can perform bulk operations
      if (!['admin', 'super_admin'].includes(user.role)) {
        return reply.code(403).send({ error: 'Insufficient permissions for bulk operations' });
      }

      const { contentIds, status } = request.body;

      if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'Content IDs array is required'
        });
      }

      if (!status) {
        return reply.code(400).send({
          success: false,
          error: 'Status is required'
        });
      }

      const result = await contentService.bulkUpdateStatus(
        contentIds,
        status as any,
        user.id,
        user.role
      );

      return reply.send({
        success: true,
        data: result,
        message: `Bulk update completed: ${result.success} successful, ${result.failed} failed`
      });
    } catch (error) {
      fastify.log.error('Error performing bulk status update:', error);
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform bulk update'
      });
    }
  });

  // Publish content item
  fastify.post<{
    Params: ContentIdParams;
  }>('/content/:contentId/publish', async (request: AuthenticatedRequest, reply) => {
    try {
      const { user } = request;
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const { contentId } = request.params;

      const updatedContent = await contentService.updateContent(
        contentId,
        { 
          status: 'published',
          publishImmediately: true
  }
        user.id,
        user.role
      );

      return reply.send({
        success: true,
        data: updatedContent,
        message: 'Content published successfully'
      });
    } catch (error) {
      fastify.log.error('Error publishing content:', error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish content'
      });
    }
  });

  // Unpublish content item
  fastify.post<{
    Params: ContentIdParams;
  }>('/content/:contentId/unpublish', async (request: AuthenticatedRequest, reply) => {
    try {
      const { user } = request;
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const { contentId } = request.params;

      const updatedContent = await contentService.updateContent(
        contentId,
        { status: 'draft' },
        user.id,
        user.role
      );

      return reply.send({
        success: true,
        data: updatedContent,
        message: 'Content unpublished successfully'
      });
    } catch (error) {
      fastify.log.error('Error unpublishing content:', error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unpublish content'
      });
    }
  });

  // Archive content item
  fastify.post<{
    Params: ContentIdParams;
  }>('/content/:contentId/archive', async (request: AuthenticatedRequest, reply) => {
    try {
      const { user } = request;
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const { contentId } = request.params;

      const updatedContent = await contentService.updateContent(
        contentId,
        { status: 'archived' },
        user.id,
        user.role
      );

      return reply.send({
        success: true,
        data: updatedContent,
        message: 'Content archived successfully'
      });
    } catch (error) {
      fastify.log.error('Error archiving content:', error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to archive content'
      });
    }
  });

  // Feature/unfeature content item
  fastify.post<{
    Params: ContentIdParams;
    Body: { featured: boolean };
  }>('/content/:contentId/feature', async (request: AuthenticatedRequest, reply) => {
    try {
      const { user } = request;
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      // Only admins can feature content
      if (!['admin', 'super_admin'].includes(user.role)) {
        return reply.code(403).send({ error: 'Insufficient permissions to feature content' });
      }

      const { contentId } = request.params;
      const { featured } = request.body;

      const updatedContent = await contentService.updateContent(
        contentId,
        { 
          metadata: { 
            featured,
            priority: featured ? 100 : 0
          }
  }
        user.id,
        user.role
      );

      return reply.send({
        success: true,
        data: updatedContent,
        message: `Content ${featured ? 'featured' : 'unfeatured'} successfully`
      });
    } catch (error) {
      fastify.log.error('Error featuring/unfeaturing content:', error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update featured status'
      });
    }
  });

  // Health check endpoint
  fastify.get('/content/health', async (request, reply) => {
    try {
      // Simple database connectivity check
      await database.query('SELECT 1');
      
      return reply.send({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'content-management'
      });
    } catch (error) {
      fastify.log.error('Content management health check failed:', error);
      return reply.code(503).send({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'content-management',
        error: error instanceof Error ? error.message : 'Database connectivity issue'
      });
    }
  });
}

export default contentManagementRoutes;