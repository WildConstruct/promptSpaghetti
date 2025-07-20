/**
 * Web-specific Input implementation
 */

import React, { useRef } from 'react';
import { Input, InputProps, TextArea, TextAreaProps } from '../../components/Input';
import { usePlatformAdapter } from '../usePlatformAdapter';

export interface WebInputProps extends InputProps {
  autoComplete?: string;
  spellCheck?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

export const WebInput: React.FC<WebInputProps> = ({
  autoComplete = 'off',
  spellCheck = true,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  pattern,
  minLength,
  maxLength,
  onKeyDown,
  ...props
}) => {
  const adapter = usePlatformAdapter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Web-specific keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
      case 'a':
        // Select all - let browser handle this
        break;
      case 'z':
        // Undo - let browser handle this
        break;
      case 'y':
        // Redo - let browser handle this
        break;
      }
    }

    // Call original onKeyDown handler
    onKeyDown?.(e);
  };

  return (
    <Input
      {...props}
      ref={inputRef}
      onKeyDown={handleKeyDown}
      // Web-specific attributes
      autoComplete={autoComplete}
      spellCheck={spellCheck}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect ? 'on' : 'off'}
      pattern={pattern}
      minLength={minLength}
      maxLength={maxLength}
      style={{
        ...props.style,
        // Web-specific styling
        WebkitTapHighlightColor: 'transparent',
        WebkitAppearance: 'none'
      }}
    />
  );
};

export interface WebTextAreaProps extends TextAreaProps {
  autoComplete?: string;
  spellCheck?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  minLength?: number;
  maxLength?: number;
  wrap?: 'hard' | 'soft' | 'off';
}

export const WebTextArea: React.FC<WebTextAreaProps> = ({
  autoComplete = 'off',
  spellCheck = true,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  minLength,
  maxLength,
  wrap = 'soft',
  onKeyDown,
  ...props
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Web-specific keyboard shortcuts for text areas
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
      case 'Enter':
        // Ctrl+Enter for submit in some contexts
        e.preventDefault();
        // Could trigger onSubmit callback if provided
        break;
      }
    }

    // Tab handling for code editing
    if (e.key === 'Tab' && props.hint?.includes('code')) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      if (e.shiftKey) {
        // Remove indentation
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(end);
        const lines = beforeCursor.split('\n');
        const currentLine = lines[lines.length - 1];
        
        if (currentLine.startsWith('  ')) {
          lines[lines.length - 1] = currentLine.substring(2);
          const newValue = lines.join('\n') + afterCursor;
          textarea.value = newValue;
          textarea.setSelectionRange(start - 2, end - 2);
          props.onChange?.(newValue);
        }
      } else {
        // Add indentation
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        textarea.value = newValue;
        textarea.setSelectionRange(start + 2, end + 2);
        props.onChange?.(newValue);
      }
      return;
    }

    onKeyDown?.(e);
  };

  return (
    <TextArea
      {...props}
      ref={textAreaRef}
      onKeyDown={handleKeyDown}
      // Web-specific attributes
      autoComplete={autoComplete}
      spellCheck={spellCheck}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect ? 'on' : 'off'}
      minLength={minLength}
      maxLength={maxLength}
      wrap={wrap}
      style={{
        ...props.style,
        // Web-specific styling
        WebkitTapHighlightColor: 'transparent',
        WebkitAppearance: 'none',
        resize: 'vertical'
      }}
    />
  );
};