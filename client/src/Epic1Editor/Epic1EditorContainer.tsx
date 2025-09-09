import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { ToastContainer, useToast } from '../Toast';
import { useSupabaseFileOperations } from './hooks/useSupabaseFileOperations';
import { useEditOperations } from './hooks/useEditOperations';
import { SupabaseOpenDialog } from './components/SupabaseOpenDialog';
import { SupabaseSaveDialog } from './components/SupabaseSaveDialog';
import { NewDocumentModal } from './components/NewDocumentModal';
import { testSupabaseConnection } from './hooks/testSupabase';
import { GraphEditorWithTray } from './GraphEditorWithTray';
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
import { Epic1GraphEditorProps, NodeData } from './types';
import type { PromptAnalysis, GeneratedNode } from '../lib/simplePromptParser';
import { stylePresets, getConsoleStyle } from './utils/styleUtils';
import '@promptscape/core/components/epic1/Epic1GraphEditor.css';
import '@promptscape/core/components/epic1/nodes/BaseEditableNode.css';
import '@promptscape/core/components/epic1/nodes/NodeStyles.css';
import '../Epic1ReactFlowFix.css';
import './styles/about-modal.css';
import './styles/theme-variables.css';
import { fromLegacyGraph, writePsg } from '@promptscape/core';
import type { GraphNode, GraphEdge, Graph } from '@promptscape/core';
import { SimpleMenuBar } from './components/SimpleMenuBar';
import { IntelligenceProvider } from '@promptscape/core/components/epic1/contexts/IntelligenceContext';

interface Epic1EditorContainerProps {
  showPreview?: boolean;
  showAssetLibrary?: boolean;
  assetLibraryPosition?: 'left' | 'right';
  showMenuBar?: boolean;
  showOnboarding?: boolean;
  initialAnalysis?: PromptAnalysis; // PromptAnalysis from simplePromptParser
  initialGraph?: { nodes: Node[]; edges: Edge[] };
}

