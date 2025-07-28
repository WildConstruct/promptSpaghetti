/**
 * Drag Select Box Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 3
 *
 * Interactive drag-to-select rectangle for creating region groups
 * by selecting multiple nodes through mouse drag operation.
 */
import React from 'react';
interface DragSelectBoxProps {
    onSelectionComplete: (bounds: {)
        x: number;
        y: number;
        width: number;
        height: number;
    }) => void;
    onSelectionCancel: () => void;
    canvasOffset: {,
        x: number;
        y: number;
    };
    zoom: number;
    isActive: boolean;
}
export declare const DragSelectBox: React.FC<DragSelectBoxProps>;
export default DragSelectBox;
//# sourceMappingURL=DragSelectBox.d.ts.map