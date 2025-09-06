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
  onChangeNodeType?: (newType: 'Text' | 'Choice' | 'Variable') => void;
  onDelete?: () => void;
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
  onChangeNodeType,
  onDelete,
}) => {
  const FALLBACK_COLORS = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#FFB347','#B19CD9'];
  const hexToRgba = useCallback((hex?: string, alpha = 0.7) => {
    if (!hex) return `rgba(0,0,0,0)`;
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    if (h.length === 6) {
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // fallback
    return `rgba(0,0,0,0.45)`;
  }, []);
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
  const ensureColor = (id?: string, color?: string) => {
    if (color) return color;
    if (!id) return FALLBACK_COLORS[0];
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return FALLBACK_COLORS[h % FALLBACK_COLORS.length];
  };
  const resolvedColor = ensureColor(segment.nodeId, segment.color);

  return (
    <span
      ref={containerRef}
      className={`segment-marker ${segment.nodeId ? 'mapped' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDraggingStart || isDraggingEnd ? 'dragging' : ''}`}
      style={{
        backgroundColor: hexToRgba(resolvedColor, 0.5),
        borderBottom: `4px solid ${resolvedColor}`,
        color: '#f0f3f6',
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
        boxShadow: `0 0 0 1px ${resolvedColor}55`,
        borderRadius: '3px',
        fontWeight: '600',
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

      {/* Inline node type menu when selected or hovered */}
      {(isSelected || isHovered) && segment.nodeId && (
        <span className="segment-inline-menu" onClick={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto', zIndex: 100000 }}>
          <button
            className="segment-inline-btn"
            title="Set to Text"
            onClick={() => onChangeNodeType?.('Text')}
          >T</button>
          <button
            className="segment-inline-btn"
            title="Set to Choice"
            onClick={() => onChangeNodeType?.('Choice')}
          >C</button>
          <button
            className="segment-inline-btn"
            title="Delete segment mapping"
            aria-label="Delete segment"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >✕</button>
        </span>
      )}
    </span>
  );
};