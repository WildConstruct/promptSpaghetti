/**
 * Hook for automatic node layout within bounding box
 * Provides grid-based layout with configurable spacing
 */

import { useState, useCallback } from 'react';
import { Node, useReactFlow } from 'reactflow';
import { UseAutoLayoutReturn } from '../types';
import { BOUNDING_BOX_CONSTANTS } from '../utils/constants';
import { PerformanceMonitor } from '../../../../../utils/performance/PerformanceMonitor';

const { NODE_SPACING, PADDING, HEADER_HEIGHT } = BOUNDING_BOX_CONSTANTS.spacing;

interface LayoutOptions {
  columns?: number;
  spacing?: number;
  padding?: number;
  headerOffset?: number;
}

export function useAutoLayout(
  boxId: string,
  containedNodes: Node[],
  enabled: boolean = false
): UseAutoLayoutReturn {
  const perfMonitor = PerformanceMonitor.getInstance();
  const { getNodes, setNodes } = useReactFlow();
  const [isLayouting, setIsLayouting] = useState(false);

  /**
   * Calculate optimal grid layout for nodes
   */
  const calculateLayout = useCallback(
    (nodes: Node[], boxNode: Node, options: LayoutOptions = {}) => {
      const {
        columns = Math.ceil(Math.sqrt(nodes.length)),
        spacing = NODE_SPACING,
        padding = PADDING,
        headerOffset = HEADER_HEIGHT
      } = options;

      const positions: Array<{ id: string; x: number; y: number }> = [];

      nodes.forEach((node, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const nodeWidth = node.width || 150;
        const nodeHeight = node.height || 50;

        const x = boxNode.position.x + padding + col * (nodeWidth + spacing);
        const y =
          boxNode.position.y +
          padding +
          headerOffset +
          row * (nodeHeight + spacing);

        positions.push({ id: node.id, x, y });
      });

      return positions;
    },
    []
  );

  /**
   * Apply auto-layout to contained nodes
   */
  const applyLayout = useCallback(
    (options: LayoutOptions = {}) => {
      if (!enabled || containedNodes.length === 0) {
        return;
      }

      setIsLayouting(true);
      const start = performance.now();

      // Get the bounding box node
      const allNodes = getNodes();
      const boxNode = allNodes.find(n => n.id === boxId);

      if (!boxNode) {
        setIsLayouting(false);
        return;
      }

      // Calculate new positions
      const newPositions = calculateLayout(containedNodes, boxNode, options);
      const positionMap = new Map(newPositions.map(p => [p.id, p]));

      // Apply new positions with animation
      setNodes(nodes =>
        nodes.map(node => {
          const newPos = positionMap.get(node.id);
          if (newPos) {
            return {
              ...node,
              position: { x: newPos.x, y: newPos.y },
              // Add transition style for smooth movement
              style: {
                ...node.style,
                transition: 'all 0.3s ease-out'
              }
            };
          }
          return node;
        })
      );

      const duration = performance.now() - start;
      perfMonitor.record('boundingBox.autoLayout', duration);
      perfMonitor.record('boundingBox.autoLayoutNodes', containedNodes.length);

      // Clean up transition styles after animation
      setTimeout(() => {
        setNodes(nodes =>
          nodes.map(node => {
            if (positionMap.has(node.id)) {
              const { transition, ...restStyle } = node.style || {};
              return {
                ...node,
                style: restStyle
              };
            }
            return node;
          })
        );
        setIsLayouting(false);
      }, 300);
    },
    [
      enabled,
      containedNodes,
      boxId,
      getNodes,
      setNodes,
      calculateLayout,
      perfMonitor
    ]
  );

  return {
    applyLayout,
    isLayouting
  };
}
