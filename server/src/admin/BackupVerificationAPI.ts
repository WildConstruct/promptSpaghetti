/**
 * Backup Verification API Routes - Epic 17.4.6
 * 
 * RESTful API endpoints for backup verification service integration.
 * Provides administrative interfaces for verification management, session control,
 * and comprehensive audit trail maintenance.
 * 
 * Task: E17-1753114397279-AC5DA5 - Create verification steps
 * Epic: 17 - Backstage Admin Controls (Story 17.4.6 - Backup System)
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { BackupVerificationService, VerificationStepType, VerificationStatus } from './BackupVerificationService';
import { AuthService } from '../auth/services/AuthService';
import { AuditService } from '../auth/services/AuditService';

// ==========================================
// REQUEST/RESPONSE INTERFACES
// ==========================================

export interface VerifyBackupRequest {
  backupId: string;
  configuration?: {
    stepsEnabled?: string[];
    stepsDisabled?: string[];
    timeoutOverrides?: Record<string, number>;
    retryOverrides?: Record<string, number>;
    customParameters?: Record<string, any>;
    skipOnWarnings?: boolean;
    abortOnCriticalFailure?: boolean;
  };
}

export interface BackupVerificationResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    timestamp: Date;
    requestId: string;
    processingTime: number;
  };
}

export interface SessionListQuery {
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  backupId?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StepConfigurationRequest {
  stepId: string;
  enabled: boolean;
  timeout?: number;
  retryAttempts?: number;
  parameters?: Record<string, any>;
}

// ==========================================
// API PLUGIN IMPLEMENTATION
// ==========================================

export const backupVerificationAPI: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const verificationService = new BackupVerificationService();
  const authService = new AuthService(fastify.database);
  const auditService = new AuditService(fastify.database);

  // Authentication middleware for all routes
  fastify.addHook('preHandler', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      reply.code(401).send({ error: 'Authorization header required' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const user = await authService.validateToken(token);
      if (!user || !user.permissions.includes('backup_admin')) {
        reply.code(403).send({ error: 'Insufficient permissions for backup verification' });
        return;
      }
      request.user = user;
    } catch (error) {
      reply.code(401).send({ error: 'Invalid authentication token' });
      return;
    }
  });

  // ==========================================
  // VERIFICATION ENDPOINTS
  // ==========================================

  // Start backup verification
  fastify.post<{ Body: VerifyBackupRequest }>('/verify', {
    schema: {
      body: {
        type: 'object',
        required: ['backupId'],
        properties: {
          backupId: { type: 'string' },
          configuration: {
            type: 'object',
            properties: {
              stepsEnabled: { type: 'array', items: { type: 'string' } },
              stepsDisabled: { type: 'array', items: { type: 'string' } },
              timeoutOverrides: { type: 'object' },
              retryOverrides: { type: 'object' },
              customParameters: { type: 'object' },
              skipOnWarnings: { type: 'boolean' },
              abortOnCriticalFailure: { type: 'boolean' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();
    const requestId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Audit log the verification request
      await auditService.logAction({
        userId: request.user.userId,
        action: 'backup_verification_started',
        resource: `backup:${request.body.backupId}`,
        details: {
          requestId,
          configuration: request.body.configuration,
          timestamp: new Date()
        }
      });

      // Start verification process
      const sessionId = await verificationService.verifyBackup(
        request.body.backupId,
        request.user.userId,
        request.body.configuration
      );

      const response: BackupVerificationResponse = {
        success: true,
        data: {
          sessionId,
          backupId: request.body.backupId,
          status: 'started'
        },
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime
        }
      };

      reply.code(202).send(response);
    } catch (error) {
      fastify.log.error(`Backup verification error: ${error.message}`);

      await auditService.logAction({
        userId: request.user.userId,
        action: 'backup_verification_failed',
        resource: `backup:${request.body.backupId}`,
        details: {
          requestId,
          error: error.message,
          timestamp: new Date()
        }
      });

      reply.code(500).send({
        success: false,
        error: error.message || 'Failed to start backup verification',
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime
        }
      });
    }
  });

  // Get verification status
  fastify.get<{ Params: { sessionId: string } }>('/sessions/:sessionId', async (request, reply) => {
    const startTime = Date.now();

    try {
      const session = await verificationService.getVerificationSession(request.params.sessionId);
      
      if (!session) {
        reply.code(404).send({
          success: false,
          error: 'Verification session not found'
        });
        return;
      }

      reply.send({
        success: true,
        data: session,
        metadata: {
          timestamp: new Date(),
          requestId: `status_${Date.now()}`,
          processingTime: Date.now() - startTime
        }
      });
    } catch (error) {
      fastify.log.error(`Session status error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve session status'
      });
    }
  });

  // Cancel verification session
  fastify.post<{ Params: { sessionId: string } }>('/sessions/:sessionId/cancel', async (request, reply) => {
    const startTime = Date.now();

    try {
      await verificationService.cancelVerification(request.params.sessionId, request.user.userId);

      await auditService.logAction({
        userId: request.user.userId,
        action: 'backup_verification_cancelled',
        resource: `session:${request.params.sessionId}`,
        details: {
          timestamp: new Date(),
          reason: 'manual_cancellation'
        }
      });

      reply.send({
        success: true,
        data: {
          sessionId: request.params.sessionId,
          status: 'cancelled'
        },
        metadata: {
          timestamp: new Date(),
          requestId: `cancel_${Date.now()}`,
          processingTime: Date.now() - startTime
        }
      });
    } catch (error) {
      fastify.log.error(`Session cancellation error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to cancel verification session'
      });
    }
  });

  // List verification sessions with filtering
  fastify.get<{ Querystring: SessionListQuery }>('/sessions', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed', 'cancelled'] },
          backupId: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          sortBy: { type: 'string', default: 'initiatedAt' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const sessions = await verificationService.listVerificationSessions(request.query);
      const totalCount = await verificationService.getSessionCount(request.query);

      reply.send({
        success: true,
        data: sessions,
        metadata: {
          totalCount,
          limit: request.query.limit || 20,
          offset: request.query.offset || 0,
          timestamp: new Date(),
          requestId: `list_${Date.now()}`,
          processingTime: Date.now() - startTime
        }
      });
    } catch (error) {
      fastify.log.error(`Session listing error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve verification sessions'
      });
    }
  });

  // ==========================================
  // CONFIGURATION ENDPOINTS
  // ==========================================

  // Get available verification steps
  fastify.get('/steps', async (request, reply) => {
    const startTime = Date.now();

    try {
      const steps = await verificationService.getAvailableSteps();

      reply.send({
        success: true,
        data: steps,
        metadata: {
          totalSteps: steps.length,
          stepTypes: Object.values(VerificationStepType),
          timestamp: new Date(),
          requestId: `steps_${Date.now()}`,
          processingTime: Date.now() - startTime
        }
      });
    } catch (error) {
      fastify.log.error(`Steps retrieval error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve verification steps'
      });
    }
  });

  // Update step configuration
  fastify.put<{ 
    Params: { stepId: string }, 
    Body: StepConfigurationRequest 
  }>('/steps/:stepId/config', {
    schema: {
      body: {
        type: 'object',
        required: ['enabled'],
        properties: {
          stepId: { type: 'string' },
          enabled: { type: 'boolean' },
          timeout: { type: 'integer', minimum: 1000 },
          retryAttempts: { type: 'integer', minimum: 0, maximum: 5 },
          parameters: { type: 'object' }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      await verificationService.updateStepConfiguration(
        request.params.stepId,
        request.body,
        request.user.userId
      );

      await auditService.logAction({
        userId: request.user.userId,
        action: 'verification_step_configured',
        resource: `step:${request.params.stepId}`,
        details: {
          configuration: request.body,
          timestamp: new Date()
        }
      });

      reply.send({
        success: true,
        data: {
          stepId: request.params.stepId,
          configuration: request.body
        },
        metadata: {
          timestamp: new Date(),
          requestId: `config_${Date.now()}`,
          processingTime: Date.now() - startTime
        }
      });
    } catch (error) {
      fastify.log.error(`Step configuration error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to update step configuration'
      });
    }
  });

  // ==========================================
  // ANALYTICS ENDPOINTS
  // ==========================================

  // Get verification analytics
  fastify.get('/analytics', async (request, reply) => {
    const startTime = Date.now();

    try {
      const analytics = await verificationService.getVerificationAnalytics();

      reply.send({
        success: true,
        data: analytics,
        metadata: {
          generatedAt: new Date(),
          requestId: `analytics_${Date.now()}`,
          processingTime: Date.now() - startTime
        }
      });
    } catch (error) {
      fastify.log.error(`Analytics error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to generate verification analytics'
      });
    }
  });

  // Get step performance metrics
  fastify.get('/analytics/steps', async (request, reply) => {
    const startTime = Date.now();

    try {
      const stepMetrics = await verificationService.getStepPerformanceMetrics();

      reply.send({
        success: true,
        data: stepMetrics,
        metadata: {
          generatedAt: new Date(),
          requestId: `step_metrics_${Date.now()}`,
          processingTime: Date.now() - startTime
        }
      });
    } catch (error) {
      fastify.log.error(`Step metrics error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve step performance metrics'
      });
    }
  });

  // ==========================================
  // MAINTENANCE ENDPOINTS
  // ==========================================

  // Health check for verification service
  fastify.get('/health', async (request, reply) => {
    try {
      const health = await verificationService.getServiceHealth();
      const statusCode = health.status === 'healthy' ? 200 : 503;

      reply.code(statusCode).send({
        success: health.status === 'healthy',
        data: health
      });
    } catch (error) {
      fastify.log.error(`Health check error: ${error.message}`);
      reply.code(503).send({
        success: false,
        error: 'Service health check failed'
      });
    }
  });

  // Cleanup old verification sessions
  fastify.post('/maintenance/cleanup', async (request, reply) => {
    const startTime = Date.now();

    try {
      const cleanupResult = await verificationService.cleanupOldSessions();

      await auditService.logAction({
        userId: request.user.userId,
        action: 'verification_cleanup_executed',
        resource: 'verification_service',
        details: {
          cleanupResult,
          timestamp: new Date()
        }
      });

      reply.send({
        success: true,
        data: cleanupResult,
        metadata: {
          timestamp: new Date(),
          requestId: `cleanup_${Date.now()}`,
          processingTime: Date.now() - startTime
        }
      });
    } catch (error) {
      fastify.log.error(`Cleanup error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to cleanup old sessions'
      });
    }
  });

  fastify.log.info('Backup Verification API routes registered successfully');
};

export default backupVerificationAPI;