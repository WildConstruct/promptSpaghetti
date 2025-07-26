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

import React, { useCallback, useEffect, useRef } from 'react';
import { useReactFlow, useViewport } from 'reactflow';
import { useGraphStore } from '../../graphStore';
import { StickyNotesLayer } from '../Annotations/StickyNotesLayer';
import { StickyNote as StickyNoteType } from '../../types/CollaborationTypes';

interface StickyNotesManagerProps {
  disabled?: boolean;
  readonly?: boolean;
  author?: string;
}

export const StickyNotesManager: React.FC<StickyNotesManagerProps> = ({
  disabled = false,
  readonly = false,
  author = 'Anonymous'
}) => {
  const { 
    stickyNotes, 
    setStickyNotes
  } = useGraphStore();
  
    const viewport = useViewport();

  // Handle notes changes from the layer
  const handleNotesChange = useCallback((notes: StickyNoteType[]) => {
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

  return (
    <StickyNotesLayer
      notes={stickyNotes}
      onNotesChange={handleNotesChange}
      canvasSize={canvasSize}
      canvasOffset={canvasOffset}
      zoom={viewport.zoom}
      author={author}
      readOnly={readonly}
    />
  );
};

export default StickyNotesManager;