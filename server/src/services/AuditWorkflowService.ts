// Audit Workflow Service - Epic 19
// Service for managing audit workflows and compliance processes

import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { DataAccessControlService } from './DataAccessControlService';

export interface AuditWorkflow {
  id: string;
  name: string;
  description: string;
  workflowType: WorkflowType;
  status: WorkflowStatus;
  triggerConditions: TriggerCondition[];
  steps: WorkflowStep[];
  assignees: string[];
  priority: WorkflowPriority;
  scheduledDate?: Date;
  dueDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface WorkflowStep {
  stepId: string;
  name: string;
  description: string;
  stepType: StepType;
  assigneeRole: string;
  estimatedDuration: number; // in hours
  dependencies: string[]; // step IDs
  status: StepStatus;
  startDate?: Date;
  completionDate?: Date;
  evidence: EvidenceItem[];
  findings: string[];
  nextSteps: string[];
  approvalRequired: boolean;
  reviewRequirements: ReviewRequirement[];
}

export interface TriggerCondition {
  conditionType: TriggerType;
  parameters: Record<string, any>;
  frequency?: string; // cron expression for scheduled workflows
  threshold?: number;
  enabled: boolean;
}

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  description: string;
  filePath?: string;
  dataPoints: Record<string, any>;
  collectedBy: string;
  collectedAt: Date;
  verificationStatus: VerificationStatus;
}

export interface ReviewRequirement {
  reviewType: ReviewType;
  requiredRole: string;
  criteria: string[];
  signOffRequired: boolean;
}

export interface WorkflowExecution {
  executionId: string;
  workflowId: string;
  status: ExecutionStatus;
  startDate: Date;
  endDate?: Date;
  currentStep: string;
  progress: number; // percentage
  findings: WorkflowFinding[];
  evidence: EvidenceItem[];
  reports: AuditReport[];
  metadata: Record<string, any>;
}

export interface WorkflowFinding {
  id: string;
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  description: string;
  impact: string;
  recommendations: string[];
  affectedSystems: string[];
  remediation: RemediationAction[];
  status: FindingStatus;
  identifiedBy: string;
  identifiedAt: Date;
}

export interface RemediationAction {
  actionId: string;
  description: string;
  assignee: string;
  dueDate: Date;
  status: ActionStatus;
  evidence?: string[];
  completedAt?: Date;
}

export interface AuditReport {
  reportId: string;
  workflowExecutionId: string;
  reportType: ReportType;
  title: string;
  summary: string;
  findings: WorkflowFinding[];
  recommendations: string[];
  complianceStatus: ComplianceStatus;
  generatedBy: string;
  generatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  distribution: string[];
}

export enum WorkflowType {
  COMPLIANCE_AUDIT = 'COMPLIANCE_AUDIT',
  SECURITY_ASSESSMENT = 'SECURITY_ASSESSMENT',
  DATA_PRIVACY_REVIEW = 'DATA_PRIVACY_REVIEW',
  ACCESS_REVIEW = 'ACCESS_REVIEW',
  INCIDENT_INVESTIGATION = 'INCIDENT_INVESTIGATION',
  PENETRATION_TEST = 'PENETRATION_TEST',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  VENDOR_AUDIT = 'VENDOR_AUDIT'
}

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SCHEDULED = 'SCHEDULED',
  SUSPENDED = 'SUSPENDED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum StepType {
  DATA_COLLECTION = 'DATA_COLLECTION',
  EVIDENCE_REVIEW = 'EVIDENCE_REVIEW',
  TESTING = 'TESTING',
  INTERVIEW = 'INTERVIEW',
  DOCUMENTATION = 'DOCUMENTATION',
  APPROVAL = 'APPROVAL',
  REMEDIATION = 'REMEDIATION',
  VERIFICATION = 'VERIFICATION'
}

export enum StepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
  SKIPPED = 'SKIPPED'
}

export enum TriggerType {
  SCHEDULED = 'SCHEDULED',
  EVENT_BASED = 'EVENT_BASED',
  THRESHOLD_BASED = 'THRESHOLD_BASED',
  MANUAL = 'MANUAL',
  COMPLIANCE_DATE = 'COMPLIANCE_DATE'
}

