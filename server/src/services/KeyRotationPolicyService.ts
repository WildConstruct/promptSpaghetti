// Key Rotation Policy Service
// Automated key rotation scheduling and policy management
// Integrates with KeyManagementService for comprehensive key lifecycle management

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { KeyManagementService } from './KeyManagementService';
import { EventEmitter } from 'events';
import * as cron from 'node-cron';

export interface KeyRotationPolicyConfig {
  // Rotation scheduling
  enableAutomaticRotation: boolean;
  checkIntervalMinutes: number;
  rotationWindowHours: number;
  
  // Approval workflow
  requireApprovalForCritical: boolean;
  approvalTimeoutHours: number;
  
  // Notification settings
  notificationDaysBefore: number[];
  escalationDaysBefore: number;
  
  // Safety settings
  maxConcurrentRotations: number;
  rotationOverlapHours: number;
  emergencyRotationEnabled: boolean;
  
  // Compliance
  auditAllRotations: boolean;
  retainPolicyHistory: boolean;
  complianceReportingEnabled: boolean;
}

export interface RotationPolicy {
  id: string;
  policyName: string;
  description?: string;
  
  // Scope
  keyPurpose: string;
  securityLevel?: string;
  keyPattern?: string; // Regex pattern for key IDs
  
  // Rotation triggers
  rotationIntervalDays?: number;
  maxUsageCount?: number;
  rotationThresholdDate?: Date;
  inactivityDays?: number;
  
  // Schedule
  rotationSchedule?: string; // Cron expression
  allowedRotationHours?: number[]; // Hours when rotation is allowed
  blackoutDates?: Date[]; // Dates when rotation is forbidden
  
  // Behavior
  autoRotationEnabled: boolean;
  notificationDaysBefore: number;
  overlapPeriodHours: number;
  
  // Approval
  requiresApproval: boolean;
  approvalRoles: string[];
  emergencyBypass: boolean;
  
  // Compliance
  complianceFramework?: string[];
  retentionDays?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
  priority: number; // Higher number = higher priority
}

export interface RotationSchedule {
  id: string;
  policyId: string;
  keyId: string;
  
  // Scheduling
  scheduledDate: Date;
  estimatedDuration: number; // minutes
  rotationWindow: {
    startTime: Date;
    endTime: Date;
  };
  
  // Status
  status: 'scheduled' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  
  // Execution
  executionAttempts: number;
  lastAttemptAt?: Date;
  completedAt?: Date;
  failureReason?: string;
  
  // Approval
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  approvalNotes?: string;
  
  // Results
  oldKeyId?: string;
  newKeyId?: string;
  rollbackPlan?: unknown;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  notifications: RotationNotification[];
}

export interface RotationNotification {
  id: string;
  type: 'reminder' | 'approval_request' | 'emergency' | 'completion' | 'failure';
  recipient: string;
  sentAt: Date;
  acknowledged?: boolean;
  acknowledgedAt?: Date;
}

export interface PolicyEvaluation {
  policyId: string;
  keyId: string;
  trigger: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: 'schedule' | 'immediate' | 'emergency';
  reasoning: string[];
  estimatedImpact: {
    affectedSystems: string[];
    downtime: number;
    riskLevel: string;
  };
}

export interface RotationMetrics {
  totalRotations: number;
  successfulRotations: number;
  failedRotations: number;
  averageRotationTime: number;
  complianceScore: number;
  upcomingRotations: number;
  overdueRotations: number;
  emergencyRotations: number;
}

export class KeyRotationPolicyService extends EventEmitter {
  private db: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private keyManagementService: KeyManagementService;
  private config: KeyRotationPolicyConfig;
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

  constructor(
    db: DatabaseService,
    redis: RedisService,
    auditService: AuditService,
    keyManagementService: KeyManagementService,
    config: KeyRotationPolicyConfig
  ) {
    super();
    this.db = db;
    this.redis = redis;
    this.auditService = auditService;
    this.keyManagementService = keyManagementService;
    this.config = config;
    
    // Start background processes
    this.startRotationChecker();
    this.startNotificationProcessor();
  }

