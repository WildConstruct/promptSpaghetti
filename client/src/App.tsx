import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import 'reactflow/dist/style.css';
import './randomizer.css';
import './professional-theme.css';
import EnhancedGraphEditor from './components/EnhancedGraphEditor';
import { NodePrototypePage } from './components/NodePrototype';
import { ProfessionalMenuBar } from '../../packages/core/components/MenuBar/ProfessionalMenuBar';
import { KeyboardShortcutsManager } from '../../packages/core/components/CommandPalette/KeyboardShortcutsManager';
import { CommandPalette } from '../../packages/core/components/CommandPalette/CommandPalette';
import { IntegratedFileBrowser, PSGFile, ProjectManager } from '../../packages/core';
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
  padding: '40px',
}}>
      <div style={{
  fontSize: '32px',
  fontWeight: 'bold',
  marginBottom: '20px',
  color: 'var(--color-text-primary, #e8e8e8)',
}}>
        🎲 Professional Graph Editor
      </div>
      <div style={{
  fontSize: '18px',
  color: 'var(--color-text-secondary, #b8b8b8)',
  textAlign: 'center',
  maxWidth: '600px',
  lineHeight: 1.6,
  marginBottom: '20px',
}}>
        The professional-grade nodal prompt randomizer with Cinema 4D-inspired design.
        Full professional features are available in the Graph Editor.
      </div>
      <div style={{
  fontSize: '14px',
  color: 'var(--color-text-secondary, #b8b8b8)',
  textAlign: 'center',
  fontStyle: 'italic',
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
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedProjectFile, setSelectedProjectFile] = useState<PSGFile | null>(null);
  const [recentFiles, setRecentFiles] = useState<PSGFile>([]);
  const projectManager = ProjectManager.getInstance();
  // Load recent files on mount
  useEffect(() => {
    setRecentFiles(projectManager.getRecentFiles(10));
  }, [projectManager]);
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
  prototype: '/prototype',
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
      // Switch to Files tab to enable file selection
      handleTabChange('files');
    }, [handleTabChange]),
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
  bubbles: true,
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
      setShowCommandPalette(true);
    }, [])
};
  // File browser handlers
  const fileBrowserHandlers = {
  onFileSelected: useCallback((file: PSGFile) => {
  setSelectedProjectFile(file);
}, []),
    onProjectLoad: useCallback((file: PSGFile) => {
      // TODO: Integrate with ProjectManager to load .psg file
      console.log('Loading project:', file.name);
      // Add to recent files
      projectManager.addToRecentFiles(file);
      setRecentFiles(projectManager.getRecentFiles(10));
      // This would involve deserializing the .psg file and setting the graph data
      // For now, just show feedback
      alert(`Loading project: ${file.name}\n\nProject loading integration coming soon!`);
      navigate('/'); // Switch to editor tab
    }, [navigate, projectManager]),
    onNewProject: useCallback(() => {
      if (confirm('Create a new project? Any unsaved changes will be lost.')) {
        setGeneratedGraph(null);
        setSelectedProjectFile(null);
        navigate('/');
      }
    }, [navigate]),
    onFileAction: useCallback((action: string, file: PSGFile) => {
      console.log(`File action: ${action}`, file);
      // Handle file actions like delete, rename, duplicate
    }, []),
    onRecentFileLoad: useCallback((file: PSGFile) => {
      // Load recent file directly
      projectManager.addToRecentFiles(file);
      setRecentFiles(projectManager.getRecentFiles(10));
      alert(`Loading recent project: ${file.name}\n\nProject loading integration coming soon!`);
      navigate('/'); // Switch to editor tab
    }, [navigate, projectManager])
  };
  // Command palette specific handlers
  const commandPaletteHandlers = {
  onClose: useCallback(() => {
  setShowCommandPalette(false);
}, []),
    onGenerationStart: useCallback(async (flow: any, params: Record<string, any>) => {
  // TODO: Integrate with generation flows
  console.log('Starting generation flow:', flow.name, params);
  setShowCommandPalette(false);
}, []),
    onNodeCreate: useCallback((nodeType: string, position: { x: number; y: number }, data?: any) => {
  // TODO: Integrate with node creation
  console.log('Creating node:', nodeType, position, data);
  setShowCommandPalette(false);
}, []),
    onNodeDelete: useCallback((nodeIds: string) => {
  // TODO: Integrate with node deletion
  console.log('Deleting nodes:', nodeIds);
  setShowCommandPalette(false);
}, []),
    onTemplateApply: useCallback((templateId: string) => {
  // TODO: Integrate with template system
  console.log('Applying template:', templateId);
  setShowCommandPalette(false);
}, [])
};
  // Custom actions for command palette that integrate with menu bar
  const customCommandPaletteActions = [
    // File operations
    {
  id: 'file-new',
  title: 'New Graph',
  description: 'Create a new graph project',
  category: 'editing' as const,
  icon: '📄',
  shortcut: '⌘N',
  keywords: ['new', 'create', 'file'],
  action: () => {
  setShowCommandPalette(false);
  menuBarHandlers.onNew();
}
    },
    {
  id: 'file-open',
  title: 'Open Graph',
  description: 'Open an existing graph project',
  category: 'editing' as const,
  icon: '📂',
  shortcut: '⌘O',
  keywords: ['open', 'load', 'file'],
  action: () => {
  setShowCommandPalette(false);
  menuBarHandlers.onOpen();
}
    },
    {
  id: 'file-save',
  title: 'Save Graph',
  description: 'Save the current graph project',
  category: 'editing' as const,
  icon: '💾',
  shortcut: '⌘S',
  keywords: ['save', 'file'],
  action: () => {
  setShowCommandPalette(false);
  menuBarHandlers.onSave();
}
    },
    {
  id: 'export-json',
  title: 'Export as JSON',
  description: 'Export graph to JSON format',
  category: 'export' as const,
  icon: '📦',
  keywords: ['export', 'json', 'download'],
  action: () => {
  setShowCommandPalette(false);
  menuBarHandlers.onExport('json');
}
    // View operations
    {
  id: 'view-fit',
  title: 'Fit View',
  description: 'Fit entire graph in view',
  category: 'navigation' as const,
  icon: '🔍',
  shortcut: '⌘0',
  keywords: ['fit', 'view', 'zoom', 'center'],
  action: () => {
  setShowCommandPalette(false);
  menuBarHandlers.onFitView();
}
    {
  id: 'view-fullscreen',
  title: 'Toggle Fullscreen',
  description: 'Enter or exit fullscreen mode',
  category: 'navigation' as const,
  icon: '⛶',
  shortcut: 'Alt+F',
  keywords: ['fullscreen', 'full', 'screen', 'maximize'],
  action: () => {
  setShowCommandPalette(false);
  menuBarHandlers.onToggleFullscreen();
}
    {
  id: 'theme-switch',
  title: 'Switch Theme',
  description: 'Change application theme',
  category: 'editing' as const,
  icon: '🎨',
  keywords: ['theme', 'appearance', 'dark', 'light', 'cinema'],
  action: () => {
  setShowCommandPalette(false);
  const nextTheme = theme === 'cinema' ? 'dark' : theme === 'dark' ? 'light' : 'cinema';
  menuBarHandlers.onToggleTheme(nextTheme);
}
    // Navigation
    {
  id: 'nav-randomizer',
  title: 'Go to LLM Randomizer',
  description: 'Switch to the LLM Randomizer tab',
  category: 'navigation' as const,
  icon: '🎲',
  keywords: ['randomizer', 'llm', 'navigate', 'tab'],
  action: () => {
  setShowCommandPalette(false);
  menuBarHandlers.onViewRandomizer();
}
    {
  id: 'nav-files',
  title: 'Go to Files',
  description: 'Switch to the Files browser tab',
  category: 'navigation' as const,
  icon: '📁',
  keywords: ['files', 'browser', 'navigate', 'tab'],
  action: () => {
  setShowCommandPalette(false);
  menuBarHandlers.onViewFiles();
}
    // Help
    {
  id: 'help-shortcuts',
  title: 'Show Keyboard Shortcuts',
  description: 'Display keyboard shortcuts help',
  category: 'navigation' as const,
  icon: '⌨️',
  shortcut: '?',
  keywords: ['help', 'shortcuts', 'keyboard', 'keys'],
  action: () => {
  setShowCommandPalette(false);
  menuBarHandlers.onKeyboardShortcuts();
}
    {
      id: 'help-about',
      title: 'About',
      description: 'Show application information',
      category: 'navigation' as const,
      icon: 'ℹ️',
      keywords: ['about', 'info', 'version'],
      action: () => {
        setShowCommandPalette(false);
        menuBarHandlers.onAbout();
  ];
  return;
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Professional Menu Bar */}
      <ProfessionalMenuBar
        {...menuBarHandlers}
        onRecentFileLoad={fileBrowserHandlers.onRecentFileLoad}
        theme={theme}
        isFullscreen={isFullscreen}
        gridVisible={gridVisible}
        minimapVisible={minimapVisible}
        inspectorVisible={inspectorVisible}
        nodes={[]}
        edges={[]}
        recentFiles={recentFiles}
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
      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        nodes={[]}
        edges={[]}
        selectedNodes={[]}
        onExport={menuBarHandlers.onExport}
        customActions={customCommandPaletteActions}
        {...commandPaletteHandlers}
      />
      {/* Tab Content Area - now hidden behind menu bar */}
      <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '1px solid var(--color-ui-border, #404040)',
  backgroundColor: 'var(--color-bg-secondary, #2a2a2a)',
  padding: '0',
  height: '40px',
  alignItems: 'center',
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
  color: 'var(--color-text-primary, #e8e8e8)',
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
  color: 'var(--color-text-primary, #e8e8e8)',
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
  color: 'var(--color-text-primary, #e8e8e8)',
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
  color: 'var(--color-text-primary, #e8e8e8)',
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
        {activeTab === 'editor' ? ()
          <GraphEditor 
            initialNodes={(generatedGraph as { nodes?: unknown })?.nodes || []}
            initialEdges={(generatedGraph as { edges?: unknown })?.edges || []}
          />
        ) : activeTab === 'randomizer' ? ()
          <div style={{
  padding: '20px',
  height: '100%',
  overflow: 'auto',
  backgroundColor: 'var(--color-bg-primary, #1e1e1e)',
}}>
            <RandomizerPanel
              onGraphGenerated={handleGraphGenerated}
              onError={handleRandomizerError}
              className="randomizer-main"
            />
          </div>
        ) : activeTab === 'prototype' ? ()
          <NodePrototypePage />
        ) : ()
          <IntegratedFileBrowser
            theme={theme}
            height="100%"
            showCreateControls={true}
            currentProject={selectedProjectFile?.name}
            {...fileBrowserHandlers}
          />
        )}
      </div>
    </div>
  );
/**
 * Root App component with routing.
 * Simplified version with authentication disabled.
 */
export default function App(): React.ReactElement {
  return;
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