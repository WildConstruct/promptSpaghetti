/**
 * Epic 16 - Case Study Gallery Component
 * Task: E16-1753114247141-49BDC0 - Design case study UI components
 *
 * Main gallery component for displaying case studies in grid/list layouts
 * with filtering, sorting, and search capabilities.
 */
import React from 'react';
import { CaseStudy, CaseStudyFilter, CaseStudySort } from '../../models/CaseStudyDataModel';

}
}
export interface CaseStudyGalleryProps {
    initialFilter?: CaseStudyFilter;
    initialSort?: CaseStudySort;
    layout?: 'grid' | 'list';
    showFilters?: boolean;
    showSearch?: boolean;
    showSort?: boolean;
    maxItems?: number;
    onCaseStudyClick?: (caseStudy: CaseStudy) => void;
    onTemplateClick?: (templateId: string) => void;
    onAuthorClick?: (authorId: string) => void;
    className?: string;

export declare const CaseStudyGallery: React.FC<CaseStudyGalleryProps>;
export default CaseStudyGallery;
//# sourceMappingURL=CaseStudyGallery.d.ts.map
}
}