export enum WorkflowPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum EvidenceType {
  DOCUMENT = 'DOCUMENT',
  SCREENSHOT = 'SCREENSHOT',
  LOG_DATA = 'LOG_DATA',
  CONFIGURATION = 'CONFIGURATION',
  INTERVIEW_NOTES = 'INTERVIEW_NOTES',
  TEST_RESULTS = 'TEST_RESULTS',
  METRICS = 'METRICS'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  NEEDS_CLARIFICATION = 'NEEDS_CLARIFICATION'
}

export enum ReviewType {
  TECHNICAL = 'TECHNICAL',
  BUSINESS = 'BUSINESS',
  LEGAL = 'LEGAL',
  COMPLIANCE = 'COMPLIANCE'
}

export enum ExecutionStatus {
  INITIATED = 'INITIATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum FindingSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum FindingCategory {
  TECHNICAL = 'TECHNICAL',
  PROCESS = 'PROCESS',
  POLICY = 'POLICY',
  COMPLIANCE = 'COMPLIANCE',
  SECURITY = 'SECURITY'
}

export enum FindingStatus {
  OPEN = 'OPEN',
  IN_REMEDIATION = 'IN_REMEDIATION',
  RESOLVED = 'RESOLVED',
  ACCEPTED_RISK = 'ACCEPTED_RISK'
}

export enum ActionStatus {
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE'
}

export enum ReportType {
  EXECUTIVE_SUMMARY = 'EXECUTIVE_SUMMARY',
  DETAILED_FINDINGS = 'DETAILED_FINDINGS',
  COMPLIANCE_REPORT = 'COMPLIANCE_REPORT',
  REMEDIATION_PLAN = 'REMEDIATION_PLAN'
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT',
  NOT_APPLICABLE = 'NOT_APPLICABLE'
}

export class AuditWorkflowService {
  private db: DatabaseService;
  private audit: AuditService;
  private accessControl: DataAccessControlService;

  constructor(
    db: DatabaseService,
    audit: AuditService,
    accessControl: DataAccessControlService
  ) {
    this.db = db;
    this.audit = audit;
    this.accessControl = accessControl;
  }

