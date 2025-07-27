import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * DevTools Panel Component
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - React UI Components
 *
 * Main DevTools panel with tabs for different debugging features
 */
import { useState, useEffect, useCallback } from 'react';
// DevTools UI Components
import { TimeTravelPanel } from './TimeTravelPanel';
import { PerformancePanel } from './PerformancePanel';
import { StateInspectorPanel } from './StateInspectorPanel';
import { DependencyGraphPanel } from './DependencyGraphPanel';
const TABS = [
    { id: 'inspector', label: 'State Inspector', icon: '🔍' },
    { id: 'timetravel', label: 'Time Travel', icon: '⏰' },
    { id: 'performance', label: 'Performance', icon: '📊' },
    { id: 'dependencies', label: 'Dependencies', icon: '🔗' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
];
export const DevToolsPanel = ({ devTools, timeTravel, performanceProfiler, isOpen = true, onClose, defaultTab = 'inspector', position = 'bottom', theme = 'auto' }) => {
    const [state, setState] = useState({
        activeTab: defaultTab,
        isRecording: false,
        timeTravelState: null,
        performanceAlerts: [],
        selectedDomain: 'all',
        dependencyGraph: null,
        performanceReport: null
    });
    // Update state from DevTools
    const updateDevToolsState = useCallback(() => {
        setState(prevState => ({
            ...prevState,
            timeTravelState: timeTravel.getTimeTravelState(),
            performanceAlerts: performanceProfiler.getAlerts(),
            isRecording: timeTravel.getTimeTravelState()?.isReplaying || false
        }));
    }, [timeTravel, performanceProfiler]);
    // Setup event listeners
    useEffect(() => {
        updateDevToolsState();
        const handleStateChange = () => updateDevToolsState();
        const handleTimeTravel = () => updateDevToolsState();
        const handlePerformanceAlert = () => updateDevToolsState();
        devTools.on('stateRecorded', handleStateChange);
        timeTravel.on('positionChanged', handleTimeTravel);
        performanceProfiler.on('alertCreated', handlePerformanceAlert);
        return () => {
            devTools.off('stateRecorded', handleStateChange);
            timeTravel.off('positionChanged', handleTimeTravel);
            performanceProfiler.off('alertCreated', handlePerformanceAlert);
        };
    }, [devTools, timeTravel, performanceProfiler, updateDevToolsState]);
    // Generate dependency graph
    const generateDependencyGraph = useCallback(async () => {
        try {
            const graph = devTools.visualizeStateDependencies({
                domains: state.selectedDomain === 'all' ? undefined : [state.selectedDomain],
                includeComponents: true,
                includeSelectors: true,
                layout: 'hierarchical'
            });
            setState(prev => ({ ...prev, dependencyGraph: graph }));
        }
        catch (error) {
            console.error('Failed to generate dependency graph:', error);
        }
    }, [devTools, state.selectedDomain]);
    // Generate performance report
    const generatePerformanceReport = useCallback(async () => {
        try {
            const report = devTools.detectStateBottlenecks();
            setState(prev => ({ ...prev, performanceReport: report }));
        }
        catch (error) {
            console.error('Failed to generate performance report:', error);
        }
    }, [devTools]);
    // Tab handlers
    const handleTabChange = (tabId) => {
        setState(prev => ({ ...prev, activeTab: tabId }));
        // Load data for specific tabs
        if (tabId === 'dependencies' && !state.dependencyGraph) {
            generateDependencyGraph();
        }
        if (tabId === 'performance' && !state.performanceReport) {
            generatePerformanceReport();
        }
    };
    const handleRecordingToggle = () => {
        if (state.isRecording) {
            devTools.stopRecording();
            timeTravel.stopRecording();
        }
        else {
            devTools.startRecording();
            timeTravel.startRecording();
        }
        setState(prev => ({ ...prev, isRecording: !prev.isRecording }));
    };
    const handleClearHistory = () => {
        devTools.clearHistory();
        timeTravel.clearHistory();
        updateDevToolsState();
    };
    const handleDomainChange = (domain) => {
        setState(prev => ({ ...prev, selectedDomain: domain }));
    };
    if (!isOpen) {
        return null;
    }
    const panelClasses = `devtools-panel devtools-panel--${position} devtools-panel--${theme}`;
    return (_jsxs("div", { className: panelClasses, children: [_jsxs("div", { className: "devtools-header", children: [_jsxs("div", { className: "devtools-title", children: [_jsx("span", { className: "devtools-logo", children: "\uD83D\uDEE0\uFE0F" }), _jsx("h3", { children: "State DevTools" })] }), _jsxs("div", { className: "devtools-controls", children: [_jsx("button", { className: `devtools-btn ${state.isRecording ? 'recording' : ''}`, onClick: handleRecordingToggle, title: state.isRecording ? 'Stop Recording' : 'Start Recording', children: state.isRecording ? '⏸️' : '⏺️' }), _jsx("button", { className: "devtools-btn", onClick: handleClearHistory, title: "Clear History", children: "\uD83D\uDDD1\uFE0F" }), onClose && (_jsx("button", { className: "devtools-btn", onClick: onClose, title: "Close DevTools", children: "\u2715" }))] })] }), _jsx("div", { className: "devtools-tabs", children: TABS.map(tab => (_jsxs("button", { className: `devtools-tab ${state.activeTab === tab.id ? 'active' : ''}`, onClick: () => handleTabChange(tab.id), children: [_jsx("span", { className: "devtools-tab-icon", children: tab.icon }), _jsx("span", { className: "devtools-tab-label", children: tab.label }), tab.id === 'performance' && state.performanceAlerts.length > 0 && (_jsx("span", { className: "devtools-badge", children: state.performanceAlerts.length }))] }, tab.id))) }), _jsxs("div", { className: "devtools-content", children: [state.activeTab === 'inspector' && (_jsx(StateInspectorPanel, { devTools: devTools, selectedDomain: state.selectedDomain, onDomainChange: handleDomainChange })), state.activeTab === 'timetravel' && (_jsx(TimeTravelPanel, { timeTravel: timeTravel, timeTravelState: state.timeTravelState, selectedDomain: state.selectedDomain, onDomainChange: handleDomainChange })), state.activeTab === 'performance' && (_jsx(PerformancePanel, { performanceProfiler: performanceProfiler, alerts: state.performanceAlerts, report: state.performanceReport, onGenerateReport: generatePerformanceReport })), state.activeTab === 'dependencies' && (_jsx(DependencyGraphPanel, { dependencyGraph: state.dependencyGraph, onGenerateGraph: generateDependencyGraph, selectedDomain: state.selectedDomain, onDomainChange: handleDomainChange })), state.activeTab === 'settings' && (_jsx(DevToolsSettingsPanel, { devTools: devTools, timeTravel: timeTravel, performanceProfiler: performanceProfiler }))] }), _jsx("style", { jsx: true, children: `
        .devtools-panel {
          position: fixed;
          background: var(--devtools-bg, #1e1e1e);
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 12px;
          z-index: 10000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          min-width: 300px;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .devtools-panel--bottom {
          bottom: 20px;
          left: 20px;
          right: 20px;
          height: 400px;
        }

        .devtools-panel--right {
          top: 20px;
          right: 20px;
          bottom: 20px;
          width: 400px;
        }

        .devtools-panel--floating {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 600px;
        }

        .devtools-panel--light {
          --devtools-bg: #ffffff;
          --devtools-border: #e0e0e0;
          --devtools-text: #333333;
        }

        .devtools-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          background: var(--devtools-header-bg, #2d2d2d);
        }

        .devtools-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .devtools-title h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }

        .devtools-controls {
          display: flex;
          gap: 4px;
        }

        .devtools-btn {
          background: transparent;
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;
        }

        .devtools-btn:hover {
          background: var(--devtools-hover, #404040);
        }

        .devtools-btn.recording {
          background: #e74c3c;
          border-color: #e74c3c;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }

        .devtools-tabs {
          display: flex;
          border-bottom: 1px solid var(--devtools-border, #333);
          background: var(--devtools-tabs-bg, #252525);
        }

        .devtools-tab {
          background: transparent;
          border: none;
          color: var(--devtools-text, #aaa);
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
          position: relative;
        }

        .devtools-tab:hover {
          background: var(--devtools-hover, #404040);
          color: var(--devtools-text, #fff);
        }

        .devtools-tab.active {
          color: var(--devtools-active, #61dafb);
          border-bottom-color: var(--devtools-active, #61dafb);
          background: var(--devtools-active-bg, #2a2a2a);
        }

        .devtools-badge {
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
        }

        .devtools-content {
          flex: 1;
          overflow: auto;
          padding: 0;
        }
      ` })] }));
};
const DevToolsSettingsPanel = ({ devTools, timeTravel, performanceProfiler }) => {
    const [settings, setSettings] = useState({
        maxHistorySize: 1000,
        sampleRate: 100,
        enableAlerts: true,
        alertThresholds: {
            updateLatency: 100,
            memoryUsage: 100 * 1024 * 1024,
            renderTime: 16
        }
    });
    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };
    const handleThresholdChange = (metric, value) => {
        setSettings(prev => ({
            ...prev,
            alertThresholds: {
                ...prev.alertThresholds,
                [metric]: value
            }
        }));
    };
    const exportSession = () => {
        const sessionData = devTools.exportSession();
        const blob = new Blob([JSON.stringify(sessionData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devtools-session-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return (_jsxs("div", { className: "devtools-settings", children: [_jsx("h4", { children: "Configuration" }), _jsxs("div", { className: "setting-group", children: [_jsx("label", { children: "Max History Size" }), _jsx("input", { type: "number", value: settings.maxHistorySize, onChange: (e) => handleSettingChange('maxHistorySize', parseInt(e.target.value)), min: "100", max: "10000" })] }), _jsxs("div", { className: "setting-group", children: [_jsx("label", { children: "Sample Rate (ms)" }), _jsx("input", { type: "number", value: settings.sampleRate, onChange: (e) => handleSettingChange('sampleRate', parseInt(e.target.value)), min: "50", max: "1000" })] }), _jsx("div", { className: "setting-group", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: settings.enableAlerts, onChange: (e) => handleSettingChange('enableAlerts', e.target.checked) }), "Enable Performance Alerts"] }) }), _jsx("h4", { children: "Alert Thresholds" }), _jsxs("div", { className: "setting-group", children: [_jsx("label", { children: "Update Latency (ms)" }), _jsx("input", { type: "number", value: settings.alertThresholds.updateLatency, onChange: (e) => handleThresholdChange('updateLatency', parseInt(e.target.value)) })] }), _jsxs("div", { className: "setting-group", children: [_jsx("label", { children: "Memory Usage (MB)" }), _jsx("input", { type: "number", value: Math.round(settings.alertThresholds.memoryUsage / 1024 / 1024), onChange: (e) => handleThresholdChange('memoryUsage', parseInt(e.target.value) * 1024 * 1024) })] }), _jsxs("div", { className: "setting-group", children: [_jsx("label", { children: "Render Time (ms)" }), _jsx("input", { type: "number", value: settings.alertThresholds.renderTime, onChange: (e) => handleThresholdChange('renderTime', parseInt(e.target.value)) })] }), _jsx("h4", { children: "Data Management" }), _jsxs("div", { className: "setting-actions", children: [_jsx("button", { className: "devtools-btn", onClick: exportSession, children: "Export Session Data" }), _jsx("button", { className: "devtools-btn", onClick: () => devTools.clearHistory(), children: "Clear All History" })] }), _jsx("style", { jsx: true, children: `
        .devtools-settings {
          padding: 16px;
        }

        .devtools-settings h4 {
          margin: 16px 0 8px 0;
          color: var(--devtools-text, #fff);
          font-size: 14px;
          border-bottom: 1px solid var(--devtools-border, #333);
          padding-bottom: 4px;
        }

        .setting-group {
          margin-bottom: 12px;
        }

        .setting-group label {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
          color: var(--devtools-text, #ccc);
        }

        .setting-group input[type="number"] {
          width: 100%;
          padding: 4px 8px;
          background: var(--devtools-input-bg, #2a2a2a);
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          border-radius: 4px;
          font-size: 12px;
        }

        .setting-group input[type="checkbox"] {
          margin-right: 8px;
        }

        .setting-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .setting-actions .devtools-btn {
          flex: 1;
          min-width: 120px;
        }
      ` })] }));
};
