import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PromptParser, PromptAnalysis } from '../../../../packages/core/runtime/nodes/epic1/PromptParser';
import './PromptDissector.css';

interface PromptDissectorProps {
  value: string;
  onChange: (value: string) => void;
  onAnalysisComplete: (analysis: PromptAnalysis) => void;
  selectedNodeId?: string | null;
  placeholder?: string;
}

interface HighlightSegment {
  text: string;
  startIndex: number;
  endIndex: number;
  nodeId?: string;
  color?: string;
  isSelected?: boolean;
}

const HIGHLIGHT_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#FFB347', // Orange
  '#B19CD9', // Purple
];

export const PromptDissector: React.FC<PromptDissectorProps> = ({
  value,
  onChange,
  onAnalysisComplete,
  selectedNodeId,
  placeholder = 'Enter your prompt...'
}) => {
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [highlightSegments, setHighlightSegments] = useState<HighlightSegment[]>([]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const parserRef = useRef<PromptParser>(new PromptParser());
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Parse the prompt with debouncing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!value || value.trim().length === 0) {
      setAnalysis(null);
      setHighlightSegments([]);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        const newAnalysis = parserRef.current.parse(value);
        setAnalysis(newAnalysis);
        onAnalysisComplete(newAnalysis);
        
        // Convert analysis to highlight segments
        const segments: HighlightSegment[] = [];
        let lastEnd = 0;
        
        // Sort mappings by start index
        const sortedMappings = [...newAnalysis.mappings].sort((a, b) => a.startIndex - b.startIndex);
        
        sortedMappings.forEach((mapping, index) => {
          // Add non-highlighted text before this mapping
          if (mapping.startIndex > lastEnd) {
            segments.push({
              text: value.slice(lastEnd, mapping.startIndex),
              startIndex: lastEnd,
              endIndex: mapping.startIndex,
            });
          }
          
          // Add highlighted segment
          segments.push({
            text: value.slice(mapping.startIndex, mapping.endIndex),
            startIndex: mapping.startIndex,
            endIndex: mapping.endIndex,
            nodeId: mapping.nodeId,
            color: mapping.highlightColor || HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length],
            isSelected: mapping.nodeId === selectedNodeId,
          });
          
          lastEnd = mapping.endIndex;
        });
        
        // Add any remaining text
        if (lastEnd < value.length) {
          segments.push({
            text: value.slice(lastEnd),
            startIndex: lastEnd,
            endIndex: value.length,
          });
        }
        
        setHighlightSegments(segments);
      } catch (error) {
        console.error('Error parsing prompt:', error);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, onAnalysisComplete, selectedNodeId]);

  // Handle text change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  // Handle segment hover
  const handleSegmentHover = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId);
  }, []);

  // Sync scroll between textarea and overlay
  const handleScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  return (
    <div className="prompt-dissector">
      <div className="dissector-input-container">
        {/* Highlight overlay */}
        <div 
          ref={overlayRef}
          className="dissector-overlay"
          aria-hidden="true"
        >
          <div className="dissector-highlights">
            {highlightSegments.map((segment, index) => (
              <span
                key={index}
                className={`highlight-segment ${segment.nodeId ? 'mapped' : ''} ${
                  segment.isSelected ? 'selected' : ''
                } ${hoveredNodeId === segment.nodeId ? 'hovered' : ''}`}
                style={{
                  backgroundColor: segment.color ? `${segment.color}33` : 'transparent',
                  borderBottom: segment.color ? `2px solid ${segment.color}` : 'none',
                }}
                onMouseEnter={() => segment.nodeId && handleSegmentHover(segment.nodeId)}
                onMouseLeave={() => handleSegmentHover(null)}
                data-node-id={segment.nodeId}
              >
                {segment.text}
              </span>
            ))}
          </div>
        </div>

        {/* Actual textarea */}
        <textarea
          ref={textareaRef}
          className="dissector-textarea"
          value={value}
          onChange={handleChange}
          onScroll={handleScroll}
          placeholder={placeholder}
          spellCheck={false}
        />
      </div>

      {/* Analysis stats */}
      {analysis && (
        <div className="dissector-stats">
          <div className="stat-item">
            <span className="stat-label">Segments:</span>
            <span className="stat-value">{analysis.segments.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Nodes:</span>
            <span className="stat-value">{analysis.nodes.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Connections:</span>
            <span className="stat-value">{analysis.mappings.length}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      {analysis && analysis.nodes.length > 0 && (
        <div className="dissector-legend">
          <span className="legend-title">Node Types:</span>
          {Array.from(new Set(analysis.nodes.map(n => n.node.nodeType))).map((type, index) => (
            <span key={type} className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length] }}
              />
              <span className="legend-label">{type}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};