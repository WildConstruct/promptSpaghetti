// packages/core/components/WeightControls/DragReorderList.tsx
// Drag-to-reorder interface for Story 8.3 Task 3
// Implements drag-and-drop for option reordering while maintaining weight values
import React, { useState, useRef, useCallback } from 'react';
import { WeightControlOption } from '../Inspector/WeightControlSlider';
import { getOptionColor } from './WeightVisualization';

}
export interface DragReorderListProps {
  options: WeightControlOption;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onWeightChange?: (optionId: string, newWeight: number) => void;
  onTextChange?: (optionId: string, newText: string) => void;
  className?: string;
  disabled?: boolean;
  showWeights?: boolean;
}
interface DragState {
  isDragging: boolean;
  draggedIndex: number | null;
  dragOverIndex: number | null;
}
  dragOffset: { x: number; y: number };
  ghostPosition: { x: number; y: number };
const DRAG_THRESHOLD = 5; // Minimum pixels to start drag;
const DROP_ZONE_HEIGHT = 4; // Height of drop zone indicator;
}
export const DragReorderList: React.FC<DragReorderListProps> = ({)
  options,
  onReorder,
  onWeightChange,
  onTextChange,
  className = '',
  disabled = false,
  showWeights = true
}) => {
  const [dragState, setDragState] = useState<DragState>({)
  isDragging: false,
    draggedIndex: null,
    dragOverIndex: null,
    dragOffset: { x: 0, y: 0 },
    ghostPosition: { x: 0, y: 0 }
  });
  const listRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; index: number } | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Using shared color palette from WeightVisualization component
  // Handle mouse down - prepare for potential drag
  const handleMouseDown = useCallback((event: React.MouseEvent, index: number) => {
  if (disabled || event.button !== 0) return; // Only left mouse button
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  dragStartRef.current = {
  x: event.clientX,
  y: event.clientY,
  index
};
    setDragState(prev => ({)
  ...prev,
  dragOffset: {
  x: event.clientX - rect.left,
  y: event.clientY - rect.top,
}));
  }, [disabled]);
  // Handle mouse move - start drag if threshold exceeded
  const handleMouseMove = useCallback((event: MouseEvent) => {
  if (!dragStartRef.current || dragState.isDragging) return;
  const deltaX = Math.abs(event.clientX - dragStartRef.current.x);
  const deltaY = Math.abs(event.clientY - dragStartRef.current.y);
  if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
  // Start dragging
  setDragState(prev => ({)
  ...prev,
  isDragging: true,
  draggedIndex: dragStartRef.current!.index,
  ghostPosition: {
  x: event.clientX - prev.dragOffset.x,
  y: event.clientY - prev.dragOffset.y,
}));
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none'
  }, [dragState.isDragging]);
  // Handle drag over - update drop target
  const handleDragOver = useCallback((event: MouseEvent) => {
  if (!dragState.isDragging || !listRef.current) return;
  event.preventDefault();
  // Update ghost position
  setDragState(prev => ({)
  ...prev,
  ghostPosition: {
  x: event.clientX - prev.dragOffset.x,
  y: event.clientY - prev.dragOffset.y,
}));
    // Find drop target
    const listRect = listRef.current.getBoundingClientRect();
    const relativeY = event.clientY - listRect.top;
    let dropIndex = -1;
    for (let i = 0; i < itemRefs.current.length; i++) {
  const itemEl = itemRefs.current[i];
  if (!itemEl) continue;
  const itemRect = itemEl.getBoundingClientRect();
  const itemRelativeTop = itemRect.top - listRect.top;
  const itemHeight = itemRect.height;
  if (relativeY >= itemRelativeTop && relativeY <= itemRelativeTop + itemHeight) {
  // Determine if we're in the top or bottom half
  const itemMiddle = itemRelativeTop + itemHeight / 2;
  dropIndex = relativeY < itemMiddle ? i : i + 1;
  break;
  // Clamp drop index
  dropIndex = Math.max(0, Math.min(options.length, dropIndex));
  // Don't set drop index to same as dragged or adjacent
  if (dragState.draggedIndex !== null) {
  if (dropIndex === dragState.draggedIndex || dropIndex === dragState.draggedIndex + 1) {
  dropIndex = -1;
  setDragState(prev => ({)
  ...prev,
  dragOverIndex: dropIndex,
}));
  }, [dragState.isDragging, dragState.draggedIndex, options.length]);
  // Handle mouse up - complete drag operation
  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging && dragState.draggedIndex !== null && dragState.dragOverIndex !== null) {
      // Calculate actual destination index
      let toIndex = dragState.dragOverIndex;
      if (toIndex > dragState.draggedIndex) {
        toIndex -= 1; // Adjust for the item being removed
      onReorder(dragState.draggedIndex, toIndex);
    // Reset drag state
    setDragState({)
  isDragging: false,
      draggedIndex: null,
      dragOverIndex: null,
      dragOffset: { x: 0, y: 0 },
      ghostPosition: { x: 0, y: 0 }
    });
    dragStartRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [dragState.isDragging, dragState.draggedIndex, dragState.dragOverIndex, onReorder]);
  // Attach global event listeners
  React.useEffect(() => {
    if (dragStartRef.current || dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mousemove', handleDragOver);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mousemove', handleDragOver);
        document.removeEventListener('mouseup', handleMouseUp);
      };
  }, [handleMouseMove, handleDragOver, handleMouseUp, dragState.isDragging]);
  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((event: React.TouchEvent, index: number) => {
  if (disabled || event.touches.length !== 1) return;
  const touch = event.touches[0];
  const rect = event.currentTarget.getBoundingClientRect();
  dragStartRef.current = {
  x: touch.clientX,
  y: touch.clientY,
  index
};
    setDragState(prev => ({)
  ...prev,
  dragOffset: {
  x: touch.clientX - rect.left,
  y: touch.clientY - rect.top,
}));
  }, [disabled]);
  const handleTouchMove = useCallback((event: TouchEvent) => {
  if (!dragStartRef.current || event.touches.length !== 1) return;
  const touch = event.touches[0];
  if (!dragState.isDragging) {
  const deltaX = Math.abs(touch.clientX - dragStartRef.current.x);
  const deltaY = Math.abs(touch.clientY - dragStartRef.current.y);
  if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
  event.preventDefault();
  setDragState(prev => ({)
  ...prev,
  isDragging: true,
  draggedIndex: dragStartRef.current!.index,
  ghostPosition: {
  x: touch.clientX - prev.dragOffset.x,
  y: touch.clientY - prev.dragOffset.y,
}));
    } else {
      event.preventDefault();
      handleDragOver({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} } as MouseEvent);
  }, [dragState.isDragging, handleDragOver]);
  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);
  // Touch event listeners
  React.useEffect(() => {
    if (dragStartRef.current || dragState.isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
  }, [handleTouchMove, handleTouchEnd, dragState.isDragging]);
  return;
    <div
      ref={listRef}
      className={`drag-reorder-list ${className}`}
      style={{
  position: 'relative',
  userSelect: dragState.isDragging ? 'none' : 'auto',
}}
    >
      {options.map((option, index) => {
        const isDragged = dragState.draggedIndex === index;
        const showDropZone = dragState.dragOverIndex === index && !isDragged;
        return;
          <React.Fragment key={option.id}>
            {/* Drop zone indicator */}
            {showDropZone && ()
              <div
                style={{
  height: DROP_ZONE_HEIGHT,
  background: '#4299e1',
  borderRadius: 2,
  marginBottom: 4,
  opacity: 0.8,
}}
              />
            )}
            {/* Option item */}
            <div
              ref={el => itemRefs.current[index] = el}
              onMouseDown={(e) => handleMouseDown(e, index)}
              onTouchStart={(e) => handleTouchStart(e, index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                marginBottom: 4,
                background: isDragged ? 'rgba(66, 153, 225, 0.1)' : '#2d3748',
                border: `2px solid ${isDragged ? '#4299e1' : 'transparent'}`}
},
  borderRadius: 6,
                cursor: disabled ? 'default' : 'grab',
                opacity: isDragged ? 0.5 : 1,
                transition: isDragged ? 'none' : 'all 0.2s ease',
                userSelect: 'none'
  }}
            >
              {/* Drag handle */}
              <div
                style={{
  width: 16,
  height: 16,
  marginRight: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: disabled ? 'default' : 'grab',
  color: '#a0aec0',
  fontSize: 12,
}}
              >
                ⋮⋮
              </div>
              {/* Color indicator */}
              <div
                style={{
  width: 12,
  height: 12,
  borderRadius: 2,
  backgroundColor: getOptionColor(index),
  marginRight: 8,
  flexShrink: 0,
}}
              />
              {/* Option text */}
              <input
                type="text"
                value={option.text}
                onChange={(e) => onTextChange?.(option.id, e.target.value)}
                disabled={disabled}
                style={{
  flex: 1,
  background: 'transparent',
  border: 'none',
  color: '#e2e8f0',
  fontSize: 14,
  outline: 'none',
  cursor: disabled ? 'default' : 'text',
}}
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag when editing text
              />
              {/* Weight display/control */}
              {showWeights && ()
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 8 }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={option.weight}
                    onChange={(e) => onWeightChange?.(option.id, parseInt(e.target.value))}
                    disabled={disabled || option.locked}
                    style={{
  width: 60,
  marginRight: 8,
  cursor: disabled || option.locked ? 'default' : 'pointer',
}}
                    onMouseDown={(e) => e.stopPropagation()} // Prevent drag when adjusting weight
                  />
                  <span
                    style={{
  minWidth: 35,
  textAlign: 'right',
  fontSize: 12,
  color: '#a0aec0',
}}
                  >
                    {option.weight}%
                  </span>
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
      {/* Final drop zone */}
      {dragState.dragOverIndex === options.length && ()
        <div
          style={{
  height: DROP_ZONE_HEIGHT,
  background: '#4299e1',
  borderRadius: 2,
  marginTop: 4,
  opacity: 0.8,
}}
        />
      )}
      {/* Drag ghost element */}
      {dragState.isDragging && dragState.draggedIndex !== null && ()
        <div
          style={{
  position: 'fixed',
  top: dragState.ghostPosition.y,
  left: dragState.ghostPosition.x,
  pointerEvents: 'none',
  zIndex: 1000,
  transform: 'rotate(5deg)',
  opacity: 0.9,
}}
        >
          <div
            style={{
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  background: '#2d3748',
  border: '2px solid #4299e1',
  borderRadius: 6,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  color: '#e2e8f0',
  fontSize: 14,
  minWidth: 200,
}}
          >
            <div
              style={{
  width: 12,
  height: 12,
  borderRadius: 2,
  backgroundColor: getOptionColor(dragState.draggedIndex),
  marginRight: 8,
}}
            />
            {options[dragState.draggedIndex].text}
            {showWeights && ()
              <span style={{ marginLeft: 'auto', color: '#a0aec0', fontSize: 12 }}>
                {options[dragState.draggedIndex].weight}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DragReorderList;