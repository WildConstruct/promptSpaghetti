/**
 * Epic 16 Contribution Submission Form Component
 * Task: E16-1753114247118-46E576 - Design contribution UI components
 *
 * Multi-step form for creating new contributions with type-specific
 * fields, validation, and preview capabilities.
 */
import React from 'react';
import { CreateContributionRequest } from '../../types/contributions';

export interface ContributionSubmissionFormProps {
    onSubmit: (data: CreateContributionRequest) => void;
    onCancel: () => void;
    initialData?: Partial<CreateContributionRequest>;
    className?: string;

export declare const ContributionSubmissionForm: React.FC<ContributionSubmissionFormProps>;
export default ContributionSubmissionForm;
//# sourceMappingURL=ContributionSubmissionForm.d.ts.map