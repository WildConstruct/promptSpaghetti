import React from 'react';
import { PreviewResultWithPath } from './types/ExecutionPath';
import { VarianceSuggestion } from './services/VarianceAnalysisService';
interface ResultAction {
    type: 'regenerate' | 'lock' | 'unlock' | 'compare' | 'export';
    resultIndex: number;
    data?: Record<string, unknown>;
}
interface LockedResult {
    index: number;
    seed: number;
    lockedAt: number;
    note?: string;
}
interface PreviewResult {
    seed: number;
    output?: string;
    error?: string;
}
interface PreviewModalProps {
    open: boolean;
    loading: boolean;
    error: string | null;
    results: PreviewResult[] | PreviewResultWithPath[];
    onClose: () => void;
    onCancel?: () => void;
    onResultHover?: (index: number) => void;
    onNodeHighlight?: (nodeIds: string[]) => void;
    onResultAction?: (action: ResultAction) => void;
    lockedResults?: LockedResult[];
    regeneratingResults?: number[];
    onVarianceSuggestion?: (suggestion: VarianceSuggestion) => void;
}
export declare const PreviewModal: React.FC<PreviewModalProps>;
export default PreviewModal;
//# sourceMappingURL=PreviewModal.d.ts.map