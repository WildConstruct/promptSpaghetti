import { act, renderHook } from '@testing-library/react';
import React from 'react';
import {
  WeakCache,
  useResourceManager,
  useStableCallback,
  useLimitedMemo,
  useVirtualScrolling,
  useLazyLoading,
  useMemoryMonitoring,
  memoryUtils
} from '../memoryOptimization';

describe('WeakCache', () => {
  it('stores and retrieves values', () => {
    const cache = new WeakCache<object, string>();
    const key = {};
    cache.set(key, 'value');
    expect(cache.get(key)).toBe('value');
    expect(cache.has(key)).toBe(true);
    cache.delete(key);
    expect(cache.has(key)).toBe(false);
  });
});

describe('useResourceManager', () => {
  it('cleans up registered callbacks', () => {
    const cleanupSpy = jest.fn();
    const { result, unmount } = renderHook(() => useResourceManager());
    result.current.addCleanup(cleanupSpy);
    unmount();
    expect(cleanupSpy).toHaveBeenCalled();
  });
});

describe('useStableCallback', () => {
  it('returns stable references', () => {
    const callback = jest.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useStableCallback(callback, [value]),
      { initialProps: { value: 1 } }
    );

    const initialCallback = result.current;
    rerender({ value: 1 });
    expect(result.current).toBe(initialCallback);
  });
});

describe('useLimitedMemo', () => {
  it('memoises results for identical dependencies', () => {
    const factory = jest.fn(() => ({ token: Math.random() }));
    const { result, rerender } = renderHook(
      ({ deps }) => useLimitedMemo(factory, deps),
      { initialProps: { deps: ['a'] as React.DependencyList } }
    );

    const firstValue = result.current;
    rerender({ deps: ['a'] });
    expect(result.current).toBe(firstValue);
    rerender({ deps: ['b'] });
    expect(factory).toHaveBeenCalledTimes(2);
  });
});

describe('useVirtualScrolling', () => {
  it('returns a sensible set of visible items', () => {
    const items = Array.from({ length: 100 }, (_, index) => index);
    const { result } = renderHook(() =>
      useVirtualScrolling(items, 10, 100, 2)
    );

    expect(result.current.visibleItems.length).toBeGreaterThan(0);
    expect(result.current.totalHeight).toBe(1000);
    expect(typeof result.current.onScroll).toBe('function');
  });
});

describe('useLazyLoading', () => {
  class MockIntersectionObserver {
    static instances: MockIntersectionObserver[] = [];
    observe = jest.fn();
    disconnect = jest.fn();
    callback: IntersectionObserverCallback;

    constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
      this.callback = callback;
      MockIntersectionObserver.instances.push(this);
    }
  }

  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    (global as unknown as { IntersectionObserver?: unknown }).IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  it('reports visibility when intersections occur', () => {
    const { result } = renderHook(() => useLazyLoading<HTMLDivElement>());
    expect(result.current.isVisible).toBe(false);

    const instance = MockIntersectionObserver.instances[0];
    expect(instance).toBeDefined();

    act(() => {
      result.current.ref.current = document.createElement('div');
      instance.callback([{ isIntersecting: true } as IntersectionObserverEntry], instance as unknown as IntersectionObserver);
    });

    expect(result.current.isVisible).toBe(true);
  });
});

describe('useMemoryMonitoring', () => {
  it('returns memory data when available', () => {
    jest.useFakeTimers();
    const originalPerformance = global.performance;
    global.performance = {
      ...originalPerformance,
      memory: {
        usedJSHeapSize: 100,
        totalJSHeapSize: 200,
        jsHeapSizeLimit: 500
      } as PerformanceMemory
    } as Performance;

    const { result } = renderHook(() => useMemoryMonitoring(1));

    act(() => {
      jest.advanceTimersByTime(2);
    });

    expect(result.current.usedJSHeapSize).toBeDefined();
    jest.useRealTimers();
    global.performance = originalPerformance;
  });
});

describe('memoryUtils', () => {
  it('formats bytes and evaluates pressure', () => {
    expect(memoryUtils.formatBytes(1024)).toContain('KB');
    expect(memoryUtils.estimateMemoryPressure(100, 1000)).toBe('low');
    expect(memoryUtils.shouldThrottle(0.9)).toBe(true);
  });
});
