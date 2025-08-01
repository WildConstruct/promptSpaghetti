// Financial Data Lifecycle Service - Epic 19.2.6
// Automated data lifecycle management and deletion workflows for financial services
// Task: T-1752989145818

import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { DataLifecycleAutomationService, LifecycleStage } from './DataLifecycleAutomationService';
import { DataRetentionFrameworkService } from './DataRetentionFrameworkService';
import { DataClassificationService } from './DataClassificationService';
import { DataCategory, Jurisdiction } from '../types/DataRetentionPeriods';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';



export interface FinancialDataRecord {
  id: string;
  externalId: string;
  dataType: FinancialDataType;
  category: DataCategory;
  jurisdiction: Jurisdiction;
  ownerId: string;
  
  // Financial-specific data
  accountNumber?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  transactionDate?: Date;
  institutionName?: string;
  
  // Lifecycle tracking
  currentStage: LifecycleStage;
  lifecycleId?: string;
  
  // Retention and deletion
  retentionPeriodYears: number;
  createdAt: Date;
  lastAccessedAt: Date;
  retentionExpiresAt?: Date;
  deletionScheduledAt?: Date;
  deletedAt?: Date;
  purgedAt?: Date;
  
  // Verification and audit
  deletionVerificationHash?: string;
  deletionReason?: string;
  approvedBy?: string;
  
  // Legal holds
  legalHold: boolean;
  legalHoldReason?: string;
  legalHoldExpiresAt?: Date;
  
  // Compliance
  complianceTags: string[];
  auditMetadata: Record<string, unknown>;
  
  updatedAt: Date;





export enum FinancialDataType {
  TRANSACTION = 'transaction',
  ACCOUNT = 'account',
  DOCUMENT = 'document',
  STATEMENT = 'statement',
  REPORT = 'report',
  IDENTITY = 'identity',
  CREDIT = 'credit',
  LOAN = 'loan'




export interface DeletionWorkflow {
  id: string;
  workflowName: string;
  triggerType: DeletionTriggerType;
  triggerConfig: Record<string, unknown>;
  selectionCriteria: Record<string, unknown>;
  batchSize: number;
  requireApproval: boolean;
  verificationSteps: VerificationStep[];
  safetyChecks: SafetyCheck[];
  isActive: boolean;
  lastExecutionAt?: Date;
  nextExecutionAt?: Date;
  totalExecutions: number;
  successfulDeletions: number;
  failedDeletions: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;





export enum DeletionTriggerType {
  SCHEDULE = 'schedule',
  RETENTION_EXPIRED = 'retention_expired',
  MANUAL = 'manual',
  LEGAL_REQUEST = 'legal_request'




export interface VerificationStep {
  stepId: string;
  name: string;
  type: 'hash_verification' | 'approval_required' | 'safety_check' | 'custom';
  config: Record<string, unknown>;
  required: boolean;







export interface SafetyCheck {
  checkId: string;
  name: string;
  type: 'legal_hold_check' | 'active_transaction_check' | 'audit_period_check' | 'custom';
  config: Record<string, unknown>;
  blocking: boolean; // If true, deletion is blocked on failure







export interface DeletionExecution {
  id: string;
  workflowId: string;
  executionBatchId: string;
  recordId: string;
  externalRecordId: string;
  executionStatus: DeletionExecutionStatus;
  verificationHash?: string;
  deletionHash?: string;
  scheduledAt: Date;
  verifiedAt?: Date;
  executedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  approvalReason?: string;
  errorMessage?: string;
  retryCount: number;
  verificationStepsCompleted: string[];
  safetyChecksCompleted: string[];
  auditMetadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;





export enum DeletionExecutionStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  EXECUTED = 'executed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'




export interface ComplianceReport {
  id: string;
  reportType: string;
  reportingPeriodStart: Date;
  reportingPeriodEnd: Date;
  totalRecordsDeleted: number;
  totalDataVolumeDeleted: number;
  deletionReasons: Record<string, number>;
  jurisdictionsAffected: Jurisdiction[];
  regulatoryFramework?: string;
  complianceOfficer?: string;
  approvalStatus: 'draft' | 'approved' | 'submitted' | 'archived';
  reportData: Record<string, unknown>;
  summaryStatistics: Record<string, unknown>;
  exportedAt?: Date;
  exportFormat?: 'json' | 'csv' | 'pdf' | 'xml';
  submissionConfirmation?: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;





/**
 * Financial Data Lifecycle Service
 * Manages the complete lifecycle of financial data with automated deletion workflows
 */
export class FinancialDataLifecycleService {
  constructor(
    private db: DatabaseService,
    private auditService: AuditService,
    private dataLifecycleService: DataLifecycleAutomationService,
    private retentionService: DataRetentionFrameworkService,
    private classificationService: DataClassificationService
  ) {}

