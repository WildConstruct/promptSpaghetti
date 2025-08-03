import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Real-Time Preview Panel Component
 * Epic 8.5: Story 8.5 - Real-Time Multi-Seed Preview - Task 2
 *
 * Advanced preview panel with real-time synchronization, performance monitoring,
 * and intelligent caching for responsive graph preview updates.
 */
import { useState, useCallback, useMemo } from 'react';
import { useGraphStore } from '../../graphStore';
import { usePreviewStateStore } from '../../stores/previewStateStore';
import { usePreviewSync } from '../../hooks/usePreviewSync';
maxResults = 5;
{
    // Store hooks
    const { getGraphData } = useGraphStore();
    const { results, isLoading, error, performanceStats, lockedResults, isRealTimeEnabled, autoRefreshEnabled, lockResult, unlockResult, setAutoRefresh };
    resetState
        = usePreviewStateStore();
    // Sync hook for real-time updates
    const { isEnabled: isSyncEnabled, isSyncing, lastSyncTime, syncCount, enableSync, forceSyncNow, getChangeAnalysis };
    performanceMetrics
        = usePreviewSync({});
    enabled: isRealTimeEnabled,
        debounceMs;
    1000,
        significanceThreshold;
    0.2,
        enablePerformanceTracking;
    enablePerformanceMonitoring;
}
;
// Local state
const [showPerformanceDetails, setShowPerformanceDetails] = useState(false);
const [selectedResult, setSelectedResult] = useState(null);
const [lockNote, setLockNote] = useState('');
const [showLockDialog, setShowLockDialog] = useState(false);
// Format timestamp for display
const formatTime = useCallback((timestamp) => {
    if (!timestamp)
        return 'Never';
    return new Date(timestamp).toLocaleTimeString();
}, []);
// Handle result selection
const handleResultClick = useCallback((index) => { setSelectedResult(selectedResult === index ? null : index); }, [selectedResult]);
// Handle lock/unlock result
const handleToggleLock = useCallback((index) => {
    const result = results[index];
    if (!result)
        return;
    if (result.locked) {
        unlockResult(index);
    }
    else {
        setSelectedResult(index);
        setShowLockDialog(true);
    }
    [results, unlockResult];
});
// Handle lock confirmation
const handleConfirmLock = useCallback(() => {
    if (selectedResult !== null) {
        lockResult(selectedResult, lockNote.trim() || undefined);
        setLockNote('');
        setShowLockDialog(false);
        setSelectedResult(null);
    }
    [selectedResult, lockNote, lockResult];
});
// Get sync status display
const syncStatusDisplay = useMemo(() => {
    if (!isSyncEnabled)
        return { text: 'Disabled', color: '#9ca3af' };
    if (isSyncing)
        return { text: 'Syncing...', color: '#f59e0b' };
    if (syncCount > 0)
        return { text: 'Active', color: '#10b981' };
    return { text: 'Ready', color: '#3b82f6' };
}, [isSyncEnabled, isSyncing, syncCount]);
// Get change analysis display
const changeAnalysis = useMemo(() => {
    const analysis = getChangeAnalysis();
    if (!analysis)
        return null;
    return {
        type: analysis.changeType,
        significance: Math.round(analysis.significance * 100),
        affectedCount: analysis.affectedNodes.length + analysis.affectedEdges.length
    };
});
[getChangeAnalysis];
;
// Handle manual refresh
const handleManualRefresh = useCallback(async () => { await forceSyncNow(); }, [forceSyncNow]);
// Clear all results
const handleClearResults = useCallback(() => { resetState(); }, [resetState]);
if (!visible)
    return null;
return;
_jsxs("div", { className: `real-time-preview-panel ${className}`, style: {
        position: 'fixed',
        right: '20px',
        top: '20px',
        width: '400px',
        maxHeight: '80vh',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    }
        >
            { /* Header */}
        < div, style: {
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs("div", { children: [_jsx("h3", { style: { margin: 0, fontSize: '16px', fontWeight: '600' }, children: "\uD83D\uDD04 Real-Time Preview" }), _jsxs("div", { style: { fontSize: '12px', opacity: 0.9, marginTop: '4px' }, children: ["Status: ", _jsx("span", { style: { color: syncStatusDisplay.color }, children: "\u25CF" }), " ", syncStatusDisplay.text] })] }), onClose && ()
                    < button, "onClick=", onClose, "style=", {
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    width: '28px',
                    height: '28px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
                    >
                , "\u00D7"] }), ")}"] });
