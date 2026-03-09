import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef
} from 'react';
import ReactFlow, {
  Edge,
  Node,
  ReactFlowProvider,
  Background,
  Controls,
  Connection,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
  ReactFlowInstance,
  MiniMap,
  ConnectionLineType,
  SelectionMode,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Node types and components
import { epic1NodeTypes } from './nodes';
import type { EditableNodeData } from './nodes';
import { droppableEpic1NodeTypes } from './nodes/droppableNodes';

// Custom hooks - using all extracted functionality
import { useKonamiCode } from './hooks/useKonamiCode';
import { useGraphHistory } from './hooks/useGraphHistory';
import { useGraphPersistence } from './hooks/useGraphPersistence';
import { useNodeOperations } from './hooks/useNodeOperations';
import { useGraphDragDrop } from './hooks/useGraphDragDrop';
import { useDragDropHandlers } from './hooks/useDragDropHandlers';
import { useGraphKeyboardShortcuts } from './hooks/useGraphKeyboardShortcuts';
import { usePreviewTrayLayout } from './hooks/usePreviewTrayLayout';
import { usePreviewEngine } from './hooks/usePreviewEngine';
import { useGraphViewControls } from './hooks/useGraphViewControls';
import { useGraphImportExport } from './hooks/useGraphImportExport';
import { useGraphSelection } from './hooks/useGraphSelection';
import { useGraphPreview } from './hooks/useGraphPreview';

// Components
import { GraphModals, WizardPreviewResult } from './components/GraphModals';
import {
  ConnectionFeedback,
  useConnectionValidation
} from './ConnectionFeedback';
import { ConnectionToast, useToast } from './ConnectionToast';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { PanZoomControls } from './PanZoomControls';
import { EdgeRoutingControls } from './EdgeRoutingControls';
import { PreviewPanel } from './preview/PreviewPanel';
import { PreviewTray } from '../PreviewTray/PreviewTray';
import { TabbedSidePanel } from './TabbedSidePanel';
import { GraphCommander } from './GraphCommander';
import { NodeTetris } from './NodeTetris';
import { NodeToolbar } from './NodeToolbar';
import { NodePalette } from './NodePalette';
import { MagneticSnapHandler } from './interactions/MagneticSnapHandler';
import {
  SelectionFeedback,
  useNodeInteractions
} from './interactions/NodeInteractionEnhancer';
import {
  MicroInteraction,
  useMicroInteractions
} from './animations/MicroInteractions';
import { SafeReactFlowWrapper } from './SafeReactFlowWrapper';
import { edgeTypes } from './EdgeRenderingFix';
import { PromptParser, ParsedPromptResult } from './utils/promptParser';
import { usePreviewTrayStore } from '../../stores/previewTrayStore';
import { AuthModal } from '../auth/AuthModal';
import { TutorialProvider, useTutorial } from './onboarding/TutorialContext';
import { TutorialOverlay } from './onboarding/TutorialOverlay';
import type { AgentFragmentRecord, Preset } from '@prompt/asset-browser';
import type { Asset } from '../../services/assetMatcher';
import { getSupabase } from '../../utils/supabaseClient';
import { planFragmentInsertion } from './services/FragmentInsertionPlanner';
import { AgentFragmentSuggestionService } from './services/AgentFragmentSuggestionService';

// Styles
import './ReactFlowOverrides.css';
import './Epic1GraphEditor.css';
import './KeyboardShortcuts.css';
import './nodes/EnhancedBoundingBox.css';
import './PanZoomControls.css';

// Provider placeholders
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
}

