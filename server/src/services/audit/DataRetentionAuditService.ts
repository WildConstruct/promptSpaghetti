// Data Retention Audit Service
// Task: E17-1753114396831-B13C0D - Create audit schema
// Epic: 19 - Security & Compliance Framework

import { Pool } from 'pg';
import { 
  DataRetentionAuditRecord, 
  DataSubjectRightsAuditRecord, 
  ComplianceMonitoringAuditRecord,
  DataRetentionAuditSummary,
  DataSubjectRightsSummary,
  ComplianceViolationsSummary,
  AuditExportOptions,
  AuditExportResult,
  AuditConfiguration
} from '../../types/audit';

export class DataRetentionAuditService {
  constructor(private db: Pool) {}

  // Data Retention Audit Methods

  async logDataRetentionOperation(audit: Partial<DataRetentionAuditRecord>): Promise<string> {
    const query = `
      INSERT INTO data_retention_audit (
        operation_id, correlation_id, operation_type, operation_status,
        initiated_by_user_id, initiated_by_system_component, affected_user_id, affected_data_subject_id,
        target_data_type, target_table_name, target_record_ids, target_data_classification, target_data_sensitivity,
        retention_policy_id, retention_policy_name, retention_period_days, deletion_method,
        legal_basis, compliance_framework, is_subject_request, request_reference, legal_hold_applied, data_processing_purpose,
        records_processed, records_deleted, records_archived, records_anonymized, records_failed,
        data_volume_bytes, execution_duration_ms,
        validation_checks_passed, validation_checks_failed, integrity_hash, backup_location,
        error_code, error_message, error_details, retry_count, exception_granted, exception_reason,
        privacy_impact_assessment_ref, data_protection_measures, risk_assessment, mitigation_actions,
        audit_retention_period, archive_after_days, permanent_retention,
        system_context, user_agent, ip_address, geographic_location, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38,
        $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53
      ) RETURNING id
    `;

    const values = [
      audit.operationId || crypto.randomUUID(),
      audit.correlationId,
      audit.operationType,
      audit.operationStatus || 'INITIATED',
      audit.initiatedByUserId,
      audit.initiatedBySystemComponent,
      audit.affectedUserId,
      audit.affectedDataSubjectId,
      audit.targetDataType,
      audit.targetTableName,
      JSON.stringify(audit.targetRecordIds || []),
      audit.targetDataClassification,
      audit.targetDataSensitivity,
      audit.retentionPolicyId,
      audit.retentionPolicyName,
      audit.retentionPeriodDays,
      audit.deletionMethod,
      audit.legalBasis,
      audit.complianceFramework,
      audit.isSubjectRequest || false,
      audit.requestReference,
      audit.legalHoldApplied || false,
      JSON.stringify(audit.dataProcessingPurpose || []),
      audit.recordsProcessed || 0,
      audit.recordsDeleted || 0,
      audit.recordsArchived || 0,
      audit.recordsAnonymized || 0,
      audit.recordsFailed || 0,
      audit.dataVolumeBytes,
      audit.executionDurationMs,
      JSON.stringify(audit.validationChecksPassed || []),
      JSON.stringify(audit.validationChecksFailed || []),
      audit.integrityHash,
      audit.backupLocation,
      audit.errorCode,
      audit.errorMessage,
      JSON.stringify(audit.errorDetails || {}),
      audit.retryCount || 0,
      audit.exceptionGranted || false,
      audit.exceptionReason,
      audit.privacyImpactAssessmentRef,
      JSON.stringify(audit.dataProtectionMeasures || []),
      audit.riskAssessment,
      JSON.stringify(audit.mitigationActions || []),
      audit.auditRetentionPeriod || 2555, // 7 years
      audit.archiveAfterDays || 365,
      audit.permanentRetention || false,
      JSON.stringify(audit.systemContext || {}),
      audit.userAgent,
      audit.ipAddress,
      audit.geographicLocation,
      JSON.stringify(audit.metadata || {})
    ];

    try {
      const result = await this.db.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('Error logging data retention audit:', error);
      throw new Error('Failed to log audit record');
    }
  }

