require('@testing-library/jest-dom');

const { TextDecoder, TextEncoder } = require('util');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-secret-key-for-jest-testing-only-not-production';
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET || 'test-session-secret-for-jest-testing-only';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'sqlite://test.db';

jest.setTimeout(15000);

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = obj => JSON.parse(JSON.stringify(obj));
}

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
    }

    observe(target) {
      this.callback([{ target, contentRect: { width: 800, height: 600 } }], this);
    }

    unobserve() {
      return undefined;
    }

    disconnect() {
      return undefined;
    }
  };
}

if (typeof global.DOMMatrixReadOnly === 'undefined') {
  global.DOMMatrixReadOnly = class DOMMatrixReadOnly {
    constructor(transform) {
      const scaleMatch = transform?.match(/scale\(([0-9.]+)\)/);
      this.m22 = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    }
  };
}

if (global.HTMLElement) {
  Object.defineProperties(global.HTMLElement.prototype, {
    offsetHeight: {
      configurable: true,
      get() {
        return parseFloat(this.style.height) || 600;
      }
    },
    offsetWidth: {
      configurable: true,
      get() {
        return parseFloat(this.style.width) || 800;
      }
    },
    scrollWidth: {
      configurable: true,
      get() {
        return parseFloat(this.style.width) || 800;
      }
    },
    scrollHeight: {
      configurable: true,
      get() {
        return parseFloat(this.style.height) || 600;
      }
    }
  });
}

if (global.SVGElement && !global.SVGElement.prototype.getBBox) {
  global.SVGElement.prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 100,
    height: 50
  });
}

Object.defineProperty(global, 'MouseEvent', {
  configurable: true,
  value: class MouseEvent extends Event {
    constructor(type, eventInit = {}) {
      super(type, eventInit);
      this.clientX = eventInit.clientX || 0;
      this.clientY = eventInit.clientY || 0;
      this.pageX = eventInit.pageX || eventInit.clientX || 0;
      this.pageY = eventInit.pageY || eventInit.clientY || 0;
      this.button = eventInit.button || 0;
      this.buttons = eventInit.buttons || 1;
    }
  }
});

if (typeof global.getComputedStyle === 'function') {
  const originalGetComputedStyle = global.getComputedStyle;
  global.getComputedStyle = element => {
    const computed = originalGetComputedStyle(element);
    if (!element.style) {
      return computed;
    }

    return new Proxy(computed, {
      get(target, prop) {
        if (element.style[prop]) {
          return element.style[prop];
        }
        return target[prop];
      }
    });
  };
}

jest.mock(
  '@testing-library/user-event',
  () => {
    const mockMouseEvent = global.MouseEvent;
    const mockEvent = global.Event;

    return {
      __esModule: true,
      default: {
        click: async el =>
          el.dispatchEvent(new mockMouseEvent('click', { bubbles: true })),
        type: async (el, text) => {
          el.value = (el.value || '') + text;
          el.dispatchEvent(new mockEvent('input', { bubbles: true }));
        },
        clear: async el => {
          el.value = '';
          el.dispatchEvent(new mockEvent('input', { bubbles: true }));
        }
      }
    };
  },
  { virtual: true }
);

if (global.URL && !global.URL.createObjectURL) {
  global.URL.createObjectURL = () => 'blob:mock-url';
  global.URL.revokeObjectURL = () => undefined;
}

if (global.window) {
  Object.defineProperty(global.window, 'matchMedia', {
    configurable: true,
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
}
