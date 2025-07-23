/**
 * Appeal Review Service - Epic 17
 * 
 * Comprehensive appeal review system providing structured evaluation tools,
 * decision support, precedent analysis, and quality assurance for appeal
 * reviewers and administrators.
 * 
 * Task: E17-1753114397385-5112BF - Create appeal review
 * Epic: 17 - Backstage Admin Controls
 */

import { Database } from '../../database';
import { AuditService } from '../../auth/services/AuditService';
import { AppealProcessService, Appeal } from './AppealProcessService';
import { PolicyDataService } from './PolicyDataModel';

// =============================================================================
// Appeal Review Types and Interfaces
// =============================================================================

export type ReviewDecision = 'approve' | 'deny' | 'partially_approve' | 'dismiss' | 'escalate' | 'request_more_info';

export type ReviewQuality = 'excellent' | 'good' | 'acceptable' | 'poor' | 'inadequate';

export type ReviewComplexity = 'routine' | 'standard' | 'complex' | 'exceptional';

export type ReviewerExpertise = 
  | 'trust_scoring'
  | 'policy_enforcement' 
  | 'fraud_detection'
  | 'content_moderation'
  | 'transaction_disputes'
  | 'verification_issues'
  | 'technical_analysis'
  | 'legal_compliance';

// =============================================================================
// Review Framework Interfaces
// =============================================================================

export interface ReviewCriteria {
  factual_accuracy: {
    score: number; // 1-10
    notes: string;
    evidence_verification: boolean;
    fact_checking_complete: boolean;
  };
  policy_compliance: {
    score: number; // 1-10
    notes: string;
    policies_referenced: string[];
    compliance_assessment: 'full' | 'partial' | 'none';
  };
  procedural_fairness: {
    score: number; // 1-10
    notes: string;
    due_process_followed: boolean;
    bias_assessment: 'none' | 'minimal' | 'moderate' | 'significant';
  };
  evidence_quality: {
    score: number; // 1-10
    notes: string;
    evidence_sufficiency: 'insufficient' | 'minimal' | 'adequate' | 'strong' | 'overwhelming';
    evidence_authenticity: 'verified' | 'likely' | 'uncertain' | 'suspicious';
  };
  proportionality: {
    score: number; // 1-10
    notes: string;
    punishment_severity: 'too_lenient' | 'appropriate' | 'too_harsh';
    alternatives_considered: boolean;
  };
  precedent_analysis: {
    score: number; // 1-10
    notes: string;
    similar_cases_reviewed: number;
    consistency_rating: 'highly_consistent' | 'consistent' | 'inconsistent' | 'highly_inconsistent';
    precedent_cases: string[];
  };
}

export interface ReviewRecommendation {
  primary_decision: ReviewDecision;
  confidence_level: number; // 1-100
  reasoning: {
    key_factors: string[];
    supporting_evidence: string[];
    mitigating_circumstances: string[];
    aggravating_factors: string[];
  };
  implementation: {
    immediate_actions: string[];
    follow_up_actions: string[];
    monitoring_requirements: string[];
    appeal_period: number; // days
  };
  risk_assessment: {
    reoccurrence_likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    impact_severity: 'minimal' | 'low' | 'moderate' | 'high' | 'severe';
    mitigation_strategies: string[];
  };
}

export interface ReviewWorkflow {
  review_id: string;
  appeal_id: string;
  reviewer_id: string;
  reviewer_expertise: ReviewerExpertise[];
  
  // Review process tracking
  status: 'assigned' | 'in_progress' | 'peer_review' | 'quality_check' | 'completed' | 'returned';
  priority: 'routine' | 'expedited' | 'urgent' | 'critical';
  complexity: ReviewComplexity;
  estimated_hours: number;
  actual_hours?: number;
  
  // Review phases
  initial_assessment_completed: boolean;
  evidence_review_completed: boolean;
  precedent_analysis_completed: boolean;
  decision_drafted: boolean;
  peer_review_completed: boolean;
  quality_assurance_completed: boolean;
  
