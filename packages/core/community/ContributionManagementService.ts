/**
 * Epic 16 - Contribution Management Service
 * Task: E16-1753114247115-253BF0 - Design contribution architecture
 * 
 * Service implementation for managing community contributions through their lifecycle.
 * Integrates workflow management, quality assessment, and publication processes.
 */

import {
  ContributionSubmission,
  ContributionRepository,
  ContributionWorkflow,
  WorkflowStage,
  ReviewerAssignment,
  ReviewFeedbackEntry,
  QualityGateResult,
  ApprovalEntry,
  PublicationSchedule,
  ContributionEngagement,
  ContributorStatistics,
  ContributionSystemMetrics,
  ContributionStatus,
  CONTRIBUTION_WORKFLOW_TEMPLATES,
  QUALITY_GATE_PRESETS
} from './ContributionArchitecture';

import { ContentVersionManager } from './ContentVersionManager';
import { ContentQualityAssessmentService, CommunityContentQualityMetrics } from './ContentQualityAssessment';

export class ContributionManagementService implements ContributionRepository {
  private apiClient: any;
  private versionManager: ContentVersionManager;
  private qualityService: ContentQualityAssessmentService;

  constructor(apiClient: any) {
    this.apiClient = apiClient;
    this.versionManager = new ContentVersionManager(apiClient, '', ''); // Will be initialized per content
    this.qualityService = new ContentQualityAssessmentService(apiClient);
  }

  // ====================================
  // Submission Management
  // ====================================

