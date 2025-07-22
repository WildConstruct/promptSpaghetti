/**
 * Reviewer Assignment Service - Epic 17
 * 
 * Intelligent reviewer assignment service that matches reviews to reviewers
 * based on expertise, availability, workload, and performance metrics.
 * Implements multiple assignment strategies with load balancing.
 * 
 * Task: E17-1753114397301-5C1461 - Develop review tools
 * Epic: 17 - Backstage Admin Controls
 */

import { Database } from '../../database';
import { AuditService } from '../auth/services/AuditService';
import {
  ReviewerProfile,
  ReviewItem,
  ReviewType,
  AssignmentRule,
  AssignmentType,
  AssignmentCondition,
  AssignmentWeighting,
  WeightingFactor,
  FallbackStrategy,
  ReviewComplexity,
  SpecializationArea,
  ExpertiseLevel,
  ReviewPriority,
  AvailabilityStatus,
  ReviewAssignment
} from '../../../packages/core/types/ReviewTools';

export interface AssignmentRecommendation {
  reviewerId: string;
  score: number;
  confidence: number;
  reasons: AssignmentReason[];
  expectedCompletionTime: number; // minutes
  riskFactors: string[];
  alternativeReviewers: string[];
}

export interface AssignmentReason {
  factor: WeightingFactor;
  weight: number;
  contribution: number;
  description: string;
}

export interface AssignmentStrategy {
  name: AssignmentType;
  description: string;
  weights: Record<WeightingFactor, number>;
  fallback: FallbackStrategy;
  enabled: boolean;
}

export class ReviewerAssignmentService {
  private db: Database;
  private auditService: AuditService;
  
  // Assignment strategies
  private strategies: Map<AssignmentType, AssignmentStrategy> = new Map();
  
  // Caches for performance
  private reviewerCache: Map<string, ReviewerProfile> = new Map();
  private assignmentRulesCache: Map<ReviewType, AssignmentRule[]> = new Map();
  
  constructor(database: Database, auditService: AuditService) {
    this.db = database;
    this.auditService = auditService;
    this.initializeStrategies();
  }

  // =============================================================================
  // Core Assignment Methods
  // =============================================================================

  /**
   * Find the best reviewer for a review using configured assignment rules
   */
  async findBestReviewer(
    review: ReviewItem,
    excludeReviewers: string[] = []
  ): Promise<AssignmentRecommendation | null> {
    console.log(`🎯 Finding best reviewer for ${review.reviewType} review: ${review.reviewId}`);

    // Get assignment rules for this review type
    const rules = await this.getAssignmentRules(review.reviewType);
    if (rules.length === 0) {
      console.log(`⚠️ No assignment rules configured for ${review.reviewType}`);
      return await this.fallbackAssignment(review, excludeReviewers);
    }

    // Get available reviewers
    const availableReviewers = await this.getAvailableReviewers(
      review.reviewType,
      review.metadata.complexity,
      excludeReviewers
    );

    if (availableReviewers.length === 0) {
      console.log(`⚠️ No available reviewers for ${review.reviewType}`);
      return null;
    }

    // Score reviewers using the primary assignment rule
    const primaryRule = rules[0]; // Use first rule as primary
    const scoredReviewers = await this.scoreReviewers(review, availableReviewers, primaryRule);

    if (scoredReviewers.length === 0) {
      return null;
    }

    const bestMatch = scoredReviewers[0];
    console.log(`✅ Best reviewer found: ${bestMatch.reviewerId} (score: ${bestMatch.score.toFixed(2)})`);

    return bestMatch;
  }