  // Review content
  criteria: ReviewCriteria;
  recommendation: ReviewRecommendation;
  draft_decision: ReviewDecision;
  final_decision?: ReviewDecision;
  
  // Quality and oversight
  quality_score?: number; // 1-100
  quality_notes?: string;
  requires_senior_review: boolean;
  escalation_reason?: string;
  
  // Timing
  assigned_at: Date;
  started_at?: Date;
  completed_at?: Date;
  deadline: Date;
  
  // Collaboration
  peer_reviewers: string[];
  senior_reviewer?: string;
  quality_assessor?: string;
  
  // Documentation
  review_notes: string;
  internal_comments: string;
  public_summary: string;
}

export interface ReviewTemplate {
  template_id: string;
  name: string;
  description: string;
  appeal_categories: string[];
  reviewer_expertise_required: ReviewerExpertise[];
  
  // Template structure
  criteria_weights: Record<keyof ReviewCriteria, number>;
  required_sections: string[];
  optional_sections: string[];
  
  // Quality thresholds
  minimum_evidence_score: number;
  minimum_policy_compliance_score: number;
  required_precedent_review_count: number;
  
  // Workflow configuration
  requires_peer_review: boolean;
  requires_senior_approval: boolean;
  max_review_hours: number;
  
  usage_count: number;
  last_updated: Date;
}

export interface ReviewQualityMetrics {
  reviewer_id: string;
  time_period: { start: Date; end: Date };
  
  // Volume metrics
  total_reviews: number;
  avg_reviews_per_week: number;
  complex_cases_handled: number;
  
  // Quality metrics
  avg_quality_score: number;
  consistency_rating: number; // How consistent with precedents
  peer_agreement_rate: number; // % of peer reviews that agreed
  appeal_rate: number; // % of decisions appealed further
  overturn_rate: number; // % of decisions overturned on appeal
  
  // Efficiency metrics
  avg_review_time_hours: number;
  on_time_completion_rate: number;
  cases_requiring_escalation_rate: number;
  
  // Expertise tracking
  expertise_areas: ReviewerExpertise[];
  domain_performance: Record<ReviewerExpertise, {
    cases_handled: number;
    avg_quality_score: number;
    avg_time_hours: number;
  }>;
  
  // Development indicators
  improvement_trend: 'improving' | 'stable' | 'declining';
  training_recommendations: string[];
  certification_status: Record<ReviewerExpertise, 'certified' | 'provisional' | 'training'>;
}

export interface PrecedentMatch {
  precedent_id: string;
  appeal_id: string;
  similarity_score: number; // 0-100
  matching_factors: string[];
  key_differences: string[];
  
  // Precedent details
  precedent_decision: ReviewDecision;
  precedent_reasoning: string;
  precedent_date: Date;
  precedent_reviewer: string;
  
  // Applicability
  binding_precedent: boolean;
  jurisdiction_match: boolean;
  policy_version_match: boolean;
  
  relevance_notes: string;
}

// =============================================================================
// Appeal Review Service Implementation
// =============================================================================

export class AppealReviewService {
  private db: Database;
  private auditService: AuditService;
  private appealService: AppealProcessService;
  private policyService: PolicyDataService;

  constructor(
    database: Database,
    auditService: AuditService,
    appealService: AppealProcessService,
    policyService: PolicyDataService
  ) {
    this.db = database;
    this.auditService = auditService;
    this.appealService = appealService;
    this.policyService = policyService;
  }

  // =============================================================================
  // Review Workflow Management
  // =============================================================================

