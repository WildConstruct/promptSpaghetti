/**
 * Mobile-optimized node editor layout
 */
import React from 'react';
import { GraphNode } from '@prompt-spaghetti/graph-core';
export interface MobileNodeEditorProps {
    node: GraphNode | null;
    onUpdate?: (nodeId: string, updates: Partial<GraphNode>) => void;
    onDelete?: (nodeId: string) => void;
    onClose?: () => void;
    className?: string;
    style?: React.CSSProperties;
}
export declare const MobileNodeEditor: React.FC<MobileNodeEditorProps>;
//# sourceMappingURL=MobileNodeEditor.d.ts.map