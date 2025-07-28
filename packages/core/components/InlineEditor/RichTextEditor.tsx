import React, { useState, useRef, useCallback, useEffect } from 'react';
import { NodeData } from '../../types/NodeTypes';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  nodeType?: string;
  height?: number;
  showToolbar?: boolean;
  enableSyntaxHighlighting?: boolean;
  theme?: 'light' | 'dark' | 'cinema';
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  nodeType = 'default',
  height = 120,
  showToolbar = true,
  enableSyntaxHighlighting = true,
  theme = 'cinema'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Syntax highlighting for template variables
  const highlightSyntax = useCallback((text: string): JSX.Element[] => {
    if (!enableSyntaxHighlighting) {
      return [<span key="text">{text}</span>];
    }

    const parts: JSX.Element[] = [];
    let lastIndex = 0;

    // Match template variables like {{variable}}
    const variableRegex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = variableRegex.exec(text)) !== null) {
      // Add text before variable
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.slice(lastIndex, match.index)}
          </span>
        );
      }

      // Add highlighted variable
      parts.push(
        <span
          key={`var-${match.index}`}
          style={{
            background: '#4299e1',
            color: 'white',
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: '0.9em',
            fontWeight: 600
          }}
        >
          {match[0]}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : [<span key="empty">{text}</span>];
  }, [enableSyntaxHighlighting]);

  // Toolbar actions
  const insertText = useCallback((textToInsert: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.slice(0, start) + textToInsert + value.slice(end);
    
    onChange(newValue);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  }, [value, onChange]);

  const insertVariable = useCallback(() => {
    insertText('{{variable}}');
  }, [insertText]);

  const insertCondition = useCallback(() => {
    insertText('{{if condition}}{{endif}}');
  }, [insertText]);

  const insertLoop = useCallback(() => {
    insertText('{{for item in items}}{{endfor}}');
  }, [insertText]);

  // Get theme colors
  const getThemeColors = () => {
    switch (theme) {
      case 'cinema':
        return {
          background: '#4a5568',
          border: '#718096',
          text: '#e2e8f0',
          accent: '#4299e1',
          toolbar: '#2d3748'
        };
      case 'dark':
        return {
          background: '#2d3748',
          border: '#4a5568',
          text: '#f7fafc',
          accent: '#38a169',
          toolbar: '#1a202c'
        };
      case 'light':
      default:
        return {
          background: '#ffffff',
          border: '#e2e8f0',
          text: '#2d3748',
          accent: '#3182ce',
          toolbar: '#f7fafc'
        };
    }
  };

  const colors = getThemeColors();

  return (
    <div className="rich-text-editor" style={{ position: 'relative' }}>
      {/* Toolbar */}
      {showToolbar && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: 8,
            background: colors.toolbar,
            borderRadius: '6px 6px 0 0',
            borderBottom: `1px solid ${colors.border}`
          }}
        >
          <ToolbarButton
            onClick={insertVariable}
            title="Insert Variable"
            theme={theme}
          >
            {{var}}
          </ToolbarButton>
          
          {nodeType === 'concat' && (
            <>
              <ToolbarButton
                onClick={insertCondition}
                title="Insert Condition"
                theme={theme}
              >
                if
              </ToolbarButton>
              <ToolbarButton
                onClick={insertLoop}
                title="Insert Loop"
                theme={theme}
              >
                for
              </ToolbarButton>
            </>
          )}
          
          <div style={{ flex: 1 }} />
          
          <span style={{
            fontSize: 11,
            color: colors.text,
            opacity: 0.7,
            alignSelf: 'center'
          }}>
            {value.length} chars
          </span>
        </div>
      )}

      {/* Editor Container */}
      <div style={{ position: 'relative' }}>
        {/* Syntax Highlighting Overlay */}
        {enableSyntaxHighlighting && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: 12,
              fontSize: 14,
              fontFamily: 'SFMono-Regular, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
              lineHeight: 1.5,
              color: 'transparent',
              pointerEvents: 'none',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflow: 'hidden',
              zIndex: 1
            }}
          >
            {highlightSyntax(value)}
          </div>
        )}

        {/* Actual Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSelect={(e) => {
            const target = e.target as HTMLTextAreaElement;
            setCursorPosition(target.selectionStart);
          }}
          placeholder={placeholder}
          style={{
            width: '100%',
            height,
            padding: 12,
            background: enableSyntaxHighlighting ? 'transparent' : colors.background,
            border: `2px solid ${isFocused ? colors.accent : colors.border}`,
            borderRadius: showToolbar ? '0 0 6px 6px' : 6,
            borderTop: showToolbar ? 'none' : `2px solid ${isFocused ? colors.accent : colors.border}`,
            color: enableSyntaxHighlighting ? 'transparent' : colors.text,
            fontSize: 14,
            fontFamily: 'SFMono-Regular, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
            lineHeight: 1.5,
            resize: 'vertical',
            outline: 'none',
            caretColor: colors.text,
            position: 'relative',
            zIndex: 2
          }}
        />
      </div>

      {/* Live Preview for template nodes */}
      {(nodeType === 'concat' || nodeType === 'template') && value.includes('{{') && (
        <div
          style={{
            marginTop: 8,
            padding: 8,
            background: colors.toolbar,
            border: `1px solid ${colors.border}`,
            borderRadius: 4,
            fontSize: 12
          }}
        >
          <div style={{ color: colors.text, opacity: 0.7, marginBottom: 4 }}>
            Template Preview:
          </div>
          <div style={{ color: colors.text, fontFamily: 'monospace' }}>
            {renderTemplatePreview(value)}
          </div>
        </div>
      )}
    </div>
  );
};

