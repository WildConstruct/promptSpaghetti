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
  neatenSelection: () => void;
  neatenAll: () => void;
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
   * Neaten function: snap nodes to grid and align rows without full relayout
   */
  const neaten = useCallback((nodesToNeaten?: Node[]) => {
    const grid = 20; // grid size in px
    const rowSnap = 40; // row grouping threshold
    const all = nodesToNeaten || getNodes();

    // Compute row groups by rounding Y to nearest rowSnap multiple
    const rowMap = new Map<number, number>(); // original rounded -> canonical Y
    const roundedYs = all.map(n => Math.round(n.position.y / rowSnap) * rowSnap);
    // Use median per rounded group as canonical
    const groups = new Map<number, number[]>();
    roundedYs.forEach((ry, i) => {
      const arr = groups.get(ry) || [];
      arr.push(all[i].position.y);
      groups.set(ry, arr);
    });
    groups.forEach((vals, key) => {
      const sorted = vals.slice().sort((a,b)=>a-b);
      const median = sorted[Math.floor(sorted.length/2)];
      // Snap median to grid too
      rowMap.set(key, Math.round(median / grid) * grid);
    });

    setNodes(current => current.map(n => {
      const inScope = (nodesToNeaten ? all.find(a => a.id === n.id) : n) !== undefined;
      if (!inScope) return n;
      const snappedX = Math.round(n.position.x / grid) * grid;
      const ry = Math.round(n.position.y / rowSnap) * rowSnap;
      const alignedY = rowMap.get(ry) ?? Math.round(n.position.y / grid) * grid;
      return { ...n, position: { x: snappedX, y: alignedY } };
    }));
  }, [getNodes, setNodes]);

  const neatenSelection = useCallback(() => {
    const selected = getNodes().filter(n => n.selected);
    if (selected.length > 0) neaten(selected);
  }, [getNodes, neaten]);

  const neatenAll = useCallback(() => {
    neaten();
  }, [neaten]);

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
    neatenSelection,
    neatenAll,
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
