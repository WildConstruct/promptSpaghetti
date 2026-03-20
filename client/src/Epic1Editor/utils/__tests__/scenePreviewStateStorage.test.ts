import {
  readScenePreviewStateMapFromStorage,
  writeScenePreviewStateMapToStorage,
  SCENE_PREVIEW_STATE_STORAGE_KEY
} from '../scenePreviewStateStorage';

describe('scenePreviewStateStorage', () => {
  it('round-trips a scene preview state map', () => {
    const storage = {
      value: null as string | null,
      getItem: jest.fn((key: string) =>
        key === SCENE_PREVIEW_STATE_STORAGE_KEY ? storage.value : null
      ),
      setItem: jest.fn((key: string, value: string) => {
        if (key === SCENE_PREVIEW_STATE_STORAGE_KEY) {
          storage.value = value;
        }
      }),
      removeItem: jest.fn((key: string) => {
        if (key === SCENE_PREVIEW_STATE_STORAGE_KEY) {
          storage.value = null;
        }
      })
    };

    writeScenePreviewStateMapToStorage(storage, {
      'bootstrap-group-1': {
        placements: [
          {
            id: 'wall-1',
            surface: 'wall',
            label: 'neon wall sign',
            provenance: 'mock-image-preview:7001',
            previewSource: 'cached'
          }
        ],
        usedCachedPreviewResultIds: ['preview-cached-1'],
        mode: 'grouped'
      }
    });

    expect(readScenePreviewStateMapFromStorage(storage)).toEqual({
      'bootstrap-group-1': {
        placements: [
          {
            id: 'wall-1',
            surface: 'wall',
            label: 'neon wall sign',
            provenance: 'mock-image-preview:7001',
            previewSource: 'cached'
          }
        ],
        usedCachedPreviewResultIds: ['preview-cached-1'],
        mode: 'grouped'
      }
    });
  });

  it('drops invalid entries and clears storage for an empty map', () => {
    const storage = {
      value: JSON.stringify({
        valid: {
          placements: [
            {
              id: 'floor-1',
              surface: 'floor',
              label: 'crate',
              provenance: 'fixture'
            }
          ],
          usedCachedPreviewResultIds: [],
          mode: 'isolated'
        },
        invalid: {
          placements: 'nope'
        }
      }),
      getItem: jest.fn(() => storage.value),
      setItem: jest.fn(),
      removeItem: jest.fn(() => {
        storage.value = null;
      })
    };

    expect(readScenePreviewStateMapFromStorage(storage)).toEqual({
      valid: {
        placements: [
          {
            id: 'floor-1',
            surface: 'floor',
            label: 'crate',
            provenance: 'fixture'
          }
        ],
        usedCachedPreviewResultIds: [],
        mode: 'isolated'
      }
    });

    writeScenePreviewStateMapToStorage(storage, {});
    expect(storage.removeItem).toHaveBeenCalledWith(
      SCENE_PREVIEW_STATE_STORAGE_KEY
    );
  });
});
