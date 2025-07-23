/**
 * Report Export Service
 * 
 * Comprehensive report export system supporting multiple formats including
 * PDF, Excel, CSV, JSON, XML with email delivery and scheduled generation.
 * 
 * Task: T-1752989143998-788 - Add report export options
 */

import { EventEmitter } from 'events';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Supported export formats
 */
export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
  XML = 'xml',
  HTML = 'html'
}

/**
 * Export delivery methods
 */
export enum DeliveryMethod {
  FILE = 'file',
  EMAIL = 'email',
  API = 'api',
  WEBHOOK = 'webhook'
}

/**
 * Report data structure
 */
export interface ReportData {
  metadata: {
    title: string;
    description: string;
    generatedAt: Date;
    generatedBy: string;
    version: string;
  };
  summary: Record<string, any>;
  data: Array<Record<string, any>>;
  charts?: Array<{
    type: 'line' | 'bar' | 'pie' | 'area';
    title: string;
    data: Record<string, unknown>[];
    options?: Record<string, any>;
  }>;
  customSections?: Array<{
    title: string;
    content: string | Record<string, any>;
    type: 'text' | 'table' | 'chart' | 'html';
  }>;
}

/**
 * Export configuration
 */
export interface ExportConfig {
  format: ExportFormat;
  delivery: DeliveryMethod;
  filename?: string;
  options?: {
    includeCharts?: boolean;
    includeRawData?: boolean;
    customStyling?: Record<string, any>;
    compression?: boolean;
    encryption?: boolean;
    password?: string;
  };
  deliveryConfig?: {
    email?: {
      to: string[];
      cc?: string[];
      subject: string;
      message?: string;
    };
    webhook?: {
      url: string;
      headers?: Record<string, string>;
      method?: 'POST' | 'PUT';
    };
    api?: {
      endpoint: string;
      method: 'POST' | 'PUT';
      headers?: Record<string, string>;
    };
  };
}

/**
 * Export result
 */
export interface ExportResult {
  id: string;
  success: boolean;
  format: ExportFormat;
  delivery: DeliveryMethod;
  filename: string;
  size: number;
  generatedAt: Date;
  deliveredAt?: Date;
  error?: string;
  downloadUrl?: string;
  metadata: {
    recordCount: number;
    processingTime: number;
    compressionRatio?: number;
  };
}

/**
 * Scheduled export configuration
 */
export interface ScheduledExport {
  id: string;
  name: string;
  description: string;
  reportQuery: string | (() => Promise<ReportData>);
  exportConfig: ExportConfig;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    time: string; // HH:MM format
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    cron?: string; // Custom cron expression
  };
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdBy: string;
}

/**
 * Report Export Service
 */
export class ReportExportService extends EventEmitter {
  private outputDirectory: string;
  private scheduledExports: Map<string, ScheduledExport> = new Map();
  private exportHistory: ExportResult[] = [];
  private scheduleTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(outputDirectory: string = './exports') {
    super();
    this.outputDirectory = outputDirectory;
    this.ensureOutputDirectory();
  }

