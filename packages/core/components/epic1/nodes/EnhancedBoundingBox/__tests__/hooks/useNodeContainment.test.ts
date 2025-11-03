/**
 * Tests for useNodeContainment hook
 * Validates caching, performance, and containment detection
 */

import { renderHook, act } from '@testing-library/react';
import { useNodeContainment } from '../../hooks/useNodeContainment';
import { Node } from 'reactflow';
import { PerformanceMonitor } from '@/utils/performance/PerformanceMonitor';

// Mock PerformanceMonitor
jest.mock('@/utils/performance/PerformanceMonitor', () => ({
  PerformanceMonitor: {
    getInstance: jest.fn(() => ({
      record: jest.fn()
    }))
  }
}));

describe('useNodeContainment', () => {
  const mockPerfMonitor = {
    record: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (PerformanceMonitor.getInstance as jest.Mock).mockReturnValue(
      mockPerfMonitor
    );
  });

  const createMockNodes = (count: number): Node[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i === 0 ? 'box-1' : `node-${i}`,
      type: i === 0 ? 'enhancedBoundingBox' : 'default',
      position: { x: i * 100, y: i * 50 },
      data: {},
      width: 150,
      height: 50
    }));
  };

  describe('containment detection', () => {
    it('should correctly identify contained nodes', () => {
      const nodes = [
        {
          id: 'box-1',
          type: 'enhancedBoundingBox',
          position: { x: 0, y: 0 },
          data: {}
        },
        {
          id: 'node-1',
          type: 'default',
          position: { x: 50, y: 50 },
          width: 100,
          height: 40,
          data: {}
        },
        {
          id: 'node-2',
          type: 'default',
          position: { x: 500, y: 500 }, // Outside box
          width: 100,
          height: 40,
          data: {}
        }
      ] as Node[];

      const { result } = renderHook(() =>
        useNodeContainment(
          'box-1',
          nodes,
          { x: 0, y: 0 },
          { width: 400, height: 300 },
          { width: 400, height: 300 },
          false
        )
      );

      expect(result.current.containedNodes).toHaveLength(1);
      expect(result.current.containedNodes[0].id).toBe('node-1');
    });

    it('should exclude other bounding boxes from containment', () => {
      const nodes = [
        {
          id: 'box-1',
          type: 'enhancedBoundingBox',
          position: { x: 0, y: 0 },
          data: {}
        },
        {
          id: 'box-2',
          type: 'boundingBox',
          position: { x: 50, y: 50 },
          width: 100,
          height: 100,
          data: {}
        }
      ] as Node[];

      const { result } = renderHook(() =>
        useNodeContainment(
          'box-1',
          nodes,
          { x: 0, y: 0 },
          { width: 400, height: 300 },
          { width: 400, height: 300 },
          false
        )
      );

      expect(result.current.containedNodes).toHaveLength(0);
    });

    it('should use expanded size when collapsed', () => {
      const nodes = [
        {
          id: 'box-1',
          type: 'enhancedBoundingBox',
          position: { x: 0, y: 0 },
          data: {}
        },
        {
          id: 'node-1',
          type: 'default',
          position: { x: 50, y: 50 },
          width: 100,
          height: 40,
          data: {}
        }
      ] as Node[];

      const { result } = renderHook(() =>
        useNodeContainment(
          'box-1',
          nodes,
          { x: 0, y: 0 },
          { width: 100, height: 50 }, // Collapsed size
          { width: 400, height: 300 }, // Expanded size
          true // isCollapsed
        )
      );

      // Should still detect the node using expanded size
      expect(result.current.containedNodes).toHaveLength(1);
    });
  });

  describe('caching behavior', () => {
    it('should cache results and report cache hits', () => {
      const nodes = createMockNodes(5);

      const { result, rerender } = renderHook(
        ({ x, y }) =>
          useNodeContainment(
            'box-1',
            nodes,
            { x, y },
            { width: 400, height: 300 },
            { width: 400, height: 300 },
            false
          ),
        {
          initialProps: { x: 0, y: 0 }
        }
      );

      // Initial render records a miss and calculation
      expect(mockPerfMonitor.record).toHaveBeenCalledWith(
        'boundingBox.cacheMiss',
        1
      );
      expect(mockPerfMonitor.record).toHaveBeenCalledWith(
        'boundingBox.containmentCalc',
        expect.any(Number)
      );

      mockPerfMonitor.record.mockClear();

      // Move box to new position - another miss
      rerender({ x: 100, y: 0 });
      expect(mockPerfMonitor.record).toHaveBeenCalledWith(
        'boundingBox.cacheMiss',
        1
      );

      mockPerfMonitor.record.mockClear();

      // Return to original position - should hit cache
      rerender({ x: 0, y: 0 });
      expect(mockPerfMonitor.record).toHaveBeenCalledWith(
        'boundingBox.cacheHit',
        1
      );

      expect(result.current.cacheHitRate).toBeGreaterThan(0);
    });

    it('should invalidate cache when position changes', () => {
      const nodes = createMockNodes(5);

      const { rerender } = renderHook(
        ({ x, y }) =>
          useNodeContainment(
            'box-1',
            nodes,
            { x, y },
            { width: 400, height: 300 },
            { width: 400, height: 300 },
            false
          ),
        {
          initialProps: { x: 0, y: 0 }
        }
      );

      // Change position - should cause cache miss
      rerender({ x: 100, y: 100 });

      const calls = mockPerfMonitor.record.mock.calls;
      const cacheMissCalls = calls.filter(
        ([metric]) => metric === 'boundingBox.cacheMiss'
      );
      expect(cacheMissCalls.length).toBeGreaterThan(1);
    });

    it('should force recalculation when recalculate is called', () => {
      const baseNodes = createMockNodes(5);

      const { result, rerender } = renderHook(
        ({ nodes }) =>
          useNodeContainment(
            'box-1',
            nodes,
            { x: 0, y: 0 },
            { width: 400, height: 300 },
            { width: 400, height: 300 },
            false
          ),
        {
          initialProps: { nodes: baseNodes }
        }
      );

      // First computation registers a cache miss and calc duration
      expect(mockPerfMonitor.record).toHaveBeenCalledWith(
        'boundingBox.cacheMiss',
        1
      );
      expect(mockPerfMonitor.record).toHaveBeenCalledWith(
        'boundingBox.containmentCalc',
        expect.any(Number)
      );

      mockPerfMonitor.record.mockClear();

      // New array reference with same content should hit cache
      rerender({ nodes: [...baseNodes] });
      expect(mockPerfMonitor.record).toHaveBeenCalledWith(
        'boundingBox.cacheHit',
        1
      );

      mockPerfMonitor.record.mockClear();

      act(() => {
        result.current.recalculate();
      });

      // After clearing, the same data should trigger a fresh calculation
      rerender({ nodes: [...baseNodes] });
      expect(mockPerfMonitor.record).toHaveBeenCalledWith(
        'boundingBox.cacheMiss',
        1
      );
      expect(mockPerfMonitor.record).toHaveBeenCalledWith(
        'boundingBox.containmentCalc',
        expect.any(Number)
      );
    });
  });

  describe('performance tracking', () => {
    it('should track calculation time', () => {
      const nodes = createMockNodes(100); // Large number of nodes

      renderHook(() =>
        useNodeContainment(
          'box-1',
          nodes,
          { x: 0, y: 0 },
          { width: 1000, height: 1000 },
          { width: 1000, height: 1000 },
          false
        )
      );

      expect(mockPerfMonitor.record).toHaveBeenCalledWith(
        'boundingBox.containmentCalc',
        expect.any(Number)
      );
    });

    it('should report cache hit rate', () => {
      const nodes = createMockNodes(5);

      const { result, rerender } = renderHook(
        ({ x }) =>
          useNodeContainment(
            'box-1',
            nodes,
            { x, y: 0 },
            { width: 400, height: 300 },
            { width: 400, height: 300 },
            false
          ),
        {
          initialProps: { x: 0 }
        }
      );

      // Generate some cache hits
      rerender({ x: 0 }); // Hit
      rerender({ x: 0 }); // Hit
      rerender({ x: 1 }); // Miss
      rerender({ x: 0 }); // Hit

      expect(result.current.cacheHitRate).toBeGreaterThan(0);
      expect(result.current.cacheHitRate).toBeLessThanOrEqual(100);
    });
  });

  describe('edge cases', () => {
    it('should handle empty node list', () => {
      const { result } = renderHook(() =>
        useNodeContainment(
          'box-1',
          [],
          { x: 0, y: 0 },
          { width: 400, height: 300 },
          { width: 400, height: 300 },
          false
        )
      );

      expect(result.current.containedNodes).toEqual([]);
    });

    it('should handle missing bounding box node', () => {
      const nodes = createMockNodes(5);

      const { result } = renderHook(() =>
        useNodeContainment(
          'non-existent-box',
          nodes,
          { x: 0, y: 0 },
          { width: 400, height: 300 },
          { width: 400, height: 300 },
          false
        )
      );

      expect(result.current.containedNodes).toEqual([]);
    });

    it('should handle nodes without width/height', () => {
      const nodes = [
        {
          id: 'box-1',
          type: 'enhancedBoundingBox',
          position: { x: 0, y: 0 },
          data: {}
        },
        {
          id: 'node-1',
          type: 'default',
          position: { x: 50, y: 50 },
          // No width/height specified
          data: {}
        }
      ] as Node[];

      const { result } = renderHook(() =>
        useNodeContainment(
          'box-1',
          nodes,
          { x: 0, y: 0 },
          { width: 400, height: 300 },
          { width: 400, height: 300 },
          false
        )
      );

      // Should use default dimensions (150x50)
      expect(result.current.containedNodes).toHaveLength(1);
    });
  });
});