  /**
   * Create a new audit workflow
   */
  async createWorkflow(workflow: Omit<AuditWorkflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ workflowId: string }> {
    const workflowId = await this.generateWorkflowId();

    try {
      // Validate workflow configuration
      await this.validateWorkflowConfig(workflow);

      // Store workflow
      await this.db.query(`
        INSERT INTO audit_workflows (
          workflow_id, name, description, workflow_type, status,
          trigger_conditions, steps, assignees, priority,
          scheduled_date, due_date, created_by, created_at, updated_at, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW(), $13)
      `, [
        workflowId,
        workflow.name,
        workflow.description,
        workflow.workflowType,
        workflow.status,
        JSON.stringify(workflow.triggerConditions),
        JSON.stringify(workflow.steps),
        JSON.stringify(workflow.assignees),
        workflow.priority,
        workflow.scheduledDate,
        workflow.dueDate,
        workflow.createdBy,
        JSON.stringify(workflow.metadata)
      ]);

      // Log workflow creation
      await this.audit.logSecurityEvent({
        type: 'AUDIT_WORKFLOW_CREATED',
        userId: workflow.createdBy,
        resourceId: workflowId,
        ipAddress: undefined,
        userAgent: undefined,
        success: true,
        metadata: {
          workflowType: workflow.workflowType,
          name: workflow.name,
          stepsCount: workflow.steps.length
        }
      });

      return { workflowId };

    } catch (error) {
      await this.audit.logSecurityEvent({
        type: 'AUDIT_WORKFLOW_CREATION_ERROR',
        userId: workflow.createdBy,
        resourceId: workflowId,
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
   * Start workflow execution
   */
  async startWorkflowExecution(workflowId: string, triggeredBy: string): Promise<{ executionId: string }> {
    const executionId = await this.generateExecutionId();

    try {
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      if (workflow.status !== WorkflowStatus.ACTIVE) {
        throw new Error('Workflow is not active');
      }

      // Create execution record
      await this.db.query(`
        INSERT INTO workflow_executions (
          execution_id, workflow_id, status, start_date,
          current_step, progress, findings, evidence, reports, metadata
        ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9)
      `, [
        executionId,
        workflowId,
        ExecutionStatus.INITIATED,
        workflow.steps[0]?.stepId || null,
        0,
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify({ triggeredBy })
      ]);

      // Start first step
      if (workflow.steps.length > 0) {
        await this.startWorkflowStep(executionId, workflow.steps[0].stepId);
      }

      // Log execution start
      await this.audit.logSecurityEvent({
        type: 'AUDIT_WORKFLOW_EXECUTION_STARTED',
        userId: triggeredBy,
        resourceId: executionId,
        ipAddress: undefined,
        userAgent: undefined,
        success: true,
        metadata: {
          workflowId,
          workflowType: workflow.workflowType
        }
      });

      return { executionId };

    } catch (error) {
      await this.audit.logSecurityEvent({
        type: 'AUDIT_WORKFLOW_EXECUTION_ERROR',
        userId: triggeredBy,
        resourceId: executionId,
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
   * Submit evidence for a workflow step
   */
  async submitEvidence(
    executionId: string,
    stepId: string,
    evidence: Omit<EvidenceItem, 'id' | 'collectedAt' | 'verificationStatus'>
  ): Promise<{ evidenceId: string }> {
    const evidenceId = await this.generateEvidenceId();

    try {
      const execution = await this.getWorkflowExecution(executionId);
      if (!execution) {
        throw new Error('Workflow execution not found');
      }

      // Validate step exists and is active
      const workflow = await this.getWorkflow(execution.workflowId);
      const step = workflow?.steps.find(s => s.stepId === stepId);
      if (!step) {
        throw new Error('Workflow step not found');
      }

      // Create evidence record
      const evidenceItem: EvidenceItem = {
        ...evidence,
        id: evidenceId,
        collectedAt: new Date(),
        verificationStatus: VerificationStatus.PENDING
      };

      // Update execution with new evidence
      const updatedEvidence = [...execution.evidence, evidenceItem];
      await this.db.query(`
        UPDATE workflow_executions 
        SET evidence = $1, updated_at = NOW()
        WHERE execution_id = $2
      `, [JSON.stringify(updatedEvidence), executionId]);

      // Log evidence submission
      await this.audit.logSecurityEvent({
        type: 'AUDIT_EVIDENCE_SUBMITTED',
        userId: evidence.collectedBy,
        resourceId: evidenceId,
        ipAddress: undefined,
        userAgent: undefined,
        success: true,
        metadata: {
          executionId,
          stepId,
          evidenceType: evidence.type
        }
      });

      return { evidenceId };

    } catch (error) {
      await this.audit.logSecurityEvent({
        type: 'AUDIT_EVIDENCE_SUBMISSION_ERROR',
        userId: evidence.collectedBy,
        resourceId: executionId,
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
   * Complete a workflow step
   */
  async completeWorkflowStep(
    executionId: string,
    stepId: string,
    completedBy: string,
    findings: string[],
    nextSteps: string[]
  ): Promise<{ nextStepId?: string }> {
    try {
      const execution = await this.getWorkflowExecution(executionId);
      if (!execution) {
        throw new Error('Workflow execution not found');
      }

      const workflow = await this.getWorkflow(execution.workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Update step status
      const updatedSteps = workflow.steps.map(step => {
        if (step.stepId === stepId) {
          return {
            ...step,
            status: StepStatus.COMPLETED,
            completionDate: new Date(),
            findings,
            nextSteps
          };
        }
        return step;
      });

      // Calculate next step
      const completedStepIndex = workflow.steps.findIndex(s => s.stepId === stepId);
      const nextStep = this.findNextEligibleStep(updatedSteps, completedStepIndex);

      // Update execution progress
      const completedSteps = updatedSteps.filter(s => s.status === StepStatus.COMPLETED).length;
      const progress = (completedSteps / workflow.steps.length) * 100;

      await this.db.query(`
        UPDATE workflow_executions 
        SET current_step = $1, progress = $2, updated_at = NOW()
        WHERE execution_id = $3
      `, [nextStep?.stepId || null, progress, executionId]);

      // Start next step if available
      if (nextStep) {
        await this.startWorkflowStep(executionId, nextStep.stepId);
      } else {
        // Complete workflow execution
        await this.completeWorkflowExecution(executionId);
      }

      // Log step completion
      await this.audit.logSecurityEvent({
        type: 'AUDIT_WORKFLOW_STEP_COMPLETED',
        userId: completedBy,
        resourceId: executionId,
        ipAddress: undefined,
        userAgent: undefined,
        success: true,
        metadata: {
          stepId,
          findingsCount: findings.length,
          nextStepId: nextStep?.stepId
        }
      });

      return { nextStepId: nextStep?.stepId };

    } catch (error) {
      await this.audit.logSecurityEvent({
        type: 'AUDIT_WORKFLOW_STEP_COMPLETION_ERROR',
        userId: completedBy,
        resourceId: executionId,
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
   * Generate audit report
   */
  async generateAuditReport(
    executionId: string,
    reportType: ReportType,
    generatedBy: string
  ): Promise<{ reportId: string; reportContent: AuditReport }> {
    const reportId = await this.generateReportId();

    try {
      const execution = await this.getWorkflowExecution(executionId);
      if (!execution) {
        throw new Error('Workflow execution not found');
      }

      const workflow = await this.getWorkflow(execution.workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Generate report content
      const report: AuditReport = {
        reportId,
        workflowExecutionId: executionId,
        reportType,
        title: this.generateReportTitle(workflow, reportType),
        summary: await this.generateReportSummary(execution, workflow),
        findings: execution.findings,
        recommendations: await this.generateRecommendations(execution.findings),
        complianceStatus: await this.calculateComplianceStatus(execution.findings),
        generatedBy,
        generatedAt: new Date(),
        distribution: await this.determineReportDistribution(workflow, reportType)
      };

      // Store report
      await this.db.query(`
        INSERT INTO audit_reports (
          report_id, execution_id, report_type, title, summary,
          findings, recommendations, compliance_status,
          generated_by, generated_at, distribution, content
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10, $11)
      `, [
        reportId,
        executionId,
        reportType,
        report.title,
        report.summary,
        JSON.stringify(report.findings),
        JSON.stringify(report.recommendations),
        report.complianceStatus,
        generatedBy,
        JSON.stringify(report.distribution),
        JSON.stringify(report)
      ]);

      // Log report generation
      await this.audit.logSecurityEvent({
        type: 'AUDIT_REPORT_GENERATED',
        userId: generatedBy,
        resourceId: reportId,
        ipAddress: undefined,
        userAgent: undefined,
        success: true,
        metadata: {
          executionId,
          reportType,
          findingsCount: report.findings.length
        }
      });

      return { reportId, reportContent: report };

    } catch (error) {
      await this.audit.logSecurityEvent({
        type: 'AUDIT_REPORT_GENERATION_ERROR',
        userId: generatedBy,
        resourceId: reportId,
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
   * Get active workflows
   */
  async getActiveWorkflows(filters?: {
    workflowType?: WorkflowType;
    assignee?: string;
    priority?: WorkflowPriority;
  }): Promise<AuditWorkflow[]> {
    let query = `
      SELECT * FROM audit_workflows 
      WHERE status = $1
    `;
    const params: any[] = [WorkflowStatus.ACTIVE];

    if (filters?.workflowType) {
      query += ` AND workflow_type = $${params.length + 1}`;
      params.push(filters.workflowType);
    }

    if (filters?.assignee) {
      query += ` AND assignees::text LIKE $${params.length + 1}`;
      params.push(`%${filters.assignee}%`);
    }

    if (filters?.priority) {
      query += ` AND priority = $${params.length + 1}`;
      params.push(filters.priority);
    }

    query += ` ORDER BY priority DESC, created_at ASC`;

    const result = await this.db.query(query, params);
    return result.rows.map(this.mapToAuditWorkflow);
  }

  /**
   * Get workflow execution status
   */
  async getWorkflowExecution(executionId: string): Promise<WorkflowExecution | null> {
    const result = await this.db.query(`
      SELECT * FROM workflow_executions WHERE execution_id = $1
    `, [executionId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToWorkflowExecution(result.rows[0]);
  }

  // Private helper methods

  private async validateWorkflowConfig(workflow: Omit<AuditWorkflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    if (!workflow.name || workflow.name.length < 3) {
      throw new Error('Workflow name must be at least 3 characters');
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      throw new Error('Workflow must have at least one step');
    }

    if (!workflow.assignees || workflow.assignees.length === 0) {
      throw new Error('Workflow must have at least one assignee');
    }

    // Validate step dependencies
    for (const step of workflow.steps) {
      for (const depId of step.dependencies) {
        if (!workflow.steps.find(s => s.stepId === depId)) {
          throw new Error(`Step dependency ${depId} not found`);
        }
      }
    }
  }

  private async startWorkflowStep(executionId: string, stepId: string): Promise<void> {
    await this.db.query(`
      UPDATE workflow_step_status 
      SET status = $1, start_date = NOW()
      WHERE execution_id = $2 AND step_id = $3
    `, [StepStatus.IN_PROGRESS, executionId, stepId]);
  }

  private findNextEligibleStep(steps: WorkflowStep[], completedStepIndex: number): WorkflowStep | undefined {
    for (let i = completedStepIndex + 1; i < steps.length; i++) {
      const step = steps[i];
      const dependenciesMet = step.dependencies.every(depId => 
        steps.find(s => s.stepId === depId)?.status === StepStatus.COMPLETED
      );
      
      if (dependenciesMet) {
        return step;
      }
    }
    return undefined;
  }

  private async completeWorkflowExecution(executionId: string): Promise<void> {
    await this.db.query(`
      UPDATE workflow_executions 
      SET status = $1, end_date = NOW(), progress = 100
      WHERE execution_id = $2
    `, [ExecutionStatus.COMPLETED, executionId]);
  }

  private generateReportTitle(workflow: AuditWorkflow, reportType: ReportType): string {
    const typeMap = {
      [ReportType.EXECUTIVE_SUMMARY]: 'Executive Summary',
      [ReportType.DETAILED_FINDINGS]: 'Detailed Findings Report',
      [ReportType.COMPLIANCE_REPORT]: 'Compliance Assessment Report',
      [ReportType.REMEDIATION_PLAN]: 'Remediation Action Plan'
    };

    return `${typeMap[reportType]} - ${workflow.name}`;
  }

  private async generateReportSummary(execution: WorkflowExecution, workflow: AuditWorkflow): Promise<string> {
    const totalFindings = execution.findings.length;
    const criticalFindings = execution.findings.filter(f => f.severity === FindingSeverity.CRITICAL).length;
    const highFindings = execution.findings.filter(f => f.severity === FindingSeverity.HIGH).length;

    return `Audit workflow "${workflow.name}" completed with ${totalFindings} findings identified. ` +
           `${criticalFindings} critical and ${highFindings} high severity issues require immediate attention.`;
  }

  private async generateRecommendations(findings: WorkflowFinding[]): Promise<string[]> {
    const recommendations: string[] = [];
    
    findings.forEach(finding => {
      recommendations.push(...finding.recommendations);
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  private async calculateComplianceStatus(findings: WorkflowFinding[]): Promise<ComplianceStatus> {
    const criticalFindings = findings.filter(f => f.severity === FindingSeverity.CRITICAL);
    const highFindings = findings.filter(f => f.severity === FindingSeverity.HIGH);

    if (criticalFindings.length > 0) {
      return ComplianceStatus.NON_COMPLIANT;
    } else if (highFindings.length > 0) {
      return ComplianceStatus.PARTIALLY_COMPLIANT;
    } else {
      return ComplianceStatus.COMPLIANT;
    }
  }

  private async determineReportDistribution(workflow: AuditWorkflow, reportType: ReportType): Promise<string[]> {
    const distribution = [...workflow.assignees];
    
    if (reportType === ReportType.EXECUTIVE_SUMMARY) {
      distribution.push('executive-team', 'audit-committee');
    }
    
    return [...new Set(distribution)];
  }

  private async generateWorkflowId(): Promise<string> {
    return `WF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateExecutionId(): Promise<string> {
    return `EX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateEvidenceId(): Promise<string> {
    return `EV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateReportId(): Promise<string> {
    return `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getWorkflow(workflowId: string): Promise<AuditWorkflow | null> {
    const result = await this.db.query(`
      SELECT * FROM audit_workflows WHERE workflow_id = $1
    `, [workflowId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToAuditWorkflow(result.rows[0]);
  }

  private mapToAuditWorkflow(row: any): AuditWorkflow {
    return {
      id: row.workflow_id,
      name: row.name,
      description: row.description,
      workflowType: row.workflow_type,
      status: row.status,
      triggerConditions: JSON.parse(row.trigger_conditions || '[]'),
      steps: JSON.parse(row.steps || '[]'),
      assignees: JSON.parse(row.assignees || '[]'),
      priority: row.priority,
      scheduledDate: row.scheduled_date,
      dueDate: row.due_date,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      metadata: JSON.parse(row.metadata || '{}')
    };
  }

  private mapToWorkflowExecution(row: any): WorkflowExecution {
    return {
      executionId: row.execution_id,
      workflowId: row.workflow_id,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      currentStep: row.current_step,
      progress: row.progress,
      findings: JSON.parse(row.findings || '[]'),
      evidence: JSON.parse(row.evidence || '[]'),
      reports: JSON.parse(row.reports || '[]'),
      metadata: JSON.parse(row.metadata || '{}')
    };
  }
}