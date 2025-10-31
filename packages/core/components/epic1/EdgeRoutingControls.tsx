/**
 * Edge Routing Controls
 * Story 1.28: Advanced Edge Routing
 */

import React, { useState, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import './EdgeRoutingControls.css';

export type EdgeRoutingAlgorithm = 'bezier' | 'smoothstep' | 'straight' | 'step';

interface EdgeRoutingControlsProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const EdgeRoutingControls: React.FC<EdgeRoutingControlsProps> = ({
  position = 'top-right'
}) => {
  const { setEdges } = useReactFlow();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<EdgeRoutingAlgorithm>('bezier');
  const [showControlPoints, setShowControlPoints] = useState(false);
  const [animatedEdges, setAnimatedEdges] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Apply routing algorithm to all edges
  const applyRoutingAlgorithm = useCallback((algorithm: EdgeRoutingAlgorithm) => {
    setSelectedAlgorithm(algorithm);
    setEdges((edges) =>
      edges.map((edge) => ({
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
      }))
    );
  }, [setEdges, showControlPoints, animatedEdges]);

  // Toggle control points visibility
  const toggleControlPoints = useCallback(() => {
    const newValue = !showControlPoints;
    setShowControlPoints(newValue);
    setEdges((edges) =>
      edges.map((edge) => ({
        ...edge,
        data: {
          ...edge.data,
          routing: {
            ...edge.data?.routing,
            showControlPoints: newValue
          }
        }
      }))
    );
  }, [showControlPoints, setEdges]);

  // Toggle edge animation
  const toggleAnimation = useCallback(() => {
    const newValue = !animatedEdges;
    setAnimatedEdges(newValue);
    setEdges((edges) =>
      edges.map((edge) => ({
        ...edge,
        data: {
          ...edge.data,
          routing: {
            ...edge.data?.routing,
            animated: newValue
          }
        }
      }))
    );
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
    setEdges((edges) =>
      edges.map((edge) => ({
        ...edge,
        type: 'default',
        data: {
          ...edge.data,
          routing: undefined
        }
      }))
    );
  }, [setEdges]);

  const positionClass = `edge-routing-controls-${position.replace('-', ' ')}`;

  return (
    <div className={`edge-routing-controls ${positionClass} ${isExpanded ? 'expanded' : ''}`}>
      <div className="edge-routing-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="edge-routing-title">
          🔀 Edge Routing
        </span>
        <span className="edge-routing-toggle">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {isExpanded && (
        <div className="edge-routing-body">
          {/* Algorithm Selection */}
          <div className="edge-routing-section">
            <label className="edge-routing-label">Routing Style</label>
            <div className="edge-routing-buttons">
              <button
                className={`routing-btn ${selectedAlgorithm === 'bezier' ? 'active' : ''}`}
                onClick={() => applyRoutingAlgorithm('bezier')}
                title="Smooth bezier curves"
              >
                Bezier
              </button>
              <button
                className={`routing-btn ${selectedAlgorithm === 'smoothstep' ? 'active' : ''}`}
                onClick={() => applyRoutingAlgorithm('smoothstep')}
                title="Orthogonal routing with rounded corners"
              >
                Smooth
              </button>
              <button
                className={`routing-btn ${selectedAlgorithm === 'straight' ? 'active' : ''}`}
                onClick={() => applyRoutingAlgorithm('straight')}
                title="Direct straight lines"
              >
                Straight
              </button>
              <button
                className={`routing-btn ${selectedAlgorithm === 'step' ? 'active' : ''}`}
                onClick={() => applyRoutingAlgorithm('step')}
                title="Step/stair pattern"
              >
                Step
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="edge-routing-section">
            <label className="edge-routing-label">Options</label>
            <div className="edge-routing-options">
              <label className="edge-routing-checkbox">
                <input
                  type="checkbox"
                  checked={showControlPoints}
                  onChange={toggleControlPoints}
                />
                <span>Show Control Points</span>
              </label>
              <label className="edge-routing-checkbox">
                <input
                  type="checkbox"
                  checked={animatedEdges}
                  onChange={toggleAnimation}
                />
                <span>Animated Edges</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="edge-routing-section">
            <button className="routing-action-btn" onClick={autoRoute}>
              ⚡ Auto-Route
            </button>
            <button className="routing-action-btn" onClick={resetRouting}>
              🔄 Reset
            </button>
          </div>

          {/* Instructions */}
          <div className="edge-routing-help">
            <p>💡 Tips:</p>
            <ul>
              <li>Double-click edge to add control point (Bezier only)</li>
              <li>Drag control points to adjust curves</li>
              <li>Select edge to see routing algorithm</li>
              <li>Max 5 control points per edge</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
