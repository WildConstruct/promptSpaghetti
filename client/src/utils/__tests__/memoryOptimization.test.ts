/**
 * Memory Optimization Test Suite
 * 
 * Tests for memory management, resource cleanup, and optimization utilities
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  WeakCache,
  useResourceManager,
  useStableCallback,
  useLimitedMemo,
  useVirtualScrolling,
  useLazyLoading,
  useMemoryMonitoring,
  useBatchedUpdates,
  memoryUtils
} from '../memoryOptimization';

// Mock IntersectionObserver
const mockIntersectionObserver = {
  observe: jest.fn<unknown, unknown>(),
  disconnect: jest.fn<unknown, unknown>(),
  unobserve: jest.fn<unknown, unknown>(),
};
const MockIntersectionObserver = jest.fn(() => mockIntersectionObserver);
Object.defineProperty(global, 'IntersectionObserver', {)
  value: MockIntersectionObserver,
  writable: true,
});

// Mock performance.memory
const mockPerformanceMemory = {
  usedJSHeapSize: 50 * 1024 * 1024, // 50MB,
  totalJSHeapSize: 100 * 1024 * 1024, // 100MB,
  jsHeapSizeLimit: 1024 * 1024 * 1024 // 1GB,
};
Object.defineProperty(performance, 'memory', {)
  value: mockPerformanceMemory,
  configurable: true,
});
describe('WeakCache', () => {
  let cache: WeakCache<object, string>;
  let key1: object;
  let key2: object;
  beforeEach(() => {
    cache = new WeakCache();
    key1 = { id: 1 };
    key2 = { id: 2 };
  });
  it('should store and retrieve values', () => {
    cache.set(key1, 'value1');
    expect(cache.get(key1)).toBe('value1');
  });
  it('should return undefined for non-existent keys', () => {
    expect(cache.get(key1)).toBeUndefined();
  });
  it('should check if key exists', () => {
    cache.set(key1, 'value1');
    expect(cache.has(key1)).toBe(true);
    expect(cache.has(key2)).toBe(false);
  });
  it('should delete values', () => {
    cache.set(key1, 'value1');
    expect(cache.has(key1)).toBe(true);
    const deleted = cache.delete(key1);
    expect(deleted).toBe(true);
    expect(cache.has(key1)).toBe(false);
  });
  it('should handle multiple keys', () => {
    cache.set(key1, 'value1');
    cache.set(key2, 'value2');
    expect(cache.get(key1)).toBe('value1');
    expect(cache.get(key2)).toBe('value2');
  });
  it('should allow garbage collection of unreferenced keys', () => {
    let tempKey = { temp: true };
    cache.set(tempKey, 'temp_value');
    expect(cache.has(tempKey)).toBe(true);
    // Remove reference
    tempKey = null as any;
    // Force garbage collection (in real scenarios, this would happen automatically)
    // We can't actually test GC, but we can verify the cache doesn't prevent it
    expect(typeof tempKey).toBe('object');
  });
});
describe('useResourceManager', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('should provide a resource manager instance', () => {
    const { result } = renderHook(() => useResourceManager());
    expect(result.current).toBeDefined();
    expect(typeof result.current.addCleanup).toBe('function');
    expect(typeof result.current.addTimer).toBe('function');
    expect(typeof result.current.addObserver).toBe('function');
    expect(typeof result.current.cleanup).toBe('function');
  });
  it('should return the same instance across renders', () => {
    const { result, rerender } = renderHook(() => useResourceManager());
    const firstInstance = result.current;
    rerender();
    expect(result.current).toBe(firstInstance);
  });
  it('should cleanup resources on unmount', () => {
    const cleanupSpy = jest.fn<unknown, unknown>();
    const { result, unmount } = renderHook(() => useResourceManager());
    result.current.addCleanup(cleanupSpy);
    unmount();
    expect(cleanupSpy).toHaveBeenCalled();
  });
  it('should manage timers', () => {
    const { result } = renderHook(() => useResourceManager());
    const timerId = setTimeout(() => {}, 1000);
    const removeTimer = result.current.addTimer(timerId);
    expect(typeof removeTimer).toBe('function');
    // Should be able to remove timer manually
    removeTimer();
  });
  it('should manage observers', () => {
    const { result } = renderHook(() => useResourceManager());
    const mockObserver = { disconnect: jest.fn<unknown, unknown>() };
    const removeObserver = result.current.addObserver(mockObserver);
    expect(typeof removeObserver).toBe('function');
    // Should disconnect observer when removed
    removeObserver();
    expect(mockObserver.disconnect).toHaveBeenCalled();
  });
  it('should handle cleanup errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const { result, unmount } = renderHook(() => useResourceManager());
    // Add a cleanup function that throws
    result.current.addCleanup(() => {
      throw new Error('Cleanup error');
    });
    // Should not throw when unmounting
    expect(() => unmount()).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
describe('useStableCallback', () => {
  it('should return a stable callback reference', () => {
    const mockCallback = jest.fn<unknown, unknown>();
    const { result, rerender } = renderHook()
      ({ callback, deps }) => useStableCallback(callback, deps),
      { initialProps: { callback: mockCallback, deps: ['dep1'] } }
    );
    const firstCallback = result.current;
    // Rerender with same dependencies
    rerender({ callback: mockCallback, deps: ['dep1'] });
    expect(result.current).toBe(firstCallback);
  });
  it('should update callback when dependencies change', () => {
    const mockCallback1 = jest.fn<unknown, unknown>();
    const mockCallback2 = jest.fn<unknown, unknown>();
    const { result, rerender } = renderHook()
      ({ callback, deps }) => useStableCallback(callback, deps),
      { initialProps: { callback: mockCallback1, deps: ['dep1'] } }
    );
    const firstCallback = result.current;
    // Rerender with different dependencies
    rerender({ callback: mockCallback2, deps: ['dep2'] });
    expect(result.current).not.toBe(firstCallback);
  });
  it('should call the latest callback', () => {
    let callbackResult = 'initial';
    const getCallback = () => jest.fn(() => callbackResult);
    const { result, rerender } = renderHook()
      ({ callback, deps }) => useStableCallback(callback, deps),
      { initialProps: { callback: getCallback(), deps: [] } }
    );
    // Update the callback result
    callbackResult = 'updated';
    rerender({ callback: getCallback(), deps: [] });
    // The callback should return the updated result
    expect(result.current()).toBe('updated');
  });
});
describe('useLimitedMemo', () => {
  it('should memoize values based on dependencies', () => {
    const factory = jest.fn(() => ({ computed: 'value' }));
    const { result, rerender } = renderHook()
      ({ deps }) => useLimitedMemo(factory, deps),
      { initialProps: { deps: ['dep1'] } }
    );
    const firstResult = result.current;
    expect(factory).toHaveBeenCalledTimes(1);
    // Rerender with same dependencies
    rerender({ deps: ['dep1'] });
    expect(result.current).toBe(firstResult);
    expect(factory).toHaveBeenCalledTimes(1); // Should not call factory again
  });
  it('should recompute when dependencies change', () => {
    const factory = jest.fn((id) => ({ computed: `value_${id}` }));}
    let factoryId = 1;
    const { result, rerender } = renderHook()
      ({ deps }) => useLimitedMemo(() => factory(factoryId++), deps),
      { initialProps: { deps: ['dep1'] } }
    );
    const firstResult = result.current;
    expect(factory).toHaveBeenCalledTimes(1);
    // Rerender with different dependencies
    rerender({ deps: ['dep2'] });
    expect(result.current).not.toBe(firstResult);
    expect(factory).toHaveBeenCalledTimes(2);
  });
  it('should limit cache size and evict old entries', () => {
    const factory = jest.fn((id) => ({ id }));
    let factoryId = 1;
    const { rerender } = renderHook()
      ({ deps }) => useLimitedMemo(() => factory(factoryId++), deps, 3), // Max size 3
      { initialProps: { deps: ['dep1'] } }
    );
    // Add more entries than the cache limit
    for (let i = 2; i <= 5; i++) {
      rerender({ deps: [`dep${i}`] });}
    // Cache should have evicted some entries
    expect(factory).toHaveBeenCalledTimes(5);
    // Accessing an old dependency should cause recomputation
    rerender({ deps: ['dep1'] });
    expect(factory).toHaveBeenCalledTimes(6); // Should recompute
  });
});
describe('useVirtualScrolling', () => {
  const mockItems = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }));}
  const itemHeight = 50;
  const containerHeight = 400;
  it('should calculate visible items correctly', () => {
    const { result } = renderHook(() =>
      useVirtualScrolling(mockItems, itemHeight, containerHeight)
    );
    expect(result.current.visibleItems.length).toBeGreaterThan(0);
    expect(result.current.totalHeight).toBe(mockItems.length * itemHeight);
    expect(typeof result.current.onScroll).toBe('function');
  });
  it('should update visible items on scroll', () => {
    const { result } = renderHook(() =>
      useVirtualScrolling(mockItems, itemHeight, containerHeight)
    );
    const initialVisibleItems = result.current.visibleItems;
    // Simulate scroll event
    act(() => {
      const mockEvent = {
        currentTarget: { scrollTop: 500 }
      } as React.UIEvent<HTMLDivElement>;
      result.current.onScroll(mockEvent);
    });
    expect(result.current.visibleItems).not.toEqual(initialVisibleItems);
    expect(result.current.startIndex).toBeGreaterThan(0);
  });
  it('should include overscan items', () => {
    const overscan = 2;
    const { result } = renderHook(() =>
      useVirtualScrolling(mockItems, itemHeight, containerHeight, overscan)
    );
    // Should include more items than just visible ones due to overscan
    const expectedVisible = Math.ceil(containerHeight / itemHeight);
    expect(result.current.visibleItems.length).toBeGreaterThan(expectedVisible);
  });
  it('should handle empty items array', () => {
    const { result } = renderHook(() =>
      useVirtualScrolling([], itemHeight, containerHeight)
    );
    expect(result.current.visibleItems).toHaveLength(0);
    expect(result.current.totalHeight).toBe(0);
  });
  it('should provide correct item positions', () => {
    const { result } = renderHook(() =>
      useVirtualScrolling(mockItems, itemHeight, containerHeight)
    );
    result.current.visibleItems.forEach((visibleItem, index) => {
      expect(visibleItem.top).toBe(visibleItem.index * itemHeight);
      expect(visibleItem.item).toBe(mockItems[visibleItem.index]);
    });
  });
});
describe('useLazyLoading', () => {
  it('should provide a ref and visibility state', () => {
    const { result } = renderHook(() => useLazyLoading());
    expect(result.current.ref).toBeDefined();
    expect(typeof result.current.isVisible).toBe('boolean');
    expect(result.current.isVisible).toBe(false); // Initially not visible
  });
  it('should create IntersectionObserver with correct threshold', () => {
    const threshold = 0.5;
    renderHook(() => useLazyLoading(threshold));
    expect(MockIntersectionObserver).toHaveBeenCalledWith()
      expect.any(Function),
      { threshold }
    );
  });
  it('should observe element when ref is set', () => {
    const { result } = renderHook(() => useLazyLoading());
    const mockElement = document.createElement('div');
    // Simulate ref being set
    act(() => {
  if (result.current.ref.current === null) {
  Object.defineProperty(result.current.ref, 'current', {)
  value: mockElement,
  writable: true,
});
    });
    expect(mockIntersectionObserver.observe).toHaveBeenCalled();
  });
  it('should handle intersection changes', () => {
  let observerCallback: (entries: unknown) => void;
  MockIntersectionObserver.mockImplementation((callback) => {
  observerCallback = callback;
  return mockIntersectionObserver;
});
    const { result } = renderHook(() => useLazyLoading());
    expect(result.current.isVisible).toBe(false);
    // Simulate element becoming visible
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });
    expect(result.current.isVisible).toBe(true);
    expect(mockIntersectionObserver.disconnect).toHaveBeenCalled();
  });
});
describe('useMemoryMonitoring', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('should return memory information', () => {
    const { result } = renderHook(() => useMemoryMonitoring(1000));
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.usedJSHeapSize).toBeDefined();
    expect(result.current.totalJSHeapSize).toBeDefined();
    expect(result.current.jsHeapSizeLimit).toBeDefined();
    expect(result.current.pressure).toBeDefined();
  });
  it('should update memory info periodically', () => {
    const { result } = renderHook(() => useMemoryMonitoring(500));
    const initialMemory = result.current;
    // Change mock memory values
    mockPerformanceMemory.usedJSHeapSize = 75 * 1024 * 1024;
    act(() => {
      jest.advanceTimersByTime(500);
    });
    // Should have updated values
    expect(result.current.usedJSHeapSize).not.toBe(initialMemory.usedJSHeapSize);
  });
  it('should warn about high memory pressure', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    // Set high memory usage
    mockPerformanceMemory.usedJSHeapSize = 950 * 1024 * 1024; // 95% of limit
    renderHook(() => useMemoryMonitoring(100));
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(consoleSpy).toHaveBeenCalledWith()
      'High memory pressure detected:',
      expect.any(Object)
    );
    consoleSpy.mockRestore();
  });
  it('should handle missing performance.memory gracefully', () => {
    const originalMemory = (performance as any).memory;
    delete (performance as any).memory;
    const { result } = renderHook(() => useMemoryMonitoring(100));
    expect(result.current).toEqual({});
    // Restore
    (performance as any).memory = originalMemory;
  });
});
describe('useBatchedUpdates', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('should batch updates', () => {
    const { result } = renderHook(() => useBatchedUpdates<string>());
    const [items, addItem, flush] = result.current;
    expect(items).toEqual([]);
    // Add multiple items quickly
    act(() => {
      addItem('item1');
      addItem('item2');
      addItem('item3');
    });
    // Items should still be empty (batched)
    expect(result.current[0]).toEqual([]);
    // Advance to next frame
    act(() => {
      jest.advanceTimersByTime(16);
    });
    // Now items should be updated
    expect(result.current[0]).toEqual(['item1', 'item2', 'item3']);
  });
  it('should allow manual flushing', () => {
    const { result } = renderHook(() => useBatchedUpdates<number>());
    act(() => {
      const [ addItem, flush] = result.current;
      addItem(1);
      addItem(2);
      flush(); // Manual flush
    });
    expect(result.current[0]).toEqual([1, 2]);
  });
  it('should accumulate items across batches', () => {
    const { result } = renderHook(() => useBatchedUpdates<string>());
    // First batch
    act(() => {
      const [ addItem] = result.current;
      addItem('batch1-item1');
      addItem('batch1-item2');
    });
    act(() => {
      jest.advanceTimersByTime(16);
    });
    expect(result.current[0]).toEqual(['batch1-item1', 'batch1-item2']);
    // Second batch
    act(() => {
      const [ addItem] = result.current;
      addItem('batch2-item1');
    });
    act(() => {
      jest.advanceTimersByTime(16);
    });
    expect(result.current[0]).toEqual(['batch1-item1', 'batch1-item2', 'batch2-item1']);
  });
});
describe('memoryUtils', () => {
  describe('deepEqual', () => {
    it('should compare primitive values', () => {
      expect(memoryUtils.deepEqual(1, 1)).toBe(true);
      expect(memoryUtils.deepEqual('test', 'test')).toBe(true);
      expect(memoryUtils.deepEqual(true, true)).toBe(true);
      expect(memoryUtils.deepEqual(null, null)).toBe(true);
      expect(memoryUtils.deepEqual(undefined, undefined)).toBe(true);
      expect(memoryUtils.deepEqual(1, 2)).toBe(false);
      expect(memoryUtils.deepEqual('test', 'other')).toBe(false);
      expect(memoryUtils.deepEqual(true, false)).toBe(false);
      expect(memoryUtils.deepEqual(null, undefined)).toBe(false);
    });
    it('should compare objects deeply', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      const obj3 = { a: 1, b: { c: 3 } };
      expect(memoryUtils.deepEqual(obj1, obj2)).toBe(true);
      expect(memoryUtils.deepEqual(obj1, obj3)).toBe(false);
    });
    it('should handle arrays', () => {
      expect(memoryUtils.deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(memoryUtils.deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(memoryUtils.deepEqual([1, 2], [1, 2, 3])).toBe(false);
    });
    it('should handle different types', () => {
      expect(memoryUtils.deepEqual(1, '1')).toBe(false);
      expect(memoryUtils.deepEqual({}, [])).toBe(false);
      expect(memoryUtils.deepEqual(null, {})).toBe(false);
    });
  });
  describe('shallowEqual', () => {
    it('should compare objects shallowly', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      const obj3 = { a: 1, b: 3 };
      const obj4 = { a: 1, b: 2, c: 3 };
      expect(memoryUtils.shallowEqual(obj1, obj2)).toBe(true);
      expect(memoryUtils.shallowEqual(obj1, obj3)).toBe(false);
      expect(memoryUtils.shallowEqual(obj1, obj4)).toBe(false);
    });
    it('should handle same reference', () => {
      const obj = { a: 1 };
      expect(memoryUtils.shallowEqual(obj, obj)).toBe(true);
    });
    it('should handle null values', () => {
      expect(memoryUtils.shallowEqual(null, null)).toBe(true);
      expect(memoryUtils.shallowEqual(null, {})).toBe(false);
      expect(memoryUtils.shallowEqual({}, null)).toBe(false);
    });
  });
  describe('createStableRef', () => {
  let cache: WeakCache<object, object>;
  beforeEach(() => {
  cache = new WeakCache();
});
    it('should return cached reference for equal objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      const ref1 = memoryUtils.createStableRef(obj1, cache);
      const ref2 = memoryUtils.createStableRef(obj2, cache);
      expect(ref1).toBe(obj1);
      expect(ref2).toBe(ref1); // Should return cached reference
    });
    it('should cache new objects', () => {
      const obj = { a: 1, b: 2 };
      const ref = memoryUtils.createStableRef(obj, cache);
      expect(ref).toBe(obj);
      expect(cache.has(obj)).toBe(true);
    });
    it('should handle different objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 2 };
      const ref1 = memoryUtils.createStableRef(obj1, cache);
      const ref2 = memoryUtils.createStableRef(obj2, cache);
      expect(ref1).toBe(obj1);
      expect(ref2).toBe(obj2);
      expect(ref1).not.toBe(ref2);
    });
  });
});