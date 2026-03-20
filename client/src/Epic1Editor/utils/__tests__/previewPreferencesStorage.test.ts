import {
  readPreviewPreferencesFromStorage,
  writePreviewPreferencesToStorage
} from '../previewPreferencesStorage';

describe('previewPreferencesStorage', () => {
  it('round-trips preview preferences', () => {
    const storage = {
      value: null as string | null,
      getItem: jest.fn(() => storage.value),
      setItem: jest.fn((_key: string, value: string) => {
        storage.value = value;
      }),
      removeItem: jest.fn(() => {
        storage.value = null;
      })
    };

    writePreviewPreferencesToStorage(storage, {
      bootstrap: {
        backendId: 'mock-image-preview',
        model: 'bootstrap-fast-v1'
      },
      scene: {
        backendId: 'mock-scene-preview',
        model: 'scene-comprehension-v1'
      }
    });

    expect(readPreviewPreferencesFromStorage(storage)).toEqual({
      bootstrap: {
        backendId: 'mock-image-preview',
        model: 'bootstrap-fast-v1'
      },
      scene: {
        backendId: 'mock-scene-preview',
        model: 'scene-comprehension-v1'
      }
    });
  });

  it('returns null preferences for invalid payloads', () => {
    const storage = {
      getItem: jest.fn(
        () => '{"bootstrap":{"backendId":42,"model":false},"scene":"bad"}'
      )
    };

    expect(readPreviewPreferencesFromStorage(storage)).toEqual({
      bootstrap: {
        backendId: null,
        model: null
      },
      scene: {
        backendId: null,
        model: null
      }
    });
  });

  it('reads the older single-preference shape as both contexts', () => {
    const storage = {
      getItem: jest.fn(
        () => '{"backendId":"mock-image-preview","model":"bootstrap-deterministic-v1"}'
      )
    };

    expect(readPreviewPreferencesFromStorage(storage)).toEqual({
      bootstrap: {
        backendId: 'mock-image-preview',
        model: 'bootstrap-deterministic-v1'
      },
      scene: {
        backendId: 'mock-image-preview',
        model: 'bootstrap-deterministic-v1'
      }
    });
  });

  it('clears storage when both values are null', () => {
    const storage = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };

    writePreviewPreferencesToStorage(storage, {
      bootstrap: {
        backendId: null,
        model: null
      },
      scene: {
        backendId: null,
        model: null
      }
    });

    expect(storage.removeItem).toHaveBeenCalledTimes(1);
  });
});
