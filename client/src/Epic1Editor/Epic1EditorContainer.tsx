import React, { useEffect, useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { ToastContainer, useToast } from '../Toast';
import { useSupabaseFileOperations } from './hooks/useSupabaseFileOperations';
import { useEditOperations } from './hooks/useEditOperations';
import { SupabaseOpenDialog } from './components/SupabaseOpenDialog';
import { SupabaseSaveDialog } from './components/SupabaseSaveDialog';
import { testSupabaseConnection } from './hooks/testSupabase';
import {
  calculateViewportDimensions,
  calculateNodePositions,
  createDemoNodes,
  enforceFrameEdgePositions
} from './utils/nodePositioning';
import {
  validateGraph,
  formatValidationMessage
} from './utils/graphValidation';
import { Epic1GraphEditorProps, ProfessionalMenuBarProps } from './types';
import { stylePresets, getConsoleStyle } from './utils/styleUtils';
import '@promptscape/core/components/epic1/Epic1GraphEditor.css';
import '@promptscape/core/components/epic1/nodes/BaseEditableNode.css';
import '@promptscape/core/components/epic1/nodes/NodeStyles.css';
import '../Epic1ReactFlowFix.css';
import './styles/about-modal.css';
import './styles/theme-variables.css';

interface Epic1EditorContainerProps {
  showPreview?: boolean;
  showAssetLibrary?: boolean;
  assetLibraryPosition?: 'left' | 'right';
  showMenuBar?: boolean;
  showOnboarding?: boolean;
}

export const Epic1EditorContainer: React.FC<Epic1EditorContainerProps> = ({
  showPreview = true,
  showAssetLibrary = true,
  assetLibraryPosition = 'right',
  showMenuBar = true,
  showOnboarding = false
}) => {
  // Component loading state
  const [EditorComponent, setEditorComponent] =
    useState<React.ComponentType<Epic1GraphEditorProps> | null>(null);
  const [MenuBarComponent, setMenuBarComponent] =
    useState<React.ComponentType<ProfessionalMenuBarProps> | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const [isComponentsLoading, setIsComponentsLoading] = useState(true);
  const [assetLibraryVisible, setAssetLibraryVisible] =
    useState(showAssetLibrary);

  // Calculate viewport and node positions
  const viewport = calculateViewportDimensions();
  const nodePositions = calculateNodePositions(viewport);
  const demoNodes = createDemoNodes(nodePositions);
  const demoEdges: Edge[] = [
    {
      id: 'e1',
      source: 'prompt-1',
      sourceHandle: 'source',
      target: 'setting-1',
      targetHandle: 'target'
    },
    {
      id: 'e2',
      source: 'setting-1',
      sourceHandle: 'source',
      target: 'prompt-2',
      targetHandle: 'target'
    },
    {
      id: 'e3',
      source: 'prompt-2',
      sourceHandle: 'source',
      target: 'character-1',
      targetHandle: 'target'
    },
    {
      id: 'e4',
      source: 'character-1',
      sourceHandle: 'source',
      target: 'output-1',
      targetHandle: 'target'
    }
  ];

  // Graph state - start with empty graph
  const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);
  const [editorKey, setEditorKey] = useState(0);

  // View state
  const [gridVisible, setGridVisible] = useState(true);
  const [minimapVisible, setMinimapVisible] = useState(false);
  const [inspectorVisible, setInspectorVisible] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'cinema'>(
    'cinema'
  );

  // Toast notifications
  const { toasts, showToast, dismissToast } = useToast();

  // Supabase file operations hook
  const {
    isAuthenticated,
    savedGraphs,
    isLoading,
    showOpenDialog,
    showSaveDialog,
    setShowOpenDialog,
    setShowSaveDialog,
    handleSupabaseOpen,
    handleSupabaseSave,
    handleLocalOpen,
    loadGraph,
    deleteGraph,
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleQuit
  } = useSupabaseFileOperations({
    onNodesChange: setCurrentNodes,
    onEdgesChange: setCurrentEdges,
    onEditorKeyChange: setEditorKey,
    showToast
  });

  // Edit operations hook
  const {
    addToHistory,
    handleUndo,
    handleRedo,
    handleCopy,
    handlePaste,
    canUndo,
    canRedo,
    hasSelection
  } = useEditOperations({
    currentNodes,
    currentEdges,
    onNodesChange: setCurrentNodes,
    onEdgesChange: setCurrentEdges,
    onEditorKeyChange: setEditorKey,
    showToast
  });

  // Validation handlers
  const handleValidateGraph = useCallback(() => {
    const issues = validateGraph(currentNodes, currentEdges);
    const message = formatValidationMessage(issues);
    const type = issues.some(i => i.type === 'error')
      ? 'error'
      : issues.length > 0
        ? 'warning'
        : 'success';
    showToast(message, type);
  }, [currentNodes, currentEdges, showToast]);

  const handleConsoleToggle = useCallback(() => {
    console.log('%c=== Prompt Spaghetti Debug Console ===', getConsoleStyle());
    console.log('Graph Nodes:', currentNodes);
    console.log('Graph Edges:', currentEdges);
    console.log('Viewport:', viewport);
    showToast('Debug info logged to console (F12 to open)', 'info');
  }, [currentNodes, currentEdges, viewport, showToast]);

  const handleAbout = useCallback(() => {
    const aboutDiv = document.createElement('div');
    aboutDiv.innerHTML = `
      <div class="about-modal-container">
        <h2 class="about-modal-heading">Prompt Spaghetti</h2>
        <p class="about-modal-text">Version 1.0.0</p>
        <p class="about-modal-description">
          A professional node-based editor for creating dynamic prompts with weighted choices, 
          variables, and conditional logic.
        </p>
        <div class="about-modal-footer">
          <p class="about-modal-footer-text">
            Built with React Flow, TypeScript, and ❤️
          </p>
          <p class="about-modal-footer-text">
            © 2025 Prompt Spaghetti Team
          </p>
        </div>
        <button class="about-modal-button" onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
      <div class="about-modal-overlay" onclick="this.remove()"></div>
    `;
    document.body.appendChild(aboutDiv);
  }, []);

  // View operation handlers
  const handleZoomIn = useCallback(() => {
    const reactFlow = (window as any).reactFlowInstance;
    if (reactFlow) {
      reactFlow.zoomIn();
      showToast('Zoomed in', 'info');
    }
  }, [showToast]);

  const handleZoomOut = useCallback(() => {
    const reactFlow = (window as any).reactFlowInstance;
    if (reactFlow) {
      reactFlow.zoomOut();
      showToast('Zoomed out', 'info');
    }
  }, [showToast]);

  const handleFitView = useCallback(() => {
    const reactFlow = (window as any).reactFlowInstance;
    if (reactFlow) {
      reactFlow.fitView({ padding: 0.2 });
      showToast('Fit to view', 'info');
    }
  }, [showToast]);

  const handleSelectAll = useCallback(() => {
    // Actually select all nodes and edges
    setCurrentNodes(nodes => nodes.map(n => ({ ...n, selected: true })));
    setCurrentEdges(edges => edges.map(e => ({ ...e, selected: true })));
    showToast(
      `Selected ${currentNodes.length} nodes and ${currentEdges.length} edges`,
      'info'
    );
  }, [currentNodes, currentEdges, showToast]);

  const handleCut = useCallback(() => {
    handleCopy();
    const selectedNodes = currentNodes.filter(n => n.selected);
    const selectedNodeIds = selectedNodes.map(n => n.id);
    const remainingNodes = currentNodes.filter(n => !n.selected);
    const remainingEdges = currentEdges.filter(
      e =>
        !selectedNodeIds.includes(e.source) &&
        !selectedNodeIds.includes(e.target)
    );
    setCurrentNodes(remainingNodes);
    setCurrentEdges(remainingEdges);
    showToast(`Cut ${selectedNodes.length} nodes`, 'info');
  }, [currentNodes, currentEdges, handleCopy, showToast]);

  const handleFind = useCallback(() => {
    const searchTerm = prompt('Search for node by label or ID:');
    if (searchTerm) {
      const found = currentNodes.find(
        n =>
          n.id.includes(searchTerm) ||
          (n.data?.label && String(n.data.label).includes(searchTerm))
      );
      if (found) {
        showToast(`Found node: ${found.id}`, 'success');
      } else {
        showToast('No matching nodes found', 'warning');
      }
    }
  }, [currentNodes, showToast]);

  const handlePreferences = useCallback(() => {
    showToast('Preferences panel coming soon!', 'info');
  }, [showToast]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.psg';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          try {
            const data = JSON.parse(event.target?.result as string);
            if (data.nodes && data.edges) {
              setCurrentNodes(data.nodes);
              setCurrentEdges(data.edges);
              setEditorKey(prev => prev + 1);
              showToast('Graph imported successfully', 'success');
            }
          } catch (error) {
            showToast('Failed to import file', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [showToast]);

  const handleExport = useCallback(
    (format: 'json' | 'png' | 'svg' | 'pdf') => {
      if (format === 'json') {
        const data = JSON.stringify(
          { nodes: currentNodes, edges: currentEdges },
          null,
          2
        );
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'graph.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Graph exported as JSON', 'success');
      } else {
        showToast(`Export as ${format.toUpperCase()} coming soon!`, 'info');
      }
    },
    [currentNodes, currentEdges, showToast]
  );

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      showToast('Entered fullscreen mode', 'info');
    } else {
      document.exitFullscreen();
      showToast('Exited fullscreen mode', 'info');
    }
  }, [showToast]);

  const handleDevTools = useCallback(() => {
    showToast('Press F12 to open Developer Tools', 'info');
  }, [showToast]);

  const handlePerformanceMonitor = useCallback(() => {
    console.log('%c=== Performance Metrics ===', getConsoleStyle());
    console.log('Nodes:', currentNodes.length);
    console.log('Edges:', currentEdges.length);
    console.log('Memory:', (performance as any).memory);
    showToast('Performance metrics logged to console', 'info');
  }, [currentNodes, currentEdges, showToast]);

  const handleDocumentation = useCallback(() => {
    window.open('https://github.com/your-repo/prompt-spaghetti/wiki', '_blank');
    showToast('Opening documentation...', 'info');
  }, [showToast]);

  const handleKeyboardShortcuts = useCallback(() => {
    const shortcutsDiv = document.createElement('div');
    shortcutsDiv.innerHTML = `
      <div class="about-modal-container" style="max-width: 600px;">
        <h2 class="about-modal-heading">Keyboard Shortcuts</h2>
        <div style="text-align: left; padding: 20px;">
          <h3>File</h3>
          <p>⌘N - New | ⌘O - Open | ⌘S - Save | ⌘⇧S - Save As</p>
          <h3>Edit</h3>
          <p>⌘Z - Undo | ⌘⇧Z - Redo | ⌘C - Copy | ⌘V - Paste | ⌘X - Cut</p>
          <h3>View</h3>
          <p>⌘+ - Zoom In | ⌘- - Zoom Out | ⌘0 - Fit View</p>
          <h3>Debug</h3>
          <p>F12 - DevTools | ⌘⇧V - Validate | ⌘⇧C - Console</p>
        </div>
        <button class="about-modal-button" onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
      <div class="about-modal-overlay" onclick="this.remove()"></div>
    `;
    document.body.appendChild(shortcutsDiv);
  }, []);

  const handleSupport = useCallback(() => {
    window.open(
      'https://github.com/your-repo/prompt-spaghetti/issues',
      '_blank'
    );
    showToast('Opening support page...', 'info');
  }, [showToast]);

  const handleReportBug = useCallback(() => {
    window.open(
      'https://github.com/your-repo/prompt-spaghetti/issues/new',
      '_blank'
    );
    showToast('Opening bug report form...', 'info');
  }, [showToast]);

  // Toggle handlers for View menu
  const handleToggleGrid = useCallback(() => {
    setGridVisible(prev => !prev);
    showToast(`Grid ${gridVisible ? 'hidden' : 'shown'}`, 'info');
  }, [gridVisible, showToast]);

  const handleToggleMinimap = useCallback(() => {
    setMinimapVisible(prev => !prev);
    showToast(`Minimap ${minimapVisible ? 'hidden' : 'shown'}`, 'info');
  }, [minimapVisible, showToast]);

  const handleToggleInspector = useCallback(() => {
    setInspectorVisible(prev => !prev);
    showToast(`Inspector ${inspectorVisible ? 'hidden' : 'shown'}`, 'info');
  }, [inspectorVisible, showToast]);

  const handleToggleAssetLibrary = useCallback(() => {
    setAssetLibraryVisible(prev => !prev);
    showToast(
      `Asset Library ${assetLibraryVisible ? 'hidden' : 'shown'}`,
      'info'
    );
  }, [assetLibraryVisible, showToast]);

  const handleToggleTheme = useCallback(
    (theme: 'light' | 'dark' | 'cinema') => {
      setCurrentTheme(theme);
      // Apply theme to document root
      document.documentElement.setAttribute('data-theme', theme);
      showToast(`Switched to ${theme} theme`, 'info');
    },
    [showToast]
  );

  // Handle node changes with frame edge enforcement
  const handleNodesChange = useCallback(
    (nodes: Node[]) => {
      const fixedNodes = enforceFrameEdgePositions(nodes, demoNodes);

      // Always update nodes immediately for smooth interaction
      setCurrentNodes(fixedNodes);

      // Only add to history if nodes were added/removed
      if (nodes.length !== currentNodes.length) {
        setTimeout(() => addToHistory(fixedNodes, currentEdges), 300);
      }
    },
    [currentNodes, currentEdges, demoNodes, addToHistory]
  );

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (edges: Edge[]) => {
      // Always update edges immediately for smooth interaction
      setCurrentEdges(edges);

      // Only add to history if edges were added/removed
      if (edges.length !== currentEdges.length) {
        setTimeout(() => addToHistory(currentNodes, edges), 300);
      }
    },
    [currentNodes, currentEdges, addToHistory]
  );

  // Test Supabase connection on mount
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  // Load components
  useEffect(() => {
    let mounted = true;

    const loadComponents = async () => {
      try {
        const [epic1Module, menuBarModule] = await Promise.all([
          import('@promptscape/core/components/epic1'),
          showMenuBar
            ? import('@promptscape/core/components/MenuBar/ProfessionalMenuBar')
            : Promise.resolve(null)
        ]);

        if (!mounted) return;

        if (epic1Module.Epic1GraphEditorWithProvider) {
          setEditorComponent(() => epic1Module.Epic1GraphEditorWithProvider);
        }

        if (menuBarModule?.ProfessionalMenuBar) {
          setMenuBarComponent(() => menuBarModule.ProfessionalMenuBar);
        }
      } catch (err) {
        if (mounted) {
          setLoadError((err as Error).message || 'Failed to load components');
        }
      } finally {
        if (mounted) {
          setIsComponentsLoading(false);
        }
      }
    };

    loadComponents();

    return () => {
      mounted = false;
    };
  }, [showMenuBar]);

  if (loadError) {
    return <div className="error-message">Error: {loadError}</div>;
  }

  if (isComponentsLoading || !EditorComponent) {
    return <div className="loading-message">Loading...</div>;
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {showMenuBar && MenuBarComponent && (
        <MenuBarComponent
          // File operations
          onNew={() => handleNew(demoNodes, demoEdges)}
          onOpen={handleOpen}
          onSave={() => handleSave(currentNodes, currentEdges)}
          onSaveAs={() => handleSaveAs(currentNodes, currentEdges)}
          onImport={handleImport}
          onExport={handleExport}
          onQuit={() => handleQuit(currentNodes, currentEdges)}
          // Edit operations
          onUndo={handleUndo}
          onRedo={handleRedo}
          onCut={handleCut}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onSelectAll={handleSelectAll}
          onFind={handleFind}
          onPreferences={handlePreferences}
          // View operations
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
          onToggleGrid={handleToggleGrid}
          onToggleMinimap={handleToggleMinimap}
          onToggleInspector={handleToggleInspector}
          onToggleAssetLibrary={handleToggleAssetLibrary}
          onToggleFullscreen={handleToggleFullscreen}
          onToggleTheme={handleToggleTheme}
          // Debug operations
          onDevTools={handleDevTools}
          onValidateGraph={handleValidateGraph}
          onPerformanceMonitor={handlePerformanceMonitor}
          onConsoleToggle={handleConsoleToggle}
          // Help operations
          onDocumentation={handleDocumentation}
          onKeyboardShortcuts={handleKeyboardShortcuts}
          onAbout={handleAbout}
          onSupport={handleSupport}
          onReportBug={handleReportBug}
          // State
          canUndo={canUndo}
          canRedo={canRedo}
          hasSelection={hasSelection}
          nodes={currentNodes}
          edges={currentEdges}
          gridVisible={gridVisible}
          minimapVisible={minimapVisible}
          inspectorVisible={inspectorVisible}
          assetLibraryVisible={assetLibraryVisible}
          theme={currentTheme}
        />
      )}

      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
        <EditorComponent
          key={editorKey}
          initialNodes={currentNodes}
          initialEdges={currentEdges}
          showPreview={showPreview}
          showAssetLibrary={assetLibraryVisible}
          assetLibraryPosition={assetLibraryPosition}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
        />
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Supabase Dialogs */}
      <SupabaseOpenDialog
        isOpen={showOpenDialog}
        onClose={() => setShowOpenDialog(false)}
        graphs={savedGraphs}
        onLoad={loadGraph}
        onDelete={deleteGraph}
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
        onLocalOpen={handleLocalOpen}
      />

      <SupabaseSaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={(name, description, isPublic, tags) => {
          handleSupabaseSave(
            currentNodes,
            currentEdges,
            name,
            description,
            isPublic
          );
        }}
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
        currentNodes={currentNodes}
        currentEdges={currentEdges}
      />
    </div>
  );
};
