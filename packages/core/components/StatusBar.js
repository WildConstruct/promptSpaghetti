import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { WebSocketStatusIcon, WebSocketDetails } from "./WebSocketStatus";
export const StatusBar = ({ statusMessage, errors, onPreview, onSaveJson, onCorrections, correctionsEnabled = false, correctionsOpen = false, onStats, statsOpen = false, onExtensions, extensionsOpen = false, connectionState, queuedMessages = 0, onClearQueue, onReconnect, onDisconnect, }) => {
    const errorCount = errors.length;
    const [showWebSocketDetails, setShowWebSocketDetails] = useState(false);
    const wsDetailsRef = useRef(null);
    // Close WebSocket details when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wsDetailsRef.current && !wsDetailsRef.current.contains(event.target)) {
                setShowWebSocketDetails(false);
            }
        };
        if (showWebSocketDetails) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showWebSocketDetails]);
    return (_jsxs("div", { style: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#fff",
            borderTop: "1px solid #eee",
            padding: 8,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }, children: [_jsxs("div", { "aria-live": "polite", children: [statusMessage && _jsx("span", { style: { marginRight: 16 }, children: statusMessage }), _jsx("button", { onClick: onPreview, style: {
                            marginRight: 16,
                            padding: '6px 16px',
                            background: '#eee',
                            color: '#23272f',
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            fontWeight: 500,
                            cursor: 'pointer'
                        }, children: "Preview" }), _jsx("button", { onClick: onSaveJson, style: {
                            marginRight: 16,
                            padding: '6px 16px',
                            background: '#eee',
                            color: '#23272f',
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            fontWeight: 500,
                            cursor: 'pointer'
                        }, children: "Save as JSON" }), correctionsEnabled && onCorrections && (_jsx("button", { onClick: onCorrections, style: {
                            marginRight: 16,
                            padding: '6px 16px',
                            background: correctionsOpen ? '#4a5568' : '#eee',
                            color: correctionsOpen ? '#fff' : '#23272f',
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            fontWeight: 500,
                            cursor: 'pointer'
                        }, children: "Corrections" })), correctionsEnabled && onStats && (_jsx("button", { onClick: onStats, style: {
                            marginRight: 16,
                            padding: '6px 16px',
                            background: statsOpen ? '#4a5568' : '#eee',
                            color: statsOpen ? '#fff' : '#23272f',
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            fontWeight: 500,
                            cursor: 'pointer'
                        }, children: "\uD83D\uDCCA Stats" })), onExtensions && (_jsx("button", { onClick: onExtensions, style: {
                            marginRight: 16,
                            padding: '6px 16px',
                            background: extensionsOpen ? '#4a5568' : '#eee',
                            color: extensionsOpen ? '#fff' : '#23272f',
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            fontWeight: 500,
                            cursor: 'pointer'
                        }, children: "\uD83E\uDDE9 Extensions" })), errorCount === 0 ? "No errors" : `${errorCount} error${errorCount > 1 ? "s" : ""}`, errorCount > 0 && (_jsx("span", { style: { marginLeft: 16 }, children: errors.map((err) => (_jsx("span", { style: { color: "#f00", marginRight: 8 }, title: err.message, children: err.message }, err.edgeId))) }))] }), _jsx("div", { style: { display: 'flex', alignItems: 'center', position: 'relative' }, children: connectionState && (_jsxs(_Fragment, { children: [_jsx(WebSocketStatusIcon, { connectionState: connectionState, onClick: () => setShowWebSocketDetails(!showWebSocketDetails) }), showWebSocketDetails && (_jsx("div", { ref: wsDetailsRef, style: {
                                position: 'absolute',
                                bottom: '100%',
                                right: 0,
                                marginBottom: 8,
                                zIndex: 1000
                            }, children: _jsx(WebSocketDetails, { connectionState: connectionState, queuedMessages: queuedMessages, onClearQueue: onClearQueue, onReconnect: onReconnect, onDisconnect: onDisconnect }) }))] })) })] }));
};
