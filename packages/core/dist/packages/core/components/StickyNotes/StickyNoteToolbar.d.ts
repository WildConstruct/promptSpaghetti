/**
 * Sticky Note Toolbar
 * Epic 8.7 Task 1: Professional toolbar for sticky notes management
 *
 * Features:
 * - Color selection
 * - Category management
 * - Quick templates
 * - Settings toggle
 * - Professional Cinema 4D quality UI
 */
import React from 'react';
import { StickyNote, StickyNoteColor, StickyNoteCategory } from '../../types/StickyNotes';
interface StickyNoteToolbarProps {
    selectedNotes: StickyNote[];
    onColorChange: (color: StickyNoteColor) => void;
    onCategoryChange: (category: StickyNoteCategory) => void;
    onCreate: (color: StickyNoteColor, category: StickyNoteCategory, content: string) => void;
    onSettingsChange: (settings: unknown) => void;
    settings: unknown;
    className?: string;
}
export declare const StickyNoteToolbar: React.FC<StickyNoteToolbarProps>;
export default StickyNoteToolbar;
//# sourceMappingURL=StickyNoteToolbar.d.ts.map