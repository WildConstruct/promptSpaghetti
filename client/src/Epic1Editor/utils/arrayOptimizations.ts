/**
 * Optimized array operations for better performance
 * Replaces inefficient chained operations with single-pass algorithms
 */

/**
 * Filter and map in a single pass
 * Instead of: array.filter(predicate).map(transform)
 */
export function filterMap<T, R>(
  array: T[],
  predicate: (item: T, index: number) => boolean,
  transform: (item: T, index: number) => R
): R[] {
  const result: R[] = [];
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i)) {
      result.push(transform(array[i], i));
    }
  }
  return result;
}

/**
 * Filter and reduce in a single pass
 * Instead of: array.filter(predicate).reduce(reducer, initial)
 */
export function filterReduce<T, R>(
  array: T[],
  predicate: (item: T, index: number) => boolean,
  reducer: (acc: R, item: T, index: number) => R,
  initial: R
): R {
  let result = initial;
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i)) {
      result = reducer(result, array[i], i);
    }
  }
  return result;
}

/**
 * Find and transform in a single pass
 * Instead of: array.map(transform).find(predicate)
 */
export function findMap<T, R>(
  array: T[],
  transform: (item: T, index: number) => R,
  predicate: (item: R, index: number) => boolean
): R | undefined {
  for (let i = 0; i < array.length; i++) {
    const transformed = transform(array[i], i);
    if (predicate(transformed, i)) {
      return transformed;
    }
  }
  return undefined;
}

/**
 * Group by key in a single pass
 * Instead of: multiple filter operations for grouping
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keySelector: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of array) {
    const key = keySelector(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
}

/**
 * Unique values with optional key selector
 * Instead of: array.filter((item, index, self) => self.indexOf(item) === index)
 */
export function unique<T, K = T>(
  array: T[],
  keySelector?: (item: T) => K
): T[] {
  const seen = new Set<K>();
  const result: T[] = [];

  for (const item of array) {
    const key = keySelector ? keySelector(item) : (item as unknown as K);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

/**
 * Partition array into two groups in a single pass
 * Instead of: [array.filter(pred), array.filter(not(pred))]
 */
export function partition<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];

  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i)) {
      truthy.push(array[i]);
    } else {
      falsy.push(array[i]);
    }
  }

  return [truthy, falsy];
}

/**
 * Compute multiple aggregations in a single pass
 * Instead of: multiple reduce operations
 */
type Aggregator<T, Acc> = {
  initial: Acc;
  reducer: (acc: Acc, item: T, index: number) => Acc;
};

type AggregatorMap<T, R extends Record<string, unknown>> = {
  [K in keyof R]: Aggregator<T, R[K]>;
};

export function aggregate<T, R extends Record<string, unknown>>(
  array: T[],
  aggregators: AggregatorMap<T, R>
): R {
  const result = {} as R;
  const keys = Object.keys(aggregators) as Array<keyof R>;

  keys.forEach(key => {
    result[key] = aggregators[key].initial;
  });

  for (let i = 0; i < array.length; i++) {
    keys.forEach(key => {
      const aggregator = aggregators[key];
      result[key] = aggregator.reducer(result[key], array[i], i);
    });
  }

  return result;
}

/**
 * Efficient array difference
 * Instead of: a.filter(x => !b.includes(x))
 */
export function difference<T>(a: T[], b: T[]): T[] {
  const bSet = new Set(b);
  return a.filter(x => !bSet.has(x));
}

/**
 * Efficient array intersection
 * Instead of: a.filter(x => b.includes(x))
 */
export function intersection<T>(a: T[], b: T[]): T[] {
  const bSet = new Set(b);
  return a.filter(x => bSet.has(x));
}

/**
 * Memoized array operation wrapper
 * Caches results for expensive operations
 */
export function memoizeArrayOp<T, Args extends unknown[], R>(
  operation: (array: T[], ...args: Args) => R,
  keyGenerator?: (array: T[], ...args: Args) => string
): (array: T[], ...args: Args) => R {
  const cache = new Map<string, R>();

  return (array: T[], ...args: Args): R => {
    const key = keyGenerator
      ? keyGenerator(array, ...args)
      : JSON.stringify({ length: array.length, args });

    if (cache.has(key)) {
      return cache.get(key) as R;
    }

    const result = operation(array, ...args);
    cache.set(key, result);

    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (typeof firstKey === 'string') {
        cache.delete(firstKey);
      }
    }

    return result;
  };
}
