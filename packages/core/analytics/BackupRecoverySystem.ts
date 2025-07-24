/**
 * Backup and Recovery System - Story 1.5 Task 3
 * 
 * Implements comprehensive backup and recovery procedures for analytics data
 * to ensure zero data loss during migration and system operations.
 */

import { z } from 'zod';
import { UnifiedAnalyticsEvent, EventFilter } from './UnifiedEventBus';
import { EventRepository } from './EventPersistenceLayer';
import * as fs from 'fs/promises';
import * as path from 'path';

// Backup Configuration Schema
export const BackupConfigSchema = z.object({
  backupLocation: z.string().default('/tmp/analytics_backups'),
  compressionEnabled: z.boolean().default(true),
  encryptionEnabled: z.boolean().default(false),
  encryptionKey: z.string().optional(),
  retentionDays: z.number().min(1).max(365).default(30),
  batchSize: z.number().min(100).max(50000).default(10000),
  includeMetadata: z.boolean().default(true),
  verifyBackup: z.boolean().default(true),
  maxBackupSize: z.number().min(1000000).default(1000000000), // 1GB default
  format: z.enum(['json', 'jsonl', 'csv', 'parquet']).default('jsonl')
});

export type BackupConfig = z.infer<typeof BackupConfigSchema>;

// Backup Status
export enum BackupStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  VERIFYING = 'verifying',
  VERIFIED = 'verified',
  CORRUPTED = 'corrupted'
}

// Recovery Status
export enum RecoveryStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  VALIDATING = 'validating',
  VALIDATED = 'validated'
}

// Backup Metadata
export interface BackupMetadata {
  backupId: string;
  backupName: string;
  description?: string;
  status: BackupStatus;
  createdAt: number;
  completedAt?: number;
  size: number;
  eventCount: number;
  systemSources: string[];
  timeRange: {
    start: number;
    end: number;
  };
  config: BackupConfig;
  filePath: string;
  checksum?: string;
  version: string;
  format: string;
  compressed: boolean;
  encrypted: boolean;
}

// Recovery Metadata
export interface RecoveryMetadata {
  recoveryId: string;
  backupId: string;
  status: RecoveryStatus;
  startedAt: number;
  completedAt?: number;
  targetSystem: string;
  recoveredEventCount: number;
  failedEventCount: number;
  validationResults?: {
    passed: boolean;
    issues: string[];
  };
}

// Backup Progress
export interface BackupProgress {
  backupId: string;
  status: BackupStatus;
  progress: {
    percentage: number;
    processedEvents: number;
    totalEvents: number;
    currentBatch: number;
    totalBatches: number;
    bytesWritten: number;
    estimatedTimeRemaining: number;
  };
  currentOperation: string;
  throughput: {
    eventsPerSecond: number;
    bytesPerSecond: number;
  };
}

/**
 * Backup and Recovery System
 * 
 * Provides comprehensive backup and recovery capabilities for analytics data
 */
export class BackupRecoverySystem {
  private eventRepository: EventRepository;
  private backupMetadata: Map<string, BackupMetadata> = new Map();
  private recoveryMetadata: Map<string, RecoveryMetadata> = new Map();
  private activeBackups: Map<string, BackupProgress> = new Map();
  private activeRecoveries: Map<string, RecoveryMetadata> = new Map();

  constructor(eventRepository: EventRepository) {
    this.eventRepository = eventRepository;
    this.loadExistingBackups();
  }

