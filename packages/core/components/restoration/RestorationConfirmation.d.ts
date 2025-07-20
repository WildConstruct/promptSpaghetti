import React from 'react';
import { RestorationPreviewResponse, RestorationConfig } from '../../types/restoration';
interface RestorationConfirmationProps {
    preview: RestorationPreviewResponse;
    config: RestorationConfig;
    onConfirm: () => void;
    onCancel: () => void;
}
export declare const RestorationConfirmation: React.FC<RestorationConfirmationProps>;
export {};
//# sourceMappingURL=RestorationConfirmation.d.ts.map