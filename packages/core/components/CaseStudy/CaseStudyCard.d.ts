/**
 * Epic 16 - Case Study Card Component
 * Task: E16-1753114247141-49BDC0 - Design case study UI components
 *
 * Responsive card component for displaying case studies in gallery/list views.
 * Showcases key metrics, templates used, and engagement data.
 */
import React from 'react';
import { CaseStudy } from '../../models/CaseStudyDataModel';

}
}
export interface CaseStudyCardProps {
    caseStudy: CaseStudy;
    variant?: 'compact' | 'standard' | 'featured';
    showMetrics?: boolean;
    showTemplates?: boolean;
    showAuthor?: boolean;
    onClick?: (caseStudy: CaseStudy) => void;
    onTemplateClick?: (templateId: string) => void;
    onAuthorClick?: (authorId: string) => void;
    onBookmark?: (caseStudyId: string) => void;
    onLike?: (caseStudyId: string) => void;
    onShare?: (caseStudy: CaseStudy) => void;
    className?: string;

export declare const CaseStudyCard: React.FC<CaseStudyCardProps>;
export default CaseStudyCard;
//# sourceMappingURL=CaseStudyCard.d.ts.map
}
}