/**
 * Hook for efficient node containment detection with caching
 * Integrates with Story 0.1 performance infrastructure
 */

import { useMemo, useRef, useCallback } from 'react';
import { Node } from 'reactflow';
import { PerformanceMonitor } from '../../../../../utils/performance/PerformanceMonitor';
import { Size, Position2D, UseNodeContainmentReturn } from '../types';
import { BOUNDING_BOX_CONSTANTS } from '../utils/constants';

const { CACHE_SIZE } = BOUNDING_BOX_CONSTANTS.performance;

interface ContainmentCache {
  key: string;
  nodes: Node[];
  timestamp: number;
}

export function useNodeContainment(
  boxId: string,
  allNodes: Node[],
  boxPosition: Position2D,
  boxSize: Size,
  expandedSize: Size,
  isCollapsed: boolean
): UseNodeContainmentReturn {
  const perfMonitor = PerformanceMonitor.getInstance();
  const cacheRef = useRef<Map<string, ContainmentCache>>(new Map());
  const hitCountRef = useRef(0);
  const missCountRef = useRef(0);

  // Use expanded size for containment check even when collapsed
  const checkSize = isCollapsed ? expandedSize : boxSize;

  const containedNodes = useMemo(() => {
    // Generate cache key based on relevant parameters
    const nodeIds = allNodes
      .map(n => n.id)
      .sort()
      .join(',');
    const cacheKey = `${boxId}:${nodeIds}:${boxPosition.x},${boxPosition.y}:${checkSize.width}x${checkSize.height}`;

    // Check cache first
    const cached = cacheRef.current.get(cacheKey);
    if (
      cached &&
      Date.now() - cached.timestamp <
        BOUNDING_BOX_CONSTANTS.performance.CACHE_TTL
    ) {
      hitCountRef.current++;
      perfMonitor.record('boundingBox.cacheHit', 1);
      console.debug(
        `[Cache Hit] Containment for ${boxId}: ${cached.nodes.length} nodes`
      );
      return cached.nodes;
    }

    // Cache miss - calculate containment
    missCountRef.current++;
    perfMonitor.record('boundingBox.cacheMiss', 1);

    const start = performance.now();

    // Find the bounding box node itself
    const thisBox = allNodes.find(n => n.id === boxId);
    if (!thisBox) return [];

    // Filter nodes that are contained within the bounding box
    const contained = allNodes.filter(node => {
      // Skip self and other bounding boxes
      if (
        node.id === boxId ||
        node.type === 'boundingBox' ||
        node.type === 'enhancedBoundingBox'
      ) {
        return false;
      }

      const nodeX = node.position.x;
      const nodeY = node.position.y;
      const nodeWidth = node.width || 150;
      const nodeHeight = node.height || 50;

      const boxX = thisBox.position.x;
      const boxY = thisBox.position.y;

      // Check if node is fully contained within the box
      const isContained =
        nodeX >= boxX &&
        nodeY >= boxY &&
        nodeX + nodeWidth <= boxX + checkSize.width &&
        nodeY + nodeHeight <= boxY + checkSize.height;

      return isContained;
    });

    const duration = performance.now() - start;
    perfMonitor.record('boundingBox.containmentCalc', duration);

    // Update cache
    const cacheEntry: ContainmentCache = {
      key: cacheKey,
      nodes: contained,
      timestamp: Date.now()
    };

    cacheRef.current.set(cacheKey, cacheEntry);

    // LRU cache eviction
    if (cacheRef.current.size > CACHE_SIZE) {
      const oldestKey = Array.from(cacheRef.current.keys())[0];
      cacheRef.current.delete(oldestKey);
      console.debug(`[Cache Eviction] Removed oldest entry: ${oldestKey}`);
    }

    console.debug(
      `[Cache Miss] Calculated containment for ${boxId}: ${contained.length} nodes in ${duration.toFixed(2)}ms`
    );

    return contained;
  }, [
    boxId,
    allNodes,
    boxPosition.x,
    boxPosition.y,
    checkSize.width,
    checkSize.height,
    isCollapsed
  ]);

  // Force recalculation
  const recalculate = useCallback(() => {
    cacheRef.current.clear();
    console.debug(`[Cache Clear] Forced recalculation for ${boxId}`);
  }, [boxId]);

  // Calculate cache hit rate
  const cacheHitRate = useMemo(() => {
    const total = hitCountRef.current + missCountRef.current;
    return total > 0 ? (hitCountRef.current / total) * 100 : 0;
  }, [containedNodes]); // Recalculate when nodes change

  return {
    containedNodes,
    recalculate,
    cacheHitRate
  };
}
