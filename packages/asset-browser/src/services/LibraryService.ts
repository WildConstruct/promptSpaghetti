import type { Preset } from '../types';
import { parseManifest, type NormalizedPresetEntry } from './ManifestParser';

export const LibraryService = {
  async listPresets(): Promise<Preset[]> {
    return [];
  },
  async scanLibraries(manifests: unknown[]): Promise<NormalizedPresetEntry[]> {
    const entries: NormalizedPresetEntry[] = [];
    const errors: string[] = [];
    for (const m of manifests) {
      try {
        const result = await Promise.resolve(parseManifest(m));
        entries.push(...result.presets);
      } catch (e: unknown) {
        errors.push(e instanceof Error ? e.message : 'Unknown manifest error');
      }
    }
    if (errors.length) {
      throw new Error(`${errors.length} error(s) during scan`);
    }
    return entries;
  }
};
