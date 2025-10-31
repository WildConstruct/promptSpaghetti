/**
 * Hook for managing locked group movement
 * Handles moving all contained nodes together when bounding box is locked
 */

import { useRef, useCallback, useEffect } from 'react';
import { Node, useReactFlow } from 'reactflow';
import { Position2D, UseGroupMovementReturn } from '../types';
import { PerformanceMonitor } from '../../../../../utils/performance/PerformanceMonitor';

export function useGroupMovement(
  boxId: string,
  isLocked: boolean,
  isDragging: boolean,
  currentPosition: Position2D,
  containedNodes: Node[]
): UseGroupMovementReturn {
  const perfMonitor = PerformanceMonitor.getInstance();
  const { setNodes } = useReactFlow();
  const previousPositionRef = useRef<Position2D>(currentPosition);
  const isMovingRef = useRef(false);

  /**
   * Handle group movement when locked and dragging
   */
  useEffect(() => {
    if (!isLocked || !isDragging) {
      isMovingRef.current = false;
      previousPositionRef.current = currentPosition;
      return;
    }

    const deltaX = currentPosition.x - previousPositionRef.current.x;
    const deltaY = currentPosition.y - previousPositionRef.current.y;

    // Only update if there's actual movement
    if (deltaX !== 0 || deltaY !== 0) {
      isMovingRef.current = true;
      const start = performance.now();

      // Get IDs of nodes to move for efficient lookup
      const nodeIdsToMove = new Set(containedNodes.map(n => n.id));

      // Update all contained nodes' positions
      setNodes(nodes =>
        nodes.map(node => {
          if (nodeIdsToMove.has(node.id)) {
            return {
              ...node,
              position: {
                x: node.position.x + deltaX,
                y: node.position.y + deltaY
              }
            };
          }
          return node;
        })
      );

      const duration = performance.now() - start;
      perfMonitor.record('boundingBox.groupMove', duration);
      perfMonitor.record('boundingBox.nodesMovedCount', containedNodes.length);

      console.debug(
        `[Group Move] Moved ${containedNodes.length} nodes by (${deltaX.toFixed(1)}, ${deltaY.toFixed(1)}) in ${duration.toFixed(2)}ms`
      );
    }

    // Update previous position for next frame
    previousPositionRef.current = currentPosition;
  }, [
    currentPosition,
    isLocked,
    isDragging,
    containedNodes,
    setNodes,
    perfMonitor
  ]);

  /**
   * Manually trigger group movement
   */
  const handleGroupMove = useCallback(
    (deltaX: number, deltaY: number) => {
      if (!isLocked || containedNodes.length === 0) {return;}

      const start = performance.now();
      const nodeIdsToMove = new Set(containedNodes.map(n => n.id));

      setNodes(nodes =>
        nodes.map(node => {
          if (nodeIdsToMove.has(node.id)) {
            return {
              ...node,
              position: {
                x: node.position.x + deltaX,
                y: node.position.y + deltaY
              }
            };
          }
          return node;
        })
      );

      const duration = performance.now() - start;
      perfMonitor.record('boundingBox.manualGroupMove', duration);
    },
    [isLocked, containedNodes, setNodes, perfMonitor]
  );

  return {
    handleGroupMove,
    isMoving: isMovingRef.current
  };
}
