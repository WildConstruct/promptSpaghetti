import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Drag-to-Reorder Weight Manager
 * Epic 8.3 Task 3 - Drag-to-Reorder Interface (E8.3-3-drag-reorder)
 *
 * Intuitive weight management with drag-and-drop reordering for Wild Construct demo
 * Migrated from react-beautiful-dnd to @dnd-kit for modern React 18+ support
 */
import { useState, useCallback, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
// Sortable Item Component
function SortableWeightItem({ option, index, percentage, isDragging, showWeights, showPercentages, allowWeightEditing, allowLocking, minWeight, maxWeight, themeStyles, animationDuration, onWeightChange, onLockToggle, onItemSelect, isSelected, draggedItemId }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
        id: option.id,
        disabled: option.locked
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };
    const isCurrentlyDragging = isSortableDragging || draggedItemId === option.id;
    return (_jsx("div", { ref: setNodeRef, style: {
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
        }, ...attributes, ...listeners, children: _jsxs("div", { style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                                opacity: option.locked ? 0.3 : 0.6,
                                cursor: option.locked ? 'default' : 'grab'
                            }, children: [_jsx("div", { style: {
                                        width: '4px',
                                        height: '4px',
                                        backgroundColor: themeStyles.text,
                                        borderRadius: '50%'
                                    } }), _jsx("div", { style: {
                                        width: '4px',
                                        height: '4px',
                                        backgroundColor: themeStyles.text,
                                        borderRadius: '50%'
                                    } }), _jsx("div", { style: {
                                        width: '4px',
                                        height: '4px',
                                        backgroundColor: themeStyles.text,
                                        borderRadius: '50%'
                                    } })] }), _jsx("input", { type: "checkbox", checked: isSelected, onChange: (e) => onItemSelect(option.id, e.target.checked), style: {
                                accentColor: themeStyles.accent,
                                transform: 'scale(1.2)'
                            } }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: {
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: themeStyles.text,
                                        marginBottom: '4px',
                                        wordBreak: 'break-word'
                                    }, children: option.text }), option.category && (_jsx("div", { style: {
                                        fontSize: '12px',
                                        opacity: 0.6,
                                        color: themeStyles.accent,
                                        fontWeight: 500
                                    }, children: option.category }))] })] }), _jsxs("div", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        minWidth: 'fit-content'
                    }, children: [_jsx("div", { style: {
                                width: '60px',
                                height: '8px',
                                backgroundColor: themeStyles.border,
                                borderRadius: '4px',
                                overflow: 'hidden',
                                position: 'relative'
                            }, children: _jsx("div", { style: {
                                    width: `${Math.min(100, percentage)}%`,
                                    height: '100%',
                                    backgroundColor: option.color || themeStyles.accent,
                                    borderRadius: '4px',
                                    transition: `width ${animationDuration}ms ease`
                                } }) }), allowWeightEditing && (_jsx("input", { type: "number", min: minWeight, max: maxWeight, step: 0.1, value: option.weight.toFixed(1), onChange: (e) => onWeightChange(option.id, parseFloat(e.target.value) || minWeight), style: {
                                width: '60px',
                                padding: '4px 6px',
                                border: `1px solid ${themeStyles.border}`,
                                borderRadius: '4px',
                                backgroundColor: themeStyles.background,
                                color: themeStyles.text,
                                fontSize: '12px',
                                textAlign: 'center'
                            } })), showWeights && !allowWeightEditing && (_jsx("span", { style: {
                                minWidth: '40px',
                                textAlign: 'right',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: themeStyles.text
                            }, children: option.weight.toFixed(1) })), showPercentages && (_jsxs("span", { style: {
                                minWidth: '45px',
                                textAlign: 'right',
                                fontSize: '12px',
                                opacity: 0.7,
                                color: themeStyles.accent
                            }, children: [percentage.toFixed(1), "%"] })), allowLocking && (_jsx("button", { onClick: () => onLockToggle(option.id), style: {
                                background: 'transparent',
                                border: 'none',
                                color: option.locked ? themeStyles.accent : themeStyles.text,
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                opacity: option.locked ? 1 : 0.6,
                                fontSize: '14px'
                            }, title: option.locked ? 'Unlock weight' : 'Lock weight', children: option.locked ? '🔒' : '🔓' }))] })] }) }));
}
// Utility function to calculate weight statistics
function calculateWeightStatistics(options) {
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
    let weightDistribution;
    if (cv < 0.2) {
        weightDistribution = 'uniform';
    }
    else if (cv < 0.5) {
        weightDistribution = 'concentrated';
    }
    else {
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
export const DragReorderWeightManager = ({ options, onChange, disabled = false, showWeights = true, showPercentages = true, allowWeightEditing = true, allowLocking = false, minWeight = 0, maxWeight = 100, totalWeight, onWeightChange, className = '', style, theme = 'dark', showVisualWeights = true, animationDuration = 200, snapToGrid = false, enableCategories = false, enableBulkOperations = false, enablePresets = false, showStatistics = false }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [draggedItemId, setDraggedItemId] = useState(null);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);
    const containerRef = useRef(null);
    // Calculate total weight and percentages
    const actualTotalWeight = totalWeight || options.reduce((sum, option) => sum + option.weight, 0);
    const optionsWithPercentages = options.map(option => ({
        ...option,
        percentage: actualTotalWeight > 0 ? (option.weight / actualTotalWeight) * 100 : 0
    }));
    // Calculate statistics
    const statistics = calculateWeightStatistics(options);
    // Configure sensors for better touch and keyboard support
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8
        }
    }), useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates
    }));
    // Handle drag start
    const handleDragStart = useCallback((event) => {
        setIsDragging(true);
        setDraggedItemId(event.active.id);
    }, []);
    // Handle drag end
    const handleDragEnd = useCallback((event) => {
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
    // Find the dragged option for drag overlay
    const draggedOption = draggedItemId ? options.find(opt => opt.id === draggedItemId) : null;
    const draggedPercentage = draggedOption ? (actualTotalWeight > 0 ? (draggedOption.weight / actualTotalWeight) * 100 : 0) : 0;
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
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap'
                }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsxs("span", { style: { fontSize: '14px', fontWeight: 500 }, children: ["Bulk Actions (", selectedItems.size, " selected):"] }), _jsx("button", { onClick: () => handleBulkWeightChange('equal'), style: {
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
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }, children: "Clear" })] }) })), _jsxs(DndContext, { sensors: sensors, collisionDetection: closestCenter, onDragStart: handleDragStart, onDragEnd: handleDragEnd, modifiers: [restrictToVerticalAxis], children: [_jsx(SortableContext, { items: options.map(opt => opt.id), strategy: verticalListSortingStrategy, children: _jsx("div", { style: {
                                minHeight: '200px',
                                borderRadius: '8px',
                                padding: '8px'
                            }, children: optionsWithPercentages.map((option, index) => (_jsx(SortableWeightItem, { option: option, index: index, percentage: option.percentage, isDragging: isDragging, showWeights: showWeights, showPercentages: showPercentages, allowWeightEditing: allowWeightEditing, allowLocking: allowLocking, minWeight: minWeight, maxWeight: maxWeight, themeStyles: themeStyles, animationDuration: animationDuration, onWeightChange: handleWeightChange, onLockToggle: handleLockToggle, onItemSelect: handleItemSelect, isSelected: selectedItems.has(option.id), draggedItemId: draggedItemId }, option.id))) }) }), _jsx(DragOverlay, { dropAnimation: {
                            sideEffects: defaultDropAnimationSideEffects({
                                styles: {
                                    active: {
                                        opacity: '0.5'
                                    }
                                }
                            })
                        }, children: draggedOption ? (_jsxs("div", { style: {
                                background: themeStyles.accent + '20',
                                border: `1px solid ${themeStyles.accent}`,
                                borderRadius: '8px',
                                padding: '16px',
                                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px ${themeStyles.accent}`,
                                transform: 'scale(1.02)',
                                userSelect: 'none',
                                cursor: 'grabbing'
                            }, children: [_jsx("div", { style: {
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: themeStyles.text,
                                        marginBottom: '4px'
                                    }, children: draggedOption.text }), _jsxs("div", { style: {
                                        fontSize: '12px',
                                        opacity: 0.7,
                                        color: themeStyles.accent
                                    }, children: [draggedPercentage.toFixed(1), "% - ", draggedOption.weight.toFixed(1)] })] })) : null })] })] }));
};
export default DragReorderWeightManager;
