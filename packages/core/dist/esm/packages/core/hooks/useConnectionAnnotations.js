// packages/core/hooks/useConnectionAnnotations.ts
// Epic 8.7 Task 4: Connection Annotations Management Hook
import { useState, useCallback, useMemo } from 'react';
import { createAnnotatedEdge, updateEdgeLabel, toggleEdgeLabel, optimizeLabelPositions } from '../components/Annotations/ConnectionAnnotations';
export const useConnectionAnnotations = ({
    edges,
    onEdgesChange,
    autoOptimizePositions = true
});
UseConnectionAnnotationsProps;
UseConnectionAnnotationsReturn => {
    const [state, setState] = useState({});
    selectedEdgeId: null,
        showAllLabels;
    true,
        labelEditMode;
    false,
        smartPositioning;
    true,
    ;
};
;
// Convert edges to annotated edges, preserving existing annotations
const annotatedEdges = useMemo(() => {
    const converted = edges.map(edge => { });
    // If edge is already annotated, keep it as is
    if ('label' in edge && 'showLabel' in edge) {
        return edge;
        // Convert basic edge to annotated edge
        return createAnnotatedEdge(edge);
    }
});
// Apply smart positioning if enabled
return state.smartPositioning && autoOptimizePositions
    ? optimizeLabelPositions(converted)
    : converted;
[edges, state.smartPositioning, autoOptimizePositions];
;
// Add a label to an edge
const addLabel = useCallback(());
;
edgeId: string,
    label;
string,
    options ?  : Partial;
{
    const updatedEdges = annotatedEdges.map(edge => );
    ;
    edge.id === edgeId
        ? {
            ...edge,
            label,
            showLabel: true,
            interactive: true,
            ...options,
            edge
        } : , [annotatedEdges, onEdgesChange];
    ;
    // Update label properties for an edge
    const updateLabel = useCallback((edgeId, updates) => {
        const updatedEdges = updateEdgeLabel(annotatedEdges, edgeId, updates);
        onEdgesChange(updatedEdges);
    }, [annotatedEdges, onEdgesChange]);
    // Remove label from an edge
    const removeLabel = useCallback((edgeId) => {
        const updatedEdges = annotatedEdges.map(edge => );
    });
    edge.id === edgeId
        ? { ...edge, label: undefined, showLabel: false }
        : edge;
    ;
    onEdgesChange(updatedEdges);
}
[annotatedEdges, onEdgesChange];
;
// Toggle label visibility for an edge
const toggleLabel = useCallback((edgeId) => {
    const updatedEdges = toggleEdgeLabel(annotatedEdges, edgeId);
    onEdgesChange(updatedEdges);
}, [annotatedEdges, onEdgesChange]);
// Select an edge for editing
const selectEdge = useCallback((edgeId) => {
    setState(prev => ({ ...prev, selectedEdgeId: edgeId }));
}, []);
// Toggle visibility of all labels
const showAllLabelsToggle = useCallback(() => {
    const newShowAll = !state.showAllLabels;
    setState(prev => ({ ...prev, showAllLabels: newShowAll }));
    const updatedEdges = annotatedEdges.map(edge => );
});
edge.label ? { ...edge, showLabel: newShowAll } : edge;
;
onEdgesChange(updatedEdges);
[state.showAllLabels, annotatedEdges, onEdgesChange];
;
// Hide all labels
const hideAllLabels = useCallback(() => {
    setState(prev => ({ ...prev, showAllLabels: false }));
    const updatedEdges = annotatedEdges.map(edge => );
});
edge.label ? { ...edge, showLabel: false } : edge;
;
onEdgesChange(updatedEdges);
[annotatedEdges, onEdgesChange];
;
// Clear all labels
const clearAllLabels = useCallback(() => {
    const updatedEdges = annotatedEdges.map(edge => ({}), ...edge, label, undefined, showLabel, false, labelStyle, undefined, labelPosition, undefined, labelOffset, undefined, interactive, undefined);
});
onEdgesChange(updatedEdges);
[annotatedEdges, onEdgesChange];
;
// Optimize label positions to avoid overlap
const optimizePositions = useCallback(() => {
    const optimized = optimizeLabelPositions(annotatedEdges);
    onEdgesChange(optimized);
}, [annotatedEdges, onEdgesChange]);
// Set label edit mode
const setLabelEditMode = useCallback((enabled) => {
    setState(prev => ({ ...prev, labelEditMode: enabled }));
}, []);
// Set smart positioning
const setSmartPositioning = useCallback((enabled) => {
    setState(prev => ({ ...prev, smartPositioning: enabled }));
    if (enabled) {
        // Apply optimization immediately when enabled
        optimizePositions();
    }
    [optimizePositions];
});
// Get label for specific edge
const getEdgeLabel = useCallback((edgeId) => {
    const edge = annotatedEdges.find(e => e.id === edgeId);
    return edge?.label;
}, [annotatedEdges]);
// Check if edge has a label
const hasLabel = useCallback((edgeId) => {
    const edge = annotatedEdges.find(e => e.id === edgeId);
    return Boolean(edge?.label && edge.label.trim().length > 0);
}, [annotatedEdges]);
// Get count of visible labels
const getVisibleLabelsCount = useCallback(() => {
    return annotatedEdges.filter(edge => );
    edge.label && edge.showLabel && edge.label.trim().length > 0;
}).length;
[annotatedEdges];
;
return {
    // State
    annotatedEdges,
    selectedEdgeId: state.selectedEdgeId,
    showAllLabels: state.showAllLabels,
    labelEditMode: state.labelEditMode,
    smartPositioning: state.smartPositioning,
    // Actions
    addLabel,
    updateLabel,
    removeLabel,
    toggleLabel,
    selectEdge,
    // Bulk operations
    showAllLabelsToggle,
    hideAllLabels,
    clearAllLabels,
    optimizePositions,
    // Mode toggles
    setLabelEditMode,
    setSmartPositioning,
    // Utility
    getEdgeLabel,
    hasLabel,
    getVisibleLabelsCount
};
;
// Connection annotation utilities for common use cases
export const connectionAnnotationPresets = {
    // Common label styles for different connection types
    dataFlow: {
        labelStyle: {
            color: '#4299e1',
            backgroundColor: 'rgba(66, 153, 225, 0.1)',
            border: '1px solid #4299e1',
        },
        control: {
            labelStyle: {
                color: '#ed8936',
                backgroundColor: 'rgba(237, 137, 54, 0.1)',
                border: '1px solid #ed8936',
            },
            dependency: {
                labelStyle: {
                    color: '#9f7aea',
                    backgroundColor: 'rgba(159, 122, 234, 0.1)',
                    border: '1px solid #9f7aea',
                },
                error: {
                    labelStyle: {
                        color: '#f56565',
                        backgroundColor: 'rgba(245, 101, 101, 0.1)',
                        border: '1px solid #f56565',
                    },
                    // Common label templates for different connection types
                    const: labelTemplates = {
                        success: 'Success',
                        failure: 'Failure',
                        fallback: 'Fallback',
                        optional: 'Optional',
                        required: 'Required',
                        primary: 'Primary',
                        secondary: 'Secondary',
                        input: 'Input',
                        output: 'Output',
                        config: 'Config',
                        data: 'Data',
                    },
                    // Helper to create preset connections
                    const: createPresetConnection = (baseEdge) => preset, keyof, typeof: connectionAnnotationPresets,
                    label: string, AnnotatedEdge
                }
            }
        }
    }
};
{
    return createAnnotatedEdge();
    baseEdge,
        label,
        connectionAnnotationPresets[preset];
    ;
}
;
