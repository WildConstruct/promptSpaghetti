import React from 'react';
interface ResponsiveCorrectionsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}
export declare const ResponsiveCorrectionsPanel: React.FC<ResponsiveCorrectionsPanelProps>;
export declare const useCorrectionsPanel: () => {
    isOpen: boolean;
    showStats: boolean;
    openPanel: () => void;
    closePanel: () => void;
    togglePanel: () => void;
    openStats: () => void;
    closeStats: () => void;
    toggleStats: () => void;
};
export {};
//# sourceMappingURL=ResponsiveCorrectionsPanel.d.ts.map