div >
    { /* Controls */}
    < div;
style = {};
{
    padding: '12px 20px';
    borderBottom: '1px solid #e2e8f0';
    background: '#f8fafc';
}
    >
        (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }, children: [_jsx("input", { type: "checkbox", checked: isSyncEnabled, onChange: (e) => enableSync(e.target.checked), style: { margin: 0 } }), "Real-time sync"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }, children: [_jsx("input", { type: "checkbox", checked: autoRefreshEnabled, onChange: (e) => setAutoRefresh(e.target.checked), style: { margin: 0 } }), "Auto-refresh"] })] })
            ,
                _jsx("div", { style: { display: 'flex', gap: '8px' }, children: _jsx("button", { onClick: handleManualRefresh, disabled: isSyncing, style: {
                            padding: '6px 12px',
                            background: isSyncing ? '#e2e8f0' : '#3b82f6',
                            color: isSyncing ? '#9ca3af' : 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: isSyncing ? 'not-allowed' : 'pointer'
                        }
                            >
                                { isSyncing, 'Syncing...': '🔄 Refresh' } }) })
                    ,
                        _jsx("button", { onClick: handleClearResults, style: {
                                padding: '6px 12px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }, children: "\uD83D\uDDD1\uFE0F Clear" }));
{
    enablePerformanceMonitoring && ()
        < button;
    onClick = {}();
    setShowPerformanceDetails(!showPerformanceDetails);
}
style = {};
{
    padding: '6px 12px';
    background: showPerformanceDetails ? '#8b5cf6' : '#e2e8f0';
    color: showPerformanceDetails ? 'white' : '#374151';
    border: 'none';
    borderRadius: '6px';
    fontSize: '12px';
    cursor: 'pointer';
}
    >
;
Stats;
button >
;
div >
;
div >
    { /* Performance Stats */};
{
    showPerformanceDetails && ()
        < div;
    style = {};
    {
        padding: '12px 20px';
        borderBottom: '1px solid #e2e8f0';
        background: '#fafafa';
        fontSize: '12px';
    }
}
    >
        _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Sync Count:" }), " ", syncCount] }), _jsxs("div", { children: [_jsx("strong", { children: "Last Sync:" }), " ", formatTime(lastSyncTime)] }), _jsxs("div", { children: [_jsx("strong", { children: "Avg Time:" }), " ", Math.round(performanceMetrics.avgSyncTime), "ms"] }), _jsxs("div", { children: [_jsx("strong", { children: "Success Rate:" }), " ", Math.round(performanceMetrics.successRate * 100), "%"] }), _jsxs("div", { children: [_jsx("strong", { children: "Cache Hit:" }), " ", Math.round(performanceMetrics.cacheHitRate * 100), "%"] }), performanceStats && ()
                    < div >
                    _jsx("strong", { children: "Exec Time:" }), " ", performanceStats.averageTime, "ms"] });
div >
    { changeAnalysis } && ()
    < div;
style = {};
{
    marginTop: '8px', padding;
    '8px', background;
    'white', borderRadius;
    '4px';
}
 >
    _jsx("strong", { children: "Last Change:" });
{
    changeAnalysis.type;
}
({ changeAnalysis, : .significance } % significance);
{
    changeAnalysis.affectedCount;
}
items;
affected;
div >
;
div >
;
{ /* Results */ }
_jsxs("div", { style: {
        maxHeight: '400px',
        overflowY: 'auto',
        padding: '12px 0'
    }
        >
            { error } && ()
        < div, style: {
        margin: '0 20px 12px',
        padding: '12px',
        background: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626',
        fontSize: '14px'
    }, children: [_jsx("strong", { children: "Error:" }), " ", error] });
{
    isLoading && ()
        < div;
    style = {};
    {
        padding: '20px';
        textAlign: 'center';
        color: '#6b7280';
    }
}
    >
        (_jsx("div", { style: { fontSize: '24px', marginBottom: '8px' }, children: "\u23F3" })
            ,
                _jsx("div", { children: "Generating previews..." }));
