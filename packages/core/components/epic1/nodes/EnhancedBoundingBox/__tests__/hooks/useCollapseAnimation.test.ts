/**
 * Tests for useCollapseAnimation hook
 * Validates RAF-based animations and performance
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCollapseAnimation } from '../../hooks/useCollapseAnimation';
import { PerformanceMonitor } from '../../../../../utils/performance/PerformanceMonitor';

// Mock PerformanceMonitor
jest.mock('../../../../../utils/performance/PerformanceMonitor', () => ({
  PerformanceMonitor: {
    getInstance: jest.fn(() => ({
      record: jest.fn()
    }))
  }
}));

// Mock requestAnimationFrame for testing
let rafCallbacks: FrameRequestCallback[] = [];
let rafId = 0;

global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
  rafCallbacks.push(callback);
  return ++rafId;
});

global.cancelAnimationFrame = jest.fn((id: number) => {
  // Remove callback
});

global.performance.now = jest.fn(() => Date.now());

describe('useCollapseAnimation', () => {
  const mockPerfMonitor = {
    record: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    rafCallbacks = [];
    rafId = 0;
    (PerformanceMonitor.getInstance as jest.Mock).mockReturnValue(
      mockPerfMonitor
    );
  });

  const expandedSize = { width: 400, height: 300 };
  const collapsedSize = { width: 280, height: 90 };

  describe('initial state', () => {
    it('should start with collapsed size when isCollapsed is true', () => {
      const { result } = renderHook(() =>
        useCollapseAnimation(true, expandedSize)
      );

      expect(result.current.size.width).toBe(280);
      expect(result.current.size.height).toBe(90);
      expect(result.current.isAnimating).toBe(false);
    });

    it('should start with expanded size when isCollapsed is false', () => {
      const { result } = renderHook(() =>
        useCollapseAnimation(false, expandedSize)
      );

      expect(result.current.size.width).toBe(400);
      expect(result.current.size.height).toBe(300);
      expect(result.current.isAnimating).toBe(false);
    });
  });

  describe('animation trigger', () => {
    it('should start animation when collapsed state changes', async () => {
      const { result, rerender } = renderHook(
        ({ isCollapsed }) => useCollapseAnimation(isCollapsed, expandedSize),
        { initialProps: { isCollapsed: false } }
      );

      // Change collapsed state
      rerender({ isCollapsed: true });

      await waitFor(() => {
        expect(result.current.isAnimating).toBe(true);
      });

      expect(mockPerfMonitor.record).toHaveBeenCalledWith(
        'boundingBox.animationStart',
        1
      );
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should not animate if collapsed state does not change', () => {
      const { result, rerender } = renderHook(
        ({ isCollapsed }) => useCollapseAnimation(isCollapsed, expandedSize),
        { initialProps: { isCollapsed: false } }
      );

      // Rerender with same state
      rerender({ isCollapsed: false });

      expect(result.current.isAnimating).toBe(false);
      expect(mockPerfMonitor.record).not.toHaveBeenCalledWith(
        'boundingBox.animationStart',
        1
      );
    });
  });

  describe('animation progression', () => {
    it('should animate from expanded to collapsed size', async () => {
      const { result, rerender } = renderHook(
        ({ isCollapsed }) => useCollapseAnimation(isCollapsed, expandedSize),
        { initialProps: { isCollapsed: false } }
      );

      // Trigger collapse animation
      rerender({ isCollapsed: true });

      // Simulate animation frames
      act(() => {
        const now = performance.now();

        // Start of animation
        rafCallbacks[0]?.(now);
      });

      // Size should be changing
      expect(result.current.size.width).toBeLessThan(400);
      expect(result.current.size.height).toBeLessThan(300);

      // Simulate end of animation (200ms later)
      act(() => {
        const endTime = performance.now() + 200;
        rafCallbacks[rafCallbacks.length - 1]?.(endTime);
      });

      await waitFor(() => {
        expect(result.current.isAnimating).toBe(false);
        expect(result.current.size.width).toBe(280);
        expect(result.current.size.height).toBe(90);
      });

      expect(mockPerfMonitor.record).toHaveBeenCalledWith(
        'boundingBox.animationComplete',
        1
      );
    });

    it('should animate from collapsed to expanded size', async () => {
      const { result, rerender } = renderHook(
        ({ isCollapsed }) => useCollapseAnimation(isCollapsed, expandedSize),
        { initialProps: { isCollapsed: true } }
      );

      // Trigger expand animation
      rerender({ isCollapsed: false });

      // Simulate animation frames
      act(() => {
        const now = performance.now();
        rafCallbacks[0]?.(now);
      });

      // Size should be changing
      expect(result.current.size.width).toBeGreaterThan(280);
      expect(result.current.size.height).toBeGreaterThan(90);

      // Simulate end of animation
      act(() => {
        const endTime = performance.now() + 200;
        rafCallbacks[rafCallbacks.length - 1]?.(endTime);
      });

      await waitFor(() => {
        expect(result.current.isAnimating).toBe(false);
        expect(result.current.size.width).toBe(400);
        expect(result.current.size.height).toBe(300);
      });
    });
  });

  describe('animation callback', () => {
    it('should call onAnimationComplete when animation finishes', async () => {
      const onComplete = jest.fn();

      const { rerender } = renderHook(
        ({ isCollapsed }) =>
          useCollapseAnimation(isCollapsed, expandedSize, onComplete),
        { initialProps: { isCollapsed: false } }
      );

      // Trigger animation
      rerender({ isCollapsed: true });

      // Simulate complete animation
      act(() => {
        const now = performance.now();
        rafCallbacks.forEach(cb => cb(now + 250)); // Past animation duration
      });

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('animation cancellation', () => {
    it('should cancel ongoing animation when starting new one', () => {
      const { rerender } = renderHook(
        ({ isCollapsed }) => useCollapseAnimation(isCollapsed, expandedSize),
        { initialProps: { isCollapsed: false } }
      );

      // Start first animation
      rerender({ isCollapsed: true });
      const firstRafId = rafId;

      // Start second animation before first completes
      rerender({ isCollapsed: false });

      expect(global.cancelAnimationFrame).toHaveBeenCalledWith(firstRafId);
    });

    it('should cleanup animation on unmount', () => {
      const { unmount } = renderHook(() =>
        useCollapseAnimation(false, expandedSize)
      );

      unmount();

      // Should cancel any pending animations
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('manual animation trigger', () => {
    it('should allow manual animation start', async () => {
      const { result } = renderHook(() =>
        useCollapseAnimation(false, expandedSize)
      );

      act(() => {
        result.current.startAnimation();
      });

      await waitFor(() => {
        expect(result.current.isAnimating).toBe(true);
      });

      expect(mockPerfMonitor.record).toHaveBeenCalledWith(
        'boundingBox.animationStart',
        1
      );
    });
  });

  describe('easing function', () => {
    it('should apply cubic easing to animation progress', () => {
      const { result, rerender } = renderHook(
        ({ isCollapsed }) => useCollapseAnimation(isCollapsed, expandedSize),
        { initialProps: { isCollapsed: false } }
      );

      rerender({ isCollapsed: true });

      // Simulate mid-animation (50% time progress)
      act(() => {
        const now = performance.now();
        rafCallbacks[0]?.(now);
        rafCallbacks[1]?.(now + 100); // 50% of 200ms duration
      });

      // With cubic easing, 50% time doesn't mean 50% size change
      const midWidth = result.current.size.width;
      const expectedMidpoint = (400 + 280) / 2; // Linear midpoint

      // Cubic easing should make it different from linear
      expect(Math.abs(midWidth - expectedMidpoint)).toBeGreaterThan(5);
    });
  });

  describe('performance', () => {
    it('should use requestAnimationFrame for smooth animation', () => {
      const { rerender } = renderHook(
        ({ isCollapsed }) => useCollapseAnimation(isCollapsed, expandedSize),
        { initialProps: { isCollapsed: false } }
      );

      rerender({ isCollapsed: true });

      // Should use RAF for each frame
      expect(global.requestAnimationFrame).toHaveBeenCalled();

      // Simulate multiple frames
      act(() => {
        const now = performance.now();
        for (let i = 0; i < 10; i++) {
          rafCallbacks[i]?.(now + i * 16); // ~60fps
        }
      });

      // Should continue requesting frames
      expect(global.requestAnimationFrame).toHaveBeenCalledTimes(10);
    });

    it('should complete animation in expected duration', async () => {
      const startTime = performance.now();

      const { result, rerender } = renderHook(
        ({ isCollapsed }) => useCollapseAnimation(isCollapsed, expandedSize),
        { initialProps: { isCollapsed: false } }
      );

      rerender({ isCollapsed: true });

      // Simulate animation at exact duration
      act(() => {
        rafCallbacks.forEach(cb => cb(startTime + 200));
      });

      await waitFor(() => {
        expect(result.current.isAnimating).toBe(false);
      });

      // Should complete at specified duration
      expect(result.current.size.width).toBe(280);
      expect(result.current.size.height).toBe(90);
    });
  });
});
