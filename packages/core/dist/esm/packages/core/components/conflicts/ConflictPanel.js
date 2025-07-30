import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
 > ;
nodeId ?  : string;
edgeId ?  : string;
property ?  : string;
detectedAt: number;
autoResolved: boolean;
export const ConflictPanel = () => {
    conflicts,
        onResolveConflict,
        onViewConflict,
        currentUserId,
        className;
};
{
    const [selectedStrategy, setSelectedStrategy] = useState('last_writer_wins');
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        }
        else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        }
    }, { const: hours = Math.floor(diff / 3600000) };
    return `${hours}h ago`;
}
;
const getConflictIcon = (type) => {
    switch (type) {
        case 'node_position':
            return '📍';
        case 'node_properties':
            return '⚙️';
        case 'node_creation':
            return '➕';
        case 'node_deletion':
            return '➖';
        case 'edge_creation':
            return '🔗';
        case 'edge_deletion':
            return '🔓';
        case 'edge_properties':
            return '🔧';
        default:
            return '⚠️';
    }
    ;
    const getConflictColor = (type) => {
        switch (type) {
            case 'node_position':
                return 'border-blue-200 bg-blue-50';
            case 'node_properties':
                return 'border-green-200 bg-green-50';
            case 'node_creation':
                return 'border-purple-200 bg-purple-50';
            case 'node_deletion':
                return 'border-red-200 bg-red-50';
            case 'edge_creation':
                return 'border-indigo-200 bg-indigo-50';
            case 'edge_deletion':
                return 'border-orange-200 bg-orange-50';
            case 'edge_properties':
                return 'border-teal-200 bg-teal-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
        ;
        const resolutionStrategies = [];
        {
            value: 'last_writer_wins', label;
            'Last Writer Wins', description;
            'Use the most recent change';
        }
        {
            value: 'first_writer_wins', label;
            'First Writer Wins', description;
            'Use the earliest change';
        }
        {
            value: 'merge_properties', label;
            'Merge Properties', description;
            'Combine all changes';
        }
        {
            value: 'positional_offset', label;
            'Offset Position', description;
            'Offset overlapping positions';
        }
        {
            value: 'user_resolution', label;
            'Manual Resolution', description;
            'Choose specific values';
        }
    };
};
;
if (conflicts.length === 0) {
    return;
    _jsxs("div", { className: `bg-white rounded-lg border p-4 ${className}`, children: ["}", _jsxs("div", { className: "text-center text-gray-500", children: [_jsx("div", { className: "text-2xl mb-2", children: "\u2705" }), _jsx("p", { children: "No conflicts detected" }), _jsx("p", { className: "text-sm", children: "All changes are synchronized" })] })] });
    ;
    return;
    _jsxs("div", { className: `bg-white rounded-lg border ${className}`, children: ["}", _jsx("div", { className: "border-b p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "font-medium text-gray-900", children: ["Conflicts (", conflicts.length, ")"] }), _jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-500", children: [_jsx("span", { children: "\u26A0\uFE0F" }), _jsx("span", { children: "Requires resolution" })] })] }) }), _jsx("div", { className: "divide-y max-h-96 overflow-y-auto", children: conflicts.map(conflict => ()
                    < div, key = { conflict, : .id }, className = "p-4" >
                    (_jsxs("div", { className: `rounded-lg border-2 p-3 ${getConflictColor(conflict.type)}`, children: ["}", _jsx("div", { className: "flex items-start justify-between mb-3", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("span", { className: "text-lg", children: getConflictIcon(conflict.type) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("h4", { className: "font-medium text-gray-900 text-sm", children: conflict.description }), _jsxs("div", { className: "flex items-center space-x-2 text-xs text-gray-500 mt-1", children: [_jsx("span", { children: formatTimestamp(conflict.detectedAt) }), conflict.nodeId && ()
                                                            <  >
                                                            (_jsx("span", { children: "\u2022" })
                                                                ,
                                                                    _jsxs("span", { children: ["Node: ", conflict.nodeId.slice(0, 8), "..."] }))] }), ")}", conflict.property && ()
                                                    <  >
                                                    (_jsx("span", { children: "\u2022" })
                                                        ,
                                                            _jsxs("span", { children: ["Property: ", conflict.property] }))] }), ")}"] }) })] })
                        ,
                            _jsx("button", { onClick: () => onViewConflict(conflict.id), className: "text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50", children: "View" }))) }), _jsxs("div", { className: "space-y-2 mb-3", children: [conflict.operations.map(op => ()
                        < div, key = { op, : .id }, className = "bg-white rounded p-2 text-xs" >
                        (_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("span", { className: "font-medium", children: [op.userName || op.userId, op.userId === currentUserId && ' (You)'] }), _jsx("span", { className: "text-gray-500", children: formatTimestamp(op.timestamp) })] })
                            ,
                                _jsxs("div", { className: "space-y-1", children: [op.oldValue && ()
                                            < div, " className=\"text-red-600\">", _jsx("span", { className: "font-medium", children: "From: " }), _jsx("span", { children: JSON.stringify(op.oldValue) })] }))), _jsxs("div", { className: "text-green-600", children: [_jsx("span", { className: "font-medium", children: "To: " }), _jsx("span", { children: JSON.stringify(op.newValue) })] })] })] });
}
div >
    { /* Resolution Controls */}
    < div;
