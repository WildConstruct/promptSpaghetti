import React from 'react';
import { RestorationPreviewResponse, RestorationConfig, ResolutionStrategy } from '../../types/restoration';

interface RestorationPreviewProps {
    preview: RestorationPreviewResponse;
    config: RestorationConfig;
    onConflictResolve: (conflictId: string, strategy: ResolutionStrategy) => void;

export declare const RestorationPreview: React.FC<RestorationPreviewProps>;
export {};
//# sourceMappingURL=RestorationPreview.d.ts.map