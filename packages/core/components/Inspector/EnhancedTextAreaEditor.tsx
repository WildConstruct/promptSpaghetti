import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCorrectionsStore } from '../../correctionsStore';
import { EditorFieldProps } from './BaseNodeEditor';

interface CorrectionSuggestion {
  id: string;
  ruleId: string;
  ruleName: string;
  original: string;
  suggested: string;
  start: number;
  end: number;
  confidence: number;
}

interface EnhancedTextAreaEditorProps extends EditorFieldProps {
  rows?: number;
  maxLength?: number;
  minLength?: number;
  autoResize?: boolean;
  showWordCount?: boolean;
  enableInlineCorrections?: boolean;
  autoApplyCorrections?: boolean;
  showCorrectionHighlights?: boolean;
}

export const EnhancedTextAreaEditor: React.FC<EnhancedTextAreaEditorProps> = ({
  label,
  value,
  fieldKey,
  error,
  onChange,
  placeholder,
  disabled = false,
  rows = 4,
  maxLength,
  minLength,
  autoResize = false,
  showWordCount = false,
  enableInlineCorrections = true,
  autoApplyCorrections = false,
  showCorrectionHighlights = true
}) => {
  const [localValue, setLocalValue] = useState(String(value ?? ''));
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<CorrectionSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [_____selectedSuggestion, _____setSelectedSuggestion] = useState<string | null>(null);
  const [_____cursorPosition, setCursorPosition] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const { getActiveRules, applyCorrections, addNotification } = useCorrectionsStore();

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(String(value ?? ''));
  }, [value]);

  // Auto-resize functionality
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [localValue, autoResize]);

  // Generate correction suggestions
  const generateSuggestions = useCallback((text: string): CorrectionSuggestion[] => {
    if (!enableInlineCorrections) return [];
    
    const activeRules = getActiveRules();
    const suggestions: CorrectionSuggestion[] = [];
    
    for (const rule of activeRules) {
      try {
        if (rule.isRegex) {
          const regex = new RegExp(rule.findPattern, 'g');
          let match;
          
          while ((match = regex.exec(text)) !== null) {
            const correctedText = match[0].replace(new RegExp(rule.findPattern, 'g'), rule.replaceWith);
            
            if (correctedText !== match[0]) {
              suggestions.push({
                id: `${rule.id}-${match.index}`,
                ruleId: rule.id,
                ruleName: rule.name,
                original: match[0],
                suggested: correctedText,
                start: match.index,
                end: match.index + match[0].length,
                confidence: rule.effectivenessScore || 0.8
              });
            }
          }
        } else {
          const pattern = new RegExp(escapeRegExp(rule.findPattern), 'g');
          let match;
          
          while ((match = pattern.exec(text)) !== null) {
            if (rule.replaceWith !== match[0]) {
              suggestions.push({
                id: `${rule.id}-${match.index}`,
                ruleId: rule.id,
                ruleName: rule.name,
                original: match[0],
                suggested: rule.replaceWith,
                start: match.index,
                end: match.index + match[0].length,
                confidence: rule.effectivenessScore || 0.8
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Error generating suggestions for rule ${rule.name}:`, error);
      }
    }
    
    // Sort by confidence and position
    return suggestions.sort((a, b) => {
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      return a.start - b.start;
    });
  }, [getActiveRules, enableInlineCorrections]);

  // Update suggestions when text changes
  useEffect(() => {
    if (enableInlineCorrections && localValue) {
      const newSuggestions = generateSuggestions(localValue);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [localValue, generateSuggestions, enableInlineCorrections]);

  // Auto-apply corrections if enabled
  useEffect(() => {
    if (autoApplyCorrections && localValue && !isFocused) {
      const correctedText = applyCorrections(localValue);
      if (correctedText !== localValue) {
        setLocalValue(correctedText);
        onChange(correctedText);
        
        addNotification({
          type: 'success',
          title: 'Corrections Applied',
          message: 'Text has been automatically corrected.'
        });
      }
    }
  }, [localValue, autoApplyCorrections, isFocused, applyCorrections, onChange, addNotification]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleCursorPositionChange = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  const applySuggestion = (suggestion: CorrectionSuggestion) => {
    const newText = localValue.slice(0, suggestion.start) + 
                   suggestion.suggested + 
                   localValue.slice(suggestion.end);
    
    setLocalValue(newText);
    onChange(newText);
    
    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    
    addNotification({
      type: 'success',
      title: 'Correction Applied',
      message: `Applied "${suggestion.ruleName}" correction.`
    });
  };

  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter to apply all suggestions
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      const correctedText = applyCorrections(localValue);
      if (correctedText !== localValue) {
        setLocalValue(correctedText);
        onChange(correctedText);
        setSuggestions([]);
        
        addNotification({
          type: 'success',
          title: 'All Corrections Applied',
          message: 'All available corrections have been applied.'
        });
      }
    }
    
    // Ctrl+Shift+C to toggle corrections
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      setShowSuggestions(!showSuggestions);
    }
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\\s+/).filter(word => word.length > 0).length;
  };

  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
  };

  const inputId = `field-${fieldKey}`;
  
  const textareaStyle = {
    width: '100%',
    padding: 8,
    border: error 
      ? '1px solid #f56565' 
      : isFocused 
        ? '1px solid #4299e1' 
        : suggestions.length > 0 
          ? '1px solid #fbb040'
          : '1px solid #4a5568',
    borderRadius: 4,
    background: '#2d3748',
    color: '#e2e8f0',
    fontSize: 13,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    resize: autoResize ? 'none' as const : 'vertical' as const,
    minHeight: autoResize ? `${rows * 1.5}em` : undefined,
    position: 'relative' as const
  };

  const labelStyle = {
    display: 'block',
    fontWeight: 500,
    marginBottom: 4,
    color: '#e2e8f0',
    fontSize: 12,
    letterSpacing: '0.025em'
  };

  const suggestionStyle = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    background: '#1a202c',
    border: '1px solid #4a5568',
    borderRadius: 4,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    maxHeight: '200px',
    overflowY: 'auto' as const,
    marginTop: 2
  };

  const wordCount = getWordCount(localValue);
  const charCount = localValue.length;

  return (
    <div style={{ marginBottom: 16, position: 'relative' }}>
      <label htmlFor={inputId} style={labelStyle}>
        {label}
        {error && (
          <span style={{ color: '#f56565', marginLeft: 4, fontSize: 10 }}>
            *
          </span>
        )}
        {suggestions.length > 0 && enableInlineCorrections && (
          <span style={{ color: '#fbb040', marginLeft: 8, fontSize: 10 }}>
            {suggestions.length} correction{suggestions.length !== 1 ? 's' : ''} available
          </span>
        )}
      </label>
      
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          id={inputId}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSelect={handleCursorPositionChange}
          onKeyUp={handleCursorPositionChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
          disabled={disabled}
          rows={autoResize ? undefined : rows}
          maxLength={maxLength}
          minLength={minLength}
          style={textareaStyle}
        />
        
        {/* Inline correction suggestions */}
        {enableInlineCorrections && showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} style={suggestionStyle}>
            {suggestions.slice(0, 5).map((suggestion) => (
              <div
                key={suggestion.id}
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid #2d3748',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: '#e2e8f0', marginBottom: 2 }}>
                    {suggestion.ruleName}
                  </div>
                  <div style={{ color: '#a0aec0' }}>
                    <span style={{ textDecoration: 'line-through', color: '#f56565' }}>
                      {suggestion.original}
                    </span>
                    {' → '}
                    <span style={{ color: '#68d391' }}>
                      {suggestion.suggested}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => applySuggestion(suggestion)}
                    style={{
                      background: '#68d391',
                      color: '#1a202c',
                      border: 'none',
                      borderRadius: 2,
                      padding: '2px 6px',
                      fontSize: 10,
                      cursor: 'pointer'
                    }}
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => dismissSuggestion(suggestion.id)}
                    style={{
                      background: '#4a5568',
                      color: '#e2e8f0',
                      border: 'none',
                      borderRadius: 2,
                      padding: '2px 6px',
                      fontSize: 10,
                      cursor: 'pointer'
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
            
            {suggestions.length > 5 && (
              <div style={{ 
                padding: '8px 12px', 
                color: '#a0aec0', 
                fontSize: 10,
                textAlign: 'center'
              }}>
                +{suggestions.length - 5} more corrections available
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div style={{ 
          color: '#f56565', 
          fontSize: 11, 
          marginTop: 4,
          fontWeight: 400
        }}>
          {error}
        </div>
      )}
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
        fontSize: 10,
        color: '#a0aec0'
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {showWordCount && (
            <span>
              {wordCount} word{wordCount !== 1 ? 's' : ''}
            </span>
          )}
          
          {enableInlineCorrections && (
            <span>
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: suggestions.length > 0 ? '#fbb040' : '#a0aec0',
                  cursor: 'pointer',
                  fontSize: 10,
                  padding: 0
                }}
              >
                {showSuggestions ? 'Hide' : 'Show'} corrections
              </button>
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: 16 }}>
          {enableInlineCorrections && (
            <span style={{ color: '#a0aec0', fontSize: 9 }}>
              Ctrl+Enter: Apply all • Ctrl+Shift+C: Toggle
            </span>
          )}
          
          {maxLength && (
            <span style={{ color: charCount > maxLength * 0.9 ? '#fbb040' : '#a0aec0' }}>
              {charCount} / {maxLength}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};