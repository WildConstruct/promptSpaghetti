/**
 * React Performance Profiler Hook
 * 
 * React hook for integrating client-side performance monitoring with React components.
 * Provides automatic component render tracking and performance metrics collection.
 * 
 * Task: T-1752989144295-168 - Profile server and client performance under load
 */
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { clientProfiler, ClientPerformanceProfiler } from '../utils/clientPerformanceProfiler';

// Import PerformanceSnapshot type from the profiler
type PerformanceSnapshot = {
  timestamp: number;
  render: {
    componentCount: number;
    renderTime: number;
    reRenderCount: number;
    mountTime: number;
    updateTime: number;
  };
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    heapUtilization: number;
  };
  network: {
    requestCount: number;
    totalTransferSize: number;
    averageResponseTime: number;
    errorCount: number;
    cacheHitRate: number;
  };
  interactions: {
    clickCount: number;
    scrollEvents: number;
    inputEvents: number;
    navigationCount: number;
    averageInteractionTime: number;
  };
  vitals: {
    FCP: number;
    LCP: number;
    FID: number;
    CLS: number;
    TTFB: number;
  };
  customMetrics: Record<string, any>;
};

interface UsePerformanceProfilerOptions {
  autoStart?: boolean;
  trackRenders?: boolean;
  trackInteractions?: boolean;
  componentName?: string;
  alertOnSlowRender?: boolean;
  slowRenderThreshold?: number;
}

interface PerformanceStats {
  renderTime: number;
  memoryUsage: number;
  responseTime: number;
  layoutShift: number;
  interactionCount: number;
}

interface UsePerformanceProfilerReturn {
  isRunning: boolean;
  stats: PerformanceStats | null;
  startProfiling: () => void;
  stopProfiling: () => PerformanceSnapshot;
  trackRender: (renderTime: number, isMount?: boolean) => void;
  trackInteraction: (interactionType: string, duration?: number) => void;
  addCustomMetric: (key: string, value: any) => void;
  getCurrentStats: () => PerformanceStats | null;
}

/**
 * Performance profiler hook for React components
 */
export function usePerformanceProfiler(
  options: UsePerformanceProfilerOptions = {}
): UsePerformanceProfilerReturn {
  const {
    autoStart = false,
    trackRenders = true,
    trackInteractions = true,
    componentName = 'Component',
    alertOnSlowRender = true,
    slowRenderThreshold = 16.67 // 60fps threshold
  } = options;
  
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const interactionCount = useRef<number>(0);

  // Start profiling
  const startProfiling = useCallback(() => {
    if (!isRunning) {
      clientProfiler.start();
      setIsRunning(true);
      renderCount.current = 0;
      interactionCount.current = 0;
      console.log(`[Performance] Started profiling ${componentName}`);
    }
  }, [isRunning, componentName]);

  // Stop profiling and get snapshot
  const stopProfiling = useCallback(() => {
    if (isRunning) {
      const snapshot = clientProfiler.stop();
      setIsRunning(false);
      console.log(`[Performance] Stopped profiling ${componentName}`, snapshot);
      return snapshot;
    }
    return clientProfiler.getSnapshot();
  }, [isRunning, componentName]);

  // Track render performance
  const trackRender = useCallback((renderTime: number, isMount: boolean = false) => {
    if (!trackRenders || !isRunning) return;

    renderCount.current++;
    clientProfiler.trackRender(renderTime, isMount);

    if (alertOnSlowRender && renderTime > slowRenderThreshold) {
      console.warn(`[Performance] Slow render detected in ${componentName}: ${renderTime}ms`);
    }

    // Update stats
    const currentSnapshot = clientProfiler.getSnapshot();
    setStats({
      renderTime: currentSnapshot.render.renderTime,
      memoryUsage: currentSnapshot.memory.usedJSHeapSize,
      responseTime: currentSnapshot.network.averageResponseTime,
      layoutShift: currentSnapshot.vitals.CLS,
      interactionCount: interactionCount.current
    });
  }, [trackRenders, isRunning, alertOnSlowRender, slowRenderThreshold, componentName]);

  // Track user interactions
  const trackInteraction = useCallback((interactionType: string, duration?: number) => {
    if (!trackInteractions || !isRunning) return;

    interactionCount.current++;
    clientProfiler.trackInteraction(interactionType, duration);
  }, [trackInteractions, isRunning]);

  // Add custom metric
  const addCustomMetric = useCallback((key: string, value: any) => {
    if (!isRunning) return;
    clientProfiler.addCustomMetric(key, value);
  }, [isRunning]);

  // Get current stats
  const getCurrentStats = useCallback(() => {
    if (!isRunning) return null;
    
    const snapshot = clientProfiler.getSnapshot();
    return {
      renderTime: snapshot.render.renderTime,
      memoryUsage: snapshot.memory.usedJSHeapSize,
      responseTime: snapshot.network.averageResponseTime,
      layoutShift: snapshot.vitals.CLS,
      interactionCount: interactionCount.current
    };
  }, [isRunning]);

  // Auto-start profiling on mount if enabled
  useEffect(() => {
    if (autoStart) {
      startProfiling();
    }

    return () => {
      if (isRunning) {
        stopProfiling();
      }
    };
  }, [autoStart]);

  // Track component mount/unmount
  useEffect(() => {
    if (trackRenders && isRunning) {
      renderStartTime.current = performance.now();
      
      return () => {
        const renderTime = performance.now() - renderStartTime.current;
        trackRender(renderTime, false);
      };
    }
  }, [trackRenders, isRunning, trackRender]);

  return {
    isRunning,
    stats,
    startProfiling,
    stopProfiling,
    trackRender,
    trackInteraction,
    addCustomMetric,
    getCurrentStats
  };
}

/**
 * React Profiler wrapper component for automatic performance tracking
 */
export const PerformanceProfilerWrapper: React.FC<{
  id: string;
  children: React.ReactNode;
  onRenderCallback?: (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => void;
}> = ({ id, children, onRenderCallback }) => {
  const profilerCallback = useCallback(
    (
      profilerId: string,
      phase: 'mount' | 'update',
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number
    ) => {
      // Track render in global profiler
      clientProfiler.trackRender(actualDuration, phase === 'mount');

      // Call custom callback if provided
      if (onRenderCallback) {
        onRenderCallback(profilerId, phase, actualDuration, baseDuration, startTime, commitTime);
      }

      // Log slow renders
      if (actualDuration > 16.67) { // 60fps threshold
        console.warn(`[Performance] Slow ${phase} in ${profilerId}: ${actualDuration}ms`);
      }
    },
    [onRenderCallback]
  );

  return (
    <React.Profiler id={id} onRender={profilerCallback}>
      {children}
    </React.Profiler>
  );
};

export default usePerformanceProfiler;