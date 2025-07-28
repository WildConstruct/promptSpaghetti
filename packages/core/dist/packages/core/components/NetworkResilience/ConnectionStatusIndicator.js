import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ConnectionState, ConnectionQuality } from '../../network-resilience/ConnectionStateManager';
import { ReconnectionState } from '../../network-resilience/ReconnectionHandler';
{
    const [isAnimating, setIsAnimating] = useState(false);
    useEffect(() => {
        if (status.reconnectionState === ReconnectionState.ATTEMPTING) {
            setIsAnimating(true);
        }
        else {
            setIsAnimating(false);
        }
        [status.reconnectionState];
    });
    const getConnectionIcon = () => {
        if (status.reconnectionState === ReconnectionState.ATTEMPTING) {
            return '🔄';
            switch (status.connectionState) {
                case ConnectionState.CONNECTED:
                    return status.connectionQuality === ConnectionQuality.EXCELLENT ? '🟢' : ,
                        status.connectionQuality === ConnectionQuality.GOOD ? '🟡' : ,
                        status.connectionQuality === ConnectionQuality.FAIR ? '🟠' : '🔴';
                case ConnectionState.CONNECTING:
                    return '🔵';
                case ConnectionState.DISCONNECTED:
                    return '⚫';
                case ConnectionState.OFFLINE:
                    return '📴';
                case ConnectionState.FAILED:
                    return '❌';
                default:
                    return '❓';
            }
            ;
            const getStatusText = () => {
                if (status.reconnectionState === ReconnectionState.ATTEMPTING) {
                    return 'Reconnecting...';
                    switch (status.connectionState) {
                        case ConnectionState.CONNECTED:
                            return `Connected (${status.connectionQuality})`;
                    }
                }
            };
        }
    };
    ConnectionState.CONNECTING;
    return 'Connecting...';
    ConnectionState.DISCONNECTED;
    return 'Disconnected';
    ConnectionState.OFFLINE;
    return 'Offline';
    ConnectionState.FAILED;
    return 'Connection Failed';
    return 'Unknown';
}
;
const getStatusColor = () => {
    if (status.isOnline) {
        switch (status.connectionQuality) {
            case ConnectionQuality.EXCELLENT:
                return '#22c55e'; // green-500
            case ConnectionQuality.GOOD:
                return '#eab308'; // yellow-500
            case ConnectionQuality.FAIR:
                return '#f97316'; // orange-500
            case ConnectionQuality.POOR:
                return '#ef4444'; // red-500
            default:
                return '#6b7280'; // gray-500
        }
        {
            return status.reconnectionState === ReconnectionState.ATTEMPTING ? '#3b82f6' : '#ef4444';
        }
        ;
        const formatLastSync = () => {
            if (!status.lastSync)
                return 'Never';
            const now = Date.now();
            const diff = now - status.lastSync;
            if (diff < 60000)
                return 'Just now';
            if (diff < 3600000)
                return `${Math.floor(diff / 60000)}m ago`;
        };
        if (diff < 86400000)
            return `${Math.floor(diff / 3600000)}h ago`;
    }
    return `${Math.floor(diff / 86400000)}d ago`;
};
;
if (compact) {
    return;
    _jsxs("div", { className: `inline-flex items-center gap-1 cursor-pointer ${className}`, onClick: onClick, title: getStatusText(), children: [_jsx("span", { className: `text-sm ${isAnimating ? 'animate-spin' : ''}`, style: { color: getStatusColor() }, children: getConnectionIcon() }), status.queueSize > 0 && ()
                < span, " className=\"text-xs bg-orange-100 text-orange-800 px-1 rounded\">", status.queueSize] });
}
div >
;
;
return;
_jsx("div", { className: `connection-status-indicator ${className}`, onClick: onClick, style: {
        padding: '8px 12px',
        backgroundColor: '#f8fafc',
        border: `2px solid ${getStatusColor()}`
    }, "borderRadius:": true });
'8px',
    cursor;
onClick ? 'pointer' : 'default',
    minWidth;
'200px';
    >
        _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `text-lg ${isAnimating ? 'animate-spin' : ''}`, style: { color: getStatusColor() }, children: getConnectionIcon() }), _jsx("span", { className: "font-medium text-sm text-gray-800", children: getStatusText() })] }), status.queueSize > 0 && ()
                    < div, " className=\"flex items-center gap-1\">", _jsx("span", { className: "text-xs text-gray-600", children: "Queue:" }), _jsx("span", { className: "text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded", children: status.queueSize })] });
div >
    { showDetails } && ()
    < div;
className = "mt-2 pt-2 border-t border-gray-200" >
    _jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs text-gray-600", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Last Sync:" }), _jsx("span", { className: "ml-1", children: formatLastSync() })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Uptime:" }), _jsxs("span", { className: "ml-1", children: [Math.floor(status.metrics.uptime / 1000), "s"] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Synced:" }), _jsx("span", { className: "ml-1", children: status.metrics.syncedOperations })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Conflicts:" }), _jsx("span", { className: "ml-1", children: status.metrics.conflicts })] })] });
div >
;
{
    status.pendingSync && ()
        < div;
    className = "mt-2 pt-2 border-t border-gray-200" >
        _jsxs("div", { className: "flex items-center gap-2 text-xs text-blue-600", children: [_jsx("div", { className: "animate-spin", children: "\u2699\uFE0F" }), _jsx("span", { children: "Synchronizing..." })] });
    div >
    ;
}
div >
;
;
;
