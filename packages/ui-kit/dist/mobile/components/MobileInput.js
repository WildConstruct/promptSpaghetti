import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/**
 * Mobile-optimized input components
 */
import React, { useState, useRef } from 'react';
import { Input, TextArea } from '../../components/Input';
import { TOUCH_TARGETS, mobileStyles, MOBILE_SPACING } from '../design-system';
import { useDeviceDetection } from '../../responsive/utilities';
import { cn } from '../../utils';
export const MobileInput = ({
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
  const inputRef = useRef(null);
  const { isMobile, isTouch } = useDeviceDetection();
  const currentValue = value !== undefined ? value : internalValue;
  const hasValue = Boolean(currentValue);
  const handleChange = e => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(e);
  };
  const handleClear = () => {
    const syntheticEvent = {
      target: { value: '' },
      currentTarget: { value: '' },
    };
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
          block: 'center',
        });
      }, 300);
    }
  }, [mobileAutoFocus, isMobile]);
  const mobileInputStyles = {
    minHeight: TOUCH_TARGETS.preferred,
    fontSize: 16, // Prevents zoom on iOS
    padding: `${MOBILE_SPACING.sm}px ${MOBILE_SPACING.md}px`,
    paddingRight: clearable && hasValue ? TOUCH_TARGETS.preferred : undefined,
    ...mobileStyles.tapHighlight,
    ...style,
  };
  return _jsxs('div', {
    className: cn('mobile-input-wrapper', className),
    style: { position: 'relative' },
    children: [
      _jsx(Input, {
        ...props,
        ref: inputRef,
        value: currentValue,
        onChange: handleChange,
        maxLength: maxLength,
        inputMode: mobileInputMode,
        style: mobileInputStyles,
        className: cn('mobile-input', isTouch && 'touch-device'),
      }),
      clearable &&
        hasValue &&
        _jsx('button', {
          className: 'mobile-input-clear',
          onClick: handleClear,
          type: 'button',
          'aria-label': 'Clear input',
          style: {
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
            ...mobileStyles.noSelect,
          },
          children: '\u00D7',
        }),
      showCount &&
        maxLength &&
        _jsxs('div', {
          className: 'mobile-input-count',
          style: {
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            textAlign: 'right',
            marginTop: 4,
          },
          children: [currentValue.toString().length, '/', maxLength],
        }),
    ],
  });
};
export const MobileSearchInput = ({ onSearch, searchOnEnter = true, placeholder = 'Search...', ...props }) => {
  const handleKeyDown = e => {
    if (searchOnEnter && e.key === 'Enter') {
      e.preventDefault();
      const value = e.target.value;
      onSearch?.(value);
    }
  };
  return _jsxs('div', {
    className: 'mobile-search-wrapper',
    style: { position: 'relative' },
    children: [
      _jsx('span', {
        className: 'mobile-search-icon',
        style: {
          position: 'absolute',
          left: MOBILE_SPACING.md,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-text-secondary)',
          pointerEvents: 'none',
        },
        children: '\uD83D\uDD0D',
      }),
      _jsx(MobileInput, {
        ...props,
        type: 'search',
        mobileInputMode: 'search',
        placeholder: placeholder,
        clearable: true,
        onKeyDown: handleKeyDown,
        style: {
          paddingLeft: TOUCH_TARGETS.minimum,
          ...props.style,
        },
      }),
    ],
  });
};
export const MobileTextArea = ({ minRows = 3, maxRows = 10, autoResize = true, showCount = true, style, ...props }) => {
  const textAreaRef = useRef(null);
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
  return _jsxs('div', {
    className: 'mobile-textarea-wrapper',
    children: [
      _jsx(TextArea, {
        ...props,
        ref: textAreaRef,
        onInput: handleInput,
        rows: minRows,
        style: {
          minHeight: minRows * 24,
          fontSize: 16, // Prevents zoom on iOS
          padding: MOBILE_SPACING.md,
          resize: autoResize ? 'none' : 'vertical',
          ...mobileStyles.tapHighlight,
          ...style,
        },
      }),
      showCount &&
        props.maxLength &&
        _jsxs('div', {
          className: 'mobile-textarea-count',
          style: {
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            textAlign: 'right',
            marginTop: 4,
          },
          children: [(props.value || '').toString().length, '/', props.maxLength],
        }),
    ],
  });
};
//# sourceMappingURL=MobileInput.js.map
