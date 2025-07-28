import React from 'react';
import { RestorationAttempt } from '../../types/restoration';

interface RestorationWizardProps {
    visible: boolean;
    onClose: () => void;
    projectId: string;
    sourceSnapshotId: string;
    targetSnapshotId?: string;
    onSuccess?: (attempt: RestorationAttempt) => void;
    onError?: (error: string) => void;

export declare const RestorationWizard: React.FC<RestorationWizardProps>;
export {};
//# sourceMappingURL=RestorationWizard.d.ts.map