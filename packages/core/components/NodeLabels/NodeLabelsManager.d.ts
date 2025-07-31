/**
 * Node Labels Manager
 * Epic 8.7 Task 2: Main manager component for enhanced node labeling system
 *
 * Features:
 * - Integration with React Flow canvas
 * - Multiple display modes and positioning
 * - Inline editing with keyboard shortcuts
 * - Professional styling with 5 style variants
 * - Integration with graph store for persistence
 */
import React from 'react';

}
interface NodeLabelsManagerProps {
    disabled?: boolean;
    readonly?: boolean;
    author?: string;
    selectedNodeId?: string | null;
    onNodeHover?: (nodeId: string | null) => void;
    onNodeFocus?: (nodeId: string | null) => void;

export declare const NodeLabelsManager: React.FC<NodeLabelsManagerProps>;
export default NodeLabelsManager;
//# sourceMappingURL=NodeLabelsManager.d.ts.map
}