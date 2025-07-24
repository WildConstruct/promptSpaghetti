/**
 * Temporary Access Grant Routes
 * 
 * API endpoints for managing temporary access grants including creation,
 * activation, validation, revocation, and monitoring.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  TemporaryAccessGrantService,
  GrantCreationRequest,
  GrantRevocationRequest,
  GrantSearchFilters
} from '../services/TemporaryAccessGrantService';
import { 
  DataClassificationLevel,
  DataOperation,
  OperationContext
} from '../../../../packages/core/types/DataClassification';
import { AuditService } from '../auth/services/AuditService';
import { DataAccessControlService } from '../services/DataAccessControlService';
import { AccessRequestWorkflowService } from '../services/AccessRequestWorkflowService';

// Request/Response Type Definitions
interface CreateGrantRequest {
  Body: {
    granteeId: string;
    permissions: Array<{
      operation: DataOperation;
      dataClassification: DataClassificationLevel;
      resourceTypes: string[];
      resourcePatterns: string[];
      exclusions?: string[];
      usageLimit?: number;
      rateLimits?: Array<{
        type: 'REQUESTS_PER_MINUTE' | 'REQUESTS_PER_HOUR' | 'DATA_VOLUME_PER_DAY' | 'CONCURRENT_SESSIONS';
        limit: number;
        window: number;
        burstAllowed?: boolean;
        burstLimit?: number;
      }>;
    }>;
    accessScope: {
      type: 'RESOURCE_SPECIFIC' | 'CLASSIFICATION_LEVEL' | 'DEPARTMENT' | 'PROJECT' | 'GLOBAL';
      targets: Array<{
        type: 'RESOURCE_ID' | 'RESOURCE_PATTERN' | 'CLASSIFICATION' | 'DEPARTMENT' | 'PROJECT';
        value: string;
        metadata?: Record<string, any>;
      }>;
      exclusions?: Array<{
        type: 'RESOURCE_ID' | 'RESOURCE_PATTERN' | 'CLASSIFICATION' | 'DEPARTMENT' | 'PROJECT';
        value: string;
        metadata?: Record<string, any>;
      }>;
      inheritanceLevel?: 'NONE' | 'CHILD_RESOURCES' | 'ALL_DESCENDANTS';
      cascadingPermissions?: boolean;
    };
    timeWindow: {
      startTime?: string; // ISO date string
      endTime: string; // ISO date string
      timezone: string;
      maxSessionDuration: number; // minutes
      maxConcurrentSessions: number;
      sessionIdleTimeout: number; // minutes
      extendable: boolean;
      maxExtensions: number;
      extensionDuration: number; // hours
    };
    conditions?: Array<{
      type: 'MFA_REQUIRED' | 'APPROVAL_REQUIRED' | 'SUPERVISION_REQUIRED' | 'AUDIT_ENHANCED' | 'VPN_REQUIRED' | 'DEVICE_TRUSTED';
      specification: {
        parameters: Record<string, any>;
        validation: Array<{
          type: 'PRESENCE' | 'FORMAT' | 'RANGE' | 'CUSTOM';
          specification: Record<string, any>;
          errorMessage: string;
          severity: 'ERROR' | 'WARNING' | 'INFO';
        }>;
        dependencies?: string[];
        conflictsWith?: string[];
      };
      required: boolean;
      fallbackBehavior: 'DENY' | 'PROMPT' | 'DEGRADE' | 'WARN';
      verificationRequired: boolean;
      reVerificationInterval?: number; // minutes
    }>;
    businessJustification: string;
    technicalJustification: string;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
    requestId?: string;
    monitoring?: Partial<{
      enabled: boolean;
      realTimeTracking: boolean;
      reportingFrequency: 'REALTIME' | 'HOURLY' | 'DAILY' | 'WEEKLY';
      retentionPeriod: number;
    }>;
    security?: Partial<{
      encryptionRequired: boolean;
      keyRotationInterval: number;
      signatureRequired: boolean;
      integrityChecks: boolean;
      tamperDetection: boolean;
      secureChannelRequired: boolean;
      certificateBasedAuth: boolean;
    }>;
    customAttributes?: Record<string, any>;
  };
  Headers: {
    'x-user-id': string;
    'x-session-id'?: string;
    'user-agent'?: string;
  };
}

interface ActivateGrantRequest {
  Params: {
    grantId: string;
  };
  Headers: {
    'x-user-id': string;
    'x-session-id'?: string;
    'user-agent'?: string;
  };
}

interface ValidateAccessRequest {
  Params: {
    grantId: string;
  };
  Body: {
    operation: DataOperation;
    resourceId: string;
  };
  Headers: {
    'x-user-id': string;
    'x-session-id'?: string;
    'user-agent'?: string;
  };
}

interface RevokeGrantRequest {
  Params: {
    grantId: string;
  };
  Body: {
    reason: string;
    immediate: boolean;
    notifyGrantee: boolean;
    auditRequired: boolean;
  };
  Headers: {
    'x-user-id': string;
    'x-session-id'?: string;
    'user-agent'?: string;
  };
}

interface ExtendGrantRequest {
  Params: {
    grantId: string;
  };
  Body: {
    extensionDuration: number; // hours
    justification: string;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    approverRequired?: boolean;
  };
  Headers: {
    'x-user-id': string;
    'x-session-id'?: string;
    'user-agent'?: string;
  };
}

interface SearchGrantsRequest {
  Querystring: {
    granteeId?: string;
    granterId?: string;
    status?: string;
    permissions?: string;
    classifications?: string;
    createdAfter?: string;
    createdBefore?: string;
    expiresAfter?: string;
    expiresBefore?: string;
    riskLevel?: string;
    tags?: string;
    emergencyGrants?: string;
    activeOnly?: string;
    limit?: string;
    offset?: string;
  };
  Headers: {
    'x-user-id': string;
    'x-session-id'?: string;
    'user-agent'?: string;
  };
}

interface GetAnalyticsRequest {
  Querystring: {
    startDate?: string;
    endDate?: string;
    timeframe?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  };
  Headers: {
    'x-user-id': string;
    'x-session-id'?: string;
    'user-agent'?: string;
  };
}

/**
 * Helper function to extract operation context from request
 */
