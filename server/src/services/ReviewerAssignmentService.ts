/**
 * Reviewer Assignment Service - Epic 17.5.1
 * 
 * Handles automatic and manual reviewer assignment for marketplace content reviews.
 * Integrates with existing approval workflows and provides specialized logic for
 * marketplace content, policy, and verification reviews.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 */

import { Pool, PoolClient } from 'pg';
import { Logger } from '@nestjs/common';

// Enums for review types and assignment strategies
export enum ReviewType {
  CONTENT_SUBMISSION = 'content_submission',
  POLICY_VIOLATION = 'policy_violation',
  VERIFICATION_REQUEST = 'verification_request',
  APPEAL_REVIEW = 'appeal_review',
  FEATURED_CONTENT = 'featured_content',
  TRANSACTION_DISPUTE = 'transaction_dispute'
}

export enum AssignmentStrategy {
  ROUND_ROBIN = 'round_robin',
  WORKLOAD_BASED = 'workload_based',
  SKILL_BASED = 'skill_based',
  RANDOM = 'random',
  MANUAL = 'manual'
}

export enum ReviewerRole {
  CONTENT_REVIEWER = 'content_reviewer',
  POLICY_REVIEWER = 'policy_reviewer',
  SENIOR_REVIEWER = 'senior_reviewer',
  TECHNICAL_REVIEWER = 'technical_reviewer',
  COMPLIANCE_REVIEWER = 'compliance_reviewer',
  ESCALATION_REVIEWER = 'escalation_reviewer'
}

export enum AssignmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  REASSIGNED = 'reassigned',
  ESCALATED = 'escalated',
  CANCELLED = 'cancelled'
}

// Core interfaces
export interface ReviewerProfile {
  id: string;
  user_id: string;
  role: ReviewerRole;
  specializations: string[];
  capacity_limit: number;
  current_workload: number;
  availability_status: 'available' | 'busy' | 'away' | 'unavailable';
  skill_ratings: Record<string, number>; // skill -> rating (1-10)
  performance_metrics: ReviewerMetrics;
  created_at: Date;
  updated_at: Date;
}

export interface ReviewerMetrics {
  total_reviews: number;
  completed_reviews: number;
  average_review_time_hours: number;
  quality_score: number; // 1-10 based on feedback
  overturned_decisions: number;
  escalations_received: number;
  current_streak: number;
  last_review_date: Date;
}

export interface ReviewAssignment {
  id: string;
  review_item_id: string;
  review_type: ReviewType;
  reviewer_id: string;
  assignment_strategy: AssignmentStrategy;
  assignment_reason: string;
  status: AssignmentStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Timing
  assigned_at: Date;
  due_date: Date;
  started_at?: Date;
  completed_at?: Date;
  
  // Assignment details
  assigned_by: string;
  reassignment_count: number;
  escalation_level: number;
  
  // Performance tracking
  estimated_duration_hours: number;
  actual_duration_hours?: number;
  
  metadata: Record<string, any>;
}

export interface AssignmentRule {
  id: string;
  review_type: ReviewType;
  conditions: AssignmentCondition[];
  assignment_strategy: AssignmentStrategy;
  priority_boost: number;
  max_concurrent_assignments: number;
  required_skills: string[];
  fallback_strategy: AssignmentStrategy;
  enabled: boolean;
}

export interface AssignmentCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  value: Error;
  weight: number;
}

export interface WorkloadDistribution {
  reviewer_id: string;
  current_assignments: number;
  capacity_utilization: number;
  avg_completion_time: number;
  overdue_count: number;
  priority_score: number;
}

export interface AssignmentRequest {
  review_item_id: string;
  review_type: ReviewType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  required_skills?: string[];
  preferred_reviewers?: string[];
  excluded_reviewers?: string[];
  due_date?: Date;
  estimated_duration_hours?: number;
  assignment_strategy?: AssignmentStrategy;
  metadata?: Record<string, any>;
}

export class ReviewerAssignmentService {
  private readonly logger = new Logger(ReviewerAssignmentService.name);

  constructor(private pool: Pool) {}