  async submitContribution(
    submissionData: Omit<ContributionSubmission, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ContributionSubmission> {
    try {
      // Create initial content version
      const contentVersion = await this.versionManager.createVersion(submissionData.content, {
        title: submissionData.title,
        description: submissionData.description,
        target_status: 'draft'
      });

      // Initialize workflow based on contributor reputation and content type
      const workflowTemplate = await this.selectWorkflowTemplate(
        submissionData.submission.submitted_by,
        submissionData.type,
        submissionData.category
      );

      const submission: Omit<ContributionSubmission, 'id'> = {
        ...submissionData,
        status: 'submitted',
        workflow: this.initializeWorkflow(workflowTemplate),
        quality_assessment: undefined,
        review_feedback: [],
        engagement: this.initializeEngagement(),
        current_version_id: contentVersion.id,
        version_history: [contentVersion.id],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const response = await this.apiClient.post('/api/contributions', submission);
      const createdSubmission = response.data;

      // Trigger initial workflow stage
      await this.advanceWorkflowStage(createdSubmission.id, 'intake_review', 'Contribution submitted for review');

      return createdSubmission;
    } catch (error) {
      console.error('Failed to submit contribution:', error);
      throw error;
    }
  }

  async updateContribution(
    id: string,
    updates: Partial<ContributionSubmission>
  ): Promise<ContributionSubmission> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const response = await this.apiClient.put(`/api/contributions/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Failed to update contribution:', error);
      throw error;
    }
  }

  async getContribution(id: string): Promise<ContributionSubmission> {
    try {
      const response = await this.apiClient.get(`/api/contributions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get contribution:', error);
      throw error;
    }
  }

  async getContributionsByUser(
    userId: string,
    status?: ContributionStatus
  ): Promise<ContributionSubmission[]> {
    try {
      const params = new URLSearchParams();
      params.append('user_id', userId);
      if (status) {
        params.append('status', status);
      }

      const response = await this.apiClient.get(`/api/contributions?${params}`);
      return response.data.contributions || [];
    } catch (error) {
      console.error('Failed to get user contributions:', error);
      throw error;
    }
  }

  // ====================================
  // Workflow Management
  // ====================================

  async advanceWorkflowStage(
    contributionId: string,
    newStage: WorkflowStage,
    notes?: string
  ): Promise<ContributionWorkflow> {
    try {
      const contribution = await this.getContribution(contributionId);
      const currentWorkflow = contribution.workflow;

      // Validate stage transition
      if (!this.isValidStageTransition(currentWorkflow.current_stage, newStage)) {
        throw new Error(`Invalid stage transition from ${currentWorkflow.current_stage} to ${newStage}`);
      }

      // Update workflow stage
      const updatedWorkflow: ContributionWorkflow = {
        ...currentWorkflow,
        current_stage: newStage,
        stage_history: [
          ...currentWorkflow.stage_history,
          {
            stage: newStage,
            entered_at: new Date().toISOString(),
            notes,
            outcome: 'completed'
          }
        ]
      };

      // Execute stage-specific actions
      await this.executeStageActions(contributionId, newStage, updatedWorkflow);

      // Update contribution
      await this.updateContribution(contributionId, {
        workflow: updatedWorkflow,
        status: this.mapStageToStatus(newStage)
      });

      return updatedWorkflow;
    } catch (error) {
      console.error('Failed to advance workflow stage:', error);
      throw error;
    }
  }

  async assignReviewer(
    contributionId: string,
    assignment: ReviewerAssignment
  ): Promise<void> {
    try {
      const contribution = await this.getContribution(contributionId);
      const updatedWorkflow = {
        ...contribution.workflow,
        reviewer_assignments: [
          ...contribution.workflow.reviewer_assignments,
          {
            ...assignment,
            assigned_at: new Date().toISOString(),
            status: 'assigned'
          }
        ]
      };

      await this.updateContribution(contributionId, { workflow: updatedWorkflow });

      // Send notification to reviewer
      await this.notifyReviewer(assignment.reviewer_id, contributionId, assignment);
    } catch (error) {
      console.error('Failed to assign reviewer:', error);
      throw error;
    }
  }

  async submitReviewFeedback(
    contributionId: string,
    feedback: ReviewFeedbackEntry
  ): Promise<void> {
    try {
      const contribution = await this.getContribution(contributionId);
      
      const updatedFeedback = [
        ...contribution.review_feedback,
        {
          ...feedback,
          id: `feedback-${Date.now()}`,
          submitted_at: new Date().toISOString()
        }
      ];

      await this.updateContribution(contributionId, {
        review_feedback: updatedFeedback
      });

      // Update reviewer assignment status
      await this.updateReviewerAssignmentStatus(
        contributionId,
        feedback.reviewer_id,
        'completed'
      );

      // Check if all required reviews are complete
      await this.checkReviewCompletion(contributionId);

      // Notify contributor of feedback
      await this.notifyContributor(contributionId, 'review_feedback', feedback);
    } catch (error) {
      console.error('Failed to submit review feedback:', error);
      throw error;
    }
  }

  async approveContribution(
    contributionId: string,
    approval: ApprovalEntry
  ): Promise<void> {
    try {
      const contribution = await this.getContribution(contributionId);
      
      const updatedApprovalChain = [
        ...contribution.workflow.approval_chain,
        {
          ...approval,
          approved_at: new Date().toISOString()
        }
      ];

      const updatedWorkflow = {
        ...contribution.workflow,
        approval_chain: updatedApprovalChain
      };

      await this.updateContribution(contributionId, {
        workflow: updatedWorkflow,
        status: approval.approval_type === 'full' ? 'approved' : 'revision_needed'
      });

      // If fully approved, advance to publication stage
      if (approval.approval_type === 'full') {
        await this.advanceWorkflowStage(contributionId, 'publication', 'Contribution approved for publication');
      }

      // Notify contributor
      await this.notifyContributor(contributionId, 'approval', approval);
    } catch (error) {
      console.error('Failed to approve contribution:', error);
      throw error;
    }
  }

  // ====================================
  // Quality Assessment Integration
  // ====================================

  async runQualityAssessment(contributionId: string): Promise<CommunityContentQualityMetrics> {
    try {
      const contribution = await this.getContribution(contributionId);
      
      const qualityMetrics = await this.qualityService.runComprehensiveAssessment(
        contributionId,
        contribution.current_version_id,
        {
          include_automated: true,
          include_editorial: true,
          include_community: false // Initially false, enabled after publication
        }
      );

      // Update contribution with quality assessment
      await this.updateContribution(contributionId, {
        quality_assessment: qualityMetrics
      });

      return qualityMetrics;
    } catch (error) {
      console.error('Failed to run quality assessment:', error);
      throw error;
    }
  }

  async checkQualityGates(contributionId: string): Promise<QualityGateResult[]> {
    try {
      const contribution = await this.getContribution(contributionId);
      const qualityGates = contribution.workflow.quality_gates;
      const results: QualityGateResult[] = [];

      for (const gate of qualityGates) {
        const result = await this.evaluateQualityGate(contributionId, gate);
        results.push(result);
      }

      // Update workflow with gate results
      const updatedWorkflow = {
        ...contribution.workflow,
        quality_gate_results: results
      };

      await this.updateContribution(contributionId, { workflow: updatedWorkflow });

      return results;
    } catch (error) {
      console.error('Failed to check quality gates:', error);
      throw error;
    }
  }

  // ====================================
  // Publication Management
  // ====================================

  async schedulePublication(
    contributionId: string,
    schedule: PublicationSchedule
  ): Promise<void> {
    try {
      const contribution = await this.getContribution(contributionId);
      
      const updatedWorkflow = {
        ...contribution.workflow,
        publication_schedule: schedule
      };

      await this.updateContribution(contributionId, {
        workflow: updatedWorkflow
      });

      // Schedule automated publication if configured
      if (schedule.auto_publish && schedule.scheduled_date) {
        await this.scheduleAutomaticPublication(contributionId, schedule.scheduled_date);
      }
    } catch (error) {
      console.error('Failed to schedule publication:', error);
      throw error;
    }
  }

  async publishContribution(contributionId: string): Promise<void> {
    try {
      const contribution = await this.getContribution(contributionId);

      // Verify all quality gates have passed
      const qualityGatesPassed = contribution.workflow.quality_gate_results.every(
        result => result.passed
      );

      if (!qualityGatesPassed) {
        throw new Error('Cannot publish contribution: quality gates have not passed');
      }

      // Publish the content version
      await this.versionManager.publishVersion(contribution.current_version_id, {
        visibility: contribution.publishing.visibility,
        notify_subscribers: contribution.publishing.notifications.notify_followers
      });

      // Update contribution status
      await this.updateContribution(contributionId, {
        status: 'published',
        published_at: new Date().toISOString()
      });

      // Advance workflow to post-publication
      await this.advanceWorkflowStage(contributionId, 'post_publication', 'Contribution published successfully');

      // Send notifications
      await this.sendPublicationNotifications(contributionId);

      // Initialize post-publication tracking
      await this.initializePostPublicationTracking(contributionId);
    } catch (error) {
      console.error('Failed to publish contribution:', error);
      throw error;
    }
  }

  async featureContribution(contributionId: string): Promise<void> {
    try {
      await this.updateContribution(contributionId, {
        status: 'featured',
        featured_at: new Date().toISOString()
      });

      // Add featured badge to contributor
      await this.awardContributorBadge(contributionId, 'featured_content');

      // Notify contributor
      await this.notifyContributor(contributionId, 'featured', null);
    } catch (error) {
      console.error('Failed to feature contribution:', error);
      throw error;
    }
  }

  // ====================================
  // Analytics and Reporting
  // ====================================

  async getContributionAnalytics(contributionId: string): Promise<ContributionEngagement> {
    try {
      const response = await this.apiClient.get(`/api/contributions/${contributionId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Failed to get contribution analytics:', error);
      throw error;
    }
  }

  async getContributorStatistics(userId: string): Promise<ContributorStatistics> {
    try {
      const response = await this.apiClient.get(`/api/contributors/${userId}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Failed to get contributor statistics:', error);
      throw error;
    }
  }

  async getSystemMetrics(timeRange?: string): Promise<ContributionSystemMetrics> {
    try {
      const params = timeRange ? `?time_range=${timeRange}` : '';
      const response = await this.apiClient.get(`/api/contributions/system-metrics${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get system metrics:', error);
      throw error;
    }
  }

  // ====================================
  // Private Helper Methods
  // ====================================

  private async selectWorkflowTemplate(
    contributorId: string,
    contributionType: string,
    category: string
  ): Promise<string> {
    try {
      // Get contributor reputation and history
      const contributorStats = await this.getContributorStatistics(contributorId);
      
      // Select workflow based on contributor reputation and content complexity
      if (contributorStats.reputation_score >= 85 && contributorStats.acceptance_rate >= 90) {
        return 'trusted_contributor';
      } else if (contributorStats.total_contributions >= 5 && contributorStats.average_quality_score >= 80) {
        return 'standard';
      } else {
        return 'comprehensive';
      }
    } catch (error) {
      // Default to comprehensive workflow for new contributors
      return 'comprehensive';
    }
  }

  private initializeWorkflow(templateName: string): ContributionWorkflow {
    const template = CONTRIBUTION_WORKFLOW_TEMPLATES[templateName as keyof typeof CONTRIBUTION_WORKFLOW_TEMPLATES];
    
    return {
      current_stage: 'submission',
      assigned_reviewers: [],
      review_deadlines: {},
      escalation_level: 'normal',
      stage_history: [{
        stage: 'submission',
        entered_at: new Date().toISOString(),
        outcome: 'completed'
      }],
      reviewer_assignments: [],
      quality_gates: this.createQualityGates(template.quality_gates),
      quality_gate_results: [],
      approval_chain: []
    };
  }

  private initializeEngagement(): ContributionEngagement {
    return {
      total_views: 0,
      unique_views: 0,
      view_sources: {},
      likes: 0,
      shares: 0,
      bookmarks: 0,
      comments: 0,
      helpfulness_rating: 0,
      accuracy_rating: 0,
      clarity_rating: 0,
      usefulness_rating: 0,
      community_votes: {
        upvotes: 0,
        downvotes: 0,
        expert_endorsements: 0
      },
      completion_rate: 0,
      success_rate: 0,
      time_to_complete: 0,
      feedback_summary: {
        positive_feedback: [],
        improvement_suggestions: [],
        error_reports: [],
        update_requests: []
      }
    };
  }

  private createQualityGates(gateNames: string[]) {
    return gateNames.map(gateName => {
      const preset = QUALITY_GATE_PRESETS[gateName as keyof typeof QUALITY_GATE_PRESETS];
      return {
        name: gateName,
        type: gateName.startsWith('automated') ? 'automated' : 'manual',
        criteria: preset || QUALITY_GATE_PRESETS.automated_basic,
        required: true,
        stage: this.mapGateToStage(gateName)
      };
    });
  }

  private mapGateToStage(gateName: string): WorkflowStage {
    const mapping: Record<string, WorkflowStage> = {
      'automated_quality': 'quality_check',
      'editorial_review': 'editorial_review',
      'technical_review': 'technical_review',
      'community_consensus': 'community_review',
      'plagiarism_check': 'quality_check'
    };
    return mapping[gateName] || 'quality_check';
  }

  private mapStageToStatus(stage: WorkflowStage): ContributionStatus {
    const mapping: Record<WorkflowStage, ContributionStatus> = {
      'submission': 'submitted',
      'intake_review': 'under_review',
      'quality_check': 'under_review',
      'editorial_review': 'under_review',
      'technical_review': 'under_review',
      'community_review': 'under_review',
      'final_approval': 'under_review',
      'publication': 'approved',
      'post_publication': 'published'
    };
    return mapping[stage] || 'under_review';
  }

  private isValidStageTransition(currentStage: WorkflowStage, newStage: WorkflowStage): boolean {
    const validTransitions: Record<WorkflowStage, WorkflowStage[]> = {
      'submission': ['intake_review'],
      'intake_review': ['quality_check', 'final_approval'], // Can skip to approval for trusted contributors
      'quality_check': ['editorial_review', 'technical_review'],
      'editorial_review': ['technical_review', 'community_review', 'final_approval'],
      'technical_review': ['community_review', 'final_approval'],
      'community_review': ['final_approval'],
      'final_approval': ['publication'],
      'publication': ['post_publication'],
      'post_publication': []
    };

    return validTransitions[currentStage]?.includes(newStage) || false;
  }

  private async executeStageActions(
    contributionId: string,
    stage: WorkflowStage,
    workflow: ContributionWorkflow
  ): Promise<void> {
    switch (stage) {
    case 'quality_check':
      await this.runQualityAssessment(contributionId);
      await this.checkQualityGates(contributionId);
      break;
      
    case 'editorial_review':
      await this.autoAssignReviewers(contributionId, 'editorial');
      break;
      
    case 'technical_review':
      await this.autoAssignReviewers(contributionId, 'technical');
      break;
      
    case 'community_review':
      await this.openCommunityReview(contributionId);
      break;
      
    case 'publication':
      if (workflow.publication_schedule?.auto_publish) {
        await this.publishContribution(contributionId);
      }
      break;
    }
  }

  private async evaluateQualityGate(contributionId: string, gate: any): Promise<QualityGateResult> {
    // This would integrate with the quality assessment service
    // For now, return a mock result
    return {
      gate_name: gate.name,
      passed: true,
      score: 85,
      issues_found: [],
      recommendations: [],
      checked_at: new Date().toISOString(),
      retry_count: 0
    };
  }

  private async autoAssignReviewers(contributionId: string, reviewType: string): Promise<void> {
    // Auto-assignment logic would be implemented here
    // This would find available reviewers based on expertise, workload, etc.
  }

  private async openCommunityReview(contributionId: string): Promise<void> {
    // Community review opening logic
  }

  private async notifyReviewer(reviewerId: string, contributionId: string, assignment: ReviewerAssignment): Promise<void> {
    // Notification logic
  }

  private async notifyContributor(contributionId: string, eventType: string, data: any): Promise<void> {
    // Contributor notification logic
  }

  private async updateReviewerAssignmentStatus(contributionId: string, reviewerId: string, status: string): Promise<void> {
    // Update reviewer assignment status
  }

  private async checkReviewCompletion(contributionId: string): Promise<void> {
    // Check if all required reviews are complete and advance workflow if needed
  }

  private async scheduleAutomaticPublication(contributionId: string, scheduledDate: string): Promise<void> {
    // Schedule automatic publication
  }

  private async sendPublicationNotifications(contributionId: string): Promise<void> {
    // Send publication notifications
  }

  private async initializePostPublicationTracking(contributionId: string): Promise<void> {
    // Initialize analytics and engagement tracking
  }

  private async awardContributorBadge(contributionId: string, badgeType: string): Promise<void> {
    // Award badge to contributor
  }
}