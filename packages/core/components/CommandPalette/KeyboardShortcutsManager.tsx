/**
 * Professional Keyboard Shortcuts System for Graph Editor
 * Phase 2: Critical Professional Features Implementation
 * 
 * Cinema 4D-inspired keyboard shortcuts with customization and help overlay
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';

export interface KeyboardShortcut {
  id: string;
  key: string;
  modifiers: ('ctrl' | 'meta' | 'shift' | 'alt')[];
  action: () => void | Promise<void>;
  description: string;
  category: 'editing' | 'navigation' | 'selection' | 'view' | 'file' | 'generation';
  enabled: boolean;
  global?: boolean; // Whether shortcut works globally or only when editor is focused
}

export interface KeyboardShortcutsManagerProps {
  onCommandPalette: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onSelectAll: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onGenerateCharacter: () => void;
  onToggleFullscreen: () => void;
  customShortcuts?: KeyboardShortcut[];
  theme?: 'light' | 'dark' | 'cinema';
  disabled?: boolean;
}

export const KeyboardShortcutsManager: React.FC<KeyboardShortcutsManagerProps> = ({
  onCommandPalette,
  onUndo,
  onRedo,
  onSave,
  onLoad,
  onExport,
  onSelectAll,
  onDelete,
  onDuplicate,
  onFitView,
  onZoomIn,
  onZoomOut,
  onGenerateCharacter,
  onToggleFullscreen,
  customShortcuts = [],
  theme = 'cinema',
  disabled = false
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  
  const recordingTimeoutRef = useRef<NodeJS.Timeout>();

  // Default shortcuts configuration
  const defaultShortcuts: KeyboardShortcut[] = [
    // Command Palette
    {
      id: 'command-palette',
      key: 'k',
      modifiers: ['meta', 'ctrl'],
      action: onCommandPalette,
      description: 'Open Command Palette',
      category: 'editing',
      enabled: true,
      global: true
    },
    
    // File Operations
    {
      id: 'save',
      key: 's',
      modifiers: ['meta', 'ctrl'],
      action: onSave,
      description: 'Save Graph',
      category: 'file',
      enabled: true,
      global: true
    },
    {
      id: 'load',
      key: 'o',
      modifiers: ['meta', 'ctrl'],
      action: onLoad,
      description: 'Load Graph',
      category: 'file',
      enabled: true,
      global: true
    },
    {
      id: 'export',
      key: 'e',
      modifiers: ['meta', 'ctrl'],
      action: onExport,
      description: 'Export Graph',
      category: 'file',
      enabled: true,
      global: true
    },
    
    // Edit Operations
    {
      id: 'undo',
      key: 'z',
      modifiers: ['meta', 'ctrl'],
      action: onUndo,
      description: 'Undo',
      category: 'editing',
      enabled: true,
      global: true
    },
    {
      id: 'redo',
      key: 'z',
      modifiers: ['meta', 'ctrl', 'shift'],
      action: onRedo,
      description: 'Redo',
      category: 'editing',
      enabled: true,
      global: true
    },
    {
      id: 'redo-alt',
      key: 'y',
      modifiers: ['meta', 'ctrl'],
      action: onRedo,
      description: 'Redo (Alternative)',
      category: 'editing',
      enabled: true,
      global: true
    },
    
    // Selection Operations
    {
      id: 'select-all',
      key: 'a',
      modifiers: ['meta', 'ctrl'],
      action: onSelectAll,
      description: 'Select All',
      category: 'selection',
      enabled: true
    },
    {
      id: 'delete',
      key: 'Delete',
      modifiers: [],
      action: onDelete,
      description: 'Delete Selected',
      category: 'editing',
      enabled: true
    },
    {
      id: 'delete-alt',
      key: 'Backspace',
      modifiers: [],
      action: onDelete,
      description: 'Delete Selected (Alternative)',
      category: 'editing',
      enabled: true
    },
    {
      id: 'duplicate',
      key: 'd',
      modifiers: ['meta', 'ctrl'],
      action: onDuplicate,
      description: 'Duplicate Selected',
      category: 'editing',
      enabled: true
    },
    
    // View Operations
    {
      id: 'fit-view',
      key: '0',
      modifiers: ['meta', 'ctrl'],
      action: onFitView,
      description: 'Fit View',
      category: 'view',
      enabled: true
    },
    {
      id: 'zoom-in',
      key: '=',
      modifiers: ['meta', 'ctrl'],
      action: onZoomIn,
      description: 'Zoom In',
      category: 'view',
      enabled: true
    },
    {
      id: 'zoom-out',
      key: '-',
      modifiers: ['meta', 'ctrl'],
      action: onZoomOut,
      description: 'Zoom Out',
      category: 'view',
      enabled: true
    },
    {
      id: 'fullscreen',
      key: 'f',
      modifiers: ['alt'],
      action: onToggleFullscreen,
      description: 'Toggle Fullscreen',
      category: 'view',
      enabled: true
    },
    
    // Generation
    {
      id: 'generate-character',
      key: 'g',
      modifiers: ['meta', 'ctrl'],
      action: onGenerateCharacter,
      description: 'Generate Character',
      category: 'generation',
      enabled: true
    },
    
    // Help
    {
      id: 'show-help',
      key: '?',
      modifiers: ['shift'],
      action: () => setShowHelp(true),
      description: 'Show Keyboard Shortcuts',
      category: 'navigation',
      enabled: true,
      global: true
    },
    {
      id: 'show-help-alt',
      key: 'F1',
      modifiers: [],
      action: () => setShowHelp(true),
      description: 'Show Help (F1)',
      category: 'navigation',
      enabled: true,
      global: true
    }
  ];

  // Initialize shortcuts
  useEffect(() => {
    setShortcuts([...defaultShortcuts, ...customShortcuts]);
  }, [customShortcuts]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      const key = e.key;
      const modifiers: ('ctrl' | 'meta' | 'shift' | 'alt')[] = [];
      
      if (e.ctrlKey || e.metaKey) modifiers.push(e.ctrlKey ? 'ctrl' : 'meta');
      if (e.shiftKey) modifiers.push('shift');
      if (e.altKey) modifiers.push('alt');

      // Update pressed keys for visual feedback
      setPressedKeys(prev => new Set([...prev, key]));

      // Find matching shortcut
      const matchingShortcut = shortcuts.find(shortcut => {
        if (!shortcut.enabled) return false;
        
        const keyMatch = shortcut.key.toLowerCase() === key.toLowerCase();
        const modifiersMatch = shortcut.modifiers.length === modifiers.length &&
          shortcut.modifiers.every(mod => modifiers.includes(mod));
        
        return keyMatch && modifiersMatch;
      });

      if (matchingShortcut) {
        e.preventDefault();
        e.stopPropagation();
        
        try {
          matchingShortcut.action();
        } catch (error) {
          console.error('Failed to execute keyboard shortcut:', error);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.delete(e.key);
        return next;
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [shortcuts, disabled]);

  // Clear pressed keys on window blur
  useEffect(() => {
    const handleBlur = () => setPressedKeys(new Set());
    
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  // Update shortcut
    }, []);

  // Start recording new shortcut
      
    // Auto-cancel recording after 5 seconds
    recordingTimeoutRef.current = setTimeout(() => {
      setIsRecording(null);
    }, 5000);
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    setIsRecording(null);
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
  }, []);

  // Format shortcut for display
  const formatShortcut = useCallback((shortcut: KeyboardShortcut) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierSymbols = {
      meta: isMac ? '⌘' : 'Ctrl',
      ctrl: isMac ? '⌘' : 'Ctrl',
      shift: '⇧',
      alt: isMac ? '⌥' : 'Alt'
    };

    const parts = [
      ...shortcut.modifiers.map(mod => modifierSymbols[mod]),
      shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase()
    ];

    return parts.join(isMac ? '' : '+');
  }, []);

  // Theme styles
  const getThemeStyles = () => {
    const themes = {
      light: {
        background: '#ffffff',
        secondary: '#f8fafc',
        border: '#e5e7eb',
        text: '#374151',
        textSecondary: '#6b7280',
        accent: '#3b82f6',
        hover: '#f3f4f6',
        key: '#f1f5f9'
      },
      dark: {
        background: '#1f2937',
        secondary: '#111827',
        border: '#4b5563',
        text: '#f9fafb',
        textSecondary: '#9ca3af',
        accent: '#60a5fa',
        hover: '#374151',
        key: '#374151'
      },
      cinema: {
        background: 'var(--color-bg-secondary)',
        secondary: 'var(--color-bg-tertiary)',
        border: 'var(--color-ui-border)',
        text: 'var(--color-text-primary)',
        textSecondary: 'var(--color-text-secondary)',
        accent: 'var(--color-accent-orange)',
        hover: 'var(--color-ui-hover)',
        key: 'var(--color-bg-primary)'
      }
    };
    return themes[theme];
  };

  const styles = getThemeStyles();

  // Category icons
  const categoryIcons: Record<string, string> = {
    editing: '✏️',
    navigation: '🧭',
    selection: '🎯',
    view: '👁️',
    file: '📁',
    generation: '✨'
  };

  return (
    <>
      {/* Help Overlay */}
      {showHelp && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            fontFamily: 'var(--font-family-primary)'
          }}
          onClick={() => setShowHelp(false)}
        >
          <div
            style={{
              background: styles.background,
              border: `1px solid ${styles.border}`,
              borderRadius: '16px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90%',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '24px',
                borderBottom: `1px solid ${styles.border}`,
                background: styles.secondary
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '600',
                  color: styles.text
                }}>
                  ⌨️ Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setShowHelp(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: styles.textSecondary,
                    fontSize: '28px',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{
                margin: '8px 0 0 0',
                color: styles.textSecondary,
                fontSize: '16px'
              }}>
                Master the graph editor with these professional keyboard shortcuts
              </p>
            </div>

            {/* Shortcuts Grid */}
            <div
              style={{
                padding: '24px',
                maxHeight: '600px',
                overflowY: 'auto'
              }}
            >
              {Object.entries(
                shortcuts.reduce((acc, shortcut) => {
                  if (!acc[shortcut.category]) acc[shortcut.category] = [];
                  acc[shortcut.category].push(shortcut);
                  return acc;
                }, {} as Record<string, KeyboardShortcut[]>)
              ).map(([category, categoryShortcuts]) => (
                <div key={category} style={{ marginBottom: '32px' }}>
                  <h3 style={{
                    color: styles.accent,
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    textTransform: 'capitalize',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {categoryIcons[category]} {category}
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '12px'
                  }}>
                    {categoryShortcuts
                      .filter(shortcut => shortcut.enabled)
                      .map(shortcut => (
                        <div
                          key={shortcut.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            background: styles.secondary,
                            border: `1px solid ${styles.border}`,
                            borderRadius: '8px',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <div style={{
                            color: styles.text,
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            {shortcut.description}
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {formatShortcut(shortcut).split(/(\+|⌘|⇧|⌥|Ctrl|Alt)/).map((part, index) => {
                              if (part === '+') {
                                return (
                                  <span key={index} style={{
                                    color: styles.textSecondary,
                                    fontSize: '12px',
                                    margin: '0 2px'
                                  }}>
                                    +
                                  </span>
                                );
                              }
                              
                              return (
                                <kbd
                                  key={index}
                                  style={{
                                    background: styles.key,
                                    border: `1px solid ${styles.border}`,
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: styles.text,
                                    fontFamily: 'monospace',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                                  }}
                                >
                                  {part}
                                </kbd>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '20px 24px',
                borderTop: `1px solid ${styles.border}`,
                background: styles.secondary,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{
                fontSize: '12px',
                color: styles.textSecondary
              }}>
                Press <kbd style={{
                  background: styles.key,
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '11px'
                }}>Esc</kbd> or click outside to close
              </div>
              
              <button
                onClick={() => setShowHelp(false)}
                style={{
                  padding: '8px 16px',
                  background: styles.accent,
                  border: 'none',
                  borderRadius: '6px',
                  color: styles.background,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: styles.background,
            border: `2px solid ${styles.accent}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 10002,
            textAlign: 'center',
            fontFamily: 'var(--font-family-primary)'
          }}
        >
          <div style={{
            color: styles.accent,
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            ⌨️
          </div>
          <div style={{
            color: styles.text,
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            Recording new shortcut...
          </div>
          <div style={{
            color: styles.textSecondary,
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            Press the key combination you want to use
          </div>
          <button
            onClick={stopRecording}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: `1px solid ${styles.border}`,
              borderRadius: '6px',
              color: styles.text,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcutsManager;