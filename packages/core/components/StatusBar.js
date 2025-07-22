import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
export const [showWebSocketDetails, setShowWebSocketDetails] = useState(false);
const [showEncryptionDetails, setShowEncryptionDetails] = useState(false);
const wsDetailsRef = useRef(null);
const encryptionDetailsRef = useRef(null);
// Close details when clicking outside
useEffect(() => {
    const handleClickOutside = (event) => {
        if (wsDetailsRef.current && !wsDetailsRef.current.contains(event.target)) {
            setShowWebSocketDetails(false);
        }
        if (encryptionDetailsRef.current && !encryptionDetailsRef.current.contains(event.target)) {
            setShowEncryptionDetails(false);
        }
    };
    if (showWebSocketDetails || showEncryptionDetails) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }
}, [showWebSocketDetails, showEncryptionDetails]);
return (_jsxs("div", { style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #eee',
        padding: 8,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    }, children: [_jsxs("div", { "aria-live": "polite", children: [statusMessage && _jsx("span", { style: { marginRight: 16 }, children: statusMessage }), currentProjectName && (_jsxs("span", { style: {
                        marginRight: 16,
                        padding: '4px 8px',
                        background: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: 3,
                        fontSize: '13px',
                        color: '#495057'
                    }, children: ["\uD83D\uDCC1 ", currentProjectName, hasUnsavedChanges ? ' •' : ''] })), _jsx("button", { onClick: onPreview, style: {
                        marginRight: 16,
                        padding: '6px 16px',
                        background: '#eee',
                        color: '#23272f',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        fontWeight: 500,
                        cursor: 'pointer'
                    }, children: "Preview" }), onNewProject && (_jsx("button", { onClick: onNewProject, title: "Create a new project", style: {
                        marginRight: 16,
                        padding: '6px 16px',
                        background: '#eee',
                        color: '#23272f',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        fontWeight: 500,
                        cursor: 'pointer'
                    }, children: "\uD83D\uDCC4 New" })), onSaveProject && (_jsxs("button", { onClick: onSaveProject, title: "Save project as .psg file", style: {
                        marginRight: 16,
                        padding: '6px 16px',
                        background: hasUnsavedChanges ? '#4CAF50' : '#eee',
                        color: hasUnsavedChanges ? 'white' : '#23272f',
                        border: hasUnsavedChanges ? '1px solid #45a049' : '1px solid #ccc',
                        borderRadius: 4,
                        fontWeight: 500,
                        cursor: 'pointer'
                    }, children: ["\uD83D\uDCBE Save Project", hasUnsavedChanges ? ' *' : ''] })), onLoadProject && (_jsx("button", { onClick: onLoadProject, title: "Load project from .psg file", style: {
                        marginRight: 16,
                        padding: '6px 16px',
                        background: '#eee',
                        color: '#23272f',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        fontWeight: 500,
                        cursor: 'pointer'
                    }, children: "\uD83D\uDCC2 Load Project" })), _jsx("button", { onClick: onSaveJson, style: {
                        marginRight: 16,
                        padding: '6px 16px',
                        background: '#eee',
                        color: '#23272f',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        fontWeight: 500,
                        cursor: 'pointer'
                    }, children: "\uD83D\uDCCB Share Template" }), onExportBundle && (_jsx("button", { onClick: onExportBundle, title: "Export for use in production pipeline", style: {
                        marginRight: 16,
                        padding: '6px 16px',
                        background: '#4CAF50',
                        color: 'white',
                        border: '1px solid #45a049',
                        borderRadius: 4,
                        fontWeight: 500,
                        cursor: 'pointer'
                    }, children: "\uD83D\uDCE6 Export for Pipeline" })), onSaveTemplate && (_jsx("button", { onClick: onSaveTemplate, title: "Save current workflow as reusable template", style: {
                        marginRight: 16,
                        padding: '6px 16px',
                        background: '#8b5cf6',
                        color: 'white',
                        border: '1px solid #7c3aed',
                        borderRadius: 4,
                        fontWeight: 500,
                        cursor: 'pointer'
                    }, children: "\uD83D\uDCBE Save Template" })), onBrowseTemplates && (_jsx("button", { onClick: onBrowseTemplates, title: "Browse and apply workflow templates", style: {
                        marginRight: 16,
                        padding: '6px 16px',
                        background: '#06b6d4',
                        color: 'white',
                        border: '1px solid #0891b2',
                        borderRadius: 4,
                        fontWeight: 500,
                        cursor: 'pointer'
                    }, children: "\uD83D\uDCDA Templates" })), correctionsEnabled && onCorrections && (_jsx("button", { onClick: onCorrections, style: {
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
                    }, children: "\uD83E\uDDE9 Extensions" })), onOptimization && (_jsx("button", { "data-optimization-button": true, onClick: onOptimization, title: "Open workflow optimization and performance tools", style: {
                        marginRight: 16,
                        padding: '6px 16px',
                        background: optimizationEnabled ? '#17a2b8' : '#eee',
                        color: optimizationEnabled ? 'white' : '#23272f',
                        border: optimizationEnabled ? '1px solid #138496' : '1px solid #ccc',
                        borderRadius: 4,
                        fontWeight: 500,
                        cursor: 'pointer'
                    }, children: "\u26A1 Optimize" })), errorCount === 0 ? 'No errors' : `${errorCount} error${errorCount > 1 ? 's' : ''}`, errorCount > 0 && (_jsx("span", { style: { marginLeft: 16 }, children: errors.map((err) => (_jsx("span", { style: { color: '#f00', marginRight: 8 }, title: err.message, children: err.message }, err.edgeId))) }))] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }, children: [encryptionState && (_jsxs(_Fragment, { children: [_jsx(EncryptionStatusIcon, { encryptionState: encryptionState, onClick: () => setShowEncryptionDetails(!showEncryptionDetails) }), showEncryptionDetails && (_jsx("div", { ref: encryptionDetailsRef, style: {
                                position: 'absolute',
                                bottom: '100%',
                                right: '50%',
                                marginBottom: 8,
                                zIndex: 1000
                            }, children: _jsx(EncryptionDetails, { encryptionState: encryptionState, onEncrypt: onEncrypt, onDecrypt: onDecrypt, onChangeAlgorithm: onChangeAlgorithm }) }))] })), connectionState && (_jsxs(_Fragment, { children: [_jsx(WebSocketStatusIcon, { connectionState: connectionState, onClick: () => setShowWebSocketDetails(!showWebSocketDetails) }), showWebSocketDetails && (_jsx("div", { ref: wsDetailsRef, style: {
                                position: 'absolute',
                                bottom: '100%',
                                right: 0,
                                marginBottom: 8,
                                zIndex: 1000
                            }, children: _jsx(WebSocketDetails, { connectionState: connectionState, queuedMessages: queuedMessages, onClearQueue: onClearQueue, onReconnect: onReconnect, onDisconnect: onDisconnect }) }))] }))] })] }));
;
