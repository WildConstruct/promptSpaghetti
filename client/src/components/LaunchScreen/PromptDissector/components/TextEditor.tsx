import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle
} from 'react';
import { HighlightSegment } from '../hooks/useHighlightManager';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: () => void;
  onScroll?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  highlightSegments: HighlightSegment[];
  segmentStyles: Record<string, React.CSSProperties>;
  onSegmentClick?: (segment: HighlightSegment, index: number) => void;
  onSegmentHover?: (nodeId: string | null) => void;
  isEditMode?: boolean;
}

export interface TextEditorRef {
  focus: () => void;
  getSelectionStart: () => number;
  getSelectionEnd: () => number;
  setSelectionRange: (start: number, end: number) => void;
  scrollToPosition: (position: number) => void;
}

export const TextEditor = forwardRef<TextEditorRef, TextEditorProps>(
  (
    {
      value,
      onChange,
      onSelect,
      onScroll,
      onFocus,
      onBlur,
      placeholder = 'Enter your prompt...',
      highlightSegments,
      segmentStyles,
      onSegmentClick,
      onSegmentHover,
      isEditMode = false
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Expose methods to parent through ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
      getSelectionStart: () => {
        return textareaRef.current?.selectionStart || 0;
      },
      getSelectionEnd: () => {
        return textareaRef.current?.selectionEnd || 0;
      },
      setSelectionRange: (start: number, end: number) => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start, end);
        }
      },
      scrollToPosition: (position: number) => {
        if (textareaRef.current) {
          // Simple scroll to make position visible
          const lineHeight = 24; // Approximate line height
          const targetScroll = Math.floor(position / 50) * lineHeight; // Rough estimate
          textareaRef.current.scrollTop = targetScroll;
        }
      }
    }));

    // Sync scroll between textarea and overlay
    useEffect(() => {
      const textarea = textareaRef.current;
      const overlay = overlayRef.current;

      if (!textarea || !overlay) {
        return;
      }

      const syncScroll = () => {
        overlay.scrollTop = textarea.scrollTop;
        overlay.scrollLeft = textarea.scrollLeft;
      };

      textarea.addEventListener('scroll', syncScroll);
      return () => textarea.removeEventListener('scroll', syncScroll);
    }, []);

    // Handle scroll callback
    const handleScroll = () => {
      if (overlayRef.current && textareaRef.current) {
        overlayRef.current.scrollTop = textareaRef.current.scrollTop;
        overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }
      onScroll?.();
    };

    return (
      <div className="prompt-dissector-editor-container">
        <div
          ref={overlayRef}
          className="prompt-dissector-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: isEditMode ? 'none' : 'auto',
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
              onClick={() => segment.nodeId && onSegmentClick?.(segment, index)}
              onMouseEnter={() =>
                segment.nodeId && onSegmentHover?.(segment.nodeId)
              }
              onMouseLeave={() => segment.nodeId && onSegmentHover?.(null)}
              data-node-id={segment.nodeId}
            >
              {segment.text}
            </span>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onSelect={onSelect}
          onScroll={handleScroll}
          onFocus={onFocus}
          onBlur={onBlur}
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
            color: isEditMode ? 'inherit' : 'transparent',
            caretColor: 'inherit',
            resize: 'none',
            border: 'none',
            outline: 'none',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            zIndex: 1
          }}
        />
      </div>
    );
  }
);

TextEditor.displayName = 'TextEditor';
