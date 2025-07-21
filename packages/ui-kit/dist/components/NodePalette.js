import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Node Palette component for adding nodes to graphs
 */
import { useState, useMemo } from 'react';
import { useTheme, useResponsive } from '../hooks';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { Stack } from './Layout';
import { cn } from '../utils';
// Default node types with metadata
const DEFAULT_NODE_TYPES = [
    {
        type: 'WeightedChoice',
        label: 'Weighted Choice',
        description: 'Select from weighted options',
        category: 'Logic',
        icon: '⚖️'
    },
    {
        type: 'Concat',
        label: 'Concatenate',
        description: 'Combine text with templates',
        category: 'Text',
        icon: '🔗'
    },
    {
        type: 'Output',
        label: 'Output',
        description: 'Generate final output',
        category: 'Output',
        icon: '📤'
    },
    {
        type: 'Include',
        label: 'Include',
        description: 'Reference external content',
        category: 'Reference',
        icon: '📄'
    },
    {
        type: 'SetVariable',
        label: 'Set Variable',
        description: 'Store a value',
        category: 'Variables',
        icon: '💾'
    },
    {
        type: 'GetVariable',
        label: 'Get Variable',
        description: 'Retrieve a stored value',
        category: 'Variables',
        icon: '📥'
    },
    {
        type: 'WeightedAdvanced',
        label: 'Advanced Weighted',
        description: 'Advanced weight distributions',
        category: 'Advanced',
        icon: '⚗️'
    },
    {
        type: 'Conditional',
        label: 'Conditional',
        description: 'Expression-based branching',
        category: 'Logic',
        icon: '🔀'
    },
    {
        type: 'Sequential',
        label: 'Sequential',
        description: 'Process sequences in order',
        category: 'Advanced',
        icon: '📋'
    },
    {
        type: 'Markov',
        label: 'Markov Chain',
        description: 'State transition processing',
        category: 'Advanced',
        icon: '🔄'
    }
];
export const NodePalette = ({ onNodeAdd, availableNodeTypes, searchable = true, collapsed = false, orientation = 'vertical', className, style, testId, ...props }) => {
    const theme = useTheme();
    const { isMobile } = useResponsive();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
    // Filter node types based on available types and search
    const nodeTypes = useMemo(() => {
        let types = DEFAULT_NODE_TYPES;
        // Filter by available types if specified
        if (availableNodeTypes) {
            types = types.filter(nodeType => availableNodeTypes.includes(nodeType.type));
        }
        // Filter by search term
        if (searchTerm) {
            types = types.filter(nodeType => nodeType.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                nodeType.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                nodeType.category.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        // Filter by category
        if (selectedCategory !== 'All') {
            types = types.filter(nodeType => nodeType.category === selectedCategory);
        }
        return types;
    }, [availableNodeTypes, searchTerm, selectedCategory]);
    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(DEFAULT_NODE_TYPES.map(type => type.category));
        return ['All', ...Array.from(cats)];
    }, []);
    const handleNodeAdd = (nodeType) => {
        onNodeAdd?.(nodeType);
    };
    const paletteStyles = {
        width: orientation === 'vertical' ? '280px' : '100%',
        height: orientation === 'horizontal' ? 'auto' : '100%',
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: `${theme.borderRadius}px`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        ...style
    };
    const headerStyles = {
        padding: `${theme.spacing.md}px`,
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.background
    };
    const contentStyles = {
        flex: 1,
        overflow: 'auto',
        padding: `${theme.spacing.sm}px`
    };
    if (internalCollapsed) {
        return (_jsx("div", { className: cn('ui-node-palette ui-node-palette--collapsed', className), style: {
                width: orientation === 'vertical' ? '48px' : '100%',
                height: orientation === 'horizontal' ? '48px' : '100%',
                backgroundColor: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: `${theme.borderRadius}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...style
            }, "data-testid": testId, ...props, children: _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setInternalCollapsed(false), "aria-label": "Expand node palette", children: orientation === 'vertical' ? '▶️' : '🔽' }) }));
    }
    return (_jsxs("div", { className: cn('ui-node-palette', className), style: paletteStyles, "data-testid": testId, ...props, children: [_jsxs("div", { className: "ui-node-palette-header", style: headerStyles, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: searchable ? `${theme.spacing.sm}px` : 0
                        }, children: [_jsx("h3", { style: {
                                    margin: 0,
                                    fontSize: `${theme.typography.fontSize.md}px`,
                                    fontWeight: theme.typography.fontWeight.semibold,
                                    color: theme.colors.text
                                }, children: "Node Palette" }), _jsx(Button, { variant: "ghost", size: "xs", onClick: () => setInternalCollapsed(true), "aria-label": "Collapse node palette", children: orientation === 'vertical' ? '◀️' : '🔼' })] }), searchable && (_jsx(Input, { placeholder: "Search nodes...", value: searchTerm, onChange: setSearchTerm, size: "sm" }))] }), !isMobile && (_jsx("div", { style: {
                    padding: `${theme.spacing.sm}px`,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.background
                }, children: _jsx("div", { style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: `${theme.spacing.xs}px`
                    }, children: categories.map(category => (_jsx(Button, { variant: selectedCategory === category ? 'primary' : 'ghost', size: "xs", onClick: () => setSelectedCategory(category), children: category }, category))) }) })), _jsx("div", { className: "ui-node-palette-content", style: contentStyles, children: _jsx(Stack, { spacing: "xs", children: nodeTypes.length === 0 ? (_jsx("div", { style: {
                            padding: `${theme.spacing.lg}px`,
                            textAlign: 'center',
                            color: theme.colors.textSecondary
                        }, children: "No nodes found" })) : (nodeTypes.map(nodeType => (_jsx(NodeTypeCard, { nodeType: nodeType, onAdd: () => handleNodeAdd(nodeType.type), compact: isMobile || orientation === 'horizontal' }, nodeType.type)))) }) })] }));
};
const NodeTypeCard = ({ nodeType, onAdd, compact = false }) => {
    const theme = useTheme();
    return (_jsx(Card, { variant: "outlined", padding: "sm", clickable: true, onClick: onAdd, className: "ui-node-type-card", style: {
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        }, children: _jsxs("div", { style: {
                display: 'flex',
                alignItems: compact ? 'center' : 'flex-start',
                gap: `${theme.spacing.sm}px`
            }, children: [_jsx("div", { style: {
                        fontSize: compact ? '18px' : '24px',
                        flexShrink: 0
                    }, children: nodeType.icon }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: {
                                fontSize: `${theme.typography.fontSize.sm}px`,
                                fontWeight: theme.typography.fontWeight.medium,
                                color: theme.colors.text,
                                marginBottom: compact ? 0 : `${theme.spacing.xs / 2}px`
                            }, children: nodeType.label }), !compact && (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                                        fontSize: `${theme.typography.fontSize.xs}px`,
                                        color: theme.colors.textSecondary,
                                        marginBottom: `${theme.spacing.xs / 2}px`
                                    }, children: nodeType.description }), _jsx("div", { style: {
                                        fontSize: `${theme.typography.fontSize.xs}px`,
                                        color: theme.colors.primary,
                                        fontWeight: theme.typography.fontWeight.medium
                                    }, children: nodeType.category })] }))] })] }) }));
};
//# sourceMappingURL=NodePalette.js.map