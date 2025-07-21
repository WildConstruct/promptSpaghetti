/**
 * Audit Team Collaboration API Routes
 * 
 * REST API endpoints for audit team collaboration functionality including
 * investigations, tasks, evidence collection, and team notifications.
 * 
 * Epic 19 Task T-1752989143998-618: Add audit team collaboration tools
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { 
  AuditTeamCollaborationService,
  InvestigationStatus,
  InvestigationPriority,
  InvestigationCategory,
  TaskStatus,
  EvidenceType
} from '../services/AuditTeamCollaborationService';

// Validation schemas
const CreateInvestigationSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  category: z.nativeEnum(InvestigationCategory),
  priority: z.nativeEnum(InvestigationPriority),
  leadInvestigator: z.string().min(1),
  assignedTeam: z.array(z.string()).default([]),
  reportedBy: z.string().min(1),
  dueDate: z.string().datetime().optional(),
  relatedAuditLogIds: z.array(z.string()).default([]),
  relatedIncidentIds: z.array(z.string()).default([]),
  affectedSystems: z.array(z.string()).default([]),
  affectedUsers: z.array(z.string()).default([]),
  confidentialityLevel: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']).default('INTERNAL'),
  complianceFrameworks: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({})
});

const UpdateInvestigationSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(InvestigationStatus).optional(),
  priority: z.nativeEnum(InvestigationPriority).optional(),
  assignedTeam: z.array(z.string()).optional(),
  dueDate: z.string().datetime().optional(),
  findings: z.string().optional(),
  rootCause: z.string().optional(),
  remediationActions: z.array(z.string()).optional(),
  lessonsLearned: z.string().optional(),
  tags: z.array(z.string()).optional()
});

const CreateTaskSchema = z.object({
  investigationId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  assignedTo: z.string().min(1),
  priority: z.nativeEnum(InvestigationPriority).default(InvestigationPriority.MEDIUM),
  dueDate: z.string().datetime().optional(),
  dependencies: z.array(z.string()).default([]),
  estimatedHours: z.number().positive().optional(),
  metadata: z.record(z.any()).default({})
});

const AddEvidenceSchema = z.object({
  investigationId: z.string().uuid(),
  taskId: z.string().uuid().optional(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  type: z.nativeEnum(EvidenceType),
  fileName: z.string().optional(),
  fileSize: z.number().positive().optional(),
  filePath: z.string().optional(),
  fileHash: z.string().optional(),
  source: z.string().min(1),
  content: z.string().optional(),
  confidentialityLevel: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']).default('INTERNAL'),
  metadata: z.record(z.any()).default({})
});

const AddCommentSchema = z.object({
  investigationId: z.string().uuid(),
  taskId: z.string().uuid().optional(),
  content: z.string().min(1),
  commentType: z.enum(['COMMENT', 'STATUS_UPDATE', 'FINDING', 'QUESTION', 'DECISION']).default('COMMENT'),
  mentions: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({})
});

const InvestigationFiltersSchema = z.object({
  status: z.nativeEnum(InvestigationStatus).optional(),
  assignedTo: z.string().optional(),
  category: z.nativeEnum(InvestigationCategory).optional(),
  priority: z.nativeEnum(InvestigationPriority).optional(),
  limit: z.number().positive().max(100).default(50),
  offset: z.number().min(0).default(0)
});

/**
 * Register audit team collaboration routes
 */
