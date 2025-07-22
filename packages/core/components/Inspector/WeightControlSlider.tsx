import React, { useState, useEffect, useCallback } from 'react';
import { useUISettingsStore } from '../../stores/uiSettingsStore';

export interface WeightControlOption {
  id: string;
  text: string;
  weight: number;
  locked?: boolean;
}

export interface WeightControlSliderProps {
  options: WeightControlOption[];
  onOptionsChange: (options: WeightControlOption[]) => void;
  onPreviewRequest?: (options: WeightControlOption[]) => void;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  previewDebounceMs?: number;
}

export   const [isDragging, setIsDragging] = useState<string | null>(null);
  const [previewTimeout, setPreviewTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const { complexityLevel, shouldShowTechnicalFields } = useUISettingsStore();

  // Update local state when props change
  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  // Debounced preview update
  const triggerPreviewUpdate = useCallback((newOptions: WeightControlOption[]) => {
    if (!onPreviewRequest || !showPreview) return;

    // Clear existing timeout
    if (previewTimeout) {
      clearTimeout(previewTimeout);
    }

    // Set new timeout for debounced update
    const timeout = setTimeout(() => {
      onPreviewRequest(newOptions);
    }, previewDebounceMs);
    
    setPreviewTimeout(timeout);
  }, [onPreviewRequest, showPreview, previewDebounceMs, previewTimeout]);

  // Handle weight adjustment
  const handleWeightChange = useCallback((optionId: string, newWeight: number) => {
    if (disabled) return;

    const updatedOptions = localOptions.map(option =>
      option.id === optionId && !option.locked
        ? { ...option, weight: Math.max(0, Math.min(100, newWeight)) }
        : option
    );

    setLocalOptions(updatedOptions);
    onOptionsChange(updatedOptions);
    
    // Trigger real-time preview update
    triggerPreviewUpdate(updatedOptions);
  }, [localOptions, disabled, onOptionsChange, triggerPreviewUpdate]);

  // Handle slider drag
  const handleSliderDrag = useCallback((optionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = parseInt(event.target.value);
    handleWeightChange(optionId, newWeight);
  }, [handleWeightChange]);

  // Handle direct input
  const handleDirectInput = useCallback((optionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const newWeight = parseInt(value) || 0;
    handleWeightChange(optionId, newWeight);
  }, [handleWeightChange]);

  // Get visual representation of weight distribution
  const getTotalWeight = () => localOptions.reduce((sum, option) => sum + option.weight, 0);
  const getPercentage = (weight: number) => {
    const total = getTotalWeight();
    return total > 0 ? (weight / total * 100) : 0;
  };

  // Auto-normalize weights if needed
  const normalizeWeights = useCallback(() => {
    const total = getTotalWeight();
    if (total === 0) return;

    const normalized = localOptions.map(option => ({
      ...option,
      weight: Math.round((option.weight / total) * 100)
    }));

    setLocalOptions(normalized);
    onOptionsChange(normalized);
    triggerPreviewUpdate(normalized);
  }, [localOptions, onOptionsChange, triggerPreviewUpdate]);

  // Equal distribution
  const equalizeWeights = useCallback(() => {
    if (disabled || localOptions.length === 0) return;

    const equalWeight = Math.floor(100 / localOptions.length);
    const remainder = 100 % localOptions.length;

    const equalized = localOptions.map((option, index) => ({
      ...option,
      weight: option.locked ? option.weight : (equalWeight + (index < remainder ? 1 : 0))
    }));

    setLocalOptions(equalized);
    onOptionsChange(equalized);
    triggerPreviewUpdate(equalized);
  }, [disabled, localOptions, onOptionsChange, triggerPreviewUpdate]);

  // Lock/unlock option
  const toggleLock = useCallback((optionId: string) => {
    const updated = localOptions.map(option =>
      option.id === optionId
        ? { ...option, locked: !option.locked }
        : option
    );
    
    setLocalOptions(updated);
    onOptionsChange(updated);
  }, [localOptions, onOptionsChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (previewTimeout) {
        clearTimeout(previewTimeout);
      }
    };
  }, [previewTimeout]);

  if (localOptions.length === 0) {
    return (
      <div className={`weight-control-slider ${className}`} style={{
        padding: 16,
        background: '#2d3748',
        border: '1px dashed #4a5568',
        borderRadius: 6,
        textAlign: 'center',
        color: '#a0aec0',
        fontStyle: 'italic'
      }}>
        No options to weight. Add some choices first.
      </div>
    );
  }

  return (
    <div className={`weight-control-slider ${className}`} style={{
      background: '#1a202c',
      border: '1px solid #4a5568',
      borderRadius: 8,
      padding: 16
    }}>
      {/* Header with controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#e2e8f0'
        }}>
          Weight Controls
          {complexityLevel === 'basic' && (
            <span style={{ fontSize: 12, color: '#a0aec0', marginLeft: 8 }}>
              Drag sliders to adjust probability
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={equalizeWeights}
            disabled={disabled}
            style={{
              padding: '4px 8px',
              fontSize: 11,
              background: '#4a5568',
              border: 'none',
              borderRadius: 4,
              color: '#e2e8f0',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1
            }}
            title="Distribute weights equally"
          >
            ⚖️ Equal
          </button>
          
          {shouldShowTechnicalFields() && (
            <button
              onClick={normalizeWeights}
              disabled={disabled}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                background: '#4a5568',
                border: 'none',
                borderRadius: 4,
                color: '#e2e8f0',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1
              }}
              title="Normalize weights to 100%"
            >
              💯 Normalize
            </button>
          )}
        </div>
      </div>

      {/* Weight distribution visualization */}
      <div style={{
        height: 8,
        background: '#2d3748',
        borderRadius: 4,
        marginBottom: 16,
        overflow: 'hidden',
        display: 'flex'
      }}>
        {localOptions.map((option, index) => {
          const percentage = getPercentage(option.weight);
          return (
            <div
              key={option.id}
              style={{
                width: `${percentage}%`,
                background: getOptionColor(index),
                height: '100%',
                transition: 'width 0.3s ease'
              }}
              title={`${option.text}: ${percentage.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Individual option controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {localOptions.map((option, index) => {
          const percentage = getPercentage(option.weight);
          
          return (
            <div
              key={option.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 8,
                background: isDragging === option.id ? '#2d3748' : 'transparent',
                borderRadius: 4,
                transition: 'background 0.2s ease'
              }}
            >
              {/* Color indicator */}
              <div
                style={{
                  width: 16,
                  height: 16,
                  background: getOptionColor(index),
                  borderRadius: 3,
                  flexShrink: 0
                }}
              />

              {/* Option text */}
              <div style={{
                flex: 1,
                minWidth: 0,
                fontSize: 13,
                color: '#e2e8f0'
              }}>
                <div style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {option.text}
                </div>
                
                {complexityLevel !== 'basic' && (
                  <div style={{
                    fontSize: 11,
                    color: '#a0aec0',
                    marginTop: 2
                  }}>
                    {percentage.toFixed(1)}% probability
                  </div>
                )}
              </div>

              {/* Weight slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={option.weight}
                onChange={(e) => handleSliderDrag(option.id, e)}
                onMouseDown={() => setIsDragging(option.id)}
                onMouseUp={() => setIsDragging(null)}
                disabled={disabled || option.locked}
                style={{
                  width: 120,
                  cursor: disabled || option.locked ? 'not-allowed' : 'pointer',
                  opacity: disabled || option.locked ? 0.5 : 1
                }}
              />

              {/* Weight input (advanced/debug only) */}
              {shouldShowTechnicalFields() && (
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={option.weight}
                  onChange={(e) => handleDirectInput(option.id, e)}
                  disabled={disabled || option.locked}
                  style={{
                    width: 50,
                    padding: '2px 4px',
                    fontSize: 11,
                    background: '#2d3748',
                    border: '1px solid #4a5568',
                    borderRadius: 3,
                    color: '#e2e8f0',
                    textAlign: 'center'
                  }}
                />
              )}

              {/* Lock button (advanced/debug only) */}
              {shouldShowTechnicalFields() && (
                <button
                  onClick={() => toggleLock(option.id)}
                  disabled={disabled}
                  style={{
                    padding: 4,
                    background: 'none',
                    border: 'none',
                    fontSize: 12,
                    color: option.locked ? '#f6ad55' : '#a0aec0',
                    cursor: disabled ? 'not-allowed' : 'pointer'
                  }}
                  title={option.locked ? 'Unlock weight' : 'Lock weight'}
                >
                  {option.locked ? '🔒' : '🔓'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary info */}
      {complexityLevel !== 'basic' && (
        <div style={{
          marginTop: 16,
          padding: 8,
          background: '#2d3748',
          borderRadius: 4,
          fontSize: 11,
          color: '#a0aec0',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Total Weight: {getTotalWeight()}</span>
          <span>{localOptions.filter(o => o.locked).length} locked</span>
          <span>{showPreview ? '🔄 Real-time preview' : '⏸️ Preview paused'}</span>
        </div>
      )}
    </div>
  );
};

// Helper function to get consistent colors for options
const getOptionColor = (index: number): string => {
  const colors = [
    '#4299e1', // Blue
    '#48bb78', // Green
    '#ed8936', // Orange
    '#9f7aea', // Purple
    '#38b2ac', // Teal
    '#ec4899', // Pink
    '#ecc94b', // Yellow
    '#f56565', // Red
    '#90cdf4', // Light blue
    '#68d391'  // Light green
  ];
  
  return colors[index % colors.length];
};

// Export utility function for integrating with existing node editors
export 
  const handleOptionsChange = useCallback((newOptions: WeightControlOption[]) => {
    setOptions(newOptions);
    onWeightChange?.(newOptions);
  }, [onWeightChange]);

  const addOption = useCallback((text: string, weight: number = 10) => {
    const newOption: WeightControlOption = {
      id: `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      weight
    };
    
    const newOptions = [...options, newOption];
    handleOptionsChange(newOptions);
  }, [options, handleOptionsChange]);

  const removeOption = useCallback((optionId: string) => {
    const newOptions = options.filter(o => o.id !== optionId);
    handleOptionsChange(newOptions);
  }, [options, handleOptionsChange]);

  const updateOptionText = useCallback((optionId: string, newText: string) => {
    const newOptions = options.map(o =>
      o.id === optionId ? { ...o, text: newText } : o
    );
    handleOptionsChange(newOptions);
  }, [options, handleOptionsChange]);

  return {
    options,
    handleOptionsChange,
    addOption,
    removeOption,
    updateOptionText
  };
};