import React, { memo, useState, useEffect, useCallback } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';
import './WeightedChoiceNode.css';
import './BranchingWeightedChoice.css';
import './VisualFeedbackEnhancements.css';

export interface WeightedOption {
  text: string;
  weight: number;
  hasBranch?: boolean;
}

export interface BranchingWeightedChoiceNodeData extends EditableNodeData {
  options: WeightedOption[];
}

// Drag handle icon component
const DragHandleIcon = () => (
  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.4"/>
    <circle cx="6" cy="2" r="1" fill="currentColor" opacity="0.4"/>
    <circle cx="2" cy="7" r="1" fill="currentColor" opacity="0.4"/>
    <circle cx="6" cy="7" r="1" fill="currentColor" opacity="0.4"/>
    <circle cx="2" cy="12" r="1" fill="currentColor" opacity="0.4"/>
    <circle cx="6" cy="12" r="1" fill="currentColor" opacity="0.4"/>
  </svg>
);

// Preset weight patterns
const WEIGHT_PRESETS = {
  equal: { icon: '=', title: 'Equal weights' },
  favorFirst: { icon: '↗', title: 'Favor first' },
  favorLast: { icon: '↘', title: 'Favor last' },
  rampUp: { icon: '📈', title: 'Ramp up' },
  rampDown: { icon: '📉', title: 'Ramp down' }
};

/**
 * Branching WeightedChoice node with conditional outputs per option
 */
export const BranchingWeightedChoiceNode = memo((props: NodeProps<BranchingWeightedChoiceNodeData>) => {
  const [options, setOptions] = useState<WeightedOption[]>(props.data.options || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Check if any option has branching enabled
  const hasBranching = options.some(opt => opt.hasBranch);

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

  // Toggle branch output for an option
  const toggleBranch = (index: number) => {
    const newOptions = [...options];
    newOptions[index] = { 
      ...newOptions[index], 
      hasBranch: !newOptions[index].hasBranch 
    };
    setOptions(newOptions);
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
    setOptions(newOptions);
  };

  // Add new option
  const addOption = () => {
    const newOptions = [...options, { text: '', weight: 50, hasBranch: false }];
    setOptions(newOptions);
  };

  // Remove option
  const removeOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOptions = [...options];
    const draggedOption = newOptions[draggedIndex];
    newOptions.splice(draggedIndex, 1);
    newOptions.splice(index, 0, draggedOption);
    
    setOptions(newOptions);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const percentages = calculatePercentages(options);
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);

  return (
    <BaseEditableNode
      {...props}
      className="weighted-choice branching"
      minWidth={400}  // Wider node
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
            <div className="epic1-weighted-choice-editor branching">
              {/* Main output handle at top when branching is enabled */}
              {hasBranching && (
                <Handle
                  type="source"
                  position={Position.Top}
                  id="main-output"
                  className="epic1-handle epic1-handle-top main-output"
                  style={{ top: -8, left: '50%', transform: 'translateX(-50%)' }}
                />
              )}

              <div className="epic1-node-type-label">Weighted Choice (Branching)</div>
              
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
                className="epic1-options-list branching nodrag nopan nowheel"
                onWheel={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`epic1-option-row branching ${draggedIndex === index ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Drag handle */}
                    <div className="epic1-drag-handle">
                      <DragHandleIcon />
                    </div>

                    <div className="epic1-option-content">
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
                        
                        {/* Branch toggle button */}
                        <button
                          className={`epic1-branch-toggle nodrag ${option.hasBranch ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBranch(index);
                          }}
                          title="Toggle branch output"
                        >
                          ⚡
                        </button>

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

                    {/* Branch output handle */}
                    {option.hasBranch && (
                      <Handle
                        type="source"
                        position={Position.Right}
                        id={`branch-${index}`}
                        className="epic1-handle epic1-handle-right branch-output"
                        style={{ 
                          top: '50%', 
                          right: -8, 
                          transform: 'translateY(-50%)',
                          background: '#f59e0b'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="epic1-weight-hints">
                Drag to reorder • ⚡ = branch output • Raw weights (orange) • Actual % (blue)
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

              {/* Main output handle at right when no branching */}
              {!hasBranching && (
                <Handle
                  type="source"
                  position={Position.Right}
                  id="main-output"
                  className="epic1-handle epic1-handle-right main-output"
                />
              )}
            </div>
          );
        }

        // Display mode
        return (
          <div className="epic1-weighted-choice-display branching">
            {/* Main output handle positioning for display mode */}
            {hasBranching && (
              <Handle
                type="source"
                position={Position.Top}
                id="main-output"
                className="epic1-handle epic1-handle-top main-output"
                style={{ top: -8, left: '50%', transform: 'translateX(-50%)' }}
              />
            )}

            <div className="epic1-node-type-label">
              Weighted Choice {hasBranching && '(Branching)'}
            </div>
            <div className="epic1-options-preview">
              {options.map((option, index) => (
                <div key={index} className="epic1-option-preview branching">
                  <div className="epic1-option-text-preview">
                    {option.text || <span className="epic1-placeholder">Empty option</span>}
                    {option.hasBranch && <span className="branch-indicator">⚡</span>}
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
                  
                  {/* Branch output handle in display mode */}
                  {option.hasBranch && (
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`branch-${index}`}
                      className="epic1-handle epic1-handle-right branch-output"
                      style={{ 
                        top: `${20 + index * 50}px`, 
                        right: -8,
                        background: '#f59e0b'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Main output handle at right when no branching in display mode */}
            {!hasBranching && (
              <Handle
                type="source"
                position={Position.Right}
                id="main-output"
                className="epic1-handle epic1-handle-right main-output"
              />
            )}
          </div>
        );
      }}
    </BaseEditableNode>
  );
});

BranchingWeightedChoiceNode.displayName = 'BranchingWeightedChoiceNode';

export default BranchingWeightedChoiceNode;