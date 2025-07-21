// Data Access API Routes - Epic 19 Implementation
// RESTful API for data access control and management

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DataAccessControlService, DataAccessRequest, DataOperation } from '../services/DataAccessControlService';
import { z } from 'zod';

// Request schemas
const CheckAccessSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
  resourceType: z.string().min(1, 'Resource type is required'),
  operation: z.enum(['READ', 'write', 'delete', 'export', 'share', 'modify', 'create', 'list', 'search'] as const),
  context: z.object({
    sessionId: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    purpose: z.string().optional(),
    additionalData: z.record(z.any()).optional()
  }).optional()
});

const RequestAccessSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
  resourceType: z.string().min(1, 'Resource type is required'),
  operation: z.enum(['read', 'write', 'delete', 'export', 'share', 'modify', 'create', 'list', 'search'] as const),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  expiresAt: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  context: z.object({
    sessionId: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    purpose: z.string().optional(),
    requestedBy: z.string().optional()
  }).optional()
});

const RevokeAccessSchema = z.object({
  grantId: z.string().min(1, 'Grant ID is required'),
  reason: z.string().min(5, 'Revocation reason is required')
});

const AuditQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
  operation: z.enum(
    ['read',
    'write',
    'delete',
    'export',
    'share',
    'modify',
    'create',
    'list',
    'search'] as const
  ).optional(),
  allowed: z.coerce.boolean().optional(),
  startDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined)
});

// Type definitions for requests
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

interface CheckAccessRequest extends AuthenticatedRequest {
  Params: { resourceId: string };
  Body: z.infer<typeof CheckAccessSchema>;
}

interface RequestAccessRequest extends AuthenticatedRequest {
  Body: z.infer<typeof RequestAccessSchema>;
}

interface RevokeAccessRequest extends AuthenticatedRequest {
  Body: z.infer<typeof RevokeAccessSchema>;
}

interface AuditRequest extends AuthenticatedRequest {
  Params: { userId: string };
  Querystring: z.infer<typeof AuditQuerySchema>;
}

interface UserGrantsRequest extends AuthenticatedRequest {
  Params: { userId: string };
}

