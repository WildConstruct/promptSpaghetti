import React from 'react';
import { Node } from 'reactflow';
import { NodeData } from '../../types/NodeTypes';
export interface InlineEditorManagerProps {
    nodes: Node<NodeData>[];
    onNodeUpdate: (nodeId: string, updates: Partial<NodeData>) => void;
    canvasRef?: React.RefObject<HTMLDivElement>;
}
export declare const InlineEditorManager: React.FC<InlineEditorManagerProps>;
export declare const useInlineEditor: () => {
    activeNodeId: string;
    activateEditor: (nodeId: string) => void;
    deactivateEditor: () => void;
    isNodeBeingEdited: (nodeId: string) => boolean;
};
export declare const InlineEditorContext: any;
export declare const InlineEditorProvider: React.FC<{}, children>, React: any, ReactNode: any;
export declare const useInlineEditorContext: () => any;
//# sourceMappingURL=InlineEditorManager.d.ts.map