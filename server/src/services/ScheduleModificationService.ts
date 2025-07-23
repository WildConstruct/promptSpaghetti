/**
 * Schedule Modification Service
 * Epic 17.1.5 - Feature Toggle Scheduling System
 * Task: E17-1753114396821-D24733
 * 
 * Advanced schedule modification functionality with impact analysis,
 * approval workflows, batch operations, and change tracking.
 */

import { SchedulingDAO } from '../database/scheduling-dao';
import { FeatureToggleDAO } from '../database/feature-toggle-dao';
import {
  FeatureToggleSchedule,
  ScheduleExecution,
  ScheduleConflict,
  UpdateScheduleRequest,
  ScheduleStatus,
  ScheduleAction,
  RecurrenceType
} from '../database/scheduling-models';

// Modification Types and Interfaces
export type ModificationType = 
  | 'time_change'          // Change start/end times
  | 'recurrence_change'    // Modify recurrence pattern
  | 'action_change'        // Change the action performed
  | 'config_change'        // Modify action configuration
  | 'priority_change'      // Adjust execution priority
  | 'metadata_change'      // Update metadata/tags
  | 'enable_disable'       // Enable/disable schedule
  | 'reschedule'          // Move to different time
  | 'extend'              // Extend end time
  | 'truncate';           // Reduce end time

export type ModificationSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved';

export interface ModificationRequest {
  scheduleId: string;
  modificationType: ModificationType;
  changes: Partial<UpdateScheduleRequest>;
  reason: string;
  comment?: string;
  
  // Impact Analysis
  skipImpactAnalysis?: boolean;
  forceApproval?: boolean;
  
  // Approval Workflow
  requestedBy: string;
  approvalRequired?: boolean;
  approvers?: string[];
  
  // Scheduling
  effectiveTime?: string; // When changes take effect
  scheduleModification?: boolean; // Apply changes later
  
  // Notifications
  notifyAffectedUsers?: boolean;
  notificationChannels?: string[];
}

export interface ModificationResult {
  id: string;
  requestId: string;
  scheduleId: string;
  scheduleName: string;
  modificationType: ModificationType;
  status: 'success' | 'failed' | 'pending_approval' | 'scheduled';
  severity: ModificationSeverity;
  
  // Change Details
  changesSummary: ChangeDetail[];
  originalSchedule: Partial<FeatureToggleSchedule>;
  modifiedSchedule?: Partial<FeatureToggleSchedule>;
  
  // Impact Analysis
  impactAnalysis: ImpactAnalysis;
  conflictsDetected: ScheduleConflict[];
  
  // Approval Workflow
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvalTimestamp?: string;
  rejectionReason?: string;
  
  // Execution Details
  modifiedAt: string;
  modifiedBy: string;
  effectiveTime?: string;
  rollbackPlan?: RollbackPlan;
  
  // Metadata
  executionTimeMs: number;
  version: string;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}

export interface ChangeDetail {
  field: string;
  action: 'added' | 'modified' | 'removed';
  oldValue?: any;
  newValue?: any;
  description: string;
}

export interface ImpactAnalysis {
  severity: ModificationSeverity;
  riskScore: number; // 0-100
  affectedComponents: AffectedComponent[];
  futureExecutionsImpacted: number;
  usersAffected: number;
  conflictsPotential: number;
  
  // Risk Factors
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
  
  // Recommendations
  recommendations: string[];
  requiresApproval: boolean;
  suggestedTestingPlan?: string[];
}

export interface AffectedComponent {
  type: 'feature_toggle' | 'schedule' | 'execution' | 'user_group' | 'system';
  id: string;
  name: string;
  impactLevel: 'low' | 'medium' | 'high';
  description: string;
}

export interface RiskFactor {
  id: string;
  category: 'timing' | 'conflicts' | 'dependencies' | 'business' | 'technical';
  severity: ModificationSeverity;
  description: string;
  likelihood: number; // 0-100
  impact: number; // 0-100
  mitigation?: string;
}

