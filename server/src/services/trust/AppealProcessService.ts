/**
 * Appeal Process Service - Epic 17
 * 
 * Comprehensive appeal management system for trust and enforcement decisions.
 * Allows users to challenge automated enforcement actions, policy violations,
 * and other trust-related decisions with a structured review process.
 * 
 * Task: E17-1753114397383-FB5EA7 - Create appeal process
 * Epic: 17 - Backstage Admin Controls
 */

import { Database } from '../../database';
import { AuditService } from '../../auth/services/AuditService';
import { TrustScoreService } from './TrustScoreService';
import { PolicyDataService } from './PolicyDataModel';

// =============================================================================
// Appeal System Types and Interfaces
// =============================================================================

export type AppealStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'evidence_requested'
  | 'investigation' 
  | 'pending_decision'
  | 'approved' 
  | 'partially_approved'
  | 'denied' 
  | 'dismissed'
  | 'expired';

export type AppealCategory = 
  | 'enforcement_action'    // Challenge to automated enforcement
  | 'trust_score'          // Challenge to trust score calculation
  | 'policy_violation'     // Challenge to policy violation finding
  | 'verification_status'  // Challenge to identity verification
  | 'content_moderation'   // Challenge to content decision
  | 'account_restriction'  // Challenge to account limitations
  | 'transaction_block'    // Challenge to transaction restrictions
  | 'marketplace_decision' // Challenge to marketplace actions
  | 'other';              // Other trust-related decisions

export type AppealPriority = 'low' | 'medium' | 'high' | 'urgent';

export type AppealEvidenceType = 
  | 'document'
  | 'screenshot' 
  | 'video'
  | 'transaction_record'
  | 'communication_log'
  | 'technical_data'
  | 'witness_statement'
  | 'expert_opinion'
  | 'other';

export type ReviewerRole = 'tier1' | 'tier2' | 'specialist' | 'senior' | 'escalation';

export type AppealDecision = 'approve' | 'partially_approve' | 'deny' | 'dismiss';

// =============================================================================
// Core Appeal Interfaces
// =============================================================================

export interface AppealEvidence {
  evidence_id: string;
  evidence_type: AppealEvidenceType;
  title: string;
  description: string;
  file_url?: string;
  content?: string;
  metadata?: Record<string, any>;
  submitted_at: Date;
  submitted_by: string;
  verification_status: 'pending' | 'verified' | 'disputed' | 'rejected';
}

export interface AppealTimeline {
  event_id: string;
  timestamp: Date;
  event_type: string;
  actor_id: string;
  actor_type: 'user' | 'reviewer' | 'system';
  description: string;
  details?: Record<string, any>;
  public_visible: boolean;
}

export interface AppealReviewCriteria {
  policy_adherence: number;      // 1-10 scale
  evidence_quality: number;      // 1-10 scale
  procedural_fairness: number;   // 1-10 scale
  proportionality: number;       // 1-10 scale
  precedent_consistency: number; // 1-10 scale
  risk_assessment: number;       // 1-10 scale
}

export interface AppealDecisionRationale {
  primary_reasoning: string;
  supporting_factors: string[];
  mitigating_factors?: string[];
  precedent_cases?: string[];
  policy_references: string[];
  risk_considerations: string[];
  recommended_actions?: string[];
}

export interface Appeal {
  appeal_id: string;
  appellant_id: string;
  appellant_type: 'user' | 'creator' | 'buyer' | 'admin';
  
  // What is being appealed
  original_decision_id: string;
  original_decision_type: string; // enforcement_action, policy_violation, etc
  original_decision_date: Date;
  
  // Appeal details
  category: AppealCategory;
  priority: AppealPriority;
  status: AppealStatus;
  
  // Appeal content
  subject: string;
  description: string;
  requested_outcome: string;
  impact_statement?: string;
  
  // Process tracking
  submitted_at: Date;
  last_updated: Date;
  target_resolution_date?: Date;
  actual_resolution_date?: Date;
  
  // Assignment and review
  assigned_reviewer_id?: string;
  reviewer_role?: ReviewerRole;
  escalation_level: number;
  review_complexity: 'simple' | 'standard' | 'complex' | 'critical';
  
