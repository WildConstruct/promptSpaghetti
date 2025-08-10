/**
 * Performance utilities for React components
 */

import { memo } from 'react';
import type { ComponentType } from 'react';

/**
 * Deep comparison function for React.memo
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

/**
 * Shallow comparison function for React.memo
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
}

/**
 * Create a memoized component with custom comparison
 */
export function memoWithCompare<P extends object>(
  Component: ComponentType<P>,
  compareFunction: (prevProps: P, nextProps: P) => boolean = shallowEqual
) {
  return memo(Component, compareFunction);
}

/**
 * Debounce hook for expensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Throttle hook for rate-limiting operations
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRun = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= limit) {
        setThrottledValue(value);
        lastRun.current = Date.now();
      }
    }, limit - (Date.now() - lastRun.current));
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);
  
  return throttledValue;
}

// Need to import these for the hooks
import { useState, useEffect, useRef } from 'react';