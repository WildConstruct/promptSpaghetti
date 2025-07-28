import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import {
  Edge,
  Node,
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  Connection,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  EdgeChange,
  NodeChange,
  ConnectionLineType,
  useReactFlow,
  useViewport
} from 'reactflow';
import { InspectorPanel } from './components/Inspector';
import { NodeRenderer } from './components/NodeRenderer';
import { VariablePortNodeRenderer } from './components/VariablePortNodeRenderer';
import { StatusBar } from './components/StatusBar';
import { RestorePrompt } from './components/RestorePrompt';
import { EncryptionState, EncryptionAlgorithm } from './components/EncryptionStatus';
import { nodeSchemas } from './nodeSchemas';
import { NodeMeta } from './Palette';
import { TabbedPalette } from './palette/TabbedPalette';
import {
  WeightedChoiceIcon,
  ConcatIcon,
  OutputIcon,
  IncludeIcon,
  SetVariableIcon,
  GetVariableIcon
} from './icons';
import { useGraphStore } from './graphStore';
import { PreviewModal } from './PreviewModal';
import { usePreviewSeeds } from './usePreviewSeeds';
import { ResponsiveCorrectionsPanel } from './ResponsiveCorrectionsPanel';
import { CorrectionsStatsDashboard } from './components/CorrectionsStatsDashboard';
import { ExtensionManagerPanel } from './components/ExtensionManager/ExtensionManagerPanel';
import { useCorrectionsEnabled } from './correctionsStore';
import SaveProjectDialog from './components/ProjectDialogs/SaveProjectDialog';
import LoadProjectDialog from './components/ProjectDialogs/LoadProjectDialog';
import ExportBundleDialog from './components/ProjectDialogs/ExportBundleDialog';
import { SaveTemplateDialog } from './components/TemplateDialogs/SaveTemplateDialog';
import { TemplateBrowser } from './components/TemplateDialogs/TemplateBrowser';
import { 
  GraphAnalysisPanel, 
  PerformanceMonitor, 
  OptimizationControls, 
  OptimizationSettings 
} from './components/GraphOptimization';
import { StickyNotesManager } from './components/StickyNotes/StickyNotesManager';
import { NodeLabelsManager } from './components/NodeLabels/NodeLabelsManager';
import { RegionGroupsManager } from './components/RegionGroups/RegionGroupsManager';
import { ConnectionAnnotationsLayer } from './components/Annotations/ConnectionAnnotationsLayer';
import { RealTimePreviewPanel } from './components/Preview/RealTimePreviewPanel';
import { IndividualResultManager } from './components/Preview/IndividualResultManager';
import { DirectorPreviewToolbar } from './components/DirectorToolbar/DirectorPreviewToolbar';
import { SettingsModal } from './components/Modal/SettingsModal';
import { ContextualHelpSystem, helpContentManager } from './components/ContextualHelp';
import { useValidation } from './hooks/useValidation';
import { useAutosave } from './hooks/useAutosave';
import { useNodeUtils } from './hooks/useNodeUtils';
import { ValidationError } from './validation';
import { SmoothInspectorPanel } from './components/Inspector/SmoothInspectorPanel';
import { ProfessionalSpinner } from './components/LoadingStates/ProfessionalSpinner';
import { SmoothNodeWrapper } from './components/Nodes/SmoothNodeWrapper';
import { useCanvasOptimization } from './utils/canvasOptimization';
import { globalAnimationManager } from './utils/smoothAnimations';
import { DemoModeManager } from './components/Demo/DemoModeManager';
import { DemoPerformanceTester } from './components/Demo/DemoPerformanceTester';
import { RecentProjectEntry } from './managers/RecentProjectsManager';
import { UnsavedChangesDialog } from './components/Dialogs/UnsavedChangesDialog';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';
import { ProfessionalIntegration } from './components/CommandPalette/ProfessionalIntegration';
import './styles/smoothAnimations.css';
import '../../client/src/professional-theme.css';

