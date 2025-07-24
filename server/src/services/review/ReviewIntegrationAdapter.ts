/**
 * Review Integration Adapter - Epic 17
 * 
 * Integration adapter that connects existing review systems (fraud monitoring,
 * enforcement actions, verification queue, marketplace reviews) with the unified
 * review orchestration service.
 * 
 * Task: E17-1753114397301-5C1461 - Develop review tools
 * Epic: 17 - Backstage Admin Controls
 */

import { Database } from '../../database';
import { ReviewOrchestrationService } from './ReviewOrchestrationService';
import { FraudMonitoringService, FraudReviewCase } from '../fraud/FraudMonitoringService';
import { EnforcementActionService } from '../enforcement/EnforcementActionService';
import { AuditService } from '../auth/services/AuditService';
import {
  ReviewItem,
  ReviewType,
  SourceSystem,
  ReviewPriority,
  ReviewComplexity,
  ReviewMetadata
} from '../../../../packages/core/types/ReviewTools';
import {
  FraudDetectionResult,
  FraudAlert
} from '../../../../packages/core/types/FraudMonitoring';
import {
  EnforcementAction,
  ViolationReport,
  EnforcementAppeal
} from '../../../../packages/core/types/EnforcementTypes';

export interface IntegrationConfig {
  enabled: boolean;
  autoCreateReviews: boolean;
  syncBidirectional: boolean;
  defaultPriority: ReviewPriority;
  escalationThresholds: Record<string, number>;
  integrationMappings: IntegrationMapping[];
}

export interface IntegrationMapping {
  sourceSystem: SourceSystem;
  sourceType: string;
  targetReviewType: ReviewType;
  priorityMapping: Record<string, ReviewPriority>;
  complexityMapping: Record<string, ReviewComplexity>;
  criteriaMapping: Record<string, string[]>;
}

export class ReviewIntegrationAdapter {
  private db: Database;
  private orchestrationService: ReviewOrchestrationService;
  private fraudService: FraudMonitoringService;
  private enforcementService: EnforcementActionService;
  private auditService: AuditService;
  private config: IntegrationConfig;

  // Integration state tracking
  private integrationStatus: Map<SourceSystem, IntegrationStatus> = new Map();
  private syncQueue: IntegrationEvent[] = [];
  private processingQueue = false;

  constructor(
    database: Database,
    orchestrationService: ReviewOrchestrationService,
    fraudService: FraudMonitoringService,
    enforcementService: EnforcementActionService,
    auditService: AuditService,
    config?: Partial<IntegrationConfig>
  ) {
    this.db = database;
    this.orchestrationService = orchestrationService;
    this.fraudService = fraudService;
    this.enforcementService = enforcementService;
    this.auditService = auditService;
    this.config = {
      enabled: true,
      autoCreateReviews: true,
      syncBidirectional: true,
      defaultPriority: 'medium',
      escalationThresholds: {
        fraud_case: 85,
        security_alert: 90,
        enforcement_appeal: 75
      },
      integrationMappings: this.getDefaultMappings(),
      ...config
    };

    this.initializeIntegrations();
  }

  // =============================================================================
  // Core Integration Methods
  // =============================================================================

  /**
   * Initialize all integrations
   */
  private async initializeIntegrations(): Promise<void> {
    if (!this.config.enabled) {
      console.log('🔌 Review integrations disabled');
      return;
    }

    console.log('🔌 Initializing review system integrations...');

    try {
      // Initialize fraud monitoring integration
      await this.initializeFraudIntegration();
      
      // Initialize enforcement actions integration
      await this.initializeEnforcementIntegration();
      
      // Initialize verification queue integration
      await this.initializeVerificationIntegration();
      
      // Initialize marketplace review integration
      await this.initializeMarketplaceIntegration();

      // Start sync queue processor
      this.startSyncProcessor();

      console.log('✅ Review integrations initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize review integrations:', error);
      throw error;
    }
  }

