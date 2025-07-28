/**
 * Epic 16 UI Components - Pattern Library Export
 *
 * Consolidated export for all Epic 16 marketplace and community UI components
 * following consistent design patterns for the ecosystem.
 */
export { MarketplaceCard } from './MarketplaceCard';
export type { MarketplaceTemplate } from './MarketplaceCard';
export { TemplatePreviewModal } from './TemplatePreviewModal';
export { ROICalculator } from './ROICalculator';
export { SavingsEstimation } from './SavingsEstimation';
export { BusinessValueDemo } from './BusinessValueDemo';
export { MarketplaceSearch } from './MarketplaceSearch';
export type { SearchFilters } from './MarketplaceSearch';
export { CommunityForumCard } from './CommunityForumCard';
export type { ForumPost, ForumUser } from './CommunityForumCard';
export { ProgressTracker } from './ProgressTracker';
export type { UserProgress, EngagementMetrics, Milestone, ProgressTrackerProps } from './ProgressTracker';
export { TutorialPlayer, TutorialBrowser } from './TutorialPlayer';
export type { Tutorial, TutorialStep, TutorialAction, TutorialProgress, TutorialPlayerProps, TutorialBrowserProps } from './TutorialPlayer';
export { UserEngagementDemo } from './UserEngagementDemo';
export type { UserEngagementDemoProps } from './UserEngagementDemo';
export { MarketplaceTutorialSystemService } from '../../community/MarketplaceTutorialSystem';
export type { MarketplaceTutorial, MarketplaceTutorialStep, TutorialSession, LearningPath } from '../../community/MarketplaceTutorialSystem';
export { LearningAnalyticsServiceImpl } from '../../analytics/LearningAnalyticsService';
export type { LearningAnalyticsEvent, LearningEffectivenessMetrics, UserLearningAnalytics, CommunityKnowledgeMetrics } from '../../analytics/LearningAnalyticsExtension';
export { MarketplaceContentFilteringServiceImpl } from '../../community/MarketplaceContentFilteringSystem';
export type { MarketplaceContentFilteringService, ContentFilteringRequest, ContentFilteringResult, MarketplaceContentType, FilteringCategory } from '../../community/MarketplaceContentFilteringSystem';
export { EnhancedModerationServiceImpl } from '../../community/EnhancedAutomatedModerationSystem';
export type { EnhancedModerationService, EnhancedModerationRequest, EnhancedModerationResult, EnhancedModerationContext, ModerationWorkflowType } from '../../community/EnhancedAutomatedModerationSystem';
export { Epic16IntegratedService } from '../../community/Epic16Integration';
export type { Epic16UnifiedService, LearningContext, PersonalizedLearningInsights } from '../../community/Epic16Integration';
export { Epic16TicketIntegration } from '../Tickets/Epic16TicketIntegration';
export { ArticleManagement, ArticleList, ArticleEditor, default as ArticleManagementDefault } from './ArticleManagement';
export type { Article, ArticleCategory, ArticleAuthor, ArticleAttachment, ArticleFilter, ArticleSort, ArticleManagementProps } from './ArticleManagement';
export { KnowledgeBaseLayout, KnowledgeBaseHero, ArticleCard, CategoryBrowser, LearningPathCard, default as KnowledgeBaseLayoutDefault } from './KnowledgeBaseLayouts';
export type { KnowledgeBaseSection, LearningPath, LearningPathStep, SearchResult, KnowledgeBaseStats, KnowledgeBaseHeroProps, ArticleCardProps, CategoryBrowserProps, LearningPathCardProps, KnowledgeBaseLayoutProps } from './KnowledgeBaseLayouts';
export { KnowledgeBaseDemo, default as KnowledgeBaseDemoDefault } from './KnowledgeBaseDemo';
export type { KnowledgeBaseDemoProps } from './KnowledgeBaseDemo';
export interface Epic16ComponentTheme {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
        primary: string;
        secondary: string;
        disabled: string;
    };
    border: {
        light: string;
        medium: string;
        dark: string;
    };
    state: {
        success: string;
        warning: string;
        error: string;
        info: string;
    };
}
export declare const defaultEpic16Theme: Epic16ComponentTheme;
//# sourceMappingURL=index.d.ts.map