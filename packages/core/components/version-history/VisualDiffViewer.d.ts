/**
 * Epic 9.3.2 - Visual Diff Viewer Component
 * Advanced visual comparison of graph versions with side-by-side and overlay views
 */
import React from 'react';
import { GraphDiff, GraphData } from './GraphDiffEngine';

}
interface VisualDiffViewerProps {
    fromGraphData: GraphData;
    toGraphData: GraphData;
    diff?: GraphDiff;
    isOpen: boolean;
    onClose: () => void;
    onApplyChange?: (changeId: string) => void;
    onRejectChange?: (changeId: string) => void;
    className?: string;

export declare const VisualDiffViewer: React.FC<VisualDiffViewerProps>;
}
export {};
//# sourceMappingURL=VisualDiffViewer.d.ts.map