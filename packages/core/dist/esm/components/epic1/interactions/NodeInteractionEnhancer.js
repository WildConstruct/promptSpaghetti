import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Node Interaction Enhancer
 * Adds enhanced interactions like bounce, hover states, and click feedback
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useReactFlow, useOnSelectionChange } from 'reactflow';
import { useMicroInteractions, triggerHaptic } from '../animations/MicroInteractions';
export const NodeInteractionEnhancer = ({ nodeId, enableBounce = true, enableHoverEffects = true, enableClickFeedback = true, enableHaptic = true, children }) => {
    const nodeRef = useRef(null);
    const { trigger } = useMicroInteractions();
    const { getNode } = useReactFlow();
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
    const [isNewNode, setIsNewNode] = useState(true);
    // Bounce on creation
    useEffect(() => {
        if (enableBounce && isNewNode) {
            const node = getNode(nodeId);
            if (node) {
                const centerX = node.position.x + (node.width || 100) / 2;
                const centerY = node.position.y + (node.height || 50) / 2;
                trigger('bounce', centerX, centerY, {
                    nodeId,
                    haptic: enableHaptic ? 'medium' : undefined
                });
                setIsNewNode(false);
            }
        }
    }, [nodeId, enableBounce, enableHaptic, trigger, getNode, isNewNode]);
    // Enhanced hover tracking
    const handleMouseMove = useCallback((e) => {
        if (!enableHoverEffects || !nodeRef.current)
            return;
        const rect = nodeRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
    }, [enableHoverEffects]);
    const handleMouseEnter = useCallback((e) => {
        setIsHovered(true);
        if (enableHoverEffects) {
            const rect = nodeRef.current?.getBoundingClientRect();
            if (rect) {
                trigger('hover', rect.left + rect.width / 2, rect.top + rect.height / 2, {
                    nodeId,
                    haptic: enableHaptic ? 'light' : undefined
                });
            }
        }
    }, [enableHoverEffects, enableHaptic, trigger, nodeId]);
    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);
    const handleClick = useCallback((e) => {
        if (enableClickFeedback) {
            trigger('click', e.clientX, e.clientY, {
                nodeId,
                haptic: enableHaptic ? 'light' : undefined
            });
        }
    }, [enableClickFeedback, enableHaptic, trigger, nodeId]);
    // Apply dynamic CSS variables for hover effects
    useEffect(() => {
        if (nodeRef.current && enableHoverEffects) {
            nodeRef.current.style.setProperty('--mouse-x', `${mousePosition.x}%`);
            nodeRef.current.style.setProperty('--mouse-y', `${mousePosition.y}%`);
        }
    }, [mousePosition, enableHoverEffects]);
    return (_jsxs("div", { ref: nodeRef, className: `node-interaction-enhancer ${isHovered ? 'hovered' : ''}`, onMouseMove: handleMouseMove, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, onClick: handleClick, style: {
            width: '100%',
            height: '100%',
            position: 'relative'
        }, children: [children, isHovered && enableHoverEffects && (_jsx("div", { className: "hover-hint", style: {
                    position: 'absolute',
                    bottom: -25,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 11,
                    color: '#666',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    opacity: 0.8
                }, children: "Double-click to edit" }))] }));
};
// Hook for managing node interactions globally
export function useNodeInteractions() {
    const { getNodes, addNodes, setNodes } = useReactFlow();
    const { trigger } = useMicroInteractions();
    const addNodeWithBounce = useCallback((node) => {
        // Handle both node object and node ID
        if (typeof node === 'string') {
            // Just a node ID, skip bounce effect
            return;
        }
        // Ensure position exists
        if (!node.position) {
            console.warn('Cannot add bounce effect: node missing position');
            return;
        }
        // Add node first
        addNodes(node);
        // Then trigger bounce effect
        setTimeout(() => {
            const centerX = node.position.x + (node.width || 100) / 2;
            const centerY = node.position.y + (node.height || 50) / 2;
            trigger('bounce', centerX, centerY, {
                nodeId: node.id,
                haptic: 'medium'
            });
        }, 50);
    }, [addNodes, trigger]);
    const highlightConnection = useCallback((sourceId, targetId) => {
        const sourceNode = getNodes().find(n => n.id === sourceId);
        const targetNode = getNodes().find(n => n.id === targetId);
        if (sourceNode && targetNode) {
            const sourceX = sourceNode.position.x + (sourceNode.width || 100) / 2;
            const sourceY = sourceNode.position.y + (sourceNode.height || 50) / 2;
            const targetX = targetNode.position.x + (targetNode.width || 100) / 2;
            const targetY = targetNode.position.y + (targetNode.height || 50) / 2;
            trigger('connect', sourceX, sourceY, {
                targetX,
                targetY,
                haptic: 'light'
            });
        }
    }, [getNodes, trigger]);
    const showDragTrail = useCallback((x, y) => {
        trigger('drag', x, y);
    }, [trigger]);
    return {
        addNodeWithBounce,
        highlightConnection,
        showDragTrail
    };
}
// Selection feedback component
export const SelectionFeedback = () => {
    const { trigger } = useMicroInteractions();
    useOnSelectionChange({
        onChange: ({ nodes, edges }) => {
            if (nodes.length > 0) {
                // Trigger subtle haptic on selection
                triggerHaptic('light');
                // Visual feedback for multi-select
                if (nodes.length > 1) {
                    const centerX = nodes.reduce((sum, n) => sum + n.position.x, 0) / nodes.length;
                    const centerY = nodes.reduce((sum, n) => sum + n.position.y, 0) / nodes.length;
                    trigger('hover', centerX, centerY, {
                        message: `${nodes.length} nodes selected`
                    });
                }
            }
        }
    });
    return null;
};
