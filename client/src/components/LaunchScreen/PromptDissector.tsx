import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react';
import {
  simplePromptParser,
  PromptAnalysis,
  GeneratedNode,
  NodeMapping,
  AnalysisEdge,
  buildSequentialEdges
} from '../../lib/simplePromptParser';
import { reconcileAnalysis } from '../../lib/analysisReconciler';
import {
  ApiLLMClient,
  TextRefinementService,
  type RefinementMode
} from '@promptscape/core/services/llm';
import { useRuntimeMode } from '@promptscape/core/hooks/useRuntimeMode';
import './PromptDissector.css';
import { TextSelectionModal, TextSelection } from './TextSelectionModal';
import GrokParsingLoader from './GrokParsingLoader';

interface PromptDissectorProps {
  value: string;
  onChange: (value: string) => void;
  onAnalysisComplete: (analysis: PromptAnalysis) => void;
  onAnalysisStart?: () => void;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  placeholder?: string;
  focusOnValueChange?: boolean;
}

interface CaretPosition {
  index: number;
  x: number;
  y: number;
  height: number;
}

interface SelectionRange {
  start: number;
  end: number;
  collapsed: boolean;
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
  '#B19CD9' // Purple
];

type SweeteningStyle = {
  id: string;
  label: string;
  description: string;
  mode: RefinementMode;
  prompt: string;
};

const SWEETENING_STYLES: SweeteningStyle[] = [
  {
    id: 'clarify',
    label: 'Clarify',
    description: 'Tighten meaning and remove ambiguity',
    mode: 'correct',
    prompt: 'clear, structured, and easy to parse'
  },
  {
    id: 'vivid',
    label: 'Vivid',
    description: 'Add visual flavor without bloating the prompt',
    mode: 'expand',
    prompt: 'vivid, visual, and cinematic while staying concise'
  },
  {
    id: 'tighten',
    label: 'Tighten',
    description: 'Trim filler and keep the useful signal',
    mode: 'contract',
    prompt: 'concise, direct, and free of filler'
  }
];

type DraftGraphResponse = {
  ok?: boolean;
  summary?: string;
  operations?: Array<{
    kind?: string;
    nodes?: Array<Record<string, unknown>>;
    edges?: Array<Record<string, unknown>>;
  }>;
  notes?: string[];
  model?: string;
  fallback?: boolean;
};

const mapDraftNodeType = (type: unknown): GeneratedNode['node']['nodeType'] => {
  const normalized = typeof type === 'string' ? type.toLowerCase() : '';
  if (normalized.includes('choice')) {
    return 'Choice';
  }
  if (normalized.includes('variable')) {
    return 'Variable';
  }
  if (normalized.includes('output')) {
    return 'Output';
  }
  return 'Text';
};

const analysisFromDraftGraphResponse = (
  prompt: string,
  response: DraftGraphResponse
): PromptAnalysis | null => {
  const draftInsert = Array.isArray(response.operations)
    ? response.operations.find(operation => operation.kind === 'insertNodes')
    : null;

  if (!draftInsert || !Array.isArray(draftInsert.nodes)) {
    return null;
  }

  const baseline = simplePromptParser.parse(prompt);
  const nodes: GeneratedNode[] = draftInsert.nodes.map((node, index) => {
    const nodeId =
      typeof node.id === 'string' ? node.id : `draft-node-${index}`;
    const data =
      typeof node.data === 'object' && node.data !== null
        ? (node.data as Record<string, unknown>)
        : {};
    const previewText =
      typeof data.text === 'string'
        ? data.text
        : typeof data.content === 'string'
          ? data.content
          : typeof data.label === 'string'
            ? data.label
            : 'Node';

    return {
      node: {
        id: nodeId,
        nodeType: mapDraftNodeType(node.type),
        variableName:
          typeof data.variableName === 'string' ? data.variableName : undefined,
        getPreviewText: () => previewText,
        data
      }
    };
  });

  const mappings = baseline.mappings
    .slice(0, Math.max(0, nodes.length - 1))
    .map((mapping, index) => ({
      ...mapping,
      nodeId: nodes[index]?.node.id || mapping.nodeId,
      highlightColor: HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length]
    }));

  const edges: AnalysisEdge[] = Array.isArray(draftInsert.edges)
    ? draftInsert.edges.reduce<AnalysisEdge[]>((acc, edge, index) => {
        const source =
          typeof edge.source === 'string' ? edge.source : undefined;
        const target =
          typeof edge.target === 'string' ? edge.target : undefined;
        if (!source || !target) {
          return acc;
        }

        acc.push({
          id:
            typeof edge.id === 'string'
              ? edge.id
              : `${source}__${target}__${index}`,
          source,
          target,
          sourceHandle:
            typeof edge.sourceHandle === 'string'
              ? edge.sourceHandle
              : undefined,
          targetHandle:
            typeof edge.targetHandle === 'string'
              ? edge.targetHandle
              : undefined
        });
        return acc;
      }, [])
    : baseline.edges;

  return {
    segments: baseline.segments,
    nodes,
    mappings,
    edges,
    rawPrompt: prompt,
    llmMetadata: {
      parserMode: 'llm-enhanced',
      summary: response.summary,
      notes: response.notes || [],
      model: response.model || 'heuristic-segmentation-v1',
      fallback: response.fallback !== false
    }
  };
};

const splitChoiceOptions = (raw: string): string[] => {
  const text = raw.trim();
  if (!text) {
    return ['Option 1'];
  }

  const pipeParts = text
    .split('|')
    .map(part => part.trim())
    .filter(Boolean);
  if (pipeParts.length > 1) {
    return pipeParts;
  }

  const slashParts = text
    .split('/')
    .map(part => part.trim())
    .filter(Boolean);
  if (slashParts.length > 1) {
    return slashParts;
  }

  const orParts = text
    .split(/\s+(?:or|vs)\s+/i)
    .map(part => part.trim())
    .filter(Boolean);
  if (orParts.length > 1) {
    return orParts;
  }

  const commaParts = text
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
  if (commaParts.length > 1) {
    return commaParts;
  }

  return [text];
};

const buildGeneratedNode = (
  nodeId: string,
  nodeTypeValue: string,
  text: string
): GeneratedNode => {
  if (nodeTypeValue === 'choice') {
    const options = splitChoiceOptions(text);
    return {
      node: {
        id: nodeId,
        nodeType: 'Choice',
        getPreviewText: () => options.join(' / '),
        data: {
          options,
          label: options.join(' / '),
          value: JSON.stringify(
            options.map((option, index) => ({
              id: `option-${index + 1}`,
              text: option,
              weight: Math.max(1, Math.round(100 / options.length)),
              hasBranch: false
            })),
            null,
            2
          )
        }
      }
    };
  }

  if (nodeTypeValue === 'variable') {
    return {
      node: {
        id: nodeId,
        nodeType: 'Variable',
        getPreviewText: () => text,
        variableName:
          text.trim().split(/\s+/).join('_').toLowerCase() ||
          `variable_${nodeId.slice(-4)}`,
        data: {
          label: text,
          value: text
        }
      }
    };
  }

  return {
    node: {
      id: nodeId,
      nodeType: 'Text',
      getPreviewText: () => text,
      data: {
        label: text,
        text
      }
    }
  };
};

