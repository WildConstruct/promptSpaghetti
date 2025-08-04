/**
 * Raw Weight Control Component
 * Uses raw weight values (0-100) with live percentage preview
 * More intuitive than normalized weights
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ImprovedWeightPresets } from './ImprovedWeightPresets';

export interface WeightOption {
  id: string;
  text: string;
  weight: number;
  locked?: boolean;
}

interface RawWeightControlProps {
  options: WeightOption[];
  onOptionsChange: (options: WeightOption[]) => void;
  showPresets?: boolean;
  compactPresets?: boolean;
  minWeight?: number;
  maxWeight?: number;
  className?: string;
}

export const RawWeightControl: React.FC<RawWeightControlProps> = ({
  options,
  onOptionsChange,
  showPresets = true,
  compactPresets = false,
  minWeight = 0,
  maxWeight = 100,
  className = ''
}) => {
  const [focusedOption, setFocusedOption] = useState<string | null>(null);

  // Calculate total weight and percentages
  const { totalWeight, percentages } = useMemo(() => {
    const total = options.reduce((sum, opt) => sum + opt.weight, 0);
    const percs = options.map(opt => 
      total > 0 ? ((opt.weight / total) * 100).toFixed(1) : '0.0'
    );
    return { totalWeight: total, percentages: percs };
  }, [options]);

  const handleWeightChange = useCallback((optionId: string, newWeight: number) => {
    const clampedWeight = Math.max(minWeight, Math.min(maxWeight, newWeight));
    const updatedOptions = options.map(opt =>
      opt.id === optionId && !opt.locked 
        ? { ...opt, weight: clampedWeight }
        : opt
    );
    onOptionsChange(updatedOptions);
  }, [options, onOptionsChange, minWeight, maxWeight]);

  const handleTextChange = useCallback((optionId: string, newText: string) => {
    const updatedOptions = options.map(opt =>
      opt.id === optionId ? { ...opt, text: newText } : opt
    );
    onOptionsChange(updatedOptions);
  }, [options, onOptionsChange]);

  const handlePresetApply = useCallback((weights: number[]) => {
    const updatedOptions = options.map((opt, index) => ({
      ...opt,
      weight: opt.locked ? opt.weight : (weights[index] || minWeight)
    }));
    onOptionsChange(updatedOptions);
  }, [options, onOptionsChange, minWeight]);

  const handleAddOption = useCallback(() => {
    const newOption: WeightOption = {
      id: `option_${Date.now()}`,
      text: `Option ${options.length + 1}`,
      weight: 50
    };
    onOptionsChange([...options, newOption]);
  }, [options, onOptionsChange]);

  const handleRemoveOption = useCallback((optionId: string) => {
    if (options.length <= 1) return;
    const updatedOptions = options.filter(opt => opt.id !== optionId);
    onOptionsChange(updatedOptions);
  }, [options, onOptionsChange]);

  const handleToggleLock = useCallback((optionId: string) => {
    const updatedOptions = options.map(opt =>
      opt.id === optionId ? { ...opt, locked: !opt.locked } : opt
    );
    onOptionsChange(updatedOptions);
  }, [options, onOptionsChange]);

  if (options.length === 0) {
    return (
      <div className={`raw-weight-control empty ${className}`} style={{
        padding: '20px',
        background: '#2d3748',
        borderRadius: '8px',
        color: '#9ca3af',
        textAlign: 'center'
      }}>
        <p>No options to weight.</p>
        <button
          onClick={handleAddOption}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: '#4299e1',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Add First Option
        </button>
      </div>
    );
  }

  return (
    <div className={`raw-weight-control ${className}`} style={{
      background: '#2d3748',
      borderRadius: '8px',
      padding: '16px',
      color: '#e2e8f0'
    }}>
      {/* Header with total weight info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
          Weight Controls
        </h3>
        <div style={{
          fontSize: '12px',
          color: '#9ca3af',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <span>Total: {totalWeight}</span>
          <button
            onClick={handleAddOption}
            style={{
              padding: '4px 8px',
              background: '#4299e1',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            + Add Option
          </button>
        </div>
      </div>

      {/* Preset buttons */}
      {showPresets && (
        <div style={{ marginBottom: '16px' }}>
          <ImprovedWeightPresets
            options={options}
            onApplyPreset={handlePresetApply}
            compact={compactPresets}
          />
        </div>
      )}

      {/* Weight control list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {options.map((option, index) => (
          <div
            key={option.id}
            style={{
              padding: '12px',
              background: focusedOption === option.id ? '#374151' : '#1f2937',
              borderRadius: '6px',
              border: `1px solid ${option.locked ? '#f59e0b' : '#374151'}`,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={() => setFocusedOption(option.id)}
            onMouseLeave={() => setFocusedOption(null)}
          >
            {/* Option header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '10px',
                color: '#6b7280',
                minWidth: '20px'
              }}>
                #{index + 1}
              </span>
              
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleTextChange(option.id, e.target.value)}
                style={{
                  flex: 1,
                  background: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  color: '#e5e7eb',
                  fontSize: '12px'
                }}
                placeholder="Option text..."
              />

              <button
                onClick={() => handleToggleLock(option.id)}
                title={option.locked ? 'Unlock weight' : 'Lock weight'}
                style={{
                  padding: '4px 8px',
                  background: option.locked ? '#f59e0b' : '#4b5563',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {option.locked ? '🔒' : '🔓'}
              </button>

              {options.length > 1 && (
                <button
                  onClick={() => handleRemoveOption(option.id)}
                  title="Remove option"
                  style={{
                    padding: '4px 8px',
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Weight slider and value */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {/* Raw weight input */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                minWidth: '80px'
              }}>
                <input
                  type="number"
                  value={option.weight}
                  onChange={(e) => handleWeightChange(option.id, Number(e.target.value))}
                  disabled={option.locked}
                  min={minWeight}
                  max={maxWeight}
                  style={{
                    width: '60px',
                    background: option.locked ? '#374151' : '#4b5563',
                    border: '1px solid #6b7280',
                    borderRadius: '4px',
                    padding: '4px 6px',
                    color: option.locked ? '#9ca3af' : '#e5e7eb',
                    fontSize: '12px',
                    textAlign: 'right'
                  }}
                />
                <span style={{ fontSize: '10px', color: '#6b7280' }}>pts</span>
              </div>

              {/* Slider */}
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="range"
                  min={minWeight}
                  max={maxWeight}
                  value={option.weight}
                  onChange={(e) => handleWeightChange(option.id, Number(e.target.value))}
                  disabled={option.locked}
                  style={{
                    width: '100%',
                    height: '6px',
                    background: `linear-gradient(to right, #4299e1 0%, #4299e1 ${(option.weight / maxWeight) * 100}%, #374151 ${(option.weight / maxWeight) * 100}%, #374151 100%)`,
                    borderRadius: '3px',
                    outline: 'none',
                    opacity: option.locked ? 0.5 : 1,
                    cursor: option.locked ? 'not-allowed' : 'pointer'
                  }}
                />
              </div>

              {/* Percentage display */}
              <div style={{
                minWidth: '60px',
                textAlign: 'right',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '2px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#60a5fa'
                }}>
                  {percentages[index]}%
                </span>
                <span style={{
                  fontSize: '9px',
                  color: '#6b7280'
                }}>
                  actual
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info message */}
      <div style={{
        marginTop: '12px',
        padding: '8px',
        background: '#1f2937',
        borderRadius: '4px',
        fontSize: '10px',
        color: '#9ca3af',
        borderLeft: '3px solid #60a5fa'
      }}>
        <strong>Tip:</strong> Set weights based on relative importance (0-100). 
        The actual percentages are calculated automatically and shown in blue.
      </div>
    </div>
  );
};

export default RawWeightControl;