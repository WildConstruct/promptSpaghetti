/**
 * Sticky Notes Manager
 * Epic 8.7 Task 1: Main manager component for collaborative sticky notes system
 *
 * Features:
 * - Integration with React Flow canvas
 * - Toolbar for note creation and management
 * - Keyboard shortcuts
 * - Context menus
 * - Professional UI matching Cinema 4D standards
 */
import React from 'react';
interface StickyNotesManagerProps {
    canvasRef?: React.RefObject<HTMLElement>;
    disabled?: boolean;
    readonly?: boolean;
    onNotesChange?: (noteCount: number) => void;
    className?: string;
}
export declare const StickyNotesManager: React.FC<StickyNotesManagerProps>;
export default StickyNotesManager;
//# sourceMappingURL=StickyNotesManager.d.ts.map