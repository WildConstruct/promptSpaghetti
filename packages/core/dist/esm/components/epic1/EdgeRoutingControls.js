import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Edge Routing Controls
 * Story 1.28: Advanced Edge Routing
 */
import { useState, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import './EdgeRoutingControls.css';
export const EdgeRoutingControls = ({ position = 'top-right' }) => {
    const { getEdges, setEdges } = useReactFlow();
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('bezier');
    const [showControlPoints, setShowControlPoints] = useState(false);
    const [animatedEdges, setAnimatedEdges] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    // Apply routing algorithm to all edges
    const applyRoutingAlgorithm = useCallback((algorithm) => {
        setSelectedAlgorithm(algorithm);
        setEdges((edges) => edges.map((edge) => ({
            ...edge,
            type: 'advanced',
            data: {
                ...edge.data,
                routing: {
                    ...edge.data?.routing,
                    algorithm,
                    showControlPoints,
                    animated: animatedEdges
                }
            }
        })));
    }, [setEdges, showControlPoints, animatedEdges]);
    // Toggle control points visibility
    const toggleControlPoints = useCallback(() => {
        const newValue = !showControlPoints;
        setShowControlPoints(newValue);
        setEdges((edges) => edges.map((edge) => ({
            ...edge,
            data: {
                ...edge.data,
                routing: {
                    ...edge.data?.routing,
                    showControlPoints: newValue
                }
            }
        })));
    }, [showControlPoints, setEdges]);
    // Toggle edge animation
    const toggleAnimation = useCallback(() => {
        const newValue = !animatedEdges;
        setAnimatedEdges(newValue);
        setEdges((edges) => edges.map((edge) => ({
            ...edge,
            data: {
                ...edge.data,
                routing: {
                    ...edge.data?.routing,
                    animated: newValue
                }
            }
        })));
    }, [animatedEdges, setEdges]);
    // Auto-route to minimize crossings
    const autoRoute = useCallback(() => {
        // Simple auto-routing: use smoothstep for better appearance
        applyRoutingAlgorithm('smoothstep');
    }, [applyRoutingAlgorithm]);
    // Reset to default routing
    const resetRouting = useCallback(() => {
        setSelectedAlgorithm('bezier');
        setShowControlPoints(false);
        setAnimatedEdges(false);
        setEdges((edges) => edges.map((edge) => ({
            ...edge,
            type: 'default',
            data: {
                ...edge.data,
                routing: undefined
            }
        })));
    }, [setEdges]);
    const positionClass = `edge-routing-controls-${position.replace('-', ' ')}`;
    return (_jsxs("div", { className: `edge-routing-controls ${positionClass} ${isExpanded ? 'expanded' : ''}`, children: [_jsxs("div", { className: "edge-routing-header", onClick: () => setIsExpanded(!isExpanded), children: [_jsx("span", { className: "edge-routing-title", children: "\uD83D\uDD00 Edge Routing" }), _jsx("span", { className: "edge-routing-toggle", children: isExpanded ? '▼' : '▶' })] }), isExpanded && (_jsxs("div", { className: "edge-routing-body", children: [_jsxs("div", { className: "edge-routing-section", children: [_jsx("label", { className: "edge-routing-label", children: "Routing Style" }), _jsxs("div", { className: "edge-routing-buttons", children: [_jsx("button", { className: `routing-btn ${selectedAlgorithm === 'bezier' ? 'active' : ''}`, onClick: () => applyRoutingAlgorithm('bezier'), title: "Smooth bezier curves", children: "Bezier" }), _jsx("button", { className: `routing-btn ${selectedAlgorithm === 'smoothstep' ? 'active' : ''}`, onClick: () => applyRoutingAlgorithm('smoothstep'), title: "Orthogonal routing with rounded corners", children: "Smooth" }), _jsx("button", { className: `routing-btn ${selectedAlgorithm === 'straight' ? 'active' : ''}`, onClick: () => applyRoutingAlgorithm('straight'), title: "Direct straight lines", children: "Straight" }), _jsx("button", { className: `routing-btn ${selectedAlgorithm === 'step' ? 'active' : ''}`, onClick: () => applyRoutingAlgorithm('step'), title: "Step/stair pattern", children: "Step" })] })] }), _jsxs("div", { className: "edge-routing-section", children: [_jsx("label", { className: "edge-routing-label", children: "Options" }), _jsxs("div", { className: "edge-routing-options", children: [_jsxs("label", { className: "edge-routing-checkbox", children: [_jsx("input", { type: "checkbox", checked: showControlPoints, onChange: toggleControlPoints }), _jsx("span", { children: "Show Control Points" })] }), _jsxs("label", { className: "edge-routing-checkbox", children: [_jsx("input", { type: "checkbox", checked: animatedEdges, onChange: toggleAnimation }), _jsx("span", { children: "Animated Edges" })] })] })] }), _jsxs("div", { className: "edge-routing-section", children: [_jsx("button", { className: "routing-action-btn", onClick: autoRoute, children: "\u26A1 Auto-Route" }), _jsx("button", { className: "routing-action-btn", onClick: resetRouting, children: "\uD83D\uDD04 Reset" })] }), _jsxs("div", { className: "edge-routing-help", children: [_jsx("p", { children: "\uD83D\uDCA1 Tips:" }), _jsxs("ul", { children: [_jsx("li", { children: "Double-click edge to add control point (Bezier only)" }), _jsx("li", { children: "Drag control points to adjust curves" }), _jsx("li", { children: "Select edge to see routing algorithm" }), _jsx("li", { children: "Max 5 control points per edge" })] })] })] }))] }));
};
