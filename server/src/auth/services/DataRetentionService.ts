/**
 * Data Retention Service
 * 
 * Comprehensive data retention controls for user data management.
 * Handles data lifecycle management, GDPR compliance, and automated cleanup.
 * 
 * Features:
 * - Configurable retention policies by data type
 * - Automated data expiration and cleanup
 * - Soft/hard deletion options
 * - Data export for compliance
 * - Audit logging for retention activities
 */

import { Database } from '../database/DatabaseService';
import { AuditService } from './AuditService';

export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  dataTypes: DataType[];
  retentionPeriod: number; // Days
  deleteType: 'soft' | 'hard' | 'archive';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataType {
  type: string;
  category: 'user_data' | 'session_data' | 'audit_log' | 'analytics' | 'system_data';
  description: string;
  required: boolean; // Cannot be deleted
  sensitive: boolean; // Requires special handling
}

export interface RetentionSchedule {
  policyId: string;
  scheduledAt: Date;
  executedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsDeleted: number;
  errors?: string[];
}

export interface DataExportRequest {
  id: string;
  userId: string;
  requestedBy: string;
  purpose: 'user_request' | 'legal_hold' | 'compliance' | 'migration';
  dataTypes: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  exportUrl?: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface RetentionReport {
  periodStart: Date;
  periodEnd: Date;
  policiesExecuted: number;
  recordsProcessed: number;
  recordsDeleted: number;
  dataTypesProcessed: string[];
  storageFreed: number; // Bytes
  errors: string[];
  executionTime: number; // Milliseconds
}

// Default data types in the system
export const DEFAULT_DATA_TYPES: DataType[] = [
  {
    type: 'user_account',
    category: 'user_data',
    description: 'User account information (email, profile)',
    required: false,
    sensitive: true
  },
  {
    type: 'authentication_logs',
    category: 'audit_log',
    description: 'Login/logout and authentication events',
    required: false,
    sensitive: true
  },
  {
    type: 'session_data',
    category: 'session_data',
    description: 'User session tokens and state',
    required: false,
    sensitive: true
  },
  {
    type: 'project_data',
    category: 'user_data',
    description: 'User-created projects and graphs',
    required: false,
    sensitive: false
  },
  {
    type: 'usage_analytics',
    category: 'analytics',
    description: 'User behavior and usage statistics',
    required: false,
    sensitive: false
  },
  {
    type: 'error_logs',
    category: 'system_data',
    description: 'Application error logs and diagnostics',
    required: true,
    sensitive: false
  },
  {
    type: 'audit_trails',
    category: 'audit_log',
    description: 'System audit and compliance logs',
    required: true,
    sensitive: true
  }
];

// Default retention policies for GDPR compliance
export const DEFAULT_RETENTION_POLICIES: Omit<RetentionPolicy, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'User Data - Standard',
    description: 'Standard retention for active user data (GDPR compliant)',
    dataTypes: [
      DEFAULT_DATA_TYPES.find(t => t.type === 'user_account')!,
      DEFAULT_DATA_TYPES.find(t => t.type === 'project_data')!
    ],
    retentionPeriod: 1095, // 3 years
    deleteType: 'soft',
    isActive: true
  },
  {
    name: 'Session Data - Short Term',
    description: 'Short-term retention for session and temporary data',
    dataTypes: [
      DEFAULT_DATA_TYPES.find(t => t.type === 'session_data')!
    ],
    retentionPeriod: 90, // 3 months
    deleteType: 'hard',
    isActive: true
  },
  {
    name: 'Analytics - Medium Term',
    description: 'Analytics data retention for business insights',
    dataTypes: [
      DEFAULT_DATA_TYPES.find(t => t.type === 'usage_analytics')!
    ],
    retentionPeriod: 730, // 2 years
    deleteType: 'archive',
    isActive: true
  },
  {
    name: 'Authentication Logs - Security',
    description: 'Authentication logs for security and compliance',
    dataTypes: [
      DEFAULT_DATA_TYPES.find(t => t.type === 'authentication_logs')!
    ],
    retentionPeriod: 2555, // 7 years (compliance requirement)
    deleteType: 'archive',
    isActive: true
  },
  {
    name: 'Deleted User Cleanup',
    description: 'Hard delete soft-deleted user accounts after grace period',
    dataTypes: [
      DEFAULT_DATA_TYPES.find(t => t.type === 'user_account')!
    ],
    retentionPeriod: 30, // 30 days after soft delete
    deleteType: 'hard',
    isActive: true
  }
];

