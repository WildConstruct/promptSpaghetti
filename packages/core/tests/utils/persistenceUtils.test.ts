import * as persistenceUtils from '../../utils/persistenceUtils';
import {
  COMPRESSION_THRESHOLD,
  STORAGE_KEY,
  STORAGE_VERSION
} from '../../utils/persistenceUtils';
import { compress, decompress } from 'lz-string';

jest.mock('lz-string', () => {
  const compressMock = jest
    .fn((data: string) => `compressed:${data}`)
    .mockName('compress');
  const decompressMock = jest
    .fn((data: string) =>
      data.startsWith('compressed:') ? data.slice('compressed:'.length) : data
    )
    .mockName('decompress');

  return {
    __esModule: true,
    compress: compressMock,
    decompress: decompressMock
  };
});

const compressMock = compress as unknown as jest.Mock;
const decompressMock = decompress as unknown as jest.Mock;

type StorageWithExtras = Storage & Record<string, string>;

const createStorageMock = (): {
  storage: StorageWithExtras;
  store: Map<string, string>;
} => {
  const store = new Map<string, string>();
  const storage: Partial<Storage> & Record<string, string> = {
    getItem: jest.fn((key: string) => store.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store.set(key, value);
      Object.defineProperty(storage, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    }),
    removeItem: jest.fn((key: string) => {
      store.delete(key);
      delete storage[key];
    }),
    clear: jest.fn(() => {
      store.clear();
      Object.keys(storage).forEach(key => {
        if (
          !['getItem', 'setItem', 'removeItem', 'clear', 'key'].includes(key)
        ) {
          delete storage[key];
        }
      });
    }),
    key: jest.fn((index: number) => Array.from(store.keys())[index] ?? null)
  };

  Object.defineProperty(storage, 'length', {
    get: () => store.size
  });

  return { storage: storage as StorageWithExtras, store };
};

let originalLocalStorage: Storage;
let originalDispatchEvent: typeof window.dispatchEvent;

beforeAll(() => {
  originalLocalStorage = window.localStorage;
  originalDispatchEvent = window.dispatchEvent.bind(window);
});

afterAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: originalLocalStorage,
    configurable: true
  });
  Object.defineProperty(window, 'dispatchEvent', {
    value: originalDispatchEvent,
    configurable: true
  });
});

