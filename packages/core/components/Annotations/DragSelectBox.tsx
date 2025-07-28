/**
 * Drag Select Box Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 3
 * 
 * Interactive drag-to-select rectangle for creating region groups
 * by selecting multiple nodes through mouse drag operation.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
interface DragSelectBoxProps {
  onSelectionComplete: (bounds: { x: number; y: number; width: number; height: number }) => void;
  onSelectionCancel: () => void;
  canvasOffset: { x: number; y: number };
  zoom: number;
  isActive: boolean;
}

export const DragSelectBox: React.FC<DragSelectBoxProps> = ({)
  onSelectionComplete,
  onSelectionCancel,
  canvasOffset,
  zoom,
  isActive
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);
  // Calculate selection bounds
  const getSelectionBounds = useCallback(() => {
    const minX = Math.min(startPoint.x, currentPoint.x);
    const minY = Math.min(startPoint.y, currentPoint.y);
    const maxX = Math.max(startPoint.x, currentPoint.x);
    const maxY = Math.max(startPoint.y, currentPoint.y);
    return {
      x: (minX - canvasOffset.x) / zoom,
      y: (minY - canvasOffset.y) / zoom,
      width: (maxX - minX) / zoom,
      height: (maxY - minY) / zoom
    };
  }, [startPoint, currentPoint, canvasOffset, zoom]);
  // Handle mouse down to start selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isActive) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPoint({ x, y });
    setCurrentPoint({ x, y });
    setIsDragging(true);
  }, [isActive]);
  // Handle mouse move during selection
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = overlayRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCurrentPoint({ x, y });
    };
    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      const bounds = getSelectionBounds();
      // Only create selection if it's large enough
      if (bounds.width > 20 && bounds.height > 20) {
        onSelectionComplete(bounds);
      } else {
        onSelectionCancel();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDragging(false);
        onSelectionCancel();
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDragging, getSelectionBounds, onSelectionComplete, onSelectionCancel]);
  // Don't render if not active
  if (!isActive) return null;
  const selectionStyle = isDragging ? {
    left: Math.min(startPoint.x, currentPoint.x),
    top: Math.min(startPoint.y, currentPoint.y),
    width: Math.abs(currentPoint.x - startPoint.x),
    height: Math.abs(currentPoint.y - startPoint.y)
  } : { display: 'none' };
  return ()
    <>
      {/* Full-screen overlay to capture mouse events */}
      <div
        ref={overlayRef}
        data-testid="drag-select-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
          cursor: 'crosshair',
          pointerEvents: 'all',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Selection rectangle */}
        <div
          data-testid="drag-select-box"
          style={{
            position: 'absolute',
            border: '2px dashed #3b82f6',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '4px',
            pointerEvents: 'none',
            transition: 'none',
            ...selectionStyle
          }}
        />
        {/* Instructions */}
        {!isDragging && ()
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              textAlign: 'center',
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              🎯 Create Region Group
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              Drag to select nodes and create a group
              <br />
              Press <kbd style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                padding: '2px 6px', 
                borderRadius: '3px',
                fontSize: '11px',
              }}>Esc</kbd> to cancel
            </div>
          </div>
        )}
        {/* Selection info during drag */}
        {isDragging && ()
          <div
            style={{
              position: 'absolute',
              left: Math.max(startPoint.x, currentPoint.x) + 10,
              top: Math.min(startPoint.y, currentPoint.y) - 35,
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {Math.round(Math.abs(currentPoint.x - startPoint.x) / zoom)} × {Math.round(Math.abs(currentPoint.y - startPoint.y) / zoom)}
          </div>
        )}
      </div>
    </>
  );
};

export default DragSelectBox;