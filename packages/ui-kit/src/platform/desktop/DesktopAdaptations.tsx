/**
 * Desktop-specific UI adaptations and features
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { deviceDetector } from '../../responsive/device-detection';

/**
 * Desktop hover states manager
 */
export const useHoverState = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const hoverProps = {
    onMouseEnter: (e: React.MouseEvent) => {
      setIsHovered(true);
      setHoverPosition({ x: e.clientX, y: e.clientY });
    },
    onMouseLeave: () => setIsHovered(false),
    onMouseMove: (e: React.MouseEvent) => {
      setHoverPosition({ x: e.clientX, y: e.clientY });
    },
  };

  return { isHovered, hoverPosition, hoverProps };
};

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  id: string;
  key: string;
  modifiers?: ('ctrl' | 'cmd' | 'alt' | 'shift')[];
  description: string;
  handler: () => void;
  category?: string;
  enabled?: boolean;
}

/**
 * Keyboard shortcuts manager
 */
export class KeyboardShortcutsManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private listeners: ((shortcuts: KeyboardShortcut[]) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
    }
  }

  register(shortcut: KeyboardShortcut): void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
    this.notifyListeners();
  }

  unregister(id: string): void {
    for (const [key, shortcut] of this.shortcuts.entries()) {
      if (shortcut.id === id) {
        this.shortcuts.delete(key);
        this.notifyListeners();
        break;
      }
    }
  }

  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return this.getShortcuts().filter(s => s.category === category);
  }

  subscribe(callback: (shortcuts: KeyboardShortcut[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.getShortcuts());

    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const key = this.getEventKey(e);
    const shortcut = this.shortcuts.get(key);

    if (shortcut && shortcut.enabled !== false) {
      e.preventDefault();
      e.stopPropagation();
      shortcut.handler();
    }
  };

  private getShortcutKey(shortcut: KeyboardShortcut): string {
    const modifiers = shortcut.modifiers || [];
    const parts = [...modifiers.sort(), shortcut.key.toLowerCase()];
    return parts.join('+');
  }

  private getEventKey(e: KeyboardEvent): string {
    const modifiers = [];
    const isMac = deviceDetector.getOS() === 'macOS';

    if (e.ctrlKey || (isMac && e.metaKey)) modifiers.push('ctrl');
    if (e.altKey) modifiers.push('alt');
    if (e.shiftKey) modifiers.push('shift');

    const key = e.key.toLowerCase();
    const parts = [...modifiers.sort(), key];
    return parts.join('+');
  }

  private notifyListeners(): void {
    const shortcuts = this.getShortcuts();
    this.listeners.forEach(listener => listener(shortcuts));
  }

  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
    }
    this.shortcuts.clear();
    this.listeners = [];
  }
}

/**
 * React hook for keyboard shortcuts
 */
export const useKeyboardShortcuts = (shortcuts: Omit<KeyboardShortcut, 'id'>[]) => {
  const managerRef = useRef<KeyboardShortcutsManager>();

  useEffect(() => {
    managerRef.current = new KeyboardShortcutsManager();

    shortcuts.forEach((shortcut, index) => {
      managerRef.current!.register({
        ...shortcut,
        id: `shortcut-${index}`,
      });
    });

    return () => {
      managerRef.current?.destroy();
    };
  }, [shortcuts]);
};

/**
 * Desktop tooltip component
 */
export interface DesktopTooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  children: React.ReactNode;
}