  async updateDataRetentionOperation(auditId: string, updates: Partial<DataRetentionAuditRecord>): Promise<void> {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updates.operationStatus) {
      setClause.push(`operation_status = $${paramIndex++}`);
      values.push(updates.operationStatus);
    }
    if (updates.recordsProcessed !== undefined) {
      setClause.push(`records_processed = $${paramIndex++}`);
      values.push(updates.recordsProcessed);
    }
    if (updates.recordsDeleted !== undefined) {
      setClause.push(`records_deleted = $${paramIndex++}`);
      values.push(updates.recordsDeleted);
    }
    if (updates.recordsArchived !== undefined) {
      setClause.push(`records_archived = $${paramIndex++}`);
      values.push(updates.recordsArchived);
    }
    if (updates.executionDurationMs !== undefined) {
      setClause.push(`execution_duration_ms = $${paramIndex++}`);
      values.push(updates.executionDurationMs);
    }
    if (updates.errorCode) {
      setClause.push(`error_code = $${paramIndex++}`);
      values.push(updates.errorCode);
    }
    if (updates.errorMessage) {
      setClause.push(`error_message = $${paramIndex++}`);
      values.push(updates.errorMessage);
    }
    if (updates.complianceVerified !== undefined) {
      setClause.push(`compliance_verified = $${paramIndex++}`);
      values.push(updates.complianceVerified);
    }

    if (setClause.length === 0) {
      return; // No updates to make
    }

    const query = `
      UPDATE data_retention_audit 
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
    `;
    values.push(auditId);

