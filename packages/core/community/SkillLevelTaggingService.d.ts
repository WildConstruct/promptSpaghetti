/**
 * Epic 16 - Skill Level Tagging Service
 * Task: E16-1753114247112-47B1EB - Implement skill level tagging
 *
 * Service implementation for automated and manual skill level classification,
 * user skill assessment, and learning path optimization.
 */
import { SkillLevel, SkillDomain, SkillLevelClassification, ContentSkillTag, UserSkillProfile, LearningGoal, ContentRecommendation, OptimizedLearningPath, ContentSuggestion, CommunitySkillFeedback, ValidationResult, SkillAssessmentEngine } from './SkillLevelTagging';
export declare class SkillLevelTaggingService implements SkillAssessmentEngine {
    private apiClient;
    constructor(apiClient: any);
    analyzeContent(content: any): Promise<SkillLevelClassification>;
    classifyDifficulty(content: any, domain: SkillDomain): Promise<SkillLevel>;
    tagContentWithSkillLevel(contentId: string, skillTag: Omit<ContentSkillTag, 'id' | 'tagged_at' | 'last_updated'>): Promise<ContentSkillTag>;
    getContentSkillTags(contentId: string): Promise<ContentSkillTag[]>;
    assessUserSkillLevel(userId: string, domain: SkillDomain): Promise<UserSkillProfile>;
    updateUserSkillAssessment(userId: string, domain: SkillDomain, newLevel: SkillLevel, evidence: string[]): Promise<void>;
    recommendContent(userProfile: UserSkillProfile, learningGoals: LearningGoal[]): Promise<ContentRecommendation[]>;
    suggestNextContent(userId: string, currentContent: string): Promise<ContentSuggestion[]>;
    recommendLearningPath(userId: string, targetSkills: Array<{)
        domain: SkillDomain;
        level: SkillLevel;
    }>): Promise<string[]>;
    optimizeLearningPath(userId: string, pathId: string): Promise<OptimizedLearningPath>;
    incorporateCommunityFeedback(contentId: string, feedback: CommunitySkillFeedback): Promise<void>;
    submitSkillFeedback(userId: string, contentId: string, feedback: {)
        perceived_difficulty: number;
        level_appropriateness: 'too_easy' | 'just_right' | 'too_hard';
        suggested_level?: SkillLevel;
        learning_effectiveness: {
            helped_learn_skill: boolean;
            clear_explanations: boolean;
            good_examples: boolean;
            would_recommend: boolean;
        };
        improvement_suggestions?: string[];
    }): Promise<void>;
    validateSkillTagging(contentId: string): Promise<ValidationResult>;
    auditSkillClassifications(domain?: SkillDomain): Promise<{
        total_content: number;
        classification_accuracy: number;
        community_consensus: number;
        issues_found: Array<{
            content_id: string;
            issue_type: string;
            severity: string;
            description: string;
        }>;
    }>;
    private extractDifficultyFactors;
    private calculateBeginnerScore;
    private calculateIntermediateScore;
    private calculateAdvancedScore;
    private calculateExpertScore;
    private enhanceClassificationWithContext;
    private adjustScoresWithCommunityFeedback;
    private calculateReadingLevel;
    private analyzeVocabularyComplexity;
    private calculateConceptDensity;
    private analyzeStepComplexity;
    private assessExampleQuality;
    private assessExplanationDepth;
    private analyzeCodeComplexity;
    private assessToolComplexity;
    private countPrerequisites;
    private assessInteractivityLevel;
    private assessInteractionLevel;
    private assessSetupComplexity;
    private calculateTargetCompletionRate;
    private getCommunityDifficultyFeedback;
    private getUserCompletionHistory;
    private getUserAssessmentResults;
    private getUserCommunityContributions;
    private getUserPeerFeedback;
    private calculateUserSkillLevels;
    private inferLearningPreferences;
    private getSkillProgressionHistory;
    private identifyStrugglePatterns;
    private getUserLearningGoals;
    private inferMotivationFactors;
    private getUserCareerContext;
    private getUserProfile;
    private generateNextContentSuggestions;
    private getLearningPath;
    private identifySkillGaps;
    private optimizeContentSequence;
    private calculateTimeSavings;
    private getPersonalizationFactors;
    private calculateOptimizationConfidence;
    private rankAndFilterRecommendations;
    private adjustTagsBasedOnFeedback;
    private shouldTriggerReassessment;
    private scheduleContentReassessment;
    private getExpertSkillReviews;
    private getContentById;
    private performValidationAnalysis;
    private inferTargetAudience;

//# sourceMappingURL=SkillLevelTaggingService.d.ts.map