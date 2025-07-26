/**
 * Node Labels Layer Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 2
 *
 * Management layer for all node labels on the canvas, handling
 * label creation, updates, display modes, and ensuring proper
 * integration with the node system.
 */
import React from 'react';
import { Node } from 'reactflow';
import { NodeLabelConfig, NodeLabelPreferences } from '../../types/CollaborationTypes';
interface NodeLabelsLayerProps {
    nodes: Node[];
    labelConfigs: Record<string, NodeLabelConfig>;
    onLabelConfigsChange: (configs: Record<string, NodeLabelConfig>) => void;
    labelPreferences?: NodeLabelPreferences;
    selectedNodeId?: string | null;
    hoveredNodeId?: string | null;
    focusedNodeId?: string | null;
    author?: string;
    readOnly?: boolean;
    canvasOffset?: {
        x: number;
        y: number;
    };
    zoom?: number;
}
export declare const NodeLabelsLayer: React.FC<NodeLabelsLayerProps>;
export default NodeLabelsLayer;
//# sourceMappingURL=NodeLabelsLayer.d.ts.map