function presetToAgentFragmentRecord(preset: Preset): AgentFragmentRecord {
  const metadata = (preset.metadata ?? {}) as Record<string, unknown>;
  const roles = Array.isArray(metadata.roles)
    ? (metadata.roles.filter((value): value is AgentFragmentRecord['roles'][number] => typeof value === 'string') as AgentFragmentRecord['roles'])
    : [];
  const domains = Array.isArray(metadata.domains)
    ? (metadata.domains.filter((value): value is AgentFragmentRecord['domains'][number] => typeof value === 'string') as AgentFragmentRecord['domains'])
    : [];
  const placementHints = Array.isArray(metadata.placementHints)
    ? (metadata.placementHints.filter((value): value is AgentFragmentRecord['placementHints'][number] => typeof value === 'string') as AgentFragmentRecord['placementHints'])
    : [];
  const preferredInsertion =
    metadata.preferredInsertion === 'replace-node' ||
    metadata.preferredInsertion === 'insert-edge' ||
    metadata.preferredInsertion === 'free-place'
      ? metadata.preferredInsertion
      : 'free-place';
  const entryStrategy =
    metadata.entryStrategy === 'single-node' ||
    metadata.entryStrategy === 'auto-boundary' ||
    metadata.entryStrategy === 'manual'
      ? metadata.entryStrategy
      : 'auto-boundary';
  const exitStrategy =
    metadata.exitStrategy === 'single-node' ||
    metadata.exitStrategy === 'auto-boundary' ||
    metadata.exitStrategy === 'manual'
      ? metadata.exitStrategy
      : 'auto-boundary';
  const suggestionWeight =
    typeof metadata.suggestionWeight === 'number' ? metadata.suggestionWeight : 0;
  const requiresBranchLane = metadata.requiresBranchLane === true;

  return {
    id: preset.id,
    name: preset.name,
    path:
      typeof preset.path === 'string'
        ? preset.path
        : typeof metadata.file === 'string'
          ? metadata.file
          : '',
    category: preset.category ?? 'uncategorized',
    description: preset.description,
    tags: preset.tags ?? [],
    roles,
    domains,
    nodeTypes: [],
    placementHints,
    tone: [],
    nodeCount: typeof preset.nodes === 'number' ? preset.nodes : 1,
    preferredInsertion,
    entryStrategy,
    exitStrategy,
    suggestionWeight,
    requiresBranchLane,
    priority: 0
  };
}

/**
 * Tutorial Button Component that can access the tutorial context
 */