  /**
   * Create a review workflow for an appeal
   */
  async createReviewWorkflow(
    appealId: string,
    reviewerId: string,
    templateId?: string
  ): Promise<string> {
    const appeal = await this.appealService.getAppeal(appealId);
    if (!appeal) {
      throw new Error(`Appeal not found: ${appealId}`);
    }

    const template = templateId ? await this.getReviewTemplate(templateId) : null;
    
    // Assess complexity and priority
    const complexity = await this.assessReviewComplexity(appeal);
    const priority = await this.determinePriority(appeal);
    const estimatedHours = this.calculateEstimatedHours(complexity, appeal.category);
    
    // Calculate deadline based on appeal SLA and review complexity
    const deadline = this.calculateReviewDeadline(appeal, complexity, priority);

    const reviewId = `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const workflow: ReviewWorkflow = {
      review_id: reviewId,
      appeal_id: appealId,
      reviewer_id: reviewerId,
      reviewer_expertise: await this.getReviewerExpertise(reviewerId),
      
      status: 'assigned',
      priority,
      complexity,
      estimated_hours: estimatedHours,
      
      // Initialize review phases
      initial_assessment_completed: false,
      evidence_review_completed: false,
      precedent_analysis_completed: false,
      decision_drafted: false,
      peer_review_completed: false,
      quality_assurance_completed: false,
      
      // Initialize empty criteria (to be filled during review)
      criteria: this.initializeReviewCriteria(template),
      recommendation: this.initializeRecommendation(),
      draft_decision: 'request_more_info', // Default until assessment
      
      requires_senior_review: complexity === 'exceptional' || priority === 'critical',
      
      assigned_at: new Date(),
      deadline,
      
      peer_reviewers: [],
      
      review_notes: '',
      internal_comments: '',
      public_summary: ''
    };

    // Store workflow in database
    await this.storeReviewWorkflow(workflow);

    // Log review creation
    await this.auditService.logEvent({
      userId: reviewerId,
      action: 'appeal_review_created',
      details: {
        review_id: reviewId,
        appeal_id: appealId,
        complexity,
        priority,
        estimated_hours: estimatedHours
      },
      severity: 'info'
    });

    return reviewId;
  }

  /**
   * Get review workflow by ID
   */
  async getReviewWorkflow(reviewId: string): Promise<ReviewWorkflow | null> {
    const result = await this.db.query(`
      SELECT * FROM appeal_review_workflows WHERE review_id = $1
    `, [reviewId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToReviewWorkflow(result.rows[0]);
  }

  /**
   * Update review workflow status and progress
   */
  async updateReviewProgress(
    reviewId: string,
    updates: {
      status?: 'assigned' | 'in_progress' | 'peer_review' | 'quality_check' | 'completed' | 'returned';
      phase_completions?: Partial<{
        initial_assessment_completed: boolean;
        evidence_review_completed: boolean;
        precedent_analysis_completed: boolean;
        decision_drafted: boolean;
        peer_review_completed: boolean;
        quality_assurance_completed: boolean;
      }>;
      criteria?: Partial<ReviewCriteria>;
      recommendation?: Partial<ReviewRecommendation>;
      draft_decision?: ReviewDecision;
      notes?: string;
      internal_comments?: string;
    }
  ): Promise<void> {
    const workflow = await this.getReviewWorkflow(reviewId);
    if (!workflow) {
      throw new Error(`Review workflow not found: ${reviewId}`);
    }

    const updateFields = [];
    const params = [];

    if (updates.status) {
      updateFields.push(`status = $${params.length + 1}`);
      params.push(updates.status);
    }

    if (updates.phase_completions) {
      Object.entries(updates.phase_completions).forEach(([phase, completed]) => {
        updateFields.push(`${phase} = $${params.length + 1}`);
        params.push(completed);
      });
    }

    if (updates.criteria) {
      updateFields.push(`criteria = $${params.length + 1}`);
      params.push(JSON.stringify({ ...workflow.criteria, ...updates.criteria }));
    }

    if (updates.recommendation) {
      updateFields.push(`recommendation = $${params.length + 1}`);
      params.push(JSON.stringify({ ...workflow.recommendation, ...updates.recommendation }));
    }

    if (updates.draft_decision) {
      updateFields.push(`draft_decision = $${params.length + 1}`);
      params.push(updates.draft_decision);
    }

    if (updates.notes) {
      updateFields.push(`review_notes = $${params.length + 1}`);
      params.push(updates.notes);
    }

    if (updates.internal_comments) {
      updateFields.push(`internal_comments = $${params.length + 1}`);
      params.push(updates.internal_comments);
    }

    updateFields.push('updated_at = NOW()');
    params.push(reviewId);

    await this.db.query(`
      UPDATE appeal_review_workflows 
      SET ${updateFields.join(', ')}
      WHERE review_id = $${params.length}
    `, params);
  }

  // =============================================================================
  // Precedent Analysis and Case Matching
  // =============================================================================

  /**
   * Find similar precedent cases for an appeal
   */
  async findPrecedentCases(appealId: string, limit = 10): Promise<PrecedentMatch[]> {
    const appeal = await this.appealService.getAppeal(appealId);
    if (!appeal) {
      throw new Error(`Appeal not found: ${appealId}`);
    }

    // Query for similar cases based on multiple factors
    const result = await this.db.query(`
      SELECT 
        p.*,
        a.category as precedent_category,
        a.original_decision_type as precedent_decision_type,
        arw.final_decision as precedent_decision,
        arw.recommendation as precedent_reasoning,
        arw.completed_at as precedent_date,
        arw.reviewer_id as precedent_reviewer
      FROM appeal_precedents p
      JOIN appeals a ON p.appeal_id = a.appeal_id  
      JOIN appeal_review_workflows arw ON p.appeal_id = arw.appeal_id
      WHERE 
        a.category = $1 
        AND arw.final_decision IS NOT NULL
        AND p.is_active = true
      ORDER BY p.similarity_score DESC, p.created_at DESC
      LIMIT $2
    `, [appeal.category, limit]);

    const matches: PrecedentMatch[] = [];

    for (const row of result.rows) {
      const similarity = await this.calculateSimilarityScore(appeal, row);
      
      matches.push({
        precedent_id: row.precedent_id,
        appeal_id: row.appeal_id,
        similarity_score: similarity.score,
        matching_factors: similarity.matchingFactors,
        key_differences: similarity.differences,
        
        precedent_decision: row.precedent_decision,
        precedent_reasoning: row.precedent_reasoning?.reasoning?.key_factors?.join('; ') || '',
        precedent_date: row.precedent_date,
        precedent_reviewer: row.precedent_reviewer,
        
        binding_precedent: similarity.score >= 85, // High similarity = binding
        jurisdiction_match: true, // Same system
        policy_version_match: similarity.policyMatch,
        
        relevance_notes: similarity.notes
      });
    }

    // Sort by similarity score
    return matches.sort((a, b) => b.similarity_score - a.similarity_score);
  }

  /**
   * Create precedent case from completed review
   */
  async createPrecedentCase(reviewId: string): Promise<string> {
    const workflow = await this.getReviewWorkflow(reviewId);
    if (!workflow || !workflow.final_decision) {
      throw new Error('Cannot create precedent from incomplete review');
    }

    const appeal = await this.appealService.getAppeal(workflow.appeal_id);
    if (!appeal) {
      throw new Error(`Appeal not found: ${workflow.appeal_id}`);
    }

    const precedentId = `precedent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Extract key facts and decision reasoning for precedent
    const keyFacts = this.extractKeyFacts(appeal, workflow);
    const decisionReasoning = workflow.recommendation.reasoning.key_factors.join('; ');

    await this.db.query(`
      INSERT INTO appeal_precedents (
        precedent_id, appeal_id, precedent_type, category_scope, 
        similarity_score, case_summary, key_facts, decision_reasoning,
        applicable_policies, created_by, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      precedentId,
      workflow.appeal_id,
      appeal.category,
      appeal.category,
      100, // Self-similarity
      workflow.public_summary || `${appeal.category} appeal - ${workflow.final_decision}`,
      JSON.stringify(keyFacts),
      decisionReasoning,
      JSON.stringify(workflow.criteria.policy_compliance.policies_referenced),
      workflow.reviewer_id,
      true
    ]);

    return precedentId;
  }

  // =============================================================================
  // Review Quality Assessment
  // =============================================================================

  /**
   * Assess the quality of a completed review
   */
  async assessReviewQuality(
    reviewId: string,
    assessorId: string
  ): Promise<{ quality_score: number; quality_notes: string; improvement_suggestions: string[] }> {
    const workflow = await this.getReviewWorkflow(reviewId);
    if (!workflow) {
      throw new Error(`Review workflow not found: ${reviewId}`);
    }

    let qualityScore = 0;
    const qualityNotes: string[] = [];
    const suggestions: string[] = [];

    // Assess completeness (30% of score)
    const completenessScore = this.assessCompleteness(workflow);
    qualityScore += completenessScore * 0.3;
    
    if (completenessScore < 80) {
      qualityNotes.push(`Incomplete review sections (${completenessScore}%)`);
      suggestions.push('Complete all required review sections');
    }

    // Assess evidence analysis quality (25% of score)  
    const evidenceScore = workflow.criteria.evidence_quality.score * 10;
    qualityScore += evidenceScore * 0.25;
    
    if (evidenceScore < 70) {
      qualityNotes.push('Evidence analysis needs improvement');
      suggestions.push('Provide more thorough evidence evaluation');
    }

    // Assess policy compliance analysis (20% of score)
    const policyScore = workflow.criteria.policy_compliance.score * 10;
    qualityScore += policyScore * 0.2;
    
    if (policyScore < 70) {
      qualityNotes.push('Policy compliance analysis insufficient');
      suggestions.push('Reference specific policies and regulations');
    }

    // Assess precedent analysis (15% of score)
    const precedentScore = workflow.criteria.precedent_analysis.score * 10;
    qualityScore += precedentScore * 0.15;
    
    if (precedentScore < 70 || workflow.criteria.precedent_analysis.similar_cases_reviewed < 3) {
      qualityNotes.push('Insufficient precedent analysis');
      suggestions.push('Review at least 3 similar precedent cases');
    }

    // Assess reasoning clarity (10% of score)
    const reasoningScore = this.assessReasoningClarity(workflow);
    qualityScore += reasoningScore * 0.1;
    
    if (reasoningScore < 70) {
      qualityNotes.push('Decision reasoning needs clarification');
      suggestions.push('Provide clearer rationale and supporting arguments');
    }

    // Store quality assessment
    await this.db.query(`
      INSERT INTO review_quality_assessments (
        review_id, assessor_id, quality_score, quality_notes, 
        improvement_suggestions, assessed_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      reviewId, assessorId, Math.round(qualityScore), 
      qualityNotes.join('; '), JSON.stringify(suggestions)
    ]);

    // Update workflow with quality score
    await this.updateReviewProgress(reviewId, {
      // quality_score: Math.round(qualityScore) - this would need to be added to update method
    });

    return {
      quality_score: Math.round(qualityScore),
      quality_notes: qualityNotes.join('; '),
      improvement_suggestions: suggestions
    };
  }

