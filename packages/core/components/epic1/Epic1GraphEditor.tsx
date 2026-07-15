import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef
} from 'react';
import {
  Edge,
  Node,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { epic1NodeTypes } from './nodes';
import type { EditableNodeData } from './nodes';
import { droppableEpic1NodeTypes } from './nodes/droppableNodes';
import { applyDagreLayout } from '../../utils/layoutAlgorithms';

import { useKonamiCode } from './hooks/useKonamiCode';
import { useGraphHistory } from './hooks/useGraphHistory';
import { useGraphPersistence } from './hooks/useGraphPersistence';
import { useNodeOperations } from './hooks/useNodeOperations';
import { useGraphDragDrop } from './hooks/useGraphDragDrop';
import { useDragDropHandlers } from './hooks/useDragDropHandlers';
import { useGraphKeyboardShortcuts } from './hooks/useGraphKeyboardShortcuts';
import { usePreviewTrayLayout } from './hooks/usePreviewTrayLayout';
import { useGraphViewControls } from './hooks/useGraphViewControls';
import { useGraphImportExport } from './hooks/useGraphImportExport';
import { useGraphSelection } from './hooks/useGraphSelection';
import { useGraphPreview } from './hooks/useGraphPreview';

import type { WizardPreviewResult } from './components/GraphModals';
import { useConnectionValidation } from './ConnectionFeedback';
import { useToast } from './ConnectionToast';
import type { SidePanelTabDefinition } from './TabbedSidePanel';
import type { DocumentSummary } from './DocumentLibraryPanel';
import { useNodeInteractions } from './interactions/NodeInteractionEnhancer';
import { useMicroInteractions } from './animations/MicroInteractions';
import { PromptParser, ParsedPromptResult } from './utils/promptParser';
import { usePreviewTrayStore } from '../../stores/previewTrayStore';
import {
  useDocumentProjectStore,
  type DocumentHistoryState,
  type DocumentViewport
} from '../../stores/documentProjectStore';
import { TutorialProvider, useTutorial } from './onboarding/TutorialContext';
import { TutorialOverlay } from './onboarding/TutorialOverlay';
import type { Preset } from '@prompt/asset-browser';
import { getSupabase } from '../../utils/supabaseClient';
import type { PresetDropPayload } from './hooks/useDragDropHandlers';
import { usePresetInsertion } from './hooks/usePresetInsertion';
import { useComponentLibraryActions } from './hooks/useComponentLibraryActions';
import { useCanvasCommandBridge } from './hooks/useCanvasCommandBridge';
import { buildCommandPaletteCommands } from './editor/buildCommandPaletteCommands';
import { Epic1GraphEditorShell } from './editor/Epic1GraphEditorShell';
import type {
  ComponentDefinition,
  GraphReferenceEntry,
  ReferenceBinding
} from './services/ComponentModel';
import { GraphReferenceService } from './services/GraphReferenceService';

import './ReactFlowOverrides.css';
import './Epic1GraphEditor.css';
import './KeyboardShortcuts.css';
import './nodes/EnhancedBoundingBox.css';
import './PanZoomControls.css';

// Local no-op adapters for optional editor integrations.
const IntelligenceProvider = ({ children }: any) => children;
const NeatenSettingsProvider = ({ children }: any) => children;
const HistoryPalette = () => null;
const useAutoLayout = () => ({
  neatenSelection: () => {},
  neatenAll: () => {},
  cleanupNodes: () => {},
  cleanupAll: () => {}
});

export interface Epic1GraphEditorProps {
  initialNodes?: Node<EditableNodeData>[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node<EditableNodeData>[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onExecute?: (nodes: Node<EditableNodeData>[], edges: Edge[]) => void;
  showPreview?: boolean;
  previewPosition?: 'top' | 'bottom' | 'left' | 'right';
  previewWidth?: string;
  previewDebounceDelay?: number;
  previewSeeds?: (string | number)[];
  showAssetLibrary?: boolean;
  assetLibraryPosition?: 'left' | 'right';
  sidePanelTabDefinitions?: SidePanelTabDefinition[];
  exploreDocuments?: DocumentSummary[];
  onOpenDocument?: (id: string) => void;
}

/**
 * Clean Epic1 Graph Editor using all extracted hooks
 */
const Epic1GraphEditorClean: React.FC<Epic1GraphEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
  onExecute,
  showPreview = true,
  previewPosition = 'right',
  previewWidth = '400px',
  previewDebounceDelay = 300,
  previewSeeds,
  showAssetLibrary = true,
  assetLibraryPosition = 'left',
  sidePanelTabDefinitions,
  exploreDocuments,
  onOpenDocument
}) => {
  // Node types based on asset library visibility
  const nodeTypes = showAssetLibrary ? droppableEpic1NodeTypes : epic1NodeTypes;

  // React Flow instance
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [canvasTipsForceKey, setCanvasTipsForceKey] = useState(0);
  const { startTutorial } = useTutorial();

  // Initial props remain the source of truth for this editor mount.
  const { persistedState } = useGraphPersistence([], [], {
    autoSave: false,
    onLoadSuccess: state => state && state.nodes?.length,
    onLoadError: error =>
      console.error('Failed to load persisted state:', error)
  });

  // Initialize nodes and edges with initial props ONLY (not persisted state)
  const [nodes, setNodes, onNodesChangeBase] = useNodesState<EditableNodeData>(
    initialNodes
  );
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState(
    initialEdges
  );

  // Update nodes when initialNodes change (for when launched from parser)
  React.useEffect(() => {
    if (initialNodes && initialNodes.length > 0 && nodes.length === 0) {
      setNodes(initialNodes);
    }
    if (initialEdges && initialEdges.length > 0 && edges.length === 0) {
      setEdges(initialEdges);
    }
  }, [initialNodes, initialEdges]);

  // Toast notifications
  const { toasts, showToast, dismissToast } = useToast();

  // Graph history (undo/redo) — per Nested PSG composition via document store
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    exportHistory,
    importHistory,
    suppressSnapshotsFor,
    captureSnapshotNow
  } = useGraphHistory(nodes, edges, setNodes, setEdges, {
    maxHistorySize: 50,
    debounceMs: 500
  });

  const activeDocumentId = useDocumentProjectStore(s => s.activeDocumentId);
  const prevActiveDocumentIdRef = useRef(activeDocumentId);
  const graphRef = useRef({ nodes, edges });
  graphRef.current = { nodes, edges };
  const historyApiRef = useRef({
    exportHistory,
    importHistory,
    suppressSnapshotsFor,
    clearHistory,
    captureSnapshotNow
  });
  historyApiRef.current = {
    exportHistory,
    importHistory,
    suppressSnapshotsFor,
    clearHistory,
    captureSnapshotNow
  };

  // When the active Nested PSG composition changes: save leaving session
  // (undo stack + viewport), then restore the incoming session.
  React.useEffect(() => {
    const leavingId = prevActiveDocumentIdRef.current;
    if (leavingId === activeDocumentId) {
      return;
    }

    const store = useDocumentProjectStore.getState();
    const api = historyApiRef.current;
    const { nodes: leaveNodes, edges: leaveEdges } = graphRef.current;

    // Persist undo stack + camera for the composition we are leaving.
    if (store.documents[leavingId]) {
      const viewport = reactFlowInstance?.getViewport?.() as
        | DocumentViewport
        | undefined;
      // Flush pending edits into the stack before export.
      api.captureSnapshotNow(leaveNodes, leaveEdges);
      api.suppressSnapshotsFor(800);
      store.updateDocumentSession(leavingId, {
        history: api.exportHistory() as DocumentHistoryState,
        viewport: viewport
          ? { x: viewport.x, y: viewport.y, zoom: viewport.zoom }
          : undefined
      });
    }

    // Restore undo stack for the composition we are entering.
    const incoming = store.documents[activeDocumentId];
    api.suppressSnapshotsFor(800);
    api.importHistory(
      (incoming?.history as DocumentHistoryState | undefined) ?? null
    );

    // Restore camera if we have one; otherwise fit after applyGraph.
    const vp = incoming?.viewport;
    if (vp && reactFlowInstance?.setViewport) {
      window.setTimeout(() => {
        reactFlowInstance.setViewport(
          { x: vp.x, y: vp.y, zoom: vp.zoom },
          { duration: 0 }
        );
      }, 80);
    }

    prevActiveDocumentIdRef.current = activeDocumentId;
  }, [activeDocumentId, reactFlowInstance]);

  // Apply a graph pushed in live (tutorial / document switch) without remount.
  React.useEffect(() => {
    const handler = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          nodes?: Node<EditableNodeData>[];
          edges?: Edge[];
          /** When true, skip fitView (viewport already restored for the tab). */
          skipFitView?: boolean;
          history?: DocumentHistoryState | null;
        }>
      ).detail;
      if (!detail?.nodes) {
        return;
      }

      const api = historyApiRef.current;
      api.suppressSnapshotsFor(800);
      if ('history' in (detail as object) && detail.history !== undefined) {
        api.importHistory(detail.history);
      }

      setNodes(detail.nodes);
      setEdges(detail.edges ?? []);

      const store = useDocumentProjectStore.getState();
      const active = store.documents[store.activeDocumentId];
      const hasViewport = Boolean(active?.viewport);

      if (!detail.skipFitView && !hasViewport) {
        window.setTimeout(
          () => reactFlowInstance?.fitView?.({ padding: 0.2 }),
          60
        );
      } else if (hasViewport && active?.viewport && reactFlowInstance?.setViewport) {
        const vp = active.viewport;
        window.setTimeout(() => {
          reactFlowInstance.setViewport(
            { x: vp.x, y: vp.y, zoom: vp.zoom },
            { duration: 0 }
          );
        }, 60);
      }
    };
    window.addEventListener('epic1:applyGraph', handler);
    return () => window.removeEventListener('epic1:applyGraph', handler);
  }, [setNodes, setEdges, reactFlowInstance]);

  // Auto-save
  useGraphPersistence(nodes, edges, {
    autoSave: true,
    autoSaveDelayMs: 2000,
    storageKey: 'prompt-graph-autosave'
  });

  // Node operations
  const {
    selectedNodeId,
    createNode,
    handleNodeEdit,
    duplicateNodes,
    disconnectNodes,
    deleteSelectedNodes,
    alignNodes,
    distributeNodes,
    handleNodeClick,
    handlePaneClick,
    onConnect,
    onNodesDelete,
    onEdgesDelete
  } = useNodeOperations(nodes, edges, setNodes, setEdges, reactFlowInstance, {
    showToast,
    onNodeSelect: () => void 0
  });

  // Selection management
  const {
    selectAll,
    deselectAll,
    invertSelection,
    selectConnectedNodes,
    getSelectionInfo
  } = useGraphSelection(nodes, edges, setNodes, setEdges, { showToast });

  // Import/Export
  const {
    exportGraph,
    exportSelected,
    triggerImport,
    pasteFromClipboard
  } = useGraphImportExport(nodes, edges, setNodes, setEdges, { showToast });

  // View controls
  const { zoomIn, zoomOut, resetZoom, fitView, panToCenter, panToNode } =
    useGraphViewControls(reactFlowInstance, {
      showToast,
      minZoom: 0.02,
      maxZoom: 4
    });

  // Graph outline (Graph tab): center on a node and highlight it.
  const handleFocusNode = useCallback(
    (nodeId: string) => {
      panToNode(nodeId);
      setNodes(currentNodes =>
        currentNodes.map(node => ({
          ...node,
          selected: node.id === nodeId
        }))
      );
    },
    [panToNode, setNodes]
  );

  // Node interactions and drag-drop helpers
  const { addNodeWithBounce } = useNodeInteractions();
  const { insertPresetByMeta } = useDragDropHandlers({
    setNodes,
    setEdges,
    reactFlowInstance,
    showToast,
    addNodeWithBounce
  });

  const {
    executePresetWithTarget,
    handleAssetInsert,
    getFragmentSuggestions,
    edgeSpliceFromId
  } = usePresetInsertion({
    nodes,
    edges,
    selectedNodeId,
    reactFlowInstance,
    insertPresetByMeta
  });

  // Drag and drop
  const { isDraggingOver, dropTarget, onDragOver, onDragLeave, onDragEnter, onDrop } =
    useGraphDragDrop(reactFlowInstance, setNodes, {
      showToast,
      onNodeCreate: () => void 0,
      onPresetDrop: (preset, position, dragTarget) => {
        const edgeSpliceTarget =
          dragTarget?.kind === 'insert-edge'
            ? edgeSpliceFromId(dragTarget.edgeId)
            : null;
        const nodeReplacementTarget =
          dragTarget?.kind === 'replace-node'
            ? { nodeId: dragTarget.nodeId }
            : null;

        void insertPresetByMeta(
          preset as PresetDropPayload,
          position,
          edgeSpliceTarget,
          nodeReplacementTarget
        );
      }
    });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    (
      window as typeof window & {
        __EPIC1_REACT_FLOW__?: ReactFlowInstance | null;
        __EPIC1_INSERT_PRESET__?: ((preset: unknown) => Promise<void>) | null;
        __EPIC1_GET_FRAGMENT_SUGGESTIONS__?: (() => Promise<unknown[]>) | null;
        __EPIC1_INSERT_TOP_FRAGMENT_SUGGESTION__?: (() => Promise<unknown | null>) | null;
      }
    ).__EPIC1_REACT_FLOW__ = reactFlowInstance;
    (
      window as typeof window & {
        __EPIC1_REACT_FLOW__?: ReactFlowInstance | null;
        __EPIC1_INSERT_PRESET__?: ((preset: unknown) => Promise<void>) | null;
        __EPIC1_GET_FRAGMENT_SUGGESTIONS__?: (() => Promise<unknown[]>) | null;
        __EPIC1_INSERT_TOP_FRAGMENT_SUGGESTION__?: (() => Promise<unknown | null>) | null;
      }
    ).__EPIC1_INSERT_PRESET__ = async (preset: unknown) => {
      executePresetWithTarget(preset as Preset);
    };
    (
      window as typeof window & {
        __EPIC1_REACT_FLOW__?: ReactFlowInstance | null;
        __EPIC1_INSERT_PRESET__?: ((preset: unknown) => Promise<void>) | null;
        __EPIC1_GET_FRAGMENT_SUGGESTIONS__?: (() => Promise<unknown[]>) | null;
        __EPIC1_INSERT_TOP_FRAGMENT_SUGGESTION__?: (() => Promise<unknown | null>) | null;
      }
    ).__EPIC1_GET_FRAGMENT_SUGGESTIONS__ = getFragmentSuggestions;
    (
      window as typeof window & {
        __EPIC1_REACT_FLOW__?: ReactFlowInstance | null;
        __EPIC1_INSERT_PRESET__?: ((preset: unknown) => Promise<void>) | null;
        __EPIC1_GET_FRAGMENT_SUGGESTIONS__?: (() => Promise<unknown[]>) | null;
        __EPIC1_INSERT_TOP_FRAGMENT_SUGGESTION__?: (() => Promise<unknown | null>) | null;
      }
    ).__EPIC1_INSERT_TOP_FRAGMENT_SUGGESTION__ = null;

    return () => {
      const win = window as typeof window & {
        __EPIC1_REACT_FLOW__?: ReactFlowInstance | null;
        __EPIC1_INSERT_PRESET__?: ((preset: unknown) => Promise<void>) | null;
        __EPIC1_GET_FRAGMENT_SUGGESTIONS__?: (() => Promise<unknown[]>) | null;
        __EPIC1_INSERT_TOP_FRAGMENT_SUGGESTION__?: (() => Promise<unknown | null>) | null;
      };

      if (win.__EPIC1_REACT_FLOW__ === reactFlowInstance) {
        win.__EPIC1_REACT_FLOW__ = null;
        win.__EPIC1_INSERT_PRESET__ = null;
        win.__EPIC1_GET_FRAGMENT_SUGGESTIONS__ = null;
        win.__EPIC1_INSERT_TOP_FRAGMENT_SUGGESTION__ = null;
      }
    };
  }, [
    edges,
    getFragmentSuggestions,
    nodes,
    reactFlowInstance,
    selectedNodeId,
    executePresetWithTarget
  ]);

  const getCommandSpawnPosition = useCallback(() => {
    return reactFlowInstance
      ? reactFlowInstance.screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        })
      : { x: 250, y: 250 };
  }, [reactFlowInstance]);

  useEffect(() => {
    const handleCommanderKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (isTypingTarget) {
        return;
      }

      if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        setIsCommanderOpen(true);
      }
    };

    window.addEventListener('keydown', handleCommanderKeyDown);
    return () => window.removeEventListener('keydown', handleCommanderKeyDown);
  }, []);

  useEffect(() => {
    const handleOpenCommander = () => setIsCommanderOpen(true);
    window.addEventListener('epic1:openCommander', handleOpenCommander);
    return () => window.removeEventListener('epic1:openCommander', handleOpenCommander);
  }, []);

  // Keyboard shortcuts
  useGraphKeyboardShortcuts(
    undo,
    redo,
    deleteSelectedNodes,
    duplicateNodes,
    selectAll,
    deselectAll,
    nodes,
    edges,
    setNodes,
    setEdges,
    reactFlowInstance,
    showToast,
    {
      enabled: true,
      shortcuts: [
        {
          key: 's',
          meta: true,
          action: () => exportGraph(),
          description: 'Save graph'
        },
        {
          key: 'o',
          meta: true,
          action: () => triggerImport(),
          description: 'Open graph'
        },
        {
          key: 'e',
          meta: true,
          action: () => exportSelected(),
          description: 'Export selection'
        }
      ]
    }
  );

  // Preview functionality
  const {
    previewResults,
    isPreviewExecuting,
    previewError,
    currentSeeds,
    isPreviewVisible,
    togglePreview,
    updateSeeds,
    executePreview,
    exportPreviewResults,
    previewEngine
  } = useGraphPreview(nodes, edges, {
    showToast,
    defaultSeeds: previewSeeds
      ? previewSeeds.map(s => Number(s))
      : [1234, 5678, 9012],
    debounceDelay: previewDebounceDelay
  });

  const previewTrayIsOpen = usePreviewTrayStore().isOpen;

  // Preview tray layout
  usePreviewTrayLayout(showPreview);

  // Konami code Easter egg
  const [tetrisMode, setTetrisMode] = useState(false);
  useKonamiCode({
    onActivate: () => {
      setTetrisMode(true);
      showToast('success', '🎮 Tetris mode activated!');
    }
  });

  // Layout utilities
  const { neatenSelection, neatenAll, cleanupNodes, cleanupAll } =
    useAutoLayout();

  // Right-click canvas menu (Organize Nodes lives here).
  const [paneContextMenu, setPaneContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Right-click node menu (Duplicate / Disconnect / Delete).
  const [nodeContextMenu, setNodeContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);

  // Organize: run a left-to-right hierarchical layout. Uses the editor's own
  // setNodes (useAutoLayout's cleanup writes React Flow's internal store, which
  // this controlled editor immediately overwrites, so it can't be used here).
  const handleOrganizeNodes = useCallback(() => {
    setNodes(currentNodes => {
      if (currentNodes.length === 0) {
        return currentNodes;
      }
      const laidOut = applyDagreLayout(currentNodes, edges, {
        direction: 'LR',
        nodeSpacing: 60,
        rankSpacing: 140
      });
      const positionById = new Map(
        laidOut.map(node => [node.id, node.position])
      );
      return currentNodes.map(node => {
        const position = positionById.get(node.id);
        // Don't move children of a region box — their position is relative to
        // the parent and is managed by the box.
        if (!position || node.parentNode) {
          return node;
        }
        return { ...node, position };
      });
    });
    setTimeout(() => {
      reactFlowInstance?.fitView({ padding: 0.15, duration: 400 });
    }, 60);
  }, [edges, setNodes, reactFlowInstance]);

  // Micro interactions
  const { interactions, trigger } = useMicroInteractions();

  // Connection validation
  const { isValidConnection } = useConnectionValidation(nodes, edges, error => {
    showToast('error', error);
  });

  // UI State
  const [nodePaletteCollapsed, setNodePaletteCollapsed] = useState(false);
  const [isPromptWizardOpen, setIsPromptWizardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingWizardNodes, setPendingWizardNodes] =
    useState<WizardPreviewResult | null>(null);
  const [saveAsPresetNodeId, setSaveAsPresetNodeId] = useState<string | null>(
    null
  );
  const [customPresets, setCustomPresets] = useState<any[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [componentDefinitions, setComponentDefinitions] = useState<ComponentDefinition[]>(
    () => ComponentLibraryService.listDefinitions()
  );
  const [componentInstances, setComponentInstances] = useState<ComponentInstance[]>([]);
  const [pendingComponentDraft, setPendingComponentDraft] =
    useState<ComponentSaveDraft | null>(null);
  const [pendingComponentSelection, setPendingComponentSelection] = useState<{
    nodeIds: string[];
    edgeIds: string[];
  } | null>(null);
  const activeToast = toasts.length > 0 ? toasts[0] : null;

  // Tutorial integration state
  const [tutorialPrompt, setTutorialPrompt] = useState<string | null>(null);

  // Tutorial integration - handle 'epic1:promptPasted' event from tutorial system
  useEffect(() => {
    const handlePromptPasted = (event: CustomEvent) => {
      const { prompt } = event.detail;

      if (prompt && typeof prompt === 'string') {
        // Store prompt for processing
        setTutorialPrompt(prompt);
        // Parse and create nodes immediately
        parsePromptAndCreateNodes(prompt);
      }
    };

    // Add event listener
    window.addEventListener('epic1:promptPasted', handlePromptPasted as EventListener);

    // Cleanup function
    return () => {
      window.removeEventListener('epic1:promptPasted', handlePromptPasted as EventListener);
    };
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { return; }
    let unsub: any = null;
    (async () => {
      try {
        const { data: { session } } = await sb.auth.getSession();
        setCurrentUser(session?.user ?? null);
      } catch {}
      const { data } = sb.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user ?? null);
      });
      unsub = data?.subscription ?? null;
    })();
    return () => { try { unsub?.unsubscribe?.(); } catch {} };
  }, []);

  // Parse prompt and create nodes
  const parsePromptAndCreateNodes = useCallback((prompt: string) => {
    try {
      // Validate the prompt first
      const validation = PromptParser.validate(prompt);
      if (!validation.isValid) {
        console.error('[Epic1GraphEditor] Prompt validation failed:', validation.message);
        showToast('error', validation.message || 'Invalid prompt format');
        return;
      }

      // Parse the prompt
      const result: ParsedPromptResult = PromptParser.parse(prompt);

      if (result.segments.length === 0) {
        showToast('warning', 'No content found in prompt to create nodes');
        return;
      }

      // Calculate positions for new nodes
      const startX = 200;
      const startY = 200;
      const nodeSpacingX = 300;
      const nodeSpacingY = 150;
      const maxNodesPerRow = 3;

      // Create nodes from parsed segments
      const newNodes: Node<EditableNodeData>[] = [];
      const newEdges: Edge[] = [];

      result.segments.forEach((segment, index) => {
        const row = Math.floor(index / maxNodesPerRow);
        const col = index % maxNodesPerRow;
        const position = {
          x: startX + col * nodeSpacingX,
          y: startY + row * nodeSpacingY
        };

        let node: Node<EditableNodeData>;

        if (segment.type === 'choice' && segment.options) {
          // Create WeightedChoice node
          const options = segment.options.map((option, optionIndex) => ({
            id: `option-${index}-${optionIndex}`,
            text: option,
            weight: Math.floor(100 / segment.options!.length),
            hasBranch: true
          }));

          node = {
            id: `tutorial-choice-${Date.now()}-${index}`,
            type: 'weightedChoice',
            position,
            data: {
              nodeType: 'weightedChoice',
              options,
              value: JSON.stringify(options, null, 2)
            }
          };
        } else {
          // Create TextBlock node
          node = {
            id: `tutorial-text-${Date.now()}-${index}`,
            type: 'textBlock',
            position,
            data: {
              nodeType: 'textBlock',
              text: segment.content,
              value: segment.content,
              content: segment.content
            }
          };
        }

        newNodes.push(node);
      });

      // Create edges to connect nodes in sequence
      for (let i = 0; i < newNodes.length - 1; i++) {
        const sourceNode = newNodes[i];
        const targetNode = newNodes[i + 1];

        // Find appropriate handles (WeightedChoice nodes have output handles)
        let sourceHandle = 'source';
        let targetHandle = 'target';

        if (sourceNode.type === 'weightedChoice') {
          // For weighted choice, connect from each option
          const options = sourceNode.data.options || [];
          options.forEach((option: any, optionIndex: number) => {
            newEdges.push({
              id: `tutorial-edge-${sourceNode.id}-option-${optionIndex}-${targetNode.id}`,
              source: sourceNode.id,
              target: targetNode.id,
              sourceHandle: `branch-${optionIndex}`,
              targetHandle: 'target',
              type: 'smoothstep',
              animated: false,
              style: { stroke: '#9ca3af', strokeWidth: 3 }
            });
          });
        } else {
          // Simple connection for text nodes
          newEdges.push({
            id: `tutorial-edge-${sourceNode.id}-${targetNode.id}`,
            source: sourceNode.id,
            target: targetNode.id,
            sourceHandle,
            targetHandle,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#9ca3af', strokeWidth: 3 }
          });
        }
      }

      // Add nodes and edges to the graph
      setNodes(currentNodes => [...currentNodes, ...newNodes]);
      setEdges(currentEdges => [...currentEdges, ...newEdges]);

      // Show success message
      showToast('success', `Created ${newNodes.length} nodes from prompt!`);

      // Fit view to show all new nodes
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({
            padding: 0.2,
            includeHiddenNodes: false,
            minZoom: 0.02,
            maxZoom: 2
          });
        }
      }, 100);

    } catch (error) {
      console.error('[Epic1GraphEditor] Error parsing prompt:', error);
      showToast('error', 'Failed to parse prompt and create nodes');
    }
  }, [setNodes, setEdges, showToast, reactFlowInstance]);


  const getCommandSpawnPosition = useCallback(() => {
    return reactFlowInstance
      ? reactFlowInstance.screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        })
      : { x: 250, y: 250 };
  }, [reactFlowInstance]);

  const {
    componentDefinitions,
    pendingComponentDraft,
    setPendingComponentDraft,
    setPendingComponentSelection,
    graphReferences,
    handleComponentInstanceNamespaceEdit,
    handleGraphReferenceAwareNodeEdit,
    saveSelectedRegionBoxAsUserFragment,
    saveSelectionAsComponent,
    handleSaveComponentDraft,
    insertComponentDefinition,
    detachSelectedComponentInstance,
    refreshSelectedComponentInstance,
    refreshOutdatedComponentInstances,
    copySelectedComponentReferences
  } = useComponentLibraryActions({
    nodes,
    edges,
    setNodes,
    selectedNodeId,
    createNode,
    handleNodeEdit,
    getCommandSpawnPosition,
    showToast
  });

  const { isCommanderOpen, setIsCommanderOpen } = useCanvasCommandBridge({
    reactFlowInstance,
    executePresetWithTarget,
    getFragmentSuggestions,
    handleOrganizeNodes,
    saveSelectedRegionBoxAsUserFragment
  });

  // Enhanced nodes with edit handlers
  const enhancedNodes = useMemo(() => {
    return nodes.map((node: Node<EditableNodeData>) => ({
      ...node,
      type: node.type || 'textBlock',
      position: node.position || { x: 0, y: 0 },
      data: (() => {
        const referenceBinding = (node.data?.referenceBinding as ReferenceBinding | undefined) ?? undefined;
        const referenceBindingStatus = referenceBinding
          ? GraphReferenceService.validateBinding(referenceBinding, graphReferences)
          : null;
        const latestComponentDefinition =
          node.type === 'componentInstance'
            ? componentDefinitions
                .filter(
                  (definition: ComponentDefinition) =>
                    definition.stableId === String((node.data as Record<string, unknown>)?.componentStableId ?? '')
                )
                .sort(
                  (left: ComponentDefinition, right: ComponentDefinition) =>
                    right.version - left.version
                )[0] ?? null
            : null;
        const componentVersion =
          node.type === 'componentInstance'
            ? Number((node.data as Record<string, unknown>)?.componentVersion ?? 0)
            : 0;
        const latestComponentVersion = latestComponentDefinition?.version ?? componentVersion;
        const versionDrift =
          node.type === 'componentInstance'
            ? Math.max(0, latestComponentVersion - componentVersion)
            : 0;

        return {
          ...node.data,
          value:
            node.type === 'componentInstance'
              ? String((node.data as Record<string, unknown>)?.namespace ?? node.data.value ?? '')
              : node.data.value,
          graphReferences:
            node.type === 'variable' || node.type === 'textBlock' || node.type === 'output'
              ? graphReferences
              : (node.data?.graphReferences as GraphReferenceEntry[] | undefined),
          referenceBinding,
          referenceBindingStatus,
          latestComponentVersion,
          versionDrift,
          onEdit: (newValue: string) =>
            node.type === 'componentInstance'
              ? handleComponentInstanceNamespaceEdit(node.id, newValue)
              : node.type === 'variable' || node.type === 'textBlock' || node.type === 'output'
                ? handleGraphReferenceAwareNodeEdit(node.id, newValue)
                : handleNodeEdit(node.id, newValue),
          onEditStart: () => {},
          onEditEnd: () => {}
        };
      })(),
      selected: node.selected || node.id === selectedNodeId,
      width: node.width || undefined,
      height: node.height || undefined
    }));
  }, [componentDefinitions, graphReferences, handleComponentInstanceNamespaceEdit, handleGraphReferenceAwareNodeEdit, nodes, selectedNodeId, handleNodeEdit]);

  // Notify parent of changes
  useEffect(() => {
    onNodesChangeProp?.(enhancedNodes);
  }, [enhancedNodes, onNodesChangeProp]);

  useEffect(() => {
    onEdgesChangeProp?.(edges);
  }, [edges, onEdgesChangeProp]);

  // Handle execute button
  const handleExecute = () => {
    void executePreview();
    onExecute?.(enhancedNodes, edges);
  };

  const commandPaletteCommands = useMemo(
    () =>
      buildCommandPaletteCommands({
        alignNodes, componentDefinitions, createNode, copySelectedComponentReferences,
        deleteSelectedNodes, deselectAll, detachSelectedComponentInstance, distributeNodes,
        duplicateNodes, exportGraph, exportSelected, fitView, getCommandSpawnPosition,
        handleExecute, invertSelection, insertComponentDefinition, neatenAll, cleanupAll,
        saveSelectionAsComponent, saveSelectedRegionBoxAsUserFragment, pasteFromClipboard,
        previewTrayIsOpen, refreshOutdatedComponentInstances, refreshSelectedComponentInstance,
        resetZoom, selectAll, selectConnectedNodes, selectedNodeId, showToast, startTutorial,
        togglePreview, triggerImport, zoomIn, zoomOut, setCanvasTipsForceKey
      }),
    [alignNodes, componentDefinitions, createNode, copySelectedComponentReferences,
      deleteSelectedNodes, deselectAll, detachSelectedComponentInstance, distributeNodes,
      duplicateNodes, exportGraph, exportSelected, fitView, getCommandSpawnPosition,
      handleExecute, invertSelection, insertComponentDefinition, neatenAll, cleanupAll,
      saveSelectionAsComponent, saveSelectedRegionBoxAsUserFragment, pasteFromClipboard,
      previewTrayIsOpen, refreshOutdatedComponentInstances, refreshSelectedComponentInstance,
      resetZoom, selectAll, selectConnectedNodes, selectedNodeId, showToast, startTutorial,
      togglePreview, triggerImport, zoomIn, zoomOut, setCanvasTipsForceKey]
  );

  // React Flow initialization
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);

  // Wrapper for nodes change to support undo/redo
  const onNodesChange = useCallback(
    (changes: any[]) => {
      onNodesChangeBase(changes);
    },
    [onNodesChangeBase]
  );

  // Wrapper for edges change to support undo/redo
  const onEdgesChange = useCallback(
    (changes: any[]) => {
      onEdgesChangeBase(changes);
    },
    [onEdgesChangeBase]
  );

  const edgeInsertIndicator = useMemo(() => {
    if (
      !dropTarget ||
      dropTarget.kind !== 'insert-edge' ||
      !reactFlowInstance
    ) {
      return null;
    }

    const viewport = reactFlowInstance.getViewport();
    if (!viewport) {
      return null;
    }

    return {
      left: dropTarget.midpoint.x * viewport.zoom + viewport.x,
      top: dropTarget.midpoint.y * viewport.zoom + viewport.y
    };
  }, [dropTarget, reactFlowInstance]);

  const replaceNodeIndicator = useMemo(() => {
    if (
      !dropTarget ||
      dropTarget.kind !== 'replace-node' ||
      !reactFlowInstance
    ) {
      return null;
    }

    const node = nodes.find(candidate => candidate.id === dropTarget.nodeId);
    if (!node) {
      return null;
    }

    const viewport = reactFlowInstance.getViewport();
    if (!viewport) {
      return null;
    }

    const width =
      typeof node.width === 'number'
        ? node.width
        : typeof (node.data as Record<string, unknown>)?.width === 'number'
          ? ((node.data as Record<string, unknown>).width as number)
          : 180;
    const height =
      typeof node.height === 'number'
        ? node.height
        : typeof (node.data as Record<string, unknown>)?.height === 'number'
          ? ((node.data as Record<string, unknown>).height as number)
          : 72;

    return {
      left: node.position.x * viewport.zoom + viewport.x,
      top: node.position.y * viewport.zoom + viewport.y,
      width: width * viewport.zoom,
      height: height * viewport.zoom
    };
  }, [dropTarget, nodes, reactFlowInstance]);

  const containerDropIndicator = useMemo(() => {
    if (
      !dropTarget ||
      dropTarget.kind !== 'inside-container' ||
      !reactFlowInstance
    ) {
      return null;
    }

    const node = nodes.find(candidate => candidate.id === dropTarget.nodeId);
    if (!node) {
      return null;
    }

    const viewport = reactFlowInstance.getViewport();
    if (!viewport) {
      return null;
    }

    const width =
      typeof node.width === 'number'
        ? node.width
        : typeof (node.data as Record<string, unknown>)?.width === 'number'
          ? ((node.data as Record<string, unknown>).width as number)
          : 400;
    const height =
      typeof node.height === 'number'
        ? node.height
        : typeof (node.data as Record<string, unknown>)?.height === 'number'
          ? ((node.data as Record<string, unknown>).height as number)
          : 300;

    return {
      left: node.position.x * viewport.zoom + viewport.x,
      top: node.position.y * viewport.zoom + viewport.y,
      width: width * viewport.zoom,
      height: height * viewport.zoom
    };
  }, [dropTarget, nodes, reactFlowInstance]);

  const content = (
    <Epic1GraphEditorShell
      isDraggingOver={isDraggingOver}
      showPreview={showPreview}
      showAssetLibrary={showAssetLibrary}
      assetLibraryPosition={assetLibraryPosition}
      previewEngine={previewEngine}
      sidePanelTabDefinitions={sidePanelTabDefinitions}
      exploreDocuments={exploreDocuments}
      onOpenDocument={onOpenDocument}
      handleFocusNode={handleFocusNode}
      nodes={nodes}
      edges={edges}
      selectedNodeId={selectedNodeId}
      handleAssetInsert={handleAssetInsert}
      componentDefinitions={componentDefinitions}
      graphReferences={graphReferences}
      insertComponentDefinition={insertComponentDefinition}
      saveSelectionAsComponent={saveSelectionAsComponent}
      detachSelectedComponentInstance={detachSelectedComponentInstance}
      refreshSelectedComponentInstance={refreshSelectedComponentInstance}
      refreshOutdatedComponentInstances={refreshOutdatedComponentInstances}
      dropTarget={dropTarget}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      edgeInsertIndicator={edgeInsertIndicator}
      replaceNodeIndicator={replaceNodeIndicator}
      containerDropIndicator={containerDropIndicator}
      enhancedNodes={enhancedNodes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onInit={onInit}
      handleNodeClick={handleNodeClick}
      handlePaneClick={handlePaneClick}
      setPaneContextMenu={setPaneContextMenu}
      setNodes={setNodes}
      setNodeContextMenu={setNodeContextMenu}
      onNodesDelete={onNodesDelete}
      onEdgesDelete={onEdgesDelete}
      nodeTypes={nodeTypes}
      isValidConnection={isValidConnection}
      handleExecute={handleExecute}
      togglePreview={togglePreview}
      previewTrayIsOpen={previewTrayIsOpen}
      interactions={interactions}
      paneContextMenu={paneContextMenu}
      reactFlowInstance={reactFlowInstance}
      handleOrganizeNodes={handleOrganizeNodes}
      createNode={createNode}
      nodeContextMenu={nodeContextMenu}
      setSaveAsPresetNodeId={setSaveAsPresetNodeId}
      duplicateNodes={duplicateNodes}
      disconnectNodes={disconnectNodes}
      deleteSelectedNodes={deleteSelectedNodes}
      canvasTipsForceKey={canvasTipsForceKey}
      setCanvasTipsForceKey={setCanvasTipsForceKey}
      setIsCommanderOpen={setIsCommanderOpen}
      startTutorial={startTutorial}
      nodePaletteCollapsed={nodePaletteCollapsed}
      setNodePaletteCollapsed={setNodePaletteCollapsed}
      currentUser={currentUser}
      setIsAuthModalOpen={setIsAuthModalOpen}
      setIsPromptWizardOpen={setIsPromptWizardOpen}
      isPromptWizardOpen={isPromptWizardOpen}
      isAuthModalOpen={isAuthModalOpen}
      saveAsPresetNodeId={saveAsPresetNodeId}
      pendingWizardNodes={pendingWizardNodes}
      setPendingWizardNodes={setPendingWizardNodes}
      setCustomPresets={setCustomPresets}
      setCurrentUser={setCurrentUser}
      pendingComponentDraft={pendingComponentDraft}
      setPendingComponentDraft={setPendingComponentDraft}
      setPendingComponentSelection={setPendingComponentSelection}
      handleSaveComponentDraft={handleSaveComponentDraft}
      historyVisible={historyVisible}
      activeToast={activeToast}
      dismissToast={dismissToast}
      isCommanderOpen={isCommanderOpen}
      commandPaletteCommands={commandPaletteCommands}
      previewResults={previewResults}
      isPreviewExecuting={isPreviewExecuting}
      previewError={previewError}
      currentSeeds={currentSeeds}
      updateSeeds={updateSeeds}
      executePreview={executePreview}
      exportPreviewResults={exportPreviewResults}
      tetrisMode={tetrisMode}
      setTetrisMode={setTetrisMode}
      showToast={showToast}
    />
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <NeatenSettingsProvider>{content}</NeatenSettingsProvider>
    </DndProvider>
  );
};


// Export with providers
const Epic1GraphEditor: React.FC<Epic1GraphEditorProps> = props => {
  return (
    <TutorialProvider>
      <IntelligenceProvider>
        <ReactFlowProvider>
          <Epic1GraphEditorClean {...props} />
          <TutorialOverlay />
        </ReactFlowProvider>
      </IntelligenceProvider>
    </TutorialProvider>
  );
};

export default Epic1GraphEditor;
export { Epic1GraphEditor };
export const Epic1GraphEditorWithProvider = Epic1GraphEditor;