export class DataRetentionService {
  private db: Database;
  private auditService: AuditService;

  constructor(db: Database, auditService: AuditService) {
    this.db = db;
    this.auditService = auditService;
  }

  /**
   * Initialize retention policies with default values
   */
  async initializeDefaultPolicies(): Promise<void> {
    try {
      // Check if policies already exist
      const existingPolicies = await this.getRetentionPolicies();
      
      if (existingPolicies.length === 0) {
        // Install default policies
        for (const policyTemplate of DEFAULT_RETENTION_POLICIES) {
          await this.createRetentionPolicy(policyTemplate);
        }

        await this.auditService.logAction('system', 'data_retention', 'initialize', {
          policiesCreated: DEFAULT_RETENTION_POLICIES.length
        });
      }
    } catch (error) {
      throw new Error(`Failed to initialize default retention policies: ${error}`);
    }
  }

  /**
   * Create a new retention policy
   */
  async createRetentionPolicy(
    policy: Omit<RetentionPolicy, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RetentionPolicy> {
    const query = `
      INSERT INTO data_retention_policies 
      (name, description, data_types, retention_period_days, delete_type, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      policy.name,
      policy.description,
      JSON.stringify(policy.dataTypes),
      policy.retentionPeriod,
      policy.deleteType,
      policy.isActive
    ];

    const result = await this.db.query(query, values);
    const createdPolicy = result.rows[0];

    await this.auditService.logAction('system', 'data_retention', 'policy_created', {
      policyId: createdPolicy.id,
      name: policy.name,
      retentionPeriod: policy.retentionPeriod
    });

    return this.mapPolicyRow(createdPolicy);
  }

  /**
   * Get all retention policies
   */
  async getRetentionPolicies(activeOnly: boolean = false): Promise<RetentionPolicy[]> {
    const query = activeOnly
      ? 'SELECT * FROM data_retention_policies WHERE is_active = true ORDER BY created_at'
      : 'SELECT * FROM data_retention_policies ORDER BY created_at';

    const result = await this.db.query(query);
    return result.rows.map(row => this.mapPolicyRow(row));
  }

  /**
   * Update a retention policy
   */
  async updateRetentionPolicy(
    policyId: string,
    updates: Partial<Omit<RetentionPolicy, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<RetentionPolicy> {
    const fields = [];
    const values = [];
    let valueIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'dataTypes') {
        fields.push(`data_types = $${valueIndex}`);
        values.push(JSON.stringify(value));
      } else if (key === 'retentionPeriod') {
        fields.push(`retention_period_days = $${valueIndex}`);
        values.push(value);
      } else if (key === 'deleteType') {
        fields.push(`delete_type = $${valueIndex}`);
        values.push(value);
      } else if (key === 'isActive') {
        fields.push(`is_active = $${valueIndex}`);
        values.push(value);
      } else {
        fields.push(`${key} = $${valueIndex}`);
        values.push(value);
      }
      valueIndex++;
    });

    const query = `
      UPDATE data_retention_policies 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${valueIndex}
      RETURNING *
    `;
    values.push(policyId);

    const result = await this.db.query(query, values);
    const updatedPolicy = result.rows[0];

    await this.auditService.logAction('system', 'data_retention', 'policy_updated', {
      policyId,
      updates
    });

    return this.mapPolicyRow(updatedPolicy);
  }

  /**
   * Execute retention policies (cleanup expired data)
   */
  async executeRetentionPolicies(): Promise<RetentionReport> {
    const startTime = Date.now();
    const periodStart = new Date();
    let totalProcessed = 0;
    let totalDeleted = 0;
    const dataTypesProcessed: string[] = [];
    const errors: string[] = [];

    try {
      const activePolicies = await this.getRetentionPolicies(true);
      
      for (const policy of activePolicies) {
        try {
          const result = await this.executePolicy(policy);
          totalProcessed += result.recordsProcessed;
          totalDeleted += result.recordsDeleted;
          dataTypesProcessed.push(...policy.dataTypes.map(dt => dt.type));
          
          if (result.errors && result.errors.length > 0) {
            errors.push(...result.errors);
          }
        } catch (error) {
          errors.push(`Policy ${policy.id} failed: ${error}`);
        }
      }

      const report: RetentionReport = {
        periodStart,
        periodEnd: new Date(),
        policiesExecuted: activePolicies.length,
        recordsProcessed: totalProcessed,
        recordsDeleted: totalDeleted,
        dataTypesProcessed: [...new Set(dataTypesProcessed)],
        storageFreed: totalDeleted * 1024, // Estimate - 1KB per record
        errors,
        executionTime: Date.now() - startTime
      };

      await this.auditService.logAction('system', 'data_retention', 'execution_completed', report);

      return report;
    } catch (error) {
      errors.push(`Retention execution failed: ${error}`);
      
      const report: RetentionReport = {
        periodStart,
        periodEnd: new Date(),
        policiesExecuted: 0,
        recordsProcessed: totalProcessed,
        recordsDeleted: totalDeleted,
        dataTypesProcessed,
        storageFreed: 0,
        errors,
        executionTime: Date.now() - startTime
      };

      await this.auditService.logAction('system', 'data_retention', 'execution_failed', report);
      
      return report;
    }
  }

  /**
   * Execute a specific retention policy
   */
  private async executePolicy(policy: RetentionPolicy): Promise<{
    recordsProcessed: number;
    recordsDeleted: number;
    errors: string[];
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriod);
    
    let totalProcessed = 0;
    let totalDeleted = 0;
    const errors: string[] = [];

    for (const dataType of policy.dataTypes) {
      try {
        const result = await this.processDataType(dataType, cutoffDate, policy.deleteType);
        totalProcessed += result.processed;
        totalDeleted += result.deleted;
      } catch (error) {
        errors.push(`Failed to process ${dataType.type}: ${error}`);
      }
    }

    // Record the schedule execution
    await this.recordScheduleExecution(policy.id, totalProcessed, totalDeleted, errors);

    return {
      recordsProcessed: totalProcessed,
      recordsDeleted: totalDeleted,
      errors
    };
  }

  /**
   * Process a specific data type for retention
   */
  private async processDataType(
    dataType: DataType,
    cutoffDate: Date,
    deleteType: 'soft' | 'hard' | 'archive'
  ): Promise<{ processed: number; deleted: number }> {
    let processed = 0;
    let deleted = 0;

    switch (dataType.type) {
      case 'user_account':
        if (deleteType === 'soft') {
          // Soft delete inactive users
          const result = await this.db.query(`
            UPDATE users 
            SET deleted_at = NOW(), status = 'deleted'
            WHERE last_login_at < $1 
            AND deleted_at IS NULL 
            AND status = 'active'
            RETURNING id
          `, [cutoffDate]);
          processed = result.rowCount || 0;
          deleted = processed;
        } else if (deleteType === 'hard') {
          // Hard delete soft-deleted users past grace period
          const result = await this.db.query(`
            DELETE FROM users 
            WHERE deleted_at < $1 AND deleted_at IS NOT NULL
            RETURNING id
          `, [cutoffDate]);
          processed = result.rowCount || 0;
          deleted = processed;
        }
        break;

      case 'session_data':
        // Delete expired sessions
        const result = await this.db.query(`
          DELETE FROM user_sessions 
          WHERE expires_at < $1
          RETURNING id
        `, [cutoffDate]);
        processed = result.rowCount || 0;
        deleted = processed;
        break;

      case 'authentication_logs':
        if (deleteType === 'archive') {
          // Archive old authentication logs
          await this.archiveAuthenticationLogs(cutoffDate);
        } else if (deleteType === 'hard') {
          const result = await this.db.query(`
            DELETE FROM audit_logs 
            WHERE action_type = 'authentication' 
            AND created_at < $1
            RETURNING id
          `, [cutoffDate]);
          processed = result.rowCount || 0;
          deleted = processed;
        }
        break;

      case 'usage_analytics':
        // Archive or delete analytics data
        if (deleteType === 'archive') {
          await this.archiveAnalyticsData(cutoffDate);
        }
        break;

      case 'project_data':
        // Handle user project data
        const projectResult = await this.db.query(`
          UPDATE user_projects 
          SET deleted_at = NOW() 
          WHERE updated_at < $1 
          AND user_id IN (
            SELECT id FROM users WHERE deleted_at IS NOT NULL
          )
          AND deleted_at IS NULL
          RETURNING id
        `, [cutoffDate]);
        processed = projectResult.rowCount || 0;
        deleted = processed;
        break;
    }

    return { processed, deleted };
  }

  /**
   * Request data export for a user
   */
  async requestDataExport(
    userId: string,
    requestedBy: string,
    purpose: 'user_request' | 'legal_hold' | 'compliance' | 'migration',
    dataTypes: string[]
  ): Promise<DataExportRequest> {
    const exportRequest: Omit<DataExportRequest, 'id'> = {
      userId,
      requestedBy,
      purpose,
      dataTypes,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date()
    };

    const query = `
      INSERT INTO data_export_requests 
      (user_id, requested_by, purpose, data_types, status, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      exportRequest.userId,
      exportRequest.requestedBy,
      exportRequest.purpose,
      JSON.stringify(exportRequest.dataTypes),
      exportRequest.status,
      exportRequest.expiresAt
    ]);

    const created = result.rows[0];

    await this.auditService.logAction(requestedBy, 'data_export', 'request_created', {
      exportId: created.id,
      userId,
      purpose,
      dataTypes
    });

    // Start processing asynchronously
    this.processDataExport(created.id).catch(error => {
      console.error(`Data export processing failed for ${created.id}:`, error);
    });

    return {
      id: created.id,
      ...exportRequest
    };
  }

