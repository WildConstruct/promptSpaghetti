/**
 * Uploader API Routes (Epic 17)
 * 
 * DEPLOYMENT BLOCKER FIX: RESTful API endpoints for comprehensive file upload system.
 * Provides multi-part upload, progress tracking, processing management, and file operations
 * for the uploader architecture.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { 
  UploaderService,
  /* UploadType,
  UploadCategory,
  */ SecurityLevel,
  StorageBackend
} from '../admin/UploaderArchitecture';
import { pipeline } from 'stream/promises';
import { createHash } from 'crypto';
import { Readable } from 'stream';

// Validation schemas
const UploadTypeSchema = z.enum([
  'document', 'image', 'video', 'audio', 'archive', 'data_import',
  'configuration', 'logs', 'backup', 'template', 'report', 
  'certificate', 'key', 'other'
]);

const UploadCategorySchema = z.enum([
  'admin_import', 'user_content', 'system_data', 'configuration_file',
  'backup_restore', 'bulk_operation', 'media_asset', 'document_library',
  'template_library', 'security_asset', 'compliance_data', 'analytics_data',
  'integration_data', 'custom'
]);

const SecurityLevelSchema = z.enum([
  'public', 'internal', 'confidential', 'restricted', 'top_secret'
]);

const StorageBackendSchema = z.enum([
  'local_filesystem', 'aws_s3', 'google_cloud_storage', 
  'azure_blob', 'minio', 'ftp', 'sftp'
]);

