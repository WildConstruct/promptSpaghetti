import React, { memo, useState, useCallback, useRef, useLayoutEffect, useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';
import { 
  PopulateChoicesButton,
  OptimizeWeightsButton,
  InspirationMode 
} from '../../Inspector/IntelligentFeatures';
import { useIntelligence } from '../contexts/IntelligenceContext';
import type { Choice, WeightOptimizationResult } from '../../../services/llm';
import type { SegmentMetadata } from '../../../services/llm/MetadataExtractor';
import './EnhancedBranching.css';

export interface WeightedOption {
  text: string;
  weight: number;
  hasBranch?: boolean;
}

export interface EnhancedBranchingNodeData extends EditableNodeData {
  options: WeightedOption[];
  title?: string;
  metadata?: SegmentMetadata;
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
  const intelligence = useIntelligence();
  const [showMetadata, setShowMetadata] = useState(false);
  const [metadata, setMetadata] = useState<SegmentMetadata | null>(props.data?.metadata || null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);
  
  // Debug logging for Epic 2 integration
  console.log('[EnhancedBranchingNode] Intelligence context:', {
    consentGiven: intelligence.consentGiven,
    hasNodeIntelligence: !!intelligence.nodeIntelligence,
    isOffline: intelligence.isOffline
  });
  
  // Ensure all options have hasBranch set to false by default
  const initializeOptions = () => {
    // Check if options are in props.data.options
    if (Array.isArray(props.data?.options) && props.data.options.length > 0) {
      // Ensure hasBranch is false if not explicitly set
      return props.data.options.map(opt => ({
        ...opt,
        hasBranch: opt.hasBranch === true // Only true if explicitly true
      }));
    }
    
    // Try to parse from value if it's a JSON string
    if (typeof props.data?.value === 'string') {
      try {
        const parsed = JSON.parse(props.data.value);
        if (Array.isArray(parsed.options)) {
          return parsed.options.map((opt: any) => ({
            ...opt,
            hasBranch: opt.hasBranch === true
          }));
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    // Default options with branching OFF
    return [
      { text: '', weight: 50, hasBranch: false },
      { text: '', weight: 50, hasBranch: false }
    ];
  };
  
  const [options, setOptions] = useState<WeightedOption[]>(initializeOptions());
  const [title, setTitle] = useState(props.data?.title || 'Weighted Choice');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [mainHandleTop, setMainHandleTop] = useState(35);
  const [branchHandleTops, setBranchHandleTops] = useState<number[]>([]);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const hasBranching = options.some(opt => opt.hasBranch);
  
  // Normalize weights to ensure they sum to 100
  const normalizeWeights = (opts: WeightedOption[]): WeightedOption[] => {
    const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
    if (totalWeight === 0) return opts;
    
    return opts.map(opt => ({
      ...opt,
      weight: Math.round((opt.weight / totalWeight) * 100)
    }));
  };
  
  // Calculate the position of the main handle and each branch handle relative to the node box
  // Extract metadata when text changes
  useEffect(() => {
    if (intelligence.metadataExtractor && !showMetadata && !metadata && options.length > 0) {
      const allText = options.map(opt => opt.text).filter(t => t).join(' ');
      if (allText.length > 10) {
        setIsExtractingMetadata(true);
        intelligence.metadataExtractor
          .extract(allText)
          .then(result => {
            const metadataResult = result as { metadata?: SegmentMetadata };
            if (metadataResult?.metadata) {
              setMetadata(metadataResult.metadata);
            }
            setIsExtractingMetadata(false);
          }).catch(() => {
          setIsExtractingMetadata(false);
        });
      }
    }
  }, [options, intelligence.metadataExtractor, showMetadata, metadata]);

  // Keyboard handler for metadata toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only toggle if THIS node is selected
      if (e.key === 'm' && (e.metaKey || e.ctrlKey) && props.selected) {
        e.preventDefault();
        setShowMetadata(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [props.selected]);

  // Debug effect to monitor flip state changes
  useEffect(() => {
    console.log('🎭 Flip State Changed:', {
      showMetadata,
      flipCard: document.querySelector('.flip-card'),
      hasFlippedClass: !!document.querySelector('.flip-card.flipped'),
      allFlipCards: document.querySelectorAll('.flip-card').length,
      computedTransform: window.getComputedStyle(document.querySelector('.flip-card') || document.createElement('div')).transform,
    });
  }, [showMetadata]);

  useLayoutEffect(() => {
    if (!nodeRef.current) return;

    // The handles are absolutely positioned relative to the outer node container
    const editorElInit = nodeRef.current!;
    const rootEl = editorElInit.closest('.epic1-editable-node') as HTMLElement | null;

    const calcPositions = () => {
      const editorEl = nodeRef.current!;
      const nodeRect = (rootEl ?? editorEl).getBoundingClientRect();
      // Determine mode accurately: the nodeRef points directly at the editor/display container
      const isEditingMode = editorEl.classList.contains('enhanced-branching-editor');
      // Mode-specific vertical nudge for main handle baseline
      // These values are from the documentation - tested and confirmed
      const vNudge = isEditingMode ? -36 : -30;

      // Title center for main handle
      const titleElement = editorEl.querySelector('.enhanced-title-section, .display-title') as HTMLElement | null;
      if (titleElement) {
        const titleRect = titleElement.getBoundingClientRect();
        const relativeTop = titleRect.top - nodeRect.top + (titleRect.height / 2) + vNudge;
        setMainHandleTop(relativeTop);
      }

      // Option row centers for branch handles
      const tops = options.map((_, i) => {
        const rowEl = optionRefs.current[i];
        if (!rowEl) return 0;
        // Use the entire row's visual box to match the dark rounded background
        const r = rowEl.getBoundingClientRect();
        // Branch-only fine tune: values from documentation
        const branchFineTune = isEditingMode ? -2 : 1;
        return r.top - nodeRect.top + r.height / 2 + vNudge + branchFineTune;
      });
      // Apply mode-specific spacing and lift for branches
      // Compression factor for vertical spacing between options
      const compress = 0.77;
      // Extra lift: uniform offset for all branch handles
      // Values from documentation - properly tested
      const extraLift = isEditingMode ? -40 : -21;
      const adjustedTops = tops.length
        ? tops.map((t, idx) => {
            const base = tops[0];
            return base + (t - base) * compress + extraLift;
          })
        : tops;
      setBranchHandleTops(adjustedTops);
      // Keep optionRefs array in sync with options length
      optionRefs.current.length = options.length;
    };

    // Run once after layout, and schedule follow-ups to catch async ref assignments
    calcPositions();
    requestAnimationFrame(() => calcPositions());
    setTimeout(() => calcPositions(), 0);

    // Recalculate on resize of node
    const ro = new ResizeObserver(() => {
      calcPositions();
    });
    ro.observe(nodeRef.current);

    // Recalculate on DOM mutations (edit/display mode toggle, content changes)
    let mo: MutationObserver | null = null;
    if (rootEl) {
      mo = new MutationObserver(() => {
        // Recalc immediately and again on next frames to handle mode swaps and ref updates
        calcPositions();
        requestAnimationFrame(() => calcPositions());
        setTimeout(() => calcPositions(), 0);
      });
      mo.observe(rootEl, { childList: true, subtree: true, attributes: true });
    }

    // Also listen to window resize (zoom/layout changes)
    window.addEventListener('resize', calcPositions);

    return () => {
      try { ro.disconnect(); } catch {}
      try { mo?.disconnect(); } catch {}
      window.removeEventListener('resize', calcPositions);
    };
  }, [hasBranching, title, options.length]);

  const calculatePercentages = useCallback((opts: WeightedOption[]) => {
    const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
    if (totalWeight === 0) return opts.map(() => 0);
    // Calculate actual percentages
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

  // AI suggestion handlers
  const handleChoicesGenerated = useCallback((choices: Choice[]) => {
    // Smart choice generation that respects existing options
    const existingFilledOptions = options.filter(opt => opt.text && opt.text.trim() !== '');
    const blankOptionCount = options.filter(opt => !opt.text || opt.text.trim() === '').length;
    
    // If we have blank options, fill them intelligently
    if (blankOptionCount > 0 && choices.length > 0) {
      let choiceIndex = 0;
      const updatedOptions = options.map(opt => {
        // Keep filled options as-is
        if (opt.text && opt.text.trim() !== '') {
          return opt;
        }
        // Fill blank options with generated choices
        if (choiceIndex < choices.length) {
          const choice = choices[choiceIndex++];
          return {
            text: choice.text,
            weight: opt.weight || choice.weight || 50,
            hasBranch: opt.hasBranch || false
          };
        }
        return opt;
      });
      setOptions(normalizeWeights(updatedOptions));
    } else if (choices.length > 0) {
      // No blank options, so append the new choices to existing ones
      const newOptions = choices.map(choice => ({
        text: choice.text,
        weight: choice.weight || 50,
        hasBranch: false
      }));
      setOptions(normalizeWeights([...options, ...newOptions]));
    }
  }, [options]);

  const handleWeightsOptimized = useCallback((result: WeightOptimizationResult) => {
    const optimizedOptions = result.optimized.map((choice, index) => ({
      ...options[index],
      weight: choice.weight
    }));
    setOptions(optimizedOptions);
  }, [options]);

  return (
    <BaseEditableNode
      {...props}
      className={`weighted-choice enhanced-branching flippable ${showMetadata ? 'node-flipped' : ''}`}
      style={{ width: '220px' }}
      minWidth={220}
      minHeight={140}
      data={{
        ...props.data,
        nodeType: 'weightedChoice', // Use weightedChoice for compatibility
        options, // Pass current options state so BaseEditableNode can check hasBranch
        title,
        onEdit: (value: string) => {
          props.data.onEdit?.(JSON.stringify({ options, title }));
        }
      }}
    >
      {({ isEditing, confirmEdit, cancelEdit }) => {
        if (isEditing) {
          return (
            <div ref={nodeRef} className={`enhanced-branching-editor flip-container`} onMouseDown={(e) => e.stopPropagation()}>
              {/* Main output is handled by BaseEditableNode when no branching */}

              {/* The entire content flips as one card */}
              <div className={`flip-card ${showMetadata ? 'flipped' : ''}`}>
                {/* Front side - normal editor */}
                <div className="card-face node-front">
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
                      e.stopPropagation(); // Prevent node keyboard shortcuts
                    }}
                    onPaste={(e) => e.stopPropagation()}
                    onCopy={(e) => e.stopPropagation()}
                    onCut={(e) => e.stopPropagation()}
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
                {/* Metadata toggle button */}
                <button
                  className="metadata-toggle-btn nodrag"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newState = !showMetadata;
                    console.log('🔄 Flip Toggle:', {
                      previousState: showMetadata,
                      newState,
                      flipCardElement: document.querySelector('.flip-card'),
                      hasFlippedClass: document.querySelector('.flip-card.flipped'),
                    });
                    setShowMetadata(newState);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  title="Toggle metadata view (Ctrl+M)"
                  style={{
                    marginLeft: '10px',
                    background: showMetadata ? '#10b981' : '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '4px',
                    color: '#fff',
                    padding: '2px 6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '28px',
                    height: '28px'
                  }}
                >
                  {showMetadata ? '📊' : '🔍'}
                </button>
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
                    ref={(el) => { optionRefs.current[index] = el; }}
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
                      onPaste={(e) => {
                        // Allow paste events to work properly
                        e.stopPropagation();
                      }}
                      onCopy={(e) => {
                        // Allow copy events to work properly
                        e.stopPropagation();
                      }}
                      onCut={(e) => {
                        // Allow cut events to work properly
                        e.stopPropagation();
                      }}
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
                      →
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

                    {/* Branch handle indicator - actual handle rendered at node level */}
                    {option.hasBranch && (
                      <span style={{ 
                        position: 'absolute',
                        right: '10px',
                        color: '#f59e0b',
                        fontSize: '10px'
                      }}>●</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer with hints and controls */}
              <div className="enhanced-footer">
                <div className="hints">
                  Drag to reorder • → = branch output • Click and drag dials to adjust weights
                </div>
                
                {/* Epic 2 AI Integration */}
                {intelligence.consentGiven && intelligence.nodeIntelligence && (
                  <div className="epic2-ai-controls" style={{ marginBottom: '10px', padding: '10px', borderTop: '1px solid #333' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {/* Show InspirationMode only when there are NO options at all */}
                      {options.length === 0 && (
                        <InspirationMode
                          upstreamContext="weighted choice node"
                          onInspirationSelected={handleChoicesGenerated}
                          intelligenceService={intelligence.nodeIntelligence}
                        />
                      )}
                      
                      {/* Show PopulateChoices when we need more options (less than 3) or have blank ones */}
                      {(options.length < 3 || options.some(opt => !opt.text || opt.text.trim() === '')) && (
                        <PopulateChoicesButton
                          nodeText={title || 'weighted choice node'}
                          context={`Node title: ${title || 'Weighted Choice'}. ${options.filter(opt => opt.text).map(opt => opt.text).join(', ')}`}
                          currentChoices={options.map(opt => ({ text: opt.text, weight: opt.weight }))}
                          onChoicesGenerated={handleChoicesGenerated}
                          intelligenceService={intelligence.nodeIntelligence}
                          requestedCount={options.filter(opt => !opt.text || opt.text.trim() === '').length || (3 - options.length)}
                        />
                      )}
                      
                      {/* Show OptimizeWeights only when we have 2+ filled options */}
                      {options.filter(opt => opt.text && opt.text.trim() !== '').length > 1 && (
                        <OptimizeWeightsButton
                          choices={options.map(opt => ({ text: opt.text, weight: opt.weight }))}
                          context="weighted choice context"
                          onWeightsOptimized={handleWeightsOptimized}
                          intelligenceService={intelligence.nodeIntelligence}
                        />
                      )}
                    </div>
                  </div>
                )}
                
                {/* Debug info if consent not given */}
                {!intelligence.consentGiven && (
                  <div style={{ padding: '8px', fontSize: '11px', color: '#666', textAlign: 'center' }}>
                    <div>AI Features: {intelligence.consentGiven ? 'Enabled' : 'Disabled'}</div>
                    {!intelligence.consentGiven && (
                      <button 
                        onClick={() => intelligence.setConsent(true)}
                        style={{ marginTop: '4px', fontSize: '10px', padding: '2px 6px' }}
                      >
                        Enable AI Features
                      </button>
                    )}
                  </div>
                )}
                
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

              {/* Render all branch handles at node level */}
              {options.map((option, index) => 
                option.hasBranch && (
                  <Handle
                    key={`branch-${index}`}
                    type="source"
                    position={Position.Right}
                    id={`branch-${index}`}
                    className="epic1-handle enhanced-handle branch-output"
                    style={{ 
                      position: 'absolute',
                      ['--handle-top' as any]: `${branchHandleTops[index] ?? 0}px`,
                      transform: 'translateY(-50%)',
                      zIndex: 1000,
                      background: '#f59e0b',
                      border: '2px solid #fff',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%'
                    }}
                  />
                )
              )}

              {/* Main output on right edge when branching enabled */}
              {hasBranching && (
                <Handle
                  type="source"
                  position={Position.Right}
                  id="main"
                  className="epic1-handle enhanced-handle main-output"
                  style={{ 
                    position: 'absolute',
                    ['--handle-top' as any]: `${mainHandleTop}px`,
                    transform: 'translateY(-50%)',
                    zIndex: 1000,
                    background: '#10b981',
                    border: '2px solid #fff',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%'
                  }}
                />
              )}
              {/* Note: Main output when no branching is handled by BaseEditableNode */}
                  </div>
                  
                  {/* Back side - metadata view */}
                  <div className="card-face metadata-view">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>
                      Metadata Analysis
                    </h3>
                    <button
                      className="metadata-close-btn nodrag"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMetadata(false);
                      }}
                      style={{
                        background: '#374151',
                        border: '1px solid #4b5563',
                        borderRadius: '4px',
                        color: '#e5e7eb',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#374151'}
                    >
                      ✕ Close
                    </button>
                  </div>
                  {isExtractingMetadata ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <span className="spinner" /> Extracting metadata...
                    </div>
                  ) : metadata ? (
                    <div className="metadata-content" style={{ fontSize: '12px' }}>
                      {metadata.subject && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Subject:</strong> {metadata.subject}
                        </div>
                      )}
                      {metadata.action && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Action:</strong> {metadata.action}
                        </div>
                      )}
                      {metadata.location && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Location:</strong> {metadata.location}
                        </div>
                      )}
                      {metadata.mood && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Mood:</strong> {metadata.mood}
                        </div>
                      )}
                      {metadata.intensity !== undefined && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Intensity:</strong> 
                          <div style={{
                            display: 'inline-block',
                            marginLeft: '10px',
                            width: '100px',
                            height: '8px',
                            background: '#374151',
                            borderRadius: '4px',
                            position: 'relative'
                          }}>
                            <div style={{
                              width: `${(metadata.intensity / 10) * 100}%`,
                              height: '100%',
                              background: metadata.intensity > 7 ? '#ef4444' : metadata.intensity > 4 ? '#f59e0b' : '#10b981',
                              borderRadius: '4px'
                            }} />
                          </div>
                          <span style={{ marginLeft: '5px' }}>{metadata.intensity}/10</span>
                        </div>
                      )}
                      {metadata.tags && metadata.tags.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Tags:</strong>
                          <div style={{ marginTop: '5px' }}>
                            {metadata.tags.map((tag, i) => (
                              <span key={i} style={{
                                display: 'inline-block',
                                background: '#374151',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                marginRight: '5px',
                                marginBottom: '5px',
                                fontSize: '11px'
                              }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <button
                        className="refresh-metadata-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMetadata(null);
                          const allText = options.map(opt => opt.text).filter(t => t).join(' ');
                          if (intelligence.metadataExtractor && allText.length > 10) {
                            setIsExtractingMetadata(true);
                            intelligence.metadataExtractor
                              .extract(allText)
                              .then(result => {
                                const metadataResult = result as { metadata?: SegmentMetadata };
                                if (metadataResult?.metadata) {
                                  setMetadata(metadataResult.metadata);
                                }
                                setIsExtractingMetadata(false);
                              }).catch(() => {
                              setIsExtractingMetadata(false);
                            });
                          }
                        }}
                        style={{
                          marginTop: '10px',
                          background: '#374151',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#fff',
                          padding: '4px 8px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Refresh Analysis
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                      No metadata extracted yet. Add some content to analyze.
                    </div>
                  )}
                  </div>
                </div>
              </div>
          );
        }

        // Display mode
        return (
          <div ref={nodeRef} className="enhanced-branching-display" style={{ position: 'relative' }}>
            {/* Main output is handled by BaseEditableNode in display mode */}

            <div className="display-title">{title}</div>
            
            <div className="display-options">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="display-option"
                  style={{ position: 'relative' }}
                  ref={(el) => { optionRefs.current[index] = el; }}
                >
                  <span className="option-text">
                    {option.text || 'Empty option'}
                  </span>
                  <span className="option-percentage">{percentages[index]}%</span>
                </div>
              ))}
            </div>

            {/* Render all handles at node level, not inside option divs */}
            {options.map((option, index) => 
              option.hasBranch && (
                <Handle
                  key={`branch-${index}`}
                  type="source"
                  position={Position.Right}
                  id={`branch-${index}`}
                  className="epic1-handle enhanced-handle branch-output"
                  style={{ 
                    position: 'absolute',
                    ['--handle-top' as any]: `${branchHandleTops[index] ?? 0}px`,
                    transform: 'translateY(-50%)',
                    zIndex: 1000,
                    background: '#f59e0b',
                    border: '2px solid #fff',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%'
                  }}
                />
              )
            )}

            {/* Main output on right edge when branching is enabled */}
            {hasBranching && (
              <Handle
                type="source"
                position={Position.Right}
                id="main"
                className="epic1-handle enhanced-handle main-output"
                style={{ 
                  position: 'absolute',
                  ['--handle-top' as any]: `${mainHandleTop}px`,
                  transform: 'translateY(-50%)',
                  zIndex: 1000,
                  background: '#10b981',
                  border: '2px solid #fff',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%'
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
