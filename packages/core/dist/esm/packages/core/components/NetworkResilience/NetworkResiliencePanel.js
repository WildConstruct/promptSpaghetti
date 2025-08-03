import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { ReconnectionState } from '../../network-resilience/ReconnectionHandler';
import { ConnectionQuality } from '../../network-resilience/ConnectionStateManager';
{
    const [activeTab, setActiveTab] = useState('status');
    const formatDuration = (ms) => {
        if (ms < 1000)
            return `${ms}ms`;
    };
    if (ms < 60000)
        return `${(ms / 1000).toFixed(1)}s`;
}
if (ms < 3600000)
    return `${(ms / 60000).toFixed(1)}m`;
return `${(ms / 3600000).toFixed(1)}h`;
;
const formatTimestamp = (timestamp) => { return new Date(timestamp).toLocaleTimeString(); };
const getOperationPriorityColor = (priority) => {
    switch (priority) {
        case 'high': return '#dc2626';
        case 'medium': return '#d97706';
        case 'low': return '#059669';
        default: return '#6b7280';
    }
    ;
    const getConnectionQualityDescription = (quality) => {
        switch (quality) {
            case ConnectionQuality.EXCELLENT:
                return 'Excellent connection quality. Low latency, no packet loss.';
            case ConnectionQuality.GOOD:
                return 'Good connection quality. Acceptable latency and minimal packet loss.';
            case ConnectionQuality.FAIR:
                return 'Fair connection quality. Some latency or packet loss detected.';
            case ConnectionQuality.POOR:
                return 'Poor connection quality. High latency or significant packet loss.';
            default:
        }
        return 'Connection quality unknown. Gathering metrics...';
    };
    if (!isOpen)
        return null;
    return;
    _jsxs("div", { className: "network-resilience-panel", children: [_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-40", onClick: onClose }), _jsxs("div", { className: "fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-auto", style: { maxWidth: '90vw' }, children: [_jsxs("div", { className: "border-b border-gray-200 p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Network Resilience" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 text-xl", children: "\u2715" })] }), _jsx("div", { className: "mt-3", children: _jsx(ConnectionStatusIndicator, { status: status, showDetails: true, className: "w-full" }) })] }), _jsxs("div", { className: "border-b border-gray-200", children: [_jsxs("nav", { className: "flex", children: [[
                                        { id: 'status', label: 'Status', count: undefined },
                                        { id: 'queue', label: 'Queue', count: status.queueSize },
                                        { id: 'metrics', label: 'Metrics', count: undefined }
                                    ].map((tab) => ()
                                        < button, key = { tab, : .id }, onClick = {}()), " => setActiveTab(tab.id as any)} className=", `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}
`, ">", tab.label, tab.count !== undefined && tab.count > 0 && ()
                                        < span, " className=\"ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs\">", tab.count] }), ")}"] }), "))}"] })] });
    { /* Content */ }
    _jsxs("div", { className: "p-4", children: [activeTab === 'status' && ()
                < div, " className=\"space-y-4\">", _jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [_jsx("h3", { className: "font-medium text-gray-900 mb-2", children: "Connection Details" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "State:" }), _jsx("span", { className: "font-medium", children: status.connectionState })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Quality:" }), _jsx("span", { className: "font-medium", style: { color: getOperationPriorityColor(),
                                            status, : .connectionQuality === ConnectionQuality.EXCELLENT ? 'low' :
                                                status.connectionQuality === ConnectionQuality.GOOD ? 'medium' : 'high' } }), ")}}>", status.connectionQuality] })] }), _jsx("div", { className: "col-span-2 text-xs text-gray-500 mt-1", children: getConnectionQualityDescription(status.connectionQuality) })] })] });
    { /* Reconnection Status */ }
    {
        status.reconnectionState !== ReconnectionState.IDLE && ()
            < div;
        className = "bg-blue-50 rounded-lg p-3" >
            (_jsx("h3", { className: "font-medium text-blue-900 mb-2", children: "Reconnection Status" })
                ,
                    _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-blue-700", children: "State:" }), _jsx("span", { className: "font-medium text-blue-900", children: status.reconnectionState })] }), status.reconnectionState === ReconnectionState.ATTEMPTING && ()
                                < div, " className=\"text-xs text-blue-600\"> Attempting to reconnect..."] }));
    }
};
div >
;
div >
;
{ /* Sync Status */ }
_jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [_jsx("h3", { className: "font-medium text-gray-900 mb-2", children: "Synchronization" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Last Sync:" }), _jsx("span", { className: "font-medium", children: status.lastSync ? formatTimestamp(status.lastSync) : 'Never' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Pending Sync:" }), _jsx("span", { className: "font-medium", children: status.pendingSync ? 'Yes' : 'No' })] })] })] });
{ /* Actions */ }
_jsxs("div", { className: "space-y-2", children: [!status.isOnline && onRetryConnection && ()
            < button, "onClick=", onRetryConnection, "className=\"w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors\" > Retry Connection"] });
{
    status.isOnline && onForceSync && ()
        < button;
    onClick = { onForceSync };
    className = "w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors";
    disabled = { status, : .pendingSync }
        >
            { status, : .pendingSync ? 'Syncing...' : 'Force Sync' };
    button >
    ;
}
{
    status.queueSize > 0 && onClearQueue && ()
        < button;
    onClick = { onClearQueue };
    className = "w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
            Clear;
    Queue;
    button >
    ;
}
div >
;
div >
;
{
    activeTab === 'queue' && ()
        < div;
    className = "space-y-3" >
        { queuedOperations, : .length === 0 ? ()
                < div : , className = "text-center text-gray-500 py-8" >
                (_jsx("div", { className: "text-4xl mb-2", children: "\u2705" })
                    ,
                        _jsx("div", { children: "No pending operations" })),
            div } >
    ;
    ()
        <  >
        _jsxs("div", { className: "text-sm text-gray-600 mb-3", children: [queuedOperations.length, " operation", queuedOperations.length === 1 ? '' : 's', " pending"] });
    {
        queuedOperations.map((operation) => ()
            < div, key = { operation, : .id }, className = "border border-gray-200 rounded-lg p-3" >
            _jsxs("div", { className: "flex items-start justify-between", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium text-sm", children: operation.type }), _jsx("span", { className: "px-2 py-0.5 rounded text-xs font-medium", style: {
                                        backgroundColor: `${getOperationPriorityColor(operation.priority)}20`
                                    }, "color:getOperationPriorityColor": true }), "(operation.priority); } >", operation.priority] }) }), _jsxs("div", { className: "text-xs text-gray-500 space-y-1", children: [_jsxs("div", { children: ["Created: ", formatTimestamp(operation.timestamp)] }), operation.retryCount > 0 && ()
                                < div > Retries, ": ", operation.retryCount, "/", operation.maxRetries] }), ")}", operation.expiresAt && ()
                        < div > Expires, ": ", formatTimestamp(operation.expiresAt)] }));
    }
    div >
    ;
    div >
        { onRetryOperation } && ()
        < button;
    onClick = {}();
    onRetryOperation(operation.id);
}
className = "text-blue-600 hover:text-blue-800 text-sm"
    >
        Retry;
