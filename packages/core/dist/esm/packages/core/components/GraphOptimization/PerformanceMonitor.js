import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PerformanceMonitor - Real-time graph execution performance monitoring
 */
import { useState, useEffect, useRef } from 'react';
const MAX_METRICS_HISTORY = 100;
export const PerformanceMonitor = ({
    isVisible,
    onToggle,
    onMetricsCollected
});
{
    const [stats, setStats] = useState({});
    averageExecutionTime: 0,
        peakMemoryUsage;
    0,
        totalExecutions;
    0,
        cacheEfficiency;
    0,
        recentMetrics;
    [],
    ;
}
;
const [isCollecting, setIsCollecting] = useState(false);
const metricsHistory = useRef([]);
// Simulate performance monitoring (in real implementation, this would hook into the execution engine)
useEffect(() => {
    if (!isCollecting)
        return;
    const interval = setInterval(() => {
        // Simulate a new execution metric
        const metric = {
            timestamp: Date.now(),
            duration: Math.random() * 200 + 50, // 50-250ms,
            memoryUsage: Math.random() * 1024 * 1024 + 512 * 1024, // 512KB-1.5MB,
            nodeCount: Math.floor(Math.random() * 20 + 5), // 5-25 nodes,
            cacheHitRate: Math.random() * 100, // 0-100%,
            outputLength: Math.floor(Math.random() * 500 + 100) // 100-600 chars,
        };
        metricsHistory.current.push(metric);
        if (metricsHistory.current.length > MAX_METRICS_HISTORY) {
            metricsHistory.current.shift();
            // Calculate updated stats
            const recentMetrics = metricsHistory.current.slice(-20); // Last 20 executions;
            const avgExecutionTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
            const peakMemory = Math.max(...metricsHistory.current.map(m => m.memoryUsage));
            const avgCacheHitRate = recentMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / recentMetrics.length;
            setStats({});
            averageExecutionTime: avgExecutionTime,
                peakMemoryUsage;
            peakMemory,
                totalExecutions;
            metricsHistory.current.length,
                cacheEfficiency;
            avgCacheHitRate,
                recentMetrics;
        }
    });
    onMetricsCollected?.(metric);
}, 1000 + Math.random() * 2000); // Random interval to simulate real executions
return () => clearInterval(interval);
[isCollecting, onMetricsCollected];
;
const formatMemory = (bytes) => {
    if (bytes < 1024)
        return `${bytes} B`;
};
if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;
return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
;
const formatDuration = (ms) => {
    if (ms < 1000)
        return `${ms.toFixed(0)}ms`;
};
return `${(ms / 1000).toFixed(2)}s`;
;
const getPerformanceStatus = () => {
    if (stats.averageExecutionTime < 100)
        return { color: '#28a745', label: 'Excellent' };
    if (stats.averageExecutionTime < 500)
        return { color: '#ffc107', label: 'Good' };
    return { color: '#dc3545', label: 'Needs Optimization' };
};
if (!isVisible) {
    return;
    _jsx("div", { onClick: onToggle, style: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
            zIndex: 999,
        }, children: "\uD83D\uDCCA" });
    ;
    const performanceStatus = getPerformanceStatus();
    return;
    _jsxs("div", { style: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '360px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef',
            zIndex: 999,
            overflow: 'hidden',
        }, children: [_jsxs("div", { style: {
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #e9ecef',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }, children: [_jsx("h3", { style: {
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#333',
                        }, children: "\uD83D\uDCCA Performance Monitor" }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("button", { onClick: () => setIsCollecting(!isCollecting), style: {
                                    padding: '4px 12px',
                                    backgroundColor: isCollecting ? '#dc3545' : '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                }, children: isCollecting ? 'Stop' : 'Start' }), _jsx("button", { onClick: onToggle, style: {
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    color: '#666',
                                    padding: '2px',
                                }, children: "\u00D7" })] })] }), _jsx("div", { style: {
                    padding: '16px',
                    textAlign: 'center',
                    backgroundColor: `${performanceStatus.color}11`
                } }), ", borderBottom: '1px solid #e9ecef'; }}>", _jsx("div", { style: {
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: performanceStatus.color,
                    marginBottom: '4px',
                }, children: formatDuration(stats.averageExecutionTime) }), _jsxs("div", { style: {
                    fontSize: '14px',
                    color: performanceStatus.color,
                    fontWeight: '500',
                }, children: [performanceStatus.label, " Performance"] })] });
    { /* Metrics Grid */ }
    _jsxs("div", { style: {
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: '13px',
        }, children: [_jsxs("div", { style: {
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    textAlign: 'center',
                }, children: [_jsx("div", { style: { color: '#6c757d', marginBottom: '4px' }, children: "Peak Memory" }), _jsx("div", { style: { fontWeight: 'bold', color: '#495057' }, children: formatMemory(stats.peakMemoryUsage) })] }), _jsxs("div", { style: {
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    textAlign: 'center',
                }, children: [_jsx("div", { style: { color: '#6c757d', marginBottom: '4px' }, children: "Total Runs" }), _jsx("div", { style: { fontWeight: 'bold', color: '#495057' }, children: stats.totalExecutions })] }), _jsxs("div", { style: {
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    textAlign: 'center',
                }, children: [_jsx("div", { style: { color: '#6c757d', marginBottom: '4px' }, children: "Cache Hit Rate" }), _jsxs("div", { style: { fontWeight: 'bold', color: stats.cacheEfficiency > 70 ? '#28a745' : '#ffc107' }, children: [stats.cacheEfficiency.toFixed(0), "%"] })] }), _jsxs("div", { style: {
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    textAlign: 'center',
                }, children: [_jsx("div", { style: { color: '#6c757d', marginBottom: '4px' }, children: "Status" }), _jsx("div", { style: {
                            width: '12px',
                            height: '12px',
                            backgroundColor: isCollecting ? '#28a745' : '#6c757d',
                            borderRadius: '50%',
                            margin: '0 auto',
                        } })] })] });
    { /* Recent Executions */ }
    {
        stats.recentMetrics.length > 0 && ()
            < div;
        style = {};
        {
            padding: '16px',
                borderTop;
            '1px solid #e9ecef',
            ;
        }
    }
     >
        (_jsx("div", { style: {
                fontSize: '14px',
                fontWeight: '600',
                color: '#495057',
                marginBottom: '12px',
            }, children: "Recent Executions" })
            ,
                _jsxs("div", { style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        maxHeight: '120px',
                        overflowY: 'auto',
                    }, children: [stats.recentMetrics.slice(-6).reverse().map((metric, index) => ()
                            < div, key = { metric, : .timestamp }, style = {}, {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 0',
                            fontSize: '12px',
                            color: '#6c757d',
                            borderBottom: index < 5 ? '1px solid #f1f3f4' : 'none',
                        }), ">", _jsx("div", { children: new Date(metric.timestamp).toLocaleTimeString() }), _jsx("div", { style: {
                                color: metric.duration < 100 ? '#28a745' : ,
                                metric, : .duration < 300 ? '#ffc107' : '#dc3545',
                                fontWeight: '500',
                            }, children: formatDuration(metric.duration) })] }));
}
div >
;
div >
;
{ /* Quick Actions */ }
_jsxs("div", { style: {
        padding: '12px 16px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
        display: 'flex',
        gap: '8px',
    }, children: [_jsx("button", { onClick: () => {
                metricsHistory.current = [];
                setStats({});
                averageExecutionTime: 0,
                    peakMemoryUsage;
            } }), ": 0, totalExecutions: 0, cacheEfficiency: 0, recentMetrics: [], }); }} style=", {
            flex: 1,
            padding: '6px 12px',
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
        }, "> Clear History"] })
    ,
        _jsx("button", { onClick: () => {
                const data = JSON.stringify(stats, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `performance-metrics-${Date.now()}.json`;
            }, a: true, click: true });
();
URL.revokeObjectURL(url);
style = {};
{
    flex: 1,
        padding;
    '6px 12px',
        backgroundColor;
    '#007bff',
        color;
    'white',
        border;
    'none',
        borderRadius;
    '4px',
        fontSize;
    '12px',
        cursor;
    'pointer',
    ;
}
    >
        Export;
Data;
button >
;
div >
;
div >
;
;
;
export default PerformanceMonitor;