  /**
   * Initialize the reviewer assignment schema
   */
  async initializeSchema(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Reviewer profiles table
      await client.query(`
        CREATE TABLE IF NOT EXISTS reviewer_profiles (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) NOT NULL UNIQUE,
          role VARCHAR(50) NOT NULL,
          specializations JSONB DEFAULT '[]',
          capacity_limit INTEGER DEFAULT 10,
          current_workload INTEGER DEFAULT 0,
          availability_status VARCHAR(20) DEFAULT 'available',
          skill_ratings JSONB DEFAULT '{}',
          performance_metrics JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Review assignments table
      await client.query(`
        CREATE TABLE IF NOT EXISTS review_assignments (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          review_item_id VARCHAR(36) NOT NULL,
          review_type VARCHAR(50) NOT NULL,
          reviewer_id VARCHAR(36) NOT NULL REFERENCES reviewer_profiles(id),
          assignment_strategy VARCHAR(50) NOT NULL,
          assignment_reason TEXT,
          status VARCHAR(20) DEFAULT 'active',
          priority VARCHAR(20) DEFAULT 'medium',
          
          assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          due_date TIMESTAMP WITH TIME ZONE NOT NULL,
          started_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          
          assigned_by VARCHAR(36) NOT NULL,
          reassignment_count INTEGER DEFAULT 0,
          escalation_level INTEGER DEFAULT 0,
          
          estimated_duration_hours DECIMAL(5,2),
          actual_duration_hours DECIMAL(5,2),
          
          metadata JSONB DEFAULT '{}'
        );
      `);

      // Assignment rules table
      await client.query(`
        CREATE TABLE IF NOT EXISTS assignment_rules (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          review_type VARCHAR(50) NOT NULL,
          conditions JSONB NOT NULL DEFAULT '[]',
          assignment_strategy VARCHAR(50) NOT NULL,
          priority_boost INTEGER DEFAULT 0,
          max_concurrent_assignments INTEGER DEFAULT 5,
          required_skills JSONB DEFAULT '[]',
          fallback_strategy VARCHAR(50) DEFAULT 'random',
          enabled BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Assignment history for analytics
      await client.query(`
        CREATE TABLE IF NOT EXISTS assignment_history (
          id BIGSERIAL PRIMARY KEY,
          assignment_id VARCHAR(36) NOT NULL REFERENCES review_assignments(id),
          action VARCHAR(50) NOT NULL,
          previous_status VARCHAR(20),
          new_status VARCHAR(20),
          previous_reviewer_id VARCHAR(36),
          new_reviewer_id VARCHAR(36),
          reason TEXT,
          performed_by VARCHAR(36) NOT NULL,
          performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'
        );
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_reviewer_profiles_role ON reviewer_profiles(role);
        CREATE INDEX IF NOT EXISTS idx_reviewer_profiles_availability ON reviewer_profiles(availability_status);
        CREATE INDEX IF NOT EXISTS idx_reviewer_profiles_workload ON reviewer_profiles(current_workload);
        
        CREATE INDEX IF NOT EXISTS idx_review_assignments_reviewer ON review_assignments(reviewer_id);
        CREATE INDEX IF NOT EXISTS idx_review_assignments_status ON review_assignments(status);
        CREATE INDEX IF NOT EXISTS idx_review_assignments_type ON review_assignments(review_type);
        CREATE INDEX IF NOT EXISTS idx_review_assignments_due_date ON review_assignments(due_date);
        CREATE INDEX IF NOT EXISTS idx_review_assignments_priority ON review_assignments(priority);
        
        CREATE INDEX IF NOT EXISTS idx_assignment_rules_type ON assignment_rules(review_type);
        CREATE INDEX IF NOT EXISTS idx_assignment_rules_enabled ON assignment_rules(enabled);
        
        CREATE INDEX IF NOT EXISTS idx_assignment_history_assignment ON assignment_history(assignment_id);
        CREATE INDEX IF NOT EXISTS idx_assignment_history_performed_at ON assignment_history(performed_at);
      `);

      await client.query('COMMIT');
      this.logger.log('Reviewer assignment schema initialized successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create or update reviewer profile
   */
  async createReviewerProfile(profileData: Omit<ReviewerProfile, 'id' | 'created_at' | 'updated_at'>): Promise<ReviewerProfile> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO reviewer_profiles 
        (user_id, role, specializations, capacity_limit, availability_status, skill_ratings, performance_metrics)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id) DO UPDATE SET
          role = EXCLUDED.role,
          specializations = EXCLUDED.specializations,
          capacity_limit = EXCLUDED.capacity_limit,
          availability_status = EXCLUDED.availability_status,
          skill_ratings = EXCLUDED.skill_ratings,
          performance_metrics = EXCLUDED.performance_metrics,
          updated_at = NOW()
        RETURNING *
      `, [
        profileData.user_id,
        profileData.role,
        JSON.stringify(profileData.specializations),
        profileData.capacity_limit,
        profileData.availability_status,
        JSON.stringify(profileData.skill_ratings),
        JSON.stringify(profileData.performance_metrics)
      ]);

      return this.mapToReviewerProfile(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * Assign reviewer automatically based on rules and availability
   */
  async assignReviewer(request: AssignmentRequest, assignedBy: string): Promise<ReviewAssignment> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get applicable assignment rules
      const rules = await this.getAssignmentRules(request.review_type);
      const selectedRule = this.selectBestRule(rules, request);

      // Find best reviewer based on strategy
      const strategy = request.assignment_strategy || selectedRule?.assignment_strategy || AssignmentStrategy.WORKLOAD_BASED;
      const reviewer = await this.findBestReviewer(request, strategy, client);

      if (!reviewer) {
        throw new Error(`No available reviewer found for ${request.review_type}`);
      }

      // Calculate due date if not provided
      const dueDate = request.due_date || this.calculateDueDate(request);

      // Create assignment
      const result = await client.query(`
        INSERT INTO review_assignments
        (review_item_id, review_type, reviewer_id, assignment_strategy, assignment_reason,
         priority, due_date, assigned_by, estimated_duration_hours, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        request.review_item_id,
        request.review_type,
        reviewer.id,
        strategy,
        `Auto-assigned using ${strategy} strategy`,
        request.priority,
        dueDate,
        assignedBy,
        request.estimated_duration_hours || this.estimateDuration(request),
        JSON.stringify(request.metadata || {})
      ]);

      // Update reviewer workload
      await client.query(`
        UPDATE reviewer_profiles 
        SET current_workload = current_workload + 1,
            updated_at = NOW()
        WHERE id = $1
      `, [reviewer.id]);

      // Log assignment history
      await this.logAssignmentHistory(client, result.rows[0].id, 'assigned', {
        reviewer_id: reviewer.id,
        strategy: strategy,
        performed_by: assignedBy
      });

      await client.query('COMMIT');

      this.logger.log(`Assigned reviewer ${reviewer.id} to ${request.review_type} item ${request.review_item_id}`);
      
      return this.mapToReviewAssignment(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Manually assign specific reviewer
   */
  async assignSpecificReviewer(
    reviewItemId: string,
    reviewType: ReviewType,
    reviewerId: string,
    assignedBy: string,
    reason: string,
    dueDate?: Date
  ): Promise<ReviewAssignment> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Validate reviewer availability
      const reviewer = await this.getReviewerProfile(reviewerId);
      if (!reviewer) {
        throw new Error(`Reviewer ${reviewerId} not found`);
      }

      if (reviewer.availability_status === 'unavailable') {
        throw new Error(`Reviewer ${reviewerId} is currently unavailable`);
      }

      if (reviewer.current_workload >= reviewer.capacity_limit) {
        this.logger.warn(`Reviewer ${reviewerId} is at capacity but manual assignment proceeding`);
      }

      const finalDueDate = dueDate || this.calculateDueDate({ review_type: reviewType, priority: 'medium' });

      // Create assignment
      const result = await client.query(`
        INSERT INTO review_assignments
        (review_item_id, review_type, reviewer_id, assignment_strategy, assignment_reason,
         priority, due_date, assigned_by, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        reviewItemId,
        reviewType,
        reviewerId,
        AssignmentStrategy.MANUAL,
        reason,
        'medium', // Default priority for manual assignments
        finalDueDate,
        assignedBy,
        JSON.stringify({ manual_assignment: true })
      ]);

      // Update reviewer workload
      await client.query(`
        UPDATE reviewer_profiles 
        SET current_workload = current_workload + 1,
            updated_at = NOW()
        WHERE id = $1
      `, [reviewerId]);

      // Log assignment history
      await this.logAssignmentHistory(client, result.rows[0].id, 'manually_assigned', {
        reviewer_id: reviewerId,
        reason: reason,
        performed_by: assignedBy
      });

      await client.query('COMMIT');

      this.logger.log(`Manually assigned reviewer ${reviewerId} to ${reviewType} item ${reviewItemId}`);
      
      return this.mapToReviewAssignment(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Reassign review to different reviewer
   */
  async reassignReview(
    assignmentId: string,
    newReviewerId: string,
    reason: string,
    performedBy: string
  ): Promise<ReviewAssignment> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get current assignment
      const currentResult = await client.query(
        'SELECT * FROM review_assignments WHERE id = $1',
        [assignmentId]
      );

      if (currentResult.rows.length === 0) {
        throw new Error(`Assignment ${assignmentId} not found`);
      }

      const currentAssignment = currentResult.rows[0];
      const oldReviewerId = currentAssignment.reviewer_id;

      // Validate new reviewer
      const newReviewer = await this.getReviewerProfile(newReviewerId);
      if (!newReviewer) {
        throw new Error(`New reviewer ${newReviewerId} not found`);
      }

      if (newReviewer.availability_status === 'unavailable') {
        throw new Error(`New reviewer ${newReviewerId} is currently unavailable`);
      }

      // Update assignment
      await client.query(`
        UPDATE review_assignments 
        SET reviewer_id = $1,
            reassignment_count = reassignment_count + 1,
            assignment_reason = $2,
            status = 'active'
        WHERE id = $3
      `, [newReviewerId, reason, assignmentId]);

      // Update workload for both reviewers
      await client.query(`
        UPDATE reviewer_profiles 
        SET current_workload = current_workload - 1,
            updated_at = NOW()
        WHERE id = $1
      `, [oldReviewerId]);

      await client.query(`
        UPDATE reviewer_profiles 
        SET current_workload = current_workload + 1,
            updated_at = NOW()
        WHERE id = $1
      `, [newReviewerId]);

      // Log assignment history
      await this.logAssignmentHistory(client, assignmentId, 'reassigned', {
        previous_reviewer_id: oldReviewerId,
        new_reviewer_id: newReviewerId,
        reason: reason,
        performed_by: performedBy
      });

      await client.query('COMMIT');

      // Get updated assignment
      const updatedResult = await client.query(
        'SELECT * FROM review_assignments WHERE id = $1',
        [assignmentId]
      );

      this.logger.log(`Reassigned review ${assignmentId} from ${oldReviewerId} to ${newReviewerId}`);
      
      return this.mapToReviewAssignment(updatedResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Complete review assignment
   */
  async completeAssignment(assignmentId: string, performedBy: string, completionData?: any): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get assignment details
      const assignmentResult = await client.query(
        'SELECT * FROM review_assignments WHERE id = $1',
        [assignmentId]
      );

      if (assignmentResult.rows.length === 0) {
        throw new Error(`Assignment ${assignmentId} not found`);
      }

      const assignment = assignmentResult.rows[0];
      const actualDuration = assignment.started_at 
        ? (new Date().getTime() - assignment.started_at.getTime()) / (1000 * 60 * 60) // hours
        : null;

      // Update assignment status
      await client.query(`
        UPDATE review_assignments 
        SET status = 'completed',
            completed_at = NOW(),
            actual_duration_hours = $1,
            metadata = metadata || $2
        WHERE id = $3
      `, [actualDuration, JSON.stringify(completionData || {}), assignmentId]);

      // Update reviewer workload and metrics
      await client.query(`
        UPDATE reviewer_profiles 
        SET current_workload = GREATEST(0, current_workload - 1),
            performance_metrics = jsonb_set(
              performance_metrics,
              '{completed_reviews}',
              (COALESCE(performance_metrics->>'completed_reviews', '0')::int + 1)::text::jsonb
            ),
            updated_at = NOW()
        WHERE id = $1
      `, [assignment.reviewer_id]);

      // Log completion
      await this.logAssignmentHistory(client, assignmentId, 'completed', {
        actual_duration_hours: actualDuration,
        performed_by: performedBy,
        completion_data: completionData
      });

      await client.query('COMMIT');

      this.logger.log(`Completed assignment ${assignmentId} by reviewer ${assignment.reviewer_id}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get reviewer workload distribution
   */
  async getWorkloadDistribution(reviewType?: ReviewType): Promise<WorkloadDistribution[]> {
    const client = await this.pool.connect();
    try {
      let query = `
        SELECT 
          rp.id as reviewer_id,
          rp.user_id,
          rp.role,
          rp.current_workload as current_assignments,
          ROUND((rp.current_workload::decimal / NULLIF(rp.capacity_limit, 0)) * 100, 2) as capacity_utilization,
          COALESCE(
            (rp.performance_metrics->>'average_review_time_hours')::decimal, 
            24.0
          ) as avg_completion_time,
          COUNT(CASE WHEN ra.due_date < NOW() AND ra.status = 'active' THEN 1 END) as overdue_count,
          -- Calculate priority score based on availability, performance, and workload
          (
            CASE rp.availability_status
              WHEN 'available' THEN 100
              WHEN 'busy' THEN 70
              WHEN 'away' THEN 30
              ELSE 0
            END +
            COALESCE((rp.performance_metrics->>'quality_score')::int * 10, 50) +
            (100 - LEAST(100, (rp.current_workload::decimal / NULLIF(rp.capacity_limit, 0)) * 100))
          ) as priority_score
        FROM reviewer_profiles rp
        LEFT JOIN review_assignments ra ON rp.id = ra.reviewer_id AND ra.status = 'active'
      `;

      const params = [];
      if (reviewType) {
        query += ' WHERE ra.review_type = $1 OR ra.review_type IS NULL';
        params.push(reviewType);
      }

      query += `
        GROUP BY rp.id, rp.user_id, rp.role, rp.current_workload, rp.capacity_limit, 
                 rp.availability_status, rp.performance_metrics
        ORDER BY priority_score DESC
      `;

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Get assignments for a reviewer
   */
  async getReviewerAssignments(
    reviewerId: string,
    status?: AssignmentStatus,
    limit = 20
  ): Promise<ReviewAssignment[]> {
    const client = await this.pool.connect();
    try {
      let query = 'SELECT * FROM review_assignments WHERE reviewer_id = $1';
      const params = [reviewerId];

      if (status) {
        query += ' AND status = $2';
        params.push(status);
      }

      query += ' ORDER BY assigned_at DESC LIMIT $' + (params.length + 1);
      params.push(limit);

      const result = await client.query(query, params);
      return result.rows.map(this.mapToReviewAssignment);
    } finally {
      client.release();
    }
  }

  // Private helper methods

  private async findBestReviewer(
    request: AssignmentRequest,
    strategy: AssignmentStrategy,
    client: PoolClient
  ): Promise<ReviewerProfile | null> {
    let query = `
      SELECT rp.*, 
             COALESCE(active_assignments.count, 0) as current_active_assignments
      FROM reviewer_profiles rp
      LEFT JOIN (
        SELECT reviewer_id, COUNT(*) as count
        FROM review_assignments
        WHERE status = 'active'
        GROUP BY reviewer_id
      ) active_assignments ON rp.id = active_assignments.reviewer_id
      WHERE rp.availability_status IN ('available', 'busy')
        AND rp.current_workload < rp.capacity_limit
    `;

    const params = [];

    // Filter by required skills if specified
    if (request.required_skills?.length) {
      query += ` AND rp.specializations ?| $${params.length + 1}`;
      params.push(request.required_skills);
    }

    // Exclude specific reviewers if requested
    if (request.excluded_reviewers?.length) {
      query += ` AND rp.id NOT IN (${request.excluded_reviewers.map((_, i) => `$${params.length + i + 1}`).join(', ')})`;
      params.push(...request.excluded_reviewers);
    }

    // Apply strategy-specific ordering
    switch (strategy) {
    case AssignmentStrategy.WORKLOAD_BASED:
      query += ' ORDER BY current_active_assignments ASC, rp.current_workload ASC';
      break;
    case AssignmentStrategy.SKILL_BASED:
      // Calculate skill match score
      if (request.required_skills?.length) {
        query += ` ORDER BY (
            SELECT AVG(COALESCE((skill_ratings->>skill)::int, 0))
            FROM unnest($${params.length + 1}::text[]) as skill
          ) DESC, current_active_assignments ASC`;
        params.push(request.required_skills);
      } else {
        query += ' ORDER BY current_active_assignments ASC';
      }
      break;
    case AssignmentStrategy.ROUND_ROBIN:
      query += ' ORDER BY (rp.performance_metrics->>\'last_review_date\')::timestamp ASC NULLS FIRST';
      break;
    case AssignmentStrategy.RANDOM:
      query += ' ORDER BY RANDOM()';
      break;
    default:
      query += ' ORDER BY current_active_assignments ASC';
    }

    query += ' LIMIT 1';

    const result = await client.query(query, params);
    return result.rows.length > 0 ? this.mapToReviewerProfile(result.rows[0]) : null;
  }

  private async getAssignmentRules(reviewType: ReviewType): Promise<AssignmentRule[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM assignment_rules 
        WHERE review_type = $1 AND enabled = true
        ORDER BY priority_boost DESC
      `, [reviewType]);

      return result.rows.map(row => ({
        ...row,
        conditions: JSON.parse(row.conditions),
        required_skills: JSON.parse(row.required_skills)
      }));
    } finally {
      client.release();
    }
  }

  private selectBestRule(rules: AssignmentRule[], request: AssignmentRequest): AssignmentRule | null {
    // Simple rule selection - could be enhanced with condition evaluation
    return rules.find(rule => 
      !rule.required_skills.length || 
      rule.required_skills.some(skill => request.required_skills?.includes(skill))
    ) || rules[0];
  }

  private calculateDueDate(request: Partial<AssignmentRequest>): Date {
    const now = new Date();
    let hoursToAdd = 24; // Default 24 hours

    switch (request.priority) {
    case 'urgent':
      hoursToAdd = 2;
      break;
    case 'high':
      hoursToAdd = 8;
      break;
    case 'medium':
      hoursToAdd = 24;
      break;
    case 'low':
      hoursToAdd = 72;
      break;
    }

    // Adjust based on review type
    switch (request.review_type) {
    case ReviewType.POLICY_VIOLATION:
      hoursToAdd = Math.min(hoursToAdd, 12); // Policy violations need faster turnaround
      break;
    case ReviewType.VERIFICATION_REQUEST:
      hoursToAdd *= 2; // Verification can take longer
      break;
    }

    return new Date(now.getTime() + (hoursToAdd * 60 * 60 * 1000));
  }

  private estimateDuration(request: AssignmentRequest): number {
    // Estimate review duration based on type and complexity
    const baseDurations: Record<ReviewType, number> = {
      [ReviewType.CONTENT_SUBMISSION]: 0.5,
      [ReviewType.POLICY_VIOLATION]: 1.0,
      [ReviewType.VERIFICATION_REQUEST]: 2.0,
      [ReviewType.APPEAL_REVIEW]: 1.5,
      [ReviewType.FEATURED_CONTENT]: 0.75,
      [ReviewType.TRANSACTION_DISPUTE]: 1.0
    };

    let duration = baseDurations[request.review_type] || 1.0;

    // Adjust based on priority (higher priority items may need more careful review)
    switch (request.priority) {
    case 'urgent':
      duration *= 1.2;
      break;
    case 'high':
      duration *= 1.1;
      break;
    }

    return duration;
  }

  private async logAssignmentHistory(
    client: PoolClient,
    assignmentId: string,
    action: string,
    details: unknown
  ): Promise<void> {
    await client.query(`
      INSERT INTO assignment_history
      (assignment_id, action, previous_reviewer_id, new_reviewer_id, reason, performed_by, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      assignmentId,
      action,
      details.previous_reviewer_id,
      details.new_reviewer_id || details.reviewer_id,
      details.reason,
      details.performed_by,
      JSON.stringify(details)
    ]);
  }

  private async getReviewerProfile(reviewerId: string): Promise<ReviewerProfile | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM reviewer_profiles WHERE id = $1',
        [reviewerId]
      );
      return result.rows.length > 0 ? this.mapToReviewerProfile(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  private mapToReviewerProfile(row: unknown): ReviewerProfile {
    return {
      id: row.id,
      user_id: row.user_id,
      role: row.role,
      specializations: JSON.parse(row.specializations || '[]'),
      capacity_limit: row.capacity_limit,
      current_workload: row.current_workload,
      availability_status: row.availability_status,
      skill_ratings: JSON.parse(row.skill_ratings || '{}'),
      performance_metrics: JSON.parse(row.performance_metrics || '{}'),
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private mapToReviewAssignment(row: unknown): ReviewAssignment {
    return {
      id: row.id,
      review_item_id: row.review_item_id,
      review_type: row.review_type,
      reviewer_id: row.reviewer_id,
      assignment_strategy: row.assignment_strategy,
      assignment_reason: row.assignment_reason,
      status: row.status,
      priority: row.priority,
      assigned_at: row.assigned_at,
      due_date: row.due_date,
      started_at: row.started_at,
      completed_at: row.completed_at,
      assigned_by: row.assigned_by,
      reassignment_count: row.reassignment_count,
      escalation_level: row.escalation_level,
      estimated_duration_hours: parseFloat(row.estimated_duration_hours) || 0,
      actual_duration_hours: parseFloat(row.actual_duration_hours) || undefined,
      metadata: JSON.parse(row.metadata || '{}')
    };
  }
}