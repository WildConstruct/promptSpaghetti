import React from 'react';
import './SimpleMenuBar.css';

export interface SimpleMenuBarProps {
  // File operations
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onSaveAs?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onQuit?: () => void;
  // Edit operations  
  onUndo?: () => void;
  onRedo?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  onFind?: () => void;
  onPreferences?: () => void;
  // View operations
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onToggleGrid?: () => void;
  onToggleMinimap?: () => void;
  onToggleInspector?: () => void;
  onToggleAssetLibrary?: () => void;
  onToggleFullscreen?: () => void;
  onToggleTheme?: () => void;
  // Debug operations
  onDevTools?: () => void;
  onValidateGraph?: () => void;
  onPerformanceMonitor?: () => void;
  onConsoleToggle?: () => void;
  // Help operations
  onDocumentation?: () => void;
  onKeyboardShortcuts?: () => void;
  onAbout?: () => void;
}

export const SimpleMenuBar: React.FC<SimpleMenuBarProps> = (props) => {
  return (
    <div className="simple-menu-bar">
      <div className="menu-section">
        <span className="menu-title">File</span>
        <div className="menu-dropdown">
          <button onClick={props.onNew} className="menu-item">New Graph</button>
          <button onClick={props.onOpen} className="menu-item">Open...</button>
          <div className="menu-separator" />
          <button onClick={props.onSave} className="menu-item">Save</button>
          <button onClick={props.onSaveAs} className="menu-item">Save As...</button>
          <div className="menu-separator" />
          <button onClick={props.onImport} className="menu-item">Import</button>
          <button onClick={props.onExport} className="menu-item">Export</button>
        </div>
      </div>

      <div className="menu-section">
        <span className="menu-title">Edit</span>
        <div className="menu-dropdown">
          <button onClick={props.onUndo} className="menu-item">Undo</button>
          <button onClick={props.onRedo} className="menu-item">Redo</button>
          <div className="menu-separator" />
          <button onClick={props.onSelectAll} className="menu-item">Select All</button>
          <div className="menu-separator" />
          <button onClick={props.onPreferences} className="menu-item">Preferences</button>
        </div>
      </div>

      <div className="menu-section">
        <span className="menu-title">View</span>
        <div className="menu-dropdown">
          <button onClick={props.onZoomIn} className="menu-item">Zoom In</button>
          <button onClick={props.onZoomOut} className="menu-item">Zoom Out</button>
          <button onClick={props.onFitView} className="menu-item">Fit to View</button>
          <div className="menu-separator" />
          <button onClick={props.onToggleGrid} className="menu-item">Toggle Grid</button>
          <button onClick={props.onToggleMinimap} className="menu-item">Toggle Minimap</button>
          <button onClick={props.onToggleAssetLibrary} className="menu-item">Toggle Asset Library</button>
        </div>
      </div>

      <div className="menu-section">
        <span className="menu-title">Help</span>
        <div className="menu-dropdown">
          <button onClick={props.onKeyboardShortcuts} className="menu-item">Keyboard Shortcuts</button>
          <button onClick={props.onAbout} className="menu-item">About</button>
        </div>
      </div>

    </div>
  );
};