describe('persistenceUtils', () => {
  let storageMock: StorageWithExtras;
  let dispatchEventSpy: jest.Mock;

  const resetCompressionMocks = () => {
    compressMock.mockReset();
    compressMock.mockImplementation((data: string) => `compressed:${data}`);
    decompressMock.mockReset();
    decompressMock.mockImplementation((data: string) =>
      data.startsWith('compressed:') ? data.slice('compressed:'.length) : data
    );
  };

  beforeEach(() => {
    const { storage } = createStorageMock();
    storageMock = storage;

    Object.defineProperty(window, 'localStorage', {
      value: storageMock,
      configurable: true
    });

    dispatchEventSpy = jest.fn().mockReturnValue(true);
    Object.defineProperty(window, 'dispatchEvent', {
      value: dispatchEventSpy,
      configurable: true
    });

    resetCompressionMocks();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    resetCompressionMocks();
  });

  it('detects unavailable storage when operations throw', () => {
    const original = storageMock.setItem;
    storageMock.setItem = jest.fn(() => {
      throw new Error('blocked');
    }) as any;

    expect(persistenceUtils.isStorageAvailable()).toBe(false);

    storageMock.setItem = original;
  });

  it('calculates storage usage and availability', () => {
    storageMock.setItem('alpha', 'a'.repeat(32));
    storageMock.setItem('beta', 'b'.repeat(48));

    const quota = persistenceUtils.checkStorageQuota();

    expect(quota.used).toBeGreaterThan(0);
    expect(quota.available).toBe(true);
    expect(quota.percentage).toBeGreaterThan(0);
  });

  it('reports key sizes through getStorageSize helper', () => {
    const missing = persistenceUtils.getStorageSize('absent-key');
    expect(missing).toBe(0);

    storageMock.setItem('measured', 'payload:12345');
    const measured = persistenceUtils.getStorageSize('measured');
    expect(measured).toBeGreaterThan(0);
    expect(measured).toBeGreaterThanOrEqual('payload:12345'.length);
  });

  it('returns fallback quota metrics when iteration fails', () => {
    const failingStorage: Storage & Record<string, unknown> = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      key: jest.fn(),
      length: 0
    } as unknown as Storage & Record<string, unknown>;

    Object.defineProperty(failingStorage, 'trouble', {
      enumerable: true,
      get() {
        throw new Error('boom');
      }
    });

    Object.defineProperty(window, 'localStorage', {
      value: failingStorage,
      configurable: true
    });

    const quota = persistenceUtils.checkStorageQuota();
    expect(quota.available).toBe(false);
    expect(quota.used).toBe(0);
    expect(quota.percentage).toBe(100);
  });

  it('compresses payloads that cross the threshold', () => {
    compressMock.mockImplementationOnce(() => 'tiny');
    const hugePayload = 'x'.repeat(COMPRESSION_THRESHOLD + 512);

    const result = persistenceUtils.maybeCompress(hugePayload);

    expect(result.compressed).toBe(true);
    expect(result.data).toBe('tiny');
  });

  it('skips compression when no benefit is achieved', () => {
    compressMock.mockImplementationOnce(data => data);
    const payload = 'short text';

    const result = persistenceUtils.maybeCompress(payload);

    expect(result.compressed).toBe(false);
    expect(result.data).toBe(payload);
  });

  it('returns original payload when decompression fails', () => {
    decompressMock.mockImplementationOnce(() => {
      throw new Error('inflate');
    });

    const fallback = persistenceUtils.maybeDecompress('raw', true);
    expect(fallback).toBe('raw');
  });

  it('validates persisted state schema and logs in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const valid = persistenceUtils.validatePersistedState({
      nodes: [],
      edges: []
    });
    expect(valid).toEqual({ nodes: [], edges: [] });

    const invalid = persistenceUtils.validatePersistedState({});
    expect(invalid).toBeNull();
    expect(errorSpy).toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
    errorSpy.mockRestore();
  });

  it('loads persisted state when wrapper and schema are valid', () => {
    const state = JSON.stringify({ nodes: [], edges: [] });
    storageMock.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state,
        version: STORAGE_VERSION,
        timestamp: 123,
        compressed: false,
        size: state.length
      })
    );

    const data = persistenceUtils.persistenceStorage.getItem(STORAGE_KEY);
    expect(data).toBe(state);
  });

  it('returns null when storage version mismatches', () => {
    const state = JSON.stringify({ nodes: [], edges: [] });
    storageMock.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state,
        version: STORAGE_VERSION + 1,
        timestamp: 99,
        compressed: false,
        size: state.length
      })
    );

    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const result = persistenceUtils.persistenceStorage.getItem(STORAGE_KEY);

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('sanitizes corrupted persisted payloads', () => {
    storageMock.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: JSON.stringify({
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 }
        }),
        version: STORAGE_VERSION,
        timestamp: 42,
        compressed: false,
        size: 10
      })
    );

    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    // Break validation by replacing nodes with string
    storageMock.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: JSON.stringify({ nodes: 'broken', edges: [] }),
        version: STORAGE_VERSION,
        timestamp: 42,
        compressed: false,
        size: 10
      })
    );

    const result = persistenceUtils.persistenceStorage.getItem(STORAGE_KEY);
    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('recovers from decompression failures while loading', () => {
    const state = JSON.stringify({ nodes: [], edges: [] });
    decompressMock.mockImplementationOnce(() => {
      throw new Error('decode');
    });

    storageMock.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state,
        version: STORAGE_VERSION,
        timestamp: 77,
        compressed: true,
        size: state.length
      })
    );

    const result = persistenceUtils.persistenceStorage.getItem(STORAGE_KEY);
    expect(result).toBe(state);
  });

  it('handles getItem failures gracefully', () => {
    storageMock.setItem(STORAGE_KEY, '{invalid json');

    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const result = persistenceUtils.persistenceStorage.getItem(STORAGE_KEY);
    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('skips persistence writes when storage is unavailable', () => {
    const originalSetItem = storageMock.setItem;
    storageMock.setItem = jest.fn((key: string, value: string) => {
      if (key === '__storage_test__') {
        throw new Error('blocked');
      }
      return originalSetItem.call(storageMock, key, value);
    }) as any;

    persistenceUtils.persistenceStorage.setItem(STORAGE_KEY, '{}');

    expect(storageMock.setItem).toHaveBeenCalledTimes(1);
    expect(storageMock.getItem(STORAGE_KEY)).toBeNull();

    storageMock.setItem = originalSetItem;
  });

  it('dispatches quota events when storage is saturated', () => {
    const ballast = 'x'.repeat(
      Math.ceil(persistenceUtils.MAX_STORAGE_SIZE * 0.92)
    );
    storageMock.setItem('ballast', ballast);

    persistenceUtils.persistenceStorage.setItem(STORAGE_KEY, '{}');

    expect(dispatchEventSpy).toHaveBeenCalled();
    const dispatchedEvent = dispatchEventSpy.mock.calls[0][0];
    expect(dispatchedEvent.type).toBe('storage-quota-exceeded');
    expect(dispatchedEvent.detail.used).toBeGreaterThan(0);
    expect(dispatchedEvent.detail.percentage).toBeGreaterThanOrEqual(90);
    expect(storageMock.getItem(STORAGE_KEY)).toBeNull();
  });

  it('persists compressed payloads and tracks metadata', () => {
    compressMock.mockImplementationOnce(() => 'tiny');
    const payload = 'x'.repeat(COMPRESSION_THRESHOLD + 256);

    persistenceUtils.persistenceStorage.setItem(STORAGE_KEY, payload);

    const saved = storageMock.getItem(STORAGE_KEY);
    expect(saved).not.toBeNull();

    const wrapper = JSON.parse(saved as string);
    expect(wrapper.compressed).toBe(true);
    expect(wrapper.version).toBe(STORAGE_VERSION);
    expect(typeof wrapper.timestamp).toBe('number');
  });

  it('emits quota events when browser throws quota errors', () => {
    const originalSetItem = storageMock.setItem;
    storageMock.setItem = jest.fn((key: string, value: string) => {
      if (key === STORAGE_KEY) {
        const quotaError = new DOMException('Full', 'QuotaExceededError');
        throw quotaError;
      }
      return originalSetItem.call(storageMock, key, value);
    }) as any;

    persistenceUtils.persistenceStorage.setItem(STORAGE_KEY, '{}');

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'storage-quota-exceeded' })
    );

    storageMock.setItem = originalSetItem;
  });

  it('removes persisted state when requested', () => {
    persistenceUtils.persistenceStorage.removeItem(STORAGE_KEY);
    expect(storageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('clears persisted state through helper', () => {
    persistenceUtils.clearPersistedState();
    expect(storageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('inspects persisted state metadata', () => {
    const wrapper = {
      state: JSON.stringify({ nodes: [], edges: [] }),
      version: STORAGE_VERSION,
      timestamp: 321,
      compressed: true,
      size: 42
    };
    storageMock.setItem(STORAGE_KEY, JSON.stringify(wrapper));

    const info = persistenceUtils.getPersistedStateInfo();

    expect(info).toEqual({
      exists: true,
      size: 42,
      compressed: true,
      timestamp: 321
    });
  });

  it('returns graceful fallback when persisted info is missing', () => {
    storageMock.removeItem(STORAGE_KEY);
    const info = persistenceUtils.getPersistedStateInfo();

    expect(info).toEqual({
      exists: false,
      size: 0,
      compressed: false,
      timestamp: null
    });
  });

  it('returns null when persisted info cannot be parsed', () => {
    storageMock.setItem(STORAGE_KEY, 'not-json');
    const info = persistenceUtils.getPersistedStateInfo();

    expect(info).toBeNull();
  });
});
