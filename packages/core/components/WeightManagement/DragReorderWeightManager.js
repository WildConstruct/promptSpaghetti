import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Drag-to-Reorder Weight Manager
 * Epic 8.3 Task 3 - Drag-to-Reorder Interface (E8.3-3-drag-reorder)
 *
 * Intuitive weight management with drag-and-drop reordering for Wild Construct demo
 */
import { useState, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
/**
 * Professional drag-and-drop weight management component
 */
export const DragReorderWeightManager = ({ options, onChange, disabled = false, showWeights = true, showPercentages = true, allowWeightEditing = true, allowLocking = false, minWeight = 0.1, maxWeight = 100, totalWeight, onWeightChange, className = '', style, theme = 'cinema', showVisualWeights = true, animationDuration = 200, snapToGrid = false, enableCategories = false, enableBulkOperations = false, enablePresets = false, showStatistics = false }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [draggedItemId, setDraggedItemId] = useState(null);
    const [editingWeight, setEditingWeight] = useState(null);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);
    // Refs for smooth animations
    const containerRef = useRef(null);
    // Calculate total weight and percentages
    const calculatedTotalWeight = totalWeight || options.reduce((sum, opt) => sum + opt.weight, 0);
    const optionsWithPercentages = options.map(option => ({
        ...option,
        percentage: calculatedTotalWeight > 0 ? (option.weight / calculatedTotalWeight) * 100 : 0
    }));
    // Calculate statistics
    const statistics = calculateWeightStatistics(options);
    // Handle drag end
    const handleDragEnd = useCallback((result) => {
        setIsDragging(false);
        setDraggedItemId(null);
        if (!result.destination)
            return;
        const { source, destination } = result;
        if (source.index === destination.index)
            return;
        const newOptions = Array.from(options);
        const [reorderedItem] = newOptions.splice(source.index, 1);
        newOptions.splice(destination.index, 0, reorderedItem);
        onChange(newOptions);
    }, [options, onChange]);
    // Handle drag start
    const handleDragStart = useCallback((start) => {
        setIsDragging(true);
        setDraggedItemId(start.draggableId);
    }, []);
    // Handle weight change
    const handleWeightChange = useCallback((optionId, newWeight) => {
        if (newWeight < minWeight || newWeight > maxWeight)
            return;
        const newOptions = options.map(option => option.id === optionId ? { ...option, weight: newWeight } : option);
        const option = newOptions.find(opt => opt.id === optionId);
        if (option && onWeightChange) {
            const newTotal = newOptions.reduce((sum, opt) => sum + opt.weight, 0);
            const percentage = newTotal > 0 ? (newWeight / newTotal) * 100 : 0;
            onWeightChange(optionId, newWeight, percentage);
        }
        onChange(newOptions);
    }, [options, onChange, onWeightChange, minWeight, maxWeight]);
    // Handle lock toggle
    const handleLockToggle = useCallback((optionId) => {
        const newOptions = options.map(option => option.id === optionId ? { ...option, locked: !option.locked } : option);
        onChange(newOptions);
    }, [options, onChange]);
    // Bulk operations
    const handleBulkWeightChange = useCallback((operation) => {
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
                    if (option.locked)
                        return option;
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
    const handleItemSelect = useCallback((optionId, isSelected) => {
        const newSelected = new Set(selectedItems);
        if (isSelected) {
            newSelected.add(optionId);
        }
        else {
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
    return (_jsxs("div", { ref: containerRef, className: `drag-reorder-weight-manager ${className}`, style: {
            backgroundColor: themeStyles.background,
            border: `1px solid ${themeStyles.border}`,
            borderRadius: '12px',
            padding: '24px',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: themeStyles.text,
            ...style
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    borderBottom: `1px solid ${themeStyles.border}`,
                    paddingBottom: '16px'
                }, children: [_jsxs("div", { children: [_jsx("h3", { style: {
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: themeStyles.text
                                }, children: "Weight Management" }), _jsx("p", { style: {
                                    margin: '4px 0 0 0',
                                    fontSize: '14px',
                                    opacity: 0.7
                                }, children: "Drag items to reorder, adjust weights for probability control" })] }), enableBulkOperations && (_jsx("div", { style: { display: 'flex', gap: '8px' }, children: _jsx("button", { onClick: () => setShowBulkActions(!showBulkActions), style: {
                                background: showBulkActions ? themeStyles.accent : 'transparent',
                                border: `1px solid ${themeStyles.accent}`,
                                color: showBulkActions ? '#white' : themeStyles.accent,
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }, children: "Bulk Actions" }) }))] }), showStatistics && (_jsxs("div", { style: {
                    background: themeStyles.hover,
                    border: `1px solid ${themeStyles.border}`,
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '12px'
                }, children: [_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '20px', fontWeight: 600, color: themeStyles.accent }, children: statistics.totalWeight.toFixed(1) }), _jsx("div", { style: { fontSize: '12px', opacity: 0.7 }, children: "Total Weight" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '20px', fontWeight: 600, color: themeStyles.accent }, children: statistics.averageWeight.toFixed(1) }), _jsx("div", { style: { fontSize: '12px', opacity: 0.7 }, children: "Average" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '20px', fontWeight: 600, color: themeStyles.accent }, children: statistics.entropyScore.toFixed(2) }), _jsx("div", { style: { fontSize: '12px', opacity: 0.7 }, children: "Entropy" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '20px', fontWeight: 600, color: themeStyles.accent }, children: statistics.weightDistribution.toUpperCase() }), _jsx("div", { style: { fontSize: '12px', opacity: 0.7 }, children: "Distribution" })] })] })), showBulkActions && enableBulkOperations && (_jsx("div", { style: {
                    background: themeStyles.hover,
                    border: `1px solid ${themeStyles.border}`,
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '20px'
                }, children: _jsxs("div", { style: {
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }, children: [_jsxs("span", { style: { fontSize: '14px', fontWeight: 500 }, children: [selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Bulk Operations', ":"] }), _jsx("button", { onClick: () => handleBulkWeightChange('equal'), style: {
                                background: 'transparent',
                                border: `1px solid ${themeStyles.accent}`,
                                color: themeStyles.accent,
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }, children: "Equal Weights" }), _jsx("button", { onClick: () => handleBulkWeightChange('normalize'), style: {
                                background: 'transparent',
                                border: `1px solid ${themeStyles.accent}`,
                                color: themeStyles.accent,
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }, children: "Normalize" }), _jsx("button", { onClick: () => handleBulkWeightChange('random'), style: {
                                background: 'transparent',
                                border: `1px solid ${themeStyles.accent}`,
                                color: themeStyles.accent,
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }, children: "Randomize" }), _jsx("button", { onClick: () => handleBulkWeightChange('clear'), style: {
                                background: 'transparent',
                                border: `1px solid #ef4444`,
                                color: '#ef4444',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }, children: "Clear" })] }) })), _jsx(DragDropContext, { onDragEnd: handleDragEnd, onDragStart: handleDragStart, children: _jsx(Droppable, { droppableId: "weight-list", children: (provided, snapshot) => (_jsxs("div", { ...provided.droppableProps, ref: provided.innerRef, style: {
                            minHeight: '200px',
                            background: snapshot.isDraggingOver ? themeStyles.hover : 'transparent',
                            borderRadius: '8px',
                            transition: `background-color ${animationDuration}ms ease`,
                            padding: '8px'
                        }, children: [optionsWithPercentages.map((option, index) => (_jsx(Draggable, { draggableId: option.id, index: index, isDragDisabled: disabled || option.locked, children: (provided, snapshot) => (_jsx("div", { ref: provided.innerRef, ...provided.draggableProps, style: {
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
                                    }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx("div", { ...provided.dragHandleProps, style: {
                                                    cursor: disabled || option.locked ? 'not-allowed' : 'grab',
                                                    color: themeStyles.accent,
                                                    fontSize: '16px',
                                                    opacity: disabled || option.locked ? 0.4 : 0.7
                                                }, children: "\u22EE\u22EE" }), enableBulkOperations && (_jsx("input", { type: "checkbox", checked: selectedItems.has(option.id), onChange: (e) => handleItemSelect(option.id, e.target.checked), style: {
                                                    accentColor: themeStyles.accent,
                                                    cursor: 'pointer'
                                                } })), showVisualWeights && (_jsx("div", { style: {
                                                    width: '60px',
                                                    height: '8px',
                                                    background: themeStyles.border,
                                                    borderRadius: '4px',
                                                    overflow: 'hidden'
                                                }, children: _jsx("div", { style: {
                                                        width: `${Math.max(5, option.percentage)}%`,
                                                        height: '100%',
                                                        background: `linear-gradient(90deg, ${themeStyles.accent}, ${themeStyles.accent}80)`,
                                                        transition: `width ${animationDuration}ms ease`,
                                                        borderRadius: '4px'
                                                    } }) })), _jsxs("div", { style: {
                                                    flex: 1,
                                                    fontSize: '15px',
                                                    fontWeight: 500,
                                                    opacity: option.locked ? 0.6 : 1
                                                }, children: [option.text, option.category && (_jsx("div", { style: {
                                                            fontSize: '12px',
                                                            opacity: 0.7,
                                                            marginTop: '2px'
                                                        }, children: option.category }))] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [showWeights && (_jsx("div", { style: { minWidth: '80px', textAlign: 'right' }, children: editingWeight === option.id ? (_jsx("input", { type: "number", value: option.weight, onChange: (e) => handleWeightChange(option.id, parseFloat(e.target.value) || minWeight), onBlur: () => setEditingWeight(null), onKeyPress: (e) => e.key === 'Enter' && setEditingWeight(null), min: minWeight, max: maxWeight, step: 0.1, autoFocus: true, style: {
                                                                width: '70px',
                                                                padding: '4px 8px',
                                                                border: `1px solid ${themeStyles.accent}`,
                                                                borderRadius: '4px',
                                                                background: themeStyles.background,
                                                                color: themeStyles.text,
                                                                fontSize: '14px',
                                                                textAlign: 'right'
                                                            } })) : (_jsx("span", { onClick: () => allowWeightEditing && setEditingWeight(option.id), style: {
                                                                cursor: allowWeightEditing ? 'pointer' : 'default',
                                                                fontSize: '14px',
                                                                fontWeight: 600,
                                                                color: themeStyles.accent,
                                                                padding: '4px',
                                                                borderRadius: '4px',
                                                                transition: `background-color ${animationDuration}ms ease`
                                                            }, onMouseOver: (e) => allowWeightEditing && (e.currentTarget.style.background = themeStyles.hover), onMouseOut: (e) => (e.currentTarget.style.background = 'transparent'), children: option.weight.toFixed(1) })) })), showPercentages && (_jsxs("div", { style: {
                                                            minWidth: '50px',
                                                            textAlign: 'right',
                                                            fontSize: '13px',
                                                            opacity: 0.7,
                                                            fontWeight: 500
                                                        }, children: [option.percentage.toFixed(1), "%"] })), allowLocking && (_jsx("button", { onClick: () => handleLockToggle(option.id), style: {
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: option.locked ? '#ef4444' : themeStyles.text,
                                                            cursor: 'pointer',
                                                            fontSize: '16px',
                                                            opacity: option.locked ? 1 : 0.5,
                                                            padding: '4px',
                                                            borderRadius: '4px',
                                                            transition: `all ${animationDuration}ms ease`
                                                        }, title: option.locked ? 'Unlock weight' : 'Lock weight', children: option.locked ? '🔒' : '🔓' }))] })] }) })) }, option.id))), provided.placeholder] })) }) }), _jsxs("div", { style: {
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: `1px solid ${themeStyles.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '14px',
                    opacity: 0.7
                }, children: [_jsxs("div", { children: [options.length, " ", options.length === 1 ? 'option' : 'options', calculatedTotalWeight > 0 && ` • Total weight: ${calculatedTotalWeight.toFixed(1)}`] }), _jsx("div", { children: theme === 'cinema' && '🎬 Cinema Mode' })] })] }));
};
// Utility function to calculate weight statistics
function calculateWeightStatistics(options) {
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
    let weightDistribution;
    if (coefficientOfVariation < 0.3) {
        weightDistribution = 'even';
    }
    else if (coefficientOfVariation < 0.8) {
        weightDistribution = 'skewed';
    }
    else {
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
