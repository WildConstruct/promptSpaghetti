/**
 * Epic 16 UI Components - Pattern Library Export
 *
 * Consolidated export for all Epic 16 marketplace and community UI components
 * following consistent design patterns for the ecosystem.
 */
// Core marketplace components
export { MarketplaceCard } from './MarketplaceCard';
export { TemplatePreviewModal } from './TemplatePreviewModal';
// Business calculation components for Case Study Showcase (Story 16.4.4)
export { ROICalculator } from './ROICalculator';
export { SavingsEstimation } from './SavingsEstimation';
export { BusinessValueDemo } from './BusinessValueDemo';
export { MarketplaceSearch } from './MarketplaceSearch';
// Community forum components
export { CommunityForumCard } from './CommunityForumCard';
// User engagement and onboarding components
export { ProgressTracker } from './ProgressTracker';
export { TutorialPlayer, TutorialBrowser } from './TutorialPlayer';
export { UserEngagementDemo } from './UserEngagementDemo';
// Tutorial System (Task: E16-1753114247090-BB71B5)
export { MarketplaceTutorialSystemService } from '../../community/MarketplaceTutorialSystem';
// Usage Analytics (Task: E16-1753114247088-3E0D09)
export { LearningAnalyticsServiceImpl } from '../../analytics/LearningAnalyticsService';
// Content Filtering System (Task: E16-1753114247062-9DDA29)
export { MarketplaceContentFilteringServiceImpl } from '../../community/MarketplaceContentFilteringSystem';
// Enhanced Automated Moderation (Task: E16-1753114247061-797978)
export { EnhancedModerationServiceImpl } from '../../community/EnhancedAutomatedModerationSystem';
// Unified Integration
export { Epic16IntegratedService } from '../../community/Epic16Integration';
// Re-export ticket integration components for convenience
export { Epic16TicketIntegration } from '../Tickets/Epic16TicketIntegration';
// Article Management System (Task: E16-1753114247073-332A94)
export { ArticleManagement, ArticleList, ArticleEditor, default as ArticleManagementDefault } from './ArticleManagement';
// Knowledge Base UI Layouts (Task: E16-1753114247069-7900C5)
export { KnowledgeBaseLayout, KnowledgeBaseHero, ArticleCard, CategoryBrowser, LearningPathCard, default as KnowledgeBaseLayoutDefault } from './KnowledgeBaseLayouts';
// Knowledge Base Demo Integration (Shows both systems working together)
export { KnowledgeBaseDemo, default as KnowledgeBaseDemoDefault } from './KnowledgeBaseDemo';
export const defaultEpic16Theme = {
    primary: '#2563eb', // blue-600,
    secondary: '#64748b', // slate-500,
    accent: '#7c3aed', // violet-600,
    background: '#f8fafc', // slate-50,
    surface: '#ffffff',
    text: {
        primary: '#1e293b', // slate-800,
        secondary: '#64748b', // slate-500,
        disabled: '#94a3b8' // slate-400,
    },
    border: {
        light: '#e2e8f0', // slate-200,
        medium: '#cbd5e1', // slate-300,
        dark: '#94a3b8' // slate-400,
    },
    state: {
        success: '#10b981', // emerald-500,
        warning: '#f59e0b', // amber-500,
        error: '#ef4444', // red-500,
        info: '#3b82f6' // blue-500,
    },
    // Design system utilities
    const: Epic16DesignTokens = {
        spacing: {
            xs: '0.25rem', // 4px,
            sm: '0.5rem', // 8px,
            md: '1rem', // 16px,
            lg: '1.5rem', // 24px,
            xl: '2rem', // 32px,
            '2xl': '3rem' // 48px,
        },
        borderRadius: {
            sm: '0.25rem', // 4px,
            md: '0.375rem', // 6px,
            lg: '0.5rem', // 8px,
            xl: '0.75rem' // 12px,
        },
        fontSize: {
            xs: '0.75rem', // 12px,
            sm: '0.875rem', // 14px,
            base: '1rem', // 16px,
            lg: '1.125rem', // 18px,
            xl: '1.25rem', // 20px,
            '2xl': '1.5rem' // 24px,
        },
        fontWeight: {
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
        },
        boxShadow: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        }
    } };
