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
import React, { useState, useCallback, useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import { RealTimePreviewIntegration } from '../RealTimePreview/RealTimePreviewIntegration';
import { PreviewVariant } from '../../hooks/useRealTimePreview';
interface DirectorPreviewToolbarProps {
  nodes: Node;
  edges: Edge;
  // Preview state
  isPreviewOpen: boolean;
  onPreviewToggle: () => void;
  // Graph highlighting
  onHighlightPath?: (nodeIds: string, edgeIds: string) => void;
  // Director preferences
  className?: string;
  compactMode?: boolean;
  export const DirectorPreviewToolbar: React.FC<DirectorPreviewToolbarProps> = ({,)
  nodes,
  edges,
  isPreviewOpen,
  onPreviewToggle,
  onHighlightPath,
  className = '',
  compactMode = false
}) => {
  // State for director controls
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [previewCount, setPreviewCount] = useState(3);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showVarianceAnalysis, setShowVarianceAnalysis] = useState(true);
  const [currentVariants, setCurrentVariants] = useState<PreviewVariant>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  // Handle preview updates from real-time system
  const handlePreviewUpdate = useCallback((variants: PreviewVariant) => {,
  setCurrentVariants(variants);
  setLastError(null); // Clear errors on successful update
}, []);
  // Handle errors from preview system
  const handlePreviewError = useCallback((error: string) => {
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
  const getPerformanceColor = (time: number) => {
    if (time < 500) return '#0f0'; // Green - Fast
    if (time < 1000) return '#ff0'; // Yellow - Moderate  
    return '#f00'; // Red - Slow
  };
  return;
    <div className={`director-preview-toolbar ${className}`}>}
      {/* Main Toolbar */}
      <div className={`toolbar-main ${compactMode ? 'compact' : 'expanded'}`}>}
        {/* Preview Controls Section */}
        <div className="toolbar-section preview-controls">
          <div className="section-title">
            <span className="section-icon">🎬</span>
            <span className="section-label">Director Preview</span>
          </div>
          <div className="controls-row">
            {/* Main Preview Button */}
            <button
              className={`preview-btn ${isPreviewOpen ? 'active' : ''}`}
              onClick={onPreviewToggle}
              title="Toggle Preview Modal"
            >
              <span className="btn-icon">📺</span>
              <span className="btn-label">Preview</span>
            </button>
            {/* Real-time Toggle */}
            <label className="toggle-control">
              <input
                type="checkbox"
                checked={realTimeEnabled}
                onChange={(e) => setRealTimeEnabled(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">Live</span>
            </label>
            {/* Preview Count Selector */}
            <div className="count-selector">
              <label htmlFor="preview-count">Variants:</label>
              <select
                id="preview-count"
                value={previewCount}
                onChange={(e) => setPreviewCount(Number(e.target.value))}
                className="count-select"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={8}>8</option>
              </select>
            </div>
          </div>
        </div>
        {/* Performance Metrics Section */}
        <div className="toolbar-section performance-metrics">
          <div className="section-title">
            <span className="section-icon">⚡</span>
            <span className="section-label">Performance</span>
          </div>
          <div className="metrics-row">
            <div className="metric">
              <span className="metric-value">{graphMetrics.nodeCount}</span>
              <span className="metric-label">Nodes</span>
            </div>
            <div className="metric">
              <span className="metric-value">{graphMetrics.edgeCount}</span>
              <span className="metric-label">Edges</span>
            </div>
            <div className="metric">
              <span 
                className="metric-value"
                style={{ color: getPerformanceColor(graphMetrics.estimatedTime) }}
              >
                {graphMetrics.estimatedTime}ms
              </span>
              <span className="metric-label">Est. Time</span>
            </div>
            <div className="metric">
              <span className="metric-value">{currentVariants.length}</span>
              <span className="metric-label">Ready</span>
            </div>
          </div>
        </div>
        {/* Advanced Settings */}
        {!compactMode && ()
          <div className="toolbar-section advanced-settings">
            <div className="section-title">
              <span className="section-icon">⚙️</span>
              <span className="section-label">Settings</span>
            </div>
            <div className="settings-row">
              <label className="setting-control">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span>Auto-refresh</span>
              </label>
              <label className="setting-control">
                <input
                  type="checkbox"
                  checked={showVarianceAnalysis}
                  onChange={(e) => setShowVarianceAnalysis(e.target.checked)}
                />
                <span>Variance Analysis</span>
              </label>
              {/* Epic 7.3 - Advanced Settings Button */}
              <button
                onClick={() => {
  // Trigger Alt+S keyboard shortcut to open settings modal
  const event = new KeyboardEvent('keydown', {)
  key: 's',
  altKey: true,
  bubbles: true,
});
                  document.dispatchEvent(event);
                }}
                className="setting-control"
                style={{
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
}}
                title="Open Advanced Settings (Alt+S)"
              >
                <span>⚙️</span>
                <span>Advanced</span>
              </button>
            </div>
          </div>
        )}
        {/* Error Display */}
        {lastError && ()
          <div className="toolbar-section error-section">
            <div className="error-display">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{lastError}</span>
              <button 
                className="error-dismiss"
                onClick={() => setLastError(null)}
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Real-time Preview Integration */}
      {realTimeEnabled && ()
        <RealTimePreviewIntegration
          nodes={nodes}
          edges={edges}
          enableRealTime={realTimeEnabled}
          previewCount={previewCount}
          autoRefresh={autoRefresh}
          showVarianceAnalysis={showVarianceAnalysis}
          onPreviewUpdate={handlePreviewUpdate}
          onHighlightPath={onHighlightPath}
          onError={handlePreviewError}
        />
      )}
      <style>{`
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
      `}</style>
    </div>
  );
};

export default DirectorPreviewToolbar;