export async function auditTeamCollaborationRoutes(
  fastify: FastifyInstance,
  collaborationService: AuditTeamCollaborationService
) {
  // Initialize schema if needed
  await collaborationService.initializeSchema();

  /**
   * Create new investigation
   */
  fastify.post('/investigations', {
    schema: {
      body: CreateInvestigationSchema,
      response: {
        201: z.object({
          success: z.boolean(),
          investigation: z.any(),
          message: z.string()
        })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const investigationData = request.body as z.infer<typeof CreateInvestigationSchema>;
      
      // Convert dueDate string to Date if provided
      const processedData = {
        ...investigationData,
        dueDate: investigationData.dueDate ? new Date(investigationData.dueDate) : undefined
      };

      const investigation = await collaborationService.createInvestigation(processedData);

      reply.status(201).send({
        success: true,
        investigation,
        message: 'Investigation created successfully'
      });
    } catch (error) {
      console.error('Error creating investigation:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to create investigation',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get investigations with filtering
   */
  fastify.get('/investigations', {
    schema: {
      querystring: InvestigationFiltersSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          investigations: z.array(z.any()),
          total: z.number(),
          limit: z.number(),
          offset: z.number()
        })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const filters = request.query as z.infer<typeof InvestigationFiltersSchema>;
      const result = await collaborationService.getInvestigations(filters);

      reply.send({
        success: true,
        investigations: result.investigations,
        total: result.total,
        limit: filters.limit,
        offset: filters.offset
      });
    } catch (error) {
      console.error('Error getting investigations:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get investigations',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get specific investigation
   */
  fastify.get('/investigations/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          investigation: z.any()
        }),
        404: z.object({
          success: z.boolean(),
          error: z.string()
        })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const investigation = await collaborationService.getInvestigation(id);

      if (!investigation) {
        reply.status(404).send({
          success: false,
          error: 'Investigation not found'
        });
        return;
      }

      reply.send({
        success: true,
        investigation
      });
    } catch (error) {
      console.error('Error getting investigation:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get investigation',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Update investigation
   */
  fastify.put('/investigations/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: UpdateInvestigationSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string()
        })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const updates = request.body as z.infer<typeof UpdateInvestigationSchema>;
      
      // Get user from JWT token (implement based on your auth system)
      const updatedBy = 'current-user'; // TODO: Extract from JWT

      // Convert dueDate string to Date if provided
      const processedUpdates = {
        ...updates,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined
      };

      await collaborationService.updateInvestigation(id, processedUpdates, updatedBy);

      reply.send({
        success: true,
        message: 'Investigation updated successfully'
      });
    } catch (error) {
      console.error('Error updating investigation:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to update investigation',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Create task
   */
  fastify.post('/tasks', {
    schema: {
      body: CreateTaskSchema,
      response: {
        201: z.object({
          success: z.boolean(),
          task: z.any(),
          message: z.string()
        })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const taskData = request.body as z.infer<typeof CreateTaskSchema>;
      
      const processedData = {
        ...taskData,
        status: TaskStatus.PENDING,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined
      };

      const task = await collaborationService.createTask(processedData);

      reply.status(201).send({
        success: true,
        task,
        message: 'Task created successfully'
      });
    } catch (error) {
      console.error('Error creating task:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to create task',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Add evidence
   */
  fastify.post('/evidence', {
    schema: {
      body: AddEvidenceSchema,
      response: {
        201: z.object({
          success: z.boolean(),
          evidence: z.any(),
          message: z.string()
        })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const evidenceData = request.body as z.infer<typeof AddEvidenceSchema>;
      
      // Get current user (implement based on your auth system)
      const collectedBy = 'current-user'; // TODO: Extract from JWT
      
      const evidence = await collaborationService.addEvidence(evidenceData, collectedBy);

      reply.status(201).send({
        success: true,
        evidence,
        message: 'Evidence added successfully'
      });
    } catch (error) {
      console.error('Error adding evidence:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to add evidence',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Add comment
   */
  fastify.post('/comments', {
    schema: {
      body: AddCommentSchema,
      response: {
        201: z.object({
          success: z.boolean(),
          message: z.string()
        })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const commentData = request.body as z.infer<typeof AddCommentSchema>;
      
      // Get current user (implement based on your auth system)
      const author = 'current-user'; // TODO: Extract from JWT
      
      const processedData = {
        ...commentData,
        author
      };

      await collaborationService.addComment(processedData);

      reply.status(201).send({
        success: true,
        message: 'Comment added successfully'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to add comment',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get collaboration metrics
   */
  fastify.get('/metrics', {
    schema: {
      querystring: z.object({
        timeframe: z.enum(['day', 'week', 'month']).default('week')
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          metrics: z.any(),
          timeframe: z.string()
        })
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { timeframe } = request.query as { timeframe: 'day' | 'week' | 'month' };
      const metrics = await collaborationService.getCollaborationMetrics(timeframe);

      reply.send({
        success: true,
        metrics,
        timeframe
      });
    } catch (error) {
      console.error('Error getting collaboration metrics:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to get collaboration metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Health check endpoint
   */
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      status: 'healthy',
      service: 'audit-team-collaboration',
      timestamp: new Date().toISOString()
    });
  });
}

export default auditTeamCollaborationRoutes;