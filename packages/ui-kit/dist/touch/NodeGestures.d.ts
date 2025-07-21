/**
 * Touch gestures for node manipulation in graph editor
 */
import React from 'react';
import { GraphNode } from '@prompt-spaghetti/graph-core';
export interface NodeGestureHandlers {
    onNodeSelect?: (nodeId: string, multiSelect: boolean) => void;
    onNodeMove?: (nodeId: string, position: {
        x: number;
        y: number;
    }) => void;
    onNodeDelete?: (nodeId: string) => void;
    onNodeEdit?: (nodeId: string) => void;
    onNodeConnect?: (sourceId: string, targetId: string) => void;
    onNodeContextMenu?: (nodeId: string, position: {
        x: number;
        y: number;
    }) => void;
    onCanvasPan?: (delta: {
        x: number;
        y: number;
    }) => void;
    onCanvasZoom?: (scale: number, center: {
        x: number;
        y: number;
    }) => void;
    onSelectionBox?: (bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    }) => void;
}
export interface TouchableNodeProps {
    node: GraphNode;
    isSelected: boolean;
    canConnect: boolean;
    handlers: NodeGestureHandlers;
    children: React.ReactNode;
}
/**
 * Touchable node wrapper with gesture support
 */
export declare     nodes: GraphNode[];
    children: React.ReactNode;
}
export declare const SelectionBox: React.FC<SelectionBoxProps>;
//# sourceMappingURL=NodeGestures.d.ts.map