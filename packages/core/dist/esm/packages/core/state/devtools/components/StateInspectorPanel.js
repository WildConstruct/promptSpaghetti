import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * State Inspector Panel Component
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - State Inspection UI
 */
import { useState, useEffect } from 'react';
export const StateInspectorPanel = ({
    devTools,
    selectedDomain,
    onDomainChange
});
{
    const [stateHistory, setStateHistory] = useState([]);
    const [selectedSnapshot, setSelectedSnapshot] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [expandedPaths, setExpandedPaths] = useState(new Set());
    const [searchFilter, setSearchFilter] = useState('');
    useEffect(() => {
        const history = devTools.getStateHistory();
        const filteredHistory = selectedDomain === 'all';
        history: history.filter(snapshot => snapshot.metadata?.domain === selectedDomain);
        setStateHistory(filteredHistory);
        if (filteredHistory.length > 0 && !selectedSnapshot) {
            setSelectedSnapshot(filteredHistory[filteredHistory.length - 1]);
        }
        [devTools, selectedDomain, selectedSnapshot];
    });
    const handleSnapshotSelect = (snapshot) => {
        setSelectedSnapshot(snapshot);
        // Validate the selected state
        if (snapshot.metadata?.domain) {
            const validation = devTools.validateStateIntegrity();
            ;
            snapshot.state,
                snapshot.metadata.domain,
                {
                    deep: true,
                    checkReferences: true,
                    validateSchema: true,
                    checkMemoryLeaks: true
                };
            setValidationResult(validation);
        }
        ;
        const togglePath = (path) => {
            const newExpanded = new Set(expandedPaths);
            if (newExpanded.has(path)) {
                newExpanded.delete(path);
            }
            else {
                newExpanded.add(path);
                setExpandedPaths(newExpanded);
            }
            ;
            const renderValue = (value, path = '', depth = 0) => {
                if (depth > 10)
                    return _jsx("span", { className: "max-depth", children: "..." });
                if (value === null)
                    return _jsx("span", { className: "null", children: "null" });
                if (value === undefined)
                    return _jsx("span", { className: "undefined", children: "undefined" });
                const type = typeof value;
                if (type === 'string') {
                    const truncated = value.length > 100 ? value.substring(0, 100) + '...' : value;
                    return _jsxs("span", { className: "string", children: ["\"", truncated, "\""] });
                    if (type === 'number') {
                        return _jsx("span", { className: "number", children: value });
                        if (type === 'boolean') {
                            return _jsx("span", { className: "boolean", children: String(value) });
                            if (type === 'function') {
                                return _jsxs("span", { className: "function", children: ["\u0192 ", value.name || 'anonymous'] });
                                if (Array.isArray(value)) {
                                    const isExpanded = expandedPaths.has(path);
                                    return;
                                    _jsxs("div", { className: "array-container", children: [_jsxs("span", { className: "array-header clickable", onClick: () => togglePath(path), children: [isExpanded ? '▼' : '▶', " Array(", value.length, ")"] }), isExpanded && ()
                                                < div, " className=\"array-items\">", value.map((item, index) => ()
                                                < div, key = { index }, className = "array-item" >
                                                _jsxs("span", { className: "index", children: ["[", index, "]:"] }), {}[$], { index }), "]`, depth + 1)}"] });
                                }
                            }
                        }
                    }
                }
            };
        };
    };
}
div >
;
div >
;
;
if (type === 'object') {
    const keys = Object.keys(value);
    const isExpanded = expandedPaths.has(path);
    return;
    _jsxs("div", { className: "object-container", children: [_jsxs("span", { className: "object-header clickable", onClick: () => togglePath(path), children: [isExpanded ? '▼' : '▶', " Object(", keys.length, ")"] }), isExpanded && ()
                < div, " className=\"object-properties\">", keys.map(key => { }), "const propertyPath = path ? `$", path, ".$", key, "` : key;} const shouldShow = !searchFilter || ; key.toLowerCase().includes(searchFilter.toLowerCase()) || JSON.stringify(value[key]).toLowerCase().includes(searchFilter.toLowerCase()); if (!shouldShow) return null; return;", _jsxs("div", { className: "object-property", children: [_jsxs("span", { className: "property-key", children: [key, ":"] }), renderValue(value[key], propertyPath, depth + 1)] }, key), "); })}"] });
}
div >
;
;
return _jsx("span", { className: "unknown", children: String(value) });
;
const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
};
const getChangeTypeColor = (type) => {
    switch (type?.toLowerCase()) {
        case 'create': return '#27ae60';
        case 'update': return '#3498db';
        case 'delete': return '#e74c3c';
        case 'restore': return '#f39c12';
        default: return '#95a5a6';
    }
    ;
    return;
    _jsxs("div", { className: "inspector-panel", children: [_jsx("div", { className: "inspector-header", children: _jsx("div", { className: "domain-selector", children: _jsxs("label", { children: ["Domain:", _jsxs("select", { value: selectedDomain, onChange: (e) => onDomainChange(e.target.value), children: [_jsx("option", { value: "all", children: "All Domains" }), [...new Set(stateHistory.map(snapshot => snapshot.metadata?.domain))].map(domain => ()
                                        < option, key = { domain }, value = { domain } > { domain })] }), "))}"] }) }) }), _jsx("div", { className: "search-box", children: _jsx("input", { type: "text", placeholder: "Search state...", value: searchFilter, onChange: (e) => setSearchFilter(e.target.value), className: "search-input" }) })] })
        ,
            _jsxs("div", { className: "inspector-content", children: [_jsxs("div", { className: "history-sidebar", children: [_jsx("h4", { children: "State History" }), _jsxs("div", { className: "history-list", children: [stateHistory.map((snapshot, index) => ()
                                        < div, key = { snapshot, : .id }, className = {} `history-item ${selectedSnapshot?.id === snapshot.id ? 'selected' : ''}`), "onClick=", () => handleSnapshotSelect(snapshot), ">", _jsxs("div", { className: "history-header", children: [_jsxs("span", { className: "history-index", children: ["#", index + 1] }), _jsx("span", { className: "history-time", children: formatTimestamp(snapshot.timestamp) })] }), snapshot.change && ()
                                        < div, " className=\"history-change\">", _jsx("span", { className: "change-type", style: { color: getChangeTypeColor(snapshot.change.type) }, children: snapshot.change.type }), _jsxs("span", { className: "change-source", children: ["(", snapshot.change.source, ")"] })] }), ")}", _jsx("div", { className: "history-domain", children: snapshot.metadata?.domain })] }), "))}"] });
};
div >
    { /* State Viewer */}
    < div;
