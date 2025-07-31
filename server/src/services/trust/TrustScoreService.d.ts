/**
 * Trust Score Service - Epic 17
 *
 * Comprehensive trust scoring system for marketplace users, creators, templates,
 * and transactions. Provides multi-dimensional trust assessment with real-time
 * fraud detection and community validation.
 *
 * Task: E17-1753114397410-91A84B - Create trust score
 * Epic: 17 - Backstage Admin Controls
 */
import { Database } from '../../database';
import { AnalyticsService } from '../../marketplace/analytics.service';
import { ContentQualityMetricsService } from '../../marketplace/ContentQualityMetricsService';
import { QualityMetricsService } from '../QualityMetricsService';
import { TimeRange } from '../../marketplace/analytics.types';
import { 
  UserTrustScore,
  TemplateTrustScore,
  TransactionTrustScore,
  TrustScoreConfig,
  TrustScoreAnalytics,
  TrustFactor,
  RiskFactor,
  VerificationStatus
} from '../../../../packages/core/types/TrustTypes';
import { 
  EnforcementAction,
  ViolationReport,
  ViolationCategory,
  ActionSeverity
} from '../../../../packages/core/types/EnforcementTypes';
export declare class TrustScoreService {
    private db;
    private analyticsService;
    private contentQualityService;
    private qualityService;
    private config;
    constructor(
      database: Database,
      analyticsService: AnalyticsService,
      contentQualityService: ContentQualityMetricsService,
      qualityService: QualityMetricsService,
      config?: TrustScoreConfig
    );
    /**
     * Calculate comprehensive trust score for a user
     */
    calculateUserTrustScore(userId: string, forceRecalculation?: boolean): Promise<UserTrustScore>;
    /**
     * Update user trust score based on specific events
     */
    updateUserTrustScore(userId: string, events: TrustEvent[]): Promise<UserTrustScore>;
    /**
     * Get trust score for multiple users
     */
    getBulkUserTrustScores(userIds: string[], includeDetails?: boolean): Promise<UserTrustScore[]>;
    /**
     * Calculate comprehensive trust score for a template
     */
    calculateTemplateTrustScore(templateId: string, forceRecalculation?: boolean): Promise<TemplateTrustScore>;
    /**
     * Get trust factors for a template
     */
    getTemplateTrustFactors(templateId: string): Promise<TrustFactor[]>;
    /**
     * Calculate trust score for a transaction
     */
    calculateTransactionTrustScore(
      transactionId: string,
      buyerId: string,
      sellerId: string,
      templateId: string
    ): Promise<TransactionTrustScore>;
    /**
     * Generate marketplace trust analytics
     */
    generateTrustAnalytics(timeRange?: TimeRange): Promise<TrustScoreAnalytics>;
    /**
     * Report suspicious activity
     */
    reportSuspiciousActivity(report: SuspiciousActivityReport): Promise<void>;
    private determineUserType;
    private calculateUserTrustDimensions;
    private calculateCreatorTrustScore;
    private calculateBuyerTrustScore;
    private calculateOverallUserTrustScore;
    private scoreToGrade;
    private scoreToStatus;
    private isScoreRecent;
    private shouldRecalculate;
    private getDefaultConfig;
    private getUserProfile;
    private getUserActivity;
    private getUserTemplates;
    private getUserTransactions;
    private getUserReviews;
    private getUserSecurityEvents;
    private getLatestUserTrustScore;
    private getLatestTemplateTrustScore;
    private storeUserTrustScore;
    private storeTemplateTrustScore;
    private storeTransactionTrustScore;
    private calculateReliabilityScore;
    private calculateQualityScore;
    private calculateCommunityScore;
    private calculateSecurityScore;
    private calculateExpertiseScore;
    private calculateTemplateTrustDimensions;
    private calculateTemplateContentQuality;
    private calculateAccountAge;
    private calculateActivityConsistency;
    private calculateCommitmentScore;
    private calculateResponsivenessScore;
    private formatTimeAgo;
    private calculateScoreTrend;
    private calculateUserContentQuality;
    private calculateUserReviewQuality;
    private calculateQualityImprovement;
    private calculateInnovationScore;
    private calculateHelpfulnessScore;
    private calculateCommunityEngagement;
    private calculateMentoringScore;
    private calculateCollaborationScore;
    private calculateAccountSecurity;
    private calculateUserCompliance;
    private calculateSecurityIncidentScore;
    private calculatePrivacyScore;
    private calculateSkillLevel;
    private calculateExperienceLevel;
    private calculateCertificationScore;
    private calculatePeerRecognition;
    private assessCodeQuality;
    private assessDocumentationQuality;
    private calculateTemplateSafety;
    private calculateTemplateReliability;
    private calculateTemplateCommunityScore;
    private calculateTemplateTransparency;
    private assessDocumentationCompleteness;
    private assessCodeClarity;
    private getTemplateData;
    private getTemplateUsageMetrics;
    private getTemplateReviews;
    private getTemplateSecurityScan;
    private getTemplatePerformanceMetrics;
    private calculateOverallTemplateTrustScore;
    private generateTemplateQualityAssessment;
    private generateTemplateSafetyAssessment;
    private generateCommunityValidationMetrics;
    private generateTemplatePerformanceMetrics;
    private generateTemplateTrustIndicators;
    private generateTemplateWarnings;
    private calculateTemplateConfidence;
    private extractTrustFactors;
    private calculateTransactionTrustFactors;
    private assessTransactionRisk;
    private calculateTransactionRiskScore;
    private calculateFraudScore;
    private detectFraudIndicators;
    private calculateOverallTransactionTrustScore;
    private calculateTransactionConfidence;
    private createAnalyticsPeriod;
    private calculateMarketplaceTrustMetrics;
    private calculateUserTrustDistribution;
    private calculateTemplateTrustDistribution;
    private analyzeTrustTrends;
    private analyzeRiskFactors;
    private generateTrustInsights;
    private generateTrustRecommendations;
    private sanitizeTrustScore;
    private getDefaultUserTrustScore;
    private applyTrustEvents;
    private calculateDataQuality;
    private calculateDataCompleteness;
    private calculateConfidence;
    private generateUserTrustFactors;
    private assessUserRiskFactors;
    private getUserTrustHistory;
    private calculateUserTrustTrends;
    private getUserTrustBadges;
    private getUserCertifications;
    private calculateContentQualityTrustMetrics;
    private calculateReputationMetrics;
    private calculateSatisfactionMetrics;
    private calculateComplianceMetrics;
    private calculatePurchaseHistoryMetrics;
    private calculateReviewQualityMetrics;
    private calculateCommunityContributionMetrics;
    private calculatePaymentReliabilityMetrics;
    private getTransactionData;
    private getTransactionContext;
    private storeSuspiciousActivityReport;
    private updateFraudDetectionModels;
    private sendSecurityAlert;
    /**
     * Get enforcement history for a user to factor into trust score
     */
    getUserEnforcementHistory(userId: string): Promise<{
        totalActions: number;
        activeActions: number;
        recentViolations: ViolationReport[];
        enforcementImpact: number;
        lastActionDate?: Date;
    }>;
    /**
     * Evaluate if a trust score change should trigger enforcement actions
     */
    evaluateTrustScoreForEnforcement(
      trustScore: UserTrustScore | TemplateTrustScore | TransactionTrustScore,
      entityType: 'user' | 'template' | 'transaction'
    ): Promise<{
        shouldTriggerEnforcement: boolean;
        recommendedActions: {
            actionType: string;
            severity: ActionSeverity;
            reason: string;
            priority: number;
        }[];
        riskFactors: RiskFactor[];
    }>;
    /**
     * Create a violation report based on trust score analysis
     */
    createTrustBasedViolationReport(entityType: 'user' | 'template' | 'transaction', entityId: string, trustScore: UserTrustScore | TemplateTrustScore | TransactionTrustScore, violationType: ViolationCategory, details: {
        description: string;
        confidence: number;
        evidence: string[];
    }): Promise<ViolationReport>;
    /**
     * Get user verification status for enforcement exemptions
     */
    getUserVerificationStatus(userId: string): Promise<VerificationStatus | null>;
    /**
     * Update trust score based on enforcement action results
     */
    updateTrustScoreFromEnforcement(
      entityType: 'user' | 'template' | 'transaction',
      entityId: string,
      action: EnforcementAction,
      actionResult: 'applied' | 'reversed' | 'modified'
    ): Promise<void>;
    private checkForRapidScoreDecline;
    private mapTrustScoreToSeverity;
    private captureEntitySnapshot;
    private storeTrustBasedViolationReport;
    private invalidateTrustScoreCache;
    private generateReportId;
    private generateEvidenceId;
}
}
}
export interface TrustEvent {
    eventType: string;
    entityType: 'user' | 'template' | 'transaction';
    entityId: string;
    impact: number;
    description: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}
}
}
}
}
export interface SuspiciousActivityReport {
    reportId?: string;
    type: 'fraud' | 'abuse' | 'violation' | 'security' | 'quality';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    userId?: string;
    templateId?: string;
    transactionId?: string;
    evidence: string[];
    reportedBy: string;
    reportedAt: Date;
}
}
}
//# sourceMappingURL=TrustScoreService.d.ts.map