const TutorialButton: React.FC = () => {
  const { startTutorial } = useTutorial();
  const handleClick = () => {
    startTutorial();
  };
  return (
    <button
      className="palette-footer-button"
      data-tutorial-anchor="tutorial-button"
      onClick={handleClick}
      style={{
        padding: '10px 12px',
        background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.15) 0%, rgba(103, 126, 234, 0.25) 100%)',
        border: '1px solid rgba(103, 126, 234, 0.3)',
        borderRadius: '6px',
        color: '#e0e0e0',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.6 }}>
        <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.81 8.985.936 8 1.783z"/>
      </svg>
      Tutorial
    </button>
  );
};

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
  assetLibraryPosition = 'left'
}) => {
  // Node types based on asset library visibility
  const nodeTypes = showAssetLibrary ? droppableEpic1NodeTypes : epic1NodeTypes;

  // React Flow instance
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [isCommanderOpen, setIsCommanderOpen] = useState(false);

  // Graph persistence - DISABLED to prevent overriding new nodes
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

  // Graph history (undo/redo)
  const { undo, redo, canUndo, canRedo, clearHistory } = useGraphHistory(
    nodes,
    edges,
    setNodes,
    setEdges,
    { maxHistorySize: 50, debounceMs: 500 }
  );

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
    useGraphViewControls(reactFlowInstance, { showToast });

  // Node interactions and drag-drop helpers
  const { addNodeWithBounce } = useNodeInteractions();
  const { insertPresetByMeta } = useDragDropHandlers({
    setNodes,
    setEdges,
    reactFlowInstance,
    showToast,
    addNodeWithBounce
  });

  const buildEdgeSpliceTarget = useCallback(
    (edgeId?: string | null) => {
      if (!edgeId) {
        return null;
      }

      const originalEdge = edges.find(edge => edge.id === edgeId);
      if (!originalEdge) {
        return null;
      }

      return {
        edgeId: originalEdge.id,
        sourceId: originalEdge.source,
        targetId: originalEdge.target,
        edgeType: originalEdge.type,
        edgeClassName: originalEdge.className,
        edgeStyle: originalEdge.style as Record<string, unknown> | undefined,
        markerEnd: originalEdge.markerEnd,
        sourceHandle: originalEdge.sourceHandle ?? null,
        targetHandle: originalEdge.targetHandle ?? null
      };
    },
    [edges]
  );

  const handleAssetInsert = useCallback(
    (item: Preset | Asset) => {
      const preset = item as Preset;
      if (!preset) {
        return;
      }
      const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;
      const insertionPlan = selectedNode
        ? planFragmentInsertion({
            fragment: presetToAgentFragmentRecord(preset),
            selectedNode,
            nodes,
            edges
          })
        : reactFlowInstance
          ? {
              anchor: 'free-placement' as const,
              position: reactFlowInstance.screenToFlowPosition({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
              }),
              notes: ['No selection; using viewport center placement.']
            }
          : {
              anchor: 'free-placement' as const,
              position: { x: 250, y: 250 },
              notes: ['No selection or React Flow instance; using fallback position.']
            };
      void insertPresetByMeta(
        preset,
        insertionPlan.position,
        buildEdgeSpliceTarget(insertionPlan.targetEdgeId)
      );
    },
    [
      buildEdgeSpliceTarget,
      edges,
      insertPresetByMeta,
      nodes,
      reactFlowInstance,
      selectedNodeId
    ]
  );

  const getFragmentSuggestions = useCallback(async () => {
    const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;
    return AgentFragmentSuggestionService.getSuggestions({
      selectedNode,
      nodes,
      edges
    });
  }, [edges, nodes, selectedNodeId]);

  const getPlannedFragmentSuggestions = useCallback(async () => {
    const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;
    const suggestions = await AgentFragmentSuggestionService.getSuggestions({
      selectedNode,
      nodes,
      edges
    });

    return AgentFragmentSuggestionService.getPlannedSuggestions({
      selectedNode,
      nodes,
      edges,
      suggestions
    });
  }, [edges, nodes, selectedNodeId]);

  const insertTopFragmentSuggestion = useCallback(async () => {
    const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;
    return AgentFragmentSuggestionService.insertTopSuggestion({
      selectedNode,
      nodes,
      edges,
      insertPreset: async preset => {
        const insertionPlan = selectedNode
          ? planFragmentInsertion({
              fragment: presetToAgentFragmentRecord(preset),
              selectedNode,
              nodes,
              edges
            })
          : reactFlowInstance
            ? {
                anchor: 'free-placement' as const,
                position: reactFlowInstance.screenToFlowPosition({
                  x: window.innerWidth / 2,
                  y: window.innerHeight / 2
                }),
                notes: ['No selection; using viewport center placement.']
              }
            : {
                anchor: 'free-placement' as const,
                position: { x: 250, y: 250 },
                notes: ['No selection or React Flow instance; using fallback position.']
              };

        await insertPresetByMeta(
          preset,
          insertionPlan.position,
          buildEdgeSpliceTarget(insertionPlan.targetEdgeId)
        );
      }
    });
  }, [
    buildEdgeSpliceTarget,
    edges,
    insertPresetByMeta,
    nodes,
    reactFlowInstance,
    selectedNodeId
  ]);

  // Drag and drop
  const { isDraggingOver, dropTarget, onDragOver, onDragLeave, onDragEnter, onDrop } =
    useGraphDragDrop(reactFlowInstance, setNodes, {
      showToast,
      onNodeCreate: () => void 0,
      onPresetDrop: (preset, position, dragTarget) => {
        void insertPresetByMeta(
          preset,
          position,
          dragTarget?.kind === 'insert-edge'
            ? buildEdgeSpliceTarget(dragTarget.edgeId)
            : null
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
      const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;
      const insertionPlan = selectedNode
        ? planFragmentInsertion({
            fragment: presetToAgentFragmentRecord(
              preset as Preset
            ),
            selectedNode,
            nodes,
            edges
          })
        : reactFlowInstance
          ? {
              anchor: 'free-placement' as const,
              position: reactFlowInstance.screenToFlowPosition({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
              }),
              notes: ['No selection; using viewport center placement.']
            }
          : {
              anchor: 'free-placement' as const,
              position: { x: 250, y: 250 },
              notes: ['No selection or React Flow instance; using fallback position.']
            };
      await insertPresetByMeta(
        preset as Parameters<typeof insertPresetByMeta>[0],
        insertionPlan.position,
        buildEdgeSpliceTarget(insertionPlan.targetEdgeId)
      );
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
    ).__EPIC1_INSERT_TOP_FRAGMENT_SUGGESTION__ = insertTopFragmentSuggestion;

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
    buildEdgeSpliceTarget,
    edges,
    getFragmentSuggestions,
    insertPresetByMeta,
    insertTopFragmentSuggestion,
    nodes,
    reactFlowInstance,
    selectedNodeId
  ]);

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
    exportPreviewResults
  } = useGraphPreview(nodes, edges, {
    showToast,
    defaultSeeds: previewSeeds
      ? previewSeeds.map(s => Number(s))
      : [1234, 5678, 9012],
    debounceDelay: previewDebounceDelay
  });

  // Preview tray layout
  usePreviewTrayLayout(showPreview);

  // Preview engine (for backward compatibility)
  const { previewEngine, handlePreviewSeedChange } = usePreviewEngine({
    previewDebounceDelay,
    previewSeeds,
    nodes,
    edges,
    isPreviewVisible,
    isDragging: isDraggingOver
  });

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
            minZoom: 0.5,
            maxZoom: 1.5
          });
        }
      }, 100);

    } catch (error) {
      console.error('[Epic1GraphEditor] Error parsing prompt:', error);
      showToast('error', 'Failed to parse prompt and create nodes');
    }
  }, [setNodes, setEdges, showToast, reactFlowInstance]);

  // Enhanced nodes with edit handlers
  const enhancedNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      type: node.type || 'textBlock',
      position: node.position || { x: 0, y: 0 },
      data: {
        ...node.data,
        onEdit: (newValue: string) => handleNodeEdit(node.id, newValue),
        onEditStart: () => {},
        onEditEnd: () => {}
      },
      selected: node.selected || node.id === selectedNodeId,
      width: node.width || undefined,
      height: node.height || undefined
    }));
  }, [nodes, selectedNodeId, handleNodeEdit]);

  // Notify parent of changes
  useEffect(() => {
    onNodesChangeProp?.(enhancedNodes);
  }, [enhancedNodes, onNodesChangeProp]);

  useEffect(() => {
    onEdgesChangeProp?.(edges);
  }, [edges, onEdgesChangeProp]);

  // Handle execute button
  const handleExecute = () => {
    onExecute?.(enhancedNodes, edges);
  };

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

  const content = (
    <div
      className={`epic1-graph-editor ${isDraggingOver ? 'drag-over' : ''}`}
      style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Main horizontal container for everything except preview tray */}
      <div
        style={{
          flex: showPreview ? '1 1 auto' : '1',
          display: 'flex',
          overflow: 'hidden',
          minHeight: 0
        }}
      >
        {/* Tabbed Side Panel with Asset Library */}
        {showAssetLibrary && (
          <TabbedSidePanel
            position={assetLibraryPosition}
            previewEngine={previewEngine}
            defaultTab="assets"
            showAssets={true}
            showPreview={true}
            selectedNode={nodes.find(n => n.id === selectedNodeId)}
            nodes={nodes}
            edges={edges}
            onInsert={handleAssetInsert}
          />
        )}

        {/* Main Graph Canvas */}
        <div
          className="graph-canvas-container"
          data-tutorial-anchor="canvas"
          style={{ flex: 1, minWidth: 0, position: 'relative' }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
        >
          {isDraggingOver && (
            <div className="drop-indicator" aria-live="polite">
              {dropTarget?.kind === 'replace-node'
                ? 'Drop to replace node'
                : dropTarget?.kind === 'insert-edge'
                  ? 'Drop to insert on edge'
                  : 'Drop to insert'}
            </div>
          )}
          {edgeInsertIndicator && (
            <div
              className="edge-insert-indicator"
              aria-hidden="true"
              style={{
                left: `${edgeInsertIndicator.left}px`,
                top: `${edgeInsertIndicator.top}px`
              }}
            >
              +
            </div>
          )}
          {replaceNodeIndicator && (
            <div
              className="node-replace-indicator"
              aria-hidden="true"
              style={{
                left: `${replaceNodeIndicator.left}px`,
                top: `${replaceNodeIndicator.top}px`,
                width: `${replaceNodeIndicator.width}px`,
                height: `${replaceNodeIndicator.height}px`
              }}
            >
              <span className="node-replace-indicator__label">Replace</span>
            </div>
          )}
          <SafeReactFlowWrapper>
            <ReactFlow
              nodes={enhancedNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={onInit}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              onNodesDelete={onNodesDelete}
              onEdgesDelete={onEdgesDelete}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDragEnter={onDragEnter}
              onDrop={onDrop}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              connectionMode={ConnectionMode.Loose}
              connectionLineType={ConnectionLineType.SmoothStep}
              selectionMode={SelectionMode.Partial}
              fitView
              snapToGrid
              snapGrid={[15, 15]}
              deleteKeyCode={['Delete', 'Backspace']}
              multiSelectionKeyCode={['Shift', 'Meta', 'Control']}
              panOnScroll={false}
              panOnDrag={[1, 2]}
              zoomOnScroll={true}
              zoomOnDoubleClick
              isValidConnection={isValidConnection}
            >
              <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
              <Controls showInteractive={false} />
              <MiniMap pannable zoomable />

              {/* Additional UI Elements moved outside due to React Flow rendering issues */}

              <Panel position="top-right">
                <div className="panel-controls">
                  <button onClick={handleExecute} className="execute-button">
                    Execute
                  </button>
                  <button
                    onClick={togglePreview}
                    className="preview-button"
                    data-tutorial-anchor="preview-button"
                  >
                    {isPreviewVisible ? 'Hide' : 'Show'} Preview
                  </button>
                </div>
              </Panel>

              <Panel position="bottom-left">
                <PanZoomControls />
              </Panel>

              <Panel position="bottom-right">
                <EdgeRoutingControls />
              </Panel>

              {/* Magnetic Snap Handler */}
              <MagneticSnapHandler />

              {/* Selection Feedback */}
              <SelectionFeedback />

              {/* Connection Feedback */}
              <ConnectionFeedback nodes={nodes} edges={edges} />

              {/* Micro Interactions */}
              {interactions.map(interaction => (
                <MicroInteraction key={interaction.id} {...interaction} />
              ))}
            </ReactFlow>
          </SafeReactFlowWrapper>

          {/* NodePalette - positioned outside ReactFlow */}
          <div style={{            position: 'absolute',            top: 0,            left: 0,            bottom: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'stretch'
          }}>
            <NodePalette
              collapsed={nodePaletteCollapsed}
              onCollapsedChange={setNodePaletteCollapsed}
            >
              {/* Footer buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                {currentUser ? (
                  <button
                    className="palette-footer-button"
                    onClick={async () => {
                      const sb = getSupabase();
                      if (!sb) { return; }
                      await sb.auth.signOut();
                    }}
                    style={{
                      padding: '10px 12px',
                      background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.15) 0%, rgba(103, 126, 234, 0.25) 100%)',
                      border: '1px solid rgba(103, 126, 234, 0.3)',
                      borderRadius: '6px',
                      color: '#e0e0e0',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                    title={currentUser?.email || ''}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.6 }}>
                      <path d="M3 8a.5.5 0 0 1 .5-.5H10V5.707a.5.5 0 0 1 .854-.353l3 3a.5.5 0 0 1 0 .707l-3 3A.5.5 0 0 1 10 11.707V9.5H3.5A.5.5 0 0 1 3 9V8z"/>
                    </svg>
                    Sign out
                  </button>
                ) : (
                  <button
                    className="palette-footer-button"
                    onClick={() => {
                      setIsAuthModalOpen(true);
                    }}
                    style={{
                      padding: '10px 12px',
                      background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.15) 0%, rgba(103, 126, 234, 0.25) 100%)',
                      border: '1px solid rgba(103, 126, 234, 0.3)',
                      borderRadius: '6px',
                      color: '#e0e0e0',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.6 }}>
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    Login
                  </button>
                )}
                <button
                  className="palette-footer-button prompt-wizard-button"
                  data-tutorial-anchor="wizard-button"
                  onClick={() => setIsPromptWizardOpen(true)}
                  style={{
                    padding: '10px 12px',
                    background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.15) 0%, rgba(103, 126, 234, 0.25) 100%)',
                    border: '1px solid rgba(103, 126, 234, 0.3)',
                    borderRadius: '6px',
                    color: '#e0e0e0',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.6 }}>
                    <path d="M9.5 1L8 2.5 6.5 1 5 2.5 3.5 1 2 2.5 0.5 1v14l1.5-1.5L3.5 15 5 13.5 6.5 15 8 13.5 9.5 15l1.5-1.5L12.5 15l1.5-1.5L15.5 15V1l-1.5 1.5L12.5 1 11 2.5 9.5 1zM3 4h10v1H3V4zm0 3h10v1H3V7zm0 3h7v1H3v-1z"/>
                  </svg>
                  Wizard
                </button>
                <TutorialButton />
              </div>
            </NodePalette>
          </div>

          {/* Modals */}
          <GraphModals
            isPromptWizardOpen={isPromptWizardOpen}
            setIsPromptWizardOpen={setIsPromptWizardOpen}
            isAuthModalOpen={isAuthModalOpen}
            setIsAuthModalOpen={setIsAuthModalOpen}
            saveAsPresetNodeId={saveAsPresetNodeId}
            setSaveAsPresetNodeId={setSaveAsPresetNodeId}
            pendingWizardNodes={pendingWizardNodes}
            setPendingWizardNodes={setPendingWizardNodes}
            nodes={nodes}
            setNodes={setNodes}
            setEdges={setEdges}
            setCustomPresets={setCustomPresets}
            setCurrentUser={setCurrentUser}
          />

          {/* Keyboard Shortcuts Display */}
          <KeyboardShortcuts />

          {/* History Palette */}
          {historyVisible && <HistoryPalette />}

          {/* Connection Toast */}
          <ConnectionToast
            message={activeToast}
            onDismiss={() => {
              if (activeToast) {
                dismissToast(activeToast.id);
              }
            }}
          />
        </div>
      </div>

      <GraphCommander
        isOpen={isCommanderOpen}
        onClose={() => setIsCommanderOpen(false)}
        onInsertTopSuggestion={insertTopFragmentSuggestion}
        onGetSuggestions={getPlannedFragmentSuggestions}
        onTogglePreview={togglePreview}
        onFitView={fitView}
        onExecute={handleExecute}
        onExportGraph={exportGraph}
      />

      {/* Preview Tray - As proper sibling that pushes content up */}
      {showPreview && (
        <div style={{ flexShrink: 0 }}>
          <PreviewTray
            results={previewResults}
            isExecuting={isPreviewExecuting}
            error={previewError}
            seeds={currentSeeds}
            onSeedsChange={updateSeeds}
            onExport={exportPreviewResults}
          />
        </div>
      )}

      {/* Tetris Mode */}
      {tetrisMode && (
        <NodeTetris
          onExit={() => {
            setTetrisMode(false);
            showToast('info', 'Exited Tetris mode');
          }}
          onScoreUpdate={() => void 0}
        />
      )}
    </div>
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