// SECURITY FIX: Safe CSS injection using controlled constants
const ANIMATION_CSS = `;
  @keyframes nodeCreatePulse {
  0% {
  opacity: 0;
  transform: scale(0.5);
  50% {
  opacity: 1;
  transform: scale(1.2);
  100% {
  opacity: 0;
  transform: scale(1);
  .animate-node-create-overlay {
  animation: nodeCreatePulse 0.6s ease-out;
  `;
  // Safe style injection with ID check to prevent duplicates
  const injectSafeStyles = () => {
  const styleId = 'graph-editor-animations';
  if (!document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = ANIMATION_CSS; // Use predefined constant
  document.head.appendChild(style);
};

// Inject styles safely on module load
injectSafeStyles();
interface GraphEditorProps {
  initialNodes: Node;
  initialEdges: Edge;
  validateConnection?: (edges: Edge, nodes: Node) => ValidationError;
}

const NODE_TYPES: NodeMeta[] = [
  // Content Building Blocks
  {
  id: 'Subject',
  label: 'Character',
  icon: '👤',
  tooltip: 'Define characters, people, or entities in your content',
  category: 'content',
},
  {
  id: 'Connector',
  label: 'Link Words',
  icon: '🔗',
  tooltip: 'Connect different parts of your content naturally',
  category: 'content',
},
  {
  id: 'Attribute',
  label: 'Descriptors',
  icon: '🏷️',
  tooltip: 'Add qualities, colors, styles, or characteristics',
  category: 'content',
},
  {
  id: 'Action',
  label: 'Actions',
  icon: '⚡',
  tooltip: 'Verbs and activities that bring scenes to life',
  category: 'content',
},
  // Content Flow Tools
  {
  id: 'WeightedChoice',
  label: 'Random Selection',
  icon: WeightedChoiceIcon,
  tooltip: 'Choose randomly from multiple options with different likelihood',
  category: 'flow',
},
  {
  id: 'Concat',
  label: 'Combine',
  icon: ConcatIcon,
  tooltip: 'Join multiple text elements together seamlessly',
  category: 'flow',
},
  {
  id: 'Output',
  label: 'Result',
  icon: OutputIcon,
  tooltip: 'Final generated content ready for use',
  category: 'output',
},
  {
  id: 'Include',
  label: 'Reference',
  icon: IncludeIcon,
  tooltip: 'Include content from another template or package',
  category: 'flow',
},
  {
  id: 'SetVariable',
  label: 'Store Value',
  icon: SetVariableIcon,
  tooltip: 'Save a value to use later in your workflow',
  category: 'memory',
},
  {
  id: 'GetVariable',
  label: 'Retrieve Value',
  icon: GetVariableIcon,
  tooltip: 'Get a previously saved value from memory',
  category: 'memory',
},
  // Advanced Nodes
  {
  id: 'WeightedAdvanced',
  label: 'Smart Random',
  icon: '🎲',
  tooltip: 'Advanced random selection with custom distribution patterns',
  category: 'advanced',
},
  {
  id: 'Conditional',
  label: 'If/Then',
  icon: '🔀',
  tooltip: 'Choose different creative paths based on conditions',
  category: 'advanced',
},
  // Transform & Logic
  {
  id: 'Sequential',
  label: 'Step by Step',
  icon: '🔄',
  tooltip: 'Process content in a specific creative sequence',
  category: 'transform',
},
  {
  id: 'Markov',
  label: 'Chain Process',
  icon: '🕸️',
  tooltip: 'Generate content based on probability patterns and transitions',
  category: 'transform',
},
  {
  id: 'PythonTransform',
  label: 'Custom Script',
  icon: '🐍',
  tooltip: 'Apply custom processing logic to transform content',
  category: 'process'
}];
  // Inner component that has access to React Flow instance
  const GraphEditorInner: React.FC<GraphEditorProps> = ({
    initialNodes,
    initialEdges,
    validateConnection
  }) => {
  const [nodes, setNodes] = useState<Node>(initialNodes);
  const [edges, setEdges] = useState<Edge>(initialEdges);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  const [correctionsOpen, setCorrectionsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [extensionsOpen, setExtensionsOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [ setDragPreview] = useState<{node: Node, position: {x: number, y: number}} | null>(null);
  // Canvas optimization and smooth animations
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [nodeCreationAnimation, setNodeCreationAnimation] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { optimizer, metrics, isPerformanceGood } = useCanvasOptimization({
  maxVisibleNodes: 150,
  animationFrameThrottle: 16,
});
  // Project dialog states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  // Template dialog states
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [templateBrowserOpen, setTemplateBrowserOpen] = useState(false);
  // Settings modal state
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  // Epic 8.5 Preview panel states
  const [realTimePreviewOpen, setRealTimePreviewOpen] = useState(false);
  const [resultManagerOpen, setResultManagerOpen] = useState(false);
  // Optimization panel states
  const [optimizationControlsOpen, setOptimizationControlsOpen] = useState(false);
  const [performanceMonitorVisible, setPerformanceMonitorVisible] = useState(false);
  const [graphAnalysisOpen, setGraphAnalysisOpen] = useState(false);
  const [optimizationMenuOpen, setOptimizationMenuOpen] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
  deadCodeElimination: true,
  constantPropagation: true,
  resultCaching: true,
  parallelExecution: false,
  memoryOptimization: true,
  precompilation: false,
  performanceMonitoring: true,
  debugMode: false,
});
  // Graph store for project management
  const { 
    currentProject, 
    hasUnsavedChanges, 
    newProject,
    // markProjectModified,
    saveAsTemplate,
    applyTemplate
  } = useGraphStore();
  // Demo encryption state - in a real implementation, this would be managed by a security service
  const [encryptionState, setEncryptionState] = useState<EncryptionState>({
  status: 'not_encrypted',
  dataSize: 1024 * 512 // 512KB demo graph,
});
  const correctionsEnabled = useCorrectionsEnabled();
  const reactFlowInstance = useReactFlow();
  const viewport = useViewport();
  // Custom hooks
  const { getNodeMeta, getCategoryColor } = useNodeUtils({ nodeTypes: NODE_TYPES });
  const { showRestorePrompt, restoreDraft, setShowRestorePrompt } = useAutosave({ nodes, edges });
  // Unsaved changes management (Story 6.1)
  const {
  showUnsavedDialog,
  dialogAction,
  confirmNavigation,
  handleSave: handleUnsavedSave,
  handleDontSave: handleUnsavedDontSave,
  handleCancel: handleUnsavedCancel,
} = useUnsavedChanges({
  hasUnsavedChanges,
  projectName: currentProject?.name,
  onSave: async () => {
  // Trigger save dialog and wait for result
  return new Promise((resolve) => {
  setSaveDialogOpen(true);
  // Note: This is a simplified implementation,
  // In practice, you'd need to wire this up with the actual save dialog result
  resolve(true);
  });
  }
});

  // Highlighted nodes & edges from preview result hover
  const [highlightNodeIds, setHighlightNodeIds] = useState<Set<string>>(new Set());
  const [highlightEdgeIds, setHighlightEdgeIds] = useState<Set<string>>(new Set());
  const { errors, styledEdges, styledNodes } = useValidation({
  edges,
    nodes,
    highlightNodeIds,
    highlightEdgeIds,
    validateConnection
  });
  // Optimized node rendering with smooth animations
  const NodeRender = useMemo(() => {
    const NodeRenderComponent = (props: { id: string; data: Record<string, unknown>; selected?: boolean }) => {
      // Check if node has template fields that would benefit from variable ports
      const hasTemplate = props.data?.template || props.data?.text || props.data?.content;
      const shouldUseVariablePorts = typeof hasTemplate === 'string' && hasTemplate.length > 0;
      // Wrap with smooth animations if performance is good
      if (isPerformanceGood) {
        const InnerNode = shouldUseVariablePorts ? VariablePortNodeRenderer : NodeRenderer;
        return;
          <SmoothNodeWrapper
            id={props.id}
            data={props.data}
            selected={selectedNodeId === props.id}
            nodeType={props.data?.nodeType as string || 'default'}
            isSelected={selectedNodeId === props.id}
            onNodeClick={setSelectedNodeId}
          >
            <InnerNode
              id={props.id}
              data={props.data}
              selected={selectedNodeId === props.id}
              onSelect={setSelectedNodeId}
              getNodeMeta={getNodeMeta}
              getCategoryColor={getCategoryColor}
            />
          </SmoothNodeWrapper>
        );
      // Fallback to standard rendering for performance
      if (shouldUseVariablePorts) {
        return;
          <VariablePortNodeRenderer
            id={props.id}
            data={props.data}
            selected={selectedNodeId === props.id}
            onSelect={setSelectedNodeId}
            getNodeMeta={getNodeMeta}
            getCategoryColor={getCategoryColor}
          />
        );
      return;
        <NodeRenderer
          id={props.id}
          data={props.data}
          selected={selectedNodeId === props.id}
          onSelect={setSelectedNodeId}
          getNodeMeta={getNodeMeta}
          getCategoryColor={getCategoryColor}
        />
      );
    };
    NodeRenderComponent.displayName = 'NodeRenderComponent';
    return NodeRenderComponent;
  }, [selectedNodeId, getNodeMeta, getCategoryColor, isPerformanceGood]);
  // Node types mapping - SIMPLIFIED to prevent infinite loops
  const nodeTypes = useMemo(() => {
    // Force everything to use default to prevent React Flow errors
    return { default: NodeRender };
  }, [NodeRender]);
  // Preview-5 modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const {
  loading: previewLoading,
  error: previewError,
  results: previewResults,
  runPreview,
  cancelPreview
} = usePreviewSeeds();
  const lastChangeRef = useRef<number>(Date.now());
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Selected node & schema for inspector
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedSchema = selectedNode && selectedNode.data?.nodeType;
    ? nodeSchemas[selectedNode.data.nodeType as keyof typeof nodeSchemas] ?? null
    : null;
  // Epic 8.5-5: Global preview trigger for weight changes
  const handleGlobalPreviewRequest = useCallback(() => {
    console.log('[Epic 8.5-5] Triggering global preview from weight control change');
    const now = Date.now();
    const sinceChange = now - lastChangeRef.current;
    const run = () => {
      runPreview({ nodes, edges });
      setPreviewOpen(true);
    };
    // Use same debouncing logic as DirectorPreviewToolbar
    if (sinceChange < 500) {
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = setTimeout(run, 500 - sinceChange);
    } else {
      run();
  }, [nodes, edges, runPreview]);
  const handleInspectorChange = (partial: Record<string, unknown>) => {
    if (!selectedNode) return;
    // Update the graph store
    updateNode(selectedNode.id, partial);
    // Also update local React state immediately for UI responsiveness
    setNodes(prev => prev.map(n => )
      n.id === selectedNode.id 
        ? { ...n, data: { ...n.data, ...partial } }
        : n
    ));
  };
  // Edge drag handler
  const onConnect: OnConnect = useCallback()
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
      // Track progress for contextual help system
      helpContentManager.updateProgress('connectionsBuilt', 1);
  }
    []
  );
  // Handle node drag from palette
  const handlePaletteDragStart = () => {
  // No-op: drag data set in Palette, handled on drop,
};
  // Enhanced drop handler with smooth node creation animation
  const { addNode, updateNode } = useGraphStore();
  const handleDrop = useCallback(;);
    async (event: React.DragEvent) => {
      event.preventDefault();
      // Check if files are being dropped (Story 6.1 - drag and drop .psg files)
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        // Check if it's a .psg file
        if (file.name.toLowerCase().endsWith('.psg')) {
          // Handle unsaved changes warning
          if (hasUnsavedChanges) {
            const confirmed = confirm('You have unsaved changes. Load the dropped project anyway?');
            if (!confirmed) return;
          try {
            const content = await file.text();
            const { deserializeProject } = await import('./utils/projectSerialization');
            const result = deserializeProject(content, {
  skipValidation: false,
  autoMigrate: true,
  preserveIds: true,
});
            if (result.success && result.data) {
              // Load the project data
              setNodes(result.data.graph.nodes);
              setEdges(result.data.graph.edges);
              // Update project state
              const { setCurrentProject, updateProjectSettings, markProjectSaved } = useGraphStore.getState();
              setCurrentProject(result.data.metadata);
              updateProjectSettings(result.data.settings);
              markProjectSaved();
              setStatusMessage(`Project "${result.data.metadata.name}" loaded successfully!`);}
              setTimeout(() => setStatusMessage(''), 3000);
              if (result.warnings && result.warnings.length > 0) {
  console.warn('Project load warnings:', result.warnings);
} else {
              setStatusMessage(`Failed to load project: ${result.error}`);}
              setTimeout(() => setStatusMessage(''), 5000);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setStatusMessage(`Failed to load project: ${errorMessage}`);}
            setTimeout(() => setStatusMessage(''), 5000);
          return; // Exit early for file drops
        } else {
  setStatusMessage('Only .psg files are supported for drag and drop');
  setTimeout(() => setStatusMessage(''), 3000);
  return;
  // Handle node type drops from palette (existing functionality)
  const nodeType = event.dataTransfer.getData('application/node-type');
  if (!nodeType || !(nodeType in nodeSchemas)) return;
  // Use React Flow's screenToFlowPosition for accurate positioning
  const position = reactFlowInstance.screenToFlowPosition({
  x: event.clientX,
  y: event.clientY,
});
      // Smooth node creation animation
      setIsCreatingNode(true);
      const nodeId = `${nodeType}-${Date.now()}`;}
      setNodeCreationAnimation(nodeId);
      // Use Zod schema to get default params
      const schema = nodeSchemas[nodeType];
      const params = schema.parse({});
      const newNode: Node = {
  id: nodeId,
        type: 'default',
        position,
        data: { ...params, nodeType: nodeType },
        selected: false;
  };
      // Add with animation
      globalAnimationManager.scheduleAnimation(() => {
        addNode(newNode);
        setNodes((prev) => [...prev, newNode]);
        // Track progress for contextual help system
        helpContentManager.updateProgress('nodesCreated', 1);
        setTimeout(() => {
          setIsCreatingNode(false);
          setNodeCreationAnimation(null);
        }, 600);
      });
  }
    [reactFlowInstance, addNode, hasUnsavedChanges, setNodes, setEdges, setStatusMessage]
  );
  // Allow drop on canvas
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);
  // Node click handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);
  // Autosave and restore logic handled by useAutosave hook
  // Enhanced nodes change handler with canvas optimization
  const onNodesChange: OnNodesChange = useCallback()
    (changes: NodeChange) => {
  // Get canvas size for optimization
  const canvasSize = canvasRef.current ? {
  width: canvasRef.current.offsetWidth,
  height: canvasRef.current.offsetHeight,
} : { width: 1920, height: 1080 };
      setNodes((nds) => {
        let updatedNodes = nds.map((node) => {
          const change = changes.find((c) => 'id' in c && c.id === node.id);
          // Show drag preview for drag operations
          if (change && 'position' in change && change.dragging) {
            setDragPreview({ node: {...node, ...change}, position: change.position || node.position });
          } else if (change && 'dragging' in change && !change.dragging) {
            setDragPreview(null);
          return change ? { ...node, ...change } : node;
        });
        // Apply canvas optimization for performance
        if (updatedNodes.length > 100) {
          updatedNodes = optimizer.optimizeNodeVisibility(updatedNodes, viewport, canvasSize);
        return updatedNodes;
      });
  }
    [optimizer, viewport]
  );
  // Enhanced edges change handler with optimization
  const onEdgesChange: OnEdgesChange = useCallback()
    (changes: EdgeChange) => {
      setEdges((eds) => {
        let updatedEdges = eds.map((edge) => {
          const change = changes.find((c) => 'id' in c && c.id === edge.id);
          return change ? { ...edge, ...change } : edge;
        });
        // Apply edge optimization for performance
        if (updatedEdges.length > 200) {
          updatedEdges = optimizer.optimizeEdges(updatedEdges, nodes, viewport);
        return updatedEdges;
      });
  }
    [optimizer, nodes, viewport]
  );
  // Demo encryption handlers - in a real implementation, these would call actual encryption services
  const handleEncrypt = useCallback(() => {
    setEncryptionState(prev => ({ ...prev, status: 'encrypting' }));
    // Simulate encryption process
    setTimeout(() => {
  setEncryptionState(prev => ({
  ...prev,
  status: 'encrypted',
  algorithm: 'AES-256-GCM',
  keyId: 'demo-key-' + Date.now().toString(36),
  lastEncrypted: Date.now(),
  encryptionTime: 180,
  strength: 'strong',
}));
      setStatusMessage('Graph data encrypted successfully');
      setTimeout(() => setStatusMessage(''), 3000);
    }, 2000);
  }, []);
  const handleDecrypt = useCallback(() => {
    setEncryptionState(prev => ({ ...prev, status: 'decrypting' }));
    // Simulate decryption process
    setTimeout(() => {
  setEncryptionState(prev => ({
  ...prev,
  status: 'not_encrypted',
  algorithm: undefined,
  keyId: undefined,
  lastDecrypted: Date.now(),
  encryptionTime: 120,
  strength: undefined,
}));
      setStatusMessage('Graph data decrypted successfully');
      setTimeout(() => setStatusMessage(''), 3000);
    }, 1500);
  }, []);
  const handleChangeAlgorithm = useCallback((algorithm: string) => {
  setEncryptionState(prev => ({
  ...prev,
  algorithm: algorithm as EncryptionAlgorithm,
  strength: algorithm.includes('256') || algorithm.includes('4096') ? 'strong' :,
  algorithm.includes('128') || algorithm.includes('2048') ? 'medium' : 'weak',
}));
    setStatusMessage(`Encryption algorithm changed to ${algorithm}`);}
    setTimeout(() => setStatusMessage(''), 3000);
  }, []);
  // Project management handlers
  const handleNewProject = useCallback(() => {
    confirmNavigation('creating a new project', () => {
      newProject();
      setNodes([]);
      setEdges([]);
    });
  }, [confirmNavigation, newProject]);
  const handleSaveProject = useCallback(() => {
    setSaveDialogOpen(true);
  }, []);
  const handleLoadProject = useCallback(() => {
    confirmNavigation('loading a project', () => {
      setLoadDialogOpen(true);
    });
  }, [confirmNavigation]);
  const handleLoadRecentProject = useCallback(async (entry: RecentProjectEntry) => {
    confirmNavigation('loading a recent project', () => {
      try {
        // For now, we'll show a message since we don't have the actual file content
        // In a full implementation, we would store the file content or use file handles API
        setStatusMessage(`Loading recent project: ${entry.name}...`);}
        // Note: This is a simplified implementation
        // A full implementation would need to store file content or use file handles API
        console.log('Loading recent project:', entry);
        setStatusMessage(`Recent project "${entry.name}" selected. Please use the Load Project button to select the file.`);}
        setTimeout(() => setStatusMessage(''), 5000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setStatusMessage(`Failed to load recent project: ${errorMessage}`);}
        setTimeout(() => setStatusMessage(''), 5000);
    });
  }, [confirmNavigation]);
  const handleSaveSuccess = useCallback((result: { success: boolean; error?: string; projectName?: string; metadata?: unknown }) => {
    if (result.success) {
      setStatusMessage('Project saved successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
      // Add to recent projects if we have project info
      if (result.projectName && result.metadata) {
        try {
          // const { RecentProjectsManager } = require('./managers/RecentProjectsManager');
          // const graphData = useGraphStore.getState().getGraphData();
          // 
          // // Generate thumbnail
          // const thumbnail = RecentProjectsManager.generateThumbnail(graphData.nodes, graphData.edges);
          // 
          // // Calculate approximate file size
          // const projectData = JSON.stringify({ graph: graphData, metadata: result.metadata });
          // const fileSize = new Blob([projectData]).size;
          // 
          // RecentProjectsManager.addRecentProject({
          //   name: result.projectName,
          //   metadata: result.metadata,
          //   thumbnail,
          //   fileSize
          // });
        } catch (error) {
  console.warn('Failed to add project to recent list:', error);
} else {
      setStatusMessage(`Save failed: ${result.error}`);}
      setTimeout(() => setStatusMessage(''), 5000);
  }, []);
  const handleLoadSuccess = useCallback((result: { success: boolean; error?: string; warnings?: string; projectName?: string; metadata?: unknown }) => {
    if (result.success) {
      // Sync with local state
      const graphData = useGraphStore.getState().getGraphData();
      setNodes(graphData.nodes);
      setEdges(graphData.edges);
      let message = 'Project loaded successfully!';
      if (result.warnings?.length) {
        message += ` (${result.warnings.length} warning${result.warnings.length > 1 ? 's' : ''})`;}
      setStatusMessage(message);
      setTimeout(() => setStatusMessage(''), 3000);
      // Add to recent projects if we have project info
      if (result.projectName && result.metadata) {
        try {
          // const { RecentProjectsManager } = require('./managers/RecentProjectsManager');
          // 
          // // Generate thumbnail
          // const thumbnail = RecentProjectsManager.generateThumbnail(graphData.nodes, graphData.edges);
          // 
          // // Calculate approximate file size
          // const projectData = JSON.stringify({ graph: graphData, metadata: result.metadata });
          // const fileSize = new Blob([projectData]).size;
          // 
          // RecentProjectsManager.addRecentProject({
          //   name: result.projectName,
          //   metadata: result.metadata,
          //   thumbnail,
          //   fileSize
          // });
        } catch (error) {
  console.warn('Failed to add project to recent list:', error);
} else {
      setStatusMessage(`Load failed: ${result.error}`);}
      setTimeout(() => setStatusMessage(''), 5000);
  }, []);
  const handleExportBundle = useCallback(() => {
    setExportDialogOpen(true);
  }, []);
  const handleExportSuccess = useCallback((result: { success: boolean; error?: string }) => {
    if (result.success) {
      setStatusMessage('Bundle exported successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    } else {
      setStatusMessage(`Export failed: ${result.error}`);}
      setTimeout(() => setStatusMessage(''), 5000);
  }, []);
  // Template handlers
  const handleSaveTemplate = useCallback(() => {
    setSaveTemplateDialogOpen(true);
  }, []);
  const handleBrowseTemplates = useCallback(() => {
    setTemplateBrowserOpen(true);
  }, []);
  const handleTemplateSave = useCallback(async (templateData: unknown) => {
    try {
      const result = await saveAsTemplate(templateData, 'current-user');
      if (result.success) {
        setStatusMessage('Template saved successfully!');
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        setStatusMessage(`Template save failed: ${result.error}`);}
        setTimeout(() => setStatusMessage(''), 5000);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatusMessage(`Template save failed: ${errorMessage}`);}
      setTimeout(() => setStatusMessage(''), 5000);
      return { success: false, error: errorMessage };
  }, [saveAsTemplate]);
  const handleTemplateApply = useCallback(async (templateId: string, options: unknown) => {
    try {
      const result = await applyTemplate(templateId, options);
      if (result.success) {
        // Update local React state to reflect the changes
        const graphData = useGraphStore.getState().getGraphData();
        setNodes(graphData.nodes);
        setEdges(graphData.edges);
        setStatusMessage('Template applied successfully!');
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        setStatusMessage(`Template apply failed: ${result.error}`);}
        setTimeout(() => setStatusMessage(''), 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatusMessage(`Template apply failed: ${errorMessage}`);}
      setTimeout(() => setStatusMessage(''), 5000);
  }, [applyTemplate]);
  // Optimization handlers
  const handleOptimizationOpen = useCallback(() => {
    setOptimizationMenuOpen(prev => !prev);
  }, []);
  const handleOptimizationSettingsChange = useCallback((newSettings: OptimizationSettings) => {
    setOptimizationSettings(newSettings);
    setStatusMessage('Optimization settings updated');
    setTimeout(() => setStatusMessage(''), 3000);
  }, []);
  const handlePerformanceMonitorToggle = useCallback(() => {
    setPerformanceMonitorVisible(prev => !prev);
  }, []);
  // Check if any optimization features are enabled
  const isOptimizationEnabled = Object.values(optimizationSettings).some(value => value);
  // Close optimization menu when clicking outside
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('[data-optimization-menu]') && !target.closest('[data-optimization-button]')) {
  setOptimizationMenuOpen(false);
};
    if (optimizationMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [optimizationMenuOpen]);
  // Keyboard shortcuts (Epic 7.3 + Story 6.1)
  useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
  // Alt+S opens settings modal
  if (event.altKey && event.key === 's') {
  event.preventDefault();
  setSettingsModalOpen(true);
  return;
  // Ctrl+S/Cmd+S saves project (Story 6.1)
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
  event.preventDefault();
  handleSaveProject();
  return;
  // Ctrl+O/Cmd+O opens project (Story 6.1)
  if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
  event.preventDefault();
  handleLoadProject();
  return;
};
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveProject, handleLoadProject]);
  return;
    <DemoModeManager
      initialConfig={{
  brandingVisible: true,
  debugElementsHidden: false,
}}
      onModeChange={(config) => {
  console.log('Demo mode changed:', config);
}}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <RestorePrompt
          show={showRestorePrompt}
          draft={restoreDraft}
          onRestore={(nodes, edges) => {
            setNodes(nodes);
            setEdges(edges);
            setShowRestorePrompt(false);
            setStatusMessage('Draft Restored');
            setTimeout(() => setStatusMessage(''), 3000);
          }}
          onDismiss={() => {
            setShowRestorePrompt(false);
            localStorage.removeItem('graphDraft');
          }}
        />
        <div style={{ display: 'flex', height: '100%' }}>
          <TabbedPalette
            nodes={NODE_TYPES}
            collapsed={paletteCollapsed}
            onToggle={() => setPaletteCollapsed((c) => !c)}
            onDragStart={handlePaletteDragStart}
            showSearch={true}
            showFavorites={true}
            maxSearchResults={15}
            defaultActiveTab="content"
          />
          <div 
            ref={canvasRef}
            style={{ flex: 1, position: 'relative', overflow: 'visible' }} 
            data-testid="react-flow-canvas-wrapper"
          >
            <ReactFlow
              nodes={styledNodes}
              edges={styledEdges}
              data-testid="react-flow-canvas"
              onNodesChange={(changes) => {
                lastChangeRef.current = Date.now();
                onNodesChange(changes);
              }}
              onEdgesChange={(changes) => {
                lastChangeRef.current = Date.now();
                onEdgesChange(changes);
              }}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              fitView
              style={{ background: 'var(--color-bg-primary, #2c2c2c)', height: '100%' }}
              nodeTypes={nodeTypes}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              // Node interaction
              elementsSelectable={true}
              // Professional 3D-style mouse controls with performance optimization
              panOnScroll={false} // Disable scroll to pan
              zoomOnScroll={true} // Enable scroll to zoom (standard 3D behavior)
              panOnDrag={[1, 2]} // Pan with left or middle mouse button
              selectionOnDrag={nodes.length < 100} // Disable box selection for large graphs
              zoomOnDoubleClick={false} // Disable double-click zoom
              // Performance optimizations
              nodesDraggable={nodes.length < 150}
              nodesConnectable={nodes.length < 200}
              snapToGrid={viewport.zoom > 0.6}
              snapGrid={[16, 16]}
              // Keyboard shortcuts - completely disable all keyboard handling
              deleteKeyCode={null} // Disable delete key completely
              multiSelectionKeyCode={null} // Disable multi-selection
              zoomActivationKeyCode={null} // Disable zoom activation
              // Disable all keyboard event capturing
              onKeyDown={(e) => {
              // Check if the event target is inside an input or textarea
                const target = e.target as HTMLElement;
                const isFormElement = target.tagName === 'INPUT' ||;
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT';
                const isInInspector = target.closest('aside') !== null;
                if (isFormElement || isInInspector) {
                // Don't capture keyboard events for form elements or inspector
                  return;
                // Only handle keyboard events for canvas interaction
                e.stopPropagation();
              }}
              // Professional connection styling with performance optimization
              connectionLineStyle={{
  stroke: isPerformanceGood ? '#ff7c00' : '#4a5568',
  strokeWidth: isPerformanceGood ? 3 : 2,
  filter: isPerformanceGood ? 'drop-shadow(0 0 6px rgba(255, 124, 0, 0.3))' : 'none',
}}
              connectionLineType={viewport.zoom > 0.5 ? ConnectionLineType.SmoothStep : ConnectionLineType.Straight}
              // Dynamic edge options based on performance
              defaultEdgeOptions={{
  type: viewport.zoom > 0.5 ? 'smoothstep' : 'straight',
  style: {
  stroke: isPerformanceGood ? '#ff7c00' : '#666',
  strokeWidth: isPerformanceGood ? 2.5 : 2,
  filter: isPerformanceGood ? 'drop-shadow(0 0 4px rgba(255, 124, 0, 0.2))' : 'none',
},
  markerEnd: {
  type: 'arrow',
  color: isPerformanceGood ? '#ff7c00' : '#666',
  width: isPerformanceGood ? 16 : 12,
  height: isPerformanceGood ? 16 : 12,
}}
              // Professional zoom/pan settings with smooth transitions
              minZoom={0.05}
              maxZoom={6}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              // Smooth zoom and pan transitions
              translateExtent={[[-2000, -2000], [4000, 4000]]}
              nodeExtent={[[-1500, -1500], [3000, 3000]]}
              // Performance-aware rendering
              {...optimizer.getOptimizedRenderSettings(nodes.length, viewport.zoom)}
            >
              <Background 
                color="#2d3748" 
                gap={viewport.zoom > 0.8 ? 16 : viewport.zoom > 0.4 ? 24 : 32}
                size={viewport.zoom > 0.8 ? 1 : viewport.zoom > 0.4 ? 1.5 : 2}
              />
              {nodes.length < 200 && ()
                <MiniMap 
                  nodeColor={() => isPerformanceGood ? '#ff7c00' : '#363a45'} 
                  maskColor="#181b21BB"
                  style={{
  backgroundColor: 'rgba(31, 41, 55, 0.8)',
  border: '1px solid rgba(55, 65, 81, 0.6)',
}}
                />
              )}
              <Controls 
                style={{
  button: {
  backgroundColor: 'rgba(31, 41, 55, 0.9)',
  border: '1px solid rgba(55, 65, 81, 0.6)',
  color: '#e5e7eb',
}}
              />
            </ReactFlow>
            {/* Professional UI Integration - Cinema 4D-inspired interface */}
            <ProfessionalIntegration
              nodes={nodes}
              edges={edges}
              selectedNodes={nodes.filter(n => n.selected)}
              selectedEdges={edges.filter(e => e.selected)}
              onNodesChange={(newNodes) => setNodes(newNodes)}
              onEdgesChange={(newEdges) => setEdges(newEdges)}
              onNodesSelect={(selectedNodes) => {
  setNodes(prevNodes => )
  prevNodes.map(node => ({
  ...node,
  selected: selectedNodes.some(s => s.id === node.id),
}))
                );
              }}
              onEdgesSelect={(selectedEdges) => {
  setEdges(prevEdges => )
  prevEdges.map(edge => ({
  ...edge,
  selected: selectedEdges.some(s => s.id === edge.id),
}))
                );
              }}
              onNodeCreate={(nodeType, position, data) => {
                const newNode: Node = {
  id: `${nodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}
},
  type: nodeType,
                  position,
                  data: data || {},
                  draggable: true;
  };
                setNodes(prevNodes => [...prevNodes, newNode]);
              }}
              onNodeDelete={(nodeIds) => {
                setNodes(prevNodes => prevNodes.filter(n => !nodeIds.includes(n.id)));
                setEdges(prevEdges => prevEdges.filter(e => )
                  !nodeIds.includes(e.source) && !nodeIds.includes(e.target)
                ));
              }}
              onExport={(format) => {
                console.log(`Exporting in format: ${format}`);}
                // Export functionality would be implemented here
              }}
              onSave={() => handleSaveProject()}
              onLoad={() => handleLoadProject()}
              theme="cinema"
            />
            {/* Epic 8.7: Collaboration Systems */}
            <StickyNotesManager
              disabled={false}
              readonly={false}
            />
            {/* Epic 8.7 Task 2: Node Labels System */}
            <NodeLabelsManager
              disabled={false}
              readonly={false}
              selectedNodeId={selectedNodeId}
            />
            {/* Epic 8.7 Task 3: Region Groups System */}
            <RegionGroupsManager
              disabled={false}
              readonly={false}
            />
            {/* Epic 8.7 Task 4: Connection Annotations System */}
            <ConnectionAnnotationsLayer
              canEdit={true}
              showTooltips={true}
              visible={true}
            />
            {/* Mouse Controls Help Overlay */}
            <div style={{
  position: 'absolute',
  bottom: 10,
  right: 10,
  background: 'rgba(42, 42, 42, 0.9)',
  border: '1px solid #444',
  borderRadius: 4,
  padding: 8,
  fontSize: 11,
  color: '#a0aec0',
  cursor: 'pointer',
  userSelect: 'none',
}}
            onClick={() => setShowControls(!showControls)}
            >
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#e2e8f0' }}>
                🖱️ Controls {showControls ? '▼' : '▶'}
              </div>
              {showControls && ()
                <div style={{ marginTop: 8, lineHeight: 1.6 }}>
                  <div><b>Pan:</b> Left-click + drag on canvas</div>
                  <div><b>Zoom:</b> Mouse wheel / trackpad scroll</div>
                  <div><b>Select:</b> Click node</div>
                  <div><b>Multi-select:</b> Shift/Ctrl + Click</div>
                  <div><b>Connect:</b> Drag from output port</div>
                  <div><b>Delete:</b> Select + Delete/Backspace</div>
                  <div><b>Alternative Pan:</b> Middle-click + drag</div>
                </div>
              )}
            </div>
          </div>
          {/* Smooth Panel Transition Container */}
          <div 
            style={{
  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
  width: selectedNode ? 320 : 0,
  opacity: selectedNode ? 1 : 0,
  overflow: 'hidden',
  borderLeft: selectedNode ? '1px solid rgba(55, 65, 81, 0.6)' : 'none',
}}
          >
            {selectedNode && ()
              <div
                style={{
  transform: selectedNode ? 'translateX(0)' : 'translateX(100%)',
  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  width: 320,
  height: '100%',
}}
              >
                {isPerformanceGood ? ()
                  <SmoothInspectorPanel
                    node={selectedNode}
                    schema={selectedSchema}
                    onChange={handleInspectorChange}
                    onGlobalPreviewRequest={handleGlobalPreviewRequest}
                  />
                ) : ()
                  <InspectorPanel
                    node={selectedNode}
                    schema={selectedSchema}
                    onChange={handleInspectorChange}
                    onGlobalPreviewRequest={handleGlobalPreviewRequest}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        {/* Professional CSS Transitions and Animations - Enhanced */}
        <style>{`
        /* Professional Node Styling */
        .react-flow__node {
          background: linear-gradient(),
            145deg,
            var(--color-bg-tertiary)
            #404040
          ), var(--color-bg-secondary, #383838)) !important;
          border: 1px solid var(--color-ui-border, #4a4a4a) !important;
          border-radius: 8px !important;
          box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.4)) !important;
          color: var(--color-text-primary, #e5e7eb) !important;
          transition: all var(--transition-normal, 0.25s cubic-bezier(0.4, 0, 0.2, 1)) !important;
          backdrop-filter: blur(8px) !important;
        .react-flow__node:hover {
  transform: translateY(-3px) scale(1.03) !important;
          box-shadow: var(--shadow-xl, 0 20px 25px rgba(0, 0, 0, 0.6)) !important;
          background: linear-gradient(),
            145deg,
            var(--color-bg-quaternary)
            #4a4a4a
          ), var(--color-bg-tertiary, #404040)) !important;
          border-color: var(--color-accent-orange, #ff7800) !important;
        .react-flow__node.selected {
          box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.5)), 
                     0 0 0 3px var(--color-accent-orange, #ff7800),
                     0 0 20px rgba(255, 120, 0, 0.4) !important;
          border-color: var(--color-accent-orange, #ff7800) !important;
          background: linear-gradient(),
            145deg,
            var(--color-bg-quaternary)
            #4a4a4a
          ), var(--color-bg-tertiary, #404040)) !important;
        /* Professional Edge Styling */
        .react-flow__edge path {
          stroke: var(--color-ui-border-light, #525252) !important;
          stroke-width: 2px !important;
  transition: all var(--transition-normal, 0.25s cubic-bezier(0.4, 0, 0.2, 1)) !important;
        .react-flow__edge:hover path {
  stroke: var(--color-accent-orange, #ff7800) !important;
          stroke-width: 4px !important;
  filter: drop-shadow(0 0 12px rgba(255, 120, 0, 0.6)) !important;
        .react-flow__edge.selected path {
          stroke: var(--color-accent-orange, #ff7800) !important;
          stroke-width: 3px !important;
  filter: drop-shadow(0 0 8px rgba(255, 120, 0, 0.4)) !important;
        /* Professional Handle Styling */
        .react-flow__handle {
          background: var(--color-bg-secondary, #383838) !important;
          border: 2px solid var(--color-ui-border, #4a4a4a) !important;
          width: 12px !important;
  height: 12px !important;
          transition: all var(--transition-fast, 0.15s cubic-bezier(0.4, 0, 0.2, 1)) !important;
        .react-flow__handle:hover {
  transform: scale(1.6) !important;
          box-shadow: 0 0 20px rgba(255, 120, 0, 0.8) !important;
          background: var(--color-accent-orange, #ff7800) !important;
          border-color: var(--color-accent-orange, #ff7800) !important;
        .react-flow__handle.connectable {
          background: var(--color-accent-blue, #0ea5e9) !important;
        /* Professional Connection Line */
        .react-flow__connection-line {
          stroke: var(--color-accent-orange, #ff7800) !important;
          stroke-width: 4px !important;
  filter: drop-shadow(0 0 8px rgba(255, 120, 0, 0.4)) !important;
        /* Professional Controls */
        .react-flow__controls button {
          background: linear-gradient(),
            145deg,
            var(--color-bg-tertiary)
            #404040
          ), var(--color-bg-secondary, #383838)) !important;
          border: 1px solid var(--color-ui-border, #4a4a4a) !important;
          color: var(--color-text-primary, #e5e7eb) !important;
          transition: all var(--transition-normal, 0.25s cubic-bezier(0.4, 0, 0.2, 1)) !important;
          backdrop-filter: blur(8px) !important;
          border-radius: 6px !important;
          box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.3)) !important;
        .react-flow__controls button:hover {
  background: linear-gradient(),
            145deg,
            var(--color-bg-quaternary)
            #4a4a4a
          ), var(--color-bg-tertiary, #404040)) !important;
          border-color: var(--color-accent-orange, #ff7800) !important;
          box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.4)), 
                     0 0 16px rgba(255, 120, 0, 0.3) !important;
          transform: scale(1.05) !important;
        /* Professional Minimap */
        .react-flow__minimap {
          background: linear-gradient(),
            145deg,
            var(--color-bg-secondary)
            #383838
          ), var(--color-bg-primary, #2c2c2c)) !important;
          border: 1px solid var(--color-ui-border, #4a4a4a) !important;
          backdrop-filter: blur(12px) !important;
          border-radius: 8px !important;
          box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.5)) !important;
        .react-flow__minimap-node {
          fill: var(--color-accent-orange, #ff7800) !important;
          opacity: 0.8 !important;
        /* Professional Background */
        .react-flow__background {
          background: var(--color-bg-primary, #2c2c2c) !important;
        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.6;
          50% {
            opacity: 1;
        @keyframes fadeIn {
          from {
            opacity: 0;
          to {
            opacity: 1;
      `}</style>
        {/* Epic 8.3 - Director Preview Toolbar Integration */}
        <DirectorPreviewToolbar
          nodes={nodes}
          edges={edges}
          isPreviewOpen={previewOpen}
          onPreviewToggle={() => {
            if (previewOpen) {
              setPreviewOpen(false);
            } else {
              const now = Date.now();
              const sinceChange = now - lastChangeRef.current;
              const run = () => {
                runPreview({ nodes, edges });
                setPreviewOpen(true);
                // Track progress for contextual help system
                helpContentManager.updateProgress('previewsGenerated', 1);
              };
              if (sinceChange < 500) {
                if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
                previewTimeoutRef.current = setTimeout(run, 500 - sinceChange);
              } else {
                run();
          }}
          onHighlightPath={(nodeIds, edgeIds) => {
          // Highlight execution path on the canvas
            setHighlightNodeIds(new Set(nodeIds));
            setHighlightEdgeIds(new Set(edgeIds));
          }}
        />
        {/* Epic 8.4 - Contextual Help System Integration */}
        <ContextualHelpSystem
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          userLevel="beginner" // This could be dynamic based on user profile
          enabled={true}
          autoTrigger={true}
          showProgressiveHints={true}
          onHelpContentViewed={(contentId) => {
            helpContentManager.markContentViewed(contentId);
          }}
          onUserLevelChange={(level) => {
  console.log('User level changed to:', level);
  // Could integrate with user profile management
}}
        />
        <StatusBar
          statusMessage={statusMessage}
          errors={errors}
          onPreview={() => {
            const now = Date.now();
            const sinceChange = now - lastChangeRef.current;
            const run = () => {
              runPreview({ nodes, edges });
              setPreviewOpen(true);
              // Track progress for contextual help system
              helpContentManager.updateProgress('previewsGenerated', 1);
            };
            if (sinceChange < 500) {
              if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
              previewTimeoutRef.current = setTimeout(run, 500 - sinceChange);
            } else {
              run();
          }}
          onSaveJson={() => {
            const blob = new Blob([);
              JSON.stringify({ nodes, edges }, null, 2)
            ], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'graph.json';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 0);
          }}
          onExportBundle={handleExportBundle}
          onSaveProject={handleSaveProject}
          onLoadProject={handleLoadProject}
          onLoadRecentProject={handleLoadRecentProject}
          onNewProject={handleNewProject}
          hasUnsavedChanges={hasUnsavedChanges}
          currentProjectName={currentProject?.name}
          onCorrections={() => setCorrectionsOpen(true)}
          correctionsEnabled={correctionsEnabled}
          correctionsOpen={correctionsOpen}
          onStats={() => setStatsOpen(true)}
          statsOpen={statsOpen}
          onExtensions={() => setExtensionsOpen(true)}
          extensionsOpen={extensionsOpen}
          encryptionState={encryptionState}
          onEncrypt={handleEncrypt}
          onDecrypt={handleDecrypt}
          onChangeAlgorithm={handleChangeAlgorithm}
          onOptimization={handleOptimizationOpen}
          optimizationEnabled={isOptimizationEnabled}
          onSaveTemplate={handleSaveTemplate}
          onBrowseTemplates={handleBrowseTemplates}
        />
        {/* Professional Loading State */}
        {(previewLoading || isCreatingNode) && ()
          <div
            style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(2px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
}}
          >
            <ProfessionalSpinner 
              type="dots" 
              size={48} 
              color="#ff7c00"
              message={isCreatingNode ? 'Creating node...' : 'Generating previews...'}
            />
          </div>
        )}
        {/* Performance Monitor (dev mode only) */}
        {process.env.NODE_ENV === 'development' && ()
          <div
            className="development-only"
            style={{
  position: 'fixed',
  top: 10,
  left: 10,
  background: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: 8,
  borderRadius: 6,
  fontFamily: 'monospace',
  fontSize: 11,
  zIndex: 10000,
}}
          >
            <div>FPS: {metrics.fps}</div>
            <div>Nodes: {metrics.visibleNodes}/{nodes.length}</div>
            <div>Quality: {isPerformanceGood ? 'High' : 'Optimized'}</div>
          </div>
        )}
        <PreviewModal
          open={previewOpen}
          loading={previewLoading}
          error={previewError}
          results={previewResults}
          onClose={() => {
            cancelPreview();
            setPreviewOpen(false);
            setHighlightEdgeIds(new Set());
            setHighlightNodeIds(new Set());
          }}
          onCancel={cancelPreview}
          onResultHover={(idx) => {
            const res = previewResults[idx];
            if (res?.usedEdgeIds) {
              setHighlightEdgeIds(new Set(res.usedEdgeIds));
            } else {
              setHighlightEdgeIds(new Set());
            if (res?.usedNodeIds) {
              setHighlightNodeIds(new Set(res.usedNodeIds));
            } else {
              setHighlightNodeIds(new Set());
          }}
        />
        <ResponsiveCorrectionsPanel
          isOpen={correctionsOpen}
          onClose={() => setCorrectionsOpen(false)}
        />
        <CorrectionsStatsDashboard
          isOpen={statsOpen}
          onClose={() => setStatsOpen(false)}
        />
        {extensionsOpen && ()
          <ExtensionManagerPanel
            onClose={() => setExtensionsOpen(false)}
          />
        )}
        {/* Project Management Dialogs */}
        <SaveProjectDialog
          isOpen={saveDialogOpen}
          onClose={() => setSaveDialogOpen(false)}
          onSave={handleSaveSuccess}
        />
        <LoadProjectDialog
          isOpen={loadDialogOpen}
          onClose={() => setLoadDialogOpen(false)}
          onLoad={handleLoadSuccess}
        />
        {/* Unsaved Changes Dialog (Story 6.1) */}
        <UnsavedChangesDialog
          isOpen={showUnsavedDialog}
          projectName={currentProject?.name}
          actionDescription={dialogAction}
          onSave={handleUnsavedSave}
          onDontSave={handleUnsavedDontSave}
          onCancel={handleUnsavedCancel}
        />
        <ExportBundleDialog
          isOpen={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          nodes={nodes}
          edges={edges}
          onExport={handleExportSuccess}
        />
        {/* Template Dialogs */}
        <SaveTemplateDialog
          isOpen={saveTemplateDialogOpen}
          onClose={() => setSaveTemplateDialogOpen(false)}
          onSave={handleTemplateSave}
        />
        <TemplateBrowser
          isOpen={templateBrowserOpen}
          onClose={() => setTemplateBrowserOpen(false)}
          onApplyTemplate={handleTemplateApply}
          currentAuthor="current-user"
        />
        {/* Epic 7.3 - Advanced Settings Modal */}
        <SettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          onSettingsChange={(settings) => {
  console.log('Settings updated:', settings);
  // Settings changes are automatically handled by the SettingsManager
}}
        />
        {/* Epic 8.5 - Real-Time Preview Panels */}
        <RealTimePreviewPanel
          visible={realTimePreviewOpen}
          onClose={() => setRealTimePreviewOpen(false)}
          enablePerformanceMonitoring={true}
          maxResults={5}
        />
        <IndividualResultManager
          visible={resultManagerOpen}
          onClose={() => setResultManagerOpen(false)}
          enableComparison={true}
          enableAnalytics={true}
          maxDisplayResults={10}
        />
        {/* Graph Optimization Components */}
        <OptimizationControls
          settings={optimizationSettings}
          onSettingsChange={handleOptimizationSettingsChange}
          isOpen={optimizationControlsOpen}
          onClose={() => setOptimizationControlsOpen(false)}
        />
        <GraphAnalysisPanel
          nodes={nodes}
          edges={edges}
          isOpen={graphAnalysisOpen}
          onClose={() => setGraphAnalysisOpen(false)}
        />
        <PerformanceMonitor
          isVisible={performanceMonitorVisible}
          onToggle={handlePerformanceMonitorToggle}
        />
        {/* Optimization Menu */}
        {optimizationMenuOpen && ()
          <div data-optimization-menu style={{
  position: 'fixed',
  bottom: '60px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'white',
  border: '1px solid #ddd',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  padding: '8px',
  zIndex: 1001,
  display: 'flex',
  gap: '8px',
}}>
            <button
              onClick={() => {
                setGraphAnalysisOpen(true);
                setOptimizationMenuOpen(false);
              }}
              style={{
  padding: '12px 16px',
  backgroundColor: '#17a2b8',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
}}
            >
            📊 Analyze Graph
            </button>
            <button
              onClick={() => {
                setOptimizationControlsOpen(true);
                setOptimizationMenuOpen(false);
              }}
              style={{
  padding: '12px 16px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
}}
            >
            ⚙️ Settings
            </button>
            <button
              onClick={() => {
                setPerformanceMonitorVisible(true);
                setOptimizationMenuOpen(false);
              }}
              style={{
  padding: '12px 16px',
  backgroundColor: '#fd7e14',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
}}
            >
            📈 Monitor
            </button>
          </div>
        )}
        {/* Node Creation Animation Overlay */}
        {nodeCreationAnimation && ()
          <div
            className="animate-node-create-overlay"
            style={{
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 1000,
  width: 200,
  height: 100,
  background: 'radial-gradient(circle, rgba(255, 124, 0, 0.3), transparent)',
  borderRadius: 12,
  animation: 'nodeCreatePulse 0.6s ease-out',
}}
          />
        )}
        {/* Demo Performance Tester (development only) */}
        {process.env.NODE_ENV === 'development' && ()
          <DemoPerformanceTester
            onTestComplete={(result) => {
              console.log('Performance test completed:', result);
              if (!result.passedThreshold) {
                setStatusMessage(`Performance warning: ${result.recommendations[0]}`);}
                setTimeout(() => setStatusMessage(''), 5000);
            }}
            onGraphGenerated={(testNodes, testEdges) => {
            // Replace current graph with test graph
              setNodes(testNodes);
              setEdges(testEdges);
            }}
            targetFPS={30}
            maxRenderTime={16}
          />
        )}
      </div>
    </DemoModeManager>
  );
};

// Wrapper component with ReactFlowProvider
export const GraphEditor: React.FC<GraphEditorProps> = (props) => {
  return;
    <ReactFlowProvider>
      <GraphEditorInner {...props} />
    </ReactFlowProvider>
  );
};

export default GraphEditor;