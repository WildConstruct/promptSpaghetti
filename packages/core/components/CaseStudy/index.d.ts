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
  MediaType,
} from '../../models/CaseStudyDataModel';
export type CaseStudyVariant = 'compact' | 'standard' | 'featured';
export type CaseStudyLayout = 'grid' | 'list';
export declare const CASE_STUDY_DEFAULTS: {
  readonly variant: CaseStudyVariant;
  readonly layout: CaseStudyLayout;
  readonly pageSize: 12;
  readonly showFilters: true;
  readonly showSearch: true;
  readonly showSort: true;
  readonly showMetrics: true;
  readonly showTemplates: true;
  readonly showAuthor: true;
};
export declare const CASE_STUDY_FILTER_PRESETS: {
  readonly featured: {
    readonly featuredOnly: true;
    readonly status: readonly ['featured'];
  };
  readonly beginner: {
    readonly difficulty: readonly ['beginner'];
  };
  readonly advanced: {
    readonly difficulty: readonly ['advanced', 'expert'];
  };
  readonly templateSuccess: {
    readonly type: readonly ['template-success'];
  };
  readonly roiAnalysis: {
    readonly type: readonly ['roi-analysis'];
  };
  readonly industryShowcase: {
    readonly type: readonly ['industry-showcase'];
  };
  readonly recentlyPublished: {
    readonly publishedAfter: string;
  };
};
export declare const CASE_STUDY_SORT_PRESETS: {
  readonly newest: {
    readonly field: 'publishedAt';
    readonly direction: 'desc';
  };
  readonly oldest: {
    readonly field: 'publishedAt';
    readonly direction: 'asc';
  };
  readonly mostViewed: {
    readonly field: 'views';
    readonly direction: 'desc';
  };
  readonly mostLiked: {
    readonly field: 'likes';
    readonly direction: 'desc';
  };
  readonly mostHelpful: {
    readonly field: 'helpfulVotes';
    readonly direction: 'desc';
  };
  readonly alphabetical: {
    readonly field: 'title';
    readonly direction: 'asc';
  };
};
//# sourceMappingURL=index.d.ts.map
