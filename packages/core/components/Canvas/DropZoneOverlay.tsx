// Drop Zone Overlay for Visual Feedback
// Story 2.5a: Asset Browser Integration MVP

import React, { useEffect, useState } from 'react';
import './DropZoneOverlay.css';

export interface DropZoneState {
  isOver: boolean;
  canDrop: boolean;
  targetNode?: string;
  position?: { x: number; y: number };
}

interface DropZoneOverlayProps {
  state: DropZoneState;
  message?: string;
}

export const DropZoneOverlay: React.FC<DropZoneOverlayProps> = ({ state, message }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(state.isOver);
  }, [state.isOver]);

  if (!visible) return null;

  const overlayClass = state.canDrop ? 'valid-drop' : 'invalid-drop';
  const icon = state.canDrop ? '✓' : '✗';
  const defaultMessage = state.canDrop 
    ? (state.targetNode ? 'Replace node' : 'Drop to create')
    : 'Invalid drop zone';

  return (
    <div className={`drop-zone-overlay ${overlayClass}`}>
      <div className="drop-zone-indicator">
        <span className="drop-zone-icon">{icon}</span>
        <span className="drop-zone-message">{message || defaultMessage}</span>
      </div>
      {state.position && (
        <div 
          className="drop-position-marker"
          style={{
            left: state.position.x,
            top: state.position.y
          }}
        />
      )}
    </div>
  );
};