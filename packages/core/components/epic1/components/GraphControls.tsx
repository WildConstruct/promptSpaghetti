import React from 'react';
import './GraphControls.css';
import { useNeatenSettings } from '../contexts/NeatenSettingsContext';
import { Panel } from 'reactflow';
import { NodePalette } from '../NodePalette';
import { NodeToolbar } from '../NodeToolbar';
import { ConsentService } from '../../../services/consent';

const isBrowser = typeof window !== 'undefined';

const readBooleanSetting = (key: string, fallback: boolean): boolean => {
  if (!isBrowser || !window.localStorage) {
    return fallback;
  }
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? fallback : stored === 'true';
  } catch (error) {
    console.warn(`[GraphControls] Failed to read ${key}`, error);
    return fallback;
  }
};

const writeBooleanSetting = (key: string, value: boolean): void => {
  if (!isBrowser || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(key, String(value));
  } catch (error) {
    console.warn(`[GraphControls] Failed to write ${key}`, error);
  }
};

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
  onDisconnectSelection,
  onDownloadGraph,
  onShowHistory,

}) => {
  const { gridSize, rowSnap, setGridSize, setRowSnap } = useNeatenSettings();
  const [showSettings, setShowSettings] = React.useState(false);
  const [requireConsent, setRequireConsent] = React.useState(
    () => ConsentService.getSettings().requireConsent
  );
  const [smartMode, setSmartMode] = React.useState<boolean>(() =>
    readBooleanSetting('smartMode.enabled', true)
  );
  const [buildTreeMode, setBuildTreeMode] = React.useState<boolean>(() =>
    readBooleanSetting('buildTree.enabled', false)
  );
  const [advancedMatching, setAdvancedMatching] = React.useState<boolean>(() =>
    readBooleanSetting('advancedMatching.enabled', false)
  );
  const [consistencyEnabled, setConsistencyEnabled] = React.useState<boolean>(() =>
    readBooleanSetting('consistency.enabled', true)
  );

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
    writeBooleanSetting('smartMode.enabled', val);
  }, []);

  const onToggleBuildTree = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setBuildTreeMode(val);
    writeBooleanSetting('buildTree.enabled', val);
  }, []);

  const onToggleAdvancedMatching = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setAdvancedMatching(val);
    writeBooleanSetting('advancedMatching.enabled', val);
  }, []);

  const onToggleConsistency = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setConsistencyEnabled(val);
    writeBooleanSetting('consistency.enabled', val);
  }, []);

  // Files test UI state
  const [supabaseToken, setSupabaseToken] = React.useState<string>('');
  const [fileName, setFileName] = React.useState<string>('example.json');
  const [fileContent, setFileContent] = React.useState<string>('{}');
  const [filesResult, setFilesResult] = React.useState<string>('');

  const filesFetch = React.useCallback(async (method: 'LIST' | 'UPLOAD' | 'DOWNLOAD' | 'DELETE') => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (supabaseToken) {headers['Authorization'] = `Bearer ${supabaseToken}`;}
      if (method === 'LIST') {
        const res = await fetch('/api/files/list', { headers });
        const text = await res.text();
        setFilesResult(`${res.status}: ${text}`);
        return;
      }
      if (method === 'UPLOAD') {
        const res = await fetch('/api/files/upload', { method: 'POST', headers, body: JSON.stringify({ filename: fileName, content: fileContent }) });
        const text = await res.text();
        setFilesResult(`${res.status}: ${text}`);
        return;
      }
      if (method === 'DOWNLOAD') {
        const res = await fetch(`/api/files/download?filename=${encodeURIComponent(fileName)}`, { headers });
        const text = await res.text();
        setFilesResult(`${res.status}: ${text}`);
        return;
      }
      if (method === 'DELETE') {
        const res = await fetch('/api/files/delete', { method: 'DELETE', headers, body: JSON.stringify({ filename: fileName }) });
        const text = await res.text();
        setFilesResult(`${res.status}: ${text}`);
        return;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setFilesResult(`error: ${message}`);
    }
  }, [supabaseToken, fileName, fileContent]);

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
              className="epic1-download-button epic1-ml-8"
              onClick={onDownloadGraph}
              title="Download JSON"
            >
              Download JSON
            </button>
          )}
          {onShowHistory && (
            <button
              className="epic1-history-button epic1-ml-8"
              onClick={onShowHistory}
              title="History"
            >
              History
            </button>
          )}
          {onUndoLast && (
            <button 
              className="epic1-undo-button epic1-ml-8"
              onClick={onUndoLast}
            >
              Undo Last
            </button>
          )}
          <button
            className="epic1-settings-button epic1-ml-8"
            onClick={toggleSettings}
            title="File → Settings"
          >
            Settings
          </button>
        </div>
        {showSettings && (
          <div className="epic1-settings-popover">
            <label className="epic1-checkbox">
              <input type="checkbox" checked={requireConsent} onChange={onToggleConsent} />
              <span>Require consent for assets</span>
            </label>
            <label className="epic1-checkbox epic1-mt-6">
              <input type="checkbox" checked={smartMode} onChange={onToggleSmartMode} />
              <span>Smart Suggestions (Smart Mode)</span>
            </label>
            <label className="epic1-checkbox epic1-mt-6">
              <input type="checkbox" checked={buildTreeMode} onChange={onToggleBuildTree} />
              <span>Build Tree mode (empty drop expands template)</span>
            </label>
            <label className="epic1-checkbox epic1-mt-6">
              <input type="checkbox" checked={advancedMatching} onChange={onToggleAdvancedMatching} />
              <span>Advanced Matching (ML Scoring)</span>
            </label>
            <label className="epic1-checkbox epic1-mt-6">
              <input type="checkbox" checked={consistencyEnabled} onChange={onToggleConsistency} />
              <span>Consistency checks</span>
            </label>
            <div className="epic1-section">
              <div className="epic1-section-title">Batch Operations</div>
              <div className="epic1-row">
                {onApplyMetadataToSelection && (
                  <button onClick={onApplyMetadataToSelection}>Apply metadata to selection</button>
                )}
                {onDisconnectSelection && (
                  <button onClick={onDisconnectSelection}>Disconnect selected nodes</button>
                )}
              </div>
            </div>
            <div className="epic1-section">
              <div className="epic1-section-title">Neaten Settings</div>
              <div className="epic1-row">
                <label className="epic1-checkbox">
                  <span className="epic1-small-muted">Grid</span>
                  <input className="epic1-input-number" type="number" min={5} max={200} value={gridSize} onChange={(e) => setGridSize(Number(e.target.value) || 20)} />
                </label>
                <label className="epic1-checkbox">
                  <span className="epic1-small-muted">Row</span>
                  <input className="epic1-input-number" type="number" min={10} max={300} value={rowSnap} onChange={(e) => setRowSnap(Number(e.target.value) || 40)} />
                </label>
                <span className="epic1-note">(snap spacing in px)</span>
              </div>
            </div>
            {!process.env.NODE_ENV?.includes('prod') && (
            <div className="epic1-section">
              <div className="epic1-section-title">Files (test)</div>
              <div className="epic1-col">
                <input className="epic1-textarea"
                  placeholder="Supabase JWT (Bearer)"
                  value={supabaseToken}
                  onChange={(e) => setSupabaseToken(e.target.value)}
                />
                <div className="epic1-row">
                  <input className="epic1-input-text"
                    placeholder="filename.json"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                  <button onClick={() => filesFetch('LIST')}>List</button>
                  <button onClick={() => filesFetch('DOWNLOAD')}>Download</button>
                  <button onClick={() => filesFetch('DELETE')}>Delete</button>
                </div>
                <textarea className="epic1-textarea"
                  placeholder="{ } content for upload"
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  rows={4}
                />
                <div>
                  <button onClick={() => filesFetch('UPLOAD')}>Upload</button>
                </div>
                <pre className="epic1-pre">{filesResult}</pre>
                <div className="epic1-note">
                  Note: Server requires Supabase JWT via Authorization header; set bucket with SUPABASE_BUCKET.
                </div>
              </div>
            </div>
            )}
            <div className="epic1-settings-note">Adjust later via File → Settings</div>
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



