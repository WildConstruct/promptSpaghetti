import React from 'react';
import { PreviewResultWithPath } from './types/ExecutionPath';
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
}
export declare const PreviewModal: React.FC<PreviewModalProps>;
export {};
//# sourceMappingURL=PreviewModal.d.ts.map