// Audit Logger Utility
// Task: E17-1753114396831-B13C0D - Create audit schema
// Epic: 19 - Security & Compliance Framework

import { DataRetentionAuditService } from '../services/audit/DataRetentionAuditService';
import { 
  DataRetentionOperationType, 
  OperationStatus, 
  DataRetentionAuditRecord,
  DataSubjectRightsAuditRecord,
  ComplianceMonitoringAuditRecord,
  RiskLevel,
  DeletionMethod
 from '../types/audit';



export interface AuditContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  correlationId?: string;
  systemComponent?: string;







export interface DataDeletionAuditOptions {
  affectedUserId?: string;
  targetDataType: string;
  targetTableName?: string;
  recordIds?: string[];
  retentionPolicyId?: string;
  retentionPolicyName?: string;
  deletionMethod?: DeletionMethod;
  complianceFramework?: string;
  isSubjectRequest?: boolean;
  legalBasis?: string;





export class AuditLogger {
  constructor(private auditService: DataRetentionAuditService) {}

  /**
   * Log a data retention operation audit event
   */
  async logDataRetentionOperation(
    operationType: DataRetentionOperationType,
    operationStatus: OperationStatus,
    options: DataDeletionAuditOptions,
    context: AuditContext,
    executionDetails?: {
      recordsProcessed?: number;
      recordsDeleted?: number;
      recordsArchived?: number;
      executionDurationMs?: number;
      errorCode?: string;
      errorMessage?: string;
    }
  ): Promise<string> {

    const auditRecord: Partial<DataRetentionAuditRecord> = {
      operationId: crypto.randomUUID(),
      correlationId: context.correlationId,
      operationType,
      operationStatus,
      
      // Context information
      initiatedByUserId: context.userId,
      initiatedBySystemComponent: context.systemComponent,
      affectedUserId: options.affectedUserId,
      
      // Target data information
      targetDataType: options.targetDataType,
      targetTableName: options.targetTableName,
      targetRecordIds: options.recordIds || [],
      
      // Policy information
      retentionPolicyId: options.retentionPolicyId,
      retentionPolicyName: options.retentionPolicyName,
      deletionMethod: options.deletionMethod,
      
      // Legal and compliance context
      legalBasis: options.legalBasis,
      complianceFramework: options.complianceFramework || 'GDPR',
      isSubjectRequest: options.isSubjectRequest || false,
      legalHoldApplied: false,
      dataProcessingPurpose: ['retention_policy_enforcement'],
      
      // Execution details
      recordsProcessed: executionDetails?.recordsProcessed || 0,
      recordsDeleted: executionDetails?.recordsDeleted || 0,
      recordsArchived: executionDetails?.recordsArchived || 0,
      recordsAnonymized: 0,
      recordsFailed: 0,
      executionDurationMs: executionDetails?.executionDurationMs,
      
      // Error information
      errorCode: executionDetails?.errorCode,
      errorMessage: executionDetails?.errorMessage,
      errorDetails: executionDetails?.errorCode ? {
        code: executionDetails.errorCode,
        message: executionDetails.errorMessage
 : {},
      retryCount: 0,
      exceptionGranted: false,
      
      // Audit metadata
      complianceVerified: false,
      riskAssessment: this.assessRisk(operationType, options),
      dataProtectionMeasures: this.getDataProtectionMeasures(operationType),
      mitigationActions: [],
      
      // Retention settings
      auditRetentionPeriod: 2555, // 7 years
      archiveAfterDays: 365,
      permanentRetention: options.isSubjectRequest || false,
      
      // System context
      systemContext: {
        environment: process.env.NODE_ENV || 'unknown',
        version: process.env.APP_VERSION || 'unknown',
        service: 'data-retention-service'

      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      metadata: {
        auditVersion: '1.0',
        schemaVersion: '048'

    };

    return await this.auditService.logDataRetentionOperation(auditRecord);


  /**
   * Log a data subject rights request
   */
  async logDataSubjectRightsRequest(
    requestType: 'ACCESS' | 'RECTIFICATION' | 'ERASURE' | 'RESTRICTION' | 'PORTABILITY' | 'OBJECTION' | 'CONSENT_WITHDRAWAL',
    dataSubjectId: string,
    dataSubjectEmail?: string,
    context: AuditContext,
    additionalDetails?: {
      legalBasis?: string;
      dataCategoriesAffected?: string[];
      systemsAffected?: string[];
      estimatedDataVolume?: number;
      dueDate?: Date;
    }
  ): Promise<string> {

    const auditRecord: Partial<DataSubjectRightsAuditRecord> = {
      requestId: crypto.randomUUID(),
      dataSubjectId,
      dataSubjectEmail,
      requestType,
      requestStatus: 'RECEIVED',
      requestMethod: 'API',
      receivedDate: new Date(),
      dueDate: additionalDetails?.dueDate || this.calculateDueDate(requestType),
      
      // Legal context
      legalBasis: additionalDetails?.legalBasis || 'GDPR Article ' + this.getGDPRArticle(requestType),
      processingLawfulness: ['consent', 'legitimate_interest'],
      identityVerified: false,
      
      // Data scope
      dataCategoriesAffected: additionalDetails?.dataCategoriesAffected || [],
      systemsAffected: additionalDetails?.systemsAffected || [],
      thirdPartiesNotified: [],
      dataVolumeAffectedBytes: additionalDetails?.estimatedDataVolume,
      
      // Compliance tracking
      escalationRequired: false,
      complianceRiskLevel: 'MEDIUM',
      
      // Documentation
      supportingDocuments: [],
      communicationLog: [{
        timestamp: new Date(),
        method: 'API',
        direction: 'INBOUND',
        summary: `${requestType} request received via API`,
        attachments: []
],
      
      metadata: {
        correlationId: context.correlationId,
        initiatedBy: context.userId,
        userAgent: context.userAgent,
        ipAddress: context.ipAddress

    };

    return await this.auditService.logDataSubjectRightsRequest(auditRecord);


  /**
   * Log a compliance monitoring event
   */
  async logComplianceMonitoringEvent(
    complianceFramework: string,
    monitoringType: 'AUTOMATED_SCAN' | 'MANUAL_REVIEW' | 'INCIDENT_INVESTIGATION' | 'REGULAR_ASSESSMENT' | 'BREACH_DETECTION' | 'POLICY_COMPLIANCE_CHECK',
    complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL' | 'UNKNOWN',
    context: AuditContext,
    monitoringDetails?: {
      scopeDescription?: string;
      systemsMonitored?: string[];
      dataTypesMonitored?: string[];
      violationsDetected?: number;
      violationsSeverity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      riskScore?: number;
      remediationRequired?: boolean;

  ): Promise<string> {

    const auditRecord: Partial<ComplianceMonitoringAuditRecord> = {
      monitoringEventId: crypto.randomUUID(),
      complianceFramework,
      monitoringType,
      
      // Scope information
      scopeDescription: monitoringDetails?.scopeDescription,
      systemsMonitored: monitoringDetails?.systemsMonitored || [],
      dataTypesMonitored: monitoringDetails?.dataTypesMonitored || [],
      monitoringPeriodStart: new Date(),
      monitoringPeriodEnd: new Date(),
      
      // Results
      complianceStatus,
      violationsDetected: monitoringDetails?.violationsDetected || 0,
      violationsSeverity: monitoringDetails?.violationsSeverity,
      violationsDetails: [],
      
      // Risk assessment
      riskScore: monitoringDetails?.riskScore,
      riskFactors: this.identifyRiskFactors(complianceStatus, monitoringDetails?.violationsDetected),
      potentialImpact: this.assessPotentialImpact(complianceStatus, monitoringDetails?.violationsSeverity),
      likelihoodAssessment: 'MEDIUM',
      
      // Remediation
      remediationRequired: monitoringDetails?.remediationRequired || complianceStatus === 'NON_COMPLIANT',
      remediationActions: [],
      remediationStatus: 'NOT_REQUIRED',
      
      // Notification
      authoritiesNotified: [],
      notificationRequired: monitoringDetails?.violationsSeverity === 'CRITICAL',
      breachNotificationSent: false,
      
      // Audit context
      performedByUserId: context.userId,
      performedBySystem: context.systemComponent || 'compliance-monitor',
      monitoringTool: 'internal-audit-system',
      evidenceCollected: [],
      
      // Follow-up
      followUpRequired: complianceStatus === 'NON_COMPLIANT',
      followUpCompleted: false,
      
      metadata: {
        correlationId: context.correlationId,
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
        monitoringTimestamp: new Date().toISOString()

    };

    return await this.auditService.logComplianceMonitoringEvent(auditRecord);


  /**
   * Update an existing audit record with execution results
   */
  async updateAuditWithResults(
    auditId: string,
    operationStatus: OperationStatus,
    results: {
      recordsProcessed?: number;
      recordsDeleted?: number;
      recordsArchived?: number;
      executionDurationMs?: number;
      errorCode?: string;
      errorMessage?: string;
      complianceVerified?: boolean;

  ): Promise<void> {

    await this.auditService.updateDataRetentionOperation(auditId, {
      operationStatus,
      recordsProcessed: results.recordsProcessed,
      recordsDeleted: results.recordsDeleted,
      recordsArchived: results.recordsArchived,
      executionDurationMs: results.executionDurationMs,
      errorCode: results.errorCode,
      errorMessage: results.errorMessage,
      complianceVerified: results.complianceVerified || false
    });


  // Helper Methods

  private assessRisk(operationType: DataRetentionOperationType, options: DataDeletionAuditOptions): RiskLevel {
    if (options.isSubjectRequest) return 'HIGH';
    if (operationType === 'DATA_DELETION') return 'MEDIUM';
    if (operationType === 'RIGHT_TO_ERASURE') return 'HIGH';
    return 'LOW';


  private getDataProtectionMeasures(operationType: DataRetentionOperationType): string[] {
    const measures = ['encryption_at_rest', 'access_control', 'audit_logging'];
    
    if (operationType === 'DATA_DELETION' || operationType === 'RIGHT_TO_ERASURE') {
      measures.push('secure_deletion', 'backup_verification');

    
    return measures;


  private calculateDueDate(requestType: string): Date {
    const dueDate = new Date();
    // GDPR requires response within 30 days (1 month)
    dueDate.setMonth(dueDate.getMonth() + 1);
    return dueDate;


  private getGDPRArticle(requestType: string): string {
    const articleMap: { [key: string]: string } = {
      'ACCESS': '15',
      'RECTIFICATION': '16', 
      'ERASURE': '17',
      'RESTRICTION': '18',
      'PORTABILITY': '20',
      'OBJECTION': '21',
      'CONSENT_WITHDRAWAL': '7'
    };
    return articleMap[requestType] || '15';


  private identifyRiskFactors(status: string, violations?: number): string[] {
    const factors = [];
    
    if (status === 'NON_COMPLIANT') {
      factors.push('compliance_violation');

    
    if (violations && violations > 0) {
      factors.push('policy_violations_detected');
      if (violations > 5) {
        factors.push('multiple_violations');


    
    return factors;


  private assessPotentialImpact(status: string, severity?: string): string {
    if (status === 'NON_COMPLIANT') {
      switch (severity) {
      case 'CRITICAL': return 'Regulatory fines, legal action, reputational damage';
      case 'HIGH': return 'Regulatory investigation, compliance penalties';
      case 'MEDIUM': return 'Warning notice, corrective action required';
      default: return 'Minor compliance gap, monitoring required';


    return 'No immediate impact identified';



// Factory function for creating audit logger instances
export function createAuditLogger(auditService: DataRetentionAuditService): AuditLogger {
  return new AuditLogger(auditService);


// Utility function to create audit context from request
export function createAuditContextFromRequest(req: any, correlationId?: string): AuditContext {
  return {
    userId: req.user?.id || req.headers['x-user-id'],
    sessionId: req.sessionID || req.headers['x-session-id'],
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip || req.connection.remoteAddress,
    correlationId: correlationId || crypto.randomUUID(),
    systemComponent: req.headers['x-component'] || 'api-server'
  };
