import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Inspector Panel component for editing node properties
 */
import { useState, useMemo } from 'react';
import { useTheme, useResponsive } from '../hooks';
import { Button } from './Button';
import { Input, TextArea } from './Input';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Stack } from './Layout';
import { cn } from '../utils';
export const InspectorPanel = ({ selectedNode, onNodeUpdate, onNodeDelete, collapsed = false, position = 'right', className, style, testId, ...props }) => {
    const theme = useTheme();
    const { isMobile } = useResponsive();
    const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
    // Get node editor component based on node type
    const nodeEditor = useMemo(() => {
        if (!selectedNode)
            return null;
        switch (selectedNode.type) {
            case 'WeightedChoice':
                return _jsx(WeightedChoiceEditor, { node: selectedNode, onUpdate: onNodeUpdate });
            case 'Concat':
                return _jsx(ConcatEditor, { node: selectedNode, onUpdate: onNodeUpdate });
            case 'Output':
                return _jsx(OutputEditor, { node: selectedNode, onUpdate: onNodeUpdate });
            case 'Include':
                return _jsx(IncludeEditor, { node: selectedNode, onUpdate: onNodeUpdate });
            case 'SetVariable':
                return _jsx(SetVariableEditor, { node: selectedNode, onUpdate: onNodeUpdate });
            case 'GetVariable':
                return _jsx(GetVariableEditor, { node: selectedNode, onUpdate: onNodeUpdate });
            case 'WeightedAdvanced':
                return _jsx(WeightedAdvancedEditor, { node: selectedNode, onUpdate: onNodeUpdate });
            case 'Conditional':
                return _jsx(ConditionalEditor, { node: selectedNode, onUpdate: onNodeUpdate });
            case 'Sequential':
                return _jsx(SequentialEditor, { node: selectedNode, onUpdate: onNodeUpdate });
            case 'Markov':
                return _jsx(MarkovEditor, { node: selectedNode, onUpdate: onNodeUpdate });
            default:
                return _jsx(GenericEditor, { node: selectedNode, onUpdate: onNodeUpdate });
        }
    }, [selectedNode, onNodeUpdate]);
    const getPanelStyles = () => {
        const baseStyles = {
            width: position === 'bottom' ? '100%' : '320px',
            height: position === 'bottom' ? '300px' : '100%',
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: `${theme.borderRadius}px`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            ...style
        };
        if (isMobile) {
            return {
                ...baseStyles,
                width: '100%',
                height: internalCollapsed ? '48px' : '50vh',
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius: internalCollapsed ? 0 : `${theme.borderRadius}px ${theme.borderRadius}px 0 0`,
                zIndex: 100
            };
        }
        return baseStyles;
    };
    const panelStyles = getPanelStyles();
    if (internalCollapsed) {
        return (_jsx("div", { className: cn('ui-inspector-panel ui-inspector-panel--collapsed', className), style: panelStyles, "data-testid": testId, ...props, children: _jsxs("div", { style: {
                    padding: `${theme.spacing.sm}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: !isMobile ? `1px solid ${theme.colors.border}` : 'none'
                }, children: [_jsx("span", { style: {
                            fontSize: `${theme.typography.fontSize.sm}px`,
                            fontWeight: theme.typography.fontWeight.medium,
                            color: theme.colors.text
                        }, children: "Inspector" }), _jsx(Button, { variant: "ghost", size: "xs", onClick: () => setInternalCollapsed(false), "aria-label": "Expand inspector panel", children: position === 'bottom' || isMobile ? '🔼' : '▶️' })] }) }));
    }
    return (_jsxs("div", { className: cn('ui-inspector-panel', className), style: panelStyles, "data-testid": testId, ...props, children: [_jsxs("div", { className: "ui-inspector-panel-header", style: {
                    padding: `${theme.spacing.md}px`,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.background,
                    flexShrink: 0
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }, children: [_jsx("h3", { style: {
                                    margin: 0,
                                    fontSize: `${theme.typography.fontSize.md}px`,
                                    fontWeight: theme.typography.fontWeight.semibold,
                                    color: theme.colors.text
                                }, children: "Inspector" }), _jsx(Button, { variant: "ghost", size: "xs", onClick: () => setInternalCollapsed(true), "aria-label": "Collapse inspector panel", children: position === 'bottom' || isMobile ? '🔽' : '◀️' })] }), selectedNode && (_jsxs("div", { style: {
                            marginTop: `${theme.spacing.xs}px`,
                            fontSize: `${theme.typography.fontSize.sm}px`,
                            color: theme.colors.textSecondary
                        }, children: [selectedNode.type, " Node"] }))] }), _jsx("div", { className: "ui-inspector-panel-content", style: {
                    flex: 1,
                    overflow: 'auto',
                    padding: `${theme.spacing.md}px`
                }, children: selectedNode ? (_jsxs(Stack, { spacing: "md", children: [_jsx(Card, { variant: "outlined", padding: "sm", children: _jsxs(Stack, { spacing: "sm", children: [_jsx(Input, { label: "Node ID", value: selectedNode.id, readOnly: true, size: "sm" }), _jsx(Input, { label: "Node Type", value: selectedNode.type, readOnly: true, size: "sm" })] }) }), nodeEditor, _jsx("div", { style: {
                                display: 'flex',
                                gap: `${theme.spacing.sm}px`,
                                justifyContent: 'flex-end'
                            }, children: _jsx(Button, { variant: "outline", size: "sm", onClick: () => onNodeDelete?.(selectedNode.id), children: "Delete Node" }) })] })) : (_jsxs("div", { style: {
                        padding: `${theme.spacing.xl}px`,
                        textAlign: 'center',
                        color: theme.colors.textSecondary
                    }, children: [_jsx("div", { style: {
                                fontSize: '48px',
                                marginBottom: `${theme.spacing.md}px`
                            }, children: "\uD83C\uDFAF" }), _jsx("div", { style: {
                                fontSize: `${theme.typography.fontSize.md}px`,
                                marginBottom: `${theme.spacing.sm}px`
                            }, children: "No Node Selected" }), _jsx("div", { style: {
                                fontSize: `${theme.typography.fontSize.sm}px`
                            }, children: "Select a node to edit its properties" })] })) })] }));
};
const WeightedChoiceEditor = ({ node, onUpdate }) => {
    const choices = node.data.choices || [];
    const updateChoices = (newChoices) => {
        onUpdate?.(node.id, {
            data: { ...node.data, choices: newChoices }
        });
    };
    const addChoice = () => {
        updateChoices([...choices, { value: '', weight: 1 }]);
    };
    const removeChoice = (index) => {
        updateChoices(choices.filter((_, i) => i !== index));
    };
    const updateChoice = (index, field, value) => {
        const newChoices = [...choices];
        newChoices[index] = { ...newChoices[index], [field]: value };
        updateChoices(newChoices);
    };
    return (_jsxs(Card, { variant: "outlined", padding: "sm", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { level: 4, children: "Weighted Choices" }) }), _jsx(CardContent, { children: _jsxs(Stack, { spacing: "sm", children: [choices.map((choice, index) => (_jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'end' }, children: [_jsx(Input, { label: `Choice ${index + 1}`, value: choice.value, onChange: (value) => updateChoice(index, 'value', value), size: "sm", style: { flex: 1 } }), _jsx(Input, { label: "Weight", type: "number", value: choice.weight, onChange: (value) => updateChoice(index, 'weight', parseFloat(value) || 0), size: "sm", style: { width: '80px' } }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => removeChoice(index), children: "\u274C" })] }, index))), _jsx(Button, { variant: "outline", size: "sm", onClick: addChoice, children: "Add Choice" })] }) })] }));
};
const ConcatEditor = ({ node, onUpdate }) => {
    return (_jsxs(Card, { variant: "outlined", padding: "sm", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { level: 4, children: "Concatenation" }) }), _jsx(CardContent, { children: _jsx(TextArea, { label: "Template", value: node.data.template || '', onChange: (value) => onUpdate?.(node.id, {
                        data: { ...node.data, template: value }
                    }), rows: 4, hint: "Use {{nodeId}} to reference other nodes" }) })] }));
};
const OutputEditor = ({ node, onUpdate }) => {
    return (_jsxs(Card, { variant: "outlined", padding: "sm", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { level: 4, children: "Output" }) }), _jsx(CardContent, { children: _jsx(TextArea, { label: "Text", value: node.data.text || '', onChange: (value) => onUpdate?.(node.id, {
                        data: { ...node.data, text: value }
                    }), rows: 4, hint: "Use {{nodeId}} to reference other nodes" }) })] }));
};
const IncludeEditor = ({ node, onUpdate }) => {
    return (_jsxs(Card, { variant: "outlined", padding: "sm", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { level: 4, children: "Include Reference" }) }), _jsx(CardContent, { children: _jsx(Input, { label: "Reference Name", value: node.data.name || '', onChange: (value) => onUpdate?.(node.id, {
                        data: { ...node.data, name: value }
                    }), size: "sm", hint: "Name of the content to include" }) })] }));
};
const SetVariableEditor = ({ node, onUpdate }) => {
    return (_jsxs(Card, { variant: "outlined", padding: "sm", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { level: 4, children: "Set Variable" }) }), _jsx(CardContent, { children: _jsxs(Stack, { spacing: "sm", children: [_jsx(Input, { label: "Variable Key", value: node.data.key || '', onChange: (value) => onUpdate?.(node.id, {
                                data: { ...node.data, key: value }
                            }), size: "sm" }), _jsx(Input, { label: "Value", value: node.data.value || '', onChange: (value) => onUpdate?.(node.id, {
                                data: { ...node.data, value: value }
                            }), size: "sm" })] }) })] }));
};
const GetVariableEditor = ({ node, onUpdate }) => {
    return (_jsxs(Card, { variant: "outlined", padding: "sm", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { level: 4, children: "Get Variable" }) }), _jsx(CardContent, { children: _jsx(Input, { label: "Variable Key", value: node.data.key || '', onChange: (value) => onUpdate?.(node.id, {
                        data: { ...node.data, key: value }
                    }), size: "sm" }) })] }));
};
// Placeholder editors for advanced nodes
const WeightedAdvancedEditor = ({ node, onUpdate }) => {
    return (_jsxs(Card, { variant: "outlined", padding: "sm", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { level: 4, children: "Advanced Weighted Choice" }) }), _jsx(CardContent, { children: _jsx("div", { style: { padding: '16px', textAlign: 'center', color: '#666' }, children: "Advanced configuration options" }) })] }));
};
const ConditionalEditor = ({ node, onUpdate }) => {
    return (_jsxs(Card, { variant: "outlined", padding: "sm", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { level: 4, children: "Conditional Logic" }) }), _jsx(CardContent, { children: _jsx("div", { style: { padding: '16px', textAlign: 'center', color: '#666' }, children: "Conditional expression configuration" }) })] }));
};
const SequentialEditor = ({ node, onUpdate }) => {
    return (_jsxs(Card, { variant: "outlined", padding: "sm", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { level: 4, children: "Sequential Processing" }) }), _jsx(CardContent, { children: _jsx("div", { style: { padding: '16px', textAlign: 'center', color: '#666' }, children: "Sequential pattern configuration" }) })] }));
};
const MarkovEditor = ({ node, onUpdate }) => {
    return (_jsxs(Card, { variant: "outlined", padding: "sm", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { level: 4, children: "Markov Chain" }) }), _jsx(CardContent, { children: _jsx("div", { style: { padding: '16px', textAlign: 'center', color: '#666' }, children: "State transition configuration" }) })] }));
};
const GenericEditor = ({ node, onUpdate }) => {
    return (_jsxs(Card, { variant: "outlined", padding: "sm", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { level: 4, children: "Node Configuration" }) }), _jsx(CardContent, { children: _jsxs("div", { style: { padding: '16px', textAlign: 'center', color: '#666' }, children: ["No specific editor available for ", node.type] }) })] }));
};
//# sourceMappingURL=InspectorPanel.js.map