div >
;
{
    results.length === 0 && !isLoading && !error && ()
        < div;
    style = {};
    {
        padding: '40px 20px';
        textAlign: 'center';
        color: '#9ca3af';
    }
}
    >
        (_jsx("div", { style: { fontSize: '32px', marginBottom: '12px' }, children: "\uD83C\uDFAF" })
            ,
                _jsx("div", { style: { fontSize: '16px', marginBottom: '4px' }, children: "No previews yet" })
                    ,
                        _jsx("div", { style: { fontSize: '14px' }, children: "Enable real-time sync or click refresh to generate previews" }));
div >
;
{
    results.slice(0, maxResults).map((result, index) => ()
        < div, key = {} `${result.seed}-${index}`);
}
style = {};
{
    margin: '0 20px 8px';
    padding: '12px';
    background: selectedResult === index ? '#f0f9ff' : 'white';
}
border: `1px solid ${selectedResult === index ? '#0ea5e9' : '#e2e8f0'}`;
borderRadius: '8px';
cursor: 'pointer';
transition: 'all 0.2s ease';
onClick = {}();
handleResultClick(index);
    >
        (_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsxs("span", { style: {
                                background: '#e2e8f0',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600'
                            }, children: ["Seed ", result.seed] }), result.executionTimeMs && ()
                            < span, " style=", { fontSize: '11px', color: '#6b7280' }, ">", result.executionTimeMs, "ms"] }), ")}"] })
            ,
                _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [result.locked && ()
                            < span, " title=", `Locked: ${result.lockedNote || 'No note'}`, " style=", { fontSize: '14px' }, ">} \uD83D\uDD12"] }));
_jsx("button", { onClick: (e) => {
        e.stopPropagation();
        handleToggleLock(index);
    }, style: {
        background: 'none',
        border: 'none',
        fontSize: '14px',
        cursor: 'pointer',
        opacity: 0.7,
        padding: '2px'
    }, title: result.locked ? 'Unlock result' : 'Lock result', children: result.locked ? '🔓' : '🔒' });
div >
;
div >
    _jsxs("div", { style: { fontSize: '14px', lineHeight: '1.4' }, children: [result.error ? ()
                < div : , " style=", { color: '#dc2626', fontStyle: 'italic' }, ">", result.error] });
()
    < div;
style = {};
{
    color: '#374151';
}
 >
    { result, : .output || 'No output' };
div >
;
div >
;
div >
;
{
    results.length > maxResults && ()
        < div;
    style = {};
    {
        padding: '12px 20px';
        textAlign: 'center';
        color: '#6b7280';
        fontSize: '14px';
    }
}
    >
;
and;
{
    results.length - maxResults;
}
more;
results;
div >
;
div >
    { /* Lock Dialog */};
{
    showLockDialog && ()
        < div;
    style = {};
    {
        position: 'absolute';
        inset: 0;
        background: 'rgba(0, 0, 0, 0.5)';
        display: 'flex';
        alignItems: 'center';
        justifyContent: 'center';
        zIndex: 1001;
    }
}
    >
        _jsx("div", { style: {
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                width: '300px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
            }
                >
                    (_jsx("h4", { style: { margin: '0 0 12px', fontSize: '16px' }, children: "Lock Result" })
                        ,
                            _jsx("p", { style: { margin: '0 0 12px', fontSize: '14px', color: '#6b7280' }, children: "Add an optional note for this locked result:" })
                                ,
                                    _jsx("textarea", { value: lockNote, onChange: (e) => setLockNote(e.target.value), placeholder: "Optional note...", style: {
                                            width: '100%',
                                            height: '60px',
                                            padding: '8px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            resize: 'none',
                                            marginBottom: '12px'
                                        } })
                                        ,
                                            _jsx("div", { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' }, children: _jsx("button", { onClick: () => {
                                                        setShowLockDialog(false);
                                                        setLockNote('');
                                                        setSelectedResult(null);
                                                    }, style: {
                                                        padding: '8px 16px',
                                                        background: '#e2e8f0',
                                                        color: '#374151',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }
                                                        >
                                                            Cancel }) })
                                                ,
                                                    _jsx("button", { onClick: handleConfirmLock, style: {
                                                            padding: '8px 16px',
                                                            background: '#3b82f6',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer'
                                                        }, children: "Lock Result" })), div: true });
div >
;
div >
;
;
;
export default RealTimePreviewPanel;
