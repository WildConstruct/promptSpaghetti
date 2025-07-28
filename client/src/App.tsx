import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import 'reactflow/dist/style.css';
import './randomizer.css';
import './professional-theme.css';

import EnhancedGraphEditor from './components/EnhancedGraphEditor';
import { NodePrototypePage } from './components/NodePrototype';
import { ProfessionalMenuBar } from '../../packages/core/components/MenuBar/ProfessionalMenuBar';
import { KeyboardShortcutsManager } from '../../packages/core/components/CommandPalette/KeyboardShortcutsManager';

interface GraphEditorProps {
  initialNodes?: unknown[];
  initialEdges?: unknown[];
}

interface RandomizerPanelProps {
  onGraphGenerated?: (graph: unknown) => void;
  onError?: (error: Error) => void;
  className?: string;
}

// Enhanced import approach - try full core, fallback to enhanced editor with professional features
let GraphEditor: React.ComponentType<GraphEditorProps> = EnhancedGraphEditor;
let RandomizerPanel: React.ComponentType<RandomizerPanelProps>;
let isEnhancedMode = false;

try {
  // Try to import full core components (works in development)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const coreModule = require('./core');
  if (coreModule.GraphEditor && coreModule.RandomizerPanel) {
    GraphEditor = coreModule.GraphEditor;
    RandomizerPanel = coreModule.RandomizerPanel;
    isEnhancedMode = true;
  } else {
    throw new Error('Core components not fully available');
  }
} catch {
  console.warn('⚠️ Using enhanced components with professional features for deployment compatibility');
  
  // Use EnhancedGraphEditor which includes professional features
  GraphEditor = EnhancedGraphEditor;
  
  // Browser-safe RandomizerPanel for deployment
  const BrowserSafeRandomizerPanel: React.FC<RandomizerPanelProps> = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      backgroundColor: 'var(--color-bg-primary, #1e1e1e)',
      flexDirection: 'column',
      padding: '40px'
    }}>
      <div style={{
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: 'var(--color-text-primary, #e8e8e8)'
      }}>
        🎲 Professional Graph Editor
      </div>
      <div style={{
        fontSize: '18px',
        color: 'var(--color-text-secondary, #b8b8b8)',
        textAlign: 'center',
        maxWidth: '600px',
        lineHeight: 1.6,
        marginBottom: '20px'
      }}>
        The professional-grade nodal prompt randomizer with Cinema 4D-inspired design.
        Full professional features are available in the Graph Editor.
      </div>
      <div style={{
        fontSize: '14px',
        color: 'var(--color-text-secondary, #b8b8b8)',
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        Command palette, undo/redo, multi-selection, and keyboard shortcuts included.
      </div>
    </div>
  );
  
  RandomizerPanel = BrowserSafeRandomizerPanel;
}

/**
 * Main application interface with tab navigation.
 * Handles graph editor and LLM randomizer functionality.
 */