function extractOperationContext(request: FastifyRequest): OperationContext {
  return {
    timestamp: new Date(),
    requestOrigin: 'api',
    userAgent: request.headers['user-agent'] || 'unknown',
    sessionId: request.headers['x-session-id'] as string || 'unknown',
    ipAddress: request.ip || 'unknown',
    geoLocation: {
      country: 'US', // In a real implementation, this would be extracted from IP
      region: 'CA',
      city: 'San Francisco'
    }
  };
}

/**
 * Helper function to convert request body to grant creation request
 */
function convertToGrantCreationRequest(body: CreateGrantRequest['Body']): GrantCreationRequest {
  return {
    requestId: body.requestId,
    granteeId: body.granteeId,
    permissions: body.permissions.map(p => ({
      operation: p.operation,
      dataClassification: p.dataClassification,
      resourceTypes: p.resourceTypes,
      resourcePatterns: p.resourcePatterns,
      exclusions: p.exclusions || [],
      usageLimit: p.usageLimit,
      rateLimits: p.rateLimits || []
    })),
    accessScope: {
      type: body.accessScope.type,
      targets: body.accessScope.targets,
      exclusions: body.accessScope.exclusions || [],
      inheritanceLevel: body.accessScope.inheritanceLevel || 'NONE',
      cascadingPermissions: body.accessScope.cascadingPermissions || false
    },
    timeWindow: {
      startTime: body.timeWindow.startTime ? new Date(body.timeWindow.startTime) : undefined,
      endTime: new Date(body.timeWindow.endTime),
      timezone: body.timeWindow.timezone,
      maxSessionDuration: body.timeWindow.maxSessionDuration,
      maxConcurrentSessions: body.timeWindow.maxConcurrentSessions,
      sessionIdleTimeout: body.timeWindow.sessionIdleTimeout,
      extendable: body.timeWindow.extendable,
      maxExtensions: body.timeWindow.maxExtensions,
      extensionDuration: body.timeWindow.extensionDuration
    },
    conditions: body.conditions?.map(c => ({
      type: c.type,
      specification: c.specification,
      required: c.required,
      fallbackBehavior: c.fallbackBehavior,
      verificationRequired: c.verificationRequired,
      reVerificationInterval: c.reVerificationInterval
    })) || [],
    businessJustification: body.businessJustification,
    technicalJustification: body.technicalJustification,
    urgency: body.urgency,
    monitoring: body.monitoring,
    security: body.security,
    customAttributes: body.customAttributes
  };
}

/**
 * Helper function to parse search filters from query string
 */
