import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { professionalColors } from './styles/professional-design-system';
export const Palette = ({ nodes, collapsed, onToggle, onDragStart }) => {
    // Calculate dynamic height based on number of nodes
    // Min height of 400px, max height of 80vh, grows with content
    const calculateHeight = () => {
        const baseHeight = 400;
        const itemHeight = collapsed ? 50 : 40; // Approximate height per item
        const categoryHeight = collapsed ? 0 : 40; // Category headers only in expanded view
        const categoriesCount = new Set(nodes.map(n => n.category || 'other')).size;
        const contentHeight = (nodes.length * itemHeight) + (categoriesCount * categoryHeight) + 100; // +100 for header/padding
        const dynamicHeight = Math.max(baseHeight, Math.min(contentHeight, window.innerHeight * 0.8));
        return `${dynamicHeight}px`;
    };
    return (_jsxs("aside", { "aria-label": "Node Palette", style: {
            width: collapsed ? 56 : 200,
            background: professionalColors.background.primary,
            color: professionalColors.text.primary,
            borderRight: `1px solid ${professionalColors.ui.border}`,
            padding: 0,
            height: calculateHeight(),
            maxHeight: '80vh',
            minHeight: '400px',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }, children: [_jsx("button", { "aria-label": collapsed ? 'Expand palette' : 'Collapse palette', "aria-expanded": !collapsed, onClick: onToggle, style: {
                    background: professionalColors.ui.hover
                }, "border:": true }), " `1px solid $", professionalColors.ui.border, "` color: professionalColors.text.primary fontSize: 18 width: '100%' padding: '12px 0' cursor: 'pointer' outline: 'none' transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' >", collapsed ? '»' : '«'] })
        ,
            _jsx("div", { style: {
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: collapsed ? 0 : 8,
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${professionalColors.ui.border} ${professionalColors.background.secondary}`
                }, children: collapsed
                    ? // Collapsed view - show icons only
                        nodes.map(node => (_jsx("div", { role: "button", tabIndex: 0, draggable: true, "aria-label": `${node.label} - ${node.tooltip}`.trim(), "aria-describedby": `tooltip-${node.id}`, "aria-grabbed": "false", onDragStart: e => {
                                e.dataTransfer?.setData?.('application/node-type', node.id);
                                onDragStart?.(node.id);
                            }, title: node.tooltip, style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '10px 0',
                                marginBottom: 4,
                                borderRadius: 6,
                                background: 'none',
                                cursor: 'grab',
                                outline: 'none'
                            }, onKeyDown: e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onDragStart?.(node.id);
                                }
                                    >
                                        (_jsx("span", { id: `tooltip-${node.id}`, style: { position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }, children: node.tooltip })
                                            ,
                                                _jsx("span", { style: { fontSize: 22, width: 28, textAlign: 'center' }, children: node.icon }));
                            } }, node.id)))
                    :
             }));
};
(() => {
    const categories = nodes.reduce((acc, node) => {
        const category = node.category || 'other';
        if (!acc[category])
            acc[category] = [];
        acc[category].push(node);
        return acc;
    }, {});
    const categoryOrder = [
        'content',
        'flow',
        'advanced',
        'transform',
        'output',
        'memory',
        'smart',
        'process',
        'other'
    ];
    const categoryLabels = { content: 'Content Building Blocks',
        flow: 'Content Flow Tools',
        advanced: 'Advanced Nodes',
        transform: 'Transform & Logic',
        output: 'Final Output',
        memory: 'Memory & Storage',
        smart: 'Smart Tools',
        process: 'Custom Processing',
        other: 'Other Tools' };
});
return categoryOrder.map(categoryKey => {
    const categoryNodes = categories[categoryKey];
    if (!categoryNodes || categoryNodes.length === 0)
        return null;
    return (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("div", { style: {
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 8,
                    paddingLeft: 8
                }, children: categoryLabels[categoryKey] }), categoryNodes.map(node => (_jsx("div", { role: "button", tabIndex: 0, draggable: true, "aria-label": `${node.label} - ${node.tooltip}`.trim(), "aria-describedby": `tooltip-${node.id}`, "aria-grabbed": "false", onDragStart: e => {
                    e.dataTransfer?.setData?.('application/node-type', node.id);
                    onDragStart?.(node.id);
                }, title: node.tooltip, style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 16px',
                    marginBottom: 4,
                    borderRadius: 6,
                    background: 'none',
                    cursor: 'grab',
                    outline: 'none',
                    transition: 'background-color 0.2s'
                }, onMouseEnter: e => {
                    e.currentTarget.style.backgroundColor = '#2a2f3a';
                }, onMouseLeave: e => {
                    e.currentTarget.style.backgroundColor = 'none';
                }, onKeyDown: e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onDragStart?.(node.id);
                    }
                        >
                            (_jsx("span", { id: `tooltip-${node.id}`, style: { position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }, children: node.tooltip })
                                ,
                                    _jsx("span", { style: { fontSize: 22, width: 28, textAlign: 'center' }, children: node.icon })
                                        ,
                                            _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 500 }, children: node.label }), _jsx("div", { style: { fontSize: 11, color: '#9ca3af', marginTop: 2 }, children: node.tooltip })] }));
                } }, node.id)))] }, categoryKey));
});
div >
;
;
;
();
div >
;
aside >
;
;
;