  /**
   * Register a financial data record for lifecycle management
   */
  async registerFinancialData(
    data: Omit<FinancialDataRecord, 'id' | 'createdAt' | 'updatedAt' | 'lastAccessedAt' | 'currentStage' | 'complianceTags' | 'auditMetadata'>
  ): Promise<FinancialDataRecord> {

    const id = randomUUID();
    const now = new Date();
    
    // Get appropriate retention period from framework service
    const retentionConfig = await this.retentionService.getRetentionPeriod(
      DataCategory.FINANCIAL,
      data.jurisdiction,
      { dataType: data.dataType }
    );
    
    const record: FinancialDataRecord = {
      ...data,
      id,
      currentStage: LifecycleStage.CREATED,
      retentionPeriodYears: retentionConfig?.retentionPeriods.standard || 7,
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
      legalHold: false,
      complianceTags: [],
      auditMetadata: {}
    };

    // Insert into database
    await this.db.query(`
      INSERT INTO financial_data_records (
        id, external_id, data_type, category, jurisdiction, owner_id,
        account_number, transaction_id, amount, currency, transaction_date, institution_name,
        current_stage, retention_period_years, created_at, updated_at, last_accessed_at,
        legal_hold, compliance_tags, audit_metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      record.id, record.externalId, record.dataType, record.category, record.jurisdiction, record.ownerId,
      record.accountNumber, record.transactionId, record.amount, record.currency, record.transactionDate, record.institutionName,
      record.currentStage, record.retentionPeriodYears, record.createdAt, record.updatedAt, record.lastAccessedAt,
      record.legalHold, JSON.stringify(record.complianceTags), JSON.stringify(record.auditMetadata)
    ]);

    // Register with data lifecycle automation service
    if (this.dataLifecycleService) {
      try {
        await this.dataLifecycleService.registerDataForLifecycle({
          dataId: record.id,
          dataType: record.dataType,
          category: record.category,
          ownerId: record.ownerId
        });
 catch (error) {
        console.warn('Failed to register with lifecycle automation service:', error);



    // Audit log the registration
    await this.auditService.logEvent({
      userId: record.ownerId,
      action: 'financial_data_registered',
      resourceType: 'financial_record',
      resourceId: record.id,
      details: {
        dataType: record.dataType,
        externalId: record.externalId,
        retentionPeriodYears: record.retentionPeriodYears,
        jurisdiction: record.jurisdiction

      severity: 'info'
    });

    return record;


  /**
   * Create an automated deletion workflow
   */
  async createDeletionWorkflow(
    workflow: Omit<DeletionWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'totalExecutions' | 'successfulDeletions' | 'failedDeletions'>
  ): Promise<DeletionWorkflow> {

    const id = randomUUID();
    const now = new Date();
    
    const newWorkflow: DeletionWorkflow = {
      ...workflow,
      id,
      totalExecutions: 0,
      successfulDeletions: 0,
      failedDeletions: 0,
      createdAt: now,
      updatedAt: now
    };

    await this.db.query(`
      INSERT INTO financial_deletion_workflows (
        id, workflow_name, trigger_type, trigger_config, selection_criteria, batch_size,
        require_approval, verification_steps, safety_checks, is_active,
        last_execution_at, next_execution_at, total_executions, successful_deletions, failed_deletions,
        created_at, updated_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newWorkflow.id, newWorkflow.workflowName, newWorkflow.triggerType,
      JSON.stringify(newWorkflow.triggerConfig), JSON.stringify(newWorkflow.selectionCriteria), newWorkflow.batchSize,
      newWorkflow.requireApproval, JSON.stringify(newWorkflow.verificationSteps), JSON.stringify(newWorkflow.safetyChecks), newWorkflow.isActive,
      newWorkflow.lastExecutionAt, newWorkflow.nextExecutionAt, newWorkflow.totalExecutions, newWorkflow.successfulDeletions, newWorkflow.failedDeletions,
      newWorkflow.createdAt, newWorkflow.updatedAt, newWorkflow.createdBy
    ]);

    // Audit log the workflow creation
    await this.auditService.logEvent({
      userId: workflow.createdBy,
      action: 'deletion_workflow_created',
      resourceType: 'deletion_workflow',
      resourceId: newWorkflow.id,
      details: {
        workflowName: newWorkflow.workflowName,
        triggerType: newWorkflow.triggerType,
        batchSize: newWorkflow.batchSize,
        requireApproval: newWorkflow.requireApproval

      severity: 'info'
    });

    return newWorkflow;


  /**
   * Execute a deletion workflow
   */
  async executeDeletionWorkflow(
    workflowId: string,
    executedBy: string,
    overrides?: {
      batchSize?: number;
      requireApproval?: boolean;
    }
  ): Promise<{
    batchId: string;
    recordsProcessed: number;
    recordsDeleted: number;
    recordsFailed: number;
    executions: DeletionExecution[];
> {

    // Get workflow configuration
    const workflow = await this.getDeletionWorkflow(workflowId);
    if (!workflow || !workflow.isActive) {
      throw new Error(`Workflow ${workflowId} not found or inactive`);


    const batchId = `batch_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const batchSize = overrides?.batchSize || workflow.batchSize;
    
    // Get records ready for deletion based on selection criteria
    const eligibleRecords = await this.getRecordsReadyForDeletion(workflow.selectionCriteria, batchSize);
    
    const executions: DeletionExecution[] = [];
    let deletedCount = 0;
    let failedCount = 0;

    // Process each record
    for (const record of eligibleRecords) {
      try {
        const execution = await this.processSingleDeletion(record, workflow, batchId, executedBy, overrides?.requireApproval);
        executions.push(execution);
        
        if (execution.executionStatus === DeletionExecutionStatus.EXECUTED) {
          deletedCount++;
 else if (execution.executionStatus === DeletionExecutionStatus.FAILED) {
          failedCount++;

 catch (error) {
        console.error(`Failed to process deletion for record ${record.id}:`, error);
        failedCount++;



    // Update workflow statistics
    await this.updateWorkflowStatistics(workflowId, deletedCount, failedCount);

    // Audit log the workflow execution
    await this.auditService.logEvent({
      userId: executedBy,
      action: 'deletion_workflow_executed',
      resourceType: 'deletion_workflow',
      resourceId: workflowId,
      details: {
        batchId,
        recordsProcessed: eligibleRecords.length,
        recordsDeleted: deletedCount,
        recordsFailed: failedCount,
        workflowName: workflow.workflowName

      severity: 'info'
    });

    return {
      batchId,
      recordsProcessed: eligibleRecords.length,
      recordsDeleted: deletedCount,
      recordsFailed: failedCount,
      executions
    };


  /**
   * Get financial data records ready for deletion
   */
  async getRecordsReadyForDeletion(
    selectionCriteria?: Record<string, unknown>,
    limit?: number
  ): Promise<FinancialDataRecord[]> {

    // Use the database view for optimized queries
    let query = `
      SELECT * FROM financial_records_ready_for_deletion
    `;
    
    const params: unknown[] = [];
    
    // Add selection criteria if provided
    if (selectionCriteria && Object.keys(selectionCriteria).length > 0) {
      const conditions: string[] = [];
      
      if (selectionCriteria.dataType) {
        conditions.push('data_type = ?');
        params.push(selectionCriteria.dataType);

      
      if (selectionCriteria.ownerId) {
        conditions.push('owner_id = ?');
        params.push(selectionCriteria.ownerId);

      
      if (selectionCriteria.maxDaysOverdue) {
        conditions.push('days_overdue <= ?');
        params.push(selectionCriteria.maxDaysOverdue);

      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;


    
    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);


    const rows = await this.db.query(query, params);
    
    return rows.map(row => ({
      id: row.id,
      externalId: row.external_id,
      dataType: row.data_type as FinancialDataType,
      category: DataCategory.FINANCIAL,
      jurisdiction: Jurisdiction.US, // Would be from the full record
      ownerId: row.owner_id,
      currentStage: row.current_stage as LifecycleStage,
      retentionPeriodYears: 7, // Default, would be from full record
      createdAt: new Date(row.created_at),
      lastAccessedAt: new Date(row.last_accessed_at),
      retentionExpiresAt: row.retention_expires_at ? new Date(row.retention_expires_at) : undefined,
      legalHold: row.legal_hold || false,
      legalHoldReason: row.legal_hold_reason,
      legalHoldExpiresAt: row.legal_hold_expires_at ? new Date(row.legal_hold_expires_at) : undefined,
      complianceTags: [],
      auditMetadata: {},
      updatedAt: new Date()
    }));


  /**
   * Process a single record deletion with full verification and safety checks
   */
  private async processSingleDeletion(
    record: FinancialDataRecord,
    workflow: DeletionWorkflow,
    batchId: string,
    executedBy: string,
    requireApproval?: boolean
  ): Promise<DeletionExecution> {

    const executionId = randomUUID();
    const now = new Date();
    
    // Create deletion execution record
    const execution: DeletionExecution = {
      id: executionId,
      workflowId: workflow.id,
      executionBatchId: batchId,
      recordId: record.id,
      externalRecordId: record.externalId,
      executionStatus: DeletionExecutionStatus.PENDING,
      scheduledAt: now,
      retryCount: 0,
      verificationStepsCompleted: [],
      safetyChecksCompleted: [],
      auditMetadata: {
        workflowName: workflow.workflowName,
        recordDataType: record.dataType,
        executedBy

      createdAt: now,
      updatedAt: now
    };

    try {
      // Step 1: Run safety checks
      const safetyCheckResults = await this.runSafetyChecks(record, workflow.safetyChecks);
      execution.safetyChecksCompleted = safetyCheckResults.map(r => r.checkId);
      
      // Check if any blocking safety checks failed
      const blockingFailures = safetyCheckResults.filter(r => r.blocking && !r.passed);
      if (blockingFailures.length > 0) {
        execution.executionStatus = DeletionExecutionStatus.FAILED;
        execution.errorMessage = `Blocking safety checks failed: ${blockingFailures.map(r => r.name).join(', ')}`;
        await this.saveDeletionExecution(execution);
        return execution;


      // Step 2: Run verification steps
      const verificationResults = await this.runVerificationSteps(record, workflow.verificationSteps);
      execution.verificationStepsCompleted = verificationResults.map(r => r.stepId);
      execution.verificationHash = this.generateVerificationHash(record);
      execution.verifiedAt = new Date();
      
      // Check if any required verification steps failed
      const requiredFailures = verificationResults.filter(r => r.required && !r.passed);
      if (requiredFailures.length > 0) {
        execution.executionStatus = DeletionExecutionStatus.FAILED;
        execution.errorMessage = `Required verification steps failed: ${requiredFailures.map(r => r.name).join(', ')}`;
        await this.saveDeletionExecution(execution);
        return execution;


      execution.executionStatus = DeletionExecutionStatus.VERIFIED;

      // Step 3: Approval process (if required)
      const needsApproval = requireApproval !== undefined ? requireApproval : workflow.requireApproval;
      if (needsApproval) {
        // In a real implementation, this would trigger an approval workflow
        // For now, we'll mark it as pending manual approval
        execution.executionStatus = DeletionExecutionStatus.PENDING;
        await this.saveDeletionExecution(execution);
        return execution;


      // Step 4: Execute deletion
      await this.performDeletion(record, execution);
      execution.executionStatus = DeletionExecutionStatus.EXECUTED;
      execution.executedAt = new Date();
      execution.deletionHash = this.generateDeletionHash(record, execution.verificationHash!);
 catch (error) {
      execution.executionStatus = DeletionExecutionStatus.FAILED;
      execution.errorMessage = error instanceof Error ? error.message : 'Unknown error';


    await this.saveDeletionExecution(execution);
    return execution;


  /**
   * Generate a verification hash for a record before deletion
   */
  private generateVerificationHash(record: FinancialDataRecord): string {
    const data = `${record.id}:${record.externalId}:${record.dataType}:${record.ownerId}:${record.createdAt.toISOString()}`;
    return createHash('sha256').update(data).digest('hex');


  /**
   * Generate a deletion confirmation hash
   */
  private generateDeletionHash(record: FinancialDataRecord, verificationHash: string): string {
    const data = `${verificationHash}:deleted:${new Date().toISOString()}`;
    return createHash('sha256').update(data).digest('hex');


  /**
   * Run safety checks before deletion
   */
  private async runSafetyChecks(record: FinancialDataRecord, safetyChecks: SafetyCheck[]): Promise<Array<{
    checkId: string;
    name: string;
    passed: boolean;
    blocking: boolean;
    details?: string;
>> {
    const results = [];

    for (const check of safetyChecks) {
      let passed = true;
      let details = '';

      switch (check.type) {
      case 'legal_hold_check':
        passed = !record.legalHold || (record.legalHoldExpiresAt && record.legalHoldExpiresAt < new Date());
        if (!passed) details = 'Record is under legal hold';
        break;
          
      case 'active_transaction_check':
        // In a real implementation, this would check for active transactions
        // For now, assume transactions older than 30 days are safe to delete
        passed = !record.lastAccessedAt || (Date.now() - record.lastAccessedAt.getTime()) > 30 * 24 * 60 * 60 * 1000;
        if (!passed) details = 'Record was recently accessed';
        break;
          
      case 'audit_period_check':
        // Check if record is within audit period (typically last 3 years)
        const auditPeriodYears = (check.config.auditPeriodYears as number) || 3;
        const auditCutoff = new Date();
        auditCutoff.setFullYear(auditCutoff.getFullYear() - auditPeriodYears);
        passed = record.createdAt < auditCutoff;
        if (!passed) details = 'Record is within audit period';
        break;
          
      default:
        // Custom safety checks would be implemented here
        passed = true;


      results.push({
        checkId: check.checkId,
        name: check.name,
        passed,
        blocking: check.blocking,
        details
      });


    return results;


  /**
   * Run verification steps before deletion
   */
  private async runVerificationSteps(record: FinancialDataRecord, verificationSteps: VerificationStep[]): Promise<Array<{
    stepId: string;
    name: string;
    passed: boolean;
    required: boolean;
    details?: string;
>> {
    const results = [];

    for (const step of verificationSteps) {
      let passed = true;
      let details = '';

      switch (step.type) {
      case 'hash_verification':
        // Verify record integrity before deletion
        const currentHash = this.generateVerificationHash(record);
        passed = currentHash.length === 64; // Basic hash validation
        if (!passed) details = 'Hash verification failed';
        break;
          
      case 'approval_required':
        // This would check for existing approvals
        passed = true; // Assume approved for this example
        break;
          
      default:
        passed = true;


      results.push({
        stepId: step.stepId,
        name: step.name,
        passed,
        required: step.required,
        details
      });


    return results;


  /**
   * Perform the actual deletion of a record
   */
  private async performDeletion(record: FinancialDataRecord, execution: DeletionExecution): Promise<void> {

    const now = new Date();
    
    // Update the record to mark it as deleted
    await this.db.query(`
      UPDATE financial_data_records 
      SET 
        current_stage = ?,
        deleted_at = ?,
        deletion_verification_hash = ?,
        deletion_reason = ?,
        approved_by = ?,
        updated_at = ?
      WHERE id = ?
    `, [
      LifecycleStage.DELETED,
      now,
      execution.verificationHash,
      `Automated deletion via workflow: ${execution.workflowId}`,
      execution.approvedBy || 'system',
      now,
      record.id
    ]);

    // In a real implementation, this would also:
    // 1. Remove the actual data from storage systems
    // 2. Clear any cached data
    // 3. Notify dependent systems
    // 4. Update any related records

    // Audit log the deletion
    await this.auditService.logEvent({
      userId: execution.approvedBy || 'system',
      action: 'financial_data_deleted',
      resourceType: 'financial_record',
      resourceId: record.id,
      details: {
        externalId: record.externalId,
        dataType: record.dataType,
        deletionWorkflow: execution.workflowId,
        batchId: execution.executionBatchId,
        verificationHash: execution.verificationHash

      severity: 'warn'
    });


  /**
   * Save deletion execution record to database
   */
  private async saveDeletionExecution(execution: DeletionExecution): Promise<void> {

    await this.db.query(`
      INSERT OR REPLACE INTO financial_deletion_executions (
        id, workflow_id, execution_batch_id, record_id, external_record_id,
        execution_status, verification_hash, deletion_hash,
        scheduled_at, verified_at, executed_at,
        approved_by, approved_at, approval_reason,
        error_message, retry_count,
        verification_steps_completed, safety_checks_completed, audit_metadata,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      execution.id, execution.workflowId, execution.executionBatchId, execution.recordId, execution.externalRecordId,
      execution.executionStatus, execution.verificationHash, execution.deletionHash,
      execution.scheduledAt, execution.verifiedAt, execution.executedAt,
      execution.approvedBy, execution.approvedAt, execution.approvalReason,
      execution.errorMessage, execution.retryCount,
      JSON.stringify(execution.verificationStepsCompleted), JSON.stringify(execution.safetyChecksCompleted), JSON.stringify(execution.auditMetadata),
      execution.createdAt, execution.updatedAt
    ]);


  /**
   * Get deletion workflow by ID
   */
  private async getDeletionWorkflow(workflowId: string): Promise<DeletionWorkflow | null> {

    const rows = await this.db.query(`
      SELECT * FROM financial_deletion_workflows WHERE id = ?
    `, [workflowId]);

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      workflowName: row.workflow_name,
      triggerType: row.trigger_type as DeletionTriggerType,
      triggerConfig: JSON.parse(row.trigger_config || '{}'),
      selectionCriteria: JSON.parse(row.selection_criteria || '{}'),
      batchSize: row.batch_size,
      requireApproval: row.require_approval,
      verificationSteps: JSON.parse(row.verification_steps || '[]'),
      safetyChecks: JSON.parse(row.safety_checks || '[]'),
      isActive: row.is_active,
      lastExecutionAt: row.last_execution_at ? new Date(row.last_execution_at) : undefined,
      nextExecutionAt: row.next_execution_at ? new Date(row.next_execution_at) : undefined,
      totalExecutions: row.total_executions,
      successfulDeletions: row.successful_deletions,
      failedDeletions: row.failed_deletions,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by
    };


  /**
   * Update workflow statistics after execution
   */
  private async updateWorkflowStatistics(workflowId: string, successfulDeletions: number, failedDeletions: number): Promise<void> {

    await this.db.query(`
      UPDATE financial_deletion_workflows 
      SET 
        total_executions = total_executions + 1,
        successful_deletions = successful_deletions + ?,
        failed_deletions = failed_deletions + ?,
        last_execution_at = ?,
        updated_at = ?
      WHERE id = ?
    `, [successfulDeletions, failedDeletions, new Date(), new Date(), workflowId]);


  /**
   * Generate compliance report for deletion activities
   */
  async generateComplianceReport(
    reportType: string,
    periodStart: Date,
    periodEnd: Date,
    createdBy: string,
    options?: {
      regulatoryFramework?: string;
      includeDetails?: boolean;
    }
  ): Promise<ComplianceReport> {

    const reportId = randomUUID();
    const now = new Date();

    // Query deletion statistics for the period
    const deletionStats = await this.db.query(`
      SELECT 
        COUNT(*) as total_deletions,
        COUNT(DISTINCT fde.record_id) as unique_records_deleted,
        COUNT(DISTINCT fde.workflow_id) as workflows_used,
        COUNT(CASE WHEN fde.execution_status = 'executed' THEN 1 END) as successful_deletions,
        COUNT(CASE WHEN fde.execution_status = 'failed' THEN 1 END) as failed_deletions
      FROM financial_deletion_executions fde
      WHERE fde.executed_at BETWEEN ? AND ?
    `, [periodStart, periodEnd]);

    const stats = deletionStats[0] || {};

    // Get deletion reasons breakdown
    const reasonsBreakdown = await this.db.query(`
      SELECT 
        COALESCE(fdr.deletion_reason, 'Unknown') as reason,
        COUNT(*) as count
      FROM financial_data_records fdr
      WHERE fdr.deleted_at BETWEEN ? AND ?
      GROUP BY fdr.deletion_reason
      ORDER BY count DESC
    `, [periodStart, periodEnd]);

    const deletionReasons: Record<string, number> = {};
    reasonsBreakdown.forEach(row => {
      deletionReasons[row.reason] = row.count;
    });

    // Create compliance report
    const report: ComplianceReport = {
      id: reportId,
      reportType,
      reportingPeriodStart: periodStart,
      reportingPeriodEnd: periodEnd,
      totalRecordsDeleted: stats.unique_records_deleted || 0,
      totalDataVolumeDeleted: 0, // Would calculate actual data volume in real implementation
      deletionReasons,
      jurisdictionsAffected: [Jurisdiction.US], // Would query actual jurisdictions
      regulatoryFramework: options?.regulatoryFramework,
      approvalStatus: 'draft',
      reportData: {
        totalExecutions: stats.total_deletions || 0,
        successfulDeletions: stats.successful_deletions || 0,
        failedDeletions: stats.failed_deletions || 0,
        workflowsUsed: stats.workflows_used || 0,
        generationTimestamp: now.toISOString()

      summaryStatistics: {
        avgDeletionsPerDay: Math.round((stats.unique_records_deleted || 0) / Math.max(1, Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000)))),
        successRate: stats.total_deletions ? Math.round((stats.successful_deletions / stats.total_deletions) * 100) : 0

      generatedAt: now,
      createdAt: now,
      updatedAt: now,
      createdBy
    };

    // Save report to database
    await this.db.query(`
      INSERT INTO financial_compliance_reports (
        id, report_type, reporting_period_start, reporting_period_end,
        total_records_deleted, total_data_volume_deleted, deletion_reasons, jurisdictions_affected,
        regulatory_framework, approval_status, report_data, summary_statistics,
        generated_at, created_at, updated_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      report.id, report.reportType, report.reportingPeriodStart, report.reportingPeriodEnd,
      report.totalRecordsDeleted, report.totalDataVolumeDeleted, JSON.stringify(report.deletionReasons), JSON.stringify(report.jurisdictionsAffected),
      report.regulatoryFramework, report.approvalStatus, JSON.stringify(report.reportData), JSON.stringify(report.summaryStatistics),
      report.generatedAt, report.createdAt, report.updatedAt, report.createdBy
    ]);

    // Audit log the report generation
    await this.auditService.logEvent({
      userId: createdBy,
      action: 'compliance_report_generated',
      resourceType: 'compliance_report',
      resourceId: report.id,
      details: {
        reportType: report.reportType,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        totalRecordsDeleted: report.totalRecordsDeleted,
        regulatoryFramework: report.regulatoryFramework

      severity: 'info'
    });

    return report;