export interface RollbackPlan {
  id: string;
  canRollback: boolean;
  rollbackSteps: RollbackStep[];
  timeWindow: number; // minutes
  prerequisites: string[];
  risks: string[];
}

export interface RollbackStep {
  order: number;
  action: string;
  description: string;
  automated: boolean;
  reversible: boolean;
  estimatedTime: number; // seconds
}

export interface BatchModificationRequest {
  scheduleIds: string[];
  modificationType: ModificationType;
  changes: Partial<UpdateScheduleRequest>;
  reason: string;
  requestedBy: string;
  
  // Batch Options
  stopOnFirstError?: boolean;
  parallelExecution?: boolean;
  maxConcurrency?: number;
  
  // Impact and Approval
  requireIndividualApproval?: boolean;
  requireBatchApproval?: boolean;
  skipImpactAnalysis?: boolean;
}

export interface BatchModificationResult {
  id: string;
  totalSchedules: number;
  successful: number;
  failed: number;
  pendingApproval: number;
  results: ModificationResult[];
  
  // Batch Analysis
  aggregateImpact: ImpactAnalysis;
  batchConflicts: ScheduleConflict[];
  approvalRequired: boolean;
  
  // Execution Details
  executionTimeMs: number;
  timestamp: string;
  parallelExecution: boolean;
}

export interface ModificationHistory {
  scheduleId: string;
  modifications: HistoryEntry[];
  totalModifications: number;
  firstModified: string;
  lastModified: string;
}

export interface HistoryEntry {
  id: string;
  modificationType: ModificationType;
  changes: ChangeDetail[];
  modifiedBy: string;
  modifiedAt: string;
  reason: string;
  approvalStatus: ApprovalStatus;
  rollbackId?: string;
  version: string;
}

export class ScheduleModificationService {
  constructor(
    private schedulingDAO: SchedulingDAO,
    private featureToggleDAO: FeatureToggleDAO
  ) {}

  // Main Modification Methods
  async modifySchedule(request: ModificationRequest): Promise<ModificationResult> {
    const startTime = Date.now();
    const requestId = `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // 1. Validate the modification request
      const schedule = await this.validateModificationRequest(request);
      
      // 2. Analyze change impact
      const impactAnalysis = request.skipImpactAnalysis 
        ? this.createMinimalImpactAnalysis()
        : await this.analyzeModificationImpact(schedule, request);

      // 3. Check for conflicts
      const conflicts = await this.detectModificationConflicts(schedule, request);
      
      // 4. Determine if approval is required
      const requiresApproval = this.shouldRequireApproval(request, impactAnalysis);
      
      // 5. Create change summary
      const changesSummary = this.generateChangesSummary(schedule, request.changes);
      
      // 6. Process based on approval requirements
      if (requiresApproval && !request.forceApproval) {
        return await this.createPendingApprovalResult(
          requestId, schedule, request, impactAnalysis, conflicts, changesSummary, startTime
        );
      }
      
      // 7. Apply the modifications
      const result = await this.applyModifications(
        requestId, schedule, request, impactAnalysis, conflicts, changesSummary, startTime
      );

      // 8. Log the modification
      await this.logModification(result);
      
      return result;
      
    } catch (error) {
      console.error(`Schedule modification failed for ${request.scheduleId}:`, error);
      return this.createErrorResult(requestId, request, error as Error, startTime);
    }
  }

  async modifyMultipleSchedules(request: BatchModificationRequest): Promise<BatchModificationResult> {
    const startTime = Date.now();
    const batchId = `batch_mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Convert to individual modification requests
    const individualRequests = request.scheduleIds.map(scheduleId => ({
      scheduleId,
      modificationType: request.modificationType,
      changes: request.changes,
      reason: request.reason,
      requestedBy: request.requestedBy,
      skipImpactAnalysis: request.skipImpactAnalysis,
      approvalRequired: request.requireIndividualApproval
    }));

    // Process modifications
    const results: ModificationResult[] = [];
    const concurrency = request.maxConcurrency || (request.parallelExecution ? 5 : 1);

    if (request.parallelExecution) {
      // Process in parallel with concurrency limit
      for (let i = 0; i < individualRequests.length; i += concurrency) {
        const batch = individualRequests.slice(i, i + concurrency);
        const batchPromises = batch.map(req => this.modifySchedule(req));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Stop on first error if requested
        if (request.stopOnFirstError && batchResults.some(r => r.status === 'failed')) {
          break;
        }
      }
    } else {
      // Process sequentially
      for (const req of individualRequests) {
        const result = await this.modifySchedule(req);
        results.push(result);

        if (request.stopOnFirstError && result.status === 'failed') {
          break;
        }
      }
    }

    // Analyze batch results
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const pendingApproval = results.filter(r => r.status === 'pending_approval').length;

    // Generate aggregate impact analysis
    const aggregateImpact = this.generateAggregateImpact(results);
    
    // Detect batch-level conflicts
    const batchConflicts = await this.detectBatchConflicts(results);

    const batchResult: BatchModificationResult = {
      id: batchId,
      totalSchedules: request.scheduleIds.length,
      successful,
      failed,
      pendingApproval,
      results,
      aggregateImpact,
      batchConflicts,
      approvalRequired: request.requireBatchApproval || pendingApproval > 0,
      executionTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      parallelExecution: request.parallelExecution || false
    };

    // Log batch modification
    await this.logBatchModification(batchResult);

    return batchResult;
  }

