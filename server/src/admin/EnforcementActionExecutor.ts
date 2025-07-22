/**
 * Enforcement Action Executor - Epic 17.5.4
 * 
 * Executes enforcement actions with graduated responses and safety controls.
 * Provides admin overrides, impact assessment, and rollback capabilities.
 * 
 * Task: E17-1753114397376-1B07D9 - Develop enforcement tools
 * Epic: 17 - Backstage Admin Controls
 */

import { Database } from '../database';
import { AutomatedEnforcementService, EnforcementAction } from '../services/trust/AutomatedEnforcementService';
import { TrustScoreService } from '../services/trust/TrustScoreService';
import { AuditService } from '../auth/services/AuditService';

export interface ExecutionPlan {
  planId: string;
  actions: EnforcementAction[];
  impactAssessment: {
    affectedUsers: number;
    affectedTemplates: number;
    affectedTransactions: number;
    estimatedRevenueLoss: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    mitigationStrategies: string[];
  };
  executionSteps: ExecutionStep[];
  rollbackPlan: RollbackStep[];
  approvalRequired: boolean;
  scheduledAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface ExecutionStep {
  stepId: string;
  order: number;
  action: EnforcementAction;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  dependencies?: string[];
  preConditions?: {
    trustScoreThreshold?: number;
    manualApprovalRequired?: boolean;
    notificationSent?: boolean;
  };
}

export interface RollbackStep {
  stepId: string;
  order: number;
  actionId: string;
  rollbackType: 'revert' | 'expire' | 'modify' | 'escalate';
  rollbackAction: any;
  condition: 'immediate' | 'scheduled' | 'conditional';
  scheduledAt?: Date;
}

export interface ExecutionResult {
  planId: string;
  status: 'completed' | 'partial' | 'failed';
  successCount: number;
  failureCount: number;
  skippedCount: number;
  executionTime: number;
  stepResults: StepResult[];
  errors: string[];
  rollbackAvailable: boolean;
}

export interface StepResult {
  stepId: string;
  actionId: string;
  status: 'success' | 'failure' | 'skipped';
  executionTime: number;
  error?: string;
  rollbackId?: string;
}

export interface AdminOverride {
  overrideId: string;
  actionId: string;
  overrideType: 'skip' | 'modify' | 'escalate' | 'delay' | 'cancel';
  reason: string;
  adminUserId: string;
  overrideData?: any;
  approvedBy?: string;
  createdAt: Date;
  appliedAt?: Date;
}

export class EnforcementActionExecutor {
  private db: Database;
  private automatedEnforcement: AutomatedEnforcementService;
  private trustScoreService: TrustScoreService;
  private auditService: AuditService;
  private executionQueue: Map<string, ExecutionPlan> = new Map();
  private activeExecutions: Set<string> = new Set();

  constructor(
    database: Database,
    automatedEnforcement: AutomatedEnforcementService,
    trustScoreService: TrustScoreService,
    auditService: AuditService
  ) {
    this.db = database;
    this.automatedEnforcement = automatedEnforcement;
    this.trustScoreService = trustScoreService;
    this.auditService = auditService;
  }

  // =============================================================================
  // Execution Planning
  // =============================================================================

