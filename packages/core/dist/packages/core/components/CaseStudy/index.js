/**
 * Epic 16 - Case Study Components Export Index
 * Task: E16-1753114247141-49BDC0 - Design case study UI components
 *
 * Central export file for all case study components.
 */
export { CaseStudyCard } from './CaseStudyCard';
export { CaseStudyGallery } from './CaseStudyGallery';
export { CaseStudyModal } from './CaseStudyModal';
// Default configurations
export const CASE_STUDY_DEFAULTS = {
    variant: 'standard',
    layout: 'grid',
    pageSize: 12,
    showFilters: true,
    showSearch: true,
    showSort: true,
    showMetrics: true,
    showTemplates: true,
    showAuthor: true
};
// Filter presets for common use cases
export const CASE_STUDY_FILTER_PRESETS = {
    featured: {
        featuredOnly: true,
        status: ['featured']
    },
    beginner: {
        difficulty: ['beginner']
    },
    advanced: {
        difficulty: ['advanced', 'expert']
    },
    templateSuccess: {
        type: ['template-success']
    },
    roiAnalysis: {
        type: ['roi-analysis']
    },
    industryShowcase: {
        type: ['industry-showcase']
    },
    recentlyPublished: {
        publishedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
};
// Sort presets
export const CASE_STUDY_SORT_PRESETS = {
    newest: { field: 'publishedAt', direction: 'desc' },
    oldest: { field: 'publishedAt', direction: 'asc' },
    mostViewed: { field: 'views', direction: 'desc' },
    mostLiked: { field: 'likes', direction: 'desc' },
    mostHelpful: { field: 'helpfulVotes', direction: 'desc' },
    alphabetical: { field: 'title', direction: 'asc' }
};