export const DesktopTooltip: React.FC<DesktopTooltipProps> = ({
  content,
  position = 'auto',
  delay = 500,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const targetRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = useCallback(
    (e: React.MouseEvent) => {
      timeoutRef.current = setTimeout(() => {
        setVisible(true);

        if (targetRef.current && tooltipRef.current) {
          const targetRect = targetRef.current.getBoundingClientRect();
          const tooltipRect = tooltipRef.current.getBoundingClientRect();

          let x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          let y = targetRect.top - tooltipRect.height - 8;

          // Auto position if needed
          if (position === 'auto' || y < 0) {
            y = targetRect.bottom + 8;
          }

          // Keep on screen
          x = Math.max(8, Math.min(x, window.innerWidth - tooltipRect.width - 8));
          y = Math.max(8, Math.min(y, window.innerHeight - tooltipRect.height - 8));

          setTooltipPosition({ x, y });
        }
      }, delay);
    },
    [delay, position]
  );

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  }, []);

  return (
    <>
      <div ref={targetRef} onMouseEnter={showTooltip} onMouseLeave={hideTooltip} style={{ display: 'inline-block' }}>
        {children}
      </div>

      {visible && (
        <div
          ref={tooltipRef}
          className="desktop-tooltip"
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 10000,
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          {content}
        </div>
      )}
    </>
  );
};

/**
 * Desktop context menu
 */
export interface DesktopContextMenuProps {
  items: Array<{
    label: string;
    icon?: React.ReactNode;
    shortcut?: string;
    disabled?: boolean;
    danger?: boolean;
    separator?: boolean;
    submenu?: any[];
    onClick?: () => void;
  }>;
  children: React.ReactNode;
}

