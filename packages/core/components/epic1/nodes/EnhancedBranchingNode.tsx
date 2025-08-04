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

// Simplified radio dial component - independent weight control
const RadioDial = ({ value, onChange, percentage, disabled = false }: { 
  value: number; 
  onChange: (val: number) => void;
  percentage: number;
  disabled?: boolean;
}) => {
  // Calculate the arc length for a full circle when value is 100
  // Using 270° arc (3/4 circle) for the visual range
  const circumference = 2 * Math.PI * 19; // Full circle circumference
  const arcLength = circumference * 0.75; // 3/4 of circle for visual range
  const fillLength = (value / 100) * arcLength;
  
  const handleMouseDown = (e: React.MouseEvent<SVGElement>) => {
    if (disabled) return;
    // Only respond to left click
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    
    // CRITICAL: Stop the event from bubbling to the node drag handler
    const event = e.nativeEvent;
    event.stopImmediatePropagation();
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Add visual feedback for interaction
    svg.style.cursor = 'grabbing';
    
    const updateValue = (clientX: number, clientY: number) => {
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Normalize angle: -180 to 180 -> 0 to 360
      if (angle < 0) angle += 360;
      
      // Map the 3/4 circle (225° to 135°) to 0-100
      // The dial starts at 225° and goes clockwise to 135°
      let normalizedValue = 0;
      
      if (angle >= 225) {
        // From 225° to 360° (start to bottom)
        normalizedValue = ((angle - 225) / 270) * 100;
      } else if (angle <= 135) {
        // From 0° to 135° (bottom through to end)
        normalizedValue = ((angle + 360 - 225) / 270) * 100;
      } else {
        // Between 135° and 225° - dead zone
        // Snap to nearest endpoint
        const distToEnd = Math.abs(angle - 135);
        const distToStart = Math.abs(angle - 225);
        normalizedValue = distToEnd < distToStart ? 100 : 0;
      }
      
      // Clamp to 0-100 range (changed from 0-200)
      const newValue = Math.round(Math.max(0, Math.min(100, normalizedValue)));
      onChange(newValue);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      updateValue(e.clientX, e.clientY);
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      svg.style.cursor = 'pointer'; // Reset cursor
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    updateValue(e.clientX, e.clientY);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Add mouse wheel support
  const handleWheel = (e: React.WheelEvent<SVGElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    // Stop ReactFlow from zooming
    e.nativeEvent.stopImmediatePropagation();
    
    // More responsive: 5 units per wheel tick (increased from typical 1-2)
    const delta = e.deltaY > 0 ? -5 : 5;
    const newValue = Math.round(Math.max(0, Math.min(100, value + delta)));
    onChange(newValue);
  };
  
  return (
    <svg 
      width="44" 
      height="44" 
      viewBox="0 0 44 44" 
      className="radio-dial-simple nodrag"
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      style={{ 
        cursor: disabled ? 'default' : 'pointer',
        pointerEvents: 'all',
        zIndex: 10
      }}
    >
      {/* Background circle */}
      <circle 
        cx="22" 
        cy="22" 
        r="19" 
        fill="#0a0a0a" 
        stroke="none"
      />
      
      {/* Background ring track on outer edge - 3/4 circle */}
      <circle
        cx="22"
        cy="22"
        r="19"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${arcLength} 100`}
        transform="rotate(135 22 22)"
      />
      
      {/* Filled progress ring based on percentage */}
      <circle
        cx="22"
        cy="22"
        r="19"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${fillLength} 100`}
        transform="rotate(135 22 22)"
        opacity="0.9"
      />
      
      {/* Removed the indicator dot that animates around the dial */}
      
      {/* Number display in center */}
      <text
        x="22"
        y="22"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize="14"
        fontWeight="700"
        style={{ pointerEvents: 'none' }}
      >
        {value}
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

const EnhancedBranchingNodeComponent = (props: NodeProps<EnhancedBranchingNodeData>) => {
  const [options, setOptions] = useState<WeightedOption[]>(props.data.options || []);
  const [title, setTitle] = useState(props.data.title || 'Weighted Choice');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const hasBranching = options.some(opt => opt.hasBranch);

  const calculatePercentages = useCallback((opts: WeightedOption[]) => {
    const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
    if (totalWeight === 0) return opts.map(() => 0);
    // Show actual weight values, not percentages
    return opts.map(opt => opt.weight);
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
        newWeights = [75, ...Array(count - 1).fill(25)];
        break;
      case 'favorLast':
        newWeights = [...Array(count - 1).fill(25), 75];
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
      weight: newWeights[i] || 25
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
    // Set weight directly without affecting others
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
    // DO NOT preventDefault() here - it breaks HTML5 drag and drop!
    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    
    // Create a custom drag image to prevent ghost text
    const dragImage = document.createElement('div');
    dragImage.style.width = '1px';
    dragImage.style.height = '1px';
    dragImage.style.opacity = '0';
    dragImage.style.position = 'fixed';
    dragImage.style.pointerEvents = 'none';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    // Clean up the drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
    
    setDraggedIndex(index);
    // Add visual feedback
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
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
    // Reset visual feedback
    (e.currentTarget as HTMLElement).style.opacity = '1';
  };

  const percentages = calculatePercentages(options);
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);

  return (
    <BaseEditableNode
      {...props}
      className="weighted-choice enhanced-branching"
      style={{ width: '520px' }}
      minWidth={520}
      minHeight={180}
      data={{
        ...props.data,
        nodeType: 'enhancedBranching',
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
            <div className="enhanced-branching-editor" onMouseDown={(e) => e.stopPropagation()}>
              {/* Main output is handled by BaseEditableNode when no branching */}

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

              {/* Options list with scroll support */}
              <div 
                className="enhanced-options-list"
                onWheel={(e) => {
                  e.stopPropagation();
                  // Allow scrolling within the list
                }}
              >
                {options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`enhanced-option-row ${draggedIndex === index ? 'dragging' : ''}`}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      // Always stop propagation to prevent node dragging
                      e.stopPropagation();
                    }}
                  >
                    {/* Drag handle - initiate option dragging */}
                    <div 
                      className="enhanced-drag-handle nodrag"
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onMouseDown={(e) => {
                        // Prevent node dragging when using drag handle
                        e.stopPropagation();
                        // Don't prevent default - we need it for HTML5 drag
                      }}
                      style={{ cursor: 'grab' }}
                      title="Drag to reorder"
                    >
                      <DragHandleIcon />
                    </div>

                    {/* Text input - maximized width */}
                    <input
                      type="text"
                      className="enhanced-option-text nodrag"
                      value={option.text}
                      onChange={(e) => updateOptionText(index, e.target.value)}
                      placeholder="Option text..."
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.currentTarget.focus();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ pointerEvents: 'all' }}
                    />
                    
                    {/* Simplified radio dial with proper event handling */}
                    <RadioDial
                      value={option.weight}
                      onChange={(val) => updateOptionWeight(index, val)}
                      percentage={percentages[index]}
                    />
                    
                    {/* Branch toggle */}
                    <button
                      className={`branch-toggle nodrag ${option.hasBranch ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBranch(index);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      title="Toggle branch output"
                    >
                      ⚡
                    </button>

                    {/* Remove button */}
                    {options.length > 1 && (
                      <button
                        className="remove-btn nodrag"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeOption(index);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        title="Remove option"
                      >
                        ×
                      </button>
                    )}

                    {/* Branch output handle - positioned at edge */}
                    {option.hasBranch && (
                      <Handle
                        type="source"
                        position={Position.Right}
                        id={`branch-${index}`}
                        className="enhanced-handle branch-output"
                        style={{ 
                          position: 'absolute',
                          right: -8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 1000
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Footer with hints and controls */}
              <div className="enhanced-footer">
                <div className="hints">
                  Drag to reorder • ⚡ = branch output • Click and drag dials to adjust weights
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

              {/* Main output on top edge when branching enabled */}
              {hasBranching && (
                <Handle
                  type="source"
                  position={Position.Top}
                  id="main-output"
                  className="enhanced-handle main-output"
                  style={{ 
                    position: 'absolute',
                    top: -8,
                    right: 30,
                    left: 'auto',
                    transform: 'translateX(50%)'
                  }}
                />
              )}
              {/* Note: Main output when no branching is handled by BaseEditableNode */}
            </div>
          );
        }

        // Display mode
        return (
          <div className="enhanced-branching-display">
            {/* Main output is handled by BaseEditableNode in display mode */}

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
                      style={{ 
                        position: 'absolute',
                        right: -10, // Position on frame edge in display mode
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Main output on top edge when branching is enabled */}
            {hasBranching && (
              <Handle
                type="source"
                position={Position.Top}
                id="main-output"
                className="enhanced-handle main-output"
                style={{ 
                  position: 'absolute',
                  top: -8,
                  right: 30,
                  left: 'auto',
                  transform: 'translateX(50%)'
                }}
              />
            )}
            {/* Note: Main output when no branching is handled by BaseEditableNode */}
          </div>
        );
      }}
    </BaseEditableNode>
  );
};

export const EnhancedBranchingNode = memo(EnhancedBranchingNodeComponent);

EnhancedBranchingNode.displayName = 'EnhancedBranchingNode';
export default EnhancedBranchingNode;