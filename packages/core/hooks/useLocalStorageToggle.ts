import { useCallback, useEffect, useState } from 'react';

export function useLocalStorageToggle(key: string, defaultValue: boolean) {
  const [value, setValue] = useState<boolean>(() => {
    try {
      const v = window?.localStorage?.getItem(key);
      if (v === null) return defaultValue;
      return v === 'true';
    } catch {
      return defaultValue;
    }
  });

  const set = useCallback(
    (next: boolean) => {
      setValue(next);
      try {
        window?.localStorage?.setItem(key, String(next));
      } catch {}
    },
    [key]
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue != null) setValue(e.newValue === 'true');
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  return [value, set] as const;
}