  async createPolicy(policy: Omit<RotationPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<RotationPolicy> {
    try {
      const policyId = this.generatePolicyId(policy.policyName);
      
      // Validate policy
      this.validatePolicy(policy);
      
      // Insert into database
      await this.db.query(`
        INSERT INTO key_rotation_policies (
          id, policy_name, description, key_purpose, security_level, key_pattern,
          rotation_interval_days, max_usage_count, rotation_threshold_date, inactivity_days,
          rotation_schedule, allowed_rotation_hours, blackout_dates,
          auto_rotation_enabled, notification_days_before, overlap_period_hours,
          requires_approval, approval_roles, emergency_bypass,
          compliance_framework, retention_days, created_by, is_active, priority
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15,
          $16,
          $17,
          $18,
          $19,
          $20,
          $21,
          $22,
          $23,
          $24
        )
      `, [
        policyId,
        policy.policyName,
        policy.description,
        policy.keyPurpose,
        policy.securityLevel,
        policy.keyPattern,
        policy.rotationIntervalDays,
        policy.maxUsageCount,
        policy.rotationThresholdDate,
        policy.inactivityDays,
        policy.rotationSchedule,
        policy.allowedRotationHours ? JSON.stringify(policy.allowedRotationHours) : null,
        policy.blackoutDates ? JSON.stringify(policy.blackoutDates) : null,
        policy.autoRotationEnabled,
        policy.notificationDaysBefore,
        policy.overlapPeriodHours,
        policy.requiresApproval,
        JSON.stringify(policy.approvalRoles),
        policy.emergencyBypass,
        policy.complianceFramework ? JSON.stringify(policy.complianceFramework) : null,
        policy.retentionDays,
        policy.createdBy,
        policy.isActive,
        policy.priority
      ]);
      
      const newPolicy: RotationPolicy = {
        ...policy,
        id: policyId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Set up cron job if scheduled
      if (policy.rotationSchedule && policy.autoRotationEnabled) {
        this.setupCronJob(newPolicy);
      }
      
      // Log policy creation
      await this.logPolicyEvent(policyId, 'policy_created', {
        policyName: policy.policyName,
        keyPurpose: policy.keyPurpose,
        autoEnabled: policy.autoRotationEnabled
      });
      
      // Emit event
      this.emit('policy_created', newPolicy);
      
      return newPolicy;
    } catch (error) {
      console.error('Error creating rotation policy:', error);
      throw new Error('Failed to create rotation policy');
    }
  }

  async evaluateKey(keyId: string): Promise<PolicyEvaluation[]> {
    try {
      // Get key details
      const key = await this.keyManagementService.getMasterKey(keyId);
      if (!key) {
        throw new Error('Key not found');
      }
      
      // Get applicable policies
      const policies = await this.getApplicablePolicies(key);
      
      const evaluations: PolicyEvaluation[] = [];
      
      for (const policy of policies) {
        const evaluation = await this.evaluateKeyAgainstPolicy(key, policy);
        if (evaluation) {
          evaluations.push(evaluation);
        }
      }
      
      // Sort by urgency
      evaluations.sort((a, b) => {
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      });
      
      return evaluations;
    } catch (error) {
      console.error('Error evaluating key:', error);
      throw new Error('Failed to evaluate key');
    }
  }

  async scheduleRotation(
    keyId: string,
    policyId: string,
    scheduledDate: Date,
    priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency' = 'medium'
  ): Promise<RotationSchedule> {
    try {
      const scheduleId = this.generateScheduleId();
      
      // Get policy details
      const policy = await this.getPolicy(policyId);
      if (!policy) {
        throw new Error('Policy not found');
      }
      
      // Calculate rotation window
      const rotationWindow = this.calculateRotationWindow(scheduledDate, policy);
      
      // Check for conflicts
      await this.checkRotationConflicts(scheduledDate, rotationWindow);
      
      // Create schedule
      const schedule: RotationSchedule = {
        id: scheduleId,
        policyId,
        keyId,
        scheduledDate,
        estimatedDuration: this.estimateRotationDuration(keyId),
        rotationWindow,
        status: policy.requiresApproval ? 'pending_approval' : 'scheduled',
        priority,
        executionAttempts: 0,
        approvalRequired: policy.requiresApproval,
        createdAt: new Date(),
        updatedAt: new Date(),
        notifications: []
      };
      
      // Insert into database
      await this.db.query(`
        INSERT INTO rotation_schedules (
          id, policy_id, key_id, scheduled_date, estimated_duration,
          rotation_window_start, rotation_window_end, status, priority,
          approval_required, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        scheduleId,
        policyId,
        keyId,
        scheduledDate,
        schedule.estimatedDuration,
        rotationWindow.startTime,
        rotationWindow.endTime,
        schedule.status,
        priority,
        policy.requiresApproval,
        new Date(),
        new Date()
      ]);
      
      // Schedule notifications
      if (policy.notificationDaysBefore > 0) {
        await this.scheduleNotifications(schedule, policy);
      }
      
      // Log scheduling
      await this.logPolicyEvent(policyId, 'rotation_scheduled', {
        scheduleId,
        keyId,
        scheduledDate,
        priority,
        requiresApproval: policy.requiresApproval
      });
      
      // Emit event
      this.emit('rotation_scheduled', schedule);
      
      return schedule;
    } catch (error) {
      console.error('Error scheduling rotation:', error);
      throw new Error('Failed to schedule rotation');
    }
  }

  async executeRotation(scheduleId: string, executorId?: string): Promise<boolean> {
    try {
      // Get schedule
      const schedule = await this.getRotationSchedule(scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }
      
      // Validate execution
      if (!this.canExecuteRotation(schedule)) {
        throw new Error('Rotation cannot be executed at this time');
      }
      
      // Update status
      await this.updateScheduleStatus(scheduleId, 'in_progress');
      
      // Execute rotation using KeyManagementService
      const context = {
        userId: executorId,
        operationType: 'rotate' as const,
        sessionId: scheduleId,
        additionalContext: {
          scheduled: true,
          policyId: schedule.policyId,
          scheduleId
        }
      };
      
      const newKey = await this.keyManagementService.rotateKey(schedule.keyId, context);
      
      // Update schedule with results
      await this.db.query(`
        UPDATE rotation_schedules 
        SET status = $1, old_key_id = $2, new_key_id = $3, 
            completed_at = $4, updated_at = $4
        WHERE id = $5
      `, ['completed', schedule.keyId, newKey.keyId, new Date(), scheduleId]);
      
      // Log completion
      await this.logPolicyEvent(schedule.policyId, 'rotation_completed', {
        scheduleId,
        oldKeyId: schedule.keyId,
        newKeyId: newKey.keyId,
        executorId
      });
      
      // Send completion notifications
      await this.sendCompletionNotification(schedule, newKey);
      
      // Emit event
      this.emit('rotation_completed', { schedule, newKey });
      
      return true;
    } catch (error) {
      console.error('Error executing rotation:', error);
      
      // Update schedule with failure
      await this.updateScheduleStatus(scheduleId, 'failed', error.message);
      
      // Log failure
      await this.logPolicyEvent('unknown', 'rotation_failed', {
        scheduleId,
        error: error.message
      });
      
      // Emit failure event
      this.emit('rotation_failed', { scheduleId, error: error.message });
      
      return false;
    }
  }

  async approveRotation(scheduleId: string, approverId: string, notes?: string): Promise<boolean> {
    try {
      const schedule = await this.getRotationSchedule(scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }
      
      if (!schedule.approvalRequired) {
        throw new Error('Approval not required for this rotation');
      }
      
      if (schedule.status !== 'pending_approval') {
        throw new Error('Rotation is not pending approval');
      }
      
      // Update approval status
      await this.db.query(`
        UPDATE rotation_schedules 
        SET status = $1, approved_by = $2, approved_at = $3, 
            approval_notes = $4, updated_at = $3
        WHERE id = $5
      `, ['approved', approverId, new Date(), notes, scheduleId]);
      
      // Log approval
      await this.logPolicyEvent(schedule.policyId, 'rotation_approved', {
        scheduleId,
        approverId,
        notes
      });
      
      // Emit event
      this.emit('rotation_approved', { scheduleId, approverId });
      
      return true;
    } catch (error) {
      console.error('Error approving rotation:', error);
      throw new Error('Failed to approve rotation');
    }
  }

  async getUpcomingRotations(days: number = 30): Promise<RotationSchedule[]> {
    try {
      const result = await this.db.query(`
        SELECT 
          rs.*,
          krp.policy_name,
          mk.purpose as key_purpose
        FROM rotation_schedules rs
        JOIN key_rotation_policies krp ON krp.id = rs.policy_id
        JOIN master_keys mk ON mk.key_id = rs.key_id
        WHERE rs.scheduled_date BETWEEN NOW() AND NOW() + INTERVAL '%s days'
          AND rs.status IN ('scheduled', 'pending_approval', 'approved')
        ORDER BY rs.scheduled_date ASC
      `, [days]);
      
      return result.rows.map(this.mapRowToSchedule);
    } catch (error) {
      console.error('Error getting upcoming rotations:', error);
      return [];
    }
  }

  async getRotationMetrics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<RotationMetrics> {
    try {
      const intervals = {
        day: '1 day',
        week: '1 week',
        month: '1 month'
      };
      
      const result = await this.db.query(`
        SELECT
          COUNT(*) as total_rotations,
          COUNT(*) FILTER (WHERE status = 'completed') as successful_rotations,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_rotations,
          AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/60) FILTER (WHERE status = 'completed') as avg_rotation_time,
          COUNT(*) FILTER (WHERE priority = 'emergency') as emergency_rotations
        FROM rotation_schedules
        WHERE created_at >= NOW() - INTERVAL '${intervals[timeframe]}'
      `);
      
      const upcomingResult = await this.db.query(`
        SELECT COUNT(*) as upcoming_rotations
        FROM rotation_schedules
        WHERE scheduled_date > NOW() 
          AND status IN ('scheduled', 'pending_approval', 'approved')
      `);
      
      const overdueResult = await this.db.query(`
        SELECT COUNT(*) as overdue_rotations
        FROM rotation_schedules
        WHERE scheduled_date < NOW() 
          AND status IN ('scheduled', 'pending_approval')
      `);
      
      const stats = result.rows[0];
      const upcoming = upcomingResult.rows[0];
      const overdue = overdueResult.rows[0];
      
      return {
        totalRotations: parseInt(stats.total_rotations || '0'),
        successfulRotations: parseInt(stats.successful_rotations || '0'),
        failedRotations: parseInt(stats.failed_rotations || '0'),
        averageRotationTime: parseFloat(stats.avg_rotation_time || '0'),
        complianceScore: this.calculateComplianceScore(stats),
        upcomingRotations: parseInt(upcoming.upcoming_rotations || '0'),
        overdueRotations: parseInt(overdue.overdue_rotations || '0'),
        emergencyRotations: parseInt(stats.emergency_rotations || '0')
      };
    } catch (error) {
      console.error('Error getting rotation metrics:', error);
      return {
        totalRotations: 0,
        successfulRotations: 0,
        failedRotations: 0,
        averageRotationTime: 0,
        complianceScore: 0,
        upcomingRotations: 0,
        overdueRotations: 0,
        emergencyRotations: 0
      };
    }
  }

  // Private helper methods

  private generatePolicyId(policyName: string): string {
    const timestamp = Date.now();
    const sanitized = policyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `policy_${sanitized}_${timestamp}`;
  }

  private generateScheduleId(): string {
    return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validatePolicy(policy: unknown): void {
    if (!policy.policyName || !policy.keyPurpose) {
      throw new Error('Policy name and key purpose are required');
    }
    
    if (!policy.rotationIntervalDays && !policy.maxUsageCount && !policy.rotationThresholdDate) {
      throw new Error('At least one rotation trigger must be specified');
    }
    
    if (policy.rotationSchedule && !cron.validate(policy.rotationSchedule)) {
      throw new Error('Invalid cron expression for rotation schedule');
    }
  }

  private async getApplicablePolicies(key: unknown): Promise<RotationPolicy[]> {
    const result = await this.db.query(`
      SELECT * FROM key_rotation_policies
      WHERE is_active = true
        AND (key_purpose = $1 OR key_purpose = '*')
        AND (security_level IS NULL OR security_level = $2)
      ORDER BY priority DESC
    `, [key.purpose, key.securityLevel]);
    
    return result.rows.map(this.mapRowToPolicy);
  }

  private async evaluateKeyAgainstPolicy(key: unknown, policy: RotationPolicy): Promise<PolicyEvaluation | null> {
    const reasoning: string[] = [];
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let recommendedAction: 'schedule' | 'immediate' | 'emergency' = 'schedule';
    let trigger = '';
    
    // Check rotation interval
    if (policy.rotationIntervalDays) {
      const daysSinceCreation = Math.floor((Date.now() - key.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation >= policy.rotationIntervalDays) {
        trigger = 'rotation_interval_exceeded';
        urgency = 'medium';
        reasoning.push(`Key is ${daysSinceCreation} days old, exceeding ${policy.rotationIntervalDays} day policy`);
      }
    }
    
    // Check usage count
    if (policy.maxUsageCount && key.usageCount >= policy.maxUsageCount) {
      trigger = 'usage_count_exceeded';
      urgency = 'high';
      recommendedAction = 'immediate';
      reasoning.push(`Key usage count ${key.usageCount} exceeds policy limit of ${policy.maxUsageCount}`);
    }
    
    // Check threshold date
    if (policy.rotationThresholdDate && new Date() >= policy.rotationThresholdDate) {
      trigger = 'threshold_date_reached';
      urgency = 'critical';
      recommendedAction = 'immediate';
      reasoning.push(`Rotation threshold date ${policy.rotationThresholdDate} has been reached`);
    }
    
    // Check inactivity
    if (policy.inactivityDays && key.lastUsedAt) {
      const daysSinceLastUse = Math.floor((Date.now() - key.lastUsedAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastUse >= policy.inactivityDays) {
        trigger = 'inactivity_threshold';
        urgency = 'medium';
        reasoning.push(`Key inactive for ${daysSinceLastUse} days, exceeding ${policy.inactivityDays} day threshold`);
      }
    }
    
    if (!trigger) {
      return null; // No rotation needed
    }
    
    return {
      policyId: policy.id,
      keyId: key.keyId,
      trigger,
      urgency,
      recommendedAction,
      reasoning,
      estimatedImpact: {
        affectedSystems: [key.purpose],
        downtime: policy.overlapPeriodHours > 0 ? 0 : 5, // minutes
        riskLevel: urgency
      }
    };
  }

  private calculateRotationWindow(scheduledDate: Date, _____policy: RotationPolicy): { startTime: Date; endTime: Date } {
    const startTime = new Date(scheduledDate);
    const endTime = new Date(scheduledDate.getTime() + this.config.rotationWindowHours * 60 * 60 * 1000);
    
    return { startTime, endTime };
  }

  private async checkRotationConflicts(scheduledDate: Date, rotationWindow: unknown): Promise<void> {
    const conflicts = await this.db.query(`
      SELECT COUNT(*) as count
      FROM rotation_schedules
      WHERE status IN ('scheduled', 'approved', 'in_progress')
        AND (
          (rotation_window_start <= $1 AND rotation_window_end >= $1) OR
          (rotation_window_start <= $2 AND rotation_window_end >= $2) OR
          (rotation_window_start >= $1 AND rotation_window_end <= $2)
        )
    `, [rotationWindow.startTime, rotationWindow.endTime]);
    
    const conflictCount = parseInt(conflicts.rows[0].count);
    if (conflictCount >= this.config.maxConcurrentRotations) {
      throw new Error('Too many concurrent rotations scheduled for this time window');
    }
  }

  private estimateRotationDuration(_____keyId: string): number {
    // Base estimation: 15 minutes, can be enhanced with historical data
    return 15;
  }

  private canExecuteRotation(schedule: RotationSchedule): boolean {
    if (schedule.status !== 'scheduled' && schedule.status !== 'approved') {
      return false;
    }
    
    const now = new Date();
    if (now < schedule.rotationWindow.startTime || now > schedule.rotationWindow.endTime) {
      return false;
    }
    
    return true;
  }

  private calculateComplianceScore(stats: unknown): number {
    const total = parseInt(stats.total_rotations || '0');
    const successful = parseInt(stats.successful_rotations || '0');
    
    if (total === 0) return 100;
    return Math.round((successful / total) * 100);
  }

  private mapRowToPolicy(row: unknown): RotationPolicy {
    return {
      id: row.id,
      policyName: row.policy_name,
      description: row.description,
      keyPurpose: row.key_purpose,
      securityLevel: row.security_level,
      keyPattern: row.key_pattern,
      rotationIntervalDays: row.rotation_interval_days,
      maxUsageCount: row.max_usage_count,
      rotationThresholdDate: row.rotation_threshold_date,
      inactivityDays: row.inactivity_days,
      rotationSchedule: row.rotation_schedule,
      allowedRotationHours: row.allowed_rotation_hours ? JSON.parse(row.allowed_rotation_hours) : undefined,
      blackoutDates: row.blackout_dates ? JSON.parse(row.blackout_dates) : undefined,
      autoRotationEnabled: row.auto_rotation_enabled,
      notificationDaysBefore: row.notification_days_before,
      overlapPeriodHours: row.overlap_period_hours,
      requiresApproval: row.requires_approval,
      approvalRoles: JSON.parse(row.approval_roles || '[]'),
      emergencyBypass: row.emergency_bypass,
      complianceFramework: row.compliance_framework ? JSON.parse(row.compliance_framework) : undefined,
      retentionDays: row.retention_days,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      isActive: row.is_active,
      priority: row.priority
    };
  }

  private mapRowToSchedule(row: unknown): RotationSchedule {
    return {
      id: row.id,
      policyId: row.policy_id,
      keyId: row.key_id,
      scheduledDate: row.scheduled_date,
      estimatedDuration: row.estimated_duration,
      rotationWindow: {
        startTime: row.rotation_window_start,
        endTime: row.rotation_window_end
      },
      status: row.status,
      priority: row.priority,
      executionAttempts: row.execution_attempts || 0,
      lastAttemptAt: row.last_attempt_at,
      completedAt: row.completed_at,
      failureReason: row.failure_reason,
      approvalRequired: row.approval_required,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at,
      approvalNotes: row.approval_notes,
      oldKeyId: row.old_key_id,
      newKeyId: row.new_key_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      notifications: []
    };
  }

  private async getPolicy(policyId: string): Promise<RotationPolicy | null> {
    const result = await this.db.query(
      'SELECT * FROM key_rotation_policies WHERE id = $1',
      [policyId]
    );
    
    if (result.rows.length === 0) return null;
    return this.mapRowToPolicy(result.rows[0]);
  }

  private async getRotationSchedule(scheduleId: string): Promise<RotationSchedule | null> {
    const result = await this.db.query(
      'SELECT * FROM rotation_schedules WHERE id = $1',
      [scheduleId]
    );
    
    if (result.rows.length === 0) return null;
    return this.mapRowToSchedule(result.rows[0]);
  }

  private async updateScheduleStatus(scheduleId: string, status: string, failureReason?: string): Promise<void> {
    await this.db.query(`
      UPDATE rotation_schedules 
      SET status = $1, failure_reason = $2, updated_at = $3
      WHERE id = $4
    `, [status, failureReason, new Date(), scheduleId]);
  }

  private setupCronJob(policy: RotationPolicy): void {
    if (!policy.rotationSchedule) return;
    
    const task = cron.schedule(policy.rotationSchedule, async () => {
      try {
        await this.processScheduledRotations(policy);
      } catch (error) {
        console.error(`Error in scheduled rotation for policy ${policy.id}:`, error);
      }
    }, { scheduled: false });
    
    this.scheduledJobs.set(policy.id, task);
    task.start();
  }

  private async processScheduledRotations(policy: RotationPolicy): Promise<void> {
    // Implementation for processing scheduled rotations
    console.log(`Processing scheduled rotations for policy ${policy.id}`);
  }

  private async scheduleNotifications(schedule: RotationSchedule, _____policy: RotationPolicy): Promise<void> {
    // Implementation for scheduling notifications
    console.log(`Scheduling notifications for rotation ${schedule.id}`);
  }

  private async sendCompletionNotification(schedule: RotationSchedule, _____newKey: unknown): Promise<void> {
    // Implementation for sending completion notifications
    console.log(`Sending completion notification for rotation ${schedule.id}`);
  }

  private async logPolicyEvent(policyId: string, eventType: string, details: unknown): Promise<void> {
    if (!this.config.auditAllRotations) return;
    
    try {
      await this.auditService.logEvent({
        userId: details.executorId || details.approverId,
        action: `key_rotation_${eventType}`,
        details: {
          policyId,
          eventType,
          ...details
        },
        severity: eventType.includes('failed') ? 'error' : 'info'
      });
    } catch (error) {
      console.error('Error logging policy event:', error);
    }
  }

  private startRotationChecker(): void {
    if (!this.config.enableAutomaticRotation) return;
    
    setInterval(async () => {
      try {
        await this.checkAndExecuteRotations();
      } catch (error) {
        console.error('Error in rotation checker:', error);
      }
    }, this.config.checkIntervalMinutes * 60 * 1000);
  }

  private startNotificationProcessor(): void {
    setInterval(async () => {
      try {
        await this.processNotifications();
      } catch (error) {
        console.error('Error in notification processor:', error);
      }
    }, 60 * 1000); // Check every minute
  }

  private async checkAndExecuteRotations(): Promise<void> {
    // Implementation for checking and executing rotations
    console.log('Checking for rotations to execute...');
  }

  private async processNotifications(): Promise<void> {
    // Implementation for processing notifications
    console.log('Processing rotation notifications...');
  }
}