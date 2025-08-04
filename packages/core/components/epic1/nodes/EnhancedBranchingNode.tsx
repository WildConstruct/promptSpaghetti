import React, { memo, useState, useCallback } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';
import './WeightedChoiceNode.css';
import './EnhancedBranching.css';

export interface WeightedOption {
  text: string;
  weight: number;
  hasBranch?: boolean;
}

export interface EnhancedBranchingNodeData extends EditableNodeData {
  options: WeightedOption[];
  title?: string;
}

// Brighter drag handle icon
const DragHandleIcon = () => (
  <svg width="6" height="12" viewBox="0 0 6 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="1.5" cy="1.5" r="1" fill="currentColor" opacity="0.6"/>
    <circle cx="4.5" cy="1.5" r="1" fill="currentColor" opacity="0.6"/>
    <circle cx="1.5" cy="6" r="1" fill="currentColor" opacity="0.6"/>
    <circle cx="4.5" cy="6" r="1" fill="currentColor" opacity="0.6"/>
    <circle cx="1.5" cy="10.5" r="1" fill="currentColor" opacity="0.6"/>
    <circle cx="4.5" cy="10.5" r="1" fill="currentColor" opacity="0.6"/>
  </svg>
);

// Simplified radio dial component
const RadioDial = ({ value, onChange, percentage, disabled = false }: { 
  value: number; 
  onChange: (val: number) => void;
  percentage: number;
  disabled?: boolean;
}) => {
  const angle = (value / 100) * 240 - 120; // -120 to 120 degrees for 3/4 circle
  
  const handleMouseDown = (e: React.MouseEvent<SVGElement>) => {
    if (disabled) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const updateValue = (clientX: number, clientY: number) => {
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Convert to 0-240 degree range (-120 to 120)
      angle = angle + 120;
      if (angle < 0) angle = 0;
      if (angle > 240) angle = 240;
      
      const newValue = Math.round((angle / 240) * 100);
      onChange(newValue);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX, e.clientY);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    updateValue(e.clientX, e.clientY);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  return (
    <svg 
      width="44" 
      height="44" 
      viewBox="0 0 44 44" 
      className="radio-dial-simple"
      onMouseDown={handleMouseDown}
      style={{ cursor: disabled ? 'default' : 'pointer' }}
    >
      {/* Background circle */}
      <circle 
        cx="22" 
        cy="22" 
        r="20" 
        fill="#1a1a1a" 
        stroke="rgba(255,255,255,0.1)" 
        strokeWidth="2"
      />
      
      {/* Background arc track */}
      <path
        d="M 6 30 A 16 16 0 1 1 38 30"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Filled arc based on value */}
      <path
        d="M 6 30 A 16 16 0 1 1 38 30"
        stroke="#22d3ee"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * 50.3} 50.3`}
        opacity="0.9"
      />
      
      {/* Center percentage text */}
      <text
        x="22"
        y="22"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="16"
        fontWeight="600"
        style={{ userSelect: 'none' }}
      >
        {percentage}
      </text>
    </svg>
  );
};

// Preset weight patterns
const WEIGHT_PRESETS = {
  equal: { icon: '=', title: 'Equal weights' },
  favorFirst: { icon: '↗', title: 'Favor first' },
  favorLast: { icon: '↘', title: 'Favor last' },
  rampUp: { icon: '📈', title: 'Ramp up' },
  rampDown: { icon: '📉', title: 'Ramp down' }
};

export const EnhancedBranchingNode = memo((props: NodeProps<EnhancedBranchingNodeData>) => {
  const [options, setOptions] = useState<WeightedOption[]>(props.data.options || []);
  const [title, setTitle] = useState(props.data.title || 'Weighted Choice');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const hasBranching = options.some(opt => opt.hasBranch);

  const calculatePercentages = useCallback((opts: WeightedOption[]) => {
    const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
    if (totalWeight === 0) return opts.map(() => 0);
    return opts.map(opt => Math.round((opt.weight / totalWeight) * 100));
  }, []);

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
    }

    setOptions(options.map((opt, i) => ({
      ...opt,
      weight: newWeights[i] || 50
    })));
  }, [options]);

  const toggleBranch = (index: number) => {
    const newOptions = [...options];
    newOptions[index] = { 
      ...newOptions[index], 
      hasBranch: !newOptions[index].hasBranch 
    };
    setOptions(newOptions);
  };

  const updateOptionText = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text };
    setOptions(newOptions);
  };

  const updateOptionWeight = (index: number, weight: number) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], weight };
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: '', weight: 50, hasBranch: false }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOptions = [...options];
    const draggedOption = newOptions[draggedIndex];
    newOptions.splice(draggedIndex, 1);
    newOptions.splice(index, 0, draggedOption);
    
    setOptions(newOptions);
    setDraggedIndex(index);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedIndex(null);
  };

  const percentages = calculatePercentages(options);
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);

  return (
    <BaseEditableNode
      {...props}
      className="weighted-choice enhanced-branching"
      style={{ width: '420px' }}
      minWidth={420}
      minHeight={180}
      data={{
        ...props.data,
        options,
        title,
        onEdit: (value: string) => {
          props.data.onEdit?.(JSON.stringify({ options, title }));
        }
      }}
    >
      {({ isEditing, confirmEdit, cancelEdit }) => {
        if (isEditing) {
          return (
            <div className="enhanced-branching-editor">
              {/* Main output at top when branching enabled */}
              {hasBranching && (
                <Handle
                  type="source"
                  position={Position.Top}
                  id="main-output"
                  className="enhanced-handle main-output"
                  style={{ top: -10 }}
                />
              )}

              {/* Title section with edit capability */}
              <div className="enhanced-title-section">
                {isEditingTitle ? (
                  <input
                    type="text"
                    className="title-edit-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingTitle(false);
                    }}
                    autoFocus
                  />
                ) : (
                  <div className="title-display">
                    <span className="title-text">{title.toUpperCase()}</span>
                    <button
                      className="title-edit-btn"
                      onClick={() => setIsEditingTitle(true)}
                      title="Edit title"
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>
              
              {/* Weight Presets */}
              <div className="enhanced-presets">
                {Object.entries(WEIGHT_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    className="preset-btn"
                    onClick={() => applyPreset(key)}
                    title={preset.title}
                  >
                    {preset.icon}
                  </button>
                ))}
                <div className="total-weight">
                  Total: {totalWeight}
                </div>
              </div>

              {/* Options list */}
              <div className="enhanced-options-list">
                {options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`enhanced-option-row ${draggedIndex === index ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Drag handle */}
                    <div className="enhanced-drag-handle">
                      <DragHandleIcon />
                    </div>

                    {/* Text input - maximized width */}
                    <input
                      type="text"
                      className="enhanced-option-text"
                      value={option.text}
                      onChange={(e) => updateOptionText(index, e.target.value)}
                      placeholder="Option text..."
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                    
                    {/* Simplified radio dial */}
                    <RadioDial
                      value={option.weight}
                      onChange={(val) => updateOptionWeight(index, val)}
                      percentage={percentages[index]}
                    />
                    
                    {/* Branch toggle */}
                    <button
                      className={`branch-toggle ${option.hasBranch ? 'active' : ''}`}
                      onClick={() => toggleBranch(index)}
                      title="Toggle branch output"
                    >
                      ⚡
                    </button>

                    {/* Remove button */}
                    {options.length > 1 && (
                      <button
                        className="remove-btn"
                        onClick={() => removeOption(index)}
                        title="Remove option"
                      >
                        ×
                      </button>
                    )}

                    {/* Branch output handle - positioned outside node bounds */}
                    {option.hasBranch && (
                      <div className="branch-handle-container">
                        <Handle
                          type="source"
                          position={Position.Right}
                          id={`branch-${index}`}
                          className="enhanced-handle branch-output"
                          style={{ 
                            position: 'absolute',
                            right: -12,
                            top: '50%',
                            transform: 'translateY(-50%)'
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer with hints and controls */}
              <div className="enhanced-footer">
                <div className="hints">
                  Drag to reorder • ⚡ = branch output • Raw weights (orange) • Actual % (blue)
                </div>
                <div className="footer-controls">
                  <button className="add-option-btn" onClick={addOption}>
                    + Add Option
                  </button>
                  <div className="edit-actions">
                    <button className="confirm-btn" onClick={confirmEdit}>✓</button>
                    <button className="cancel-btn" onClick={cancelEdit}>×</button>
                  </div>
                </div>
              </div>

              {/* Main output at right when no branching */}
              {!hasBranching && (
                <Handle
                  type="source"
                  position={Position.Right}
                  id="main-output"
                  className="enhanced-handle main-output"
                  style={{ right: -10 }}
                />
              )}
            </div>
          );
        }

        // Display mode
        return (
          <div className="enhanced-branching-display">
            {hasBranching && (
              <Handle
                type="source"
                position={Position.Top}
                id="main-output"
                className="enhanced-handle main-output"
                style={{ top: -10 }}
              />
            )}

            <div className="display-title">{title}</div>
            
            <div className="display-options">
              {options.map((option, index) => (
                <div key={index} className="display-option">
                  <span className="option-text">
                    {option.text || 'Empty option'}
                    {option.hasBranch && ' ⚡'}
                  </span>
                  <span className="option-percentage">{percentages[index]}%</span>
                  
                  {option.hasBranch && (
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`branch-${index}`}
                      className="enhanced-handle branch-output"
                      style={{ right: -10 }}
                    />
                  )}
                </div>
              ))}
            </div>

            {!hasBranching && (
              <Handle
                type="source"
                position={Position.Right}
                id="main-output"
                className="enhanced-handle main-output"
                style={{ right: -10 }}
              />
            )}
          </div>
        );
      }}
    </BaseEditableNode>
  );
});

EnhancedBranchingNode.displayName = 'EnhancedBranchingNode';
export default EnhancedBranchingNode;