button >
;
div >
;
div >
;
 >
;
div >
;
{
    activeTab === 'metrics' && ()
        < div;
    className = "space-y-4" >
        { /* Connection Metrics */}
        < div;
    className = "bg-gray-50 rounded-lg p-3" >
        (_jsx("h3", { className: "font-medium text-gray-900 mb-3", children: "Connection" })
            ,
                _jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Uptime:" }), _jsx("div", { className: "font-medium", children: formatDuration(status.metrics.uptime) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Downtime:" }), _jsx("div", { className: "font-medium", children: formatDuration(status.metrics.totalDowntime) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Attempts:" }), _jsx("div", { className: "font-medium", children: status.metrics.connectionAttempts })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Successful:" }), _jsx("div", { className: "font-medium", children: status.metrics.successfulReconnections })] })] }));
    div >
        { /* Operation Metrics */}
        < div;
    className = "bg-gray-50 rounded-lg p-3" >
        (_jsx("h3", { className: "font-medium text-gray-900 mb-3", children: "Operations" })
            ,
                _jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Queued:" }), _jsx("div", { className: "font-medium", children: status.metrics.queuedOperations })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Synced:" }), _jsx("div", { className: "font-medium", children: status.metrics.syncedOperations })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Pending:" }), _jsx("div", { className: "font-medium", children: status.metrics.pendingOperations })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Conflicts:" }), _jsx("div", { className: "font-medium", children: status.metrics.conflicts })] })] }));
    div >
        { /* Performance Metrics */}
        < div;
    className = "bg-gray-50 rounded-lg p-3" >
        (_jsx("h3", { className: "font-medium text-gray-900 mb-3", children: "Performance" })
            ,
                _jsxs("div", { className: "grid grid-cols-1 gap-3 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Avg Reconnect Time:" }), _jsx("div", { className: "font-medium", children: formatDuration(status.metrics.averageReconnectTime) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Data Loss Events:" }), _jsx("div", { className: "font-medium", children: status.metrics.dataLoss })] })] }));
    div >
    ;
    div >
    ;
}
div >
;
div >
;
div >
;
;
;
