import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ExportService } from '../services/export-service';
import { 
  CreateExportTemplateSchema,
  UpdateExportTemplateSchema,
  CreateExportJobSchema,
  UpdateExportJobSchema,
  CreateExportScheduleSchema,
  UpdateExportScheduleSchema,
  CreateExportShareSchema,
  UpdateExportShareSchema,
  CreateExportAnalyticsSchema,
  ExportFormat,
  ExportType,
  ExportJobStatus,
  validateExportOptions
} from '../../../packages/core/types/export';
import { z } from 'zod';
import { logger } from '../utils/logger';
import * as fs from 'fs/promises';
import * as path from 'path';

// Request parameter schemas
const ProjectParamsSchema = z.object({
  projectId: z.string().uuid()
});

const TemplateParamsSchema = z.object({
  templateId: z.string().uuid()
});

const JobParamsSchema = z.object({
  jobId: z.string().uuid()
});



// Query parameter schemas
const ExportTemplateQuerySchema = z.object({
  format: z.enum(['json', 'yaml', 'xml', 'csv', 'markdown', 'pdf', 'html', 'zip']).optional(),
  isPublic: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20).optional(),
  offset: z.number().int().min(0).default(0).optional()
});

const ExportJobQuerySchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']).optional(),
  format: z.enum(['json', 'yaml', 'xml', 'csv', 'markdown', 'pdf', 'html', 'zip']).optional(),
  userId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(20).optional(),
  offset: z.number().int().min(0).default(0).optional()
});

