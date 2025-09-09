import React, { useState, useCallback, useEffect } from 'react';
import { getLLMService } from '../../services/SimpleLLMService';

export interface LLMToggleProps {
  onModeChange?: (mode: 'standard' | 'llm-enhanced') => void;
  onConfigClick?: () => void;
  className?: string;
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative' as const
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    position: 'relative' as const
  },
  toggleButtonLLM: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderColor: '#667eea',
    color: '#fff'
  },
  toggleButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  indicator: {
    position: 'absolute' as const,
    top: '-4px',
    right: '-4px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#4ade80',
    animation: 'pulse 2s infinite'
  },
  configButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  tooltip: {
    position: 'absolute' as const,
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '8px',
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.9)',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '13px',
    whiteSpace: 'nowrap' as const,
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease'
  },
  tooltipArrow: {
    position: 'absolute' as const,
    bottom: '-4px',
    left: '50%',
    transform: 'translateX(-50%) rotate(45deg)',
    width: '8px',
    height: '8px',
    background: 'rgba(0, 0, 0, 0.9)'
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: '#fff3cd',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#856404'
  },
  statusLink: {
    color: '#0066cc',
    textDecoration: 'none',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

export const LLMToggle: React.FC<LLMToggleProps> = ({
  onModeChange,
  onConfigClick,
  className = ''
}) => {
  const [mode, setMode] = useState<'standard' | 'llm-enhanced'>('standard');
  const [isEnabled, setIsEnabled] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  const llmService = getLLMService();

  useEffect(() => {
    // Check if LLM service is available
    setIsEnabled(llmService.isEnabled());
  }, []);

  const handleToggle = useCallback(() => {
    const newMode = mode === 'standard' ? 'llm-enhanced' : 'standard';
    setMode(newMode);
    onModeChange?.(newMode);

    // Show cost estimate briefly when enabling LLM mode
    if (newMode === 'llm-enhanced') {
      const cost = llmService.estimateCost('sample prompt');
      setEstimatedCost(cost);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }
  }, [mode, onModeChange, llmService]);

  const getModeIcon = () => {
    if (mode === 'llm-enhanced') {
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 2L10 6L14 7L11 10L12 14L8 12L4 14L5 10L2 7L6 6L8 2Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      );
    }
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M8 5V8L10 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  const buttonStyle = {
    ...styles.toggleButton,
    ...(mode === 'llm-enhanced' ? styles.toggleButtonLLM : {}),
    ...(!isEnabled ? styles.toggleButtonDisabled : {})
  };

  return (
    <div style={styles.container} className={className}>
      <button
        style={buttonStyle}
        onClick={handleToggle}
        disabled={!isEnabled}
        aria-label={`Parser mode: ${mode}`}
        title={
          isEnabled
            ? `Switch to ${mode === 'standard' ? 'AI-Enhanced' : 'Standard'} parser`
            : 'AI parser not configured'
        }
      >
        <span style={styles.icon}>{getModeIcon()}</span>
        <span>{mode === 'standard' ? 'Standard' : 'AI-Enhanced'}</span>
        {mode === 'llm-enhanced' && <span style={styles.indicator}></span>}
      </button>

      {onConfigClick && (
        <button
          style={styles.configButton}
          onClick={onConfigClick}
          aria-label="Configure LLM settings"
          title="Configure AI settings"
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

      {showTooltip && estimatedCost > 0 && (
        <div style={styles.tooltip}>
          <div style={styles.tooltipArrow}></div>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              AI Mode Active
            </div>
            <div>
              Enhanced parsing with AI assistance
              {estimatedCost > 0 && (
                <div
                  style={{ marginTop: '4px', fontSize: '12px', opacity: 0.9 }}
                >
                  Est. cost: ${estimatedCost.toFixed(6)}/parse
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isEnabled && (
        <div style={styles.statusBar}>
          <span>ℹ️</span>
          <span>AI parser not configured</span>
          {onConfigClick && (
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                onConfigClick();
              }}
              style={styles.statusLink}
            >
              Configure
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default LLMToggle;
