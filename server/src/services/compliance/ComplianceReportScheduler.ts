/**
 * Compliance Report Scheduler
 * 
 * Automated scheduling and delivery system for compliance reports.
 * Handles periodic report generation, distribution, and lifecycle management.
 * 
 * Task: T-1752989143998-382 - Build standard compliance reports
 * Epic: 18 - Technical Debt & Refactoring
 */

import { 
  StandardComplianceReportingService,
  ComplianceFramework,
  ComplianceReportType,
  ReportingPeriod 
} from './StandardComplianceReportingService';
import { GDPRComplianceReportModule } from './frameworks/GDPRComplianceReportModule';
import { SOXComplianceReportModule } from './frameworks/SOXComplianceReportModule';
import cron from 'node-cron';
import { EventEmitter } from 'events';

}
export interface ReportSchedule {
  id: string;
  name: string;
  description: string;
  framework: ComplianceFramework;
  reportType: ComplianceReportType;
  schedule: ScheduleConfiguration;
  recipients: ReportRecipient[];
  deliveryOptions: DeliveryOptions;
  retentionPolicy: ScheduleRetentionPolicy;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  lastExecution?: ScheduleExecution;
  nextExecution?: Date;
  executionHistory: ScheduleExecution[];
}
}

}
export interface ScheduleConfiguration {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';
  cronExpression?: string;
  timezone: string;
  startDate: Date;
  endDate?: Date;
  executionTime: string; // HH:MM format
  weekdays?: number[]; // 0-6, Sunday=0
  monthDay?: number; // 1-31
  quarterMonth?: 1 | 2 | 3; // Which month of quarter
  fiscalYearEnd?: Date;
  holidays?: HolidayRule[];
  businessDaysOnly?: boolean;
}
}

}
export interface ReportRecipient {
  id: string;
  name: string;
  email: string;
  role: 'executive' | 'compliance_officer' | 'auditor' | 'board_member' | 'regulator' | 'other';
  deliveryPreferences: {
    formats: ('pdf' | 'excel' | 'html' | 'json')[];
    securityLevel: 'standard' | 'encrypted' | 'secure_portal';
    language: string;
    customizations?: RecipientCustomization[];
}
  };
  approvalRequired?: boolean;
  backupContacts?: BackupContact[];
}

}
export interface DeliveryOptions {
  methods: DeliveryMethod[];
  encryption: EncryptionOptions;
  digitalSignature: boolean;
  watermark?: WatermarkOptions;
  accessRestrictions: AccessRestriction[];
  expirationPolicy?: ExpirationPolicy;
  deliveryConfirmation: boolean;
  retryPolicy: RetryPolicy;
}
}

}
export interface DeliveryMethod {
  type: 'email' | 'secure_portal' | 'sftp' | 'api' | 'webhook';
  configuration: DeliveryConfiguration;
  priority: number;
  fallbackMethod?: string;
}
}

}
export interface ScheduleExecution {
  id: string;
  scheduleId: string;
  executionDate: Date;
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
  reportingPeriod: ReportingPeriod;
  generatedReports: GeneratedReport[];
  deliveryResults: DeliveryResult[];
  executionTimeMs: number;
  errors?: ExecutionError[];
  metadata: ExecutionMetadata;
}
}

}
export interface GeneratedReport {
  reportId: string;
  format: string;
  sizeBytes: number;
  generationTimeMs: number;
  filePath?: string;
  checksum: string;
  encryptionKey?: string;
}
}

}
export interface DeliveryResult {
  recipientId: string;
  method: string;
  status: 'delivered' | 'failed' | 'pending' | 'bounced';
  deliveryDate?: Date;
  confirmationReceived?: boolean;
  attempts: number;
  errorMessage?: string;
  trackingId?: string;
}
}

export class ComplianceReportScheduler extends EventEmitter {
  private reportingService: StandardComplianceReportingService;
  private gdprModule: GDPRComplianceReportModule;
  private soxModule: SOXComplianceReportModule;
  private schedules = new Map<string, ReportSchedule>();
  private cronJobs = new Map<string, any>();
  private executionQueue: ScheduleExecution[] = [];
  private isProcessing = false;