function MainApp(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const [generatedGraph, setGeneratedGraph] = useState<unknown>(null);
  
  // Menu bar state
  const [theme, setTheme] = useState<'light' | 'dark' | 'cinema'>('cinema');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gridVisible, setGridVisible] = useState(true);
  const [minimapVisible, setMinimapVisible] = useState(true);
  const [inspectorVisible, setInspectorVisible] = useState(true);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Determine active tab based on current route (simplified, no auth)
  const getActiveTab = (): string => {
    if (location.pathname === '/randomizer') return 'randomizer';
    if (location.pathname === '/files') return 'files';
    if (location.pathname === '/prototype') return 'prototype';
    return 'editor';
  };
  const activeTab = getActiveTab();

  const handleTabChange = useCallback((tab: 'editor' | 'randomizer' | 'files' | 'prototype') => {
    const paths = {
      editor: '/',
      randomizer: '/randomizer',
      files: '/files',
      prototype: '/prototype'
    };
    navigate(paths[tab] || '/');
  }, [navigate]);

  const handleGraphGenerated = useCallback((graph: unknown) => {
    setGeneratedGraph(graph);
    navigate('/'); // Navigate to editor tab
  }, [navigate]);

  const handleRandomizerError = useCallback((error: Error) => {
    console.error('Randomizer error:', error);
    alert(`Generation failed: ${error.message}`);
  }, []);

  // Menu bar handlers
  const menuBarHandlers = {
    // File operations
    onNew: useCallback(() => {
      if (confirm('Create a new graph? Unsaved changes will be lost.')) {
        setGeneratedGraph(null);
        navigate('/');
      }
    }, [navigate]),
    
    onOpen: useCallback(() => {
      // TODO: Integrate with file browser
      console.log('Open file');
    }, []),
    
    onSave: useCallback(() => {
      // TODO: Integrate with save system
      console.log('Save graph');
    }, []),
    
    onSaveAs: useCallback(() => {
      // TODO: Integrate with save system
      console.log('Save as...');
    }, []),
    
    onImport: useCallback(() => {
      // TODO: Integrate with import system
      console.log('Import');
    }, []),
    
    onExport: useCallback((format: 'json' | 'png' | 'svg' | 'pdf') => {
      // TODO: Integrate with export system
      console.log('Export as', format);
    }, []),
    
    // Edit operations
    onUndo: useCallback(() => {
      // TODO: Integrate with undo system
      console.log('Undo');
    }, []),
    
    onRedo: useCallback(() => {
      // TODO: Integrate with redo system
      console.log('Redo');
    }, []),
    
    onSelectAll: useCallback(() => {
      // TODO: Integrate with selection system
      console.log('Select all');
    }, []),
    
    // View operations
    onZoomIn: useCallback(() => {
      // TODO: Integrate with React Flow zoom
      console.log('Zoom in');
    }, []),
    
    onZoomOut: useCallback(() => {
      // TODO: Integrate with React Flow zoom
      console.log('Zoom out');
    }, []),
    
    onFitView: useCallback(() => {
      // TODO: Integrate with React Flow fit view
      console.log('Fit view');
    }, []),
    
    onToggleGrid: useCallback(() => {
      setGridVisible(prev => !prev);
    }, []),
    
    onToggleMinimap: useCallback(() => {
      setMinimapVisible(prev => !prev);
    }, []),
    
    onToggleInspector: useCallback(() => {
      setInspectorVisible(prev => !prev);
    }, []),
    
    onToggleFullscreen: useCallback(() => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }, []),
    
    onToggleTheme: useCallback((newTheme: 'light' | 'dark' | 'cinema') => {
      setTheme(newTheme);
    }, []),
    
    // Navigation handlers
    onViewEditor: useCallback(() => handleTabChange('editor'), [handleTabChange]),
    onViewRandomizer: useCallback(() => handleTabChange('randomizer'), [handleTabChange]),
    onViewFiles: useCallback(() => handleTabChange('files'), [handleTabChange]),
    onViewPrototype: useCallback(() => handleTabChange('prototype'), [handleTabChange]),
    
    // Help operations
    onKeyboardShortcuts: useCallback(() => {
      // Trigger the help by simulating ? key press
      const event = new KeyboardEvent('keydown', {
        key: '?',
        shiftKey: true,
        bubbles: true
      });
      document.dispatchEvent(event);
    }, []),
    
    onAbout: useCallback(() => {
      alert('Prompt Spaghetti - Professional Graph Editor\nVersion 1.0.0\nCinema 4D-inspired interface');
    }, []),
    
    // Additional handlers for KeyboardShortcutsManager
    onDelete: useCallback(() => {
      // TODO: Integrate with selection deletion
      console.log('Delete selected items');
    }, []),
    
    onDuplicate: useCallback(() => {
      // TODO: Integrate with node duplication
      console.log('Duplicate selected items');
    }, []),
    
    onGenerateCharacter: useCallback(() => {
      // TODO: Integrate with character generation
      console.log('Generate character');
    }, []),
    
    onCommandPalette: useCallback(() => {
      // TODO: Integrate with command palette
      console.log('Open command palette');
    }, []),
  };


  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Professional Menu Bar */}
      <ProfessionalMenuBar
        {...menuBarHandlers}
        theme={theme}
        isFullscreen={isFullscreen}
        gridVisible={gridVisible}
        minimapVisible={minimapVisible}
        inspectorVisible={inspectorVisible}
        nodes={[]}
        edges={[]}
      />
      
      {/* Keyboard Shortcuts Manager */}
      <KeyboardShortcutsManager
        onCommandPalette={menuBarHandlers.onCommandPalette}
        onUndo={menuBarHandlers.onUndo}
        onRedo={menuBarHandlers.onRedo}
        onSave={menuBarHandlers.onSave}
        onLoad={menuBarHandlers.onOpen}
        onExport={() => menuBarHandlers.onExport('json')}
        onSelectAll={menuBarHandlers.onSelectAll}
        onDelete={menuBarHandlers.onDelete}
        onDuplicate={menuBarHandlers.onDuplicate}
        onFitView={menuBarHandlers.onFitView}
        onZoomIn={menuBarHandlers.onZoomIn}
        onZoomOut={menuBarHandlers.onZoomOut}
        onGenerateCharacter={menuBarHandlers.onGenerateCharacter}
        onToggleFullscreen={menuBarHandlers.onToggleFullscreen}
        theme={theme}
      />
      
      {/* Tab Content Area - now hidden behind menu bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--color-ui-border, #404040)', 
        backgroundColor: 'var(--color-bg-secondary, #2a2a2a)',
        padding: '0',
        height: '40px',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex' }}>
          <button
            onClick={() => handleTabChange('editor')}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: activeTab === 'editor' ? 'var(--color-bg-primary, #1e1e1e)' : 'transparent',
              borderBottom: activeTab === 'editor' ? '2px solid var(--color-accent-orange, #ff7c00)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: activeTab === 'editor' ? 'bold' : 'normal',
              color: 'var(--color-text-primary, #e8e8e8)'
            }}
          >
            📊 Graph Editor
          </button>
          <button
            onClick={() => handleTabChange('randomizer')}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: activeTab === 'randomizer' ? 'var(--color-bg-primary, #1e1e1e)' : 'transparent',
              borderBottom: activeTab === 'randomizer' ? '2px solid var(--color-accent-orange, #ff7c00)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: activeTab === 'randomizer' ? 'bold' : 'normal',
              color: 'var(--color-text-primary, #e8e8e8)'
            }}
          >
            🎲 LLM Randomizer
          </button>
          <button
            onClick={() => handleTabChange('files')}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: activeTab === 'files' ? 'var(--color-bg-primary, #1e1e1e)' : 'transparent',
              borderBottom: activeTab === 'files' ? '2px solid var(--color-accent-orange, #ff7c00)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: activeTab === 'files' ? 'bold' : 'normal',
              color: 'var(--color-text-primary, #e8e8e8)'
            }}
          >
            📁 Files
          </button>
          <button
            onClick={() => handleTabChange('prototype')}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: activeTab === 'prototype' ? 'var(--color-bg-primary, #1e1e1e)' : 'transparent',
              borderBottom: activeTab === 'prototype' ? '2px solid var(--color-accent-orange, #ff7c00)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: activeTab === 'prototype' ? 'bold' : 'normal',
              color: 'var(--color-text-primary, #e8e8e8)'
            }}
          >
            🔬 Prototype
          </button>
        </div>
          
        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', paddingRight: '20px', color: 'var(--color-text-secondary, #666)', fontSize: '12px' }}>
          {isEnhancedMode ? '🚀 Core Enhanced' : '🎨 Professional Mode'} | {theme === 'cinema' ? '🎬 Cinema 4D' : theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'editor' ? (
          <GraphEditor 
            initialNodes={(generatedGraph as { nodes?: unknown[] })?.nodes || []}
            initialEdges={(generatedGraph as { edges?: unknown[] })?.edges || []}
          />
        ) : activeTab === 'randomizer' ? (
          <div style={{ 
            padding: '20px', 
            height: '100%', 
            overflow: 'auto',
            backgroundColor: 'var(--color-bg-primary, #1e1e1e)'
          }}>
            <RandomizerPanel
              onGraphGenerated={handleGraphGenerated}
              onError={handleRandomizerError}
              className="randomizer-main"
            />
          </div>
        ) : activeTab === 'prototype' ? (
          <NodePrototypePage />
        ) : (
          <div style={{ 
            padding: '20px', 
            height: '100%', 
            overflow: 'auto',
            backgroundColor: 'var(--color-bg-primary, #1e1e1e)',
            color: 'var(--color-text-primary, #e8e8e8)'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: 'var(--color-text-primary, #e8e8e8)'
            }}>
              📁 File Browser
            </div>
            <div style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary, #b8b8b8)',
              marginBottom: '30px'
            }}>
              Manage your saved graphs and project files
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: 'var(--color-bg-secondary, #2a2a2a)',
                border: '1px solid var(--color-ui-border, #404040)',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>📊 Recent Graphs</div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #b8b8b8)' }}>
                  View and load recently saved graphs
                </div>
              </div>
              
              <div style={{
                background: 'var(--color-bg-secondary, #2a2a2a)',
                border: '1px solid var(--color-ui-border, #404040)',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>📂 Project Templates</div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #b8b8b8)' }}>
                  Browse pre-built graph templates
                </div>
              </div>
              
              <div style={{
                background: 'var(--color-bg-secondary, #2a2a2a)',
                border: '1px solid var(--color-ui-border, #404040)',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>💾 Export/Import</div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #b8b8b8)' }}>
                  Manage file imports and exports
                </div>
              </div>
            </div>
            
            <div style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary, #b8b8b8)',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '20px'
            }}>
              Professional file management coming soon - use save/load in the Graph Editor for now
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Root App component with routing.
 * Simplified version with authentication disabled.
 */
export default function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main routes (no authentication) */}
        <Route path="/" element={<MainApp />} />
        <Route path="/randomizer" element={<MainApp />} />
        <Route path="/files" element={<MainApp />} />
        <Route path="/prototype" element={<MainApp />} />
        
        {/* Catch-all redirect to main app */}
        <Route path="*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}