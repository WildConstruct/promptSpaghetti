/**
 * Mobile-optimized graph canvas
 */
import React from 'react';
import { GraphDocument } from '@prompt-spaghetti/graph-core';
export interface MobileGraphCanvasProps {
    graph: GraphDocument;
    selectedNodeId?: string;
    onNodeSelect?: (nodeId: string | null) => void;
    onNodeEdit?: (nodeId: string) => void;
    onAddNode?: () => void;
    readOnly?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
export declare const MobileGraphCanvas: React.FC<MobileGraphCanvasProps>;
//# sourceMappingURL=MobileGraphCanvas.d.ts.map