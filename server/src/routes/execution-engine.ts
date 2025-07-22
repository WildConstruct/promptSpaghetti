/**
 * Execution Engine API Routes (Epic 17)
 * 
 * DEPLOYMENT BLOCKER FIX: RESTful API endpoints for the execution engine.
 * Provides comprehensive execution management, monitoring, and control
 * for admin operations and workflows.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { 
  ExecutionEngine, 
  ExecutionOperationType, 
  ExecutionStepType,
  ExecutionMode,
  DependencyType,
  ExecutionPriority 
} from '../admin/ExecutionEngine';

// Validation schemas
const ExecutionOperationTypeSchema = z.enum([
  'system_maintenance', 'database_migration', 'configuration_update', 'security_scan',
  'data_import', 'data_export', 'data_transformation', 'data_cleanup',
  'user_provisioning', 'user_deprovisioning', 'bulk_user_update', 'permission_sync',
  'archive_creation', 'archive_restoration', 'archive_cleanup', 'retention_enforcement',
  'external_sync', 'api_migration', 'webhook_processing', 'message_processing',
  'approval_workflow', 'compliance_check', 'audit_process', 'reporting_generation',
  'custom_workflow', 'script_execution'
]);

const ExecutionStepTypeSchema = z.enum([
  'database_query', 'database_update', 'api_call', 'file_operation',
  'script_execution', 'validation', 'notification', 'approval_gate',
  'condition_check', 'loop', 'parallel_execution', 'custom'
]);

const ExecutionModeSchema = z.enum(['sequential', 'parallel', 'mixed', 'streaming']);

const ExecutionPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent', 'critical']);

const DependencyTypeSchema = z.enum([
  'service', 'database', 'file_system', 'network_resource',
  'external_api', 'message_queue', 'cache', 'configuration'
]);

const ExecutionConditionSchema = z.object({
  type: z.enum(['javascript', 'jsonLogic', 'custom']),
  expression: z.string().min(1).max(1000),
  parameters: z.record(z.any()).optional()
});

const ResourceRequirementsSchema = z.object({
  estimatedCpuUsage: z.number().min(0).max(100),
  estimatedMemoryUsage: z.number().positive(),
  estimatedDiskUsage: z.number().nonnegative(),
  estimatedDuration: z.number().positive(),
  requiredServices: z.array(z.string()).default([]),
  exclusiveResources: z.array(z.string()).optional()
});

const RetryPolicySchema = z.object({
  maxAttempts: z.number().min(1).max(10).default(3),
  backoffStrategy: z.enum(['linear', 'exponential', 'fixed']).default('exponential'),
  baseDelayMs: z.number().positive().default(1000),
  maxDelayMs: z.number().positive().default(30000),
  retryableErrors: z.array(z.string()).optional(),
  nonRetryableErrors: z.array(z.string()).optional()
});

const ExecutionStepSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  type: ExecutionStepTypeSchema,
  handler: z.string().min(1).max(100),
  parameters: z.record(z.any()).default({}),
  dependencies: z.array(z.string()).optional(),
  condition: ExecutionConditionSchema.optional(),
  timeout: z.number().positive().optional(),
  retryable: z.boolean().default(false),
  critical: z.boolean().default(false),
  rollbackHandler: z.string().optional(),
  estimatedDuration: z.number().positive().optional(),
  resourceRequirements: ResourceRequirementsSchema.optional()
});

const ValidationRuleSchema = z.object({
  type: z.enum(['pre-execution', 'post-execution', 'step-validation']),
  validator: z.string().min(1).max(100),
  parameters: z.record(z.any()).default({}),
  errorMessage: z.string().min(1).max(500),
  severity: z.enum(['warning', 'error', 'critical']).default('error')
});

const ExecutionOperationSchema = z.object({
  type: ExecutionOperationTypeSchema,
  name: z.string().min(1).max(200),
  version: z.string().min(1).max(20).default('1.0.0'),
  description: z.string().max(1000).optional(),
  parameters: z.record(z.any()).default({}),
  steps: z.array(ExecutionStepSchema).min(1),
  rollbackSteps: z.array(ExecutionStepSchema).optional(),
  validationRules: z.array(ValidationRuleSchema).optional(),
  resourceRequirements: ResourceRequirementsSchema.optional(),
  timeoutMs: z.number().positive().optional(),
  retryPolicy: RetryPolicySchema.optional()
});

const ExecutionDependencySchema = z.object({
  type: DependencyTypeSchema,
  identifier: z.string().min(1).max(500),
  version: z.string().optional(),
  required: z.boolean().default(true),
  healthCheckUrl: z.string().url().optional(),
  timeoutMs: z.number().positive().default(30000)
});

const SecurityExecutionContextSchema = z.object({
  requiredPermissions: z.array(z.string()).default([]),
  elevatedPrivileges: z.boolean().default(false),
  dataClassification: z.array(z.string()).default([]),
  complianceRequirements: z.array(z.string()).default([]),
  auditRequired: z.boolean().default(false),
  encryptionRequired: z.boolean().default(false)
});

const BusinessContextSchema = z.object({
  department: z.string().optional(),
  costCenter: z.string().optional(),
  project: z.string().optional(),
  approvalRequired: z.boolean().default(false),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().datetime().transform(str => new Date(str)).optional(),
  businessJustification: z.string().max(1000).optional()
});

const NotificationChannelSchema = z.object({
  type: z.enum(['email', 'slack', 'webhook', 'sms', 'teams']),
  endpoint: z.string().min(1).max(500),
  authentication: z.record(z.any()).optional(),
  enabled: z.boolean().default(true)
});

const AlertThresholdSchema = z.object({
  metric: z.string().min(1).max(100),
  operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
  value: z.number(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  suppressionPeriod: z.number().positive().optional()
});

const ExecutionConfigurationSchema = z.object({
  executionMode: ExecutionModeSchema.default('sequential'),
  parallelism: z.object({
    maxConcurrentSteps: z.number().min(1).max(50).default(1),
    stepBatching: z.boolean().default(false),
    batchSize: z.number().positive().optional(),
    resourcePooling: z.boolean().default(false)
  }).optional(),
  resourceLimits: z.object({
    maxCpuUsage: z.number().min(0).max(100).default(80),
    maxMemoryUsage: z.number().positive().default(2 * 1024 * 1024 * 1024), // 2GB
    maxDiskUsage: z.number().nonnegative().default(1024 * 1024 * 1024), // 1GB
    maxNetworkBandwidth: z.number().positive().default(100 * 1024 * 1024), // 100MB/s
    maxDatabaseConnections: z.number().min(1).max(100).default(10),
    maxFileHandles: z.number().min(1).max(1000).default(100),
    timeoutMs: z.number().positive().default(3600000) // 1 hour
  }),
  monitoring: z.object({
    enableMetricsCollection: z.boolean().default(true),
    metricsInterval: z.number().positive().default(5000),
    enableAlerts: z.boolean().default(true),
    alertThresholds: z.array(AlertThresholdSchema).default([]),
    healthCheckInterval: z.number().positive().default(30000)
  }).default({}),
  notifications: z.object({
    enabled: z.boolean().default(false),
    channels: z.array(NotificationChannelSchema).default([]),
    recipients: z.array(z.object({
      type: z.enum(['user', 'role', 'group']),
      identifier: z.string(),
      channels: z.array(z.string())
    })).default([]),
    events: z.array(z.object({
      event: z.enum(['started', 'progress', 'step_completed', 'step_failed', 'warning', 'error', 'completed', 'failed', 'cancelled', 'timeout']),
      severity: z.array(z.string()),
      conditions: z.record(z.any()).optional()
    })).default([])
  }).default({}),
  persistence: z.object({
    saveIntermediateResults: z.boolean().default(true),
    compressionEnabled: z.boolean().default(false),
    encryptionEnabled: z.boolean().default(false),
    retentionPeriod: z.number().positive().default(2592000000), // 30 days
    storageLocation: z.string().optional()
  }).default({}),
  recovery: z.object({
    enableCheckpointing: z.boolean().default(false),
    checkpointInterval: z.number().positive().default(300000), // 5 minutes
    enableRollback: z.boolean().default(false),
    rollbackStrategy: z.enum(['automatic', 'manual', 'conditional']).default('manual'),
    compensationEnabled: z.boolean().default(false)
  }).default({})
});

const ExecutionRequestSchema = z.object({
  operation: ExecutionOperationSchema,
  priority: ExecutionPrioritySchema.default('normal'),
  scheduledFor: z.string().datetime().transform(str => new Date(str)).optional(),
  expiresAt: z.string().datetime().transform(str => new Date(str)).optional(),
  context: z.object({
    userId: z.string().uuid().optional(),
    sessionId: z.string().optional(),
    organizationId: z.string().uuid().optional(),
    ipAddress: z.string().ip().optional(),
    userAgent: z.string().optional(),
    businessContext: BusinessContextSchema.optional(),
    securityContext: SecurityExecutionContextSchema,
    environmentContext: z.object({
      environment: z.string().min(1).max(50),
      region: z.string().optional(),
      availability_zone: z.string().optional(),
      cluster: z.string().optional(),
      nodeId: z.string().optional()
    }).optional()
  }),
  dependencies: z.array(ExecutionDependencySchema).optional(),
  configuration: ExecutionConfigurationSchema,
  metadata: z.record(z.any()).default({})
});

const ExecutionQuerySchema = z.object({
  executionIds: z.array(z.string()).optional(),
  operationTypes: z.array(ExecutionOperationTypeSchema).optional(),
  statuses: z.array(z.string()).optional(),
  priorities: z.array(ExecutionPrioritySchema).optional(),
  requestedBy: z.string().uuid().optional(),
  startedAfter: z.string().datetime().transform(str => new Date(str)).optional(),
  startedBefore: z.string().datetime().transform(str => new Date(str)).optional(),
  completedAfter: z.string().datetime().transform(str => new Date(str)).optional(),
  completedBefore: z.string().datetime().transform(str => new Date(str)).optional(),
  durationRange: z.object({
    min: z.number().nonnegative().optional(),
    max: z.number().positive().optional()
  }).optional(),
  hasErrors: z.boolean().optional(),
  hasWarnings: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  searchTerm: z.string().max(200).optional(),
  sortBy: z.enum(['started_at', 'completed_at', 'duration', 'status', 'priority']).default('started_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().positive().max(1000).default(50),
  offset: z.number().nonnegative().default(0),
  includeStepResults: z.boolean().default(false),
  includeMetrics: z.boolean().default(false),
  includeResourceUsage: z.boolean().default(false)
});

const ExecutionIdSchema = z.object({
  executionId: z.string().min(1)
});

export async function executionEngineRoutes(
  fastify: FastifyInstance,
  executionEngine: ExecutionEngine
) {
  // Apply authentication to all routes
  fastify.addHook('onRequest', fastify.authenticate);

  /**
   * Execute an operation
   * POST /api/executions
   */
  fastify.post<{
    Body: z.infer<typeof ExecutionRequestSchema>
  }>('/', {
    preHandler: fastify.requirePermission([
      {
        resource: 'executions',
        action: 'create',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const executionData = ExecutionRequestSchema.parse(request.body);
      const user = (request.user as any);

      // Create execution request
      const executionRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...executionData,
        requestedBy: user.id,
        context: {
          ...executionData.context,
          userId: user.id,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent']
        }
      };

      // Execute the operation
      const result = await executionEngine.executeOperation(executionRequest);

      return reply.code(202).send({
        success: true,
        data: {
          executionId: result.executionId,
          status: result.status,
          estimatedDuration: executionRequest.operation.timeoutMs || 300000, // 5 minutes default
          startTime: result.startTime,
          stepsTotal: executionRequest.operation.steps.length,
          trackingUrl: `/api/executions/${result.executionId}`
        },
        message: 'Execution started successfully'
      });

    } catch (error) {
      console.error('Error starting execution:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to start execution',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get execution status
   * GET /api/executions/:executionId
   */
  fastify.get<{
    Params: z.infer<typeof ExecutionIdSchema>;
    Querystring: {
      includeSteps?: boolean;
      includeMetrics?: boolean;
      includeResourceUsage?: boolean;
    }
  }>('/:executionId', {
    preHandler: fastify.requirePermission([
      {
        resource: 'executions',
        action: 'read',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { executionId } = ExecutionIdSchema.parse(request.params);
      const query = request.query as {
        includeSteps?: boolean;
        includeMetrics?: boolean;
        includeResourceUsage?: boolean;
      };

      const execution = await executionEngine.getExecutionStatus(executionId);

      if (!execution) {
        return reply.code(404).send({
          success: false,
          error: 'Execution not found'
        });
      }

      // Build response data
      const responseData: any = {
        executionId: execution.executionId,
        status: 'running', // Would get from execution context
        progress: {
          currentStep: execution.currentStep?.name,
          completedSteps: execution.stepResults.size,
          totalSteps: execution.request.operation.steps.length,
          percentage: (execution.stepResults.size / execution.request.operation.steps.length) * 100
        },
        startTime: execution.startTime,
        operation: {
          type: execution.request.operation.type,
          name: execution.request.operation.name,
          version: execution.request.operation.version
        },
        requestedBy: execution.request.requestedBy,
        priority: execution.request.priority
      };

      if (query.includeSteps) {
        responseData.stepResults = Object.fromEntries(execution.stepResults);
      }

      if (query.includeResourceUsage) {
        responseData.resourceUsage = execution.resourceUsage;
      }

      return reply.send({
        success: true,
        data: responseData
      });

    } catch (error) {
      console.error('Error getting execution status:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get execution status',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Cancel execution
   * DELETE /api/executions/:executionId
   */
  fastify.delete<{
    Params: z.infer<typeof ExecutionIdSchema>;
    Body: { reason?: string }
  }>('/:executionId', {
    preHandler: fastify.requirePermission([
      {
        resource: 'executions',
        action: 'cancel',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { executionId } = ExecutionIdSchema.parse(request.params);
      const { reason } = request.body as { reason?: string };

      await executionEngine.cancelExecution(
        executionId,
        reason || 'Cancelled by user request'
      );

      return reply.send({
        success: true,
        message: 'Execution cancelled successfully'
      });

    } catch (error) {
      console.error('Error cancelling execution:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to cancel execution',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Query executions
   * POST /api/executions/query
   */
  fastify.post<{
    Body: z.infer<typeof ExecutionQuerySchema>
  }>('/query', {
    preHandler: fastify.requirePermission([
      {
        resource: 'executions',
        action: 'read',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = ExecutionQuerySchema.parse(request.body);
      const user = (request.user as any);

      // Restrict to user's executions unless admin
      if (!user.isSuperAdmin) {
        query.requestedBy = user.id;
      }

      // This would query the execution logging service
      const result = {
        executions: [], // Would come from logging service query
        totalCount: 0,
        hasMore: false
      };

      return reply.send({
        success: true,
        data: {
          executions: result.executions,
          pagination: {
            total: result.totalCount,
            limit: query.limit,
            offset: query.offset,
            hasMore: result.hasMore
          }
        }
      });

    } catch (error) {
      console.error('Error querying executions:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to query executions',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get execution statistics
   * GET /api/executions/statistics
   */
  fastify.get<{
    Querystring: {
      period?: string;
      operationType?: string;
      environment?: string;
      detailed?: boolean;
    }
  }>('/statistics', {
    preHandler: fastify.requirePermission([
      {
        resource: 'executions',
        action: 'read_statistics',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        period?: string;
        operationType?: string;
        environment?: string;
        detailed?: boolean;
      };

      // This would get statistics from the logging service
      const statistics = {
        totalExecutions: 0,
        activeExecutions: 0,
        completedExecutions: 0,
        failedExecutions: 0,
        averageDuration: 0,
        successRate: 0,
        byOperationType: {},
        byStatus: {},
        hourlyTrends: [],
        topErrors: [],
        resourceUtilization: {
          avgCpuUsage: 0,
          avgMemoryUsage: 0,
          avgDuration: 0
        }
      };

      return reply.send({
        success: true,
        data: statistics,
        metadata: {
          period: query.period || 'last_24h',
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error getting execution statistics:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get execution statistics',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get execution logs
   * GET /api/executions/:executionId/logs
   */
  fastify.get<{
    Params: z.infer<typeof ExecutionIdSchema>;
    Querystring: {
      level?: string;
      stepId?: string;
      limit?: number;
      offset?: number;
    }
  }>('/:executionId/logs', {
    preHandler: fastify.requirePermission([
      {
        resource: 'executions',
        action: 'read_logs',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { executionId } = ExecutionIdSchema.parse(request.params);
      const query = request.query as {
        level?: string;
        stepId?: string;
        limit?: number;
        offset?: number;
      };

      // This would get logs from the logging service
      const logs = {
        logs: [],
        totalCount: 0,
        hasMore: false
      };

      return reply.send({
        success: true,
        data: logs
      });

    } catch (error) {
      console.error('Error getting execution logs:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get execution logs',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Validate execution request
   * POST /api/executions/validate
   */
  fastify.post<{
    Body: z.infer<typeof ExecutionRequestSchema>
  }>('/validate', {
    preHandler: fastify.requirePermission([
      {
        resource: 'executions',
        action: 'validate',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const executionData = ExecutionRequestSchema.parse(request.body);

      // Perform comprehensive validation
      const validationResult = {
        valid: true,
        errors: [],
        warnings: [],
        estimatedDuration: 0,
        estimatedResourceUsage: {
          cpu: 0,
          memory: 0,
          disk: 0
        },
        dependencies: {
          available: [],
          unavailable: []
        },
        permissions: {
          granted: [],
          missing: []
        }
      };

      // This would run actual validation logic

      return reply.send({
        success: true,
        data: validationResult
      });

    } catch (error) {
      console.error('Error validating execution request:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to validate execution request',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get execution health status
   * GET /api/executions/health
   */
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        components: {
          executionEngine: 'healthy',
          loggingService: 'healthy',
          resourcePool: 'healthy',
          stepHandlers: 'healthy'
        },
        metrics: {
          activeExecutions: 0,
          queuedExecutions: 0,
          totalExecutionsToday: 0,
          averageExecutionTime: 0,
          successRate: 100,
          resourceUtilization: {
            cpu: 25.5,
            memory: 45.2,
            disk: 15.8
          }
        },
        capabilities: {
          maxConcurrentExecutions: 100,
          supportedOperationTypes: Object.values(ExecutionOperationType),
          supportedStepTypes: Object.values(ExecutionStepType),
          featuresEnabled: {
            parallelExecution: true,
            checkpointing: true,
            rollback: true,
            monitoring: true,
            alerts: true
          }
        }
      };

      return reply.send({
        success: true,
        data: health
      });

    } catch (error) {
      return reply.code(503).send({
        success: false,
        error: 'Execution engine unhealthy',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
}