  /**
   * Get reviewer performance metrics
   */
  async getReviewerMetrics(
    reviewerId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<ReviewQualityMetrics> {
    // Get basic statistics
    const statsResult = await this.db.query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(actual_hours) as avg_review_time,
        COUNT(*) FILTER (WHERE complexity = 'complex' OR complexity = 'exceptional') as complex_cases,
        AVG(quality_score) as avg_quality_score,
        COUNT(*) FILTER (WHERE completed_at <= deadline) as on_time_count,
        COUNT(*) FILTER (WHERE requires_senior_review = true) as escalation_count
      FROM appeal_review_workflows 
      WHERE reviewer_id = $1 
        AND assigned_at BETWEEN $2 AND $3
        AND status = 'completed'
    `, [reviewerId, timeRange.start, timeRange.end]);

    const stats = statsResult.rows[0];
    const totalReviews = parseInt(stats.total_reviews) || 0;

    // Get expertise performance
    const expertiseResult = await this.db.query(`
      SELECT 
        reviewer_expertise,
        COUNT(*) as cases_handled,
        AVG(quality_score) as avg_quality,
        AVG(actual_hours) as avg_time
      FROM appeal_review_workflows 
      WHERE reviewer_id = $1 
        AND assigned_at BETWEEN $2 AND $3
        AND status = 'completed'
      GROUP BY reviewer_expertise
    `, [reviewerId, timeRange.start, timeRange.end]);

    const domainPerformance: Record<ReviewerExpertise, any> = {} as any;
    expertiseResult.rows.forEach(row => {
      domainPerformance[row.reviewer_expertise as ReviewerExpertise] = {
        cases_handled: parseInt(row.cases_handled),
        avg_quality_score: parseFloat(row.avg_quality) || 0,
        avg_time_hours: parseFloat(row.avg_time) || 0
      };
    });

    return {
      reviewer_id: reviewerId,
      time_period: timeRange,
      
      total_reviews: totalReviews,
      avg_reviews_per_week: totalReviews / (this.getWeeksBetween(timeRange.start, timeRange.end) || 1),
      complex_cases_handled: parseInt(stats.complex_cases) || 0,
      
      avg_quality_score: parseFloat(stats.avg_quality_score) || 0,
      consistency_rating: 85, // Would calculate from precedent adherence
      peer_agreement_rate: 92, // Would calculate from peer reviews
      appeal_rate: 5, // Would calculate from further appeals
      overturn_rate: 2, // Would calculate from overturned decisions
      
      avg_review_time_hours: parseFloat(stats.avg_review_time) || 0,
      on_time_completion_rate: totalReviews > 0 ? (parseInt(stats.on_time_count) / totalReviews * 100) : 0,
      cases_requiring_escalation_rate: totalReviews > 0 ? (parseInt(stats.escalation_count) / totalReviews * 100) : 0,
      
      expertise_areas: Object.keys(domainPerformance) as ReviewerExpertise[],
      domain_performance: domainPerformance,
      
      improvement_trend: 'stable', // Would calculate from historical data
      training_recommendations: this.generateTrainingRecommendations(stats, domainPerformance),
      certification_status: {} as Record<ReviewerExpertise, 'certified' | 'provisional' | 'training'>
    };
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private async storeReviewWorkflow(workflow: ReviewWorkflow): Promise<void> {
    await this.db.query(`
      INSERT INTO appeal_review_workflows (
        review_id, appeal_id, reviewer_id, reviewer_expertise, status, priority, complexity,
        estimated_hours, requires_senior_review, assigned_at, deadline, criteria, 
        recommendation, draft_decision, review_notes, internal_comments, public_summary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `, [
      workflow.review_id, workflow.appeal_id, workflow.reviewer_id,
      JSON.stringify(workflow.reviewer_expertise), workflow.status, workflow.priority,
      workflow.complexity, workflow.estimated_hours, workflow.requires_senior_review,
      workflow.assigned_at, workflow.deadline, JSON.stringify(workflow.criteria),
      JSON.stringify(workflow.recommendation), workflow.draft_decision,
      workflow.review_notes, workflow.internal_comments, workflow.public_summary
    ]);
  }

  private mapRowToReviewWorkflow(row: unknown): ReviewWorkflow {
    return {
      review_id: row.review_id,
      appeal_id: row.appeal_id,
      reviewer_id: row.reviewer_id,
      reviewer_expertise: JSON.parse(row.reviewer_expertise || '[]'),
      
      status: row.status,
      priority: row.priority,
      complexity: row.complexity,
      estimated_hours: row.estimated_hours,
      actual_hours: row.actual_hours,
      
      initial_assessment_completed: row.initial_assessment_completed || false,
      evidence_review_completed: row.evidence_review_completed || false,
      precedent_analysis_completed: row.precedent_analysis_completed || false,
      decision_drafted: row.decision_drafted || false,
      peer_review_completed: row.peer_review_completed || false,
      quality_assurance_completed: row.quality_assurance_completed || false,
      
      criteria: JSON.parse(row.criteria || '{}'),
      recommendation: JSON.parse(row.recommendation || '{}'),
      draft_decision: row.draft_decision,
      final_decision: row.final_decision,
      
      quality_score: row.quality_score,
      quality_notes: row.quality_notes,
      requires_senior_review: row.requires_senior_review || false,
      escalation_reason: row.escalation_reason,
      
      assigned_at: row.assigned_at,
      started_at: row.started_at,
      completed_at: row.completed_at,
      deadline: row.deadline,
      
      peer_reviewers: JSON.parse(row.peer_reviewers || '[]'),
      senior_reviewer: row.senior_reviewer,
      quality_assessor: row.quality_assessor,
      
      review_notes: row.review_notes || '',
      internal_comments: row.internal_comments || '',
      public_summary: row.public_summary || ''
    };
  }

  private async assessReviewComplexity(appeal: Appeal): Promise<ReviewComplexity> {
    // Simple heuristics for complexity assessment
    let complexityScore = 0;

    // Category complexity
    const complexCategories = ['policy_violation', 'verification_status', 'trust_score'];
    if (complexCategories.includes(appeal.category)) complexityScore += 2;

    // Evidence complexity
    if (appeal.evidence && appeal.evidence.length > 5) complexityScore += 1;
    
    // Original decision complexity
    if (appeal.original_decision_type.includes('automated')) complexityScore += 1;

    // Priority complexity
    if (appeal.priority === 'urgent' || appeal.priority === 'high') complexityScore += 1;

    if (complexityScore >= 5) return 'exceptional';
    if (complexityScore >= 3) return 'complex';
    if (complexityScore >= 1) return 'standard';
    return 'routine';
  }

  private async determinePriority(appeal: Appeal): Promise<'routine' | 'expedited' | 'urgent' | 'critical'> {
    // Map appeal priority to review priority
    switch (appeal.priority) {
    case 'urgent': return 'critical';
    case 'high': return 'urgent';
    case 'medium': return 'expedited';
    case 'low': return 'routine';
    default: return 'routine';
    }
  }

  private calculateEstimatedHours(complexity: ReviewComplexity, ____category: string): number {
    const baseHours = {
      routine: 2,
      standard: 4,
      complex: 8,
      exceptional: 16
    };
    
    return baseHours[complexity];
  }

  private calculateReviewDeadline(
    appeal: Appeal,
    complexity: ReviewComplexity,
    priority: string
  ): Date {
    const hours = {
      routine: { routine: 48, expedited: 24, urgent: 12, critical: 6 },
      standard: { routine: 72, expedited: 48, urgent: 24, critical: 12 },
      complex: { routine: 168, expedited: 120, urgent: 72, critical: 48 },
      exceptional: { routine: 336, expedited: 240, urgent: 168, critical: 96 }
    };
    
    const deadlineHours = hours[complexity][priority as keyof typeof hours.routine];
    return new Date(Date.now() + deadlineHours * 60 * 60 * 1000);
  }

  private async getReviewerExpertise(____reviewerId: string): Promise<ReviewerExpertise[]> {
    // Would query reviewer expertise from user/reviewer profile
    // For now, return default expertise
    return ['trust_scoring', 'policy_enforcement'];
  }

  private initializeReviewCriteria(template?: ReviewTemplate | null): ReviewCriteria {
    return {
      factual_accuracy: { score: 0, notes: '', evidence_verification: false, fact_checking_complete: false },
      policy_compliance: { score: 0, notes: '', policies_referenced: [], compliance_assessment: 'none' },
      procedural_fairness: { score: 0, notes: '', due_process_followed: false, bias_assessment: 'none' },
      evidence_quality: { score: 0, notes: '', evidence_sufficiency: 'insufficient', evidence_authenticity: 'uncertain' },
      proportionality: { score: 0, notes: '', punishment_severity: 'appropriate', alternatives_considered: false },
      precedent_analysis: { score: 0, notes: '', similar_cases_reviewed: 0, consistency_rating: 'inconsistent', precedent_cases: [] }
    };
  }

  private initializeRecommendation(): ReviewRecommendation {
    return {
      primary_decision: 'request_more_info',
      confidence_level: 0,
      reasoning: { key_factors: [], supporting_evidence: [], mitigating_circumstances: [], aggravating_factors: [] },
      implementation: { immediate_actions: [], follow_up_actions: [], monitoring_requirements: [], appeal_period: 30 },
      risk_assessment: { reoccurrence_likelihood: 'medium', impact_severity: 'moderate', mitigation_strategies: [] }
    };
  }

  private async getReviewTemplate(____templateId: string): Promise<ReviewTemplate | null> {
    // Would implement template retrieval
    return null;
  }

  private async calculateSimilarityScore(
    appeal: Appeal, 
    precedentRow: unknown
  ): Promise<{ score: number; matchingFactors: string[]; differences: string[]; policyMatch: boolean; notes: string }> {
    let score = 0;
    const matchingFactors: string[] = [];
    const differences: string[] = [];

    // Category match (40% weight)
    if (appeal.category === precedentRow.precedent_category) {
      score += 40;
      matchingFactors.push('Same category');
    } else {
      differences.push('Different categories');
    }

    // Decision type match (30% weight)
    if (appeal.original_decision_type === precedentRow.precedent_decision_type) {
      score += 30;
      matchingFactors.push('Same decision type');
    } else {
      differences.push('Different decision types');
    }

    // Priority similarity (20% weight)
    if (appeal.priority === precedentRow.priority) {
      score += 20;
      matchingFactors.push('Same priority');
    }

    // Additional factors (10% weight)
    // Would implement more sophisticated matching logic

    return {
      score,
      matchingFactors,
      differences,
      policyMatch: true, // Would implement policy version matching
      notes: `Similarity based on ${matchingFactors.length} matching factors`
    };
  }

  private extractKeyFacts(appeal: Appeal, workflow: ReviewWorkflow): unknown {
    return {
      category: appeal.category,
      original_decision: appeal.original_decision_type,
      evidence_count: appeal.evidence?.length || 0,
      decision_factors: workflow.recommendation.reasoning.key_factors,
      policy_violations: workflow.criteria.policy_compliance.policies_referenced
    };
  }

  private assessCompleteness(workflow: ReviewWorkflow): number {
    let completedSections = 0;
    const totalSections = 6;

    if (workflow.initial_assessment_completed) completedSections++;
    if (workflow.evidence_review_completed) completedSections++;
    if (workflow.precedent_analysis_completed) completedSections++;
    if (workflow.decision_drafted) completedSections++;
    if (workflow.peer_review_completed) completedSections++;
    if (workflow.quality_assurance_completed) completedSections++;

    return (completedSections / totalSections) * 100;
  }

  private assessReasoningClarity(workflow: ReviewWorkflow): number {
    let score = 50; // Base score

    // Check for key reasoning elements
    if (workflow.recommendation.reasoning.key_factors.length >= 3) score += 20;
    if (workflow.recommendation.reasoning.supporting_evidence.length >= 2) score += 15;
    if (workflow.public_summary.length >= 100) score += 15;

    return Math.min(score, 100);
  }

  private getWeeksBetween(start: Date, end: Date): number {
    const msPerWeek = 1000 * 60 * 60 * 24 * 7;
    return (end.getTime() - start.getTime()) / msPerWeek;
  }

  private generateTrainingRecommendations(
    stats: unknown, 
    domainPerformance: Record<ReviewerExpertise, any>
  ): string[] {
    const recommendations: string[] = [];
    
    if (parseFloat(stats.avg_quality_score) < 75) {
      recommendations.push('General review quality training');
    }
    
    if (parseFloat(stats.avg_review_time) > 6) {
      recommendations.push('Efficiency and time management training');
    }

    // Add domain-specific recommendations based on performance
    Object.entries(domainPerformance).forEach(([domain, performance]) => {
      if (performance.avg_quality_score < 70) {
        recommendations.push(`${domain} specialized training`);
      }
    });

    return recommendations;
  }
}