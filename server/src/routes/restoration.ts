import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RestorationService } from '../services/restoration-service';
import { 
  CreateRestorationAttemptRequestSchema,
  RestorationPreviewRequestSchema,
  ConflictResolutionRequestSchema,
  RestorationBookmarkRequestSchema,
  RestorationFilterSchema
} from '../../../packages/core/types/restoration';

export async function restorationRoutes(fastify: FastifyInstance) {
  const restorationService = new RestorationService(fastify.db, fastify.log);

  // Create restoration attempt
  fastify.post('/restoration/attempts', {
    schema: {
      body: CreateRestorationAttemptRequestSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const attempt = await restorationService.createRestoration(request.body, userId);
      
      reply.status(201).send({
        success: true,
        data: attempt
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to create restoration attempt'
      });
    }
  });

  // Generate restoration preview
  fastify.post('/restoration/preview', {
    schema: {
      body: RestorationPreviewRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const preview = await restorationService.generatePreview(request.body, userId);
      
      reply.send({
        success: true,
        data: preview
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to generate restoration preview'
      });
    }
  });

  // Get restoration progress
  fastify.get('/restoration/attempts/:id/progress', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const progress = await restorationService.getRestorationProgress(id);
      
      reply.send({
        success: true,
        data: progress
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get restoration progress'
      });
    }
  });

  // Resolve conflict
  fastify.post('/restoration/conflicts/resolve', {
    schema: {
      body: ConflictResolutionRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const result = await restorationService.resolveConflict(request.body, userId);
      
      reply.send({
        success: true,
        data: result
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to resolve conflict'
      });
    }
  });

  // Cancel restoration
  fastify.post('/restoration/attempts/:id/cancel', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      await restorationService.cancelRestoration(id, userId);
      
      reply.send({
        success: true,
        message: 'Restoration cancelled successfully'
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to cancel restoration'
      });
    }
  });

  // Get restoration statistics
  fastify.get('/restoration/stats/:projectId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' }
        },
        required: ['projectId']
      }
    }
  }, async (request, reply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      const stats = await restorationService.getRestorationStats(projectId);
      
      reply.send({
        success: true,
        data: stats
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get restoration statistics'
      });
    }
  });

  // Create bookmark
  fastify.post('/restoration/bookmarks', {
    schema: {
      body: RestorationBookmarkRequestSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const bookmark = await restorationService.createBookmark(request.body, userId);
      
      reply.status(201).send({
        success: true,
        data: bookmark
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to create restoration bookmark'
      });
    }
  });

  // Get bookmarks
  fastify.get('/restoration/bookmarks/:projectId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' }
        },
        required: ['projectId']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const { projectId } = request.params as { projectId: string };
      const bookmarks = await restorationService.getBookmarks(projectId, userId);
      
      reply.send({
        success: true,
        data: bookmarks
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get restoration bookmarks'
      });
    }
  });

  // Delete bookmark
  fastify.delete('/restoration/bookmarks/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      
      await fastify.db.query(`
        DELETE FROM restoration_bookmarks 
        WHERE id = $1 AND created_by = $2
      `, [id, userId]);
      
      reply.send({
        success: true,
        message: 'Bookmark deleted successfully'
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to delete restoration bookmark'
      });
    }
  });

  // List restoration attempts
  fastify.get('/restoration/attempts', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' },
          initiatedBy: { type: 'string', format: 'uuid' },
          status: { type: 'string' },
          restorationType: { type: 'string' },
          dateFrom: { type: 'string', format: 'date-time' },
          dateTo: { type: 'string', format: 'date-time' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const filter = RestorationFilterSchema.parse(request.query);
      const attempts = await restorationService.listRestorations(filter);
      
      reply.send({
        success: true,
        data: attempts
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to list restoration attempts'
      });
    }
  });

  // Get restoration attempt details
  fastify.get('/restoration/attempts/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const attempt = await fastify.db.query(`
        SELECT * FROM restoration_attempts WHERE id = $1
      `, [id]);

      if (attempt.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Restoration attempt not found'
        });
      }

      const conflicts = await fastify.db.query(`
        SELECT * FROM restoration_conflicts 
        WHERE restoration_attempt_id = $1
        ORDER BY created_at DESC
      `, [id]);

      const operations = await fastify.db.query(`
        SELECT * FROM restoration_operations 
        WHERE restoration_attempt_id = $1
        ORDER BY execution_order
      `, [id]);

      reply.send({
        success: true,
        data: {
          attempt: attempt.rows[0],
          conflicts: conflicts.rows,
          operations: operations.rows
        }
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get restoration attempt details'
      });
    }
  });

  // Get conflicts for restoration attempt
  fastify.get('/restoration/attempts/:id/conflicts', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const conflicts = await fastify.db.query(`
        SELECT * FROM restoration_conflicts 
        WHERE restoration_attempt_id = $1
        ORDER BY created_at DESC
      `, [id]);

      reply.send({
        success: true,
        data: conflicts.rows
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get restoration conflicts'
      });
    }
  });

  // Get operations for restoration attempt
  fastify.get('/restoration/attempts/:id/operations', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const operations = await fastify.db.query(`
        SELECT * FROM restoration_operations 
        WHERE restoration_attempt_id = $1
        ORDER BY execution_order
      `, [id]);

      reply.send({
        success: true,
        data: operations.rows
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get restoration operations'
      });
    }
  });

  // Clean up expired preview sessions
  fastify.post('/restoration/preview/cleanup', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const result = await fastify.db.query(`
        DELETE FROM restoration_preview_sessions 
        WHERE expires_at < CURRENT_TIMESTAMP
      `);

      reply.send({
        success: true,
        message: `Cleaned up ${result.rowCount} expired preview sessions`
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Failed to clean up expired preview sessions'
      });
    }
  });
}