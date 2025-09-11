import { useState, useCallback, useRef, useMemo } from 'react';
import {
  PromptAnalysis,
  GeneratedNode
} from '../../../../lib/simplePromptParser';

export interface HighlightSegment {
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
  '#B19CD9' // Purple
];

export const useHighlightManager = () => {
  const [highlightSegments, setHighlightSegments] = useState<
    HighlightSegment[]
  >([]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedSegIndex, setSelectedSegIndex] = useState<number | null>(null);

  const historyRef = useRef<HighlightSegment[][]>([]);
  const futureRef = useRef<HighlightSegment[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Utility to convert hex color to rgba with alpha
  const hexToRgba = useCallback((hex: string, alpha = 0.6) => {
    if (!hex) return 'rgba(0,0,0,0)';
    const h = hex.replace('#', '');
    if (h.length !== 6) return 'rgba(0,0,0,0.4)';
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  // Compute segment styles
  const segmentStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    highlightSegments.forEach((segment, index) => {
      if (segment.nodeId) {
        const isHovered = segment.nodeId === hoveredNodeId;
        const isSelected = index === selectedSegIndex;
        styles[segment.nodeId] = {
          backgroundColor: hexToRgba(
            segment.color || HIGHLIGHT_COLORS[0],
            isHovered ? 0.8 : isSelected ? 0.7 : 0.4
          ),
          borderBottom: isSelected ? '2px solid currentColor' : 'none',
          transition: 'all 0.2s ease'
        };
      }
    });
    return styles;
  }, [highlightSegments, hoveredNodeId, selectedSegIndex, hexToRgba]);

  // Convert analysis to highlight segments
  const convertAnalysisToSegments = useCallback(
    (text: string, analysis: PromptAnalysis | null): HighlightSegment[] => {
      if (!analysis || !analysis.nodes || analysis.nodes.length === 0) {
        return [{ text, startIndex: 0, endIndex: text.length }];
      }

      const segments: HighlightSegment[] = [];
      const processedRanges = new Set<string>();
      let colorIndex = 0;

      // Sort nodes by position
      const sortedNodes = [...analysis.nodes].sort((a, b) => {
        const aStart = a.sourcePosition?.start ?? 0;
        const bStart = b.sourcePosition?.start ?? 0;
        return aStart - bStart;
      });

      let lastEndIndex = 0;

      sortedNodes.forEach((node: GeneratedNode) => {
        if (!node.sourcePosition) return;

        const { start, end } = node.sourcePosition;
        const rangeKey = `${start}-${end}`;

        // Skip if already processed
        if (processedRanges.has(rangeKey)) return;
        processedRanges.add(rangeKey);

        // Add unhighlighted text before this node
        if (start > lastEndIndex) {
          segments.push({
            text: text.slice(lastEndIndex, start),
            startIndex: lastEndIndex,
            endIndex: start
          });
        }

        // Add highlighted segment for this node
        segments.push({
          text: text.slice(start, end),
          startIndex: start,
          endIndex: end,
          nodeId: node.id,
          color: HIGHLIGHT_COLORS[colorIndex % HIGHLIGHT_COLORS.length]
        });

        colorIndex++;
        lastEndIndex = Math.max(lastEndIndex, end);
      });

      // Add any remaining unhighlighted text
      if (lastEndIndex < text.length) {
        segments.push({
          text: text.slice(lastEndIndex),
          startIndex: lastEndIndex,
          endIndex: text.length
        });
      }

      return segments;
    },
    []
  );

  // History management
  const pushToHistory = useCallback((segments: HighlightSegment[]) => {
    historyRef.current.push([...segments]);
    futureRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;

    const previousSegments = historyRef.current.pop();
    if (previousSegments) {
      futureRef.current.push([...highlightSegments]);
      setHighlightSegments(previousSegments);
      setCanUndo(historyRef.current.length > 0);
      setCanRedo(true);
    }
  }, [highlightSegments]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;

    const nextSegments = futureRef.current.pop();
    if (nextSegments) {
      historyRef.current.push([...highlightSegments]);
      setHighlightSegments(nextSegments);
      setCanRedo(futureRef.current.length > 0);
      setCanUndo(true);
    }
  }, [highlightSegments]);

  // Selection management
  const selectSegment = useCallback((index: number | null) => {
    setSelectedSegIndex(index);
  }, []);

  const handleSegmentHover = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId);
  }, []);

  return {
    highlightSegments,
    setHighlightSegments,
    hoveredNodeId,
    setHoveredNodeId,
    selectedSegIndex,
    selectSegment,
    handleSegmentHover,
    convertAnalysisToSegments,
    segmentStyles,
    hexToRgba,
    pushToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    HIGHLIGHT_COLORS
  };
};
