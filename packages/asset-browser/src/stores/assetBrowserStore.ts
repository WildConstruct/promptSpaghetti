import { create } from 'zustand';
import type { Preset } from '../types';
import { LibraryService } from '../services/LibraryService';
import Fuse from 'fuse.js';
import { parseManifest, type NormalizedPresetEntry } from '../services/ManifestParser';

export type AssetBrowserState = {
  presets: Preset[];
  filteredPresets: Preset[];
  availableTags: string[];
  activeTags: string[];
  query: string;
  // scan / ingestion
  scanStatus: 'idle' | 'scanning' | 'done' | 'error';
  error: string | null;
  libraryIndex: NormalizedPresetEntry[];
  // focus model
  focusArea: 'sidebar' | 'grid';
  focusIndex: number; // index within area
  sidebarCount: number;
  gridColumnCount: number;
  gridItemCount: number;
  selectedPresetId: string | null;
  detailsOpen: boolean;
  setDetailsOpen: (o: boolean) => void;
  selectPreset: (id: string) => void;
  moveSelection: (dir: 'up' | 'down' | 'left' | 'right') => void;
  toggleTag: (t: string) => void;
  setQuery: (q: string) => void;
  setSidebarCount: (n: number) => void;
  setGridMetrics: (c: { columnCount: number; itemCount: number }) => void;
  setFocus: (area: 'sidebar' | 'grid', index: number) => void;
  // scan entry point
  scan: (manifests: unknown[]) => Promise<void>;
};

const initial: Omit<AssetBrowserState, 'setDetailsOpen' | 'selectPreset' | 'moveSelection' | 'toggleTag' | 'setQuery' | 'setSidebarCount' | 'setGridMetrics' | 'setFocus' | 'scan'> = {
  presets: [],
  filteredPresets: [],
  availableTags: [],
  activeTags: [],
  query: '',
  scanStatus: 'idle',
  error: null,
  libraryIndex: [],
  focusArea: 'sidebar',
  focusIndex: 0,
  sidebarCount: 0,
  gridColumnCount: 1,
  gridItemCount: 0,
  selectedPresetId: null,
  detailsOpen: false,
};

export const useAssetBrowserStore = create<AssetBrowserState>((set, get) => ({
  ...initial,
  setDetailsOpen: (o) => set({ detailsOpen: o }),
  selectPreset: (id) => set({ selectedPresetId: id }),
  scan: async (manifests: unknown[]) => {
    // Start scan
    set({ scanStatus: 'scanning', error: null });
    const errors: string[] = [];
    const collected: NormalizedPresetEntry[] = [];
    for (const m of manifests) {
      try {
        const res = parseManifest(m);
        collected.push(...res.presets);
      } catch (e: unknown) {
        errors.push(e instanceof Error ? e.message : 'Unknown manifest error');
      }
    }
    if (errors.length) {
      set({ scanStatus: 'error', error: `${errors.length} error(s) during scan` });
      return;
    }
    // Build UI presets from normalized entries (non-invasive projection)
    const uiPresets: Preset[] = collected.map((p) => ({
      id: p.id,
      name: p.id,
      tags: p.tags,
      type: 'unknown',
    }));
    const tags = Array.from(new Set(uiPresets.flatMap((p) => p.tags))).sort();
    const filtered = applyFilters(uiPresets, get().activeTags, get().query);
    set({
      libraryIndex: collected,
      presets: uiPresets,
      filteredPresets: filtered,
      availableTags: tags,
      scanStatus: 'done',
      error: null,
      gridItemCount: filtered.length,
    });
  },
  moveSelection: (dir) => {
    const {
      focusArea,
      focusIndex,
      sidebarCount,
      gridColumnCount,
      gridItemCount,
    } = get();
    if (focusArea === 'sidebar') {
      if (dir === 'up') return set({ focusIndex: Math.max(0, focusIndex - 1) });
      if (dir === 'down') return set({ focusIndex: Math.min(Math.max(0, sidebarCount - 1), focusIndex + 1) });
      if (dir === 'right') {
        const first = get().filteredPresets[0];
        if (first) return set({ focusArea: 'grid', focusIndex: 0, selectedPresetId: first.id });
        return set({ focusArea: 'grid', focusIndex: 0 });
      }
      return; // left on sidebar: no-op
    } else {
      // grid
      const cols = Math.max(1, gridColumnCount);
      let next = focusIndex;
      if (dir === 'left') {
        // if at column 0, move to sidebar
        if (focusIndex % cols === 0) return set({ focusArea: 'sidebar', focusIndex: 0 });
        next = Math.max(0, focusIndex - 1);
      } else if (dir === 'right') {
        next = Math.min(gridItemCount - 1, focusIndex + 1);
      } else if (dir === 'up') {
        next = Math.max(0, focusIndex - cols);
      } else if (dir === 'down') {
        next = Math.min(gridItemCount - 1, focusIndex + cols);
      }
      set({ focusIndex: next });
      const p = get().filteredPresets[next];
      if (p) set({ selectedPresetId: p.id });
    }
  },
  toggleTag: (t) => {
    const { activeTags } = get();
    const next = activeTags.includes(t) ? activeTags.filter((x) => x !== t) : [...activeTags, t];
    const filtered = applyFilters(get().presets, next, get().query);
    set({ activeTags: next, filteredPresets: filtered });
  },
  setQuery: (q) => {
    const filtered = applyFilters(get().presets, get().activeTags, q);
    set({ query: q, filteredPresets: filtered });
  },
  setSidebarCount: (n) => set({ sidebarCount: n, focusIndex: Math.min(get().focusIndex, Math.max(0, n - 1)) }),
  setGridMetrics: ({ columnCount, itemCount }) => set({ gridColumnCount: columnCount, gridItemCount: itemCount }),
  setFocus: (area, index) => set({ focusArea: area, focusIndex: index }),
}));

function applyFilters(presets: Preset[], tags: string[], query: string) {
  let pool = presets;
  if (tags.length) {
    pool = pool.filter((p) => tags.every((t) => p.tags.includes(t)));
  }
  if (query && query.trim().length > 0) {
    const fuse = new Fuse(pool, {
      keys: ['name', 'tags'],
      threshold: 0.4,
      ignoreLocation: true,
    });
    return fuse.search(query).map((r) => r.item);
  }
  return pool;
}

// bootstrap with stub data for now
void (async () => {
  const data = await LibraryService.listPresets();
  const tags = Array.from(new Set(data.flatMap((p) => p.tags))).sort();
  useAssetBrowserStore.setState({ presets: data, filteredPresets: data, availableTags: tags });
})();
