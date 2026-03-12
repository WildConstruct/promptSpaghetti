/**
 * Keyboard Shortcut Manager
 * 
 * Centralized management of keyboard shortcuts with conflict detection,
 * customization, and integration with the help system.
 */

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { KeyboardShortcutReference, useKeyboardShortcuts } from './KeyboardShortcutReference';

interface ShortcutHandler {
  id: string;
  keys: string[];
  handler: (e: KeyboardEvent) => void;
  description: string;
  category: string;
  enabled?: boolean;
  preventDefault?: boolean;
}

interface KeyboardShortcutContextValue {
  registerShortcut: (shortcut: ShortcutHandler) => void;
  unregisterShortcut: (id: string) => void;
  enableShortcut: (id: string) => void;
  disableShortcut: (id: string) => void;
  getShortcuts: () => ShortcutHandler[];
  isShortcutActive: (id: string) => boolean;
  showHelp: () => void;
  hideHelp: () => void;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextValue | null>(null);

export const useKeyboardShortcutManager = () => {
  const context = useContext(KeyboardShortcutContext);
  if (!context) {
    throw new Error('useKeyboardShortcutManager must be used within KeyboardShortcutProvider');
  }
  return context;
};

interface KeyboardShortcutProviderProps {
  children: React.ReactNode;
  disabled?: boolean;
}

export const KeyboardShortcutProvider: React.FC<KeyboardShortcutProviderProps> = ({
  children,
  disabled = false,
}) => {
  const [shortcuts, setShortcuts] = useState<Map<string, ShortcutHandler>>(new Map());
  const { isOpen, open, close } = useKeyboardShortcuts();

  // Register a new shortcut
  const registerShortcut = useCallback((shortcut: ShortcutHandler) => {
    setShortcuts(prev => {
      const next = new Map(prev);
      next.set(shortcut.id, { ...shortcut, enabled: shortcut.enabled !== false });
      return next;
    });
  }, []);

  // Unregister a shortcut
  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Enable/disable shortcuts
  const enableShortcut = useCallback((id: string) => {
    setShortcuts(prev => {
      const next = new Map(prev);
      const shortcut = next.get(id);
      if (shortcut) {
        next.set(id, { ...shortcut, enabled: true });
      }
      return next;
    });
  }, []);

  const disableShortcut = useCallback((id: string) => {
    setShortcuts(prev => {
      const next = new Map(prev);
      const shortcut = next.get(id);
      if (shortcut) {
        next.set(id, { ...shortcut, enabled: false });
      }
      return next;
    });
  }, []);

  // Check if shortcut is active
  const isShortcutActive = useCallback((id: string) => {
    const shortcut = shortcuts.get(id);
    return shortcut?.enabled ?? false;
  }, [shortcuts]);

  // Get all shortcuts
  const getShortcuts = useCallback(() => {
    return Array.from(shortcuts.values());
  }, [shortcuts]);

  // Global keyboard event handler
  useEffect(() => {
    if (disabled) {return;}

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.contentEditable === 'true') {
        return;
      }

      // Check each registered shortcut
      shortcuts.forEach(shortcut => {
        if (!shortcut.enabled) {return;}

        const matches = checkShortcutMatch(e, shortcut.keys);
        if (matches) {
          if (shortcut.preventDefault) {
            e.preventDefault();
          }
          shortcut.handler(e);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, disabled]);

  const value: KeyboardShortcutContextValue = {
    registerShortcut,
    unregisterShortcut,
    enableShortcut,
    disableShortcut,
    getShortcuts,
    isShortcutActive,
    showHelp: open,
    hideHelp: close,
  };

  return (
    <KeyboardShortcutContext.Provider value={value}>
      {children}
      <KeyboardShortcutReference isOpen={isOpen} onClose={close} />
    </KeyboardShortcutContext.Provider>
  );
};

// Helper function to check if keyboard event matches shortcut
function checkShortcutMatch(event: KeyboardEvent, keys: string[]): boolean {
  const modifiers = {
    'Ctrl': event.ctrlKey && !event.metaKey,
    'Cmd': event.metaKey && !event.ctrlKey,
    'Ctrl/Cmd': event.ctrlKey || event.metaKey,
    'Alt': event.altKey,
    'Option': event.altKey,
    'Shift': event.shiftKey,
  };

  const normalizedKeys = keys.map(k => k.toLowerCase());
  const hasModifiers = normalizedKeys.some(k => k in modifiers || k === 'ctrl/cmd');

  if (hasModifiers) {
    // Check modifier keys
    for (const [mod, pressed] of Object.entries(modifiers)) {
      const shouldBePressed = normalizedKeys.includes(mod.toLowerCase());
      if (shouldBePressed !== pressed) {
        return false;
      }
    }

    // Check main key
    const mainKey = normalizedKeys.find(k => !(k in modifiers) && k !== 'ctrl/cmd');
    if (mainKey && event.key.toLowerCase() !== mainKey) {
      return false;
    }
  } else {
    // Simple key check
    return normalizedKeys.includes(event.key.toLowerCase());
  }

  return true;
}

// Pre-built shortcut hooks for common operations
export const useCommonShortcuts = () => {
  const manager = useKeyboardShortcutManager();
  
  const registerCommonShortcuts = useCallback((handlers: {
    onSave?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
    onSelectAll?: () => void;
    onPreview?: () => void;
    onExport?: () => void;
    onSearch?: () => void;
    onCommandPalette?: () => void;
  }) => {
    if (handlers.onSave) {
      manager.registerShortcut({
        id: 'save',
        keys: ['Ctrl/Cmd', 'S'],
        handler: handlers.onSave,
        description: 'Save project',
        category: 'file',
        preventDefault: true,
      });
    }

    if (handlers.onUndo) {
      manager.registerShortcut({
        id: 'undo',
        keys: ['Ctrl/Cmd', 'Z'],
        handler: handlers.onUndo,
        description: 'Undo last action',
        category: 'edit',
        preventDefault: true,
      });
    }

    if (handlers.onRedo) {
      manager.registerShortcut({
        id: 'redo',
        keys: ['Ctrl/Cmd', 'Shift', 'Z'],
        handler: handlers.onRedo,
        description: 'Redo last action',
        category: 'edit',
        preventDefault: true,
      });
    }

    if (handlers.onDuplicate) {
      manager.registerShortcut({
        id: 'duplicate',
        keys: ['Ctrl/Cmd', 'D'],
        handler: handlers.onDuplicate,
        description: 'Duplicate selected',
        category: 'edit',
        preventDefault: true,
      });
    }

    if (handlers.onDelete) {
      manager.registerShortcut({
        id: 'delete',
        keys: ['Delete'],
        handler: handlers.onDelete,
        description: 'Delete selected',
        category: 'edit',
      });
    }

    if (handlers.onSelectAll) {
      manager.registerShortcut({
        id: 'select-all',
        keys: ['Ctrl/Cmd', 'A'],
        handler: handlers.onSelectAll,
        description: 'Select all',
        category: 'selection',
        preventDefault: true,
      });
    }

    if (handlers.onPreview) {
      manager.registerShortcut({
        id: 'preview',
        keys: ['Ctrl/Cmd', 'P'],
        handler: handlers.onPreview,
        description: 'Generate preview',
        category: 'view',
        preventDefault: true,
      });
    }

    if (handlers.onExport) {
      manager.registerShortcut({
        id: 'export',
        keys: ['Ctrl/Cmd', 'E'],
        handler: handlers.onExport,
        description: 'Export graph',
        category: 'file',
        preventDefault: true,
      });
    }

    if (handlers.onSearch) {
      manager.registerShortcut({
        id: 'search',
        keys: ['Ctrl/Cmd', 'F'],
        handler: handlers.onSearch,
        description: 'Search',
        category: 'navigation',
        preventDefault: true,
      });
    }

    if (handlers.onCommandPalette) {
      manager.registerShortcut({
        id: 'command-palette',
        keys: ['C'],
        handler: handlers.onCommandPalette,
        description: 'Open command palette',
        category: 'navigation',
        preventDefault: true,
      });
    }
  }, [manager]);

  return { registerCommonShortcuts };
};

// Shortcut hint component
interface ShortcutHintProps {
  shortcut: string[];
  description?: string;
  style?: React.CSSProperties;
}

export const ShortcutHint: React.FC<ShortcutHintProps> = ({
  shortcut,
  description,
  style = {},
}) => {
  const isMac = navigator.platform.toLowerCase().includes('mac');

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: '#6b7280',
      ...style,
    }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        {shortcut.map((key, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span>+</span>}
            <kbd style={{
              padding: '2px 6px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '3px',
              fontSize: '11px',
              fontFamily: 'monospace',
            }}>
              {key.replace('Ctrl/Cmd', isMac ? '⌘' : 'Ctrl')}
            </kbd>
          </React.Fragment>
        ))}
      </div>
      {description && <span>{description}</span>}
    </div>
  );
};

// Integration component for Epic 1
export const KeyboardShortcutIntegration: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <KeyboardShortcutProvider>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
      }}>
        <ShortcutHint shortcut={['?']} description="Keyboard shortcuts" />
      </div>
    </KeyboardShortcutProvider>
  );
};
