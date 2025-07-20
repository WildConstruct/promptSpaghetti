import { Database } from '../database/connection';
import { 
  ExportTemplate, 
  CreateExportTemplate, 
  UpdateExportTemplate,
  ExportJob, 
  CreateExportJob, 
  UpdateExportJob,
  ExportSchedule, 
  CreateExportSchedule, 
  UpdateExportSchedule,
  ExportShare, 
  CreateExportShare, 
  UpdateExportShare,
  ExportAnalytics, 
  CreateExportAnalytics,
  ExportFormatDefinition,
  ExportFormat,
  ExportType,
  ExportJobStatus,
  ExportResult,
  ExportProgress,
  ExportStatistics,
  ExportTemplateWithStats,
  ExportJobWithTemplate,
  ExportScheduleWithStats,
  validateExportOptions,
  CommonExportOptions,
  JsonExportOptions,
  YamlExportOptions,
  XmlExportOptions,
  CsvExportOptions,
  MarkdownExportOptions,
  PdfExportOptions,
  HtmlExportOptions,
  ZipExportOptions,
  DEFAULT_EXPORT_EXPIRATION_HOURS,
  MAX_EXPORT_FILE_SIZE,
  MAX_CONCURRENT_EXPORTS
} from '../../packages/core/types/export';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../utils/logger';

export class ExportService {
  private db: Database;
  private exportDir: string;
  private activeJobs: Map<string, ExportJob> = new Map();

  constructor(db: Database, exportDir: string = 'exports') {
    this.db = db;
    this.exportDir = exportDir;
    this.ensureExportDirectoryExists();
  }

