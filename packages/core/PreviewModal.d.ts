import React from "react";
interface PreviewResult {
    seed: number;
    output?: string;
    error?: string;
}
interface PreviewModalProps {
    open: boolean;
    loading: boolean;
    error: string | null;
    results: PreviewResult[];
    onClose: () => void;
    onCancel?: () => void;
    onResultHover?: (index: number) => void;
}
export declare const PreviewModal: React.FC<PreviewModalProps>;
export {};
//# sourceMappingURL=PreviewModal.d.ts.map