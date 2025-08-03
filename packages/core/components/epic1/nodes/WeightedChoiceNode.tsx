import React, { memo, useState, useEffect } from 'react';
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

/**
 * WeightedChoice node for Epic 1 - inline editing with weight sliders
 */
export const WeightedChoiceNode = memo((props: NodeProps<WeightedChoiceNodeData>) => {
  const [options, setOptions] = useState<WeightedOption[]>(props.data.options || []);

  // Normalize weights to ensure they sum to 100
  const normalizeWeights = (opts: WeightedOption[]): WeightedOption[] => {
    const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
    if (totalWeight === 0) return opts;
    
    return opts.map(opt => ({
      ...opt,
      weight: Math.round((opt.weight / totalWeight) * 100)
    }));
  };

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
    setOptions(normalizeWeights(newOptions));
  };

  // Add new option
  const addOption = () => {
    const newOptions = [...options, { text: '', weight: 50 }];
    setOptions(normalizeWeights(newOptions));
  };

  // Remove option
  const removeOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(normalizeWeights(newOptions));
    }
  };

  return (
    <BaseEditableNode
      {...props}
      className="weighted-choice"
      minWidth={280}
      minHeight={120}
      data={{
        ...props.data,
        options,
        onEdit: (value: string) => {
          // In edit mode, we save the options array
          props.data.onEdit?.(JSON.stringify(options));
        }
      }}
    >
      {({ isEditing, confirmEdit, cancelEdit }) => {
        if (isEditing) {
          return (
            <div 
              className="epic1-weighted-choice-editor"
            >
              <div className="epic1-node-type-label">Weighted Choice</div>
              <div 
                className="epic1-options-list nodrag nopan nowheel"
                onWheel={(e) => {
                  // Stop propagation to prevent canvas panning
                  e.stopPropagation();
                  // Allow default scrolling behavior
                }}
                onPointerDown={(e) => {
                  // Prevent dragging when clicking in the scroll area
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  // Also stop mouse down for better compatibility
                  e.stopPropagation();
                }}
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
                        onChange={(e) => {
                          updateOptionWeight(index, parseInt(e.target.value));
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        style={{ '--value': `${option.weight}%` } as React.CSSProperties}
                      />
                      <span className="epic1-weight-value">{option.weight}%</span>
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
              <div className="epic1-option-controls">
                <button
                  className="epic1-add-option nodrag"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
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
                      e.preventDefault();
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
                      e.preventDefault();
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

        return (
          <div className="epic1-weighted-choice-display">
            <div className="epic1-node-type-label">Weighted Choice</div>
            <div className="epic1-options-preview">
              {options.length === 0 ? (
                <span className="epic1-placeholder">Click to add options</span>
              ) : (
                options.map((option, index) => (
                  <div key={index} className="epic1-option-preview">
                    <span className="epic1-option-text-preview">{option.text || '(empty)'}</span>
                    <div className="epic1-weight-bar-container">
                      <div 
                        className="epic1-weight-bar"
                        style={{ width: `${option.weight}%` }}
                      />
                      <span className="epic1-weight-label">{option.weight}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      }}
    </BaseEditableNode>
  );
});

WeightedChoiceNode.displayName = 'WeightedChoiceNode';