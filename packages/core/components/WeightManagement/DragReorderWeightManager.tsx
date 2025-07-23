/**
 * Drag-to-Reorder Weight Manager
 * Epic 8.3 Task 3 - Drag-to-Reorder Interface (E8.3-3-drag-reorder)
 * 
 * Intuitive weight management with drag-and-drop reordering for Wild Construct demo
 * Migrated from react-beautiful-dnd to @dnd-kit for modern React 18+ support
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

export interface WeightedOption {
  id: string;
  text: string;
  weight: number;
  locked?: boolean;
  color?: string;
  category?: string;
}

export interface DragReorderProps {
  options: WeightedOption[];
  onChange: (options: WeightedOption[]) => void;
  disabled?: boolean;
  showWeights?: boolean;
  showPercentages?: boolean;
  allowWeightEditing?: boolean;
  allowLocking?: boolean;
  minWeight?: number;
  maxWeight?: number;
  totalWeight?: number;
  onWeightChange?: (optionId: string, weight: number, percentage: number) => void;
  className?: string;
  style?: React.CSSProperties;
  
  // Visual customization
  theme?: 'light' | 'dark' | 'cinema';
  showVisualWeights?: boolean;
  animationDuration?: number;
  snapToGrid?: boolean;
  
  // Professional film industry features
  enableCategories?: boolean;
  enableBulkOperations?: boolean;
  enablePresets?: boolean;
  showStatistics?: boolean;
}

export interface WeightStatistics {
  totalWeight: number;
  averageWeight: number;
  medianWeight: number;
  maxWeight: number;
  minWeight: number;
  standardDeviation: number;
  entropyScore: number;
  weightDistribution: 'uniform' | 'skewed' | 'bimodal' | 'concentrated';
}

// Sortable Item Component
function SortableWeightItem({
  option,
  index,
  percentage,
  isDragging,
  showWeights,
  showPercentages,
  allowWeightEditing,
  allowLocking,
  minWeight,
  maxWeight,
  themeStyles,
  animationDuration,
  onWeightChange,
  onLockToggle,
  onItemSelect,
  isSelected,
  draggedItemId
}: {
  option: WeightedOption;
  index: number;
  percentage: number;
  isDragging: boolean;
  showWeights: boolean;
  showPercentages: boolean;
  allowWeightEditing: boolean;
  allowLocking: boolean;
  minWeight: number;
  maxWeight: number;
  themeStyles: any;
  animationDuration: number;
  onWeightChange: (optionId: string, weight: number) => void;
  onLockToggle: (optionId: string) => void;
  onItemSelect: (optionId: string, selected: boolean) => void;
  isSelected: boolean;
  draggedItemId: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({
    id: option.id,
    disabled: option.locked
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const isCurrentlyDragging = isSortableDragging || draggedItemId === option.id;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        marginBottom: '12px',
        background: isCurrentlyDragging ? themeStyles.accent + '20' : themeStyles.background,
        border: `1px solid ${isCurrentlyDragging ? themeStyles.accent : themeStyles.border}`,
        borderRadius: '8px',
        padding: '16px',
        boxShadow: isCurrentlyDragging
          ? `0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px ${themeStyles.accent}`
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        transform: isCurrentlyDragging ? 'scale(1.02)' : 'scale(1)',
        transition: `all ${animationDuration}ms ease`,
        cursor: option.locked ? 'default' : 'grab',
        opacity: isCurrentlyDragging ? 0.9 : 1,
        userSelect: 'none'
      }}
      {...attributes}
      {...listeners}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* Drag Handle and Content */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          {/* Drag Handle */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            opacity: option.locked ? 0.3 : 0.6,
            cursor: option.locked ? 'default' : 'grab'
          }}>
            <div style={{
              width: '4px',
              height: '4px',
              backgroundColor: themeStyles.text,
              borderRadius: '50%'
            }} />
            <div style={{
              width: '4px',
              height: '4px',
              backgroundColor: themeStyles.text,
              borderRadius: '50%'
            }} />
            <div style={{
              width: '4px',
              height: '4px',
              backgroundColor: themeStyles.text,
              borderRadius: '50%'
            }} />
          </div>
          
          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onItemSelect(option.id, e.target.checked)}
            style={{
              accentColor: themeStyles.accent,
              transform: 'scale(1.2)'
            }}
          />
          
          {/* Text Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 500,
              color: themeStyles.text,
              marginBottom: '4px',
              wordBreak: 'break-word'
            }}>
              {option.text}
            </div>
            {option.category && (
              <div style={{
                fontSize: '12px',
                opacity: 0.6,
                color: themeStyles.accent,
                fontWeight: 500
              }}>
                {option.category}
              </div>
            )}
          </div>
        </div>

        {/* Weight Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: 'fit-content'
        }}>
          {/* Visual Weight Bar */}
          <div style={{
            width: '60px',
            height: '8px',
            backgroundColor: themeStyles.border,
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${Math.min(100, percentage)}%`,
              height: '100%',
              backgroundColor: option.color || themeStyles.accent,
              borderRadius: '4px',
              transition: `width ${animationDuration}ms ease`
            }} />
          </div>
          
          {/* Weight Input */}
          {allowWeightEditing && (
            <input
              type="number"
              min={minWeight}
              max={maxWeight}
              step={0.1}
              value={option.weight.toFixed(1)}
              onChange={(e) => onWeightChange(option.id, parseFloat(e.target.value) || minWeight)}
              style={{
                width: '60px',
                padding: '4px 6px',
                border: `1px solid ${themeStyles.border}`,
                borderRadius: '4px',
                backgroundColor: themeStyles.background,
                color: themeStyles.text,
                fontSize: '12px',
                textAlign: 'center'
              }}
            />
          )}
          
          {/* Weight Display */}
          {showWeights && !allowWeightEditing && (
            <span style={{
              minWidth: '40px',
              textAlign: 'right',
              fontSize: '12px',
              fontWeight: 600,
              color: themeStyles.text
            }}>
              {option.weight.toFixed(1)}
            </span>
          )}
          
          {/* Percentage Display */}
          {showPercentages && (
            <span style={{
              minWidth: '45px',
              textAlign: 'right',
              fontSize: '12px',
              opacity: 0.7,
              color: themeStyles.accent
            }}>
              {percentage.toFixed(1)}%
            </span>
          )}
          
          {/* Lock Toggle */}
          {allowLocking && (
            <button
              onClick={() => onLockToggle(option.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: option.locked ? themeStyles.accent : themeStyles.text,
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                opacity: option.locked ? 1 : 0.6,
                fontSize: '14px'
              }}
              title={option.locked ? 'Unlock weight' : 'Lock weight'}
            >
              {option.locked ? '🔒' : '🔓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Utility function to calculate weight statistics
function calculateWeightStatistics(options: WeightedOption[]): WeightStatistics {
  if (options.length === 0) {
    return {
      totalWeight: 0,
      averageWeight: 0,
      medianWeight: 0,
      maxWeight: 0,
      minWeight: 0,
      standardDeviation: 0,
      entropyScore: 0,
      weightDistribution: 'uniform'
    };
  }
  
  const weights = options.map(o => o.weight);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const averageWeight = totalWeight / weights.length;
  
  const sortedWeights = [...weights].sort((a, b) => a - b);
  const medianWeight = sortedWeights.length % 2 === 0
    ? (sortedWeights[sortedWeights.length / 2 - 1] + sortedWeights[sortedWeights.length / 2]) / 2
    : sortedWeights[Math.floor(sortedWeights.length / 2)];
    
  const maxWeight = Math.max(...weights);
  const minWeight = Math.min(...weights);
  
  const variance = weights.reduce((sum, w) => sum + Math.pow(w - averageWeight, 2), 0) / weights.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Calculate entropy (measure of randomness/distribution)
  const probabilities = totalWeight > 0 ? weights.map(w => w / totalWeight) : weights.map(() => 1 / weights.length);
  const entropyScore = -probabilities.reduce((sum, p) => p > 0 ? sum + p * Math.log2(p) : sum, 0);
  
  // Determine distribution type
  const cv = averageWeight > 0 ? standardDeviation / averageWeight : 0;
  let weightDistribution: 'uniform' | 'skewed' | 'bimodal' | 'concentrated';
  if (cv < 0.2) {
    weightDistribution = 'uniform';
  } else if (cv < 0.5) {
    weightDistribution = 'concentrated';
  } else {
    // Simple bimodal detection: check if there are distinct clusters
    const isSkewed = Math.abs(averageWeight - medianWeight) / standardDeviation > 0.5;
    weightDistribution = isSkewed ? 'skewed' : 'bimodal';
  }
  
  return {
    totalWeight,
    averageWeight,
    medianWeight,
    maxWeight,
    minWeight,
    standardDeviation,
    entropyScore,
    weightDistribution
  };
}

export const DragReorderWeightManager: React.FC<DragReorderProps> = ({
  options,
  onChange,
  disabled = false,
  showWeights = true,
  showPercentages = true,
  allowWeightEditing = true,
  allowLocking = false,
  minWeight = 0,
  maxWeight = 100,
  totalWeight,
  onWeightChange,
  className = '',
  style,
  theme = 'dark',
  showVisualWeights = true,
  animationDuration = 200,
  snapToGrid = false,
  enableCategories = false,
  enableBulkOperations = false,
  enablePresets = false,
  showStatistics = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate total weight and percentages
  const actualTotalWeight = totalWeight || options.reduce((sum, option) => sum + option.weight, 0);
  const optionsWithPercentages = options.map(option => ({
    ...option,
    percentage: actualTotalWeight > 0 ? (option.weight / actualTotalWeight) * 100 : 0
  }));

  // Calculate statistics
  const statistics: WeightStatistics = calculateWeightStatistics(options);

  // Configure sensors for better touch and keyboard support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setIsDragging(true);
    setDraggedItemId(event.active.id as string);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setIsDragging(false);
    setDraggedItemId(null);
    
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = options.findIndex(option => option.id === active.id);
      const newIndex = options.findIndex(option => option.id === over.id);
      
      onChange(arrayMove(options, oldIndex, newIndex));
    }
  }, [options, onChange]);

  // Handle weight change
  const handleWeightChange = useCallback((optionId: string, newWeight: number) => {
    if (newWeight < minWeight || newWeight > maxWeight) return;
    
    const newOptions = options.map(option => 
      option.id === optionId ? { ...option, weight: newWeight } : option
    );
    
    const option = newOptions.find(opt => opt.id === optionId);
    if (option && onWeightChange) {
      const newTotal = newOptions.reduce((sum, opt) => sum + opt.weight, 0);
      const percentage = newTotal > 0 ? (newWeight / newTotal) * 100 : 0;
      onWeightChange(optionId, newWeight, percentage);
    }
    
    onChange(newOptions);
  }, [options, onChange, onWeightChange, minWeight, maxWeight]);

  // Handle lock toggle
  const handleLockToggle = useCallback((optionId: string) => {
    const newOptions = options.map(option => 
      option.id === optionId ? { ...option, locked: !option.locked } : option
    );
    onChange(newOptions);
  }, [options, onChange]);

  // Bulk operations
  const handleBulkWeightChange = useCallback((operation: 'normalize' | 'equal' | 'random' | 'clear') => {
    let newOptions = [...options];
    
    switch (operation) {
    case 'normalize':
      // Normalize weights to sum to 100
      const currentTotal = options.reduce((sum, opt) => sum + opt.weight, 0);
      if (currentTotal > 0) {
        newOptions = options.map(option => ({
          ...option,
          weight: (option.weight / currentTotal) * 100
        }));
      }
      break;
        
    case 'equal':
      // Set all weights equal
      const equalWeight = 100 / options.length;
      newOptions = options.map(option => ({
        ...option,
        weight: option.locked ? option.weight : equalWeight
      }));
      break;
        
    case 'random':
      // Generate random weights
      newOptions = options.map(option => {
        if (option.locked) return option;
        return {
          ...option,
          weight: Math.random() * 50 + 10 // Random between 10-60
        };
      });
      break;
        
    case 'clear':
      // Reset all unlocked weights to minimum
      newOptions = options.map(option => ({
        ...option,
        weight: option.locked ? option.weight : minWeight
      }));
      break;
    }
    
    onChange(newOptions);
    setSelectedItems(new Set());
    setShowBulkActions(false);
  }, [options, onChange, minWeight]);

  // Handle item selection for bulk operations
  const handleItemSelect = useCallback((optionId: string, isSelected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (isSelected) {
      newSelected.add(optionId);
    } else {
      newSelected.delete(optionId);
    }
    setSelectedItems(newSelected);
    setShowBulkActions(newSelected.size > 0);
  }, [selectedItems]);

  // Theme styles
  const getThemeStyles = () => {
    const themes = {
      light: {
        background: '#ffffff',
        border: '#e5e7eb',
        text: '#374151',
        accent: '#3b82f6',
        hover: '#f9fafb'
      },
      dark: {
        background: '#1f2937',
        border: '#4b5563',
        text: '#f9fafb',
        accent: '#60a5fa',
        hover: '#374151'
      },
      cinema: {
        background: '#1a1a1a',
        border: '#ff7c00',
        text: '#ffffff',
        accent: '#ff7c00',
        hover: '#2d2d2d'
      }
    };
    return themes[theme];
  };

  const themeStyles = getThemeStyles();

  // Find the dragged option for drag overlay
  const draggedOption = draggedItemId ? options.find(opt => opt.id === draggedItemId) : null;
  const draggedPercentage = draggedOption ? (actualTotalWeight > 0 ? (draggedOption.weight / actualTotalWeight) * 100 : 0) : 0;

  return (
    <div 
      ref={containerRef}
      className={`drag-reorder-weight-manager ${className}`}
      style={{
        backgroundColor: themeStyles.background,
        border: `1px solid ${themeStyles.border}`,
        borderRadius: '12px',
        padding: '24px',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: themeStyles.text,
        ...style
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: `1px solid ${themeStyles.border}`,
        paddingBottom: '16px'
      }}>
        <div>
          <h3 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: 600,
            color: themeStyles.text
          }}>
            Weight Management
          </h3>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '14px', 
            opacity: 0.7 
          }}>
            Drag items to reorder, adjust weights for probability control
          </p>
        </div>
        
        {enableBulkOperations && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              style={{
                background: showBulkActions ? themeStyles.accent : 'transparent',
                border: `1px solid ${themeStyles.accent}`,
                color: showBulkActions ? '#white' : themeStyles.accent,
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Bulk Actions
            </button>
          </div>
        )}
      </div>

      {/* Statistics Panel */}
      {showStatistics && (
        <div style={{
          background: themeStyles.hover,
          border: `1px solid ${themeStyles.border}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 600, color: themeStyles.accent }}>
              {statistics.totalWeight.toFixed(1)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Total Weight</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 600, color: themeStyles.accent }}>
              {statistics.averageWeight.toFixed(1)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Average</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 600, color: themeStyles.accent }}>
              {statistics.entropyScore.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Entropy</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 600, color: themeStyles.accent }}>
              {statistics.weightDistribution.toUpperCase()}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Distribution</div>
          </div>
        </div>
      )}

      {/* Bulk Actions Panel */}
      {showBulkActions && enableBulkOperations && (
        <div style={{
          background: themeStyles.hover,
          border: `1px solid ${themeStyles.border}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              Bulk Actions ({selectedItems.size} selected):
            </span>
            <button
              onClick={() => handleBulkWeightChange('equal')}
              style={{
                background: 'transparent',
                border: `1px solid ${themeStyles.accent}`,
                color: themeStyles.accent,
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Equal Weights
            </button>
            <button
              onClick={() => handleBulkWeightChange('normalize')}
              style={{
                background: 'transparent',
                border: `1px solid ${themeStyles.accent}`,
                color: themeStyles.accent,
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Normalize
            </button>
            <button
              onClick={() => handleBulkWeightChange('random')}
              style={{
                background: 'transparent',
                border: `1px solid ${themeStyles.accent}`,
                color: themeStyles.accent,
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Randomize
            </button>
            <button
              onClick={() => handleBulkWeightChange('clear')}
              style={{
                background: 'transparent',
                border: '1px solid #ef4444',
                color: '#ef4444',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Drag and Drop List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={options.map(opt => opt.id)} strategy={verticalListSortingStrategy}>
          <div style={{
            minHeight: '200px',
            borderRadius: '8px',
            padding: '8px'
          }}>
            {optionsWithPercentages.map((option, index) => (
              <SortableWeightItem
                key={option.id}
                option={option}
                index={index}
                percentage={option.percentage}
                isDragging={isDragging}
                showWeights={showWeights}
                showPercentages={showPercentages}
                allowWeightEditing={allowWeightEditing}
                allowLocking={allowLocking}
                minWeight={minWeight}
                maxWeight={maxWeight}
                themeStyles={themeStyles}
                animationDuration={animationDuration}
                onWeightChange={handleWeightChange}
                onLockToggle={handleLockToggle}
                onItemSelect={handleItemSelect}
                isSelected={selectedItems.has(option.id)}
                draggedItemId={draggedItemId}
              />
            ))}
          </div>
        </SortableContext>
        
        {/* Drag Overlay */}
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5'
                }
              }
            })
          }}
        >
          {draggedOption ? (
            <div style={{
              background: themeStyles.accent + '20',
              border: `1px solid ${themeStyles.accent}`,
              borderRadius: '8px',
              padding: '16px',
              boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px ${themeStyles.accent}`,
              transform: 'scale(1.02)',
              userSelect: 'none',
              cursor: 'grabbing'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 500,
                color: themeStyles.text,
                marginBottom: '4px'
              }}>
                {draggedOption.text}
              </div>
              <div style={{
                fontSize: '12px',
                opacity: 0.7,
                color: themeStyles.accent
              }}>
                {draggedPercentage.toFixed(1)}% - {draggedOption.weight.toFixed(1)}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default DragReorderWeightManager;