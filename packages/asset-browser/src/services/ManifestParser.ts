import {
  validateMinimalManifest,
  validateNpmStyleManifest
} from './PresetValidator';

export type NormalizedPresetEntry = {
  id: string;
  path: string;
  tags: string[];
  nodeTypes: string[];
  thumbnail?: string;
};

export type ParseResult = {
  type: 'minimal' | 'npm-style';
  presets: NormalizedPresetEntry[];
};

export function parseManifest(input: unknown): ParseResult {
  // Try minimal first
  try {
    const m = validateMinimalManifest(input);
    return {
      type: 'minimal',
      presets: m.presets.map(p => ({
        id: p.id,
        path: p.path,
        tags: p.tags ?? [],
        nodeTypes: p.nodeTypes ?? [],
        thumbnail: p.thumbnail
      }))
    };
  } catch {
    // fallthrough
  }

  // Try npm-style
  const n = validateNpmStyleManifest(input);
  return {
    type: 'npm-style',
    presets: n.presetLibrary.presets.map(p => ({
      id: p.id,
      path: p.path,
      tags: p.tags ?? [],
      nodeTypes: p.nodeTypes ?? [],
      thumbnail: p.thumbnail
    }))
  };
}
