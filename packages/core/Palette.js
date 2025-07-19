import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Palette = ({ nodes, collapsed, onToggle, onDragStart }) => {
    return (_jsxs("aside", { "aria-label": "Node Palette", style: {
            width: collapsed ? 56 : 200,
            background: '#181b21',
            color: '#fff',
            borderRight: '1px solid #222',
            padding: 0,
            height: '100%',
            transition: 'width 0.2s',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
        }, children: [_jsx("button", { "aria-label": collapsed ? 'Expand palette' : 'Collapse palette', "aria-expanded": !collapsed, onClick: onToggle, style: {
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontSize: 18,
                    width: '100%',
                    padding: '12px 0',
                    cursor: 'pointer',
                    outline: 'none',
                }, children: collapsed ? '»' : '«' }), _jsx("div", { style: { flex: 1, overflowY: 'auto', padding: collapsed ? 0 : 8 }, children: collapsed ? (
                // Collapsed view - show icons only
                nodes.map((node) => (_jsxs("div", { role: "button", tabIndex: 0, draggable: true, "aria-label": `${node.label} - ${node.tooltip}`.trim(), "aria-describedby": `tooltip-${node.id}`, "aria-grabbed": "false", onDragStart: (e) => {
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
                        outline: 'none',
                    }, onKeyDown: (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            onDragStart?.(node.id);
                        }
                    }, children: [_jsx("span", { id: `tooltip-${node.id}`, style: { position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }, children: node.tooltip }), _jsx("span", { style: { fontSize: 22, width: 28, textAlign: 'center' }, children: node.icon })] }, node.id)))) : (
                // Expanded view - show by category
                (() => {
                    const categories = nodes.reduce((acc, node) => {
                        const category = node.category || 'other';
                        if (!acc[category])
                            acc[category] = [];
                        acc[category].push(node);
                        return acc;
                    }, {});
                    const categoryOrder = ['text', 'logic', 'output', 'variable', 'other'];
                    const categoryLabels = {
                        text: 'Text Elements',
                        logic: 'Logic & Flow',
                        output: 'Output',
                        variable: 'Variables',
                        other: 'Other'
                    };
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
                                        paddingLeft: 8,
                                    }, children: categoryLabels[categoryKey] }), categoryNodes.map((node) => (_jsxs("div", { role: "button", tabIndex: 0, draggable: true, "aria-label": `${node.label} - ${node.tooltip}`.trim(), "aria-describedby": `tooltip-${node.id}`, "aria-grabbed": "false", onDragStart: (e) => {
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
                                        transition: 'background-color 0.2s',
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.backgroundColor = '#2a2f3a';
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.backgroundColor = 'none';
                                    }, onKeyDown: (e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            onDragStart?.(node.id);
                                        }
                                    }, children: [_jsx("span", { id: `tooltip-${node.id}`, style: { position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }, children: node.tooltip }), _jsx("span", { style: { fontSize: 22, width: 28, textAlign: 'center' }, children: node.icon }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 500 }, children: node.label }), _jsx("div", { style: { fontSize: 11, color: '#9ca3af', marginTop: 2 }, children: node.tooltip })] })] }, node.id)))] }, categoryKey));
                    });
                })()) })] }));
};