  /**
   * Create review from external system
   */
  async createReviewFromExternalSystem(
    sourceSystem: SourceSystem,
    sourceType: string,
    sourceId: string,
    sourceData: unknown,
    options: {
      priority?: ReviewPriority;
      urgentOverride?: boolean;
      assignToReviewer?: string;
      additionalContext?: unknown;
    } = {}
  ): Promise<ReviewItem | null> {
    if (!this.config.enabled || !this.config.autoCreateReviews) {
      console.log(`🚫 Auto-creation disabled for ${sourceSystem}`);
      return null;
    }

    try {
      console.log(`🔄 Creating review from ${sourceSystem}:${sourceType} (${sourceId})`);

      // Get integration mapping
      const mapping = this.getIntegrationMapping(sourceSystem, sourceType);
      if (!mapping) {
        console.log(`⚠️ No mapping found for ${sourceSystem}:${sourceType}`);
        return null;
      }

      // Determine priority
      const priority = options.priority || 
                      this.mapPriority(sourceData, mapping) ||
                      this.config.defaultPriority;

      // Determine complexity
      const complexity = this.mapComplexity(sourceData, mapping);

      // Build review metadata
      const metadata = await this.buildReviewMetadata(
        sourceSystem,
        sourceType,
        sourceData,
        complexity,
        options.additionalContext
      );

      // Generate title and description
      const { title, description } = this.generateReviewContent(
        sourceSystem,
        sourceType,
        sourceData
      );

      // Create the review
      const review = await this.orchestrationService.createReview(
        mapping.targetReviewType,
        sourceSystem,
        sourceId,
        sourceData,
        {
          title,
          description,
          priority,
          metadata,
          assignToReviewer: options.assignToReviewer
        }
      );

      // Log integration event
      await this.logIntegrationEvent('review_created', {
        sourceSystem,
        sourceType,
        sourceId,
        reviewId: review.reviewId,
        priority,
        autoCreated: true
      });

      console.log(`✅ Created review ${review.reviewId} from ${sourceSystem}:${sourceId}`);
      return review;

    } catch (error) {
      console.error(`❌ Failed to create review from ${sourceSystem}:${sourceId}:`, error);
      await this.logIntegrationEvent('review_creation_failed', {
        sourceSystem,
        sourceType,
        sourceId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Sync review status back to external system
   */
  async syncReviewStatusToExternalSystem(
    review: ReviewItem,
    status: string,
    decision?: any
  ): Promise<void> {
    if (!this.config.syncBidirectional) {
      return;
    }

    try {
      console.log(`🔄 Syncing review ${review.reviewId} status to ${review.sourceSystem}`);

      switch (review.sourceSystem) {
      case 'fraud_monitoring':
        await this.syncToFraudSystem(review, status, decision);
        break;
        
      case 'enforcement_actions':
        await this.syncToEnforcementSystem(review, status, decision);
        break;
        
      case 'identity_verification':
        await this.syncToVerificationSystem(review, status, decision);
        break;
        
      case 'marketplace':
        await this.syncToMarketplaceSystem(review, status, decision);
        break;
        
      default:
        console.log(`⚠️ No sync handler for ${review.sourceSystem}`);
      }

      await this.logIntegrationEvent('status_synced', {
        reviewId: review.reviewId,
        sourceSystem: review.sourceSystem,
        status,
        hasDecision: !!decision
      });

    } catch (error) {
      console.error(`❌ Failed to sync status for review ${review.reviewId}:`, error);
      await this.logIntegrationEvent('sync_failed', {
        reviewId: review.reviewId,
        sourceSystem: review.sourceSystem,
        status,
        error: error.message
      });
    }
  }

  // =============================================================================
  // Fraud Monitoring Integration
  // =============================================================================

  private async initializeFraudIntegration(): Promise<void> {
    console.log('🔌 Initializing fraud monitoring integration...');

    this.integrationStatus.set('fraud_monitoring', {
      system: 'fraud_monitoring',
      status: 'active',
      lastSync: new Date(),
      errorCount: 0,
      totalProcessed: 0
    });

    // Set up event listeners for fraud cases that need review
    // This would integrate with the FraudMonitoringService
    console.log('✅ Fraud monitoring integration ready');
  }

  /**
   * Handle fraud case review creation
   */
  async handleFraudCaseReview(fraudCase: FraudReviewCase): Promise<ReviewItem | null> {
    const sourceData = {
      caseId: fraudCase.caseId,
      fraudScore: fraudCase.fraudScore,
      riskLevel: fraudCase.riskLevel,
      entityType: fraudCase.entityType,
      entityId: fraudCase.entityId,
      detectionResult: fraudCase.detectionResult,
      evidence: fraudCase.evidence,
      priority: fraudCase.priority
    };

    return await this.createReviewFromExternalSystem(
      'fraud_monitoring',
      'fraud_case',
      fraudCase.caseId,
      sourceData,
      {
        priority: this.mapFraudPriorityToReviewPriority(fraudCase.priority),
        urgentOverride: fraudCase.fraudScore >= 90
      }
    );
  }

  /**
   * Handle fraud alert review creation
   */
  async handleFraudAlertReview(alert: FraudAlert): Promise<ReviewItem | null> {
    const sourceData = {
      alertId: alert.alertId,
      severity: alert.severity,
      type: alert.type,
      title: alert.title,
      description: alert.description,
      fraudScore: alert.fraudScore,
      entityType: alert.entityType,
      entityId: alert.entityId
    };

    return await this.createReviewFromExternalSystem(
      'fraud_monitoring',
      'fraud_alert',
      alert.alertId,
      sourceData,
      {
        priority: this.mapAlertSeverityToReviewPriority(alert.severity),
        urgentOverride: alert.severity === 'urgent'
      }
    );
  }

  private async syncToFraudSystem(review: ReviewItem, status: string, decision?: any): Promise<void> {
    // Sync review status back to fraud monitoring system
    if (review.sourceId.startsWith('FC-')) {
      // This is a fraud case - update the case status
      console.log(`🔄 Updating fraud case ${review.sourceId} status: ${status}`);
      // Would call FraudMonitoringService to update case
    } else if (review.sourceId.startsWith('FA-')) {
      // This is a fraud alert - update the alert status
      console.log(`🔄 Updating fraud alert ${review.sourceId} status: ${status}`);
      // Would call FraudMonitoringService to update alert
    }
  }

  // =============================================================================
  // Enforcement Actions Integration
  // =============================================================================

  private async initializeEnforcementIntegration(): Promise<void> {
    console.log('🔌 Initializing enforcement actions integration...');

    this.integrationStatus.set('enforcement_actions', {
      system: 'enforcement_actions',
      status: 'active',
      lastSync: new Date(),
      errorCount: 0,
      totalProcessed: 0
    });

    console.log('✅ Enforcement actions integration ready');
  }

  /**
   * Handle enforcement action review creation
   */
  async handleEnforcementActionReview(action: EnforcementAction): Promise<ReviewItem | null> {
    const sourceData = {
      actionId: action.actionId,
      actionType: action.actionType,
      severity: action.severity,
      targetType: action.targetType,
      targetId: action.targetId,
      reason: action.reason,
      evidence: action.evidence,
      executionType: action.executionType
    };

    return await this.createReviewFromExternalSystem(
      'enforcement_actions',
      'enforcement_action',
      action.actionId,
      sourceData,
      {
        priority: this.mapEnforcementSeverityToReviewPriority(action.severity)
      }
    );
  }

  /**
   * Handle enforcement appeal review creation
   */
  async handleEnforcementAppealReview(appeal: EnforcementAppeal): Promise<ReviewItem | null> {
    const sourceData = {
      appealId: appeal.appealId,
      actionId: appeal.actionId,
      reason: appeal.reason,
      evidence: appeal.evidence,
      submittedBy: appeal.submittedBy,
      urgency: appeal.urgency
    };

    return await this.createReviewFromExternalSystem(
      'enforcement_actions',
      'appeal',
      appeal.appealId,
      sourceData,
      {
        priority: appeal.urgency === 'high' ? 'urgent' : 'high'
      }
    );
  }

  private async syncToEnforcementSystem(review: ReviewItem, status: string, decision?: any): Promise<void> {
    // Sync review status back to enforcement system
    console.log(`🔄 Updating enforcement item ${review.sourceId} status: ${status}`);
    // Would call EnforcementActionService to update status
  }

  // =============================================================================
  // Verification Queue Integration
  // =============================================================================

  private async initializeVerificationIntegration(): Promise<void> {
    console.log('🔌 Initializing verification queue integration...');

    this.integrationStatus.set('identity_verification', {
      system: 'identity_verification',
      status: 'active',
      lastSync: new Date(),
      errorCount: 0,
      totalProcessed: 0
    });

    console.log('✅ Verification queue integration ready');
  }

  /**
   * Handle identity verification review creation
   */
  async handleIdentityVerificationReview(verificationData: unknown): Promise<ReviewItem | null> {
    const sourceData = {
      verificationId: verificationData.id,
      userId: verificationData.userId,
      verificationType: verificationData.type,
      documents: verificationData.documents,
      confidenceScore: verificationData.confidenceScore,
      riskFlags: verificationData.riskFlags
    };

    return await this.createReviewFromExternalSystem(
      'identity_verification',
      'identity_verification',
      verificationData.id,
      sourceData,
      {
        priority: verificationData.confidenceScore < 70 ? 'high' : 'medium'
      }
    );
  }

  private async syncToVerificationSystem(review: ReviewItem, status: string, decision?: any): Promise<void> {
    // Sync review status back to verification system
    console.log(`🔄 Updating verification ${review.sourceId} status: ${status}`);
    // Would update verification queue status
  }

  // =============================================================================
  // Marketplace Integration
  // =============================================================================

  private async initializeMarketplaceIntegration(): Promise<void> {
    console.log('🔌 Initializing marketplace integration...');

    this.integrationStatus.set('marketplace', {
      system: 'marketplace',
      status: 'active',
      lastSync: new Date(),
      errorCount: 0,
      totalProcessed: 0
    });

    console.log('✅ Marketplace integration ready');
  }

  /**
   * Handle template submission review creation
   */
  async handleTemplateSubmissionReview(submission: unknown): Promise<ReviewItem | null> {
    const sourceData = {
      submissionId: submission.id,
      templateData: submission.template,
      submittedBy: submission.submittedBy,
      category: submission.category,
      qualityScore: submission.qualityScore,
      safetyFlags: submission.safetyFlags
    };

    return await this.createReviewFromExternalSystem(
      'marketplace',
      'template_submission',
      submission.id,
      sourceData,
      {
        priority: submission.safetyFlags?.length > 0 ? 'high' : 'medium'
      }
    );
  }

  private async syncToMarketplaceSystem(review: ReviewItem, status: string, decision?: any): Promise<void> {
    // Sync review status back to marketplace system
    console.log(`🔄 Updating marketplace item ${review.sourceId} status: ${status}`);
    // Would update marketplace submission status
  }

  // =============================================================================
  // Helper Methods
  // =============================================================================

  private getDefaultMappings(): IntegrationMapping[] {
    return [
      {
        sourceSystem: 'fraud_monitoring',
        sourceType: 'fraud_case',
        targetReviewType: 'fraud_case',
        priorityMapping: {
          low: 'low',
          medium: 'medium',
          high: 'high',
          urgent: 'urgent'
        },
        complexityMapping: {
          simple: 'simple',
          complex: 'complex',
          expert: 'expert_required'
        },
        criteriaMapping: {
          fraud_case: ['fraud_assessment', 'risk_analysis', 'evidence_review']
        }
      },
      {
        sourceSystem: 'enforcement_actions',
        sourceType: 'appeal',
        targetReviewType: 'enforcement_appeal',
        priorityMapping: {
          low: 'medium',
          medium: 'high',
          high: 'urgent'
        },
        complexityMapping: {
          simple: 'moderate',
          complex: 'complex'
        },
        criteriaMapping: {
          appeal: ['appeal_validity', 'evidence_review', 'policy_compliance']
        }
      },
      {
        sourceSystem: 'marketplace',
        sourceType: 'template_submission',
        targetReviewType: 'template_submission',
        priorityMapping: {
          standard: 'medium',
          expedited: 'high'
        },
        complexityMapping: {
          simple: 'simple',
          advanced: 'moderate',
          enterprise: 'complex'
        },
        criteriaMapping: {
          template: ['quality_check', 'safety_review', 'compliance_check']
        }
      }
    ];
  }

  private getIntegrationMapping(sourceSystem: SourceSystem, sourceType: string): IntegrationMapping | null {
    return this.config.integrationMappings.find(
      mapping => mapping.sourceSystem === sourceSystem && mapping.sourceType === sourceType
    ) || null;
  }

  private mapPriority(sourceData: unknown, mapping: IntegrationMapping): ReviewPriority | null {
    const sourcePriority = sourceData.priority || sourceData.severity || 'medium';
    return mapping.priorityMapping[sourcePriority] || null;
  }

  private mapComplexity(sourceData: unknown, mapping: IntegrationMapping): ReviewComplexity {
    const sourceComplexity = sourceData.complexity || 'simple';
    return mapping.complexityMapping[sourceComplexity] || 'simple';
  }

  private async buildReviewMetadata(
    sourceSystem: SourceSystem,
    sourceType: string,
    sourceData: unknown,
    complexity: ReviewComplexity,
    additionalContext?: any
  ): Promise<ReviewMetadata> {
    return {
      sourceData,
      businessContext: this.extractBusinessContext(sourceSystem, sourceType, sourceData),
      riskLevel: this.assessRiskLevel(sourceData),
      confidenceScore: sourceData.confidenceScore || 75,
      automatedRecommendation: this.generateAutomatedRecommendation(sourceSystem, sourceData),
      tags: this.generateTags(sourceSystem, sourceType, sourceData),
      flagged: this.checkForFlags(sourceData),
      estimatedReviewTime: this.estimateReviewTime(complexity, sourceData),
      complexity,
      ...additionalContext
    };
  }

  private generateReviewContent(
    sourceSystem: SourceSystem,
    sourceType: string,
    sourceData: unknown
  ): { title: string; description: string } {
    switch (sourceSystem) {
    case 'fraud_monitoring':
      return {
        title: `Fraud Case Review: ${sourceData.caseId}`,
        description: `Review fraud case with score ${sourceData.fraudScore} for ${sourceData.entityType} ${sourceData.entityId}`
      };
      
    case 'enforcement_actions':
      return {
        title: `Enforcement ${sourceType}: ${sourceData.actionId || sourceData.appealId}`,
        description: `Review ${sourceType} for ${sourceData.targetType || 'action'} ${sourceData.targetId || sourceData.actionId}`
      };
      
    case 'marketplace':
      return {
        title: `Template Submission: ${sourceData.templateData?.name || sourceData.submissionId}`,
        description: `Review template submission from ${sourceData.submittedBy}`
      };
      
    default:
      return {
        title: `${sourceSystem} Review: ${sourceData.id}`,
        description: `Review ${sourceType} from ${sourceSystem}`
      };
    }
  }

  // Priority mapping helpers
  private mapFraudPriorityToReviewPriority(priority: string): ReviewPriority {
    const mapping: Record<string, ReviewPriority> = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      urgent: 'urgent'
    };
    return mapping[priority] || 'medium';
  }

  private mapAlertSeverityToReviewPriority(severity: string): ReviewPriority {
    const mapping: Record<string, ReviewPriority> = {
      info: 'low',
      warning: 'medium',
      critical: 'high',
      urgent: 'urgent'
    };
    return mapping[severity] || 'medium';
  }

  private mapEnforcementSeverityToReviewPriority(severity: string): ReviewPriority {
    const mapping: Record<string, ReviewPriority> = {
      low: 'medium',
      medium: 'high',
      high: 'urgent',
      critical: 'urgent'
    };
    return mapping[severity] || 'medium';
  }

  // Sync queue processing
  private startSyncProcessor(): void {
    if (this.processingQueue) return;
    
    this.processingQueue = true;
    this.processSyncQueue();
  }

  private async processSyncQueue(): Promise<void> {
    while (this.processingQueue && this.syncQueue.length > 0) {
      const event = this.syncQueue.shift();
      if (event) {
        try {
          await this.processIntegrationEvent(event);
        } catch (error) {
          console.error('Failed to process integration event:', error);
        }
      }
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.processingQueue = false;
  }

  private async processIntegrationEvent(event: IntegrationEvent): Promise<void> {
    // Process integration events from the queue
    console.log(`Processing integration event: ${event.type}`);
  }

  private async logIntegrationEvent(type: string, data: Record<string, unknown>): Promise<void> {
    await this.auditService.logEvent({
      userId: 'system',
      action: `integration_${type}`,
      details: data,
      severity: 'info'
    });
  }

  // Placeholder helper methods
  private extractBusinessContext(sourceSystem: SourceSystem, sourceType: string, _____sourceData: unknown): string {
    return `${sourceSystem} ${sourceType} review`;
  }

  private assessRiskLevel(sourceData: unknown): string {
    return sourceData.riskLevel || sourceData.severity || 'medium';
  }

  private generateAutomatedRecommendation(sourceSystem: SourceSystem, _____sourceData: unknown): string {
    return `Automated recommendation for ${sourceSystem} review`;
  }

  private generateTags(sourceSystem: SourceSystem, sourceType: string, sourceData: unknown): string[] {
    return [sourceSystem, sourceType, ...(sourceData.tags || [])];
  }

  private checkForFlags(sourceData: unknown): boolean {
    return sourceData.flagged || (sourceData.riskFlags && sourceData.riskFlags.length > 0) || false;
  }

  private estimateReviewTime(complexity: ReviewComplexity, sourceData: unknown): number {
    const baseTime = {
      simple: 15,
      moderate: 30,
      complex: 60,
      expert_required: 120
    }[complexity];

    return sourceData.estimatedTime || baseTime;
  }
}

// Supporting interfaces
interface IntegrationStatus {
  system: SourceSystem;
  status: 'active' | 'inactive' | 'error';
  lastSync: Date;
  errorCount: number;
  totalProcessed: number;
}

interface IntegrationEvent {
  type: string;
  sourceSystem: SourceSystem;
  data: Record<string, unknown>;
  timestamp: Date;
  processed: boolean;
}