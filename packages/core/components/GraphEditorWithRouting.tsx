/**
 * React Flow integration with advanced edge routing
 * Story 1.28: Advanced Edge Routing
 * Demonstrates full integration with Performance Infrastructure
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
  Connection,
  addEdge,
  EdgeTypes,
  NodeTypes,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import EdgeRouter from './edges/EdgeRouter';
import { usePerformance } from '../hooks/usePerformance';
import {
  EdgeRoutingAlgorithm,
  EdgeRoutingConfig,
  RoutedEdge
} from '../types/edgeRouting';
import {
  getEdgeRoutingManager,
  applyRoutingToEdges
} from '../utils/routing/edgeRouting';
import { createAutoRouter } from '../utils/routing/autoRouter';

// Define edge types including our custom EdgeRouter
const edgeTypes: EdgeTypes = {
  routing: EdgeRouter
  // Add other edge types here
};

interface GraphEditorWithRoutingProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  enableAutoRouting?: boolean;
  defaultAlgorithm?: EdgeRoutingAlgorithm;
}

/**
 * Graph editor with advanced edge routing capabilities
 */
const GraphEditorWithRouting: React.FC<GraphEditorWithRoutingProps> = ({
  initialNodes = [],
  initialEdges = [],
  enableAutoRouting = false,
  defaultAlgorithm = 'bezier'
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<EdgeRoutingAlgorithm>(defaultAlgorithm);
  const [showControlPoints, setShowControlPoints] = useState(true);
  const [autoRoutingEnabled, setAutoRoutingEnabled] =
    useState(enableAutoRouting);
  const [routingStats, setRoutingStats] = useState<any>(null);

  const { perfMonitor } = usePerformance();
  const reactFlowInstance = useReactFlow();
  const routingManager = useMemo(() => getEdgeRoutingManager(), []);
  const autoRouter = useMemo(() => createAutoRouter(), []);

  // Apply routing to edges when they change
  useEffect(() => {
    const applyRouting = async () => {
      perfMonitor?.mark('routing:apply:start');

      // Create routing configs for edges
      const routingConfigs = new Map<string, EdgeRoutingConfig>();
      edges.forEach(edge => {
        if (!routingManager.getRoutingConfig(edge.id)) {
          routingConfigs.set(edge.id, {
            algorithm: selectedAlgorithm,
            controlPoints: [],
            style: {
              animated: autoRoutingEnabled,
              curvature: 0.25
            },
            constraints: {
              avoidNodes: true,
              snapToGrid: {
                enabled: false,
                gridSize: 10
              }
            },
            performance: {
              useCaching: true,
              useWorkers: true,
              maxCalculationTime: 100
            }
          });
        }
      });

      // Apply routing
      const routedEdges = await applyRoutingToEdges(
        edges,
        nodes,
        routingConfigs
      );

      // Update edges with routing data
      setEdges(
        routedEdges.map(edge => ({
          ...edge,
          type: 'routing',
          data: {
            ...edge.data,
            routing: {
              algorithm: selectedAlgorithm,
              showControlPoints,
              animated: autoRoutingEnabled,
              label: edge.data?.label
            },
            onControlPointMove: handleControlPointMove,
            performanceMetrics: edge.calculatedPath?.performance
          }
        }))
      );

      // Update stats
      const stats = routingManager.getCacheStats();
      setRoutingStats(stats);

      perfMonitor?.measureMarks('routing:apply:start', 'routing:apply:end');
    };

    applyRouting();
  }, [
    nodes,
    edges.length,
    selectedAlgorithm,
    showControlPoints,
    autoRoutingEnabled
  ]);

  // Handle auto-routing toggle
  useEffect(() => {
    if (autoRoutingEnabled) {
      autoRouter.start(edges, nodes);

      // Set up periodic updates
      const interval = setInterval(() => {
        autoRouter.optimizeRoutes(edges, nodes).then(result => {
          if (result) {
            setRoutingStats(prev => ({
              ...prev,
              crossings: result.totalCrossings,
              bends: result.totalBends,
              optimizationTime: result.optimizationTime
            }));
          }
        });
      }, 2000);

      return () => {
        clearInterval(interval);
        autoRouter.stop();
      };
    } else {
      autoRouter.stop();
    }
  }, [autoRoutingEnabled, edges, nodes, autoRouter]);

  // Handle edge connection
  const onConnect = useCallback(
    (params: Connection) => {
      perfMonitor?.measure('edge:connect', () => {
        const newEdge = {
          ...params,
          type: 'routing',
          data: {
            routing: {
              algorithm: selectedAlgorithm,
              showControlPoints,
              animated: autoRoutingEnabled
            }
          }
        };

        setEdges(eds => addEdge(newEdge, eds));
      });
    },
    [selectedAlgorithm, showControlPoints, autoRoutingEnabled, perfMonitor]
  );

  // Handle control point movement
  const handleControlPointMove = useCallback(
    (edgeId: string, pointId: string, position: { x: number; y: number }) => {
      routingManager.updateControlPoint(edgeId, pointId, position);

      // Trigger re-render
      setEdges(edges =>
        edges.map(edge =>
          edge.id === edgeId
            ? { ...edge, data: { ...edge.data, lastUpdate: Date.now() } }
            : edge
        )
      );
    },
    [routingManager]
  );

  // Clear routing cache
  const handleClearCache = useCallback(() => {
    routingManager.clearCache();
    setRoutingStats(routingManager.getCacheStats());
  }, [routingManager]);

  // Recalculate all routes
  const handleRecalculateRoutes = useCallback(async () => {
    perfMonitor?.mark('routing:recalculate:start');

    await routingManager.recalculateRoutes();

    // Re-apply routing
    const routedEdges = await applyRoutingToEdges(edges, nodes);
    setEdges(routedEdges);

    perfMonitor?.measureMarks(
      'routing:recalculate:start',
      'routing:recalculate:end'
    );
  }, [edges, nodes, routingManager, perfMonitor]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />

        {/* Routing Controls Panel */}
        <Panel position="top-left">
          <div
            style={{
              padding: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '8px',
              minWidth: '200px'
            }}
          >
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
              Edge Routing Controls
            </h4>

            {/* Algorithm selector */}
            <div style={{ marginBottom: '10px' }}>
              <label
                style={{
                  fontSize: '12px',
                  display: 'block',
                  marginBottom: '4px'
                }}
              >
                Algorithm:
              </label>
              <select
                value={selectedAlgorithm}
                onChange={e =>
                  setSelectedAlgorithm(e.target.value as EdgeRoutingAlgorithm)
                }
                style={{
                  width: '100%',
                  padding: '4px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="straight">Straight</option>
                <option value="bezier">Bezier</option>
                <option value="orthogonal">Orthogonal</option>
                <option value="step">Step</option>
                <option value="smart">Smart (AI)</option>
              </select>
            </div>

            {/* Options */}
            <div style={{ marginBottom: '10px' }}>
              <label
                style={{
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <input
                  type="checkbox"
                  checked={showControlPoints}
                  onChange={e => setShowControlPoints(e.target.checked)}
                  style={{ marginRight: '6px' }}
                />
                Show Control Points
              </label>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label
                style={{
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <input
                  type="checkbox"
                  checked={autoRoutingEnabled}
                  onChange={e => setAutoRoutingEnabled(e.target.checked)}
                  style={{ marginRight: '6px' }}
                />
                Auto-Routing {autoRoutingEnabled && '🔄'}
              </label>
            </div>

            {/* Actions */}
            <button
              onClick={handleRecalculateRoutes}
              style={{
                width: '100%',
                padding: '6px',
                marginBottom: '6px',
                fontSize: '12px',
                backgroundColor: '#1a73e8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Recalculate Routes
            </button>

            <button
              onClick={handleClearCache}
              style={{
                width: '100%',
                padding: '6px',
                fontSize: '12px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Cache
            </button>
          </div>
        </Panel>

        {/* Routing Statistics Panel */}
        {routingStats && (
          <Panel position="bottom-left">
            <div
              style={{
                padding: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                color: '#00ff00',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
            >
              <div>Cache Size: {routingStats.size}</div>
              <div>Hit Rate: {routingStats.hitRate?.toFixed(1)}%</div>
              <div>
                Avg Time: {routingStats.avgCalculationTime?.toFixed(1)}ms
              </div>
              {routingStats.crossings !== undefined && (
                <>
                  <div>Crossings: {routingStats.crossings}</div>
                  <div>Total Bends: {routingStats.bends}</div>
                </>
              )}
              {routingStats.optimizationTime && (
                <div>
                  Optimization: {routingStats.optimizationTime.toFixed(0)}ms
                </div>
              )}
            </div>
          </Panel>
        )}

        {/* Algorithm Info */}
        <Panel position="top-right">
          <div
            style={{
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '4px',
              fontSize: '11px'
            }}
          >
            <strong>Current: {selectedAlgorithm}</strong>
            <div style={{ marginTop: '4px', fontSize: '10px', color: '#666' }}>
              {selectedAlgorithm === 'bezier' && 'Smooth curves'}
              {selectedAlgorithm === 'orthogonal' && 'Right angles'}
              {selectedAlgorithm === 'step' && 'Step function'}
              {selectedAlgorithm === 'straight' && 'Direct lines'}
              {selectedAlgorithm === 'smart' && 'AI-optimized'}
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default GraphEditorWithRouting;

/**
 * Example usage:
 *
 * ```typescript
 * import GraphEditorWithRouting from '@/packages/core/components/GraphEditorWithRouting';
 *
 * function App() {
 *   const nodes = [
 *     { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
 *     { id: '2', position: { x: 200, y: 100 }, data: { label: 'Node 2' } },
 *     { id: '3', position: { x: 100, y: 200 }, data: { label: 'Node 3' } }
 *   ];
 *
 *   const edges = [
 *     { id: 'e1-2', source: '1', target: '2' },
 *     { id: 'e2-3', source: '2', target: '3' },
 *     { id: 'e3-1', source: '3', target: '1' }
 *   ];
 *
 *   return (
 *     <GraphEditorWithRouting
 *       initialNodes={nodes}
 *       initialEdges={edges}
 *       enableAutoRouting={true}
 *       defaultAlgorithm="bezier"
 *     />
 *   );
 * }
 * ```
 */
