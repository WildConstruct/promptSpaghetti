import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * AutosaveIndicator component
 * Displays real-time save status with visual feedback
 */
import { useEffect, useState } from 'react';
import { useAutosave } from '../hooks/useAutosave';
/**
 * Format relative time (e.g., "2 minutes ago")
 */
function formatRelativeTime(date) {
    if (!date)
        return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 5)
        return 'Just now';
    if (diffSec < 60)
        return `${diffSec} seconds ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin === 1)
        return '1 minute ago';
    if (diffMin < 60)
        return `${diffMin} minutes ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour === 1)
        return '1 hour ago';
    if (diffHour < 24)
        return `${diffHour} hours ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay === 1)
        return '1 day ago';
    return `${diffDay} days ago`;
}
export function AutosaveIndicator({ position = 'top-right', showTimestamp = true, className = '' }) {
    const autosave = useAutosave();
    const [relativeTime, setRelativeTime] = useState('');
    // Update relative time display
    useEffect(() => {
        const updateRelativeTime = () => {
            setRelativeTime(formatRelativeTime(autosave.lastSaved));
        };
        updateRelativeTime();
        const interval = setInterval(updateRelativeTime, 10000); // Update every 10 seconds
        return () => clearInterval(interval);
    }, [autosave.lastSaved]);
    // Position styles
    const positionStyles = {
        'top-right': { top: 20, right: 20 },
        'top-left': { top: 20, left: 20 },
        'bottom-right': { bottom: 20, right: 20 },
        'bottom-left': { bottom: 20, left: 20 }
    };
    // Status colors and icons
    const statusConfig = {
        saved: {
            color: '#28a745',
            bgColor: '#d4edda',
            borderColor: '#c3e6cb',
            icon: '✓',
            text: 'Saved',
            showTime: true
        },
        saving: {
            color: '#ffc107',
            bgColor: '#fff3cd',
            borderColor: '#ffeeba',
            icon: '⟳',
            text: 'Saving...',
            showTime: false,
            animate: true
        },
        unsaved: {
            color: '#fd7e14',
            bgColor: '#ffe5cc',
            borderColor: '#ffd4a3',
            icon: '•',
            text: 'Unsaved changes',
            showTime: false
        },
        error: {
            color: '#dc3545',
            bgColor: '#f8d7da',
            borderColor: '#f5c6cb',
            icon: '⚠',
            text: autosave.error || 'Save failed',
            showTime: false
        }
    };
    const config = statusConfig[autosave.status];
    if (!autosave.isEnabled) {
        return null; // Don't show indicator if autosave is disabled
    }
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: `autosave-indicator ${className}`, style: {
                    position: 'fixed',
                    ...positionStyles[position],
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${config.borderColor}`,
                    backgroundColor: config.bgColor,
                    color: config.color,
                    fontSize: '13px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    zIndex: 1000,
                    transition: 'all 0.3s ease',
                    opacity: autosave.status === 'saved' && !showTimestamp ? 0.7 : 1,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }, role: "status", "aria-live": "polite", "aria-label": `Autosave status: ${config.text}`, children: [_jsx("span", { style: {
                            fontSize: '16px',
                            lineHeight: 1,
                            animation: config.animate ? 'spin 1s linear infinite' : 'none'
                        }, children: config.icon }), _jsx("span", { children: config.text }), config.showTime && showTimestamp && autosave.lastSaved && (_jsxs("span", { style: { opacity: 0.8, fontSize: '12px' }, children: ["(", relativeTime, ")"] }))] }), autosave.conflictDetected && (_jsx(ConflictDialog, { localVersion: 0, remoteVersion: autosave.remoteVersion || 0, onKeepLocal: autosave.keepLocalChanges, onAcceptRemote: autosave.acceptRemoteChanges })), _jsx("style", { children: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .autosave-indicator {
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` })] }));
}
function ConflictDialog({ localVersion, remoteVersion, onKeepLocal, onAcceptRemote }) {
    return (_jsxs("div", { style: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            padding: '24px',
            zIndex: 10000,
            maxWidth: '400px',
            width: '90%'
        }, role: "dialog", "aria-labelledby": "conflict-title", "aria-describedby": "conflict-description", children: [_jsx("h3", { id: "conflict-title", style: {
                    margin: '0 0 12px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333'
                }, children: "\u26A0\uFE0F Changes Detected in Another Tab" }), _jsx("p", { id: "conflict-description", style: {
                    margin: '0 0 20px 0',
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.5'
                }, children: "This graph has been modified in another tab or window. Choose how to resolve this conflict:" }), _jsxs("div", { style: {
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                }, children: [_jsx("button", { onClick: onAcceptRemote, style: {
                            padding: '8px 16px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            backgroundColor: '#f8f9fa',
                            color: '#333',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }, onMouseEnter: (e) => {
                            e.currentTarget.style.backgroundColor = '#e9ecef';
                        }, onMouseLeave: (e) => {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }, children: "Use Their Changes" }), _jsx("button", { onClick: onKeepLocal, style: {
                            padding: '8px 16px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#007bff',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }, onMouseEnter: (e) => {
                            e.currentTarget.style.backgroundColor = '#0056b3';
                        }, onMouseLeave: (e) => {
                            e.currentTarget.style.backgroundColor = '#007bff';
                        }, children: "Keep My Changes" })] }), _jsxs("div", { style: {
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #eee',
                    fontSize: '12px',
                    color: '#999'
                }, children: ["Version conflict: Local v", localVersion, " vs Remote v", remoteVersion] })] }));
}