export const PromptDissector: React.FC<PromptDissectorProps> = ({
  value,
  onChange,
  onAnalysisComplete,
  onAnalysisStart,
  selectedNodeId,
  onSelectNode,
  placeholder = 'Enter your prompt...',
  focusOnValueChange = false
}) => {
  // State declarations (must come before any useMemo that depends on them)
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [highlightSegments, setHighlightSegments] = useState<
    HighlightSegment[]
  >([]);
  const [llmMode, setLlmMode] = useState<'standard' | 'llm-enhanced'>(
    'standard'
  );
  const runtimeMode = useRuntimeMode();
  const [sweeteningStyle, setSweeteningStyle] = useState<string>('clarify');
  const [isSweetening, setIsSweetening] = useState(false);
  const [sweeteningNote, setSweeteningNote] = useState<string | null>(null);
  const parsedResultsRef = useRef<{
    standard: { text: string; analysis: PromptAnalysis } | null;
    'llm-enhanced': { text: string; analysis: PromptAnalysis } | null;
  }>({ standard: null, 'llm-enhanced': null });
  const [isLLMParsing, setIsLLMParsing] = useState(false);
  // Wrap parent callback to avoid setState during render warnings
  const safeOnAnalysisComplete = useCallback(
    (a: PromptAnalysis) => {
      Promise.resolve().then(() => onAnalysisComplete(a));
    },
    [onAnalysisComplete]
  );

  // Debug wrapper for setIsLLMParsing
  const [caretPosition, setCaretPosition] = useState<CaretPosition | null>(
    null
  );
  const caretPositionRef = useRef<CaretPosition | null>(null);
  useEffect(() => {
    caretPositionRef.current = caretPosition;
  }, [caretPosition]);

  // Utility to convert hex color to rgba with alpha - memoized
  const hexToRgba = useCallback((hex: string, alpha = 0.6) => {
    if (!hex) {
      return 'rgba(0,0,0,0)';
    }
    const h = hex.replace('#', '');
    if (h.length !== 6) {
      return 'rgba(0,0,0,0.4)';
    }
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  // Memoize segment styles to avoid recalculation on every render
  const segmentStyles = useMemo(() => {
    return highlightSegments.map((segment, index) => {
      if (!segment.nodeId) {
        return null;
      }
      const color =
        segment.color || HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length];
      const isSelected = !!segment.isSelected;
      return {
        backgroundColor: hexToRgba(color, 0.3),
        borderBottom: isSelected ? `2px solid ${color}` : 'none', // Only underline when selected
        color: '#e1e1e1', // Make text visible!
        borderRadius: 5, // More rounded corners
        padding: '2px 5px', // More padding for better appearance
        margin: '0 1px'
      };
    });
  }, [highlightSegments, hexToRgba]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSegIndex, setSelectedSegIndex] = useState<number | null>(null);
  const [hasBeenAnalyzed, setHasBeenAnalyzed] = useState(false);
  // Removed unused caretRect state
  const preEditTextRef = useRef<string | null>(null);
  const preEditAnalysisRef = useRef<PromptAnalysis | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  // Removed unused measureRef
  const toolbarRef = useRef<HTMLDivElement>(null);
  const parserRef = useRef<typeof simplePromptParser>(simplePromptParser);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  // very lightweight undo/redo stacks for highlight adjustments
  const historyRef = useRef<HighlightSegment[][]>([]);
  const futureRef = useRef<HighlightSegment[][]>([]);

  // Scroll the overlay to bring a given nodeId into view
  const scrollToNodeId = useCallback((node: string | null) => {
    if (!node || !overlayRef.current) {
      return;
    }
    const el = overlayRef.current.querySelector(
      `[data-node-id="${node}"]`
    ) as HTMLElement | null;
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, []);

  // Focus textarea when value changes (e.g., template selected)
  useEffect(() => {
    if (focusOnValueChange && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {
        // ignore if not supported
      }
    }
  }, [value, focusOnValueChange]);

  // Helper function to convert analysis to highlight segments
  const convertAnalysisToSegments = useCallback(
    (analysis: PromptAnalysis, text: string): HighlightSegment[] => {
      const segments: HighlightSegment[] = [];
      let lastEnd = 0;
      const sortedMappings = [...analysis.mappings].sort(
        (a, b) => a.startIndex - b.startIndex
      );

      sortedMappings.forEach((mapping, index) => {
        // Add non-highlighted text before this mapping
        if (mapping.startIndex > lastEnd) {
          segments.push({
            text: text.slice(lastEnd, mapping.startIndex),
            startIndex: lastEnd,
            endIndex: mapping.startIndex
          });
        }

        // Add highlighted segment
        segments.push({
          text: text.slice(mapping.startIndex, mapping.endIndex),
          startIndex: mapping.startIndex,
          endIndex: mapping.endIndex,
          nodeId: mapping.nodeId,
          color:
            mapping.highlightColor ||
            HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length],
          isSelected: false
        });

        lastEnd = mapping.endIndex;
      });

      // Add any remaining text
      if (lastEnd < text.length) {
        segments.push({
          text: text.slice(lastEnd),
          startIndex: lastEnd,
          endIndex: text.length
        });
      }

      return segments;
    },
    []
  );

  // LLM service adapter (browser -> server)
  const llmServiceRef = useRef(new ApiLLMClient({}));
  const textRefinementServiceRef = useRef(
    new TextRefinementService(new ApiLLMClient({}))
  );

  const applyOfflineSweetening = useCallback(
    (text: string, styleId: string) => {
      const normalized = text.replace(/\s+/g, ' ').trim();
      if (!normalized) {
        return text;
      }

      const sentence =
        /[.!?]$/.test(normalized)
          ? normalized
          : `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}.`;

      switch (styleId) {
        case 'tighten':
          return sentence
            .replace(/\b(very|really|quite|just|actually|basically)\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
        case 'vivid':
          if (/cinematic|vivid|dramatic|weathered|towering|glowing/i.test(sentence)) {
            return sentence;
          }
          return sentence.replace(
            /(^[A-Z][^.?!]*)([.?!]?)$/,
            '$1 with vivid visual detail$2'
          );
        case 'clarify':
        default:
          return sentence
            .replace(/\s*,\s*/g, ', ')
            .replace(/\s+/g, ' ')
            .trim();
      }
    },
    []
  );

  const handleSweetenPrompt = useCallback(async () => {
    const source = value.trim();
    if (!source || isSweetening) {
      return;
    }

    const style =
      SWEETENING_STYLES.find(candidate => candidate.id === sweeteningStyle) ||
      SWEETENING_STYLES[0];

    setIsSweetening(true);
    setSweeteningNote(null);

    try {
      let refinedText = source;
      let usedCloud = false;

      if (runtimeMode.llm.accessMode === 'cloud') {
        const result = await textRefinementServiceRef.current.refine(
          source,
          style.mode,
          style.prompt
        );
        if (result.refined && result.refined.trim() !== source) {
          refinedText = result.refined.trim();
          usedCloud = true;
        }
      }

      if (!usedCloud) {
        refinedText = applyOfflineSweetening(source, style.id);
      }

      onChange(refinedText);
      setSweeteningNote(
        usedCloud
          ? `Sweetened with hosted AI: ${style.label}`
          : `Sweetened locally: ${style.label}`
      );
    } catch (error) {
      console.error('[PromptDissector] Sweetening failed:', error);
      const fallback = applyOfflineSweetening(source, style.id);
      onChange(fallback);
      setSweeteningNote(`Sweetened locally: ${style.label}`);
    } finally {
      setIsSweetening(false);
    }
  }, [
    applyOfflineSweetening,
    isSweetening,
    onChange,
    runtimeMode.llm.accessMode,
    sweeteningStyle,
    value
  ]);

  // Modular parsing function that can be reused
  const performParse = useCallback(
    async (
      text: string,
      mode: 'standard' | 'llm-enhanced',
      showLoading: boolean = true
    ) => {
      const startTime = performance.now();
      const charCount = text.length;

      const runStandardParse = (): PromptAnalysis => {
        const parsed = parserRef.current.parse(text);
        const normalizedEdges = Array.isArray(parsed.edges) ? parsed.edges : [];
        const metadata: Record<string, unknown> = {
          ...(parsed.llmMetadata ?? {}),
          parserMode: mode === 'llm-enhanced' ? 'llm-baseline' : 'standard'
        };
        const enriched: PromptAnalysis = {
          ...parsed,
          edges: normalizedEdges,
          llmMetadata: metadata,
          rawPrompt: parsed.rawPrompt ?? text
        };
        parsedResultsRef.current.standard = { text, analysis: enriched };
        return enriched;
      };

      if (mode === 'standard') {
        const standardAnalysis = runStandardParse();
        parsedResultsRef.current.standard = {
          text,
          analysis: standardAnalysis
        };
        const duration = performance.now() - startTime;
        if (charCount > 2000 && duration > 500) {
          console.warn(
            `[PromptDissector] Performance warning: ${charCount} chars took ${duration.toFixed(2)}ms (target: <500ms for 2-3k chars)`
          );
        }
        return standardAnalysis;
      }

      const baselineAnalysis = runStandardParse();
      let finalAnalysis = baselineAnalysis;

      if (showLoading) {
        setIsLLMParsing(true);
      }

      try {
        const rawResult = (await llmServiceRef.current.draftGraphFromPrompt({
          prompt: text,
          mode: 'draft'
        })) as DraftGraphResponse;
        const draftAnalysis = analysisFromDraftGraphResponse(text, rawResult);
        if (draftAnalysis) {
          finalAnalysis = draftAnalysis;
        } else {
          finalAnalysis = {
            ...baselineAnalysis,
            llmMetadata: {
              ...(baselineAnalysis.llmMetadata ?? {}),
              parserMode: 'llm-enhanced',
              fallbackReason: 'empty-llm-result'
            }
          };
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : String(err ?? 'Unknown error');
        console.warn(
          '[PromptDissector] LLM parse failed, falling back to baseline:',
          message
        );
        finalAnalysis = {
          ...baselineAnalysis,
          llmMetadata: {
            ...(baselineAnalysis.llmMetadata ?? {}),
            parserMode: 'llm-enhanced',
            fallbackReason: message
          }
        };
      } finally {
        if (showLoading) {
          setIsLLMParsing(false);
        }
      }

      parsedResultsRef.current['llm-enhanced'] = {
        text,
        analysis: finalAnalysis
      };

      const duration = performance.now() - startTime;

      if (charCount > 2000 && duration > 500) {
        console.warn(
          `[PromptDissector] Performance warning: ${charCount} chars took ${duration.toFixed(2)}ms (target: <500ms for 2-3k chars)`
        );
      }

      return finalAnalysis;
    },
    []
  );

  // Parse the prompt with debouncing
  useEffect(() => {
    if (isEditMode) {
      // Do not auto-parse while in full Edit Mode
      return;
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!value || value.trim().length === 0) {
      setAnalysis(null);
      setHighlightSegments([]);
      setHasBeenAnalyzed(false);
      return;
    }

    // Only auto-parse if already been analyzed before (after OK clicked or after edit mode)
    if (!hasBeenAnalyzed) {
      return;
    }

    // Check if we already have results for this mode and text
    const existingResult = parsedResultsRef.current[llmMode];
    const shouldParse = !existingResult || existingResult.text !== value;

    if (!shouldParse) {
      console.log(
        '[Parse Skip] Already have results for',
        llmMode,
        'mode with this text'
      );
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        console.log('[PromptDissector] parsing', {
          textLength: value.length,
          mode: llmMode
        });

        onAnalysisStart?.();

        // Use our modular parsing function
        const newAnalysis = await performParse(value, llmMode);

        setAnalysis(newAnalysis);
        setHasBeenAnalyzed(true);
        safeOnAnalysisComplete(newAnalysis);

        // Convert analysis to highlight segments
        const segments: HighlightSegment[] = [];
        let lastEnd = 0;

        // Sort mappings by start index
        const sortedMappings = [...newAnalysis.mappings].sort(
          (a, b) => a.startIndex - b.startIndex
        );

        sortedMappings.forEach((mapping, index) => {
          // Add non-highlighted text before this mapping
          if (mapping.startIndex > lastEnd) {
            segments.push({
              text: value.slice(lastEnd, mapping.startIndex),
              startIndex: lastEnd,
              endIndex: mapping.startIndex
            });
          }

          // Add highlighted segment
          segments.push({
            text: value.slice(mapping.startIndex, mapping.endIndex),
            startIndex: mapping.startIndex,
            endIndex: mapping.endIndex,
            nodeId: mapping.nodeId,
            color:
              mapping.highlightColor ||
              HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length],
            isSelected: false
          });

          lastEnd = mapping.endIndex;
        });

        // Add any remaining text
        if (lastEnd < value.length) {
          segments.push({
            text: value.slice(lastEnd),
            startIndex: lastEnd,
            endIndex: value.length
          });
        }

        // Auto-select the first mapped segment to enable toolbar controls
        const firstMappedIndex = segments.findIndex(s => !!s.nodeId);
        if (firstMappedIndex >= 0) {
          segments[firstMappedIndex] = {
            ...segments[firstMappedIndex],
            isSelected: true
          };
        }
        setHighlightSegments(segments);
        setSelectedSegIndex(firstMappedIndex >= 0 ? firstMappedIndex : null);
        historyRef.current = []; // reset undo history on fresh parse
        futureRef.current = [];
        setCanUndo(false);
        setCanRedo(false);
      } catch (error) {
        console.error('Error parsing prompt:', error);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    value,
    isEditMode,
    hasBeenAnalyzed,
    llmMode,
    performParse,
    safeOnAnalysisComplete,
    onAnalysisStart
  ]);

  // Handle text change - already optimized with useCallback
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  // Track selection in textarea - optimized with useCallback
  const handleSelect = useCallback(() => {
    const el = textareaRef.current;
    if (!el) {
      return;
    }
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (start === end) {
      setSelection(null);
    } else {
      const s: TextSelection = { start, end, text: value.slice(start, end) };
      setSelection(s);
    }
  }, [value]);

  // Handle segment hover - optimized with useCallback
  const handleSegmentHover = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId);
  }, []);

  // Locally select a segment - optimized with useCallback
  const handleSegmentClickLocal = useCallback(
    (nodeId: string | null, segIndex: number, event?: React.MouseEvent) => {
      if (!nodeId) {
        return;
      }

      // Check if Ctrl/Cmd key is held for multi-selection
      const isMultiSelect = event && (event.ctrlKey || event.metaKey);

      setHighlightSegments(prev =>
        prev.map((s, i) => {
          if (!s.nodeId) {
            return s;
          }
          if (isMultiSelect) {
            // Toggle selection for clicked segment, keep others
            return i === segIndex ? { ...s, isSelected: !s.isSelected } : s;
          } else {
            // Single selection - clear others
            return { ...s, isSelected: i === segIndex };
          }
        })
      );
      setSelectedSegIndex(segIndex);
      setHoveredNodeId(nodeId);
      onSelectNode?.(nodeId);
      scrollToNodeId(nodeId);
    },
    [onSelectNode, scrollToNodeId]
  );

  // Removed unused updateCaret function

  // Keep selection styling in sync with selectedNodeId from parent
  useEffect(() => {
    if (selectedNodeId === null || selectedNodeId === undefined) {
      return;
    }
    const idx = highlightSegments.findIndex(s => s.nodeId === selectedNodeId);
    if (idx >= 0) {
      setSelectedSegIndex(idx);
      setHighlightSegments(prev =>
        prev.map((seg, i) =>
          seg.nodeId ? { ...seg, isSelected: i === idx } : seg
        )
      );
      scrollToNodeId(selectedNodeId);
    }
  }, [highlightSegments, scrollToNodeId, selectedNodeId]);

  // Note: segment range drag has been temporarily disabled in favor of simpler selection-based combine/merge.

  // Delete a mapped segment and turn its text into plain content, merging neighbors
  const handleDeleteSegment = useCallback(
    (segIndex: number) => {
      setHighlightSegments(prev => {
        const current = [...prev];
        const target = current[segIndex];
        if (!target || !target.nodeId) {
          return prev;
        }

        // push history for undo
        historyRef.current.push(prev);
        futureRef.current = [];
        setCanUndo(true);
        setCanRedo(false);

        // Build new plain segment from target, optionally merging with adjacent plain segments
        let insertIndex = segIndex;
        let removeCount = 1;
        let newStart = target.startIndex;
        let newEnd = target.endIndex;

        // merge left if plain
        if (segIndex - 1 >= 0 && !current[segIndex - 1].nodeId) {
          const left = current[segIndex - 1];
          newStart = left.startIndex;
          insertIndex = segIndex - 1;
          removeCount += 1;
        }
        // merge right if plain (note: account for left removal when checking index)
        if (segIndex + 1 < current.length && !current[segIndex + 1].nodeId) {
          const right = current[segIndex + 1];
          newEnd = right.endIndex;
          removeCount += 1;
        }

        const plainSegment: HighlightSegment = {
          text: value.slice(newStart, newEnd),
          startIndex: newStart,
          endIndex: newEnd
        };

        // Splice in the merged plain segment
        current.splice(insertIndex, removeCount, plainSegment);
        // update selection to the resulting plain segment
        setSelectedSegIndex(insertIndex);

        // Update analysis: remove mapping and node for this segment
        if (analysis) {
          const removedNodeId = target.nodeId;
          setAnalysis(prevAnalysis => {
            if (!prevAnalysis) {
              return prevAnalysis;
            }

            const filteredMappings = prevAnalysis.mappings.filter(
              m => m.nodeId !== removedNodeId
            );
            const filteredNodes = prevAnalysis.nodes.filter(
              n => n.node.id !== removedNodeId
            );

            // Reorder nodes by mapping start index (keep Output last)
            const mappingStarts = new Map<string, number>();
            for (const m of filteredMappings) {
              mappingStarts.set(m.nodeId, m.startIndex);
            }
            const nonOutput = filteredNodes.filter(
              n => n.node.nodeType !== 'Output'
            );
            nonOutput.sort((a, b) => {
              const aPos =
                mappingStarts.get(a.node.id) ?? Number.MAX_SAFE_INTEGER;
              const bPos =
                mappingStarts.get(b.node.id) ?? Number.MAX_SAFE_INTEGER;
              return aPos - bPos;
            });
            const outputNode = filteredNodes.find(
              n => n.node.nodeType === 'Output'
            );
            const orderedNodes = outputNode
              ? [...nonOutput, outputNode]
              : nonOutput;
            const edges = buildSequentialEdges(orderedNodes);
            const updated: PromptAnalysis = {
              ...prevAnalysis,
              nodes: orderedNodes,
              mappings: filteredMappings,
              edges
            };
            safeOnAnalysisComplete(updated);
            return updated;
          });
        }

        return current;
      });
    },
    [analysis, safeOnAnalysisComplete, value]
  );

  // Merge the currently selected mapped segment with the next mapped segment
  const handleMergeWithNext = useCallback(() => {
    if (selectedSegIndex === null || selectedSegIndex === undefined) {
      return;
    }
    const current = highlightSegments[selectedSegIndex];
    if (!current || !current.nodeId) {
      return;
    }

    // Find the next mapped segment index after the current one
    const nextMappedIndex = highlightSegments.findIndex(
      (s, i) => i > selectedSegIndex && !!s.nodeId
    );
    if (nextMappedIndex < 0) {
      return;
    }
    const nextMapped = highlightSegments[nextMappedIndex];
    if (!nextMapped || !nextMapped.nodeId) {
      return;
    }

    // Prefer selection boundaries if user highlighted across nodes; otherwise merge full next node
    const el = textareaRef.current;
    const selStart = el
      ? (el.selectionStart ?? current.startIndex)
      : current.startIndex;
    const selEnd = el
      ? (el.selectionEnd ?? current.endIndex)
      : current.endIndex;
    const newStart = current.startIndex; // always start from current node start
    // If selection extends into the next node, cap at its end; else default to full next node
    const selectionOverlapsNext =
      selEnd > current.endIndex && selStart <= nextMapped.endIndex;
    const newEnd = selectionOverlapsNext
      ? nextMapped.endIndex
      : nextMapped.endIndex;
    const keepNodeId = current.nodeId;
    const dropNodeId = nextMapped.nodeId;
    const keepColor = current.color;

    // Update highlights: collapse everything from current to nextMapped into one mapped segment
    setHighlightSegments(prev => {
      historyRef.current.push(prev);
      futureRef.current = [];
      setCanUndo(true);
      setCanRedo(false);
      const replacement = {
        text: value.slice(newStart, newEnd),
        startIndex: newStart,
        endIndex: newEnd,
        nodeId: keepNodeId,
        color: keepColor,
        isSelected: true
      } as HighlightSegment;
      const rightRemainderNeeded = nextMapped.endIndex > newEnd;
      const nextParts: HighlightSegment[] = [replacement];
      if (rightRemainderNeeded) {
        nextParts.push({
          text: value.slice(newEnd, nextMapped.endIndex),
          startIndex: newEnd,
          endIndex: nextMapped.endIndex,
          nodeId: dropNodeId,
          color: nextMapped.color
        });
      }
      const next = [
        ...prev.slice(0, selectedSegIndex),
        ...nextParts,
        ...prev.slice(nextMappedIndex + 1)
      ];
      return next;
    });

    // Update analysis: extend keep node mapping; remove drop node mapping and node entry
    setAnalysis(prev => {
      if (!prev) {
        return prev;
      }
      let updatedMappings = prev.mappings.map(m => {
        if (m.nodeId === keepNodeId) {
          return { ...m, startIndex: newStart, endIndex: newEnd };
        }
        if (m.nodeId === dropNodeId) {
          // Preserve right remainder if any
          if (m.endIndex > newEnd) {
            return { ...m, startIndex: newEnd };
          }
          // fully consumed → drop by returning a dummy we filter out
          return { ...m, startIndex: m.startIndex, endIndex: m.startIndex };
        }
        return m;
      });
      // filter invalid mappings
      updatedMappings = updatedMappings.filter(m => m.endIndex > m.startIndex);

      // Keep nodes that still have mappings
      const remainingNodeIds = new Set(updatedMappings.map(m => m.nodeId));
      let updatedNodes = prev.nodes
        .filter(n => remainingNodeIds.has(n.node.id))
        .map(n =>
          n.node.id === keepNodeId
            ? {
                node: {
                  ...n.node,
                  getPreviewText: () => value.slice(newStart, newEnd)
                }
              }
            : n
        );

      // If drop node remains, update its preview text to match trimmed mapping
      const dropRemain = updatedMappings.find(m => m.nodeId === dropNodeId);
      if (dropRemain) {
        const dropText = value.slice(
          dropRemain.startIndex,
          dropRemain.endIndex
        );
        updatedNodes = updatedNodes.map(n =>
          n.node.id === dropNodeId
            ? { node: { ...n.node, getPreviewText: () => dropText } }
            : n
        );
      }
      // Reorder nodes by mapping start (keep Output last)
      const mappingStarts = new Map<string, number>();
      for (const m of updatedMappings) {
        mappingStarts.set(m.nodeId, m.startIndex);
      }
      const nonOutput = updatedNodes.filter(n => n.node.nodeType !== 'Output');
      nonOutput.sort((a, b) => {
        const aPos = mappingStarts.get(a.node.id) ?? Number.MAX_SAFE_INTEGER;
        const bPos = mappingStarts.get(b.node.id) ?? Number.MAX_SAFE_INTEGER;
        return aPos - bPos;
      });
      const outputNode = updatedNodes.find(n => n.node.nodeType === 'Output');
      const orderedNodes = outputNode ? [...nonOutput, outputNode] : nonOutput;
      const edges = buildSequentialEdges(orderedNodes);
      const updated: PromptAnalysis = {
        ...prev,
        nodes: orderedNodes,
        mappings: updatedMappings,
        edges
      };
      safeOnAnalysisComplete(updated);
      return updated;
    });
  }, [highlightSegments, safeOnAnalysisComplete, selectedSegIndex, value]);

  const handleUndo = useCallback(() => {
    const last = historyRef.current.pop();
    if (!last) {
      return;
    }
    futureRef.current.push(highlightSegments);
    setHighlightSegments(last);
    setCanRedo(true);
    setCanUndo(historyRef.current.length > 0);
  }, [highlightSegments]);

  const handleRedo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) {
      return;
    }
    historyRef.current.push(highlightSegments);
    setHighlightSegments(next);
    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);
  }, [highlightSegments]);

  const resolveSelectionRange = useCallback(
    (options: { allowCollapsed?: boolean } = {}): SelectionRange | null => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return null;
      }

      if (selection.isCollapsed && !options.allowCollapsed) {
        return null;
      }

      const resolveIndex = (
        node: Node | null,
        offset: number
      ): number | null => {
        if (!node) {
          return null;
        }
        let element =
          node.nodeType === Node.ELEMENT_NODE
            ? (node as HTMLElement)
            : node.parentElement;

        while (element && !element.dataset?.segmentStart) {
          element = element.parentElement;
        }

        if (!element?.dataset?.segmentStart) {
          return null;
        }

        const startIndex = Number(element.dataset.segmentStart);
        const content = element.textContent ?? '';
        const clamped = Math.min(Math.max(offset, 0), content.length);
        return startIndex + clamped;
      };

      const anchor = resolveIndex(selection.anchorNode, selection.anchorOffset);
      const focus = resolveIndex(selection.focusNode, selection.focusOffset);
      if (anchor === null || anchor === undefined) {
        return null;
      }
      if (focus === null || focus === undefined) {
        return null;
      }
      const start = Math.min(anchor, focus);
      const end = Math.max(anchor, focus);
      if (start === end && !options.allowCollapsed) {
        return null;
      }
      return { start, end, collapsed: start === end };
    },
    []
  );

  const positionCaretFromElement = useCallback(
    (
      element: HTMLElement,
      clientX: number,
      segmentStart: number
    ): number | null => {
      const containerRect = overlayRef.current?.getBoundingClientRect();
      if (!containerRect) {
        return null;
      }

      const textNode = element.firstChild;
      const textContent =
        textNode && textNode.nodeType === Node.TEXT_NODE
          ? (textNode.textContent ?? '')
          : (element.textContent ?? '');

      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        setCaretPosition({
          index: segmentStart,
          x: element.getBoundingClientRect().left - containerRect.left,
          y: element.getBoundingClientRect().top - containerRect.top,
          height: element.getBoundingClientRect().height
        });
        return segmentStart;
      }

      const range = document.createRange();
      const elementRect = element.getBoundingClientRect();
      const clampedX = Math.min(
        Math.max(clientX, elementRect.left),
        elementRect.right
      );

      let bestOffset = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let i = 0; i <= textContent.length; i += 1) {
        range.setStart(textNode, i);
        range.setEnd(textNode, i);
        const rect = range.getBoundingClientRect();
        const distance = Math.abs(rect.left - clampedX);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestOffset = i;
        }
        if (rect.left >= clampedX) {
          break;
        }
      }

      range.setStart(textNode, bestOffset);
      range.setEnd(textNode, bestOffset);
      const caretRect = range.getBoundingClientRect();
      const absoluteIndex = segmentStart + bestOffset;

      setCaretPosition({
        index: absoluteIndex,
        x: caretRect.left - containerRect.left,
        y: caretRect.top - containerRect.top,
        height: caretRect.height || elementRect.height
      });

      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(absoluteIndex, absoluteIndex);
      }

      return absoluteIndex;
    },
    []
  );

  useEffect(() => {
    if (isEditMode || llmMode !== 'llm-enhanced') {
      return;
    }

    const handleSelectionChange = () => {
      const container = overlayRef.current;
      if (!container) {
        return;
      }

      const selectionRange = resolveSelectionRange({ allowCollapsed: true });
      if (!selectionRange) {
        return;
      }

      if (!selectionRange.collapsed) {
        setCaretPosition(null);
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const fallbackHeight =
        container
          .querySelector<HTMLElement>('[data-segment-start]')
          ?.getBoundingClientRect().height ??
        caretPositionRef.current?.height ??
        18;

      setCaretPosition({
        index: selectionRange.start,
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        height: rect.height && rect.height > 0 ? rect.height : fallbackHeight
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isEditMode, llmMode, resolveSelectionRange]);

  // Split at cursor for plain segments only (safe minimal impl)
  const handleSplitAtCursor = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('[PromptDissector] handleSplitAtCursor called');

    // Prefer explicit caret position, fall back to textarea or selection range
    let cursor: number | null = caretPosition?.index ?? null;
    if ((cursor === null || cursor === undefined) && textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      if (start !== null && start !== undefined) {
        cursor = start;
        console.log('[Split Debug] Using textarea cursor:', cursor);
      }
    }
    if (cursor === null || cursor === undefined) {
      const range = resolveSelectionRange();
      if (range) {
        cursor = range.start;
        console.log('[Split Debug] Using selection start:', cursor);
      }
    }
    if (cursor === null || cursor === undefined) {
      console.log(
        '[Split Debug] No cursor position available. CaretPos:',
        caretPosition,
        'TextareaRef:',
        textareaRef.current
      );
      return;
    }

    console.log(
      '[Split Debug] Cursor position:',
      cursor,
      'Value length:',
      value.length
    );
    if (cursor <= 0 || cursor >= value.length) {
      console.log('[Split Debug] Cursor out of range');
      return;
    }

    setHighlightSegments(prev => {
      console.log(
        '[Split Debug] Looking for segment containing cursor:',
        cursor
      );
      console.log(
        '[Split Debug] Segments:',
        prev.map(s => ({
          text: s.text.substring(0, 20) + '...',
          start: s.startIndex,
          end: s.endIndex,
          hasNode: !!s.nodeId
        }))
      );

      const idx = prev.findIndex(
        seg => cursor > seg.startIndex && cursor < seg.endIndex
      );
      console.log('[Split Debug] Found segment at index:', idx);
      if (idx < 0) {
        return prev;
      }
      const target = prev[idx];

      historyRef.current.push(prev);
      futureRef.current = [];
      setCanUndo(true);
      setCanRedo(false);

      // If the target is a mapped segment, split into two mapped segments
      if (target.nodeId) {
        const newRightNodeId = `node-${Math.random().toString(36).slice(2, 9)}`;
        const leftText = value.slice(target.startIndex, cursor);
        const rightText = value.slice(cursor, target.endIndex);
        const left = {
          ...target,
          endIndex: cursor,
          text: leftText
        };
        const right = {
          ...target,
          startIndex: cursor,
          endIndex: target.endIndex,
          text: rightText,
          nodeId: newRightNodeId
        };

        // Update analysis mappings and nodes accordingly
        setAnalysis(prevAnalysis => {
          if (!prevAnalysis) {
            return prevAnalysis;
          }
          const existing = prevAnalysis.nodes.find(
            n => n.node.id === target.nodeId
          );
          const nodeType = existing?.node.nodeType ?? 'Text';
          const updatedMappings = prevAnalysis.mappings.flatMap(m => {
            if (m.nodeId !== target.nodeId) {
              return [m];
            }
            // left piece (trim end to cursor)
            const leftMap = { ...m, endIndex: cursor };
            // right piece (new node id)
            const rightMap = {
              nodeId: newRightNodeId,
              startIndex: cursor,
              endIndex: target.endIndex,
              highlightColor: m.highlightColor ?? target.color
            };
            return [leftMap, rightMap];
          });

          // Update left node's preview text and add a new right node
          const updatedNodes = [
            ...prevAnalysis.nodes.map(n =>
              n.node.id === target.nodeId
                ? { node: { ...n.node, getPreviewText: () => leftText } }
                : n
            ),
            {
              node: {
                id: newRightNodeId,
                nodeType,
                getPreviewText: () => rightText
              }
            }
          ];

          // Reorder nodes by mapping start index (keep Output last)
          const mappingStarts = new Map<string, number>();
          for (const m of updatedMappings) {
            mappingStarts.set(m.nodeId, m.startIndex);
          }
          const nonOutputNodes = updatedNodes.filter(
            n => n.node.nodeType !== 'Output'
          );
          nonOutputNodes.sort((a, b) => {
            const aPos =
              mappingStarts.get(a.node.id) ?? Number.MAX_SAFE_INTEGER;
            const bPos =
              mappingStarts.get(b.node.id) ?? Number.MAX_SAFE_INTEGER;
            return aPos - bPos;
          });
          const outputNode = updatedNodes.find(
            n => n.node.nodeType === 'Output'
          );
          const orderedNodes = outputNode
            ? [...nonOutputNodes, outputNode]
            : nonOutputNodes;
          const edges = buildSequentialEdges(orderedNodes);
          const updated: PromptAnalysis = {
            ...prevAnalysis,
            nodes: orderedNodes,
            mappings: updatedMappings,
            edges
          };
          safeOnAnalysisComplete(updated);
          return updated;
        });

        const next = [
          ...prev.slice(0, idx),
          left,
          right,
          ...prev.slice(idx + 1)
        ];
        return next;
      }

      // Plain segment split
      const left = {
        ...target,
        endIndex: cursor,
        text: value.slice(target.startIndex, cursor)
      };
      const right = {
        ...target,
        startIndex: cursor,
        text: value.slice(cursor, target.endIndex)
      };
      const next = [...prev.slice(0, idx), left, right, ...prev.slice(idx + 1)];
      return next;
    });
  }, [value, safeOnAnalysisComplete, caretPosition, resolveSelectionRange]);

  // Split selection and create a node mapping via modal
  const handleSplitSelection = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('[PromptDissector] handleSplitSelection');

    // In AI-Enhanced mode, use the selected segment if available
    if (llmMode === 'llm-enhanced' && selectedSegIndex !== null) {
      const segment = highlightSegments[selectedSegIndex];
      if (segment) {
        setSelection({
          start: segment.startIndex,
          end: segment.endIndex,
          text: segment.text
        });
        setIsModalOpen(true);
        return;
      }
    }

    // Prefer DOM selection range from overlay
    const overlayRange = resolveSelectionRange();
    if (overlayRange) {
      setSelection({
        start: overlayRange.start,
        end: overlayRange.end,
        text: value.slice(overlayRange.start, overlayRange.end)
      });
      setIsModalOpen(true);
      return;
    }

    // Fallback to textarea selection (edit mode)
    const el = textareaRef.current;
    if (!el) {
      return;
    }
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (start === end) {
      return;
    }
    setSelection({ start, end, text: value.slice(start, end) });
    setIsModalOpen(true);
  }, [
    value,
    llmMode,
    selectedSegIndex,
    highlightSegments,
    resolveSelectionRange
  ]);

  const handleCreateNodeFromSelection = useCallback(
    (nodeTypeValue: string, color: string) => {
      if (!selection) {
        return;
      }

      // Create a new node and mapping
      const nodeId = `node-${Math.random().toString(36).slice(2, 9)}`;
      const start = selection.start;
      const end = selection.end;

      // Determine if selection is within a single mapped segment right now (for tri-split)
      const currentAnalysis = analysis;
      const containing = currentAnalysis?.mappings.find(
        m => m.startIndex <= start && end <= m.endIndex
      );
      const containingNode = containing
        ? currentAnalysis?.nodes.find(n => n.node.id === containing.nodeId)
        : undefined;
      const originalNodeId = containing?.nodeId;
      const originalType = containingNode?.node.nodeType;
      const originalColor = containing?.highlightColor;
      const rightNodeId = originalNodeId
        ? `node-${Math.random().toString(36).slice(2, 9)}`
        : undefined;

      // Update analysis
      setAnalysis(prev => {
        if (!prev) {
          const nodes = [
            buildGeneratedNode(nodeId, nodeTypeValue, selection.text)
          ];
          const mappings: NodeMapping[] = [
            {
              nodeId,
              startIndex: start,
              endIndex: end,
              highlightColor: color
            }
          ];
          const fresh: PromptAnalysis = {
            segments: [],
            nodes,
            mappings,
            edges: buildSequentialEdges(nodes)
          };
          safeOnAnalysisComplete(fresh);
          return fresh;
        }

        // If the selection is fully inside a single existing mapped segment, perform a tri-split
        if (containing && containingNode && originalNodeId) {
          const leftText = value.slice(containing.startIndex, start);
          const midText = value.slice(start, end);
          const rightText = value.slice(end, containing.endIndex);

          // Build new mappings: left (keep original id), middle (new), right (new id)
          const updatedMappings: NodeMapping[] = prev.mappings.flatMap(m => {
            if (m.nodeId !== originalNodeId) {
              return [m];
            }
            const out: NodeMapping[] = [];
            if (leftText.length > 0) {
              out.push({
                nodeId: originalNodeId,
                startIndex: containing.startIndex,
                endIndex: start,
                highlightColor: originalColor
              });
            }
            out.push({
              nodeId,
              startIndex: start,
              endIndex: end,
              highlightColor: color
            });
            if (rightText.length > 0 && rightNodeId) {
              out.push({
                nodeId: rightNodeId,
                startIndex: end,
                endIndex: containing.endIndex,
                highlightColor: originalColor
              });
            }
            return out;
          });

          // Update nodes: update original preview to leftText, add middle, add right (if any)
          const updatedNodesBase = prev.nodes.map(n =>
            n.node.id === originalNodeId
              ? { node: { ...n.node, getPreviewText: () => leftText } }
              : n
          );
          const middleNode = buildGeneratedNode(nodeId, nodeTypeValue, midText);
          const rightNode: GeneratedNode | null =
            rightText.length > 0 && rightNodeId
              ? {
                  node: {
                    id: rightNodeId,
                    nodeType: originalType ?? 'Text',
                    getPreviewText: () => rightText
                  }
                }
              : null;
          const updatedNodes: GeneratedNode[] = rightNode
            ? [...updatedNodesBase, middleNode, rightNode]
            : [...updatedNodesBase, middleNode];

          // Reorder by mapping start index, keep Output last
          const mappingStarts2 = new Map<string, number>();
          for (const m of updatedMappings) {
            mappingStarts2.set(m.nodeId, m.startIndex);
          }
          const nonOutput2: GeneratedNode[] = updatedNodes.filter(
            n => n.node.nodeType !== 'Output'
          );
          nonOutput2.sort((a, b) => {
            const aPos =
              mappingStarts2.get(a.node.id) ?? Number.MAX_SAFE_INTEGER;
            const bPos =
              mappingStarts2.get(b.node.id) ?? Number.MAX_SAFE_INTEGER;
            return aPos - bPos;
          });
          const output2 = updatedNodes.find(n => n.node.nodeType === 'Output');
          const ordered2: GeneratedNode[] = output2
            ? [...nonOutput2, output2]
            : nonOutput2;
          const edges = buildSequentialEdges(ordered2);
          const updatedTri: PromptAnalysis = {
            ...prev,
            nodes: ordered2,
            mappings: updatedMappings,
            edges
          };
          safeOnAnalysisComplete(updatedTri);
          return updatedTri;
        }

        // Fallback: append selection as a new mapping/node and then order inline
        const appendedNodes = [
          ...prev.nodes,
          buildGeneratedNode(nodeId, nodeTypeValue, selection.text)
        ];
        const appendedMappings = [
          ...prev.mappings,
          { nodeId, startIndex: start, endIndex: end, highlightColor: color }
        ];
        const mappingStarts = new Map<string, number>();
        for (const m of appendedMappings) {
          mappingStarts.set(m.nodeId, m.startIndex);
        }
        const nonOutputNodes = appendedNodes.filter(
          n => n.node.nodeType !== 'Output'
        );
        nonOutputNodes.sort((a, b) => {
          const aPos = mappingStarts.get(a.node.id) ?? Number.MAX_SAFE_INTEGER;
          const bPos = mappingStarts.get(b.node.id) ?? Number.MAX_SAFE_INTEGER;
          return aPos - bPos;
        });
        const outputNode = appendedNodes.find(
          n => n.node.nodeType === 'Output'
        );
        const orderedNodes = outputNode
          ? [...nonOutputNodes, outputNode]
          : nonOutputNodes;
        const edges = buildSequentialEdges(orderedNodes);
        const updated: PromptAnalysis = {
          ...prev,
          nodes: orderedNodes,
          mappings: appendedMappings,
          edges
        };
        safeOnAnalysisComplete(updated);
        return updated;
      });

      // Update visual segments by slicing around the selection
      setHighlightSegments(prev => {
        const next: HighlightSegment[] = [];
        let inserted = false;
        // Use the same original and right node ids as analysis update to keep IDs consistent
        const originalIdForVisual = originalNodeId;
        const rightIdForVisual = rightNodeId;
        for (const seg of prev) {
          // No overlap
          if (seg.endIndex <= start || seg.startIndex >= end) {
            next.push(seg);
            continue;
          }

          // Overlap exists
          // Left remainder before selection
          if (seg.startIndex < start) {
            next.push({
              ...seg,
              endIndex: start,
              text: value.slice(seg.startIndex, start)
            });
          }

          // Insert the mapped segment once
          if (!inserted) {
            next.push({
              text: value.slice(start, end),
              startIndex: start,
              endIndex: end,
              nodeId,
              color,
              isSelected: true
            });
            inserted = true;
          }

          // Right remainder after selection
          if (seg.endIndex > end) {
            const reassignedId =
              originalIdForVisual &&
              seg.nodeId === originalIdForVisual &&
              rightIdForVisual
                ? rightIdForVisual
                : seg.nodeId;
            next.push({
              ...seg,
              startIndex: end,
              text: value.slice(end, seg.endIndex),
              nodeId: reassignedId
            });
          }
        }
        historyRef.current.push(prev);
        futureRef.current = [];
        setCanUndo(true);
        setCanRedo(false);
        return next.sort((a, b) => a.startIndex - b.startIndex);
      });

      setIsModalOpen(false);
    },
    [analysis, safeOnAnalysisComplete, selection, value]
  );

  // Combine selection into a single mapped segment, merging across boundaries
  const handleCombineSelection = useCallback(() => {
    let start = 0;
    let end = 0;

    // In AI-Enhanced mode, check if we have multiple selected segments
    if (llmMode === 'llm-enhanced') {
      // Find the range of selected segments
      const selectedIndices = highlightSegments
        .map((seg, idx) => (seg.isSelected ? idx : -1))
        .filter(idx => idx >= 0);

      if (selectedIndices.length > 1) {
        const firstIdx = selectedIndices[0];
        const lastIdx = selectedIndices[selectedIndices.length - 1];
        start = highlightSegments[firstIdx].startIndex;
        end = highlightSegments[lastIdx].endIndex;
      } else if (selectedSegIndex !== null) {
        // Single segment selected
        const segment = highlightSegments[selectedSegIndex];
        if (!segment) {
          return;
        }
        start = segment.startIndex;
        end = segment.endIndex;
      } else {
        return; // No selection
      }
    } else {
      // Standard mode - use textarea selection
      const el = textareaRef.current;
      if (!el) {
        return;
      }
      start = el.selectionStart ?? 0;
      end = el.selectionEnd ?? 0;
      if (start === end) {
        return;
      }
    }

    // Determine keepNodeId: prefer mapped segment that contains the start; else first mapped within selection; else new id
    const startMap = analysis?.mappings.find(
      m => m.startIndex <= start && start < m.endIndex
    );
    const anyMappedInSel = analysis?.mappings.find(
      m => !(m.endIndex <= start || m.startIndex >= end)
    );
    const keepNodeId =
      startMap?.nodeId ??
      anyMappedInSel?.nodeId ??
      `node-${Math.random().toString(36).slice(2, 9)}`;
    const keepColor =
      analysis?.mappings.find(m => m.nodeId === keepNodeId)?.highlightColor ||
      HIGHLIGHT_COLORS[0];

    // Update analysis mappings: trim overlaps and set one combined mapping for keepNodeId
    setAnalysis(prev => {
      const prevAnalysis = prev ?? {
        segments: [],
        nodes: [],
        mappings: [],
        edges: []
      };
      const updatedMappings = [] as NodeMapping[];
      let keepNodeExists = !!prevAnalysis.nodes.find(
        n => n.node.id === keepNodeId
      );

      for (const m of prevAnalysis.mappings) {
        // entirely outside selection → keep as is
        if (m.endIndex <= start || m.startIndex >= end) {
          updatedMappings.push(m);
          continue;
        }
        // overlap exists
        if (m.nodeId === keepNodeId) {
          // we'll add a unified mapping later; skip this one
          continue;
        }
        // left remainder
        if (m.startIndex < start) {
          updatedMappings.push({ ...m, endIndex: start });
        }
        // right remainder
        if (m.endIndex > end) {
          updatedMappings.push({ ...m, startIndex: end });
        }
      }

      // Upsert keep node
      const updatedNodes = prevAnalysis.nodes.filter(n => n.node.id !== '');
      if (!keepNodeExists) {
        updatedNodes.push({
          node: {
            id: keepNodeId,
            nodeType: 'Text',
            getPreviewText: () => value.slice(start, end)
          }
        });
        keepNodeExists = true;
      }

      // Add/replace keep mapping for full selection
      updatedMappings.push({
        nodeId: keepNodeId,
        startIndex: start,
        endIndex: end,
        highlightColor: keepColor
      });

      // Reorder nodes by mapping start (keep Output last)
      const mappingStarts = new Map<string, number>();
      for (const m of updatedMappings) {
        mappingStarts.set(m.nodeId, m.startIndex);
      }
      const nonOutput = updatedNodes.filter(n => n.node.nodeType !== 'Output');
      nonOutput.sort((a, b) => {
        const aPos = mappingStarts.get(a.node.id) ?? Number.MAX_SAFE_INTEGER;
        const bPos = mappingStarts.get(b.node.id) ?? Number.MAX_SAFE_INTEGER;
        return aPos - bPos;
      });
      const output = updatedNodes.find(n => n.node.nodeType === 'Output');
      const ordered = output ? [...nonOutput, output] : nonOutput;
      const edges = buildSequentialEdges(ordered);
      const updated: PromptAnalysis = {
        ...prevAnalysis,
        nodes: ordered,
        mappings: updatedMappings,
        edges
      };
      safeOnAnalysisComplete(updated);
      return updated;
    });

    // Update visual segments to reflect combined selection
    setHighlightSegments(prev => {
      historyRef.current.push(prev);
      futureRef.current = [];
      setCanUndo(true);
      setCanRedo(false);
      const next: HighlightSegment[] = [];
      let i = 0;
      while (i < prev.length) {
        const seg = prev[i];
        // no overlap
        if (seg.endIndex <= start || seg.startIndex >= end) {
          next.push(seg);
          i++;
          continue;
        }
        // overlap: push left remainder if any
        if (seg.startIndex < start) {
          next.push({
            ...seg,
            endIndex: start,
            text: value.slice(seg.startIndex, start)
          });
        }
        // consume all overlapping segments
        let consumeEnd = Math.max(end, seg.endIndex);
        let j = i + 1;
        while (j < prev.length && prev[j].startIndex < end) {
          consumeEnd = Math.max(consumeEnd, prev[j].endIndex);
          j++;
        }
        // insert merged mapped segment for selection
        next.push({
          text: value.slice(start, end),
          startIndex: start,
          endIndex: end,
          nodeId: keepNodeId,
          color: keepColor,
          isSelected: true
        });
        // right remainder from the last overlapped segment
        const lastOverlap = prev[j - 1];
        if (lastOverlap && lastOverlap.endIndex > end) {
          next.push({
            ...lastOverlap,
            startIndex: end,
            text: value.slice(end, lastOverlap.endIndex)
          });
        }
        i = j;
      }
      return next.sort((a, b) => a.startIndex - b.startIndex);
    });
  }, [
    analysis,
    safeOnAnalysisComplete,
    value,
    llmMode,
    highlightSegments,
    selectedSegIndex
  ]);

  const handleCancelCreate = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Enter/Exit Edit Mode
  const handleEnterEditMode = useCallback(() => {
    preEditTextRef.current = value;
    preEditAnalysisRef.current = analysis;
    setIsEditMode(true);
  }, [value, analysis]);

  const handleCancelEditMode = useCallback(() => {
    // Restore prior analysis and highlights
    const prevAnalysis = preEditAnalysisRef.current;
    if (prevAnalysis) {
      setAnalysis(prevAnalysis);
      // rebuild highlights from previous mapping to avoid stale indices
      const segments: HighlightSegment[] = [];
      let lastEnd = 0;
      const sortedMappings = [...prevAnalysis.mappings].sort(
        (a, b) => a.startIndex - b.startIndex
      );
      sortedMappings.forEach((m, idx) => {
        if (m.startIndex > lastEnd) {
          segments.push({
            text: value.slice(lastEnd, m.startIndex),
            startIndex: lastEnd,
            endIndex: m.startIndex
          });
        }
        segments.push({
          text: value.slice(m.startIndex, m.endIndex),
          startIndex: m.startIndex,
          endIndex: m.endIndex,
          nodeId: m.nodeId,
          color:
            m.highlightColor || HIGHLIGHT_COLORS[idx % HIGHLIGHT_COLORS.length],
          isSelected: false
        });
        lastEnd = m.endIndex;
      });
      if (lastEnd < value.length) {
        segments.push({
          text: value.slice(lastEnd),
          startIndex: lastEnd,
          endIndex: value.length
        });
      }
      // Auto-select first mapped
      const firstIdx = segments.findIndex(s => !!s.nodeId);
      if (firstIdx >= 0) {
        segments[firstIdx] = { ...segments[firstIdx], isSelected: true };
      }
      setHighlightSegments(segments);
      setSelectedSegIndex(firstIdx >= 0 ? firstIdx : null);
    }
    setIsEditMode(false);
  }, [value]);

  const handleApplyEditMode = useCallback(() => {
    const prevText = preEditTextRef.current ?? '';
    const prevAnalysis = preEditAnalysisRef.current;
    try {
      let updated: PromptAnalysis;
      if (prevAnalysis) {
        updated = reconcileAnalysis(prevAnalysis, prevText, value, {
          similarityThreshold: 0.7
        });
      } else {
        // No prior analysis; parse fresh
        updated = parserRef.current.parse(value);
      }
      setAnalysis(updated);
      setHasBeenAnalyzed(true);
      safeOnAnalysisComplete(updated);
      // rebuild highlights from updated mappings
      const segments: HighlightSegment[] = [];
      let lastEnd = 0;
      const sortedMappings = [...updated.mappings].sort(
        (a, b) => a.startIndex - b.startIndex
      );
      sortedMappings.forEach((m, idx) => {
        if (m.startIndex > lastEnd) {
          segments.push({
            text: value.slice(lastEnd, m.startIndex),
            startIndex: lastEnd,
            endIndex: m.startIndex
          });
        }
        segments.push({
          text: value.slice(m.startIndex, m.endIndex),
          startIndex: m.startIndex,
          endIndex: m.endIndex,
          nodeId: m.nodeId,
          color:
            m.highlightColor || HIGHLIGHT_COLORS[idx % HIGHLIGHT_COLORS.length],
          isSelected: false
        });
        lastEnd = m.endIndex;
      });
      if (lastEnd < value.length) {
        segments.push({
          text: value.slice(lastEnd),
          startIndex: lastEnd,
          endIndex: value.length
        });
      }
      // Auto-select first mapped
      const firstIdx2 = segments.findIndex(s => !!s.nodeId);
      if (firstIdx2 >= 0) {
        segments[firstIdx2] = { ...segments[firstIdx2], isSelected: true };
      }
      setHighlightSegments(segments);
      setSelectedSegIndex(firstIdx2 >= 0 ? firstIdx2 : null);
    } catch (e) {
      console.error('Error reconciling analysis:', e);
      // Optional UX: toast("Parsing incomplete — edit manually?")
    } finally {
      setIsEditMode(false);
    }
  }, [safeOnAnalysisComplete, value]);

  // Keyboard shortcuts for Edit Mode and Caret navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditMode) {
        // Escape key to cancel
        if (e.key === 'Escape') {
          e.preventDefault();
          handleCancelEditMode();
        }
        // Ctrl+Enter or Cmd+Enter to apply changes
        else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          handleApplyEditMode();
        }
      } else if (llmMode === 'llm-enhanced' && caretPosition) {
        // Arrow key navigation for caret in AI-Enhanced mode
        if (e.key === 'ArrowLeft' && caretPosition.index > 0) {
          const newIndex = caretPosition.index - 1;
          // Find the segment containing this index
          const segment = highlightSegments.find(
            s => newIndex >= s.startIndex && newIndex <= s.endIndex
          );
          if (segment) {
            // Calculate new position (simplified - would need actual character measurements)
            setCaretPosition({
              index: newIndex,
              x: caretPosition.x - 10, // Approximate
              y: caretPosition.y,
              height: caretPosition.height
            });
            if (textareaRef.current) {
              textareaRef.current.setSelectionRange(newIndex, newIndex);
            }
          }
        } else if (
          e.key === 'ArrowRight' &&
          caretPosition.index < value.length - 1
        ) {
          const newIndex = caretPosition.index + 1;
          // Find the segment containing this index
          const segment = highlightSegments.find(
            s => newIndex >= s.startIndex && newIndex <= s.endIndex
          );
          if (segment) {
            // Calculate new position (simplified - would need actual character measurements)
            setCaretPosition({
              index: newIndex,
              x: caretPosition.x + 10, // Approximate
              y: caretPosition.y,
              height: caretPosition.height
            });
            if (textareaRef.current) {
              textareaRef.current.setSelectionRange(newIndex, newIndex);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isEditMode,
    handleCancelEditMode,
    handleApplyEditMode,
    llmMode,
    caretPosition,
    value,
    highlightSegments
  ]);

  return (
    <div className="prompt-dissector">
      {/* Persistent toolbar at the top like a word processor */}
      {!isEditMode && (
        <div
          ref={toolbarRef}
          className="dissector-toolbar"
          role="toolbar"
          aria-label="Inline segment tools"
        >
          <span
            data-testid="prompt-runtime-status"
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0
            }}
          >
            {runtimeMode.loading ? 'loading' : 'ready'}
          </span>
          {(() => {
            const firstMappedIndexRender = highlightSegments.findIndex(
              s => !!s.nodeId
            );
            const effectiveIndexRender =
              selectedSegIndex ?? firstMappedIndexRender;
            const hasSelectedMapping =
              effectiveIndexRender >= 0 &&
              !!highlightSegments[effectiveIndexRender]?.nodeId;
            return (
              <>
                <button
                  className="dissector-btn"
                  onClick={handleUndo}
                  title="Undo"
                  disabled={!canUndo}
                >
                  ↶
                </button>
                <button
                  className="dissector-btn"
                  onClick={handleRedo}
                  title="Redo"
                  disabled={!canRedo}
                >
                  ↷
                </button>
                <div className="dissector-toolbar-sep" />
                <button
                  className="dissector-btn"
                  onClick={handleSplitAtCursor}
                  title="Split at Cursor"
                >
                  Split
                </button>
                <button
                  className="dissector-btn"
                  onClick={handleSplitSelection}
                  title="Split Selection"
                >
                  Split Selection
                </button>
                <div className="dissector-toolbar-sep" />
                <button
                  className="dissector-btn"
                  onClick={handleCombineSelection}
                  title="Combine Selection"
                  disabled={!hasSelectedMapping}
                >
                  Combine
                </button>
                <button
                  className="dissector-btn"
                  onClick={handleMergeWithNext}
                  title="Merge with Next"
                  disabled={!hasSelectedMapping}
                >
                  Merge →
                </button>
                <div className="dissector-toolbar-sep" />
                <label
                  className="dissector-select-wrap"
                  title="Choose a prompt sweetening style"
                >
                  <span className="dissector-select-label">Sweeten</span>
                  <select
                    className="dissector-select"
                    value={sweeteningStyle}
                    onChange={e => setSweeteningStyle(e.target.value)}
                    disabled={isSweetening}
                  >
                    {SWEETENING_STYLES.map(style => (
                      <option key={style.id} value={style.id}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </label>
                  <button
                    className="dissector-btn"
                    onClick={() => {
                      void handleSweetenPrompt();
                    }}
                    title={
                      runtimeMode.llm.accessMode === 'cloud'
                      ? 'Sweeten prompt with a hosted authoring helper'
                      : 'Sweeten prompt with local fallback rules'
                    }
                    disabled={!value.trim() || isSweetening}
                  >
                  {isSweetening ? 'Sweetening…' : 'Prompt Sweetening'}
                </button>
                <div className="dissector-toolbar-sep" />
                <button
                  className="dissector-btn"
                  onClick={() => {
                    // If a segment is selected, edit it; otherwise create new
                    if (
                      selectedSegIndex !== null &&
                      highlightSegments[selectedSegIndex]?.nodeId
                    ) {
                      // Edit the selected segment - open modal with current segment info
                      const segment = highlightSegments[selectedSegIndex];
                      const nodeId = segment.nodeId;
                      const node = analysis?.nodes.find(
                        n => n.node.id === nodeId
                      );
                      if (node) {
                        // Set selection to the segment's text for the modal
                        setSelection({
                          start: segment.startIndex,
                          end: segment.endIndex,
                          text: segment.text
                        });
                        setIsModalOpen(true);
                      }
                    } else {
                      // Create a new node from current selection or entire text
                      const el = textareaRef.current;
                      if (!el && !value.trim()) {
                        return;
                      }

                      if (value.trim() && !hasBeenAnalyzed) {
                        // Parse the entire text first
                        const nodeId = `node-${Math.random().toString(36).slice(2, 9)}`;
                        const nodes: GeneratedNode[] = [
                          {
                            node: {
                              id: nodeId,
                              nodeType: 'Text',
                              getPreviewText: () => value
                            }
                          }
                        ];
                        const mappings: NodeMapping[] = [
                          {
                            nodeId,
                            startIndex: 0,
                            endIndex: value.length,
                            highlightColor: HIGHLIGHT_COLORS[0]
                          }
                        ];
                        const newAnalysis: PromptAnalysis = {
                          segments: [],
                          nodes,
                          mappings,
                          edges: buildSequentialEdges(nodes)
                        };
                        setAnalysis(newAnalysis);
                        safeOnAnalysisComplete(newAnalysis);
                        setHasBeenAnalyzed(true);

                        // Build highlight segments
                        setHighlightSegments([
                          {
                            text: value,
                            startIndex: 0,
                            endIndex: value.length,
                            nodeId,
                            color: HIGHLIGHT_COLORS[0],
                            isSelected: false
                          }
                        ]);
                      } else if (el) {
                        const start = el.selectionStart ?? 0;
                        const end = el.selectionEnd ?? 0;
                        if (start !== end) {
                          // Create from selection
                          setSelection({
                            start,
                            end,
                            text: value.slice(start, end)
                          });
                          setIsModalOpen(true);
                        }
                      }
                    }
                  }}
                  title={
                    selectedSegIndex !== null &&
                    highlightSegments[selectedSegIndex]?.nodeId
                      ? 'Edit Selected Node'
                      : 'Create Node'
                  }
                >
                  {selectedSegIndex !== null &&
                  highlightSegments[selectedSegIndex]?.nodeId
                    ? 'Edit Node'
                    : 'Create Node'}
                </button>
                {/* Delete button for selected segment */}
                {selectedSegIndex !== null &&
                  highlightSegments[selectedSegIndex]?.nodeId && (
                    <>
                      <div className="dissector-toolbar-sep" />
                      <button
                        className="dissector-btn"
                        onClick={() => {
                          // eslint-disable-next-line no-alert
                          if (window.confirm('Delete this segment mapping?')) {
                            handleDeleteSegment(selectedSegIndex);
                          }
                        }}
                        title="Delete Selected Segment"
                        style={{ color: '#ff6b6b' }}
                      >
                        Delete
                      </button>
                    </>
                  )}
              </>
            );
          })()}
        </div>
      )}
      {sweeteningNote && (
        <div className="dissector-sweetening-note" aria-live="polite">
          {sweeteningNote}
          {runtimeMode.llm.accessMode !== 'cloud' && (
            <span className="dissector-sweetening-note-muted">
              {' '}
              Hosted sweetening is a secondary cloud helper. Local prompt
              bootstrap still works without it.
            </span>
          )}
        </div>
      )}
      {/* Tab interface integrated with text area */}
      <div className="dissector-tabs-container">
        <div className="dissector-tabs">
          <button
            className={`dissector-tab ${llmMode === 'standard' ? 'active' : ''}`}
            onClick={async () => {
              if (llmMode !== 'standard') {
                setLlmMode('standard');
                // Check if we have results for standard mode with this text
                if (value && hasBeenAnalyzed && !isEditMode) {
                  const existingStandard = parsedResultsRef.current.standard;
                  const shouldReparse =
                    !existingStandard || existingStandard.text !== value;
                  if (shouldReparse) {
                    console.log('[Tab Click] Re-parsing for Standard mode');
                    // Trigger re-parse with standard mode
                    const newAnalysis = await performParse(
                      value,
                      'standard',
                      false
                    );
                    setAnalysis(newAnalysis);
                    safeOnAnalysisComplete(newAnalysis);

                    // Update highlight segments
                    const segments: HighlightSegment[] = [];
                    let lastEnd = 0;
                    const sortedMappings = [...newAnalysis.mappings].sort(
                      (a, b) => a.startIndex - b.startIndex
                    );

                    sortedMappings.forEach((mapping, index) => {
                      if (mapping.startIndex > lastEnd) {
                        segments.push({
                          text: value.slice(lastEnd, mapping.startIndex),
                          startIndex: lastEnd,
                          endIndex: mapping.startIndex
                        });
                      }
                      segments.push({
                        text: value.slice(mapping.startIndex, mapping.endIndex),
                        startIndex: mapping.startIndex,
                        endIndex: mapping.endIndex,
                        nodeId: mapping.nodeId,
                        color:
                          mapping.highlightColor ||
                          HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length],
                        isSelected: false
                      });
                      lastEnd = mapping.endIndex;
                    });

                    if (lastEnd < value.length) {
                      segments.push({
                        text: value.slice(lastEnd),
                        startIndex: lastEnd,
                        endIndex: value.length
                      });
                    }

                    const firstMappedIndex = segments.findIndex(
                      s => !!s.nodeId
                    );
                    if (firstMappedIndex >= 0) {
                      segments[firstMappedIndex] = {
                        ...segments[firstMappedIndex],
                        isSelected: true
                      };
                    }
                    setHighlightSegments(segments);
                    setSelectedSegIndex(
                      firstMappedIndex >= 0 ? firstMappedIndex : null
                    );
                  } else {
                    // Use existing Standard results
                    console.log('[Tab Skip] Using existing Standard results');
                    const existingResult = existingStandard;
                    if (!existingResult) {
                      return;
                    }
                    setAnalysis(existingResult.analysis);
                    safeOnAnalysisComplete(existingResult.analysis);

                    // Convert to segments
                    const segments = convertAnalysisToSegments(
                      existingResult.analysis,
                      value
                    );
                    const firstMappedIndex = segments.findIndex(
                      s => !!s.nodeId
                    );
                    if (firstMappedIndex >= 0) {
                      segments[firstMappedIndex] = {
                        ...segments[firstMappedIndex],
                        isSelected: true
                      };
                    }
                    setHighlightSegments(segments);
                    setSelectedSegIndex(
                      firstMappedIndex >= 0 ? firstMappedIndex : null
                    );
                  }
                }
              }
            }}
          >
            Standard
          </button>
          <button
            className={`dissector-tab ${llmMode === 'llm-enhanced' ? 'active' : ''}`}
            onClick={async () => {
              if (llmMode !== 'llm-enhanced') {
                setLlmMode('llm-enhanced');
                // Check if we have results for llm-enhanced mode with this text
                if (value && hasBeenAnalyzed && !isEditMode) {
                  const existingEnhanced =
                    parsedResultsRef.current['llm-enhanced'];
                  const shouldReparse =
                    !existingEnhanced || existingEnhanced.text !== value;
                  if (shouldReparse) {
                    console.log('[Tab Click] Re-parsing for AI-Enhanced mode');
                    // Trigger re-parse with llm-enhanced mode, show loading since it's a real parse
                    const newAnalysis = await performParse(
                      value,
                      'llm-enhanced',
                      true
                    );
                    setAnalysis(newAnalysis);
                    safeOnAnalysisComplete(newAnalysis);

                    // Update highlight segments
                    const segments: HighlightSegment[] = [];
                    let lastEnd = 0;
                    const sortedMappings = [...newAnalysis.mappings].sort(
                      (a, b) => a.startIndex - b.startIndex
                    );

                    sortedMappings.forEach((mapping, index) => {
                      if (mapping.startIndex > lastEnd) {
                        segments.push({
                          text: value.slice(lastEnd, mapping.startIndex),
                          startIndex: lastEnd,
                          endIndex: mapping.startIndex
                        });
                      }
                      segments.push({
                        text: value.slice(mapping.startIndex, mapping.endIndex),
                        startIndex: mapping.startIndex,
                        endIndex: mapping.endIndex,
                        nodeId: mapping.nodeId,
                        color:
                          mapping.highlightColor ||
                          HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length],
                        isSelected: false
                      });
                      lastEnd = mapping.endIndex;
                    });

                    if (lastEnd < value.length) {
                      segments.push({
                        text: value.slice(lastEnd),
                        startIndex: lastEnd,
                        endIndex: value.length
                      });
                    }

                    const firstMappedIndex = segments.findIndex(
                      s => !!s.nodeId
                    );
                    if (firstMappedIndex >= 0) {
                      segments[firstMappedIndex] = {
                        ...segments[firstMappedIndex],
                        isSelected: true
                      };
                    }
                    setHighlightSegments(segments);
                    setSelectedSegIndex(
                      firstMappedIndex >= 0 ? firstMappedIndex : null
                    );
                  } else {
                    // Use existing AI-Enhanced results
                    console.log(
                      '[Tab Skip] Using existing AI-Enhanced results'
                    );
                    const existingResult = existingEnhanced;
                    if (!existingResult) {
                      return;
                    }
                    setAnalysis(existingResult.analysis);
                    safeOnAnalysisComplete(existingResult.analysis);

                    // Convert to segments
                    const segments = convertAnalysisToSegments(
                      existingResult.analysis,
                      value
                    );
                    const firstMappedIndex = segments.findIndex(
                      s => !!s.nodeId
                    );
                    if (firstMappedIndex >= 0) {
                      segments[firstMappedIndex] = {
                        ...segments[firstMappedIndex],
                        isSelected: true
                      };
                    }
                    setHighlightSegments(segments);
                    setSelectedSegIndex(
                      firstMappedIndex >= 0 ? firstMappedIndex : null
                    );
                  }
                }
              }
            }}
          >
            Agent Draft
          </button>
        </div>
        {/* Input container inside tabs container */}
        <div className="dissector-input-container">
          {/* Show parsing loader when LLM is parsing */}
          {isLLMParsing ? (
            <GrokParsingLoader
              prompt={value}
              message="Analyzing prompt structure..."
            />
          ) : isEditMode || !hasBeenAnalyzed ? (
            <textarea
              ref={textareaRef}
              className={`dissector-textarea-simple ${isEditMode ? 'edit-mode' : 'initial'}`}
              value={value}
              onChange={handleChange}
              onSelect={handleSelect}
              placeholder={placeholder}
              aria-label="Prompt editor"
              spellCheck={false}
            />
          ) : (
            <>
              {/* Hidden textarea for cursor tracking in AI-Enhanced mode */}
              {llmMode === 'llm-enhanced' && (
                <textarea
                  ref={textareaRef}
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '1px',
                    height: '1px'
                  }}
                  value={value}
                  readOnly
                  aria-hidden="true"
                  data-testid="hidden-textarea-for-cursor"
                />
              )}
              <div className="dissector-content-display" ref={overlayRef}>
                {caretPosition && (
                  <span
                    className="dissector-caret"
                    style={{
                      transform: `translate(${caretPosition.x}px, ${caretPosition.y}px)`,
                      height: `${caretPosition.height}px`
                    }}
                  />
                )}
                {highlightSegments.length === 0 && (
                  <div>No segments to display</div>
                )}
                {highlightSegments.map((segment, index) => {
                  const nodeId = segment.nodeId;
                  if (nodeId) {
                    const isHovered = hoveredNodeId === nodeId;
                    const isSelected = Boolean(segment.isSelected);
                    return (
                      <span
                        key={index}
                        className={`segment-inline mapped ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                        data-segment-start={segment.startIndex}
                        data-segment-end={segment.endIndex}
                        onMouseEnter={() => handleSegmentHover(nodeId)}
                        onMouseLeave={() => handleSegmentHover(null)}
                        onClick={e => {
                          positionCaretFromElement(
                            e.currentTarget,
                            e.clientX,
                            segment.startIndex
                          );
                          handleSegmentClickLocal(nodeId, index, e);
                        }}
                        style={{ ...segmentStyles[index], cursor: 'text' }}
                      >
                        {segment.text}
                      </span>
                    );
                  }
                  return (
                    <span
                      key={index}
                      className="segment-inline plain"
                      data-segment-start={segment.startIndex}
                      data-segment-end={segment.endIndex}
                      onClick={e => {
                        positionCaretFromElement(
                          e.currentTarget,
                          e.clientX,
                          segment.startIndex
                        );
                      }}
                      style={{ cursor: 'text' }}
                    >
                      {segment.text}
                    </span>
                  );
                })}
              </div>
            </>
          )}

          {/* Edit mode controls - OK and Cancel buttons in lower right */}
          {isEditMode && (
            <div className="dissector-editbar">
              <button
                className="dissector-btn"
                onClick={handleApplyEditMode}
                title="Apply changes (Ctrl+Enter)"
              >
                OK
              </button>
              <button
                className="dissector-btn"
                onClick={handleCancelEditMode}
                title="Cancel changes (Escape)"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Edit button and hint when not in edit mode */}
          {!isEditMode && hasBeenAnalyzed && (
            <>
              <span className="dissector-edit-hint">
                To edit full prompt text, click Edit
              </span>
              <button
                className="dissector-edit-trigger-btn"
                onClick={handleEnterEditMode}
              >
                Edit
              </button>
            </>
          )}

          {/* OK and Clear buttons when text entered but not analyzed */}
          {!isEditMode && !hasBeenAnalyzed && value.trim() && (
            <div
              className="dissector-editbar"
              style={{ pointerEvents: 'auto', zIndex: 10001 }}
            >
              <button
                className="dissector-btn"
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                onPointerDown={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  console.log('OK button clicked!');
                  // Force immediate parse
                  if (value && value.trim().length > 0) {
                    onAnalysisStart?.();

                    // Use async parsing with modular function
                    (async () => {
                      try {
                        const newAnalysis = await performParse(value, llmMode);

                        setAnalysis(newAnalysis);
                        setHasBeenAnalyzed(true);
                        safeOnAnalysisComplete(newAnalysis);

                        // Build highlight segments from analysis
                        const segments: HighlightSegment[] = [];
                        let lastEnd = 0;
                        const sortedMappings = [...newAnalysis.mappings].sort(
                          (a, b) => a.startIndex - b.startIndex
                        );
                        sortedMappings.forEach((mapping, idx) => {
                          if (mapping.startIndex > lastEnd) {
                            segments.push({
                              text: value.slice(lastEnd, mapping.startIndex),
                              startIndex: lastEnd,
                              endIndex: mapping.startIndex
                            });
                          }
                          segments.push({
                            text: value.slice(
                              mapping.startIndex,
                              mapping.endIndex
                            ),
                            startIndex: mapping.startIndex,
                            endIndex: mapping.endIndex,
                            nodeId: mapping.nodeId,
                            color:
                              mapping.highlightColor ||
                              HIGHLIGHT_COLORS[idx % HIGHLIGHT_COLORS.length],
                            isSelected: false
                          });
                          lastEnd = mapping.endIndex;
                        });
                        if (lastEnd < value.length) {
                          segments.push({
                            text: value.slice(lastEnd),
                            startIndex: lastEnd,
                            endIndex: value.length
                          });
                        }
                        setHighlightSegments(segments);
                      } catch (error) {
                        console.error('[PromptDissector] Parse failed:', error);
                        setIsLLMParsing(false);
                        // Optionally show an error message to the user
                        // eslint-disable-next-line no-alert
                        alert(
                          'Failed to parse prompt. Please try again or use Standard mode.'
                        );
                      }
                    })(); // Close and execute the async function
                  }
                }}
                title="Parse prompt"
              >
                OK
              </button>
              <button
                className="dissector-btn"
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                onPointerDown={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  console.log('Clear button clicked!');
                  onChange('');
                  setAnalysis(null);
                  setHighlightSegments([]);
                  setHasBeenAnalyzed(false);
                }}
                title="Clear text"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>{' '}
      {/* End of tabs container */}
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
      {/* LLM Parsing Indicator */}
      {isLLMParsing && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(75% - 40px)',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10000
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid #e6a23c',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          <span>Agent is drafting your graph...</span>
        </div>
      )}
      {/* Removed Node Types legend as requested */}
      {/* Selection modal for creating nodes from selection */}
      <TextSelectionModal
        isOpen={isModalOpen}
        selection={selection}
        onConfirm={handleCreateNodeFromSelection}
        onCancel={handleCancelCreate}
      />
      {/* Visual caret indicator - moved to top level */}
      {caretPosition && llmMode === 'llm-enhanced' && !isEditMode && (
        <div
          style={{
            position: 'fixed',
            left: `${caretPosition.x + 2}px`,
            top: `${caretPosition.y - 3}px`,
            width: '3px',
            height: '28px',
            backgroundColor: 'rgba(255, 255, 255, 0.45)',
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.25)',
            animation: 'blink 2s step-end infinite',
            pointerEvents: 'none',
            zIndex: 999999
          }}
        />
      )}
    </div>
  );
};
