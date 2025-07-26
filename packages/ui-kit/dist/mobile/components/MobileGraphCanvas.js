import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Mobile-optimized graph canvas
 */
import { useState, useRef, useEffect } from 'react';
import { TOUCH_TARGETS, mobileStyles, MOBILE_SPACING } from '../design-system';
import { MobileFAB } from './MobileButton';
import { cn } from '../../utils';
export const MobileGraphCanvas = ({ graph, selectedNodeId, onNodeSelect, onNodeEdit, onAddNode, readOnly = false, className, style }) => {
    const canvasRef = useRef(null);
    const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [showControls, setShowControls] = useState(true);
    const [isPanning, setIsPanning] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    // Touch handlers
    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            setTouchStart({ x: touch.clientX, y: touch.clientY });
            setIsPanning(true);
        }
    };
    const handleTouchMove = (e) => {
        if (!isPanning || !touchStart || e.touches.length !== 1)
            return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = touch.clientY - touchStart.y;
        setViewTransform(prev => ({
            ...prev,
            x: prev.x + deltaX,
            y: prev.y + deltaY
        }));
        setTouchStart({ x: touch.clientX, y: touch.clientY });
    };
    const handleTouchEnd = () => {
        setIsPanning(false);
        setTouchStart(null);
    };
    // Pinch zoom
    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.5, Math.min(2, viewTransform.scale * delta));
        setViewTransform(prev => ({
            ...prev,
            scale: newScale
        }));
    };
    // Node selection
    const handleNodeClick = (nodeId) => {
        onNodeSelect?.(nodeId);
        // Auto-open editor on mobile
        if (!readOnly) {
            setTimeout(() => {
                onNodeEdit?.(nodeId);
            }, 100);
        }
    };
    // Fit view
    const fitToView = () => {
        if (!canvasRef.current || !graph.nodes.length)
            return;
        const bounds = calculateGraphBounds(graph.nodes);
        const container = canvasRef.current.getBoundingClientRect();
        const scaleX = container.width / (bounds.width + 100);
        const scaleY = container.height / (bounds.height + 100);
        const scale = Math.min(scaleX, scaleY, 1);
        setViewTransform({
            x: (container.width - bounds.width * scale) / 2 - bounds.minX * scale,
            y: (container.height - bounds.height * scale) / 2 - bounds.minY * scale,
            scale
        });
    };
    // Center on selected node
    useEffect(() => {
        if (selectedNodeId && canvasRef.current) {
            const node = graph.nodes.find(n => n.id === selectedNodeId);
            if (node && node.position) {
                const container = canvasRef.current.getBoundingClientRect();
                setViewTransform(prev => ({
                    ...prev,
                    x: container.width / 2 - node.position.x * prev.scale,
                    y: container.height / 2 - node.position.y * prev.scale
                }));
            }
        }
    }, [selectedNodeId]);
    return (_jsxs("div", { ref: canvasRef, className: cn('mobile-graph-canvas', className), style: {
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            touchAction: 'none',
            backgroundColor: 'var(--color-surface)',
            ...style
        }, onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd, onWheel: handleWheel, children: [_jsxs("div", { className: "canvas-viewport", style: {
                    transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`,
                    transformOrigin: '0 0',
                    transition: isPanning ? 'none' : 'transform 0.2s ease',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }, children: [_jsx("svg", { style: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none'
                        }, children: graph.edges.map(edge => {
                            const sourceNode = graph.nodes.find(n => n.id === edge.source);
                            const targetNode = graph.nodes.find(n => n.id === edge.target);
                            if (!sourceNode?.position || !targetNode?.position)
                                return null;
                            return (_jsx("line", { x1: sourceNode.position.x + 60, y1: sourceNode.position.y + 30, x2: targetNode.position.x + 60, y2: targetNode.position.y + 30, stroke: "var(--color-border)", strokeWidth: 2 }, edge.id));
                        }) }), graph.nodes.map(node => (_jsx(MobileNode, { node: node, isSelected: node.id === selectedNodeId, onClick: () => handleNodeClick(node.id) }, node.id)))] }), showControls && (_jsxs("div", { className: "canvas-controls", style: {
                    position: 'absolute',
                    bottom: MOBILE_SPACING.md,
                    left: MOBILE_SPACING.md,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: MOBILE_SPACING.sm
                }, children: [_jsx("button", { onClick: () => setViewTransform(prev => ({ ...prev, scale: Math.min(2, prev.scale * 1.2) })), style: controlButtonStyle, "aria-label": "Zoom in", children: "+" }), _jsx("button", { onClick: () => setViewTransform(prev => ({ ...prev, scale: Math.max(0.5, prev.scale * 0.8) })), style: controlButtonStyle, "aria-label": "Zoom out", children: "\u2212" }), _jsx("button", { onClick: fitToView, style: controlButtonStyle, "aria-label": "Fit to view", children: "\u22A1" })] })), !readOnly && (_jsx(MobileFAB, { position: "bottom-right", onClick: onAddNode, hapticFeedback: true, children: "+" }))] }));
};
const MobileNode = ({ node, isSelected, onClick }) => {
    const nodeIcons = {
        subject: '👤',
        action: '⚡',
        attribute: '🏷️',
        weightedChoice: '🎲',
        output: '📤',
        concat: '🔗',
        variable: '📦'
    };
    return (_jsxs("div", { className: cn('mobile-node', isSelected && 'selected'), style: {
            position: 'absolute',
            left: node.position?.x || 0,
            top: node.position?.y || 0,
            width: 120,
            minHeight: TOUCH_TARGETS.large,
            padding: MOBILE_SPACING.sm,
            backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-background)',
            color: isSelected ? 'white' : 'var(--color-text)',
            border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            ...mobileStyles.tapHighlight,
            ...mobileStyles.noSelect
        }, onClick: onClick, children: [_jsx("div", { style: { fontSize: 24, marginBottom: 4 }, children: nodeIcons[node.type] || '📦' }), _jsx("div", { style: {
                    fontSize: 12,
                    fontWeight: 500,
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%'
                }, children: node.type })] }));
};
// Control button styles
const controlButtonStyle = {
    width: TOUCH_TARGETS.preferred,
    height: TOUCH_TARGETS.preferred,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    cursor: 'pointer',
    ...mobileStyles.tapHighlight
};
// Calculate graph bounds
function calculateGraphBounds(nodes) {
    if (!nodes.length)
        return { minX: 0, minY: 0, width: 0, height: 0 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
        if (node.position) {
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + 120);
            maxY = Math.max(maxY, node.position.y + 60);
        }
    });
    return {
        minX,
        minY,
        width: maxX - minX,
        height: maxY - minY
    };
}
//# sourceMappingURL=MobileGraphCanvas.js.map