  /**
   * Process a data export request
   */
  private async processDataExport(exportId: string): Promise<void> {
    try {
      // Update status to processing
      await this.db.query(
        'UPDATE data_export_requests SET status = $1 WHERE id = $2',
        ['processing', exportId]
      );

      // Get export request details
      const result = await this.db.query(
        'SELECT * FROM data_export_requests WHERE id = $1',
        [exportId]
      );

      if (result.rows.length === 0) {
        throw new Error('Export request not found');
      }

      const exportRequest = result.rows[0];
      const dataTypes = JSON.parse(exportRequest.data_types);

      // Generate export data
      const exportData = await this.generateUserDataExport(exportRequest.user_id, dataTypes);
      
      // Store export (in production, would upload to secure storage)
      const exportUrl = await this.storeExportData(exportId, exportData);

      // Update request with completion
      await this.db.query(`
        UPDATE data_export_requests 
        SET status = $1, export_url = $2, updated_at = NOW()
        WHERE id = $3
      `, ['completed', exportUrl, exportId]);

      await this.auditService.logAction('system', 'data_export', 'export_completed', {
        exportId,
        userId: exportRequest.user_id,
        recordCount: exportData.recordCount
      });

    } catch (error) {
      // Mark as failed
      await this.db.query(
        'UPDATE data_export_requests SET status = $1 WHERE id = $2',
        ['failed', exportId]
      );

      await this.auditService.logAction('system', 'data_export', 'export_failed', {
        exportId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Generate user data export
   */
  private async generateUserDataExport(
    userId: string,
    dataTypes: string[]
  ): Promise<{ data: any; recordCount: number }> {
    const exportData: any = {};
    let recordCount = 0;

    for (const dataType of dataTypes) {
      switch (dataType) {
        case 'user_account':
          const userResult = await this.db.query(`
            SELECT email, created_at, last_login_at, status 
            FROM users WHERE id = $1
          `, [userId]);
          exportData.userAccount = userResult.rows[0];
          recordCount += userResult.rowCount || 0;
          break;

        case 'project_data':
          const projectResult = await this.db.query(`
            SELECT name, description, graph_data, created_at, updated_at
            FROM user_projects WHERE user_id = $1 AND deleted_at IS NULL
          `, [userId]);
          exportData.projects = projectResult.rows;
          recordCount += projectResult.rowCount || 0;
          break;

        case 'authentication_logs':
          const authResult = await this.db.query(`
            SELECT action, details, created_at 
            FROM audit_logs 
            WHERE user_id = $1 AND action_type = 'authentication'
            ORDER BY created_at DESC
          `, [userId]);
          exportData.authenticationLogs = authResult.rows;
          recordCount += authResult.rowCount || 0;
          break;
      }
    }

    return {
      data: {
        userId,
        exportedAt: new Date().toISOString(),
        dataTypes,
        ...exportData
      },
      recordCount
    };
  }

  /**
   * Archive authentication logs to separate table
   */
  private async archiveAuthenticationLogs(cutoffDate: Date): Promise<void> {
    // Move old logs to archive table
    await this.db.query(`
      INSERT INTO audit_logs_archive 
      SELECT * FROM audit_logs 
      WHERE action_type = 'authentication' AND created_at < $1
      ON CONFLICT (id) DO NOTHING
    `, [cutoffDate]);

    // Delete from main table
    await this.db.query(`
      DELETE FROM audit_logs 
      WHERE action_type = 'authentication' AND created_at < $1
    `, [cutoffDate]);
  }

  /**
   * Archive analytics data
   */
  private async archiveAnalyticsData(cutoffDate: Date): Promise<void> {
    // Implementation would move analytics data to cold storage
    // For now, just mark as archived
    await this.db.query(`
      UPDATE analytics_events 
      SET archived_at = NOW() 
      WHERE created_at < $1 AND archived_at IS NULL
    `, [cutoffDate]);
  }

  /**
   * Store export data (placeholder - would integrate with secure storage)
   */
  private async storeExportData(exportId: string, exportData: any): Promise<string> {
    // In production, would upload to S3/Azure/GCP with encryption
    // For now, return a placeholder URL
    return `https://exports.example.com/data/${exportId}.json`;
  }

  /**
   * Record retention schedule execution
   */
  private async recordScheduleExecution(
    policyId: string,
    recordsProcessed: number,
    recordsDeleted: number,
    errors: string[]
  ): Promise<void> {
    const query = `
      INSERT INTO retention_schedule_executions 
      (policy_id, executed_at, status, records_processed, records_deleted, errors)
      VALUES ($1, NOW(), $2, $3, $4, $5)
    `;

    const status = errors.length > 0 ? 'failed' : 'completed';

    await this.db.query(query, [
      policyId,
      status,
      recordsProcessed,
      recordsDeleted,
      JSON.stringify(errors)
    ]);
  }

  /**
   * Get retention execution history
   */
  async getRetentionHistory(limit: number = 50): Promise<RetentionSchedule[]> {
    const query = `
      SELECT 
        rse.*,
        drp.name as policy_name
      FROM retention_schedule_executions rse
      JOIN data_retention_policies drp ON rse.policy_id = drp.id
      ORDER BY rse.executed_at DESC
      LIMIT $1
    `;

    const result = await this.db.query(query, [limit]);
    return result.rows.map(row => ({
      policyId: row.policy_id,
      scheduledAt: row.executed_at,
      executedAt: row.executed_at,
      status: row.status,
      recordsProcessed: row.records_processed,
      recordsDeleted: row.records_deleted,
      errors: JSON.parse(row.errors || '[]')
    }));
  }

  /**
   * Map database row to RetentionPolicy
   */
  private mapPolicyRow(row: any): RetentionPolicy {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      dataTypes: JSON.parse(row.data_types),
      retentionPeriod: row.retention_period_days,
      deleteType: row.delete_type,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Schedule automatic retention policy execution
   */
  async scheduleAutomaticRetention(): Promise<void> {
    // This would integrate with a cron job system or task scheduler
    // For now, log that scheduling was requested
    await this.auditService.logAction('system', 'data_retention', 'schedule_configured', {
      frequency: 'daily',
      nextExecution: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
  }
}

export default DataRetentionService;