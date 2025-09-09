import { useRef } from 'react';

export function usePreviewCache() {
  const ref = useRef<Map<string, unknown>>(new Map());
  return {
    get<T>(key: string): T | undefined {
      return ref.current.get(key) as T | undefined;
    },
    set<T>(key: string, value: T) {
      ref.current.set(key, value);
    },
    has(key: string) {
      return ref.current.has(key);
    }
  };
}
