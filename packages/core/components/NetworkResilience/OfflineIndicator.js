import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { ConnectionState } from '../../network-resilience/ConnectionStateManager';
export const OfflineIndicator = ({ status, position = 'top', showQueueInfo = true, showActions = true, onRetryConnection, onViewQueue, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [canDismiss, setCanDismiss] = useState(false);
    useEffect(() => {
        const shouldShow = !status.isOnline || status.queueSize > 0;
        setIsVisible(shouldShow);
        // Allow dismissing after 5 seconds if connected but has queue
        if (status.isOnline && status.queueSize > 0) {
            const timer = setTimeout(() => setCanDismiss(true), 5000);
            return () => clearTimeout(timer);
        }
        else {
            setCanDismiss(false);
        }
    }, [status.isOnline, status.queueSize]);
    const getIndicatorMessage = () => {
        if (!status.isOnline) {
            switch (status.connectionState) {
                case ConnectionState.OFFLINE:
                    return 'You are offline. Changes will be saved locally and synced when connection is restored.';
                case ConnectionState.DISCONNECTED:
                    return 'Connection lost. Attempting to reconnect...';
                case ConnectionState.FAILED:
                    return 'Connection failed. Check your network and try again.';
                default:
                    return 'Not connected. Working in offline mode.';
            }
        }
        else if (status.queueSize > 0) {
            return `Syncing ${status.queueSize} pending change${status.queueSize === 1 ? '' : 's'}...`;
        }
        return '';
    };
    const getIndicatorType = () => {
        if (!status.isOnline) {
            return status.connectionState === ConnectionState.FAILED ? 'error' : 'warning';
        }
        else if (status.queueSize > 0) {
            return 'info';
        }
        return 'info';
    };
    const getIndicatorColor = () => {
        const type = getIndicatorType();
        switch (type) {
            case 'error':
                return {
                    background: '#fef2f2',
                    border: '#fecaca',
                    text: '#dc2626',
                    button: '#dc2626'
                };
            case 'warning':
                return {
                    background: '#fffbeb',
                    border: '#fed7aa',
                    text: '#d97706',
                    button: '#d97706'
                };
            case 'info':
                return {
                    background: '#eff6ff',
                    border: '#bfdbfe',
                    text: '#2563eb',
                    button: '#2563eb'
                };
            default:
                return {
                    background: '#f8fafc',
                    border: '#e2e8f0',
                    text: '#475569',
                    button: '#475569'
                };
        }
    };
    const handleDismiss = () => {
        if (canDismiss) {
            setIsVisible(false);
        }
    };
    if (!isVisible) {
        return null;
    }
    const colors = getIndicatorColor();
    const message = getIndicatorMessage();
    return (_jsx("div", { className: `offline-indicator ${position} ${className}`, style: {
            position: 'fixed',
            left: 0,
            right: 0,
            top: position === 'top' ? 0 : undefined,
            bottom: position === 'bottom' ? 0 : undefined,
            backgroundColor: colors.background,
            borderBottom: position === 'top' ? `2px solid ${colors.border}` : undefined,
            borderTop: position === 'bottom' ? `2px solid ${colors.border}` : undefined,
            color: colors.text,
            padding: '12px 16px',
            zIndex: 1000,
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }, children: _jsxs("div", { className: "flex items-center justify-between max-w-6xl mx-auto", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-lg", children: !status.isOnline ? '📴' : status.queueSize > 0 ? '⏳' : 'ℹ️' }), _jsx("span", { children: message })] }), showQueueInfo && status.queueSize > 0 && (_jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { children: "Pending:" }), _jsx("span", { className: "font-bold", children: status.queueSize })] }), status.metrics.syncedOperations > 0 && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { children: "Synced:" }), _jsx("span", { className: "font-bold", children: status.metrics.syncedOperations })] }))] }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [showActions && (_jsxs(_Fragment, { children: [!status.isOnline && onRetryConnection && (_jsx("button", { onClick: onRetryConnection, className: "px-3 py-1 text-sm font-medium rounded transition-colors", style: {
                                        backgroundColor: 'transparent',
                                        border: `1px solid ${colors.button}`,
                                        color: colors.button
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.backgroundColor = colors.button;
                                        e.currentTarget.style.color = 'white';
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = colors.button;
                                    }, children: "Retry Connection" })), status.queueSize > 0 && onViewQueue && (_jsx("button", { onClick: onViewQueue, className: "px-3 py-1 text-sm font-medium rounded transition-colors", style: {
                                        backgroundColor: 'transparent',
                                        border: `1px solid ${colors.button}`,
                                        color: colors.button
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.backgroundColor = colors.button;
                                        e.currentTarget.style.color = 'white';
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = colors.button;
                                    }, children: "View Queue" }))] })), canDismiss && (_jsx("button", { onClick: handleDismiss, className: "ml-2 text-lg opacity-60 hover:opacity-100 transition-opacity", title: "Dismiss", children: "\u2715" }))] })] }) }));
};
