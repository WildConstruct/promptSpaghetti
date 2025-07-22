import React, { useState, useEffect, useCallback } from 'react';
import { useUISettingsStore } from '../../stores/uiSettingsStore';

export interface WeightControlOption {
  id: string;
  text: string;
  weight: number;
  locked?: boolean;
}

export type WeightPreset = 'equal' | 'linear-decrease' | 'exponential' | 'bell-curve' | 'first-heavy' | 'last-heavy' | 'mars-focal' | 'historical-authentic' | 'scene-efficiency' | 'custom';

export interface WeightPresetPattern {
  id: WeightPreset;
  name: string;
  description: string;
  icon: string;
  calculate: (count: number) => number[];
}

export interface WeightControlSliderProps {
  options: WeightControlOption[];
  onOptionsChange: (options: WeightControlOption[]) => void;
  onPreviewRequest?: (options: WeightControlOption[]) => void;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  previewDebounceMs?: number;
  showPresets?: boolean;
  allowCustomPresets?: boolean;
}

// Define weight preset patterns
export const WEIGHT_PRESET_PATTERNS: WeightPresetPattern[] = [
  {
    id: 'equal',
    name: 'Equal',
    description: 'All options have equal weight',
    icon: '⚖️',
    calculate: (count: number) => new Array(count).fill(Math.floor(100 / count))
  },
  {
    id: 'linear-decrease',
    name: 'Linear Fade',
    description: 'First option is strongest, gradually decreases',
    icon: '📉',
    calculate: (count: number) => {
      const weights = [];
      const total = (count * (count + 1)) / 2; // Sum of 1+2+3+...+count
      for (let i = 0; i < count; i++) {
        weights.push(Math.round(((count - i) / total) * 100));
      }
      return weights;
    }
  },
  {
    id: 'exponential',
    name: 'Exponential',
    description: 'Dramatic decrease from first to last',
    icon: '📊',
    calculate: (count: number) => {
      const weights = [];
      let total = 0;
      for (let i = 0; i < count; i++) {
        const weight = Math.pow(2, count - i - 1);
        weights.push(weight);
        total += weight;
      }
      return weights.map(w => Math.round((w / total) * 100));
    }
  },
  {
    id: 'bell-curve',
    name: 'Bell Curve',
    description: 'Middle options are favored',
    icon: '🔔',
    calculate: (count: number) => {
      if (count < 3) return new Array(count).fill(Math.floor(100 / count));
      const weights = [];
      const center = (count - 1) / 2;
      let total = 0;
      for (let i = 0; i < count; i++) {
        const distance = Math.abs(i - center);
        const weight = Math.exp(-Math.pow(distance, 2) / 2);
        weights.push(weight);
        total += weight;
      }
      return weights.map(w => Math.round((w / total) * 100));
    }
  },
  {
    id: 'first-heavy',
    name: 'First Priority',
    description: 'First option gets 50%, others share remainder',
    icon: '🥇',
    calculate: (count: number) => {
      if (count === 1) return [100];
      const weights = [50];
      const remaining = 50;
      const perOther = Math.floor(remaining / (count - 1));
      for (let i = 1; i < count; i++) {
        weights.push(perOther);
      }
      return weights;
    }
  },
  {
    id: 'last-heavy',
    name: 'Last Priority',
    description: 'Last option gets 50%, others share remainder',
    icon: '🎯',
    calculate: (count: number) => {
      if (count === 1) return [100];
      const weights = [];
      const remaining = 50;
      const perOther = Math.floor(remaining / (count - 1));
      for (let i = 0; i < count - 1; i++) {
        weights.push(perOther);
      }
      weights.push(50);
      return weights;
    }
  },
  {
    id: 'mars-focal',
    name: 'MARS !FOCAL',
    description: 'Hollywood MARS framework: !FOCAL priority weighting for key elements',
    icon: '🎬',
    calculate: (count: number) => {
      if (count === 1) return [100];
      
      // MARS !FOCAL system: First item gets 60% (focal), rest distributed exponentially
      const weights = [];
      weights.push(60); // !FOCAL priority
      
      // Remaining 40% distributed exponentially for supporting elements
      const remaining = 40;
      let total = 0;
      const exponentialWeights = [];
      
      for (let i = 1; i < count; i++) {
        const weight = Math.pow(2, count - i);
        exponentialWeights.push(weight);
        total += weight;
      }
      
      // Normalize to remaining percentage
      exponentialWeights.forEach(w => {
        weights.push(Math.round((w / total) * remaining));
      });
      
      return weights;
    }
  },
  {
    id: 'historical-authentic',
    name: 'Historical Bias',
    description: 'Favors UTDG-imported authentic historical content over modern interpretations',
    icon: '🏛️',
    calculate: (count: number) => {
      if (count === 1) return [100];
      
      // Historical authenticity weighting: museum/UTDG sources get priority
      // Assume first options are more historically authentic
      const weights = [];
      let total = 0;
      
      for (let i = 0; i < count; i++) {
        // Authenticity score decreases with position
        // First item (most authentic): gets highest weight
        // Weight formula: (count - index + 2)^2 for stronger bias toward authentic sources
        const authenticityScore = Math.pow(count - i + 2, 1.8);
        weights.push(authenticityScore);
        total += authenticityScore;
      }
      
      // Normalize to percentages with stronger bias toward first items
      return weights.map(w => Math.round((w / total) * 100));
    }
  },
  {
    id: 'scene-efficiency',
    name: 'Scene Efficiency',
    description: 'Mid-ground extras favor low-variance for VFX efficiency',
    icon: '⚡',
    calculate: (count: number) => {
      if (count === 1) return [100];
      if (count === 2) return [70, 30];
      
      // Scene efficiency: favor middle items (background elements) with lower variance
      // for computational efficiency in crowd scenes
      const weights = [];
      const center = Math.floor(count / 2);
      let total = 0;
      
      for (let i = 0; i < count; i++) {
        let weight;
        if (i === center || i === center - 1) {
          // Middle items get highest weight for efficiency
          weight = 30;
        } else if (Math.abs(i - center) <= 1) {
          // Near-middle items get good weight
          weight = 20;
        } else {
          // Edge items get lower weight (hero/special elements)
          weight = 10;
        }
        weights.push(weight);
        total += weight;
      }
      
      return weights.map(w => Math.round((w / total) * 100));
    }
  }
];

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

  // Apply preset weight pattern
  const applyPreset = useCallback((presetId: WeightPreset) => {
    if (disabled || localOptions.length === 0) return;

    const preset = WEIGHT_PRESET_PATTERNS.find(p => p.id === presetId);
    if (!preset) return;

    const newWeights = preset.calculate(localOptions.length);
    
    // Ensure weights sum to 100 and handle any rounding errors
    const sum = newWeights.reduce((acc, w) => acc + w, 0);
    const adjustedWeights = newWeights.map(w => Math.round((w / sum) * 100));
    
    // Final adjustment to ensure exact 100 total
    const finalSum = adjustedWeights.reduce((acc, w) => acc + w, 0);
    if (finalSum !== 100 && adjustedWeights.length > 0) {
      adjustedWeights[0] += (100 - finalSum);
    }

    const updated = localOptions.map((option, index) => ({
      ...option,
      weight: option.locked ? option.weight : adjustedWeights[index] || 0
    }));

    setLocalOptions(updated);
    onOptionsChange(updated);
    triggerPreviewUpdate(updated);
  }, [disabled, localOptions, onOptionsChange, triggerPreviewUpdate]);

  // Equal distribution (now uses preset system)
  const equalizeWeights = useCallback(() => {
    applyPreset('equal');
  }, [applyPreset]);

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

      {/* MARS Framework Preset Patterns */}
      {showPresets && complexityLevel !== 'basic' && (
        <div style={{
          marginBottom: 16,
          padding: 12,
          background: '#2d3748',
          borderRadius: 6,
          border: '1px solid #4a5568'
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#e2e8f0',
            marginBottom: 8
          }}>
            MARS Framework Presets
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 6
          }}>
            {WEIGHT_PRESET_PATTERNS.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                disabled={disabled}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '8px 6px',
                  background: preset.id.includes('mars') || preset.id.includes('historical') || preset.id.includes('scene') 
                    ? '#4a5568' : '#374151', // Highlight MARS-specific presets
                  border: preset.id.includes('mars') || preset.id.includes('historical') || preset.id.includes('scene')
                    ? '1px solid #ff7c00' : '1px solid #4a5568', // Orange border for MARS presets
                  borderRadius: 4,
                  color: '#e2e8f0',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                  fontSize: 10,
                  transition: 'all 0.2s ease'
                }}
                title={preset.description}
                onMouseEnter={(e) => {
                  if (!disabled) {
                    e.currentTarget.style.background = preset.id.includes('mars') || preset.id.includes('historical') || preset.id.includes('scene')
                      ? '#5a6578' : '#4b5563';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = preset.id.includes('mars') || preset.id.includes('historical') || preset.id.includes('scene')
                    ? '#4a5568' : '#374151';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: 16, marginBottom: 2 }}>
                  {preset.icon}
                </div>
                <div style={{ 
                  fontWeight: 500,
                  textAlign: 'center',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}>
                  {preset.name}
                </div>
              </button>
            ))}
          </div>
          
          <div style={{
            fontSize: 9,
            color: '#a0aec0',
            marginTop: 8,
            lineHeight: 1.3
          }}>
            <strong>MARS Framework:</strong> Modular tagging system for VFX professionals. 
            !FOCAL = priority elements, Historical Bias = authentic UTDG content, 
            Scene Efficiency = optimized crowd generation.
          </div>
        </div>
      )}

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

      {/* Enhanced Adherence and Impact Analysis */}
      {complexityLevel !== 'basic' && (
        <div style={{ marginTop: 16 }}>
          {/* Basic Summary */}
          <div style={{
            padding: 8,
            background: '#2d3748',
            borderRadius: 4,
            fontSize: 11,
            color: '#a0aec0',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 12
          }}>
            <span>Total Weight: {getTotalWeight()}</span>
            <span>{localOptions.filter(o => o.locked).length} locked</span>
            <span>{showPreview ? '🔄 Real-time preview' : '⏸️ Preview paused'}</span>
          </div>

          {/* MARS Framework Impact Analysis */}
          <div style={{
            padding: 12,
            background: '#1a202c',
            border: '1px solid #ff7c00',
            borderRadius: 6,
            fontSize: 11
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 8,
              color: '#e2e8f0',
              fontSize: 12,
              fontWeight: 600
            }}>
              <span style={{ marginRight: 8 }}>🎬</span>
              MARS Framework Adherence Analysis
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Weight Distribution Analysis */}
              <div>
                <div style={{ color: '#a0aec0', marginBottom: 4, fontSize: 10, fontWeight: 500 }}>
                  Weight Distribution
                </div>
                <div style={{ fontSize: 10, color: '#e2e8f0', lineHeight: 1.4 }}>
                  {(() => {
                    const maxWeight = Math.max(...localOptions.map(o => o.weight));
                                        const variance = localOptions.reduce(
                                          (acc,
                                          o
                                        ) => acc + Math.pow(o.weight - (getTotalWeight() / localOptions.length), 2), 0) / localOptions.length;
                    
                    if (maxWeight > 50) {
                      return `🎯 High focus distribution (${(maxWeight/getTotalWeight() * 100).toFixed(0)}% on primary element)`;
                    } else if (variance < 100) {
                      return `⚖️ Balanced distribution (low variance: ${variance.toFixed(0)})`;
                    } else {
                      return `📊 Varied distribution (high variance: ${variance.toFixed(0)})`;
                    }
                  })()}
                </div>
              </div>

              {/* VFX Efficiency Score */}
              <div>
                <div style={{ color: '#a0aec0', marginBottom: 4, fontSize: 10, fontWeight: 500 }}>
                  VFX Efficiency Score
                </div>
                <div style={{ fontSize: 10, color: '#e2e8f0', lineHeight: 1.4 }}>
                  {(() => {
                    // Calculate efficiency based on variance and top-heavy distribution
                    const variance = localOptions.reduce(
                      (acc,
                      o
                    ) => acc + Math.pow(o.weight - (getTotalWeight() / localOptions.length), 2), 0) / localOptions.length;
                    const maxWeight = Math.max(...localOptions.map(o => o.weight));
                    const efficiency = Math.max(0, Math.min(100, 100 - (variance / 10) + (maxWeight > 40 ? 20 : 0)));
                    
                    const getEfficiencyColor = (score: number) => {
                      if (score > 80) return '#48bb78';
                      if (score > 60) return '#ed8936';
                      return '#f56565';
                    };

                    return (
                      <span style={{ color: getEfficiencyColor(efficiency) }}>
                        {efficiency.toFixed(0)}% {efficiency > 80 ? '🚀 Optimal' : efficiency > 60 ? '⚡ Good' : '⚠️ Inefficient'}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Historical Authenticity Indicator */}
              <div>
                <div style={{ color: '#a0aec0', marginBottom: 4, fontSize: 10, fontWeight: 500 }}>
                  Historical Authenticity
                </div>
                <div style={{ fontSize: 10, color: '#e2e8f0', lineHeight: 1.4 }}>
                  {(() => {
                    // Assume first options are more historically authentic
                    const topThreeWeight = localOptions.slice(0, Math.min(3, localOptions.length))
                      .reduce((acc, o) => acc + o.weight, 0);
                    const authenticity = (topThreeWeight / getTotalWeight()) * 100;
                    
                    if (authenticity > 70) {
                      return `🏛️ High authenticity bias (${authenticity.toFixed(0)}%)`;
                    } else if (authenticity > 50) {
                      return `📚 Moderate authenticity (${authenticity.toFixed(0)}%)`;
                    } else {
                      return `🎨 Creative interpretation (${authenticity.toFixed(0)}%)`;
                    }
                  })()}
                </div>
              </div>

              {/* Focal Priority Status */}
              <div>
                <div style={{ color: '#a0aec0', marginBottom: 4, fontSize: 10, fontWeight: 500 }}>
                  !FOCAL Priority Status
                </div>
                <div style={{ fontSize: 10, color: '#e2e8f0', lineHeight: 1.4 }}>
                  {(() => {
                    const topWeight = localOptions.length > 0 ? localOptions[0].weight : 0;
                    const topPercentage = (topWeight / getTotalWeight()) * 100;
                    
                    if (topPercentage > 50) {
                      return `🎬 !FOCAL active (${topPercentage.toFixed(0)}% priority)`;
                    } else if (topPercentage > 30) {
                      return `📽️ Moderate focus (${topPercentage.toFixed(0)}%)`;
                    } else {
                      return `🎭 Distributed focus (${topPercentage.toFixed(0)}%)`;
                    }
                  })()}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: 8,
              padding: 6,
              background: 'rgba(255, 124, 0, 0.1)',
              borderRadius: 3,
              fontSize: 9,
              color: '#ff7c00',
              lineHeight: 1.3
            }}>
              <strong>Impact Visualization:</strong> Weight patterns affect output probability distribution. 
              Higher efficiency = more predictable crowd generation. 
              Historical bias favors UTDG authenticity over creative interpretation.
            </div>
          </div>
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