  // Evidence and documentation
  evidence: AppealEvidence[];
  timeline: AppealTimeline[];
  
  // Decision and outcome
  decision?: AppealDecision;
  decision_date?: Date;
  decision_rationale?: AppealDecisionRationale;
  reviewer_notes?: string;
  
  // Metrics and tracking
  resolution_time_hours?: number;
  satisfaction_score?: number; // Post-resolution survey
  follow_up_required: boolean;
  
  // Related appeals and precedents
  related_appeals?: string[];
  precedent_appeals?: string[];
  
  // Configuration
  allow_resubmission: boolean;
  resubmission_count: number;
  max_resubmissions: number;
}

export interface AppealFilters {
  status?: AppealStatus;
  category?: AppealCategory;
  priority?: AppealPriority;
  assigned_reviewer?: string;
  date_range?: {
    start: Date;
    end: Date;
  };
  escalation_level?: number;
  limit?: number;
  offset?: number;
}

export interface AppealStatistics {
  total_appeals: number;
  by_status: Record<AppealStatus, number>;
  by_category: Record<AppealCategory, number>;
  by_priority: Record<AppealPriority, number>;
  resolution_metrics: {
    average_resolution_time_hours: number;
    median_resolution_time_hours: number;
    sla_compliance_rate: number;
    approval_rate: number;
    satisfaction_score: number;
  };
  workload_distribution: Record<ReviewerRole, number>;
  trend_data: {
    daily_submissions: Record<string, number>;
    resolution_rates: Record<string, number>;
  };
}

// =============================================================================
// Appeal Process Service Implementation
// =============================================================================

export class AppealProcessService {
  private db: Database;
  private auditService: AuditService;
  private trustScoreService?: TrustScoreService;
  private policyService?: PolicyDataService;

  constructor(
    database: Database,
    auditService: AuditService,
    trustScoreService?: TrustScoreService,
    policyService?: PolicyDataService
  ) {
    this.db = database;
    this.auditService = auditService;
    this.trustScoreService = trustScoreService;
    this.policyService = policyService;
  }

  // =============================================================================
  // Appeal Submission and Management
  // =============================================================================

