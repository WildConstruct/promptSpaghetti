/**
 * Magnetic Snap Handler
 * Provides magnetic snap behavior for node connections
 */
import { useEffect, useState, useCallback } from 'react';
import { useReactFlow, useStoreApi } from 'reactflow';
import { useMicroInteractions, triggerHaptic } from '../animations/MicroInteractions';
export const MagneticSnapHandler = ({ magnetDistance = 30, snapStrength = 0.8, enableHaptic = true }) => {
    const { getNodes, getEdges } = useReactFlow();
    const store = useStoreApi();
    const { trigger } = useMicroInteractions();
    const [isConnecting, setIsConnecting] = useState(false);
    const [lastSnapTarget, setLastSnapTarget] = useState(null);
    // Calculate distance between two points
    const getDistance = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };
    // Find the closest valid target handle
    const findClosestHandle = useCallback((sourceNode, mouseX, mouseY) => {
        const nodes = getNodes();
        let closestHandle = null;
        let closestDistance = Infinity;
        nodes.forEach(node => {
            if (node.id === sourceNode.id)
                return;
            // Calculate handle positions (simplified - assumes center handles)
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
    }, [getNodes, magnetDistance]);
    // Handle connection start
    useEffect(() => {
        const unsubscribe = store.subscribe(state => state.connectionNodeId, connectionNodeId => {
            setIsConnecting(!!connectionNodeId);
            if (!connectionNodeId) {
                setLastSnapTarget(null);
            }
        });
        return unsubscribe;
    }, [store]);
    // Monitor mouse position during connection
    useEffect(() => {
        if (!isConnecting)
            return;
        const handleMouseMove = (event) => {
            const state = store.getState();
            const connectionNodeId = state.connectionNodeId;
            if (!connectionNodeId)
                return;
            const sourceNode = getNodes().find(n => n.id === connectionNodeId);
            if (!sourceNode)
                return;
            // Get viewport-adjusted mouse position
            const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
            if (!reactFlowBounds)
                return;
            const viewportX = event.clientX - reactFlowBounds.left;
            const viewportY = event.clientY - reactFlowBounds.top;
            // Find closest handle
            const closestHandle = findClosestHandle(sourceNode, viewportX, viewportY);
            if (closestHandle && closestHandle.distance < magnetDistance) {
                // Apply magnetic effect
                const snapFactor = 1 - (closestHandle.distance / magnetDistance) * (1 - snapStrength);
                // Trigger snap feedback if this is a new target
                if (closestHandle.nodeId !== lastSnapTarget) {
                    trigger('snap', closestHandle.x, closestHandle.y, {
                        nodeId: closestHandle.nodeId,
                        haptic: enableHaptic ? 'light' : undefined
                    });
                    setLastSnapTarget(closestHandle.nodeId);
                }
                // Visual feedback: update connection line endpoint
                // This would need React Flow internal API access for full implementation
            }
            else {
                setLastSnapTarget(null);
            }
        };
        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, [isConnecting, findClosestHandle, trigger, lastSnapTarget, magnetDistance, snapStrength, enableHaptic, store, getNodes]);
    return null; // This is a behavior component, no visual output
};
// Hook for programmatic snap detection
export function useMagneticSnap(options) {
    const [snappedNodeId, setSnappedNodeId] = useState(null);
    const { magnetDistance = 30, onSnap, onRelease } = options || {};
    const checkSnap = useCallback((sourceX, sourceY, nodes) => {
        let closestNode = null;
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
        if (closestNode && closestNode.id !== snappedNodeId) {
            setSnappedNodeId(closestNode.id);
            onSnap?.(closestNode.id);
            triggerHaptic('light');
        }
        else if (!closestNode && snappedNodeId) {
            setSnappedNodeId(null);
            onRelease?.();
        }
        return closestNode;
    }, [magnetDistance, snappedNodeId, onSnap, onRelease]);
    return { snappedNodeId, checkSnap };
}