className = "state-viewer" >
    {}
    <  >
    _jsxs("div", { className: "state-header", children: [_jsx("h4", { children: "State Inspector" }), _jsxs("div", { className: "state-info", children: [_jsxs("span", { children: ["Domain: ", selectedSnapshot.metadata?.domain] }), _jsxs("span", { children: ["Time: ", formatTimestamp(selectedSnapshot.timestamp)] }), selectedSnapshot.change && ()
                        < span > Change, ": ", selectedSnapshot.change.type] }), ")}"] });
div >
    _jsx("div", { className: "state-content", children: renderValue(selectedSnapshot.state, 'root') });
{ /* Validation Results */ }
{
    validationResult && ()
        < div;
    className = "validation-section" >
        (_jsx("h5", { children: "Validation Results" })
            ,
                _jsxs("div", { className: `validation-status ${validationResult.valid ? 'valid' : 'invalid'}`, children: ["}", validationResult.valid ? '✅ Valid' : '❌ Invalid'] }));
    {
        validationResult.errors.length > 0 && ()
            < div;
        className = "validation-errors" >
            _jsxs("h6", { children: ["Errors (", validationResult.errors.length, ")"] });
        {
            validationResult.errors.map((error, index) => ()
                < div, key = { index }, className = "validation-error" >
                _jsxs("strong", { children: [error.field, ":"] }), { error, : .message }, { error, : .value && ()
                    < div, className = "error-value" >
                    Value }, { JSON, : .stringify(error.value) }, div >
            );
        }
        div >
        ;
    }
    div >
    ;
}
{
    validationResult.warnings.length > 0 && ()
        < div;
    className = "validation-warnings" >
        _jsxs("h6", { children: ["Warnings (", validationResult.warnings.length, ")"] });
    {
        validationResult.warnings.map((warning, index) => ()
            < div, key = { index }, className = "validation-warning" >
            _jsxs("strong", { children: [warning.path, ":"] }), { warning, : .message }, { warning, : .suggestion && ()
                < div, className = "warning-suggestion" >
                Suggestion }, { warning, : .suggestion }, div >
        );
    }
    div >
    ;
}
div >
;
_jsxs("div", { className: "validation-performance", children: [_jsxs("span", { children: ["Validation time: ", validationResult.performance.validationTime.toFixed(2), "ms"] }), _jsxs("span", { children: ["Memory impact: ", (validationResult.performance.memoryImpact / 1024).toFixed(1), "KB"] })] });
div >
;
 >
;
()
    < div;
className = "empty-state" >
    (_jsx("span", { children: "\uD83D\uDCCB" })
        ,
            _jsx("p", { children: "Select a state snapshot to inspect" }));
