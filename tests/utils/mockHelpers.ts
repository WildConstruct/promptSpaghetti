/**
 * Mock Helpers for Testing
 * Centralized mock utilities for consistent testing
 */

import { jest } from '@jest/globals';

// React Flow Mock Utilities
export 
export 
// API Mock Utilities  
export const createMockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  json: jest.fn<unknown[], unknown>().mockResolvedValue(data as unknown as unknown),
  text: jest.fn<unknown[], unknown>().mockResolvedValue(JSON.stringify(data as unknown as unknown)),
  headers: new Headers(),
});

// Local Storage Mock
export   
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
export   
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
    // Utility to trigger events in tests
    triggerEvent: (event: string, data?: any) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        listeners.forEach(listener => listener(data));
      }
    },
    readyState: WebSocket.OPEN
  };
};

// Performance Mock
export 
// Intersection Observer Mock
export   const mockUnobserve = jest.fn<unknown[], unknown>();
  const mockDisconnect = jest.fn<unknown[], unknown>();
  
  return jest.fn<unknown[], unknown>().mockImplementation(() => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  }));
};

// Resize Observer Mock
export   const mockUnobserve = jest.fn<unknown[], unknown>();
  const mockDisconnect = jest.fn<unknown[], unknown>();
  
  return jest.fn<unknown[], unknown>().mockImplementation(() => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  }));
};

// File Reader Mock
export 
  // Utility to simulate successful file read
  mockFileReader.simulateSuccess = (result: any) => {
    mockFileReader.result = result;
    mockFileReader.readyState = FileReader.DONE;
    const listeners = mockFileReader.addEventListener.mock.calls
      .filter(call => call[0] === 'load')
      .map(call => call[1]);
    listeners.forEach(listener => listener({ target: mockFileReader }));
  };

  // Utility to simulate file read error
  mockFileReader.simulateError = (error: any) => {
    mockFileReader.error = error;
    mockFileReader.readyState = FileReader.DONE;
    const listeners = mockFileReader.addEventListener.mock.calls
      .filter(call => call[0] === 'error')
      .map(call => call[1]);
    listeners.forEach(listener => listener({ target: mockFileReader }));
  };

  return mockFileReader;
};

// Canvas Context Mock
export 
// Date Mock Utilities
export const mockDate = (isoDate: string) => {
  const mockDate = new Date(isoDate);
  const originalDate = global.Date;
  
  const MockDate = class extends Date {
    constructor(...args: any[]) {
      if (args.length === 0) {
        return mockDate;
      }
      return new originalDate(...args);
    }
    
    static now() {
      return mockDate.getTime();
    }
  } as any;

  global.Date = MockDate;
  
  return () => {
    global.Date = originalDate;
  };
};

// Timer Mock Utilities
export   
  return {
    advanceByTime: (ms: number) => jest.advanceTimersByTime(ms),
    runAllTimers: () => jest.runAllTimers(),
    runOnlyPendingTimers: () => jest.runOnlyPendingTimers(),
    cleanup: () => jest.useRealTimers(),
  };
};

// Random Mock for Deterministic Testing
export   Math.random = jest.fn(() => seed);
  
  return () => {
    Math.random = originalRandom;
  };
};

// Console Mock for Testing Console Output
export   
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
export   const fetchMock = jest.fn<unknown[], unknown>().mockResolvedValue(
    createMockApiResponse(mockResponse as unknown as unknown)
  );
  
  global.fetch = fetchMock;
  
  return {
    mock: fetchMock,
    restore: () => {
      delete (global as any).fetch;
    },
    mockResolvedValueOnce: (data: any, status = 200) => {
      fetchMock.mockResolvedValueOnce(createMockApiResponse(data, status));
    },
    mockRejectedValueOnce: (error: Error) => {
      fetchMock.mockRejectedValueOnce(error);
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
export 
// Keyboard Event Mock
export 
// Media Query Mock
export 
  window.matchMedia = jest.fn<unknown[], unknown>().mockImplementation(() => mockMatch);
  
  return mockMatch;
};

// Test Utilities Export
export };