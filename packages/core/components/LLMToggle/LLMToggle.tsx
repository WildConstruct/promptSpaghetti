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
    gap: '12px',
    position: 'relative' as const
  },
  // Sliding switch styles
  switch: {
    position: 'relative' as const,
    width: '52px',
    height: '28px',
    background: '#e5e7eb',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid transparent'
  },
  switchActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderColor: '#667eea'
  },
  switchDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  switchKnob: {
    position: 'absolute' as const,
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    background: '#fff',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  switchKnobActive: {
    left: '26px'
  },
  switchIcon: {
    width: '12px',
    height: '12px',
    color: '#6b7280'
  },
  switchIconActive: {
    color: '#667eea'
  },
  // Labels
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '500'
  },
  label: {
    color: '#6b7280',
    transition: 'color 0.3s ease'
  },
  labelActive: {
    color: '#667eea'
  },
  // Config button
  configButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#6b7280'
  },
  configButtonHover: {
    borderColor: '#667eea',
    color: '#667eea',
    transform: 'scale(1.05)'
  },
  // Status bar
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: '#fef3c7',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#92400e',
    border: '1px solid #f59e0b'
  },
  statusIcon: {
    width: '16px',
    height: '16px',
    color: '#f59e0b'
  },
  statusLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
    cursor: 'pointer'
  },
  // Tooltip
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
  // Activity indicator
  indicator: {
    position: 'absolute' as const,
    top: '-2px',
    right: '-2px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    animation: 'pulse 2s infinite'
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

  const getSwitchIcon = () => {
    if (mode === 'llm-enhanced') {
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          style={styles.switchIconActive}
        >
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
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="none"
        style={styles.switchIcon}
      >
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
    ...styles.switch,
    ...(mode === 'llm-enhanced' ? styles.switchActive : {}),
    ...(!isEnabled ? styles.switchDisabled : {})
  };

  const knobStyle = {
    ...styles.switchKnob,
    ...(mode === 'llm-enhanced' ? styles.switchKnobActive : {})
  };

  return (
    <div style={styles.container} className={className}>
      {/* Sliding Switch */}
      <div style={styles.labelContainer}>
        <span
          style={{
            ...styles.label,
            ...(mode === 'standard' ? styles.labelActive : {})
          }}
        >
          Standard
        </span>
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
          <div style={knobStyle}>{getSwitchIcon()}</div>
        </button>
        <span
          style={{
            ...styles.label,
            ...(mode === 'llm-enhanced' ? styles.labelActive : {})
          }}
        >
          AI-Enhanced
        </span>
        {mode === 'llm-enhanced' && <span style={styles.indicator}></span>}
      </div>

      {/* Config Button */}
      {onConfigClick && (
        <button
          style={styles.configButton}
          onClick={onConfigClick}
          aria-label="Configure LLM settings"
          title="Configure AI settings"
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.color = '#667eea';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.color = '#6b7280';
            e.currentTarget.style.transform = 'scale(1)';
          }}
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

      {/* Tooltip */}
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

      {/* Status Bar with Proper Icon */}
      {!isEnabled && (
        <div style={styles.statusBar}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            style={styles.statusIcon}
          >
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
