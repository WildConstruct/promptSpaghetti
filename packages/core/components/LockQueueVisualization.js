import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Clock, User, X } from 'lucide-react';
export const LockQueueVisualization = ({ queue, onRemoveFromQueue }) => {
    const groupedQueue = queue.reduce((acc, item) => {
        if (!acc[item.resource_id]) {
            acc[item.resource_id] = [];
        }
        acc[item.resource_id].push(item);
        return acc;
    }, {});
    const formatWaitTime = (minutes) => {
        if (minutes < 60)
            return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 1: return 'bg-red-100 text-red-800 border-red-200';
            case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
            case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 4: return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 1: return 'Critical';
            case 2: return 'High';
            case 3: return 'Medium';
            case 4: return 'Low';
            default: return 'Normal';
        }
    };
    if (queue.length === 0) {
        return (_jsxs("div", { className: "text-center py-8", children: [_jsx(Clock, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Queue Items" }), _jsx("p", { className: "text-gray-500", children: "There are no pending lock requests in the queue." })] }));
    }
    return (_jsx("div", { className: "space-y-6", children: Object.entries(groupedQueue).map(([resourceId, items]) => (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900", children: ["Resource: ", resourceId.substring(0, 8), "..."] }), _jsxs("span", { className: "px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full", children: [items.length, " in queue"] })] }) }), _jsx("div", { className: "space-y-2", children: items
                        .sort((a, b) => a.priority - b.priority || new Date(a.queued_at).getTime() - new Date(b.queued_at).getTime())
                        .map((item, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: _jsxs("span", { className: "text-sm font-medium text-blue-600", children: ["#", index + 1] }) }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(User, { className: "h-4 w-4 text-gray-400" }), _jsxs("span", { className: "text-sm font-medium text-gray-900", children: [item.user_id.substring(0, 8), "..."] })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsx("span", { className: "text-sm text-gray-500", children: item.lock_type.replace('_', ' ') }) }), _jsx("div", { className: `px-2 py-1 text-xs rounded-full border ${getPriorityColor(item.priority)}`, children: getPriorityLabel(item.priority) })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center space-x-1 text-sm text-gray-500", children: [_jsx(Clock, { className: "h-3 w-3" }), _jsx("span", { children: item.estimated_wait_time
                                                            ? formatWaitTime(item.estimated_wait_time)
                                                            : 'Unknown' })] }), _jsxs("div", { className: "text-xs text-gray-400", children: ["Queued: ", new Date(item.queued_at).toLocaleString()] })] }), _jsx("button", { onClick: () => onRemoveFromQueue(item.id), className: "p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded", title: "Remove from queue", children: _jsx(X, { className: "h-4 w-4" }) })] })] }, item.id))) }), _jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-gray-500", children: "Total Wait Time" }), _jsx("div", { className: "font-medium text-gray-900", children: formatWaitTime(items.reduce((sum, item) => sum + (item.estimated_wait_time || 0), 0)) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-gray-500", children: "Avg Wait Time" }), _jsx("div", { className: "font-medium text-gray-900", children: formatWaitTime(Math.round(items.reduce((sum, item) => sum + (item.estimated_wait_time || 0), 0) / items.length)) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-gray-500", children: "Queue Length" }), _jsx("div", { className: "font-medium text-gray-900", children: items.length })] })] }) })] }, resourceId))) }));
};