  /**
   * Create backup of analytics data
   */
  async createBackup(
    backupName: string,
    filter?: EventFilter,
    config: Partial<BackupConfig> = {},
    description?: string
  ): Promise<string> {
    const backupConfig = BackupConfigSchema.parse(config);
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${backupName}_${timestamp}.${backupConfig.format}${backupConfig.compressionEnabled ? '.gz' : ''}`;
    const filePath = path.join(backupConfig.backupLocation, fileName);

    try {
      // Ensure backup directory exists
      await fs.mkdir(backupConfig.backupLocation, { recursive: true });

      // Get events to backup
      console.log(`Starting backup ${backupId}: ${backupName}`);
      const events = await this.eventRepository.findMany({
        filter,
        limit: 1000000 // Large limit for backup
      });

      if (events.length === 0) {
        throw new Error('No events found matching the specified filter');
      }

      // Initialize backup progress
      const progress: BackupProgress = {
        backupId,
        status: BackupStatus.RUNNING,
        progress: {
          percentage: 0,
          processedEvents: 0,
          totalEvents: events.length,
          currentBatch: 0,
          totalBatches: Math.ceil(events.length / backupConfig.batchSize),
          bytesWritten: 0,
          estimatedTimeRemaining: 0
        },
        currentOperation: 'Initializing backup',
        throughput: {
          eventsPerSecond: 0,
          bytesPerSecond: 0
        }
      };

      this.activeBackups.set(backupId, progress);

      // Create backup metadata
      const timeRange = events.length > 0 ? {
        start: Math.min(...events.map(e => e.timestamp)),
        end: Math.max(...events.map(e => e.timestamp))
      } : { start: 0, end: 0 };

      const systemSources = Array.from(new Set(events.map(e => e.source)));

      const metadata: BackupMetadata = {
        backupId,
        backupName,
        description,
        status: BackupStatus.RUNNING,
        createdAt: Date.now(),
        size: 0,
        eventCount: events.length,
        systemSources,
        timeRange,
        config: backupConfig,
        filePath,
        version: '1.0.0',
        format: backupConfig.format,
        compressed: backupConfig.compressionEnabled,
        encrypted: backupConfig.encryptionEnabled
      };

      this.backupMetadata.set(backupId, metadata);

      // Perform backup asynchronously
      this.performBackup(backupId, events, filePath, backupConfig)
        .then(() => {
          console.log(`Backup ${backupId} completed successfully`);
        })
        .catch(error => {
          console.error(`Backup ${backupId} failed:`, error);
          this.updateBackupStatus(backupId, BackupStatus.FAILED);
        });

      return backupId;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to create backup ${backupId}:`, errorMessage);
      
      // Update metadata with failure
      const metadata = this.backupMetadata.get(backupId);
      if (metadata) {
        metadata.status = BackupStatus.FAILED;
      }
      
