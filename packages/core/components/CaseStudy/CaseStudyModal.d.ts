/**
 * Epic 16 - Case Study Modal Component
 * Task: E16-1753114247141-49BDC0 - Design case study UI components
 *
 * Modal component for displaying full case study details with rich media,
 * metrics, and template integration.
 */
import React from 'react';
import { CaseStudy } from '../../models/CaseStudyDataModel';

}
export interface CaseStudyModalProps {
    caseStudy: CaseStudy;
    isOpen: boolean;
    onClose: () => void;
    onTemplateClick?: (templateId: string) => void;
    onAuthorClick?: (authorId: string) => void;
    onShare?: (caseStudy: CaseStudy) => void;
    className?: string;

export declare const CaseStudyModal: React.FC<CaseStudyModalProps>;
export default CaseStudyModal;
//# sourceMappingURL=CaseStudyModal.d.ts.map
}