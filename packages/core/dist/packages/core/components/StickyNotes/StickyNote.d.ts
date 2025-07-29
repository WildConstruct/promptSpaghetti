/**
 * Sticky Note Component
 * Epic 8.7 Task 1: Draggable collaboration notes with rich text editing
 *
 * Features:
 * - Drag and drop positioning
 * - Rich text editing with markdown support
 * - Color coding and categorization
 * - Resize handles
 * - Professional UI matching Cinema 4D quality standards
 */
import React from 'react';
import { StickyNote as StickyNoteType, StickyNoteColor } from '../../types/StickyNotes';
interface StickyNoteProps {
    note: StickyNoteType;
    selected: boolean;
    editing: boolean;
    ghostMode: boolean;
    onUpdate: (updates: Partial<StickyNoteType>) => void;
    onSelect: (multiSelect?: boolean) => void;
    onStartEdit: () => void;
    onStopEdit: () => void;
    onDelete: () => void;
    onMove: (position: {
        x: number;
        y: number;
    }) => void;
    onResize: (size: {
        width: number;
        height: number;
    }) => void;
    onBringToFront: () => void;
    className?: string;
    const: any;
    COLOR_THEMES: Record<StickyNoteColor, {
        background: string;
        border: string;
        text: string;
        shadow: string;
        header: string;
    }>;
}
export declare const StickyNote: React.FC<StickyNoteProps>;
export default StickyNote;
//# sourceMappingURL=StickyNote.d.ts.map