      throw error;
    }
  }

  /**
   * Perform the actual backup operation
   */
  private async performBackup(
    backupId: string,
    events: UnifiedAnalyticsEvent[],
    filePath: string,
    config: BackupConfig
  ): Promise<void> {
    const startTime = Date.now();
    let bytesWritten = 0;

    try {
      this.updateCurrentOperation(backupId, 'Writing backup data');

      // Write events in batches
      const totalBatches = Math.ceil(events.length / config.batchSize);

      // Open file for writing
      const fileHandle = await fs.open(filePath, 'w');
      
      try {
        // Write header for non-JSONL formats
        if (config.format === 'json') {
          await fileHandle.writeFile('[\n');
          bytesWritten += 2;
        } else if (config.format === 'csv') {
          const headers = this.generateCSVHeaders(events[0]);
          await fileHandle.writeFile(headers + '\n');
          bytesWritten += headers.length + 1;
        }

        // Process events in batches
        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
          const startIdx = batchIndex * config.batchSize;
          const endIdx = Math.min(startIdx + config.batchSize, events.length);
          const batch = events.slice(startIdx, endIdx);

          const batchData = await this.formatBatchData(batch, config.format, batchIndex > 0);
          await fileHandle.writeFile(batchData);
          bytesWritten += Buffer.byteLength(batchData, 'utf8');

          // Update progress
          const processedEvents = endIdx;
          const percentage = (processedEvents / events.length) * 100;
          const elapsedTime = Date.now() - startTime;
          const eventsPerSecond = processedEvents / (elapsedTime / 1000);
          const bytesPerSecond = bytesWritten / (elapsedTime / 1000);
          const estimatedTimeRemaining = elapsedTime * (100 - percentage) / percentage;

          this.updateBackupProgress(backupId, {
            percentage,
            processedEvents,
            currentBatch: batchIndex + 1,
            bytesWritten,
            estimatedTimeRemaining
          }, {
            eventsPerSecond,
            bytesPerSecond
          });

          // Small delay to prevent overwhelming the system
          if (batchIndex < totalBatches - 1) {
            await this.sleep(10);
          }
        }

        // Write footer for JSON format
        if (config.format === 'json') {
          await fileHandle.writeFile('\n]');
          bytesWritten += 2;
        }

      } finally {
        await fileHandle.close();
      }

      // Compress if enabled
      if (config.compressionEnabled) {
        this.updateCurrentOperation(backupId, 'Compressing backup');
        await this.compressFile(filePath);
      }

      // Encrypt if enabled
      if (config.encryptionEnabled && config.encryptionKey) {
        this.updateCurrentOperation(backupId, 'Encrypting backup');
        await this.encryptFile(filePath, config.encryptionKey);
      }

      // Calculate checksum
      this.updateCurrentOperation(backupId, 'Calculating checksum');
      const checksum = await this.calculateFileChecksum(filePath);

      // Update metadata
      const metadata = this.backupMetadata.get(backupId);
      if (metadata) {
        metadata.status = BackupStatus.COMPLETED;
        metadata.completedAt = Date.now();
        metadata.size = bytesWritten;
        metadata.checksum = checksum;
      }

      // Verify backup if enabled
      if (config.verifyBackup) {
        this.updateCurrentOperation(backupId, 'Verifying backup');
        this.updateBackupStatus(backupId, BackupStatus.VERIFYING);
        
        const verificationResult = await this.verifyBackup(backupId);
        if (verificationResult.valid) {
          this.updateBackupStatus(backupId, BackupStatus.VERIFIED);
        } else {
          this.updateBackupStatus(backupId, BackupStatus.CORRUPTED);
          throw new Error(`Backup verification failed: ${verificationResult.errors.join(', ')}`);
        }
      }

      this.activeBackups.delete(backupId);
      
      console.log(`Backup ${backupId} completed:`, {
        eventCount: events.length,
        size: `${(bytesWritten / 1024 / 1024).toFixed(2)} MB`,
        duration: `${Date.now() - startTime}ms`,
        checksum
      });

    } catch (error) {
      this.updateBackupStatus(backupId, BackupStatus.FAILED);
      this.activeBackups.delete(backupId);
      throw error;
    }
  }

  /**
   * Restore data from backup
   */
  async restoreFromBackup(
    backupId: string,
    targetFilter?: EventFilter,
    validateBeforeRestore: boolean = true
  ): Promise<string> {
    const recoveryId = `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const backup = this.backupMetadata.get(backupId);
      if (!backup) {
        throw new Error(`Backup ${backupId} not found`);
      }

      if (backup.status !== BackupStatus.COMPLETED && backup.status !== BackupStatus.VERIFIED) {
        throw new Error(`Backup ${backupId} is not in a valid state for recovery (status: ${backup.status})`);
      }

      // Initialize recovery metadata
      const recovery: RecoveryMetadata = {
        recoveryId,
        backupId,
        status: RecoveryStatus.PENDING,
        startedAt: Date.now(),
        targetSystem: 'unified-analytics',
        recoveredEventCount: 0,
        failedEventCount: 0
      };

      this.recoveryMetadata.set(recoveryId, recovery);
      this.activeRecoveries.set(recoveryId, recovery);

      console.log(`Starting recovery ${recoveryId} from backup ${backupId}`);

      // Perform recovery asynchronously
      this.performRecovery(recoveryId, backup, targetFilter, validateBeforeRestore)
        .then(() => {
          console.log(`Recovery ${recoveryId} completed successfully`);
        })
        .catch(error => {
          console.error(`Recovery ${recoveryId} failed:`, error);
          this.updateRecoveryStatus(recoveryId, RecoveryStatus.FAILED);
        });

      return recoveryId;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to start recovery ${recoveryId}:`, errorMessage);
      
      const recovery = this.recoveryMetadata.get(recoveryId);
      if (recovery) {
        recovery.status = RecoveryStatus.FAILED;
      }
      
      throw error;
    }
  }

  /**
   * Perform the actual recovery operation
   */
  private async performRecovery(
    recoveryId: string,
    backup: BackupMetadata,
    targetFilter?: EventFilter,
    validateBeforeRestore: boolean = true
  ): Promise<void> {
    const recovery = this.recoveryMetadata.get(recoveryId);
    if (!recovery) throw new Error(`Recovery ${recoveryId} not found`);

    try {
      recovery.status = RecoveryStatus.RUNNING;

      // Verify backup integrity first
      if (validateBeforeRestore) {
        console.log(`Verifying backup ${backup.backupId} before recovery`);
        const verificationResult = await this.verifyBackup(backup.backupId);
        if (!verificationResult.valid) {
          throw new Error(`Backup verification failed: ${verificationResult.errors.join(', ')}`);
        }
      }

      // Read backup data
      console.log(`Reading backup data from ${backup.filePath}`);
      const events = await this.readBackupData(backup);

      // Filter events if target filter is specified
      let filteredEvents = events;
      if (targetFilter) {
        filteredEvents = events.filter(event => this.matchesFilter(event, targetFilter));
        console.log(`Filtered ${events.length} events to ${filteredEvents.length} based on target filter`);
      }

      // Restore events to repository
      console.log(`Restoring ${filteredEvents.length} events to repository`);
      let recoveredCount = 0;
      let failedCount = 0;

      const batchSize = 1000;
      const totalBatches = Math.ceil(filteredEvents.length / batchSize);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIdx = batchIndex * batchSize;
        const endIdx = Math.min(startIdx + batchSize, filteredEvents.length);
        const batch = filteredEvents.slice(startIdx, endIdx);

        try {
          await this.eventRepository.saveBatch(batch);
          recoveredCount += batch.length;
        } catch (error) {
          console.error(`Failed to restore batch ${batchIndex + 1}/${totalBatches}:`, error);
          failedCount += batch.length;
        }

        // Update progress
        console.log(`Recovery progress: ${batchIndex + 1}/${totalBatches} batches processed`);
      }

      // Update recovery metadata
      recovery.status = RecoveryStatus.COMPLETED;
      recovery.completedAt = Date.now();
      recovery.recoveredEventCount = recoveredCount;
      recovery.failedEventCount = failedCount;

      // Validate recovery if any events were recovered
      if (recoveredCount > 0) {
        recovery.status = RecoveryStatus.VALIDATING;
        const validationResults = await this.validateRecovery(recoveryId, backup, recoveredCount);
        recovery.validationResults = validationResults;
        recovery.status = validationResults.passed ? RecoveryStatus.VALIDATED : RecoveryStatus.FAILED;
      }

      this.activeRecoveries.delete(recoveryId);

      console.log(`Recovery ${recoveryId} completed:`, {
        recoveredEvents: recoveredCount,
        failedEvents: failedCount,
        successRate: `${((recoveredCount / filteredEvents.length) * 100).toFixed(2)}%`
      });

    } catch (error) {
      recovery.status = RecoveryStatus.FAILED;
      this.activeRecoveries.delete(recoveryId);
      throw error;
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(backupId: string): Promise<{ valid: boolean; errors: string[] }> {
    const backup = this.backupMetadata.get(backupId);
    if (!backup) {
      return { valid: false, errors: ['Backup metadata not found'] };
    }

    const errors: string[] = [];

    try {
      // Check if file exists
      try {
        await fs.access(backup.filePath);
      } catch (error) {
        errors.push('Backup file does not exist');
        return { valid: false, errors };
      }

      // Verify file size
      const stats = await fs.stat(backup.filePath);
      if (stats.size === 0) {
        errors.push('Backup file is empty');
      }

      // Verify checksum if available
      if (backup.checksum) {
        const currentChecksum = await this.calculateFileChecksum(backup.filePath);
        if (currentChecksum !== backup.checksum) {
          errors.push('Checksum mismatch - backup may be corrupted');
        }
      }

      // Try to read a sample of the backup data
      try {
        const sampleEvents = await this.readBackupData(backup, 10); // Read first 10 events
        if (sampleEvents.length === 0 && backup.eventCount > 0) {
          errors.push('Unable to read events from backup file');
        }
      } catch (error) {
        errors.push(`Error reading backup data: ${error instanceof Error ? error.message : String(error)}`);
      }

      return { valid: errors.length === 0, errors };

    } catch (error) {
      errors.push(`Verification error: ${error instanceof Error ? error.message : String(error)}`);
      return { valid: false, errors };
    }
  }

  /**
   * List all backups
   */
  listBackups(filter?: { status?: BackupStatus; systemSource?: string }): BackupMetadata[] {
    let backups = Array.from(this.backupMetadata.values());

    if (filter) {
      if (filter.status) {
        backups = backups.filter(b => b.status === filter.status);
      }
      if (filter.systemSource) {
        backups = backups.filter(b => b.systemSources.includes(filter.systemSource));
      }
    }

    return backups.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get backup details
   */
  getBackup(backupId: string): BackupMetadata | null {
    return this.backupMetadata.get(backupId) || null;
  }

  /**
   * Get backup progress
   */
  getBackupProgress(backupId: string): BackupProgress | null {
    return this.activeBackups.get(backupId) || null;
  }

  /**
   * Get recovery details
   */
  getRecovery(recoveryId: string): RecoveryMetadata | null {
    return this.recoveryMetadata.get(recoveryId) || null;
  }

  /**
   * Delete backup
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    const backup = this.backupMetadata.get(backupId);
    if (!backup) return false;

    try {
      // Delete backup file
      await fs.unlink(backup.filePath);
      
      // Remove from metadata
      this.backupMetadata.delete(backupId);
      
      console.log(`Backup ${backupId} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to delete backup ${backupId}:`, error);
      return false;
    }
  }

  /**
   * Cleanup old backups based on retention policy
   */
  async cleanupOldBackups(retentionDays?: number): Promise<number> {
    const cutoffTime = Date.now() - ((retentionDays || 30) * 24 * 60 * 60 * 1000);
    const oldBackups = Array.from(this.backupMetadata.values())
      .filter(backup => backup.createdAt < cutoffTime);

    let deletedCount = 0;
    for (const backup of oldBackups) {
      const success = await this.deleteBackup(backup.backupId);
      if (success) deletedCount++;
    }

    console.log(`Cleaned up ${deletedCount} old backups`);
    return deletedCount;
  }

  /**
   * Helper Methods
   */

  /**
   * Format batch data for different formats
   */
  private async formatBatchData(
    events: UnifiedAnalyticsEvent[],
    format: string,
    isSubsequentBatch: boolean
  ): Promise<string> {
    switch (format) {
      case 'json':
        const separator = isSubsequentBatch ? ',\n' : '';
        return separator + events.map(e => JSON.stringify(e, null, 2)).join(',\n');

      case 'jsonl':
        return events.map(e => JSON.stringify(e)).join('\n') + '\n';

      case 'csv':
        return events.map(e => this.eventToCSV(e)).join('\n') + '\n';

      default:
        return events.map(e => JSON.stringify(e)).join('\n') + '\n';
    }
  }

  /**
   * Generate CSV headers
   */
  private generateCSVHeaders(event: UnifiedAnalyticsEvent): string {
    const headers = [
      'id', 'type', 'category', 'severity', 'timestamp', 'source', 'version',
      'sessionId', 'userId', 'organizationId', 'requestId', 'traceId',
      'data', 'metadata', 'tags', 'environment', 'region'
    ];
    return headers.join(',');
  }

  /**
   * Convert event to CSV row
   */
  private eventToCSV(event: UnifiedAnalyticsEvent): string {
    const values = [
      event.id,
      event.type,
      event.category,
      event.severity,
      event.timestamp,
      event.source,
      event.version,
      event.sessionId || '',
      event.userId || '',
      event.organizationId || '',
      event.requestId || '',
      event.traceId || '',
      JSON.stringify(event.data),
      JSON.stringify(event.metadata),
      JSON.stringify(event.tags),
      event.environment,
      event.region || ''
    ];
    
    return values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  }

  /**
   * Read backup data
   */
  private async readBackupData(backup: BackupMetadata, limit?: number): Promise<UnifiedAnalyticsEvent[]> {
    const content = await fs.readFile(backup.filePath, 'utf8');
    const events: UnifiedAnalyticsEvent[] = [];

    switch (backup.format) {
      case 'json':
        const jsonData = JSON.parse(content);
        events.push(...(Array.isArray(jsonData) ? jsonData : [jsonData]));
        break;

      case 'jsonl':
        const lines = content.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            events.push(JSON.parse(line));
            if (limit && events.length >= limit) break;
          } catch (error) {
            console.warn('Failed to parse JSONL line:', line);
          }
        }
        break;

      case 'csv':
        // CSV parsing would be more complex in production
        console.warn('CSV reading not fully implemented');
        break;

      default:
        throw new Error(`Unsupported backup format: ${backup.format}`);
    }

    return limit ? events.slice(0, limit) : events;
  }

  /**
   * Calculate file checksum
   */
  private async calculateFileChecksum(filePath: string): Promise<string> {
    const crypto = require('crypto');
    const content = await fs.readFile(filePath);
    const hash = crypto.createHash('sha256');
    hash.update(content);
    return hash.digest('hex');
  }

  /**
   * Compress file (placeholder implementation)
   */
  private async compressFile(filePath: string): Promise<void> {
    // In production, this would use actual compression (gzip, etc.)
    console.log(`Compressing file: ${filePath}`);
  }

  /**
   * Encrypt file (placeholder implementation)
   */
  private async encryptFile(filePath: string, encryptionKey: string): Promise<void> {
    // In production, this would use actual encryption
    console.log(`Encrypting file: ${filePath}`);
  }

  /**
   * Validate recovery
   */
  private async validateRecovery(
    recoveryId: string,
    backup: BackupMetadata,
    expectedCount: number
  ): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check if expected number of events were recovered
      const actualCount = await this.eventRepository.count({
        startTime: backup.timeRange.start,
        endTime: backup.timeRange.end
      });

      if (actualCount < expectedCount) {
        issues.push(`Expected ${expectedCount} events, but only ${actualCount} were found in repository`);
      }

      // Additional validation could be added here

    } catch (error) {
      issues.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * Check if event matches filter
   */
  private matchesFilter(event: UnifiedAnalyticsEvent, filter: EventFilter): boolean {
    if (filter.types && !filter.types.includes(event.type as any)) return false;
    if (filter.sources && !filter.sources.includes(event.source)) return false;
    if (filter.userId && event.userId !== filter.userId) return false;
    if (filter.startTime && event.timestamp < filter.startTime) return false;
    if (filter.endTime && event.timestamp > filter.endTime) return false;
    return true;
  }

  /**
   * Load existing backups from metadata
   */
  private async loadExistingBackups(): Promise<void> {
    // In production, this would load backup metadata from persistent storage
    console.log('Loading existing backup metadata...');
  }

  /**
   * Update backup status
   */
  private updateBackupStatus(backupId: string, status: BackupStatus): void {
    const backup = this.backupMetadata.get(backupId);
    if (backup) {
      backup.status = status;
    }

    const progress = this.activeBackups.get(backupId);
    if (progress) {
      progress.status = status;
    }
  }

  /**
   * Update current operation
   */
  private updateCurrentOperation(backupId: string, operation: string): void {
    const progress = this.activeBackups.get(backupId);
    if (progress) {
      progress.currentOperation = operation;
    }
  }

  /**
   * Update backup progress
   */
  private updateBackupProgress(
    backupId: string,
    progressUpdate: Partial<BackupProgress['progress']>,
    throughputUpdate: Partial<BackupProgress['throughput']>
  ): void {
    const progress = this.activeBackups.get(backupId);
    if (progress) {
      Object.assign(progress.progress, progressUpdate);
      Object.assign(progress.throughput, throughputUpdate);
    }
  }

  /**
   * Update recovery status
   */
  private updateRecoveryStatus(recoveryId: string, status: RecoveryStatus): void {
    const recovery = this.recoveryMetadata.get(recoveryId);
    if (recovery) {
      recovery.status = status;
    }

    const activeRecovery = this.activeRecoveries.get(recoveryId);
    if (activeRecovery) {
      activeRecovery.status = status;
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get backup summary
   */
  getBackupSummary(): {
    totalBackups: number;
    completedBackups: number;
    totalSize: number;
    totalEvents: number;
    oldestBackup?: number;
    newestBackup?: number;
  } {
    const backups = Array.from(this.backupMetadata.values());
    const completedBackups = backups.filter(b => b.status === BackupStatus.COMPLETED || b.status === BackupStatus.VERIFIED);
    
    return {
      totalBackups: backups.length,
      completedBackups: completedBackups.length,
      totalSize: completedBackups.reduce((sum, b) => sum + b.size, 0),
      totalEvents: completedBackups.reduce((sum, b) => sum + b.eventCount, 0),
      oldestBackup: backups.length > 0 ? Math.min(...backups.map(b => b.createdAt)) : undefined,
      newestBackup: backups.length > 0 ? Math.max(...backups.map(b => b.createdAt)) : undefined
    };
  }
}

export default BackupRecoverySystem;