    try {
      await this.db.query(query, values);
    } catch (error) {
      console.error('Error updating data retention audit:', error);
      throw new Error('Failed to update audit record');
    }
  }

  // Data Subject Rights Audit Methods

  async logDataSubjectRightsRequest(audit: Partial<DataSubjectRightsAuditRecord>): Promise<string> {
    const query = `
      INSERT INTO data_subject_rights_audit (
        request_id, data_subject_id, data_subject_email, data_subject_identifier,
        request_type, request_status, request_method, received_date, due_date,
        processor_user_id, reviewer_user_id, legal_basis, processing_lawfulness,
        identity_verified, identity_verification_method, data_categories_affected,
        systems_affected, third_parties_notified, data_volume_affected_bytes,
        escalation_required, escalation_reason, compliance_risk_level,
        supporting_documents, communication_log, audit_notes, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
      ) RETURNING id
    `;

    const values = [
      audit.requestId || crypto.randomUUID(),
      audit.dataSubjectId,
      audit.dataSubjectEmail,
      audit.dataSubjectIdentifier,
      audit.requestType,
      audit.requestStatus || 'RECEIVED',
      audit.requestMethod,
      audit.receivedDate || new Date(),
      audit.dueDate,
      audit.processorUserId,
      audit.reviewerUserId,
      audit.legalBasis,
      JSON.stringify(audit.processingLawfulness || []),
      audit.identityVerified || false,
      audit.identityVerificationMethod,
      JSON.stringify(audit.dataCategoriesAffected || []),
      JSON.stringify(audit.systemsAffected || []),
      JSON.stringify(audit.thirdPartiesNotified || []),
      audit.dataVolumeAffectedBytes,
      audit.escalationRequired || false,
      audit.escalationReason,
      audit.complianceRiskLevel,
      JSON.stringify(audit.supportingDocuments || []),
      JSON.stringify(audit.communicationLog || []),
      audit.auditNotes,
      JSON.stringify(audit.metadata || {})
    ];

    try {
      const result = await this.db.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('Error logging data subject rights audit:', error);
      throw new Error('Failed to log audit record');
    }
  }

  // Compliance Monitoring Audit Methods

  async logComplianceMonitoringEvent(audit: Partial<ComplianceMonitoringAuditRecord>): Promise<string> {
    const query = `
      INSERT INTO compliance_monitoring_audit (
        monitoring_event_id, compliance_framework, monitoring_type, scope_description,
        systems_monitored, data_types_monitored, monitoring_period_start, monitoring_period_end,
        compliance_status, violations_detected, violations_severity, violations_details,
        risk_score, risk_factors, potential_impact, likelihood_assessment,
        remediation_required, remediation_actions, remediation_timeline, remediation_status,
        authorities_notified, notification_required, notification_timeline, breach_notification_sent,
        performed_by_user_id, performed_by_system, monitoring_tool, evidence_collected,
        assessment_report_location, supporting_evidence, recommendations,
        follow_up_required, follow_up_date, follow_up_completed, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35
      ) RETURNING id
    `;

    const values = [
      audit.monitoringEventId || crypto.randomUUID(),
      audit.complianceFramework,
      audit.monitoringType,
      audit.scopeDescription,
      JSON.stringify(audit.systemsMonitored || []),
      JSON.stringify(audit.dataTypesMonitored || []),
      audit.monitoringPeriodStart,
      audit.monitoringPeriodEnd,
      audit.complianceStatus,
      audit.violationsDetected || 0,
      audit.violationsSeverity,
      JSON.stringify(audit.violationsDetails || []),
      audit.riskScore,
      JSON.stringify(audit.riskFactors || []),
      audit.potentialImpact,
      audit.likelihoodAssessment,
      audit.remediationRequired || false,
      JSON.stringify(audit.remediationActions || []),
      audit.remediationTimeline,
      audit.remediationStatus,
      JSON.stringify(audit.authoritiesNotified || []),
      audit.notificationRequired || false,
      audit.notificationTimeline,
      audit.breachNotificationSent || false,
      audit.performedByUserId,
      audit.performedBySystem,
      audit.monitoringTool,
      JSON.stringify(audit.evidenceCollected || []),
      audit.assessmentReportLocation,
      JSON.stringify(audit.supportingEvidence || []),
      JSON.stringify(audit.recommendations || []),
      audit.followUpRequired || false,
      audit.followUpDate,
      audit.followUpCompleted || false,
      JSON.stringify(audit.metadata || {})
    ];

    try {
      const result = await this.db.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('Error logging compliance monitoring audit:', error);
      throw new Error('Failed to log audit record');
    }
  }

  // Query and Reporting Methods

  async getDataRetentionAuditSummary(
    startDate?: Date,
    endDate?: Date,
    complianceFramework?: string
  ): Promise<DataRetentionAuditSummary[]> {
    let query = 'SELECT * FROM data_retention_audit_summary WHERE 1=1';
    const values: unknown[] = [];
    let paramIndex = 1;

    if (startDate) {
      query += ` AND audit_date >= $${paramIndex++}`;
      values.push(startDate);
    }
    if (endDate) {
      query += ` AND audit_date <= $${paramIndex++}`;
      values.push(endDate);
    }
    if (complianceFramework) {
      query += ` AND compliance_framework = $${paramIndex++}`;
      values.push(complianceFramework);
    }

    query += ' ORDER BY audit_date DESC';

    try {
      const result = await this.db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching audit summary:', error);
      throw new Error('Failed to fetch audit summary');
    }
  }

  async getDataSubjectRightsSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<DataSubjectRightsSummary[]> {
    let query = 'SELECT * FROM data_subject_rights_summary WHERE 1=1';
    const values: unknown[] = [];
    let paramIndex = 1;

    if (startDate) {
      query += ` AND request_month >= $${paramIndex++}`;
      values.push(startDate);
    }
    if (endDate) {
      query += ` AND request_month <= $${paramIndex++}`;
      values.push(endDate);
    }

    query += ' ORDER BY request_month DESC';

    try {
      const result = await this.db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching subject rights summary:', error);
      throw new Error('Failed to fetch subject rights summary');
    }
  }

  async getComplianceViolationsSummary(): Promise<ComplianceViolationsSummary[]> {
    const query = 'SELECT * FROM compliance_violations_summary ORDER BY compliance_framework';

    try {
      const result = await this.db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching compliance violations summary:', error);
      throw new Error('Failed to fetch compliance violations summary');
    }
  }

  async exportAuditData(options: AuditExportOptions): Promise<AuditExportResult[]> {
    const query = 'SELECT * FROM export_audit_data($1, $2, $3, $4)';
    const values = [
      options.startDate,
      options.endDate,
      options.complianceFramework,
      options.operationType
    ];

    try {
      const result = await this.db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error exporting audit data:', error);
      throw new Error('Failed to export audit data');
    }
  }

  // Integrity and Maintenance Methods

  async verifyAuditIntegrity(auditId: string): Promise<boolean> {
    const query = `
      SELECT audit_trail_hash, 
             generate_audit_trail_hash(id) as calculated_hash
      FROM data_retention_audit 
      WHERE id = $1
    `;

    try {
      const result = await this.db.query(query, [auditId]);
      if (result.rows.length === 0) {
        return false;
      }

      const { audit_trail_hash, calculated_hash } = result.rows[0];
      return audit_trail_hash === calculated_hash;
    } catch (error) {
      console.error('Error verifying audit integrity:', error);
      return false;
    }
  }

  async performAuditMaintenance(): Promise<{ deletedRecords: number }> {
    const query = 'SELECT cleanup_audit_data()';

    try {
      const result = await this.db.query(query);
      return { deletedRecords: result.rows[0].cleanup_audit_data };
    } catch (error) {
      console.error('Error performing audit maintenance:', error);
      throw new Error('Failed to perform audit maintenance');
    }
  }

  // Search and Filter Methods

  async searchAuditRecords(
    searchTerm: string,
    operationType?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<DataRetentionAuditRecord[]> {
    let query = `
      SELECT * FROM data_retention_audit 
      WHERE (
        target_data_type ILIKE $1 OR
        operation_type ILIKE $1 OR
        compliance_framework ILIKE $1 OR
        error_message ILIKE $1
      )
    `;
    const values: unknown[] = [`%${searchTerm}%`];
    let paramIndex = 2;

    if (operationType) {
      query += ` AND operation_type = $${paramIndex++}`;
      values.push(operationType);
    }
    if (startDate) {
      query += ` AND timestamp >= $${paramIndex++}`;
      values.push(startDate);
    }
    if (endDate) {
      query += ` AND timestamp <= $${paramIndex++}`;
      values.push(endDate);
    }

    query += ` ORDER BY timestamp DESC LIMIT $${paramIndex}`;
    values.push(limit);

    try {
      const result = await this.db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error searching audit records:', error);
      throw new Error('Failed to search audit records');
    }
  }

  async getAuditMetrics(): Promise<{
    totalOperations: number;
    operationsLast24h: number;
    failedOperationsLast24h: number;
    avgExecutionTime: number;
    complianceScore: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_operations,
        COUNT(CASE WHEN timestamp >= NOW() - INTERVAL '24 hours' THEN 1 END) as operations_last_24h,
        COUNT(CASE WHEN timestamp >= NOW() - INTERVAL '24 hours' AND operation_status = 'FAILED' THEN 1 END) as failed_operations_last_24h,
        AVG(execution_duration_ms) as avg_execution_time,
        (COUNT(CASE WHEN compliance_verified = TRUE THEN 1 END)::float / NULLIF(COUNT(*), 0) * 100) as compliance_score
      FROM data_retention_audit
      WHERE timestamp >= NOW() - INTERVAL '30 days'
    `;

    try {
      const result = await this.db.query(query);
      const row = result.rows[0];
      return {
        totalOperations: parseInt(row.total_operations) || 0,
        operationsLast24h: parseInt(row.operations_last_24h) || 0,
        failedOperationsLast24h: parseInt(row.failed_operations_last_24h) || 0,
        avgExecutionTime: parseFloat(row.avg_execution_time) || 0,
        complianceScore: parseFloat(row.compliance_score) || 0
      };
    } catch (error) {
      console.error('Error getting audit metrics:', error);
      throw new Error('Failed to get audit metrics');
    }
  }
}