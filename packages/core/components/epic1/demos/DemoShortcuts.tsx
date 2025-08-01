/**
 * Demo-specific keyboard shortcuts for medieval showcase
 * Quick actions to speed up investor demos
 */

import React, { useEffect, useCallback } from 'react';
import { DemoGraph, getDemoGraphById } from './medievalDemoGraphs';

export interface DemoShortcut {
  key: string;
  description: string;
  action: () => void;
  modifier?: 'cmd' | 'ctrl' | 'shift' | 'alt';
}

interface DemoShortcutsProps {
  onLoadGraph: (graph: DemoGraph) => void;
  onClearGraph: () => void;
  onGeneratePreview: () => void;
  onToggleAssetLibrary: () => void;
  onStartDemo: () => void;
  additionalShortcuts?: DemoShortcut[];
}

export const DemoShortcuts: React.FC<DemoShortcutsProps> = ({
  onLoadGraph,
  onClearGraph,
  onGeneratePreview,
  onToggleAssetLibrary,
  onStartDemo,
  additionalShortcuts = [],
}) => {
  // Default demo shortcuts
  const defaultShortcuts: DemoShortcut[] = [
    {
      key: '1',
      description: 'Load Simple Character',
      action: () => {
        const graph = getDemoGraphById('simple-character');
        if (graph) onLoadGraph(graph);
      },
    },
    {
      key: '2',
      description: 'Load Quest Hook',
      action: () => {
        const graph = getDemoGraphById('quest-hook');
        if (graph) onLoadGraph(graph);
      },
    },
    {
      key: '3',
      description: 'Load Tavern Scene',
      action: () => {
        const graph = getDemoGraphById('tavern-scene');
        if (graph) onLoadGraph(graph);
      },
    },
    {
      key: '4',
      description: 'Load Combat Encounter',
      action: () => {
        const graph = getDemoGraphById('combat-encounter');
        if (graph) onLoadGraph(graph);
      },
    },
    {
      key: 'c',
      description: 'Clear Canvas',
      action: onClearGraph,
    },
    {
      key: 'g',
      description: 'Generate Preview',
      action: onGeneratePreview,
    },
    {
      key: 'l',
      description: 'Toggle Asset Library',
      action: onToggleAssetLibrary,
    },
    {
      key: 'd',
      description: 'Start Demo',
      action: onStartDemo,
      modifier: 'cmd',
    },
  ];

  const allShortcuts = [...defaultShortcuts, ...additionalShortcuts];

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if typing in an input
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Check each shortcut
    for (const shortcut of allShortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      
      const modifierMatches = 
        (!shortcut.modifier) ||
        (shortcut.modifier === 'cmd' && (event.metaKey || event.ctrlKey)) ||
        (shortcut.modifier === 'ctrl' && event.ctrlKey) ||
        (shortcut.modifier === 'shift' && event.shiftKey) ||
        (shortcut.modifier === 'alt' && event.altKey);

      if (keyMatches && modifierMatches) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [allShortcuts]);

  // Register keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Show shortcuts help
  const [showHelp, setShowHelp] = React.useState(false);

  useEffect(() => {
    const handleHelpKey = (e: KeyboardEvent) => {
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setShowHelp(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleHelpKey);
    return () => {
      window.removeEventListener('keydown', handleHelpKey);
    };
  }, []);

  // Format shortcut display
  const formatShortcut = (shortcut: DemoShortcut) => {
    let keys = '';
    if (shortcut.modifier === 'cmd') keys += '⌘';
    else if (shortcut.modifier === 'ctrl') keys += 'Ctrl+';
    else if (shortcut.modifier === 'shift') keys += '⇧';
    else if (shortcut.modifier === 'alt') keys += '⌥';
    
    keys += shortcut.key.toUpperCase();
    return keys;
  };

  if (!showHelp) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: 32,
      borderRadius: 12,
      maxWidth: 500,
      zIndex: 9999,
      backdropFilter: 'blur(10px)',
    }}>
      <h3 style={{ margin: '0 0 24px 0', fontSize: 24 }}>
        🎮 Demo Shortcuts
      </h3>
      
      <div style={{ display: 'grid', gap: 12 }}>
        {allShortcuts.map((shortcut, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <kbd style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '4px 12px',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: 14,
              minWidth: 60,
              textAlign: 'center',
              fontFamily: 'monospace',
            }}>
              {formatShortcut(shortcut)}
            </kbd>
            <span style={{ fontSize: 14, opacity: 0.9 }}>
              {shortcut.description}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 24,
        paddingTop: 24,
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        fontSize: 12,
        opacity: 0.7,
        textAlign: 'center',
      }}>
        Press ? or Escape to close
      </div>
    </div>
  );
};