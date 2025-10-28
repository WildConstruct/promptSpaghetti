import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type NeatenSettings = {
  gridSize: number;
  rowSnap: number;
  setGridSize: (n: number) => void;
  setRowSnap: (n: number) => void;
};

const DEFAULTS = { gridSize: 20, rowSnap: 40 };
const KEY = 'epic1.neaten.settings';

const Ctx = createContext<NeatenSettings | null>(null);

export const NeatenSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gridSize, setGrid] = useState(DEFAULTS.gridSize);
  const [rowSnap, setRow] = useState(DEFAULTS.rowSnap);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const v = JSON.parse(raw);
        if (typeof v.gridSize === 'number') setGrid(v.gridSize);
        if (typeof v.rowSnap === 'number') setRow(v.rowSnap);
      }
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ gridSize, rowSnap }));
    } catch {}
  }, [gridSize, rowSnap]);

  const setGridSize = useCallback((n: number) => setGrid(Math.max(5, Math.min(200, Math.round(n)))), []);
  const setRowSnap = useCallback((n: number) => setRow(Math.max(10, Math.min(300, Math.round(n)))), []);

  const value = useMemo(() => ({ gridSize, rowSnap, setGridSize, setRowSnap }), [gridSize, rowSnap, setGridSize, setRowSnap]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useNeatenSettings(): NeatenSettings {
  const ctx = useContext(Ctx);
  if (!ctx) return { ...DEFAULTS, setGridSize: () => {}, setRowSnap: () => {} };
  return ctx;
}

