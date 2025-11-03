/**
 * Tests for useCollapseAnimation hook
 * Validates RAF-based animations and performance
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCollapseAnimation } from '../../hooks/useCollapseAnimation';
import { PerformanceMonitor } from '@/utils/performance/PerformanceMonitor';

// Mock PerformanceMonitor
jest.mock('@/utils/performance/PerformanceMonitor', () => ({
  PerformanceMonitor: {
    getInstance: jest.fn(() => ({
      record: jest.fn()
    }))
  }
}));

// Mock requestAnimationFrame for testing
let rafCallbacks: FrameRequestCallback[] = [];
let rafId = 0;
let mockNow = 0;

global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
  rafCallbacks.push(callback);
  return ++rafId;
});

global.cancelAnimationFrame = jest.fn((id: number) => {
  rafCallbacks = rafCallbacks.filter((_, index) => index !== id - 1);
});

global.performance.now = jest.fn(() => mockNow);

describe('useCollapseAnimation', () => {
  const mockPerfMonitor = {
    record: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    rafCallbacks = [];
    rafId = 0;
    mockNow = 0;
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
        mockNow = 16; // simulate first frame (~1 tick)

        // Start of animation
        rafCallbacks[0]?.(mockNow);
      });

      // Size should be changing
      expect(result.current.size.width).toBeLessThan(400);
      expect(result.current.size.height).toBeLessThan(300);

      // Simulate end of animation (200ms later)
      act(() => {
        mockNow = 200;
        rafCallbacks[rafCallbacks.length - 1]?.(mockNow);
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
        mockNow = 16;
        rafCallbacks[0]?.(mockNow);
      });

      // Size should be changing
      expect(result.current.size.width).toBeGreaterThan(280);
      expect(result.current.size.height).toBeGreaterThan(90);

      // Simulate end of animation
      act(() => {
        mockNow = 200;
        rafCallbacks[rafCallbacks.length - 1]?.(mockNow);
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
        mockNow = 250;
        rafCallbacks.forEach(cb => cb(mockNow));
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

    it('should cleanup animation on unmount', async () => {
      const { rerender, unmount } = renderHook(
        ({ isCollapsed }) => useCollapseAnimation(isCollapsed, expandedSize),
        { initialProps: { isCollapsed: false } }
      );

      rerender({ isCollapsed: true });

      await waitFor(() => {
        expect(global.requestAnimationFrame).toHaveBeenCalled();
      });

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
        mockNow = 0;
        rafCallbacks[0]?.(mockNow);
        mockNow = 50; // 25% of 200ms duration
        rafCallbacks[1]?.(mockNow);
      });

      // With cubic easing, 25% time progresses slower than linear interpolation
      const midWidth = result.current.size.width;
      const linearWidth =
        expandedSize.width - (expandedSize.width - collapsedSize.width) * 0.25;

      // Cubic easing eases in slower, so width should remain larger than linear interpolation
      expect(midWidth).toBeGreaterThan(linearWidth);
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
        for (let i = 0; i < 10; i++) {
          mockNow = i * 16; // ~60fps
          rafCallbacks[i]?.(mockNow);
        }
      });

      // Initial schedule + 10 frame requests
      expect(global.requestAnimationFrame).toHaveBeenCalledTimes(11);
    });

    it('should complete animation in expected duration', async () => {
      const { result, rerender } = renderHook(
        ({ isCollapsed }) => useCollapseAnimation(isCollapsed, expandedSize),
        { initialProps: { isCollapsed: false } }
      );

      rerender({ isCollapsed: true });

      // Simulate animation at exact duration
      act(() => {
        mockNow = 200;
        rafCallbacks.forEach(cb => cb(mockNow));
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
