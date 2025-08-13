/**
 * Context Menu for Node Operations
 * Provides right-click menu for node actions including Save as Preset
 */

import React, { useCallback, useEffect, useRef } from 'react';
import './NodeContextMenu.css';

export interface ContextMenuPosition {
  x: number;
  y: number;
}

interface NodeContextMenuProps {
  nodeId: string;
  nodeType: string;
  position: ContextMenuPosition | null;
  onClose: () => void;
  onSaveAsPreset: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onAttachNote?: () => void;
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  nodeId,
  nodeType,
  position,
  onClose,
  onSaveAsPreset,
  onDuplicate,
  onDelete,
  onAttachNote
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (position) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [position, onClose]);

  const handleAction = useCallback((action: () => void) => {
    action();
    onClose();
  }, [onClose]);

  if (!position) return null;

  // Adjust position to ensure menu stays within viewport
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: Math.min(position.y, window.innerHeight - 200),
    left: Math.min(position.x, window.innerWidth - 200),
    zIndex: 1000
  };

  return (
    <div 
      ref={menuRef}
      className="node-context-menu"
      style={menuStyle}
    >
      <div className="context-menu-header">
        <span className="node-type-badge">{nodeType}</span>
      </div>
      
      <div className="context-menu-items">
        <button 
          className="context-menu-item"
          onClick={() => handleAction(onSaveAsPreset)}
        >
          <span className="icon">💾</span>
          Save as Preset
        </button>
        
        {onAttachNote && (
          <button 
            className="context-menu-item"
            onClick={() => handleAction(onAttachNote)}
          >
            <span className="icon">📝</span>
            Attach Note
          </button>
        )}
        
        {onDuplicate && (
          <button 
            className="context-menu-item"
            onClick={() => handleAction(onDuplicate)}
          >
            <span className="icon">📋</span>
            Duplicate
          </button>
        )}
        
        {onDelete && (
          <>
            <div className="context-menu-separator" />
            <button 
              className="context-menu-item danger"
              onClick={() => handleAction(onDelete)}
            >
              <span className="icon">🗑️</span>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};