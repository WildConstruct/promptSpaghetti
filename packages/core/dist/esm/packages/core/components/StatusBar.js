import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { WebSocketStatusIcon, WebSocketDetails } from './WebSocketStatus';
import { EncryptionStatusIcon, EncryptionDetails } from './EncryptionStatus';
import { RecentProjectsMenu } from './RecentProjects/RecentProjectsMenu';
const wsDetailsRef = useRef(null);
const encryptionDetailsRef = useRef(null);
const errorCount = errors.length;
// Close details when clicking outside
useEffect(() => {
    const handleClickOutside = (event) => {
        if (wsDetailsRef.current && !wsDetailsRef.current.contains(event.target)) {
            setShowWebSocketDetails(false);
            if (encryptionDetailsRef.current && !encryptionDetailsRef.current.contains(event.target)) {
                setShowEncryptionDetails(false);
            }
        }
    };
    if (showWebSocketDetails || showEncryptionDetails) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    [showWebSocketDetails, showEncryptionDetails];
});
return;
_jsxs("div", { style: {
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
        justifyContent: 'space-between',
    }, children: [_jsxs("div", { "aria-live": "polite", children: [statusMessage && _jsx("span", { style: { marginRight: 16 }, children: statusMessage }), currentProjectName && ()
                    < span, " style=", {
                    marginRight: 16,
                    padding: '4px 8px',
                    background: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: 3,
                    fontSize: '13px',
                    color: '#495057',
                }, "> \uD83D\uDCC1 ", currentProjectName, hasUnsavedChanges ? ' •' : ''] }), ")}", _jsx("button", { onClick: onPreview, style: {
                marginRight: 16,
                padding: '6px 16px',
                background: '#eee',
                color: '#23272f',
                border: '1px solid #ccc',
                borderRadius: 4,
                fontWeight: 500,
                cursor: 'pointer',
            }, children: "Preview" }), onNewProject && ()
            < button, "onClick=", onNewProject, "title=\"Create a new project\" style=", {
            marginRight: 16,
            padding: '6px 16px',
            background: '#eee',
            color: '#23272f',
            border: '1px solid #ccc',
            borderRadius: 4,
            fontWeight: 500,
            cursor: 'pointer',
        }, "> \uD83D\uDCC4 New"] });
{
    onSaveProject && ()
        < button;
    onClick = { onSaveProject };
    title = "Save project as .psg file";
    style = {};
    {
        marginRight: 16,
            padding;
        '6px 16px',
            background;
        hasUnsavedChanges ? '#4CAF50' : '#eee',
            color;
        hasUnsavedChanges ? 'white' : '#23272f',
            border;
        hasUnsavedChanges ? '1px solid #45a049' : '1px solid #ccc',
            borderRadius;
        4,
            fontWeight;
        500,
            cursor;
        'pointer',
        ;
    }
}
    >
;
Save;
Project;
{
    hasUnsavedChanges ? ' *' : '';
}
button >
;
{
    onLoadProject && ()
        < div;
    style = {};
    {
        display: 'inline-flex', marginRight;
        16;
    }
}
 >
    _jsx("button", { onClick: onLoadProject, title: "Load project from .psg file", style: {
            padding: '6px 16px',
            background: '#eee',
            color: '#23272f',
            border: '1px solid #ccc',
            borderRadius: '4px 0 0 4px',
            fontWeight: 500,
            cursor: 'pointer',
        }, children: "\uD83D\uDCC2 Load Project" });
{
    onLoadRecentProject && ()
        < RecentProjectsMenu;
    onLoadRecentProject = { onLoadRecentProject } /  >
    ;
}
div >
;
_jsx("button", { onClick: onSaveJson, style: {
        marginRight: 16,
        padding: '6px 16px',
        background: '#eee',
        color: '#23272f',
        border: '1px solid #ccc',
        borderRadius: 4,
        fontWeight: 500,
        cursor: 'pointer',
    }, children: "\uD83D\uDCCB Share Template" });
{
    onExportBundle && ()
        < button;
    onClick = { onExportBundle };
    title = "Export for use in production pipeline";
    style = {};
    {
        marginRight: 16,
            padding;
        '6px 16px',
            background;
        '#4CAF50',
            color;
        'white',
            border;
        '1px solid #45a049',
            borderRadius;
        4,
            fontWeight;
        500,
            cursor;
        'pointer',
        ;
    }
}
    >
;
Export;
for (Pipeline; ; )
    ;
button >
;
{ /* Template Buttons */ }
{
    onSaveTemplate && ()
        < button;
    onClick = { onSaveTemplate };
    title = "Save current workflow as reusable template";
    style = {};
    {
        marginRight: 16,
            padding;
        '6px 16px',
            background;
        '#8b5cf6',
            color;
        'white',
            border;
        '1px solid #7c3aed',
            borderRadius;
        4,
            fontWeight;
        500,
            cursor;
        'pointer',
        ;
    }
}
    >
