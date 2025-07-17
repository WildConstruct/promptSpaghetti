require('@testing-library/jest-dom');

// Enhanced ResizeObserver mock for ReactFlow
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe(target) {
    // Simulate initial observation
    this.callback([{ target, contentRect: { width: 800, height: 600 } }], this);
  }
  unobserve() {}
  disconnect() {}
};

// DOMMatrix mock for ReactFlow transforms
global.DOMMatrixReadOnly = class DOMMatrixReadOnly {
  constructor(transform) {
    const scaleMatch = transform?.match(/scale\(([0-9.]+)\)/);
    this.m22 = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
  }
};

// Enhanced HTMLElement properties for ReactFlow
Object.defineProperties(global.HTMLElement.prototype, {
  offsetHeight: { 
    get() { return parseFloat(this.style.height) || 600; } 
  },
  offsetWidth: { 
    get() { return parseFloat(this.style.width) || 800; } 
  },
  scrollWidth: { 
    get() { return parseFloat(this.style.width) || 800; } 
  },
  scrollHeight: { 
    get() { return parseFloat(this.style.height) || 600; } 
  },
});

// SVG getBBox mock for ReactFlow
global.SVGElement.prototype.getBBox = () => ({ 
  x: 0, y: 0, width: 100, height: 50 
});

// Enhanced MouseEvent and DragEvent for better event simulation
Object.defineProperty(global, 'MouseEvent', {
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

// Mock getComputedStyle for better CSS testing
const originalGetComputedStyle = global.getComputedStyle;
global.getComputedStyle = (element) => {
  const computed = originalGetComputedStyle(element);
  // If element has inline styles, prefer those for testing
  if (element.style) {
    return new Proxy(computed, {
      get(target, prop) {
        if (element.style[prop]) {
          return element.style[prop];
        }
        return target[prop];
      }
    });
  }
  return computed;
};

// Lightweight stub for @testing-library/user-event to satisfy tests without external package
jest.mock('@testing-library/user-event', () => {
  const mockMouseEvent = global.MouseEvent;
  const mockEvent = global.Event;
  
  return {
    __esModule: true,
    default: {
      click: async (el) => el.dispatchEvent(new mockMouseEvent('click', { bubbles: true })),
      type: async (el, text) => {
        el.value = (el.value || '') + text;
        el.dispatchEvent(new mockEvent('input', { bubbles: true }));
      },
      clear: async (el) => {
        el.value = '';
        el.dispatchEvent(new mockEvent('input', { bubbles: true }));
      },
    },
  };
}, { virtual: true });

// Mock URL.createObjectURL / revokeObjectURL to silence JSDOM navigation warnings
if (!global.URL.createObjectURL) {
  global.URL.createObjectURL = () => 'blob:mock-url';
  global.URL.revokeObjectURL = () => {};
}
