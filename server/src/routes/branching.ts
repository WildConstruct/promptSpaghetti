import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { BranchingService } from '../services/branching-service';
import { 
  CreateBranchRequestSchema,
  UpdateBranchRequestSchema,
  CreateCommitRequestSchema,
  CreateMergeRequestRequestSchema,
  UpdateMergeRequestRequestSchema,
  CreateReviewRequestSchema,
  UpdateReviewRequestSchema,
  MergeBranchRequestSchema,
  SyncBranchRequestSchema,
  BranchFilterSchema,
  MergeRequestFilterSchema
} from '../../../packages/core/types/branching';

export async function branchingRoutes(fastify: FastifyInstance) {
  const branchingService = new BranchingService(fastify.db, fastify.log);

  // Create branch
  fastify.post('/branches', {
    schema: {
      body: CreateBranchRequestSchema,
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

      const branch = await branchingService.createBranch(request.body, userId);
      
      reply.status(201).send({
        success: true,
        data: branch
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to create branch'
      });
    }
  });

  // Update branch
  fastify.put('/branches/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
  }
        required: ['id']
  }
      body: UpdateBranchRequestSchema
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const branch = await branchingService.updateBranch(id, request.body, userId);
      
      reply.send({
        success: true,
        data: branch
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to update branch'
      });
    }
  });

  // Delete branch
  fastify.delete('/branches/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
  }
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
      await branchingService.deleteBranch(id, userId);
      
      reply.send({
        success: true,
        message: 'Branch deleted successfully'
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to delete branch'
      });
    }
  });

  // Get branch by ID
  fastify.get('/branches/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
  }
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const branch = await branchingService.getBranchById(id);
      
      reply.send({
        success: true,
        data: branch
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get branch'
      });
    }
  });

  // List branches
  fastify.get('/branches', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' },
          branchType: { type: 'string', enum: ['main', 'feature', 'hotfix', 'release', 'experiment'] },
          status: { type: 'string', enum: ['active', 'merged', 'abandoned', 'archived'] },
          protectionLevel: { type: 'string', enum: ['none', 'protected', 'locked'] },
          createdBy: { type: 'string', format: 'uuid' },
          parentBranchId: { type: 'string', format: 'uuid' },
          namePattern: { type: 'string' },
          createdAfter: { type: 'string', format: 'date-time' },
          createdBefore: { type: 'string', format: 'date-time' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          sortBy: { type: 'string', enum: ['name', 'created_at', 'updated_at', 'last_activity_at'], default: 'updated_at' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.query as any;
      
      const filter = {
        projectId: query.projectId,
        branchType: query.branchType,
        status: query.status,
        protectionLevel: query.protectionLevel,
        createdBy: query.createdBy,
        parentBranchId: query.parentBranchId,
        namePattern: query.namePattern,
        createdAfter: query.createdAfter ? new Date(query.createdAfter) : undefined,
        createdBefore: query.createdBefore ? new Date(query.createdBefore) : undefined,
        limit: query.limit || 20,
        offset: query.offset || 0,
        sortBy: query.sortBy || 'updated_at',
        sortOrder: query.sortOrder || 'desc'
      };

      const branches = await branchingService.listBranches(filter);
      
      reply.send({
        success: true,
        data: branches
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to list branches'
      });
    }
  });

  // Create commit
  fastify.post('/branches/:id/commits', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
  }
        required: ['id']
  }
      body: {
        type: 'object',
        properties: {
          snapshotId: { type: 'string', format: 'uuid' },
          commitMessage: { type: 'string' },
          parentCommitIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
          commitMetadata: { type: 'object' }
  }
        required: ['snapshotId']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const { snapshotId, commitMessage, parentCommitIds, commitMetadata } = request.body as any;
      
      const commitRequest = {
        branchId: id,
        snapshotId,
        commitMessage,
        parentCommitIds: parentCommitIds || [],
        commitMetadata: commitMetadata || {}
      };

      const commit = await branchingService.createCommit(commitRequest, userId);
      
      reply.status(201).send({
        success: true,
        data: commit
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to create commit'
      });
    }
  });

  // Create merge request
  fastify.post('/merge-requests', {
    schema: {
      body: CreateMergeRequestRequestSchema
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const mergeRequest = await branchingService.createMergeRequest(request.body, userId);
      
      reply.status(201).send({
        success: true,
        data: mergeRequest
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to create merge request'
      });
    }
  });

  // Merge branch
  fastify.post('/merge-requests/:id/merge', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
  }
        required: ['id']
  }
      body: {
        type: 'object',
        properties: {
          mergeStrategy: { type: 'string', enum: ['merge', 'squash', 'rebase'], default: 'merge' },
          commitMessage: { type: 'string' },
          deleteSourceBranch: { type: 'boolean', default: false }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const { mergeStrategy, commitMessage, deleteSourceBranch } = request.body as any;
      
      const mergeRequest = {
        mergeRequestId: id,
        mergeStrategy: mergeStrategy || 'merge',
        commitMessage,
        deleteSourceBranch: deleteSourceBranch || false
      };

      const result = await branchingService.mergeBranch(mergeRequest, userId);
      
      reply.send({
        success: true,
        data: result
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to merge branch'
      });
    }
  });

  // Get branch statistics
  fastify.get('/branches/stats/:projectId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' }
  }
        required: ['projectId']
      }
    }
  }, async (request, reply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      const stats = await branchingService.getBranchStats(projectId);
      
      reply.send({
        success: true,
        data: stats
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get branch statistics'
      });
    }
  });

  // Get branch hierarchy
  fastify.get('/branches/hierarchy/:projectId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' }
  }
        required: ['projectId']
      }
    }
  }, async (request, reply) => {
    try {
      const { projectId } = request.params as { projectId: string };
      const hierarchy = await branchingService.getBranchHierarchy(projectId);
      
      reply.send({
        success: true,
        data: hierarchy
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get branch hierarchy'
      });
    }
  });

  // Compare branches
  fastify.get('/branches/:sourceId/compare/:targetId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          sourceId: { type: 'string', format: 'uuid' },
          targetId: { type: 'string', format: 'uuid' }
  }
        required: ['sourceId', 'targetId']
      }
    }
  }, async (request, reply) => {
    try {
      const { sourceId, targetId } = request.params as { sourceId: string; targetId: string };
      const comparison = await branchingService.compareBranches(sourceId, targetId);
      
      reply.send({
        success: true,
        data: comparison
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to compare branches'
      });
    }
  });

  // Get commits for branch
  fastify.get('/branches/:id/commits', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
  }
        required: ['id']
  }
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const query = request.query as any;
      
      const result = await fastify.db.query(`
        SELECT * FROM branch_commits 
        WHERE branch_id = $1 
        ORDER BY commit_order ${query.sortOrder || 'desc'}
        LIMIT $2 OFFSET $3
      `, [id, query.limit || 20, query.offset || 0]);

      reply.send({
        success: true,
        data: result.rows
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get branch commits'
      });
    }
  });

  // List merge requests
  fastify.get('/merge-requests', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          projectId: { type: 'string', format: 'uuid' },
          sourceBranchId: { type: 'string', format: 'uuid' },
          targetBranchId: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['open', 'merged', 'closed', 'draft'] },
          createdBy: { type: 'string', format: 'uuid' },
          assignedTo: { type: 'string', format: 'uuid' },
          reviewerId: { type: 'string', format: 'uuid' },
          createdAfter: { type: 'string', format: 'date-time' },
          createdBefore: { type: 'string', format: 'date-time' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          sortBy: { type: 'string', enum: ['created_at', 'updated_at', 'title'], default: 'updated_at' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.query as any;
      
      let sql = `
        SELECT * FROM branch_merge_requests
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (query.projectId) {
        sql += ` AND project_id = $${paramIndex}`;
        params.push(query.projectId);
        paramIndex++;
      }

      if (query.sourceBranchId) {
        sql += ` AND source_branch_id = $${paramIndex}`;
        params.push(query.sourceBranchId);
        paramIndex++;
      }

      if (query.targetBranchId) {
        sql += ` AND target_branch_id = $${paramIndex}`;
        params.push(query.targetBranchId);
        paramIndex++;
      }

      if (query.status) {
        sql += ` AND status = $${paramIndex}`;
        params.push(query.status);
        paramIndex++;
      }

      if (query.createdBy) {
        sql += ` AND created_by = $${paramIndex}`;
        params.push(query.createdBy);
        paramIndex++;
      }

      if (query.assignedTo) {
        sql += ` AND assigned_to = $${paramIndex}`;
        params.push(query.assignedTo);
        paramIndex++;
      }

      if (query.createdAfter) {
        sql += ` AND created_at >= $${paramIndex}`;
        params.push(new Date(query.createdAfter));
        paramIndex++;
      }

      if (query.createdBefore) {
        sql += ` AND created_at <= $${paramIndex}`;
        params.push(new Date(query.createdBefore));
        paramIndex++;
      }

      sql += ` ORDER BY ${query.sortBy || 'updated_at'} ${query.sortOrder || 'desc'}`;
      sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(query.limit || 20, query.offset || 0);

      const result = await fastify.db.query(sql, params);
      
      reply.send({
        success: true,
        data: result.rows
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to list merge requests'
      });
    }
  });

  // Get merge request by ID
  fastify.get('/merge-requests/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
  }
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const result = await fastify.db.query(`
        SELECT * FROM branch_merge_requests WHERE id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Merge request not found'
        });
      }

      reply.send({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get merge request'
      });
    }
  });

  // Update merge request
  fastify.put('/merge-requests/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
  }
        required: ['id']
  }
      body: UpdateMergeRequestRequestSchema
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const updates = request.body as any;
      
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (updates.title !== undefined) {
        updateFields.push(`title = $${paramIndex}`);
        updateValues.push(updates.title);
        paramIndex++;
      }

      if (updates.description !== undefined) {
        updateFields.push(`description = $${paramIndex}`);
        updateValues.push(updates.description);
        paramIndex++;
      }

      if (updates.assignedTo !== undefined) {
        updateFields.push(`assigned_to = $${paramIndex}`);
        updateValues.push(updates.assignedTo);
        paramIndex++;
      }

      if (updates.reviewers !== undefined) {
        updateFields.push(`reviewers = $${paramIndex}`);
        updateValues.push(updates.reviewers);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'No fields to update'
        });
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const result = await fastify.db.query(`
        UPDATE branch_merge_requests 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, updateValues);

      if (result.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Merge request not found'
        });
      }

      reply.send({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to update merge request'
      });
    }
  });

  // Close merge request
  fastify.post('/merge-requests/:id/close', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
  }
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
      
      const result = await fastify.db.query(`
        UPDATE branch_merge_requests 
        SET status = 'closed', closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [id]);

      if (result.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Merge request not found'
        });
      }

      reply.send({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to close merge request'
      });
    }
  });

  // Create review for merge request
  fastify.post('/merge-requests/:id/reviews', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
  }
        required: ['id']
  }
      body: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'commented'] },
          reviewMessage: { type: 'string' }
  }
        required: ['status']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const { status, reviewMessage } = request.body as any;
      
      const result = await fastify.db.query(`
        INSERT INTO branch_merge_reviews (merge_request_id, reviewer_id, status, review_message)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (merge_request_id, reviewer_id) DO UPDATE SET
          status = EXCLUDED.status,
          review_message = EXCLUDED.review_message,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [id, userId, status, reviewMessage]);

      reply.status(201).send({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to create review'
      });
    }
  });

  // Get reviews for merge request
  fastify.get('/merge-requests/:id/reviews', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
  }
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const result = await fastify.db.query(`
        SELECT r.*, u.name as reviewer_name
        FROM branch_merge_reviews r
        JOIN users u ON r.reviewer_id = u.id
        WHERE r.merge_request_id = $1
        ORDER BY r.submitted_at DESC
      `, [id]);

      reply.send({
        success: true,
        data: result.rows
      });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get reviews'
      });
    }
  });
}