// Toolbar Button Component
interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  theme: 'light' | 'dark' | 'cinema';
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, title, children, theme }) => {
  const getButtonColors = () => {
    switch (theme) {
      case 'cinema':
        return { bg: '#4a5568', hover: '#718096', text: '#e2e8f0' };
      case 'dark':
        return { bg: '#2d3748', hover: '#4a5568', text: '#f7fafc' };
      case 'light':
      default:
        return { bg: '#e2e8f0', hover: '#cbd5e0', text: '#2d3748' };
    }
  };

  const colors = getButtonColors();

  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: '4px 8px',
        background: colors.bg,
        color: colors.text,
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 11,
        fontWeight: 600,
        transition: 'background 0.2s ease'
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLButtonElement).style.background = colors.hover;
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.background = colors.bg;
      }}
    >
      {children}
    </button>
  );
};

// Template preview renderer
const renderTemplatePreview = (template: string): string => {
  return template
    .replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const varName = variable.trim();
      
      // Sample data for preview
      const sampleData: Record<string, string> = {
        'name': 'John Doe',
        'title': 'Software Engineer',
        'company': 'Tech Corp',
        'date': '2024-01-15',
        'variable': 'sample_value',
        'item': 'example_item',
        'condition': 'true'
      };
      
      return sampleData[varName] || `[${varName}]`;
    });
};

// Specialized Rich Text Editor for different node types
export const NodeSpecificRichEditor: React.FC<{
  nodeType: string;
  data: NodeData;
  field: string;
  onChange: (field: string, value: string) => void;
  theme?: 'light' | 'dark' | 'cinema';
}> = ({ nodeType, data, field, onChange, theme = 'cinema' }) => {
  const value = (data as any)[field] || '';

  const getEditorConfig = () => {
    switch (nodeType) {
      case 'concat':
        return {
          placeholder: 'Enter template with {{variable}} placeholders...',
          height: 100,
          showToolbar: true,
          enableSyntaxHighlighting: true
        };
      case 'conditional':
        return {
          placeholder: 'Enter condition expression...',
          height: 60,
          showToolbar: true,
          enableSyntaxHighlighting: true
        };
      case 'output':
        return {
          placeholder: 'Enter output text or template...',
          height: 80,
          showToolbar: false,
          enableSyntaxHighlighting: false
        };
      default:
        return {
          placeholder: 'Enter text...',
          height: 80,
          showToolbar: false,
          enableSyntaxHighlighting: false
        };
    }
  };

  const config = getEditorConfig();

  return (
    <RichTextEditor
      value={value}
      onChange={(newValue) => onChange(field, newValue)}
      nodeType={nodeType}
      theme={theme}
      {...config}
    />
  );
};

export default RichTextEditor;