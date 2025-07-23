import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/Annotations/ConnectionAnnotationPanel.tsx
// Epic 8.7 Task 4: Connection Label Editing Interface
import { useState, useCallback } from 'react';
import { ConnectionLabelEditor } from './ConnectionAnnotations';
import { connectionAnnotationPresets, labelTemplates } from '../../hooks/useConnectionAnnotations';
export const ConnectionAnnotationPanel = ({ edges, selectedEdgeId, labelEditMode, smartPositioning, showAllLabels, onAddLabel, onUpdateLabel, onRemoveLabel, onToggleLabel, onSelectEdge, onShowAllLabelsToggle, onHideAllLabels, onClearAllLabels, onOptimizePositions, onSetLabelEditMode, onSetSmartPositioning, getVisibleLabelsCount }) => {
    const [showEditor, setShowEditor] = useState(false);
    const [quickLabelInput, setQuickLabelInput] = useState('');
    const [selectedPreset, setSelectedPreset] = useState('dataFlow');
    const selectedEdge = edges.find(edge => edge.id === selectedEdgeId);
    const edgesWithLabels = edges.filter(edge => edge.label && edge.label.trim().length > 0);
    const visibleLabelsCount = getVisibleLabelsCount();
    const handleQuickAddLabel = useCallback(() => {
        if (!selectedEdgeId || !quickLabelInput.trim())
            return;
        onAddLabel(selectedEdgeId, quickLabelInput.trim(), connectionAnnotationPresets[selectedPreset]);
        setQuickLabelInput('');
    }, [selectedEdgeId, quickLabelInput, selectedPreset, onAddLabel]);
    const handleOpenEditor = useCallback(() => {
        setShowEditor(true);
    }, []);
    const handleCloseEditor = useCallback(() => {
        setShowEditor(false);
    }, []);
    const handleTemplateSelect = useCallback((template) => {
        setQuickLabelInput(template);
    }, []);
    return (_jsxs("div", { style: {
            position: 'fixed',
            top: 80,
            right: 20,
            width: 320,
            background: '#2d3748',
            border: '1px solid #4a5568',
            borderRadius: 8,
            padding: 16,
            zIndex: 1000,
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto'
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                    borderBottom: '1px solid #4a5568',
                    paddingBottom: 8
                }, children: [_jsx("h3", { style: {
                            color: '#e2e8f0',
                            fontSize: 14,
                            margin: 0,
                            fontWeight: 600
                        }, children: "Connection Labels" }), _jsxs("div", { style: {
                            color: '#a0aec0',
                            fontSize: 11
                        }, children: [visibleLabelsCount, " visible"] })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 8,
                            marginBottom: 8
                        }, children: [_jsx("button", { onClick: onShowAllLabelsToggle, style: {
                                    padding: '6px 8px',
                                    background: showAllLabels ? '#4299e1' : '#4a5568',
                                    border: 'none',
                                    borderRadius: 4,
                                    color: 'white',
                                    fontSize: 11,
                                    cursor: 'pointer'
                                }, children: showAllLabels ? 'Hide All' : 'Show All' }), _jsx("button", { onClick: () => onSetLabelEditMode(!labelEditMode), style: {
                                    padding: '6px 8px',
                                    background: labelEditMode ? '#48bb78' : '#4a5568',
                                    border: 'none',
                                    borderRadius: 4,
                                    color: 'white',
                                    fontSize: 11,
                                    cursor: 'pointer'
                                }, children: labelEditMode ? 'Edit On' : 'Edit Off' })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 8
                        }, children: [_jsx("button", { onClick: onOptimizePositions, disabled: !smartPositioning, style: {
                                    padding: '6px 8px',
                                    background: '#9f7aea',
                                    border: 'none',
                                    borderRadius: 4,
                                    color: 'white',
                                    fontSize: 11,
                                    cursor: smartPositioning ? 'pointer' : 'not-allowed',
                                    opacity: smartPositioning ? 1 : 0.5
                                }, children: "Optimize" }), _jsx("button", { onClick: onClearAllLabels, style: {
                                    padding: '6px 8px',
                                    background: '#f56565',
                                    border: 'none',
                                    borderRadius: 4,
                                    color: 'white',
                                    fontSize: 11,
                                    cursor: 'pointer'
                                }, children: "Clear All" })] })] }), _jsx("div", { style: { marginBottom: 16 }, children: _jsx("div", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 8
                    }, children: _jsxs("label", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            color: '#e2e8f0',
                            fontSize: 11,
                            gap: 4
                        }, children: [_jsx("input", { type: "checkbox", checked: smartPositioning, onChange: (e) => onSetSmartPositioning(e.target.checked) }), "Smart Positioning"] }) }) }), selectedEdgeId && (_jsxs("div", { style: {
                    background: '#1a202c',
                    padding: 12,
                    borderRadius: 6,
                    marginBottom: 16
                }, children: [_jsx("h4", { style: {
                            color: '#e2e8f0',
                            fontSize: 12,
                            margin: '0 0 8px 0'
                        }, children: "Add Label to Selected Connection" }), _jsx("div", { style: { marginBottom: 8 }, children: _jsx("input", { type: "text", value: quickLabelInput, onChange: (e) => setQuickLabelInput(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleQuickAddLabel(), placeholder: "Enter connection label...", style: {
                                width: '100%',
                                padding: 6,
                                background: '#2d3748',
                                border: '1px solid #4a5568',
                                borderRadius: 4,
                                color: '#e2e8f0',
                                fontSize: 11
                            } }) }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    color: '#a0aec0',
                                    fontSize: 10,
                                    marginBottom: 4
                                }, children: "Style Preset" }), _jsxs("select", { value: selectedPreset, onChange: (e) => setSelectedPreset(e.target.value), style: {
                                    width: '100%',
                                    padding: 4,
                                    background: '#2d3748',
                                    border: '1px solid #4a5568',
                                    borderRadius: 4,
                                    color: '#e2e8f0',
                                    fontSize: 11
                                }, children: [_jsx("option", { value: "dataFlow", children: "Data Flow" }), _jsx("option", { value: "control", children: "Control" }), _jsx("option", { value: "dependency", children: "Dependency" }), _jsx("option", { value: "error", children: "Error" })] })] }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    color: '#a0aec0',
                                    fontSize: 10,
                                    marginBottom: 4
                                }, children: "Quick Templates" }), _jsx("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: 4
                                }, children: Object.values(labelTemplates).slice(0, 6).map(template => (_jsx("button", { onClick: () => handleTemplateSelect(template), style: {
                                        padding: '2px 4px',
                                        background: '#4a5568',
                                        border: 'none',
                                        borderRadius: 2,
                                        color: '#e2e8f0',
                                        fontSize: 9,
                                        cursor: 'pointer'
                                    }, children: template }, template))) })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { onClick: handleQuickAddLabel, disabled: !quickLabelInput.trim(), style: {
                                    flex: 1,
                                    padding: '6px 8px',
                                    background: quickLabelInput.trim() ? '#4299e1' : '#4a5568',
                                    border: 'none',
                                    borderRadius: 4,
                                    color: 'white',
                                    fontSize: 11,
                                    cursor: quickLabelInput.trim() ? 'pointer' : 'not-allowed'
                                }, children: "Add Label" }), selectedEdge && (_jsx("button", { onClick: handleOpenEditor, style: {
                                    padding: '6px 8px',
                                    background: '#9f7aea',
                                    border: 'none',
                                    borderRadius: 4,
                                    color: 'white',
                                    fontSize: 11,
                                    cursor: 'pointer'
                                }, children: "Advanced" }))] })] })), _jsxs("div", { children: [_jsxs("h4", { style: {
                            color: '#e2e8f0',
                            fontSize: 12,
                            margin: '0 0 8px 0',
                            borderBottom: '1px solid #4a5568',
                            paddingBottom: 4
                        }, children: ["Labeled Connections (", edgesWithLabels.length, ")"] }), edgesWithLabels.length === 0 ? (_jsxs("div", { style: {
                            color: '#a0aec0',
                            fontSize: 11,
                            fontStyle: 'italic',
                            textAlign: 'center',
                            padding: '16px 8px'
                        }, children: ["No labeled connections.", ' ', edges.length > 0 ? 'Select a connection to add labels.' : 'Create connections first.'] })) : (_jsx("div", { style: { maxHeight: 200, overflowY: 'auto' }, children: edgesWithLabels.map(edge => (_jsxs("div", { style: {
                                padding: 8,
                                marginBottom: 4,
                                background: selectedEdgeId === edge.id ? '#1a202c' : 'transparent',
                                border: `1px solid ${selectedEdgeId === edge.id ? '#4299e1' : '#4a5568'}`,
                                borderRadius: 4,
                                cursor: 'pointer'
                            }, onClick: () => onSelectEdge(edge.id), children: [_jsxs("div", { style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 4
                                    }, children: [_jsxs("div", { style: {
                                                color: '#e2e8f0',
                                                fontSize: 11,
                                                fontWeight: 500,
                                                maxWidth: 150,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }, children: ["\"", edge.label, "\""] }), _jsx("div", { style: {
                                                fontSize: 9,
                                                color: edge.showLabel ? '#48bb78' : '#a0aec0'
                                            }, children: edge.showLabel ? 'Visible' : 'Hidden' })] }), _jsxs("div", { style: {
                                        fontSize: 9,
                                        color: '#a0aec0',
                                        marginBottom: 4
                                    }, children: [edge.source, " \u2192 ", edge.target] }), _jsxs("div", { style: { display: 'flex', gap: 4 }, children: [_jsx("button", { onClick: (e) => {
                                                e.stopPropagation();
                                                onToggleLabel(edge.id);
                                            }, style: {
                                                padding: '2px 6px',
                                                background: 'none',
                                                border: '1px solid #4a5568',
                                                borderRadius: 2,
                                                color: '#a0aec0',
                                                fontSize: 8,
                                                cursor: 'pointer'
                                            }, children: edge.showLabel ? 'Hide' : 'Show' }), _jsx("button", { onClick: (e) => {
                                                e.stopPropagation();
                                                onRemoveLabel(edge.id);
                                            }, style: {
                                                padding: '2px 6px',
                                                background: 'none',
                                                border: '1px solid #f56565',
                                                borderRadius: 2,
                                                color: '#f56565',
                                                fontSize: 8,
                                                cursor: 'pointer'
                                            }, children: "Remove" })] })] }, edge.id))) }))] }), showEditor && selectedEdge && (_jsx(ConnectionLabelEditor, { edge: selectedEdge, onUpdateEdge: onUpdateLabel, onClose: handleCloseEditor }))] }));
};
// Compact connection annotation toolbar for the main UI
export const ConnectionAnnotationToolbar = ({ visible, onToggle, labelEditMode, onSetLabelEditMode, visibleLabelsCount, totalLabelsCount }) => {
    return (_jsxs("div", { style: {
            position: 'fixed',
            top: 20,
            right: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#2d3748',
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #4a5568',
            zIndex: 999
        }, children: [_jsxs("div", { style: {
                    color: '#a0aec0',
                    fontSize: 11
                }, children: ["Labels: ", visibleLabelsCount, "/", totalLabelsCount] }), _jsx("button", { onClick: () => onSetLabelEditMode(!labelEditMode), style: {
                    padding: '4px 8px',
                    background: labelEditMode ? '#48bb78' : '#4a5568',
                    border: 'none',
                    borderRadius: 3,
                    color: 'white',
                    fontSize: 10,
                    cursor: 'pointer'
                }, children: "Edit Mode" }), _jsx("button", { onClick: onToggle, style: {
                    padding: '4px 8px',
                    background: visible ? '#4299e1' : '#4a5568',
                    border: 'none',
                    borderRadius: 3,
                    color: 'white',
                    fontSize: 10,
                    cursor: 'pointer'
                }, children: "Panel" })] }));
};