export async function dataAccessRoutes(fastify: FastifyInstance) {
  // Get the data access control service from the DI container
  const dataAccessService = fastify.dataAccessControlService as DataAccessControlService;

  // Middleware to verify authentication
  const authenticate = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      // Check for JWT token in Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Valid authentication token required'
        });
      }

      // Verify token (implementation depends on your JWT setup)
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

  // Middleware to check admin permissions
  const requireAdmin = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user?.roles?.includes('admin') && !request.user?.roles?.includes('data_admin')) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Admin privileges required'
      });
    }
  };

  // Rate limiting configuration
  const rateLimitConfig = {
    max: 100, // Maximum requests per window
    timeWindow: '1 minute'
  };

  /**
   * Check user permissions for a specific resource
   * GET /api/data-access/permissions/:resourceId
   */
  fastify.get('/permissions/:resourceId', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      params: {
        type: 'object',
        properties: {
          resourceId: { type: 'string' }
        },
        required: ['resourceId']
      },
      querystring: {
        type: 'object',
        properties: {
          resourceType: { type: 'string' },
          operation: { 
            type: 'string', 
            enum: ['read', 'write', 'delete', 'export', 'share', 'modify', 'create', 'list', 'search']
          }
        },
        required: ['resourceType', 'operation']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            allowed: { type: 'boolean' },
            reason: { type: 'string' },
            classification: { type: 'string' },
            accessLevel: { type: 'string' },
            requiredPermissions: { type: 'array', items: { type: 'string' } },
            actualPermissions: { type: 'array', items: { type: 'string' } },
            restrictions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  value: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            auditId: { type: 'string' }
          }
        }
      }
    }
  }, async (request: CheckAccessRequest, reply: FastifyReply) => {
    try {
      const { resourceId } = request.params;
      const { resourceType, operation } = request.query as any;

      const accessRequest: DataAccessRequest = {
        userId: request.user!.id,
        resourceId,
        resourceType,
        operation: operation.toUpperCase() as DataOperation,
        context: {
          sessionId: request.headers['x-session-id'] as string,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        }
      };

      const result = await dataAccessService.checkAccess(accessRequest);
      
      reply.send(result);
    } catch (error) {
      fastify.log.error('Error checking access permissions:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to check access permissions'
      });
    }
  });

  /**
   * Request elevated access to a resource
   * POST /api/data-access/request
   */
  fastify.post('/request', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    schema: {
      body: {
        type: 'object',
        properties: {
          resourceId: { type: 'string' },
          resourceType: { type: 'string' },
          operation: { 
            type: 'string',
            enum: ['read', 'write', 'delete', 'export', 'share', 'modify', 'create', 'list', 'search']
          },
          reason: { type: 'string', minLength: 10 },
          expiresAt: { type: 'string', format: 'date-time' },
          context: {
            type: 'object',
            properties: {
              sessionId: { type: 'string' },
              ipAddress: { type: 'string' },
              userAgent: { type: 'string' },
              purpose: { type: 'string' },
              requestedBy: { type: 'string' }
            }
          }
        },
        required: ['resourceId', 'resourceType', 'operation', 'reason']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            requestId: { type: 'string' },
            status: { type: 'string', enum: ['approved', 'pending', 'denied'] },
            message: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (request: RequestAccessRequest, reply: FastifyReply) => {
    try {
      const validatedBody = RequestAccessSchema.parse(request.body);

      const accessRequest: DataAccessRequest = {
        userId: request.user!.id,
        ...validatedBody,
        operation: validatedBody.operation.toUpperCase() as DataOperation,
        context: {
          sessionId: request.headers['x-session-id'] as string,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          ...validatedBody.context
        }
      };

      const result = await dataAccessService.requestAccess(accessRequest);
      
      reply.send(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        fastify.log.error('Error requesting access:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to process access request'
        });
      }
    }
  });

  /**
   * Get user's access history
   * GET /api/data-access/audit/:userId
   */
  fastify.get('/audit/:userId', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        },
        required: ['userId']
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          operation: { 
            type: 'string',
            enum: ['read', 'write', 'delete', 'export', 'share', 'modify', 'create', 'list', 'search']
          },
          allowed: { type: 'boolean' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  userId: { type: 'string' },
                  resourceId: { type: 'string' },
                  operation: { type: 'string' },
                  allowed: { type: 'boolean' },
                  reason: { type: 'string' },
                  classification: { type: 'string' },
                  accessLevel: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' },
                  riskScore: { type: 'number' }
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
  }, async (request: AuditRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      const queryParams = AuditQuerySchema.parse(request.query);

      // Check if user can access audit logs
      if (request.user!.id !== userId && !request.user!.roles?.includes('admin')) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Cannot access audit logs for other users'
        });
      }

      const auditEvents = await dataAccessService.getUserAccessHistory(
        userId,
        queryParams.limit,
        queryParams.offset
      );

      // Filter by additional criteria if provided
      let filteredEvents = auditEvents;
      
      if (queryParams.operation) {
        filteredEvents = filteredEvents.filter(event => 
          event.operation.toLowerCase() === queryParams.operation!.toLowerCase()
        );
      }

      if (queryParams.allowed !== undefined) {
        filteredEvents = filteredEvents.filter(event => 
          event.allowed === queryParams.allowed
        );
      }

      if (queryParams.startDate) {
        filteredEvents = filteredEvents.filter(event => 
          event.timestamp >= queryParams.startDate!
        );
      }

      if (queryParams.endDate) {
        filteredEvents = filteredEvents.filter(event => 
          event.timestamp <= queryParams.endDate!
        );
      }

      reply.send({
        data: filteredEvents,
        pagination: {
          limit: queryParams.limit,
          offset: queryParams.offset,
          total: filteredEvents.length
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
        fastify.log.error('Error retrieving audit logs:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to retrieve audit logs'
        });
      }
    }
  });

  /**
   * Revoke specific access grant
   * POST /api/data-access/revoke
   */
  fastify.post('/revoke', {
    preHandler: [authenticate, requireAdmin],
    config: { rateLimit: { max: 50, timeWindow: '1 minute' } },
    schema: {
      body: {
        type: 'object',
        properties: {
          grantId: { type: 'string' },
          reason: { type: 'string', minLength: 5 }
        },
        required: ['grantId', 'reason']
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
  }, async (request: RevokeAccessRequest, reply: FastifyReply) => {
    try {
      const validatedBody = RevokeAccessSchema.parse(request.body);

      const success = await dataAccessService.revokeAccess(
        validatedBody.grantId,
        request.user!.id,
        validatedBody.reason
      );

      if (success) {
        reply.send({
          success: true,
          message: 'Access grant revoked successfully'
        });
      } else {
        reply.code(404).send({
          error: 'Not Found',
          message: 'Access grant not found or already revoked'
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        fastify.log.error('Error revoking access:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to revoke access grant'
        });
      }
    }
  });

  /**
   * Get user's active access grants
   * GET /api/data-access/grants/:userId
   */
  fastify.get('/grants/:userId', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        },
        required: ['userId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            grants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  resourceId: { type: 'string' },
                  resourceType: { type: 'string' },
                  operations: { type: 'array', items: { type: 'string' } },
                  classification: { type: 'string' },
                  grantedBy: { type: 'string' },
                  grantedAt: { type: 'string', format: 'date-time' },
                  expiresAt: { type: 'string', format: 'date-time' },
                  reason: { type: 'string' },
                  restrictions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string' },
                        value: { type: 'string' },
                        description: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: UserGrantsRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params;

      // Check if user can access grants
      if (request.user!.id !== userId && !request.user!.roles?.includes('admin')) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Cannot access grants for other users'
        });
      }

      const grants = await dataAccessService.getUserAccessGrants(userId);

      reply.send({ grants });
    } catch (error) {
      fastify.log.error('Error retrieving access grants:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve access grants'
      });
    }
  });

  /**
   * Get data access statistics (admin only)
   * GET /api/data-access/stats
   */
  fastify.get('/stats', {
    preHandler: [authenticate, requireAdmin],
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    schema: {
      querystring: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['day', 'week', 'month'], default: 'week' },
          classification: { type: 'string', enum: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'] }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            totalRequests: { type: 'integer' },
            approvedRequests: { type: 'integer' },
            deniedRequests: { type: 'integer' },
            pendingRequests: { type: 'integer' },
            topOperations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  operation: { type: 'string' },
                  count: { type: 'integer' }
                }
              }
            },
            classificationBreakdown: {
              type: 'object',
              properties: {
                PUBLIC: { type: 'integer' },
                INTERNAL: { type: 'integer' },
                CONFIDENTIAL: { type: 'integer' },
                RESTRICTED: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // This would typically query the audit logs and generate statistics
      // For now, return a placeholder response
      reply.send({
        totalRequests: 0,
        approvedRequests: 0,
        deniedRequests: 0,
        pendingRequests: 0,
        topOperations: [],
        classificationBreakdown: {
          PUBLIC: 0,
          INTERNAL: 0,
          CONFIDENTIAL: 0,
          RESTRICTED: 0
        }
      });
    } catch (error) {
      fastify.log.error('Error retrieving access statistics:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve access statistics'
      });
    }
  });

  /**
   * Health check endpoint
   * GET /api/data-access/health
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
  await fastify.register(dataAccessRoutes, { prefix: '/api/data-access' });
}