  // Impact Analysis
  async analyzeModificationImpact(
    schedule: FeatureToggleSchedule,
    request: ModificationRequest
  ): Promise<ImpactAnalysis> {
    const riskFactors: RiskFactor[] = [];
    const affectedComponents: AffectedComponent[] = [];
    let riskScore = 0;

    // Analyze timing changes
    if (request.changes.startTime || request.changes.endTime) {
      riskScore += 30;
      riskFactors.push({
        id: 'timing_change',
        category: 'timing',
        severity: 'medium',
        description: 'Schedule timing changes may affect dependent systems',
        likelihood: 70,
        impact: 60,
        mitigation: 'Validate timing against dependent schedules'
      });
    }

    // Analyze action changes
    if (request.changes.action) {
      riskScore += 40;
      riskFactors.push({
        id: 'action_change',
        category: 'business',
        severity: 'high',
        description: 'Changing schedule action may have business impact',
        likelihood: 90,
        impact: 80,
        mitigation: 'Review business impact with stakeholders'
      });
    }

    // Analyze recurrence changes
    if (request.changes.recurrence) {
      riskScore += 25;
      riskFactors.push({
        id: 'recurrence_change',
        category: 'timing',
        severity: 'medium',
        description: 'Recurrence pattern changes affect execution frequency',
        likelihood: 80,
        impact: 50,
        mitigation: 'Validate new pattern against capacity'
      });
    }

    // Check for active status
    if (schedule.status === ScheduleStatus.ACTIVE) {
      riskScore += 20;
      affectedComponents.push({
        type: 'schedule',
        id: schedule.id,
        name: schedule.name,
        impactLevel: 'high',
        description: 'Active schedule modification affects running operations'
      });
    }

    // Get future executions count
    const futureExecutions = await this.estimateFutureExecutions(schedule);
    if (futureExecutions > 10) {
      riskScore += 15;
    }

    // Estimate affected users (mock calculation)
    const usersAffected = Math.floor(Math.random() * 100) + 10;
    if (usersAffected > 50) {
      riskScore += 10;
    }

    // Check for conflicts
    const conflicts = await this.detectModificationConflicts(schedule, request);
    const conflictsPotential = conflicts.length;
    riskScore += conflictsPotential * 10;

    // Determine severity
    const severity: ModificationSeverity = 
      riskScore >= 80 ? 'critical' :
        riskScore >= 60 ? 'high' :
          riskScore >= 30 ? 'medium' : 'low';

    // Generate recommendations
    const recommendations: string[] = [];
    if (riskScore > 60) {
      recommendations.push('Consider staging this change in a test environment first');
      recommendations.push('Schedule modification during low-usage periods');
    }
    if (conflicts.length > 0) {
      recommendations.push('Review and resolve schedule conflicts before applying');
    }
    if (futureExecutions > 50) {
      recommendations.push('Monitor execution metrics after modification');
    }

    return {
      severity,
      riskScore: Math.min(riskScore, 100),
      affectedComponents,
      futureExecutionsImpacted: futureExecutions,
      usersAffected,
      conflictsPotential,
      riskFactors,
      mitigationStrategies: riskFactors.map(rf => rf.mitigation).filter(Boolean) as string[],
      recommendations,
      requiresApproval: riskScore > 50 || severity === 'high' || severity === 'critical'
    };
  }

