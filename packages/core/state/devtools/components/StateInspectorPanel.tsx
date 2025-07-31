/**
 * State Inspector Panel Component
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - State Inspection UI
 */
import React, { useState, useEffect } from 'react';
import { StateDevTools, StateValidationResult } from '../StateDevTools';

}
export interface StateInspectorPanelProps {
  devTools: StateDevTools;
  selectedDomain: string;
  onDomainChange: (domain: string) => void;
}
}
export const StateInspectorPanel: React.FC<StateInspectorPanelProps> = ({)
  devTools,
  selectedDomain,
  onDomainChange
}) => {
  const [stateHistory, setStateHistory] = useState<any>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<StateValidationResult | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [searchFilter, setSearchFilter] = useState('');
  useEffect(() => {
  const history = devTools.getStateHistory();
  const filteredHistory = selectedDomain === 'all' ;
  ? history
  : history.filter(snapshot => snapshot.metadata?.domain === selectedDomain);
  setStateHistory(filteredHistory);
  if (filteredHistory.length > 0 && !selectedSnapshot) {
  setSelectedSnapshot(filteredHistory[filteredHistory.length - 1]);
}, [devTools, selectedDomain, selectedSnapshot]);
  const handleSnapshotSelect = (snapshot: any) => {
  setSelectedSnapshot(snapshot);
  // Validate the selected state
  if (snapshot.metadata?.domain) {
  const validation = devTools.validateStateIntegrity(;);
  snapshot.state,
  snapshot.metadata.domain,
  {
  deep: true,
  checkReferences: true,
  validateSchema: true,
  checkMemoryLeaks: true);
  setValidationResult(validation);
};
  const togglePath = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    setExpandedPaths(newExpanded);
  };
  const renderValue = (value: any, path: string = '', depth: number = 0): React.ReactNode => {
    if (depth > 10) return <span className="max-depth">...</span>;
    if (value === null) return <span className="null">null</span>;
    if (value === undefined) return <span className="undefined">undefined</span>;
    const type = typeof value;
    if (type === 'string') {
      const truncated = value.length > 100 ? value.substring(0, 100) + '...' : value;
      return <span className="string">"{truncated}"</span>;
    if (type === 'number') {
      return <span className="number">{value}</span>;
    if (type === 'boolean') {
      return <span className="boolean">{String(value)}</span>;
    if (type === 'function') {
      return <span className="function">ƒ {value.name || 'anonymous'}</span>;
    if (Array.isArray(value)) {
      const isExpanded = expandedPaths.has(path);
      return;
        <div className="array-container">
          <span
            className="array-header clickable"
            onClick={() => togglePath(path)}
          >
            {isExpanded ? '▼' : '▶'} Array({value.length})
          </span>
          {isExpanded && ()
            <div className="array-items">
              {value.map((item, index) => ()
                <div key={index} className="array-item">
                  <span className="index">[{index}]:</span>
                  {renderValue(item, `${path}[${index}]`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    if (type === 'object') {
      const keys = Object.keys(value);
      const isExpanded = expandedPaths.has(path);
      return;
        <div className="object-container">
          <span
            className="object-header clickable"
            onClick={() => togglePath(path)}
          >
            {isExpanded ? '▼' : '▶'} Object({keys.length})
          </span>
          {isExpanded && ()
            <div className="object-properties">
              {keys.map(key => {)
  const propertyPath = path ? `${path}.${key}` : key;}
                const shouldShow = !searchFilter || ;
                  key.toLowerCase().includes(searchFilter.toLowerCase()) ||
                  JSON.stringify(value[key]).toLowerCase().includes(searchFilter.toLowerCase());
                if (!shouldShow) return null;
                return;
                  <div key={key} className="object-property">
                    <span className="property-key">{key}:</span>
                    {renderValue(value[key], propertyPath, depth + 1)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    return <span className="unknown">{String(value)}</span>;
  };
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  const getChangeTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
  case 'create': return '#27ae60';
  case 'update': return '#3498db';
  case 'delete': return '#e74c3c';
  case 'restore': return '#f39c12';
  default: return '#95a5a6';
};
  return;
    <div className="inspector-panel">
      {/* Header */}
      <div className="inspector-header">
        <div className="domain-selector">
          <label>
            Domain:
            <select value={selectedDomain} onChange={(e) => onDomainChange(e.target.value)}>
              <option value="all">All Domains</option>
              {[...new Set(stateHistory.map(snapshot => snapshot.metadata?.domain))].map(domain => ()
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search state..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      <div className="inspector-content">
        {/* History Sidebar */}
        <div className="history-sidebar">
          <h4>State History</h4>
          <div className="history-list">
            {stateHistory.map((snapshot, index) => ()
              <div
                key={snapshot.id}
                className={`history-item ${selectedSnapshot?.id === snapshot.id ? 'selected' : ''}`}
                onClick={() => handleSnapshotSelect(snapshot)}
              >
                <div className="history-header">
                  <span className="history-index">#{index + 1}</span>
                  <span className="history-time">
                    {formatTimestamp(snapshot.timestamp)}
                  </span>
                </div>
                {snapshot.change && ()
                  <div className="history-change">
                    <span
                      className="change-type"
                      style={{ color: getChangeTypeColor(snapshot.change.type) }}
                    >
                      {snapshot.change.type}
                    </span>
                    <span className="change-source">
                      ({snapshot.change.source})
                    </span>
                  </div>
                )}
                <div className="history-domain">
                  {snapshot.metadata?.domain}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* State Viewer */}
        <div className="state-viewer">
          {selectedSnapshot ? ()
            <>
              <div className="state-header">
                <h4>State Inspector</h4>
                <div className="state-info">
                  <span>Domain: {selectedSnapshot.metadata?.domain}</span>
                  <span>Time: {formatTimestamp(selectedSnapshot.timestamp)}</span>
                  {selectedSnapshot.change && ()
                    <span>Change: {selectedSnapshot.change.type}</span>
                  )}
                </div>
              </div>
              <div className="state-content">
                {renderValue(selectedSnapshot.state, 'root')}
              </div>
              {/* Validation Results */}
              {validationResult && ()
                <div className="validation-section">
                  <h5>Validation Results</h5>
                  <div className={`validation-status ${validationResult.valid ? 'valid' : 'invalid'}`}>}
                    {validationResult.valid ? '✅ Valid' : '❌ Invalid'}
                  </div>
                  {validationResult.errors.length > 0 && ()
                    <div className="validation-errors">
                      <h6>Errors ({validationResult.errors.length})</h6>
                      {validationResult.errors.map((error, index) => ()
                        <div key={index} className="validation-error">
                          <strong>{error.field}:</strong> {error.message}
                          {error.value && ()
                            <div className="error-value">
                              Value: {JSON.stringify(error.value)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {validationResult.warnings.length > 0 && ()
                    <div className="validation-warnings">
                      <h6>Warnings ({validationResult.warnings.length})</h6>
                      {validationResult.warnings.map((warning, index) => ()
                        <div key={index} className="validation-warning">
                          <strong>{warning.path}:</strong> {warning.message}
                          {warning.suggestion && ()
                            <div className="warning-suggestion">
                              Suggestion: {warning.suggestion}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="validation-performance">
                    <span>Validation time: {validationResult.performance.validationTime.toFixed(2)}ms</span>
                    <span>Memory impact: {(validationResult.performance.memoryImpact / 1024).toFixed(1)}KB</span>
                  </div>
                </div>
              )}
            </>
          ) : ()
            <div className="empty-state">
              <span>📋</span>
              <p>Select a state snapshot to inspect</p>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
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
      `}</style>
    </div>
  );
};