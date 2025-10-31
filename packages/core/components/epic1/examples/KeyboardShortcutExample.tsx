/**
 * Example: Keyboard Shortcut Reference Implementation
 * 
 * Demonstrates how to use the keyboard shortcut system
 * with Epic 1's help functionality.
 */

import React, { useState } from 'react';
import {
  KeyboardShortcutProvider,
  KeyboardShortcutIntegration,
  useKeyboardShortcutManager,
  useCommonShortcuts,
  ShortcutHint,
} from '../onboarding/KeyboardShortcutManager';
import { 
  VisualKeyboardMap, 
  CompactKeyboardView 
} from '../onboarding/VisualKeyboardMap';
import { TutorialProvider } from '../onboarding/TutorialContext';

// Example: Basic keyboard shortcut integration
export const BasicKeyboardExample: React.FC = () => {
  const [message, setMessage] = useState('Press keyboard shortcuts to see actions');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const EditorComponent = () => {
    const { registerCommonShortcuts } = useCommonShortcuts();
    const manager = useKeyboardShortcutManager();

    React.useEffect(() => {
      // Register common shortcuts
      registerCommonShortcuts({
        onSave: () => {
          setMessage('💾 Saved!');
          setTimeout(() => setMessage(''), 2000);
        },
        onUndo: () => {
          if (undoStack.length > 0) {
            const [last, ...rest] = undoStack;
            setUndoStack(rest);
            setRedoStack([last, ...redoStack]);
            setMessage(`↩️ Undid: ${last}`);
          }
        },
        onRedo: () => {
          if (redoStack.length > 0) {
            const [last, ...rest] = redoStack;
            setRedoStack(rest);
            setUndoStack([last, ...undoStack]);
            setMessage(`↪️ Redid: ${last}`);
          }
        },
        onDuplicate: () => setMessage('📋 Duplicated selection'),
        onSelectAll: () => setMessage('🎯 Selected all'),
        onPreview: () => setMessage('👁️ Generating preview...'),
        onExport: () => setMessage('📤 Exporting...'),
      });

      // Register custom shortcuts
      manager.registerShortcut({
        id: 'custom-action',
        keys: ['G'],
        handler: () => setMessage('🎮 Custom action triggered!'),
        description: 'Custom game action',
        category: 'custom',
        preventDefault: true,
      });

      manager.registerShortcut({
        id: 'toggle-theme',
        keys: ['Ctrl/Cmd', 'T'],
        handler: () => setMessage('🎨 Theme toggled'),
        description: 'Toggle theme',
        category: 'ui',
        preventDefault: true,
      });
    }, [registerCommonShortcuts, manager]);

    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h3>Try these shortcuts:</h3>
        <CompactKeyboardView />
        
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
        }}>
          {message || 'Press a shortcut key...'}
        </div>

        <button
          onClick={() => {
            const action = `Action ${undoStack.length + 1}`;
            setUndoStack([action, ...undoStack]);
            setMessage(`✅ Performed: ${action}`);
          }}
          style={{
            marginTop: '20px',
            padding: '8px 16px',
            fontSize: '14px',
          }}
        >
          Perform Action (to test undo/redo)
        </button>

        <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
          Undo stack: {undoStack.length} | Redo stack: {redoStack.length}
        </div>
      </div>
    );
  };

  return (
    <TutorialProvider>
      <KeyboardShortcutProvider>
        <div style={{ padding: '40px' }}>
          <h2>Basic Keyboard Shortcuts Example</h2>
          <EditorComponent />
          
          <div style={{ marginTop: '20px' }}>
            <ShortcutHint shortcut={['?']} description="Press to see all shortcuts" />
          </div>
        </div>
      </KeyboardShortcutProvider>
    </TutorialProvider>
  );
};

// Example: Visual keyboard map
export const VisualKeyboardExample: React.FC = () => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setActiveKeys(prev => new Set(prev).add(e.key));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(e.key);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div style={{ padding: '40px' }}>
      <h2>Visual Keyboard Map</h2>
      <p style={{ marginBottom: '20px', color: '#6b7280' }}>
        Press keys on your keyboard to see them highlighted
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <VisualKeyboardMap activeKeys={activeKeys} />
      </div>
    </div>
  );
};

// Example: Context-aware shortcuts
type ContentEditorProps = {
  mode: 'edit' | 'view';
  setMode: React.Dispatch<React.SetStateAction<'edit' | 'view'>>;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  selected: boolean;
  setSelected: React.Dispatch<React.SetStateAction<boolean>>;
};

