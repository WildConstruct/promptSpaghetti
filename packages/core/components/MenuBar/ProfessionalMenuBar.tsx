/**
 * Professional Desktop Application Menu Bar
 * Epic 2 Story 2.1: Menu Bar Architecture Implementation
 *
 * Cinema 4D-inspired menu bar with File, Edit, View, Debug, Help sections
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { PSGFile } from '../../projectManager';

export interface MenuBarProps { // File operations
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onSaveAs?: () => void;
  onImport?: () => void;
  onExport?: (format: 'json' | 'png' | 'svg' | 'pdf') => void;
  onRecentFileLoad?: (file: PSGFile) => void;
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
  onToggleFullscreen?: () => void;
  onToggleTheme?: (theme: 'light' | 'dark' | 'cinema') => void;
  // Debug operations
  onDevTools?: () => void;
  onValidateGraph?: () => void;
  onPerformanceMonitor?: () => void;
  onConsoleToggle?: () => void;
  // Help operations
  onDocumentation?: () => void;
  onKeyboardShortcuts?: () => void;
  onAbout?: () => void;
  onSupport?: () => void;
  onReportBug?: () => void;
  // Application state
  canUndo?: boolean;
  canRedo?: boolean;
  hasSelection?: boolean;
  nodes?: Node;
  edges?: Edge;
  theme?: 'light' | 'dark' | 'cinema';
  isFullscreen?: boolean;
  gridVisible?: boolean;
  minimapVisible?: boolean;
  inspectorVisible?: boolean;
  recentFiles?: PSGFile }


interface MenuItemProps { label: string;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
  submenu?: MenuItemProps }


interface MenuProps { label: string;
  items: MenuItemProps;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void }


const professionalColors = {
  text: {
    primary: '#e8e8e8',
    secondary: '#b8b8b8',
    accent: '#ff7c00'
  },
  ui: {
    border: '#404040',
    borderHover: '#5a5a5a',
    borderActive: '#ff7c00',
    hover: '#2d2d2d',
    selection: '#ff7c0040'
  },
  background: {
    primary: '#1a1a1a',
    secondary: '#242424'
  }
};
const MenuItem: React.FC<MenuItemProps> = ({ label,
  shortcut,
  onClick,
  disabled = false,
  divider = false,
  submenu
}) => { const [showSubmenu, setShowSubmenu] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  if (divider) {
  return (
  <div
  style={{
    height: '1px',
    backgroundColor: professionalColors.ui.border,
    margin: '4px 0'
  }}
      />
    );


  const handleClick = useCallback(() => { if (!disabled && onClick) {
      onClick() }
  }, [disabled, onClick]);
  const handleMouseEnter = useCallback(() => { if (submenu) {
      setShowSubmenu(true) }
  }, [submenu]);

  const handleMouseLeave = useCallback(() => { if (submenu) {
      setShowSubmenu(false) }
  }, [submenu]);
  return (
    <div
      ref={itemRef}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? professionalColors.text.secondary : professionalColors.text.primary,
        backgroundColor: showSubmenu ? professionalColors.ui.hover : 'transparent',
        transition: 'background-color 0.15s ease',
        fontSize: '13px',
        fontWeight: 400
      }}

      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseOver={ e => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = professionalColors.ui.hover }
}
      onMouseOut={ e => {
        if (!showSubmenu) {
          e.currentTarget.style.backgroundColor = 'transparent' }

    >
      <span>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        { shortcut && (
          <span
            style={{
              fontSize: '11px',
              color: professionalColors.text.secondary,
              fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace'
            }}

          >
            {shortcut}
          </span>
        )}
        { submenu && (
          <span
            style={{
              fontSize: '10px',
              color: professionalColors.text.secondary
            }}

          >
            ▶
          </span>
        )}
      </div>
      {/* Submenu */}
      { submenu && showSubmenu && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '100%',
            minWidth: '200px',
            backgroundColor: professionalColors.background.secondary,
            border: `1px solid ${professionalColors.ui.border}`,
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1002,
            padding: '4px 0'
          }}

        >
          {submenu.map((item, index) => (
            <MenuItem key={index} {...item} />
          ))}
        </div>
      )}
    </div>
  );
};
const Menu: React.FC<MenuProps> = ({ label, items, isOpen, onToggle, onClose }) => { const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => { }
  if (menuRef.current && !menuRef.current.contains(event.target as Node)) { onClose() }
    };
    if (isOpen) { document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside) }
  }, [isOpen, onClose]);
  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={onToggle}
        style={{
          background: isOpen ? professionalColors.ui.hover : 'transparent',
          border: 'none',
          color: professionalColors.text.primary,
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          transition: 'background-color 0.15s ease',
          borderRadius: '2px'
        }}

        onMouseOver={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = professionalColors.ui.hover;
          }
        }}

        onMouseOut={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}

      >
        {label}
      </button>
      { isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            minWidth: '220px',
            backgroundColor: professionalColors.background.secondary,
            border: `1px solid ${professionalColors.ui.border}`,
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1001,
            padding: '4px 0'
          }}

        >
          {items.map((item, index) => (
            <MenuItem key={index} {...item} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ProfessionalMenuBar: React.FC<MenuBarProps> = ({ // File operations
  onNew
  onOpen
  onSave
  onSaveAs
  onImport
  onExport
  onRecentFileLoad
  onQuit
  // Edit operations
  onUndo
  onRedo
  onCut
  onCopy
  onPaste
  onSelectAll
  onFind
  onPreferences
  // View operations
  onZoomIn
  onZoomOut
  onFitView
  onToggleGrid
  onToggleMinimap
  onToggleInspector
  onToggleFullscreen
  onToggleTheme
  // Debug operations
  onDevTools
  onValidateGraph
  onPerformanceMonitor
  onConsoleToggle
  // Help operations
  onDocumentation
  onKeyboardShortcuts
  onAbout
  onSupport
  onReportBug
  // Application state
  canUndo = false
  canRedo = false
  hasSelection = false
  nodes = []
  edges = []
  theme = 'cinema'
  isFullscreen = false
  gridVisible = true
  minimapVisible = true
  inspectorVisible = true
  recentFiles = [] }
}) => { const [openMenu, setOpenMenu] = useState<string | null>(null);
  const handleMenuToggle = useCallback(
    (menuName: string) => {
      setOpenMenu(openMenu === menuName ? null : menuName);
    },
    [openMenu]
  );
  const handleMenuClose = useCallback(() => { setOpenMenu(null) }, []);
  // File menu items
  const fileMenuItems: MenuItemProps[] = [
    { label: 'New', shortcut: '⌘N', onClick: onNew },
    { label: 'Open...', shortcut: '⌘O', onClick: onOpen },
    { divider: true },
    { label: 'Save', shortcut: '⌘S', onClick: onSave },
    { label: 'Save As...', shortcut: '⌘⇧S', onClick: onSaveAs },
    { divider: true },
    { label: 'Import...', shortcut: '⌘I', onClick: onImport },
    { 
      label: 'Export',
      submenu: [
        { label: 'Export as JSON', onClick: () => onExport?.('json') },
        { label: 'Export as PNG', onClick: () => onExport?.('png') },
        { label: 'Export as SVG', onClick: () => onExport?.('svg') },
        { label: 'Export as PDF', onClick: () => onExport?.('pdf') }
      ]
    },

    ...(recentFiles.length > 0
      ? [
          { divider: true },
          { 
            label: 'Recent Files',
            submenu: [
              ...recentFiles.slice(0, 10).map((file, index) => ({
                label: `${index + 1}. ${file.metadata.title || file.name.replace('.psg', '')}`,
                onClick: () => onRecentFileLoad?.(file)
              })),
              ...(recentFiles.length > 0
                ? [
                    { divider: true },
                    { 
                      label: 'Clear Recent Files',
                      onClick: () => {
                        // TODO: Implement clear recent files
                        console.log('Clear recent files');
                      }
                    }
                : [])
            ]
          }
]
      : []),
    { divider: true },
    { label: 'Quit', shortcut: '⌘Q', onClick: onQuit }
  ];

  // Edit menu items
  const editMenuItems: MenuItemProps[] = [
    { label: 'Undo', shortcut: '⌘Z', onClick: onUndo, disabled: !canUndo },
    { label: 'Redo', shortcut: '⌘⇧Z', onClick: onRedo, disabled: !canRedo },
    { divider: true },
    { label: 'Cut', shortcut: '⌘X', onClick: onCut, disabled: !hasSelection },
    { label: 'Copy', shortcut: '⌘C', onClick: onCopy, disabled: !hasSelection },
    { label: 'Paste', shortcut: '⌘V', onClick: onPaste },
    { divider: true },
    { label: 'Select All', shortcut: '⌘A', onClick: onSelectAll },
    { label: 'Find', shortcut: '⌘F', onClick: onFind },
    { divider: true },
    { label: 'Preferences...', shortcut: '⌘,', onClick: onPreferences }
  ];

  // View menu items
  const viewMenuItems: MenuItemProps[] = [
    { label: 'Zoom In', shortcut: '⌘+', onClick: onZoomIn },
    { label: 'Zoom Out', shortcut: '⌘-', onClick: onZoomOut },
    { label: 'Fit View', shortcut: '⌘0', onClick: onFitView },
    { divider: true },
    {
      label: `${gridVisible ? 'Hide' : 'Show'} Grid`,
      shortcut: '⌘G',
      onClick: onToggleGrid
    },
    {
      label: `${minimapVisible ? 'Hide' : 'Show'} Minimap`,
      shortcut: '⌘M',
      onClick: onToggleMinimap
    },
    {
      label: `${inspectorVisible ? 'Hide' : 'Show'} Inspector`,
      shortcut: '⌘⇧I',
      onClick: onToggleInspector
    },

    { divider: true },
    { 
      label: isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen',
      shortcut: 'Alt+F',
      onClick: onToggleFullscreen 
    },
    { 
      label: 'Theme',
      submenu: [
        { label: '🌙 Dark', onClick: () => onToggleTheme?.('dark') },
        { label: '☀️ Light', onClick: () => onToggleTheme?.('light') },
        { label: '🎬 Cinema 4D', onClick: () => onToggleTheme?.('cinema') }
      ]
    }
  ];
  // Debug menu items
  const debugMenuItems: MenuItemProps[] = [
    { label: 'Open DevTools', shortcut: 'F12', onClick: onDevTools },
    { label: 'Validate Graph', shortcut: '⌘⇧V', onClick: onValidateGraph },
    { label: 'Performance Monitor', onClick: onPerformanceMonitor },
    { label: 'Toggle Console', shortcut: '⌘⇧C', onClick: onConsoleToggle }
  ];

  // Help menu items
  const helpMenuItems: MenuItemProps[] = [
    { label: 'Documentation', shortcut: 'F1', onClick: onDocumentation },
    { label: 'Keyboard Shortcuts', shortcut: '?', onClick: onKeyboardShortcuts },
    { divider: true },
    { label: 'Support', onClick: onSupport },
    { label: 'Report Bug', onClick: onReportBug },
    { divider: true },
    { label: 'About', onClick: onAbout }
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '32px',
        backgroundColor: professionalColors.background.secondary,
        borderBottom: `1px solid ${professionalColors.ui.border}`,
        padding: '0 8px',
        position: 'relative',
        zIndex: 1000,
        userSelect: 'none'
      }}

    >
      {/* Application Title */}
      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: professionalColors.text.primary,
          marginRight: '24px',
          padding: '0 8px'
        }}

      >
        Prompt Spaghetti
      </div>
      {/* Menu Items */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Menu
          label="File"
          items={fileMenuItems}
          isOpen={openMenu === 'file'}
          onToggle={() => handleMenuToggle('file')}
          onClose={handleMenuClose}
        />
        <Menu
          label="Edit"
          items={editMenuItems}
          isOpen={openMenu === 'edit'}
          onToggle={() => handleMenuToggle('edit')}
          onClose={handleMenuClose}
        />
        <Menu
          label="View"
          items={viewMenuItems}
          isOpen={openMenu === 'view'}
          onToggle={() => handleMenuToggle('view')}
          onClose={handleMenuClose}
        />
        <Menu
          label="Debug"
          items={debugMenuItems}
          isOpen={openMenu === 'debug'}
          onToggle={() => handleMenuToggle('debug')}
          onClose={handleMenuClose}
        />
        <Menu
          label="Help"
          items={helpMenuItems}
          isOpen={openMenu === 'help'}
          onToggle={() => handleMenuToggle('help')}
          onClose={handleMenuClose}
        />
      </div>
      {/* Status Indicator */}
      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '11px',
          color: professionalColors.text.secondary
        }}
      >
        <span>
          {nodes.length} nodes, {edges.length} edges
        </span>
        <span>🎬 Cinema 4D</span>
      </div>
    </div>
  );
};

export default ProfessionalMenuBar;
