/**
 * Professional Integration Component
 * Phase 2: Complete Professional Features Integration
 *
 * Integrates all professional features into a unified Cinema 4D-inspired interface
 */
import React from 'react';
import { Node, Edge } from 'reactflow';
export interface ProfessionalIntegrationProps {
    nodes: Node[];
    edges: Edge[];
    selectedNodes: Node[];
    selectedEdges: Edge[];
    onNodesChange: (nodes: Node[]) => void;
    onEdgesChange: (edges: Edge[]) => void;
    onNodesSelect: (nodes: Node[]) => void;
    onEdgesSelect: (edges: Edge[]) => void;
    onNodeCreate: (nodeType: string, position: {
        x: number;
        y: number;
    }, data?: Record<string, unknown>) => void;
    onNodeDelete: (nodeIds: string[]) => void;
    onExport: (format: 'json' | 'png' | 'svg' | 'pdf') => void;
    onSave: () => void;
    onLoad: () => void;
    theme?: 'light' | 'dark' | 'cinema';
}
export declare const ProfessionalIntegration: React.FC<ProfessionalIntegrationProps>;
export default ProfessionalIntegration;
//# sourceMappingURL=ProfessionalIntegration.d.ts.map