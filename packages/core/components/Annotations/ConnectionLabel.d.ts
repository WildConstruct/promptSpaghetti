/**
 * Connection Label Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 4
 *
 * Advanced connection labeling component with inline editing, positioning
 * along connection paths, and professional styling for annotating relationships.
 */
import React from 'react';
import { ConnectionLabel as ConnectionLabelType, ConnectionLabelAction } from '../../types/CollaborationTypes';

}
}
interface ConnectionLabelProps {
    label: ConnectionLabelType;
    onAction: (action: ConnectionLabelAction) => void;
    canEdit?: boolean;
    showTooltip?: boolean;
    isHighlighted?: boolean;
    connectionPath?: string;

export declare const ConnectionLabel: React.FC<ConnectionLabelProps>;
export default ConnectionLabel;
//# sourceMappingURL=ConnectionLabel.d.ts.map
}
}