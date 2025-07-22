import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useRef, useEffect } from 'react';
import { PropertiesSection } from './PropertiesSection';
import { PreviewSection } from './PreviewSection';
import { PreferenceControls } from './PreferenceControls';
import { useUISettingsStore } from '../../stores/uiSettingsStore';
// Map technical node types to filmmaker-friendly names
const getFilmmakerFriendlyName = (nodeType) => {
    const friendlyNames = {
        'WeightedChoice': 'Random Selection',
        'Concat': 'Text Combiner',
        'Output': 'Final Output',
        'Include': 'Scene Reference',
        'SetVariable': 'Set Element',
        'GetVariable': 'Use Element',
        'Subject': 'Character/Object',
        'Action': 'Action/Verb',
        'Attribute': 'Description',
        'Connector': 'Transition',
        'Conditional': 'If/Then Logic',
        'Sequential': 'Sequence',
        'Markov': 'Smart Chain',
        'WeightedAdvanced': 'Weighted Selection',
        'PythonTransform': 'Text Transform'
    };
    return friendlyNames[nodeType] || nodeType;
};
export const InspectorPanel = ({ node, schema, onChange, onClose, onGlobalPreviewRequest, initialWidth = 320, minWidth = 280, maxWidth = 600 }) => {
    const [isResizing, setIsResizing] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const resizeRef = useRef(null);
    const { debugMode, setDebugMode, shouldShowTechnicalFields, complexityLevel, setComplexityLevel, shouldShowAdvancedFeatures, globalDisclosureLevel, setGlobalDisclosureLevel } = useUISettingsStore();
    const nodeId = node?.id;
    const nodeType = node?.data?.nodeType || node?.type;
    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);
    const handleMouseMove = useCallback((e) => {
        if (!isResizing)
            return;
        const newWidth = window.innerWidth - e.clientX;
        const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        setWidth(clampedWidth);
    }, [isResizing, minWidth, maxWidth]);
    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }
        else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);
    if (!node || !schema) {
        return (_jsxs("aside", { style: {
                width: collapsed ? 40 : width,
                minWidth: collapsed ? 40 : minWidth,
                borderLeft: '1px solid #4a5568',
                background: '#1a202c',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: collapsed ? 'width 0.2s ease' : 'none'
            }, onKeyDown: (e) => {
                e.stopPropagation();
            }, onKeyUp: (e) => {
                e.stopPropagation();
            }, onKeyPress: (e) => {
                e.stopPropagation();
            }, children: [_jsxs("div", { style: {
                        padding: '12px 16px',
                        borderBottom: '1px solid #4a5568',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#2d3748'
                    }, children: [!collapsed && (_jsx("h3", { style: { margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }, children: "Editor Panel" })), _jsx("button", { onClick: () => setCollapsed(!collapsed), style: {
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 16,
                                color: '#a0aec0',
                                padding: 4
                            }, title: collapsed ? 'Expand Inspector' : 'Collapse Inspector', children: collapsed ? '◀' : '▶' })] }), !collapsed && (_jsx("div", { style: {
                        padding: 16,
                        color: '#a0aec0',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginTop: 40
                    }, children: "Select an element to customize its options" })), _jsx("div", { ref: resizeRef, onMouseDown: handleMouseDown, style: {
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        cursor: 'col-resize',
                        background: 'transparent',
                        zIndex: 10
                    } })] }));
    }
    return (_jsxs("aside", { style: {
            width: collapsed ? 40 : width,
            minWidth: collapsed ? 40 : minWidth,
            borderLeft: '1px solid #4a5568',
            background: '#1a202c',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: collapsed ? 'width 0.2s ease' : 'none'
        }, onKeyDown: (e) => {
            e.stopPropagation();
        }, onKeyUp: (e) => {
            e.stopPropagation();
        }, onKeyPress: (e) => {
            e.stopPropagation();
        }, children: [_jsxs("div", { style: {
                    padding: '12px 16px',
                    borderBottom: '1px solid #4a5568',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#2d3748'
                }, children: [!collapsed && (_jsxs("h3", { style: { margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }, children: [_jsx("span", { style: { color: '#4CAF50' }, children: "\uD83D\uDD0D" }), " ", node.data?.label || getFilmmakerFriendlyName(node.data?.nodeType || node.type), " Settings"] })), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [!collapsed && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 4 }, children: [_jsxs("select", { value: complexityLevel, onChange: (e) => setComplexityLevel(e.target.value), style: {
                                            background: '#2d3748',
                                            border: '1px solid #4a5568',
                                            borderRadius: 4,
                                            color: '#e2e8f0',
                                            fontSize: 10,
                                            padding: '2px 4px',
                                            cursor: 'pointer'
                                        }, title: "Choose interface complexity level", children: [_jsx("option", { value: "basic", children: "\uD83C\uDFAD Basic" }), _jsx("option", { value: "advanced", children: "\u26A1 Advanced" }), _jsx("option", { value: "expert", children: "\uD83D\uDC68\u200D\uD83D\uDCBB Expert" })] }), _jsx("div", { style: {
                                            fontSize: 8,
                                            color: '#a0aec0',
                                            fontWeight: 500,
                                            padding: '1px 4px',
                                            background: complexityLevel === 'basic' ? '#22543d' :
                                                complexityLevel === 'advanced' ? '#2a4365' : '#553c9a',
                                            borderRadius: 2,
                                            display: 'inline-block',
                                            minWidth: 40,
                                            textAlign: 'center'
                                        }, title: complexityLevel === 'basic' ? 'Basic: Essential fields only' :
                                            complexityLevel === 'advanced' ? 'Advanced: Power user options' :
                                                'Expert: All technical details', children: complexityLevel === 'basic' ? 'BASIC' :
                                            complexityLevel === 'advanced' ? 'ADV' : 'EXP' }), _jsx("button", { onClick: () => setShowPreferences(!showPreferences), style: {
                                            background: showPreferences ? '#4299e1' : 'transparent',
                                            border: '1px solid #4a5568',
                                            borderRadius: 3,
                                            color: showPreferences ? 'white' : '#a0aec0',
                                            fontSize: 10,
                                            padding: '2px 6px',
                                            cursor: 'pointer',
                                            marginLeft: 4
                                        }, title: "Configure disclosure preferences", children: "\u2699\uFE0F" })] })), !collapsed && onClose && (_jsx("button", { onClick: onClose, style: {
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 16,
                                    color: '#a0aec0',
                                    padding: 4
                                }, title: "Close Inspector", children: "\u2715" })), _jsx("button", { onClick: () => setCollapsed(!collapsed), style: {
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 16,
                                    color: '#a0aec0',
                                    padding: 4
                                }, title: collapsed ? 'Expand Inspector' : 'Collapse Inspector', children: collapsed ? '◀' : '▶' })] })] }), !collapsed && (_jsxs("div", { style: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }, children: [showPreferences && (_jsx("div", { style: {
                            padding: '0 16px 16px 16px',
                            borderBottom: '1px solid #4a5568',
                            background: 'rgba(66, 153, 225, 0.05)'
                        }, children: _jsx(PreferenceControls, { nodeId: nodeId, nodeType: nodeType, showNodeSpecificControls: true, compact: false }) })), _jsx(PropertiesSection, { node: node, schema: schema, onChange: onChange, onGlobalPreviewRequest: onGlobalPreviewRequest }), _jsx(PreviewSection, { node: node })] })), _jsx("div", { ref: resizeRef, onMouseDown: handleMouseDown, style: {
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    cursor: 'col-resize',
                    background: 'transparent',
                    zIndex: 10
                } })] }));
};
