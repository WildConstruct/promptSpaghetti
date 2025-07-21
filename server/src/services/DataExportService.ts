// Data Export Service - Epic 19
// Service for secure data export with compliance controls

import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { DataAccessControlService } from './DataAccessControlService';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-writer';

export interface ExportRequest {
  requestId?: string;
  userId: string;
  exportType: ExportType;
  dataCategories: string[];
  format: ExportFormat;
  filters?: ExportFilters;
  purpose: string;
  requestedBy: string;
  timeRange?: {
    startDate: Date;
    endDate: Date;
  };
  includeMetadata?: boolean;
  anonymize?: boolean;
  encryptOutput?: boolean;
}

export interface ExportFilters {
  classification?: string[];
  resourceIds?: string[];
  operations?: string[];
  userIds?: string[];
  customFilters?: Record<string, any>;
}

export interface ExportJob {
  jobId: string;
  requestId: string;
  userId: string;
  status: ExportJobStatus;
  progress: number;
  startTime: Date;
  endTime?: Date;
  outputPath?: string;
  fileSize?: number;
  recordCount?: number;
  errorMessage?: string;
  metadata: Record<string, any>;
}

export interface ExportManifest {
  exportId: string;
  timestamp: Date;
  requestor: string;
  dataCategories: string[];
  format: ExportFormat;
  totalRecords: number;
  totalSize: number;
  checksum: string;
  classifications: string[];
  retentionPolicy: string;
  anonymized: boolean;
  encrypted: boolean;
}

export enum ExportType {
  USER_DATA = 'USER_DATA',
  ACCESS_LOGS = 'ACCESS_LOGS',
  AUDIT_TRAIL = 'AUDIT_TRAIL',
  SYSTEM_LOGS = 'SYSTEM_LOGS',
  COMPLIANCE_REPORT = 'COMPLIANCE_REPORT',
  SECURITY_EVENTS = 'SECURITY_EVENTS',
  CUSTOM_QUERY = 'CUSTOM_QUERY'
}

export enum ExportFormat {
  JSON = 'JSON',
  CSV = 'CSV',
  XML = 'XML',
  PDF = 'PDF',
  XLSX = 'XLSX'
}

export enum ExportJobStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export class DataExportService {
  private db: DatabaseService;
  private audit: AuditService;
  private accessControl: DataAccessControlService;
  private exportDir: string;

  constructor(
    db: DatabaseService,
    audit: AuditService,
    accessControl: DataAccessControlService,
    exportDir: string = '/tmp/exports'
  ) {
    this.db = db;
    this.audit = audit;
    this.accessControl = accessControl;
    this.exportDir = exportDir;
    this.ensureExportDirectory();
  }

  /**
   * Request data export
   */
  async requestExport(request: ExportRequest): Promise<{ jobId: string; estimatedTime: string }> {
    const requestId = await this.generateRequestId();
    const jobId = await this.generateJobId();

    try {
      // Validate export request
      await this.validateExportRequest(request);

      // Check user permissions for requested data
      await this.validateExportPermissions(request);

      // Create export job
      const job = await this.createExportJob(jobId, requestId, request);

      // Queue job for processing
      await this.queueExportJob(job);

      // Log export request
      await this.audit.logSecurityEvent({
        type: 'DATA_EXPORT_REQUESTED',
        userId: request.userId,
        resourceId: requestId,
        ipAddress: undefined,
        userAgent: undefined,
        success: true,
        metadata: {
          exportType: request.exportType,
          dataCategories: request.dataCategories,
          format: request.format,
          purpose: request.purpose
        }
      });

      const estimatedTime = await this.calculateEstimatedTime(request);

      return {
        jobId,
        estimatedTime
      };

    } catch (error) {
      await this.audit.logSecurityEvent({
        type: 'DATA_EXPORT_REQUEST_ERROR',
        userId: request.userId,
        resourceId: requestId,
        ipAddress: undefined,
        userAgent: undefined,
        success: false,
        metadata: {
          error: error instanceof Error ? error.message : String(error)
        }
      });

      throw error;
    }
  }

