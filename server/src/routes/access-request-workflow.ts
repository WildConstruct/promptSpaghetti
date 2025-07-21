// Access Request Workflow API Routes - Epic 19
// RESTful API for access request workflow management

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  AccessRequestWorkflowService,
  Operation,
  RequestUrgency,
  AccessLevel,
  ApprovalDecision,
  RequestStatus
} from '../services/AccessRequestWorkflowService';
import { z } from 'zod';

// Request schemas
const SubmitRequestSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
  resourceType: z.string().min(1, 'Resource type is required'),
  resourceDescription: z.string().min(10, 'Resource description must be at least 10 characters'),
  requestedOperations: z.array(z.enum(['read', 'WRITE', 'DELETE', 'EXPORT', 'ADMIN'] as const)).min(1, 'At least one operation is required'),
  businessJustification: z.string().min(20, 'Business justification must be at least 20 characters'),
  urgency: z.enum(['LOW', 'NORMAL', 'HIGH', 'EMERGENCY'] as const).default('NORMAL'),
  requestedAccess: z.enum(['read', 'read_write', 'full_access', 'admin'] as const),
  timeframe: z.object({
    startDate: z.string().datetime().transform(val => new Date(val)).optional(),
    endDate: z.string().datetime().transform(val => new Date(val)).optional(),
    duration: z.number().min(1).max(365).optional(), // days
    timezone: z.string().default('UTC'),
    businessHoursOnly: z.boolean().default(false),
    recurring: z.object({
      frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as const),
      interval: z.number().min(1).default(1),
      daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
      endAfter: z.string().datetime().transform(val => new Date(val)).optional(),
      maxOccurrences: z.number().min(1).optional()
    }).optional()
  }),
  requiredBy: z.string().datetime().transform(val => new Date(val)).optional(),
  expiresAt: z.string().datetime().transform(val => new Date(val)).optional(),
  metadata: z.record(z.any()).default({})
});

const ApprovalDecisionSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'APPROVED_WITH_CONDITIONS'] as const),
  comments: z.string().optional(),
  conditions: z.array(z.string()).optional()
});

const CancelRequestSchema = z.object({
  reason: z.string().min(10, 'Cancellation reason must be at least 10 characters')
});

const RequestFiltersSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'PROVISIONED'] as const).optional(),
  urgency: z.enum(['LOW', 'NORMAL', 'HIGH', 'EMERGENCY'] as const).optional(),
  resourceType: z.string().optional(),
  requestorId: z.string().optional(),
  submittedAfter: z.string().datetime().transform(val => new Date(val)).optional(),
  submittedBefore: z.string().datetime().transform(val => new Date(val)).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
});

// Type definitions for requests
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

interface SubmitRequestBody extends AuthenticatedRequest {
  Body: z.infer<typeof SubmitRequestSchema>;
}

interface ApprovalDecisionBody extends AuthenticatedRequest {
  Params: { requestId: string };
  Body: z.infer<typeof ApprovalDecisionSchema>;
}

interface CancelRequestBody extends AuthenticatedRequest {
  Params: { requestId: string };
  Body: z.infer<typeof CancelRequestSchema>;
}

interface RequestDetailParams extends AuthenticatedRequest {
  Params: { requestId: string };
}

interface RequestListQuery extends AuthenticatedRequest {
  Querystring: z.infer<typeof RequestFiltersSchema>;
}

