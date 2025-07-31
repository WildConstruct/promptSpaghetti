import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Performance Panel Component
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - Performance Analysis UI
 */
import { useState, useEffect } from 'react';
export const PerformancePanel = ({
    performanceProfiler,
    alerts,
    report,
    onGenerateReport
});
{
    const [activeProfiles, setActiveProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [view, setView] = useState('alerts');
    useEffect(() => {
        setActiveProfiles(performanceProfiler.getActiveProfiles());
    }, [performanceProfiler]);
    const handleStartProfile = () => {
        const name = prompt('Enter profile name:') || `Profile ${Date.now()}`;
    };
    performanceProfiler.startProfile(name);
    setActiveProfiles(performanceProfiler.getActiveProfiles());
}
;
const handleStopProfile = (profileId) => {
    performanceProfiler.stopProfile(profileId);
    setActiveProfiles(performanceProfiler.getActiveProfiles());
};
const handleClearAlerts = () => {
    performanceProfiler.clearAlerts();
};
const getAlertIcon = (level) => {
    switch (level) {
        case 'critical': return '🔴';
        case 'error': return '🟠';
        case 'warning': return '🟡';
        case 'info': return '🔵';
        default: return '⚪';
    }
    ;
    const getAlertColor = (level) => {
        switch (level) {
            case 'critical': return '#e74c3c';
            case 'error': return '#f39c12';
            case 'warning': return '#f1c40f';
            case 'info': return '#3498db';
            default: return '#95a5a6';
        }
        ;
        const formatDuration = (ms) => {
            if (ms < 1)
                return `${(ms * 1000).toFixed(0)}μs`;
        };
        if (ms < 1000)
            return `${ms.toFixed(1)}ms`;
    };
    return `${(ms / 1000).toFixed(1)}s`;
};
;
const formatBytes = (bytes) => {
    if (bytes < 1024)
        return `${bytes}B`;
};
if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)}KB`;
return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
;
return;
_jsxs("div", { className: "performance-panel", children: [_jsxs("div", { className: "performance-tabs", children: [_jsxs("button", { className: `tab ${view === 'alerts' ? 'active' : ''}`, onClick: () => setView('alerts'), children: ["Alerts ", alerts.length > 0 && _jsx("span", { className: "badge", children: alerts.length })] }), _jsx("button", { className: `tab ${view === 'profiles' ? 'active' : ''}`, onClick: () => setView('profiles'), children: "Profiles" }), _jsx("button", { className: `tab ${view === 'report' ? 'active' : ''}`, onClick: () => setView('report'), children: "Report" }), _jsx("button", { className: `tab ${view === 'live' ? 'active' : ''}`, onClick: () => setView('live'), children: "Live Metrics" })] }), view === 'alerts' && ()
            < div, " className=\"alerts-view\">", _jsxs("div", { className: "alerts-header", children: [_jsx("h4", { children: "Performance Alerts" }), _jsx("button", { className: "clear-btn", onClick: handleClearAlerts, children: "Clear All" })] }), _jsxs("div", { className: "alerts-list", children: [alerts.length === 0 ? ()
                    < div : , " className=\"empty-state\">", _jsx("span", { children: "\u2705" }), _jsx("p", { children: "No performance alerts" })] }), ") : () alerts.map(alert => ()", _jsxs("div", { className: "alert-item", style: { borderLeftColor: getAlertColor(alert.level) }, children: [_jsxs("div", { className: "alert-header", children: [_jsx("span", { className: "alert-icon", children: getAlertIcon(alert.level) }), _jsx("span", { className: "alert-message", children: alert.message }), _jsx("span", { className: "alert-time", children: new Date(alert.timestamp).toLocaleTimeString() })] }), _jsxs("div", { className: "alert-details", children: [_jsxs("div", { className: "alert-metric", children: [_jsxs("strong", { children: [alert.metric, ":"] }), " ", alert.value.toFixed(2), "(threshold: ", alert.threshold, ")"] }), _jsxs("div", { className: "alert-domain", children: [_jsx("strong", { children: "Domain:" }), " ", alert.domain] })] }), alert.suggestions.length > 0 && ()
                    < div, " className=\"alert-suggestions\">", _jsx("strong", { children: "Suggestions:" }), _jsx("ul", { children: alert.suggestions.map((suggestion, index) => ()
                        < li, key = { index } > { suggestion }) }), "))}"] }, alert.id)] });
div >
;
div >
;
div >
;
{ /* Profiles View */ }
{
    view === 'profiles' && ()
        < div;
    className = "profiles-view" >
        (_jsxs("div", { className: "profiles-header", children: [_jsx("h4", { children: "Performance Profiles" }), _jsx("button", { className: "start-btn", onClick: handleStartProfile, children: "Start Profile" })] })
            ,
                _jsxs("div", { className: "profiles-list", children: [activeProfiles.map(profile => ()
                            < div, key = { profile, : .id }, className = {} `profile-item ${selectedProfile === profile.id ? 'selected' : ''}`), "onClick=", () => setSelectedProfile(profile.id), ">", _jsxs("div", { className: "profile-header", children: [_jsx("span", { className: "profile-name", children: profile.name }), _jsxs("div", { className: "profile-actions", children: [profile.endTime === 0 && ()
                                            < button, "className=\"stop-btn\" onClick=", (e) => {
                                            e.stopPropagation();
                                            handleStopProfile(profile.id);
                                        }, "> Stop"] }), ")}"] })] })
                    ,
                        _jsxs("div", { className: "profile-stats", children: [_jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "Duration:" }), _jsx("span", { className: "stat-value", children: profile.duration > 0 ? formatDuration(profile.duration) : 'Running...' })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "Samples:" }), _jsx("span", { className: "stat-value", children: profile.samples.length })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "Avg Duration:" }), _jsx("span", { className: "stat-value", children: formatDuration(profile.summary.averageDuration) })] })] }));
    {
        profile.analysis.bottlenecks.length > 0 && ()
            < div;
        className = "profile-bottlenecks" >
            _jsx("strong", { children: "Bottlenecks:" });
        {
            profile.analysis.bottlenecks.length;
        }
        div >
        ;
    }
    div >
    ;
}
div >
;
div >
;
{ /* Report View */ }
{
    view === 'report' && ()
        < div;
    className = "report-view" >
        _jsxs("div", { className: "report-header", children: [_jsx("h4", { children: "Performance Report" }), _jsx("button", { className: "generate-btn", onClick: onGenerateReport, children: "Generate Report" })] });
    {
        !report ? ()
            < div : ;
        className = "empty-state" >
            (_jsx("span", { children: "\uD83D\uDCCA" })
                ,
                    _jsx("p", { children: "Click \"Generate Report\" to analyze performance" }));
        div >
        ;
        ()
            < div;
        className = "report-content" >
            { /* Summary */}
            < div;
        className = "report-section" >
            (_jsx("h5", { children: "Summary" })
                ,
                    _jsxs("div", { className: "summary-grid", children: [_jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Total Updates" }), _jsx("span", { className: "summary-value", children: report.summary.totalStateUpdates })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Avg Latency" }), _jsx("span", { className: "summary-value", children: formatDuration(report.summary.averageUpdateLatency) })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Memory Usage" }), _jsx("span", { className: "summary-value", children: formatBytes(report.summary.memoryUsage) })] }), _jsxs("div", { className: "summary-item", children: [_jsx("span", { className: "summary-label", children: "Cache Efficiency" }), _jsxs("span", { className: "summary-value", children: [(report.summary.cacheEfficiency * 100).toFixed(1), "%"] })] })] }));
        div >
            { /* Bottlenecks */};
        {
            report.bottlenecks.length > 0 && ()
                < div;
            className = "report-section" >
                (_jsxs("h5", { children: ["Bottlenecks (", report.bottlenecks.length, ")"] })
                    ,
                        _jsx("div", { className: "bottlenecks-list", children: report.bottlenecks.map(bottleneck => ()
                                < div, key = { bottleneck, : .id }, className = "bottleneck-item" >
                                (_jsxs("div", { className: "bottleneck-header", children: [_jsxs("span", { className: `severity severity-${bottleneck.severity}`, children: ["}", bottleneck.severity] }), _jsxs("span", { className: "bottleneck-location", children: [bottleneck.location.domain, " - ", bottleneck.location.operation] })] })
                                    ,
                                        _jsx("div", { className: "bottleneck-description", children: bottleneck.description })
                                            ,
                                                _jsxs("div", { className: "bottleneck-impact", children: [_jsxs("span", { children: ["Impact: ", bottleneck.impact.frequency, " occurrences, "] }), _jsxs("span", { children: [formatDuration(bottleneck.impact.averageDelay), " avg delay"] })] }))) }));
        }
        div >
        ;
        div >
        ;
    }
    { /* Recommendations */ }
    {
        report.recommendations.length > 0 && ()
            < div;
        className = "report-section" >
            (_jsxs("h5", { children: ["Recommendations (", report.recommendations.length, ")"] })
                ,
                    _jsx("div", { className: "recommendations-list", children: report.recommendations.map(rec => ()
                            < div, key = { rec, : .id }, className = "recommendation-item" >
                            (_jsxs("div", { className: "recommendation-header", children: [_jsxs("span", { className: `priority priority-${rec.priority}`, children: ["}", rec.priority] }), _jsx("span", { className: "recommendation-title", children: rec.title })] })
                                ,
                                    _jsx("div", { className: "recommendation-description", children: rec.description })
                                        ,
                                            _jsxs("div", { className: "recommendation-metrics", children: [_jsxs("span", { children: ["Expected speedup: ", rec.metrics.expectedSpeedup, "x"] }), _jsx("span", { className: "metric-separator", children: "\u2022" }), _jsxs("span", { children: ["Effort: ", rec.implementation.effort] }), _jsx("span", { className: "metric-separator", children: "\u2022" }), _jsxs("span", { children: ["Risk: ", rec.implementation.risk] })] }))) }));
    }
    div >
    ;
    div >
    ;
}
div >
;
div >
;
{ /* Live Metrics View */ }
{
    view === 'live' && ()
        < div;
    className = "live-view" >
        (_jsxs("div", { className: "live-header", children: [_jsx("h4", { children: "Live Performance Metrics" }), _jsxs("div", { className: "live-status", children: [_jsx("span", { className: `status-indicator ${performanceProfiler.isProfilingActive() ? 'active' : 'inactive'}` }), "}", performanceProfiler.isProfilingActive() ? 'Recording' : 'Stopped'] })] })
            ,
                _jsxs("div", { className: "live-metrics", children: [_jsxs("div", { className: "metric-card", children: [_jsx("h6", { children: "Current Session" }), _jsx("div", { className: "metric-value", children: performanceProfiler.getCurrentProfileId() || 'No active profile' })] }), _jsxs("div", { className: "metric-card", children: [_jsx("h6", { children: "Active Profiles" }), _jsx("div", { className: "metric-value", children: activeProfiles.length })] }), _jsxs("div", { className: "metric-card", children: [_jsx("h6", { children: "Alert Count" }), _jsx("div", { className: "metric-value", children: alerts.length })] })] }));
    div >
    ;
}
_jsx("style", { jsx: true, children: `
        .performance-panel {
          height: 100%;
  display: flex;
          flex-direction: column;
  background: var(--devtools-bg, #1e1e1e);
        .performance-tabs {
          display: flex;
          border-bottom: 1px solid var(--devtools-border, #333);
          background: var(--devtools-tabs-bg, #252525);
        .tab {
          background: transparent;
  border: none;
          color: var(--devtools-text, #aaa);
          padding: 8px 12px;
  cursor: pointer;
          font-size: 12px;
          border-bottom: 2px solid transparent;
  transition: all 0.2s;
          display: flex;
          align-items: center;
  gap: 6px;
        .tab:hover {,
  background: var(--devtools-hover, #404040);
          color: var(--devtools-text, #fff);
        .tab.active {
          color: var(--devtools-active, #61dafb);
          border-bottom-color: var(--devtools-active, #61dafb);
          background: var(--devtools-active-bg, #2a2a2a);
        .badge {
          background: #e74c3c;
  color: white;
          font-size: 10px;
  padding: 2px 6px;
          border-radius: 10px;
          min-width: 16px;
  height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        .alerts-view,
        .profiles-view,
        .report-view,
        .live-view {
          flex: 1;
  display: flex;
          flex-direction: column;
  overflow: hidden;
        .alerts-header,
        .profiles-header,
        .report-header,
        .live-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
  padding: 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          background: var(--devtools-section-bg, #252525);
        .alerts-header h4,
        .profiles-header h4,
        .report-header h4,
        .live-header h4 {
          margin: 0;
          font-size: 14px;
  color: var(--devtools-text, #fff);
        .clear-btn,
        .start-btn,
        .generate-btn {
          background: var(--devtools-btn-bg, #2a2a2a);
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          padding: 4px 8px;
          border-radius: 4px;
  cursor: pointer;
          font-size: 12px;
        .clear-btn:hover,
        .start-btn:hover,
        .generate-btn:hover {,
  background: var(--devtools-hover, #404040);
        .alerts-list,
        .profiles-list {
          flex: 1;
          overflow-y: auto;
  padding: 0;
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
  height: 200px;
          color: var(--devtools-text-secondary, #aaa);
          text-align: center;
        .empty-state span {
          font-size: 48px;
          margin-bottom: 16px;
        .alert-item {
          padding: 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          border-left: 3px solid #333;
        .alert-header {
          display: flex;
          align-items: center;
  gap: 8px;
          margin-bottom: 8px;
        .alert-icon {
          font-size: 16px;
        .alert-message {
          flex: 1;
          font-size: 13px;
          font-weight: 500;
  color: var(--devtools-text, #fff);
        .alert-time {
          font-size: 11px;
  color: var(--devtools-text-secondary, #aaa);
        .alert-details {
          margin-bottom: 8px;
          font-size: 12px;
  color: var(--devtools-text-secondary, #aaa);
        .alert-metric,
        .alert-domain {
          margin-bottom: 4px;
        .alert-suggestions {
          font-size: 11px;
  color: var(--devtools-text-secondary, #aaa);
        .alert-suggestions ul {
          margin: 4px 0 0 0;
          padding-left: 16px;
        .profile-item {
          padding: 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          cursor: pointer;
  transition: background 0.2s;
        .profile-item:hover {,
  background: var(--devtools-hover, #2a2a2a);
        .profile-item.selected {
          background: var(--devtools-selected-bg, #2a3a4a);
          border-left: 3px solid var(--devtools-active, #61dafb);
        .profile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        .profile-name {
          font-size: 13px;
          font-weight: 500;
  color: var(--devtools-text, #fff);
        .stop-btn {
          background: #e74c3c;
  border: none;
          color: white;
  padding: 2px 6px;
          border-radius: 3px;
  cursor: pointer;
          font-size: 11px;
        .profile-stats {
          display: flex;
  gap: 16px;
          margin-bottom: 8px;
        .stat {
          display: flex;
          flex-direction: column;
  gap: 2px;
        .stat-label {
          font-size: 10px;
  color: var(--devtools-text-secondary, #aaa);
          text-transform: uppercase;
        .stat-value {
          font-size: 12px;
  color: var(--devtools-text, #fff);
          font-weight: 500;
        .profile-bottlenecks {
          font-size: 11px;
  color: var(--devtools-warning, #f39c12);
        .report-content {
          flex: 1;
          overflow-y: auto;
  padding: 0;
        .report-section {
          padding: 16px;
          border-bottom: 1px solid var(--devtools-border, #333);
        .report-section h5 {
          margin: 0 0 12px 0;
          font-size: 13px;
  color: var(--devtools-text, #fff);
          border-bottom: 1px solid var(--devtools-border, #333);
          padding-bottom: 4px;
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        .summary-item {
          display: flex;
          flex-direction: column;
  gap: 4px;
          padding: 8px;
  background: var(--devtools-card-bg, #2a2a2a);
          border-radius: 4px;
  border: 1px solid var(--devtools-border, #333);
        .summary-label {
          font-size: 11px;
  color: var(--devtools-text-secondary, #aaa);
          text-transform: uppercase;
        .summary-value {
          font-size: 16px;
  color: var(--devtools-text, #fff);
          font-weight: 600;
        .bottlenecks-list,
        .recommendations-list {
          display: flex;
          flex-direction: column;
  gap: 8px;
        .bottleneck-item,
        .recommendation-item {
          padding: 12px;
  background: var(--devtools-card-bg, #2a2a2a);
          border-radius: 4px;
  border: 1px solid var(--devtools-border, #333);
        .bottleneck-header,
        .recommendation-header {
          display: flex;
          align-items: center;
  gap: 8px;
          margin-bottom: 8px;
        .severity,
        .priority {
          font-size: 10px;
          font-weight: 600;
  padding: 2px 6px;
          border-radius: 3px;
          text-transform: uppercase;
        .severity-critical { background: #e74c3c; color: white; }
        .severity-high { background: #f39c12; color: white; }
        .severity-medium { background: #f1c40f; color: black; }
        .severity-low { background: #95a5a6; color: white; }
        .priority-critical { background: #e74c3c; color: white; }
        .priority-high { background: #f39c12; color: white; }
        .priority-medium { background: #f1c40f; color: black; }
        .priority-low { background: #95a5a6; color: white; }
        .bottleneck-location,
        .recommendation-title {
          font-size: 13px;
          font-weight: 500;
  color: var(--devtools-text, #fff);
        .bottleneck-description,
        .recommendation-description {
          font-size: 12px;
  color: var(--devtools-text-secondary, #aaa);
          margin-bottom: 8px;
        .bottleneck-impact,
        .recommendation-metrics {
          font-size: 11px;
  color: var(--devtools-text-secondary, #aaa);
        .metric-separator {
          margin: 0 8px;
  color: var(--devtools-border, #333);
        .live-status {
          display: flex;
          align-items: center;
  gap: 6px;
          font-size: 12px;
  color: var(--devtools-text, #fff);
        .status-indicator {
          width: 8px;
  height: 8px;
          border-radius: 50%;
  background: #95a5a6;
        .status-indicator.active {
          background: #27ae60;
  animation: pulse 2s infinite;
        .live-metrics {
          padding: 16px;
  display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        .metric-card {
          padding: 16px;
  background: var(--devtools-card-bg, #2a2a2a);
          border-radius: 8px;
  border: 1px solid var(--devtools-border, #333);
          text-align: center;
        .metric-card h6 {
          margin: 0 0 8px 0;
          font-size: 12px;
  color: var(--devtools-text-secondary, #aaa);
          text-transform: uppercase;
        .metric-card .metric-value {
          font-size: 24px;
  color: var(--devtools-text, #fff);
          font-weight: 600;
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
      ` });
div >
;
;
;
