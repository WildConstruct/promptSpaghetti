/**
 * Archive Management API Routes (Epic 17)
 * 
 * DEPLOYMENT BLOCKER FIX: RESTful API endpoints for comprehensive archive management system.
 * Provides archive creation, retrieval, restoration, and lifecycle management
 * for the archive management system.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { 
  ArchiveManagementService, 
  ArchiveType, 
  ArchiveCategory, 
  SourceType,
  CompressionAlgorithm,
  EncryptionAlgorithm,
  StorageClass,
  BusinessCriticality,
  DataClassification,
  RestoreType,
  ArchiveStatus,
  ValidationStatus,
  ArchiveSortField
} from '../admin/ArchiveManagementService';

// Validation schemas
const ArchiveTypeSchema = z.enum([
  'full_backup', 'incremental_backup', 'differential_backup', 'log_archive',
  'data_export', 'user_data_archive', 'system_snapshot', 'configuration_backup',
  'database_dump', 'file_archive', 'media_archive', 'compliance_archive', 'custom'
]);

const ArchiveCategorySchema = z.enum([
  'system_data', 'user_data', 'application_data', 'log_data', 'backup_data',
  'media_data', 'configuration_data', 'analytics_data', 'compliance_data',
  'temporary_data', 'historical_data', 'custom'
]);

const SourceTypeSchema = z.enum([
  'database_table', 'database_query', 'file_directory', 'file_list', 'log_files',
  'application_data', 'user_generated', 'system_generated', 'external_import', 'custom_source'
]);

const CompressionAlgorithmSchema = z.enum([
  'gzip', 'bzip2', 'xz', 'zstd', 'lz4', 'snappy', 'deflate', 'none'
]);

const EncryptionAlgorithmSchema = z.enum([
  'aes_256_gcm', 'aes_256_cbc', 'chacha20_poly1305', 'aes_128_gcm', 'none'
]);

const StorageClassSchema = z.enum([
  'hot', 'warm', 'cold', 'glacier', 'deep_glacier', 'intelligent'
]);

const BusinessCriticalitySchema = z.enum(['low', 'medium', 'high', 'critical']);

const DataClassificationSchema = z.enum([
  'public', 'internal', 'confidential', 'restricted', 'top_secret'
]);

const RestoreTypeSchema = z.enum([
  'full_restore', 'partial_restore', 'preview_restore', 'metadata_only', 'validation_restore'
]);

const CreateArchiveSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  archiveType: ArchiveTypeSchema,
  category: ArchiveCategorySchema,
  sourceType: SourceTypeSchema,
  sourceIdentifier: z.string().min(1).max(1000),
  
  // Source metadata
  sourceMetadata: z.object({
    databaseName: z.string().optional(),
    tableName: z.string().optional(),
    recordCount: z.number().nonnegative().optional(),
    dateRange: z.object({
      start: z.string().datetime().transform(str => new Date(str)),
      end: z.string().datetime().transform(str => new Date(str))
    }).optional(),
    fileCount: z.number().nonnegative().optional(),
    directoryPath: z.string().optional(),
    fileTypes: z.array(z.string()).optional(),
    totalFileSize: z.number().nonnegative().optional(),
    logLevel: z.string().optional(),
    logSource: z.string().optional(),
    eventCount: z.number().nonnegative().optional(),
    applicationId: z.string().optional(),
    userId: z.string().uuid().optional(),
    sessionId: z.string().optional(),
    operationType: z.string().optional(),
    customFields: z.record(z.any()).default({})
  }).default({ customFields: {} }),
  
  // Archive options
  compressionAlgorithm: CompressionAlgorithmSchema.default('gzip'),
  encryptionAlgorithm: EncryptionAlgorithmSchema.optional(),
  storageClass: StorageClassSchema.default('warm'),
  retentionPolicyId: z.string().uuid().optional(),
  
  // Metadata and classification
  tags: z.array(z.string()).max(50).default([]),
  businessCriticality: BusinessCriticalitySchema.default('medium'),
  dataClassification: DataClassificationSchema.default('internal'),
  complianceRequirements: z.array(z.string()).max(20).default([]),
  customMetadata: z.record(z.any()).default({}),
  
  // Processing options
  priority: z.number().min(0).max(1000).default(100),
  validateOnCreate: z.boolean().default(true),
  notifyOnComplete: z.boolean().default(false)
});

const ArchiveQuerySchema = z.object({
  archiveTypes: z.array(ArchiveTypeSchema).optional(),
  categories: z.array(ArchiveCategorySchema).optional(),
  statuses: z.array(z.string()).optional(),
  createdBy: z.string().uuid().optional(),
  archivedBy: z.string().uuid().optional(),
  dateRange: z.object({
    start: z.string().datetime().transform(str => new Date(str)),
    end: z.string().datetime().transform(str => new Date(str))
  }).optional(),
  tags: z.array(z.string()).optional(),
  businessCriticality: z.array(BusinessCriticalitySchema).optional(),
  dataClassification: z.array(DataClassificationSchema).optional(),
  storageClass: z.array(StorageClassSchema).optional(),
  validationStatus: z.array(z.string()).optional(),
  searchTerm: z.string().max(200).optional(),
  sourceType: z.array(SourceTypeSchema).optional(),
  retentionPolicyId: z.string().uuid().optional(),
  expiringBefore: z.string().datetime().transform(str => new Date(str)).optional(),
  accessedAfter: z.string().datetime().transform(str => new Date(str)).optional(),
  sizeRange: z.object({
    min: z.number().nonnegative().optional(),
    max: z.number().positive().optional()
  }).optional(),
  compressionRatioRange: z.object({
    min: z.number().min(0).max(1).optional(),
    max: z.number().min(0).max(1).optional()
  }).optional(),
  sortBy: z.enum([
    'created_at', 'archived_at', 'expires_at', 'accessed_at', 
    'name', 'original_size', 'compressed_size', 'compression_ratio', 'access_count'
  ]).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().positive().max(1000).default(50),
  offset: z.number().nonnegative().default(0),
  includeMetadata: z.boolean().default(false),
  includeValidationResults: z.boolean().default(false)
});

const RestoreRequestSchema = z.object({
  restoreType: RestoreTypeSchema,
  targetLocation: z.string().max(1000).optional(),
  partialRestoreConfig: z.object({
    filePattern: z.string().optional(),
    directoryPaths: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.string().datetime().transform(str => new Date(str)),
      end: z.string().datetime().transform(str => new Date(str))
    }).optional(),
    maxFiles: z.number().positive().optional(),
    maxSize: z.number().positive().optional()
  }).optional(),
  priority: z.number().min(0).max(1000).default(100),
  reason: z.string().min(5).max(1000),
  notifyOnComplete: z.boolean().default(true),
  expiresAt: z.string().datetime().transform(str => new Date(str)).optional()
});

const ArchiveIdSchema = z.object({
  archiveId: z.string().uuid()
});

const RetentionPolicySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  retentionPeriodDays: z.number().positive().max(36500), // ~100 years max
  autoDeleteEnabled: z.boolean().default(false),
  
  // Storage transitions
  storageTransitions: z.array(z.object({
    afterDays: z.number().positive(),
    targetStorageClass: StorageClassSchema,
    conditions: z.array(z.object({
      type: z.enum(['access_frequency', 'size', 'age', 'custom']),
      operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
      value: z.any()
    })).optional()
  })).default([]),
  
  // Notification settings
  notificationSettings: z.object({
    notifyBeforeExpiration: z.boolean().default(true),
    notificationDays: z.array(z.number().positive()).default([30, 7, 1]),
    recipients: z.array(z.string().email()).default([]),
    channels: z.array(z.enum(['email', 'slack', 'webhook', 'sms', 'system_notification'])).default(['email'])
  }).default({}),
  
  // Policy exceptions
  exceptions: z.array(z.object({
    condition: z.string(), // JSON logic expression
    action: z.enum(['extend', 'preserve', 'accelerate']),
    parameters: z.record(z.any())
  })).default([]),
  
  // Applicable scope
  applicableCategories: z.array(ArchiveCategorySchema).optional(),
  applicableTypes: z.array(ArchiveTypeSchema).optional(),
  applicableClassifications: z.array(DataClassificationSchema).optional()
});

const BulkArchiveOperationSchema = z.object({
  archiveIds: z.array(z.string().uuid()).min(1).max(100),
  operation: z.enum(['delete', 'validate', 'restore', 'update_metadata', 'change_retention_policy', 'migrate_storage']),
  parameters: z.record(z.any()).optional(),
  reason: z.string().min(5).max(500),
  priority: z.number().min(0).max(1000).default(100),
  notifyOnComplete: z.boolean().default(false)
});

export async function archiveManagementRoutes(
  fastify: FastifyInstance,
  archiveService: ArchiveManagementService
) {
  // Apply authentication to all routes
  fastify.addHook('onRequest', fastify.authenticate);

  /**
   * Create a new archive
   * POST /api/archives
   */
  fastify.post<{
    Body: z.infer<typeof CreateArchiveSchema>
  }>('/', {
    preHandler: fastify.requirePermission([
      {
        resource: 'archives',
        action: 'create',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const archiveData = CreateArchiveSchema.parse(request.body);
      const user = (request.user as any);

      const archiveRecord = await archiveService.createArchive(
        archiveData.name,
        archiveData.sourceType,
        archiveData.sourceIdentifier,
        archiveData.archiveType,
        archiveData.category,
        user.id,
        {
          description: archiveData.description,
          compressionAlgorithm: archiveData.compressionAlgorithm,
          encryptionAlgorithm: archiveData.encryptionAlgorithm,
          storageClass: archiveData.storageClass,
          retentionPolicyId: archiveData.retentionPolicyId,
          tags: archiveData.tags,
          businessCriticality: archiveData.businessCriticality,
          dataClassification: archiveData.dataClassification,
          customMetadata: {
            ...archiveData.customMetadata,
            sourceMetadata: archiveData.sourceMetadata,
            complianceRequirements: archiveData.complianceRequirements,
            validateOnCreate: archiveData.validateOnCreate,
            notifyOnComplete: archiveData.notifyOnComplete
          },
          priority: archiveData.priority
        }
      );

      return reply.code(201).send({
        success: true,
        data: {
          archiveId: archiveRecord.id,
          name: archiveRecord.name,
          status: archiveRecord.status,
          archiveType: archiveRecord.archiveType,
          category: archiveRecord.category,
          createdAt: archiveRecord.createdAt,
          expiresAt: archiveRecord.expiresAt,
          estimatedProcessingTime: '5-15 minutes' // This would be calculated based on source size
        },
        message: 'Archive creation initiated successfully'
      });

    } catch (error) {
      console.error('Error creating archive:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to create archive',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get archive by ID
   * GET /api/archives/:archiveId
   */
  fastify.get<{
    Params: z.infer<typeof ArchiveIdSchema>;
    Querystring: { 
      includeMetadata?: boolean; 
      includeValidationResults?: boolean;
      includeAccessLog?: boolean;
    }
  }>('/:archiveId', {
    preHandler: fastify.requirePermission([
      {
        resource: 'archives',
        action: 'read',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { archiveId } = ArchiveIdSchema.parse(request.params);
      const query = request.query as { 
        includeMetadata?: boolean; 
        includeValidationResults?: boolean;
        includeAccessLog?: boolean;
      };
      const user = (request.user as any);

      const archive = await archiveService.getArchiveById(archiveId, {
        includeMetadata: query.includeMetadata,
        includeValidationResults: query.includeValidationResults,
        includeAccessLog: query.includeAccessLog && user.isSuperAdmin
      });

      if (!archive) {
        return reply.code(404).send({
          success: false,
          error: 'Archive not found'
        });
      }

      // Log archive access
      await archiveService.logAccess(archiveId, user.id, 'view_metadata', {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });

      return reply.send({
        success: true,
        data: archive
      });

    } catch (error) {
      console.error('Error getting archive:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get archive',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Query archives with filtering and pagination
   * POST /api/archives/query
   */
  fastify.post<{
    Body: z.infer<typeof ArchiveQuerySchema>
  }>('/query', {
    preHandler: fastify.requirePermission([
      {
        resource: 'archives',
        action: 'read',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = ArchiveQuerySchema.parse(request.body);
      const user = (request.user as any);

      // Restrict query to user's archives unless they're an admin
      if (!user.isSuperAdmin && !query.createdBy) {
        query.createdBy = user.id;
      }

      const result = await archiveService.queryArchives(query);

      return reply.send({
        success: true,
        data: {
          archives: result.archives,
          pagination: {
            total: result.totalCount,
            limit: query.limit,
            offset: query.offset,
            hasMore: result.hasMore
          }
        }
      });

    } catch (error) {
      console.error('Error querying archives:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to query archives',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Request archive restoration
   * POST /api/archives/:archiveId/restore
   */
  fastify.post<{
    Params: z.infer<typeof ArchiveIdSchema>;
    Body: z.infer<typeof RestoreRequestSchema>
  }>('/:archiveId/restore', {
    preHandler: fastify.requirePermission([
      {
        resource: 'archives',
        action: 'restore',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { archiveId } = ArchiveIdSchema.parse(request.params);
      const restoreData = RestoreRequestSchema.parse(request.body);
      const user = (request.user as any);

      const restoreId = await archiveService.requestRestore(
        archiveId,
        restoreData.restoreType,
        user.id,
        {
          targetLocation: restoreData.targetLocation,
          partialRestore: restoreData.partialRestoreConfig,
          priority: restoreData.priority,
          reason: restoreData.reason,
          notifyOnComplete: restoreData.notifyOnComplete,
          expiresAt: restoreData.expiresAt
        }
      );

      return reply.code(202).send({
        success: true,
        data: {
          restoreId,
          archiveId,
          restoreType: restoreData.restoreType,
          status: 'requested',
          estimatedTime: this.calculateEstimatedRestoreTime(restoreData.restoreType),
          trackingUrl: `/api/archives/${archiveId}/restore/${restoreId}`
        },
        message: 'Archive restoration requested successfully'
      });

    } catch (error) {
      console.error('Error requesting restore:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to request restore',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get restore request status
   * GET /api/archives/:archiveId/restore/:restoreId
   */
  fastify.get<{
    Params: { archiveId: string; restoreId: string }
  }>('/:archiveId/restore/:restoreId', {
    preHandler: fastify.requirePermission([
      {
        resource: 'archives',
        action: 'read',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { archiveId, restoreId } = request.params;
      const user = (request.user as any);

      const restoreRequest = await archiveService.getRestoreRequest(restoreId, user.id);

      if (!restoreRequest) {
        return reply.code(404).send({
          success: false,
          error: 'Restore request not found'
        });
      }

      return reply.send({
        success: true,
        data: restoreRequest
      });

    } catch (error) {
      console.error('Error getting restore request:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get restore request',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Delete an archive
   * DELETE /api/archives/:archiveId
   */
  fastify.delete<{
    Params: z.infer<typeof ArchiveIdSchema>;
    Body: { reason?: string; forceDelete?: boolean }
  }>('/:archiveId', {
    preHandler: fastify.requirePermission([
      {
        resource: 'archives',
        action: 'delete',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { archiveId } = ArchiveIdSchema.parse(request.params);
      const { reason, forceDelete } = request.body as { reason?: string; forceDelete?: boolean };
      const user = (request.user as any);

      await archiveService.deleteArchive(archiveId, user.id, {
        reason: reason || 'Archive deletion requested',
        forceDelete: forceDelete || false
      });

      return reply.send({
        success: true,
        message: 'Archive deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting archive:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to delete archive',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Create retention policy
   * POST /api/archives/retention-policies
   */
  fastify.post<{
    Body: z.infer<typeof RetentionPolicySchema>
  }>('/retention-policies', {
    preHandler: fastify.requirePermission([
      {
        resource: 'archives',
        action: 'manage_retention_policies',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const policyData = RetentionPolicySchema.parse(request.body);
      const user = (request.user as any);

      const policy = await archiveService.createRetentionPolicy(policyData, user.id);

      return reply.code(201).send({
        success: true,
        data: policy,
        message: 'Retention policy created successfully'
      });

    } catch (error) {
      console.error('Error creating retention policy:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to create retention policy',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get archive statistics
   * GET /api/archives/statistics
   */
  fastify.get<{
    Querystring: {
      period?: string;
      category?: string;
      archiveType?: string;
      detailed?: boolean;
    }
  }>('/statistics', {
    preHandler: fastify.requirePermission([
      {
        resource: 'archives',
        action: 'read_statistics',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        period?: string;
        category?: string;
        archiveType?: string;
        detailed?: boolean;
      };

      const statistics = await archiveService.getArchiveStatistics({
        period: query.period,
        category: query.category as any,
        archiveType: query.archiveType as any,
        detailed: query.detailed || false
      });

      return reply.send({
        success: true,
        data: statistics,
        metadata: {
          generatedAt: new Date().toISOString(),
          period: query.period || 'all_time'
        }
      });

    } catch (error) {
      console.error('Error getting archive statistics:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get archive statistics',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Perform bulk operations on archives
   * POST /api/archives/bulk
   */
  fastify.post<{
    Body: z.infer<typeof BulkArchiveOperationSchema>
  }>('/bulk', {
    preHandler: fastify.requirePermission([
      {
        resource: 'archives',
        action: 'bulk_operations',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const bulkOperation = BulkArchiveOperationSchema.parse(request.body);
      const user = (request.user as any);

      const result = await archiveService.performBulkOperation(
        bulkOperation.archiveIds,
        bulkOperation.operation,
        user.id,
        {
          parameters: bulkOperation.parameters,
          reason: bulkOperation.reason,
          priority: bulkOperation.priority,
          notifyOnComplete: bulkOperation.notifyOnComplete
        }
      );

      return reply.send({
        success: true,
        data: {
          jobId: result.jobId,
          totalArchives: bulkOperation.archiveIds.length,
          operation: bulkOperation.operation,
          status: 'queued',
          estimatedTime: result.estimatedTime
        },
        message: `Bulk operation queued: ${bulkOperation.operation} on ${bulkOperation.archiveIds.length} archives`
      });

    } catch (error) {
      console.error('Error performing bulk operation:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to perform bulk operation',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get archive health status
   * GET /api/archives/health
   */
  fastify.get('/health', {
    preHandler: fastify.requirePermission([
      {
        resource: 'archives',
        action: 'read_health',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const health = await archiveService.getHealthStatus();

      return reply.send({
        success: true,
        data: {
          status: health.overall,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          components: {
            archiveService: health.archiveService,
            storage: health.storage,
            processingQueue: health.processingQueue,
            retentionPolicies: health.retentionPolicies,
            validation: health.validation
          },
          metrics: {
            totalArchives: health.metrics.totalArchives,
            healthyArchives: health.metrics.healthyArchives,
            corruptedArchives: health.metrics.corruptedArchives,
            expiringSoon: health.metrics.expiringSoon,
            totalStorageUsed: health.metrics.totalStorageUsed,
            averageCompressionRatio: health.metrics.averageCompressionRatio,
            queuedJobs: health.metrics.queuedJobs,
            processingJobs: health.metrics.processingJobs
          },
          recommendations: health.recommendations || []
        }
      });

    } catch (error) {
      return reply.code(503).send({
        success: false,
        error: 'Archive management system unhealthy',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Validate archive integrity
   * POST /api/archives/:archiveId/validate
   */
  fastify.post<{
    Params: z.infer<typeof ArchiveIdSchema>;
    Body: { 
      validationType?: string; 
      forceValidation?: boolean;
      priority?: number;
    }
  }>('/:archiveId/validate', {
    preHandler: fastify.requirePermission([
      {
        resource: 'archives',
        action: 'validate',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { archiveId } = ArchiveIdSchema.parse(request.params);
      const { validationType, forceValidation, priority } = request.body as { 
        validationType?: string; 
        forceValidation?: boolean;
        priority?: number;
      };
      const user = (request.user as any);

      const validationJob = await archiveService.scheduleValidation(
        archiveId,
        user.id,
        {
          validationType: validationType || 'full_validation',
          forceValidation: forceValidation || false,
          priority: priority || 100
        }
      );

      return reply.code(202).send({
        success: true,
        data: {
          jobId: validationJob.id,
          archiveId,
          validationType,
          status: 'queued',
          estimatedTime: validationJob.estimatedTime
        },
        message: 'Archive validation scheduled successfully'
      });

    } catch (error) {
      console.error('Error scheduling validation:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to schedule validation',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Helper method for calculating estimated restore time
  function calculateEstimatedRestoreTime(restoreType: RestoreType): string {
    switch (restoreType) {
      case 'metadata_only':
        return '1-2 minutes';
      case 'preview_restore':
        return '2-5 minutes';
      case 'partial_restore':
        return '5-15 minutes';
      case 'full_restore':
        return '10-60 minutes';
      case 'validation_restore':
        return '5-30 minutes';
      default:
        return '5-15 minutes';
    }
  }
}