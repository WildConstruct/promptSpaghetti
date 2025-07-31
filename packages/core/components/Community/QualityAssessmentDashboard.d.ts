/**
 * Epic 16 - Quality Assessment Dashboard Component
 * Task: E16-1753114247130-02122C - Create quality assessment
 *
 * React component for managing content quality assessment workflows,
 * displaying quality metrics, and coordinating editorial reviews.
 */
import React from 'react';
import { QualityAssessmentWorkflow } from '../../community/ContentQualityAssessment';

}
export interface QualityAssessmentDashboardProps {
    contentId: string;
    versionId: string;
    userRole?: 'author' | 'editor' | 'reviewer' | 'admin';
    onQualityImproved?: (newScore: number) => void;
    onWorkflowUpdate?: (workflow: QualityAssessmentWorkflow) => void;
    showReviewInterface?: boolean;
    readOnly?: boolean;
    className?: string;

export declare const QualityAssessmentDashboard: React.FC<QualityAssessmentDashboardProps>;
export default QualityAssessmentDashboard;
//# sourceMappingURL=QualityAssessmentDashboard.d.ts.map
}