/**
 * Magnetic Snap Handler
 * Provides magnetic snap behavior for node connections
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useReactFlow, useStoreApi } from 'reactflow';
import { useMicroInteractions, triggerHaptic } from '../animations/MicroInteractions';

interface ClosestHandle {
  nodeId: string;
  x: number;
  y: number;
  distance: number;
}

interface SnapNode {
  id: string;
  position: { x: number; y: number };
  width?: number | null;
  height?: number | null;
}

interface MagneticSnapHandlerProps {
  magnetDistance?: number;
  snapStrength?: number;
  enableHaptic?: boolean;
}

export const MagneticSnapHandler: React.FC<MagneticSnapHandlerProps> = ({
  magnetDistance = 30,
  snapStrength = 0.8,
  enableHaptic = true
}) => {
  const { getNodes } = useReactFlow();
  const store = useStoreApi();
  const { trigger } = useMicroInteractions();
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastSnapTarget, setLastSnapTarget] = useState<string | null>(null);

  // Calculate distance between two points
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Find the closest valid target handle
  const findClosestHandle = useCallback(
    (sourceNode: SnapNode, mouseX: number, mouseY: number): ClosestHandle | null => {
      const nodes = getNodes() as SnapNode[];
      let closestHandle: ClosestHandle | null = null;
      let closestDistance = Infinity;

      nodes.forEach(node => {
        if (node.id === sourceNode.id) {return;}

        const targetX = node.position.x + (node.width || 100) / 2;
        const targetY = node.position.y + (node.height || 50) / 2;

        const distance = getDistance(mouseX, mouseY, targetX, targetY);

        if (distance < magnetDistance && distance < closestDistance) {
          closestDistance = distance;
          closestHandle = {
            nodeId: node.id,
            x: targetX,
            y: targetY,
            distance
          };
        }
      });

      return closestHandle;
    },
    [getNodes, magnetDistance]
  );

  // Handle connection start
  useEffect(() => {
    const unsubscribe = store.subscribe(state => {
      const connectionNodeId = state.connectionNodeId;
      setIsConnecting(Boolean(connectionNodeId));
      if (!connectionNodeId) {
        setLastSnapTarget(null);
      }
    });

    return unsubscribe;
  }, [store]);

  // Monitor mouse position during connection
  useEffect(() => {
    if (!isConnecting) {return;}

    const handleMouseMove = (event: MouseEvent) => {
      const state = store.getState();
      const connectionNodeId = state.connectionNodeId;
      
      if (!connectionNodeId) {return;}

      const sourceNode = getNodes().find(n => n.id === connectionNodeId);
      if (!sourceNode) {return;}

      // Get viewport-adjusted mouse position
      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (!reactFlowBounds) {return;}

      const viewportX = event.clientX - reactFlowBounds.left;
      const viewportY = event.clientY - reactFlowBounds.top;

      // Find closest handle
      const closestHandle = findClosestHandle(sourceNode, viewportX, viewportY);

      if (closestHandle && closestHandle.distance < magnetDistance) {
        // Trigger snap feedback if this is a new target
        if (closestHandle.nodeId !== lastSnapTarget) {
          const hapticType =
            snapStrength >= 0.9
              ? 'heavy'
              : snapStrength >= 0.6
                ? 'medium'
                : 'light';
          trigger('snap', closestHandle.x, closestHandle.y, {
            nodeId: closestHandle.nodeId,
            haptic: enableHaptic ? hapticType : undefined
          });
          setLastSnapTarget(closestHandle.nodeId);
        }

        // Visual feedback: update connection line endpoint
        // This would need React Flow internal API access for full implementation
      } else {
        setLastSnapTarget(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isConnecting, findClosestHandle, trigger, lastSnapTarget, magnetDistance, snapStrength, enableHaptic, store, getNodes]);

  return null; // This is a behavior component, no visual output
};

// Hook for programmatic snap detection
export function useMagneticSnap(options?: {
  magnetDistance?: number;
  onSnap?: (nodeId: string) => void;
  onRelease?: () => void;
}) {
  const [snappedNodeId, setSnappedNodeId] = useState<string | null>(null);
  const { magnetDistance = 30, onSnap, onRelease } = options || {};

  const checkSnap = useCallback((sourceX: number, sourceY: number, nodes: SnapNode[]) => {
    let closestNode: SnapNode | null = null;
    let closestDistance = Infinity;

    nodes.forEach(node => {
      const nodeX = node.position.x + (node.width || 100) / 2;
      const nodeY = node.position.y + (node.height || 50) / 2;
      const distance = Math.sqrt(Math.pow(nodeX - sourceX, 2) + Math.pow(nodeY - sourceY, 2));

      if (distance < magnetDistance && distance < closestDistance) {
        closestDistance = distance;
        closestNode = node;
      }
    });

    if (!closestNode) {
      if (snappedNodeId) {
        setSnappedNodeId(null);
        onRelease?.();
      }
      return null;
    }

    const resolvedNode = closestNode as SnapNode;

    if (resolvedNode.id !== snappedNodeId) {
      const targetId = resolvedNode.id;
      setSnappedNodeId(targetId);
      onSnap?.(targetId);
      triggerHaptic('light');
    }

    return resolvedNode;
  }, [magnetDistance, snappedNodeId, onSnap, onRelease]);

  return { snappedNodeId, checkSnap };
}
