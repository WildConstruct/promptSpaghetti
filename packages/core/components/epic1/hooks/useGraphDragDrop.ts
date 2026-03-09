import { useCallback, useEffect, useState, DragEvent } from 'react';
import { Node, ReactFlowInstance, XYPosition } from 'reactflow';
import { debugLogEpic1 } from '../../../utils/debug';
import type { PresetDropPayload } from './useDragDropHandlers';
import { findFragmentDropTarget, type FragmentDropTarget } from '../services/FragmentDropTargeting';
import type { AgentFragmentRecord } from '@prompt/asset-browser';

interface DraggedItem {
  type: string;
  data?: unknown;
  meta?: unknown;
  presetData?: string;
}

interface UseGraphDragDropOptions {
  onNodeCreate?: (node: Node) => void;
  onPresetDrop?: (
    preset: PresetDropPayload,
    position: XYPosition,
    dropTarget?: FragmentDropTarget | null
  ) => void;
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

declare global {
  interface Window {
    __graphDragDropHookBuild?: string;
    __EPIC1_LAST_PRESET_DRAG__?: unknown;
  }
}

if (
  typeof window !== 'undefined' &&
  window.__graphDragDropHookBuild !== '20250206'
) {
  window.__graphDragDropHookBuild = '20250206';
  if (process.env.NODE_ENV !== 'production') {
    debugLogEpic1('[useGraphDragDrop] Hook build 20250206 active');
  }
}

/**
 * Custom hook for managing drag and drop operations in the graph
 */
export function useGraphDragDrop<NodeData = unknown>(
  reactFlowInstance: ReactFlowInstance | null,
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>,
  options: UseGraphDragDropOptions = {}
) {
  const { onNodeCreate, onPresetDrop, showToast } = options;

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [dropPosition, setDropPosition] = useState<XYPosition | null>(null);
  const [dropTarget, setDropTarget] = useState<FragmentDropTarget | null>(null);

  // Handle drag over event
  const onDragOver = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const effectAllowed = event.dataTransfer.effectAllowed || 'copy';
      event.dataTransfer.dropEffect =
        effectAllowed === 'copy' || effectAllowed === 'copyMove'
          ? 'copy'
          : effectAllowed === 'move'
            ? 'move'
            : 'copy';
      setIsDraggingOver(true);

      // Calculate drop position
      if (reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });
        setDropPosition(position);
        setDropTarget(
          resolveDropTarget(
            reactFlowInstance,
            position,
            parseDragData(event.dataTransfer)
          )
        );
      }
    },
    [parseDragData, reactFlowInstance]
  );

  // Handle drag leave event
  const onDragLeave = useCallback((event: DragEvent) => {
    // Only set to false if we're leaving the main container
    const target = event.target as HTMLElement;
    if (target.classList.contains('react-flow__pane')) {
      setIsDraggingOver(false);
      setDropPosition(null);
      setDropTarget(null);
    }
  }, []);

  // Handle drag enter event
  const onDragEnter = useCallback((event: DragEvent) => {
    event.preventDefault();
    setIsDraggingOver(true);
  }, []);

  // Parse drag data
  const parseDragData = useCallback(
    (dataTransfer: DataTransfer): DraggedItem | null => {
      try {
        // Check for preset data
        const presetData =
          dataTransfer.getData('application/preset') ||
          dataTransfer.getData('application/x-preset') ||
          dataTransfer.getData('preset');
        if (presetData) {
          return { type: 'preset', presetData };
        }

        // Check for node type data
        const nodeType =
          dataTransfer.getData('application/nodeType') ||
          dataTransfer.getData('application/node-type');
        if (nodeType) {
          return { type: nodeType };
        }

        // Check for custom data format
        const customData = dataTransfer.getData('application/reactflow');
        if (customData) {
          try {
            const parsed = JSON.parse(customData);
            return parsed;
          } catch {
            // Some drag sources write plain node type text to this key.
            return { type: customData };
          }
        }

        // Check for asset browser data
        const assetData = dataTransfer.getData('text/plain');
        if (assetData) {
          try {
            const parsed = JSON.parse(assetData);
            if (
              parsed &&
              typeof parsed === 'object' &&
              ('path' in parsed ||
                'file' in parsed ||
                'psglib' in parsed ||
                'content' in parsed)
            ) {
              return { type: 'preset', presetData: assetData };
            }
            if (parsed.type === 'asset' || parsed.assetType) {
              return {
                type: 'asset',
                meta: parsed,
                data: parsed.data
              };
            }
          } catch {
            // Not JSON, might be plain text node type
            return { type: assetData };
          }
        }

        const fallbackPreset =
          typeof window !== 'undefined'
            ? window.__EPIC1_LAST_PRESET_DRAG__
            : undefined;
        if (isPresetDropPayload(fallbackPreset)) {
          return {
            type: 'preset',
            presetData: JSON.stringify(fallbackPreset)
          };
        }

        return null;
      } catch (error) {
        console.error('Failed to parse drag data:', error);
        return null;
      }
    },
    []
  );

  // Handle preset drop
  const handlePresetDrop = useCallback(
    (
      presetData: string,
      position: XYPosition,
      activeDropTarget?: FragmentDropTarget | null
    ) => {
      try {
        const parsed = JSON.parse(presetData) as unknown;
        if (isPresetDropPayload(parsed)) {
          onPresetDrop?.(parsed, position, activeDropTarget);
          showToast?.('success', 'Preset loaded');
        } else {
          throw new Error('Preset payload missing required structure');
        }
      } catch (error) {
        console.error('Failed to parse preset data:', error);
        showToast?.('error', 'Invalid preset data');
      }
    },
    [onPresetDrop, showToast]
  );

  // Handle asset drop
  const handleAssetDrop = useCallback(
    (meta: unknown, position: XYPosition) => {
      // This would typically load the asset and create nodes
      // Implementation depends on your asset system
      const assetMeta = meta as Record<string, unknown>;
      const assetName =
        typeof assetMeta.name === 'string' && assetMeta.name.trim().length > 0
          ? assetMeta.name
          : 'Asset';
      if (isPresetDropPayload(meta)) {
        onPresetDrop?.(meta, position);
      }
      showToast?.('success', `Loading ${assetName}`);
    },
    [onPresetDrop, showToast]
  );

  // Handle node type drop
  const handleNodeTypeDrop = useCallback(
    (nodeType: string, position: XYPosition, data?: unknown) => {
      const nodeData: NodeData =
        (data as NodeData | undefined) ??
        (getDefaultNodeData(nodeType) as NodeData);

      const newNode: Node<NodeData> = {
        id: `${nodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: nodeType,
        position,
        data: nodeData
      };

      if (nodeType === 'enhancedBoundingBox') {
        newNode.width = 400;
        newNode.height = 300;
        newNode.style = {
          ...(newNode.style || {}),
          width: 400,
          height: 300
        };
      }

      setNodes(nds => [...nds, newNode]);
      onNodeCreate?.(newNode);
      showToast?.('success', `Added ${nodeType} node`);
    },
    [setNodes, onNodeCreate, showToast]
  );

  const handleParsedDrop = useCallback(
    (dataTransfer: DataTransfer, clientX: number, clientY: number) => {
      setIsDraggingOver(false);
      setDropPosition(null);
      setDropTarget(null);

      if (!reactFlowInstance) {
        console.error('[useGraphDragDrop] reactFlowInstance is null');
        showToast?.('error', 'Graph not ready for drop');
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: clientX,
        y: clientY
      });

      const dragData = parseDragData(dataTransfer);
      if (!dragData) {
        console.warn('No valid drag data found');
        return;
      }

      const activeDropTarget = resolveDropTarget(
        reactFlowInstance,
        position,
        dragData
      );

      if (dragData.type === 'preset' && dragData.presetData) {
        handlePresetDrop(dragData.presetData, position, activeDropTarget);
      } else if (dragData.type === 'asset' && dragData.meta) {
        handleAssetDrop(dragData.meta, position);
      } else if (dragData.type) {
        handleNodeTypeDrop(dragData.type, position, dragData.data);
      }
    },
    [
      handleAssetDrop,
      handleNodeTypeDrop,
      handlePresetDrop,
      parseDragData,
      reactFlowInstance,
      showToast
    ]
  );

  // Handle drop event
  const onDrop = useCallback(
    (event: DragEvent) => {
      if (
        (event.nativeEvent as { __epic1DropHandled?: boolean })
          .__epic1DropHandled
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      (
        event.nativeEvent as { __epic1DropHandled?: boolean }
      ).__epic1DropHandled = true;
      debugLogEpic1('[useGraphDragDrop] Drop event received');
      handleParsedDrop(event.dataTransfer, event.clientX, event.clientY);
    },
    [handleParsedDrop]
  );

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const isInsideEditor = (event: globalThis.DragEvent) => {
      const editor = document.querySelector('.epic1-graph-editor');
      if (!editor) {
        return false;
      }
      const target = event.target as globalThis.Node | null;
      if (target && editor.contains(target)) {
        return true;
      }
      const rect = editor.getBoundingClientRect();
      return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    };

    const hasAppDragTypes = (dataTransfer: DataTransfer | null) => {
      if (!dataTransfer) {
        return false;
      }
      const types = Array.from(dataTransfer.types || []);
      return (
        types.includes('application/x-preset') ||
        types.includes('preset') ||
        types.includes('application/json') ||
        types.includes('application/reactflow') ||
        types.includes('application/nodeType') ||
        types.includes('application/node-type') ||
        types.includes('text/plain')
      );
    };

    const onDocumentDragOver = (event: globalThis.DragEvent) => {
      if (!isInsideEditor(event) || !hasAppDragTypes(event.dataTransfer)) {
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
      setIsDraggingOver(true);
      if (reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });
        setDropPosition(position);
        setDropTarget(
          resolveDropTarget(
            reactFlowInstance,
            position,
            parseDragData(event.dataTransfer)
          )
        );
      }
    };

    const onDocumentDrop = (event: globalThis.DragEvent) => {
      if (!isInsideEditor(event) || !hasAppDragTypes(event.dataTransfer)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      (event as { __epic1DropHandled?: boolean }).__epic1DropHandled = true;
      if (event.dataTransfer) {
        handleParsedDrop(event.dataTransfer, event.clientX, event.clientY);
      }
    };

    document.addEventListener('dragover', onDocumentDragOver, true);
    document.addEventListener('drop', onDocumentDrop, true);
    return () => {
      document.removeEventListener('dragover', onDocumentDragOver, true);
      document.removeEventListener('drop', onDocumentDrop, true);
    };
  }, [handleParsedDrop, reactFlowInstance]);

  // Handle drag start (for internal nodes)
  const onDragStart = useCallback((event: DragEvent, node: Node) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(node));
    setDraggedItem({ type: node.type || 'node', data: node.data });
  }, []);

  // Handle drag end
  const onDragEnd = useCallback(() => {
    setDraggedItem(null);
    setIsDraggingOver(false);
    setDropPosition(null);
    setDropTarget(null);
  }, []);

  return {
    // State
    isDraggingOver,
    draggedItem,
    dropPosition,
    dropTarget,

    // Event handlers
    onDragOver,
    onDragLeave,
    onDragEnter,
    onDrop,
    onDragStart,
    onDragEnd,

    // Utilities
    parseDragData
  };
}

function presetPayloadToAgentFragmentRecord(
  payload: PresetDropPayload
): AgentFragmentRecord {
  const metadata = payload.metadata && typeof payload.metadata === 'object'
    ? (payload.metadata as Record<string, unknown>)
    : {};

  return {
    id: payload.id,
    name: payload.name,
    path: typeof payload.path === 'string' ? payload.path : '',
    category: typeof payload.category === 'string' ? payload.category : 'uncategorized',
    description:
      typeof metadata.description === 'string' ? metadata.description : undefined,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    roles: [],
    domains: [],
    nodeTypes: typeof payload.type === 'string'
      ? [
          (payload.type === 'concat'
            ? 'merge'
            : payload.type) as AgentFragmentRecord['nodeTypes'][number]
        ]
      : [],
    placementHints: [],
    tone: [],
    nodeCount: 1,
    preferredInsertion:
      metadata.preferredInsertion === 'replace-node' ||
      metadata.preferredInsertion === 'insert-edge' ||
      metadata.preferredInsertion === 'free-place'
        ? metadata.preferredInsertion
        : 'free-place',
    entryStrategy:
      metadata.entryStrategy === 'single-node' ||
      metadata.entryStrategy === 'auto-boundary' ||
      metadata.entryStrategy === 'manual'
        ? metadata.entryStrategy
        : 'auto-boundary',
    exitStrategy:
      metadata.exitStrategy === 'single-node' ||
      metadata.exitStrategy === 'auto-boundary' ||
      metadata.exitStrategy === 'manual'
        ? metadata.exitStrategy
        : 'auto-boundary',
    suggestionWeight:
      typeof metadata.suggestionWeight === 'number' ? metadata.suggestionWeight : 0,
    requiresBranchLane: metadata.requiresBranchLane === true,
    priority: 0
  };
}

function resolveDropTarget(
  reactFlowInstance: ReactFlowInstance,
  position: XYPosition,
  dragData: DraggedItem | null
): FragmentDropTarget | null {
  if (!dragData || dragData.type !== 'preset' || !dragData.presetData) {
    return null;
  }

  try {
    const parsed = JSON.parse(dragData.presetData) as unknown;
    if (!isPresetDropPayload(parsed)) {
      return null;
    }

    return findFragmentDropTarget({
      pointer: position,
      fragment: presetPayloadToAgentFragmentRecord(parsed),
      nodes: reactFlowInstance.getNodes() as Node[],
      edges: reactFlowInstance.getEdges()
    });
  } catch {
    return null;
  }
}

// Default node data helper (duplicate from useNodeOperations - could be shared)
function getDefaultNodeData(type: string): Record<string, unknown> {
  switch (type) {
    case 'textBlock':
      return { text: 'New text block', variations: [] };
    case 'weightedChoice':
      return { options: [{ text: 'Option 1', weight: 1 }] };
    case 'concat':
      return { separator: ' ' };
    case 'output':
      return { label: 'Output' };
    case 'variable':
    case 'setVariable':
    case 'getVariable':
      return { variableName: 'myVariable', value: '' };
    case 'enhancedBoundingBox':
      return {
        title: 'Region',
        description: '',
        backgroundColor: '#1a202c',
        opacity: 0.1,
        borderColor: '#22d3ee',
        borderStyle: 'solid',
        borderWidth: 2,
        locked: false,
        isCollapsed: false,
        width: 400,
        height: 300
      };
    default:
      return {};
  }
}
const isPresetDropPayload = (value: unknown): value is PresetDropPayload =>
  typeof value === 'object' && value !== null;
