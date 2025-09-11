import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react';
import { PromptAnalysis } from '../../../lib/simplePromptParser';
import { TextSelectionModal, TextSelection } from '../TextSelectionModal';
import GrokParsingLoader from '../GrokParsingLoader';
import { useParsingEngine } from './hooks/useParsingEngine';
import { useHighlightManager } from './hooks/useHighlightManager';
import { TextEditor, TextEditorRef } from './components/TextEditor';
import { Toolbar } from './components/Toolbar';
import '../PromptDissector.css';

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
}

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
  // Core state
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isTextFocused, setIsTextFocused] = useState(false);
  const [hasBeenAnalyzed, setHasBeenAnalyzed] = useState(false);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [caretPosition, setCaretPosition] = useState<CaretPosition | null>(
    null
  );

  // Refs
  const textEditorRef = useRef<TextEditorRef>(null);
  const preEditTextRef = useRef<string | null>(null);
  const preEditAnalysisRef = useRef<PromptAnalysis | null>(null);

  // Custom hooks
  const { performParse, clearCache, isLLMParsing, llmMode, setLlmMode } =
    useParsingEngine();

  const {
    highlightSegments,
    setHighlightSegments,
    hoveredNodeId,
    handleSegmentHover,
    selectedSegIndex,
    selectSegment,
    convertAnalysisToSegments,
    segmentStyles,
    pushToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHighlightManager();

  // Wrap parent callback to avoid setState during render warnings
  const safeOnAnalysisComplete = useCallback(
    (a: PromptAnalysis) => {
      Promise.resolve().then(() => onAnalysisComplete(a));
    },
    [onAnalysisComplete]
  );

  // Scroll to node when selected externally
  useEffect(() => {
    if (!selectedNodeId || !textEditorRef.current) return;

    const segment = highlightSegments.find(s => s.nodeId === selectedNodeId);
    if (segment) {
      const segIndex = highlightSegments.indexOf(segment);
      selectSegment(segIndex);

      // Scroll to the segment position
      textEditorRef.current.scrollToPosition(segment.startIndex);
    }
  }, [selectedNodeId, highlightSegments, selectSegment]);

  // Parse on text change
  useEffect(() => {
    if (value.trim()) {
      performParse(value, llmMode, newAnalysis => {
        setAnalysis(newAnalysis);
        const newSegments = convertAnalysisToSegments(value, newAnalysis);
        setHighlightSegments(newSegments);
        safeOnAnalysisComplete(newAnalysis);
        setHasBeenAnalyzed(true);
      });
    } else {
      setAnalysis(null);
      setHighlightSegments([]);
      setHasBeenAnalyzed(false);
    }
  }, [
    value,
    llmMode,
    performParse,
    convertAnalysisToSegments,
    setHighlightSegments,
    safeOnAnalysisComplete
  ]);

  // Focus on value change if requested
  useEffect(() => {
    if (focusOnValueChange && value && textEditorRef.current) {
      textEditorRef.current.focus();
    }
  }, [value, focusOnValueChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Handle text change
  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
      clearCache(); // Clear parse cache on text change
    },
    [onChange, clearCache]
  );

  // Track selection in textarea
  const handleSelect = useCallback(() => {
    if (!textEditorRef.current) return;

    const start = textEditorRef.current.getSelectionStart();
    const end = textEditorRef.current.getSelectionEnd();

    if (start !== end) {
      setSelection({ start, end, text: value.slice(start, end) });
    } else {
      setSelection(null);
    }
  }, [value]);

  // Handle segment click
  const handleSegmentClick = useCallback(
    (segment: any, index: number) => {
      selectSegment(index);
      if (segment.nodeId && onSelectNode) {
        onSelectNode(segment.nodeId);
      }
    },
    [selectSegment, onSelectNode]
  );

  // Mode change handler
  const handleModeChange = useCallback(
    (mode: typeof llmMode) => {
      setLlmMode(mode);
      onAnalysisStart?.();
    },
    [setLlmMode, onAnalysisStart]
  );

  // Re-parse handler
  const handleReparse = useCallback(() => {
    clearCache();
    if (value.trim()) {
      performParse(value, llmMode, newAnalysis => {
        setAnalysis(newAnalysis);
        const newSegments = convertAnalysisToSegments(value, newAnalysis);
        pushToHistory(highlightSegments); // Save current state before updating
        setHighlightSegments(newSegments);
        safeOnAnalysisComplete(newAnalysis);
      });
    }
  }, [
    value,
    llmMode,
    performParse,
    convertAnalysisToSegments,
    highlightSegments,
    pushToHistory,
    setHighlightSegments,
    safeOnAnalysisComplete,
    clearCache
  ]);

  // Edit mode toggle
  const toggleEditMode = useCallback(() => {
    if (!isEditMode) {
      // Entering edit mode - save current state
      preEditTextRef.current = value;
      preEditAnalysisRef.current = analysis;
    } else {
      // Exiting edit mode - check if text changed
      if (preEditTextRef.current !== value && value.trim()) {
        // Re-parse if text changed
        handleReparse();
      }
    }
    setIsEditMode(!isEditMode);
  }, [isEditMode, value, analysis, handleReparse]);

  return (
    <div className="prompt-dissector">
      <Toolbar
        llmMode={llmMode}
        onModeChange={handleModeChange}
        isLLMParsing={isLLMParsing}
        hasBeenAnalyzed={hasBeenAnalyzed}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReparse={handleReparse}
        isEditMode={isEditMode}
        onEditModeToggle={toggleEditMode}
      />

      <div className="prompt-dissector-content">
        <TextEditor
          ref={textEditorRef}
          value={value}
          onChange={handleChange}
          onSelect={handleSelect}
          onFocus={() => setIsTextFocused(true)}
          onBlur={() => setIsTextFocused(false)}
          placeholder={placeholder}
          highlightSegments={highlightSegments}
          segmentStyles={segmentStyles}
          onSegmentClick={handleSegmentClick}
          onSegmentHover={handleSegmentHover}
          isEditMode={isEditMode}
        />

        {isLLMParsing && <GrokParsingLoader />}
      </div>

      {selection && (
        <TextSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selection={selection}
          onCreateNode={nodeData => {
            console.log('Create node:', nodeData);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Export original name for backward compatibility
export { PromptDissector as default };
