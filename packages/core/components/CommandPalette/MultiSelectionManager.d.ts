/**
 * Professional Multi-Selection System for Graph Editor
 * Phase 2: Critical Professional Features Implementation
 *
 * Cinema 4D-inspired multi-selection with professional visual feedback
 */
import React from 'react';
import { Node, Edge } from 'reactflow';
export interface SelectionRect {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    active: boolean;
}
export interface MultiSelectionManagerProps {
    nodes: Node[];
    edges: Edge[];
    selectedNodes: Node[];
    selectedEdges: Edge[];
    onNodesSelect: (nodes: Node[]) => void;
    onEdgesSelect: (edges: Edge[]) => void;
    onSelectionChange: (selection: {)
        nodes: Node[];
        edges: Edge[];
    }) => void;
    theme?: 'light' | 'dark' | 'cinema';
    disabled?: boolean;
}
export declare const MultiSelectionManager: React.FC<MultiSelectionManagerProps>;
export default MultiSelectionManager;
//# sourceMappingURL=MultiSelectionManager.d.ts.map