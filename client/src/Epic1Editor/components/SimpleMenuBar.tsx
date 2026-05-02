import React from 'react';
import './SimpleMenuBar.css';

export type MenuAvailability = 'available' | 'hosted_only' | 'disabled';
export type MenuTone = 'core' | 'advanced';
export type MenuSectionId = 'file' | 'edit' | 'view' | 'help';

export interface MenuActionModel {
  type: 'action';
  id: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  availability?: MenuAvailability;
  tone?: MenuTone;
  title?: string;
}

export interface MenuLabelModel {
  type: 'label';
  id: string;
  label: string;
  tone?: MenuTone;
}

export interface MenuDividerModel {
  type: 'divider';
  id: string;
}

export type MenuEntryModel =
  | MenuActionModel
  | MenuLabelModel
  | MenuDividerModel;

export interface MenuSectionModel {
  id: MenuSectionId;
  title: string;
  items: MenuEntryModel[];
}

export interface MenuModel {
  sections: MenuSectionModel[];
}

export interface SimpleMenuBarProps {
  menuModel?: MenuModel;
  // File operations
  onBackToLaunch?: () => void;
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onSaveAs?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onExportComfy?: () => void;
  onPsgSceneAssets?: () => void;
  onLocalSandboxGeneration?: () => void;
  onExpandCrowd?: () => void;
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
  onReportBug?: () => void;
  onChangelog?: () => void;
  onAbout?: () => void;
}

const hasActionEntries = (items: MenuEntryModel[]): boolean =>
  items.some(item => item.type === 'action');