  // Conflict Detection
  private async detectModificationConflicts(
    schedule: FeatureToggleSchedule,
    request: ModificationRequest
  ): Promise<ScheduleConflict[]> {
    const conflicts: ScheduleConflict[] = [];

    // Only check for conflicts if timing is being modified
    if (!request.changes.startTime && !request.changes.endTime) {
      return conflicts;
    }

    // Get other schedules for the same toggle
    const relatedSchedules = await this.schedulingDAO.getSchedulesByToggle(schedule.toggleId);
    
    for (const otherSchedule of relatedSchedules) {
      if (otherSchedule.id === schedule.id || 
          otherSchedule.status === ScheduleStatus.CANCELLED) {
        continue;
      }

      // Check for time overlap with new times
      const newStartTime = request.changes.startTime ? 
        new Date(request.changes.startTime) : schedule.startTime;
      const newEndTime = request.changes.endTime ? 
        new Date(request.changes.endTime) : schedule.endTime;

      const hasTimeOverlap = this.checkTimeOverlap(
        newStartTime, newEndTime, otherSchedule.startTime, otherSchedule.endTime
      );

      if (hasTimeOverlap) {
        const newAction = request.changes.action || schedule.action;
        const hasActionConflict = this.checkActionConflict(newAction, otherSchedule.action);

        if (hasActionConflict) {
          conflicts.push({
            id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            toggleId: schedule.toggleId,
            conflictingSchedules: [schedule.id, otherSchedule.id],
            conflictType: 'modification_conflict',
            severity: this.calculateConflictSeverity(newAction, otherSchedule.action),
            description: `Modified schedule would conflict with existing schedule '${otherSchedule.name}'`,
            autoResolvable: false,
            detectedAt: new Date(),
            suggestedResolution: {
              action: 'adjust_timing',
              details: 'Consider adjusting the modification timing to avoid overlap'
            }
          });
        }
      }
    }

    return conflicts;
  }

