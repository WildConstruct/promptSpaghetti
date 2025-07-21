// Data Export API Routes - Epic 19
// RESTful API for secure data export functionality

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DataExportService, ExportRequest, ExportType, ExportFormat } from '../services/DataExportService';
import { z } from 'zod';
import * as fs from 'fs';

// Request schemas
const ExportRequestSchema = z.object({
  exportType: z.enum(['USER_DATA', 'ACCESS_LOGS', 'AUDIT_TRAIL', 'SYSTEM_LOGS', 'COMPLIANCE_REPORT', 'SECURITY_EVENTS', 'CUSTOM_QUERY'] as const),
  dataCategories: z.array(z.string()).min(1, 'At least one data category required'),
  format: z.enum(['JSON', 'CSV', 'XML', 'PDF', 'XLSX'] as const),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
  timeRange: z.object({
    startDate: z.string().datetime().transform(val => new Date(val)),
    endDate: z.string().datetime().transform(val => new Date(val))
  }).optional(),
  filters: z.object({
    classification: z.array(z.string()).optional(),
    resourceIds: z.array(z.string()).optional(),
    operations: z.array(z.string()).optional(),
    userIds: z.array(z.string()).optional(),
    customFilters: z.record(z.any()).optional()
  }).optional(),
  includeMetadata: z.boolean().default(false),
  anonymize: z.boolean().default(false),
  encryptOutput: z.boolean().default(false)
});

const ExportHistoryQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'] as const).optional(),
  exportType: z.enum(['USER_DATA', 'ACCESS_LOGS', 'AUDIT_TRAIL', 'SYSTEM_LOGS', 'COMPLIANCE_REPORT', 'SECURITY_EVENTS', 'CUSTOM_QUERY'] as const).optional()
});

// Type definitions for requests
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

interface ExportRequestBody extends AuthenticatedRequest {
  Body: z.infer<typeof ExportRequestSchema>;
}

interface ExportJobRequest extends AuthenticatedRequest {
  Params: { jobId: string };
}

interface ExportHistoryRequest extends AuthenticatedRequest {
  Querystring: z.infer<typeof ExportHistoryQuerySchema>;
}