export const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({ items, children }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setVisible(true);
  }, []);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [visible, handleClickOutside]);

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>

      {visible && (
        <div
          ref={menuRef}
          className="desktop-context-menu"
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            padding: '4px 0',
            minWidth: '200px',
            zIndex: 10000,
          }}
        >
          {items.map((item, index) => {
            if (item.separator) {
              return (
                <div
                  key={index}
                  className="menu-separator"
                  style={{
                    height: '1px',
                    backgroundColor: 'var(--color-border)',
                    margin: '4px 8px',
                  }}
                />
              );
            }

            return (
              <button
                key={index}
                className="menu-item"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.();
                  setVisible(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  opacity: item.disabled ? 0.5 : 1,
                  color: item.danger ? 'var(--color-danger)' : 'var(--color-text)',
                  fontSize: '14px',
                  transition: 'background-color 0.1s ease',
                }}
                onMouseEnter={e => {
                  if (!item.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--color-hover)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.icon && <span style={{ marginRight: '8px' }}>{item.icon}</span>}
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                {item.shortcut && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      marginLeft: '16px',
                    }}
                  >
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};

/**
 * Desktop window controls (minimize, maximize, close)
 */
export interface DesktopWindowControlsProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  platform?: 'windows' | 'mac' | 'linux';
}

export const DesktopWindowControls: React.FC<DesktopWindowControlsProps> = ({
  onMinimize,
  onMaximize,
  onClose,
  platform = deviceDetector.getOS() === 'macOS' ? 'mac' : 'windows',
}) => {
  if (platform === 'mac') {
    return (
      <div
        className="window-controls mac"
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px',
        }}
      >
        <button
          onClick={onClose}
          className="window-control close"
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ff5f57',
            border: 'none',
            cursor: 'pointer',
          }}
        />
        <button
          onClick={onMinimize}
          className="window-control minimize"
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ffbd2e',
            border: 'none',
            cursor: 'pointer',
          }}
        />
        <button
          onClick={onMaximize}
          className="window-control maximize"
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#28ca42',
            border: 'none',
            cursor: 'pointer',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="window-controls windows"
      style={{
        display: 'flex',
        height: '32px',
      }}
    >
      <button
        onClick={onMinimize}
        className="window-control minimize"
        style={{
          width: '46px',
          height: '32px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="10" height="1" fill="currentColor">
          <rect width="10" height="1" />
        </svg>
      </button>
      <button
        onClick={onMaximize}
        className="window-control maximize"
        style={{
          width: '46px',
          height: '32px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="10" height="10" fill="none" stroke="currentColor">
          <rect x="0.5" y="0.5" width="9" height="9" strokeWidth="1" />
        </svg>
      </button>
      <button
        onClick={onClose}
        className="window-control close"
        style={{
          width: '46px',
          height: '32px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#e81123';
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'currentColor';
        }}
      >
        <svg width="10" height="10" fill="currentColor">
          <path d="M0 0L10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
    </div>
  );
};

/**
 * Common desktop keyboard shortcuts
 */
export const desktopShortcuts: KeyboardShortcut[] = [
  // File operations
  { id: 'new', key: 'n', modifiers: ['ctrl'], description: 'New', category: 'File', handler: () => {} },
  { id: 'open', key: 'o', modifiers: ['ctrl'], description: 'Open', category: 'File', handler: () => {} },
  { id: 'save', key: 's', modifiers: ['ctrl'], description: 'Save', category: 'File', handler: () => {} },
  { id: 'saveAs', key: 's', modifiers: ['ctrl', 'shift'], description: 'Save As', category: 'File', handler: () => {} },

  // Edit operations
  { id: 'undo', key: 'z', modifiers: ['ctrl'], description: 'Undo', category: 'Edit', handler: () => {} },
  { id: 'redo', key: 'y', modifiers: ['ctrl'], description: 'Redo', category: 'Edit', handler: () => {} },
  { id: 'cut', key: 'x', modifiers: ['ctrl'], description: 'Cut', category: 'Edit', handler: () => {} },
  { id: 'copy', key: 'c', modifiers: ['ctrl'], description: 'Copy', category: 'Edit', handler: () => {} },
  { id: 'paste', key: 'v', modifiers: ['ctrl'], description: 'Paste', category: 'Edit', handler: () => {} },
  { id: 'selectAll', key: 'a', modifiers: ['ctrl'], description: 'Select All', category: 'Edit', handler: () => {} },

  // View operations
  { id: 'zoomIn', key: '+', modifiers: ['ctrl'], description: 'Zoom In', category: 'View', handler: () => {} },
  { id: 'zoomOut', key: '-', modifiers: ['ctrl'], description: 'Zoom Out', category: 'View', handler: () => {} },
  { id: 'zoomReset', key: '0', modifiers: ['ctrl'], description: 'Reset Zoom', category: 'View', handler: () => {} },
  {
    id: 'fullscreen',
    key: 'f11',
    modifiers: [],
    description: 'Toggle Fullscreen',
    category: 'View',
    handler: () => {},
  },

  // Navigation
  { id: 'search', key: 'f', modifiers: ['ctrl'], description: 'Search', category: 'Navigation', handler: () => {} },
  { id: 'goTo', key: 'g', modifiers: ['ctrl'], description: 'Go To', category: 'Navigation', handler: () => {} },
];

/**
 * Desktop hover effects
 */
export const desktopHoverStyles = `
  /* Desktop hover states */
  @media (hover: hover) {
    .desktop-hoverable {
      transition: all 0.2s ease;
    }
    
    .desktop-hoverable:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .desktop-link {
      text-decoration: none;
      color: var(--color-primary);
      transition: color 0.2s ease;
    }
    
    .desktop-link:hover {
      color: var(--color-primary-dark);
      text-decoration: underline;
    }
    
    .desktop-button {
      transition: all 0.2s ease;
    }
    
    .desktop-button:hover:not(:disabled) {
      background-color: var(--color-hover);
      transform: scale(1.02);
    }
    
    .desktop-button:active:not(:disabled) {
      transform: scale(0.98);
    }
  }
  
  /* Desktop focus states */
  .desktop-focusable:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  
  .desktop-focusable:focus:not(:focus-visible) {
    outline: none;
  }
  
  .desktop-focusable:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  
  /* Desktop selection */
  ::selection {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
  }
  
  /* Custom scrollbars for desktop */
  @media (hover: hover) {
    ::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }
    
    ::-webkit-scrollbar-track {
      background: var(--color-background);
    }
    
    ::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: 6px;
      border: 2px solid var(--color-background);
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-secondary);
    }
  }
`;
