/**
 * Hook for collapse/expand sizing.
 *
 * NOTE: this used to tween the size over ~300ms with requestAnimationFrame.
 * That per-frame size change drove a stream of React Flow dimension updates
 * which, on expand, reverted the contained nodes' `hidden` state — leaving the
 * region open but empty. Resizing in a single step removes that churn so the
 * collapse/expand result sticks. The API (size / isAnimating / startAnimation)
 * is unchanged for callers.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Size, UseCollapseAnimationReturn } from '../types';
import { BOUNDING_BOX_CONSTANTS } from '../utils/constants';
import { PerformanceMonitor } from '../../../../../utils/performance/PerformanceMonitor';

const { COLLAPSED_HEIGHT, COLLAPSED_WIDTH } = BOUNDING_BOX_CONSTANTS.dimensions;

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

  // Kept for API compatibility; we no longer tween, so this stays false.
  const [isAnimating] = useState(false);
  const previousCollapsedRef = useRef(isCollapsed);

  const startAnimation = useCallback(() => {
    const targetSize = isCollapsed
      ? { width: COLLAPSED_WIDTH, height: COLLAPSED_HEIGHT }
      : expandedSize;

    setSize(targetSize);
    perfMonitor.record('boundingBox.resize', 1);

    if (onAnimationComplete) {
      onAnimationComplete();
    }
  }, [isCollapsed, expandedSize, onAnimationComplete, perfMonitor]);

  // Resize when the collapsed state actually changes.
  useEffect(() => {
    if (previousCollapsedRef.current !== isCollapsed) {
      startAnimation();
      previousCollapsedRef.current = isCollapsed;
    }
  }, [isCollapsed, startAnimation]);

  return {
    size,
    isAnimating,
    startAnimation
  };
}
