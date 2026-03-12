import React, { useState, useCallback, useEffect } from 'react';
import { ApiLLMClient } from '../../services/llm';
import './LLMToggleInline.css';

export interface LLMToggleInlineProps {
  onModeChange?: (mode: 'standard' | 'llm-enhanced') => void;
  onConfigClick?: () => void;
  className?: string;
  initialMode?: 'standard' | 'llm-enhanced';
}

export const LLMToggleInline: React.FC<LLMToggleInlineProps> = ({
  onModeChange,
  onConfigClick,
  className = '',
  initialMode = 'standard'
}) => {
  const [mode, setMode] = useState<'standard' | 'llm-enhanced'>(initialMode);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    new ApiLLMClient()
      .getStatus()
      .then(status => {
        if (!cancelled) {
          setIsEnabled(status.available);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsEnabled(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = useCallback(() => {
    const newMode = mode === 'standard' ? 'llm-enhanced' : 'standard';
    setMode(newMode);
    onModeChange?.(newMode);
  }, [mode, onModeChange]);

  return (
    <div className={`llm-toggle-inline ${className}`}>
      <button
        className={`llm-toggle-switch ${mode} ${!isEnabled ? 'disabled' : ''}`}
        onClick={handleToggle}
        disabled={!isEnabled}
        aria-label={`Parser mode: ${mode}`}
        title={
          isEnabled
            ? `Click to switch to ${mode === 'standard' ? 'AI-Enhanced' : 'Standard'} mode`
            : 'AI parser unavailable'
        }
      >
        <div className="llm-toggle-slider">
          <span className="llm-toggle-text standard-text">Standard</span>
          <span className="llm-toggle-text ai-text">AI Polish</span>
        </div>
      </button>

      {onConfigClick && (
        <button
          className="llm-toggle-config"
          onClick={onConfigClick}
          aria-label="Configure LLM settings"
          title="View AI status"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 10C9.1 10 10 9.1 10 8C10 6.9 9.1 6 8 6C6.9 6 6 6.9 6 8C6 9.1 6.9 10 8 10Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M13 8L12 6L13 4L11 3L10 1L8 2L6 1L5 3L3 4L4 6L3 8L5 9L6 11L8 10L10 11L11 9L13 8Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default LLMToggleInline;
