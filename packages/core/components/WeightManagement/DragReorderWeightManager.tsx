/**
 * Drag-to-Reorder Weight Manager
 * Epic 8.3 Task 3 - Drag-to-Reorder Interface (E8.3-3-drag-reorder)
 * 
 * Intuitive weight management with drag-and-drop reordering for Wild Construct demo
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

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
  minWeight: number;
  maxWeight: number;
  weightDistribution: 'even' | 'skewed' | 'concentrated';
  entropyScore: number; // Measure of randomness
}

/**
 * Professional drag-and-drop weight management component
 */
export const DragReorderWeightManager: React.FC<DragReorderProps> = ({
  options,
  onChange,
  disabled = false,
  showWeights = true,
  showPercentages = true,
  allowWeightEditing = true,
  allowLocking = false,
  minWeight = 0.1,
  maxWeight = 100,
  totalWeight,
  onWeightChange,
  className = '',
  style,
  theme = 'cinema',
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
  const [editingWeight, setEditingWeight] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Refs for smooth animations
  const containerRef = useRef<HTMLDivElement>(null);
    
  // Calculate total weight and percentages
  const calculatedTotalWeight = totalWeight || options.reduce((sum, opt) => sum + opt.weight, 0);
  const optionsWithPercentages = options.map(option => ({
    ...option,
    percentage: calculatedTotalWeight > 0 ? (option.weight / calculatedTotalWeight) * 100 : 0
  }));

  // Calculate statistics
  const statistics: WeightStatistics = calculateWeightStatistics(options);

  // Handle drag end
  const handleDragEnd = useCallback((result: DropResult) => {
    setIsDragging(false);
    setDraggedItemId(null);
    
    if (!result.destination) return;
    
    const { source, destination } = result;
    if (source.index === destination.index) return;
    
    const newOptions = Array.from(options);
    const [reorderedItem] = newOptions.splice(source.index, 1);
    newOptions.splice(destination.index, 0, reorderedItem);
    
    onChange(newOptions);
  }, [options, onChange]);

  // Handle drag start
  const handleDragStart = useCallback((start: any) => {
    setIsDragging(true);
    setDraggedItemId(start.draggableId);
  }, []);

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
          marginBottom: '20px'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap',
            alignItems: 'center' 
          }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Bulk Operations'}:
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
                border: `1px solid #ef4444`,
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
      <DragDropContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <Droppable droppableId="weight-list">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                minHeight: '200px',
                background: snapshot.isDraggingOver ? themeStyles.hover : 'transparent',
                borderRadius: '8px',
                transition: `background-color ${animationDuration}ms ease`,
                padding: '8px'
              }}
            >
              {optionsWithPercentages.map((option, index) => (
                <Draggable
                  key={option.id}
                  draggableId={option.id}
                  index={index}
                  isDragDisabled={disabled || option.locked}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        marginBottom: '12px',
                        background: snapshot.isDragging ? themeStyles.accent + '20' : themeStyles.background,
                        border: `1px solid ${snapshot.isDragging ? themeStyles.accent : themeStyles.border}`,
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: snapshot.isDragging 
                          ? `0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px ${themeStyles.accent}` 
                          : '0 2px 8px rgba(0, 0, 0, 0.1)',
                        transition: snapshot.isDragging ? 'none' : `all ${animationDuration}ms ease`,
                        transform: snapshot.isDragging 
                          ? `${provided.draggableProps.style?.transform} rotate(2deg)`
                          : provided.draggableProps.style?.transform,
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          style={{
                            cursor: disabled || option.locked ? 'not-allowed' : 'grab',
                            color: themeStyles.accent,
                            fontSize: '16px',
                            opacity: disabled || option.locked ? 0.4 : 0.7
                          }}
                        >
                          ⋮⋮
                        </div>

                        {/* Selection Checkbox (for bulk operations) */}
                        {enableBulkOperations && (
                          <input
                            type="checkbox"
                            checked={selectedItems.has(option.id)}
                            onChange={(e) => handleItemSelect(option.id, e.target.checked)}
                            style={{
                              accentColor: themeStyles.accent,
                              cursor: 'pointer'
                            }}
                          />
                        )}

                        {/* Visual Weight Bar */}
                        {showVisualWeights && (
                          <div style={{
                            width: '60px',
                            height: '8px',
                            background: themeStyles.border,
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div
                              style={{
                                width: `${Math.max(5, option.percentage)}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, ${themeStyles.accent}, ${themeStyles.accent}80)`,
                                transition: `width ${animationDuration}ms ease`,
                                borderRadius: '4px'
                              }}
                            />
                          </div>
                        )}

                        {/* Option Text */}
                        <div style={{ 
                          flex: 1, 
                          fontSize: '15px',
                          fontWeight: 500,
                          opacity: option.locked ? 0.6 : 1
                        }}>
                          {option.text}
                          {option.category && (
                            <div style={{ 
                              fontSize: '12px', 
                              opacity: 0.7,
                              marginTop: '2px'
                            }}>
                              {option.category}
                            </div>
                          )}
                        </div>

                        {/* Weight Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {showWeights && (
                            <div style={{ minWidth: '80px', textAlign: 'right' }}>
                              {editingWeight === option.id ? (
                                <input
                                  type="number"
                                  value={option.weight}
                                  onChange={(e) => handleWeightChange(option.id, parseFloat(e.target.value) || minWeight)}
                                  onBlur={() => setEditingWeight(null)}
                                  onKeyPress={(e) => e.key === 'Enter' && setEditingWeight(null)}
                                  min={minWeight}
                                  max={maxWeight}
                                  step={0.1}
                                  autoFocus
                                  style={{
                                    width: '70px',
                                    padding: '4px 8px',
                                    border: `1px solid ${themeStyles.accent}`,
                                    borderRadius: '4px',
                                    background: themeStyles.background,
                                    color: themeStyles.text,
                                    fontSize: '14px',
                                    textAlign: 'right'
                                  }}
                                />
                              ) : (
                                <span
                                  onClick={() => allowWeightEditing && setEditingWeight(option.id)}
                                  style={{
                                    cursor: allowWeightEditing ? 'pointer' : 'default',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: themeStyles.accent,
                                    padding: '4px',
                                    borderRadius: '4px',
                                    transition: `background-color ${animationDuration}ms ease`
                                  }}
                                  onMouseOver={(e) => allowWeightEditing && (e.currentTarget.style.background = themeStyles.hover)}
                                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                  {option.weight.toFixed(1)}
                                </span>
                              )}
                            </div>
                          )}

                          {showPercentages && (
                            <div style={{ 
                              minWidth: '50px',
                              textAlign: 'right',
                              fontSize: '13px',
                              opacity: 0.7,
                              fontWeight: 500
                            }}>
                              {option.percentage.toFixed(1)}%
                            </div>
                          )}

                          {allowLocking && (
                            <button
                              onClick={() => handleLockToggle(option.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: option.locked ? '#ef4444' : themeStyles.text,
                                cursor: 'pointer',
                                fontSize: '16px',
                                opacity: option.locked ? 1 : 0.5,
                                padding: '4px',
                                borderRadius: '4px',
                                transition: `all ${animationDuration}ms ease`
                              }}
                              title={option.locked ? 'Unlock weight' : 'Lock weight'}
                            >
                              {option.locked ? '🔒' : '🔓'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Footer */}
      <div style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: `1px solid ${themeStyles.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        opacity: 0.7
      }}>
        <div>
          {options.length} {options.length === 1 ? 'option' : 'options'}
          {calculatedTotalWeight > 0 && ` • Total weight: ${calculatedTotalWeight.toFixed(1)}`}
        </div>
        <div>
          {theme === 'cinema' && '🎬 Cinema Mode'}
        </div>
      </div>
    </div>
  );
};

// Utility function to calculate weight statistics
function calculateWeightStatistics(options: WeightedOption[]): WeightStatistics {
  if (options.length === 0) {
    return {
      totalWeight: 0,
      averageWeight: 0,
      minWeight: 0,
      maxWeight: 0,
      weightDistribution: 'even',
      entropyScore: 0
    };
  }

  const weights = options.map(opt => opt.weight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const averageWeight = totalWeight / weights.length;
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  // Calculate entropy (measure of randomness/evenness)
  const probabilities = weights.map(weight => totalWeight > 0 ? weight / totalWeight : 0);
  const entropyScore = -probabilities.reduce((sum, p) => p > 0 ? sum + p * Math.log2(p) : sum, 0);

  // Determine distribution type
  const variance = weights.reduce((sum, weight) => sum + Math.pow(weight - averageWeight, 2), 0) / weights.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = averageWeight > 0 ? standardDeviation / averageWeight : 0;

  let weightDistribution: 'even' | 'skewed' | 'concentrated';
  if (coefficientOfVariation < 0.3) {
    weightDistribution = 'even';
  } else if (coefficientOfVariation < 0.8) {
    weightDistribution = 'skewed';
  } else {
    weightDistribution = 'concentrated';
  }

  return {
    totalWeight,
    averageWeight,
    minWeight,
    maxWeight,
    weightDistribution,
    entropyScore
  };
}

export default DragReorderWeightManager;