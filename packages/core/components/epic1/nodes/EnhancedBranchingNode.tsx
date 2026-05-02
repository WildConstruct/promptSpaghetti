import React, { memo, useState, useCallback, useRef, useLayoutEffect, useEffect } from 'react';
import { NodeProps, Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { BaseEditableNode, EditableNodeData } from './BaseEditableNode';
import type { WeightedOption } from '../../../types/epic1';
import {
  PopulateChoicesButton,
  OptimizeWeightsButton,
  InspirationMode
} from '../../Inspector/IntelligentFeatures';
import { useIntelligence } from '../contexts/IntelligenceContext';
import type { Choice, WeightOptimizationResult } from '../../../services/llm';
import type { SegmentMetadata } from '../../../services/llm/MetadataExtractor';
import './EnhancedBranching.css';
import { debugLogEpic1 } from '../../../utils/debug';

export type { WeightedOption } from '../../../types/epic1';

export interface EnhancedBranchingNodeData extends EditableNodeData {
  options?: WeightedOption[];
  title?: string;
  metadata?: SegmentMetadata;
}

const EDITING_BRANCH_HANDLE_BASE_TOP = 132;
const EDITING_BRANCH_HANDLE_ROW_SPACING = 88;
const DISPLAY_BRANCH_HANDLE_BASE_TOP = 72;
const DISPLAY_BRANCH_HANDLE_ROW_SPACING = 42;
const MAIN_HANDLE_RIGHT_OFFSET = -18;
const BRANCH_HANDLE_RIGHT_OFFSET = -38;

function normalizedChoiceKey(text: string): string {
  return text.trim().toLowerCase();
}

function getFallbackBranchHandleTop(index: number, isEditing: boolean): number {
  const baseTop = isEditing
    ? EDITING_BRANCH_HANDLE_BASE_TOP
    : DISPLAY_BRANCH_HANDLE_BASE_TOP;
  const rowSpacing = isEditing
    ? EDITING_BRANCH_HANDLE_ROW_SPACING
    : DISPLAY_BRANCH_HANDLE_ROW_SPACING;

  return baseTop + index * rowSpacing;
}

function areNumberArraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) {return false;}
  return a.every((value, index) => value === b[index]);
}

export function normalizeWeightedOptions(
  opts: WeightedOption[]
): WeightedOption[] {
  const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
  if (totalWeight <= 0) {
    return opts;
  }

  const scaled = opts.map(opt => {
    const exact = (opt.weight / totalWeight) * 100;
    const floor = Math.floor(exact);
    return {
      opt,
      floor,
      remainder: exact - floor
    };
  });

  let remainder = 100 - scaled.reduce((sum, item) => sum + item.floor, 0);
  const byRemainder = [...scaled]
    .sort((a, b) => b.remainder - a.remainder)
    .map(item => item.opt);
  const bonuses = new Map<WeightedOption, number>();

  for (let index = 0; index < byRemainder.length && remainder > 0; index += 1) {
    const opt = byRemainder[index];
    bonuses.set(opt, (bonuses.get(opt) ?? 0) + 1);
    remainder -= 1;
    if (index === byRemainder.length - 1 && remainder > 0) {
      index = -1;
    }
  }

  return scaled.map(item => ({
    ...item.opt,
    weight: item.floor + (bonuses.get(item.opt) ?? 0)
  }));
}

export function mergeGeneratedChoicesIntoOptions(
  options: WeightedOption[],
  choices: Choice[]
): WeightedOption[] {
  const existingKeys = new Set(
    options.map(opt => normalizedChoiceKey(opt.text || '')).filter(Boolean)
  );
  const uniqueChoices = choices.filter(choice => {
    const key = normalizedChoiceKey(choice.text || '');
    if (!key || existingKeys.has(key)) {
      return false;
    }
    existingKeys.add(key);
    return true;
  });

  const blankOptionCount = options.filter(
    opt => !opt.text || opt.text.trim() === ''
  ).length;

  if (blankOptionCount > 0 && uniqueChoices.length > 0) {
    let choiceIndex = 0;
    const updatedOptions = options.map(opt => {
      if (opt.text && opt.text.trim() !== '') {
        return opt;
      }

      if (choiceIndex < uniqueChoices.length) {
        const choice = uniqueChoices[choiceIndex++];
        return {
          id: opt.id || `option-${choiceIndex}`,
          text: choice.text,
          weight: choice.weight || 50,
          hasBranch: opt.hasBranch || false
        };
      }

      return opt;
    });
    return normalizeWeightedOptions(updatedOptions);
  }

  if (uniqueChoices.length > 0) {
    const newOptions = uniqueChoices.map((choice, index) => ({
      id: `option-${options.length + index + 1}`,
      text: choice.text,
      weight: choice.weight || 50,
      hasBranch: false
    }));
    return normalizeWeightedOptions([...options, ...newOptions]);
  }

  return options;
}

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