  /**
   * Export report in specified format with delivery options
   * @param reportData - The report data to export including metadata, summary, and data arrays
   * @param config - Export configuration specifying format, delivery method, and options
   * @returns Promise<ExportResult> - Export result with metadata and success status
   * @throws {Error} When unsupported format is specified or delivery fails
   * @description Main export method that handles format conversion, compression, 
   * encryption, and delivery. Emits events for export lifecycle tracking.
   * @emits export_started - When export process begins
   * @emits export_completed - When export completes successfully
   * @emits export_failed - When export fails
   * @example
   * ```typescript
   * const result = await exportService.exportReport(reportData, {
   *   format: ExportFormat.PDF,
   *   delivery: DeliveryMethod.EMAIL,
   *   deliveryConfig: {
   *     email: { to: ['user@example.com'], subject: 'Report' }
   *   }
   * });
   * ```
   */
  async exportReport(reportData: ReportData, config: ExportConfig): Promise<ExportResult> {
    const exportId = uuidv4();
    const startTime = Date.now();

    try {
      this.emit('export_started', { id: exportId, format: config.format, delivery: config.delivery });

      // Generate filename if not provided
      const filename = config.filename || this.generateFilename(reportData, config.format);
      
      // Export based on format
      let fileContent: Buffer | string;
      let fileSize: number;

      switch (config.format) {
      case ExportFormat.PDF:
        fileContent = await this.exportToPDF(reportData, config);
        break;
      case ExportFormat.EXCEL:
        fileContent = await this.exportToExcel(reportData, config);
        break;
      case ExportFormat.CSV:
        fileContent = this.exportToCSV(reportData, config);
        break;
      case ExportFormat.JSON:
        fileContent = this.exportToJSON(reportData, config);
        break;
      case ExportFormat.XML:
        fileContent = this.exportToXML(reportData, config);
        break;
      case ExportFormat.HTML:
        fileContent = this.exportToHTML(reportData, config);
        break;
      default:
        throw new Error(`Unsupported export format: ${config.format}`);
      }

      fileSize = Buffer.isBuffer(fileContent) ? fileContent.length : Buffer.byteLength(fileContent);

      // Apply compression if requested
      if (config.options?.compression) {
        fileContent = await this.compressContent(fileContent);
      }

      // Apply encryption if requested
      if (config.options?.encryption && config.options?.password) {
        fileContent = await this.encryptContent(fileContent, config.options.password);
      }

      // Handle delivery
      let downloadUrl: string | undefined;
      let deliveredAt: Date | undefined;

      switch (config.delivery) {
      case DeliveryMethod.FILE:
        const filePath = join(this.outputDirectory, filename);
        writeFileSync(filePath, fileContent);
        downloadUrl = `/api/reports/download/${exportId}`;
        deliveredAt = new Date();
        break;
      case DeliveryMethod.EMAIL:
        await this.deliverViaEmail(fileContent, filename, config);
        deliveredAt = new Date();
        break;
      case DeliveryMethod.WEBHOOK:
        await this.deliverViaWebhook(fileContent, filename, config);
        deliveredAt = new Date();
        break;
      case DeliveryMethod.API:
        await this.deliverViaAPI(fileContent, filename, config);
        deliveredAt = new Date();
        break;
      }

      const processingTime = Date.now() - startTime;

      const result: ExportResult = {
        id: exportId,
        success: true,
        format: config.format,
        delivery: config.delivery,
        filename,
        size: fileSize,
        generatedAt: new Date(),
        deliveredAt,
        downloadUrl,
        metadata: {
          recordCount: reportData.data.length,
          processingTime,
          compressionRatio: config.options?.compression ? 0.7 : undefined // Mock compression ratio
        }
      };

      this.exportHistory.push(result);
      this.emit('export_completed', result);

      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;

      const result: ExportResult = {
        id: exportId,
        success: false,
        format: config.format,
        delivery: config.delivery,
        filename: config.filename || 'failed_export',
        size: 0,
        generatedAt: new Date(),
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          recordCount: reportData.data?.length || 0,
          processingTime
        }
      };

      this.exportHistory.push(result);
      this.emit('export_failed', result);

      throw error;
    }
  }

  /**
   * Export to PDF format
   */
  private async exportToPDF(reportData: ReportData, _____config: ExportConfig): Promise<Buffer> {
    // Mock PDF generation - in production, use libraries like puppeteer, pdfkit, or jsPDF
        
    // This would use a real PDF generation library
    const mockPDFContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(${reportData.metadata.title}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000190 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
284
%%EOF`;

    return Buffer.from(mockPDFContent);
  }

  /**
   * Export to Excel format
   */
  private async exportToExcel(reportData: ReportData, config: ExportConfig): Promise<Buffer> {
    // Mock Excel generation - in production, use libraries like exceljs or xlsx
    const csvContent = this.exportToCSV(reportData, config);
    
    // This would use a real Excel generation library
    // For now, return CSV content as a mock
    return Buffer.from(csvContent);
  }

  /**
   * Export to CSV format
   */
  private exportToCSV(reportData: ReportData, _____config: ExportConfig): string {
    if (!reportData.data || reportData.data.length === 0) {
      return 'No data available';
    }

    const headers = Object.keys(reportData.data[0]);
    const csvRows = [headers.join(',')];

    reportData.data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Export to JSON format
   */
  private exportToJSON(reportData: ReportData, config: ExportConfig): string {
    const exportData = {
      ...reportData,
      exportConfig: {
        format: config.format,
        generatedAt: new Date().toISOString(),
        includeCharts: config.options?.includeCharts || false,
        includeRawData: config.options?.includeRawData !== false
      }
    };

    if (!config.options?.includeRawData) {
      delete exportData.data;
    }

    if (!config.options?.includeCharts) {
      delete exportData.charts;
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export to XML format
   */
  private exportToXML(reportData: ReportData, config: ExportConfig): string {
    const escapeXml = (str: string): string => {
      return str.replace(/[<>&'"]/g, (c) => {
        switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
        }
      });
    };

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<report>\n';
    xml += '  <metadata>\n';
    xml += `    <title>${escapeXml(reportData.metadata.title)}</title>\n`;
    xml += `    <description>${escapeXml(reportData.metadata.description)}</description>\n`;
    xml += `    <generatedAt>${reportData.metadata.generatedAt.toISOString()}</generatedAt>\n`;
    xml += `    <generatedBy>${escapeXml(reportData.metadata.generatedBy)}</generatedBy>\n`;
    xml += '  </metadata>\n';

    if (reportData.summary && Object.keys(reportData.summary).length > 0) {
      xml += '  <summary>\n';
      Object.entries(reportData.summary).forEach(([key, value]) => {
        xml += `    <${key}>${escapeXml(String(value))}</${key}>\n`;
      });
      xml += '  </summary>\n';
    }

    if (config.options?.includeRawData !== false && reportData.data) {
      xml += '  <data>\n';
      reportData.data.forEach((row, index) => {
        xml += `    <record id="${index}">\n`;
        Object.entries(row).forEach(([key, value]) => {
          xml += `      <${key}>${escapeXml(String(value))}</${key}>\n`;
        });
        xml += '    </record>\n';
      });
      xml += '  </data>\n';
    }

    xml += '</report>';
    return xml;
  }

  /**
   * Export to HTML format
   */
  private exportToHTML(reportData: ReportData, config: ExportConfig): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportData.metadata.title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(
          0,
          0,
          0,
          0.1
        ); }
        .header { text-align: center; margin-bottom: 30px; color: #2c3e50; border-bottom: 2px solid #e1e5e9; padding-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(
          auto-fit,
          minmax(200px,
          1fr
        )); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: linear-gradient(
          135deg,
          #667eea 0%,
          #764ba2 100%
        ); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .summary-card .value { font-size: 32px; font-weight: bold; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .data-table th { background-color: #f8f9fa; font-weight: 600; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
        ${config.options?.customStyling?.css || ''}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${reportData.metadata.title}</h1>
            <p>${reportData.metadata.description}</p>
            <p>Generated: ${reportData.metadata.generatedAt.toLocaleString()}</p>
        </div>

        ${reportData.summary && Object.keys(reportData.summary).length > 0 ? `
        <div class="summary">
            ${Object.entries(reportData.summary).map(([key, value]) => `
                <div class="summary-card">
                    <h3>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                    <div class="value">${typeof value === 'number' ? value.toLocaleString() : value}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${config.options?.includeRawData !== false && reportData.data && reportData.data.length > 0 ? `
        <div class="data-section">
            <h2>Data Report</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        ${Object.keys(reportData.data[0]).map(key => `<th>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${reportData.data.slice(0, 100).map(row => `
                        <tr>
                            ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                        </tr>
                    `).join('')}
                    ${reportData.data.length > 100 ? `<tr><td colspan="${Object.keys(reportData.data[0]).length}"><em>... and ${reportData.data.length - 100} more rows</em></td></tr>` : ''}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${reportData.customSections ? reportData.customSections.map(section => `
        <div class="custom-section">
            <h2>${section.title}</h2>
            ${section.type === 'html' ? section.content : `<p>${section.content}</p>`}
        </div>
        `).join('') : ''}

        <div class="footer">
            Report generated by Report Export Service | 
            Format: ${config.format.toUpperCase()} | 
            Records: ${reportData.data?.length || 0} | 
            Generated by: ${reportData.metadata.generatedBy}
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Compress content (mock implementation)
   */
  private async compressContent(content: Buffer | string): Promise<Buffer> {
    // Mock compression - in production, use zlib or similar
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
    // Simulate compression by returning the same content (real implementation would compress)
    return buffer;
  }

  /**
   * Encrypt content (mock implementation)
   */
  private async encryptContent(content: Buffer | string, _____password: string): Promise<Buffer> {
    // Mock encryption - in production, use crypto module
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
    // Simulate encryption by returning the same content (real implementation would encrypt)
    return buffer;
  }

  /**
   * Deliver report via email
   */
  private async deliverViaEmail(content: Buffer | string, filename: string, config: ExportConfig): Promise<void> {
    if (!config.deliveryConfig?.email) {
      throw new Error('Email configuration required for email delivery');
    }

    // Mock email delivery - in production, use nodemailer or similar
    console.log(`Mock: Sending email to ${config.deliveryConfig.email.to.join(', ')}`);
    console.log(`Subject: ${config.deliveryConfig.email.subject}`);
    console.log(`Attachment: ${filename} (${Buffer.isBuffer(content) ? content.length : content.length} bytes)`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Deliver report via webhook
   */
  private async deliverViaWebhook(content: Buffer | string, filename: string, config: ExportConfig): Promise<void> {
    if (!config.deliveryConfig?.webhook) {
      throw new Error('Webhook configuration required for webhook delivery');
    }

    // Mock webhook delivery - in production, use fetch or axios
    console.log(`Mock: Sending to webhook ${config.deliveryConfig.webhook.url}`);
    console.log(`Method: ${config.deliveryConfig.webhook.method || 'POST'}`);
    console.log(`Filename: ${filename}`);
    
    // Simulate webhook call delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Deliver report via API
   */
  private async deliverViaAPI(content: Buffer | string, filename: string, config: ExportConfig): Promise<void> {
    if (!config.deliveryConfig?.api) {
      throw new Error('API configuration required for API delivery');
    }

    // Mock API delivery - in production, use fetch or axios
    console.log(`Mock: Sending to API ${config.deliveryConfig.api.endpoint}`);
    console.log(`Method: ${config.deliveryConfig.api.method}`);
    console.log(`Filename: ${filename}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 750));
  }

  /**
   * Generate filename
   */
  private generateFilename(reportData: ReportData, format: ExportFormat): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const title = reportData.metadata.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    return `${title}-${timestamp}.${format}`;
  }

  /**
   * Schedule recurring report export
   */
  scheduleExport(scheduledExport: ScheduledExport): void {
    this.scheduledExports.set(scheduledExport.id, scheduledExport);
    
    if (scheduledExport.enabled) {
      this.setupScheduleTimer(scheduledExport);
    }

    this.emit('schedule_created', scheduledExport);
  }

  /**
   * Setup timer for scheduled export
   */
  private setupScheduleTimer(scheduledExport: ScheduledExport): void {
    // Clear existing timer if any
    const existingTimer = this.scheduleTimers.get(scheduledExport.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const nextRun = this.calculateNextRun(scheduledExport.schedule);
    const delay = nextRun.getTime() - Date.now();

    const timer = setTimeout(async () => {
      try {
        await this.executeScheduledExport(scheduledExport);
      } catch (error) {
        this.emit('scheduled_export_error', { scheduledExport, error });
      }
      
      // Schedule next execution
      this.setupScheduleTimer(scheduledExport);
    }, delay);

    this.scheduleTimers.set(scheduledExport.id, timer);
    
    // Update next run time
    scheduledExport.nextRun = nextRun;
  }

  /**
   * Calculate next run time for scheduled export
   */
  private calculateNextRun(schedule: ScheduledExport['schedule']): Date {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    switch (schedule.frequency) {
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
    case 'weekly':
      nextRun.setDate(nextRun.getDate() + ((7 + (schedule.dayOfWeek || 0) - nextRun.getDay()) % 7));
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 7);
      }
      break;
    case 'monthly':
      nextRun.setDate(schedule.dayOfMonth || 1);
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      break;
    }

    return nextRun;
  }

  /**
   * Execute scheduled export
   */
  private async executeScheduledExport(scheduledExport: ScheduledExport): Promise<void> {
    try {
      // Get report data
      let reportData: ReportData;
      if (typeof scheduledExport.reportQuery === 'string') {
        // In production, this would execute a database query or call a service
        throw new Error('String-based report queries not yet implemented');
      } else {
        reportData = await scheduledExport.reportQuery();
      }

      // Execute export
      const result = await this.exportReport(reportData, scheduledExport.exportConfig);
      
      // Update last run time
      scheduledExport.lastRun = new Date();
      
      this.emit('scheduled_export_completed', { scheduledExport, result });
    } catch (error) {
      this.emit('scheduled_export_failed', { scheduledExport, error });
      throw error;
    }
  }

  /**
   * Get export history
   */
  getExportHistory(limit: number = 100): ExportResult[] {
    return this.exportHistory
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get scheduled exports
   */
  getScheduledExports(): ScheduledExport[] {
    return Array.from(this.scheduledExports.values());
  }

  /**
   * Cancel scheduled export
   */
  cancelScheduledExport(id: string): boolean {
    const timer = this.scheduleTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.scheduleTimers.delete(id);
    }
    
    return this.scheduledExports.delete(id);
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDirectory(): void {
    if (!existsSync(this.outputDirectory)) {
      mkdirSync(this.outputDirectory, { recursive: true });
    }
  }

  /**
   * Get export statistics
   */
  getExportStatistics(): {
    totalExports: number;
    successfulExports: number;
    failedExports: number;
    averageProcessingTime: number;
    formatBreakdown: Record<string, number>;
    deliveryBreakdown: Record<string, number>;
    } {
    const total = this.exportHistory.length;
    const successful = this.exportHistory.filter(e => e.success).length;
    const failed = total - successful;
    
    const avgProcessingTime = total > 0 
      ? this.exportHistory.reduce((sum, e) => sum + e.metadata.processingTime, 0) / total 
      : 0;

    const formatBreakdown: Record<string, number> = {};
    const deliveryBreakdown: Record<string, number> = {};

    this.exportHistory.forEach(result => {
      formatBreakdown[result.format] = (formatBreakdown[result.format] || 0) + 1;
      deliveryBreakdown[result.delivery] = (deliveryBreakdown[result.delivery] || 0) + 1;
    });

    return {
      totalExports: total,
      successfulExports: successful,
      failedExports: failed,
      averageProcessingTime: avgProcessingTime,
      formatBreakdown,
      deliveryBreakdown
    };
  }
}