import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Storage information display component
 */
import { useEffect, useState } from 'react';
import { getStorageInfo, exportBackup, clearPersistedState } from '../../utils/stateRestoration';
import { getPersistedStateInfo } from '../../utils/persistenceUtils';
export function StorageInfo({ position = 'inline', showActions = true, onReset, className = '' }) {
    const [storageInfo, setStorageInfo] = useState(null);
    const [stateInfo, setStateInfo] = useState(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    // Update storage information
    useEffect(() => {
        const updateInfo = async () => {
            const storage = await getStorageInfo();
            setStorageInfo(storage);
            setStateInfo(getPersistedStateInfo());
        };
        updateInfo();
        // Update periodically
        const interval = setInterval(updateInfo, 30000); // Every 30 seconds
        // Listen for storage events
        const handleStorageChange = () => updateInfo();
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('state-cleared', handleStorageChange);
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('state-cleared', handleStorageChange);
        };
    }, []);
    const handleExportBackup = async () => {
        setIsExporting(true);
        try {
            exportBackup();
        }
        catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export backup. Please try again.');
        }
        finally {
            setIsExporting(false);
        }
    };
    const handleReset = () => {
        setShowResetConfirm(true);
    };
    const confirmReset = async () => {
        // Export backup first
        try {
            exportBackup();
        }
        catch (error) {
            console.error('Backup export failed:', error);
        }
        // Clear state
        clearPersistedState();
        setShowResetConfirm(false);
        // Notify parent
        onReset?.();
        // Reload to get fresh state
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };
    const cancelReset = () => {
        setShowResetConfirm(false);
    };
    // Format last modified time
    const formatLastModified = () => {
        if (!stateInfo?.timestamp)
            return 'Never';
        const date = new Date(stateInfo.timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24)
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };
    if (!storageInfo) {
        return null;
    }
    const containerStyles = position === 'fixed' ? {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        padding: '12px 16px',
        zIndex: 1000,
        maxWidth: '300px'
    } : {
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        padding: '16px'
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: className, style: containerStyles, children: [_jsxs("h4", { style: {
                            margin: '0 0 12px 0',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#495057',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }, children: [_jsx("span", { children: "\uD83D\uDCBE" }), "Storage Information"] }), _jsxs("div", { style: { fontSize: '13px', color: '#6c757d' }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px'
                                }, children: [_jsx("span", { children: "Last saved:" }), _jsx("span", { style: { color: '#495057', fontWeight: '500' }, children: formatLastModified() })] }), _jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px'
                                }, children: [_jsx("span", { children: "Storage used:" }), _jsx("span", { style: { color: '#495057', fontWeight: '500' }, children: storageInfo.formattedUsed })] }), storageInfo.quota && (_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px'
                                }, children: [_jsx("span", { children: "Available:" }), _jsx("span", { style: { color: '#495057', fontWeight: '500' }, children: storageInfo.formattedAvailable })] })), storageInfo.quota && (_jsxs("div", { style: { marginTop: '12px' }, children: [_jsxs("div", { style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '4px',
                                            fontSize: '11px'
                                        }, children: [_jsx("span", { children: "Usage" }), _jsxs("span", { style: { fontWeight: '500' }, children: [Math.round(storageInfo.percentage), "%"] })] }), _jsx("div", { style: {
                                            height: '6px',
                                            backgroundColor: '#e9ecef',
                                            borderRadius: '3px',
                                            overflow: 'hidden'
                                        }, children: _jsx("div", { style: {
                                                height: '100%',
                                                width: `${Math.min(100, storageInfo.percentage)}%`,
                                                backgroundColor: storageInfo.percentage > 90 ? '#dc3545' :
                                                    storageInfo.percentage > 75 ? '#ffc107' : '#28a745',
                                                transition: 'width 0.3s ease'
                                            } }) })] })), stateInfo?.compressed && (_jsxs("div", { style: {
                                    marginTop: '8px',
                                    padding: '4px 8px',
                                    backgroundColor: '#e7f3ff',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    color: '#0066cc',
                                    display: 'inline-block'
                                }, children: ["\uD83D\uDDDC\uFE0F Data compressed (", stateInfo.size ?
                                        `${Math.round(stateInfo.size / 1024)} KB` : 'size unknown', ")"] }))] }), showActions && (_jsxs("div", { style: {
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid #dee2e6',
                            display: 'flex',
                            gap: '8px'
                        }, children: [_jsx("button", { onClick: handleExportBackup, disabled: isExporting || !stateInfo?.exists, style: {
                                    flex: 1,
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #007bff',
                                    backgroundColor: 'white',
                                    color: '#007bff',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: isExporting || !stateInfo?.exists ? 'not-allowed' : 'pointer',
                                    opacity: isExporting || !stateInfo?.exists ? 0.5 : 1,
                                    transition: 'all 0.2s'
                                }, onMouseEnter: (e) => {
                                    if (!isExporting && stateInfo?.exists) {
                                        e.currentTarget.style.backgroundColor = '#007bff';
                                        e.currentTarget.style.color = 'white';
                                    }
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.color = '#007bff';
                                }, children: isExporting ? 'Exporting...' : 'Export Backup' }), _jsx("button", { onClick: handleReset, style: {
                                    flex: 1,
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #dc3545',
                                    backgroundColor: 'white',
                                    color: '#dc3545',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.backgroundColor = '#dc3545';
                                    e.currentTarget.style.color = 'white';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.color = '#dc3545';
                                }, children: "Reset Storage" })] }))] }), showResetConfirm && (_jsx(ResetConfirmDialog, { onConfirm: confirmReset, onCancel: cancelReset }))] }));
}
/**
 * Reset confirmation dialog
 */
function ResetConfirmDialog({ onConfirm, onCancel }) {
    return (_jsx("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001
        }, role: "dialog", "aria-labelledby": "reset-title", "aria-describedby": "reset-description", children: _jsxs("div", { style: {
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }, children: [_jsxs("h3", { id: "reset-title", style: {
                        margin: '0 0 12px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#dc3545',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }, children: [_jsx("span", { children: "\u26A0\uFE0F" }), "Reset Storage?"] }), _jsxs("p", { id: "reset-description", style: {
                        margin: '0 0 20px 0',
                        fontSize: '14px',
                        color: '#666',
                        lineHeight: '1.5'
                    }, children: ["This will ", _jsx("strong", { children: "permanently delete" }), " all your saved work and cannot be undone. A backup will be automatically exported before resetting."] }), _jsxs("div", { style: {
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffeeba',
                        borderRadius: '4px',
                        padding: '12px',
                        marginBottom: '20px',
                        fontSize: '13px',
                        color: '#856404'
                    }, children: [_jsx("strong", { children: "Note:" }), " Your current work will be exported as a backup file before resetting. You can re-import it later if needed."] }), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' }, children: [_jsx("button", { onClick: onCancel, style: {
                                padding: '8px 16px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                backgroundColor: '#f8f9fa',
                                color: '#333',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = '#e9ecef';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }, children: "Cancel" }), _jsx("button", { onClick: onConfirm, style: {
                                padding: '8px 16px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = '#c82333';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = '#dc3545';
                            }, children: "Reset Storage" })] })] }) }));
}
