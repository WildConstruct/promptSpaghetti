import { useCallback, useState, DragEvent } from 'react';
import { Node, ReactFlowInstance, XYPosition } from 'reactflow';

interface DraggedItem {
  type: string;
  data?: unknown;
  meta?: unknown;
  presetData?: string;
}

interface UseGraphDragDropOptions {
  onNodeCreate?: (node: Node) => void;
  onPresetDrop?: (preset: unknown, position: XYPosition) => void;
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
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

  // Handle drag over event
  const onDragOver = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setIsDraggingOver(true);

      // Calculate drop position
      if (reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });
        setDropPosition(position);
      }
    },
    [reactFlowInstance]
  );

  // Handle drag leave event
  const onDragLeave = useCallback((event: DragEvent) => {
    // Only set to false if we're leaving the main container
    const target = event.target as HTMLElement;
    if (target.classList.contains('react-flow__pane')) {
      setIsDraggingOver(false);
      setDropPosition(null);
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
        const presetData = dataTransfer.getData('application/preset');
        if (presetData) {
          return { type: 'preset', presetData };
        }

        // Check for node type data
        const nodeType = dataTransfer.getData('application/nodeType');
        if (nodeType) {
          return { type: nodeType };
        }

        // Check for custom data format
        const customData = dataTransfer.getData('application/reactflow');
        if (customData) {
          const parsed = JSON.parse(customData);
          return parsed;
        }

        // Check for asset browser data
        const assetData = dataTransfer.getData('text/plain');
        if (assetData) {
          try {
            const parsed = JSON.parse(assetData);
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

        return null;
      } catch (error) {
        console.error('Failed to parse drag data:', error);
        return null;
      }
    },
    []
  );

  // Handle drop event
  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      setIsDraggingOver(false);
      setDropPosition(null);

      if (!reactFlowInstance) {
        showToast?.('error', 'Graph not ready for drop');
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      const dragData = parseDragData(event.dataTransfer);
      if (!dragData) {
        console.warn('No valid drag data found');
        return;
      }

      // Handle different drop types
      if (dragData.type === 'preset' && dragData.presetData) {
        handlePresetDrop(dragData.presetData, position);
      } else if (dragData.type === 'asset' && dragData.meta) {
        handleAssetDrop(dragData.meta, position);
      } else if (dragData.type) {
        handleNodeTypeDrop(dragData.type, position, dragData.data);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reactFlowInstance, parseDragData, showToast]
  );

  // Handle preset drop
  const handlePresetDrop = useCallback(
    (presetData: string, position: XYPosition) => {
      try {
        const preset = JSON.parse(presetData);
        onPresetDrop?.(preset, position);
        showToast?.('success', 'Preset loaded');
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
      if (assetMeta.filePath || assetMeta.assetPath) {
        onPresetDrop?.(meta, position);
        showToast?.('success', `Loading asset: ${assetMeta.name || 'Unknown'}`);
      } else {
        showToast?.('error', 'Invalid asset data');
      }
    },
    [onPresetDrop, showToast]
  );

  // Handle node type drop
  const handleNodeTypeDrop = useCallback(
    (nodeType: string, position: XYPosition, data?: unknown) => {
      const newNode: Node<NodeData> = {
        id: `${nodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: nodeType,
        position,
        data: data || (getDefaultNodeData(nodeType) as NodeData)
      };

      setNodes(nds => [...nds, newNode]);
      onNodeCreate?.(newNode);
      showToast?.('success', `Added ${nodeType} node`);
    },
    [setNodes, onNodeCreate, showToast]
  );

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
  }, []);

  return {
    // State
    isDraggingOver,
    draggedItem,
    dropPosition,

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
      return { variableName: 'myVariable', value: '' };
    default:
      return {};
  }
}
