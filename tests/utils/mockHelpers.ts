/**
 * Mock Helpers for Testing
 * Centralized mock utilities for consistent testing
 */

import { jest } from '@jest/globals';

// React Flow Mock Utilities
// (React Flow mocks would go here if needed)

// API Mock Utilities  
export 
// Local Storage Mock
export   return {
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
    dispatchEvent: jest.fn((event: unknown) => {
      const listeners = eventListeners.get(event.type) || [];
      listeners.forEach(listener => listener(event));
    }),
    simulateMessage: (data: unknown) => {
      const listeners = eventListeners.get('message') || [];
      listeners.forEach(listener => listener(data));
    },
    readyState: WebSocket.OPEN
  };
};

// Performance Mock
// (Performance mocks would go here if needed)

// Intersection Observer Mock
export   const mockUnobserve = jest.fn<unknown[], unknown>();
  const mockDisconnect = jest.fn<unknown[], unknown>();
  
  return jest.fn<unknown[], unknown>().mockImplementation(() => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect
  }));
};

// Resize Observer Mock
export   const mockUnobserve = jest.fn<unknown[], unknown>();
  const mockDisconnect = jest.fn<unknown[], unknown>();
  
  return jest.fn<unknown[], unknown>().mockImplementation(() => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect
  }));
};

// File Reader Mock
export 
  // Utility to simulate successful file read
  (mockFileReader as Record<string, unknown>).simulateSuccess = (result: unknown) => {
    mockFileReader.result = result;
    mockFileReader.readyState = FileReader.DONE;
    const listeners = (mockFileReader.addEventListener as jest.Mock).mock.calls
      .filter((call: unknown[]) => call[0] === 'load')
      .map((call: unknown[]) => call[1]);
    listeners.forEach((listener) => listener({ target: mockFileReader }));
  };

  // Utility to simulate file read error
  (mockFileReader as Record<string, unknown>).simulateError = (error: unknown) => {
    mockFileReader.error = error;
    mockFileReader.readyState = FileReader.DONE;
    const listeners = (mockFileReader.addEventListener as jest.Mock).mock.calls
      .filter((call: unknown[]) => call[0] === 'error')
      .map((call: unknown[]) => call[1]);
    listeners.forEach((listener) => listener({ target: mockFileReader }));
  };

  return mockFileReader;
};

// Canvas Context Mock
export };

// Date Mock Utilities
export const mockDate = (isoDate: string) => {
  const mockDate = new Date(isoDate);
  const originalDate = global.Date;
  
  const MockDate = class extends Date {
    constructor(...args: unknown[]) {
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
export   return {
    advanceByTime: (ms: number) => jest.advanceTimersByTime(ms),
    runAllTimers: () => jest.runAllTimers(),
    runOnlyPendingTimers: () => jest.runOnlyPendingTimers(),
    cleanup: () => jest.useRealTimers()
  };
};

// Random Mock for Deterministic Testing
export   Math.random = jest.fn(() => seed);
  
  return () => {
    Math.random = originalRandom;
  };
};

// Console Mock for Testing Console Output
export   console.log = jest.fn<unknown[], unknown>();
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
    getWarnings: () => (console.warn as jest.Mock).mock.calls.map(call => call.join(' '))
  };
};

// Fetch Mock
export   
  global.fetch = fetchMock;
  
  return {
    mock: fetchMock,
    restore: () => {
      delete (global as any).fetch;
    }
  };
};

// Event Mock Utilities
export 
// Mouse Event Mock
export 
// Keyboard Event Mock
export 
// Media Query Mock
export   
  window.matchMedia = jest.fn<unknown[], unknown>().mockImplementation(() => mockMatch);
  window.matchMedia = jest.fn<unknown[], unknown>().mockImplementation(() => mockMatch);
  
  return mockMatch;
};