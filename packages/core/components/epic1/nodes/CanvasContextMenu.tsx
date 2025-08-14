import React from 'react';
import './NodeContextMenu.css';

interface CanvasContextMenuProps {
  position: { x: number; y: number };
  onAddNote: (position: { x: number; y: number }) => void;
  onAddBoundingBox?: (position: { x: number; y: number }) => void;
  onLayoutCleanup?: () => void;
  onClose: () => void;
}

/**
 * Context menu for canvas right-click
 */
export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  position,
  onAddNote,
  onAddBoundingBox,
  onLayoutCleanup,
  onClose
}) => {
  const handleAddNote = () => {
    // Get the graph position from the click position
    const graphPosition = {
      x: position.x - 100, // Offset to center the note
      y: position.y - 75
    };
    onAddNote(graphPosition);
    onClose();
  };
  
  const handleAddBoundingBox = () => {
    // Get the graph position from the click position
    const graphPosition = {
      x: position.x - 200, // Offset to center the box
      y: position.y - 150
    };
    if (onAddBoundingBox) {
      onAddBoundingBox(graphPosition);
    }
    onClose();
  };

  return (
    <div
      className="node-context-menu"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 10000
      }}
      onMouseLeave={onClose}
    >
      <div className="context-menu-items">
        <button className="context-menu-item" onClick={handleAddNote}>
          <span className="icon">📝</span>
          Add Post-it Note
        </button>
        {onAddBoundingBox && (
          <button className="context-menu-item" onClick={handleAddBoundingBox}>
            <span className="icon">📦</span>
            Add Region Box
          </button>
        )}
        {onLayoutCleanup && (
          <>
            <div className="context-menu-separator" />
            <button className="context-menu-item" onClick={() => { onLayoutCleanup(); onClose(); }}>
              <span className="icon">🧹</span>
              Clean Up Layout
              <span className="context-menu-shortcut">⌘⇧L</span>
            </button>
          </>
        )}
        <div className="context-menu-separator" />
        <button className="context-menu-item" onClick={onClose}>
          <span className="icon">✕</span>
          Cancel
        </button>
      </div>
    </div>
  );
};