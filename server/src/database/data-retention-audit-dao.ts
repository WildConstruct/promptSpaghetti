// Data Retention Audit Database Access Object
// Task: E17-1753114396831-B13C0D - Create audit schema
// Epic: 19 - Security & Compliance Framework

import { Pool, PoolClient } from 'pg';
import {
  DataRetentionAuditRecord,
  DataSubjectRightsAuditRecord,
  ComplianceMonitoringAuditRecord,
  DataRetentionOperationType,
  OperationStatus
 from '../types/audit';



export interface AuditQueryFilters {
  operationType?: DataRetentionOperationType;
  operationStatus?: OperationStatus;
  affectedUserId?: string;
  complianceFramework?: string;
  startDate?: Date;
  endDate?: Date;
  riskLevel?: string;
  limit?: number;
  offset?: number;





export class DataRetentionAuditDAO {
  constructor(private db: Pool) {}

  // Core CRUD Operations for Data Retention Audit

  async createDataRetentionAudit(
    audit: Omit<DataRetentionAuditRecord, 'id' | 'createdAt' | 'updatedAt'>,
    client?: PoolClient
  ): Promise<string> {

    const dbClient = client || this.db;
    
    const query = `
      INSERT INTO data_retention_audit (
        operation_id, correlation_id, operation_type, operation_status,
        initiated_by_user_id, initiated_by_system_component,
        affected_user_id, affected_data_subject_id,
        target_data_type, target_table_name, target_record_ids,
        target_data_classification, target_data_sensitivity,
        retention_policy_id, retention_policy_name, retention_period_days, deletion_method,
        legal_basis, compliance_framework, is_subject_request, request_reference,
        legal_hold_applied, data_processing_purpose,
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
      ) RETURNING id, created_at
    `;

    const values = this.mapDataRetentionAuditToParams(audit);

    try {
      const result = await dbClient.query(query, values);
      return result.rows[0].id;
 catch (error) {
      throw new Error(`Failed to create data retention audit: ${error}`);



  async updateDataRetentionAudit(
    id: string,
    updates: Partial<DataRetentionAuditRecord>,
    client?: PoolClient
  ): Promise<void> {

    const dbClient = client || this.db;
    
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query based on provided fields
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt') {
        const dbColumnName = this.camelToSnakeCase(key);
        
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          updateFields.push(`${dbColumnName} = $${paramIndex++}::jsonb`);
          values.push(JSON.stringify(value));
 else if (Array.isArray(value)) {
          updateFields.push(`${dbColumnName} = $${paramIndex++}::jsonb`);
          values.push(JSON.stringify(value));
 else {
          updateFields.push(`${dbColumnName} = $${paramIndex++}`);
          values.push(value);


    });

    if (updateFields.length === 0) {
      return; // Nothing to update


    updateFields.push('updated_at = NOW()');
    values.push(id);

    const query = `
      UPDATE data_retention_audit 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
    `;

    try {
      await dbClient.query(query, values);
 catch (error) {
      throw new Error(`Failed to update data retention audit: ${error}`);



  async getDataRetentionAuditById(id: string): Promise<DataRetentionAuditRecord | null> {

    const query = `
      SELECT * FROM data_retention_audit WHERE id = $1
    `;

    try {
      const result = await this.db.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToDataRetentionAudit(result.rows[0]) : null;
 catch (error) {
      throw new Error(`Failed to get data retention audit: ${error}`);



  async findDataRetentionAudits(filters: AuditQueryFilters): Promise<{
    audits: DataRetentionAuditRecord[];
    totalCount: number;
> {

    const whereConditions = [];
    const values = [];
    let paramIndex = 1;

    // Build WHERE clause based on filters
    if (filters.operationType) {
      whereConditions.push(`operation_type = $${paramIndex++}`);
      values.push(filters.operationType);

    if (filters.operationStatus) {
      whereConditions.push(`operation_status = $${paramIndex++}`);
      values.push(filters.operationStatus);

    if (filters.affectedUserId) {
      whereConditions.push(`affected_user_id = $${paramIndex++}`);
      values.push(filters.affectedUserId);

    if (filters.complianceFramework) {
      whereConditions.push(`compliance_framework = $${paramIndex++}`);
      values.push(filters.complianceFramework);

    if (filters.startDate) {
      whereConditions.push(`timestamp >= $${paramIndex++}`);
      values.push(filters.startDate);

    if (filters.endDate) {
      whereConditions.push(`timestamp <= $${paramIndex++}`);
      values.push(filters.endDate);

    if (filters.riskLevel) {
      whereConditions.push(`risk_assessment = $${paramIndex++}`);
      values.push(filters.riskLevel);


    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const limitClause = filters.limit ? `LIMIT $${paramIndex++}` : '';
    const offsetClause = filters.offset ? `OFFSET $${paramIndex++}` : '';

    if (filters.limit) values.push(filters.limit);
    if (filters.offset) values.push(filters.offset);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM data_retention_audit 
      ${whereClause}
    `;
    
    // Get actual records
    const dataQuery = `
      SELECT * FROM data_retention_audit 
      ${whereClause}
      ORDER BY timestamp DESC
      ${limitClause}
      ${offsetClause}
    `;

    try {
      const [countResult, dataResult] = await Promise.all([
        this.db.query(countQuery, values.slice(0, values.length - (filters.limit ? 1 : 0) - (filters.offset ? 1 : 0))),
        this.db.query(dataQuery, values)
      ]);

      return {
        audits: dataResult.rows.map(row => this.mapRowToDataRetentionAudit(row)),
        totalCount: parseInt(countResult.rows[0].total)
      };
 catch (error) {
      throw new Error(`Failed to find data retention audits: ${error}`);



  async getAuditStatistics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    totalAudits: number;
    completedOperations: number;
    failedOperations: number;
    avgExecutionTime: number;
> {

    const intervalMap = {
      day: '1 day',
      week: '1 week',
      month: '1 month'
    };

    const query = `
      SELECT 
        COUNT(*) as total_audits,
        COUNT(CASE WHEN operation_status = 'COMPLETED' THEN 1 END) as completed_operations,
        COUNT(CASE WHEN operation_status = 'FAILED' THEN 1 END) as failed_operations,
        AVG(execution_duration_ms) as avg_execution_time
      FROM data_retention_audit
      WHERE timestamp >= NOW() - INTERVAL '${intervalMap[timeframe]}'
    `;

    try {
      const result = await this.db.query(query);
      const row = result.rows[0];
      return {
        totalAudits: parseInt(row.total_audits) || 0,
        completedOperations: parseInt(row.completed_operations) || 0,
        failedOperations: parseInt(row.failed_operations) || 0,
        avgExecutionTime: parseFloat(row.avg_execution_time) || 0
      };
 catch (error) {
      throw new Error(`Failed to get audit statistics: ${error}`);



  // Data Subject Rights Audit Operations

  async createDataSubjectRightsAudit(
    audit: Omit<DataSubjectRightsAuditRecord, 'id' | 'createdAt' | 'updatedAt'>,
    client?: PoolClient
  ): Promise<string> {

    const dbClient = client || this.db;
    
    const query = `
      INSERT INTO data_subject_rights_audit (
        request_id, data_subject_id, data_subject_email, data_subject_identifier,
        request_type, request_status, request_method, received_date, due_date,
        processor_user_id, reviewer_user_id, legal_basis, processing_lawfulness,
        rejection_reason, identity_verified, identity_verification_method,
        data_categories_affected, systems_affected, third_parties_notified, data_volume_affected_bytes,
        response_method, response_format, data_delivered_date, delivery_confirmation, delivery_tracking_ref,
        regulatory_deadline_met, escalation_required, escalation_reason, compliance_risk_level,
        supporting_documents, communication_log, audit_notes, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33
      ) RETURNING id, created_at
    `;

    const values = this.mapDataSubjectRightsAuditToParams(audit);

    try {
      const result = await dbClient.query(query, values);
      return result.rows[0].id;
 catch (error) {
      throw new Error(`Failed to create data subject rights audit: ${error}`);



  // Compliance Monitoring Audit Operations

  async createComplianceMonitoringAudit(
    audit: Omit<ComplianceMonitoringAuditRecord, 'id' | 'createdAt' | 'updatedAt'>,
    client?: PoolClient
  ): Promise<string> {

    const dbClient = client || this.db;
    
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
      ) RETURNING id, created_at
    `;

    const values = this.mapComplianceMonitoringAuditToParams(audit);

    try {
      const result = await dbClient.query(query, values);
      return result.rows[0].id;
 catch (error) {
      throw new Error(`Failed to create compliance monitoring audit: ${error}`);



  // Private Helper Methods

  private mapDataRetentionAuditToParams(audit: Omit<DataRetentionAuditRecord, 'id' | 'createdAt' | 'updatedAt'>): unknown[] {
    return [
      audit.operationId,
      audit.correlationId,
      audit.operationType,
      audit.operationStatus,
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
      audit.isSubjectRequest,
      audit.requestReference,
      audit.legalHoldApplied,
      JSON.stringify(audit.dataProcessingPurpose || []),
      audit.recordsProcessed,
      audit.recordsDeleted,
      audit.recordsArchived,
      audit.recordsAnonymized,
      audit.recordsFailed,
      audit.dataVolumeBytes,
      audit.executionDurationMs,
      JSON.stringify(audit.validationChecksPassed || []),
      JSON.stringify(audit.validationChecksFailed || []),
      audit.integrityHash,
      audit.backupLocation,
      audit.errorCode,
      audit.errorMessage,
      JSON.stringify(audit.errorDetails || {}),
      audit.retryCount,
      audit.exceptionGranted,
      audit.exceptionReason,
      audit.privacyImpactAssessmentRef,
      JSON.stringify(audit.dataProtectionMeasures || []),
      audit.riskAssessment,
      JSON.stringify(audit.mitigationActions || []),
      audit.auditRetentionPeriod,
      audit.archiveAfterDays,
      audit.permanentRetention,
      JSON.stringify(audit.systemContext || {}),
      audit.userAgent,
      audit.ipAddress,
      audit.geographicLocation,
      JSON.stringify(audit.metadata || {})
    ];


  private mapDataSubjectRightsAuditToParams(audit: Omit<DataSubjectRightsAuditRecord, 'id' | 'createdAt' | 'updatedAt'>): unknown[] {
    return [
      audit.requestId,
      audit.dataSubjectId,
      audit.dataSubjectEmail,
      audit.dataSubjectIdentifier,
      audit.requestType,
      audit.requestStatus,
      audit.requestMethod,
      audit.receivedDate,
      audit.dueDate,
      audit.processorUserId,
      audit.reviewerUserId,
      audit.legalBasis,
      JSON.stringify(audit.processingLawfulness || []),
      audit.rejectionReason,
      audit.identityVerified,
      audit.identityVerificationMethod,
      JSON.stringify(audit.dataCategoriesAffected || []),
      JSON.stringify(audit.systemsAffected || []),
      JSON.stringify(audit.thirdPartiesNotified || []),
      audit.dataVolumeAffectedBytes,
      audit.responseMethod,
      audit.responseFormat,
      audit.dataDeliveredDate,
      audit.deliveryConfirmation,
      audit.deliveryTrackingRef,
      audit.regulatoryDeadlineMet,
      audit.escalationRequired,
      audit.escalationReason,
      audit.complianceRiskLevel,
      JSON.stringify(audit.supportingDocuments || []),
      JSON.stringify(audit.communicationLog || []),
      audit.auditNotes,
      JSON.stringify(audit.metadata || {})
    ];


  private mapComplianceMonitoringAuditToParams(audit: Omit<ComplianceMonitoringAuditRecord, 'id' | 'createdAt' | 'updatedAt'>): unknown[] {
    return [
      audit.monitoringEventId,
      audit.complianceFramework,
      audit.monitoringType,
      audit.scopeDescription,
      JSON.stringify(audit.systemsMonitored || []),
      JSON.stringify(audit.dataTypesMonitored || []),
      audit.monitoringPeriodStart,
      audit.monitoringPeriodEnd,
      audit.complianceStatus,
      audit.violationsDetected,
      audit.violationsSeverity,
      JSON.stringify(audit.violationsDetails || []),
      audit.riskScore,
      JSON.stringify(audit.riskFactors || []),
      audit.potentialImpact,
      audit.likelihoodAssessment,
      audit.remediationRequired,
      JSON.stringify(audit.remediationActions || []),
      audit.remediationTimeline,
      audit.remediationStatus,
      JSON.stringify(audit.authoritiesNotified || []),
      audit.notificationRequired,
      audit.notificationTimeline,
      audit.breachNotificationSent,
      audit.performedByUserId,
      audit.performedBySystem,
      audit.monitoringTool,
      JSON.stringify(audit.evidenceCollected || []),
      audit.assessmentReportLocation,
      JSON.stringify(audit.supportingEvidence || []),
      JSON.stringify(audit.recommendations || []),
      audit.followUpRequired,
      audit.followUpDate,
      audit.followUpCompleted,
      JSON.stringify(audit.metadata || {})
    ];


  private mapRowToDataRetentionAudit(row: unknown): DataRetentionAuditRecord {
    return {
      id: row.id,
      timestamp: row.timestamp,
      operationId: row.operation_id,
      correlationId: row.correlation_id,
      operationType: row.operation_type,
      operationStatus: row.operation_status,
      initiatedByUserId: row.initiated_by_user_id,
      initiatedBySystemComponent: row.initiated_by_system_component,
      affectedUserId: row.affected_user_id,
      affectedDataSubjectId: row.affected_data_subject_id,
      targetDataType: row.target_data_type,
      targetTableName: row.target_table_name,
      targetRecordIds: row.target_record_ids || [],
      targetDataClassification: row.target_data_classification,
      targetDataSensitivity: row.target_data_sensitivity,
      retentionPolicyId: row.retention_policy_id,
      retentionPolicyName: row.retention_policy_name,
      retentionPeriodDays: row.retention_period_days,
      deletionMethod: row.deletion_method,
      legalBasis: row.legal_basis,
      complianceFramework: row.compliance_framework,
      isSubjectRequest: row.is_subject_request,
      requestReference: row.request_reference,
      legalHoldApplied: row.legal_hold_applied,
      dataProcessingPurpose: row.data_processing_purpose || [],
      recordsProcessed: row.records_processed,
      recordsDeleted: row.records_deleted,
      recordsArchived: row.records_archived,
      recordsAnonymized: row.records_anonymized,
      recordsFailed: row.records_failed,
      dataVolumeBytes: row.data_volume_bytes,
      executionDurationMs: row.execution_duration_ms,
      validationChecksPassed: row.validation_checks_passed || [],
      validationChecksFailed: row.validation_checks_failed || [],
      integrityHash: row.integrity_hash,
      backupLocation: row.backup_location,
      errorCode: row.error_code,
      errorMessage: row.error_message,
      errorDetails: row.error_details || {},
      retryCount: row.retry_count,
      exceptionGranted: row.exception_granted,
      exceptionReason: row.exception_reason,
      auditTrailHash: row.audit_trail_hash,
      previousAuditHash: row.previous_audit_hash,
      complianceVerified: row.compliance_verified,
      complianceVerificationDate: row.compliance_verification_date,
      complianceVerifierId: row.compliance_verifier_id,
      privacyImpactAssessmentRef: row.privacy_impact_assessment_ref,
      dataProtectionMeasures: row.data_protection_measures || [],
      riskAssessment: row.risk_assessment,
      mitigationActions: row.mitigation_actions || [],
      auditRetentionPeriod: row.audit_retention_period,
      archiveAfterDays: row.archive_after_days,
      permanentRetention: row.permanent_retention,
      systemContext: row.system_context || {},
      userAgent: row.user_agent,
      ipAddress: row.ip_address,
      geographicLocation: row.geographic_location,
      metadata: row.metadata || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };


  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