  /**
   * Process export job
   */
  async processExportJob(jobId: string): Promise<void> {
    try {
      const job = await this.getExportJob(jobId);
      if (!job) {
        throw new Error('Export job not found');
      }

      await this.updateJobStatus(jobId, ExportJobStatus.PROCESSING, 0);

      // Get the original request
      const request = await this.getExportRequest(job.requestId);
      if (!request) {
        throw new Error('Export request not found');
      }

      // Extract data based on export type
      const data = await this.extractData(request, jobId);

      // Apply filters and transformations
      const processedData = await this.processData(data, request, jobId);

      // Generate output file
      const outputPath = await this.generateOutputFile(processedData, request, jobId);

      // Create manifest
      const manifest = await this.createExportManifest(processedData, request, outputPath);

      // Update job completion
      await this.updateJobCompletion(jobId, outputPath, processedData.length, manifest);

      // Notify requestor
      await this.notifyExportCompletion(job.userId, jobId, outputPath);

      await this.audit.logSecurityEvent({
        type: 'DATA_EXPORT_COMPLETED',
        userId: job.userId,
        resourceId: job.requestId,
        ipAddress: undefined,
        userAgent: undefined,
        success: true,
        metadata: {
          jobId,
          recordCount: processedData.length,
          outputPath
        }
      });

    } catch (error) {
      await this.updateJobStatus(jobId, ExportJobStatus.FAILED, 0, error.message);

      await this.audit.logSecurityEvent({
        type: 'DATA_EXPORT_FAILED',
        userId: undefined,
        resourceId: jobId,
        ipAddress: undefined,
        userAgent: undefined,
        success: false,
        metadata: {
          error: error instanceof Error ? error.message : String(error)
        }
      });

      throw error;
    }
  }

