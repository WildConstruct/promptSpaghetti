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
  onChangelog?: () => void;
  onAbout?: () => void;
}

export const SimpleMenuBar: React.FC<SimpleMenuBarProps> = props => {
  const showImportItem = Boolean(
    props.onImport && props.onImport !== props.onOpen
  );
  const fileItems = [
    props.onNew ? 'new' : null,
    props.onOpen ? 'open' : null,
    props.onSave ? 'save' : null,
    props.onSaveAs ? 'saveAs' : null,
    showImportItem ? 'import' : null,
    props.onExport ? 'export' : null,
    props.onQuit ? 'quit' : null
  ].filter(Boolean);
  const hasFileItems = fileItems.length > 0;
  const hasEditItems = Boolean(
    props.onUndo ||
      props.onRedo ||
      props.onCopy ||
      props.onPaste ||
      props.onCut ||
      props.onSelectAll ||
      props.onFind ||
      props.onPreferences
  );
  const hasViewItems = Boolean(
    props.onZoomIn ||
      props.onZoomOut ||
      props.onFitView ||
      props.onToggleGrid ||
      props.onToggleMinimap ||
      props.onToggleInspector ||
      props.onToggleAssetLibrary ||
      props.onToggleFullscreen ||
      props.onToggleTheme
  );
  const hasHelpItems = Boolean(
    props.onDocumentation ||
      props.onKeyboardShortcuts ||
      props.onChangelog ||
      props.onAbout
  );

  return (
    <div className="simple-menu-bar">
      {hasFileItems && (
        <div className="menu-section">
          <span className="menu-title">File</span>
          <div className="menu-dropdown">
            {props.onNew && (
              <button onClick={props.onNew} className="menu-item">
                New Document
              </button>
            )}
            {props.onOpen && (
              <button onClick={props.onOpen} className="menu-item">
                Open PSG...
              </button>
            )}
            {(props.onSave || props.onSaveAs) &&
              (props.onNew || props.onOpen) && (
                <div className="menu-separator" />
              )}
            {props.onSave && (
              <button onClick={props.onSave} className="menu-item">
                Save
              </button>
            )}
            {props.onSaveAs && (
              <button onClick={props.onSaveAs} className="menu-item">
                Save PSG As...
              </button>
            )}
            {(showImportItem || props.onExport) &&
              (props.onSave || props.onSaveAs) && (
                <div className="menu-separator" />
              )}
            {showImportItem && (
              <button onClick={props.onImport} className="menu-item">
                Open Local PSG...
              </button>
            )}
            {props.onExport && (
              <button onClick={props.onExport} className="menu-item">
                Export PSG
              </button>
            )}
            {props.onQuit &&
              (props.onNew ||
                props.onOpen ||
                props.onSave ||
                props.onSaveAs ||
                showImportItem ||
                props.onExport) && <div className="menu-separator" />}
            {props.onQuit && (
              <button onClick={props.onQuit} className="menu-item">
                Quit
              </button>
            )}
          </div>
        </div>
      )}

      {hasEditItems && (
        <div className="menu-section">
          <span className="menu-title">Edit</span>
          <div className="menu-dropdown">
            {props.onUndo && (
              <button onClick={props.onUndo} className="menu-item">
                Undo
              </button>
            )}
            {props.onRedo && (
              <button onClick={props.onRedo} className="menu-item">
                Redo
              </button>
            )}
            {(props.onCopy || props.onPaste || props.onCut) &&
              (props.onUndo || props.onRedo) && (
                <div className="menu-separator" />
              )}
            {props.onCut && (
              <button onClick={props.onCut} className="menu-item">
                Cut
              </button>
            )}
            {props.onCopy && (
              <button onClick={props.onCopy} className="menu-item">
                Copy
              </button>
            )}
            {props.onPaste && (
              <button onClick={props.onPaste} className="menu-item">
                Paste
              </button>
            )}
            {props.onSelectAll && (
              <>
                {(props.onCopy || props.onPaste || props.onCut) && (
                  <div className="menu-separator" />
                )}
                <button onClick={props.onSelectAll} className="menu-item">
                  Select All
                </button>
              </>
            )}
            {props.onFind && (
              <button onClick={props.onFind} className="menu-item">
                Find
              </button>
            )}
            {props.onPreferences && (
              <>
                {(props.onSelectAll || props.onFind) && (
                  <div className="menu-separator" />
                )}
                <button onClick={props.onPreferences} className="menu-item">
                  Add Prompt to Graph
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {hasViewItems && (
        <div className="menu-section">
          <span className="menu-title">View</span>
          <div className="menu-dropdown">
            {props.onZoomIn && (
              <button onClick={props.onZoomIn} className="menu-item">
                Zoom In
              </button>
            )}
            {props.onZoomOut && (
              <button onClick={props.onZoomOut} className="menu-item">
                Zoom Out
              </button>
            )}
            {props.onFitView && (
              <button onClick={props.onFitView} className="menu-item">
                Fit to View
              </button>
            )}
            {(props.onToggleGrid ||
              props.onToggleMinimap ||
              props.onToggleInspector ||
              props.onToggleAssetLibrary ||
              props.onToggleFullscreen ||
              props.onToggleTheme) &&
              (props.onZoomIn || props.onZoomOut || props.onFitView) && (
                <div className="menu-separator" />
              )}
            {props.onToggleGrid && (
              <button onClick={props.onToggleGrid} className="menu-item">
                Toggle Grid
              </button>
            )}
            {props.onToggleMinimap && (
              <button onClick={props.onToggleMinimap} className="menu-item">
                Toggle Minimap
              </button>
            )}
            {props.onToggleInspector && (
              <button onClick={props.onToggleInspector} className="menu-item">
                Toggle Inspector
              </button>
            )}
            {props.onToggleAssetLibrary && (
              <button
                onClick={props.onToggleAssetLibrary}
                className="menu-item"
              >
                Toggle Asset Library
              </button>
            )}
            {props.onToggleFullscreen && (
              <button onClick={props.onToggleFullscreen} className="menu-item">
                Toggle Fullscreen
              </button>
            )}
            {props.onToggleTheme && (
              <button onClick={props.onToggleTheme} className="menu-item">
                Toggle Theme
              </button>
            )}
          </div>
        </div>
      )}

      {hasHelpItems && (
        <div className="menu-section">
          <span className="menu-title">Help</span>
          <div className="menu-dropdown">
            {props.onDocumentation && (
              <button onClick={props.onDocumentation} className="menu-item">
                Prompt to Graph Draft
              </button>
            )}
            {props.onKeyboardShortcuts && (
              <button onClick={props.onKeyboardShortcuts} className="menu-item">
                Keyboard Shortcuts
              </button>
            )}
            {props.onChangelog && (
              <button onClick={props.onChangelog} className="menu-item">
                What&apos;s New
              </button>
            )}
            {props.onAbout &&
              (props.onDocumentation ||
                props.onKeyboardShortcuts ||
                props.onChangelog) && <div className="menu-separator" />}
            {props.onAbout && (
              <button onClick={props.onAbout} className="menu-item">
                About
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
