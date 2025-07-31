import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/**
 * Professional Desktop Application Menu Bar
 * Epic 2 Story 2.1: Menu Bar Architecture Implementation
 *
 * Cinema 4D-inspired menu bar with File, Edit, View, Debug, Help sections
 */
import { useState, useCallback, useRef, useEffect } from 'react';
const professionalColors = {
  background: {
    primary: '#1e1e1e',
    secondary: '#2a2a2a',
    tertiary: '#353535',
  },
  text: {
    primary: '#e8e8e8',
    secondary: '#b8b8b8',
    accent: '#ff7c00',
  },
  ui: {
    border: '#404040',
    borderHover: '#5a5a5a',
    borderActive: '#ff7c00',
    hover: '#2d2d2d',
    selection: '#ff7c0040',
  },
};
const MenuItem = ({ label, shortcut, onClick, disabled = false, divider = false, submenu }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const itemRef = useRef(null);
  if (divider) {
    return _jsx('div', {
      style: {
        height: '1px',
        backgroundColor: professionalColors.ui.border,
        margin: '4px 0',
      },
    });
  }
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);
  const handleMouseEnter = useCallback(() => {
    if (submenu) {
      setShowSubmenu(true);
    }
  }, [submenu]);
  const handleMouseLeave = useCallback(() => {
    if (submenu) {
      setShowSubmenu(false);
    }
  }, [submenu]);
  return _jsxs('div', {
    ref: itemRef,
    style: {
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
      fontWeight: 400,
    },
    onClick: handleClick,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseOver: e => {
      if (!disabled) {
        e.currentTarget.style.backgroundColor = professionalColors.ui.hover;
      }
    },
    onMouseOut: e => {
      if (!showSubmenu) {
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    },
    children: [
      _jsx('span', { children: label }),
      _jsxs('div', {
        style: { display: 'flex', alignItems: 'center', gap: '8px' },
        children: [
          shortcut &&
            _jsx('span', {
              style: {
                fontSize: '11px',
                color: professionalColors.text.secondary,
                fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
              },
              children: shortcut,
            }),
          submenu &&
            _jsx('span', {
              style: {
                fontSize: '10px',
                color: professionalColors.text.secondary,
              },
              children: '\u25B6',
            }),
        ],
      }),
      submenu &&
        showSubmenu &&
        _jsx('div', {
          style: {
            position: 'absolute',
            top: 0,
            left: '100%',
            minWidth: '200px',
            backgroundColor: professionalColors.background.secondary,
            border: `1px solid ${professionalColors.ui.border}`,
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1002,
            padding: '4px 0',
          },
          children: submenu.map((item, index) => _jsx(MenuItem, { ...item }, index)),
        }),
    ],
  });
};
const Menu = ({ label, items, isOpen, onToggle, onClose }) => {
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);
  return _jsxs('div', {
    ref: menuRef,
    style: { position: 'relative' },
    children: [
      _jsx('button', {
        onClick: onToggle,
        style: {
          background: isOpen ? professionalColors.ui.hover : 'transparent',
          border: 'none',
          color: professionalColors.text.primary,
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          transition: 'background-color 0.15s ease',
          borderRadius: '2px',
        },
        onMouseOver: e => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = professionalColors.ui.hover;
          }
        },
        onMouseOut: e => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        },
        children: label,
      }),
      isOpen &&
        _jsx('div', {
          style: {
            position: 'absolute',
            top: '100%',
            left: 0,
            minWidth: '220px',
            backgroundColor: professionalColors.background.secondary,
            border: `1px solid ${professionalColors.ui.border}`,
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1001,
            padding: '4px 0',
          },
          children: items.map((item, index) => _jsx(MenuItem, { ...item }, index)),
        }),
    ],
  });
};
export const ProfessionalMenuBar = ({
  // File operations
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onImport,
  onExport,
  onRecentFileLoad,
  onQuit,
  // Edit operations
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onSelectAll,
  onFind,
  onPreferences,
  // View operations
  onZoomIn,
  onZoomOut,
  onFitView,
  onToggleGrid,
  onToggleMinimap,
  onToggleInspector,
  onToggleFullscreen,
  onToggleTheme,
  // Debug operations
  onDevTools,
  onValidateGraph,
  onPerformanceMonitor,
  onConsoleToggle,
  // Help operations
  onDocumentation,
  onKeyboardShortcuts,
  onAbout,
  onSupport,
  onReportBug,
  // Application state
  canUndo = false,
  canRedo = false,
  hasSelection = false,
  nodes = [],
  edges = [],
  theme = 'cinema',
  isFullscreen = false,
  gridVisible = true,
  minimapVisible = true,
  inspectorVisible = true,
  recentFiles = [],
}) => {
  const [openMenu, setOpenMenu] = useState(null);
  const handleMenuToggle = useCallback(
    menuName => {
      setOpenMenu(openMenu === menuName ? null : menuName);
    },
    [openMenu]
  );
  const handleMenuClose = useCallback(() => {
    setOpenMenu(null);
  }, []);
  // File menu items
  const fileMenuItems = [
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
        { label: 'Export as PDF', onClick: () => onExport?.('pdf') },
      ],
    },
    ...(recentFiles.length > 0
      ? [
          { divider: true },
          {
            label: 'Recent Files',
            submenu: [
              ...recentFiles.slice(0, 10).map((file, index) => ({
                label: `${index + 1}. ${file.metadata.title || file.name.replace('.psg', '')}`,
                onClick: () => onRecentFileLoad?.(file),
              })),
              ...(recentFiles.length > 0
                ? [
                    { divider: true },
                    {
                      label: 'Clear Recent Files',
                      onClick: () => {
                        // TODO: Implement clear recent files
                        console.log('Clear recent files');
                      },
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    { divider: true },
    { label: 'Quit', shortcut: '⌘Q', onClick: onQuit },
  ];
  // Edit menu items
  const editMenuItems = [
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
    { label: 'Preferences...', shortcut: '⌘,', onClick: onPreferences },
  ];
  // View menu items
  const viewMenuItems = [
    { label: 'Zoom In', shortcut: '⌘+', onClick: onZoomIn },
    { label: 'Zoom Out', shortcut: '⌘-', onClick: onZoomOut },
    { label: 'Fit View', shortcut: '⌘0', onClick: onFitView },
    { divider: true },
    {
      label: `${gridVisible ? 'Hide' : 'Show'} Grid`,
      shortcut: '⌘G',
      onClick: onToggleGrid,
    },
    {
      label: `${minimapVisible ? 'Hide' : 'Show'} Minimap`,
      shortcut: '⌘M',
      onClick: onToggleMinimap,
    },
    {
      label: `${inspectorVisible ? 'Hide' : 'Show'} Inspector`,
      shortcut: '⌘⇧I',
      onClick: onToggleInspector,
    },
    { divider: true },
    {
      label: isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen',
      shortcut: 'Alt+F',
      onClick: onToggleFullscreen,
    },
    {
      label: 'Theme',
      submenu: [
        { label: '🌙 Dark', onClick: () => onToggleTheme?.('dark') },
        { label: '☀️ Light', onClick: () => onToggleTheme?.('light') },
        { label: '🎬 Cinema 4D', onClick: () => onToggleTheme?.('cinema') },
      ],
    },
  ];
  // Debug menu items
  const debugMenuItems = [
    { label: 'Open DevTools', shortcut: 'F12', onClick: onDevTools },
    { label: 'Validate Graph', shortcut: '⌘⇧V', onClick: onValidateGraph },
    { label: 'Performance Monitor', onClick: onPerformanceMonitor },
    { label: 'Toggle Console', shortcut: '⌘⇧C', onClick: onConsoleToggle },
  ];
  // Help menu items
  const helpMenuItems = [
    { label: 'Documentation', shortcut: 'F1', onClick: onDocumentation },
    { label: 'Keyboard Shortcuts', shortcut: '?', onClick: onKeyboardShortcuts },
    { divider: true },
    { label: 'Support', onClick: onSupport },
    { label: 'Report Bug', onClick: onReportBug },
    { divider: true },
    { label: 'About', onClick: onAbout },
  ];
  return _jsxs('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      height: '32px',
      backgroundColor: professionalColors.background.secondary,
      borderBottom: `1px solid ${professionalColors.ui.border}`,
      padding: '0 8px',
      position: 'relative',
      zIndex: 1000,
      userSelect: 'none',
    },
    children: [
      _jsx('div', {
        style: {
          fontSize: '13px',
          fontWeight: 600,
          color: professionalColors.text.primary,
          marginRight: '24px',
          padding: '0 8px',
        },
        children: 'Prompt Spaghetti',
      }),
      _jsxs('div', {
        style: { display: 'flex', alignItems: 'center' },
        children: [
          _jsx(Menu, {
            label: 'File',
            items: fileMenuItems,
            isOpen: openMenu === 'file',
            onToggle: () => handleMenuToggle('file'),
            onClose: handleMenuClose,
          }),
          _jsx(Menu, {
            label: 'Edit',
            items: editMenuItems,
            isOpen: openMenu === 'edit',
            onToggle: () => handleMenuToggle('edit'),
            onClose: handleMenuClose,
          }),
          _jsx(Menu, {
            label: 'View',
            items: viewMenuItems,
            isOpen: openMenu === 'view',
            onToggle: () => handleMenuToggle('view'),
            onClose: handleMenuClose,
          }),
          _jsx(Menu, {
            label: 'Debug',
            items: debugMenuItems,
            isOpen: openMenu === 'debug',
            onToggle: () => handleMenuToggle('debug'),
            onClose: handleMenuClose,
          }),
          _jsx(Menu, {
            label: 'Help',
            items: helpMenuItems,
            isOpen: openMenu === 'help',
            onToggle: () => handleMenuToggle('help'),
            onClose: handleMenuClose,
          }),
        ],
      }),
      _jsxs('div', {
        style: {
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '11px',
          color: professionalColors.text.secondary,
        },
        children: [
          _jsxs('span', { children: [nodes.length, ' nodes, ', edges.length, ' edges'] }),
          _jsx('span', { children: '\uD83C\uDFAC Cinema 4D' }),
        ],
      }),
    ],
  });
};
export default ProfessionalMenuBar;
