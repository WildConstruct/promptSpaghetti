import React, { useState, useEffect, useCallback } from 'react';
import { useReactFlow, useStore } from 'reactflow';
import './PanZoomControls.css';

interface PanZoomControlsProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showMiniMap?: boolean;
}

/**
 * Pan and Zoom controls for Epic 1
 * Provides visual controls and feedback for navigation
 */
export const PanZoomControls: React.FC<PanZoomControlsProps> = ({ 
  position = 'bottom-right',
  showMiniMap = false 
}) => {
  const reactFlowInstance = useReactFlow();
  const [isPanning, setIsPanning] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  
  // Get viewport from store
  const viewport = useStore((state) => state.viewport);

  // Update zoom level when viewport changes
  useEffect(() => {
    setZoomLevel(Math.round(viewport.zoom * 100));
    setShowZoomIndicator(true);
    const timer = setTimeout(() => setShowZoomIndicator(false), 2000);
    return () => clearTimeout(timer);
  }, [viewport.zoom]);

  // Pan handlers
  const handlePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
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
    reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
  }, [reactFlowInstance]);

  const handleResetView = useCallback(() => {
    reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 });
  }, [reactFlowInstance]);

  // Space key handler for pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        setIsPanning(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
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

  return (
    <>
      {/* Pan/Zoom Control Panel */}
      <div className={`epic1-panzoom-controls ${position}`}>
        {/* Pan controls */}
        <div className="epic1-pan-controls">
          <button 
            className="epic1-pan-btn up"
            onClick={() => handlePan('up')}
            title="Pan up (↑)"
          >
            ↑
          </button>
          <div className="epic1-pan-center">
            <button 
              className="epic1-pan-btn left"
              onClick={() => handlePan('left')}
              title="Pan left (←)"
            >
              ←
            </button>
            <button 
              className="epic1-pan-btn center"
              onClick={handleResetView}
              title="Reset view"
            >
              ⊙
            </button>
            <button 
              className="epic1-pan-btn right"
              onClick={() => handlePan('right')}
              title="Pan right (→)"
            >
              →
            </button>
          </div>
          <button 
            className="epic1-pan-btn down"
            onClick={() => handlePan('down')}
            title="Pan down (↓)"
          >
            ↓
          </button>
        </div>

        {/* Zoom controls */}
        <div className="epic1-zoom-controls">
          <button 
            className="epic1-zoom-btn"
            onClick={handleZoomOut}
            title="Zoom out (⌘-)"
          >
            −
          </button>
          <span className="epic1-zoom-level">{zoomLevel}%</span>
          <button 
            className="epic1-zoom-btn"
            onClick={handleZoomIn}
            title="Zoom in (⌘+)"
          >
            +
          </button>
          <button 
            className="epic1-zoom-btn fit"
            onClick={handleFitView}
            title="Fit to view (⌘0)"
          >
            ⊡
          </button>
        </div>
      </div>

      {/* Pan mode indicator */}
      {isPanning && (
        <div className="epic1-pan-mode-overlay">
          <div className="epic1-pan-mode-content">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.5 1.29a1.5 1.5 0 0 1 3 0v6.21a1.5 1.5 0 0 1-3 0V1.29zM10.5 16.5a1.5 1.5 0 0 1 3 0v6.21a1.5 1.5 0 0 1-3 0V16.5zM1.29 10.5a1.5 1.5 0 0 1 0 3h6.21a1.5 1.5 0 0 1 0-3H1.29zM16.5 10.5a1.5 1.5 0 0 1 0 3h6.21a1.5 1.5 0 0 1 0-3H16.5z"/>
              <path d="M4.22 4.22a1.5 1.5 0 0 1 2.12 0l3.54 3.54a1.5 1.5 0 0 1-2.12 2.12L4.22 6.34a1.5 1.5 0 0 1 0-2.12zM14.12 14.12a1.5 1.5 0 0 1 2.12 0l3.54 3.54a1.5 1.5 0 0 1-2.12 2.12l-3.54-3.54a1.5 1.5 0 0 1 0-2.12zM19.78 4.22a1.5 1.5 0 0 1 0 2.12l-3.54 3.54a1.5 1.5 0 0 1-2.12-2.12l3.54-3.54a1.5 1.5 0 0 1 2.12 0zM9.88 14.12a1.5 1.5 0 0 1 0 2.12l-3.54 3.54a1.5 1.5 0 0 1-2.12-2.12l3.54-3.54a1.5 1.5 0 0 1 2.12 0z"/>
            </svg>
            <span>Pan Mode</span>
          </div>
        </div>
      )}

      {/* Zoom indicator */}
      {showZoomIndicator && (
        <div className={`epic1-zoom-indicator ${showZoomIndicator ? 'visible' : ''}`}>
          Zoom: {zoomLevel}%
        </div>
      )}

      {/* Mini map (optional) */}
      {showMiniMap && (
        <div className="epic1-minimap">
          {/* Mini map implementation would go here */}
          <div className="epic1-minimap-placeholder">
            Mini Map
          </div>
        </div>
      )}
    </>
  );
};

export default PanZoomControls;