/**
 * Hook for auto-layout functionality
 * Story 1.32: Auto-Layout and Node Positioning System
 */
import { useCallback, useRef } from 'react';
import { useReactFlow } from 'reactflow';
import { applyLayoutWithAnimation, selectBestLayout, layoutNewNodes, } from '../../../utils/layoutAlgorithms';
export function useAutoLayout(options = {}) {
    const { defaultAlgorithm = 'dagre', debounceMs = 100 } = options;
    const { setNodes, getNodes, getEdges, fitView } = useReactFlow();
    const isLayoutingRef = useRef(false);
    const layoutTimeoutRef = useRef();
    /**
     * Core cleanup function with debouncing
     */
    const cleanupNodesInternal = useCallback((nodesToClean, algorithm) => {
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
            const relevantEdges = edges.filter((edge) => targetNodeIds.has(edge.source) && targetNodeIds.has(edge.target));
            // Select best algorithm if not specified
            const layoutAlgorithm = algorithm || selectBestLayout(targetNodes, relevantEdges);
            // Apply layout with animation
            const layoutedNodes = applyLayoutWithAnimation(targetNodes, layoutAlgorithm, relevantEdges, { animate: true });
            // Update all nodes
            setNodes((currentNodes) => {
                const layoutMap = new Map(layoutedNodes.map((node) => [node.id, node]));
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
    }, [setNodes, getNodes, getEdges, fitView, debounceMs]);
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
    const layoutDroppedNodes = useCallback((newNodes, dropPosition) => {
        const existingNodes = getNodes();
        const edges = getEdges();
        // Extract edges between new nodes
        const newNodeIds = new Set(newNodes.map((n) => n.id));
        const newEdges = edges.filter((edge) => newNodeIds.has(edge.source) && newNodeIds.has(edge.target));
        // Layout the new nodes
        const layoutedNodes = layoutNewNodes(existingNodes, newNodes, dropPosition, newEdges);
        return layoutedNodes;
    }, [getNodes, getEdges]);
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
    HORIZONTAL: { direction: 'LR', nodeSpacing: 100, rankSpacing: 150 },
    VERTICAL: { direction: 'TB', nodeSpacing: 100, rankSpacing: 150 },
    COMPACT: { direction: 'LR', nodeSpacing: 60, rankSpacing: 100 },
    SPACIOUS: { direction: 'LR', nodeSpacing: 150, rankSpacing: 200 },
};
