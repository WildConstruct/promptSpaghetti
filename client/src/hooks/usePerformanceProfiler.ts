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
  timestamp: number;,
  render: {,
  componentCount: number;,
  renderTime: number;,
  reRenderCount: number;,
  mountTime: number;,
  updateTime: number;
};
  memory: {,
  usedJSHeapSize: number;
  totalJSHeapSize: number;,
  jsHeapSizeLimit: number;,
  heapUtilization: number;
};
  network: {,
  requestCount: number;
  totalTransferSize: number;,
  averageResponseTime: number;,
  errorCount: number;,
  cacheHitRate: number;
};
  interactions: {,
  clickCount: number;
  scrollEvents: number;,
  inputEvents: number;,
  navigationCount: number;,
  averageInteractionTime: number;
};
  vitals: {,
  FCP: number;
  LCP: number;,
  FID: number;,
  CLS: number;,
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



interface PerformanceStats {
  renderTime: number;,
  memoryUsage: number;,
  responseTime: number;,
  layoutShift: number;,
  interactionCount: number;



interface UsePerformanceProfilerReturn {
  isRunning: boolean;,
  stats: PerformanceStats | null;,
  startProfiling: () => void;,
  stopProfiling: () => PerformanceSnapshot;,
  trackRender: (renderTime: number, isMount?: boolean) => void;
  trackInteraction: (interactionType: string, duration?: number) => void;
  addCustomMetric: (key: string, value: any) => void;,
  getCurrentStats: () => PerformanceStats | null;
  /**
  * Performance profiler hook for React components
  */


export function usePerformanceProfiler(options: UsePerformanceProfilerOptions = {})
): UsePerformanceProfilerReturn {
  const {
    autoStart = false,
    trackRenders = true,
    trackInteractions = true,
    componentName = 'Component',
    alertOnSlowRender = true,
    slowRenderThreshold = 16.67 // 60fps threshold
 = options;
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const renderStartTime = useRef<number>(0);
  const componentMountTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const interactionCount = useRef<number>(0);
  // Initialize component mount tracking
  useEffect(() => {
    componentMountTime.current = performance.now();
    if (trackRenders) {
      const mountTime = performance.now() - componentMountTime.current;
      clientProfiler.trackComponentRender(componentName, mountTime, true);
    // Auto-start profiling if enabled
    if (autoStart && !clientProfiler.isRunning) {
      startProfiling();
  }, []);
  // Track component renders
  useEffect(() => {
    if (!trackRenders) return;
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    if (renderStartTime.current > 0 && renderCount.current > 0) {
      // Track the render
      clientProfiler.trackComponentRender(componentName, renderTime, false);
      // Alert on slow renders
      if (alertOnSlowRender && renderTime > slowRenderThreshold) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);}
        clientProfiler.addCustomMetric(`slowRender_${componentName}`, renderTime);}
    renderCount.current++;
    renderStartTime.current = performance.now();
  });
  // Update stats periodically
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const currentStats = clientProfiler.getCurrentStats();
      setStats(currentStats);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);
  const startProfiling = useCallback(() => {
    try {
      clientProfiler.startProfiling();
      setIsRunning(true);
      console.log(`Performance profiling started for ${componentName}`);}
 catch (error) {
  console.error('Failed to start performance profiling:', error);
}, [componentName]);
  const stopProfiling = useCallback(() => {
    try {
      const snapshots = clientProfiler.stopProfiling();
      setIsRunning(false);
      setStats(null);
      console.log(`Performance profiling stopped for ${componentName}. Collected ${snapshots.length} snapshots.`);}
      return snapshots;
 catch (error) {
  console.error('Failed to stop performance profiling:', error);
  return [];
}, [componentName]);
  const trackRender = useCallback((renderTime: number, isMount: boolean = false) => {
    if (trackRenders) {
      clientProfiler.trackComponentRender(componentName, renderTime, isMount);
  }, [trackRenders, componentName]);
  const trackInteraction = useCallback((interactionType: string, duration?: number) => {
    if (trackInteractions) {
      interactionCount.current++;
      clientProfiler.addCustomMetric(`${componentName}_${interactionType}_count`, interactionCount.current);}
      if (duration !== undefined) {
        clientProfiler.addCustomMetric(`${componentName}_${interactionType}_duration`, duration);}
  }, [trackInteractions, componentName]);
  const addCustomMetric = useCallback((key: string, value: any) => {
    const metricKey = `${componentName}_${key}`;}
    clientProfiler.addCustomMetric(metricKey, value);
  }, [componentName]);
  const getCurrentStats = useCallback(() => {
    return clientProfiler.getCurrentStats();
  }, []);
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
/**
 * Higher-order component for automatic performance tracking
 */
export function withPerformanceTracking<P extends object>()
  WrappedComponent: React.ComponentType<P>,
  options: UsePerformanceProfilerOptions = {}
  const componentName = options.componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  return function PerformanceTrackedComponent(props: P) {
    const {
      trackRender,
      trackInteraction,
      addCustomMetric
 = usePerformanceProfiler({)
  ...options,
      componentName
    });
    // Track component lifecycle
    useEffect(() => {
      const mountStart = performance.now();
      return () => {
        const unmountTime = performance.now() - mountStart;
        addCustomMetric('componentLifetime', unmountTime);
      };
    }, [addCustomMetric]);
    // Enhanced component with performance tracking props
    const enhancedProps = {
      ...props,
      trackRender,
      trackInteraction,
      addCustomMetric
 as P;
    return React.createElement(WrappedComponent, enhancedProps);
  };
/**
 * React DevTools Profiler integration hook
 */
export function useReactProfiler(componentName: string) {
  const onRenderCallback = useCallback((;);
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number) => {,
    // Track React-specific profiling data
    clientProfiler.addCustomMetric(`react_${componentName}_${phase}_duration`, actualDuration);}
    clientProfiler.addCustomMetric(`react_${componentName}_${phase}_baseDuration`, baseDuration);}
    if (actualDuration > baseDuration * 2) {
      console.warn(`Performance issue in ${componentName}: actual render (${actualDuration}ms) is much slower than base (${baseDuration}ms)`);}
  }, [componentName]);
  return { onRenderCallback };
/**
 * Hook for tracking specific user interactions
 */
export function useInteractionTracking(componentName: string) {
  const { trackInteraction } = usePerformanceProfiler({ componentName, trackInteractions: true });
  const trackClick = useCallback((elementId?: string) => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      trackInteraction('click', duration);
      if (elementId) {
        clientProfiler.addCustomMetric(`click_${elementId}_duration`, duration);}
    };
  }, [trackInteraction]);
  const trackScroll = useCallback(() => {
    trackInteraction('scroll');
  }, [trackInteraction]);
  const trackInput = useCallback((inputType: string = 'input') => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      trackInteraction(inputType, duration);
    };
  }, [trackInteraction]);
  const trackNavigation = useCallback((route: string) => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      trackInteraction('navigation', duration);
      clientProfiler.addCustomMetric(`navigation_${route}_duration`, duration);}
    };
  }, [trackInteraction]);
  return {
    trackClick,
    trackScroll,
    trackInput,
    trackNavigation
  };