;
Save;
Template;
button >
;
{
    onBrowseTemplates && ()
        < button;
    onClick = { onBrowseTemplates };
    title = "Browse and apply workflow templates";
    style = {};
    {
        marginRight: 16,
            padding;
        '6px 16px',
            background;
        '#06b6d4',
            color;
        'white',
            border;
        '1px solid #0891b2',
            borderRadius;
        4,
            fontWeight;
        500,
            cursor;
        'pointer',
        ;
    }
}
    >
;
Templates;
button >
;
{
    correctionsEnabled && onCorrections && ()
        < button;
    onClick = { onCorrections };
    style = {};
    {
        marginRight: 16,
            padding;
        '6px 16px',
            background;
        correctionsOpen ? '#4a5568' : '#eee',
            color;
        correctionsOpen ? '#fff' : '#23272f',
            border;
        '1px solid #ccc',
            borderRadius;
        4,
            fontWeight;
        500,
            cursor;
        'pointer',
        ;
    }
}
    >
        Corrections;
button >
;
{
    correctionsEnabled && onStats && ()
        < button;
    onClick = { onStats };
    style = {};
    {
        marginRight: 16,
            padding;
        '6px 16px',
            background;
        statsOpen ? '#4a5568' : '#eee',
            color;
        statsOpen ? '#fff' : '#23272f',
            border;
        '1px solid #ccc',
            borderRadius;
        4,
            fontWeight;
        500,
            cursor;
        'pointer',
        ;
    }
}
    >
;
Stats;
button >
;
{
    onExtensions && ()
        < button;
    onClick = { onExtensions };
    style = {};
    {
        marginRight: 16,
            padding;
        '6px 16px',
            background;
        extensionsOpen ? '#4a5568' : '#eee',
            color;
        extensionsOpen ? '#fff' : '#23272f',
            border;
        '1px solid #ccc',
            borderRadius;
        4,
            fontWeight;
        500,
            cursor;
        'pointer',
        ;
    }
}
    >
;
Extensions;
button >
;
{
    onOptimization && ()
        < button;
    data - optimization - button;
    onClick = { onOptimization };
    title = "Open workflow optimization and performance tools";
    style = {};
    {
        marginRight: 16,
            padding;
        '6px 16px',
            background;
        optimizationEnabled ? '#17a2b8' : '#eee',
            color;
        optimizationEnabled ? 'white' : '#23272f',
            border;
        optimizationEnabled ? '1px solid #138496' : '1px solid #ccc',
            borderRadius;
        4,
            fontWeight;
        500,
            cursor;
        'pointer',
        ;
    }
}
    >
;
Optimize;
button >
;
{
    errorCount === 0 ? 'No errors' : `${errorCount} error${errorCount > 1 ? 's' : ''}`;
}
{
    errorCount > 0 && ()
        < span;
    style = {};
    {
        marginLeft: 16;
    }
}
 >
    { errors, : .map((err) => ()
            < span, key = { err, : .edgeId }, style = {}, { color: '#f00', marginRight: 8 }) };
title = { err, : .message }
    >
        { err, : .message };
span >
;
span >
;
div >
    { /* Right side - Status indicators */}
    < div;
style = {};
{
    display: 'flex', alignItems;
    'center', gap;
    '12px', position;
    'relative';
}
 >
    { /* Encryption status */};
{
    encryptionState && ()
        <  >
        _jsx(EncryptionStatusIcon, { encryptionState: encryptionState, onClick: () => setShowEncryptionDetails(!showEncryptionDetails) });
    {
        showEncryptionDetails && ()
            < div;
        ref = { encryptionDetailsRef };
        style = {};
        {
            position: 'absolute',
                bottom;
            '100%',
                right;
            '50%',
                marginBottom;
            8,
                zIndex;
            1000,
            ;
        }
    }
        >
            _jsx(EncryptionDetails, { encryptionState: encryptionState, onEncrypt: onEncrypt, onDecrypt: onDecrypt, onChangeAlgorithm: onChangeAlgorithm });
    div >
    ;
}
 >
;
{ /* WebSocket status */ }
{
    connectionState && ()
        <  >
        _jsx(WebSocketStatusIcon, { connectionState: connectionState, onClick: () => setShowWebSocketDetails(!showWebSocketDetails) });
    {
        showWebSocketDetails && ()
            < div;
        ref = { wsDetailsRef };
        style = {};
        {
            position: 'absolute',
                bottom;
            '100%',
                right;
            0,
                marginBottom;
            8,
                zIndex;
            1000,
            ;
        }
    }
        >
            _jsx(WebSocketDetails, { connectionState: connectionState, queuedMessages: queuedMessages, onClearQueue: onClearQueue, onReconnect: onReconnect, onDisconnect: onDisconnect });
    div >
    ;
}
 >
;
div >
;
div >
;
;
;