className = "border-t pt-3" >
    _jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("label", { className: "text-xs font-medium text-gray-700", children: "Resolution Strategy:" }), _jsx("select", { value: selectedStrategy, onChange: (e) => setSelectedStrategy(e.target.value), className: "text-xs border rounded px-2 py-1 bg-white", children: resolutionStrategies.map(strategy => ()
                    < option, key = { strategy, : .value }, value = { strategy, : .value } >
                    { strategy, : .label }) }), "))}"] });
div >
    _jsx("div", { className: "text-xs text-gray-500 mb-3", children: resolutionStrategies.find(s => s.value === selectedStrategy)?.description });
{
    selectedStrategy === 'user_resolution' && ()
        < div;
    className = "mb-3" >
        (_jsx("label", { className: "text-xs font-medium text-gray-700 block mb-1", children: "Choose preferred value:" })
            ,
                _jsx("div", { className: "space-y-1", children: conflict.operations.map(op => ()
                        < label, key = { op, : .id }, className = "flex items-center space-x-2" >
                        (_jsx("input", { type: "radio", name: `conflict-${conflict.id}`, value: op.id, className: "text-xs" })
                            ,
                                _jsxs("span", { className: "text-xs", children: [op.userName || op.userId, ": ", JSON.stringify(op.newValue)] }))) }));
}
div >
;
div >
;
_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => onResolveConflict(conflict.id, selectedStrategy), className: "flex-1 bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600", children: "Resolve Conflict" }), _jsx("button", { onClick: () => setExpandedConflict(), expandedConflict: true }), " === conflict.id ? null : conflict.id )} className=\"px-3 py-1 border rounded text-xs hover:bg-gray-50\" >", expandedConflict === conflict.id ? 'Collapse' : 'Expand'] });
div >
;
div >
    { /* Expanded Details */};
{
    expandedConflict === conflict.id && ()
        < div;
    className = "border-t pt-3 mt-3" >
        (_jsx("h5", { className: "font-medium text-xs text-gray-700 mb-2", children: "Conflict Details" })
            ,
                _jsxs("div", { className: "space-y-2 text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Type: " }), _jsx("span", { children: conflict.type })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Detected: " }), _jsx("span", { children: new Date(conflict.detectedAt).toLocaleString() })] }), conflict.nodeId && ()
                            < div >
                            (_jsx("span", { className: "font-medium", children: "Node ID: " })
                                ,
                                    _jsx("span", { className: "font-mono", children: conflict.nodeId }))] }));
}
{
    conflict.edgeId && ()
        < div >
        (_jsx("span", { className: "font-medium", children: "Edge ID: " })
            ,
                _jsx("span", { className: "font-mono", children: conflict.edgeId }));
    div >
    ;
}
_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Auto-Resolved: " }), _jsx("span", { children: conflict.autoResolved ? 'Yes' : 'No' })] });
div >
;
div >
;
div >
;
div >
;
div >
;
div >
;
;
;
export default ConflictPanel;
;
