/**
 * Revision Request Form - E17-1753114397311-674990
 *
 * Comprehensive revision request form component for Epic 17 - Backstage Admin Controls.
 * Allows users to create and submit revision requests with evidence attachments.
 *
 * Following patterns from DocumentReviewInterface and ApprovalWorkflowManager.
 */
import React from 'react';
import { RevisionRequestFormData, RevisionContentType } from '../../types/RevisionRequestTypes';

interface RevisionRequestFormProps {
    initialData?: Partial<RevisionRequestFormData>;
    contentType?: RevisionContentType;
    contentId?: string;
    contentTitle?: string;
    onSubmit: (formData: RevisionRequestFormData) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
    className?: string;

export declare const RevisionRequestForm: React.FC<RevisionRequestFormProps>;
export default RevisionRequestForm;
//# sourceMappingURL=RevisionRequestForm.d.ts.map