/**
 * Shared mock helpers for the test suite.
 */

import { jest } from '@jest/globals';

export function createLocalStorageMock(): Storage {
  const storage = new Map<string, string>();

  return {
    getItem: jest.fn((key: string) => (storage.has(key) ? storage.get(key) ?? null : null)),
    setItem: jest.fn((key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: jest.fn((key: string) => {
      storage.delete(key);
    }),
    clear: jest.fn(() => {
      storage.clear();
    }),
    key: jest.fn((index: number) => Array.from(storage.keys())[index] ?? null),
    get length() {
      return storage.size;
    }
  } as Storage;
}

export function createWebSocketMock(): WebSocket {
  const eventListeners = new Map<string, Array<(event: Event) => void>>();

  const mockSocket = {
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn((event: string, listener: (event: Event) => void) => {
      const listeners = eventListeners.get(event) ?? [];
      listeners.push(listener);
      eventListeners.set(event, listeners);
    }),
    removeEventListener: jest.fn((event: string, listener: (event: Event) => void) => {
      const listeners = eventListeners.get(event);
      if (!listeners) {
        return;
      }

      const index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    }),
    dispatchEvent: jest.fn((event: Event) => {
      const listeners = eventListeners.get(event.type) ?? [];
      listeners.forEach((listener) => listener(event));
      return true;
    }),
    simulateMessage: (data: unknown) => {
      const messageEvent = new MessageEvent('message', { data });
      const listeners = eventListeners.get('message') ?? [];
      listeners.forEach((listener) => listener(messageEvent));
    },
    readyState: WebSocket.OPEN
  } as unknown as WebSocket;

  return mockSocket;
}

export function createIntersectionObserverMock(): typeof IntersectionObserver {
  const mockObserve = jest.fn();
  const mockUnobserve = jest.fn();
  const mockDisconnect = jest.fn();

  return jest.fn().mockImplementation(() => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect
  })) as unknown as typeof IntersectionObserver;
}

export function createResizeObserverMock(): typeof ResizeObserver {
  const mockObserve = jest.fn();
  const mockUnobserve = jest.fn();
  const mockDisconnect = jest.fn();

  return jest.fn().mockImplementation(() => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect
  })) as unknown as typeof ResizeObserver;
}

export function createFileReaderMock(): FileReader {
  const fileReader = {
    result: null as string | ArrayBuffer | null,
    error: null as ProgressEvent<FileReader> | null,
    readyState: FileReader.EMPTY,
    onload: null as FileReader['onload'],
    onerror: null as FileReader['onerror'],
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    readAsText: jest.fn(),
    readAsDataURL: jest.fn(),
    readAsArrayBuffer: jest.fn(),
    abort: jest.fn()
  } as unknown as FileReader;

  return fileReader;
}

export function mockCanvas(): void {
  // jsdom does not implement canvas; provide minimal mock.
  const context2D = {
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Uint8ClampedArray() })),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    arc: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 }))
  };

  const canvas = document.createElement('canvas');
  jest.spyOn(canvas, 'getContext').mockImplementation((type: string) => {
    if (type === '2d') {
      return context2D as unknown as CanvasRenderingContext2D;
    }

    return null;
  });
}

export function mockDate(isoDate: string): () => void {
  const mocked = new Date(isoDate);
  const OriginalDate = Date;

  class MockedDate extends Date {
    constructor(...args: ConstructorParameters<typeof Date>) {
      if (args.length === 0) {
        super(mocked.getTime());
        return;
      }

      super(...args);
    }

    static now(): number {
      return mocked.getTime();
    }
  }

  globalThis.Date = MockedDate as DateConstructor;

  return () => {
    globalThis.Date = OriginalDate;
  };
}

export function mockTimers(): {
  advanceByTime: (ms: number) => void;
  runAllTimers: () => void;
  runOnlyPendingTimers: () => void;
  cleanup: () => void;
} {
  jest.useFakeTimers();

  return {
    advanceByTime: (ms: number) => jest.advanceTimersByTime(ms),
    runAllTimers: () => jest.runAllTimers(),
    runOnlyPendingTimers: () => jest.runOnlyPendingTimers(),
    cleanup: () => jest.useRealTimers()
  };
}
