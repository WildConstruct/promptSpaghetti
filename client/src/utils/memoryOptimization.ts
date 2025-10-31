import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DependencyList,
  type RefObject,
  type UIEvent
} from 'react';

export class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, V>();

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }
}

type CleanupCallback = () => void;
type TimerHandle =
  | ReturnType<typeof setTimeout>
  | ReturnType<typeof setInterval>;
type Observable = { disconnect: () => void };

export class ResourceManager {
  private cleanups = new Set<CleanupCallback>();
  private timers = new Set<TimerHandle>();
  private observers = new Set<Observable>();

  addCleanup(callback: CleanupCallback): () => void {
    this.cleanups.add(callback);
    return () => this.cleanups.delete(callback);
  }

  addTimer(timer: TimerHandle): () => void {
    this.timers.add(timer);
    return () => {
      this.clearTimer(timer);
      this.timers.delete(timer);
    };
  }

  addObserver(observer: Observable): () => void {
    this.observers.add(observer);
    return () => {
      observer.disconnect();
      this.observers.delete(observer);
    };
  }

  cleanup(): void {
    this.cleanups.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('ResourceManager cleanup failed', error);
      }
    });
    this.cleanups.clear();

    this.timers.forEach(timer => {
      this.clearTimer(timer);
    });
    this.timers.clear();

    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('ResourceManager observer cleanup failed', error);
      }
    });
    this.observers.clear();
  }

  private clearTimer(timer: TimerHandle): void {
    if (typeof timer === 'number') {
      // Browser timers return numeric IDs
      clearTimeout(timer);
      clearInterval(timer);
      return;
    }

    // Node timers expose the full Timer interface
    clearTimeout(timer as ReturnType<typeof setTimeout>);
    clearInterval(timer as ReturnType<typeof setInterval>);
  }
}

export function useResourceManager(): ResourceManager {
  const managerRef = useRef<ResourceManager>();

  if (!managerRef.current) {
    managerRef.current = new ResourceManager();
  }

  useEffect(() => () => managerRef.current?.cleanup(), []);

  return managerRef.current;
}

export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  dependencies: DependencyList = []
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencies are caller-provided to control memoization semantics.
  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    dependencies
  );
}

type LimitedMemoCache<T> = Map<string, { value: T; accessTime: number }>;

export function useLimitedMemo<T>(
  factory: () => T,
  dependencies: DependencyList,
  maxSize = 100
): T {
  const cacheRef = useRef<LimitedMemoCache<T>>(new Map());

  return useMemo(() => {
    const key = JSON.stringify(dependencies);
    const cache = cacheRef.current;
    const now = Date.now();

    const existingEntry = cache.get(key);

    if (existingEntry !== undefined) {
      const entry = existingEntry;
      entry.accessTime = now;
      return entry.value;
    }

    if (cache.size >= maxSize) {
      const entries = [...cache.entries()].sort(
        (a, b) => a[1].accessTime - b[1].accessTime
      );
      const itemsToRemove = Math.max(1, Math.floor(maxSize * 0.25));
      entries.slice(0, itemsToRemove).forEach(([entryKey]) => {
        cache.delete(entryKey);
      });
    }

    const value = factory();
    cache.set(key, { value, accessTime: now });
    return value;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller-supplied dependencies are spread to maintain cache parity alongside factory/maxSize.
  }, [factory, maxSize, ...dependencies]);
}

export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
): {
  visibleItems: Array<{ item: T; index: number; top: number }>;
  totalHeight: number;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  startIndex: number;
  endIndex: number;
} {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = useMemo(() => {
    const sliced = items.slice(startIndex, endIndex + 1);
    return sliced.map((item, offset) => ({
      item,
      index: startIndex + offset,
      top: (startIndex + offset) * itemHeight
    }));
  }, [items, startIndex, endIndex, itemHeight]);

  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    onScroll,
    startIndex,
    endIndex
  };
}

export function useLazyLoading<T extends HTMLElement>(
  threshold = 0.1
): { ref: RefObject<T>; isVisible: boolean } {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const resourceManager = useResourceManager();

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);
    const removeObserver = resourceManager.addObserver(observer);

    return () => {
      removeObserver();
    };
  }, [resourceManager, threshold]);

  return { ref, isVisible };
}

export function useMemoryMonitoring(interval = 10_000): {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
  pressure?: number;
} {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
    pressure?: number;
  }>({});
  const resourceManager = useResourceManager();

  useEffect(() => {
    const tick = () => {
      const memory = (
        performance as Performance & { memory?: PerformanceMemory }
      ).memory;
      if (!memory) {
        return;
      }

      const pressure =
        memory.jsHeapSizeLimit > 0
          ? memory.usedJSHeapSize / memory.jsHeapSizeLimit
          : undefined;

      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        pressure
      });
    };

    tick();
    const timer = setInterval(tick, interval);
    const removeTimer = resourceManager.addTimer(timer);

    return () => {
      removeTimer();
    };
  }, [interval, resourceManager]);

  return memoryInfo;
}

export function useBatchedUpdates(): <T>(batch: () => T) => T {
  const queueRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (queueRef.current.length === 0) {
      return;
    }

    const flush = () => {
      const queue = [...queueRef.current];
      queueRef.current = [];
      queue.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.warn('useBatchedUpdates callback failed', error);
        }
      });
    };

    const id = setTimeout(flush, 0);
    return () => clearTimeout(id);
  });

  return <T>(batch: () => T) => {
    const result = batch();
    queueRef.current.push(() => undefined);
    return result;
  };
}

export const memoryUtils = {
  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) {
      return '0 B';
    }

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formatted = (bytes / Math.pow(k, i)).toFixed(decimals);
    return `${formatted} ${sizes[i] ?? 'B'}`;
  },
  estimateMemoryPressure(
    used: number,
    limit: number
  ): 'low' | 'moderate' | 'high' {
    if (limit === 0) {
      return 'low';
    }

    const ratio = used / limit;
    if (ratio < 0.5) {
      return 'low';
    }
    if (ratio < 0.8) {
      return 'moderate';
    }
    return 'high';
  },
  shouldThrottle(pressure?: number): boolean {
    return typeof pressure === 'number' && pressure > 0.85;
  }
};
