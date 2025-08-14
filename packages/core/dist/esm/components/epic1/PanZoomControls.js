import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useReactFlow, useStore } from 'reactflow';
import './PanZoomControls.css';
/**
 * Pan and Zoom controls for Epic 1
 * Provides visual controls and feedback for navigation
 */
export const PanZoomControls = ({ position = 'bottom-right', showMiniMap = false }) => {
    const reactFlowInstance = useReactFlow();
    const [isPanning, setIsPanning] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showZoomIndicator, setShowZoomIndicator] = useState(false);
    // Get viewport from store with safety check
    const viewport = useStore((state) => state?.viewport);
    // Update zoom level when viewport changes
    useEffect(() => {
        if (!viewport?.zoom)
            return;
        setZoomLevel(Math.round(viewport.zoom * 100));
        setShowZoomIndicator(true);
        const timer = setTimeout(() => setShowZoomIndicator(false), 2000);
        return () => clearTimeout(timer);
    }, [viewport?.zoom]);
    // Pan handlers
    const handlePan = useCallback((direction) => {
        const currentViewport = reactFlowInstance.getViewport();
        const panDistance = 100;
        const updates = {
            up: { y: currentViewport.y + panDistance },
            down: { y: currentViewport.y - panDistance },
            left: { x: currentViewport.x + panDistance },
            right: { x: currentViewport.x - panDistance },
        };
        reactFlowInstance.setViewport({
            ...currentViewport,
            ...updates[direction]
        });
    }, [reactFlowInstance]);
    // Zoom handlers
    const handleZoomIn = useCallback(() => {
        reactFlowInstance.zoomIn();
    }, [reactFlowInstance]);
    const handleZoomOut = useCallback(() => {
        reactFlowInstance.zoomOut();
    }, [reactFlowInstance]);
    const handleFitView = useCallback(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
    }, [reactFlowInstance]);
    const handleResetView = useCallback(() => {
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
    }, [reactFlowInstance]);
    // Space key handler for pan mode
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && !e.repeat) {
                setIsPanning(true);
            }
        };
        const handleKeyUp = (e) => {
            if (e.code === 'Space') {
                setIsPanning(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: `epic1-panzoom-controls ${position}`, children: [_jsxs("div", { className: "epic1-pan-controls", children: [_jsx("button", { className: "epic1-pan-btn up", onClick: () => handlePan('up'), title: "Pan up (\u2191)", children: "\u2191" }), _jsxs("div", { className: "epic1-pan-center", children: [_jsx("button", { className: "epic1-pan-btn left", onClick: () => handlePan('left'), title: "Pan left (\u2190)", children: "\u2190" }), _jsx("button", { className: "epic1-pan-btn center", onClick: handleResetView, title: "Reset view", children: "\u2299" }), _jsx("button", { className: "epic1-pan-btn right", onClick: () => handlePan('right'), title: "Pan right (\u2192)", children: "\u2192" })] }), _jsx("button", { className: "epic1-pan-btn down", onClick: () => handlePan('down'), title: "Pan down (\u2193)", children: "\u2193" })] }), _jsxs("div", { className: "epic1-zoom-controls", children: [_jsx("button", { className: "epic1-zoom-btn", onClick: handleZoomOut, title: "Zoom out (\u2318-)", children: "\u2212" }), _jsxs("span", { className: "epic1-zoom-level", children: [zoomLevel, "%"] }), _jsx("button", { className: "epic1-zoom-btn", onClick: handleZoomIn, title: "Zoom in (\u2318+)", children: "+" }), _jsx("button", { className: "epic1-zoom-btn fit", onClick: handleFitView, title: "Fit to view (\u23180)", children: "\u22A1" })] })] }), isPanning && (_jsx("div", { className: "epic1-pan-mode-overlay", children: _jsxs("div", { className: "epic1-pan-mode-content", children: [_jsxs("svg", { viewBox: "0 0 24 24", fill: "currentColor", children: [_jsx("path", { d: "M10.5 1.29a1.5 1.5 0 0 1 3 0v6.21a1.5 1.5 0 0 1-3 0V1.29zM10.5 16.5a1.5 1.5 0 0 1 3 0v6.21a1.5 1.5 0 0 1-3 0V16.5zM1.29 10.5a1.5 1.5 0 0 1 0 3h6.21a1.5 1.5 0 0 1 0-3H1.29zM16.5 10.5a1.5 1.5 0 0 1 0 3h6.21a1.5 1.5 0 0 1 0-3H16.5z" }), _jsx("path", { d: "M4.22 4.22a1.5 1.5 0 0 1 2.12 0l3.54 3.54a1.5 1.5 0 0 1-2.12 2.12L4.22 6.34a1.5 1.5 0 0 1 0-2.12zM14.12 14.12a1.5 1.5 0 0 1 2.12 0l3.54 3.54a1.5 1.5 0 0 1-2.12 2.12l-3.54-3.54a1.5 1.5 0 0 1 0-2.12zM19.78 4.22a1.5 1.5 0 0 1 0 2.12l-3.54 3.54a1.5 1.5 0 0 1-2.12-2.12l3.54-3.54a1.5 1.5 0 0 1 2.12 0zM9.88 14.12a1.5 1.5 0 0 1 0 2.12l-3.54 3.54a1.5 1.5 0 0 1-2.12-2.12l3.54-3.54a1.5 1.5 0 0 1 2.12 0z" })] }), _jsx("span", { children: "Pan Mode" })] }) })), showZoomIndicator && (_jsxs("div", { className: `epic1-zoom-indicator ${showZoomIndicator ? 'visible' : ''}`, children: ["Zoom: ", zoomLevel, "%"] })), showMiniMap && (_jsx("div", { className: "epic1-minimap", children: _jsx("div", { className: "epic1-minimap-placeholder", children: "Mini Map" }) }))] }));
};
export default PanZoomControls;
