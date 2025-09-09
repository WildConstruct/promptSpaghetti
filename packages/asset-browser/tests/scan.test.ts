import { act } from '@testing-library/react';
import { useAssetBrowserStore } from '../src/stores/assetBrowserStore';

const minimal = {
  presets: [
    { id: 'a', path: './a.psglib', tags: ['t1'], nodeTypes: ['LLM'] },
    { id: 'b', path: './b.psglib', tags: ['t2'] }
  ]
};

const npmStyle = {
  name: '@org/lib',
  version: '0.1.0',
  presetLibrary: {
    presets: [{ id: 'c', path: 'dist/c.psglib', tags: ['t1', 't3'] }]
  }
};

describe('Store scan workflow', () => {
  test('scans and populates presets/tags', async () => {
    await act(async () => {
      await useAssetBrowserStore.getState().scan([minimal, npmStyle]);
    });
    const s = useAssetBrowserStore.getState();
    expect(s.scanStatus).toBe('done');
    expect(s.presets.map(p => p.id).sort()).toEqual(['a', 'b', 'c']);
    expect(s.availableTags).toEqual(['t1', 't2', 't3']);
  });

  test('scan error is reported', async () => {
    const bad = { presets: [{ path: './missing.psglib' }] } as any;
    await act(async () => {
      await useAssetBrowserStore.getState().scan([bad]);
    });
    const s = useAssetBrowserStore.getState();
    expect(s.scanStatus).toBe('error');
    expect(s.error).toMatch(/error\(s\) during scan/i);
  });
});