const ContentEditor: React.FC<ContentEditorProps> = ({
  mode,
  setMode,
  content,
  setContent,
  selected,
  setSelected,
}) => {
  const manager = useKeyboardShortcutManager();

  React.useEffect(() => {
    // Mode-specific shortcuts
    if (mode === 'edit') {
      manager.registerShortcut({
        id: 'save-edit',
        keys: ['Enter'],
        handler: () => {
          setMode('view');
          setSelected(false);
        },
        description: 'Save and exit edit mode',
        category: 'edit',
      });

      manager.registerShortcut({
        id: 'cancel-edit',
        keys: ['Escape'],
        handler: () => {
          setMode('view');
          setContent('Click to edit this text');
          setSelected(false);
        },
        description: 'Cancel edit',
        category: 'edit',
      });
    } else {
      manager.unregisterShortcut('save-edit');
      manager.unregisterShortcut('cancel-edit');

      manager.registerShortcut({
        id: 'enter-edit',
        keys: ['E'],
        handler: () => {
          if (selected) {
            setMode('edit');
          }
        },
        description: 'Enter edit mode',
        category: 'edit',
        enabled: selected,
      });
    }

    // Always-available shortcuts
    manager.registerShortcut({
      id: 'toggle-select',
      keys: ['Space'],
      handler: () => {
        if (mode === 'view') {
          setSelected((prev) => !prev);
        }
      },
      description: 'Toggle selection',
      category: 'selection',
      preventDefault: true,
    });

    return () => {
      manager.unregisterShortcut('save-edit');
      manager.unregisterShortcut('cancel-edit');
      manager.unregisterShortcut('enter-edit');
      manager.unregisterShortcut('toggle-select');
    };
  }, [mode, selected, manager, setMode, setContent, setSelected]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        marginBottom: '16px',
        padding: '8px 12px',
        backgroundColor: mode === 'edit' ? '#fef3c7' : '#e0e7ff',
        borderRadius: '6px',
        fontSize: '14px',
      }}>
        Mode: <strong>{mode === 'edit' ? '✏️ Edit' : '👁️ View'}</strong>
      </div>

      {mode === 'edit' ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '12px',
            border: '2px solid #3b82f6',
            borderRadius: '6px',
            fontSize: '14px',
          }}
          autoFocus
        />
      ) : (
        <div
          onClick={() => setSelected(true)}
          style={{
            padding: '12px',
            border: `2px ${selected ? 'solid' : 'dashed'} ${selected ? '#3b82f6' : '#e5e7eb'}`,
            borderRadius: '6px',
            backgroundColor: selected ? '#eff6ff' : 'white',
            cursor: 'pointer',
            minHeight: '100px',
          }}
        >
          {content}
        </div>
      )}

      <div style={{ marginTop: '16px' }}>
        <h4>Available shortcuts in {mode} mode:</h4>
        {mode === 'edit' ? (
          <div>
            <ShortcutHint shortcut={['Enter']} description="Save changes" />
            <br />
            <ShortcutHint shortcut={['Escape']} description="Cancel edit" />
          </div>
        ) : (
          <div>
            <ShortcutHint shortcut={['Space']} description="Select/deselect" />
            <br />
            {selected && <ShortcutHint shortcut={['E']} description="Edit selected" />}
          </div>
        )}
      </div>
    </div>
  );
};

export const ContextAwareExample: React.FC = () => {
  const [mode, setMode] = useState<'edit' | 'view'>('view');
  const [content, setContent] = useState('Click to edit this text');
  const [selected, setSelected] = useState(false);

  return (
    <TutorialProvider>
      <KeyboardShortcutProvider>
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <h2>Context-Aware Shortcuts</h2>
          <p style={{ marginBottom: '20px', color: '#6b7280' }}>
            Shortcuts change based on the current mode and selection
          </p>
          <ContentEditor
            mode={mode}
            setMode={setMode}
            content={content}
            setContent={setContent}
            selected={selected}
            setSelected={setSelected}
          />
        </div>
      </KeyboardShortcutProvider>
    </TutorialProvider>
  );
};

// Example: Full integration
export const FullIntegrationExample: React.FC = () => {
  return (
    <TutorialProvider>
      <KeyboardShortcutIntegration>
        <div style={{ padding: '40px' }}>
          <h2>Full Keyboard Shortcut Integration</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '20px',
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
            }}>
              <h3>Canvas Area</h3>
              <p>Simulated graph editor area</p>
              <div style={{
                height: '200px',
                backgroundColor: 'white',
                border: '2px dashed #e5e7eb',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
              }}>
                Graph nodes would appear here
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
            }}>
              <h3>Inspector Panel</h3>
              <p>Node properties and settings</p>
              <CompactKeyboardView />
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              The keyboard shortcut help (?) is always available in the bottom right corner
            </p>
          </div>
        </div>
      </KeyboardShortcutIntegration>
    </TutorialProvider>
  );
};
