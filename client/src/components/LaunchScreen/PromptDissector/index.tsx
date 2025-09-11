import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PromptAnalysis } from '../../../lib/simplePromptParser';
import { TextSelectionModal, TextSelection } from '../TextSelectionModal';
import GrokParsingLoader from '../GrokParsingLoader';
import { useParsingEngine } from './hooks/useParsingEngine';
import { useHighlightManager } from './hooks/useHighlightManager';
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
  const [hasBeenAnalyzed, setHasBeenAnalyzed] = useState(false);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
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

  // Focus on value change if requested
  useEffect(() => {
    if (focusOnValueChange && value && textareaRef.current) {
      textareaRef.current.focus();
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

  // Handle parse button click
  const handleParse = useCallback(() => {
    if (value.trim()) {
      onAnalysisStart?.();
      performParse(value, llmMode, newAnalysis => {
        setAnalysis(newAnalysis);
        const newSegments = convertAnalysisToSegments(value, newAnalysis);
        setHighlightSegments(newSegments);
        onAnalysisComplete(newAnalysis);
        setHasBeenAnalyzed(true);
      });
    }
  }, [
    value,
    llmMode,
    performParse,
    convertAnalysisToSegments,
    setHighlightSegments,
    onAnalysisComplete,
    onAnalysisStart
  ]);

  // Handle clear button
  const handleClear = useCallback(() => {
    onChange('');
    setAnalysis(null);
    setHighlightSegments([]);
    setHasBeenAnalyzed(false);
  }, [onChange, setHighlightSegments]);

  // Handle text change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
      clearCache();
    },
    [onChange, clearCache]
  );

  // Track selection in textarea
  const handleSelect = useCallback(() => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart || 0;
    const end = textareaRef.current.selectionEnd || 0;

    if (start !== end) {
      setSelection({ start, end, text: value.slice(start, end) });
    } else {
      setSelection(null);
    }
  }, [value]);

  // Handle segment click
  const handleSegmentClick = useCallback(
    (nodeId: string, index: number) => {
      selectSegment(index);
      if (onSelectNode) {
        onSelectNode(nodeId);
      }
    },
    [selectSegment, onSelectNode]
  );

  // Edit mode handlers
  const handleEnterEditMode = useCallback(() => {
    preEditTextRef.current = value;
    preEditAnalysisRef.current = analysis;
    setIsEditMode(true);
  }, [value, analysis]);

  const handleApplyEditMode = useCallback(() => {
    setIsEditMode(false);
    if (preEditTextRef.current !== value && value.trim()) {
      handleParse();
    }
  }, [value, handleParse]);

  const handleCancelEditMode = useCallback(() => {
    if (preEditTextRef.current !== null) {
      onChange(preEditTextRef.current);
    }
    setIsEditMode(false);
  }, [onChange]);

  // Sync scroll between textarea and overlay
  useEffect(() => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;

    if (!textarea || !overlay) return;

    const syncScroll = () => {
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    };

    textarea.addEventListener('scroll', syncScroll);
    return () => textarea.removeEventListener('scroll', syncScroll);
  }, []);

  return (
    <div className="prompt-dissector">
      {/* Toolbar with undo/redo and edit controls */}
      {!isEditMode && hasBeenAnalyzed && (
        <div className="prompt-dissector-toolbar">
          <div className="toolbar-group">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="toolbar-button"
              title="Undo (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="toolbar-button"
              title="Redo (Ctrl+Y)"
            >
              ↷
            </button>
          </div>

          <div className="toolbar-group">
            <button
              onClick={handleEnterEditMode}
              className="toolbar-button"
              title="Edit mode"
            >
              ✏️ Edit
            </button>
          </div>

          <div className="toolbar-group">
            <button
              onClick={handleParse}
              disabled={isLLMParsing}
              className="toolbar-button parse-button"
              title="Re-parse the prompt"
            >
              {isLLMParsing ? 'Parsing...' : 'Re-parse'}
            </button>
          </div>

          {isLLMParsing && (
            <div className="parsing-indicator">
              <span className="spinner">⟳</span> Analyzing...
            </div>
          )}
        </div>
      )}

      <div className="prompt-dissector-content">
        <div className="prompt-dissector-editor-container">
          {/* Overlay for highlights */}
          {hasBeenAnalyzed && !isEditMode && (
            <div
              ref={overlayRef}
              className="prompt-dissector-overlay"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '12px',
                fontSize: '14px',
                lineHeight: '1.5',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: 'transparent'
              }}
            >
              {highlightSegments.map((segment, index) => (
                <span
                  key={`${index}-${segment.startIndex}`}
                  style={segment.nodeId ? segmentStyles[segment.nodeId] : {}}
                  className={segment.nodeId ? 'highlight-segment' : ''}
                  onClick={() =>
                    segment.nodeId && handleSegmentClick(segment.nodeId, index)
                  }
                  onMouseEnter={() =>
                    segment.nodeId && handleSegmentHover(segment.nodeId)
                  }
                  onMouseLeave={() =>
                    segment.nodeId && handleSegmentHover(null)
                  }
                  data-node-id={segment.nodeId}
                >
                  {segment.text}
                </span>
              ))}
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onSelect={handleSelect}
            placeholder={placeholder}
            className="prompt-dissector-textarea"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              padding: '12px',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'monospace',
              backgroundColor: 'transparent',
              color: isEditMode || !hasBeenAnalyzed ? '#e0e0e0' : 'transparent',
              caretColor: '#e0e0e0',
              resize: 'none',
              border: 'none',
              outline: 'none',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              zIndex: 1
            }}
            spellCheck={false}
          />

          {/* Control buttons */}
          {isEditMode && (
            <div
              className="dissector-editbar"
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '12px',
                display: 'flex',
                gap: '8px',
                zIndex: 10000
              }}
            >
              <button
                className="dissector-btn"
                onClick={handleApplyEditMode}
                title="Apply changes"
              >
                OK
              </button>
              <button
                className="dissector-btn"
                onClick={handleCancelEditMode}
                title="Cancel changes"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Parse and Clear buttons when not analyzed */}
          {!isEditMode && !hasBeenAnalyzed && value.trim() && (
            <div
              className="dissector-editbar"
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '12px',
                display: 'flex',
                gap: '8px',
                zIndex: 10000,
                pointerEvents: 'auto'
              }}
            >
              <button
                className="dissector-btn"
                style={{
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  padding: '6px 16px',
                  background: 'rgba(103, 126, 234, 0.25)',
                  border: '1px solid rgba(103, 126, 234, 0.6)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontWeight: 600
                }}
                onClick={handleParse}
                title="Parse prompt"
              >
                Parse
              </button>
              <button
                className="dissector-btn"
                style={{
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  padding: '6px 16px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}
                onClick={handleClear}
                title="Clear text"
              >
                Clear
              </button>
            </div>
          )}
        </div>

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
