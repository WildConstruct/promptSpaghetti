import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  parseTemplate,
  getVariableSuggestions,
  getPreviewWithSamples,
  VariableSuggestion
} from '../../utils/templateParser';

export interface TemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
  onVariablesChange?: (variables: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  showPreview?: boolean;
  autoComplete?: boolean;
  className?: string;
}

export   const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Parse template and get results
  const parseResult = useMemo(() => parseTemplate(value), [value]);
  const previewResult = useMemo(() => getPreviewWithSamples(value), [value]);
  
  // Get variable suggestions based on cursor position
  const suggestions = useMemo(() => {
    if (!autoComplete || !showSuggestions) return [];
    
    // Find if cursor is inside a variable being typed
    const beforeCursor = value.slice(0, cursorPosition);
    const match = beforeCursor.match(/{([^{}]*)$/);
    
    if (match) {
      const partialVariable = match[1];
      return getVariableSuggestions(partialVariable);
    }
    
    return [];
  }, [value, cursorPosition, autoComplete, showSuggestions]);

  // Update variables when they change
  useEffect(() => {
    if (onVariablesChange) {
      const variableNames = parseResult.variables
        .filter(v => v.isValid)
        .map(v => v.name);
      onVariablesChange(variableNames);
    }
  }, [parseResult.variables, onVariablesChange]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setCursorPosition(e.target.selectionStart);
    
    // Show suggestions if typing a variable
    const beforeCursor = newValue.slice(0, e.target.selectionStart);
    const isTypingVariable = beforeCursor.includes('{') && !beforeCursor.match(/{[^{}]*}$/);
    setShowSuggestions(isTypingVariable);
    setSuggestionIndex(-1);
  };

  // Handle key navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSuggestionIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
          
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (suggestionIndex >= 0) {
            applySuggestion(suggestions[suggestionIndex]);
          }
          break;
          
        case 'Escape':
          setShowSuggestions(false);
          setSuggestionIndex(-1);
          break;
      }
    }
  };

  // Apply selected suggestion
  const applySuggestion = (suggestion: VariableSuggestion) => {
    if (!inputRef.current) return;
    
    const beforeCursor = value.slice(0, cursorPosition);
    const afterCursor = value.slice(cursorPosition);
    const match = beforeCursor.match(/{([^{}]*)$/);
    
    if (match) {
      const variableStart = beforeCursor.lastIndexOf('{');
      const newValue = 
        beforeCursor.slice(0, variableStart) + 
        `{${suggestion.name}}` + 
        afterCursor;
      
      onChange(newValue);
      setShowSuggestions(false);
      setSuggestionIndex(-1);
      
      // Set cursor after the inserted variable
      setTimeout(() => {
        if (inputRef.current) {
          const newPosition = variableStart + suggestion.name.length + 2;
          inputRef.current.setSelectionRange(newPosition, newPosition);
          setCursorPosition(newPosition);
        }
      }, 0);
    }
  };

  // Render highlighted text (for display purposes)
  const renderHighlightedTemplate = () => {
    if (!value) return placeholder;
    
    let result = value;
    let offset = 0;
    
    // Add highlighting spans around variables
    for (const variable of parseResult.variables) {
      const className = variable.isValid ? 'template-variable' : 'template-variable-error';
      const before = result.slice(0, variable.startIndex + offset);
      const after = result.slice(variable.endIndex + offset);
      const highlightedVar = `<span class="${className}">${variable.placeholder}</span>`;
      
      result = before + highlightedVar + after;
      offset += highlightedVar.length - variable.placeholder.length;
    }
    
    return result;
  };

  return (
    <div className={`template-editor ${className}`} style={{ position: 'relative' }}>
      {/* Main Template Input */}
      <div style={{ position: 'relative' }}>
        <textarea
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow clicks
            setTimeout(() => {
              setIsFocused(false);
              setShowSuggestions(false);
            }, 100);
          }}
          onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            minHeight: 80,
            padding: 12,
            border: parseResult.isValid ? 
              (isFocused ? '2px solid #4299e1' : '1px solid #4a5568') :
              '2px solid #e53e3e',
            borderRadius: 6,
            background: '#2d3748',
            color: '#e2e8f0',
            fontSize: 14,
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            resize: 'vertical',
            outline: 'none',
            lineHeight: 1.4,
          }}
        />
        
        {/* Variable highlighting overlay */}
        {parseResult.variables.length > 0 && (
          <div 
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              right: 12,
              bottom: 12,
              pointerEvents: 'none',
              color: 'transparent',
              fontSize: 14,
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
            dangerouslySetInnerHTML={{ __html: renderHighlightedTemplate() }}
          />
        )}
      </div>
      
      {/* Auto-completion Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: 200,
            overflowY: 'auto',
            background: '#2d3748',
            border: '1px solid #4a5568',
            borderRadius: 6,
            marginTop: 4,
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.name}
              onClick={() => applySuggestion(suggestion)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: index === suggestionIndex ? '#4a5568' : 'transparent',
                borderBottom: index < suggestions.length - 1 ? '1px solid #4a5568' : 'none'
              }}
              onMouseEnter={() => setSuggestionIndex(index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ 
                    color: '#e2e8f0', 
                    fontWeight: 500, 
                    fontSize: 14,
                    fontFamily: 'Monaco, Consolas, monospace'
                  }}>
                    {suggestion.name}
                  </div>
                  <div style={{ 
                    color: '#a0aec0', 
                    fontSize: 12,
                    marginTop: 2
                  }}>
                    {suggestion.description}
                  </div>
                </div>
                <div style={{
                  background: getCategoryColor(suggestion.category),
                  color: 'white',
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 3,
                  fontWeight: 500
                }}>
                  {suggestion.category}
                </div>
              </div>
              
              {/* Example preview */}
              <div style={{
                marginTop: 4,
                fontSize: 11,
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                e.g., {suggestion.examples[0]}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Validation Errors */}
      {parseResult.errors.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {parseResult.errors.map((error, index) => (
            <div
              key={index}
              style={{
                color: error.severity === 'error' ? '#f56565' : '#ed8936',
                fontSize: 12,
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>{error.severity === 'error' ? '❌' : '⚠️'}</span>
              {error.message}
            </div>
          ))}
        </div>
      )}
      
      {/* Live Preview */}
      {showPreview && parseResult.isValid && parseResult.variables.length > 0 && (
        <div style={{
          marginTop: 12,
          padding: 12,
          background: '#1a202c',
          border: '1px solid #4a5568',
          borderRadius: 6
        }}>
          <div style={{
            fontSize: 11,
            color: '#a0aec0',
            marginBottom: 6,
            fontWeight: 500
          }}>
            Preview with sample values:
          </div>
          <div style={{
            color: '#e2e8f0',
            fontSize: 13,
            fontStyle: 'italic',
            lineHeight: 1.4
          }}>
            "{previewResult.preview}"
          </div>
          
          {/* Variable values used */}
          <div style={{ marginTop: 8, fontSize: 10, color: '#6b7280' }}>
            Variables: {Object.entries(previewResult.usedSamples)
              .map(([name, value]) => `{${name}} = "${value}"`)
              .join(', ')}
          </div>
        </div>
      )}
      
      {/* CSS Styles */}
      <style jsx>{`
        .template-variable {
          background: rgba(66, 153, 225, 0.2);
          color: #63b3ed;
          padding: 1px 2px;
          border-radius: 2px;
          font-weight: 500;
        }
        
        .template-variable-error {
          background: rgba(245, 101, 101, 0.2);
          color: #f56565;
          padding: 1px 2px;
          border-radius: 2px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

// Helper function to get category colors
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    character: '#9f7aea',  // purple
    setting: '#4fd1c7',    // teal
    action: '#f6ad55',     // orange
    mood: '#fc8181',       // red
    object: '#68d391',     // green
    custom: '#a0aec0'      // gray
  };
  
  return colors[category] || colors.custom;
};