function parseSearchFilters(query: SearchGrantsRequest['Querystring']): GrantSearchFilters {
  const filters: GrantSearchFilters = {};

  if (query.granteeId) filters.granteeId = query.granteeId;
  if (query.granterId) filters.granterId = query.granterId;
  if (query.status) {
    filters.status = query.status.split(',') as any[];
  }
  if (query.permissions) {
    filters.permissions = query.permissions.split(',') as DataOperation[];
  }
  if (query.classifications) {
    filters.classifications = query.classifications.split(',') as DataClassificationLevel[];
  }
  if (query.createdAfter) filters.createdAfter = new Date(query.createdAfter);
  if (query.createdBefore) filters.createdBefore = new Date(query.createdBefore);
  if (query.expiresAfter) filters.expiresAfter = new Date(query.expiresAfter);
  if (query.expiresBefore) filters.expiresBefore = new Date(query.expiresBefore);
  if (query.riskLevel) {
    filters.riskLevel = query.riskLevel.split(',') as any[];
  }
  if (query.tags) {
    filters.tags = query.tags.split(',');
  }
  if (query.emergencyGrants) {
    filters.emergencyGrants = query.emergencyGrants === 'true';
  }
  if (query.activeOnly) {
    filters.activeOnly = query.activeOnly === 'true';
  }

  return filters;
}

/**
 * Register temporary access grant routes
 */
