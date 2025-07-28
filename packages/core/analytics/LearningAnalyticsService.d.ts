/**
 * Epic 16 - Learning Analytics Service Implementation
 * Task: E16-1753114247088-3E0D09 - Implement usage analytics
 *
 * Service implementation that integrates learning analytics with existing marketplace
 * analytics infrastructure, providing comprehensive insights into learning effectiveness,
 * community engagement, and knowledge base usage.
 */
import { 
  LearningAnalyticsService,
  LearningAnalyticsEvent,
  TutorialAnalyticsEvent,
  KnowledgeBaseAnalyticsEvent,
  CommunityAnalyticsEvent,
  LearningEffectivenessMetrics,
  UserLearningAnalytics,
  CommunityKnowledgeMetrics,
  KnowledgeBaseUsageMetrics,
  LearningTrend,
  PerformanceAnomaly,
  PersonalizedInsight,
  LearningPathAnalytics,
  SkillDevelopmentROI,
  CommunityHealthScore,
  KnowledgeTransferMetrics,
  RealTimeLearningActivity,
  RealTimeCommunityEngagement,
  RealTimeKnowledgeActivity,
  LearningAnalyticsQuery,
  AnalyticsCorrelationQuery,
  CrossPlatformInsights,
  LearningDataExport,
  LearningAnalyticsReportConfig,
  ComprehensiveAnalyticsReport,
  ContentType
} from './LearningAnalyticsExtension';
import { TimeRange } from '../../../server/src/marketplace/analytics.types';
import { SkillDomain, SkillAssessmentEngine } from '../community/SkillLevelTagging';
import { MarketplaceTutorialSystemService } from '../community/MarketplaceTutorialSystem';
export declare class LearningAnalyticsServiceImpl implements LearningAnalyticsService {
    private apiClient;
    private skillAssessmentEngine;
    private tutorialService;
    constructor();
      apiClient: unknown,
      skillAssessmentEngine: SkillAssessmentEngine,
      tutorialService: MarketplaceTutorialSystemService,
    );
    trackLearningEvent(event: LearningAnalyticsEvent): Promise<void>;
    trackTutorialEvent(event: TutorialAnalyticsEvent): Promise<void>;
    trackKnowledgeBaseEvent(event: KnowledgeBaseAnalyticsEvent): Promise<void>;
    trackCommunityEvent(event: CommunityAnalyticsEvent): Promise<void>;
    generateLearningEffectivenessMetrics();
      contentId: string,
      timeRange: TimeRange,
    ): Promise<LearningEffectivenessMetrics>;
    generateUserLearningAnalytics(userId: string, timeRange: TimeRange): Promise<UserLearningAnalytics>;
    generateCommunityKnowledgeMetrics(communityId: string, timeRange: TimeRange): Promise<CommunityKnowledgeMetrics>;
    generateKnowledgeBaseUsageMetrics();
      knowledgeBaseId: string,
      timeRange: TimeRange,
    ): Promise<KnowledgeBaseUsageMetrics>;
    identifyLearningTrends(timeRange: TimeRange): Promise<LearningTrend[]>;
    detectContentPerformanceAnomalies(contentType: ContentType, threshold: number): Promise<PerformanceAnomaly[]>;
    generatePersonalizedLearningInsights(userId: string): Promise<PersonalizedInsight[]>;
    identifyKnowledgeGaps(skillDomain?: SkillDomain): Promise<unknown[]>;
    analyzeLearningPathEffectiveness(learningPathId: string): Promise<LearningPathAnalytics>;
    measureSkillDevelopmentROI(userId: string, timeRange: TimeRange): Promise<SkillDevelopmentROI>;
    assessCommunityHealthScore(communityId: string): Promise<CommunityHealthScore>;
    calculateKnowledgeTransferMetrics(timeRange: TimeRange): Promise<KnowledgeTransferMetrics>;
    getLearningActivityRealTime(): Promise<RealTimeLearningActivity>;
    getCommunityEngagementRealTime(): Promise<RealTimeCommunityEngagement>;
    getKnowledgeBaseActivityRealTime(): Promise<RealTimeKnowledgeActivity>;
    exportLearningDataForAnalysis(query: LearningAnalyticsQuery): Promise<LearningDataExport>;
    integrateWithMarketplaceAnalytics(correlationQuery: AnalyticsCorrelationQuery): Promise<CrossPlatformInsights>;
    generateComprehensiveReport(reportConfig: LearningAnalyticsReportConfig): Promise<ComprehensiveAnalyticsReport>;
    private enrichLearningEvent;
    private triggerRealTimeProcessing;
    private isSkillRelevantEvent;
    private updateUserSkillContext;
    private processTutorialSpecificAnalytics;
    private updateTutorialEffectivenessMetrics;
    private processLearningMilestones;
    private formatTimeRange;
    private gatherUserLearningActivity;
    private calculateUserSkillDevelopment;
    private analyzeUserEngagementPatterns;
    private calculateUserLearningEffectiveness;
    private calculateMarketplaceCorrelation;
    private enhanceLearningEffectivenessMetrics;
    private calculateSegmentedPerformance;
    private analyzeKnowledgeSharingPatterns;
    private assessCommunityHealth;
    private measureCommunityLearningImpact;
    private analyzeSearchIntelligence;
    private evaluateContentEffectiveness;
    private analyzeUserJourneys;
    private processSearchPatterns;
    private updateContentQualityMetrics;
    private analyzeContentGaps;
    private processCommunityEngagement;
    private updateCommunityHealthMetrics;
    private trackKnowledgeSharingImpact;
    private applyTrendDetectionML;
    private addTrendPredictions;
    private validateAnomaliesStatistically;
    private addAnomalyRecommendations;
    private getUserLearningHistory;
    private generatePersonalizedInsights;
    private rankInsightsByImpact;
    private analyzeKnowledgeGapsAdvanced;
    private prioritizeKnowledgeGaps;
    private calculateLearningPathEffectiveness;
    private analyzePersonalizationImpact;
    private calculateLearningInvestment;
    private measureLearningOutcomes;
    private calculateSkillDevelopmentROI;
    private assessCommunityHealthDimensions;
    private analyzeHealthTrends;
    private calculateOverallHealthScore;
    private performKnowledgeNetworkAnalysis;
    private calculateKnowledgeTransferEffectiveness;
    private enhanceCorrelationAnalysis;
    private generateActionableInsights;
    private generateExecutiveSummary;
    private generateDetailedSections;
    private generateReportAppendices;
    private storeReport;
}
//# sourceMappingURL=LearningAnalyticsService.d.ts.map