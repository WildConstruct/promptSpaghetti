/**
 * Sticky Note Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 1
 *
 * Draggable, resizable sticky note with rich text editing capabilities
 * and color coding for team collaboration.
 */
import React from 'react';
import { StickyNote as StickyNoteType, StickyNoteAction } from '../../types/CollaborationTypes';

interface StickyNoteProps {
    note: StickyNoteType;
    onAction: (action: StickyNoteAction) => void;
    onContextMenu?: (e: React.MouseEvent, noteId: string) => void;
    selected?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canMove?: boolean;
    canResize?: boolean;

export declare const StickyNote: React.FC<StickyNoteProps>;
export {};
//# sourceMappingURL=StickyNote.d.ts.map