// Parser Toggle Component - Story 2.6
// UI toggle for switching between standard and LLM-enhanced parsing modes

import React, { useCallback, useEffect, useState } from 'react';
import './ParserToggle.css';

interface ParserToggleProps {
  mode: 'standard' | 'llm-enhanced';
  onChange: (mode: 'standard' | 'llm-enhanced') => void;
  disabled?: boolean;
  loading?: boolean;
}

export const ParserToggle: React.FC<ParserToggleProps> = ({
  mode,
  onChange,
  disabled = false,
  loading = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const getStorageKey = useCallback(() => {
    const globalWindow = window as typeof window & {
      currentProjectId?: string;
      currentUserId?: string;
    };
    const projectId = globalWindow.currentProjectId ?? 'default';
    const userId = globalWindow.currentUserId;

    if (userId) {
      return `parser-mode-${userId}-${projectId}`;
    }
    return 'parser-mode-anonymous';
  }, []);

  // Persist toggle state
  useEffect(() => {
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, mode);
  }, [getStorageKey, mode]);

  // Load persisted state on mount
  useEffect(() => {
    const storageKey = getStorageKey();
    const saved = localStorage.getItem(storageKey);
    if (saved && (saved === 'standard' || saved === 'llm-enhanced')) {
      onChange(saved);
    }
  }, [getStorageKey, onChange]);

  const handleToggle = () => {
    if (disabled || loading) {
      return;
    }

    setIsAnimating(true);
    const newMode = mode === 'standard' ? 'llm-enhanced' : 'standard';
    onChange(newMode);

    // Reset animation
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const getTooltipContent = () => {
    if (mode === 'standard') {
      return 'Basic text splitting at sentence boundaries';
    }
    return 'Intelligent parsing with semantic understanding';
  };

  return (
    <div className="parser-toggle-container">
      <label className="parser-toggle-label">
        <span className="toggle-text">Parser Mode:</span>
        <div className="toggle-wrapper">
          <button
            className={`toggle-switch ${mode} ${isAnimating ? 'animating' : ''} ${loading ? 'loading' : ''}`}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            aria-pressed={mode === 'llm-enhanced'}
            aria-label={`Parser mode: ${mode === 'standard' ? 'Standard' : 'LLM-Enhanced'}`}
            role="switch"
            tabIndex={0}
          >
            <div className="toggle-track">
              <span className="toggle-option standard-option">Standard</span>
              <span className="toggle-option llm-option">LLM-Enhanced</span>
              <div className="toggle-thumb" />
            </div>
          </button>

          {loading && (
            <div className="toggle-loading">
              <svg className="spinner" viewBox="0 0 24 24">
                <circle
                  className="spinner-circle"
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  strokeWidth="2"
                />
              </svg>
            </div>
          )}
        </div>
      </label>

      <button
        className="toggle-info"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label="Parser mode information"
        tabIndex={0}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H7v-2h2v2zm0-3H7V4h2v6z" />
        </svg>
      </button>

      {showTooltip && (
        <div className="parser-tooltip" role="tooltip">
          <div className="tooltip-content">{getTooltipContent()}</div>
          <div className="tooltip-arrow" />
        </div>
      )}
    </div>
  );
};

// Export with memo for performance
export default React.memo(ParserToggle);