div >
;
div >
;
div >
    _jsx("style", { jsx: true, children: `
        .inspector-panel {
          height: 100%;
  display: flex;
          flex-direction: column;
  background: var(--devtools-bg, #1e1e1e);
        .inspector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
  padding: 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          background: var(--devtools-section-bg, #252525);
        .domain-selector label {
          display: flex;
          align-items: center;
  gap: 8px;
          font-size: 12px;
  color: var(--devtools-text, #fff);
        .domain-selector select {
          background: var(--devtools-input-bg, #2a2a2a);
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        .search-input {
          background: var(--devtools-input-bg, #2a2a2a);
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 12px;
  width: 200px;
        .search-input::placeholder {,
  color: var(--devtools-text-secondary, #aaa);
        .inspector-content {
          flex: 1;
  display: flex;
          overflow: hidden;
        .history-sidebar {
          width: 300px;
          border-right: 1px solid var(--devtools-border, #333);
          display: flex;
          flex-direction: column;
        .history-sidebar h4 {
          margin: 0;
  padding: 12px;
          font-size: 13px;
  color: var(--devtools-text, #fff);
          border-bottom: 1px solid var(--devtools-border, #333);
          background: var(--devtools-section-bg, #252525);
        .history-list {
          flex: 1;
          overflow-y: auto;
        .history-item {
          padding: 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          cursor: pointer;
  transition: background 0.2s;
        .history-item:hover {,
  background: var(--devtools-hover, #2a2a2a);
        .history-item.selected {
          background: var(--devtools-selected-bg, #2a3a4a);
          border-left: 3px solid var(--devtools-active, #61dafb);
        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        .history-index {
          font-size: 11px;
          font-weight: 600;
  color: var(--devtools-active, #61dafb);
        .history-time {
          font-size: 10px;
  color: var(--devtools-text-secondary, #aaa);
        .history-change {
          display: flex;
          align-items: center;
  gap: 4px;
          margin-bottom: 4px;
        .change-type {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        .change-source {
          font-size: 10px;
  color: var(--devtools-text-secondary, #aaa);
        .history-domain {
          font-size: 11px;
  color: var(--devtools-domain, #f39c12);
          font-weight: 500;
        .state-viewer {
          flex: 1;
  display: flex;
          flex-direction: column;
  overflow: hidden;
        .state-header {
          padding: 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          background: var(--devtools-section-bg, #252525);
        .state-header h4 {
          margin: 0 0 8px 0;
          font-size: 13px;
  color: var(--devtools-text, #fff);
        .state-info {
          display: flex;
  gap: 16px;
          font-size: 11px;
  color: var(--devtools-text-secondary, #aaa);
        .state-content {
          flex: 1;
  overflow: auto;
          padding: 16px;
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
          font-size: 12px;
          line-height: 1.4;
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
  height: 100%;
          color: var(--devtools-text-secondary, #aaa);
          text-align: center;
        .empty-state span {
          font-size: 48px;
          margin-bottom: 16px;
        .clickable {
          cursor: pointer;
          user-select: none;
        .clickable:hover {,
  background: var(--devtools-hover, #2a2a2a);
        .string { color: #98c379; }
        .number { color: #d19a66; }
        .boolean { color: #c678dd; }
        .null, .undefined { color: #5c6370; font-style: italic; }
        .function { color: #61dafb; }
        .array-container,
        .object-container {
          margin-left: 0;
        .array-header,
        .object-header {
          color: var(--devtools-text, #fff);
          font-weight: 500;
  padding: 2px 4px;
          border-radius: 2px;
        .array-items,
        .object-properties {
          margin-left: 16px;
          margin-top: 4px;
          border-left: 1px solid var(--devtools-border, #333);
          padding-left: 12px;
        .array-item,
        .object-property {
          margin: 4px 0;
  display: flex;
          align-items: flex-start;
  gap: 8px;
        .index,
        .property-key {
          color: var(--devtools-text, #fff);
          font-weight: 500;
          min-width: max-content;
        .max-depth {
          color: var(--devtools-text-secondary, #aaa);
          font-style: italic;
        .validation-section {
          border-top: 1px solid var(--devtools-border, #333);
          padding: 16px;
  background: var(--devtools-section-bg, #252525);
        .validation-section h5 {
          margin: 0 0 12px 0;
          font-size: 13px;
  color: var(--devtools-text, #fff);
        .validation-status {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        .validation-status.valid {
          color: #27ae60;
        .validation-status.invalid {
          color: #e74c3c;
        .validation-errors,
        .validation-warnings {
          margin-bottom: 12px;
        .validation-errors h6,
        .validation-warnings h6 {
          margin: 0 0 8px 0;
          font-size: 12px;
  color: var(--devtools-text, #fff);
        .validation-error,
        .validation-warning {
          padding: 8px;
          margin-bottom: 4px;
          border-radius: 4px;
          font-size: 11px;
        .validation-error {
          background: rgba(231, 76, 60, 0.1);
          border-left: 3px solid #e74c3c;
  color: #e74c3c;
        .validation-warning {
          background: rgba(243, 156, 18, 0.1);
          border-left: 3px solid #f39c12;
  color: #f39c12;
        .error-value,
        .warning-suggestion {
          margin-top: 4px;
          font-size: 10px;
  opacity: 0.8;
        .validation-performance {
          display: flex;
  gap: 16px;
          font-size: 10px;
  color: var(--devtools-text-secondary, #aaa);
          padding-top: 8px;
          border-top: 1px solid var(--devtools-border, #333);
      ` });
div >
;
;
;
