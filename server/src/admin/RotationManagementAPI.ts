/**
 * Rotation Management API Routes - Epic 17.4.4
 * 
 * RESTful API endpoints for credential and certificate rotation management.
 * Provides comprehensive rotation policy management, credential lifecycle,
 * automated rotation scheduling, and rotation analytics for Epic 17.
 * 
 * Task: E17-1753114397225-2196A4 - Add rotation management
 * Epic: 17 - Backstage Admin Controls (Story 17.4.4 - API Management)
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { 
  RotationManagementService, 
  RotationType, 
  RotationStatus,
  RotationPriority,
  RotationPolicy,
  ManagedCredential,
  RotationJob
} from './RotationManagementService';
import { AuthService } from '../auth/services/AuthService';
import { AuditService } from '../auth/services/AuditService';

// ==========================================
// REQUEST/RESPONSE INTERFACES
// ==========================================

}
}
export interface RotationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: Date;
    requestId: string;
    processingTime: number;
    version: string;
  };
}

}
}
export interface CreateRotationPolicyRequest {
  name: string;
  description: string;
  rotationType: RotationType;
  rotationInterval: number; // milliseconds
  warningPeriod?: number; // milliseconds
  gracePeriod?: number; // milliseconds
  maxRetries?: number;
  autoRotate?: boolean;
  requirements: {
    keyLength?: number;
    complexity?: 'simple' | 'medium' | 'complex' | 'maximum';
    allowedCharacters?: string;
    forbiddenPatterns?: string[];
    mustInclude?: string[];
    expirationDays?: number;
}
}
  };
  notifications?: {
    enabled: boolean;
    channels: Array<{
      type: 'email' | 'slack' | 'webhook';
      target: string;
      priority: RotationPriority;
    }>;
  };
  rollbackPolicy?: {
    enabled: boolean;
    automaticRollback: boolean;
    rollbackTimeout: number;
  };
}

}
}
export interface RegisterCredentialRequest {
  name: string;
  description: string;
  type: RotationType;
  policyId: string;
  configuration: {
    scope: 'global' | 'service' | 'user' | 'environment';
    environment: string[];
    services: string[];
    accessLevel: 'read' | 'write' | 'admin' | 'service';
}
}
  };
  dependencies?: Array<{
    type: 'service' | 'database' | 'api';
    name: string;
    critical: boolean;
    validationEndpoint?: string;
  }>;
}

}
}
export interface RotationRequest {
  credentialId: string;
  reason?: string;
  priority?: RotationPriority;
  executeImmediately?: boolean;
}
}
}

}
}
export interface BulkRotationRequest {
  credentialIds: string[];
  reason?: string;
  priority?: RotationPriority;
  schedule?: {
    executeAt?: string; // ISO date
    staggered?: boolean;
    staggerDelay?: number; // milliseconds between rotations
}
}
  };
}

}
}
export interface RotationAnalyticsRequest {
  timeRange: {
    start: string;
    end: string;
}
}
  };
  filters?: {
    type?: RotationType[];
    status?: RotationStatus[];
    priority?: RotationPriority[];
  };
  includeDetails?: boolean;
  groupBy?: 'type' | 'status' | 'day' | 'week';
}

}
}
export interface EmergencyRotationRequest {
  credentialId: string;
  reason: string;
  compromisedAt?: string; // ISO date
  affectedServices?: string[];
  mitigationActions?: string[];
}
}
}

// ==========================================
// API PLUGIN IMPLEMENTATION
// ==========================================

export const rotationManagementAPI: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const rotationService = new RotationManagementService(fastify.database);
  const authService = new AuthService(fastify.database);
  const auditService = new AuditService(fastify.database);

  // ==========================================
  // AUTHENTICATION MIDDLEWARE
  // ==========================================

  fastify.addHook('preHandler', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      reply.code(401).send({ success: false, error: 'Authorization header required' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const user = await authService.validateToken(token);
      if (!user || !user.permissions.includes('rotation_management')) {
        reply.code(403).send({ success: false, error: 'Insufficient permissions for rotation management' });
        return;
      }
      request.user = user;
    } catch (error) {
      reply.code(401).send({ success: false, error: 'Invalid authentication token' });
      return;
    }
  });

  // ==========================================
  // ROTATION POLICY ENDPOINTS
  // ==========================================

  // Create rotation policy
  fastify.post<{ Body: CreateRotationPolicyRequest }>('/policies', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'rotationType', 'rotationInterval'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          rotationType: { type: 'string', enum: Object.values(RotationType) },
          rotationInterval: { type: 'number', minimum: 60000 }, // At least 1 minute
          warningPeriod: { type: 'number', minimum: 0 },
          gracePeriod: { type: 'number', minimum: 0 },
          maxRetries: { type: 'number', minimum: 0, maximum: 10 },
          autoRotate: { type: 'boolean', default: true },
          requirements: {
            type: 'object',
            properties: {
              keyLength: { type: 'number', minimum: 8, maximum: 512 },
              complexity: { type: 'string', enum: ['simple', 'medium', 'complex', 'maximum'] },
              allowedCharacters: { type: 'string' },
              forbiddenPatterns: { type: 'array', items: { type: 'string' } },
              mustInclude: { type: 'array', items: { type: 'string' } },
              expirationDays: { type: 'number', minimum: 1 }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();
    const requestId = `create_policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const policyId = await rotationService.createRotationPolicy({
        ...request.body,
        warningPeriod: request.body.warningPeriod || request.body.rotationInterval * 0.1,
        gracePeriod: request.body.gracePeriod || 300000, // 5 minutes default
        maxRetries: request.body.maxRetries || 3,
        retryDelay: 30000, // 30 seconds
        autoRotate: request.body.autoRotate !== false,
        requirements: {
          keyLength: 32,
          complexity: 'complex',
          allowedCharacters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*',
          forbiddenPatterns: ['password', '123456', 'admin'],
          mustInclude: [],
          ...request.body.requirements
  }
        notifications: {
          enabled: request.body.notifications?.enabled || false,
          channels: request.body.notifications?.channels || [],
          events: [
            { event: 'rotation_due', advanceNotice: request.body.warningPeriod || 3600000, enabled: true },
            { event: 'rotation_started', advanceNotice: 0, enabled: true },
            { event: 'rotation_completed', advanceNotice: 0, enabled: true },
            { event: 'rotation_failed', advanceNotice: 0, enabled: true }
          ],
          escalationRules: []
  }
        rollbackPolicy: {
          enabled: request.body.rollbackPolicy?.enabled || true,
          automaticRollback: request.body.rollbackPolicy?.automaticRollback || false,
          rollbackTriggers: ['validation_failure', 'service_failure'],
          rollbackTimeout: request.body.rollbackPolicy?.rollbackTimeout || 600000, // 10 minutes
          validationChecks: [],
          preserveHistory: 5
        }
      });

      // Audit logging
      await auditService.logAction({
        userId: request.user.userId,
        action: 'rotation_policy_created',
        resource: `rotation_policy:${policyId}`,
        details: {
          policyId,
          name: request.body.name,
          rotationType: request.body.rotationType,
          rotationInterval: request.body.rotationInterval
        }
      });

      const response: RotationResponse<{ policyId: string }> = {
        success: true,
        data: { policyId },
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      };

      reply.code(201).send(response);

    } catch (error) {
      fastify.log.error(`Rotation policy creation failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: error.message || 'Failed to create rotation policy',
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });
    }
  });

  // List rotation policies
  fastify.get<{ 
    Querystring: { 
      type?: RotationType;
      limit?: number;
      offset?: number;
    } 
  }>('/policies', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: Object.values(RotationType) },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const policies = await rotationService.getRotationPolicies({
        type: request.query.type
      });

      // Apply pagination
      const offset = request.query.offset || 0;
      const limit = request.query.limit || 50;
      const paginatedPolicies = policies.slice(offset, offset + limit);

      reply.send({
        success: true,
        data: {
          policies: paginatedPolicies,
          total: policies.length,
          offset,
          limit
  }
        metadata: {
          timestamp: new Date(),
          requestId: `list_policies_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Failed to list rotation policies: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve rotation policies'
      });
    }
  });

  // Get specific rotation policy
  fastify.get<{ Params: { policyId: string } }>('/policies/:policyId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          policyId: { type: 'string' }
  }
        required: ['policyId']
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const policy = await rotationService.getRotationPolicy(request.params.policyId);
      
      if (!policy) {
        reply.code(404).send({
          success: false,
          error: 'Rotation policy not found'
        });
        return;
      }

      reply.send({
        success: true,
        data: policy,
        metadata: {
          timestamp: new Date(),
          requestId: `get_policy_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve rotation policy'
      });
    }
  });

  // ==========================================
  // CREDENTIAL MANAGEMENT ENDPOINTS
  // ==========================================

  // Register credential for management
  fastify.post<{ Body: RegisterCredentialRequest }>('/credentials', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'type', 'policyId', 'configuration'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          type: { type: 'string', enum: Object.values(RotationType) },
          policyId: { type: 'string' },
          configuration: {
            type: 'object',
            required: ['scope', 'environment', 'services', 'accessLevel'],
            properties: {
              scope: { type: 'string', enum: ['global', 'service', 'user', 'environment'] },
              environment: { type: 'array', items: { type: 'string' } },
              services: { type: 'array', items: { type: 'string' } },
              accessLevel: { type: 'string', enum: ['read', 'write', 'admin', 'service'] }
            }
  }
          dependencies: {
            type: 'array',
            items: {
              type: 'object',
              required: ['type', 'name', 'critical'],
              properties: {
                type: { type: 'string', enum: ['service', 'database', 'api'] },
                name: { type: 'string' },
                critical: { type: 'boolean' },
                validationEndpoint: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();
    const requestId = `register_credential_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const credentialId = await rotationService.registerCredential({
        ...request.body,
        dependencies: (request.body.dependencies || []).map((dep, index) => ({
          dependencyId: `dep_${Date.now()}_${index}`,
          rotationOrder: index + 1,
          rollbackSupport: dep.critical,
          ...dep
        }))
      });

      // Audit logging
      await auditService.logAction({
        userId: request.user.userId,
        action: 'credential_registered',
        resource: `credential:${credentialId}`,
        details: {
          credentialId,
          name: request.body.name,
          type: request.body.type,
          policyId: request.body.policyId
        }
      });

      reply.code(201).send({
        success: true,
        data: { credentialId },
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Credential registration failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: error.message || 'Failed to register credential'
      });
    }
  });

  // List managed credentials
  fastify.get<{ 
    Querystring: { 
      status?: RotationStatus;
      type?: RotationType;
      dueForRotation?: boolean;
      limit?: number;
      offset?: number;
    } 
  }>('/credentials', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: Object.values(RotationStatus) },
          type: { type: 'string', enum: Object.values(RotationType) },
          dueForRotation: { type: 'boolean' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      let credentials = await rotationService.getManagedCredentials({
        status: request.query.status,
        type: request.query.type
      });

      // Filter for credentials due for rotation
      if (request.query.dueForRotation) {
        const now = new Date();
        credentials = credentials.filter(cred => cred.nextRotationDue <= now);
      }

      // Apply pagination
      const offset = request.query.offset || 0;
      const limit = request.query.limit || 50;
      const paginatedCredentials = credentials.slice(offset, offset + limit);

      // Remove sensitive information from response
      const safeCredentials = paginatedCredentials.map(cred => ({
        ...cred,
        currentVersion: {
          ...cred.currentVersion,
          value: '[HIDDEN]', // Never expose credential values
          salt: '[HIDDEN]'
  }
        versions: cred.versions.map(v => ({
          ...v,
          value: '[HIDDEN]',
          salt: '[HIDDEN]'
        }))
      }));

      reply.send({
        success: true,
        data: {
          credentials: safeCredentials,
          total: credentials.length,
          offset,
          limit,
          dueForRotation: credentials.filter(c => c.nextRotationDue <= new Date()).length
  }
        metadata: {
          timestamp: new Date(),
          requestId: `list_credentials_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve credentials'
      });
    }
  });

  // ==========================================
  // ROTATION EXECUTION ENDPOINTS
  // ==========================================

  // Rotate single credential
  fastify.post<{ Body: RotationRequest }>('/rotate', {
    schema: {
      body: {
        type: 'object',
        required: ['credentialId'],
        properties: {
          credentialId: { type: 'string' },
          reason: { type: 'string', maxLength: 200 },
          priority: { type: 'string', enum: Object.values(RotationPriority), default: 'medium' },
          executeImmediately: { type: 'boolean', default: false }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();
    const requestId = `rotate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const jobId = await rotationService.rotateCredential(
        request.body.credentialId,
        request.body.reason || 'Manual rotation requested',
        request.body.priority || RotationPriority.MEDIUM
      );

      // Audit logging
      await auditService.logAction({
        userId: request.user.userId,
        action: 'rotation_initiated',
        resource: `credential:${request.body.credentialId}`,
        details: {
          jobId,
          credentialId: request.body.credentialId,
          reason: request.body.reason,
          priority: request.body.priority,
          initiatedBy: request.user.userId
        }
      });

      reply.send({
        success: true,
        data: {
          jobId,
          credentialId: request.body.credentialId,
          status: 'initiated',
          message: 'Rotation job created successfully'
  }
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Rotation initiation failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: error.message || 'Failed to initiate rotation'
      });
    }
  });

  // Bulk rotation
  fastify.post<{ Body: BulkRotationRequest }>('/rotate/bulk', {
    schema: {
      body: {
        type: 'object',
        required: ['credentialIds'],
        properties: {
          credentialIds: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 50 },
          reason: { type: 'string', maxLength: 200 },
          priority: { type: 'string', enum: Object.values(RotationPriority), default: 'medium' },
          schedule: {
            type: 'object',
            properties: {
              executeAt: { type: 'string', format: 'date-time' },
              staggered: { type: 'boolean', default: false },
              staggerDelay: { type: 'integer', minimum: 1000, default: 30000 }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();
    const requestId = `bulk_rotate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const jobIds: string[] = [];
      const errors: Array<{ credentialId: string; error: string }> = [];

      for (let i = 0; i < request.body.credentialIds.length; i++) {
        const credentialId = request.body.credentialIds[i];
        
        try {
          // Add stagger delay if configured
          if (request.body.schedule?.staggered && i > 0) {
            await new Promise(resolve => 
              setTimeout(resolve, request.body.schedule?.staggerDelay || 30000)
            );
          }

          const jobId = await rotationService.rotateCredential(
            credentialId,
            request.body.reason || 'Bulk rotation requested',
            request.body.priority || RotationPriority.MEDIUM
          );

          jobIds.push(jobId);
        } catch (error) {
          errors.push({ credentialId, error: error.message });
        }
      }

      // Audit logging
      await auditService.logAction({
        userId: request.user.userId,
        action: 'bulk_rotation_initiated',
        resource: 'bulk_rotation',
        details: {
          requestId,
          totalCredentials: request.body.credentialIds.length,
          successfulJobs: jobIds.length,
          failedJobs: errors.length,
          jobIds,
          errors: errors.slice(0, 10), // Limit logged errors
          reason: request.body.reason
        }
      });

      reply.send({
        success: errors.length < request.body.credentialIds.length,
        data: {
          requestId,
          jobIds,
          successCount: jobIds.length,
          errorCount: errors.length,
          errors,
          message: `Initiated ${jobIds.length} of ${request.body.credentialIds.length} rotations`
  }
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Bulk rotation failed'
      });
    }
  });

  // Emergency rotation
  fastify.post<{ Body: EmergencyRotationRequest }>('/rotate/emergency', {
    schema: {
      body: {
        type: 'object',
        required: ['credentialId', 'reason'],
        properties: {
          credentialId: { type: 'string' },
          reason: { type: 'string', minLength: 10, maxLength: 500 },
          compromisedAt: { type: 'string', format: 'date-time' },
          affectedServices: { type: 'array', items: { type: 'string' } },
          mitigationActions: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();
    const requestId = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const jobId = await rotationService.rotateCredential(
        request.body.credentialId,
        `EMERGENCY: ${request.body.reason}`,
        RotationPriority.EMERGENCY
      );

      // Enhanced audit logging for emergency rotations
      await auditService.logAction({
        userId: request.user.userId,
        action: 'emergency_rotation_initiated',
        resource: `credential:${request.body.credentialId}`,
        details: {
          jobId,
          credentialId: request.body.credentialId,
          reason: request.body.reason,
          compromisedAt: request.body.compromisedAt ? new Date(request.body.compromisedAt) : new Date(),
          affectedServices: request.body.affectedServices || [],
          mitigationActions: request.body.mitigationActions || [],
          initiatedBy: request.user.userId,
          timestamp: new Date()
        }
      });

      reply.send({
        success: true,
        data: {
          jobId,
          credentialId: request.body.credentialId,
          priority: RotationPriority.EMERGENCY,
          status: 'initiated',
          message: 'Emergency rotation initiated - processing with highest priority'
  }
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Emergency rotation failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Emergency rotation failed'
      });
    }
  });

  // ==========================================
  // JOB MONITORING ENDPOINTS
  // ==========================================

  // List rotation jobs
  fastify.get<{ 
    Querystring: { 
      status?: RotationStatus;
      credentialId?: string;
      priority?: RotationPriority;
      limit?: number;
      offset?: number;
    } 
  }>('/jobs', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: Object.values(RotationStatus) },
          credentialId: { type: 'string' },
          priority: { type: 'string', enum: Object.values(RotationPriority) },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const jobs = await rotationService.getRotationJobs({
        status: request.query.status,
        credentialId: request.query.credentialId
      });

      // Filter by priority if specified
      let filteredJobs = jobs;
      if (request.query.priority) {
        filteredJobs = jobs.filter(job => job.priority === request.query.priority);
      }

      // Apply pagination
      const offset = request.query.offset || 0;
      const limit = request.query.limit || 50;
      const paginatedJobs = filteredJobs.slice(offset, offset + limit);

      reply.send({
        success: true,
        data: {
          jobs: paginatedJobs,
          total: filteredJobs.length,
          offset,
          limit,
          statusSummary: {
            active: jobs.filter(j => j.status === RotationStatus.IN_PROGRESS).length,
            pending: jobs.filter(j => j.status === RotationStatus.PENDING).length,
            completed: jobs.filter(j => j.status === RotationStatus.COMPLETED).length,
            failed: jobs.filter(j => j.status === RotationStatus.FAILED).length
          }
  }
        metadata: {
          timestamp: new Date(),
          requestId: `list_jobs_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve rotation jobs'
      });
    }
  });

  // Get specific job details
  fastify.get<{ Params: { jobId: string } }>('/jobs/:jobId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          jobId: { type: 'string' }
  }
        required: ['jobId']
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const jobs = await rotationService.getRotationJobs({ credentialId: undefined });
      const job = jobs.find(j => j.jobId === request.params.jobId);

      if (!job) {
        reply.code(404).send({
          success: false,
          error: 'Rotation job not found'
        });
        return;
      }

      reply.send({
        success: true,
        data: job,
        metadata: {
          timestamp: new Date(),
          requestId: `get_job_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve rotation job'
      });
    }
  });

  // ==========================================
  // ANALYTICS ENDPOINTS
  // ==========================================

  // Generate rotation analytics
  fastify.post<{ Body: RotationAnalyticsRequest }>('/analytics', {
    schema: {
      body: {
        type: 'object',
        required: ['timeRange'],
        properties: {
          timeRange: {
            type: 'object',
            required: ['start', 'end'],
            properties: {
              start: { type: 'string', format: 'date-time' },
              end: { type: 'string', format: 'date-time' }
            }
  }
          filters: {
            type: 'object',
            properties: {
              type: { type: 'array', items: { type: 'string', enum: Object.values(RotationType) } },
              status: { type: 'array', items: { type: 'string', enum: Object.values(RotationStatus) } },
              priority: { type: 'array', items: { type: 'string', enum: Object.values(RotationPriority) } }
            }
  }
          includeDetails: { type: 'boolean', default: true },
          groupBy: { type: 'string', enum: ['type', 'status', 'day', 'week'], default: 'type' }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const timeRange = {
        start: new Date(request.body.timeRange.start),
        end: new Date(request.body.timeRange.end)
      };

      const analytics = await rotationService.getRotationAnalytics(timeRange);

      reply.send({
        success: true,
        data: analytics,
        metadata: {
          timestamp: new Date(),
          requestId: `analytics_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to generate rotation analytics'
      });
    }
  });

  // Get rotation health summary
  fastify.get('/health/summary', async (request, reply) => {
    const startTime = Date.now();

    try {
      const credentials = await rotationService.getManagedCredentials({});
      const jobs = await rotationService.getRotationJobs({});
      
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const oneDayAgo = new Date(now.getTime() - 86400000);

      const summary = {
        totalCredentials: credentials.length,
        activeCredentials: credentials.filter(c => c.status === RotationStatus.ACTIVE).length,
        credentialsDueForRotation: credentials.filter(c => c.nextRotationDue <= now).length,
        credentialsOverdue: credentials.filter(c => c.nextRotationDue < oneDayAgo).length,
        recentRotations: {
          lastHour: jobs.filter(j => j.completedAt && j.completedAt > oneHourAgo).length,
          lastDay: jobs.filter(j => j.completedAt && j.completedAt > oneDayAgo).length
  }
        jobStatus: {
          active: jobs.filter(j => j.status === RotationStatus.IN_PROGRESS).length,
          pending: jobs.filter(j => j.status === RotationStatus.PENDING).length,
          failed: jobs.filter(j => j.status === RotationStatus.FAILED && j.completedAt && j.completedAt > oneDayAgo).length
  }
        averageRotationTime: jobs
          .filter(j => j.duration)
          .reduce((sum, j) => sum + j.duration!, 0) / Math.max(1, jobs.filter(j => j.duration).length),
        successRate: jobs.length > 0 
          ? (jobs.filter(j => j.status === RotationStatus.COMPLETED).length / jobs.length) * 100 
          : 100
      };

      reply.send({
        success: true,
        data: summary,
        metadata: {
          timestamp: new Date(),
          requestId: `health_summary_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to get rotation health summary'
      });
    }
  });

  // ==========================================
  // SYSTEM HEALTH ENDPOINT
  // ==========================================

  // System health check
  fastify.get('/health', async (request, reply) => {
    try {
      const credentials = await rotationService.getManagedCredentials({});
      const jobs = await rotationService.getRotationJobs({});
      const policies = await rotationService.getRotationPolicies({});

      reply.send({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date(),
          version: '1.0.0',
          components: {
            rotationService: 'operational',
            policyEngine: 'operational',
            jobScheduler: 'operational',
            credentialStore: 'operational'
  }
          statistics: {
            managedCredentials: credentials.length,
            rotationPolicies: policies.length,
            activeJobs: jobs.filter(j => j.status === RotationStatus.IN_PROGRESS).length,
            pendingJobs: jobs.filter(j => j.status === RotationStatus.PENDING).length
          }
        }
      });

    } catch (error) {
      fastify.log.error(`Rotation system health check failed: ${error.message}`);
      reply.code(503).send({
        success: false,
        error: 'Rotation system health check failed'
      });
    }
  });

  fastify.log.info('Rotation Management API routes registered successfully');
};

export default rotationManagementAPI;