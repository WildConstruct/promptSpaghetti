import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock ResizeObserver which isn't available in JSDOM
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia which isn't available in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock Intersection Observer
global.IntersectionObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    /* do nothing */
  }
  unobserve() {
    /* do nothing */
  }
  disconnect() {
    /* do nothing */
  }
};
