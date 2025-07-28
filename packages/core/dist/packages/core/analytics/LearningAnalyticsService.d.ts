/**
 * Epic 16 - Learning Analytics Service Implementation
 * Task: E16-1753114247088-3E0D09 - Implement usage analytics
 *
 * Service implementation that integrates learning analytics with existing marketplace
 * analytics infrastructure, providing comprehensive insights into learning effectiveness,
 * community engagement, and knowledge base usage.
 */
import { LearningAnalyticsService } from './LearningAnalyticsExtension';
import { SkillAssessmentEngine } from '../community/SkillLevelTagging';
import { MarketplaceTutorialSystemService } from '../community/MarketplaceTutorialSystem';
export declare class LearningAnalyticsServiceImpl implements LearningAnalyticsService {
    private apiClient;
    private skillAssessmentEngine;
    private tutorialService;
    constructor();
    apiClient: unknown;
    skillAssessmentEngine: SkillAssessmentEngine;
    tutorialService: MarketplaceTutorialSystemService;
}
//# sourceMappingURL=LearningAnalyticsService.d.ts.map