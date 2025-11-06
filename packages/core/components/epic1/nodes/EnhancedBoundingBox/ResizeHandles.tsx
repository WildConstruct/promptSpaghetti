/**
 * ResizeHandles Component
 * Provides 8-directional resize handles for bounding box
 */

import React from 'react';
import { ResizeHandlesProps, ResizeDirection } from './types';
import { BOUNDING_BOX_CONSTANTS, RESIZE_CURSORS } from './utils/constants';

const { RESIZE_HANDLES } = BOUNDING_BOX_CONSTANTS.zIndex;
const { RESIZE_HANDLE_SIZE, RESIZE_HANDLE_EDGE_SIZE, RESIZE_HANDLE_CENTER_WIDTH } = BOUNDING_BOX_CONSTANTS.ui;

const RESIZE_DIRECTIONS: ResizeDirection[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

interface HandleStyleConfig {
  position: 'absolute';
  background: string;
  border: string;
  borderRadius: string;
  cursor: string;
  zIndex: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  width: string;
  height: string;
  transform?: string;
}

/**
 * Get style configuration for a resize handle based on direction
 */
function getResizeHandleStyle(direction: ResizeDirection): HandleStyleConfig {
  const baseStyle: Partial<HandleStyleConfig> = {
    position: 'absolute',
    background: 'rgba(24, 144, 255, 0.8)',
    border: '1px solid #fff',
    borderRadius: '2px',
    cursor: RESIZE_CURSORS[direction],
    zIndex: RESIZE_HANDLES,
  };
  
  switch (direction) {
    case 'nw':
      return {
        ...baseStyle,
        top: '-5px',
        left: '-5px',
        width: `${RESIZE_HANDLE_SIZE}px`,
        height: `${RESIZE_HANDLE_SIZE}px`,
      } as HandleStyleConfig;
      
    case 'ne':
      return {
        ...baseStyle,
        top: '-5px',
        right: '-5px',
        width: `${RESIZE_HANDLE_SIZE}px`,
        height: `${RESIZE_HANDLE_SIZE}px`,
      } as HandleStyleConfig;
      
    case 'sw':
      return {
        ...baseStyle,
        bottom: '-5px',
        left: '-5px',
        width: `${RESIZE_HANDLE_SIZE}px`,
        height: `${RESIZE_HANDLE_SIZE}px`,
      } as HandleStyleConfig;
      
    case 'se':
      return {
        ...baseStyle,
        bottom: '-5px',
        right: '-5px',
        width: `${RESIZE_HANDLE_SIZE}px`,
        height: `${RESIZE_HANDLE_SIZE}px`,
      } as HandleStyleConfig;
      
    case 'n':
      return {
        ...baseStyle,
        top: '-4px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${RESIZE_HANDLE_CENTER_WIDTH}px`,
        height: `${RESIZE_HANDLE_EDGE_SIZE}px`,
      } as HandleStyleConfig;
      
    case 's':
      return {
        ...baseStyle,
        bottom: '-4px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${RESIZE_HANDLE_CENTER_WIDTH}px`,
        height: `${RESIZE_HANDLE_EDGE_SIZE}px`,
      } as HandleStyleConfig;
      
    case 'e':
      return {
        ...baseStyle,
        right: '-4px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: `${RESIZE_HANDLE_EDGE_SIZE}px`,
        height: `${RESIZE_HANDLE_CENTER_WIDTH}px`,
      } as HandleStyleConfig;
      
    case 'w':
      return {
        ...baseStyle,
        left: '-4px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: `${RESIZE_HANDLE_EDGE_SIZE}px`,
        height: `${RESIZE_HANDLE_CENTER_WIDTH}px`,
      } as HandleStyleConfig;
      
    default:
      return baseStyle as HandleStyleConfig;
  }
}

/**
 * Individual resize handle component
 */
interface ResizeHandleProps {
  direction: ResizeDirection;
  onMouseDown: (e: React.MouseEvent) => void;
}

const ResizeHandleComponent: React.FC<ResizeHandleProps> = ({
  direction,
  onMouseDown
}) => {
  const style = getResizeHandleStyle(direction);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    // Stop all propagation to prevent node dragging
    e.stopPropagation();
    e.preventDefault();
    onMouseDown(e);
  };
  
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (direction === 'n' || direction === 's') {
      target.style.transform = `${style.transform || ''} scale(1, 1.05)`.trim();
    } else if (direction === 'e' || direction === 'w') {
      target.style.transform = `${style.transform || ''} scale(1.05, 1)`.trim();
    } else {
      target.style.transform = 'scale(1.025)';
    }
  };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.transform = style.transform || 'scale(1)';
  };
  
  return (
    <div
      className={`nodrag resize-handle resize-handle-${direction}`}
      style={style}
      onMouseDown={handleMouseDown}
      onPointerDown={(e) => { e.stopPropagation(); onMouseDown(e as any); }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-direction={direction}
    />
  );
};

const ResizeHandle = React.memo(ResizeHandleComponent);

ResizeHandle.displayName = 'ResizeHandle';

/**
 * Main ResizeHandles component that renders all 8 handles
 */
const ResizeHandlesComponent: React.FC<ResizeHandlesProps> = ({
  visible,
  isLocked,
  onResizeStart
}) => {
  // Don't render if not visible or if locked
  if (!visible || isLocked) {
    return null;
  }
  
  return (
    <>
      {RESIZE_DIRECTIONS.map((direction) => (
        <ResizeHandle
          key={direction}
          direction={direction}
          onMouseDown={(e) => onResizeStart(e, direction)}
        />
      ))}
    </>
  );
};

export const ResizeHandles = React.memo(ResizeHandlesComponent);
ResizeHandles.displayName = 'ResizeHandles';
