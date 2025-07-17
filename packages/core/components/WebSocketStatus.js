import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const WebSocketStatus = ({ connectionState, queuedMessages = 0, className = '', showDetails = false }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'connected':
            case 'authenticated':
                return 'text-green-500';
            case 'connecting':
            case 'authenticating':
                return 'text-yellow-500';
            case 'disconnected':
                return 'text-gray-500';
            case 'error':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'connected':
            case 'authenticated':
                return '●';
            case 'connecting':
            case 'authenticating':
                return '◐';
            case 'disconnected':
                return '○';
            case 'error':
                return '✕';
            default:
                return '○';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'connected':
                return 'Connected';
            case 'authenticated':
                return 'Connected & Authenticated';
            case 'connecting':
                return 'Connecting...';
            case 'authenticating':
                return 'Authenticating...';
            case 'disconnected':
                return 'Disconnected';
            case 'error':
                return 'Connection Error';
            default:
                return 'Unknown';
        }
    };
    const formatTime = (timestamp) => {
        if (!timestamp)
            return 'Never';
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    };
    return (_jsxs("div", { className: `flex items-center space-x-2 ${className}`, children: [_jsx("span", { className: `text-sm font-mono ${getStatusColor(connectionState.status)}`, title: `Status: ${getStatusText(connectionState.status)}`, children: getStatusIcon(connectionState.status) }), _jsx("span", { className: "text-sm text-gray-600", children: getStatusText(connectionState.status) }), connectionState.reconnectAttempts > 0 && (_jsxs("span", { className: "text-xs text-yellow-600", children: ["(Retry ", connectionState.reconnectAttempts, ")"] })), queuedMessages > 0 && (_jsxs("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded", children: [queuedMessages, " queued"] })), connectionState.error && (_jsx("span", { className: "text-xs text-red-600 cursor-help", title: connectionState.error, children: "\u26A0" })), showDetails && (_jsx("div", { className: "text-xs text-gray-500 space-x-2", children: connectionState.lastConnected && (_jsxs("span", { children: ["Last connected: ", formatTime(connectionState.lastConnected)] })) }))] }));
};
// Compact version for status bars
export const WebSocketStatusIcon = ({ connectionState, onClick }) => {
    const statusColor = {
        connected: '#10b981',
        authenticated: '#10b981',
        connecting: '#f59e0b',
        authenticating: '#f59e0b',
        disconnected: '#6b7280',
        error: '#ef4444'
    }[connectionState.status];
    return (_jsx("div", { className: "cursor-pointer", onClick: onClick, title: `WebSocket: ${connectionState.status}${connectionState.error ? ` (${connectionState.error})` : ''}`, children: _jsx("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: statusColor, className: "animate-pulse-slow", children: _jsx("circle", { cx: "6", cy: "6", r: "5" }) }) }));
};
// Connection details modal/dropdown content
export const WebSocketDetails = ({ connectionState, queuedMessages = 0, onClearQueue, onReconnect, onDisconnect }) => {
    const isConnected = connectionState.status === 'connected' || connectionState.status === 'authenticated';
    const canReconnect = connectionState.status === 'disconnected' || connectionState.status === 'error';
    return (_jsx("div", { className: "p-4 bg-white rounded-lg shadow-lg border w-80", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-medium text-gray-900", children: "WebSocket Connection" }), _jsx(WebSocketStatusIcon, { connectionState: connectionState })] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Status:" }), _jsx("span", { className: `font-medium ${isConnected ? 'text-green-600' :
                                        connectionState.status === 'error' ? 'text-red-600' :
                                            'text-gray-600'}`, children: connectionState.status })] }), connectionState.lastConnected && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Last Connected:" }), _jsx("span", { className: "text-gray-900", children: new Date(connectionState.lastConnected).toLocaleString() })] })), connectionState.reconnectAttempts > 0 && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Reconnect Attempts:" }), _jsx("span", { className: "text-yellow-600", children: connectionState.reconnectAttempts })] })), queuedMessages > 0 && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Queued Messages:" }), _jsx("span", { className: "text-blue-600", children: queuedMessages })] })), connectionState.error && (_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-gray-600 mb-1", children: "Error:" }), _jsx("span", { className: "text-red-600 text-xs bg-red-50 p-2 rounded", children: connectionState.error })] }))] }), _jsxs("div", { className: "flex space-x-2 pt-2 border-t", children: [canReconnect && onReconnect && (_jsx("button", { onClick: onReconnect, className: "flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600", children: "Reconnect" })), isConnected && onDisconnect && (_jsx("button", { onClick: onDisconnect, className: "flex-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600", children: "Disconnect" })), queuedMessages > 0 && onClearQueue && (_jsx("button", { onClick: onClearQueue, className: "flex-1 px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600", children: "Clear Queue" }))] })] }) }));
};
