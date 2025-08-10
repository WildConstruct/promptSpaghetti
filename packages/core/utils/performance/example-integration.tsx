/**
 * Example integration of Performance Infrastructure
 * Story 0.1: Performance Infrastructure
 * 
 * This file demonstrates how to integrate the performance infrastructure
 * into the existing graph editor components.
 */

import React, { useCallback, useEffect } from 'react';
import { 
  useCachedData, 
  useWorkerTask, 
  useRenderPerformance,
  usePerformance 
} from '../../hooks/usePerformance';
import { Node, Edge } from 'reactflow';

/**
 * Example: Optimized Edge Routing Component
 */
export const OptimizedEdgeRouting: React.FC<{
  edges: Edge[];
  nodes: Node[];
  onEdgesCalculated: (edges: Edge[]) => void;
}> = ({ edges, nodes, onEdgesCalculated }) => {
  const { perfMonitor } = usePerformance();
  const { measure } = useRenderPerformance('EdgeRouting');

  // Use worker for complex edge calculations
  const { result, execute } = useWorkerTask<Edge[]>(
    edges.length > 50 ? {
      type: 'OPTIMIZE_EDGE_ROUTING',
      data: { edges, nodes }
    } : null,
    {
      onSuccess: (optimizedEdges) => {
        perfMonitor?.record('edge:optimization', edges.length);
        onEdgesCalculated(optimizedEdges);
      }
    }
  );

  useEffect(() => {
    if (edges.length > 50) {
      execute();
    } else {
      // Simple calculation for small graphs
      measure('simple-routing', () => {
        onEdgesCalculated(edges);
      });
    }
  }, [edges, nodes]);

  return null; // This is a logic component
};

/**
 * Example: Cached Group Bounds Calculation
 */
export const CachedGroupBounds: React.FC<{
  groupId: string;
  nodeIds: string[];
  nodes: Node[];
  onBoundsCalculated: (bounds: any) => void;
}> = ({ groupId, nodeIds, nodes, onBoundsCalculated }) => {
  const cacheKey = `group:bounds:${groupId}:${nodeIds.join(',')}`;
  
  // Use cached data with automatic invalidation
  const { data: bounds, isLoading } = useCachedData(
    cacheKey,
    async () => {
      // This will be cached automatically
      const groupNodes = nodes.filter(n => nodeIds.includes(n.id));
      
      if (groupNodes.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
      }
      
      const xs = groupNodes.map(n => n.position.x);
      const ys = groupNodes.map(n => n.position.y);
      const rights = groupNodes.map(n => n.position.x + (n.width || 150));
      const bottoms = groupNodes.map(n => n.position.y + (n.height || 50));
      
      return {
        x: Math.min(...xs) - 20,
        y: Math.min(...ys) - 40,
        width: Math.max(...rights) - Math.min(...xs) + 40,
        height: Math.max(...bottoms) - Math.min(...ys) + 60
      };
    },
    {
      ttl: 60000, // Cache for 1 minute
      dependencies: [nodeIds, nodes] // Recalculate when these change
    }
  );

  useEffect(() => {
    if (!isLoading && bounds) {
      onBoundsCalculated(bounds);
    }
  }, [bounds, isLoading, onBoundsCalculated]);

  return null;
};

/**
 * Example: Performance-Optimized Graph Editor Integration
 */
export const PerformanceOptimizedGraphEditor: React.FC = () => {
  const { cache, workerPool, perfMonitor } = usePerformance();
  const { startMeasure, endMeasure } = useRenderPerformance('GraphEditor');

  // Example: Optimized node update with caching
  const updateNodePosition = useCallback(async (nodeId: string, position: { x: number; y: number }) => {
    startMeasure('node-update');
    
    // Cache the position for quick retrieval
    await cache?.set(`node:position:${nodeId}`, position, { ttl: 30000 });
    
    // Record performance metric
    const duration = endMeasure('node-update');
    
    if (duration > 50) {
      console.warn(`Slow node update: ${duration}ms`);
    }
  }, [cache, startMeasure, endMeasure]);

  // Example: Batch operations with worker pool
  const batchUpdateNodes = useCallback(async (updates: Array<{ id: string; position: { x: number; y: number } }>) => {
    if (updates.length > 20 && workerPool) {
      // Use worker for large batches
      const result = await workerPool.execute({
        type: 'BATCH_UPDATE_NODES',
        data: updates,
        priority: 1 // High priority
      });
      
      perfMonitor?.record('batch:update', updates.length);
      return result;
    } else {
      // Direct update for small batches
      return updates;
    }
  }, [workerPool, perfMonitor]);

  return (
    <div>
      {/* Your graph editor components here */}
      <p>Performance-optimized graph editor example</p>
    </div>
  );
};

/**
 * Example: How to integrate into existing GraphEditor component
 * 
 * In packages/core/GraphEditor.tsx, add:
 * 
 * ```typescript
 * import { usePerformance, useRenderPerformance } from './hooks/usePerformance';
 * 
 * export const GraphEditor: React.FC = () => {
 *   const { cache, workerPool, perfMonitor } = usePerformance();
 *   const { measure } = useRenderPerformance('GraphEditor');
 * 
 *   // Wrap expensive operations
 *   const onNodesChange = useCallback((changes) => {
 *     measure('nodes-change', () => {
 *       // Existing logic
 *     });
 *   }, [measure]);
 * 
 *   // Cache frequently accessed data
 *   useEffect(() => {
 *     cache?.set('graph:nodes', nodes, { ttl: 60000 });
 *   }, [nodes, cache]);
 * 
 *   // Use workers for heavy computations
 *   const calculateLayout = async () => {
 *     if (nodes.length > 100) {
 *       return workerPool?.execute({
 *         type: 'CALCULATE_LAYOUT',
 *         data: { nodes, edges }
 *       });
 *     }
 *     // Fallback to synchronous calculation
 *   };
 * };
 * ```
 */

/**
 * Example: Performance thresholds configuration
 */
export const setupPerformanceThresholds = (perfMonitor: any) => {
  // Set warning thresholds
  perfMonitor?.setThreshold({
    metric: 'render',
    maxValue: 200,
    action: 'warn',
    callback: (metric) => {
      console.warn(`Slow render detected: ${metric.value}ms`);
    }
  });

  perfMonitor?.setThreshold({
    metric: 'edge:calculation',
    maxValue: 50,
    action: 'error',
    callback: (metric) => {
      console.error(`Edge calculation too slow: ${metric.value}ms`);
    }
  });

  perfMonitor?.setThreshold({
    metric: 'group:operation',
    maxValue: 100,
    action: 'alert',
    callback: (metric) => {
      // Could show user notification
      console.log(`Group operation taking long: ${metric.value}ms`);
    }
  });
};