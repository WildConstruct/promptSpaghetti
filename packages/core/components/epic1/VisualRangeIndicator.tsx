import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { PromptAnalysis } from '../../runtime/nodes/epic1/PromptParser';

export interface VisualRangeIndicatorProps {
  promptAnalysis: PromptAnalysis;
  onNodeHover?: (nodeId: string | null) => void;
  onTextHover?: (range: { start: number; end: number } | null) => void;
  hoveredNodeId?: string | null;
  className?: string;
  showConnectionLines?: boolean;
}

interface TextSegment {
  text: string;
  startIndex: number;
  endIndex: number;
  nodeId?: string;
  color?: string;
}

const HIGHLIGHT_COLORS = [
  '#FFE6E6', // Light red
  '#E6F3FF', // Light blue
  '#E6FFE6', // Light green
  '#FFFFE6', // Light yellow
  '#FFE6FF', // Light pink
  '#E6FFFF', // Light cyan
  '#FFF0E6', // Light orange
  '#F0E6FF', // Light purple
];

export const VisualRangeIndicator: React.FC<VisualRangeIndicatorProps> = ({
  promptAnalysis,
  onNodeHover,
  onTextHover,
  hoveredNodeId,
  className = '',
  showConnectionLines = true,
}) => {
  const [hoveredRange, setHoveredRange] = useState<{ start: number; end: number } | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [connectionLines, setConnectionLines] = useState<Array<{ from: DOMRect; to: DOMRect; color: string }>>([]);

  // Convert mappings to text segments
  const textSegments = useMemo(() => {
    const segments: TextSegment[] = [];
    const { originalText, mappings } = promptAnalysis;
    let lastEnd = 0;

    // Sort mappings by start index
    const sortedMappings = [...mappings].sort((a, b) => a.startIndex - b.startIndex);

    sortedMappings.forEach((mapping) => {
      // Add non-mapped text before this mapping
      if (mapping.startIndex > lastEnd) {
        segments.push({
          text: originalText.slice(lastEnd, mapping.startIndex),
          startIndex: lastEnd,
          endIndex: mapping.startIndex,
        });
      }

      // Add mapped text
      segments.push({
        text: originalText.slice(mapping.startIndex, mapping.endIndex),
        startIndex: mapping.startIndex,
        endIndex: mapping.endIndex,
        nodeId: mapping.nodeId,
        color: mapping.highlightColor,
      });

      lastEnd = mapping.endIndex;
    });

    // Add any remaining text
    if (lastEnd < originalText.length) {
      segments.push({
        text: originalText.slice(lastEnd),
        startIndex: lastEnd,
        endIndex: originalText.length,
      });
    }

    return segments;
  }, [promptAnalysis]);

  // Handle text segment hover
  const handleSegmentHover = (segment: TextSegment | null) => {
    if (segment?.nodeId) {
      setHoveredRange({ start: segment.startIndex, end: segment.endIndex });
      onNodeHover?.(segment.nodeId);
      onTextHover?.({ start: segment.startIndex, end: segment.endIndex });
    } else {
      setHoveredRange(null);
      onNodeHover?.(null);
      onTextHover?.(null);
    }
  };

  // Update connection lines when nodes are hovered
  useEffect(() => {
    if (!showConnectionLines || !textContainerRef.current) {
      setConnectionLines([]);
      return;
    }

    const updateConnectionLines = () => {
      const lines: Array<{ from: DOMRect; to: DOMRect; color: string }> = [];

      if (hoveredNodeId) {
        // Find the mapping for the hovered node
        const mapping = promptAnalysis.mappings.find(m => m.nodeId === hoveredNodeId);
        if (mapping) {
          // Find the text element for this mapping
          const textElements = textContainerRef.current.querySelectorAll('[data-node-id]');
          textElements.forEach((element) => {
            if (element.getAttribute('data-node-id') === hoveredNodeId) {
              const textRect = element.getBoundingClientRect();
              
              // Find the node element in the document
              const nodeElement = document.querySelector(`[data-node-id="${hoveredNodeId}"]`);
              if (nodeElement && nodeElement !== element) {
                const nodeRect = nodeElement.getBoundingClientRect();
                lines.push({
                  from: textRect,
                  to: nodeRect,
                  color: mapping.highlightColor || '#999999',
                });
              }
            }
          });
        }
      }

      setConnectionLines(lines);
    };

    // Update lines on hover change
    updateConnectionLines();

    // Update lines on scroll/resize
    const handleUpdate = () => updateConnectionLines();
    window.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [hoveredNodeId, showConnectionLines, promptAnalysis.mappings]);

  // Render text with highlighting
  const renderSegment = (segment: TextSegment, index: number) => {
    const isHovered = hoveredNodeId === segment.nodeId || 
                     (hoveredRange && 
                      segment.startIndex === hoveredRange.start && 
                      segment.endIndex === hoveredRange.end);

    const style: React.CSSProperties = {};
    
    if (segment.nodeId) {
      style.backgroundColor = segment.color || HIGHLIGHT_COLORS[0];
      style.cursor = 'pointer';
      style.borderRadius = '3px';
      style.padding = '2px 4px';
      style.margin = '0 2px';
      style.transition = 'all 0.2s ease';
      
      if (isHovered) {
        style.backgroundColor = adjustColorBrightness(segment.color || HIGHLIGHT_COLORS[0], -20);
        style.transform = 'scale(1.05)';
        style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      }
    }

    return (
      <span
        key={index}
        style={style}
        data-node-id={segment.nodeId}
        data-start={segment.startIndex}
        data-end={segment.endIndex}
        onMouseEnter={() => handleSegmentHover(segment)}
        onMouseLeave={() => handleSegmentHover(null)}
        className={`visual-range-segment ${segment.nodeId ? 'mapped' : 'unmapped'} ${isHovered ? 'hovered' : ''}`}
      >
        {segment.text}
      </span>
    );
  };

  // Render connection lines as SVG
  const renderConnectionLines = () => {
    if (!showConnectionLines || connectionLines.length === 0) {return null;}

    return (
      <svg
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        {connectionLines.map((line, index) => {
          const fromX = line.from.left + line.from.width / 2;
          const fromY = line.from.top + line.from.height / 2;
          const toX = line.to.left + line.to.width / 2;
          const toY = line.to.top + line.to.height / 2;
          if (!Number.isFinite(fromX) || !Number.isFinite(fromY) || !Number.isFinite(toX) || !Number.isFinite(toY)) {
            return null;
          }

          // Calculate control points for curved line
          const dx = toX - fromX;
          const dy = toY - fromY;
          const cx1 = fromX + dx * 0.25;
          const cy1 = fromY - Math.abs(dy) * 0.2;
          const cx2 = toX - dx * 0.25;
          const cy2 = toY - Math.abs(dy) * 0.2;

          return (
            <g key={index}>
              <path
                d={`M ${fromX} ${fromY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toX} ${toY}`}
                stroke={line.color}
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                opacity="0.7"
              />
              <circle cx={fromX} cy={fromY} r={4} fill={line.color} />
              <circle cx={toX} cy={toY} r={4} fill={line.color} />
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <>
      <div
        ref={textContainerRef}
        className={`visual-range-indicator ${className}`}
        style={{
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.6',
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #ddd',
          position: 'relative',
        }}
      >
        <div className="prompt-text">
          {textSegments.map((segment, index) => renderSegment(segment, index))}
        </div>
        
        <div
          className="legend"
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #ddd',
            fontSize: '12px',
            color: '#666',
          }}
        >
          <strong>Visual Mapping:</strong>
          <div style={{ marginTop: '8px' }}>
            {promptAnalysis.nodes.map(genNode => {
              const mapping = promptAnalysis.mappings.find(m => m.nodeId === genNode.node.serialize().id);
              if (!mapping) {return null;}
              
              return (
                <div
                  key={genNode.node.serialize().id}
                  style={{
                    display: 'inline-block',
                    marginRight: '12px',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    style={{
                      backgroundColor: mapping.highlightColor,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      marginRight: '4px',
                    }}
                  >
                    {genNode.node.getNodeType()}
                  </span>
                  <span style={{ fontSize: '11px' }}>
                    [{mapping.startIndex}-{mapping.endIndex}]
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {renderConnectionLines()}
    </>
  );
};

// Helper function to adjust color brightness
function adjustColorBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default VisualRangeIndicator;
