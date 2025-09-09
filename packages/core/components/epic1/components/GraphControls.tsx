import React from 'react';
import { useNeatenSettings } from '../contexts/NeatenSettingsContext';
import { Panel } from 'reactflow';
import { NodePalette } from '../NodePalette';
import { NodeToolbar } from '../NodeToolbar';
import { ConsentService } from '../../../services/consent';

interface GraphControlsProps {
  onTogglePreview: () => void;
  onExecute?: () => void;
  isPreviewVisible: boolean;
  onNodePaletteCollapse: (collapsed: boolean) => void;
  showExecuteButton?: boolean;
  showNodePalette?: boolean;
  showNodeToolbar?: boolean;
  showInstructions?: boolean;
  onUndoLast?: () => void;
  onApplyMetadataToSelection?: () => void;
  onDisconnectSelection?: () => void;
  onDownloadGraph?: () => void;
  onShowHistory?: () => void;
}

/**
 * GraphControls - Manages all control panels and toolbars
 * Consolidates UI controls in one place
 */
export const GraphControls: React.FC<GraphControlsProps> = ({
  onTogglePreview,
  onExecute,
  isPreviewVisible,
  onNodePaletteCollapse,
  showExecuteButton = true,
  showNodePalette = true,
  showNodeToolbar = true,
  showInstructions = true,
  onUndoLast,
  onApplyMetadataToSelection,
  onDownloadGraph,
  onShowHistory,

}) => {
  const [showSettings, setShowSettings] = React.useState(false);
  const [requireConsent, setRequireConsent] = React.useState(
    () => ConsentService.getSettings().requireConsent
  );
  const [smartMode, setSmartMode] = React.useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const s = window.localStorage.getItem('smartMode.enabled');
        return s === null ? true : s === 'true';
      }
    } catch {}
    return true;
  });
  const [buildTreeMode, setBuildTreeMode] = React.useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const s = window.localStorage.getItem('buildTree.enabled');
        return s === null ? false : s === 'true';
      }
    } catch {}
    return false;
  });
  const [advancedMatching, setAdvancedMatching] = React.useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const s = window.localStorage.getItem('advancedMatching.enabled');
        return s === null ? false : s === 'true';
      }
    } catch {}
    return false;
  });
  const [consistencyEnabled, setConsistencyEnabled] = React.useState<boolean>(() => {
    try {
      const s = window.localStorage.getItem('consistency.enabled');
      return s === null ? true : s === 'true';
    } catch {}
    return true;
  });

  const toggleSettings = React.useCallback(() => {
    setShowSettings(s => !s);
  }, []);

  const onToggleConsent = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setRequireConsent(val);
    ConsentService.setRequireConsent(val);
  }, []);

  const onToggleSmartMode = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setSmartMode(val);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('smartMode.enabled', String(val));
      }
    } catch {}
  }, []);

  const onToggleBuildTree = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setBuildTreeMode(val);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('buildTree.enabled', String(val));
      }
    } catch {}
  }, []);

  const onToggleAdvancedMatching = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setAdvancedMatching(val);
    try { window?.localStorage?.setItem('advancedMatching.enabled', String(val)); } catch {}
  }, []);

  const onToggleConsistency = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setConsistencyEnabled(val);
    try { window.localStorage.setItem('consistency.enabled', String(val)); } catch {}
  }, []);

  return (
    <>
      {/* Top-right controls panel */}
      <Panel position="top-right">
        <div className="epic1-controls">
          <button 
            className="epic1-preview-toggle"
            onClick={onTogglePreview}
            title="Toggle preview (P)"
          >
            {isPreviewVisible ? '👁️' : '👁️‍🗨️'}
          </button>
          {showExecuteButton && onExecute && (
            <button 
              className="epic1-execute-button"
              onClick={onExecute}
            >
              Execute Graph
            </button>
          )}
          {onDownloadGraph && (
            <button
              className="epic1-download-button"
              onClick={onDownloadGraph}
              title="Download JSON"
              style={{ marginLeft: 8 }}
            >
              Download JSON
            </button>
          )}
          {onShowHistory && (
            <button
              className="epic1-history-button"
              onClick={onShowHistory}
              title="History"
              style={{ marginLeft: 8 }}
            >
              History
            </button>
          )}
          {onUndoLast && (
            <button 
              className="epic1-undo-button"
              onClick={onUndoLast}
              style={{ marginLeft: 8 }}
            >
              Undo Last
            </button>
          )}
          <button
            className="epic1-settings-button"
            onClick={toggleSettings}
            title="File → Settings"
            style={{ marginLeft: 8 }}
          >
            Settings
          </button>
        </div>
        {showSettings && (
          <div className="epic1-settings-popover" style={{ marginTop: 8, padding: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={requireConsent} onChange={onToggleConsent} />
              <span>Require consent for assets</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <input type="checkbox" checked={smartMode} onChange={onToggleSmartMode} />
              <span>Smart Suggestions (Smart Mode)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <input type="checkbox" checked={buildTreeMode} onChange={onToggleBuildTree} />
              <span>Build Tree mode (empty drop expands template)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <input type="checkbox" checked={advancedMatching} onChange={onToggleAdvancedMatching} />
              <span>Advanced Matching (ML Scoring)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <input type="checkbox" checked={consistencyEnabled} onChange={onToggleConsistency} />
              <span>Consistency checks</span>
            </label>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 8, paddingTop: 8 }}>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Batch Operations</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {onApplyMetadataToSelection && (
                  <button onClick={onApplyMetadataToSelection}>Apply metadata to selection</button>
                )}
                {onDisconnectSelection && (
                  <button onClick={onDisconnectSelection}>Disconnect selected nodes</button>
                )}
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 8, paddingTop: 8 }}>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Neaten Settings</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, opacity: 0.9 }}>Grid</span>
                  <input type="number" min={5} max={200} value={gridSize} onChange={(e) => setGridSize(Number(e.target.value) || 20)} style={{ width: 70, padding: 4, borderRadius: 4, border: '1px solid #444', background: '#111', color: '#fff' }} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, opacity: 0.9 }}>Row</span>
                  <input type="number" min={10} max={300} value={rowSnap} onChange={(e) => setRowSnap(Number(e.target.value) || 40)} style={{ width: 70, padding: 4, borderRadius: 4, border: '1px solid #444', background: '#111', color: '#fff' }} />
                </label>
                <span style={{ fontSize: 11, opacity: 0.7 }}>(snap spacing in px)</span>
              </div>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>Adjust later via File → Settings</div>
          </div>
        )}
      </Panel>

      {/* Bottom instructions panel */}
      {showInstructions && (
        <Panel position="bottom-center">
          <div className="epic1-instructions">
            Click any node to edit • Tab/Shift+Tab to navigate • Enter to confirm • Escape to cancel • Press P for preview • Press ? for help
          </div>
        </Panel>
      )}

      {/* Node creation palette */}
      {showNodePalette && (
        <NodePalette 
          position="left" 
          defaultCollapsed={false} 
          onCollapsedChange={onNodePaletteCollapse}
        />
      )}
      
      {/* Top toolbar */}
      {showNodeToolbar && (
        <NodeToolbar position="top" />
      )}
    </>
  );
};

/**
 * QuickActionBar - Floating action bar for common operations
 * Can be positioned anywhere on the canvas
 */
export const QuickActionBar: React.FC<{
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  actions: Array<{
    icon: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }>;
}> = ({ position = 'top-center', actions }) => {
  return (
    <Panel position={position}>
      <div className="epic1-quick-actions">
        {actions.map((action, index) => (
          <button
            key={index}
            className="epic1-quick-action"
            onClick={action.onClick}
  const { gridSize, rowSnap, setGridSize, setRowSnap } = useNeatenSettings();
            disabled={action.disabled}
            title={action.label}
          >
            <span className="epic1-quick-action-icon">{action.icon}</span>
            <span className="epic1-quick-action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
};