export const Epic1EditorContainer: React.FC<Epic1EditorContainerProps> = ({
  showPreview = true,
  showAssetLibrary = true,
  assetLibraryPosition = 'right',
  showMenuBar = true,
  showOnboarding = false,
  initialAnalysis,
  initialGraph
}) => {
  // Component loading state
  const [EditorComponent, setEditorComponent] =
    useState<React.ComponentType<Epic1GraphEditorProps> | null>(null);
  const [MenuBarComponent, setMenuBarComponent] =
    useState<React.ComponentType<any> | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const [isComponentsLoading, setIsComponentsLoading] = useState(true);
  const [assetLibraryVisible, setAssetLibraryVisible] =
    useState(showAssetLibrary);
  const hasInitialInput = Boolean(
    (initialGraph && initialGraph.nodes && initialGraph.edges) ||
      (initialAnalysis && initialAnalysis.nodes)
  );
  // Gate rendering the core editor until we've cleared its persistence when launching with initial input
  const [editorReady, setEditorReady] = useState<boolean>(!hasInitialInput);

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
  const initializedRef = useRef(false);
  const [editorKey, setEditorKey] = useState(0);
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
    showNewDocumentModal,
    confirmNewDocument,
    cancelNewDocument,
    handleSupabaseSave,
    handleLocalOpen,
    loadGraph,
    deleteGraph,
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleQuit,
    loadFromPsgContent
  } = useSupabaseFileOperations({
    onNodesChange: setCurrentNodes,
    onEdgesChange: setCurrentEdges,
    onEditorKeyChange: setEditorKey,
    showToast
  });

  // Initialize from props once
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Clear core editor's persisted state so it won't auto-restore an old graph
    // over the freshly provided LaunchScreen analysis/graph.
    if (
      (initialGraph && initialGraph.nodes && initialGraph.edges) ||
      (initialAnalysis && initialAnalysis.nodes)
    ) {
      try {
        // Clear core editor's persistence key used by Epic1GraphEditor
        localStorage.removeItem('promptgraph:state:v1');
      } catch (e) {
        console.warn('[Epic1Editor] Failed to clear core persisted state', e);
      }
    }

    if (initialGraph && initialGraph.nodes && initialGraph.edges) {
      try {
        // Convert initial React Flow graph to PSG and load programmatically
        const positions = Object.fromEntries(
          (initialGraph.nodes || []).map(n => [
            n.id,
            n.position || { x: 0, y: 0 }
          ])
        );
        const psgNodes: GraphNode[] = (initialGraph.nodes || []).map(n => {
          const type = n.type ?? 'textBlock';
          const dataRaw = (n.data ?? {}) as Record<string, unknown>;
          const labelFromData =
            typeof dataRaw['label'] === 'string'
              ? (dataRaw['label'] as string)
              : undefined;
          const label = labelFromData;
          let data: Record<string, unknown> = {};
          switch (type) {
            case 'textBlock': {
              const contentVal = dataRaw['content'];
              const textVal = dataRaw['text'];
              const content =
                typeof contentVal === 'string'
                  ? contentVal
                  : typeof textVal === 'string'
                    ? textVal
                    : (label ?? '');
              // Ensure content is preserved in all necessary fields
              data = {
                content: content,
                text: content, // Store in both fields for compatibility
                value: content, // BaseEditableNode expects 'value'
                nodeType: 'textBlock'
              };
              break;
            }
            case 'weightedChoice': {
              const optionsVal = dataRaw['options'];
              const options = Array.isArray(optionsVal) ? optionsVal : [];
              data = {
                options: options,
                nodeType: 'weightedChoice'
              };
              break;
            }
            case 'output': {
              const outVal = dataRaw['outputName'];
              const outputName = typeof outVal === 'string' ? outVal : 'output';
              data = {
                outputName: outputName,
                nodeType: 'output'
              };
              break;
            }
            default: {
              data = dataRaw;
            }
          }
          return { id: n.id, type: String(type), label, data };
        });
        const psgEdges: GraphEdge[] = (initialGraph.edges || []).map(
          (e, i) => ({
            id: e.id || `e-${i}`,
            source: e.source,
            target: e.target
          })
        );
        const graph: Graph = {
          nodes: psgNodes,
          edges: psgEdges,
          layout: { positions }
        };
        const psg = fromLegacyGraph('Unsaved Graph', graph);
        const psgText = writePsg(psg);
        loadFromPsgContent(psgText);
      } catch (e) {
        console.warn(
          '[Epic1Editor] Failed to convert initialGraph to PSG; falling back to direct load',
          e
        );
        setCurrentNodes(initialGraph.nodes);
        setCurrentEdges(initialGraph.edges);
        try {
          localStorage.setItem(
            'epic1-graph',
            JSON.stringify({
              nodes: initialGraph.nodes,
              edges: initialGraph.edges
            })
          );
        } catch (err) {
          console.warn(
            '[Epic1Editor] Failed to persist initialGraph to localStorage',
            err
          );
        }
        setEditorKey(prev => prev + 1);
      }
      setEditorReady(true);
      return;
    }

    if (initialAnalysis && initialAnalysis.nodes) {
      const nodes: Node[] = [];
      const edges: Edge[] = [];
      const horizontalSpacing = 350; // Increased spacing to prevent overlap
      const verticalSpacing = 200; // Increased vertical spacing

      initialAnalysis.nodes.forEach((genNode: GeneratedNode, index: number) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const n = genNode.node;
        const content = n.getPreviewText ? n.getPreviewText() : 'Node';

        // Map LaunchScreen node types to Editor node types/data
        let editorType: Node['type'] = 'default';
        let data: Partial<NodeData> & { label?: string } = { label: content };

        switch (n.nodeType) {
          case 'Text': {
            editorType = 'textBlock';
            data = {
              nodeType: 'textBlock',
              content: content, // Use the actual content
              text: content, // Store in both fields for compatibility
              value: content, // BaseEditableNode expects 'value'
              label:
                content.length > 30 ? content.substring(0, 27) + '...' : content
            };
            break;
          }
          case 'Choice': {
            editorType = 'weightedChoice';
            // For choices, split the content by "or" to create options
            const options = content.includes(' or ')
              ? content.split(' or ').map((opt, i) => ({
                  id: `opt-${index}-${i}`,
                  text: opt.trim(),
                  weight: 100,
                  hasBranch: false
                }))
              : [
                  {
                    id: `opt-${index}`,
                    text: content,
                    weight: 100,
                    hasBranch: false
                  }
                ];

            data = {
              nodeType: 'weightedChoice',
              options: options,
              label: 'Choice'
            };
            break;
          }
          case 'Variable': {
            editorType = 'textBlock';
            const varName = n.variableName || 'var';
            const varDisplay = `{{${varName}}}`;
            data = {
              nodeType: 'textBlock',
              content: varDisplay,
              text: varDisplay,
              label: `Variable: ${varName}`
            };
            break;
          }
          case 'Output': {
            editorType = 'output';
            data = {
              nodeType: 'output',
              outputName: 'output',
              label: 'Output'
            };
            break;
          }
          case 'Concat': {
            editorType = 'concat';
            data = {
              nodeType: 'concat',
              separator: ', ', // Default separator
              value: ', ', // BaseEditableNode expects 'value'
              label: 'Concat'
            };
            break;
          }
          default: {
            editorType = 'default';
            data = { label: content };
          }
        }

        nodes.push({
          id: n.id,
          position: {
            x: col * horizontalSpacing + 200,
            y: row * verticalSpacing + 120
          },
          data,
          type: editorType
        });
      });

      if (nodes.length > 1) {
        for (let i = 0; i < nodes.length - 1; i++) {
          edges.push({
            id: `init-e-${i}`,
            source: nodes[i].id,
            target: nodes[i + 1].id,
            type: 'smoothstep',
            sourceHandle: 'source',
            targetHandle: 'target'
          });
        }
      }

      try {
        // Convert the LaunchScreen-derived React Flow graph to PSG and load
        const positions = Object.fromEntries(
          nodes.map(n => [n.id, n.position || { x: 0, y: 0 }])
        );
        const psgNodes: GraphNode[] = nodes.map(n => {
          const type = n.type ?? 'textBlock';
          const dataRaw = (n.data ?? {}) as Record<string, unknown>;
          const labelFromData =
            typeof dataRaw['label'] === 'string'
              ? (dataRaw['label'] as string)
              : undefined;
          const label = labelFromData;
          let data: Record<string, unknown> = {};
          switch (type) {
            case 'textBlock': {
              const contentVal = dataRaw['content'];
              const textVal = dataRaw['text'];
              const content =
                typeof contentVal === 'string'
                  ? contentVal
                  : typeof textVal === 'string'
                    ? textVal
                    : (label ?? '');
              data = { content };
              break;
            }
            case 'weightedChoice': {
              const optionsVal = dataRaw['options'];
              const options = Array.isArray(optionsVal) ? optionsVal : [];
              data = { options };
              break;
            }
            case 'output': {
              const outVal = dataRaw['outputName'];
              const outputName = typeof outVal === 'string' ? outVal : 'output';
              data = { outputName };
              break;
            }
            default: {
              data = dataRaw;
            }
          }
          return { id: n.id, type: String(type), label, data };
        });
        const psgEdges: GraphEdge[] = edges.map((e, i) => ({
          id: e.id || `init-e-${i}`,
          source: e.source,
          target: e.target
        }));
        const graph: Graph = {
          nodes: psgNodes,
          edges: psgEdges,
          layout: { positions }
        };
        const psg = fromLegacyGraph('Unsaved Graph', graph);
        const psgText = writePsg(psg);
        loadFromPsgContent(psgText);
      } catch (e) {
        console.warn(
          '[Epic1Editor] Failed to convert analysis graph to PSG; falling back to direct load',
          e
        );
        setCurrentNodes(nodes);
        setCurrentEdges(edges);
        try {
          localStorage.setItem('epic1-graph', JSON.stringify({ nodes, edges }));
        } catch (err) {
          console.warn(
            '[Epic1Editor] Failed to persist graph to localStorage',
            err
          );
        }
        setEditorKey(prev => prev + 1);
      }
      setEditorReady(true);
    }
    // If no initial input, allow editor to render immediately
    if (!hasInitialInput) {
      setEditorReady(true);
    }
  }, [initialGraph, initialAnalysis, hasInitialInput, loadFromPsgContent]);

  // View state
  const [gridVisible, setGridVisible] = useState(true);
  const [minimapVisible, setMinimapVisible] = useState(false);
  const [inspectorVisible, setInspectorVisible] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'cinema'>(
    'cinema'
  );

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
    // Add to history after cut
    addToHistory(remainingNodes, remainingEdges);
    showToast(`Cut ${selectedNodes.length} nodes`, 'info');
  }, [currentNodes, currentEdges, handleCopy, addToHistory, showToast]);

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
        const [epic1Module] = await Promise.all([
          import('@promptscape/core/components/epic1/Epic1GraphEditor')
        ]);

        if (!mounted) return;

        if (epic1Module.Epic1GraphEditorWithProvider) {
          setEditorComponent(() => epic1Module.Epic1GraphEditorWithProvider);
        }

        // Load SimpleMenuBar for menu functionality
        setMenuBarComponent(() => SimpleMenuBar);
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

  // When launching with an initial analysis/graph, wait until we've cleared core persistence
  // and prepared the initial nodes/edges before rendering the core editor to avoid auto-restore.
  if (!editorReady) {
    return <div className="loading-message">Preparing editor…</div>;
  }

  return (
    <IntelligenceProvider>
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
          {editorReady && (
            <GraphEditorWithTray
              EditorComponent={EditorComponent}
              editorKey={editorKey}
              currentNodes={currentNodes}
              currentEdges={currentEdges}
              showPreview={showPreview}
              assetLibraryVisible={assetLibraryVisible}
              assetLibraryPosition={assetLibraryPosition}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
            />
          )}
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

        <NewDocumentModal
          isOpen={showNewDocumentModal}
          onConfirm={confirmNewDocument}
          onCancel={cancelNewDocument}
        />
      </div>
    </IntelligenceProvider>
  );
};