  /**
   * Get multiple reviewer recommendations for consensus reviews
   */
  async findConsensusReviewers(
    review: ReviewItem,
    requiredReviewers: number,
    excludeReviewers: string[] = []
  ): Promise<AssignmentRecommendation[]> {
    console.log(`👥 Finding ${requiredReviewers} reviewers for consensus review: ${review.reviewId}`);

    const recommendations: AssignmentRecommendation[] = [];
    const currentExclusions = [...excludeReviewers];

    for (let i = 0; i < requiredReviewers; i++) {
      const recommendation = await this.findBestReviewer(review, currentExclusions);
      
      if (!recommendation) {
        console.log(`⚠️ Could not find reviewer ${i + 1} of ${requiredReviewers}`);
        break;
      }

      recommendations.push(recommendation);
      currentExclusions.push(recommendation.reviewerId);
    }

    // Ensure diversity in reviewer selection
    const diverseRecommendations = this.ensureReviewerDiversity(recommendations);

    console.log(`✅ Found ${diverseRecommendations.length} reviewers for consensus`);
    return diverseRecommendations;
  }

  /**
   * Recommend reviewer reassignment for stuck or problematic reviews
   */
  async recommendReassignment(
    review: ReviewItem,
    currentReviewerId: string,
    reason: ReassignmentReason
  ): Promise<AssignmentRecommendation | null> {
    console.log(`🔄 Recommending reassignment for review ${review.reviewId}: ${reason}`);

    // Get current reviewer's profile for context
    const currentReviewer = await this.getReviewer(currentReviewerId);
    if (!currentReviewer) {
      throw new Error(`Current reviewer not found: ${currentReviewerId}`);
    }

    // Determine reassignment strategy based on reason
    const strategy = this.getReassignmentStrategy(reason, currentReviewer);

    // Find replacement reviewer
    const recommendation = await this.findBestReviewer(review, [currentReviewerId]);
    
    if (recommendation) {
      // Add reassignment context
      recommendation.riskFactors.push(`Reassigning from ${currentReviewerId} due to ${reason}`);
      
      // Adjust confidence based on reassignment reason
      const confidenceAdjustment = this.getReassignmentConfidenceAdjustment(reason);
      recommendation.confidence = Math.max(0, recommendation.confidence + confidenceAdjustment);
    }

    return recommendation;
  }

  /**
   * Balance workload across reviewers
   */
  async rebalanceWorkload(
    reviewType?: ReviewType,
    targetUtilization: number = 80
  ): Promise<WorkloadRebalanceResult> {
    console.log(`⚖️ Rebalancing workload for ${reviewType || 'all'} reviews`);

    const reviewers = await this.getActiveReviewers(reviewType);
    const overloadedReviewers = reviewers.filter(r => r.workload.capacityUtilization > targetUtilization);
    const underutilizedReviewers = reviewers.filter(r => r.workload.capacityUtilization < targetUtilization - 20);

    const rebalanceActions: WorkloadRebalanceAction[] = [];

    for (const overloaded of overloadedReviewers) {
      // Find reviews that can be reassigned
      const reassignableReviews = await this.getReassignableReviews(overloaded.reviewerId);
      
      for (const review of reassignableReviews) {
        if (underutilizedReviewers.length === 0) break;

        // Find best underutilized reviewer for this review
        const targetReviewer = await this.findBestAvailableReviewer(
          review,
          underutilizedReviewers.map(r => r.reviewerId)
        );

        if (targetReviewer) {
          rebalanceActions.push({
            reviewId: review.reviewId,
            fromReviewerId: overloaded.reviewerId,
            toReviewerId: targetReviewer,
            reason: 'workload_rebalancing',
            expectedBenefit: this.calculateRebalanceBenefit(overloaded, targetReviewer)
          });

          // Update utilization for simulation
          overloaded.workload.capacityUtilization -= 10; // Approximate reduction
          const targetReviewerProfile = underutilizedReviewers.find(r => r.reviewerId === targetReviewer);
          if (targetReviewerProfile) {
            targetReviewerProfile.workload.capacityUtilization += 10; // Approximate increase
          }
        }
      }
    }

    return {
      totalReviewers: reviewers.length,
      overloadedCount: overloadedReviewers.length,
      underutilizedCount: underutilizedReviewers.length,
      recommendedActions: rebalanceActions,
      projectedImprovement: this.calculateProjectedImprovement(rebalanceActions)
    };
  }

  // =============================================================================
  // Reviewer Scoring and Matching
  // =============================================================================