  /**
   * Get export job status
   */
  async getExportJobStatus(jobId: string, userId: string): Promise<ExportJob | null> {
    const result = await this.db.query(`
      SELECT * FROM export_jobs 
      WHERE job_id = $1 AND user_id = $2
    `, [jobId, userId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToExportJob(result.rows[0]);
  }

  /**
   * Get user's export history
   */
  async getUserExportHistory(userId: string, limit: number = 50, offset: number = 0): Promise<ExportJob[]> {
    const result = await this.db.query(`
      SELECT * FROM export_jobs 
      WHERE user_id = $1 
      ORDER BY start_time DESC 
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    return result.rows.map(this.mapToExportJob);
  }

  /**
   * Download export file
   */
  async downloadExport(jobId: string, userId: string): Promise<{
    filePath: string;
    fileName: string;
    contentType: string;
  }> {
    const job = await this.getExportJobStatus(jobId, userId);
    if (!job) {
      throw new Error('Export job not found');
    }

    if (job.status !== ExportJobStatus.COMPLETED) {
      throw new Error('Export job not completed');
    }

    if (!job.outputPath || !fs.existsSync(job.outputPath)) {
      throw new Error('Export file not found');
    }

    // Log download
    await this.audit.logSecurityEvent({
      type: 'DATA_EXPORT_DOWNLOADED',
      userId,
      resourceId: jobId,
      ipAddress: undefined,
      userAgent: undefined,
      success: true,
      metadata: {
        filePath: job.outputPath
      }
    });

    const fileName = path.basename(job.outputPath);
    const contentType = this.getContentType(fileName);

    return {
      filePath: job.outputPath,
      fileName,
      contentType
    };
  }

  /**
   * Cancel export job
   */
  async cancelExportJob(jobId: string, userId: string): Promise<void> {
    const job = await this.getExportJobStatus(jobId, userId);
    if (!job) {
      throw new Error('Export job not found');
    }

    if (job.status !== ExportJobStatus.QUEUED && job.status !== ExportJobStatus.PROCESSING) {
      throw new Error('Cannot cancel completed job');
    }

    await this.updateJobStatus(jobId, ExportJobStatus.CANCELLED, job.progress);

    await this.audit.logSecurityEvent({
      type: 'DATA_EXPORT_CANCELLED',
      userId,
      resourceId: jobId,
      ipAddress: undefined,
      userAgent: undefined,
      success: true,
      metadata: { jobId }
    });
  }

  /**
   * Clean up old export files
   */
  async cleanupOldExports(retentionDays: number = 30): Promise<{ deletedFiles: number; freedSpace: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.db.query(`
      SELECT job_id, output_path, file_size 
      FROM export_jobs 
      WHERE end_time < $1 AND status = $2 AND output_path IS NOT NULL
    `, [cutoffDate, ExportJobStatus.COMPLETED]);

    let deletedFiles = 0;
    let freedSpace = 0;

    for (const job of result.rows) {
      try {
        if (fs.existsSync(job.output_path)) {
          freedSpace += job.file_size || 0;
          fs.unlinkSync(job.output_path);
          deletedFiles++;
        }

        // Update job record to remove file path
        await this.db.query(`
          UPDATE export_jobs 
          SET output_path = NULL, file_size = NULL 
          WHERE job_id = $1
        `, [job.job_id]);

      } catch (error) {
        console.error(`Failed to delete export file ${job.output_path}:`, error);
      }
    }

    await this.audit.logSecurityEvent({
      type: 'EXPORT_CLEANUP_COMPLETED',
      userId: 'system',
      resourceId: undefined,
      ipAddress: undefined,
      userAgent: undefined,
      success: true,
      metadata: {
        deletedFiles,
        freedSpace,
        retentionDays
      }
    });

    return { deletedFiles, freedSpace };
  }

  // Private helper methods

  private async validateExportRequest(request: ExportRequest): Promise<void> {
    if (!request.userId) {
      throw new Error('User ID is required');
    }

    if (!request.dataCategories || request.dataCategories.length === 0) {
      throw new Error('At least one data category must be specified');
    }

    if (!request.purpose || request.purpose.length < 10) {
      throw new Error('Purpose must be specified (minimum 10 characters)');
    }

    if (request.timeRange) {
      if (request.timeRange.startDate >= request.timeRange.endDate) {
        throw new Error('Start date must be before end date');
      }

      const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year
      if (request.timeRange.endDate.getTime() - request.timeRange.startDate.getTime() > maxRange) {
        throw new Error('Time range cannot exceed 1 year');
      }
    }
  }

  private async validateExportPermissions(request: ExportRequest): Promise<void> {
    // Check if user has permission to export each data category
    for (const category of request.dataCategories) {
      const accessCheck = await this.accessControl.checkAccess({
        userId: request.userId,
        resourceId: category,
        resourceType: 'data_category',
        operation: 'EXPORT'
      });

      if (!accessCheck.allowed) {
        throw new Error(`Insufficient permissions to export ${category}: ${accessCheck.reason}`);
      }
    }
  }

  private async extractData(request: ExportRequest, jobId: string): Promise<any[]> {
    let data: any[] = [];

    await this.updateJobStatus(jobId, ExportJobStatus.PROCESSING, 20);

    switch (request.exportType) {
    case ExportType.USER_DATA:
      data = await this.extractUserData(request);
      break;
    case ExportType.ACCESS_LOGS:
      data = await this.extractAccessLogs(request);
      break;
    case ExportType.AUDIT_TRAIL:
      data = await this.extractAuditTrail(request);
      break;
    case ExportType.SYSTEM_LOGS:
      data = await this.extractSystemLogs(request);
      break;
    case ExportType.COMPLIANCE_REPORT:
      data = await this.extractComplianceData(request);
      break;
    case ExportType.SECURITY_EVENTS:
      data = await this.extractSecurityEvents(request);
      break;
    default:
      throw new Error(`Unsupported export type: ${request.exportType}`);
    }

    await this.updateJobStatus(jobId, ExportJobStatus.PROCESSING, 60);
    return data;
  }

  private async processData(data: any[], request: ExportRequest, jobId: string): Promise<any[]> {
    let processedData = [...data];

    // Apply filters
    if (request.filters) {
      processedData = await this.applyFilters(processedData, request.filters);
    }

    await this.updateJobStatus(jobId, ExportJobStatus.PROCESSING, 80);

    // Anonymize if requested
    if (request.anonymize) {
      processedData = await this.anonymizeData(processedData, request.dataCategories);
    }

    // Remove sensitive fields based on classification
    processedData = await this.sanitizeData(processedData);

    await this.updateJobStatus(jobId, ExportJobStatus.PROCESSING, 90);

    return processedData;
  }

  private async generateOutputFile(data: any[], request: ExportRequest, jobId: string): Promise<string> {
    const fileName = `export_${jobId}_${Date.now()}.${request.format.toLowerCase()}`;
    const filePath = path.join(this.exportDir, fileName);

    switch (request.format) {
    case ExportFormat.JSON:
      await this.writeJsonFile(filePath, data);
      break;
    case ExportFormat.CSV:
      await this.writeCsvFile(filePath, data);
      break;
    case ExportFormat.XML:
      await this.writeXmlFile(filePath, data);
      break;
    default:
      throw new Error(`Unsupported format: ${request.format}`);
    }

    if (request.encryptOutput) {
      const encryptedPath = await this.encryptFile(filePath);
      fs.unlinkSync(filePath); // Remove unencrypted file
      return encryptedPath;
    }

    return filePath;
  }

  private async createExportManifest(data: any[], request: ExportRequest, outputPath: string): Promise<ExportManifest> {
    const stats = fs.statSync(outputPath);
    const checksum = await this.calculateChecksum(outputPath);

    return {
      exportId: path.basename(outputPath, path.extname(outputPath)),
      timestamp: new Date(),
      requestor: request.requestedBy,
      dataCategories: request.dataCategories,
      format: request.format,
      totalRecords: data.length,
      totalSize: stats.size,
      checksum,
      classifications: await this.getDataClassifications(data),
      retentionPolicy: 'Delete after 30 days',
      anonymized: request.anonymize || false,
      encrypted: request.encryptOutput || false
    };
  }

  // Additional helper methods would be implemented here...
  private ensureExportDirectory(): void {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  private async generateRequestId(): Promise<string> {
    return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateJobId(): Promise<string> {
    return `JOB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapToExportJob(row: any): ExportJob {
    return {
      jobId: row.job_id,
      requestId: row.request_id,
      userId: row.user_id,
      status: row.status,
      progress: row.progress,
      startTime: row.start_time,
      endTime: row.end_time,
      outputPath: row.output_path,
      fileSize: row.file_size,
      recordCount: row.record_count,
      errorMessage: row.error_message,
      metadata: JSON.parse(row.metadata || '{}')
    };
  }

  private getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
    case '.json': return 'application/json';
    case '.csv': return 'text/csv';
    case '.xml': return 'application/xml';
    case '.pdf': return 'application/pdf';
    case '.xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default: return 'application/octet-stream';
    }
  }

  // Placeholder methods for data extraction - would be implemented based on specific requirements
  private async extractUserData(request: ExportRequest): Promise<any[]> { return []; }
  private async extractAccessLogs(request: ExportRequest): Promise<any[]> { return []; }
  private async extractAuditTrail(request: ExportRequest): Promise<any[]> { return []; }
  private async extractSystemLogs(request: ExportRequest): Promise<any[]> { return []; }
  private async extractComplianceData(request: ExportRequest): Promise<any[]> { return []; }
  private async extractSecurityEvents(request: ExportRequest): Promise<any[]> { return []; }
  private async applyFilters(data: any[], filters: ExportFilters): Promise<any[]> { return data; }
  private async anonymizeData(data: any[], categories: string[]): Promise<any[]> { return data; }
  private async sanitizeData(data: any[]): Promise<any[]> { return data; }
  private async writeJsonFile(filePath: string, data: any[]): Promise<void> { }
  private async writeCsvFile(filePath: string, data: any[]): Promise<void> { }
  private async writeXmlFile(filePath: string, data: any[]): Promise<void> { }
  private async encryptFile(filePath: string): Promise<string> { return filePath; }
  private async calculateChecksum(filePath: string): Promise<string> { return ''; }
  private async getDataClassifications(data: any[]): Promise<string[]> { return []; }
  private async createExportJob(jobId: string, requestId: string, request: ExportRequest): Promise<ExportJob> { return {} as ExportJob; }
  private async queueExportJob(job: ExportJob): Promise<void> { }
  private async calculateEstimatedTime(request: ExportRequest): Promise<string> { return '5-10 minutes'; }
  private async getExportJob(jobId: string): Promise<ExportJob | null> { return null; }
  private async getExportRequest(requestId: string): Promise<ExportRequest | null> { return null; }
  private async updateJobStatus(jobId: string, status: ExportJobStatus, progress: number, errorMessage?: string): Promise<void> { }
  private async updateJobCompletion(jobId: string, outputPath: string, recordCount: number, manifest: ExportManifest): Promise<void> { }
  private async notifyExportCompletion(userId: string, jobId: string, outputPath: string): Promise<void> { }
}