import React, { memo, useState, useEffect, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';
import './WeightedChoiceNode.css';
import './VisualFeedbackEnhancements.css';

export interface WeightedOption {
  text: string;
  weight: number;
}

export interface WeightedChoiceNodeData extends EditableNodeData {
  options: WeightedOption[];
}

// Preset weight patterns
const WEIGHT_PRESETS = {
  equal: { icon: '=', title: 'Equal weights' },
  favorFirst: { icon: '↗', title: 'Favor first' },
  favorLast: { icon: '↘', title: 'Favor last' },
  rampUp: { icon: '📈', title: 'Ramp up' },
  rampDown: { icon: '📉', title: 'Ramp down' }
};

/**
 * @deprecated This component is deprecated. Use WeightedChoiceNode.tsx instead, 
 * which includes Epic 2 AI integrations (PopulateChoicesButton, OptimizeWeightsButton, InspirationMode).
 * 
 * Improved WeightedChoice node with raw weights and presets
 */
export const ImprovedWeightedChoiceNode = memo((props: NodeProps<WeightedChoiceNodeData>) => {
  const [options, setOptions] = useState<WeightedOption[]>(props.data.options || []);
  const [useRawWeights, setUseRawWeights] = useState(true); // Use raw weights by default

  // Calculate percentages for display
  const calculatePercentages = useCallback((opts: WeightedOption[]) => {
    const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
    if (totalWeight === 0) return opts.map(() => 0);
    return opts.map(opt => Math.round((opt.weight / totalWeight) * 100));
  }, []);

  // Apply preset pattern
  const applyPreset = useCallback((preset: string) => {
    const count = options.length;
    if (count === 0) return;

    let newWeights: number[] = [];
    
    switch (preset) {
      case 'equal':
        newWeights = Array(count).fill(50);
        break;
      case 'favorFirst':
        newWeights = [80, ...Array(count - 1).fill(20)];
        break;
      case 'favorLast':
        newWeights = [...Array(count - 1).fill(20), 80];
        break;
      case 'rampUp':
        const stepUp = 60 / (count - 1);
        newWeights = Array(count).fill(0).map((_, i) => Math.round(20 + stepUp * i));
        break;
      case 'rampDown':
        const stepDown = 60 / (count - 1);
        newWeights = Array(count).fill(0).map((_, i) => Math.round(80 - stepDown * i));
        break;
      default:
        return;
    }

    const newOptions = options.map((opt, i) => ({
      ...opt,
      weight: newWeights[i] || 50
    }));
    setOptions(newOptions);
  }, [options]);

  // Update option text
  const updateOptionText = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text };
    setOptions(newOptions);
  };

  // Update option weight
  const updateOptionWeight = (index: number, weight: number) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], weight };
    setOptions(newOptions);
  };

  // Add new option
  const addOption = () => {
    const newOptions = [...options, { text: '', weight: 50 }];
    setOptions(newOptions);
  };

  // Remove option
  const removeOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const percentages = calculatePercentages(options);
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);

  return (
    <BaseEditableNode
      {...props}
      className="weighted-choice"
      minWidth={320}
      minHeight={150}
      data={{
        ...props.data,
        options,
        onEdit: (value: string) => {
          props.data.onEdit?.(JSON.stringify(options));
        }
      }}
    >
      {({ isEditing, confirmEdit, cancelEdit }) => {
        if (isEditing) {
          return (
            <div className="epic1-weighted-choice-editor">
              <div className="epic1-node-type-label">Weighted Choice</div>
              
              {/* Weight Presets */}
              <div className="epic1-weight-presets">
                {Object.entries(WEIGHT_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    className="epic1-preset-btn nodrag"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyPreset(key);
                    }}
                    title={preset.title}
                  >
                    {preset.icon}
                  </button>
                ))}
                <div className="epic1-total-weight">
                  Total: {totalWeight}
                </div>
              </div>

              <div 
                className="epic1-options-list nodrag nopan nowheel"
                onWheel={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {options.map((option, index) => (
                  <div key={index} className="epic1-option-row">
                    <input
                      type="text"
                      className="epic1-option-text nodrag"
                      value={option.text}
                      onChange={(e) => updateOptionText(index, e.target.value)}
                      placeholder="Option text..."
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="epic1-weight-controls">
                      <input
                        type="range"
                        className="epic1-weight-slider nodrag"
                        min="0"
                        max="100"
                        value={option.weight}
                        onChange={(e) => updateOptionWeight(index, parseInt(e.target.value))}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{ '--value': `${option.weight}%` } as React.CSSProperties}
                      />
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-end',
                        minWidth: '45px'
                      }}>
                        <span className="epic1-weight-value" style={{ fontSize: '11px', color: '#f59e0b' }}>
                          {option.weight}
                        </span>
                        <span style={{ fontSize: '9px', color: '#60a5fa' }}>
                          {percentages[index]}%
                        </span>
                      </div>
                      {options.length > 1 && (
                        <button
                          className="epic1-remove-option nodrag"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOption(index);
                          }}
                          title="Remove option"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="epic1-weight-hints">
                Raw weights shown (orange) • Actual % shown (blue)
              </div>

              <div className="epic1-option-controls">
                <button
                  className="epic1-add-option nodrag"
                  onClick={(e) => {
                    e.stopPropagation();
                    addOption();
                  }}
                  type="button"
                >
                  + Add Option
                </button>
                <div className="epic1-edit-actions">
                  <button
                    className="epic1-confirm nodrag"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmEdit();
                    }}
                    type="button"
                  >
                    ✓
                  </button>
                  <button
                    className="epic1-cancel nodrag"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelEdit();
                    }}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // Display mode
        return (
          <div className="epic1-weighted-choice-display">
            <div className="epic1-node-type-label">Weighted Choice</div>
            <div className="epic1-options-preview">
              {options.map((option, index) => (
                <div key={index} className="epic1-option-preview">
                  <div className="epic1-option-text-preview">
                    {option.text || <span className="epic1-placeholder">Empty option</span>}
                  </div>
                  <div className="epic1-weight-bar-container">
                    <div 
                      className="epic1-weight-bar"
                      style={{ width: `${percentages[index]}%` }}
                    />
                    <div className="epic1-weight-label">
                      {percentages[index]}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    </BaseEditableNode>
  );
});

ImprovedWeightedChoiceNode.displayName = 'ImprovedWeightedChoiceNode';

export default ImprovedWeightedChoiceNode;