export async function dataExportRoutes(fastify: FastifyInstance) {
  // Get the data export service from the DI container
  const dataExportService = fastify.dataExportService as DataExportService;

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
    max: 10, // Maximum requests per window (export requests are resource-intensive)
    timeWindow: '1 hour'
  };

  /**
   * Request data export
   * POST /api/data-export/request
   */
  fastify.post('/request', {
    preHandler: [authenticate],
    config: { rateLimit: rateLimitConfig },
    schema: {
      body: {
        type: 'object',
        properties: {
          exportType: { 
            type: 'string',
            enum: ['USER_DATA', 'ACCESS_LOGS', 'AUDIT_TRAIL', 'SYSTEM_LOGS', 'COMPLIANCE_REPORT', 'SECURITY_EVENTS', 'CUSTOM_QUERY']
          },
          dataCategories: { 
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          },
          format: {
            type: 'string',
            enum: ['JSON', 'CSV', 'XML', 'PDF', 'XLSX']
          },
          purpose: { type: 'string', minLength: 10 },
          timeRange: {
            type: 'object',
            properties: {
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' }
            }
          },
          filters: {
            type: 'object',
            properties: {
              classification: { type: 'array', items: { type: 'string' } },
              resourceIds: { type: 'array', items: { type: 'string' } },
              operations: { type: 'array', items: { type: 'string' } },
              userIds: { type: 'array', items: { type: 'string' } },
              customFilters: { type: 'object' }
            }
          },
          includeMetadata: { type: 'boolean', default: false },
          anonymize: { type: 'boolean', default: false },
          encryptOutput: { type: 'boolean', default: false }
        },
        required: ['exportType', 'dataCategories', 'format', 'purpose']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
            estimatedTime: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: ExportRequestBody, reply: FastifyReply) => {
    try {
      const validatedBody = ExportRequestSchema.parse(request.body);

      const exportRequest: ExportRequest = {
        userId: request.user!.id,
        requestedBy: request.user!.email,
        exportType: validatedBody.exportType as ExportType,
        dataCategories: validatedBody.dataCategories,
        format: validatedBody.format as ExportFormat,
        purpose: validatedBody.purpose,
        timeRange: validatedBody.timeRange,
        filters: validatedBody.filters,
        includeMetadata: validatedBody.includeMetadata,
        anonymize: validatedBody.anonymize,
        encryptOutput: validatedBody.encryptOutput
      };

      const result = await dataExportService.requestExport(exportRequest);
      
      reply.send({
        jobId: result.jobId,
        estimatedTime: result.estimatedTime,
        message: 'Export request submitted successfully. You will be notified when the export is ready.'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        fastify.log.error('Error requesting data export:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to process export request'
        });
      }
    }
  });

  /**
   * Get export job status
   * GET /api/data-export/jobs/:jobId
   */
  fastify.get('/jobs/:jobId', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 100, timeWindow: '1 minute' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          jobId: { type: 'string' }
        },
        required: ['jobId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
            status: { type: 'string' },
            progress: { type: 'number' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            recordCount: { type: 'number' },
            fileSize: { type: 'number' },
            errorMessage: { type: 'string' }
          }
        }
      }
    }
  }, async (request: ExportJobRequest, reply: FastifyReply) => {
    try {
      const { jobId } = request.params;
      
      const job = await dataExportService.getExportJobStatus(jobId, request.user!.id);
      
      if (!job) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Export job not found'
        });
      }

      reply.send({
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
        startTime: job.startTime.toISOString(),
        endTime: job.endTime?.toISOString(),
        recordCount: job.recordCount,
        fileSize: job.fileSize,
        errorMessage: job.errorMessage
      });

    } catch (error) {
      fastify.log.error('Error getting export job status:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get export job status'
      });
    }
  });

  /**
   * Download export file
   * GET /api/data-export/download/:jobId
   */
  fastify.get('/download/:jobId', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 20, timeWindow: '1 hour' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          jobId: { type: 'string' }
        },
        required: ['jobId']
      }
    }
  }, async (request: ExportJobRequest, reply: FastifyReply) => {
    try {
      const { jobId } = request.params;
      
      const downloadInfo = await dataExportService.downloadExport(jobId, request.user!.id);
      
      // Check if file exists
      if (!fs.existsSync(downloadInfo.filePath)) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Export file no longer available'
        });
      }

      // Set headers for file download
      reply.header('Content-Disposition', `attachment; filename="${downloadInfo.fileName}"`);
      reply.header('Content-Type', downloadInfo.contentType);
      
      // Stream the file
      const stream = fs.createReadStream(downloadInfo.filePath);
      reply.send(stream);

    } catch (error) {
      fastify.log.error('Error downloading export file:', error);
      
      if (error.message === 'Export job not found' || error.message === 'Export job not completed') {
        reply.code(404).send({
          error: 'Not Found',
          message: error.message
        });
      } else {
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to download export file'
        });
      }
    }
  });

  /**
   * Get export history
   * GET /api/data-export/history
   */
  fastify.get('/history', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 50, timeWindow: '1 minute' } },
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          status: { 
            type: 'string',
            enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']
          },
          exportType: {
            type: 'string',
            enum: ['USER_DATA', 'ACCESS_LOGS', 'AUDIT_TRAIL', 'SYSTEM_LOGS', 'COMPLIANCE_REPORT', 'SECURITY_EVENTS', 'CUSTOM_QUERY']
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            exports: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  jobId: { type: 'string' },
                  status: { type: 'string' },
                  progress: { type: 'number' },
                  startTime: { type: 'string', format: 'date-time' },
                  endTime: { type: 'string', format: 'date-time' },
                  recordCount: { type: 'number' },
                  fileSize: { type: 'number' }
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
  }, async (request: ExportHistoryRequest, reply: FastifyReply) => {
    try {
      const queryParams = ExportHistoryQuerySchema.parse(request.query);
      
      const history = await dataExportService.getUserExportHistory(
        request.user!.id,
        queryParams.limit,
        queryParams.offset
      );

      // Filter by status and export type if provided
      let filteredHistory = history;
      
      if (queryParams.status) {
        filteredHistory = filteredHistory.filter(job => job.status === queryParams.status);
      }
      
      if (queryParams.exportType) {
        // Would need to store export type in job metadata to filter
        // For now, we'll include all jobs
      }

      reply.send({
        exports: filteredHistory.map(job => ({
          jobId: job.jobId,
          status: job.status,
          progress: job.progress,
          startTime: job.startTime.toISOString(),
          endTime: job.endTime?.toISOString(),
          recordCount: job.recordCount,
          fileSize: job.fileSize
        })),
        pagination: {
          limit: queryParams.limit,
          offset: queryParams.offset,
          total: filteredHistory.length
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
        fastify.log.error('Error getting export history:', error);
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to get export history'
        });
      }
    }
  });

  /**
   * Cancel export job
   * POST /api/data-export/cancel/:jobId
   */
  fastify.post('/cancel/:jobId', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          jobId: { type: 'string' }
        },
        required: ['jobId']
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
  }, async (request: ExportJobRequest, reply: FastifyReply) => {
    try {
      const { jobId } = request.params;
      
      await dataExportService.cancelExportJob(jobId, request.user!.id);
      
      reply.send({
        success: true,
        message: 'Export job cancelled successfully'
      });

    } catch (error) {
      fastify.log.error('Error cancelling export job:', error);
      
      if (error.message === 'Export job not found' || error.message === 'Cannot cancel completed job') {
        reply.code(400).send({
          error: 'Bad Request',
          message: error.message
        });
      } else {
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to cancel export job'
        });
      }
    }
  });

  /**
   * Get available export types and data categories
   * GET /api/data-export/metadata
   */
  fastify.get('/metadata', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 100, timeWindow: '1 minute' } },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            exportTypes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  description: { type: 'string' },
                  dataCategories: { type: 'array', items: { type: 'string' } },
                  supportedFormats: { type: 'array', items: { type: 'string' } },
                  estimatedTime: { type: 'string' },
                  maxRecords: { type: 'number' }
                }
              }
            },
            formats: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  format: { type: 'string' },
                  description: { type: 'string' },
                  mimeType: { type: 'string' },
                  supportsAnonymization: { type: 'boolean' },
                  supportsEncryption: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    reply.send({
      exportTypes: [
        {
          type: 'USER_DATA',
          description: 'Export user profile and preference data',
          dataCategories: ['profile', 'preferences', 'settings'],
          supportedFormats: ['JSON', 'CSV', 'XML'],
          estimatedTime: '2-5 minutes',
          maxRecords: 1000
        },
        {
          type: 'ACCESS_LOGS',
          description: 'Export user access and activity logs',
          dataCategories: ['access_logs', 'login_history'],
          supportedFormats: ['JSON', 'CSV'],
          estimatedTime: '5-15 minutes',
          maxRecords: 50000
        },
        {
          type: 'AUDIT_TRAIL',
          description: 'Export audit trail and compliance data',
          dataCategories: ['audit_events', 'compliance_records'],
          supportedFormats: ['JSON', 'CSV', 'PDF'],
          estimatedTime: '10-30 minutes',
          maxRecords: 100000
        },
        {
          type: 'SECURITY_EVENTS',
          description: 'Export security events and alerts',
          dataCategories: ['security_events', 'alerts', 'incidents'],
          supportedFormats: ['JSON', 'CSV'],
          estimatedTime: '5-20 minutes',
          maxRecords: 25000
        }
      ],
      formats: [
        {
          format: 'JSON',
          description: 'JavaScript Object Notation',
          mimeType: 'application/json',
          supportsAnonymization: true,
          supportsEncryption: true
        },
        {
          format: 'CSV',
          description: 'Comma Separated Values',
          mimeType: 'text/csv',
          supportsAnonymization: true,
          supportsEncryption: true
        },
        {
          format: 'XML',
          description: 'Extensible Markup Language',
          mimeType: 'application/xml',
          supportsAnonymization: true,
          supportsEncryption: true
        },
        {
          format: 'PDF',
          description: 'Portable Document Format',
          mimeType: 'application/pdf',
          supportsAnonymization: false,
          supportsEncryption: true
        }
      ]
    });
  });

  /**
   * Health check endpoint
   * GET /api/data-export/health
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
            version: { type: 'string' },
            queueStatus: { type: 'string' },
            activeJobs: { type: 'number' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // In a real implementation, you would check the export queue status
    reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      queueStatus: 'operational',
      activeJobs: 0
    });
  });
}

// Register the plugin
export default async function (fastify: FastifyInstance) {
  await fastify.register(dataExportRoutes, { prefix: '/api/data-export' });
}