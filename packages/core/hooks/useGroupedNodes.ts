/**
 * React hook for group-aware node rendering with performance optimization
 * Story 1.27: Node Grouping Hierarchy
 * Integrated with Story 0.1: Performance Infrastructure
 */

import { useMemo, useState, useEffect, useCallback } from 'react';
import { Node } from 'reactflow';
import { NodeGroup } from '../types/groups';
import { collapseGroup } from '../utils/grouping';
import { useCachedData, useWorkerTask } from './usePerformance';

interface UseGroupedNodesOptions {
  enableCaching?: boolean;
  enableWorkers?: boolean;
}

/**
 * Hook for managing grouped nodes with performance optimization
 */
export function useGroupedNodes(
  nodes: Node[],
  groups: Map<string, NodeGroup>,
  options: UseGroupedNodesOptions = {}
) {
  const { enableCaching = true, enableWorkers = true } = options;
  const [isCalculating, setIsCalculating] = useState(false);

  // Generate cache key based on nodes and groups
  const cacheKey = useMemo(() => {
    const nodeIds = nodes.map(n => n.id).sort().join(',');
    const groupIds = Array.from(groups.keys()).sort().join(',');
    const collapsedGroups = Array.from(groups.values())
      .filter(g => g.collapsed)
      .map(g => g.id)
      .sort()
      .join(',');
    
    return `grouped:nodes:${nodeIds.length}:${groups.size}:${collapsedGroups}`;
  }, [nodes, groups]);

  // Use cached data for performance
  const { data: cachedGroupedNodes, isLoading: cacheLoading } = useCachedData<Node[]>(
    enableCaching ? cacheKey : '',
    async () => calculateGroupedNodes(nodes, groups),
    {
      ttl: 5000, // 5 second TTL
      dependencies: [nodes, groups]
    }
  );

  // Use worker for large graphs
  const shouldUseWorker = enableWorkers && (nodes.length > 100 || groups.size > 20);
  
  const { result: workerGroupedNodes, isProcessing } = useWorkerTask<Node[]>(
    shouldUseWorker ? {
      type: 'CALCULATE_GROUPED_NODES',
      data: {
        nodes,
        groups: Array.from(groups.entries()).map(([id, group]) => ({
          id,
          ...group,
          nodeIds: Array.from(group.nodeIds) // Convert Set to Array for serialization
        }))
      }
    } : null,
    {
      autoExecute: shouldUseWorker
    }
  );

  // Calculate grouped nodes inline for small graphs
  const inlineGroupedNodes = useMemo(() => {
    if (shouldUseWorker || enableCaching) {
      return null;
    }
    
    return calculateGroupedNodes(nodes, groups);
  }, [nodes, groups, shouldUseWorker, enableCaching]);

  // Determine which result to use
  const groupedNodes = useMemo(() => {
    if (shouldUseWorker && workerGroupedNodes) {
      return workerGroupedNodes;
    }
    
    if (enableCaching && cachedGroupedNodes) {
      return cachedGroupedNodes;
    }
    
    return inlineGroupedNodes || nodes;
  }, [
    shouldUseWorker,
    workerGroupedNodes,
    enableCaching,
    cachedGroupedNodes,
    inlineGroupedNodes,
    nodes
  ]);

  // Track calculation state
  useEffect(() => {
    setIsCalculating(cacheLoading || isProcessing);
  }, [cacheLoading, isProcessing]);

  return {
    groupedNodes,
    isCalculating,
    stats: {
      totalNodes: nodes.length,
      visibleNodes: groupedNodes.length,
      totalGroups: groups.size,
      collapsedGroups: Array.from(groups.values()).filter(g => g.collapsed).length,
      hiddenNodes: nodes.length - groupedNodes.length + 
        Array.from(groups.values()).filter(g => g.collapsed).length
    }
  };
}

/**
 * Calculate grouped nodes (inline implementation)
 */
function calculateGroupedNodes(
  nodes: Node[],
  groups: Map<string, NodeGroup>
): Node[] {
  const visibleNodes: Node[] = [];
  const hiddenNodeIds = new Set<string>();
  
  // Find collapsed groups and their nodes
  groups.forEach(group => {
    if (group.collapsed) {
      // Hide all nodes in collapsed group
      group.nodeIds.forEach(id => hiddenNodeIds.add(id));
      
      // Add collapsed group as a single node
      const collapsedNode = collapseGroup(group, nodes);
      visibleNodes.push(collapsedNode);
    }
  });
  
  // Add non-hidden nodes
  nodes.forEach(node => {
    if (!hiddenNodeIds.has(node.id)) {
      visibleNodes.push(node);
    }
  });
  
  return visibleNodes;
}

/**
 * Hook for group drag and drop operations
 */
export function useGroupDragDrop(
  groups: Map<string, NodeGroup>,
  onNodeAddToGroup: (nodeId: string, groupId: string) => void,
  onNodeRemoveFromGroup: (nodeId: string) => void,
  onNodeMoveBetweenGroups: (nodeId: string, fromGroupId: string, toGroupId: string) => void
) {
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);

  const handleNodeDragStart = useCallback((event: React.DragEvent, nodeId: string) => {
    setDraggedNodeId(nodeId);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleGroupDragOver = useCallback((event: React.DragEvent, groupId: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setTargetGroupId(groupId);
  }, []);

  const handleGroupDrop = useCallback((event: React.DragEvent, groupId: string) => {
    event.preventDefault();
    
    if (draggedNodeId) {
      // Find current group of dragged node
      let currentGroupId: string | null = null;
      
      for (const [gId, group] of groups) {
        if (group.nodeIds.has(draggedNodeId)) {
          currentGroupId = gId;
          break;
        }
      }
      
      if (currentGroupId && currentGroupId !== groupId) {
        // Move between groups
        onNodeMoveBetweenGroups(draggedNodeId, currentGroupId, groupId);
      } else if (!currentGroupId) {
        // Add to group
        onNodeAddToGroup(draggedNodeId, groupId);
      }
    }
    
    setDraggedNodeId(null);
    setTargetGroupId(null);
  }, [draggedNodeId, groups, onNodeAddToGroup, onNodeMoveBetweenGroups]);

  const handleNodeDragEnd = useCallback(() => {
    setDraggedNodeId(null);
    setTargetGroupId(null);
  }, []);

  return {
    draggedNodeId,
    targetGroupId,
    handleNodeDragStart,
    handleGroupDragOver,
    handleGroupDrop,
    handleNodeDragEnd
  };
}

/**
 * Hook for keyboard shortcuts
 */
export function useGroupKeyboardShortcuts(
  selectedNodes: string[],
  onCreateGroup: (nodeIds: string[]) => void,
  onUngroup: (groupId: string) => void,
  onToggleGroup: (groupId: string) => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl+G: Group selected nodes
      if ((event.metaKey || event.ctrlKey) && event.key === 'g' && !event.shiftKey) {
        event.preventDefault();
        if (selectedNodes.length > 1) {
          onCreateGroup(selectedNodes);
        }
      }
      
      // Cmd/Ctrl+Shift+G: Ungroup
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'g') {
        event.preventDefault();
        // Need to determine which group is selected
        // This would require additional state management
      }
      
      // Space: Toggle collapse when group selected
      if (event.key === ' ' && !event.target?.matches('input, textarea')) {
        event.preventDefault();
        // Need to determine which group is selected
        // This would require additional state management
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodes, onCreateGroup, onUngroup, onToggleGroup]);
}