export async function exportRoutes(fastify: FastifyInstance) {
  const exportService = new ExportService(fastify.db);

  // Export Templates
  
  // GET /api/projects/:projectId/export/templates
  fastify.get<{
    Params: z.infer<typeof ProjectParamsSchema>;
    Querystring: z.infer<typeof ExportTemplateQuerySchema>;
  }>('/projects/:projectId/export/templates', async (request, reply) => {
    try {
      const { projectId } = ProjectParamsSchema.parse(request.params);
      const queryOptions = ExportTemplateQuerySchema.parse(request.query);
      
      const templates = await exportService.getExportTemplates(projectId, queryOptions);
      
      reply.send({
        success: true,
        data: templates,
        pagination: {
          limit: queryOptions.limit,
          offset: queryOptions.offset,
          total: templates.length
        }
      });
    } catch (error) {
      logger.error('Failed to get export templates:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve export templates'
      });
    }
  });

  // POST /api/projects/:projectId/export/templates
  fastify.post<{
    Params: z.infer<typeof ProjectParamsSchema>;
    Body: z.infer<typeof CreateExportTemplateSchema>;
  }>('/projects/:projectId/export/templates', async (request, reply) => {
    try {
      const { projectId } = ProjectParamsSchema.parse(request.params);
      const templateData = CreateExportTemplateSchema.parse({
        ...request.body,
        project_id: projectId
      });
      
      const template = await exportService.createExportTemplate(templateData);
      
      reply.status(201).send({
        success: true,
        data: template
      });
    } catch (error) {
      logger.error('Failed to create export template:', error);
      reply.status(400).send({
        success: false,
        error: error.message || 'Failed to create export template'
      });
    }
  });

  // GET /api/export/templates/:templateId
  fastify.get<{
    Params: z.infer<typeof TemplateParamsSchema>;
  }>('/export/templates/:templateId', async (request, reply) => {
    try {
      const { templateId } = TemplateParamsSchema.parse(request.params);
      const template = await exportService.getExportTemplate(templateId);
      
      if (!template) {
        return reply.status(404).send({
          success: false,
          error: 'Export template not found'
        });
      }
      
      reply.send({
        success: true,
        data: template
      });
    } catch (error) {
      logger.error('Failed to get export template:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve export template'
      });
    }
  });

  // GET /api/export/templates/:templateId/stats
  fastify.get<{
    Params: z.infer<typeof TemplateParamsSchema>;
  }>('/export/templates/:templateId/stats', async (request, reply) => {
    try {
      const { templateId } = TemplateParamsSchema.parse(request.params);
      const templateWithStats = await exportService.getExportTemplateWithStats(templateId);
      
      if (!templateWithStats) {
        return reply.status(404).send({
          success: false,
          error: 'Export template not found'
        });
      }
      
      reply.send({
        success: true,
        data: templateWithStats
      });
    } catch (error) {
      logger.error('Failed to get export template with stats:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve export template with stats'
      });
    }
  });

  // PUT /api/export/templates/:templateId
  fastify.put<{
    Params: z.infer<typeof TemplateParamsSchema>;
    Body: z.infer<typeof UpdateExportTemplateSchema>;
  }>('/export/templates/:templateId', async (request, reply) => {
    try {
      const { templateId } = TemplateParamsSchema.parse(request.params);
      const updates = UpdateExportTemplateSchema.parse(request.body);
      
      const template = await exportService.updateExportTemplate(templateId, updates);
      
      if (!template) {
        return reply.status(404).send({
          success: false,
          error: 'Export template not found'
        });
      }
      
      reply.send({
        success: true,
        data: template
      });
    } catch (error) {
      logger.error('Failed to update export template:', error);
      reply.status(400).send({
        success: false,
        error: error.message || 'Failed to update export template'
      });
    }
  });

  // DELETE /api/export/templates/:templateId
  fastify.delete<{
    Params: z.infer<typeof TemplateParamsSchema>;
  }>('/export/templates/:templateId', async (request, reply) => {
    try {
      const { templateId } = TemplateParamsSchema.parse(request.params);
      const deleted = await exportService.deleteExportTemplate(templateId);
      
      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: 'Export template not found'
        });
      }
      
      reply.send({
        success: true,
        message: 'Export template deleted successfully'
      });
    } catch (error) {
      logger.error('Failed to delete export template:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to delete export template'
      });
    }
  });

  // Export Jobs

  // GET /api/projects/:projectId/export/jobs
  fastify.get<{
    Params: z.infer<typeof ProjectParamsSchema>;
    Querystring: z.infer<typeof ExportJobQuerySchema>;
  }>('/projects/:projectId/export/jobs', async (request, reply) => {
    try {
      const { projectId } = ProjectParamsSchema.parse(request.params);
      const queryOptions = ExportJobQuerySchema.parse(request.query);
      
      const jobs = await exportService.getExportJobs(projectId, queryOptions);
      
      reply.send({
        success: true,
        data: jobs,
        pagination: {
          limit: queryOptions.limit,
          offset: queryOptions.offset,
          total: jobs.length
        }
      });
    } catch (error) {
      logger.error('Failed to get export jobs:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve export jobs'
      });
    }
  });

  // POST /api/projects/:projectId/export/jobs
  fastify.post<{
    Params: z.infer<typeof ProjectParamsSchema>;
    Body: z.infer<typeof CreateExportJobSchema>;
  }>('/projects/:projectId/export/jobs', async (request, reply) => {
    try {
      const { projectId } = ProjectParamsSchema.parse(request.params);
      const jobData = CreateExportJobSchema.parse({
        ...request.body,
        project_id: projectId,
        initiated_by: request.user?.id || 'system' // Assuming user context
      });
      
      const job = await exportService.createExportJob(jobData);
      
      reply.status(201).send({
        success: true,
        data: job
      });
    } catch (error) {
      logger.error('Failed to create export job:', error);
      reply.status(400).send({
        success: false,
        error: error.message || 'Failed to create export job'
      });
    }
  });

  // GET /api/export/jobs/:jobId
  fastify.get<{
    Params: z.infer<typeof JobParamsSchema>;
  }>('/export/jobs/:jobId', async (request, reply) => {
    try {
      const { jobId } = JobParamsSchema.parse(request.params);
      const job = await exportService.getExportJob(jobId);
      
      if (!job) {
        return reply.status(404).send({
          success: false,
          error: 'Export job not found'
        });
      }
      
      reply.send({
        success: true,
        data: job
      });
    } catch (error) {
      logger.error('Failed to get export job:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve export job'
      });
    }
  });

  // GET /api/export/jobs/:jobId/details
  fastify.get<{
    Params: z.infer<typeof JobParamsSchema>;
  }>('/export/jobs/:jobId/details', async (request, reply) => {
    try {
      const { jobId } = JobParamsSchema.parse(request.params);
      const jobWithTemplate = await exportService.getExportJobWithTemplate(jobId);
      
      if (!jobWithTemplate) {
        return reply.status(404).send({
          success: false,
          error: 'Export job not found'
        });
      }
      
      reply.send({
        success: true,
        data: jobWithTemplate
      });
    } catch (error) {
      logger.error('Failed to get export job details:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve export job details'
      });
    }
  });

  // GET /api/export/jobs/:jobId/progress
  fastify.get<{
    Params: z.infer<typeof JobParamsSchema>;
  }>('/export/jobs/:jobId/progress', async (request, reply) => {
    try {
      const { jobId } = JobParamsSchema.parse(request.params);
      const progress = await exportService.getExportProgress(jobId);
      
      if (!progress) {
        return reply.status(404).send({
          success: false,
          error: 'Export job not found'
        });
      }
      
      reply.send({
        success: true,
        data: progress
      });
    } catch (error) {
      logger.error('Failed to get export progress:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve export progress'
      });
    }
  });

  // PUT /api/export/jobs/:jobId/cancel
  fastify.put<{
    Params: z.infer<typeof JobParamsSchema>;
  }>('/export/jobs/:jobId/cancel', async (request, reply) => {
    try {
      const { jobId } = JobParamsSchema.parse(request.params);
      const cancelled = await exportService.cancelExportJob(jobId);
      
      if (!cancelled) {
        return reply.status(400).send({
          success: false,
          error: 'Export job cannot be cancelled'
        });
      }
      
      reply.send({
        success: true,
        message: 'Export job cancelled successfully'
      });
    } catch (error) {
      logger.error('Failed to cancel export job:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to cancel export job'
      });
    }
  });

  // GET /api/export/jobs/:jobId/download
  fastify.get<{
    Params: z.infer<typeof JobParamsSchema>;
  }>('/export/jobs/:jobId/download', async (request, reply) => {
    try {
      const { jobId } = JobParamsSchema.parse(request.params);
      const job = await exportService.getExportJob(jobId);
      
      if (!job) {
        return reply.status(404).send({
          success: false,
          error: 'Export job not found'
        });
      }

      if (job.status !== 'completed' || !job.output_file_path) {
        return reply.status(400).send({
          success: false,
          error: 'Export file not available'
        });
      }

      // Check if file exists
      const fileExists = await fs.access(job.output_file_path).then(() => true).catch(() => false);
      if (!fileExists) {
        return reply.status(404).send({
          success: false,
          error: 'Export file not found'
        });
      }

      // Set appropriate headers
      const fileName = path.basename(job.output_file_path);
      const format = await exportService.getExportFormat(job.export_format);
      const mimeType = format?.mime_type || 'application/octet-stream';

      reply.header('Content-Type', mimeType);
      reply.header('Content-Disposition', `attachment; filename="${fileName}"`);
      reply.header('Content-Length', job.output_file_size);

      // Stream the file
      const stream = await fs.readFile(job.output_file_path);
      reply.send(stream);

    } catch (error) {
      logger.error('Failed to download export file:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to download export file'
      });
    }
  });

  // Export Statistics

  // GET /api/projects/:projectId/export/statistics
  fastify.get<{
    Params: z.infer<typeof ProjectParamsSchema>;
  }>('/projects/:projectId/export/statistics', async (request, reply) => {
    try {
      const { projectId } = ProjectParamsSchema.parse(request.params);
      const statistics = await exportService.getExportStatistics(projectId);
      
      reply.send({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Failed to get export statistics:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve export statistics'
      });
    }
  });

  // Export Formats

  // GET /api/export/formats
  fastify.get('/export/formats', async (request, reply) => {
    try {
      const formats = await exportService.getExportFormats();
      
      reply.send({
        success: true,
        data: formats
      });
    } catch (error) {
      logger.error('Failed to get export formats:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve export formats'
      });
    }
  });

  // GET /api/export/formats/:formatName
  fastify.get<{
    Params: { formatName: string };
  }>('/export/formats/:formatName', async (request, reply) => {
    try {
      const { formatName } = request.params;
      const format = await exportService.getExportFormat(formatName);
      
      if (!format) {
        return reply.status(404).send({
          success: false,
          error: 'Export format not found'
        });
      }
      
      reply.send({
        success: true,
        data: format
      });
    } catch (error) {
      logger.error('Failed to get export format:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to retrieve export format'
      });
    }
  });

  // POST /api/export/formats/:formatName/validate-options
  fastify.post<{
    Params: { formatName: string };
    Body: any;
  }>('/export/formats/:formatName/validate-options', async (request, reply) => {
    try {
      const { formatName } = request.params;
      const options = request.body;
      
      const validation = validateExportOptions(formatName as ExportFormat, options);
      
      reply.send({
        success: true,
        data: {
          valid: validation.success,
          errors: validation.success ? [] : validation.error.errors,
          validatedOptions: validation.success ? validation.data : null
        }
      });
    } catch (error) {
      logger.error('Failed to validate export options:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to validate export options'
      });
    }
  });

  // Administrative endpoints

  // POST /api/export/cleanup/expired
  fastify.post('/export/cleanup/expired', async (request, reply) => {
    try {
      const cleanedCount = await exportService.cleanupExpiredJobs();
      
      reply.send({
        success: true,
        data: {
          cleaned_count: cleanedCount,
          message: `${cleanedCount} expired export jobs cleaned up`
        }
      });
    } catch (error) {
      logger.error('Failed to cleanup expired jobs:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to cleanup expired jobs'
      });
    }
  });

  // POST /api/export/cleanup/failed
  fastify.post<{
    Body: { olderThanDays?: number };
  }>('/export/cleanup/failed', async (request, reply) => {
    try {
      const { olderThanDays = 7 } = request.body;
      const cleanedCount = await exportService.cleanupFailedJobs(olderThanDays);
      
      reply.send({
        success: true,
        data: {
          cleaned_count: cleanedCount,
          message: `${cleanedCount} failed export jobs cleaned up`
        }
      });
    } catch (error) {
      logger.error('Failed to cleanup failed jobs:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to cleanup failed jobs'
      });
    }
  });

  // WebSocket for real-time export progress
  fastify.register(async function(fastify) {
    if (fastify.websocketServer) {
      fastify.get('/export/jobs/:jobId/progress-stream', { websocket: true }, (connection, req) => {
        const jobId = (req.params as any).jobId;
        
        const sendProgress = async () => {
          try {
            const progress = await exportService.getExportProgress(jobId);
            if (progress) {
              connection.send(JSON.stringify({
                type: 'progress',
                data: progress
              }));
              
              // Stop sending if job is complete
              if (progress.status === 'completed' || progress.status === 'failed' || progress.status === 'cancelled') {
                return;
              }
            }
          } catch (error) {
            connection.send(JSON.stringify({
              type: 'error',
              error: 'Failed to get progress'
            }));
          }
        };

        // Send initial progress
        sendProgress();
        
        // Send progress updates every 2 seconds
        const interval = setInterval(sendProgress, 2000);
        
        connection.on('close', () => {
          clearInterval(interval);
        });
      });
    }
  });
}