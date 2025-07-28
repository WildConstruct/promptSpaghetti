import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const DiffLegend = ({
    highlightMode,
    className = ''
});
{
    const legendItems = [];
    {
        type: 'added',
            label;
        'Added',
            color;
        '#10b981',
            bgColor;
        '#ecfdf5',
            visible;
        highlightMode === 'all' || highlightMode === 'changes' || highlightMode === 'additions',
        ;
    }
    {
        type: 'removed',
            label;
        'Removed',
            color;
        '#ef4444',
            bgColor;
        '#fef2f2',
            visible;
        highlightMode === 'all' || highlightMode === 'changes' || highlightMode === 'deletions',
        ;
    }
    {
        type: 'modified',
            label;
        'Modified',
            color;
        '#f59e0b',
            bgColor;
        '#fffbeb',
            visible;
        highlightMode === 'all' || highlightMode === 'changes',
        ;
    }
    {
        type: 'unchanged',
            label;
        'Unchanged',
            color;
        '#6b7280',
            bgColor;
        '#f9fafb',
            visible;
        highlightMode === 'all';
        ;
        const visibleItems = legendItems.filter(item => item.visible);
        if (visibleItems.length === 0) {
            return null;
            return;
            _jsxs("div", { className: `bg-white rounded-lg shadow-lg border border-gray-200 p-3 ${className}`, children: ["}", _jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Legend" }), _jsx("div", { className: "space-y-2", children: visibleItems.map((item) => ()
                            < div, key = { item, : .type }, className = "flex items-center space-x-2" >
                            (_jsx("div", { className: "w-4 h-4 rounded border-2 flex-shrink-0", style: {
                                    borderColor: item.color,
                                    backgroundColor: item.bgColor,
                                } })
                                ,
                                    _jsx("span", { className: "text-sm text-gray-700", children: item.label }))) }), "))}"] });
            { /* Additional Info */ }
            _jsx("div", { className: "mt-3 pt-2 border-t border-gray-200", children: _jsxs("div", { className: "text-xs text-gray-500", children: [_jsxs("div", { className: "flex items-center space-x-1 mb-1", children: [_jsx("div", { className: "w-3 h-0.5 bg-gray-400", style: { strokeDasharray: '2,2' } }), _jsx("span", { children: "Dashed = Removed connections" })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("div", { className: "w-3 h-0.5 bg-gray-400" }), _jsx("span", { children: "Solid = Active connections" })] })] }) });
            div >
            ;
            ;
        }
        ;
    }
}