const buildLegacyMenuModel = (props: SimpleMenuBarProps): MenuModel => {
  const showImportItem = Boolean(
    props.onImport && props.onImport !== props.onOpen
  );

  const fileItems: MenuEntryModel[] = [];
  if (props.onBackToLaunch) {
    fileItems.push({
      type: 'action',
      id: 'backToLaunch',
      label: 'Back to Launch',
      onClick: props.onBackToLaunch
    });
  }
  if (props.onNew) {
    if (fileItems.length > 0) {
      fileItems.push({ type: 'divider', id: 'file-after-launch' });
    }
    fileItems.push({
      type: 'action',
      id: 'new',
      label: 'New Document',
      onClick: props.onNew
    });
  }
  if (props.onOpen) {
    fileItems.push({
      type: 'action',
      id: 'open',
      label: 'Open PSG...',
      onClick: props.onOpen
    });
  }
  if ((props.onSave || props.onSaveAs) && fileItems.length > 0) {
    fileItems.push({ type: 'divider', id: 'file-before-save' });
  }
  if (props.onSave) {
    fileItems.push({
      type: 'action',
      id: 'save',
      label: 'Save',
      onClick: props.onSave
    });
  }
  if (props.onSaveAs) {
    fileItems.push({
      type: 'action',
      id: 'saveAs',
      label: 'Save PSG As...',
      onClick: props.onSaveAs
    });
  }
  const exportItems: MenuEntryModel[] = [];
  if (showImportItem) {
    exportItems.push({
      type: 'action',
      id: 'import',
      label: 'Open Local PSG...',
      onClick: props.onImport
    });
  }
  if (props.onExport) {
    exportItems.push({
      type: 'action',
      id: 'export',
      label: 'Export PSG...',
      onClick: props.onExport
    });
  }
  const advancedExportItems: MenuEntryModel[] = [];
  if (props.onExportComfy) {
    advancedExportItems.push({
      type: 'label',
      id: 'handoff-label',
      label: 'Primary handoff',
      tone: 'core'
    });
    advancedExportItems.push({
      type: 'action',
      id: 'exportComfy',
      label: 'Export For Comfy...',
      onClick: props.onExportComfy,
      tone: 'core'
    });
  }
  if (
    props.onPsgSceneAssets ||
    props.onLocalSandboxGeneration ||
    props.onExpandCrowd
  ) {
    advancedExportItems.push({
      type: 'label',
      id: 'advanced-label',
      label: 'Advanced / hosted',
      tone: 'advanced'
    });
  }
  if (props.onPsgSceneAssets) {
    advancedExportItems.push({
      type: 'action',
      id: 'psgSceneAssets',
      label: 'Advanced PSG Scene Assets...',
      onClick: props.onPsgSceneAssets,
      tone: 'advanced'
    });
  }
  if (props.onLocalSandboxGeneration) {
    advancedExportItems.push({
      type: 'action',
      id: 'localSandboxGeneration',
      label: 'Local Sandbox Generation (Local Only)...',
      onClick: props.onLocalSandboxGeneration,
      availability: 'disabled',
      tone: 'advanced'
    });
  }
  if (props.onExpandCrowd) {
    advancedExportItems.push({
      type: 'action',
      id: 'expandCrowd',
      label: 'Hosted Crowd Expansion (Cloud)...',
      onClick: props.onExpandCrowd,
      availability: 'hosted_only',
      tone: 'advanced'
    });
  }
  if (exportItems.length > 0 && fileItems.length > 0) {
    fileItems.push({ type: 'divider', id: 'file-before-export' });
  }
  fileItems.push(...exportItems);
  if (advancedExportItems.length > 0 && fileItems.length > 0) {
    fileItems.push({ type: 'divider', id: 'file-before-advanced' });
  }
  fileItems.push(...advancedExportItems);
  if (props.onQuit && fileItems.length > 0) {
    fileItems.push({ type: 'divider', id: 'file-before-quit' });
  }
  if (props.onQuit) {
    fileItems.push({
      type: 'action',
      id: 'quit',
      label: 'Quit',
      onClick: props.onQuit
    });
  }

  const editItems: MenuEntryModel[] = [];
  if (props.onUndo) {
    editItems.push({
      type: 'action',
      id: 'undo',
      label: 'Undo',
      onClick: props.onUndo
    });
  }
  if (props.onRedo) {
    editItems.push({
      type: 'action',
      id: 'redo',
      label: 'Redo',
      onClick: props.onRedo
    });
  }
  if ((props.onCopy || props.onPaste || props.onCut) && editItems.length > 0) {
    editItems.push({ type: 'divider', id: 'edit-before-clipboard' });
  }
  if (props.onCut) {
    editItems.push({
      type: 'action',
      id: 'cut',
      label: 'Cut',
      onClick: props.onCut
    });
  }
  if (props.onCopy) {
    editItems.push({
      type: 'action',
      id: 'copy',
      label: 'Copy',
      onClick: props.onCopy
    });
  }
  if (props.onPaste) {
    editItems.push({
      type: 'action',
      id: 'paste',
      label: 'Paste',
      onClick: props.onPaste
    });
  }
  if (props.onSelectAll) {
    if (editItems.length > 0) {
      editItems.push({ type: 'divider', id: 'edit-before-select-all' });
    }
    editItems.push({
      type: 'action',
      id: 'selectAll',
      label: 'Select All',
      onClick: props.onSelectAll
    });
  }
  if (props.onFind) {
    editItems.push({
      type: 'action',
      id: 'find',
      label: 'Find',
      onClick: props.onFind
    });
  }
  if (props.onPreferences) {
    if (props.onSelectAll || props.onFind) {
      editItems.push({ type: 'divider', id: 'edit-before-preferences' });
    }
    editItems.push({
      type: 'action',
      id: 'preferences',
      label: 'Add Prompt to Graph',
      onClick: props.onPreferences
    });
  }

  const viewItems: MenuEntryModel[] = [];
  if (props.onZoomIn) {
    viewItems.push({
      type: 'action',
      id: 'zoomIn',
      label: 'Zoom In',
      onClick: props.onZoomIn
    });
  }
  if (props.onZoomOut) {
    viewItems.push({
      type: 'action',
      id: 'zoomOut',
      label: 'Zoom Out',
      onClick: props.onZoomOut
    });
  }
  if (props.onFitView) {
    viewItems.push({
      type: 'action',
      id: 'fitView',
      label: 'Fit to View',
      onClick: props.onFitView
    });
  }
  if (
    (props.onToggleGrid ||
      props.onToggleMinimap ||
      props.onToggleInspector ||
      props.onToggleAssetLibrary ||
      props.onToggleFullscreen ||
      props.onToggleTheme) &&
    viewItems.length > 0
  ) {
    viewItems.push({ type: 'divider', id: 'view-before-toggles' });
  }
  if (props.onToggleGrid) {
    viewItems.push({
      type: 'action',
      id: 'toggleGrid',
      label: 'Toggle Grid',
      onClick: props.onToggleGrid
    });
  }
  if (props.onToggleMinimap) {
    viewItems.push({
      type: 'action',
      id: 'toggleMinimap',
      label: 'Toggle Minimap',
      onClick: props.onToggleMinimap
    });
  }
  if (props.onToggleInspector) {
    viewItems.push({
      type: 'action',
      id: 'toggleInspector',
      label: 'Toggle Inspector',
      onClick: props.onToggleInspector
    });
  }
  if (props.onToggleAssetLibrary) {
    viewItems.push({
      type: 'action',
      id: 'toggleAssetLibrary',
      label: 'Toggle Fragment Library',
      onClick: props.onToggleAssetLibrary
    });
  }
  if (props.onToggleFullscreen) {
    viewItems.push({
      type: 'action',
      id: 'toggleFullscreen',
      label: 'Toggle Fullscreen',
      onClick: props.onToggleFullscreen
    });
  }
  if (props.onToggleTheme) {
    viewItems.push({
      type: 'action',
      id: 'toggleTheme',
      label: 'Toggle Theme',
      onClick: props.onToggleTheme
    });
  }

  const helpItems: MenuEntryModel[] = [];
  if (props.onDocumentation) {
    helpItems.push({
      type: 'action',
      id: 'documentation',
      label: 'Prompt Bootstrap Guide',
      onClick: props.onDocumentation
    });
  }
  if (props.onKeyboardShortcuts) {
    helpItems.push({
      type: 'action',
      id: 'keyboardShortcuts',
      label: 'Keyboard Shortcuts',
      onClick: props.onKeyboardShortcuts
    });
  }
  if (props.onReportBug) {
    helpItems.push({
      type: 'action',
      id: 'reportBug',
      label: 'Report a Bug...',
      onClick: props.onReportBug
    });
  }
  if (props.onChangelog) {
    helpItems.push({
      type: 'action',
      id: 'changelog',
      label: "What's New",
      onClick: props.onChangelog
    });
  }
  if (props.onAbout) {
    if (helpItems.length > 0) {
      helpItems.push({ type: 'divider', id: 'help-before-about' });
    }
    helpItems.push({
      type: 'action',
      id: 'about',
      label: 'About',
      onClick: props.onAbout
    });
  }

  return {
    sections: [
      { id: 'file', title: 'File', items: fileItems },
      { id: 'edit', title: 'Edit', items: editItems },
      { id: 'view', title: 'View', items: viewItems },
      { id: 'help', title: 'Help', items: helpItems }
    ].filter(section => hasActionEntries(section.items))
  };
};

const renderMenuEntry = (item: MenuEntryModel) => {
  if (item.type === 'divider') {
    return <div key={item.id} className="menu-separator" />;
  }

  if (item.type === 'label') {
    return (
      <div
        key={item.id}
        className={`menu-section-label ${item.tone ?? 'core'}`}
      >
        {item.label}
      </div>
    );
  }

  return (
    <button
      key={item.id}
      onClick={item.onClick}
      className={`menu-item ${item.tone === 'advanced' ? 'advanced' : 'core'}`}
      disabled={item.disabled}
      title={item.title}
    >
      {item.label}
    </button>
  );
};

export const SimpleMenuBar: React.FC<SimpleMenuBarProps> = props => {
  const menuModel = props.menuModel ?? buildLegacyMenuModel(props);

  return (
    <div className="simple-menu-bar">
      {menuModel.sections.map(section => (
        <div key={section.id} className="menu-section">
          <span className="menu-title">{section.title}</span>
          <div className="menu-dropdown">
            {section.items.map(renderMenuEntry)}
          </div>
        </div>
      ))}
    </div>
  );
};
