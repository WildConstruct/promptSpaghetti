/**
 * Report Export API Routes
 * 
 * RESTful API endpoints for report export functionality including
 * on-demand exports, scheduled exports, and export management.
 * 
 * Task: T-1752989143998-788 - Add report export options
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  ReportExportService, 
  ExportFormat, 
  DeliveryMethod, 
  ReportData, 
  ExportConfig, 
  ScheduledExport 
} from '../services/ReportExportService';

// Initialize the export service
const exportService = new ReportExportService('./exports');

/**
 * Request/Response schemas
 */
}
}
interface ExportRequestBody {
  reportData: ReportData;
  config: ExportConfig;
}
}
}

}
}
interface ScheduleExportBody {
  name: string;
  description: string;
  reportQuery: string;
  exportConfig: ExportConfig;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    cron?: string;
}
}
  };
  enabled?: boolean;
}

}
}
interface BulkExportBody {
  reports: Array<{
    name: string;
    reportData: ReportData;
    config: ExportConfig;
}
}
  }>;
  options?: {
    parallel?: boolean;
    maxConcurrency?: number;
    failFast?: boolean;
  };
}

/**
 * Register report export routes
 */
export async function registerReportExportRoutes(fastify: FastifyInstance) {
  
  /**
   * Export a report immediately
   */
  fastify.post<{
    Body: ExportRequestBody;
  }>('/api/reports/export', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { reportData, config } = request.body as ExportRequestBody;
      
      // Validate required fields
      if (!reportData || !config) {
        return reply.code(400).send({
          success: false,
          error: 'reportData and config are required'
        });
      }

      // Add user context to metadata
      reportData.metadata.generatedBy = (request.user as any)?.email || 'anonymous';

      const result = await exportService.exportReport(reportData, config);
      
      return reply.code(200).send({
        success: true,
        data: result
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      });
    }
  });

  /**
   * Bulk export multiple reports
   */
  fastify.post<{
    Body: BulkExportBody;
  }>('/api/reports/bulk-export', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { reports, options = {} } = request.body as BulkExportBody;
      
      if (!reports || !Array.isArray(reports) || reports.length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'reports array is required and must not be empty'
        });
      }

      const results: any[] = [];
      const errors: any[] = [];
      const userEmail = (request.user as any)?.email || 'anonymous';

      if (options.parallel !== false && reports.length > 1) {
        // Parallel execution with concurrency limit
        const maxConcurrency = Math.min(options.maxConcurrency || 5, reports.length);
        const chunks = [];
        
        for (let i = 0; i < reports.length; i += maxConcurrency) {
          chunks.push(reports.slice(i, i + maxConcurrency));
        }

        for (const chunk of chunks) {
          const chunkPromises = chunk.map(async (report) => {
            try {
              report.reportData.metadata.generatedBy = userEmail;
              const result = await exportService.exportReport(report.reportData, report.config);
              return { name: report.name, result, success: true };
            } catch (error) {
              const errorResult = {
                name: report.name,
                error: error instanceof Error ? error.message : 'Export failed',
                success: false
              };
              
              if (options.failFast) {
                throw errorResult;
              }
              
              return errorResult;
            }
          });

          const chunkResults = await Promise.allSettled(chunkPromises);
          
          chunkResults.forEach((result) => {
            if (result.status === 'fulfilled') {
              if (result.value.success) {
                results.push(result.value);
              } else {
                errors.push(result.value);
              }
            } else {
              errors.push({
                error: result.reason,
                success: false
              });
            }
          });
        }
      } else {
        // Sequential execution
        for (const report of reports) {
          try {
            report.reportData.metadata.generatedBy = userEmail;
            const result = await exportService.exportReport(report.reportData, report.config);
            results.push({ name: report.name, result, success: true });
          } catch (error) {
            const errorResult = {
              name: report.name,
              error: error instanceof Error ? error.message : 'Export failed',
              success: false
            };
            errors.push(errorResult);
            
            if (options.failFast) {
              break;
            }
          }
        }
      }

      return reply.code(200).send({
        success: errors.length === 0,
        data: {
          successfulExports: results.length,
          failedExports: errors.length,
          totalExports: reports.length,
          results,
          errors: errors.length > 0 ? errors : undefined
        }
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Bulk export failed'
      });
    }
  });

  /**
   * Schedule a recurring export
   */
  fastify.post<{
    Body: ScheduleExportBody;
  }>('/api/reports/schedule', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const scheduleData = request.body as ScheduleExportBody;
      
      const scheduledExport: ScheduledExport = {
        id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: scheduleData.name,
        description: scheduleData.description,
        reportQuery: scheduleData.reportQuery,
        exportConfig: scheduleData.exportConfig,
        schedule: scheduleData.schedule,
        enabled: scheduleData.enabled !== false,
        createdBy: (request.user as any)?.email || 'anonymous'
      };

      exportService.scheduleExport(scheduledExport);
      
      return reply.code(201).send({
        success: true,
        data: scheduledExport
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule export'
      });
    }
  });

  /**
   * Get all scheduled exports
   */
  fastify.get('/api/reports/schedules', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const scheduledExports = exportService.getScheduledExports();
      
      return reply.code(200).send({
        success: true,
        data: scheduledExports
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get scheduled exports'
      });
    }
  });

  /**
   * Cancel a scheduled export
   */
  fastify.delete<{
    Params: { scheduleId: string };
  }>('/api/reports/schedules/:scheduleId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { scheduleId } = request.params as { scheduleId: string };
      
      const cancelled = exportService.cancelScheduledExport(scheduleId);
      
      if (!cancelled) {
        return reply.code(404).send({
          success: false,
          error: 'Scheduled export not found'
        });
      }
      
      return reply.code(200).send({
        success: true,
        message: 'Scheduled export cancelled'
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel scheduled export'
      });
    }
  });

  /**
   * Get export history
   */
  fastify.get<{
    Querystring: { limit?: number; format?: string; delivery?: string };
  }>('/api/reports/history', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { limit = 50, format, delivery } = request.query as any;
      
      let history = exportService.getExportHistory(Math.min(limit, 1000));
      
      // Filter by format if specified
      if (format && Object.values(ExportFormat).includes(format as ExportFormat)) {
        history = history.filter(h => h.format === format);
      }
      
      // Filter by delivery method if specified
      if (delivery && Object.values(DeliveryMethod).includes(delivery as DeliveryMethod)) {
        history = history.filter(h => h.delivery === delivery);
      }
      
      return reply.code(200).send({
        success: true,
        data: history
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get export history'
      });
    }
  });

  /**
   * Get export statistics
   */
  fastify.get('/api/reports/statistics', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = exportService.getExportStatistics();
      
      return reply.code(200).send({
        success: true,
        data: stats
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get export statistics'
      });
    }
  });

  /**
   * Download exported report
   */
  fastify.get<{
    Params: { exportId: string };
  }>('/api/reports/download/:exportId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { exportId } = request.params as { exportId: string };
      
      // In a real implementation, you would:
      // 1. Verify the export exists and user has access
      // 2. Get the file path from the export record
      // 3. Stream the file to the response
      
      // Mock implementation
      return reply.code(200).send({
        success: true,
        message: 'File download would be initiated here',
        exportId
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Download failed'
      });
    }
  });

  /**
   * Get available export formats and delivery methods
   */
  fastify.get('/api/reports/options', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return reply.code(200).send({
        success: true,
        data: {
          formats: Object.values(ExportFormat),
          deliveryMethods: Object.values(DeliveryMethod),
          supportedFeatures: {
            compression: true,
            encryption: true,
            scheduling: true,
            bulkExport: true,
            customStyling: true,
            charts: false, // Would be true with proper chart library
            email: true,
            webhooks: true
          }
        }
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get export options'
      });
    }
  });

  /**
   * Test export with sample data
   */
  fastify.post<{
    Body: { format: ExportFormat; delivery?: DeliveryMethod };
  }>('/api/reports/test-export', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { format, delivery = DeliveryMethod.FILE } = request.body as any;
      
      // Create sample report data
      const sampleData: ReportData = {
        metadata: {
          title: 'Sample Export Test Report',
          description: 'This is a test report generated to demonstrate export functionality',
          generatedAt: new Date(),
          generatedBy: (request.user as any)?.email || 'test-user',
          version: '1.0.0'
  }
        summary: {
          totalRecords: 100,
          averageValue: 75.5,
          successRate: 95.2,
          errorCount: 5
  }
        data: [
          { id: 1, name: 'Sample Item 1', value: 100, category: 'A', status: 'active' },
          { id: 2, name: 'Sample Item 2', value: 75, category: 'B', status: 'inactive' },
          { id: 3, name: 'Sample Item 3', value: 50, category: 'A', status: 'active' },
          { id: 4, name: 'Sample Item 4', value: 125, category: 'C', status: 'active' },
          { id: 5, name: 'Sample Item 5', value: 90, category: 'B', status: 'inactive' }
        ]
      };

      const exportConfig: ExportConfig = {
        format,
        delivery,
        filename: `test-export-${format}-${Date.now()}.${format}`,
        options: {
          includeCharts: false,
          includeRawData: true,
          compression: false
        }
      };

      const result = await exportService.exportReport(sampleData, exportConfig);
      
      return reply.code(200).send({
        success: true,
        message: 'Test export completed successfully',
        data: result
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Test export failed'
      });
    }
  });

  /**
   * Preview report before export
   */
  fastify.post<{
    Body: { reportData: ReportData; format: ExportFormat };
  }>('/api/reports/preview', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { reportData, format } = request.body as any;
      
      if (!reportData) {
        return reply.code(400).send({
          success: false,
          error: 'reportData is required'
        });
      }

      // Generate preview based on format
      let preview: string;
      const mockExportService = new ReportExportService('./temp-preview');
      
      switch (format) {
      case ExportFormat.HTML:
        preview = (mockExportService as any).exportToHTML(reportData, { format, delivery: DeliveryMethod.FILE });
        break;
      case ExportFormat.CSV:
        preview = (mockExportService as any).exportToCSV(reportData, { format, delivery: DeliveryMethod.FILE });
        break;
      case ExportFormat.JSON:
        preview = (mockExportService as any).exportToJSON(reportData, { format, delivery: DeliveryMethod.FILE });
        break;
      case ExportFormat.XML:
        preview = (mockExportService as any).exportToXML(reportData, { format, delivery: DeliveryMethod.FILE });
        break;
      default:
        preview = 'Preview not available for this format';
      }
      
      return reply.code(200).send({
        success: true,
        data: {
          format,
          preview: preview.substring(0, 5000), // Limit preview size
          metadata: {
            recordCount: reportData.data?.length || 0,
            estimatedSize: Buffer.byteLength(preview),
            previewTruncated: preview.length > 5000
          }
        }
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Preview generation failed'
      });
    }
  });

  // Set up event listeners for export service
  exportService.on('export_started', (data) => {
    console.log(`Export started: ${data.id} (${data.format}/${data.delivery})`);
  });

  exportService.on('export_completed', (result) => {
    console.log(`Export completed: ${result.id} - ${result.filename} (${result.size} bytes)`);
  });

  exportService.on('export_failed', (result) => {
    console.error(`Export failed: ${result.id} - ${result.error}`);
  });

  exportService.on('scheduled_export_completed', (data) => {
    console.log(`Scheduled export completed: ${data.scheduledExport.name}`);
  });

  exportService.on('scheduled_export_failed', (data) => {
    console.error(`Scheduled export failed: ${data.scheduledExport.name} - ${data.error?.message}`);
  });

  console.log('Report export routes registered successfully');
}