  /**
   * Score reviewers against a review using assignment rules
   */
  private async scoreReviewers(
    review: ReviewItem,
    reviewers: ReviewerProfile[],
    rule: AssignmentRule
  ): Promise<AssignmentRecommendation[]> {
    const scoredReviewers: AssignmentRecommendation[] = [];

    for (const reviewer of reviewers) {
      const score = await this.calculateReviewerScore(review, reviewer, rule);
      
      if (score.score >= 0.3) { // Minimum threshold
        scoredReviewers.push(score);
      }
    }

    // Sort by score descending
    return scoredReviewers.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate comprehensive score for a reviewer-review match
   */
  private async calculateReviewerScore(
    review: ReviewItem,
    reviewer: ReviewerProfile,
    rule: AssignmentRule
  ): Promise<AssignmentRecommendation> {
    const reasons: AssignmentReason[] = [];
    let totalScore = 0;
    let confidence = 100;
    const riskFactors: string[] = [];

    // Availability scoring
    const availabilityScore = this.scoreAvailability(reviewer, review.priority);
    totalScore += availabilityScore.score * (rule.weightings.find(w => w.factor === 'availability')?.weight || 0.2);
    reasons.push(availabilityScore.reason);

    // Workload scoring
    const workloadScore = this.scoreWorkload(reviewer);
    totalScore += workloadScore.score * (rule.weightings.find(w => w.factor === 'workload')?.weight || 0.2);
    reasons.push(workloadScore.reason);
    if (workloadScore.risk) riskFactors.push(workloadScore.risk);

    // Expertise scoring
    const expertiseScore = this.scoreExpertise(reviewer, review.reviewType, review.metadata.complexity);
    totalScore += expertiseScore.score * (rule.weightings.find(w => w.factor === 'expertise')?.weight || 0.3);
    reasons.push(expertiseScore.reason);

    // Performance scoring
    const performanceScore = this.scorePerformance(reviewer, review.reviewType);
    totalScore += performanceScore.score * (rule.weightings.find(w => w.factor === 'performance')?.weight || 0.2);
    reasons.push(performanceScore.reason);

    // Historical success scoring
    const historicalScore = await this.scoreHistoricalSuccess(reviewer, review.reviewType);
    totalScore += historicalScore.score * (rule.weightings.find(w => w.factor === 'historical_success')?.weight || 0.1);
    reasons.push(historicalScore.reason);

    // Calculate expected completion time
    const expectedCompletionTime = this.calculateExpectedCompletionTime(
      reviewer,
      review.metadata.estimatedReviewTime,
      review.metadata.complexity
    );

    // Adjust confidence based on risk factors
    if (riskFactors.length > 0) {
      confidence -= riskFactors.length * 10;
    }

    return {
      reviewerId: reviewer.reviewerId,
      score: Math.min(1, Math.max(0, totalScore)),
      confidence: Math.max(0, Math.min(100, confidence)),
      reasons,
      expectedCompletionTime,
      riskFactors,
      alternativeReviewers: [] // Would be populated with next best options
    };
  }

  /**
   * Score reviewer availability
   */
  private scoreAvailability(reviewer: ReviewerProfile, priority: ReviewPriority): {
    score: number;
    reason: AssignmentReason;
  } {
    let score = 0;
    let description = '';

    switch (reviewer.availability.status) {
      case 'available':
        score = 1.0;
        description = 'Fully available';
        break;
      case 'busy':
        score = priority === 'emergency' || priority === 'urgent' ? 0.6 : 0.3;
        description = 'Currently busy but can handle urgent work';
        break;
      case 'on_break':
        score = priority === 'emergency' ? 0.2 : 0;
        description = 'On break, emergency only';
        break;
      default:
        score = 0;
        description = 'Not available';
    }

    return {
      score,
      reason: {
        factor: 'availability',
        weight: 0.2,
        contribution: score * 0.2,
        description
      }
    };
  }

  /**
   * Score reviewer workload
   */
  private scoreWorkload(reviewer: ReviewerProfile): {
    score: number;
    reason: AssignmentReason;
    risk?: string;
  } {
    const utilization = reviewer.workload.capacityUtilization;
    let score = 0;
    let description = '';
    let risk: string | undefined;

    if (utilization < 50) {
      score = 1.0;
      description = `Low utilization (${utilization}%)`;
    } else if (utilization < 75) {
      score = 0.8;
      description = `Moderate utilization (${utilization}%)`;
    } else if (utilization < 90) {
      score = 0.5;
      description = `High utilization (${utilization}%)`;
      risk = 'High workload may impact review quality';
    } else {
      score = 0.2;
      description = `Very high utilization (${utilization}%)`;
      risk = 'Reviewer at capacity, may cause delays';
    }

    return {
      score,
      reason: {
        factor: 'workload',
        weight: 0.2,
        contribution: score * 0.2,
        description
      },
      risk
    };
  }

  /**
   * Score reviewer expertise
   */
  private scoreExpertise(
    reviewer: ReviewerProfile,
    reviewType: ReviewType,
    complexity: ReviewComplexity
  ): {
    score: number;
    reason: AssignmentReason;
  } {
    let score = 0;
    let description = '';

    // Check for relevant specializations
    const relevantSpecs = reviewer.specializations.filter(spec =>
      this.isRelevantSpecialization(spec.area, reviewType)
    );

    if (relevantSpecs.length > 0) {
      const bestSpec = relevantSpecs.reduce((best, current) =>
        this.getExpertiseScore(current.level) > this.getExpertiseScore(best.level) ? current : best
      );

      const expertiseScore = this.getExpertiseScore(bestSpec.level);
      const complexityRequirement = this.getComplexityRequirement(complexity);

      if (expertiseScore >= complexityRequirement) {
        score = Math.min(1, expertiseScore / complexityRequirement);
        description = `${bestSpec.level} expertise in ${bestSpec.area}`;
      } else {
        score = 0.3;
        description = `Limited expertise for ${complexity} complexity`;
      }
    } else {
      // General expertise based on role
      score = this.getRoleExpertiseScore(reviewer.role, complexity);
      description = `General ${reviewer.role} capabilities`;
    }

    return {
      score,
      reason: {
        factor: 'expertise',
        weight: 0.3,
        contribution: score * 0.3,
        description
      }
    };
  }

  /**
   * Score reviewer performance
   */
  private scorePerformance(reviewer: ReviewerProfile, reviewType: ReviewType): {
    score: number;
    reason: AssignmentReason;
  } {
    const performance = reviewer.performance;
    
    // Composite performance score
    const qualityWeight = 0.4;
    const throughputWeight = 0.3;
    const consistencyWeight = 0.3;

    const qualityScore = performance.qualityScore / 100;
    const throughputScore = Math.min(1, performance.throughput / 50); // Normalize to 50 reviews/day
    const consistencyScore = performance.consistencyScore / 100;

    const score = (qualityScore * qualityWeight) + 
                  (throughputScore * throughputWeight) + 
                  (consistencyScore * consistencyWeight);

    const description = `Quality: ${performance.qualityScore}, Throughput: ${performance.throughput}/day, Consistency: ${performance.consistencyScore}`;

    return {
      score,
      reason: {
        factor: 'performance',
        weight: 0.2,
        contribution: score * 0.2,
        description
      }
    };
  }

  /**
   * Score historical success with review type
   */
  private async scoreHistoricalSuccess(reviewer: ReviewerProfile, reviewType: ReviewType): Promise<{
    score: number;
    reason: AssignmentReason;
  }> {
    // Would query historical performance for this review type
    // For now, return a baseline score
    const score = 0.7; // Baseline historical success
    
    return {
      score,
      reason: {
        factor: 'historical_success',
        weight: 0.1,
        contribution: score * 0.1,
        description: 'Historical performance with this review type'
      }
    };
  }

  // =============================================================================
  // Helper Methods
  // =============================================================================

  private initializeStrategies(): void {
    // Load balancing strategy
    this.strategies.set('load_balanced', {
      name: 'load_balanced',
      description: 'Balances workload across available reviewers',
      weights: {
        workload: 0.4,
        availability: 0.3,
        expertise: 0.2,
        performance: 0.1,
        specialization: 0,
        historical_success: 0
      },
      fallback: 'assign_to_manager',
      enabled: true
    });

    // Expertise-based strategy
    this.strategies.set('expertise_based', {
      name: 'expertise_based',
      description: 'Prioritizes reviewer expertise and specialization',
      weights: {
        expertise: 0.4,
        specialization: 0.3,
        performance: 0.2,
        availability: 0.1,
        workload: 0,
        historical_success: 0
      },
      fallback: 'use_backup_pool',
      enabled: true
    });

    // Automatic strategy for simple reviews
    this.strategies.set('automatic', {
      name: 'automatic',
      description: 'Automated assignment for simple reviews',
      weights: {
        availability: 0.5,
        workload: 0.3,
        performance: 0.2,
        expertise: 0,
        specialization: 0,
        historical_success: 0
      },
      fallback: 'queue_for_manual',
      enabled: true
    });
  }

  private isRelevantSpecialization(area: SpecializationArea, reviewType: ReviewType): boolean {
    const relevanceMap: Record<SpecializationArea, ReviewType[]> = {
      content_safety: ['content_moderation', 'policy_violation'],
      fraud_detection: ['fraud_case'],
      legal_compliance: ['enforcement_appeal', 'compliance_audit'],
      technical_quality: ['template_submission', 'feature_toggle'],
      business_rules: ['marketplace_listing', 'bulk_operation'],
      identity_verification: ['identity_verification', 'access_request'],
      financial_review: ['fraud_case'],
      policy_enforcement: ['policy_violation', 'enforcement_appeal']
    };

    return relevanceMap[area]?.includes(reviewType) || false;
  }

  private getExpertiseScore(level: ExpertiseLevel): number {
    const scores = {
      basic: 0.25,
      intermediate: 0.5,
      advanced: 0.75,
      expert: 1.0
    };
    return scores[level];
  }

  private getComplexityRequirement(complexity: ReviewComplexity): number {
    const requirements = {
      simple: 0.25,
      moderate: 0.5,
      complex: 0.75,
      expert_required: 1.0
    };
    return requirements[complexity];
  }

  private getRoleExpertiseScore(role: string, complexity: ReviewComplexity): number {
    const roleScores: Record<string, Record<ReviewComplexity, number>> = {
      junior_reviewer: { simple: 0.8, moderate: 0.5, complex: 0.2, expert_required: 0 },
      senior_reviewer: { simple: 1.0, moderate: 0.9, complex: 0.7, expert_required: 0.4 },
      specialist: { simple: 0.9, moderate: 1.0, complex: 1.0, expert_required: 0.8 },
      lead_reviewer: { simple: 1.0, moderate: 1.0, complex: 1.0, expert_required: 1.0 }
    };

    return roleScores[role]?.[complexity] || 0.5;
  }

  private calculateExpectedCompletionTime(
    reviewer: ReviewerProfile,
    estimatedTime: number,
    complexity: ReviewComplexity
  ): number {
    // Adjust based on reviewer performance and current workload
    const performanceMultiplier = 2 - (reviewer.performance.qualityScore / 100); // Better performers are faster
    const workloadMultiplier = 1 + (reviewer.workload.capacityUtilization / 200); // Higher workload = slower
    
    return estimatedTime * performanceMultiplier * workloadMultiplier;
  }

  private ensureReviewerDiversity(recommendations: AssignmentRecommendation[]): AssignmentRecommendation[] {
    // Ensure we don't assign similar reviewers for consensus
    // Would implement diversity logic here
    return recommendations;
  }

  private getReassignmentStrategy(reason: ReassignmentReason, currentReviewer: ReviewerProfile): AssignmentType {
    switch (reason) {
      case 'performance_issue':
        return 'expertise_based';
      case 'workload_overload':
        return 'load_balanced';
      case 'expertise_mismatch':
        return 'expertise_based';
      default:
        return 'load_balanced';
    }
  }

  private getReassignmentConfidenceAdjustment(reason: ReassignmentReason): number {
    const adjustments = {
      performance_issue: -20,
      workload_overload: -10,
      expertise_mismatch: -15,
      unavailable: -5,
      escalated: 0
    };
    return adjustments[reason] || -10;
  }

  // Database and cache methods
  private async getAssignmentRules(reviewType: ReviewType): Promise<AssignmentRule[]> {
    if (this.assignmentRulesCache.has(reviewType)) {
      return this.assignmentRulesCache.get(reviewType)!;
    }

    const result = await this.db.query(`
      SELECT * FROM assignment_rules 
      WHERE review_type = $1 AND enabled = true
      ORDER BY priority DESC
    `, [reviewType]);

    const rules = result.rows.map(row => this.mapRowToAssignmentRule(row));
    this.assignmentRulesCache.set(reviewType, rules);
    return rules;
  }

  private async getAvailableReviewers(
    reviewType: ReviewType,
    complexity: ReviewComplexity,
    excludeReviewers: string[] = []
  ): Promise<ReviewerProfile[]> {
    const query = `
      SELECT * FROM reviewer_profiles 
      WHERE availability_status IN ('available', 'busy')
      AND current_assignments < max_concurrent_reviews
      AND $1 = ANY(review_types)
      ${excludeReviewers.length > 0 ? 'AND reviewer_id NOT IN (' + excludeReviewers.map((_, i) => `$${i + 2}`).join(',') + ')' : ''}
      ORDER BY availability_status, capacity_utilization
    `;

    const params = [reviewType, ...excludeReviewers];
    const result = await this.db.query(query, params);

    return result.rows.map(row => this.mapRowToReviewerProfile(row));
  }

  private async getReviewer(reviewerId: string): Promise<ReviewerProfile | null> {
    if (this.reviewerCache.has(reviewerId)) {
      return this.reviewerCache.get(reviewerId)!;
    }

    const result = await this.db.query(`
      SELECT * FROM reviewer_profiles WHERE reviewer_id = $1
    `, [reviewerId]);

    if (result.rows.length === 0) return null;

    const reviewer = this.mapRowToReviewerProfile(result.rows[0]);
    this.reviewerCache.set(reviewerId, reviewer);
    return reviewer;
  }

  private async fallbackAssignment(
    review: ReviewItem,
    excludeReviewers: string[]
  ): Promise<AssignmentRecommendation | null> {
    // Implement fallback assignment logic
    console.log(`🔄 Using fallback assignment for review ${review.reviewId}`);
    return null;
  }

  // Placeholder mapping methods
  private mapRowToAssignmentRule(row: any): AssignmentRule {
    return {
      ruleId: row.rule_id,
      name: row.name,
      type: row.type,
      conditions: JSON.parse(row.conditions || '[]'),
      weightings: JSON.parse(row.weightings || '[]'),
      fallbackStrategy: row.fallback_strategy,
      enabled: row.enabled
    };
  }

  private mapRowToReviewerProfile(row: any): ReviewerProfile {
    // Would implement full mapping from database row
    return {} as ReviewerProfile;
  }

  // Placeholder methods for workload rebalancing
  private async getActiveReviewers(reviewType?: ReviewType): Promise<ReviewerProfile[]> { return []; }
  private async getReassignableReviews(reviewerId: string): Promise<ReviewItem[]> { return []; }
  private async findBestAvailableReviewer(review: ReviewItem, reviewerIds: string[]): Promise<string | null> { return null; }
  private calculateRebalanceBenefit(from: ReviewerProfile, to: string): number { return 0; }
  private calculateProjectedImprovement(actions: WorkloadRebalanceAction[]): number { return 0; }
}

// Supporting types
type ReassignmentReason = 'performance_issue' | 'workload_overload' | 'expertise_mismatch' | 'unavailable' | 'escalated';

interface WorkloadRebalanceResult {
  totalReviewers: number;
  overloadedCount: number;
  underutilizedCount: number;
  recommendedActions: WorkloadRebalanceAction[];
  projectedImprovement: number;
}

interface WorkloadRebalanceAction {
  reviewId: string;
  fromReviewerId: string;
  toReviewerId: string;
  reason: string;
  expectedBenefit: number;
}