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

  const containedNodes = useMemo(() => {
    const boxNode = allNodes.find(n => n.id === boxId);
    if (!boxNode) {
      return [];
    }

    const nodeGeoSignature = allNodes
      .map(
        n =>
          `${n.id}:${n.position?.x ?? 0}:${n.position?.y ?? 0}:${n.width ?? 0}:${n.height ?? 0}`
      )
      .sort()
      .join('|');
    const boxSignature = `${boxPosition.x}:${boxPosition.y}:${boxSize.width}:${boxSize.height}:${expandedSize.width}:${expandedSize.height}:${isCollapsed}`;
    const cacheKey = `${boxId}:${nodeGeoSignature}:${boxSignature}`;

    // Check cache first
    const cached = cacheRef.current.get(cacheKey);
    if (
      cached &&
      Date.now() - cached.timestamp <
        BOUNDING_BOX_CONSTANTS.performance.CACHE_TTL
    ) {
      hitCountRef.current++;
      perfMonitor.record('boundingBox.cacheHit', 1);
      return cached.nodes;
    }

    // Cache miss - calculate containment by parent relationship
    missCountRef.current++;
    perfMonitor.record('boundingBox.cacheMiss', 1);

    const start = performance.now();

    const checkSize = isCollapsed ? expandedSize : boxSize;
    const contained = allNodes.filter(node => {
      if (node.id === boxId) {
        return false;
      }

      // Region boxes only contain free nodes, never nested groups/containers.
      if (node.parentNode) {
        return false;
      }

      if (
        node.type === 'enhancedBoundingBox' ||
        node.type === 'boundingBox' ||
        node.type === 'fragmentContainer'
      ) {
        return false;
      }

      const nodeX = node.position?.x ?? 0;
      const nodeY = node.position?.y ?? 0;
      const nodeWidth = node.width ?? 0;
      const nodeHeight = node.height ?? 0;

      const withinHorizontal =
        nodeX >= boxPosition.x - 1 &&
        nodeX + nodeWidth <= boxPosition.x + checkSize.width + 1;
      const withinVertical =
        nodeY >= boxPosition.y - 1 &&
        nodeY + nodeHeight <= boxPosition.y + checkSize.height + 1;

      return withinHorizontal && withinVertical;
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
    }

    return contained;
  }, [
    allNodes,
    boxId,
    perfMonitor,
    boxPosition.x,
    boxPosition.y,
    boxSize.height,
    boxSize.width,
    expandedSize.height,
    expandedSize.width,
    isCollapsed
  ]);

  // Force recalculation
  const recalculate = useCallback(() => {
    cacheRef.current.clear();
    // Silent clear to avoid noisy logs during drag/resize
  }, [boxId]);

  // Calculate cache hit rate
  const totalLookups = hitCountRef.current + missCountRef.current;
  const cacheHitRate =
    totalLookups > 0 ? (hitCountRef.current / totalLookups) * 100 : 0;

  return {
    containedNodes,
    recalculate,
    cacheHitRate
  };
}
