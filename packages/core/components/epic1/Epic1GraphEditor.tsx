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
  type XYPosition,
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

import { epic1NodeTypes } from './nodes';
import type { EditableNodeData } from './nodes';
import { droppableEpic1NodeTypes } from './nodes/droppableNodes';
import { CanvasContextMenu } from './nodes/CanvasContextMenu';
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
import {
  TabbedSidePanel,
  type SidePanelTabDefinition
} from './TabbedSidePanel';
import type { DocumentSummary } from './DocumentLibraryPanel';
import { GraphCommander, type GraphCommanderCommand } from './GraphCommander';
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
import {
  planFragmentInsertion,
  type InsertionPlan
} from './services/FragmentInsertionPlanner';
import type { PresetDropPayload } from './hooks/useDragDropHandlers';
import { AgentFragmentSuggestionService } from './services/AgentFragmentSuggestionService';
import {
  findFragmentDropTarget,
  type FragmentDropTarget
} from './services/FragmentDropTargeting';
import {
  buildComponentDefinition,
  type ComponentDefinition,
  type ComponentInstance,
  type GraphReferenceEntry,
  type ReferenceBinding,
  normalizeReferenceNamespace
} from './services/ComponentModel';
import { ComponentLibraryService } from './services/ComponentLibraryService';
import { GraphReferenceService } from './services/GraphReferenceService';
import { validateClosedComponentSelection } from './services/ComponentValidationService';
import {
  ComponentSaveDialog,
  type ComponentSaveDraft
} from './ComponentSaveDialog';

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
  const [isCommanderOpen, setIsCommanderOpen] = useState(false);

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
    useGraphViewControls(reactFlowInstance, {
      showToast,
      minZoom: 0.02,
      maxZoom: 4
    });

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

  const buildViewportFallbackInsertion = useCallback((): InsertionPlan => {
    return reactFlowInstance
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
  }, [reactFlowInstance]);

  const executePresetWithTarget = useCallback(
    (
      preset: Preset,
      options?: {
        dropTarget?: FragmentDropTarget | null;
        position?: { x: number; y: number } | null;
      }
    ) => {
      const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;
      const fragment = presetToAgentFragmentRecord(preset);
      let resolvedTarget = options?.dropTarget ?? null;

      if (!resolvedTarget && selectedNode) {
        const metadataPrefersReplacement =
          fragment.preferredInsertion === 'replace-node';
        if (metadataPrefersReplacement) {
          resolvedTarget = findFragmentDropTarget({
            pointer: {
              x: selectedNode.position.x + (selectedNode.width ?? 180) / 2,
              y: selectedNode.position.y + (selectedNode.height ?? 72) / 2
            },
            fragment,
            nodes,
            edges
          });
        }
      }

      const replacementTarget =
        resolvedTarget?.kind === 'replace-node' ? resolvedTarget : null;

      if (replacementTarget) {
        const targetNode = nodes.find(node => node.id === replacementTarget.nodeId);
        if (targetNode) {
          void insertPresetByMeta(
            preset,
            targetNode.position,
            null,
            { nodeId: targetNode.id }
          );
          return;
        }
      }

      if (resolvedTarget?.kind === 'insert-edge') {
        void insertPresetByMeta(
          preset,
          resolvedTarget.midpoint,
          buildEdgeSpliceTarget(resolvedTarget.edgeId)
        );
        return;
      }

      const insertionPlan = selectedNode
        ? planFragmentInsertion({
            fragment,
            selectedNode,
            nodes,
            edges
          })
        : buildViewportFallbackInsertion();

      const edgeSpliceTarget = insertionPlan.targetEdgeId
        ? buildEdgeSpliceTarget(insertionPlan.targetEdgeId)
        : null;

      void insertPresetByMeta(
        preset,
        options?.position ?? insertionPlan.position,
        edgeSpliceTarget
      );
    },
    [
      buildEdgeSpliceTarget,
      buildViewportFallbackInsertion,
      edges,
      insertPresetByMeta,
      nodes,
      selectedNodeId
    ]
  );

  const handleAssetInsert = useCallback(
    (item: Preset | Asset) => {
      const preset = item as Preset;
      if (!preset) {
        return;
      }
      executePresetWithTarget(preset);
    },
    [executePresetWithTarget]
  );

  const getFragmentSuggestions = useCallback(async () => {
    const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;
    return AgentFragmentSuggestionService.getSuggestions({
      selectedNode,
      nodes,
      edges
    });
  }, [edges, nodes, selectedNodeId]);

  // Drag and drop
  const { isDraggingOver, dropTarget, onDragOver, onDragLeave, onDragEnter, onDrop } =
    useGraphDragDrop(reactFlowInstance, setNodes, {
      showToast,
      onNodeCreate: () => void 0,
      onPresetDrop: (preset, position, dragTarget) => {
        const edgeSpliceTarget =
          dragTarget?.kind === 'insert-edge'
            ? buildEdgeSpliceTarget(dragTarget.edgeId)
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

  // Expose Organize Nodes so the client-built View menu can invoke it (the
  // layout function lives here; the menu lives across the client boundary).
  useEffect(() => {
    const win = window as typeof window & {
      __EPIC1_ORGANIZE_NODES__?: (() => void) | null;
    };
    win.__EPIC1_ORGANIZE_NODES__ = handleOrganizeNodes;
    return () => {
      win.__EPIC1_ORGANIZE_NODES__ = null;
    };
  }, [handleOrganizeNodes]);

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

  const graphReferences = useMemo<GraphReferenceEntry[]>(() => {
    return GraphReferenceService.listComponentReferences(
      componentInstances,
      componentDefinitions
    );
  }, [componentDefinitions, componentInstances]);

  const handleComponentInstanceNamespaceEdit = useCallback(
    (nodeId: string, nextNamespaceValue: string) => {
      const selectedNode = nodes.find((node: Node<EditableNodeData>) => node.id === nodeId);
      if (!selectedNode || selectedNode.type !== 'componentInstance') {
        handleNodeEdit(nodeId, nextNamespaceValue);
        return;
      }

      const instanceId = String(
        (selectedNode.data as Record<string, unknown>)?.instanceId ?? ''
      );
      const normalizedNamespace = normalizeReferenceNamespace(nextNamespaceValue);

      setNodes((currentNodes: Node<EditableNodeData>[]) =>
        currentNodes.map((node: Node<EditableNodeData>) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  value: normalizedNamespace,
                  namespace: normalizedNamespace
                }
              }
            : node
        )
      );

      if (instanceId) {
        setComponentInstances((current: ComponentInstance[]) =>
          current.map((instance: ComponentInstance) =>
            instance.instanceId === instanceId
              ? {
                  ...instance,
                  namespace: normalizedNamespace
                }
              : instance
          )
        );
      }
    },
    [handleNodeEdit, nodes, setNodes]
  );

  const handleGraphReferenceAwareNodeEdit = useCallback(
    (nodeId: string, newValue: string) => {
      const matchingReference = graphReferences.find(
        (reference: GraphReferenceEntry) => reference.readablePath === newValue
      );
      const referenceBinding = matchingReference
        ? GraphReferenceService.createBinding(matchingReference)
        : null;

      setNodes((currentNodes: Node<EditableNodeData>[]) =>
        currentNodes.map((node: Node<EditableNodeData>) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  value: newValue,
                  text: newValue,
                  variableName: newValue,
                  label: newValue,
                  referenceBinding: referenceBinding ?? undefined
                }
              }
            : node
        )
      );
    },
    [graphReferences, setNodes]
  );

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

  const saveSelectionAsComponent = useCallback(() => {
    const selectedNodes = nodes.filter((node: Node<EditableNodeData>) => node.selected);
    if (selectedNodes.length === 0) {
      showToast('info', 'Select nodes to save as a component');
      return;
    }

    const selectedNodeIds = new Set(selectedNodes.map((node: Node<EditableNodeData>) => node.id));
    const selectedEdges = edges.filter(
      (edge: Edge) => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
    );
    const outputNodes = selectedNodes.filter((node: Node<EditableNodeData>) => node.type === 'output');

    if (outputNodes.length === 0) {
      showToast('info', 'Select at least one output node in the component');
      return;
    }

    const closureValidation = validateClosedComponentSelection(selectedNodes, edges);
    if (!closureValidation.isClosed) {
      const incomingCount = closureValidation.externalIncomingEdges.length;
      const outgoingCount = closureValidation.externalOutgoingEdges.length;
      showToast(
        'error',
        `Component save blocked: selection has ${incomingCount} incoming and ${outgoingCount} outgoing external connection${incomingCount + outgoingCount === 1 ? '' : 's'}`
      );
      return;
    }

    setPendingComponentSelection({
      nodeIds: selectedNodes.map((node: Node<EditableNodeData>) => node.id),
      edgeIds: selectedEdges.map((edge: Edge) => edge.id)
    });
    setPendingComponentDraft({
      name: `Component ${componentDefinitions.length + 1}`,
      description: '',
      outputs: outputNodes.map((node: Node<EditableNodeData>) => {
        const rawValue = String(node.data?.value || node.id);
        return {
          sourceNodeId: node.id,
          key: rawValue
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '') || node.id,
          label: rawValue
        };
      })
    });
  }, [componentDefinitions.length, edges, nodes, showToast]);

  const handleSaveComponentDraft = useCallback(
    (draft: ComponentSaveDraft) => {
      if (!pendingComponentSelection) {
        return;
      }

      const nextDefinition = buildComponentDefinition({
        name: draft.name,
        description: draft.description,
        graphId: 'epic1-local',
        nodeIds: pendingComponentSelection.nodeIds,
        edgeIds: pendingComponentSelection.edgeIds,
        outputs: draft.outputs.map(output => ({
          key: output.key,
          label: output.label,
          description: `Output from ${output.label}`,
          valueType: 'text',
          sourceNodeId: output.sourceNodeId,
          sourcePath: 'data.value'
        }))
      });

      ComponentLibraryService.saveDefinition(nextDefinition);
      setComponentDefinitions(ComponentLibraryService.listDefinitions());
      setPendingComponentDraft(null);
      setPendingComponentSelection(null);
      showToast('success', `Saved ${nextDefinition.name}`);
    },
    [pendingComponentSelection, showToast]
  );

  const insertComponentDefinition = useCallback(
    (definition: ComponentDefinition, position?: XYPosition) => {
      const instance = ComponentLibraryService.instantiateDefinition(definition);
      const references = ComponentLibraryService.buildReferences(instance, definition);

      setComponentInstances((current: ComponentInstance[]) => [...current, instance]);
      createNode(
        'componentInstance',
        position ?? getCommandSpawnPosition(),
        {
          nodeType: 'componentInstance',
          value: instance.namespace,
          readableLabel: definition.name,
          componentStableId: instance.componentStableId,
          componentDefinitionId: instance.componentDefinitionId,
          componentVersion: instance.componentVersion,
          instanceId: instance.instanceId,
          namespace: instance.namespace,
          mode: instance.mode,
          outputKeys: definition.outputs.map(output => output.key),
          referencePaths: references.map(reference => reference.readablePath)
        }
      );

      showToast('success', `Inserted ${definition.name}`);
    },
    [createNode, getCommandSpawnPosition, showToast]
  );

  const detachSelectedComponentInstance = useCallback(() => {
    const selectedComponentNode = nodes.find(
      (node: Node<EditableNodeData>) =>
        node.id === selectedNodeId && node.type === 'componentInstance'
    );

    if (!selectedComponentNode) {
      showToast('info', 'Select a component instance to detach');
      return;
    }

    setNodes((currentNodes: Node<EditableNodeData>[]) =>
      currentNodes.map((node: Node<EditableNodeData>) =>
        node.id === selectedComponentNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                mode: 'detached'
              }
            }
          : node
      )
    );

    const instanceId = String(
      (selectedComponentNode.data as Record<string, unknown>)?.instanceId ?? ''
    );
    if (instanceId) {
      setComponentInstances((current: ComponentInstance[]) =>
        current.map((instance: ComponentInstance) =>
          instance.instanceId === instanceId
            ? {
                ...instance,
                mode: 'detached',
                provenance: {
                  ...instance.provenance,
                  detachedFromInstanceId:
                    instance.provenance.detachedFromInstanceId ?? instance.instanceId
                }
              }
            : instance
        )
      );
    }

    showToast('success', 'Detached component instance');
  }, [nodes, selectedNodeId, setNodes, showToast]);

  const refreshSelectedComponentInstance = useCallback(() => {
    const selectedComponentNode = nodes.find(
      (node: Node<EditableNodeData>) =>
        node.id === selectedNodeId && node.type === 'componentInstance'
    );

    if (!selectedComponentNode) {
      showToast('info', 'Select a linked component instance to refresh');
      return;
    }

    const nodeData = selectedComponentNode.data as Record<string, unknown>;
    const mode = String(nodeData.mode ?? 'linked');
    if (mode !== 'linked') {
      showToast('info', 'Only linked component instances can be refreshed');
      return;
    }

    const stableId = String(nodeData.componentStableId ?? '');
    const instanceId = String(nodeData.instanceId ?? '');
    if (!stableId || !instanceId) {
      showToast('error', 'Selected component instance is missing refresh metadata');
      return;
    }

    const latestDefinition = ComponentLibraryService.getLatestDefinitionByStableId(stableId);
    if (!latestDefinition) {
      showToast('error', 'Latest component definition could not be found');
      return;
    }

    const refreshedInstance = ComponentLibraryService.instantiateDefinition(
      latestDefinition,
      String(nodeData.namespace ?? '')
    );
    const syncedInstance: ComponentInstance = {
      ...refreshedInstance,
      instanceId,
      insertedAt: String(nodeData.insertedAt ?? refreshedInstance.insertedAt),
      mode: 'linked'
    };
    const references = ComponentLibraryService.buildReferences(syncedInstance, latestDefinition);

    setComponentInstances((current: ComponentInstance[]) =>
      current.map((instance: ComponentInstance) =>
        instance.instanceId === instanceId ? syncedInstance : instance
      )
    );

    setNodes((currentNodes: Node<EditableNodeData>[]) =>
      currentNodes.map((node: Node<EditableNodeData>) =>
        node.id === selectedComponentNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                value: syncedInstance.namespace,
                readableLabel: latestDefinition.name,
                componentStableId: syncedInstance.componentStableId,
                componentDefinitionId: syncedInstance.componentDefinitionId,
                componentVersion: syncedInstance.componentVersion,
                namespace: syncedInstance.namespace,
                mode: syncedInstance.mode,
                outputKeys: latestDefinition.outputs.map(output => output.key),
                referencePaths: references.map(reference => reference.readablePath)
              }
            }
          : node
      )
    );

    showToast('success', `Refreshed ${latestDefinition.name}`);
  }, [nodes, selectedNodeId, setNodes, showToast]);

  const refreshOutdatedComponentInstances = useCallback(() => {
    const refreshEntries: Array<{
      nodeId: string;
      syncedInstance: ComponentInstance;
      latestDefinition: ComponentDefinition;
      referencePaths: string[];
    }> = [];

    for (const componentNode of nodes.filter(
      (node: Node<EditableNodeData>) => node.type === 'componentInstance'
    )) {
      const nodeData = componentNode.data as Record<string, unknown>;
      const mode = String(nodeData.mode ?? 'linked');
      if (mode !== 'linked') {
        continue;
      }

      const stableId = String(nodeData.componentStableId ?? '');
      const instanceId = String(nodeData.instanceId ?? '');
      if (!stableId || !instanceId) {
        continue;
      }

      const latestDefinition = ComponentLibraryService.getLatestDefinitionByStableId(stableId);
      if (!latestDefinition) {
        continue;
      }

      const currentVersion = Number(nodeData.componentVersion ?? 0);
      if (latestDefinition.version <= currentVersion) {
        continue;
      }

      const refreshedInstance = ComponentLibraryService.instantiateDefinition(
        latestDefinition,
        String(nodeData.namespace ?? '')
      );
      const syncedInstance: ComponentInstance = {
        ...refreshedInstance,
        instanceId,
        insertedAt: String(nodeData.insertedAt ?? refreshedInstance.insertedAt),
        mode: 'linked'
      };
      const references = ComponentLibraryService.buildReferences(syncedInstance, latestDefinition);

      refreshEntries.push({
        nodeId: componentNode.id,
        syncedInstance,
        latestDefinition,
        referencePaths: references.map(reference => reference.readablePath)
      });
    }

    if (refreshEntries.length === 0) {
      showToast('info', 'No outdated linked components found');
      return;
    }

    setComponentInstances((current: ComponentInstance[]) =>
      current.map((instance: ComponentInstance) => {
        for (const entry of refreshEntries) {
          if (entry.syncedInstance.instanceId === instance.instanceId) {
            return entry.syncedInstance;
          }
        }
        return instance;
      })
    );

    setNodes((currentNodes: Node<EditableNodeData>[]) =>
      currentNodes.map((node: Node<EditableNodeData>) => {
        let refreshData:
          | {
              nodeId: string;
              syncedInstance: ComponentInstance;
              latestDefinition: ComponentDefinition;
              referencePaths: string[];
            }
          | undefined;
        for (const entry of refreshEntries) {
          if (entry.nodeId === node.id) {
            refreshData = entry;
            break;
          }
        }
        if (!refreshData) {
          return node;
        }

        return {
          ...node,
          data: {
            ...node.data,
            value: refreshData.syncedInstance.namespace,
            readableLabel: refreshData.latestDefinition.name,
            componentStableId: refreshData.syncedInstance.componentStableId,
            componentDefinitionId: refreshData.syncedInstance.componentDefinitionId,
            componentVersion: refreshData.syncedInstance.componentVersion,
            namespace: refreshData.syncedInstance.namespace,
            mode: refreshData.syncedInstance.mode,
            outputKeys: refreshData.latestDefinition.outputs.map(
              (output: ComponentDefinition['outputs'][number]) => output.key
            ),
            referencePaths: refreshData.referencePaths
          }
        };
      })
    );

    showToast(
      'success',
      `Refreshed ${refreshEntries.length} outdated linked component instance${refreshEntries.length === 1 ? '' : 's'}`
    );
  }, [nodes, setNodes, showToast]);

  const copySelectedComponentReferences = useCallback(async () => {
    const selectedComponentNode = nodes.find(
      (node: Node<EditableNodeData>) =>
        node.id === selectedNodeId && node.type === 'componentInstance'
    );

    if (!selectedComponentNode) {
      showToast('info', 'Select a component instance to copy its references');
      return;
    }

    const namespace = String(
      (selectedComponentNode.data as Record<string, unknown>)?.namespace ?? ''
    );
    const matchingReferences = graphReferences.filter(
      reference => reference.namespace === namespace
    );

    if (matchingReferences.length === 0) {
      showToast('info', 'No references available for the selected component');
      return;
    }

    try {
      await navigator.clipboard.writeText(
        matchingReferences.map(reference => reference.readablePath).join('\n')
      );
      showToast('success', `Copied ${matchingReferences.length} reference path${matchingReferences.length === 1 ? '' : 's'}`);
    } catch (error) {
      console.error('[Epic1GraphEditor] Failed to copy component references', error);
      showToast('error', 'Failed to copy component references');
    }
  }, [graphReferences, nodes, selectedNodeId, showToast]);

  const commandPaletteCommands = useMemo<GraphCommanderCommand[]>(() => {
    const spawnPosition = getCommandSpawnPosition();

    return [
      {
        id: 'file.export_graph',
        label: 'Export Graph',
        aliases: ['export', 'json', 'download'],
        category: 'File',
        shortcut: '⌘S',
        description: 'Download the current graph as JSON',
        execute: () => exportGraph()
      },
      {
        id: 'file.export_selection',
        label: 'Export Selection',
        aliases: ['export selected', 'selection json'],
        category: 'File',
        shortcut: '⌘E',
        description: 'Export the current selection',
        execute: () => exportSelected()
      },
      {
        id: 'file.import_graph',
        label: 'Open Graph',
        aliases: ['import', 'open', 'load'],
        category: 'File',
        shortcut: '⌘O',
        description: 'Import a graph file',
        execute: () => triggerImport()
      },
      {
        id: 'edit.paste',
        label: 'Paste',
        aliases: ['paste from clipboard', 'clipboard'],
        category: 'Edit',
        shortcut: '⌘V',
        description: 'Paste graph content from the clipboard',
        execute: () => pasteFromClipboard()
      },
      {
        id: 'edit.select_all',
        label: 'Select All',
        aliases: ['select everything'],
        category: 'Edit',
        shortcut: '⌘A',
        description: 'Select all nodes and edges',
        execute: () => selectAll()
      },
      {
        id: 'edit.clear_selection',
        label: 'Clear Selection',
        aliases: ['deselect', 'clear'],
        category: 'Edit',
        shortcut: 'Esc',
        description: 'Clear the current selection',
        execute: () => deselectAll()
      },
      {
        id: 'edit.invert_selection',
        label: 'Invert Selection',
        aliases: ['invert'],
        category: 'Edit',
        description: 'Invert the current node and edge selection',
        execute: () => invertSelection()
      },
      {
        id: 'edit.select_connected',
        label: 'Select Connected Nodes',
        aliases: ['connected', 'neighbors'],
        category: 'Edit',
        description: 'Select nodes connected to the current selection',
        execute: () => {
          if (!selectedNodeId) {
            showToast('info', 'Select a node to expand the connected selection');
            return;
          }
          selectConnectedNodes(selectedNodeId);
        }
      },
      {
        id: 'edit.duplicate',
        label: 'Duplicate Selection',
        aliases: ['duplicate node', 'copy selected'],
        category: 'Edit',
        shortcut: '⌘D',
        description: 'Duplicate the selected nodes',
        execute: () => duplicateNodes()
      },
      {
        id: 'edit.delete',
        label: 'Delete Selection',
        aliases: ['delete node', 'remove'],
        category: 'Edit',
        shortcut: 'Del',
        description: 'Delete the selected nodes',
        execute: () => deleteSelectedNodes()
      },
      {
        id: 'nodes.create_text_block',
        label: 'Add Text Block Node',
        aliases: ['text', 'text block'],
        category: 'Nodes',
        description: 'Create a new text block node',
        execute: () => createNode('textBlock', spawnPosition)
      },
      {
        id: 'nodes.create_weighted_choice',
        label: 'Add Weighted Choice Node',
        aliases: ['choice', 'branch', 'weighted choice'],
        category: 'Nodes',
        description: 'Create a new weighted choice node',
        execute: () => createNode('weightedChoice', spawnPosition)
      },
      {
        id: 'nodes.create_concat',
        label: 'Add Concatenate Node',
        aliases: ['concat', 'merge text'],
        category: 'Nodes',
        description: 'Create a concatenate node',
        execute: () => createNode('concat', spawnPosition)
      },
      {
        id: 'nodes.create_output',
        label: 'Add Output Node',
        aliases: ['output', 'result'],
        category: 'Nodes',
        description: 'Create a new output node',
        execute: () => createNode('output', spawnPosition)
      },
      {
        id: 'nodes.create_region_box',
        label: 'Create Region Box',
        aliases: ['region', 'box', 'group'],
        category: 'Nodes',
        shortcut: 'R',
        description: 'Create a region box at the viewport center',
        execute: () => createNode('enhancedBoundingBox', spawnPosition)
      },
      {
        id: 'layout.align_horizontal',
        label: 'Align Horizontal',
        aliases: ['align row'],
        category: 'Layout',
        description: 'Align selected nodes horizontally',
        execute: () => alignNodes('horizontal')
      },
      {
        id: 'layout.align_vertical',
        label: 'Align Vertical',
        aliases: ['align column'],
        category: 'Layout',
        description: 'Align selected nodes vertically',
        execute: () => alignNodes('vertical')
      },
      {
        id: 'layout.distribute_horizontal',
        label: 'Distribute Horizontal',
        aliases: ['space evenly row'],
        category: 'Layout',
        description: 'Distribute selected nodes horizontally',
        execute: () => distributeNodes('horizontal')
      },
      {
        id: 'layout.distribute_vertical',
        label: 'Distribute Vertical',
        aliases: ['space evenly column'],
        category: 'Layout',
        description: 'Distribute selected nodes vertically',
        execute: () => distributeNodes('vertical')
      },
      {
        id: 'layout.neaten_all',
        label: 'Neaten All',
        aliases: ['auto layout', 'arrange'],
        category: 'Layout',
        description: 'Run the global neaten operation',
        execute: () => neatenAll()
      },
      {
        id: 'layout.cleanup_all',
        label: 'Cleanup All',
        aliases: ['cleanup', 'tidy graph'],
        category: 'Layout',
        description: 'Run the global cleanup operation',
        execute: () => cleanupAll()
      },
      {
        id: 'view.fit_view',
        label: 'Fit View',
        aliases: ['fit', 'center view'],
        category: 'View',
        shortcut: '⌘0',
        description: 'Fit the current graph in view',
        execute: () => fitView()
      },
      {
        id: 'view.zoom_in',
        label: 'Zoom In',
        aliases: ['zoom'],
        category: 'View',
        shortcut: '⌘+',
        description: 'Increase the graph zoom level',
        execute: () => zoomIn()
      },
      {
        id: 'view.zoom_out',
        label: 'Zoom Out',
        aliases: ['unzoom'],
        category: 'View',
        shortcut: '⌘-',
        description: 'Decrease the graph zoom level',
        execute: () => zoomOut()
      },
      {
        id: 'view.reset_zoom',
        label: 'Reset Zoom',
        aliases: ['reset view', '100%'],
        category: 'View',
        description: 'Reset the graph zoom level',
        execute: () => resetZoom()
      },
      {
        id: 'view.toggle_preview',
        label: 'Toggle Preview',
        aliases: ['preview tray', 'show preview', 'hide preview'],
        category: 'View',
        description: previewTrayIsOpen ? 'Hide the preview tray' : 'Show the preview tray',
        execute: () => togglePreview()
      },
      {
        id: 'graph.execute',
        label: 'Execute Graph',
        aliases: ['run graph', 'preview render'],
        category: 'Graph',
        description: 'Run the current graph',
        execute: () => handleExecute()
      },
      {
        id: 'components.save_selection',
        label: 'Save Selection as Component',
        aliases: ['save component', 'component from selection'],
        category: 'Components',
        description: 'Save the selected graph cluster as a reusable component',
        execute: () => saveSelectionAsComponent()
      },
      {
        id: 'components.insert_latest',
        label: 'Insert Latest Component',
        aliases: ['insert component', 'component library'],
        category: 'Components',
        description: 'Insert the most recently saved component',
        execute: () => {
          const latest = [...componentDefinitions].sort((left, right) =>
            right.metadata.updatedAt.localeCompare(left.metadata.updatedAt)
          )[0];
          if (!latest) {
            showToast('info', 'No components saved yet');
            return;
          }
          insertComponentDefinition(latest);
        }
      },
      {
        id: 'components.detach_selected',
        label: 'Detach Selected Component',
        aliases: ['detach component', 'unlink component'],
        category: 'Components',
        description: 'Convert the selected component instance into a detached local copy state',
        execute: () => detachSelectedComponentInstance()
      },
      {
        id: 'components.refresh_selected_component',
        label: 'Refresh Selected Component',
        aliases: ['refresh component', 'update linked component', 'resync component'],
        category: 'Components',
        description: 'Resync the selected linked component instance from the latest saved definition',
        execute: () => refreshSelectedComponentInstance()
      },
      {
        id: 'components.refresh_outdated_components',
        label: 'Refresh Outdated Linked Components',
        aliases: ['refresh all linked components', 'update outdated components', 'resync all linked components'],
        category: 'Components',
        description: 'Resync every outdated linked component instance from the latest saved definitions',
        execute: () => refreshOutdatedComponentInstances()
      },
      {
        id: 'components.copy_selected_references',
        label: 'Copy Selected Component References',
        aliases: ['copy component references', 'copy component outputs'],
        category: 'Components',
        description: 'Copy all surfaced readable paths for the selected component instance',
        execute: () => {
          void copySelectedComponentReferences();
        }
      }
    ];
  }, [
    alignNodes,
    componentDefinitions,
    createNode,
    copySelectedComponentReferences,
    deleteSelectedNodes,
    deselectAll,
    detachSelectedComponentInstance,
    distributeNodes,
    duplicateNodes,
    exportGraph,
    exportSelected,
    fitView,
    getCommandSpawnPosition,
    handleExecute,
    invertSelection,
    insertComponentDefinition,
    neatenAll,
    saveSelectionAsComponent,
    pasteFromClipboard,
    previewTrayIsOpen,
    refreshOutdatedComponentInstances,
    refreshSelectedComponentInstance,
    resetZoom,
    selectAll,
    selectConnectedNodes,
    togglePreview,
    triggerImport,
    zoomIn,
    zoomOut
  ]);

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
            showPreview={showPreview}
            tabDefinitions={sidePanelTabDefinitions}
            exploreDocuments={exploreDocuments}
            onOpenDocument={onOpenDocument}
            selectedNode={nodes.find(n => n.id === selectedNodeId)}
            nodes={nodes}
            edges={edges}
            onInsert={handleAssetInsert}
            componentDefinitions={componentDefinitions}
            componentReferences={graphReferences}
            onComponentInsert={insertComponentDefinition}
            onSaveSelectionAsComponent={saveSelectionAsComponent}
            onDetachSelectedComponent={detachSelectedComponentInstance}
            onRefreshSelectedComponent={refreshSelectedComponentInstance}
            onRefreshOutdatedComponents={refreshOutdatedComponentInstances}
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
          {containerDropIndicator && (
            <div
              className="node-replace-indicator"
              aria-hidden="true"
              style={{
                left: `${containerDropIndicator.left}px`,
                top: `${containerDropIndicator.top}px`,
                width: `${containerDropIndicator.width}px`,
                height: `${containerDropIndicator.height}px`
              }}
            >
              <span className="node-replace-indicator__label">Drop In Region</span>
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
              onPaneContextMenu={event => {
                event.preventDefault();
                setPaneContextMenu({ x: event.clientX, y: event.clientY });
              }}
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
              fitViewOptions={{ padding: 0.2, minZoom: 0.02, maxZoom: 2 }}
              minZoom={0.02}
              maxZoom={4}
              snapToGrid
              snapGrid={[15, 15]}
              deleteKeyCode={['Delete', 'Backspace']}
              multiSelectionKeyCode={['Shift', 'Meta', 'Control']}
              panOnScroll={false}
              panOnDrag
              panActivationKeyCode="Space"
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
                    Simulate
                  </button>
                  <button
                    onClick={togglePreview}
                    className="preview-button"
                    data-tutorial-anchor="preview-button"
                  >
                    {previewTrayIsOpen ? 'Hide Output' : 'Test Output'}
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

            {paneContextMenu && (
              <CanvasContextMenu
                position={paneContextMenu}
                onClose={() => setPaneContextMenu(null)}
                onLayoutCleanup={handleOrganizeNodes}
                onAddNote={() => {
                  const flow = reactFlowInstance
                    ? reactFlowInstance.screenToFlowPosition({
                        x: paneContextMenu.x,
                        y: paneContextMenu.y
                      })
                    : { x: 0, y: 0 };
                  setNodes(current => [
                    ...current,
                    {
                      id: `note-${Date.now()}`,
                      type: 'postItNote',
                      position: flow,
                      data: { nodeType: 'postItNote', text: '' }
                    } as unknown as Node<EditableNodeData>
                  ]);
                }}
              />
            )}
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

          <ComponentSaveDialog
            isOpen={Boolean(pendingComponentDraft)}
            draft={pendingComponentDraft}
            onClose={() => {
              setPendingComponentDraft(null);
              setPendingComponentSelection(null);
            }}
            onSave={handleSaveComponentDraft}
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
        commands={commandPaletteCommands}
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
            onExecute={() => {
              void executePreview();
            }}
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
