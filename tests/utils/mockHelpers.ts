/**
 * Mock Helpers for Testing
 * Centralized mock utilities for consistent testing
 */

import { jest } from '@jest/globals';

// React Flow Mock Utilities
export const createMockReactFlow = (overrides = {}) => ({
  getNodes: jest.fn(() => []),
  getEdges: jest.fn(() => []),
  setNodes: jest.fn(),
  setEdges: jest.fn(),
  addEdge: jest.fn(),
  getViewport: jest.fn(() => ({ x: 0, y: 0, zoom: 1 })),
  ...overrides,
});

// API Mock Utilities  
export const createMockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  json: jest.fn<unknown[], unknown>().mockResolvedValue(data as unknown),
  text: jest.fn<unknown[], unknown>().mockResolvedValue(JSON.stringify(data as unknown)),
  headers: new Headers(),
});

// Local Storage Mock
export const createMockLocalStorage = () => {
  const storage = new Map<string, string>();
  
  return {
    getItem: jest.fn((key: string) => storage.get(key) || null),
    setItem: jest.fn((key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: jest.fn((key: string) => {
      storage.delete(key);
    }),
    clear: jest.fn(() => {
      storage.clear();
    }),
    key: jest.fn((index: number) => {
      const keys = Array.from(storage.keys());
      return keys[index] || null;
    }),
    get length() {
      return storage.size;
    }
  };
};

// WebSocket Mock
export const createMockWebSocket = () => {
  const eventListeners = new Map<string, Function[]>();
  
  return {
    send: jest.fn<unknown[], unknown>(),
    close: jest.fn<unknown[], unknown>(),
    addEventListener: jest.fn((event: string, listener: Function) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, []);
      }
      eventListeners.get(event)!.push(listener);
    }),
    removeEventListener: jest.fn((event: string, listener: Function) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }),
    dispatchEvent: jest.fn((event: any) => {
      const listeners = eventListeners.get(event.type) || [];
      listeners.forEach(listener => listener(event));
    }),
    simulateMessage: (data: any) => {
      const listeners = eventListeners.get('message') || [];
      listeners.forEach(listener => listener(data));
    },
    readyState: WebSocket.OPEN
  };
};

// Performance Mock
export const createMockPerformance = () => ({
  now: jest.fn(() => Date.now()),
  mark: jest.fn<unknown[], unknown>(),
  measure: jest.fn<unknown[], unknown>(),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn<unknown[], unknown>(),
  clearMeasures: jest.fn<unknown[], unknown>(),
});

// Intersection Observer Mock
export const createMockIntersectionObserver = () => {
  const mockObserve = jest.fn<unknown[], unknown>();
  const mockUnobserve = jest.fn<unknown[], unknown>();
  const mockDisconnect = jest.fn<unknown[], unknown>();
  
  return jest.fn<unknown[], unknown>().mockImplementation(() => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  }));
};

// Resize Observer Mock
export const createMockResizeObserver = () => {
  const mockObserve = jest.fn<unknown[], unknown>();
  const mockUnobserve = jest.fn<unknown[], unknown>();
  const mockDisconnect = jest.fn<unknown[], unknown>();
  
  return jest.fn<unknown[], unknown>().mockImplementation(() => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  }));
};

// File Reader Mock
export const createMockFileReader = () => {
  const mockFileReader = {
    readAsText: jest.fn<unknown[], unknown>(),
    readAsDataURL: jest.fn<unknown[], unknown>(),
    readAsArrayBuffer: jest.fn<unknown[], unknown>(),
    abort: jest.fn<unknown[], unknown>(),
    addEventListener: jest.fn<unknown[], unknown>(),
    removeEventListener: jest.fn<unknown[], unknown>(),
    result: null,
    error: null,
    readyState: FileReader.EMPTY,
  };

  // Utility to simulate successful file read
  (mockFileReader as any).simulateSuccess = (result: any) => {
    mockFileReader.result = result;
    mockFileReader.readyState = FileReader.DONE;
    const listeners = (mockFileReader.addEventListener as jest.Mock).mock.calls
      .filter((call: any) => call[0] === 'load')
      .map((call: any) => call[1]);
    listeners.forEach((listener: any) => listener({ target: mockFileReader }));
  };

  // Utility to simulate file read error
  (mockFileReader as any).simulateError = (error: any) => {
    mockFileReader.error = error;
    mockFileReader.readyState = FileReader.DONE;
    const listeners = (mockFileReader.addEventListener as jest.Mock).mock.calls
      .filter((call: any) => call[0] === 'error')
      .map((call: any) => call[1]);
    listeners.forEach((listener: any) => listener({ target: mockFileReader }));
  };

  return mockFileReader;
};