/**
 * Hook for tracking async operations performance
 */
export function useAsyncOperationTracking(operationName: string) {
  const { addCustomMetric } = usePerformanceProfiler({});
  const trackAsyncOperation = useCallback(async <T>(;);
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
  const startTime = performance.now();
  let success = true;
  let error: Error | null = null;
  try {
  const result = await operation();
  return result;
 catch (err) {
      success = false;
      error = err as Error;
      throw err;
 finally {
      const duration = performance.now() - startTime;
      addCustomMetric(`async_${operationName}_duration`, duration);}
      addCustomMetric(`async_${operationName}_success`, success);}
      if (error) {
        addCustomMetric(`async_${operationName}_error`, error.message);}
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          addCustomMetric(`async_${operationName}_${key}`, value);}
        });
  }, [operationName, addCustomMetric]);
  return { trackAsyncOperation };
/**
 * Hook for tracking memory usage in components
 */
export function useMemoryTracking(componentName: string, trackingInterval: number = 5000) {
  const { addCustomMetric } = usePerformanceProfiler({});
  useEffect(() => {
    if (!(performance as any).memory) {
      console.warn('Memory tracking not available in this browser');
      return;
    const trackMemory = () => {
      const memory = (performance as any).memory;
      const heapUtilization = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
      addCustomMetric(`${componentName}_heapUsed`, memory.usedJSHeapSize);}
      addCustomMetric(`${componentName}_heapTotal`, memory.totalJSHeapSize);}
      addCustomMetric(`${componentName}_heapUtilization`, heapUtilization);}
      // Alert on high memory usage
      if (heapUtilization > 90) {
        console.warn(`High memory usage in ${componentName}: ${heapUtilization.toFixed(1)}%`);}
    };
    // Track initial memory
    trackMemory();
    // Track periodically
    const interval = setInterval(trackMemory, trackingInterval);
    return () => clearInterval(interval);
  }, [componentName, trackingInterval, addCustomMetric]);
/**
 * Performance context for sharing profiler across components
 */
import { createContext, useContext } from 'react';


interface PerformanceContextType {
  profiler: ClientPerformanceProfiler;,
  isGlobalProfilingEnabled: boolean;,
  startGlobalProfiling: () => void;,
  stopGlobalProfiling: () => void;
  const PerformanceContext = createContext<PerformanceContextType | null>(null);
  export function usePerformanceContext() {
  const context = useContext(PerformanceContext);
  if (!context) {
  throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  return context;


export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [isGlobalProfilingEnabled, setIsGlobalProfilingEnabled] = useState(false);
  const startGlobalProfiling = useCallback(() => {
    clientProfiler.startProfiling();
    setIsGlobalProfilingEnabled(true);
  }, []);
  const stopGlobalProfiling = useCallback(() => {
    clientProfiler.stopProfiling();
    setIsGlobalProfilingEnabled(false);
  }, []);
  const value: PerformanceContextType = {,
  profiler: clientProfiler,
  isGlobalProfilingEnabled,
  startGlobalProfiling,
  stopGlobalProfiling
};
  return React.createElement()
    PerformanceContext.Provider,
    { value },
    children
  );