const RadioDial = ({ value, onChange, disabled = false }: {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}) => {
  // Calculate the arc length for a full circle when value is 100
  // Using 270° arc (3/4 circle) for the visual range
  const circumference = 2 * Math.PI * 19; // Full circle circumference
  const arcLength = circumference * 0.75; // 3/4 of circle for visual range
  const fillLength = (value / 100) * arcLength;

  const handleMouseDown = (e: React.MouseEvent<SVGElement>) => {
    if (disabled) {return;}
    // Only respond to left click
    if (e.button !== 0) {return;}
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
      if (angle < 0) {angle += 360;}

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
    if (disabled) {return;}
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
  debugLogEpic1('[EnhancedBranchingNode] Intelligence context:', {
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
          return parsed.options.map((opt: Partial<WeightedOption>, index: number) => ({
            id:
              typeof opt.id === 'string' && opt.id.trim().length > 0
                ? opt.id
                : `option-${index + 1}`,
            text: opt.text ?? '',
            weight: typeof opt.weight === 'number' ? opt.weight : 50,
            hasBranch: opt.hasBranch === true
          }));
        }
      } catch (error) {
        debugLogEpic1('Failed to parse weighted options from node value', error);
      }
    }

    // Default options with branching OFF
    return [
      { id: 'option-1', text: '', weight: 50, hasBranch: false },
      { id: 'option-2', text: '', weight: 50, hasBranch: false }
    ];
  };

  const [options, setOptions] = useState<WeightedOption[]>(initializeOptions());
  const [title, setTitle] = useState(props.data?.title || 'Weighted Choice');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [mainHandleTop, setMainHandleTop] = useState(35);
  const [branchHandleTops, setBranchHandleTops] = useState<number[]>([]);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const updateNodeInternals = useUpdateNodeInternals();

  const hasBranching = options.some(opt => opt.hasBranch);
  const suggestionIntelligence = intelligence.nodeIntelligence;
  const hasFilledOptions = options.some(
    opt => typeof opt.text === 'string' && opt.text.trim() !== ''
  );
  const suggestionSeedText =
    options
      .map(opt => opt.text?.trim())
      .filter((text): text is string => Boolean(text))
      .join(', ') || title || 'weighted choice node';
  const optimizationContext = `Node title: ${title || 'Weighted Choice'}. Options: ${
    options
      .map(opt => opt.text?.trim())
      .filter((text): text is string => Boolean(text))
      .join(', ') || 'none'
  }`;
  const canUseOfflineSuggestions = !!suggestionIntelligence;
  const canUseRemoteIntelligence =
    intelligence.consentGiven && !!suggestionIntelligence;

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
    debugLogEpic1('🎭 Flip State Changed:', {
      showMetadata,
      flipCard: document.querySelector('.flip-card'),
      hasFlippedClass: !!document.querySelector('.flip-card.flipped'),
      allFlipCards: document.querySelectorAll('.flip-card').length,
      computedTransform: window.getComputedStyle(document.querySelector('.flip-card') || document.createElement('div')).transform,
    });
  }, [showMetadata]);

  useLayoutEffect(() => {
    const editorElement = nodeRef.current;
    if (!editorElement) {return;}

    const calcPositions = () => {
      const currentEditor = nodeRef.current;
      if (!currentEditor) {return;}
      const contentRect = currentEditor.getBoundingClientRect();
      const isEditorLayout =
        currentEditor.classList.contains('enhanced-branching-editor') ||
        currentEditor.querySelector('.option-row') !== null;

      // Title center for main handle
      const titleElement = currentEditor.querySelector('.enhanced-title-section, .display-title') as HTMLElement | null;
      if (titleElement) {
        const titleRect = titleElement.getBoundingClientRect();
        const relativeTop = titleRect.top - contentRect.top + titleRect.height / 2;
        setMainHandleTop((previousTop) => previousTop === relativeTop ? previousTop : relativeTop);
      }

      // Option row centers for branch handles
      const tops = options.map((_, i) => {
        const rowEl = optionRefs.current[i];
        if (!rowEl) {
          return getFallbackBranchHandleTop(i, isEditorLayout);
        }
        const r = rowEl.getBoundingClientRect();
        return r.top - contentRect.top + r.height / 2;
      });
      setBranchHandleTops((previousTops) => (
        areNumberArraysEqual(previousTops, tops) ? previousTops : tops
      ));
      // Keep optionRefs array in sync with options length
      optionRefs.current.length = options.length;
      requestAnimationFrame(() => updateNodeInternals(props.id));
    };

    // Run once after layout, and schedule follow-ups to catch async ref assignments
    calcPositions();
    requestAnimationFrame(() => calcPositions());
    setTimeout(() => calcPositions(), 0);

    // Recalculate on resize of node
    const ro = new ResizeObserver(() => {
      calcPositions();
    });
    ro.observe(editorElement);

    // Recalculate on DOM mutations (edit/display mode toggle, content changes)
    let mo: MutationObserver | null = null;
    if (editorElement) {
      mo = new MutationObserver(() => {
        // Recalc immediately and again on next frames to handle mode swaps and ref updates
        calcPositions();
        requestAnimationFrame(() => calcPositions());
        setTimeout(() => calcPositions(), 0);
      });
      mo.observe(editorElement, { childList: true, subtree: true });
    }

    // Also listen to window resize (zoom/layout changes)
    window.addEventListener('resize', calcPositions);

    return () => {
      ro.disconnect();
      mo?.disconnect();
      window.removeEventListener('resize', calcPositions);
    };
  }, [hasBranching, options, props.id, title, updateNodeInternals]);

  useEffect(() => {
    requestAnimationFrame(() => updateNodeInternals(props.id));
  }, [branchHandleTops, hasBranching, mainHandleTop, options.length, props.id, updateNodeInternals]);

  const calculatePercentages = useCallback((opts: WeightedOption[]) => {
    const totalWeight = opts.reduce((sum, opt) => sum + opt.weight, 0);
    if (totalWeight === 0) {return opts.map(() => 0);}
    // Calculate actual percentages
    return opts.map(opt => Math.round((opt.weight / totalWeight) * 100));
  }, []);

  const applyPreset = useCallback((preset: string) => {
    const count = options.length;
    if (count === 0) {return;}

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
      case 'rampUp': {
        const stepUp = count > 1 ? 60 / (count - 1) : 0;
        newWeights = Array.from({ length: count }, (_, i) =>
          Math.round(20 + stepUp * i)
        );
        break;
      }
      case 'rampDown': {
        const stepDown = count > 1 ? 60 / (count - 1) : 0;
        newWeights = Array.from({ length: count }, (_, i) =>
          Math.round(80 - stepDown * i)
        );
        break;
      }
      default:
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
    setOptions([
      ...options,
      {
        id: `option-${options.length + 1}`,
        text: '',
        weight: 50,
        hasBranch: false
      }
    ]);
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
    if (draggedIndex === null || draggedIndex === index) {return;}

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
    setOptions(mergeGeneratedChoicesIntoOptions(options, choices));
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
      style={{ width: '320px' }}
      minWidth={320}
      minHeight={140}
      data={{
        ...props.data,
        value: String(props.data.value ?? ''),
        nodeType: 'weightedChoice', // Use weightedChoice for compatibility
        options, // Pass current options state so BaseEditableNode can check hasBranch
        title,
        onEdit: (_nextValue: string) => {
          void _nextValue;
          const handleEdit = props.data.onEdit as EditableNodeData['onEdit'];
          handleEdit?.(JSON.stringify({ options, title }));
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
                      if (e.key === 'Enter') {setIsEditingTitle(false);}
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
                    debugLogEpic1('🔄 Flip Toggle:', {
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

      <RadioDial
                      value={option.weight}
                      onChange={val => updateOptionWeight(index, val)}
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
                {suggestionIntelligence && (
                  <div className="epic2-ai-controls" style={{ marginBottom: '10px', padding: '10px', borderTop: '1px solid #333' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {/* Treat all-blank rows as empty so suggestion tools are reachable on fresh nodes */}
                      {!hasFilledOptions && (
                        <InspirationMode
                          upstreamContext={suggestionSeedText}
                          onInspirationSelected={handleChoicesGenerated}
                          intelligenceService={suggestionIntelligence}
                        />
                      )}

                      {/* Show PopulateChoices when we need more options (less than 3) or have blank ones */}
                      {(options.length < 3 || options.some(opt => !opt.text || opt.text.trim() === '')) && (
                        <PopulateChoicesButton
                          nodeText={suggestionSeedText}
                          context={`Node title: ${title || 'Weighted Choice'}. ${options.filter(opt => opt.text).map(opt => opt.text).join(', ')}`}
                          currentChoices={options.map(opt => ({ text: opt.text, weight: opt.weight }))}
                          onChoicesGenerated={handleChoicesGenerated}
                          intelligenceService={suggestionIntelligence}
                          requestedCount={options.filter(opt => !opt.text || opt.text.trim() === '').length || (3 - options.length)}
                        />
                      )}

                      {/* Show OptimizeWeights only when we have 2+ filled options */}
                      {canUseRemoteIntelligence &&
                        options.filter(opt => opt.text && opt.text.trim() !== '').length > 1 && (
                        <OptimizeWeightsButton
                          choices={options.map(opt => ({ text: opt.text, weight: opt.weight }))}
                          context={optimizationContext}
                          onWeightsOptimized={handleWeightsOptimized}
                          intelligenceService={suggestionIntelligence}
                        />
                      )}
                    </div>
                    {!intelligence.consentGiven && (
                      <div style={{ paddingTop: '8px', fontSize: '11px', color: '#888', textAlign: 'center' }}>
                        Offline suggestions available. Enable AI features to use remote weighting and richer assists.
                      </div>
                    )}
                  </div>
                )}

                {!canUseOfflineSuggestions && (
                  <div style={{ padding: '8px', fontSize: '11px', color: '#666', textAlign: 'center' }}>
                    <div>Suggestion tools unavailable.</div>
                    <button
                      onClick={() => intelligence.setConsent(true)}
                      style={{ marginTop: '4px', fontSize: '10px', padding: '2px 6px' }}
                    >
                      Enable AI Features
                    </button>
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
                  <React.Fragment key={`branch-group-${index}`}>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`branch-${index}`}
                      className="epic1-handle enhanced-handle branch-output"
                      style={{
                        position: 'absolute',
                        top: branchHandleTops[index] ?? 0,
                        right: `${BRANCH_HANDLE_RIGHT_OFFSET}px`,
                        transform: 'translateY(-50%)',
                        zIndex: 1000,
                        background: '#f59e0b',
                        border: '2px solid #fff',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%'
                      }}
                    />
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`option-${index}`}
                      className="epic1-handle enhanced-handle branch-output legacy-branch-output"
                      style={{
                        position: 'absolute',
                        top: branchHandleTops[index] ?? 0,
                        right: `${BRANCH_HANDLE_RIGHT_OFFSET}px`,
                        transform: 'translateY(-50%)',
                        zIndex: 999,
                        opacity: 0,
                        pointerEvents: 'none',
                        width: '12px',
                        height: '12px'
                      }}
                    />
                  </React.Fragment>
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
                  top: mainHandleTop,
                  right: `${MAIN_HANDLE_RIGHT_OFFSET}px`,
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
                <React.Fragment key={`branch-group-${index}`}>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`branch-${index}`}
                    className="epic1-handle enhanced-handle branch-output"
                    style={{
                      position: 'absolute',
                      top: branchHandleTops[index] ?? 0,
                      right: `${BRANCH_HANDLE_RIGHT_OFFSET}px`,
                      transform: 'translateY(-50%)',
                      zIndex: 1000,
                      background: '#f59e0b',
                      border: '2px solid #fff',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%'
                    }}
                  />
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`option-${index}`}
                    className="epic1-handle enhanced-handle branch-output legacy-branch-output"
                    style={{
                      position: 'absolute',
                      top: branchHandleTops[index] ?? 0,
                      right: `${BRANCH_HANDLE_RIGHT_OFFSET}px`,
                      transform: 'translateY(-50%)',
                      zIndex: 999,
                      opacity: 0,
                      pointerEvents: 'none',
                      width: '12px',
                      height: '12px'
                    }}
                  />
                </React.Fragment>
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
                  top: mainHandleTop,
                  right: `${MAIN_HANDLE_RIGHT_OFFSET}px`,
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
