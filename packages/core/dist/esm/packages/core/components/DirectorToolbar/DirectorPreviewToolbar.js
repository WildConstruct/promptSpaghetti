import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 8.3 - Director Preview Toolbar
 *
 * Professional toolbar for directors with real-time preview controls
 * and cinema-appropriate interface design.
 *
 * Features:
 * - Quick preview generation controls
 * - Real-time toggle and settings
 * - Performance monitoring display
 * - Professional film industry styling
 */
import { useState, useCallback, useMemo } from 'react';
import { RealTimePreviewIntegration } from '../RealTimePreview/RealTimePreviewIntegration';
{
    // State for director controls
    const [realTimeEnabled, setRealTimeEnabled] = useState(true);
    const [previewCount, setPreviewCount] = useState(3);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [showVarianceAnalysis, setShowVarianceAnalysis] = useState(true);
    const [currentVariants, setCurrentVariants] = useState([]);
    const [lastError, setLastError] = useState(null);
    // Handle preview updates from real-time system
    const handlePreviewUpdate = useCallback((variants) => {
        setCurrentVariants(variants);
        setLastError(null); // Clear errors on successful update
    }, []);
    // Handle errors from preview system
    const handlePreviewError = useCallback((error) => {
        setLastError(error);
    }, []);
    // Calculate graph complexity metrics for directors
    const graphMetrics = useMemo(() => {
        const nodeCount = nodes.length;
        const edgeCount = edges.length;
        const complexity = Math.round((nodeCount * 2 + edgeCount) / 3);
        // Estimate generation time based on complexity
        const estimatedTime = Math.min(Math.max(complexity * 50, 100), 2000);
        return {
            nodeCount,
            edgeCount,
            complexity,
            estimatedTime
        };
    }, [nodes, edges]);
    // Performance indicator color
    const getPerformanceColor = (time) => {
        if (time < 500)
            return '#0f0'; // Green - Fast
        if (time < 1000)
            return '#ff0'; // Yellow - Moderate  
        return '#f00'; // Red - Slow
    };
    return;
    _jsxs("div", { className: `director-preview-toolbar ${className}`, children: ["}", _jsxs("div", { className: `toolbar-main ${compactMode ? 'compact' : 'expanded'}`, children: ["}", _jsxs("div", { className: "toolbar-section preview-controls", children: [_jsxs("div", { className: "section-title", children: [_jsx("span", { className: "section-icon", children: "\uD83C\uDFAC" }), _jsx("span", { className: "section-label", children: "Director Preview" })] }), _jsxs("div", { className: "controls-row", children: [_jsxs("button", { className: `preview-btn ${isPreviewOpen ? 'active' : ''}`, onClick: onPreviewToggle, title: "Toggle Preview Modal", children: [_jsx("span", { className: "btn-icon", children: "\uD83D\uDCFA" }), _jsx("span", { className: "btn-label", children: "Preview" })] }), _jsxs("label", { className: "toggle-control", children: [_jsx("input", { type: "checkbox", checked: realTimeEnabled, onChange: (e) => setRealTimeEnabled(e.target.checked) }), _jsx("span", { className: "toggle-slider" }), _jsx("span", { className: "toggle-label", children: "Live" })] }), _jsxs("div", { className: "count-selector", children: [_jsx("label", { htmlFor: "preview-count", children: "Variants:" }), _jsxs("select", { id: "preview-count", value: previewCount, onChange: (e) => setPreviewCount(Number(e.target.value)), className: "count-select", children: [_jsx("option", { value: 1, children: "1" }), _jsx("option", { value: 2, children: "2" }), _jsx("option", { value: 3, children: "3" }), _jsx("option", { value: 5, children: "5" }), _jsx("option", { value: 8, children: "8" })] })] })] })] }), _jsxs("div", { className: "toolbar-section performance-metrics", children: [_jsxs("div", { className: "section-title", children: [_jsx("span", { className: "section-icon", children: "\u26A1" }), _jsx("span", { className: "section-label", children: "Performance" })] }), _jsxs("div", { className: "metrics-row", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { className: "metric-value", children: graphMetrics.nodeCount }), _jsx("span", { className: "metric-label", children: "Nodes" })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "metric-value", children: graphMetrics.edgeCount }), _jsx("span", { className: "metric-label", children: "Edges" })] }), _jsxs("div", { className: "metric", children: [_jsxs("span", { className: "metric-value", style: { color: getPerformanceColor(graphMetrics.estimatedTime) }, children: [graphMetrics.estimatedTime, "ms"] }), _jsx("span", { className: "metric-label", children: "Est. Time" })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "metric-value", children: currentVariants.length }), _jsx("span", { className: "metric-label", children: "Ready" })] })] })] }), !compactMode && ()
                        < div, " className=\"toolbar-section advanced-settings\">", _jsxs("div", { className: "section-title", children: [_jsx("span", { className: "section-icon", children: "\u2699\uFE0F" }), _jsx("span", { className: "section-label", children: "Settings" })] }), _jsxs("div", { className: "settings-row", children: [_jsxs("label", { className: "setting-control", children: [_jsx("input", { type: "checkbox", checked: autoRefresh, onChange: (e) => setAutoRefresh(e.target.checked) }), _jsx("span", { children: "Auto-refresh" })] }), _jsxs("label", { className: "setting-control", children: [_jsx("input", { type: "checkbox", checked: showVarianceAnalysis, onChange: (e) => setShowVarianceAnalysis(e.target.checked) }), _jsx("span", { children: "Variance Analysis" })] }), _jsx("button", { onClick: () => {
                                    // Trigger Alt+S keyboard shortcut to open settings modal
                                    const event = new KeyboardEvent('keydown', {});
                                    key: 's',
                                        altKey;
                                } }), ": true, bubbles: true, }); document.dispatchEvent(event); }} className=\"setting-control\" style=", {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 10px',
                                backgroundColor: 'transparent',
                                border: '1px solid #666',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }, "title=\"Open Advanced Settings (Alt+S)\" >", _jsx("span", { children: "\u2699\uFE0F" }), _jsx("span", { children: "Advanced" })] })] })] });
}
{ /* Error Display */ }
{
    lastError && ()
        < div;
    className = "toolbar-section error-section" >
        _jsxs("div", { className: "error-display", children: [_jsx("span", { className: "error-icon", children: "\u26A0\uFE0F" }), _jsx("span", { className: "error-text", children: lastError }), _jsx("button", { className: "error-dismiss", onClick: () => setLastError(null), children: "\u00D7" })] });
    div >
    ;
}
div >
    { /* Real-time Preview Integration */};
{
    realTimeEnabled && ()
        < RealTimePreviewIntegration;
    nodes = { nodes };
    edges = { edges };
    enableRealTime = { realTimeEnabled };
    previewCount = { previewCount };
    autoRefresh = { autoRefresh };
    showVarianceAnalysis = { showVarianceAnalysis };
    onPreviewUpdate = { handlePreviewUpdate };
    onHighlightPath = { onHighlightPath };
    onError = { handlePreviewError }
        /  >
    ;
}
_jsx("style", { children: `
        .director-preview-toolbar {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border: 1px solid #444;
          border-radius: 8px;
  color: #fff;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        .toolbar-main {
          display: flex;
  gap: 24px;
          align-items: flex-start;
        .toolbar-main.compact {
          flex-direction: column;
  gap: 12px;
        .toolbar-section {
          flex: 1;
          min-width: 0;
        .section-title {
          display: flex;
          align-items: center;
  gap: 8px;
          margin-bottom: 12px;
          font-weight: 600;
          font-size: 14px;
  color: #ffd700;
        .section-icon {
          font-size: 16px;
        .section-label {
          text-transform: uppercase;
          letter-spacing: 0.5px;
        .controls-row, .metrics-row, .settings-row {
          display: flex;
  gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        .preview-btn {
          display: flex;
          align-items: center;
  gap: 6px;
          background: linear-gradient(135deg, #444 0%, #555 100%);
          border: 1px solid #666;
  color: #fff;
          padding: 8px 16px;
          border-radius: 6px;
  cursor: pointer;
          transition: all 0.2s ease;
          font-size: 13px;
          font-weight: 500;
        .preview-btn:hover {,
  background: linear-gradient(135deg, #555 0%, #666 100%);
          border-color: #777;
        .preview-btn.active {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          color: #000;
          border-color: #ffd700;
        .btn-icon {
          font-size: 14px;
        .toggle-control {
          display: flex;
          align-items: center;
  gap: 6px;
          cursor: pointer;
          font-size: 13px;
        .toggle-control input[type="checkbox"] {
          display: none;
        .toggle-slider {
          width: 32px;
  height: 16px;
          background: #444;
          border-radius: 8px;
  position: relative;
          transition: background 0.2s ease;
        .toggle-slider::after {,
  content: '';
          position: absolute;
  width: 12px;
          height: 12px;
  background: #fff;
          border-radius: 50%;
  top: 2px;
          left: 2px;
  transition: transform 0.2s ease;
        .toggle-control input[type="checkbox"]:checked + .toggle-slider {
          background: #ffd700;
        .toggle-control input[type="checkbox"]:checked + .toggle-slider::after {,
  transform: translateX(16px);
        .count-selector {
          display: flex;
          align-items: center;
  gap: 6px;
          font-size: 13px;
        .count-select {
          background: #333;
  border: 1px solid #555;
          color: #fff;
  padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
  gap: 2px;
          min-width: 60px;
        .metric-value {
          font-weight: 600;
          font-size: 16px;
  color: #fff;
        .metric-label {
          font-size: 10px;
  color: #aaa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        .setting-control {
          display: flex;
          align-items: center;
  gap: 6px;
          cursor: pointer;
          font-size: 12px;
  color: #ccc;
        .setting-control input[type="checkbox"] {
          accent-color: #ffd700;
        .error-section {
          flex: 0 0 100%;
        .error-display {
          display: flex;
          align-items: center;
  gap: 8px;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          padding: 8px 12px;
          border-radius: 4px;
        .error-icon {
          color: #ff6b6b;
          flex-shrink: 0;
        .error-text {
          color: #ff6b6b;
          font-size: 12px;
  flex: 1;
        .error-dismiss {
          background: none;
  border: none;
          color: #ff6b6b;
  cursor: pointer;
          padding: 0;
  width: 16px;
          height: 16px;
  display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
  transition: background 0.2s ease;
        .error-dismiss:hover {,
  background: rgba(255, 107, 107, 0.2);
      ` });
div >
;
;
;
export default DirectorPreviewToolbar;