export async function accessRequestWorkflowRoutes(fastify: FastifyInstance) {
  // Get the access request workflow service from the DI container
  const accessRequestService = fastify.accessRequestWorkflowService as AccessRequestWorkflowService;

  // Middleware to verify authentication
  const authenticate = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Valid authentication token required'
        });
      }

      const token = authHeader.slice(7);
      const user = await fastify.jwt.verify(token) as any;
      
      if (!user?.id) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Invalid authentication token'
        });
      }

      request.user = user;
    } catch (error) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Authentication failed'
      });
    }
  };

  // Rate limiting configuration
  const rateLimitConfig = {
    max: 50, // Maximum requests per window
    timeWindow: '1 hour'
  };

  /**
   * Submit new access request
   * POST /api/access-request-workflow/requests
   */
  fastify.post('/requests', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      body: {
        type: 'object',
        properties: {
          resourceId: { type: 'string', minLength: 1 },
          resourceType: { type: 'string', minLength: 1 },
          resourceDescription: { type: 'string', minLength: 10 },
          requestedOperations: {
            type: 'array',
            items: { type: 'string', enum: ['read', 'WRITE', 'DELETE', 'EXPORT', 'ADMIN'] },
            minItems: 1
          },
          businessJustification: { type: 'string', minLength: 20 },
          urgency: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'EMERGENCY'], default: 'NORMAL' },
          requestedAccess: { type: 'string', enum: ['read', 'read_write', 'full_access', 'admin'] },
          timeframe: {
            type: 'object',
            properties: {
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              duration: { type: 'number', minimum: 1, maximum: 365 },
              timezone: { type: 'string', default: 'UTC' },
              businessHoursOnly: { type: 'boolean', default: false }
            }
          },
          requiredBy: { type: 'string', format: 'date-time' },
          expiresAt: { type: 'string', format: 'date-time' },
          metadata: { type: 'object', default: {} }
        },
        required: ['resourceId', 'resourceType', 'resourceDescription', 'requestedOperations', 'businessJustification', 'requestedAccess', 'timeframe']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            requestId: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: SubmitRequestBody, reply: FastifyReply) => {
    try {
      const validatedBody = SubmitRequestSchema.parse(request.body);

      const accessRequest = {
        ...validatedBody,
        requestorId: request.user!.id,
        requestorEmail: request.user!.email
      };

      const result = await accessRequestService.submitAccessRequest(accessRequest);
      
      reply.send({
        requestId: result.requestId,
        message: 'Access request submitted successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        fastify.log.error('Error submitting access request:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to submit access request'
        });
      }
    }
  });

  /**
   * Process approval decision
   * POST /api/access-request-workflow/requests/:requestId/approve
   */
  fastify.post('/requests/:requestId/approve', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'string' }
        },
        required: ['requestId']
      },
      body: {
        type: 'object',
        properties: {
          decision: { type: 'string', enum: ['APPROVED', 'REJECTED', 'APPROVED_WITH_CONDITIONS'] },
          comments: { type: 'string' },
          conditions: { type: 'array', items: { type: 'string' } }
        },
        required: ['decision']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            nextStage: { type: 'object' },
            completed: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: ApprovalDecisionBody, reply: FastifyReply) => {
    try {
      const { requestId } = request.params;
      const validatedBody = ApprovalDecisionSchema.parse(request.body);

      const result = await accessRequestService.processApprovalDecision(
        requestId,
        request.user!.id,
        validatedBody.decision as ApprovalDecision,
        validatedBody.comments,
        validatedBody.conditions
      );
      
      const message = result.completed 
        ? (validatedBody.decision === 'APPROVED' ? 'Request approved and access provisioned' : 'Request rejected')
        : 'Decision recorded, moved to next approval stage';

      reply.send({
        nextStage: result.nextStage,
        completed: result.completed,
        message
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        fastify.log.error('Error processing approval decision:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to process approval decision'
        });
      }
    }
  });

  /**
   * Get pending requests for approval
   * GET /api/access-request-workflow/approvals/pending
   */
  fastify.get('/approvals/pending', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 100, timeWindow: '1 minute' } },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            requests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  requestId: { type: 'string' },
                  requestorEmail: { type: 'string' },
                  resourceId: { type: 'string' },
                  resourceType: { type: 'string' },
                  resourceDescription: { type: 'string' },
                  requestedOperations: { type: 'array', items: { type: 'string' } },
                  businessJustification: { type: 'string' },
                  urgency: { type: 'string' },
                  requestedAccess: { type: 'string' },
                  submittedAt: { type: 'string', format: 'date-time' },
                  requiredBy: { type: 'string', format: 'date-time' },
                  currentStage: { type: 'object' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const requests = await accessRequestService.getPendingRequestsForApprover(request.user!.id);
      
      reply.send({
        requests: requests.map(req => ({
          requestId: req.requestId,
          requestorEmail: req.requestorEmail,
          resourceId: req.resourceId,
          resourceType: req.resourceType,
          resourceDescription: req.resourceDescription,
          requestedOperations: req.requestedOperations,
          businessJustification: req.businessJustification,
          urgency: req.urgency,
          requestedAccess: req.requestedAccess,
          submittedAt: req.submittedAt.toISOString(),
          requiredBy: req.requiredBy?.toISOString(),
          currentStage: req.currentStage
        }))
      });

    } catch (error) {
      fastify.log.error('Error getting pending requests:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get pending requests'
      });
    }
  });

  /**
   * Get request details and history
   * GET /api/access-request-workflow/requests/:requestId
   */
  fastify.get('/requests/:requestId', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 100, timeWindow: '1 minute' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'string' }
        },
        required: ['requestId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            request: {
              type: 'object',
              properties: {
                requestId: { type: 'string' },
                requestorId: { type: 'string' },
                requestorEmail: { type: 'string' },
                resourceId: { type: 'string' },
                resourceType: { type: 'string' },
                resourceDescription: { type: 'string' },
                requestedOperations: { type: 'array', items: { type: 'string' } },
                businessJustification: { type: 'string' },
                urgency: { type: 'string' },
                requestedAccess: { type: 'string' },
                timeframe: { type: 'object' },
                approvalWorkflow: { type: 'object' },
                currentStage: { type: 'object' },
                status: { type: 'string' },
                submittedAt: { type: 'string', format: 'date-time' },
                requiredBy: { type: 'string', format: 'date-time' },
                expiresAt: { type: 'string', format: 'date-time' }
              }
            },
            auditTrail: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  entryId: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' },
                  actorId: { type: 'string' },
                  action: { type: 'string' },
                  details: { type: 'object' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: RequestDetailParams, reply: FastifyReply) => {
    try {
      const { requestId } = request.params;

      const details = await accessRequestService.getRequestDetails(requestId);
      
      reply.send({
        request: {
          requestId: details.request.requestId,
          requestorId: details.request.requestorId,
          requestorEmail: details.request.requestorEmail,
          resourceId: details.request.resourceId,
          resourceType: details.request.resourceType,
          resourceDescription: details.request.resourceDescription,
          requestedOperations: details.request.requestedOperations,
          businessJustification: details.request.businessJustification,
          urgency: details.request.urgency,
          requestedAccess: details.request.requestedAccess,
          timeframe: details.request.timeframe,
          approvalWorkflow: details.request.approvalWorkflow,
          currentStage: details.request.currentStage,
          status: details.request.status,
          submittedAt: details.request.submittedAt.toISOString(),
          requiredBy: details.request.requiredBy?.toISOString(),
          expiresAt: details.request.expiresAt?.toISOString()
        },
        auditTrail: details.auditTrail.map(entry => ({
          entryId: entry.entryId,
          timestamp: entry.timestamp.toISOString(),
          actorId: entry.actorId,
          action: entry.action,
          details: entry.details
        }))
      });

    } catch (error) {
      if (error.message === 'Access request not found') {
        reply.code(404).send({
          error: 'Not Found',
          message: 'Access request not found'
        });
      } else {
        fastify.log.error('Error getting request details:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to get request details'
        });
      }
    }
  });

  /**
   * Cancel access request
   * POST /api/access-request-workflow/requests/:requestId/cancel
   */
  fastify.post('/requests/:requestId/cancel', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'string' }
        },
        required: ['requestId']
      },
      body: {
        type: 'object',
        properties: {
          reason: { type: 'string', minLength: 10 }
        },
        required: ['reason']
      },
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
  }, async (request: CancelRequestBody, reply: FastifyReply) => {
    try {
      const { requestId } = request.params;
      const validatedBody = CancelRequestSchema.parse(request.body);

      await accessRequestService.cancelAccessRequest(
        requestId,
        request.user!.id,
        validatedBody.reason
      );
      
      reply.send({
        success: true,
        message: 'Access request cancelled successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        fastify.log.error('Error cancelling access request:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to cancel access request'
        });
      }
    }
  });

  /**
   * Get request list with filters
   * GET /api/access-request-workflow/requests
   */
  fastify.get('/requests', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 100, timeWindow: '1 minute' } },
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'PROVISIONED'] },
          urgency: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'EMERGENCY'] },
          resourceType: { type: 'string' },
          requestorId: { type: 'string' },
          submittedAfter: { type: 'string', format: 'date-time' },
          submittedBefore: { type: 'string', format: 'date-time' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            requests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  requestId: { type: 'string' },
                  requestorEmail: { type: 'string' },
                  resourceId: { type: 'string' },
                  resourceType: { type: 'string' },
                  urgency: { type: 'string' },
                  status: { type: 'string' },
                  submittedAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                limit: { type: 'integer' },
                offset: { type: 'integer' },
                total: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  }, async (request: RequestListQuery, reply: FastifyReply) => {
    try {
      const filters = RequestFiltersSchema.parse(request.query);

      // For demo purposes, return empty list with pagination structure
      // In real implementation, this would query the database with filters
      reply.send({
        requests: [],
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: 0
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid query parameters',
          details: error.errors
        });
      } else {
        fastify.log.error('Error getting request list:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to get request list'
        });
      }
    }
  });

  /**
   * Process workflow timeouts (admin endpoint)
   * POST /api/access-request-workflow/admin/process-timeouts
   */
  fastify.post('/admin/process-timeouts', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            processedRequests: { type: 'number' },
            escalatedRequests: { type: 'number' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      // Check if user has admin role
      if (!request.user?.roles?.includes('admin')) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Admin role required'
        });
      }

      const result = await accessRequestService.processWorkflowTimeouts();
      
      reply.send({
        processedRequests: result.processedRequests,
        escalatedRequests: result.escalatedRequests,
        message: `Processed ${result.processedRequests} timed out requests, escalated ${result.escalatedRequests}`
      });

    } catch (error) {
      fastify.log.error('Error processing workflow timeouts:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to process workflow timeouts'
      });
    }
  });

  /**
   * Health check endpoint
   * GET /api/access-request-workflow/health
   */
  fastify.get('/health', {
    config: { rateLimit: { max: 200, timeWindow: '1 minute' } },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });
}

// Register the plugin
export default async function (fastify: FastifyInstance) {
  await fastify.register(accessRequestWorkflowRoutes, { prefix: '/api/access-request-workflow' });
}