// Canvas Context Mock
export const createMockCanvasContext = () => ({
  fillRect: jest.fn<unknown[], unknown>(),
  strokeRect: jest.fn<unknown[], unknown>(),
  fillText: jest.fn<unknown[], unknown>(),
  strokeText: jest.fn<unknown[], unknown>(),
  measureText: jest.fn(() => ({ width: 100 })),
  arc: jest.fn<unknown[], unknown>(),
  beginPath: jest.fn<unknown[], unknown>(),
  closePath: jest.fn<unknown[], unknown>(),
  stroke: jest.fn<unknown[], unknown>(),
  fill: jest.fn<unknown[], unknown>(),
  moveTo: jest.fn<unknown[], unknown>(),
  lineTo: jest.fn<unknown[], unknown>(),
  save: jest.fn<unknown[], unknown>(),
  restore: jest.fn<unknown[], unknown>(),
  translate: jest.fn<unknown[], unknown>(),
  rotate: jest.fn<unknown[], unknown>(),
  scale: jest.fn<unknown[], unknown>(),
  setTransform: jest.fn<unknown[], unknown>(),
  clearRect: jest.fn<unknown[], unknown>(),
});

// Date Mock Utilities
export const mockDate = (isoDate: string) => {
  const mockDate = new Date(isoDate);
  const originalDate = global.Date;
  
  const MockDate = class extends Date {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(mockDate.getTime());
      } else {
        super(...args);
      }
    }
    
    static now() {
      return mockDate.getTime();
    }
  } as any;
  
  // Copy static methods from original Date
  Object.setPrototypeOf(MockDate, Date);
  Object.defineProperty(MockDate, 'prototype', {
    value: Date.prototype,
    writable: false
  });
  
  global.Date = MockDate;
  
  return () => {
    global.Date = originalDate;
  };
};

// Timer Mock Utilities
export const mockTimers = () => {
  jest.useFakeTimers();
  
  return {
    advanceByTime: (ms: number) => jest.advanceTimersByTime(ms),
    runAllTimers: () => jest.runAllTimers(),
    runOnlyPendingTimers: () => jest.runOnlyPendingTimers(),
    cleanup: () => jest.useRealTimers(),
  };
};

// Random Mock for Deterministic Testing
export const mockRandom = (seed: number) => {
  const originalRandom = Math.random;
  Math.random = jest.fn(() => seed);
  
  return () => {
    Math.random = originalRandom;
  };
};

// Console Mock for Testing Console Output
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  console.log = jest.fn<unknown[], unknown>();
  console.error = jest.fn<unknown[], unknown>();
  console.warn = jest.fn<unknown[], unknown>();
  console.info = jest.fn<unknown[], unknown>();
  console.debug = jest.fn<unknown[], unknown>();
  
  return {
    restore: () => {
      Object.assign(console, originalConsole);
    },
    getLogs: () => (console.log as jest.Mock).mock.calls.map(call => call.join(' ')),
    getErrors: () => (console.error as jest.Mock).mock.calls.map(call => call.join(' ')),
    getWarnings: () => (console.warn as jest.Mock).mock.calls.map(call => call.join(' ')),
  };
};

// Fetch Mock
export const mockFetch = (response?: any) => {
  const mockResponse = response || { success: true };
  const fetchMock = jest.fn<unknown[], unknown>().mockResolvedValue(
    createMockApiResponse(mockResponse as unknown)
  );
  
  global.fetch = fetchMock;
  
  return {
    mock: fetchMock,
    restore: () => {
      delete (global as any).fetch;
    }
  };
};

// Event Mock Utilities
export const createMockEvent = (type: string, properties = {}) => ({
  type,
  bubbles: false,
  cancelable: false,
  composed: false,
  currentTarget: null,
  target: null,
  timeStamp: Date.now(),
  preventDefault: jest.fn<unknown[], unknown>(),
  stopPropagation: jest.fn<unknown[], unknown>(),
  stopImmediatePropagation: jest.fn<unknown[], unknown>(),
  ...properties,
});

// Mouse Event Mock
export const createMockMouseEvent = (type: string, properties = {}) => ({
  ...createMockEvent(type),
  button: 0,
  buttons: 1,
  clientX: 0,
  clientY: 0,
  pageX: 0,
  pageY: 0,
  screenX: 0,
  screenY: 0,
  offsetX: 0,
  offsetY: 0,
  movementX: 0,
  movementY: 0,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  ...properties,
});

// Keyboard Event Mock
export const createMockKeyboardEvent = (type: string, properties = {}) => ({
  ...createMockEvent(type),
  key: '',
  code: '',
  keyCode: 0,
  which: 0,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  repeat: false,
  ...properties,
});

// Media Query Mock
export const mockMediaQuery = (query: string, matches = false) => {
  const mockMatch = {
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn<unknown[], unknown>(),
    removeListener: jest.fn<unknown[], unknown>(),
    addEventListener: jest.fn<unknown[], unknown>(),
    removeEventListener: jest.fn<unknown[], unknown>(),
    dispatchEvent: jest.fn<unknown[], unknown>(),
  };

  window.matchMedia = jest.fn<unknown[], unknown>().mockImplementation(() => mockMatch);
  
  return mockMatch;
};