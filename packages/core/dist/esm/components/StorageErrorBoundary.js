import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { clearPersistedState, getPersistedStateInfo, checkStorageQuota } from '../utils/persistenceUtils';
export function StorageErrorBoundary({ children }) {
    const [errorState, setErrorState] = useState({
        hasError: false,
        errorType: null,
        errorMessage: '',
        storageInfo: null,
        quotaInfo: { used: 0, available: true, percentage: 0 }
    });
    useEffect(() => {
        // Listen for storage quota exceeded events
        const handleQuotaExceeded = (event) => {
            setErrorState({
                hasError: true,
                errorType: 'quota',
                errorMessage: 'Storage quota exceeded. Your work cannot be auto-saved.',
                storageInfo: getPersistedStateInfo(),
                quotaInfo: checkStorageQuota()
            });
        };
        // Listen for corruption events
        const handleCorruption = (event) => {
            setErrorState({
                hasError: true,
                errorType: 'corruption',
                errorMessage: 'Saved data appears to be corrupted.',
                storageInfo: getPersistedStateInfo(),
                quotaInfo: checkStorageQuota()
            });
        };
        window.addEventListener('storage-quota-exceeded', handleQuotaExceeded);
        window.addEventListener('storage-corruption', handleCorruption);
        return () => {
            window.removeEventListener('storage-quota-exceeded', handleQuotaExceeded);
            window.removeEventListener('storage-corruption', handleCorruption);
        };
    }, []);
    const handleClearStorage = () => {
        clearPersistedState();
        setErrorState({
            hasError: false,
            errorType: null,
            errorMessage: '',
            storageInfo: null,
            quotaInfo: { used: 0, available: true, percentage: 0 }
        });
        // Reload to get fresh state
        window.location.reload();
    };
    const handleDismiss = () => {
        setErrorState(prev => ({ ...prev, hasError: false }));
    };
    if (!errorState.hasError) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsxs(_Fragment, { children: [children, _jsxs("div", { role: "alert", "aria-live": "assertive", style: {
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    maxWidth: 400,
                    background: '#fff',
                    border: '1px solid #d73a49',
                    borderRadius: 8,
                    padding: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 9999
                }, children: [_jsx("div", { style: { marginBottom: 12 }, children: _jsx("strong", { style: { color: '#d73a49' }, children: errorState.errorType === 'quota' ? '⚠️ Storage Full' : '⚠️ Storage Error' }) }), _jsx("div", { style: { marginBottom: 12, fontSize: 14, color: '#586069' }, children: errorState.errorMessage }), errorState.errorType === 'quota' && errorState.quotaInfo && (_jsxs("div", { style: { marginBottom: 12, fontSize: 12, color: '#6a737d' }, children: ["Storage used: ", Math.round(errorState.quotaInfo.percentage), "% (", (errorState.quotaInfo.used / 1024).toFixed(1), " KB)"] })), errorState.storageInfo?.exists && (_jsxs("div", { style: { marginBottom: 12, fontSize: 12, color: '#6a737d' }, children: ["Last saved: ", errorState.storageInfo.timestamp
                                ? new Date(errorState.storageInfo.timestamp).toLocaleString()
                                : 'Unknown', errorState.storageInfo.compressed && ' (compressed)'] })), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { onClick: handleClearStorage, style: {
                                    padding: '6px 12px',
                                    background: '#d73a49',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 4,
                                    fontSize: 14,
                                    cursor: 'pointer'
                                }, children: "Clear Storage" }), _jsx("button", { onClick: handleDismiss, style: {
                                    padding: '6px 12px',
                                    background: '#f6f8fa',
                                    color: '#24292e',
                                    border: '1px solid #d1d5da',
                                    borderRadius: 4,
                                    fontSize: 14,
                                    cursor: 'pointer'
                                }, children: "Dismiss" })] }), errorState.errorType === 'quota' && (_jsx("div", { style: { marginTop: 12, fontSize: 12, color: '#6a737d' }, children: "Tip: Save your work manually or clear old data to free up space." }))] })] }));
}
/**
 * Storage status indicator component
 */
export function StorageStatusIndicator() {
    const [storageInfo, setStorageInfo] = useState(null);
    const [quotaInfo, setQuotaInfo] = useState({
        used: 0,
        available: true,
        percentage: 0
    });
    useEffect(() => {
        const updateInfo = () => {
            setStorageInfo(getPersistedStateInfo());
            setQuotaInfo(checkStorageQuota());
        };
        updateInfo();
        // Update on storage events
        const handleStorage = () => updateInfo();
        window.addEventListener('storage', handleStorage);
        // Update periodically
        const interval = setInterval(updateInfo, 30000); // Every 30 seconds
        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, []);
    if (!storageInfo?.exists) {
        return null;
    }
    const isWarning = quotaInfo.percentage > 80;
    const isDanger = quotaInfo.percentage > 90;
    return (_jsxs("div", { style: {
            position: 'fixed',
            bottom: 10,
            left: 10,
            padding: '4px 8px',
            background: isDanger ? '#ffeef0' : isWarning ? '#fff8dc' : '#f0f9ff',
            border: `1px solid ${isDanger ? '#d73a49' : isWarning ? '#f0ad4e' : '#79b8ff'}`,
            borderRadius: 4,
            fontSize: 11,
            color: isDanger ? '#d73a49' : isWarning ? '#856404' : '#0366d6',
            opacity: 0.8,
            zIndex: 1000
        }, title: `Storage: ${Math.round(quotaInfo.percentage)}% used`, children: ["\uD83D\uDCBE ", storageInfo.compressed && '🗜️', " Auto-saved"] }));
}
