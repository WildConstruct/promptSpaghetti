import React, { useState, useRef, useEffect, useCallback } from 'react';
import './SegmentMarker.css';

interface SegmentMarkerProps {
  segment: {
    text: string;
    startIndex: number;
    endIndex: number;
    nodeId?: string;
    color?: string;
  };
  fullText: string;
  index: number;
  onSegmentUpdate?: (index: number, newStart: number, newEnd: number) => void;
  isSelected?: boolean;
  isHovered?: boolean;
  onHover?: (hovered: boolean) => void;
  onClick?: () => void;
}

export const SegmentMarker: React.FC<SegmentMarkerProps> = ({
  segment,
  fullText,
  index,
  onSegmentUpdate,
  isSelected,
  isHovered,
  onHover,
  onClick,
}) => {
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [localStart, setLocalStart] = useState(segment.startIndex);
  const [localEnd, setLocalEnd] = useState(segment.endIndex);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Update local state when segment changes
  useEffect(() => {
    setLocalStart(segment.startIndex);
    setLocalEnd(segment.endIndex);
  }, [segment.startIndex, segment.endIndex]);

  // Handle drag start for the left handle
  const handleStartDragBegin = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingStart(true);
  }, []);

  // Handle drag start for the right handle
  const handleEndDragBegin = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingEnd(true);
  }, []);

  // Handle mouse move during drag
  useEffect(() => {
    if (!isDraggingStart && !isDraggingEnd) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const parentRect = containerRef.current.parentElement?.getBoundingClientRect();
      if (!parentRect) return;

      // Calculate character position based on mouse position
      const relativeX = e.clientX - parentRect.left;
      const charWidth = parentRect.width / fullText.length; // Approximate character width
      const charIndex = Math.max(0, Math.min(fullText.length, Math.floor(relativeX / charWidth)));

      if (isDraggingStart) {
        // Don't let start go past end
        const newStart = Math.min(charIndex, localEnd - 1);
        setLocalStart(Math.max(0, newStart));
      } else if (isDraggingEnd) {
        // Don't let end go before start
        const newEnd = Math.max(charIndex, localStart + 1);
        setLocalEnd(Math.min(fullText.length, newEnd));
      }
    };

    const handleMouseUp = () => {
      if (isDraggingStart || isDraggingEnd) {
        // Commit the changes
        onSegmentUpdate?.(index, localStart, localEnd);
        setIsDraggingStart(false);
        setIsDraggingEnd(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingStart, isDraggingEnd, localStart, localEnd, fullText.length, index, onSegmentUpdate]);

  const displayText = fullText.slice(localStart, localEnd);

  return (
    <span
      ref={containerRef}
      className={`segment-marker ${segment.nodeId ? 'mapped' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDraggingStart || isDraggingEnd ? 'dragging' : ''}`}
      style={{
        backgroundColor: segment.color ? `${segment.color}66` : 'transparent',
        borderBottom: segment.color ? `3px solid ${segment.color}` : 'none',
        color: '#e1e1e1',
        textShadow: segment.color ? '0 1px 3px rgba(0, 0, 0, 0.8)' : 'none',
        borderRadius: segment.color ? '3px' : '0',
        fontWeight: segment.color ? '600' : 'normal',
        position: 'relative',
      }}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onClick={onClick}
      data-node-id={segment.nodeId}
      data-text={displayText}
    >
      {/* Left resize handle */}
      {segment.nodeId && (
        <span
          className="segment-handle segment-handle-start"
          onMouseDown={handleStartDragBegin}
          title="Drag to adjust start"
        />
      )}
      
      {/* Text content */}
      {displayText || '[empty]'}
      
      {/* Right resize handle */}
      {segment.nodeId && (
        <span
          className="segment-handle segment-handle-end"
          onMouseDown={handleEndDragBegin}
          title="Drag to adjust end"
        />
      )}
    </span>
  );
};