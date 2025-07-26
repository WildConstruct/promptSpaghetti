/**
 * Sticky Note Context Menu Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 1
 *
 * Context menu for sticky note operations like edit, delete,
 * change color, and duplicate.
 */
import React from 'react';
import { StickyNoteContextMenuOptions } from '../../types/CollaborationTypes';
interface StickyNoteContextMenuProps extends StickyNoteContextMenuOptions {
    onClose: () => void;
}
export declare const StickyNoteContextMenu: React.FC<StickyNoteContextMenuProps>;
export {};
//# sourceMappingURL=StickyNoteContextMenu.d.ts.map