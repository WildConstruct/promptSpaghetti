/**
 * Region Group Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 3
 *
 * Visual region grouping component with boundaries, labels, and interactive controls
 * for organizing and managing collections of nodes on the graph canvas.
 */
import React from 'react';
import { RegionGroup as RegionGroupType, RegionGroupAction } from '../../types/CollaborationTypes';

}
}
interface RegionGroupProps {
    group: RegionGroupType;
    onAction: (action: RegionGroupAction) => void;
    selected?: boolean;
    canEdit?: boolean;
    canMove?: boolean;
    canResize?: boolean;
    showLabel?: boolean;
    showNodeCount?: boolean;
    nodeCount?: number;
    zoom?: number;

export declare const RegionGroup: React.FC<RegionGroupProps>;
export default RegionGroup;
//# sourceMappingURL=RegionGroup.d.ts.map
}
}