  private async ensureExportDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.exportDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create export directory:', error);
      throw new Error('Export directory initialization failed');
    }
  }

  // Export Template Management
  async createExportTemplate(template: CreateExportTemplate): Promise<ExportTemplate> {
    try {
      logger.info('Creating export template:', { name: template.name, format: template.export_format });

      // Validate format-specific options
      const optionsValidation = validateExportOptions(template.export_format, template.format_options);
      if (!optionsValidation.success) {
        throw new Error(`Invalid format options: ${optionsValidation.error.message}`);
      }

      const query = `
        INSERT INTO export_templates (
          project_id, name, description, export_format, template_type,
          include_metadata, include_attribution, include_history, include_branching,
          include_comments, include_attachments, format_options, filter_options,
          template_content, template_schema, created_by, is_public, is_system_template
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *
      `;

      const result = await this.db.query(query, [
        template.project_id,
        template.name,
        template.description,
        template.export_format,
        template.template_type,
        template.include_metadata,
        template.include_attribution,
        template.include_history,
        template.include_branching,
        template.include_comments,
        template.include_attachments,
        JSON.stringify(template.format_options),
        JSON.stringify(template.filter_options),
        template.template_content,
        template.template_schema ? JSON.stringify(template.template_schema) : null,
        template.created_by,
        template.is_public,
        template.is_system_template
      ]);

      const createdTemplate = result.rows[0];
      logger.info('Export template created successfully:', { id: createdTemplate.id });
      return createdTemplate;
    } catch (error) {
      logger.error('Failed to create export template:', error);
      throw new Error('Export template creation failed');
    }
  }

  async getExportTemplate(id: string): Promise<ExportTemplate | null> {
    try {
      const query = 'SELECT * FROM export_templates WHERE id = $1';
      const result = await this.db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to get export template:', error);
      throw new Error('Export template retrieval failed');
    }
  }

  async getExportTemplates(projectId: string, options: {
    format?: ExportFormat;
    isPublic?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<ExportTemplate[]> {
    try {
      let query = 'SELECT * FROM export_templates WHERE project_id = $1';
      const params: any[] = [projectId];
      let paramIndex = 2;

      if (options.format) {
        query += ` AND export_format = $${paramIndex}`;
        params.push(options.format);
        paramIndex++;
      }

      if (options.isPublic !== undefined) {
        query += ` AND is_public = $${paramIndex}`;
        params.push(options.isPublic);
        paramIndex++;
      }

      query += ' ORDER BY usage_count DESC, created_at DESC';

      if (options.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
        paramIndex++;
      }

      if (options.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(options.offset);
      }

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get export templates:', error);
      throw new Error('Export templates retrieval failed');
    }
  }

  async getExportTemplateWithStats(id: string): Promise<ExportTemplateWithStats | null> {
    try {
      const template = await this.getExportTemplate(id);
      if (!template) return null;

      // Get recent jobs
      const recentJobsQuery = `
        SELECT * FROM export_jobs 
        WHERE template_id = $1 
        ORDER BY started_at DESC 
        LIMIT 10
      `;
      const recentJobsResult = await this.db.query(recentJobsQuery, [id]);

      // Get statistics
      const statsQuery = `
        SELECT 
          AVG(processing_duration) as avg_processing_time,
          COUNT(CASE WHEN status = 'completed' THEN 1 END)::float / COUNT(*)::float * 100 as success_rate
        FROM export_jobs 
        WHERE template_id = $1
      `;
      const statsResult = await this.db.query(statsQuery, [id]);
      const stats = statsResult.rows[0];

      return {
        ...template,
        recent_jobs: recentJobsResult.rows,
        avg_processing_time: stats.avg_processing_time || 0,
        success_rate: stats.success_rate || 0
      };
    } catch (error) {
      logger.error('Failed to get export template with stats:', error);
      throw new Error('Export template with stats retrieval failed');
    }
  }

  async updateExportTemplate(id: string, updates: UpdateExportTemplate): Promise<ExportTemplate | null> {
    try {
      logger.info('Updating export template:', { id, updates });

      // Validate format-specific options if provided
      if (updates.format_options) {
        const template = await this.getExportTemplate(id);
        if (!template) throw new Error('Template not found');

        const format = updates.export_format || template.export_format;
        const optionsValidation = validateExportOptions(format, updates.format_options);
        if (!optionsValidation.success) {
          throw new Error(`Invalid format options: ${optionsValidation.error.message}`);
        }
      }

      const fields = [];
      const values = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = $${paramIndex}`);
          if (key === 'format_options' || key === 'filter_options' || key === 'template_schema') {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
          paramIndex++;
        }
      });

      if (fields.length === 0) {
        return await this.getExportTemplate(id);
      }

      const query = `
        UPDATE export_templates 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      values.push(id);

      const result = await this.db.query(query, values);
      logger.info('Export template updated successfully:', { id });
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to update export template:', error);
      throw new Error('Export template update failed');
    }
  }

  async deleteExportTemplate(id: string): Promise<boolean> {
    try {
      logger.info('Deleting export template:', { id });

      const query = 'DELETE FROM export_templates WHERE id = $1';
      const result = await this.db.query(query, [id]);
      
      const deleted = result.rowCount > 0;
      if (deleted) {
        logger.info('Export template deleted successfully:', { id });
      }
      return deleted;
    } catch (error) {
      logger.error('Failed to delete export template:', error);
      throw new Error('Export template deletion failed');
    }
  }

  // Export Job Management
  async createExportJob(job: CreateExportJob): Promise<ExportJob> {
    try {
      logger.info('Creating export job:', { 
        projectId: job.project_id, 
        format: job.export_format, 
        type: job.export_type 
      });

      // Check concurrent job limits
      const activeJobsQuery = `
        SELECT COUNT(*) as active_count 
        FROM export_jobs 
        WHERE initiated_by = $1 AND status IN ('pending', 'processing')
      `;
      const activeJobsResult = await this.db.query(activeJobsQuery, [job.initiated_by]);
      const activeCount = parseInt(activeJobsResult.rows[0].active_count);

      if (activeCount >= MAX_CONCURRENT_EXPORTS) {
        throw new Error(`Maximum concurrent exports (${MAX_CONCURRENT_EXPORTS}) exceeded`);
      }

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + DEFAULT_EXPORT_EXPIRATION_HOURS);

      const query = `
        INSERT INTO export_jobs (
          project_id, template_id, export_format, export_type, export_scope,
          source_snapshot_id, source_branch_id, comparison_snapshot_id,
          export_options, custom_filters, initiated_by, expires_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        ) RETURNING *
      `;

      const result = await this.db.query(query, [
        job.project_id,
        job.template_id,
        job.export_format,
        job.export_type,
        JSON.stringify(job.export_scope),
        job.source_snapshot_id,
        job.source_branch_id,
        job.comparison_snapshot_id,
        JSON.stringify(job.export_options),
        JSON.stringify(job.custom_filters),
        job.initiated_by,
        expiresAt.toISOString()
      ]);

      const createdJob = result.rows[0];
      this.activeJobs.set(createdJob.id, createdJob);
      
      // Start export processing asynchronously
      this.processExportJob(createdJob.id).catch(error => {
        logger.error('Export job processing failed:', error);
      });

      logger.info('Export job created successfully:', { id: createdJob.id });
      return createdJob;
    } catch (error) {
      logger.error('Failed to create export job:', error);
      throw new Error('Export job creation failed');
    }
  }

  async getExportJob(id: string): Promise<ExportJob | null> {
    try {
      const query = 'SELECT * FROM export_jobs WHERE id = $1';
      const result = await this.db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to get export job:', error);
      throw new Error('Export job retrieval failed');
    }
  }

  async getExportJobs(projectId: string, options: {
    status?: ExportJobStatus;
    format?: ExportFormat;
    userId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ExportJob[]> {
    try {
      let query = 'SELECT * FROM export_jobs WHERE project_id = $1';
      const params: any[] = [projectId];
      let paramIndex = 2;

      if (options.status) {
        query += ` AND status = $${paramIndex}`;
        params.push(options.status);
        paramIndex++;
      }

      if (options.format) {
        query += ` AND export_format = $${paramIndex}`;
        params.push(options.format);
        paramIndex++;
      }

      if (options.userId) {
        query += ` AND initiated_by = $${paramIndex}`;
        params.push(options.userId);
        paramIndex++;
      }

      query += ' ORDER BY started_at DESC';

      if (options.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
        paramIndex++;
      }

      if (options.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(options.offset);
      }

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get export jobs:', error);
      throw new Error('Export jobs retrieval failed');
    }
  }

  async getExportJobWithTemplate(id: string): Promise<ExportJobWithTemplate | null> {
    try {
      const query = `
        SELECT 
          ej.*,
          et.name as template_name,
          et.description as template_description,
          es.share_token,
          es.expires_at as share_expires_at,
          es.is_active as share_is_active
        FROM export_jobs ej
        LEFT JOIN export_templates et ON ej.template_id = et.id
        LEFT JOIN export_shares es ON ej.id = es.export_job_id
        WHERE ej.id = $1
      `;
      const result = await this.db.query(query, [id]);
      const row = result.rows[0];
      
      if (!row) return null;

      const job = {
        id: row.id,
        project_id: row.project_id,
        template_id: row.template_id,
        export_format: row.export_format,
        export_type: row.export_type,
        export_scope: row.export_scope,
        source_snapshot_id: row.source_snapshot_id,
        source_branch_id: row.source_branch_id,
        comparison_snapshot_id: row.comparison_snapshot_id,
        export_options: row.export_options,
        custom_filters: row.custom_filters,
        status: row.status,
        progress_percentage: row.progress_percentage,
        output_file_path: row.output_file_path,
        output_file_size: row.output_file_size,
        output_file_hash: row.output_file_hash,
        download_url: row.download_url,
        expires_at: row.expires_at,
        initiated_by: row.initiated_by,
        started_at: row.started_at,
        completed_at: row.completed_at,
        error_message: row.error_message,
        processing_log: row.processing_log,
        processing_duration: row.processing_duration,
        memory_usage: row.memory_usage,
        cpu_usage: row.cpu_usage,
        template: row.template_name ? {
          id: row.template_id,
          name: row.template_name,
          description: row.template_description
        } : null,
        share: row.share_token ? {
          share_token: row.share_token,
          expires_at: row.share_expires_at,
          is_active: row.share_is_active
        } : null
      };

      return job as ExportJobWithTemplate;
    } catch (error) {
      logger.error('Failed to get export job with template:', error);
      throw new Error('Export job with template retrieval failed');
    }
  }

  async updateExportJob(id: string, updates: UpdateExportJob): Promise<ExportJob | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (fields.length === 0) {
        return await this.getExportJob(id);
      }

      const query = `
        UPDATE export_jobs 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      values.push(id);

      const result = await this.db.query(query, values);
      const updatedJob = result.rows[0];
      
      if (updatedJob) {
        this.activeJobs.set(id, updatedJob);
      }
      
      return updatedJob || null;
    } catch (error) {
      logger.error('Failed to update export job:', error);
      throw new Error('Export job update failed');
    }
  }

  async cancelExportJob(id: string): Promise<boolean> {
    try {
      logger.info('Cancelling export job:', { id });

      const job = await this.getExportJob(id);
      if (!job) return false;

      if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
        return false;
      }

      await this.updateExportJob(id, { 
        status: 'cancelled',
        completed_at: new Date().toISOString()
      });

      this.activeJobs.delete(id);
      logger.info('Export job cancelled successfully:', { id });
      return true;
    } catch (error) {
      logger.error('Failed to cancel export job:', error);
      throw new Error('Export job cancellation failed');
    }
  }

  async getExportProgress(id: string): Promise<ExportProgress | null> {
    try {
      const job = await this.getExportJob(id);
      if (!job) return null;

      const estimatedCompletion = job.status === 'processing' && job.progress_percentage > 0
        ? new Date(Date.now() + (100 - job.progress_percentage) * 1000).toISOString()
        : undefined;

      return {
        job_id: job.id,
        status: job.status,
        progress_percentage: job.progress_percentage,
        current_step: this.getCurrentProcessingStep(job.status, job.progress_percentage),
        estimated_completion: estimatedCompletion,
        processing_log: job.processing_log
      };
    } catch (error) {
      logger.error('Failed to get export progress:', error);
      throw new Error('Export progress retrieval failed');
    }
  }

  private getCurrentProcessingStep(status: ExportJobStatus, progress: number): string {
    if (status === 'pending') return 'Queued for processing';
    if (status === 'processing') {
      if (progress < 20) return 'Preparing data';
      if (progress < 40) return 'Extracting content';
      if (progress < 60) return 'Applying filters';
      if (progress < 80) return 'Formatting output';
      return 'Finalizing export';
    }
    if (status === 'completed') return 'Export completed';
    if (status === 'failed') return 'Export failed';
    if (status === 'cancelled') return 'Export cancelled';
    return 'Unknown status';
  }

  private async processExportJob(jobId: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      await this.updateExportJob(jobId, { 
        status: 'processing',
        progress_percentage: 0
      });

      const job = await this.getExportJob(jobId);
      if (!job) throw new Error('Job not found');

      // Simulate export processing with progress updates
      const steps = [
        { progress: 10, step: 'Preparing data' },
        { progress: 30, step: 'Extracting content' },
        { progress: 50, step: 'Applying filters' },
        { progress: 70, step: 'Formatting output' },
        { progress: 90, step: 'Finalizing export' }
      ];

      for (const step of steps) {
        await this.updateExportJob(jobId, {
          progress_percentage: step.progress,
          processing_log: step.step
        });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
      }

      // Generate output file
      const outputFilePath = await this.generateExportFile(job);
      const fileStats = await fs.stat(outputFilePath);
      const fileHash = await this.calculateFileHash(outputFilePath);

      await this.updateExportJob(jobId, {
        status: 'completed',
        progress_percentage: 100,
        output_file_path: outputFilePath,
        output_file_size: fileStats.size,
        output_file_hash: fileHash,
        download_url: `/api/exports/${jobId}/download`,
        completed_at: new Date().toISOString(),
        processing_duration: Date.now() - startTime
      });

      this.activeJobs.delete(jobId);
      logger.info('Export job completed successfully:', { id: jobId });

    } catch (error) {
      logger.error('Export job processing failed:', { id: jobId, error });
      
      await this.updateExportJob(jobId, {
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString(),
        processing_duration: Date.now() - startTime
      });

      this.activeJobs.delete(jobId);
    }
  }

  private async generateExportFile(job: ExportJob): Promise<string> {
    const fileName = `export_${job.id}.${this.getFileExtension(job.export_format)}`;
    const filePath = path.join(this.exportDir, fileName);
    
    // Mock export data generation
    const exportData = {
      project_id: job.project_id,
      export_type: job.export_type,
      export_format: job.export_format,
      generated_at: new Date().toISOString(),
      data: {
        // Mock data structure
        nodes: [],
        edges: [],
        metadata: {},
        version: '1.0'
      }
    };

    await fs.writeFile(filePath, this.formatExportData(exportData, job.export_format));
    return filePath;
  }

  private getFileExtension(format: ExportFormat): string {
    const extensions = {
      json: 'json',
      yaml: 'yaml',
      xml: 'xml',
      csv: 'csv',
      markdown: 'md',
      pdf: 'pdf',
      html: 'html',
      zip: 'zip'
    };
    return extensions[format] || 'txt';
  }

  private formatExportData(data: any, format: ExportFormat): string {
    switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'yaml':
      // Mock YAML formatting
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n');
    case 'xml':
      return `<?xml version="1.0"?>\n<export>\n${JSON.stringify(data)}\n</export>`;
    case 'csv':
      return 'id,type,format,generated_at\n' + 
               `${data.project_id},${data.export_type},${data.export_format},${data.generated_at}`;
    case 'markdown':
      return `# Export Report\n\n**Project:** ${data.project_id}\n**Type:** ${data.export_type}\n**Format:** ${data.export_format}\n**Generated:** ${data.generated_at}`;
    case 'html':
      return `<!DOCTYPE html><html><head><title>Export</title></head><body><pre>${JSON.stringify(data, null, 2)}</pre></body></html>`;
    default:
      return JSON.stringify(data, null, 2);
    }
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }

  // Export Statistics
  async getExportStatistics(projectId: string): Promise<ExportStatistics> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_exports,
          SUM(output_file_size) as total_size,
          AVG(processing_duration) as avg_processing_time,
          COUNT(CASE WHEN status = 'completed' THEN 1 END)::float / COUNT(*)::float * 100 as success_rate,
          MAX(started_at) as last_export_at
        FROM export_jobs 
        WHERE project_id = $1
      `;
      const result = await this.db.query(query, [projectId]);
      const stats = result.rows[0];

      // Get exports by format
      const formatQuery = `
        SELECT export_format, COUNT(*) as count
        FROM export_jobs 
        WHERE project_id = $1
        GROUP BY export_format
      `;
      const formatResult = await this.db.query(formatQuery, [projectId]);
      const exportsByFormat = formatResult.rows.reduce((acc, row) => {
        acc[row.export_format] = parseInt(row.count);
        return acc;
      }, {} as Record<string, number>);

      // Get exports by type
      const typeQuery = `
        SELECT export_type, COUNT(*) as count
        FROM export_jobs 
        WHERE project_id = $1
        GROUP BY export_type
      `;
      const typeResult = await this.db.query(typeQuery, [projectId]);
      const exportsByType = typeResult.rows.reduce((acc, row) => {
        acc[row.export_type] = parseInt(row.count);
        return acc;
      }, {} as Record<string, number>);

      // Get most used templates
      const templatesQuery = `
        SELECT et.id, et.name, COUNT(ej.id) as usage_count
        FROM export_templates et
        JOIN export_jobs ej ON et.id = ej.template_id
        WHERE et.project_id = $1
        GROUP BY et.id, et.name
        ORDER BY usage_count DESC
        LIMIT 5
      `;
      const templatesResult = await this.db.query(templatesQuery, [projectId]);
      const mostUsedTemplates = templatesResult.rows.map(row => ({
        template_id: row.id,
        template_name: row.name,
        usage_count: parseInt(row.usage_count)
      }));

      return {
        project_id: projectId,
        total_exports: parseInt(stats.total_exports) || 0,
        exports_by_format: exportsByFormat,
        exports_by_type: exportsByType,
        total_size: parseInt(stats.total_size) || 0,
        average_processing_time: parseFloat(stats.avg_processing_time) || 0,
        most_used_templates: mostUsedTemplates,
        success_rate: parseFloat(stats.success_rate) || 0,
        last_export_at: stats.last_export_at
      };
    } catch (error) {
      logger.error('Failed to get export statistics:', error);
      throw new Error('Export statistics retrieval failed');
    }
  }

  // Export Format Definitions
  async getExportFormats(): Promise<ExportFormatDefinition[]> {
    try {
      const query = 'SELECT * FROM export_format_definitions WHERE is_enabled = true ORDER BY format_name';
      const result = await this.db.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get export formats:', error);
      throw new Error('Export formats retrieval failed');
    }
  }

  async getExportFormat(formatName: string): Promise<ExportFormatDefinition | null> {
    try {
      const query = 'SELECT * FROM export_format_definitions WHERE format_name = $1';
      const result = await this.db.query(query, [formatName]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to get export format:', error);
      throw new Error('Export format retrieval failed');
    }
  }

  // Cleanup Methods
  async cleanupExpiredJobs(): Promise<number> {
    try {
      logger.info('Cleaning up expired export jobs');
      
      const query = `
        SELECT id, output_file_path 
        FROM export_jobs 
        WHERE expires_at < CURRENT_TIMESTAMP AND status = 'completed'
      `;
      const result = await this.db.query(query);
      const expiredJobs = result.rows;

      let cleanedCount = 0;
      for (const job of expiredJobs) {
        try {
          // Delete file if it exists
          if (job.output_file_path) {
            await fs.unlink(job.output_file_path).catch(() => {});
          }
          
          // Delete job record
          await this.db.query('DELETE FROM export_jobs WHERE id = $1', [job.id]);
          cleanedCount++;
        } catch (error) {
          logger.error('Failed to cleanup expired job:', { id: job.id, error });
        }
      }

      logger.info('Expired export jobs cleaned up:', { count: cleanedCount });
      return cleanedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired jobs:', error);
      throw new Error('Expired jobs cleanup failed');
    }
  }

  async cleanupFailedJobs(olderThanDays: number = 7): Promise<number> {
    try {
      logger.info('Cleaning up failed export jobs older than', { days: olderThanDays });
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const query = `
        SELECT id, output_file_path 
        FROM export_jobs 
        WHERE status = 'failed' AND started_at < $1
      `;
      const result = await this.db.query(query, [cutoffDate.toISOString()]);
      const failedJobs = result.rows;

      let cleanedCount = 0;
      for (const job of failedJobs) {
        try {
          // Delete file if it exists
          if (job.output_file_path) {
            await fs.unlink(job.output_file_path).catch(() => {});
          }
          
          // Delete job record
          await this.db.query('DELETE FROM export_jobs WHERE id = $1', [job.id]);
          cleanedCount++;
        } catch (error) {
          logger.error('Failed to cleanup failed job:', { id: job.id, error });
        }
      }

      logger.info('Failed export jobs cleaned up:', { count: cleanedCount });
      return cleanedCount;
    } catch (error) {
      logger.error('Failed to cleanup failed jobs:', error);
      throw new Error('Failed jobs cleanup failed');
    }
  }
}