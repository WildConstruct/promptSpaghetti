/**
 * Enhanced Node Label Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 2
 *
 * Advanced node labeling system with inline editing, multiple display modes,
 * positioning options, and professional styling.
 */
import React from 'react';
import { NodeLabelConfig, NodeLabelAction, NodeLabelDisplayMode } from '../../types/CollaborationTypes';

}
}
interface NodeLabelProps {
    config: NodeLabelConfig;
    nodeId: string;
    currentNodeLabel?: string;
    onAction: (action: NodeLabelAction) => void;
    displayMode?: NodeLabelDisplayMode;
    isNodeSelected?: boolean;
    isNodeHovered?: boolean;
    isNodeFocused?: boolean;
    canEdit?: boolean;
    showTooltip?: boolean;

export declare const NodeLabel: React.FC<NodeLabelProps>;
export default NodeLabel;
//# sourceMappingURL=NodeLabel.d.ts.map
}
}