  /**
   * Submit a new appeal
   */
  async submitAppeal(appealData: {
    appellant_id: string;
    appellant_type: 'user' | 'creator' | 'buyer' | 'admin';
    original_decision_id: string;
    original_decision_type: string;
    category: AppealCategory;
    subject: string;
    description: string;
    requested_outcome: string;
    impact_statement?: string;
    initial_evidence?: Partial<AppealEvidence>[];
  }): Promise<string> {
    const appealId = `appeal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate priority based on original decision and impact
    const priority = await this.calculateAppealPriority(
      appealData.original_decision_type,
      appealData.category,
      appealData.impact_statement
    );

    // Determine review complexity
    const complexity = await this.determineReviewComplexity(appealData);

    // Set SLA target based on priority and complexity
    const targetResolutionHours = this.calculateSLATarget(priority, complexity);
    const targetResolutionDate = new Date(Date.now() + targetResolutionHours * 60 * 60 * 1000);

    const appeal: Appeal = {
      appeal_id: appealId,
      appellant_id: appealData.appellant_id,
      appellant_type: appealData.appellant_type,
      
      original_decision_id: appealData.original_decision_id,
      original_decision_type: appealData.original_decision_type,
      original_decision_date: new Date(), // Would get from original decision
      
      category: appealData.category,
      priority,
      status: 'submitted',
      
      subject: appealData.subject,
      description: appealData.description,
      requested_outcome: appealData.requested_outcome,
      impact_statement: appealData.impact_statement,
      
      submitted_at: new Date(),
      last_updated: new Date(),
      target_resolution_date: targetResolutionDate,
      
      escalation_level: 0,
      review_complexity: complexity,
      
      evidence: [],
      timeline: [{
        event_id: `event-${Date.now()}-submission`,
        timestamp: new Date(),
        event_type: 'appeal_submitted',
        actor_id: appealData.appellant_id,
        actor_type: 'user',
        description: 'Appeal submitted for review',
        public_visible: true
      }],
      
      follow_up_required: false,
      allow_resubmission: true,
      resubmission_count: 0,
      max_resubmissions: 3
    };

    // Store appeal in database
    await this.storeAppeal(appeal);

    // Add initial evidence if provided
    if (appealData.initial_evidence?.length) {
      for (const evidence of appealData.initial_evidence) {
        await this.addEvidence(appealId, evidence);
      }
    }

    // Auto-assign to appropriate reviewer
    await this.autoAssignReviewer(appealId);

    // Log appeal submission
    await this.auditService.logEvent({
      userId: appealData.appellant_id,
      action: 'appeal_submitted',
      details: {
        appeal_id: appealId,
        category: appealData.category,
        original_decision: appealData.original_decision_id,
        priority
      },
      severity: 'info'
    });

    // Send notifications
    await this.sendAppealNotifications(appealId, 'submitted');

    return appealId;
  }

  /**
   * Get appeal by ID with full details
   */
  async getAppeal(appealId: string): Promise<Appeal | null> {
    const result = await this.db.query(`
      SELECT * FROM appeals WHERE appeal_id = $1
    `, [appealId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return this.mapRowToAppeal(row);
  }

  /**
   * Update appeal status and details
   */
  async updateAppealStatus(
    appealId: string, 
    newStatus: AppealStatus, 
    updatedBy: string,
    notes?: string
  ): Promise<void> {
    const appeal = await this.getAppeal(appealId);
    if (!appeal) {
      throw new Error(`Appeal not found: ${appealId}`);
    }

    // Update status
    await this.db.query(`
      UPDATE appeals 
      SET status = $1, last_updated = NOW()
      WHERE appeal_id = $2
    `, [newStatus, appealId]);

    // Add timeline event
    await this.addTimelineEvent(appealId, {
      event_type: 'status_change',
      actor_id: updatedBy,
      actor_type: 'reviewer',
      description: `Status changed from ${appeal.status} to ${newStatus}`,
      details: { old_status: appeal.status, new_status: newStatus, notes },
      public_visible: true
    });

    // Send notifications on status change
    await this.sendAppealNotifications(appealId, 'status_changed');
  }

  /**
   * Assign appeal to reviewer
   */
  async assignReviewer(appealId: string, reviewerId: string, reviewerRole: ReviewerRole): Promise<void> {
    await this.db.query(`
      UPDATE appeals 
      SET assigned_reviewer_id = $1, reviewer_role = $2, last_updated = NOW()
      WHERE appeal_id = $3
    `, [reviewerId, reviewerRole, appealId]);

    // Add timeline event
    await this.addTimelineEvent(appealId, {
      event_type: 'reviewer_assigned',
      actor_id: reviewerId,
      actor_type: 'system',
      description: `Appeal assigned to ${reviewerRole} reviewer`,
      details: { reviewer_id: reviewerId, role: reviewerRole },
      public_visible: false
    });

    // Update status if not already under review
    const appeal = await this.getAppeal(appealId);
    if (appeal?.status === 'submitted') {
      await this.updateAppealStatus(appealId, 'under_review', reviewerId);
    }
  }

  /**
   * Add evidence to an appeal
   */
  async addEvidence(appealId: string, evidenceData: Partial<AppealEvidence>): Promise<string> {
    const evidenceId = `evidence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const evidence: AppealEvidence = {
      evidence_id: evidenceId,
      evidence_type: evidenceData.evidence_type || 'other',
      title: evidenceData.title || 'Untitled Evidence',
      description: evidenceData.description || '',
      file_url: evidenceData.file_url,
      content: evidenceData.content,
      metadata: evidenceData.metadata || {},
      submitted_at: new Date(),
      submitted_by: evidenceData.submitted_by || 'system',
      verification_status: 'pending'
    };

    await this.db.query(`
      INSERT INTO appeal_evidence 
      (evidence_id, appeal_id, evidence_type, title, description, file_url, content, metadata, submitted_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      evidenceId, appealId, evidence.evidence_type, evidence.title,
      evidence.description, evidence.file_url, evidence.content,
      JSON.stringify(evidence.metadata), evidence.submitted_by
    ]);

    // Add timeline event
    await this.addTimelineEvent(appealId, {
      event_type: 'evidence_added',
      actor_id: evidence.submitted_by,
      actor_type: 'user',
      description: `New evidence added: ${evidence.title}`,
      details: { evidence_id: evidenceId, evidence_type: evidence.evidence_type },
      public_visible: true
    });

    return evidenceId;
  }

  /**
   * Make a decision on an appeal
   */
  async makeDecision(
    appealId: string,
    decision: AppealDecision,
    rationale: AppealDecisionRationale,
    reviewerId: string,
    reviewCriteria?: AppealReviewCriteria
  ): Promise<void> {
    const appeal = await this.getAppeal(appealId);
    if (!appeal) {
      throw new Error(`Appeal not found: ${appealId}`);
    }

    // Calculate resolution time
    const resolutionTimeHours = (Date.now() - appeal.submitted_at.getTime()) / (1000 * 60 * 60);
    
    // Determine final status based on decision
    let finalStatus: AppealStatus;
    switch (decision) {
      case 'approve': finalStatus = 'approved'; break;
      case 'partially_approve': finalStatus = 'partially_approved'; break;
      case 'deny': finalStatus = 'denied'; break;
      case 'dismiss': finalStatus = 'dismissed'; break;
    }

    // Update appeal with decision
    await this.db.query(`
      UPDATE appeals 
      SET status = $1, decision = $2, decision_date = NOW(), decision_rationale = $3,
          actual_resolution_date = NOW(), resolution_time_hours = $4, last_updated = NOW()
      WHERE appeal_id = $5
    `, [finalStatus, decision, JSON.stringify(rationale), resolutionTimeHours, appealId]);

    // Store review criteria if provided
    if (reviewCriteria) {
      await this.storeReviewCriteria(appealId, reviewCriteria);
    }

    // Add timeline event
    await this.addTimelineEvent(appealId, {
      event_type: 'decision_made',
      actor_id: reviewerId,
      actor_type: 'reviewer',
      description: `Appeal ${decision}: ${rationale.primary_reasoning}`,
      details: { decision, rationale },
      public_visible: true
    });

    // Execute decision actions (reverse original action if approved)
    await this.executeDecisionActions(appealId, decision, appeal);

    // Log decision
    await this.auditService.logEvent({
      userId: reviewerId,
      action: 'appeal_decision',
      details: {
        appeal_id: appealId,
        decision,
        resolution_time_hours: resolutionTimeHours,
        appellant_id: appeal.appellant_id
      },
      severity: decision === 'approve' ? 'warning' : 'info'
    });

    // Send notifications
    await this.sendAppealNotifications(appealId, 'decision_made');
  }

  /**
   * List appeals with filtering
   */
  async listAppeals(filters: AppealFilters = {}): Promise<{ appeals: Appeal[]; total: number }> {
    let whereClause = '';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters.status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(filters.status);
    }

    if (filters.category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(filters.category);
    }

    if (filters.priority) {
      conditions.push(`priority = $${params.length + 1}`);
      params.push(filters.priority);
    }

    if (filters.assigned_reviewer) {
      conditions.push(`assigned_reviewer_id = $${params.length + 1}`);
      params.push(filters.assigned_reviewer);
    }

    if (filters.escalation_level !== undefined) {
      conditions.push(`escalation_level = $${params.length + 1}`);
      params.push(filters.escalation_level);
    }

    if (filters.date_range) {
      conditions.push(`submitted_at BETWEEN $${params.length + 1} AND $${params.length + 2}`);
      params.push(filters.date_range.start, filters.date_range.end);
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this.db.query(`
      SELECT *, COUNT(*) OVER() AS total_count
      FROM appeals
      ${whereClause}
      ORDER BY priority DESC, submitted_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, filters.limit || 50, filters.offset || 0]);