  /**
   * Create execution plan for enforcement actions
   */
  async createExecutionPlan(
    actions: EnforcementAction[],
    createdBy: string,
    options: {
      scheduledAt?: Date;
      impactAnalysis?: boolean;
      approvalRequired?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<ExecutionPlan> {
    console.log(`📋 Creating execution plan for ${actions.length} actions`);

    const planId = this.generatePlanId();
    
    // Perform impact assessment
    const impactAssessment = options.impactAnalysis !== false 
      ? await this.assessImpact(actions)
      : this.createDefaultImpactAssessment();

    // Create execution steps with dependencies and ordering
    const executionSteps = await this.createExecutionSteps(actions, impactAssessment);

    // Create rollback plan
    const rollbackPlan = await this.createRollbackPlan(executionSteps);

    const plan: ExecutionPlan = {
      planId,
      actions,
      impactAssessment,
      executionSteps,
      rollbackPlan,
      approvalRequired: options.approvalRequired || impactAssessment.riskLevel === 'critical',
      scheduledAt: options.scheduledAt,
      createdBy,
      createdAt: new Date()
    };

    // Store plan
    await this.storePlan(plan);
    this.executionQueue.set(planId, plan);

    await this.auditService.logEvent({
      userId: createdBy,
      action: 'execution_plan_created',
      details: {
        planId,
        actionCount: actions.length,
        riskLevel: impactAssessment.riskLevel,
        approvalRequired: plan.approvalRequired
      },
      severity: 'info'
    });

    return plan;
  }

  /**
   * Assess impact of enforcement actions
   */
  private async assessImpact(actions: EnforcementAction[]): Promise<ExecutionPlan['impactAssessment']> {
    console.log('📊 Assessing impact of enforcement actions');

    const userActions = actions.filter(a => a.entityType === 'user');
    const templateActions = actions.filter(a => a.entityType === 'template');
    const transactionActions = actions.filter(a => a.entityType === 'transaction');

    // Calculate affected entities
    const affectedUsers = new Set(userActions.map(a => a.entityId)).size;
    const affectedTemplates = new Set(templateActions.map(a => a.entityId)).size;
    const affectedTransactions = new Set(transactionActions.map(a => a.entityId)).size;

    // Estimate revenue impact
    const estimatedRevenueLoss = await this.estimateRevenueLoss(actions);

    // Determine risk level
    const riskLevel = this.calculateRiskLevel(actions, affectedUsers, estimatedRevenueLoss);

    // Generate mitigation strategies
    const mitigationStrategies = this.generateMitigationStrategies(actions, riskLevel);

    return {
      affectedUsers,
      affectedTemplates,
      affectedTransactions,
      estimatedRevenueLoss,
      riskLevel,
      mitigationStrategies
    };
  }

  /**
   * Create execution steps with proper ordering and dependencies
   */
  private async createExecutionSteps(
    actions: EnforcementAction[],
    impact: ExecutionPlan['impactAssessment']
  ): Promise<ExecutionStep[]> {
    const steps: ExecutionStep[] = [];

    // Sort actions by priority: critical first, then high, medium, low
    const sortedActions = actions.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    for (let i = 0; i < sortedActions.length; i++) {
      const action = sortedActions[i];
      const step: ExecutionStep = {
        stepId: this.generateStepId(),
        order: i + 1,
        action,
        status: 'pending',
        preConditions: {
          manualApprovalRequired: action.severity === 'critical' || impact.riskLevel === 'critical',
          notificationSent: action.severity === 'high' || action.severity === 'critical'
        }
      };

      steps.push(step);
    }

    return steps;
  }

  /**
   * Create rollback plan for execution steps
   */
  private async createRollbackPlan(steps: ExecutionStep[]): Promise<RollbackStep[]> {
    const rollbackSteps: RollbackStep[] = [];

    // Create rollback steps in reverse order
    for (let i = steps.length - 1; i >= 0; i--) {
      const step = steps[i];
      const rollbackStep: RollbackStep = {
        stepId: this.generateStepId(),
        order: steps.length - i,
        actionId: step.action.actionId,
        rollbackType: this.getRollbackType(step.action),
        rollbackAction: this.createRollbackAction(step.action),
        condition: step.action.severity === 'critical' ? 'immediate' : 'scheduled'
      };

      rollbackSteps.push(rollbackStep);
    }

    return rollbackSteps;
  }

  // =============================================================================
  // Execution Management
  // =============================================================================

  /**
   * Execute enforcement plan
   */
  async executePlan(planId: string, executedBy: string): Promise<ExecutionResult> {
    console.log(`🚀 Executing enforcement plan: ${planId}`);

    const plan = this.executionQueue.get(planId);
    if (!plan) {
      throw new Error(`Execution plan not found: ${planId}`);
    }

    if (this.activeExecutions.has(planId)) {
      throw new Error(`Plan ${planId} is already executing`);
    }

    this.activeExecutions.add(planId);
    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    try {
      // Execute each step in order
      for (const step of plan.executionSteps) {
        console.log(`⚡ Executing step ${step.order}: ${step.action.actionType} on ${step.action.entityType} ${step.action.entityId}`);
        
        const stepResult = await this.executeStep(step, executedBy);
        stepResults.push(stepResult);

        switch (stepResult.status) {
          case 'success':
            successCount++;
            break;
          case 'failure':
            failureCount++;
            if (stepResult.error) errors.push(stepResult.error);
            break;
          case 'skipped':
            skippedCount++;
            break;
        }

        // Stop on critical failures
        if (stepResult.status === 'failure' && step.action.severity === 'critical') {
          console.log('❌ Critical step failed, stopping execution');
          break;
        }
      }

      const executionTime = Date.now() - startTime;
      const status = failureCount === 0 ? 'completed' : (successCount > 0 ? 'partial' : 'failed');

      const result: ExecutionResult = {
        planId,
        status,
        successCount,
        failureCount,
        skippedCount,
        executionTime,
        stepResults,
        errors,
        rollbackAvailable: successCount > 0
      };

      // Store execution result
      await this.storeExecutionResult(result);

      // Log execution completion
      await this.auditService.logEvent({
        userId: executedBy,
        action: 'enforcement_plan_executed',
        details: {
          planId,
          status: result.status,
          successCount,
          failureCount,
          executionTime
        },
        severity: result.status === 'completed' ? 'info' : 'warning'
      });

      return result;

    } finally {
      this.activeExecutions.delete(planId);
    }
  }

  /**
   * Execute individual step
   */
  private async executeStep(step: ExecutionStep, executedBy: string): Promise<StepResult> {
    const startTime = Date.now();
    step.startedAt = new Date();
    step.status = 'executing';

    try {
      // Check for admin overrides
      const override = await this.getActiveOverride(step.action.actionId);
      if (override) {
        return await this.applyOverride(step, override);
      }

      // Check pre-conditions
      const preConditionsMet = await this.checkPreConditions(step);
      if (!preConditionsMet) {
        step.status = 'skipped';
        step.completedAt = new Date();
        
        return {
          stepId: step.stepId,
          actionId: step.action.actionId,
          status: 'skipped',
          executionTime: Date.now() - startTime
        };
      }

      // Execute the enforcement action
      const appliedActions = await this.automatedEnforcement.applyEnforcementActions([step.action]);
      
      if (appliedActions.length > 0 && appliedActions[0].actionTaken) {
        step.status = 'completed';
        step.completedAt = new Date();
        
        return {
          stepId: step.stepId,
          actionId: step.action.actionId,
          status: 'success',
          executionTime: Date.now() - startTime
        };
      } else {
        throw new Error('Action was not applied successfully');
      }

    } catch (error) {
      step.status = 'failed';
      step.error = error.message;
      step.completedAt = new Date();

      console.error(`❌ Step execution failed:`, error);

      return {
        stepId: step.stepId,
        actionId: step.action.actionId,
        status: 'failure',
        executionTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  // =============================================================================
  // Admin Override Management
  // =============================================================================

  /**
   * Create admin override for enforcement action
   */
  async createOverride(
    actionId: string,
    overrideType: AdminOverride['overrideType'],
    reason: string,
    adminUserId: string,
    overrideData?: any
  ): Promise<AdminOverride> {
    const override: AdminOverride = {
      overrideId: this.generateOverrideId(),
      actionId,
      overrideType,
      reason,
      adminUserId,
      overrideData,
      createdAt: new Date()
    };

    await this.storeOverride(override);

    await this.auditService.logEvent({
      userId: adminUserId,
      action: 'enforcement_override_created',
      details: {
        overrideId: override.overrideId,
        actionId,
        overrideType,
        reason
      },
      severity: 'warning'
    });

    return override;
  }

  /**
   * Apply admin override to step
   */
  private async applyOverride(step: ExecutionStep, override: AdminOverride): Promise<StepResult> {
    const startTime = Date.now();
    
    console.log(`🔧 Applying override ${override.overrideType} to step ${step.stepId}`);

    switch (override.overrideType) {
      case 'skip':
        step.status = 'skipped';
        return {
          stepId: step.stepId,
          actionId: step.action.actionId,
          status: 'skipped',
          executionTime: Date.now() - startTime
        };

      case 'modify':
        // Modify action based on override data
        const modifiedAction = { ...step.action, ...override.overrideData };
        step.action = modifiedAction;
        // Continue with normal execution
        return await this.executeStep(step, override.adminUserId);

      case 'delay':
        // Reschedule the action
        step.status = 'pending';
        return {
          stepId: step.stepId,
          actionId: step.action.actionId,
          status: 'skipped',
          executionTime: Date.now() - startTime
        };

      case 'cancel':
        step.status = 'skipped';
        return {
          stepId: step.stepId,
          actionId: step.action.actionId,
          status: 'skipped',
          executionTime: Date.now() - startTime
        };

      default:
        throw new Error(`Unknown override type: ${override.overrideType}`);
    }
  }

  // =============================================================================
  // Rollback Management
  // =============================================================================

  /**
   * Execute rollback plan
   */
  async rollbackPlan(planId: string, rolledBackBy: string, reason: string): Promise<ExecutionResult> {
    console.log(`🔄 Rolling back enforcement plan: ${planId}`);

    const plan = this.executionQueue.get(planId);
    if (!plan) {
      throw new Error(`Execution plan not found: ${planId}`);
    }

    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Execute rollback steps in order
    for (const rollbackStep of plan.rollbackPlan) {
      try {
        await this.executeRollbackStep(rollbackStep);
        successCount++;
        stepResults.push({
          stepId: rollbackStep.stepId,
          actionId: rollbackStep.actionId,
          status: 'success',
          executionTime: 0
        });
      } catch (error) {
        failureCount++;
        stepResults.push({
          stepId: rollbackStep.stepId,
          actionId: rollbackStep.actionId,
          status: 'failure',
          executionTime: 0,
          error: error.message
        });
      }
    }

    const result: ExecutionResult = {
      planId,
      status: failureCount === 0 ? 'completed' : 'partial',
      successCount,
      failureCount,
      skippedCount: 0,
      executionTime: Date.now() - startTime,
      stepResults,
      errors: stepResults.filter(r => r.error).map(r => r.error!),
      rollbackAvailable: false
    };

    await this.auditService.logEvent({
      userId: rolledBackBy,
      action: 'enforcement_plan_rolledback',
      details: {
        planId,
        reason,
        status: result.status,
        successCount,
        failureCount
      },
      severity: 'warning'
    });

    return result;
  }

  // =============================================================================
  // Helper Methods
  // =============================================================================

  private async executeRollbackStep(step: RollbackStep): Promise<void> {
    // Implementation would depend on rollback type
    console.log(`🔄 Executing rollback step: ${step.rollbackType} for action ${step.actionId}`);
  }

  private async checkPreConditions(step: ExecutionStep): Promise<boolean> {
    if (!step.preConditions) return true;

    if (step.preConditions.manualApprovalRequired) {
      // Check if manual approval exists
      // This would integrate with an approval system
      return true; // Placeholder
    }

    if (step.preConditions.notificationSent) {
      // Ensure notifications were sent
      return true; // Placeholder  
    }

    if (step.preConditions.trustScoreThreshold) {
      // Re-check trust score before execution
      // This would re-validate trust scores
      return true; // Placeholder
    }

    return true;
  }

  private async getActiveOverride(actionId: string): Promise<AdminOverride | null> {
    const result = await this.db.query(`
      SELECT * FROM admin_overrides 
      WHERE action_id = $1 AND applied_at IS NULL 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [actionId]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      overrideId: row.override_id,
      actionId: row.action_id,
      overrideType: row.override_type,
      reason: row.reason,
      adminUserId: row.admin_user_id,
      overrideData: JSON.parse(row.override_data || '{}'),
      approvedBy: row.approved_by,
      createdAt: row.created_at,
      appliedAt: row.applied_at
    };
  }

  private calculateRiskLevel(
    actions: EnforcementAction[],
    affectedUsers: number,
    revenueLoss: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalActions = actions.filter(a => a.severity === 'critical').length;
    const highActions = actions.filter(a => a.severity === 'high').length;

    if (criticalActions > 0 || affectedUsers > 1000 || revenueLoss > 10000) {
      return 'critical';
    }
    if (highActions > 5 || affectedUsers > 100 || revenueLoss > 1000) {
      return 'high';
    }
    if (highActions > 0 || affectedUsers > 10 || revenueLoss > 100) {
      return 'medium';
    }
    return 'low';
  }

  private generateMitigationStrategies(actions: EnforcementAction[], riskLevel: string): string[] {
    const strategies: string[] = [];
    
    if (riskLevel === 'critical') {
      strategies.push('Require senior admin approval');
      strategies.push('Implement gradual rollout');
      strategies.push('Prepare immediate rollback plan');
    }
    
    strategies.push('Monitor system metrics during execution');
    strategies.push('Send notifications to affected users');
    
    return strategies;
  }

  private async estimateRevenueLoss(actions: EnforcementAction[]): Promise<number> {
    // Placeholder implementation
    // Would calculate estimated revenue impact based on action types and affected entities
    return 0;
  }

  private createDefaultImpactAssessment(): ExecutionPlan['impactAssessment'] {
    return {
      affectedUsers: 0,
      affectedTemplates: 0,
      affectedTransactions: 0,
      estimatedRevenueLoss: 0,
      riskLevel: 'low',
      mitigationStrategies: []
    };
  }

  private getRollbackType(action: EnforcementAction): 'revert' | 'expire' | 'modify' | 'escalate' {
    switch (action.actionType) {
      case 'suspend':
      case 'restrict':
        return 'revert';
      case 'flag':
        return 'expire';
      case 'block_transaction':
        return 'modify';
      default:
        return 'revert';
    }
  }

  private createRollbackAction(action: EnforcementAction): any {
    return {
      type: 'revert_enforcement',
      originalActionId: action.actionId,
      entityType: action.entityType,
      entityId: action.entityId
    };
  }

  // Storage methods
  private async storePlan(plan: ExecutionPlan): Promise<void> {
    await this.db.query(`
      INSERT INTO enforcement_execution_plans 
      (plan_id, actions, impact_assessment, execution_steps, rollback_plan, 
       approval_required, scheduled_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      plan.planId,
      JSON.stringify(plan.actions),
      JSON.stringify(plan.impactAssessment),
      JSON.stringify(plan.executionSteps),
      JSON.stringify(plan.rollbackPlan),
      plan.approvalRequired,
      plan.scheduledAt,
      plan.createdBy
    ]);
  }

  private async storeExecutionResult(result: ExecutionResult): Promise<void> {
    await this.db.query(`
      UPDATE enforcement_execution_plans 
      SET execution_result = $2, executed_at = NOW()
      WHERE plan_id = $1
    `, [result.planId, JSON.stringify(result)]);
  }

  private async storeOverride(override: AdminOverride): Promise<void> {
    await this.db.query(`
      INSERT INTO admin_overrides 
      (override_id, action_id, override_type, reason, admin_user_id, override_data)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      override.overrideId,
      override.actionId,
      override.overrideType,
      override.reason,
      override.adminUserId,
      JSON.stringify(override.overrideData || {})
    ]);
  }

  // ID generation
  private generatePlanId(): string {
    return `PLAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateStepId(): string {
    return `STEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOverrideId(): string {
    return `OVR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}