  constructor(
    reportingService: StandardComplianceReportingService,
    gdprModule: GDPRComplianceReportModule,
    soxModule: SOXComplianceReportModule
  ) {
    super();
    this.reportingService = reportingService;
    this.gdprModule = gdprModule;
    this.soxModule = soxModule;
    
    this.startExecutionProcessor();
  }

  /**
   * Create a new compliance report schedule
   */
  async createSchedule(schedule: Omit<ReportSchedule, 'id' | 'createdAt' | 'executionHistory'>): Promise<string> {

    const scheduleId = crypto.randomUUID();
    
    const newSchedule: ReportSchedule = {
      ...schedule,
      id: scheduleId,
      createdAt: new Date(),
      executionHistory: [],
      nextExecution: this.calculateNextExecution(schedule.schedule)
    };

    // Validate schedule configuration
    await this.validateSchedule(newSchedule);

    // Store schedule
    this.schedules.set(scheduleId, newSchedule);

    // Create cron job if active
    if (newSchedule.isActive) {
      await this.activateSchedule(scheduleId);
    }

    console.log(`📅 Created compliance report schedule: ${scheduleId} (${schedule.framework} ${schedule.reportType})`);
    
    this.emit('scheduleCreated', { scheduleId, schedule: newSchedule });
    
    return scheduleId;
  }