  // Modification Application
  private async applyModifications(
    requestId: string,
    schedule: FeatureToggleSchedule,
    request: ModificationRequest,
    impactAnalysis: ImpactAnalysis,
    conflicts: ScheduleConflict[],
    changesSummary: ChangeDetail[],
    startTime: number
  ): Promise<ModificationResult> {
    // Store original schedule state for rollback
    const originalSchedule = { ...schedule };

    // Create rollback plan
    const rollbackPlan = this.createRollbackPlan(schedule, request);

    try {
      // Apply the changes immediately or schedule for later
      if (request.scheduleModification && request.effectiveTime) {
        // Schedule the modification for later
        await this.scheduleDelayedModification(schedule, request);
        
        return {
          id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          requestId,
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          modificationType: request.modificationType,
          status: 'scheduled',
          severity: impactAnalysis.severity,
          changesSummary,
          originalSchedule,
          impactAnalysis,
          conflictsDetected: conflicts,
          approvalStatus: 'auto_approved',
          modifiedAt: new Date().toISOString(),
          modifiedBy: request.requestedBy,
          effectiveTime: request.effectiveTime,
          rollbackPlan,
          executionTimeMs: Date.now() - startTime,
          version: '1.0.0'
        };
      }

      // Apply changes immediately
      const updatedSchedule = await this.schedulingDAO.updateSchedule(
        { id: schedule.id, ...request.changes },
        request.requestedBy
      );

      if (!updatedSchedule) {
        throw new Error('Failed to update schedule');
      }

      // Recalculate next execution if timing changed
      if (request.changes.startTime || request.changes.recurrence) {
        await this.recalculateNextExecution(updatedSchedule);
      }

      // Send notifications if requested
      if (request.notifyAffectedUsers) {
        await this.sendModificationNotifications(updatedSchedule, request);
      }

      return {
        id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestId,
        scheduleId: schedule.id,
        scheduleName: schedule.name,
        modificationType: request.modificationType,
        status: 'success',
        severity: impactAnalysis.severity,
        changesSummary,
        originalSchedule,
        modifiedSchedule: updatedSchedule,
        impactAnalysis,
        conflictsDetected: conflicts,
        approvalStatus: 'auto_approved',
        modifiedAt: new Date().toISOString(),
        modifiedBy: request.requestedBy,
        rollbackPlan,
        executionTimeMs: Date.now() - startTime,
        version: '1.0.0'
      };

    } catch (error) {
      throw new Error(`Failed to apply modifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper Methods
  private async validateModificationRequest(request: ModificationRequest): Promise<FeatureToggleSchedule> {
    const schedule = await this.schedulingDAO.getSchedule(request.scheduleId);
    if (!schedule) {
      throw new Error(`Schedule with ID ${request.scheduleId} not found`);
    }

    if (schedule.status === ScheduleStatus.COMPLETED) {
      throw new Error('Cannot modify completed schedule');
    }

    if (schedule.status === ScheduleStatus.CANCELLED) {
      throw new Error('Cannot modify cancelled schedule');
    }

    // Validate specific changes
    if (request.changes.startTime) {
      const startTime = new Date(request.changes.startTime);
      if (startTime <= new Date()) {
        throw new Error('New start time must be in the future');
      }
    }

    if (request.changes.endTime && request.changes.startTime) {
      const startTime = new Date(request.changes.startTime);
      const endTime = new Date(request.changes.endTime);
      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }
    }

    return schedule;
  }

  private shouldRequireApproval(request: ModificationRequest, impact: ImpactAnalysis): boolean {
    if (request.approvalRequired) return true;
    if (request.forceApproval === false) return false;
    
    return impact.requiresApproval || 
           impact.severity === 'critical' || 
           impact.severity === 'high' ||
           impact.riskScore > 70;
  }

  private generateChangesSummary(
    schedule: FeatureToggleSchedule, 
    changes: Partial<UpdateScheduleRequest>
  ): ChangeDetail[] {
    const summary: ChangeDetail[] = [];

    for (const [field, newValue] of Object.entries(changes)) {
      if (field === 'id') continue;
      
      const oldValue = (schedule as any)[field];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        summary.push({
          field,
          action: oldValue === undefined ? 'added' : 'modified',
          oldValue,
          newValue,
          description: this.getChangeDescription(field, oldValue, newValue)
        });
      }
    }

    return summary;
  }

  private getChangeDescription(field: string, oldValue: any, newValue: any): string {
    switch (field) {
    case 'startTime':
      return `Start time changed from ${new Date(oldValue).toLocaleString()} to ${new Date(newValue).toLocaleString()}`;
    case 'endTime':
      return `End time changed from ${oldValue ? new Date(oldValue).toLocaleString() : 'none'} to ${newValue ? new Date(newValue).toLocaleString() : 'none'}`;
    case 'action':
      return `Action changed from ${oldValue} to ${newValue}`;
    case 'enabled':
      return `Schedule ${newValue ? 'enabled' : 'disabled'}`;
    case 'priority':
      return `Priority changed from ${oldValue} to ${newValue}`;
    default:
      return `${field} updated`;
    }
  }

  private async estimateFutureExecutions(schedule: FeatureToggleSchedule): Promise<number> {
    // Mock implementation - would calculate based on recurrence pattern
    if (schedule.type === 'one_time') return 1;
    
    const now = new Date();
    const endTime = schedule.endTime || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const timeSpan = endTime.getTime() - now.getTime();
    
    if (schedule.recurrence) {
      const { type, interval } = schedule.recurrence;
      switch (type) {
      case RecurrenceType.DAILY:
        return Math.floor(timeSpan / (24 * 60 * 60 * 1000 * interval));
      case RecurrenceType.WEEKLY:
        return Math.floor(timeSpan / (7 * 24 * 60 * 60 * 1000 * interval));
      case RecurrenceType.MONTHLY:
        return Math.floor(timeSpan / (30 * 24 * 60 * 60 * 1000 * interval));
      default:
        return 10; // Default estimate
      }
    }
    
    return 1;
  }

  private checkTimeOverlap(start1: Date, end1: Date | undefined, start2: Date, end2: Date | undefined): boolean {
    const effectiveEnd1 = end1 || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const effectiveEnd2 = end2 || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    return start1 < effectiveEnd2 && start2 < effectiveEnd1;
  }

  private checkActionConflict(action1: ScheduleAction, action2: ScheduleAction): boolean {
    const conflictingActions = [
      [ScheduleAction.ENABLE, ScheduleAction.DISABLE],
      [ScheduleAction.UPDATE_VALUE, ScheduleAction.UPDATE_VALUE]
    ];

    return conflictingActions.some(([a1, a2]) => 
      (action1 === a1 && action2 === a2) || (action1 === a2 && action2 === a1)
    );
  }

  private calculateConflictSeverity(action1: ScheduleAction, action2: ScheduleAction): 'low' | 'medium' | 'high' | 'critical' {
    if (action1 === ScheduleAction.DISABLE || action2 === ScheduleAction.DISABLE) {
      return 'critical';
    }
    return 'high';
  }

  private createRollbackPlan(schedule: FeatureToggleSchedule, request: ModificationRequest): RollbackPlan {
    const steps: RollbackStep[] = [];
    const canRollback = true;

    // Add rollback steps for each change
    Object.keys(request.changes).forEach((field, index) => {
      if (field !== 'id') {
        steps.push({
          order: index + 1,
          action: `revert_${field}`,
          description: `Revert ${field} to original value`,
          automated: true,
          reversible: true,
          estimatedTime: 5
        });
      }
    });

    return {
      id: `rollback_${Date.now()}`,
      canRollback,
      rollbackSteps: steps,
      timeWindow: 60, // 1 hour
      prerequisites: ['No active executions'],
      risks: ['May affect scheduled operations']
    };
  }

  private createMinimalImpactAnalysis(): ImpactAnalysis {
    return {
      severity: 'low',
      riskScore: 10,
      affectedComponents: [],
      futureExecutionsImpacted: 0,
      usersAffected: 0,
      conflictsPotential: 0,
      riskFactors: [],
      mitigationStrategies: [],
      recommendations: [],
      requiresApproval: false
    };
  }

  private async createPendingApprovalResult(
    requestId: string,
    schedule: FeatureToggleSchedule,
    request: ModificationRequest,
    impactAnalysis: ImpactAnalysis,
    conflicts: ScheduleConflict[],
    changesSummary: ChangeDetail[],
    startTime: number
  ): Promise<ModificationResult> {
    // Store modification request for later approval
    // This would typically be saved to a database
    
    return {
      id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestId,
      scheduleId: schedule.id,
      scheduleName: schedule.name,
      modificationType: request.modificationType,
      status: 'pending_approval',
      severity: impactAnalysis.severity,
      changesSummary,
      originalSchedule: schedule,
      impactAnalysis,
      conflictsDetected: conflicts,
      approvalStatus: 'pending',
      modifiedAt: new Date().toISOString(),
      modifiedBy: request.requestedBy,
      executionTimeMs: Date.now() - startTime,
      version: '1.0.0'
    };
  }

  private createErrorResult(
    requestId: string,
    request: ModificationRequest,
    error: Error,
    startTime: number
  ): ModificationResult {
    return {
      id: `error_${Date.now()}`,
      requestId,
      scheduleId: request.scheduleId,
      scheduleName: 'Unknown',
      modificationType: request.modificationType,
      status: 'failed',
      severity: 'high',
      changesSummary: [],
      originalSchedule: {},
      impactAnalysis: this.createMinimalImpactAnalysis(),
      conflictsDetected: [],
      approvalStatus: 'auto_approved',
      modifiedAt: new Date().toISOString(),
      modifiedBy: request.requestedBy,
      executionTimeMs: Date.now() - startTime,
      version: '1.0.0',
      error: {
        code: 'MODIFICATION_ERROR',
        message: error.message,
        recoverable: true
      }
    };
  }

  private generateAggregateImpact(results: ModificationResult[]): ImpactAnalysis {
    const allAnalyses = results.map(r => r.impactAnalysis);
    const maxRiskScore = Math.max(...allAnalyses.map(a => a.riskScore));
    const totalExecutions = allAnalyses.reduce((sum, a) => sum + a.futureExecutionsImpacted, 0);
    const totalUsers = allAnalyses.reduce((sum, a) => sum + a.usersAffected, 0);
    
    return {
      severity: maxRiskScore > 80 ? 'critical' : maxRiskScore > 60 ? 'high' : 'medium',
      riskScore: Math.min(maxRiskScore * 1.2, 100), // Amplify for batch
      affectedComponents: allAnalyses.flatMap(a => a.affectedComponents),
      futureExecutionsImpacted: totalExecutions,
      usersAffected: totalUsers,
      conflictsPotential: allAnalyses.reduce((sum, a) => sum + a.conflictsPotential, 0),
      riskFactors: allAnalyses.flatMap(a => a.riskFactors),
      mitigationStrategies: [...new Set(allAnalyses.flatMap(a => a.mitigationStrategies))],
      recommendations: ['Monitor batch modification impact closely', 'Test in staging environment first'],
      requiresApproval: allAnalyses.some(a => a.requiresApproval)
    };
  }

  private async detectBatchConflicts(results: ModificationResult[]): Promise<ScheduleConflict[]> {
    // Detect conflicts between modified schedules in the same batch
    return results.flatMap(r => r.conflictsDetected);
  }

  private async scheduleDelayedModification(
    schedule: FeatureToggleSchedule,
    request: ModificationRequest
  ): Promise<void> {
    // Store delayed modification in schedule metadata
    await this.schedulingDAO.updateSchedule({
      id: schedule.id,
      metadata: {
        ...schedule.metadata,
        delayedModification: {
          effectiveTime: request.effectiveTime,
          changes: request.changes,
          requestedBy: request.requestedBy,
          reason: request.reason
        }
      }
    }, request.requestedBy);
  }

  private async recalculateNextExecution(schedule: FeatureToggleSchedule): Promise<void> {
    // This would recalculate the next execution time based on new schedule parameters
    // For now, just update the timestamp
    await this.schedulingDAO.updateSchedule({
      id: schedule.id,
      lastModified: new Date()
    }, 'system');
  }

  private async sendModificationNotifications(
    schedule: FeatureToggleSchedule,
    request: ModificationRequest
  ): Promise<void> {
    console.log(`Sending modification notifications for schedule ${schedule.id}`);
    // This would integrate with notification service
  }

  // Logging Methods
  private async logModification(result: ModificationResult): Promise<void> {
    console.log('Schedule Modification:', {
      scheduleId: result.scheduleId,
      modificationType: result.modificationType,
      status: result.status,
      severity: result.severity,
      changesCount: result.changesSummary.length,
      executionTimeMs: result.executionTimeMs
    });
  }

  private async logBatchModification(result: BatchModificationResult): Promise<void> {
    console.log('Batch Schedule Modification:', {
      batchId: result.id,
      totalSchedules: result.totalSchedules,
      successful: result.successful,
      failed: result.failed,
      executionTimeMs: result.executionTimeMs
    });
  }

  // Public API for retrieving modification history
  async getModificationHistory(scheduleId: string): Promise<ModificationHistory> {
    // This would query a modifications history table
    // For now, return mock data
    return {
      scheduleId,
      modifications: [],
      totalModifications: 0,
      firstModified: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
  }
}

export default ScheduleModificationService;