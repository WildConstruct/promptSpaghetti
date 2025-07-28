/**
 * Memory Optimization Utilities
 * 
 * Provides utilities for preventing memory leaks, optimizing component updates,
 * and managing client-side resource cleanup.
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
/**
 * WeakMap-based cache for component memoization
 */
class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, V>();
  get(key: K): V | undefined {
    return this.cache.get(key);
  set(key: K, value: V): void {
    this.cache.set(key, value);
  has(key: K): boolean {
    return this.cache.has(key);
  delete(key: K): boolean {
    return this.cache.delete(key);
/**
 * Resource cleanup manager
 */
class ResourceManager {
  private resources: Set<() => void> = new Set();
  private timers: Set<number> = new Set();
  private observers: Set<{ disconnect: () => void }> = new Set();
  addCleanup(cleanup: () => void): () => void {
  this.resources.add(cleanup);
  return () => this.resources.delete(cleanup);
  addTimer(timerId: number): () => void {,
  this.timers.add(timerId);
  return () => {
  clearTimeout(timerId);
  clearInterval(timerId);
  this.timers.delete(timerId);
};
  addObserver(observer: { disconnect: () => void }): () => void {
    this.observers.add(observer);
    return () => {
      observer.disconnect();
      this.observers.delete(observer);
    };
  cleanup(): void {
    // Clear all resources
    this.resources.forEach(cleanup => {)
  try {
        cleanup();
      } catch (error) {
  console.warn('Cleanup function failed:', error);
});
    this.resources.clear();
    // Clear all timers
    this.timers.forEach(timerId => {)
  clearTimeout(timerId);
      clearInterval(timerId);
    });
    this.timers.clear();
    // Disconnect all observers
    this.observers.forEach(observer => {)
  try {
        observer.disconnect();
      } catch (error) {
  console.warn('Observer disconnect failed:', error);
});
    this.observers.clear();
/**
 * Hook for automatic resource cleanup
 */
export function useResourceManager(): ResourceManager {
  const managerRef = useRef<ResourceManager>();
  if (!managerRef.current) {
    managerRef.current = new ResourceManager();
  useEffect(() => {
    return () => {
      managerRef.current?.cleanup();
    };
  }, []);
  return managerRef.current;
/**
 * Enhanced useCallback with automatic dependency tracking
 */
export function useStableCallback<T extends (...args: unknown) => unknown>(callback: T,)
  deps?: React.DependencyList): T {
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);
  // Update refs when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
    depsRef.current = deps;
  });
  return useCallback()
    ((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }) as T,
    deps || []
  );
/**
 * Memoization with size limit to prevent memory bloat
 */
export function useLimitedMemo<T>()
  factory: () => T,
  deps: React.DependencyList,
  maxSize: number = 100): T {,
  const cacheRef = useRef<Map<string, { value: T; accessTime: number }>>(new Map());
  return useMemo(() => {
    const depsKey = JSON.stringify(deps);
    const cache = cacheRef.current;
    // Check if cached value exists
    if (cache.has(depsKey)) {
      const cached = cache.get(depsKey)!;
      cached.accessTime = Date.now();
      return cached.value;
    // Clean cache if it's too large
    if (cache.size >= maxSize) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].accessTime - b[1].accessTime);
      // Remove oldest 25% of entries
      const toRemove = Math.floor(maxSize * 0.25);
      for (let i = 0; i < toRemove; i++) {
        cache.delete(entries[i][0]);
    // Create new value and cache it
    const value = factory();
    cache.set(depsKey, { value, accessTime: Date.now() });
    return value;
  }, deps);
/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScrolling<T>()
  items: T,
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5,
  const [scrollTop, setScrollTop] = React.useState(0);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(;);
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  const visibleItems = useMemo(() => ;
    items.slice(startIndex, endIndex + 1).map((item, index) => ({)
  item,
  index: startIndex + index,
  top: (startIndex + index) * itemHeight,
}))
  , [items, startIndex, endIndex, itemHeight]);
  const totalHeight = items.length * itemHeight;
  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);
  return {
    visibleItems,
    totalHeight,
    onScroll,
    startIndex,
    endIndex
  };
/**
 * Image lazy loading with intersection observer
 */
export function useLazyLoading(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = useRef<HTMLElement>(null);
  const resourceManager = useResourceManager();
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(;);
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
  }
      { threshold }
    );
    observer.observe(element);
    const cleanup = resourceManager.addObserver(observer);
    return cleanup;
  }, [threshold, resourceManager]);
  return { ref, isVisible };
/**
 * Memory usage monitoring
 */
export function useMemoryMonitoring(interval: number = 10000) {
  const [memoryInfo, setMemoryInfo] = React.useState<{
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
  pressure?: number;
}>({});
  const resourceManager = useResourceManager();
  useEffect(() => {
  const updateMemoryInfo = () => {
  // @ts-ignore - performance.memory is not standard but widely supported
  const memory = (performance as any).memory;
  if (memory) {
  const pressure = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
  setMemoryInfo({)
  usedJSHeapSize: memory.usedJSHeapSize,
  totalJSHeapSize: memory.totalJSHeapSize,
  jsHeapSizeLimit: memory.jsHeapSizeLimit,
  pressure
});
        // Warn if memory pressure is high
        if (pressure > 0.9) {
  console.warn('High memory pressure detected:', {,)
  used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
  limit: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + 'MB',
  pressure: (pressure * 100).toFixed(1) + '%',
});
    };
    updateMemoryInfo();
    const timerId = setInterval(updateMemoryInfo, interval);
    resourceManager.addTimer(timerId);
    return () => clearInterval(timerId);
  }, [interval, resourceManager]);
  return memoryInfo;
/**
 * Batch update hook to reduce re-renders
 */
export function useBatchedUpdates<T>(): [T, (item: T) => void, () => void] {
  const [items, setItems] = React.useState<T>([]);
  const pendingUpdatesRef = useRef<T>([]);
  const timeoutRef = useRef<number>();
  const addItem = useCallback((item: T) => {,
  pendingUpdatesRef.current.push(item);
  if (timeoutRef.current) {
  clearTimeout(timeoutRef.current);
  timeoutRef.current = window.setTimeout(() => {
  setItems(current => [...current, ...pendingUpdatesRef.current]);
  pendingUpdatesRef.current = [];
}, 16); // Next frame
  }, []);
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    if (pendingUpdatesRef.current.length > 0) {
      setItems(current => [...current, ...pendingUpdatesRef.current]);
      pendingUpdatesRef.current = [];
  }, []);
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    };
  }, []);
  return [items, addItem, flush];
/**
 * Component state optimization utilities
 */
export if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(key => this.deepEqual(a[key], b[key]));
    return false;
  }
  /**
   * Shallow compare for React.memo
   */
  shallowEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => a[key] === b[key]);
  }
  /**
   * Create a stable reference for object props
   */
  createStableRef<T extends object>(obj: T, cache: WeakCache<T, T>): T {
    const cached = cache.get(obj);
    if (cached && this.shallowEqual(cached, obj)) {
      return cached;
    cache.set(obj, obj);
    return obj;
};

// Export the WeakCache class for external use
export { WeakCache };

// React import
import React from 'react';