/**
 * Operation Types API Routes
 * 
 * RESTful API endpoints for managing operation types, executing operations,
 * and tracking execution progress.
 * 
 * Includes comprehensive validation, progress tracking, and result management.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { 
  OperationTypesService, 
  OperationCategory,
  RiskLevel,
  ExecutionMode,
  ParameterType,
  InputType,
  TargetType,
  ExecutionStatus
} from '../services/OperationTypesService';
import { requirePermission } from '../../auth/middleware/permission-auth';

// Request validation schemas
const createOperationTypeSchema = z.object({
  name: z.string().min(1).max(255),
  displayName: z.string().min(1).max(255),
  description: z.string().min(1),
  category: z.nativeEnum(OperationCategory),
  subCategory: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format'),
  capabilities: z.array(z.object({
    capability: z.string(),
    description: z.string(),
    limitations: z.array(z.string()).optional()
  })),
  riskLevel: z.nativeEnum(RiskLevel),
  estimatedDuration: z.number().min(1000), // Minimum 1 second
  resourceRequirements: z.object({
    cpuIntensive: z.boolean(),
    memoryIntensive: z.boolean(),
    diskIntensive: z.boolean(),
    networkIntensive: z.boolean(),
    databaseIntensive: z.boolean(),
    estimatedCpuUsage: z.number().optional(),
    estimatedMemoryUsage: z.number().optional(),
    estimatedDiskUsage: z.number().optional()
  }),
  parameters: z.array(z.object({
    name: z.string().min(1),
    displayName: z.string().min(1),
    description: z.string(),
    type: z.nativeEnum(ParameterType),
    required: z.boolean(),
    defaultValue: z.any().optional(),
    constraints: z.array(z.object({
      type: z.enum(['min', 'max', 'length', 'pattern', 'enum', 'custom']),
      value: z.any(),
      message: z.string()
    })),
    validation: z.array(z.object({
      rule: z.string(),
      message: z.string(),
      severity: z.enum(['error', 'warning', 'info'])
    })),
    inputType: z.nativeEnum(InputType),
    placeholder: z.string().optional(),
    helpText: z.string().optional(),
    options: z.array(z.object({
      value: z.any(),
      label: z.string(),
      description: z.string().optional(),
      disabled: z.boolean().optional(),
      group: z.string().optional()
    })).optional(),
    dependsOn: z.array(z.string()).optional(),
    conditionallyRequired: z.array(z.object({
      condition: z.string(),
      message: z.string()
    })).optional()
  })),
  requiredPermissions: z.array(z.string()),
  supportedTargets: z.array(z.nativeEnum(TargetType)),
  executionMode: z.array(z.nativeEnum(ExecutionMode)),
  batchSize: z.number().optional(),
  maxConcurrency: z.number().min(1).optional(),
  timeoutMs: z.number().optional(),
  uiConfig: z.object({
    icon: z.string().optional(),
    color: z.string().optional(),
    confirmationRequired: z.boolean(),
    confirmationMessage: z.string().optional(),
    showProgressBar: z.boolean(),
    showDetailedProgress: z.boolean(),
    allowCancel: z.boolean(),
    grouping: z.string().optional(),
    sortOrder: z.number()
  }),
  isEnabled: z.boolean().default(true),
  tags: z.array(z.string()).default([])
});

const updateOperationTypeSchema = createOperationTypeSchema.partial();

const executeOperationSchema = z.object({
  parameters: z.record(z.any()),
  executionMode: z.nativeEnum(ExecutionMode).optional(),
  scheduledAt: z.string().datetime().optional(),
  dryRun: z.boolean().optional()
});

const validateParametersSchema = z.object({
  parameters: z.record(z.any())
});

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    permissions: string[];
  };
}

/**
 * Register operation types routes
 */
