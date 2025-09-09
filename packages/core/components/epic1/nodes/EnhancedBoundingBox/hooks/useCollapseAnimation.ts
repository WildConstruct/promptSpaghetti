/**
 * Hook for smooth collapse/expand animations using requestAnimationFrame
 * Provides 60fps animations with proper easing
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Size, UseCollapseAnimationReturn } from '../types';
import { BOUNDING_BOX_CONSTANTS } from '../utils/constants';
import { PerformanceMonitor } from '../../../../../utils/performance/PerformanceMonitor';

const { COLLAPSED_HEIGHT, COLLAPSED_WIDTH } = BOUNDING_BOX_CONSTANTS.dimensions;

const { COLLAPSE_DURATION } = BOUNDING_BOX_CONSTANTS.animation;

interface AnimationState {
  startSize: Size;
  targetSize: Size;
  startTime: number;
  duration: number;
}

/**
 * Cubic ease-in-out function for smooth animations
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Interpolate between two sizes based on progress
 */
function interpolateSize(from: Size, to: Size, progress: number): Size {
  return {
    width: from.width + (to.width - from.width) * progress,
    height: from.height + (to.height - from.height) * progress
  };
}

export function useCollapseAnimation(
  isCollapsed: boolean,
  expandedSize: Size,
  onAnimationComplete?: () => void
): UseCollapseAnimationReturn {
  const perfMonitor = PerformanceMonitor.getInstance();

  // Initialize with appropriate size based on initial collapsed state
  const [size, setSize] = useState<Size>(
    isCollapsed
      ? { width: COLLAPSED_WIDTH, height: COLLAPSED_HEIGHT }
      : expandedSize
  );

  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>();
  const animationStateRef = useRef<AnimationState | null>(null);
  const previousCollapsedRef = useRef(isCollapsed);

  /**
   * Animation frame callback
   */
  const animate = useCallback(
    (timestamp: number) => {
      if (!animationStateRef.current) return;

      const { startSize, targetSize, startTime, duration } =
        animationStateRef.current;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Apply easing
      const easedProgress = easeInOutCubic(progress);

      // Calculate current size
      const currentSize = interpolateSize(startSize, targetSize, easedProgress);
      setSize(currentSize);

      // Continue animation or complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        setIsAnimating(false);
        animationStateRef.current = null;
        perfMonitor.record('boundingBox.animationComplete', 1);

        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    },
    [onAnimationComplete, perfMonitor]
  );

  /**
   * Start animation when collapsed state changes
   */
  const startAnimation = useCallback(() => {
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const targetSize = isCollapsed
      ? { width: COLLAPSED_WIDTH, height: COLLAPSED_HEIGHT }
      : expandedSize;

    // Set up animation state
    animationStateRef.current = {
      startSize: size,
      targetSize,
      startTime: performance.now(),
      duration: COLLAPSE_DURATION
    };

    setIsAnimating(true);
    perfMonitor.record('boundingBox.animationStart', 1);

    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);
  }, [isCollapsed, expandedSize, size, animate, perfMonitor]);

  /**
   * Trigger animation when collapsed state changes
   */
  useEffect(() => {
    // Only animate if collapsed state actually changed
    if (previousCollapsedRef.current !== isCollapsed) {
      startAnimation();
      previousCollapsedRef.current = isCollapsed;
    }
  }, [isCollapsed, startAnimation]);

  /**
   * Cleanup animation on unmount
   */
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    size,
    isAnimating,
    startAnimation
  };
}
