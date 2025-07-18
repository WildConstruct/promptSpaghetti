/**
 * Mobile-optimized input components
 */

import React, { useState, useRef } from 'react';
import { Input, TextArea, InputProps } from '../../components/Input';
import { TOUCH_TARGETS, mobileStyles, MOBILE_SPACING } from '../design-system';
import { useDeviceDetection } from '../../responsive/utilities';
import { cn } from '../../utils';

export interface MobileInputProps extends InputProps {
  /**
   * Show clear button when input has value
   */
  clearable?: boolean;
  
  /**
   * Auto-focus and scroll into view on mobile
   */
  mobileAutoFocus?: boolean;
  
  /**
   * Show character count for text inputs
   */
  showCount?: boolean;
  
  /**
   * Mobile-specific keyboard type hints
   */
  mobileInputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
}

export const MobileInput: React.FC<MobileInputProps> = ({
  clearable = false,
  mobileAutoFocus = false,
  showCount = false,
  mobileInputMode,
  maxLength,
  value,
  onChange,
  className,
  style,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMobile, isTouch } = useDeviceDetection();
  
  const currentValue = value !== undefined ? value : internalValue;
  const hasValue = Boolean(currentValue);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(e);
  };
  
  const handleClear = () => {
    const syntheticEvent = {
      target: { value: '' },
      currentTarget: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>;
    
    if (value === undefined) {
      setInternalValue('');
    }
    onChange?.(syntheticEvent);
    inputRef.current?.focus();
  };
  
  React.useEffect(() => {
    if (mobileAutoFocus && isMobile && inputRef.current) {
      // Delay to ensure keyboard doesn't cover input
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  }, [mobileAutoFocus, isMobile]);
  
  const mobileInputStyles: React.CSSProperties = {
    minHeight: TOUCH_TARGETS.preferred,
    fontSize: 16, // Prevents zoom on iOS
    padding: `${MOBILE_SPACING.sm}px ${MOBILE_SPACING.md}px`,
    paddingRight: clearable && hasValue ? TOUCH_TARGETS.preferred : undefined,
    ...mobileStyles.tapHighlight,
    ...style
  };
  
  return (
    <div className={cn('mobile-input-wrapper', className)} style={{ position: 'relative' }}>
      <Input
        {...props}
        ref={inputRef}
        value={currentValue}
        onChange={handleChange}
        maxLength={maxLength}
        inputMode={mobileInputMode}
        style={mobileInputStyles}
        className={cn(
          'mobile-input',
          isTouch && 'touch-device'
        )}
      />
      
      {clearable && hasValue && (
        <button
          className="mobile-input-clear"
          onClick={handleClear}
          type="button"
          aria-label="Clear input"
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: TOUCH_TARGETS.minimum,
            height: TOUCH_TARGETS.minimum,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            fontSize: 18,
            ...mobileStyles.tapHighlight,
            ...mobileStyles.noSelect
          }}
        >
          ×
        </button>
      )}
      
      {showCount && maxLength && (
        <div 
          className="mobile-input-count"
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            textAlign: 'right',
            marginTop: 4
          }}
        >
          {currentValue.toString().length}/{maxLength}
        </div>
      )}
    </div>
  );
};

/**
 * Mobile search input with built-in search icon and clear button
 */
export interface MobileSearchInputProps extends MobileInputProps {
  onSearch?: (value: string) => void;
  searchOnEnter?: boolean;
}

export const MobileSearchInput: React.FC<MobileSearchInputProps> = ({
  onSearch,
  searchOnEnter = true,
  placeholder = 'Search...',
  ...props
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchOnEnter && e.key === 'Enter') {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value;
      onSearch?.(value);
    }
  };
  
  return (
    <div className="mobile-search-wrapper" style={{ position: 'relative' }}>
      <span 
        className="mobile-search-icon"
        style={{
          position: 'absolute',
          left: MOBILE_SPACING.md,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-text-secondary)',
          pointerEvents: 'none'
        }}
      >
        🔍
      </span>
      <MobileInput
        {...props}
        type="search"
        mobileInputMode="search"
        placeholder={placeholder}
        clearable
        onKeyDown={handleKeyDown}
        style={{
          paddingLeft: TOUCH_TARGETS.minimum,
          ...props.style
        }}
      />
    </div>
  );
};

/**
 * Mobile-optimized textarea
 */
export interface MobileTextAreaProps extends MobileInputProps {
  minRows?: number;
  maxRows?: number;
  autoResize?: boolean;
}

export const MobileTextArea: React.FC<MobileTextAreaProps> = ({
  minRows = 3,
  maxRows = 10,
  autoResize = true,
  showCount = true,
  style,
  ...props
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleInput = () => {
    if (autoResize && textAreaRef.current) {
      const textarea = textAreaRef.current;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const minHeight = minRows * 24; // Approximate line height
      const maxHeight = maxRows * 24;
      textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    }
  };
  
  React.useEffect(() => {
    handleInput();
  }, [props.value]);
  
  return (
    <div className="mobile-textarea-wrapper">
      <TextArea
        {...props}
        ref={textAreaRef}
        onInput={handleInput}
        rows={minRows}
        style={{
          minHeight: minRows * 24,
          fontSize: 16, // Prevents zoom on iOS
          padding: MOBILE_SPACING.md,
          resize: autoResize ? 'none' : 'vertical',
          ...mobileStyles.tapHighlight,
          ...style
        }}
      />
      {showCount && props.maxLength && (
        <div 
          className="mobile-textarea-count"
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            textAlign: 'right',
            marginTop: 4
          }}
        >
          {(props.value || '').toString().length}/{props.maxLength}
        </div>
      )}
    </div>
  );
};