/**
 * Epic 16 - Case Study Components Export Index
 * Task: E16-1753114247141-49BDC0 - Design case study UI components
 * 
 * Central export file for all case study components.
 */

export { CaseStudyCard } from './CaseStudyCard';
export type { CaseStudyCardProps } from './CaseStudyCard';

export { CaseStudyGallery } from './CaseStudyGallery';
export type { CaseStudyGalleryProps } from './CaseStudyGallery';

export { CaseStudyModal } from './CaseStudyModal';
export type { CaseStudyModalProps } from './CaseStudyModal';

// Re-export data model types for convenience
export type {
  CaseStudy,
  CaseStudyType,
  CaseStudyStatus,
  IndustryCategory,
  CaseStudyFilter,
  CaseStudySort,
  CaseStudyQuery,
  CaseStudyQueryResponse,
  CreateCaseStudyRequest,
  UpdateCaseStudyRequest,
  CaseStudyAnalytics,
  ROIMetrics,
  PerformanceMetrics,
  TemplateReference,
  TemplateImplementation,
  CaseStudyMedia,
  MediaGallery,
  MediaType
} from '../../models/CaseStudyDataModel';

// Component variants and configuration types
export type CaseStudyVariant = 'compact' | 'standard' | 'featured';
export type CaseStudyLayout = 'grid' | 'list';

// Default configurations
export const CASE_STUDY_DEFAULTS = {
  variant: 'standard' as CaseStudyVariant,
  layout: 'grid' as CaseStudyLayout,
  pageSize: 12,
  showFilters: true,
  showSearch: true,
  showSort: true,
  showMetrics: true,
  showTemplates: true,
  showAuthor: true,
} as const;

// Filter presets for common use cases
export const CASE_STUDY_FILTER_PRESETS = {
  featured: {,
    featuredOnly: true,
    status: ['featured' as const],
  },
  beginner: {,
    difficulty: ['beginner' as const],
  },
  advanced: {,
    difficulty: ['advanced' as const, 'expert' as const]
  },
  templateSuccess: {,
    type: ['template-success' as const],
  },
  roiAnalysis: {,
    type: ['roi-analysis' as const],
  },
  industryShowcase: {,
    type: ['industry-showcase' as const],
  },
  recentlyPublished: {,
    publishedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
} as const;

// Sort presets
export const CASE_STUDY_SORT_PRESETS = {
  newest: { field: 'publishedAt' as const, direction: 'desc' as const },
  oldest: { field: 'publishedAt' as const, direction: 'asc' as const },
  mostViewed: { field: 'views' as const, direction: 'desc' as const },
  mostLiked: { field: 'likes' as const, direction: 'desc' as const },
  mostHelpful: { field: 'helpfulVotes' as const, direction: 'desc' as const },
  alphabetical: { field: 'title' as const, direction: 'asc' as const }
} as const;