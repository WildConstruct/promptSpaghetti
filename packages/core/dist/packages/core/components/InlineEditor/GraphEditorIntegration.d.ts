import React from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData } from '../../types/NodeTypes';
export interface GraphEditorWithInlineEditingProps {
    nodes: Node<NodeData>[];
    edges: Edge;
    onNodesChange: (changes: any) => void;
    onEdgesChange: (changes: any) => void;
    onNodeUpdate: (nodeId: string, updates: Partial<NodeData>) => void;
    onConnect: (connection: any) => void;
    className?: string;
    theme?: 'light' | 'dark' | 'cinema';
    showMinimap?: boolean;
    showControls?: boolean;
    showBackground?: boolean;
}
export declare const GraphEditorWithInlineEditing: React.FC<GraphEditorWithInlineEditingProps>;
export declare const useGraphWithInlineEditing: any;
export declare const createInlineEditingGraph: any;
export default GraphEditorWithInlineEditing;
//# sourceMappingURL=GraphEditorIntegration.d.ts.map