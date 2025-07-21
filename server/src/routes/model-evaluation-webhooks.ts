/**
 * Model Evaluation Webhooks - Epic 26.3
 * 
 * API endpoints for receiving evaluation status updates from CI pipelines.
 * Handles webhook callbacks from GitHub Actions and other CI systems.
 * 
 * Task: T-1752989144419-71 - Add CI task triggering evaluation on new model upload
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ModelEvaluationTriggerService, ModelEvaluationResults } from '../services/ModelEvaluationTriggerService';
import { AuditService } from '../auth/services/AuditService';

interface EvaluationStatusUpdateRequest extends FastifyRequest {
  body: {
    jobId: string;
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
    githubRunId?: string;
    githubRunUrl?: string;
    results?: ModelEvaluationResults;
    error?: string;
    metadata?: Record<string, any>;
  };
}

interface ManualEvaluationTriggerRequest extends FastifyRequest {
  body: {
    modelId: string;
    evaluationSuite?: 'standard' | 'comprehensive' | 'security' | 'performance';
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export default async function modelEvaluationWebhooks(fastify: FastifyInstance) {
  const evaluationService = fastify.modelEvaluationService as ModelEvaluationTriggerService;
  const auditService = fastify.audit as AuditService;

  if (!evaluationService) {
    fastify.log.warn('Model evaluation service not available - webhook endpoints will return 503');
  }

  /**
   * Webhook endpoint for CI evaluation status updates
   * POST /webhook/evaluation-status
   */
  fastify.post('/webhook/evaluation-status', async (request: EvaluationStatusUpdateRequest, reply: FastifyReply) => {
    try {
      if (!evaluationService) {
        return reply.status(503).send({
          error: 'service_unavailable',
          message: 'Model evaluation service not available'
        });
      }

      const { jobId, status, githubRunId, githubRunUrl, results, error, metadata } = request.body;

      // Validate required fields
      if (!jobId || !status) {
        return reply.status(400).send({
          error: 'invalid_request',
          message: 'jobId and status are required'
        });
      }

      // Get the evaluation job to verify it exists
      const existingJob = await evaluationService.getEvaluationJob(jobId);
      if (!existingJob) {
        return reply.status(404).send({
          error: 'job_not_found',
          message: `Evaluation job ${jobId} not found`
        });
      }

      // Update the evaluation job status
      await evaluationService.updateEvaluationStatus(jobId, status, results, error);

      // Log the webhook event
      await auditService.logEvent({
        eventType: 'MODEL_EVALUATION_WEBHOOK_RECEIVED',
        details: {
          jobId,
          modelId: existingJob.modelId,
          version: existingJob.version,
          status,
          githubRunId,
          hasResults: !!results,
          hasError: !!error,
          metadata
        },
        riskLevel: status === 'failed' ? 'MEDIUM' : 'LOW',
        compliance: {
          frameworks: ['AI_GOVERNANCE'],
          requirements: ['evaluation_tracking'],
          evidenceLevel: 'STANDARD'
        }
      });

      return reply.status(200).send({
        success: true,
        message: `Evaluation job ${jobId} status updated to ${status}`,
        data: {
          jobId,
          previousStatus: existingJob.status,
          newStatus: status,
          updatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      fastify.log.error('Model evaluation webhook error:', error);

      await auditService.logEvent({
        eventType: 'MODEL_EVALUATION_WEBHOOK_ERROR',
        details: {
          error: error.message,
          jobId: request.body?.jobId,
          status: request.body?.status
        },
        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['AI_GOVERNANCE'],
          requirements: ['error_handling'],
          evidenceLevel: 'ENHANCED'
        }
      });

      return reply.status(500).send({
        error: 'internal_server_error',
        message: 'Failed to update evaluation status'
      });
    }
  });

  /**
   * Manual evaluation trigger endpoint
   * POST /trigger-evaluation
   */
  fastify.post('/trigger-evaluation', async (request: ManualEvaluationTriggerRequest, reply: FastifyReply) => {
    try {
      if (!evaluationService) {
        return reply.status(503).send({
          error: 'service_unavailable',
          message: 'Model evaluation service not available'
        });
      }

      const { modelId, evaluationSuite, priority } = request.body;

      if (!modelId) {
        return reply.status(400).send({
          error: 'invalid_request',
          message: 'modelId is required'
        });
      }

      // Get model information (this would typically come from model registry)
      // For now, we'll create a minimal request
      const evaluationRequest = {
        modelId,
        modelName: `Model-${modelId}`,
        version: 'latest',
        modelType: 'unknown' as const,
        framework: 'unknown' as const,
        owner: 'manual-trigger',
        triggeredBy: 'manual_trigger' as const,
        evaluationSuite: evaluationSuite || 'standard',
        priority: priority || 'medium'
      };

      const job = await evaluationService.triggerEvaluation(evaluationRequest);

      await auditService.logEvent({
        eventType: 'MODEL_EVALUATION_MANUAL_TRIGGER',
        details: {
          jobId: job.id,
          modelId,
          evaluationSuite: job.evaluationSuite,
          priority: job.priority,
          triggeredBy: 'api_endpoint'
        },
        riskLevel: 'LOW',
        compliance: {
          frameworks: ['AI_GOVERNANCE'],
          requirements: ['evaluation_triggering'],
          evidenceLevel: 'STANDARD'
        }
      });

      return reply.status(201).send({
        success: true,
        message: 'Model evaluation triggered successfully',
        data: {
          jobId: job.id,
          modelId,
          evaluationSuite: job.evaluationSuite,
          priority: job.priority,
          status: job.status,
          githubRunUrl: job.githubRunUrl
        }
      });

    } catch (error) {
      fastify.log.error('Manual evaluation trigger error:', error);

      await auditService.logEvent({
        eventType: 'MODEL_EVALUATION_MANUAL_TRIGGER_ERROR',
        details: {
          error: error.message,
          modelId: request.body?.modelId
        },
        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['AI_GOVERNANCE'],
          requirements: ['error_handling'],
          evidenceLevel: 'ENHANCED'
        }
      });

      return reply.status(500).send({
        error: 'internal_server_error',
        message: 'Failed to trigger model evaluation'
      });
    }
  });

  /**
   * Get evaluation job status
   * GET /evaluation-job/:jobId
   */
  fastify.get<{ Params: { jobId: string } }>('/evaluation-job/:jobId', async (request, reply) => {
    try {
      if (!evaluationService) {
        return reply.status(503).send({
          error: 'service_unavailable',
          message: 'Model evaluation service not available'
        });
      }

      const { jobId } = request.params;
      const job = await evaluationService.getEvaluationJob(jobId);

      if (!job) {
        return reply.status(404).send({
          error: 'job_not_found',
          message: `Evaluation job ${jobId} not found`
        });
      }

      return reply.status(200).send({
        success: true,
        data: job
      });

    } catch (error) {
      fastify.log.error('Get evaluation job error:', error);
      return reply.status(500).send({
        error: 'internal_server_error',
        message: 'Failed to retrieve evaluation job'
      });
    }
  });

  /**
   * List evaluation jobs for a model
   * GET /evaluation-jobs/model/:modelId
   */
  fastify.get<{ Params: { modelId: string } }>('/evaluation-jobs/model/:modelId', async (request, reply) => {
    try {
      if (!evaluationService) {
        return reply.status(503).send({
          error: 'service_unavailable',
          message: 'Model evaluation service not available'
        });
      }

      const { modelId } = request.params;
      const jobs = await evaluationService.getModelEvaluationJobs(modelId);

      return reply.status(200).send({
        success: true,
        data: {
          modelId,
          jobs,
          total: jobs.length
        }
      });

    } catch (error) {
      fastify.log.error('List model evaluation jobs error:', error);
      return reply.status(500).send({
        error: 'internal_server_error',
        message: 'Failed to retrieve evaluation jobs'
      });
    }
  });

  /**
   * Cancel evaluation job
   * POST /evaluation-job/:jobId/cancel
   */
  fastify.post<{ Params: { jobId: string } }>('/evaluation-job/:jobId/cancel', async (request, reply) => {
    try {
      if (!evaluationService) {
        return reply.status(503).send({
          error: 'service_unavailable',
          message: 'Model evaluation service not available'
        });
      }

      const { jobId } = request.params;
      await evaluationService.cancelEvaluation(jobId);

      await auditService.logEvent({
        eventType: 'MODEL_EVALUATION_CANCELLED',
        details: {
          jobId,
          cancelledBy: 'api_endpoint'
        },
        riskLevel: 'MEDIUM',
        compliance: {
          frameworks: ['AI_GOVERNANCE'],
          requirements: ['evaluation_control'],
          evidenceLevel: 'STANDARD'
        }
      });

      return reply.status(200).send({
        success: true,
        message: `Evaluation job ${jobId} cancelled successfully`
      });

    } catch (error) {
      fastify.log.error('Cancel evaluation job error:', error);
      return reply.status(500).send({
        error: 'internal_server_error',
        message: error.message
      });
    }
  });

  /**
   * Get evaluation statistics
   * GET /evaluation-statistics
   */
  fastify.get('/evaluation-statistics', async (request, reply) => {
    try {
      if (!evaluationService) {
        return reply.status(503).send({
          error: 'service_unavailable',
          message: 'Model evaluation service not available'
        });
      }

      const statistics = await evaluationService.getEvaluationStatistics();

      return reply.status(200).send({
        success: true,
        data: statistics
      });

    } catch (error) {
      fastify.log.error('Get evaluation statistics error:', error);
      return reply.status(500).send({
        error: 'internal_server_error',
        message: 'Failed to retrieve evaluation statistics'
      });
    }
  });

  /**
   * Health check for evaluation service
   * GET /health
   */
  fastify.get('/health', async (request, reply) => {
    try {
      if (!evaluationService) {
        return reply.status(503).send({
          status: 'unhealthy',
          message: 'Model evaluation service not available',
          timestamp: new Date().toISOString()
        });
      }

      const health = await evaluationService.getHealthStatus();

      const statusCode = health.status === 'healthy' ? 200 : 503;
      return reply.status(statusCode).send({
        ...health,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      fastify.log.error('Evaluation service health check error:', error);
      return reply.status(503).send({
        status: 'unhealthy',
        message: 'Health check failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}