const InitiateUploadSchema = z.object({
  filename: z.string().min(1).max(500).regex(/^[^<>:"/\\|?*]+$/, 'Invalid filename characters'),
  fileSize: z.number().positive().max(10 * 1024 * 1024 * 1024), // 10GB max
  mimeType: z.string().min(1).max(100),
  uploadType: UploadTypeSchema.optional(),
  category: UploadCategorySchema.default('user_content'),
  purpose: z.string().min(5).max(200),
  description: z.string().max(1000).optional(),
  
  // Upload options
  maxChunkSize: z.number().positive().max(100 * 1024 * 1024).default(1024 * 1024), // 1MB default, 100MB max
  allowResume: z.boolean().default(true),
  compressionEnabled: z.boolean().default(false),
  generateThumbnails: z.boolean().optional(),
  extractMetadata: z.boolean().default(true),
  performOCR: z.boolean().default(false),
  
  // Security options
  securityLevel: SecurityLevelSchema.default('internal'),
  encryptionRequired: z.boolean().default(false),
  virusScanRequired: z.boolean().default(true),
  
  // Storage options
  storageBackend: StorageBackendSchema.optional(),
  retentionDays: z.number().positive().max(7300).optional(), // ~20 years max
  
  // Custom metadata
  tags: z.array(z.string()).max(50).default([]),
  customFields: z.record(z.unknown()).default({})
});

const UploadChunkSchema = z.object({
  chunkNumber: z.number().nonnegative(),
  chunkSize: z.number().positive().max(100 * 1024 * 1024), // 100MB max
  chunkChecksum: z.string().regex(/^[a-f0-9]{64}$/, 'Invalid SHA-256 checksum'),
  totalChunks: z.number().positive(),
  isLastChunk: z.boolean().default(false)
});

const UploadIdSchema = z.object({
  uploadId: z.string().uuid()
});

const UploadQuerySchema = z.object({
  status: z.array(z.string()).optional(),
  category: z.array(UploadCategorySchema).optional(),
  uploadType: z.array(UploadTypeSchema).optional(),
  uploadedBy: z.string().uuid().optional(),
  filename: z.string().max(200).optional(),
  startDate: z.string().datetime().transform(str => new Date(str)).optional(),
  endDate: z.string().datetime().transform(str => new Date(str)).optional(),
  minSize: z.number().nonnegative().optional(),
  maxSize: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  processingStatus: z.array(z.string()).optional(),
  securityLevel: z.array(SecurityLevelSchema).optional(),
  sort: z.enum(['created_at', 'updated_at', 'filename', 'file_size', 'status']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().positive().max(1000).default(50),
  offset: z.number().nonnegative().default(0),
  includeProcessingJobs: z.boolean().default(false),
  includeChunks: z.boolean().default(false)
});

const ProcessingJobControlSchema = z.object({
  action: z.enum(['retry', 'cancel', 'skip', 'prioritize']),
  reason: z.string().min(5).max(200).optional()
});

const BulkOperationSchema = z.object({
  uploadIds: z.array(z.string().uuid()).min(1).max(100),
  operation: z.enum(['delete', 'reprocess', 'change_category', 'update_metadata', 'move_storage']),
  parameters: z.record(z.unknown()).optional(),
  reason: z.string().min(5).max(500)
});

export async function uploaderRoutes(
  fastify: FastifyInstance,
  uploaderService: UploaderService
) {
  // Apply authentication to all routes
  fastify.addHook('onRequest', fastify.authenticate);

  /**
   * Initiate a new file upload
   * POST /api/uploads/initiate
   */
  fastify.post<{
    Body: z.infer<typeof InitiateUploadSchema>
  }>('/initiate', {
    preHandler: fastify.requirePermission([
      {
        resource: 'uploads',
        action: 'create',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const uploadData = InitiateUploadSchema.parse(request.body);
      const user = (request.user as unknown);

      const uploadRequest = await uploaderService.initiateUpload(
        uploadData.filename,
        uploadData.fileSize,
        uploadData.mimeType,
(user as any).id,
        {
          maxChunkSize: uploadData.maxChunkSize,
          allowResume: uploadData.allowResume,
          compressionEnabled: uploadData.compressionEnabled,
          generatePreview: uploadData.generateThumbnails,
          extractText: uploadData.performOCR,
          storageBackend: uploadData.storageBackend,
          notifyOnComplete: true,
          notifyOnError: true
  }
        {
          purpose: uploadData.purpose,
          description: uploadData.description,
          uploadSource: 'web',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          sessionId: request.session?.sessionId,
          securityLevel: uploadData.securityLevel,
          encryptionRequired: uploadData.encryptionRequired,
          virusScanRequired: uploadData.virusScanRequired,
          retentionPeriod: uploadData.retentionDays,
          tags: uploadData.tags,
          customFields: uploadData.customFields,
          requiresProcessing: uploadData.extractMetadata || uploadData.generateThumbnails || uploadData.performOCR,
          extractMetadata: uploadData.extractMetadata,
          generateThumbnails: uploadData.generateThumbnails,
          performOCR: uploadData.performOCR
        }
      );

      return reply.code(201).send({
        success: true,
        data: {
          uploadId: uploadRequest.id,
          uploadUrl: `/api/uploads/${uploadRequest.id}/chunks`,
          maxChunkSize: uploadRequest.options.maxChunkSize,
          allowResume: uploadRequest.options.allowResume,
          expiresAt: uploadRequest.expiresAt?.toISOString(),
          totalChunks: Math.ceil(uploadRequest.size / uploadRequest.options.maxChunkSize),
          processingPipeline: uploadRequest.metadata.requiresProcessing ? 
            ['virus_scan', 'metadata_extraction'] : []
  }
        message: 'Upload initiated successfully'
      });

    } catch (error) {
      console.error('Error initiating upload:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to initiate upload',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Upload a file chunk
   * POST /api/uploads/:uploadId/chunks
   */
  fastify.post<{
    Params: z.infer<typeof UploadIdSchema>;
    Body: z.infer<typeof UploadChunkSchema> & { chunk: Buffer }
  }>('/:uploadId/chunks', {
    preHandler: [
      fastify.requirePermission([
        {
          resource: 'uploads',
          action: 'upload',
          allowSuperAdmin: true
        }
      ])
    ]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { uploadId } = UploadIdSchema.parse(request.params);
      
      // Handle multipart form data
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({
          success: false,
          error: 'No file chunk provided'
        });
      }

      const chunkBuffer = await data.toBuffer();
      
      // Extract chunk metadata from fields
      const chunkNumber = parseInt(data.fields.chunkNumber?.value as string);
      const chunkChecksum = data.fields.chunkChecksum?.value as string;
      const totalChunks = parseInt(data.fields.totalChunks?.value as string);

      if (isNaN(chunkNumber) || !chunkChecksum || isNaN(totalChunks)) {
        return reply.code(400).send({
          success: false,
          error: 'Missing or invalid chunk metadata'
        });
      }

      // Validate chunk data
      const chunkValidation = UploadChunkSchema.parse({
        chunkNumber,
        chunkSize: chunkBuffer.length,
        chunkChecksum,
        totalChunks,
        isLastChunk: chunkNumber === totalChunks - 1
      });

      const progress = await uploaderService.uploadChunk(
        uploadId,
        chunkValidation.chunkNumber,
        chunkBuffer,
        chunkValidation.chunkChecksum
      );

      return reply.send({
        success: true,
        data: {
          chunkNumber: chunkValidation.chunkNumber,
          progress: {
            percentage: progress.percentage,
            bytesUploaded: progress.bytesUploaded,
            totalBytes: progress.totalBytes,
            chunksCompleted: progress.chunksCompleted,
            totalChunks: progress.totalChunks,
            speed: progress.speed,
            estimatedTimeRemaining: progress.estimatedTimeRemaining
  }
          uploadComplete: progress.status === 'completed',
          processingStarted: progress.status === 'processing'
  }
        message: `Chunk ${chunkValidation.chunkNumber + 1}/${totalChunks} uploaded successfully`
      });

    } catch (error) {
      console.error('Error uploading chunk:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to upload chunk',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get upload status and progress
   * GET /api/uploads/:uploadId
   */
  fastify.get<{
    Params: z.infer<typeof UploadIdSchema>;
    Querystring: { includeChunks?: boolean; includeJobs?: boolean }
  }>('/:uploadId', {
    preHandler: fastify.requirePermission([
      {
        resource: 'uploads',
        action: 'read',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { uploadId } = UploadIdSchema.parse(request.params);
      const query = request.query as { includeChunks?: boolean; includeJobs?: boolean };

      // This would be implemented in the UploaderService
      const uploadRequest = await uploaderService.getUploadRequest(uploadId);
      
      if (!uploadRequest) {
        return reply.code(404).send({
          success: false,
          error: 'Upload not found'
        });
      }

      // Check permission to access this upload
      const user = (request.user as unknown);
      if (uploadRequest.uploadedBy !== (user as any).id && !(user as any).isSuperAdmin) {
        return reply.code(403).send({
          success: false,
          error: 'Access denied'
        });
      }

      const progress = await uploaderService.getUploadProgress(uploadId);
      const responseData: unknown = {
        upload: {
          id: uploadRequest.id,
          filename: uploadRequest.filename,
          originalName: uploadRequest.originalName,
          mimeType: uploadRequest.mimeType,
          fileSize: uploadRequest.size,
          status: uploadRequest.status,
          uploadType: uploadRequest.uploadType,
          category: uploadRequest.category,
          createdAt: uploadRequest.createdAt,
          updatedAt: uploadRequest.updatedAt,
          completedAt: uploadRequest.completedAt,
          expiresAt: uploadRequest.expiresAt
  }
        progress,
        metadata: uploadRequest.metadata
      };

      if (query.includeChunks) {
        responseData.chunks = uploadRequest.chunks;
      }

      if (query.includeJobs) {
        responseData.processingJobs = await uploaderService.getProcessingJobs(uploadId);
      }

      return reply.send({
        success: true,
        data: responseData
      });

    } catch (error) {
      console.error('Error getting upload:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get upload status',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Query uploads with filtering and pagination
   * POST /api/uploads/query
   */
  fastify.post<{
    Body: z.infer<typeof UploadQuerySchema>
  }>('/query', {
    preHandler: fastify.requirePermission([
      {
        resource: 'uploads',
        action: 'read',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = UploadQuerySchema.parse(request.body);
      const user = (request.user as unknown);

      // Restrict query to user's uploads unless they're an admin
      if (!(user as any).isSuperAdmin) {
        query.uploadedBy = (user as any).id;
      }

      const result = await uploaderService.queryUploads(query);

      return reply.send({
        success: true,
        data: {
          uploads: result.uploads,
          pagination: {
            total: result.totalCount,
            limit: query.limit,
            offset: query.offset,
            hasMore: result.hasMore
          }
        }
      });

    } catch (error) {
      console.error('Error querying uploads:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to query uploads',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Cancel an upload
   * DELETE /api/uploads/:uploadId
   */
  fastify.delete<{
    Params: z.infer<typeof UploadIdSchema>;
    Body: { reason?: string }
  }>('/:uploadId', {
    preHandler: fastify.requirePermission([
      {
        resource: 'uploads',
        action: 'delete',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { uploadId } = UploadIdSchema.parse(request.params);
      const { reason } = request.body as { reason?: string };
      const user = (request.user as unknown);

      await uploaderService.cancelUpload(uploadId, (user as any).id, reason);

      return reply.send({
        success: true,
        message: 'Upload cancelled successfully'
      });

    } catch (error) {
      console.error('Error cancelling upload:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to cancel upload',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Control processing jobs
   * POST /api/uploads/:uploadId/processing/:jobId
   */
  fastify.post<{
    Params: { uploadId: string; jobId: string };
    Body: z.infer<typeof ProcessingJobControlSchema>
  }>('/:uploadId/processing/:jobId', {
    preHandler: fastify.requirePermission([
      {
        resource: 'uploads',
        action: 'manage_processing',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { uploadId, jobId } = request.params;
      const controlData = ProcessingJobControlSchema.parse(request.body);
      const user = (request.user as unknown);

      const result = await uploaderService.controlProcessingJob(
        uploadId,
        jobId,
        controlData.action,
(user as any).id,
        controlData.reason
      );

      return reply.send({
        success: true,
        data: result,
        message: `Processing job ${controlData.action} completed successfully`
      });

    } catch (error) {
      console.error('Error controlling processing job:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to control processing job',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Download processed file
   * GET /api/uploads/:uploadId/download
   */
  fastify.get<{
    Params: z.infer<typeof UploadIdSchema>;
    Querystring: { variant?: string }
  }>('/:uploadId/download', {
    preHandler: fastify.requirePermission([
      {
        resource: 'uploads',
        action: 'download',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { uploadId } = UploadIdSchema.parse(request.params);
      const { variant } = request.query as { variant?: string };
      const user = (request.user as unknown);

      const downloadInfo = await uploaderService.getDownloadInfo(uploadId, variant, (user as any).id);

      if (!downloadInfo) {
        return reply.code(404).send({
          success: false,
          error: 'File not found or not accessible'
        });
      }

      // Set appropriate headers
      reply.header('Content-Disposition', `attachment; filename="${downloadInfo.filename}"`);
      reply.header('Content-Type', downloadInfo.contentType);
      reply.header('Content-Length', downloadInfo.size);

      // Stream the file
      const fileStream = await uploaderService.createDownloadStream(downloadInfo.location);
      return reply.send(fileStream);

    } catch (error) {
      console.error('Error downloading file:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to download file',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Bulk operations on multiple uploads
   * POST /api/uploads/bulk
   */
  fastify.post<{
    Body: z.infer<typeof BulkOperationSchema>
  }>('/bulk', {
    preHandler: fastify.requirePermission([
      {
        resource: 'uploads',
        action: 'bulk_operations',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const bulkOperation = BulkOperationSchema.parse(request.body);
      const user = (request.user as unknown);

      const result = await uploaderService.performBulkOperation(
        bulkOperation.uploadIds,
        bulkOperation.operation,
(user as any).id,
        bulkOperation.parameters,
        bulkOperation.reason
      );

      return reply.send({
        success: true,
        data: {
          totalProcessed: result.totalProcessed,
          successful: result.successful,
          failed: result.failed,
          results: result.results
  }
        message: `Bulk operation completed: ${result.successful} successful, ${result.failed} failed`
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
   * Get upload statistics and analytics
   * GET /api/uploads/statistics
   */
  fastify.get<{
    Querystring: {
      startDate?: string;
      endDate?: string;
      groupBy?: string;
      category?: string;
      uploadType?: string;
    }
  }>('/statistics', {
    preHandler: fastify.requirePermission([
      {
        resource: 'uploads',
        action: 'read_statistics',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        startDate?: string;
        endDate?: string;
        groupBy?: string;
        category?: string;
        uploadType?: string;
      };

      const startDate = query.startDate ? new Date(query.startDate) : 
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = query.endDate ? new Date(query.endDate) : new Date();

      const statistics = await uploaderService.getUploadStatistics({
        startDate,
        endDate,
        groupBy: query.groupBy as any,
        category: query.category as any,
        uploadType: query.uploadType as any
      });

      return reply.send({
        success: true,
        data: statistics,
        metadata: {
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
  }
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error getting upload statistics:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get upload statistics',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Health check for uploader system
   * GET /api/uploads/health
   */
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const health = await uploaderService.getHealthStatus();

      return reply.send({
        success: true,
        data: {
          status: health.overall,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          components: {
            uploadService: health.uploadService,
            storageProviders: health.storageProviders,
            processingQueue: health.processingQueue,
            database: health.database
  }
          metrics: {
            activeUploads: health.metrics.activeUploads,
            queuedJobs: health.metrics.queuedJobs,
            processingJobs: health.metrics.processingJobs,
            totalStorage: health.metrics.totalStorageUsed,
            averageUploadTime: health.metrics.averageUploadTime
          }
        }
      });

    } catch (error) {
      return reply.code(503).send({
        success: false,
        error: 'Uploader system unhealthy',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
}