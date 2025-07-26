import { jsx as _jsx } from "react/jsx-runtime";
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
import { useCallback } from 'react';
import { useViewport } from 'reactflow';
import { useGraphStore } from '../../graphStore';
import { StickyNotesLayer } from '../Annotations/StickyNotesLayer';
export const StickyNotesManager = ({ disabled = false, readonly = false, author = 'Anonymous' }) => {
    const { stickyNotes, setStickyNotes } = useGraphStore();
    const viewport = useViewport();
    // Handle notes changes from the layer
    const handleNotesChange = useCallback((notes) => {
        setStickyNotes(notes);
    }, [setStickyNotes]);
    // Get canvas size and offset from ReactFlow
    const canvasSize = {
        width: 5000, // Large canvas size for sticky notes
        height: 5000
    };
    const canvasOffset = {
        x: viewport.x,
        y: viewport.y
    };
    // Don't render if disabled
    if (disabled) {
        return null;
    }
    return (_jsx(StickyNotesLayer, { notes: stickyNotes, onNotesChange: handleNotesChange, canvasSize: canvasSize, canvasOffset: canvasOffset, zoom: viewport.zoom, author: author, readOnly: readonly }));
};
export default StickyNotesManager;