  /**
   * Update existing schedule
   */
  async updateSchedule(scheduleId: string, updates: Partial<ReportSchedule>): Promise<void> {

    const existingSchedule = this.schedules.get(scheduleId);
    if (!existingSchedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    const updatedSchedule: ReportSchedule = {
      ...existingSchedule,
      ...updates,
      nextExecution: updates.schedule ? this.calculateNextExecution(updates.schedule) : existingSchedule.nextExecution
    };

    // Validate updated schedule
    await this.validateSchedule(updatedSchedule);

    // Update stored schedule
    this.schedules.set(scheduleId, updatedSchedule);

    // Update cron job
    if (updatedSchedule.isActive) {
      await this.deactivateSchedule(scheduleId);
      await this.activateSchedule(scheduleId);
    } else {
      await this.deactivateSchedule(scheduleId);
    }

    console.log(`📝 Updated compliance report schedule: ${scheduleId}`);
    
    this.emit('scheduleUpdated', { scheduleId, schedule: updatedSchedule });
  }

  /**
   * Delete schedule
   */
  async deleteSchedule(scheduleId: string): Promise<void> {

    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    // Deactivate cron job
    await this.deactivateSchedule(scheduleId);

    // Remove from storage
    this.schedules.delete(scheduleId);

    console.log(`🗑️ Deleted compliance report schedule: ${scheduleId}`);
    
    this.emit('scheduleDeleted', { scheduleId });
  }

  /**
   * Execute schedule manually
   */
  async executeSchedule(scheduleId: string, overridePeriod?: ReportingPeriod): Promise<string> {

    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    const executionId = crypto.randomUUID();
    const reportingPeriod = overridePeriod || this.calculateReportingPeriod(schedule);

    const execution: ScheduleExecution = {
      id: executionId,
      scheduleId,
      executionDate: new Date(),
      status: 'scheduled',
      reportingPeriod,
      generatedReports: [],
      deliveryResults: [],
      executionTimeMs: 0,
      metadata: {
        triggeredBy: 'manual',
        requestedBy: 'system', // Would be actual user in real implementation
        scheduledTime: new Date(),
        priority: 'high'
      }
    };

    // Add to execution queue
    this.executionQueue.push(execution);

    console.log(`🚀 Queued manual execution for schedule: ${scheduleId} (execution: ${executionId})`);
    
    this.emit('executionQueued', { executionId, scheduleId });
    
    return executionId;
  }

  /**
   * Get schedule status and next execution
   */
  getScheduleStatus(scheduleId: string): ScheduleStatus {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    const lastExecution = schedule.executionHistory[schedule.executionHistory.length - 1];
    
    return {
      scheduleId,
      isActive: schedule.isActive,
      nextExecution: schedule.nextExecution,
      lastExecution: lastExecution ? {
        date: lastExecution.executionDate,
        status: lastExecution.status,
        duration: lastExecution.executionTimeMs,
        reportsGenerated: lastExecution.generatedReports.length,
        deliverySuccessRate: this.calculateDeliverySuccessRate(lastExecution.deliveryResults)
      } : undefined,
      executionCount: schedule.executionHistory.length,
      successRate: this.calculateSuccessRate(schedule.executionHistory),
      averageExecutionTime: this.calculateAverageExecutionTime(schedule.executionHistory)
    };
  }

  /**
   * Get all schedules with optional filtering
   */
  getSchedules(filter?: ScheduleFilter): ReportSchedule[] {
    let schedules = Array.from(this.schedules.values());

    if (filter) {
      if (filter.framework) {
        schedules = schedules.filter(s => s.framework === filter.framework);
      }
      if (filter.reportType) {
        schedules = schedules.filter(s => s.reportType === filter.reportType);
      }
      if (filter.isActive !== undefined) {
        schedules = schedules.filter(s => s.isActive === filter.isActive);
      }
      if (filter.createdBy) {
        schedules = schedules.filter(s => s.createdBy === filter.createdBy);
      }
    }

    return schedules.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Get execution history for a schedule
   */
  getExecutionHistory(scheduleId: string, limit: number = 50): ScheduleExecution[] {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    return schedule.executionHistory
      .sort((a, b) => b.executionDate.getTime() - a.executionDate.getTime())
      .slice(0, limit);
  }

  /**
   * Cancel pending execution
   */
  async cancelExecution(executionId: string): Promise<void> {

    const executionIndex = this.executionQueue.findIndex(e => e.id === executionId);
    if (executionIndex === -1) {
      throw new Error(`Execution ${executionId} not found in queue`);
    }

    const execution = this.executionQueue[executionIndex];
    execution.status = 'cancelled';
    execution.metadata.cancelledAt = new Date();

    // Remove from queue if not started
    if (execution.status === 'scheduled') {
      this.executionQueue.splice(executionIndex, 1);
    }

    console.log(`❌ Cancelled execution: ${executionId}`);
    
    this.emit('executionCancelled', { executionId });
  }

  // Private methods for schedule management

  private async activateSchedule(scheduleId: string): Promise<void> {

    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return;

    const cronExpression = this.buildCronExpression(schedule.schedule);
    
    const job = cron.schedule(cronExpression, async () => {
      await this.executeSchedule(scheduleId);
    }, {
      scheduled: true,
      timezone: schedule.schedule.timezone
    });

    this.cronJobs.set(scheduleId, job);
    
    console.log(`⏰ Activated schedule: ${scheduleId} with cron: ${cronExpression}`);
  }

  private async deactivateSchedule(scheduleId: string): Promise<void> {

    const job = this.cronJobs.get(scheduleId);
    if (job) {
      job.destroy();
      this.cronJobs.delete(scheduleId);
      console.log(`⏸️ Deactivated schedule: ${scheduleId}`);
    }
  }

  private buildCronExpression(config: ScheduleConfiguration): string {
    if (config.cronExpression) {
      return config.cronExpression;
    }

    const [hour, minute] = config.executionTime.split(':').map(Number);

    switch (config.frequency) {
    case 'daily':
      return `${minute} ${hour} * * *`;
    case 'weekly':
      const weekday = config.weekdays?.[0] || 0;
      return `${minute} ${hour} * * ${weekday}`;
    case 'monthly':
      const monthDay = config.monthDay || 1;
      return `${minute} ${hour} ${monthDay} * *`;
    case 'quarterly':
      const quarterMonths = this.getQuarterMonths(config.fiscalYearEnd);
      return `${minute} ${hour} ${config.monthDay || 1} ${quarterMonths.join(',')} *`;
    case 'annually':
      const yearMonth = config.fiscalYearEnd ? config.fiscalYearEnd.getMonth() + 1 : 12;
      const yearDay = config.fiscalYearEnd ? config.fiscalYearEnd.getDate() : 31;
      return `${minute} ${hour} ${yearDay} ${yearMonth} *`;
    default:
      throw new Error(`Unsupported frequency: ${config.frequency}`);
    }
  }

  private calculateNextExecution(config: ScheduleConfiguration): Date {
    const now = new Date();
    const [hour, minute] = config.executionTime.split(':').map(Number);
    
    let nextExecution = new Date(now);
    nextExecution.setHours(hour, minute, 0, 0);

    // If time has passed today, move to next occurrence
    if (nextExecution <= now) {
      switch (config.frequency) {
      case 'daily':
        nextExecution.setDate(nextExecution.getDate() + 1);
        break;
      case 'weekly':
        nextExecution.setDate(nextExecution.getDate() + 7);
        break;
      case 'monthly':
        nextExecution.setMonth(nextExecution.getMonth() + 1);
        break;
      case 'quarterly':
        nextExecution.setMonth(nextExecution.getMonth() + 3);
        break;
      case 'annually':
        nextExecution.setFullYear(nextExecution.getFullYear() + 1);
        break;
      }
    }

    // Skip holidays if business days only
    if (config.businessDaysOnly) {
      nextExecution = this.skipHolidays(nextExecution, config.holidays || []);
    }

    return nextExecution;
  }

  private calculateReportingPeriod(schedule: ReportSchedule): ReportingPeriod {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (schedule.schedule.frequency) {
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'quarterly':
      const quarter = Math.floor((now.getMonth()) / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      break;
    case 'annually':
      const fiscalYearEnd = schedule.schedule.fiscalYearEnd || new Date(now.getFullYear(), 11, 31);
      startDate = new Date(fiscalYearEnd.getFullYear() - 1, fiscalYearEnd.getMonth(), fiscalYearEnd.getDate() + 1);
      endDate = new Date(fiscalYearEnd.getFullYear(), fiscalYearEnd.getMonth(), fiscalYearEnd.getDate());
      break;
    default:
      // For daily/weekly, use last 30 days
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      endDate = new Date(now);
      break;
    }

    return {
      startDate,
      endDate,
      periodType: schedule.schedule.frequency === 'annually' ? 'annual' : 
        schedule.schedule.frequency === 'quarterly' ? 'quarterly' : 
          schedule.schedule.frequency === 'monthly' ? 'monthly' : 'custom'
    };
  }

  private async validateSchedule(schedule: ReportSchedule): Promise<void> {

    // Validate cron expression if provided
    if (schedule.schedule.cronExpression) {
      if (!cron.validate(schedule.schedule.cronExpression)) {
        throw new Error('Invalid cron expression');
      }
    }

    // Validate recipients
    if (schedule.recipients.length === 0) {
      throw new Error('At least one recipient is required');
    }

    // Validate delivery methods
    if (schedule.deliveryOptions.methods.length === 0) {
      throw new Error('At least one delivery method is required');
    }

    // Validate execution time
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(schedule.schedule.executionTime)) {
      throw new Error('Invalid execution time format (use HH:MM)');
    }
  }

  private startExecutionProcessor(): void {
    setInterval(async () => {
      if (this.isProcessing || this.executionQueue.length === 0) {
        return;
      }

      this.isProcessing = true;

      try {
        const execution = this.executionQueue.shift();
        if (execution) {
          await this.processExecution(execution);
        }
      } catch (error) {
        console.error('Error processing execution:', error);
      } finally {
        this.isProcessing = false;
      }
    }, 5000); // Check every 5 seconds
  }

  private async processExecution(execution: ScheduleExecution): Promise<void> {

    const startTime = Date.now();
    execution.status = 'running';

    try {
      console.log(`🔄 Processing execution: ${execution.id} for schedule: ${execution.scheduleId}`);

      const schedule = this.schedules.get(execution.scheduleId);
      if (!schedule) {
        throw new Error(`Schedule ${execution.scheduleId} not found`);
      }

      // Generate report
      const report = await this.generateReport(schedule, execution.reportingPeriod);
      
      // Export in required formats
      const generatedReports = await this.exportReports(report, schedule);
      execution.generatedReports = generatedReports;

      // Deliver reports
      const deliveryResults = await this.deliverReports(generatedReports, schedule);
      execution.deliveryResults = deliveryResults;

      execution.status = 'completed';
      execution.executionTimeMs = Date.now() - startTime;

      console.log(`✅ Completed execution: ${execution.id} in ${execution.executionTimeMs}ms`);

      this.emit('executionCompleted', { execution });

    } catch (error) {
      execution.status = 'failed';
      execution.executionTimeMs = Date.now() - startTime;
      execution.errors = [{
        type: 'execution_error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        context: { scheduleId: execution.scheduleId }
      }];

      console.error(`❌ Failed execution: ${execution.id}:`, error);

      this.emit('executionFailed', { execution, error });
    }

    // Update schedule with execution history
    const schedule = this.schedules.get(execution.scheduleId);
    if (schedule) {
      schedule.executionHistory.push(execution);
      schedule.lastExecution = execution;
      schedule.nextExecution = this.calculateNextExecution(schedule.schedule);
      
      // Keep only last 100 executions
      if (schedule.executionHistory.length > 100) {
        schedule.executionHistory = schedule.executionHistory.slice(-100);
      }
    }
  }

  private async generateReport(schedule: ReportSchedule, period: ReportingPeriod): Promise<unknown> {

    switch (schedule.framework) {
    case ComplianceFramework.GDPR:
      return this.gdprModule.generateGDPRReport(schedule.reportType, period);
    case ComplianceFramework.SOX:
      return this.soxModule.generateSOXReport(schedule.reportType, period);
    default:
      return this.reportingService.generateStandardReport(
        schedule.framework,
        schedule.reportType,
        period
      );
    }
  }

  private async exportReports(report: unknown, schedule: ReportSchedule): Promise<GeneratedReport[]> {

    const formats = new Set<string>();
    
    // Collect all required formats
    schedule.recipients.forEach(recipient => {
      recipient.deliveryPreferences.formats.forEach(format => formats.add(format));
    });

    const generatedReports: GeneratedReport[] = [];

    for (const format of formats) {
      const startTime = Date.now();
      
      const exportData = await this.reportingService.exportReport(
        report,
        format as any,
        { includeAttachments: true }
      );

      const reportData = typeof exportData === 'string' ? Buffer.from(exportData) : exportData;
      const checksum = crypto.createHash('sha256').update(reportData).digest('hex');

      generatedReports.push({
        reportId: `${report.id}-${format}`,
        format,
        sizeBytes: reportData.length,
        generationTimeMs: Date.now() - startTime,
        checksum,
        filePath: `/tmp/reports/${report.id}-${format}`
      });
    }

    return generatedReports;
  }

  private async deliverReports(reports: GeneratedReport[], schedule: ReportSchedule): Promise<DeliveryResult[]> {

    const deliveryResults: DeliveryResult[] = [];

    for (const recipient of schedule.recipients) {
      for (const method of schedule.deliveryOptions.methods) {
        const result = await this.deliverToRecipient(reports, recipient, method, schedule);
        deliveryResults.push(result);
      }
    }

    return deliveryResults;
  }

  private async deliverToRecipient(
    reports: GeneratedReport[],
    recipient: ReportRecipient,
    method: DeliveryMethod,
    _____schedule: ReportSchedule
  ): Promise<DeliveryResult> {

    const _____startTime = Date.now();

    try {
      // Filter reports by recipient's preferred formats
      const recipientReports = reports.filter(r => 
        recipient.deliveryPreferences.formats.includes(r.format as any)
      );

      switch (method.type) {
      case 'email':
        await this.deliverViaEmail(recipientReports, recipient, method.configuration);
        break;
      case 'secure_portal':
        await this.deliverViaSecurePortal(recipientReports, recipient, method.configuration);
        break;
      case 'sftp':
        await this.deliverViaSFTP(recipientReports, recipient, method.configuration);
        break;
      case 'api':
        await this.deliverViaAPI(recipientReports, recipient, method.configuration);
        break;
      case 'webhook':
        await this.deliverViaWebhook(recipientReports, recipient, method.configuration);
        break;
      default:
        throw new Error(`Unsupported delivery method: ${method.type}`);
      }

      return {
        recipientId: recipient.id,
        method: method.type,
        status: 'delivered',
        deliveryDate: new Date(),
        attempts: 1,
        trackingId: crypto.randomUUID()
      };

    } catch (error) {
      return {
        recipientId: recipient.id,
        method: method.type,
        status: 'failed',
        attempts: 1,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper methods for calculations
  private calculateDeliverySuccessRate(results: DeliveryResult[]): number {
    if (results.length === 0) return 0;
    const successful = results.filter(r => r.status === 'delivered').length;
    return (successful / results.length) * 100;
  }

  private calculateSuccessRate(executions: ScheduleExecution[]): number {
    if (executions.length === 0) return 0;
    const successful = executions.filter(e => e.status === 'completed').length;
    return (successful / executions.length) * 100;
  }

  private calculateAverageExecutionTime(executions: ScheduleExecution[]): number {
    const completed = executions.filter(e => e.status === 'completed');
    if (completed.length === 0) return 0;
    return completed.reduce((sum, e) => sum + e.executionTimeMs, 0) / completed.length;
  }

  private getQuarterMonths(fiscalYearEnd?: Date): number[] {
    // Default to calendar year quarters if no fiscal year specified
    if (!fiscalYearEnd) {
      return [1, 4, 7, 10]; // Jan, Apr, Jul, Oct
    }
    
    const endMonth = fiscalYearEnd.getMonth() + 1;
    return [
      ((endMonth + 9) % 12) || 12,  // Q1 start
      ((endMonth + 6) % 12) || 12,  // Q2 start  
      ((endMonth + 3) % 12) || 12,  // Q3 start
      endMonth                       // Q4 start (fiscal year end)
    ].sort();
  }

  private skipHolidays(date: Date, _____holidays: HolidayRule[]): Date {
    // Implementation would check against holiday rules and skip to next business day
    // For now, just return the date
    return date;
  }

  // Delivery method implementations (placeholder)
  private async deliverViaEmail(
    reports: GeneratedReport[],
    recipient: ReportRecipient,
    _____config: DeliveryConfiguration
  ): Promise<void> {

    console.log(`📧 Delivering reports via email to ${recipient.email}`);
  }

  private async deliverViaSecurePortal(
    reports: GeneratedReport[],
    recipient: ReportRecipient,
    _____config: DeliveryConfiguration
  ): Promise<void> {

    console.log(`🔒 Delivering reports via secure portal to ${recipient.name}`);
  }

  private async deliverViaSFTP(
    reports: GeneratedReport[],
    recipient: ReportRecipient,
    _____config: DeliveryConfiguration
  ): Promise<void> {

    console.log(`📁 Delivering reports via SFTP to ${recipient.name}`);
  }

  private async deliverViaAPI(
    reports: GeneratedReport[],
    recipient: ReportRecipient,
    _____config: DeliveryConfiguration
  ): Promise<void> {

    console.log(`🔌 Delivering reports via API to ${recipient.name}`);
  }

  private async deliverViaWebhook(
    reports: GeneratedReport[],
    recipient: ReportRecipient,
    _____config: DeliveryConfiguration
  ): Promise<void> {

    console.log(`🪝 Delivering reports via webhook to ${recipient.name}`);
  }
}

// Supporting interfaces and types
}
interface ScheduleRetentionPolicy {
  keepExecutionHistory: number; // days
  archiveReports: boolean;
  archiveAfterDays: number;
  deleteAfterDays: number;
}
}

}
interface HolidayRule {
  name: string;
  date: Date;
  recurring: boolean;
  skipIfWeekend: boolean;
}
}

}
interface RecipientCustomization {
  section: string;
  include: boolean;
  format?: string;
}
}

}
interface BackupContact {
  name: string;
  email: string;
  role: string;
}
}

}
interface EncryptionOptions {
  enabled: boolean;
  algorithm?: string;
  keySize?: number;
  certificatePath?: string;
}
}

}
interface WatermarkOptions {
  text: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
}
}

}
interface AccessRestriction {
  type: 'ip_whitelist' | 'user_authentication' | 'time_limited' | 'download_limit';
  configuration: unknown;
}
}

}
interface ExpirationPolicy {
  expiresAfterDays: number;
  warningDays: number;
  autoDelete: boolean;
}
}

}
interface RetryPolicy {
  maxAttempts: number;
  retryIntervalMs: number;
  backoffMultiplier: number;
}
}

}
interface DeliveryConfiguration {
  [key: string]: unknown;
}
}

}
interface ExecutionError {
  type: string;
  message: string;
  timestamp: Date;
  context: unknown;
}
}

}
interface ExecutionMetadata {
  triggeredBy: 'schedule' | 'manual' | 'api';
  requestedBy: string;
  scheduledTime: Date;
  priority: 'low' | 'medium' | 'high';
  cancelledAt?: Date;
}
}

}
interface ScheduleStatus {
  scheduleId: string;
  isActive: boolean;
  nextExecution?: Date;
  lastExecution?: {
    date: Date;
    status: string;
    duration: number;
    reportsGenerated: number;
    deliverySuccessRate: number;
}
  };
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
}

}
interface ScheduleFilter {
  framework?: ComplianceFramework;
  reportType?: ComplianceReportType;
  isActive?: boolean;
  createdBy?: string;
}
}