export async function temporaryAccessGrantRoutes(
  fastify: FastifyInstance,
  temporaryAccessGrantService: TemporaryAccessGrantService
): Promise<void> {

  // Create temporary access grant
  fastify.post<CreateGrantRequest>('/grants', {
    schema: {
      description: 'Create a new temporary access grant',
      tags: ['Temporary Access Grants'],
      headers: {
        type: 'object',
        required: ['x-user-id'],
        properties: {
          'x-user-id': { type: 'string' },
          'x-session-id': { type: 'string' },
          'user-agent': { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['granteeId', 'permissions', 'accessScope', 'timeWindow', 'businessJustification', 'technicalJustification', 'urgency'],
        properties: {
          granteeId: { type: 'string' },
          permissions: {
            type: 'array',
            items: {
              type: 'object',
              required: ['operation', 'dataClassification', 'resourceTypes', 'resourcePatterns'],
              properties: {
                operation: { type: 'string' },
                dataClassification: { type: 'string' },
                resourceTypes: { type: 'array', items: { type: 'string' } },
                resourcePatterns: { type: 'array', items: { type: 'string' } },
                exclusions: { type: 'array', items: { type: 'string' } },
                usageLimit: { type: 'number' },
                rateLimits: { type: 'array' }
              }
            }
          },
          accessScope: {
            type: 'object',
            required: ['type', 'targets'],
            properties: {
              type: { type: 'string' },
              targets: { type: 'array' },
              exclusions: { type: 'array' },
              inheritanceLevel: { type: 'string' },
              cascadingPermissions: { type: 'boolean' }
            }
          },
          timeWindow: {
            type: 'object',
            required: ['endTime', 'timezone', 'maxSessionDuration', 'maxConcurrentSessions', 'sessionIdleTimeout', 'extendable', 'maxExtensions', 'extensionDuration'],
            properties: {
              startTime: { type: 'string' },
              endTime: { type: 'string' },
              timezone: { type: 'string' },
              maxSessionDuration: { type: 'number' },
              maxConcurrentSessions: { type: 'number' },
              sessionIdleTimeout: { type: 'number' },
              extendable: { type: 'boolean' },
              maxExtensions: { type: 'number' },
              extensionDuration: { type: 'number' }
            }
          },
          businessJustification: { type: 'string' },
          technicalJustification: { type: 'string' },
          urgency: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY'] }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            grant: { type: 'object' },
            message: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'object' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<CreateGrantRequest>, reply: FastifyReply) => {
      try {
        const granterId = request.headers['x-user-id'];
        const context = extractOperationContext(request);
        const grantRequest = convertToGrantCreationRequest(request.body);

        const grant = await temporaryAccessGrantService.createTemporaryGrant(
          grantRequest,
          granterId,
          context
        );

        reply.code(201).send({
          success: true,
          grant,
          message: 'Temporary access grant created successfully'
        });
      } catch (error) {
        reply.code(400).send({
          error: 'Failed to create temporary access grant',
          details: { message: error.message }
        });
      }
    }
  });

  // Activate temporary access grant
  fastify.post<ActivateGrantRequest>('/grants/:grantId/activate', {
    schema: {
      description: 'Activate a pending temporary access grant',
      tags: ['Temporary Access Grants'],
      params: {
        type: 'object',
        required: ['grantId'],
        properties: {
          grantId: { type: 'string' }
        }
      },
      headers: {
        type: 'object',
        required: ['x-user-id'],
        properties: {
          'x-user-id': { type: 'string' },
          'x-session-id': { type: 'string' },
          'user-agent': { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            activatedAt: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<ActivateGrantRequest>, reply: FastifyReply) => {
      try {
        const { grantId } = request.params;
        const activatorId = request.headers['x-user-id'];
        const context = extractOperationContext(request);

        await temporaryAccessGrantService.activateGrant(grantId, activatorId, context);

        reply.send({
          success: true,
          message: 'Temporary access grant activated successfully',
          activatedAt: new Date().toISOString()
        });
      } catch (error) {
        if (error.message.includes('not found')) {
          reply.code(404).send({ error: error.message });
        } else {
          reply.code(400).send({ error: error.message });
        }
      }
    }
  });

  // Validate access using temporary grant
  fastify.post<ValidateAccessRequest>('/grants/:grantId/validate', {
    schema: {
      description: 'Validate access using a temporary access grant',
      tags: ['Temporary Access Grants'],
      params: {
        type: 'object',
        required: ['grantId'],
        properties: {
          grantId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['operation', 'resourceId'],
        properties: {
          operation: { type: 'string' },
          resourceId: { type: 'string' }
        }
      },
      headers: {
        type: 'object',
        required: ['x-user-id'],
        properties: {
          'x-user-id': { type: 'string' },
          'x-session-id': { type: 'string' },
          'user-agent': { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            violations: { type: 'array' },
            warnings: { type: 'array' },
            riskScore: { type: 'number' },
            recommendations: { type: 'array' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<ValidateAccessRequest>, reply: FastifyReply) => {
      try {
        const { grantId } = request.params;
        const { operation, resourceId } = request.body;
        const context = extractOperationContext(request);

        const result = await temporaryAccessGrantService.validateAccess(
          grantId,
          operation,
          resourceId,
          context
        );

        reply.send(result);
      } catch (error) {
        reply.code(400).send({ error: error.message });
      }
    }
  });

  // Revoke temporary access grant
  fastify.post<RevokeGrantRequest>('/grants/:grantId/revoke', {
    schema: {
      description: 'Revoke a temporary access grant',
      tags: ['Temporary Access Grants'],
      params: {
        type: 'object',
        required: ['grantId'],
        properties: {
          grantId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['reason', 'immediate'],
        properties: {
          reason: { type: 'string' },
          immediate: { type: 'boolean' },
          notifyGrantee: { type: 'boolean' },
          auditRequired: { type: 'boolean' }
        }
      },
      headers: {
        type: 'object',
        required: ['x-user-id'],
        properties: {
          'x-user-id': { type: 'string' },
          'x-session-id': { type: 'string' },
          'user-agent': { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            revokedAt: { type: 'string' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<RevokeGrantRequest>, reply: FastifyReply) => {
      try {
        const { grantId } = request.params;
        const { reason, immediate, notifyGrantee, auditRequired } = request.body;
        const revokedBy = request.headers['x-user-id'];
        const context = extractOperationContext(request);

        const revocationRequest: GrantRevocationRequest = {
          grantId,
          reason,
          immediate,
          revokedBy,
          notifyGrantee: notifyGrantee || false,
          auditRequired: auditRequired || true
        };

        await temporaryAccessGrantService.revokeGrant(revocationRequest, context);

        reply.send({
          success: true,
          message: 'Temporary access grant revoked successfully',
          revokedAt: new Date().toISOString()
        });
      } catch (error) {
        reply.code(400).send({ error: error.message });
      }
    }
  });

  // Extend temporary access grant
  fastify.post<ExtendGrantRequest>('/grants/:grantId/extend', {
    schema: {
      description: 'Extend a temporary access grant',
      tags: ['Temporary Access Grants'],
      params: {
        type: 'object',
        required: ['grantId'],
        properties: {
          grantId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['extensionDuration', 'justification', 'urgency'],
        properties: {
          extensionDuration: { type: 'number' },
          justification: { type: 'string' },
          urgency: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          approverRequired: { type: 'boolean' }
        }
      },
      headers: {
        type: 'object',
        required: ['x-user-id'],
        properties: {
          'x-user-id': { type: 'string' },
          'x-session-id': { type: 'string' },
          'user-agent': { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            grant: { type: 'object' },
            message: { type: 'string' },
            newExpirationTime: { type: 'string' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<ExtendGrantRequest>, reply: FastifyReply) => {
      try {
        const { grantId } = request.params;
        const { extensionDuration, justification, urgency, approverRequired } = request.body;
        const requestedBy = request.headers['x-user-id'];
        const context = extractOperationContext(request);

        const extensionRequest = {
          grantId,
          requestedBy,
          extensionDuration,
          justification,
          urgency,
          approverRequired: approverRequired || false
        };

        const extendedGrant = await temporaryAccessGrantService.extendGrant(extensionRequest, context);

        reply.send({
          success: true,
          grant: extendedGrant,
          message: 'Temporary access grant extended successfully',
          newExpirationTime: extendedGrant.expiresAt.toISOString()
        });
      } catch (error) {
        reply.code(400).send({ error: error.message });
      }
    }
  });

  // Get grant details
  fastify.get<{ Params: { grantId: string } }>('/grants/:grantId', {
    schema: {
      description: 'Get temporary access grant details',
      tags: ['Temporary Access Grants'],
      params: {
        type: 'object',
        required: ['grantId'],
        properties: {
          grantId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            grant: { type: 'object' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Params: { grantId: string } }>, reply: FastifyReply) => {
      try {
        const { grantId } = request.params;
        const grant = await temporaryAccessGrantService.getGrant(grantId);

        if (!grant) {
          reply.code(404).send({ error: 'Grant not found' });
          return;
        }

        reply.send({ grant });
      } catch (error) {
        reply.code(400).send({ error: error.message });
      }
    }
  });

  // Search grants
  fastify.get<SearchGrantsRequest>('/grants', {
    schema: {
      description: 'Search temporary access grants',
      tags: ['Temporary Access Grants'],
      querystring: {
        type: 'object',
        properties: {
          granteeId: { type: 'string' },
          granterId: { type: 'string' },
          status: { type: 'string' },
          permissions: { type: 'string' },
          classifications: { type: 'string' },
          createdAfter: { type: 'string' },
          createdBefore: { type: 'string' },
          expiresAfter: { type: 'string' },
          expiresBefore: { type: 'string' },
          riskLevel: { type: 'string' },
          tags: { type: 'string' },
          emergencyGrants: { type: 'string' },
          activeOnly: { type: 'string' },
          limit: { type: 'string' },
          offset: { type: 'string' }
        }
      },
      headers: {
        type: 'object',
        required: ['x-user-id'],
        properties: {
          'x-user-id': { type: 'string' },
          'x-session-id': { type: 'string' },
          'user-agent': { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            grants: { type: 'array' },
            total: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<SearchGrantsRequest>, reply: FastifyReply) => {
      try {
        const filters = parseSearchFilters(request.query);
        const limit = request.query.limit ? parseInt(request.query.limit) : 50;
        const offset = request.query.offset ? parseInt(request.query.offset) : 0;

        const allGrants = await temporaryAccessGrantService.searchGrants(filters);
        
        // Apply pagination
        const grants = allGrants.slice(offset, offset + limit);

        reply.send({
          grants,
          total: allGrants.length,
          limit,
          offset
        });
      } catch (error) {
        reply.code(400).send({ error: error.message });
      }
    }
  });

  // Get grant analytics
  fastify.get<GetAnalyticsRequest>('/analytics', {
    schema: {
      description: 'Get temporary access grant analytics',
      tags: ['Temporary Access Grants'],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          timeframe: { type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] }
        }
      },
      headers: {
        type: 'object',
        required: ['x-user-id'],
        properties: {
          'x-user-id': { type: 'string' },
          'x-session-id': { type: 'string' },
          'user-agent': { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            analytics: { type: 'object' },
            timeframe: { type: 'object' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<GetAnalyticsRequest>, reply: FastifyReply) => {
      try {
        let timeframe: { start: Date; end: Date } | undefined;

        if (request.query.startDate && request.query.endDate) {
          timeframe = {
            start: new Date(request.query.startDate),
            end: new Date(request.query.endDate)
          };
        } else if (request.query.timeframe) {
          const now = new Date();
          const start = new Date();
          
          switch (request.query.timeframe) {
          case 'DAILY':
            start.setDate(now.getDate() - 1);
            break;
          case 'WEEKLY':
            start.setDate(now.getDate() - 7);
            break;
          case 'MONTHLY':
            start.setMonth(now.getMonth() - 1);
            break;
          case 'QUARTERLY':
            start.setMonth(now.getMonth() - 3);
            break;
          case 'YEARLY':
            start.setFullYear(now.getFullYear() - 1);
            break;
          }
          
          timeframe = { start, end: now };
        }

        const analytics = await temporaryAccessGrantService.getGrantAnalytics(timeframe);

        reply.send({
          analytics,
          timeframe: timeframe ? {
            start: timeframe.start.toISOString(),
            end: timeframe.end.toISOString()
          } : null
        });
      } catch (error) {
        reply.code(400).send({ error: error.message });
      }
    }
  });
}

export default temporaryAccessGrantRoutes;