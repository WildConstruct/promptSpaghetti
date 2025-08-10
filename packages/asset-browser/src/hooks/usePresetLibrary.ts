import { useMemo } from 'react';
import { useAssetBrowserStore } from '../stores/assetBrowserStore';

export type PresetIndexItem = {
  id: string;
  name?: string;
  tags: string[];
  type?: string;
};

export function usePresetLibrary() {
  const presets = useAssetBrowserStore((s) => s.presets);
  const filtered = useAssetBrowserStore((s) => s.filteredPresets);
  const activeTags = useAssetBrowserStore((s) => s.activeTags);
  const scanStatus = useAssetBrowserStore((s) => s.scanStatus);
  const error = useAssetBrowserStore((s) => s.error);
  const scan = useAssetBrowserStore((s) => s.scan);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of presets) {
      for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag));
  }, [presets]);

  return {
    all: presets as PresetIndexItem[],
    filtered: filtered as PresetIndexItem[],
    tags,
    activeTags,
    scanStatus,
    error,
    scan,
  };
}
