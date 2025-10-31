import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

interface NeatenSettings {
  gridSize: number;
  rowSnap: number;
  setGridSize: (value: number) => void;
  setRowSnap: (value: number) => void;
}

const DEFAULTS: NeatenSettings = {
  gridSize: 20,
  rowSnap: 40,
  setGridSize: () => undefined,
  setRowSnap: () => undefined
};

const STORAGE_KEY = 'epic1.neaten.settings';

const NeatenSettingsContext = createContext<NeatenSettings | null>(null);

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const readSettings = (): Pick<NeatenSettings, 'gridSize' | 'rowSnap'> => {
  try {
    if (typeof window === 'undefined') {
      return { gridSize: DEFAULTS.gridSize, rowSnap: DEFAULTS.rowSnap };
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { gridSize: DEFAULTS.gridSize, rowSnap: DEFAULTS.rowSnap };
    }

    const parsed = JSON.parse(raw) as Partial<NeatenSettings>;
    const gridSize = typeof parsed.gridSize === 'number' ? parsed.gridSize : DEFAULTS.gridSize;
    const rowSnap = typeof parsed.rowSnap === 'number' ? parsed.rowSnap : DEFAULTS.rowSnap;
    return { gridSize, rowSnap };
  } catch (error) {
    console.warn('[NeatenSettings] Failed to read settings', error);
    return { gridSize: DEFAULTS.gridSize, rowSnap: DEFAULTS.rowSnap };
  }
};

const writeSettings = (settings: { gridSize: number; rowSnap: number }) => {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('[NeatenSettings] Failed to persist settings', error);
  }
};

export const NeatenSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [{ gridSize, rowSnap }, setSettings] = useState(() => readSettings());

  const setGridSize = useCallback((value: number) => {
    setSettings(prev => {
      const nextGrid = clamp(Math.round(value), 5, 200);
      if (nextGrid === prev.gridSize) {
        return prev;
      }
      const next = { ...prev, gridSize: nextGrid };
      writeSettings(next);
      return next;
    });
  }, []);

  const setRowSnap = useCallback((value: number) => {
    setSettings(prev => {
      const nextSnap = clamp(Math.round(value), 10, 300);
      if (nextSnap === prev.rowSnap) {
        return prev;
      }
      const next = { ...prev, rowSnap: nextSnap };
      writeSettings(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const settings = readSettings();
    setSettings(settings);
  }, []);

  const value = useMemo<NeatenSettings>(
    () => ({ gridSize, rowSnap, setGridSize, setRowSnap }),
    [gridSize, rowSnap, setGridSize, setRowSnap]
  );

  return (
    <NeatenSettingsContext.Provider value={value}>
      {children}
    </NeatenSettingsContext.Provider>
  );
};

export function useNeatenSettings(): NeatenSettings {
  const context = useContext(NeatenSettingsContext);
  return context ?? DEFAULTS;
}

