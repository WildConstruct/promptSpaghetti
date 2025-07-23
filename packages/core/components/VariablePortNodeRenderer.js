import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/VariablePortNodeRenderer.tsx
// Enhanced NodeRenderer with dynamic variable ports from template parsing
import React, { memo, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { parseTemplate } from '../utils/templateParser';
export const VariablePortNodeRenderer = memo(({ id, data, selected = false, onSelect, getNodeMeta, getCategoryColor }) => {
    // Parse template to extract variables for dynamic ports
    const templateField = data?.template || data?.text || data?.content || '';
    const parseResult = useMemo(() => {
        if (typeof templateField === 'string' && templateField.length > 0) {
            return parseTemplate(templateField);
        }
        return { variables: [], errors: [], isValid: true, processedTemplate: '' };
    }, [templateField]);
    // Get valid variables for port creation
    const variablePorts = useMemo(() => {
        return parseResult.variables
            .filter(variable => variable.isValid)
            .map((variable, index) => ({
            id: `variable-${variable.name}`,
            name: variable.name,
            displayName: variable.name.charAt(0).toUpperCase() + variable.name.slice(1),
            position: index
        }));
    }, [parseResult.variables]);
    try {
        const hasVariations = data?.variations && data.variations.length > 0;
        const nodeType = data?.nodeType || data?.type || 'WeightedChoice';
        const nodeMeta = getNodeMeta(nodeType);
        const categoryColor = getCategoryColor(nodeMeta.category || 'general');
        const hasVariablePorts = variablePorts.length > 0;
        // Get non-label properties for display (exclude template to avoid clutter)
        const properties = Object.entries(data || {})
            .filter(([k]) => k !== 'label' &&
            k !== 'variations' &&
            k !== 'type' &&
            k !== 'template' &&
            k !== 'text' &&
            k !== 'content')
            .slice(0, 2); // Limit to 2 properties since we need space for variable ports
        return (_jsxs("div", { role: "button", "data-testid": `node-${id}`, tabIndex: 0, onClick: (e) => {
                e.stopPropagation();
                onSelect(id);
            }, onKeyDown: (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(id);
                }
            }, style: {
                cursor: 'pointer',
                // Professional gradient background inspired by Cinema 4D panels
                background: `linear-gradient(
            135deg,
            var(--bg-tertiary
          ) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)`,
                border: selected
                    ? '2px solid var(--accent-orange)'
                    : '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                minWidth: 200, // Slightly wider to accommodate variable ports
                minHeight: hasVariablePorts ? 120 : 90, // Taller if we have variable ports
                boxShadow: selected
                    ? 'var(--shadow-node-selected)'
                    : 'var(--shadow-node)',
                position: 'relative',
                overflow: 'visible',
                fontFamily: 'var(--font-primary)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Professional easing
                zIndex: 1,
                pointerEvents: 'auto',
                display: 'block',
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden'
            }, onMouseEnter: (e) => {
                if (!selected) {
                    e.currentTarget.style.WebkitTransform = 'translateY(-3px) translateZ(0)';
                    e.currentTarget.style.transform = 'translateY(-3px) translateZ(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-node-hover)';
                    e.currentTarget.style.filter = 'brightness(1.05)';
                }
            }, onMouseLeave: (e) => {
                if (!selected) {
                    e.currentTarget.style.WebkitTransform = 'translateY(0) translateZ(0)';
                    e.currentTarget.style.transform = 'translateY(0) translateZ(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-node)';
                    e.currentTarget.style.filter = 'brightness(1)';
                }
            }, "aria-label": (() => {
                const label = data?.label ?? nodeMeta.label;
                const variableInfo = hasVariablePorts ? `Variables: ${variablePorts.map(v => v.name).join(', ')}` : '';
                const summary = properties.map(([k, v]) => `${k}: ${String(v)}`).join(', ');
                return [label, variableInfo, summary].filter(Boolean).join('. ');
            })(), children: [_jsxs("div", { style: {
                        // Cinema 4D inspired header gradient
                        background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%)`,
                        color: '#ffffff',
                        padding: 'var(--space-2) var(--space-3)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                        // Subtle text shadow for better readability
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        // Inner highlight for professional appearance
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)'
                    }, children: [_jsx("span", { style: {
                                fontSize: 16,
                                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))'
                            }, children: typeof nodeMeta.icon === 'string' ? nodeMeta.icon : '🔧' }), _jsx("span", { style: { letterSpacing: '0.01em' }, children: nodeMeta.label }), hasVariations && (_jsx("div", { style: {
                                marginLeft: 'auto',
                                width: 20,
                                height: 20,
                                backgroundColor: 'rgba(255,255,255,0.25)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 10,
                                fontWeight: 'bold',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                                transition: 'all 0.2s ease'
                            }, title: `${data.variations.length} variations`, children: data.variations.length }))] }), _jsxs("div", { style: {
                        padding: 'var(--space-3)',
                        color: 'var(--text-primary)',
                        minHeight: hasVariablePorts ? '70px' : '50px',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)'
                    }, children: [_jsx("div", { style: {
                                fontWeight: 600,
                                fontSize: 'var(--font-size-base)',
                                marginBottom: (properties.length > 0 || hasVariablePorts) ? 'var(--space-2)' : 0,
                                color: 'var(--text-primary)',
                                lineHeight: 1.3,
                                // Subtle glow for selected state
                                ...(selected && {
                                    textShadow: '0 0 8px var(--accent-orange)40'
                                })
                            }, children: data?.label || nodeMeta.label || nodeType || id }), hasVariablePorts && (_jsxs("div", { style: {
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--text-secondary)',
                                marginBottom: properties.length > 0 ? 'var(--space-1)' : 0,
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 'var(--space-1)',
                                alignItems: 'center'
                            }, children: [_jsx("span", { style: {
                                        color: 'var(--text-tertiary)',
                                        fontWeight: 500
                                    }, children: "Variables:" }), variablePorts.map((port, idx) => (_jsx("span", { style: {
                                        backgroundColor: `${categoryColor}20`,
                                        color: categoryColor,
                                        padding: '2px 6px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: 10,
                                        fontWeight: 500,
                                        border: `1px solid ${categoryColor}40`
                                    }, children: port.displayName }, port.id)))] })), properties.length > 0 && (_jsx("div", { style: {
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.4,
                                fontFamily: 'var(--font-mono)' // Monospace for technical properties
                            }, children: properties.map(([k, v], idx) => (_jsxs("div", { style: {
                                    marginBottom: idx < properties.length - 1 ? '3px' : 0,
                                    opacity: 0.8
                                }, children: [_jsxs("span", { style: {
                                            color: 'var(--text-tertiary)',
                                            fontWeight: 500
                                        }, children: [k, ":"] }), ' ', _jsx("span", { style: { color: 'var(--text-secondary)' }, children: String(v).length > 18 ? String(v).slice(0, 18) + '…' : String(v) })] }, k))) }))] }), !hasVariablePorts && (_jsx(Handle, { type: "target", position: Position.Left, id: "target", style: {
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: 'var(--border)',
                        border: '2px solid var(--bg-secondary)',
                        cursor: 'crosshair',
                        zIndex: 10,
                        transition: 'all 0.2s ease',
                        boxShadow: 'var(--shadow-sm)'
                    }, isConnectable: true })), variablePorts.map((port, index) => {
                    // Calculate position for multiple ports
                    const totalPorts = variablePorts.length;
                    const spacing = totalPorts > 1 ? 60 / (totalPorts - 1) : 0; // Distribute across 60px height
                    const baseOffset = 40; // Start from 40px from top
                    const yOffset = totalPorts > 1 ? baseOffset + (index * spacing) : baseOffset + 20;
                    return (_jsxs(React.Fragment, { children: [_jsx(Handle, { type: "target", position: Position.Left, id: port.id, style: {
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    background: `${categoryColor}80`,
                                    border: `2px solid ${categoryColor}`,
                                    cursor: 'crosshair',
                                    zIndex: 10,
                                    transition: 'all 0.2s ease',
                                    boxShadow: `var(--shadow-sm), 0 0 6px ${categoryColor}40`,
                                    top: `${yOffset}px`,
                                    left: '-6px'
                                }, isConnectable: true }), _jsx("div", { style: {
                                    position: 'absolute',
                                    left: 12,
                                    top: `${yOffset - 6}px`,
                                    fontSize: 9,
                                    fontWeight: 600,
                                    color: categoryColor,
                                    background: 'var(--bg-secondary)',
                                    padding: '2px 4px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: `1px solid ${categoryColor}40`,
                                    whiteSpace: 'nowrap',
                                    pointerEvents: 'none',
                                    zIndex: 5,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                    boxShadow: 'var(--shadow-xs)'
                                }, children: port.displayName })] }, port.id));
                }), _jsx(Handle, { type: "source", position: Position.Right, id: "source", style: {
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: categoryColor,
                        border: '2px solid var(--bg-secondary)',
                        cursor: 'crosshair',
                        zIndex: 10,
                        transition: 'all 0.2s ease',
                        boxShadow: 'var(--shadow-sm)'
                    }, isConnectable: true })] }));
    }
    catch (error) {
        console.error('VariablePortNodeRenderer error:', error, 'Props:', { id, data });
        // Professional error state
        return (_jsx("div", { style: {
                cursor: 'pointer',
                background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)',
                border: '1px solid var(--accent-red)',
                borderRadius: 'var(--radius-md)',
                minWidth: 200,
                minHeight: 90,
                padding: 'var(--space-3)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-primary)',
                boxShadow: 'var(--shadow-md)',
                textAlign: 'center'
            }, children: _jsxs("div", { children: [_jsx("div", { style: {
                            fontSize: 'var(--font-size-lg)',
                            marginBottom: 'var(--space-2)',
                            color: 'var(--accent-red)'
                        }, children: "\u26A0\uFE0F" }), _jsxs("div", { style: { fontSize: 'var(--font-size-sm)' }, children: ["Error: ", data?.nodeType || data?.type || 'Unknown'] })] }) }));
    }
});
VariablePortNodeRenderer.displayName = 'VariablePortNodeRenderer';