    const appeals = result.rows.map(row => this.mapRowToAppeal(row));
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    return { appeals, total };
  }

  /**
   * Get appeal statistics and metrics
   */
  async getAppealStatistics(timeRange?: { start: Date; end: Date }): Promise<AppealStatistics> {
    let dateFilter = '';
    const params: any[] = [];
    
    if (timeRange) {
      dateFilter = 'WHERE submitted_at BETWEEN $1 AND $2';
      params.push(timeRange.start, timeRange.end);
    }

    // Get overall statistics
    const statsResult = await this.db.query(`
      SELECT 
        COUNT(*) as total_appeals,
        AVG(resolution_time_hours) as avg_resolution_time,
        COUNT(*) FILTER (WHERE decision = 'approve' OR decision = 'partially_approve') as approved_count,
        AVG(satisfaction_score) as avg_satisfaction
      FROM appeals 
      ${dateFilter}
    `, params);

    // Get status breakdown
    const statusResult = await this.db.query(`
      SELECT status, COUNT(*) as count
      FROM appeals 
      ${dateFilter}
      GROUP BY status
    `, params);

    // Get category breakdown  
    const categoryResult = await this.db.query(`
      SELECT category, COUNT(*) as count
      FROM appeals 
      ${dateFilter}
      GROUP BY category
    `, params);

    const stats = statsResult.rows[0];
    const totalAppeals = parseInt(stats.total_appeals) || 0;

    return {
      total_appeals: totalAppeals,
      by_status: statusResult.rows.reduce((acc, row) => {
        acc[row.status as AppealStatus] = parseInt(row.count);
        return acc;
      }, {} as Record<AppealStatus, number>),
      by_category: categoryResult.rows.reduce((acc, row) => {
        acc[row.category as AppealCategory] = parseInt(row.count);
        return acc;
      }, {} as Record<AppealCategory, number>),
      by_priority: {} as Record<AppealPriority, number>, // Would implement similar query
      resolution_metrics: {
        average_resolution_time_hours: parseFloat(stats.avg_resolution_time) || 0,
        median_resolution_time_hours: 0, // Would require percentile query
        sla_compliance_rate: 0, // Would calculate based on target vs actual resolution
        approval_rate: totalAppeals > 0 ? (parseInt(stats.approved_count) / totalAppeals * 100) : 0,
        satisfaction_score: parseFloat(stats.avg_satisfaction) || 0
      },
      workload_distribution: {} as Record<ReviewerRole, number>,
      trend_data: {
        daily_submissions: {},
        resolution_rates: {}
      }
    };
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private async storeAppeal(appeal: Appeal): Promise<void> {
    await this.db.query(`
      INSERT INTO appeals (
        appeal_id, appellant_id, appellant_type, original_decision_id, original_decision_type,
        category, priority, status, subject, description, requested_outcome, impact_statement,
        submitted_at, target_resolution_date, escalation_level, review_complexity,
        follow_up_required, allow_resubmission, resubmission_count, max_resubmissions
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
    `, [
      appeal.appeal_id, appeal.appellant_id, appeal.appellant_type,
      appeal.original_decision_id, appeal.original_decision_type,
      appeal.category, appeal.priority, appeal.status,
      appeal.subject, appeal.description, appeal.requested_outcome, appeal.impact_statement,
      appeal.submitted_at, appeal.target_resolution_date, appeal.escalation_level,
      appeal.review_complexity, appeal.follow_up_required, appeal.allow_resubmission,
      appeal.resubmission_count, appeal.max_resubmissions
    ]);

    // Store initial timeline event
    for (const event of appeal.timeline) {
      await this.addTimelineEvent(appeal.appeal_id, event);
    }
  }

  private async addTimelineEvent(appealId: string, event: Partial<AppealTimeline>): Promise<void> {
    const eventId = event.event_id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db.query(`
      INSERT INTO appeal_timeline (
        event_id,
        appeal_id,
        timestamp,
        event_type,
        actor_id,
        actor_type,
        description,
        details,
        public_visible
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      eventId, appealId, event.timestamp || new Date(), event.event_type,
      event.actor_id, event.actor_type, event.description,
      JSON.stringify(event.details || {}), event.public_visible || false
    ]);
  }

  private mapRowToAppeal(row: any): Appeal {
    return {
      appeal_id: row.appeal_id,
      appellant_id: row.appellant_id,
      appellant_type: row.appellant_type,
      original_decision_id: row.original_decision_id,
      original_decision_type: row.original_decision_type,
      original_decision_date: row.original_decision_date,
      category: row.category,
      priority: row.priority,
      status: row.status,
      subject: row.subject,
      description: row.description,
      requested_outcome: row.requested_outcome,
      impact_statement: row.impact_statement,
      submitted_at: row.submitted_at,
      last_updated: row.last_updated,
      target_resolution_date: row.target_resolution_date,
      actual_resolution_date: row.actual_resolution_date,
      assigned_reviewer_id: row.assigned_reviewer_id,
      reviewer_role: row.reviewer_role,
      escalation_level: row.escalation_level || 0,
      review_complexity: row.review_complexity,
      evidence: [], // Would load separately
      timeline: [], // Would load separately
      decision: row.decision,
      decision_date: row.decision_date,
      decision_rationale: row.decision_rationale ? JSON.parse(row.decision_rationale) : undefined,
      reviewer_notes: row.reviewer_notes,
      resolution_time_hours: row.resolution_time_hours,
      satisfaction_score: row.satisfaction_score,
      follow_up_required: row.follow_up_required || false,
      related_appeals: row.related_appeals ? JSON.parse(row.related_appeals) : [],
      precedent_appeals: row.precedent_appeals ? JSON.parse(row.precedent_appeals) : [],
      allow_resubmission: row.allow_resubmission || false,
      resubmission_count: row.resubmission_count || 0,
      max_resubmissions: row.max_resubmissions || 3
    };
  }

  private async calculateAppealPriority(
    decisionType: string,
    category: AppealCategory,
    impactStatement?: string
  ): Promise<AppealPriority> {
    // High priority for financial or safety impacts
    if (category === 'transaction_block' || category === 'account_restriction') {
      return 'high';
    }
    
    // Medium priority for enforcement actions
    if (category === 'enforcement_action' || category === 'policy_violation') {
      return 'medium';
    }
    
    // Urgent for anything mentioning safety, financial harm, etc.
    if (impactStatement?.toLowerCase().includes('financial') || 
        impactStatement?.toLowerCase().includes('safety') ||
        impactStatement?.toLowerCase().includes('urgent')) {
      return 'urgent';
    }
    
    return 'medium';
  }

  private async determineReviewComplexity(appealData: any): Promise<'simple' | 'standard' | 'complex' | 'critical'> {
    // Simple logic - would be more sophisticated in practice
    if (appealData.category === 'other') return 'simple';
    if (appealData.category === 'enforcement_action') return 'complex';
    if (appealData.category === 'trust_score') return 'standard';
    return 'standard';
  }

  private calculateSLATarget(priority: AppealPriority, complexity: string): number {
    // SLA targets in hours
    const targets = {
      urgent: { simple: 4, standard: 8, complex: 24, critical: 2 },
      high: { simple: 8, standard: 24, complex: 72, critical: 12 },
      medium: { simple: 24, standard: 72, complex: 168, critical: 48 },
      low: { simple: 72, standard: 168, complex: 336, critical: 168 }
    };
    
    return targets[priority][complexity] || 72;
  }

  private async autoAssignReviewer(appealId: string): Promise<void> {
    // Simple round-robin assignment - would be more sophisticated
    const availableReviewers = await this.getAvailableReviewers();
    if (availableReviewers.length > 0) {
      const reviewer = availableReviewers[0];
      await this.assignReviewer(appealId, reviewer.id, reviewer.role);
    }
  }

  private async getAvailableReviewers(): Promise<Array<{ id: string; role: ReviewerRole }>> {
    // Would query reviewer availability and workload
    return [
      { id: 'reviewer-tier1-001', role: 'tier1' },
      { id: 'reviewer-tier2-001', role: 'tier2' }
    ];
  }

  private async executeDecisionActions(appealId: string, decision: AppealDecision, appeal: Appeal): Promise<void> {
    // If appeal approved, would reverse or modify original enforcement action
    if (decision === 'approve' || decision === 'partially_approve') {
      console.log(`Executing reversal actions for approved appeal: ${appealId}`);
      // Implementation would depend on original decision type
    }
  }

  private async sendAppealNotifications(appealId: string, event: string): Promise<void> {
    // Would send email/in-app notifications to appellant and reviewers
    console.log(`Sending notifications for appeal ${appealId}, event: ${event}`);
  }

  private async storeReviewCriteria(appealId: string, criteria: AppealReviewCriteria): Promise<void> {
    await this.db.query(`
      INSERT INTO appeal_review_criteria (appeal_id, criteria_data, created_at)
      VALUES ($1, $2, NOW())
    `, [appealId, JSON.stringify(criteria)]);
  }
}