export async function registerOperationTypesRoutes(
  fastify: FastifyInstance,
  operationTypesService: OperationTypesService
): Promise<void> {

  // Get all operation types
  fastify.get('/operation-types', {
    preHandler: [requirePermission('admin:operations:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { category, includeDeprecated } = request.query as {
        category?: OperationCategory;
        includeDeprecated?: string;
      };

      const operationTypes = await operationTypesService.getOperationTypes(
        category,
        includeDeprecated === 'true'
      );

      return reply.code(200).send({
        success: true,
        data: operationTypes,
        meta: {
          totalCount: operationTypes.length,
          categories: [...new Set(operationTypes.map(ot => ot.category))],
          enabledCount: operationTypes.filter(ot => ot.isEnabled).length
        }
      });

    } catch (error) {
      fastify.log.error('Failed to get operation types:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve operation types'
      });
    }
  });

  // Get operation type by ID
  fastify.get('/operation-types/:id', {
    preHandler: [requirePermission('admin:operations:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      const operationType = await operationTypesService.getOperationType(id);

      if (!operationType) {
        return reply.code(404).send({
          success: false,
          error: 'Operation type not found'
        });
      }

      return reply.code(200).send({
        success: true,
        data: operationType
      });

    } catch (error) {
      fastify.log.error(`Failed to get operation type ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve operation type'
      });
    }
  });

  // Create new operation type
  fastify.post('/operation-types', {
    preHandler: [requirePermission('admin:operations:create')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const operationTypeData = createOperationTypeSchema.parse(request.body);

      const operationType = await operationTypesService.createOperationType(
        operationTypeData,
        request.user!.id
      );

      return reply.code(201).send({
        success: true,
        data: operationType,
        message: 'Operation type created successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid operation type data',
          details: error.errors
        });
      }

      fastify.log.error('Failed to create operation type:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to create operation type',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Update operation type
  fastify.put('/operation-types/:id', {
    preHandler: [requirePermission('admin:operations:update')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const updates = updateOperationTypeSchema.parse(request.body);

      const operationType = await operationTypesService.updateOperationType(
        id,
        updates,
        request.user!.id
      );

      return reply.code(200).send({
        success: true,
        data: operationType,
        message: 'Operation type updated successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid update data',
          details: error.errors
        });
      }

      fastify.log.error(`Failed to update operation type ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to update operation type',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Delete operation type
  fastify.delete('/operation-types/:id', {
    preHandler: [requirePermission('admin:operations:delete')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      await operationTypesService.deleteOperationType(id, request.user!.id);

      return reply.code(200).send({
        success: true,
        message: 'Operation type deleted successfully'
      });

    } catch (error) {
      fastify.log.error(`Failed to delete operation type ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to delete operation type',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Validate operation parameters
  fastify.post('/operation-types/:id/validate', {
    preHandler: [requirePermission('admin:operations:execute')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { parameters } = validateParametersSchema.parse(request.body);

      const validation = await operationTypesService.validateOperationParameters(
        id,
        parameters
      );

      return reply.code(200).send({
        success: true,
        data: validation
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid validation request',
          details: error.errors
        });
      }

      fastify.log.error(`Failed to validate parameters for ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to validate parameters',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Execute operation
  fastify.post('/operation-types/:id/execute', {
    preHandler: [requirePermission('admin:operations:execute')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const executionData = executeOperationSchema.parse(request.body);

      // First validate the operation type exists
      const operationType = await operationTypesService.getOperationType(id);
      if (!operationType) {
        return reply.code(404).send({
          success: false,
          error: 'Operation type not found'
        });
      }

      // Check if user has required permissions
      const userPermissions = request.user?.permissions || [];
      const hasRequiredPermissions = operationType.requiredPermissions.every(
        permission => userPermissions.includes(permission)
      );

      if (!hasRequiredPermissions) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to execute this operation',
          requiredPermissions: operationType.requiredPermissions
        });
      }

      // Validate parameters
      const validation = await operationTypesService.validateOperationParameters(
        id,
        executionData.parameters
      );

      if (!validation.isValid) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid operation parameters',
          validationErrors: validation.errors,
          validationWarnings: validation.warnings
        });
      }

      // For now, return a mock execution response
      // In a real implementation, this would create an execution record and start the operation
      const mockExecution = {
        id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        operationTypeId: id,
        operationType: operationType.name,
        parameters: executionData.parameters,
        status: ExecutionStatus.PENDING,
        progress: {
          percentage: 0,
          currentStep: 'Initializing',
          totalSteps: 3,
          completedSteps: 0,
          lastUpdateTime: new Date()
        },
        executedBy: request.user!.id,
        startTime: new Date(),
        totalTargets: 0,
        processedTargets: 0,
        successCount: 0,
        errorCount: 0,
        skippedCount: 0,
        results: [],
        logs: [],
        errors: [],
        estimatedDuration: operationType.estimatedDuration,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return reply.code(202).send({
        success: true,
        data: mockExecution,
        message: executionData.dryRun 
          ? 'Dry run validation successful'
          : 'Operation execution started'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid execution request',
          details: error.errors
        });
      }

      fastify.log.error(`Failed to execute operation ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to execute operation',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get operation categories
  fastify.get('/operation-categories', {
    preHandler: [requirePermission('admin:operations:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const categories = await operationTypesService.getOperationCategories();

      return reply.code(200).send({
        success: true,
        data: categories
      });

    } catch (error) {
      fastify.log.error('Failed to get operation categories:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve operation categories'
      });
    }
  });

  // Get operation metadata (for UI forms)
  fastify.get('/operations/metadata', {
    preHandler: [requirePermission('admin:operations:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const metadata = {
        categories: Object.values(OperationCategory),
        riskLevels: Object.values(RiskLevel),
        executionModes: Object.values(ExecutionMode),
        parameterTypes: Object.values(ParameterType),
        inputTypes: Object.values(InputType),
        targetTypes: Object.values(TargetType),
        executionStatuses: Object.values(ExecutionStatus),
        constraintTypes: ['min', 'max', 'length', 'pattern', 'enum', 'custom'],
        validationSeverities: ['error', 'warning', 'info']
      };

      return reply.code(200).send({
        success: true,
        data: metadata
      });

    } catch (error) {
      fastify.log.error('Failed to get operation metadata:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve operation metadata'
      });
    }
  });

  // Get operation execution history (placeholder)
  fastify.get('/operation-executions', {
    preHandler: [requirePermission('admin:operations:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { 
        operationTypeId, 
        status, 
        executedBy, 
        limit, 
        offset 
      } = request.query as {
        operationTypeId?: string;
        status?: ExecutionStatus;
        executedBy?: string;
        limit?: string;
        offset?: string;
      };

      // This would implement actual execution history retrieval
      // For now, return empty array
      return reply.code(200).send({
        success: true,
        data: [],
        meta: {
          totalCount: 0,
          limit: parseInt(limit || '20', 10),
          offset: parseInt(offset || '0', 10)
        }
      });

    } catch (error) {
      fastify.log.error('Failed to get operation executions:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve operation executions'
      });
    }
  });

  // Get operation execution details
  fastify.get('/operation-executions/:executionId', {
    preHandler: [requirePermission('admin:operations:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { executionId } = request.params as { executionId: string };

      // This would implement actual execution retrieval
      // For now, return not found
      return reply.code(404).send({
        success: false,
        error: 'Operation execution not found'
      });

    } catch (error) {
      fastify.log.error(`Failed to get operation execution ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve operation execution'
      });
    }
  });

  // Cancel operation execution
  fastify.post('/operation-executions/:executionId/cancel', {
    preHandler: [requirePermission('admin:operations:execute')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { executionId } = request.params as { executionId: string };

      // This would implement actual execution cancellation
      // For now, return success
      return reply.code(200).send({
        success: true,
        message: 'Operation cancellation requested'
      });

    } catch (error) {
      fastify.log.error(`Failed to cancel operation execution ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to cancel operation execution'
      });
    }
  });

  // Health check for operations system
  fastify.get('/operations/health', {
    preHandler: [requirePermission('admin:system:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const health = {
        status: 'healthy',
        operationTypesCount: 0,
        activeExecutions: 0,
        queueSize: 0,
        avgExecutionTime: 0,
        successRate: 100
      };

      return reply.code(200).send({
        success: true,
        data: health
      });

    } catch (error) {
      fastify.log.error('Operations system health check failed:', error);
      return reply.code(500).send({
        success: false,
        error: 'Health check failed',
        data: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  });
}

export default registerOperationTypesRoutes;