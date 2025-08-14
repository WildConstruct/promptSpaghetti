/**
 * Hook for auto-layout functionality
 * Story 1.32: Auto-Layout and Node Positioning System
 */

import { useCallback, useRef } from 'react';
import { Node, Edge, useReactFlow } from 'reactflow';
import {
  LayoutAlgorithm,
  LayoutOptions,
  applyLayoutWithAnimation,
  selectBestLayout,
  layoutNewNodes,
} from '../../../utils/layoutAlgorithms';

export interface UseAutoLayoutOptions {
  defaultAlgorithm?: LayoutAlgorithm;
  animationDuration?: number;
  debounceMs?: number;
}

export interface AutoLayoutResult {
  cleanupNodes: (nodesToClean?: Node[], algorithm?: LayoutAlgorithm) => void;
  cleanupSelection: () => void;
  cleanupAll: () => void;
  layoutDroppedNodes: (
    newNodes: Node[],
    dropPosition: { x: number; y: number }
  ) => Node[];
  isLayouting: boolean;
}

export function useAutoLayout(
  options: UseAutoLayoutOptions = {}
): AutoLayoutResult {
  const { defaultAlgorithm = 'dagre', debounceMs = 100 } = options;
  
  const { setNodes, getNodes, getEdges, fitView } = useReactFlow();
  const isLayoutingRef = useRef(false);
  const layoutTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Core cleanup function with debouncing
   */
  const cleanupNodesInternal = useCallback(
    (nodesToClean?: Node[], algorithm?: LayoutAlgorithm) => {
      // Clear any pending layout operations
      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current);
      }

      layoutTimeoutRef.current = setTimeout(() => {
        isLayoutingRef.current = true;
        
        const allNodes = getNodes();
        const edges = getEdges();
        
        // Determine which nodes to layout
        const targetNodes = nodesToClean || allNodes;
        const targetNodeIds = new Set(targetNodes.map((n) => n.id));
        
        // Filter edges that connect target nodes
        const relevantEdges = edges.filter(
          (edge) =>
            targetNodeIds.has(edge.source) && targetNodeIds.has(edge.target)
        );
        
        // Select best algorithm if not specified
        const layoutAlgorithm =
          algorithm || selectBestLayout(targetNodes, relevantEdges);
        
        // Apply layout with animation
        const layoutedNodes = applyLayoutWithAnimation(
          targetNodes,
          layoutAlgorithm,
          relevantEdges,
          { animate: true }
        );
        
        // Update all nodes
        setNodes((currentNodes) => {
          const layoutMap = new Map(
            layoutedNodes.map((node) => [node.id, node])
          );
          
          return currentNodes.map((node) => {
            const layoutedNode = layoutMap.get(node.id);
            if (layoutedNode) {
              return {
                ...node,
                position: layoutedNode.position,
                style: layoutedNode.style,
              };
            }
            return node;
          });
        });
        
        // Fit view after animation completes
        setTimeout(() => {
          fitView({ padding: 0.1, duration: 500 });
          isLayoutingRef.current = false;
        }, 600);
      }, debounceMs);
    },
    [setNodes, getNodes, getEdges, fitView, debounceMs]
  );

  /**
   * Cleanup selected nodes
   */
  const cleanupSelection = useCallback(() => {
    const selectedNodes = getNodes().filter((node) => node.selected);
    if (selectedNodes.length > 0) {
      cleanupNodesInternal(selectedNodes);
    }
  }, [getNodes, cleanupNodesInternal]);

  /**
   * Cleanup all nodes
   */
  const cleanupAll = useCallback(() => {
    cleanupNodesInternal();
  }, [cleanupNodesInternal]);

  /**
   * Layout nodes that were just dropped from asset browser
   */
  const layoutDroppedNodes = useCallback(
    (newNodes: Node[], dropPosition: { x: number; y: number }): Node[] => {
      const existingNodes = getNodes();
      const edges = getEdges();
      
      // Extract edges between new nodes
      const newNodeIds = new Set(newNodes.map((n) => n.id));
      const newEdges = edges.filter(
        (edge) =>
          newNodeIds.has(edge.source) && newNodeIds.has(edge.target)
      );
      
      // Layout the new nodes
      const layoutedNodes = layoutNewNodes(
        existingNodes,
        newNodes,
        dropPosition,
        newEdges
      );
      
      return layoutedNodes;
    },
    [getNodes, getEdges]
  );

  return {
    cleanupNodes: cleanupNodesInternal,
    cleanupSelection,
    cleanupAll,
    layoutDroppedNodes,
    isLayouting: isLayoutingRef.current,
  };
}

/**
 * Layout preset for common graph patterns
 */
export const LayoutPresets = {
  HORIZONTAL: { direction: 'LR', nodeSpacing: 100, rankSpacing: 150 } as LayoutOptions,
  VERTICAL: { direction: 'TB', nodeSpacing: 100, rankSpacing: 150 } as LayoutOptions,
  COMPACT: { direction: 'LR', nodeSpacing: 60, rankSpacing: 100 } as LayoutOptions,
  SPACIOUS: { direction: 'LR', nodeSpacing: 150, rankSpacing: 200 } as LayoutOptions,
};